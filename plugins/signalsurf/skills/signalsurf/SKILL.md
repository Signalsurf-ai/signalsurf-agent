---
name: signalsurf
description: Signalsurf operating contract and intent routing. Use for work across Workspace/Project context, Files and Records, research, Inbox, automation, publishing or reusable procedures; load only the focused guidance needed for the requested outcome.
---

# Working with Signalsurf

Read the [shared operating contract](references/operating-contract.md) when it is not already loaded. It applies even when a focused Skill was selected first. You act as the authenticated member; external execution does not impersonate the in-product Surfer.

## Choose work context naturally

Use `get_workspace_context` when context is missing or stale. Use `project_query` to resolve relevant existing work and `get_project_context` when entering, resuming or genuinely switching that work. Reuse bounded context. A named reference is not automatically a switch. Ask about the business ambiguity only when it would materially change the result; do not make the user recite IDs, approve every routine step, or listen to a full context inventory.

Project context, target File, execution method, and result destination are independent. Business actions and File content edits carry the required work `projectId`; pure authorized reads may span Projects. Selecting a Project never transfers a File or grants access. Inbox/Outbox work, including personal sends and schedules, requires the selected Project's Messages access and approvals. Meeting and Content use the same Project selection checks. Connections and Workspace administration retain their native scope. Routine File operations execute directly without manufacturing a Thread or Run. Native member File deletion follows the resolved action’s Workspace lifecycle scope and current resource authority; historical Project attachment does not require entering that Project. Preserve native permissions, target confirmation, revisions and dependencies. File editor ownership does not grant Workspace Admin; do not claim ownership to bypass a deletion failure. Use the exact delete action for the File kind, and verify the result. A List deletion preserves its backing Records. Delegated background execution retains its own Project and File authority.

Read `project_query` action `access` for configured Files, Operations and List dependencies. For a requested selection change, use `project_manage` action `access`, its manager confirmation and current authority; load `projects` for the full procedure. New Projects have no default Operation or Records selection. A List dependency covers member-scoped work, not every Record in its backing collection.

## Find the procedure by the desired outcome

Read only relevant focused guidance before applying it; one outcome can cross domains. `find_capabilities` supplies live capability names and `inputSchema`. Call an exposed tool directly or use `invoke_capability` with the exact returned name and arguments. Do not memorize an operation inventory or guess internal providers.

| Desired outcome                                                                             | Focused guidance                                                                                                             |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Research a known Person/profile and recent posts; optionally save verified Person + Company | [research and capture](references/research-capture.md), `signals`, then `records` only when capture is requested             |
| Source companies or People from an existing company source                                  | [lead sourcing](references/lead-sourcing.md), `signals`, and the selected `records` / `tables` destination                   |
| Fill supported existing Table columns, Records fields or List members with researched facts | `tables` / `records` and `signals`; inspect and reuse native Enrich bindings and preserve the requested Record or List scope |
| Send, reply, schedule or cancel a personal Email/message                                    | [personal schedule](references/personal-schedule.md) and `inbox`                                                             |
| Monitor public content or capture a requested audience                                      | `listening` and the requested `records` destination                                                                          |
| Create or run repeatable processing                                                         | `workflows`; use its real saved graph, limits and run state                                                                  |
| Write, review or rewrite standalone prose, email, posts or replies                          | [writing](../writing/SKILL.md); load only the relevant purpose and channel                                                   |
| Draft/publish owned posts; manage Campaign outreach                                         | `content` or `campaigns` plus [writing](../writing/SKILL.md) for copy; publishing and activation remain separate actions     |
| Continue durable Project work, collaboration or a background task                           | `projects`; `commander_query` only for real delegations                                                                      |
| Explicit sources/documents, recordings, connected accounts, reusable procedures             | `knowledge`, `meetings`, `connections`, `custom-skills` respectively                                                         |

For lookup-based completion of existing persisted fields, inspect the destination schema and saved Enrich bindings before separate row-by-row research. Reuse native Enrich; configure only a missing binding or requested settings change. Records and Lists independently use their own Enrich bindings and exact selections. Record requests need no List; do not create one. A List request targets only its own fields; projected Record fields are read-only and require Records for editing or Enrich. List attachment grants no Record write authority. Pure research creates no Records or persistent Enrich configuration. Supplied facts, deterministic edits, primary/protected fields and unsupported fields do not mandate Enrich.

## Save the meaningful result

Choose exactly one route after work; `project_manage` action `post_channel_message` is used only for a selected reply/start route:

- **No Project writeback:** reads, private exploration and routine mutations remain in the current host/resource history when shared understanding or next steps do not change.
- **Reply to existing Thread:** material evidence, decisions, corrections, blockers, outcomes or handoffs for the same objective/question use the existing `threadId`, once.
- **Start new Thread:** material, distinct work with no suitable Thread and ongoing coordination across people/time starts one compact brief without an existing Thread target.

Selecting a Project does not imply creating a Thread; completing an operation does not imply posting. Before shared save, compare objectives rather than titles and reuse known/recent Threads or search; an explicit save still requires deduplication and may reply to existing work even for a routine result. Routine edits do not need Thread search and resource history stays authoritative. If an explicit save fits neither Thread route, keep the result in the host/resource history and ask for the intended shared objective or destination; never invent coordination. Honor explicit no-post instructions. Publish no acknowledgement, private reasoning, transcript, tool receipt or intermediate-step log. Project messages retain member provenance; governed Memory and reusable Skills remain separate.

Posting a message does not schedule background execution. Continue directly in the current host unless a real Task/delegation requires a handoff; inspect it with `commander_query`.

## Execute and verify

Use a new `operationId` for a distinct mutation and reuse it only for the exact retry. Current access, Project policy, File admission and delegated scope remain server-enforced. A Project context is not Surfer Working File ownership; use `project_file_authority` only for explicitly requested ownership/conflict work.

For `confirmation_required`, show the exact preview and ask in the current host. After an affirmative reply, repeat the exact bound call with `confirmationId`. Changed Project, target, message, conditions or cost requires a new proposal. A required Project approver is a separate permission; ordinary consent cannot replace it. Reconcile unknown outcomes before retrying and report actual queued/running/completed/delivered state.

Read [sender infrastructure routing](references/sender-infrastructure-routing.md) when Campaign volume, deadline or readiness makes it relevant; read [schedule routing](references/schedule-routing.md) when choosing an execution schedule. Official Skills change through versioned releases. Use `custom-skills` only for deliberate reusable procedure changes, never an automatic conversation conversion.

Workspace context exposes billing scope, credits, effective subscription/module status and recent relevant Activity Threads. Project context exposes selected Files/Operations, approvals and five latest Threads, including completed ones. Recent Threads do not imply running work. Refresh on entering, switching, resuming or relevant changes; server checks live gates before effects. Browsing Activity/reference results does not switch Project.
