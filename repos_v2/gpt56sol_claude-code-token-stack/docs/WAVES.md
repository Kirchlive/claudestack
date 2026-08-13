---
id: CTS-DOC-WAVE-001
schema: claudestack.document/v1
document_type: rollout_plan
title: Rollout-Wellen
version: 1
status: release_candidate
language: de
last_reviewed: 2026-08-13
applies_to: claude-code-token-stack/v1
---

# Rollout-Wellen

Jede Welle ändert genau eine Variable. Nächste Welle startet erst nach Gate,
dokumentierter Entscheidung und geprüftem Rollback.

## CTS-WAVE-000 — Baseline

- Scope: 10–20 repräsentative akzeptierte und nicht akzeptierte Taskversuche.
- Änderung: keine.
- Erfasst: Qualität, Rework, Zeit, Toolcalls, Provider-/Cache-Usage, Kosten soweit
  verfügbar, große Read-/Bash-Flächen.
- Exit: Taskset und Schwellen eingefroren; Messlücken sichtbar.
- Rollback: nicht anwendbar.

## CTS-WAVE-010 — Prefix-Hygiene

- Scope: stabile Root-Invarianten und path-scoped Rules.
- Änderung: volatile Sessiondaten, Duplikate und lange Verhaltensprosa entfernen.
- Exit: Startup-Kontext kleiner oder gleich, Taskqualität stabil.
- Rollback: vorherige `CLAUDE.md`/Rules aus Versionskontrolle.

## CTS-WAVE-020 — Dispatcher Shadow

- Scope: fragment manuell/atomar übernehmen; `mode: shadow`.
- Änderung: lokaler Dispatcher wird aufgerufen, bleibt aber vollständiger No-op;
  Beobachtung erfolgt extern über Usage-/Benchmarkdaten.
- Exit: `CTS-BENCH-GATE-001` bestanden.
- Rollback: `off` oder Settingsbackup.

## CTS-WAVE-030 — Read Canary

- Scope: kleine Repo-/Nutzerpopulation, `mode: enforce`.
- Änderung: große Ganzdatei-/unveränderte Reread-Hinweise mit einmaligem Bypass.
- Exit: keine Taskregression, Escape-Valve und State-Cleanup bestätigt.
- Rollback: `shadow`.

## CTS-WAVE-040 — Bash-Output Canary

- Scope: loglastige repräsentative Aufgaben derselben kleinen Population.
- Änderung: recoverbare Ausgabeelision nach Exakt-, Größen- und Net-Win-Gates.
- Exit: `CTS-BENCH-GATE-002` bestanden; Recovery-Stichprobe 100 % exakt.
- Rollback: `shadow`; Artefakte bis Incidentabschluss behalten.

## CTS-WAVE-050 — Breiteres Enforce

- Scope: stufenweise weitere Repos/Teams.
- Änderung: nur Population, nicht Algorithmus/Schwellen zugleich.
- Exit: Qualitäts- und Kostenmetrik bleibt innerhalb vorab definierter Gates.
- Rollback: betroffenen Scope auf `shadow`, nicht global weiterrollen.

## CTS-WAVE-060 — Retrieval-Pilot

- Scope: Aufgaben mit wiederholten Caller-/Impact-/Architekturfragen.
- Änderung: native Suche gegen genau einen Indexarm.
- Exit: Gewinner nach Qualität, Diagnosezeit, Toolcalls, Usage und residentem
  Kontext; Verlierer wird entfernt.
- Rollback: native Suche.

## CTS-WAVE-070 — Optionale Task-Kontinuität

- Scope: lange Tasks mit realem `/clear`-/Crash-/Handoff-Problem.
- Änderung: `TASK-STATE.md`-Template.
- Exit: Wiederaufnahme gelingt, ohne Secrets/Rohlogs oder veralteten State.
- Rollback: Datei entfernen; Repo-Fakten bleiben in ADRs/Tests/Runbooks.

## CTS-WAVE-080 — Experimentelle Profile

- Scope: getrennte A/B-Arme für External-Data-Sandbox, Memory oder API-Proxy.
- Änderung: genau ein Profil und eine Surface.
- Entry: Baseline zeigt konkretes Problem; Privacy-/Lizenz-/Cache-Review bestanden.
- Exit: eigener Produktionsentscheid oder vollständige Entfernung.
- Rollback: Profil deaktivieren und alle Hook-/Env-/Proxy-Referenzen entfernen.

## CTS-WAVE-090 — Betrieb

- regelmäßig `doctor`, Tests, Recovery-Smoke und `prune` prüfen;
- Config-/Paketänderungen erneut durch Shadow/Canary führen;
- ccusage-/Usage-Trends beobachten, aber Ursache nur durch kontrollierten A/B-Lauf
  zuschreiben;
- Decision IDs bei Änderungen fortschreiben, nicht umnummerieren.
