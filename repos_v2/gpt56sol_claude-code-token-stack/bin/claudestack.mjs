#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
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
  hook: [0, 0],
};
const usage = [
  'claudestack doctor [settings]',
  'claudestack fragment',
  'claudestack recover <id>',
  'claudestack prune',
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

    const output = await processHookInput(fs.readFileSync(0, 'utf8'));
    if (output) process.stdout.write(output);
  } catch (error) {
    fail('OPERATION_FAILED', error instanceof Error ? error.message : String(error), 1);
  }
}

await main(process.argv.slice(2));
