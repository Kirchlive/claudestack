# Claude-Code Token-Stack — Masterplan

_Last reconcile: 2026-08-13 · Vorlage: `Squeez-RTK-Ladder/MASTERPLAN.md`_

**Zustandsdokument.** Was läuft, was ist gemessen, was ist aus. Der Arbeitsauftrag steht in der aktiven Wave-Datei, die Karte in `waves/WAVE-INDEX.md`.

## Current State

- **Nichts installiert.** Das Paket ist Konzept, Governance, Code und Messwerkzeug — keine Installation. Phase 0 und 1 kommen ohne Fremdcode aus.
- **Ist-Zustand vermessen** (13.08.2026, aus `settings.json` und `CLAUDE.md`):
  - `CLAUDE.md`: 173 Zeilen, 8.361 Bytes, **1.975 Token** (tiktoken o200k_base). Unter der Doku-Vorgabe von 200 Zeilen. **Nicht anfassen.**
  - **25 aktive Plugins aus 18 Marketplaces** (28 bekannte). Werkzeugbudget: 12.
  - **Acht Gesetz-I-Befunde**, darunter **5 Handler auf `PreToolUse:Bash`** (davon 3 mutierend) und 3 auf `PostToolUse:Bash`.
  - **Keine einzige Stufe-1-Env-Variable gesetzt.**
  - `autoCompactEnabled: false` bei `model: opus[1m]` — kein automatischer Sessiongrenz-Auslöser.
  - `permissions.defaultMode: "auto"`, 8 Vorab-Genehmigungen.
- **Katalog:** 375 Repositories, 374 erreichbar, Schema 4.1. Gegen die GPT56-Union gegengerechnet: deren 365 kanonische Einträge sind vollständig überdeckt.
- **32 Repositories** mit 1-bis-100-Bewertung, A/B/C gemessen, D/E kodiert.

## Messgrundlage

- **Zielmetrik: `fresh input`** (uncached + cache creation), Median gepaart, Streuung ausgewiesen. Nicht Bytes, nicht Slice-Kompressionsrate.
- **Vorab-Rechnungen unterschätzen systematisch**, weil sie eine Tool-Ausgabe einmal zählen. Gemessener Effekt in der Ladder-Serie: **Faktor 3,3** gegenüber der Rechnung. Eine Ausgabe bleibt im Kontext, und jeder folgende Turn schickt den gewachsenen Vorlauf erneut durch die Cache-Erzeugung.
- **Signal zu Grundlast entscheidet, nicht die Zahl der Wiederholungen.** Die drei Änderungen, die aus −0,3 % bei 33 % Rauschen die −27,2 % bei 3 % Rauschen gemacht haben, betrafen keine Zeile des gemessenen Werkzeugs: Grundlast aus der Aufgabe entfernen, Fälle in einem Lauf bündeln, jeden Fall unter 32 KB halten.
- **Tokenisierung ist inhaltsabhängig:** 318 tok/1000 Zeichen auf dichter Kommandoausgabe, 236 auf Prosa. Schwellwerte, die mit dem einen Wert kalibriert wurden, greifen beim anderen später als beabsichtigt.

## Was aus dem Feld feststeht

- **Die Bash-Ausgabefläche ist ~20–22 % des Tokenstroms** und auf typischen Workloads ein Nullsummenspiel. Sie lohnt bei log-, test- und build-lastigen Sessions.
- **Der einzige unabhängig belegte Werkzeuggewinn** ist Verhaltenssteuerung: −10,3 % Kosten bei p = 0,004.
- **Zwei Flächen bleiben unbesetzt** — Prefix (PolyForm Noncommercial) und externe Massendaten (Elastic 2.0). Beide werden mit nativen Mitteln gelöst, nicht durch ein Repository.
- **Ein `ANTHROPIC_BASE_URL`-Slot, ein Bewerber.**

## Active Waves

- **00-2** Defekte D1–D5 — D1, D2, D5 erledigt; D3, D4 offen.

## Roadmap (coarse)

Vollständige Karte: `waves/WAVE-INDEX.md`.

Phase 0 Inventur und Reparatur → Phase 1 native Hebel (ohne Installation, unter 3 h) → Phase 2 Ownership → Phase 3 messen → Phase 4 Sitzungsgrenze → Phase 5 nur bei belegtem Restproblem.

**Jede Phase endet mit einer Messung, bevor die nächste beginnt.**

## Shipped (index)

- Konzept v5, acht Konflikte aufgelöst — 2026-08-13
- `bash-owner-dispatch.mjs`, 9/9 — 2026-08-13
- `prefix-budget.mjs` D1-Fix, 7/7 — 2026-08-13
- `verify-stack.mjs` mit Fail-loud-Block — 2026-08-13
- `repo-audit.py`, reproduziert A/B/C — 2026-08-13
- `ab-harness.sh`, acht Messregeln — 2026-08-13
- Owner-Registry mit gemessenem Ist-Zustand — 2026-08-13
