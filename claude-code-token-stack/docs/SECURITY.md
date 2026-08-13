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

## CTS-SEC-011 — Guard-Namenskollision im Quellrepo

**Drei verschiedene Artefakte trugen denselben Dateinamen `bash-dump-guard.mjs`.**
Das ist kein Schönheitsfehler, sondern eine Sicherheitsfrage: Wer eine
Registrierung prüft, prüft einen Pfad — und drei Pfade mit gleichem Basenamen
verhalten sich vollkommen verschieden.

| Fassung | Zeilen | Event | Wirkung |
|---|---:|---|---|
| `hooks/bash-dump-guard.mjs` | 234 | `PreToolUse` | **Deny-Gate**, emittiert `permissionDecision: "deny"` |
| `GPT55SOL_PRO/bash-dump-guard.mjs` | 1.064 | `PostToolUse` | **Outputreducer**, emittiert `updatedToolOutput` |
| v3.1-Variante | — | — | bewertet, nie ausgeliefert |

Drei Bewertungsmodelle haben drei verschiedene Dateien unter einem Namen
bewertet. **Ein Teil der Bash-Owner-Divergenz im Korpus war eine
Namensverwechslung, keine Sachfrage.**

Konsequenz für dieses Paket: Der Name wird nicht mehr vergeben. Die Stufen im
Dispatcher heißen `bash-deny-gate` und `bash-output-reducer`. Wer eine
Hook-Registrierung auditiert, vergleicht **Pfad plus Hash**, nie den Namen.

## CTS-SEC-012 — Das Deny-Gate im Quellrepo bleibt bestehen

Auf `PreToolUse:Bash` ist im Quellrepository ein deny-only Security-Gate
registriert. Der Dispatcher dieses Pakets **beansprucht diese Fläche nicht** und
darf sie nicht beanspruchen.

- Ein Deny-Gate ist kein Input-Rewriter. Es entscheidet, ob ein Kommando läuft,
  und verändert es nicht. Mehrere deny-only Gates sind mit Gesetz I vereinbar,
  solange keines mutiert — aber sie gehören explizit inventarisiert.
- Der Dispatcher **prüft beim Start**, ob auf `PreToolUse:Bash` ein fremder
  Mutator registriert ist, und meldet den Befund auf stderr. Er blockiert nicht.
  Ein Startupfehler eines Beobachtungspfads darf nie einen Tool-Aufruf verhindern.
- Ob das Gate bestehen bleibt, ist eine **Projekt-Policy-Frage**, keine
  Paketentscheidung. Es wird hier weder übernommen noch entfernt.

## CTS-SEC-013 — Bekannte Grenzen dieser Fassung

| ID | Grenze | Wirkung | Umgang |
|---|---|---|---|
| **SEC-004** | Artefakt-Permissions `0600`/`0700` sind unter **Windows/NTFS-ACLs ungetestet**. Der `sessionKey`-Fallback greift auf die Parent-PID zurück. | Auf Windows ist die Vertraulichkeit der Recovery-Artefakte nicht zugesichert. | Für Linux/macOS kein Blocker. Auf Windows vor Enforce eigenständig prüfen — oder Artefakte deaktivieren. |
| **SEC-005** | **Command-Text in Artefakten wird nicht redigiert.** Die Secret-Redaction arbeitet best-effort auf der Tool-*Response*; das auslösende Kommando selbst wird unverändert gespeichert. | Ein Secret, das als Argument auf der Kommandozeile stand, liegt im Artefakt. | Artefakte nie committen oder hochladen. Secrets gehören in Umgebungsvariablen oder Dateien, nicht in Kommandozeilen — das gilt unabhängig von diesem Paket. |
| **SEC-006** | Recovery-Artefakte enthalten die vollständige Response **nach** Redaction, nicht zwingend die ursprünglichen Secretbytes. | Redaction ist best-effort, keine Garantie. | Bei Incident-Verdacht Artefakte als potenziell sensibel behandeln und in die Aufbewahrungsentscheidung einbeziehen. |

Diese drei Grenzen sind bewusst offen dokumentiert und nicht behoben. Sie
verschwinden nicht dadurch, dass man sie nicht erwähnt.
