/**
 * nudge-budget.mjs — gemeinsames Nudge-Budget der optionalen Hooks.
 *
 * Ausgangslage (AP-4.5): jeder nudgende Hook fuehrte seinen eigenen Zaehler —
 * session-economy ueber `notifiedBands` in seinem State-JSON, bash-size-feedback
 * ueber `/tmp/ctx-size-hint-<sid>`. Beide Deckel galten nur fuer sich, in Summe
 * konnte eine Sitzung also das Mehrfache der beabsichtigten Hinweise sehen.
 * Dieses Modul haelt EINE Budgetdatei je Sitzung, gegen die alle Hooks buchen.
 *
 * Vertrag:
 *   - `tryConsumeNudge(sessionId, source)` bucht genau einen Hinweis und meldet,
 *     ob er ausgegeben werden darf. Nur der Aufrufer, der `granted: true`
 *     erhaelt, gibt etwas aus.
 *   - Der Zugriff ist ueber ein Lock-Verzeichnis serialisiert; parallele Hooks
 *     koennen das Budget nicht doppelt ausgeben.
 *   - Ist das Budget nicht benutzbar (defektes Verzeichnis, Lock blockiert),
 *     wird KEIN Nudge gewaehrt und der Grund nach stderr gemeldet (L-6:
 *     fail-loud statt stiller Freigabe). Der Hook selbst bleibt fail-open —
 *     er reicht den Tool-Call unveraendert durch und mutiert nichts.
 *
 * Pfade folgen `CLAUDE_CONFIG_DIR` (Vorgabe `~/.claude`), damit alle optionalen
 * Hooks dieselbe Wurzel benutzen. Ueberschreibbar per NUDGE_BUDGET_DIR /
 * NUDGE_BUDGET_MAX.
 *
 * Node.js >= 18, keine Fremdabhaengigkeiten.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { ensurePrivateDir, readJson, resolveConfiguredPath, safePart } from './token-stack-shared.mjs';

export const NUDGE_SCHEMA_VERSION = 1;

export const NUDGE_DEFAULTS = Object.freeze({
  maxPerSession: 3,
  budgetDir: 'token-stack/nudge-budget',
  retentionHours: 48,
  pruneChance: 0.02,
  maxGrantsKept: 20,
  lockAttempts: 40,
  lockWaitMs: 5,
  staleLockMs: 10_000
});

/** Wurzel der Claude-Konfiguration; identisch zur Aufloesung in prefix-budget. */
export function claudeConfigDir() {
  return resolveConfiguredPath(process.env.CLAUDE_CONFIG_DIR || '~/.claude');
}

/**
 * Loest einen konfigurierten Pfad auf:
 *   absolut oder `~`-Praefix  -> unveraendert uebernommen
 *   relativ                   -> relativ zum Claude-Konfigverzeichnis
 * Damit wandern State- und Konfigdateien mit CLAUDE_CONFIG_DIR mit, statt an
 * `~/.claude` zu kleben.
 */
export function resolveInConfigDir(value, options = {}) {
  const configDir = options.configDir || claudeConfigDir();
  const cwd = options.cwd || process.cwd();
  const raw = String(value ?? '').trim();
  if (!raw) return configDir;
  if (raw.startsWith('~') || path.isAbsolute(raw)) return resolveConfiguredPath(raw, cwd);
  return path.resolve(configDir, raw);
}

function budgetDir(options = {}) {
  const configured = process.env.NUDGE_BUDGET_DIR || options.budgetDir || NUDGE_DEFAULTS.budgetDir;
  return resolveInConfigDir(configured, options);
}

export function budgetFile(sessionId, options = {}) {
  return path.join(budgetDir(options), `${safePart(sessionId || 'no-session')}.json`);
}

/**
 * Sitzungsmarker als Datei — prozessuebergreifende Notiz zwischen zwei Hook-Spawns
 * (z. B. ctx-used-marker schreibt, bash-size-feedback liest). Liegt gebuendelt unter
 * <configDir>/token-stack/markers/ statt in /tmp, damit alle Token-Stack-Dateien an
 * einem Ort stehen und mit CLAUDE_CONFIG_DIR mitwandern. Nicht os.tmpdir(): das ist
 * auf macOS prozessprivat, die Spawns saehen einander nicht.
 */
export function markerFile(sessionId, kind, options = {}) {
  const dir = resolveInConfigDir(process.env.MARKER_DIR || 'token-stack/markers', options);
  return path.join(dir, `${safePart(kind || 'marker')}-${safePart(sessionId || 'no-session')}`);
}

function budgetLimit(options = {}) {
  const raw = process.env.NUDGE_BUDGET_MAX ?? options.maxPerSession ?? NUDGE_DEFAULTS.maxPerSession;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : NUDGE_DEFAULTS.maxPerSession;
}

function sleepSync(ms) {
  // Ohne Fremdabhaengigkeit und ohne Busy-Loop: blockierendes Warten auf einem
  // SharedArrayBuffer. Der Hook laeuft ohnehin nur Millisekunden.
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch { /* fallback: sofort weiter */ }
}

function writeAtomic(file, value) {
  ensurePrivateDir(path.dirname(file));
  const temp = `${file}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temp, file);
  try { fs.chmodSync(file, 0o600); } catch { /* Windows/restricted FS */ }
}

/**
 * Serialisiert den Lese-Aendere-Schreib-Zyklus ueber ein Lock-Verzeichnis
 * (mkdir ist auf POSIX wie Windows atomar). Ein verwaistes Lock wird nach
 * staleLockMs uebernommen, damit ein abgestuerzter Hook das Budget nicht
 * dauerhaft sperrt.
 */
function withLock(file, fn, options = {}) {
  const attempts = Number(options.lockAttempts ?? NUDGE_DEFAULTS.lockAttempts);
  const waitMs = Number(options.lockWaitMs ?? NUDGE_DEFAULTS.lockWaitMs);
  const staleMs = Number(options.staleLockMs ?? NUDGE_DEFAULTS.staleLockMs);
  const lock = `${file}.lock`;
  ensurePrivateDir(path.dirname(file));
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      fs.mkdirSync(lock);
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      let stale = false;
      try { stale = Date.now() - fs.statSync(lock).mtimeMs > staleMs; } catch { stale = true; }
      if (stale) { try { fs.rmdirSync(lock); } catch { /* Rennen verloren, naechster Versuch */ } continue; }
      sleepSync(waitMs);
      continue;
    }
    try { return fn(); } finally { try { fs.rmdirSync(lock); } catch { /* bereits weg */ } }
  }
  throw new Error(`nudge budget locked after ${attempts} attempts: ${lock}`);
}

function normalize(value, sessionId, limit) {
  const source = value && typeof value === 'object' ? value : {};
  const used = Number(source.used);
  return {
    schemaVersion: NUDGE_SCHEMA_VERSION,
    sessionId: String(sessionId || 'no-session'),
    limit,
    used: Number.isFinite(used) && used > 0 ? Math.floor(used) : 0,
    grants: Array.isArray(source.grants) ? source.grants : [],
    updatedAt: source.updatedAt || null
  };
}

/** Entfernt Budgetdateien aelterer Sitzungen. Gibt die Anzahl zurueck. */
export function pruneNudgeBudgets(options = {}) {
  const dir = budgetDir(options);
  if (!fs.existsSync(dir)) return 0;
  const cutoff = Date.now() - Math.max(1, Number(options.retentionHours ?? NUDGE_DEFAULTS.retentionHours)) * 3_600_000;
  let removed = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const file = path.join(dir, entry.name);
    try {
      if (fs.statSync(file).mtimeMs < cutoff) { fs.unlinkSync(file); removed += 1; }
    } catch { /* fail open */ }
  }
  return removed;
}

/** Liest den Budgetstand, ohne zu buchen. */
export function nudgeStatus(sessionId, options = {}) {
  const limit = budgetLimit(options);
  const state = normalize(readJson(budgetFile(sessionId, options), null), sessionId, limit);
  return { ...state, remaining: Math.max(0, limit - state.used), file: budgetFile(sessionId, options) };
}

/** Setzt das Budget einer Sitzung zurueck (Tests, `--reset`). */
export function resetNudgeBudget(sessionId, options = {}) {
  try { fs.unlinkSync(budgetFile(sessionId, options)); return true; } catch { return false; }
}

/**
 * Bucht einen Nudge. Nur bei `granted: true` darf der Aufrufer etwas ausgeben.
 *
 * @param {string} sessionId  Sitzungskennung des Hook-Payloads
 * @param {string} source     Name des buchenden Hooks (Nachweis in der Datei)
 * @returns {{granted: boolean, used: number, remaining: number, limit: number, reason: string}}
 */
export function tryConsumeNudge(sessionId, source, options = {}) {
  const limit = budgetLimit(options);
  const file = budgetFile(sessionId, options);
  if (limit <= 0) return { granted: false, used: 0, remaining: 0, limit, reason: 'limit-zero' };

  try {
    const pruneChance = Number(options.pruneChance ?? NUDGE_DEFAULTS.pruneChance);
    if (pruneChance > 0 && Math.random() < pruneChance) pruneNudgeBudgets(options);

    return withLock(file, () => {
      const state = normalize(readJson(file, null), sessionId, limit);
      if (state.used >= limit) {
        return { granted: false, used: state.used, remaining: 0, limit, reason: 'exhausted' };
      }
      state.used += 1;
      state.limit = limit;
      state.grants = [...state.grants, { source: String(source || 'unknown'), at: new Date().toISOString() }]
        .slice(-Number(options.maxGrantsKept ?? NUDGE_DEFAULTS.maxGrantsKept));
      state.updatedAt = new Date().toISOString();
      writeAtomic(file, state);
      return { granted: true, used: state.used, remaining: Math.max(0, limit - state.used), limit, reason: 'granted' };
    }, options);
  } catch (error) {
    // L-6: Ein unbenutzbares Budget wird gemeldet, nicht stillschweigend als
    // "frei" behandelt. Der Nudge unterbleibt; der Tool-Call laeuft normal.
    const detail = error instanceof Error ? error.message : String(error);
    try { process.stderr.write(`[nudge-budget] nicht verfuegbar (${detail}); Nudge von "${source}" unterdrueckt\n`); } catch { /* stderr zu */ }
    return { granted: false, used: 0, remaining: 0, limit, reason: 'unavailable' };
  }
}
