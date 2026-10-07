---
name: content
description: Use for Signalsurf owned social accounts, content drafts, posts, calendar slots, publishing, retries, analytics, or audience capture from owned content.
---

# Signalsurf Content

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

Business work uses a selected Project with Content enabled in File Access. Personal sends/schedules follow the same Messages gate. Pure Workspace reads may omit Project; reads within an explicit Project check its selection. Inspect current approvals and actual account/resource permissions before effects.

1. Read publishable accounts, current posts, settings, or analytics with `content_query`; never invent a connected handle or schedule slot.
2. Use `content_manage` for drafts, edits, unscheduling, deletion, settings, and explicit audience capture. Keep drafts reviewable before publication.
3. Publishing is externally visible. Use `content_publish` only when requested and after its confirmation boundary; never retry an ambiguous publish automatically.
4. Adapt copy to the actual account/platform while preserving the user's voice and saved targeting.
5. Record material experiments and results in the relevant Project Thread; ordinary draft revisions remain in Content history.
