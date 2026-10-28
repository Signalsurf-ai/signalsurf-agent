# Release the portable Agent package

This repository releases the complete SignalSurf Agent plugin. Hosted MCP,
optional npm CLI publication, marketplace approval and host caches have separate
lifecycles. A plugin release does not deploy or verify those components.

GitHub Releases is the changelog. Each public release has one stable version,
one immutable set of downloadable bytes and user-facing notes explaining what
changed and how to update. Use Node.js 22.13 or newer and `npm test`; no dependency
installation or credentials are needed for package checks.

## Choose the version and describe the change

Compare with the last publicly distributed package, including the active plugin
on `main`, existing public tags and downloadable releases. A GitHub draft is not
public, but merging its plugin into `main` already distributes it through the
updater. Never treat an unpublished GitHub Release as proof that its version has
not reached users.

- Use `0.MINOR.PATCH` before 1.0. Compatible fixes to guidance or packaging use a
  patch; compatible new procedures or capabilities use a minor. A breaking
  advertised interface or installation change requires migration notes and a
  minor bump before 1.0. Reset patch to zero for a new minor series.
- Unpublished candidate corrections retain the planned version. Identify each
  candidate by its full commit SHA and use a new preparation directory. A
  reviewed candidate changing is not itself another customer release.
- Once a version is publicly distributed, keep its tag and bytes fixed. Repair
  it with a forward release. Do not fill historical numbering gaps with obsolete
  drafts or downgrade an active version to make the history look sequential.
- Update all four plugin manifests together. Maintainer tooling and documentation
  outside the plugin do not need a plugin version bump or another release.
- The manifest version is `X.Y.Z`; both the Git tag and Release display title are
  exactly `vX.Y.Z`. Feature themes belong in the notes, not in a different title.
  The updater currently accepts only stable numeric versions.

Prepare reviewed UTF-8 release notes outside the checkout. Cover the cumulative
changes since the previous public release, including changes that reached `main`
without a completed GitHub Release. Explain changes to actual supported behavior;
keep package checks, host installation, loaded conversations, OAuth and hosted
product execution as separate observations.

A useful notes file has this shape:

```markdown
A short explanation of what users gain from this release.

## Changes

- Concrete improvements and fixes, with relevant public PR links.

## Updating

Use your app's supported plugin update or marketplace sync, then start a new
conversation. See the repository's Getting Started guide for host-specific steps.

## Compatibility and validation

State requirements, breaking changes and actual validation. Say which host,
OAuth or provider checks were not performed when relevant to the change.
```

Do not include private source mappings, customer records, machine paths, internal
approval history or full test logs. The release tool appends the exact candidate,
plugin tree and archive hash in a folded Artifacts section; those details should
not replace the user-facing notes. The notes are presentation metadata, outside
the immutable package assets.

## Prepare one committed candidate

Work on a release branch. Complete the changes, run `npm test` and commit. The
release tool reads committed Git objects; ignored or uncommitted files cannot
enter the package. Keep generated output outside the checkout.

```sh
node scripts/release.mjs prepare --candidate <full-candidate-A-SHA> --out <new-directory-A>
```

The output contains a deterministic complete-plugin ZIP with its MIT notice,
`marketplace.json`, `SHA256SUMS` and `release.json`. Ordering, timestamps and
modes are fixed. Existing output is verified, never overwritten.

Copy the generated catalog to `.claude-plugin/https-marketplace.json`, review it,
run `npm test` and commit candidate B. This catalog-only change does not change
the plugin tree. Rebuild and verify the final candidate:

```sh
git rev-parse <full-candidate-A-SHA>:plugins/signalsurf
git rev-parse <full-candidate-B-SHA>:plugins/signalsurf
node scripts/release.mjs prepare --candidate <full-candidate-B-SHA> --out <new-directory-B>
node scripts/release.mjs verify --candidate <full-candidate-B-SHA> --dir <directory-B>
```

Both plugin trees and the regenerated catalog must agree. Publish B with its own
receipt, not A's relabeled receipt. Staging validates the committed catalog byte
for byte before remote operations. A stale URL or hash blocks publication.

## Check readiness, stage and activate

Use local GitHub CLI authentication for the authorized maintainer. Before public
activation, confirm the exact PR head, required Node 22/24 CI, resolved review
conversations, current base and normal merge eligibility. Maintainers decide
review and merge; a separate person's approval is not a GitHub requirement.
Record changed host-install and advertised-tool compatibility proof separately
in the [compatibility matrix](compatibility.md). Package tests do not replace it.

Publication needs authority for the repository and version. `--authorize` records
that scope; it does not grant it or authorize unrelated merges or deletions.

```sh
node scripts/release.mjs stage --candidate <full-candidate-B-SHA> --dir <directory-B> --notes-file <reviewed-notes.md> --authorize Signalsurf-ai/signalsurf-agent@v<VERSION>
node scripts/release.mjs activate --candidate <full-candidate-B-SHA> --dir <directory-B> --notes-file <reviewed-notes.md> --authorize Signalsurf-ai/signalsurf-agent@v<VERSION>
```

`stage` reconciles the exact tag and release, resumes an existing matching draft,
updates its title and reviewed notes, and uploads only missing assets. Each
existing asset is downloaded and compared with the prepared bytes. It never
uses `--clobber`, replaces an asset or automatically retries an uncertain write.
An absent tag endpoint triggers a paginated release lookup; duplicate matches
stop the operation. A 404 alone does not mean a draft is absent.

`activate` requires complete matching staged assets and the exact reviewed title
and notes. It publishes the draft once, then reads back the release, full tag
identity and every asset. An already published matching version is verified
without republishing or rewriting its metadata. Neither command pushes Git or
merges a branch. Inspection runs inside both commands; use explicit `inspect`
for recovery or an independent read-only check.

## Revise an empty unpublished draft

A correction before staging assets does not need a new patch version. Prepare
and verify the corrected candidate and catalog in new output directories. Then
explicitly reconcile the old draft:

```sh
node scripts/release.mjs revise --candidate <new-full-candidate-SHA> --previous-candidate <old-full-candidate-SHA> --dir <new-preparation-directory> --notes-file <reviewed-notes.md> --authorize Signalsurf-ai/signalsurf-agent@v<VERSION>
```

This is permitted only for the exact same-version draft, with no tag and zero
assets, whose previous candidate matches the supplied SHA. The version must be
newer than active `main`; a version already distributed there cannot be reused.
The tool reads back the new identity before ordinary staging can continue.
Published releases, tagged candidates, nonempty drafts and unknown identities
remain blocked. Do not discard or replace their artifacts to satisfy this path.
Resolve such states explicitly; a failed preparation does not automatically
justify another public version.

## Complete and verify the user update

The updater and HTTPS installation catalog currently read `main`, so public
assets must exist before their pointers merge. Do not reverse this ordering
without first separating update discovery from the development branch.

After activation, anonymously download the assets and verify the prepared bytes.
Merge the reviewed candidate through its normal PR with the exact expected head.
Read back `main`'s plugin tree, all four manifest versions and catalog URL/hash;
compare them with the immutable candidate, tag and anonymously downloadable ZIP.
The merge SHA may differ; its plugin tree and catalog must agree.

A release is complete when public downloads and active `main` pointers agree.
Publishing assets with a blocked PR is an incomplete activation, not a finished
update. Avoid entering that state by checking merge readiness before publication.
Verify a fresh install through the applicable route receipt or an isolated host
run, then record the exact host version and remaining OAuth/Workspace/reload gaps.

Release titles and notes may be corrected independently of package bytes. Make
metadata-only corrections without inventing a new plugin version. Historical
releases retain their original asset formats and verification limits.

## Recover an interrupted operation

```sh
node scripts/release.mjs inspect --candidate <full-candidate-SHA> --dir <preparation-directory>
```

- After a lost creation, revision, upload or publication response, inspect the
  actual release/tag/assets before another command. Resume only the missing
  operation; never assume the server rejected a write because its response failed.
- An empty-draft revision that already read back at the new exact candidate is
  accepted on reinvocation without repeating the mutation.
- Existing assets or a tag with different identities require investigation.
  Preserve them; never delete/recreate an uncertain release or move a public tag.
- If assets are public but merge is pending, keep the prior active pointers until
  the PR can merge. If merge itself was interrupted, reconcile the PR and `main`
  before any retry.
- Repair bad installed guidance with a forward patch. A silent downgrade does not
  update existing users. Preserve host data, unrelated plugins, locks and any
  `recovery_required` installation while following host recovery controls.

The release tests cover deterministic artifacts, candidate and catalog identity,
empty-draft revisions, reviewed notes, corrupt/missing assets, interrupted writes
and idempotent recovery in disposable fixtures. They do not publish a release or
establish real host, OAuth, provider or hosted-MCP compatibility.
