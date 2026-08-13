/**
 * reread-guard.mjs
 *
 * Pure same-session Read dedup rule. The executable hook owner is
 * read-context-guard.mjs. A repeat is suppressed only when the exact range and
 * a content digest still match. Large files that cannot be hashed are not
 * suppressed by default.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  normalizePathKey,
  oneLine,
  statSnapshot
} from './lib/token-stack-shared.mjs';

export const REREAD_DEFAULTS = Object.freeze({
  enabled: true,
  windowSeconds: 1_200,
  denyOnceWindowSeconds: 180,
  hashMaxBytes: 4_194_304,
  trustStatForLargeFiles: false,
  maxReasonChars: 900
});

function rangeFrom(toolInput = {}) {
  const offset = toolInput.offset === undefined || toolInput.offset === null ? null : Number(toolInput.offset);
  const limit = toolInput.limit === undefined || toolInput.limit === null ? null : Number(toolInput.limit);
  return {
    offset: Number.isFinite(offset) ? offset : null,
    limit: Number.isFinite(limit) ? limit : null
  };
}

function entryKey(filePath, range) {
  return `${normalizePathKey(filePath)}|${range.offset ?? '*'}|${range.limit ?? '*'}`;
}

function fileDigest(filePath, maxBytes) {
  const stat = statSnapshot(filePath);
  if (!stat || stat.size > maxBytes) return null;
  try {
    const hash = crypto.createHash('sha256');
    hash.update(fs.readFileSync(filePath));
    return hash.digest('hex');
  } catch {
    return null;
  }
}

function unchanged(entry, filePath, rule) {
  const stat = statSnapshot(filePath);
  if (!stat) return false;
  if (stat.size !== entry.size || stat.mtimeMs !== entry.mtimeMs) return false;
  if (entry.digest) return fileDigest(filePath, Number(rule.hashMaxBytes)) === entry.digest;
  return Boolean(rule.trustStatForLargeFiles);
}

export function evaluateReread(input, config, state, now = Date.now()) {
  const rule = { ...REREAD_DEFAULTS, ...(config?.reread || config || {}) };
  if (!rule.enabled) return null;
  const toolInput = input?.tool_input || input?.toolInput || {};
  const rawPath = toolInput.file_path || toolInput.path;
  if (!rawPath) return null;
  const filePath = path.resolve(String(rawPath));
  const range = rangeFrom(toolInput);
  const key = entryKey(filePath, range);
  const entry = state.reads?.[key];
  if (!entry) return null;
  const maxAgeMs = Math.max(1, Number(rule.windowSeconds)) * 1_000;
  if (now - Number(entry.at || 0) > maxAgeMs || !unchanged(entry, filePath, rule)) {
    delete state.reads[key];
    return { changedState: true, stale: true };
  }

  state.rereadDeniedOnce ||= {};
  const prior = Number(state.rereadDeniedOnce[key] || 0);
  const escapeMs = Math.max(1, Number(rule.denyOnceWindowSeconds)) * 1_000;
  if (prior && now - prior <= escapeMs) {
    delete state.rereadDeniedOnce[key];
    return { allowEscape: true, changedState: true, filePath, range };
  }
  state.rereadDeniedOnce[key] = now;
  const ageSeconds = Math.max(0, Math.round((now - Number(entry.at || now)) / 1_000));
  const rangeLabel = range.offset === null && range.limit === null
    ? 'the whole file'
    : `offset=${range.offset ?? 1}, limit=${range.limit ?? 'default'}`;
  return {
    decision: 'deny',
    code: 'unchanged-reread',
    filePath,
    range,
    changedState: true,
    reason: oneLine(
      `[reread-guard] Unchanged repeat Read denied once: ${path.basename(filePath)} (${rangeLabel}) was already returned ${ageSeconds}s ago and its digest still matches. Use the existing context, request a different slice, or repeat this identical Read once within ${rule.denyOnceWindowSeconds}s to bypass.` ,
      Number(rule.maxReasonChars)
    )
  };
}

export function recordSuccessfulRead(input, config, state, now = Date.now()) {
  const rule = { ...REREAD_DEFAULTS, ...(config?.reread || config || {}) };
  if (!rule.enabled) return false;
  const toolInput = input?.tool_input || input?.toolInput || {};
  const rawPath = toolInput.file_path || toolInput.path;
  if (!rawPath) return false;
  const filePath = path.resolve(String(rawPath));
  const stat = statSnapshot(filePath);
  if (!stat) return false;
  const range = rangeFrom(toolInput);
  const key = entryKey(filePath, range);
  const digest = fileDigest(filePath, Number(rule.hashMaxBytes));
  if (!digest && !rule.trustStatForLargeFiles) return false;
  state.reads ||= {};
  state.reads[key] = {
    at: now,
    filePath: normalizePathKey(filePath),
    offset: range.offset,
    limit: range.limit,
    size: stat.size,
    mtimeMs: stat.mtimeMs,
    digest
  };
  delete state.rereadDeniedOnce?.[key];
  return true;
}
