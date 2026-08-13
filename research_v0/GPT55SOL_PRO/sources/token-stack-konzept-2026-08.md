# Token-Stack für Claude Code — Landschaft und Konzept

**Stand:** 10.08.2026 · **Umfang:** ~70 Repos gesichtet, 22 READMEs vollständig gelesen
**Auftrag:** alle Repos finden, die bei Claude Code auf irgendeine Weise Tokens sparen — daraus den bestmöglichen Stack als Konzept, unabhängig vom gewachsenen Bestand.

---

## 0. Umgang mit Zahlen in diesem Dokument

Jede Prozentangabe aus einem README ist eine **Herstellerangabe**, keine Messung. Sie steht hier als Beleg dafür, *was ein Tool zu tun beansprucht*, nicht dafür, *wieviel es bringt*. Die Trennung ist im ganzen Dokument durchgehalten:

| Marker | Bedeutung |
|---|---|
| `[HERSTELLER]` | Zahl stammt aus README/Website des Tools |
| `[DOKU]` | Aus offizieller Anthropic-Dokumentation |
| `[GEMESSEN]` | Deine eigene Messung auf deiner Maschine |
| `[SCHLUSS]` | Meine Ableitung, nicht belegt |

Zwei Dinge, die die Recherche über die READMEs hinaus zeigt und die den Rest des Dokuments tragen:

1. Fast alle Repos greifen an **derselben Stelle** an (Tool-Ausgaben), und das ist nachweislich **nicht** die Stelle mit dem größten Hebel.
2. Die offizielle Doku benennt eine harte Trennlinie zwischen cache-sicheren und cache-zerstörenden Eingriffen. Diese Trennlinie ist das eigentliche Auswahlkriterium — nicht Kompressionsrate.

---

## 1. Kernthese

> Der teuerste Token bei Claude Code ist nicht der, der einmal hereinkommt, sondern der, der **jede Runde erneut abgerechnet** wird. Deshalb schlägt Prefix-Hygiene jede Kompression, und deshalb ist ein Tool, das den Prefix umschreibt, im Zweifel teurer als der Müll, den es entfernt.

Das deckt sich exakt mit deiner v5-Messung: *„Vorab-Rechnungen unterschätzen systematisch … gemessener Effekt war 3,3-mal so groß wie gerechnet (jede zusätzliche Runde schickt den Vorlauf erneut durch die Cache-Erzeugung)"* `[GEMESSEN]`. Derselbe Mechanismus wirkt in beide Richtungen — er hat deine Ersparnis vergrößert, und er vergrößert die Kosten jedes Tools, das den Cache anfasst.

---

## 2. Wo Tokens tatsächlich entstehen — sieben Ebenen

| Ebene | Was | Wird wie oft abgerechnet | Typische Tools |
|---|---|---|---|
| **L0 Prefix** | System-Prompt, CLAUDE.md, Skill-Listing, Plugin-Metadaten | jede Runde (Cache-Read), bei Änderung Cache-Write | *fast keine* |
| **L1 Tool-Definitionen** | MCP-Schemata, Built-in-Tools | jede Runde | Tool Search (nativ), code-execution-mode, LAP |
| **L2 Tool-Ausgaben** | Bash, Read, Grep, MCP-Antworten | einmal geschrieben, danach jede Runde im Tail | rtk, snip, lowfat, omni, squeez, headroom, sqz, toonify |
| **L3 Modell-Ausgabe** | Erklärtext, Code-Umfang | jede Runde im Tail | ponytail, claude-token-efficient, Output-Styles |
| **L4 Sitzungswachstum** | Der Tail wächst linear → Kosten wachsen quadratisch | — | rolling-context, clauditor, Subagenten, /clear |
| **L5 Kompaktierung** | Was beim Compact verloren geht, wird neu erarbeitet | — | token-optimizer, openwolf, context-mode, claude-mem |
| **L6 Retrieval** | Lesen, statt gezielt zu holen | L2 vervielfacht | codegraph, sigmap, jcodemunch, claude-context, entroly |
| **L7 Messung** | — | — | ccusage, sniffly, otel, token-optimizer |

**Der blinde Fleck der Landschaft:** von ~70 gefundenen Repos arbeiten geschätzt 45 auf L2. Auf L0 arbeitet ernsthaft **eines** (alexgreensh/token-optimizer). Das ist bemerkenswert, weil L0 in *jeder* Runde bezahlt wird und bei dir mit 44 Plugins / ~290 Skills / 21 Marketplaces vermutlich der größte Einzelposten ist `[SCHLUSS]`.

---

## 3. Das Ausschlusskriterium: Cache-Sicherheit

Aus der offiziellen Claude-Code-Doku zu Prompt-Caching `[DOKU]`:

> Skills, Commands, Agents, **Hooks**, LSP-Server, Monitors und Themes invalidieren den Cache **nie** — was sie hinzufügen, wird hinter dem bestehenden Gespräch angehängt. Die nächste Anfrage bezahlt das Neue, liest aber alles davor weiter aus dem Cache.

Und umgekehrt invalidieren `[DOKU]`:

- MCP-Server, die sich mitten in der Session verbinden oder trennen (passiert auch ohne dein Zutun: stdio-Prozess stirbt, HTTP-Session läuft ab, Server reconnected)
- Modellwechsel mitten in der Session (der Cache ist modell-gekeyed)
- CLAUDE.md-Änderung
- Hinzufügen/Entfernen einer Built-in-Tool-Deny-Regel mitten in der Session

Bestätigt durch Issue #27048 (anthropics/claude-code) `[DOKU]`: Plugin-Enable/Disable mitten in der Session löst ein vollständiges Neuschreiben des gecachten User-Content aus — bei einem Test 98K nicht gelesen, 91K neu geschrieben. Ironie: genau die Nutzer, die per Plugin-Toggling Kontext sparen wollen, zahlen am meisten.

**Daraus folgt die Architekturregel deines Stacks:**

> **Append-only schlägt Rewrite.** Alles, was als Hook, Skill, Command oder CLI-Wrapper arbeitet, ist cache-neutral und darf in den Stack. Alles, was als **Proxy** zwischen Claude Code und der API sitzt, muss den Cache-Write-Aufschlag erst verdienen, bevor es überhaupt netto spart — und das ist ohne gepaarte Messung nicht zu behaupten.

Betroffen von dieser Regel (alles Proxies): pxpipe, entroly (Proxy-Pfad), lean-ctx (Proxy-Pfad), headroom (Proxy-Modus), tokdiet, claude-rolling-context, TokenTamer, trooper, claw-compactor (Proxy-Einsatz), ClawRouter, headroom-desktop.
Einzige begründete Ausnahme: **claude-code-cache-fix** — ein Proxy, dessen *Zweck* Cache-Reparatur ist.

---

## 4. Vollständiger Katalog

### L0 — Prefix / Struktureller Ballast

| Repo | Was | Form | Cache |
|---|---|---|---|
| **alexgreensh/token-optimizer** ⭐ | Auditiert CLAUDE.md, MEMORY.md, Skills, MCP, Modell-Routing; Checkpoints vor Auto-Compact; Dashboard; SQLite-Trends | Plugin (Hooks) | sicher |
| drona23/claude-token-efficient | Eine CLAUDE.md, die Antworten knapp hält | Datei | sicher |
| oxygen-fragment/claude-modular | Modulares Command-Framework, hierarchische Config | Template | sicher |
| nadimtuhin/claude-token-optimizer | Setup-Template für Token-Optimierung | Template | sicher |
| **Nativ:** `deny`-Regeln, `ENABLE_TOOL_SEARCH`, Plugin-/Skill-Pruning | — | Settings | sicher |

**Kernaussage von token-optimizer** `[HERSTELLER]`: *„Headroom und RTK komprimieren Kommando-Ausgaben — das sind 15–25 % deines Kontexts. Die anderen 75 % sind aufgeblähte Configs, ungenutzte Skills, veraltetes Memory, Compaction-Verlust, Modell-Fehlrouting, Verhaltens-Verschwendung."*
Diese Behauptung stammt von einem Wettbewerber und ist entsprechend interessengeleitet. Sie deckt sich aber mit deiner eigenen Messung: Ladder −27,2 % auf einer engen Klasse, gepaart −0,3 % in v4, weil der einzig lohnende Fall ohnehin ausgelagert wurde `[GEMESSEN]`. Zwei unabhängige Wege zum selben Befund.

### L1 — Tool-Definitionen

| Repo | Was | Cache |
|---|---|---|
| **Nativ: MCP Tool Search** | seit CC 2.1.7; greift automatisch, wenn MCP-Tool-Beschreibungen >10 % des Kontextbudgets; ~500 Token Overhead statt voller Schemata; >85 % weniger Definitions-Overhead `[HERSTELLER/Anthropic]` | sicher |
| elusznik/mcp-server-code-execution-mode | Ein einziges `run_python`-Tool; alle MCP-Server werden im Container geproxyt; konstant ~200 Token statt ~30K `[HERSTELLER]` | ein MCP-Server statt vieler |
| Lap-Platform/LAP | Kompiliert OpenAPI/GraphQL/Protobuf in agent-natives Format, ~10× kleiner `[HERSTELLER]` | Datei |
| mksglu/context-mode | „Think in Code": `ctx_execute()` statt 47× Read `[HERSTELLER]` | MCP-Server |

Programmatic Tool Calling (API, ~38 % weniger Input-Tokens bei 75 Tools `[HERSTELLER/Anthropic]`) ist **in Claude Code nicht verfügbar** (Issue #12836, Stand Jan 2026) `[DOKU]`. Die Repos oben bauen genau diese Lücke nach.

### L2 — Tool-Ausgaben (das überfüllte Feld)

| Repo | Mechanik | Form | Bemerkung |
|---|---|---|---|
| **rtk-ai/rtk** | Rust-CLI-Proxy, 60–90 % auf Dev-Kommandos `[HERSTELLER]` | CLI-Wrapper | hast du; wirkt nur, wenn rtk das Kommando selbst ausführt `[GEMESSEN]` |
| **edouard-claude/snip** ⭐ | Go, **deklarative YAML-Filter** — Filter sind Datendateien, kein kompilierter Code | CLI + `snip init` | rtk-Alternative; eigene Filter ohne Rebuild |
| **zdk/lowfat** | Rust, drei Level (`lite`/`full`/`ultra`), Messwerte pro Kommando **im Repo reproduzierbar** | CLI + Plugins | einziges Tool mit nachvollziehbarer Messmethodik |
| **fajarhide/omni** ⭐ | Filtert Rauschen **und dedupliziert über die Session**: bereits gezeigte Zeilen kommen als Marker zurück, nicht als Bytes | CLI + Hooks | der Teil, den ein reiner Filter nicht kann |
| claudioemmanuel/squeez | Rust-Hook-Kompressor mit Blob-Stash | Hook | hast du; **kann Ausgaben vergrößern** `[GEMESSEN]` |
| KRLabsOrg/squeez | LoRA-Modell, das relevante Zeilen aus Tool-Output extrahiert | Python/PyTorch | Namensgleichheit, völlig anderes Tool |
| chopratejas/headroom | Library + Proxy + MCP, 60–95 % `[HERSTELLER]` | drei Formen | Proxy-Form cache-riskant |
| ojuschugh1/sqz · Madhan230205/token-reducer · PCIRCLE-AI/toonify-mcp · open-compress/claw-compactor · manojmallick/sigmap · borhen68/TokenTamer · agiwhitelist/tokdiet | Varianten desselben Musters | gemischt | siehe Katalog-Anhang |

### L3 — Modell-Ausgabe

| Repo | Was |
|---|---|
| **DietrichGebert/ponytail** | Skill, der den Agenten zwingt, minimalen Code zu schreiben. ~54 % weniger LOC im Mittel über 12 Feature-Tasks, n=4, Haiku 4.5, gegen fairen agentischen Baseline `[HERSTELLER]` — mit ungewöhnlich ehrlicher Methodik: der Autor korrigiert seine eigene frühere 80–94 %-Zahl nach unten |
| JuliusBrussee/caveman | Verknappt Ausgabe-Sprache |
| **Nativ:** Output-Styles, `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | — |

⚠️ Gegenbefund: context-mode verweist auf Belege, dass aggressive Kürze-Prompts Coding-/Reasoning-Benchmarks **verschlechtern** (Moonshot AI zu kimi-k2.5) `[HERSTELLER]`. Kürzerer Code ist nicht automatisch besserer Code — hier ist die Qualitätsmessung wichtiger als die Tokenmessung.

### L4 — Sitzungswachstum (der quadratische Term)

| Repo | Was | Cache |
|---|---|---|
| **IyadhKhalfallah/clauditor** | Misst Tokens/Turn, **blockiert** die Session bei Verschwendung, speichert Zustand als Markdown, führt in eine frische Session | Hook | sicher |
| NodeNestor/claude-rolling-context | Proxy: alte Nachrichten werden zusammengefasst, jüngste bleiben verbatim | **Proxy** | riskant |
| GMaN1911/claude-cognitive | Working Memory, Multi-Instanz-Koordination | — | — |
| **Nativ:** `/clear`, Subagenten (isoliertes Fenster), Session-Fork | — | sicher |

Das Argument von rolling-context ist unabhängig von seinem Tool richtig und wichtig `[HERSTELLER, aber nachrechenbar]`: jeder Token im Kontext wird **jede Runde** neu abgerechnet, also wächst die Input-Kosten einer ungemanagten Session mit dem **Quadrat** ihrer Länge. Ein Deckel auf den Prefix macht daraus lineares Wachstum. Das ist mathematisch der größte Hebel im ganzen Dokument — und er ist mit `/clear` plus einem Wächter kostenlos zu haben, ohne Proxy.

### L5 — Kompaktierung überleben

| Repo | Was |
|---|---|
| alexgreensh/token-optimizer | Checkpoints bei 20/35/50/65/80 % Füllstand; Restore nach Compact; „Context-Intel-Digest" der großen Tool-Ausgaben `[HERSTELLER]` |
| cytostack/openwolf | 7 Lifecycle-Hooks, PreCompact-Snapshot + Restore, gemeinsames `.wolf/`-Gehirn über mehrere Agenten |
| mksglu/context-mode | SQLite + FTS5/BM25 statt Kontext-Dump nach Compact |
| thedotmack/claude-mem · zippoxer/recall · 0xranx/OpenContext · mempalace | Memory-Layer |

**Nativer Kontext dazu** `[DOKU]`: Claude Code hat drei Stufen — Microcompact (löscht veraltete Tool-Ergebnisse ohne Modellaufruf), server-seitiges Context-Management ab ~180K Input mit Ziel ~40K, und Voll-Compact per Modellaufruf. Auto-Compact greift bei ~83 % (`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`, Werte darüber werden stillschweigend gekappt). **Es gibt keinen Aus-Schalter** — Issue #38483 ignoriert `autoCompactEnabled`, #42149 wurde als „not planned" geschlossen. Ein Detail mit direktem Bezug zu dir: das Skill-Listing wird nach Compact **nicht** neu injiziert, weil das ~4.000 Token reine Cache-Erzeugung kostet `[HERSTELLER, Bundle-Analyse]`.

### L6 — Retrieval statt Lesen

| Repo | Mechanik | Form | Prefix-Kosten |
|---|---|---|---|
| **manojmallick/sigmap** ⭐ | Deterministische, byte-stabile Signaturkarte; keine LLM-Calls, keine Embeddings; `npx sigmap` ohne Install | CLI **oder** MCP | als CLI: **null** |
| jgravelle/jcodemunch-mcp | Tree-sitter-AST, symbolgenauer Abruf; 86–99 % `[HERSTELLER]` | MCP | ein Server |
| colbymchenry/codegraph | Kompakter Codebase-Index | CLI | hast du |
| zilliztech/claude-context · memsearch | Semantische Suche | MCP | ein Server |
| juyterman1000/entroly | AST + Call-Graph + verifizierte Spans + wiederherstellbare Kompression + Quittungen | Proxy/MCP/Plugin/SDK | je nach Pfad |
| yvgude/lean-ctx | Rust-Binary: liest, komprimiert, merkt sich, wacht, quittiert; 76 MCP-Tools | CLI + MCP + Proxy | 76 Tools = erheblich |
| tirth8205/code-review-graph | AST-Graph, minimaler Dateisatz für Reviews | CLI | — |

**Der wichtigste Unterschied in dieser Tabelle ist nicht die Kompressionsrate, sondern die Form.** Ein Tool als CLI kostet null Prefix. Dasselbe Tool als MCP-Server kostet Schemata in jeder Runde und kann sich mitten in der Session trennen und damit den Cache killen. **sigmap kann beides — deshalb steht es hier vorn.**

### L7 — Messung

ccusage/ccusage · chiphuyen/sniffly · ColeMurray/claude-code-otel · philipp-spiess/claude-code-costs · f/agentlytics · getagentseal/codeburn · nikitadoudikov/claude-pulse · onikan27/claude-code-monitor · RonnieTheTester/headroom-meter · mibayy/token-savior · **nativ: `/context`, `/cost`**

### Sonstige Fundstellen (vollständigkeitshalber)

cnighswonger/claude-code-cache-fix (Cache-Reparatur-Proxy — 20× Kostenanstieg bei resumten Sessions `[HERSTELLER]`) · BlockRunAI/ClawRouter (Modell-Routing, bis 88 % `[HERSTELLER]`) · tkaufmann/claude-gemini-bridge (Auslagerung an Gemini) · teamchong/pxpipe (Kontext als PNG rendern) · gglucass/headroom-desktop · ooples/token-optimizer-mcp · lucasrosati/claude-code-memory-setup · castnettech/mnemosyne · shouvik12/trooper · MarceloCaporale/codex-agent-mem · SonicBotMan/lobster-press · HaShiShark/context-editor-agent · Adityapal67/context-graph-compressor · LearnPrompt/cc-harness-skills · chopratejas/headroom-zed · awesomo913/Claude-Token-Saver · DJLougen/hive · Repo-Packer (repomix, gitingest, code2prompt, files-to-prompt, yek) · Forschung (microsoft/LLMLingua, ZongqianLi/500xCompressor, jeffreysijuntan/lloco, snu-mllab/Context-Memory, toon-format/toon)

---

## 5. Der empfohlene Stack

Aufgebaut nach Hebel × Risiko, nicht nach Kompressionsrate. Ebene 0 und 1 kosten nichts und sind vor jeder Tool-Entscheidung fällig.

### Ebene 0 — Prefix-Diät (Pflicht, sofort, kostenlos)

1. **Skill- und Plugin-Inventar radikal kürzen.** ~290 Skills in 17 Namespaces, 44 Plugins aus 21 Marketplaces. Bei den kursierenden ~100 Token pro Skill im Listing `[HERSTELLER]` sind das grob 29.000 Token, die in **jeder Runde** mitlaufen. Ziel: unter 40 aktive Skills. Das ist mit Abstand der größte erwartbare Einzelposten `[SCHLUSS]` — und der einzige, der ohne neues Tool zu heben ist.
2. **skill-routing bleibt aus.** Deine eigene Messung: zwei produktive Sessions, kein einziger zusätzlich geladener Skill `[GEMESSEN]`. Ein Bootloader, der nichts lädt, ist reiner Prefix.
3. **Die tokless-CLAUDE.md auf das Gemessene reduzieren.** 3,5k Token SessionStart-Guidance → 0 von 92 ctx-Aufrufen `[GEMESSEN]`. Das ist kein Grenzfall, das ist ein Totalausfall. Entweder ersatzlos streichen oder auf die Zeilen kürzen, deren Wirkung du belegen kannst.
4. **MCP-Server projektweise statt global.** Jeder registrierte Server kostet Prefix, und jeder Verbindungsabbruch invalidiert den Cache `[DOKU]`. squeez-MCP hast du bereits aus diesem Grund draußen (286 Token/Session) `[GEMESSEN]` — dieselbe Logik gilt für alle anderen.
5. **`deny`-Regeln für ungenutzte Built-ins.** Ein nackter Tool-Name als Deny-Regel entfernt die Definition vollständig aus dem Kontext `[DOKU]`. Kandidaten prüfen: `WebFetch`, `NotebookEdit`.

### Ebene 1 — Native Deckel (settings.json → `env`)

```jsonc
{
  "env": {
    "MAX_MCP_OUTPUT_TOKENS": "8000",        // Default 25000 — MCP-Antworten sind die stillsten Fresser
    "BASH_MAX_OUTPUT_LENGTH": "24000",      // unterhalb der ~32KB-Auslagerungsgrenze [GEMESSEN]
    "TASK_MAX_OUTPUT_LENGTH": "12000",      // Deckel auf Subagent-Rückgaben
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "16000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "78" // früher kompaktieren = billigere Runden davor
  }
}
```

Alle Werte sind Strings. `MAX_THINKING_TOKENS` bewusst weggelassen: Fable 5 ignoriert sämtliche Thinking-Toggles `[HERSTELLER]`, und bei den übrigen Modellen ist der Effekt auf Codequalität das größere Risiko.
`ENABLE_TOOL_SEARCH` **nicht** abschalten.

> Wichtig: Der `BASH_MAX_OUTPUT_LENGTH`-Wert ist genau der Parameter, der deiner Ladder-Messung den Boden entzogen hat — der einzige lohnende Fall (`config.rs`, 11.234 Token) wurde von Claude Code selbst ausgelagert. **Diesen Deckel selbst zu setzen ist der billigere Weg zum selben Ergebnis als jede Kompressionsleiter.**

### Ebene 2 — Ein Ausgabefilter, nicht vier

**Empfehlung: `snip` oder `lowfat` als Ersatz für die squeez-Hook-Schicht, `omni` als Ergänzung, rtk bleibt als Kommando-Wrapper.**

Begründung:
- **snip**: Filter sind YAML-Dateien, keine kompilierte Logik. Damit sind sie *einzeln testbar und einzeln messbar* — genau das, woran deine bisherige Kette scheitert (du kannst heute nicht sagen, welcher der neun squeez-Parameter welchen Anteil trägt).
- **lowfat**: veröffentlicht seine Reduktionswerte **pro Kommando und pro Level mit reproduzierbarem Befehl** gegen mitgelieferte Samples. Das einzige Repo im Feld, das seine Zahlen so ausliefert, dass man sie nachrechnen statt glauben kann. Für dein Bewertungsraster (Einstellbarkeit + Ausgabequalität) ist das der stärkste Kandidat.
- **omni**: dedupliziert über die Session — bereits gezeigte Zeilen kommen als Handle zurück. Das ist die einzige Funktion im ganzen Feld, die ein Filter prinzipiell nicht leisten kann, und sie greift genau dort, wo dein quadratischer Term entsteht. Zusätzlich: `kubectl get pods` = 0 % Ersparnis **by design** dokumentiert. Ein Repo, das eine Null in die eigene Benchmark-Tabelle schreibt, ist die Ausnahme im Feld.
- **squeez raus** — oder auf den einen Fall reduziert, in dem du eine positive Messung hast. Belegt ist, dass es Ausgaben vergrößern kann (`filter.rs`: 2.001 vs. 1.719 verbatim) `[GEMESSEN]`.

### Ebene 3 — Retrieval statt Lesen (dein größtes ungehobenes Feld)

**Empfehlung: `sigmap` als CLI (nicht als MCP), zusätzlich zu codegraph.**

Alle 101 von 101 Stashes deiner Ladder kamen aus Bash `[GEMESSEN]` — d.h. der Read-Pfad ist bei dir bisher gar nicht adressiert. Genau dort sitzt aber die Vervielfachung: eine Strukturfrage, die 40k Token Datei-Lesen auslöst, ist teurer als jedes Bash-Dump. sigmap beantwortet sie deterministisch und byte-stabil, ohne LLM-Call, ohne Embeddings, ohne MCP-Registrierung, per `npx`.

Bewusst **nicht** empfohlen: jcodemunch-mcp, claude-context, memsearch, token-optimizer-mcp. Alle sind gute Werkzeuge, aber alle kosten Prefix in jeder Runde und können mitten in der Session den Cache invalidieren.

### Ebene 4 — Sitzungsökonomie

**Empfehlung: eigener Wächter statt clauditor, aber nach dessen Muster.**

clauditor hat die richtige Idee (Zustand sichern, Session hart schneiden) und die falsche Umsetzung für dich (blockiert, eigene CLI, eigenes Format). Du hast bereits alle Bausteine: PostToolUse-Ledger, claude-mem, Wave-Governance-Dokumente. Was fehlt, ist die Regel — siehe Abschnitt 6.

### Ebene 5 — Kompaktierung überleben

**Empfehlung: token-optimizer einmal als Audit fahren, dann entscheiden.**

Es ist das einzige Repo im Feld, das auf L0 und L5 gleichzeitig arbeitet, es ist ein Plugin (also cache-sicher `[DOKU]`), und sein Audit-Lauf sagt dir mit einem Befehl, wie groß dein Prefix-Problem tatsächlich ist. Auch wenn du es danach wieder deinstallierst, ist die Zahl das Nützlichste, was du aus dieser ganzen Landschaft mitnehmen kannst.
Achtung: es bringt eigene Hooks, eine SQLite-DB und ein Dashboard mit, und es kollidiert konzeptionell mit claude-mem und deinem Nudge-Engine. Als **Messinstrument** einbauen, nicht als Dauerbewohner — es sei denn, die Zahl überzeugt.

### Ebene 6 — Messung

Dein v5-Verfahren (gepaarte Läufe, je 3, Streuung ausgewiesen) bleibt der Standard. Ergänzend `ccusage` für die Cache-Read/Cache-Write-Ratio, weil genau diese Ratio das Erfolgskriterium für alle Ebene-0-Maßnahmen ist.

---

## 6. Regelwerk — Guards im Stil von `bash-dump-guard.mjs`

Sieben Regeln, absteigend nach erwartetem Hebel. Alle als Hooks — also `[DOKU]`-belegt cache-neutral.

### R1 — `prefix-budget.mjs` (SessionStart)
Misst beim Start: Anzahl aktiver Skills, MCP-Server, Größe der CLAUDE.md. Überschreitet die Summe ein Budget, wird **einmalig** eine Zeile angehängt, die sagt, welcher Posten es reißt. Kein Blockieren, kein Umschreiben. Das ist die Regel, die es im ganzen Feld nicht gibt und die bei dir am meisten bringt.

### R2 — `read-slice-guard.mjs` (PreToolUse: Read)
Blockt Whole-File-Reads über N Zeilen und verlangt entweder `offset`/`limit` oder eine sigmap/codegraph-Abfrage. Das ist die Read-Seite deines bestehenden Bash-Gates — bisher unbesetzt, obwohl dort mehr liegt.

### R3 — `reread-guard.mjs` (PreToolUse: Read)
Zweitlesung derselben Datei ohne zwischenzeitliche Änderung (mtime + Hash) → Verweis auf den vorhandenen Stash statt Neulesung. Die Blobs unter `~/.claude/squeez/blobs/<key>` liefern die halbe Infrastruktur schon; `ladder <key>` ist der Abrufpfad. Damit bekommt die Ladder eine Aufgabe, für die sie tatsächlich taugt — nachweisliche Wiederholung — statt der Aufgabe, an der sie gemessen scheitert (Strukturfragen an frischem Quelltext).

### R4 — `session-economy.mjs` (PostToolUse, ratenlimitiert)
Ab X % Kontextfüllstand **einmal** pro Session: Checkpoint als Datei schreiben + Schnittvorschlag anhängen. Nicht blockieren (clauditor blockiert — bei deiner Hook-Dichte ein Rezept für Frust). Der Checkpoint ist der Teil, der zählt: ohne ihn ist `/clear` teuer, mit ihm ist es billig.

### R5 — `bash-dump-guard.mjs` — zwei Korrekturen
- **RTK_BIN-Problem lösen, nicht umgehen.** Die Binärpfad-Heuristik über das tokless-Binary ist seit Wochen ungelöst. Ersetze sie durch einen expliziten Marker: eine Environment-Variable, die der Wrapper selbst setzt, oder eine Prüfung auf `rtk --version` beim SessionStart mit Ergebnis-Cache. Eine Heuristik, die du nicht verifizieren kannst, gehört nicht in ein Gate.
- **Regel B (Größe) an `BASH_MAX_OUTPUT_LENGTH` koppeln** statt an einen eigenen Schwellwert. Zwei Deckel mit verschiedenen Werten sind ein Bug, der auf sein Auftreten wartet.

### R6 — MCP-Quarantäne (Konvention, kein Code)
MCP-Server nur in `.mcp.json` des Projekts, nie global. Begründung ist hart belegt `[DOKU]`: Verbindungsabbruch mitten in der Session invalidiert den Prefix, und stdio-Server sterben ohne dein Zutun.

### R7 — Ladder: Geltungsbereich einfrieren, nicht ausbauen
Deine eigene Messung sagt es deutlich: *„Die Leiter ist keine Treppe … R1 und R2 sind zwei verschiedene verlustbehaftete Sichten, nicht zwei Stufen"* `[GEMESSEN]`. Für Git- und Verzeichnisausgaben gibt es auf diesem Weg keine Zwischenstufe und wird keine geben. Der ehrliche Schritt ist, sie da zu lassen, wo sie misst (−27,2 % auf Quelltext-Strukturfragen), R3 als neuen Anwendungsfall zu geben und den toten Code (`ledger()`, `extensionOf()`) zu entfernen.

---

## 7. Was ich nicht empfehle — und warum

| Kandidat | Warum nicht |
|---|---|
| **teamchong/pxpipe** | Technisch die interessanteste Idee im Feld (Kontext als PNG, ~3,1 Zeichen pro Bild-Token statt ~1 pro Text-Token). Aber: Prefix-rewritender Proxy, Qualitätsrisiko auf Quelltext, und die 59–70 %-Rechnung hängt an Listenpreisen. Auf einem Abo zählt das Rate-Limit, nicht der Preis — die Rechnung überträgt sich nicht. |
| **lean-ctx / entroly / openwolf als Vollstack** | Jedes ersetzt deinen halben Stack. Alle drei sind Proxy + MCP + Memory in einem. Das ist ein **Plattformwechsel**, kein Baustein — nur sinnvoll als bewusster Ersatz für tokless, nie daneben. lean-ctx bringt 76 MCP-Tools mit; das ist gegen L1 gerichtet und arbeitet gleichzeitig dagegen. |
| **Mehrere Kompressoren gleichzeitig** | Weißt du selbst besser als jedes README: squeez kann vergrößern, und die Ladder ist keine Treppe. Zwei Kompressoren hintereinander sind zwei verlustbehaftete Sichten, keine zwei Stufen. |
| **claude-rolling-context** | Richtiges Argument (quadratisches Wachstum), falsche Ebene. Denselben Effekt bekommst du mit `/clear` + R4 ohne Proxy und ohne Cache-Risiko. |
| **ClawRouter / gemini-bridge** | Modell-Routing ist ein echter Hebel, aber er kollidiert frontal mit deinem eigenen Grundsatz: parallele Team-Agents im Development brauchen Opus, weil die Fehlerquote schwächerer Modelle die Ersparnis auffrisst `[GEMESSEN]`. Für Research-Subagenten bleibt es interessant. |
| **Repo-Packer (repomix, gitingest, code2prompt, yek)** | Lösen ein anderes Problem — Code in ein Chat-Fenster bringen. Bei Claude Code liest der Agent selbst; ein Packer verschlimmert L2, statt ihn zu bessern. |
| **LLMLingua / 500xCompressor** | Forschungsartefakte, LLM-basiert. Widerspricht deiner Vorgabe „automatische Kompressoren ohne LLM". |

---

## 8. Was das für dein eigenes Tool bedeutet

Du willst kein weiteres Tool im Stack, sondern ein eigenes, das Ein- und Ausgang besser löst als rtk/squeez/codegraph/context-mode/caveman. Die Landschaft sagt dazu drei Dinge:

1. **Der Ausgang (L2) ist gesättigt.** ~45 Repos, alle mit derselben Mechanik, und der Deckel liegt nachweislich bei 15–25 % des Kontexts. Dort noch ein Tool zu bauen, lohnt nicht.
2. **Der Eingang ist unbesetzt** — nicht der Eingang im Sinne von Tool-Ausgaben, sondern der **Prefix**. Ein Werkzeug, das das Skill-/Plugin-/MCP-/CLAUDE.md-Budget einer Session misst, verursachergerecht zuordnet und gegen einen Deckel fährt, gibt es außer als Teilfunktion in token-optimizer nicht. Das passt zu deiner Hook-Engine, ist cache-sicher, braucht keinen Proxy, und es ist genau der Posten, der jede Runde bezahlt wird.
3. **Der einzige echte Mehrwert auf L2 ist Dedup, nicht Kompression** — omni beweist es und macht es als einziges. Wenn du auf L2 etwas bauen willst, dann das: nicht „mach die Ausgabe kleiner", sondern „schick nicht nochmal, was schon drin ist".

---

## 9. Grenzen dieses Dokuments

- **Sternzahlen und Prozentangaben sind ungeprüft.** Ich habe READMEs gelesen, nicht Quellcode, Tests, Issues oder CI. Nach der Regel deines eigenen Research-Skills tragen README-Angaben allein keine Produktionsreife-Aussage.
- **Die 100-Token-pro-Skill-Angabe stammt aus zwei nicht klar unabhängigen Sekundärquellen.** Sie ist die Grundlage der wichtigsten Empfehlung in diesem Dokument (Ebene 0). Sie gehört zuerst gemessen — `/context` vor und nach dem Deaktivieren von 20 Skills reicht dafür.
- **Nicht geprüft:** ob token-optimizer mit deiner Nudge-Engine und claude-mem verträglich ist; ob snip/lowfat/omni sich gegenseitig oder mit rtk in die Quere kommen; ob sigmap auf deinen Repos brauchbare Karten liefert.
- **Nicht abgedeckt:** Repos ohne Topic-Tags und ohne Treffer in den geprüften Suchpfaden. Die Landschaft ist groß (941 Repos allein unter `token-optimization`); Vollständigkeit im Wortsinn ist nicht erreichbar, die relevanten Cluster sind aber abgedeckt.

---

## 10. Reihenfolge

| # | Schritt | Aufwand | Erwarteter Hebel |
|---|---|---|---|
| 1 | `/context` messen, Skills von ~290 auf <40 kürzen, erneut messen | 1 h | **hoch** |
| 2 | tokless-CLAUDE.md auf Belegtes kürzen | 30 min | mittel-hoch |
| 3 | Native Deckel in settings.json setzen | 15 min | mittel |
| 4 | token-optimizer einmal als Audit fahren | 1 h | Erkenntnis |
| 5 | R1 (prefix-budget) + R4 (session-economy) bauen | halber Tag | hoch |
| 6 | squeez-Kette gegen lowfat/snip tauschen, gepaart messen | 1 Tag | mittel |
| 7 | R2/R3 (Read-Pfad) + sigmap als CLI | 1 Tag | mittel-hoch |
| 8 | omni testen (Dedup) | halber Tag | offen |

Die ersten drei Schritte kosten unter zwei Stunden, brauchen kein einziges neues Repo und adressieren die Ebene, auf der die gesamte gefundene Landschaft nicht arbeitet.
