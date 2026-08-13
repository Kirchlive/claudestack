---
id: CTS-DOC-DEFEKTE-001
schema: claudestack.document/v1
document_type: defect_register
title: Defektregister
version: 2
status: accepted
language: de
last_reviewed: 2026-08-13
applies_to: claude-code-token-stack/v2
---

# Defektregister

_Ein Register für alle Quellen. D1–D7 stammen aus OPUS5, D8–D9 aus der Prüfung der
FINALIZE-Spezifikation, D10–D15 aus dieser Zusammenführung. G01–G10 sind die
Evidenzlücken aus GPT56s `06-incoming-reconciliation.md` — keine Codefehler, sondern
fehlende Nachweise, die nach L-6 sichtbar bleiben müssen._

**Regel für dieses Register:** Ein Eintrag verschwindet nicht, weil er unbequem ist.
Er wechselt den Status. `offen` und `bewusst offen` sind gültige Endzustände.

---

## Teil 1 — Defekte an Artefakten

| ID | Artefakt | Befund | Nachweis | Status |
|---|---|---|---|---|
| **D1** | `prefix-budget.mjs` (OPUS5) | Gesetz-I-Kollisionen wurden auf dem **rohen Matcher-String** gruppiert. `"Bash"` und `"Bash\|Read\|Grep\|Glob\|Agent\|Task"` galten als zwei verschiedene Flächen. Auf der realen Konfiguration meldete das Werkzeug **3 Befunde statt 8** und **2 statt 5** Handler auf `PreToolUse:Bash` — genau die Kollision, die es finden soll. | `HOME=<real> node prefix-budget.mjs --report` vorher/nachher; 7/7 Selbsttests | **behoben in der OPUS-Fassung** — Matcher wird in die Menge der Tools aufgelöst, auf die er feuert; Wildcards zählen auf jede konkrete Fläche mit. Portierung in die K3-Trägerfassung: AP-4.3. |
| **D2** | `test-guard-all.mjs` | Hartkodierte Pfade nach `/Users/rob/.claude/hooks/`. Fehlt der Pfad, liefert `spawnSync` kein stdout, `decision()` fällt auf `""` und die Suite wertet das als „durch". **Zehn Testfälle bestehen dadurch aus dem falschen Grund.** Derselbe Musterfehler wie in `ladder-ab.mjs`, wo `CONFIG` auf einen nicht existenten Pfad zeigte und Arm A still gar nichts umschaltete. | Rohlauf 33 FEHLGESCHLAGEN → Pfade korrigiert 16 → plus gültige `settings.json` ALLE BESTANDEN | **teilweise behoben** — die Pfade sind in `repos_v2` bereits korrigiert (siehe D9). Der Fail-silent-Rest in der Hilfsfunktion `t()` besteht fort: der Spawn-Status wird nie geprüft. Behebung in AP-4.5. |
| **D3** | `GPT55SOL_PRO/` (Vorgängerpaket) | Shellskripte als Git-Modus `100644` statt `100755`; `SHA256SUMS.txt` und `package-manifest.json` erwarten `README.md`, ausgeliefert ist `README_gpt.md`. | `sha256sum -c` 33/34; `verify-package.sh` bricht an Zeile 77 ab | **offen** — betrifft das Vorgängerpaket. Im neuen Paket durch Dateimodus- und Manifestprüfung abgefangen; `ab-harness.sh` brauchte in dieser Umsetzung ebenfalls `chmod +x` (dasselbe Muster). |
| **D4** | `ladder-config.json` | Drift: `hooks/` steht auf `enabled: false`, die Repo-Kopie auf `true`. Sonst byteidentisch. | `diff` über normalisiertes JSON, genau ein Feld | **bewusst offen** — der Live-Zustand ist die Entscheidung aus Wave 02-1. Zu dokumentieren, nicht anzugleichen. Die Ladder wird ohnehin nicht übernommen (L-9). |
| **D5** | KIMI-Guard-Referenzdesign | Gibt bei Built-in-Bash einen **String** als `updatedToolOutput` zurück. Die Objektform `{stdout, stderr, interrupted, isImage, exitCode}` ist Pflicht; eine String-Ersetzung wird ignoriert. | Selbsttests des funktionsgeprüften Guards prüfen auf `updatedToolOutput.stdout` | **erledigt durch Ausschluss** — Code nicht übernommen. Die Lehre ist als String-Normalisierung in den Dispatcher eingegangen (AP-4.1, Eingriff 3). |
| **D6** | Dateiname `bash-dump-guard.mjs` | **Drei verschiedene Artefakte tragen denselben Namen.** `hooks/bash-dump-guard.mjs` (234 Zeilen) ist ein **Deny-Gate** und emittiert `permissionDecision: "deny"` auf `PreToolUse`. `GPT55SOL_PRO/bash-dump-guard.mjs` (1.064 Zeilen) ist ein **Outputreducer** und emittiert `updatedToolOutput` auf `PostToolUse`. Eine dritte v3.1-Variante wurde bewertet, aber nie ausgeliefert. Drei Bewertungsmodelle haben drei verschiedene Dateien unter einem Namen bewertet — **ein Teil der Bash-Owner-Divergenz war eine Namensverwechslung, keine Sachfrage.** | `grep hookEventName` in beiden Dateien; die Registrierung in `settings.json` zeigt auf das Deny-Gate und ist damit korrekt | **entschärft** — im Dispatcher heißen die Stufen `bash-deny-gate` und `bash-output-reducer`; der Dateiname wird im Paket nicht mehr vergeben. |
| **D7** | eigene 1-bis-100-Rubrik | Achse D vergab **20 von 100 Punkten für die Anzahl der Datensätze, die ein Repo empfehlen** — ein Zirkelschluss, der Popularität im eigenen Korpus als Evidenz verbucht. Zugleich fehlte jede Achse für die Frage, ob ein Werkzeug tut, was es behauptet. Belegfall: `claude-code-cache-fix` hat mit 87 offenen Issues je 1.000 Sternen die schlechteste Fehlerbilanz des Feldes und kam trotzdem auf 75. | eigene Nachrechnung; unabhängig von allen drei Bewertungsmodellen bestätigt | **behoben** — D ist jetzt geprüfte Korrektheit (0–20) aus `scripts/judgments.json`. Ohne ausdrückliche Prüfung: 0 Punkte, und die Absenz wird seit AP-5.4 getrennt ausgewiesen statt als Strafe verrechnet. |
| **D8** | `CLAUDESTACK-FINALIZE.md`, Bilanzzeile C.2 | **Die Bilanz widerspricht den eigenen Tabellen.** Der Fließtext nennt „24 unverändert, 44 angepasst, 34 archiviert, 11 verworfen, 3 neu"; die Auszählung der C.2-Tabellen ergibt **11 / 54 / 34 / 13**. Dieselbe Ungenauigkeit trägt C.1 („config/ 6 Dateien", „docs/ 12") gegen die Tabellenwerte 7 bzw. 11. | eigene Emoji-Auszählung der C.2-Tabellen; in Phase 2 maschinell bestätigt: **11 / 54 / 34 / 12** Dateien plus 1 neu erzeugte (`SHA256SUMS.txt`) = 112 | **behoben in der Umsetzung** — Plan und Inventur folgen den Tabellen. Die Spezifikation selbst bleibt unkorrigiert; wer sie liest, liest die falsche Bilanz. |
| **D9** | `CLAUDESTACK-FINALIZE.md` C.2.2, Notiz zu `test-guard-all.mjs` | Die Auflage „hartkodierte `/Users/rob/`-Pfade entfernen" ist für den `repos_v2`-Stand **überholt** — die Pfade sind dort bereits behoben. Wer die Notiz abarbeitet, sucht einen Defekt, den es nicht mehr gibt, und übersieht den verbliebenen. | Quelltextprüfung von `hooks/tests/test-guard-all.mjs` in `repos_v2` | **korrigiert** — der Restbefund ist nicht der Pfad, sondern der ungeprüfte Spawn-Status (siehe D2). |
| **D10** | `validate/03-measure-token-surfaces.py` | **Nicht unverändert lauffähig, entgegen §5.1 des Plans („✅ lauffähig, kein Archiv").** Die Funktion `selected()` filtert auf die alte Repo-Struktur (`GPT56SOL_ULTRA_Validation/`, `OPUS5_MAX_Validation/`, `K3SWARM_MAX_Validation/`, `Squeez-RTK-Ladder/`). Im vorliegenden Checkout trifft kein Pfad zu → null Records → `IndexError` an `records[0]` (Zeile 117), noch bevor eine Datei geschrieben wird. | Quelltextanalyse; in Phase 0 und Phase 2 unabhängig voneinander bestätigt | **offen** — Pfadfilter beim Umzug nach `scripts/` an die Zielstruktur anpassen. Die Phase-0-Messung wurde ersatzweise direkt mit `o200k_base` erhoben. |
| **D11** | `scripts/verify-package.mjs:36` | Führt `validate/06-incoming-reconciliation.md` als **Pflichtdatei**. Die Datei liegt nach AP-3.3 unter `evidence/gpt56/`, ein Verzeichnis `validate/` existiert im Zielpaket nicht mehr. **Der Verifier schlägt im aktuellen Zustand fehl.** Zusätzlich ist `expectedTestCount = 32` hartkodiert (Zeile 11) und wächst mit den neuen Testfällen aus AP-4.1 nicht mit. | Pfadabgleich nach dem Umzug; bewusst nicht in Phase 3 repariert, weil Code zu Phase 4 gehört | **behoben** in AP-4.4 — `verify-package.mjs` führt den Pfad `evidence/gpt56/06-incoming-reconciliation.md`, `expectedTestCount` steht auf 39 und die Pflichtdateiliste wurde vollständig gegen den Baum geprüft (24 → 50 Einträge). `npm run verify` Exit 0. |
| **D12** | Prüflogik für verworfene Dateien | Eine Prüfung „ist eine verworfene Datei ins Zielpaket gelangt?" per **Basename oder Hash** erzeugt drei Falsch-Positive: `DEFEKTE.md`, `KONZEPT-v5.md` und `judgments.json` liegen in OPUS5 doppelt, und die verworfene `validate/`-Kopie ist **byteidentisch** zur übernommenen Wurzelkopie. Nur der Quellpfad unterscheidet sie. | SHA-256-Inventur Phase 2; in Phase 3 bei der Abnahme reproduziert | **dokumentiert** — jede solche Prüfung in Phase 4/5 muss über den Quellpfad gehen, nicht über Inhalt oder Name. |
| **D13** | Akzeptanzgate P3 | **Das Gate enthielt kein Kriterium für `package.json`**, und die Abdeckungsprüfung verglich nur Pfadmengen, keine Inhalte. Dadurch blieb unbemerkt, dass AP-3.1 (Version `2.0.0`, `files`-Feld) nicht ausgeführt war: das Manifest-Skript wertete die bereits bearbeitete Datei als „noch zu kopieren" und überschrieb sie mit der Quellfassung. Der Arbeitsbericht beschrieb die Absicht, nicht das Ergebnis. | `sha256sum` von Ziel und Quelle identisch (`f1b72dc5…`) bei der Gate-Nachprüfung | **behoben** — Kriterium ins Gate ergänzt; `apply-manifest.py` überschreibt abweichende Zieldateien nicht mehr, sondern meldet sie als geschützt. Ohne diesen Schutz hätte jeder Wiederholungslauf die Arbeit der Phasen 3–5 zerstört. |
| **D14** | Ist-Erhebung Phase 0 / `~/.bashrc:163` | **Die Erhebung des env-Ist-Zustands war unvollständig.** Sie las nur `~/.claude/settings.json` und führte `ENABLE_TOOL_SEARCH` als ungesetzt. Tatsächlich exportiert `~/.bashrc:163` die Variable auf `true`; sie wirkt, weil Claude Code als Kindprozess der Shell startet. Eine Baseline, die nur die Settings-Datei kennt, beschreibt nicht die Umgebung, in der gemessen wird. | `grep -rn ENABLE_TOOL_SEARCH ~/.bashrc` sowie Auslesen der Prozessumgebung in Login- und interaktiver Shell | **behoben** — `config/settings.patch.json` führt Settings- und Shell-Umgebung jetzt getrennt. **Für Phase 6 verbindlich:** vor jeder Messung beide Quellen erheben. |
| **D15** | `docs/DEFEKTE.md` (Vorfassung) | Tabellenformatdefekt: die Zeilen D5 und D6 waren zu einer Zeile verschmolzen (`… zurück in die Objektform. \|\| **D6** \|`). D6 wurde in keinem Markdown-Renderer als eigene Zeile dargestellt — **der Defekt mit der weitreichendsten Erkenntnis war der unsichtbarste.** | Rendering-Prüfung beim Zusammenführen | **behoben** — Tabelle neu gesetzt. |

| **D16** | `waves/WAVE-INDEX.md` (Wave 02-1) | **Der eigene Fahrplan wies eine Gesetz-I-Verletzung an.** Wave 02-1 verlangte wörtlich, `bash-owner-dispatch.mjs` als „einzigen registrierten Handler auf `PreToolUse:Bash` und `PostToolUse:Bash`" einzurichten — den nach ADR-015 verworfenen dritten Dispatcher, der nur noch unter `evidence/opus5/` liegt und nicht lauffähig ist. Verschärfend: `docs/ROLLOUT.md` erklärt bei Widerspruch den Wave-Index für maßgeblich, die falsche Anweisung war also die autoritative. Der Code war korrekt (`updatedToolOutput` nur in `src/stack.mjs`); **die Verletzung saß allein in der Anweisungsebene** und wäre bei jeder reinen Codeprüfung durchgerutscht. Dazu fünf weitere Altlasten derselben Datei: `scripts/verify-stack.mjs`, `rules/context-surface-owners.yaml`, `hooks/prefix-budget.mjs`, „sieben Werte", „die fünf Defekte". | Unabhängige Abnahmeprüfung gegen C.1/C.2/C.3 (Befunde M-1/M-2); Pfadprüfung im Zielbaum | **behoben** — Fahrplan vollständig auf den Zielbaum übersetzt, Wave 02-1 auf `src/stack.mjs` und den Shim umgeschrieben, Korrektur im Dokument sichtbar vermerkt. |
| **D17** | `scripts/verify-package.mjs`, ADR-017 | **Eine zugesagte Kontrolle existierte nicht.** C.3.11 ① und ADR-017 versprechen, der Verifier lehne eine Evidenzzeile ab, deren `source_model` dem Träger entspricht. Der Verifier erwähnte `judgments.json` und `scores100-v51.json` an keiner Stelle; beide standen nicht einmal in der Pflichtdateiliste. Die Daten waren sauber aufbereitet — geprüft wurden sie nie. Dieselbe Klasse wie D13: ein Bericht über eine Kontrolle ist keine Kontrolle. | Abnahmebefund M-4; Volltextsuche nach den Dateinamen im Verifier | **behoben** — Sperre implementiert: beide Dateien sind Pflichtgegenstände, `source_model` und `self_assessment_risk` müssen deckungsgleich sein, keine Flächenbesetzung darf sich auf eine markierte Zeile stützen, und die Abdeckungsspalte wird erzwungen. |
| **D18** | `hooks/optional/bash-size-feedback.mjs`, `ctx-used-marker.mjs` | **Das Paket bewarb ein Werkzeug, das seine eigene Spezifikation sperrt.** Der Nudge empfahl namentlich `mcp__plugin_context-mode_context-mode__ctx_execute`; `context-mode` steht unter Elastic License 2.0 und ist nach L-8 für dienstliche Nutzung gesperrt, die Fläche „externe Massendaten" bleibt ausdrücklich unbesetzt. `ctx-used-marker.mjs` existiert überhaupt nur, um die Benutzung dieses Werkzeugs zu markieren. Der Widerspruch stammt aus der Spezifikation selbst, die beide Dateien vorsah. | Abnahmebefunde M-8/M-9 | **behoben** — Werkzeugname nicht mehr fest verdrahtet, sondern über `CLAUDESTACK_SANDBOX_TOOL` konfigurierbar; ohne Konfiguration bleibt der Hinweis werkzeugneutral und lizenzfrei. `ctx-used-marker.mjs` trägt seinen Status im Kopf. In `REPO-MATRIX.md` ersetzt das neue Label `blocked` das widersprüchliche `conditional` mit Aktivierungsgate. |
| **D19** | `docs/ROLLOUT.md`, `waves/WAVE-INDEX.md` | Beide Fahrpläne verwiesen auf `MASTERPLAN.md` und `KONZEPT.md` als Bezugsdokumente. Keine der beiden Dateien existiert im Paket — die Originale liegen als Archiv unter `evidence/`. Für einen Empfänger des Pakets sind es tote Verweise. | Prüfung des Zielbaums gegen die Verweise | **behoben** — Verweise auf `waves/WAVE-STATE.md`, `docs/MESSPLAN.md` und `docs/REPO-MATRIX.md` umgestellt, Übersetzungstabelle in ROLLOUT ergänzt. |
| **D20** | `UMSETZUNGSPLAN-claude-code-integration.md` §3.2, `CLAUDESTACK-FINALIZE.md` Teil C/D | Der Plan regelt das *Wann* der Integration präzise (Fragment in Phase 6, optionale Hooks danach, Rückbau in Phase 7), sagt aber nirgends, **wo das Paket im Betrieb liegt**: kein `npm install`, kein Kopierziel, keine Trennung von Entwicklungs- und Betriebsstand. Nur der Rückbau nennt beiläufig `~/.claude/token-stack/state/`. Praktische Folge: das erzeugte Fragment trug den Entwicklungspfad (Abnahmebefund M-14), und ein Verschieben des Pakets hätte den registrierten Hook ins Leere zeigen lassen. | Volltextsuche über beide Dokumente nach Installations-, Ablage- und Kopieranweisungen | **behoben** — Betriebsort `~/.claude/token-stack/` festgelegt (Nutzerentscheidung: alles Token-Stack-Eigene gebündelt), `scripts/deploy.mjs` als idempotenter Transfer, `docs/MIGRATION.md` CTS-MIG-011. |
| **D21** | `src/stack.mjs` `loadConfig` (Suchpfade) | Die Config-Suchpfade des Trägers waren nicht auf ein gebündeltes Betriebsverzeichnis ausgelegt: gesucht wurde unter `<configDir>/token-stack.json`, also **neben** `~/.claude/token-stack/` statt darin. Wer die Laufzeit-Config an den erwarteten Ort legt — in das Verzeichnis, in dem Code, State und Fähigkeitsdatei bereits liegen —, wird nicht gelesen; der Dispatcher läuft still auf dem eingebauten Default weiter. Aufgefallen erst bei der Inbetriebnahme (Umschalten auf `shadow`), weil vorher nie eine Laufzeit-Config existierte und der Default `off` unauffällig war. | `loadConfig` Kandidatenliste gegen den Betriebsort gehalten; `~/.claude/token-stack.json` existierte nicht, `~/.claude/token-stack/token-stack.json` wurde nicht gesucht | **behoben** — `<configDir>/token-stack/token-stack.json` als vorrangiger Suchort ergänzt, alter Pfad als veralteter Fallback belassen (`docs/ARCHITECTURE.md` CTS-ARCH-007); vier Tests decken Fund, Vorrang und Übersteuerung ab; `token-stack.json` in die Laufzeitliste aller drei Skripte aufgenommen. |

### Baumdefekte (aufgelöst)

| ID | Artefakt | Befund | Nachweis | Status |
|---|---|---|---|---|
| **B1** | `opus5_claude-token-stack/` | Drei Dateien doppelt abgelegt: `DEFEKTE.md`, `judgments.json`, `KONZEPT-v5.md` je einmal in der Wurzel und einmal unter `validate/` — rund 55 KB Dublette. Dasselbe Muster, das der Ladder-Audit als `F02` gerügt hat. Offen blieb, welche Kopie maßgeblich ist. | SHA-256: drei Hash-Gruppen, alle paketintern, byteidentisch | **aufgelöst (AP-3.2)** — Wurzelkopien sind maßgeblich, `validate/`-Kopien nicht übernommen. |
| **B2** | `opus5_claude-token-stack/` | Ein leeres Verzeichnis namens `{waves,rules,hooks,scripts,config}` — nicht expandierte Brace-Expansion aus `mkdir -p "{...}"` oder einer Shell ohne Brace-Support. | `TREE.txt` Zeile 112 | **historisch/beobachtet** — im GitHub-Checkout nicht mehr vorhanden, nur durch `TREE.txt` bezeugt. Nicht inventarisierbar, deshalb in Phase 2 nicht gezählt. |

---

## Teil 2 — Offene Evidenzlücken (GPT56, `06-incoming-reconciliation.md` §8)

Diese Einträge sind keine Fehler, sondern **fehlende Nachweise**. Sie stehen hier, weil ein
fehlender Nachweis nach L-6 ein Befund ist und kein Grund, weiterzugehen.

| ID | Fehlend | Wirkung | Abschlussgate | Status |
|---|---|---|---|---|
| **G01** | lokale gepaarte E2E-Aufgaben | keine Stack-Prozentersparnis belegbar | mindestens 10 vollständige Paare | **offen** — Phase 6 |
| **G02** | Anthropic-exakte Tokenzählung | `o200k_base` ist nur Proxy | Provider-`count_tokens` oder Usagefelder | **offen** — betrifft auch die Phase-0-Messung dieser Umsetzung |
| **G03** | OPUS-Rohabrufe und Hashes | Repo-Metadaten nur Snapshotclaim | versioniertes Abrufmanifest | **offen** |
| **G04** | K3 ausführbares Revisionspaket, Rohlogs des v3.1-Guards | Suite- und Messclaims nicht lokal reproduzierbar | vollständiges, hashfixiertes Paket | **offen** — Grundlage von R-3 |
| **G05** | Meta-A4-Rohmatrix im Dokument | Formel muss inferiert werden | Repo × Modell × Achse als JSON | **offen** |
| **G06** | Toonify: Code, Issues, Benchmarkrohwerte, E2E | kein Runtime-Score | isolierter Canary mit exaktem `v0.8.2`-Pin | **offen** — Re-Entry-Bedingung, siehe ADR-014 |
| **G07** | Plugin-Prefix der Zielmaschine | Startup-Kosten unbekannt | `/context`-Baseline vorher/nachher | **teilweise geschlossen** — auf dieser Maschine sind null Plugins aktiviert und es existiert keine Root-`CLAUDE.md`; die dateibasierten Flächen kosten 280 Token. Die `/context`-Gesamtbaseline steht weiter aus. |
| **G08** | produktiver Claude-Canary | Dispatcher nicht promoted | Quality-, Recovery-, Permission- und Kostengates | **offen** — Phase 6/7 |
| **G09** | Zielmaschinen-Plugins, Rules, Memory-Fences | Prefix, Privacy, Lizenz unbekannt | `/context`-Dedupe und Policy-Audit | **teilweise geschlossen** — Plugin- und Hook-Inventur liegt vor (Phase 0); die Lizenzfrage zu `context-mode` (Elastic 2.0, npm-global installiert, nicht eingebunden) bleibt offen. |
| **G10** | OPUS-Revisionsartefakt mit PR-Deckel und 15er-Kreuztabelle | „97 zu 65" nicht reproduzierbar | Formel, Rohwerte und hashfixierte Ausgabe | **offen** |

---

## Was aus diesen Defekten als Regel folgt

**Vier der fünfzehn sind derselbe Fehler.** `ladder-ab.mjs`, `test-guard-all.mjs`, das
Manifest-Skript aus D13 und der ungeprüfte Spawn-Status liefen alle weiter, als ihr
Prüfgegenstand fehlte oder abwich, und lieferten Zahlen beziehungsweise Berichte, die wie
Ergebnisse aussahen. Im Ladder-Fall wären beide A/B-Arme mit aktiver Leiter gelaufen — der
Vergleich wäre wertlos gewesen, ohne dass es jemand gemerkt hätte.

> **Regel für jedes Skript in diesem Paket:** Ein Harness, dessen Prüfgegenstand fehlt,
> **muss scheitern**. Nie „ok", nie „übersprungen". Ein Skript, das eine Zieldatei
> vorfindet, die von der Quelle abweicht, **überschreibt sie nicht** — es meldet sie.
> Fail-open bleibt allein dem Laufzeit-Dispatcher vorbehalten, wo Blockieren die
> schlechtere Wahl wäre.

**Die zweite Lehre steckt in D6 und D7 gemeinsam:** beide sind keine Codefehler, sondern
Benennungsfehler. Einmal trägt eine Datei einen Namen, der mehr verspricht als der Code tut;
einmal trägt eine Bewertungsachse einen Namen („Evidenz"), der etwas anderes misst als das,
was sie zählt. Beide fielen erst beim Abgleich mit einer zweiten Quelle auf, nicht beim Lesen
des eigenen Artefakts.

**Die dritte steckt in D1:** ein Prüfwerkzeug, das die eigene Regel nur auf dem einfachsten
Fall durchsetzt, erzeugt falsche Sicherheit. Der Alternations-Matcher ist kein Sonderfall,
sondern die übliche Schreibweise für Hooks, die mehrere Tools abdecken.

**Die vierte ist neu und stammt aus D13 und D14:** ein Bericht über getane Arbeit ist kein
Nachweis getaner Arbeit. In beiden Fällen war die Absicht korrekt beschrieben und das
Ergebnis ein anderes — einmal, weil ein späterer Lauf die Änderung zurücknahm, einmal, weil
die Erhebung eine Quelle nicht kannte. Beide wurden nur gefunden, weil jemand die Datei
selbst gelesen hat statt den Bericht darüber. D17 gehört in dieselbe Klasse: dort war die
Kontrolle nicht nur unausgeführt, sondern nie geschrieben — und zwei Dokumente behaupteten
trotzdem, es gebe sie.

**Die fünfte stammt aus D16 und ist die unbequemste:** *Gesetz I lässt sich in der
Dokumentation verletzen, ohne eine Zeile Code zu berühren.* Der Wave-Index wies an, den
verworfenen Dispatcher zu registrieren; jede Prüfung des Codes hätte das Paket für sauber
erklärt, weil es sauber war. Wer nur prüft, was das Programm tut, übersieht, was die
Anleitung anordnet. Jede Fläche, die Regeln kennt, braucht deshalb auch eine Prüfung ihrer
Anweisungstexte — und beim Übersetzen eines geerbten Fahrplans ist der stehen gebliebene
Rest gefährlicher als der offensichtlich fehlende Teil: die vier korrigierten Waves sahen
aus wie geprüft, weil zwei andere korrigiert worden waren.
