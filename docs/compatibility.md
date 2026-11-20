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

These historical checks retain their tested versions and scope. They do not
establish installation or live behavior for a newer package.

| Route/version | Date and timezone | Observed result | Remaining limits |
| --- | --- | --- | --- |
| Claude Code 2.1.308 / plugin 0.7.15 | 2026-10-22 America/Los_Angeles | HTTPS install passed in disposable user configuration with Git unavailable; wrong archive hash rejected; disable/enable passed | Upgrade, final removal, OAuth and Workspace read not established by this check |
| Claude Code 2.1.308 / plugin 0.7.16 | 2026-10-22 America/Los_Angeles | HTTPS fresh install passed with Git unavailable; installed files and MCP registration matched the published package; uninstall preserved synthetic local data | Update/reload, OAuth and Workspace read not established by this check |
| Claude Code 2.1.312 / plugin 0.9.1 | 2026-10-29 Asia/Taipei | Anonymous assets and all 63 installed files matched the package; 15 Skills and one HTTP MCP registration; fresh install and version readback passed in disposable user configuration | Upgrade, loaded-conversation behavior, removal, OAuth and Workspace read not executed |
| Raw remote MCP / native SDK | 2026-10-23 UTC | OAuth and authorized context reads passed; synthetic Memory save, correction, recall, App readback, exact-operation replay and confirmed forget were observed; authorization revoked afterward | SDK version unspecified; existing onboarded member; transport timeouts required reconciliation; no new-member bootstrap, plugin install, provider connection, Campaign delivery or arbitrary-host reliability claim |
| ChatGPT-connected MCP host | 2026-10-27 UTC | Existing connection retrieved a current action schema, recalled Memory and read People Records | Host version unspecified; no fresh OAuth, plugin install/reload or Cursor workflow test |

Use the documented raw HTTPS catalog for Claude Code. A GitHub release-asset
catalog URL was interpreted as a Git source in the 2.1.308 check.

Add reviewed summaries here with the date/timezone, exact tested versions,
scope, result and remaining gaps. Raw execution records remain outside the
public package under the [evidence policy](quality-evidence.md). Reuse proof only
when its host, package content, scope and inputs still apply; rerun invalidated
checks. Keep package, host lifecycle, OAuth and Workspace behavior distinct.

## Trace the product dependency

Each new plugin release records its reviewed product version, canonical MCP contract SHA-256 and contract URL under `product` in its downloadable `release.json`. The receipt also identifies the plugin version, commit and archive hash. Older receipts retain their original format. Client and product versions advance independently. Continuous deployments can change a contract within a product version.

Use `npm run check:upstream` to compare the committed plugin baseline with the hosted service, or add `-- --plugin-ref vX.Y.Z` to inspect a distributed tag. A daily read-only CI check and a manual workflow use the same command. Package tests remain offline. The JSON report lists changed canonical tools and retired-entry drift. Exit 0 means the declared version and contract digest match, 2 requests review, and 1 means the comparison could not be completed. A missing version header is reported explicitly.

Maintainers can check an unpublished product candidate with `node scripts/check-upstream.mjs --plugin-ref HEAD --contract /path/to/exported-contract.json --product-version X.Y.Z`. Take both inputs from the same product candidate. The checked-in `docs/contracts/source.json` pins the reviewed product version and digest. Its initial product version comes from the product candidate that matched the publicly observed snapshot. This baseline identifies a contract within the rolling product version.

For drift, compare the affected actions, inputs, confirmation and readback semantics with the customer Skills and evals. Check served tool splits with live discovery when they change. A matching digest still needs a separate review for changes in behavior, permission requirements or host packaging. If existing guidance works, record the evidence and refresh the maintainer pin and fixture as needed. If a Skill changes, update its examples and release the plugin according to the package version policy. For an older installed release, look up its immutable receipt before deciding whether an update is necessary.

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
