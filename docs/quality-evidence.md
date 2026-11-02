# Quality evidence

Public evidence describes what was tested, the result and its limits. Package
checks, model reasoning, host installation, OAuth and live product behavior are
separate observations. A pass in one category does not establish another.

## Public evidence boundaries

- Keep synthetic routing cases, recovery examples and offline package checks
  reproducible from a public clone without credentials or hosted services.
- Publish concise reviewed summaries with a date, package and host version where
  applicable, method, result and remaining gaps. Identify synthetic reasoning
  trials as such; they do not prove tool execution or persistence.
- Keep raw model responses, process logs, host configuration, usage/cost records,
  customer data and internal operational reports outside the public repository.
  A synthetic task does not make its execution environment public material.
- Include only deliberately approved public fields in a published summary.
  Exclude credentials, personal identifiers, private paths and internal source
  mappings from release notes and artifacts as well as source files.
- Retain unsuccessful or unavailable results in the underlying evidence. Do not
  turn missing proof into a pass or present a bounded observation as a general
  model, provider or product guarantee.

Run `npm test` for portable package checks. Static fixtures validate package and
procedure contracts; they do not establish host discovery, OAuth, live schemas,
paid provider outcomes, delivery or measured writing quality. Document-byte
counts are source measurements, not model-token, cost or latency measurements.

The [compatibility matrix](compatibility.md) owns dated public installation and
integration summaries. The [trial guide](../evals/README.md) describes bounded
reasoning checks. Release notes should explain customer changes and relevant
validation limits without attaching raw execution journals.
