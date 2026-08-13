---
id: CTS-DOC-ARCH-001
schema: claudestack.document/v1
document_type: architecture
title: Architektur
version: 1
status: release_candidate
language: de
last_reviewed: 2026-08-13
applies_to: claude-code-token-stack/v1
---

# Architektur

## CTS-ARCH-001 — Ziel

Stack begrenzt vermeidbaren Kontext, ohne Korrektheit, Recovery oder Claude
Codes native Mechanismen zu verdrängen. Folgendes Diagramm zeigt den Zielpfad
nach expliziter Installation und Promotion; im ausgelieferten Paket ist kein
Paket-Hook aktiv:

```mermaid
flowchart LR
    C["Claude Code"] -->|"PreToolUse: Read"| D["lokaler Dispatcher"]
    C -->|"PostToolUse: Bash oder Read"| D
    C -->|"PreCompact / SessionEnd"| D
    D --> R["Read-Guard"]
    D --> B["Bash-Output-Guard"]
    B -->|"enforce + Net-Win"| A["privates Raw-Artefakt"]
    D -->|"Hook-Protokoll oder leere stdout"| C
    O["/context, /usage, ccusage"] -. "read-only" .-> C
    T["TASK-STATE optional"] -->|"Checkpoint"| C
```

## CTS-ARCH-002 — Native-first

Reihenfolge pro Informationsbedarf:

1. bestätigte Fakten im aktuellen Kontext wiederverwenden;
2. native Suche nach bekanntem Namen/Text;
3. exakten Symbol- oder Zeilenbereich lesen;
4. nur für Relationsfragen genau einen Graph-/Index-Owner wählen;
5. externe Massendaten isoliert ableiten;
6. Findings persistieren und Exploration beenden.

Native Ausgabegrenzen und Spill-Pointer bleiben unangetastet. Guard erkennt
bekannte Truncation-/Spillmarker und komprimiert sie nicht erneut.

## CTS-ARCH-003 — Surface Ownership

„Owner“ meint Komponente, die eine Oberfläche mutieren darf. Observer zählen
nicht, solange sie keinen Kontext injizieren oder Payload verändern.

| Surface-ID | Oberfläche | Ziel-Owner nach Promotion | Kardinalität |
|---|---|---|---|
| `CTS-SURF-PREFIX` | Request-Prefix | Root-`CLAUDE.md` + path-scoped Rules | genau eine Quelle je Regelbereich |
| `CTS-SURF-BASH-GATE` | `PreToolUse:Bash` deny-only | bestehender Root-Guard nach Policy-Prüfung | mehrere Gates technisch möglich; explizit inventarisieren |
| `CTS-SURF-BASH-IN` | `PreToolUse:Bash` | Default: keiner | höchstens einer, falls aktiviert |
| `CTS-SURF-BASH-OUT` | `PostToolUse:Bash` | `hooks/claudestack.mjs` | genau einer |
| `CTS-SURF-READ` | `Pre/PostToolUse:Read` | `hooks/claudestack.mjs` | genau einer |
| `CTS-SURF-RETRIEVAL` | Code-Retrieval | native Suche oder ein gewählter Index | exklusiv je Aufgabe |
| `CTS-SURF-STATE` | Task-Checkpoint | `TASK-STATE.md`, falls genutzt | eine Datei |
| `CTS-SURF-OBSERVE` | Usage-Messung | native Usage + optional ccusage | read-only, mehrere zulässig |

Kein `PreToolUse:Bash`-Input-Rewriter im Dispatcher-Default. Dadurch gibt es
keinen Command-Rewrite. Ein bestehender deny-only Security-Gate ist eine
getrennte Rolle; er bleibt nur nach bewusster Policy-Prüfung registriert.
Wird später ein Bash-Input-Rewriter pilotiert, ersetzt er jede Alternative auf
dieser Surface; er wird nicht als Pipeline gestapelt.

## CTS-ARCH-004 — Dispatcher

`hooks/claudestack.mjs` kapselt Claude-Hooktransport und ruft Pure-Core-Logik
auf. Ein Fragment registriert denselben absoluten Node-Aufruf für:

- `PreToolUse` mit Matcher `Read`;
- `PostToolUse` mit Matcher `Bash|Read`;
- `PreCompact`;
- `SessionEnd`.

Parser-, I/O-, State- und unerwartete Hookfehler sind fail-open: keine Mutation,
leere stdout. Dispatcher entscheidet nie pauschal `allow`. Read-Guard darf in
`enforce` einmalig `deny` melden; identische Wiederholung ist Escape-Valve.

## CTS-ARCH-005 — Bash-Datenfluss

1. Nur `PostToolUse:Bash` besitzt tatsächliche Ausgabe.
2. Response-Objektform und unveränderte Felder bleiben erhalten.
3. Nur in `enforce` werden Secrets vor weiterer Verarbeitung redigiert.
4. Fehler, `stderr`, Unterbrechungen, Images, exakte Kommandoklassen und native
   Spillmarker werden nicht verlustbehaftet reduziert.
5. Kleine Ausgaben passieren unverändert.
6. `shadow` mutiert nicht und erzeugt kein Raw-Artefakt.
7. `enforce` reduziert deterministisch. Nur positiver Net-Win nach Footer erlaubt
   Ersetzung.
8. Vor Ausgabe der Ersetzung wird ein privates, größenbegrenztes Artefakt atomar
   geschrieben; Footer enthält ID, Hash-Präfix, Bytezahl und Recovery-Befehl.

„Raw-Artefakt“ bezeichnet hier die vollständige Tool-Response nach Redaction.
Recovery ist gegenüber dieser redigierten Response exakt; entfernte Secretbytes
werden absichtlich nicht gespeichert und sind nicht wiederherstellbar.

Eine lokale Byte-Reduktion ist keine Aussage über Provider-Tokens oder Kosten.

## CTS-ARCH-006 — Read-Datenfluss

Read-Schutz ist nur in `enforce` mutierend:

- große Ganzdatei: einmaliger Hinweis auf `offset`/`limit`;
- unveränderter identischer Read: einmaliger Wiederverwendungs-Hinweis;
- zweiter identischer Versuch innerhalb des Fensters: erlaubt;
- Dateiidentität: Größe, mtime und für begrenzte Dateien SHA-256;
- `PreCompact`/`SessionEnd`: Session-Read-State wird in `enforce` entfernt.

`shadow` und `off` sind vollständige Hook-No-ops: keine Mutation, Redaction,
Artefakte oder Statepflege. Bereits vorhandener Enforce-State bleibt liegen.
Shadow-Messung erfolgt extern.

**Der Auslieferungsmodus ist `off`, an allen vier Stellen gleich.** `DEFAULT_CONFIG`
in `src/stack.mjs`, das `default`-Feld im Schema, die ausgelieferte
`config/token-stack.default.json` und die Flächenregistrierung in
`config/context-surface-owners.json` (`"mode": "off"`, `"deployment": "not_installed"`)
sagen dasselbe: das Paket tut im Auslieferungszustand nichts, auch nicht beobachten.
Die Abfolge ist `off` → nach Rauchtest `shadow` → nach Net-Win-Gate `enforce` (AP-6.1).

Die Gleichheit ist kein Zufall, sondern erzwungen: `tests/cli.test.mjs` vergleicht die
ausgelieferte Konfiguration gegen den Import, nicht gegen ein gepflegtes Literal. Eine
Abweichung zwischen Code-Fallback und Auslieferung — etwa `shadow` im Code und `off` in
der Datei — bricht den Test sofort. Das ist beabsichtigt: zwei Defaults, die sich
auseinanderentwickeln, sind genau die Klasse Widerspruch, die die Abnahme als M-3
gefunden hat.

## CTS-ARCH-007 — Konfiguration und State

Config-Auflösung, **erster Treffer gewinnt**:

| # | Pfad | Zweck |
|---|---|---|
| 1 | `$CLAUDE_TOKEN_STACK_CONFIG` | ausdrücklicher Übersteuerer, etwa für Messläufe |
| 2 | `<cwd>/.claude/token-stack.json` | projektlokal |
| 3 | `<configDir>/token-stack/token-stack.json` | **gebündelter Betriebsort** — der Normalfall |
| 4 | `<configDir>/token-stack.json` | *veraltet*: Träger-Konvention, nur noch Fallback |

`<configDir>` ist `$CLAUDE_CONFIG_DIR`, ersatzweise `~/.claude`. Die Liste wird
intern umgedreht und aufsteigend gemerged, sodass ein späterer Fund einen
früheren nur ergänzt, nie überschreibt.

Pfad 3 kam mit der Betriebsentscheidung hinzu, alles Token-Stack-Eigene unter
`~/.claude/token-stack/` zu bündeln (Defekt D21). Pfad 4 bleibt bestehen, damit
bestehende Installationen nach der Träger-Konvention weiterlaufen — neue
Installationen sollen ihn nicht mehr verwenden.

State liegt im selben gebündelten Verzeichnis unter
`<configDir>/token-stack/state/`.

| State | Lebensdauer | Löschung |
|---|---|---|
| Session-Read-State | Enforce-Session | `PreCompact`, `SessionEnd` in Enforce; manuell bei Störung |
| Raw-Artefakt | konfigurierte Retention | `prune` |
| `TASK-STATE.md` | Aufgabe | manuell nach Abschluss archivieren/löschen |

## CTS-ARCH-008 — Erweiterungspunkte

Neue Reducer werden nicht in Dispatcher „hineingestapelt“. Zuerst Surface und
Owner benennen, Konflikte mit `doctor` prüfen, isolierten Benchmarkarm bauen und
Rollback definieren. Retrieval-, Memory- und Proxy-Produkte bleiben austauschbare
Profile. Squeez/RTK liefern Referenzmuster; ihre Hook-Ketten sind kein Default.

## CTS-ARCH-009 — `hooks/optional/`: im Paket, nicht im Fragment

Acht Hooks und eine gemeinsame Bibliothek liegen unter `hooks/optional/`. Sie
sind **vollständig, lauffähig und nicht registriert**. Das Fragment, das
`bin/claudestack.mjs fragment` erzeugt, enthält genau einen Eintrag: den
Dispatcher-Shim.

| Datei | Fläche | Art |
|---|---|---|
| `claude-hook-capability-canary.mjs` | Fähigkeitsprobe | **kein Hook** — manuell oder über die CLI aufgerufen |
| `prefix-budget.mjs` | Prefix | Observer mit Report |
| `read-context-guard.mjs` | Read | Guard (lädt die beiden Regelmodule) |
| `read-slice-guard.mjs` | Read | Regelmodul |
| `reread-guard.mjs` | Read | Regelmodul |
| `session-economy.mjs` | Session/Compaction | Observer, advisory |
| `bash-size-feedback.mjs` | Bash-Output | Observer, advisory |
| `ctx-used-marker.mjs` | Beobachtung | Observer |
| `lib/token-stack-shared.mjs` | — | gemeinsame Bibliothek |

### Warum nicht registriert

Ein Paket, das im Auslieferungszustand mehrere Hooks registriert, ist im
Auslieferungszustand **nicht mehr messbar**. Jede spätere Zahl vermischt dann
die Effekte, und keiner davon lässt sich einer Ursache zuordnen. Genau das war
der Konstruktionsfehler des `install.sh` aus dem Quellpaket: es merged die
`settings.json` ohne Baseline.

Die Aktivierung erfolgt deshalb **einzeln**, je Hook, nach eigener
Baseline-Messung — ADR-016. Ein Hook ohne dokumentierte Einzelmessung gilt als
nicht aktivierbar, nicht als „noch nicht aktiviert".

### Observer sind nicht gratis

Auch ein Hook ohne Mutationsrecht kostet: Prozessstart bei jedem passenden
Ereignis, und er kann Kontext injizieren. Für Observer gilt deshalb dasselbe
Gate. Zwei konkrete Grenzen:

- **Nudges teilen sich ein Budget.** Die Quellpakete führten drei unabhängige
  Zähler (`session-economy` über eine JSON-Zustandsdatei, `bash-size-feedback`
  und `ladder-ledger` je über eigene Zähler in `/tmp`). Drei Observer mit je
  eigenem Kontingent ergeben in Summe ein Vielfaches dessen, was jeder einzelne
  für vertretbar hielt. Im Zielpaket teilen sie sich einen Helfer und eine
  Budgetdatei.
- **Injektion ist Mutation.** Ein Observer, der `additionalContext` schreibt,
  ist kein Observer mehr. Die Trennlinie verläuft nicht am Hook-Typ, sondern
  an der Frage, ob der Kontext danach ein anderer ist.

### Der Canary ist eine Sonderform

`claude-hook-capability-canary.mjs` probt, ob die laufende Claude-Code-Installation
die benötigten Hook-Fähigkeiten überhaupt besitzt — insbesondere, ob
`updatedToolOutput` auf `PostToolUse` wirkt. Er trägt deshalb **alle**
Mutationsschlüssel im Quelltext, ohne ein Mutator zu sein: er testet sie.

Er wird nie registriert, sondern manuell oder über die CLI aufgerufen und
schreibt eine Fähigkeitsdatei mit Ablaufdatum. Fehlt sie oder ist sie älter als
30 Tage, stuft sich der Dispatcher intern auf `shadow` herunter und meldet den
Grund auf stderr — `shadow` ist telemetriefrei, die Herabstufung muss also
außerhalb sichtbar werden.
