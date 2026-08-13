import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function expandHome(value) {
  if (typeof value !== 'string') return value;
  if (value === '~') return os.homedir();
  if (value.startsWith('~/') || value.startsWith('~\\')) return path.join(os.homedir(), value.slice(2));
  return value;
}

export function resolveConfiguredPath(value, cwd = process.cwd()) {
  const expanded = expandHome(String(value ?? ''));
  return path.isAbsolute(expanded) ? path.normalize(expanded) : path.resolve(cwd, expanded);
}

export function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

export function mergeObjects(...values) {
  const out = {};
  for (const value of values) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    for (const [key, item] of Object.entries(value)) {
      if (item && typeof item === 'object' && !Array.isArray(item) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
        out[key] = mergeObjects(out[key], item);
      } else {
        out[key] = item;
      }
    }
  }
  return out;
}

export function ensurePrivateDir(dir) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  try { fs.chmodSync(dir, 0o700); } catch { /* Windows/restricted FS */ }
}

export function writePrivateJson(filePath, value) {
  const target = resolveConfiguredPath(filePath);
  ensurePrivateDir(path.dirname(target));
  const temp = `${target}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temp, target);
  try { fs.chmodSync(target, 0o600); } catch { /* Windows/restricted FS */ }
  return target;
}

export function appendPrivateJsonl(filePath, value) {
  const target = resolveConfiguredPath(filePath);
  ensurePrivateDir(path.dirname(target));
  fs.appendFileSync(target, `${JSON.stringify(value)}\n`, { encoding: 'utf8', mode: 0o600 });
  try { fs.chmodSync(target, 0o600); } catch { /* Windows/restricted FS */ }
  return target;
}

export function sha256(value) {
  return crypto.createHash('sha256').update(String(value ?? '')).digest('hex');
}

export function safePart(value, fallback = 'unknown', max = 120) {
  const cleaned = String(value ?? fallback).replace(/[^A-Za-z0-9._-]/g, '_').slice(0, max);
  return cleaned || fallback;
}

export function approxTokensFromChars(chars) {
  const n = typeof chars === 'number' ? chars : String(chars ?? '').length;
  return Math.max(0, Math.ceil(n / 4));
}

// Hartes stdin-Groessenlimit fuer alle Hooks dieser Suite (Fix B4 der
// Paket-Uebernahme): uebergrosse Hook-Payloads werden nicht weiter verarbeitet.
// readStdinJson meldet dann null — die Hooks interpretieren das als
// "keine Eingabe" und reichen fail-open unveraendert durch, statt unbegrenzt
// Speicher zu allozieren.
export const STDIN_MAX_BYTES = 8_388_608; // 8 MiB

export async function readStdinText(maxBytes = STDIN_MAX_BYTES) {
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
  return data;
}

export async function readStdinJson(maxBytes = STDIN_MAX_BYTES) {
  const raw = await readStdinText(maxBytes);
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

export function eventName(input) {
  return String(input?.hook_event_name || input?.hookEventName || '');
}

export function toolName(input) {
  return String(input?.tool_name || input?.toolName || '');
}

export function cwdFrom(input) {
  return path.resolve(String(input?.cwd || process.cwd()));
}

export function sessionIdFrom(input) {
  return safePart(input?.session_id || input?.sessionId || 'no-session');
}

export function parseFrontmatter(text) {
  const source = String(text ?? '');
  if (!source.startsWith('---')) return { data: {}, body: source };
  const end = source.indexOf('\n---', 3);
  if (end < 0) return { data: {}, body: source };
  const raw = source.slice(3, end).replace(/^\r?\n/, '');
  const data = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    data[match[1]] = value;
  }
  const bodyStart = source.indexOf('\n', end + 4);
  return { data, body: bodyStart >= 0 ? source.slice(bodyStart + 1) : '' };
}

export function walkFiles(root, options = {}) {
  const {
    match = () => true,
    maxFiles = 10_000,
    maxDepth = 12,
    skipDirs = new Set(['.git', 'node_modules', '.next', 'dist', 'build', 'target', '.venv', 'venv', '__pycache__'])
  } = options;
  const out = [];
  const start = resolveConfiguredPath(root);
  if (!fs.existsSync(start)) return out;
  const stack = [{ dir: start, depth: 0 }];
  while (stack.length && out.length < maxFiles) {
    const { dir, depth } = stack.pop();
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (depth < maxDepth && !skipDirs.has(entry.name)) stack.push({ dir: full, depth: depth + 1 });
      } else if (entry.isFile() && match(full, entry.name)) {
        out.push(full);
        if (out.length >= maxFiles) break;
      }
    }
  }
  return out;
}

export function statSnapshot(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return { size: stat.size, mtimeMs: stat.mtimeMs, mode: stat.mode };
  } catch {
    return null;
  }
}

export function normalizePathKey(filePath) {
  let resolved = path.resolve(filePath);
  try { resolved = fs.realpathSync(resolved); } catch { /* absent or restricted */ }
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

export function fileLineCount(filePath, maxBytes = 4 * 1024 * 1024) {
  const stat = statSnapshot(filePath);
  if (!stat || stat.size > maxBytes) return { lines: null, bytes: stat?.size ?? null, limited: Boolean(stat) };
  try {
    const buf = fs.readFileSync(filePath);
    let lines = buf.length ? 1 : 0;
    for (const byte of buf) if (byte === 10) lines += 1;
    return { lines, bytes: buf.length, limited: false };
  } catch {
    return { lines: null, bytes: stat.size, limited: false };
  }
}

export function findRepoRoot(startDir) {
  let current = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(current, '.git'))) return current;
    const parent = path.dirname(current);
    if (parent === current) return path.resolve(startDir);
    current = parent;
  }
}

export function oneLine(text, max = 900) {
  const compact = String(text ?? '').replace(/\s+/g, ' ').trim();
  return compact.length <= max ? compact : `${compact.slice(0, Math.max(0, max - 1))}…`;
}

export function removeOldFiles(root, cutoffMs) {
  if (!fs.existsSync(root)) return 0;
  let removed = 0;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else {
        try {
          if (fs.statSync(full).mtimeMs < cutoffMs) { fs.unlinkSync(full); removed += 1; }
        } catch { /* ignore */ }
      }
    }
  }
  return removed;
}
