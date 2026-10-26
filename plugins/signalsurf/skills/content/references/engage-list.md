# Published Content identity and Engage Lists

Use this procedure for the member's posts published through Content, including their own LinkedIn posts. Monitored third-party posts use [Listening](../../listening/SKILL.md), whose Engagers cards collect into managed Sheets. Content Engage Lists have a separate People List destination; do not apply the Listening Sheet configuration to them.

## Read the published post and its link

Use `content_query` action `posts` with `status: posted`. Each post's `postId` identifies the editable Content post. Its `sends` identify individual account publications and expose `publicationId`, original `providerPostId`, verified `socialId` and `permalink` when available. `content_query` action `analyze` returns publication `id` with parent `postId` and the provider identity/link fields. Copy those returned values exactly; an internal publication UUID, provider ID and LinkedIn social URN are different identifiers.

Use the returned `permalink` for the LinkedIn post link. Missing identity or link values remain unknown; do not construct a URL from an opaque ID or republish to obtain metadata. A successful send can retain its original provider ID even when the bounded post-create metadata read fails. Legacy receipts can have `socialId: null`; a displayed legacy link does not prove the stored receipt was backfilled. Ordinary Content reads do not perform a fresh provider lookup.

After an immediate publish, inspect the returned state and read the existing post again when needed. Scheduling or an accepted job is not a completed publication. Keep the original post and publication IDs through reconciliation; ambiguous sends must not be retried to repair a missing link.

## Configure Engagers from owned Content

1. Discover the live `content_manage` action `engage_list` schema and use input action `read` for the requested `channel`. This reads the current Engage List configuration; it is separate from Listening's compatibility action of the same name.
2. Resolve the intended People List through [Records](../../records/SKILL.md). Configure an exact `destinationListId`, or use the live tool's supported creation path when the member wants a new List. Do not silently choose a different List or create a Listening/Sheet as a substitute.
3. Set the requested rolling `lookbackDays` of 7, 30 or 90. To target particular published posts, copy their internal `publicationId` values from `posts` sends, or publication `id` values from `analyze`, into `publicationIds`; never substitute `postId`, `providerPostId` or `socialId`. Omit the selection only when the user wants all eligible posts in the window. Inspect the current platform-supported `interactionTypes` and requested `refreshMinutes`; do not promise an interaction the live path cannot collect.
4. Use input action `configure` to prepare the actual destination, post scope, cadence and server-returned recurring credit ceiling. Follow the exact confirmation preview; a feasibility question does not authorize paid recurring collection. Copy `approvedMaxCredits` from the approved server proposal, never estimate or invent it. Preserve the complete bound payload and operation ID when confirming or reconciling.
5. Use input action `disable` to pause the rule. For an explicitly requested collection, `sync` follows its own live confirmation; preserve server-returned `captureRuleId`, `captureRuleUpdatedAt` and `captureTargetsSha256` when present. Input action `refresh` updates performance metrics without a List and is not Engagers collection; preserve its returned publication target identity when confirming.
6. Read back the saved rule, destination, active state and scope, then verify actual destination Records and List membership before claiming collected people. Queued work, observed interactions and saved membership are distinct outcomes. Partial or missing provider identity stays a reported gap. Collection does not authorize Campaign enrollment or sending.

A Skill describes a supported workflow, not an unconditional deployment or access guarantee. Use the current schema and resource permissions, report unsupported steps, and keep configuration evidence separate from completed paid execution.
