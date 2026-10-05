---
name: workflows
description: Use for Signalsurf Workflow templates, typed graphs, triggers/sources, nodes, variables, runs, jobs, pipeline status, action history, or recurring automation design.
---

# Signalsurf Workflows

Read the [shared operating contract](../signalsurf/references/operating-contract.md) unless already loaded; a focused Skill uses the same context, actor, confirmation and result rules.

Use a Workflow for durable deterministic or agentic automation, not for a one-off direct tool call.

1. Inspect existing state with `workflow_query`. Prefer `workflow_templates` when a maintained pattern fits.
2. Use `workflow_authoring` for the container and typed flow graph. Preserve unrelated nodes, bindings, approvals, and run policy.
3. Validate inputs and graph shape before `workflow_run`. Starting a run and observing completion are separate; inspect runs, pipeline status, and action history rather than guessing.
4. A Workflow does not inherit every interactive Agent capability. Its saved nodes execute under their own runtime profile and permissions.
5. Use a Project Thread for the automation's objective, hypothesis, material run evidence, decisions, and handoff—not for every node log.
