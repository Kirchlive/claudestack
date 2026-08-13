#!/usr/bin/env node
/*
 * Rauchtest nach der Fragment-Uebernahme (AP-6.1).
 *
 * Der Plan sagt "Config mode: off → nach Smoke shadow", definiert aber nirgends, was
 * dieser Smoke prueft. Diese Datei schliesst die Luecke. Sie prueft den registrierten
 * Hook so, wie Claude Code ihn aufruft: als Prozess mit JSON auf stdin.
 *
 * Geprueft wird der Vertrag, nicht der Wortlaut:
 *   1. Der Hook laeuft ueberhaupt (Startfehler und Exitcode != 0 sind Befunde).
 *   2. Bei mode:off ist er ein echter No-op — kein stdout, keine Mutation.
 *   3. Er beschreibt stdout auch bei kaputter Eingabe nicht (Fail-open-Vertrag):
 *      ein Fehler im Hook darf den Tool-Call nicht abbrechen.
 *   4. Der Shim zeigt auf einen existierenden Dispatcher.
 *   5. Das Fragment registriert genau einen Handler und keinen optionalen Hook.
 *
 * Warum das reicht, um von off auf shadow zu gehen: shadow ist selbst ein No-op mit
 * Beobachtung. Wer belegt hat, dass der Hook laeuft, nichts nach stdout schreibt und
 * bei Fehlern still bleibt, hat das Risiko der Umschaltung auf shadow abgedeckt. Fuer
 * enforce gilt das NICHT — dort entscheidet die Canary-Probe (ADR-005) und das
 * Net-Win-Gate (Phase 6/7).
 *
 * Aufruf: node scripts/smoke.mjs [--fragment <datei>]
 * Exit 0 = bestanden · 1 = Befund · 2 = Aufrufsfehler
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shim = path.join(root, 'hooks', 'claudestack.mjs');
const dispatcher = path.join(root, 'src', 'stack.mjs');

let fail = 0;
const chk = (name, cond, detail = '') => {
  if (!cond) fail += 1;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail && !cond ? `\n      ↳ ${detail}` : ''}`);
};

// Fail-loud: fehlende Pruefgegenstaende brechen ab, statt als bestanden zu zaehlen.
const required = [['hooks/claudestack.mjs', shim], ['src/stack.mjs', dispatcher]];
const missing = required.filter(([, file]) => !fs.existsSync(file));
if (missing.length) {
  console.error(`FEHLENDE PRUEFGEGENSTAENDE: ${missing.map(([name]) => name).join(', ')}`);
  process.exit(1);
}

function runHook(payload, env = {}) {
  const result = spawnSync(process.execPath, [shim], {
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    encoding: 'utf-8',
    env: { ...process.env, ...env },
    timeout: 15_000,
  });
  if (result.error) return { ok: false, why: `Start fehlgeschlagen: ${result.error.message}`, stdout: '', status: null };
  return { ok: result.status === 0, why: `Exit ${result.status}: ${(result.stderr || '').trim()}`, stdout: result.stdout || '', status: result.status };
}

const bashPayload = {
  hook_event_name: 'PostToolUse',
  tool_name: 'Bash',
  session_id: 'smoke-1',
  tool_input: { command: 'echo hallo' },
  tool_response: { stdout: 'z'.repeat(50_000), stderr: '', interrupted: false, isImage: false, exitCode: 0 },
};

console.log('— 1. Hook laeuft —');
const r1 = runHook(bashPayload);
chk('Hook startet und endet mit Exit 0', r1.ok, r1.why);

console.log('\n— 2. mode:off ist ein echter No-op —');
chk('kein stdout bei mode:off', r1.stdout === '', `stdout war: ${r1.stdout.slice(0, 200)}`);

console.log('\n— 3. Fail-open bei kaputter Eingabe —');
const r2 = runHook('das ist kein JSON');
chk('kaputte Eingabe: Exit 0', r2.ok, r2.why);
chk('kaputte Eingabe: kein stdout', r2.stdout === '', `stdout war: ${r2.stdout.slice(0, 200)}`);
const r3 = runHook({ hook_event_name: 'PostToolUse', tool_name: 'Bash' });
chk('unvollstaendige Eingabe: Exit 0', r3.ok, r3.why);
chk('unvollstaendige Eingabe: kein stdout', r3.stdout === '');

console.log('\n— 4. Shim zeigt auf den Dispatcher —');
const shimSource = fs.readFileSync(shim, 'utf8');
chk('Shim referenziert src/stack.mjs', /stack[.]mjs/.test(shimSource), 'kein Verweis auf stack.mjs im Shim');

console.log('\n— 5. Fragment registriert genau einen Handler —');
/*
 * Geprueft wird, was DIESES Paket erzeugt — nicht irgendeine Datei, die herumliegt.
 * Die Vorgaengerfassung las `<root>/../fragment.json`. Am Betriebsort zeigte das ins
 * Leere und der Punkt wurde uebersprungen, waehrend der Rauchtest weiter "BESTANDEN"
 * meldete (Befund A-1) — und im Entwicklungsstand fand sie eine veraltete Datei mit
 * fremdem Pfad und bescheinigte ihr Korrektheit (A-2). Beides faellt weg, wenn das
 * Fragment im Lauf erzeugt wird. `--fragment <datei>` prueft zusaetzlich eine konkrete
 * Datei — etwa die, die man gleich uebernehmen will.
 */
const fragmentArg = process.argv.indexOf('--fragment');
const explicitFile = fragmentArg > -1 ? process.argv[fragmentArg + 1] : null;

let fragmentRaw = null;
let fragmentQuelle = '';
if (explicitFile) {
  fragmentQuelle = explicitFile;
  if (!fs.existsSync(explicitFile)) {
    // Fail-loud: ein ausdruecklich benannter Pruefgegenstand, den es nicht gibt, ist ein Befund.
    chk(`Fragment vorhanden: ${explicitFile}`, false, 'FEHLENDER PRUEFGEGENSTAND — mit --fragment benannt, aber nicht auffindbar');
  } else {
    fragmentRaw = fs.readFileSync(explicitFile, 'utf8');
  }
} else {
  fragmentQuelle = 'node bin/claudestack.mjs fragment';
  const gen = spawnSync(process.execPath, [path.join(root, 'bin', 'claudestack.mjs'), 'fragment'], {
    encoding: 'utf8',
    cwd: root,
  });
  if (gen.error || gen.status !== 0) {
    chk('Fragment erzeugbar', false, `${fragmentQuelle} → ${gen.error?.message || `Exit ${gen.status}`}`);
  } else {
    fragmentRaw = gen.stdout;
  }
}

if (fragmentRaw !== null) {
  try {
    const fragment = JSON.parse(fragmentRaw);
    const commands = Object.values(fragment.hooks || {})
      .flat()
      .flatMap((group) => (group.hooks || []).map((hook) => hook.command || ''));
    chk('Fragment registriert ueberhaupt einen Handler', commands.length > 0, `Quelle: ${fragmentQuelle}`);
    const unique = [...new Set(commands)];
    chk('genau ein Kommando registriert', unique.length === 1, `gefunden: ${unique.join(' | ')}`);
    chk('kein optionaler Hook im Fragment', !commands.some((cmd) => cmd.includes('optional')), 'optional/ im Fragment — verletzt ADR-016');
    chk('Kommando zeigt auf einen existierenden Pfad',
      unique.every((cmd) => {
        const match = cmd.match(/"([^"]+\.mjs)"|(\S+\.mjs)/);
        return match ? fs.existsSync(match[1] || match[2]) : false;
      }),
      `Pfad im Fragment nicht auffindbar: ${unique.join(' | ')}`);
    chk('Kommando zeigt in dieses Paket',
      unique.every((cmd) => {
        const match = cmd.match(/"([^"]+\.mjs)"|(\S+\.mjs)/);
        const file = match ? (match[1] || match[2]) : '';
        return file.startsWith(root + path.sep);
      }),
      `Fragment verweist aus dem Paket heraus — bei Uebernahme entstuende ein zweiter Owner (Gesetz I): ${unique.join(' | ')}`);
  } catch (error) {
    chk('Fragment ist gueltiges JSON', false, `${fragmentQuelle}: ${error.message}`);
  }
}

console.log('');
if (fail) {
  console.error(`RAUCHTEST FEHLGESCHLAGEN: ${fail} Befund(e). Nicht auf shadow umstellen.`);
  process.exit(1);
}
console.log('RAUCHTEST BESTANDEN — Umstellung von mode:off auf mode:shadow ist gedeckt.');
process.exit(0);
