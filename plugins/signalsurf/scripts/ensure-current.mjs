import { createHash, randomUUID } from "node:crypto"
import {
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from "node:fs"
import { homedir, hostname } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { deadUpdateOwner } from "./recover-install.mjs"

const REPOSITORY = "Signalsurf-ai/signalsurf-agent"
const PREFIX = "plugins/signalsurf/"
const RECOVERY_OWNER = ".signalsurf-recovery-owner-v1"
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
const MANIFESTS = [
  "plugin.json",
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
]
const REQUIRED = [
  ...MANIFESTS,
  "LICENSE",
  ".mcp.json",
  "mcp.json",
  "scripts/ensure-current.mjs",
  "scripts/recover-install.mjs",
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
      name === RECOVERY_OWNER ||
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

function recoveryFileIdentity(file) {
  const stat = lstatSync(file, { bigint: true })
  if (!stat.isFile() || stat.ino === 0n) throw new Error("recovery_launcher_conflict")
  const digest = createHash("sha256").update(readFileSync(file)).digest("hex")
  return `${stat.dev}:${stat.ino}:${digest}`
}

function prepareRecoveryLauncher(root, staging, lock, token) {
  const source = path.join(root, "scripts/recover-install.mjs")
  const launcher = path.join(path.dirname(root), `.${path.basename(root)}.recover-v1.mjs`)
  const sourceIdentity = recoveryFileIdentity(source)
  try {
    linkSync(source, launcher)
  } catch (error) {
    if (error.code !== "EEXIST") throw error
    const existing = recoveryFileIdentity(launcher)
    if (existing !== sourceIdentity) {
      const receipt = path.join(root, RECOVERY_OWNER)
      if (!lstatSync(receipt, { throwIfNoEntry: false })?.isFile() ||
          readFileSync(receipt, "utf8") !== existing) throw new Error("recovery_launcher_conflict")
      const pending = path.join(lock, `release-${token}-launcher`)
      linkSync(source, pending)
      renameSync(pending, launcher)
    }
  }
  // Keep ownership and the replacement installation in the same directory swap.
  writeFileSync(path.join(staging, RECOVERY_OWNER), sourceIdentity, { flag: "wx", mode: 0o600 })
}

function removeGeneration(lock, token) {
  for (const name of readdirSync(lock)) {
    if (name === `previous-${token}` || name.startsWith(`release-${token}-`))
      rmSync(path.join(lock, name), { recursive: true, force: true })
  }
  rmSync(path.join(lock, `owner-${token}.json`), { force: true })
  try {
    rmdirSync(lock)
  } catch (error) {
    if (!["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error.code)) throw error
  }
}

function reclaimAbandonedLock(lock) {
  const ownerToken = deadUpdateOwner(lock)
  if (!ownerToken) return null
  const recovery = mkdtempSync(`${lock}.recovered-`)
  const previous = `previous-${ownerToken}`
  const children = readdirSync(lock).filter(
    (name) => name === previous || name.startsWith(`release-${ownerToken}-`)
  )
  for (const name of [...children, `owner-${ownerToken}.json`]) {
    try {
      renameSync(path.join(lock, name), path.join(recovery, name))
    } catch (error) {
      if (error.code !== "ENOENT") throw error
    }
  }
  try {
    rmdirSync(lock)
  } catch (error) {
    if (!["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error.code)) throw error
  }
  if (existsSync(path.join(recovery, previous)))
    return path.join(recovery, previous)
  rmSync(recovery, { recursive: true, force: true })
  return null
}

function acquireLock(lock, token) {
  if (existsSync(lock)) return false
  const prepared = mkdtempSync(`${lock}.prepared-`)
  try {
    writeFileSync(
      path.join(prepared, `owner-${token}.json`),
      JSON.stringify({
        pid: process.pid,
        host: hostname(),
        token,
        created_at: new Date().toISOString(),
      }),
      { flag: "wx" }
    )
    try {
      renameSync(prepared, lock)
      return true
    } catch (error) {
      if (["EEXIST", "ENOTEMPTY"].includes(error.code)) return false
      throw error
    }
  } finally {
    rmSync(prepared, { recursive: true, force: true })
  }
}

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const writingCheckLifetime = 24 * 60 * 60 * 1000

export function writingFreshness(root = pluginRoot, cacheDir = path.join(homedir(), ".cache", "signalsurf-writing")) {
  const installedVersion = manifestVersion(readFileSync(path.join(root, "plugin.json")))
  const key = createHash("sha256").update(path.resolve(root)).digest("hex")
  const file = path.join(cacheDir, `${key}.json`)
  let receipt
  try {
    const candidate = JSON.parse(readFileSync(file, "utf8"))
    const age = Date.now() - Date.parse(candidate.checked_at)
    if (
      candidate.current_version === installedVersion &&
      VERSION.test(candidate.latest_version) &&
      age >= 0 && age < writingCheckLifetime
    ) receipt = candidate
  } catch {}
  return {
    local: {
      status: "writing_ready",
      installed_version: installedVersion,
      latest_verified_version: receipt?.latest_version ?? null,
      checked_at: receipt?.checked_at ?? null,
      refresh_in_background: !receipt,
    },
    async refresh(fetchImpl = fetch) {
      const result = await ensureCurrent({ root, fetchImpl, checkOnly: true })
      if (result.status !== "version_checked") return result
      const record = {
        current_version: result.current_version,
        latest_version: result.latest_version,
        checked_at: new Date().toISOString(),
      }
      try {
        mkdirSync(cacheDir, { recursive: true, mode: 0o700 })
        const staging = mkdtempSync(path.join(cacheDir, ".check-"))
        try {
          const pending = path.join(staging, "receipt.json")
          writeFileSync(pending, JSON.stringify(record), { flag: "wx", mode: 0o600 })
          renameSync(pending, file)
        } finally {
          rmSync(staging, { recursive: true, force: true })
        }
      } catch {}
      return { ...result, checked_at: record.checked_at }
    },
  }
}

export async function ensureCurrent({
  root = pluginRoot,
  fetchImpl = fetch,
  checkOnly = false,
} = {}) {
  const token = randomUUID()
  let recoveredPrevious
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
    ...(recoveredPrevious
      ? { recovered_previous_installation: recoveredPrevious }
      : {}),
    ...extra,
  })
  const request = async (url, limit) => {
    const response = await fetchImpl(url, {
      signal: AbortSignal.timeout(20000),
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
    lock = path.join(path.dirname(root), `.${path.basename(root)}.update-lock`)
    if (!checkOnly) recoveredPrevious = reclaimAbandonedLock(lock)
    if (!existsSync(root) && recoveredPrevious)
      return result("recovery_required", {
        previous_installation: recoveredPrevious,
      })
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
    if (checkOnly) return result("version_checked")
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
    ownedLock = acquireLock(lock, token)
    if (!ownedLock) return result("update_in_progress")
    const original = fingerprint(root)
    currentVersion = manifestVersion(
      readFileSync(path.join(root, "plugin.json"))
    )
    if (!newer(latestVersion, currentVersion))
      return result("current", { release_commit: commit })
    const tree = JSON.parse(
      await request(
        `https://api.github.com/repos/${REPOSITORY}/git/trees/${commit}?recursive=1`,
        1048576
      )
    )
    const files = releaseFiles(tree)
    staging = mkdtempSync(path.join(lock, `release-${token}-`))
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
    prepareRecoveryLauncher(root, staging, lock, token)
    backup = path.join(lock, `previous-${token}`)
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
    if (ownedLock) removeGeneration(lock, token)
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const mode = process.argv.slice(2)
  let result
  if (mode.length === 0) result = await ensureCurrent()
  else if (mode.length === 1 && mode[0] === "--local-writing") result = writingFreshness().local
  else if (mode.length === 1 && mode[0] === "--check-writing-version") result = await writingFreshness().refresh()
  else result = { status: "unknown_command" }
  process.stdout.write(`${JSON.stringify(result)}\n`)
  if (!["current", "updated", "writing_ready", "version_checked"].includes(result.status)) process.exitCode = 1
}
