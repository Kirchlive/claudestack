# Validierung — Prüfergebnisse und Paket-Eigenprüfung

_Stand: 2026-08-13 · Verdichtung aus `vergleich-4wege.md`,
`zweitvalidierung-update.md`, `SQUEEZ-RTK-LADDER-ANALYSE.md` (alle in
/mnt/agents/output/) plus der real ausgeführten Eigenprüfung dieses Pakets
(§ 6, mit Befehlen und Exit-Codes)._

---

## 1. 4-Wege-Datensatz-Abgleich (32 Themen, 5-Punkte-Skala)

| Datensatz | Summe (max 160) | Rolle |
|---|---|---|
| **OPUS_V4** | **144** *(korrigiert v2, ursprünglich fälschlich 142)* | vollständigster, selbstkritischster Datensatz; Inventar + Eigenmessungen |
| **GPT56** | **130** *(korrigiert v2, ursprünglich 127)* | stärkste native/technische Korrektur, bester Rollout, einziger produktionsnaher Code |
| **KIMI** | **111** *(korrigiert v2, ursprünglich 109; Nenner 155 wg. 1× n.v.)* | Referenz für Mechanismus-Logik, Cache/Proxy/Memory-Tiefe, Ladder-Urheber |
| **K3** (unsere Validierung) | **107** *(korrigiert v2, ursprünglich 103)* | Agenten-Ranking, externe Verifikation, kein eigener Katalog |

Einordnung: OPUS_V4 = Inventar/Flächenmodell, GPT56 = Werkzeuge/Rollout,
KIMI = Konzept-Tiefe, K3 = Verifikation. Themen-Scores (5/4/3/2/1) und
Begründungen je Thema: `vergleich-4wege.md`.

## 2. Tokenberechnungen T1–T9 (aus Bestandsdaten, keine Neumessung)

| # | Berechnung | Ergebnis | Evidenz |
|---|---|---|---|
| T1 | Vermeidbarer Prefix/Session — *korrigiert v2* | **~5.586 Tokens** messnah (Guidance 3.500 + MCP 286 + Git-Instr. 1.800); Skill-Listing als Budgetanteil (0.01 × 1M ≈ 10.000), **kein** lineares Stückkostenmodell; + Memory-MCP-Verzicht ~6.500 kond. | mittel |
| T2 | Rules-Re-Injektion (Katastrophenfall) | 93.000 Tokens = **46 % eines 200k-Fensters** je Compact-Zyklus (Issue #32057) | [PROJEKT] |
| T3 | Nenner-Überschätzung Output-Filter | Fixture 63 % vs. billed 2 % vs. Median 0 % → **Faktor ~32×** | [PROJEKT]+[GEMESSEN] |
| T4 | Ladder-Geltungsbereich | −27,2 % (Quelltext < 32 KB, gebündelt) vs. −0,3 % (gepaart, Serie) | [GEMESSEN] |
| T5 | Nicht-Additivität | Stapel 60/30/10 %: korrekt **74,8 %**, nicht 100 % | Rechenregel |
| T6 | Session-Kurve (100 Turns à 2k) | 10,1 M vs. 3,62 M Prefix-Tokens → **−64 %** durch Cap | Modell auf [PROJEKT] |
| T7 | Cache-Hit-Ökonomie (100k Tokens) | Hit 92,44→94,66 % → **−13,7 %** Input-Kosten | [PROJEKT]+Preislogik |
| T8 | Guard-Break-even | greift ≥ 4.096 B; ersetzt nur bei ≥ 512 B UND ≥ 15 % | Pilotwerte |
| T9 | Ehrliche E2E-Erwartung | Profil A einstellig; Profil B 15–30 % Input; ponytail −10,3 % (p=0,004) | Konsens aller 4 Datensätze |

**Kernschluss:** Die größten belegbaren Hebel liegen in T1/T2/T6/T7
(Vermeiden + Session-Grenze + Cache), nicht in T3/T4 (Filter-Kompression).

## 3. 1–100-Bewertung (Rubric: Evidenz 25 / Aktualität 20 / Lizenz 15 / Fit 20 / Konvergenz 10 / Risiko 10)

### Kern-Kandidaten (Score → Entscheidung)

| Repo | Ev | Akt | Liz | Fit | Kon | Ris | **Score** | Entscheidung |
|---|---|---|---|---|---|---|---|---|
| ccusage/ccusage | 20 | 20 | 15 | 18 | 10 | 10 | **93** | KERN (Messung) |
| DietrichGebert/ponytail | 25 | 17 | 15 | 19 | 8 | 8 | **92** | KERN (Verhalten) |
| OthmanAdi/planning-with-files | 15 | 18 | 15 | 19 | 10 | 10 | **87** | KERN (Persistenz) |
| colbymchenry/codegraph | 18 | 18 | 15 | 15 | 10 | 7 | **83** | KERN bedingt (ab ~300 Dateien) |
| bash-dump-guard (Eigenbau) | 20 | 18 | 13 | 16 | 8 | 8 | **83** | KERN (nach Fix B1–B4) |
| aerovato/magic-compact | 15 | 19 | 15 | 16 | 8 | 9 | **82** | KERN bedingt (Profil B) |
| cnighswonger/claude-code-cache-fix | 18 | 17 | 15 | 14 | 10 | 8 | **82** | konditional (Cache-Fehler) |
| getagentseal/codeburn | 15 | 18 | 15 | 16 | 8 | 9 | **81** | KERN (Governance) |
| claudioemmanuel/squeez | 15 | 19 | 15 | 14 | 9 | 8 | **80** | A/B-Gegenpart (Turnkey) |
| PCIRCLE-AI/toonify-mcp | 15 | 20 | 15 | 13 | 8 | 7 | **78** | rehabilitiert, Pin ≥ 0.8.2 |
| mksglu/context-mode | 20 | 19 | 5 | 17 | 8 | 8 | **77** | KERN bedingt (ELv2) |
| fajarhide/omni | 15 | 20 | 15 | 14 | 5 | 8 | **77** | Dedup-Pilot |
| fkiene/llmtrim | 16 | 19 | 12 | 13 | 8 | 7 | **75** | Proxy (API-Billing) |
| oraios/serena | 12 | 19 | 15 | 14 | 6 | 8 | **74** | Spezial (Edit) |
| DeusData/codebase-memory-mcp | 12 | 19 | 15 | 14 | 7 | 7 | **74** | Spezial (Monorepo) |
| NodeNestor/claude-rolling-context | 14 | 19 | 15 | 12 | 5 | 8 | **73** | Spezial (Abo) |
| agiwhitelist/tokdiet | 17 | 12 | 15 | 14 | 8 | 6 | **72** | API-Billing + Audit-Gate |
| mpecan/tokf | 12 | 18 | 15 | 13 | 6 | 8 | **72** | Filter-Alternative |
| edouard-claude/snip | 12 | 16 | 15 | 12 | 8 | 8 | **71** | testbarer Filter |
| manojmallick/sigmap | 12 | 14 | 15 | 14 | 7 | 8 | **70** | CLI-Alternative |
| u-ichi/compact-plus | 13 | 13 | 15 | 16 | 3 | 8 | **68** | Pilot Ladder-Stufe 2 |
| yurukusa/cc-safe-setup | 10 | 20 | 15 | 13 | 3 | 7 | **68** | Referenz/Teile-Spender |
| atlassian-labs/mcp-compressor | 12 | 14 | 15 | 13 | 5 | 8 | **67** | konditional (≥ 2 MCPs) |
| yoeld-wix/quiet-bash | 16 | 10 | 15 | 13 | 5 | 6 | **65** | A/B-Kandidat (abgestuft) |
| zdk/lowfat | 13 | 11 | 15 | 12 | 5 | 8 | **64** | enges Pilot-Gate |
| NodeNestor/claude-lean-context | 8 | 12 | 15 | 12 | 4 | 5 | **56** | Watchlist |

### Abgesagt (unverändert, Trigger in KONZEPT.md § 8)

rtk (offene Permission-Issues #1155/#3152, +7,6 %/+18 % gemessen; *CVE-Attribution v2 korrigiert: CVE-2026-33068 betrifft Claude Code selbst*) · caveman (8,5 % statt 65 %) ·
headroom (#2438: 2–7×) · pxpipe/OmniGlyph (Hex-Recall 0–2/15) · 500xCompressor
(27–38 % Fähigkeitsverlust) · LLMLingua-2 · globale Memory-MCPs · semtrim ·
token-optimizer (PolyForm) · sqz (Elastic 2.0).

## 4. Unstimmigkeiten U1–U9 (Auflösung)

| # | Unstimmigkeit | Auflösung |
|---|---|---|
| U1 | toonify-mcp „defekt" vs. „Kern #5" | Beides zeitabhängig richtig: additionalContext-Defekt real, in **0.8.0/0.8.1 (12.08.) gefixt** (`updatedToolOutput`, 63,8 % gemessen, ReDoS-Fix) → rehabilitiert mit Pin ≥ 0.8.2 |
| U2 | quiet-bash „Turnkey-Favorit" | 5★, 38 Tage still, 0 Websuche-Treffer → A/B-Kandidat, kein Favorit |
| U3 | tokdiet „entwertet" vs. „Profil B" | Repo lebt (~53★), A/B-Doku stark, **aber** npm-audit-Befunde + 56d still + nur API-Billing → konditional mit Security-Audit-Gate |
| U4 | lowfat „Pilot" | 36d still, nahe 60-Tage-Regel → enges Pilot-Gate, kein Kern |
| U5 | KIMI-Referenzen 156 vs. 157 | Zählerfehler GPT56 (gering) |
| U6 | OPUS v4: 249 „freigabefähig" enthält 33 lizenzlose; Off-by-one-Cluster; Dubletten | Bestätigt → Paket konsolidiert: **373 eindeutig, Lizenz-Gate wörtlich (= 216)** |
| U7 | claude-lean-context „starke Alternative" vs. Watchlist | Watchlist-Urteil gilt (1★), Katalog-Zeile korrigiert |
| U8 | KIMI-Guard-Skizze String- statt Objektform | Wird von Claude Code ignoriert → nicht als Code übernehmen; GPT-Suite ist einzige valide Implementierung |
| U9 | Issue-Tiefe je Repo | Rate-Limit: nur Stichproben live (toonify/quiet-bash/tokdiet/compact-plus); rtk- und headroom-Absagen issue-bestätigt |

## 5. Squeez-RTK-Ladder — Messreihen v1–v5 (fresh input = uncached + cache_creation)

| Serie | Aufbau | Median A | Median B | Gepaart | Streuung | Verdikt |
|---|---|---|---|---|---|---|
| v1 | 3+3, **kein eingefrorenes Korpus** | 152.180 | 211.909 | +39,3 % | 19 % | **verworfen** (Korpus-Drift, 2 ungültige Läufe) |
| v2 | Hook-Gate, eingefroren | 158.940 | 174.169 | **+9,6 %** | 36 % | „kein Nutzen", Gate teurer |
| v3 | nur Arm A, Quelltext | 173.715 | — | — | — | abgebrochen |
| v4 | Kommando-Leiter, 3+3 | 200.726 | 200.050 | **−0,3 %** | 33 %/27 % | Null-Ergebnis im Rauschen |
| v5 | Quelltext gebündelt, 3+3 | 117.880 | 85.783 | **−27,2 %** | 3 %/7 % | **Effekt bewiesen** (Qualität 6/6 bestanden) |

Weitere harte Messwerte: Token-Dichte 318 Tok/1000 Zeichen (chars/4
unterschätzt ~27 %); Latenz squeez 86,3 ms vs. rtk 5,7 ms/Call; Kalibrierung
`minChars: 1100`, `CHARS_PER_LINE: 43` (MEASURED, 1 Repo); Abdeckung 806
Tool-Calls (Bash 40,6 % = einziger Stash-Pfad); squeez-MCP-Startkontext 286
Tok/Session; `ladder`-Kommando 0; Break-even-Retrieve-Rate 47 %.
Geltungsbereich: **Strukturfragen an Quelltext < 32 KB**. Widertlegt:
Hook-Gate (+9,6 %), Kommando-Leiter über alle Typen (−0,3 %), R1 als
Standardsicht (stille Kürzung), Cross-Call-Dedup (sessionübergreifend).

## 6. Paket-Eigenprüfung (alle Befehle real ausgeführt, 2026-08-13)

Umgebung: Node v20.20.2, Linux (Container), kein `claude`-CLI, kein `rtk`-Binary,
Dateisystem `/mnt/agents` ohne Execute-Bit-Unterstützung (FUSE) — Aufrufe daher
via `bash`/`node` (B2-Fix greift genau hier).

### 6.1 Syntax

| Befehl | Ergebnis |
|---|---|
| `node --check` auf alle 17 `*.mjs` unter `hooks/` (inkl. lib/ + tests/) | **17/17 OK** (Exit 0) |
| `bash -n scripts/install.sh scripts/verify-package.sh` | **2/2 OK** |
| `node -e 'JSON.parse(...)' config/settings.json` + alle `config/*.json` via `python3 -m json.tool` | **valide** |

### 6.2 Self-Tests und Suiten

| Befehl | Exit | Kurzoutput |
|---|---|---|
| `node hooks/bash-dump-guard.mjs --self-test` | 0 | `bash-dump-guard v3.1 self-test: OK` |
| `node hooks/prefix-budget.mjs --self-test` | 0 | `prefix-budget self-test: OK (inkl. OPUS-Kollisionserkennung)` |
| `node hooks/read-context-guard.mjs --self-test` | 0 | `read-context-guard self-test: OK` |
| `node hooks/session-economy.mjs --self-test` | 0 | `session-economy self-test: OK` |
| `node hooks/claude-hook-capability-canary.mjs --self-test` | 0 | `claude-hook-capability-canary self-test: OK` |
| `node hooks/tests/hook-contract-smoke.mjs` | 0 | `hook contract smoke: OK` |
| `node hooks/tests/test-guard-all.mjs` | 0 | **73 PASS / 0 FAIL** — `ALLE PRUEFUNGEN BESTANDEN` |
| `node hooks/tests/test-ladder.mjs` | 1 | **37 passed, 1 failed** — einziger Fail: `source blob is swapped for the rtk view → got 'passthrough'` (rtk-Binary fehlt; dokumentierter Fail-open-Fall, auf der Originalmaschine 38/38) |

### 6.3 Simulierte Hook-Szenarien bash-dump-guard v3.1 (Fixe B3/B4)

| Szenario | Befehl (Config via `BASH_DUMP_GUARD_CONFIG`) | Ergebnis |
|---|---|---|
| 1. Kompression | 400-zeiliger Test-Output, `hookActivation: "replace"` | `updatedToolOutput` emittiert, 636 Zeichen, Raw-Archiv recoverbar — **OK** |
| 2. B3 Secret-Overlap | Payload mit `api_key=sk-ant-…`, `password=…`, `sk-proj-…`, `Bearer …` | Ausgabe: `api_key=[REDACTED]`, `password=[REDACTED]`, `[REDACTED API KEY]`, `Bearer [REDACTED]` — **kein** `[REDACTED ANTHROPIC KEY]`-Overlap mehr, jede Fundstelle genau einmal redaktiert — **OK** |
| 3. B4 stdin-Limit | 200-KB-Payload, `maxStdinBytes: 100000` | leere stdout, Exit 0, stderr `fail-open: stdin exceeds maxStdinBytes … passing through unmodified` — **OK** |

### 6.4 Gesamtverifikation

| Befehl | Exit | Kurzoutput |
|---|---|---|
| `bash scripts/verify-package.sh` | 0 | alle Self-Tests + Suiten + 9 Semantik-Checks + Guard-Pilotwerte + native Budget-Alignment (24000 → 17280/24000) + Installer-Smoke in isoliertem HOME (Merge + Idempotenz) → **`package verification: OK`** |

### 6.5 Bekannte Umgebungs-Einschränkungen (keine Paket-Defekte)

- `rtk`-Binary nicht installiert → 1/38 Ladder-Fälle fail-open (dokumentiert).
- `claude`-CLI nicht vorhanden → Live-Canary-Probe hier nicht lauffähig
  (Self-Test der Canary läuft; Probe ist Rollout-Schritt Wave 3).
- FUSE-Dateisystem ohne Execute-Bits → `chmod +x` wirkungslos; Skripte werden
  via `bash` aufgerufen (B2), verify-package prüft Execute-Bits FS-abhängig.
