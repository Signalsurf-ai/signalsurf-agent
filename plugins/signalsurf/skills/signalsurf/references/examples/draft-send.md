# Draft, approved send and uncertain delivery

**Request:** “Draft an email to this resolved recipient.”

1. Resolve authorized context and use Writing for grounded copy. `message_draft` creates a reviewable draft; it does not authorize `message_send` or a schedule. Return the draft and stop.
2. If the user later asks to send/schedule, resolve the actual sender, recipient, exact content, Project Inbox access, due time/timezone and email new-thread/reply choice. Inspect the live schema and native preview. If it returns `confirmation_required`, show that exact preview and bind the affirmative response to it.
3. Send only the bound proposal with its `confirmationId`; a changed recipient, content, condition, cost or context needs a new proposal. Preserve the operation identity for the exact request. Read back actual Outbox/dispatch state.

**Completion:** “queued for 10:00” requires actual saved queue evidence. “Delivered” requires a native delivery outcome; acceptance, draft creation or a successful enqueue is insufficient. Personal schedules remain time-only unless the live native capability explicitly supports the requested condition; never silently substitute a Campaign.

**Timeout:** inspect the existing operation/Outbox/provider receipt before retrying. Do not issue a replacement under a new operation ID. If delivery remains unknown, report uncertainty and stop. Drafting, sending and verified delivery remain separate observations.
