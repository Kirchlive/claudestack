#!/usr/bin/env node

import fs from 'node:fs';
import process from 'node:process';

import { processHookInput } from '../src/stack.mjs';

try {
  const output = await processHookInput(fs.readFileSync(0, 'utf8'));
  if (output) process.stdout.write(output);
} catch {
  // Claude Code hooks must fail open.
}
