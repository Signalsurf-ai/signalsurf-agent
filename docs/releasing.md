# Release the portable Agent package

This repository owns the portable package and its release preparation. Hosted MCP
deployment, CLI npm publication, marketplace listing approval and each host's
installed cache have separate lifecycles. This procedure does not deploy them.
GitHub Releases is the changelog; describe the concrete changes and actual proof
there. Do not publish private source mappings, customer records or full test logs.

Use Node.js 22.13 or newer and `npm test`. The checks need no dependencies,
credentials, private source or hosted services. Public CI runs the same command
on Node 22 and 24. Host/OAuth/model acceptance is recorded separately in the
shared [compatibility matrix](compatibility.md). Keep applicable evidence and
rerun checks only when their inputs or claimed environment changed.

## Versions and immutable identities

- Update all four plugin manifests together. A patch fixes compatible guidance,
  packaging or tooling; a minor adds compatible procedures/capabilities; a major
  changes or removes an advertised package interface or installation contract.
  Before 1.0, a breaking change still needs explicit migration notes and a minor
  bump. The updater accepts stable numeric versions only.
- A new distributable plugin tree requires a new version. Never move a published
  tag, replace an existing asset, or reuse a version for different plugin bytes.
  Repair a bad successful release with a forward patch.
- Every release binds a full public candidate SHA, its plugin Git tree, version,
  tag, ZIP, HTTPS catalog, checksums and `release.json` receipt. A merge commit may
  have a different SHA while retaining the reviewed plugin tree; verify the tree
  and catalog after the merge. A checksum verifies content integrity and does not
  independently authenticate a publisher.
- Maintainers approve the candidate through the normal PR/review process.
  Publishing additionally requires authorization covering the repository and
  version. The `--authorize` flag records that scope; it does not grant it.

## Prepare one committed candidate

Work on a release branch. Update manifests, notices, Skills and tests, then run
`npm test` and commit. Use an output directory outside the checkout. The tool
reads Git objects at the requested SHA; ignored or uncommitted files cannot enter
an artifact. It validates the exported public snapshot before building.

```sh
node scripts/release.mjs prepare --candidate <full-candidate-A-SHA> --out <new-preparation-directory-A>
```

This creates a deterministic ZIP rooted at the independently installed plugin,
with its complete MIT notice, plus `marketplace.json`, `SHA256SUMS` and
`release.json`. ZIP ordering, timestamps and file modes are fixed. Running it
again for the same output only verifies matching bytes; it never overwrites them.

Copy the generated `marketplace.json` to
`.claude-plugin/https-marketplace.json`, review it, run `npm test` again, and commit
the catalog as candidate B. Confirm candidate A and B have the same plugin tree:

```sh
git rev-parse <full-candidate-A-SHA>:plugins/signalsurf
git rev-parse <full-candidate-B-SHA>:plugins/signalsurf
node scripts/release.mjs prepare --candidate <full-candidate-B-SHA> --out <new-preparation-directory-B>
node scripts/release.mjs verify --candidate <full-candidate-B-SHA> --dir <preparation-directory-B>
```

Both tree values and the regenerated catalog must agree. Use candidate B and its
new receipt for publication; never relabel A's receipt. Candidate A is for
preparation only: `stage` and `activate` compare its committed HTTPS catalog with
the generated `marketplace.json` byte for byte and reject a stale URL, hash or
other catalog difference before any remote operation. Include public PR checks,
required maintainer review, applicable private integration parity and changed
host-install receipts in the release decision. Portable package checks do not
substitute for those independently owned gates. Release tools do not bypass PR
or branch protection.

## Stage, verify and activate

These commands use GitHub CLI with an already-authorized maintainer account.
`inspect` only reads. `stage` and `activate` require the exact authorized candidate
and repository/version argument; they do not push Git or merge a branch.

```sh
node scripts/release.mjs inspect --candidate <full-candidate-B-SHA> --dir <preparation-directory-B>
node scripts/release.mjs stage --candidate <full-candidate-B-SHA> --dir <preparation-directory-B> --authorize Signalsurf-ai/signalsurf-agent@v<VERSION>
node scripts/release.mjs inspect --candidate <full-candidate-B-SHA> --dir <preparation-directory-B>
node scripts/release.mjs activate --candidate <full-candidate-B-SHA> --dir <preparation-directory-B> --authorize Signalsurf-ai/signalsurf-agent@v<VERSION>
```

`stage` reconciles the exact tag/release first, creates a draft only if absent,
uploads only missing assets, and downloads every present asset to compare exact
bytes. If GitHub's tag lookup returns 404, it searches every page of the
authenticated release listing for that exact tag; an existing draft is resumed,
and duplicate matches stop the operation. A 404 from tag lookup alone is not
proof that creation failed. It refuses mismatched existing tags/assets, duplicate
asset names and unexpected assets. It never uses `--clobber`. A draft creation
or upload with an uncertain response ends the command without an automatic replay.

`activate` requires all staged bytes to match before publishing the draft. It
reads back the published release, full tag target and every asset. It refuses a
version older than the active package. Existing matching publication is accepted
without republishing. Run `inspect` after an interrupted command and reconcile the
returned release/tag/asset identity before another invocation.

**Publish and verify downloadable assets before merging the version/catalog into
main.** The updater currently reads main; HTTPS installation reads the catalog on
main. Once assets are public and verified, merge the reviewed release candidate
through its PR. Independently read back the main plugin tree, manifest version,
catalog URL/hash, tag and anonymously downloadable ZIP. Verify a fresh install
with the applicable existing route receipt or an isolated host run. Record any
unavailable host, OAuth or Workspace proof explicitly.

Do not merge a new current-version/catalog pointer while its download is absent.
Publishing assets alone leaves existing main users on the prior version; merging
the verified pointers activates the new version for those users. This ordering
also allows a staged candidate to be reviewed before main changes.

## Partial failures and recovery

- Draft creation/upload failed or timed out: run `inspect`. A separate `stage`
  invocation reads remote identity and matching bytes before filling missing
  assets; it does not repeat successful writes. A mismatch requires investigation
  or a new version. Do not delete/recreate uncertain releases.
- Publication response was lost: run `inspect`. If already published and matching,
  another `activate` invocation only verifies. Never assume that a failed client
  response means the server rejected a write.
- Assets published, main merge pending: keep the prior main pointers until the
  reviewed candidate can merge. Do not publish a different tree under that version.
- Main activation interrupted: inspect main, the PR/merge result, tag and catalog;
  resume the existing merge only after reconciling it. The release tool deliberately
  does not retry Git pushes or branch mutations.
- Bad guidance successfully installed: prepare a forward patch and publish through
  this same procedure. The updater only installs a numerically newer version, so
  silently restoring an older main manifest does not repair affected installs.
  Hosts with pinned or managed installations use their supported update/recovery
  controls, then reload guidance. Preserve Workspace data and unrelated plugins.
- Updater swap failed: existing rollback/lock recovery preserves the previous
  installation. Follow its `recovery_required` location and the supported host
  recovery guide; never delete another process's lock or a preserved package.

The test suite exercises deterministic artifacts, missing notices, wrong
candidates, stale committed catalogs, moved tags, corrupt/missing assets,
interrupted uploads, lost draft creation/publication responses, GitHub draft
lookup across pages and idempotent reconciliation in disposable local fixtures.
Those fixtures do not publish a release or establish real host/OAuth compatibility.
