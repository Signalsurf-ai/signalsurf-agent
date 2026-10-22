# Getting started with Signalsurf

Choose your AI app, add Signalsurf, connect your account, and verify access.
Claude Code can install the complete plugin from an HTTPS catalog and ZIP,
without Git, npm, or a GitHub account. The repository-based Claude Code installer
still requires Git. Other apps have the interface paths below. You need an eligible
Signalsurf account and access to the Workspace you use. Approved new-account
bootstrap depends on the deployed consent flow.
Organization policy, plan, app version, and listing availability can limit
which installation options you see.

| Your app                                | Installation path                                                                  | Availability boundary                                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [Claude Code](#claude-code-without-git) | HTTPS catalog + SHA-256-pinned ZIP.                                                | Requires Claude Code 2.1.224+ and publication of the release assets and catalog.                              |
| [Claude / Cowork](#claude-and-cowork)   | Add this repository as a marketplace in Customize.                                 | Your organization must allow custom marketplaces.                                                             |
| [Codex / ChatGPT](#codex-and-chatgpt)   | Install an available directory/workspace plugin; admins can import the repository. | Workspace import requires an admin and GitHub authorization. Imported MCP packages have desktop restrictions. |
| [Cursor](#cursor)                       | Install in Customize, or have an admin import a team marketplace.                  | Public listing availability and team access must be checked.                                                  |
| [Grok Bot](#grok-bot)                   | Add from Connect apps.                                                             | A listing visible to your account and host verification are required.                                         |

The repository URL is `https://github.com/Signalsurf-ai/signalsurf-agent`.
The custom MCP server URL is `https://mcp.signalsurf.ai/mcp`. They serve different
setup fields. Pasting the repository URL into a conversation lets an AI read
instructions; installation still needs the app's supported installer.

This repository is a marketplace containing a plugin at `plugins/signalsurf`.
Use a marketplace import for the repository URL. A single-plugin importer that
requires a manifest at the repository root may reject it; installing Git does
not change the package layout.

## Claude Code without Git

**Requirements:** Claude Code 2.1.224 or later and HTTPS access to the catalog
and ZIP download. If either URL returns 404, use the temporary MCP path below
or contact Signalsurf support. Do not install Git to work around a download
availability problem.

In Claude Code 2.1.224 or later, paste these into the Claude Code conversation,
one at a time:

```text
/plugin marketplace add https://raw.githubusercontent.com/Signalsurf-ai/signalsurf-agent/main/.claude-plugin/https-marketplace.json
/plugin install signalsurf@signalsurf
```

Review the plugin and choose **Install for you** when prompted. Claude Code
fetches the catalog over HTTPS, downloads the versioned ZIP, verifies SHA-256,
and installs the Skills and hosted MCP configuration together. It needs no Git,
GitHub login, npm, local MCP process, or manually copied credentials. GitHub may
host the ZIP download; that does not make it a Git clone.

If your agent is helping with setup, ask it to use the HTTPS catalog above with
the supported plugin installer. It can perform the install when that capability
is available, or guide you through these Claude Code commands. Reading the
repository URL alone is not installation.

After installing, reload plugins or start a fresh Claude Code session. Open
`/mcp`, choose Signalsurf, and authenticate when needed. Sign in to Signalsurf,
review and approve the requested Workspace access, and run the [verification prompt](#verify-without-changing-data).
Do not claim connection success before that read succeeds.

**Use the raw JSON URL above.** The GitHub repository shorthand and ordinary
`github.com` URLs can be treated as Git sources by Claude Code, including a
GitHub release URL ending in `marketplace.json`. Changing only HTTPS versus SSH
on a Git source still requires Git. A raw catalog pointing to `./plugins/signalsurf`
also fails: the catalog needs a separately downloadable `archive` source.

For updates, open `/plugin`, select **Marketplaces → signalsurf → Enable auto-update**.
For a manual refresh, use `/plugin marketplace update signalsurf`, then select
Signalsurf under **Installed** and choose **Update now**. Both fetches stay on
HTTPS when the marketplace was registered from the raw catalog.

Existing Git-based installations can keep their current source. If Claude Code
reports that `signalsurf` is already registered from another source, stop and
contact support before switching it. Do not remove an existing marketplace as
a routine repair: removal can uninstall plugins and delete their local data.

### Temporary connection while the ZIP release is unavailable

An agent with Claude Code shell access can run:

```sh
claude mcp add --transport http --scope user signalsurf https://mcp.signalsurf.ai/mcp
```

This only registers a remote MCP connection and requires no Git. Then open
`/mcp` to authenticate and verify access. It supplies tools without the packaged
Skills, so it is an interim option rather than the complete plugin installation.
If a connection named `signalsurf` already exists, inspect it before changing
anything. When moving to the full plugin, have support reconcile the temporary
connection so duplicate tool servers are not left enabled.

Sources: [Claude Code marketplace hosting](https://code.claude.com/docs/en/plugins/host-marketplace#serve-users-who-have-no-git-host-account),
[archive sources](https://code.claude.com/docs/en/plugins/marketplace-reference#archive-plugin-source),
and [MCP setup](https://code.claude.com/docs/en/mcp).

## Claude and Cowork

1. Open **Customize → Plugins** in Claude web or the desktop app.
2. Choose **Add → Add marketplace**.
3. Enter `https://github.com/Signalsurf-ai/signalsurf-agent`.
4. Find Signalsurf in that marketplace and select **Add**.
5. Open the plugin's **Connectors** tab. Add the Signalsurf connector if needed,
   then connect it and complete Signalsurf sign-in and Workspace authorization.
6. Start a new conversation or Cowork task and run the
   [verification prompt](#verify-without-changing-data).

Adding a plugin and connecting its service are separate steps. A plugin's
Skills can appear before its connector is connected. On Team and Enterprise,
an Owner may need to allow the marketplace and add the connector first.

For Claude Code, prefer the [HTTPS archive path](#claude-code-without-git).
The Git-backed CLI path is an [advanced option](#claude-code-cli).
They are local to that machine; they do not add the plugin to your claude.ai
account. See [Claude's plugin guide](https://claude.com/docs/plugins/overview).

## Codex and ChatGPT

### Install an available plugin

Open your app's Plugins directory and use the Signalsurf entry available to
your account or workspace. Check its publisher and source, connect Signalsurf,
and complete OAuth. Start a new chat and run the
[verification prompt](#verify-without-changing-data).

Public directory availability must be verified separately from this GitHub
repository. This guide does not establish that a reviewed public listing is
available. If you cannot find an entry, use the admin import path below when
available, or ask Signalsurf support for your app's supported setup.

### Workspace admin: import this repository

1. Open **Admin → Plugins → Add → Import marketplace**.
2. Set **Source** to `https://github.com/Signalsurf-ai/signalsurf-agent`.
3. Leave **Path** empty. The marketplace is at the repository root.
4. Leave **Branch, tag, or commit** empty to use the default branch.
5. Select **Import marketplace** and authorize GitHub access when prompted.
6. Review the import results, configure eligible roles, and enable required apps.
7. Have each member install or enable the available plugin and connect their
   own Signalsurf account.

This requires a workspace admin and a GitHub account with repository access;
it does not require local Git or a terminal. It is not a universal import
option for individual accounts. Imported plugins declaring MCP servers,
including remote HTTPS servers such as this package, are marked **Desktop only**.
For ChatGPT web, use an available reviewed plugin or the eligible
[custom MCP connection](#raw-mcp) flow instead.

See [OpenAI's workspace import guide](https://developers.openai.com/codex/enterprise/plugin-management).
Local Codex CLI setup is an [advanced option](#codex-cli).

## Cursor

1. Open **Customize** in Cursor.
2. Find Signalsurf in the marketplace available to your account.
3. Check its publisher and source, select **Install**, and choose the offered scope.
4. Connect the bundled Signalsurf MCP server and finish OAuth.
5. Start a new chat and run the [verification prompt](#verify-without-changing-data).

If Signalsurf is not listed, a Teams or Enterprise administrator can use
**Dashboard → Plugins & MCPs → Team Marketplaces → Add Marketplace → Import from Repo**
with `https://github.com/Signalsurf-ai/signalsurf-agent`. Connect GitHub if asked,
review the imported plugin, and configure marketplace access and installation
policy. Members then install from Customize. Team import and public listing
review are separate distribution paths.

If neither path is available, contact Signalsurf support or use a supported
[custom MCP connection](#raw-mcp). Local folder installation belongs to
[developer verification](#cursor-local-developer-verification); customers should
not need to clone a repository to connect Signalsurf.

See [Cursor's plugin installation and team marketplace guide](https://cursor.com/docs/plugins).
A successful Cursor installation does not establish Grok Bot compatibility.

## Grok Bot

1. Open **Connect apps** in the sidebar. On mobile, open your avatar menu first.
2. Search for Signalsurf. If available, verify the publisher and source and add it.
3. Complete Signalsurf OAuth and approve the requested grants for current and
   future accessible Workspaces. The server rechecks current membership.
4. Confirm the app appears under **Installed** and is authenticated.
5. Start a new chat and run the [verification prompt](#verify-without-changing-data).

This package is prepared for Cursor marketplace distribution. A public listing
visible in Grok Bot and a verified Grok Bot installation remain separate gates;
this repository does not establish either one. If search finds nothing, report
listing availability to Signalsurf support. Do not install Git or follow Cursor
IDE local-folder instructions to try to fix a cloud Bot's missing listing.
If the app says **Disabled by team admin**, your team's app policy must allow it.

See the official [Grok Bot connection guide](https://cursor.com/help/grok-bot/connect-apps).
For an already-installed older Skill, use the
[recovery guidance](#grok-bot-still-loads-an-older-skill).

## Start setup in your AI

You can begin in your AI without visiting the Signalsurf dashboard first.
Install or connect the Plugin using the host instructions above, then paste:

> Help me get started with Signalsurf here. Use the onboarding Skill if
> available and follow our conversation's language. Ask for my website and the
> outcome I want, explain the relevant
> capabilities, and interview me one question at a time. Reuse any saved
> Workspace and Memory context before asking again. At each new request, recall
> Memory for the current task before product reads or writes and apply relevant
> saved facts and preferences without asking me to initiate the read. Guide me
> through secure Signalsurf and provider authorization links when needed, then
> return here.
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

When switching between Claude, Codex and the App, select the same Workspace.
Connected external agents with Memory read authority receive bounded Memory at
initialization and refreshed `memoryContext` in successful product responses. The Skill recalls Memory for
each new task with `memory_query` action `recall`, so older relevant facts can be
found beyond the recent context window and applied without repeated interview
questions. Project recall uses the exact selected authorized `projectId`; the
App uses its native Memory context pipeline. Fresh revisions replace corrected
or forgotten facts. The server cannot continuously poll an idle host or force
a foreign model to use a response. Saved Memory and business resources continue
across hosts; private host transcripts are not automatically imported.

## Verify without changing data

After installing, make sure the Signalsurf connection is authenticated, then
start a new chat and send:

> Connect to Signalsurf without changing data. Call get_workspace_context, then
> find_capabilities, and tell me which Agent, Workspaces, Project collaboration
> tools, and product tools are available.

A successful first run identifies the connected Agent and authorized
Workspaces. Seeing the plugin, reading its README, or loading Skills alone
does not verify a working connection. If no Signalsurf tools are available,
return to the app's connection settings before requesting changes.
When entering a Project, ask the AI to call `get_project_context` first.

## Troubleshooting

| What you see                                            | Next step                                                                                                                                                                                                                              |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The AI asks you to install Git or run `git clone`.      | In Claude Code, use the raw HTTPS catalog and ZIP path above. The GitHub marketplace installer really requires Git. In other apps, use the documented interface path; report an unavailable path to support.                           |
| You pasted a GitHub URL, but nothing installed.         | Use the app's marketplace/import entrypoint. Reading a link in chat does not register a plugin. If the app has no supported import or listing, request support rather than installing development tools.                               |
| An importer says the plugin manifest is missing.        | This is a marketplace repository; the plugin is inside `plugins/signalsurf`. Use the documented marketplace import. Do not assume a single-plugin URL importer accepts this repository layout or an arbitrary GitHub subdirectory URL. |
| An MCP URL field rejects the GitHub URL.                | Enter `https://mcp.signalsurf.ai/mcp` there. This connects tools without installing the bundled Skills.                                                                                                                                |
| Signalsurf is missing from the directory.               | Check listing availability and workspace policy. Publishing GitHub source does not publish a directory listing.                                                                                                                        |
| The import asks for GitHub access or an admin.          | That is an account or workspace requirement, not a request to install Git. Ask your administrator to complete the import.                                                                                                              |
| Skills appear, but tools are missing or disconnected.   | Add/connect the bundled connector and finish OAuth. On Claude, check the plugin's Connectors tab.                                                                                                                                      |
| OAuth completes, but the intended Workspace is missing. | Check the signed-in account, Workspace membership, and selected grants; reconnect if necessary.                                                                                                                                        |
| The app asks for an access token.                       | Use the supported OAuth setup. Never copy a Signalsurf access or refresh token into chat or support messages.                                                                                                                          |

For support, share the app name/version, installation entrypoint, exact error,
and a screenshot with sensitive information removed through the
[issue tracker](https://github.com/Signalsurf-ai/signalsurf-agent/issues).
Include whether you used the plugin repository or MCP URL. Do not include tokens,
customer data, or session cookies.

## Reconnect or revoke

Disconnect or log out of Signalsurf in your app, then reconnect and complete
OAuth. Revoking the Signalsurf grant prevents new access tokens; already-issued
access tokens expire within their short lifetime. Never paste tokens into chat,
a shell command, an issue, or a support message.

## Raw MCP

For apps with a supported custom remote MCP interface, add
`https://mcp.signalsurf.ai/mcp` as a Streamable HTTP server and complete OAuth.
You do not need a local MCP process or Git. The host may restrict this feature
by account, plan, or administrator policy.

In ChatGPT, eligible users can open [Plugins](https://chatgpt.com/plugins), select
the plus button and **Add custom MCP server**, enter the server URL, and complete
the offered connection flow. See [OpenAI's custom MCP quickstart](https://developers.openai.com/plugins/quickstart).
Other apps have their own setup controls; do not assume a Cursor import or an
MCP JSON file configures Grok Bot.

The tools and permission checks are the same. A direct MCP connection does not
install this repository's routing Skills. Use the verification prompt above and
report that distinction when diagnosing an installation.

## Updates

Use your app's plugin update or marketplace sync controls. Organization-managed
plugins may require an administrator to refresh their source. Start a fresh
conversation after a host-managed installation update.

This package also checks published Skill guidance on use. Managed hosts can
restrict local replacement; loading current guidance is not proof that the host
updated its installed package. Customers do not need to install Node.js to use
the interface-based connection paths above. Technical update and recovery
details follow.

## Advanced setup

These options are for developers and existing command-line users. Git-backed
CLI marketplace installers may require Git in their execution environment.
If it is unavailable, use the Claude Code HTTPS path or supported app interface; a missing CLI prerequisite
should not become the default customer setup.

### Claude Code CLI

This legacy Git-backed path requires Git on the machine running Claude Code,
even though the remote MCP server is hosted. Prefer the
[Git-free HTTPS catalog](#claude-code-without-git) for customers. Requires a Claude
Code version with plugin marketplaces and remote HTTP MCP.

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

### Codex CLI

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

### Cursor local developer verification

Before public marketplace review, developers can download the public repository
using GitHub's **Code → Download ZIP** and extract it. Copy `plugins/signalsurf`
into `~/.cursor/plugins/local/signalsurf`, then restart Cursor or run
**Developer: Reload Window**. Check Customize for the Skills and MCP server.
Git users can use an existing checkout instead. Keep this local test separate
from marketplace and Grok Bot verification. A marketplace-installed copy with
the same name takes precedence; organization policy may restrict local imports.

## Updates on use

From version 0.7.1, every request using a root or focused SignalSurf Skill starts
with a public release check. With Node.js 18+ and a writable installed plugin,
the bundled updater automatically installs the complete newer package from one
verified commit. The agent then reloads the root, shared and relevant focused
guidance before continuing. Failed checks keep the installed package; source
Git checkouts are preserved. Hosts with web reads but no writable installation
load current guidance directly from the pinned public release and report that
the local installation was not changed.

An installation older than 0.7.1 needs one host-managed plugin update to receive
this entry check. CLI users can use the commands above. Start a fresh chat after that initial
update. Later per-request refreshes reload the relevant guidance in the current
conversation; host version labels may remain cached until a new session.
Raw MCP connections receive live tools and adapter instructions, without an
installed plugin package to update. OAuth grants and hosted MCP deployment are
independent of Skill updates.

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

## Documentation sources

Installation paths were checked against these official guides on October 20,
2026 (America/Los_Angeles). This is a documentation check, not a fresh-account
install, OAuth test, or proof of a published listing. UI labels and availability
can change with app versions and organization settings.

- [Claude plugins and bundled connectors](https://claude.com/docs/plugins/overview)
- [Claude Code installation](https://code.claude.com/docs/en/discover-plugins)
- [Claude Code HTTPS hosting and archives](https://code.claude.com/docs/en/plugins/host-marketplace)
- [OpenAI workspace import and desktop restrictions](https://developers.openai.com/codex/enterprise/plugin-management)
- [OpenAI local packages and CLI marketplaces](https://developers.openai.com/plugins/build/plugins)
- [OpenAI custom MCP quickstart](https://developers.openai.com/plugins/quickstart)
- [Cursor plugins and team marketplaces](https://cursor.com/docs/plugins)
- [Grok Bot app connection](https://cursor.com/help/grok-bot/connect-apps)
