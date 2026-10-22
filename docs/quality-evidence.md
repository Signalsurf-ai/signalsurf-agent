# Quality evidence — 2026-10-22

This record separates portable checks, bounded model reasoning and host installation. It does not claim new hosted capabilities, OAuth, Workspace access or provider outcomes.

## Portable candidate

The Skill trial candidate is public commit `60a03143a3b26f0b2597df1281a3d5006732ba31`, plugin tree `caf3f1bd06d9ce853978390e0207427aa2f95260`, version `0.7.16`. Later release-tool/catalog/evidence changes preserve that plugin tree. Before guidance is public commit `79e795db1d76597fadb8863d89019d099c1437fb`.

The public command `npm test` checks package structure and negative boundaries, updater behavior, deterministic release artifacts and interrupted publication reconciliation, plus 27 routing cases, six recovery examples and 12 complete reading paths. Static fixture success does not establish model behavior. CI tests Node 22 and 24; the development-tool minimum is Node 22.13. The bundled customer updater retains its Node 18 minimum.

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

## Installation and integration

The single [compatibility matrix](compatibility.md) owns supported-route evidence and its gaps. Claude Code's published 0.7.15 HTTPS path installed in a disposable user configuration with Git unavailable; an intentionally wrong archive SHA-256 was rejected before installation. Disable/enable also passed. Candidate upgrade/fresh-install/removal results belong to the release receipt when executed. Host OAuth and a Workspace read were not executed.

The optional npm CLI is versioned separately. Published 0.3.1 was installed and checked offline, but fails eight of 89 current synthetic regressions. The corrected 0.3.2 candidate tarball passes 89 regressions and 12 offline subprocess cases on Node 22.13.0. Preparing it does not publish it; consult the registry and its release receipt before assuming availability. No real CLI OAuth or product calls were performed.
