---
name: sheets
description: Use for Signalsurf Sheets, rows, fields, schemas, templates, views, charts, notes, imports, or temporary operational data.
---

# Signalsurf Sheets

Before every request using this Skill, follow [version check and automatic update](../signalsurf/references/freshness.md), then use the current guidance.

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

Sheets are flexible operational workspaces; they are not the durable identity-resolved CRM.

1. Use `table_query` to resolve the Sheet and inspect its schema before row or schema work.
2. Prefer `table_templates` before designing a common Sheet from scratch.
3. Use `table_manage` for the container/schema, `table_views` for views/charts, and `item_query` / `item_manage` for rows, notes, and retained results.
4. Preserve unknown fields and current view configuration. Read field history only for provenance or conflicts, not on every turn.
5. A routine row edit needs no Thread. Business Sheet/row mutations carry top-level work `projectId`, independently of File placement or Surfer ownership. Preserve lease/revision conflict handling; use `project_file_authority` only for explicitly requested Project File grants, revision history or conflicts, never automatically to make context selection succeed.

For lookup-based completion of supported existing columns, read [native Enrich](../signalsurf/references/enrichment.md). It owns exact Sheet selection/bindings, approval, cost, preservation and run/readback rules. Supplied facts and deterministic edits use ordinary updates.

For collected Listening Engagers, use the existing managed Sheet. Preserve its locked source and identity fields, including Profile type (Person, Company or Unknown), the single Source column containing the matched keyword or tracked account. Keep company profiles and missing-data rows; follower captions are not headlines. Never fabricate a LinkedIn URL from an untyped numeric ID. Add custom Enrich, scoring and labels according to the user’s intended use. Research stays in the Sheet until the user explicitly selects rows for native Records import. Import resolves durable identities and preserves source links; only then can Campaign work use those Records. Do not delete low-scoring or incomplete candidates, automatically create CRM Records, or infer enrichment/outreach approval from collection.
