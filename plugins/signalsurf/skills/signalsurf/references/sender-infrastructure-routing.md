# Sender infrastructure routing

Use Signalsurf's current inventory and capacity facts instead of guessing how many Domains or Mailboxes a Campaign needs.

1. Call `sender_infrastructure_query` action `inspect` to read existing Domains, Mailboxes, health, usage, and readiness.
2. When audience size, touches, and sending days are known, call action `plan_capacity`. Treat its per-Mailbox rate, utilization, and Mailboxes-per-Domain values as editable planning assumptions; extending the timeline can be preferable to buying capacity.
3. If more capacity is wanted, call action `search_domains` for live availability and exact quotes. Ask the member to choose the actual basket when they have not already chosen it.
4. Call action `setup` only after the intended Domain basket or existing Domain is concrete. It returns a secure Signalsurf continuation link and does not purchase, provision, or change provider state. The member completes protected and paid steps in Signalsurf; never request or relay contact, billing, credential, or Mailbox secret fields through the host conversation.
5. After the member completes the continuation, call action `inspect` again. Treat payment and readiness as different milestones. Do not prepare or start an Email Campaign until current Domain authentication, Mailbox health, capacity, and required approvals support it.

Use the `domains` setup intent for a chosen new Domain basket. Use `mailboxes` only with a Domain id returned by the current authorized Workspace inventory. Never reuse a Domain id from another Workspace or invent one from a label.

Warm-up and Placement Test results are evidence, not guarantees. Do not claim that a fixed Domain/Mailbox ratio or elapsed warm-up period guarantees inbox placement.
