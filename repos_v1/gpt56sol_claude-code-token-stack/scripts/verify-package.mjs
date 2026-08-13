#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
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
];

const missing = required.filter((entry) => !fs.existsSync(path.join(root, entry)));
const parsedJson = [];
for (const entry of required.filter((item) => item.endsWith('.json') && !missing.includes(item))) {
  JSON.parse(fs.readFileSync(path.join(root, entry), 'utf8'));
  parsedJson.push(entry);
}

const checksumErrors = [];
const checksumEntries = fs.readFileSync(path.join(root, 'SHA256SUMS.txt'), 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => {
    const match = line.match(/^([a-f0-9]{64})  (.+)$/);
    if (!match) throw new Error(`Invalid checksum line: ${line}`);
    const [, expected, entry] = match;
    const file = path.join(root, entry);
    if (!fs.existsSync(file)) checksumErrors.push(`${entry}:missing`);
    else {
      const actual = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      if (actual !== expected) checksumErrors.push(`${entry}:mismatch`);
    }
    return entry;
  });

const tests = spawnSync(process.execPath, ['--test', 'tests/*.test.mjs'], {
  cwd: root,
  encoding: 'utf8',
  shell: true,
});
const forbidden = [];
for (const entry of required.filter((item) => /[.](?:mjs|json)$/.test(item) && !missing.includes(item))) {
  const content = fs.readFileSync(path.join(root, entry), 'utf8');
  if (/permissionDecision\s*["']?\s*:\s*["']allow["']/i.test(content)) forbidden.push(`${entry}:permissionDecision_allow`);
  if (/child_process/.test(content) && entry !== 'scripts/verify-package.mjs') forbidden.push(`${entry}:child_process`);
}

const report = {
  schema: 'claudestack.package-verification/v1',
  ok: missing.length === 0 && checksumErrors.length === 0 && forbidden.length === 0 && tests.status === 0,
  required_files: { expected: required.length, missing },
  json_parsed: parsedJson,
  checksums: { entries: checksumEntries.length, errors: checksumErrors },
  forbidden_patterns: forbidden,
  tests: {
    exit_code: tests.status,
    summary: (tests.stdout || '').split(/\r?\n/).filter((line) => /# (tests|pass|fail|suites)/.test(line)),
    stderr: (tests.stderr || '').trim(),
  },
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = report.ok ? 0 : 1;
