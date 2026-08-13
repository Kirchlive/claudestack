# Token-Stack Wave-Index — Karte aller Waves

_Created: 2026-08-13 · Vorlage: `Squeez-RTK-Ladder/WAVE-INDEX.md`_

**Purpose:** Session-Bootstrap. Eine Folge-Session liest **diesen Index plus nur die volle Datei der aktiven Wave** — nie das ganze Korpus. Index = Karte · Wave-Datei = Arbeitsauftrag · [`WAVE-STATE.md`](WAVE-STATE.md) = Zustand.

Diese Regel ist selbst eine Token-Maßnahme und gehört zu Stufe 0, nicht zur Dokumentationskonvention.

> **⚠ Alle Acceptance-Zahlen dieses Index stammen von einer fremden Maschine** —
> 25 aktive Plugins, 8 Gesetz-I-Befunde, 5 Handler auf `PreToolUse:Bash`, 1.975
> Token Prefix, Modell `opus[1m]`. Auf dieser Installation gilt keiner davon:
> die Ausgangsmessung ergab **null** aktivierte Plugins, **null** mutierende
> Hooks und **keine** Root-`CLAUDE.md` (`PHASE-0-PROTOKOLL.md`). Jede
> Acceptance-Schwelle ist vor Gebrauch **neu zu erheben**; kopierte Zahlen
> setzen falsche Gates (Risiko R-2).

---

## Phase 0 — Baseline, Inventur und Reparatur

### 00-0 · Baseline und Subtraktion *(= Phase 0 des Umsetzungsplans)*
- **Goal:** Die Referenzzahl erzeugen, gegen die alles Weitere gemessen wird — und die größten Posten reduzieren, bevor irgendetwas installiert wird.
- **Sources/read-set:** `/context` mit einer festen, wiederholbaren Aufgabe; `settings.json`; Root-`CLAUDE.md`
- **Depends:** — · **Status:** TEILWEISE (Ist-Aufnahme steht, `/context` offen)
- **Acceptance:** dokumentierte Vorher/Nachher-`/context`-Differenz · Root-`CLAUDE.md` ≤ 4 KB · genau ein mutierender `PreToolUse:Bash`-Hook · Protokoll vorhanden.
  **Ist auf dieser Maschine:** nichts zu subtrahieren — Byte-Deckel und Hook-Kriterium sind trivial erfüllt, die `/context`-Zahl fehlt noch.
- **Aufwand:** 2–3 h · **Ergebnis:** `PHASE-0-PROTOKOLL.md`

### 00-1 · Inventur der bestehenden Registrierung
- **Goal:** Jede Fläche hat genau einen eingetragenen Eigentümer in [`config/context-surface-owners.json`](../config/context-surface-owners.json). Alle Hooks, Plugins, Skills, MCP-Server und Env-Flags erfasst.
- **Sources/read-set:** `~/.claude/settings.json`, `~/.claude/plugins/`, `node hooks/optional/prefix-budget.mjs --json`
- **Depends:** — · **Status:** ERLEDIGT für diese Maschine (`PHASE-0-PROTOKOLL.md`)
- **Acceptance:** `node hooks/optional/prefix-budget.mjs --json` meldet **null** Gesetz-I-Befunde.
  **Ist auf dieser Maschine:** null Befunde bereits im Ausgangszustand — es gibt keinen mutierenden Hook. Der Fremdwert „acht Befunde, davon fünf auf `PreToolUse:Bash`" gilt hier nicht (R-2).
- **Aufwand:** 1–2 h

### 00-2 · Defektregister quittieren
- **Goal:** Jeder Defekt in [`docs/DEFEKTE.md`](../docs/DEFEKTE.md) ist behoben oder ausdrücklich als offen quittiert. Das Register führt D1–D15 (Umsetzungsdefekte), B1–B2 (Baumdefekte, aufgelöst) und G01–G10 (Evidenzlücken) — nicht mehr die fünf des Vorgängerpakets.
- **Depends:** — · **Status:** laufend; Stand siehe Register
- **Acceptance:** `npm run verify` läuft grün, und zwar **ohne** Einträge unter „FEHLENDE PRÜFGEGENSTÄNDE".
- **Aufwand:** 0,5 Tage

---

## Phase 1 — Native Hebel, ohne Installation

### 01-1 · Prefix-Diät
- **Goal:** Das Plugin-Inventar ist auf das tatsächlich Genutzte gekürzt. Fremdwert des Vorgängerpakets: **25 aktive Plugins aus 18 Marketplaces**, Budget laut Werkzeug 12.
- **Sources/read-set:** [`config/plugin-diet.md`](../config/plugin-diet.md), `/context`
- **Depends:** 00-1 · **Status:** GEGENSTANDSLOS auf dieser Maschine
- **Acceptance:** `/context` vor und nach der Kürzung, **gleiche Aufgabe, gleicher Startzustand**. Differenz protokolliert.
  **Ist auf dieser Maschine:** **null** aktivierte Plugins (`enabledPlugins` leer, nur der offizielle Marketplace gecacht) und **keine** Root-`CLAUDE.md`. Es gibt nichts zu kürzen; die Vorher/Nachher-Messung entfällt, die Erstmessung *ist* die Referenz. Mehrere Korpus-Werkzeuge liegen zwar npm-global installiert, sind aber weder als Plugin noch als Hook noch als MCP-Server eingebunden und kosten daher null Token.
- **Nicht ändern (gilt nur, wo eine Root-`CLAUDE.md` existiert):** Der Fremdbefund lautet 173 Zeilen / 1.975 Token (tiktoken o200k_base, der einzige unabhängig doppelt reproduzierte Wert des Korpus). Wo eine solche Datei vorliegt, invalidiert jede Änderung den Cache ohne Gegenwert. Auf dieser Maschine existiert sie nicht — der Byte-Deckel aus [`templates/CLAUDE.md`](../templates/CLAUDE.md) gilt erst, sobald eine angelegt wird.
- **Aufwand:** 1–2 h

### 01-2 · Native Deckel, einzeln
- **Goal:** Die Werte aus [`config/settings.patch.json`](../config/settings.patch.json) sind **nacheinander** aktiviert, jeder gegen den unveränderten Default gemessen. Die Datei führt **vier gesetzte** env-Deckel und **sechs begründet nicht gesetzte** Positionen — die alte Zahl „sieben" stammt aus dem Vorgängerpaket.
- **Depends:** 01-1 · **Status:** TEILWEISE — vier Deckel gesetzt (`PHASE-1-PROTOKOLL.md`), Wirkung nicht isoliert gemessen
- **Acceptance:** Keine Regression bei Taskqualität. Je Wert eine Zeile im Messprotokoll ([`docs/MESSPROTOKOLL.template.md`](../docs/MESSPROTOKOLL.template.md)).
  **Abweichung auf dieser Maschine, bewusst:** Die Deckel wurden vor der Baseline gesetzt; die Baseline wird deshalb *mit* ihnen erhoben und sie bleiben bis Phase 7 unverändert. Der Einzeleffekt bleibt dadurch ungemessen — sie wirken in beiden A/B-Armen gleich und verfälschen den Dispatcher-Vergleich nicht.
  `ENABLE_TOOL_SEARCH` ist auf dieser Maschine bereits per Shell-Export gesetzt (D14), nicht über `settings.json`; der Transporttyp der MCP-Server bestimmt die Wirkung (HTTP wird laut #40314 nicht deferiert).
- **Aufwand:** 15 min setzen, 2–3 Tage messen
- **Gate:** Nach dieser Wave ist **noch kein Fremdcode installiert.** Phase 0 und 1 zusammen kosten unter drei Stunden Arbeitszeit.

---

## Phase 2 — Ownership herstellen

### 02-1 · Ein Owner auf der Bash-Fläche
- **Goal:** [`src/stack.mjs`](../src/stack.mjs) ist der einzige registrierte Handler mit Mutationsrecht auf `PostToolUse:Bash`. Registriert wird ausschließlich der 308-Byte-Shim [`hooks/claudestack.mjs`](../hooks/claudestack.mjs), der auf den Dispatcher zeigt.
  > **Korrektur gegenüber der Vorgängerfassung:** Diese Wave nannte bis zur Abnahme `bash-owner-dispatch.mjs` als einzurichtenden Handler. Das ist der **verworfene dritte Dispatcher** (ADR-015); er liegt nur noch unter `evidence/opus5/` und ist nicht lauffähig. Wer der alten Anweisung folgte, verletzte Gesetz I — die Anweisung selbst war der Verstoß, nicht der Code.
- **Sources/read-set:** [`config/token-stack.default.json`](../config/token-stack.default.json), [`config/token-stack.schema.json`](../config/token-stack.schema.json), `node bin/claudestack.mjs fragment`
- **Depends:** 00-1, 01-2 · **Status:** OPEN
- **Acceptance:**
  1. `node bin/claudestack.mjs fragment` erzeugt genau **einen** Hook-Eintrag je Ereignis, alle auf den Shim; kein Eintrag verweist auf `hooks/optional/` (ADR-016).
  2. `node bin/claudestack.mjs doctor` meldet **null** Fremd-Mutatoren auf den Bash-Flächen.
  3. `node hooks/optional/prefix-budget.mjs --json` → keine Gesetz-I-Befunde.
  4. `npm run verify` bestätigt die Checks 8a–8d (ein mutierender Owner je Fläche).
- **Übernahme:** Das Fragment wird **von Hand und atomar** in `~/.claude/settings.json` übernommen — kein Auto-Merge (ADR-012).
- **Risiko:** gering. Der Dispatcher startet im Modus `off`; erst nach Rauchtest `shadow`, erst nach Net-Win-Gate `enforce`.
- **Aufwand:** 0,5–1 Tag

### 02-2 · Capability-Canary und Shadow-Betrieb
- **Goal:** Für den mutierenden Owner liegt ein frischer Capability-Record vor.
- **Sources/read-set:** [`hooks/optional/claude-hook-capability-canary.mjs`](../hooks/optional/claude-hook-capability-canary.mjs)
- **Depends:** 02-1 · **Status:** OPEN
- **Acceptance:** `node hooks/optional/claude-hook-capability-canary.mjs` endet mit Exit 0 und schreibt nach `~/.claude/token-stack/capabilities.json` einen Record mit `capabilities.postToolUseUpdatedToolOutput: "pass"` und gültigem `expiresAt`. Der Dispatcher meldet dann nicht mehr die Herunterstufung nach `shadow`.
  **Wichtig:** Die Probe muss **aus einer laufenden Claude-Code-Sitzung** aufgerufen werden — nur dann führt die Laufzeit den Probe-Hook wirklich aus. Außerhalb ergibt sie Exit 3 (`unknown`), und der Dispatcher bleibt korrekt in `shadow` (ADR-005). Das ist der dokumentierte Fall, kein Fehler.
- **Wiederholung:** nach jedem Claude-Update, bei Wechsel des Executables, spätestens alle 30 Tage.
- **Aufwand:** 1 h + zwei Wochen Metriken

---

## Phase 3 — Messen, dann entscheiden

### 03-1 · A/B Bash-Owner
- **Goal:** Gepaarter A/B des Bash-Owners gegen die native Baseline.
- **Sources/read-set:** [`scripts/ab-harness.sh`](../scripts/ab-harness.sh), [`docs/MESSPLAN.md`](../docs/MESSPLAN.md), [`docs/BENCHMARK.md`](../docs/BENCHMARK.md), Protokollvorlage [`docs/MESSPROTOKOLL.template.md`](../docs/MESSPROTOKOLL.template.md)
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
- **Besonderheit dieses Setups:** `autoCompactEnabled: false` — auf dieser Maschine bestätigt. Es gibt **keinen** automatischen Auslöser; TASK-STATE + `/clear` sind nicht eine Option unter mehreren, sondern der einzige aktive Sessiongrenzmechanismus. Der Fremdwert `model: opus[1m]` stammt von der Referenzmaschine; die Größenordnung des quadratischen Sessionwachstums hängt am tatsächlichen Fenster und ist selbst zu bestimmen. **Folge für AP-1.5:** Ein `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` bleibt wirkungslos, solange Autocompact abgeschaltet ist.
- **Acceptance:** Kosten wachsen über eine lange Session linear, nicht quadratisch.
- **Aufwand:** halber Tag

---

## Phase 5 — Nur bei nachgewiesenem Restproblem

### 05-1 · Ein Proxy, ein Slot
- **Goal:** Falls 01-2 bis 04-1 ein Restproblem zeigen: genau **ein** `ANTHROPIC_BASE_URL`-Proxy als getrennter Arm.
- **Depends:** 04-1 · **Status:** BLOCKED bis Restproblem belegt
- **Kandidat:** `fkiene/llmtrim` (Σ 66, OPUS v5.1; die frühere Angabe 83 stammte aus v4 — R-9/ADR-017). Abdeckung nur 0,8: die Korrektheitsachse ist ungeprüft, der normierte Wert 82,5 liegt allein deshalb höher und darf nicht statt des Rohwerts zitiert werden (C.3.11). `agiwhitelist/tokdiet` ist ausgesetzt — Release vom 13.08.2026 auf einem Codestand vom 18.06.2026.
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
