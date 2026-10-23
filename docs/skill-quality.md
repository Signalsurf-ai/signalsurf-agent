# Skill quality and ownership

The package provides 15 discoverable Skills, including Onboarding, and direct focused entry. A host can
select Records, Writing or another fitting procedure without first loading the
root. The root owns cross-domain intent routing. Maintainer/release tooling stays
outside `plugins/signalsurf/skills` so installing the product does not advertise
maintainer commands as customer procedures.

These Skills serve customers using SignalSurf from external AI apps. Engineering
Skills used to develop the SignalSurf application are a separate concern and are
not part of this plugin. Writing also supports supplied-context work without MCP.

## Procedure ownership

| Decision or safeguard | Authoritative portable guidance | Read condition |
| --- | --- | --- |
| Authenticated member versus Surfer; OAuth/Project/resource authority | Shared operating contract | Any SignalSurf resource work |
| Task-relevant Memory recall, automatic durable save/correction and private/shared audience boundaries | Shared operating contract | Each new SignalSurf task and useful durable context updates |
| Pre-authentication interview, secure setup and accepted initial outcome | Onboarding | Start or resume member setup |
| Exact IDs/context, approval binding, exact retries/reconciliation and actual result states | Shared operating contract | Any SignalSurf resource work |
| No writeback versus same-objective reply versus new material Thread | Shared operating contract | Considering result routing; routine work remains here |
| Native File deletion, restore/backing-Record semantics and deletion continuation | Native File lifecycle reference | Explicit whole-File deletion or uncertain result |
| Saved-field lookup, Record/List/Sheet selections, native bindings and cost/readback | Native Enrich reference | Lookup-based completion of existing supported fields |
| Records history and communication provenance | Records history reference | Requested history/activity/communication evidence |
| Collection/schema, List process fields and views | Records schema/views reference | Explicit schema/view changes |
| Company/People research and source/result continuation | Lead sourcing and research/capture references | Requested discovery or capture stage |
| Personal delivery, time-only behavior, sender/recipient and Outbox evidence | Personal schedule reference and Conversations | Requested personal send/schedule/cancel |
| Agent Routine timing/events, audience and saved versus executed evidence | Schedule routing reference and Projects | Explicit recurring/autonomous work or its run state |
| Official plugin versus deliberate Workspace custom Skills | Custom Skills | Requested reusable procedure lifecycle |
| Grounded writing and channel/voice rules | Writing and conditional channel references | Writing/review/rewrite; supplied-context work needs no MCP |
| Installed package freshness | Freshness reference | Once per request using an installed SignalSurf Skill |

The compact contract retains universal safeguards and points to domain procedures
under explicit conditions. Moving text does not transfer authorization to a Skill,
create a new server capability or change hosted behavior. Native MCP schemas and
server permissions remain live authority. Public guidance is maintained here.
Product consumers of selected references own their version provenance and
integration checks; their copies are not another editable source for this plugin.
Ordinary package maintenance does not require private-repository synchronization.
Package checks do not attest a consumer's integration or deployed MCP behavior.

## Measured reading paths

The baseline is public commit `79e795db1d76597fadb8863d89019d099c1437fb`.
`evals/reading-paths.json` retains exact scenario files and original counts.
Run `node evals/check.mjs` for current values; count shared contract/freshness and
every conditionally required file once. These are document bytes and
whitespace-delimited words, not model token or latency measurements.

The following measurements are the 0.7.16 quality candidate snapshot, before the
0.8.0 shared Memory contract. Run the command above for the current candidate;
these historical values do not describe the added onboarding/Memory guidance.

| Scenario | Baseline bytes | 0.7.16 bytes | Baseline words | 0.7.16 words |
| --- | ---: | ---: | ---: | ---: |
| Ordinary Records, direct | 28,278 | 14,847 | 3,938 | 1,958 |
| Keyword search, direct | 27,913 | 18,695 | 3,879 | 2,497 |
| Connections, direct | 22,142 | 13,031 | 3,093 | 1,746 |
| Exact List Enrich, direct | 28,278 | 17,989 | 3,938 | 2,401 |
| Uncertain List deletion, including recovery example | 28,278 | 17,836 | 3,938 | 2,387 |
| Standalone Writing, direct | 11,809 | 11,809 | 1,535 | 1,535 |

The root-routed variants include the universal contract and root once; the checker
also reports these. Standalone Writing deliberately preserves its independent
path. Added worked examples are conditional and synthetic; their procedure
fixtures pin documented names/actions, not live server input schemas.

## Proof boundaries

The public corpus includes positive, negative and ambiguous requests with expected
entry, allowed reads, observed outcomes and forbidden effects. Static checks
validate its structure and evidence-envelope boundaries. They do not show which
Skill a model selects, whether an actual host discovers it, OAuth availability,
current schema compatibility, persistence or delivery.

Use the [bounded task-trial protocol](../evals/README.md) for independent before/
after behavior and preserve failed/unavailable evidence. A real model run in a
read-only agent runtime must name that runtime; do not relabel it as a Claude,
Codex or Cursor host journey. Keep supported-host install/OAuth proof separate.

Dated bounded model trials and their limitations are recorded in [quality evidence](quality-evidence.md).
