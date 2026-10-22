---
name: signalsurf
description: Route SignalSurf work when the desired outcome spans domains or is unclear. Use a focused Skill directly when its procedure fits.
---

# Working with SignalSurf

Before every request using this Skill, follow [version check and automatic update](references/freshness.md). Read the [shared operating contract](references/operating-contract.md) unless already loaded; it owns member authority, context, confirmation, exact retries and result routing.

Select the requested outcome, not a tool's technical family. Use live `find_capabilities` for exact schemas; no Skill or Project context expands authorization. Load only the matching procedure and its conditional references. Direct focused entry remains valid.

| Requested outcome | Procedure |
| --- | --- |
| One-off public keyword search or more rows from retained research | [Signals](../signals/SKILL.md) |
| Known profile/posts research, with optional requested capture | [Research and capture](references/research-capture.md), then [Signals](../signals/SKILL.md); [Records](../records/SKILL.md) only for capture |
| Company/People discovery from a source or existing Company List | [Lead sourcing](references/lead-sourcing.md), [Signals](../signals/SKILL.md), requested [Records](../records/SKILL.md) or [Sheets](../sheets/SKILL.md) destination |
| Fill existing supported fields with researched facts | [Native Enrich](references/enrichment.md), then owning [Records](../records/SKILL.md) or [Sheets](../sheets/SKILL.md) |
| CRM Records/Lists, supplied-fact edits, history, schema or views | [Records](../records/SKILL.md) |
| Temporary operational rows, fields, imports, views or charts | [Sheets](../sheets/SKILL.md) |
| Personal email/DM, history, calls, meetings or time-only delivery | [Conversations](../conversations/SKILL.md); [personal schedule](references/personal-schedule.md) for delivery |
| Continuing public monitoring or collected Engagers | [Listening](../listening/SKILL.md); [Sheets](../sheets/SKILL.md) for research; [Records](../records/SKILL.md) only for requested CRM admission |
| Scheduled/event-driven Agent work or persistent Project collaboration | [Projects](../projects/SKILL.md); [schedule routing](references/schedule-routing.md) for recurring/autonomous work |
| Create/update a saved typed processing graph or inspect its runs | [Workflows](../workflows/SKILL.md) |
| Standalone writing, review or rewrite | [Writing](../writing/SKILL.md); supplied-context writing needs no MCP connection |
| Owned posts/drafts/publishing or Campaign outreach | [Content](../content/SKILL.md) or [Campaigns](../campaigns/SKILL.md), plus [Writing](../writing/SKILL.md) for copy |
| Explicit source documents, service connections or reusable Workspace procedures | [Knowledge](../knowledge/SKILL.md), [Connections](../connections/SKILL.md) or [Custom Skills](../custom-skills/SKILL.md) |

Stop at the requested stage. Research does not imply persistence, collection does not imply CRM admission, drafting does not imply sending, and saved recurrence does not prove execution. Read [completion and recovery examples](references/worked-examples.md) only when a matching composed task or uncertain outcome needs an example. Official plugin guidance changes through versioned releases; custom Skills have their own deliberate lifecycle.
