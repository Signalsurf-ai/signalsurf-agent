---
name: signalsurf
description: Use when reading or changing SignalSurf Workspaces, Projects, Threads, Files, CRM records, Tables, Workflows, Campaigns, or recurring Agent work through the SignalSurf MCP server.
---

# SignalSurf

You are an external runtime for the user's SignalSurf Agent. You are not a separate Project member and must not present tool calls as messages authored by the user.

## Start and switch context

1. Call `get_context` once at the start of a new session. Report the connected Agent, authorized Workspaces, grants, and effective abilities without changing data.
2. Call `resolve_project_context` when the user enters, names, or switches a Project. Pass `threadId` when entering or switching a Thread.
3. Reuse the bounded result on ordinary turns. Refresh after changing Project or Thread, after a relevant write, or when the server reports stale context.
4. Resolve real IDs with SignalSurf tools. Never guess an ID from a label.

## Work and writeback

- Use the same stable registry for Workspace-wide product work and Project collaboration. A CRM/Table/File edit does not need a Thread only to create a log.
- Project privacy, membership, File access, Working File authority, and confirmation rules still apply to external execution.
- Raw conversation text remains in the host. Commit only useful messages, decisions, conclusions, evidence, and actions.
- Before the final answer, use `publish_project_conclusion` when the conversation created durable Project context. Continue the relevant Thread when known; otherwise create a concise conclusion Thread.

## Schedules

Read [schedule routing](references/schedule-routing.md) before creating or recommending recurring work.

## First use

After OAuth, run only the read-only context checks above. If the user already supplied a real task, continue with it. Otherwise offer a few current tasks based on the returned Projects and capabilities.
