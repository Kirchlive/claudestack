---
id: CTS-DOC-ADR-001
schema: claudestack.document/v1
document_type: decision_log
title: Architekturentscheidungen
version: 2
status: accepted
language: de
last_reviewed: 2026-08-13
applies_to: claude-code-token-stack/v2
---

# Architekturentscheidungen

Statuswerte: `accepted`, `superseded`, `experimental`. IDs bleiben auch bei
späterer Ablösung stabil.

## CTS-ADR-001 — Native-first

- Status: `accepted`
- Entscheidung: Native Suche, Read-Slices, Tool Search, Spill, `/context`,
  `/usage`, `/compact` und `/clear` kommen vor zusätzlicher Middleware.
- Grund: weniger neue Fehlerflächen, Startup-Prefix und dauerhafter State.
- Folge: Dritttools brauchen ein gemessenes Problem und eigenes Rollback-Gate.

## CTS-ADR-002 — Maximal ein mutierender Owner je Surface

- Status: `accepted`
- Entscheidung: Pro Hook-/Retrieval-/Memory-/Proxy-Surface höchstens ein Mutator.
  Das Paket installiert keinen aktiven Owner. Nach bestandener Promotion ist
  der lokale Dispatcher der einzige Owner für Bash-Ausgabe und Read-Advisory.
- Grund: Claude-Hookresultate bilden keine garantierte Kompressionspipeline;
  Reihenfolge, Permission und Recovery würden mehrdeutig.
- Folge: Alternative ersetzt Owner vollständig. Sie ergänzt ihn nicht.

## CTS-ADR-003 — Kein Bash-Input-Mutator im Default

- Status: `accepted`
- Entscheidung: Das Dispatcher-Fragment registriert keinen
  `PreToolUse:Bash`-Input-Mutator. Die Owner-Grenze gilt dort als „höchstens
  einer, falls aktiviert“. Der bestehende `root-pretool-deny-gate`
  (im Quellrepository `hooks/bash-dump-guard.mjs`, nicht Teil dieses Pakets) ist
  getrennt zu behandeln: Er ist ein deny-only
  Security-Gate, kein Input-Rewriter, und kann nach expliziter
  Projekt-Policy-Prüfung bestehen bleiben.
- Grund: kein sicher belegter Default-Nutzen; weniger Command-/Permission-Risiko
  und kein Hook-Spawn für jeden Bash-Aufruf.
- Re-Entry: eigener Canary zeigt Qualitätsgleichheit und bessere Kosten pro
  akzeptierter Aufgabe; dann genau einen Input-Owner pilotieren.

## CTS-ADR-004 — Ein lokaler Bash-Output-Owner

- Status: `accepted`
- Entscheidung: `hooks/claudestack.mjs` ist der einzige Kandidat für
  `PostToolUse:Bash`. Er besitzt die Surface erst nach expliziter Installation
  und bestandener Shadow-/Canary-Promotion allein.
- Grund: Output existiert erst nach Toolausführung; zentraler Dispatcher kann
  Exaktklassen, Redaction, Net-Win und Recovery einheitlich erzwingen.
- Folge: Squeez, OMNI, RTK-Outputfilter und andere Replacer dürfen nicht parallel
  registriert sein.
- Identität: `gpt55-posttool-output-reducer-v3` ist ein separates vorhandenes
  Referenzartefakt. `k3-reported-output-reducer-v3.1` ist nur berichtet und
  nicht geliefert. Beide sind vom Root-PreTool-Gate zu unterscheiden.

## CTS-ADR-005 — Shadow, Canary, Enforce, Rollback

- Status: `accepted`
- Entscheidung: `shadow` ist Default. Canary nutzt `enforce` nur auf begrenzter
  Population. Danach breiteres `enforce`; Rückbau setzt `shadow` oder `off`.
- Semantik: `shadow` ist vollständiger Hook-No-op. Externe Observer messen
  Aufruf-Overhead und Tasks; Hook erzeugt keine Shadow-Telemetrie.
- Grund: Drei Runtime-Modi reichen. Canary ist Deployment-Scope, kein Verhalten.
- Gate: null versteckte Fehler, vollständige Recovery und keine Qualitätsregression.

## CTS-ADR-006 — Recovery vor größenbedingter Elision

- Status: `accepted`
- Entscheidung: Kein Raw-Artefakt, keine größenbedingte Elision. Artefakte
  enthalten die vollständige Response nach Redaction, sind privat, atomar,
  größen- und zeitbegrenzt; Pointer und Hash stehen im Footer.
- Grund: Logs können später für Diagnose, Audit oder Review exakt nötig sein.
- Folge: überschreitet Artefakt Maximalgröße oder schlägt Schreiben fehl, wird
  nicht elidiert. Secret-Redaction kann in Enforce trotzdem wirken.

## CTS-ADR-007 — Retrieval exklusiv je Aufgabe

- Status: `accepted`
- Entscheidung: Native Suche ist Default. Für echte Call-/Impact-/Architekturfragen
  darf genau ein Graph-/Index-Owner die Aufgabe übernehmen.
- Grund: parallele Indizes duplizieren Discovery, Toolschemas und residenten Kontext.
- Folge: Auswahl und Begründung im Task-State/Benchmark notieren; anderer Index ruht.

## CTS-ADR-008 — ccusage ist Observer

- Status: `accepted`
- Entscheidung: `ccusage` darf Usage-Daten lesen/aggregieren, aber keine Hooks
  mutieren und keinen Kontext injizieren.
- Grund: Messung ist Voraussetzung, erzeugt allein jedoch keine Ersparnis.
- Folge: ccusage-Werte nie als kausalen Reducer-Effekt ausgeben; A/B-Nenner bleibt
  Kosten pro akzeptierter Aufgabe.

## CTS-ADR-009 — TASK-STATE ist optional

- Status: `accepted`
- Entscheidung: Kleine Aufgaben brauchen keine State-Datei. Für `/clear`, Crash,
  Handoff oder lange Migrationen dient eine kurze `TASK-STATE.md` als Checkpoint.
- Grund: durable Fakten helfen nur, wenn ihr Pflegeaufwand kleiner als
  Wiederentdeckung ist.
- Folge: keine Secrets/Rohlogs; ein nächster Schritt; nach Abschluss entfernen.

## CTS-ADR-010 — Squeez-RTK-Ladder nur Referenz

- Status: `accepted`
- Entscheidung: Ladder-Muster für progressive Aktivierung, Messfehler und Recovery
  übernehmen; konkrete Hook-Kette, Binaries und Schwellen nicht kopieren.
- Grund: validierter Snapshot war wertvolle Forschungsreferenz, aber kein
  reproduzierbares Produktionspaket und enthielt konkurrierende Bash-Rewriter.
- Re-Entry: versionierte Abhängigkeiten, Single-Owner-Konfiguration, portable
  Pfade, bestandene Payload-Smokes und eigener A/B-Canary.

## CTS-ADR-011 — Keine Einsparungsclaims ohne lokale Evidenz

- Status: `accepted`
- Entscheidung: README und Betriebsdoku nennen keine feste Einsparung. Fremde
  Benchmarks werden nur als Quellenbefund mit Nenner und Einschränkung behandelt.
- Grund: Bytes, sichtbare Tokens, Cache-Tokens, Kosten, Zeit und Qualität sind
  unterschiedliche Größen.
- Folge: Veröffentlichung nur mit Rohdaten, Taskset, Konfiguration und
  Qualitätsbewertung des eigenen Laufs.

## CTS-ADR-012 — Kein automatischer Installer

- Status: `accepted`
- Entscheidung: `fragment` erzeugt JSON; Mensch prüft und übernimmt es manuell
  und atomar. CLI verändert Claude-Settings nicht.
- Grund: Settings enthalten fremde Hooks und lokale Pfade; automatisches Mergen
  könnte Daten verlieren oder mehrere Owner erzeugen.
- Folge: Migration verlangt Backup, `doctor`, Review, atomare Ersetzung und
  erneutes `doctor`.

## CTS-ADR-013 — Lieferfähigkeit und Runtime-Korrektheit nicht mitteln

- Status: `accepted`
- Entscheidung: Repo-Aktivität, Wartung, Lizenz und Lieferfähigkeit sind
  Aufnahmebedingungen, aber kein Beleg für Hook-, Permission-, Recovery- oder
  Runtime-Korrektheit. Meta-A4 bleibt deskriptiv.
- Grund: Die 15-Repo-Kreuzdarstellung zeigt genau die Divergenz, die ein
  Mittelwert verdeckt: Vier Kandidaten liegen bei OPUS bei `>=75`, während GPT
  sie wegen Runtime-Befunden auf `replace` oder `reject` setzt.
- Folge: Security-/Recovery-/Permission-Veto schlägt Aktivität, Sterne, Lizenz
  und Korpuskonvergenz. Ein Konflikt öffnet höchstens ein Fix-plus-isoliertes-
  A/B-Gate; er ändert nicht die kanonische Entscheidung.
- Grenze: PR-Rückstau oder andere GitHub-Metadaten dürfen fehlende
  Korrektheitsmessung weder imputieren noch als Korrektheitsproxy ersetzen.

## CTS-ADR-014 — Risikodissens erhalten

- Status: `accepted`
- Entscheidung: Lokale Runtimepolitik darf konservativer als OPUS-/K3-
  Piloturteile sein, ohne diese als Rechenfehler zu verwerfen. Abweichende
  Urteile bleiben im Reconciliation-Artefakt maschinenlesbar erhalten.
- Toonify: lokal Default-`reject`; OPUS nennt es „freigabefähiger Kern“, hier
  als Pilotkandidat normalisiert, K3 konditionaler Pilot. Re-Entry erst nach
  Code-, Issue-, Rohwert- und lokalem E2E-Audit, dann exakt `v0.8.2`.
  Release-Bestätigung ist nur Versionsnachweis.
- Proxy: lokal `llmtrim` und `tokdiet` reject. OPUS hält `llmtrim` nach
  Cachemessung konditional und suspendiert `tokdiet`; K3 hält `llmtrim` als
  Hauptoption und `tokdiet` als auditpflichtigen Fallback.
- Grund: CA-/Proxy-, Cache-, Security- und Fehlerattributionsrisiken sind
  Policyfragen. Gemeinsame Scores lösen sie nicht auf.

## CTS-ADR-015 — Zusammenführung nach Träger, nicht nach Merge

- Status: `accepted`
- Entscheidung: Von drei Quellpaketen wird eines zum Träger bestimmt; aus den
  übrigen werden definierte Teile aufgepfropft. Es gibt keinen Merge auf
  Mutator-Flächen. Träger ist `gpt56sol_claude-code-token-stack`, weil es als
  einziges Schema, Testsuite, Prüfsummen und genau einen architektonisch
  erzwungenen Mutator mitbringt — und weil es im Auslieferungszustand nichts
  installiert.
- Grund: **Drei Owner auf einer Fläche zu vereinigen erzeugt drei Owner auf einer
  Fläche.** Die Kollisionsinventur hat drei konkurrierende Bash-Output-Mutatoren
  bestätigt (`src/stack.mjs` 17K, `bash-dump-guard.mjs` 49K,
  `bash-owner-dispatch.mjs` 14K). Ein Merge hätte ADR-002 an genau der Stelle
  verletzt, an der er am teuersten ist.
- Folge: Jede übernommene Datei trägt eine Zeile in `MERGE-MANIFEST.tsv` mit
  Quelle, Zielpfad, SHA-256, Fläche und Begründung. Nicht übernommene Owner
  wandern nach `evidence/` und bleiben lesbar, ohne zu laufen. Wer den Träger
  wechseln will, wechselt ihn ganz — nicht flächenweise.
- Grenze: Datenseitige Artefakte (Owner-Registry, Regelwerk, Templates) werden
  sehr wohl zusammengeführt. Der Merge ist nur dort verboten, wo zur Laufzeit
  mutiert wird.

## CTS-ADR-016 — Optionale Hooks bleiben unregistriert

- Status: `accepted`
- Entscheidung: Die acht Hooks aus `hooks/optional/` liegen im Paket, erscheinen
  aber **nicht** im Fragment, das `bin/claudestack.mjs fragment` erzeugt.
  Registriert wird ausschließlich der Dispatcher-Shim. Aktivierung erfolgt
  einzeln, je Hook, und erst nach einer eigenen Baseline-Messung.
- Grund: Ein Paket, das im Auslieferungszustand mehrere Hooks registriert, ist
  im Auslieferungszustand nicht mehr messbar — jede spätere Zahl vermischt die
  Effekte. Das ist der Konstruktionsfehler, den `install.sh` des Quellpakets
  hatte: es merged die `settings.json` ohne Baseline.
- Folge: Der Verifier prüft, dass das Fragment genau einen `PostToolUse`-Eintrag
  enthält und keinen Fremd-Mutator. Ein Hook in `hooks/optional/` ohne
  dokumentierte Einzelmessung gilt als nicht aktivierbar, nicht als
  „noch nicht aktiviert".
- Grenze: Observer ohne Mutationsrecht dürfen parallel laufen (ADR-002), müssen
  aber dasselbe Gate durchlaufen — auch ein Observer kostet Prozessstart und
  kann Nudges injizieren.

## CTS-ADR-017 — Fremdbewertungen werden versioniert zitiert

- Status: `accepted`
- Entscheidung: Jeder Fremdwert in diesem Paket trägt Modell **und** Stand.
  Fremdspalten in `docs/REPO-MATRIX.md` führen ein Feld `stand`; Evidenzzeilen in
  `scripts/judgments.json` und `scripts/scores100-v51.json` führen `source_model`.
- Grund: Der dokumentierte Dissens über `toonify` wurde gegen einen überholten
  Wert geführt — zitiert war OPUS v4 mit 85, gültig war v5.1 mit 72. Ein Dissens
  gegen einen veralteten Stand ist kein Dissens, sondern ein Zitierfehler. Ohne
  Standangabe ist er nicht von einer echten Meinungsverschiedenheit zu
  unterscheiden.
- Folge: Der Verifier lehnt eine Evidenzzeile ab, deren `source_model` dem Träger
  entspricht, wenn sie in dessen eigene Entscheidung einfließt. Alle 15
  geprüften Korrektheitsurteile stammen aus GPT56s COR-Spalte — im Träger
  verwendet, bewertete GPT56 sich selbst.
- Folge: Absenz wird nicht als Strafe gerechnet. Der Score bildet nur die
  geprüften Achsen ab; die Abdeckung steht als eigene Spalte daneben. Ein hoher
  normierter Wert bei 80 % Abdeckung heißt „nicht geprüft", nicht „gut".
