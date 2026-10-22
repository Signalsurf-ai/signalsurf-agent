# Shared operating contract

Activity is the cross-Project attention view. Conversations contains messages, calls and meetings. Project scheduled and event-driven work is named Routines; legacy operation IDs do not rename the product.

## Actor, context and authority

You act as the authenticated member. An external client is not the in-product Surfer; delegated background work has its own bounded runtime authority. Skills guide procedures and never authorize access, spend, sending or activation. Server checks current OAuth scopes, membership, Project privacy/policy, resource access and actor authority.

Keep the procedure matching the requested outcome, including direct focused entry. Consult the [root intent map](../SKILL.md) only when the outcome is unclear, the selected Skill does not fit or another requested stage needs a different procedure. Read only matching guidance, not every Skill or a tool inventory. A reader's technical family does not change the business procedure: retained research stays research even if read through `item_query`.

Choose work context, actual target, execution method and result destination independently. Project context does not move a File, grant access or transfer Working File ownership. Direct File execution need not create a Thread or Run. External clients do not write canonical Memory directly.

Reuse supplied or server-resolved Workspace, Project, resource and Thread IDs verbatim. Never reconstruct or shorten them. On an ID-format error compare the original first; that error is not evidence of absence or denied access. Load `get_workspace_context` when absent/stale and `get_project_context` on entry, resume, genuine switch or relevant permission/billing change. Workspace context includes billing/entitlement, modules and recent Activity; Project context includes selected Files/Operations, approvals and five latest Threads. Recent Threads are not running jobs; observations are not grants. Reuse bounded context on ordinary turns. Reading another Project's authorized reference does not switch work. Ask only when ambiguity materially changes the outcome; never create a Project to satisfy a selector.

Carry `workspaceId` and work `projectId` where the live action requires them. Business/GTM mutations, File edits, paid research, personal correspondence and Outbox schedules need a valid work Project. Inbox, Meeting and Content use its selected Operation access/approvals; pure authorized Workspace reads may omit it. Supplying a Project also checks its selection. Connections, Workspace administration and native Project management retain declared native scope. Target Project and work context are different roles. Use [Projects](../../projects/SKILL.md) for requested selection/access changes. File ownership is not Workspace Admin; never claim ownership or add grants to bypass failure.

## Discover, execute and reconcile

When the execution route is unclear, discover by outcome and source with `find_capabilities`. One family's missing combination does not establish product-wide absence. Load the exact capability/action's live `inputSchema` and access; invoke the exposed tool or `invoke_capability` with the exact returned name and schema-matching arguments. Distinguish invalid input, missing scope, unavailable deployed capability and empty evidence. Report an actual missing route; do not invent provider operations, unrelated resources or repeated paid discovery to work around it.

Preserve supplied literal values unless translation/paraphrase was requested. Give each distinct mutation an `operationId`; exact retries reuse the same ID and payload. Reconcile unknown outcomes before retrying. For `confirmation_required`, present its exact preview and obtain an affirmative reply in this host, then repeat the exact bound call with `confirmationId`. Workspace, Project, target, content, conditions and cost stay bound; a context switch cannot retarget a preview. Changed effects need a new proposal. Consent cannot replace a required Project approver. Report actual queued, accepted, completed and delivered states separately.

Read [native File lifecycle](file-lifecycle.md) for whole-File deletion or its uncertain retry; it preserves explicit-request authority, exact revisions/dependencies, List backing Records, restore semantics and native confirmation boundaries. Read [native Enrich](enrichment.md) only for lookup-based completion of supported existing fields. For personal delivery use [personal schedule](personal-schedule.md); for requested recurring/autonomous execution use [schedule routing](schedule-routing.md). A feasibility question or one-off request does not authorize recurrence. A host reminder, Project post or saved configuration is not execution proof.

## Choose the result destination

Choose exactly one route after work:

- **No Project writeback:** ordinary reads, routine edits, private exploration and unchanged shared understanding/next steps finish in this host/resource history.
- **Reply to existing Thread:** material evidence, decisions, corrections, blockers, outcomes or handoffs for the same objective/question use its exact `threadId`, once. An explicit compact save may reuse that work even for a routine result.
- **Start new Thread:** only material, distinct work with no suitable Thread and ongoing coordination across people/time starts a root without an existing Thread target.

Material means a changed decision, next action/owner/timing/priority, reusable new evidence or information preventing repeated work, mistaken state or a known blocker. Selecting a Project or completing an operation does not imply posting. Honor explicit post/reply/no-post instructions. Before any new Thread, reuse a known same-objective Thread; otherwise search that Project by objective/question. A bounded recent list cannot establish absence. A suitable match requires its exact `threadId`; explicit save never authorizes a duplicate. Search only when considering shared writeback. A known work Thread may be read before execution. If explicit save fits neither Thread route, keep the result here and ask its intended shared objective/destination instead of inventing coordination.

Post no acknowledgement-only prose, private reasoning, raw host transcript, tool receipt, intermediate log or User Memory. Project messages retain member/client provenance. Posting is not delegation or scheduling; use `commander_query` only for actual delegated/background work. Routine resource history remains authoritative.

Finish with a brief nonempty reply in this host stating the observed result or blocker, including after a Project post. For a created/updated File, include its known named Markdown `open_url`, preserving exact Workspace/resource parameters across edits. Do not read solely to obtain a link, invent URLs or substitute row/Record/view IDs for File IDs. Report an unavailable link. A link is not completion proof; pending, unknown and failed writes are not completed edits. Deleted Files are not opening destinations.
