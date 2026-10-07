---
name: listening
description: Use for Signalsurf Listenings, durable social monitoring, collected posts, reply drafts, public replies, source quality, or audience capture from monitored content.
---

# Signalsurf Listening

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

A Listening is a durable monitor. One-off research belongs to Signals unless the user wants continuing collection.

1. Resolve existing monitors with `listening_query`; do not use Sheet tools for Listening ids or collected posts.
2. Use `listening_manage` for configuration, activation, imported posts, and explicit audience capture.
3. Draft with `listening_reply` action `draft`. A public reply is externally visible: use action `send` only with the required confirmation and current account/post evidence.
4. Use `engagement_query` for source quality or downstream engagement state when relevant.
5. Write durable findings to the relevant Project Thread when monitoring changes a hypothesis or next step; do not dump every collected post into the Channel.

For an explicitly requested whole-Listening deletion, use `listening_manage` action `delete` with its exact target confirmation and approved revision, then verify the result. Native member deletion follows Workspace resource authority; historical attachment to an inaccessible Project is not itself a deletion prerequisite. Do not create a Project, Thread or Run, or claim Working File ownership to bypass permissions. Delegated background execution retains its native Project scope.
