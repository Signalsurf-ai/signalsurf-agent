# Signalsurf Plugin

The official Signalsurf Plugin connects Claude, Codex, or Cursor to Signalsurf
as the authenticated member's chief-of-staff interface, with the same Workspace
permissions, Project context, and product tools used in Signalsurf.

The Plugin bundles two things:

- the hosted Signalsurf MCP connection at `https://mcp.signalsurf.ai/mcp`;
- one root operating Skill plus focused Skills for Projects, Records, Tables,
  Signals, Listening, Workflows, Meetings, Content, Inbox, Campaigns,
  Knowledge, Connections, and custom Skills. Together they separate private
  exploration, bounded direct work, and durable Project work; distinguish
  Memory from Threads and resources; and use live capability schemas instead
  of a copied tool catalogue.

OAuth starts during installation or first use. Choose only the Workspaces the
AI should reach. Tokens are exchanged directly between the host and Signalsurf;
do not paste a token into chat or a terminal command.

After installing, start a new chat and ask:

> Connect to Signalsurf without changing data. Call get_workspace_context, then
> list_workspaces, and tell me which Agent, Workspaces, Project collaboration
> tools, and product tools are available.

See the repository [getting started guide](../../GETTING_STARTED.md) for
host-specific installation and update commands.

Raw MCP remains available for custom agents that cannot load plugins. It is a
developer transport fallback, not a separate Signalsurf mode.
