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

## Cursor and Grok Bot review

The package ships both the portable Agent Plugins manifest and a Cursor manifest.
Cursor discovers this directory through the repository's marketplace catalog.
Both use the root `mcp.json`, which connects to the existing hosted server over
Streamable HTTP. There are no local executables, install hooks, or embedded
credentials. A Signalsurf account and access to an authorized Workspace are
required; provider connections and usage limits follow the member's account.

The intended Grok Bot workflows include prospect research, CRM and List work,
and outreach drafting. Sending, publishing, and campaign activation are separate
actions; installing this plugin does not authorize them. Follow any server
confirmation or approval requirement before executing a change.

For review, first run the read-only prompt above. Then verify Project context
and capability discovery without starting a paid search, sending a message, or
modifying CRM data. Test writes only in a designated test Workspace with an
explicitly authorized operation. Verify confirmation and retry handling as well
as the resulting Record or File.

Grok Bot marketplace availability requires separate review and host testing.
See [Grok Bot setup](../../GETTING_STARTED.md#grok-bot). Report connection problems
without credentials through the repository's
[issue tracker](https://github.com/Signalsurf-ai/signalsurf-agent/issues).
See [Privacy](https://www.signalsurf.ai/privacy) and
[Terms](https://www.signalsurf.ai/terms) for the hosted service.

## Writing guidance

The packaged [Writing Skill](skills/writing/SKILL.md) supports standalone writing, review and rewrite as well as Content, Campaigns, Listening and Inbox copy. It selects email outreach, follow-up, conversation reply, LinkedIn post, X post, public reply, DM or connection-note guidance while preserving author voice and Chinese usage. The guidance is authored for SignalSurf. Product generation uses the same compiled references; `pnpm writing:sync` regenerates them and `pnpm check:plugin` verifies parity.
