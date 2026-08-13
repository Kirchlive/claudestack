import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

export const DEFAULT_CONFIG = Object.freeze({
  schemaVersion: 1,
  mode: 'shadow',
  bash: {
    enabled: true,
    minInputBytes: 4_096,
    targetOutputBytes: 6_000,
    minSavingsBytes: 512,
    minSavingsRatio: 0.15,
    headLines: 24,
    tailLines: 24,
  },
  read: {
    enabled: true,
    maxWholeFileBytes: 80_000,
    denyOnceSeconds: 180,
    hashMaxBytes: 2_000_000,
  },
  retention: { days: 7, maxArtifactBytes: 20_000_000 },
});

const MAX_STDIN_BYTES = 2_000_000;
const NATIVE_SPILL = /(?:characters?|tokens?)\s+truncated|output\s+truncated|full output saved to|tool-results\//i;
const EXACT_COMMAND = /(?:^|\s)(?:git\s+(?:diff|show|format-patch)|terraform\s+plan|kubectl\s+diff|semgrep|trivy|gitleaks|bandit|npm\s+audit|openssl|ssh-keygen|(?:prisma|alembic|rails)\s+migrat)/i;
const SALIENT = /\b(?:error|failed?|failure|warning|warn|passed|summary|total|panic|exception|traceback|fatal)\b/i;
const ANSI = /\x1B(?:[@-_][0-?]*[ -/]*[@-~]|\][^\x07]*(?:\x07|\x1B\\))/g;

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function clone(value) {
  return value == null ? value : structuredClone(value);
}

function mergeConfig(base, override = {}) {
  return {
    ...base,
    ...override,
    bash: { ...base.bash, ...(override.bash || {}) },
    read: { ...base.read, ...(override.read || {}) },
    retention: { ...base.retention, ...(override.retention || {}) },
  };
}

export function resolveConfigDir(env = process.env) {
  const configured = String(env.CLAUDE_CONFIG_DIR || '').trim();
  if (!configured) return path.join(os.homedir(), '.claude');
  if (configured === '~') return os.homedir();
  if (configured.startsWith(`~${path.sep}`) || configured.startsWith('~/')) {
    return path.resolve(os.homedir(), configured.slice(2));
  }
  return path.resolve(configured);
}

export function loadConfig({ cwd = process.cwd(), env = process.env } = {}) {
  const candidates = [
    env.CLAUDE_TOKEN_STACK_CONFIG,
    path.join(cwd, '.claude', 'token-stack.json'),
    path.join(resolveConfigDir(env), 'token-stack.json'),
  ].filter(Boolean);
  let config = mergeConfig(DEFAULT_CONFIG);
  for (const file of candidates.reverse()) {
    try {
      const value = JSON.parse(fs.readFileSync(file, 'utf8'));
      config = mergeConfig(config, value);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw new Error(`Invalid token-stack config ${file}: ${error.message}`);
    }
  }
  if (!['off', 'shadow', 'enforce'].includes(config.mode)) throw new Error(`Invalid mode: ${config.mode}`);
  return config;
}

function privateDir(directory) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fs.chmodSync(directory, 0o700);
}

function writePrivateJson(file, value) {
  privateDir(path.dirname(file));
  const temporary = `${file}.tmp-${process.pid}-${randomUUID()}`;
  const descriptor = fs.openSync(temporary, 'wx', 0o600);
  try {
    fs.writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
  fs.renameSync(temporary, file);
  fs.chmodSync(file, 0o600);
}

function stateRoot(options) {
  return path.resolve(options.stateDir || path.join(resolveConfigDir(options.env), 'token-stack', 'state'));
}

function sessionKey(input) {
  return sha256(String(input?.session_id || `ppid-${process.ppid}`)).slice(0, 24);
}

function sessionFile(input, options) {
  return path.join(stateRoot(options), 'sessions', `${sessionKey(input)}.json`);
}

function loadSession(input, options) {
  try {
    const value = JSON.parse(fs.readFileSync(sessionFile(input, options), 'utf8'));
    if (value?.schemaVersion !== 1) throw new Error('state schema mismatch');
    return {
      schemaVersion: 1,
      reads: value.reads || {},
      wholeReadDenials: value.wholeReadDenials || {},
      rereadDenials: value.rereadDenials || {},
    };
  } catch {
    return { schemaVersion: 1, reads: {}, wholeReadDenials: {}, rereadDenials: {} };
  }
}

function saveSession(input, options, state) {
  writePrivateJson(sessionFile(input, options), state);
}

function denyOnce(bucket, key, now, windowMs) {
  const prior = bucket[key];
  if (!prior || now - Number(prior.at || 0) > windowMs) {
    bucket[key] = { at: now, escaped: false };
    return true;
  }
  prior.escaped = true;
  return false;
}

function fileIdentity(file, hashMaxBytes) {
  const stat = fs.statSync(file);
  const identity = { size: stat.size, mtimeMs: Math.trunc(stat.mtimeMs) };
  if (stat.isFile() && stat.size <= hashMaxBytes) identity.sha256 = sha256(fs.readFileSync(file));
  return identity;
}

function sameIdentity(left, right) {
  if (!left || !right) return false;
  if (left.size !== right.size || left.mtimeMs !== right.mtimeMs) return false;
  return !left.sha256 || !right.sha256 || left.sha256 === right.sha256;
}

function readKey(input) {
  const value = input?.tool_input || {};
  return JSON.stringify([
    path.resolve(String(value.file_path || '')),
    value.offset ?? null,
    value.limit ?? null,
  ]);
}

function deny(reason) {
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  };
}

function handleRead(input, options, config) {
  const event = input?.hook_event_name;
  const file = String(input?.tool_input?.file_path || '');
  if (!file) return null;
  const state = loadSession(input, options);
  const key = readKey(input);
  const now = Number(options.now?.() ?? Date.now());
  const windowMs = Math.max(1, Number(config.read.denyOnceSeconds)) * 1_000;

  if (event === 'PostToolUse') {
    try {
      state.reads[key] = fileIdentity(file, Number(config.read.hashMaxBytes));
      saveSession(input, options, state);
    } catch { /* fail open */ }
    return null;
  }
  if (event !== 'PreToolUse') return null;

  try {
    const sliced = input.tool_input.offset != null || input.tool_input.limit != null;
    const identity = fileIdentity(file, Number(config.read.hashMaxBytes));
    if (!sliced && identity.size > Number(config.read.maxWholeFileBytes)) {
      if (denyOnce(state.wholeReadDenials, key, now, windowMs)) {
        saveSession(input, options, state);
        return deny(`Whole-file Read is ${identity.size} bytes. Retry with offset and limit, or repeat once to bypass this advisory.`);
      }
      saveSession(input, options, state);
      return null;
    }
    if (sameIdentity(state.reads[key], identity)) {
      if (denyOnce(state.rereadDenials, key, now, windowMs)) {
        saveSession(input, options, state);
        return deny('This exact Read target is unchanged and already present in the session. Reuse current context, request a different slice, or repeat once to bypass.');
      }
      saveSession(input, options, state);
    }
  } catch { /* fail open */ }
  return null;
}

function redact(text) {
  let value = String(text ?? '');
  value = value.replace(/sk-ant-[A-Za-z0-9_-]{16,}/g, '[REDACTED]');
  value = value.replace(/\bsk-[A-Za-z0-9_-]{20,}/g, '[REDACTED]');
  value = value.replace(/\b(A(?:PI)?[_-]?KEY|AUTH[_-]?TOKEN|ACCESS[_-]?TOKEN|SECRET|PASSWORD)\s*[:=]\s*([^\s"']+)/gi, '$1=[REDACTED]');
  return value;
}

function redactResponse(response) {
  const updated = clone(response);
  if (typeof updated?.stdout === 'string') updated.stdout = redact(updated.stdout);
  if (typeof updated?.stderr === 'string') updated.stderr = redact(updated.stderr);
  return updated;
}

function changedResponse(before, after) {
  return before?.stdout !== after?.stdout || before?.stderr !== after?.stderr;
}

function outputResult(response) {
  return {
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      updatedToolOutput: response,
    },
  };
}

function normalizeLines(text) {
  const lines = String(text).replace(ANSI, '').split('\n').map((line) => line.split('\r').at(-1));
  const output = [];
  for (let index = 0; index < lines.length;) {
    let end = index + 1;
    while (end < lines.length && lines[end] === lines[index]) end += 1;
    output.push(lines[index]);
    if (end - index > 2) output.push(`[... repeated ${end - index - 1} more times ...]`);
    index = end;
  }
  return output;
}

function reduceOutput(text, config) {
  const lines = normalizeLines(text);
  const head = Math.max(1, Number(config.headLines));
  const tail = Math.max(1, Number(config.tailLines));
  if (lines.length <= head + tail + 1) return lines.join('\n');

  const first = lines.slice(0, head);
  const last = lines.slice(-tail);
  const middle = lines.slice(head, -tail);
  const salient = middle.filter((line) => SALIENT.test(line)).slice(0, 24);
  let reduced = [
    ...first,
    `[... ${middle.length - salient.length} middle lines omitted; raw artifact retained ...]`,
    ...salient,
    ...last,
  ].join('\n');

  const target = Math.max(256, Number(config.targetOutputBytes));
  if (Buffer.byteLength(reduced) > target) {
    const half = Math.max(64, Math.floor(target / 2) - 60);
    reduced = `${reduced.slice(0, half)}\n[... byte target applied ...]\n${reduced.slice(-half)}`;
  }
  return reduced;
}

function artifactPath(id, options) {
  return path.join(stateRoot(options), 'artifacts', `${id}.json`);
}

function handleBash(input, options, config) {
  if (input?.hook_event_name !== 'PostToolUse') return null;
  const response = input?.tool_response;
  if (!response || typeof response !== 'object' || Array.isArray(response) || typeof response.stdout !== 'string') return null;

  const sanitized = redactResponse(response);
  const redactionChanged = changedResponse(response, sanitized);
  const command = String(input?.tool_input?.command || '');
  const stdout = sanitized.stdout;
  const mustPass =
    sanitized.isImage === true ||
    sanitized.interrupted === true ||
    Number(sanitized.exitCode || 0) !== 0 ||
    Boolean(String(sanitized.stderr || '')) ||
    NATIVE_SPILL.test(stdout) ||
    EXACT_COMMAND.test(command);
  if (mustPass || config.mode === 'off' || !config.bash.enabled) {
    return redactionChanged ? outputResult(sanitized) : null;
  }

  const rawBytes = Buffer.byteLength(stdout);
  if (rawBytes < Number(config.bash.minInputBytes)) return redactionChanged ? outputResult(sanitized) : null;
  if (config.mode !== 'enforce') return redactionChanged ? outputResult(sanitized) : null;

  const artifact = {
    schemaVersion: 1,
    createdAt: new Date(Number(options.now?.() ?? Date.now())).toISOString(),
    command,
    toolResponse: sanitized,
  };
  const serialized = JSON.stringify(artifact);
  if (Buffer.byteLength(serialized) > Number(config.retention.maxArtifactBytes)) {
    return redactionChanged ? outputResult(sanitized) : null;
  }

  const digest = sha256(serialized);
  const id = digest.slice(0, 24);
  const reduced = reduceOutput(stdout, config.bash);
  const footer = `\n[claude-token-stack raw:${id} sha256:${digest.slice(0, 16)} bytes:${rawBytes}; recover with: claudestack recover ${id}]`;
  const replacement = `${reduced}${footer}`;
  const replacementBytes = Buffer.byteLength(replacement);
  const savings = rawBytes - replacementBytes;
  const ratio = rawBytes ? savings / rawBytes : 0;
  if (savings < Number(config.bash.minSavingsBytes) || ratio < Number(config.bash.minSavingsRatio)) {
    return redactionChanged ? outputResult(sanitized) : null;
  }

  writePrivateJson(artifactPath(id, options), { id, sha256: digest, ...artifact });
  return outputResult({ ...sanitized, stdout: replacement });
}

export async function handleHook(input, options = {}) {
  try {
    if (!input || typeof input !== 'object') return null;
    const config = mergeConfig(DEFAULT_CONFIG, options.config || loadConfig(options));
    if (config.mode !== 'enforce') return null;
    const tool = String(input.tool_name || '');
    if (tool === 'Bash') return handleBash(input, options, config);
    if (tool === 'Read' && config.read.enabled) return handleRead(input, options, config);
    if (input.hook_event_name === 'PreCompact' || input.hook_event_name === 'SessionEnd') {
      try { fs.unlinkSync(sessionFile(input, options)); } catch { /* fail open */ }
    }
  } catch { /* fail open */ }
  return null;
}

export async function processHookInput(raw, options = {}) {
  try {
    if (Buffer.byteLength(String(raw)) > MAX_STDIN_BYTES) return '';
    const input = JSON.parse(String(raw));
    const result = await handleHook(input, options);
    return result ? JSON.stringify(result) : '';
  } catch {
    return '';
  }
}

export async function recoverArtifact(id, options = {}) {
  if (!/^[a-f0-9]{24}$/.test(String(id))) throw new Error('Invalid artifact id');
  const file = artifactPath(String(id), options);
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  const payload = {
    schemaVersion: value.schemaVersion,
    createdAt: value.createdAt,
    command: value.command,
    toolResponse: value.toolResponse,
  };
  const actual = sha256(JSON.stringify(payload));
  if (value.id !== String(id) || value.sha256 !== actual || String(id) !== actual.slice(0, 24)) {
    throw new Error('Artifact integrity check failed');
  }
  return value;
}

function hookCommands(settings, event) {
  const groups = settings?.hooks?.[event] || [];
  return groups.flatMap((group) => (group.hooks || []).map((hook) => ({
    event,
    matcher: String(group.matcher ?? ''),
    command: String(hook.command ?? ''),
  })));
}

function matchesBash(matcher) {
  return !matcher || matcher.split('|').map((value) => value.trim()).includes('Bash');
}

export function inspectSettings(settings = {}) {
  const findings = [];
  const pre = hookCommands(settings, 'PreToolUse').filter((item) => matchesBash(item.matcher));
  const post = hookCommands(settings, 'PostToolUse').filter((item) => matchesBash(item.matcher));
  const inputOwners = pre.filter((item) => /rtk-hook|squeez[/\\]hooks[/\\]pretooluse|(?:^|[/\\])omni\b|\btokf\b|token-saver|claudestack[.]mjs/i.test(item.command));
  const outputOwners = post.filter((item) => /squeez[/\\]hooks[/\\]posttooluse|(?:^|[/\\])omni\b|\btokf\b|token-saver|bash-dump-guard|claudestack[.]mjs/i.test(item.command));
  if (inputOwners.length > 1) findings.push({
    severity: 'error', code: 'MULTIPLE_BASH_INPUT_OWNERS',
    message: `${inputOwners.length} known Bash input mutators match in parallel.`,
    commands: inputOwners.map((item) => item.command),
  });
  if (outputOwners.length > 1) findings.push({
    severity: 'error', code: 'MULTIPLE_BASH_OUTPUT_OWNERS',
    message: `${outputOwners.length} known Bash output mutators match in parallel.`,
    commands: outputOwners.map((item) => item.command),
  });
  for (const item of [...pre, ...post, ...hookCommands(settings, 'SessionStart')]) {
    if (/\/(?:Users|home)\/|[A-Za-z]:\\/.test(item.command)) findings.push({
      severity: 'warning', code: 'ABSOLUTE_MACHINE_PATH', message: item.command,
    });
    if (/ladder-retrieve-(?:gate|filter)/.test(item.command)) findings.push({
      severity: 'warning', code: 'LEGACY_LADDER_HOOK', message: item.command,
    });
    if (/^["']?[/\\].*[.]mjs["']?$/.test(item.command.trim())) findings.push({
      severity: 'warning', code: 'DIRECT_SCRIPT_EXECUTION', message: `Use node explicitly: ${item.command}`,
    });
  }
  return {
    schemaVersion: 1,
    ok: !findings.some((finding) => finding.severity === 'error'),
    summary: { preToolBash: pre.length, postToolBash: post.length, findings: findings.length },
    owners: { bashInput: inputOwners, bashOutput: outputOwners },
    findings,
  };
}

export function renderSettingsFragment(packageRoot) {
  const command = `node "${path.resolve(packageRoot, 'hooks', 'claudestack.mjs')}"`;
  const hook = () => ({ type: 'command', command, timeout: 10 });
  return {
    hooks: {
      PreToolUse: [{ matcher: 'Read', hooks: [hook()] }],
      PostToolUse: [{ matcher: 'Bash|Read', hooks: [hook()] }],
      PreCompact: [{ hooks: [hook()] }],
      SessionEnd: [{ hooks: [hook()] }],
    },
  };
}

export function pruneArtifacts(options = {}) {
  const config = mergeConfig(DEFAULT_CONFIG, options.config || {});
  const directory = path.join(stateRoot(options), 'artifacts');
  const cutoff = Number(options.now?.() ?? Date.now()) - Number(config.retention.days) * 86_400_000;
  let removed = 0;
  try {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
      const file = path.join(directory, entry.name);
      try {
        if (fs.statSync(file).mtimeMs < cutoff) { fs.unlinkSync(file); removed += 1; }
      } catch { /* keep going */ }
    }
  } catch { /* empty store */ }
  return removed;
}
