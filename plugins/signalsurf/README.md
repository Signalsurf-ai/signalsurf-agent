# SignalSurf Plugin

The official SignalSurf Plugin connects Claude, Codex, or Cursor to
the same SignalSurf Agent, Workspace permissions, Project context, and product
tools used in SignalSurf.

The Plugin bundles two things:

- the hosted SignalSurf MCP connection at `https://mcp.signalsurf.ai/mcp`;
- one routing Skill that separates private exploration, bounded direct work,
  and durable Project work; routes the same Agent into the right Project as the
  Play's DRI; and uses Threads as shared state without pretending they schedule
  a separate internal Agent.

OAuth starts during installation or first use. Choose only the Workspaces the
AI should reach. Tokens are exchanged directly between the host and SignalSurf;
do not paste a token into chat or a terminal command.

After installing, start a new chat and ask:

> Connect to SignalSurf without changing data. Call get_workspace_context, then
> list_workspaces, and tell me which Agent, Workspaces, Project collaboration
> tools, and product tools are available.

See the repository [getting started guide](../../GETTING_STARTED.md) for
host-specific installation and update commands.

Raw MCP remains available for custom agents that cannot load plugins. It is a
developer transport fallback, not a separate SignalSurf mode.
