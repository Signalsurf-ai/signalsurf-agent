# Release audit — 2026-10-29

Scope: this public Agent repository, all GitHub Releases and their attached
assets, installation/update documentation, release tooling and merge policy.
Other products, marketplace accounts, hosted MCP deployment and npm publication
were outside this audit.

The source baseline was `0d9f328590260c9ca4f88c0a5758c37acb613e06`.
At inspection there were nine public releases and two private drafts. All 21
attached public assets downloaded anonymously with HTTP 200 and matched their
GitHub SHA-256 digests and declared sizes. Every supplied catalog/checksum agreed
with its ZIP. All supplied release receipts matched their tags, plugin trees and
assets. The four host manifests agreed on the package version in each ZIP.

## Inventory

| Release | State | Attached assets | Verification scope |
| --- | --- | --- | --- |
| v0.9.1 | Published | 4 | Anonymous bytes, four manifests, catalog/checksum, receipt/tag/tree and active main |
| v0.8.0 | Published | 4 | Anonymous bytes, four manifests, catalog/checksum and receipt/tag/tree |
| v0.7.16 | Published | 4 | Anonymous bytes, four manifests, catalog/checksum and receipt/tag/tree |
| v0.7.15 | Published | 3 | Anonymous bytes, four manifests and catalog/checksum |
| v0.7.14 | Published | 3 | Anonymous bytes, four manifests and catalog/checksum |
| v0.7.13 | Published | 3 | Anonymous bytes, four manifests and catalog/checksum |
| v0.2.2 | Published | 0 | Tag resolves; legacy source layout |
| v0.2.1 | Published | 0 | Tag resolves; legacy source layout |
| v0.2.0 | Published | 0 | Tag resolves; legacy source layout |
| v0.9.0 | Draft, explicitly superseded | 0 | Preserved; not retroactively published |
| v0.8.1 | Draft | 4 | Preserved; not an empty draft and not retroactively published |

Drafts are visible to maintainers rather than anonymous users. Their presence is
not a defect in the public release list. Older asset formats are historical
contracts, not missing files to regenerate under an existing public version.

## Findings and repairs

### Incomplete activation reached main

The v0.8.1 package and catalog reached main in
[PR #15](https://github.com/Signalsurf-ai/signalsurf-agent/pull/15), but its GitHub
Release remained a draft. The catalog at merge `c1d62b9` names the public
`v0.8.1/signalsurf-0.8.1.zip` URL; that anonymous URL returned 404 during this audit.
This is evidence of a pointer/asset lifecycle mismatch, not evidence that a
particular customer's installation failed. Current main and public v0.9.1 match,
so no current broken-download state was found.

The release procedure now defines completion as agreement between public assets
and active main pointers, requires merge readiness before public activation and
requires anonymous download/readback before the normal merge. Since the updater
reads main directly, a version merged there is already publicly distributed even
when its GitHub Release is still a draft. That version cannot be reused.

### Candidate preparation was confused with public versioning

The tool rejected a changed candidate even for an untagged, empty, unpublished
draft. The supported path now includes an explicit `revise` operation that checks
the old SHA, same version, empty draft, absent tag and version above active main.
It reads back the result and does not replace assets. Tagged, public, nonempty,
unknown and already-active versions remain protected. Internal iterations use
candidate SHAs rather than automatically consuming another patch number.

### Public release names were inconsistent

Nine public titles used product prefixes or themes in several formats. Their
display titles were normalized to their existing `vX.Y.Z` tags. Tags, target
commits, published timestamps and all asset identities were preserved. Future
release tooling generates and verifies the same title convention.

### The latest notes did not describe the cumulative user change

The original v0.9.1 notes focused on PR #16 and placed artifact/operational records
first. They omitted the Content identity and Engage List guidance already shipped
on main through PR #15 after public v0.8.0. The updated notes cover both PRs,
lead with user outcomes, explain updating/reloading and fold verification details.
Historical release descriptions retain their original claims and limitations.

Future staging requires reviewed user-facing notes. The tool appends artifact
identity separately and rejects an activation whose draft title or notes differ
from the supplied reviewed presentation. Metadata corrections do not require
another plugin version.

### Discovery, compatibility and governance documentation had drifted

README now links directly to release history/downloads and update instructions.
The compatibility matrix includes the bounded Claude Code 2.1.312 / plugin 0.9.1
installation receipt: 63 files, 15 Skills and one expected HTTP MCP registration.
It preserves unexecuted OAuth, Workspace, upgrade and loaded-conversation proof.
Contributor guidance now matches the actual required Node 22/24 CI, current base
and conversation-resolution rules, without describing a nonexistent mandatory
second-account approval gate.

## Verification and remaining boundaries

The public metadata changes were read back against saved release identities.
No tag, asset, plugin manifest, archive, catalog or package version was changed.
No new release, old draft publication, draft deletion or provider action was
performed for this audit.

Focused regression tests cover empty-draft revision and its rejection boundaries,
notes/title checks, lost write responses, readback and existing immutable artifact
recovery. The normal `npm test` suite and required Node 22/24 PR CI own source
validation. These offline checks do not establish new real-host or OAuth behavior.

The procedure still has separate public-asset and main-merge steps because of
its current update architecture. It does not claim an atomic cross-system release
or an automated merge. Combining those operations later must preserve normal PR
protection and recover a lost response without replaying successful writes.

The already public v0.9.1 remains the current package. Publishing obsolete drafts
or changing its identity would not repair the history and could confuse updates.
