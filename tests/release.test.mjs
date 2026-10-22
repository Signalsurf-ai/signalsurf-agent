import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"
import { ROOT, versionIssues } from "../scripts/check.mjs"
import { activate, assertRemote, build, inspect, prepare, REPO, stage, verify } from "../scripts/release.mjs"
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
  const state = { active_version: "0.0.0", tag: null, release: null }, bytes = new Map(), writes = []
  const remote = {
    async read() { return structuredClone(state) },
    async download(_plan, asset) { return bytes.get(asset.name) },
    async create(plan) { writes.push("create"); state.release = { id: 1, tag_name: plan.tag, target_commitish: plan.candidate, draft: true, assets: [] } },
    async upload(_plan, name, value) { writes.push(`upload:${name}`); bytes.set(name, value); state.release.assets.push({ id: state.release.assets.length + 1, name, size: value.length }) },
    async publish(plan) { writes.push("publish"); state.tag = plan.candidate; state.release.draft = false },
  }
  return { state, bytes, writes, remote, authorization: `${REPO}@${built.plan.tag}` }
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
  r.remote.create = async plan => { await create(plan); throw new Error("response lost") }
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
  // Candidate identity is part of the receipt: exact requested SHA must still be supplied.
  assert.throws(() => verify({ directory: out, candidate: f.candidate, root: f.root }), /does not match/)
  assert.equal(inspect instanceof Function, true)
})
