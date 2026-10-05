---
name: signalsurf
description: Signalsurf operating contract and intent routing. Use for work across Workspace/Project context, Files and Records, research, Inbox, automation, publishing or reusable procedures; load only the focused guidance needed for the requested outcome.
---

# Working with Signalsurf

Read the [shared operating contract](references/operating-contract.md) when it is not already loaded. It applies even when a focused Skill was selected first. You act as the authenticated member; external execution does not impersonate the in-product Surfer.

## Choose work context naturally

Use `get_workspace_context` when context is missing or stale. Use `project_query` to resolve relevant existing work and `get_project_context` when entering, resuming or genuinely switching that work. Reuse bounded context. A named reference is not automatically a switch. Ask about the business ambiguity only when it would materially change the result; do not make the user recite IDs, approve every routine step, or listen to a full context inventory.

Project context, target File, execution method, and result destination are independent. Business/File actions carry the required work `projectId`; pure authorized reads may span Projects. Selecting a Project never transfers a File or grants access. Personal Inbox/Outbox, connections and administration retain their native action scope. Routine File operations execute directly without manufacturing a Thread or Run.

## Find the procedure by the desired outcome

Read only relevant focused guidance before applying it; one outcome can cross domains. `find_capabilities` supplies live capability names and `inputSchema`. Call an exposed tool directly or use `invoke_capability` with the exact returned name and arguments. Do not memorize an operation inventory or guess internal providers.

| Desired outcome                                                                             | Focused guidance                                                                                                 |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Research a known Person/profile and recent posts; optionally save verified Person + Company | [research and capture](references/research-capture.md), `signals`, then `records` only when capture is requested |
| Source companies or People from an existing company source                                  | [lead sourcing](references/lead-sourcing.md), `signals`, and the selected `records` / `tables` destination       |
| Maintain Enrich for a Table column                                                          | `tables` and `signals`; distinguish persistent configuration from a one-off lookup                               |
| Send, reply, schedule or cancel a personal Email/message                                    | [personal schedule](references/personal-schedule.md) and `inbox`                                                 |
| Monitor public content or capture a requested audience                                      | `listening` and the requested `records` destination                                                              |
| Create or run repeatable processing                                                         | `workflows`; use its real saved graph, limits and run state                                                      |
| Draft/publish owned posts; manage Campaign outreach                                         | `content` or `campaigns`; publishing and activation remain separate actions                                      |
| Continue durable Project work, collaboration or a background task                           | `projects`; `commander_query` only for real delegations                                                          |
| Explicit sources/documents, recordings, connected accounts, reusable procedures             | `knowledge`, `meetings`, `connections`, `custom-skills` respectively                                             |

## Save the meaningful result

The File/Record and its history are authoritative for routine edits. Contribute material evidence, insights, decisions and next actions to the relevant existing Project Thread through `project_manage`. Start a Thread only for new durable coordination; do not paste transcripts or log every tool call. Project messages are member-authored with server-managed provenance. Governed Memory distillation is separate from direct external writes; reusable Skills contain procedures, not customer facts or temporary task state.

Posting a message does not schedule background execution. Continue directly in the current host unless a real Task/delegation requires a handoff; inspect it with `commander_query`.

## Execute and verify

Use a new `operationId` for a distinct mutation and reuse it only for the exact retry. Current access, Project policy, File admission and delegated scope remain server-enforced. A Project context is not Surfer Working File ownership; use `project_file_authority` only for explicitly requested ownership/conflict work.

For `confirmation_required`, show the exact preview and ask in the current host. After an affirmative reply, repeat the exact bound call with `confirmationId`. Changed Project, target, message, conditions or cost requires a new proposal. A required Project approver is a separate permission; ordinary consent cannot replace it. Reconcile unknown outcomes before retrying and report actual queued/running/completed/delivered state.

Read [sender infrastructure routing](references/sender-infrastructure-routing.md) when Campaign volume, deadline or readiness makes it relevant; read [schedule routing](references/schedule-routing.md) when choosing an execution schedule. Official Skills change through versioned releases. Use `custom-skills` only for deliberate reusable procedure changes, never an automatic conversation conversion.
