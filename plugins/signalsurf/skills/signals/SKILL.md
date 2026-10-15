---
name: signals
description: Use for Signalsurf company or people discovery, one-off web/social research, retained research results, enrichment, job changes, technology or hiring evidence, and engager collection.
---

# Signalsurf Signals

Before every request using this Skill, follow [version check and automatic update](../signalsurf/references/freshness.md), then use the current guidance.

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

Signals produce observed evidence. They do not automatically become CRM truth, a Listening, or a Campaign.

For one-off keyword post research, including LinkedIn, or continuing a temporary search result, read [search and retained results](references/search-and-results.md). Stay in this research procedure when a returned reader belongs to the Tables tool family; saving into a Sheet is a separate requested outcome.

1. Start with `find_capabilities` when the source is ambiguous. Use search capabilities for net-new discovery. For research-only questions about known profiles/recent posts, follow [research and capture](../signalsurf/references/research-capture.md) using native `social_get`; `people_enrich` is for supported identity/Email enrichment, not a substitute for profile/posts research.
2. For TAM mapping, follow [lead sourcing](../signalsurf/references/lead-sourcing.md). Discover the live schema before choosing parameters: prefer native Company/People Lists when company_search/people_search expose listId/sourceListId. If the connected version lacks them, report that capability gap instead of silently duplicating Company Records into a Sheet. Reuse existing Records and retained results before spending on rediscovery. Distinguish observed evidence from inference and preserve source/time fields.
3. For missing fields on an existing List, Record or maintained Sheet, use native Enrich before separate research plus manual updates. Inspect the schema and exact saved binding with `enrichment_query`; reuse it, or configure a missing/changed binding with `enrichment_manage`, then execute with `enrichment_run`. Follow [Records](../records/SKILL.md) for exact List member scope and shared profile writeback. Inspect retained results before paid work; an ambiguous previous attempt must be reconciled, not retried under a new route.
4. Save requested verified durable identities into Records/Lists and monitoring intent into Listening only when requested.
5. Promote findings to a Project Thread when they validate/reject a hypothesis or change the next action. Routine search output stays in its resource/result history.
