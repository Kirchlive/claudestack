---
id: CTS-DOC-SEC-001
schema: claudestack.document/v1
document_type: security_runbook
title: Sicherheit und Recovery
version: 1
status: release_candidate
language: de
last_reviewed: 2026-08-13
applies_to: claude-code-token-stack/v1
---

# Sicherheit und Recovery

## CTS-SEC-001 — Trust Boundaries

Hook-stdin, Claude-Settings, Repo-Konfiguration, Bash-Ausgabe und Artefakt-ID sind
untrusted Input. Dispatcher läuft lokal mit Rechten des aufrufenden Benutzers.
Er ist keine Sandbox und kein Secret-Manager.

## CTS-SEC-002 — Fail-open-Grenze

Parser-, I/O-, Config-, State- und unerwartete Hookfehler blockieren Claude Code
nicht. Hook schreibt dann bewusst nichts auf stdout. Fail-open schützt
Verfügbarkeit, nicht Vertraulichkeit: Monitoring muss wiederholte Fehler außerhalb
des Modellkontexts sichtbar machen, ohne Rohpayload zu loggen.

Read-Denial in `enforce` ist eng begrenzte Advisory-Entscheidung. Ein identischer
zweiter Versuch dient als Bypass. Bash-Guard setzt nie `permissionDecision: allow`.

## CTS-SEC-003 — Exakte Klassen

Folgende Ausgabe wird nicht verlustbehaftet reduziert:

- fehlgeschlagene/unterbrochene Befehle und nicht leeres `stderr`;
- Patches/Diffs;
- Security-Scanner;
- Migrationen und IaC-Pläne;
- kryptografische/Schlüssel-Kommandos;
- Images;
- bereits nativ gespillte/trunkierte Ausgabe.

Secret-Redaction kann sichtbare Inhalte auch in diesen Klassen verändern. Sie ist
best effort und ersetzt keine Secret-Hygiene. Sie läuft nur in `enforce`;
`shadow` und `off` sind vollständige Hook-No-ops.

## CTS-SEC-004 — Artefakte

Kontrollen:

- State-/Artefaktverzeichnis `0700`;
- Artefaktdatei `0600`;
- atomarer Write über exklusive temporäre Datei, `fsync`, Rename;
- ID aus SHA-256, extern akzeptiert nur als 24 Hex-Zeichen;
- vollständiger SHA-256 im Artefakt, Präfix im Footer;
- maximale serialisierte Artefaktgröße;
- zeitbasierte Retention und explizites `prune`;
- Pfad wird aus validierter ID konstruiert, nicht aus freiem Benutzerpfad.

`0700`/`0600` ist POSIX-Semantik. Windows-ACLs und Hookpfade sind nicht durch
diese Tests abgedeckt und brauchen vor Nutzung einen eigenen Security-Canary.

Artefakte enthalten best-effort-redigierte stdout/stderr-Daten, aber weiterhin
sensible Metadaten. Der Command-Text wird nicht redigiert und kann geheime
Argumente enthalten. Artefakte nicht committen, synchronisieren, in Tickets
einfügen oder an untrusted Prozesse weitergeben. Backup-/Endpoint-Schutz gilt
auch für `$CLAUDE_CONFIG_DIR`.

„Raw“ bedeutet vollständige Response nach Redaction. Integrity-Check beweist
Unverändertheit dieses gespeicherten Payloads, nicht Rekonstruktion zuvor
entfernter Secretbytes.

## CTS-SEC-005 — Redaction

Implementierte Muster decken typische Anthropic-/`sk-`-Schlüssel sowie benannte
Key/Token/Secret/Password-Zuweisungen ab. Grenzen:

- nicht alle Secretformate erkennbar;
- strukturierte/verschleierte oder mehrzeilige Secrets können durchrutschen;
- False Positives können Diagnosewert mindern;
- Command-Text selbst kann sensible Argumente enthalten.

Deshalb Secrets nie absichtlich in Bash-Kommandozeilen oder Output geben.
Sensible Kommandos mit geeigneten Secret-FDs/Stores ausführen. Vor Freigabe
repo-spezifische Leak-Smokes ergänzen.

## CTS-SEC-006 — Konfiguration

`$CLAUDE_TOKEN_STACK_CONFIG` und `$CLAUDE_CONFIG_DIR` verändern gelesene Pfade.
Nur vertrauenswürdige absolute Pfade in Service-/CI-Umgebungen setzen. Config
gegen `config/token-stack.schema.json` validieren. Symlink-/Eigentümerpolitik des
Hosts anwenden; Paket/Config nicht aus schreibbaren Shared-Verzeichnissen laden.

Keine Auto-Installation, kein automatisches Settings-Merge. Fragment vor
atomarer Übernahme reviewen. `doctor` erkennt bekannte Konfliktmuster, beweist
aber nicht Abwesenheit unbekannter Mutatoren.

## CTS-SEC-007 — Retention und Prune

Retention-Tage und Maximalgröße nach Datenklasse minimieren. `prune` automatisiert
nur nach bewusstem Betriebsentscheid (z. B. Scheduler des Hosts). Vor Löschung
laufende Incidents/Recovery-Anforderungen prüfen. Prune ist endgültig; Recovery
nach Entfernung ist nur aus externem privaten Backup möglich.

## CTS-SEC-008 — Supply Chain

- Paketrevision/Checksums im Deployment pinnen.
- Node.js und Dritttools über bestehenden Patchprozess aktualisieren.
- ccusage und optionale Retrieval-/Proxy-/Memory-Tools separat prüfen; Observer-
  Status allein macht fremden Code nicht vertrauenswürdig.
- Squeez-/RTK-Binaries, Hookskripte oder Settings nie blind aus Referenz-Ladder
  kopieren.
- Lizenz, Telemetrie, Netzwerkzugriffe und Updatekanal jedes optionalen Owners vor
  Pilot prüfen.

## CTS-SEC-009 — Incident-Runbook

1. Scope auf `shadow`, bei Dispatcherproblem `off` setzen.
2. Settings-/Config-/Paket-Hashes und betroffene Run-IDs sichern.
3. Relevante Artefakte privat einfrieren; `prune` aussetzen.
4. Recovery aus ID testen, Hash und Response-Form prüfen.
5. Secretverdacht: Credential rotieren; Redaction nicht als Schutzbeweis nutzen.
6. Owner-Konflikt: fremde Mutatoren deaktivieren, `doctor` wiederholen.
7. Fix mit Test, Shadow und neuem Canary ausrollen.

Keine Rohartefakte in Incidentbericht. Nur minimierte/redigierte Evidenz und Hashes.

## CTS-SEC-010 — Security-Abnahme

- [ ] Settingsbackup und Rollback getestet
- [ ] Configschema validiert
- [ ] Hook-Payload-Smokes bestanden
- [ ] Fehler-/stderr-/Diff-/Security-/IaC-/Krypto-Klassen geprüft
- [ ] Redaction mit repo-relevanten Secretformaten geprüft
- [ ] `0700`/`0600`, Größenlimit und Retention geprüft
- [ ] Recovery gegenüber redigierter Response exakt; ungültige IDs abgelehnt
- [ ] `doctor` ohne Error-Finding
- [ ] keine zweite mutierende Owner-Komponente
