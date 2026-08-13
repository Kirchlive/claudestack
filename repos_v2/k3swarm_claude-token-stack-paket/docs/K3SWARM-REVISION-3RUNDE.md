---
doc_id: K3SWARM-REVISION-3RUNDE
version: 1.0
datum: 2026-08-13
bezug: META-VALIDIERUNG-3RUNDE.md (Revisionsrunde), META-VALIDIERUNG-3WEGE v1.2+errata, META-VALIDIERUNG-2RUNDE v2.0+errata
---

# K3SWARM-Revision zur 3. Runde

## 1. Bestätigte Befunde gegen META (keine Einwände)

Die 10 Errata der META-Validierung gegen sich selbst (E1–E10) wurden gesichtet; betroffen sind ihre Dokumente, nicht die K3SWARM-Artefakte. Anschlussrelevant für mich: **E2** (Nennerwechsel-Korrektur: GPT56 49,5 vs. OPUS 75,5 vs. K3SWARM 76,8 auf n=6 — meine Position unverändert), **E8** (die 1.975 Token sind Reproduktion, nicht Quellenunabhängigkeit — Wert bleibt, Rahmung korrigiert), **E3** (gemeinsame Datenbasis ≠ unabhängige Bestätigung — dieselbe Fehlerklasse wie der Konvergenzterm, den ich abgeschafft habe).

## 2. Residuen gegen K3SWARM — Abarbeitung

| # | Residuum (3RUNDE §5) | Status | Beleg |
|---|---|---|---|
| R1 | toonify-Pin ≥0.8.1 | ✅ **erledigt** — global auf **≥0.8.2** gesetzt (9 Dateien), Burst-Warnung (4 Releases/Tag, Changelog-Pflicht) in zweitvalidierung-update.md U1 + Paket-README ergänzt | `grep -rn "0.8.2"` |
| R2 | Konvergenzterm `Kon/10` noch in aktiver Rubrik | ✅ **als DEPRECATED markiert** — Rubrik-Kopf in zweitvalidierung-update.md erklärt Zirkelbefund + Reskalierungsregel (90er-Basis) bei Neuvergabe; Altscores bleiben als mit Term gerechnet deklariert (keine stille Neuberechnung) | zweitvalidierung-update.md §Bewertungsmodell |
| R4 | v3.1-Guard bewertet, aber nicht ausgeliefert | ✅ **Auslieferungsort benannt** — v3.1 liegt im Paket (`claude-token-stack-paket/hooks/bash-dump-guard.mjs`, 17/17 Syntax, 73/73 Tests); Push ins Git-Repo ist Nutzeraktion. Namensdreifalt im Paket dokumentiert (bash-dump-gate.mjs vs. bash-dump-guard.mjs) | Paket-README, VALIDIERUNG.md §6 |
| R5 | Messwerte reported_only (318 Tok/1k Z., 86,3 ms, 806 Calls) | ⚠️ **bestätigt offen** — Rohläufe liegen nicht vor und werden nicht nachträglich behauptet. Abgrenzung: Funktionsnachweise (73/73, 37/38, verify Exit 0) sind real ausgeführt; Token-/Latenzwerte sind Fremdmessungen und bleiben als solche markiert | zweitvalidierung Frontmatter `einschraenkung` |
| R6 | Keine E2E-Baseline | ⚠️ **offen, unverändert** — Wave 0 im Paket-ROLLOUT ist dafür verbindlich; alle drei Modelle benennen sie als einzige verbleibende Wahrheitsquelle | planung/ROLLOUT.md, planung/MESSPLAN.md |

## 3. Methodenübernahmen aus 3RUNDE

1. **Konsensscore A4 = deskriptiv, nicht normativ.** In finaler-abgleich.md §4 als Entscheidungsregel v3.1 verankert.
2. **Kreuztabelle (Lieferfähigkeit × Korrektheit) ersetzt den Mittelwert als Entscheidungsinstrument** (OPUS5): genau ein Werkzeug unstrittig (`ccusage`); vier Werkzeuge >75 bei gleichzeitigem reject/replace → **A/B-Pflicht statt Option**: squeez 87/59, omni 83/57, magic-compact 83/34, cache-fix 75/39.
3. **Security-Veto vor Mittelwert** (GPT56: `security_veto_over_mean_score: true`): kein Aktivitäts-/Lizenz-/Konvergenzwert darf Permission-/Korrektheits-/Recovery-Defekte ausmitteln.
4. **Guard-Identitätskollision aufgelöst** (GPT56-Audit): drei Artefakte unter einem Namen; Registrierung im Ist-Setup war nie falsch, der Name mehrdeutig. Paket trennt die Rollen (`bash-dump-gate.mjs` / `bash-dump-guard.mjs` v3.1). Teil der Bash-Owner-Divergenz war Namensverwechslung, nicht Dissens.
5. **Katalogstand konvergiert:** v4.2 = 371 Einträge / **368 kanonisch distinct** (alle drei Modelle).

## 4. Selbstkritik-Pflege (laufendes Register)

| Runde | Fehler gegen K3SWARM | Status |
|---|---|---|
| Runde 2 | Erstrundensummen falsch (144/130/107/111) | behoben + Erratum |
| Runde 2 | CVE-2026-33068 falsch zugeordnet | behoben (U9a) |
| Runde 2 | T1 nutzte selbst falsifiziertes Modell | behoben (~5.586 messnah + Budgetanteil) |
| Runde 3 | toonify-Pin veraltet | behoben (≥0.8.2) |
| Runde 3 | Konvergenzterm aktiv trotz Abschaffungszusage | behoben (DEPRECATED-Markierung) |
| Runde 3 | v3.1 ohne Auslieferungsort | behoben (Paket-Pfad benannt) |
| dauerhaft | Token-Messwerte reported_only; keine E2E-Baseline | offen deklariert, Wave 0 |

## 5. Stand nach 3 Runden

Die Korpusarbeit ist abgeschlossen: 4 Datensätze, 3 Zweitvalidierungen, 2 Meta-Ebenen, 1 Revisionsrunde — mit Rückkanal in alle Richtungen. Verbleibende Wahrheitsquelle ist ausschließlich die E2E-Baseline auf der Zielmaschine (Wave 0). Alles Dokumentarische ist konsolidiert in: `finaler-abgleich.md` (Entscheidungen v3.1), `zweitvalidierung-update.md` (Scores, Errata v2), `vergleich-4wege.md` (Erstrunde, korrigiert), `claude-token-stack-paket/` (Ausführung, 36 Dateien, Eigenprüfung grün).
