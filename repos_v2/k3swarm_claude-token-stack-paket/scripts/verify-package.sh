#!/usr/bin/env bash
# verify-package.sh — Gesamtverifikation des claude-token-stack-pakets.
#
# Reparatur gegenueber der GPT55SOL_PRO-Version (Fixliste B1/B2):
#   B1: README-Dateiname korrekt — geprueft wird README.md im Paketwurzel
#       (die GPT-Checksummenliste referenzierte einen falschen Namen).
#   B2: install.sh wird im Smoke-Test via `bash install.sh` ausgefuehrt,
#       nicht direkt — das fehlende Execute-Bit auf frischem Checkout
#       bricht die Verifikation damit nicht mehr.
# Alle neun Semantik-Checks der GPT-Version sind in angepasster Form
# erhalten (Paketlayout: hooks/, config/, regelwerk/, scripts/).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

command -v node >/dev/null 2>&1 || { echo "node is required" >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "python3 is required" >&2; exit 1; }

# --- Syntax und deterministische Self-Tests -----------------------------------
while IFS= read -r -d '' file; do node --check "$file"; done < <(find "$ROOT/hooks" -name '*.mjs' -type f -print0)
node "$ROOT/hooks/prefix-budget.mjs" --self-test
node "$ROOT/hooks/read-context-guard.mjs" --self-test
node "$ROOT/hooks/session-economy.mjs" --self-test
node "$ROOT/hooks/bash-dump-guard.mjs" --self-test
node "$ROOT/hooks/claude-hook-capability-canary.mjs" --self-test
node "$ROOT/hooks/tests/hook-contract-smoke.mjs"
node "$ROOT/hooks/tests/test-guard-all.mjs"

# test-ladder: 38/38 mit rtk-Binary; ohne rtk genau EIN bekannter Fail-open-Fall
# ("source blob is swapped for the rtk view" -> passthrough). Beides akzeptabel.
set +e
LADDER_OUT="$(node "$ROOT/hooks/tests/test-ladder.mjs" 2>&1)"
LADDER_RC=$?
set -e
if (( LADDER_RC == 0 )); then
  echo "test-ladder: OK (38/38, rtk vorhanden)"
elif grep -q "37 passed, 1 failed" <<<"$LADDER_OUT" && grep -q "source blob is swapped for the rtk view" <<<"$LADDER_OUT"; then
  echo "test-ladder: OK (37/38 — einziger Fail = fehlendes rtk-Binary, dokumentierter Fail-open-Fall)"
else
  echo "test-ladder: UNERWARTETES ERGEBNIS (exit $LADDER_RC)" >&2
  echo "$LADDER_OUT" >&2
  exit 1
fi

bash -n "$ROOT/scripts/install.sh"
bash -n "$ROOT/scripts/verify-package.sh"

# Execute-Bits auf allen .sh (B2-Gegenstueck: Repo-Seite muss stimmen).
# chmod wird hier erneut versucht; manche Einhaengepunkte (z. B. FUSE/portal)
# lassen keine Mode-Aenderung zu — dann Warnung statt Abbruch, weil install.sh
# die Bits auf dem Zielsystem ohnehin per `install -m` setzt.
chmod +x "$ROOT/scripts/install.sh" "$ROOT/scripts/verify-package.sh" 2>/dev/null || true
FS_SUPPORTS_X=1
PROBE="$(mktemp "$ROOT/scripts/.xprobe.XXXXXX")"
chmod +x "$PROBE" 2>/dev/null || true
test -x "$PROBE" || FS_SUPPORTS_X=0
rm -f "$PROBE"
for script in "$ROOT/scripts/install.sh" "$ROOT/scripts/verify-package.sh"; do
  if [[ ! -x "$script" ]]; then
    if (( FS_SUPPORTS_X == 1 )); then
      echo "Execute-Bit fehlt: $script" >&2; exit 1
    else
      echo "warning: Dateisystem ohne Execute-Bits — $script nicht ausfuehrbar markierbar (Aufruf via bash)" >&2
    fi
  fi
done
echo "syntax/self-tests/execute-bits: OK"

# --- B1: README vorhanden und nicht leer --------------------------------------
test -s "$ROOT/README.md" || { echo "README.md fehlt oder ist leer (B1)" >&2; exit 1; }
echo "README.md: OK"

# --- JSON / JSONC / YAML -------------------------------------------------------
while IFS= read -r -d '' file; do python3 -m json.tool "$file" >/dev/null; done < <(find "$ROOT/config" -name '*.json' -type f -print0)
python3 - "$ROOT/config/native-token-limits.example.jsonc" <<'PY'
import json, re, sys
text = open(sys.argv[1], encoding='utf-8').read()
text = re.sub(r'//.*', '', text)
json.loads(text)
print('JSONC: OK')
PY
python3 - "$ROOT" <<'PY'
import pathlib, sys
root = pathlib.Path(sys.argv[1])
try:
    import yaml
except Exception:
    yaml = None
if yaml:
    yaml.safe_load((root / 'regelwerk' / 'context-surface-owners.yaml').read_text(encoding='utf-8'))
    print('YAML: OK')
else:
    print('warning: PyYAML unavailable; YAML parse skipped', file=sys.stderr)
PY

# --- Semantik-Checks (1-9, angepasst ans Paket) --------------------------------
python3 - "$ROOT" <<'PY'
import json, pathlib, sys
root = pathlib.Path(sys.argv[1])

settings = json.loads((root / 'config' / 'settings.json').read_text(encoding='utf-8'))
env = settings['env']
# 1-5: Stufe-1-Werte exakt wie validiert
assert env['MAX_MCP_OUTPUT_TOKENS'] == '8000', 'Check 1'
assert env['BASH_MAX_OUTPUT_LENGTH'] == '24000', 'Check 2'
assert env['TASK_MAX_OUTPUT_LENGTH'] == '12000', 'Check 3'
assert env['CLAUDE_CODE_MAX_OUTPUT_TOKENS'] == '16000', 'Check 4'
assert env['CLAUDE_AUTOCOMPACT_PCT_OVERRIDE'] == '78', 'Check 5'
# 6: ENABLE_TOOL_SEARCH auf Direktpfad unset
assert 'ENABLE_TOOL_SEARCH' not in env, 'Check 6'
# 7: permissions deny .env + rm -rf
deny = settings['permissions']['deny']
assert any('.env' in p for p in deny) and any('rm -rf' in p for p in deny), 'Check 7'
# 8: genau je ein mutierender Owner auf Read (pre+post) und Bash (post)
hooks = settings['hooks']
pre_read = [h for g in hooks.get('PreToolUse', []) if g.get('matcher') == 'Read' for h in g.get('hooks', [])]
post_read = [h for g in hooks.get('PostToolUse', []) if g.get('matcher') == 'Read' for h in g.get('hooks', [])]
post_bash = [h for g in hooks.get('PostToolUse', []) if g.get('matcher') == 'Bash' for h in g.get('hooks', [])]
assert len(pre_read) == 1 and 'read-context-guard.mjs' in pre_read[0]['command'], 'Check 8a'
assert len(post_read) == 1 and 'read-context-guard.mjs' in post_read[0]['command'], 'Check 8b'
assert len(post_bash) == 1 and 'bash-dump-guard.mjs' in post_bash[0]['command'], 'Check 8c'
# 9: Ladder-Ledger auf allen Tools + prefix-budget am SessionStart
post_all = [h for g in hooks.get('PostToolUse', []) if g.get('matcher') == '' for h in g.get('hooks', [])]
assert any('ladder-ledger.mjs' in h['command'] for h in post_all), 'Check 9a'
session_start = [h for g in hooks.get('SessionStart', []) for h in g.get('hooks', [])]
assert any('prefix-budget.mjs' in h['command'] for h in session_start), 'Check 9b'
# zusaetzlich: Guard-Pilotwerte (minInputBytes 4096 / 512 B / 15 % / 7d / 20MB)
guard = json.loads((root / 'config' / 'bash-dump-guard.config.json').read_text(encoding='utf-8'))
assert guard['minInputBytes'] == 4096 and guard['minSavingsBytes'] == 512
assert guard['minSavingsRatio'] == 0.15
assert guard['rawRetentionDays'] == 7 and guard['maxRawBytes'] == 20971520
print('Semantik-Checks 1-9 (+ Guard-Pilotwerte): OK')
PY

# --- Native-Budget-Kopplung (Guard richtet sich nach BASH_MAX_OUTPUT_LENGTH) --
BASH_MAX_OUTPUT_LENGTH=24000 node "$ROOT/hooks/bash-dump-guard.mjs" --status | python3 -c '
import json, sys
x = json.load(sys.stdin)["nativeBudget"]
assert x["aligned"] is True
assert x["bashMaxOutputLengthChars"] == 24000
assert x["targetOutputBytes"] == 17280
assert x["hardOutputBytes"] == 24000
print("native Bash budget alignment: OK")
'

# --- Installer-Smoke-Test im isolierten HOME (B2: via bash, nicht direkt) -----
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/home"
HOME="$TMP/home" CLAUDE_CONFIG_DIR="$TMP/home/.claude" bash "$ROOT/scripts/install.sh" >"$TMP/install.log"
test -x "$TMP/home/.claude/hooks/bash-dump-guard.mjs"
test -x "$TMP/home/.claude/hooks/prefix-budget.mjs"
test -x "$TMP/home/.claude/hooks/read-context-guard.mjs"
test -x "$TMP/home/.claude/hooks/session-economy.mjs"
test -x "$TMP/home/.claude/hooks/ladder-ledger.mjs"
test -f "$TMP/home/.claude/hooks/lib/token-stack-shared.mjs"
test -f "$TMP/home/.claude/hooks/ladder-config.json"
test -f "$TMP/home/.claude/settings.json"
# Merge-Korrektheit: Hook registriert, env gesetzt
python3 - "$TMP/home/.claude/settings.json" <<'PY'
import json, sys
s = json.loads(open(sys.argv[1], encoding='utf-8').read())
assert s['env']['BASH_MAX_OUTPUT_LENGTH'] == '24000'
cmds = [h['command'] for g in s['hooks'].get('PostToolUse', []) for h in g.get('hooks', [])]
assert any('bash-dump-guard.mjs' in c for c in cmds)
print('installer merge: OK')
PY
# Idempotenz: zweiter Lauf verdoppelt keine Hook-Eintraege
HOME="$TMP/home" CLAUDE_CONFIG_DIR="$TMP/home/.claude" bash "$ROOT/scripts/install.sh" >"$TMP/install2.log"
python3 - "$TMP/home/.claude/settings.json" <<'PY'
import json, sys
s = json.loads(open(sys.argv[1], encoding='utf-8').read())
for event, groups in s['hooks'].items():
    cmds = [h['command'] for g in groups for h in g.get('hooks', [])]
    assert len(cmds) == len(set(cmds)), f'duplicate hook in {event}'
print('installer idempotency: OK')
PY
echo "installer isolated-home smoke test (via bash install.sh): OK"

echo "package verification: OK"
