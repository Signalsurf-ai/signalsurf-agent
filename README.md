<p align="center">
  <strong>Use your Signalsurf from Claude, Codex, and Cursor.</strong>
</p>

This is the official Signalsurf plugin marketplace. One versioned plugin
bundles the hosted Signalsurf MCP connection with a small root router and
focused product Skills. They teach an external AI how to load Workspace and
Project context, distinguish Memory from shared Threads and resources, route
across product surfaces, and preserve useful conclusions.

## Install

See [Getting started](./GETTING_STARTED.md) for Claude Code, Codex, and Cursor
installation, plus the separate ChatGPT connector path, OAuth, verification,
updates, and troubleshooting.

The short version for Claude Code is:

```sh
claude plugin marketplace add Signalsurf-ai/signalsurf-agent
claude plugin install signalsurf@signalsurf --scope user
```

For Codex:

```sh
codex plugin marketplace add Signalsurf-ai/signalsurf-agent
codex plugin add signalsurf@signalsurf
```

Installing the Plugin does not bypass Signalsurf permissions. OAuth asks the
member which Workspaces and grants the AI may use, and the server revalidates
authorization on every tool call.

## Developer fallback

Agents that cannot load plugins can connect directly to the hosted MCP endpoint:

```text
https://mcp.signalsurf.ai/mcp
```

Raw MCP exposes the same tools and authorization model. It does not include the
Plugin's interaction guidance and is not a separate Signalsurf mode.

[Signalsurf](https://www.signalsurf.ai) ·
[Privacy](https://www.signalsurf.ai/privacy) ·
[Terms](https://www.signalsurf.ai/terms)
