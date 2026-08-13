#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Diese Suite lag im Quellpaket unter hooks/tests/ und loeste die Hooks ueber
// ".." auf. Im Zielbaum liegt sie unter tests/contract/, die optionalen Hooks
// unter hooks/optional/ — der alte Anker zeigte ins Leere (Befund AP-4.5).
// fileURLToPath statt new URL().pathname: letzteres liefert unter Windows
// "/C:/..." und ist als Dateipfad unbrauchbar.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, '..', '..');
const HOOKS = path.join(PACKAGE_ROOT, 'hooks', 'optional');

// Fail-loud (L-6): ein fehlender Pruefgegenstand ist ein Befund, kein
// uebersprungener Test. Ohne diese Vorpruefung liefe die Suite in einen
// ENOENT-Stacktrace und liesse offen, WELCHER Hook fehlt.
const REQUIRED = ['prefix-budget.mjs', 'read-context-guard.mjs', 'session-economy.mjs'];
const missing = REQUIRED.filter((name) => !fs.existsSync(path.join(HOOKS, name)));
if (missing.length) {
  console.error(`FEHLENDE PRUEFGEGENSTAENDE in ${HOOKS}: ${missing.join(', ')}`);
  process.exit(1);
}

function run(script, input, env = {}, args = []) {
  const target = path.join(HOOKS, script);
  const result = spawnSync(process.execPath, [target, ...args], {
    input: input === null ? undefined : JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, ...env }
  });
  if (result.error) throw new Error(`${script} konnte nicht gestartet werden: ${result.error.message}`);
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
  // NUDGE_BUDGET_DIR isoliert das gemeinsame Nudge-Budget (AP-4.5) je Lauf.
  // Ohne die Isolation wuerde ein zweiter Durchlauf still bleiben, weil das
  // Budget der Sitzung "contract" schon verbraucht waere.
  const commonEnv = {
    HOME: home,
    CLAUDE_CONFIG_DIR: claudeDir,
    NUDGE_BUDGET_DIR: path.join(temp, 'nudge-budget')
  };

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

  // Die Bash-Output-Faelle dieser Suite prueften im Quellpaket
  // hooks/bash-dump-guard.mjs. Der Hook ist nicht uebernommen (Gesetz I: die
  // Fläche Bash-Output hat mit src/stack.mjs genau einen Owner) — die beiden
  // Faelle sind hier ersatzlos entfallen, NICHT stillgelegt. Die Abdeckung der
  // Bash-Fläche liegt bei tests/stack.test.mjs (AP-4.1).

  console.log('hook contract smoke: OK');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
