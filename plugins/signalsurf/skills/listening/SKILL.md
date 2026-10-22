---
name: listening
description: Use for Signalsurf Listenings, durable social monitoring, collected posts, reply drafts, public replies, source quality, or audience capture from monitored content.
---

# Signalsurf Listening

Before every request using this Skill, follow [version check and automatic update](../signalsurf/references/freshness.md), then use the current guidance.

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

A Listening is a durable monitor. For a one-off keyword post search or unread temporary search results, use [Signals](../signals/SKILL.md). Creating a Listening is not a prerequisite for LinkedIn post research; choose this procedure when the user wants continuing collection or work on an existing Listening.

When writing, reviewing or rewriting copy, read [Writing](../writing/SKILL.md) and only the matching purpose/channel references. Use the native procedure below to read, save or send; a writing request does not expand permissions.

1. Resolve existing monitors with `listening_query`; do not use Sheet tools for Listening ids or collected posts.
2. Use `listening_manage` for configuration, activation and imported posts. For Engagers collection into managed Sheets and its later research/outreach handoffs, follow the Engagers procedure below.
3. Draft with `listening_reply` action `draft`. A public reply is externally visible: use action `send` only with the required confirmation and current account/post evidence.
4. Use `engagement_query` for source quality or downstream engagement state when relevant.
5. Write durable findings to the relevant Project Thread when monitoring changes a hypothesis or next step; do not dump every collected post into the Channel.

Use `listening_query` action `post` for one collected post's capture evidence. Distinguish observed profiles, actual interactions, configured destinations and verified saved Sheet rows. Returned profiles are bounded samples; a configured destination does not prove delivery. Preserve source-post attribution and inspect destination rows before reporting saved results.

For a requested whole-Listening deletion or its reconciliation, read [native File lifecycle](../signalsurf/references/file-lifecycle.md) and discover `listening_manage` action `delete` for the exact target.

# Engagers into Sheets

Use this procedure when the user wants profiles that interacted with monitored LinkedIn posts. Ask their intended use before recommending research, qualification or outreach. Inspect the live `listening_manage` Engagers action schema; older releases may expose the compatibility name `engage_list` and may not yet support Sheet destinations. Do not pass new arguments to an older schema or claim the Sheet path is deployed without evidence.

1. Resolve the Listening with `listening_query`, inspect its post Tags and read the current capture configuration. Each independent Engagers card owns a capture rule and a managed Sheet. Create another card when the user requests independent routing or limits; update an existing card by its exact ruleId.
2. For a new card, use one `sheetRoutes` item with a new `sheetName` and exact saved post Tag keys/values. Editing a saved card preserves its bound `sheetId`; do not offer an existing-Sheet picker for a new card. Published schemas retain compatible existing IDs and multi-route configurations for older clients. No Tag filters means all posts; values within one Tag are OR, different Tags are AND. Set each card's own `maxEngagersPerDay` and `monthlyCreditLimit`; daily unique-profile accounting resets at UTC midnight and monthly page credits include prior runs and unresolved reservations. Independent cards collect and bill separately, including overlapping posts. Do not promise shared reads across cards. Honor the live Listening and Sheet grants and the capture operator's membership in the Listening's existing execution Project. Sharing File Access does not change that execution Project or authorize collection; do not grant membership automatically. Collection alone needs no Records or List write grant.
3. Keep collection OFF until the user approves the actual daily post/profile quantities and server-returned recurring per-run/monthly credit bounds. A connection or a saved rule is not activation. Enabling Engagers already schedules its first collection; inspect that run before requesting manual sync. Run discovery sources only when new post retrieval is separately needed. Supported interaction types are collected and labeled automatically; do not add a type picker, relevance filter, profile-completion mode or paid repost path that the live tool does not support.
4. Use [Sheets](../sheets/SKILL.md) to inspect collected rows and configure purpose-specific custom fields, Enrich, scoring and labels. Required identity and source fields are system-owned and locked. Preserve all candidates, including irrelevant, low-scoring, missing-data and failed rows; judgments do not control collection admission. Person, Company and Unknown profiles all remain in the Sheet, with a locked Profile type. Keep genuine headlines separate from follower captions; missing source information stays unknown. Use one Source column for the matched keyword or tracked account; retain the original post link for traceability. Do not add separate keyword/account columns or post-author columns. Account monitoring includes posts the account reposts; Source identifies where the post was found, not its original author. Keep returned LinkedIn URLs and verified member-ID URLs, and never invent URLs from names or untyped numeric IDs. Prefer public identifiers already returned by the provider and verified retained mappings. Never open signed-in LinkedIn profiles or call connected-account profile lookups just to repair URL formatting. If an opaque ID needs an additional lookup, use a separately authorized, bounded no-cookie provider lookup; this does not enable Sheet Enrich or messaging. One profile can have research rows from multiple posts. Collection approval is not enrichment approval.
5. When the user chooses outreach candidates, use [Records](../records/SKILL.md) and native Record import to match existing identities or create the appropriate Person or Company Records, preserving Sheet source links. Resolve Unknown types before import and never import a Company as a Person. Do not blindly promote Sheet-specific scores to shared Person facts. A List is optional after Records admission. Load [Campaigns](../campaigns/SKILL.md) only for requested Campaign work: raw Sheet rows cannot be Campaign recipients, and import does not authorize enrollment or sending.
6. Verify actual destination rows, avatars, interaction/source evidence and completed custom cells. Latest-run counters are not Sheet totals. A queued job, empty field, timeout or capacity deferral is not a provider miss. Reconcile uncertain paid outcomes before retrying. Preserve File authority and only promise follow-up after registering a supported follow-up.

Legacy List-based collection must be explicitly reconfigured. Preserve existing Lists, Records and observations; never silently convert it into new paid Sheet collection. Keep unsupported steps as reported gaps instead of creating a fake destination or bypassing locked fields.

For a composed managed-Sheet review, optional CRM admission or uncertain capture, read the synthetic [Listening and Sheet example](../signalsurf/references/examples/listening-sheet.md).
