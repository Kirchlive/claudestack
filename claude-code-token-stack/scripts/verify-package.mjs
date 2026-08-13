#!/usr/bin/env node

// Ein Verifier aus dreien (C.3.5 / AP-4.4):
//   - Traeger  GPT56SOL scripts/verify-package.mjs — Integritaetskern: Pflichtdateien, Symlink-/
//              .DS_Store-Bann, JSON-Parse, SHA256-Manifest mit Pfadsicherheit, Muster-Bann,
//              Baum-Fingerprint vor/nach dem Testlauf, TAP-Auswertung.
//   - OPUS5    scripts/verify-stack.mjs — der Fail-loud-Block: ein fehlender Pruefgegenstand ist
//              KEIN bestandener Test, sondern ein gar nicht gelaufener. Er wird am Ende gesondert
//              ausgewiesen und verhindert das Gesamt-OK (Lehre aus D2).
//   - K3SWARM  scripts/verify-package.sh — die neun Semantik-Checks, der native Budget-Abgleich und
//              der Smoke im isolierten HOME.
//
// Adaption der K3-Checks ans Zielbild (ADR-016): K3 prueste seine eigenen registrierten Hooks. Dieses
// Paket registriert ausschliesslich den Dispatcher; hooks/optional/ bleibt unregistriert. Die Checks 8
// und 9 pruefen deshalb das FRAGMENT (renderSettingsFragment), nicht eine installierte settings.json.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { DEFAULT_CONFIG, inspectSettings, renderSettingsFragment } from '../src/stack.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checksumManifest = 'SHA256SUMS.txt';
// 43 = 28 (stack) + 9 (cli) + 4 (benchmark) + 2 Kontraktsuiten, die unter `node --test` je als ein
// Test zaehlen. Der Verifier faehrt bewusst denselben Satz wie `npm test`, damit es nicht zwei
// Zahlen gibt, von denen eine falsch aussieht. Die Smoke-Suite hiess vorher
// `hook-contract-smoke.mjs` und wurde von Nodes Discovery nicht erfasst — sie lief nirgends.
const expectedTestCount = 43;

// L-7: der Always-on-Prefix ist der teuerste Posten. Beide Deckel brechen hart ab.
// rules/token-stack.md liegt mit 37 B Reserve unter seinem Deckel — er ist real bindend,
// jede weitere Regel dort kostet eine andere.
const byteCaps = [
  { file: 'templates/CLAUDE.md', max: 4096, rule: 'C.3.4 / L-7 — Root-CLAUDE.md wird bei jedem dateiberuehrenden Tool-Call neu injiziert' },
  { file: 'rules/token-stack.md', max: 3072, rule: 'C.3.3 — was in die Laufzeit geladen wird, bleibt kurz' },
];

// Der child_process-Bann schuetzt den HOOK-PFAD: was Claude Code bei jedem Tool-Call ausfuehrt,
// darf keine Subprozesse starten. Menschlich aufgerufene Werkzeuge duerfen es. Die Ausnahme ist
// deshalb eine benannte Liste mit Begruendung, keine Aufweichung des Musters.
const childProcessAllowed = new Map([
  ['scripts/verify-package.mjs', 'faehrt die Testsuite und den Smoke im isolierten HOME'],
  ['bin/claudestack.mjs', 'Unterbefehl canary startet die Probe; liegt nicht auf dem Hook-Pfad'],
  ['hooks/optional/claude-hook-capability-canary.mjs', 'die Probe startet eine Mock-CLI, um Hook-Faehigkeiten zu testen'],
]);
// Diese beiden bilden den Hook-Pfad und bleiben ausnahmslos gebannt.
const hookPath = ['src/stack.mjs', 'hooks/claudestack.mjs'];

// Der allow-Bann trifft Hooks, die still Berechtigungen erteilen — der Sicherheitsbefund, mit dem
// GPT56 squeez und omni verworfen hat. Die Probe ist der eine legitime Fall: sie SCHREIBT ein
// Wegwerf-Hookskript in ein temporaeres HOME und laesst eine Mock-CLI dagegen laufen, um zu
// messen, ob die Laufzeit updatedInput ueberhaupt honoriert. Ohne allow liefe der Probelauf nicht.
// Die Ausnahme traegt nur, solange die Probe nirgends registriert ist — Check 8c haelt genau das
// fest, und der Bann unten prueft die Kopplung, statt ihr zu vertrauen.
const permissionAllowAllowed = new Map([
  ['hooks/optional/claude-hook-capability-canary.mjs', 'erzeugt ein Wegwerf-Hookskript im isolierten HOME; nicht registriert (ADR-016, Check 8c)'],
]);

const required = [
  'README.md',
  'SHA256SUMS.txt',
  'MERGE-MANIFEST.tsv',
  'package.json',
  'src/stack.mjs',
  'bin/claudestack.mjs',
  'hooks/claudestack.mjs',
  'hooks/optional/claude-hook-capability-canary.mjs',
  'hooks/optional/prefix-budget.mjs',
  'hooks/optional/read-context-guard.mjs',
  'hooks/optional/read-slice-guard.mjs',
  'hooks/optional/reread-guard.mjs',
  'hooks/optional/session-economy.mjs',
  'hooks/optional/bash-size-feedback.mjs',
  'hooks/optional/ctx-used-marker.mjs',
  'hooks/optional/lib/token-stack-shared.mjs',
  'hooks/optional/lib/nudge-budget.mjs',
  'config/token-stack.default.json',
  'config/token-stack.schema.json',
  'config/context-surface-owners.json',
  'config/settings.patch.json',
  'config/native-token-limits.example.jsonc',
  'config/bash-pilot-reference.json',
  'config/plugin-diet.md',
  'scripts/verify-package.mjs',
  'scripts/evaluate-benchmark.mjs',
  'docs/ARCHITECTURE.md',
  'docs/DECISIONS.md',
  'docs/MIGRATION.md',
  'docs/BENCHMARK.md',
  'docs/WAVES.md',
  'docs/SECURITY.md',
  'docs/REPO-MATRIX.md',
  'docs/DEFEKTE.md',
  'docs/LADDER.md',
  'docs/MESSPLAN.md',
  'docs/ROLLOUT.md',
  'templates/CLAUDE.md',
  'templates/TASK-STATE.md',
  'rules/token-stack.md',
  'waves/WAVE-INDEX.md',
  'waves/WAVE-STATE.md',
  'examples/benchmark-runs.example.jsonl',
  'tests/benchmark.test.mjs',
  'tests/cli.test.mjs',
  'tests/stack.test.mjs',
  'tests/contract/test-hook-contract-smoke.mjs',
  'tests/contract/test-guard-all.mjs',
  'evidence/README.md',
  // Zog in Phase 3 von validate/ nach evidence/gpt56/ um (Defekt D11): die Pflichtdatei blieb
  // stehen, waehrend die Datei wanderte — der Verifier schlug fehl, ohne dass etwas kaputt war.
  'evidence/gpt56/06-incoming-reconciliation.md',
  // Evidenzdaten: Grundlage der Sperre aus C.3.11 (1)/ADR-017. Fehlt eine der beiden, laeuft
  // die Sperre nicht — und genau das darf nicht still passieren (M-4).
  'scripts/judgments.json',
  'scripts/scores100-v51.json',
];

function inspectTree(directory, prefix = '') {
  const entries = [];
  for (const entry of fs.readdirSync(path.join(directory, prefix), { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, relative);
    const stat = fs.lstatSync(absolute);
    const mode = stat.mode & 0o7777;
    if (stat.isSymbolicLink()) entries.push({ path: relative, kind: 'symlink', mode });
    else if (stat.isDirectory()) {
      entries.push({ path: relative, kind: 'directory', mode });
      entries.push(...inspectTree(directory, relative));
    } else if (stat.isFile()) {
      const content = fs.readFileSync(absolute);
      entries.push({
        path: relative,
        kind: 'file',
        mode,
        content,
        sha256: createHash('sha256').update(content).digest('hex'),
      });
    } else entries.push({ path: relative, kind: 'special', mode });
  }
  return entries.sort((left, right) => left.path.localeCompare(right.path, 'en'));
}

/*
 * Laufzeitpfade am Betriebsort (~/.claude/token-stack/). Dort liegt der Zustand im
 * selben Verzeichnis wie der Code — so hat der Nutzer den Betriebsort festgelegt:
 * alles Token-Stack-Eigene gebuendelt an einem Ort. Ohne diese Ausnahme meldete der
 * Verifier jede Zustandsdatei als fehlenden Manifest-Eintrag und waere im Betrieb
 * dauerhaft rot, sobald der Stack einmal gelaufen ist.
 *
 * Bewusst eine geschlossene Liste, kein Muster wie "alles ausser dem Paket": eine
 * offene Regel wuerde auch eine versehentlich abgelegte Datei durchwinken. Der Report
 * weist die gefundenen Laufzeiteintraege unter runtime_entries aus — sie verschwinden
 * aus der Pruefung, nicht aus dem Blick (L-6).
 */
const RUNTIME_PREFIXES = ['state/', 'markers/', 'nudge-budget/', 'read-state/', 'session-economy/'];
const RUNTIME_FILES = ['token-stack.json', 'fragment.json', 'capabilities.json', 'prefix-latest.json', 'prefix-snapshots.jsonl', 'prefix-snapshots.jsonl.1'];
const RUNTIME_CONFIG = /^[a-z0-9-]+\.config\.json$/;

function isRuntimeEntry(entry) {
  if (RUNTIME_PREFIXES.some((prefix) => entry.startsWith(prefix))) return true;
  if (RUNTIME_FILES.includes(entry)) return true;
  // Nutzerkonfiguration der optionalen Hooks, nur im Wurzelverzeichnis des Betriebsorts.
  return !entry.includes('/') && RUNTIME_CONFIG.test(entry);
}

function inspectPackage() {
  const tree = inspectTree(root);
  const regular = new Map(tree.filter((entry) => entry.kind === 'file').map((entry) => [entry.path, entry]));
  const allFiles = [...regular.keys()].filter((entry) => entry !== checksumManifest).sort();
  const runtimeEntries = allFiles.filter(isRuntimeEntry);
  const deliveredFiles = allFiles.filter((entry) => !isRuntimeEntry(entry));
  const deliveredSet = new Set(deliveredFiles);
  const forbiddenEntries = tree
    .filter((entry) => entry.kind === 'symlink' || entry.kind === 'special')
    .map((entry) => `${entry.path}:${entry.kind}`);
  const forbiddenFiles = deliveredFiles.filter((entry) => path.posix.basename(entry) === '.DS_Store');
  const missing = required.filter((entry) => !regular.has(entry));
  const parsedJson = [];
  const jsonErrors = [];
  for (const entry of required.filter((item) => item.endsWith('.json') && regular.has(item))) {
    try {
      JSON.parse(regular.get(entry).content.toString('utf8'));
      parsedJson.push(entry);
    } catch {
      jsonErrors.push(`${entry}:invalid_json`);
    }
  }

  const checksumErrors = [];
  const checksumEntries = [];
  const checksumEntrySet = new Set();
  const manifest = regular.get(checksumManifest);
  if (!manifest) checksumErrors.push('manifest:missing_or_not_regular');
  else for (const line of manifest.content.toString('utf8').split(/\r?\n/).filter(Boolean)) {
    // Kommentarzeilen sind zugelassen, damit das Manifest seinen eigenen Dateikreis benennen kann.
    // Das Vorgaengermanifest listete 32 von 89 Dateien ohne erkennbare Regel — woran genau diese
    // Pruefung dann scheiterte, war der Datei selbst nicht anzusehen.
    if (/^\s*#/.test(line)) continue;
    const match = line.match(/^([a-f0-9]{64})  (.+)$/);
    if (!match) {
      checksumErrors.push('manifest:invalid_line');
      continue;
    }
    const [, expected, entry] = match;
    checksumEntries.push(entry);
    if (
      entry === checksumManifest
      || path.isAbsolute(entry)
      || entry.includes('\\')
      || entry.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')
    ) {
      checksumErrors.push(`${entry}:invalid_path`);
      continue;
    }
    if (checksumEntrySet.has(entry)) {
      checksumErrors.push(`${entry}:duplicate`);
      continue;
    }
    checksumEntrySet.add(entry);
    const file = regular.get(entry);
    if (!file) checksumErrors.push(`${entry}:missing_or_not_regular`);
    else if (file.sha256 !== expected) checksumErrors.push(`${entry}:mismatch`);
  }
  const checksumMissing = deliveredFiles.filter((entry) => !checksumEntrySet.has(entry));
  const checksumUnexpected = [...checksumEntrySet].filter((entry) => !deliveredSet.has(entry)).sort();

  const forbiddenPatterns = [];
  for (const entry of required.filter((item) => (
    /[.](?:mjs|json)$/.test(item) && !item.startsWith('tests/') && regular.has(item)
  ))) {
    const content = regular.get(entry).content.toString('utf8');
    if (/permissionDecision\s*["']?\s*:\s*["']allow["']/i.test(content) && !permissionAllowAllowed.has(entry)) {
      forbiddenPatterns.push(`${entry}:permissionDecision_allow`);
    }
    if (/child_process/.test(content) && !childProcessAllowed.has(entry)) {
      forbiddenPatterns.push(`${entry}:child_process`);
    }
  }
  // Der Hook-Pfad bleibt ausnahmslos gebannt — auch wenn ihn jemand in eine Allowlist eintraegt.
  for (const entry of hookPath) {
    if (childProcessAllowed.has(entry)) forbiddenPatterns.push(`${entry}:child_process_allowlisted_on_hook_path`);
    if (permissionAllowAllowed.has(entry)) forbiddenPatterns.push(`${entry}:permission_allow_allowlisted_on_hook_path`);
  }

  const fingerprint = createHash('sha256').update(JSON.stringify(tree.map(({ path: entry, kind, mode, sha256 }) => ({
    path: entry,
    kind,
    mode,
    ...(sha256 ? { sha256 } : {}),
  })))).digest('hex');
  const ok = missing.length === 0
    && jsonErrors.length === 0
    && forbiddenEntries.length === 0
    && forbiddenFiles.length === 0
    && checksumErrors.length === 0
    && checksumMissing.length === 0
    && checksumUnexpected.length === 0
    && forbiddenPatterns.length === 0;
  return {
    ok,
    fingerprint,
    missing,
    parsedJson,
    jsonErrors,
    deliveredFiles,
    runtimeEntries,
    forbiddenEntries,
    forbiddenFiles,
    checksumErrors,
    checksumEntries,
    checksumMissing,
    checksumUnexpected,
    forbiddenPatterns,
    regular,
    // Deckt beide Namenskonventionen ab: die Unit-Suiten (*.test.mjs) und die Kontraktsuiten
    // (contract/test-*.mjs). Genau die Menge, die Nodes Auto-Discovery in `npm test` faehrt.
    testFiles: deliveredFiles.filter((entry) => (
      /^tests\/[^/]+[.]test[.]mjs$/.test(entry) || /^tests\/contract\/test-[^/]+[.]mjs$/.test(entry)
    )),
  };
}

// ---------------------------------------------------------------- Semantik + Fail-loud (OPUS/K3)

const checks = [];
const loud = [];

function must(name, condition, detail = '') {
  checks.push({ name, ok: Boolean(condition), detail: condition ? '' : String(detail) });
}

// Ein fehlender Pruefgegenstand darf NIE als bestanden zaehlen (D2). Er landet in loud[]
// und die zugehoerigen Pruefungen laufen gar nicht erst an.
function subject(relative, parse = null) {
  const absolute = path.join(root, relative);
  let raw;
  try {
    raw = fs.readFileSync(absolute, 'utf8');
  } catch (error) {
    loud.push(`${relative} — ${error?.code === 'ENOENT' ? 'nicht vorhanden' : String(error?.message || error)}`);
    return null;
  }
  if (!parse) return raw;
  try {
    return parse === 'json' ? JSON.parse(raw) : parse(raw);
  } catch (error) {
    loud.push(`${relative} — nicht auswertbar: ${String(error?.message || error)}`);
    return null;
  }
}

function runSemanticChecks() {
  // --- Checks 1-5: die fuenf nativen Deckel. Quelle ist der Patch-Vorschlag des Pakets, nicht die
  // installierte settings.json — der Verifier prueft das Paket, nicht die Maschine.
  const patch = subject('config/settings.patch.json', 'json');
  if (patch) {
    const env = patch.env || {};
    const expected = {
      MAX_MCP_OUTPUT_TOKENS: '8000',
      BASH_MAX_OUTPUT_LENGTH: '24000',
      TASK_MAX_OUTPUT_LENGTH: '12000',
      CLAUDE_CODE_MAX_OUTPUT_TOKENS: '16000',
    };
    for (const [key, value] of Object.entries(expected)) {
      must(`Check 1-4: env.${key} = ${value}`, env[key] === value, `ist ${JSON.stringify(env[key] ?? null)}`);
    }
    for (const [key, value] of Object.entries(env)) {
      must(`env.${key} ist String`, typeof value === 'string', `ist ${typeof value} — Claude Code erwartet String`);
    }
    // Check 5: CLAUDE_AUTOCOMPACT_PCT_OVERRIDE. K3 verlangte "78". Auf dieser Installation ist
    // Autocompact abgeschaltet und die Variable im settings-env dokumentiert wirkungslos (F5),
    // deshalb ist ihre Abwesenheit hier die begruendete Position — sie muss aber begruendet SEIN.
    const documented = JSON.stringify(patch._bewusst_nicht_gesetzt || {});
    must(
      'Check 5: CLAUDE_AUTOCOMPACT_PCT_OVERRIDE gesetzt oder begruendet ausgelassen',
      'CLAUDE_AUTOCOMPACT_PCT_OVERRIDE' in env || documented.includes('CLAUDE_AUTOCOMPACT_PCT_OVERRIDE'),
      'weder gesetzt noch unter _bewusst_nicht_gesetzt begruendet',
    );
    // Check 6: ENABLE_TOOL_SEARCH. Nie pauschal false (AP-1.6). Der Check sieht NUR die Settings-
    // Ebene; auf dieser Maschine steht die Variable per Shell-Export in ~/.bashrc und wirkt
    // trotzdem (D14). Wer nur settings.json liest, haelt sie faelschlich fuer ungesetzt.
    must(
      'Check 6: ENABLE_TOOL_SEARCH nicht auf false',
      env.ENABLE_TOOL_SEARCH === undefined || String(env.ENABLE_TOOL_SEARCH) !== 'false',
      `ist ${JSON.stringify(env.ENABLE_TOOL_SEARCH ?? null)} — pauschales false ist nach AP-1.6 unzulaessig`,
    );
    must(
      'Check 6b: Shell-Ebene von ENABLE_TOOL_SEARCH ist dokumentiert',
      documented.includes('ENABLE_TOOL_SEARCH'),
      'Die Settings-Ebene allein ist kein Nachweis: ein Shell-Export wirkt ebenfalls (D14). '
      + 'Der Patch muss die Quelle benennen, sonst liest sich Schweigen wie Abwesenheit.',
    );
  }

  // --- Check 7: Deny-Empfehlung. K3s Original prueste die deny-Liste einer INSTALLIERTEN
  // settings.json. Dieses Paket liefert nach ADR-012/L-10 keine, sondern einen Vorschlag zur
  // manuellen Uebernahme — die Flaeche existiert also anders, nicht gar nicht. Geprueft wird
  // deshalb der maschinenlesbare Vorschlag in settings.patch.json.
  // Bewusst NICHT geprueft: Fliesstext in docs/SECURITY.md. Ein Check, der Prosa nach Stichworten
  // durchsucht, ist grep auf Dokumentation — er geht beim naechsten Umformulieren kaputt und
  // belegt ohnehin nur, dass ein Wort vorkommt.
  // Grenze: belegt wird, dass das PAKET dies empfiehlt. Ob die Regeln auf der Zielmaschine aktiv
  // sind, ist mit Paketmitteln nicht feststellbar.
  if (patch) {
    const deny = patch.permissions?.deny;
    must('Check 7: deny-Empfehlung ist eine Liste', Array.isArray(deny), `ist ${JSON.stringify(deny ?? null)}`);
    if (Array.isArray(deny)) {
      must('Check 7a: deny-Empfehlung deckt .env ab', deny.some((rule) => String(rule).includes('.env')), deny.join(' | '));
      must('Check 7b: deny-Empfehlung deckt rm -rf ab', deny.some((rule) => /rm\s+-rf/.test(String(rule))), deny.join(' | '));
    }
  }

  // --- Checks 8/9 gegen das FRAGMENT: genau ein Owner je Flaeche, korrekte Event-Zuordnung.
  let fragment = null;
  try {
    fragment = renderSettingsFragment(root);
  } catch (error) {
    loud.push(`renderSettingsFragment — nicht ausfuehrbar: ${String(error?.message || error)}`);
  }
  if (fragment) {
    const groups = fragment.hooks || {};
    const commands = Object.values(groups).flatMap((list) => list.flatMap((group) => group.hooks.map((entry) => entry.command)));
    const postBash = (groups.PostToolUse || []).filter((group) => /Bash/.test(group.matcher || ''));
    must('Check 8a: genau eine PostToolUse-Gruppe deckt Bash ab', postBash.length === 1, `${postBash.length} Gruppen`);
    must(
      'Check 8b: alle Fragment-Kommandos zeigen auf den Dispatcher-Shim',
      commands.length > 0 && commands.every((command) => /hooks[/\\]claudestack\.mjs/.test(command)),
      commands.join(' | '),
    );
    must(
      'Check 8c: das Fragment registriert keinen optionalen Hook (ADR-016)',
      !commands.some((command) => /hooks[/\\]optional[/\\]/.test(command)),
      'ein optionaler Hook erscheint im Fragment — er darf nur im Paket liegen, nicht registriert werden',
    );
    must(
      'Check 8d: das Fragment beansprucht PreToolUse:Bash nicht (C.3.1.2)',
      !(groups.PreToolUse || []).some((group) => /Bash/.test(group.matcher || '')),
      'der Dispatcher meldet einen Fremd-Mutator dort, er besetzt die Flaeche aber nicht',
    );
    // Die allow-Ausnahme fuer die Probe traegt NUR, solange die Probe nicht registriert ist.
    // Diese Kopplung wird geprueft, nicht vorausgesetzt: sonst genuegte ein Eintrag im Fragment,
    // um einen still Berechtigungen erteilenden Hook an den Bann vorbeizubringen.
    for (const allowed of permissionAllowAllowed.keys()) {
      must(
        `allow-Ausnahme traegt: ${allowed} ist nicht registriert`,
        !commands.some((command) => command.includes(path.posix.basename(allowed))),
        'die Datei darf permissionDecision:allow enthalten, weil sie nicht auf dem Hook-Pfad liegt — im Fragment registriert waere die Ausnahme unzulaessig',
      );
    }
    must(
      'Check 9: Hook-Events entsprechen dem Zielbild',
      JSON.stringify(Object.keys(groups)) === JSON.stringify(['PreToolUse', 'PostToolUse', 'PreCompact', 'SessionEnd']),
      Object.keys(groups).join(', '),
    );
    // Owner-Kollisionscheck: das eigene Fragment muss durch die eigene Diagnose kommen.
    const report = inspectSettings(fragment);
    must('Owner-Kollision: inspectSettings(Fragment) ok', report.ok === true, JSON.stringify(report.findings));
    must('Owner-Kollision: genau ein Bash-Output-Owner', report.summary.postToolBash === 1, `${report.summary.postToolBash}`);
  }

  // --- Registry gegen das Fragment: wer laut Registry Owner ist, muss der registrierte Hook sein.
  const owners = subject('config/context-surface-owners.json', 'json');
  if (owners) {
    const surfaces = owners.surfaces || {};
    const bash = surfaces.bash_output;
    must('Registry: Flaeche bash_output vorhanden', Boolean(bash), 'Eintrag fehlt');
    if (bash) {
      must('Registry: bash_output hat genau einen Owner', typeof bash.owner === 'string' && bash.owner.length > 0, JSON.stringify(bash.owner));
      must('Registry: bash_output verweist auf src/stack.mjs', bash.ownerPath === 'src/stack.mjs', String(bash.ownerPath));
    }
    const preGate = surfaces.bash_pre_execution_gate;
    if (preGate) {
      must(
        'Registry: bash_pre_execution_gate bleibt unbesetzt (C.3.1.2)',
        !preGate.ownerPath || !/src[/\\]stack\.mjs/.test(String(preGate.ownerPath)),
        `zeigt auf ${preGate.ownerPath} — der Dispatcher darf diese Flaeche nicht beanspruchen`,
      );
    }
    for (const [name, surface] of Object.entries(surfaces)) {
      must(`Registry: ${name} hat kein Owner-Array`, !Array.isArray(surface.owner), 'mehrere Owner auf einer Flaeche verletzen Gesetz I');
    }

    /*
     * Registry <-> Fragment, beidseitig. Befund A-3 der zweiten Abnahme: die Registry fuehrte
     * die Read-Flaeche mit owner:null und "optional_nicht_registriert", waehrend das Fragment
     * den Shim dort laengst registrierte. Die 60 bestehenden Checks liessen das durch, weil sie
     * die Registry nur strukturell pruefen. Diese Pruefung ist maschinenunabhaengig — sie
     * vergleicht zwei Artefakte des Pakets, nicht den Zustand einer Installation.
     */
    if (fragment) {
      const registrierteEvents = new Set();
      for (const [event, groups] of Object.entries(fragment.hooks || {})) {
        for (const group of groups) {
          for (const hook of group.hooks || []) {
            if (!/claudestack\.mjs/.test(hook.command || '')) continue;
            const matcher = group.matcher ? String(group.matcher) : '';
            for (const tool of (matcher ? matcher.split('|') : [''])) {
              registrierteEvents.add(tool ? `${event}:${tool}` : event);
            }
          }
        }
      }
      // Flaechen, die den Dispatcher nennen — als mutierenden Owner ODER als nicht mutierenden Registranten.
      const nenntDispatcher = (s) =>
        /src[/\\]stack\.mjs/.test(String(s.ownerPath || '')) ||
        (s.registrants || []).some((r) => /stack\.mjs/.test(String(r)));
      const deklarierteEvents = new Map();
      for (const [name, s] of Object.entries(surfaces)) {
        if (!nenntDispatcher(s)) continue;
        for (const ev of String(s.event || '').split(',').map((e) => e.trim()).filter(Boolean)) {
          deklarierteEvents.set(ev, name);
        }
      }

      // (a) Jedes deklarierte Ereignis muss im Fragment auch registriert sein.
      for (const [ev, name] of deklarierteEvents) {
        must(
          `Registry/Fragment: ${name} deklariert ${ev}`,
          registrierteEvents.has(ev),
          `die Registry nennt den Dispatcher fuer ${ev}, das Fragment registriert es aber nicht — die Registry beschreibt einen Zustand, den es nicht gibt`,
        );
      }

      // (b) Umgekehrt: jedes registrierte Ereignis braucht einen Registry-Eintrag.
      for (const reg of registrierteEvents) {
        must(
          `Registry/Fragment: ${reg} hat einen Registry-Eintrag`,
          deklarierteEvents.has(reg),
          `das Fragment registriert ${reg}, aber keine Flaeche der Registry nennt src/stack.mjs — wer bei einem Zwischenfall die Registry liest, findet den laufenden Hook nicht`,
        );
      }
    }
  }

  // --- Nativer Budget-Abgleich: die Dispatcher-Budgets muessen unter dem nativen Deckel liegen,
  // sonst schneidet Claude Code ab, bevor der Dispatcher ueberhaupt greift.
  const guard = subject('config/bash-pilot-reference.json', 'json');
  if (patch && guard) {
    const nativeCap = Number(patch.env?.BASH_MAX_OUTPUT_LENGTH ?? 0);
    must('Budget: nativer Deckel ist eine Zahl > 0', Number.isFinite(nativeCap) && nativeCap > 0, String(nativeCap));
    must(
      'Budget: Dispatcher-Ziel liegt unter dem nativen Deckel',
      DEFAULT_CONFIG.bash.targetOutputBytes < nativeCap,
      `${DEFAULT_CONFIG.bash.targetOutputBytes} >= ${nativeCap}`,
    );
    must(
      'Budget: Ausloeseschwelle liegt unter dem nativen Deckel',
      DEFAULT_CONFIG.bash.minInputBytes < nativeCap,
      `${DEFAULT_CONFIG.bash.minInputBytes} >= ${nativeCap} — der Dispatcher wuerde nie vor der nativen Kuerzung greifen`,
    );
    // Die Pilotwerte aus dem verworfenen Guard sind in die Dispatcher-Config uebernommen worden
    // (C.2.2). Der Abgleich haelt fest, dass sie dort auch bleiben.
    for (const key of ['minInputBytes', 'minSavingsBytes', 'minSavingsRatio']) {
      must(
        `Budget: Pilotwert ${key} uebernommen`,
        DEFAULT_CONFIG.bash[key] === guard[key],
        `Dispatcher ${DEFAULT_CONFIG.bash[key]} vs. Pilot ${guard[key]}`,
      );
    }
  }

  // --- Evidenzsperre (C.3.11 (1), ADR-017): Der Traeger dieses Pakets ist GPT56. Wo ein
  // Korrektheitsurteil aus derselben Quelle stammt, hat GPT56 sich selbst bewertet. Solche
  // Zeilen sind als self_assessment_risk zu markieren und duerfen keine Traeger-Entscheidung
  // allein tragen. Bis zur Abnahme war diese Sperre nur zugesagt, nicht implementiert (M-4).
  const TRAEGER = 'GPT56';
  const judgments = subject('scripts/judgments.json', 'json');
  if (judgments) {
    const rows = Object.entries(judgments.judgments ?? {});
    must('Evidenz: judgments.json enthaelt Zeilen', rows.length > 0, 'keine Eintraege');

    const ohneFeld = rows.filter(([, row]) => !('source_model' in row));
    must('Evidenz: jede Zeile fuehrt source_model', ohneFeld.length === 0, ohneFeld.map(([k]) => k).join(', '));

    // Markierung und Quelle muessen deckungsgleich sein - sonst ist die Sperre umgehbar,
    // indem man das Flag weglaesst.
    const falschMarkiert = rows.filter(([, row]) => (row.source_model === TRAEGER) !== (row.self_assessment_risk === true));
    must(
      'Evidenz: self_assessment_risk deckt sich mit source_model',
      falschMarkiert.length === 0,
      falschMarkiert.map(([k, v]) => `${k} (source_model=${v.source_model}, flag=${v.self_assessment_risk})`).join(', '),
    );

    // Die Sperre selbst: eine markierte Zeile darf nicht als Beleg einer Flaechenbesetzung
    // dieses Pakets auftauchen. Geprueft wird gegen die Owner-Registry.
    const markiert = new Set(rows.filter(([, row]) => row.self_assessment_risk === true).map(([key]) => key));
    const registry = subject('config/context-surface-owners.json', 'json');
    if (registry) {
      const flaechen = Object.entries(registry.surfaces ?? registry);
      const verletzungen = [];
      for (const [name, surface] of flaechen) {
        if (!surface || typeof surface !== 'object') continue;
        const belege = JSON.stringify(surface.evidence ?? surface.belege ?? '');
        for (const repo of markiert) {
          if (belege.includes(repo)) verletzungen.push(`${name} stuetzt sich auf ${repo}`);
        }
      }
      must(
        'Evidenz: keine Flaechenbesetzung stuetzt sich auf eine Selbstbewertung',
        verletzungen.length === 0,
        verletzungen.join(' | '),
      );
    }

    const erwartet = Number(String(judgments._hinweis?.befund ?? '').match(/^(\d+)/)?.[1] ?? NaN);
    if (Number.isFinite(erwartet)) {
      must(
        `Evidenz: Befundzahl stimmt (${markiert.size} markiert)`,
        markiert.size === erwartet,
        `_hinweis nennt ${erwartet}, gezaehlt ${markiert.size}`,
      );
    }
  }

  const scores = subject('scripts/scores100-v51.json', 'json');
  if (scores) {
    const liste = Array.isArray(scores.repositories) ? scores.repositories
      : Array.isArray(scores) ? scores : Object.values(scores).find(Array.isArray) ?? [];
    must('Evidenz: scores100-v51.json ist auswertbar', liste.length > 0, 'keine Repository-Liste gefunden');
    // C.3.11 (2): Absenz darf nicht als Strafe zaehlen - die Abdeckung steht als eigene Spalte
    // neben dem normierten Wert, sonst landen geprueft und ungeprueft auf demselben Score.
    const ohneAbdeckung = liste.filter((row) => row && typeof row === 'object'
      && !('abdeckung_anteil' in row) && !('coverage' in row));
    must(
      'Evidenz: jede Score-Zeile weist ihre Abdeckung aus',
      ohneAbdeckung.length === 0,
      `${ohneAbdeckung.length} Zeilen ohne Abdeckungsangabe`,
    );
  }

  // --- Byte-Deckel (L-7): bricht ab, wenn ueberschritten.
  for (const cap of byteCaps) {
    const absolute = path.join(root, cap.file);
    let size = null;
    try {
      size = fs.statSync(absolute).size;
    } catch {
      loud.push(`${cap.file} — nicht vorhanden, Byte-Deckel nicht pruefbar`);
      continue;
    }
    must(`Byte-Deckel: ${cap.file} <= ${cap.max} B (ist ${size} B)`, size <= cap.max, `${size} B ueberschreitet ${cap.max} B — ${cap.rule}`);
  }

  // --- Smoke im isolierten HOME: die CLI muss ohne jede Spur im echten Home laufen.
  const home = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TMPDIR || '/tmp'), 'claudestack-verify-'));
  try {
    const env = { ...process.env, HOME: home, CLAUDE_CONFIG_DIR: path.join(home, '.claude') };
    delete env.CLAUDE_TOKEN_STACK_CONFIG;
    const result = spawnSync(process.execPath, [path.join(root, 'bin', 'claudestack.mjs'), 'fragment'], {
      cwd: root, env, encoding: 'utf8', timeout: 30_000,
    });
    must('Smoke: claudestack fragment laeuft im isolierten HOME', result.status === 0, `exit ${result.status}: ${(result.stderr || '').trim()}`);
    must('Smoke: fragment schreibt nichts nach stderr', (result.stderr || '') === '', (result.stderr || '').trim());
    must('Smoke: isoliertes HOME bleibt unberuehrt', !fs.existsSync(path.join(home, '.claude')), 'die CLI hat im isolierten HOME geschrieben');
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
}

// Das Ausgabeformat wird beim Aufruf gepinnt (--test-reporter=tap), nicht geraten: Node 24 nutzt
// ohne TTY den spec-Reporter ("ℹ tests 4"), waehrend dieser Parser TAP erwartet ("# tests 4").
// Der geerbte Parser hat unter Node 24 deshalb nie gezaehlt — er scheiterte still an einem
// Formatwechsel und meldete observed_count: null. Fail-closed, aber ohne erkennbaren Grund;
// deshalb traegt das Ergebnis jetzt eine Begruendung.
function parseTapSummary(stdout) {
  const values = {};
  let duplicate = false;
  for (const match of stdout.matchAll(/^# (tests|pass|fail|suites) (\d+)$/gm)) {
    if (Object.hasOwn(values, match[1])) duplicate = true;
    values[match[1]] = Number(match[2]);
  }
  const found = Object.hasOwn(values, 'tests');
  const valid = !duplicate
    && values.tests === expectedTestCount
    && values.tests > 0
    && values.pass === values.tests
    && values.fail === 0;
  let reason = null;
  if (!found) reason = 'keine TAP-Zusammenfassung gefunden — Reporter-Format weicht ab, Zaehlung nicht moeglich';
  else if (duplicate) reason = 'mehrfache TAP-Zusammenfassung — Ausgabe nicht eindeutig';
  else if (values.tests !== expectedTestCount) reason = `${values.tests} Tests gelaufen, ${expectedTestCount} erwartet`;
  else if (values.fail !== 0) reason = `${values.fail} Tests fehlgeschlagen`;
  return {
    expected_count: expectedTestCount,
    observed_count: found ? values.tests : null,
    valid,
    reason,
  };
}

const preflight = inspectPackage();
runSemanticChecks();
const semanticFailures = checks.filter((check) => !check.ok);
const semanticOk = semanticFailures.length === 0 && loud.length === 0;

let postflight = null;
let tests = {
  skipped: true,
  reason: 'preflight_integrity_failed',
  exit_code: null,
  summary: [],
  expected_count: expectedTestCount,
  observed_count: null,
  summary_valid: false,
  stderr: '',
};
if (preflight.ok) {
  const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...preflight.testFiles], {
    cwd: root,
    encoding: 'utf8',
  });
  const tap = parseTapSummary(result.stdout || '');
  tests = {
    skipped: false,
    reason: tap.reason,
    exit_code: result.status,
    summary: (result.stdout || '').split(/\r?\n/).filter((line) => /# (tests|pass|fail|suites)/.test(line)),
    expected_count: tap.expected_count,
    observed_count: tap.observed_count,
    summary_valid: tap.valid,
    stderr: (result.stderr || result.error?.message || '').trim(),
  };
  postflight = inspectPackage();
}
const state = postflight || preflight;
const treeUnchanged = postflight ? preflight.fingerprint === postflight.fingerprint : null;
const report = {
  schema: 'claudestack.package-verification/v2',
  ok: preflight.ok
    && postflight?.ok === true
    && treeUnchanged
    && tests.exit_code === 0
    && tests.summary_valid
    && semanticOk,
  preflight: { ok: preflight.ok },
  postflight: { performed: postflight !== null, ok: postflight?.ok ?? null, tree_unchanged: treeUnchanged },
  required_files: { expected: required.length, missing: state.missing },
  json_parsed: state.parsedJson,
  json_errors: state.jsonErrors,
  delivered_regular_files: state.deliveredFiles.length,
  // Am Betriebsort vorgefundener Laufzeitzustand: von der Manifestpruefung ausgenommen,
  // aber sichtbar ausgewiesen. Am Entwicklungsstand ist die Liste leer.
  runtime_entries: state.runtimeEntries,
  forbidden_entries: state.forbiddenEntries,
  forbidden_files: state.forbiddenFiles,
  checksums: {
    expected_entries: state.deliveredFiles.length,
    entries: state.checksumEntries.length,
    missing_entries: state.checksumMissing,
    unexpected_entries: state.checksumUnexpected,
    errors: state.checksumErrors,
  },
  forbidden_patterns: state.forbiddenPatterns,
  child_process_allowlist: Object.fromEntries(childProcessAllowed),
  semantic: {
    ok: semanticOk,
    total: checks.length,
    passed: checks.length - semanticFailures.length,
    failures: semanticFailures.map((check) => `${check.name}${check.detail ? ` — ${check.detail}` : ''}`),
  },
  // Fail-loud (OPUS): nicht gelaufene Pruefungen sind keine bestandenen Pruefungen.
  missing_subjects: loud,
  tests,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (loud.length) {
  process.stderr.write('\nFEHLENDE PRUEFGEGENSTAENDE — diese Pruefungen sind NICHT bestanden, sondern gar nicht gelaufen:\n');
  for (const entry of loud) process.stderr.write(`  ! ${entry}\n`);
}
if (semanticFailures.length) {
  process.stderr.write('\nSEMANTIK-CHECKS FEHLGESCHLAGEN:\n');
  for (const check of semanticFailures) process.stderr.write(`  FAIL  ${check.name}${check.detail ? ` — ${check.detail}` : ''}\n`);
}
process.exitCode = report.ok ? 0 : 1;
