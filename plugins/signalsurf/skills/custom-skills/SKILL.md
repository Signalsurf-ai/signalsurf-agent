---
name: custom-skills
description: Use when discovering, loading, creating, or improving a reusable SignalSurf Workspace custom Skill, or when deciding whether instructions belong in a Skill instead of Memory, Knowledge, Project Context, or a resource.
---

# SignalSurf Custom Skills

A Skill is a reusable procedure: how to perform a repeatable class of work. It is not authorization and must not hold customer facts, secrets, raw transcripts, temporary state, or one Project's current hypothesis.

## Discover and load

1. Call `skill_query` action `list`, then match the current request against each returned `When to use` description.
2. Load the complete instructions for one matching Skill by its stable id before planning or acting. Do not load every Skill or treat a catalogue description as the instructions.
3. If no Skill matches, continue using the official product Skill and live capability discovery.

## Create

Create only when the user wants to preserve a repeatable Workspace procedure. Draft sections named **Name**, **When to use**, and **Instructions**, show them to the user, and require explicit approval before calling `skill_manage` action `create`. SignalSurf Web then requires a Workspace admin to approve that exact write. One conversation never silently becomes a Skill.

## Update

Load the current custom Skill and `revision`, show the proposed change, and require explicit approval. Call `skill_manage` action `update` with that exact `expectedRevision` so concurrent changes fail closed; SignalSurf Web requires a Workspace admin to approve the write. Official Plugin Skills are immutable and cannot be shadowed or edited through this lifecycle.

If custom Skill query/manage capabilities are unavailable, say so and keep the draft in the conversation; do not claim it was installed or modify Plugin files as a substitute.
