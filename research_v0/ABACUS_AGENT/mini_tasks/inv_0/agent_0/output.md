# Discovery Shard 1 — New GitHub Repos for Claude Code Token Optimization & Context Compression

**Agent:** agent_0 (Discovery shard 1)
**Date:** 2026-08-13
**Scope:** Queries around "claude code token optimization", "claude code context compression", "claude code token saving", "claude code efficiency". Coverage bound: first 2 result pages per query (~40 results total) — reached. No further paging performed.
**Method:** Web search across the 4 query families (multiple phrasings per family to reach the 2-page bound). All repos below were checked against the user-provided exclusion list (130 repos) and are **not** in it.

---

## Discovered Repos (not in user-provided lists)

### Token Optimization / Compression (directly relevant)

| Owner/Repo | One-line reason |
|---|---|
| `nadimtuhin/claude-token-optimizer` | CLI (`cto`) restructures project docs into a lean 4-file format to cut startup token load up to ~90%; includes token-guard hooks. |
| `drona23/claude-token-efficient` | Drop-in `CLAUDE.md` enforcing terse output; claims 50–75% output-token reduction by suppressing sycophantic preamble. |
| `ooples/token-optimizer-mcp` | MCP server using a per-project knowledge graph to avoid re-deriving findings; "zero-turn" cached refusals to cut re-reads. |
| `alexgreensh/token-optimizer` | Broad plugin compressing 8 surfaces (bash output, search results, file re-reads via diffs) with smart compaction + quality scoring. |
| `KINGSTAR-OMEGA/claude-token-optimizer` | Skills pack ("Antigravity Protocol", JSON-only mode) forcing structured/zero-English output for pipelines; up to ~93% savings claims. |
| `aerovato/magic-compact` | "Lossless" compaction plugin: summarizes assistant turns, prunes bulky tool I/O, preserves user messages verbatim. |
| `awesomo913/Claude-Token-Saver` | Scans project to build a snippet library so Claude reads only relevant snippets instead of full files (~88% input-token savings claim). |
| `egorfedorov/claude-context-optimizer` | Telemetry tool identifying "wasted" tokens (files read but unused) and `.contextignore` rules to reduce redundant context. |
| `dannysarco/claude-token-optimizer` | Local web app token counter using Anthropic's tokenizer with prompt-optimization UI and cost analysis. |
| `jee599/contextzip` | Compresses CLI stdout (60–90%) and compacts JSONL session history in `~/.claude/projects/`. |
| `muratcankoylan/agent-skills-for-context-engineering` | Collection of context-engineering skills (compression, tool-output offloading, memory) with LLM-as-judge evaluation. |
| `johnpsasser/claude-code-prompt-optimizer` | Hook that rewrites vague prompts into structured, comprehensive instructions to reduce back-and-forth turns. |

### Efficiency / Workflow / Best-Practice (indirectly relevant)

| Owner/Repo | One-line reason |
|---|---|
| `shanraisshan/claude-code-best-practice` | Curated "missing manual" of Claude Code workflows, context management, and configuration patterns. |
| `ykdojo/claude-code-tips` | Practical tips for context hygiene, model selection, and token-efficient session discipline. |
| `affaan-m/everything-claude-code` (a.k.a. `affaan-m/ecc`) | Comprehensive agent harness (135+ agents, 119 skills) with research-first pattern and token-optimization docs. |
| `obra/superpowers` | TDD-enforced development methodology that prevents expensive iterative "guessing" loops. |
| `gsd-build/get-shit-done` | Spec-driven system breaking work into atomic tasks with fresh context windows to prevent context drift. |
| `hesreallyhim/awesome-claude-code` | Definitive curated directory of Claude Code plugins/hooks/skills — key discovery hub. |
| `valorisa/Claude-Skills` | Skills suite including `rescue-tokens` and `token-optimization` patterns for cache/context management. |
| `codeaashu/claude-code` | Mirror of leaked Claude Code source for studying internal tool/command/compression architecture. |
| `rohitg00/awesome-claude-code-toolkit` | Curated toolkit of Claude Code efficiency tools (cost tracking, hooks, workflows). |
| `quemsah/awesome-claude-plugins` | Curated list of Claude plugins incl. token-saving and context-compression tools. |
| `ComposioHQ/awesome-claude-skills` | Curated directory of Claude skills (incl. token-efficient workflows). |

---

## Notes on Duplicates / Forks / Overlaps

- **`affaan-m/everything-claude-code` and `affaan-m/ecc`** — almost certainly the **same repository** (ECC = "Everything Claude Code"); listed once above.
- **`KINGSTAR-OMEGA/claude-token-optimizer` vs `nadimtuhin/claude-token-optimizer`** — different owners, both named "claude-token-optimizer"; distinct projects (skills pack vs. doc-structure CLI). Not forks.
- **Curated-list overlap:** `hesreallyhim/awesome-claude-code`, `rohitg00/awesome-claude-code-toolkit`, `quemsah/awesome-claude-plugins`, `ComposioHQ/awesome-claude-skills` are all **curated directories** (not tools) — overlapping content; treat as discovery resources, not stack components.
- **`valorisa/Claude-Skills` vs `muratcankoylan/agent-skills-for-context-engineering`** — both skills collections; different focus (general skills vs. context-engineering).
- **`codeaashu/claude-code`** — a **mirror of leaked Claude Code source**, not a token-saving tool; relevant only for studying internal architecture.

## Honest Caveats

- **Star counts: unknown** — not reliably retrievable from the search results; left as `unknown` per instructions.
- Several repos (e.g., `drona23/claude-token-efficient`, `KINGSTAR-OMEGA/claude-token-optimizer`) make **percentage savings claims that are community-reported and not independently verified**; treat as directional.
- `codeaashu/claude-code` has **no clear token-saving function** — it is a source mirror; flagged honestly.
- The curated "awesome" lists are **not token-saving tools themselves**; they are discovery aids.

## Files Written

- `/home/ubuntu/mini_tasks/inv_0/agent_0/output.md` — this deliverable.
- `/home/ubuntu/mini_tasks/inv_0/agent_0/exclusion_list.txt` — 130 user-provided repos used for filtering.
- `/home/ubuntu/mini_tasks/inv_0/agent_0/discovered_raw.txt` — raw discovered repo list before filtering.
