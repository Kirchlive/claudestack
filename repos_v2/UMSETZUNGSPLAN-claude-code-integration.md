# UMSETZUNGSPLAN
## Claude-Code-Integration der drei Token-Stack-Pakete aus `repos_v2`

**Quelle:** `github.com/Kirchlive/claudestack/tree/main/repos_v2` · Spezifikation: `CLAUDESTACK-FINALIZE.md` (v1.0, 2026-08-13)
**Erstellt:** 2026-08-13 · **Status:** Arbeitsplan zur Vorbereitung der Repos für die Claude-Code-Integration
**Grundprinzip der Spezifikation:** *„Kein Merge. Ein Träger, gezielte Pfropfungen, Messung vor Installation."*

---

# 0. Management Summary

Drei eigenständig entstandene Pakete (`GPT56SOL`, `K3SWARM`, `OPUS5`) adressieren dasselbe Problem — Token-Ökonomie in Claude Code — aus drei verschiedenen Schichten: **Runtime**, **Werkzeugkiste**, **Steuerung/Nachweis**. Die FINALIZE-Spezifikation hat entschieden:

1. **GPT56SOL ist der Träger** — einziges Paket mit `package.json`, JSON-Schema, echter Testsuite (32/32 grün, eigenständig verifiziert), Prüfsummen und architektonisch erzwungenem Einzel-Mutator. Es installiert im Auslieferungszustand nichts (`shadow`-Default).
2. **K3SWARM liefert Pfropfungen** — 8 Flächenhooks (Read, Reread, Session, Prefix, Canary, Observer) als *nicht registrierte* Optionen plus die einzige real ausgeführte Testevidenz.
3. **OPUS5 liefert Pfropfungen** — Governance komplett: `waves/`-Rolloutplan, `DEFEKTE.md`-Register, A/B-Messharness, Evidenzbücher.
4. **Verboten ist der Merge auf Mutator-Flächen** (Gesetz I: *höchstens ein mutierender Owner pro Kontextfläche*). Die Inventur bestätigt drei konkurrierende Bash-Output-Mutatoren — genau einer darf überleben.
5. **Phase 0 kommt zuerst und braucht keines der Pakete:** Baseline-Messung (`/context`), Plugin-Diät (25 aktive Plugins), Root-`CLAUDE.md`-Byte-Deckel (≤ 4 KB), Reduktion auf einen mutierenden `PreToolUse:Bash`-Hook. Sie liefert die Zahl, gegen die alles Weitere gemessen wird.

**Ergebnis dieses Plans:** Ein Zielpaket `claude-code-token-stack/` mit ~50 betriebsrelevanten Dateien (+ 34 archivierte Evidenzdateien), aufgebaut in 8 Phasen (0–7), davon Phasen 0–2 ohne jedes Paket, mit harten Akzeptanzgates je Phase.

**Verifikationsbefund vorab:** Die maschinelle Kollisionsinventur (112 Paketdateien, SHA-256) bestätigt die Spezifikation in allen geprüften Punkten — mit einer Ausnahme: **Die Bilanz-Zeile der FINALIZE (24/44/34/11/3) widerspricht ihren eigenen C.2-Tabellen (11/54/34/13/1+3).** Der Plan folgt den Tabellen (siehe §1.3, F-1).

---

# 1. Ausgangslage: Analyse des Datenbestands `repos_v2`

## 1.1 Bestand und Statistik

| Bereich | Dateien | Rolle im Zusammenschluss |
|---|---:|---|
| `gpt56sol_claude-code-token-stack/` | 33 | **TRAEGER** — Runtime-Architektur (Dispatcher, Schema, Tests, CLI, Verifier) |
| `k3swarm_claude-token-stack-paket/` | 54 | **PFROPFUNG** — Hook-Inventar (13 Hooks + Shared-Lib + 3 Testsuiten; FINALIZE sagt „15", real 13, s. R-12), Installer-Know-how, ausgeführte Testevidenz, Werkzeugkatalog |
| `opus5_claude-token-stack/` | 25 Dateien + 1 leeres Defekt-Verzeichnis | **PFROPFUNG** — Governance (Waves, Defekte, Messharness, Evidenzbücher) |
| `meta_validation/` | 3 | Drei Meta-Validierungsrunden (3-Wege-Prüfung der Endartefakte) |
| Wurzel (`CLAUDESTACK-FINALIZE.md`, `TREE.txt`) | 2 | Spezifikation bzw. Baumabzug |
| **Summe** | **117 Dateien** (davon 112 Paketdateien + 1 leeres Verzeichnis = 113 vom FINALIZE gezählte Einträge) | |

Größenvolumen: ~1,5 MB Text. Größte Einzeldateien: `bash-dump-guard.mjs` (49 K, verworfen), `KONZEPT-v5.md` (43 K, Archiv), `06-incoming-reconciliation.md` (41 K, Archiv).

**Zählweisen-Klärung (verifiziert):** Die FINALIZE spricht von „113 Dateien" (33+54+26). Tatsächlich liegen **112 Dateien** vor; die 113. Position ist das leere Verzeichnis `{waves,rules,hooks,scripts,config}` in OPUS5 — ein Baumdefekt (nicht expandierte Brace-Expansion), der in Tabelle C.2.3 als eigene Zeile mitgezählt wird.

## 1.2 Die drei Pakete in je einem Satz (aus FINALIZE Teil A, verifiziert)

| Paket | Was es ist | Stärke | Kernschwäche |
|---|---|---|---|
| **GPT56SOL** | Installierbares Softwareprodukt mit einem einzigen Dispatcher (`src/stack.mjs`, 17 K), das im Auslieferungszustand nichts tut | Einzige Architektur mit genau einem Mutator, Schema, Tests (32/32 grün), Prüfsummen | Nur ein Hook — Read-, Session-, Prefix-Flächen unbesetzt; keine Canary-Implementierung trotz ADR-005; kein Installer |
| **K3SWARM** | Vollständige Hook-Werkstatt (13 Hooks, 3 Testsuiten) mit Installer, sofort arbeitsfähig | Vollständigste Flächenabdeckung; einzige real ausgeführte Paketprüfung (73 PASS/0 FAIL; 37/38 Ladder) | Zwei Bash-Mutatoren im selben Paket (verletzt Gesetz I); `install.sh` merged `settings.json` ohne Baseline; Ladder-Rungs bei gemessenem Null-/Negativbefund |
| **OPUS5** | Steuerungs- und Nachweisapparat: Konzept (43 K), Wellenplan, Defektregister, Messharness | `DEFEKTE.md` (7 Defekte mit Nachweis), `waves/` mit Zustandsdatei, einziger echter Messteil (`ab-harness.sh`, `repo-audit.py`) | Nur zwei eigene Hooks; dritter Dispatcher auf derselben Fläche; Dubletten- und Verzeichnisdefekte im Baum |

## 1.3 Verifikation der FINALIZE-Kernbehauptungen

Vor der Planung wurden die tragenden Behauptungen der Spezifikation maschinell gegen den Datenbestand geprüft:

| # | Behauptung der FINALIZE | Ergebnis | Beleg |
|---|---|---|---|
| F-1 | Bilanz: „24 unverändert, 44 angepasst, 34 archiviert, 11 verworfen, 3 neu" | **ABWEICHUNG** — die C.2-Tabellen selbst ergeben **11 unverändert · 54 angepasst · 34 archiviert · 13 verworfen** (Emoji-Zählung 11/54/34/13, davon 1 verworfenes leeres Verzeichnis, 1 verworfene Binärdublette) plus 3 neu (C.2.4). | eigene Emoji-/Tabellen-Zählung |
| F-2 | Drei byteidentische Dubletten in OPUS5 (`DEFEKTE.md`, `judgments.json`, `KONZEPT-v5.md` je Wurzel + `validate/`) | **BESTÄTIGT** — exakt diese 3 Hash-Gruppen, paketintern, ~54 KB | SHA-256-Inventur |
| F-3 | Keine byteidentischen Dateien über Paketgrenzen | **BESTÄTIGT** (implizit) — alle Dubletten sind paketintern; paketübergreifend existieren nur Basename-Kollisionen mit verschiedenem Inhalt | SHA-256-Inventur |
| F-4 | Ladder-Rungs gemessen: Gate **+9,6 %**, Filter **−0,3 %** (beide verworfen) | **BESTÄTIGT** — Gate v2: 158.940→174.169 (+9,6 %, 36 % Streuung); Kommando v4: 200.726→200.050 (−0,3 %, 27–33 % Streuung) | `k3swarm docs/SQUEEZ-RTK-LADDER-ANALYSE.md:60,62`; `gpt56sol validate/02…:50,52` |
| F-5 | Root-`CLAUDE.md` kostet **1.975 Token bei 8,4 KB** (Always-on-Kandidat) | **BESTÄTIGT** — 8.416 Bytes → 1.975 o200k_base-Tokens | `gpt56sol validate/02…:95`, `03-file-token-metrics.json` |
| F-6 | K3SWARM-Testevidenz: **73 PASS/0 FAIL**, **37/38** Ladder | **BESTÄTIGT mit Einschränkung** — Funktionstests real ausgeführt (Exit-Codes dokumentiert); der eine Ladder-Fail = fehlendes `rtk`-Binary (dokumentiert). Token-/Latenzwerte (318 Tok/1k Z., 86,3 ms) sind Fremdmessungen (`reported_only`), keine Rohlogs — GPT56 wertet die Evidenz als „nicht unabhängig reproduziert" | `k3swarm VALIDIERUNG.md §6`; `MASTERPLAN.md:13`; `meta_validation/META-VALIDIERUNG-3RUNDE-FIXES.md:76`; `gpt56sol validate/05…:435` (L10) |
| F-7 | Drei mutierende `PreToolUse:Bash`- bzw. Bash-Output-Kandidaten (Gesetz-I-Konflikt) | **BESTÄTIGT** — Bash-Output-Mutation (`PostToolUse`, `updatedToolOutput`): `gpt56sol src/stack.mjs`, `k3swarm hooks/bash-dump-guard.mjs`, `opus5 hooks/bash-owner-dispatch.mjs` (+ verworfener `ladder-retrieve-filter.mjs`) | Hook-Inventur §1.4 |
| F-8 | „25 aktive Plugins" als Phase-0-Ausgangslage | **BESTÄTIGT** — Ausgangsmessung 13.08.2026: 25 aktive Plugins aus 18 Marketplaces (28 bekannte) | `opus5 config/plugin-diet.md` |
| F-9 | Fünf native env-Deckel + `ENABLE_TOOL_SEARCH`-Prüfung | **BESTÄTIGT** — `MAX_MCP_OUTPUT_TOKENS=8000`, `BASH_MAX_OUTPUT_LENGTH=24000`, `TASK_MAX_OUTPUT_LENGTH=12000`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS=16000`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=78`; `ENABLE_TOOL_SEARCH` bewusst *nicht* gesetzt (nur prüfen) | `k3swarm config/native-token-limits.example.jsonc` |
| F-10 | GPT56SOL-Paketzahlen (33 Dateien, `src/stack.mjs` 17 K, Shim 308 B) | **BESTÄTIGT** — 33 Dateien; Testsuite 32/32 grün (`npm test`, Node v20.20.2) | Inventur, Testlauf |
| F-11 | ponytail als einziger Tier-1-belegter Fremdwerkzeug-Gewinn (−10,3 %, p=0,004) | **BESTÄTIGT** (JetBrains-Benchmark-Serie, in allen drei Paketen zitiert) | `k3swarm docs/changes.md:15` u.a. |

**Konsequenz aus F-1:** Dieser Plan folgt den C.2-Tabellen (11/54/34/13) und markiert die Bilanz-Zeile als zu korrigierenden Dokumentationsdefekt (Aufnahme in `DEFEKTE.md` des Zielpakets, Arbeitspaket AP-5.3).

## 1.4 Mechanische Kollisionsinventur (FINALIZE Teil D.1 — ausgeführt)

Die in der Spezifikation geforderte Inventur wurde über alle 112 Paketdateien ausgeführt; vollständiges Ergebnis als TSV im Anhang (§8.2). Kernbefunde:

**a) Byteidentische Dubletten:** nur die 3 bekannten OPUS5-Paare (F-2). Keine paketübergreifenden Byte-Dubletten.

**b) Basename-Kollisionen (gleicher Name, verschiedener Inhalt) — 7 Fälle:**

| Basename | Vorkommen | Konflikttyp | Auflösung im Zielpaket |
|---|---|---|---|
| `prefix-budget.mjs` | K3 (23.977 B) ↔ OPUS5 (14.582 B) | **Implementierungs-Duell** (C.3.8) | Diff gegen reale `settings.json`; OPUS-Fassung trägt dokumentierten D1-Fix |
| `context-surface-owners.yaml` | K3 (4.865 B) ↔ OPUS5 (5.490 B) | Daten-Konflikt (C.3.2) | Schlüsselmengen-Diff → eine schemavalidierbare JSON-Registry |
| `token-efficiency.rules.md` | K3 (7.771 B) ↔ OPUS5 (5.574 B) | Text-Konflikt (C.3.3) | Inhaltliche Ergänzung der GPT-Kurzfassung (< 3 KB) |
| `TASK-STATE.template.md` | K3 (1.391 B) ↔ OPUS5 (611 B) | Beide verworfen | GPT-`templates/TASK-STATE.md` (1,0 K) gewinnt |
| `MASTERPLAN.md` | K3 (7.520 B) ↔ OPUS5 (3.767 B) | Beide Archiv | `evidence/`; `waves/` gewinnt als Fahrplan |
| `README.md` | 3 verschiedene (je Paket) | Paket-Identität | GPT-README gewinnt + Herkunftsabschnitt |
| `claudestack.mjs` | GPT `bin/` (2.871 B) ↔ GPT `hooks/` (308 B) | **paketintern, beide behalten** | Keine Kollision im Zielbaum (verschiedene Pfade: CLI vs. Hook-Shim) — beim Kopieren auf gleichnamige Ziele achten |

**c) Mutatoren je Hook-Fläche (Gesetz-I-Prüfung):**

| Fläche (Event) | Mutierende Kandidaten | Entscheidung |
|---|---|---|
| `PostToolUse:Bash` (Output-Mutation via `updatedToolOutput`) | ① `gpt56sol src/stack.mjs` · ② `k3swarm bash-dump-guard.mjs` (verworfen) · ③ `opus5 bash-owner-dispatch.mjs` (Archiv) · ④ `k3swarm ladder-retrieve-filter.mjs` (verworfen) | **① alleiniger Owner** (Träger-Dispatcher) |
| `PreToolUse:Bash` (Deny-Gate via `permissionDecision`) | `k3swarm bash-dump-gate.mjs` (verworfen/separate Policy-Frage) · `k3swarm ladder-retrieve-gate.mjs` (verworfen) | **vorerst unbesetzt**; Dispatcher prüft nur, ob ein Fremd-Mutator kollidiert — blockiert aber nicht (C.3.1.2) |
| `PreToolUse:Read` | `k3swarm read-context-guard.mjs` | optional, **nicht registriert** |
| Prefix (Observer) | `k3swarm prefix-budget.mjs` ↔ `opus5 prefix-budget.mjs` | Duell C.3.8, Observer ohne Mutationsrecht |
| Session/Compaction | `k3swarm session-economy.mjs` (Observer) | optional, nicht registriert |
| Capability-Probe | `k3swarm claude-hook-capability-canary.mjs` | kein Hook — manueller/CLI-Aufruf (C.3.7) |

**d) Owner-Registry-Konflikte (Schlüsselmengen-Diff, C.3.2):** Die drei Registries verwenden **disjunkte Vokabulare** (GPT-JSON: 9 englische Snake-Case-Surfaces; K3-YAML: 10; OPUS-YAML: 11 deutsch benannte). Semantische Zuordnung und Konflikte:

| Semantische Fläche | GPT-JSON | K3-YAML | OPUS-YAML | Konflikt |
|---|---|---|---|---|
| Bash-Output | `bash_output` → candidate: claudestack-dispatcher | `posttool_bash_output` → bash-dump-guard.mjs | `PostToolUse Bash` → bash-owner-dispatch.mjs | **3 Kandidaten → GPT-Dispatcher** |
| Bash-Pre-Gate | `bash_pre_execution_gate` → root-pretool-deny-gate (extern) | `pretool_bash_rewrite` → bash-dump-gate.mjs | `PreToolUse Bash` → bash-owner-dispatch.mjs | **3 Kandidaten → vorerst unbesetzt** |
| Read | `read_advisory` → candidate: dispatcher | `native_read_grep_glob` → claude-native | `Read` → read-context-guard.mjs | **GPT-Advisory vs. K3-Guard → Guard optional/unregistriert** |
| Prefix | *(fehlt)* | `prefix_and_rules` → Nutzer | `Request-Prefix` → Projekt/Nutzer + Observer prefix-budget | nur K3/OPUS; **bleibt Handarbeit + Observer** |
| Retrieval | `code_retrieval` → Wahl aus 4 | `code_index` → codegraph | `Code-Retrieval` → nativ + bedingt codegraph | **Default-Divergenz → „genau einer, aufgabenabhängig"** |
| Session/Compaction | `compaction` → nativ | `history_compaction` → nativ | `Sitzungsgrenze` → TASK-STATE + /clear | keiner |
| Messung/Beobachtung | `usage_observer` → null | `usage_measurement` → null | `Beobachtung` → /context, /usage, ccusage, codeburn | keiner (ccusage unstrittig) |
| Externe Massendaten | `external_data` → context-mode-mcp-only | `external_web_mcp_bulk` → context-mode | `Externe Massendaten` → **UNBESETZT_LIZENZ** | **Lizenz-Fence (Elastic 2.0) → unbesetzt** |
| API-Proxy | `api_proxy` → null | *(fehlt)* | `API-Traffic` → null, ausgesetzt (Cache-Risiko) | **unbesetzt nach Messbefund** |
| Nur Einzelpaket | `bash_input` (nativ) | `persistent_task_state`, `prompt_injection_observers` | `Langzeit-Memory` (claude-mem #3480 offen!), `Tool-Definitionen` (ENABLE_TOOL_SEARCH) | als `note`-Felder übernehmen |

---

# 2. Strategie und verbindliche Leitplanken

Die folgenden Regeln sind dem Korpus (DECISIONS.md/ADRs, DEFEKTE.md, FINALIZE) entnommen und für die gesamte Umsetzung **verbindlich**:

| # | Leitplanke | Inhalt | Herkunft |
|---|---|---|---|
| L-1 | **Gesetz I — Ein Mutator je Fläche** | Höchstens ein mutierender Owner pro Kontextfläche. Observer (ohne Mutationsrecht) dürfen parallel laufen, sofern sie nichts mutieren und nichts injizieren (OPUS R8). | GPT policy `at_most_one_mutating_owner_per_surface`; OPUS `invariants` |
| L-2 | **Nativ zuerst** | Native Limits/Mechanismen (env-Deckel, `/context`, Tool Search, Autocompact) vor jeder Drittanbieter-Kompression. | K3 native-token-limits; FINALIZE B.3 |
| L-3 | **Messung vor Installation** | Kein Werkzeug wird installiert/erzwungen, bevor eine gepaarte A/B-Messung einen Nettogewinn zeigt. `shadow` ist der Einstiegsmodus, `enforce` nur nach Net-Win-Gate. | FINALIZE D.2; ADR-012-Geist (Fragment statt Installer) |
| L-4 | **Sicherheitsveto vor Mittelwert** | Bei Divergenz der Bewertungen gilt das Korrektheits-/Sicherheitsveto (Permission-Befund schlägt Score-Mittelung); Dissens wird nicht gemittelt, sondern maschinenlesbar festgehalten. | ADR-013/014; FINALIZE B.2 |
| L-5 | **Recovery vor Elision** | Kürzung/Filterung von Tool-Output nur mit Wiederherstellungspfad; kein stiller Verlust. | GPT-Architektur (Dispatcher-Stufen) |
| L-6 | **Fail-loud, nie fail-silent** | Fehlende Prüfgegenstände, fehlende Fähigkeitsdateien, fehlende Baselines werden als Befund ausgewiesen — niemals als Bestanden durchgewunken (Lehre aus D2 und den zwei stillen Suiten). | OPUS DEFEKTE D2; C.3.5 |
| L-7 | **Byte-Deckel für den Prefix** | Root-`CLAUDE.md`/Template ≤ 4 KB hart; Always-on-Prefix ist der teuerste Posten (1.975 Token/8,4 KB gemessen) und wird bei dateiberührenden Tool-Calls neu injiziert. | C.3.4; F-5 |
| L-8 | **Lizenz-Fences respektieren** | `mksglu/context-mode` (Elastic 2.0) und `alexgreensh/token-optimizer` (PolyForm Noncommercial) sind für dienstliche Nutzung gesperrt — die Flächen „externe Massendaten" und „Prefix-Wächter" bleiben bewusst unbesetzt bzw. Handarbeit. | FINALIZE B.1.1 |
| L-9 | **Ladder bleibt aus** | `ladder-retrieve-gate`/`ladder-retrieve-filter` sind gemessen (+9,6 % / −0,3 %) und werden nicht übernommen; Code nur als Evidenz archiviert. | F-4 |
| L-10 | **Fragment statt Volltemplate** | Die CLI erzeugt ein `settings.json`-Fragment, der Mensch übernimmt es. Kein automatisches Mergen der `settings.json` (K3-`install.sh` wird verworfen). | ADR-012; C.2.2 |

**Flächenbelegung im Zielbild (maschinenlesbarer Endblock der FINALIZE, verifiziert):**

| Fläche | Besetzung | Modus | Grund |
|---|---|---|---|
| Basis | Claude Code nativ | immer | — |
| Messung | `ccusage` (Observer) + `03-measure-token-surfaces.py` | sofort | kein Mutationsrecht |
| Prefix | **UNBESETZT** | Handarbeit, Phase 0 | PolyForm-Lizenzfence (L-8) |
| Externe Massendaten | **UNBESETZT** | native Mittel | Elastic-2.0-Lizenzfence (L-8) |
| Bash-Output | `src/stack.mjs` (GPT-Dispatcher) | `off` → `shadow` → Canary → `enforce` | ein Owner (L-1) |
| Read | K3-Guards (`read-context-guard` + Module) | optional, **nicht registriert** | nach Baseline |
| Retrieval | `codegraph` **oder** `sigmap` **oder** `codebase-memory-mcp` | genau einer, aufgabenabhängig | nie parallel zu zweitem Index |
| Verhalten | `ponytail` als kurze Regel | on demand | Prefix-Kosten; einziger Tier-1-Beleg (−10,3 %) |
| Session | native Grenze + TASK-STATE | sofort | — |
| Proxy | **UNBESETZT** | erst nach gemessenem Cache-Defekt | CA-/Cache-Risiko |
| Format | **UNBESETZT** | `toonify` erst nach Audit | Funktion ungeprüft |

---

# 3. Zielbild

## 3.1 Zielverzeichnisbaum (FINALIZE C.1, mit Dateibezug)

```
claude-code-token-stack/
├── package.json              ✏️ Version 2.0.0, files-Feld erweitert
├── README.md                 ✏️ GPT-Fassung + Herkunftsabschnitt + Phase-0-Hinweis
├── SHA256SUMS.txt            🆕 nach Zusammenführung neu berechnet
├── MERGE-MANIFEST.tsv        🆕 eine Zeile je übernommener Datei (Quelle·Pfad·SHA-256·Fläche·Begründung)
├── bin/claudestack.mjs       ✏️ + Unterbefehl `evidence`
├── src/stack.mjs             ✏️ 3 Eingriffe (Canary-Anbindung, Deny-Gate-Grenze, String-Normalisierung)
├── hooks/
│   ├── claudestack.mjs       ✅ 308-Byte-Shim, unverändert
│   └── optional/             ✏️ 8 Hooks aus K3 (+ lib), NICHT registriert
│       ├── claude-hook-capability-canary.mjs   (Probe, manuell/CLI)
│       ├── prefix-budget.mjs                   (Duell-Sieger C.3.8)
│       ├── read-context-guard.mjs              (Pfade relativ)
│       ├── read-slice-guard.mjs                ✅ Regelmodul
│       ├── reread-guard.mjs                    ✅ Regelmodul
│       ├── session-economy.mjs                 ✏️ Nudge an gemeinsames Budget
│       ├── bash-size-feedback.mjs              ✏️ Nudge an gemeinsames Budget
│       ├── ctx-used-marker.mjs                 ✅ Observer
│       └── lib/token-stack-shared.mjs          ✅
├── config/                   7 Dateien (Schema, Defaults, Owners-JSON, native-limits, guard-Pilotwerte, plugin-diet, settings.patch — siehe Hinweis unten)
├── rules/token-stack.md      ✏️ 3 Regelwerke → 1 (< 3 KB)
├── templates/                CLAUDE.md (≤ 4 KB hart) + TASK-STATE.md ✅
├── tests/                    3 aus GPT + tests/contract/ mit 2 K3-Suiten (bereinigt)
├── scripts/                  verify-package.mjs ✏️ · evaluate-benchmark.mjs ✅ · 03-measure-token-surfaces.py · ab-harness.sh ✏️ · repo-audit.py ✏️ (+ scrape_issues.py eingehend) · repos.txt ✏️ · judgments.json + scores100-v51.json (Evidenzdaten, lauffähig)
├── waves/                    WAVE-INDEX.md ✏️ (Wave 0 = Phase 0) + WAVE-STATE.md (geleert)
├── docs/                     11 Dateien (ARCHITECTURE, DECISIONS+ADR-015…017, SECURITY, MIGRATION, BENCHMARK, REPO-MATRIX+Dissens-Spalten, WAVES, LADDER, MESSPLAN, ROLLOUT, DEFEKTE — siehe Hinweis unten)
├── examples/                 benchmark-runs.example.jsonl ✅
└── evidence/                 Archiv — wird im Betrieb NICHT gelesen
    ├── gpt56/  (8 validate-Dateien)
    ├── k3/     (Archiv-Doku, Ladder-Referenz, issues-Rohdaten)
    ├── opus5/  (KONZEPT-v5, MASTERPLAN, README, bash-owner-dispatch-Trio)
    └── README.md 🆕 (erklärt Archiv-Status)
```

**Mengengerüst (aus C.2-Tabellen, F-1-korrigiert):** 11 unverändert · 54 angepasst · 34 archiviert (`evidence/`) · 13 verworfen (12 Dateien + 1 Leerverzeichnis) · 3 neu erzeugt (`MERGE-MANIFEST.tsv`, `SHA256SUMS.txt`, `evidence/README.md`). **Betriebsrelevant danach ≈ 50 Dateien.**

> **Zählhinweis (geerbte FINALIZE-Ungenauigkeit, hier korrigiert):** FINALIZE C.1 nennt im Zielbaum „config/ 6 Dateien" und „docs/ 12 Dateien". Nach den C.2-Tabellen ergeben sich **7** config-Dateien (settings.patch.json kommt hinzu, AP-5.6) und **11** docs-Dateien. Dieser Plan folgt den Tabellen; die C.1-Zahlen sind mit dem Bilanz-Widerspruch (F-1) desselben Typs und gehören in dasselbe Korrektur-Register (D8, AP-5.3).

## 3.2 Claude-Code-Integrationspunkte des Zielpakets

| Integrationspunkt | Mechanismus | Wann |
|---|---|---|
| `~/.claude/settings.json` (oder projektbezogen `.claude/settings.json`) | **Fragment** aus `bin/claudestack.mjs fragment` — registriert genau einen `PostToolUse`-Hook (`hooks/claudestack.mjs`-Shim → `src/stack.mjs`) + `env`-Deckel; Übernahme manuell | Phase 6 (shadow), Phase 7 (enforce) |
| Hook-Shim | 308-Byte-Shim zeigt auf Dispatcher; einzige registrierte Hook-Datei | Phase 6 |
| Root-`CLAUDE.md` | Aus `templates/CLAUDE.md` (≤ 4 KB), enthält Compact-Instructions-Block + Ladder-Verweis aus K3 | Phase 0 (manuell), Phase 3 (Template) |
| `TASK-STATE.md` | Aus `templates/TASK-STATE.md`; Session-Fläche | Phase 0/3 |
| Optionale Hooks | `hooks/optional/` liegt im Paket, wird **nicht** in `settings.json` registriert; Aktivierung nur nach gemessener Baseline und je Hook einzeln | frühestens nach Phase 6 |
| Canary-Probe | Schreibt Fähigkeitsdatei (30-Tage-Ablauf); Dispatcher bleibt ohne gültige Datei in `shadow` | Phase 6 |
| Messung | `ccusage` + `03-measure-token-surfaces.py` + `ab-harness.sh` (gepaarte Replikate) | Phasen 0, 6 |

---

# 4. Umsetzungsplan in 8 Phasen

**Logik der Reihenfolge (FINALIZE D.2, übernommen):** Phase 0 ist reine Subtraktion und braucht keines der Pakete — sie adressiert den gemessen größten Posten (Prefix/Plugins) und liefert die Baseline-Zahl, gegen die Phase 6 misst. Phasen 0–2 laufen paketfrei und können parallel zu 3–5 vorbereitet werden; Phase 6 dauert Tage (Messung); Phase 7 ist eine Entscheidung, keine Arbeit.

**Phasenübersicht:**

| Phase | Inhalt | Paket nötig? | Aufwand (FINALIZE) | Gate |
|---|---|---|---|---|
| 0 | Baseline `/context`, Plugin-Diät, Root-`CLAUDE.md`-Deckel, Hook-Subtraktion | nein | 2–3 h | Vorher/Nachher-Zahl dokumentiert |
| 1 | Fünf native env-Deckel einzeln einführen | nein | 1–2 h | Jeder Deckel einzeln gemessen/akzeptiert |
| 2 | Kollisionsinventur → `MERGE-MANIFEST.tsv` | nein | 1 h | TSV vollständig, Konflikte markiert |
| 3 | Träger klonen, `evidence/` befüllen, 3 Datenzusammenführungen | ja | 2–3 h | Schema valide, Registry konfliktaufgelöst |
| 4 | Code-Eingriffe C.3.1/C.3.5/C.3.7/C.3.8, Tests + Verifier grün | ja | 2–3 h | `npm test` + `npm run verify` Exit 0 |
| 5 | Doku & Evidenz C.3.6/C.3.9–C.3.11, `SHA256SUMS.txt` neu | ja | 1–2 h | Verifier-Prüfsummen deckungsgleich |
| 6 | Shadow-Messung: Dispatcher shadow, Canary-Probe, A/B ≥ 3 gepaarte Replikate | ja | Tage | Net-Win-Gate-Rechnung liegt vor |
| 7 | `enforce` nur nach Net-Win; sonst vollständige Entfernung | ja | Entscheidung | Gate-Protokoll |

---

## PHASE 0 — Baseline und Subtraktion (paketfrei)

**Ziel:** Die größten, bereits gemessenen Token-Posten reduzieren, bevor irgendetwas installiert wird — und die Referenzzahl erzeugen.

**Voraussetzungen:** Laufende Claude-Code-Installation; Schreibzugriff auf `settings.json` und Root-`CLAUDE.md`; keine Paketdateien.

**Arbeitspakete:**

| AP | Aufgabe | Detail / Befehl | Quelle |
|---|---|---|---|
| AP-0.1 | **Baseline-Messung** | `/context` mit einer festen, definierten Aufgabe ausführen; Startzustand vollständig notieren (Screenshot/Protokoll). Dieselbe Aufgabe wird für alle Vorher/Nachher-Vergleiche wiederverwendet. | plugin-diet.md Verfahren |
| AP-0.2 | **Plugin-Diät** | 25 aktive Plugins (Stand 13.08.2026) gegen die Klassifikation kürzen: **Behalten:** ponytail (einziger Tier-1-Beleg −10,3 %, p=0,004), context-mode (Achtung: Elastic 2.0, dienstlich klären!), caveman (in `CLAUDE.md` verdrahtet), prompt-improver (nicht mutierend). **Prüfen:** claude-mem (offenes Issue #3480 — file-context-Hook reinjiziert bei jedem Tool-Call; *vor* der Diät prüfen), fan-out-subagents (~7× Volumen), 7 Skill-Sammlungen (Aufrufe der letzten 30 Tage über Session-Transkripte prüfen), council/stress-test/cmux (bei Bedarf), 6× claude-code-hooks (gegen R8: mutieren/injizieren sie?). **Wichtig:** Toggles nur *zwischen* Sessions — ein Toggle in laufender Session schreibt gecachten User-Content vollständig neu. | opus5 `config/plugin-diet.md` |
| AP-0.3 | **Zweitmessung** | `/context` mit derselben Aufgabe und demselben Startzustand; Differenz protokollieren. **Das ist die Zahl, gegen die alles Weitere gemessen wird.** Optional ergänzend `node hooks/prefix-budget.mjs --report` vorher/nachher (Abweichung gemessen vs. geschätzt lag im Test bei 6,5 %) — **Hinweis:** dafür ist ein K3-Checkout nötig (die Datei liegt vor der Zusammenführung nur im Quellpaket); die Pflichtzahl bleibt die `/context`-Differenz | plugin-diet.md Akzeptanzgate |
| AP-0.4 | **Root-`CLAUDE.md` entschlacken** | Caveman-/Ponytail-Dopplung entfernen (Verhaltensregel genau einmal, als kurze Regel statt Plugin-Dauerfeuer); Byte-Deckel **≤ 4 KB** hart. Referenzbefund: 8.416 B ≙ 1.975 Token, Neuinjektion bei dateiberührenden Tool-Calls. | FINALIZE D.2 Schritt 0; F-5 |
| AP-0.5 | **Hook-Subtraktion** | Drei mutierende `PreToolUse:Bash`-Hooks auf **einen** reduzieren (Ist-Zustand prüfen: `settings.json`-Hook-Registrierungen inventarisieren — Matcher × Event × Mutationsart). | FINALIZE D.2 Schritt 0; L-1 |
| AP-0.6 | **Deaktivierte Plugins prüfen** | 10 auf `false` stehende Plugins: laufen ihre Shell-Hooks noch? (bekannter Fall) | plugin-diet.md |

**Akzeptanzgate P0:** Dokumentierte Vorher/Nachher-`/context`-Differenz + Root-`CLAUDE.md` ≤ 4 KB + genau ein mutierender `PreToolUse:Bash`-Hook + Protokoll in einem `PHASE-0-PROTOKOLL.md`.

**Risiken:** claude-mem-Issue #3480 unentdeckt → Reinjektion frisst den Gewinn (AP-0.2 zuerst prüfen). Plugin-Toggle mitten in der Session → Cache-Neuschreibung verfälscht die Messung.

---

## PHASE 1 — Native env-Deckel (paketfrei)

**Ziel:** Die fünf nativen Limits einführen — **einzeln**, damit jeder Effekt isoliert messbar bleibt; unveränderte Defaults dienen als Kontrollarm.

**Arbeitspakete:**

| AP | Variable | Wert | Hinweis |
|---|---|---|---|
| AP-1.1 | `MAX_MCP_OUTPUT_TOKENS` | `"8000"` | Externe Tool-Payloads deckeln (nativer Default 25000), bevor Drittkompression in Betracht kommt |
| AP-1.2 | `BASH_MAX_OUTPUT_LENGTH` | `"24000"` | Bewusst UNTER der gemessenen ~32-KB-Auslagerungsgrenze; der optionale Guard leitet Budgets daraus ab |
| AP-1.3 | `TASK_MAX_OUTPUT_LENGTH` | `"12000"` | Subagent-Rückgaben; Qualität vor Absenkung messen |
| AP-1.4 | `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | `"16000"` | Antwort-Decke — kann Vollständigkeit kosten, pilotieren |
| AP-1.5 | `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | `"78"` | **CAVEAT (Fehlerregister F5):** im `settings`-env ggf. WIRKUNGSLOS → Fallback als Shell-Export (`~/.zshrc`/`~/.bashrc`), Wirkung über Kompaktierungsverhalten verifizieren |
| AP-1.6 | `ENABLE_TOOL_SEARCH` | *(nicht setzen)* | Auf dem direkten Anthropic-Pfad ist dynamisches Tool Search bereits Default (`auto` = 10-%-Vorab-Schwelle). Nie pauschal `false`; nur bei gemessenem clientseitigem Problem gezielt eingreifen |

Einstellungsort: `settings.env` (string-basiert). Quelle: `k3swarm config/native-token-limits.example.jsonc` (Startprofil für A/B-Pilot, kein universelles Optimum).

**Akzeptanzgate P1:** Je Variable eine Notiz „gesetzt / Wirkung beobachtet / behalten oder revertiert"; `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` mit Wirkungsnachweis oder dokumentiertem Fallback.

---

## PHASE 2 — Kollisionsinventur → MERGE-MANIFEST.tsv (paketfrei)

**Ziel:** Die mechanische Inventur aller Paketdateien als Entscheidungsgrundlage und Provenienz-Nachweis.

**Stand:** Die Inventur wurde für diesen Plan bereits vollständig ausgeführt (Ergebnis §1.4; TSV im Anhang §8.2). Für die Wiederholung im Projekt:

```bash
# Skizze (Python): für alle Dateien der drei Pakete
# 1) SHA-256 → byteidentische Dubletten über Paketgrenzen
# 2) gleicher Basename, verschiedener Hash → Kollisionsliste
# 3) je .mjs: grep hookEventName / matcher / permissionDecision / updatedToolOutput / updatedInput
# 4) aus 3: Flächen mit >1 Mutator markieren
# 5) Owner-Registries: Schlüsselmengen diffen, Konflikte je Surface ausweisen
# Ausgabe: TSV je Datei (paket · pfad · sha256 · basename_kollision · surface · mutationsart · empfehlung)
```

**Arbeitspakete:**

| AP | Aufgabe | Detail |
|---|---|---|
| AP-2.1 | Inventur ausführen | Skript oben; Ergebnis `collision-inventory.tsv` (Referenz: §8.2 dieses Plans) |
| AP-2.2 | `MERGE-MANIFEST.tsv` erzeugen | Eine Zeile je **übernommener** Datei: `quelle · zielpfad · sha256 · flaeche · begruendung` — aus der Inventur + C.2-Tabellen; Basis für Phase 3 |
| AP-2.3 | Konfliktliste bestätigen | 7 Basename-Kollisionen (§1.4b) und 3 Mutator-Flächen (§1.4c) gegen die C.3-Entscheidungen abgleichen; **der Agent entscheidet nicht, welches Werkzeug gewinnt** — die Regel steht (L-1 bis L-5), anwenden = Fünf-Zeilen-Urteil je Datei |

**Akzeptanzgate P2:** `MERGE-MANIFEST.tsv` enthält exakt die 65 übernommenen Dateien (11 unverändert + 54 angepasst) + 34 `evidence/`-Zeilen; jede Konfliktzeile hat genau einen `owner`, die übrigen stehen in `alternatives` — nichts wird weggelassen.

---

## PHASE 3 — Träger aufsetzen und Daten zusammenführen

**Ziel:** GPT56SOL als Gerüst klonen; Archiv befüllen; die drei datenseitigen Zusammenführungen (C.3.2–C.3.4) abschließen. Keine Code-Eingriffe in `src/` in dieser Phase.

**Arbeitspakete:**

| AP | Aufgabe | Detail | FINALIZE-Ref |
|---|---|---|---|
| AP-3.1 | Träger kopieren | `gpt56sol_claude-code-token-stack/` → Arbeitskopie `claude-code-token-stack/`; `package.json`: Version `2.0.0`, `files`-Feld um `waves/` und `hooks/optional/` erweitern | C.2.1 |
| AP-3.2 | Baumdefekte OPUS5 bereinigen | Leerverzeichnis `{waves,rules,hooks,scripts,config}` entfernen; Dubletten-Paarung auflösen: Wurzel-`DEFEKTE.md`/`judgments.json`/`KONZEPT-v5.md` sind maßgeblich (byteidentisch mit `validate/`-Kopien — sha256-geprüft), `validate/`-Kopien entfallen | D.3; F-2 |
| AP-3.3 | `evidence/` befüllen | 34 Archivdateien gemäß C.2-Tabellen verschieben: `evidence/gpt56/` (8 validate-Dateien — **Achtung:** `06-incoming-reconciliation.md` ist Verifier-Pflichtdatei, Pfad in `scripts/verify-package.mjs` anpassen, siehe AP-4.4), `evidence/k3/` (Archiv-Doku + Ladder-Trio + issues-Rohdaten), `evidence/opus5/` (KONZEPT-v5, MASTERPLAN, README, bash-owner-dispatch-Trio); `evidence/README.md` neu schreiben („Archiv, kein Betrieb") | C.2.4 |
| AP-3.4 | **C.3.2 — Owner-Registry** | Drei Registries → eine `config/context-surface-owners.json`. Vorgehen: Schlüsselmengen diffen (Ergebnis §1.4d), je Fläche eine Zeile mit `owner`, `alternatives`, `activation_gate`, `conflict_note`; JSON gewinnt (schemavalidierbar); YAML-Zusatzfelder (K3 `invariants`, OPUS `hebel`/`abgerechnet`/`ist_zustand`) als `note` mitnehmen. Konfliktauflösung exakt nach §1.4d-Tabelle | C.3.2 |
| AP-3.5 | **C.3.3 — Regelwerk** | Drei Regelwerke → ein `rules/token-stack.md` (< 3 KB): GPT-Kurzfassung (1,4 K, laufzeitnah) als Struktur; aus K3 (7,6 K) + OPUS (5,4 K) inhaltlich ergänzen: Byte-Deckel Root-`CLAUDE.md`, Nudge-Budget, Subagenten-Auftragslimit, `ENABLE_TOOL_SEARCH`. Begründungen wandern nach `docs/ARCHITECTURE.md`, nicht in die Laufzeitdatei | C.3.3 |
| AP-3.6 | **C.3.4 — CLAUDE.md-Template** | GPT-846-B-Fassung als Grundlage; aus K3-`CLAUDE.md.template` (5,5 K) **nur** Compact-Instructions-Block + Ladder-Verweis übernehmen; **harte Obergrenze 4 KB**; KEIN Caveman-/Ponytail-/CodeGraph-/Context-Mode-Abschnitt (gehören in Plugins/path-scoped Rules, nicht in den Always-on-Prefix) | C.3.4; L-7 |
| AP-3.7 | Waves zurücksetzen | `waves/WAVE-INDEX.md` übernehmen, Wave 0 = Phase 0 voranstellen; `waves/WAVE-STATE.md` **leeren** (trägt fremden Fortschritt) | C.2.3 |
| AP-3.8 | Nicht übernommenes entfernen | 12 Dateien + 1 Leerverzeichnis gemäß ❌-Liste (§5): u.a. `bash-dump-guard.mjs` (L-1), `bash-dump-gate.mjs`, Ladder-Hooks, `install.sh`, `settings.json`-Volltemplate, K3/OPUS-`TASK-STATE`-Templates, `MANIFEST.json`, Binär-Dublette `.docx` | C.2 |

**Akzeptanzgate P3:** `config/context-surface-owners.json` ist schema-valide und enthält je Fläche genau einen Owner; `rules/token-stack.md` < 3 KB; `templates/CLAUDE.md` ≤ 4 KB; `evidence/` enthält 34 Dateien + README; `MERGE-MANIFEST.tsv` deckt jede bewegte Datei ab.

---

## PHASE 4 — Code-Eingriffe (C.3.1, C.3.5, C.3.7, C.3.8) + Tests

**Ziel:** Die vier code-seitigen Anpassungen am Träger; Testsuite und Verifier grün. Alle Zeilenanker beziehen sich auf den repos_v2-Stand (verifiziert durch Tiefenanalyse).

### AP-4.1 — `src/stack.mjs`: drei Eingriffe (C.3.1)

| # | Eingriff | Konkrete Umsetzung | Anker (verifiziert) |
|---|---|---|---|
| 1 | **Canary-Anbindung** | Neue Stufe nach `loadConfig`, vor dem Mode-Guard: Dispatcher liest Fähigkeitsdatei; fehlt sie oder ist sie älter als 30 Tage → intern auf `shadow` herunterstufen + Grund nach **stderr** (shadow ist telemetriefrei nach ADR-005, die Herunterstufung muss extern sichtbar sein). `canary`-Sektion in `DEFAULT_CONFIG` + `mergeConfig` + JSON-Schema + `default.json` — **Vierfach-Spiegelung beachten** (Schema ↔ default.json ↔ DEFAULT_CONFIG ↔ cli.test.mjs-Schlüsselgleichheitstest). | `handleHook` L336–337; `DEFAULT_CONFIG` L6–25; `mergeConfig` L41–49 |
| 2 | **Deny-Gate-Grenze** | Beim Start prüfen, ob auf `PreToolUse:Bash` ein fremder Mutator registriert ist → Befund nach stderr, **nie blockieren**. Dispatcher sieht `settings.json` zur Laufzeit nicht → Pfadlogik laden, `inspectSettings`/Matcher-Engine wiederverwenden; Session-Cache empfohlen. | `handleHook`-Start L333–335; `inspectSettings` L401–446; Pfadlogik bin L49–57 |
| 3 | **String-Normalisierung** | String-`tool_response` in `{stdout, stderr:'', interrupted:false, isImage:false, exitCode:0}` zurückwandeln statt verwerfen (Lehre KIMI-Guard-Defekt D5; in OPUS-Dispatcher bereits umgesetzt). | `handleBash` L284–285 |
| 4 | **Fail-open-Vertrag wahren** | Neue Stufen dürfen bei Fehlern nie stdout beschreiben; keine `permissionDecision:'allow'` (Verifier-Bann). | `handleHook` L344; `processHookInput` L354 |

Neue Testfälle in `tests/stack.test.mjs` (dort 19 Tests; 32 gesamt) für alle drei Zweige: (a) fehlende/abgelaufene Fähigkeitsdatei → shadow + stderr-Befund; (b) Fremd-Mutator auf PreToolUse:Bash → Befund ohne Blockade; (c) String-`tool_response` wird normalisiert statt verworfen.

### AP-4.2 — Canary-Probe anbinden (C.3.7)

| Schritt | Detail | Anker |
|---|---|---|
| Ausgabepfad umstellen | Default `~/.claude/bash-dump-guard-capabilities.json` → Dispatcher-Pfad (Config-Schlüssel aus AP-4.1); env-Name `BASH_DUMP_GUARD_CAPABILITY_FILE` umbenennen (z. B. `CLAUDESTACK_CAPABILITY_FILE`) | canary `:24`, `:29` |
| **`expiresAt` ergänzen** | Feld fehlt im Record — die 30-Tage-Altersprüfung sitzt derzeit beim **verworfenen** Konsumenten `bash-dump-guard.mjs` (Auslesen `:50`, Altersvergleich `:741–742`, via `testedAt`). Im Record-Konstrukt `expiresAt = testedAt + 30d` ergänzen, sonst kann der Dispatcher „älter als 30 Tage" nicht direkt ablesen | Record-Konstrukt `:270–300`, Einfügestelle `:271–273` |
| Nicht registrieren | Probe bleibt CLI/manuell (`node hooks/optional/claude-hook-capability-canary.mjs` bzw. über `bin/claudestack.mjs`); Exit-Semantik: 0=pass, 2=beide fail, 3=unknown, 1=Exception — dokumentieren | `:310–313,319–324` |
| Atomarität/Permissions behalten | Temp+Rename, 0600 — unverändert übernehmen | `:209–217` |

### AP-4.3 — prefix-budget: das Duell entscheiden (C.3.8)

**Befundlage (beide Fassungen analysiert):**

| Kriterium | K3 (23 K, 487 Z.) | OPUS5 (14 K) |
|---|---|---|
| **D1-Fix** (Matcher→Tool-Menge) | **fehlt** — gruppiert auf rohem Matcher-String (`:317`); Selbsttest-Behauptung „inkl. OPUS-Kollisionserkennung" gilt nur für den Trivialfall (Fixture: zwei identische `"Bash"`-Matcher, `:432`); Alternation/Wildcard ungetestet | **vorhanden** — `matcherToTools()` + KNOWN_TOOLS + Wildcards zählen auf jede konkrete Fläche mit; Nachweis 3→8 Befunde, 7/7 Self-Test PASS |
| Gesamt-Token-Budget | fehlt | vorhanden (`:172–175`) |
| Substanz der 9 KB | Plugin-Cache-Scan (`:197–207`), skillOverrides/name-only (`:111–120`), Metrik-JSONL+Rotation (`:384–391`), Report-Persistenz, Privacy (`storePaths:false`, gehashte IDs), 3-Settings-Merge, MCP aus 3 Quellen, 8-MiB-stdin-Deckel, fail-open | — |
| Skill-Budget-Modell | korrekt (`skillListingBudgetFraction` = Deckel) | falsch (Stückkosten 100 tok/Skill — von OPUS selbst gestrichen) |

**Empfohlene Umsetzung (synthetisiert aus beiden Analysen; präzisiert C.3.8):** **K3-Fassung als Träger** (Substanz + korrektes Skill-Budget-Modell + Privacy) und den **D1-Block + Gesamt-Budget aus OPUS portieren** (~37 Zeilen: `matcherToTools`, KNOWN_TOOLS, Wildcard-Mitwirkung; ersetzt K3 `:314–322`). Danach das FINALIZE-Vorgehen als **Verifikation** fahren: beide gegen dieselbe reale `settings.json` laufen lassen — Erwartung: die portierte Fassung findet die fünf `PreToolUse:Bash`-Handler und die drei mutierenden korrekt (Befundlage des Ist-Stands; eigene Werte erheben).

### AP-4.4 — `scripts/verify-package.mjs`: drei Verifier → einer (C.3.5)

Vorhanden (GPT, 241 Z.): 24 Pflichtdateien (L12–37), Symlink-/.DS_Store-Bann, JSON-Parse, SHA256-Manifest 1:1 mit Pfad-Sicherheit (L85–117), Bann `permissionDecision:'allow'` + `child_process` (L119–130), Baum-Fingerprint pre/post (L132/213), TAP-Zählung exakt 32 (L164–180).

| Eingriff | Detail | Anker |
|---|---|---|
| **Fail-loud-Block aus OPUS** | Fehlt ein Prüfgegenstand → am Ende gesondert als „FEHLENDE PRÜFGEGENSTÄNDE" ausweisen, zählt nie als bestanden (Lehre D2: zwei Suiten liefen still durch) | `ok`-Bedingung L138–145 + Report L214ff; Vorlage opus5 `verify-stack.mjs` |
| **9 Semantik-Checks aus K3** (adaptiert ans Zielbild!) | K3-Original (verify-package.sh:100–131): ①–⑤ die fünf env-Deckel-Werte; ⑥ `ENABLE_TOOL_SEARCH` **nicht** in env; ⑦ deny-Liste enthält `.env` + `rm -rf`; ⑧ je **ein** mutierender Owner je Fläche; ⑨ Hook-Event-Zuordnung. **Adaption nötig:** K3 prüfte seine registrierten Hooks (read-context-guard 4× etc.) — das Zielpaket registriert nur den Dispatcher (optional/ bleibt unregistriert, ADR-016) → Check ⑧/⑨ auf das **Fragment** umstellen: genau ein `PostToolUse`-Eintrag, keine Fremd-Mutatoren | neue Kategorie nach L130; **child_process-Whitelist L127** für isolierten HOME-Smoke nötig |
| **Nativer Budget-Abgleich** | `BASH_MAX_OUTPUT_LENGTH=24000` ↔ Guard-Budgets (4096/512/15 %) Konsistenzprüfung; Pilotwerte aus `bash-dump-guard.config.json` in die Dispatcher-Config übertragen | K3 `:127–130,:134–143` |
| **Byte-Deckel-Check** | `templates/CLAUDE.md` ≤ 4 KB hart, bricht sonst ab | neu, nahe L72 |
| **Owner-Kollisionscheck** | Registry (`config/context-surface-owners.json`) gegen tatsächliche Hook-Registrierungen halten — Import von `inspectSettings` + `renderSettingsFragment` aus src | neu |
| **Pflichtdatei-Pfade** | `validate/06-incoming-reconciliation.md` zieht nach `evidence/gpt56/` um → Pflichtliste aktualisieren; **`expectedTestCount = 32` wächst** mit den neuen Tests (auch README-Erwähnung) | L12–37, L11 |

### AP-4.5 — Optionale Hooks + Kontrakttests überführen

| Aufgabe | Detail |
|---|---|
| 8 Hooks + lib nach `hooks/optional/` | canary (AP-4.2), prefix-budget (AP-4.3), read-context-guard, read-slice-guard ✅, reread-guard ✅, session-economy, bash-size-feedback, ctx-used-marker ✅, `lib/token-stack-shared.mjs` ✅ |
| **Pfade relativ machen** (read-context-guard) | Hardcoded `~/.claude/read-context-guard.config.json` + `~/.claude/token-stack/read-state` (`:44–45`) → `CLAUDE_CONFIG_DIR`-Support nachziehen (prefix-budget hat ihn bereits, `:84`) — Inkonsistenz der drei Hooks beseitigen |
| **Gemeinsames Nudge-Budget** | Derzeit drei unabhängige Zähler (session-economy `notifiedBands`-JSON; size-feedback `/tmp`-Zähler 2×/Session; ladder-ledger `/tmp`-Zähler 5×/Session) → gemeinsamer `tryConsumeNudge()`-Helfer in `lib/` + eine Budget-Datei; session-economy + bash-size-feedback daran binden |
| Kontrakttests nach `tests/contract/` | `hook-contract-smoke.mjs` (fail-loud, ✅-Qualität; **ROOT-Auflösung bricht nach Umzug** — `:9,12` anpassen) + `test-guard-all.mjs`. **D2-Restbefund:** `/Users/rob/`-Pfade sind in repos_v2 **bereits behoben** (Verifikationsbefund — FINALIZE-Notiz überholt); verbleibt: Residual **fail-silent** in der `t()`-Hilfsfunktion (`:60–68`) — der Spawn-Status wird nie geprüft, eine fehlende Hook-Datei ließe alle „durch"-Fälle spurious bestehen (exakt die D2-Klasse) + bare `"node"` → `process.execPath`. Beides beheben. `test-ladder.mjs` wird **nicht** übernommen (L-9) |

**Akzeptanzgate P4:** `npm test` Exit 0 (≥ 35 Tests: 32 + neue), `npm run verify` Exit 0 inkl. Fail-loud-/Byte-Deckel-/Owner-Kollisions-Checks, Canary-Probe schreibt Record mit `expiresAt`, prefix-budget-Port findet auf realer `settings.json` alle mutierenden Handler.

---

## PHASE 5 — Doku, Evidenz und Prüfsummen (C.3.6, C.3.9–C.3.11)

**Ziel:** Dissens versioniert sichtbar halten, Defektregister vereinheitlichen, Evidenzdaten selbstbezugsfrei aufbereiten und die Integrität des Zielpakets mit neuen Prüfsummen abschließen.

| AP | Aufgabe | Detail | Ref |
|---|---|---|---|
| AP-5.1 | **REPO-MATRIX erweitern** (C.3.6) | Tabelle (32 Zeilen CTS-REPO-001–032): drei neue Spalten `opus_score`, `k3_score`, `dissens` + je Fremdspalte ein Feld `stand` (Version!). Toonify-Beleg: v4=85 vs. v5.1=72 — ohne `stand` wäre der Dissens gegen einen überholten Wert dokumentiert. Aus K3 `kern-katalog.md` wandern Flags + Aktivierungsgates in dieselbe Zeile; `HINWEIS.md`-Konsolidierungsregeln als Fußnote; Einleitung anpassen | Tabelle L30, Einleitung L20–28 |
| AP-5.2 | **Drei neue ADRs** (C.3.9) | **ADR-015** Zusammenführung nach Träger, nicht nach Merge (drei Bash-Owner sind nicht vereinbar) · **ADR-016** Optionale Hooks bleiben unregistriert (liegen im Paket, erscheinen nicht im Fragment, einzelne Aktivierung nach Baseline) · **ADR-017** Fremdbewertungen werden versioniert zitiert (Modell + Stand je Wert) | docs/DECISIONS.md (endet bei ADR-014) |
| AP-5.3 | **Ein Defektregister** (C.3.10) | OPUS D1–D7 (mit Nachweis/Status) + GPT-Befunde aus `06-incoming-reconciliation.md` → ein Register mit Spalten `ID · Artefakt · Befund · Nachweis · Status`. Ergänzen: D3 Packaging (offen), D4 Ladder-Drift (bewusst offen), D6 Guard-Namensfall. **Neu aufnehmen:** Baumdefekte — Brace-Expansion (im GitHub-Checkout nicht mehr vorhanden, nur TREE.txt-Zeuge → Status „historisch/beobachtet") + 3 OPUS5-Dubletten (sha256-bewiesen, in AP-3.2 aufgelöst) + **D8-neu: FINALIZE-Bilanz widerspricht C.2-Tabellen** (F-1/A2) + **D9-neu: FINALIZE C.2.2-Notiz „/Users/rob-Pfade entfernen" ist für repos_v2 überholt** (bereits behoben; Restrisiko = fail-silent-Spawns, AP-4.5) | docs/DEFEKTE.md |
| AP-5.4 | **judgments.json + scores100-v51.json aufbereiten** (C.3.11) | ① `source_model` je Zeile ergänzen — **verifiziert: alle 15 Korrektheitsurteile (D>0) zitieren „GPT56 04-second-validation: COR n/15"**; im Träger bewertete GPT56 sich sonst selbst → Verifier lehnt Zeilen ab, deren `source_model` dem Träger entspricht, wenn sie in dessen eigene Entscheidung einfließen. ② Absenz nicht als Strafe: Score nur über geprüfte Achsen, **Abdeckung als eigene Spalte** — `magic-compact` (73, realer Befund) vs. `toonify` (72, kein Befund) dürfen nicht auf demselben Wert landen (18/33 ungeprüft; Kosten der Absenz: im Mittel **17,6 Gesamtpunkte** nach FINALIZE-Wortlaut, in der Nachrechnung Ø **11,9 D-Achsen-Punkte** plus E-Nachteil) | scripts/ |
| AP-5.5 | **README + Doku-Feinschliff** | README: Herkunftsabschnitt (drei Quellpakete), Verweis auf `MERGE-MANIFEST.tsv`, **Phase-0-Hinweis vor dem Schnellstart**. ARCHITECTURE: Absatz zu optionalen Hooks/Nichtregistrierung (+ Begründungstexte aus C.3.3). SECURITY: Guard-Namenskollision + Deny-Gate im Quellrepo; Hinweis, dass Command-Text in Artefakten nicht redigiert wird (SEC-004/005). MIGRATION: Phase 0 als Vorbedingung voranstellen. BENCHMARK: gepaarter Aufbau + Endpunktdefinition „fresh input" aus Ladder-Serie; K3 `benchmark-harness.md` einarbeiten (nicht doppeln). WAVES.md: auf `waves/WAVE-INDEX.md` verweisen statt duplizieren. MESSPLAN/ROLLOUT/LADDER übernehmen: MESSPLAN-Schwellen als provisorisch kennzeichnen; ROLLOUT mit waves/ abgleichen (keine zwei Fahrpläne); LADDER-Geltungsbereich auf Quelltext < 32 KB einengen (v5-Messung −27,2 % galt nur dort) | C.2.1–C.2.3 |
| AP-5.6 | **`settings.patch.json` neu erzeugen** | Gegen den echten Ist-Stand der eigenen `settings.json` (Referenz „0 von 6 gesetzt" ist Fremdmaschine) — 7 env-Strings; Provenienz dokumentieren | C.2.3 |
| AP-5.7 | **`SHA256SUMS.txt` neu** | Nach allen Eingriffen neu berechnen (alte Summen ungültig); `MERGE-MANIFEST.tsv` finalisieren; Verifier-Lauf muss Checksums deckungsgleich melden | C.2.1/C.2.4 |

**Akzeptanzgate P5:** REPO-MATRIX-Zeilen tragen versionierte Fremdwerte; DECISIONS endet bei ADR-017; DEFEKTE enthält D1–D9 mit Status; judgments/scores mit `source_model` + Abdeckungsspalte; `npm run verify` Exit 0 mit deckungsgleichen Prüfsummen.

---

## PHASE 6 — Shadow-Messung (Dauer: Tage)

**Ziel:** Belegen, dass der Dispatcher im realen Betrieb Netto gewinnt — bevor irgendetwas erzwungen wird. Alle drei Pakete und die Meta-Validierung sind sich einig: **Die E2E-Baseline auf der eigenen Maschine ist die einzig verbleibende Wahrheitsquelle** (Befund R6, Meta-Validierung Runde 3 — alle Fremdwerte sind maschinenspezifisch: 25 Plugins, 8 Befunde, 1.975 Token, opus[1m]).

| AP | Aufgabe | Detail |
|---|---|---|
| AP-6.1 | Fragment erzeugen + einspielen | `node bin/claudestack.mjs fragment > fragment.json`; Inhalt prüfen (genau ein Dispatcher-Kommando, kein Dritt-Mutator — dafür existiert Test 32); manuell in `settings.json` übernehmen (**atomar**, ADR-012); Config `mode: "off"` → nach Smoke `"shadow"` |
| AP-6.2 | Canary-Probe ausführen | `node hooks/optional/claude-hook-capability-canary.mjs`; Record prüfen (`capabilities.postToolUseUpdatedToolOutput: pass`, `expiresAt` vorhanden); Exit 0 erwartet. Bei Exit 2/3: Dispatcher bleibt in `shadow` — das ist das gewollte Verhalten (ADR-005), kein Fehler des Plans |
| AP-6.3 | **ab-harness.sh härten, dann messen** | Vorher: `chmod +x` (D3-Muster: im Quellpaket fehlte das Execute-Bit) und **Fail-loud-Fix an `:105`** — dort verschluckt `\|\| true` Fehler der Arm-Umschaltung (D2-Muster „Arm schaltete still nichts um"); Fail-loud bei fehlendem Prüfgegenstand ergänzen. Dann: **≥ 3 gepaarte Replikate**, Endpunktdefinition „fresh input" (MESSPLAN), **Qualitätsgate vor Tokengate** (Wave 03-1: Nullergebnis ist wahrscheinlich und ist ein valides Ergebnis) |
| AP-6.4 | Shadow-Periode fahren | Dispatcher im `shadow`-Modus im Alltag laufen lassen; er ist kompletter No-op ohne Telemetrie (verifiziert: `handleHook` L337) — Beobachtung läuft über ccusage + `/context`-Stichproben + eigenes Protokoll |
| AP-6.5 | Messprotokoll | Pro Lauf: Arm (mit/ohne), Aufgabe, fresh-input-Tokens, Qualitätsurteil, Streuung. Vorlage: K3-VALIDIERUNG §5-Serienformat (v1 +39,3 % verworfen → v5 −27,2 % zeigt, wie verworfene Serien dokumentiert werden) |

**Akzeptanzgate P6 (Net-Win-Gate):** Gepaarte Differenz „fresh input" mit ≥ 3 Replikaten liegt vor; Qualität unverändert (6/6-Referenz der Ladder-Serie); Effekt größer als die Streuung (Lehre aus der Ladder-Nullmessung: −0,3 % bei 27–33 % Streuung ist **kein** Effekt). Erst dann Phase 7.

---

## PHASE 7 — Enforce-Entscheidung

**Ziel:** Gate-Entscheidung auf Basis der Phase-6-Zahlen. Keine Implementierungsarbeit.

| Ausgang | Maßnahme |
|---|---|
| **Net-Win belegt** | Config `mode: "enforce"`; Dispatcher mutiert Bash-Output mit Recovery-Artefakten (`raw:<sha256[:24]>` + recover-Befehl; Artefakte atomar 0600/0700; Redaction zuerst). Optionale Hooks einzeln prüfen — jeder nur nach eigener Baseline-Messung und einzelner Registrierung (ADR-016). Wave-State aktualisieren |
| **Nullergebnis oder Verlust** | **Verlierer samt Hooks, State und env vollständig entfernen** (FINALIZE D.2 Schritt 7): Fragment aus `settings.json` nehmen, `~/.claude/token-stack/state/` löschen, env-Deckel der Phase 1 einzeln revidieren. Das Paket bleibt als gemessenes, dokumentiertes Experiment bestehen — negative Evidenz ist Evidenz (Ladder-Präzedenz) |

---

# 5. Datei-Arbeitsliste (112 Dateien + 1 Leerverzeichnis)

Verdichtete Arbeitsanweisung je Paket; die vollständige Zeile-je-Datei-Tabelle mit SHA-256 und Aktion liegt als maschinenlesbare TSV bei (`inventory/collision-inventory.tsv`, §8.2). Legende: ✅ unverändert · ✏️ angepasst · 📦 nach `evidence/` · ❌ verworfen · 🆕 neu.

## 5.1 GPT56SOL (33 Dateien) — Träger

| Aktion | Dateien |
|---|---|
| ✅ (6) | `hooks/claudestack.mjs` · `templates/TASK-STATE.md` · `tests/benchmark.test.mjs` · `scripts/evaluate-benchmark.mjs` · `examples/benchmark-runs.example.jsonl` · `validate/03-measure-token-surfaces.py` (→ `scripts/`, lauffähig!) |
| ✏️ (19) | `package.json` (v2.0.0, files) · `README.md` (Herkunft, Phase-0-Hinweis) · `bin/claudestack.mjs` (+`evidence`-Befehl) · `src/stack.mjs` (AP-4.1) · `config/token-stack.schema.json` (Canary/optionale Hooks) · `config/token-stack.default.json` (`mode:"off"` bis Phase 3) · `config/context-surface-owners.json` (AP-3.4) · `rules/token-stack.md` (AP-3.5) · `templates/CLAUDE.md` (AP-3.6) · `tests/stack.test.mjs` + `tests/cli.test.mjs` (neue Fälle) · `scripts/verify-package.mjs` (AP-4.4) · `docs/ARCHITECTURE.md` · `docs/DECISIONS.md` (ADR-015…017) · `docs/SECURITY.md` · `docs/MIGRATION.md` · `docs/WAVES.md` · `docs/BENCHMARK.md` · `docs/REPO-MATRIX.md` (AP-5.1) |
| 🆕 (1) | `SHA256SUMS.txt` (nach Zusammenführung neu; ersetzt alte) |
| 📦 (7) | `validate/01,02,04,05,06` + `03-file-token-metrics.csv/.json` → `evidence/gpt56/` |

## 5.2 K3SWARM (54 Dateien) — Pfropfung Flächen/Tests

| Aktion | Dateien |
|---|---|
| ✅ (4) | `hooks/read-slice-guard.mjs` · `hooks/reread-guard.mjs` · `hooks/ctx-used-marker.mjs` · `hooks/lib/token-stack-shared.mjs` |
| ✏️ (22) | **hooks/optional/:** canary (AP-4.2), prefix-budget (AP-4.3), read-context-guard (Pfade relativ), session-economy + bash-size-feedback (Nudge-Budget) · **tests/contract/:** hook-contract-smoke (ROOT-Pfade), test-guard-all (fail-loud) · `config/native-token-limits.example.jsonc` (Caveats prüfen) · `config/bash-dump-guard.config.json` (Pilotwerte 4096/512/15 % → Dispatcher-Config) · `regelwerk/token-efficiency.rules.md` (→ AP-3.5) · `regelwerk/context-surface-owners.yaml` (→ AP-3.4) · `regelwerk/CLAUDE.md.template` (Compact-Block `:76–85` + Ladder-Verweis `:62–74` → AP-3.6) · `regelwerk/LADDER.md` (Geltungsbereich < 32 KB) · `planung/MESSPLAN.md` + `planung/ROLLOUT.md` (→ docs/, Abgleich mit waves/) · `scripts/benchmark-harness.md` (→ BENCHMARK.md) · `scripts/verify-package.sh` (9 Semantik-Checks → AP-4.4; Skript selbst entfällt) · `katalog/kern-katalog.md` + `katalog/HINWEIS.md` (→ REPO-MATRIX) · `docs/scrape_issues.py` (→ scripts/; v2-Matching + v3-Hülle) · `docs/scrape_issues2/3.py` (→ in repo-audit.py) |
| 📦 (21) | `hooks/ladder-ledger.mjs` · `hooks/ladder-retrieve-gate.mjs` · `hooks/ladder-retrieve-filter.mjs` · `config/ladder-config.json` → `evidence/k3/` (Referenz; gemessen) · `VALIDIERUNG.md` · `KONZEPT.md` · `MASTERPLAN.md` · `README.md` · `docs/finaler-abgleich.md` · `docs/K3SWARM-REVISION-3RUNDE.md` · `docs/vergleich-4wege.md` · `docs/zweitvalidierung-update.md` · `docs/verifikationsbericht-claudestack.md` · `docs/SQUEEZ-RTK-LADDER-ANALYSE.md` · `docs/review-bericht.md` · `docs/changes.md` · `docs/plan.md` · `docs/claude-token-stack-evaluierung-und-merge.md` · `docs/issues_out.txt/2/3` → `evidence/k3/issues/` |
| ❌ (7) | `hooks/bash-dump-guard.mjs` (49 K — zweiter Bash-Owner, L-1) · `hooks/bash-dump-gate.mjs` (PreToolUse-Deny-Gate — getrennte Policy-Frage im Quellrepo) · `hooks/tests/test-ladder.mjs` · `config/settings.json` (Volltemplate — widerspricht Fragment-Ansatz, L-10) · `regelwerk/TASK-STATE.template.md` · `scripts/install.sh` (merged settings.json ohne Baseline; Dedup per Command-String würde Registrierungen doppeln) · `docs/claude-token-stack-evaluierung-und-merge.docx` (Binärdublette) |

## 5.3 OPUS5 (25 Dateien + 1 Leerverzeichnis) — Pfropfung Governance

| Aktion | Dateien |
|---|---|
| ✅ (1) | `config/plugin-diet.md` (Grundlage Phase 0, unverändert) |
| ✏️ (13) | `waves/WAVE-INDEX.md` (Wave 00-0 = Phase 0 voranstellen; Acceptance-Werte sind Fremd-Ist-Stand → neu erheben) · `waves/WAVE-STATE.md` (**leeren**) · `DEFEKTE.md` (→ AP-5.3) · `scripts/judgments.json` (AP-5.4) · `scripts/ab-harness.sh` (chmod +x; Fail-loud `:105`) · `scripts/repo-audit.py` (scrape-Varianten einarbeiten) · `scripts/repos.txt` (auf Zielmatrix kürzen; Schlüsselmenge = 33, deckungsgleich mit scores) · `scripts/verify-stack.mjs` (Fail-loud-Block → AP-4.4) · `config/settings.patch.json` (gegen echten Ist-Stand neu) · `rules/token-efficiency.rules.md` (→ AP-3.5) · `rules/context-surface-owners.yaml` (→ AP-3.4) · `hooks/prefix-budget.mjs` (D1-Block + Gesamt-Budget → AP-4.3) · `validate/scores100-v51.json` (→ scripts/; Abdeckung getrennt ausweisen) |
| 📦 (6) | `hooks/bash-owner-dispatch.mjs` + `bash-owner-dispatch.config.example.json` + `hooks.settings.example.json` (dritter Dispatcher — Referenz) · `KONZEPT-v5.md` (einzelne Abschnitte → ARCHITECTURE.md) · `MASTERPLAN.md` · `README.md` |
| ❌ (5 + 1) | `TASK-STATE.template.md` · `MANIFEST.json` (package.json + SHA256SUMS ersetzen es) · `validate/DEFEKTE.md` + `validate/judgments.json` + `validate/KONZEPT-v5.md` (byteidentische Dubletten — Wurzelkopien maßgeblich) · Leerverzeichnis `{waves,rules,hooks,scripts,config}` (existiert im GitHub-Checkout nicht mehr; nur TREE.txt-Zeuge) |
| 🆕 (3, davon 2 Neuschöpfungen) | `MERGE-MANIFEST.tsv` + `evidence/README.md` (echte Neuschöpfungen) · `SHA256SUMS.txt` (Ersatz — bereits in §5.1 als 🆕 gelistet; FINALIZE zählt es in C.2.1 und C.2.4 doppelt, faktisch 3 Dateien, nicht 4) |

---

# 6. Risiken und offene Punkte

| # | Risiko / Offener Punkt | Einordnung | Maßnahme im Plan |
|---|---|---|---|
| R-1 | **Bilanz-Widerspruch in der FINALIZE** (24/44/34/11/3 vs. Tabellen 11/54/34/13/1+3) | Dokumentationsdefekt, verifiziert (F-1/A2) | Plan folgt den Tabellen; Aufnahme als D8 in AP-5.3 |
| R-2 | **Governance-Akzeptanzwerte sind fremdmaschinenspezifisch** (25 Plugins, 8 Befunde, 1.975 Token, 5 PreToolUse:Bash-Handler, opus[1m]) | Hoch — Kopieren würde falsche Gates setzen; Meta-R6: E2E-Baseline ist einzige Wahrheitsquelle | Alle Gates als „neu zu erheben" markiert (AP-0.3, AP-3.7, Phase 6) |
| R-3 | **K3-Testevidenz ist Selbstauskunft** (`reported_only` für Token-/Latenzwerte; Funktionstests real, aber nicht unabhängig reproduziert) | Mittel; GPT56 wertet als „nicht unabhängig reproduziert" (L10) | Phase-6-Messung grundsätzlich selbst ausführen; Serien im K3-Format dokumentieren |
| R-4 | **`settings.patch.json`-Provenienz** | Referenz-Ist („0 von 6 gesetzt") stammt von fremder Maschine | AP-5.6: gegen echten Ist-Stand neu erzeugen |
| R-5 | **Prefix-budget-Duell** | FINALIZE-Vorauswahl OPUS; Tiefenanalyse zeigt: OPUS hat D1-Fix, K3 hat Substanz + korrektes Skill-Budget-Modell | AP-4.3: K3-Träger + OPUS-D1-Port + Verifikationslauf auf realer settings.json |
| R-6 | **`expiresAt` fehlt im Canary-Record** | Ohne Feld kann Dispatcher 30-Tage-Regel nicht direkt ablesen (Prüfung saß beim verworfenen Konsumenten) | AP-4.2 explizit |
| R-7 | **Verifier-Sonderfälle** | `expectedTestCount=32` hartkodiert; `child_process`-Bann blockiert HOME-Smoke; Pflichtdatei 06 zieht um | AP-4.4 (drei Punkte gelistet) |
| R-8 | **Lizenz-Fences** | context-mode (Elastic 2.0) + token-optimizer (PolyForm) dienstlich gesperrt; `claude-mem` Issue #3480 offen | L-8; Flächen bleiben unbesetzt; claude-mem in AP-0.2 vor Diät prüfen |
| R-9 | **Stale v4-Werte in Texten** | plugin-diet.md „ponytail Σ 97" (v5.1: 90), WAVE-INDEX „llmtrim Σ 83" (v5.1: 66), MASTERPLAN „32 Repos" (33) | ADR-017 (versioniertes Zitieren); bei Übernahme in Zieldoku korrigieren |
| R-10 | **Ladder-Wert-Zuordnung** | −0,3 % galt dem Kommando-Pfad (v4), nicht direkt dem filter-Hook; +9,6 % exakt (9,58 %) | L-9 unverändert; Doku bei Übernahme präzisieren (AP-5.5) |
| R-11 | **Windows/ACLs** | Artefakt-Permissions 0600/0700 unter Windows ungetestet (SEC-004); `sessionKey`-Fallback auf ppid | Hinweis in SECURITY.md (AP-5.5); kein Blocker für Linux/macOS |
| R-12 | **Kleinere Zähldifferenzen** | „15 Hooks" K3 = real 13 (+lib+3 Tests = 17 .mjs); „18 aktive Marketplaces" (28 bekannte) | Im Plan korrigiert; keine Auswirkung auf Reihenfolge |

**Bewusst offen gelassene Entscheidungen (aus der Spezifikation, nicht vom Plan zu entscheiden):** Proxy-Fläche (Wave 05-1 BLOCKED, Kandidat llmtrim, tokdiet ausgesetzt) · Format-Fläche (toonify erst nach Audit, Pin ≥ 0.8.2/Commit 6df804a) · Retrieval-Default (codegraph/sigmap/codebase-memory-mcp — genau einer, aufgabenabhängig) · bash-dump-gate als Deny-Gate (getrennte Policy-Frage im Quellrepo).

---

# 7. Aufwand, Abhängigkeiten und Betrieb

## 7.1 Aufwandsschätzung (FINALIZE D.2, durch Analyse bestätigt)

| Phase | Aufwand | Kritischer Pfad? |
|---|---|---|
| 0 — Baseline/Subtraktion | 2–3 h | ja (liefert Referenzzahl) |
| 1 — env-Deckel | 1–2 h | nein (parallel zu 0 möglich, Messungen getrennt halten) |
| 2 — Inventur/Manifest | 1 h (**bereits erledigt** — §1.4, §8.2) | nein |
| 3 — Träger + Daten | 2–3 h | ja |
| 4 — Code | 2–3 h | ja |
| 5 — Doku/Evidenz | 1–2 h | nein (parallel zu 4 möglich) |
| 6 — Shadow-Messung | Tage (≥ 3 gepaarte Replikate + Alltags-Shadow) | ja |
| 7 — Entscheidung | — | — |

**Summe Kernarbeit (0–5):** ca. 9–14 Arbeitsstunden + Messperiode.

## 7.2 Abhängigkeiten

```
Phase 0 (Baseline) ──┐
                     ├──► Phase 6 (Shadow-Messung) ──► Phase 7 (enforce?)
Phase 1 (env) ───────┘         ▲
                               │
Phase 2 (Inventur) ──► Phase 3 (Träger/Daten) ──► Phase 4 (Code) ──► Phase 5 (Doku/Summen) ──┘
```

- Phase 0/1 laufen **paketfrei** und können sofort beginnen — parallel zu 2–5.
- Phase 4 hängt von 3 ab (Config/Registry/Templates müssen stehen, bevor Dispatcher/Verifier sie lesen).
- Phase 5 schließt 4 ab (Tests grün → Summen neu).
- Phase 6 hängt von 0 (Referenzzahl), 4 (Dispatcher+Canary) und 5 (ab-harness gehärtet) ab.

## 7.3 Betrieb nach der Integration (Ist-Zustand Zielbild)

| Komponente | Zustand |
|---|---|
| Registrierte Hooks | genau 1 (`hooks/claudestack.mjs`-Shim → `src/stack.mjs`, Events: PostToolUse Bash\|Read, PreToolUse Read, PreCompact, SessionEnd) |
| Optionale Hooks | 8 Dateien in `hooks/optional/`, **nicht registriert**; Aktivierung einzeln nach Baseline (ADR-016) |
| Canary | Fähigkeitsdatei mit 30-Tage-Ablauf; verfallen/fehlend → Dispatcher fällt in `shadow` zurück |
| Root-`CLAUDE.md` | ≤ 4 KB; Compact-Instructions + Ladder-Verweis enthalten |
| Messung laufend | ccusage (Observer), `03-measure-token-surfaces.py` (Prefix-Messung reproduzierbar), prefix-budget `--report` (geschätzt) |
| Governance | `waves/WAVE-STATE.md` (eigener Fortschritt), `docs/DEFEKTE.md` (D1–D9), `MERGE-MANIFEST.tsv` (Provenienz), `SHA256SUMS.txt` (Integrität) |
| Unbesetzte Flächen | Prefix-Wächter, externe Massendaten, Proxy, Format — **Entscheidung, kein Versäumnis** (L-8; je mit Re-Entry-Bedingung) |

---

# 8. Anhänge

## 8.1 Befehlsreferenz (Claude-Code-Integration)

```bash
# — Phase 2: Inventur (Referenz bereits vorliegend, §8.2) —
# SHA-256 aller Dateien, Dubletten- und Kollisionslisten (Python-Skizze in Phase 2)

# — Phase 3: Träger aufsetzen —
cp -r gpt56sol_claude-code-token-stack claude-code-token-stack
mkdir -p claude-code-token-stack/{evidence/{gpt56,k3/{issues},opus5},hooks/optional/lib,tests/contract,waves}

# — Phase 4: Qualitätsgates (im Zielpaket) —
npm test                 # node --test — aktuell 32/32 grün, nach Eingriffen ≥ 35
npm run verify           # scripts/verify-package.mjs — Pflichtdateien, Checksummen,
                         #   allow-Bann, Byte-Deckel, Owner-Kollision, Fail-loud

# — Phase 6: Integration in Claude Code —
node bin/claudestack.mjs doctor                 # Audit der eigenen settings.json (Matcher, Fremd-Mutatoren)
node bin/claudestack.mjs fragment > fragment.json   # Hook-Registrierungsfragment (genau 1 Dispatcher)
# fragment.json manuell & atomar in ~/.claude/settings.json übernehmen (kein Auto-Merge!)
node hooks/optional/claude-hook-capability-canary.mjs   # Capability-Probe → Fähigkeitsdatei
node hooks/optional/prefix-budget.mjs --report          # Prefix-Schätzung (Ist)
python3 scripts/03-measure-token-surfaces.py            # Prefix-Messung (reproduziert 1.975-Tok-Befund)
bash scripts/ab-harness.sh <arme>                       # gepaarte A/B-Messung (vorher chmod +x)

# — Recovery (Phase 7, bei enforce) —
node bin/claudestack.mjs recover <sha256-praefix>       # Original-Output aus Artefakt zurückholen
```

## 8.2 Maschinenlesbare Arbeitsgrundlagen (beigefügt)

| Datei | Inhalt |
|---|---|
| `inventory/collision-inventory.tsv` | Kollisionsinventur: 112 Zeilen (paket · pfad · sha256 · bytes · basename_kollision · dublette · hook_events · mutation · surface · aktion_finalize · notiz) — direkt als Basis für `MERGE-MANIFEST.tsv` nutzbar |
| `inventory/analysis-gpt56sol.md` | Tiefenanalyse Träger (Architektur, alle ADRs, Zeilenanker, Test-/Verify-Ergebnis) |
| `inventory/analysis-k3swarm.md` | Tiefenanalyse Hook-Werkstatt (13 Hooks tabellarisch, Canary-Format, 9 Semantik-Checks, Testläufe) |
| `inventory/analysis-opus5.md` | Tiefenanalyse Governance (D1–D7, Waves, scores/judgments-Struktur, D1-Fix-Kern) |
| `inventory/analysis-meta-verifikation.md` | Meta-Validierung (3 Runden) + Verifikationstabelle aller Kernbehauptungen |

## 8.3 Glossar (Korpus-Begriffe)

| Begriff | Bedeutung |
|---|---|
| Träger / Pfropfung | GPT56SOL liefert das Gerüst; aus den anderen Paketen werden definierte Teile übernommen — kein Merge |
| Gesetz I | Höchstens ein mutierender Owner pro Kontextfläche |
| Fläche (Surface) | Eine Kontext-Einflussstelle in Claude Code (Bash-Output, Read, Prefix, Session, Retrieval, …) |
| Mutator / Observer | Hook mit Mutationsrecht (`permissionDecision`, `updatedToolOutput`, `updatedInput`) vs. reine Beobachtung |
| shadow / enforce | Dispatcher-Modi: No-op-Beobachtung vs. aktive Mutation (dazwischen: Canary-Gate) |
| Canary / Fähigkeitsdatei | Probe, die nachweist, dass die Claude-Code-Installation die benötigten Hook-Fähigkeiten hat (30-Tage-Ablauf) |
| Net-Win-Gate | `enforce` nur, wenn gepaarte Messung Nettogewinn > Streuung zeigt |
| Fail-loud | Fehlende Prüfgegenstände werden als Befund ausgewiesen, nie als bestanden gezählt |
| evidence/ | Archivbereich des Zielpakets — Nachweise, wird im Betrieb nicht gelesen |
| Lizenz-Fence | Lizenzsperre für dienstliche Nutzung (Elastic 2.0, PolyForm Noncommercial) |
| `reported_only` | Fremdmessung ohne Rohlogs — nicht unabhängig reproduzierbar |

---

*Erstellt aus der vollständigen Analyse von `repos_v2` (117 Dateien): FINALIZE-Spezifikation (582 Zeilen), maschinelle Kollisionsinventur, vier Tiefenanalysen (GPT56SOL/K3SWARM/OPUS5/Meta-Validierung) mit real ausgeführten Testläufen und Verifikation aller tragenden Zahlen. Abweichungen von der Spezifikation sind in §1.3 (F-1…F-11) und §6 (R-1…R-12) dokumentiert.*
