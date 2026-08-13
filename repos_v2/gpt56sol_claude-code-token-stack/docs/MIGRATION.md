---
id: CTS-DOC-MIG-001
schema: claudestack.document/v1
document_type: migration_runbook
title: Migration
version: 1
status: release_candidate
language: de
last_reviewed: 2026-08-13
applies_to: claude-code-token-stack/v1
---

# Migration

## CTS-MIG-001 — Vorbedingungen

- Node.js erfüllt `package.json`.
- Verantwortliche Person kann aktive Claude-Code-Settings identifizieren.
- Repräsentatives Taskset und Baseline existieren; sonst zunächst nur `shadow`.
- Backupziel ist privat und außerhalb des Repos.
- Rollback-Owner und Wartungsfenster sind benannt.

Der Stack installiert oder editiert nichts automatisch.

## CTS-MIG-002 — Ist-Zustand inventarisieren

Aktive Settings bestimmen:

```bash
node bin/claudestack.mjs doctor
```

Oder explizite Datei prüfen:

```bash
node bin/claudestack.mjs doctor /absoluter/pfad/settings.json
```

Vor Fortsetzung beheben:

- mehrere bekannte `PreToolUse:Bash`-Mutatoren;
- mehrere bekannte `PostToolUse:Bash`-Mutatoren;
- alte Ladder-Hooks;
- direkte Script-Ausführung ohne `node`;
- maschinenspezifische Pfade, die auf Zielhosts nicht existieren.

Warnings brauchen dokumentierte Bewertung; Error-Findings blockieren Enforce.

## CTS-MIG-003 — Einstellungen sichern

Settings mit OS-/Deployment-Mechanismus sichern. Backup nicht im Repo ablegen.
Dateirechte und Eigentümer beibehalten. Backup vor und nach Migration lesbar
prüfen; Inhalt nicht in Tickets oder Chat kopieren.

## CTS-MIG-004 — Fragment erzeugen und prüfen

```bash
node bin/claudestack.mjs fragment > /tmp/claudestack-fragment.json
```

Prüfen:

- absolute Paketwurzel zeigt auf diese unveränderte Installation;
- jeder registrierte Hook ruft
  `node "<package>/hooks/claudestack.mjs"` auf;
- `PreToolUse` matcht nur `Read`;
- `PostToolUse` matcht `Bash|Read`;
- `PreCompact` und `SessionEnd` sind für Enforce-State-Cleanup registriert;
- kein RTK-/Squeez-/OMNI-/anderer Bash-Replacer bleibt parallel aktiv.

Bestehenden Root-`bash-dump-guard` separat entscheiden: Als deny-only
`PreToolUse:Bash`-Security-Gate darf er nach Projekt-Policy-Prüfung bestehen
bleiben. Er ist kein Input-Mutator und kein Ersatz für den Output-Dispatcher.

Fragment ist kein vollständiges `settings.json`. Bestehende nicht konkurrierende
Settings bewusst erhalten.

## CTS-MIG-005 — Manuell und atomar übernehmen

1. Bestehende JSON-Datei in separatem Editor/Tool laden.
2. Konkurrierende mutierende Owner entfernen.
3. geprüftes `hooks`-Fragment mergen.
4. neue vollständige JSON-Datei neben Zieldatei schreiben.
5. JSON parsen und Rechte prüfen.
6. Datei atomar auf demselben Dateisystem umbenennen.
7. `doctor` gegen Zieldatei wiederholen.

Kein blindes Shell-Concatenation-Merge. Bei zentral verwalteten Settings den
jeweiligen Konfigurations-Deploymentweg verwenden.

## CTS-MIG-006 — Shadow

Repo- oder Benutzerkonfiguration:

```json
{
  "schemaVersion": 1,
  "mode": "shadow"
}
```

Shadow ist vollständiger Hook-No-op: kein Read-Deny, kein Bash-Rewrite, keine
Redaction, keine Artefakte und keine Statepflege. Bereits vorhandener
Enforce-State wird in Shadow nicht entfernt. Verifizieren:

- normale Bash-/Read-Aufgaben unverändert;
- Hookfehler blockieren nichts;
- `doctor` meldet keinen Owner-Konflikt;
- Baseline-/Shadow-Metriken werden extern über Usage-/Benchmarkdaten getrennt
  erfasst; Hook selbst schreibt keine Beobachtungsdaten.

## CTS-MIG-007 — Canary

Canary ist `mode: "enforce"` in einem kleinen, expliziten Scope, nicht neuer
Configwert. Nur ein Faktor ändert sich. Kandidaten: einzelnes Testrepo, definierte
Entwicklergruppe oder klar begrenztes Zeitfenster.

Vor Start:

- Recovery-ID aus reduzierter Ausgabe wurde erfolgreich gelesen;
- Fehler/stderr/Patch/Security-/Migration-/IaC-/Krypto-Ausgabe bleibt exakt
  (abgesehen von Secret-Redaction);
- Read-Escape-Valve wurde getestet;
- Artefaktverzeichnis `0700`, Dateien `0600`;
- Retention und Maximalgröße passen Datenklasse;
- Abbruchschwellen aus `CTS-BENCH-GATE-003` sind gesetzt.

## CTS-MIG-008 — Enforce

Breiteres Enforce erst nach bestandenem Canary-Gate. Rollout in Wellen, je Welle
nur eine neue Surface oder Population. Nach jeder Welle:

```bash
node bin/claudestack.mjs doctor
npm test
```

Zusätzlich Qualitätsreview und A/B-Auswertung durchführen. Keine Freigabe allein
aufgrund kleinerer stdout-Bytes.

## CTS-MIG-009 — Rollback

Schneller Funktionsrollback:

1. Config atomar auf `"mode": "shadow"` setzen.
2. Bei Dispatcher-Störung auf `"mode": "off"` setzen oder gesichertes
   `settings.json` atomar wiederherstellen.
3. Claude Code neu starten, wenn Settings/Hooktopologie erst bei Sessionstart
   geladen wird.
4. `doctor` ausführen.
5. betroffene Artefakte sichern; nicht voreilig prunen.
6. Incident-ID, Tasks, Modus, Config-Hash und Recovery-Ergebnis notieren.

Rollback ist erfolgreich, wenn Aufgaben ohne Mutation weiterlaufen und der
vorherige Settingsstand wiederherstellbar ist.

## CTS-MIG-010 — Upgrade

Vor Paketupgrade: laufende Tasks beenden/checkpointen, Config gegen neues Schema
prüfen, Tests und Shadow-Smoke ausführen. State-Schema und Recovery alter
Artefakte explizit testen. Keine in-place Änderungen an gespeicherten Artefakten.
