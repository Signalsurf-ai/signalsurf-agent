---
name: records
description: Use for Signalsurf CRM Objects, People or Company Records, Lists, audiences, identity-resolved data, qualification, selection, or membership.
---

# Signalsurf Records

Use Records for durable CRM truth; use Tables for flexible temporary operational rows.

1. Resolve the collection with `object_query` and the target with `record_query` or `list_query`. Never guess ids.
2. Use `object_manage` only for collection/schema work, `record_manage` for durable entity changes, and `list_manage` or `list_membership` for audience configuration/membership.
3. Read current state immediately before a consequential update. Preserve fields outside the requested change and use field history only when provenance or a conflict matters.
4. Routine edits rely on Record history. Write to a Project Thread only when the result changes a hypothesis, creates reusable evidence/insight, or needs coordination.
5. Pass top-level `projectId` when a Project owns the resulting work; do not bind unrelated CRM maintenance to a Project merely to create a log.
