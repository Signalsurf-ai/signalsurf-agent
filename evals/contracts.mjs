import assert from 'node:assert/strict';

// Validates the meaning of synthetic evidence envelopes; it never calls MCP.
export function validateExample(example, capabilities) {
  const states = ['draft', 'saved', 'queued', 'partial', 'completed', 'delivered', 'unknown', 'failed'];
  assert(states.includes(example.observedState));
  assert.equal(example.claimedState, example.observedState, 'Claims must reflect the observed state');
  assert(Array.isArray(example.evidence) && example.evidence.length > 0);
  assert(Array.isArray(example.effects));
  assert(Array.isArray(example.steps) && example.steps.length > 0);
  for (const step of example.steps) {
    assert(Object.hasOwn(capabilities, step.capability), `Undocumented capability ${step.capability}`);
    if (step.action !== null) assert(capabilities[step.capability].actions.includes(step.action), `Undocumented action ${step.capability}.${step.action}`);
  }
  if (example.observedState === 'delivered') assert(example.evidence.includes('delivery'), 'Delivery needs delivery evidence');
  if (example.observedState === 'saved') assert(example.evidence.includes('readback'), 'Saved state needs readback');
  if (example.observedState === 'completed') assert(example.evidence.includes('result'), 'Completion needs actual result');
  if (example.requestedStage === 'research') assert.equal(example.effects.length, 0, 'Research does not imply persistence or sending');
  if (example.originalOperationId !== undefined) {
    assert.equal(example.retryOperationId, example.originalOperationId, 'Exact retry preserves operation ID');
    if (example.retryDispatched) assert.equal(example.reconciled, true, 'Reconcile unknown outcomes before retry');
  }
}
