# Meeting Recorder

Meeting history, recordings, transcripts and summaries use `meeting_query` action `search`, followed by action `get` with the exact returned `meeting_entry_id`. Use `participant_query` for a person and the supported keyword/date filters; do not pass Inbox thread IDs or Phone session IDs. One displayed Meeting platform covers supported recording providers; never infer provider or participant identifiers.

Read this member's actual recorder with `meeting_preferences_read` action `get_recorder` before a requested `meeting_preferences_write` action `update_recorder`. Preserve settings the user did not ask to change. Use `meeting_preferences_write` action `manage_summary` only for explicit summary-instruction changes. Records sync uses `record_sync_preferences_read` action `get` before a requested `record_sync_preferences_write` action `update`: this is one Workspace policy shared by Inbox, Phone and Meetings, not a meeting-only setting. Explain that scope before changing it.

Use meeting_manage disconnect_recorder only for an explicit disconnection under exact confirmation. Existing history remains available. Use ensure_participant_record only with an existing meeting, its verified participant email and the requested Records collection; it requires Workspace Admin and never contacts the participant.

History access and recorder configuration keep their server-side Messages/Meeting File Access and resource authority. Renaming the visible module to Conversations does not merge permissions or create a meeting agent.
