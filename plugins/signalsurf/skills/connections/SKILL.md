---
name: connections
description: Use for Signalsurf connected services or accounts, integration destinations, Notion/Google/Asana browsing, sender connection state, or saved tool settings.
---

# Signalsurf Connections

Before every request using this Skill, follow [version check and automatic update](../signalsurf/references/freshness.md), then use the current guidance.

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

1. Use `connection_query` to inspect actual connected services/accounts; do not infer a connection from a remembered name.
2. Use `integration_browse` to resolve real destinations inside a connected provider.
3. For a requested Email or Social account connection, discover `integration_manage` action `connect_account` and its current input schema. Show the returned `authorizationUrl`; the member signs in and approves in the secure browser, then returns to the current host. Reconcile with the supported sync action and read `connection_query` again. A generated link is not proof of connection. Never request passwords or tokens. Other explicit destination/settings changes use `integration_manage`; protected setup follows its secure continuation flow.
4. Connection inventory is Workspace Commons. Do not bind it to a Project unless a Project action actually consumes the connection.
5. A connection change relies on its operation/resource history; post to a Project only when it changes that Play's ability, decision, or next action.
