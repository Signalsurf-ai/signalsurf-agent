# One-off searches and retained research results

Choose the current outcome before choosing a tool family. Searching public posts once, inspecting more retained rows, saving results, and configuring continued monitoring are separate stages. Complete the requested stage without creating the next one.

## Search LinkedIn posts by keywords

Discover `linkedin_query` and inspect its current `accounts` and `search` actions. A LinkedIn people-only choice inside `social_search` describes that family, not every LinkedIn capability. Use the connected-account keyword post reader when it is available; a Listening is not required.

Resolve the intended usable account with `accounts` and existing user context. Ask which account only when several are available and the intended one is unresolved. Follow native Workspace access and account readiness. Read the live `query`, `sort`, `timeRange`, `limit` and `cursor` schema; do not transfer a Listening's recency limits to this one-off reader. Reuse the exact account/query/filter-bound `nextCursor` for further requested pages, within the requested count. One returned page is not an exhaustive search.

For another platform, discover its one-off post-search capability and actual source/target schema. Missing scope or a missing deployed reader is a specific limitation; an unsupported combination in one family does not prove the product has no route. Keep any previous successful result available while diagnosing the failed call.

## Read more of a retained result

A search preview may contain fewer rows or less text than the retained result. Reuse its exact `resultRef`. Discover `item_query` action `inspect_saved_result`; if the reference is no longer in context, use action `recent_results` to resolve the matching saved result from metadata. These are reads of existing results, not Sheet mutations. They do not refetch the provider or spend provider search credits.

Inspect the requested rows with the live pagination schema and returned `nextOffset` or `nextPage`, preserving the requested filters. Continue until the requested scope is read or the result has no further page. For truncated text, use the reader's `text` mode with the exact returned `rowKey`, field and text continuation. A result `rowKey` is not a persisted Sheet Item ID. Report inspected rows and remaining or truncated content separately from the stored result count.

If inspection fails, use its actual error to check the supplied reference, current scope and available reader. An expired result or unavailable reader is not fixed by creating a Sheet. Do not rerun a paid search merely to read an already returned result. Report unrecoverable or uninspected content without claiming it was reviewed.

Use [Sheets](../../sheets/SKILL.md) or [Records](../../records/SKILL.md) only for requested persistence, retaining the destination schema and native import rules. Use [Listening](../../listening/SKILL.md) when continuing collection is requested. Successful storage alone does not establish that every stored row or post body was inspected.
