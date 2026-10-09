# Signalsurf Plugin

The official Signalsurf Plugin connects Claude, Codex, or Cursor to Signalsurf
as the authenticated member's chief-of-staff interface, with the same Workspace
permissions, Project context, and product tools used in Signalsurf.

The Plugin bundles two things:

- the hosted Signalsurf MCP connection at `https://mcp.signalsurf.ai/mcp`;
- one root operating Skill plus focused Skills for Projects, Records, Tables,
  Signals, Listening, Workflows, Meetings, Content, Inbox, Campaigns,
  Knowledge, Connections, and custom Skills. They choose work context, resource targets, execution and result persistence
  independently. A direct File operation can use Project context without a
  Thread or ownership transfer. Portable references share the maintained core
  and composed research, lead-sourcing and personal Outbox procedures; live
  capability schemas supply the callable contract.

OAuth starts during installation or first use. Choose only the Workspaces the
AI should reach. Tokens are exchanged directly between the host and Signalsurf;
do not paste a token into chat or a terminal command.

After installing, start a new chat and ask:

> Connect to Signalsurf without changing data. Call get_workspace_context, then
> find_capabilities, and tell me which Agent, Workspaces, Project collaboration
> tools, and product tools are available.

See the repository [getting started guide](../../GETTING_STARTED.md) for
host-specific installation and update commands.

Raw MCP remains available for custom agents that cannot load plugins. It is a
developer transport fallback, not a separate Signalsurf mode.

## Writing guidance

The packaged [Writing Skill](skills/writing/SKILL.md) supports standalone writing, review and rewrite as well as Content, Campaigns, Listening and Inbox copy. It selects email outreach, follow-up, conversation reply, LinkedIn post, X post, public reply, DM or connection-note guidance while preserving author voice and Chinese usage. The guidance is authored for SignalSurf. Product generation uses the same compiled references; `pnpm writing:sync` regenerates them and `pnpm check:plugin` verifies parity.
