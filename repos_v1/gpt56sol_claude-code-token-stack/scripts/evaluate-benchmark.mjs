#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_NUMBERS = [
  'input_tokens',
  'cache_read_tokens',
  'cache_write_tokens',
  'output_tokens',
  'cost_usd',
  'latency_ms',
  'retries',
  'recovery_requests',
  'permission_regressions',
  'unrecoverable_outputs',
];

function round(value, places = 6) {
  if (!Number.isFinite(value)) return null;
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function percentile(values, percentileValue) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.max(0, Math.ceil(percentileValue * sorted.length) - 1);
  return sorted[index];
}

function sum(records, field) {
  return records.reduce((total, record) => total + record[field], 0);
}

function rate(records, field) {
  return records.length ? records.filter((record) => record[field] === true).length / records.length : 0;
}

function validateRecord(record, index) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error(`Record ${index} must be an object`);
  if (!String(record.pair_id || '').trim()) throw new Error(`Record ${index} requires pair_id`);
  if (!['baseline', 'candidate'].includes(record.arm)) throw new Error(`Record ${index} has invalid arm`);
  for (const field of REQUIRED_NUMBERS) {
    if (!Number.isFinite(record[field]) || record[field] < 0) throw new Error(`Record ${index} requires non-negative ${field}`);
  }
  for (const field of ['task_success', 'accepted_change']) {
    if (typeof record[field] !== 'boolean') throw new Error(`Record ${index} requires boolean ${field}`);
  }
}

function armMetrics(records) {
  const acceptedCosts = records.filter((record) => record.accepted_change).map((record) => record.cost_usd);
  const acceptedCount = records.filter((record) => record.accepted_change).length;
  return {
    runs: records.length,
    task_success_rate: round(rate(records, 'task_success')),
    accepted_change_rate: round(rate(records, 'accepted_change')),
    total_cost_usd: round(sum(records, 'cost_usd')),
    cost_per_accepted_change: acceptedCount ? round(sum(records, 'cost_usd') / acceptedCount) : null,
    accepted_cost_median: round(median(acceptedCosts)),
    input_tokens_total: sum(records, 'input_tokens'),
    cache_read_tokens_total: sum(records, 'cache_read_tokens'),
    cache_write_tokens_total: sum(records, 'cache_write_tokens'),
    output_tokens_total: sum(records, 'output_tokens'),
    latency_ms_p50: round(median(records.map((record) => record.latency_ms))),
    latency_ms_p95: round(percentile(records.map((record) => record.latency_ms), 0.95)),
    retries_total: sum(records, 'retries'),
    recovery_requests_total: sum(records, 'recovery_requests'),
    permission_regressions_total: sum(records, 'permission_regressions'),
    unrecoverable_outputs_total: sum(records, 'unrecoverable_outputs'),
  };
}

function deltaPercent(baseline, candidate) {
  if (!Number.isFinite(baseline) || !Number.isFinite(candidate) || baseline === 0) return null;
  return round(((candidate - baseline) / baseline) * 100, 3);
}

export function evaluateBenchmark(records, { minimumPairs = 10 } = {}) {
  if (!Array.isArray(records) || records.length === 0) throw new Error('Benchmark requires a non-empty record array');

  const grouped = new Map();
  records.forEach((record, index) => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error(`Record ${index} must be an object`);
    const pairId = String(record.pair_id || '').trim();
    const arms = grouped.get(pairId) || [];
    arms.push(record);
    grouped.set(pairId, arms);
  });

  for (const [pairId, arms] of grouped) {
    const baseline = arms.filter((record) => record.arm === 'baseline');
    const candidate = arms.filter((record) => record.arm === 'candidate');
    if (!pairId || baseline.length !== 1 || candidate.length !== 1 || arms.length !== 2) {
      throw new Error(`Pair ${pairId || '<empty>'} must contain exactly one baseline and one candidate`);
    }
  }
  records.forEach(validateRecord);

  const baselineRecords = records.filter((record) => record.arm === 'baseline');
  const candidateRecords = records.filter((record) => record.arm === 'candidate');
  const baseline = armMetrics(baselineRecords);
  const candidate = armMetrics(candidateRecords);
  const reasons = [];

  if (grouped.size < minimumPairs) reasons.push('MINIMUM_COMPLETE_PAIRS_NOT_MET');
  if (candidate.permission_regressions_total > 0) reasons.push('PERMISSION_REGRESSION');
  if (candidate.unrecoverable_outputs_total > 0) reasons.push('UNRECOVERABLE_OUTPUT');
  if (candidate.task_success_rate < baseline.task_success_rate) reasons.push('TASK_SUCCESS_DEGRADED');
  if (candidate.accepted_change_rate < baseline.accepted_change_rate) reasons.push('ACCEPTED_CHANGE_RATE_DEGRADED');
  if (
    candidate.cost_per_accepted_change == null ||
    baseline.cost_per_accepted_change == null ||
    candidate.cost_per_accepted_change >= baseline.cost_per_accepted_change
  ) reasons.push('COST_PER_ACCEPTED_CHANGE_NOT_IMPROVED');

  const hardFailure = reasons.some((reason) => [
    'PERMISSION_REGRESSION',
    'UNRECOVERABLE_OUTPUT',
    'TASK_SUCCESS_DEGRADED',
    'ACCEPTED_CHANGE_RATE_DEGRADED',
    'COST_PER_ACCEPTED_CHANGE_NOT_IMPROVED',
  ].includes(reason));
  const decision = hardFailure ? 'reject' : grouped.size < minimumPairs ? 'insufficient' : 'promote';

  return {
    schema: 'claudestack.benchmark-result/v1',
    decision,
    reasons,
    pairs: { complete: grouped.size, minimum_required: minimumPairs },
    arms: { baseline, candidate },
    metrics: {
      cost_per_accepted_change: {
        baseline_median: baseline.accepted_cost_median,
        candidate_median: candidate.accepted_cost_median,
        delta_percent: deltaPercent(baseline.accepted_cost_median, candidate.accepted_cost_median),
      },
      provider_tokens_total: {
        baseline: baseline.input_tokens_total + baseline.cache_read_tokens_total + baseline.cache_write_tokens_total + baseline.output_tokens_total,
        candidate: candidate.input_tokens_total + candidate.cache_read_tokens_total + candidate.cache_write_tokens_total + candidate.output_tokens_total,
      },
      latency_ms_p95: { baseline: baseline.latency_ms_p95, candidate: candidate.latency_ms_p95 },
    },
  };
}

function readJsonLines(file) {
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line, index) => {
      try { return JSON.parse(line); } catch (error) { throw new Error(`Invalid JSONL line ${index + 1}: ${error.message}`); }
    });
}

function main(argv) {
  if (argv.length !== 1) throw new Error('Usage: node scripts/evaluate-benchmark.mjs <runs.jsonl>');
  const report = evaluateBenchmark(readJsonLines(path.resolve(argv[0])));
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.decision === 'promote' ? 0 : report.decision === 'insufficient' ? 2 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (error) {
    process.stderr.write(`${JSON.stringify({ schema: 'claudestack.error/v1', error: error.message })}\n`);
    process.exitCode = 2;
  }
}
