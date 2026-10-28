import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { check, ROOT, PLUGIN, SEMVER, versionAdvance } from "./check.mjs"
import { zip } from "./zip.mjs"

export const REPO = "Signalsurf-ai/signalsurf-agent"
const SHA = /^[a-f0-9]{40}$/
const jsonBytes = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
export const digest = bytes => createHash("sha256").update(bytes).digest("hex")
const git = (root, args) => execFileSync("git", ["-C", root, ...args], { maxBuffer: 16 * 1024 * 1024 })

export function build(candidate, root = ROOT) {
  if (!SHA.test(candidate) || git(root, ["rev-parse", `${candidate}^{commit}`]).toString().trim() !== candidate) throw new Error("candidate must be an explicit full committed SHA")
  const tree = git(root, ["ls-tree", "-rz", "--full-tree", candidate]).toString().split("\0").filter(Boolean).map(line => {
    const match = line.match(/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/)
    if (!match || match[3].split("/").some(part => !part || part === "." || part === "..") || /[\\\x00-\x1f\x7f]/.test(match[3])) throw new Error("candidate contains an unsafe file or unsupported mode")
    return { mode: match[1], sha: match[2], name: match[3], bytes: git(root, ["cat-file", "blob", match[2]]) }
  })
  const snapshot = mkdtempSync(path.join(tmpdir(), "signalsurf-release-check-"))
  try {
    for (const file of tree) {
      const target = path.join(snapshot, file.name)
      mkdirSync(path.dirname(target), { recursive: true })
      writeFileSync(target, file.bytes)
    }
    const issues = check(snapshot, { catalog: false })
    if (issues.length) throw new Error(`candidate validation failed:\n${issues.join("\n")}`)
  } finally { rmSync(snapshot, { recursive: true, force: true }) }
  const plugin = tree.filter(file => file.name.startsWith(`${PLUGIN}/`)).map(file => ({ ...file, name: file.name.slice(PLUGIN.length + 1) }))
  const version = JSON.parse(plugin.find(file => file.name === "plugin.json").bytes).version
  const tag = `v${version}`, archiveName = `signalsurf-${version}.zip`, archive = zip(plugin)
  const marketplace = jsonBytes({ name: "signalsurf", owner: { name: "Signalsurf" }, metadata: { description: "Access Signalsurf from Claude" }, plugins: [{ name: "signalsurf", source: { source: "archive", url: `https://github.com/${REPO}/releases/download/${tag}/${archiveName}`, sha256: digest(archive) }, description: "Access your Signalsurf workspace, Projects, and product tools from Claude." }] })
  const assets = new Map([[archiveName, archive], ["marketplace.json", marketplace], ["SHA256SUMS", Buffer.from(`${digest(archive)}  ${archiveName}\n`)]])
  const plan = { format: 1, repository: REPO, version, tag, candidate, plugin_tree: git(root, ["rev-parse", `${candidate}:${PLUGIN}`]).toString().trim(), assets: Object.fromEntries([...assets].map(([name, bytes]) => [name, { sha256: digest(bytes), size: bytes.length }])) }
  assets.set("release.json", jsonBytes(plan))
  return { plan, assets, committedCatalog: tree.find(file => file.name === ".claude-plugin/https-marketplace.json")?.bytes }
}

export function prepare({ candidate, out, root = ROOT }) {
  const built = build(candidate, root)
  if (existsSync(out)) {
    verify({ directory: out, candidate, root })
    return built.plan
  }
  mkdirSync(out)
  for (const [name, bytes] of built.assets) writeFileSync(path.join(out, name), bytes, { flag: "wx" })
  return built.plan
}

export function verify({ directory, candidate, root = ROOT }) {
  const plan = JSON.parse(readFileSync(path.join(directory, "release.json"), "utf8"))
  if (candidate && candidate !== plan.candidate) throw new Error("prepared candidate does not match requested candidate")
  const built = build(plan.candidate, root)
  if (!jsonBytes(plan).equals(built.assets.get("release.json"))) throw new Error("release receipt does not match the committed candidate")
  for (const [name, bytes] of built.assets) if (!readFileSync(path.join(directory, name)).equals(bytes)) throw new Error(`prepared artifact mismatch: ${name}`)
  return built
}

export function assertRemote(plan, state, { complete = false } = {}) {
  if (state.tag && state.tag !== plan.candidate) throw new Error("immutable tag points at a different candidate; choose a new version")
  if (!state.release) {
    if (complete) throw new Error("release is missing")
    return
  }
  if (state.release.tag_name !== plan.tag || (!state.tag && state.release.target_commitish !== plan.candidate)) throw new Error("release identity differs from prepared candidate")
  const names = new Set()
  for (const asset of state.release.assets) {
    if (names.has(asset.name)) throw new Error("duplicate release asset; reconcile manually")
    names.add(asset.name)
  }
  if (complete && !state.tag) throw new Error("tag is missing")
}

function assertForwardVersion(plan, state) {
  if (!SEMVER.test(state.active_version ?? "") || (state.active_version !== plan.version && !versionAdvance(state.active_version, plan.version))) throw new Error("prepared version is older than the active package or current version is unknown; prepare a forward patch")
}

function assertCommittedCatalog(built) {
  if (!Buffer.isBuffer(built.committedCatalog) || !built.committedCatalog.equals(built.assets.get("marketplace.json"))) throw new Error("committed HTTPS catalog does not match the generated release catalog; commit marketplace.json as .claude-plugin/https-marketplace.json and prepare the final candidate")
}

export function releasePresentation(plan, notes) {
  if (typeof notes !== "string" || !notes.trim()) throw new Error("reviewed user-facing release notes are required")
  return { name: plan.tag, body: `${notes.trim()}\n\n<details>\n<summary>Artifacts</summary>\n\n- Candidate: \`${plan.candidate}\`\n- Plugin tree: \`${plan.plugin_tree}\`\n- Archive SHA-256: \`${plan.assets[`signalsurf-${plan.version}.zip`].sha256}\`\n\n</details>\n` }
}

function assertPresentation(release, presentation) {
  if (release.name !== presentation.name || release.body !== presentation.body) throw new Error("draft release title or notes differ from the reviewed release notes; stage the matching presentation before activation")
}

export async function inspect({ built, remote, complete = false }) {
  const state = await remote.read(built.plan)
  assertRemote(built.plan, state, { complete })
  const expected = [...built.assets.keys()]
  if (state.release?.assets.some(asset => !expected.includes(asset.name))) throw new Error("unexpected existing release asset; reconcile manually")
  for (const [name, bytes] of built.assets) {
    const asset = state.release?.assets.find(value => value.name === name)
    if (!asset) {
      if (complete) throw new Error(`missing release asset: ${name}`)
      continue
    }
    if (asset.size !== bytes.length || !(await remote.download(built.plan, asset)).equals(bytes)) throw new Error(`immutable published asset mismatch: ${name}`)
  }
  return state
}

export async function stage({ built, remote, authorization, notes }) {
  if (authorization !== `${REPO}@${built.plan.tag}`) throw new Error("explicit repository@tag authorization is required")
  assertCommittedCatalog(built)
  const presentation = releasePresentation(built.plan, notes)
  let state = await inspect({ built, remote })
  assertForwardVersion(built.plan, state)
  if (!state.release) {
    await remote.create(built.plan, presentation)
    state = await inspect({ built, remote })
    if (!state.release?.draft) throw new Error("draft release creation did not read back")
  }
  if (!state.release.draft) return inspect({ built, remote, complete: true })
  if (state.release.name !== presentation.name || state.release.body !== presentation.body) {
    const releaseId = state.release.id
    await remote.update(built.plan, state.release, presentation)
    state = await inspect({ built, remote })
    if (!state.release?.draft || state.release.id !== releaseId) throw new Error("draft release presentation update did not read back")
  }
  assertPresentation(state.release, presentation)
  for (const [name, bytes] of built.assets) {
    if (!state.release.assets.some(asset => asset.name === name)) {
      await remote.upload(built.plan, name, bytes)
      state = await inspect({ built, remote })
      if (!state.release.assets.some(asset => asset.name === name)) throw new Error("upload did not read back; inspect before retrying")
    }
  }
  for (const name of built.assets.keys()) if (!state.release.assets.some(asset => asset.name === name)) throw new Error(`missing staged asset: ${name}`)
  return state
}

export async function activate({ built, remote, authorization, notes }) {
  if (authorization !== `${REPO}@${built.plan.tag}`) throw new Error("explicit repository@tag authorization is required")
  assertCommittedCatalog(built)
  const presentation = releasePresentation(built.plan, notes)
  const state = await inspect({ built, remote })
  assertForwardVersion(built.plan, state)
  if (!state.release) throw new Error("stage and verify the release first")
  for (const name of built.assets.keys()) if (!state.release.assets.some(asset => asset.name === name)) throw new Error(`stage missing asset first: ${name}`)
  if (state.release.draft) {
    assertPresentation(state.release, presentation)
    await remote.publish(built.plan, state.release)
  }
  const published = await inspect({ built, remote, complete: true })
  if (published.release.draft) throw new Error("publication has not read back; inspect before retrying")
  return published
}

export async function revise({ built, previousCandidate, remote, authorization, notes, root = ROOT }) {
  if (authorization !== `${REPO}@${built.plan.tag}`) throw new Error("explicit repository@tag authorization is required")
  assertCommittedCatalog(built)
  const presentation = releasePresentation(built.plan, notes)
  if (!SHA.test(previousCandidate ?? "") || previousCandidate === built.plan.candidate) throw new Error("revision requires a different explicit previous candidate SHA")
  let previousVersion
  try { previousVersion = JSON.parse(git(root, ["show", `${previousCandidate}:${PLUGIN}/plugin.json`])).version }
  catch { throw new Error("previous candidate version could not be verified") }
  if (previousVersion !== built.plan.version) throw new Error("draft revision must retain the same version")
  const state = await remote.read(built.plan)
  const assertRevisable = current => {
    if (current.tag || !current.release?.draft || current.release.tag_name !== built.plan.tag || current.release.assets.length) throw new Error("revision requires an untagged empty draft for this exact version")
    if (!versionAdvance(current.active_version, built.plan.version)) throw new Error("draft revision version must be newer than the publicly active main version")
  }
  assertRevisable(state)
  if (state.release.target_commitish === built.plan.candidate) {
    assertPresentation(state.release, presentation)
    return inspect({ built, remote })
  }
  if (state.release.target_commitish !== previousCandidate) throw new Error("draft does not match the expected previous candidate")
  await remote.update(built.plan, state.release, { ...presentation, target_commitish: built.plan.candidate })
  const revised = await inspect({ built, remote })
  assertRevisable(revised)
  if (revised.release.id !== state.release.id) throw new Error("draft revision identity did not read back")
  assertPresentation(revised.release, presentation)
  return revised
}

export function githubRemote(directory, { execute = execFileSync } = {}) {
  const api = (endpoint, { method = "GET", input, binary = false, paginate = false } = {}) => {
    const args = ["api", "--method", method, endpoint]
    if (input) args.push("--input", "-")
    if (binary) args.push("-H", "Accept: application/octet-stream")
    if (paginate) args.push("--paginate", "--slurp")
    try {
      const bytes = execute("gh", args, { input: input && JSON.stringify(input), maxBuffer: 16 * 1024 * 1024, stdio: ["pipe", "pipe", "pipe"] })
      return binary ? bytes : JSON.parse(bytes)
    } catch (error) {
      if (method === "GET" && /HTTP 404/.test(String(error.stderr))) return null
      throw new Error(method === "GET" ? "GitHub read failed; check authentication/connectivity" : "GitHub mutation outcome is uncertain; run inspect before any retry")
    }
  }
  return {
    async read(plan) {
      const active = api(`repos/${REPO}/contents/${PLUGIN}/plugin.json?ref=main`)
      if (!active?.content) throw new Error("active package version could not be verified")
      const activeVersion = JSON.parse(Buffer.from(active.content, "base64")).version
      const reference = api(`repos/${REPO}/git/ref/tags/${plan.tag}`)
      let target = reference?.object
      if (target?.type === "tag") target = api(`repos/${REPO}/git/tags/${target.sha}`)?.object
      if (target && target.type !== "commit") throw new Error("unsupported release tag identity")
      let release = api(`repos/${REPO}/releases/tags/${plan.tag}`)
      if (!release) {
        const pages = api(`repos/${REPO}/releases?per_page=100`, { paginate: true })
        if (!Array.isArray(pages) || !pages.every(Array.isArray)) throw new Error("release listing could not be verified; reconcile before creation")
        const matches = pages.flat().filter(value => value?.tag_name === plan.tag)
        if (matches.length > 1) throw new Error("duplicate releases for the exact tag; reconcile manually")
        release = matches[0] ?? null
      }
      return { tag: target?.sha, release, active_version: activeVersion }
    },
    async download(_plan, asset) {
      const bytes = api(`repos/${REPO}/releases/assets/${asset.id}`, { binary: true })
      if (!bytes) throw new Error("release asset cannot be read")
      return bytes
    },
    async create(plan, presentation) {
      api(`repos/${REPO}/releases`, { method: "POST", input: { tag_name: plan.tag, target_commitish: plan.candidate, draft: true, ...presentation } })
    },
    async update(_plan, release, changes) { api(`repos/${REPO}/releases/${release.id}`, { method: "PATCH", input: changes }) },
    async upload(plan, name, bytes) {
      const temporary = mkdtempSync(path.join(tmpdir(), "signalsurf-upload-"))
      const file = path.join(temporary, name)
      writeFileSync(file, bytes, { flag: "wx" })
      try { execute("gh", ["release", "upload", plan.tag, file, "--repo", REPO], { stdio: ["ignore", "pipe", "pipe"] }) }
      catch { throw new Error("upload outcome is uncertain; run inspect before retrying (never use --clobber)") }
      finally { rmSync(temporary, { recursive: true, force: true }) }
    },
    async publish(_plan, release) { api(`repos/${REPO}/releases/${release.id}`, { method: "PATCH", input: { draft: false } }) },
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2), options = {}
  if (["--help", "help"].includes(command)) {
    console.log("prepare --candidate SHA --out DIR\nverify|inspect --dir DIR [--candidate SHA]\nstage|activate --dir DIR --candidate SHA --notes-file FILE --authorize Signalsurf-ai/signalsurf-agent@vVERSION\nrevise --dir DIR --candidate SHA --previous-candidate SHA --notes-file FILE --authorize Signalsurf-ai/signalsurf-agent@vVERSION")
    return
  }
  for (let index = 0; index < args.length; index += 2) {
    if (!/^--(?:candidate|previous-candidate|out|dir|authorize|notes-file)$/.test(args[index]) || !args[index + 1] || args[index + 1].startsWith("--")) throw new Error("invalid release argument")
    const name = args[index].slice(2)
    if (name in options) throw new Error("duplicate release argument")
    options[name] = args[index + 1]
  }
  if (command === "prepare") {
    if (!options.candidate || !options.out) throw new Error("prepare requires --candidate <full SHA> --out <new directory>")
    console.log(JSON.stringify(prepare({ candidate: options.candidate, out: path.resolve(options.out) }), null, 2)); return
  }
  if (!["verify", "inspect", "stage", "activate", "revise"].includes(command) || !options.dir) throw new Error("Use prepare --candidate SHA --out DIR, or verify|inspect|stage|activate|revise --dir DIR [--candidate SHA] [--notes-file FILE] [--authorize repository@tag]")
  const mutation = ["stage", "activate", "revise"].includes(command)
  if (mutation && !options.candidate) throw new Error("mutations require --candidate <the authorized full SHA>")
  if (mutation && !options["notes-file"]) throw new Error("mutations require --notes-file <reviewed user-facing release notes>")
  if (command === "revise" && !options["previous-candidate"]) throw new Error("revise requires --previous-candidate <the exact prior draft SHA>")
  const directory = path.resolve(options.dir), built = verify({ directory, candidate: options.candidate })
  if (command === "verify") { console.log(JSON.stringify(built.plan, null, 2)); return }
  const remote = githubRemote(directory)
  const changes = { built, remote, authorization: options.authorize, notes: mutation ? readFileSync(path.resolve(options["notes-file"]), "utf8") : undefined }
  const state = command === "inspect" ? await inspect({ built, remote }) : command === "stage" ? await stage(changes) : command === "revise" ? await revise({ ...changes, previousCandidate: options["previous-candidate"] }) : await activate(changes)
  console.log(JSON.stringify({ version: built.plan.version, candidate: built.plan.candidate, tag: state.tag, release_id: state.release?.id, draft: state.release?.draft, assets: state.release?.assets.map(asset => asset.name) }, null, 2))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1 })
