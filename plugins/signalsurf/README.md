# SignalSurf Plugin

The official SignalSurf Plugin connects Claude, Codex, ChatGPT, or Cursor to
the same SignalSurf Agent, Workspace permissions, Project context, and product
tools used in SignalSurf.

The Plugin bundles two things:

- the hosted SignalSurf MCP connection at `https://mcp.signalsurf.ai/mcp`;
- one small routing Skill that loads Workspace and Project context and writes
  durable conclusions back to the appropriate Project Thread.

OAuth starts during installation or first use. Choose only the Workspaces the
AI should reach. Tokens are exchanged directly between the host and SignalSurf;
do not paste a token into chat or a terminal command.

After installing, start a new chat and ask:

> Connect to SignalSurf without changing data. Call get_context, then
> list_workspaces, and tell me which Agent, Workspaces, Project collaboration
> tools, and product tools are available.

See the repository [getting started guide](../../GETTING_STARTED.md) for
host-specific installation and update commands.

Raw MCP remains available for custom agents that cannot load plugins. It is a
developer transport fallback, not a separate SignalSurf mode.
