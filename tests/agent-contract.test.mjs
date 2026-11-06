import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import test from "node:test"
import { ROOT } from "../scripts/check.mjs"
import { checkAgentContract, contractIndex, guidanceIssues } from "../scripts/check-agent-contract.mjs"

const read = file => JSON.parse(readFileSync(resolve(ROOT, file), "utf8"))
const snapshot = read("docs/contracts/agent-contract.json")
const source = read("docs/contracts/source.json")

test("customer guidance and synthetic procedure names use the pinned public contract", () => {
  assert.equal(checkAgentContract().digest, snapshot.digest)
})

test("altered canonical schemas and stale source identities fail closed", () => {
  const changed = structuredClone(snapshot)
  changed.tools[0].description += " changed"
  assert.throws(() => contractIndex(changed, source), /digest mismatch/)
  assert.throws(() => contractIndex(snapshot, { ...source, digest: "0".repeat(64) }), /digest mismatch/)
})

test("served aliases cannot invent, omit or overlap canonical actions", () => {
  for (const mutate of [
    value => value.servedTools.phone_read = { canonical: "missing_query", actions: ["get"] },
    value => value.servedTools.workflow_templates_read.actions.push("invented_action"),
    value => value.servedTools.workflow_templates_read.actions.pop(),
    value => value.servedTools.workflow_templates_write.actions.push("search"),
    value => {
      value.servedTools.workflow_templates_read.actions = ["apply"]
      value.servedTools.workflow_templates_write.actions = ["describe", "search", "get"]
    },
  ]) {
    const changed = structuredClone(source)
    mutate(changed)
    assert.throws(() => contractIndex(snapshot, changed))
  }
})

test("retired readers, retired actions and invalid served actions are rejected", () => {
  const index = contractIndex(snapshot, source)
  for (const text of [
    "Use `conversations_query` for history.",
    "Use `message_send` action `new_call`.",
    "Use message_send.start_call.",
    "Use `meeting_preferences_read` action `get_object_sync`.",
    "Use `workflow_templates_read` action `apply`.",
    "Use `workflow_templates` to search.",
    "Use `invented_query` for results.",
  ]) assert(guidanceIssues(text, index, snapshot, source).length > 0, text)
  assert.deepEqual(guidanceIssues("Use `phone_manage` action `prepare`, then `phone_query` action `get`. Use contact_query as the search field.", index, snapshot, source), [])
})
