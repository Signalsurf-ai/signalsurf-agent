<p align="center">
  <strong>Bring Signalsurf into Claude, Codex, and Cursor.</strong>
</p>

Access your Workspace context, collaborate in Projects, and use CRM, signals,
workflows, campaigns, and the rest of Signalsurf from the AI tools where you
already work. Signalsurf follows your existing permissions, loads the right
context for each conversation, and saves useful outcomes back to the right
Project.

## Install

Start with your app below. Claude Code has a dedicated HTTPS catalog and ZIP
installation path for customers without Git; other apps have their own interface
paths. You need an eligible
Signalsurf account and access to the Workspace you use. Approved new-account
bootstrap depends on the deployed consent flow. Availability depends on your app,
plan, and organization settings; a public repository is not a directory listing.

| Your app        | Start here                                                                                                                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code     | Use the [Git-free HTTPS catalog](./GETTING_STARTED.md#claude-code-without-git). The GitHub repository installer requires Git.                                                                                                    |
| Claude / Cowork | **Customize → Plugins → Add → Add marketplace**, enter `https://github.com/Signalsurf-ai/signalsurf-agent`, then add Signalsurf. [Steps](./GETTING_STARTED.md#claude-and-cowork).                                                |
| Codex / ChatGPT | Use an available Signalsurf directory or workspace plugin. Workspace admins can import this repository through **Admin → Plugins → Add → Import marketplace**. [Steps and restrictions](./GETTING_STARTED.md#codex-and-chatgpt). |
| Cursor          | Install from **Customize** when available. Teams can import the repository into a team marketplace. [Steps](./GETTING_STARTED.md#cursor).                                                                                        |
| Grok Bot        | Use **Connect apps** when Signalsurf is available there. A Cursor installation does not install it in Grok Bot. [Steps and availability](./GETTING_STARTED.md#grok-bot).                                                         |

Then connect Signalsurf, sign in, review and approve the requested access, and
[verify the connection](./GETTING_STARTED.md#verify-without-changing-data).

See [release notes and downloads](https://github.com/Signalsurf-ai/signalsurf-agent/releases)
for version changes, and [update your installation](./GETTING_STARTED.md#updates)
through your app's supported controls. Start a new conversation after updating.

### Asking your AI to help

Paste this into your app:

> Help me connect Signalsurf: https://github.com/Signalsurf-ai/signalsurf-agent.
> Read its Getting Started guide and use the installation path for this app.
> In Claude Code, use the HTTPS catalog and ZIP path, never the GitHub clone
> path. Otherwise use the supported installer or guide me through the interface.
> Do not ask me to install Git, Node.js, or clone a repository. If installation requires an admin,
> unavailable listing, or unsupported feature, explain that specific blocker.
> After I authorize the connection, verify access without changing data.

Reading a URL in chat does not itself install a plugin. The app must provide an
installer and complete authorization. If your AI asks you to install Git, use
the interface steps above or [troubleshooting](./GETTING_STARTED.md#troubleshooting).

To start setup in your AI after connecting, use the
[onboarding prompt](./GETTING_STARTED.md#start-setup-in-your-ai).

Developer Git-based installation is in [advanced setup](./GETTING_STARTED.md#advanced-setup).
This is a marketplace repository; its plugin lives in `plugins/signalsurf`.
Use **Add marketplace** or **Import marketplace** where supported. A host's
single-plugin importer may require a different repository layout.

Installing the Plugin does not bypass Signalsurf permissions. OAuth asks the
member to approve the requested grants for all Workspaces they can access,
including future Workspaces. The server revalidates current membership and
permissions on every tool call.

## Connect using an MCP URL

If your app supports custom remote MCP connections, use this server URL in its
MCP or connector setup:

```text
https://mcp.signalsurf.ai/mcp
```

Raw MCP exposes the same tools and authorization model. It does not include the
Plugin's Skills. The GitHub URL above is a plugin source; this MCP URL is a
connection endpoint. Follow your app's [setup and permission requirements](./GETTING_STARTED.md#raw-mcp).

[Signalsurf](https://www.signalsurf.ai) ·
[Privacy](https://www.signalsurf.ai/privacy) ·
[Terms](https://www.signalsurf.ai/terms)

## Developers and contributors

The Skills in `plugins/signalsurf/skills` teach a customer's AI how to use
Signalsurf through its hosted MCP tools. Engineering instructions for developing
this package live in `AGENTS.md` and contributor documentation.

The optional [SignalSurf CLI](./GETTING_STARTED.md#signalsurf-cli) is a terminal
client of the same hosted MCP service; it is not required for plugin setup.
See [contributing](./CONTRIBUTING.md) for public source ownership and `npm test`,
[compatibility](./docs/compatibility.md) for the evidence behind each route, and
[releasing](./docs/releasing.md) for maintainer preparation and recovery.

## Writing guidance

The packaged [Writing Skill](plugins/signalsurf/skills/writing/SKILL.md) supports standalone writing, review and rewrite as well as Content, Campaigns, Listening and Conversations copy. It selects email outreach, follow-up, conversation reply, LinkedIn post, X post, public reply, DM or connection-note guidance while preserving author voice and Chinese usage. The guidance is authored for SignalSurf.
