# Claude Code Token-Stack — Konzept v3

**Stand:** 10. August 2026
**Ersetzt:** `token-stack-konzept-2026-08.md` (Durchgang 1) und `claude-code-token-stack-research-2026-08-10.md` (Revision 2)
**Katalog:** 251 Repositories (`repo-catalog-v3.json` / `.md`)

---

## 1. Was hier zusammengeführt wurde

Zwei unabhängige Rechercheduchgänge kamen zu unterschiedlichen Antworten auf dieselbe Frage — und beide hatten recht, aber über verschiedene Ebenen.

| | Durchgang 1 | Revision 2 |
|---|---|---|
| Leitfrage | *Was liegt im Prefix und wird jede Runde neu abgerechnet?* | *Welcher Eingriffspfad funktioniert überhaupt, und wem gehört welche Fläche?* |
| Zentraler Befund | Cache-Sicherheit als Ausschlusskriterium; L0-Prefix als größter Hebel | Hooks laufen parallel → genau ein mutierender Eigentümer pro Fläche; Capability vor Behauptung |
| Katalog | ~70 gesichtet, 22 READMEs vollständig | 226 dedupliziert, 22 Tiefenaudits, 55 discovery-only |
| Blinder Fleck | Hook-Komposition, Permission-Semantik, Recovery-Pflicht | Prefix-Ebene, Cache-Invalidierung als Installationskriterium |

v3 nimmt aus Revision 2 die **Betriebsdisziplin** (Ownership, Capability, Recovery, Lizenz-Fences) und aus Durchgang 1 die **Reihenfolge und das Ausschlusskriterium** (Prefix zuerst, Cache als harte Grenze). Der Katalog ist die Vereinigung beider: 226 + 25 neue Einträge, zwei zusätzliche Felder.

**Verifikationsstand des v2-Pakets** (in diesem Durchgang geprüft): 20/20 Checksummen OK, Guard und Canary syntaktisch valide, alle 18 tragenden Repositories existieren auf GitHub. Kein Code wurde ausgeführt.

---

## 2. Belastbarkeitsraster

| Marker | Bedeutung |
|---|---|
| `[DOKU]` | Offizielle Anthropic-Dokumentation |
| `[GEMESSEN]` | Eigene Messung auf der eigenen Maschine |
| `[PROJEKT]` | Angabe des jeweiligen Projekts, nicht unabhängig reproduziert |
| `[SEKUNDÄR]` | Community-Referenz, plausibel, nicht erstquellenbelegt |
| `[SCHLUSS]` | Ableitung, nicht belegt |

Diese Marker sind nicht Kosmetik. Die wichtigste Empfehlung dieses Dokuments (Stufe 0) hängt an einer `[SEKUNDÄR]`-Zahl und ist deshalb als *erste zu messende Größe* ausgewiesen, nicht als feststehender Befund.

---

## 3. Die zwei Gesetze

Alles Weitere folgt aus diesen beiden Sätzen. Sie stehen bewusst vor dem Katalog, weil sie mehr Kandidaten aussortieren als jede Bewertungstabelle.

### Gesetz I — Genau ein mutierender Eigentümer pro Fläche

Claude Code führt **alle passenden Hooks parallel** aus `[DOKU]`. Zwei registrierte `PreToolUse(Bash)`-Rewriter sehen denselben ursprünglichen Aufruf und liefern konkurrierende `updatedInput`-Objekte. Dasselbe gilt für zwei `PostToolUse(Bash)`-Replacer. Es gibt **keinen** verketteten Kompressionsstapel nach dem Muster „erst A, dann B".

Wenn mehrere interne Regeln sequenziell laufen müssen, wird **ein** Dispatcher registriert, der intern deterministisch sequenziert und genau ein Hook-Resultat erzeugt.

> **Konsequenz für bereits vorliegende Messungen:** Eine Messreihe, die auf einer Konfiguration mit mehreren gleichzeitig aktiven Bash-Mutatoren entstanden ist, misst eine Komposition, deren Zusammensetzung nicht garantiert ist. Der Mittelwert kann stimmen und die Streuung trotzdem teilweise struktureller Natur sein statt Rauschen.

### Gesetz II — Append-only schlägt Prefix-Rewrite

Aus der offiziellen Prompt-Caching-Dokumentation `[DOKU]`:

- **Invalidieren den Cache nie:** Skills, Commands, Agents, **Hooks**, LSP-Server, Monitors, Themes. Was sie beitragen, wird hinter dem bestehenden Gespräch angehängt — die nächste Anfrage bezahlt nur das Neue.
- **Invalidieren den Prefix:** MCP-Server, die sich mitten in der Session verbinden oder trennen (auch ohne Zutun: stdio-Prozess stirbt, HTTP-Session läuft ab, Server reconnected), Modellwechsel (der Cache ist modell-gekeyed), CLAUDE.md-Änderung, Hinzufügen/Entfernen einer Built-in-Deny-Regel.
- Bestätigt in Issue #27048: Plugin-Enable/Disable mitten in der Session schreibt gecachten User-Content vollständig neu — in einem Testlauf 98K nicht gelesen, 91K neu geschrieben `[DOKU]`.

Daraus folgt die Aufnahmeregel:

> **Ein Hook, Skill, Command oder CLI-Wrapper ist cache-neutral und darf in den Stack. Ein API-Proxy muss den Cache-Write-Aufschlag erst verdienen, bevor er netto überhaupt spart.** Ohne gepaarte End-to-End-Messung mit ausgewiesener Cache-Read-/Cache-Creation-Ratio ist eine Nettoersparnis eines Proxys eine Behauptung, keine Zahl.

Einzige begründete Ausnahme: ein Proxy, dessen Zweck die Cache-**Reparatur** ist (`cnighswonger/claude-code-cache-fix`) — und auch der erst nach Messbefund.

Im Katalog v3 sind deshalb 13 Einträge als `cache_risk: high` markiert, 34 als `none`. 191 stehen auf `not-assessed` — das heißt *nicht beurteilt*, nicht *sicher*.

---

## 4. Der Widerspruch, den beide Papiere auflösen mussten

Revision 2 liefert in ihrem Messkapitel die ehrlichsten Zahlen des gesamten Feldes `[PROJEKT]`:

- HarnessTrim: ~63 % Reduktion auf ausgewählten Tool-Fixtures — aber **~2 %** billed-token saving auf einem kleinen Task und 22–25 % auf einem großen, verrauschten.
- quiet-bash: sehr hohe Reduktion pro Operation — aber über 136 reale Sessions **median 0 %** collapsible share, pooled ~14 %, p90 ~31 %.

Dieselbe Aussage aus dem anderen Durchgang: die eigene Ladder-Messreihe ergab −27,2 % auf einer engen Klasse und **−0,3 %** gepaart in der Serie, in der Claude Code den einzig lohnenden Fall selbst ausgelagert hatte `[GEMESSEN]`. Und eine dritte, unabhängige Quelle beziffert die Bash-Ausgabefläche auf 15–25 % des Kontexts `[PROJEKT]`.

Drei unabhängige Wege, ein Befund:

> **Die Bash-Ausgabefläche ist auf typischen Workloads meist ein Nullsummenspiel und lohnt nur bei log-, test- und build-lastigen Sessions.**

Revision 2 schreibt das selbst — und legt dann ~90 KB Ingenieursarbeit (Guard, Canary, Installer, Profile, Benchmarkplan) auf genau diese Fläche. Das ist kein Fehler des Pakets, es ist der blinde Fleck des ganzen Feldes: von 251 katalogisierten Repositories arbeitet die große Mehrheit auf Tool-Ausgaben, und **ein einziges** (`alexgreensh/token-optimizer`) ernsthaft auf dem Prefix.

v3 löst das nicht, indem es die Bash-Arbeit verwirft — sie ist gut und bleibt —, sondern indem es die **Reihenfolge** umdreht.

---

## 5. Die neun Flächen, nach Hebel sortiert

| # | Fläche | Wie oft abgerechnet | Hebel | Eigentümer |
|---|---|---|---|---|
| **1** | **Prefix** (CLAUDE.md, Skill-Listing, Plugin-Metadaten, MCP-Schemata, Agent-Beschreibungen) | **jede Runde** | **hoch** | Projekt/Nutzer — kein Tool nötig |
| **2** | Tool-Definitionen | jede Runde | hoch | Tool Search (nativ), Code-Execution-Gateway |
| **3** | Sitzungswachstum (der Tail wächst linear → Kosten quadratisch) | jede Runde | hoch | TASK-STATE + `/clear`, Subagenten |
| **4** | Code-Retrieval (Lesen statt gezielt holen) | vervielfacht Fläche 5 | mittel-hoch | genau ein Codeindex |
| **5** | Bash-/Tool-Ausgaben | einmal geschrieben, danach im Tail | **workload-abhängig, oft null** | genau ein Bash-Owner |
| **6** | Modell-Ausgabe (Prosa, Scope Creep, Code-Umfang) | jede Runde im Tail | mittel | Implementation Ladder |
| **7** | Kompaktierungsverlust (neu erarbeiten, was verlorenging) | — | mittel | native Compaction + Checkpoints |
| **8** | Strukturdaten (JSON/YAML/CSV-Syntaxkosten) | punktuell | niedrig | Shape-Gate, TOON/PAKT |
| **9** | Modellwahl / Routing | jede Runde | hoch, aber qualitätskritisch | bewusste Entscheidung |

Fläche 5 steht in der Mitte, nicht oben. Das ist die einzige inhaltliche Umsortierung gegenüber Revision 2 — und die wichtigste.

---

## 6. Der Zielstack v3

### Stufe 0 — Prefix-Diät

**Pflicht. Kostet nichts. Braucht kein einziges Repository. Kommt vor allem anderen.**

| Maßnahme | Grundlage |
|---|---|
| Skill-Inventar auf das tatsächlich Genutzte kürzen | ~100 Token pro Skill im Listing `[SEKUNDÄR]` — bei einem großen Inventar der größte Einzelposten `[SCHLUSS]` |
| Plugins und Marketplaces auf das Genutzte kürzen | Plugin-Toggles mitten in der Session schreiben den Cache neu `[DOKU]` — also einmal aufräumen, dann in Ruhe lassen |
| Jede injizierte Guidance gegen ihre Nutzung prüfen | 3,5k Token SessionStart-Guidance führten zu 0 von 92 erwarteten Aufrufen `[GEMESSEN]` — ein Totalausfall, kein Grenzfall |
| MCP-Server projektweise statt global (`.mcp.json`) | Verbindungsabbruch invalidiert den Prefix `[DOKU]`; eine nicht registrierte MCP-Anbindung sparte gemessen 286 Token/Session `[GEMESSEN]` |
| `deny`-Regeln für ungenutzte Built-ins | Ein nackter Tool-Name als Deny-Regel entfernt die Definition vollständig aus dem Kontext `[DOKU]` |
| CLAUDE.md klein und **stabil** halten | Jede Änderung invalidiert alles danach `[DOKU]` — Volatiles gehört in Skills, nicht in den Prefix |

**Akzeptanzgate Stufe 0:** `/context` vor und nach der Kürzung, gleiche Aufgabe, gleicher Startzustand. Diese eine Messung entscheidet, ob der Rest des Stacks überhaupt lohnt.

### Stufe 1 — Native Deckel

Wirken sofort, sind cache-neutral, brauchen keinen Fremdcode. In `settings.json` unter `env`:

```jsonc
{
  "env": {
    "MAX_MCP_OUTPUT_TOKENS": "8000",         // Default 25000; MCP-Antworten sind die stillsten Fresser
    "BASH_MAX_OUTPUT_LENGTH": "24000",       // unterhalb der ~32KB-Auslagerungsgrenze [GEMESSEN]
    "TASK_MAX_OUTPUT_LENGTH": "12000",       // Deckel auf Subagent-Rückgaben
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "16000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "78"  // Default ~83 %, höhere Werte werden still gekappt
  }
}
```

Alle Werte sind Strings. `ENABLE_TOOL_SEARCH` bleibt aktiv (Tool Search greift automatisch, sobald MCP-Beschreibungen 10 % des Kontextbudgets übersteigen; ~500 Token Overhead statt voller Schemata, >85 % weniger Definitionslast `[PROJEKT/Anthropic]`).

`MAX_THINKING_TOKENS` bewusst nicht gesetzt: Fable 5 ignoriert sämtliche Thinking-Toggles `[SEKUNDÄR]`, und bei den übrigen Modellen ist das Qualitätsrisiko größer als der Gewinn.

> Der `BASH_MAX_OUTPUT_LENGTH`-Deckel erreicht auf dem direkten Weg, was eine Kompressionsleiter auf dem indirekten versucht. Genau dieser native Mechanismus hat in einer bestehenden Messreihe den einzig lohnenden Fall vorweggenommen `[GEMESSEN]`.

### Stufe 2 — Capability klären, bevor irgendetwas mutiert

Aus Revision 2 unverändert übernommen, mit einer Präzisierung:

`hookSpecificOutput.updatedToolOutput` existiert und wird laut Community-Referenz **seit 2.1.121 für alle Tools** honoriert, nicht mehr nur für MCP-Tools `[SEKUNDÄR]`. Die Beobachtungen, auf denen Revision 2 ihre Skepsis aufbaut (HarnessTrim, token-diet, semtrim-Migration), stammen aus der Zeit davor. Auf einer aktuellen Installation ist der Canary damit **billige Absicherung, kein Blocker**.

Wichtig bleibt die Fallenstellung in die andere Richtung: `hookActivation=auto` fällt ohne bestandenen Live-Probe still auf Shadow zurück. Wer den Probe nie fährt, betreibt einen Guard, der nichts tut, während der Status „aktiv" aussieht. **Also: Probe fahren und Ergebnis ablegen, oder den Modus explizit setzen.**

| Zustand | Automatischer Bash-Owner | Guard-Modus |
|---|---|---|
| PostTool besteht | Guard als alleiniger `PostToolUse(Bash)`-Replacer | replace |
| Nur PreTool besteht | genau **ein** Wrapper | shadow |
| Beide fallen | kein automatischer Pfad — expliziter Pipe/MCP-Reducer | shadow |
| Unbekannt | keine produktive Behauptung, erneut prüfen | shadow |

Wiederholung: nach jedem Claude-Update, bei Wechsel des Executables, spätestens alle 30 Tage.

### Stufe 3 — Genau ein Bash-Owner (erst wenn Stufe 0–2 stehen)

Auswahl nach Workload, nicht nach Kompressionsrate:

| Workload | Owner | Warum |
|---|---|---|
| Test-/Build-/Log-lastig, PostTool besteht | eigener Guard (v2-Fassung) | kein Command-Rewrite, native Permission-Prüfung bleibt auf dem Originalbefehl, exakte Pfade für Fehler/Patches/Security |
| Nur PreTool, konservativ | `jaredboynton/semtrim` | command-aware, deklarative Regeln, golden corpus, `never-grow`, Idempotenz |
| Filter sollen als Daten testbar sein | `edouard-claude/snip` | YAML-Filterdateien statt kompilierter Logik — einzeln messbar |
| Messbarkeit ist das Kriterium | `zdk/lowfat` | einziges Repo mit reproduzierbaren Werten pro Kommando und Stufe gegen mitgelieferte Samples |
| Wiederholung ist das Problem | `fajarhide/omni` | dedupliziert über die Session: bereits gezeigte Zeilen kommen als Handle zurück — das kann ein Filter prinzipiell nicht |
| Maximale Turnkey-Abdeckung | genau einer aus quiet-bash / nestor-lean / token-saver-plugin / squeez / sipcode | breite Ownership; Persona/Memory/Codemap abschalten |

**Nicht verhandelbar, aus Revision 2 übernommen:**
- Exakt bleiben: Fehler, nicht-leeres stderr, Patches, Migrationen, Security-Scans, IaC-Pläne, Krypto-Ausgabe, null-delimited Daten, `# token-raw`.
- Keine verlustbehaftete Ersetzung ohne lokal archivierte, exakt abrufbare Originalantwort.
- Net-Win-Gate: keine komprimierte Ausgabe emittieren, wenn die Ersparnis nach Footer-Overhead unter Byte- **und** Ratio-Schwelle liegt. (Belegter Fall, in dem dieses Gate fehlte: eine Datei wurde komprimiert auf 2.001 Token gegenüber 1.719 verbatim `[GEMESSEN]`.)
- PreTool-Wrapper verändern den ausgeführten Befehl. Statische `deny`/`ask`-Regeln für destruktive Operationen bleiben Pflicht, `pipefail` erhalten, gefährliche Befehle nie automatisch wrappen.

### Stufe 4 — Genau ein Codeindex

Diese Fläche ist bei einem Bash-zentrierten Stack typischerweise **unbesetzt** und liegt über Fläche 5 im Hebel: eine Strukturfrage, die 40k Token Datei-Lesen auslöst, ist teurer als jedes einzelne Bash-Dump.

| Fall | Index | Prefix-Kosten |
|---|---|---|
| klein bis mittel, Symbol-/Relationsfragen | `colbymchenry/codegraph` | gering (CLI) |
| deterministische, byte-stabile Signaturkarte ohne Registrierung | `manojmallick/sigmap` **als CLI** (`npx`) | **null** |
| großes polyglottes Monorepo, Architektur/Impact | `DeusData/codebase-memory-mcp` | ein MCP-Server |
| erzwungener Read-Redirect | `aovestdipaperino/tokensave` | Pilot |

Dasselbe Werkzeug kostet als CLI null Prefix und als MCP-Server Schemata in jeder Runde plus Cache-Risiko beim Reconnect. **Die Form ist wichtiger als die Kompressionsrate.**

Anti-Pattern, aus Revision 2: den Codegraph abfragen und danach trotzdem alle gefundenen Dateien vollständig lesen. Das vernichtet den Gewinn vollständig.

### Stufe 5 — Sitzungsgrenze

Der mathematisch größte Hebel nach Stufe 0 und der billigste überhaupt: jeder Token im Kontext wird jede Runde neu abgerechnet, also wächst die Input-Kosten einer ungemanagten Session mit dem **Quadrat** ihrer Länge. Ein Deckel auf den Prefix macht daraus lineares Wachstum.

Reihenfolge:

1. `.claude/TASK-STATE.md` — Ziel, bestätigte Fakten, Entscheidungen, Restarbeit, Verification Contract, **ein** konkreter nächster Schritt.
2. `/clear` oder native Kompaktierung. Native Kompaktierung ist dreistufig: Microcompact (löscht veraltete Tool-Ergebnisse ohne Modellaufruf), server-seitiges Context-Management ab ~180K Input mit Ziel ~40K, dann Voll-Compact per Modellaufruf `[SEKUNDÄR]`. Ein Aus-Schalter existiert nicht `[SEKUNDÄR]`.
3. Subagenten für Bulk-Reads — isoliertes Fenster, nur die Zusammenfassung kehrt in den Tail zurück.
4. Erst bei nachgewiesenem Restproblem: `aerovato/magic-compact` als manueller Pilot.
5. Erst danach, und nur allein: **ein** History-/Rolling-Proxy — mit ausgewiesener Cache-Read-/Creation-Messung, weil er unter Gesetz II fällt.

Nützliches Detail: das Skill-Listing wird nach einer Kompaktierung **nicht** neu injiziert, weil das ~4.000 Token reine Cache-Erzeugung kostet `[SEKUNDÄR]`. Ein großes Skill-Inventar kostet also vor allem am Sessionanfang — was Stufe 0 zusätzlich stützt.

### Stufe 6 — Verhalten

Implementation Ladder statt Code-Golf. Vor neuem Code oder einer Dependency, Halt bei der ersten Sprosse, die die Aufgabe sicher löst:

1. Muss das existieren? 2. Ist es im Repo schon da? 3. Standardbibliothek? 4. Native Plattform/Framework? 5. Bereits installierte Dependency? 6. Deklarativ oder einzeilig? 7. Kleinste korrekte Implementierung.

Nicht verhandelbar: Security, Datenintegrität, Accessibility, Kompatibilität, Migrationen, Tests, Verification Contract.

Referenz: `DietrichGebert/ponytail` — ~54 % weniger LOC im Mittel über 12 Feature-Tasks, n=4, gegen einen fairen agentischen Baseline, mit ausdrücklicher Korrektur der eigenen früheren 80–94 %-Zahl nach unten `[PROJEKT]`.

⚠️ Gegenbefund: Es gibt Belege, dass aggressive Kürze-Prompts Coding- und Reasoning-Benchmarks verschlechtern `[PROJEKT]`. Kürzerer Code ist nicht automatisch besserer Code. Auf dieser Stufe ist das Qualitätsgate wichtiger als das Tokengate.

### Stufe 7 — Messung

Drei Ersparnisbegriffe, die niemals vermischt werden (aus Revision 2, unverändert richtig):

| Begriff | Was |
|---|---|
| **Slice-Ersparnis** | Bytes/Token, die ein Filter lokal an einer Ausgabe entfernt |
| **Modellsichtbare Ersparnis** | Was tatsächlich weniger in den Request geht |
| **End-to-End-Ersparnis** | Abgerechnete Tokens über die ganze Aufgabe, inklusive Cache-Creation, Zusatzrunden, Retries und Recovery |

Nur die dritte entscheidet. Die erste ist die Zahl in fast allen READMEs.

Verfahren: gepaarte Läufe, gleiche Aufgabe, mindestens drei Wiederholungen je Arm, Streuung ausgewiesen, Qualitätsgate vor Tokengate. Zusätzlich Cache-Read- und Cache-Creation-Werte protokollieren — das ist das Erfolgskriterium für Stufe 0 und das Ausschlusskriterium für jeden Proxy.

Warum README-Prozente nicht addierbar sind: unterschiedliche Nenner (einzelne Fixture, nur gematchte Calls, Bytes statt Token, ein ausgewählter langer Task, Full-file-Baseline statt nativem Claude-Verhalten, Listenpreis statt Cache-Preis, Eingabe ohne Eigenoverhead).

---

## 7. Entscheidungsmatrix

| Workload | Stack |
|---|---|
| kleine bekannte Änderungen | Stufe 0–1 + TASK-STATE. Kein Kompressor. |
| lange Test-/Build-/Log-Loops | Stufe 0–3, Bash-Owner nach Capability |
| mittleres TS/Python-Repo | Stufe 0–1 + ein Codeindex + modularer Bash-Owner |
| großes polyglottes Monorepo | Stufe 0–1 + `codebase-memory-mcp` + modularer Bash-Owner |
| häufige Read/Edit/Read-Loops | `nestor-lean` oder `omni` (Dedup) als alleiniger Owner testen |
| große Web-/MCP-/API-Daten | `mksglu/context-mode` **nur** für externe Massendaten; native Bash/Read/Grep/Glob-Ownership ausgeschlossen |
| sehr lange Sessions | TASK-STATE → `/clear` → magic-compact → erst dann ein Proxy |
| viele MCP-Server | Tool Search aktiv lassen; bei sehr vielen Servern Code-Execution-Gateway prüfen |
| nachgewiesener Cache-Bug | `claude-code-cache-fix` isoliert, nur nach Messbefund |
| Multi-CLI-Policy | HarnessTrim-/Tokenjuice-Architektur als Referenz, pro Host genau ein Adapter |

---

## 8. Regelwerk

Acht Regeln, absteigend nach erwartetem Hebel. Alle als Hooks — nach Gesetz II cache-neutral, nach Gesetz I mit klarer Ownership.

### R1 — `prefix-budget.mjs` (SessionStart, read-only)
Misst beim Sessionstart Skills, Plugins, MCP-Server und die Größe der Instruktionsdateien und hängt **eine** Zeile an, wenn ein Budget überschritten wird. Kein Blockieren, keine Mutation. Das ist die Regel, die im gesamten Feld fehlt, und sie sitzt auf Fläche 1. *(Implementierung liegt bei: `prefix-budget.mjs`.)*

### R2 — `bash-output-owner.mjs` (Dispatcher, PostToolUse:Bash)
**Ein** registrierter Handler statt mehrerer. Intern sequenziert er die bestehenden Regeln (Toolnamen-Regel, Größenregel) und die Reducer-Module deterministisch und gibt genau ein Hook-Resultat zurück. Damit ist Gesetz I erfüllt, ohne bestehende Logik wegzuwerfen.

Migrationshinweis: Fremdpakete installieren ihren Guard gern unter dem Dateinamen `bash-dump-guard.mjs`. Liegt dort bereits ein eigener produktiver Guard, wird er überschrieben (Backup wird angelegt, aber `settings.json` zeigt danach auf fremden Code, der per Default in Shadow läuft). **Fremde Reducer unter eigenem Namen installieren und im Dispatcher aufrufen.**

### R3 — `read-slice-guard.mjs` (PreToolUse:Read)
Blockt Whole-File-Reads über N Zeilen und verlangt `offset`/`limit` oder eine Indexabfrage. Die Read-Seite ist in Bash-zentrierten Stacks typischerweise unbesetzt, obwohl dort mehr liegt.

### R4 — `reread-guard.mjs` (PreToolUse:Read)
Zweitlesung derselben Datei ohne zwischenzeitliche Änderung (mtime + Hash) → Verweis auf den vorhandenen Stash statt Neulesung. Wo bereits eine Blob-Ablage und ein Abrufkommando existieren, ist die halbe Infrastruktur vorhanden. Das gibt einer bestehenden Eskalationsleiter den Anwendungsfall, für den sie taugt — **nachweisliche Wiederholung** statt Strukturfragen an frischem Quelltext.

### R5 — `session-economy.mjs` (PostToolUse, ratenlimitiert)
Ab X % Kontextfüllstand **einmal** pro Session: TASK-STATE schreiben und einen Schnittvorschlag anhängen. Nicht blockieren — der Checkpoint ist der Teil, der zählt: ohne ihn ist `/clear` teuer, mit ihm billig.

### R6 — Owner-Registry (`context-surface-owners.yaml`)
Jede mutierende Fläche bekommt genau einen eingetragenen Eigentümer plus Datum des letzten Live-Tests und Fingerprint des Executables. Ohne diese Tabelle ist Gesetz I nicht überprüfbar, sondern nur gut gemeint.

### R7 — MCP-Quarantäne (Konvention)
MCP-Server nur in `.mcp.json` des Projekts, nie global. Begründung ist hart: Verbindungsabbruch invalidiert den Prefix, und stdio-Server sterben ohne Zutun `[DOKU]`.

### R8 — Beobachter-Regel
Observability-Hooks dürfen parallel laufen, **sofern sie nichts mutieren und keinen Kontext injizieren**. Ein ratenlimitierter Hinweis-Hook ist streng genommen eine Kontextinjektion — er ist zulässig, gehört aber ins Budget von R1 und in die Registry, nicht in die Kategorie „kostenlos".

---

## 9. Migration eines gewachsenen Stacks

Konkrete Kollisionen, die bei einem typischen gewachsenen Setup auftreten (Hook-Sammlung + Kompressor + Kontext-MCP + Memory + Nudge-Engine):

| Symptom | Regel | Auflösung |
|---|---|---|
| Kompressor-Hooks **und** eigener Bash-Guard **und** Feedback-Hook auf `PostToolUse(Bash)` | Gesetz I | Auf einen Dispatcher (R2) zusammenführen; genau einen Owner eintragen |
| Kontext-MCP beansprucht native Bash/Read/Grep/Glob, der Kompressor ebenfalls | Gesetz I | Kontext-MCP auf externe Massendaten beschränken, native Flächen dort abschalten |
| Deaktiviertes Plugin, dessen Shell-Hooks noch registriert sind | R6 | Registry-Abgleich: Hooks entfernen, nicht nur das Plugin auf `false` setzen |
| Fremdguard überschreibt den eigenen Guard-Dateinamen | R2 | Unter eigenem Namen installieren |
| Generierte Instruktionsdateien, deren Wirkung nie gemessen wurde | Stufe 0 | Gegen tatsächliche Nutzung prüfen und auf das Belegte kürzen |
| Eskalationsleiter ohne belegten Anwendungsfall | R4 | Geltungsbereich einfrieren, auf Wiederholungsfälle umwidmen, toten Code entfernen |

**Reihenfolge der Migration** — jede Phase mit Messung abschließen, bevor die nächste beginnt:

| Phase | Inhalt | Aufwand | Gate |
|---|---|---|---|
| 0 | Inventur: alle Hooks, Plugins, Skills, MCP-Server, Env-Flags erfassen; Registry befüllen; doppelte Mutatoren entfernen | 1–2 h | Registry vollständig |
| 1 | Prefix-Diät (Stufe 0) | 1–2 h | `/context` vorher/nachher |
| 2 | Native Deckel (Stufe 1) | 15 min | keine Regression |
| 3 | Capability-Canary, Guard in Shadow, zwei Wochen Metriken — **keine neuen Tools** | 2 Wochen | Capability-Record vorhanden |
| 4 | Genau ein Bash-Owner, A/B gegen native Baseline | 1 Tag | End-to-End-Gewinn + Qualitätsgate |
| 5 | Genau ein Codeindex, gepaart benchmarken | 1 Tag | End-to-End-Gewinn |
| 6 | Sitzungsgrenze standardisieren (TASK-STATE + `/clear`, R5) | halber Tag | Kosten wachsen linear, nicht quadratisch |
| 7 | Governance: Canary nach jedem Update, quartalsweise Katalog-/Lizenz-/Benchmarkpflege | laufend | negative Nettoersparnis ⇒ Profil automatisch aus |

Phase 1 und 2 zusammen kosten unter drei Stunden, installieren nichts und adressieren die Fläche, auf der praktisch die gesamte Repo-Landschaft nicht arbeitet.

---

## 10. Was nicht Standard wird

- Mehrere Bash-Rewriter, mehrere Output-Replacer, mehrere Codeindizes oder mehrere History-Proxys gleichzeitig.
- Ein Proxy ohne ausgewiesene Cache-Read-/Creation-Messung.
- Verlustbehaftete Ersetzung ohne abrufbares Original.
- Neuronale oder LLM-basierte Kompression auf Fehlern, Patches oder Security-Ausgaben.
- TOON/PAKT ohne Shape-Gate (tief verschachtelte oder heterogene Strukturen werden größer).
- Auto-allow durch einen Wrapper ohne statische destruktive Deny-/Ask-Regeln.
- Auto-Update für Komponenten, die Sessiondateien oder API-Traffic verändern.
- Addition von Savings-Prozenten aus verschiedenen README-Benchmarks.
- Ein Vollstack-Monolith (`lean-ctx`, `entroly`, `openwolf`) **neben** einem bestehenden Stack — das ist ein Plattformwechsel, kein Baustein.
- Bild-Rendering des Kontexts als Standard: technisch die interessanteste Idee im Feld, aber ein prefix-rewritender Proxy mit Qualitätsrisiko auf Quelltext, und die Kostenrechnung hängt an Listenpreisen, die auf einem Abo nicht gelten.
- Lizenz-Fences beachten: Preview-Agreement, proprietär, Elastic-2.0 und PolyForm-Noncommercial-Komponenten gehören nicht unbemerkt in einen kommerziell oder dienstlich genutzten Core.

---

## 11. Was gegenüber den Vorgängerfassungen korrigiert wurde

**Gegenüber Revision 2:**
- Reihenfolge umgedreht: Prefix vor Bash-Ausgabe. Begründet mit den eigenen Zahlen von Revision 2 (§13).
- Cache-Invalidierung als Aufnahmekriterium ergänzt, nicht nur als Messgröße. 61 Katalogeinträge entsprechend markiert.
- Die Capability-Skepsis präzisiert: `updatedToolOutput` gilt seit 2.1.121 für alle Tools `[SEKUNDÄR]`; der Canary bleibt sinnvoll, ist auf aktuellen Installationen aber Absicherung statt Gate. Neue Warnung vor dem stillen Shadow-Fallback.
- Installationsrisiko benannt: gleicher Dateiname wie ein bestehender produktiver Guard.
- Katalog um 25 Einträge ergänzt, darunter zwei der meistgesternten Repositories des Feldes, die in Revision 2 fehlten.

**Gegenüber Durchgang 1:**
- Gesetz I (parallele Hooks, ein Eigentümer pro Fläche) vollständig neu — mit Rückwirkung auf die Belastbarkeit bereits vorhandener eigener Messreihen.
- Recovery-Pflicht, Permission-Semantik von PreTool-Wrappern und Lizenz-Fences ergänzt.
- Dreiteilung der Ersparnisbegriffe übernommen.
- Guard-Empfehlungen ersetzt durch Owner-/Dispatcher-Architektur.

---

## 12. Offene Punkte

- **Die ~100-Token-pro-Skill-Angabe ist `[SEKUNDÄR]`** und trägt die wichtigste Empfehlung dieses Dokuments. Sie gehört als Erstes gemessen: `/context` vor und nach dem Deaktivieren von 20 Skills.
- 191 von 251 Katalogeinträgen sind bezüglich Cache-Risiko `not-assessed`; 75 sind `discovery-only` (Fundnachweis, kein Urteil).
- Nicht geprüft: Verträglichkeit von `alexgreensh/token-optimizer` mit einer bestehenden Memory-Lösung und eigenen Hooks; ob `snip`, `lowfat` und `omni` sich gegenseitig oder mit einem CLI-Proxy stören; ob `sigmap` auf den konkreten Repos brauchbare Karten liefert.
- Nicht ausgeführt: Guard, Canary und Installer des v2-Pakets wurden nur statisch geprüft (Checksummen, Syntax), nicht laufen gelassen.
- README-Angaben tragen keine Produktionsreife-Aussage. Für jeden Kandidaten, der in den produktiven Stack soll, gilt: Quellcode, Tests, Issues, Lizenz und Releases prüfen — Sterne messen Aufmerksamkeit, nicht Korrektheit.
- Vollständigkeit ist nicht beweisbar: private, gelöschte, umbenannte oder frisch erstellte Repositories fehlen zwangsläufig, und ein öffentliches Repository kann sich nach dieser Momentaufnahme ändern.
