# Tiefenanalyse: Squeez-RTK-Ladder + Claude-Code-Integration

_Analysis-Datum: 2026-08-13 · Geprüfte Objekte: `/mnt/agents/claudestack/Squeez-RTK-Ladder/` (32 Dateien), `/mnt/agents/claudestack/CLAUDE.md`, `settings.json`, `hooks/` (13 Dateien) · Alle Tests real ausgeführt, Belege unten._

---

## 1 · ARCHITEKTUR & KONZEPT

### 1.1 Was Squeez-RTK-Ladder ist

Ein abgeschlossenes Forschungs- und Implementierungsprojekt (8.–10. August 2026), das eine **dreistufige Eskalationsleiter** zwischen zwei Kompressionswerkzeugen für Claude-Code-Tool-Ausgaben gebaut, kalibriert und auf der eigenen API-Abrechnung vermessen hat:

- **squeez** (PreToolUse-Hook, komprimiert stark, verwirft viel)
- **rtk** (Hook, komprimiert moderat, behält Struktur)

Die Leiter definiert drei Fidelity-Stufen auf demselben Inhalt:

| Stufe | Inhalt | Erzeuger | Gemessene Größe |
|---|---|---|---|
| **R1** | squeez-komprimierte Erstansicht (automatisch) | squeez-PreToolUse-Hook | 49–314 Tok (Vorschau) |
| **R2** | rtk-Sicht (Signaturen bleiben, Rümpfe fallen weg) | `ladder <key>` | 205–5.976 Tok |
| **R3** | verbatimes Original | `ladder <key> --raw` | 1.475–10.211 Tok |

Kernproblem, das die Leiter lösen sollte: squeez komprimiert **immer**, und bei Eskalation liefert `squeez_retrieve` sofort das volle Original — gemessen ist das **teurer als gar kein Tool** (z. B. `grep`: 620 Tok squeez + 7.175 Tok retrieve > 5.563 Tok Baseline). Die Break-even-Retrieve-Rate gegen rtk-allein lag bei 47 %.

### 1.2 Komponenten

| Datei | Rolle | Status |
|---|---|---|
| `ladder-ledger.mjs` (233 Z.) | PostToolUse auf **allen** Tools: parst squeez-Stash-Marker (`key="…"`, Zeilenzahl) aus Tool-Results, führt Buch Key→Kommando/Größe, zählt Writes (Working-Tree-Sensitivität), schreibt Usage-Journal `~/.claude/ladder-usage.jsonl`, spricht den Rung-2-Hinweis (nur Quelltext > 4.000 Zeichen, max. 5/Session) | **aktiv verdrahtet** |
| `ladder-retrieve-gate.mjs` (238 Z.) | PreToolUse auf `*squeez_retrieve`: deny + Umleitungsvorschlag auf rtk-Re-Run (Allowlist deterministischer Kommandos, `splitCd()` für führendes `cd X &&`, Budget 3 Redirects/Session, Loop-Safety, ctx-Stand-down) | verdrahtet, aber `rung2Mode: "off"` + squeez-MCP entfernt → feuert nie |
| `ladder-retrieve-filter.mjs` (189 Z.) | PostToolUse auf `*squeez_retrieve`: komprimiert den **abgerufenen** Blob auf dem Rückweg via `rtk read -l aggressive` (Tempfile, maxRatio 0.85, max 5/Session) | verdrahtet, aber `rung2Mode: "off"` → feuert nie |
| `ladder-config.json` (160 Z.) | Alle Stellschrauben **mit Herkunftsvermerk je Wert** (MEASURED/PROVISIONAL): `minChars: 1100`, `tokensPerKilochar: 318`, Allowlists, `rung2Mode: "off"` | Referenzmodell für Config-Dokumentation |
| `test-ladder.mjs` (278 Z.) | 38 Fälle, prüft **Entscheidungen statt Wortlaut**, mit Arm-Guard (bricht ab, wenn `enabled:false`) | läuft (s. §3) |
| `ladder-calibrate.mjs` (143 Z.) | Misst `minChars` auf der eigenen Maschine aus der Median-Reduktionsrate: `minChars = 200 / (Reduktion × 0,318)` → 1.100 | funktionsfähig (Read-only) |
| `ladder-ab.mjs` (171 Z.) | Gepaarter A/B auf der eigenen Abrechnung: Arm-Schalter (flipped `enabled` in der **installierten** Config), Transkript-Auswertung mit `--project`, Median-Vergleich, <3-Läufe-Warnung | funktionsfähig |
| **`ladder` (das Kommando)** | `~/.local/bin/ladder`: liest squeez-Blob-Datei direkt, schickt sie durch `rtk read`, Fallback auf verbatim bei Ratio ≥ 0,85; `ladder stats` misst Abrufrate | **NICHT im Repo** — das Gewinner-Artefakt fehlt (s. §5) |

### 1.3 Wave-Struktur (Planungsansatz)

- **WAVE-INDEX.md** = Session-Bootstrap-Karte: Folge-Sessions lesen Index + nur die aktive Wave-Datei, nie das ganze Korpus („Index = Karte; Wave-Datei = Arbeitsauftrag; MASTERPLAN = Zustand").
- **WAVE-STATE.md** = Active/Shipped mit Ergebniszahlen inline.
- Waves: 01-1 Verdrahten → 01-2 Kalibrieren → 01-3 gepaarter A/B → 01-4 Kommando-A/B → 01-5 Quelltext-Serie → 02-1 Entscheidung → 02-2/02-3/02-4 Konsequenzen. Alle SHIPPED.
- Planungsdisziplin: Endpunkt **vor** der Messung festgelegt (Median gepaarte Differenz fresh input), Sperrkriterium Qualität, niemals k=1, ≥3 Läufe/Arm, Median gepaart statt Summen, Anomaliedatei (`AB-ANOMALIES.md`) Pflicht je Lauf, eingefrorenes Korpus mit SHA vor/nach jedem Lauf, Antwortschlüssel deterministisch vorab berechnet (`ANSWERS-v5.md`).

### 1.4 v5-Harness (Messinfrastruktur)

`precompute-v5.py` (Vorab-Rechnung R0/R1/R2 ohne Modell, tiktoken o200k_base), `gen-tasks-v5.py` (erzeugt byteweise symmetrische Aufgabendateien je Arm, prüft Arm-Symmetrie), `corpus-v5.sh` (SHA über die neun Verbatim-Ausgaben), `dispatch-v5.sh` (3 Replikate parallel über cmux, Zeitstempel im Laufnamen, Abbruch bei `SQUEEZ_WRAP_TIMEOUT_SECS < 600`, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=0`), `eval-v5.py` (je-Lauf-Auswertung + Qualitätsprüfung gegen Antwortschlüssel + 1-Transkript-Gültigkeitscheck), `ladder-tokens-v5.py` (misst, was **tatsächlich zugestellt** wurde, nicht was Tools könnten).

---

## 2 · MESSERGEBNISSE

### 2.1 Die fünf Messreihen (fresh input = uncached + cache_creation)

| Serie | Datei | Aufbau | Median A | Median B | Gepaart | Streuung | Verdikt |
|---|---|---|---:|---:|---|---|---|
| Vorlauf | `ab-log.json` | 2 Läufe A, je **2 Transkripte** (Verzeichnis wiederverwendet) | 370.313 / 195.759 | — | — | — | ungültig (Doppelzählung) |
| **v1** | `ab-log-v1-invalid.json` | 3+3 Läufe, **kein eingefrorenes Korpus** | 152.180 | 211.909 | **+39,3 %** | 19 % (A) | **verworfen** |
| **v2** | `ab-log-v2-gate.json` | Hook-Gate, eingefrorenes Korpus | 158.940 | 174.169 | **+9,6 %** | 36 % (A) | „kein Nutzen", Gate teurer |
| v3 | `ab-log-v3-src.json` | nur Arm A, Quelltext | 173.715 (164.870/185.535) | — | — | — | abgebrochen, undokumentiert |
| **v4** | `ab-log-v4.json` | Kommando-Leiter, 3 Quelltextdateien, 3+3 | 200.726 | 200.050 | **−0,3 %** | 33 %/27 % | Null-Ergebnis im Rauschen |
| **v5** | RESULTS-v5.md | 3 Quelltextfälle gebündelt, 3+3 Replikate | 117.880 | 85.783 | **−27,2 %** (−32.097 Tok) | 3 %/7 % | **Effekt bewiesen** |

### 2.2 Was „v1-invalid" bedeutet

Die Serie maß +39,3 % — und war dreifach wertlos:
1. **Das Gate hatte nie eine Gelegenheit:** über alle sechs Ledger nur **1 Stash, 0 Redirects**. Die Aufgabe war lese-lastig; `bash-dump-guard` Regel A leitet `cat`/`grep`/`find` auf native Tools um, wo squeez nicht stasht. Beide Arme waren wirkungsidentisch — die Differenz maß Lauf-zu-Lauf-Varianz.
2. **Das Korpus driftete:** der Lesestoff wuchs zwischen den Armen um ~10 % (Messprotokoll + Arm-Guard wurden in Dateien geschrieben, die die Aufgabe las); die Aufgabe las `settings.json` und Live-Hooks, und der Arm-Schalter verändert `ladder-config.json` → Lesestoff unterschied sich **per Konstruktion** zwischen den Armen.
3. **Zwei Läufe ungültig:** A3 spawnte einen Teammate (seither `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=0`); A2 wurde unterbrochen und fortgesetzt — der Wiederaufsatz baut den Prompt-Cache neu auf, `cache_creation` schlägt durch (342.510 vs 174.531, Faktor 2). „Ein unterbrochener Lauf ist kein Datenpunkt."

Konsequenz: `chmod a-w`-Korpus + SHA, Zeitstempel-Laufnamen, Anomaliedateien. **v1-invalid ist die Lehrstunde, die den v5-Harness erzeugte.**

### 2.3 Stufen-Messwerte (Tokens, tiktoken o200k_base)

**Break-even-Entwurf (fremde Repos, express/requests):**

| Fall | R1 | R2 | R3 | Break-even-Eskalationsrate |
|---|---:|---:|---:|---:|
| `cat lib/response.js` (minimal) | 75 | 5.976 | 6.574 | 99 % |
| `cat` (aggressive) | 75 | 167 | 6.574 | 55 % |
| `git log -50` | 314 | 4.217 | 10.211 | 93 % |
| `grep -rn "def " src/` | 49 | 3.810 | 5.563 | 99 % |
| `ls -laR lib test` | 50 | 1.391 | 3.897 | 96 % |

**v4, je Datei (R0/R1/R2/R3):** config.rs 11.234/514/563/11.234 · session.rs 2.650/1.703/726/2.650 · filter.rs 1.719/**2.001**/203/1.719 (squeez **vergrößert**). **R2 liegt unter R1** — die Leiter ist keine Treppe, sondern zwei verschiedene verlustbehaftete Sichten. Erwartete Differenz 14.111 Tok wurde nicht gemessen, weil Claude Code `config.rs` verbatim (36,3 KB) als `persisted-output` auslagerte → reale Differenz nur ~3.400 Tok (1,7 %).

**v5, je Fall (am Zugestellten, über 6 Läufe byteidentisch):**

| Fall | R0 | R1 | R2 | Arm B (R1+R2) | vs R0 |
|---|---:|---:|---:|---:|---:|
| Q-S `filter.rs` (5.407 chars) | 1.475 | 1.214 | 205 | 1.419 | −4 % |
| Q-M `session.rs`+`tokens.rs` (17.975) | 4.886 | 434 | 1.296 | 1.730 | −65 % |
| Q-L `json_util.rs` (26.728) | 6.907 | 269 | 1.951 | 2.220 | −68 % |
| **Summe** | **13.268** | **1.917** | **3.452** | **5.369** | **−60 %** |

**Arm A kostet 15.185 Tok Werkzeugausgabe = +14 % gegenüber „squeez gar nicht laufen lassen"** — ohne Zwischenstufe ist die Leiter bei Eskalation schädlich.

**Vorab-Rechnung Git/Verzeichnis (precompute-v5.json):** R2 ≈ R0 + 45 Zeichen bei allen sechs Fällen (G-S 1.101/1.055, G-M 5.815/5.771, G-L 9.383/9.338, V-S 2.005/1.959, V-M 3.579/3.534, V-L 6.776/6.731) — `rtk read` ist ein Code-Struktur-Filter, findet in Kommandoausgaben keine Signaturen, gibt Eingabe unverändert zurück. **Außerhalb von Quelltext existiert keine Zwischenstufe.** Kompression existiert nur im Kommando-Handler (`rtk git log` −49 %, `rtk du` −79 %) — der Neuausführung braucht, den mit +9,6 % verworfenen Weg.

### 2.4 Weitere harte Messwerte

- **Token-Dichte:** 318 Tok/1000 Zeichen (19 reale Kommandos, Bandbreite 230–479); `chars/4` unterschätzt um ~27 %.
- **Latenz:** roh 2,6 ms · rtk 5,7 ms · **squeez 86,3 ms**/Call (8,4 s Overhead bei 100 Calls); rung-2-Laufzeit 57,6 ms.
- **Kalibrierung:** `minChars: 1100`, `CHARS_PER_LINE: 43` (MEASURED, aber nur 1 Repo, 1-Commit-Historie).
- **Abdeckung:** 806 Tool-Calls, 21 Läufe: Bash 40,6 % (einziger Stash-Pfad, **101/101 Stashes aus Bash**), Read 33,4 %, squeez-MCP 10,5 %, ctx_* 6,5 %. JetBrains-Obergrenze Bash-Hook: ≈3 % der Input-Tokens.
- **Startkontext:** squeez-MCP kostet 286 Tok/Session; `ladder`-Kommando kostet **0** (kein Schema, kein Hook).
- **Cross-Call-Dedup:** squeez 64 % vs rtk 28 % — **nicht nutzbar** (sessionübergreifender Cache unterschlägt fremden Inhalt), deaktiviert.
- **Bypass-Liste (02-4):** `echo` 64,8 → 16,1 ms, `git rev-parse` 64,9 → 26,9 ms.
- **Qualität v5:** 6/6 Läufe bestanden (extract_name, CurrentSession, 31/13/parse_value). v4: A 9/9/9, B 7/10/9 pub fns — gleichwertig.
- **squeez-Defekte (bewiesen):** R1 schneidet still vor der Antwort ab (`filter.rs`: `[... 20 lines truncated]` genau vor `extract_name`, in allen 6 v5-Läufen); Dedup-Marker `[×4]` zerstören Codestruktur; Summary-Felder unsinnig (`unique_files=4` bei 2 Dateien, `cmd=sed -n p /Users/rob/Developmen` abgeschnitten); 9 Konfig-Korrekturen nötig, bevor squeez messbar war.

### 2.5 Bewiesen vs. widerlegt

| These | Ergebnis |
|---|---|
| Zwischenstufe R2 auf Quelltext spart auf der Rechnung | **BEWIESEN:** −27,2 % fresh input, 3 %/7 % Streuung, Qualität unverändert (v5) |
| Hook-Gate (deny + Re-Run-Vorschlag) lohnt sich | **WIDERLEGT:** +9,6 % (v2) |
| Kommando-Leiter hilft über alle Inhaltstypen | **WIDERLEGT:** −0,3 % (v4, Grundlast 200k), Zwischenstufe existiert nur für Quelltext |
| Vorab-Rechnung schätzt den Effekt | **TEILWEISE WIDERLEGT:** gemessen 3,3× größer als gerechnet (Kontext-Mitführung über Turns) |
| R1 (squeez) als Standardsicht auf Quelltext | **WIDERLEGT:** unbrauchbar bis aktiv irreführend (stille Kürzung vor der Antwort) |
| Cross-Call-Dedup als squeez-Kaufargument | **WIDERLEGT:** sessionübergreifend, unterschlägt Inhalt |
| Tool-Scoreboards (Kompressionsraten) als Kaufbeleg | **WIDERLEGT:** JetBrains +7,6 % bei beworbenen −60…−90 %; eigene Bestätigung v4 |

Geltungsbereich der −27,2 %: **Strukturfragen an Quelltext** (Signaturen, Typen, welche Funktionen existieren), Fälle < 32 KB, Qualität mitprotokolliert. Nicht für Verhalten innerhalb von Funktionsrümpfen, nicht für Git/Verzeichnis.

---

## 3 · FUNKTIONSPRÜFUNG (alle real ausgeführt)

### 3.1 Syntax-Checks

| Check | Ergebnis |
|---|---|
| `node --check` auf alle 6 `*.mjs` in Squeez-RTK-Ladder | **6/6 OK** (Node v20.20.2) |
| `node --check` auf alle 10 `*.mjs` in hooks/ | **10/10 OK** |
| `python3 -m py_compile` eval-v5, gen-tasks-v5, ladder-tokens-v5, precompute-v5, nudge_builtins.py.orig, reapply-prompt-improver-optin.py | **6/6 OK** |
| `bash -n` corpus-v5.sh, dispatch-v5.sh | **2/2 OK** |
| `settings.json` JSON-Validierung | **OK** |

### 3.2 Testlauf `Squeez-RTK-Ladder/test-ladder.mjs`

**37 passed, 1 failed** (Exit 1). Der eine Fail: `source blob is swapped for the rtk view → got 'passthrough', want 'filtered'`. **Ursache: Umgebung, nicht Code** — dieser Fall braucht das echte `rtk`-Binary (Suite-Kommentar: „they use real rtk, because the whole question is what rtk does to a blob"); `rtk` ist hier nicht installiert, `execFileSync("rtk", …)` wirft, der Hook fällt per Design fail-open auf verbatim zurück. Auf der Originalmaschine dokumentiert: **38 grün**. Alle 37 anderen Fälle grün, darunter Ledger-Marker-Parsing, Nudge-Bedingungen (Quelltext spricht, Git/Verzeichnis/Markdown/klein stumm, Cap 5/Session, Key-Dedup), Gate-Fail-open, Happy Path, minChars-Floor, Determinismus-Allowlist (`ps aux`/`docker logs` abgelehnt), `git status`-Write-Invalidierung, Compound-Verweigerung, `splitCd()` inkl. `--no-squeez cd /repo && rtk git log`-Vorschlag, Quoting, ctx-Stand-down, Budget, Unlock, Filter-Loop-Safety.

### 3.3 Testlauf `hooks/test-ladder.mjs`

Exit 0 mit **korrektem Guard-Verhalten**: „ladder-config.json has enabled: false — the gate is switched off. … The 5 redirect cases cannot pass either way." Die Suite verweigert absichtlich ein irreführendes Ergebnis, statt rot zu laufen. **Achtung:** `hooks/test-ladder.mjs` (218 Z.) ist **älter** als die Squeez-Kopie (278 Z.) — die 8 Rung-2-Nudge-Fälle fehlen. Die Behauptung „beide Kopien abgeglichen" (MASTERPLAN/WAVE-STATE) gilt für ledger/gate/filter (byteidentisch, diff-geprüft), **nicht für die Testsuite und nicht für die Config** (`enabled: false` vs `true` — letzteres ist Absicht: Repo-Kopie = Testsuite-Konfiguration).

### 3.4 Testlauf `hooks/test-guard-all.mjs`

- **Original: 33 FEHLGESCHLAGEN** — Ursache: **hartcodierte Pfade** `/Users/rob/.claude/hooks/*.mjs` in den Zeilen 8–10; in dieser Umgebung existiert `/Users/rob` nicht, die Hook-Prozesse starten nie, leere stdout → alles „durch". Kein Code-Defekt der Guards, aber die Suite ist **nicht portabel**.
- **Gegenprobe mit nur pfad-gepatchter Kopie** (`/tmp/test-guard-all.local.mjs`, sed auf die 3 Pfade; `$HOME/.claude/settings.json` = echte settings.json mit rtk-hook-Registrierung): **ALLE 73 PRÜFUNGEN BESTANDEN** (Exit 0) — Regel A mit/ohne Pipe, Quoting, Regel B (Größe), Muting-Passthroughs, Heredoc, Fail-open, Marker, Size-Feedback-Budget (2 Hinweise, dann stumm; ctx-Marker unterdrückt; `git push`/`npm install` stumm; `git diff`/`docker logs` Hinweis), Unlock-TTL (10 min, Löschung abgelaufener), deny-statt-exit-2, Begründungstexte, und die drei neuen rtk-Erkennungs-Fälle (registriert → durch; fehlt → blockt; settings.json unlesbar → **fail-safe blockt**).

### 3.5 Smoke-Tests einzelner Hooks

- `instructions-loaded.mjs`: korrekte Anzeigezeile auf stderr + exit 1 (observability-only), JSONL-Log geschrieben (`bytes:8416, tokens_est:2805`). **Funktioniert.** Aber: **in settings.json NICHT registriert** — liegt unverdrahtet im Ordner.
- `ctx-used-marker.mjs`: Marker-Datei `/tmp/ctx-used-<sid>` korrekt angelegt. **Funktioniert.**
- `reapply-prompt-improver-optin.py`: Exit 1 mit sauberer Fehlermeldung „nicht gefunden — ist prompt-improver installiert?" (hier nicht installiert). Idempotentes Patch-Skript, kein Hook.
- Python v5-Skripte: kompilieren; **nicht ausführbar** hier — benötigen `tiktoken` (fehlt), `/Users/rob/...`-Pfade und die v5-Transkripte. `eval-v5.py`/`ladder-tokens-v5.py` lesen `/Users/rob/.tweakcc/ab-frozen/runs` — nicht vorhanden. Rein maschinengebunden, aber deterministisch nachvollziehbar codiert.

### 3.6 Code-Qualität

- **ladder-* (Squeez):** Hoch. Fail-open durchgängig, Loop-Safety vor Zustandsschreiben, jede Konstante mit Mess-Herkunft, jede Design-Entscheidung mit Fehlergeschichte im Kommentar (Befund 0/0b, `/tmp`-Reboot, CONFIG-Pfad-Fehler). Tests prüfen Entscheidungen, nicht Wortlaut — wartbar. Bekannte Restmängel sind **dokumentiert, nicht versteckt**: `ladder`-Kommando fehlt im Repo; Kalibrierung 1-Repo-begrenzt; `ab-log-v1` Tabelle ↔ JSON inkonsistent (selbst im Abschlussbericht §9 offengelegt); WAVE-INDEX-Statusfelder zeitweise nicht synchron (ebenfalls selbst offengelegt).
- **hooks/*:** Ebenfalls hoch. `bash-dump-guard.mjs` zeigt sauberes Security-Design (fail-open für Parse-Fehler, **fail-safe** für die rtk-Erkennung, Unlock mit TTL + Clock-Skew-Behandlung, deny statt exit 2 mit Issue-Referenz anthropics/claude-code#24327). Einzige Portabilitätslücke: hartcodierte `/Users/rob`-Pfade in `test-guard-all.mjs` und absolute Pfade in `settings.json`.

---

## 4 · IST-ZUSTAND der Claude-Code-Integration

### 4.1 CLAUDE.md (173 Z.)

Sechs Blöcke: Precedence-Regel (correctness/security > User > Projekt > Regeln), Principles (Think/Simplicity/Surgical/Goal-Driven), Response Style (caveman, terse), Thinking Language (aus `settings.json` `language: "Deutsch"`), Build Discipline (ponytail lite/full/ultra mit eigener 7-stufiger **Build-Ladder** — namensgleich, aber **inhaltlich unabhängig** von der Squeez-RTK-Ladder), Code Index (codegraph, nur wenn `.codegraph/` existiert), Context Tools (context-mode ctx_* deferred via ToolSearch, wann Sandbox vs. Bash/Read). **Keine direkte squeez-/ladder-Referenz** — die Leiter wird über Hooks + Ledger-Nudge gesteuert, nicht über Instruktionen (konsistent mit dem gemessenen Über-Instruktions-Befund: 3,5k Guidance-Tokens → 0/92 ctx-Calls).

### 4.2 settings.json (430 Z.) — registrierte Hook-Events

| Event | Matcher | Kommando | Funktion |
|---|---|---|---|
| PreToolUse | Bash\|Edit\|MultiEdit\|Write | protect-tests.js | Plugin-Schutz |
| PreToolUse | Read\|Edit\|Write\|Bash | protect-secrets.js | Plugin-Schutz |
| PreToolUse | Skill | ccstatusline --hook | Statusline |
| PreToolUse | Bash | `tokless rtk-hook claude` | **rtk-Umschreibung** (Regel A hängt daran) |
| PreToolUse | Bash | **bash-dump-guard.mjs** | Name-/Größen-Gate (aktiv) |
| PreToolUse | Bash\|Read\|Grep\|Glob\|Agent\|Task | squeez pretooluse.sh | **squeez-Kompression** |
| PreToolUse | mcp__.*squeez_retrieve | ladder-retrieve-gate.mjs | **tot**: rung2Mode off + kein squeez-MCP |
| PostToolUse | mcp__(plugin_)?context-mode.* | ctx-used-marker.mjs | ctx-Marker (aktiv) |
| PostToolUse | Bash | bash-size-feedback.mjs | Größen-Feedback, 2/Session (aktiv) |
| PostToolUse | *(alle)* | squeez posttooluse.sh | squeez-Stash |
| PostToolUse | "" | **ladder-ledger.mjs** | **aktiv** — Stash-Buch + Rung-2-Nudge + Usage-Journal |
| PostToolUse | mcp__.*squeez_retrieve | ladder-retrieve-filter.mjs | **tot**: rung2Mode off |
| SessionStart | — | context-mode-cache-heal.mjs | Plugin-Cache-Self-heal |
| SessionStart | — | squeez session-start.sh | squeez |
| UserPromptSubmit | — | ccstatusline --hook | |
| SubagentStop / PreCompact / PostCompact | — | squeez *.sh | squeez |

Env: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` (Achtung: in Messläufen 0, im Betrieb 1), `CONTEXT_MODE_BASH_NUDGE_MIN_COMMAND_BYTES=120`. Permissions: `defaultMode: auto`, allow `Bash(rtk *)` + ctx_* + codegraph. 34 Plugins (davon 9 aus), 33 Marketplaces. `model: "opus[1m]"`, `language: "Deutsch"`, `autoCompactEnabled: false`.

### 4.3 Was fehlt / Diskrepanzen

1. **`ladder`-Kommando nicht im Repo** — das in v5 siegreiche Artefakt (`~/.local/bin/ladder`) ist nur dokumentiert, nicht versioniert. Der Nudge in `ladder-ledger.mjs` verweist auf ein Kommando, dessen Quelle hier nicht existiert.
2. **squeez-MCP nicht registriert** (Absicht, dokumentiert) → Gate und Filter können strukturell nie feuern; ihre settings-Einträge sind toter Ballast (bewusst belassen für Flag-Reaktivierung).
3. **`instructions-loaded.mjs` nicht verdrahtet** — fertiger, getesteter Observability-Hook ohne settings-Eintrag (vermutlich weil InstructionsLoaded-Event neu/nicht freigeschaltet).
4. **`hooks/test-ladder.mjs` hinter der Squeez-Kopie zurück** (8 Nudge-Fälle fehlen); `hooks/ladder-config.json` `enabled:false` vs. Repo `true` (Absicht, aber Abgleich-Dokumentation trifft nur für Code zu).
5. **Hartcodierte `/Users/rob`-Pfade** in settings.json (alle Hook-Kommandos) und test-guard-all.mjs → nicht portabel.
6. `nudge_builtins.py.orig` = **Backup der Originaldatei** des prompt-improver-Plugins, die `reapply-prompt-improver-optin.py` nach jedem Plugin-Update patcht (Wrapper ~280 Tok → Opt-in via `*`, 6 Nudge-Regeln deaktiviert). Kein Hook, sondern Update-Überlebens-Werkzeug.
7. **bash-dump-guard.mjs (234 Z., installiert) vs. GPT55SOL_PRO-Variante (1064 Z.):** Trotz gleichem Namens **völlig verschiedene Programme**. Die installierte ist ein **PreToolUse-deny-Gate** (blockt vor Ausführung: Regel A Toolnamen, Regel B Größenliterale, deny-JSON). Die GPT-Variante „v3" ist ein **PostToolUse-Ausgabe-Kompressor** (`updatedToolOutput`: head/tail 36+36, Salient-Extraktion, Klassifizierer für Tests/Builds/Git/Suche/Listings, Secret-Redaktion mit 9 Regeln, Raw-Archiv mit Retention, Metriken, Capability-Canary-Gating, gzip-Archive). Die GPT-Variante ersetzt Inhalt **nach** der Ausführung verlustbehaftet mit Archiv-Rückholpfad; die installierte verhindert den Dump **vorher**. Für den finalen Stack sind das zwei unterschiedliche Bausteine, keine Versionsverwirrung — die installierte Variante ist die **gemessene** (73/73 Tests), die GPT-Variante ist ungetesteter Fremdcode (Syntax OK, keine Suite hier ausgeführt, `hookActivation: 'auto'` fail-closed ohne Canary).

---

## 5 · ÜBERNAHME-EMPFEHLUNG für den finalen Stack

### 5.1 Übernehmen (referenzwürdig)

| Element | Begründung |
|---|---|
| **Wave-Methodik** (WAVE-INDEX als Bootstrap-Karte, Wave-Datei = Arbeitsauftrag, MASTERPLAN = Zustand; Endpunkt vor Messung; Sperrkriterium Qualität; ≥3 Replikate; Anomaliedatei Pflicht) | Die stärkste Leistung des Projekts. Hat 5 Fehlmessungen aufgedeckt, die als „Ergebnis" durchgegangen wären. Direkt als Prozess-Template übernehmbar. |
| **Messdisziplin & Lehren** (ABSCHLUSSBERICHT §5/§10: fresh input ≠ cache reads; Kompressionsrate ≠ Rechnung; Kontext-Mitführung über Turns verstärkt Effekte Faktor 3,3; Grundlast senken statt Replikate erhöhen; 32-KB-Auslagerungsgrenze; eingefrorenes Korpus + SHA; Antwortschlüssel außerhalb der Messfläche; unterbrochener Lauf = kein Datenpunkt) | Generisch für jedes Tool-Benchmarking im Stack. |
| **ladder-ledger.mjs** (Stash-Buch + enger Rung-2-Nudge + Usage-Journal) | Einzige **aktiv gewinnbringende** Ladder-Komponente (−27,2 %-Pfad). Nudge-Bedingungen sind messtechnisch begründet (Quelltext, >4.000 chars, ≤5/Session). |
| **ladder-config.json als Muster** (jeder Wert mit MEASURED/PROVISIONAL-Herkunft und Fehlergeschichte) | Config-Dokumentationsstandard fürs Komplettpaket. |
| **ladder-calibrate.mjs** | Kalibrierung aus Reduktionsrate statt Sample-Minimum; Read-only; direkt lauffähig. |
| **bash-dump-guard.mjs + bash-size-feedback.mjs + ctx-used-marker.mjs** (73/73 Tests) | Bewährter Guard-Verbund; fail-open/fail-safe korrekt differenziert; deny-statt-exit-2 mit Issue-Beleg. |
| **ladder-ab.mjs** (als Harness-Muster) | Gepaarter A/B mit Arm-Marker, --project-Filter, Median, <3-Warnung — nach zwei dokumentierten Selbst-Fehlern gehärtet. |
| **eval-v5.py / gen-tasks-v5.py / corpus-v5.sh / dispatch-v5.sh** (als Harness-Referenz) | Deterministischer Antwortschlüssel, Arm-Symmetrie-Prüfung, Freeze-SHA, Abbruch-statt-stiller-Annahme. Pfade müssen parametrisiert werden. |

### 5.2 Nicht übernehmen (oder nur als Archiv)

| Element | Begründung |
|---|---|
| **ladder-retrieve-gate.mjs** (aktiv schalten) | Gemessen +9,6 %; erzwingt Neuausführung + Extraturn. Code bleibt als Referenz gut, `rung2Mode: "off"` belassen. |
| **ladder-retrieve-filter.mjs** (aktiv schalten) | Besseres Design als das Gate, aber durch fehlenden squeez-MCP und „off" ohnehin tot; keine eigene Messung auf der Rechnung (nur v5-Kommando-Pfad gemessen). |
| **squeez R1 als Standardsicht auf Quelltext** | Nachweislich unbrauchbar/irreführend (stille Kürzung vor der Antwort, `[×n]`-Marker zerstören Syntax, falsche Summary-Felder). squeez' verbleibender Wert: Blob-Aufbewahrung für `ladder`. |
| **Cross-Call-Dedup** | Sessionübergreifender Cache, unterschlägt Inhalt — bleibt `false`. |
| **GPT55SOL_PRO bash-dump-guard v3 (1064 Z.)** | Namensvetter, anderer Mechanismus (PostToolUse-Kompressor mit Archiv). Kein Testbeleg in diesem Korpus; fail-closed ohne Capability-Canary; hohe Komplexität. Nicht ungeprüft übernehmen — falls PostToolUse-Kompression gewünscht, erst eigene Suite + A/B nach v5-Methodik. |
| **1:1-Konstanten** (`minChars 1100`, `CHARS_PER_LINE 43`) | MEASURED, aber 1-Repo/1-Commit-Basis — mit `ladder-calibrate.mjs` auf Zielmaschine nachmessen, nicht erben. |
| **Hartcodierte Pfade** (`/Users/rob/...`) in settings/test-guard-all | Parametrisieren (homedir/CLAUDE_CONFIG_DIR). |

### 5.3 Planungsreife: **8/10**

Begründung: Vollständige Wave-Kette mit Shipped-Status je Schritt; jede Konstante mit Herkunft; fünf Messreihen mit Rohdaten, davon zwei verworfene **dokumentiert statt versteckt**; Abschlussbericht §9 legt die eigenen Datenlücken offen (inkonsistente v1-Tabelle, nicht-synchrone Statusfelder, claude-mem-Ende); 38-Fälle-Suite + 73-Fälle-Guard-Suite mit Entscheidungs- statt Wortlaut-Assertions; Fehlerkultur (Anomaliedatei, fail-open, Abbruch statt Annahme) ist im Code verankert, nicht nur beschrieben. Abzüge: (−1) das Gewinner-Artefakt `ladder` fehlt im Repo — der Stack ist ohne es nicht reproduzierbar; (−1) Portabilität (hartcodierte Pfade, maschinengebundene v5-Skripte, tiktoken-Abhängigkeit ohne requirements-Hinweis, Kalibrierung 1-Repo-begrenzt).
