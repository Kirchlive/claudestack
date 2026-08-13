import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateBenchmark } from '../scripts/evaluate-benchmark.mjs';

function pair(pairId, baselineCost, candidateCost, overrides = {}) {
  const common = {
    pair_id: pairId,
    task_success: true,
    accepted_change: true,
    input_tokens: 1_000,
    cache_read_tokens: 100,
    cache_write_tokens: 10,
    output_tokens: 200,
    latency_ms: 1_000,
    retries: 0,
    recovery_requests: 0,
    permission_regressions: 0,
    unrecoverable_outputs: 0,
  };
  return [
    { ...common, arm: 'baseline', cost_usd: baselineCost },
    { ...common, arm: 'candidate', cost_usd: candidateCost, ...overrides },
  ];
}

test('ten clean paired runs with lower cost promote candidate', () => {
  const records = Array.from({ length: 10 }, (_, index) => pair(`P${index + 1}`, 2, 1)).flat();
  const report = evaluateBenchmark(records);
  assert.equal(report.schema, 'claudestack.benchmark-result/v1');
  assert.equal(report.pairs.complete, 10);
  assert.equal(report.decision, 'promote');
  assert.equal(report.metrics.cost_per_accepted_change.baseline_median, 2);
  assert.equal(report.metrics.cost_per_accepted_change.candidate_median, 1);
  assert.equal(report.metrics.cost_per_accepted_change.delta_percent, -50);
});

test('fewer than ten pairs are insufficient, never promoted', () => {
  const records = Array.from({ length: 9 }, (_, index) => pair(`P${index + 1}`, 2, 1)).flat();
  const report = evaluateBenchmark(records);
  assert.equal(report.decision, 'insufficient');
  assert.ok(report.reasons.includes('MINIMUM_COMPLETE_PAIRS_NOT_MET'));
});

test('permission regression rejects candidate despite lower cost', () => {
  const records = Array.from({ length: 10 }, (_, index) => pair(
    `P${index + 1}`,
    2,
    1,
    index === 0 ? { permission_regressions: 1 } : {},
  )).flat();
  const report = evaluateBenchmark(records);
  assert.equal(report.decision, 'reject');
  assert.ok(report.reasons.includes('PERMISSION_REGRESSION'));
});

test('unpaired or duplicate arms fail validation', () => {
  assert.throws(
    () => evaluateBenchmark([{ pair_id: 'P1', arm: 'baseline' }]),
    /exactly one baseline and one candidate/i,
  );
});
