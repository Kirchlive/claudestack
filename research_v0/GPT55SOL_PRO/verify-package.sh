#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

command -v node >/dev/null 2>&1 || { echo "node is required" >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "python3 is required" >&2; exit 1; }

# Syntax and deterministic self-tests.
while IFS= read -r -d '' file; do node --check "$file"; done < <(find "$ROOT" -name '*.mjs' -type f -print0)
node "$ROOT/prefix-budget.mjs" --self-test
node "$ROOT/read-context-guard.mjs" --self-test
node "$ROOT/session-economy.mjs" --self-test
node "$ROOT/bash-dump-guard.mjs" --self-test
node "$ROOT/claude-hook-capability-canary.mjs" --self-test
node "$ROOT/tests/hook-contract-smoke.mjs"

bash -n "$ROOT/install-token-stack-hooks.sh"
bash -n "$ROOT/install-bash-dump-guard.sh"

# JSON, JSONC, YAML and catalog invariants.
while IFS= read -r -d '' file; do python3 -m json.tool "$file" >/dev/null; done < <(find "$ROOT" -name '*.json' -type f -print0)
python3 - "$ROOT/native-token-limits.example.jsonc" <<'PY'
import json, re, sys
text=open(sys.argv[1], encoding='utf-8').read()
text=re.sub(r'//.*', '', text)
json.loads(text)
print('JSONC: OK')
PY
python3 - "$ROOT" <<'PY'
import json, pathlib, sys
root=pathlib.Path(sys.argv[1])
try:
    import yaml
except Exception:
    yaml=None
if yaml:
    for name in ['target-stack-profiles.yaml','context-surface-owners.template.yaml']:
        yaml.safe_load((root/name).read_text(encoding='utf-8'))
    print('YAML: OK')
else:
    print('warning: PyYAML unavailable; YAML parse skipped', file=sys.stderr)

catalog=json.loads((root/'repo-catalog.json').read_text(encoding='utf-8'))
assert catalog['schema_version'] == 3
assert catalog['count'] == 228
assert catalog['count'] == len(catalog['repositories'])
assert catalog['count'] == len({item['repo'].lower() for item in catalog['repositories']})
assert sum(catalog['counts_by_status'].values()) == catalog['count']
for required in ['fajarhide/omni','IyadhKhalfallah/clauditor','manojmallick/sigmap','alexgreensh/token-optimizer']:
    assert any(item['repo'].lower()==required.lower() for item in catalog['repositories']), required

hooks=json.loads((root/'claude-code-hooks.example.json').read_text(encoding='utf-8'))['hooks']
pre_read=[h for group in hooks.get('PreToolUse',[]) if group.get('matcher')=='Read' for h in group.get('hooks',[])]
post_read=[h for group in hooks.get('PostToolUse',[]) if group.get('matcher')=='Read' for h in group.get('hooks',[])]
post_bash=[h for group in hooks.get('PostToolUse',[]) if group.get('matcher')=='Bash' for h in group.get('hooks',[])]
assert len(pre_read)==1 and 'read-context-guard.mjs' in pre_read[0]['command']
assert len(post_read)==1 and 'read-context-guard.mjs' in post_read[0]['command']
assert len(post_bash)==1 and 'bash-dump-guard.mjs' in post_bash[0]['command']
print(f"repo catalog/hooks: OK ({catalog['count']} unique repositories)")
PY

# Native-budget coupling contract.
BASH_MAX_OUTPUT_LENGTH=24000 node "$ROOT/bash-dump-guard.mjs" --status | python3 -c '
import json,sys
x=json.load(sys.stdin)["nativeBudget"]
assert x["aligned"] is True
assert x["bashMaxOutputLengthChars"] == 24000
assert x["targetOutputBytes"] == 17280
assert x["hardOutputBytes"] == 24000
print("native Bash budget alignment: OK")
'

# Installer smoke test in an isolated home. settings.json must not be created or edited.
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/home"
HOME="$TMP/home" CLAUDE_CONFIG_DIR="$TMP/home/.claude" "$ROOT/install-token-stack-hooks.sh" >"$TMP/install.log"
test -x "$TMP/home/.claude/hooks/bash-dump-guard.mjs"
test -x "$TMP/home/.claude/hooks/prefix-budget.mjs"
test -x "$TMP/home/.claude/hooks/read-context-guard.mjs"
test -x "$TMP/home/.claude/hooks/session-economy.mjs"
test -f "$TMP/home/.claude/hooks/lib/token-stack-shared.mjs"
test ! -e "$TMP/home/.claude/settings.json"
echo "full installer isolated-home smoke test: OK"

if command -v pwsh >/dev/null 2>&1; then
  pwsh -NoProfile -Command "[System.Management.Automation.Language.Parser]::ParseFile('$ROOT/install-token-stack-hooks.ps1',[ref]\$null,[ref]\$null) | Out-Null"
  pwsh -NoProfile -Command "[System.Management.Automation.Language.Parser]::ParseFile('$ROOT/install-bash-dump-guard.ps1',[ref]\$null,[ref]\$null) | Out-Null"
  echo "PowerShell syntax: OK"
else
  echo "warning: pwsh unavailable; PowerShell parse skipped" >&2
fi

# Integrity is checked last so all semantic failures are easier to diagnose.
if command -v sha256sum >/dev/null 2>&1; then
  (cd "$ROOT" && sha256sum -c SHA256SUMS.txt)
elif command -v shasum >/dev/null 2>&1; then
  (cd "$ROOT" && while read -r sum file; do printf '%s  %s\n' "$sum" "$file" | shasum -a 256 -c -; done < SHA256SUMS.txt)
else
  echo "warning: no SHA-256 verification command found" >&2
fi

echo "package verification: OK"
