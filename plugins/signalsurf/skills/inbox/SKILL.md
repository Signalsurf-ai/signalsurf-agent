---
name: inbox
description: Use for Signalsurf connected Inbox conversations, email drafts, replies, new sends, follow-ups, Autopilots, engagement tests, or Inbox-to-CRM sync.
---

# Signalsurf Inbox

1. Resolve the conversation/contact with `inbox_query`, Records, or `engagement_query`; never infer a recipient or sender account.
2. Draft with `message_draft`. Drafting and sending are separate actions.
3. Use `message_send` only on an explicit target and under the required confirmation. Sends are externally visible and not automatically retryable after an ambiguous outcome.
4. Use `engagement_manage` for follow-up/Autopilot state and `inbox_preferences` for explicit Records-sync settings.
5. Keep routine correspondence in Inbox history. Write Project-relevant commitments, objections, evidence, decisions, and next steps to the matching Thread without copying the full conversation.
