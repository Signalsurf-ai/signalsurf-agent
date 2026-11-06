import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { ROOT, walk } from "./check.mjs"

const SEARCH_FILTER_FIELDS = new Set(["contact_query", "participant_query"])

export function contractIndex(snapshot, source) {
  assert.equal(snapshot.version, 1)
  const digest = createHash("sha256").update(JSON.stringify({ version: snapshot.version, tools: snapshot.tools, retired: snapshot.retired })).digest("hex")
  assert.equal(snapshot.digest, digest, "Public snapshot digest mismatch")
  assert.equal(source.digest, digest, "Pinned source digest mismatch")
  const index = new Map(snapshot.tools.map(tool => [tool.name, (tool.actions ?? []).map(action => action.name)]))
  assert.equal(index.size, snapshot.tools.length, "Duplicate canonical tool")
  const partitions = new Map()
  for (const [name, served] of Object.entries(source.servedTools)) {
    assert(index.has(served.canonical), `Unknown canonical tool ${served.canonical}`)
    assert(!index.has(name), `Duplicate served tool ${name}`)
    assert(served.actions.length > 0, `Empty served tool ${name}`)
    for (const action of served.actions) assert(index.get(served.canonical).includes(action), `Unknown served action ${name}.${action}`)
    index.set(name, served.actions)
    partitions.set(served.canonical, [...(partitions.get(served.canonical) ?? []), ...served.actions])
  }
  for (const [canonical, actions] of partitions) {
    assert.equal(new Set(actions).size, actions.length, `Overlapping served actions for ${canonical}`)
    assert.deepEqual([...actions].sort(), [...index.get(canonical)].sort(), `Incomplete served actions for ${canonical}`)
  }
  return index
}

export function capabilityProjection(index) {
  return Object.fromEntries([...index].map(([name, actions]) => [name, { actions }]))
}

export function guidanceIssues(text, index, snapshot, source) {
  const issues = []
  const tokens = new Set(text.match(/\b[a-z][a-z0-9]*(?:_[a-z0-9]+)*\b/g) ?? [])
  const splitCanonicals = new Set(Object.values(source.servedTools).map(tool => tool.canonical))
  for (const token of tokens) {
    if (Object.hasOwn(snapshot.retired, token)) issues.push(`Retired tool ${token}`)
    else if (splitCanonicals.has(token)) issues.push(`Use a served read/write tool instead of ${token}`)
    else if (!SEARCH_FILTER_FIELDS.has(token) && /_(?:query|manage|read|write|run|templates|views|preferences)$/.test(token) && !index.has(token)) issues.push(`Unknown tool-shaped reference ${token}`)
  }
  const normalized = text.replace(/[`"']/g, "")
  for (const match of normalized.matchAll(/\b([a-z][a-z0-9_]+)(?:\.([a-z][a-z0-9_]+)|\s+action\s+([a-z][a-z0-9_]+))\b/g)) {
    const [, tool, dotted, named] = match
    if (!index.has(tool)) continue
    const action = dotted ?? named
    if (Object.hasOwn(snapshot.retired, `${tool}.${action}`)) issues.push(`Retired action ${tool}.${action}`)
    else if (!index.get(tool).includes(action)) issues.push(`Unknown action ${tool}.${action}`)
  }
  return issues
}

export function checkAgentContract(root = ROOT) {
  const read = file => JSON.parse(readFileSync(resolve(root, file), "utf8"))
  const snapshot = read("docs/contracts/agent-contract.json")
  const source = read("docs/contracts/source.json")
  const index = contractIndex(snapshot, source)
  const fixture = read("evals/capability-fixture.json")
  assert.equal(fixture.provenance.kind, "published-agent-contract")
  assert.equal(fixture.provenance.snapshotDigest, source.digest)
  assert.deepEqual(fixture.capabilities, capabilityProjection(index), "Capability fixture drifted from the public snapshot")
  const issues = walk(root, "plugins/signalsurf/skills")
    .filter(file => file.endsWith(".md"))
    .flatMap(file => guidanceIssues(readFileSync(resolve(root, file), "utf8"), index, snapshot, source).map(issue => `${file}: ${issue}`))
  assert.deepEqual(issues, [], issues.join("\n"))
  return { digest: source.digest, canonicalTools: snapshot.tools.length, servedTools: Object.keys(source.servedTools).length }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(checkAgentContract()))
