# Meeting Recorder

Meeting history, recordings, transcripts and summaries use conversations_query search with communication_types containing meetings, followed by get on the returned thread_id. One displayed Meeting platform covers supported recording providers; never infer provider or participant identifiers.

Read this member's actual recorder with meeting_preferences get_recorder before a requested update_recorder. Preserve settings the user did not ask to change. Use manage_summary and get_object_sync/update_object_sync only for explicit summary-instruction or meeting-specific Records-sync changes.

Use meeting_manage disconnect_recorder only for an explicit disconnection under exact confirmation. Existing history remains available. Use ensure_participant_record only with an existing meeting, its verified participant email and the requested Records collection; it requires Workspace Admin and never contacts the participant.

History access and recorder configuration keep their server-side Messages/Meeting File Access and resource authority. Renaming the visible module to Conversations does not merge permissions or create a meeting agent.
