# Skill checks and bounded task trials

`node evals/check.mjs` validates the public synthetic routing corpus, reference paths,
example evidence envelopes and complete cold-reading measurements. It runs without
credentials, model APIs, MCP or a host installation. Its negative envelopes reject
queued-as-delivered, research-with-effects, a changed retry identity and an
unreconciled retry. This proves those fixture boundaries, not agent behavior.

`capability-fixture.json` pins capability/action names to the stated public guidance
commit. It deliberately contains no invented live `inputSchema`. Worked examples
are procedure envelopes, not copyable API arguments. A release must separately
record which schemas/deployments were inspected; absence of that proof stays an
explicit limitation. Do not call a real paid operation to validate an example.

## Run a behavioral task trial

Use the same corpus and procedure before/after an edit. Keep each trial in a fresh
context and bind it to one source snapshot. Do not use a user's real Workspace,
connected accounts, customer data or normal host configuration.

1. Record the exact source commit (and the patch digest for an uncommitted
   candidate), model identifier/settings, host/version, date and reviewer. A
   service model name alone is not evidence of a Claude, Codex or Cursor host.
2. Choose a small affected set from `routing-cases.json`, including positive,
   negative and ambiguous cases. Run both `direct` and `root` variants where
   declared. Direct discovery presents Skill names/descriptions; root mode begins
   with the root Skill. Do not force root reading for a fitting focused Skill.
3. Give the model the case prompt and synthetic context only. Allow local reads
   of the pinned package. Block all real mutations, provider calls, paid research,
   authentication changes and network installs. A read-only model session can
   reason about proposed calls; it must not execute them. Ask it to return its
   selected procedure, files actually read, proposed capability transitions,
   material clarification (if any), expected evidence and final response.
4. Supply only the synthetic observations appropriate to the case, such as an
   existing saved binding, denied native access, partial result, queued receipt or
   timeout. Require live schema discovery before proposing real input arguments;
   do not reward fabricated payloads. Never put the expected answer in the model's
   prompt or score by matching words from the guide.
5. A separate reviewer compares the observed behavior with `requiredOutcomes` and
   `forbiddenEffects`. A wrong entry or extra read is evidence to interpret, not
   automatically a business failure; a forbidden effect or false completion
   claim fails the case. Record the actual response, reads, proposed effects,
   rationale, failure and unavailable proof. Distinguish a proposed effect from
   an executed effect. Record failed before/passing after boundaries when observed.
6. Save a receipt outside the shipped plugin using `trial-receipt.example.json`
   as the shape. Run `node evals/check.mjs --result <receipt.json>` for structural
   validation, then retain the review. A structurally valid receipt is not a
   passing behavioral verdict. Do not publish private transcripts or access data.

Supported-host installation, OAuth, live schema, persisted product outcomes and
provider delivery have separate proof. An unavailable host trial remains
unavailable; a simulated Codex subagent run cannot establish Claude/Cursor support.
Do not claim model token or latency improvements from byte/word reductions.

## Reading paths

`reading-paths.json` retains the baseline SHA, exact original files and counts.
`files` names the complete current path under the scenario's explicit conditions;
`baselineFiles` preserves original paths where a conditional branch moved. Count
each file once. The checker reports bytes and whitespace-delimited words, including
shared contract and freshness instructions. Model caching and tool transport can
change actual usage; these are document measures only. A smaller root achieved by
adding the same mandatory material behind more links is not an improvement.
