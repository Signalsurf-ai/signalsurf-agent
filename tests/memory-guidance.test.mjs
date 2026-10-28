import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const contract = readFileSync(new URL("../plugins/signalsurf/skills/signalsurf/references/operating-contract.md", import.meta.url), "utf8")

test("Workspace Profile upsert and forget retain the opaque guard from the current read", () => {
  assert.match(contract, /Workspace Profile upsert and forget[^.]*live schema[^.]*`profileToken`[^.]*opaque token[^.]*memory_query[^.]*verbatim[^.]*`baseVersion: null`/)
  assert.match(contract, /Ordinary Memory uses[^.]*observed integer `baseVersion`[^.]*null[^.]*new ordinary subject/)
  assert.match(contract, /Forget remains[^.]*ordinary integer version or Workspace Profile token[^.]*affirmative reply[^.]*confirmationId/)
})
