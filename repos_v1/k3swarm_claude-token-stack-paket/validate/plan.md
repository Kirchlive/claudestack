# Plan v2: 4-Wege-Abgleich → Squeez-RTK-Ladder-Analyse → Zweitvalidierung → Komplettpaket

## Stage A — 4-Wege-Datensatz-Abgleich (maschinenlesbar, 5-Punkte-System)
Datensätze: (1) OPUS5_MAX_Validation, (2) GPT56SOL_ULTRA_Validation, (3) unsere Validierung (claude-token-stack-evaluierung-und-merge.md + Subagent-Berichte), (4) Claude-Code-Token-Stack-Konzept.md (KIMI).
- A1: Repo pullen, neue Ordner inventarisieren
- A2: GPT56SOL_ULTRA_Validation tiefenanalysieren (Subagent)
- A3: OPUS5_MAX_Validation tiefenanalysieren (Subagent)
- A4: Alle Themen/Titel aus allen 4 Datensätzen nacheinander gegenüberstellen; fehlende Datensätze = "nicht vorhanden"; 5-Punkte-Bewertung pro Entscheidung/Gegenüberstellung (nur aus vorhandenen Daten, keine neuen Messungen)
- Output: vergleich-4wege.md (maschinenlesbar)

## Stage B — Squeez-RTK-Ladder + Claude-Code-Dateien einlesen
- B1: Squeez-RTK-Ladder detailliert analysieren (Implementierungskonzept, Integrationsdateien, Scripts, Code, Umsetzungs-/Testdokumentation) — Referenz für Planung & Aufbau
- B2: hooks/, CLAUDE.md, settings.json als Umsetzungs-/Status-Daten einlesen
- Output: squeez-rtk-ladder-analyse.md

## Stage C — Zweitvalidierung (1–100-Bewertung, Tokenberechnungen, Repo-Deep-Dives)
- C1: Tokenberechnungen + Dateienabgleich anhand der Vergleichs-Markdown
- C2: Detaillierte Bewertung 1–100 je Entscheidung/Repo
- C3: Top-Kandidaten erneut prüfen: Issues, Aktualität, Update-Zyklus, Unstimmigkeiten (GitHub live)
- C4: Nächstsinnvollere Alternativen je Teilbereich prüfen
- Output: zweitvalidierung-update.md (maschinenlesbar, alle Daten)

## Stage D — Komplettpaket generieren
- Vollständiges Paket: Konzept, Planung, Waves, Hooks, Regelungen, Scripts, Repo-Optimierungen
- Basis: Squeez-RTK-Ladder-Aufbau + Claude-Code-Dateien + alle validierten Ergebnisse
- Output: /mnt/agents/output/claude-token-stack-paket/ (vollständige Verzeichnisstruktur) + Paket-README
