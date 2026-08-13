#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
HOOK_DIR="$CLAUDE_DIR/hooks"
LIB_DIR="$HOOK_DIR/lib"
STAMP="$(date +%Y%m%d-%H%M%S)"
RUN_PROBE=0

usage() {
  cat <<'USAGE'
Usage: ./install-token-stack-hooks.sh [--probe]

Installs the Revision-3 hook files and conservative configs, runs local
self-tests, and prints the settings.json block. It deliberately does not merge
settings.json because existing output/read owners must be audited first.

  --probe  Run two isolated Claude calls to test updatedInput and
           updatedToolOutput for the current Claude executable fingerprint.
USAGE
}

for arg in "$@"; do
  case "$arg" in
    --probe) RUN_PROBE=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $arg" >&2; usage >&2; exit 2 ;;
  esac
done

command -v node >/dev/null 2>&1 || { echo "Node.js >= 18 is required." >&2; exit 1; }
NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
(( NODE_MAJOR >= 18 )) || { echo "Node.js >= 18 is required; found $(node --version)." >&2; exit 1; }

mkdir -p "$HOOK_DIR" "$LIB_DIR"
chmod 700 "$CLAUDE_DIR" "$HOOK_DIR" "$LIB_DIR" 2>/dev/null || true

FILES=(
  "bash-dump-guard.mjs:$HOOK_DIR/bash-dump-guard.mjs:700"
  "claude-hook-capability-canary.mjs:$HOOK_DIR/claude-hook-capability-canary.mjs:700"
  "prefix-budget.mjs:$HOOK_DIR/prefix-budget.mjs:700"
  "read-context-guard.mjs:$HOOK_DIR/read-context-guard.mjs:700"
  "read-slice-guard.mjs:$HOOK_DIR/read-slice-guard.mjs:600"
  "reread-guard.mjs:$HOOK_DIR/reread-guard.mjs:600"
  "session-economy.mjs:$HOOK_DIR/session-economy.mjs:700"
  "lib/token-stack-shared.mjs:$LIB_DIR/token-stack-shared.mjs:600"
  "bash-dump-guard.config.json:$CLAUDE_DIR/bash-dump-guard.config.json:600"
  "prefix-budget.config.json:$CLAUDE_DIR/prefix-budget.config.json:600"
  "read-context-guard.config.json:$CLAUDE_DIR/read-context-guard.config.json:600"
  "session-economy.config.json:$CLAUDE_DIR/session-economy.config.json:600"
)

for spec in "${FILES[@]}"; do
  IFS=: read -r source target mode <<<"$spec"
  if [[ -e "$target" ]]; then
    cp -p "$target" "$target.bak.$STAMP"
    echo "Backup: $target.bak.$STAMP"
  fi
  install -m "$mode" "$SOURCE_DIR/$source" "$target"
done

node "$HOOK_DIR/bash-dump-guard.mjs" --self-test
node "$HOOK_DIR/claude-hook-capability-canary.mjs" --self-test
node "$HOOK_DIR/prefix-budget.mjs" --self-test
node "$HOOK_DIR/read-context-guard.mjs" --self-test
node "$HOOK_DIR/session-economy.mjs" --self-test

SETTINGS_FILE="$CLAUDE_DIR/settings.json"
if [[ -f "$SETTINGS_FILE" ]]; then
  CONFLICTS="$(grep -Ein 'rtk|squeez|snip|lowfat|omni|semtrim|quiet-bash|token-saver|nestor-lean|harnesstrim|token-crunch|agentone|output-trim' "$SETTINGS_FILE" || true)"
  if [[ -n "$CONFLICTS" ]]; then
    echo >&2
    echo "Potential overlapping token/output owners found in $SETTINGS_FILE:" >&2
    echo "$CONFLICTS" >&2
    echo "Audit and disable overlapping Bash/Read mutation hooks before merging the block below." >&2
  fi
fi

CAPABILITY_FILE="$CLAUDE_DIR/bash-dump-guard-capabilities.json"
if (( RUN_PROBE == 1 )); then
  if command -v claude >/dev/null 2>&1; then
    set +e
    node "$HOOK_DIR/claude-hook-capability-canary.mjs" --output "$CAPABILITY_FILE"
    PROBE_RC=$?
    set -e
    case "$PROBE_RC" in
      0) echo "Live capability probe completed with at least one usable mutation path." ;;
      2) echo "Both mutation paths failed. bash-dump-guard remains shadow-only." >&2 ;;
      3) echo "At least one capability remained unknown. bash-dump-guard remains shadow-only." >&2 ;;
      *) echo "Capability probe failed operationally (exit $PROBE_RC)." >&2 ;;
    esac
  else
    echo "Claude CLI not found; live capability probe skipped." >&2
  fi
else
  echo "Live capability probe not run. bash-dump-guard hookActivation=auto stays shadow-only until a matching canary pass exists."
fi

cat <<JSON

Installed Revision-3 files. Merge the following block into:
  $SETTINGS_FILE

Do not keep a second mutating Bash owner or a second mutating Read owner.
Matching hooks are not a compression ladder and may run concurrently.

$(cat "$SOURCE_DIR/claude-code-hooks.example.json")

Recommended next checks:
  node "$HOOK_DIR/prefix-budget.mjs" --report
  node "$HOOK_DIR/read-context-guard.mjs" --status
  node "$HOOK_DIR/session-economy.mjs" --status
  node "$HOOK_DIR/bash-dump-guard.mjs" --status

Optional live capability probe:
  node "$HOOK_DIR/claude-hook-capability-canary.mjs" --output "$CAPABILITY_FILE"

The native limit pilot is in:
  $SOURCE_DIR/native-token-limits.example.jsonc
JSON
