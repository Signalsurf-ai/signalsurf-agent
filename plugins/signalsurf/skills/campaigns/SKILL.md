---
name: campaigns
description: Use for Signalsurf Campaign creation or lifecycle, audiences, messages, sender accounts, Domains, Mailboxes, capacity, readiness, Warm-up, or deliverability planning.
---

# Signalsurf Campaigns

Before every request using this Skill, follow [version check and automatic update](../signalsurf/references/freshness.md), then use the current guidance.

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

When writing, reviewing or rewriting copy, read [Writing](../writing/SKILL.md) and only the matching purpose/channel references. Use the native procedure below to read, save or send; a writing request does not expand permissions.

1. Resolve the audience and Campaign with Records/Lists plus `campaign_query`; inspect before editing.
2. Use `campaign_manage` for the Campaign's supported create/change actions. Treat draft, preparation, launch, and observed results as distinct states.
3. Use `sender_query` and `sender_infrastructure_query` for account settings, capacity, live inventory, Domains, Mailboxes, and readiness. Read the root Skill's sender-infrastructure reference before recommending setup.
4. Use the live `sender_manage` schema for supported account connection/settings, approved inbox creation across one or multiple owned Domains, and future Domain auto-renew preferences. For one mixed Domain/inbox/warm-up purchase link, use `sender_infrastructure_query` action `setup` with `intent: service_basket` and the exact full basket. Hosting and warming are paid services separate from module connection capacity. Domain registration, billing details and credentials retain their protected flow; read the sender-infrastructure reference for exact scope and result handling.
5. External sends, paid setup, and consequential lifecycle actions obey their confirmation boundary. Never claim payment, provisioning, readiness, or delivery from an earlier planning result.
6. Keep Campaign configuration/history in the resource; write hypotheses, experiment design, evidence, conclusions, and next action to the Project Thread.

## Message conditions

- Read the live authoring schema and existing Campaign before changing a condition. Supported message `sendIf` values are `always` (no additional no-reply gate for the step) and `no_reply` (only if the contact has not replied). Campaign reply-stop rules still apply to the sequence.
- The first LinkedIn DM after an invitation is acceptance-gated automatically; do not promise to send it before acceptance. Lower-level relationship branches such as `not_accepted` are not general selectable message conditions unless the live capability explicitly exposes them.
- Use a trigger the user has already specified. When the follow-up intent leaves time-only versus no-reply behavior unresolved, ask before creating or changing the sequence. Show the resolved condition with the Message/Wait steps in the existing confirmation; never add a hidden condition.

## Monthly sending and purchase planning

Read [sender infrastructure planning](../signalsurf/references/sender-infrastructure-routing.md) before recommending infrastructure. Ask for the desired total monthly Email messages (including follow-ups), the launch deadline, and the waiting period the user accepts for setup/warm-up. If they give recipients instead of message volume, clarify touches per recipient. Preserve answers already supplied.

Use `sender_infrastructure_query` action `plan_capacity` with `demandSource: monthly` and `monthlyMessages`, or `outbox` for already queued work. Set the accepted `newMailboxPreparationDays`, whether `warmupNewMailboxes` should be included, and the available planning days. Compare the current senders, a conservative preparation/ramp option, and a faster option using verified established senders or an extended deadline. Derive quantities and prices from the canonical calculator, never an improvised division using steady-state limits. A plan whose preparation consumes the window cannot meet that deadline by buying more new inboxes.

Standard retail is USD5/inbox/month and USD15/warm-up slot/month. Standard domain registration is USD20 for one year; exact names still need live availability/cost validation. Explain initial payment separately from subsequent monthly fees and future domain renewals. Included module connection slots are not paid hosting or warm-up slots. Explicit infrastructure grants are equivalent service rights, and remain distinct from module grants.

The preparation period and real-send ramp are assumptions, not an ETA for a particular heat score or a delivery guarantee. Read fresh heat scores, observation timestamps, verified warm-up days, DNS and placement evidence before launch; report stale/missing evidence. Ask the user to choose an acceptable schedule rather than promising a score by a date.

After the user chooses quantities, use exact Domain names, owned Domain IDs and inbox aliases to produce one `service_basket` purchase link. Warm-up slots may be bought separately and assigned later. Opening the link has no side effect; protected confirmation/payment must precede provider fulfillment. Inspect `view: purchases` with the exact order ID after checkout, then inspect actual infrastructure readiness. Resume uncertain orders by ID instead of buying replacements. Use `sender_manage` action `update_settings` with `syntheticWarmup` to connect, pause/resume/stop, synchronize evidence or configure warming. The existing `warmup` boolean controls the real-send ramp only. Pausing warming does not cancel its recurring charge; subscription cancellation uses the protected purchase management surface.

To replace which inbox is warming, inspect both accounts and slot occupancy first, then use `sender_manage` action `update_settings` on the source account with `syntheticWarmup: {action: transfer, requestId, targetAccountId}`. Require an exact prepared idle target and native approval. Keep the same request ID during reconciliation. The canonical operation confirms source release before enabling the target; uncertain release retains occupancy. Transfer does not delete either inbox, purchase slots, reset warming history, guarantee the target score, or cancel recurring charges. Inspect both accounts afterward.
