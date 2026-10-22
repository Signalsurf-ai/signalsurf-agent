---
name: workflows
description: Use for SignalSurf saved Workflow templates, typed processing graphs, nodes and run state. Scheduled/event-driven Agent work uses Projects/Routines.
---

# Signalsurf Workflows

Before every request using this Skill, follow [version check and automatic update](../signalsurf/references/freshness.md), then use the current guidance.

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

Use a Workflow for a saved typed processing graph, not a one-off direct tool call. For scheduled/event-driven Agent work without a requested graph, use [Projects](../projects/SKILL.md) and [schedule routing](../signalsurf/references/schedule-routing.md).

1. Inspect existing state with `workflow_query`. Prefer `workflow_templates` when a maintained pattern fits.
2. Use `workflow_authoring` for the container and typed flow graph. Preserve unrelated nodes, bindings, approvals, and run policy.
3. Validate inputs and graph shape before `workflow_run`. Starting a run and observing completion are separate; inspect runs, pipeline status, and action history rather than guessing.
4. A Workflow does not inherit every interactive Agent capability. Its saved nodes execute under their own runtime profile and permissions.
5. Use a Project Thread for the automation's objective, hypothesis, material run evidence, decisions, and handoff—not for every node log.
