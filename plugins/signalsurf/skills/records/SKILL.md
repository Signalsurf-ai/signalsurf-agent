---
name: records
description: Use for SignalSurf CRM Records, Lists, exact member Enrich, identity, history, schema or views. Supplied-fact edits use ordinary updates; public research uses Signals.
---

# SignalSurf Records

Before every request using this Skill, follow [version check and automatic update](../signalsurf/references/freshness.md). Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded.

Records hold durable identity-resolved CRM facts; [Sheets](../sheets/SKILL.md) hold flexible operational rows. Resolve the collection with `object_query`, then exact targets with `record_query` or `list_query`; never guess IDs. A collection schema is not a Record read. Reuse canonical `objectId`/`recordId`; never reinterpret them as Sheet `tableId`/`itemId`.

1. Inspect current state before consequential updates; preserve unrelated fields. Use `object_manage` for collection/schema work, `record_manage` for entity changes, and `list_manage`/`list_membership` for audience configuration or membership. Supplied facts and deterministic edits use ordinary updates, without research or Enrich.
2. Carry the selected work `projectId` on business mutations independently of Commons placement or Thread writeback; schema administration follows native action scope. Keep routine edits in Record history. Shared writeback follows the operating contract only when material or explicitly requested.
3. Read back the changed identities, fields, membership or native state before reporting completion.

Read only the branch matching the request:

- Personalized drafts from existing Records: read the exact requested Records, then use [Writing](../writing/SKILL.md) to compose in this host. Stop at the requested draft; no Campaign, sender connection or Enrich is needed merely to write from stored facts.
- Lookup-based completion of existing fields: [native Enrich](../signalsurf/references/enrichment.md) owns exact Record/List/Sheet selection, bindings, approvals and readback. A List grant never becomes generic Record or collection-wide authority.
- Stored changes, provenance or communication history: [history and communications](references/history.md).
- Requested collection/schema, List process-field or List view changes: [schema and views](references/schema-and-views.md).
- Researched Person/Company capture: [research and capture](../signalsurf/references/research-capture.md). Email and Company-first are not generic Person prerequisites.
- Whole-List deletion or uncertain deletion: [native File lifecycle](../signalsurf/references/file-lifecycle.md). Discover exact `list_manage` action `delete`; membership or `view_delete` does not delete a List, and deleting a List preserves its backing Records.

To save a sourced Email for a known Record whose Email identity is empty, use `record_manage` action `update` on that exact Record. The server normalizes and claims it atomically with manual provenance; it remains unverified. Read the Record back. If the Email belongs to another Record or an existing identity differs, report the conflict and resolve the existing Records; do not create a duplicate to fill Email. Other declared identities, including a nonprimary LinkedIn identity, remain protected except for exact unchanged values.
