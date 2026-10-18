---
name: projects
description: Use for Signalsurf Project discovery, Project Context, Channels, Threads, decisions, Activity, Routines, members, delegations, or Working File authority.
---

# Signalsurf Projects

Before every request using this Skill, follow [version check and automatic update](../signalsurf/references/freshness.md), then use the current guidance.

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

Follow the `signalsurf` operating contract. A Project is one durable Play, its in-product Surfer is the DRI, and each Thread is the coordination ledger for one piece of work.

1. Use `get_workspace_context` if Workspace context is absent or stale.
2. Resolve the Project with `project_query` actions `list`, `search`, or `get`, and load `get_project_context` when entering/resuming/switching work. A known `threadId` for existing durable work may be read before execution; routine operations do not search Threads to leave a log.
3. Execute the requested work and verify its resource result. Selecting a Project does not imply creating a Thread. Completing an operation does not imply posting an update.
4. Choose exactly one route: **No Project writeback** for reads/private exploration/routine mutations without material shared change; **Reply to existing Thread** once with its exact `threadId` for material evidence, decision, correction, blocker, outcome or handoff on the same objective/question; **Start new Thread** only for material/distinct work with no suitable Thread and ongoing coordination across people/time. Consider shared writeback only after this decision, then deduplicate using bounded known/recent Threads or search by objective, not title. An explicit save still reuses matching work and may reply even for a routine result. Use `project_manage` action `post_channel_message` only as the selected reply/start result. For a new root omit the existing Thread target, using null if the live schema requires a nullable `threadId`. If an explicit save fits neither Thread route, keep the result in the host/resource history and ask for the intended shared objective or destination; never invent coordination. Honor explicit no-post instructions. Publish no acknowledgement, private reasoning, raw transcript, tool receipt or intermediate steps; routine edits use resource history.
5. Use `commander_query` only for real delegated/background work. Posting a message does not create a delegation.
6. Use `project_file_authority` only for explicitly requested Project File grants, revision history or conflict work. Claim adds an independent write grant for that Project; release removes only that grant, and transfer is unsupported. Never add a grant automatically to make context selection succeed. Routine reads do not require a lease.

Project messages are member-authored with Signalsurf client provenance. Do not speak as Surfer or paste the private host transcript.

Inspect Project Operation access and effective approval policy before business work. Inbox, Meetings and Content selection is separate from Workspace entitlement, OAuth and actual account/resource access; always_allow still follows native confirmations. The context snapshot is bounded; inspect additional Files/Threads only when needed and refresh after relevant settings change.

Read Project File Access with project_query action access when selection is missing or unclear. A new Project starts without selected Operations or Records collections. Change an explicitly requested Inbox/messages, Meetings/meeting, Content/content or Records collection selection with project_manage action access and its exact confirmation; Project manager authority is required, and Records selection also requires Workspace Admin. Do not claim MCP cannot change these settings or send the user to the UI when this capability is available. An attached List exposes its backing Records dependency for that List's members; it does not select the whole collection or unrelated Records. Removing a List preserves independently selected Records. Collection-wide edits require explicit collection access; List enrichment bindings, reads and exact member runs use their validated List scope.

For requested one-time, recurring or autonomous Project work, read [schedule routing](../signalsurf/references/schedule-routing.md), inspect matching Routines, and use routine_query to list existing work and routine_manage action configure to create, update, pause, resume or delete. Its timing.type is once with fireAt and timezone, or recurring with cron and timezone plus optional repeatEvery. Both types use this same tool. Enable Surfer participation for AI work and save the complete instruction, resource scope, cadence/timezone, limits and durable result destination. Verify persistence; posting a Thread alone does not configure recurring work. Each scheduled Surfer run completes its own task and records meaningful results without requiring the external AI to be prompted again.

For a Routine's Related members, read project_query action members and configure audienceUserIds using current human Project member IDs. The schedule routing reference covers exact mutation fields, one-time tasks that already fired and the distinction between saved configuration and execution proof.
