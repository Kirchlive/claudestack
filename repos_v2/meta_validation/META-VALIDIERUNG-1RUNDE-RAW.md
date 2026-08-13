---
errata_nachtrag: META-VALIDIERUNG-3RUNDE.md §1 - bestaetigte Fehler in diesem Dokument, extern gefunden und nachgerechnet
doc_id: META-VALIDIERUNG-3WEGE
version: 1.2
generated: 2026-08-13
supersedes: 1.1, 1.0
phase: 1b
scope: Validierung der drei 4-Wege-Vergleichsdokumente gegeneinander, unter Berücksichtigung des vollständigen Repo-Stands, der allen drei erzeugenden Modellen vorlag.
geprueft_extern:
  - CVE-2026-33068 (Advisory-Datenbanken)
  - Reinjektionsmechanik (anthropics/claude-code Issues)
  - settings.json (Repo-Stand, vollständig gelesen)
  - CLAUDE.md (Repo-Stand, vollständig gelesen)
nicht_gelesen: Squeez-RTK-Ladder/, hooks/ - Verweise darauf stammen aus dem Projektstand, nicht aus einer Neulektüre in dieser Runde
umfang: 98 Einzelpunkte, 38 Teilbereiche, drei Aggregationsstufen - vollstaendig nachgerechnet
befund_kurz: Dokument A rechnet korrekt, B und C nicht. C §4 ist gegen die reale settings.json geprüft und stimmt exakt - dabei fielen fünf Befunde an, die in keinem der drei Dokumente stehen.
---

# Meta-Validierung der drei Vergleichsdokumente

## Errata und Versionsstand

Drei Aussagen in v1.0 waren falsch oder falsch gerahmt. Sie beruhten auf der Annahme, die drei Vergleichsdokumente hätten nur die vier Datensätze gekannt. Tatsächlich lag allen dreien der vollständige Repo-Stand vor: `Squeez-RTK-Ladder/`, `hooks/`, `CLAUDE.md` und `settings.json`.

| # | v1.0 sagte | korrekt ist |
|---|---|---|
| E1 | „A und B haben keine einzige Zelle, die fragt, wie der Rechner aussieht" — als blinder Fleck gewertet | Der Step-1-Auftrag lautete ausdrücklich, die **vier Datensätze** abzugleichen. A und B haben sich daran gehalten; beide erklären das im Frontmatter. **C hat den Auftragsrahmen verlassen** und Phase-2-Material vorgezogen. Das ist kein Kompetenz-, sondern ein Disziplinunterschied — und C hat das Wertvollste dabei mitgebracht. Siehe §7.1. |
| E2 | „OPUS ist der einzige, der etwas mitbringt, das nicht aus einer README stammt" | Die `[GEMESSEN]`-Werte stammen aus der Squeez-RTK-Ladder-Arbeit und lagen **im selben Repo für alle** bereit. OPUS' Vorsprung ist nicht privilegierter Zugang, sondern Nutzung. Das macht den Befund schärfer, nicht milder. Siehe §7.2. |
| E3 | „Der nächste Schritt ist keine 1-bis-100-Zweitvalidierung" | Die Zweitvalidierung ist Step 3 des Auftrags und kommt dort nach dem Einlesen von Ladder und Konfiguration. Die Reihenfolge stimmt. Mein Einwand reduziert sich auf eine Ordnung **innerhalb** von Step 3. Siehe §9. |

**Neu in 1.2:** die vollständige Punkt- und Teilbereichsübersicht mit Durchschnittswerten auf drei Aggregationsstufen (§11–§16). Sie ändert keinen Befund aus 1.1, sondern bestätigt die Rangfolge über drei unabhängige Aggregationswege und legt fünf Muster offen, die auf Dokumentebene unsichtbar bleiben — darunter die Strengedifferenz von 0,53 Notenpunkten zwischen den Dokumenten (§11.2) und die Tatsache, dass K3SWARM in nur 2 von 38 Teilbereichen führt (§11.3).

Unverändert gültig: die gesamte Rechenprüfung (§1–§4), der Befund zur Selbstbezüglichkeit (§5.1), der 4,88-Ausreißer (§5.2), die Absenz-Konvention (§5.3) und beide externen Prüfungen (§6).

---

## 0. Spaltenmapping

| Datensatz | in A | in B | in C |
|---|---|---|---|
| GPT56SOL_ULTRA_Validation | `GPT` | `GPT56` | `GPT56` |
| OPUS5_MAX_Validation | `OPUS` | `OPUS_V4` | `OURS` |
| K3SWARM_MAX_Validation | `K3` | `K3` | `K3SW` |
| KIMI_AGENT | `KIMI` | `KIMI` | `KIMI` |

Dokument A = Crosswalk D01–D32 · B = Themen-Abgleich 1–32 · C = VERGLEICH-4WEGE VP-01–VP-34.

---

## 1. Rechenprüfung

Jede Zelle einzeln nachaddiert. Wenn die Summen nicht stimmen, ist die Rangfolge Zufall.

### 1.1 Dokument A — sauber

| Spalte | 5er | 4er | 3er | 1er | berechnet | angegeben | Ø |
|---|---:|---:|---:|---:|---:|---:|---:|
| GPT | 29 | 2 | 1 | 0 | **156** | 156 | 4,88 ✓ |
| OPUS | 24 | 4 | 4 | 0 | **148** | 148 | 4,63 ✓ |
| K3 | 4 | 21 | 7 | 0 | **125** | 125 | 3,91 ✓ |
| KIMI | 16 | 12 | 1 | 3 | **134** | 134 | 4,19 ✓ |

Alle vier Summen und Mittelwerte stimmen. A ist das einzige Aggregat, das man ohne Nachrechnen übernehmen kann.

### 1.2 Dokument B — vier falsche Summen

| Spalte | berechnet | angegeben | Differenz |
|---|---:|---:|---:|
| OPUS_V4 | **144** | 142 | −2 |
| GPT56 | **130** | 127 | −3 |
| K3 | **107** | 103 | −4 |
| KIMI | **111** | 109 | −2 |

Alle vier zu niedrig, aber ungleichmäßig — nach Handaddition oder nachträglicher Zelländerung ohne Neuberechnung. **Rangfolge bleibt** (OPUS_V4 > GPT56 > KIMI > K3), die Zahlen selbst sind nicht zitierfähig.

Zweiter Fehler: die Kopfzeile lautet „Summe (max 160)" für alle vier Spalten. KIMI hat ein `n.v.`, sein realer Nenner ist 155.

### 1.3 Dokument C — vier falsche Summen, falsche Zählungen, gekippte Rangfolge

| Spalte | bewertet ist/angeg. | n/a ist/angeg. | 5er ist/angeg. | Summe ist/angeg. | Ø ist/angeg. |
|---|---|---|---|---|---|
| GPT56 | 34 / 33 | 0 / 1 | 25 / 22 | **157** / 149 | **4,62** / 4,52 |
| K3SW | 33 / 32 | 1 / 2 | 11 / 10 | **136** / 128 | **4,12** / 4,00 |
| OURS | 34 / 34 | 0 / 0 | 17 / 14 | **143** / 135 | **4,21** / 3,97 |
| KIMI | 27 / 28 | 7 / 6 | 10 / 9 | **110** / 116 | **4,07** / 4,14 |

Grundlage ist der maschinenlesbare TSV-Block am Ende von C. Dieser stimmt Zelle für Zelle mit den Fließtexttabellen überein — die Punktvergabe ist konsistent, nur das Aggregat nicht.

Drei der vier Summen weichen um **exakt 8** ab, die vierte um −6. Gleichmäßiger Versatz bei drei Spalten spricht gegen Additionsfehler und für Versionsdrift: das Aggregat wurde über einen früheren Stand gerechnet. Das passt zu §7.1 — C arbeitet über mehrere Phasen hinweg und hat die Zusammenfassung dabei nicht nachgezogen.

**Die Konsequenz ist nicht kosmetisch:**

| Rangfolge in C | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| wie veröffentlicht | GPT56 4,52 | KIMI 4,14 | K3SW 4,00 | **OURS 3,97** |
| korrigiert | GPT56 4,62 | **OURS 4,21** | K3SW 4,12 | KIMI 4,07 |

OURS wandert vom letzten auf den zweiten Platz.

### 1.4 Prosa gegen eigene Daten

- **C §2:** „KIMI hat den höchsten Schnitt unter den bewerteten Punkten." Schon nach C's eigenen Zahlen falsch (GPT56 4,52 > KIMI 4,14). Nach Korrektur ist KIMI Letzter.
- **B, Spalte „Beste Quelle":** vollständig geprüft, in allen 32 Zeilen konsistent. Diese Spalte ist verlässlich, die Summenzeile nicht.
- **A §3:** bezeichnet die Mittelwerte selbst als „reine Orientierung". Methodisch korrekt — und trotzdem ein Problem, siehe §5.3.

---

## 2. Das Nennerproblem

Alle drei predigen Nennerdisziplin — A als eigenen Record (D02), OPUS mit „7 Nenner-Gründen", KIMI mit expliziter Nennerregel. **Alle drei verletzen sie im eigenen Aggregat.**

| Dokument | Absenz-Konvention | Wirkung |
|---|---|---|
| A | `not_present` → Score **1** | Abdeckungslücke wird als Qualitätsurteil verbucht |
| B | `n.v.` ausgeschlossen, Nenner bleibt 160 | KIMI wird gegen einen Nenner gerechnet, den es nicht bedienen konnte |
| C | `n/a` ausgeschlossen, Nenner angepasst | sauberste Lösung — dann aber Rohsummen über Nenner 34/33/34/27 nebeneinander |

Rechnet man in A KIMIs drei `not_present` als n/a heraus, steigt KIMI von 83,8 % auf **90,3 %** — 6,5 Prozentpunkte allein aus einer Zählregel.

---

## 3. Durchschnitt

Normiert auf „Prozent der erreichbaren Punkte in den bewerteten Zellen", mit korrigierten Summen.

| Datensatz | A | B | C | **Ø** | Ø auf 1–5 | Streuung |
|---|---:|---:|---:|---:|---:|---:|
| GPT56 | 97,5 % | 81,3 % | 92,4 % | **90,4 %** | **4,52** | 16,2 pp |
| OPUS5_MAX | 92,5 % | 90,0 % | 84,1 % | **88,9 %** | **4,45** | 8,4 pp |
| KIMI | 83,8 % | 71,6 % | 81,5 % | **79,0 %** | **3,95** | 12,2 pp |
| K3SWARM | 78,1 % | 66,9 % | 82,4 % | **75,8 %** | **3,79** | 15,5 pp |

Harmonisiert man die Absenz-Konvention, steigt nur KIMI auf **81,1 %** (4,06) und bleibt Dritter. Der Rang ist gegen die Konvention robust.

Zum Vergleich der ungerechnete Durchschnitt über die veröffentlichten Mittelwerte: GPT 4,46 / OPUS 4,35 / KIMI 3,91 / K3 3,71. Die Korrektur ändert Beträge bis 0,24, die Reihenfolge nicht.

### 3.1 Rangfolge-Stabilität

| Dokument | 1. | 2. | 3. | 4. |
|---|---|---|---|---|
| A | GPT | OPUS | KIMI | K3 |
| B | OPUS | GPT | KIMI | K3 |
| C (korrigiert) | GPT | OPUS | K3 | KIMI |
| C (veröffentlicht) | GPT | KIMI | K3 | OPUS |

Belastbar ist genau eine Aussage: **{GPT56, OPUS5_MAX} vor {KIMI, K3SWARM}.** Die Reihenfolge innerhalb der Paare ist aus diesem Material nicht entscheidbar — genau C's Konflikt K2, hier empirisch bestätigt.

### 3.2 Streuung

- **OPUS5_MAX: 8,4 pp**, nie unter 84 %. Der einzige Datensatz, dessen Bewertung kaum davon abhängt, wer das Gitter entworfen hat.
- **GPT56: 16,2 pp.** Gewinnt im Mittel, aber das Ergebnis hängt stark am Prüfer. Der niedrige Wert kommt von B — dem einzigen Dokument, das GPTs eigene Artefakte auf interne Konsistenz geprüft und einen konkreten Widerspruch gefunden hat (`NOASSERTION` in der Union-JSON gegen ELv2 im Markdown, bei context-mode).
- **KIMI und K3SWARM** liegen dazwischen, mit gegensätzlichem Muster: KIMI punktet in den Gittern, die Mechanismen und Ökonomie abfragen, K3SWARM in dem, das Lieferfähigkeit und Code abfragt.

---

## 4. Abweichungen Zelle für Zelle

Nur Fälle, in denen mindestens zwei Dokumente denselben Datensatz zum selben Gegenstand um ≥ 2 Punkte auseinander bewerten.

| Gegenstand | Datensatz | A | B | C | Spanne | Wer hat den Beleg |
|---|---|---:|---:|---:|---:|---|
| Explizite Absagen / Watchlist | OPUS | 5 | 5 | **2** | **3** | C — Selbstauskunft „keine eigene Absageliste, aus v3 übernommen". A und B zählen Lizenz-Fences und 60-Tage-Regel mit. |
| Native Bash-Limits / Env-Deckel | KIMI | — | **2** | **5** | **3** | Reines Zuschnitt-Artefakt: B fragt eng nach Bash-Limits, C breit nach Env-Deckeln und honoriert KIMIs `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS`. Kein Faktenkonflikt. |
| `ENABLE_TOOL_SEARCH` | OPUS | 4 | 4 | **2** | **2** | C — mit Doku-Verweis und Selbstkorrektur. A und B vergeben eine 4 für eine zurückgezogene Aussage. |
| `updatedToolOutput`-Form | KIMI | 3 | 3 | **1** | **2** | C — mechanischer Nachweis am fremden Code. Der einzige 1er im Korpus. |
| Lizenz / Lieferfähigkeit | GPT | 4 | **2** | 4 | **2** | B — als einziges mit benanntem internem Widerspruch in GPTs eigenem Artefakt. |
| Native Env-Deckel | OPUS | — | **5** | **3** | **2** | Kriteriumskonflikt: B bewertet Vollständigkeit, C bewertet Methode („als Paket, ohne Caveat"). |
| Mechanismus-Taxonomie | GPT | 5 | **3** | 5 | **2** | B — weist darauf hin, dass GPT die Ordnung übernimmt, nicht erzeugt. |
| Verhalten / ponytail | OPUS | **3** | **5** | — | **2** | B — nennt die vollständige Statistik (−10,3 %, p=0,004, n=4-Caveat). |
| Verhalten / ponytail | K3 | **5** | **3** | — | **2** | B stuft sich selbst herunter. |
| Neufunde / Zugewinn | K3 | 3 | — | **5** | **2** | C — einziges Gitter mit eigener Zelle für Entdeckungsleistung. |
| Bash-Limits/Spill | K3 | — | **2** | 4 | **2** | wie bei KIMI: Zuschnitt. |

**Fünf der elf größten Abweichungen sind keine Sachkonflikte, sondern Folgen unterschiedlicher Zellzuschnitte.** Spannen bis 3 Punkte ohne eine einzige widersprüchliche Tatsachenbehauptung.

---

## 5. Auffälligkeiten

### 5.1 Kein unabhängiger Schiedsrichter

C legt offen, dass `OPUS5_MAX_Validation` byteidentisch mit der eigenen Chat-Ausgabe ist, und warnt vor der „Scheinbestätigung" durch dieselbe Quelle in zwei Spalten. Der Gedanke wird nicht zu Ende geführt:

| Dokument | Autor | steht selbst in der Tabelle | eigene Platzierung |
|---|---|---|---|
| A | nicht offengelegt | vermutlich ja | — |
| B | K3SWARM | ja | **Platz 4 von 4** |
| C | OPUS5_MAX | ja | Platz 4 (veröffentlicht) / Platz 2 (korrigiert) |

**In allen drei Fällen sitzt der Richter im Feld.** Entlastend: die beiden Dokumente mit offengelegter Autorschaft bewerten sich selbst am schlechtesten. Das ist das Gegenteil von Eigennutz.

Genau deshalb fällt A auf: einziges Dokument ohne Autorenangabe, und es vergibt den mit Abstand höchsten Wert des Korpus.

### 5.2 Der 4,88-Ausreißer

A bewertet GPT mit **97,5 %** — 29 Fünfen, zwei Vieren, eine Drei. Kein anderes Dokument bewertet irgendeinen Datensatz über 92,4 %.

Inhaltlich schwer zu halten: A vergibt GPT eine 4 auf „Aktualität, Lizenz und Lieferfähigkeit" (D04). B vergibt dafür eine **2**, begründet mit einem nachprüfbaren Widerspruch in GPTs eigenem Artefakt plus fehlenden Commit-/Aktivitätsdaten. C bestätigt „keine Vollerhebung". Von den drei Urteilen ist nur eines mit einem benannten Fehler unterlegt — die 2.

Dazu: A vergibt OPUS eine 4 bei `ENABLE_TOOL_SEARCH` und eine 5 bei den Absagen — an genau den zwei Stellen, an denen OPUS sich selbst eine 2 gibt. **A ist mehrfach großzügiger, als der bewertete Datensatz mit sich selbst ist.** Ein Prüfbericht, der milder urteilt als die Selbstauskunft des Geprüften, hat sein Prüfziel verfehlt.

### 5.3 Absenz als Strafe

A vergibt für „nicht behandelt" eine 1 — dieselbe Note, die C für „mechanisch widerlegt" reserviert.

- KIMI bekommt in A drei Einsen (D05, D06, D28) für Dinge, die es nie behauptet hat zu liefern; es ist der Prüf**gegenstand**, nicht der Prüfer. B und C bilden das korrekt mit n.v./n/a ab.
- KIMIs tatsächlich defekter Guard-Code bekommt in A eine 3.

Ein nicht vorhandenes Kapitel steht damit schlechter da als ein vorhandener, funktionsunfähiger Codeentwurf.

### 5.4 Die Gitterkomposition erzeugt das Ergebnis

| Dokument | Schwerpunkt der Zellen | strukturell begünstigt |
|---|---|---|
| A | Entscheidungen, Ownership, Governance, Rollout | GPT |
| B | native Fakten, konkrete Werte, Eigenmessung (Themen 4, 5, 6, 7, 13, 31, 32) | OPUS |
| C | Evidenz, Doku-Verweise, offene Konflikte | GPT |

Am deutlichsten bei K3SWARM: sein eigentlicher Beitrag sind **exklusive Funde** — 11 Neufunde inkl. `compact-plus` und `quiet-bash`, das Register F1–F15 mit zwei Fehlern, die sonst niemand hat (F3 überlappende Secret-Redactions, F4 fehlendes stdin-Limit), der AUTOCOMPACT-Caveat, die Falsifikation der Skill-Stückkostenrechnung. Nur C hat dafür eine Zelle (VP-33, eine 5 — K3SWARMs einziger Spitzenwert im Korpus). A und B haben keine, und K3SWARM landet in beiden auf dem letzten Platz.

**Der Durchschnitt aus §3 mittelt drei Antworten auf drei verschiedene Fragen.** Als Robustheitsprüfung taugt er, als Ranking nicht.

### 5.5 Zwei Dokumente übersehen den teuersten offenen Konflikt

C stuft K5 (`.claude/rules`-Reinjektion, KIMIs 93.000-Token-Gegenbeleg gegen GPTs Empfehlung genau dieses Mechanismus) als „höchste Priorität" ein.

- **A hat dazu keinen Konflikt.** D08 vergibt allen vier 4 oder 5, GPT eine 5 explizit für „path-scoped Rules" — den Mechanismus, gegen den KIMIs Zahl steht.
- **B hat dazu keinen Konflikt.** Thema 7 vergibt GPT56 eine 5, KIMI eine 4, stellt beide nebeneinander, markiert sie nicht als gegenläufig.

Dasselbe bei K9 (CVE): nur C markiert ihn. Siehe §6.

### 5.6 Eine Parallele, die keines der drei zieht

C hält in VP-18 fest, dass K3SWARM die Rechnung „290 Skills × 100 Token" falsifiziert hat: ein Budgetdeckel ist keine Stückkostenlogik, die lineare Multiplikation ist als Rechenmodell falsch.

Zwei Vergleichspunkte später steht KIMIs Kernzahl für K5: „11 Rule-Files × 30 Tool-Calls = 93.000 Token". **Formal dieselbe lineare Multiplikation**, unter der Annahme, dass alle elf Dateien bei jedem Aufruf injizieren — genau das, was Path-Scoping verhindern soll. Die Zahl ist ein Modell, keine Messung, und wird in C dennoch als „konkrete Messung mit Issue-Nummer" mit 5 bewertet.

Das eine Muster wird erkannt und falsifiziert, das strukturgleiche eine Seite weiter als Beleg geführt. Siehe §8.2 — die Zahl ist am realen Repo-Stand ohnehin gegenstandslos.

### 5.7 Kleinbefunde

- **Repo-Zählung (K1):** A und C führen 368 gegen 376. B liefert unbemerkt ein Stück Auflösung — „376 Einträge (373 eindeutig; 3 Redirect-Dubletten)". Kette: 376 roh → 374 erreichbar → 373 eindeutig → 368 normalisiert → 367 verifiziert. Restlücke 5, nicht 8.
- **B findet eine Inkonsistenz in GPTs Zählwerk** („KIMI 156 vs. 157"), die in A und C fehlt.
- **Maschinenlesbarkeit:** nur C liefert einen TSV-Block — und ist zugleich das Dokument mit den fehlerhaftesten Aggregaten. Wer C maschinell konsumiert, bekommt die richtigen Daten; wer die Zusammenfassung liest, die falsche Rangfolge.
- **A kritisiert K3 zu Recht** für fehlende Provenienz. Derselbe Maßstab träfe A selbst: auch A liefert keinen Reproduktionsweg für seine 128 Zellenurteile.

---

## 6. Externe Prüfung der beiden hochprioritären Einzelquellen

### 6.1 CVE-2026-33068 — real, aber falsch zugeordnet

K3SWARM begründet damit eine **harte Absage an rtk**. Die CVE existiert, betrifft aber nicht rtk.

CVE-2026-33068 ist ein Workspace-Trust-Dialog-Bypass in **Claude Code selbst** (anthropics/claude-code, GHSA-mmgp-wc2j-qcv7, CVSS v4.0 7.7 HIGH, März 2026). Versionen vor 2.1.53 lasen den Permission-Mode aus der repo-kontrollierten `.claude/settings.json`, bevor entschieden wurde, ob der Trust-Dialog erscheint; ein bösartiges Repository konnte `permissions.defaultMode: bypassPermissions` setzen und den Dialog überspringen.

1. **Konflikt K9 fällt zugunsten von GPT56.** rtk als A/B-Arm zu führen statt hart abzusagen ist auf dieser Grundlage korrekt. Ob rtk ein eigenes Advisory hat, ist damit nicht geprüft.
2. Version 2.1.220 liegt weit über 2.1.53 — nicht betroffen.
3. **Provenienzsignal:** K3SWARM ist der einzige Datensatz mit einer CVE-Nummer, und die Zuordnung ist falsch. Seine übrigen exklusiven Behauptungen (F3, F4, die 11 Neufunde, #2345/#3175) brauchen dieselbe Einzelprüfung — nicht weil sie falsch sein müssen, sondern weil hier genau die Kontrolle gefehlt hat, die man einer Einzelquelle schuldet.
4. Inhaltlich ist die CVE für den Stack relevant, nur an anderer Stelle: der Angriffsweg ist ein Repository, das seine eigene `.claude/settings.json` mitliefert. Der ganze Token-Stack besteht aus Repositories, die genau das tun. Siehe §8.4.

### 6.2 `.claude/rules`-Reinjektion — Mechanismus bestätigt, Zahl gegenstandslos

Die Issue-Nummer #32057 konnte ich nicht direkt bestätigen. Der Mechanismus ist mehrfach unabhängig dokumentiert:

- **#27814** (Feb 2026): Projekt-`CLAUDE.md` wird bei jedem Tool-Call, der eine Datei im Projektverzeichnis liest, als `<system-reminder>` neu injiziert, ohne Deduplizierung. Kosten proportional zu (Tool-Calls) × (Dateigröße). Als Duplikat geschlossen.
- **#21214** (Jan 2026): dasselbe für Read-Reminder.
- **#35051** (Mär 2026): dasselbe für die **Skill-Liste** — bei 246 Skills etwa 30–50k Tokens Beschreibungen, auf nahezu jedem Tool-Ergebnis erneut injiziert.
- **#56867** (Mai 2026): Reminder nach fast jedem Tool-Call.

1. **K5 neigt sich zu KIMI, aber anders begründet:** das Problem ist nicht auf `.claude/rules` beschränkt, es trifft `CLAUDE.md` selbst. Path-Scoping schützt die Wurzeldatei nicht. GPTs Empfehlung verschiebt das Problem, statt es zu lösen, solange die Root-Datei nicht klein ist. Beide Seiten laufen auf dieselbe Maßnahme hinaus.
2. **#35051 macht K4 anschlussfähig:** Skill-Listing-Kosten sind real und skalieren mit Tool-Calls, aber der Treiber ist die Reinjektionsfrequenz, nicht die Stückzahl. K3SWARMs Falsifikation und OPUS' Verdacht sind beide richtig — sie reden über verschiedene Größen.
3. **Am realen Repo-Stand ist der Streit erledigt**, siehe §8.2.

---

## 7. Der gemeinsame Korpus — was die Repo-Kenntnis ändert

Allen drei Dokumenten lag derselbe vollständige Repo-Stand vor. Damit ist jeder Unterschied zwischen ihnen ein Unterschied in der **Nutzung**, nicht im Zugang.

### 7.1 Auftragstreue als vierte Bewertungsachse

Der Step-1-Auftrag lautete: die vier Datensätze abgleichen, Fünf-Punkte-System, keine zusätzlichen Messungen. Ladder, Hooks, `CLAUDE.md` und `settings.json` waren ausdrücklich für **danach** vorgesehen.

| Dokument | Selbstdeklaration | Auftragstreue |
|---|---|---|
| A | `document_stage: initial_no_new_measurements`, `measurement_policy: only claims and measurements already contained in the four datasets` | **strikt** |
| B | `bewertungsbasis: ausschließlich vorhandene Daten, keine zusätzlichen Messungen` | **strikt** |
| C | `rating_basis: … und den bereits durchgeführten Messungen aus Phase 0`; §4 zieht ausdrücklich Phase-2-Material vor | **überschritten** |

Das relativiert meinen Vorwurf aus v1.0 und ersetzt ihn durch einen präziseren. A und B haben sich korrekt verhalten. Aber:

**Gesetz I ist in allen drei Dokumenten der härteste Konsens** — „genau ein mutierender Owner je Kontextfläche", in C sogar als „vier von vier, härtester Konsens des gesamten Materials" ausgewiesen. Wer ein Gesetz zum härtesten Konsens erklärt und im selben Repository eine `settings.json` liegen hat, die es widerlegt, schuldet einen Satz — unabhängig vom Auftragsrahmen. Ein Auftrag begrenzt, was man bewertet, nicht was man meldet.

C hat gemeldet. A und B nicht. Das ist der Unterschied, der bleibt.

### 7.2 Die Ladder als Primärquelle, die keiner als Primärquelle benutzt

Die `[GEMESSEN]`-Werte, die OPUS' Stärke ausmachen — 2.001 gegen 1.719 Tokens bei `filter.rs`, −27,2 % gepaart, −0,3 % gepaart, 286 Tokens je Session für den nicht registrierten MCP, die ~32-KB-Auslagerungsgrenze — stammen aus der Squeez-RTK-Ladder-Arbeit und lagen im Repo.

Alle drei Dokumente verwenden diese Zahlen. **Alle drei verwenden sie zweiter Hand, als Eigenschaft des Datensatzes OPUS.** B honoriert sie in Thema 31 und 32 als „Eigenmessungen" von OPUS_V4, C in VP-01, VP-24, VP-25 und VP-27 als Belege von OURS, A in D02 und D06 als Evidenzstandard von OPUS.

Keines der drei behandelt sie als das, was sie sind: **die einzige Messschicht im Korpus, an der man alle vier Datensätze prüfen könnte.** Sie werden als eine der bewerteten Spalten verrechnet statt als Maßstab über allen vieren.

Das hat zwei Folgen:

1. **OPUS' Vorsprung ist teilweise Doppelzählung.** Wenn dieselben Messwerte für jeden zugänglich waren, ist „OPUS hat Messungen" kein Differenzierungsmerkmal, sondern eine Aussage darüber, wer den Ordner geöffnet hat. Das ist immer noch ein Verdienst — aber es ist ein anderer Verdienst als der, der bepunktet wurde. Wieviel von OPUS' 88,9 % darauf entfällt, lässt sich ohne Kenntnis der Entstehungsreihenfolge nicht sagen; betroffen sind mindestens B/31, B/32, C/VP-01, C/VP-24, C/VP-25.
2. **Der offensichtliche Kreuztest fehlt.** GPT56 erklärt „keine eigene E2E-Messung" — während im selben Repo fünf gepaarte Messreihen lagen, gegen die sich mehrere seiner Empfehlungen direkt hätten prüfen lassen. Der Befund „squeez kann Ausgaben vergrößern" (2.001 gegen 1.719) ist ein fertiger Gegenbeleg zur Bash-Guard-Ökonomie, und die −0,3 % gepaart sind der schärfste Einwand gegen die ganze Fläche.

### 7.3 Was ich in dieser Runde nicht gelesen habe

`Squeez-RTK-Ladder/` und `hooks/` habe ich nicht neu gelesen; die obigen Zahlen stammen aus dem Projektstand. Ein eigener Durchgang durch beide Ordner gehört in Step 2 und ist die Grundlage dafür, §7.2 quantitativ statt qualitativ zu machen.

---

## 8. Prüfung von C §4 gegen die reale Konfiguration

C §4 ist die einzige Stelle im gesamten Material, an der die laufende Konfiguration gegen die Empfehlungen gehalten wird. Ich habe `settings.json` und `CLAUDE.md` vollständig gelesen.

### 8.1 C §4 stimmt — und ist eher konservativ

| C §4 behauptet | Prüfergebnis |
|---|---|
| `autoCompactEnabled: false` | ✓ **exakt**, wörtlich im File |
| `model: opus[1m]` | ✓ **exakt** |
| 25 aktive Plugins aus 28 Marketplaces | ✓ **exakt**: 35 Einträge in `enabledPlugins`, davon 25 `true`; 28 Einträge in `extraKnownMarketplaces` |
| keine der Stufe-1-Env-Variablen gesetzt | ✓ **exakt**: `env` enthält drei Variablen, keine davon aus der Liste (`BASH_MAX_OUTPUT_LENGTH`, `MAX_MCP_OUTPUT_TOKENS`, `TASK_MAX_OUTPUT_LENGTH`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`, `ENABLE_TOOL_SEARCH`, `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS`, `DISABLE_LEGACY_MODEL_REMAP`) |
| drei mutierende Hooks auf `PreToolUse:Bash` | ✓ für die tokenverändernde Teilmenge — **untertrieben für die Gesamtzahl**: fünf `PreToolUse`-Einträge greifen auf Bash |

Die fünf: `protect-tests.js` (`Bash\|Edit\|MultiEdit\|Write`), `protect-secrets.js` (`Read\|Edit\|Write\|Bash`), `tokless rtk-hook claude` (`Bash`), `bash-dump-guard.mjs` (`Bash`), `squeez/hooks/pretooluse.sh` (`Bash\|Read\|Grep\|Glob\|Agent\|Task`). Die drei mittleren sind die tokenrelevanten — C's Zählung trifft also die richtige Teilmenge.

Auf `PostToolUse` greifen drei auf Bash: `bash-size-feedback.mjs` (`Bash`), `squeez/hooks/posttooluse.sh` (ohne Matcher) und `ladder-ledger.mjs` (leerer Matcher).

**C §4 ist damit die am besten belegte Einzelseite des gesamten Korpus** — und die einzige, die ich vollständig gegen Primärdaten verifizieren konnte. Einschränkung: `settings.json` zeigt **Registrierung**, nicht Laufzeitverhalten. Ob alle drei tatsächlich mutieren, hängt an ihrer internen Konfiguration; nach Projektstand stehen mehrere Rungs auf `off`. Registrierung ist der obere Rand, nicht der Ist-Wert.

### 8.2 Neu: die 8,22-KB-CLAUDE.md erledigt Konflikt K5

`CLAUDE.md` hat **173 Zeilen, 120 loc, 8,22 KB** — rund 2.000 bis 2.100 Tokens.

| Kriterium | Wert | Urteil |
|---|---|---|
| GPT56: Root < 200 Zeilen | 173 | **bestanden** |
| KIMI: Root ~60 Zeilen als Praxisziel | 173 | **dreifach überschritten** |
| Reinjektionskosten nach #27814 | ~2.050 Tokens je Injektion | — |

Rechnet man KIMIs eigenes Modell auf diese Datei: **~45 dateiberührende Tool-Calls reproduzieren die 93.000 Tokens aus der Wurzeldatei allein.** Der Konflikt K5, den C als teuersten des ganzen Vergleichs führt, dreht sich damit um die falsche Datei. Es gibt hier gar keine elf Rule-Files — es gibt eine Wurzeldatei, die den dominanten Term stellt.

Zwei Konsequenzen:

- **GPT56s Kriterium „<200 Zeilen" ist die falsche Einheit.** 173 Zeilen bei 8,22 KB sind ~49 Byte je Zeile. Reinjiziert werden Bytes, nicht Zeilen. Ein Zeilenlimit, das eine 8-KB-Datei durchwinkt, misst nicht, was kostet.
- **Der Streit GPT56 ↔ KIMI löst sich in eine gemeinsame Maßnahme auf:** Root nach Bytes deckeln. Beide Seiten hatten recht über verschiedene Dateien und unrecht über die Einheit.

Einordnung, damit es nicht überzeichnet wird: Reinjektion erzeugt überwiegend Cache-Read, nicht Cache-Write. Der Posten ist Kontext**fenster** und wachsender Tail, nicht voller Neupreis — genau die Trennung, die im Korpus nur KIMI (Konflikt K6) macht. `/context` vorher/nachher entscheidet das in Minuten.

### 8.3 Neu: vier Widersprüche zwischen Korpus-Konsens und laufender Konfiguration

Keiner davon steht in einem der drei Dokumente.

| # | Konsens im Korpus | Ist-Zustand |
|---|---|---|
| 1 | **Caveman nicht Default** — alle vier Datensätze, „8,5 % statt 65 %", Qualitätsrisiko | `caveman@caveman: true` **und** ein eigener Abschnitt „Response Style (caveman)" in der Root-`CLAUDE.md`, samt Fallback-Spezifikation |
| 2 | **Ponytail on demand, keine Always-on-Stilskills** (A/D12) | `ponytail@ponytail: true` **und** der längste Abschnitt der Root-`CLAUDE.md` (~40 Zeilen Ladder-Spezifikation), also doppelt geladen |
| 3 | **Genau ein Retriever** (A/D16, B/17, C/VP-29) | Root-`CLAUDE.md` instruiert codegraph **und** context-mode **und** rtk als Pfade nebeneinander |
| 4 | **Subagenten: Fenster sparen ≠ Volumen sparen, ×7-Risiko** (KIMI, Konflikt K6) | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "1"`, `teammateMode: "auto"`, `fan-out-subagents` aktiv — K6 ist nicht akademisch, sondern live |

Nummer 2 ist der schärfste: der Korpus streitet in K4 über die Stückkosten der Skill-Liste, während dieselben Verhaltensvorgaben in voller Länge als Prefix-Bytes danebenliegen. Ein Budgetdeckel auf Skill-Beschreibungen greift nicht bei Text, der direkt in `CLAUDE.md` steht.

Ergänzend zwei kleinere:

- **`claude-mem@thedotmack: true`.** GPT56 führt einen Privacy-Befund dazu (PostHog/Worker-Stack), KIMI die Issues #1719/#3480. Das diskutierte Memory-Werkzeug ist aktiv installiert; kein Dokument bemerkt es.
- **`context-mode@context-mode: true`.** OPUS' Gesetz III markiert ELv2 als Lizenz-Fence. Der Fence ist bei dienstlicher Nutzung nicht hypothetisch, sondern gesetzt.

### 8.4 Neu: `ENABLE_TOOL_SEARCH` ist in der Praxis bereits entschieden

Konflikt K3 (GPT56: unset lassen — OPUS: bleibt aktiv) ist im Ist-Zustand aufgelöst: die Variable ist **nicht gesetzt**, also nativ default. Das ist exakt GPT56s Empfehlung.

Zusätzlich zeigt die Root-`CLAUDE.md`, dass die Folge von Deferred Loading bereits von Hand verwaltet wird — sie führt die vollen MCP-Toolnamen von context-mode auf und gibt eine `ToolSearch({query: "select:…"})`-Anweisung. Das ist eine funktionierende Umgehung und zugleich ein Prefix-Posten: Schemamaterial in der immer geladenen Datei.

### 8.5 Nebenbefunde aus der Konfigurationslektüre

- **`skillListingBudgetFraction: 0.01` trifft auf `model: opus[1m]`.** Der Deckel, mit dem C in VP-18 die Stückkostenrechnung falsifiziert, ist ein *Anteil*. Auf einem 1-M-Fenster erlaubt 1 % rund 10.000 Tokens für Skill-Beschreibungen — das Zehnfache des Werts auf 200k. C bemerkt das 1-M-Fenster für das quadratische Sessionwachstum, nicht für diesen Posten. **K4 ist damit nicht zugunsten von K3SWARM entschieden, sondern offen mit anderem Vorzeichen.**
- **`bash-dump-guard.mjs` ist auf `PreToolUse` registriert, nicht auf `PostToolUse`.** Der gesamte Korpus spezifiziert dieses Artefakt als `PostToolUse:Bash`-Owner mit `updatedToolOutput` — eine Mechanik, die es auf `PreToolUse` nicht gibt. Nach Projektstand hat der Guard hier eine andere Rolle (er liest die Hook-Registrierung aus `settings.json`, um rtk zu erkennen). Wenn das so gewollt ist, ist es kein Fehler — aber dann beschreiben alle drei Dokumente ein Artefakt, das an anderer Stelle etwas anderes tut. **Das ist zu bestätigen, bevor irgendeine Guard-Empfehlung übernommen wird.**
- **`defaultMode: "auto"` plus `skipDangerousModePermissionPrompt: true`** plus eine Allow-Liste mit `Bash(rtk *)` und `mcp__codegraph__.*`. Nicht `bypassPermissions`, also nicht die CVE selbst — aber die permissive Grundhaltung, vor der das Advisory warnt, und in einem öffentlichen Repository publiziert. Dass die Datei am Repo-Root und nicht unter `.claude/` liegt, verhindert die automatische Anwendung beim Klonen.
- **`verbose: true`** ist gesetzt und in keinem Dokument als Ausgabeposten erwähnt.
- **`CONTEXT_MODE_BASH_NUDGE_MIN_COMMAND_BYTES: "120"`** ist ein sehr niedriger Schwellwert und ein ungeprüfter Regler.
- Die Datei enthält absolute Heimatpfade (`/Users/rob/…`) und das vollständige Plugin- und Marketplace-Inventar, öffentlich lesbar.

---

## 9. Reihenfolge — angepasst an den vierstufigen Auftrag

Die Auftragsfolge (1 Datensatzabgleich → 2 Ladder und Konfiguration einlesen → 3 Tokenberechnung, Dateienabgleich, 1-bis-100-Zweitvalidierung → 4 Komplettpaket) ist richtig aufgebaut. Mein Einwand aus v1.0 galt einer Sache, die dort schon steht. Was bleibt, ist eine Ordnung **innerhalb** der Stufen:

| # | Schritt | Stufe | warum an dieser Stelle |
|---|---|---|---|
| 1 | Aggregate von B und C korrigieren, bevor daraus zitiert wird | 1 (Nacharbeit) | sonst wandert eine falsche Rangfolge in die Zweitvalidierung |
| 2 | Ladder und `hooks/` vollständig lesen — als Maßstab über allen vier Datensätzen, nicht als OPUS-Eigenschaft | 2 | siehe §7.2; macht §7.2 quantitativ |
| 3 | `bash-dump-guard.mjs` auf `PreToolUse` bestätigen oder korrigieren | 2 | die Guard-Empfehlung des halben Korpus hängt daran |
| 4 | `/context` als Baseline, **vor** der 1-bis-100-Bewertung | 3, zuerst | ohne Baseline hat die 1-bis-100-Skala keinen Nenner — genau der Fehler, den alle drei Dokumente in ihren Aggregaten machen |
| 5 | Root-`CLAUDE.md` nach **Bytes** deckeln, `/context` vorher/nachher | 3 | entscheidet K5 und K4 in einem Zug, siehe §8.2 und §8.5 |
| 6 | Drei mutierende `PreToolUse:Bash`-Hooks auf einen reduzieren | 3 | Gesetz I, der härteste Konsens, im Ist-Zustand verletzt |
| 7 | Caveman-Doppelung und Ponytail-Doppelung auflösen | 3 | §8.3, Widersprüche 1 und 2 |
| 8 | K3SWARMs übrige Einzelquellen prüfen (F3, F4, 11 Neufunde, Issue-Nummern) | 3 | eine Fehlzuordnung ist belegt, der Rest ungeprüft |
| 9 | Gemeinsame Normalisierungsregel für die Repo-Union (K1) | 3, zuletzt | niedrigste Entscheidungsrelevanz |

Erledigt: **K9** (rtk bleibt A/B-Arm, §6.1), **K3** (`ENABLE_TOOL_SEARCH` ist unset, §8.4), **K5** (falsche Datei, §8.2). **K4 ist neu geöffnet** (§8.5).

---

## 10. Schlussbetrachtung

Die drei Dokumente sind besser als ihre Aggregate. Die Zellenurteile sind über weite Strecken gut begründet, gegenseitig anschlussfähig und in den Kernfragen einig. Die Summenzeilen darüber sind in zwei von drei Fällen falsch, und in einem so falsch, dass sich die Rangfolge dreht — ausgerechnet zulasten des Datensatzes, der am gleichmäßigsten gut bewertet wird. Wer die drei liest, ohne nachzurechnen, bekommt eine Aussage, die die eigenen Daten nicht tragen.

Der Durchschnitt aus §3 sieht nach einer Antwort aus, ist aber der Mittelwert über drei verschiedene Fragen. A fragt nach Entscheidungsdisziplin, B nach nativen Fakten und Zahlen, C nach Evidenz und offenen Konflikten. Jedes Gitter kürt erwartbar den Datensatz, der auf seine Frage antwortet. Dass trotzdem in allen drei dasselbe Paar oben steht — GPT56 und OPUS_V4, in wechselnder Reihenfolge —, ist die eine belastbare Aussage. Alles Feinere ist Gewichtungsartefakt.

Die Repo-Kenntnis ändert daran nichts, aber sie ändert den Vorwurf. In v1.0 hatte ich A und B unterstellt, den Ist-Zustand nicht zu sehen. Sie haben ihn nicht gesehen, weil sie ihn auftragsgemäß nicht sehen sollten — beide sagen das im Frontmatter, beide haben sich daran gehalten, und C hat den Rahmen verlassen. Das ist eine Verteidigung, aber keine vollständige. Alle drei erklären Gesetz I zum härtesten Konsens des Materials, und in demselben Repository liegt eine `settings.json`, die es widerlegt. Ein Auftrag begrenzt, was man bewertet; er begrenzt nicht, was man meldet. C hat gemeldet, A und B nicht — und C's Meldung stimmt, wie sich jetzt zeigt, bis auf die letzte Ziffer: 25 aktive Plugins, 28 Marketplaces, Auto-Compact aus, keine einzige Stufe-1-Variable gesetzt. Der Preis dieser Auftragsüberschreitung ist vermutlich genau der Versionsdrift, der C's Aggregat unbrauchbar macht.

Schwerer wiegt der zweite Punkt. Die Messwerte, die im ganzen Korpus als Goldstandard behandelt werden, lagen für alle im selben Repo. Alle drei benutzen sie — und alle drei benutzen sie als Eigenschaft einer der bewerteten Spalten statt als Maßstab über allen vieren. Damit wird die einzige belastbare Schicht des Materials mitbewertet statt zum Bewerten benutzt. Der Kreuztest, der sich aufdrängt, findet nirgends statt: GPT56 erklärt, keine E2E-Messung zu haben, während fünf gepaarte Messreihen im Nachbarordner liegen, gegen die sich mehrere seiner Empfehlungen direkt prüfen ließen. Der Befund, dass squeez eine Ausgabe von 1.719 auf 2.001 Tokens vergrößert hat, ist ein fertiger Gegenbeleg zur halben Bash-Fläche und wird in keinem der drei als solcher eingesetzt.

Die beiden externen Prüfungen zeigen, was auf dem Spiel steht. Die einzige CVE-Nummer im Korpus ist real und gehört einem anderen Produkt; auf ihrer Grundlage wurde ein Werkzeug hart abgelehnt, das im laufenden Setup nicht nur benutzt, sondern per Allow-Liste freigegeben ist. Und der teuerste offene Konflikt betrifft die falsche Datei: nicht elf Rule-Files, sondern eine Wurzeldatei mit 8,22 KB, die GPT56s Zeilenkriterium anstandslos passiert und KIMIs Zahl im Alleingang reproduziert. Beide Seiten hatten recht über verschiedene Dinge und unrecht über die Einheit — man muss Bytes deckeln, nicht Zeilen zählen.

Damit steht die Bilanz anders als in v1.0, aber nicht besser. Drei Dokumente, 98 Vergleichspunkte, vier Datensätze, rund 40.000 Wörter — und die entscheidungsrelevantesten Befunde dieser Runde stammen aus zwei Dateien, die alle drei im Zugriff hatten und keiner vollständig ausgewertet hat. Das ist kein Argument gegen die Dokumente. Es ist ein Argument dafür, die nächste Stufe genau so zu bauen, wie der Auftrag sie vorsieht: erst die Ladder und die Konfiguration als Maßstab lesen, dann messen, dann bewerten. Nicht umgekehrt. Eine 1-bis-100-Skala ohne Baseline wäre dieselbe Nennerlosigkeit, die diese drei Dokumente in ihren Summenzeilen vorführen — nur mit hundert statt fünf Stufen und damit doppelt so überzeugend im Irrtum.

---

## 11. Was die Vollübersicht zeigt

Die 98 Einzelpunkte der drei Dokumente sind hier vollständig aufgeschlüsselt, auf 38 Teilbereiche abgebildet und in drei Aggregationsstufen gemittelt: je Punkt (§12), je Teilbereich (§13–14) und je Datensatz (§15). Sieben Befunde ergeben sich erst aus dieser Auflösung.

### 11.1 Die Rangfolge hält über drei unabhängige Aggregationswege

| Methode | GPT | OPUS | K3 | KIMI |
|---|---:|---:|---:|---:|
| punktgewichtet (n=98) | **4,52** | 4,44 | 3,79 | 3,94 |
| themengewichtet (n=38) | **4,53** | 4,42 | 3,81 | 3,89 |
| strengekorrigiert (Abweichung vom Dokumentmittel) | **+0,34** | +0,26 | −0,39 | −0,23 |

Die größte Abweichung zwischen punkt- und themengewichtetem Mittel beträgt 0,05. Die Reihenfolge **GPT > OPUS > KIMI > K3** ist damit unabhängig davon, ob man Einzelpunkte, Teilbereiche oder strengebereinigte Abstände mittelt. Das ist die erste Aussage dieser Runde, die nicht mehr von einer Methodenentscheidung abhängt.

### 11.2 Die drei Dokumente benoten unterschiedlich streng — um mehr als eine halbe Note

| Dokument | Notenmittel | 5er | 4er | 3er | 2er | 1er |
|---|---:|---:|---:|---:|---:|---:|
| A | **4,40** | 73 (57 %) | 39 | 13 | **0** | 3 |
| C | **4,27** | 63 (49 %) | 43 | 16 | 5 | 1 |
| B | **3,87** | 36 (28 %) | 49 | 32 | **10** | 0 |

**B benotet 0,53 Notenpunkte strenger als A.** A vergibt in 57 % aller Zellen eine 5 und **keine einzige 2** — seine Skala läuft faktisch von 3 bis 5, mit einer 1 als Sonderfall für Nichtbehandlung. B nutzt die Skala von 2 bis 5.

Das erklärt den 4,88-Ausreißer aus §5.2 strukturell: GPTs 97,5 % in A sind zu einem erheblichen Teil ein Effekt der Skalennutzung, nicht des Urteils. Genau deshalb ist die strengekorrigierte Zeile in §11.1 die belastbarste der drei — und auch dort steht GPT vorn.

### 11.3 K3SWARM führt in 2 von 38 Teilbereichen

| Datensatz | führt in … von 38 | Anteil |
|---|---:|---:|
| GPT | 22 | 58 % |
| OPUS | 17 | 45 % |
| KIMI | 12 | 32 % |
| K3 | **2** | **5 %** |

Und selbst diese zwei sind geteilte Führungen: T35 Security (mit GPT und OPUS) und T38 Neufunde (mit KIMI). Das ist §5.4 in Zahlen. Der Beitrag von K3SWARM — Fehlerregister, exklusive Funde, Falsifikationen — hat in den Gittern von A und B fast keine Zelle, in der er sichtbar werden könnte.

### 11.4 Der schwächste gut abgedeckte Teilbereich ist ausgerechnet Gesetz III

| Teilbereich | Ø | Abd. | GPT | OPUS | K3 | KIMI |
|---|---:|---:|---:|---:|---:|---:|
| T04 Aktualität, Lizenz & Lieferfähigkeit | **3,58** | 3/3 | 3,17 | **5,00** | 2,67 | 3,50 |

Von allen Teilbereichen, die alle drei Dokumente behandeln, ist dieser der schwächste — und es ist genau das Kriterium, das OPUS' Gesetz III zur Aufnahmebedingung macht. **Drei von vier Datensätzen können nicht verlässlich sagen, ob ein Repository lieferfähig ist.** Für Step 3, wo Issue-Stand, Aktualität und Update-Zyklus geprüft werden sollen, heißt das: dieser Teil ist praktisch neu zu erarbeiten, nicht aus dem Korpus zu übernehmen. Nur OPUS' Vollerhebung trägt.

Der schwächste Teilbereich überhaupt ist T26 Token-effiziente Formate & Packaging mit 3,25 — dort trägt allein KIMI (4,50), alle anderen liegen bei 2,50 bis 3,00.

### 11.5 Der stärkste Konsens ist Gesetz II, nicht Gesetz I

| Rang | Teilbereich | Ø | Abd. |
|---:|---|---:|---:|
| 1 | T12 Prompt-Cache & Prefix-Stabilität (Gesetz II) | **4,88** | 2/3 |
| 2 | T35 Security, Datenintegrität & Recovery | 4,75 | 1/3 |
| 3 | T02 Evidenzstandard & Nennerdisziplin | 4,62 | 2/3 |
| 4 | T31 Rollout, Gates & Rückbau | 4,58 | 3/3 |
| … | T13 Architekturgesetze & Surface-Ownership (Gesetz I) | 4,46 | 3/3 |

Alle drei Dokumente bezeichnen Gesetz I als härtesten Konsens. Rechnerisch liegt Gesetz II davor: bei T12 vergibt keines der Dokumente einen Wert unter 4,50 an irgendeinen Datensatz, bei T13 fällt KIMI auf 3,83. Der Unterschied ist klein, aber er verschiebt die Prioritätenlogik: **Cache-Stabilität ist die Regel, hinter der alle vier Datensätze am geschlossensten stehen.**

### 11.6 KIMI ist der einzige bimodale Datensatz

KIMI führt zwölf Teilbereiche mit glatt 5,00 (Mechanismenordnung, Verhaltens-Skills, Cache/Proxy, Sandbox, Formate, Memory, Subagenten-Ökonomie, Neufunde) und fällt in fünf anderen auf 2,50 oder darunter:

| Teilbereich | KIMI | Grund |
|---|---:|---|
| T05 Agenten-Bewertungsraster | **1,00** | nicht behandelt (Prüfgegenstand, nicht Prüfer) |
| T06 Funktionsprüfung & Fehlerregister | **1,00** | nicht behandelt |
| T30 Packaging, Installer & Code | **1,50** | kein distributionsfähiges Artefakt |
| T18 Capability / Canary | **2,00** | nicht behandelt |
| T20 Read-Kontext-Guards | **2,00** | nur am Rand erwähnt |

Kein anderer Datensatz hat diese Form. Drei der fünf Tiefstwerte sind Nichtbehandlung, die A als 1 und B als 2 verbucht — also die Konvention aus §2, nicht ein Qualitätsurteil. **KIMI ist ein Konzeptdokument, das an Implementierungskriterien gemessen wird**, und die Spannweite 1,00–5,00 ist das Bild davon.

### 11.7 Vier Punkte erreichen im gesamten Korpus einen Mittelwert von 5,00

`A/D27` Rollout, Gates und Rückbau · `C/VP-03` Halluzinationsbefund · `C/VP-08` Rollenzuweisung im Merge · `C/VP-11` Gesetz II.

Das sind die vier Stellen, an denen alle vier Datensätze gleichzeitig als vollständig belegt gelten. Sie sind der harte Kern, auf dem Step 4 aufsetzen kann, ohne nachzumessen.

Am unteren Ende liegen vier Punkte bei 3,00: `B02` Aktualitäts-/Lieferfähigkeitsdaten, `B22` Token-effiziente Formate, `B32` Eigenmessung/Empirie und `C/VP-17` `ENABLE_TOOL_SEARCH`. Der letzte ist inzwischen erledigt (§8.4) — die anderen drei markieren dieselbe Lücke aus drei Blickwinkeln: **der Korpus ist überall dort schwach, wo eigene Messung statt Literaturarbeit verlangt ist.**
## 12. Punktweise Vollübersicht — alle 98 Vergleichspunkte

Spalten in einheitlicher Reihenfolge GPT / OPUS / K3 / KIMI, unabhängig von der Spaltenreihenfolge des Originaldokuments. `Ø Punkt` ist der Mittelwert über die vier Datensätze und misst, wie gut der Korpus diesen Punkt insgesamt abdeckt. `Δ` ist die Spanne zwischen bestem und schlechtestem Datensatz im selben Punkt. `T` verweist auf das Teilbereich in §13.

### 12.1 Dokument A — Crosswalk D01–D32

| ID | Gegenstand | GPT | OPUS | K3 | KIMI | Ø Punkt | Δ | T |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `D01` | Auftrag, Abgrenzung und Zielgröße | 5 | 5 | 4 | 4 | **4,50** | 1 | T01 |
| `D02` | Evidenzstandard und Nennerdisziplin | 5 | 5 | 4 | 5 | **4,75** | 1 | T02 |
| `D03` | Repo-Inventar und behauptete Vollständigkeit | 5 | 5 | 3 | 4 | **4,25** | 2 | T03 |
| `D04` | Aktualität, Lizenz und Lieferfähigkeit | 4 | 5 | 3 | 4 | **4,00** | 2 | T04 |
| `D05` | Gleichwertige Agentenbewertung | 5 | 5 | 4 | 1 | **3,75** | 4 | T05 |
| `D06` | Funktionsprüfung vorhandener Artefakte | 5 | 5 | 4 | 1 | **3,75** | 4 | T06 |
| `D07` | Claude-Code-Faktencheck | 5 | 5 | 4 | 4 | **4,50** | 1 | T07 |
| `D08` | Prefix-, CLAUDE.md- und Rules-Disziplin | 5 | 5 | 4 | 5 | **4,75** | 1 | T11 |
| `D09` | Prompt-Cache und Prefix-Stabilität | 5 | 5 | 4 | 5 | **4,75** | 1 | T12 |
| `D10` | Native Tool Search und MCP-Schemafläche | 5 | 4 | 4 | 5 | **4,50** | 1 | T08 |
| `D11` | Reihenfolge der Sparmechanismen | 5 | 5 | 4 | 5 | **4,75** | 1 | T14 |
| `D12` | Verhaltens-/Output-Skills | 4 | 3 | 5 | 5 | **4,25** | 2 | T23 |
| `D13` | Bash- und Tool-Output-Owner | 5 | 5 | 4 | 4 | **4,50** | 1 | T19 |
| `D14` | External-Data-Sandbox / Context Mode | 5 | 4 | 3 | 5 | **4,25** | 2 | T25 |
| `D15` | Tool-Schema-Kompression / Gateways | 5 | 3 | 3 | 5 | **4,00** | 2 | T25 |
| `D16` | Code-Retrieval und genau ein Index | 5 | 5 | 4 | 5 | **4,75** | 1 | T21 |
| `D17` | Sessiongrenze und Compact-Strategie | 5 | 5 | 4 | 5 | **4,75** | 1 | T22 |
| `D18` | Memory und Persistenz | 5 | 3 | 4 | 5 | **4,25** | 2 | T27 |
| `D19` | Proxy, Routing und Cache-Fix | 5 | 5 | 4 | 5 | **4,75** | 1 | T24 |
| `D20` | Formate und Repo-Packaging | 3 | 3 | 3 | 5 | **3,50** | 2 | T26 |
| `D21` | Surface-Ownership und Konfliktmatrix | 5 | 5 | 4 | 4 | **4,50** | 1 | T13 |
| `D22` | Security, Datenintegrität und Recovery | 5 | 5 | 5 | 4 | **4,75** | 1 | T35 |
| `D23` | `bash-dump-guard.mjs` | 5 | 5 | 5 | 3 | **4,50** | 2 | T19 |
| `D24` | Ladder-Modell | 5 | 5 | 4 | 4 | **4,50** | 1 | T28 |
| `D25` | Token- und Kostenmessung | 5 | 5 | 4 | 4 | **4,50** | 1 | T16 |
| `D26` | Zielprofile und Aktivierungsregeln | 5 | 4 | 4 | 5 | **4,50** | 1 | T34 |
| `D27` | Rollout, Gates und Rückbau | 5 | 5 | 5 | 5 | **5,00** | 0 | T31 |
| `D28` | Packaging, Installer und Portabilität | 5 | 4 | 4 | 1 | **3,50** | 4 | T30 |
| `D29` | Maschinenlesbarkeit und SSOT | 5 | 5 | 3 | 4 | **4,25** | 2 | T33 |
| `D30` | Explizite Nicht-Empfehlungen und Re-Entry-Trigger | 5 | 5 | 4 | 5 | **4,75** | 1 | T29 |
| `D31` | Finale Stackentscheidung | 5 | 5 | 4 | 4 | **4,50** | 1 | T36 |
| `D32` | Grenzen und offene Punkte | 5 | 5 | 3 | 4 | **4,25** | 2 | T32 |
| | **Dokumentmittel** | 4,88 | 4,62 | 3,91 | 4,19 | **4,40** | | |

### 12.2 Dokument B — Themen-Abgleich 1–32

| ID | Gegenstand | GPT56 | OPUS_V4 | K3 | KIMI | Ø Punkt | Δ | T |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `1` | Repo-Korpus & Verifikationsmethodik | 4 | 5 | 3 | 4 | **4,00** | 2 | T03 |
| `2` | Aktualitäts-/Lieferfähigkeitsdaten | 2 | 5 | 2 | 3 | **3,00** | 3 | T04 |
| `3` | Agenten-Ranking / Bewertungsraster | 5 | 4 | 5 | n/a | **4,67** | 1 | T05 |
| `4` | Native Fakten: MCP Tool Search | 5 | 4 | 3 | 3 | **3,75** | 2 | T08 |
| `5` | Native Fakten: Bash-Limits / Spill | 4 | 5 | 2 | 2 | **3,25** | 3 | T09 |
| `6` | Native Fakten: Hook-Vertrag | 5 | 5 | 4 | 3 | **4,25** | 2 | T10 |
| `7` | Native Fakten: CLAUDE.md / Rules / Compaction | 5 | 4 | 3 | 4 | **4,00** | 2 | T11 |
| `8` | Architekturgesetze | 4 | 5 | 4 | 3 | **4,00** | 2 | T13 |
| `9` | Mechanismus-Taxonomie | 3 | 4 | 4 | 5 | **4,00** | 2 | T14 |
| `10` | Flächen-/Schichtenmodell | 4 | 5 | 4 | 4 | **4,25** | 1 | T15 |
| `11` | Messung & Governance | 4 | 5 | 4 | 4 | **4,25** | 1 | T16 |
| `12` | Prefix-Diät / Stufe 0 | 4 | 5 | 3 | 3 | **3,75** | 2 | T17 |
| `13` | Native Deckel (Env-Variablen) | 4 | 5 | 3 | 3 | **3,75** | 2 | T09 |
| `14` | Capability / Canary | 4 | 5 | 4 | 2 | **3,75** | 3 | T18 |
| `15` | Bash-Output-Owner & Guard | 5 | 5 | 4 | 3 | **4,25** | 2 | T19 |
| `16` | Read-Kontext-Guards | 4 | 5 | 3 | 2 | **3,50** | 3 | T20 |
| `17` | Codeindex / Retrieval | 5 | 5 | 3 | 3 | **4,00** | 2 | T21 |
| `18` | Sitzungsgrenze & Kompaktierung | 4 | 5 | 4 | 4 | **4,25** | 1 | T22 |
| `19` | Verhalten / Implementation-Ladder (ponytail) | 3 | 5 | 3 | 5 | **4,00** | 2 | T23 |
| `20` | Cache-Ebene & Proxys | 4 | 4 | 3 | 5 | **4,00** | 2 | T24 |
| `21` | MCP-Sandbox & Schema-Kompression | 4 | 4 | 3 | 5 | **4,00** | 2 | T25 |
| `22` | Token-effiziente Formate | 3 | 3 | 2 | 4 | **3,00** | 2 | T26 |
| `23` | Memory / Persistenz | 4 | 4 | 3 | 5 | **4,00** | 2 | T27 |
| `24` | Routing | 3 | 3 | 3 | 4 | **3,25** | 1 | T24 |
| `25` | Ladder-Modelle | 4 | 3 | 4 | 5 | **4,00** | 2 | T28 |
| `26` | Absagen / Watchlist | 5 | 5 | 4 | 5 | **4,75** | 1 | T29 |
| `27` | Konfliktmatrix / Owner-Registry | 4 | 5 | 4 | 4 | **4,25** | 1 | T13 |
| `28` | Regelwerk & lauffähiger Code | 5 | 4 | 4 | 2 | **3,75** | 3 | T30 |
| `29` | Rollout / Migration / Gates | 5 | 4 | 4 | 3 | **4,00** | 2 | T31 |
| `30` | Offene Punkte / Selbstdeklaration | 4 | 5 | 3 | 4 | **4,00** | 2 | T32 |
| `31` | Konkrete Token-Zahlen / Budgets | 4 | 5 | 2 | 3 | **3,50** | 3 | T16 |
| `32` | Eigenmessung / Empirie | 3 | 4 | 3 | 2 | **3,00** | 2 | T16 |
| | **Dokumentmittel** | 4,06 | 4,50 | 3,34 | 3,58 | **3,88** | | |

### 12.3 Dokument C — VERGLEICH-4WEGE VP-01–VP-34

| ID | Gegenstand | GPT56 | OURS | K3SW | KIMI | Ø Punkt | Δ | T |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `VP-01` | Prüfverfahren und Nachvollziehbarkeit | 5 | 5 | 4 | 4 | **4,50** | 1 | T02 |
| `VP-02` | Größe der Repo-Union | 5 | 5 | 3 | 3 | **4,00** | 2 | T03 |
| `VP-03` | Halluzinationsbefund | 5 | 5 | 5 | n/a | **5,00** | 0 | T03 |
| `VP-04` | Genauigkeit der Repo-Metadaten | 4 | 5 | 5 | 4 | **4,50** | 1 | T03 |
| `VP-05` | Umgang mit Umbenennungen | 3 | 5 | 5 | 4 | **4,25** | 2 | T03 |
| `VP-06` | Bewertungsraster | 5 | 4 | 4 | n/a | **4,33** | 1 | T05 |
| `VP-07` | Rangfolge der fünf Ursprungsagenten | 5 | 4 | 4 | n/a | **4,33** | 1 | T05 |
| `VP-08` | Rollenzuweisung im Merge | 5 | 5 | 5 | n/a | **5,00** | 0 | T05 |
| `VP-09` | Fehlerregister der Ursprungsagenten | 5 | 4 | 5 | n/a | **4,67** | 1 | T06 |
| `VP-10` | Gesetz I — ein mutierender Owner | 5 | 5 | 5 | 4 | **4,75** | 1 | T13 |
| `VP-11` | Gesetz II — Cache-Stabilität | 5 | 5 | 5 | 5 | **5,00** | 0 | T12 |
| `VP-12` | Gesetz III — Lieferfähigkeit | 3 | 5 | 4 | 4 | **4,00** | 2 | T04 |
| `VP-13` | Lizenzprüfung als Ausschlusskriterium | 4 | 5 | 2 | 3 | **3,50** | 3 | T04 |
| `VP-14` | Wo entstehen die Tokens | 3 | 5 | 4 | 5 | **4,25** | 2 | T15 |
| `VP-15` | Mechanismenordnung | 5 | 5 | 4 | 5 | **4,75** | 1 | T14 |
| `VP-16` | Bash-Output ist nicht der große Hebel | 5 | 5 | 4 | 5 | **4,75** | 1 | T15 |
| `VP-17` | `ENABLE_TOOL_SEARCH` | 5 | 2 | 2 | 3 | **3,00** | 3 | T08 |
| `VP-18` | Skill-Listing-Kosten | 4 | 3 | 4 | 4 | **3,75** | 1 | T17 |
| `VP-19` | Native Env-Deckel | 5 | 3 | 4 | 5 | **4,25** | 2 | T09 |
| `VP-20` | CLAUDE.md- und Rules-Politik | 4 | 4 | 2 | 5 | **3,75** | 3 | T11 |
| `VP-21` | Subagenten-Ökonomie | 4 | 3 | n/a | 5 | **4,00** | 2 | T37 |
| `VP-22` | `updatedToolOutput`-Form | 5 | 3 | 4 | 1 | **3,25** | 4 | T10 |
| `VP-23` | `PreToolUse` `allow`-Semantik | 5 | 3 | 4 | 3 | **3,75** | 2 | T10 |
| `VP-24` | Capability-Canary und Shadow-Fallback | 5 | 5 | 4 | n/a | **4,67** | 1 | T18 |
| `VP-25` | Guard-Spezifikation | 5 | 4 | 4 | 3 | **4,00** | 2 | T19 |
| `VP-26` | Packaging-Defekte des GPT55-Pakets | 5 | 4 | 5 | n/a | **4,67** | 1 | T30 |
| `VP-27` | Ladder-Modell | 5 | 5 | 4 | 4 | **4,50** | 1 | T28 |
| `VP-28` | Bash-Owner-Kandidat | 5 | 5 | 4 | 4 | **4,50** | 1 | T19 |
| `VP-29` | Retrieval / Codeindex | 5 | 4 | 4 | 4 | **4,25** | 1 | T21 |
| `VP-30` | MCP / Schema-Ökonomie | 5 | 4 | 5 | 5 | **4,75** | 1 | T08 |
| `VP-31` | Session-Grenze und Compaction | 5 | 4 | 4 | 5 | **4,50** | 1 | T22 |
| `VP-32` | Explizite Absagen | 5 | 2 | 4 | 4 | **3,75** | 3 | T29 |
| `VP-33` | Neufunde über den Korpus hinaus | 3 | 3 | 5 | 5 | **4,00** | 2 | T38 |
| `VP-34` | Rollout, Abnahmekriterien, Stop-Regeln | 5 | 5 | 5 | 4 | **4,75** | 1 | T31 |
| | **Dokumentmittel** | 4,62 | 4,21 | 4,12 | 4,07 | **4,28** | | |

## 13. Themenmatrix — 38 Teilbereiche über alle drei Dokumente

Die 98 Einzelpunkte sind vollständig und überschneidungsfrei auf 38 Teilbereiche abgebildet. Wo ein Dokument mehrere Punkte zu einem Teilbereich führt, ist der Dokumentwert deren Mittel. `Ø` je Datensatz ist das Mittel über die abdeckenden Dokumente; `Δ` die Inter-Dokument-Spanne.

**T01 · Auftrag, Zielgröße, Abgrenzung** — Abdeckung 1/3 · Themenmittel **4,50** · Führung GPT+OPUS  
<sub>Quellen: A:D01 · B:— · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | — | — | **5,00** | — |
| OPUS | 5,0 | — | — | **5,00** | — |
| K3 | 4,0 | — | — | **4,00** | — |
| KIMI | 4,0 | — | — | **4,00** | — |

**T02 · Evidenzstandard & Nennerdisziplin** — Abdeckung 2/3 · Themenmittel **4,62** · Führung GPT+OPUS  
<sub>Quellen: A:D02 · B:— · C:VP-01</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | — | 5,0 | **5,00** | 0,0 |
| OPUS | 5,0 | — | 5,0 | **5,00** | 0,0 |
| K3 | 4,0 | — | 4,0 | **4,00** | 0,0 |
| KIMI | 5,0 | — | 4,0 | **4,50** | 1,0 |

**T03 · Repo-Union, Inventar & Verifikationsmethodik** — Abdeckung 3/3 · Themenmittel **4,20** · Führung OPUS  
<sub>Quellen: A:D03 · B:1 · C:VP-02,VP-03,VP-04,VP-05</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 4,0 | 4,2 | **4,42** | 1,0 |
| OPUS | 5,0 | 5,0 | 5,0 | **5,00** | 0,0 |
| K3 | 3,0 | 3,0 | 4,5 | **3,50** | 1,5 |
| KIMI | 4,0 | 4,0 | 3,7 | **3,89** | 0,3 |

**T04 · Aktualität, Lizenz & Lieferfähigkeit** — Abdeckung 3/3 · Themenmittel **3,58** · Führung OPUS  
<sub>Quellen: A:D04 · B:2 · C:VP-12,VP-13</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 4,0 | 2,0 | 3,5 | **3,17** | 2,0 |
| OPUS | 5,0 | 5,0 | 5,0 | **5,00** | 0,0 |
| K3 | 3,0 | 2,0 | 3,0 | **2,67** | 1,0 |
| KIMI | 4,0 | 3,0 | 3,5 | **3,50** | 1,0 |

**T05 · Agenten-Bewertungsraster & Rangfolge** — Abdeckung 3/3 · Themenmittel **3,72** · Führung GPT  
<sub>Quellen: A:D05 · B:3 · C:VP-06,VP-07,VP-08</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 5,0 | 5,0 | **5,00** | 0,0 |
| OPUS | 5,0 | 4,0 | 4,3 | **4,44** | 1,0 |
| K3 | 4,0 | 5,0 | 4,3 | **4,44** | 1,0 |
| KIMI | 1,0 | — | — | **1,00** | — |

**T06 · Funktionsprüfung & Fehlerregister** — Abdeckung 2/3 · Themenmittel **3,75** · Führung GPT  
<sub>Quellen: A:D06 · B:— · C:VP-09</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | — | 5,0 | **5,00** | 0,0 |
| OPUS | 5,0 | — | 4,0 | **4,50** | 1,0 |
| K3 | 4,0 | — | 5,0 | **4,50** | 1,0 |
| KIMI | 1,0 | — | — | **1,00** | — |

**T07 · Claude-Code-Faktencheck allgemein** — Abdeckung 1/3 · Themenmittel **4,50** · Führung GPT+OPUS  
<sub>Quellen: A:D07 · B:— · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | — | — | **5,00** | — |
| OPUS | 5,0 | — | — | **5,00** | — |
| K3 | 4,0 | — | — | **4,00** | — |
| KIMI | 4,0 | — | — | **4,00** | — |

**T08 · Native Tool Search & MCP-Schemafläche** — Abdeckung 3/3 · Themenmittel **4,04** · Führung GPT  
<sub>Quellen: A:D10 · B:4 · C:VP-17,VP-30</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 5,0 | 5,0 | **5,00** | 0,0 |
| OPUS | 4,0 | 4,0 | 3,0 | **3,67** | 1,0 |
| K3 | 4,0 | 3,0 | 3,5 | **3,50** | 1,0 |
| KIMI | 5,0 | 3,0 | 4,0 | **4,00** | 2,0 |

**T09 · Native Bash-Limits & Env-Deckel** — Abdeckung 2/3 · Themenmittel **3,88** · Führung GPT  
<sub>Quellen: A:— · B:5,13 · C:VP-19</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | — | 4,0 | 5,0 | **4,50** | 1,0 |
| OPUS | — | 5,0 | 3,0 | **4,00** | 2,0 |
| K3 | — | 2,5 | 4,0 | **3,25** | 1,5 |
| KIMI | — | 2,5 | 5,0 | **3,75** | 2,5 |

**T10 · Hook-Vertrag & updatedToolOutput-Form** — Abdeckung 2/3 · Themenmittel **3,88** · Führung GPT  
<sub>Quellen: A:— · B:6 · C:VP-22,VP-23</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | — | 5,0 | 5,0 | **5,00** | 0,0 |
| OPUS | — | 5,0 | 3,0 | **4,00** | 2,0 |
| K3 | — | 4,0 | 4,0 | **4,00** | 0,0 |
| KIMI | — | 3,0 | 2,0 | **2,50** | 1,0 |

**T11 · CLAUDE.md, Rules & Compaction-Reinjektion** — Abdeckung 3/3 · Themenmittel **4,17** · Führung GPT+KIMI  
<sub>Quellen: A:D08 · B:7 · C:VP-20</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 5,0 | 4,0 | **4,67** | 1,0 |
| OPUS | 5,0 | 4,0 | 4,0 | **4,33** | 1,0 |
| K3 | 4,0 | 3,0 | 2,0 | **3,00** | 2,0 |
| KIMI | 5,0 | 4,0 | 5,0 | **4,67** | 1,0 |

**T12 · Prompt-Cache & Prefix-Stabilität (Gesetz II)** — Abdeckung 2/3 · Themenmittel **4,88** · Führung GPT+OPUS+KIMI  
<sub>Quellen: A:D09 · B:— · C:VP-11</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | — | 5,0 | **5,00** | 0,0 |
| OPUS | 5,0 | — | 5,0 | **5,00** | 0,0 |
| K3 | 4,0 | — | 5,0 | **4,50** | 1,0 |
| KIMI | 5,0 | — | 5,0 | **5,00** | 0,0 |

**T13 · Architekturgesetze & Surface-Ownership** — Abdeckung 3/3 · Themenmittel **4,46** · Führung OPUS  
<sub>Quellen: A:D21 · B:8,27 · C:VP-10</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 4,0 | 5,0 | **4,67** | 1,0 |
| OPUS | 5,0 | 5,0 | 5,0 | **5,00** | 0,0 |
| K3 | 4,0 | 4,0 | 5,0 | **4,33** | 1,0 |
| KIMI | 4,0 | 3,5 | 4,0 | **3,83** | 0,5 |

**T14 · Mechanismus-Taxonomie & Reihenfolge** — Abdeckung 3/3 · Themenmittel **4,50** · Führung KIMI  
<sub>Quellen: A:D11 · B:9 · C:VP-15</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 3,0 | 5,0 | **4,33** | 2,0 |
| OPUS | 5,0 | 4,0 | 5,0 | **4,67** | 1,0 |
| K3 | 4,0 | 4,0 | 4,0 | **4,00** | 0,0 |
| KIMI | 5,0 | 5,0 | 5,0 | **5,00** | 0,0 |

**T15 · Flächenmodell & Token-Anatomie** — Abdeckung 2/3 · Themenmittel **4,38** · Führung OPUS  
<sub>Quellen: A:— · B:10 · C:VP-14,VP-16</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | — | 4,0 | 4,0 | **4,00** | 0,0 |
| OPUS | — | 5,0 | 5,0 | **5,00** | 0,0 |
| K3 | — | 4,0 | 4,0 | **4,00** | 0,0 |
| KIMI | — | 4,0 | 5,0 | **4,50** | 1,0 |

**T16 · Messung & Governance** — Abdeckung 2/3 · Themenmittel **4,04** · Führung OPUS  
<sub>Quellen: A:D25 · B:11,31,32 · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 3,7 | — | **4,33** | 1,3 |
| OPUS | 5,0 | 4,7 | — | **4,83** | 0,3 |
| K3 | 4,0 | 3,0 | — | **3,50** | 1,0 |
| KIMI | 4,0 | 3,0 | — | **3,50** | 1,0 |

**T17 · Prefix-Diät Stufe 0 & Skill-Listing-Kosten** — Abdeckung 2/3 · Themenmittel **3,75** · Führung GPT+OPUS  
<sub>Quellen: A:— · B:12 · C:VP-18</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | — | 4,0 | 4,0 | **4,00** | 0,0 |
| OPUS | — | 5,0 | 3,0 | **4,00** | 2,0 |
| K3 | — | 3,0 | 4,0 | **3,50** | 1,0 |
| KIMI | — | 3,0 | 4,0 | **3,50** | 1,0 |

**T18 · Capability / Canary / Shadow-Fallback** — Abdeckung 2/3 · Themenmittel **3,88** · Führung OPUS  
<sub>Quellen: A:— · B:14 · C:VP-24</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | — | 4,0 | 5,0 | **4,50** | 1,0 |
| OPUS | — | 5,0 | 5,0 | **5,00** | 0,0 |
| K3 | — | 4,0 | 4,0 | **4,00** | 0,0 |
| KIMI | — | 2,0 | — | **2,00** | — |

**T19 · Bash-Output-Owner & Guard-Spezifikation** — Abdeckung 3/3 · Themenmittel **4,33** · Führung GPT  
<sub>Quellen: A:D13,D23 · B:15 · C:VP-25,VP-28</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 5,0 | 5,0 | **5,00** | 0,0 |
| OPUS | 5,0 | 5,0 | 4,5 | **4,83** | 0,5 |
| K3 | 4,5 | 4,0 | 4,0 | **4,17** | 0,5 |
| KIMI | 3,5 | 3,0 | 3,5 | **3,33** | 0,5 |

**T20 · Read-Kontext-Guards** — Abdeckung 1/3 · Themenmittel **3,50** · Führung OPUS  
<sub>Quellen: A:— · B:16 · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | — | 4,0 | — | **4,00** | — |
| OPUS | — | 5,0 | — | **5,00** | — |
| K3 | — | 3,0 | — | **3,00** | — |
| KIMI | — | 2,0 | — | **2,00** | — |

**T21 · Codeindex / Retrieval** — Abdeckung 3/3 · Themenmittel **4,33** · Führung GPT  
<sub>Quellen: A:D16 · B:17 · C:VP-29</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 5,0 | 5,0 | **5,00** | 0,0 |
| OPUS | 5,0 | 5,0 | 4,0 | **4,67** | 1,0 |
| K3 | 4,0 | 3,0 | 4,0 | **3,67** | 1,0 |
| KIMI | 5,0 | 3,0 | 4,0 | **4,00** | 2,0 |

**T22 · Sitzungsgrenze & Kompaktierung** — Abdeckung 3/3 · Themenmittel **4,50** · Führung GPT+OPUS+KIMI  
<sub>Quellen: A:D17 · B:18 · C:VP-31</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 4,0 | 5,0 | **4,67** | 1,0 |
| OPUS | 5,0 | 5,0 | 4,0 | **4,67** | 1,0 |
| K3 | 4,0 | 4,0 | 4,0 | **4,00** | 0,0 |
| KIMI | 5,0 | 4,0 | 5,0 | **4,67** | 1,0 |

**T23 · Verhaltens-/Output-Skills (ponytail)** — Abdeckung 2/3 · Themenmittel **4,12** · Führung KIMI  
<sub>Quellen: A:D12 · B:19 · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 4,0 | 3,0 | — | **3,50** | 1,0 |
| OPUS | 3,0 | 5,0 | — | **4,00** | 2,0 |
| K3 | 5,0 | 3,0 | — | **4,00** | 2,0 |
| KIMI | 5,0 | 5,0 | — | **5,00** | 0,0 |

**T24 · Cache-Ebene, Proxys & Routing** — Abdeckung 2/3 · Themenmittel **4,19** · Führung KIMI  
<sub>Quellen: A:D19 · B:20,24 · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 3,5 | — | **4,25** | 1,5 |
| OPUS | 5,0 | 3,5 | — | **4,25** | 1,5 |
| K3 | 4,0 | 3,0 | — | **3,50** | 1,0 |
| KIMI | 5,0 | 4,5 | — | **4,75** | 0,5 |

**T25 · MCP-Sandbox & Schema-Kompression** — Abdeckung 2/3 · Themenmittel **4,06** · Führung KIMI  
<sub>Quellen: A:D14,D15 · B:21 · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 4,0 | — | **4,50** | 1,0 |
| OPUS | 3,5 | 4,0 | — | **3,75** | 0,5 |
| K3 | 3,0 | 3,0 | — | **3,00** | 0,0 |
| KIMI | 5,0 | 5,0 | — | **5,00** | 0,0 |

**T26 · Token-effiziente Formate & Packaging** — Abdeckung 2/3 · Themenmittel **3,25** · Führung KIMI  
<sub>Quellen: A:D20 · B:22 · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 3,0 | 3,0 | — | **3,00** | 0,0 |
| OPUS | 3,0 | 3,0 | — | **3,00** | 0,0 |
| K3 | 3,0 | 2,0 | — | **2,50** | 1,0 |
| KIMI | 5,0 | 4,0 | — | **4,50** | 1,0 |

**T27 · Memory & Persistenz** — Abdeckung 2/3 · Themenmittel **4,12** · Führung KIMI  
<sub>Quellen: A:D18 · B:23 · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 4,0 | — | **4,50** | 1,0 |
| OPUS | 3,0 | 4,0 | — | **3,50** | 1,0 |
| K3 | 4,0 | 3,0 | — | **3,50** | 1,0 |
| KIMI | 5,0 | 5,0 | — | **5,00** | 0,0 |

**T28 · Ladder-Modelle** — Abdeckung 3/3 · Themenmittel **4,33** · Führung GPT  
<sub>Quellen: A:D24 · B:25 · C:VP-27</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 4,0 | 5,0 | **4,67** | 1,0 |
| OPUS | 5,0 | 3,0 | 5,0 | **4,33** | 2,0 |
| K3 | 4,0 | 4,0 | 4,0 | **4,00** | 0,0 |
| KIMI | 4,0 | 5,0 | 4,0 | **4,33** | 1,0 |

**T29 · Absagen & Watchlist** — Abdeckung 3/3 · Themenmittel **4,42** · Führung GPT  
<sub>Quellen: A:D30 · B:26 · C:VP-32</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 5,0 | 5,0 | **5,00** | 0,0 |
| OPUS | 5,0 | 5,0 | 2,0 | **4,00** | 3,0 |
| K3 | 4,0 | 4,0 | 4,0 | **4,00** | 0,0 |
| KIMI | 5,0 | 5,0 | 4,0 | **4,67** | 1,0 |

**T30 · Packaging, Installer & lauffähiger Code** — Abdeckung 3/3 · Themenmittel **3,71** · Führung GPT  
<sub>Quellen: A:D28 · B:28 · C:VP-26</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 5,0 | 5,0 | **5,00** | 0,0 |
| OPUS | 4,0 | 4,0 | 4,0 | **4,00** | 0,0 |
| K3 | 4,0 | 4,0 | 5,0 | **4,33** | 1,0 |
| KIMI | 1,0 | 2,0 | — | **1,50** | 1,0 |

**T31 · Rollout, Gates & Rückbau** — Abdeckung 3/3 · Themenmittel **4,58** · Führung GPT  
<sub>Quellen: A:D27 · B:29 · C:VP-34</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 5,0 | 5,0 | **5,00** | 0,0 |
| OPUS | 5,0 | 4,0 | 5,0 | **4,67** | 1,0 |
| K3 | 5,0 | 4,0 | 5,0 | **4,67** | 1,0 |
| KIMI | 5,0 | 3,0 | 4,0 | **4,00** | 2,0 |

**T32 · Offene Punkte & Selbstdeklaration** — Abdeckung 2/3 · Themenmittel **4,12** · Führung OPUS  
<sub>Quellen: A:D32 · B:30 · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | 4,0 | — | **4,50** | 1,0 |
| OPUS | 5,0 | 5,0 | — | **5,00** | 0,0 |
| K3 | 3,0 | 3,0 | — | **3,00** | 0,0 |
| KIMI | 4,0 | 4,0 | — | **4,00** | 0,0 |

**T33 · Maschinenlesbarkeit & Single Sources of Truth** — Abdeckung 1/3 · Themenmittel **4,25** · Führung GPT+OPUS  
<sub>Quellen: A:D29 · B:— · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | — | — | **5,00** | — |
| OPUS | 5,0 | — | — | **5,00** | — |
| K3 | 3,0 | — | — | **3,00** | — |
| KIMI | 4,0 | — | — | **4,00** | — |

**T34 · Zielprofile & Aktivierungsregeln** — Abdeckung 1/3 · Themenmittel **4,50** · Führung GPT+KIMI  
<sub>Quellen: A:D26 · B:— · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | — | — | **5,00** | — |
| OPUS | 4,0 | — | — | **4,00** | — |
| K3 | 4,0 | — | — | **4,00** | — |
| KIMI | 5,0 | — | — | **5,00** | — |

**T35 · Security, Datenintegrität & Recovery** — Abdeckung 1/3 · Themenmittel **4,75** · Führung GPT+OPUS+K3  
<sub>Quellen: A:D22 · B:— · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | — | — | **5,00** | — |
| OPUS | 5,0 | — | — | **5,00** | — |
| K3 | 5,0 | — | — | **5,00** | — |
| KIMI | 4,0 | — | — | **4,00** | — |

**T36 · Finale Stackentscheidung** — Abdeckung 1/3 · Themenmittel **4,50** · Führung GPT+OPUS  
<sub>Quellen: A:D31 · B:— · C:—</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | 5,0 | — | — | **5,00** | — |
| OPUS | 5,0 | — | — | **5,00** | — |
| K3 | 4,0 | — | — | **4,00** | — |
| KIMI | 4,0 | — | — | **4,00** | — |

**T37 · Subagenten-Ökonomie** — Abdeckung 1/3 · Themenmittel **4,00** · Führung KIMI  
<sub>Quellen: A:— · B:— · C:VP-21</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | — | — | 4,0 | **4,00** | — |
| OPUS | — | — | 3,0 | **3,00** | — |
| K3 | — | — | — | **—** | — |
| KIMI | — | — | 5,0 | **5,00** | — |

**T38 · Neufunde / Zugewinn** — Abdeckung 1/3 · Themenmittel **4,00** · Führung K3+KIMI  
<sub>Quellen: A:— · B:— · C:VP-33</sub>

| Datensatz | A | B | C | Ø | Δ |
|---|---:|---:|---:|---:|---:|
| GPT | — | — | 3,0 | **3,00** | — |
| OPUS | — | — | 3,0 | **3,00** | — |
| K3 | — | — | 5,0 | **5,00** | — |
| KIMI | — | — | 5,0 | **5,00** | — |

## 14. Gesamtübersicht — Datensatz × Teilbereich

| T | Teilbereich | GPT | OPUS | K3 | KIMI | Ø | Abd. | Führung |
|---|---|---:|---:|---:|---:|---:|---:|---|
| T01 | Auftrag, Zielgröße, Abgrenzung | 5,00 | 5,00 | 4,00 | 4,00 | **4,50** | 1/3 | GPT+OPUS |
| T02 | Evidenzstandard & Nennerdisziplin | 5,00 | 5,00 | 4,00 | 4,50 | **4,62** | 2/3 | GPT+OPUS |
| T03 | Repo-Union, Inventar & Verifikationsmethodik | 4,42 | 5,00 | 3,50 | 3,89 | **4,20** | 3/3 | OPUS |
| T04 | Aktualität, Lizenz & Lieferfähigkeit | 3,17 | 5,00 | 2,67 | 3,50 | **3,58** | 3/3 | OPUS |
| T05 | Agenten-Bewertungsraster & Rangfolge | 5,00 | 4,44 | 4,44 | 1,00 | **3,72** | 3/3 | GPT |
| T06 | Funktionsprüfung & Fehlerregister | 5,00 | 4,50 | 4,50 | 1,00 | **3,75** | 2/3 | GPT |
| T07 | Claude-Code-Faktencheck allgemein | 5,00 | 5,00 | 4,00 | 4,00 | **4,50** | 1/3 | GPT+OPUS |
| T08 | Native Tool Search & MCP-Schemafläche | 5,00 | 3,67 | 3,50 | 4,00 | **4,04** | 3/3 | GPT |
| T09 | Native Bash-Limits & Env-Deckel | 4,50 | 4,00 | 3,25 | 3,75 | **3,88** | 2/3 | GPT |
| T10 | Hook-Vertrag & updatedToolOutput-Form | 5,00 | 4,00 | 4,00 | 2,50 | **3,88** | 2/3 | GPT |
| T11 | CLAUDE.md, Rules & Compaction-Reinjektion | 4,67 | 4,33 | 3,00 | 4,67 | **4,17** | 3/3 | GPT+KIMI |
| T12 | Prompt-Cache & Prefix-Stabilität (Gesetz II) | 5,00 | 5,00 | 4,50 | 5,00 | **4,88** | 2/3 | GPT+OPUS+KIMI |
| T13 | Architekturgesetze & Surface-Ownership | 4,67 | 5,00 | 4,33 | 3,83 | **4,46** | 3/3 | OPUS |
| T14 | Mechanismus-Taxonomie & Reihenfolge | 4,33 | 4,67 | 4,00 | 5,00 | **4,50** | 3/3 | KIMI |
| T15 | Flächenmodell & Token-Anatomie | 4,00 | 5,00 | 4,00 | 4,50 | **4,38** | 2/3 | OPUS |
| T16 | Messung & Governance | 4,33 | 4,83 | 3,50 | 3,50 | **4,04** | 2/3 | OPUS |
| T17 | Prefix-Diät Stufe 0 & Skill-Listing-Kosten | 4,00 | 4,00 | 3,50 | 3,50 | **3,75** | 2/3 | GPT+OPUS |
| T18 | Capability / Canary / Shadow-Fallback | 4,50 | 5,00 | 4,00 | 2,00 | **3,88** | 2/3 | OPUS |
| T19 | Bash-Output-Owner & Guard-Spezifikation | 5,00 | 4,83 | 4,17 | 3,33 | **4,33** | 3/3 | GPT |
| T20 | Read-Kontext-Guards | 4,00 | 5,00 | 3,00 | 2,00 | **3,50** | 1/3 | OPUS |
| T21 | Codeindex / Retrieval | 5,00 | 4,67 | 3,67 | 4,00 | **4,33** | 3/3 | GPT |
| T22 | Sitzungsgrenze & Kompaktierung | 4,67 | 4,67 | 4,00 | 4,67 | **4,50** | 3/3 | GPT+OPUS+KIMI |
| T23 | Verhaltens-/Output-Skills (ponytail) | 3,50 | 4,00 | 4,00 | 5,00 | **4,12** | 2/3 | KIMI |
| T24 | Cache-Ebene, Proxys & Routing | 4,25 | 4,25 | 3,50 | 4,75 | **4,19** | 2/3 | KIMI |
| T25 | MCP-Sandbox & Schema-Kompression | 4,50 | 3,75 | 3,00 | 5,00 | **4,06** | 2/3 | KIMI |
| T26 | Token-effiziente Formate & Packaging | 3,00 | 3,00 | 2,50 | 4,50 | **3,25** | 2/3 | KIMI |
| T27 | Memory & Persistenz | 4,50 | 3,50 | 3,50 | 5,00 | **4,12** | 2/3 | KIMI |
| T28 | Ladder-Modelle | 4,67 | 4,33 | 4,00 | 4,33 | **4,33** | 3/3 | GPT |
| T29 | Absagen & Watchlist | 5,00 | 4,00 | 4,00 | 4,67 | **4,42** | 3/3 | GPT |
| T30 | Packaging, Installer & lauffähiger Code | 5,00 | 4,00 | 4,33 | 1,50 | **3,71** | 3/3 | GPT |
| T31 | Rollout, Gates & Rückbau | 5,00 | 4,67 | 4,67 | 4,00 | **4,58** | 3/3 | GPT |
| T32 | Offene Punkte & Selbstdeklaration | 4,50 | 5,00 | 3,00 | 4,00 | **4,12** | 2/3 | OPUS |
| T33 | Maschinenlesbarkeit & Single Sources of Truth | 5,00 | 5,00 | 3,00 | 4,00 | **4,25** | 1/3 | GPT+OPUS |
| T34 | Zielprofile & Aktivierungsregeln | 5,00 | 4,00 | 4,00 | 5,00 | **4,50** | 1/3 | GPT+KIMI |
| T35 | Security, Datenintegrität & Recovery | 5,00 | 5,00 | 5,00 | 4,00 | **4,75** | 1/3 | GPT+OPUS+K3 |
| T36 | Finale Stackentscheidung | 5,00 | 5,00 | 4,00 | 4,00 | **4,50** | 1/3 | GPT+OPUS |
| T37 | Subagenten-Ökonomie | 4,00 | 3,00 | — | 5,00 | **4,00** | 1/3 | KIMI |
| T38 | Neufunde / Zugewinn | 3,00 | 3,00 | 5,00 | 5,00 | **4,00** | 1/3 | K3+KIMI |
| | **Themengewichtetes Mittel** | **4,53** | **4,42** | **3,81** | **3,89** | | | |

### 14.1 Führungshäufigkeit

| Datensatz | führt in … von 38 Teilbereichen | Anteil |
|---|---:|---:|
| GPT | 22 | 58 % |
| OPUS | 17 | 45 % |
| K3 | 2 | 5 % |
| KIMI | 12 | 32 % |

### 14.2 Teilbereiche nach Konsensdichte

| Rang | T | Teilbereich | Ø | Abd. |
|---:|---|---|---:|---:|
| 1 | T12 | Prompt-Cache & Prefix-Stabilität (Gesetz II) | **4,88** | 2/3 |
| 2 | T35 | Security, Datenintegrität & Recovery | **4,75** | 1/3 |
| 3 | T02 | Evidenzstandard & Nennerdisziplin | **4,62** | 2/3 |
| 4 | T31 | Rollout, Gates & Rückbau | **4,58** | 3/3 |
| 5 | T01 | Auftrag, Zielgröße, Abgrenzung | **4,50** | 1/3 |
| 6 | T07 | Claude-Code-Faktencheck allgemein | **4,50** | 1/3 |
| 7 | T14 | Mechanismus-Taxonomie & Reihenfolge | **4,50** | 3/3 |
| 8 | T22 | Sitzungsgrenze & Kompaktierung | **4,50** | 3/3 |
| 9 | T34 | Zielprofile & Aktivierungsregeln | **4,50** | 1/3 |
| 10 | T36 | Finale Stackentscheidung | **4,50** | 1/3 |
| 11 | T13 | Architekturgesetze & Surface-Ownership | **4,46** | 3/3 |
| 12 | T29 | Absagen & Watchlist | **4,42** | 3/3 |
| 13 | T15 | Flächenmodell & Token-Anatomie | **4,38** | 2/3 |
| 14 | T19 | Bash-Output-Owner & Guard-Spezifikation | **4,33** | 3/3 |
| 15 | T21 | Codeindex / Retrieval | **4,33** | 3/3 |
| 16 | T28 | Ladder-Modelle | **4,33** | 3/3 |
| 17 | T33 | Maschinenlesbarkeit & Single Sources of Truth | **4,25** | 1/3 |
| 18 | T03 | Repo-Union, Inventar & Verifikationsmethodik | **4,20** | 3/3 |
| 19 | T24 | Cache-Ebene, Proxys & Routing | **4,19** | 2/3 |
| 20 | T11 | CLAUDE.md, Rules & Compaction-Reinjektion | **4,17** | 3/3 |
| 21 | T23 | Verhaltens-/Output-Skills (ponytail) | **4,12** | 2/3 |
| 22 | T27 | Memory & Persistenz | **4,12** | 2/3 |
| 23 | T32 | Offene Punkte & Selbstdeklaration | **4,12** | 2/3 |
| 24 | T25 | MCP-Sandbox & Schema-Kompression | **4,06** | 2/3 |
| 25 | T08 | Native Tool Search & MCP-Schemafläche | **4,04** | 3/3 |
| 26 | T16 | Messung & Governance | **4,04** | 2/3 |
| 27 | T37 | Subagenten-Ökonomie | **4,00** | 1/3 |
| 28 | T38 | Neufunde / Zugewinn | **4,00** | 1/3 |
| 29 | T09 | Native Bash-Limits & Env-Deckel | **3,88** | 2/3 |
| 30 | T10 | Hook-Vertrag & updatedToolOutput-Form | **3,88** | 2/3 |
| 31 | T18 | Capability / Canary / Shadow-Fallback | **3,88** | 2/3 |
| 32 | T06 | Funktionsprüfung & Fehlerregister | **3,75** | 2/3 |
| 33 | T17 | Prefix-Diät Stufe 0 & Skill-Listing-Kosten | **3,75** | 2/3 |
| 34 | T05 | Agenten-Bewertungsraster & Rangfolge | **3,72** | 3/3 |
| 35 | T30 | Packaging, Installer & lauffähiger Code | **3,71** | 3/3 |
| 36 | T04 | Aktualität, Lizenz & Lieferfähigkeit | **3,58** | 3/3 |
| 37 | T20 | Read-Kontext-Guards | **3,50** | 1/3 |
| 38 | T26 | Token-effiziente Formate & Packaging | **3,25** | 2/3 |

## 15. Aggregationsrobustheit

### 15.1 Themengewichtet gegen punktgewichtet

| Datensatz | themengewichtet (n=38) | punktgewichtet (n=98) | Δ |
|---|---:|---:|---:|
| GPT | 4,53 | 4,52 | 0,01 |
| OPUS | 4,42 | 4,44 | -0,01 |
| K3 | 3,81 | 3,79 | 0,02 |
| KIMI | 3,89 | 3,94 | -0,05 |

### 15.2 Strengekorrigiert — Abweichung vom jeweiligen Dokumentmittel

| Datensatz | A | B | C | Ø Abweichung | Rang |
|---|---:|---:|---:|---:|---:|
| GPT | +0,48 | +0,19 | +0,35 | **+0,34** | 1 |
| OPUS | +0,23 | +0,63 | -0,06 | **+0,26** | 2 |
| K3 | -0,49 | -0,53 | -0,14 | **-0,39** | 4 |
| KIMI | -0,21 | -0,29 | -0,19 | **-0,23** | 3 |

| Dokument | eigenes Notenmittel | 5er | 4er | 3er | 2er | 1er | n/a |
|---|---:|---:|---:|---:|---:|---:|---:|
| A | **4,40** | 73 | 39 | 13 | 0 | 3 | 0 |
| B | **3,87** | 36 | 49 | 32 | 10 | 0 | 1 |
| C | **4,27** | 63 | 43 | 16 | 5 | 1 | 8 |

## 16. Maschinenlesbare Blöcke

### 16.1 Alle 98 Punkte

```tsv
dok	punkt_id	thema_id	gegenstand	GPT	OPUS	K3	KIMI	punkt_mittel	spanne
A	D01	T01	Auftrag, Abgrenzung und Zielgröße	5	5	4	4	4.50	1
A	D02	T02	Evidenzstandard und Nennerdisziplin	5	5	4	5	4.75	1
A	D03	T03	Repo-Inventar und behauptete Vollständigkeit	5	5	3	4	4.25	2
A	D04	T04	Aktualität, Lizenz und Lieferfähigkeit	4	5	3	4	4.00	2
A	D05	T05	Gleichwertige Agentenbewertung	5	5	4	1	3.75	4
A	D06	T06	Funktionsprüfung vorhandener Artefakte	5	5	4	1	3.75	4
A	D07	T07	Claude-Code-Faktencheck	5	5	4	4	4.50	1
A	D08	T11	Prefix-, CLAUDE.md- und Rules-Disziplin	5	5	4	5	4.75	1
A	D09	T12	Prompt-Cache und Prefix-Stabilität	5	5	4	5	4.75	1
A	D10	T08	Native Tool Search und MCP-Schemafläche	5	4	4	5	4.50	1
A	D11	T14	Reihenfolge der Sparmechanismen	5	5	4	5	4.75	1
A	D12	T23	Verhaltens-/Output-Skills	4	3	5	5	4.25	2
A	D13	T19	Bash- und Tool-Output-Owner	5	5	4	4	4.50	1
A	D14	T25	External-Data-Sandbox / Context Mode	5	4	3	5	4.25	2
A	D15	T25	Tool-Schema-Kompression / Gateways	5	3	3	5	4.00	2
A	D16	T21	Code-Retrieval und genau ein Index	5	5	4	5	4.75	1
A	D17	T22	Sessiongrenze und Compact-Strategie	5	5	4	5	4.75	1
A	D18	T27	Memory und Persistenz	5	3	4	5	4.25	2
A	D19	T24	Proxy, Routing und Cache-Fix	5	5	4	5	4.75	1
A	D20	T26	Formate und Repo-Packaging	3	3	3	5	3.50	2
A	D21	T13	Surface-Ownership und Konfliktmatrix	5	5	4	4	4.50	1
A	D22	T35	Security, Datenintegrität und Recovery	5	5	5	4	4.75	1
A	D23	T19	bash-dump-guard.mjs	5	5	5	3	4.50	2
A	D24	T28	Ladder-Modell	5	5	4	4	4.50	1
A	D25	T16	Token- und Kostenmessung	5	5	4	4	4.50	1
A	D26	T34	Zielprofile und Aktivierungsregeln	5	4	4	5	4.50	1
A	D27	T31	Rollout, Gates und Rückbau	5	5	5	5	5.00	0
A	D28	T30	Packaging, Installer und Portabilität	5	4	4	1	3.50	4
A	D29	T33	Maschinenlesbarkeit und SSOT	5	5	3	4	4.25	2
A	D30	T29	Explizite Nicht-Empfehlungen und Re-Entry-Trigger	5	5	4	5	4.75	1
A	D31	T36	Finale Stackentscheidung	5	5	4	4	4.50	1
A	D32	T32	Grenzen und offene Punkte	5	5	3	4	4.25	2
B	B01	T03	Repo-Korpus & Verifikationsmethodik	4	5	3	4	4.00	2
B	B02	T04	Aktualitäts-/Lieferfähigkeitsdaten	2	5	2	3	3.00	3
B	B03	T05	Agenten-Ranking / Bewertungsraster	5	4	5	na	4.67	1
B	B04	T08	Native Fakten: MCP Tool Search	5	4	3	3	3.75	2
B	B05	T09	Native Fakten: Bash-Limits / Spill	4	5	2	2	3.25	3
B	B06	T10	Native Fakten: Hook-Vertrag	5	5	4	3	4.25	2
B	B07	T11	Native Fakten: CLAUDE.md / Rules / Compaction	5	4	3	4	4.00	2
B	B08	T13	Architekturgesetze	4	5	4	3	4.00	2
B	B09	T14	Mechanismus-Taxonomie	3	4	4	5	4.00	2
B	B10	T15	Flächen-/Schichtenmodell	4	5	4	4	4.25	1
B	B11	T16	Messung & Governance	4	5	4	4	4.25	1
B	B12	T17	Prefix-Diät / Stufe 0	4	5	3	3	3.75	2
B	B13	T09	Native Deckel (Env-Variablen)	4	5	3	3	3.75	2
B	B14	T18	Capability / Canary	4	5	4	2	3.75	3
B	B15	T19	Bash-Output-Owner & Guard	5	5	4	3	4.25	2
B	B16	T20	Read-Kontext-Guards	4	5	3	2	3.50	3
B	B17	T21	Codeindex / Retrieval	5	5	3	3	4.00	2
B	B18	T22	Sitzungsgrenze & Kompaktierung	4	5	4	4	4.25	1
B	B19	T23	Verhalten / Implementation-Ladder (ponytail)	3	5	3	5	4.00	2
B	B20	T24	Cache-Ebene & Proxys	4	4	3	5	4.00	2
B	B21	T25	MCP-Sandbox & Schema-Kompression	4	4	3	5	4.00	2
B	B22	T26	Token-effiziente Formate	3	3	2	4	3.00	2
B	B23	T27	Memory / Persistenz	4	4	3	5	4.00	2
B	B24	T24	Routing	3	3	3	4	3.25	1
B	B25	T28	Ladder-Modelle	4	3	4	5	4.00	2
B	B26	T29	Absagen / Watchlist	5	5	4	5	4.75	1
B	B27	T13	Konfliktmatrix / Owner-Registry	4	5	4	4	4.25	1
B	B28	T30	Regelwerk & lauffähiger Code	5	4	4	2	3.75	3
B	B29	T31	Rollout / Migration / Gates	5	4	4	3	4.00	2
B	B30	T32	Offene Punkte / Selbstdeklaration	4	5	3	4	4.00	2
B	B31	T16	Konkrete Token-Zahlen / Budgets	4	5	2	3	3.50	3
B	B32	T16	Eigenmessung / Empirie	3	4	3	2	3.00	2
C	VP-01	T02	Prüfverfahren und Nachvollziehbarkeit	5	5	4	4	4.50	1
C	VP-02	T03	Größe der Repo-Union	5	5	3	3	4.00	2
C	VP-03	T03	Halluzinationsbefund	5	5	5	na	5.00	0
C	VP-04	T03	Genauigkeit der Repo-Metadaten	4	5	5	4	4.50	1
C	VP-05	T03	Umgang mit Umbenennungen	3	5	5	4	4.25	2
C	VP-06	T05	Bewertungsraster	5	4	4	na	4.33	1
C	VP-07	T05	Rangfolge der fünf Ursprungsagenten	5	4	4	na	4.33	1
C	VP-08	T05	Rollenzuweisung im Merge	5	5	5	na	5.00	0
C	VP-09	T06	Fehlerregister der Ursprungsagenten	5	4	5	na	4.67	1
C	VP-10	T13	Gesetz I — ein mutierender Owner	5	5	5	4	4.75	1
C	VP-11	T12	Gesetz II — Cache-Stabilität	5	5	5	5	5.00	0
C	VP-12	T04	Gesetz III — Lieferfähigkeit	3	5	4	4	4.00	2
C	VP-13	T04	Lizenzprüfung als Ausschlusskriterium	4	5	2	3	3.50	3
C	VP-14	T15	Wo entstehen die Tokens	3	5	4	5	4.25	2
C	VP-15	T14	Mechanismenordnung	5	5	4	5	4.75	1
C	VP-16	T15	Bash-Output ist nicht der große Hebel	5	5	4	5	4.75	1
C	VP-17	T08	ENABLE_TOOL_SEARCH	5	2	2	3	3.00	3
C	VP-18	T17	Skill-Listing-Kosten	4	3	4	4	3.75	1
C	VP-19	T09	Native Env-Deckel	5	3	4	5	4.25	2
C	VP-20	T11	CLAUDE.md- und Rules-Politik	4	4	2	5	3.75	3
C	VP-21	T37	Subagenten-Ökonomie	4	3	na	5	4.00	2
C	VP-22	T10	updatedToolOutput-Form	5	3	4	1	3.25	4
C	VP-23	T10	PreToolUse allow-Semantik	5	3	4	3	3.75	2
C	VP-24	T18	Capability-Canary und Shadow-Fallback	5	5	4	na	4.67	1
C	VP-25	T19	Guard-Spezifikation	5	4	4	3	4.00	2
C	VP-26	T30	Packaging-Defekte des GPT55-Pakets	5	4	5	na	4.67	1
C	VP-27	T28	Ladder-Modell	5	5	4	4	4.50	1
C	VP-28	T19	Bash-Owner-Kandidat	5	5	4	4	4.50	1
C	VP-29	T21	Retrieval / Codeindex	5	4	4	4	4.25	1
C	VP-30	T08	MCP / Schema-Ökonomie	5	4	5	5	4.75	1
C	VP-31	T22	Session-Grenze und Compaction	5	4	4	5	4.50	1
C	VP-32	T29	Explizite Absagen	5	2	4	4	3.75	3
C	VP-33	T38	Neufunde über den Korpus hinaus	3	3	5	5	4.00	2
C	VP-34	T31	Rollout, Abnahmekriterien, Stop-Regeln	5	5	5	4	4.75	1
```

### 16.2 Themenmatrix

```tsv
thema_id	thema	abdeckung	GPT_A	GPT_B	GPT_C	GPT	OPUS_A	OPUS_B	OPUS_C	OPUS	K3_A	K3_B	K3_C	K3	KIMI_A	KIMI_B	KIMI_C	KIMI	themenmittel	fuehrung
T01	Auftrag, Zielgröße, Abgrenzung	1	5.00	na	na	5.00	5.00	na	na	5.00	4.00	na	na	4.00	4.00	na	na	4.00	4.50	GPT+OPUS
T02	Evidenzstandard & Nennerdisziplin	2	5.00	na	5.00	5.00	5.00	na	5.00	5.00	4.00	na	4.00	4.00	5.00	na	4.00	4.50	4.62	GPT+OPUS
T03	Repo-Union, Inventar & Verifikationsmethodik	3	5.00	4.00	4.25	4.42	5.00	5.00	5.00	5.00	3.00	3.00	4.50	3.50	4.00	4.00	3.67	3.89	4.20	OPUS
T04	Aktualität, Lizenz & Lieferfähigkeit	3	4.00	2.00	3.50	3.17	5.00	5.00	5.00	5.00	3.00	2.00	3.00	2.67	4.00	3.00	3.50	3.50	3.58	OPUS
T05	Agenten-Bewertungsraster & Rangfolge	3	5.00	5.00	5.00	5.00	5.00	4.00	4.33	4.44	4.00	5.00	4.33	4.44	1.00	na	na	1.00	3.72	GPT
T06	Funktionsprüfung & Fehlerregister	2	5.00	na	5.00	5.00	5.00	na	4.00	4.50	4.00	na	5.00	4.50	1.00	na	na	1.00	3.75	GPT
T07	Claude-Code-Faktencheck allgemein	1	5.00	na	na	5.00	5.00	na	na	5.00	4.00	na	na	4.00	4.00	na	na	4.00	4.50	GPT+OPUS
T08	Native Tool Search & MCP-Schemafläche	3	5.00	5.00	5.00	5.00	4.00	4.00	3.00	3.67	4.00	3.00	3.50	3.50	5.00	3.00	4.00	4.00	4.04	GPT
T09	Native Bash-Limits & Env-Deckel	2	na	4.00	5.00	4.50	na	5.00	3.00	4.00	na	2.50	4.00	3.25	na	2.50	5.00	3.75	3.88	GPT
T10	Hook-Vertrag & updatedToolOutput-Form	2	na	5.00	5.00	5.00	na	5.00	3.00	4.00	na	4.00	4.00	4.00	na	3.00	2.00	2.50	3.88	GPT
T11	CLAUDE.md, Rules & Compaction-Reinjektion	3	5.00	5.00	4.00	4.67	5.00	4.00	4.00	4.33	4.00	3.00	2.00	3.00	5.00	4.00	5.00	4.67	4.17	GPT+KIMI
T12	Prompt-Cache & Prefix-Stabilität (Gesetz II)	2	5.00	na	5.00	5.00	5.00	na	5.00	5.00	4.00	na	5.00	4.50	5.00	na	5.00	5.00	4.88	GPT+OPUS+KIMI
T13	Architekturgesetze & Surface-Ownership	3	5.00	4.00	5.00	4.67	5.00	5.00	5.00	5.00	4.00	4.00	5.00	4.33	4.00	3.50	4.00	3.83	4.46	OPUS
T14	Mechanismus-Taxonomie & Reihenfolge	3	5.00	3.00	5.00	4.33	5.00	4.00	5.00	4.67	4.00	4.00	4.00	4.00	5.00	5.00	5.00	5.00	4.50	KIMI
T15	Flächenmodell & Token-Anatomie	2	na	4.00	4.00	4.00	na	5.00	5.00	5.00	na	4.00	4.00	4.00	na	4.00	5.00	4.50	4.38	OPUS
T16	Messung & Governance	2	5.00	3.67	na	4.33	5.00	4.67	na	4.83	4.00	3.00	na	3.50	4.00	3.00	na	3.50	4.04	OPUS
T17	Prefix-Diät Stufe 0 & Skill-Listing-Kosten	2	na	4.00	4.00	4.00	na	5.00	3.00	4.00	na	3.00	4.00	3.50	na	3.00	4.00	3.50	3.75	GPT+OPUS
T18	Capability / Canary / Shadow-Fallback	2	na	4.00	5.00	4.50	na	5.00	5.00	5.00	na	4.00	4.00	4.00	na	2.00	na	2.00	3.88	OPUS
T19	Bash-Output-Owner & Guard-Spezifikation	3	5.00	5.00	5.00	5.00	5.00	5.00	4.50	4.83	4.50	4.00	4.00	4.17	3.50	3.00	3.50	3.33	4.33	GPT
T20	Read-Kontext-Guards	1	na	4.00	na	4.00	na	5.00	na	5.00	na	3.00	na	3.00	na	2.00	na	2.00	3.50	OPUS
T21	Codeindex / Retrieval	3	5.00	5.00	5.00	5.00	5.00	5.00	4.00	4.67	4.00	3.00	4.00	3.67	5.00	3.00	4.00	4.00	4.33	GPT
T22	Sitzungsgrenze & Kompaktierung	3	5.00	4.00	5.00	4.67	5.00	5.00	4.00	4.67	4.00	4.00	4.00	4.00	5.00	4.00	5.00	4.67	4.50	GPT+OPUS+KIMI
T23	Verhaltens-/Output-Skills (ponytail)	2	4.00	3.00	na	3.50	3.00	5.00	na	4.00	5.00	3.00	na	4.00	5.00	5.00	na	5.00	4.12	KIMI
T24	Cache-Ebene, Proxys & Routing	2	5.00	3.50	na	4.25	5.00	3.50	na	4.25	4.00	3.00	na	3.50	5.00	4.50	na	4.75	4.19	KIMI
T25	MCP-Sandbox & Schema-Kompression	2	5.00	4.00	na	4.50	3.50	4.00	na	3.75	3.00	3.00	na	3.00	5.00	5.00	na	5.00	4.06	KIMI
T26	Token-effiziente Formate & Packaging	2	3.00	3.00	na	3.00	3.00	3.00	na	3.00	3.00	2.00	na	2.50	5.00	4.00	na	4.50	3.25	KIMI
T27	Memory & Persistenz	2	5.00	4.00	na	4.50	3.00	4.00	na	3.50	4.00	3.00	na	3.50	5.00	5.00	na	5.00	4.12	KIMI
T28	Ladder-Modelle	3	5.00	4.00	5.00	4.67	5.00	3.00	5.00	4.33	4.00	4.00	4.00	4.00	4.00	5.00	4.00	4.33	4.33	GPT
T29	Absagen & Watchlist	3	5.00	5.00	5.00	5.00	5.00	5.00	2.00	4.00	4.00	4.00	4.00	4.00	5.00	5.00	4.00	4.67	4.42	GPT
T30	Packaging, Installer & lauffähiger Code	3	5.00	5.00	5.00	5.00	4.00	4.00	4.00	4.00	4.00	4.00	5.00	4.33	1.00	2.00	na	1.50	3.71	GPT
T31	Rollout, Gates & Rückbau	3	5.00	5.00	5.00	5.00	5.00	4.00	5.00	4.67	5.00	4.00	5.00	4.67	5.00	3.00	4.00	4.00	4.58	GPT
T32	Offene Punkte & Selbstdeklaration	2	5.00	4.00	na	4.50	5.00	5.00	na	5.00	3.00	3.00	na	3.00	4.00	4.00	na	4.00	4.12	OPUS
T33	Maschinenlesbarkeit & Single Sources of Truth	1	5.00	na	na	5.00	5.00	na	na	5.00	3.00	na	na	3.00	4.00	na	na	4.00	4.25	GPT+OPUS
T34	Zielprofile & Aktivierungsregeln	1	5.00	na	na	5.00	4.00	na	na	4.00	4.00	na	na	4.00	5.00	na	na	5.00	4.50	GPT+KIMI
T35	Security, Datenintegrität & Recovery	1	5.00	na	na	5.00	5.00	na	na	5.00	5.00	na	na	5.00	4.00	na	na	4.00	4.75	GPT+OPUS+K3
T36	Finale Stackentscheidung	1	5.00	na	na	5.00	5.00	na	na	5.00	4.00	na	na	4.00	4.00	na	na	4.00	4.50	GPT+OPUS
T37	Subagenten-Ökonomie	1	na	na	4.00	4.00	na	na	3.00	3.00	na	na	na	na	na	na	5.00	5.00	4.00	KIMI
T38	Neufunde / Zugewinn	1	na	na	3.00	3.00	na	na	3.00	3.00	na	na	5.00	5.00	na	na	5.00	5.00	4.00	K3+KIMI
```

### 16.3 Datensatz-Gesamtwerte

```tsv
datensatz	punktgewichtet	themengewichtet	strengekorrigiert	fuehrt_in_themen	rang
GPT	4.52	4.53	+0.34	22	1
OPUS	4.44	4.42	+0.26	17	2
K3	3.79	3.81	-0.39	2	4
KIMI	3.94	3.89	-0.23	12	3
```