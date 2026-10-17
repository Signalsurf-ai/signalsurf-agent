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
2. Use `listening_manage` for configuration, activation, imported posts, and explicit audience capture.
3. Draft with `listening_reply` action `draft`. A public reply is externally visible: use action `send` only with the required confirmation and current account/post evidence.
4. Use `engagement_query` for source quality or downstream engagement state when relevant.
5. Write durable findings to the relevant Project Thread when monitoring changes a hypothesis or next step; do not dump every collected post into the Channel.

For audience capture, reuse the requested destination People List. Discover the live `listening_manage` audience-capture schema before changing settings. Headline Include and optional Exclude conditions gate admission before full ICP qualification: only a current Passed decision proceeds; missing, unclear, excluded or failed decisions remain in upstream capture evidence. With profile completion enabled, valid completed profile details are also required before admission. Set `profileDetails.enabled:false` while retaining screening for screen-only admission without paid profile completion. The flow is captured evidence → headline screening → optional profile completion → List admission → independent ICP qualification. Preserve existing manual members and user removal history.

Use `listening_query` action `post` for one collected post's capture evidence. Distinguish parsed interactions, headline outcomes, profile completion and current List membership. Returned people and counts are bounded samples; current membership does not prove this post created the membership. Preserve source-post attribution and report upstream held candidates separately from admitted List members.

For an explicitly requested whole-Listening deletion, use `listening_manage` action `delete` with a stable `operationId` and exact target/revision checks, then verify the result. Follow the shared operating contract for native member deletion, with no second conversational yes; existing confirmation resumes and internal Surfer/browser/autonomous confirmations remain unchanged. Native member deletion follows Workspace resource authority; historical attachment to an inaccessible Project is not itself a deletion prerequisite. Do not create a Project, Thread or Run, or claim Working File ownership to bypass permissions. Delegated background execution retains its native Project scope.
