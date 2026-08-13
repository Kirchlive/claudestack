import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  handleHook,
  inspectSettings,
  processHookInput,
  recoverArtifact,
  renderSettingsFragment,
} from '../src/stack.mjs';

const baseConfig = {
  schemaVersion: 1,
  mode: 'enforce',
  bash: {
    enabled: true,
    minInputBytes: 1_000,
    targetOutputBytes: 700,
    minSavingsBytes: 200,
    minSavingsRatio: 0.15,
    headLines: 8,
    tailLines: 8,
  },
  read: {
    enabled: true,
    maxWholeFileBytes: 1_000,
    denyOnceSeconds: 180,
    hashMaxBytes: 1_000_000,
  },
  retention: { days: 7, maxArtifactBytes: 2_000_000 },
};

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-token-stack-test-'));
  const stateDir = path.join(root, 'state');
  return {
    root,
    stateDir,
    options: { config: structuredClone(baseConfig), stateDir, cwd: root, now: () => 1_800_000_000_000 },
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

function bashEvent(stdout, overrides = {}) {
  return {
    session_id: 'session/test/../unsafe',
    tool_use_id: 'bash-1',
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    cwd: '/tmp',
    tool_input: { command: 'npm test -- --verbose' },
    tool_response: {
      stdout,
      stderr: '',
      interrupted: false,
      isImage: false,
      exitCode: 0,
      ...overrides,
    },
  };
}

test('malformed stdin fails open with empty stdout', async () => {
  const f = fixture();
  try {
    assert.equal(await processHookInput('{broken', f.options), '');
  } finally {
    f.cleanup();
  }
});

test('small Bash output passes through without hook result', async () => {
  const f = fixture();
  try {
    assert.equal(await handleHook(bashEvent('12 tests passed'), f.options), null);
    assert.equal(fs.existsSync(f.stateDir), false);
  } finally {
    f.cleanup();
  }
});

test('large Bash output is shape-preserving and recoverable', async () => {
  const f = fixture();
  try {
    const raw = Array.from({ length: 250 }, (_, i) => `case ${i}: ${'noise '.repeat(8)}`).join('\n');
    const result = await handleHook(bashEvent(raw), f.options);
    const updated = result.hookSpecificOutput.updatedToolOutput;
    assert.equal(result.hookSpecificOutput.hookEventName, 'PostToolUse');
    assert.equal(updated.stderr, '');
    assert.equal(updated.exitCode, 0);
    assert.ok(updated.stdout.length < raw.length * 0.85);
    assert.doesNotMatch(JSON.stringify(result), /permissionDecision/);

    const id = updated.stdout.match(/raw:([a-f0-9]{24})/)?.[1];
    assert.ok(id, 'raw artifact id missing');
    const recovered = await recoverArtifact(id, f.options);
    assert.equal(recovered.toolResponse.stdout, raw);

    const artifact = path.join(f.stateDir, 'artifacts', `${id}.json`);
    assert.equal(fs.statSync(f.stateDir).mode & 0o777, 0o700);
    assert.equal(fs.statSync(artifact).mode & 0o777, 0o600);
    assert.equal(path.relative(f.stateDir, artifact).startsWith('..'), false);
  } finally {
    f.cleanup();
  }
});

test('recovery rejects a tampered raw artifact', async () => {
  const f = fixture();
  try {
    const raw = Array.from({ length: 250 }, (_, i) => `case ${i}: ${'noise '.repeat(8)}`).join('\n');
    const result = await handleHook(bashEvent(raw), f.options);
    const id = result.hookSpecificOutput.updatedToolOutput.stdout.match(/raw:([a-f0-9]{24})/)?.[1];
    const artifact = path.join(f.stateDir, 'artifacts', `${id}.json`);
    const value = JSON.parse(fs.readFileSync(artifact, 'utf8'));
    value.toolResponse.stdout = 'tampered';
    fs.writeFileSync(artifact, `${JSON.stringify(value)}\n`);
    await assert.rejects(() => recoverArtifact(id, f.options), /integrity/i);
  } finally {
    f.cleanup();
  }
});

test('native spill markers and exact-output commands are not recompressed', async () => {
  const f = fixture();
  try {
    const native = '... [10000 characters truncated] ...\nFull output saved to /tmp/tool-results/a.log';
    assert.equal(await handleHook(bashEvent(native), f.options), null);
    const patch = bashEvent('diff --git a/a b/a\n' + '+x\n'.repeat(1_000));
    patch.tool_input.command = 'git diff HEAD~1';
    assert.equal(await handleHook(patch, f.options), null);
  } finally {
    f.cleanup();
  }
});

test('secrets are redacted even when failure output otherwise passes exactly', async () => {
  const f = fixture();
  try {
    const event = bashEvent('ANTHROPIC_API_KEY=sk-ant-api03-abcdefghijklmnopqrstuv');
    event.tool_response.exitCode = 1;
    event.tool_response.stderr = 'request failed';
    const result = await handleHook(event, f.options);
    const updated = result.hookSpecificOutput.updatedToolOutput;
    assert.doesNotMatch(updated.stdout, /sk-ant-api03/);
    assert.match(updated.stdout, /\[REDACTED\]/);
    assert.equal(updated.stderr, 'request failed');
  } finally {
    f.cleanup();
  }
});

test('shadow mode records no raw artifact and emits no mutation', async () => {
  const f = fixture();
  f.options.config.mode = 'shadow';
  try {
    const raw = 'log line\n'.repeat(1_000);
    assert.equal(await handleHook(bashEvent(raw), f.options), null);
    assert.equal(fs.existsSync(path.join(f.stateDir, 'artifacts')), false);
  } finally {
    f.cleanup();
  }
});

test('off mode is a complete Bash bypass, including apparent secrets', async () => {
  const f = fixture();
  f.options.config.mode = 'off';
  try {
    const raw = `ANTHROPIC_API_KEY=sk-ant-${'x'.repeat(32)}\n${'payload\n'.repeat(800)}`;
    assert.equal(await handleHook(bashEvent(raw), f.options), null);
    assert.equal(fs.existsSync(f.stateDir), false);
  } finally {
    f.cleanup();
  }
});

test('shadow and off modes never deny Read', async () => {
  const f = fixture();
  try {
    const file = path.join(f.root, 'large.txt');
    fs.writeFileSync(file, 'x'.repeat(5_000));
    for (const mode of ['shadow', 'off']) {
      f.options.config.mode = mode;
      const event = {
        session_id: `read-${mode}`, hook_event_name: 'PreToolUse', tool_name: 'Read',
        tool_input: { file_path: file }, cwd: f.root,
      };
      assert.equal(await handleHook(event, f.options), null, `${mode} must not deny`);
    }
  } finally {
    f.cleanup();
  }
});

test('large whole-file Read is denied once, then allowed as an escape valve', async () => {
  const f = fixture();
  try {
    const file = path.join(f.root, 'large.ts');
    fs.writeFileSync(file, 'export const value = 1;\n'.repeat(200));
    const event = {
      session_id: 'read-session', hook_event_name: 'PreToolUse', tool_name: 'Read',
      tool_input: { file_path: file }, cwd: f.root,
    };
    const first = await handleHook(event, f.options);
    assert.equal(first.hookSpecificOutput.permissionDecision, 'deny');
    assert.match(first.hookSpecificOutput.permissionDecisionReason, /offset.*limit/i);
    assert.equal(await handleHook(event, f.options), null);
  } finally {
    f.cleanup();
  }
});

test('unchanged reread is denied once after a successful Read', async () => {
  const f = fixture();
  try {
    const file = path.join(f.root, 'small.ts');
    fs.writeFileSync(file, 'export const value = 1;\n');
    const common = { session_id: 'reread', tool_name: 'Read', tool_input: { file_path: file }, cwd: f.root };
    await handleHook({ ...common, hook_event_name: 'PostToolUse', tool_response: { content: 'x' } }, f.options);
    const first = await handleHook({ ...common, hook_event_name: 'PreToolUse' }, f.options);
    assert.equal(first.hookSpecificOutput.permissionDecision, 'deny');
    assert.match(first.hookSpecificOutput.permissionDecisionReason, /unchanged/i);
    assert.equal(await handleHook({ ...common, hook_event_name: 'PreToolUse' }, f.options), null);
  } finally {
    f.cleanup();
  }
});

test('doctor detects current RTK + Squeez input-owner collision', () => {
  const settings = {
    hooks: {
      PreToolUse: [
        { matcher: 'Bash', hooks: [{ type: 'command', command: 'tokless rtk-hook claude' }] },
        { matcher: 'Bash', hooks: [{ type: 'command', command: 'bash ~/.claude/squeez/hooks/pretooluse.sh' }] },
      ],
    },
  };
  const report = inspectSettings(settings);
  assert.equal(report.ok, false);
  assert.ok(report.findings.some((f) => f.code === 'MULTIPLE_BASH_INPUT_OWNERS' && f.severity === 'error'));
});

test('doctor evaluates regex Bash matchers when finding owner collisions', () => {
  const settings = {
    hooks: {
      PreToolUse: [
        { matcher: '^(Bash|Read)$', hooks: [{ type: 'command', command: 'tokless rtk-hook claude' }] },
        { matcher: 'Bash.*', hooks: [{ type: 'command', command: 'bash ~/.claude/squeez/hooks/pretooluse.sh' }] },
      ],
    },
  };
  const report = inspectSettings(settings);
  assert.equal(report.ok, false);
  assert.equal(report.summary.preToolBash, 2);
  assert.ok(report.findings.some((f) => f.code === 'MULTIPLE_BASH_INPUT_OWNERS'));
});

test('doctor treats wildcard and comma-separated hook matchers like Claude Code', () => {
  const settings = {
    hooks: {
      PreToolUse: [
        { matcher: '*', hooks: [{ type: 'command', command: 'tokless rtk-hook claude' }] },
        { matcher: 'Read, Bash', hooks: [{ type: 'command', command: 'bash ~/.claude/squeez/hooks/pretooluse.sh' }] },
      ],
    },
  };
  const report = inspectSettings(settings);
  assert.equal(report.ok, false);
  assert.equal(report.summary.preToolBash, 2);
  assert.ok(report.findings.some((f) => f.code === 'MULTIPLE_BASH_INPUT_OWNERS'));
});

test('doctor ignores regex matchers that do not match Bash', () => {
  const settings = {
    hooks: {
      PreToolUse: [
        { matcher: '^(Read|Grep)$', hooks: [{ type: 'command', command: 'tokless rtk-hook claude' }] },
        { matcher: 'Read', hooks: [{ type: 'command', command: 'bash ~/.claude/squeez/hooks/pretooluse.sh' }] },
      ],
    },
  };
  const report = inspectSettings(settings);
  assert.equal(report.ok, true);
  assert.equal(report.summary.preToolBash, 0);
});

test('doctor reports malformed hook matchers without crashing', () => {
  const settings = {
    hooks: {
      PreToolUse: [{
        matcher: '^(Bash',
        hooks: [{ type: 'command', command: 'tokless rtk-hook claude' }],
      }],
    },
  };
  const report = inspectSettings(settings);
  assert.equal(report.ok, false);
  assert.ok(report.findings.some((f) =>
    f.code === 'INVALID_HOOK_MATCHER' && f.severity === 'error'));
});

test('doctor audits legacy and absolute paths on non-Bash hook matchers', () => {
  const settings = {
    hooks: {
      PreToolUse: [{
        matcher: 'mcp__squeez__retrieve',
        hooks: [{ type: 'command', command: 'node /Users/example/hooks/ladder-retrieve-gate.mjs' }],
      }],
    },
  };
  const report = inspectSettings(settings);
  assert.ok(report.findings.some((f) => f.code === 'LEGACY_LADDER_HOOK'));
  assert.ok(report.findings.some((f) => f.code === 'ABSOLUTE_MACHINE_PATH'));
});

test('doctor recognizes the disambiguated GPT55 output-reducer identity', () => {
  const settings = {
    hooks: {
      PostToolUse: [
        { matcher: 'Bash', hooks: [{ type: 'command', command: 'node hooks/claudestack.mjs' }] },
        { matcher: 'Bash', hooks: [{ type: 'command', command: 'node refs/gpt55-posttooluse-output-reducer-v3.mjs' }] },
      ],
    },
  };
  const report = inspectSettings(settings);
  assert.equal(report.ok, false);
  assert.ok(report.findings.some((f) => f.code === 'MULTIPLE_BASH_OUTPUT_OWNERS'));
});

test('generated fragment contains one dispatcher command and no third-party mutator', () => {
  const fragment = renderSettingsFragment('/opt/claude-token-stack');
  const commands = Object.values(fragment.hooks).flatMap((groups) =>
    groups.flatMap((group) => group.hooks.map((hook) => hook.command)),
  );
  assert.ok(commands.length >= 2);
  assert.ok(commands.every((command) => command === 'node "/opt/claude-token-stack/hooks/claudestack.mjs"'));
  assert.doesNotMatch(JSON.stringify(fragment), /rtk-hook|squeez|omni|tokf/i);
});
