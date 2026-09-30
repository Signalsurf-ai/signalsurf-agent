---
name: tables
description: Use for SignalSurf Sheets/Tables, rows, fields, schemas, templates, views, charts, notes, imports, or temporary operational data.
---

# SignalSurf Tables

Tables are flexible operational workspaces; they are not the durable identity-resolved CRM.

1. Use `table_query` to resolve the Sheet and inspect its schema before row or schema work.
2. Prefer `table_templates` before designing a common Sheet from scratch.
3. Use `table_manage` for the container/schema, `table_views` for views/charts, and `item_query` / `item_manage` for rows, notes, and retained results.
4. Preserve unknown fields and current view configuration. Read field history only for provenance or conflicts, not on every turn.
5. A routine row edit needs no Thread. Bind a Project with top-level `projectId` when the Sheet is a Working File for that Play; use `project_file_authority` for competing writes.
