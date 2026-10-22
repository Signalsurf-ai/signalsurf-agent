#!/usr/bin/env node
// Structural fixtures and reading-path measurements, never a model-behavior scorer.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateExample } from './contracts.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillsRoot = resolve(root, 'plugins/signalsurf/skills');
const readJson = name => JSON.parse(readFileSync(resolve(root, 'evals', name), 'utf8'));
const inSkills = path => {
  assert.equal(typeof path, 'string');
  assert(!path.startsWith('/') && !path.includes('\\'), `Nonportable Skill path: ${path}`);
  const full = realpathSync(resolve(skillsRoot, path));
  assert(full.startsWith(skillsRoot + sep), `Path escapes Skills: ${path}`);
  return full;
};
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
  item.allowedReads.forEach(inSkills);
  assert(item.allowedReads.includes(`${item.entrypoint}/SKILL.md`));
  nonemptyStrings(item.requiredOutcomes, `${item.id} requiredOutcomes`);
  nonemptyStrings(item.forbiddenEffects, `${item.id} forbiddenEffects`);
  assert(item.context && typeof item.context === 'object' && !Array.isArray(item.context));
}
for (const kind of ['positive', 'negative', 'ambiguous']) assert(corpus.cases.some(item => item.kind === kind));

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

// Optional model-trial receipts are declarations/evidence to review, not substring tests.
const resultIndex = process.argv.indexOf('--result');
if (resultIndex !== -1) {
  assert(process.argv[resultIndex + 1], '--result needs a JSON receipt path');
  const receipt = JSON.parse(readFileSync(resolve(process.argv[resultIndex + 1]), 'utf8'));
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
    result.readFiles.forEach(inSkills);
    assert(Array.isArray(result.proposedEffects));
    assert(Array.isArray(result.observedEffects));
    assert.equal(result.observedEffects.length, 0, 'Synthetic trials must have no real effects');
  }
  console.log(`Validated receipt structure: ${receipt.results.length} reviewed simulations; host/OAuth proof remains separate.`);
}
console.log(JSON.stringify({ staticValidation: 'pass', routingCases: corpus.cases.length, workedExamples: examples.examples.length, readingPaths: measured, note: 'No model task, host install, live schema, OAuth or performance outcome is established by this command.' }, null, 2));
