---
errata_nachtrag: META-VALIDIERUNG-3RUNDE.md §1 - bestaetigte Fehler in diesem Dokument, extern gefunden und nachgerechnet
doc_id: META-VALIDIERUNG-2RUNDE
version: 2.0
generated: 2026-08-13
supersedes: 1.0
phase: 3b
scope: Validierung der drei 1-bis-100-Zweitvalidierungen gegeneinander, plus Delta gegenüber der jeweiligen Erstvalidierung desselben Modells
schwester_dokument: META-VALIDIERUNG-3WEGE.md (v1.2, Erstrunde)
datensaetze:
  GPT56SOL: 01-validation-crosswalk-5point.md, 03-file-token-metrics.json, 04-second-validation-100point.md, 05-final-consolidated-token-stack.md
  OPUS5: UPDATE-PHASE3.md, scores100.json, issues2.json, repo-catalog-v4.json
  K3SWARM: zweitvalidierung-update.md, VALIDIERUNG.md, verifikationsbericht-claudestack.md
angleichung: vier offengelegte Stufen A0-A4 ueber einen gemeinsamen Achsenrahmen GA1-GA8; rund die Haelfte des Modellabstands ist Gewichtungsartefakt, die andere Haelfte echter Dissens
repo_inventar: 39 bewertete Einheiten plus 7 nur genannte
befund_kurz: Alle drei rechnen korrekt (Runde 1 = 2 von 3 fehlerhaft). Aber die drei Rubriken messen drei verschiedene Konstrukte; nur 15 von 39 Einheiten werden von allen drei bewertet, und GPT liegt systematisch 15 Punkte unter den anderen.
aufgeloest: Autorschaft von Dokument A der Erstrunde = GPT56
---

# Meta-Validierung der zweiten Runde (1–100)

## 0. Was vorliegt

| Modell | Kern-Dokument | bewertet | Rubrik | Datensatz-Ranking |
|---|---|---|---|---|
| **GPT56** | `04-second-validation-100point.md` | 4 Datensätze **und** 18 Repos | zwei getrennte 8-/7-Achsen-Rubriken | geführt: GPT 91 · OPUS 85 · KIMI 79 · K3 63 |
| **OPUS5** | `UPDATE-PHASE3.md` + `scores100.json` | 32 Repos | 5 Achsen, A+B+C gemessen | **ausdrücklich eingestellt** |
| **K3SWARM** | `zweitvalidierung-update.md` | 26 Repos + 1 Eigenbau | 6 Achsen | unverändert aus Runde 1 übernommen |

**Vorab aufgelöst:** Dokument A der Erstrunde — der Crosswalk mit den 32 Entscheidungsrecords D01–D32, dessen Autorschaft ich in v1.2 §5.1 als „nicht offengelegt" führen musste — liegt als `01-validation-crosswalk-5point.md` in GPT56SOLs eigenem Bündel. **Es stammt von GPT56.** Die 4,88 von 5, der höchste Einzelwert des gesamten Korpus, war damit eine Selbstbewertung. Der Verdacht aus v1.2 §5.2 ist bestätigt.

---

## 1. Rechenprüfung: erstmals sauber

| Dokument | bewertete Einheiten | Summenfehler |
|---|---:|---:|
| GPT56 — Datensatzrubrik | 4 | **0** |
| GPT56 — Reporubrik | 18 | **0** |
| OPUS5 — `scores100.json` | 32 | **0** |
| K3SWARM — Rubriktabellen | 26 | **0** |

Jede Zeile einzeln nachaddiert. In Runde 1 hatten zwei von drei Dokumenten fehlerhafte Aggregate, eines davon so, dass die Rangfolge kippte. **In Runde 2 ist kein einziger Summenfehler mehr da.** Das ist die deutlichste Qualitätsverbesserung zwischen den Runden.

Mit einer Ausnahme, die unten wieder auftaucht: K3SWARM trägt in `VALIDIERUNG.md` §1 die **Summen aus Runde 1 unverändert** weiter (142 / 127 / 109 / 103). Korrekt wären 144 / 130 / 107 / 111. Die Zweitrunde rechnet richtig, transportiert aber den Erstrundenfehler.

---

## 2. Die drei Rubriken sind nicht dieselbe Frage

| Achse | GPT56 | OPUS5 | K3SWARM |
|---|---:|---:|---:|
| Nutzenfit / Mechanismus | FIT 20 | E Hebel 15 | Fit 20 |
| Evidenz | EVD 20 | D Evidenz 20 | Ev 25 |
| **technische Korrektheit** | **COR 15** | **—** | — |
| **Security / Integrität** | **SEC 15** | **—** | Ris 10 |
| Owner-Kompatibilität | CMP 10 | — | — |
| Aktualität / Lieferfähigkeit | MNT 10 | **A 30 + B 20** | Akt 20 |
| Lizenz | LGL 5 | C 15 | Liz 15 |
| Betrieb / Rückbau | OPS 5 | — | — |
| Konvergenz im Korpus | — | *(in D enthalten)* | Kon 10 |

Drei Beobachtungen:

1. **Nur GPT56 hat eine Achse für „funktioniert das Werkzeug korrekt".** COR 15 plus SEC 15 sind 30 von 100 Punkten für Korrektheit und Sicherheit. Bei OPUS5 gibt es dafür keine Achse; bei K3SWARM sind es 10 Punkte Risiko-Abzug.
2. **OPUS5 vergibt 50 von 100 Punkten für Repository-Eigenschaften** (A Lieferfähigkeit 30 + B Wartungslast 20), die nichts über die Eignung des Werkzeugs aussagen. Ein aktiv gepflegtes MIT-Repo mit falscher Semantik bekommt dort 45 von 50, bevor überhaupt geprüft wird, was es tut.
3. **OPUS5s Achse A+B+C ist zu 70,1 % gemessen** (Commit-Alter, Issues je 1.000 Sterne, Lizenz — Mittel 53,1 von 65 möglichen gemessenen Punkten gegen 22,6 von 35 kodierten). Das ist die reproduzierbarste Rubrik der drei. Sie misst nur eben etwas anderes als GPT56.

---

## 3. Umfang und Überschneidung

| | Einheiten | Mittel | Median | Spanne |
|---|---:|---:|---:|---|
| GPT56 | 18 | **67,7** | 70 | 34–96 |
| OPUS5 | 32 | 75,7 | 76 | 54–100 |
| K3SWARM | 26 | 75,5 | 74 | 56–93 |

Union über alle drei: **39 Einheiten. Von allen dreien bewertet: 15 — also 38 %.**

| Paar | gemeinsam |
|---|---:|
| OPUS5 ∩ K3SWARM | 22 |
| GPT56 ∩ OPUS5 | 15 |
| GPT56 ∩ K3SWARM | 15 |

Exklusiv: GPT56 drei (`native-claude-code`, `local-dispatcher`, `token-saver`), OPUS5 zehn (u. a. `rtk`, `headroom`, `caveman`, `claude-mem`, `boost`, `claude-code-router`), K3SWARM vier (`bash-dump-guard`, `cc-safe-setup`, `claude-rolling-context`, `claude-lean-context`).

Die Auswahl ist damit selbst schon eine Entscheidung: GPT56 bewertet die Absagekandidaten gar nicht erst mit, OPUS5 nimmt sie als Vergleichspunkte auf. Wer nur die Ranglisten nebeneinanderlegt, vergleicht drei verschieden geschnittene Felder.

---

## 4. Systematischer Versatz und Rangkorrelation

### 4.1 Versatz auf der jeweils gemeinsamen Menge

| Paar | n | Mittel | Median | Spanne |
|---|---:|---:|---:|---|
| GPT56 − OPUS5 | 15 | **−16,8** | −14,0 | −49 … +10 |
| GPT56 − K3SWARM | 15 | **−14,3** | −12,0 | −48 … +15 |
| OPUS5 − K3SWARM | 22 | +4,4 | +5,5 | −14 … +15 |

**GPT56 benotet dieselben Werkzeuge im Mittel 15 Punkte strenger als die beiden anderen.**

Das ist die Umkehrung von Runde 1. Dort war GPT56s Gitter (Dokument A) mit einem Notenmittel von 4,40 und 57 % Fünfen das **großzügigste** der drei — und ohne eine einzige 2. Derselbe Autor wechselt in Runde 2 auf die strengste Position, sobald das Bewertungsobjekt von Dokumenten auf Werkzeuge wechselt. Wer beurteilt wird, entscheidet über die Strenge des Beurteilers.

### 4.2 Rangkorrelation (Spearman)

| Paar | ρ | n |
|---|---:|---:|
| OPUS5 vs. K3SWARM | **+0,77** | 22 |
| GPT56 vs. OPUS5 | +0,49 | 15 |
| GPT56 vs. K3SWARM | **+0,26** | 15 |

GPT56 und K3SWARM kommen bei denselben 15 Werkzeugen zu praktisch unabhängigen Rangfolgen.

Die hohe OPUS/K3-Korrelation ist mit Vorsicht zu lesen: K3SWARM erklärt im eigenen Frontmatter, dass die Issue-Tiefenprüfung am GitHub-Rate-Limit gescheitert ist und die übrigen Befunde sich „auf KIMIs Issue-Level-Research und OPUS-v4-Messfelder (selber Tag)" stützen. **Die 0,77 sind daher zum Teil Abhängigkeit, nicht Übereinstimmung.** Zwei Datensätze, die dieselben Messfelder verwenden, bestätigen einander nicht.

---

## 5. Die größten Divergenzen und ihr gemeinsames Muster

| Werkzeug | GPT56 | OPUS5 | K3SWARM | Spanne |
|---|---:|---:|---:|---:|
| `magic-compact` | **34** reject | 83 | 82 | **49** |
| `claude-code-cache-fix` | **39** reject | 75 | 82 | **43** |
| `squeez` | **59** replace | 87 | 80 | **28** |
| `omni` | **57** replace | 83 | 77 | **26** |
| `ponytail` | 74 | 97 | 92 | 23 |
| `planning-with-files` | 75 | 93 | 87 | 18 |
| `compact-plus` | 50 | 54 | 68 | 18 |
| `codeburn` | 70 | 86 | 81 | 16 |
| `snip` | — | 86 | 71 | 15 |
| `sigmap` | **85** | 75 | 70 | 15 |

**Vier der fünf größten Divergenzen folgen demselben Muster:** GPT56 prüft Korrektheit oder Permission-Semantik und verwirft; OPUS5 und K3SWARM prüfen Lieferfähigkeit und vergeben hohe Werte.

Am deutlichsten bei `magic-compact`. GPT56 begründet den Reject mit „kein Claude-Benchmark; ‚lossless' widerspricht Pruning/Discard; Bun und undokumentiertes Transcript-JSONL". OPUS5 kommt auf 83 über A30 · B10 · C15 · D17 · E11 — **ohne dass in dieser Rubrik ein einziger Punkt für die Frage vorgesehen wäre, ob das Werkzeug tut, was es behauptet.**

Bei `claude-code-cache-fix` fällt es OPUS5 sogar selbst auf: U3 hält fest, dass es mit 87 offenen Issues je 1.000 Sternen die **schlechteste Fehlerbilanz des gesamten Feldes** hat. Die Rubrik vergibt dafür B=2 von 20 — und das Repo landet trotzdem bei 75, weil A=30 und C=15 unberührt bleiben.

Zusammengefasst: **die sieben Werkzeuge, die GPT56 auf `replace` oder `reject` setzt, bewerten OPUS5 im Mittel mit 75,5 und K3SWARM mit 76,8 — gegen GPT56s 51,1.** Ein Abstand von rund 25 Punkten, systematisch in eine Richtung.

Die einzige Divergenz gegen dieses Muster ist `sigmap`: hier ist GPT56 mit 85 der Ausreißer nach oben, weil es als einziges die extern archivierten Rohdaten (Zenodo, eigene Benchmark-Suite) als Evidenz gewichtet.

---

## 6. Der Zirkelschluss in zwei von drei Rubriken

OPUS5 vergibt unter `D Evidenzlage` **20 Punkte für die Anzahl der Datensätze, die das Repo empfehlen** (0–4). K3SWARM vergibt unter `Konvergenz` **10 Punkte für dieselbe Größe**.

Damit fließt in beide Zweitvalidierungen als Evidenz ein, was die Erstvalidierungen empfohlen haben. Ein Werkzeug, das in Runde 1 von allen vier Datensätzen genannt wurde, bekommt in Runde 2 dafür Punkte — unabhängig davon, ob die Nennung damals begründet war. Bei OPUS5 sind das **20 % des Scores**.

Das ist genau die Fehlerklasse, vor der alle vier Datensätze in Runde 1 gewarnt haben („Nennerdisziplin", „keine Scheinbestätigung", „Sekundärquellen kennzeichnen"). Sie ist hier in die Bewertungsformel eingebaut.

GPT56 hat diesen Term nicht. Das erklärt einen Teil des Versatzes aus §4.1 — und bedeutet, dass GPT56s Rangfolge die einzige der drei ist, die nicht teilweise die Popularität im eigenen Korpus misst.

---

## 7. Delta Erstvalidierung → Zweitvalidierung, je Modell

### 7.1 GPT56 — verschärft, baut um, senkt vor allem K3SWARM

**Datensatzbewertung** (Erstrunde auf 100 normiert, gegen Zweitrunde):

| Datensatz | V1 (5-Punkte ×20) | V2 (1–100) | Δ |
|---|---:|---:|---:|
| GPT | 97,5 | 91 | −6,5 |
| OPUS | 92,5 | 85 | −7,5 |
| KIMI | 83,8 | 79 | −4,8 |
| **K3** | **78,1** | **63** | **−15,1** |

GPT56 senkt alle vier, K3SWARM aber doppelt so stark wie jeden anderen. **Der Abstand GPT–K3 wächst von 19,4 auf 28 Punkte.** Die Begründung ist wörtlich dieselbe wie in der Erstrunde („ohne Samplemanifest, Befehle, Snapshots und Logs zu schwach") — neu ist nur, dass sie jetzt Punkte kostet. In Runde 1 stand der Vorbehalt als Fußnote unter der Tabelle, ohne Wirkung auf den Wert.

**Inhaltliche Kehrtwenden:**

| Gegenstand | Runde 1 | Runde 2 |
|---|---|---|
| `squeez` | einer von mehreren Bash-Owner-Armen (OMNI, semtrim, Snip, lowfat, Squeez, Boost) | **`replace`, 59** — „zentraler Sicherheitskonflikt", `permissionDecision: allow` |
| Bash-Owner-Default | GPT55-Guard, das einzige funktionsgeprüfte Paket des Korpus | **neu gebauter `local-dispatcher`** (`stack.mjs`, 84) — der eigene Erstrunden-Sieger wird ersetzt |
| `sigmap` | am Rand geführt | **Platz 3 mit 85**, stärkste reproduzierbare Retrieval-Evidenz (Zenodo-Archiv) |
| `allow`-Semantik | Präzedenz `deny > defer > ask > allow`, ältere Bypass-Aussagen veraltet | präzisiert und zum **primären Ausschlusskriterium** für fünf Werkzeuge erhoben |
| `toonify-mcp` | additionalContext-Defekt entdeckt | **fällt ganz aus der Bewertung** — kein Eintrag in der 18er-Liste |

Der letzte Punkt ist eine echte Unstimmigkeit zwischen den Modellen: K3SWARM schreibt in seiner Matrix `GPT56: ❌→✅ (Fix 0.8.x)` und schreibt GPT56 damit eine Rehabilitierung zu, die in GPT56s Zweitvalidierung **nicht vorkommt**.

**Neue Korrekturen an fremden Datensätzen:** V01 OPUS-Katalog „376" → 372 normalisierte IDs mit vier Duplikaten und ungültigem `harrisonsec/`; V02 OPUS' R2 `bash-output-owner.mjs` fehlt; V03 K3s „neun Schichten" nummeriert zehn.

### 7.2 OPUS5 — stellt das Ranking ein, kehrt eigene Positionen um, findet Fehler am eigenen Code

**Der größte Einzelschritt: OPUS5 stellt die Datensatz-Rangfolge ein.** Begründung im eigenen §0: die beiden Erstrunden-Crosswalks sind invers (Fremd-Crosswalk setzt OPUS_V4 auf Platz 1 mit 142, der eigene auf Platz 4 mit 3,97), und **beide Urteile sind in Richtung ihres Autors unzuverlässig.** Ab jetzt werden nur noch Einzelentscheidungen geführt.

Das ist derselbe Befund wie in meiner Erstrunden-Meta-Validierung §5.1, unabhängig erreicht — und die schärfere Konsequenz daraus: nicht korrigieren, sondern die Kategorie streichen.

**Positionsumkehrungen gegenüber der eigenen Erstvalidierung:**

| Gegenstand | Runde 1 (OPUS) | Runde 2 | Beleg |
|---|---|---|---|
| `ENABLE_TOOL_SEARCH` | „bleibt aktiv", Modi nicht unterschieden | **`true` setzen** — tokenminimal; `unset` = `auto` = Schwellenmodus; `false` nie | Issue #19890, Doku |
| Katalogzahl | 376 | **375, 374 erreichbar**; `harrisonsec/` als eigenes Extraktionsartefakt entfernt | K1 |
| Skill-Stückkosten | ~100 Token je Skill `[SEKUNDÄR]`, trägt Stufe 0 | **Begründung gestrichen**, Hebel auf die 25 aktiven Plugins umformuliert | `skillListingBudgetFraction: 0.01` |
| `.claude/rules` | Volatiles in Skills | **Split nur mit 3–5 Dateien à < 30 Zeilen**; die 173-Zeilen-`CLAUDE.md` bleibt, wo sie ist | #32057 „Closed as not planned" |
| Bash-Owner | eigener Guard erste Wahl | `squeez` 87 → `snip` 86 → `omni` 83 | Lieferfähigkeitsrubrik |

**Selbstkritik am eigenen Werkzeug — Defekt D1:** `prefix-budget.mjs` meldet auf der realen Konfiguration **2 Hooks auf `PreToolUse:Bash`, tatsächlich sind es 3.** Die Kollisionserkennung wertet nur exakte Matcher aus und übersieht Alternationen (`Bash|Read|Grep|Glob|Agent|Task`). Genau die Regel, die als Alleinstellungsmerkmal beworben wird, greift auf dem Zielsystem zu kurz. Das deckt sich mit meinem eigenen Zählbefund aus v1.2 §8.1.

**Neue Primärprüfungen:** alle sechs rtk-Issues einzeln abgerufen (#260 CLOSED, #582 CLOSED, #1155 OPEN, #2345 **CLOSED**, #3152 OPEN, #3175 OPEN), CVE-Zuordnung geklärt, #32057 abgerufen, sieben Unstimmigkeiten U1–U7 mit Konsequenz, fünf Defekte D1–D5.

### 7.3 K3SWARM — liefert einen echten Neubefund, transportiert aber drei alte Fehler weiter

**Als einziges Modell mit einer expliziten Delta-Tabelle** (§5, neun Zeilen). Genau die Aufgabenstellung dieses Dokuments hat K3SWARM für sich selbst mitgeliefert — methodisch vorbildlich.

**Der echte Zugewinn:** die Rehabilitierung von `toonify-mcp`. Mit Datum (0.8.0/0.8.1 am 12.08.2026), Mechanismus (Hook nutzt jetzt `updatedToolOutput` ersetzend statt `additionalContext`), Messwert (63,8 % Read-Reduktion, 500-Zeilen-JSON, cl100k) und ReDoS-Fix. **Das hat keiner der beiden anderen.** GPT56 hat den ursprünglichen Defekt gefunden und das Werkzeug danach fallengelassen; OPUS5 bewertet es mit 85, ohne den Fix zu erwähnen.

Zweiter Zugewinn: die Abstufung von `quiet-bash` (5★, 38 Tage still, null Websuchtreffer) — unabhängig deckungsgleich mit OPUS5s U5.

**Drei Fehler wandern unkorrigiert weiter:**

1. **Die CVE-Fehlzuordnung wird ausdrücklich bekräftigt.** §4.2 führt rtk weiter mit „CVE-2026-33068, #1155/#2345/#3152" als harte Absage, §3 U9 schreibt dazu „Absage bestätigt". OPUS5 hat im **selben Durchgang** belegt, dass CVE-2026-33068 zu `anthropics/claude-code` gehört (GHSA-mmgp-wc2j-qcv7, behoben in 2.1.53) und dass `#2345` geschlossen ist. Der schwerste Einzelfehler des Korpus wird in Runde 2 nicht nur wiederholt, sondern als bestätigt ausgewiesen.

2. **T1 rechnet mit dem Modell, das K3SWARM selbst falsifiziert hat.** Die Tokenberechnung T1 lautet „20 Skills × ~100 [SEK] + Guidance 3.500 + MCP 286 + Git-Instr. 1.800 = ~7.586 Tokens/Session". K3SWARM ist der Datensatz, der die lineare Stückkostenrechnung „n Skills × 100 Token" widerlegt hat — und der Konflikt K4 wurde von OPUS5 **zu seinen Gunsten** entschieden. Es benutzt in der eigenen Kernrechnung genau das Modell, für dessen Widerlegung es Punkte bekommen hat.

3. **Die Erstrunden-Summen bleiben falsch.** `VALIDIERUNG.md` §1 führt 142 / 127 / 109 / 103; nachgerechnet sind es 144 / 130 / 107 / 111.

**Methodische Offenheit als Gegengewicht:** K3SWARM deklariert im Frontmatter, dass die Issue-Tiefenprüfung am GitHub-Rate-Limit gescheitert ist, markiert die betroffenen Felder als „nicht tiefer geprüft" und benennt, worauf es sich stattdessen stützt. Das ist redlich — und macht die Zweitvalidierung überwiegend derivativ. Zusammen mit dem Konvergenzterm aus §6 bedeutet es: K3SWARMs Rangliste ist zu einem erheblichen Teil eine gewichtete Aggregation der beiden anderen.

### 7.4 Übersicht

| | GPT56 | OPUS5 | K3SWARM |
|---|---|---|---|
| Datensatz-Ranking | verschärft | **eingestellt** | unverändert übernommen |
| eigene Position umgekehrt | `squeez`, Bash-Owner, `sigmap` | `ENABLE_TOOL_SEARCH`, Skillkosten, Katalogzahl, Bash-Owner | keine |
| Fehler am eigenen Artefakt gefunden | Guard ersetzt | **D1 an `prefix-budget.mjs`** | keine |
| neue Primärquellen abgerufen | Issues zu 11 Repos, Zenodo | 6 rtk-Issues, #32057, #19890/#31002/#40314, 32 Repos vermessen | 4 Live-Stichproben (Rate-Limit) |
| Erstrundenfehler korrigiert | — | Katalog, Toolsearch, Skillkosten | — |
| Erstrundenfehler transportiert | — | — | **CVE, Skillkostenmodell, Summen** |
| exklusiver Zugewinn | `local-dispatcher`, `sigmap`-Evidenz | Unstimmigkeiten U1–U7, Defekte D1–D5 | **`toonify`-Rehabilitierung** |

---

## 8. Was Runde 2 unabhängig reproduziert hat

Zum ersten Mal im gesamten Korpus gibt es zwei voneinander unabhängige Messungen derselben Größen — und sie stimmen überein:

| Größe | GPT56 | OPUS5 | Abweichung |
|---|---:|---:|---:|
| `CLAUDE.md` Token (tiktoken/o200k_base) | **1.975** | **1.975** | **0** |
| `settings.json` Bytes / Token | 10.707 / 2.984 | 10.707 / 2.984 | **0** |
| `hooks/` gesamt Bytes | 88.241 | 88.241 | **0** |
| Datensatzgrößen GPT / OPUS / K3 (Bytes) | 359.510 / 445.070 / 42.399 | identisch | **0** |
| `CLAUDE.md` Bytes | 8.416 | 8.361 | 55 |

Der Bytewert ist die einzige Abweichung und dürfte auf Zeilenenden oder ein abschließendes Newline zurückgehen; die Tokenzahl ist trotzdem identisch. **Das ist die erste belastbar reproduzierte Messung des Projekts.**

Eine Abweichung bleibt: beim `KIMI_AGENT`-Verzeichnis zählt GPT56 **1 Datei / 224.270 Bytes**, OPUS5 **50 Dateien / 1.844.926 Bytes** — Faktor 8. GPT56 hat auf die eine Konzeptdatei begrenzt, OPUS5 das ganze Verzeichnis gezählt. Beide erfüllen denselben Auftragspunkt („umfassender Dateienabgleich") mit unterschiedlichem Umfang.

Weitere Konvergenzen ohne Absprache: `ccusage` an der Spitze (86 / 100 / 93), `ponytail` hoch (74 / 97 / 92), `planning-with-files` hoch (75 / 93 / 87), `codegraph` konditional mit Versionspin (80 / 90 / 83), `quiet-bash` abgestuft, `context-mode` durch ELv2 gesperrt, KIMIs Guard-Code nicht übernehmbar, und in allen drei Dokumenten der Satz, dass **kein Datensatz eine E2E-Messung hat.**

---

## 9. Was Runde 2 an meiner eigenen Meta-Validierung korrigiert

| Meine Aussage (v1.2) | Korrektur aus Runde 2 |
|---|---|
| §8.4: Konflikt K3 sei entschieden, weil `ENABLE_TOOL_SEARCH` ungesetzt = GPT56s Empfehlung | **Unvollständig.** `unset` = `auto` = Schwellenmodus. Tokenminimal ist `true`. Dazu zwei Randbedingungen, die kein Datensatz führte: HTTP-/Streamable-MCP-Server werden nicht deferiert (#40314); Built-in-Tools sind seit 2.1.69 deferiert und von ~14–16k auf ~968 Token gefallen (#31002) — das verschiebt die Schemaflächenrechnung aller vier Datensätze nach unten. |
| §6.2: Issue #32057 nicht bestätigt, K5 laufe auf dieselbe Maßnahme hinaus | **Zu großzügig.** OPUS5 hat #32057 abgerufen: real, „Closed as not planned", also unbehoben. K5 fällt zugunsten KIMI. Die Konsequenz (Root klein halten) bleibt richtig, aber der Split nach `.claude/rules` ist nur unter der harten Auflage 3–5 Dateien à < 30 Zeilen zulässig — ohne sie verlagert man Prefixkosten in eine Per-Tool-Call-Kostenstelle. |
| §5.1/§5.2: Autorschaft von Dokument A nicht offengelegt | **Aufgelöst: GPT56.** Die 4,88 war eine Selbstbewertung. |
| §5.7: Konflikt K1 auf „Restlücke 5" verkleinert | **Vollständig aufgelöst.** GPT56-Union 365 kanonisch ist echte Teilmenge von OPUS5s 368; drei Ergänzungen nur bei OPUS5. |
| §6.1: rtk-Issuelage teilweise offen | **Vollständig geprüft.** Zwei offene Permission-Rewrite-Issues (#1155, #3152), ein offenes Kostenissue (#3175); #260, #582, #2345 geschlossen. |

Meine Kernbefunde aus Runde 1 — Rechenfehler, Selbstbezüglichkeit, Absenzkonvention, Gitterkomposition, CVE-Fehlzuordnung — bleiben unverändert bestehen und sind in Runde 2 an mehreren Stellen unabhängig bestätigt worden.

---

## 10. Die Bash-Owner-Fläche: drei Antworten auf die Frage mit dem härtesten Konsens

| Modell | Erste Wahl | Bewertung von `squeez` |
|---|---|---:|
| GPT56 | neuer eigener `local-dispatcher` | **59 — `replace`, Sicherheitskonflikt** |
| OPUS5 | `squeez` → `snip` → `omni` | **87 — Rang 5 des Gesamtfelds** |
| K3SWARM | `bash-dump-guard` (GPT55-Suite) nach Fix B1–B4, A/B gegen `squeez` | 80 |

Der stabilste Befund des gesamten Korpus lautet „genau ein mutierender Owner je Kontextfläche" — vier von vier Datensätzen, alle drei Erstrunden-Gitter, Themenmittel 4,46 von 5. Runde 2 liefert für genau diese Fläche **drei verschiedene Besetzungen**, und dasselbe Werkzeug schwankt zwischen 59 („Sicherheitskonflikt, nicht Default") und 87 (Rang 5).

Der Unterschied ist vollständig auf die Rubriken zurückführbar: GPT56 zieht 12 von 15 SEC-Punkten und 8 von 10 CMP-Punkten ab, weil `squeez` bei Rewrites `permissionDecision: allow` zurückgibt; OPUS5 hat für diesen Sachverhalt keine Achse und kommt über Aktivität, Lizenz und Konvergenz auf 87.

**Beide haben in ihrer Rubrik richtig gerechnet. Nur eine der beiden Rubriken stellt die Frage, die auf dieser Fläche zählt.**

---

## 11. Maschinenlesbare Blöcke

```tsv
modell	einheiten	mittel	median	min	max	summenfehler	rubrikachsen	korrektheitsachse	konvergenzterm
GPT56	18	67.7	70	34	96	0	8	ja (COR15+SEC15)	nein
OPUS5	32	75.7	76	54	100	0	5	nein	ja (D20)
K3SWARM	26	75.5	74	56	93	0	6	teilweise (Ris10)	ja (Kon10)
```

```tsv
paar	n	mittlerer_versatz	median_versatz	spearman_rho
GPT56-OPUS5	15	-16.8	-14.0	+0.486
GPT56-K3SWARM	15	-14.3	-12.0	+0.258
OPUS5-K3SWARM	22	+4.4	+5.5	+0.770
```

```tsv
werkzeug	GPT56	OPUS5	K3SWARM	spanne	GPT_entscheidung
magic-compact	34	83	82	49	reject
claude-code-cache-fix	39	75	82	43	reject
squeez	59	87	80	28	replace
omni	57	83	77	26	replace
ponytail	74	97	92	23	conditional
planning-with-files	75	93	87	18	conditional
compact-plus	50	54	68	18	replace
codeburn	70	86	81	16	conditional
snip	na	86	71	15	na
sigmap	85	75	70	15	conditional
tokf	58	71	72	14	replace
lowfat	na	78	64	14	na
ccusage	86	100	93	14	use
serena	69	82	74	13	conditional
context-mode	66	75	77	11	conditional
codegraph	80	90	83	10	conditional
llmtrim	na	83	75	8	na
toonify-mcp	na	85	78	7	na
tokdiet	na	78	72	6	na
codebase-memory-mcp	76	79	74	5	conditional
quiet-bash	na	69	65	4	na
mcp-compressor	na	71	67	4	na
```

```tsv
datensatz	V1_5punkt	V1_auf_100	V2_1_100	delta
GPT	4.88	97.5	91	-6.5
OPUS	4.63	92.5	85	-7.5
KIMI	4.19	83.8	79	-4.8
K3	3.91	78.1	63	-15.1
```

```tsv
modell	ranking_gefuehrt	eigene_position_umgekehrt	eigener_defekt_gefunden	erstrundenfehler_korrigiert	erstrundenfehler_transportiert	exklusiver_zugewinn
GPT56	verschaerft	squeez,bash-owner,sigmap	Guard ersetzt	-	-	local-dispatcher,sigmap-evidenz
OPUS5	eingestellt	tool-search,skillkosten,katalog,bash-owner	D1 prefix-budget.mjs	katalog,toolsearch,skillkosten	-	U1-U7,D1-D5
K3SWARM	unveraendert	-	-	-	CVE,skillkostenmodell,summen	toonify-rehabilitierung
```

```tsv
konvergenz	GPT56	OPUS5	uebereinstimmung
CLAUDE.md_token	1975	1975	exakt
settings.json_bytes	10707	10707	exakt
settings.json_token	2984	2984	exakt
hooks_bytes	88241	88241	exakt
CLAUDE.md_bytes	8416	8361	55 bytes differenz
KIMI_verzeichnis_bytes	224270	1844926	faktor 8 - unterschiedlicher scope
```

---

## 12. Fazit

Die zweite Runde ist handwerklich besser als die erste. Kein Summenfehler in drei Dokumenten, Issue-Nummern einzeln abgerufen statt zitiert, Tokenwerte mit benanntem Tokenizer statt geschätzt, und zum ersten Mal eine Größe, die zwei Modelle unabhängig voneinander auf denselben Wert gemessen haben. Die 1.975 Token der `CLAUDE.md`, bei GPT56 und OPUS5 auf das Token identisch, sind der erste Wert im gesamten Projekt, den man ohne Vorbehalt zitieren kann.

Genau das legt aber das größere Problem frei. Die drei Ranglisten sehen aus wie drei Antworten auf dieselbe Frage und sind es nicht. GPT56 fragt, ob ein Werkzeug korrekt und sicher arbeitet, und vergibt dafür 30 von 100 Punkten. OPUS5 fragt, ob ein Repository lieferfähig ist, und vergibt dafür 50 — eine Achse für Korrektheit gibt es dort nicht. K3SWARM fragt nach Evidenz und Mechanismus, konnte die Issue-Ebene aber wegen eines Rate-Limits nicht selbst prüfen und stützt sich auf die anderen beiden. Dass GPT56 dieselben Werkzeuge im Schnitt fünfzehn Punkte niedriger bewertet, ist deshalb kein Dissens über Fakten, sondern die Differenz zwischen zwei Fragen. Bei `magic-compact` sind es 49 Punkte, und beide Seiten haben in ihrer eigenen Rubrik richtig gerechnet.

Zwei der drei Rubriken vergeben Punkte dafür, dass andere Datensätze dasselbe Werkzeug empfohlen haben — bei OPUS5 ein Fünftel des Scores. Der Korpus zitiert sich damit selbst als Evidenz, in derselben Runde, in der er sich vornimmt, Sekundärquellen zu kennzeichnen. Und die hohe Rangkorrelation zwischen OPUS5 und K3SWARM ist zu einem guten Teil kein Konsens, sondern gemeinsame Datenbasis: K3SWARM sagt selbst, dass es OPUS5s Messfelder benutzt hat.

Im Vergleich der Runden zeigen die drei Modelle drei verschiedene Umgangsweisen mit den eigenen Fehlern. **OPUS5 korrigiert sich am härtesten** — es kehrt vier eigene Positionen um, streicht die Kategorie Datensatz-Rangfolge ganz, weil die beiden Erstrunden-Urteile invers und beide autornah sind, und findet einen Defekt an genau dem eigenen Werkzeug, das die Regel prüfen soll, die als sein Alleinstellungsmerkmal gilt. **GPT56 verschärft** — es senkt alle vier Datensätze, K3SWARM doppelt so stark wie die anderen, ersetzt seinen eigenen Erstrundensieger durch einen Neubau und macht die Permission-Semantik zum Ausschlusskriterium. Bemerkenswert daran: derselbe Autor, dessen Erstrunden-Gitter mit 57 % Fünfen und keiner einzigen Zwei das großzügigste der drei war, ist jetzt der strengste. Die Strenge hängt am Bewertungsobjekt, nicht am Bewerter. **K3SWARM liefert einen echten, datierten, prüfbaren Neubefund** — die `toonify`-Rehabilitierung mit Versionsnummer, Mechanismus und Messwert, die keiner der anderen hat — und trägt zugleich drei Fehler unkorrigiert weiter, darunter die CVE-Fehlzuordnung, die es ausdrücklich als bestätigt ausweist, während OPUS5 sie im selben Durchgang widerlegt.

Der letzte Punkt ist der, an dem ich am wenigsten diplomatisch sein kann. Eine falsch zugeordnete CVE ist in Runde 1 ein Versehen. In Runde 2, nach einem Auftrag, der ausdrücklich die Issue-Prüfung verlangt, mit dem Vermerk „Absage bestätigt", ist sie eine Aussage über das Prüfverfahren. Und dass dieselbe Rechnung, für deren Widerlegung K3SWARM in Konflikt K4 Recht bekommen hat, in seiner eigenen Kernberechnung T1 wieder auftaucht, gehört in dieselbe Kategorie: die Befunde stimmen, aber sie werden nicht auf die eigene Arbeit zurückgespielt.

Bleibt die Fläche, an der sich alles entscheidet. Der stabilste Konsens des gesamten Korpus lautet, dass es je Kontextfläche genau einen mutierenden Owner geben darf. Runde 2 liefert für die Bash-Fläche drei verschiedene Besetzungen, und `squeez` steht darin einmal bei 59 mit dem Vermerk Sicherheitskonflikt und einmal bei 87 auf Rang fünf. Beide Zahlen sind in ihrer Rubrik korrekt. Nur eine der beiden Rubriken stellt die Frage, die auf dieser Fläche zählt — nämlich ob ein Hook still Berechtigungen erteilt. Das ist keine Bewertungsfrage mehr, sondern eine Sicherheitsfrage, und sie ist mit einer Rangliste nicht zu beantworten.

Für den nächsten Schritt heißt das dasselbe wie am Ende der ersten Runde, nur konkreter: die drei Ranglisten sind keine dritte Meinung, sondern drei Messgeräte mit verschiedenen Skalen. Bevor daraus ein Stack wird, braucht es eine einzige Rubrik, in der Korrektheit und Permission-Semantik eine eigene Achse haben, und einen Baseline-Lauf auf der echten Maschine. Alles andere ist eine sehr gründliche Bibliografie.

---

## 13. Vollständiges Repo-Inventar

Alle Einheiten, die in mindestens einer der drei Zweitvalidierungen mit einem Wert versehen sind, plus die namentlich behandelten Fälle ohne Score.

**Bewertet: 39 Einheiten.** Davon von allen dreien 15, von genau zweien 9, von genau einem 15.

| nur GPT56 | nur OPUS5 | nur K3SWARM |
|---|---|---|
| `native-claude-code`, `local-dispatcher`, `token-saver` | `rtk`, `headroom`, `caveman`, `claude-mem`, `boost`, `claude-code-router`, `token-optimizer`, `tokscale`, `agentsview`, `tokensave` | `bash-dump-guard`, `cc-safe-setup`, `claude-rolling-context`, `claude-lean-context` |

**Genannt, aber von keinem bewertet — sieben Fälle**, alle aus K3SWARMs Absageliste: `teamchong/pxpipe`, `diegosouzapw/OmniGlyph`, `ZongqianLi/500xCompressor`, `LLMLingua-2-Hooks`, globale Memory-MCPs als Default, `jaredboynton/semtrim`, `ojuschugh1/sqz`. Für sie existiert in Runde 2 kein Zahlenwert in irgendeinem Datensatz; sie können auch nicht angeglichen werden. Vier weitere Absagekandidaten (`rtk`, `caveman`, `headroom`, `token-optimizer`) sind nur deshalb im Inventar, weil OPUS5 sie als Vergleichspunkte mitbewertet — K3SWARM verwirft sie ohne Score, GPT56 führt sie gar nicht.

Das ist bereits die erste Grenze jeder Angleichung: **eine Rangliste, in die ein Werkzeug nicht aufgenommen wurde, ist keine schlechte Bewertung, sondern gar keine.** Rechnerisch lässt sich das nicht heilen.

---

## 14. Achsen-Crosswalk

Alle drei Rubriken liegen achsenweise vor. Damit ist eine Angleichung über den Inhalt möglich statt über eine Skalenverschiebung. Acht gemeinsame Achsen (GA) decken alle drei Rubriken vollständig ab:

| GA | Bedeutung | GPT56 | OPUS5 | K3SWARM |
|---|---|---:|---:|---:|
| GA1 | Nutzen-/Mechanismus-Fit | FIT 20 | — | Fit 20 |
| GA2 | Evidenzqualität | EVD 20 | E 15 | Ev 25 |
| GA3 | Korrektheit & Sicherheit | COR 15 + SEC 15 = **30** | — | Ris 10 |
| GA4 | Owner-/Hookvertrag-Kompatibilität | CMP 10 | — | — |
| GA5 | Lieferfähigkeit & Aktualität | MNT 10 | A 30 + B 20 = **50** | Akt 20 |
| GA6 | Lizenz und Recht | LGL 5 | C 15 | Liz 15 |
| GA7 | Betrieb & Rückbau | OPS 5 | — | — |
| GA8 | Korpus-Konvergenz *(Zirkelterm)* | — | D 20 | Kon 10 |
| | **Summe** | **100** | **100** | **100** |

**Zwei Auslegungsentscheidungen, beide offengelegt:**

1. **OPUS5s Achse `E` heißt „Hebel/Passung", ihre Vergaberegel lautet aber „Evidenztier der Wirkungsbelege (unabhängig 15 · Eigenbenchmark 11 · Herstellerclaim 7)".** Label und Regel widersprechen sich. Ich folge der Regel und ordne `E` auf GA2 (Evidenz) statt auf GA1 (Fit) ein. Wirkung dieser Entscheidung, gegengerechnet: mittlere absolute Abweichung **1,28 Punkte**, größte **4,17**, Rangkorrelation der beiden Lesarten **+0,971**. Die Entscheidung ist damit praktisch folgenlos.
2. **K3SWARMs `Risiko` ist eine Abzugsachse** (Start 10, je Befund −1 bis −4), GPT56s `COR`/`SEC` sind additiv. Beide werden als Erfüllungsgrad 0–1 normiert; die Richtung stimmt, die Auflösung nicht — 10 Punkte Abzug bilden 30 Punkte Prüfung nicht ab. Das ist keine Verzerrung durch die Angleichung, sondern eine Eigenschaft der Rubrik.

**Nicht abgebildet:** GPT56s Entscheidungslabels (`use`/`conditional`/`replace`/`reject`) und OPUS5s Flächenzuordnung. Beide sind Urteile, keine Punkte, und werden unverändert danebengestellt.

---

## 15. Die vier Angleichungsstufen

Jede Stufe ist eine Regel, kein Fall-für-Fall-Eingriff. Die Parameterzahl steht daneben — sie ist das Maß dafür, wie viel Freiheit ich mir genommen habe.

| Stufe | Regel | Parameter | Begründung |
|---|---|---:|---|
| **A0** | Rohwert, unverändert | 0 | Referenz |
| **A1** | **Entzirkelung** — GA8 entfernen, Rest auf 100 reskalieren | 1 je Modell (die Maximalpunktzahl von GA8) | Alle drei Datensätze fordern in ihrer eigenen Methodik, Sekundärquellen zu kennzeichnen und Scheinbestätigung zu vermeiden. Ein Punkteterm für „andere empfehlen es auch" verletzt genau das. GPT56 hat ihn nicht, OPUS5 20 Punkte, K3SWARM 10. |
| **A2** | **Gemeinsamer Achsenkern** — nur GA2, GA5, GA6, auf 100 reskaliert | 1 je Modell | Die einzigen drei Achsen, die alle drei Rubriken führen. Nichts wird imputiert. Untergrenze der Vergleichbarkeit. |
| **A3** | **Konsensgewichtung** — Erfüllungsgrad je Achse × gemeinsamem Gewichtsvektor, über die eigenen Achsen renormiert | 7 (der Gewichtsvektor), mechanisch abgeleitet | Der Gewichtsvektor ist das arithmetische Mittel der drei Rubrikgewichte, fehlende Achse = 0, GA8 entfernt, auf 100 normiert. Ich wähle die Gewichte nicht, die drei Modelle tun es gemeinsam. |
| **A4** | **Konsensscore** — wie A3, plus Kreuzimputation fehlender Achsen aus den Modellen, die sie haben | 0 zusätzlich | Ergibt einen Wert je Repo. Der invasivste Schritt: für OPUS5 werden GA1, GA3, GA4 und GA7 aus GPT56 und K3SWARM ergänzt. Die Abdeckungsspalte gibt an, welcher Gewichtsanteil real belegt ist. |

Der Konsensgewichtsvektor, vollständig:

| GA1 | GA2 | GA3 | GA4 | GA5 | GA6 | GA7 |
|---:|---:|---:|---:|---:|---:|---:|
| 14,81 | 22,22 | 14,81 | 3,70 | **29,63** | 12,96 | 1,85 |

Auffällig daran: die schwerste Achse der Konsensgewichtung ist **Lieferfähigkeit mit 29,63** — nicht, weil ich das für richtig hielte, sondern weil OPUS5 ihr 50 von 100 Punkten gibt und der Mittelwert das durchschlagen lässt. Wer die Gewichtung für falsch hält, hält die Gewichtung der drei Modelle für falsch, nicht meine.

---

## 16. Diagnose: wo der Abstand tatsächlich entsteht

Erfüllungsgrad je Achse, gemittelt über die 15 von allen drei bewerteten Repos:

| GA | Gewicht | GPT56 | OPUS5 | K3SWARM | Spanne |
|---|---:|---:|---:|---:|---:|
| GA1 Fit | 14,81 | 72,0 % | — | 77,7 % | 5,7 pp |
| **GA2 Evidenz** | 22,22 | **49,7 %** | **68,0 %** | 63,2 % | **18,3 pp** |
| **GA3 Korrektheit & Sicherheit** | 14,81 | **59,8 %** | **keine Achse** | 82,7 % | **22,9 pp** |
| GA4 Owner-Kompatibilität | 3,70 | 63,3 % | — | — | — |
| GA5 Lieferfähigkeit | 29,63 | 81,3 % | 84,4 % | 89,3 % | 8,0 pp |
| GA6 Lizenz | 12,96 | 96,0 % | 88,0 % | 95,6 % | 8,0 pp |
| GA7 Betrieb | 1,85 | 73,3 % | — | — | — |

**Das ist die Antwort auf die Frage, warum die drei Ranglisten auseinanderlaufen — und sie hat zwei Teile.**

Bei **Fit, Lieferfähigkeit und Lizenz** sind sich die Modelle einig; die Spannen liegen bei 6 bis 8 Prozentpunkten. Wären das die einzigen Achsen, gäbe es keinen Streit.

Der Abstand entsteht an zwei Stellen:

- **GA2 Evidenz, 18,3 Prozentpunkte.** GPT56 erfüllt im Mittel 49,7 % der Evidenzpunkte, OPUS5 68,0 %. Das ist kein Skalenartefakt — beide bewerten dieselbe Achse an denselben Repos und kommen zu verschiedenen Urteilen. **Das ist echter Dissens über den Evidenzmaßstab und darf nicht wegnormiert werden.**
- **GA3 Korrektheit & Sicherheit, 22,9 Prozentpunkte — und OPUS5 hat dafür keine Achse.** GPT56 vergibt hier 30 Punkte, K3SWARM 10, OPUS5 null. Wo GPT56 einen Korrektheitsmangel findet, existiert in OPUS5s Rubrik kein Ort, an dem er sich niederschlagen könnte.

Zerlegt man den rohen Abstand GPT56 ↔ OPUS5 von 16,8 Punkten:

| | Abstand GPT56 − OPUS5 |
|---|---:|
| A0 roh | **−16,8** |
| A1 nach Entzirkelung | −16,8 |
| A2 auf dem gemeinsamen Achsenkern | −16,7 |
| A3 mit Konsensgewichtung | **−8,7** |

**Rund die Hälfte des Abstands ist Gewichtungsartefakt und lässt sich angleichen. Die andere Hälfte ist Dissens und bleibt stehen.** Bemerkenswert: die Entzirkelung ändert am Abstand fast nichts (−16,8 → −16,8), und der gemeinsame Achsenkern auch nicht (−16,7). Wer nur die Skalen verschiebt, hat nichts angeglichen.

---

## 17. Ergebnistabelle — alle Repos, alle Stufen

`GPT′`, `OPUS′`, `K3′` sind die Werte nach Stufe A3 (Konsensgewichtung, eigene Achsen). `Konsens` ist Stufe A4. `Abd.` gibt an, welcher Anteil der Konsensgewichtung real belegt und nicht kreuzimputiert ist.

| Repo | Fläche | n | GPT | OPUS | K3 | Δ roh | GPT′ | OPUS′ | K3′ | Δ angegl. | **Konsens** | Abd. |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `native-claude-code` | Basis | 1 | 96 | — | — | — | 93.3 | — | — | — | **93.3** | 100 % |
| `ccusage` | Messung | 3 | 86 | 100 | 93 | 14 | 87.3 | 100.0 | 93.7 | 13 | **92.5** | 100 % |
| `ponytail` | Verhalten | 3 | 74 | 97 | 92 | 23 | 80.2 | 97.3 | 91.4 | 17 | **87.1** | 100 % |
| `planning-with-files` | Persistenz | 3 | 75 | 93 | 87 | 18 | 77.7 | 90.9 | 86.7 | 13 | **84.7** | 100 % |
| `bash-dump-guard` | Bash-Owner | 1 | — | — | 83 | — | — | — | 84.1 | — | **84.1** | 94 % |
| `codegraph` | Retrieval | 3 | 80 | 90 | 83 | 10 | 81.4 | 85.4 | 81.6 | 4 | **81.9** | 100 % |
| `local-dispatcher` | Bash-Owner | 1 | 84 | — | — | — | 81.9 | — | — | — | **81.9** | 100 % |
| `codeburn` | Messung | 3 | 70 | 86 | 81 | 16 | 74.9 | 88.1 | 82.7 | 13 | **80.5** | 100 % |
| `claude-mem` | Memory | 1 | — | 82 | — | — | — | 79.0 | — | — | **79.0** | 65 % |
| `toonify-mcp` | Format | 2 | — | 85 | 78 | 7 | — | 81.7 | 80.4 | 1 | **78.8** | 94 % |
| `claude-rolling-context` | Proxy | 1 | — | — | 73 | — | — | — | 78.7 | — | **78.7** | 94 % |
| `boost` | BashOwner | 1 | — | 70 | — | — | — | 78.5 | — | — | **78.5** | 65 % |
| `llmtrim` | Proxy | 2 | — | 83 | 75 | 8 | — | 81.7 | 77.0 | 5 | **77.1** | 94 % |
| `squeez` | BashOwner | 3 | 59 | 87 | 80 | 28 | 73.8 | 85.4 | 81.2 | 12 | **77.0** | 100 % |
| `headroom` | Proxy | 1 | — | 68 | — | — | — | 76.2 | — | — | **76.2** | 65 % |
| `caveman` | Verhalten | 1 | — | 68 | — | — | — | 76.2 | — | — | **76.2** | 65 % |
| `snip` | BashOwner | 2 | — | 86 | 71 | 15 | — | 84.5 | 72.1 | 12 | **76.0** | 94 % |
| `serena` | Retrieval | 3 | 69 | 82 | 74 | 13 | 71.5 | 79.0 | 78.4 | 7 | **75.8** | 100 % |
| `sigmap` | Retrieval | 3 | 85 | 75 | 70 | 15 | 83.3 | 68.9 | 70.5 | 14 | **75.7** | 100 % |
| `cc-safe-setup` | Referenz | 1 | — | — | 68 | — | — | — | 75.7 | — | **75.7** | 94 % |
| `codebase-memory-mcp` | Retrieval | 3 | 76 | 79 | 74 | 5 | 77.4 | 72.6 | 76.8 | 5 | **75.7** | 100 % |
| `omni` | BashOwner | 3 | 57 | 83 | 77 | 26 | 69.1 | 81.7 | 82.7 | 14 | **74.8** | 100 % |
| `mcp-compressor` | MCP | 2 | — | 71 | 67 | 4 | — | 74.4 | 69.7 | 5 | **71.8** | 94 % |
| `tokdiet` | Proxy | 2 | — | 78 | 72 | 6 | — | 77.1 | 68.9 | 8 | **71.1** | 94 % |
| `token-saver` | Bash-Owner | 1 | 61 | — | — | — | 70.7 | — | — | — | **70.7** | 100 % |
| `lowfat` | BashOwner | 2 | — | 78 | 64 | 14 | — | 77.1 | 65.2 | 12 | **70.0** | 94 % |
| `context-mode` | ExternDaten | 3 | 66 | 75 | 77 | 11 | 60.1 | 65.4 | 79.1 | 19 | **69.9** | 100 % |
| `tokf` | BashOwner | 3 | 58 | 71 | 72 | 14 | 66.0 | 68.9 | 76.0 | 10 | **69.7** | 100 % |
| `claude-code-router` | Routing | 1 | — | 71 | — | — | — | 68.9 | — | — | **68.9** | 65 % |
| `quiet-bash` | BashOwner | 2 | — | 69 | 65 | 4 | — | 77.1 | 64.1 | 13 | **68.3** | 94 % |
| `magic-compact` | Session | 3 | 34 | 83 | 82 | 49 | 49.8 | 81.7 | 84.3 | 35 | **67.5** | 100 % |
| `rtk` | BashOwner | 1 | — | 57 | — | — | — | 66.2 | — | — | **66.2** | 65 % |
| `claude-code-cache-fix` | Proxy | 3 | 39 | 75 | 82 | 43 | 52.7 | 74.4 | 80.9 | 28 | **65.9** | 100 % |
| `token-optimizer` | Prefix | 1 | — | 65 | — | — | — | 61.7 | — | — | **61.7** | 65 % |
| `compact-plus` | Session | 3 | 50 | 54 | 68 | 18 | 56.8 | 52.9 | 71.5 | 19 | **61.6** | 100 % |
| `claude-lean-context` | Prefix | 1 | — | — | 56 | — | — | — | 57.3 | — | **57.3** | 94 % |
| `tokscale` | Messung | 1 | — | 54 | — | — | — | 52.9 | — | — | **52.9** | 65 % |
| `tokensave` | Retrieval | 1 | — | 54 | — | — | — | 52.9 | — | — | **52.9** | 65 % |
| `agentsview` | Messung | 1 | — | 54 | — | — | — | 52.9 | — | — | **52.9** | 65 % |

### Spannenreduktion auf der gemeinsam bewerteten Menge

| Repo | Δ roh | Δ angeglichen | Reduktion |
|---|---:|---:|---:|
| `ccusage` | 14 | 12.7 | +1.3 |
| `ponytail` | 23 | 17.0 | +6.0 |
| `planning-with-files` | 18 | 13.2 | +4.8 |
| `codegraph` | 10 | 4.0 | +6.0 |
| `codeburn` | 16 | 13.2 | +2.8 |
| `toonify-mcp` | 7 | 1.3 | +5.7 |
| `llmtrim` | 8 | 4.7 | +3.3 |
| `squeez` | 28 | 11.5 | +16.5 |
| `snip` | 15 | 12.4 | +2.6 |
| `serena` | 13 | 7.5 | +5.5 |
| `sigmap` | 15 | 14.4 | +0.6 |
| `codebase-memory-mcp` | 5 | 4.8 | +0.2 |
| `omni` | 26 | 13.6 | +12.4 |
| `mcp-compressor` | 4 | 4.7 | -0.7 |
| `tokdiet` | 6 | 8.2 | -2.2 |
| `lowfat` | 14 | 12.0 | +2.0 |
| `context-mode` | 11 | 19.0 | -8.0 |
| `tokf` | 14 | 10.0 | +4.0 |
| `quiet-bash` | 4 | 13.1 | -9.1 |
| `magic-compact` | 49 | 34.6 | +14.4 |
| `claude-code-cache-fix` | 43 | 28.1 | +14.9 |
| `compact-plus` | 18 | 18.5 | -0.5 |
| **Mittel** | **16.4** | **12.7** | **+3.8** |

---

## 18. Verfälschungsmessung

Wie stark bewegt jede Stufe die Werte, und bleibt die interne Ordnung jedes Modells erhalten?

### 18.1 Verschiebung gegenüber dem Rohwert

| Modell | Stufe | mittlere Verschiebung | mittlerer Betrag (MAE) | größte Einzelverschiebung |
|---|---|---:|---:|---:|
| GPT56 | A1 | ±0,0 | 0,0 | 0,0 |
| GPT56 | A2 | −0,6 | 6,7 | 17,4 |
| GPT56 | A3 | +4,9 | 6,3 | 15,8 |
| OPUS5 | A1 | +2,5 | 3,8 | 14,5 |
| OPUS5 | A2 | +2,5 | 3,8 | 14,5 |
| OPUS5 | A3 | −0,4 | 3,4 | 9,6 |
| K3SWARM | A1 | +0,6 | 1,4 | 4,2 |
| K3SWARM | A2 | +1,6 | 2,8 | 7,0 |
| K3SWARM | A3 | +1,8 | 2,4 | 7,7 |

Die Angleichung bewegt GPT56 am stärksten (MAE 6,3), K3SWARM am wenigsten (2,4). Das ist erwartbar: GPT56s Rubrik weicht am weitesten von der Konsensgewichtung ab.

### 18.2 Rangtreue innerhalb jedes Modells

Wenn die Angleichung die Reihenfolge eines Modells durcheinanderwirft, hat sie das Urteil ersetzt statt es übersetzt.

| Modell | A1 | A2 | A3 |
|---|---:|---:|---:|
| GPT56 | +1,000 | +0,841 | **+0,961** |
| OPUS5 | +0,881 | +0,881 | **+0,914** |
| K3SWARM | +0,975 | +0,918 | **+0,958** |

Bei A3 bleibt die interne Rangfolge jedes Modells mit ρ ≈ 0,91 bis 0,96 erhalten. **Der Abstand zwischen den Modellen sinkt um 48 %, während jedes Modell seine eigene Reihenfolge zu über neun Zehnteln behält.** Das ist das beste Verhältnis von Angleichung zu Eingriff, das sich aus diesen Daten erreichen lässt.

Stufe A2 ist deutlich schlechter: sie verwirft bei GPT56 65 % des Scores und bringt die Reihenfolge auf ρ = 0,84 — viel Verlust bei null Gewinn beim Abstand. **A2 ist als Ergebnis nicht zu empfehlen und nur als Beleg dafür geführt, dass der Abstand kein Skalenproblem ist.**

### 18.3 Rangkorrelation zwischen den Modellen

| Stufe | GPT56 ↔ OPUS5 | GPT56 ↔ K3SWARM | OPUS5 ↔ K3SWARM |
|---|---:|---:|---:|
| A0 roh | +0,486 | +0,258 | **+0,770** |
| A1 | +0,496 | +0,157 | +0,672 |
| A2 | +0,509 | +0,284 | +0,695 |
| A3 | **+0,546** | +0,266 | **+0,702** |

Zwei Beobachtungen, beide unbequem:

1. **Die Angleichung erzeugt keine Einigkeit.** GPT56 und K3SWARM bleiben bei ρ ≈ 0,27 — praktisch unabhängige Rangfolgen, egal auf welcher Stufe. Was aussieht wie ein Skalenproblem, ist keines.
2. **Die Übereinstimmung von OPUS5 und K3SWARM sinkt durch die Angleichung von 0,770 auf 0,702.** Ein Teil ihrer hohen Rohkorrelation ging auf den gemeinsamen Zirkelterm und die gemeinsam hohe Gewichtung der Lieferfähigkeit zurück. Nimmt man beides heraus, bleibt weniger Übereinstimmung übrig. Das stützt den Befund aus §4.2: die 0,77 waren teilweise gemeinsame Datenbasis, nicht gemeinsames Urteil.

### 18.4 Sensitivität der einen Auslegungsentscheidung

OPUS5s Achse `E` nach Label (GA1 Fit) statt nach Regel (GA2 Evidenz) gelesen:

| | Wert |
|---|---:|
| mittlere absolute Abweichung im Konsensscore | 1,28 |
| größte Abweichung | 4,17 |
| Rangkorrelation beider Lesarten | **+0,971** |

Die Entscheidung verändert das Ergebnis nicht nennenswert.

---

## 19. Was bewusst nicht angeglichen wurde

| Nicht angeglichen | Warum |
|---|---|
| **Der Evidenz-Niveauunterschied (GA2, 18,3 pp)** | Echter Dissens über denselben Maßstab an denselben Repos. Eine Angleichung hier würde die Aussage löschen, nicht übersetzen. GPT56 verlangt archivierte Rohläufe und Kontrollarme; OPUS5 kodiert nach Evidenztier. Beides ist vertretbar, aber es ist nicht dasselbe. |
| **Die fehlende Korrektheitsachse bei OPUS5** | Kein Wert lässt sich rekonstruieren, den ein Modell nie erhoben hat. In A4 wird die Achse aus GPT56 und K3SWARM ergänzt und in der Abdeckungsspalte ausgewiesen — sie bleibt sichtbar imputiert. |
| **Unterschiedliche Repo-Abdeckung** | 15 von 39 Einheiten sind von allen dreien bewertet. Nichtaufnahme ist keine Note. |
| **Die sieben nur genannten, nie bewerteten Absagekandidaten** | Kein Zahlenwert in irgendeinem Datensatz. |
| **GPT56s Entscheidungslabels** | `use`/`conditional`/`replace`/`reject` sind Urteile mit Schwellen, keine Punkte. Sie stehen unverändert daneben. |
| **K3SWARMs CVE-Fehlzuordnung** | Betrifft `rtk`, das K3SWARM nicht mit einem Score führt. Kein numerischer Effekt — aber der Befund gilt weiter (§7.3). |
| **K3SWARMs Erstrundensummen** | Gehören zu Runde 1, nicht zur 1-bis-100-Ebene. Korrektur steht in `META-VALIDIERUNG-3WEGE` §1.2. |
| **Alles Inhaltliche** | Kein Repo wurde wegen eines Sachbefunds hoch- oder heruntergesetzt. Die Angleichung rechnet ausschließlich mit den von den Modellen selbst vergebenen Achsenpunkten. |

### 19.1 Grenzen des Konsensscores

- Bei einem Repo mit `n = 1` ist der Konsensscore kein Konsens, sondern eine umgewichtete Einzelbewertung. Die Spalte `n` steht dafür in der Tabelle.
- Die Abdeckungsspalte fällt bei den nur von OPUS5 bewerteten Repos auf **65 %** — dort sind mehr als ein Drittel der Konsensgewichtung nicht belegt. `rtk` mit 66,2, `headroom` mit 76,2 und `caveman` mit 76,2 sind deshalb nicht mit `squeez` mit 77,0 bei 100 % Abdeckung vergleichbar.
- Die Konsensgewichtung erbt OPUS5s starke Gewichtung der Lieferfähigkeit (29,63 von 100). Ein aktiv gepflegtes Repo mit permissiver Lizenz startet damit auch im Konsensscore mit einem strukturellen Vorsprung.

---

## 20. Fazit zur Angleichung

Die Angleichung war möglich, weil alle drei Modelle ihre Achsenwerte offengelegt haben. Das ist nicht selbstverständlich und der eigentliche Grund, warum diese Runde auswertbar ist: ohne die Einzelachsen bliebe nur die Skalenverschiebung, und die hätte hier nichts gebracht.

Denn genau das ist das Ergebnis. Der Rohabstand zwischen GPT56 und OPUS5 beträgt 16,8 Punkte. Entzieht man beiden den Zirkelterm, bleibt er bei 16,8. Vergleicht man nur die drei Achsen, die alle drei Rubriken führen, bleibt er bei 16,7. Erst die Konsensgewichtung halbiert ihn auf 8,7 — und dort bleibt er stehen. **Etwa die Hälfte des Abstands war Gewichtung und ließ sich angleichen; die andere Hälfte ist Dissens und muss stehen bleiben.**

Der Dissens sitzt an zwei präzise benennbaren Stellen. Beim Evidenzmaßstab liegen GPT56 und OPUS5 18,3 Prozentpunkte auseinander — beide bewerten dieselbe Achse an denselben Werkzeugen und kommen zu verschiedenen Urteilen. Und bei Korrektheit und Sicherheit hat OPUS5 überhaupt keine Achse, während GPT56 dort 30 seiner 100 Punkte vergibt. Wo GPT56 einen Korrektheitsmangel findet, gibt es in OPUS5s Formel keinen Ort, an dem er ankommen könnte. Bei Fit, Lieferfähigkeit und Lizenz sind sich alle drei dagegen einig, mit Spannen von sechs bis acht Prozentpunkten.

Die Angleichung hat den Abstand halbiert und dabei jedem Modell seine eigene Reihenfolge zu über neun Zehnteln gelassen. Was sie nicht erzeugt hat, ist Einigkeit: GPT56 und K3SWARM bleiben auf allen Stufen bei einer Rangkorrelation um 0,27. Und die scheinbar hohe Übereinstimmung von OPUS5 und K3SWARM sinkt durch die Angleichung, statt zu steigen — ein Teil davon war der gemeinsame Zirkelterm und die gemeinsam hohe Gewichtung der Lieferfähigkeit, also gemeinsame Methode, nicht gemeinsames Urteil.

Am aufschlussreichsten sind die Repos, bei denen der Konsensscore weit von mindestens einem Ausgangswert abweicht. `magic-compact` steht roh bei 34, 83 und 82 und im Konsens bei 67,5 — GPT56s Korrektheitsbefund überlebt die Angleichung, aber nur mit dem Gewicht, das die drei Rubriken ihm im Mittel geben. `squeez` steht roh bei 59, 87 und 80 und im Konsens bei 77,0. Man kann das für zu hoch halten. Man sollte dann aber genau sagen, warum: nicht weil die Rechnung falsch ist, sondern weil zwei von drei Rubriken keine Achse dafür haben, dass ein Hook still `permissionDecision: allow` zurückgibt. Der Konsensscore bildet ab, was die drei Modelle zusammen messen — und er macht dadurch sichtbar, was sie zusammen nicht messen.

Deshalb bleibt die praktische Empfehlung dieselbe wie am Ende von §12, jetzt nur mit einer Zahl daran: eine gemeinsame Rubrik für den nächsten Schritt braucht eine eigene Achse für Korrektheit und Permission-Semantik, und sie muss mindestens das Gewicht tragen, das GPT56 ihr gibt. Andernfalls entscheidet auf der Bash-Fläche weiterhin die Aktivität des Repositories darüber, welches Werkzeug still Berechtigungen erteilen darf.

---

## 21. Maschinenlesbare Blöcke zur Angleichung

```tsv
ga	bedeutung	gewicht_konsens	max_GPT56	max_OPUS5	max_K3SWARM
GA1	Nutzen-Mechanismus-Fit	14.81	20	0	20
GA2	Evidenzqualitaet	22.22	20	15	25
GA3	Korrektheit-und-Sicherheit	14.81	30	0	10
GA4	Owner-Kompatibilitaet	3.70	10	0	0
GA5	Lieferfaehigkeit-Aktualitaet	29.63	10	50	20
GA6	Lizenz	12.96	5	15	15
GA7	Betrieb-Rueckbau	1.85	5	0	0
GA8	Korpus-Konvergenz-ZIRKEL	entfernt	0	20	10
```

```tsv
ga	erfuellung_GPT56	erfuellung_OPUS5	erfuellung_K3SWARM	spanne_pp	status
GA1	72.0	na	77.7	5.7	einig
GA2	49.7	68.0	63.2	18.3	DISSENS
GA3	59.8	keine_achse	82.7	22.9	DISSENS_UND_LUECKE
GA4	63.3	na	na	na	nur_GPT56
GA5	81.3	84.4	89.3	8.0	einig
GA6	96.0	88.0	95.6	8.0	einig
GA7	73.3	na	na	na	nur_GPT56
```

```tsv
stufe	regel	parameter	abstand_GPT_OPUS	MAE_GPT	MAE_OPUS	MAE_K3	rangtreue_GPT	rangtreue_OPUS	rangtreue_K3
A0	rohwert	0	-16.8	0.0	0.0	0.0	1.000	1.000	1.000
A1	entzirkelung_GA8	1_je_modell	-16.8	0.0	3.8	1.4	1.000	0.881	0.975
A2	gemeinsamer_achsenkern	1_je_modell	-16.7	6.7	3.8	2.8	0.841	0.881	0.918
A3	konsensgewichtung	7_mechanisch	-8.7	6.3	3.4	2.4	0.961	0.914	0.958
A4	konsensscore_kreuzimputiert	0_zusaetzlich	na	na	na	na	na	na	na
```

```tsv
stufe	rho_GPT_OPUS	rho_GPT_K3	rho_OPUS_K3
A0	+0.486	+0.258	+0.770
A1	+0.496	+0.157	+0.672
A2	+0.509	+0.284	+0.695
A3	+0.546	+0.266	+0.702
```

```tsv
nicht_angeglichen	grund
evidenz_niveau_GA2_18.3pp	echter dissens ueber denselben massstab
fehlende_korrektheitsachse_OPUS5	nicht rekonstruierbar - in A4 imputiert und ausgewiesen
repo_abdeckung_15_von_39	nichtaufnahme ist keine note
sieben_absagekandidaten_ohne_score	kein zahlenwert in irgendeinem datensatz
GPT56_entscheidungslabels	urteile mit schwellen keine punkte
K3SWARM_CVE_fehlzuordnung	betrifft rtk das K3SWARM nicht bewertet
K3SWARM_erstrundensummen	gehoert zu runde 1
inhaltliche_befunde	kein repo wegen sachbefund verschoben
```
