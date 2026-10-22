# Exact List People discovery and Enrich

**Request:** “Use `<company-list-id>` to find accountable People and save them into `<people-list-id>` within the approved limit.”

1. Resolve both exact Lists, native scope, declared schemas and existing identities. Inspect the live `people_search` source/filter/cost schema. Keep the eligible Company source as `sourceListId` and the exact requested destination `listId`; another Company search or intermediate Sheet is not required.
2. Dispatch the approved bounded search. Retain its `resultRef` and returned required continuation; import through the native `record_manage` create continuation instead of reconstructing provider rows.
3. Read actual saved Person identities and verified Company relations. If only three of five requested candidates are verified/saved, report three and the remaining gap. Do not relax filters, infer employer links or enroll a Campaign to fill the shortfall.

**Existing-field variant:** for a missing supported field on selected active List members, inspect the exact List's saved binding and native Enrich scope. Keep `listId`, correct membership/canonical IDs and one exact field; never borrow collection-wide access. Queued Enrich is not filled cells: inspect run IDs and read back those cells.

**Unknown result:** reconcile the original search/import/run receipt before another paid attempt or write. Resume its exact supported continuation. Stop at the requested stage; no extra discovery, automatic new-member Enrich or outreach follows from saving People.
