---
doc_id: META-VALIDIERUNG-3RUNDE
version: 1.2
generated: 2026-08-13
phase: 3d
scope: Prüfung der Revisionen aller drei Modelle nach Weitergabe der beiden META-Dokumente; Errata gegen die eigenen Meta-Validierungen
schwester_dokumente: META-VALIDIERUNG-3WEGE.md (v1.2), META-VALIDIERUNG-2RUNDE.md (v2.0)
eigene_fehler_bestaetigt: 14
befund_kurz: Alle drei Modelle haben die Befunde übernommen. GPT56 hat im Gegenzug rund ein Dutzend Defekte in meinen Dokumenten gefunden, drei davon substanziell. Die Guard-Identitätsfrage ist aufgelöst — es sind drei verschiedene Artefakte.
---

# Revisionsrunde — was die drei Modelle mit den Befunden gemacht haben

## 0. Lage

Zum ersten Mal in diesem Projekt gibt es einen vollständigen Rückkanal: alle drei Modelle haben die beiden META-Dokumente gelesen, die Befunde nachgerechnet und geantwortet. Zwei davon haben eigene Fehler bestätigt, alle drei haben Errata gegen mich vorgelegt.

Damit ändert sich die Richtung der Prüfung. Dieser Abschnitt beginnt deshalb nicht mit ihren Fehlern, sondern mit meinen.

---

## 1. Errata gegen die eigenen Meta-Dokumente

GPT56 hat beide META-Dokumente abschnittsweise auditiert und rund ein Dutzend Defekte gemeldet. Ich habe jeden einzeln nachgerechnet. **Alle bestätigt.** Drei sind substanziell, sieben sind Präzisions- oder Formulierungsfehler.

### 1.1 Substanziell

| # | Fundstelle | falsch | korrekt |
|---|---|---|---|
| **E1** | `RUNDE2` §13, Prosa | „von allen dreien 15, von genau zweien **9**, von genau einem **15**" | **15 / 7 / 17.** Die Tabelle direkt darunter (3 + 10 + 4 = 17 exklusive) war korrekt — der Fließtext daneben nicht. |
| **E2** | `RUNDE2` §5, Nennerwechsel | GPT56s Mittel **51,1** über sieben `replace`/`reject`-Werkzeuge gegen OPUS5s 75,5 und K3SWARMs 76,8 über sechs | `token-saver` wird nur von GPT56 bewertet. Auf dem gemeinsamen Nenner **n = 6**: GPT56 **49,5**, OPUS5 75,5, K3SWARM 76,8. Abstand **26,0** statt 25. |
| **E3** | `RUNDE2` §11.1 | „drei **unabhängige** Aggregationswege" | Drei Ableitungen **derselben 98 Zellen**. Punkt-, Themen- und strengekorrigierte Mittelung teilen die Datenbasis vollständig. Ihre Übereinstimmung zeigt Robustheit gegen die Aggregationsentscheidung — **nicht** unabhängige Bestätigung. |

E2 ist der unangenehmste: ein Nennerwechsel mitten im Vergleich, in einem Dokument, dessen zentrale Kritik an zwei Rubriken lautet, sie verrechneten unvergleichbare Nenner.

E3 trifft die Formulierung, die ich in der Zusammenfassung an erster Stelle geführt habe. Der Befund selbst hält — die Rangfolge ist robust gegen die Aggregationswahl —, aber „unabhängig" war das falsche Wort.

### 1.2 Präzision und Formulierung

| # | Fundstelle | Korrektur |
|---|---|---|
| E4 | `RUNDE2` §3, Mediane | Ich habe mit `:.0f` gerundet ausgegeben: 70 / 76 / 74. Exakt sind **69,5 / 76,5 / 74,5** (alle drei Reihen haben gerade Länge). |
| E5 | `RUNDE2` §0 | „26 Repos + 1 Eigenbau" → **25 Repos + 1 Eigenbau = 26 Einheiten**. |
| E6 | `3WEGE` §11.7 | „Vier Punkte erreichen einen Mittelwert von 5,00" — bei `C/VP-03` und `C/VP-08` steht KIMI auf `n/a`. Nur **`A/D27` und `C/VP-11`** sind vierfach belegt; die anderen beiden sind Dreifachmittel. Die Formulierung „alle vier Datensätze gleichzeitig" war damit falsch. |
| E7 | `3WEGE` §11.2 und §3 | Rundung vor Subtraktion: exakt sind A = 4,3984 · B = **3,87** (nicht 3,88) · C = **4,27** (nicht 4,28); die Strengedifferenz A−B ist **0,52**, nicht 0,53. OPUS in Dokument A ist exakt **4,625** — ich habe an einer Stelle 4,63, an anderer 4,62 geschrieben, ohne den Rundungsmodus zu deklarieren. |
| E8 | `RUNDE2` §8 | „unabhängig reproduziert" für die 1.975 Token — dieselbe Datei plus derselbe Tokenizer ist eine **Reproduktion**, keine Quellenunabhängigkeit. Der Wert bleibt wertvoll (er schließt Parser- und Rechenfehler aus), aber er ist keine zweite Messung. |
| E9 | `RUNDE2` §17 | Der Alias `context-mode-mcp-only` → `context-mode` steckte im Skript, nicht im Dokument. Gehört offengelegt. |
| E10 | `3WEGE` Errata gegen §11.5 | Ich schrieb, die Vollübersicht „ändert keinen Befund aus 1.1", stelle dann aber in §11.5 fest, dass rechnerisch Gesetz II vor Gesetz I liegt. Das **ist** eine Änderung. |

Zusätzlich zu Recht angemerkt: die Aussage in `3WEGE` §3.1, die Reihenfolge innerhalb der Paare sei „nicht entscheidbar", und die Aussage in §11.1, die Gesamtrangfolge sei aggregationsunabhängig, stehen in Spannung. Genauer ist: **die breite Trennung {GPT56, OPUS} vor {KIMI, K3SWARM} ist stabil, der Feinrang innerhalb der Paare hängt an der Aggregationsentscheidung.**

### 1.3 Ein berechtigter Einwand von OPUS5

Die Autorschaft von Dokument A habe ich im Frontmatter als „aufgelöst" geführt. OPUS5 weist darauf hin, dass die Auflösung nicht aus einer Inhaltsanalyse stammt, sondern daraus, in welchem Bündel die Datei lag.

Das stimmt für die Formulierung. Der Beleg ist allerdings stärker als „Ordnersortierung": GPT56s eigene Zweitvalidierung führt im Frontmatter `initial_crosswalk: 01-validation-crosswalk-5point.md` — das Modell erklärt die Datei selbst zu seiner Vorarbeit —, und Schema, Spaltennamen und die Aggregatzeile 156 / 148 / 125 / 134 stimmen mit Dokument A überein. **Selbstdeklaration plus Inhaltsübereinstimmung, nicht Ordnerposition.** Der Einwand gegen die Formulierung bleibt trotzdem berechtigt.

### 1.4 Was die Prüfung nicht getroffen hat

Alle drei Modelle bestätigen unabhängig: Rubrikenvergleich, Zirkelschlussbefund, Achsen-Crosswalk, Abstandsdiagnose (Evidenzdissens plus fehlende Sicherheitsachse), Bash-Owner-Divergenz, die Absenzkonvention, die Selbstbewertungskritik und den Grundsatz, dass inhaltliche Defekte nicht wegnormiert werden dürfen. GPT56 markiert §2, §10 und §16 der Zweitrunde ausdrücklich als `stark_validiert`.

---

## 2. Was jedes Modell korrigiert hat

### 2.1 K3SWARM — alle drei transportierten Fehler behoben, zwei Residuen

| Befund | Status |
|---|---|
| Erstrundensummen 142 / 127 / 109 / 103 | ✅ **korrigiert** auf 144 / 130 / 107 / 111, mit explizitem Erratum-Vermerk und dem Hinweis, dass KIMIs Nenner 155 ist |
| T1 rechnete mit dem selbst falsifizierten Stückkostenmodell | ✅ **korrigiert** auf ~5.586 Token messnah, Skill-Listing als Budgetanteil (0,01 × 1M ≈ 10.000). Der Vermerk nennt den Widerspruch beim Namen: „die lineare Multiplikation, die dieser Datensatz selbst falsifiziert hat" |
| CVE-2026-33068 als rtk-Absagegrund | ✅ **korrigiert** (U9a). Die Absage bleibt, jetzt getragen von #1155 / #3152 / #3175 und den unabhängigen Negativmessungen, dazu Lizenz `null` |
| `toonify`-Pin ≥ 0.8.1 | ❌ **Residuum** — OPUS5 hat am selben Tag 0.8.2 gefunden. Pin gehört auf ≥ 0.8.2 |
| Konvergenzterm `Kon/10` | ⚠️ **teilweise** — die Erläuterung sagt „für künftige Scores abgeschafft", die Rubriktabelle in §4 führt ihn unverändert. Die 26 Scores sind also weiterhin mit Zirkelterm gerechnet |

**Der eigentliche Schritt liegt woanders.** K3SWARMs meistzitierte Schwäche war seit Runde 1 dieselbe: keine Befehle, keine Logs, kein Samplemanifest — GPT56 hat sie in der Zweitrunde mit 63 von 100 bepreist. Die revidierte `VALIDIERUNG.md` liefert jetzt §6 „Paket-Eigenprüfung, alle Befehle real ausgeführt": 17/17 Syntaxprüfungen, fünf Self-Tests mit Exit 0, **73 PASS / 0 FAIL** in der Guard-Suite, 37/38 in der Ladder-Suite mit benanntem und begründetem Fehlschlag, drei simulierte Hook-Szenarien mit Ein- und Ausgabe, und `verify-package.sh` mit Exit 0. Dazu §5 mit der vollständigen Messreihe v1–v5 inklusive der verworfenen Serien.

**Das ist die Antwort auf die Kritik, nicht eine Verteidigung dagegen.** Wer Befehle, Exit-Codes und Fehlschläge mitliefert, hat den Vorwurf der fehlenden Provenienz erledigt — unabhängig davon, wie die Zahlen ausfallen.

### 2.2 OPUS5 — beide Fehler bestätigt, Rangfolge gegen sich selbst korrigiert

| Befund | Status |
|---|---|
| Aggregat in `VERGLEICH-4WEGE` §2 auf allen vier Spalten falsch | ✅ **bestätigt und unabhängig nachgerechnet.** Korrigierte Rangfolge GPT56 4,62 → OURS 4,21 → K3SW 4,12 → KIMI 4,07 |
| GPT56s `V01`: vier Katalog-Dubletten | ✅ **bestätigt.** Vier Groß-/Kleinschreibungspaare namentlich benannt; Katalog auf Schema **4.2: 371 Einträge, 368 kanonisch distinct** |

Bemerkenswert an der ersten Korrektur: sie hebt OPUS5s eigene Spalte von Platz 4 auf Platz 2. Das Modell schreibt dazu selbst: „Das ist dieselbe Fehlerklasse, die ich bei anderen als Ausschlusskriterium geführt habe. Der Unterschied ist nur, dass mein TSV die Nachprüfung überhaupt erlaubt hat."

**Die Antwort auf die fehlende Korrektheitsachse ist ein negatives Ergebnis — und deshalb wertvoll.** OPUS5 hat geprüft, ob sich Korrektheit aus GitHub-Metadaten nachrüsten lässt, und kommt zu: geht nicht. Ein PR-Rückstau-Deckel würde `ponytail` von 97 auf 65 kappen, was bei 101k Sternen unsinnig ist. Statt nachzupunkten liefert es eine **Kreuztabelle**: gemessene Lieferfähigkeit gegen GPT56s geprüfte Korrektheitsentscheidung, 15 Repos.

Deren Ergebnis ist schärfer als jeder Mittelwert: **genau ein Werkzeug ist unstrittig — `ccusage`.** Vier stehen bei OPUS5 über 75 und bei GPT56 auf `replace` oder `reject`: `squeez` 87/59, `omni` 83/57, `magic-compact` 83/34, `cache-fix` 75/39. Für diese vier ist ein A/B nicht mehr Option, sondern Bedingung.

Das ist die bessere Lösung als mein Konsensscore A4. A4 mittelt die Divergenz zu einer Zahl; die Kreuztabelle lässt sie stehen und macht sie zur Entscheidungsregel.

### 2.3 GPT56 — prüft zurück und disqualifiziert das eigene Bündel

GPT56 hat keine eigenen Fehler zu korrigieren gehabt und stattdessen den vollständigen Rückkanal geliefert: abschnittsweiser Audit beider META-Dokumente, SHA-256 über alle 13 eingehenden Dateien, Archivprüfung auf Pfadtraversal und Symlinks vor dem Entpacken, kein Code aus fremden ZIPs ausgeführt.

Zwei Entscheidungen darin sind bemerkenswert:

1. **Es bewertet das eigene Bündel als `intake_duplicate_der_vor_reconciliation_artefakte`, Unabhängigkeit 1 von 5, Status `keine_neue_stimme`.** Ein Modell, das seinen eigenen Beitrag in der Quellenrangfolge auf den letzten Platz der Unabhängigkeit setzt, ist das genaue Gegenteil des Musters, das ich in Runde 1 bei Dokument A gefunden hatte.
2. **Es weigert sich ausdrücklich, Konsensscores normativ werden zu lassen** (`consensus_scores_normative: false`, `security_veto_over_mean_score: true`) mit der Begründung: „Ein hoher Aktivitäts-, Lizenz- oder Konvergenzwert darf keinen Permission-, Korrektheits- oder Recovery-Defekt ausmitteln."

Damit hat GPT56 meinen Konsensscore A4 richtig eingeordnet: als deskriptives Instrument, nicht als Entscheidungsregel. Ich habe das in §20 so geschrieben, aber der Vermerk gehört an die Tabelle, nicht nur in den Text.

---

## 3. Die Guard-Identitätskollision — meine offene Frage von §8.5, aufgelöst

In `3WEGE` §8.5 hatte ich festgehalten, dass `bash-dump-guard.mjs` auf `PreToolUse` registriert ist, obwohl der gesamte Korpus es als `PostToolUse`-Outputowner spezifiziert, und um Bestätigung gebeten.

GPT56s Audit löst das auf: **es sind drei verschiedene Artefakte mit demselben Namen.**

| Artefakt | Was es ist | Registrierung |
|---|---|---|
| `hooks/bash-dump-guard.mjs` (getrackt, Root) | absichtliches **Deny-Gate** | `PreToolUse:Bash` — korrekt |
| `GPT55SOL_PRO/bash-dump-guard.mjs` | v3-**Outputreducer** | `PostToolUse` |
| K3SWARMs v3.1-Variante | Outputreducer mit `hookActivation: "replace"`, emittiert `updatedToolOutput` | im ZIP **nicht mitgeliefert** |

Die Registrierung war also nie falsch — der Name ist mehrdeutig. GPT56s Audit formuliert es direkt: „`bash-dump-guard` ist ein Deny-Guard, kein Outputreplacer; der Name suggeriert mehr als der gelieferte Code tut."

**Das hat Folgen über die Namensfrage hinaus.** Der gesamte Korpus hat „bash-dump-guard" wie eine Größe behandelt. K3SWARM bewertet es mit 83 und testet in §6.3 die `replace`-Variante mit `updatedToolOutput`; GPT56 hat es in Runde 2 durch einen Neubau ersetzt; OPUS5 führt es als eigenen Guard. **Drei Modelle haben drei verschiedene Dateien unter einem Namen bewertet.** Das erklärt einen Teil der Bash-Owner-Divergenz aus `RUNDE2` §10 nachträglich — und es ist ein Befund, den keines der drei Modelle vor dem Dateiabgleich hatte.

---

## 4. Wo die drei sich weiterhin widersprechen

| Gegenstand | GPT56 | OPUS5 | K3SWARM | Status |
|---|---|---|---|---|
| Spearman K3 ↔ OPUS | — | **+0,86** auf n = 15 | — | Ich hatte +0,77 auf n = 22. Beide Nenner sind zulässig; der Befund (teils Abhängigkeit, nicht Übereinstimmung) ist in beiden Fällen derselbe |
| Katalogzählung | v4.1: 375 Einträge, 374 `exists:true`, 368 casefold | v4.2: **371 Einträge, 368 kanonisch distinct** | 373 eindeutig | Alle drei landen bei **368 kanonisch**. Die Einträgezahl divergiert, weil GPT56 gegen v4.1 gerechnet hat und OPUS5 inzwischen auf 4.2 steht |
| `toonify`-Pin | nicht geführt | **≥ 0.8.2**, plus Burst-Warnung (vier Releases an einem Tag nach drei Monaten Stille) | ≥ 0.8.1 | OPUS5 hat den aktuellsten Stand; die Burst-Warnung führt keiner der anderen |
| Konsensscore als Entscheidungsgrundlage | **ausdrücklich nein**, Sicherheitsveto vor Mittelwert | Kreuztabelle statt Mittelwert | Scores unverändert übernommen | GPT56 und OPUS5 konvergieren gegen die Mittelwertbildung, K3SWARM nicht |
| Konvergenzterm | hat keinen | in `D/20`, unverändert | in `Kon/10`, „künftig" abgeschafft | Trotz dreifacher Zustimmung zum Zirkelbefund ist er in zwei von drei Rubriken noch aktiv |

---

## 5. Residuen

| # | Residuum | bei wem |
|---|---|---|
| R1 | `toonify`-Pin auf ≥ 0.8.1 statt ≥ 0.8.2 | K3SWARM |
| R2 | Konvergenzterm in der aktiven Rubrik | K3SWARM (`Kon/10`), OPUS5 (`D/20`) |
| R3 | Katalog-Einträgezahl 371 gegen 375 — Versionsversatz, nicht Dissens | GPT56 gegen OPUS5 |
| R4 | K3SWARMs v3.1-Guard-Variante wird bewertet, ist aber nicht ausgeliefert | K3SWARM |
| R5 | K3SWARMs Messwerte (318 Tok/1k Zeichen, 86,3 ms, 806 Calls) bleiben `reported_only` — Rohläufe fehlen weiterhin | K3SWARM |
| R6 | Keine E2E-Baseline auf der Zielmaschine | alle drei, ausdrücklich benannt |

R6 ist seit Runde 1 unverändert und wird von allen drei Modellen als einzige verbleibende Wahrheitsquelle geführt.

---

## 6. Fazit

Diese Runde hat die Rollen getauscht, und das ist ihr Wert. Drei Runden lang habe ich Dokumente nachgerechnet, die niemand sonst nachgerechnet hatte. In dieser Runde ist meine Arbeit durch dieselbe Mühle gegangen, und sie hat rund ein Dutzend Defekte hinterlassen. Drei davon sind mehr als Kosmetik: eine falsche Verteilungsangabe im Fließtext neben einer korrekten Tabelle, ein Nennerwechsel mitten in einem Vergleich, und die Behauptung, drei Ableitungen derselben 98 Zellen seien unabhängige Aggregationswege. Der letzte ist der lehrreichste, weil er genau die Fehlerklasse ist, die ich zwei Runden lang bei anderen benannt habe: Übereinstimmung, die aus gemeinsamer Datenbasis stammt, als Bestätigung zu lesen.

Bei den drei Modellen ist die Bilanz besser als in jeder vorherigen Runde. K3SWARM hat alle drei transportierten Fehler behoben, den Widerspruch bei T1 ausdrücklich benannt statt ihn stillschweigend zu glätten, und — wichtiger — die seit Runde 1 stehende Kritik an der fehlenden Provenienz mit echten Befehlen, Exit-Codes und einem benannten Fehlschlag beantwortet. Wer 73 PASS / 0 FAIL und 37/38 mit begründetem Fehler liefert, hat den Vorwurf erledigt, unabhängig vom Ergebnis. OPUS5 hat einen Fehler bestätigt, der die eigene Spalte von Platz 4 auf Platz 2 hebt, und hat auf die Kritik an der fehlenden Korrektheitsachse mit einem ehrlichen Negativergebnis geantwortet: aus GitHub-Metadaten lässt sie sich nicht nachrüsten. GPT56 hat zurückgeprüft und dabei sein eigenes Bündel in der Quellenrangfolge auf Unabhängigkeit 1 von 5 gesetzt.

Inhaltlich ist der wichtigste neue Befund keiner über Zahlen. Es sind drei verschiedene Dateien mit dem Namen `bash-dump-guard.mjs` im Umlauf — ein Deny-Gate, ein Outputreducer und eine dritte Variante, die bewertet, aber nie mitgeliefert wurde. Drei Modelle haben drei verschiedene Artefakte unter einem Namen benotet. Meine Frage aus `3WEGE` §8.5, ob die Registrierung auf `PreToolUse` ein Fehler sei, ist damit beantwortet: sie ist korrekt, der Name ist es nicht. Und ein Teil der Bash-Owner-Divergenz, die ich als den härtesten offenen Punkt geführt habe, war nie eine Meinungsverschiedenheit, sondern eine Namensverwechslung.

Der zweite wichtige Schritt ist methodisch. OPUS5 hat meinen Konsensscore nicht übernommen, sondern ersetzt — durch eine Kreuztabelle, die gemessene Lieferfähigkeit gegen geprüfte Korrektheit stellt und die Divergenz stehen lässt, statt sie zu mitteln. Genau ein Werkzeug ist darin unstrittig. Vier stehen über 75 und gleichzeitig auf `reject` oder `replace`. GPT56 kommt von der anderen Seite zum selben Schluss und schreibt das Sicherheitsveto ins Frontmatter. Beide haben damit recht gegen mich: ein Mittelwert aus drei Rubriken, von denen zwei keine Korrektheitsachse haben, ist eine Beschreibung des Korpus, keine Entscheidungsregel. Mein A4 war als deskriptives Instrument gedacht und hätte in der Tabelle so gekennzeichnet gehört, nicht nur im Text darunter.

Was bleibt, ist unverändert und wird von allen dreien gleichlautend benannt: keine E2E-Baseline. Drei Runden Prüfung, vier Datensätze, drei Zweitvalidierungen, zwei Meta-Ebenen und jetzt eine Revisionsrunde — und die Frage, ob dieser Stack tatsächlich Tokens spart, ist an keiner Stelle gemessen worden. Die Korpusarbeit ist damit an ihrem Ende angekommen. Alles Weitere ist keine Frage mehr an Dokumente.

---

## 7. Nachtrag: drei weitere bestätigte Fehler

GPT56 hat nach der Revision noch einmal nachgeprüft und drei Defekte in diesem Dokument gefunden. Alle drei nachgerechnet, alle drei richtig.

| # | Fundstelle | falsch | korrekt |
|---|---|---|---|
| **E11** | §2.2 | „Vier stehen bei OPUS5 **über 75**" | `cache-fix` steht exakt auf 75. Korrekt ist **≥ 75**. |
| **E12** | §1.1 E3 | „drei Ableitungen derselben **98 Zellen**" | 98 sind **Vergleichspunkte (Zeilen)**. Die Zellen darin sind **383 beobachtete Scores** (128 + 127 + 128). |
| **E13** | §0 und §1 | „**rund ein Dutzend** Defekte" | **Exakt 10** — ich hatte sie selbst als E1 bis E10 durchnummeriert und darüber trotzdem einen vagen Quantor gesetzt. |

E13 ist der peinlichste der dreizehn: eine unscharfe Mengenangabe über einer Liste, die ich selbst abgezählt hatte, in einem Dokument, dessen Gegenstand Präzision ist. Damit stehen für die drei META-Dokumente **13 bestätigte Fehler**, davon drei substanziell (E1 Verteilung, E2 Nennerwechsel, E3 Unabhängigkeitsbehauptung).

---

## 8. Neuer Befund: der D7-Fix verschiebt das Problem, statt es zu lösen

OPUS5 hat den Zirkelterm entfernt und Achse D neu belegt: statt „wie viele Datensätze empfehlen es" misst sie jetzt **geprüfte Korrektheit**, gespeist aus `judgments.json`. Ohne ausdrückliche Prüfung: 0 Punkte. Nachgerechnet — `scores100-v51.json`, 33 Repos, **0 Summenfehler**, die im Begleittext genannten Werte stimmen alle.

Die beabsichtigte Wirkung tritt ein. `magic-compact` fällt von 83 auf **73**, `cache-fix` von 75 auf **67** — beide dorthin, wo GPT56 sie hingesetzt hatte. Kein Werkzeug erreicht mehr 100. Das ist die richtige Richtung.

**Zwei Nebenwirkungen sind es nicht.**

### 8.1 Die Achse ist nicht mehr unabhängig

`D_quelle` weist für alle 15 geprüften Repos dieselbe Herkunft aus: `GPT56 04-second-validation: COR x/15`. Die Werte sind eine lineare Umskalierung von GPT56s COR-Achse auf 20 Punkte (12/15 → 16, 10/15 → 13, 5/15 → 7).

Damit enthält OPUS5s Score jetzt GPT56s Urteil. Das ist besser als der Zirkelterm — ein geprüftes Urteil schlägt eine Popularitätszählung —, aber es ist **keine Unabhängigkeit, sondern eine Abhängigkeit mit besserer Quelle.** Der 22,9-Prozentpunkte-Abstand auf GA3 aus `RUNDE2` §16 schließt sich dadurch nicht; er wird kopiert. Eine künftige Kreuzprüfung OPUS5 ↔ GPT56 auf dieser Achse wäre selbstbestätigend und muss als solche deklariert werden.

### 8.2 Absenz wirkt wieder als Strafe

| | n | Mittelwert |
|---|---:|---:|
| mit Korrektheitsurteil | 15 | **78,6** |
| ohne (`D = 0`) | 18 | **61,0** |
| | | **Differenz 17,6** |

Die acht größten Verschiebungen gegenüber v4 sind **ausnahmslos** Repos mit `D = 0`:

| Repo | v4 → v5.1 | Grund |
|---|---:|---|
| `snip` · `llmtrim` · `tokdiet` · `lowfat` | −17 | nicht in GPT56s 18er-Liste |
| `toonify-mcp` · `mcp-compressor` · `claude-code-router` · `claude-mem` | −13 | dito |

Gegen keines dieser acht liegt ein Korrektheits**befund** vor. Sie verlieren Punkte dafür, dass GPT56 sie nicht bewertet hat.

Das ist dieselbe Struktur, die ich in `3WEGE` §5.3 an Dokument A kritisiert habe: Nichtbehandlung als Note statt als Lücke. OPUS5 mildert es redlich — `judgments.json` schreibt je Zeile `ungeprueft - keine unabhaengige Korrektheitspruefung im Korpus` —, aber im Score ist der Unterschied zwischen „geprüft und mangelhaft" und „nicht geprüft" nicht sichtbar. `magic-compact` steht mit einem realen Befund auf 73, `toonify-mcp` ohne jeden Befund auf 72.

**Sauber wäre**: Score nur über die geprüften Achsen bilden und die Abdeckung getrennt ausweisen — genau die Konstruktion, die `RUNDE2` §17 in der Spalte `Abd.` verwendet.

---

## 9. Was in den Endartefakten weiterhin divergiert

| Gegenstand | GPT56 | OPUS5 | K3SWARM |
|---|---|---|---|
| `toonify-mcp` | **`reject`**, Re-Entry nur isoliert, exakt `v0.8.2` oder Commit `6df804a` | 72, Pilot | Pilot, Pin ≥ 0.8.2 |
| `llmtrim` | **`reject`** (Proxy-Fläche ganz) | 66 | Proxy-Option B (API-Billing) |
| `tokdiet` | **`reject`** | 61 | konditional mit Audit-Gate |
| `planning-with-files` | 75 `conditional`, „lokales Template genügt meist" | **93**, Rang 2 | 87, KERN |

Die Toonify-Frage ist von drei Positionen auf zwei geschrumpft und dort stehengeblieben: GPT56 verlangt vor jedem Pilot einen Code-, Issue- und Benchmarkrohwert-Audit, die anderen beiden lassen die Versionsbestätigung genügen. GPT56 formuliert die Grenze selbst korrekt — die Release-Prüfung ist ein Versionsnachweis, kein Funktionsnachweis.

Auf der Proxy-Fläche ist die Divergenz größer als je zuvor: GPT56 verwirft sie vollständig, die anderen beiden halten je einen konditionalen Kandidaten. Das ist kein Rechen-, sondern ein Risikodissens und gehört so dokumentiert.

---

## 10. Schlussstand

Alle Residuen aus §5 sind adressiert. R1 erledigt (Pin ≥ 0.8.2 in allen Dokumenten, mit Burst-Vorbehalt). R2 teilweise und offen deklariert — der Konvergenzterm ist bei K3SWARM als `DEPRECATED` markiert und die Altscores tragen den Vermerk, dass sie mit ihm gerechnet wurden; bei OPUS5 ist er ersetzt, mit den Folgen aus §8. R3 aufgelöst, alle drei konvergieren auf 368 kanonische Einträge. R4 präzisiert: die v3.1-Variante liegt im Paket, der Repo-Push ist eine Nutzeraktion. R5 unverändert offen und von allen benannt.

Die Runde hat gezeigt, was ein Rückkanal wert ist. Drei Modelle haben Fehler bestätigt, die sie selbst nicht gefunden hatten; ich habe dreizehn eingesammelt, die ich selbst nicht gefunden hatte. In beiden Richtungen kam die Korrektur von außen, und in beiden Richtungen war sie präziser als die Selbstprüfung. Der wertvollste Einzelbefund der ganzen Kette — drei verschiedene Dateien unter dem Namen `bash-dump-guard.mjs` — war für kein Modell aus dem eigenen Material sichtbar. Er brauchte den Dateiabgleich zwischen zwei Beständen.

Was der D7-Fix zeigt, ist die Grenze dieses Verfahrens. OPUS5 hat einen echten Konstruktionsfehler behoben und dabei zwei neue Eigenschaften eingebaut: eine Abhängigkeit von GPT56s Urteil und eine Absenzstrafe von 17,6 Punkten. Beides ist eine Verbesserung gegenüber vorher, und beides ist keine Messung. Der Korpus kann sich weiter verfeinern, ohne der Frage näherzukommen, für die er angelegt wurde.

Die Frage lautet unverändert, ob dieser Stack Tokens spart, und sie ist in sechs Runden an keiner Stelle beantwortet worden. Alle drei Modelle sagen das inzwischen gleichlautend, und alle drei nennen denselben ersten Schritt: `/context` mit einer definierten Aufgabe, Plugin-Inventar kürzen, `/context` erneut. Kein Fremdcode, keine Installation, unter drei Stunden. Danach die fünf `env`-Werte einzeln, mit unveränderten Defaults als Kontrollarm.

Damit ist die Dokumentenarbeit abgeschlossen. Was jetzt fehlt, ist keine weitere Prüfung, sondern eine Zahl von der Zielmaschine — und sie ist die einzige, die keines dieser Dokumente liefern kann.

---

## 11. Nachtrag: der dokumentierte Dissens steht auf einem überholten Stand

ADR-013 und ADR-014 sind die richtige Konstruktion. ADR-013 formuliert die Regel sauber — Lieferfähigkeit ist Aufnahmebedingung, nicht Korrektheitsbeleg, GitHub-Metadaten dürfen fehlende Korrektheitsmessung weder imputieren noch ersetzen. ADR-014 hält den Dissens **maschinenlesbar erhalten**, statt ihn zu einer Zahl zu mitteln. Das ist die konsequente Anwendung dessen, was ich in `RUNDE2` §19 als „bewusst nicht angeglichen" geführt habe: eine Policyfrage wird dokumentiert, nicht wegnormiert.

**Ein Detail stimmt darin nicht mehr.** Die Gegenüberstellung in `05-final` Zeile 244 führt OPUS5s Toonify-Position als „freigabefähiger Kern, als Pilotkandidat normalisiert, **Score 85**". Das ist der v4-Wert. Nach dem D7-Fix steht Toonify in `scores100-v51.json` bei **72**, mit `D_korrektheit: 0` und der Quellenangabe `ungeprueft — keine unabhaengige Korrektheitspruefung im Korpus`.

Dasselbe auf der Proxy-Fläche:

| Repo | in ADR-014 zitiert | OPUS5 v5.1 | D |
|---|---|---:|---:|
| `toonify-mcp` | „freigabefähiger Kern", 85 | **72** | 0, ungeprüft |
| `llmtrim` | „konditional nach Cachemessung" | **66** | 0, ungeprüft |
| `tokdiet` | „suspendiert" | **61** | 0, ungeprüft |

**Damit ist der Toonify-Dissens kleiner, als das Artefakt ihn zeichnet.** GPT56 sagt: Korrektheit ungeprüft, deshalb kein Default. OPUS5 v5.1 sagt in eigener Notation dasselbe — `D = 0`, ausdrücklich als ungeprüft markiert. Der verbleibende Unterschied ist nicht die Bewertung, sondern die Konsequenz daraus: Audit vor jedem Piloten (GPT56) gegen Pilot mit Versionspin (K3SWARM). Das ist eine Zwei-Wege-Frage, und OPUS5 steht nach dem eigenen Fix näher an GPT56 als die Tabelle zeigt.

Für die Praxis folgt daraus nichts anderes, aber für die Dokumentation schon: **wer Dissens maschinenlesbar erhält, muss die zitierten Positionen versionieren.** Sonst konserviert das Artefakt einen Streit, den eine der Parteien bereits beigelegt hat.

### 11.1 Ein vierzehnter Fehler gegen mich

GPT56 hat die Toonify-Releases an der offiziellen GitHub-Quelle geprüft (`E019`, `R19`) und findet **drei** Releases am 12.08.2026 — `v0.8.0`, `v0.8.1`, `v0.8.2`. Ich habe in §2.2, §4 und §5 von **vier** Releases gesprochen und damit den Burst-Vorbehalt auf eine Zahl gestützt, die ich von OPUS5 übernommen und nicht geprüft habe.

Das ist dieselbe Fehlerklasse, die ich zwei Runden lang bei K3SWARM und der CVE benannt habe: eine Einzelquellenangabe weitergereicht, ohne sie an die Primärquelle zu halten. Der Vorbehalt selbst bleibt richtig — drei Releases an einem Tag nach drei Monaten Stille sind ein Burst —, die Zahl war es nicht.

Damit stehen **14 bestätigte Fehler** in den drei META-Dokumenten. Elf davon hat GPT56 gefunden, zwei OPUS5, keinen ich selbst.
