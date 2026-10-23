import assert from "node:assert/strict"
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"
import { check, ROOT, versionAdvance } from "../scripts/check.mjs"

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "signalsurf-public-check-"))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  cpSync(ROOT, root, { recursive: true, filter: file => ![".git", "node_modules"].includes(path.basename(file)) })
  return root
}
const editJson = (root, file, edit) => {
  const target = path.join(root, file), value = JSON.parse(readFileSync(target, "utf8"))
  edit(value)
  writeFileSync(target, JSON.stringify(value))
}

test("public clone validates without private source or credentials", () => assert.deepEqual(check(), []))

for (const [name, mutate, expected] of [
  ["malformed manifest", root => writeFileSync(path.join(root, "plugins/signalsurf/plugin.json"), "{"), /invalid JSON/],
  ["null manifest", root => writeFileSync(path.join(root, "plugins/signalsurf/plugin.json"), "null"), /invalid JSON/],
  ["host version drift", root => editJson(root, "plugins/signalsurf/.claude-plugin/plugin.json", value => value.version = "9.0.0"), /same version/],
  ["unapproved endpoint", root => editJson(root, "plugins/signalsurf/.mcp.json", value => value.mcpServers.signalsurf.url = "https://example.invalid/mcp"), /approved hosted endpoint/],
  ["credential-bearing MCP", root => editJson(root, "plugins/signalsurf/.mcp.json", value => value.mcpServers.signalsurf.headers = { Authorization: "placeholder" }), /without credentials/],
  ["unreviewed executable hook", root => editJson(root, "plugins/signalsurf/.claude-plugin/plugin.json", value => value.hooks = "./unexpected.sh"), /executable hook/],
  ["wrong marketplace path", root => editJson(root, ".claude-plugin/marketplace.json", value => value.plugins[0].source = "../other"), /canonical plugin/],
  ["incomplete license", root => writeFileSync(path.join(root, "plugins/signalsurf/LICENSE"), "MIT"), /complete canonical MIT notice/],
  ["missing installed notice", root => rmSync(path.join(root, "plugins/signalsurf/LICENSE")), /missing installed license/],
  ["bad frontmatter", root => writeFileSync(path.join(root, "plugins/signalsurf/skills/records/SKILL.md"), "# Missing metadata"), /frontmatter/],
  ["missing onboarding entrypoint", root => rmSync(path.join(root, "plugins/signalsurf/skills/onboarding"), { recursive: true }), /missing Skill|unexpected Skill discovery inventory/],
  ["missing relative reference", root => writeFileSync(path.join(root, "docs/broken.md"), "[Missing](missing.md)"), /unresolved relative Markdown link/],
  ["path outside package", root => writeFileSync(path.join(root, "plugins/signalsurf/skills/records/references.md"), "extra"), /unexpected plugin file/],
  ["unsafe source file", root => writeFileSync(path.join(root, ".env"), "placeholder"), /secret-bearing filename/],
  ["symlink", root => symlinkSync("README.md", path.join(root, "docs/linked.md")), /symlinks/],
  ["wrong catalog integrity", root => editJson(root, ".claude-plugin/https-marketplace.json", value => value.plugins[0].source.sha256 = "incorrect"), /immutable HTTPS archive/],
]) {
  test(`rejects ${name}`, t => {
    const root = fixture(t)
    mkdirSync(path.join(root, "docs"), { recursive: true })
    mutate(root)
    assert.match(check(root).join("\n"), expected)
  })
}

test("credential detector reports a location without leaking the value", t => {
  const root = fixture(t), value = ["ghp", "a".repeat(36)].join("_")
  writeFileSync(path.join(root, "README.md"), value)
  const output = check(root).join("\n")
  assert.match(output, /credential-shaped/)
  assert.equal(output.includes(value), false)
})

test("stable semantic version advances are monotonic", () => {
  for (const [base, current, valid] of [["0.7.15", "0.7.16", true], ["0.7.16", "0.7.16", false], ["1.2.3", "1.1.9", false], ["1.2.3", "2.0.0", true], ["1.2.3", "1.2.4-beta", false]]) assert.equal(versionAdvance(base, current), valid)
})
