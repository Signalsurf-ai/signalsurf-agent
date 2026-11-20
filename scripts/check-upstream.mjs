import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { isDeepStrictEqual, parseArgs } from "node:util"
import { ROOT, SEMVER } from "./check.mjs"
import { contractDigest, contractIndex, CONTRACT_URL } from "./check-agent-contract.mjs"

export function compareProduct({ plugin, pin, pinnedSnapshot, snapshot, productVersion }) {
  contractIndex(pinnedSnapshot, pin)
  const digest = contractDigest(snapshot)
  assert(SEMVER.test(plugin.version), "Invalid plugin version")
  if (productVersion !== null) assert(SEMVER.test(productVersion), "Invalid product version")
  if (pin.productVersion !== undefined) assert(SEMVER.test(pin.productVersion), "Invalid pinned product version")
  const before = new Map(pinnedSnapshot.tools.map(tool => [tool.name, tool]))
  const after = new Map(snapshot.tools.map(tool => [tool.name, tool]))
  const changedTools = [...new Set([...before.keys(), ...after.keys()])]
    .filter(name => !isDeepStrictEqual(before.get(name), after.get(name))).sort()
  const differences = []
  if (digest !== pin.digest) differences.push("contract-changed")
  if (!pin.productVersion) differences.push("plugin-has-no-product-version")
  if (productVersion === null) differences.push("upstream-version-unreported")
  if (pin.productVersion && productVersion && pin.productVersion !== productVersion) differences.push("product-version-changed")
  return {
    status: differences.length ? "review-required" : "baseline-match",
    differences, plugin, pinnedProduct: { version: pin.productVersion ?? null, digest: pin.digest },
    upstream: { version: productVersion, digest }, changedTools,
    retiredChanged: !isDeepStrictEqual(pinnedSnapshot.retired, snapshot.retired),
  }
}

async function main() {
  const { values } = parseArgs({ options: {
    "plugin-ref": { type: "string", default: "HEAD" },
    contract: { type: "string" },
    "product-version": { type: "string" },
  } })
  assert(Boolean(values.contract) === Boolean(values["product-version"]), "Provide --contract and --product-version together")
  const git = args => execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 })
  const commit = git(["rev-parse", "--verify", "--end-of-options", `${values["plugin-ref"]}^{commit}`]).trim()
  const json = path => JSON.parse(git(["show", `${commit}:${path}`]))
  const pin = json("docs/contracts/source.json")
  let snapshot, productVersion
  if (values.contract) {
    snapshot = JSON.parse(readFileSync(values.contract, "utf8"))
    productVersion = values["product-version"]
  } else {
    const response = await fetch(CONTRACT_URL, { signal: AbortSignal.timeout(20000), redirect: "error" })
    assert(response.ok, `Hosted contract returned HTTP ${response.status}`)
    snapshot = await response.json()
    productVersion = response.headers.get("x-signalsurf-product-version")
  }
  const report = compareProduct({
    plugin: { version: json("plugins/signalsurf/plugin.json").version, commit },
    pin, pinnedSnapshot: json("docs/contracts/agent-contract.json"), snapshot, productVersion,
  })
  console.log(JSON.stringify(report, null, 2))
  return report.differences.length ? 2 : 0
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = await main() }
  catch (error) { console.error(error.message); process.exitCode = 1 }
}
