# Claude Code Token-Stack — Konzept v5.1

**Stand:** 13. August 2026
**Ersetzt:** Konzept v4, `token-stack-konzept-v3.md` (OPUS5), `cc-token-stack.agent.final.md` (KIMI)
**Katalog:** 375 Repositories (`repo-catalog-v4.json`, Schema 4.1)
**Prüfberichte:** `VALIDATION.md` · `VERGLEICH-4WEGE.md` · `UPDATE-PHASE3.md`
**Neu in v5:** acht aufgelöste Konflikte, jeder mit Beleg — siehe §14
**Neu in v5.1:** Guard-Namenskollision (D6), Zirkelschluss in der eigenen Rubrik behoben (D7), `toonify-mcp` rehabilitiert — siehe §17

---

## 1. Was hier zusammengeführt wurde

Fünf Agenten haben dieselbe Aufgabe bearbeitet. Real unabhängig sind zwei Linien; die übrigen sind Teilmengen oder methodisch am Thema vorbei (Nachweis in `VALIDATION.md` §2 und §6).

| | Linie A — OPUS5/GPT55SOL | Linie B — KIMI |
|---|---|---|
| Leitfrage | *Wem gehört welche Fläche, und welcher Eingriffspfad funktioniert überhaupt?* | *Woraus besteht der Tokenstrom, und welche Zahl im Feld hält einer Nachprüfung stand?* |
| Katalog | 251 Repos, 22 Tiefenaudits | 174 Repos, 153 Zitate, 15 vollständige READMEs |
| Stärke | Betriebsdisziplin, lauffähiges Hook-Paket | Breite, Evidenz-Tiers, Konfliktmatrix |
| Blinder Fleck | Aktivität und Lizenz der empfohlenen Repos | Länge; keine ausführbaren Artefakte |

v4 nimmt **Ordnung und Gesetze aus Linie A**, **Konfliktmatrix und Mechanismenlehre aus Linie B**, **den lauffähigen Code aus GPT55SOL** und ergänzt eine dritte Ebene, die in keiner der beiden Vorlagen vorkommt: **gemessene Lieferfähigkeit** jedes empfohlenen Repositories.

**Was v4 gegenüber v3 neu entscheidet, steht in §11.**

---

## 2. Belastbarkeitsraster

| Marker | Bedeutung |
|---|---|
| `[DOKU]` | Offizielle Anthropic-Dokumentation oder Changelog |
| `[MESSUNG]` | In diesem Durchgang selbst gemessen (Sandbox, 13.08.2026) |
| `[GEMESSEN]` | Deine eigene Messung auf deiner Maschine |
| `[PROJEKT]` | Angabe des jeweiligen Projekts, nicht unabhängig reproduziert |
| `[SEKUNDÄR]` | Community-Referenz, plausibel, nicht erstquellenbelegt |
| `[SCHLUSS]` | Ableitung, nicht belegt |

Das Raster ist keine Kosmetik. Die wichtigste Empfehlung dieses Dokuments — Stufe 0 — hängt weiterhin an einer `[SEKUNDÄR]`-Zahl und ist deshalb als *erste zu messende Größe* ausgewiesen, nicht als feststehender Befund.

---

## 3. Die drei Gesetze

### Gesetz I — Genau ein mutierender Eigentümer pro Fläche

Claude Code führt **alle passenden Hooks parallel** aus; identische Handler werden dedupliziert `[DOKU]`. Zwei registrierte `PreToolUse(Bash)`-Rewriter sehen denselben ursprünglichen Aufruf und liefern konkurrierende `updatedInput`-Objekte. Dasselbe gilt für zwei `PostToolUse(Bash)`-Replacer. **Es gibt keinen verketteten Kompressionsstapel nach dem Muster „erst A, dann B".**

Wenn mehrere interne Regeln sequenziell laufen müssen, wird **ein** Dispatcher registriert, der intern deterministisch sequenziert und genau ein Hook-Resultat erzeugt.

> **Rückwirkung auf vorhandene Messungen:** Eine Messreihe, die auf einer Konfiguration mit mehreren gleichzeitig aktiven Bash-Mutatoren entstanden ist, misst eine Komposition, deren Zusammensetzung nicht garantiert ist. Der Mittelwert kann stimmen und die Streuung trotzdem teilweise struktureller Natur sein statt Rauschen.

### Gesetz II — Append-only schlägt Prefix-Rewrite

Aus der Prompt-Caching-Dokumentation `[DOKU]`:

- **Invalidieren den Cache nie:** Skills, Commands, Agents, **Hooks**, LSP-Server, Monitors, Themes. Was sie beitragen, wird hinter dem bestehenden Gespräch angehängt — die nächste Anfrage bezahlt nur das Neue.
- **Invalidieren den Prefix:** MCP-Server, die sich mitten in der Session verbinden oder trennen (auch ohne Zutun: stdio-Prozess stirbt, HTTP-Session läuft ab, Server reconnected), Modellwechsel (der Cache ist modell-gekeyed), CLAUDE.md-Änderung, Hinzufügen oder Entfernen einer Built-in-Deny-Regel.

Daraus die Aufnahmeregel:

> **Ein Hook, Skill, Command oder CLI-Wrapper ist cache-neutral und darf in den Stack. Ein API-Proxy muss den Cache-Write-Aufschlag erst verdienen, bevor er netto überhaupt spart.** Ohne gepaarte End-to-End-Messung mit ausgewiesener Cache-Read- und Cache-Creation-Ratio ist die Nettoersparnis eines Proxys eine Behauptung, keine Zahl.

Der `BASE_URL`-Slot ist die knappste Ressource des Stacks — es gibt genau einen, und vier Kandidatentypen bewerben sich darum (Session-Kompression, Cache-Reparatur, Routing, Format). Die Vergabe ist eine Messfrage.

### Gesetz III — Kein Werkzeug ohne gemessene Lieferfähigkeit  *(neu in v4)*

Vor jeder Empfehlung stehen vier Zahlen, die nichts mit Kompressionsraten zu tun haben: **letzter Commit, Sterne, Lizenz, Archivstatus.** Sie sind zu billig zu erheben, um sie zu übergehen, und sie haben in diesem Korpus zwei Empfehlungen gekippt, die beide Vorfassungen unbesehen tragen (§8).

Die Aufnahmeregel:

> **Freigabefähig ist ein Repository, das erreichbar ist, nicht archiviert, in den letzten 60 Tagen einen Commit hatte und eine Lizenz trägt, die die geplante Nutzung erlaubt.** Alles andere ist Pilot oder Watchlist — nie stiller Bestandteil des Zielstacks.

Über den Katalog v4: von 376 Repos erfüllen **249** dieses Kriterium `[MESSUNG]`.

---

## 4. Die vier Mechanismen — das Raster vor jeder Werkzeugwahl

Das Feld nennt alles „Kompression". Tatsächlich sind es vier Mechanismen mit je eigenem Erfolgskriterium und eigenem Risiko. Die Reihenfolge ist die Reihenfolge der Bearbeitung:

| # | Mechanismus | Was passiert | Ceiling | Qualitätsrisiko | Erfolgskriterium |
|---|---|---|---|---|---|
| 1 | **Vermeiden** | Der Token entsteht gar nicht (Prefix-Diät, native Deckel, Read-Clamps, Deny-Regeln, Verhalten) | **hoch** | keins | `/context` vorher/nachher |
| 2 | **Verlagern** | Der Token verlässt das Fenster, bleibt abrufbar (Spill-Dateien, Index, Retrieve-Marker, Subagenten) | hoch | gering, braucht Retrieve-Disziplin | Abrufquote, Zusatzrunden |
| 3 | **Verdichten** | Information geht verloren (Filter, Summaries, LLM-Kompression) | **niedrig** | **dokumentiert hoch** | Qualitätsgate *vor* Tokengate, Original abrufbar |
| 4 | **Verbilligen** | Gleiche Tokens, billiger (Cache-Hygiene, Routing, Modellwahl) | hoch auf der Rechnung | keins bis mittel | Cache-Read/Creation-Ratio |

Zwei Konsequenzen:

- **Werkzeuge, die (1)+(2) kombinieren, schlagen jeden reinen Verdichter.** Ein Verdichter ohne abrufbares Original ist prinzipiell verdächtig.
- **Die populärsten Werkzeuge des Feldes arbeiten auf (3), dem Mechanismus mit dem niedrigsten Ceiling und dem höchsten Risiko.** Die Sternzahl ist in diesem Feld anti-korreliert mit dem Hebel.

---

## 5. Die neun Flächen, nach Hebel sortiert

| # | Fläche | Wie oft abgerechnet | Hebel | Eigentümer |
|---|---|---|---|---|
| **1** | **Prefix** (CLAUDE.md, Skill-Listing, Plugin-Metadaten, MCP-Schemata, Agent-Beschreibungen) | **jede Runde** | **hoch** | Projekt/Nutzer — kein Werkzeug nötig |
| **2** | Tool-Definitionen | jede Runde | hoch | Tool Search (nativ), Schema-Kollaps |
| **3** | Sitzungswachstum (Tail wächst linear → Kosten quadratisch) | jede Runde | hoch | TASK-STATE + `/clear`, Subagenten |
| **4** | Code-Retrieval (Lesen statt gezielt holen) | vervielfacht Fläche 5 | mittel-hoch | genau ein Codeindex |
| **5** | Bash- und Tool-Ausgaben | einmal geschrieben, danach im Tail | **workload-abhängig, oft null** | genau ein Bash-Owner |
| **6** | Modell-Ausgabe (Prosa, Scope Creep, Codeumfang) | jede Runde im Tail | mittel | Implementation Ladder |
| **7** | Kompaktierungsverlust | — | mittel | native Compaction + Checkpoints |
| **8** | Strukturdaten (JSON/YAML/CSV-Syntaxkosten) | punktuell | niedrig | Shape-Gate, TOON/PAKT |
| **9** | Modellwahl / Routing | jede Runde | hoch, aber qualitätskritisch | bewusste Entscheidung |

**Fläche 5 steht in der Mitte, nicht oben.** Drei unabhängige Wege führen zu diesem Befund:

- Fremdmessung: ~63 % Reduktion auf ausgewählten Fixtures, aber **~2 %** billed saving auf kleinem Task; über 136 reale Sessions **median 0 %** collapsible share `[PROJEKT]`.
- Deine Messung: Ladder **−27,2 %** auf einer engen Klasse, **−0,3 %** gepaart in der Serie, in der Claude Code den einzig lohnenden Fall selbst ausgelagert hatte `[GEMESSEN]`.
- Anatomie-Analyse: Tool-/Bash-Output ist **~20–22 %** des Kontextstroms, File-Reads sind der größte native Strom `[PROJEKT]`.

> **Die Bash-Ausgabefläche ist auf typischen Workloads meist ein Nullsummenspiel und lohnt nur bei log-, test- und build-lastigen Sessions.**

Von 375 katalogisierten Repositories arbeitet die große Mehrheit auf Fläche 5 — und genau **ein einziges** ernsthaft auf Fläche 1. Das ist der blinde Fleck des gesamten Feldes. Zur Verfügbarkeit dieses einen siehe §8.2.

---

## 6. Der Zielstack v5

### Stufe 0 — Prefix-Diät

**Pflicht. Kostet nichts. Braucht kein einziges Repository. Kommt vor allem anderen.**

| Maßnahme | Grundlage |
|---|---|
| Plugin- und Skill-Inventar auf das tatsächlich Genutzte kürzen | **Korrigiert gegenüber v4:** die Rechnung „n Skills × ~100 Token" ist als Modell falsch. `skillListingBudgetFraction` und `skillListingMaxDescChars` sind ein **Budgetdeckel**, keine Stückkostenlogik `[MESSUNG]`. Der Posten ist real, seine Größe unbekannt; der Adressat sind die **25 aktiven Plugins aus 18 Marketplaces** `[MESSUNG]`. |
| Plugins und Marketplaces auf das Genutzte kürzen | Plugin-Toggles mitten in der Session schreiben den Cache neu `[DOKU]` — einmal aufräumen, dann in Ruhe lassen |
| Jede injizierte Guidance gegen ihre Nutzung prüfen | 3,5k Token SessionStart-Guidance führten zu 0 von 92 erwarteten Aufrufen `[GEMESSEN]` — Totalausfall, kein Grenzfall |
| MCP-Server projektweise statt global (`.mcp.json`) | Verbindungsabbruch invalidiert den Prefix `[DOKU]`; eine nicht registrierte MCP-Anbindung sparte gemessen 286 Token/Session `[GEMESSEN]` |
| `deny`-Regeln für ungenutzte Built-ins | Ein nackter Toolname als Deny-Regel entfernt die Definition vollständig aus dem Kontext `[DOKU]` |
| CLAUDE.md klein und **stabil** halten | Jede Änderung invalidiert alles danach `[DOKU]`. **Im vorliegenden Setup nichts zu tun:** 173 Zeilen, 1.975 Token `[MESSUNG]`, unter der Doku-Vorgabe von 200 Zeilen. |
| `.claude/rules` **nur** mit hartem Path-Scoping, 3–5 Dateien à unter 30 Zeilen | Rule-Files werden als `<system-reminder>` bei **jedem** Tool-Call reinjiziert: 93.000 Token = 46 % des Fensters bei 11 Dateien und 30 Tool-Calls. Das Issue ist **„closed as not planned"**, also unbehoben `[DOKU]`. |

**Akzeptanzgate:** `/context` vor und nach der Kürzung, gleiche Aufgabe, gleicher Startzustand. Diese eine Messung entscheidet, ob der Rest des Stacks überhaupt lohnt.

### Stufe 1 — Native Deckel

Wirken sofort, sind cache-neutral, brauchen keinen Fremdcode. In `settings.json` unter `env`, alle Werte als Strings `[DOKU]`:

**Einzeln aktivieren, jeden Wert gegen den unveränderten Default messen. Nicht als Paket.**

```jsonc
{
  "env": {
    "ENABLE_TOOL_SEARCH": "true",                // NICHT unset: auto ist Schwellenmodus [DOKU]
    "MAX_MCP_OUTPUT_TOKENS": "8000",             // Default 25000; die stillsten Fresser
    "BASH_MAX_OUTPUT_LENGTH": "24000",           // unterhalb der ~30.000-Zeichen-Grenze [DOKU]
    "TASK_MAX_OUTPUT_LENGTH": "12000",           // Deckel auf Subagent-Rückgaben
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "16000",
    "CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS": "1"  // ~1.800 Token je Call [PROJEKT]
  }
}
```

**`ENABLE_TOOL_SEARCH` — korrigiert gegenüber v4.** Vier Werte, drei Verhaltensweisen: *unset* = `auto` = Schwellenmodus (~10 % des Fensters), `auto:N` setzt die Schwelle, `true` erzwingt Deferral unabhängig von der Schwelle, `false` lädt alle Definitionen in jeder Runde. **Tokenminimal ist `true`**, weil `auto` dokumentiert auch oberhalb der Schwelle nicht zuverlässig auslöst und `true` das erwartete Verhalten wiederherstellt `[DOKU]`. **`false` nie setzen.**

Zwei Einschränkungen, die in keinem der vier Validierungsdatensätze stehen: HTTP- und Streamable-HTTP-MCP-Server werden **nicht** deferiert `[DOKU]`. Und seit v2.1.69 sind auch die eingebauten Tools hinter ToolSearch deferiert, von ~14–16k auf ~968 Token Vorablast `[DOKU]` — das verschiebt die Rechnung für Fläche 2 nach unten.

**`CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS` — neu in v5.** Claude Code injiziert live `git status` in den Systemprompt; jede Dateiänderung ändert damit den Prefix und bricht den Cache `[PROJEKT]`. In einem laufenden Git-Repo potenziell der größte Einzelposten dieser Stufe.

**`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` — aus v5 entfernt.** Es ist dokumentiert, dass die Variable im `settings`-`env` wirkungslos bleiben kann, und im vorliegenden Setup steht `autoCompactEnabled: false`. `MAX_THINKING_TOKENS` bewusst nicht gesetzt: Fable 5 ignoriert sämtliche Thinking-Toggles `[SEKUNDÄR]`, und bei den übrigen Modellen ist das Qualitätsrisiko größer als der Gewinn.

> Der `BASH_MAX_OUTPUT_LENGTH`-Deckel erreicht auf dem direkten Weg, was eine Kompressionsleiter auf dem indirekten versucht. Genau dieser native Mechanismus hat in deiner Messreihe v4 den einzig lohnenden Fall vorweggenommen `[GEMESSEN]`.

### Stufe 2 — Capability klären, bevor irgendetwas mutiert

`hookSpecificOutput.updatedToolOutput` gilt **seit 2.1.121 für alle Tools**, vorher nur für MCP-Tools `[DOKU]`. Die Beobachtungen, auf denen die Skepsis früherer Fassungen aufbaut, stammen aus der Zeit davor. Auf aktueller Installation ist der Canary damit **billige Absicherung, kein Blocker**.

**Die Falle liegt in der anderen Richtung, und sie ist reproduziert** `[MESSUNG]`: `hookActivation=auto` fällt ohne bestandene Live-Probe still auf Shadow zurück. Ich habe `bash-dump-guard.mjs` mit einem 100-KB-Payload gefüttert — der Guard gibt leeres stdout zurück, exit 0, und `--status` meldet `effective: "shadow", reason: "capability-record-missing"`. Wer den Probe nie fährt, betreibt einen Guard, der in `settings.json` aktiv aussieht und keine einzige Ausgabe anfasst.

**Also: Probe fahren und Ergebnis ablegen, oder den Modus explizit setzen.**

| Zustand | Automatischer Bash-Owner | Guard-Modus |
|---|---|---|
| PostTool besteht | Guard als alleiniger `PostToolUse(Bash)`-Replacer | replace |
| Nur PreTool besteht | genau **ein** Wrapper | shadow |
| Beide fallen | kein automatischer Pfad — expliziter Pipe/MCP-Reducer | shadow |
| Unbekannt | keine produktive Behauptung, erneut prüfen | shadow |

Wiederholung: nach jedem Claude-Update, bei Wechsel des Executables, spätestens alle 30 Tage.

### Stufe 3 — Genau ein Bash-Owner (erst wenn Stufe 0–2 stehen)

Auswahl nach Workload, nicht nach Kompressionsrate. **Alle Kandidaten mit gemessenem Stand vom 13.08.2026** `[MESSUNG]`:

| Workload | Owner | ★ | letzter Commit | Lizenz | Einstufung v4 |
|---|---|---:|---|---|---|
| Test-/Build-/Log-lastig, PostTool besteht | **eigener Guard (GPT55SOL-Paket)** | — | — | — | **erste Wahl** — kein Command-Rewrite, native Permission-Prüfung bleibt auf dem Originalbefehl |
| Breite Turnkey-Abdeckung | `claudioemmanuel/squeez` | 182 | 12.08. | Apache-2.0 | **freigabefähig** — Persona/Memory/Codemap abschalten |
| Dedup über die Session | `fajarhide/omni` | 320 | **13.08.** | Apache-2.0 | **freigabefähig** — dedupliziert bereits gezeigte Zeilen; das kann ein Filter prinzipiell nicht |
| Filter als Daten testbar | `edouard-claude/snip` | 406 | 04.08. | MIT | **freigabefähig** — YAML-Filterdateien, einzeln messbar |
| Messbarkeit ist das Kriterium | `zdk/lowfat` | 566 | 08.07. (36 d) | Apache-2.0 | **Pilot** — reproduzierbare Werte, aber ruhend |
| ~~Nur PreTool, konservativ~~ | ~~`jaredboynton/semtrim`~~ | **0** | 03.07. (41 d) | MIT | **gestrichen** — 0 Sterne, ruhend; siehe §8.1 |
| ~~Turnkey-Monolith~~ | ~~`NodeNestor/claude-lean-context`~~ | **1** | 11.08. | MIT | **Watchlist** — 1 Stern trägt keine Zielstack-Rolle |
| — | `ojuschugh1/sqz` | 593 | 21.06. (53 d) | **Elastic 2.0** | **gesperrt für dienstliche Nutzung** |

**Nicht verhandelbar** (beide Linien, unabhängig):

- **Exakt bleiben:** Fehler, nicht-leeres stderr, Patches, Migrationen, Security-Scans, IaC-Pläne, Krypto-Ausgabe, null-delimited Daten, `# token-raw`.
- **Keine verlustbehaftete Ersetzung ohne lokal archivierte, exakt abrufbare Originalantwort.**
- **Net-Win-Gate:** keine komprimierte Ausgabe emittieren, wenn die Ersparnis nach Footer-Overhead unter Byte- **und** Ratio-Schwelle liegt. Belegter Fall ohne dieses Gate: eine Datei komprimiert auf 2.001 Token gegen 1.719 verbatim `[GEMESSEN]`.
- **Niemals `permissionDecision: "allow"`** aus einem Guard. Ein Hook kann nur verschärfen, nie lockern — ein `allow` überspringt den interaktiven Prompt und öffnet die aus dem Feld dokumentierte Bypass-Lücke.
- **PreTool-Wrapper verändern den ausgeführten Befehl.** Statische `deny`/`ask`-Regeln für destruktive Operationen bleiben Pflicht, `pipefail` erhalten, gefährliche Befehle nie automatisch wrappen.
- **Fail-open bei jedem Fehler.** Ein Guard, der bei kaputtem State blockiert, kostet mehr als er spart.

### Stufe 4 — Genau ein Codeindex

Diese Fläche ist bei einem Bash-zentrierten Stack typischerweise **unbesetzt** und liegt über Fläche 5 im Hebel: eine Strukturfrage, die 40k Token Datei-Lesen auslöst, ist teurer als jedes einzelne Bash-Dump.

| Fall | Index | ★ | letzter Commit | Lizenz | Prefix-Kosten |
|---|---|---:|---|---|---|
| klein bis mittel, Symbol- und Relationsfragen | `colbymchenry/codegraph` | 66.154 | 08.08. | MIT | gering (CLI) |
| LSP-gestützte Symbolnavigation, viele Sprachen | `oraios/serena` | 27.939 | 12.08. | MIT | ein MCP-Server |
| deterministische, byte-stabile Signaturkarte | `manojmallick/sigmap` **als CLI** (`npx`) | 615 | 28.07. | MIT | **null** |
| großes polyglottes Monorepo, Architektur/Impact | `deusdata/codebase-memory-mcp` | 38.730 | 12.08. | MIT | ein MCP-Server |
| erzwungener Read-Redirect | `aovestdipaperino/tokensave` | 571 | 08.08. | — | Pilot |

**Dasselbe Werkzeug kostet als CLI null Prefix und als MCP-Server Schemata in jeder Runde plus Cache-Risiko beim Reconnect. Die Form ist wichtiger als die Kompressionsrate.**

Anti-Pattern: den Codegraph abfragen und danach trotzdem alle gefundenen Dateien vollständig lesen. Das vernichtet den Gewinn vollständig.

### Stufe 5 — Sitzungsgrenze

Der mathematisch größte Hebel nach Stufe 0 und der billigste überhaupt: jeder Token im Kontext wird jede Runde neu abgerechnet, also wachsen die Input-Kosten einer ungemanagten Session mit dem **Quadrat** ihrer Länge. Ein Deckel macht daraus lineares Wachstum.

Reihenfolge:

1. `.claude/TASK-STATE.md` — Ziel, bestätigte Fakten, Entscheidungen, Restarbeit, Verification Contract, **ein** konkreter nächster Schritt.
2. `/clear` oder native Kompaktierung. Native Kompaktierung ist dreistufig: Microcompact (löscht veraltete Tool-Ergebnisse ohne Modellaufruf), serverseitiges Context-Management ab ~180K Input mit Ziel ~40K, dann Voll-Compact per Modellaufruf `[SEKUNDÄR]`. Ein Aus-Schalter existiert nicht `[SEKUNDÄR]`.
3. Subagenten für Bulk-Reads — isoliertes Fenster, nur die Zusammenfassung kehrt in den Tail zurück.
4. Erst bei nachgewiesenem Restproblem: `aerovato/magic-compact` (134 ★, 12.08., BSD-3) als manueller Pilot.
5. Erst danach, und nur allein: **ein** History- oder Rolling-Proxy — mit ausgewiesener Cache-Read-/Creation-Messung, weil er unter Gesetz II fällt.

Detail: das Skill-Listing wird nach einer Kompaktierung **nicht** neu injiziert, weil das ~4.000 Token reine Cache-Erzeugung kostet `[SEKUNDÄR]`. Ein großes Skill-Inventar kostet also vor allem am Sessionanfang — was Stufe 0 zusätzlich stützt.

### Stufe 6 — Verhalten

Implementation Ladder statt Code-Golf. Vor neuem Code oder einer Dependency, Halt bei der ersten Sprosse, die die Aufgabe sicher löst:

1. Muss das existieren? 2. Ist es im Repo schon da? 3. Standardbibliothek? 4. Native Plattform/Framework? 5. Bereits installierte Dependency? 6. Deklarativ oder einzeilig? 7. Kleinste korrekte Implementierung.

Nicht verhandelbar: Security, Datenintegrität, Accessibility, Kompatibilität, Migrationen, Tests, Verification Contract.

Referenz: `DietrichGebert/ponytail` (101.665 ★, 07.08., MIT) — **−10,3 % Kosten bei p = 0,004** in der unabhängig nachgeprüften Messung, ~54 % weniger LOC über 12 Feature-Tasks bei n = 4, mit ausdrücklicher Korrektur der eigenen früheren 80–94-%-Zahl nach unten `[PROJEKT]`. Beide Linien nennen dies unabhängig als den **einzigen** Tier-1-bestätigten Werkzeuggewinn im gesamten Feld.

⚠️ Gegenbefund: Es gibt Belege, dass aggressive Kürze-Prompts Coding- und Reasoning-Benchmarks verschlechtern `[PROJEKT]`. Kürzerer Code ist nicht automatisch besserer Code. Auf dieser Stufe ist das Qualitätsgate wichtiger als das Tokengate.

### Stufe 7 — Messung

Drei Ersparnisbegriffe, die niemals vermischt werden:

| Begriff | Was |
|---|---|
| **Slice-Ersparnis** | Bytes/Token, die ein Filter lokal an einer Ausgabe entfernt |
| **Modellsichtbare Ersparnis** | Was tatsächlich weniger in den Request geht |
| **End-to-End-Ersparnis** | Abgerechnete Tokens über die ganze Aufgabe, inklusive Cache-Creation, Zusatzrunden, Retries und Recovery |

**Nur die dritte entscheidet. Die erste ist die Zahl in fast allen READMEs.**

Verfahren: gepaarte Läufe, gleiche Aufgabe, mindestens drei Wiederholungen je Arm, Streuung ausgewiesen, Qualitätsgate vor Tokengate. Zusätzlich Cache-Read- und Cache-Creation-Werte protokollieren — das ist das Erfolgskriterium für Stufe 0 und das Ausschlusskriterium für jeden Proxy.

Werkzeuge: `ccusage/ccusage` (17.888 ★, 13.08., MIT) als Baseline, `getagentseal/codeburn` (9.283 ★, 12.08., MIT) für Waste-Analyse und den realized-vs-estimated-Abgleich.

Warum README-Prozente nicht addierbar sind: unterschiedliche Nenner — einzelne Fixture, nur gematchte Calls, Bytes statt Token, ein ausgewählter langer Task, Full-file-Baseline statt nativem Claude-Verhalten, Listenpreis statt Cache-Preis, Eingabe ohne Eigenoverhead.

---

## 7. Konfliktmatrix

Jeder Konflikt ist ein Streit zweier Komponenten um **dieselbe Invariante**: Byte-Stabilität des Prefix, Eindeutigkeit des Hook-Punkts, Einmaligkeit der Schema-Oberfläche. Wer das Muster kennt, braucht die Tabelle nicht auswendig — für jede neue Kombination genügt die Frage: *verletzen beide dieselbe Invariante?*

| Konfliktpaar | Mechanismus | Auflösung |
|---|---|---|
| Zwei `PostToolUse(Bash)`-Replacer (Kompressor + eigener Guard + Feedback-Hook) | Parallelausführung, konkurrierende Resultate | Gesetz I → **ein** Dispatcher (R2) |
| Zwei `PreToolUse(Bash)`-Wrapper | dito, zusätzlich doppelter Command-Rewrite | Gesetz I → genau einer |
| Kontext-MCP beansprucht native Bash/Read/Grep/Glob, Kompressor ebenfalls | doppelte Ownership auf vier Flächen | Kontext-MCP auf **externe Massendaten** beschränken, native Flächen dort abschalten |
| Zwei `BASE_URL`-Proxys (Session-Kompression + Cache-Reparatur) | Referenz-Marker überleben keinen zweiten Durchgang; Prefix-Mutation kaskadiert | **Maximal ein Proxy**; Vergabe über Cache-Hit-Messung |
| Zwei Schema-Indirektionen auf demselben MCP-Server | doppelte Wrapper-Ebene | Eine Schema-Schicht pro Server; natives Tool Search ist die Gratis-Baseline |
| Memory-MCPs global registriert | 44–54 Tool-Definitionen ≈ 4,4–8,6k Token/Session vor der ersten Nachricht `[PROJEKT]` | Nie global — Subagent-Frontmatter oder projektlokale `.mcp.json` |
| Zwei Codeindizes | doppelte Prefix-Kosten, widersprüchliche Antworten | Genau einer, nach Repogröße gewählt |
| Deaktiviertes Plugin, dessen Shell-Hooks noch registriert sind | tote Registrierung mutiert weiter | Registry-Abgleich (R6): Hooks entfernen, nicht nur Plugin auf `false` |
| Fremdguard überschreibt den eigenen Guard-Dateinamen | Installer schreibt nach `~/.claude/hooks/bash-dump-guard.mjs` | Fremde Reducer **unter eigenem Namen** installieren und aus dem Dispatcher aufrufen |
| LLM-basierte Kompression auf Code | Retrieval unter 50 % auf Quelltext; nichtdeterministische Umformulierung bricht den Prefix `[PROJEKT]` | Für Coding-Agenten kontraindiziert |
| Kompressions-Gateway × Prefix-Cache | Gateway-Kompression ist antagonistisch zum Prefix-Cache | Routing über Rollen statt über ein Kompressions-Gateway |

Zwei Asymmetrien sind entscheidend: eine doppelte Schema-Schicht kostet nur Effizienz — **ein gebrochener Cache dreht das Vorzeichen der gesamten Ersparnis.** Deshalb steht die Cache-Hit-Rate über jeder Einzelkomponente.

---

## 8. Was v4 gegenüber v3 an konkreten Empfehlungen kippt

### 8.1 Zwei Zielstack-Einträge ohne Substanz

| Repo | Rolle in v3 | Messung 13.08. | Entscheidung v4 |
|---|---|---|---|
| `jaredboynton/semtrim` | Stufe 3, „nur PreTool, konservativ" | **0 ★**, letzter Commit 03.07. | **gestrichen** |
| `NodeNestor/nestor-lean` → `claude-lean-context` | Stufe 3 „maximale Turnkey-Abdeckung"; Entscheidungsmatrix bei Read/Edit-Loops; Katalogurteil *„sehr starke monolithische Alternative"* | **1 ★** | **Watchlist**, nicht Zielstack |

v3 formuliert selbst richtig, dass Sterne Aufmerksamkeit und nicht Korrektheit messen. Das ist als Warnung gegen Popularitätsbias gemeint — es rechtfertigt nicht, ein Repo mit einem Stern als „sehr starke Alternative" in den Zielstack zu schreiben. Beides sind valide Piloten; keins ist eine Empfehlung.

### 8.2 Der einzige Prefix-Hebel des Feldes ist für dienstliche Nutzung gesperrt

`alexgreensh/token-optimizer` (1.860 ★, 12.08.) steht unter **PolyForm Noncommercial 1.0.0** `[MESSUNG]`. v3 nennt es als *das einzige* Repository, das ernsthaft auf Fläche 1 arbeitet — also auf dem größten Hebel und der am dünnsten besetzten Fläche. Für kommerzielle oder dienstliche Nutzung ist es damit nicht verwendbar.

**Konsequenz:** Fläche 1 bleibt tatsächlich unbesetzt. Sie wird nicht durch ein Repository gelöst, sondern durch Stufe 0 (Handarbeit, einmalig, kostenlos) plus R1 als read-only Beobachter. Das ist kein Provisorium — es ist der einzige lizenzsaubere Weg, und er kostet unter drei Stunden.

Weitere Fences im Zielstack-Umfeld: `mksglu/context-mode` und `ojuschugh1/sqz` stehen unter **Elastic License 2.0**. Über den gesamten Katalog: 12 Fences, 60 Repos ohne erkennbare Lizenz. Ein Repo ohne Lizenz ist rechtlich „alle Rechte vorbehalten".

---

## 9. Regelwerk

Acht Regeln, absteigend nach erwartetem Hebel. Alle als Hooks — nach Gesetz II cache-neutral, nach Gesetz I mit klarer Ownership. **R1 bis R5 liegen im GPT55SOL-Paket lauffähig vor** (Syntax geprüft, Self-Tests grün, Smoke-Test grün, Checksummen OK `[MESSUNG]`).

### R1 — `prefix-budget.mjs` (SessionStart, read-only)
Misst beim Sessionstart Skills, Plugins, MCP-Server und die Größe der Instruktionsdateien und hängt **eine** Zeile an, wenn ein Budget überschritten wird. Kein Blockieren, keine Mutation. Erkennt zusätzlich doppelte Mutatoren auf derselben Hook-Fläche (Gesetz-I-Kollision). Das ist die Regel, die im gesamten Feld fehlt, und sie sitzt auf Fläche 1.

### R2 — `bash-owner-dispatch.mjs` (Dispatcher, PreToolUse:Bash **und** PostToolUse:Bash)
**Ein** registrierter Handler statt mehrerer. Intern sequenziert er die bestehenden Regeln (Toolnamen-Regel, Größenregel) und die Reducer-Module deterministisch und gibt genau ein Hook-Resultat zurück. Damit ist Gesetz I erfüllt, ohne bestehende Logik wegzuwerfen.

> **Migrationshinweis:** Fremdpakete installieren ihren Guard unter dem Dateinamen `bash-dump-guard.mjs`. Liegt dort bereits dein produktiver Guard, wird er ersetzt — ein Backup wird angelegt, aber `settings.json` zeigt danach auf fremden Code, der ohne bestandene Probe in Shadow läuft. **Fremde Reducer unter eigenem Namen installieren.**

### R3 — `read-slice-guard.mjs` (PreToolUse:Read)
Blockt Whole-File-Reads über N Zeilen und verlangt `offset`/`limit` oder eine Indexabfrage. Die Read-Seite ist in Bash-zentrierten Stacks typischerweise unbesetzt, obwohl dort mehr liegt.

### R4 — `reread-guard.mjs` (PreToolUse:Read) — *hier landet die Ladder*
Zweitlesung derselben Datei ohne zwischenzeitliche Änderung (mtime + Hash) → Verweis auf den vorhandenen Stash statt Neulesung.

**Das ist der Anwendungsfall, für den deine Eskalationsleiter taugt.** Deine eigene Messung zeigt: R1 und R2 der Leiter sind keine zwei Stufen, sondern zwei verschiedene verlustbehaftete Sichten; auf frischem Quelltext war R1 einmal aktiv irreführend `[GEMESSEN]`. Auf **nachweislicher Wiederholung** — identische Datei, unveränderte mtime, identischer Hash — gilt dieser Einwand nicht: dort ist der Inhalt bereits im Kontext, und der Stash ersetzt keine Information, sondern eine Dublette. Beide Linien kommen unabhängig auf dasselbe Muster (Loop-Guard ab der dritten identischen Wiederholung, Read-Dedup über mtime).

Umwidmung konkret:
- Geltungsbereich der Ladder von „Strukturfragen an Quelltext" auf „belegte Wiederholung" umstellen.
- Toten Code entfernen (`ledger()`, `extensionOf()` — rtk erkennt die Sprache am Inhalt, mit und ohne Dateiendung byteidentisch `[GEMESSEN]`).
- Escape-Valve behalten: eine bewusste Einmal-Wiederholung pro Denial. Ein Guard, der die zweite Lesung hart verweigert, produziert Umwege, die teurer sind als die Dublette.

### R5 — `session-economy.mjs` (PostToolUse, ratenlimitiert)
Ab X % Kontextfüllstand **einmal** pro Session: TASK-STATE schreiben und einen Schnittvorschlag anhängen. Nicht blockieren — der Checkpoint ist der Teil, der zählt: ohne ihn ist `/clear` teuer, mit ihm billig.

### R6 — Owner-Registry (`context-surface-owners.yaml`)
Jede mutierende Fläche bekommt genau einen eingetragenen Eigentümer plus Datum des letzten Live-Tests und Fingerprint des Executables. Ohne diese Tabelle ist Gesetz I nicht überprüfbar, sondern nur gut gemeint.

### R7 — MCP-Quarantäne (Konvention)
MCP-Server nur in `.mcp.json` des Projekts, nie global. Begründung ist hart: Verbindungsabbruch invalidiert den Prefix, und stdio-Server sterben ohne Zutun `[DOKU]`.

### R8 — Beobachter-Regel
Observability-Hooks dürfen parallel laufen, **sofern sie nichts mutieren und keinen Kontext injizieren**. Ein ratenlimitierter Hinweis-Hook ist streng genommen eine Kontextinjektion — er ist zulässig, gehört aber ins Budget von R1 und in die Registry, nicht in die Kategorie „kostenlos".

---

## 10. Migration deines gewachsenen Stacks

| Symptom | Regel | Auflösung |
|---|---|---|
| Kompressor-Hooks **und** eigener Bash-Guard **und** Feedback-Hook auf `PostToolUse(Bash)` | Gesetz I | Auf einen Dispatcher (R2) zusammenführen; genau einen Owner eintragen |
| Kontext-MCP beansprucht native Bash/Read/Grep/Glob, Kompressor ebenfalls | Gesetz I | Kontext-MCP auf externe Massendaten beschränken |
| Deaktiviertes Plugin, dessen Shell-Hooks noch registriert sind | R6 | Registry-Abgleich |
| Fremdguard überschreibt den eigenen Guard-Dateinamen | R2 | Unter eigenem Namen installieren |
| Generierte Instruktionsdateien, deren Wirkung nie gemessen wurde | Stufe 0 | Gegen tatsächliche Nutzung prüfen und auf das Belegte kürzen |
| Eskalationsleiter ohne belegten Anwendungsfall | R4 | Auf Wiederholungsfälle umwidmen, toten Code entfernen |
| Nudge-Engine injiziert Kontext bei jedem Prompt | R8 | Ins Prefix-Budget aufnehmen, nicht als kostenlos führen |
| Guard läuft in Shadow, ohne dass es jemand weiß | Stufe 2 | `--status` prüfen, Canary fahren, Ergebnis ablegen |

**Reihenfolge — jede Phase mit Messung abschließen, bevor die nächste beginnt:**

| Phase | Inhalt | Aufwand | Gate |
|---|---|---|---|
| 0 | Inventur: alle Hooks, Plugins, Skills, MCP-Server, Env-Flags erfassen; Registry befüllen; doppelte Mutatoren entfernen | 1–2 h | Registry vollständig |
| 1 | Prefix-Diät (Stufe 0) | 1–2 h | `/context` vorher/nachher |
| 2 | Native Deckel (Stufe 1) | 15 min | keine Regression |
| 3 | Capability-Canary, Guard in Shadow, `--status` verifizieren, zwei Wochen Metriken — **keine neuen Werkzeuge** | 2 Wochen | Capability-Record vorhanden **und** `effective` ≠ unbeabsichtigt `shadow` |
| 4 | Genau ein Bash-Owner, A/B gegen native Baseline | 1 Tag | End-to-End-Gewinn + Qualitätsgate |
| 5 | Genau ein Codeindex, gepaart benchmarken | 1 Tag | End-to-End-Gewinn |
| 6 | Sitzungsgrenze standardisieren (TASK-STATE + `/clear`, R5) | halber Tag | Kosten wachsen linear, nicht quadratisch |
| 7 | Governance: Canary nach jedem Update, quartalsweise Katalog-, Lizenz- und Benchmarkpflege | laufend | negative Nettoersparnis ⇒ Profil automatisch aus |

**Phase 1 und 2 zusammen kosten unter drei Stunden, installieren nichts und adressieren die Fläche, auf der praktisch die gesamte Repo-Landschaft nicht arbeitet.**

---

## 11. Was gegenüber v3 und dem KIMI-Report geändert wurde

**Gegenüber v3 (OPUS5):**
- **Gesetz III neu:** gemessene Lieferfähigkeit als Aufnahmekriterium. Zwei Zielstack-Einträge gestrichen bzw. auf Watchlist gesetzt (§8.1).
- **Lizenzen konkret zugeordnet** statt abstrakt gewarnt. `alexgreensh/token-optimizer` ist PolyForm Noncommercial — der genannte einzige Prefix-Hebel entfällt für dienstliche Nutzung (§8.2).
- **Konfliktmatrix ergänzt** (§7) — fehlte in v3 vollständig.
- **Vier-Mechanismen-Raster ergänzt** (§4) als Auswahllogik vor den Flächen.
- **Shadow-Fallback von Warnung zu Befund:** reproduziert und mit Reproduktionsanleitung belegt (§6 Stufe 2, Phase 3 mit hartem Gate).
- **Stufe 4 erweitert** um `oraios/serena` aus der KIMI-Linie.
- Katalog von 251 auf 376, alle Einträge mit gemessener Aktivität, Sternzahl und Lizenz.

**Gegenüber dem KIMI-Report:**
- **Die Schichtenkette wird nicht als Kette gelesen.** KIMIs Formulierung „die Verkettung ist kausal" ist inhaltlich richtig gemeint (jede Schicht verkleinert den Nenner der nächsten), verträgt sich aber schlecht mit Gesetz I. v4 spricht durchgängig von Flächen mit Eigentümern, nicht von einer Kette.
- **Ownership-Disziplin und Capability-Zustandsmaschine ergänzt** — bei KIMI nur als Einzelregeln vorhanden.
- **Umfang reduziert:** 26.698 auf rund 3.900 Wörter. Die Belege bleiben über `repo-catalog-v4.json` und `VALIDATION.md` erreichbar.

**Verworfen (ABACUS):**
- Die „Hook-Chain (Reihenfolge)" mit zwei `PreToolUse:Bash`-Mutatoren — widerspricht der dokumentierten Parallelausführung `[DOKU]`.
- Die „Proxy-Chain" mehrerer komprimierender Proxys in fester Portreihenfolge — widerspricht Gesetz II.
- Die Kumulativrechnung „Schicht 1–6: −85–92 %" — addierte README-Prozente aus unterschiedlichen Nennern.

**Verworfen (MANUS):**
- Die gewichtete Bewertungsmatrix als Entscheidungsgrundlage: kein Token- und kein Cache-Kriterium; CLAUDE.md wird mit der Höchstnote bewertet, obwohl es Prefix-Kosten ist. Das Prinzip — Bewertungsskript und Rohdaten beilegen, damit die Rechnung nachvollziehbar ist — wird übernommen.

---

## 12. Was nicht Standard wird

- Mehrere Bash-Rewriter, mehrere Output-Replacer, mehrere Codeindizes oder mehrere History-Proxys gleichzeitig.
- Ein Proxy ohne ausgewiesene Cache-Read- und Cache-Creation-Messung.
- Verlustbehaftete Ersetzung ohne abrufbares Original.
- Neuronale oder LLM-basierte Kompression auf Fehlern, Patches oder Security-Ausgaben.
- TOON/PAKT ohne Shape-Gate — tief verschachtelte oder heterogene Strukturen werden größer. **Nachtrag v5.1:** `PCIRCLE-AI/toonify-mcp` ist damit nicht erledigt — der ursprüngliche Defekt (Hook hängte über `additionalContext` an, statt zu ersetzen, und verdoppelte damit die Tokens) ist seit **0.8.0/0.8.1 vom 12.08.2026** behoben; das README belegt den Wechsel auf `updatedToolOutput`. Pilot mit **Pin ≥ 0.8.2** — auf 0.8.1 folgte am selben Tag ein Argument-Handling-Fix. Vorbehalt: vier Releases an einem Tag nach drei Monaten Stille sind ein Burst-Muster.
- Auto-allow durch einen Wrapper ohne statische destruktive Deny-/Ask-Regeln.
- Auto-Update für Komponenten, die Sessiondateien oder API-Traffic verändern.
- Addition von Savings-Prozenten aus verschiedenen README-Benchmarks.
- Ein Vollstack-Monolith **neben** einem bestehenden Stack — das ist ein Plattformwechsel, kein Baustein.
- Bild-Rendering des Kontexts als Standard: technisch die interessanteste Idee im Feld, aber ein prefix-rewritender Proxy mit Qualitätsrisiko auf Quelltext, und die Kostenrechnung hängt an Listenpreisen, die auf einem Abo nicht gelten.
- Komponenten unter Elastic 2.0, PolyForm Noncommercial, AGPL oder ohne erkennbare Lizenz im dienstlich genutzten Core.
- **Ein Repository im Zielstack, dessen letzter Commit älter als 60 Tage ist.**

---

## 13. Offene Punkte

- **Die ~100-Token-pro-Skill-Angabe ist `[SEKUNDÄR]`** und trägt die wichtigste Empfehlung dieses Dokuments. Sie gehört als Erstes gemessen: `/context` vor und nach dem Deaktivieren von 20 Skills.
- Fläche 1 bleibt nach dem Lizenzbefund ohne Werkzeug. Ob ein eigener, minimaler Prefix-Beobachter über R1 hinaus lohnt, ist offen — er wäre der erste seiner Art im Feld.
- 59 der 376 Katalogeinträge haben von keinem Agenten eine inhaltliche Bewertung erhalten; 60 haben keine erkennbare Lizenz.
- Keine der fünf Ausgaben und auch diese Prüfung liefert eine **End-to-End-Token-Messung**. Alle Ersparnisangaben bleiben unbestätigt, bis der Benchmarkplan aus dem GPT55SOL-Paket gefahren ist. Das ist der nächste sinnvolle Arbeitsschritt.
- Nicht ausgeführt: keines der katalogisierten Fremd-Repositories wurde installiert oder betrieben. Geprüft wurden ausschließlich die im Korpus mitgelieferten Skripte.
- Vollständigkeit ist nicht beweisbar: private, gelöschte, umbenannte oder frisch erstellte Repositories fehlen zwangsläufig, und ein öffentliches Repository kann sich nach dieser Momentaufnahme ändern.

---

## 14. Was v5 gegenüber v4 entscheidet

Acht Konflikte aus der Vier-Wege-Gegenüberstellung, jeder mit Beleg. Vollständige Herleitung in `UPDATE-PHASE3.md`.

| ID | Frage | Entscheidung | Beleg |
|---|---|---|---|
| K3 | `ENABLE_TOOL_SEARCH` | **`true`**, nicht unset und nie `false` | Doku + `anthropics/claude-code#19890`, `#31002`, `#40314` |
| K4 | Skill-Stückkosten | Rechnung „n × 100 Token" **gestrichen** | `skillListingBudgetFraction: 0.01` in der eigenen `settings.json` |
| K5 | `.claude/rules` auslagern | nur mit harter Obergrenze | `#32057` — **closed as not planned**, also unbehoben |
| K6 | Subagenten | sparen Fenster, **vervielfachen Volumen** (~7×) | begriffliche Trennung, beide Seiten korrekt |
| K7 | `updatedToolOutput` | **Objektform** Pflicht bei Built-in-Bash | Selbsttests des funktionsgeprüften Guards prüfen `updatedToolOutput.stdout` |
| K8 | `permissionDecision: allow` | Regel bleibt, **Begründung ändert sich** | `rtk#260` ist CLOSED — nicht gefährlich, sondern unnötig |
| K9 | rtk und CVE-2026-33068 | **Fehlzuordnung.** Die CVE betrifft Claude Code selbst | GHSA-mmgp-wc2j-qcv7, CVSS 7,7, behoben in 2.1.53 |
| K1 | Union-Größe | beide Zählungen korrekt, GPT56 ist Teilmenge | 365 kanonisch vollständig überdeckt |

**Offen:** K10 — der tatsächliche Prefix-Posten der 25 aktiven Plugins. Nur per `/context` auf der Zielmaschine messbar.

---

## 15. Der Ist-Zustand, gemessen

Alle vier Validierungsdatensätze formulieren Gesetz I. Keiner hat die real vorliegende `settings.json` dagegen geprüft.

| Befund | Wert | Konsequenz |
|---|---|---|
| Handler auf `PreToolUse:Bash` | **5** (davon 3 mutierend) | Gesetz I verletzt → Dispatcher, Wave 02-1 |
| Handler auf `PostToolUse:Bash` | **3** | Gesetz I verletzt → Dispatcher, Wave 02-1 |
| Gesetz-I-Befunde gesamt | **8** | Wave 00-1 |
| Stufe-1-Env-Variablen gesetzt | **0 von 6** | billigste Maßnahme des Konzepts, unumgesetzt |
| Aktive Plugins | **25 aus 18 Marketplaces** | Adressat von Stufe 0 |
| `CLAUDE.md` | 173 Zeilen, **1.975 Token** | erfüllt die Vorgabe — **nicht anfassen** |
| `autoCompactEnabled` | **false** bei `opus[1m]` | kein automatischer Sessiongrenz-Auslöser; TASK-STATE + `/clear` sind der einzige Mechanismus |

Der Konflikt ist nicht theoretisch: die Umschreibung eines Wrappers auf `<wrapper> wrap '<original>'` hat einem nachgelagerten Gate schon einmal den Kommandokopf verdeckt, worauf das Gate jeden Aufruf durchließ und seine Stufe nie feuerte.

---

## 16. Reihenfolge

| Phase | Inhalt | Aufwand | installiert etwas? |
|---|---|---|---|
| 0 | Inventur, Registry befüllen, Defekte schließen | 1,5 Tage | nein |
| 1 | Prefix-Diät, native Deckel einzeln | **unter 3 h** | **nein** |
| 2 | Dispatcher, Capability-Canary | 1–2 Tage | ja, eigener Code |
| 3 | A/B Bash-Owner, A/B Codeindex | 2 Tage | ja, ein Fremdrepo je Arm |
| 4 | Sitzungsgrenze standardisieren | 0,5 Tage | nein |
| 5 | ein Proxy — nur bei belegtem Restproblem | 2–3 Tage | ja |

**Phase 0 und 1 adressieren die Fläche, auf der praktisch die gesamte Repo-Landschaft nicht arbeitet, und installieren nichts.**


---

## 17. Nachträge v5.1

### 17.1 Der Name `bash-dump-guard.mjs` ist dreifach belegt (D6)

| Artefakt | Was es ist | Registrierung |
|---|---|---|
| `hooks/bash-dump-guard.mjs`, 234 Zeilen | **Deny-Gate**, emittiert `permissionDecision: "deny"` | `PreToolUse:Bash` — **korrekt** |
| `GPT55SOL_PRO/bash-dump-guard.mjs`, 1.064 Zeilen | **Outputreducer**, emittiert `updatedToolOutput` | `PostToolUse` |
| v3.1-Variante mit `hookActivation: "replace"` | Outputreducer | bewertet, nie ausgeliefert |

Drei Bewertungsmodelle haben drei verschiedene Dateien unter einem Namen bewertet. **Ein Teil der Bash-Owner-Divergenz war eine Namensverwechslung, keine Sachfrage.** Die Registrierung auf `PreToolUse` war nie falsch — sie zeigt auf das Deny-Gate, und für das ist sie richtig.

Konsequenz im Paket: die Dispatcher-Stufen heißen `bash-deny-gate` und `bash-output-reducer`. Der Dateiname `bash-dump-guard.mjs` wird nicht mehr vergeben.

### 17.2 Die eigene Rubrik hatte einen Zirkelschluss (D7)

Achse D vergab **20 von 100 Punkten für die Anzahl der Datensätze, die ein Repo empfehlen**. Damit floss als Evidenz ein, was die Erstvalidierungen behauptet hatten — Popularität im eigenen Korpus, verbucht als Beleg. Zugleich fehlte jede Achse für die Frage, **ob ein Werkzeug tut, was es behauptet**.

Belegfall aus dem eigenen Dokument: `claude-code-cache-fix` hat mit 87 offenen Issues je 1.000 Sternen die schlechteste Fehlerbilanz des gesamten Feldes — als Unstimmigkeit U3 notiert, mit B = 2 von 20 bewertet — und landete trotzdem bei 75.

**D ist jetzt geprüfte Korrektheit (0–20)** aus `scripts/judgments.json`, gespeist aus der einzigen ausdrücklichen Korrektheitsprüfung im Korpus. **Ohne Prüfung: 0 Punkte.** Ein ungeprüftes Werkzeug bekommt keine Korrektheitspunkte, nur weil viele es nennen.

Wirkung auf die Spitzengruppe: `ccusage` 100 → 96 · `ponytail` 97 → 90 · `magic-compact` 83 → 73 · `cache-fix` 75 → 67. Die Rangfolge bleibt weitgehend, die Abstände werden ehrlicher.

### 17.3 Was bewusst offen bleibt

| Punkt | Stand |
|---|---|
| **E2E-Baseline** | fehlt weiterhin. Keine der drei Bewertungsrunden und keine der Meta-Validierungen hat je eine gepaarte Tokenmessung gefahren. Das ist der einzige verbliebene Arbeitsschritt, und er lässt sich nicht durch Dokumente ersetzen. |
| Korrektheit der 18 ungeprüften Repos | D = 0. Nicht schlecht bewertet, sondern **ungeprüft** — der Unterschied steht in `judgments.json` je Zeile. |
| Fläche Prefix, Fläche externe Massendaten | unbesetzt, Lizenzgründe. Unverändert. |
