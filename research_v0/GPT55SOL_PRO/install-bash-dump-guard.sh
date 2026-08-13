#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
HOOK_DIR="$CLAUDE_DIR/hooks"
CONFIG_FILE="$CLAUDE_DIR/bash-dump-guard.config.json"
CAPABILITY_FILE="$CLAUDE_DIR/bash-dump-guard-capabilities.json"
GUARD_FILE="$HOOK_DIR/bash-dump-guard.mjs"
CANARY_FILE="$HOOK_DIR/claude-hook-capability-canary.mjs"
STAMP="$(date +%Y%m%d-%H%M%S)"
RUN_PROBE=0

usage() {
  cat <<'USAGE'
Usage: ./install-bash-dump-guard.sh [--probe]

Installs bash-dump-guard v3. In aligned mode its target and hard budget are
derived from BASH_MAX_OUTPUT_LENGTH, avoiding a second independent ceiling.

  --probe  After the local self-test, run two small live Claude calls in an
           isolated temporary project to verify updatedInput/updatedToolOutput.
           Without --probe, hookActivation=auto remains safely in shadow mode.
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

mkdir -p "$HOOK_DIR"
chmod 700 "$CLAUDE_DIR" "$HOOK_DIR" 2>/dev/null || true

for target in "$GUARD_FILE" "$CANARY_FILE" "$CONFIG_FILE"; do
  if [[ -e "$target" ]]; then
    cp -p "$target" "$target.bak.$STAMP"
    echo "Backup: $target.bak.$STAMP"
  fi
done

install -m 700 "$SOURCE_DIR/bash-dump-guard.mjs" "$GUARD_FILE"
install -m 700 "$SOURCE_DIR/claude-hook-capability-canary.mjs" "$CANARY_FILE"
install -m 600 "$SOURCE_DIR/bash-dump-guard.config.json" "$CONFIG_FILE"

node "$GUARD_FILE" --self-test
node "$CANARY_FILE" --self-test

if (( RUN_PROBE == 1 )); then
  command -v claude >/dev/null 2>&1 || {
    echo "Claude CLI not found; guard installed but live capability probe skipped." >&2
    RUN_PROBE=0
  }
fi

if (( RUN_PROBE == 1 )); then
  set +e
  node "$CANARY_FILE" --output "$CAPABILITY_FILE"
  PROBE_RC=$?
  set -e
  case "$PROBE_RC" in
    0) echo "Live capability probe passed sufficiently for an automatic path." ;;
    2) echo "Both mutation paths failed. Guard stays shadow-only; use explicit filter/MCP fallback." >&2 ;;
    3) echo "At least one capability remained unknown. Guard stays shadow-only." >&2 ;;
    *) echo "Capability probe failed operationally (exit $PROBE_RC). Guard stays shadow-only." >&2 ;;
  esac
else
  echo "Live capability probe not run. hookActivation=auto therefore stays in shadow mode."
  echo "Run later: node \"$CANARY_FILE\" --output \"$CAPABILITY_FILE\""
fi

node "$GUARD_FILE" --status

cat <<JSON

Installed. Merge this block into $CLAUDE_DIR/settings.json.
Keep exactly one PostToolUse/Bash output owner; matching hooks run concurrently.

{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$GUARD_FILE\"",
            "timeout": 15,
            "statusMessage": "Evaluating Bash output budget"
          }
        ]
      }
    ]
  }
}

Activation states:
  auto    = replace only after a fresh matching live canary pass; otherwise shadow
  shadow  = measure/archive candidates but never replace model-visible output
  replace = force replacement; use only for controlled diagnosis
  off     = no-op

Capability probe:
  node "$CANARY_FILE" --output "$CAPABILITY_FILE"

Status (includes the effective native-aligned budget):
  node "$GUARD_FILE" --status

Raw retrieval:
  node "$GUARD_FILE" --show SESSION/ID
  node "$GUARD_FILE" --show-json SESSION/ID

Explicit fallback when PostToolUse replacement is unavailable:
  noisy-command 2>&1 | node "$GUARD_FILE" --filter --command "noisy-command"

Prune archive now:
  node "$GUARD_FILE" --prune 7
JSON
