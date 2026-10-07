---
name: tables
description: Use for Signalsurf Sheets/Tables, rows, fields, schemas, templates, views, charts, notes, imports, or temporary operational data.
---

# Signalsurf Tables

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

Tables are flexible operational workspaces; they are not the durable identity-resolved CRM.

1. Use `table_query` to resolve the Sheet and inspect its schema before row or schema work.
2. Prefer `table_templates` before designing a common Sheet from scratch.
3. Use `table_manage` for the container/schema, `table_views` for views/charts, and `item_query` / `item_manage` for rows, notes, and retained results.
4. Preserve unknown fields and current view configuration. Read field history only for provenance or conflicts, not on every turn.
5. A routine row edit needs no Thread. Business Table/row mutations carry top-level work `projectId`, independently of File placement or Surfer ownership. Preserve lease/revision conflict handling; use `project_file_authority` only for explicit ownership/conflict work, never automatically to make context selection succeed.

For requested lookup-based completion of supported existing columns, inspect the schema and `enrichment_query` action `list`, then prefer native Enrich over separate research and updates for each row. Reuse its exact saved field key and instruction. Use `enrichment_manage` action `enable` only for a missing binding or an approved settings change, then `enrichment_run` action `run` on the requested selection or supported Table scope. Preserve existing cells unless refresh was requested; automatic runs require their own request. Inspect returned confirmation and credit bounds. Queued work is not completed field data: use its returned run IDs for status and read back the requested cells. Pure research, supplied facts and deterministic edits do not require a binding; primary/protected or unsupported fields do not become eligible by changing the research method.
