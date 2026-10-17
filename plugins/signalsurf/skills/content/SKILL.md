---
name: content
description: Use for Signalsurf owned social accounts, content drafts, posts, calendar slots, publishing, retries, analytics, or audience capture from owned content.
---

# Signalsurf Content

Before every request using this Skill, follow [version check and automatic update](../signalsurf/references/freshness.md), then use the current guidance.

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

When writing, reviewing or rewriting copy, read [Writing](../writing/SKILL.md) and only the matching purpose/channel references. Use the native procedure below to read, save or send; a writing request does not expand permissions.

Business work uses a selected Project with Content enabled in File Access. Personal sends/schedules follow the same Messages gate. Pure Workspace reads may omit Project; reads within an explicit Project check its selection. Inspect current approvals and actual account/resource permissions before effects.

1. Read publishable accounts, current posts, settings, or analytics with `content_query`; never invent a connected handle or schedule slot.
2. Use `content_manage` for drafts, edits, unscheduling, deletion, settings, and explicit audience capture. Keep drafts reviewable before publication.
3. Publishing is externally visible. Use `content_publish` only when requested and after its confirmation boundary; never retry an ambiguous publish automatically.
4. Adapt copy to the actual account/platform while preserving the user's voice and saved targeting.
5. Record material experiments and results in the relevant Project Thread; ordinary draft revisions remain in Content history.

For performance trends, inspect `content.performance_history` through dashboard source discovery. Its rows are actual cumulative observations, not daily new engagement. Scope reads by observation period or exact publication ID. For line charts use `period.field: observedAt`, a daily `timeBucket` and its alias as the sole group; missing days are gaps. X automatically uses bounded paid checks at day 1/3/7, while Reddit score is signed. Never invent past readings or imply that a dashboard enables collection. Eligible published Content posts are tracked automatically; Content Analyze shows readings and status. Paid audience capture is a separate operation.
