# SignalSurf Agent

This public repository owns the customer plugin: Skills for using SignalSurf from
an external AI app, references, host manifests, updater, validation and releases.
Hosted MCP implementation, authentication, permissions and the optional CLI are
maintained separately. This file guides contributors; customer workflows belong
in `plugins/signalsurf/skills`, not engineering or release procedures.

- Keep public instructions in English and usable without private source, internal
  trackers, employee paths, credentials or customer data.
- Preserve the plugin path `plugins/signalsurf` and supported host manifest formats.
  Keep maintainer tooling outside the shipped Skill discovery directory.
- Preserve authorization, exact retry/reconciliation, confirmation and result-state
  safeguards. Standalone writing must remain usable without a Workspace connection.
- Use focused Skills and conditional references. Give each maintained procedure one
  authoritative owner; keep direct focused entry usable.
- Run `npm test` before handoff. Tests and fixtures must work from a public clone
  without credentials or hosted services. Record host/OAuth/model proof separately.
- Releases use one explicit committed candidate, immutable versioned artifacts and
  reconciled public identities. Follow `docs/releasing.md`; publishing requires
  authorization for the target release.
- Preserve unrelated working files and installations. Use disposable homes for
  installer tests; never run tests against a user's normal host configuration.
