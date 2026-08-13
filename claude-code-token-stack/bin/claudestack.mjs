#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
// Nur fuer den canary-Unterbefehl: die Probe ist ein eigenstaendiges Skript und wird menschlich
// aufgerufen. Der Hook-Pfad (src/stack.mjs, hooks/claudestack.mjs) bleibt frei von Subprozessen —
// verify-package.mjs haelt das mit einer benannten Allowlist fest.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  capabilityFilePath,
  evaluateCanary,
  inspectSettings,
  loadConfig,
  processHookInput,
  pruneArtifacts,
  recoverArtifact,
  renderSettingsFragment,
} from '../src/stack.mjs';

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const commands = {
  doctor: [0, 1],
  fragment: [0, 0],
  recover: [1, 1],
  prune: [0, 0],
  canary: [0, 1],
  evidence: [0, 1],
  hook: [0, 0],
};
const usage = [
  'claudestack doctor [settings]',
  'claudestack fragment',
  'claudestack recover <id>',
  'claudestack prune',
  'claudestack canary [--status]',
  'claudestack evidence [tool]',
  'claudestack hook',
];

function writeJson(stream, value) {
  stream.write(`${JSON.stringify(value)}\n`);
}

function fail(code, message, exitCode) {
  writeJson(process.stderr, { schemaVersion: 1, ok: false, error: { code, message } });
  process.exitCode = exitCode;
}

function validArguments(args) {
  const range = commands[args[0]];
  const count = args.length - 1;
  return Boolean(range) && count >= range[0] && count <= range[1];
}

function configDirectory(env = process.env) {
  const configured = String(env.CLAUDE_CONFIG_DIR || '').trim();
  if (!configured) return path.join(os.homedir(), '.claude');
  if (configured === '~') return os.homedir();
  if (configured.startsWith('~/') || configured.startsWith(`~${path.sep}`)) {
    return path.resolve(os.homedir(), configured.slice(2));
  }
  return path.resolve(configured);
}

async function main(args) {
  if (!validArguments(args)) {
    fail('USAGE', usage.join('; '), 2);
    return;
  }

  try {
    const [command, operand] = args;
    if (command === 'doctor') {
      const file = operand ? path.resolve(operand) : path.join(configDirectory(), 'settings.json');
      const settings = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
        throw new Error(`Settings must be a JSON object: ${file}`);
      }
      const report = inspectSettings(settings);
      writeJson(process.stdout, report);
      if (!report.ok) process.exitCode = 1;
      return;
    }
    if (command === 'fragment') {
      writeJson(process.stdout, renderSettingsFragment(packageRoot));
      return;
    }
    if (command === 'recover') {
      writeJson(process.stdout, await recoverArtifact(operand));
      return;
    }
    if (command === 'prune') {
      const removed = pruneArtifacts({ config: loadConfig() });
      writeJson(process.stdout, { schemaVersion: 1, ok: true, removed });
      return;
    }
    if (command === 'canary') {
      const config = loadConfig();
      const file = capabilityFilePath(config);
      // --status liest nur den vorhandenen Record; ohne Flag laeuft die Probe neu.
      if (operand === '--status') {
        const verdict = evaluateCanary(config);
        writeJson(process.stdout, { schemaVersion: 1, ok: verdict.ok, file: verdict.file, reason: verdict.reason });
        if (!verdict.ok) process.exitCode = 1;
        return;
      }
      if (operand) {
        fail('USAGE', 'claudestack canary [--status]', 2);
        return;
      }
      const probe = path.join(packageRoot, 'hooks', 'optional', 'claude-hook-capability-canary.mjs');
      if (!fs.existsSync(probe)) {
        // Fail-loud: ein fehlender Pruefgegenstand ist kein bestandener Test.
        fail('PROBE_MISSING', `capability probe not found: ${probe}`, 1);
        return;
      }
      // Exit-Semantik der Probe wird unveraendert durchgereicht: 0 = pass, 2 = beide fail,
      // 3 = unknown, 1 = Exception. Der Dispatcher bleibt ohne gueltigen Record in shadow.
      const result = spawnSync(process.execPath, [probe, '--output', file], {
        stdio: 'inherit', env: process.env, timeout: 120_000,
      });
      if (result.error) {
        fail('PROBE_FAILED', result.error.message, 1);
        return;
      }
      process.exitCode = result.status ?? 1;
      return;
    }
    if (command === 'evidence') {
      const read = (name) => {
        const file = path.join(packageRoot, 'scripts', name);
        if (!fs.existsSync(file)) throw new Error(`evidence file missing: ${file}`);
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      };
      // Beide Dateien tragen verschiedene Formen: judgments.judgments ist eine Map (Schluessel =
      // Repo), scores.repositories ein Array. Die Normalisierung ist deshalb explizit und wirft
      // bei unbekannter Form, statt still ein leeres Ergebnis zu liefern (L-6).
      const rowsFrom = (value, file) => {
        if (Array.isArray(value)) return value;
        if (value && typeof value === 'object') {
          return Object.entries(value).map(([key, entry]) => (
            entry && typeof entry === 'object' ? { id: key, ...entry } : { id: key, value: entry }
          ));
        }
        throw new Error(`unexpected shape in ${file}: ${typeof value}`);
      };
      const judgments = read('judgments.json');
      const scores = read('scores100-v51.json');
      const rows = rowsFrom(judgments.judgments ?? judgments, 'judgments.json');
      const scoreRows = rowsFrom(scores.repositories ?? scores, 'scores100-v51.json');
      if (!operand) {
        writeJson(process.stdout, {
          schemaVersion: 1,
          ok: true,
          judgments: rows.length,
          scores: scoreRows.length,
          // ADR-017: Fremdwerte gelten nur mit Modell und Stand. Wer die Zahlen ohne
          // source_model zitiert, wiederholt genau den Fehler, den D8 festhaelt.
          note: 'Werte sind versioniert zu zitieren (source_model, stand); Abdeckung getrennt lesen.',
        });
        return;
      }
      const match = (row) => JSON.stringify(row).toLowerCase().includes(operand.toLowerCase());
      writeJson(process.stdout, {
        schemaVersion: 1,
        ok: true,
        tool: operand,
        judgments: rows.filter(match),
        scores: scoreRows.filter(match),
      });
      return;
    }

    const output = await processHookInput(fs.readFileSync(0, 'utf8'));
    if (output) process.stdout.write(output);
  } catch (error) {
    fail('OPERATION_FAILED', error instanceof Error ? error.message : String(error), 1);
  }
}

await main(process.argv.slice(2));
