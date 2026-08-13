#!/usr/bin/env node
/**
 * session-economy.mjs
 *
 * Advisory session-boundary observer for Claude Code. It derives the latest
 * request-input estimate from hook input or the session transcript, writes a
 * private mechanical checkpoint, and warns at configured pressure bands.
 *
 * Default behavior never blocks and does not inject a summary into Claude's
 * context. It uses systemMessage for the user; optional model-facing context is
 * explicit and off by default.
 *
 * Paket-Uebernahme (claude-token-stack-paket): stdin ist ueber
 * lib/token-stack-shared.mjs auf 8 MiB hart begrenzt (Fix B4); uebergrosse
 * Payloads werden fail-open durchgereicht.
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
  oneLine,
  readJson,
  readStdinJson,
  resolveConfiguredPath,
  safePart,
  sessionIdFrom,
  sha256,
  writePrivateJson
} from './lib/token-stack-shared.mjs';

const VERSION = 1;
const DEFAULTS = Object.freeze({
  enabled: true,
  configFile: '~/.claude/session-economy.config.json',
  stateDir: '~/.claude/token-stack/session-economy',
  checkpointDir: '~/.claude/token-stack/checkpoints',
  assumedContextWindowTokens: 200_000,
  pressureBands: [0.70, 0.80],
  minTurns: 6,
  transcriptTailBytes: 4_194_304,
  maxRecentFiles: 30,
  maxRecentCommands: 12,
  maxUserTextChars: 1_200,
  storeUserText: true,
  storeCommandText: false,
  checkpointOnStop: true,
  checkpointOnPreCompact: true,
  checkpointOnSessionEnd: true,
  injectAdvisoryToClaude: false,
  systemMessageMaxChars: 900,
  retentionDays: 14,
  pruneChance: 0.02
});

const SECRET_RULES = [
  /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g,
  /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b/g,
  /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{8,}\b/g,
  /\b(Bearer\s+)[A-Za-z0-9._~+\/-]{16,}/gi,
  /\b(api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password|passwd)\b\s*[:=]\s*([^\s,;]{8,})/gi
];

function redact(text) {
  let out = String(text ?? '');
  for (const rule of SECRET_RULES) {
    rule.lastIndex = 0;
    out = out.replace(rule, (match, prefix) => prefix && /^Bearer/i.test(prefix) ? `${prefix}[REDACTED]` : '[REDACTED]');
  }
  return out;
}

function loadConfig(cwd = process.cwd()) {
  const globalFile = resolveConfiguredPath(process.env.SESSION_ECONOMY_CONFIG || DEFAULTS.configFile, cwd);
  const projectFile = path.join(cwd, '.claude', 'session-economy.config.json');
  const config = mergeObjects(DEFAULTS, readJson(globalFile, {}), readJson(projectFile, {}));
  config.configFile = globalFile;
  config.stateDir = resolveConfiguredPath(process.env.SESSION_ECONOMY_STATE_DIR || config.stateDir, cwd);
  config.checkpointDir = resolveConfiguredPath(process.env.SESSION_ECONOMY_CHECKPOINT_DIR || config.checkpointDir, cwd);
  config.pressureBands = [...new Set((config.pressureBands || []).map(Number).filter((value) => value > 0 && value < 1))].sort((a, b) => a - b);
  return config;
}

function statePath(config, input) {
  return path.join(config.stateDir, `${safePart(sessionIdFrom(input))}.json`);
}

function loadState(config, input) {
  const value = readJson(statePath(config, input), {});
  return {
    schemaVersion: VERSION,
    sessionId: sessionIdFrom(input),
    turns: Number(value.turns || 0),
    notifiedBands: Array.isArray(value.notifiedBands) ? value.notifiedBands : [],
    latest: value.latest || null,
    checkpoint: value.checkpoint || null,
    updatedAt: value.updatedAt || null
  };
}

function saveState(config, input, state) {
  state.updatedAt = new Date().toISOString();
  writePrivateJson(statePath(config, input), state);
}

function tailText(filePath, maxBytes) {
  try {
    const stat = fs.statSync(filePath);
    const start = Math.max(0, stat.size - Math.max(1, Number(maxBytes)));
    const fd = fs.openSync(filePath, 'r');
    try {
      const buffer = Buffer.alloc(stat.size - start);
      fs.readSync(fd, buffer, 0, buffer.length, start);
      const text = buffer.toString('utf8');
      const firstBreak = start > 0 ? text.indexOf('\n') : -1;
      return firstBreak >= 0 ? text.slice(firstBreak + 1) : text;
    } finally { fs.closeSync(fd); }
  } catch {
    return '';
  }
}

function numeric(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  if (value && typeof value === 'object') return Object.values(value).reduce((sum, item) => sum + numeric(item), 0);
  return 0;
}

function contentText(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((item) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') return item.text || item.content || '';
    return '';
  }).filter(Boolean).join('\n');
  if (value && typeof value === 'object') return value.text || value.content || '';
  return '';
}


function userPromptText(record) {
  const candidates = [];
  if (record && typeof record === 'object') {
    if (String(record.role || '').toLowerCase() === 'user') candidates.push(record.content);
    if (record.message && String(record.message.role || '').toLowerCase() === 'user') candidates.push(record.message.content);
  }
  for (const content of candidates) {
    if (Array.isArray(content) && content.some((item) => item && typeof item === 'object' && ['tool_result', 'tool_use'].includes(String(item.type || '').toLowerCase()))) continue;
    const text = contentText(content);
    if (text && !/^<tool_use_error>/i.test(text.trim())) return text;
  }
  return null;
}

function walkObject(value, visit, depth = 0) {
  if (depth > 12 || value === null || value === undefined) return;
  visit(value);
  if (Array.isArray(value)) {
    for (const item of value) walkObject(item, visit, depth + 1);
  } else if (typeof value === 'object') {
    for (const item of Object.values(value)) walkObject(item, visit, depth + 1);
  }
}

function usageFromObject(root) {
  let candidate = null;
  walkObject(root, (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    const hasInput = Object.hasOwn(value, 'input_tokens') || Object.hasOwn(value, 'inputTokens');
    const hasCache = Object.hasOwn(value, 'cache_read_input_tokens') || Object.hasOwn(value, 'cache_creation_input_tokens') || Object.hasOwn(value, 'cacheReadInputTokens') || Object.hasOwn(value, 'cacheCreationInputTokens');
    if (!hasInput && !hasCache) return;
    const uncached = numeric(value.input_tokens ?? value.inputTokens);
    const cacheRead = numeric(value.cache_read_input_tokens ?? value.cacheReadInputTokens);
    const cacheCreate = numeric(value.cache_creation_input_tokens ?? value.cacheCreationInputTokens);
    const total = uncached + cacheRead + cacheCreate;
    if (total > 0) candidate = { totalInputTokens: total, uncachedInputTokens: uncached, cacheReadTokens: cacheRead, cacheCreationTokens: cacheCreate };
  });
  return candidate;
}

function directPercentage(input) {
  const candidates = [
    input?.context_window?.used_percentage,
    input?.context_window?.usedPercentage,
    input?.contextWindow?.used_percentage,
    input?.contextWindow?.usedPercentage,
    input?.context_used_percentage,
    input?.contextUsedPercentage
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) return n > 1 ? n / 100 : n;
  }
  return null;
}

function contextWindowTokens(config, input, transcriptInfo) {
  const explicit = Number(
    process.env.SESSION_ECONOMY_CONTEXT_TOKENS ||
    process.env.CLAUDE_CODE_MAX_CONTEXT_TOKENS ||
    input?.context_window?.context_window_size ||
    input?.context_window?.contextWindowSize ||
    input?.contextWindow?.contextWindowSize ||
    0
  );
  if (Number.isFinite(explicit) && explicit > 0) return { tokens: explicit, source: 'runtime-or-env' };
  const model = String(transcriptInfo.model || input?.model || '');
  const mapped = Number(config.modelContextTokens?.[model] || 0);
  if (mapped > 0) return { tokens: mapped, source: `model-map:${model}` };
  return { tokens: Number(config.assumedContextWindowTokens), source: 'configured-assumption' };
}

function relativeFile(value, cwd) {
  const raw = String(value || '');
  if (!raw || raw.length > 2_000) return null;
  const absolute = path.isAbsolute(raw) ? path.normalize(raw) : path.resolve(cwd, raw);
  const relative = path.relative(cwd, absolute);
  return relative && !relative.startsWith('..') ? relative : absolute;
}

function commandRecord(command, config) {
  const clean = redact(String(command || '')).replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  const family = clean.match(/^(?:[A-Z_][A-Z0-9_]*=[^\s]+\s+)*([^\s]+)/i)?.[1] || 'command';
  return config.storeCommandText
    ? oneLine(clean, 300)
    : `${family} sha256:${sha256(clean).slice(0, 12)}`;
}

function analyzeTranscript(transcriptPath, cwd, config) {
  const text = tailText(transcriptPath, config.transcriptTailBytes);
  const result = { usage: null, model: null, lastUserText: null, files: [], commands: [], parsedLines: 0 };
  const files = new Set();
  const commands = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let record;
    try { record = JSON.parse(line); } catch { continue; }
    result.parsedLines += 1;
    const usage = usageFromObject(record);
    if (usage) result.usage = usage;
    const promptText = userPromptText(record);
    if (promptText) result.lastUserText = promptText;
    walkObject(record, (value) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return;
      if (!result.model && typeof value.model === 'string') result.model = value.model;
      for (const key of ['file_path', 'filePath', 'path']) {
        const file = relativeFile(value[key], cwd);
        if (file) files.add(file);
      }
      if (typeof value.command === 'string') {
        const item = commandRecord(value.command, config);
        if (item) commands.push(item);
      }
    });
  }
  result.files = [...files].slice(-Number(config.maxRecentFiles));
  result.commands = [...new Set(commands)].slice(-Number(config.maxRecentCommands));
  if (result.lastUserText) result.lastUserText = oneLine(redact(result.lastUserText), Number(config.maxUserTextChars));
  return result;
}

function pressureSnapshot(input, config) {
  const cwd = path.resolve(String(input?.cwd || process.cwd()));
  const transcriptPath = String(input?.transcript_path || input?.transcriptPath || '');
  const transcript = transcriptPath ? analyzeTranscript(transcriptPath, cwd, config) : { usage: null, model: null, lastUserText: null, files: [], commands: [], parsedLines: 0 };
  const window = contextWindowTokens(config, input, transcript);
  const direct = directPercentage(input);
  const used = direct !== null ? Math.round(direct * window.tokens) : Number(transcript.usage?.totalInputTokens || 0);
  const ratio = direct !== null ? direct : (used > 0 && window.tokens > 0 ? used / window.tokens : null);
  return {
    at: new Date().toISOString(),
    cwd,
    transcriptPath,
    model: transcript.model || input?.model || null,
    contextWindowTokens: window.tokens,
    contextWindowSource: window.source,
    usedInputTokens: used || null,
    usedRatio: ratio,
    percentageSource: direct !== null ? 'hook-input' : transcript.usage ? 'latest-transcript-usage' : 'unavailable',
    usage: transcript.usage,
    parsedTranscriptLines: transcript.parsedLines,
    lastUserText: config.storeUserText ? transcript.lastUserText : null,
    lastUserTextHash: transcript.lastUserText ? sha256(transcript.lastUserText).slice(0, 16) : null,
    recentFiles: transcript.files,
    recentCommands: transcript.commands,
    estimateNotice: direct === null ? 'Ratio is transcript-derived and depends on the configured context-window assumption.' : null
  };
}

function projectKey(cwd) {
  return `${safePart(path.basename(cwd), 'project', 50)}-${sha256(path.resolve(cwd)).slice(0, 12)}`;
}

function checkpointPath(config, input, snapshot) {
  return path.join(config.checkpointDir, projectKey(snapshot.cwd), `${safePart(sessionIdFrom(input))}.md`);
}

function writeCheckpoint(config, input, snapshot) {
  const target = checkpointPath(config, input, snapshot);
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const pct = Number.isFinite(snapshot.usedRatio) ? `${(snapshot.usedRatio * 100).toFixed(1)}%` : 'unknown';
  const lines = [
    '# Mechanical Session Checkpoint',
    '',
    `Generated: ${snapshot.at}`,
    `Project: ${snapshot.cwd}`,
    `Session: ${sessionIdFrom(input)}`,
    `Context estimate: ${snapshot.usedInputTokens ?? 'unknown'} / ${snapshot.contextWindowTokens} tokens (${pct}; ${snapshot.percentageSource}; window=${snapshot.contextWindowSource})`,
    '',
    '> This file is mechanically extracted and intentionally incomplete. It does not preserve decisions, rejected approaches, or verification intent. Maintain `.claude/TASK-STATE.md` as the authoritative handoff.',
    '',
    '## Last user request',
    '',
    snapshot.lastUserText || `(not stored; hash=${snapshot.lastUserTextHash || 'unavailable'})`,
    '',
    '## Recent files',
    '',
    ...(snapshot.recentFiles.length ? snapshot.recentFiles.map((file) => `- ${file}`) : ['- None extracted']),
    '',
    '## Recent command families',
    '',
    ...(snapshot.recentCommands.length ? snapshot.recentCommands.map((command) => `- ${command}`) : ['- None extracted']),
    '',
    '## Resume contract',
    '',
    '1. Read `.claude/TASK-STATE.md` when present; use this file only as recovery evidence.',
    '2. Inspect the working tree and current tests before assuming completion.',
    '3. Revalidate open findings instead of trusting stale transcript state.',
    ''
  ];
  const temp = `${target}.tmp-${process.pid}`;
  fs.writeFileSync(temp, lines.join('\n'), { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temp, target);
  try { fs.chmodSync(target, 0o600); } catch { /* Windows/restricted FS */ }
  return target;
}

function crossedBand(snapshot, state, config) {
  if (!Number.isFinite(snapshot.usedRatio) || state.turns < Number(config.minTurns)) return null;
  let selected = null;
  for (const band of config.pressureBands) if (snapshot.usedRatio >= band) selected = band;
  if (selected === null || state.notifiedBands.includes(selected)) return null;
  return selected;
}

function advisoryOutput(snapshot, checkpoint, band, config) {
  const pct = `${(snapshot.usedRatio * 100).toFixed(1)}%`;
  const message = oneLine(
    `[session-economy] Context pressure crossed ${(band * 100).toFixed(0)}% (${pct}, ${snapshot.percentageSource}; window=${snapshot.contextWindowSource}). Mechanical checkpoint: ${checkpoint}. Update .claude/TASK-STATE.md, then prefer a clean task boundary (/clear or compact) before unrelated broad exploration.`,
    Number(config.systemMessageMaxChars)
  );
  if (!config.injectAdvisoryToClaude) return { systemMessage: message };
  return {
    systemMessage: message,
    hookSpecificOutput: {
      hookEventName: 'Stop',
      additionalContext: message
    }
  };
}

function prune(config) {
  const cutoff = Date.now() - Math.max(1, Number(config.retentionDays)) * 86_400_000;
  let removed = 0;
  for (const root of [config.stateDir, config.checkpointDir]) {
    if (!fs.existsSync(root)) continue;
    const stack = [root];
    while (stack.length) {
      const dir = stack.pop();
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) stack.push(full);
        else {
          try { if (fs.statSync(full).mtimeMs < cutoff) { fs.unlinkSync(full); removed += 1; } } catch { /* ignore */ }
        }
      }
    }
  }
  return removed;
}

function selfTest() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'session-economy-test-'));
  try {
    const transcript = path.join(root, 'session.jsonl');
    fs.writeFileSync(transcript, [
      JSON.stringify({ message: { role: 'user', content: 'Fix the API without exposing sk-ant-abcdefghijklmnopqrstuvwxyz123456' } }),
      JSON.stringify({ tool_name: 'Read', tool_input: { file_path: path.join(root, 'src', 'api.ts') } }),
      JSON.stringify({ message: { model: 'test-model', usage: { input_tokens: 10_000, cache_read_input_tokens: 135_000, cache_creation_input_tokens: 5_000 } } })
    ].join('\n'));
    const config = mergeObjects(DEFAULTS, {
      stateDir: path.join(root, 'state'),
      checkpointDir: path.join(root, 'checkpoints'),
      assumedContextWindowTokens: 200_000,
      minTurns: 1,
      pressureBands: [0.70, 0.80]
    });
    const input = { session_id: 'self-test', hook_event_name: 'Stop', cwd: root, transcript_path: transcript };
    const snapshot = pressureSnapshot(input, config);
    if (Math.abs(snapshot.usedRatio - 0.75) > 0.001) throw new Error(`Unexpected ratio ${snapshot.usedRatio}`);
    if (snapshot.lastUserText?.includes('sk-ant-')) throw new Error('Secret was not redacted');
    const checkpoint = writeCheckpoint(config, input, snapshot);
    if (!fs.existsSync(checkpoint)) throw new Error('Checkpoint not written');
    const state = loadState(config, input);
    state.turns = 1;
    const band = crossedBand(snapshot, state, config);
    if (band !== 0.70) throw new Error('Pressure band not detected');
    console.log('session-economy self-test: OK');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function status(config) {
  const stateFiles = fs.existsSync(config.stateDir) ? fs.readdirSync(config.stateDir).filter((name) => name.endsWith('.json')) : [];
  console.log(JSON.stringify({ schemaVersion: VERSION, configFile: config.configFile, stateDir: config.stateDir, checkpointDir: config.checkpointDir, sessions: stateFiles.length }, null, 2));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--self-test')) return selfTest();
  const config = loadConfig(process.cwd());
  if (args.includes('--status')) return status(config);
  if (args.includes('--prune')) return console.log(`Removed ${prune(config)} stale session-economy file(s).`);
  if (Math.random() < Number(config.pruneChance || 0)) prune(config);
  if (args[0] === '--report' && args[1]) {
    const input = { session_id: 'offline-report', cwd: process.cwd(), transcript_path: path.resolve(args[1]) };
    return console.log(JSON.stringify(pressureSnapshot(input, config), null, 2));
  }
  if (!config.enabled) return;
  const input = await readStdinJson();
  if (!input) return;
  const event = eventName(input);
  if (!['Stop', 'PreCompact', 'SessionEnd'].includes(event)) return;
  const state = loadState(config, input);
  if (event === 'Stop') state.turns += 1;
  const snapshot = pressureSnapshot(input, config);
  state.latest = snapshot;
  const shouldCheckpoint = (event === 'Stop' && config.checkpointOnStop) || (event === 'PreCompact' && config.checkpointOnPreCompact) || (event === 'SessionEnd' && config.checkpointOnSessionEnd);
  const checkpoint = shouldCheckpoint ? writeCheckpoint(config, input, snapshot) : state.checkpoint;
  state.checkpoint = checkpoint;
  let output = null;
  if (event === 'Stop') {
    const band = crossedBand(snapshot, state, config);
    if (band !== null) {
      state.notifiedBands.push(band);
      output = advisoryOutput(snapshot, checkpoint, band, config);
    }
  }
  saveState(config, input, state);
  if (output) process.stdout.write(JSON.stringify(output));
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) {
  main().catch((error) => {
    console.error(`[session-economy] fail-open: ${error instanceof Error ? error.message : String(error)}`);
  });
}
