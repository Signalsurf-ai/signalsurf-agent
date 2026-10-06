Choose the scheduler by the requested outcome:

- Personal Email/message at a time uses native personal Outbox scheduling. It needs a selected work Project with Messages access, the authenticated member, connected sender and recipient; it does not require a Campaign, Workflow or CRM Record.
- Ongoing Project/team automation uses the supported native Project Trigger or Workflow with explicit runtime scope and limits.
- A personal reminder uses the host scheduler only when reminding is the actual requested outcome; a reminder cannot stand in for sending a message.

For personal Email, resolve the exact usable sender and recipient. New Email and reply are separate choices: use new_thread for a new Email, or the exact selected replyToEntryId after reading the original. Preserve subject, body, due time and timezone. Personal one-off message schedules are time-only and send even if the recipient replies. If a requested condition is unsupported, ask whether to use time-only sending or separately scoped conditional automation before discovering or configuring that alternative. Never claim a Campaign is required or enroll someone without that choice. Inspect the native schema; do not invent a personal no_reply field.

Reuse the supported active personal Schedule rather than making a competing one. Prepare the exact send/schedule preview, follow its confirmation, and read back schedule/Outbox IDs, sender, recipient, due time/timezone, actual condition and status. For cancellation, target the actual item and verify the cancelled state. Queue acceptance is not dispatch or delivery; reconcile unknown outcomes before retrying.
