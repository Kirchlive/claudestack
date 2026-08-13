/**
 * read-slice-guard.mjs
 *
 * Pure rule module for large Claude Code Read calls. The executable hook owner
 * is read-context-guard.mjs; keeping this rule internal avoids parallel
 * PreToolUse mutation races.
 */

import path from 'node:path';
import {
  fileLineCount,
  normalizePathKey,
  oneLine,
  statSnapshot
} from './lib/token-stack-shared.mjs';

export const READ_SLICE_DEFAULTS = Object.freeze({
  enabled: true,
  maxWholeFileLines: 1_200,
  maxWholeFileBytes: 131_072,
  maxProbeBytes: 4_194_304,
  denyOnceWindowSeconds: 180,
  maxReasonChars: 900,
  retrievalHint: 'Use Grep, Read with offset/limit, or the configured single retrieval owner.',
  exemptExtensions: [
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico', '.pdf',
    '.mp3', '.wav', '.m4a', '.ogg', '.mp4', '.mov', '.avi', '.zip',
    '.gz', '.xz', '.7z', '.tar', '.woff', '.woff2', '.ttf', '.otf'
  ],
  exemptPathPatterns: [],
  forceSlicePathPatterns: []
});

function compilePatterns(patterns = []) {
  return patterns.map((pattern) => {
    try { return new RegExp(pattern, 'i'); } catch { return null; }
  }).filter(Boolean);
}

function hasExplicitRange(toolInput) {
  const hasOffset = toolInput?.offset !== undefined && toolInput?.offset !== null;
  const hasLimit = toolInput?.limit !== undefined && toolInput?.limit !== null;
  return hasOffset || hasLimit;
}

function isExemptByExtension(filePath, config) {
  const ext = path.extname(filePath).toLowerCase();
  return (config.exemptExtensions || []).map((item) => String(item).toLowerCase()).includes(ext);
}

function decisionKey(filePath) {
  return `slice:${normalizePathKey(filePath)}`;
}

export function evaluateReadSlice(input, config, state, now = Date.now()) {
  const rule = { ...READ_SLICE_DEFAULTS, ...(config?.slice || config || {}) };
  if (!rule.enabled) return null;
  const toolInput = input?.tool_input || input?.toolInput || {};
  if (hasExplicitRange(toolInput)) return null;
  const rawPath = toolInput.file_path || toolInput.path;
  if (!rawPath) return null;
  const filePath = path.resolve(String(rawPath));
  const stat = statSnapshot(filePath);
  if (!stat || !Number.isFinite(stat.size)) return null;

  const normalized = filePath.replace(/\\/g, '/');
  const exemptPatterns = compilePatterns(rule.exemptPathPatterns);
  const forcePatterns = compilePatterns(rule.forceSlicePathPatterns);
  if (exemptPatterns.some((re) => re.test(normalized))) return null;
  const forced = forcePatterns.some((re) => re.test(normalized));
  if (!forced && isExemptByExtension(filePath, rule)) return null;

  const measured = fileLineCount(filePath, Number(rule.maxProbeBytes));
  const tooManyLines = Number.isFinite(measured.lines) && measured.lines > Number(rule.maxWholeFileLines);
  const tooManyBytes = stat.size > Number(rule.maxWholeFileBytes);
  if (!forced && !tooManyLines && !tooManyBytes) return null;

  state.sliceDeniedOnce ||= {};
  const key = decisionKey(filePath);
  const prior = Number(state.sliceDeniedOnce[key] || 0);
  const escapeMs = Math.max(1, Number(rule.denyOnceWindowSeconds)) * 1_000;
  if (prior && now - prior <= escapeMs) {
    delete state.sliceDeniedOnce[key];
    return { allowEscape: true, changedState: true, filePath, measured };
  }
  state.sliceDeniedOnce[key] = now;

  const sizeLabel = `${stat.size.toLocaleString('en-US')} B`;
  const lineLabel = Number.isFinite(measured.lines) ? `${measured.lines.toLocaleString('en-US')} lines` : 'line count not probed';
  const startLimit = Math.max(80, Math.min(400, Math.floor(Number(rule.maxWholeFileLines) / 4) || 250));
  const reason = oneLine(
    `[read-slice-guard] Whole-file Read denied once: ${path.basename(filePath)} is ${lineLabel}, ${sizeLabel}. Start with offset=1 and limit=${startLimit}, search for the relevant symbol/text, or use the configured single retrieval owner. Repeat this identical Read once within ${rule.denyOnceWindowSeconds}s only when every byte is genuinely required. ${rule.retrievalHint}`,
    Number(rule.maxReasonChars)
  );
  return {
    decision: 'deny',
    reason,
    filePath,
    measured,
    changedState: true,
    code: forced ? 'forced-slice' : 'oversized-whole-read'
  };
}
