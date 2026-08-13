#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function run(script, input, env = {}, args = []) {
  const result = spawnSync(process.execPath, [path.join(ROOT, script), ...args], {
    input: input === null ? undefined : JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, ...env }
  });
  if (result.status !== 0) throw new Error(`${script} exit ${result.status}: ${result.stderr}`);
  return { stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

function parsed(output, label) {
  if (!output) throw new Error(`${label}: missing stdout`);
  try { return JSON.parse(output); } catch { throw new Error(`${label}: invalid JSON: ${output}`); }
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'token-stack-contract-'));
try {
  const home = path.join(temp, 'home');
  const repo = path.join(temp, 'repo');
  const claudeDir = path.join(home, '.claude');
  fs.mkdirSync(path.join(repo, '.claude'), { recursive: true });
  fs.mkdirSync(claudeDir, { recursive: true });
  const commonEnv = { HOME: home, CLAUDE_CONFIG_DIR: claudeDir };

  // SessionStart prefix advisory.
  fs.writeFileSync(path.join(repo, 'CLAUDE.md'), 'x'.repeat(8_000));
  const prefixConfig = path.join(temp, 'prefix.json');
  fs.writeFileSync(prefixConfig, JSON.stringify({
    mode: 'advisory',
    maxClaudeMdEstimatedTokens: 100,
    reportFile: path.join(temp, 'prefix-report.json'),
    metricsFile: path.join(temp, 'prefix-metrics.jsonl')
  }));
  const prefix = parsed(run('prefix-budget.mjs', {
    session_id: 'contract', hook_event_name: 'SessionStart', cwd: repo, source: 'startup'
  }, { ...commonEnv, PREFIX_BUDGET_CONFIG: prefixConfig }).stdout, 'prefix');
  if (prefix.hookSpecificOutput?.hookEventName !== 'SessionStart' || !prefix.hookSpecificOutput?.additionalContext) throw new Error('prefix contract mismatch');

  // Read deny-once + record + digest reread.
  const large = path.join(repo, 'large.ts');
  fs.writeFileSync(large, Array.from({ length: 300 }, (_, i) => `export const x${i} = ${i};`).join('\n'));
  const readConfig = path.join(temp, 'read.json');
  fs.writeFileSync(readConfig, JSON.stringify({
    stateDir: path.join(temp, 'read-state'),
    pruneChance: 0,
    slice: { maxWholeFileLines: 100, maxWholeFileBytes: 1000, maxProbeBytes: 1000000, denyOnceWindowSeconds: 180 },
    reread: { hashMaxBytes: 1000000, denyOnceWindowSeconds: 180 }
  }));
  const prePayload = { session_id: 'contract', hook_event_name: 'PreToolUse', tool_name: 'Read', cwd: repo, tool_input: { file_path: large } };
  const firstRead = parsed(run('read-context-guard.mjs', prePayload, { ...commonEnv, READ_CONTEXT_GUARD_CONFIG: readConfig }).stdout, 'read first');
  if (firstRead.hookSpecificOutput?.permissionDecision !== 'deny') throw new Error('read slice contract mismatch');
  const escapeRead = run('read-context-guard.mjs', prePayload, { ...commonEnv, READ_CONTEXT_GUARD_CONFIG: readConfig });
  if (escapeRead.stdout) throw new Error('read slice escape should emit no decision');
  run('read-context-guard.mjs', { ...prePayload, hook_event_name: 'PostToolUse', tool_response: { filePath: large, content: 'ok' } }, { ...commonEnv, READ_CONTEXT_GUARD_CONFIG: readConfig });
  const reread = parsed(run('read-context-guard.mjs', prePayload, { ...commonEnv, READ_CONTEXT_GUARD_CONFIG: readConfig }).stdout, 'reread');
  if (reread.hookSpecificOutput?.permissionDecision !== 'deny' || !/reread-guard/.test(reread.hookSpecificOutput.permissionDecisionReason)) throw new Error('reread contract mismatch');

  // Stop user-only pressure advisory and checkpoint.
  const transcript = path.join(temp, 'session.jsonl');
  fs.writeFileSync(transcript, [
    JSON.stringify({ message: { role: 'user', content: 'Continue the verified implementation.' } }),
    JSON.stringify({ message: { model: 'test', usage: { input_tokens: 10_000, cache_read_input_tokens: 135_000, cache_creation_input_tokens: 5_000 } } })
  ].join('\n'));
  const sessionConfig = path.join(temp, 'session-config.json');
  fs.writeFileSync(sessionConfig, JSON.stringify({
    stateDir: path.join(temp, 'session-state'),
    checkpointDir: path.join(temp, 'checkpoints'),
    assumedContextWindowTokens: 200000,
    pressureBands: [0.7], minTurns: 1, pruneChance: 0,
    injectAdvisoryToClaude: false
  }));
  const session = parsed(run('session-economy.mjs', {
    session_id: 'contract', hook_event_name: 'Stop', cwd: repo, transcript_path: transcript
  }, { ...commonEnv, SESSION_ECONOMY_CONFIG: sessionConfig }).stdout, 'session');
  if (!session.systemMessage || session.hookSpecificOutput) throw new Error('session default contract mismatch');

  // Bash PostToolUse replacement and native-truncation pass-through.
  const bashConfig = path.join(temp, 'bash.json');
  fs.writeFileSync(bashConfig, JSON.stringify({
    hookActivation: 'replace', alignWithNativeBashLimit: false,
    minInputBytes: 100, targetOutputBytes: 1000, hardOutputBytes: 2000,
    minSavingsBytes: 20, minSavingsRatio: 0.05,
    storeRaw: true, rawStoreDir: path.join(temp, 'raw'),
    metricsFile: path.join(temp, 'bash-metrics.jsonl'), footer: false, pruneChance: 0
  }));
  const noisy = Array.from({ length: 200 }, (_, i) => i % 4 ? `noise ${i}` : `test_${i} passed`).join('\n') + '\n200 passed, 0 failed';
  const bash = parsed(run('bash-dump-guard.mjs', {
    session_id: 'contract', tool_use_id: 'b1', hook_event_name: 'PostToolUse', tool_name: 'Bash', cwd: repo,
    tool_input: { command: 'pytest -v' },
    tool_response: { stdout: noisy, stderr: '', interrupted: false, isImage: false, exitCode: 0 }
  }, { ...commonEnv, BASH_DUMP_GUARD_CONFIG: bashConfig }).stdout, 'bash');
  if (bash.hookSpecificOutput?.hookEventName !== 'PostToolUse' || !bash.hookSpecificOutput?.updatedToolOutput?.stdout) throw new Error('bash replacement contract mismatch');
  const native = run('bash-dump-guard.mjs', {
    session_id: 'contract', tool_use_id: 'b2', hook_event_name: 'PostToolUse', tool_name: 'Bash', cwd: repo,
    tool_input: { command: 'unknown' },
    tool_response: { stdout: '... [10000 characters truncated] ...\nFull output saved to /tmp/full.log', stderr: '', interrupted: false, isImage: false, exitCode: 0 }
  }, { ...commonEnv, BASH_DUMP_GUARD_CONFIG: bashConfig });
  if (native.stdout) throw new Error('native-truncated output should pass through with empty hook stdout');

  console.log('hook contract smoke: OK');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
