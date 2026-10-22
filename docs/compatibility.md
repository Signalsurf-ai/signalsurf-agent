# Compatibility and acceptance

Plugin Skills, host-installed files, conversation context, the optional CLI and
the hosted MCP service have independent versions and lifecycles. A public commit
or valid manifest does not establish a directory listing, installation or OAuth
session. Use this single matrix for installation and release evidence.

## Supported routes and evidence

| Route | Prerequisites and scope | Package / host evidence | Connection evidence |
| --- | --- | --- | --- |
| Claude Code HTTPS plugin | Claude Code 2.1.224+; user, project or admin scope as offered; HTTPS access | Complete ZIP and SHA-256 catalog; fresh install/update/remove receipts recorded per tested version | OAuth and Workspace read require their own test account receipt |
| Claude / Cowork marketplace | Available marketplace controls; organization permission | Documented interface; actual app/listing acceptance is account-specific | Connect bundled connector, authorize Workspaces and verify read |
| Codex / ChatGPT plugin | Available directory or workspace import; admin/GitHub authorization where required; imported MCP packages may be desktop-only | Documented distribution contract; CLI-local acceptance does not prove desktop/web installation | Separate host OAuth and Workspace read |
| Cursor marketplace / local developer folder | Available listing/team import, or complete local plugin folder for developers | Marketplace review and local discovery are distinct | Separate host OAuth and Workspace read |
| Grok Bot | Listing visible to the account and allowed by team policy | No inference from Cursor or repository publication | Host-specific acceptance required |
| Raw remote MCP | Host supports Streamable HTTP and OAuth; account/admin restrictions apply | No Skills installed; no package updater | Connection, selected Workspace and capability read |
| Optional `@signalsurf/cli` | Node.js 22.13+; independent npm package and configuration | Published tarball/install/help/error receipts belong to the CLI version | CLI auth and read-only MCP discovery are separate |
| Skills-only / `npx skills` / manual domain copy / OpenCode | Not a supported complete SignalSurf integration in this release | Discovery alone omits parent manifests/updater and can omit sibling references | Use a supported full-plugin or raw MCP route; no new host support is claimed |

Current official contracts are linked in [Getting started](../GETTING_STARTED.md#documentation-sources).
Heptabase's [host-specific installation and update guide](https://github.com/heptameta/heptabase-cli-skills)
informed the organization of our guide. Its single-Skill copy and Git-based
commands do not establish SignalSurf's multi-Skill package completeness.

## Evidence record

For each tested route record the date and timezone, exact host/installer version,
public commit, plugin version/digest, installed scope, command or UI path, actual
result and remaining gap. Keep these columns distinct:

| Route/version | Official contract | Static package | Fresh install | Update/reload | Disable/remove | OAuth | Workspace read |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Claude Code 2.1.308 / plugin 0.7.15, 2026-10-22 America/Los_Angeles | CLI help and linked official docs | Published SHA-256 ZIP; intentionally wrong hash rejected before install | Passed HTTPS catalog install in isolated user config with Git unavailable | Candidate upgrade recorded separately | Disable/enable passed; final removal recorded separately | Not executed | Not executed |
| Claude Code 2.1.308 / plugin 0.7.16, 2026-10-22 America/Los_Angeles | Same host contract; immutable raw HTTPS catalog | Anonymous release downloads match prepared bytes; all installed files, 14 Skills, references, MIT notice and one MCP registration match candidate `50190c4` | Passed with Git unavailable in isolated user config | Main-catalog upgrade and conversation reload pending activation at this snapshot; subsequent receipts belong to the linked release notes | Uninstall with `--keep-data` passed; unrelated fixtures and synthetic local data preserved | Not executed | Not executed |

[0.7.16 release notes](https://github.com/Signalsurf-ai/signalsurf-agent/releases/tag/v0.7.16)
retain the immutable candidate identity and any later main-activation/lifecycle
receipts. A GitHub release-asset catalog URL was interpreted as a Git source by
this host; the documented `raw.githubusercontent.com` catalog route passed.

Mark an inapplicable cell with a reason, such as “raw MCP installs no Skills” or
“standalone writing does not access a Workspace.” Keep proof receipts in the
release notes or linked public test artifacts, using synthetic examples only.
Reuse unchanged receipts when their host, package content, scope and inputs still
apply; rerun checks invalidated by a candidate. Do not maintain a second matrix.

## Capability changes

Discover current capabilities and their input schemas before product work.
Additive optional fields do not require inventing values. If a required field or
operation is absent, rediscover the supported capability, use a documented
fallback within the user's scope, or report the missing requirement. Never infer
permission from a cached schema or retry an uncertain mutation as a new action.
Use current server quotes for prices rather than a static guidance number.

Provider observations are bounded evidence, not provider-quality guarantees.
Material comparisons need a dated source, tested scope and limitations; remove
or qualify claims whose provenance cannot be maintained.

## Updates and recovery

The host manages its installed plugin. SignalSurf's bundled updater checks
published guidance and can replace a compatible writable installation; it
preserves Git source checkouts and rejects incomplete or unverified packages.
Managed hosts may instead read pinned current guidance without replacing files.
Neither operation rewrites instructions already loaded in a conversation: reload
the relevant guidance or start a new session as the host requires.

Retain lock, integrity, path, concurrency, offline and rollback protections. A
successfully installed but functionally bad version is corrected by a forward
patch; do not silently downgrade, rewrite tags or replace published bytes. For
urgent recovery, disable the affected plugin and use an explicitly supported
read-only alternative until the corrected release is verified. Reinstalling an
old ZIP alone does not pin guidance if invocation-time freshness remains enabled.
The release procedure records which main/version and HTTPS catalog pointers are
active and how to reconcile an interrupted activation.

Removing local guidance, disconnecting a host and revoking a service grant are
separate operations. None implies deletion of hosted Workspace data or cancellation
of server-side schedules. See [removal instructions](../GETTING_STARTED.md#disconnect-uninstall-and-revoke).
