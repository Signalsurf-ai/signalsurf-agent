import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs"
import { execFileSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
export const PLUGIN = "plugins/signalsurf"
export const MANIFESTS = ["plugin.json", ".claude-plugin/plugin.json", ".codex-plugin/plugin.json", ".cursor-plugin/plugin.json"]
export const SKILLS = ["campaigns", "connections", "content", "conversations", "custom-skills", "knowledge", "listening", "onboarding", "projects", "records", "sheets", "signals", "signalsurf", "workflows", "writing"]
const WRITING_REFERENCES = ["core", "voice", "email-outreach", "follow-up", "email-reply", "linkedin-post", "x-post", "public-reply", "direct-message", "connection-note", "chinese", "review", "template"]
export const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
const REPOSITORY = "https://github.com/Signalsurf-ai/signalsurf-agent"
const MCP = "https://mcp.signalsurf.ai/mcp"
const ROOT_ENTRIES = new Set([".agents", ".claude-plugin", ".cursor-plugin", ".github", ".gitignore", ".gitattributes", "AGENTS.md", "CLAUDE.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "GETTING_STARTED.md", "LICENSE", "NOTICE", "README.md", "SECURITY.md", "docs", "evals", "scripts", "tests", "package.json", "package-lock.json", "plugins"])
const SECRET_PATH = /(?:^|\/)(?:\.env(?:\.|$)|credentials?(?:\.|$)|id_(?:rsa|ed25519)(?:\.|$)|[^/]*\.(?:pem|p12|key)$)/i
const SECRET_CONTENT = [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\b(?:gh[pousr]_[A-Za-z0-9]{32,}|github_pat_[A-Za-z0-9_]{40,}|ssmcp_(?:live|rt)_[A-Za-z0-9_-]{16,})\b/, /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/, /GOCSPX-[A-Za-z0-9_-]{20,}/, /\bwhsec_[A-Za-z0-9+/_-]{24,}={0,2}(?![A-Za-z0-9+/_=-])/, /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/, /(?:^|\n)\s*(?:(?:env|export)\s+)?["']?(?:[A-Z0-9]+[_-])*(?:access[_-]?token|api[_-]?key|client[_-]?secret|cookie|password|private[_-]?key|refresh[_-]?token|secret|service[_-]?role[_-]?key|token|x-api-key)["']?\s*[:=]\s*["']?(?!\$\{?|<)[A-Za-z0-9+./_=-]{16,}/i]
const PRIVATE_CONTENT = [/(?:\/Users\/|\/home\/)[A-Za-z0-9_.-]+\//, /https:\/\/(?:linear\.app\/signalsurf|github\.com\/Signalsurf-ai\/signalsurf-web)(?:\/|\b)/i]

function pngCrc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

function checkPngIcon(file, bytes, problem) {
  const invalid = () => problem(file, "icon is not a valid PNG")
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    invalid()
    return
  }
  let offset = 8, width, height, sawHeader = false, sawImageData = false, sawEnd = false, valid = true
  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) { valid = false; break }
    const length = bytes.readUInt32BE(offset), data = offset + 8, crc = data + length, end = crc + 4
    if (end > bytes.length) { valid = false; break }
    const type = bytes.toString("ascii", offset + 4, data)
    if (!/^[A-Za-z]{4}$/.test(type) || pngCrc32(bytes.subarray(offset + 4, crc)) !== bytes.readUInt32BE(crc)) valid = false
    if (!sawHeader) {
      if (type !== "IHDR" || length !== 13) valid = false
      else { sawHeader = true; width = bytes.readUInt32BE(data); height = bytes.readUInt32BE(data + 4) }
    } else if (type === "IHDR") valid = false
    if (type === "IDAT") sawImageData = true
    if (type === "IEND") {
      if (length !== 0 || end !== bytes.length) valid = false
      sawEnd = true
      offset = end
      break
    }
    offset = end
  }
  if (!valid || !sawHeader || !sawImageData || !sawEnd || offset !== bytes.length) invalid()
  if (width === undefined || height === undefined) return
  if (width !== height) problem(file, `icon must be square (${width}x${height})`)
  if (width < 48 || height < 48 || width > 4096 || height > 4096) problem(file, "icon dimensions must be between 48 and 4096 pixels")
}

export function walk(root, relative = "") {
  return readdirSync(path.join(root, relative)).sort().flatMap(name => {
    if (!relative && [".git", "node_modules"].includes(name)) return []
    const file = path.posix.join(relative, name)
    const stats = lstatSync(path.join(root, file))
    return stats.isDirectory() && !stats.isSymbolicLink() ? walk(root, file) : [file]
  })
}

export function versionAdvance(base, current) {
  if (!SEMVER.test(base) || !SEMVER.test(current)) return false
  const a = base.split(".").map(Number), b = current.split(".").map(Number)
  for (let index = 0; index < 3; index++) if (a[index] !== b[index]) return b[index] > a[index]
  return false
}

export function check(root = ROOT, { catalog = true } = {}) {
  const issues = []
  const contents = new Map()
  const problem = (file, message) => issues.push(`${file}: ${message}`)
  const json = file => {
    try {
      const value = JSON.parse(contents.get(file) ?? readFileSync(path.join(root, file), "utf8"))
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("expected object")
      return value
    }
    catch { problem(file, "missing or invalid JSON"); return null }
  }
  for (const file of walk(root)) {
    const stat = lstatSync(path.join(root, file))
    if (!ROOT_ENTRIES.has(file.split("/")[0])) problem(file, "unexpected repository root entry")
    if (stat.isSymbolicLink() || !stat.isFile()) { problem(file, "symlinks and special files are not distributable"); continue }
    if (SECRET_PATH.test(file)) problem(file, "secret-bearing filename")
    if (stat.size > (file.startsWith(`${PLUGIN}/`) ? 524288 : 2097152)) problem(file, "file exceeds package size budget")
    if (file.endsWith("/icon.png")) checkPngIcon(file, readFileSync(path.join(root, file)), problem)
    if (!/\.(?:png|jpg|jpeg|gif|webp|ico)$/i.test(file)) {
      const text = readFileSync(path.join(root, file), "utf8")
      contents.set(file, text)
      if (SECRET_CONTENT.some(pattern => pattern.test(text))) problem(file, "credential-shaped content (value redacted)")
      if (PRIVATE_CONTENT.some(pattern => pattern.test(text))) problem(file, "private source/tracking or machine path")
    }
    if (file.startsWith(`${PLUGIN}/`)) {
      const local = file.slice(PLUGIN.length + 1)
      if (!/^(?:LICENSE|NOTICE|README\.md|plugin\.json|mcp\.json|\.mcp\.json|\.(?:claude|codex|cursor)-plugin\/plugin\.json|scripts\/ensure-current\.mjs|assets\/icon\.png|skills\/[a-z-]+\/(?:SKILL\.md|agents\/openai\.yaml|assets\/icon\.png|references\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.md))$/.test(local)) problem(file, "unexpected plugin file")
    }
  }
  const versions = new Set()
  for (const name of MANIFESTS) {
    const file = `${PLUGIN}/${name}`, manifest = json(file)
    if (!manifest) continue
    const permitted = name === "plugin.json" ? new Set(["$schema", "author", "description", "extensions", "homepage", "license", "name", "repository", "version"]) : new Set(["author", "description", "homepage", "license", "mcpServers", "name", "repository", "skills", "version", "interface", "keywords", "logo"])
    if (Object.keys(manifest).some(key => !permitted.has(key))) problem(file, "unexpected manifest field or executable hook")
    if (name === "plugin.json" && manifest.$schema !== "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json") problem(file, "wrong portable schema")
    if (manifest.name !== "signalsurf" || !SEMVER.test(manifest.version)) problem(file, "invalid plugin name/version")
    else versions.add(manifest.version)
    if (manifest.repository !== REPOSITORY || manifest.license !== "MIT") problem(file, "repository or license mismatch")
    if (name !== "plugin.json") {
      const expected = name.startsWith(".cursor") ? "./mcp.json" : "./.mcp.json"
      if (manifest.mcpServers !== expected) problem(file, "wrong MCP configuration path")
      const skills = Array.isArray(manifest.skills) ? manifest.skills : [manifest.skills]
      if (skills.length !== 1 || !["./skills", "./skills/"].includes(skills[0])) problem(file, "wrong Skills path")
    }
    const interfaces = [manifest, manifest.interface, manifest.extensions?.["com.openai"]?.interface].filter(Boolean)
    for (const fields of interfaces) for (const field of ["logo", "composerIcon"]) {
      if (!fields[field]) continue
      if (typeof fields[field] !== "string") { problem(file, `invalid ${field} path`); continue }
      const target = path.resolve(root, PLUGIN, fields[field])
      const relative = path.relative(path.join(root, PLUGIN), target)
      if (relative.startsWith("..") || !existsSync(target)) problem(file, `missing or unsafe ${field}`)
    }
  }
  if (versions.size !== 1) problem(PLUGIN, "all host manifests must have the same version")
  for (const [name, type] of [[".mcp.json", "http"], ["mcp.json", "streamable-http"]]) {
    const file = `${PLUGIN}/${name}`, value = json(file)
    if (!value) continue
    if (Object.keys(value).sort().join() !== (name === "mcp.json" ? "$schema,mcpServers" : "mcpServers") || (name === "mcp.json" && value.$schema !== "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json")) problem(file, "unexpected MCP configuration fields/schema")
    if (Object.keys(value.mcpServers ?? {}).join() !== "signalsurf" || value.mcpServers?.signalsurf?.url !== MCP || value.mcpServers?.signalsurf?.type !== type || Object.keys(value.mcpServers?.signalsurf ?? {}).sort().join() !== "type,url") problem(file, "MCP must use the approved hosted endpoint without credentials or commands")
  }
  for (const [file, expected] of [[".claude-plugin/marketplace.json", "./plugins/signalsurf"], [".cursor-plugin/marketplace.json", "./plugins/signalsurf"], [".agents/plugins/marketplace.json", "./plugins/signalsurf"]]) {
    const manifest = json(file), entry = manifest?.plugins?.[0]
    if (!manifest) continue
    if (manifest.name !== "signalsurf" || manifest.plugins?.length !== 1 || entry?.name !== "signalsurf" || (typeof entry.source === "string" ? entry.source : entry.source?.path) !== expected) problem(file, "marketplace must resolve the canonical plugin")
  }
  if (catalog) {
    const file = ".claude-plugin/https-marketplace.json", manifest = json(file), entry = manifest?.plugins?.[0]
    if (manifest && (manifest.name !== "signalsurf" || manifest.plugins?.length !== 1 || entry?.name !== "signalsurf" || entry.source?.source !== "archive" || !/^https:\/\/github\.com\/Signalsurf-ai\/signalsurf-agent\/releases\/download\/v(\d+\.\d+\.\d+)\/signalsurf-\1\.zip$/.test(entry.source?.url ?? "") || !/^[a-f0-9]{64}$/.test(entry.source?.sha256 ?? ""))) problem(file, "invalid immutable HTTPS archive source")
  }
  let license
  try { license = readFileSync(path.join(root, "LICENSE"), "utf8") } catch { problem("LICENSE", "missing root license") }
  try {
    const notice = readFileSync(path.join(root, PLUGIN, "LICENSE"), "utf8")
    if (notice !== license || !notice.includes("MIT License") || !notice.includes("Copyright (c) 2026 Signalsurf")) problem(`${PLUGIN}/LICENSE`, "must match the complete canonical MIT notice")
  } catch { problem(`${PLUGIN}/LICENSE`, "missing installed license") }
  for (const skill of SKILLS) {
    const file = `${PLUGIN}/skills/${skill}/SKILL.md`, text = contents.get(file)
    if (!text) { problem(file, "missing Skill"); continue }
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1]
    if (!frontmatter || !new RegExp(`^name: ["']?${skill}["']?$`, "m").test(frontmatter) || !/^description: .+/m.test(frontmatter)) problem(file, "invalid Skill name/description frontmatter")
    if (!text.includes("references/freshness.md")) problem(file, "missing shared freshness procedure")
    const contract = skill === "signalsurf" ? "references/operating-contract.md" : "../signalsurf/references/operating-contract.md"
    if (!text.includes(`](${contract})`)) problem(file, "Skill must link the shared operating contract; Writing applies it when accessing SignalSurf resources")
    if (["signalsurf", "records", "content", "campaigns", "conversations", "listening"].includes(skill) && !text.includes("](../writing/SKILL.md)")) problem(file, "Skill must route copy work to Writing")
    if (skill === "writing") for (const reference of WRITING_REFERENCES) {
      if (!text.includes(`](references/${reference}.md)`)) problem(file, `Writing Skill must route ${reference} guidance`)
    }
    if (skill === "conversations") {
      if (!text.includes("`conversations_query`") || /`(?:inbox_query|meeting_query)`/.test(text)) problem(file, "Conversations Skill must use the unified conversations_query reader")
      for (const reference of ["phone", "meeting-recorder"]) {
        if (!text.includes(`](references/${reference}.md)`)) problem(file, `Conversations Skill must route ${reference} guidance`)
      }
    }
  }
  const discovered = walk(root).filter(file => file.startsWith(`${PLUGIN}/skills/`) && file.endsWith("/SKILL.md")).map(file => file.split("/")[3]).sort()
  if (discovered.join() !== [...SKILLS].sort().join()) problem(`${PLUGIN}/skills`, "unexpected Skill discovery inventory")
  for (const [file, text] of contents) {
    if (!file.endsWith(".md")) continue
    for (const match of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
      const href = match[1].trim().replace(/^<|>$/g, "").split(/\s+["']/)[0]
      if (/^(?:https?:|mailto:|#|codex:|app:)/.test(href)) continue
      let decoded
      try { decoded = decodeURIComponent(href.split(/[?#]/)[0]) } catch { problem(file, "invalid encoded Markdown path"); continue }
      const target = path.resolve(root, path.dirname(file), decoded)
      if (path.relative(root, target).startsWith("..") || !existsSync(target)) problem(file, `unresolved relative Markdown link: ${href}`)
    }
  }
  return issues
}

export function versionIssues(base, root = ROOT) {
  if (!/^[a-f0-9]{40}$/.test(base)) return ["version comparison requires a full base commit SHA"]
  try {
    const git = args => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim()
    if (!git(["diff", "--name-only", base, "--", PLUGIN])) return []
    const prior = JSON.parse(git(["show", `${base}:${PLUGIN}/plugin.json`])).version
    const current = JSON.parse(readFileSync(path.join(root, PLUGIN, "plugin.json"))).version
    return versionAdvance(prior, current) ? [] : ["a changed plugin tree requires a new stable version"]
  } catch { return ["version comparison failed; fetch the exact base commit"] }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const issues = check()
  if (process.argv.length > 2) {
    if (process.argv.length !== 4 || process.argv[2] !== "--base") issues.push("Use --base <full commit SHA>")
    else issues.push(...versionIssues(process.argv[3]))
  }
  if (issues.length) { process.stderr.write(`${issues.join("\n")}\n`); process.exitCode = 1 }
  else process.stdout.write("Public package validation passed. Host/OAuth/model behavior is separate.\n")
}
