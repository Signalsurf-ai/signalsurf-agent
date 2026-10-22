# Reconcile an unknown mutation before an exact retry

**Request:** “The exact List deletion timed out. Check whether it happened.”

1. Keep the original target, revision, payload and `operationId`. Inspect native state and available receipt/Project File evidence under current authority. A timeout does not establish success or failure.
2. If the receipt confirms deletion, report that result; the backing Records remain. If native state/receipt establishes that a retry is permitted, resume the exact request with the same operation identity and bound payload. Do not create a Project, enter an inaccessible historical Project, add grants or claim File ownership to bypass the native lifecycle.
3. If execution remains unknown, report the actual uncertainty and stop. Do not issue a new deletion identity or weaken dependency/protected-resource checks. Existing native confirmation resumes remain bound.

The same reconciliation principle applies to uncertain import, paid research, publication and sends, using each operation's actual native receipt and continuation. A new desired effect gets a new operation ID; a retry of one exact effect does not. A provider success without durable native result may require reconciliation, not another provider effect.
