---
name: projects
description: Use for SignalSurf Project discovery, Project Context, Channels, Threads, decisions, activity, members, delegations, or Working File authority.
---

# SignalSurf Projects

Follow the `signalsurf` operating contract. A Project is one durable Play, its in-product Surfer is the DRI, and each Thread is the coordination ledger for one piece of work.

1. Use `get_workspace_context` if Workspace context is absent or stale.
2. Resolve the Project with `project_query` actions `list`, `search`, or `get`; search active Threads before starting duplicate work.
3. Call `get_project_context` before contributing, and pass `threadId` when resuming one Thread.
4. Use `project_manage` action `post_channel_message` with no `threadId` to start a compact shared brief; include a `threadId` to add material evidence, progress, decisions, or outcomes.
5. Use `commander_query` only for real delegated/background work. Posting a message does not create a delegation.
6. Use `project_file_authority` only for explicit Working File ownership or conflict work. Routine reads do not require a lease.

Project messages are member-authored with SignalSurf client provenance. Do not speak as Surfer or paste the private host transcript.
