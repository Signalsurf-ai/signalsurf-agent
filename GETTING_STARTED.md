# Getting started with Signalsurf

The Signalsurf Plugin connects your AI host to Signalsurf Workspace and Project
context, Memory, reusable Skills, CRM, Signals, Workflows, Campaigns, and the
rest of the product capability graph. Install the Plugin once, authorize the
Workspaces it may reach, then start a fresh chat so the root router, focused
Skills, and MCP connection load together.

## Claude Code

Requires a Claude Code version with plugin marketplaces and remote HTTP MCP.

```sh
claude plugin marketplace add Signalsurf-ai/signalsurf-agent
claude plugin install signalsurf@signalsurf --scope user
```

Restart Claude Code after installation. The first Signalsurf tool call opens
the Signalsurf OAuth flow. Sign in, choose the allowed Workspaces, approve the
requested grants, and return to Claude Code.

To update later:

```sh
claude plugin marketplace update signalsurf
claude plugin update signalsurf@signalsurf
```

## Codex

```sh
codex plugin marketplace add Signalsurf-ai/signalsurf-agent
codex plugin add signalsurf@signalsurf
```

Start a new Codex thread after installation. The first Signalsurf tool call
opens OAuth. If the connection needs to be authorized explicitly, run:

```sh
codex mcp login signalsurf
```

To refresh the marketplace and reinstall the current version:

```sh
codex plugin marketplace upgrade signalsurf
codex plugin add signalsurf@signalsurf
```

## ChatGPT

The GitHub package above installs in Codex; it does not configure ChatGPT web.
In ChatGPT, install the reviewed Signalsurf connector when it appears in the
Plugin Directory. Until that review is complete, eligible workspace
administrators can add `https://mcp.signalsurf.ai/mcp` as a custom connector and
complete OAuth. A custom connector exposes the same tools and permissions but
does not bundle this repository's routing Skill, so begin with the read-only
verification prompt below.

## Cursor

Install Signalsurf from the Cursor Marketplace when the listing is available.
For local verification before marketplace review:

1. Clone `https://github.com/Signalsurf-ai/signalsurf-agent`.
2. Copy `plugins/signalsurf` into `~/.cursor/plugins/local/signalsurf`.
3. Restart Cursor or run **Developer: Reload Window**.
4. Open **Customize** and verify that the Signalsurf Skill and MCP server appear.

Teams and Enterprise administrators may need to enable local plugin imports.
The marketplace-installed copy takes precedence over a local copy with the same
name.

## Verify without changing data

Start a new chat and send:

> Connect to Signalsurf without changing data. Call get_workspace_context, then
> list_workspaces, and tell me which Agent, Workspaces, Project collaboration
> tools, and product tools are available.

A successful first run identifies the connected Agent and authorized
Workspaces before offering any write. When entering a Project, ask the AI to
call `get_project_context` before continuing the discussion.

## Reconnect or revoke

If a host cached an older authorization, disconnect or log out of Signalsurf in
that host, then start OAuth again. Revoking the Signalsurf grant prevents new
access tokens; already-issued access tokens expire within their short lifetime.

Never paste a Signalsurf access or refresh token into chat, a shell command, an
issue, or a support message.

## Raw MCP

Use raw MCP only for an agent host that cannot load the Plugin. Add
`https://mcp.signalsurf.ai/mcp` as a remote Streamable HTTP server and complete
the same OAuth flow. The server tools and permission checks are identical; the
host simply will not receive the Plugin's routing Skill.
