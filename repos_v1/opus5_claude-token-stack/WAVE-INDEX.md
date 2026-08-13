# Token-Stack Wave-Index — Karte aller Waves

_Created: 2026-08-13 · Vorlage: `Squeez-RTK-Ladder/WAVE-INDEX.md`_

**Purpose:** Session-Bootstrap. Eine Folge-Session liest **diesen Index plus nur die volle Datei der aktiven Wave** — nie das ganze Korpus. Index = Karte · Wave-Datei = Arbeitsauftrag · `MASTERPLAN.md` = Zustand.

Diese Regel ist selbst eine Token-Maßnahme und gehört zu Stufe 0, nicht zur Dokumentationskonvention.

---

## Phase 0 — Inventur und Reparatur

### 00-1 · Inventur der bestehenden Registrierung
- **Goal:** Jede Fläche hat genau einen eingetragenen Eigentümer in `rules/context-surface-owners.yaml`. Alle Hooks, Plugins, Skills, MCP-Server und Env-Flags erfasst.
- **Sources/read-set:** `settings.json`, `~/.claude/plugins/`, `hooks/prefix-budget.mjs --json`
- **Depends:** — · **Status:** OPEN
- **Acceptance:** `node hooks/prefix-budget.mjs --json` meldet **null** Gesetz-I-Befunde. Ausgangsmessung: **acht** Befunde, davon fünf Handler auf `PreToolUse:Bash`.
- **Aufwand:** 1–2 h

### 00-2 · Defekte D1–D5 schließen
- **Goal:** Die fünf in `DEFEKTE.md` geführten Defekte sind behoben oder ausdrücklich als offen quittiert.
- **Depends:** — · **Status:** D1 ✅ · D2 ✅ · D3 offen · D4 offen · D5 ✅ (Ausschluss)
- **Acceptance:** `node scripts/verify-stack.mjs` läuft grün, und zwar **ohne** Einträge unter „FEHLENDE PRÜFGEGENSTÄNDE".
- **Aufwand:** 0,5 Tage

---

## Phase 1 — Native Hebel, ohne Installation

### 01-1 · Prefix-Diät
- **Goal:** Das Plugin-Inventar ist auf das tatsächlich Genutzte gekürzt. Ausgangswert **25 aktive Plugins aus 18 Marketplaces**, Budget laut Werkzeug: 12.
- **Sources/read-set:** `config/plugin-diet.md`, `/context`
- **Depends:** 00-1 · **Status:** OPEN
- **Acceptance:** `/context` vor und nach der Kürzung, **gleiche Aufgabe, gleicher Startzustand**. Differenz protokolliert. Diese eine Messung entscheidet, ob der Rest des Stacks lohnt.
- **Nicht ändern:** `CLAUDE.md`. 173 Zeilen / 1.975 Token (tiktoken o200k_base gemessen), unter der Doku-Vorgabe von 200 Zeilen, inhaltlich korrekt strukturiert. Jede Änderung invalidiert den Cache ohne Gegenwert.
- **Aufwand:** 1–2 h

### 01-2 · Native Deckel, einzeln
- **Goal:** Die sieben Werte aus `config/settings.patch.json` sind **nacheinander** aktiviert, jeder gegen den unveränderten Default gemessen.
- **Depends:** 01-1 · **Status:** OPEN
- **Acceptance:** Keine Regression bei Taskqualität. Je Wert eine Zeile im Messprotokoll. `ENABLE_TOOL_SEARCH` zuerst, weil es die größte einzelne Fläche betrifft und der Transporttyp der MCP-Server das Ergebnis bestimmt (HTTP wird laut #40314 nicht deferiert).
- **Aufwand:** 15 min setzen, 2–3 Tage messen
- **Gate:** Nach dieser Wave ist **noch kein Fremdcode installiert.** Phase 0 und 1 zusammen kosten unter drei Stunden Arbeitszeit.

---

## Phase 2 — Ownership herstellen

### 02-1 · Dispatcher statt Mehrfachregistrierung
- **Goal:** `bash-owner-dispatch.mjs` ist der einzige registrierte Handler auf `PreToolUse:Bash` und `PostToolUse:Bash`. Die bisherigen fünf bzw. drei Handler laufen als Stufen darin.
- **Sources/read-set:** `hooks/bash-owner-dispatch.config.example.json`, `hooks/hooks.settings.example.json`
- **Depends:** 00-1, 01-2 · **Status:** OPEN
- **Acceptance:**
  1. `node hooks/bash-owner-dispatch.mjs --self-test` → 9/9.
  2. `node hooks/bash-owner-dispatch.mjs --status` → jede Stufe `gefunden: true`.
  3. `node hooks/prefix-budget.mjs --json` → keine Gesetz-I-Befunde mehr.
  4. Ein reales `cat große.log | sort` wird weiterhin geblockt, ein `git diff` weiterhin byteidentisch durchgelassen.
- **Risiko:** mittel. Der Dispatcher verändert die Reihenfolge von Schutzregeln. `protect-tests` und `protect-secrets` stehen deshalb an Position 1 und 2 und beenden die Kette bei `deny` sofort.
- **Aufwand:** 0,5–1 Tag

### 02-2 · Capability-Canary und Shadow-Betrieb
- **Goal:** Für jeden mutierenden Owner liegt ein frischer Capability-Record vor.
- **Depends:** 02-1 · **Status:** OPEN
- **Acceptance:** `--status` zeigt **nicht** `effective: "shadow", reason: "capability-record-missing"`. Reproduzierter Ausgangsbefund: ein 100-KB-Payload gegen den ungeprobten Guard ergibt leeres stdout und exit 0 — der Guard sieht aktiv aus und fasst nichts an.
- **Wiederholung:** nach jedem Claude-Update, bei Wechsel des Executables, spätestens alle 30 Tage.
- **Aufwand:** 1 h + zwei Wochen Metriken

---

## Phase 3 — Messen, dann entscheiden

### 03-1 · A/B Bash-Owner
- **Goal:** Gepaarter A/B des Bash-Owners gegen die native Baseline.
- **Sources/read-set:** `scripts/ab-harness.sh`, `MASTERPLAN.md` §Messregeln
- **Depends:** 02-2 · **Status:** OPEN
- **Acceptance:** Endpunkt **vorab** festgelegt: Median der gepaarten Differenz im **fresh input** (uncached + cache creation). Mindestens 3 Läufe je Arm. Streuung ausgewiesen. **Qualitätsgate vor Tokengate.**
- **Abbruchbedingung:** Liegt die Differenz innerhalb der Streuung, ist das kein Ergebnis. Dann Grundlast senken und Fälle bündeln, nicht mehr Wiederholungen fahren.
- **Erwartung, ehrlich:** Die Bash-Fläche ist ~20–22 % des Tokenstroms und auf typischen Workloads ein Nullsummenspiel. Ein Nullergebnis ist der wahrscheinlichste Ausgang und ein gültiges Ergebnis.
- **Aufwand:** 1 Tag

### 03-2 · A/B Codeindex
- **Goal:** Native Suche gegen genau einen `codegraph`-Arm, Version gepinnt.
- **Depends:** 03-1 · **Status:** OPEN
- **Acceptance:** gleiche oder höhere Taskqualität, weniger Diagnosezeit und Toolcalls, **und** vertretbare Residual-Context-Last. Gegenbefund aus den eigenen Benchmarks des Projekts: im Mittel rund **82 % mehr Retrieval-Kontext** bleibt resident, weil dichte Explore-Ausgaben im Fenster stehen bleiben.
- **Anti-Pattern:** den Index abfragen und anschließend trotzdem alle gefundenen Dateien vollständig lesen. Vernichtet den Gewinn vollständig.
- **Aufwand:** 1 Tag

---

## Phase 4 — Sitzungsgrenze

### 04-1 · TASK-STATE und `/clear` standardisieren
- **Goal:** `.claude/TASK-STATE.md` nach Vorlage, `/clear` als Regelfall am Phasenwechsel.
- **Depends:** 01-2 · **Status:** OPEN
- **Besonderheit dieses Setups:** `autoCompactEnabled: false` bei `model: opus[1m]`. Es gibt **keinen** automatischen Auslöser. TASK-STATE + `/clear` sind nicht eine Option unter mehreren, sondern der einzige aktive Sessiongrenzmechanismus. Bei einem 1M-Fenster wiegt das quadratische Sessionwachstum achtmal schwerer als in den 128k-Rechnungen des Korpus.
- **Acceptance:** Kosten wachsen über eine lange Session linear, nicht quadratisch.
- **Aufwand:** halber Tag

---

## Phase 5 — Nur bei nachgewiesenem Restproblem

### 05-1 · Ein Proxy, ein Slot
- **Goal:** Falls 01-2 bis 04-1 ein Restproblem zeigen: genau **ein** `ANTHROPIC_BASE_URL`-Proxy als getrennter Arm.
- **Depends:** 04-1 · **Status:** BLOCKED bis Restproblem belegt
- **Kandidat:** `fkiene/llmtrim` (Σ 83). `agiwhitelist/tokdiet` ist ausgesetzt — Release vom 13.08.2026 auf einem Codestand vom 18.06.2026.
- **Acceptance:** Provider-Usage mit ausgewiesener Cache-Read- und Cache-Creation-Ratio. Ohne diese Zahlen ist eine Nettoersparnis eine Behauptung.
- **Aufwand:** 2–3 Tage

---

## Nicht geplante Waves — und warum

| Fläche | warum keine Wave |
|---|---|
| Prefix-Werkzeug | `alexgreensh/token-optimizer` ist das einzige Repo des Feldes, das ernsthaft auf dem Prefix arbeitet — **PolyForm Noncommercial**, für dienstliche Nutzung gesperrt. Fläche wird durch 01-1 von Hand gelöst. |
| Externe Massendaten | `mksglu/context-mode` ist **Elastic 2.0**. Kein freigabefähiger Bewerber vorhanden. `atlassian-labs/mcp-compressor` deckt nur die Schema-Fläche. |
| Memory | Normative Wahrheit bleibt in Code, Tests, ADRs und TASK-STATE. `claude-mem` ist aktiv und trägt ein **offenes** Reinjektions-Issue (#3480) — vor jeder Erweiterung prüfen. |
| Routing | Kein Tokenhebel, sondern ein Kostenhebel mit Qualitätsrisiko. Profil C, nicht Kern. |
