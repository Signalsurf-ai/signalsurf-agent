import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"
import { ROOT, versionIssues } from "../scripts/check.mjs"
import { activate, assertRemote, build, githubRemote, inspect, prepare, releasePresentation, REPO, revise, stage, verify } from "../scripts/release.mjs"
import { crc32, zip } from "../scripts/zip.mjs"

function repository(t) {
  const directory = mkdtempSync(path.join(tmpdir(), "signalsurf-release-test-")), root = path.join(directory, "repo")
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  cpSync(ROOT, root, { recursive: true, filter: file => ![".git", "node_modules"].includes(path.basename(file)) })
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { stdio: ["ignore", "pipe", "pipe"] }).toString().trim()
  git("init", "-q"); git("add", "."); git("-c", "user.name=Package Fixture", "-c", "user.email=fixture@example.com", "commit", "-qm", "Synthetic candidate")
  return { directory, root, candidate: git("rev-parse", "HEAD"), git }
}

function releaseCandidate(t) {
  const f = repository(t), generated = build(f.candidate, f.root).assets.get("marketplace.json"), catalog = path.join(f.root, ".claude-plugin/https-marketplace.json")
  if (!readFileSync(catalog).equals(generated)) {
    writeFileSync(catalog, generated)
    f.git("add", ".claude-plugin/https-marketplace.json"); f.git("-c", "user.name=Package Fixture", "-c", "user.email=fixture@example.com", "commit", "-qm", "Final release catalog")
    f.candidate = f.git("rev-parse", "HEAD")
  }
  return f
}

function fake(built) {
  const state = { active_version: "0.0.0", tag: null, release: null }, bytes = new Map(), writes = [], notes = "## Changes\n\nImprove the portable Agent guidance.\n"
  const remote = {
    async read() { return structuredClone(state) },
    async download(_plan, asset) { return bytes.get(asset.name) },
    async create(plan, presentation) { writes.push("create"); state.release = { id: 1, tag_name: plan.tag, target_commitish: plan.candidate, draft: true, assets: [], ...presentation } },
    async update(_plan, release, changes) { assert.equal(release.id, state.release.id); writes.push("update"); Object.assign(state.release, changes) },
    async upload(_plan, name, value) { writes.push(`upload:${name}`); bytes.set(name, value); state.release.assets.push({ id: state.release.assets.length + 1, name, size: value.length }) },
    async publish(plan) { writes.push("publish"); state.tag = plan.candidate; state.release.draft = false },
  }
  return { state, bytes, writes, remote, notes, authorization: `${REPO}@${built.plan.tag}` }
}

function revisedCandidate(t) {
  const f = releaseCandidate(t), previousCandidate = f.candidate, previousBuilt = build(previousCandidate, f.root)
  const file = path.join(f.root, "plugins/signalsurf/README.md")
  writeFileSync(file, `${readFileSync(file, "utf8")}\nCompatible unpublished candidate correction.\n`)
  f.git("add", "."); f.git("-c", "user.name=Package Fixture", "-c", "user.email=fixture@example.com", "commit", "-qm", "Correct unpublished candidate")
  let candidate = f.git("rev-parse", "HEAD")
  writeFileSync(path.join(f.root, ".claude-plugin/https-marketplace.json"), build(candidate, f.root).assets.get("marketplace.json"))
  f.git("add", "."); f.git("-c", "user.name=Package Fixture", "-c", "user.email=fixture@example.com", "commit", "-qm", "Bind corrected catalog")
  candidate = f.git("rev-parse", "HEAD")
  return { ...f, candidate, previousCandidate, previousBuilt, built: build(candidate, f.root) }
}

function revisionRemote(f) {
  const r = fake(f.built)
  r.state.release = { id: 1, tag_name: f.built.plan.tag, target_commitish: f.previousCandidate, draft: true, assets: [], ...releasePresentation(f.previousBuilt.plan, r.notes) }
  return r
}

function githubFixture(built, { published = false, duplicate = false } = {}) {
  const r = fake(built), calls = [], prefix = `repos/${REPO}`
  r.state.tag = published ? built.plan.candidate : null
  r.state.release = { id: 1, tag_name: built.plan.tag, target_commitish: built.plan.candidate, draft: !published, assets: [] }
  const notFound = () => { throw Object.assign(new Error("Not Found"), { stderr: Buffer.from("gh: Not Found (HTTP 404)") }) }
  const execute = (command, args, options) => {
    assert.equal(command, "gh"); calls.push([...args])
    if (args[0] === "release") {
      assert.deepEqual(args.slice(0, 3), ["release", "upload", built.plan.tag])
      assert.deepEqual(args.slice(4), ["--repo", REPO])
      const name = path.basename(args[3]), value = readFileSync(args[3])
      r.writes.push(`upload:${name}`); r.bytes.set(name, value)
      r.state.release.assets.push({ id: r.state.release.assets.length + 1, name, size: value.length })
      return Buffer.alloc(0)
    }
    assert.equal(args[0], "api")
    const method = args[2], endpoint = args[3]
    if (method === "PATCH" && endpoint === `${prefix}/releases/1`) {
      r.writes.push("update"); Object.assign(r.state.release, JSON.parse(options.input))
      return Buffer.from(JSON.stringify(r.state.release))
    }
    if (method !== "GET") { r.writes.push(method); throw new Error("unexpected GitHub mutation") }
    let value
    if (endpoint === `${prefix}/contents/plugins/signalsurf/plugin.json?ref=main`) value = { content: Buffer.from(JSON.stringify({ version: r.state.active_version })).toString("base64") }
    else if (endpoint === `${prefix}/git/ref/tags/${built.plan.tag}`) { if (!r.state.tag) return notFound(); value = { object: { type: "commit", sha: r.state.tag } } }
    else if (endpoint === `${prefix}/releases/tags/${built.plan.tag}`) { if (!published) return notFound(); value = r.state.release }
    else if (endpoint === `${prefix}/releases?per_page=100`) {
      assert.deepEqual(args.slice(4), ["--paginate", "--slurp"])
      value = [Array.from({ length: 100 }, (_, index) => ({ tag_name: `v0.0.${index}` })), [r.state.release]]
      if (duplicate) value.push([{ ...r.state.release, id: 2 }])
    } else if (endpoint.startsWith(`${prefix}/releases/assets/`)) {
      const asset = r.state.release.assets.find(asset => String(asset.id) === endpoint.split("/").at(-1))
      assert.ok(asset); return r.bytes.get(asset.name)
    } else throw new Error(`unexpected endpoint: ${endpoint}`)
    return Buffer.from(JSON.stringify(value))
  }
  return { ...r, calls, remote: githubRemote(undefined, { execute }) }
}

test("deterministic ZIP uses stable CRC, dates, ordering and notices", () => {
  assert.equal(crc32(Buffer.from("123456789")), 0xcbf43926)
  const entries = [{ name: "b", bytes: Buffer.from("second") }, { name: "LICENSE", bytes: Buffer.from("notice") }]
  assert.deepEqual(zip(entries), zip(entries.toReversed()))
  assert.throws(() => zip([{ name: "../outside", bytes: Buffer.alloc(0) }]), /unsafe ZIP/)
})

test("preparation binds one commit and reproduces exact archive and license bytes", t => {
  const f = repository(t), out = path.join(f.directory, "prepared")
  const plan = prepare({ candidate: f.candidate, out, root: f.root })
  const again = prepare({ candidate: f.candidate, out, root: f.root })
  assert.deepEqual(plan, again)
  const built = verify({ directory: out, candidate: f.candidate, root: f.root })
  assert.equal(built.plan.plugin_tree, f.git("rev-parse", `${f.candidate}:plugins/signalsurf`))
  assert.equal(built.assets.get(`signalsurf-${plan.version}.zip`).includes(readFileSync(path.join(f.root, "LICENSE"))), true)
  assert.throws(() => build("HEAD", f.root), /explicit full committed SHA/)
  assert.throws(() => verify({ directory: out, candidate: "a".repeat(40), root: f.root }), /does not match/)
  writeFileSync(path.join(out, "SHA256SUMS"), "tampered")
  assert.throws(() => verify({ directory: out, root: f.root }), /artifact mismatch/)
})

test("preparing from a source missing the installed license fails", t => {
  const f = repository(t)
  rmSync(path.join(f.root, "plugins/signalsurf/LICENSE")); f.git("add", "."); f.git("-c", "user.name=Package Fixture", "-c", "user.email=fixture@example.com", "commit", "-qm", "Missing notice")
  assert.throws(() => build(f.git("rev-parse", "HEAD"), f.root), /missing installed license/)
})

test("the version gate compares an actual changed plugin against its base commit", t => {
  const f = repository(t)
  assert.deepEqual(versionIssues(f.candidate, f.root), [])
  const file = path.join(f.root, "plugins/signalsurf/README.md")
  writeFileSync(file, `${readFileSync(file, "utf8")}\nCompatible fixture documentation.\n`)
  assert.match(versionIssues(f.candidate, f.root).join(), /requires a new stable version/)
  const manifest = path.join(f.root, "plugins/signalsurf/plugin.json"), data = JSON.parse(readFileSync(manifest))
  data.version = "1.0.0"; writeFileSync(manifest, JSON.stringify(data))
  assert.deepEqual(versionIssues(f.candidate, f.root), [])
})

test("draft staging and activation verify exact remote bytes and are idempotent", async t => {
  const f = releaseCandidate(t), built = build(f.candidate, f.root), r = fake(built)
  assert.equal(built.committedCatalog.equals(built.assets.get("marketplace.json")), true)
  await stage({ built, ...r })
  assert.equal(r.state.release.draft, true)
  await activate({ built, ...r })
  assert.equal(r.state.release.draft, false)
  await stage({ built, ...r }); await activate({ built, ...r })
  assert.equal(r.writes.filter(value => value === "create").length, 1)
  assert.equal(r.writes.filter(value => value === "publish").length, 1)
  assert.equal(r.writes.length, built.assets.size + 2)
})

test("reviewed release notes produce the version title without changing distributable assets", t => {
  const f = releaseCandidate(t), built = build(f.candidate, f.root), notes = "Improve reliable document publication.\n"
  const presentation = releasePresentation(built.plan, notes)
  assert.equal(presentation.name, built.plan.tag)
  assert.equal(presentation.body.startsWith(`${notes.trim()}\n\n<details>\n<summary>Artifacts</summary>\n`), true)
  assert.equal(presentation.body.endsWith("\n</details>\n"), true)
  assert.equal(presentation.body.includes(built.plan.candidate), true)
  assert.equal(presentation.body.includes(built.plan.plugin_tree), true)
  assert.equal(presentation.body.includes(built.plan.assets[`signalsurf-${built.plan.version}.zip`].sha256), true)
  assert.deepEqual([...built.assets.keys()], [`signalsurf-${built.plan.version}.zip`, "marketplace.json", "SHA256SUMS", "release.json"])
  assert.deepEqual(build(f.candidate, f.root).assets, built.assets)
})

test("stage and activate require nonempty reviewed notes before any mutation", async t => {
  const f = releaseCandidate(t), built = build(f.candidate, f.root), r = fake(built)
  for (const notes of [undefined, "", " \n\t"]) {
    await assert.rejects(stage({ built, ...r, notes }), /reviewed user-facing release notes/)
    await assert.rejects(activate({ built, ...r, notes }), /reviewed user-facing release notes/)
  }
  assert.deepEqual(r.writes, [])
})

test("activation rejects changed draft titles and notes while stage repairs only presentation", async t => {
  const f = releaseCandidate(t), built = build(f.candidate, f.root), r = fake(built)
  await stage({ built, ...r })
  const writes = r.writes.length, bytes = new Map(r.bytes)
  r.state.release.name = `SignalSurf Agent ${built.plan.tag}`
  await assert.rejects(activate({ built, ...r }), /title or notes differ/)
  r.state.release.name = built.plan.tag
  r.state.release.body = "A different release summary."
  await assert.rejects(activate({ built, ...r }), /title or notes differ/)
  assert.equal(r.writes.length, writes)
  await stage({ built, ...r })
  assert.deepEqual(r.writes.slice(writes), ["update"])
  assert.deepEqual(r.bytes, bytes)
  await assert.rejects(activate({ built, ...r, notes: "Changed reviewed notes." }), /title or notes differ/)
  await activate({ built, ...r })
})

test("published recovery never rewrites release presentation", async t => {
  const f = releaseCandidate(t), built = build(f.candidate, f.root), r = fake(built)
  await stage({ built, ...r }); await activate({ built, ...r })
  const writes = r.writes.length
  r.state.release.name = "Historical title"
  r.state.release.body = "Historical release notes"
  await stage({ built, ...r, notes: "New local notes." })
  await activate({ built, ...r, notes: "New local notes." })
  assert.equal(r.writes.length, writes)
  assert.equal(r.state.release.name, "Historical title")
  assert.equal(r.state.release.body, "Historical release notes")
})

test("an uncertain draft presentation update is read back before a separate stage resumes", async t => {
  const f = releaseCandidate(t), built = build(f.candidate, f.root), r = fake(built)
  await stage({ built, ...r })
  r.state.release.name = "Previous draft title"
  const writes = r.writes.length, update = r.remote.update
  r.remote.update = async (...args) => { await update(...args); throw new Error("response lost") }
  await assert.rejects(stage({ built, ...r }), /response lost/)
  await stage({ built, ...r })
  assert.deepEqual(r.writes.slice(writes), ["update"])
})

test("draft presentation updates must read back before uploads resume", async t => {
  const f = releaseCandidate(t), built = build(f.candidate, f.root), r = fake(built)
  await r.remote.create(built.plan, { name: "Previous draft title", body: "Previous notes" })
  r.writes.length = 0
  r.remote.update = async () => { r.writes.push("update") }
  await assert.rejects(stage({ built, ...r }), /title or notes differ/)
  assert.deepEqual(r.writes, ["update"])
})

test("an empty unpublished draft can move to a corrected candidate without consuming a version", async t => {
  const f = revisedCandidate(t), r = revisionRemote(f)
  const prior = prepare({ candidate: f.previousCandidate, out: path.join(f.directory, "prior"), root: f.root })
  const current = prepare({ candidate: f.candidate, out: path.join(f.directory, "current"), root: f.root })
  assert.equal(prior.version, current.version)
  assert.notEqual(prior.plugin_tree, current.plugin_tree)
  await revise({ built: f.built, ...r, previousCandidate: f.previousCandidate, root: f.root })
  assert.equal(r.state.release.target_commitish, f.candidate)
  assert.equal(r.state.release.tag_name, prior.tag)
  assert.deepEqual(r.state.release.assets, [])
  assert.deepEqual(r.writes, ["update"])
  await revise({ built: f.built, ...r, previousCandidate: f.previousCandidate, root: f.root })
  assert.deepEqual(r.writes, ["update"])
  await stage({ built: f.built, ...r })
  await activate({ built: f.built, ...r })
})

test("draft revision rejects distributed, staged, unexpected and active-version states", async t => {
  const f = revisedCandidate(t)
  const cases = [
    ["published", r => { r.state.release.draft = false }, /untagged empty draft/],
    ["tagged", r => { r.state.tag = f.previousCandidate }, /untagged empty draft/],
    ["nonempty", r => { r.state.release.assets.push({ name: "release.json" }) }, /untagged empty draft/],
    ["wrong version", r => { r.state.release.tag_name = "v0.0.1" }, /untagged empty draft/],
    ["unexpected candidate", r => { r.state.release.target_commitish = "a".repeat(40) }, /expected previous candidate/],
    ["same active version", r => { r.state.active_version = f.built.plan.version }, /newer than the publicly active/],
    ["newer active version", r => { r.state.active_version = "99.0.0" }, /newer than the publicly active/],
    ["unknown active version", r => { r.state.active_version = undefined }, /newer than the publicly active/],
  ]
  for (const [name, change, error] of cases) await t.test(name, async () => {
    const r = revisionRemote(f); change(r)
    await assert.rejects(revise({ built: f.built, ...r, previousCandidate: f.previousCandidate, root: f.root }), error)
    assert.deepEqual(r.writes, [])
  })
})

test("draft revision requires the prior committed candidate to have the same version", async t => {
  const f = revisedCandidate(t), r = revisionRemote(f), previousCandidate = f.previousCandidate
  const manifest = path.join(f.root, "plugins/signalsurf/plugin.json"), value = JSON.parse(readFileSync(manifest))
  value.version = "1.0.0"; writeFileSync(manifest, JSON.stringify(value))
  f.git("add", "."); f.git("-c", "user.name=Package Fixture", "-c", "user.email=fixture@example.com", "commit", "-qm", "Other draft version")
  const differentVersion = f.git("rev-parse", "HEAD")
  await assert.rejects(revise({ built: f.built, ...r, previousCandidate: differentVersion, root: f.root }), /retain the same version/)
  await assert.rejects(revise({ built: f.built, ...r, previousCandidate: "HEAD", root: f.root }), /explicit previous candidate/)
  await assert.rejects(revise({ built: f.built, ...r, previousCandidate, notes: "", root: f.root }), /reviewed user-facing/)
  assert.deepEqual(r.writes, [])
})

test("a lost revision response is reconciled without replaying its update", async t => {
  const f = revisedCandidate(t), r = revisionRemote(f), update = r.remote.update
  r.remote.update = async (...args) => { await update(...args); throw new Error("response lost") }
  await assert.rejects(revise({ built: f.built, ...r, previousCandidate: f.previousCandidate, root: f.root }), /response lost/)
  assert.equal(r.state.release.target_commitish, f.candidate)
  await revise({ built: f.built, ...r, previousCandidate: f.previousCandidate, root: f.root })
  assert.deepEqual(r.writes, ["update"])
})

test("draft revision cannot report success until the new candidate reads back", async t => {
  const f = revisedCandidate(t), r = revisionRemote(f)
  r.remote.update = async () => { r.writes.push("update") }
  await assert.rejects(revise({ built: f.built, ...r, previousCandidate: f.previousCandidate, root: f.root }), /identity differs/)
  assert.deepEqual(r.writes, ["update"])
})

test("GitHub draft revision patches the exact release once with the corrected candidate and notes", async t => {
  const f = revisedCandidate(t), r = githubFixture(f.built)
  r.state.release.target_commitish = f.previousCandidate
  Object.assign(r.state.release, releasePresentation(f.previousBuilt.plan, r.notes))
  await revise({ built: f.built, ...r, previousCandidate: f.previousCandidate, root: f.root })
  assert.equal(r.state.release.target_commitish, f.candidate)
  assert.deepEqual(r.state.release.assets, [])
  assert.deepEqual(r.writes, ["update"])
  assert.deepEqual(r.calls.filter(args => args[2] === "PATCH").map(args => args[3]), [`repos/${REPO}/releases/1`])
})

test("GitHub tag 404 finds an existing draft on a later listing page and resumes without creating it", async t => {
  const f = releaseCandidate(t), built = build(f.candidate, f.root), r = githubFixture(built)
  Object.assign(r.state.release, releasePresentation(built.plan, r.notes))
  const state = await stage({ built, ...r })
  assert.equal(state.release.id, 1)
  assert.equal(state.release.draft, true)
  assert.equal(state.release.assets.length, built.assets.size)
  await stage({ built, ...r })
  assert.deepEqual(r.writes, [...built.assets.keys()].map(name => `upload:${name}`))
  assert.ok(r.calls.some(args => args[3] === `repos/${REPO}/releases/tags/${built.plan.tag}`))
  assert.ok(r.calls.some(args => args[3] === `repos/${REPO}/releases?per_page=100`))
})

test("GitHub published tag lookup keeps its direct identity without listing drafts", async () => {
  const built = { plan: { tag: "v1.2.3", candidate: "a".repeat(40) } }, r = githubFixture(built, { published: true })
  const state = await r.remote.read(built.plan)
  assert.equal(state.release.id, 1)
  assert.equal(state.release.draft, false)
  assert.equal(state.tag, built.plan.candidate)
  assert.equal(r.calls.some(args => args[3] === `repos/${REPO}/releases?per_page=100`), false)
  assert.deepEqual(r.writes, [])
})

test("GitHub draft lookup rejects exact-tag duplicates across all listing pages", async () => {
  const built = { plan: { tag: "v1.2.3", candidate: "a".repeat(40) } }, r = githubFixture(built, { duplicate: true })
  await assert.rejects(r.remote.read(built.plan), /duplicate releases for the exact tag/)
  assert.deepEqual(r.writes, [])
})

test("stale committed catalog URLs or hashes allow preparation but block all release mutations", async t => {
  for (const field of ["url", "sha256"]) await t.test(field, async t => {
    const f = releaseCandidate(t), catalog = path.join(f.root, ".claude-plugin/https-marketplace.json"), value = JSON.parse(readFileSync(catalog))
    value.plugins[0].source[field] = field === "url" ? `https://github.com/${REPO}/releases/download/v0.0.0/signalsurf-0.0.0.zip` : "0".repeat(64)
    writeFileSync(catalog, `${JSON.stringify(value, null, 2)}\n`)
    f.git("add", ".claude-plugin/https-marketplace.json"); f.git("-c", "user.name=Package Fixture", "-c", "user.email=fixture@example.com", "commit", "-qm", `Stale catalog ${field}`)
    const candidate = f.git("rev-parse", "HEAD"), out = path.join(f.directory, "prepared")
    prepare({ candidate, out, root: f.root })
    const built = verify({ directory: out, candidate, root: f.root }), r = fake(built)
    r.remote.read = async () => { throw new Error("remote must not be read before catalog validation") }
    await assert.rejects(stage({ built, ...r }), /committed HTTPS catalog does not match/)
    await assert.rejects(activate({ built, ...r }), /committed HTTPS catalog does not match/)
    assert.deepEqual(r.writes, [])
  })
})

test("an ambiguous upload is read back before a separate invocation resumes", async t => {
  const f = releaseCandidate(t), built = build(f.candidate, f.root), r = fake(built), upload = r.remote.upload
  let interrupted = false
  r.remote.upload = async (...args) => { await upload(...args); if (!interrupted) { interrupted = true; throw new Error("response lost") } }
  await assert.rejects(stage({ built, ...r }), /response lost/)
  assert.equal(r.writes.filter(value => value.startsWith("upload:")).length, 1)
  await stage({ built, ...r })
  assert.equal(r.writes.filter(value => value.startsWith("upload:")).length, built.assets.size)
  await activate({ built, ...r })
})

test("an ambiguous draft creation is not replayed", async t => {
  const f = releaseCandidate(t), built = build(f.candidate, f.root), r = fake(built), create = r.remote.create
  r.remote.create = async (...args) => { await create(...args); throw new Error("response lost") }
  await assert.rejects(stage({ built, ...r }), /response lost/)
  await stage({ built, ...r })
  assert.equal(r.writes.filter(value => value === "create").length, 1)
})

test("interrupted activation resumes by identity without republishing", async t => {
  const f = releaseCandidate(t), built = build(f.candidate, f.root), r = fake(built)
  await stage({ built, ...r })
  const publish = r.remote.publish
  r.remote.publish = async plan => { await publish(plan); throw new Error("response lost") }
  await assert.rejects(activate({ built, ...r }), /response lost/)
  await activate({ built, ...r })
  assert.equal(r.writes.filter(value => value === "publish").length, 1)
})

test("moved tags, corrupt assets and missing staged files block publication", async t => {
  const f = releaseCandidate(t), built = build(f.candidate, f.root), r = fake(built)
  await assert.rejects(stage({ built, ...r, authorization: "" }), /authorization/)
  await assert.rejects(activate({ built, ...r }), /stage and verify/)
  await stage({ built, ...r })
  const before = r.writes.length
  r.state.tag = "f".repeat(40)
  await assert.rejects(activate({ built, ...r }), /different candidate/)
  r.state.tag = null
  const name = [...built.assets.keys()][0], original = r.bytes.get(name)
  r.bytes.set(name, Buffer.alloc(original.length))
  await assert.rejects(activate({ built, ...r }), /asset mismatch/)
  r.bytes.set(name, original)
  r.state.release.assets.pop()
  await assert.rejects(activate({ built, ...r }), /stage missing asset/)
  assert.equal(r.writes.length, before)
  r.state.active_version = "99.0.0"
  await assert.rejects(stage({ built, ...r }), /older than the active/)
})

test("unrelated prepared receipt cannot be relabeled to another commit", t => {
  const f = repository(t), out = path.join(f.directory, "prepared")
  prepare({ candidate: f.candidate, out, root: f.root })
  writeFileSync(path.join(f.root, "README.md"), `${readFileSync(path.join(f.root, "README.md"), "utf8")}\nPublic documentation update.\n`)
  f.git("add", "."); f.git("-c", "user.name=Package Fixture", "-c", "user.email=fixture@example.com", "commit", "-qm", "Different candidate")
  const receipt = JSON.parse(readFileSync(path.join(out, "release.json")))
  receipt.candidate = f.git("rev-parse", "HEAD")
  writeFileSync(path.join(out, "release.json"), JSON.stringify(receipt))
  assert.throws(() => verify({ directory: out, candidate: f.candidate, root: f.root }), /does not match/)
  assert.equal(inspect instanceof Function, true)
})
