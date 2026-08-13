# Claude-Code-Token-Stack — Komplettpaket

Das finale, validierte Gesamtpaket des Claude-Code-Token-Stacks: Konzept,
Regelwerk, lauffähige Hooks, Installer, Verifikation und Rollout-/Messplan.
Stand der Validierung: 2026-08-13 (4-Wege-Abgleich + Zweitvalidierung, siehe
`VALIDIERUNG.md`).

## Was das Paket ist

Ein Token-Hygiene- und Katastrophenschutz-Stack für Claude Code — **kein
Rabattprogramm**. Die ehrliche, aus vier unabhängigen Datensätzen validierte
Erwartung:

- **Profil A** (kurze Sessions): einstellige Prozentpunkte Ersparnis.
- **Profil B** (lange Sessions): 15–30 % Input-Tokens.
- Der größte belegbare Hebel liegt im **Vermeiden** (Prefix, Session-Grenze,
  Cache), nicht in der Kompression einzelner Tool-Ausgaben.

## Warum (die drei Gesetze)

1. **Genau ein mutierender Eigentümer pro Fläche** — passende Hooks laufen
   parallel; zwei Bash-Rewriter sind nicht komponierbar.
2. **Append-only schlägt Prefix-Rewrite** — alles, was den Prefix invalidiert,
   muss den Cache-Bruch erst verdienen (gepaarte Messung).
3. **Kein Werkzeug ohne gemessene Lieferfähigkeit** — 60-Tage-Aktivitätsregel
   und Lizenz-Gate (kein PolyForm/AGPL/ELv2/lizenzlos im dienstlichen Default).

Mechanismen-Ordnung vor jeder Werkzeugwahl:
**Vermeiden → Verlagern → Verdichten → Verbilligen.**

## Schnellstart

```bash
# 1. Paket verifizieren (Syntax, Self-Tests, Semantik, Installer-Smoke)
bash scripts/verify-package.sh        # erwartet: "package verification: OK"

# 2. Installieren (idempotent, mit Backups; merged settings.json)
bash scripts/install.sh

# 3. Capability-Probe (aktiviert den Ersetzungspfad des bash-dump-guard)
node ~/.claude/hooks/claude-hook-capability-canary.mjs \
  --output ~/.claude/bash-dump-guard-capabilities.json

# 4. Befundlage ansehen
node ~/.claude/hooks/prefix-budget.mjs --report
node ~/.claude/hooks/bash-dump-guard.mjs --status
```

Danach gilt der Rollout in `planung/ROLLOUT.md`: Gates statt Big Bang,
Messpflicht mit Net-Win-Gate für jede Stufe.

## Struktur

```
claude-token-stack-paket/
├── README.md                  # dieser Einstieg
├── MASTERPLAN.md              # Wave-Planung (Waves 0-7, Gates, Abnahme)
├── KONZEPT.md                 # kondensiertes Gesamtkonzept (Gesetze, 9 Flächen, Stack)
├── VALIDIERUNG.md             # Prüfergebnisse + Paket-Eigenprüfung
├── katalog/
│   ├── kern-katalog.md        # die 25 bewerteten Repos (Score/Flags/Entscheidung)
│   └── HINWEIS.md             # Verweis aufs Vollinventar + Konsolidierungsregeln
├── hooks/                     # lauffähiger Code (Node >= 18, keine Dependencies)
│   ├── bash-dump-guard.mjs    # PostToolUse-Kompressor v3.1 (Bash-Owner, A/B-Kandidat)
│   ├── bash-dump-gate.mjs     # PreToolUse-Deny-Gate (Vermeidung vor Ausführung)
│   ├── read-context-guard.mjs # einziger mutierender Read-Owner (deny-once)
│   ├── read-slice-guard.mjs   # Slice-Regelmodul (intern)
│   ├── reread-guard.mjs       # Reread-Regelmodul (intern)
│   ├── session-economy.mjs    # Session-Druck-Beobachter + Checkpoints
│   ├── prefix-budget.mjs      # SessionStart-Prefix-Wächter (inkl. Kollisionsbefunde)
│   ├── ladder-ledger.mjs      # Stash-Buch + Rung-2-Nudge (einzige Ladder-Gewinnkomponente)
│   ├── claude-hook-capability-canary.mjs  # Live-Probe updatedInput/updatedToolOutput
│   ├── bash-size-feedback.mjs / ctx-used-marker.mjs  # Beobachter (optional)
│   ├── ladder-retrieve-{gate,filter}.mjs   # Referenz, NICHT registrieren (gemessen +9,6 %)
│   ├── lib/token-stack-shared.mjs
│   └── tests/                 # hook-contract-smoke, test-guard-all (73), test-ladder (38)
├── config/
│   ├── settings.json          # Volltemplate (env/permissions/hooks, reines JSON)
│   ├── native-token-limits.example.jsonc  # Stufe-1-Deckel, kommentiert (Caveats!)
│   ├── bash-dump-guard.config.json        # Pilotwerte 4096 B / 512 B / 15 % / 7d / 20MB
│   └── ladder-config.json     # Ladder-Stellschrauben mit MEASURED/PROVISIONAL-Herkunft
├── regelwerk/
│   ├── context-surface-owners.yaml  # Owner-Registry (Gesetz I, ans Paket angepasst)
│   ├── token-efficiency.rules.md    # Laufzeitregeln (v3 + Caveats + toonify-Pin)
│   ├── LADDER.md                    # Ladder-Stufenmodell (Trigger/Aktionen/Fallbacks)
│   ├── CLAUDE.md.template           # <200 Zeilen: Regeln + Ladder + Compact-Block
│   └── TASK-STATE.template.md       # Handoff-Vertrag für Ladder-Stufe 3
├── scripts/
│   ├── install.sh             # idempotenter Installer (Backups, Merge, Self-Tests)
│   ├── verify-package.sh      # Gesamtverifikation ("package verification: OK")
│   └── benchmark-harness.md   # Messharness-Konzept (nach Squeez v5)
└── planung/
    ├── ROLLOUT.md             # Gates + 10-Wochen-Plan + Stop-Regeln
    └── MESSPLAN.md            # Baseline-Metriken, gepaart >=3 Replikate, E2E-Wahrheit
```

## Fail-open-Prinzip

Jeder Hook im Paket ist fail-open: Parse-Fehler, fehlende Felder,
übergroße stdin-Payloads (> 8 MiB, hart begrenzt) oder Laufzeitfehler führen
zu **exit 0 ohne Ausgabe** — nie zu einer blockierten Session. Einzige
bewusste Ausnahme: die rtk-Erkennung im bash-dump-gate ist fail-safe
(eine unlesbare settings.json blockt lieber einen Redirect als einen Dump
durchzulassen); beide Richtungen sind durch die 73-Fälle-Suite belegt.

## Wichtigste Caveats

- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=78` ist im settings-env ggf. **wirkungslos**
  (bekannte Upstream-Issues) → Shell-Export als Fallback, Wirkung verifizieren.
- `ENABLE_TOOL_SEARCH` bleibt auf dem direkten Anthropic-Pfad **unset**.
- bash-dump-guard ersetzt ohne bestandene Canary-Probe nichts (Shadow-Modus —
  Absicht, kein Defekt).
- toonify-mcp nur mit **Pin ≥ 0.8.1** (additionalContext-Defekt erst dort gefixt).
- Keine E2E-Nachmessung existiert bislang — sie ist Gate im Rollout, keine
  Annahme. Erwartungswerte stehen oben, nicht in Werbeprosa.
