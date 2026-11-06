# MCP interface update, November 2026

SignalSurf's hosted MCP now provides a smaller startup guide, tools filtered by
the connection's permissions, more focused capability search and corrective
argument errors. Important ID descriptions and cross-field input rules remain
available so a smaller response does not require guessing inputs.

## Measured changes

These are separate before/after engineering measurements collected on November
5–6, 2026. Each row uses its own fixed fixture and baseline. Later catalog changes
can change the totals; these are not a fresh measurement of every production
connection. Bytes and characters are not model tokens, latency or task quality.

| Change and measurement scope | Before | After |
| --- | ---: | ---: |
| Startup instructions, same two-Workspace fixture, excluding the separately bounded Memory snapshot | 24,234 characters | 3,093 characters, 87% smaller |
| UUID schema compaction with important descriptions retained, full paginated default-scope tool list | 853,192 bytes | 667,146 bytes, 22% smaller |
| Permission filtering, default-consent tool list | 102 tools / 703,487 bytes | 65 tools / 401,024 bytes, 43% fewer bytes |
| Capability search responses, 16 fixed relevance queries combined | 239,833 bytes | 52,384 bytes, 78% smaller |
| Compact JSON text, one 25-Project response with attached Memory context | 19,930 text bytes / 34,222 total bytes | 11,547 text bytes / 24,937 total bytes, 42% / 27% smaller |

The percentages cannot be added or multiplied. Permission filtering does not
shrink a connection that already has every scope. Read/write tool separation can
increase catalog size while making access and side effects clearer. These
measurements do not establish a general task-success or cost improvement.

## What changes for users

- Search by the desired outcome. Search returns compact summaries; request the
  exact capability and action for the current input schema.
- A missing tool in a permission-filtered list can mean a missing grant. Check
  the returned access information before concluding a feature is absent.
- Use the served read/write tool names returned by discovery. Conversation
  history has separate Inbox, Phone and Meeting readers with distinct IDs.
- Argument errors identify missing fields and supply a schema-validated example.
  Replace example values with real returned IDs and user-authorized values.
- Reconnect or refresh tools as the host requires. Update the complete SignalSurf
  plugin for revised Skills, then start a new conversation or reload guidance.

## Evaluation evidence and limits

Small synthetic MCP experiments identified a malformed Memory recall payload and
repeated guessing after invalid arguments. Explicit recall guidance and corrective
errors were implemented and checked in bounded before/after experiments. Those
observations support the specific fixes; they do not establish a population-wide
success rate.

A subsequent three-model baseline completed 61 synthetic tasks, three repetitions
per model, for 549 attempts. Two task expectations were unavailable in the fixture
and a Workflow persistence path failed across models. Some answer graders also
need stronger semantic checks and human calibration. The results are diagnostic
integration evidence, not a model ranking or release-quality certification.

Hosted MCP, installed Skills, OAuth, host tool discovery and provider delivery have
separate acceptance criteria. No blanket host, security or provider guarantee is
made. The OpenAI directory distribution has a separate release lifecycle.

See [compatibility](compatibility.md) for observed integration scope and the
[public contract source](contracts/source.json) for the schema snapshot used to
check this package's guidance. Raw execution records are kept outside this public
repository under the [evidence policy](quality-evidence.md).
