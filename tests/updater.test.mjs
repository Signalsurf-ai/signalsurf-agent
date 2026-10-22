// Characterization of the public updater; fixtures never contact hosted services.
import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import fs, { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { syncBuiltinESMExports } from "node:module"
import { hostname, tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"
import { ROOT as DEFAULT_DISTRIBUTION_ROOT } from "../scripts/check.mjs"
import { ensureCurrent } from "../plugins/signalsurf/scripts/ensure-current.mjs"
function updaterFixture(
  t,
  version = "1.1.0",
  commit = (version === "1.2.0" ? "b" : "a").repeat(40)
) {
  const directory = mkdtempSync(path.join(tmpdir(), "signalsurf-update-"))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const installed = path.join(directory, "signalsurf")
  cpSync(
    path.join(DEFAULT_DISTRIBUTION_ROOT, "plugins/signalsurf"),
    installed,
    { recursive: true }
  )
  const published = path.join(directory, "published")
  cpSync(installed, published, { recursive: true })
  const setVersion = (root, version) => {
    for (const name of [
      "plugin.json",
      ".claude-plugin/plugin.json",
      ".codex-plugin/plugin.json",
      ".cursor-plugin/plugin.json",
    ]) {
      const file = path.join(root, name)
      const manifest = JSON.parse(readFileSync(file, "utf8"))
      manifest.version = version
      writeFileSync(file, JSON.stringify(manifest))
    }
  }
  setVersion(installed, "1.0.0")
  setVersion(published, version)
  const files = new Map()
  const collect = (root, prefix = "") => {
    for (const name of readdirSync(path.join(root, prefix))) {
      const relative = path.posix.join(prefix, name)
      const file = path.join(root, relative)
      if (statSync(file).isDirectory()) collect(root, relative)
      else files.set(relative, readFileSync(file))
    }
  }
  collect(published)
  const calls = []
  const tree = [...files].map(([name, bytes]) => ({
    path: `plugins/signalsurf/${name}`,
    type: "blob",
    mode: "100644",
    size: bytes.length,
    sha: createHash("sha1")
      .update(`blob ${bytes.length}\0`)
      .update(bytes)
      .digest("hex"),
  }))
  const fetchImpl = async (url, options) => {
    calls.push(url)
    assert.equal(options.redirect, "error")
    assert.deepEqual(Object.keys(options.headers).sort(), [
      "Accept",
      "Cache-Control",
    ])
    if (
      url ===
      "https://raw.githubusercontent.com/Signalsurf-ai/signalsurf-agent/main/plugins/signalsurf/plugin.json"
    )
      return new Response(files.get("plugin.json"))
    if (
      url ===
      "https://api.github.com/repos/Signalsurf-ai/signalsurf-agent/git/ref/heads/main"
    )
      return Response.json({ object: { type: "commit", sha: commit } })
    if (
      url ===
      `https://api.github.com/repos/Signalsurf-ai/signalsurf-agent/git/trees/${commit}?recursive=1`
    )
      return Response.json({ tree, truncated: false })
    const prefix = `https://raw.githubusercontent.com/Signalsurf-ai/signalsurf-agent/${commit}/plugins/signalsurf/`
    assert.ok(url.startsWith(prefix), `unexpected release URL: ${url}`)
    const name = decodeURIComponent(url.slice(prefix.length))
    assert.ok(files.has(name), `unexpected release file: ${name}`)
    return new Response(files.get(name))
  }
  return {
    directory,
    installed,
    published,
    setVersion,
    files,
    tree,
    calls,
    fetchImpl,
  }
}

test("checks on every request even when the published version is not newer", async (t) => {
  const f = updaterFixture(t)
  f.setVersion(f.installed, "2.0.0")
  for (let count = 0; count < 2; count++) {
    const result = await ensureCurrent({
      root: f.installed,
      fetchImpl: f.fetchImpl,
    })
    assert.equal(result.status, "current")
    assert.equal(result.current_version, "2.0.0")
    assert.equal(result.latest_version, "1.1.0")
  }
  assert.equal(f.calls.length, 2)
  assert.equal(
    JSON.parse(readFileSync(path.join(f.installed, "plugin.json"))).version,
    "2.0.0"
  )
})

test("automatically replaces the complete plugin and requires reloading updated guidance", async (t) => {
  const f = updaterFixture(t)
  writeFileSync(
    path.join(
      f.installed,
      "skills/signalsurf/references/operating-contract.md"
    ),
    "old contract"
  )
  mkdirSync(path.join(f.installed, "skills/retired"))
  writeFileSync(path.join(f.installed, "skills/retired/SKILL.md"), "obsolete")
  const result = await ensureCurrent({
    root: f.installed,
    fetchImpl: f.fetchImpl,
  })
  assert.equal(result.status, "updated")
  assert.equal(result.installed_version, "1.1.0")
  assert.equal(result.current_version, "1.1.0")
  assert.equal(result.previous_version, "1.0.0")
  assert.equal(result.update_available, false)
  assert.equal(result.reload_required, true)
  for (const [name, bytes] of f.files)
    assert.deepEqual(readFileSync(path.join(f.installed, name)), bytes, name)
  assert.equal(existsSync(path.join(f.installed, "skills/retired")), false)
  assert.equal(
    existsSync(path.join(f.directory, ".signalsurf.update-lock")),
    false
  )
})

test("keeps the old installation intact when a release download fails", async (t) => {
  const f = updaterFixture(t)
  const result = await ensureCurrent({
    root: f.installed,
    fetchImpl: async (url, options) => {
      if (url.endsWith("skills/signalsurf/SKILL.md"))
        return new Response("unavailable", { status: 503 })
      return f.fetchImpl(url, options)
    },
  })
  assert.equal(result.status, "unavailable")
  assert.equal(result.reason, "release_http_503")
  assert.equal(
    JSON.parse(readFileSync(path.join(f.installed, "plugin.json"))).version,
    "1.0.0"
  )
  assert.equal(
    existsSync(path.join(f.directory, ".signalsurf.update-lock")),
    false
  )
})

test("rejects tampered release bytes before replacing any installed files", async (t) => {
  const f = updaterFixture(t)
  const result = await ensureCurrent({
    root: f.installed,
    fetchImpl: async (url, options) => {
      if (url.endsWith("skills/signalsurf/SKILL.md"))
        return new Response("tampered")
      return f.fetchImpl(url, options)
    },
  })
  assert.equal(result.reason, "release_integrity_mismatch")
  assert.equal(
    JSON.parse(readFileSync(path.join(f.installed, "plugin.json"))).version,
    "1.0.0"
  )
})

test("refuses incomplete or unsafe release trees", async (t) => {
  for (const mutation of [
    (tree) =>
      tree.splice(
        tree.findIndex((entry) =>
          entry.path.endsWith("scripts/ensure-current.mjs")
        ),
        1
      ),
    (tree) => {
      tree[0].path = "plugins/signalsurf/../../outside"
    },
    (tree) => {
      tree[0].mode = "120000"
    },
  ]) {
    const f = updaterFixture(t)
    mutation(f.tree)
    const result = await ensureCurrent({
      root: f.installed,
      fetchImpl: f.fetchImpl,
    })
    assert.equal(result.status, "unavailable")
    assert.equal(
      JSON.parse(readFileSync(path.join(f.installed, "plugin.json"))).version,
      "1.0.0"
    )
  }
})

test("does not replace a source checkout or delete another update's lock", async (t) => {
  const f = updaterFixture(t)
  mkdirSync(path.join(f.directory, ".git"))
  assert.equal(
    (await ensureCurrent({ root: f.installed, fetchImpl: f.fetchImpl })).status,
    "source_checkout"
  )
  rmSync(path.join(f.directory, ".git"), { recursive: true })
  const lock = path.join(f.directory, ".signalsurf.update-lock")
  mkdirSync(lock)
  writeFileSync(path.join(lock, "owner"), "another request")
  assert.equal(
    (await ensureCurrent({ root: f.installed, fetchImpl: f.fetchImpl })).status,
    "update_in_progress"
  )
  assert.equal(
    readFileSync(path.join(lock, "owner"), "utf8"),
    "another request"
  )
  assert.equal(
    JSON.parse(readFileSync(path.join(f.installed, "plugin.json"))).version,
    "1.0.0"
  )
})

test("preserves edits made while an update downloads", async (t) => {
  const f = updaterFixture(t)
  const rootSkill = path.join(f.installed, "skills/signalsurf/SKILL.md")
  const result = await ensureCurrent({
    root: f.installed,
    fetchImpl: async (url, options) => {
      if (url.endsWith("skills/signalsurf/SKILL.md"))
        writeFileSync(rootSkill, "concurrent local edit")
      return f.fetchImpl(url, options)
    },
  })
  assert.equal(result.reason, "installation_changed_during_update")
  assert.equal(readFileSync(rootSkill, "utf8"), "concurrent local edit")
  assert.equal(
    JSON.parse(readFileSync(path.join(f.installed, "plugin.json"))).version,
    "1.0.0"
  )
})

test("rolls back the complete installation if the prepared package cannot be moved into place", async (t) => {
  const f = updaterFixture(t)
  const move = fs.renameSync
  const replacement = t.mock.method(fs, "renameSync", (from, to) => {
    if (path.basename(from).startsWith("release-"))
      throw new Error("simulated_swap_failure")
    return move(from, to)
  })
  syncBuiltinESMExports()
  try {
    const result = await ensureCurrent({
      root: f.installed,
      fetchImpl: f.fetchImpl,
    })
    assert.equal(result.status, "unavailable")
    assert.equal(result.reason, "simulated_swap_failure")
    assert.equal(
      JSON.parse(readFileSync(path.join(f.installed, "plugin.json"))).version,
      "1.0.0"
    )
    assert.equal(
      existsSync(path.join(f.directory, ".signalsurf.update-lock")),
      false
    )
  } finally {
    replacement.mock.restore()
    syncBuiltinESMExports()
  }
})

test("preserves a recoverable previous package if rollback itself fails", async (t) => {
  const f = updaterFixture(t)
  const move = fs.renameSync
  const replacement = t.mock.method(fs, "renameSync", (from, to) => {
    if (to === f.installed) throw new Error("simulated_target_failure")
    return move(from, to)
  })
  syncBuiltinESMExports()
  try {
    const result = await ensureCurrent({
      root: f.installed,
      fetchImpl: f.fetchImpl,
    })
    assert.equal(result.status, "recovery_required")
    assert.equal(
      JSON.parse(
        readFileSync(path.join(result.previous_installation, "plugin.json"))
      ).version,
      "1.0.0"
    )
    assert.equal(existsSync(f.installed), false)
    assert.equal(
      existsSync(path.join(f.directory, ".signalsurf.update-lock")),
      true
    )
  } finally {
    replacement.mock.restore()
    syncBuiltinESMExports()
  }
})

test("reports freshness as unknown when the public release check cannot be reached", async (t) => {
  const f = updaterFixture(t)
  const result = await ensureCurrent({
    root: f.installed,
    fetchImpl: async () => {
      throw new Error("offline")
    },
  })
  assert.equal(result.status, "unavailable")
  assert.equal(result.update_available, null)
  assert.equal(
    JSON.parse(readFileSync(path.join(f.installed, "plugin.json"))).version,
    "1.0.0"
  )
})

test("does not reinstall an equal version", async (t) => {
  const f = updaterFixture(t)
  f.setVersion(f.installed, "1.1.0")
  const result = await ensureCurrent({
    root: f.installed,
    fetchImpl: f.fetchImpl,
  })
  assert.equal(result.status, "current")
  assert.equal(result.update_available, false)
  assert.equal(f.calls.length, 1)
  assert.equal(
    existsSync(path.join(f.directory, ".signalsurf.update-lock")),
    false
  )
})

test("recovers broken installed guidance only through a verified forward patch and requires reload", async (t) => {
  const bad = updaterFixture(t)
  const skill = "skills/signalsurf/SKILL.md"
  const rootSkill = path.join(bad.installed, skill)
  const publishGuidance = (release, reference) => {
    const bytes = Buffer.from(
      "---\nname: signalsurf\ndescription: Use SignalSurf safely.\n---\n\n" +
        `Before product operations, read the [required operating contract](${reference}).\n`
    )
    // The broken reference has a valid blob identity; this is not corrupt transport.
    release.files.set(skill, bytes)
    const entry = release.tree.find((entry) => entry.path === `plugins/signalsurf/${skill}`)
    entry.size = bytes.length
    entry.sha = createHash("sha1")
      .update(`blob ${bytes.length}\0`)
      .update(bytes)
      .digest("hex")
  }
  const readRequiredContract = () => {
    const reference = readFileSync(rootSkill, "utf8").match(
      /\[required operating contract\]\(([^)]+)\)/
    )?.[1]
    assert.ok(reference, "the installed Skill must identify its required contract")
    return readFileSync(path.resolve(path.dirname(rootSkill), reference), "utf8")
  }
  const unrelated = new Map([
    ["host-settings.json", Buffer.from('{"theme":"dark","workspace":"local"}\n')],
    ["other-plugin/SKILL.md", Buffer.from("Unrelated installed guidance.\n")],
  ])
  for (const [name, bytes] of unrelated) {
    const file = path.join(bad.directory, name)
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, bytes)
  }
  const assertPreserved = () => {
    for (const [name, bytes] of unrelated)
      assert.deepEqual(readFileSync(path.join(bad.directory, name)), bytes, name)
    assert.equal(existsSync(path.join(bad.directory, ".signalsurf.update-lock")), false)
  }
  const assertInstalled = (release) => {
    for (const [name, bytes] of release.files)
      assert.deepEqual(readFileSync(path.join(bad.installed, name)), bytes, name)
  }

  publishGuidance(bad, "references/missing-operating-contract.md")
  assert.equal(bad.files.has("skills/signalsurf/references/missing-operating-contract.md"), false)
  const installedBad = await ensureCurrent({ root: bad.installed, fetchImpl: bad.fetchImpl })
  assert.equal(installedBad.status, "updated")
  assert.equal(installedBad.installed_version, "1.1.0")
  assert.equal(installedBad.reload_required, true)
  assertInstalled(bad)
  assert.throws(readRequiredContract, { code: "ENOENT" })
  assertPreserved()

  const sameVersion = updaterFixture(t, "1.1.0", "c".repeat(40))
  publishGuidance(sameVersion, "references/operating-contract.md")
  const unchanged = await ensureCurrent({ root: bad.installed, fetchImpl: sameVersion.fetchImpl })
  assert.equal(unchanged.status, "current")
  assert.equal(unchanged.current_version, "1.1.0")
  assert.equal(unchanged.latest_version, "1.1.0")
  assert.equal(unchanged.update_available, false)
  assert.equal(unchanged.reload_required, undefined)
  assert.equal(sameVersion.calls.length, 1, "equal versions stop after the version check")
  assertInstalled(bad)
  assert.throws(readRequiredContract, { code: "ENOENT" })
  assertPreserved()

  const patch = updaterFixture(t, "1.1.1", "b".repeat(40))
  publishGuidance(patch, "references/operating-contract.md")
  const tampered = await ensureCurrent({
    root: bad.installed,
    fetchImpl: (url, options) =>
      url.endsWith(skill)
        ? new Response("unverified recovery guidance")
        : patch.fetchImpl(url, options),
  })
  assert.equal(tampered.status, "unavailable")
  assert.equal(tampered.reason, "release_integrity_mismatch")
  assertInstalled(bad)
  assert.throws(readRequiredContract, { code: "ENOENT" })
  assertPreserved()

  const recovered = await ensureCurrent({ root: bad.installed, fetchImpl: patch.fetchImpl })
  assert.equal(recovered.status, "updated")
  assert.equal(recovered.previous_version, "1.1.0")
  assert.equal(recovered.installed_version, "1.1.1")
  assert.equal(recovered.current_version, "1.1.1")
  assert.equal(recovered.release_commit, "b".repeat(40))
  assert.equal(recovered.update_available, false)
  assert.equal(recovered.reload_required, true)
  assertInstalled(patch)
  assert.equal(readRequiredContract(), patch.files.get("skills/signalsurf/references/operating-contract.md").toString())
  assertPreserved()
})

test("keeps the newer installation when an older concurrent check acquires the lock later", async (t) => {
  const older = updaterFixture(t)
  const newer = updaterFixture(t, "1.2.0")
  let releaseOlder
  let signalPinned
  const pinned = new Promise((resolve) => {
    signalPinned = resolve
  })
  const resume = new Promise((resolve) => {
    releaseOlder = resolve
  })
  const olderCheck = ensureCurrent({
    root: older.installed,
    fetchImpl: async (url, options) => {
      if (url.endsWith(`${"a".repeat(40)}/plugins/signalsurf/plugin.json`)) {
        signalPinned()
        await resume
      }
      return older.fetchImpl(url, options)
    },
  })
  await pinned
  try {
    const newerCheck = await ensureCurrent({
      root: older.installed,
      fetchImpl: newer.fetchImpl,
    })
    assert.equal(newerCheck.status, "updated")
    assert.equal(newerCheck.installed_version, "1.2.0")
  } finally {
    releaseOlder()
  }
  const stale = await olderCheck
  assert.equal(stale.status, "current")
  assert.equal(stale.current_version, "1.2.0")
  assert.equal(stale.update_available, false)
  assert.equal(
    JSON.parse(readFileSync(path.join(older.installed, "plugin.json"))).version,
    "1.2.0"
  )
})

test("reclaims an interrupted update owned by a dead local process", async (t) => {
  const f = updaterFixture(t)
  const lock = path.join(f.directory, ".signalsurf.update-lock")
  mkdirSync(lock)
  writeFileSync(
    path.join(lock, "owner-dead-owner.json"),
    JSON.stringify({
      pid: 2147483647,
      host: hostname(),
      token: "dead-owner",
      created_at: new Date(0).toISOString(),
    })
  )
  writeFileSync(
    path.join(lock, "release-dead-owner-partial"),
    "incomplete download"
  )
  const result = await ensureCurrent({
    root: f.installed,
    fetchImpl: f.fetchImpl,
  })
  assert.equal(result.status, "updated")
  assert.equal(result.installed_version, "1.1.0")
  assert.equal(existsSync(lock), false)
})

test("preserves locks owned by a live or foreign process", async (t) => {
  for (const host of [hostname(), "another-machine"]) {
    const f = updaterFixture(t)
    const lock = path.join(f.directory, ".signalsurf.update-lock")
    mkdirSync(lock)
    const owner = JSON.stringify({
      pid: process.pid,
      host,
      token: "live-owner",
      created_at: new Date().toISOString(),
    })
    writeFileSync(path.join(lock, "owner-live-owner.json"), owner)
    assert.equal(
      (await ensureCurrent({ root: f.installed, fetchImpl: f.fetchImpl }))
        .status,
      "update_in_progress"
    )
    assert.equal(
      readFileSync(path.join(lock, "owner-live-owner.json"), "utf8"),
      owner
    )
  }
})

test("preserves the previous installation from an interrupted swap", async (t) => {
  const f = updaterFixture(t)
  const lock = path.join(f.directory, ".signalsurf.update-lock")
  mkdirSync(lock)
  writeFileSync(
    path.join(lock, "owner-dead-owner.json"),
    JSON.stringify({
      pid: 2147483647,
      host: hostname(),
      token: "dead-owner",
      created_at: new Date(0).toISOString(),
    })
  )
  fs.renameSync(f.installed, path.join(lock, "previous-dead-owner"))
  const result = await ensureCurrent({
    root: f.installed,
    fetchImpl: f.fetchImpl,
  })
  assert.equal(result.status, "recovery_required")
  assert.equal(
    JSON.parse(
      readFileSync(path.join(result.previous_installation, "plugin.json"))
    ).version,
    "1.0.0"
  )
  assert.equal(f.calls.length, 0)
})

test("a stale reclaimer cannot delete a newly acquired lock generation", async (t) => {
  const f = updaterFixture(t)
  const lock = path.join(f.directory, ".signalsurf.update-lock")
  mkdirSync(lock)
  writeFileSync(
    path.join(lock, "owner-dead-owner.json"),
    JSON.stringify({
      pid: 2147483647,
      host: hostname(),
      token: "dead-owner",
      created_at: new Date(0).toISOString(),
    })
  )
  const remove = fs.rmdirSync
  let replaced = false
  const replacement = t.mock.method(fs, "rmdirSync", (target) => {
    if (target === lock && !replaced) {
      replaced = true
      const prepared = mkdtempSync(path.join(f.directory, "fresh-"))
      writeFileSync(
        path.join(prepared, "owner-fresh.json"),
        JSON.stringify({
          pid: process.pid,
          host: hostname(),
          token: "fresh",
          created_at: new Date().toISOString(),
        })
      )
      fs.renameSync(prepared, lock)
    }
    return remove(target)
  })
  syncBuiltinESMExports()
  try {
    const result = await ensureCurrent({
      root: f.installed,
      fetchImpl: f.fetchImpl,
    })
    assert.equal(result.status, "update_in_progress")
    assert.equal(
      JSON.parse(readFileSync(path.join(lock, "owner-fresh.json"))).pid,
      process.pid
    )
  } finally {
    replacement.mock.restore()
    syncBuiltinESMExports()
  }
})

test("a completed request's timeout cannot abort later release downloads", async (t) => {
  const f = updaterFixture(t)
  const deadlines = []
  t.mock.method(AbortSignal, "timeout", () => {
    const deadline = new AbortController()
    deadlines.push(deadline)
    return deadline.signal
  })
  let calls = 0
  const result = await ensureCurrent({
    root: f.installed,
    fetchImpl: async (url, options) => {
      if (++calls === 2) deadlines[0].abort()
      if (options.signal.aborted) throw new Error("release_request_aborted")
      return f.fetchImpl(url, options)
    },
  })
  assert.equal(result.status, "updated")
  assert.equal(result.installed_version, "1.1.0")
})


test("update preserves the complete MIT notice", async t => {
 const f = updaterFixture(t)
 const result = await ensureCurrent({root:f.installed, fetchImpl:f.fetchImpl})
 assert.equal(result.status, "updated")
 assert.equal(readFileSync(path.join(f.installed,"LICENSE"),"utf8"), readFileSync(path.join(DEFAULT_DISTRIBUTION_ROOT,"LICENSE"),"utf8"))
})
test("an update without its notice is rejected before replacing the installation", async t => {
 const f = updaterFixture(t)
 f.tree.splice(f.tree.findIndex(entry => entry.path === "plugins/signalsurf/LICENSE"),1)
 const result=await ensureCurrent({root:f.installed,fetchImpl:f.fetchImpl})
 assert.equal(result.status,"unavailable")
 assert.equal(result.reason,"incomplete_release_package")
 assert.equal(JSON.parse(readFileSync(path.join(f.installed,"plugin.json"))).version,"1.0.0")
})
