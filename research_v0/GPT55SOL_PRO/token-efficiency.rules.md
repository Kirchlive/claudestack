# Token-efficient execution — Revision 3

These rules optimize completed-task cost and context quality, not the percentage removed from one tool result.

## 1. Prefix and configuration

- Keep root `CLAUDE.md` limited to stable repository-wide invariants. Put conditional rules in path-scoped files.
- Treat skill/plugin counts as inventory, not token measurements. Use `prefix-budget` and `/context` before removing or retaining a component.
- Load skills on demand. Prefer `name-only` or disabled overrides for rarely used entries when supported.
- Keep MCP servers project-scoped where practical. Do not connect/disconnect servers during a controlled measurement session.
- Keep native Tool Search enabled unless a measured client-specific reason requires otherwise.
- Change plugin/skill/config profiles between sessions, not halfway through an A/B run.

## 2. One owner per surface

- Exactly one component may rewrite or replace Bash input/output.
- Exactly one component may deny, replace, deduplicate, or structurally compress native Read results.
- Exactly one broad code index may answer architecture, ownership, call-path, or impact questions.
- Exactly one cross-session memory system and at most one API/history proxy may be active.
- Observer-only tools may coexist only when they do not repeatedly inject context or mutate the same state/output.
- Never treat two compressors as ordered ladder steps unless a single dispatcher owns and tests the complete sequence.

## 3. Native budgets before third-party compression

- Establish a native-default control arm before changing `MAX_MCP_OUTPUT_TOKENS`, `BASH_MAX_OUTPUT_LENGTH`, `TASK_MAX_OUTPUT_LENGTH`, response limits, or compaction thresholds.
- Use `native-token-limits.example.jsonc` only as a pilot profile.
- Stop or roll back when tighter limits increase incomplete answers, raw-recovery calls, repeated exploration, or failed verification.
- `bash-dump-guard` derives its output budgets from `BASH_MAX_OUTPUT_LENGTH`; do not maintain unrelated competing ceilings.

## 4. Read and retrieval routing

- For a known local change involving at most three files, use native `Grep`, `Glob`, and bounded `Read` slices.
- Do not issue an unbounded whole-file Read when a symbol, line range, heading, or search query answers the task.
- An unchanged same-range reread may be denied once. Use the existing context, request a different slice, or repeat exactly once to invoke the escape valve.
- Use the configured broad retrieval owner only for unknown ownership, architecture, call paths, impact, cross-service flow, or broad discovery.
- SigMap may be the broad owner, or it may be restricted to `evidence`/`verify`; do not use it as a second broad explorer beside CodeGraph or codebase-memory.
- After broad discovery, write confirmed paths, symbols, decisions, and verification obligations to `.claude/TASK-STATE.md`; then clear or compact before implementation when the exploration payload is no longer needed.

## 5. Bash and output handling

- Narrow a command before execution. Avoid full repository dumps, unlimited recursive searches, whole log streams, complete dependency trees, and unbounded JSON when a filtered query answers the task.
- Add `# token-raw` to a Bash command when exact formatting or every line is required.
- Failures, interrupted commands, nonempty stderr, patches, security scans, migrations, infrastructure changes, cryptographic output, and null-delimited data are exact by default.
- A native truncation marker with a recoverable full-output path is already a boundary; do not compress it again.
- Lossy output replacement requires a successfully written private raw archive. Otherwise pass through or apply mandatory secret redaction only.
- Do not run RTK, Snip, lowfat, OMNI, Squeez, semtrim, quiet-bash, nestor-lean, token-saver, and `bash-dump-guard` as simultaneous Bash hooks. Compare them in separate profiles.

## 6. Session economy and handoff

- Maintain `.claude/TASK-STATE.md` as the authoritative, short handoff. Include only current goal, confirmed facts, decisions, remaining work, verification contract, and next action.
- Treat the automatic session checkpoint as recovery evidence, not an authoritative summary.
- At a context-pressure warning, finish the current coherent step, update Task State, and prefer `/clear` or native compact before an unrelated exploration branch.
- Default session governance is advisory. Blocking rotation, transcript surgery, rolling summaries, and history proxies require separate A/B arms.
- Do not inject full old transcripts, dashboards, repo maps, or checkpoints at SessionStart.

## 7. Assistant and implementation output

- Answer directly. Do not restate the task, repeat unchanged tool output, or emit progress prose that does not change the next decision.
- Preserve explanations needed for safety, architecture, uncertainty, verification, and handoff. Terseness is not allowed to reduce correctness.
- Prefer edits over whole-file rewrites when the edit tool can express the change safely.

## 8. Build ladder

Before adding code or a dependency, check in order:

1. Does this need to exist?
2. Is the capability already present in the repository?
3. Can the standard library do it safely?
4. Can the native platform or framework do it?
5. Can an already-installed dependency do it?
6. Is a one-line or declarative solution sufficient?
7. Implement the smallest correct version that passes the verification contract.

The ladder never overrides security, data integrity, accessibility, backward compatibility, migrations, tests, or explicit acceptance criteria.

## 9. Measurement contract

For every candidate profile record:

- uncached input,
- cache creation,
- cache reads and hit ratio,
- output tokens,
- active context before/after relevant calls,
- tool calls and repeated/recovery calls,
- latency and hook overhead,
- task success, test/build result, completeness, and hallucinations,
- raw retrievals and user interventions.

A profile wins only when end-to-end consumption falls without lower task quality.
