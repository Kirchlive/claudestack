---
doc_id: ZUSAMMENFUEHRUNG-CLAUDE-CODE-TOKEN-STACK
version: 1.0
generated: 2026-08-13
ersetzt: MERGE-PLAN.md v1.0, DREI-REPOS-UND-ZIELBILD.md v1.0
scope: Ansätze, Vor- und Nachteile, vollständige Werkzeugübersicht, Zielbild mit allen 113 Dateien, Anpassungen, Reihenfolge
grundlage: TREE.txt (31 Verzeichnisse, 113 Dateien) · REPO-MATRIX (GPT56) · scores100-v51.json (OPUS5) · zweitvalidierung-update.md (K3SWARM) · META-VALIDIERUNG-3WEGE / -2RUNDE / -3RUNDE
kernaussage: Kein Merge. Ein Träger, gezielte Pfropfungen, Messung vor Installation.
---

# Zusammenführung der drei Pakete zu einem Claude-Code-Setup

## 0. Die Entscheidung in fünf Sätzen

1. **Nicht mergen.** Die drei Pakete sind keine drei Implementierungen derselben Sache, sondern drei Schichten — Runtime, Werkzeugkiste, Steuerung.
2. **Träger ist GPT56SOL**, weil es als einziges Schema, Tests, Prüfsummen und eine Architektur mit genau einem Mutator mitbringt — und weil es im Auslieferungszustand nichts installiert.
3. **Aufgepfropft wird nach Schicht**: die Governance aus OPUS5, die fehlenden Flächenhooks und die ausgeführte Testevidenz aus K3SWARM.
4. **Der Agent bekommt eine Kollisionsinventur, keinen Merge** — 113 Dateien mechanisch auf Dubletten, Namenskollisionen und Mehrfach-Mutatoren prüfen.
5. **Phase 0 kommt zuerst und braucht keines der Pakete**: `/context`, Plugin-Diät, Root-`CLAUDE.md`, ein Bash-Hook. Sie liefert die Zahl, gegen die alles Weitere gemessen wird.

---

# TEIL A — Die drei Pakete

## A.1 In je einem Satz

| Paket | Was es ist | Dateien |
|---|---|---:|
| **GPT56SOL** | Ein installierbares Softwareprodukt mit einem einzigen Dispatcher, das im Auslieferungszustand nichts tut. | 33 |
| **K3SWARM** | Eine vollständige Hook-Werkstatt mit Installer, die im Auslieferungszustand sofort arbeitsfähig ist. | 54 |
| **OPUS5** | Ein Steuerungs- und Nachweisapparat: Konzept, Wellenplan, Defektregister, Messharness. | 26 |

## A.2 Die drei Ansätze

### GPT56SOL — „Ein Owner, alles andere ist Konfiguration"

Alles läuft durch `src/stack.mjs` (17K). Der Hook selbst ist ein 308-Byte-Shim, der nur dorthin zeigt. Config ist schemavalidiert (`token-stack.schema.json`), es gibt eine CLI (`bin/claudestack.mjs`), drei Testdateien und Prüfsummen. Es gibt **keinen Installer** — die CLI erzeugt ein Fragment, der Mensch übernimmt es.

Denkweise: Ein Token-Stack ist Software. Software hat ein Schema, Tests und eine Versionsnummer. Sie wird nicht installiert, bevor sie gemessen ist.

### K3SWARM — „Jede Fläche hat ihr Werkzeug"

15 einzelne Hooks, jeder für eine Fläche: Bash-Deny, Bash-Reduce, Read, Reread, Session, Prefix, Canary, Ladder. Dazu `install.sh`, der die `settings.json` merged, `verify-package.sh` und drei Testsuiten mit real ausgeführten Läufen. Das umfangreichste Regelwerk und der einzige Werkzeugkatalog.

Denkweise: Ein Token-Stack ist eine Werkzeugkiste. Man baut jedes Werkzeug einzeln, testet es einzeln und installiert die Kiste als Ganzes.

### OPUS5 — „Erst die Regeln, dann der Code"

`KONZEPT-v5.md` ist mit 43K das größte Einzeldokument des Korpus. Dazu `waves/` mit Index und Zustand, `DEFEKTE.md` mit sieben nachvollziehbaren Defekten, `judgments.json` und `scores100-v51.json` als Evidenzbuch, `ab-harness.sh` und `repo-audit.py` als Messwerkzeuge. Nur zwei eigene Hooks.

Denkweise: Ein Token-Stack ist ein Vorhaben mit Phasen, Gates und einem Nachweisbuch. Der Code ist der kleinste Teil davon.

## A.3 Vor- und Nachteile

### GPT56SOL

| Vorteile | Nachteile |
|---|---|
| Einziges Paket mit `package.json`, JSON-Schema, echtem `tests/`-Verzeichnis und Prüfsummen | Nur ein Hook — Read, Session und Prefix sind unbesetzt |
| Genau ein Mutator ist architektonisch erzwungen, nicht nur dokumentiert (ADR-002/004) | Keine Canary-Implementierung, obwohl ADR-005 eine verlangt |
| Installiert nichts; `shadow` ist Default | Kein Installer heißt: jeder Schritt ist Handarbeit |
| Einzige Bewertungsrubrik mit Korrektheits- und Sicherheitsachse, ohne Zirkelterm | Konservativste Werkzeugpolitik — kann als Blockade wirken |
| ADR-013/014 halten Dissens maschinenlesbar statt ihn zu mitteln | Kein Wellenplan, kein Defektregister |

### K3SWARM

| Vorteile | Nachteile |
|---|---|
| Vollständigste Flächenabdeckung: Read-, Reread-, Session-, Prefix-, Canary-Hooks | Zwei Bash-Mutatoren im selben Paket (`bash-dump-gate` + `bash-dump-guard`) — verletzt Gesetz I im Auslieferungszustand |
| Einzige real ausgeführte Paketprüfung: 73 PASS / 0 FAIL, 37/38, Exit-Codes dokumentiert | `install.sh` merged `settings.json` automatisch — riskant ohne Baseline |
| `install.sh` macht das Paket sofort benutzbar | Ladder-Rungs mitgeliefert, obwohl gemessen +9,6 % und −0,3 % |
| Umfangreichstes Regelwerk und einziger Werkzeugkatalog | `bash-dump-guard.mjs` mit 49K ist die größte und am wenigsten überschaubare Einzeldatei |
| Rohdaten der Issue-Recherche mitgeliefert (`issues_out*.txt`, `scrape_*.py`) | Keine Schemavalidierung der Config |

### OPUS5

| Vorteile | Nachteile |
|---|---|
| `DEFEKTE.md` — sieben Defekte mit Nachweis, Status und abgeleiteter Regel | Nur zwei eigene Hooks; als Runtime unvollständig |
| `waves/` mit Zustandsdatei — hält einen Rollout über Sitzungen zusammen | `bash-owner-dispatch.mjs` ist ein dritter Dispatcher auf derselben Fläche |
| `ab-harness.sh` und `repo-audit.py` — der einzige echte Messteil | Bewertungsachse D hängt seit v5.1 an GPT56s Urteilen (Abhängigkeit) |
| `judgments.json` mit Quellenangabe je Zeile | `D = 0` kostet ungeprüfte Werkzeuge im Mittel 17,6 Punkte |
| `plugin-diet.md` adressiert die 25 aktiven Plugins | Drei Dateien doppelt abgelegt; ein leeres Verzeichnis aus nicht expandierter Brace-Expansion |

## A.4 Warum ein Merge die falsche Operation wäre

Wo sich die Pakete nicht überschneiden, gibt es nichts zu mergen — nur zu übernehmen. Wo sie sich überschneiden, ist ein Merge verboten:

| Fläche | GPT56SOL | K3SWARM | OPUS5 | Merge möglich? |
|---|---|---|---|---|
| **Bash-Output-Owner** | `src/stack.mjs` 17K | `bash-dump-guard.mjs` 49K | `bash-owner-dispatch.mjs` 14K | **nein — Gesetz I** |
| Owner-Registry | `context-surface-owners.json` 2,2K | `.yaml` 4,8K | `.yaml` 5,4K | Daten, ja |
| Prefix-Wächter | — | `prefix-budget.mjs` 23K | `prefix-budget.mjs` 14K | **nein — auswählen** |
| Verifier | `verify-package.mjs` 8,1K | `verify-package.sh` 8,4K | `verify-stack.mjs` 7,1K | **nein — auswählen** |
| CLAUDE.md-Template | 846 B | 5,5K | — | auswählen nach Byte-Budget |
| Regelwerk | `rules/token-stack.md` 1,4K | 7,6K | 5,4K | Text, ja |

**Drei Owner auf einer Fläche zu vereinigen erzeugt drei Owner auf einer Fläche.** Das ist kein Randfall des Merges, das ist sein Ergebnis.

---

# TEIL B — Alle Werkzeuge

## B.1 Gesamtübersicht — 40 bewertete Werkzeuge

`n` = Anzahl der Pakete mit eigener Punktzahl. GPT56 führt zusätzlich ein Entscheidungslabel. OPUS v4 und v5.1 sind beide angegeben, weil in den Endartefakten teilweise noch v4-Werte zitiert werden.

| Werkzeug | Fläche | GPT56 | OPUS v4 | OPUS v5.1 | K3SWARM | Konsens A4 | n |
|---|---|---:|---:|---:|---:|---:|---:|
| `Claude Code nativ` | Basis | 96 `use` | — | — | — | 93,3 | 1 |
| `ccusage/ccusage` | Messung | 86 `use` | 100 | 96 | 93 | 92,5 | 3 |
| `DietrichGebert/ponytail` | Verhalten | 74 `conditional` | 97 | 90 | 92 | 87,1 | 3 |
| `OthmanAdi/planning-with-files` | Persistenz | 75 `conditional` | 93 | 93 | 87 | 84,7 | 3 |
| `K3 Eigenbau v3.1` | Bash-Owner | — | — | — | 83 | 84,1 | 1 |
| `GPT56 src/stack.mjs` | Bash-Owner | 84 `conditional` | — | — | — | 81,9 | 1 |
| `colbymchenry/codegraph` | Retrieval | 80 `conditional` | 90 | 83 | 83 | 81,9 | 3 |
| `getagentseal/codeburn` | Messung | 70 `conditional` | 86 | 85 | 81 | 80,5 | 3 |
| `thedotmack/claude-mem` | Memory | — `conditional` | 82 | 69 | — | 79,0 | 1 |
| `PCIRCLE-AI/toonify-mcp` | Format | — `reject` | 85 | 72 | 78 | 78,8 | 2 |
| `NodeNestor/claude-rolling-context` | Proxy | — | — | — | 73 | 78,7 | 1 |
| `jfrog/boost` | Bash-Owner | — `conditional` | 70 | 67 | — | 78,5 | 1 |
| `fkiene/llmtrim` | Proxy | — `reject` | 83 | 66 | 75 | 77,1 | 2 |
| `claudioemmanuel/squeez` | Bash-Owner | 59 `replace` | 87 | 79 | 80 | 77,0 | 3 |
| `headroomlabs-ai/headroom` | Proxy | — `reject` | 68 | 66 | — | 76,2 | 1 |
| `JuliusBrussee/caveman` | Verhalten | — | 68 | 66 | — | 76,2 | 1 |
| `edouard-claude/snip` | Bash-Owner | — | 86 | 69 | 71 | 76,0 | 2 |
| `oraios/serena` | Retrieval | 69 `conditional` | 82 | 81 | 74 | 75,8 | 3 |
| `manojmallick/sigmap` | Retrieval | 85 `conditional` | 75 | 75 | 70 | 75,7 | 3 |
| `deusdata/codebase-memory-mcp` | Retrieval | 76 `conditional` | 79 | 74 | 74 | 75,7 | 3 |
| `yurukusa/cc-safe-setup` | Referenz | — | — | — | 68 | 75,7 | 1 |
| `fajarhide/omni` | Bash-Owner | 57 `replace` | 83 | 79 | 77 | 74,8 | 3 |
| `atlassian-labs/mcp-compressor` | MCP-Schema | — | 71 | 58 | 67 | 71,8 | 2 |
| `agiwhitelist/tokdiet` | Proxy | — `reject` | 78 | 61 | 72 | 71,1 | 2 |
| `ppgranger/token-saver` | Bash-Owner | 61 `replace` | — | — | — | 70,7 | 1 |
| `zdk/lowfat` | Bash-Owner | — | 78 | 61 | 64 | 70,0 | 2 |
| `mksglu/context-mode` | Externe Daten | 66 `conditional` | 75 | 68 | 77 | 69,9 | 3 |
| `mpecan/tokf` | Bash-Owner | 58 `replace` | 71 | 67 | 72 | 69,7 | 3 |
| `musistudio/claude-code-router` | Routing | — | 71 | 58 | — | 68,9 | 1 |
| `yoeld-wix/quiet-bash` | Bash-Owner | — | 69 | 61 | 65 | 68,3 | 2 |
| `aerovato/magic-compact` | Session | 34 `reject` | 83 | 73 | 82 | 67,5 | 3 |
| `rtk-ai/rtk` | Bash-Input | — `conditional` | 57 | 55 | — | 66,2 | 1 |
| `cnighswonger/claude-code-cache-fix` | Proxy | 39 `reject` | 75 | 67 | 82 | 65,9 | 3 |
| `alexgreensh/token-optimizer` | Prefix | — | 65 | 57 | — | 61,7 | 1 |
| `u-ichi/compact-plus` | Session | 50 `replace` | 54 | 69 | 68 | 61,6 | 3 |
| `NodeNestor/claude-lean-context` | Prefix | — | — | — | 56 | 57,3 | 1 |
| `junhoyeo/tokscale` | Messung | — | 54 | 58 | — | 52,9 | 1 |
| `aovestdipaperino/tokensave` | Retrieval | — | 54 | 54 | — | 52,9 | 1 |
| `kenn-io/agentsview` | Messung | — | 54 | 58 | — | 52,9 | 1 |
| `open-compress/claw-compactor` | Session | — | — | 42 | — | — | 0 |

### B.1.1 Lesehilfe zur Tabelle

- **`Claude Code nativ`**, **`GPT56 src/stack.mjs`** und **`K3 Eigenbau v3.1`** sind keine Fremdrepos, sondern Eigenbauten bzw. die Basisfunktionen. Sie stehen mit in der Liste, weil sie dieselben Flächen besetzen.
- **`open-compress/claw-compactor`** erscheint nur in OPUS v5.1 (42, `STALE>60d`) und war in v4 nicht enthalten.
- **Lizenz-Fences** aus v5.1: `mksglu/context-mode` (Elastic 2.0) und `alexgreensh/token-optimizer` (PolyForm Noncommercial). Beide sind für dienstliche Nutzung gesperrt — die zwei Flächen „externe Massendaten" und „Prefix" bleiben deshalb bewusst unbesetzt.
- **`rtk-ai/rtk`**: K3SWARM begründet die Absage unter anderem mit `Lizenz: null` aus `issues2.json`. OPUS v5.1 weist Apache-2.0 aus. Die Absage trägt weiterhin über die offenen Permission-Issues #1155/#3152 und das Kostenissue #3175, aber das Lizenzargument ist überholt.

## B.2 Wo sich die Pakete widersprechen — elf Fälle

| Werkzeug | GPT56SOL | OPUS5 (v5.1) | K3SWARM | Kern des Streits |
|---|---|---|---|---|
| `squeez` | **replace**, 59 | 79 | 80, A/B-Gegenpart | Gibt bei Rewrites `permissionDecision: allow` zurück |
| `magic-compact` | **reject**, 34 | 73 | 82, Kern bedingt | „lossless" widerspricht Pruning; kein Claude-Benchmark |
| `claude-code-cache-fix` | **reject**, 39 | 67 | 82, konditional | 87 offene Issues je 1.000 Sterne — schlechteste Bilanz des Feldes |
| `omni` | **replace**, 57 | 79 | 77, Dedup-Pilot | Prehook auto-allowed Rewrites; 97,3 % der Calls sparen nichts |
| `toonify-mcp` | **reject** | 72, D ungeprüft | Pilot, Pin ≥ 0.8.2 | Fix bestätigt, Funktion nicht geprüft |
| `llmtrim` | **reject** | 66 | 75, Hauptoption | Proxy-Fläche generell: CA-/Cache-Risiko |
| `tokdiet` | **reject** | 61 | 72, Fallback mit Audit | Release auf zwei Monate altem Stand |
| `sigmap` | **85, Rang 3** | 75 | 70 | Einzige archivierte Rohdaten (Zenodo) |
| `planning-with-files` | 75, „Template genügt meist" | **93, Rang 2** | 87, Kern | Referenzmuster oder Pflichtinstallation |
| `compact-plus` | **replace**, 50 | 69 | 68, Pilot | Erster Compact kann Manual-State verlieren |
| Bash-Owner | eigener Dispatcher | eigener Dispatch | eigener Guard v3.1 | Drei Eigenbauten für dieselbe Fläche |

**Das Muster dahinter:** GPT56SOL bewertet Korrektheit und Sicherheit mit 30 von 100 Punkten, OPUS5 (bis v5.0) mit null, K3SWARM mit zehn. Alle Divergenzen in der oberen Tabellenhälfte gehen auf diesen einen Unterschied zurück. Wo GPT56SOL niedriger liegt, hat es einen Permission- oder Korrektheitsbefund; wo es höher liegt (`sigmap`), hat es archivierte Rohdaten honoriert. Seit OPUS v5.1 die D-Achse auf geprüfte Korrektheit umgestellt hat, sind die Abstände kleiner geworden — `magic-compact` 83→73, `cache-fix` 75→67.

## B.3 Unstrittig in allen drei

`ccusage/ccusage` als reiner Observer ohne Hook-Mutationsrecht · `DietrichGebert/ponytail` als Verhaltensregel, on demand statt always-on · `colbymchenry/codegraph` konditional mit Versionspin · `deusdata/codebase-memory-mcp` und `oraios/serena` als Spezialfälle, nie parallel zu einem anderen Index · `getagentseal/codeburn` als read-only Waste-Diagnose.

Ebenfalls einig sind sich alle drei bei sämtlichen Absagen (siehe B.5) und beim Grundsatz, dass keine Fläche mehr als einen Mutator trägt.

## B.4 Nur von einem Paket bewertet

| Nur GPT56SOL | Nur OPUS5 | Nur K3SWARM |
|---|---|---|
| `Claude Code nativ` (96) | `rtk-ai/rtk` (55) | `K3 bash-dump-guard v3.1` (83) |
| `GPT56 src/stack.mjs` (84) | `headroomlabs-ai/headroom` (66) | `yurukusa/cc-safe-setup` (68) |
| `ppgranger/token-saver` (61) | `JuliusBrussee/caveman` (66) | `NodeNestor/claude-rolling-context` (73) |
| `zilliztech/memsearch` (ohne Punktzahl, `conditional`) | `thedotmack/claude-mem` (69) | `NodeNestor/claude-lean-context` (56) |
| | `jfrog/boost` (67) | |
| | `musistudio/claude-code-router` (58) | |
| | `alexgreensh/token-optimizer` (57) | |
| | `junhoyeo/tokscale` (58) | |
| | `kenn-io/agentsview` (58) | |
| | `aovestdipaperino/tokensave` (54) | |
| | `open-compress/claw-compactor` (42) | |

Von 40 bewerteten Werkzeugen sehen alle drei Pakete nur **15**. Sieben werden von genau zwei bewertet — und zwar ausnahmslos von OPUS5 und K3SWARM gemeinsam. **GPT56SOL teilt mit keinem der beiden ein exklusives Paar**: seine Auswahl ist entweder dreifach abgedeckt oder allein.

## B.5 Genannt, aber nie mit einer Punktzahl bewertet

Alle aus K3SWARMs Absageliste, alle mit Begründung, keine mit Score:

| Werkzeug | Begründung |
|---|---|
| `teamchong/pxpipe` | Hex-Recall 0–2/15, stille Konfabulationen |
| `diegosouzapw/OmniGlyph` | dito |
| `ZongqianLi/500xCompressor` | 27–38 % Fähigkeitsverlust |
| `LLMLingua-2-Hooks` | Retrieval unter 50 % auf Code, Cache-Bruch |
| globale Memory-MCPs als Default | 44–54 Tool-Defs ≈ 4,4–8,6k Token je Session |
| `jaredboynton/semtrim` | 0 Sterne, substanzlos |
| `ojuschugh1/sqz` | Elastic 2.0 plus 53 Tage still |

## B.6 Musterabsagen — keine Repos, sondern Konstruktionen

Aus GPT56SOLs Repo-Matrix. Sie gelten unabhängig vom Werkzeug:

| Muster | Warum abgelehnt |
|---|---|
| Mehrere Retrieval-Indizes parallel | doppelte Discovery, Toolschemas, residenter Kontext |
| Mehrere Bash-Mutatoren | keine deterministische Reducer-Pipeline |
| Proxy-Chain | Cache-, Security- und Fehlerattribution kumulieren |
| TOON-/Formatkonverter allgemein | lokale Zeichenquote belegt keine semantische Gleichheit |
| `context-mode` als vollständige Hook-Installation | kollidiert mit dem lokalen Owner; nur die MCP-Werkzeuge sind zulässig |
| `Squeez-RTK-Ladder` als Runtime | Referenzrolle; Binaries, Pfade, Hooks und Schwellen nicht kopieren |

## B.7 Was am Ende installiert wird

Aus 40 bewerteten Werkzeugen und sechs Musterabsagen bleibt für den ersten produktiven Stand:

| Fläche | Besetzung | Modus |
|---|---|---|
| Basis | Claude Code nativ | immer |
| Messung | `ccusage` (Observer) + `03-measure-token-surfaces.py` | sofort |
| Prefix | — *(Lizenz-Fence)* | Handarbeit, Phase 0 |
| Externe Massendaten | — *(Elastic 2.0)* | native Mittel |
| Bash-Output | `src/stack.mjs` | `off` → `shadow` → Canary → `enforce` |
| Read | optionaler Guard aus K3 | nicht registriert |
| Retrieval | `codegraph` **oder** `sigmap` **oder** `codebase-memory-mcp` | genau einer, aufgabenabhängig |
| Verhalten | `ponytail` als kurze Regel | on demand |
| Session | native Grenze + TASK-STATE | sofort |
| Proxy | — | erst nach gemessenem Cachedefekt |
| Format | — | `toonify` erst nach Audit |

**Zwei Flächen bleiben bewusst leer**, weil beide freigabefähigen Kandidaten Lizenz-Fences tragen. Das ist eine Entscheidung, kein Versäumnis.

# TEIL C — Zielbild

## C.1 Zielbaum

```
claude-code-token-stack/
├── package.json · README.md · SHA256SUMS.txt · MERGE-MANIFEST.tsv
├── bin/claudestack.mjs
├── src/stack.mjs
├── hooks/
│   ├── claudestack.mjs
│   └── optional/          8 Hooks aus K3, nicht registriert
├── config/                6 Dateien
├── rules/token-stack.md
├── templates/             2 Dateien
├── tests/                 3 aus GPT + 2 aus K3 unter contract/
├── scripts/               6 Dateien
├── waves/                 2 Dateien
├── docs/                  12 Dateien
├── examples/              1 Datei
└── evidence/              Archiv, kein Betrieb
    ├── gpt56/  k3/  opus5/
```

## C.2 One-Liner-Übersicht — alle 113 Dateien

Legende: **✅** übernehmen · **✏️** übernehmen mit Anpassung · **📦** ins Archiv `evidence/` · **❌** nicht übernehmen · **🆕** neu erzeugen

### C.2.1 GPT56SOL — 33 Dateien

| Datei | Größe | Ziel | | Anpassung |
|---|---:|---|---|---|
| `package.json` | 623 | `package.json` | ✏️ | Version auf `2.0.0`, `files`-Feld um `waves/` und `hooks/optional/` erweitern |
| `README.md` | 6,6K | `README.md` | ✏️ | Herkunftsabschnitt, Verweis auf `MERGE-MANIFEST.tsv`, Phase-0-Hinweis vor dem Schnellstart |
| `SHA256SUMS.txt` | 2,9K | `SHA256SUMS.txt` | 🆕 | nach dem Merge neu erzeugen — alte Summen sind ungültig |
| `bin/claudestack.mjs` | 2,8K | `bin/claudestack.mjs` | ✏️ | Unterbefehl `evidence` ergänzt, der `judgments.json` und `scores100` liest |
| `src/stack.mjs` | 17K | `src/stack.mjs` | ✏️ | **siehe C.3.1** — Canary-Anbindung, Deny-Gate-Grenze, String-Normalisierung |
| `hooks/claudestack.mjs` | 308 | `hooks/claudestack.mjs` | ✅ | unverändert |
| `config/token-stack.schema.json` | 1,7K | ebenda | ✏️ | Felder für Canary-Pfad und optionale Hooks ergänzen |
| `config/token-stack.default.json` | 435 | ebenda | ✏️ | `mode: "off"` statt `shadow` bis Phase 3 |
| `config/context-surface-owners.json` | 2,2K | ebenda | ✏️ | **siehe C.3.2** — Zusammenführung dreier Registries |
| `rules/token-stack.md` | 1,4K | ebenda | ✏️ | **siehe C.3.3** — Zusammenführung dreier Regelwerke |
| `templates/CLAUDE.md` | 846 | ebenda | ✏️ | **siehe C.3.4** — Byte-Deckel, Inhalte aus K3 |
| `templates/TASK-STATE.md` | 1,0K | ebenda | ✅ | unverändert; K3- und OPUS-Varianten entfallen |
| `tests/stack.test.mjs` | 12K | ebenda | ✏️ | Fälle für die neuen `src/stack.mjs`-Zweige ergänzen |
| `tests/cli.test.mjs` | 8,6K | ebenda | ✏️ | Fall für `evidence`-Unterbefehl |
| `tests/benchmark.test.mjs` | 2,2K | ebenda | ✅ | unverändert |
| `scripts/verify-package.mjs` | 8,1K | ebenda | ✏️ | **siehe C.3.5** — Prüfungen aus zwei fremden Verifiern übernehmen |
| `scripts/evaluate-benchmark.mjs` | 7,5K | ebenda | ✅ | unverändert |
| `examples/benchmark-runs.example.jsonl` | 582 | ebenda | ✅ | unverändert |
| `docs/ARCHITECTURE.md` | 5,9K | ebenda | ✏️ | Absatz zu den optionalen Hooks und ihrer Nichtregistrierung |
| `docs/DECISIONS.md` | 8,1K | ebenda | ✏️ | ADR-015 bis ADR-017 ergänzen (**C.3.9**) |
| `docs/SECURITY.md` | 5,6K | ebenda | ✏️ | Abschnitt zur Guard-Namenskollision und zum Deny-Gate im Quellrepo |
| `docs/MIGRATION.md` | 5,1K | ebenda | ✏️ | Phase 0 als Vorbedingung voranstellen |
| `docs/WAVES.md` | 3,5K | ebenda | ✏️ | auf `waves/WAVE-INDEX.md` verweisen statt zu duplizieren |
| `docs/BENCHMARK.md` | 6,0K | ebenda | ✏️ | gepaarter Aufbau und Endpunktdefinition aus der Ladder-Serie ergänzen |
| `docs/REPO-MATRIX.md` | 8,2K | ebenda | ✏️ | **siehe C.3.6** — Divergenzspalten für OPUS und K3 |
| `validate/01-validation-crosswalk-5point.md` | 29K | `evidence/gpt56/` | 📦 | Archiv |
| `validate/02-squeez-rtk-ladder-reference-audit.md` | 13K | `evidence/gpt56/` | 📦 | Archiv |
| `validate/03-file-token-metrics.csv` | 11K | `evidence/gpt56/` | 📦 | Archiv |
| `validate/03-file-token-metrics.json` | 31K | `evidence/gpt56/` | 📦 | Archiv |
| `validate/03-measure-token-surfaces.py` | 5,2K | `scripts/` | ✅ | **lauffähig, kein Archiv** — erzeugt die Prefix-Messung neu |
| `validate/04-second-validation-100point.md` | 25K | `evidence/gpt56/` | 📦 | Archiv; Quelle für `judgments.json` |
| `validate/05-final-consolidated-token-stack.md` | 23K | `evidence/gpt56/` | 📦 | Archiv |
| `validate/06-incoming-reconciliation.md` | 41K | `evidence/gpt56/` | 📦 | Archiv |

### C.2.2 K3SWARM — 54 Dateien

| Datei | Größe | Ziel | | Anpassung |
|---|---:|---|---|---|
| `hooks/claude-hook-capability-canary.mjs` | 13K | `hooks/optional/` | ✏️ | **siehe C.3.7** — an den Dispatcher-Pfad angebunden |
| `hooks/read-context-guard.mjs` | 8,5K | `hooks/optional/` | ✏️ | Pfade relativ machen; nicht registrieren |
| `hooks/read-slice-guard.mjs` | 4,1K | `hooks/optional/` | ✅ | Regelmodul, wird von read-context-guard geladen |
| `hooks/reread-guard.mjs` | 4,5K | `hooks/optional/` | ✅ | Regelmodul |
| `hooks/session-economy.mjs` | 20K | `hooks/optional/` | ✏️ | reiner Observer; Nudge-Ausgabe an ein gemeinsames Budget binden |
| `hooks/bash-size-feedback.mjs` | 3,3K | `hooks/optional/` | ✏️ | dito — zählt in dasselbe Nudge-Budget |
| `hooks/ctx-used-marker.mjs` | 1,0K | `hooks/optional/` | ✅ | Observer, unverändert |
| `hooks/lib/token-stack-shared.mjs` | 7,7K | `hooks/optional/lib/` | ✅ | gemeinsame Bibliothek der optionalen Hooks |
| `hooks/prefix-budget.mjs` | 23K | `hooks/optional/` | ✏️ | **siehe C.3.8** — gegen die OPUS-Variante diffen, eine gewinnt |
| `hooks/tests/hook-contract-smoke.mjs` | 6,5K | `tests/contract/` | ✏️ | Pfade auf das Zielpaket umstellen |
| `hooks/tests/test-guard-all.mjs` | 11K | `tests/contract/` | ✏️ | hartkodierte `/Users/rob/`-Pfade entfernen (Defekt D2), Fail-loud statt Fail-silent |
| `hooks/tests/test-ladder.mjs` | 14K | — | ❌ | prüft die nicht übernommenen Ladder-Rungs |
| `hooks/bash-dump-guard.mjs` | 49K | — | ❌ | zweiter Bash-Output-Owner; Gesetz I |
| `hooks/bash-dump-gate.mjs` | 11K | — | ❌ | PreToolUse-Deny-Gate; getrennte Policy-Frage im Quellrepo |
| `hooks/ladder-ledger.mjs` | 10K | `evidence/k3/` | 📦 | Referenz |
| `hooks/ladder-retrieve-gate.mjs` | 10K | `evidence/k3/` | 📦 | gemessen +9,6 % |
| `hooks/ladder-retrieve-filter.mjs` | 7,6K | `evidence/k3/` | 📦 | gemessen −0,3 % |
| `config/native-token-limits.example.jsonc` | 1,7K | `config/` | ✏️ | Caveats zu `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` und `ENABLE_TOOL_SEARCH` prüfen |
| `config/bash-dump-guard.config.json` | 2,0K | `config/` | ✏️ | Pilotwerte 4096 B / 512 B / 15 % in die Dispatcher-Config übertragen |
| `config/ladder-config.json` | 7,5K | `evidence/k3/` | 📦 | Referenz |
| `config/settings.json` | 3,2K | — | ❌ | Volltemplate; widerspricht dem Fragment-Ansatz |
| `regelwerk/token-efficiency.rules.md` | 7,6K | in `rules/token-stack.md` | ✏️ | **C.3.3** |
| `regelwerk/context-surface-owners.yaml` | 4,8K | in `config/…json` | ✏️ | **C.3.2** |
| `regelwerk/CLAUDE.md.template` | 5,5K | in `templates/CLAUDE.md` | ✏️ | **C.3.4** |
| `regelwerk/LADDER.md` | 3,4K | `docs/LADDER.md` | ✏️ | Geltungsbereich auf Quelltext < 32 KB einengen |
| `regelwerk/TASK-STATE.template.md` | 1,4K | — | ❌ | GPT-Variante gewinnt |
| `planung/MESSPLAN.md` | 5,0K | `docs/MESSPLAN.md` | ✏️ | Endpunktdefinition „fresh input" übernehmen, Schwellen als provisorisch kennzeichnen |
| `planung/ROLLOUT.md` | 4,0K | `docs/ROLLOUT.md` | ✏️ | mit `waves/WAVE-INDEX.md` abgleichen, keine zwei Fahrpläne |
| `scripts/benchmark-harness.md` | 3,7K | in `docs/BENCHMARK.md` | ✏️ | einarbeiten, nicht doppeln |
| `scripts/install.sh` | 6,3K | — | ❌ | merged `settings.json`; widerspricht ADR-012 |
| `scripts/verify-package.sh` | 8,4K | in `scripts/verify-package.mjs` | ✏️ | **C.3.5** — Prüfungen übernehmen, Skript nicht |
| `katalog/kern-katalog.md` | 3,9K | in `docs/REPO-MATRIX.md` | ✏️ | **C.3.6** |
| `katalog/HINWEIS.md` | 2,2K | in `docs/REPO-MATRIX.md` | ✏️ | Konsolidierungsregeln als Fußnote |
| `VALIDIERUNG.md` | 11K | `evidence/k3/` | 📦 | §5 Messreihen und §6 Eigenprüfung sind der wertvollste Teil |
| `KONZEPT.md` | 19K | `evidence/k3/` | 📦 | Archiv |
| `MASTERPLAN.md` | 7,3K | `evidence/k3/` | 📦 | Archiv; `waves/` gewinnt |
| `README.md` | 6,6K | `evidence/k3/` | 📦 | Archiv |
| `docs/finaler-abgleich.md` | 12K | `evidence/k3/` | 📦 | Archiv |
| `docs/K3SWARM-REVISION-3RUNDE.md` | 4,6K | `evidence/k3/` | 📦 | Archiv |
| `docs/vergleich-4wege.md` | 22K | `evidence/k3/` | 📦 | Archiv |
| `docs/zweitvalidierung-update.md` | 17K | `evidence/k3/` | 📦 | Archiv; Quelle der K3-Scores |
| `docs/verifikationsbericht-claudestack.md` | 19K | `evidence/k3/` | 📦 | Archiv |
| `docs/SQUEEZ-RTK-LADDER-ANALYSE.md` | 26K | `evidence/k3/` | 📦 | Archiv |
| `docs/review-bericht.md` | 13K | `evidence/k3/` | 📦 | Archiv |
| `docs/changes.md` | 13K | `evidence/k3/` | 📦 | Archiv |
| `docs/plan.md` | 1,9K | `evidence/k3/` | 📦 | Archiv |
| `docs/claude-token-stack-evaluierung-und-merge.md` | 29K | `evidence/k3/` | 📦 | Archiv |
| `docs/claude-token-stack-evaluierung-und-merge.docx` | 26K | — | ❌ | Binärdublette derselben Datei |
| `docs/issues_out.txt` | 21K | `evidence/k3/issues/` | 📦 | Rohdaten der Issue-Recherche |
| `docs/issues_out2.txt` | 5,0K | `evidence/k3/issues/` | 📦 | Rohdaten |
| `docs/issues_out3.txt` | 10K | `evidence/k3/issues/` | 📦 | Rohdaten |
| `docs/scrape_issues.py` | 1,6K | `scripts/` | ✏️ | **lauffähig** — zusammenführen mit `repo-audit.py` |
| `docs/scrape_issues2.py` | 1,7K | in `scripts/repo-audit.py` | ✏️ | Varianten zusammenführen |
| `docs/scrape_issues3.py` | 1,8K | in `scripts/repo-audit.py` | ✏️ | Varianten zusammenführen |

### C.2.3 OPUS5 — 26 Dateien

| Datei | Größe | Ziel | | Anpassung |
|---|---:|---|---|---|
| `waves/WAVE-INDEX.md` | 7,8K | `waves/` | ✏️ | Wave 0 als Phase 0 aus dem Merge-Plan voranstellen |
| `waves/WAVE-STATE.md` | 2,0K | `waves/` | ✏️ | **auf leer zurücksetzen** — trägt fremden Fortschritt |
| `DEFEKTE.md` | 5,6K | `docs/DEFEKTE.md` | ✏️ | **siehe C.3.10** — mit den GPT-Befunden zusammenführen |
| `scripts/judgments.json` | 5,9K | `scripts/` | ✏️ | **siehe C.3.11** — `source_model` und Abdeckung ergänzen |
| `scripts/ab-harness.sh` | 5,7K | `scripts/` | ✏️ | Fail-loud bei fehlendem Prüfgegenstand (Lehre aus D2) |
| `scripts/repo-audit.py` | 10K | `scripts/` | ✏️ | die drei K3-Scrape-Varianten einarbeiten |
| `scripts/repos.txt` | 710 | `scripts/` | ✏️ | auf die Werkzeuge der Zielmatrix kürzen |
| `scripts/verify-stack.mjs` | 7,1K | in `scripts/verify-package.mjs` | ✏️ | **C.3.5** — Fail-loud-Block übernehmen |
| `config/plugin-diet.md` | 3,5K | `config/` | ✅ | unverändert; Grundlage für Phase 0 |
| `config/settings.patch.json` | 2,1K | `config/` | ✏️ | **neu erzeugen** gegen den echten Ist-Stand |
| `rules/token-efficiency.rules.md` | 5,4K | in `rules/token-stack.md` | ✏️ | **C.3.3** |
| `rules/context-surface-owners.yaml` | 5,4K | in `config/…json` | ✏️ | **C.3.2** |
| `TASK-STATE.template.md` | 611 | — | ❌ | GPT-Variante gewinnt |
| `hooks/prefix-budget.mjs` | 14K | `hooks/optional/` | ✏️ | **C.3.8** — gegen die K3-Variante diffen |
| `hooks/bash-owner-dispatch.mjs` | 14K | `evidence/opus5/` | 📦 | dritter Dispatcher auf derselben Fläche |
| `hooks/bash-owner-dispatch.config.example.json` | 2,7K | `evidence/opus5/` | 📦 | gehört zum Dispatcher |
| `hooks/hooks.settings.example.json` | 1,2K | `evidence/opus5/` | 📦 | Registrierungsbeispiel des Dispatchers |
| `KONZEPT-v5.md` | 43K | `evidence/opus5/` | 📦 | Archiv; einzelne Abschnitte in `docs/ARCHITECTURE.md` |
| `MASTERPLAN.md` | 3,7K | `evidence/opus5/` | 📦 | `waves/` gewinnt |
| `README.md` | 4,9K | `evidence/opus5/` | 📦 | Archiv |
| `MANIFEST.json` | 669 | — | ❌ | `package.json` plus `SHA256SUMS.txt` ersetzen es |
| `validate/scores100-v51.json` | 19K | `scripts/` | ✏️ | **lauffähige Datenquelle**; Abdeckung getrennt ausweisen (C.3.11) |
| `validate/DEFEKTE.md` | 5,6K | — | ❌ | Dublette der Wurzelkopie |
| `validate/judgments.json` | 5,9K | — | ❌ | Dublette |
| `validate/KONZEPT-v5.md` | 43K | — | ❌ | Dublette |
| `{waves,rules,hooks,scripts,config}/` | 0 | — | ❌ | leeres Verzeichnis aus nicht expandierter Brace-Expansion |

### C.2.4 Neu zu erzeugen

| Datei | Zweck |
|---|---|
| `MERGE-MANIFEST.tsv` | eine Zeile je übernommener Datei: Quelle · Pfad · SHA-256 · Fläche · Begründung |
| `SHA256SUMS.txt` | nach dem Merge neu berechnet |
| `evidence/README.md` | erklärt, dass `evidence/` Archiv ist und nicht im Betrieb gelesen wird |

**Bilanz:** von 113 Dateien werden 24 unverändert übernommen, 44 angepasst, 34 archiviert, 11 verworfen; 3 kommen neu hinzu. Betriebsrelevant sind danach rund 50 Dateien, der Rest ist Nachweis.

## C.3 Die umfangreicheren Anpassungen im Detail

### C.3.1 `src/stack.mjs` — der Dispatcher

Drei Eingriffe, sonst unverändert:

1. **Canary-Anbindung.** ADR-005 verlangt eine bestandene Capability-Probe vor `enforce`, das Paket liefert keine. Der Dispatcher liest künftig eine Fähigkeitsdatei; fehlt sie oder ist sie älter als 30 Tage, bleibt er in `shadow` und schreibt den Grund nach stderr. Die Probe selbst liegt in `hooks/optional/` (C.3.7).
2. **Deny-Gate-Grenze.** Im Quellrepo ist `hooks/bash-dump-guard.mjs` ein `PreToolUse`-Deny-Gate und dort korrekt registriert. Der Dispatcher darf diese Fläche nicht beanspruchen. Er prüft beim Start, ob auf `PreToolUse:Bash` ein fremder Mutator registriert ist, und meldet es als Befund — ohne zu blockieren.
3. **String-Normalisierung.** Gibt eine interne Stufe versehentlich einen String statt der Objektform `{stdout, stderr, interrupted, isImage, exitCode}` zurück, wird er zurückgewandelt statt verworfen. Das ist die Lehre aus dem KIMI-Guard-Defekt und in OPUS5s Dispatcher bereits umgesetzt.

Alle drei brauchen neue Fälle in `tests/stack.test.mjs`.

### C.3.2 `config/context-surface-owners.json` — drei Registries werden eine

Es existieren drei Owner-Registries: GPT als JSON (2,2K), K3 als YAML (4,8K), OPUS als YAML (5,4K). Das ist die wichtigste Konfigurationsdatei des Pakets — sie legt fest, wer welche Fläche besitzt.

Vorgehen: Schlüsselmengen diffen, nicht Texte mergen. Je Fläche eine Zeile mit `owner`, `alternatives`, `activation_gate`, `conflict_note`. Das JSON-Format gewinnt, weil es schemavalidierbar ist. Die YAML-Fassungen sind ausführlicher — ihre Zusatzfelder wandern als `note` mit.

Erwartete Konflikte: Bash-Output (drei Kandidaten), Read (GPT führt Advisory, K3 einen Guard), Prefix (nur K3 und OPUS), Retrieval (unterschiedliche Default-Wahl). Jeder Konflikt wird als Zeile mit genau einem `owner` und den übrigen als `alternatives` aufgelöst, nicht durch Weglassen.

### C.3.3 `rules/token-stack.md` — drei Regelwerke werden eins

GPT 1,4K, K3 7,6K, OPUS 5,4K. Die GPT-Fassung ist knapp und laufzeitnah, die beiden anderen sind ausführlicher und enthalten Begründungen.

Regel für die Zusammenführung: **Was in die Laufzeit geladen wird, bleibt kurz.** Die Begründungen wandern nach `docs/ARCHITECTURE.md`, die Regeln selbst bleiben in der GPT-Struktur und werden nur inhaltlich ergänzt — Byte-Deckel für die Root-`CLAUDE.md`, Nudge-Budget, Subagenten-Auftragslimit, `ENABLE_TOOL_SEARCH`. Zielgröße unter 3 KB.

### C.3.4 `templates/CLAUDE.md` — Byte-Deckel statt Vollständigkeit

GPT liefert 846 Byte, K3 5,5K. Der zentrale Messbefund lautet: die reale Root-`CLAUDE.md` kostet 1.975 Token bei 8,4 KB und wird bei dateiberührenden Tool-Calls neu injiziert. Ein Template, das 5,5 KB groß ist, reproduziert genau das Problem.

Daher: GPT-Fassung als Grundlage, **harte Obergrenze 4 KB**, aus der K3-Fassung nur der Compact-Instructions-Block und der Ladder-Verweis. Kein Caveman-, Ponytail-, CodeGraph- oder Context-Mode-Abschnitt — die gehören in Plugins oder path-scoped Rules, nicht in den immer geladenen Prefix. Ein Prüfschritt in `verify-package.mjs` bricht ab, wenn das Template die Grenze überschreitet.

### C.3.5 `scripts/verify-package.mjs` — drei Verifier werden einer

GPT `verify-package.mjs` 8,1K, K3 `verify-package.sh` 8,4K, OPUS `verify-stack.mjs` 7,1K. Das GPT-Skript gewinnt als Träger (Node statt Bash, testbar).

Zu übernehmen:

- aus OPUS: der **Fail-loud-Block** — fehlt ein Prüfgegenstand, wird das am Ende gesondert ausgewiesen und zählt nie als bestanden. Das ist die Lehre aus zwei Defekten, bei denen Suiten still durchliefen.
- aus K3: die **9 Semantik-Checks**, der Installer-Smoke in isoliertem `HOME` und der Abgleich der nativen Budgets.
- neu: der **Byte-Deckel-Check** für `templates/CLAUDE.md` (C.3.4) und ein **Owner-Kollisionscheck**, der die Registry gegen die tatsächlichen Hook-Registrierungen hält.

### C.3.6 `docs/REPO-MATRIX.md` — Divergenz sichtbar halten

Die GPT-Matrix führt einen sicherheits- und korrektheitsorientierten Runtime-Score. Nach ADR-014 bleibt Dissens erhalten. Also drei zusätzliche Spalten je Zeile: `opus_score`, `k3_score`, `dissens`.

Wichtig: die zitierten Fremdwerte müssen **versioniert** sein. Der derzeit in den Endartefakten zitierte OPUS-Wert für `toonify` (85) stammt aus v4; v5.1 nennt 72. Jede Fremdspalte bekommt daher ein Feld `stand`. Aus dem K3-`kern-katalog.md` wandern die Flags und Aktivierungsgates in dieselbe Zeile.

### C.3.7 `hooks/optional/claude-hook-capability-canary.mjs`

Die Probe funktioniert eigenständig und schreibt eine Fähigkeitsdatei. Anzupassen ist nur der Ausgabepfad, damit der Dispatcher ihn findet, plus ein Ablaufdatum im Datensatz (30 Tage). Die Probe wird **nicht** als Hook registriert; sie wird von Hand oder über die CLI aufgerufen.

### C.3.8 `hooks/optional/prefix-budget.mjs` — zwei Implementierungen, eine Entscheidung

K3 23K, OPUS 14K. Beide beanspruchen dieselbe Aufgabe. OPUS' Fassung trägt den dokumentierten D1-Fix — Alternations-Matcher werden in die Menge der Tools aufgelöst, auf die sie feuern, mit Vorher-Nachher-Nachweis auf der realen Konfiguration. K3s Fassung ist 9 KB größer und behauptet im Selbsttest „inkl. OPUS-Kollisionserkennung".

Vorgehen: beide gegen dieselbe reale `settings.json` laufen lassen und die gemeldeten Kollisionen vergleichen. Wer die fünf `PreToolUse:Bash`-Handler und die drei mutierenden korrekt findet, gewinnt. **Vorauswahl OPUS**, weil kleiner und mit Nachweis — aber die 9 KB Differenz sind vor dem Verwerfen zu sichten.

### C.3.9 Neue ADRs in `docs/DECISIONS.md`

- **ADR-015 — Zusammenführung nach Träger, nicht nach Merge.** Ein Paket ist Träger, Fremdteile werden aufgepfropft. Begründung: drei Bash-Owner lassen sich nicht vereinigen.
- **ADR-016 — Optionale Hooks bleiben unregistriert.** Sie liegen im Paket, erscheinen nicht im Fragment und werden einzeln nach Baseline aktiviert.
- **ADR-017 — Fremdbewertungen werden versioniert zitiert.** Jeder Fremdwert trägt Modell und Stand. Begründung: der Toonify-Dissens wurde gegen einen überholten Stand dokumentiert.

### C.3.10 `docs/DEFEKTE.md` — ein Register statt zwei

OPUS führt D1–D7 mit Nachweis und Status. GPT führt seine Befunde verstreut in `06-incoming-reconciliation.md`. Zusammenführen in ein Register mit einheitlichen Spalten `ID · Artefakt · Befund · Nachweis · Status`.

Zu ergänzen: die drei Packaging-Defekte des Vorgängerpakets (D3, offen), die Ladder-Drift (D4, bewusst offen) und die Kollisionsbefunde aus dem Guard-Namensfall (D6). Neu aufzunehmen sind die beiden Baumdefekte — die Brace-Expansion und die drei Dubletten in OPUS5.

### C.3.11 `scripts/judgments.json` und `scores100-v51.json` — zwei Auflagen

Beide sind Evidenzdateien und wertvoll. Vor der Übernahme sind zwei Konstruktionsfehler zu beheben:

1. **Abhängigkeit sichtbar machen.** Alle 15 Korrektheitsurteile stammen aus GPT56s COR-Spalte. Im Träger verwendet, bewertete GPT56 sich selbst. Feld `source_model` je Zeile ergänzen; der Verifier lehnt eine Zeile ab, deren `source_model` gleich dem Träger ist, wenn sie in dessen eigene Entscheidung einfließt.
2. **Absenz nicht als Strafe rechnen.** `D = 0` kostet ungeprüfte Werkzeuge im Mittel 17,6 Punkte, ohne dass ein Befund vorliegt. Score künftig nur über die geprüften Achsen bilden und die Abdeckung als eigene Spalte führen. `magic-compact` mit realem Befund und `toonify` ohne jeden Befund dürfen nicht auf demselben Wert landen.

---

# TEIL D — Umsetzung

## D.1 Der eine Job, der sich für einen Agenten lohnt

Nicht „vergleichen und mergen" — das ist sechs Runden lang gemacht worden und liefert nichts Neues. Sondern eine **mechanische Kollisionsinventur**, die man von Hand nicht zuverlässig hinbekommt:

```
Für alle 113 Dateien der drei Pakete:
  1. SHA-256 → byteidentische Dubletten über Paketgrenzen finden
  2. Gleicher Basename, verschiedener Hash → Kollisionsliste
  3. Für jede .mjs: grep hookEventName / matcher / permissionDecision /
     updatedToolOutput / updatedInput
     → Tabelle Datei × Hook-Event × Matcher × Mutationsart
  4. Aus 3: alle Flächen mit mehr als einem Mutator markieren
  5. Für die drei Owner-Registries: Schlüsselmengen diffen,
     Konflikte je Surface ausweisen
Ausgabe: eine TSV-Zeile je Datei mit
  paket · pfad · sha256 · basename_kollision · surface · mutationsart · empfehlung
```

Das ist verifizierbar, wiederholbar und beantwortet genau die Fragen, an denen der Korpus dreimal vorbeigelaufen ist. Der `bash-dump-guard`-Befund — drei verschiedene Dateien unter einem Namen — wäre daraus in Minute eins gefallen.

**Was der Agent nicht entscheidet:** welches Werkzeug gewinnt. Die Regel steht bereits — native zuerst, ein Mutator je Fläche, Sicherheitsveto vor Mittelwert, Recovery vor Elision. Sie anzuwenden ist ein Fünf-Zeilen-Urteil je Datei, keine Rechercheaufgabe.

## D.2 Reihenfolge

| Schritt | Inhalt | Aufwand | Paket nötig? |
|---|---|---|---|
| **0** | `/context` mit fester Aufgabe → 25 Plugins auf das Genutzte kürzen → `/context` erneut. Caveman- und Ponytail-Dopplung aus der Root-`CLAUDE.md` entfernen, Byte-Deckel ≤ 4 KB. Drei mutierende `PreToolUse:Bash`-Hooks auf einen reduzieren | 2–3 h | **nein** |
| **1** | Die fünf `env`-Deckel einzeln, unveränderte Defaults als Kontrollarm. `ENABLE_TOOL_SEARCH` prüfen | 1–2 h | nein |
| **2** | Kollisionsinventur (D.1) → `MERGE-MANIFEST.tsv` | 1 h | nein |
| **3** | Träger klonen, `evidence/` befüllen, die drei Datenzusammenführungen (C.3.2 – C.3.4) | 2–3 h | ja |
| **4** | Code: C.3.1, C.3.5, C.3.7, C.3.8 — Tests und Verifier grün | 2–3 h | ja |
| **5** | Doku und Evidenz: C.3.6, C.3.9 – C.3.11; `SHA256SUMS.txt` neu | 1–2 h | ja |
| **6** | Dispatcher `shadow`, Canary-Probe, `ab-harness.sh` mit ≥ 3 gepaarten Replikaten | Tage | ja |
| **7** | `enforce` nur nach Net-Win-Gate; Verlierer samt Hooks, State und Env entfernen | — | ja |

**Phase 0 ist reine Subtraktion**, braucht keines der drei Pakete und adressiert den nach eigener Messung größten Posten. Sie läuft parallel zu den Schritten 2 bis 5 und liefert die Zahl, gegen die Schritt 6 gemessen wird.

## D.3 Zwei Defekte im Baum selbst

| Befund | Wo |
|---|---|
| Ein leeres Verzeichnis namens `{waves,rules,hooks,scripts,config}` — nicht expandierte Brace-Expansion, entstanden durch `mkdir -p "{...}"` oder eine Shell ohne Brace-Support | `opus5_claude-token-stack/` |
| Drei Dateien doppelt: `DEFEKTE.md`, `judgments.json`, `KONZEPT-v5.md` je einmal im Wurzelverzeichnis und einmal unter `validate/` — rund 54 KB Dublette, dasselbe Muster, das der Ladder-Audit als `F02` gerügt hat | `opus5_claude-token-stack/` |

Beide sind harmlos, beide gehören vor der Übernahme bereinigt — das zweite, weil sonst offen bleibt, welche Kopie die maßgebliche ist.

## D.4 Maschinenlesbarer Endblock

```tsv
paket	dateien	rolle	traeger_entscheidung
gpt56sol_claude-code-token-stack	33	runtime_architektur	TRAEGER
k3swarm_claude-token-stack-paket	54	hook_inventar_und_betrieb	PFROPFUNG_flaechen_und_tests
opus5_claude-token-stack	26	governance_und_evidenz	PFROPFUNG_vollstaendig
```

```tsv
kategorie	anzahl	anteil
unveraendert_uebernommen	24	21%
angepasst_uebernommen	44	39%
archiviert_evidence	34	30%
verworfen	11	10%
neu_erzeugt	3	-
betriebsrelevant_danach	~50	-
```

```tsv
flaeche	besetzung	modus	grund
basis	claude_code_nativ	immer	-
messung	ccusage_observer	sofort	kein_mutationsrecht
prefix	UNBESETZT	handarbeit	PolyForm_Lizenzfence
externe_massendaten	UNBESETZT	native_mittel	Elastic_2.0_Lizenzfence
bash_output	gpt56_src_stack.mjs	off_shadow_canary_enforce	ein_owner
read	k3_guard_optional	nicht_registriert	nach_baseline
retrieval	codegraph_ODER_sigmap_ODER_codebase-memory-mcp	genau_einer	aufgabenabhaengig
verhalten	ponytail_als_regel	on_demand	prefix_kosten
session	native_grenze_plus_task_state	sofort	-
proxy	UNBESETZT	nach_messbefund	CA_cache_risiko
format	UNBESETZT	nach_audit	toonify_funktion_ungeprueft
```

```tsv
werkzeuge_gesamt	40
von_allen_drei_bewertet	15
von_genau_zwei	7
von_genau_einem	18
genannt_ohne_score	7
musterabsagen	6
lizenz_fences	2
```
