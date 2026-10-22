#!/usr/bin/env node
// Structural fixtures and reading-path measurements, never a model-behavior scorer.
import assert from 'node:assert/strict';
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateExample } from './contracts.mjs';

const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const skillsRoot = resolve(root, 'plugins/signalsurf/skills');
const readJson = name => JSON.parse(readFileSync(resolve(root, 'evals', name), 'utf8'));
const confinedFile = (base, path) => {
  assert.equal(typeof path, 'string');
  assert(!path.startsWith('/') && !path.includes('\\'), `Nonportable Skill path: ${path}`);
  const full = realpathSync(resolve(base, path));
  assert(full.startsWith(base + sep), `Path escapes Skills: ${path}`);
  assert(lstatSync(full).isFile(), `Guidance must be a file: ${path}`);
  return full;
};
const inSkills = path => confinedFile(skillsRoot, path);
const compatibilityRead = 'docs/compatibility.md';
const genuinePublicDoc = file => {
  assert.equal(realpathSync(file), file, 'The public compatibility document cannot be a symlink');
  assert(lstatSync(file).isFile(), 'The public compatibility document must be a file');
  return file;
};
const inGuidance = path => path === compatibilityRead
  ? genuinePublicDoc(resolve(root, compatibilityRead))
  : inSkills(path);
const nonemptyStrings = (values, label) => {
  assert(Array.isArray(values) && values.length > 0, `${label} must be nonempty`);
  assert(values.every(value => typeof value === 'string' && value.trim()), label);
  assert.equal(new Set(values).size, values.length, `Duplicate ${label}`);
};
const corpus = readJson('routing-cases.json');
assert.equal(corpus.schemaVersion, 1);
assert.match(corpus.baselineCommit, /^[a-f0-9]{40}$/);
assert(corpus.cases.length >= 20, 'Keep representative positive, negative and ambiguous cases');
const ids = new Set();
const names = new Set(readdirSync(skillsRoot, { withFileTypes: true }).filter(item => item.isDirectory()).map(item => item.name));
assert.equal(names.size, 14, 'Preserve the existing 14 Skill entrypoints');
for (const item of corpus.cases) {
  assert.match(item.id, /^[a-z][a-z0-9-]+$/);
  assert(!ids.has(item.id), `Duplicate case ${item.id}`);
  ids.add(item.id);
  assert(['positive', 'negative', 'ambiguous'].includes(item.kind));
  assert(names.has(item.entrypoint), `Unknown entrypoint: ${item.entrypoint}`);
  assert.equal(typeof item.prompt, 'string');
  assert(item.prompt.trim());
  nonemptyStrings(item.modes, `${item.id} modes`);
  assert(item.modes.every(mode => ['direct', 'root'].includes(mode)));
  nonemptyStrings(item.allowedReads, `${item.id} allowedReads`);
  item.allowedReads.forEach(inGuidance);
  assert(item.allowedReads.includes(`${item.entrypoint}/SKILL.md`));
  nonemptyStrings(item.requiredOutcomes, `${item.id} requiredOutcomes`);
  nonemptyStrings(item.forbiddenEffects, `${item.id} forbiddenEffects`);
  assert(item.context && typeof item.context === 'object' && !Array.isArray(item.context));
}
for (const kind of ['positive', 'negative', 'ambiguous']) assert(corpus.cases.some(item => item.kind === kind));

// These schemas are deliberately invented fixture data, never a deployed API catalog.
const compatibilityScenarios = new Map([
  ['synthetic-schema-1', 'old-minimal-schema'],
  ['synthetic-schema-2', 'additive-optional-field'],
  ['synthetic-schema-3', 'missing-required-value'],
  ['synthetic-schema-4', 'removed-action'],
]);
function validateArtificialFixture(item) {
  const scenario = compatibilityScenarios.get(item.id);
  assert(scenario, `Unknown artificial fixture ${item.id}`);
  assert.equal(item.syntheticCompatibility?.kind, 'artificial-schema-fixture');
  assert.equal(item.syntheticCompatibility.scenario, scenario);
  assert.match(item.syntheticCompatibility.notice, /not a SignalSurf API catalog/);
  assert.equal(item.entrypoint, 'records');
  assert.deepEqual(item.modes, ['direct', 'root']);
  const context = item.context;
  assert.match(context.dataOrigin, /Entirely artificial offline fixture/);
  assert.match(context.fixtureApiNotice, /not SignalSurf APIs/);
  assert.match(context.syntheticCapabilityDiscovery.observationType, /Invented/);
  assert.equal(context.mutationObservation, null, 'No synthetic mutation was executed');
  const [reader, mutation] = context.syntheticCapabilityDiscovery.capabilities;
  assert.equal(context.syntheticCapabilityDiscovery.capabilities.length, 2);
  assert.equal(reader.name, 'fixture_record_query');
  assert.equal(mutation.name, 'fixture_record_manage');
  const scopes = ['workspaceId', 'projectId', 'objectId', 'recordId'];
  const action = scenario === 'removed-action' ? 'archive' : 'update';
  for (const [capability, expectedAction, keys] of [
    [reader, 'get', ['action', ...scopes]],
    [mutation, action, ['action', ...scopes, 'operationId', 'input']],
  ]) {
    assert.deepEqual(capability.actions, [expectedAction]);
    const schema = capability.inputSchema;
    assert.equal(schema.type, 'object');
    assert.equal(schema.additionalProperties, false);
    assert.deepEqual(Object.keys(schema.properties).sort(), [...keys].sort());
    assert.deepEqual([...schema.required].sort(), [...keys].sort());
    assert.deepEqual(schema.properties.action, { type: 'string', enum: [expectedAction] });
    for (const key of scopes) assert.deepEqual(schema.properties[key], { type: 'string', format: 'uuid' });
  }
  assert.deepEqual(mutation.inputSchema.properties.operationId, { type: 'string', minLength: 1 });
  const input = mutation.inputSchema.properties.input;
  assert.equal(input.type, 'object');
  assert.equal(input.additionalProperties, false);
  if (scenario === 'removed-action') {
    assert.deepEqual(input.properties, { reason: { type: 'string' } });
    assert.deepEqual(input.required, ['reason']);
  } else {
    const extra = scenario === 'additive-optional-field' ? ['auditLabel'] : scenario === 'missing-required-value' ? ['revisionToken'] : [];
    assert.deepEqual(Object.keys(input.properties).sort(), ['fields', ...extra].sort());
    assert.deepEqual(input.required, scenario === 'missing-required-value' ? ['fields', 'revisionToken'] : ['fields']);
    assert.deepEqual(input.properties.fields, { type: 'object', properties: { job_title: { type: 'string' } }, required: ['job_title'], additionalProperties: false });
    if (scenario === 'additive-optional-field') assert.deepEqual(input.properties.auditLabel, { type: 'string', maxLength: 64 });
    if (scenario === 'missing-required-value') assert.deepEqual(input.properties.revisionToken, { type: 'string', minLength: 1 });
  }
  const read = context.syntheticCurrentRead;
  assert.equal(read.capability, reader.name);
  assert.equal(read.action, 'get');
  assert.equal(read.workspaceId, context.workspace.workspaceId);
  assert.equal(read.projectId, context.selectedWorkProject.projectId);
  for (const key of ['objectId', 'recordId']) assert.equal(read[key], context.resolvedRecord[key]);
  assert.equal(read.objectId, context.recordCollection.objectId);
  assert.equal(context.selectedWorkProject.effectiveAccess.recordUpdate, true);
  assert.equal(context.approvedOperation.operationId, `${item.id}-job-title-v1`);
  assert.deepEqual(context.approvedOperation.userSuppliedValue, { job_title: 'Director of Partnerships' });
  for (const value of [read, read.fields, context.approvedOperation])
    assert(!Object.hasOwn(value, 'revisionToken'), 'The missing revision token must not be supplied implicitly');
}
const artificialCases = corpus.cases.filter(item => item.id.startsWith('synthetic-schema-') || item.syntheticCompatibility !== undefined);
assert.equal(artificialCases.length, compatibilityScenarios.size);
artificialCases.forEach(validateArtificialFixture);
const artificial = id => structuredClone(artificialCases.find(item => item.id === id));
const malformedOptional = artificial('synthetic-schema-2');
malformedOptional.context.syntheticCapabilityDiscovery.capabilities[1].inputSchema.properties.input.required.push('auditLabel');
assert.throws(() => validateArtificialFixture(malformedOptional));
const malformedRequired = artificial('synthetic-schema-3');
delete malformedRequired.context.syntheticCapabilityDiscovery.capabilities[1].inputSchema.properties.input.properties.revisionToken;
assert.throws(() => validateArtificialFixture(malformedRequired));
const inventedValue = artificial('synthetic-schema-3');
inventedValue.context.approvedOperation.revisionToken = inventedValue.context.observedAt;
assert.throws(() => validateArtificialFixture(inventedValue));
const malformedAction = artificial('synthetic-schema-4');
malformedAction.context.syntheticCapabilityDiscovery.capabilities[1].actions = ['update'];
assert.throws(() => validateArtificialFixture(malformedAction));
const missingProvenance = artificial('synthetic-schema-1');
delete missingProvenance.syntheticCompatibility;
assert.throws(() => validateArtificialFixture(missingProvenance));

const paths = readJson('reading-paths.json');
assert.equal(paths.schemaVersion, 1);
assert.equal(paths.baselineCommit, corpus.baselineCommit);
const measured = paths.scenarios.map(scenario => {
  nonemptyStrings(scenario.files, `${scenario.id} files`);
  assert(Number.isInteger(scenario.baseline.bytes) && scenario.baseline.bytes > 0);
  assert(Number.isInteger(scenario.baseline.words) && scenario.baseline.words > 0);
  const texts = scenario.files.map(path => readFileSync(inSkills(path), 'utf8'));
  const current = {
    words: texts.reduce((sum, text) => sum + (text.match(/\S+/g) ?? []).length, 0),
    bytes: texts.reduce((sum, text) => sum + Buffer.byteLength(text, 'utf8'), 0),
  };
  return { id: scenario.id, files: scenario.files, baseline: scenario.baseline, current };
});

const capabilityFixture = readJson('capability-fixture.json');
assert.equal(capabilityFixture.schemaVersion, 1);
assert.equal(capabilityFixture.provenance.commit, corpus.baselineCommit);
assert.equal(capabilityFixture.provenance.kind, 'published-procedure-names');
const examples = readJson('worked-examples.json');
assert.equal(examples.schemaVersion, 1);
const exampleIds = new Set();
for (const example of examples.examples) {
  assert(!exampleIds.has(example.id));
  exampleIds.add(example.id);
  inSkills(example.guide);
  nonemptyStrings(example.caseIds, `${example.id} caseIds`);
  example.caseIds.forEach(id => assert(ids.has(id)));
  validateExample(example, capabilityFixture.capabilities);
}
// Negative envelopes prove the static boundary itself, not model compliance.
const sample = examples.examples.find(example => example.id === 'draft-send');
assert.throws(() => validateExample({ ...sample, claimedState: 'delivered' }, capabilityFixture.capabilities));
const retry = examples.examples.find(example => example.id === 'exact-retry');
assert.throws(() => validateExample({ ...retry, retryOperationId: '<new-operation-id>' }, capabilityFixture.capabilities));
assert.throws(() => validateExample({ ...retry, retryDispatched: true }, capabilityFixture.capabilities));
assert.throws(() => validateExample({ ...sample, requestedStage: 'research' }, capabilityFixture.capabilities));

// Model-trial receipts are declarations/evidence to review, not substring tests.
function validateReceipt(receipt) {
  assert.equal(receipt.schemaVersion, 1);
  for (const key of ['model', 'host', 'hostVersion', 'snapshot', 'startedAt', 'finishedAt', 'reviewer']) {
    assert.equal(typeof receipt[key], 'string', `${key} is required`);
    assert(receipt[key].trim());
  }
  assert.equal(receipt.executionMode, 'simulation');
  assert.equal(receipt.realToolMutations, 0);
  assert.match(receipt.snapshot, /^[a-f0-9]{40}$/);
  assert(Number.isFinite(Date.parse(receipt.startedAt)) && Number.isFinite(Date.parse(receipt.finishedAt)));
  assert(Date.parse(receipt.finishedAt) >= Date.parse(receipt.startedAt));
  assert(Array.isArray(receipt.results) && receipt.results.length > 0);
  const resultsSeen = new Set();
  for (const result of receipt.results) {
    assert(ids.has(result.caseId), `Unknown trial case ${result.caseId}`);
    assert(['direct', 'root'].includes(result.mode));
    assert(!resultsSeen.has(`${result.caseId}:${result.mode}`));
    resultsSeen.add(`${result.caseId}:${result.mode}`);
    assert(['pass', 'fail', 'unavailable'].includes(result.verdict));
    for (const key of ['response', 'rationale']) assert(typeof result[key] === 'string' && result[key].trim());
    assert(Array.isArray(result.readFiles));
    result.readFiles.forEach(inGuidance);
    assert(Array.isArray(result.proposedEffects));
    assert(Array.isArray(result.observedEffects));
    assert.equal(result.observedEffects.length, 0, 'Synthetic trials must have no real effects');
  }
}
const structuralReceipt = readJson('trial-receipt.example.json');
structuralReceipt.results[0] = {
  ...structuralReceipt.results[0],
  caseId: 'synthetic-schema-1',
  readFiles: ['records/SKILL.md', compatibilityRead],
};
validateReceipt(structuralReceipt);
for (const unsafe of [resolve(root, compatibilityRead), '../../../README.md', '../scripts/ensure-current.mjs', 'docs/releasing.md', 'records\\SKILL.md', 'records']) {
  const receipt = structuredClone(structuralReceipt);
  receipt.results[0].readFiles = [unsafe];
  assert.throws(() => validateReceipt(receipt), `Unsafe proposed receipt path: ${unsafe}`);
}
const boundaryRoot = realpathSync(mkdtempSync(resolve(tmpdir(), 'signalsurf-eval-paths-')));
try {
  const fixtureSkills = resolve(boundaryRoot, 'skills');
  mkdirSync(fixtureSkills);
  const outside = resolve(boundaryRoot, 'outside.md');
  writeFileSync(outside, 'Outside the allowed guidance tree.');
  symlinkSync(outside, resolve(fixtureSkills, 'escape.md'));
  assert.throws(() => confinedFile(fixtureSkills, 'escape.md'));
  const linkedDoc = resolve(boundaryRoot, 'compatibility.md');
  symlinkSync(outside, linkedDoc);
  assert.throws(() => genuinePublicDoc(linkedDoc));
} finally {
  rmSync(boundaryRoot, { recursive: true, force: true });
}
const resultIndex = process.argv.indexOf('--result');
if (resultIndex !== -1) {
  assert(process.argv[resultIndex + 1], '--result needs a JSON receipt path');
  const receipt = JSON.parse(readFileSync(resolve(process.argv[resultIndex + 1]), 'utf8'));
  validateReceipt(receipt);
  console.log(`Validated receipt structure: ${receipt.results.length} reviewed simulations; host/OAuth proof remains separate.`);
}
console.log(JSON.stringify({ staticValidation: 'pass', routingCases: corpus.cases.length, artificialCompatibilityCases: artificialCases.length, workedExamples: examples.examples.length, readingPaths: measured, note: 'No model task, host install, live schema, OAuth or performance outcome is established by this command. Artificial fixture schemas are not a production capability catalog.' }, null, 2));
