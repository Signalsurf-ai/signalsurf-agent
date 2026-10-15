import { createHash } from "node:crypto"
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const REPOSITORY = "Signalsurf-ai/signalsurf-agent"
const PREFIX = "plugins/signalsurf/"
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
const MANIFESTS = [
  "plugin.json",
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
]
const REQUIRED = [
  ...MANIFESTS,
  ".mcp.json",
  "mcp.json",
  "scripts/ensure-current.mjs",
  "skills/signalsurf/SKILL.md",
  "skills/signalsurf/references/operating-contract.md",
  "skills/signalsurf/references/freshness.md",
]

function manifestVersion(contents) {
  const manifest = JSON.parse(contents)
  if (manifest.name !== "signalsurf" || !VERSION.test(manifest.version))
    throw new Error("invalid_plugin_manifest")
  return manifest.version
}

function newer(candidate, current) {
  const left = candidate.split(".").map(Number)
  const right = current.split(".").map(Number)
  for (let index = 0; index < 3; index++) {
    if (left[index] !== right[index]) return left[index] > right[index]
  }
  return false
}

function gitHash(bytes) {
  return createHash("sha1")
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest("hex")
}

function sourceCheckout(root) {
  for (let current = root; ; current = path.dirname(current)) {
    if (existsSync(path.join(current, ".git"))) return true
    if (path.dirname(current) === current) return false
  }
}

function fingerprint(root, prefix = "") {
  return readdirSync(path.join(root, prefix))
    .sort()
    .flatMap((name) => {
      const relative = path.join(prefix, name)
      const file = path.join(root, relative)
      const stats = lstatSync(file)
      if (stats.isSymbolicLink()) throw new Error("symlink_in_installation")
      if (stats.isDirectory()) return fingerprint(root, relative)
      if (!stats.isFile()) throw new Error("unsupported_installed_file")
      return `${relative}:${gitHash(readFileSync(file))}`
    })
    .join("\n")
}

function releaseFiles(tree) {
  if (tree.truncated || !Array.isArray(tree.tree))
    throw new Error("incomplete_release_tree")
  const files = tree.tree.filter(
    (entry) => entry.path?.startsWith(PREFIX) && entry.type !== "tree"
  )
  if (files.length === 0 || files.length > 200)
    throw new Error("invalid_release_file_count")
  const names = new Set()
  let totalSize = 0
  for (const file of files) {
    const name = file.path.slice(PREFIX.length)
    if (
      !name ||
      name.split("/").some((part) => !part || part === "." || part === "..") ||
      /[\\\x00-\x1f\x7f]/.test(name) ||
      names.has(name) ||
      file.type !== "blob" ||
      !["100644", "100755"].includes(file.mode) ||
      !/^[a-f0-9]{40}$/.test(file.sha) ||
      !Number.isInteger(file.size) ||
      file.size < 0 ||
      file.size > 524288
    )
      throw new Error("invalid_release_file")
    names.add(name)
    totalSize += file.size
  }
  if (totalSize > 8388608 || REQUIRED.some((name) => !names.has(name)))
    throw new Error("incomplete_release_package")
  return files
}

export async function ensureCurrent({
  root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  fetchImpl = fetch,
} = {}) {
  let currentVersion
  let latestVersion
  let lock
  let ownedLock = false
  let staging
  let backup
  const result = (status, extra = {}) => ({
    status,
    current_version: currentVersion,
    latest_version: latestVersion,
    update_available:
      currentVersion && latestVersion
        ? newer(latestVersion, currentVersion)
        : null,
    ...extra,
  })
  const signal = AbortSignal.timeout(20000)
  const request = async (url, limit) => {
    const response = await fetchImpl(url, {
      signal,
      redirect: "error",
      headers: {
        Accept: "application/vnd.github+json",
        "Cache-Control": "no-cache",
      },
    })
    if (!response.ok) throw new Error(`release_http_${response.status}`)
    const reader = response.body?.getReader()
    if (!reader) throw new Error("empty_release_response")
    const chunks = []
    let size = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > limit) {
        await reader.cancel()
        throw new Error("release_response_too_large")
      }
      chunks.push(Buffer.from(value))
    }
    return Buffer.concat(chunks)
  }
  try {
    root = path.resolve(root)
    if (lstatSync(root).isSymbolicLink())
      throw new Error("symlink_install_root")
    currentVersion = manifestVersion(
      readFileSync(path.join(root, "plugin.json"))
    )
    latestVersion = manifestVersion(
      await request(
        `https://raw.githubusercontent.com/${REPOSITORY}/main/${PREFIX}plugin.json`,
        65536
      )
    )
    if (!newer(latestVersion, currentVersion)) return result("current")
    if (sourceCheckout(root)) return result("source_checkout")
    const reference = JSON.parse(
      await request(
        `https://api.github.com/repos/${REPOSITORY}/git/ref/heads/main`,
        65536
      )
    ).object
    const commit = reference?.type === "commit" ? reference.sha : null
    if (!/^[a-f0-9]{40}$/.test(commit))
      throw new Error("invalid_release_commit")
    const rawUrl = (name) =>
      `https://raw.githubusercontent.com/${REPOSITORY}/${commit}/${PREFIX}${name.split("/").map(encodeURIComponent).join("/")}`
    const manifest = await request(rawUrl("plugin.json"), 65536)
    latestVersion = manifestVersion(manifest)
    if (!newer(latestVersion, currentVersion))
      return result("current", { release_commit: commit })
    lock = path.join(path.dirname(root), `.${path.basename(root)}.update-lock`)
    try {
      mkdirSync(lock)
      ownedLock = true
    } catch (error) {
      if (error.code === "EEXIST") return result("update_in_progress")
      throw error
    }
    const original = fingerprint(root)
    const tree = JSON.parse(
      await request(
        `https://api.github.com/repos/${REPOSITORY}/git/trees/${commit}?recursive=1`,
        1048576
      )
    )
    const files = releaseFiles(tree)
    staging = mkdtempSync(path.join(lock, "release-"))
    for (let start = 0; start < files.length; start += 5) {
      const downloaded = await Promise.allSettled(
        files.slice(start, start + 5).map(async (file) => {
          const name = file.path.slice(PREFIX.length)
          const bytes = await request(rawUrl(name), 524288)
          if (bytes.length !== file.size || gitHash(bytes) !== file.sha)
            throw new Error("release_integrity_mismatch")
          const target = path.join(staging, name)
          mkdirSync(path.dirname(target), { recursive: true })
          writeFileSync(target, bytes, {
            flag: "wx",
            mode: file.mode === "100755" ? 0o755 : 0o644,
          })
        })
      )
      const failed = downloaded.find((entry) => entry.status === "rejected")
      if (failed) throw failed.reason
    }
    for (const name of MANIFESTS) {
      if (
        manifestVersion(readFileSync(path.join(staging, name))) !==
        latestVersion
      )
        throw new Error("release_version_mismatch")
    }
    if (fingerprint(root) !== original)
      throw new Error("installation_changed_during_update")
    backup = path.join(lock, "previous")
    renameSync(root, backup)
    renameSync(staging, root)
    return result("updated", {
      previous_version: currentVersion,
      current_version: latestVersion,
      installed_version: latestVersion,
      update_available: false,
      release_commit: commit,
      reload_required: true,
    })
  } catch (error) {
    if (backup && existsSync(backup) && !existsSync(root)) {
      try {
        renameSync(backup, root)
      } catch {
        ownedLock = false
        return result("recovery_required", { previous_installation: backup })
      }
    }
    const message = error instanceof Error ? error.message : ""
    const reason = /^[a-z_]+(?:_\d+)?$/.test(message)
      ? message
      : "update_unavailable"
    return result("unavailable", { reason })
  } finally {
    if (ownedLock) rmSync(lock, { recursive: true, force: true })
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = await ensureCurrent()
  process.stdout.write(`${JSON.stringify(result)}\n`)
  if (!["current", "updated"].includes(result.status)) process.exitCode = 1
}
