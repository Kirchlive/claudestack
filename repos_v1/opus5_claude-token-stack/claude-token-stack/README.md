# Claude Code Token-Stack — Komplettpaket v5

**Stand:** 13. August 2026 · **Nichts hiervon ist installiert.** Das Paket ist Konzept, Governance, Code und Messwerkzeug.

## In fünf Minuten

1. `KONZEPT-v5.md` — Abschnitte **3** (drei Gesetze), **6** (Zielstack) und **15** (der gemessene Ist-Zustand) sind das Wesentliche.
2. `node hooks/prefix-budget.mjs --report` — die erste Messung. Sie entscheidet, ob der Rest lohnt.
3. `waves/WAVE-INDEX.md` — was in welcher Reihenfolge, mit Akzeptanzkriterium je Wave.
4. `DEFEKTE.md` — was vor der Nutzung noch zu reparieren ist.

**Phase 0 und 1 kosten zusammen unter drei Stunden und installieren nichts.** Sie adressieren die Fläche, auf der praktisch die gesamte Repo-Landschaft nicht arbeitet.

## Inhalt

| Pfad | Was |
|---|---|
| `KONZEPT-v5.md` | Referenzfassung: drei Gesetze, vier Mechanismen, neun Flächen, Stufen 0–7, Regeln R1–R8, Konfliktmatrix, Migration |
| `MASTERPLAN.md` | Zustandsdokument — was läuft, was ist gemessen, was ist aus |
| `DEFEKTE.md` | D1–D5 mit Reproduktion und Status |
| `waves/WAVE-INDEX.md` | Karte aller Waves. Session-Bootstrap: Index + nur die aktive Wave lesen |
| `waves/WAVE-STATE.md` | genau 1 (max. 2) aktive Wave |
| `rules/token-efficiency.rules.md` | kompakte Laufzeitregeln zum Ablegen als Referenzdatei |
| `rules/context-surface-owners.yaml` | Owner-Registry, 11 Flächen, mit gemessenem Ist-Zustand |
| `hooks/bash-owner-dispatch.mjs` | **R2** — ein Handler statt fünf auf `PreToolUse:Bash` und drei auf `PostToolUse:Bash` |
| `hooks/prefix-budget.mjs` | **R1** — read-only SessionStart-Messung, mit D1-Fix |
| `hooks/*.example.json` | Dispatcher-Konfiguration und Hook-Registrierung |
| `config/settings.patch.json` | Stufe 1, sieben Werte mit Begründung je Wert |
| `config/plugin-diet.md` | Wave 01-1, Klassifikation der 25 aktiven Plugins |
| `scripts/verify-stack.mjs` | Paketprüfung mit **Fail-loud**-Block |
| `scripts/repo-audit.py` | reproduziert die 1-bis-100-Bewertung (A/B/C gemessen) |
| `scripts/ab-harness.sh` | gepaarter A/B nach den acht Messregeln der Ladder-Serie |
| `TASK-STATE.template.md` | Handoff-Vorlage für die Sitzungsgrenze |
| `MANIFEST.json` | Dateiliste, gegen die `verify-stack.mjs` prüft |

## Prüfen

```bash
node scripts/verify-stack.mjs                  # Paket
node scripts/verify-stack.mjs --home "$HOME"   # zusätzlich die Installation
node hooks/bash-owner-dispatch.mjs --self-test # 9 Prüfungen
node hooks/prefix-budget.mjs --self-test       # 7 Prüfungen
python3 scripts/repo-audit.py --repos scripts/repos.txt --evidence scripts/evidence.json --out audit.json
```

`verify-stack.mjs` weist fehlende Prüfgegenstände am Ende gesondert aus. Diese Prüfungen gelten **nicht** als bestanden — sie sind gar nicht gelaufen. Der Grund steht in `DEFEKTE.md` unter D2.

## Nach dem Entpacken

```bash
chmod +x scripts/*.sh scripts/*.py
node scripts/verify-stack.mjs
```

Das Archiv `claude-token-stack-v5.tar.gz` führt die Execute-Bits korrekt mit. Die entpackte
Verzeichniskopie kann sie je nach Dateisystem verlieren — `verify-stack.mjs` meldet das
als Fehlschlag statt es zu übergehen. Genau das ist Defekt D3 aus dem Vorgängerpaket,
diesmal auf der richtigen Seite der Prüfung.

## Was dieses Paket bewusst nicht enthält

- **Keinen Installer.** Wave 02-1 ist ein manueller Schritt mit einem Akzeptanzkriterium, kein Skript. Ein Installer, der `settings.json` anfasst, ist genau die Klasse von Werkzeug, vor der das Konzept warnt.
- **Kein Fremdrepository.** Der Katalog bewertet 375, empfohlen wird keines vor der eigenen Messung.
- **Keine Gesamtprozentzahl.** README-Prozente sind nicht addierbar. Die einzige Zahl, die zählt, entsteht in Phase 3.

## Zwei Flächen bleiben unbesetzt

| Fläche | Grund |
|---|---|
| **Prefix** | Das einzige Repo des Feldes, das ernsthaft darauf arbeitet, steht unter PolyForm Noncommercial — für dienstliche Nutzung gesperrt. Stufe 0 löst die Fläche von Hand. |
| **Externe Massendaten** | Der Standardkandidat steht unter Elastic 2.0. Kein freigabefähiger Bewerber vorhanden. |

Das ist kein Provisorium, sondern der einzige lizenzsaubere Weg — und er kostet weniger als jede Installation.

## Herkunft

Destilliert aus fünf Agent-Ausarbeitungen, vier unabhängigen Validierungen und einer eigenen Messreihe. Nachweise:

- `VALIDATION.md` — Prüfbericht zu den fünf Ursprungsausarbeitungen
- `VERGLEICH-4WEGE.md` — 34 Vergleichspunkte über vier Validierungsdatensätze
- `UPDATE-PHASE3.md` — Konfliktauflösung, Tokenmessung, 1-bis-100-Bewertung, Issue-Zweitvalidierung
- `LADDER-REFERENZANALYSE.md` — woher Wave-Governance und Messharness stammen
- `repo-catalog-v4.json` — 375 Repositories, Schema 4.1
