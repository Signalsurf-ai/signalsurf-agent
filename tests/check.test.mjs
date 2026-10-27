import assert from "node:assert/strict"
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"
import { crc32 } from "node:zlib"
import { check, ROOT, SKILLS, versionAdvance } from "../scripts/check.mjs"

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
const editSkill = (root, skill, edit) => {
  const file = path.join(root, `plugins/signalsurf/skills/${skill}/SKILL.md`)
  writeFileSync(file, edit(readFileSync(file, "utf8")))
}

const removeLink = (text, href) => text.replaceAll(`](${href})`, "]")

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

for (const skill of SKILLS) {
  test(`requires the shared operating-contract link in ${skill}`, t => {
    const root = fixture(t)
    const href = skill === "signalsurf" ? "references/operating-contract.md" : "../signalsurf/references/operating-contract.md"
    editSkill(root, skill, text => removeLink(text, href))
    assert.match(check(root).join("\n"), new RegExp(`skills/${skill}/SKILL\\.md: Skill must link the shared operating contract`))
  })
}

for (const skill of ["signalsurf", "records", "content", "campaigns", "conversations", "listening"]) {
  test(`keeps Writing reachable for ${skill} copy work`, t => {
    const root = fixture(t)
    editSkill(root, skill, text => removeLink(text, "../writing/SKILL.md"))
    assert.match(check(root).join("\n"), /Skill must route copy work to Writing/)
  })
}

for (const reference of ["core", "voice", "email-outreach", "follow-up", "email-reply", "linkedin-post", "x-post", "public-reply", "direct-message", "connection-note", "chinese", "review", "template"]) {
  test(`keeps Writing's ${reference} procedure reachable`, t => {
    const root = fixture(t)
    editSkill(root, "writing", text => removeLink(text, `references/${reference}.md`))
    assert.match(check(root).join("\n"), new RegExp(`Writing Skill must route ${reference} guidance`))
  })
}

for (const [name, edit] of [
  ["missing unified reader", text => text.replaceAll("`conversations_query`", "the historical reader")],
  ["legacy Inbox reader", text => `${text}\nUse \`inbox_query\` for history.\n`],
  ["legacy Meeting reader", text => `${text}\nUse \`meeting_query\` for history.\n`],
]) {
  test(`rejects Conversations history guidance with ${name}`, t => {
    const root = fixture(t)
    editSkill(root, "conversations", edit)
    assert.match(check(root).join("\n"), /must use the unified conversations_query reader/)
  })
}

for (const reference of ["phone", "meeting-recorder"]) {
  test(`keeps Conversations' ${reference} safeguards reachable`, t => {
    const root = fixture(t)
    editSkill(root, "conversations", text => removeLink(text, `references/${reference}.md`))
    assert.match(check(root).join("\n"), new RegExp(`Conversations Skill must route ${reference} guidance`))
  })
}

for (const [name, mutate, expected] of [
  ["truncated", bytes => bytes.subarray(0, 24), /icon is not a valid PNG/],
  ["corrupt CRC", bytes => { bytes[29] ^= 1; return bytes }, /icon is not a valid PNG/],
  ["truncated chunk", bytes => bytes.subarray(0, bytes.length - 5), /icon is not a valid PNG/],
  ["trailing bytes", bytes => Buffer.concat([bytes, Buffer.from([0])]), /icon is not a valid PNG/],
  ["non-square", bytes => resizeIcon(bytes, 512, 498), /icon must be square/],
  ["too small", bytes => resizeIcon(bytes, 47, 47), /icon dimensions must be between 48 and 4096/],
  ["too large", bytes => resizeIcon(bytes, 4097, 4097), /icon dimensions must be between 48 and 4096/],
]) {
  test(`rejects a ${name} plugin icon`, t => {
    const root = fixture(t), file = path.join(root, "plugins/signalsurf/assets/icon.png")
    writeFileSync(file, mutate(readFileSync(file)))
    assert.match(check(root).join("\n"), expected)
  })
}

function resizeIcon(bytes, width, height) {
  bytes.writeUInt32BE(width, 16)
  bytes.writeUInt32BE(height, 20)
  bytes.writeUInt32BE(crc32(bytes.subarray(12, 29)), 29)
  return bytes
}

for (const [name, value] of [
  ["Google OAuth client secret", ["GOC", "SPX-", "a".repeat(24)].join("")],
  ["webhook secret", ["whsec", "b".repeat(32)].join("_")],
  ["webhook secret with slash", ["whsec_", "/", "c".repeat(31)].join("")],
]) {
  test(`rejects a bare ${name} without leaking its value`, t => {
    const root = fixture(t)
    writeFileSync(path.join(root, "plugins/signalsurf/README.md"), `Example\n${value}\n`)
    const output = check(root).join("\n")
    assert.match(output, /plugins\/signalsurf\/README\.md: credential-shaped content/)
    assert.equal(output.includes(value), false)
  })
}

for (const prefix of ["export ", "env ", ""]) {
  for (const name of ["SIGNALSURF_MCP_WEB_SERVICE_TOKEN", "SIGNALSURF_SUPABASE_SERVICE_ROLE_KEY", "private-key", "access_token"]) {
    test(`rejects ${prefix || "bare "}${name} credential assignment without exposing its value`, t => {
      const root = fixture(t), value = "a".repeat(24)
      writeFileSync(path.join(root, "plugins/signalsurf/README.md"), `${prefix}${name}=${value}\n`)
      const output = check(root).join("\n")
      assert.match(output, /credential-shaped content/)
      assert.equal(output.includes(value), false)
    })
  }
}

for (const mode of ["live", "test"]) {
  test(`rejects a Stripe ${mode} secret without exposing its value`, t => {
    const root = fixture(t), value = ["sk", mode, "a".repeat(24)].join("_")
    writeFileSync(path.join(root, "plugins/signalsurf/README.md"), `Example ${value}\n`)
    const output = check(root).join("\n")
    assert.match(output, /credential-shaped content/)
    assert.equal(output.includes(value), false)
  })
}

test("stable semantic version advances are monotonic", () => {
  for (const [base, current, valid] of [["0.7.15", "0.7.16", true], ["0.7.16", "0.7.16", false], ["1.2.3", "1.1.9", false], ["1.2.3", "2.0.0", true], ["1.2.3", "1.2.4-beta", false]]) assert.equal(versionAdvance(base, current), valid)
})
