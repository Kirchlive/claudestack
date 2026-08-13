#!/usr/bin/env bash
# install.sh — claude-token-stack-paket
#
# Idempotente Installation:
#   1. kopiert die Hooks nach ~/.claude/hooks (mit Backup bestehender Dateien)
#   2. setzt Execute-Bits (700 Hooks / 600 lib+configs)
#   3. installiert die Guard-/Ladder-Configs (nur wenn noch nicht vorhanden —
#      eigene Kalibrierung geht bei Re-Installation nicht verloren)
#   4. merged config/settings.json in ~/.claude/settings.json
#      (VOLLBACKUP vorher; env/permissions/hooks werden vereinigt, nichts
#      fremdes wird geloescht; Hook-Eintraege werden anhand des Kommandos
#      dedupliziert, daher ist ein erneuter Lauf ohne Effekt)
#   5. fuehrt die lokalen Self-Tests aus
#
# Aufruf:  bash scripts/install.sh [--no-merge] [--self-test-only]
# Ueberschreibbar: CLAUDE_CONFIG_DIR (Default: $HOME/.claude)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
HOOK_DIR="$CLAUDE_DIR/hooks"
LIB_DIR="$HOOK_DIR/lib"
STAMP="$(date +%Y%m%d-%H%M%S)"
MERGE=1

for arg in "$@"; do
  case "$arg" in
    --no-merge) MERGE=0 ;;
    -h|--help) grep '^#' "$0" | head -20; exit 0 ;;
    *) echo "Unbekanntes Argument: $arg" >&2; exit 2 ;;
  esac
done

command -v node >/dev/null 2>&1 || { echo "Node.js >= 18 wird benoetigt." >&2; exit 1; }
NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
(( NODE_MAJOR >= 18 )) || { echo "Node.js >= 18 wird benoetigt; gefunden: $(node --version)." >&2; exit 1; }

mkdir -p "$HOOK_DIR" "$LIB_DIR"
chmod 700 "$CLAUDE_DIR" "$HOOK_DIR" "$LIB_DIR" 2>/dev/null || true

backup_if_exists() { # <ziel>
  if [[ -e "$1" ]]; then
    cp -p "$1" "$1.bak.$STAMP"
    echo "Backup: $1.bak.$STAMP"
  fi
}

# --- 1.+2. Hooks kopieren, Execute-Bits setzen -------------------------------
# 700 = direkt ausfuehrbare Hook-Einstiegspunkte
EXEC_HOOKS=(
  bash-dump-guard.mjs bash-dump-gate.mjs bash-size-feedback.mjs
  ctx-used-marker.mjs prefix-budget.mjs read-context-guard.mjs
  session-economy.mjs ladder-ledger.mjs claude-hook-capability-canary.mjs
)
# 600 = Bibliotheken / reine Regelmodule / nicht registrierte Referenzen
LIB_HOOKS=(
  read-slice-guard.mjs reread-guard.mjs
  ladder-retrieve-gate.mjs ladder-retrieve-filter.mjs
)

for name in "${EXEC_HOOKS[@]}"; do
  backup_if_exists "$HOOK_DIR/$name"
  install -m 700 "$ROOT/hooks/$name" "$HOOK_DIR/$name"
done
for name in "${LIB_HOOKS[@]}"; do
  backup_if_exists "$HOOK_DIR/$name"
  install -m 600 "$ROOT/hooks/$name" "$HOOK_DIR/$name"
done
backup_if_exists "$LIB_DIR/token-stack-shared.mjs"
install -m 600 "$ROOT/hooks/lib/token-stack-shared.mjs" "$LIB_DIR/token-stack-shared.mjs"

# --- 3. Configs (nur neu anlegen, nie ueberschreiben) ------------------------
install_if_absent() { # <quelle> <ziel>
  if [[ -e "$2" ]]; then
    echo "Config bleibt unangetastet (existiert): $2"
  else
    install -m 600 "$1" "$2"
    echo "Config installiert: $2"
  fi
}
install_if_absent "$ROOT/config/bash-dump-guard.config.json" "$CLAUDE_DIR/bash-dump-guard.config.json"
# ladder-config.json liegt zur Laufzeit neben den Ladder-Hooks (gate/filter
# lesen genau diesen Pfad); die Paket-Config ist die dokumentierte Quelle.
install_if_absent "$ROOT/config/ladder-config.json" "$HOOK_DIR/ladder-config.json"

# --- 4. settings.json mergen (Backup!) ---------------------------------------
SETTINGS="$CLAUDE_DIR/settings.json"
if (( MERGE == 1 )); then
  if [[ -f "$SETTINGS" ]]; then
    cp -p "$SETTINGS" "$SETTINGS.bak.$STAMP"
    echo "Settings-Backup: $SETTINGS.bak.$STAMP"
  fi
  SETTINGS_TARGET="$SETTINGS" PKG_SETTINGS="$ROOT/config/settings.json" node <<'JS'
const fs = require('node:fs');
const target = process.env.SETTINGS_TARGET;
const pkg = JSON.parse(fs.readFileSync(process.env.PKG_SETTINGS, 'utf8'));
let cur = {};
try { cur = JSON.parse(fs.readFileSync(target, 'utf8')); } catch { /* neu oder defekt -> neu aufbauen */ }

// env: Paketwerte setzen, fremde Keys unangetastet lassen.
cur.env = { ...(cur.env || {}), ...(pkg.env || {}) };

// permissions: Vereinigung je Liste.
cur.permissions = cur.permissions || {};
for (const list of ['allow', 'deny', 'ask']) {
  const merged = new Set([...(cur.permissions[list] || []), ...((pkg.permissions || {})[list] || [])]);
  if (merged.size) cur.permissions[list] = [...merged];
}

// hooks: je Event Matcher-Gruppen anhaengen, Kommandos deduplizieren (idempotent).
cur.hooks = cur.hooks || {};
for (const [event, groups] of Object.entries(pkg.hooks || {})) {
  const existing = cur.hooks[event] || [];
  const known = new Set(existing.flatMap((g) => (g.hooks || []).map((h) => String(h.command))));
  for (const group of groups) {
    const fresh = (group.hooks || []).filter((h) => !known.has(String(h.command)));
    if (!fresh.length) continue;
    const matcher = group.matcher || '';
    const target_group = existing.find((g) => String(g.matcher || '') === String(matcher));
    if (target_group) target_group.hooks = [...(target_group.hooks || []), ...fresh];
    else existing.push({ ...(matcher ? { matcher } : {}), hooks: fresh });
    for (const h of fresh) known.add(String(h.command));
  }
  cur.hooks[event] = existing;
}

const tmp = `${target}.tmp-${process.pid}`;
fs.mkdirSync(require('node:path').dirname(target), { recursive: true, mode: 0o700 });
fs.writeFileSync(tmp, JSON.stringify(cur, null, 2) + '\n', { mode: 0o600 });
fs.renameSync(tmp, target);
console.log(`settings.json gemerged: ${target}`);
JS
else
  echo "Merge uebersprungen (--no-merge). Vorlage: $ROOT/config/settings.json"
fi

# --- 5. Self-Tests ------------------------------------------------------------
node "$HOOK_DIR/bash-dump-guard.mjs" --self-test
node "$HOOK_DIR/prefix-budget.mjs" --self-test
node "$HOOK_DIR/read-context-guard.mjs" --self-test
node "$HOOK_DIR/session-economy.mjs" --self-test
node "$HOOK_DIR/claude-hook-capability-canary.mjs" --self-test

cat <<EOF

Installation abgeschlossen (idempotent, erneuter Lauf ohne Effekt).
Naechste Schritte:
  1. Capability-Probe (gated bash-dump-guard hookActivation=auto):
       node "$HOOK_DIR/claude-hook-capability-canary.mjs" --output "$CLAUDE_DIR/bash-dump-guard-capabilities.json"
  2. Prefix-Befund:    node "$HOOK_DIR/prefix-budget.mjs" --report
  3. Status:           node "$HOOK_DIR/bash-dump-guard.mjs" --status
  4. Gesamtverifikation des Pakets: bash "$ROOT/scripts/verify-package.sh"
Hinweis: bash-dump-guard laeuft ohne bestandene Canary-Probe im Shadow-Modus
(misst, ersetzt nichts) — das ist Absicht, kein Defekt.
EOF
