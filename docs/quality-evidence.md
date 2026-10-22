# Quality evidence — 2026-10-22

This record separates portable checks, bounded model reasoning and host installation. It does not claim new hosted capabilities, OAuth, Workspace access or provider outcomes.

## Onboarding integration candidate

The 0.8.0 source candidate adds a fifteenth Onboarding entrypoint and shared
automatic Memory recall/save guidance. The 0.7.16 model, installation and reading
measurements below retain their exact snapshots; they do not establish behavior
for this added guidance. Current package checks and two additional routing
fixtures cover its portable structure. Hosted onboarding and cross-host Memory
verification are separate from public package/model proof.

## Portable candidate

The Skill trial candidate is public commit `60a03143a3b26f0b2597df1281a3d5006732ba31`, plugin tree `caf3f1bd06d9ce853978390e0207427aa2f95260`, version `0.7.16`. Later release-tool/catalog/evidence changes preserve that plugin tree. Before guidance is public commit `79e795db1d76597fadb8863d89019d099c1437fb`.

The public command `npm test` checks package structure and negative boundaries, updater behavior, deterministic release artifacts and interrupted publication reconciliation, plus 31 routing cases (including four artificial compatibility fixtures), six recovery examples and 12 complete reading paths. Static fixture success does not establish model behavior. CI tests Node 22 and 24; the development-tool minimum is Node 22.13. The bundled customer updater retains its Node 18 minimum.

Cold-reading document bytes, including required shared guidance, changed as follows. These are source measures, not measured model-token savings.

| Path | Before bytes | After bytes |
| --- | ---: | ---: |
| Ordinary Records | 28,278 | 14,847 |
| Keyword research | 27,913 | 18,695 |
| Connections | 22,142 | 13,031 |
| Exact List Enrich | 28,278 | 17,989 |
| Uncertain deletion and recovery | 28,278 | 17,836 |
| Standalone Writing | 11,809 | 11,809 |

The capability fixture records documented names/actions from its pinned source. No live `inputSchema` snapshot was obtained in this round. Examples are procedure envelopes, not copyable API payloads.

## Bounded reasoning trials

Eight synthetic cases each used direct and root variants: one-off keyword research, exact List Enrich, denied List access, uncertain deletion, personal time-only scheduling, saved Routine verification, uncertain send and standalone rewrite. Four no-tool processes ran the same before/after tasks with supplied discovery descriptions and relevant guidance, without expected answers. Independent semantic review inspected responses and proposed effects against the corpus.

| Runtime | Before | After |
| --- | --- | --- |
| Codex CLI 0.163.0, configured default model (identifier unavailable) | 16 pass | 16 pass |
| Claude Code 2.1.308, `claude-opus-5-5` | 14 pass, 2 fail | 16 pass |

Claude-before's two keyword-search variants claimed returned posts although no search ran and no results were supplied. After responses state that search/results do not yet exist. This is a single bounded regression observation, not a general quality comparison. The standalone rewrite checks missing-input handling, not rewrite quality. No actual effects occurred. Proposed file choices do not establish host automatic discovery or reads.

Reviewed responses and provenance: [Codex before](../evals/results/2026-10-22-codex-before.json), [Codex after](../evals/results/2026-10-22-codex-after.json), [Claude before](../evals/results/2026-10-22-claude-before.json), [Claude after](../evals/results/2026-10-22-claude-after.json). Validate their shapes with `node evals/check.mjs --result <receipt>`; the checker does not decide the behavioral verdict.

## Supplemental writeback and compatibility trials

Two additional writeback cases each used direct and root variants against the same before/after guidance: a routine Record read that should stay in the host reply, and a material correction that should use one known same-objective Project Thread. Context includes exact targets, supplied synthetic observations, approved shareable facts and private scratch material that must stay out of shared writeback. Expected outcomes were withheld from the trial processes.

| Runtime | Writeback before | Writeback after | Artificial compatibility after |
| --- | --- | --- | --- |
| Codex CLI 0.163.0, configured default model (identifier unavailable) | 4 pass | 4 pass | 8 pass |
| Claude Code 2.1.308, `claude-opus-5-5` | 4 pass | 4 pass | 8 pass |

Both runtimes' before/after writeback samples keep the routine read out of Project Threads and limit the correction to the known Thread and approved compact facts. There is no observed improvement claim: the baseline also passes these samples. The compatibility rows use invented `fixture_*` APIs and schemas for minimal inputs, an optional additive field, an unavailable required revision value and a removed action. Both runtimes propose valid initial scoped update payloads for the first two and stop or rediscover safely for the latter two. No confirmation/retry response or extended schema was supplied, so conditional confirmation advice was not exercised or verified. These are artificial reasoning exercises, not a captured live SignalSurf schema, deployment or backward-compatibility test.

Original response fields and reviewed verdicts are preserved in [Codex writeback before](../evals/results/2026-10-22-codex-writeback-before.json), [Codex writeback after](../evals/results/2026-10-22-codex-writeback-after.json), [Codex compatibility after](../evals/results/2026-10-22-codex-compatibility-after.json), [Claude writeback before](../evals/results/2026-10-22-claude-writeback-before.json), [Claude writeback after](../evals/results/2026-10-22-claude-writeback-after.json) and [Claude compatibility after](../evals/results/2026-10-22-claude-compatibility-after.json). The receipts record exact prompt/guidance/output hashes, timestamps, invocation controls and original usage. Usage does not establish token savings. The first Claude attempt was terminated without output and supplies no behavioral result; its execution identity is retained with the successful strict retry.

Each process is one supplied-guidance batch whose rows were instructed to be independent. File choices are proposals rather than observed reads. Codex JSONL events show no tool/command items; Claude's original initialization declares no enabled tools or MCP servers and its assistant events have no tool-use blocks. These processes depart from the isolated host configuration and actual local-reading procedure recommended in [the trial guide](../evals/README.md): user configuration was inherited, including a registered SignalSurf `0.6.0` plugin in Claude and a Codex experimental-feature warning. Ambient guidance was not excluded. The observations therefore cover supplied-guidance reasoning only; they do not establish automatic discovery, isolated host installation, OAuth, real mutations or persistence. The original four trial receipts remain unchanged.

## Installation and integration

The single [compatibility matrix](compatibility.md) owns supported-route evidence and its gaps. Claude Code's published 0.7.15 HTTPS path installed in a disposable user configuration with Git unavailable; an intentionally wrong archive SHA-256 was rejected before installation. Disable/enable also passed. Candidate upgrade/fresh-install/removal results belong to the release receipt when executed. Host OAuth and a Workspace read were not executed.

The optional npm CLI is versioned separately. Published 0.3.1 was installed and checked offline, but fails eight of 89 current synthetic regressions. The corrected 0.3.2 candidate tarball passes 89 regressions and 12 offline subprocess cases on Node 22.13.0. Preparing it does not publish it; consult the registry and its release receipt before assuming availability. No real CLI OAuth or product calls were performed.
