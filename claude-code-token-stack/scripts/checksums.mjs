#!/usr/bin/env node
/*
 * Erzeugt SHA256SUMS.txt neu — das Integritaetsmanifest, gegen das
 * scripts/verify-package.mjs den Baum prueft.
 *
 * Warum es dieses Skript gibt: das Manifest muss nach JEDER Baumaenderung neu
 * berechnet werden, sonst scheitert der Verifier im Preflight und bricht ab, bevor
 * Semantik-Checks und Testzaehlung ueberhaupt laufen. Bisher wurde es von Hand
 * erzeugt; ein handgepflegtes Manifest ist genau die Fehlerquelle, an der die
 * Vorgaengerfassung mit 32 Eintraegen fuer 89 Dateien gescheitert ist.
 *
 * Der Dateikreis ist bewusst weit: ALLE regulaeren Dateien ausser dem Manifest
 * selbst, evidence/ eingeschlossen. Ausgenommen ist nur der Laufzeitzustand am
 * Betriebsort (~/.claude/token-stack/) — dieselbe Liste wie in verify-package.mjs,
 * und aus demselben Grund: dort liegt der Zustand im selben Verzeichnis wie der Code.
 *
 * Aufruf: node scripts/checksums.mjs [--check]
 *   ohne Flag  schreibt das Manifest neu
 *   --check    prueft nur und meldet Abweichungen mit Exit 1 (fuer CI/Rauchtest)
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestName = 'SHA256SUMS.txt';
const manifestFile = path.join(root, manifestName);

// Identisch zu verify-package.mjs — bei Aenderung dort mitziehen.
const RUNTIME_PREFIXES = ['state/', 'markers/', 'nudge-budget/', 'read-state/', 'session-economy/'];
const RUNTIME_FILES = ['token-stack.json', 'fragment.json', 'capabilities.json', 'prefix-latest.json', 'prefix-snapshots.jsonl', 'prefix-snapshots.jsonl.1'];
const RUNTIME_CONFIG = /^[a-z0-9-]+\.config\.json$/;
// Baurueckstaende, die nie ins Manifest gehoeren.
const NEVER = [/(^|\/)__pycache__\//, /(^|\/)node_modules\//, /(^|\/)\.git\//, /(^|\/)\.DS_Store$/];

function isRuntimeEntry(entry) {
  if (RUNTIME_PREFIXES.some((prefix) => entry.startsWith(prefix))) return true;
  if (RUNTIME_FILES.includes(entry)) return true;
  return !entry.includes('/') && RUNTIME_CONFIG.test(entry);
}

function walk(dir, base = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

const files = walk(root)
  .filter((entry) => entry !== manifestName)
  .filter((entry) => !NEVER.some((pattern) => pattern.test(entry)))
  .filter((entry) => !isRuntimeEntry(entry))
  .sort();

const lines = files.map((entry) => {
  const digest = createHash('sha256').update(fs.readFileSync(path.join(root, entry))).digest('hex');
  return `${digest}  ${entry}`;
});

const header = [
  `# ${manifestName} — Integritaetsmanifest des Zielpakets claude-code-token-stack`,
  '#',
  '# Dateikreis: ALLE regulaeren Dateien des Pakets, ausgenommen diese Datei selbst.',
  '#   evidence/ ist ausdruecklich EINGESCHLOSSEN: das Archiv wird im Betrieb nicht',
  '#   gelesen, ist aber Teil der Auslieferung und sein Nachweiswert haengt daran, dass',
  '#   es unveraendert ist. scripts/verify-package.mjs prueft in beide Richtungen —',
  '#   jeder Eintrag muss existieren und jede Datei muss gelistet sein.',
  '#',
  '# NICHT enthalten: der Laufzeitzustand am Betriebsort ~/.claude/token-stack/',
  '#   (state/, markers/, nudge-budget/, read-state/, session-economy/,',
  '#   capabilities.json, prefix-*.json*, *.config.json). Dort liegt der Zustand im',
  '#   selben Verzeichnis wie der Code, weil der Betriebsort alles Token-Stack-Eigene',
  '#   buendelt. Der Verifier weist ihn unter runtime_entries getrennt aus.',
  '#',
  `# Umfang: ${lines.length} Dateien. Erzeugt mit scripts/checksums.mjs — nach JEDER`,
  '#   Baumaenderung neu laufen lassen, sonst scheitert der Verifier im Preflight.',
  '',
].join('\n');

const content = `${header}${lines.join('\n')}\n`;

if (process.argv.includes('--check')) {
  const current = fs.existsSync(manifestFile) ? fs.readFileSync(manifestFile, 'utf8') : '';
  if (current === content) {
    console.log(`SHA256SUMS.txt aktuell (${lines.length} Dateien)`);
    process.exit(0);
  }
  console.error(`SHA256SUMS.txt veraltet — ${lines.length} Dateien im Baum. Neu erzeugen: node scripts/checksums.mjs`);
  process.exit(1);
}

fs.writeFileSync(manifestFile, content);
console.log(`SHA256SUMS.txt geschrieben: ${lines.length} Dateien`);
