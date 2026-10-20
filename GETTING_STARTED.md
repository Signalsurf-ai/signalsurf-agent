# Getting started with Signalsurf

The Signalsurf Plugin connects your AI host to Signalsurf Workspace and Project
context, Memory, reusable Skills, CRM, Signals, Workflows, Campaigns, and the
rest of the product capability graph. Install the Plugin once, authorize the
Workspaces it may reach, then start a fresh chat so the root router, focused
Skills, and MCP connection load together.

## Updates on use

From version 0.7.1, every request using a root or focused SignalSurf Skill starts
with a public release check. With Node.js 18+ and a writable installed plugin,
the bundled updater automatically installs the complete newer package from one
verified commit. The agent then reloads the root, shared and relevant focused
guidance before continuing. Failed checks keep the installed package; source
Git checkouts are preserved. Hosts with web reads but no writable installation
load current guidance directly from the pinned public release and report that
the local installation was not changed.

An installation older than 0.7.1 needs one marketplace update using the host
commands below to receive this entry check. Start a fresh chat after that initial
update. Later per-request refreshes reload the relevant guidance in the current
conversation; host version labels may remain cached until a new session.
Raw MCP connections receive live tools and adapter instructions, without an
installed plugin package to update. OAuth grants and hosted MCP deployment are
independent of Skill updates.

## Claude Code

Requires a Claude Code version with plugin marketplaces and remote HTTP MCP.

```sh
claude plugin marketplace add Signalsurf-ai/signalsurf-agent
claude plugin install signalsurf@signalsurf --scope user
```

Restart Claude Code after installation. The first Signalsurf tool call opens
the Signalsurf OAuth flow. Sign in, approve the requested grants for current and
future accessible Workspaces, and return to Claude Code. The server rechecks
current membership and permissions on every call.

For the initial update from an older version, or manual recovery:

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

For the initial update from an older version, or manual recovery:

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

## Grok Bot

Grok Bot uses Cursor marketplace connectors. The Signalsurf package contains a
remote MCP server and portable Skills; it does not need a local MCP process.
Public listing approval and a verified Grok Bot installation are separate from
publishing this repository. Until a listing is approved, do not assume that
Signalsurf will appear in **Connect apps**.

Once the Signalsurf listing is available for Grok Bot:

1. Open **Connect apps** and search for **Signalsurf**.
2. Verify the publisher and source are Signalsurf and this repository, then add
   the plugin.
3. Complete Signalsurf OAuth in the browser, approving the requested grants for
   current and future accessible Workspaces.
4. Confirm the plugin appears under **Installed**, start a new chat, and attach
   Signalsurf with `@`.
5. Run the read-only verification prompt below before requesting changes.

If the plugin is marked **Disabled by team admin**, the team's Cursor connector
policy must allow it. An empty search result is not an OAuth failure; check
listing availability first. A raw MCP connection does not install these Skills,
and local Cursor installation does not prove Grok Bot compatibility.

See the official [Grok Bot connection guide](https://cursor.com/help/grok-bot/connect-plugins)
and [plugin format reference](https://cursor.com/docs/reference/plugins).

### Grok Bot still loads an older Skill

If reinstalling keeps returning an old version such as 0.2.2, that package
predates the per-request freshness entrypoint. Reinstalling alone does not prove
that the marketplace has published a newer package. The public GitHub release,
the marketplace package, the installed manifest and the guidance already loaded
in a chat are separate observations. Report the evidence for each; do not infer
that Cursor's catalog is stale solely from the Bot's response.

Start a fresh Grok Bot chat, attach Signalsurf with `@`, and send:

> Before using Signalsurf tools, read
> https://raw.githubusercontent.com/Signalsurf-ai/signalsurf-agent/main/plugins/signalsurf/skills/signalsurf/references/freshness.md
> and follow its pinned public guidance fallback. Load the root Skill, shared
> operating contract and relevant focused guidance from the verified commit.
> Report the public version and commit, and the installed version only if you
> can inspect its manifest. Keep checking freshness on every Signalsurf request.
> Loading guidance is not an installation update. Do not modify Workspace data.

This fallback works when the Bot can read the public web even if it cannot
replace its managed plugin. If those reads fail, freshness remains unverified;
the Bot must not claim it updated the installation. A local Cursor plugin
installation does not update the cloud Bot. New MCP connections also receive
the freshness reminder from the hosted server after that server change is
deployed; this does not publish a new marketplace package.

## Start setup in your AI

You can begin in your AI without visiting the Signalsurf dashboard first.
Install or connect the Plugin using the host instructions above, then paste:

> Help me get started with Signalsurf here. Use the onboarding Skill if
> available and follow our conversation's language. Ask for my website and the
> outcome I want, explain the relevant
> capabilities, and interview me one question at a time. Reuse any saved
> Workspace and Memory context before asking again. Guide me through secure
> Signalsurf and provider authorization links when needed, then return here.
> Automatically save and update useful durable context in the correct authorized
> User, Workspace or Project Memory, without asking me to approve each save. Read
> existing blocks first, preserve unrelated facts and verify the saved result.
> Keep private personal context and private chat history out of shared Memory.
> Unless I choose another outcome, guide me from
> Signal-based outbound or TAM mapping to a bounded People audience, connect
> Email or LinkedIn, and prepare a Campaign. Obtain separate explicit approval
> before activation or sending, and complete one accepted initial setup. Show the
> exact confirmation before paid work, account changes or finishing onboarding.
> Verify what was saved and connected; keep pending steps explicit.

The prompt begins the conversation; your host must still support and authorize
an MCP connection. Sign-in, Workspace consent, signup eligibility and Gmail or
other provider OAuth remain secure browser steps. New-account bootstrap depends
on the deployed consent flow. A copied prompt, authorization link or queued
research job is not completed onboarding.

The default outreach path can pause at a saved audience or prepared Campaign.
Connecting an account does not establish sender readiness, and accepting setup
does not approve sending. The AI reports the actual saved, connected, prepared,
queued or delivered state and any remaining authorization.

When switching between Claude, Codex and the App, select the same Workspace and
load its context. Saved Memory and business resources continue across hosts;
private host transcripts are not automatically imported.

## Verify without changing data

Start a new chat and send:

> Connect to Signalsurf without changing data. Call get_workspace_context, then
> find_capabilities, and tell me which Agent, Workspaces, Project collaboration
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
