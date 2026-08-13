#!/usr/bin/env node
/**
 * read-context-guard.mjs
 *
 * Sole mutating owner for Claude Code's native Read surface.
 *
 * Ordered rules:
 *   1. unchanged same-range reread suppression (digest verified)
 *   2. oversized whole-file read deny-once
 *   3. successful Read recording
 *
 * State is per session and invalidated before compaction and at session end.
 * Every denial has a one-repeat escape valve. Failures are fail-open.
 *
 * Node.js >= 18, no third-party dependencies.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import {
  eventName,
  mergeObjects,
  readJson,
  readStdinJson,
  resolveConfiguredPath,
  safePart,
  sessionIdFrom,
  toolName,
  writePrivateJson
} from './lib/token-stack-shared.mjs';
import { evaluateReadSlice, READ_SLICE_DEFAULTS } from './read-slice-guard.mjs';
import { evaluateReread, recordSuccessfulRead, REREAD_DEFAULTS } from './reread-guard.mjs';

const VERSION = 1;
const DEFAULTS = Object.freeze({
  enabled: true,
  configFile: '~/.claude/read-context-guard.config.json',
  stateDir: '~/.claude/token-stack/read-state',
  retentionHours: 48,
  pruneChance: 0.02,
  slice: READ_SLICE_DEFAULTS,
  reread: REREAD_DEFAULTS
});

function loadConfig(cwd = process.cwd()) {
  const globalFile = resolveConfiguredPath(process.env.READ_CONTEXT_GUARD_CONFIG || DEFAULTS.configFile, cwd);
  const projectFile = path.join(cwd, '.claude', 'read-context-guard.config.json');
  const config = mergeObjects(DEFAULTS, readJson(globalFile, {}), readJson(projectFile, {}));
  config.configFile = globalFile;
  config.stateDir = resolveConfiguredPath(process.env.READ_CONTEXT_GUARD_STATE_DIR || config.stateDir, cwd);
  return config;
}

function statePath(config, input) {
  return path.join(config.stateDir, `${safePart(sessionIdFrom(input))}.json`);
}

function freshState(input) {
  return {
    schemaVersion: VERSION,
    sessionId: sessionIdFrom(input),
    updatedAt: new Date().toISOString(),
    reads: {},
    rereadDeniedOnce: {},
    sliceDeniedOnce: {}
  };
}

function loadState(config, input) {
  const file = statePath(config, input);
  const value = readJson(file, null);
  if (!value || value.schemaVersion !== VERSION) return freshState(input);
  value.reads ||= {};
  value.rereadDeniedOnce ||= {};
  value.sliceDeniedOnce ||= {};
  return value;
}

function saveState(config, input, state) {
  state.updatedAt = new Date().toISOString();
  writePrivateJson(statePath(config, input), state);
}

function clearState(config, input) {
  const file = statePath(config, input);
  try { fs.unlinkSync(file); return true; } catch { return false; }
}

function pruneState(config) {
  const cutoff = Date.now() - Math.max(1, Number(config.retentionHours)) * 3_600_000;
  if (!fs.existsSync(config.stateDir)) return 0;
  let removed = 0;
  for (const entry of fs.readdirSync(config.stateDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const file = path.join(config.stateDir, entry.name);
    try {
      if (fs.statSync(file).mtimeMs < cutoff) { fs.unlinkSync(file); removed += 1; }
    } catch { /* fail open */ }
  }
  return removed;
}

function denyOutput(reason) {
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason
    }
  };
}

export function handleReadEvent(input, config, state, now = Date.now()) {
  const event = eventName(input);
  const tool = toolName(input);
  if (event === 'PreCompact' || event === 'SessionEnd') return { clear: true };
  if (tool !== 'Read') return { output: null, changedState: false };

  if (event === 'PreToolUse') {
    const reread = evaluateReread(input, config, state, now);
    if (reread?.decision === 'deny') return { output: denyOutput(reread.reason), changedState: true, result: reread };
    if (reread?.changedState) return { output: null, changedState: true, result: reread };

    const slice = evaluateReadSlice(input, config, state, now);
    if (slice?.decision === 'deny') return { output: denyOutput(slice.reason), changedState: true, result: slice };
    if (slice?.changedState) return { output: null, changedState: true, result: slice };
    return { output: null, changedState: false };
  }

  if (event === 'PostToolUse') {
    const changedState = recordSuccessfulRead(input, config, state, now);
    return { output: null, changedState };
  }
  return { output: null, changedState: false };
}

function report(config) {
  const files = fs.existsSync(config.stateDir)
    ? fs.readdirSync(config.stateDir).filter((name) => name.endsWith('.json'))
    : [];
  const rows = files.map((name) => {
    const value = readJson(path.join(config.stateDir, name), {});
    return {
      session: value.sessionId || name.replace(/\.json$/, ''),
      reads: Object.keys(value.reads || {}).length,
      updatedAt: value.updatedAt || null
    };
  });
  console.log(JSON.stringify({ schemaVersion: VERSION, stateDir: config.stateDir, sessions: rows }, null, 2));
}

function selfTest() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'read-context-guard-test-'));
  try {
    const file = path.join(root, 'large.ts');
    fs.writeFileSync(file, Array.from({ length: 1_500 }, (_, index) => `export const line${index} = ${index};`).join('\n'));
    const config = mergeObjects(DEFAULTS, {
      stateDir: path.join(root, 'state'),
      slice: { maxWholeFileLines: 1_000, maxWholeFileBytes: 10_000, denyOnceWindowSeconds: 180 },
      reread: { hashMaxBytes: 10_000_000, denyOnceWindowSeconds: 180 }
    });
    const base = {
      session_id: 'self-test',
      tool_name: 'Read',
      tool_input: { file_path: file }
    };
    const state = freshState(base);
    const first = handleReadEvent({ ...base, hook_event_name: 'PreToolUse' }, config, state, 1_000);
    if (first.output?.hookSpecificOutput?.permissionDecision !== 'deny') throw new Error('Large first read was not denied');
    const escape = handleReadEvent({ ...base, hook_event_name: 'PreToolUse' }, config, state, 2_000);
    if (escape.output) throw new Error('Slice escape valve did not allow repeat');
    const recorded = handleReadEvent({ ...base, hook_event_name: 'PostToolUse', tool_response: { filePath: file, content: 'x' } }, config, state, 3_000);
    if (!recorded.changedState) throw new Error('Successful Read was not recorded');
    const reread = handleReadEvent({ ...base, hook_event_name: 'PreToolUse' }, config, state, 4_000);
    if (reread.output?.hookSpecificOutput?.permissionDecision !== 'deny' || reread.result?.code !== 'unchanged-reread') throw new Error('Unchanged reread was not denied first');
    const rereadEscape = handleReadEvent({ ...base, hook_event_name: 'PreToolUse' }, config, state, 5_000);
    if (rereadEscape.output) throw new Error('Reread escape valve did not allow repeat');
    fs.appendFileSync(file, '\nexport const changed = true;');
    const afterChange = handleReadEvent({ ...base, hook_event_name: 'PreToolUse', tool_input: { file_path: file, offset: 1, limit: 50 } }, config, state, 6_000);
    if (afterChange.output) throw new Error('Changed file should not be treated as unchanged reread');
    console.log('read-context-guard self-test: OK');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--self-test')) return selfTest();
  const config = loadConfig(process.cwd());
  if (args.includes('--status')) return report(config);
  if (args.includes('--prune')) return console.log(`Removed ${pruneState(config)} stale read-state file(s).`);
  if (Math.random() < Number(config.pruneChance || 0)) pruneState(config);
  if (!config.enabled) return;
  const input = await readStdinJson();
  if (!input) return;
  if (eventName(input) === 'PreCompact' || eventName(input) === 'SessionEnd') {
    clearState(config, input);
    return;
  }
  const state = loadState(config, input);
  const result = handleReadEvent(input, config, state);
  if (result.changedState) saveState(config, input, state);
  if (result.output) process.stdout.write(JSON.stringify(result.output));
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) {
  main().catch((error) => {
    console.error(`[read-context-guard] fail-open: ${error instanceof Error ? error.message : String(error)}`);
  });
}
