---
name: connections
description: Use for Signalsurf connected services or accounts, integration destinations, Notion/Google/Asana browsing, sender connection state, or saved tool settings.
---

# Signalsurf Connections

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

1. Use `connection_query` to inspect actual connected services/accounts; do not infer a connection from a remembered name.
2. Use `integration_browse` to resolve real destinations inside a connected provider.
3. Use `integration_manage` only for explicit destination/settings changes. OAuth, secrets, credentials, and protected setup stay in Signalsurf's secure UI/continuation flow.
4. Connection inventory is Workspace Commons. Do not bind it to a Project unless a Project action actually consumes the connection.
5. A connection change relies on its operation/resource history; post to a Project only when it changes that Play's ability, decision, or next action.
