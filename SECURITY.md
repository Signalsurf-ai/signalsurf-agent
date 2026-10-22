# Security

Report vulnerabilities through GitHub's
[private vulnerability form](https://github.com/Signalsurf-ai/signalsurf-agent/security/advisories/new).
Do not put credentials, customer data, session cookies or exploit details in a
public issue. Include the affected package version, installation source, host
version and a minimal redacted reproduction. No response-time SLA is promised.

Security fixes target the latest published plugin release. Older versions should
update through their host's supported controls; see
[updates and recovery](GETTING_STARTED.md#updates) and the
[compatibility policy](docs/compatibility.md). Historical tags and assets remain
immutable. A correction ships in a new version.

The MIT license applies to the portable package. Hosted service access remains
subject to its own account, Workspace and permission requirements.

The Plugin contains no credentials. Its MCP configurations point only to the
public `https://mcp.signalsurf.ai/mcp` endpoint. OAuth tokens are exchanged and
stored by the AI host and Signalsurf; users should never paste them into chat or
terminal arguments.

Installing or removing a plugin does not grant or revoke service authorization.
Follow [disconnect, uninstall and revoke](GETTING_STARTED.md#disconnect-uninstall-and-revoke)
to handle each separately. Maintainers should verify release identities and bytes
before changing active pointers; see [release recovery](docs/releasing.md).
