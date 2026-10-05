---
name: inbox
description: Use for Signalsurf connected Inbox conversations, email drafts, replies, new sends, follow-ups, Autopilots, engagement tests, or Inbox-to-CRM sync.
---

# Signalsurf Inbox

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

1. Resolve the conversation/contact with `inbox_query`, Records, or `engagement_query`; never infer a recipient or sender account.
2. Draft with `message_draft`. Drafting and sending are separate actions.
3. Use `message_send` only on an explicit target and under the required confirmation. Sends are externally visible and not automatically retryable after an ambiguous outcome.
4. Use `engagement_manage` for follow-up/Autopilot state and `inbox_preferences` for explicit Records-sync settings.
5. Keep routine correspondence in Inbox history. Write Project-relevant commitments, objections, evidence, decisions, and next steps to the matching Thread without copying the full conversation.

Read [personal schedule](../signalsurf/references/personal-schedule.md) for the composed sender → recipient → preview → native Outbox → verified status procedure.

## Scheduled messages and conditions

- An ordinary personal scheduled message sends when due. A request such as "send this in 30 minutes" does not imply "only if they have not replied" or cancellation based on inbound message content. Preserve the requested time and timezone, recipient, channel, sender, and exact content in the send confirmation.
- Email thread choice is independent of the time/reply condition. Personal schedules support `emailMode: "new_thread"` (default) with an optional `subject`, or `emailMode: "reply"` with the exact user-selected `replyToEntryId`. Read the original Inbox email first; a reply retains that email's subject and mailbox. Never choose a thread merely because an earlier email has the same recipient. Social direct messages keep their existing conversation model.
- Ask only about an unresolved decision. If "follow up later" leaves it unclear whether a reply should stop the message, clarify time-only versus conditional follow-up before creating it. Do not ask again when the user already specified the trigger.
- For a conditional request, inspect the live capability schema before promising or writing it. Campaign message authoring supports `sendIf: "always"` and `sendIf: "no_reply"`; personal scheduling currently exposes time-only messages. Do not invent a personal condition field, silently substitute a Campaign, or enqueue an unresolved condition.
- Inspect and reuse the Person's active personal Schedule to append messages, including across supported channels. Resolve actual sender/recipient endpoints and handle any reported collision; do not create a competing Schedule.
- A queued item is not evidence of delivery. Inspect Outbox holds and dispatch outcomes; reconcile an unknown provider result before any retry.
