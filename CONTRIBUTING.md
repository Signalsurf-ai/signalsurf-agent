# Contributing to SignalSurf Agent

This public repository owns the portable SignalSurf plugin: Skills and their
references, host manifests, updater, package tests and releases. Changes accepted
here are the release source. The hosted MCP service owns authentication,
Workspace permissions and product operations; a plugin contribution does not
need its private source or an internal issue tracker.

`plugins/signalsurf/skills` contains customer workflows for external AI apps,
including standalone Writing. Contributor instructions and release procedures
stay outside that directory. The application, MCP implementation and optional CLI
are maintained separately from this package.

## Make a change

1. Fork this repository and branch from `main`.
2. Edit the relevant source under `plugins/signalsurf`, or the public maintainer
   tools and documentation. Preserve existing installation paths.
3. With Node.js 22.13 or newer, run `npm test`. The suite needs no package install,
   credentials, Workspace, paid provider or private repository.
4. Open a pull request against `main`, explaining the behavior and affected proof.

Skills are maintained in `plugins/signalsurf/skills/<name>/SKILL.md`. Put detailed
conditional procedures in the matching `references/` directory and link them
from their caller. Keep direct domain entry and standalone Writing usable. A
procedure should have one owner; do not paste the full tool catalog into Skills.

The plugin-root `LICENSE` must match the repository notice. Release archives,
checksums, generated catalog candidates and receipts are generated from a
committed candidate by the [release procedure](docs/releasing.md). Do not hand-edit
or replace an existing published release asset.

## Verify locally

`npm test` checks the portable package and its regression fixtures. It is the
same public command used by pull-request CI. A successful check proves package
invariants, not host installation, OAuth or live product behavior. Record those
separately in the [compatibility matrix](docs/compatibility.md).

For Claude Code development, use a disposable configuration directory and load
the complete `plugins/signalsurf` directory with the host's `--plugin-dir` option.
Do not copy a single Skill or register a second MCP server in your everyday
configuration. Loading a local folder is a development check, not marketplace
acceptance. Run read-only product checks only against an authorized test account.
The updater preserves Git source checkouts; do not test replacement against your
source directory or another user's installation.

## Review and release ownership

The maintainers listed in [CODEOWNERS](.github/CODEOWNERS) review package changes,
compatibility and attribution. CI must pass for the actual candidate and review
conversations must be resolved. Maintainers prepare releases from public commits
using [docs/releasing.md](docs/releasing.md). Publication requires authority for
the version and target; a green check alone does not grant it.

The repository requires the Node 22 and Node 24 public package checks, an
up-to-date base and resolved review conversations. Maintainers own review and
merge decisions; a second account's approval is not a required GitHub gate.
Use the normal pull-request merge path. Never bypass a known failing integrity
or authorization check.

Product consumers may reuse selected references from a public commit. Each
consumer owns its provenance, update review and integration checks; it cannot
overwrite this repository's source. Ordinary package contributions and releases
do not require synchronizing a private copy. Changes to advertised tool contracts
still need compatibility evidence for the hosted service they describe.

Contributions remain under the repository's MIT license. Retain relevant
copyright and attribution; disclose copied third-party material and its license.
Report package bugs through [Issues](https://github.com/Signalsurf-ai/signalsurf-agent/issues).
Use [private reporting](SECURITY.md) for security findings or sensitive evidence.
