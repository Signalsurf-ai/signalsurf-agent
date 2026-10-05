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
