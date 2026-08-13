---
id: CTS-DOC-MIG-001
schema: claudestack.document/v1
document_type: migration_runbook
title: Migration
version: 2
status: release_candidate
language: de
last_reviewed: 2026-08-13
applies_to: claude-code-token-stack/v2
---

# Migration

## CTS-MIG-000 — Phase 0 als Vorbedingung

**Diese Migration beginnt nicht mit diesem Paket.** Sie beginnt mit Subtraktion,
und die braucht keine einzige Datei von hier.

Der Grund ist eine Messung: der Always-on-Prefix ist der teuerste Posten, nicht
die Bash-Ausgabe. Eine Root-`CLAUDE.md` von 8,4 KB kostet **1.975 Token** und
wird bei jedem dateiberührenden Tool-Call neu injiziert. Wer den Dispatcher
installiert, ohne das vorher zu bereinigen, misst ihn später gegen eine
Baseline, die selbst das Problem ist — und bekommt ein Ergebnis, das nichts
bedeutet.

| Schritt | Handlung | Gate |
|---|---|---|
| 0.1 | `/context` mit einer **festen, wiederholbaren** Aufgabe; Startzustand vollständig protokollieren | Zahl liegt vor |
| 0.2 | Plugins auf das tatsächlich Genutzte kürzen. **Toggles nur zwischen Sessions** — ein Toggle in laufender Session schreibt gecachten User-Content vollständig neu | Liste vorher/nachher |
| 0.3 | Root-`CLAUDE.md` entschlacken: Verhaltensregeln genau einmal, harter Deckel **4 KB** | Byte-Zahl belegt |
| 0.4 | mutierende `PreToolUse:Bash`-Hooks auf **höchstens einen** reduzieren (Matcher × Event × Mutationsart inventarisieren) | `doctor`-Report |
| 0.5 | `/context` erneut, identische Aufgabe | **Differenz dokumentiert** |

Die Differenz aus 0.5 ist die Referenzzahl. Jede spätere Messung — jeder
einzelne env-Deckel, der Shadow-Lauf, das Net-Win-Gate — läuft gegen sie.

> **Wenn nichts zu subtrahieren ist:** Auf einer frischen Installation ohne
> Plugins, ohne Root-`CLAUDE.md` und ohne registrierte Hooks entfallen 0.2 bis
> 0.4 ersatzlos. Dann ist die Erstmessung zugleich die Referenz — und sie ist
> sauberer als jede spätere. In diesem Fall sofort messen, solange der Zustand
> unberührt ist.

**Zwei Fallen bei der Ist-Erhebung**, beide real aufgetreten:

1. **Die Settings-Datei ist nicht die Umgebung.** `ENABLE_TOOL_SEARCH` kann per
   `export` in `~/.bashrc` gesetzt sein und wirken, ohne je in `settings.json`
   aufzutauchen — Claude Code startet als Kindprozess der Shell. Beide Quellen
   erheben.
2. **Registrierte Hooks stammen nicht nur von dir.** Statuszeilen-Werkzeuge und
   Plugins tragen eigene Einträge ein. Jeden gefundenen Hook mit synthetischem
   stdin aufrufen und prüfen, ob er mutiert — nicht aus dem Namen schließen.

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

## CTS-MIG-011 — Betriebsort und Transfer

**Der Plan lässt diese Frage offen (Defekt D20).** Weder Umsetzungsplan noch FINALIZE
sagen, wo das Paket im Betrieb liegt — sie regeln das *Wann* der Integration präzise
(§3.2: Fragment in Phase 6, optionale Hooks frühestens danach), aber kein `npm install`,
kein Kopierziel. Nur der Rückbau in Phase 7 nennt beiläufig `~/.claude/token-stack/state/`.

**Festgelegt:** Betriebsort ist `~/.claude/token-stack/`. Dort liegt alles
Token-Stack-Eigene gebündelt — Code *und* Laufzeitzustand. Wo Claude Code einen eigenen
Standardordner hat, wird der genutzt; alles andere kommt in dieses eine Verzeichnis.

Der Entwicklungsstand (`.claude-tweak/claude-code-token-stack/`) bleibt Arbeitsplatz und
Quelle der Wahrheit. Er ist als Betriebsort ungeeignet: ein Git-Arbeitsverzeichnis ändert
sich mit jedem Branch-Wechsel, und daran hinge dann ein Hook, der bei jedem Bash-Aufruf
feuert.

### Transfer

```bash
node scripts/deploy.mjs              # nach ~/.claude/token-stack/
node scripts/deploy.mjs --dry-run    # nur zeigen, was sich änderte
node scripts/deploy.mjs --target /pfad
```

Idempotent: ein zweiter Lauf ohne Änderung meldet `copied: 0`. Kopiert wird atomar
(daneben schreiben, dann umbenennen), ein Abbruch hinterlässt also keine halbe Datei.

**Laufzeitzustand wird nie überschrieben.** Am Betriebsort liegt der Zustand im selben
Verzeichnis wie der Code; ein Transfer, der stumpf spiegelt, würde eine laufende
Installation zurücksetzen — inklusive der Canary-Fähigkeitsdatei, deren Verlust den
Dispatcher nach ADR-005 in `shadow` zurückfallen lässt. Der Transfer listet solche
Dateien unter `protectedEntries` und lässt sie unangetastet. Dieselbe Fehlerklasse hatte
in Phase 3 `apply-manifest.py` getroffen, wo ein Wiederholungslauf die Arbeit der vorigen
Phase überschrieben hätte.

Was als Laufzeit gilt (geschlossene Liste in `deploy.mjs`, `checksums.mjs` und
`verify-package.mjs` — bei Änderung alle drei mitziehen):

| Pfad | Inhalt |
|---|---|
| `token-stack.json` | **Laufzeit-Config des Dispatchers** (u. a. `mode`) — siehe unten |
| `state/` | Dispatcher: Sessions, Recovery-Artefakte |
| `markers/` | Sitzungsmarker zwischen zwei Hook-Spawns |
| `nudge-budget/` | gemeinsames Nudge-Budget der optionalen Hooks |
| `read-state/`, `session-economy/` | Zustand der optionalen Hooks |
| `capabilities.json` | Canary-Fähigkeitsdatei (30-Tage-Ablauf) |
| `prefix-latest.json`, `prefix-snapshots.jsonl` | Prefix-Report und Metrikreihe |
| `fragment.json` | maschinenspezifisch, am Betriebsort erzeugt |
| `*.config.json` (Wurzel) | Nutzerkonfiguration der optionalen Hooks |

Der Verifier nimmt diese Pfade von der Manifestprüfung aus und weist sie unter
`runtime_entries` getrennt aus — sie verschwinden aus der Prüfung, nicht aus dem Blick.
Ohne diese Ausnahme wäre `npm run verify` am Betriebsort dauerhaft rot, sobald der Stack
einmal gelaufen ist.

### Nach einer Umbenennung: verwaiste Dateien von Hand entfernen

`deploy.mjs` kopiert, es spiegelt nicht — **es löscht nichts.** Wird im Entwicklungsstand
eine Datei umbenannt oder entfernt, bleibt der alte Name am Betriebsort liegen. Der
Transfer meldet ihn dann unter `orphanEntries` mit einem eigenen Warnblock:

```
VERWAISTE PAKETDATEIEN AM BETRIEBSORT (1):
  config/bash-dump-guard.config.json
```

**Folge, wenn man es übergeht:** `npm run verify` am Betriebsort meldet **Exit 1**. Der
Verifier prüft beidseitig — die Datei liegt dort, steht aber nicht mehr im Manifest. Der
Fehler sieht dann aus wie ein defektes Paket, obwohl nur ein Rest herumliegt.

```bash
node scripts/deploy.mjs                       # meldet Waisen namentlich
rm ~/.claude/token-stack/<gemeldeter/pfad>    # nach Prüfung, von Hand
cd ~/.claude/token-stack && npm run verify    # muss wieder Exit 0 liefern
```

Das Löschen bleibt bewusst Handarbeit (L-6): am Betriebsort liegen Code und
Nutzerzustand im selben Verzeichnis, und ein Skript, das dort selbständig entfernt, was
es nicht kennt, ist genau der Automatismus, den ADR-012 für `settings.json` untersagt.
Ein Tippfehler in einer Ausschlussliste würde sonst Laufzeitzustand kosten.

Erstmals aufgetreten bei D22 (Umbenennung von `config/bash-dump-guard.config.json` zu
`config/bash-pilot-reference.json`).

### Reihenfolge bei der Inbetriebnahme

1. `node scripts/deploy.mjs`
2. am Betriebsort: `npm test` und `npm run verify` — beide müssen Exit 0 liefern
3. `node bin/claudestack.mjs fragment > fragment.json` **am Betriebsort** (sonst trägt das
   Fragment den Entwicklungspfad; Abnahmebefund M-14)
4. `node scripts/smoke.mjs` — der Rauchtest, den AP-6.1 voraussetzt, ohne ihn zu definieren
5. Fragment **manuell und atomar** in `~/.claude/settings.json` übernehmen (ADR-012, kein
   Auto-Merge)
6. Claude Code neu starten, Canary **aus einer laufenden Sitzung** aufrufen
7. erst dann `mode: off` → `mode: shadow`

### Wo der Modus steht (Defekt D21)

Die Laufzeit-Config des Dispatchers ist **`~/.claude/token-stack/token-stack.json`**:

```json
{ "schemaVersion": 1, "mode": "shadow" }
```

`config/token-stack.default.json` im Paket ist nur die **Vorlage** — der Dispatcher liest
sie nie. Wer dort den Modus ändert, ändert nichts am laufenden Betrieb.

Der gebündelte Pfad kam erst bei der Inbetriebnahme hinzu: der Träger suchte die Config
unter `<configDir>/token-stack.json`, also *neben* dem Betriebsverzeichnis statt darin.
Aufgefallen ist das erst, als zum ersten Mal überhaupt eine Laufzeit-Config gebraucht
wurde — vorher lief alles auf dem eingebauten Default. Die vollständige Suchreihenfolge
steht in `docs/ARCHITECTURE.md` CTS-ARCH-007; der alte Pfad bleibt als Fallback gültig,
soll für neue Installationen aber nicht mehr verwendet werden.

### Rückbau (Phase 7 bei Nullergebnis)

Der gebündelte Betriebsort macht daraus wenige Schritte: Fragment aus
`~/.claude/settings.json` entfernen, `rm -rf ~/.claude/token-stack/`, env-Deckel der
Phase 1 einzeln revidieren. Das Paket bleibt im Entwicklungsstand als dokumentiertes
Experiment bestehen — negative Evidenz ist Evidenz.
