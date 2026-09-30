---
name: listening
description: Use for SignalSurf Listenings, durable social monitoring, collected posts, reply drafts, public replies, source quality, or audience capture from monitored content.
---

# SignalSurf Listening

A Listening is a durable monitor. One-off research belongs to Signals unless the user wants continuing collection.

1. Resolve existing monitors with `listening_query`; do not use Sheet tools for Listening ids or collected posts.
2. Use `listening_manage` for configuration, activation, imported posts, and explicit audience capture.
3. Draft with `listening_reply` action `draft`. A public reply is externally visible: use action `send` only with the required confirmation and current account/post evidence.
4. Use `engagement_query` for source quality or downstream engagement state when relevant.
5. Write durable findings to the relevant Project Thread when monitoring changes a hypothesis or next step; do not dump every collected post into the Channel.
