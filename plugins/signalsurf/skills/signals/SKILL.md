---
name: signals
description: Use for Signalsurf net-new company or people discovery, web/social research, enrichment, job-change checks, technology evidence, hiring signals, or engager collection.
---

# Signalsurf Signals

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

Signals produce observed evidence. They do not automatically become CRM truth, a Listening, or a Campaign.

1. Start with `find_capabilities` when the source is ambiguous. Use search capabilities for net-new discovery. For known profiles/recent posts, follow [research and capture](../signalsurf/references/research-capture.md) using native `social_get`; `people_enrich` is for supported identity/Email enrichment, not a substitute for profile/posts research.
2. Reuse existing Records and retained results before spending on rediscovery. Distinguish observed evidence from inference and preserve source/time fields.
3. Use `enrichment_manage` to configure a maintained Sheet column and `enrichment_run` to execute it; inspect with `enrichment_query`.
4. Save requested verified durable identities into Records/Lists and monitoring intent into Listening only when requested.
5. Promote findings to a Project Thread when they validate/reject a hypothesis or change the next action. Routine search output stays in its resource/result history.
