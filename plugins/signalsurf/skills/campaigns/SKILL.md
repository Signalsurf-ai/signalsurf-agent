---
name: campaigns
description: Use for SignalSurf Campaign creation or lifecycle, audiences, messages, sender accounts, Domains, Mailboxes, capacity, readiness, Warm-up, or deliverability planning.
---

# SignalSurf Campaigns

1. Resolve the audience and Campaign with Records/Lists plus `campaign_query`; inspect before editing.
2. Use `campaign_manage` for the Campaign's supported create/change actions. Treat draft, preparation, launch, and observed results as distinct states.
3. Use `sender_query` and `sender_infrastructure_query` for account settings, capacity, live inventory, Domains, Mailboxes, and readiness. Read the root Skill's sender-infrastructure reference before recommending setup.
4. Use `sender_manage` only for supported account connection/settings. Protected purchase, credentials, provider provisioning, and readiness remain inside SignalSurf's secure flow.
5. External sends, paid setup, and consequential lifecycle actions obey their confirmation boundary. Never claim payment, provisioning, readiness, or delivery from an earlier planning result.
6. Keep Campaign configuration/history in the resource; write hypotheses, experiment design, evidence, conclusions, and next action to the Project Thread.
