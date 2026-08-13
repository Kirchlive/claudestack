#!/usr/bin/env node
/*
 * Transfer des Entwicklungsstands an den Betriebsort ~/.claude/token-stack/.
 *
 * Warum es diesen Schritt ueberhaupt gibt: Weder Umsetzungsplan noch FINALIZE sagen,
 * wo das Paket im Betrieb liegt (Defekt D20) — sie regeln nur das Wann der Integration.
 * Der Nutzer hat entschieden: alles Token-Stack-Eigene gebuendelt an einem Ort, nur wo
 * Claude Code einen eigenen Standardordner hat, wird der genutzt.
 *
 * Zwei Eigenschaften, an denen alles haengt:
 *
 * 1. LAUFZEITZUSTAND WIRD NIE UEBERSCHRIEBEN. Am Betriebsort liegt der Zustand im
 *    selben Verzeichnis wie der Code (state/, markers/, capabilities.json, ...). Ein
 *    Transfer, der stumpf kopiert oder spiegelt, wuerde eine laufende Installation
 *    zuruecksetzen — inklusive der Canary-Faehigkeitsdatei, deren Verlust den
 *    Dispatcher nach ADR-005 in shadow zurueckfallen laesst. Das ist dieselbe Klasse
 *    wie der apply-manifest.py-Vorfall in Phase 3, wo ein Wiederholungslauf die Arbeit
 *    der vorigen Phase ueberschrieben hat.
 *
 * 2. IDEMPOTENT. Ein zweiter Lauf ohne Aenderung meldet 0 kopierte Dateien. Nur so ist
 *    der Transfer wiederholbar, ohne dass man vorher wissen muss, was sich geaendert hat.
 *
 * Aufruf: node scripts/deploy.mjs [--target <pfad>] [--dry-run]
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const out = { target: null, dryRun: false };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--target') out.target = argv[i += 1];
    else if (argv[i] === '--dry-run') out.dryRun = true;
    else if (argv[i] === '--help') out.help = true;
    else {
      console.error(`Unbekanntes Argument: ${argv[i]}`);
      process.exit(2);
    }
  }
  return out;
}

function claudeConfigDir(env = process.env) {
  const configured = String(env.CLAUDE_CONFIG_DIR || '').trim();
  if (!configured) return path.join(os.homedir(), '.claude');
  if (configured === '~') return os.homedir();
  if (configured.startsWith('~/') || configured.startsWith(`~${path.sep}`)) {
    return path.resolve(os.homedir(), configured.slice(2));
  }
  return path.resolve(configured);
}

// Identisch zu verify-package.mjs und checksums.mjs — bei Aenderung dort mitziehen.
const RUNTIME_PREFIXES = ['state/', 'markers/', 'nudge-budget/', 'read-state/', 'session-economy/'];
const RUNTIME_FILES = ['token-stack.json', 'fragment.json', 'capabilities.json', 'prefix-latest.json', 'prefix-snapshots.jsonl', 'prefix-snapshots.jsonl.1'];
const RUNTIME_CONFIG = /^[a-z0-9-]+\.config\.json$/;
const NEVER = [/(^|\/)__pycache__\//, /(^|\/)node_modules\//, /(^|\/)\.git\//, /(^|\/)\.DS_Store$/];

function isRuntimeEntry(entry) {
  if (RUNTIME_PREFIXES.some((prefix) => entry.startsWith(prefix))) return true;
  if (RUNTIME_FILES.includes(entry)) return true;
  return !entry.includes('/') && RUNTIME_CONFIG.test(entry);
}

function walk(dir, base = '') {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(path.join(dir, entry.name), rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

const sha = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const args = parseArgs(process.argv);
if (args.help) {
  console.log('node scripts/deploy.mjs [--target <pfad>] [--dry-run]');
  process.exit(0);
}
const target = path.resolve(args.target || path.join(claudeConfigDir(), 'token-stack'));

if (target === source) {
  console.error('Quelle und Ziel sind identisch — Transfer waere sinnlos.');
  process.exit(2);
}

// Auszuliefern ist alles ausser Baurueckstaenden und Laufzeitzustand. Letzterer kann im
// Entwicklungsstand gar nicht vorkommen, wird aber gefiltert, damit ein versehentlich
// dort entstandener Zustand nicht an den Betriebsort wandert.
const payload = walk(source)
  .filter((entry) => !NEVER.some((pattern) => pattern.test(entry)))
  .filter((entry) => !isRuntimeEntry(entry));

const copied = [];
const skipped = [];
const protectedEntries = [];
const orphanEntries = [];

for (const entry of payload) {
  const from = path.join(source, entry);
  const to = path.join(target, entry);
  if (fs.existsSync(to) && sha(from) === sha(to)) {
    skipped.push(entry);
    continue;
  }
  copied.push(entry);
  if (args.dryRun) continue;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  // Atomar: erst daneben schreiben, dann umbenennen. Ein abgebrochener Transfer
  // hinterlaesst so keine halbe Datei am Betriebsort.
  const tmp = `${to}.tmp-${process.pid}`;
  fs.copyFileSync(from, tmp);
  fs.renameSync(tmp, to);
}

// Was am Ziel liegt und nicht zur Auslieferung gehoert, faellt in zwei getrennte Klassen.
// Sie duerfen nicht in einer Zahl verschwinden: die eine ist erwuenscht, die andere
// verlangt eine Handlung.
//
//   protectedEntries — Laufzeitzustand (state/, capabilities.json, token-stack.json, ...).
//                      Wird gezaehlt und benannt, aber nie angefasst. Erwartet, kein Befund.
//   orphanEntries    — Paketdateien eines frueheren Stands, die es in der Auslieferung
//                      nicht mehr gibt. Typischer Ausloeser: eine Datei wurde im
//                      Entwicklungsstand umbenannt oder entfernt. Dieses Skript loescht
//                      nichts (L-6: nie stillschweigend Nutzerdaten anfassen), also bleibt
//                      der alte Name am Betriebsort liegen — und der Verifier dort faellt
//                      auf Exit 1, weil er beidseitig prueft und die Datei nicht im
//                      Manifest steht. Die Entfernung ist Handarbeit.
if (fs.existsSync(target)) {
  const payloadSet = new Set(payload);
  for (const entry of walk(target)) {
    if (payloadSet.has(entry)) continue;
    if (isRuntimeEntry(entry)) protectedEntries.push(entry);
    else if (!NEVER.some((pattern) => pattern.test(entry)) && !entry.endsWith('.tmp')) {
      orphanEntries.push(entry);
    }
  }
}

const report = {
  source,
  target,
  dryRun: args.dryRun,
  copied: copied.length,
  unchanged: skipped.length,
  protected: protectedEntries.length,
  protectedEntries,
  orphans: orphanEntries.length,
  orphanEntries,
  copiedEntries: copied,
};
console.log(JSON.stringify(report, null, 2));

if (!args.dryRun && copied.length) {
  console.error(`\nTransfer nach ${target}: ${copied.length} kopiert, ${skipped.length} unveraendert, ${protectedEntries.length} geschuetzt.`);
  console.error('Naechster Schritt: dort `npm test` und `npm run verify` laufen lassen, dann den Rauchtest (scripts/smoke.mjs).');
}

// Waisen sind kein Randfall, sondern der Normalfall nach jeder Umbenennung. Deshalb ein
// eigener, unuebersehbarer Block statt einer Zeile in der Zaehlung — und ein ausdruecklicher
// Hinweis, dass der Verifier am Betriebsort bis zur Handarbeit rot bleibt.
if (orphanEntries.length) {
  console.error(`\nVERWAISTE PAKETDATEIEN AM BETRIEBSORT (${orphanEntries.length}):`);
  for (const entry of orphanEntries) console.error(`  ${entry}`);
  console.error('\nDiese Dateien gehoeren nicht mehr zur Auslieferung — typischerweise Reste einer');
  console.error('Umbenennung oder Entfernung im Entwicklungsstand. Dieses Skript loescht nichts.');
  console.error(`Bis sie entfernt sind, meldet \`npm run verify\` in ${target} Exit 1`);
  console.error('(beidseitige Pruefung: die Datei liegt dort, steht aber nicht im Manifest).');
  console.error('Nach Pruefung von Hand entfernen, dann Verifier erneut laufen lassen.');
}
