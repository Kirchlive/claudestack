#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checksumManifest = 'SHA256SUMS.txt';
const expectedTestCount = 32;
const required = [
  'README.md',
  'SHA256SUMS.txt',
  'package.json',
  'src/stack.mjs',
  'bin/claudestack.mjs',
  'hooks/claudestack.mjs',
  'config/token-stack.default.json',
  'config/token-stack.schema.json',
  'config/context-surface-owners.json',
  'scripts/evaluate-benchmark.mjs',
  'docs/ARCHITECTURE.md',
  'docs/DECISIONS.md',
  'docs/MIGRATION.md',
  'docs/BENCHMARK.md',
  'docs/WAVES.md',
  'docs/SECURITY.md',
  'docs/REPO-MATRIX.md',
  'templates/CLAUDE.md',
  'templates/TASK-STATE.md',
  'rules/token-stack.md',
  'tests/benchmark.test.mjs',
  'tests/cli.test.mjs',
  'tests/stack.test.mjs',
  'validate/06-incoming-reconciliation.md',
];

function inspectTree(directory, prefix = '') {
  const entries = [];
  for (const entry of fs.readdirSync(path.join(directory, prefix), { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, relative);
    const stat = fs.lstatSync(absolute);
    const mode = stat.mode & 0o7777;
    if (stat.isSymbolicLink()) entries.push({ path: relative, kind: 'symlink', mode });
    else if (stat.isDirectory()) {
      entries.push({ path: relative, kind: 'directory', mode });
      entries.push(...inspectTree(directory, relative));
    } else if (stat.isFile()) {
      const content = fs.readFileSync(absolute);
      entries.push({
        path: relative,
        kind: 'file',
        mode,
        content,
        sha256: createHash('sha256').update(content).digest('hex'),
      });
    } else entries.push({ path: relative, kind: 'special', mode });
  }
  return entries.sort((left, right) => left.path.localeCompare(right.path, 'en'));
}

function inspectPackage() {
  const tree = inspectTree(root);
  const regular = new Map(tree.filter((entry) => entry.kind === 'file').map((entry) => [entry.path, entry]));
  const deliveredFiles = [...regular.keys()].filter((entry) => entry !== checksumManifest).sort();
  const deliveredSet = new Set(deliveredFiles);
  const forbiddenEntries = tree
    .filter((entry) => entry.kind === 'symlink' || entry.kind === 'special')
    .map((entry) => `${entry.path}:${entry.kind}`);
  const forbiddenFiles = deliveredFiles.filter((entry) => path.posix.basename(entry) === '.DS_Store');
  const missing = required.filter((entry) => !regular.has(entry));
  const parsedJson = [];
  const jsonErrors = [];
  for (const entry of required.filter((item) => item.endsWith('.json') && regular.has(item))) {
    try {
      JSON.parse(regular.get(entry).content.toString('utf8'));
      parsedJson.push(entry);
    } catch {
      jsonErrors.push(`${entry}:invalid_json`);
    }
  }

  const checksumErrors = [];
  const checksumEntries = [];
  const checksumEntrySet = new Set();
  const manifest = regular.get(checksumManifest);
  if (!manifest) checksumErrors.push('manifest:missing_or_not_regular');
  else for (const line of manifest.content.toString('utf8').split(/\r?\n/).filter(Boolean)) {
    const match = line.match(/^([a-f0-9]{64})  (.+)$/);
    if (!match) {
      checksumErrors.push('manifest:invalid_line');
      continue;
    }
    const [, expected, entry] = match;
    checksumEntries.push(entry);
    if (
      entry === checksumManifest
      || path.isAbsolute(entry)
      || entry.includes('\\')
      || entry.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')
    ) {
      checksumErrors.push(`${entry}:invalid_path`);
      continue;
    }
    if (checksumEntrySet.has(entry)) {
      checksumErrors.push(`${entry}:duplicate`);
      continue;
    }
    checksumEntrySet.add(entry);
    const file = regular.get(entry);
    if (!file) checksumErrors.push(`${entry}:missing_or_not_regular`);
    else if (file.sha256 !== expected) checksumErrors.push(`${entry}:mismatch`);
  }
  const checksumMissing = deliveredFiles.filter((entry) => !checksumEntrySet.has(entry));
  const checksumUnexpected = [...checksumEntrySet].filter((entry) => !deliveredSet.has(entry)).sort();

  const forbiddenPatterns = [];
  for (const entry of required.filter((item) => (
    /[.](?:mjs|json)$/.test(item) && !item.startsWith('tests/') && regular.has(item)
  ))) {
    const content = regular.get(entry).content.toString('utf8');
    if (/permissionDecision\s*["']?\s*:\s*["']allow["']/i.test(content)) {
      forbiddenPatterns.push(`${entry}:permissionDecision_allow`);
    }
    if (/child_process/.test(content) && entry !== 'scripts/verify-package.mjs') {
      forbiddenPatterns.push(`${entry}:child_process`);
    }
  }

  const fingerprint = createHash('sha256').update(JSON.stringify(tree.map(({ path: entry, kind, mode, sha256 }) => ({
    path: entry,
    kind,
    mode,
    ...(sha256 ? { sha256 } : {}),
  })))).digest('hex');
  const ok = missing.length === 0
    && jsonErrors.length === 0
    && forbiddenEntries.length === 0
    && forbiddenFiles.length === 0
    && checksumErrors.length === 0
    && checksumMissing.length === 0
    && checksumUnexpected.length === 0
    && forbiddenPatterns.length === 0;
  return {
    ok,
    fingerprint,
    missing,
    parsedJson,
    jsonErrors,
    deliveredFiles,
    forbiddenEntries,
    forbiddenFiles,
    checksumErrors,
    checksumEntries,
    checksumMissing,
    checksumUnexpected,
    forbiddenPatterns,
    testFiles: deliveredFiles.filter((entry) => /^tests\/.*[.]test[.]mjs$/.test(entry)),
  };
}

function parseTapSummary(stdout) {
  const values = {};
  let duplicate = false;
  for (const match of stdout.matchAll(/^# (tests|pass|fail|suites) (\d+)$/gm)) {
    if (Object.hasOwn(values, match[1])) duplicate = true;
    values[match[1]] = Number(match[2]);
  }
  return {
    expected_count: expectedTestCount,
    observed_count: values.tests ?? null,
    valid: !duplicate
      && values.tests === expectedTestCount
      && values.tests > 0
      && values.pass === values.tests
      && values.fail === 0,
  };
}

const preflight = inspectPackage();
let postflight = null;
let tests = {
  skipped: true,
  reason: 'preflight_integrity_failed',
  exit_code: null,
  summary: [],
  expected_count: expectedTestCount,
  observed_count: null,
  summary_valid: false,
  stderr: '',
};
if (preflight.ok) {
  const result = spawnSync(process.execPath, ['--test', ...preflight.testFiles], {
    cwd: root,
    encoding: 'utf8',
  });
  const tap = parseTapSummary(result.stdout || '');
  tests = {
    skipped: false,
    reason: null,
    exit_code: result.status,
    summary: (result.stdout || '').split(/\r?\n/).filter((line) => /# (tests|pass|fail|suites)/.test(line)),
    expected_count: tap.expected_count,
    observed_count: tap.observed_count,
    summary_valid: tap.valid,
    stderr: (result.stderr || result.error?.message || '').trim(),
  };
  postflight = inspectPackage();
}
const state = postflight || preflight;
const treeUnchanged = postflight ? preflight.fingerprint === postflight.fingerprint : null;
const report = {
  schema: 'claudestack.package-verification/v1',
  ok: preflight.ok
    && postflight?.ok === true
    && treeUnchanged
    && tests.exit_code === 0
    && tests.summary_valid,
  preflight: { ok: preflight.ok },
  postflight: { performed: postflight !== null, ok: postflight?.ok ?? null, tree_unchanged: treeUnchanged },
  required_files: { expected: required.length, missing: state.missing },
  json_parsed: state.parsedJson,
  json_errors: state.jsonErrors,
  delivered_regular_files: state.deliveredFiles.length,
  forbidden_entries: state.forbiddenEntries,
  forbidden_files: state.forbiddenFiles,
  checksums: {
    expected_entries: state.deliveredFiles.length,
    entries: state.checksumEntries.length,
    missing_entries: state.checksumMissing,
    unexpected_entries: state.checksumUnexpected,
    errors: state.checksumErrors,
  },
  forbidden_patterns: state.forbiddenPatterns,
  tests,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = report.ok ? 0 : 1;
