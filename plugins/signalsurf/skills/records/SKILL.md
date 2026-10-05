---
name: records
description: Use for Signalsurf CRM Objects, People or Company Records, Lists, audiences, identity-resolved data, qualification, selection, or membership.
---

# Signalsurf Records

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

Use Records for durable CRM truth; use Tables for flexible temporary operational rows.

1. Resolve the collection with `object_query` and the target with `record_query` or `list_query`. Never guess ids.
2. Use `object_manage` only for collection/schema work, `record_manage` for durable entity changes, and `list_manage` or `list_membership` for audience configuration/membership.
3. Read current state immediately before a consequential update. Preserve fields outside the requested change and use field history only when provenance or a conflict matters.
4. Routine edits rely on Record history. Write to a Project Thread only when the result changes a hypothesis, creates reusable evidence/insight, or needs coordination.
5. Business Record mutations carry the selected work Project as top-level `projectId`, independently of Commons placement or Thread writeback. CRM schema administration follows its native action scope. Read [research and capture](../signalsurf/references/research-capture.md) when saving researched identities or Person + verified Company relations; email and Company-first are not generic Person prerequisites.
