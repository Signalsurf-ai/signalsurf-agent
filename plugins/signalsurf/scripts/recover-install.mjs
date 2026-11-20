import { existsSync, lstatSync, readFileSync, readdirSync, renameSync } from "node:fs"
import { hostname } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

export function deadUpdateOwner(lock) {
  if (!existsSync(lock) || !lstatSync(lock).isDirectory()) return null
  const owners = readdirSync(lock).filter(name => /^owner-[a-zA-Z0-9-]+\.json$/.test(name))
  if (owners.length !== 1) return null
  try {
    const file = path.join(lock, owners[0])
    if (!lstatSync(file).isFile()) return null
    const owner = JSON.parse(readFileSync(file, "utf8"))
    if (owner.host !== hostname() || !Number.isSafeInteger(owner.pid) || owner.pid <= 0 ||
        owners[0] !== `owner-${owner.token}.json` || !Number.isFinite(Date.parse(owner.created_at))) return null
    try {
      process.kill(owner.pid, 0)
    } catch (error) {
      if (error.code === "ESRCH") return owner.token
    }
  } catch (error) {
    if (error.code !== "ENOENT" && !(error instanceof SyntaxError)) throw error
  }
  return null
}

function recover(root) {
  if (existsSync(root)) return { status: "installation_present" }
  const lock = path.join(path.dirname(root), `.${path.basename(root)}.update-lock`)
  const token = deadUpdateOwner(lock)
  if (!token) return { status: "recovery_unavailable" }
  const backup = path.join(lock, `previous-${token}`)
  if (!lstatSync(backup).isDirectory()) return { status: "recovery_unavailable" }
  const manifest = JSON.parse(readFileSync(path.join(backup, "plugin.json"), "utf8"))
  if (manifest.name !== "signalsurf" || typeof manifest.version !== "string") return { status: "recovery_unavailable" }
  renameSync(backup, root)
  return { status: "restored", installed_version: manifest.version }
}

const entry = fileURLToPath(import.meta.url)
if (process.argv[1] && path.resolve(process.argv[1]) === entry) {
  const name = /^\.(.+)\.recover-v1\.mjs$/.exec(path.basename(entry))?.[1]
  try {
    const result = name ? recover(path.join(path.dirname(entry), name)) : { status: "recovery_unavailable" }
    process.stdout.write(`${JSON.stringify(result)}\n`)
    if (result.status === "recovery_unavailable") process.exitCode = 1
  } catch {
    process.stdout.write('{"status":"recovery_unavailable"}\n')
    process.exitCode = 1
  }
}
