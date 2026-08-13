#!/usr/bin/env node
/**
 * bash-dump-guard.mjs v3.1
 *
 * Capability-gated Claude Code Bash output reducer (PostToolUse).
 * Herkunft: GPT55SOL_PRO Guard-Suite v3, uebernommen in das
 * claude-token-stack-paket. Eigenbau-Bash-Owner (Kern-Stack, A/B gegen squeez).
 *
 * Changelog v3.1 (Paket-Uebernahme, Fixliste B1-B4):
 * - B1: Packaging (verify-package.sh/README-Name, Execute-Bits) in scripts/ repariert.
 * - B3: Secret-Redaction-Overlap behoben. Die generische named-secret-Regel lief
 *       nach den Muster-Regeln und erkannte deren Ersatztext erneut als Wert
 *       (z. B. `api_key=[REDACTED ANTHROPIC KEY]`). Jetzt: kontextuelle Regel
 *       zuerst, Ersatztexte per Lookahead ausgenommen, openai-key schliesst
 *       sk-ant- aus. Jede Fundstelle wird genau einmal redaktiert.
 * - B4: stdin-Groessenlimit (maxStdinBytes, Default 8 MiB). Uebergrosse
 *       Hook-Payloads werden fail-open durchgereicht statt unbegrenzt
 *       Speicher zu allozieren.
 *
 * Key properties:
 * - one owner for Bash output
 * - original command and native permission decision remain untouched
 * - live capability record required in hookActivation=auto mode
 * - fail open on every hook/runtime error
 * - exact-by-default for failures, patches, security, migrations, IaC and crypto
 * - no lossy replacement unless the exact original response is recoverable
 * - deterministic local processing, secret redaction and private metrics
 * - explicit stdin filter mode for hosts where hook replacement is unavailable
 *
 * Node.js >= 18, no third-party dependencies.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import zlib from 'node:zlib';

const SCHEMA_VERSION = 3;

const DEFAULTS = Object.freeze({
  enabled: true,

  // Hook activation: off | shadow | auto | replace.
  // auto is fail-closed for replacement: it requires a fresh live canary record
  // for the currently fingerprinted Claude executable. It still measures in shadow.
  hookActivation: 'auto',
  capabilityFile: '~/.claude/bash-dump-guard-capabilities.json',
  capabilityMaxAgeDays: 30,
  requireCapabilityFingerprint: true,

  minInputBytes: 4096,

  // Native Bash output alignment. Claude Code applies BASH_MAX_OUTPUT_LENGTH
  // before this PostToolUse hook. In aligned mode, the guard derives its own
  // budgets from that same limit instead of maintaining a second independent
  // ceiling. The environment value is interpreted as characters; ASCII-heavy
  // tool output is conservatively budgeted as UTF-8 bytes here.
  alignWithNativeBashLimit: true,
  nativeBashOutputLengthChars: 30_000,
  targetNativeLimitRatio: 0.72,
  hardNativeLimitRatio: 1.0,
  skipAlreadyNativeTruncated: true,
  nativeTruncationPatterns: [
    '\\.\\.\\. \\[\\d+ characters truncated\\] \\.\\.\\.',
    '\\boutput (?:was )?truncated\\b',
    '\\bfull output (?:was )?(?:saved|written) to\\b',
    '\\btool output exceeds\\b'
  ],

  // Used only when alignWithNativeBashLimit=false.
  hardOutputBytes: 98_304,
  targetOutputBytes: 24_576,
  minSavingsBytes: 512,
  minSavingsRatio: 0.15,
  headLines: 36,
  tailLines: 36,
  salientContextLines: 2,
  maxSalientBlocks: 48,
  maxMatchesPerFile: 8,
  maxSearchFiles: 40,
  structuredTables: false,
  stripAnsi: true,
  normalizeProgress: true,
  redactSecrets: true,

  // Lossy transforms require a raw archive unless explicitly overridden.
  storeRaw: true,
  storeSensitiveRaw: false,
  allowUnrecoverableCompression: false,
  rawStoreDir: '~/.claude/tool-output',
  rawRetentionDays: 7,
  maxRawBytes: 20_971_520,
  pruneChance: 0.01,

  metricsEnabled: true,
  metricsFile: '~/.claude/bash-dump-guard.metrics.jsonl',
  metricsMaxBytes: 10_485_760,
  metricsStoreCommand: false,
  footer: true,
  debug: false,

  // B4: hartes stdin-Groessenlimit. Hook-Payloads groesser als diese Schranke
  // werden nicht weiter verarbeitet (fail-open = Durchreichung ohne Ausgabe).
  maxStdinBytes: 8_388_608,

  // Any marker means: preserve exact output. Secret redaction may still apply.
  bypassMarkers: ['# token-raw', '# dump-raw', 'TOKEN_RAW=1', 'CLAUDE_TOKEN_RAW=1'],
  exactCommandPatterns: [
    '\\bgit\\s+(?:diff|show|format-patch|apply|am)\\b',
    '\\bgit\\s+status\\b[^\\n]*\\s(?:-z|--null)\\b',
    '\\b(?:terraform|tofu)\\s+(?:plan|apply|show|state|import)\\b',
    '\\bkubectl\\s+(?:apply|diff|patch|replace|delete)\\b',
    '\\bhelm\\s+(?:upgrade|install|diff|rollback|uninstall)\\b',
    '\\b(?:prisma\\s+migrate|alembic|flyway|liquibase|knex\\s+migrate|rails\\s+db:migrate)\\b',
    '\\b(?:semgrep|trivy|snyk|gitleaks|osv-scanner|npm\\s+audit|pnpm\\s+audit|yarn\\s+audit|cargo\\s+audit|pip-audit|bandit)\\b',
    '\\b(?:openssl|ssh-keygen|age|gpg)\\b'
  ]
});

const SALIENT_RE = /(?:^|\b)(?:fatal|panic|traceback|exception|error|failed|failure|assert(?:ion)?|expected|received|warning|warn|caused by|segmentation fault|out of memory|permission denied|not found|cannot|unable|invalid|timeout|timed out|test result|tests?:|passed|skipped|duration|finished|summary|total|exit code|exit status)(?:\b|:)/i;
const ERROR_RE = /(?:^|\b)(?:fatal|panic|traceback|exception|error|failed|failure|assert(?:ion)?|segmentation fault|permission denied|timed out)(?:\b|:)/i;
const SUMMARY_RE = /(?:test result:|tests?:|\b\d+\s+(?:passed|failed|skipped|warnings?)\b|finished in|duration|summary|total|exit (?:code|status)|build (?:succeeded|failed)|success(?:ful)?|completed)/i;

// B3 (v3.1): Reihenfolge ist Prioritaet. Die kontextuelle named-secret-Regel
// laeuft ZUERST: sie ersetzt `api_key=sk-ant-...` vollstaendig durch
// `api_key=[REDACTED]`, bevor eine Muster-Regel nur den Wert trifft und deren
// Ersatztext danach erneut als "Wert" erkannt wuerde
// (Defekt: `api_key=[REDACTED ANTHROPIC KEY]`).
// Zusaetzlich schliesst der Wert-Lookahead `[REDACTED`-Ersatztexte aus, und
// openai-key schliesst das anthropic-Präfix `sk-ant-` aus — jede Fundstelle
// wird genau einmal, von genau einer Regel redaktiert.
const SECRET_RULES = [
  {
    name: 'named-secret',
    re: /\b(api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|secret|password|passwd)\b\s*[:=]\s*(["']?)((?!\[REDACTED)[^\s"'`,;]{8,})\2/gi,
    replacement: '$1=[REDACTED]'
  },
  { name: 'private-key', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g, replacement: '[REDACTED PRIVATE KEY]' },
  { name: 'aws-key', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g, replacement: '[REDACTED AWS KEY]' },
  { name: 'github-token', re: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b/g, replacement: '[REDACTED GITHUB TOKEN]' },
  { name: 'anthropic-key', re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g, replacement: '[REDACTED ANTHROPIC KEY]' },
  { name: 'openai-key', re: /\bsk-(?!ant-)(?:proj-)?[A-Za-z0-9_-]{20,}\b/g, replacement: '[REDACTED API KEY]' },
  { name: 'slack-token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, replacement: '[REDACTED SLACK TOKEN]' },
  { name: 'jwt', re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{8,}\b/g, replacement: '[REDACTED JWT]' },
  { name: 'bearer', re: /\b(Bearer\s+)(?!\[REDACTED\])[A-Za-z0-9._~+\/-]{16,}/gi, replacement: '$1[REDACTED]' }
];

function debug(config, ...args) {
  if (config.debug || process.env.BASH_DUMP_GUARD_DEBUG === '1') {
    console.error('[bash-dump-guard]', ...args);
  }
}

function expandHome(value) {
  if (typeof value !== 'string') return value;
  if (value === '~') return os.homedir();
  if (value.startsWith('~/') || value.startsWith('~\\')) return path.join(os.homedir(), value.slice(2));
  return value;
}

function resolveConfiguredPath(value) {
  return path.resolve(expandHome(String(value)));
}

function readJsonFile(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function mergeConfig(base, override) {
  const out = { ...base };
  if (!override || typeof override !== 'object' || Array.isArray(override)) return out;
  for (const [key, value] of Object.entries(override)) if (value !== undefined) out[key] = value;
  return out;
}

function loadConfig() {
  const defaultPath = path.join(os.homedir(), '.claude', 'bash-dump-guard.config.json');
  const configPath = resolveConfiguredPath(process.env.BASH_DUMP_GUARD_CONFIG || defaultPath);
  const config = mergeConfig(DEFAULTS, readJsonFile(configPath));
  config.configPath = configPath;
  config.rawStoreDir = resolveConfiguredPath(process.env.BASH_DUMP_GUARD_STORE || config.rawStoreDir);
  config.capabilityFile = resolveConfiguredPath(process.env.BASH_DUMP_GUARD_CAPABILITY_FILE || config.capabilityFile);
  config.metricsFile = resolveConfiguredPath(process.env.BASH_DUMP_GUARD_METRICS_FILE || config.metricsFile);
  config.hookActivation = String(process.env.BASH_DUMP_GUARD_HOOK_ACTIVATION || config.hookActivation).toLowerCase();
  config.configuredTargetOutputBytes = Number(config.targetOutputBytes);
  config.configuredHardOutputBytes = Number(config.hardOutputBytes);
  const nativeRaw = Number(process.env.BASH_MAX_OUTPUT_LENGTH || config.nativeBashOutputLengthChars || 30_000);
  config.nativeBashOutputLengthChars = Number.isFinite(nativeRaw)
    ? Math.max(1_000, Math.min(150_000, Math.floor(nativeRaw)))
    : 30_000;
  if (config.alignWithNativeBashLimit) {
    config.targetOutputBytes = Math.max(2_048, Math.floor(config.nativeBashOutputLengthChars * Number(config.targetNativeLimitRatio || 0.72)));
    config.hardOutputBytes = Math.max(config.targetOutputBytes, Math.floor(config.nativeBashOutputLengthChars * Number(config.hardNativeLimitRatio || 1.0)));
  }
  config.exactCommandRegexes = (config.exactCommandPatterns || []).map((pattern) => {
    try { return new RegExp(pattern, 'i'); } catch { return null; }
  }).filter(Boolean);
  config.nativeTruncationRegexes = (config.nativeTruncationPatterns || []).map((pattern) => {
    try { return new RegExp(pattern, 'i'); } catch { return null; }
  }).filter(Boolean);
  return config;
}

function byteLength(text) {
  return Buffer.byteLength(String(text ?? ''), 'utf8');
}

function estimateTokens(text) {
  const s = String(text ?? '');
  if (!s) return 0;
  const bytes = byteLength(s);
  const lexical = (s.match(/[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu) || []).length;
  return Math.max(1, Math.ceil(Math.max(bytes / 4, lexical * 0.72)));
}

function stripAnsi(text) {
  return text
    .replace(/[\u001B\u009B][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]+)*)?\u0007)|(?:(?:\d{1,4}(?:[;:]\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g, '')
    .replace(/\u001B\][^\u0007]*(?:\u0007|\u001B\\)/g, '');
}

function normalizeProgress(text) {
  return text.split('\n').map((line) => {
    if (!line.includes('\r')) return line;
    const segments = line.split('\r').filter(Boolean);
    return segments.length ? segments.at(-1) : '';
  }).join('\n');
}

function normalizeForCompression(text, config) {
  let out = String(text ?? '').replace(/\r\n/g, '\n');
  if (config.normalizeProgress) out = normalizeProgress(out);
  if (config.stripAnsi) out = stripAnsi(out);
  return out
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001A\u001C-\u001F\u007F]/g, '')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trimEnd();
}

function redactSecrets(text, enabled) {
  if (!enabled) return { text: String(text ?? ''), found: [] };
  let out = String(text ?? '');
  const found = [];
  for (const rule of SECRET_RULES) {
    rule.re.lastIndex = 0;
    if (rule.re.test(out)) {
      found.push(rule.name);
      rule.re.lastIndex = 0;
      out = out.replace(rule.re, rule.replacement);
    }
  }
  return { text: out, found: [...new Set(found)] };
}

function isBypass(command, config) {
  if (process.env.BASH_DUMP_GUARD_MODE === 'raw') return true;
  return (config.bypassMarkers || []).some((marker) => command.includes(marker));
}

function isExactSensitive(command, config) {
  return config.exactCommandRegexes.some((re) => re.test(command));
}

function isAlreadyNativeTruncated(text, config) {
  if (!config.skipAlreadyNativeTruncated) return false;
  const value = String(text ?? '');
  return config.nativeTruncationRegexes.some((re) => {
    re.lastIndex = 0;
    return re.test(value);
  });
}

function classifyCommand(command) {
  const c = String(command).toLowerCase();
  if (/\b(pytest|jest|vitest|mocha|rspec|cargo\s+test|go\s+test|dotnet\s+test|mvn\w*\s+test|gradle\w*\s+test|npm\s+(?:run\s+)?test|pnpm\s+(?:run\s+)?test|yarn\s+(?:run\s+)?test)\b/.test(c)) return 'test';
  if (/\b(tsc|eslint|biome|ruff|mypy|pylint|cargo\s+(?:build|check|clippy|fmt)|go\s+(?:build|vet)|dotnet\s+build|mvn\w*\s+(?:package|verify|compile)|gradle\w*\s+(?:build|check)|npm\s+run\s+(?:build|lint)|pnpm\s+run\s+(?:build|lint)|yarn\s+(?:build|lint)|docker\s+build)\b/.test(c)) return 'build';
  if (/\bgit\s+status\b/.test(c)) return 'git-status';
  if (/\bgit\s+log\b/.test(c)) return 'git-log';
  if (/\bgit\s+(?:diff|show|format-patch)\b/.test(c)) return 'git-patch';
  if (/\b(rg|grep|git\s+grep|find|fd)\b/.test(c)) return 'search';
  if (/\b(ls|tree|dir)\b/.test(c)) return 'listing';
  if (/\b(npm|pnpm|yarn|pip|pipx|uv|poetry|cargo|apt|apt-get|brew|choco|winget)\s+(?:install|add|update|upgrade)\b/.test(c)) return 'install';
  if (/\b(docker|kubectl|helm)\s+(?:ps|images|get|list|logs)\b/.test(c)) return 'ops';
  return 'generic';
}

function collapseConsecutiveDuplicates(lines) {
  const out = [];
  let previous = null;
  let count = 0;
  const flush = () => {
    if (previous === null) return;
    out.push(previous);
    if (count > 1) out.push(`[previous line repeated ${count - 1} more time${count === 2 ? '' : 's'}]`);
  };
  for (const line of lines) {
    if (line === previous && line.trim()) count += 1;
    else {
      flush();
      previous = line;
      count = 1;
    }
  }
  flush();
  return out;
}

function selectWithContext(lines, predicate, context, maxBlocks) {
  const keep = new Set();
  let blocks = 0;
  for (let i = 0; i < lines.length && blocks < maxBlocks; i += 1) {
    if (!predicate(lines[i], i)) continue;
    blocks += 1;
    for (let j = Math.max(0, i - context); j <= Math.min(lines.length - 1, i + context); j += 1) keep.add(j);
  }
  return [...keep].sort((a, b) => a - b);
}

function renderSelected(lines, indices) {
  if (!indices.length) return '';
  const out = [];
  let previous = -2;
  for (const index of indices) {
    if (index > previous + 1) out.push(`[... ${index - previous - 1} line(s) elided ...]`);
    out.push(lines[index]);
    previous = index;
  }
  if (previous < lines.length - 1) out.push(`[... ${lines.length - previous - 1} line(s) elided ...]`);
  return out.join('\n');
}

function enforceBudget(text, config, { preserveSalient = true } = {}) {
  if (byteLength(text) <= config.targetOutputBytes) return text;
  const lines = text.split('\n');
  const keep = new Set();
  for (let i = 0; i < Math.min(config.headLines, lines.length); i += 1) keep.add(i);
  for (let i = Math.max(0, lines.length - config.tailLines); i < lines.length; i += 1) keep.add(i);
  if (preserveSalient) {
    for (const i of selectWithContext(lines, (line) => SALIENT_RE.test(line), config.salientContextLines, config.maxSalientBlocks)) keep.add(i);
  }
  let rendered = renderSelected(lines, [...keep].sort((a, b) => a - b));
  if (byteLength(rendered) <= config.targetOutputBytes) return rendered;
  const marker = '\n[... output budget reached; use the raw reference below ...]\n';
  const budget = Math.max(2048, config.targetOutputBytes - byteLength(marker));
  const buf = Buffer.from(rendered, 'utf8');
  const head = buf.subarray(0, Math.floor(budget * 0.62)).toString('utf8');
  const tail = buf.subarray(Math.max(0, buf.length - Math.floor(budget * 0.38))).toString('utf8');
  return `${head}${marker}${tail}`;
}

function compressTests(text, config) {
  const lines = collapseConsecutiveDuplicates(text.split('\n'));
  if (byteLength(lines.join('\n')) <= config.targetOutputBytes) return lines.join('\n');
  const keep = new Set([
    ...selectWithContext(lines, (line) => ERROR_RE.test(line), config.salientContextLines + 1, config.maxSalientBlocks),
    ...selectWithContext(lines, (line) => SUMMARY_RE.test(line), 1, config.maxSalientBlocks)
  ]);
  for (let i = 0; i < Math.min(12, lines.length); i += 1) keep.add(i);
  for (let i = Math.max(0, lines.length - 18); i < lines.length; i += 1) keep.add(i);
  return enforceBudget(renderSelected(lines, [...keep].sort((a, b) => a - b)), config);
}

function compressBuild(text, config) {
  const lines = collapseConsecutiveDuplicates(text.split('\n'));
  if (byteLength(lines.join('\n')) <= config.targetOutputBytes) return lines.join('\n');
  const keep = new Set(selectWithContext(lines, (line) => SALIENT_RE.test(line), config.salientContextLines, config.maxSalientBlocks));
  for (let i = 0; i < Math.min(16, lines.length); i += 1) keep.add(i);
  for (let i = Math.max(0, lines.length - 22); i < lines.length; i += 1) keep.add(i);
  return enforceBudget(renderSelected(lines, [...keep].sort((a, b) => a - b)), config);
}

function compressGitStatus(text, config) {
  // Preserve branch and section semantics. Remove only Git's instructional hints.
  const lines = text.split('\n');
  const out = [];
  let skippedHints = 0;
  for (const line of lines) {
    if (/^\s*\(use\s+"git\s+/i.test(line) || /^\s*\(use\s+-u\s+/i.test(line)) {
      skippedHints += 1;
      continue;
    }
    if (!line.trim() && (!out.length || !out.at(-1)?.trim())) continue;
    out.push(line);
  }
  if (skippedHints) out.push(`[${skippedHints} Git instructional hint line(s) omitted]`);
  const rendered = out.join('\n').trimEnd();
  return byteLength(rendered) > config.targetOutputBytes
    ? enforceBudget(rendered, config, { preserveSalient: false })
    : rendered;
}

function compressGitLog(text, config) {
  const lines = collapseConsecutiveDuplicates(text.split('\n'));
  if (lines.length <= 80) return lines.join('\n');
  return enforceBudget([...lines.slice(0, 60), `[... ${Math.max(0, lines.length - 70)} older log line(s) elided ...]`, ...lines.slice(-10)].join('\n'), config, { preserveSalient: false });
}

function searchFileKey(line) {
  const match = line.match(/^(.+?):(?:\d+|\d+:\d+):/);
  return match ? match[1] : null;
}

function compressSearch(text, config) {
  const lines = collapseConsecutiveDuplicates(text.split('\n'));
  const grouped = new Map();
  const ungrouped = [];
  for (const line of lines) {
    const key = searchFileKey(line);
    if (!key) ungrouped.push(line);
    else {
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(line);
    }
  }
  if (!grouped.size) return enforceBudget(lines.join('\n'), config);
  const out = [];
  let files = 0;
  let hiddenFiles = 0;
  for (const [file, matches] of grouped) {
    if (files >= config.maxSearchFiles) {
      hiddenFiles += 1;
      continue;
    }
    files += 1;
    out.push(`## ${file} (${matches.length} match${matches.length === 1 ? '' : 'es'})`);
    out.push(...matches.slice(0, config.maxMatchesPerFile));
    if (matches.length > config.maxMatchesPerFile) out.push(`[... ${matches.length - config.maxMatchesPerFile} match(es) elided for this file ...]`);
  }
  if (hiddenFiles) out.push(`[... ${hiddenFiles} additional matching file(s) elided ...]`);
  if (ungrouped.length) out.push('', '## Other output', ...ungrouped.slice(0, 30));
  return enforceBudget(out.join('\n'), config);
}

function compressListing(text, config) {
  const lines = collapseConsecutiveDuplicates(text.split('\n'));
  if (byteLength(lines.join('\n')) <= config.targetOutputBytes) return lines.join('\n');
  return enforceBudget(lines.join('\n'), config, { preserveSalient: false });
}

function encodeCell(value) {
  if (value === null) return 'null';
  if (value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value).replace(/\\/g, '\\\\').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

function maybeCompactJson(text, config) {
  const trimmed = text.trim();
  if (!trimmed || !/^[\[{]/.test(trimmed)) return null;
  try {
    const value = JSON.parse(trimmed);
    const minified = JSON.stringify(value);
    if (!config.structuredTables || !Array.isArray(value) || value.length < 3) return minified;
    const allObjects = value.every((row) => row && typeof row === 'object' && !Array.isArray(row));
    if (!allObjects) return minified;
    const keys = Object.keys(value[0]);
    if (!keys.length || !value.every((row) => {
      const rowKeys = Object.keys(row);
      return rowKeys.length === keys.length && keys.every((key) => Object.hasOwn(row, key));
    })) return minified;
    const table = [`@rows=${value.length}\tcolumns=${keys.map(encodeCell).join('\t')}`];
    for (const row of value) table.push(keys.map((key) => encodeCell(row[key])).join('\t'));
    const encoded = table.join('\n');
    return byteLength(encoded) < byteLength(minified) * 0.9 ? encoded : minified;
  } catch {
    return null;
  }
}

function compressGeneric(text, config) {
  return enforceBudget(collapseConsecutiveDuplicates(text.split('\n')).join('\n'), config);
}

function compressText(text, command, config, { exact = false } = {}) {
  const raw = String(text ?? '');

  // Exact mode is byte-preserving unless a deterministic secret rule fires.
  if (exact) {
    const redacted = redactSecrets(raw, config.redactSecrets);
    return {
      text: redacted.text,
      redactions: redacted.found,
      lossy: false,
      processor: redacted.found.length ? 'exact-redact' : 'exact-pass',
      normalized: false
    };
  }

  const normalized = normalizeForCompression(raw, config);
  const redacted = redactSecrets(normalized, config.redactSecrets);
  const base = redacted.text;
  if (!base) return { text: base, redactions: redacted.found, lossy: false, processor: 'clean', normalized: base !== raw };

  const json = maybeCompactJson(base, config);
  if (json && byteLength(json) < byteLength(base)) {
    return {
      text: json,
      redactions: redacted.found,
      lossy: false,
      processor: config.structuredTables && json.startsWith('@rows=') ? 'structured-table' : 'json-minify',
      normalized: base !== raw
    };
  }

  const family = classifyCommand(command);
  let output = base;
  let processor = family;
  switch (family) {
    case 'test': output = compressTests(base, config); break;
    case 'build':
    case 'install':
    case 'ops': output = compressBuild(base, config); break;
    case 'git-status': output = compressGitStatus(base, config); break;
    case 'git-log': output = compressGitLog(base, config); break;
    case 'git-patch': output = base; processor = 'exact-git-patch'; break;
    case 'search': output = compressSearch(base, config); break;
    case 'listing': output = compressListing(base, config); break;
    default: output = compressGeneric(base, config); break;
  }
  const lossyProcessors = new Set(['test', 'build', 'install', 'ops', 'git-status', 'git-log', 'search', 'listing', 'generic']);
  return {
    text: output,
    redactions: redacted.found,
    lossy: output !== base && lossyProcessors.has(processor),
    processor,
    normalized: base !== raw
  };
}

function safePart(value, fallback = 'unknown') {
  const cleaned = String(value ?? fallback).replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 120);
  return cleaned || fallback;
}

function ensurePrivateDir(dir) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  try { fs.chmodSync(dir, 0o700); } catch { /* Windows/restricted FS */ }
}

function stableJson(value) {
  return JSON.stringify(value);
}

function archiveRawResponse({ response, command, input, config, sensitive }) {
  if (!config.storeRaw) return { archive: null, reason: 'raw-storage-disabled' };
  if (sensitive && !config.storeSensitiveRaw) return { archive: null, reason: 'sensitive-raw-not-stored' };
  const payload = {
    schemaVersion: SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    sessionId: input.session_id || null,
    toolUseId: input.tool_use_id || null,
    cwd: input.cwd || null,
    command,
    toolResponse: response
  };
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  const bytes = byteLength(json);
  if (bytes > config.maxRawBytes) return { archive: null, reason: `raw-too-large:${bytes}` };

  const session = safePart(input.session_id || 'no-session');
  const material = `${input.tool_use_id || ''}\0${command}\0${json}`;
  const sha256 = crypto.createHash('sha256').update(json).digest('hex');
  const id = crypto.createHash('sha256').update(material).digest('hex').slice(0, 20);
  const dir = path.join(config.rawStoreDir, session);
  ensurePrivateDir(dir);
  const dataPath = path.join(dir, `${id}.json.gz`);
  const metaPath = path.join(dir, `${id}.meta.json`);
  const compressed = zlib.gzipSync(Buffer.from(json), { level: 9 });
  fs.writeFileSync(dataPath, compressed, { mode: 0o600, flag: 'w' });
  const metadata = {
    schemaVersion: SCHEMA_VERSION,
    id,
    ref: `${session}/${id}`,
    sha256,
    originalBytes: bytes,
    compressedBytes: compressed.length,
    createdAt: payload.createdAt,
    cwd: payload.cwd,
    commandSha256: crypto.createHash('sha256').update(command).digest('hex')
  };
  fs.writeFileSync(metaPath, `${JSON.stringify(metadata, null, 2)}\n`, { encoding: 'utf8', mode: 0o600, flag: 'w' });
  try { fs.chmodSync(dataPath, 0o600); fs.chmodSync(metaPath, 0o600); } catch { /* Windows */ }
  return { archive: { ...metadata, dataPath, metaPath }, reason: null };
}

function pruneArchives(config, days) {
  const cutoff = Date.now() - Number(days) * 86_400_000;
  if (!fs.existsSync(config.rawStoreDir)) return 0;
  let removed = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        try { if (fs.readdirSync(full).length === 0) fs.rmdirSync(full); } catch { /* ignore */ }
      } else {
        try {
          if (fs.statSync(full).mtimeMs < cutoff) { fs.unlinkSync(full); removed += 1; }
        } catch { /* ignore */ }
      }
    }
  };
  walk(config.rawStoreDir);
  return removed;
}

function maybePrune(config) {
  if (Math.random() < config.pruneChance) pruneArchives(config, config.rawRetentionDays);
}

function resolveArchiveDataPath(config, ref) {
  if (!ref || ref.includes('..') || path.isAbsolute(ref)) throw new Error('Archive reference must be session/id without ..');
  const normalized = ref.replace(/\\/g, '/').replace(/\.(?:json\.gz|meta\.json|log)$/, '');
  const parts = normalized.split('/').filter(Boolean).map((part) => safePart(part));
  if (parts.length === 2) {
    const candidate = path.join(config.rawStoreDir, parts[0], `${parts[1]}.json.gz`);
    if (fs.existsSync(candidate)) return candidate;
  }
  if (parts.length === 1 && fs.existsSync(config.rawStoreDir)) {
    const matches = [];
    for (const session of fs.readdirSync(config.rawStoreDir)) {
      const candidate = path.join(config.rawStoreDir, session, `${parts[0]}.json.gz`);
      if (fs.existsSync(candidate)) matches.push(candidate);
    }
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) throw new Error('Archive id is not unique; use session/id');
  }
  throw new Error('Archive not found; use session/id');
}

function readArchive(config, ref) {
  const file = resolveArchiveDataPath(config, ref);
  const json = zlib.gunzipSync(fs.readFileSync(file)).toString('utf8');
  return JSON.parse(json);
}

function renderArchive(payload) {
  const response = payload.toolResponse;
  const lines = [];
  lines.push(`# bash-dump-guard raw archive`, `createdAt: ${payload.createdAt}`, `command: ${payload.command}`, '');
  if (typeof response === 'string') lines.push(response);
  else if (response && typeof response === 'object') {
    let emitted = false;
    for (const key of ['stdout', 'stderr', 'output', 'content']) {
      if (typeof response[key] === 'string') {
        lines.push(`--- ${key} ---`, response[key]);
        emitted = true;
      }
    }
    if (!emitted) lines.push(JSON.stringify(response, null, 2));
  } else lines.push(String(response ?? ''));
  return `${lines.join('\n')}\n`;
}

function netGain(original, candidate, config) {
  const before = byteLength(original);
  const after = byteLength(candidate);
  const saved = before - after;
  const ratio = before > 0 ? saved / before : 0;
  return { before, after, saved, ratio, worthwhile: saved >= config.minSavingsBytes && ratio >= config.minSavingsRatio };
}

function footerFor({ beforeText, afterText, archive, archiveReason, processor, redactions, mode }) {
  const parts = [
    `[bash-dump-guard] ${beforeText ? beforeText.split('\n').length : 0} lines/${byteLength(beforeText)} B -> ${afterText ? afterText.split('\n').length : 0} lines/${byteLength(afterText)} B`,
    `processor=${processor}`,
    `mode=${mode}`
  ];
  if (archive) parts.push(`raw=${archive.ref}`, `sha256=${archive.sha256.slice(0, 16)}`);
  else if (archiveReason) parts.push(`raw=${archiveReason}`);
  if (redactions?.length) parts.push(`redacted=${[...new Set(redactions)].join(',')}`);
  return `\n\n${parts.join(' | ')}`;
}

function updateResponse(originalResponse, changes) {
  if (typeof originalResponse === 'string') return changes.output ?? originalResponse;
  if (!originalResponse || typeof originalResponse !== 'object') return originalResponse;
  const next = structuredClone(originalResponse);
  if (typeof next.stdout === 'string' && changes.stdout !== undefined) next.stdout = changes.stdout;
  if (typeof next.stderr === 'string' && changes.stderr !== undefined) next.stderr = changes.stderr;
  if (typeof next.output === 'string' && changes.output !== undefined) next.output = changes.output;
  if (typeof next.content === 'string' && changes.output !== undefined) next.content = changes.output;
  return next;
}

function outputFields(response) {
  if (typeof response === 'string') return [{ key: 'output', value: response }];
  if (!response || typeof response !== 'object') return [];
  const fields = [];
  for (const key of ['stdout', 'stderr']) if (typeof response[key] === 'string' && response[key]) fields.push({ key, value: response[key] });
  if (!fields.length) {
    for (const key of ['output', 'content']) if (typeof response[key] === 'string' && response[key]) fields.push({ key: 'output', value: response[key] });
  }
  return fields;
}

function extractExitCode(response) {
  if (!response || typeof response !== 'object') return null;
  for (const key of ['exitCode', 'exit_code', 'code', 'status']) {
    if (response[key] !== undefined && response[key] !== null && Number.isFinite(Number(response[key]))) return Number(response[key]);
  }
  return null;
}

function isInterrupted(response) {
  return Boolean(response && typeof response === 'object' && (response.interrupted || response.is_interrupt || response.isInterrupted));
}

function fingerprintMatches(capability) {
  const claude = capability?.claude;
  if (!claude?.realpath || claude.size === null || claude.mtimeMs === null) return false;
  try {
    const real = fs.realpathSync(claude.realpath);
    const stat = fs.statSync(real);
    return real === claude.realpath && stat.size === claude.size && Math.abs(stat.mtimeMs - claude.mtimeMs) <= 10;
  } catch {
    return false;
  }
}

function activationStatus(config) {
  const requested = config.hookActivation;
  if (!['off', 'shadow', 'auto', 'replace'].includes(requested)) {
    return { requested, effective: 'shadow', replacementAllowed: false, reason: 'invalid-hookActivation' };
  }
  if (requested === 'off') return { requested, effective: 'off', replacementAllowed: false, reason: 'disabled' };
  if (requested === 'shadow') return { requested, effective: 'shadow', replacementAllowed: false, reason: 'configured-shadow' };
  if (requested === 'replace') return { requested, effective: 'replace', replacementAllowed: true, reason: 'forced-replace' };

  const capability = readJsonFile(config.capabilityFile);
  if (!capability) return { requested, effective: 'shadow', replacementAllowed: false, reason: 'capability-record-missing' };
  const testedAt = Date.parse(capability.testedAt || '');
  if (!Number.isFinite(testedAt)) return { requested, effective: 'shadow', replacementAllowed: false, reason: 'capability-testedAt-invalid', capability };
  const ageDays = (Date.now() - testedAt) / 86_400_000;
  if (ageDays > config.capabilityMaxAgeDays) return { requested, effective: 'shadow', replacementAllowed: false, reason: `capability-stale:${ageDays.toFixed(1)}d`, capability };
  if (capability.capabilities?.postToolUseUpdatedToolOutput !== 'pass') {
    return { requested, effective: 'shadow', replacementAllowed: false, reason: `posttool-capability:${capability.capabilities?.postToolUseUpdatedToolOutput || 'unknown'}`, capability };
  }
  if (config.requireCapabilityFingerprint && !fingerprintMatches(capability)) {
    return { requested, effective: 'shadow', replacementAllowed: false, reason: 'claude-executable-fingerprint-mismatch', capability };
  }
  return { requested, effective: 'replace', replacementAllowed: true, reason: 'live-canary-pass', capability };
}

function appendMetric(config, event) {
  if (!config.metricsEnabled) return;
  try {
    ensurePrivateDir(path.dirname(config.metricsFile));
    if (fs.existsSync(config.metricsFile) && fs.statSync(config.metricsFile).size >= Number(config.metricsMaxBytes || 10_485_760)) {
      const backup = `${config.metricsFile}.1`;
      try { fs.unlinkSync(backup); } catch { /* absent */ }
      fs.renameSync(config.metricsFile, backup);
    }
    fs.appendFileSync(config.metricsFile, `${JSON.stringify(event)}\n`, { encoding: 'utf8', mode: 0o600 });
    try { fs.chmodSync(config.metricsFile, 0o600); } catch { /* Windows */ }
  } catch (error) {
    debug(config, 'metric write failed', error instanceof Error ? error.message : String(error));
  }
}

function processHook(input, config) {
  if (!config.enabled || input.tool_name !== 'Bash') return null;
  const activation = activationStatus(config);
  if (activation.effective === 'off') return null;

  const command = String(input.tool_input?.command || '');
  const response = input.tool_response;
  const fields = outputFields(response);
  if (!fields.length) return null;

  const exitCode = extractExitCode(response);
  const interrupted = isInterrupted(response);
  const stderr = response && typeof response === 'object' && typeof response.stderr === 'string' ? response.stderr : '';
  const failureLike = interrupted || (exitCode !== null && exitCode !== 0) || Boolean(stderr.trim());
  const bypass = isBypass(command, config);
  const nativeTruncated = fields.some(({ value }) => isAlreadyNativeTruncated(value, config));
  const exact = bypass || isExactSensitive(command, config) || failureLike || nativeTruncated;

  const rawStrings = fields.map(({ value }) => value).join('\n');
  const secretProbe = redactSecrets(rawStrings, true);
  const sensitive = secretProbe.found.length > 0;
  let archiveState = { archive: null, reason: null };
  const changes = {};
  const processors = [];
  const redactions = [];
  const streamMetrics = [];
  let anyCandidate = false;
  let anyLossyCandidate = false;

  for (const { key, value } of fields) {
    const result = compressText(value, command, config, { exact });
    processors.push(`${key}:${result.processor}`);
    redactions.push(...result.redactions);
    let candidate = result.text;
    const safetyReplacement = result.redactions.length > 0;
    const changed = candidate !== value;
    const largeEnough = byteLength(value) >= config.minInputBytes;
    const preliminary = netGain(value, candidate, config);
    const shouldConsider = safetyReplacement || (changed && (largeEnough || preliminary.worthwhile));
    if (!shouldConsider) continue;

    if (result.lossy) {
      anyLossyCandidate = true;
      if (!archiveState.archive && !archiveState.reason) {
        archiveState = archiveRawResponse({ response, command, input, config, sensitive });
      }
      if (!archiveState.archive && !config.allowUnrecoverableCompression) {
        // Keep only mandatory redaction. Do not silently drop information.
        const safeOnly = redactSecrets(value, config.redactSecrets);
        candidate = safeOnly.text;
        result.lossy = false;
        result.processor = safeOnly.found.length ? 'redact-only-no-archive' : 'pass-no-archive';
      }
    } else if (byteLength(value) > config.hardOutputBytes && !archiveState.archive && !archiveState.reason) {
      archiveState = archiveRawResponse({ response, command, input, config, sensitive });
    }

    const mode = activation.replacementAllowed ? 'replace' : 'shadow';
    if (config.footer && (candidate !== value) && (result.lossy || archiveState.archive || archiveState.reason || result.redactions.length)) {
      candidate += footerFor({
        beforeText: value,
        afterText: candidate,
        archive: archiveState.archive,
        archiveReason: archiveState.reason,
        processor: result.processor,
        redactions: result.redactions,
        mode
      });
    }

    const gain = netGain(value, candidate, config);
    if (!safetyReplacement && !exact && !gain.worthwhile) continue;
    if (exact && !safetyReplacement && candidate === value) continue;

    if (key === 'stdout') changes.stdout = candidate;
    else if (key === 'stderr') changes.stderr = candidate;
    else changes.output = candidate;
    anyCandidate = true;
    streamMetrics.push({ key, processor: result.processor, beforeBytes: gain.before, afterBytes: gain.after, savedBytes: gain.saved, savingsRatio: gain.ratio, redactions: result.redactions });
  }

  if (!anyCandidate) return null;
  const updated = updateResponse(response, changes);
  const totals = streamMetrics.reduce((acc, item) => {
    acc.beforeBytes += item.beforeBytes;
    acc.afterBytes += item.afterBytes;
    acc.savedBytes += item.savedBytes;
    return acc;
  }, { beforeBytes: 0, afterBytes: 0, savedBytes: 0 });

  const metric = {
    schemaVersion: SCHEMA_VERSION,
    at: new Date().toISOString(),
    sessionId: input.session_id || null,
    toolUseId: input.tool_use_id || null,
    commandSha256: crypto.createHash('sha256').update(command).digest('hex'),
    ...(config.metricsStoreCommand ? { command } : {}),
    family: classifyCommand(command),
    exact,
    bypass,
    failureLike,
    nativeTruncated,
    exitCode,
    interrupted,
    nativeBudget: {
      aligned: Boolean(config.alignWithNativeBashLimit),
      bashMaxOutputLengthChars: config.nativeBashOutputLengthChars,
      targetOutputBytes: config.targetOutputBytes,
      hardOutputBytes: config.hardOutputBytes
    },
    activation: { requested: activation.requested, effective: activation.effective, reason: activation.reason },
    candidateProduced: true,
    replacementEmitted: activation.replacementAllowed,
    lossyCandidate: anyLossyCandidate,
    archiveRef: archiveState.archive?.ref || null,
    archiveReason: archiveState.reason,
    redactions: [...new Set(redactions)],
    processors,
    streams: streamMetrics,
    ...totals,
    estimatedTokensSaved: Math.ceil(Math.max(0, totals.savedBytes) / 4)
  };
  appendMetric(config, metric);
  debug(config, metric);

  if (!activation.replacementAllowed) return null;
  return {
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      updatedToolOutput: updated
    }
  };
}

function processFilter(text, command, config, options = {}) {
  const failureLike = options.failure || (options.exitCode !== null && options.exitCode !== 0) || ERROR_RE.test(text.slice(0, 20_000));
  const nativeTruncated = isAlreadyNativeTruncated(text, config);
  const exact = options.exact || isBypass(command, config) || isExactSensitive(command, config) || failureLike || nativeTruncated;
  const result = compressText(text, command, config, { exact });
  let candidate = result.text;
  let archiveState = { archive: null, reason: null };
  if (result.lossy) {
    archiveState = archiveRawResponse({
      response: { stdout: text, stderr: '', interrupted: false, isImage: false, exitCode: options.exitCode },
      command,
      input: { session_id: options.session || 'manual-filter', tool_use_id: options.id || crypto.randomUUID(), cwd: process.cwd() },
      config,
      sensitive: redactSecrets(text, true).found.length > 0
    });
    if (!archiveState.archive && !config.allowUnrecoverableCompression) {
      const safeOnly = redactSecrets(text, config.redactSecrets);
      candidate = safeOnly.text;
      result.processor = safeOnly.found.length ? 'redact-only-no-archive' : 'pass-no-archive';
      result.lossy = false;
    }
  }
  if (config.footer && candidate !== text && (result.lossy || archiveState.archive || archiveState.reason || result.redactions.length)) {
    candidate += footerFor({ beforeText: text, afterText: candidate, archive: archiveState.archive, archiveReason: archiveState.reason, processor: result.processor, redactions: result.redactions, mode: 'explicit-filter' });
  }
  const gain = netGain(text, candidate, config);
  if (result.redactions.length || exact || gain.worthwhile) return candidate;
  return text;
}

function selfTest() {
  const base = loadConfig();
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'bdg-self-test-'));
  const config = mergeConfig(base, {
    hookActivation: 'replace',
    minInputBytes: 100,
    alignWithNativeBashLimit: false,
    targetOutputBytes: 1800,
    minSavingsBytes: 40,
    minSavingsRatio: 0.05,
    footer: false,
    storeRaw: true,
    rawStoreDir: path.join(temp, 'raw'),
    metricsFile: path.join(temp, 'metrics.jsonl'),
    pruneChance: 0
  });
  config.exactCommandRegexes = (config.exactCommandPatterns || []).map((p) => new RegExp(p, 'i'));
  try {
    const noisy = Array.from({ length: 180 }, (_, i) => i % 3 === 0 ? `test item_${i} ... ok` : `progress ${i}`).join('\n') + '\nTests: 60 passed, 0 failed';
    const output = processHook({
      session_id: 'self-test', tool_use_id: 'tool-1', tool_name: 'Bash',
      tool_input: { command: 'pytest -v' },
      tool_response: { stdout: noisy, stderr: '', interrupted: false, isImage: false, exitCode: 0 }
    }, config);
    if (!output?.hookSpecificOutput?.updatedToolOutput?.stdout) throw new Error('Compression output missing');
    if (byteLength(output.hookSpecificOutput.updatedToolOutput.stdout) >= byteLength(noisy)) throw new Error('Self-test did not reduce output');

    const secretInput = 'Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456';
    const secretOutput = processHook({
      session_id: 'self-test', tool_use_id: 'tool-2', tool_name: 'Bash',
      tool_input: { command: 'curl -v https://example.test' },
      tool_response: { stdout: secretInput, stderr: '', interrupted: false, isImage: false, exitCode: 0 }
    }, config);
    if (!secretOutput?.hookSpecificOutput?.updatedToolOutput?.stdout.includes('[REDACTED]')) throw new Error('Secret redaction failed');

    const exactInput = 'line one\r\n+ patch line with spaces   \r\n';
    const exactOutput = processHook({
      session_id: 'self-test', tool_use_id: 'tool-3', tool_name: 'Bash',
      tool_input: { command: 'git diff --patch' },
      tool_response: { stdout: exactInput, stderr: '', interrupted: false, isImage: false, exitCode: 0 }
    }, config);
    if (exactOutput !== null) throw new Error('Exact patch should be byte-identical pass-through');

    const failureText = Array.from({ length: 250 }, (_, i) => `diagnostic ${i}`).join('\n');
    const failureOutput = processHook({
      session_id: 'self-test', tool_use_id: 'tool-4', tool_name: 'Bash',
      tool_input: { command: 'npm test' },
      tool_response: { stdout: failureText, stderr: 'Error: test failed\n', interrupted: false, isImage: false, exitCode: 1 }
    }, config);
    if (failureOutput !== null) throw new Error('Failure-like output should pass through exactly when no redaction is needed');

    const nativeText = `prefix\n... [12000 characters truncated] ...\nFull output saved to /tmp/native.log`;
    const nativeOutput = processHook({
      session_id: 'self-test', tool_use_id: 'tool-5', tool_name: 'Bash',
      tool_input: { command: 'unknown-command' },
      tool_response: { stdout: nativeText, stderr: '', interrupted: false, isImage: false, exitCode: 0 }
    }, config);
    if (nativeOutput !== null) throw new Error('Already native-truncated output should pass through exactly');

    const archiveFiles = fs.readdirSync(path.join(temp, 'raw', 'self-test')).filter((name) => name.endsWith('.json.gz'));
    if (!archiveFiles.length) throw new Error('Lossy output did not create a raw archive');
    const firstRef = `self-test/${archiveFiles[0].replace(/\.json\.gz$/, '')}`;
    const archived = readArchive(config, firstRef);
    if (!archived.toolResponse?.stdout?.includes('test item_0')) throw new Error('Raw archive is not recoverable');

    console.log('bash-dump-guard v3.1 self-test: OK');
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

// B4 (v3.1): stdin mit hartem Groessenlimit lesen. Ueber dem Limit wird der
// Rest des Stroms verworfen und `truncated` gemeldet; der Aufrufer reicht dann
// fail-open unveraendert durch, statt unbegrenzt Speicher zu allozieren.
async function readStdin(maxBytes = Number.POSITIVE_INFINITY) {
  let data = '';
  let bytes = 0;
  let truncated = false;
  for await (const chunk of process.stdin) {
    if (truncated) continue; // Rest verwerfen, Strom aber zuende lesen
    const text = String(chunk);
    bytes += Buffer.byteLength(text, 'utf8');
    if (bytes > maxBytes) {
      truncated = true;
      data = '';
      continue;
    }
    data += text;
  }
  return { text: data, truncated };
}

function parseCli(argv) {
  const out = { command: null, args: [], filterCommand: '', exitCode: null, exact: false, failure: false, session: 'manual-filter' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!out.command && arg.startsWith('--')) out.command = arg;
    else if (arg === '--command') out.filterCommand = argv[++i] || '';
    else if (arg === '--exit-code') out.exitCode = Number(argv[++i]);
    else if (arg === '--exact') out.exact = true;
    else if (arg === '--failure') out.failure = true;
    else if (arg === '--session') out.session = argv[++i] || 'manual-filter';
    else out.args.push(arg);
  }
  return out;
}

function printStatus(config) {
  const activation = activationStatus(config);
  const status = {
    schemaVersion: SCHEMA_VERSION,
    configPath: config.configPath,
    enabled: config.enabled,
    activation: {
      requested: activation.requested,
      effective: activation.effective,
      replacementAllowed: activation.replacementAllowed,
      reason: activation.reason
    },
    capabilityFile: config.capabilityFile,
    capability: activation.capability || readJsonFile(config.capabilityFile),
    nativeBudget: {
      aligned: Boolean(config.alignWithNativeBashLimit),
      bashMaxOutputLengthChars: config.nativeBashOutputLengthChars,
      targetOutputBytes: config.targetOutputBytes,
      hardOutputBytes: config.hardOutputBytes,
      configuredTargetOutputBytes: config.configuredTargetOutputBytes,
      configuredHardOutputBytes: config.configuredHardOutputBytes
    },
    rawStoreDir: config.rawStoreDir,
    metricsFile: config.metricsFile
  };
  console.log(JSON.stringify(status, null, 2));
}

async function main() {
  const config = loadConfig();
  const cli = parseCli(process.argv.slice(2));

  if (cli.command === '--self-test') return selfTest();
  if (cli.command === '--status') return printStatus(config);
  if (cli.command === '--prune') {
    const days = Number(cli.args[0] || config.rawRetentionDays);
    console.log(`Removed ${pruneArchives(config, days)} archived file(s).`);
    return;
  }
  if (cli.command === '--show' || cli.command === '--show-json') {
    const payload = readArchive(config, cli.args[0]);
    process.stdout.write(cli.command === '--show-json' ? `${JSON.stringify(payload, null, 2)}\n` : renderArchive(payload));
    return;
  }
  if (cli.command === '--filter') {
    const stdin = await readStdin(Number(config.maxStdinBytes) || 8_388_608);
    if (stdin.truncated) {
      console.error(`[bash-dump-guard] fail-open: stdin exceeds maxStdinBytes (${config.maxStdinBytes}); passing nothing through the filter`);
      return;
    }
    process.stdout.write(processFilter(stdin.text, cli.filterCommand, config, cli));
    return;
  }
  if (cli.command === '--help' || cli.command === '-h') {
    console.log(`bash-dump-guard v3.1\n\nHook mode:\n  node bash-dump-guard.mjs < hook-payload.json\n\nCommands:\n  --status\n  --self-test\n  --show SESSION/ID\n  --show-json SESSION/ID\n  --prune [DAYS]\n  --filter [--command CMD] [--exit-code N] [--failure] [--exact] < output.txt\n\nIn hookActivation=auto, replacement is emitted only after the live capability canary passes for the current Claude executable fingerprint.\n`);
    return;
  }

  try {
    maybePrune(config);
    const stdin = await readStdin(Number(config.maxStdinBytes) || 8_388_608);
    if (stdin.truncated) {
      // B4 fail-open: leere stdout + exit 0 = keine Modifikation, Payload
      // geht unveraendert durch.
      console.error(`[bash-dump-guard] fail-open: stdin exceeds maxStdinBytes (${config.maxStdinBytes}); passing through unmodified`);
      return;
    }
    const raw = stdin.text;
    if (!raw.trim()) return;
    const input = JSON.parse(raw);
    const output = processHook(input, config);
    if (output) process.stdout.write(JSON.stringify(output));
  } catch (error) {
    // Fail open: empty stdout + exit 0 means no modification.
    console.error(`[bash-dump-guard] fail-open: ${error instanceof Error ? error.message : String(error)}`);
  }
}

await main();
