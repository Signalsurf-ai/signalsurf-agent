---
name: campaigns
description: Use for Signalsurf Campaign creation or lifecycle, audiences, messages, sender accounts, Domains, Mailboxes, capacity, readiness, Warm-up, or deliverability planning.
---

# Signalsurf Campaigns

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

When writing, reviewing or rewriting copy, read [Writing](../writing/SKILL.md) and only the matching purpose/channel references. Use the native procedure below to read, save or send; a writing request does not expand permissions.

1. Resolve the audience and Campaign with Records/Lists plus `campaign_query`; inspect before editing.
2. Use `campaign_manage` for the Campaign's supported create/change actions. Treat draft, preparation, launch, and observed results as distinct states.
3. Use `sender_query` and `sender_infrastructure_query` for account settings, capacity, live inventory, Domains, Mailboxes, and readiness. Read the root Skill's sender-infrastructure reference before recommending setup.
4. Use `sender_manage` only for supported account connection/settings. Protected purchase, credentials, provider provisioning, and readiness remain inside Signalsurf's secure flow.
5. External sends, paid setup, and consequential lifecycle actions obey their confirmation boundary. Never claim payment, provisioning, readiness, or delivery from an earlier planning result.
6. Keep Campaign configuration/history in the resource; write hypotheses, experiment design, evidence, conclusions, and next action to the Project Thread.

## Message conditions

- Read the live authoring schema and existing Campaign before changing a condition. Supported message `sendIf` values are `always` (no additional no-reply gate for the step) and `no_reply` (only if the contact has not replied). Campaign reply-stop rules still apply to the sequence.
- The first LinkedIn DM after an invitation is acceptance-gated automatically; do not promise to send it before acceptance. Lower-level relationship branches such as `not_accepted` are not general selectable message conditions unless the live capability explicitly exposes them.
- Use a trigger the user has already specified. When the follow-up intent leaves time-only versus no-reply behavior unresolved, ask before creating or changing the sequence. Show the resolved condition with the Message/Wait steps in the existing confirmation; never add a hidden condition.
