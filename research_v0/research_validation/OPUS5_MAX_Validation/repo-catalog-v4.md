# Repo-Katalog v4 — Token-Minimierung für Claude Code

**Stand:** 2026-08-13 · **376 Repositories** · Union aus fünf Agent-Ausgaben, angereichert um eigene Messungen

Sterne, letzter Commit, Lizenz und Erreichbarkeit sind **am 13.08.2026 selbst gemessen** (HTTP-Scrape der Repo-Seite und des Commit-Atom-Feeds) — nicht aus READMEs oder Agent-Angaben übernommen.

## Legende

| Spalte | Bedeutung |
|---|---|
| **T** | Aktivitäts-Tier: **A** ≤30 Tage · **B** 31–90 Tage · **C** >90 Tage · **F** Lizenz-Fence · **X** tot/archiviert/>1 Jahr |
| **★** | Sterne (gemessen) |
| **d** | Tage seit letztem Commit (gemessen) |
| **Gefunden von** | AB=ABACUS · GP=GPT55SOL · KI=KIMI · MA=MANUS · OP=OPUS5 |
| **Urteil** | Kurzurteil aus OPUS5-Katalog bzw. KIMI-Matrix |

Lizenz-Fence = Elastic 2.0, PolyForm Noncommercial, AGPL, SSPL oder BUSL — für dienstliche/kommerzielle Nutzung gesondert prüfen.

## Schicht 0 Messung & Observability  (12)

| T | Repo | ★ | d | Lizenz | Gefunden von | Urteil |
|---|---|---:|---:|---|---|---|
| A | [getagentseal/codeburn](https://github.com/getagentseal/codeburn) | 9283 | 1 | MIT | AB GP KI MA OP | Optional |
| A | [stormzhang/token-tracker](https://github.com/stormzhang/token-tracker) | 485 | 3 | MIT | KI | 🔵 |
| A | [nikitadoudikov/claude-pulse](https://github.com/nikitadoudikov/claude-pulse) | 244 | 25 | MIT | AB GP KI MA OP | Optional |
| A | [mag123c/toktrack](https://github.com/mag123c/toktrack) | 184 | 2 | MIT | KI | 🔵 |
| A | [egorfedorov/claude-context-optimizer](https://github.com/egorfedorov/claude-context-optimizer) | 92 | 2 | MIT | KI | 🔵 (explorativ, in awesome-claude-code gelistet) |
| A | [ncoevoet/claude-markdown-health-check](https://github.com/ncoevoet/claude-markdown-health-check) | 39 | 1 | MIT | KI | 🔵 |
| A | [Terse-AI/terseai](https://github.com/Terse-AI/terseai) | 14 | 22 | — | GP OP | Kommerzielles Zusatzprodukt |
| A | [3rg0n/thlibo](https://github.com/3rg0n/thlibo) | 9 | 8 | MIT | KI | 🔵 (Architektur-Referenz) |
| B | [Maciek-roboblog/Claude-Code-Usage-Monitor](https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor) | 8623 | 47 | MIT | KI | 🟡 |
| C | [disler/claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability) | 1513 | 186 | — | AB GP KI MA OP | Optional |
| C | [onikan27/claude-code-monitor](https://github.com/onikan27/claude-code-monitor) | 298 | 196 | MIT | AB GP KI MA OP | Optional |
| C | [Growth4U-systems/claude-token-hygiene](https://github.com/Growth4U-systems/claude-token-hygiene) | 10 | 161 | MIT | KI | 🔵 |

## Schicht 1 Prefix / Systemprompt  (14)

| T | Repo | ★ | d | Lizenz | Gefunden von | Urteil |
|---|---|---:|---:|---|---|---|
| A | [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | 52222 | 0 | — | KI | ✅ (Discovery) |
| A | [nadimtuhin/claude-token-optimizer](https://github.com/nadimtuhin/claude-token-optimizer) | 550 | 2 | MIT | AB OP | Adjacent |
| A | [valorisa/Claude-Skills](https://github.com/valorisa/Claude-Skills) | 4 | 6 | MIT | KI | 🟡 |
| A | [CoderDayton/semantic-cache-mcp](https://github.com/CoderDayton/semantic-cache-mcp) | 2 | 16 | MIT | KI | 🔵 (früh) |
| A | [JanBancerewicz/context-cost-guard](https://github.com/JanBancerewicz/context-cost-guard) | 2 | 2 | MIT | KI | 🔵 |
| B | [drona23/claude-token-efficient](https://github.com/drona23/claude-token-efficient) | 5940 | 58 | MIT | AB OP | Optional |
| B | [0xhimanshu/governor](https://github.com/0xhimanshu/governor) | 127 | 54 | MIT | KI | 🟡 |
| B | [YoraiLevi/claude-command-policy](https://github.com/YoraiLevi/claude-command-policy) | 0 | 48 | — | KI | ✅ (Guard-Design) |
| C | [disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery) | 3886 | 193 | — | KI | ✅ (Doku) |
| C | [glincker/stacklit](https://github.com/glincker/stacklit) | 101 | 98 | MIT | KI | 🔵 |
| C | [emanueleielo/compact-middleware](https://github.com/emanueleielo/compact-middleware) | 44 | 128 | MIT | KI | 🔵 (Defaults-Referenz) |
| C | [ithiria894/awesome-claude-code-hooks](https://github.com/ithiria894/awesome-claude-code-hooks) | 20 | 142 | — | KI | 🔵 |
| X | [zilliztech/GPTCache](https://github.com/zilliztech/GPTCache) | 8130 | 398 | MIT | KI | 🔵 (generisch) |
| X | [oxygen-fragment/claude-modular](https://github.com/oxygen-fragment/claude-modular) | 285 | 393 | MIT | OP | Adjacent |

## Schicht 2 MCP / Tool-Definitionen  (23)

| T | Repo | ★ | d | Lizenz | Gefunden von | Urteil |
|---|---|---:|---:|---|---|---|
| A | [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) | 105748 | 1 | Apache-2.0 | KI | 🟡 |
| A | [headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom) | 66111 | 0 | Apache-2.0 | AB GP KI MA OP | Proxy-Plattform / separater Benchmarkarm |
| A | [maximhq/bifrost](https://github.com/maximhq/bifrost) | 7274 | 1 | Apache-2.0 | KI | 🟡 (Enterprise) |
| A | [yvgude/lean-ctx](https://github.com/yvgude/lean-ctx) | 3570 | 1 | Apache-2.0 | OP | Plattformwechsel, kein Baustein |
| A | [Houseofmvps/codesight](https://github.com/Houseofmvps/codesight) | 1337 | 17 | MIT | GP OP | Interessante statische Alternative |
| A | [Paritok-official/paritok-4b-v1](https://github.com/Paritok-official/paritok-4b-v1) | 1120 | 1 | Apache-2.0 | KI | 🟡 (spannend, jung) |
| A | [rtk-ai/icm](https://github.com/rtk-ai/icm) | 525 | 16 | Apache-2.0 | GP OP | Interessante gemeinsame Memory-Schicht |
| A | [ooples/token-optimizer-mcp](https://github.com/ooples/token-optimizer-mcp) | 479 | 1 | MIT | AB GP KI OP | Selektives Profil |
| A | [juyterman1000/entroly](https://github.com/juyterman1000/entroly) | 435 | 1 | Apache-2.0 | GP KI OP | High-potential experiment |
| A | [elara-labs/code-context-engine](https://github.com/elara-labs/code-context-engine) | 393 | 1 | MIT | GP OP | Alternative |
| A | [atlassian-labs/mcp-compressor](https://github.com/atlassian-labs/mcp-compressor) | 106 | 16 | Apache-2.0 | KI | 🟡 |
| A | [IterateAI/compression](https://github.com/IterateAI/compression) | 9 | 29 | Apache-2.0.txt | GP OP | Proprietärer separater Benchmarkarm |
| A | [scaledown-team/DietCode](https://github.com/scaledown-team/DietCode) | 2 | 8 | GPL-3.0 | KI | 🔵 |
| A | [NodeNestor/nestor-lean](https://github.com/NodeNestor/nestor-lean) → `NodeNestor/claude-lean-context` | 1 | 2 | MIT | GP OP | Sehr starke monolithische Alternative |
| A | [Open330/context-compress](https://github.com/Open330/context-compress) | 1 | 16 | MIT | KI | 🔵 |
| A | [fuzzyqbit/mrclean](https://github.com/fuzzyqbit/mrclean) | 0 | 25 | MIT | GP OP | Angrenzende Security-Schicht |
| B | [pro-vi/mcp-filter](https://github.com/pro-vi/mcp-filter) | 54 | 34 | MIT | GP OP | Bedingt |
| B | [yoeld-wix/quiet-bash](https://github.com/yoeld-wix/quiet-bash) | 5 | 38 | MIT | GP OP | Recoverable Turnkey-Favorit |
| C | [elusznik/mcp-server-code-execution-mode](https://github.com/elusznik/mcp-server-code-execution-mode) | 337 | 251 | GPL-3.0 | OP | L1-Kandidat |
| C | [microsoft/acon](https://github.com/microsoft/acon) | 100 | 303 | MIT | KI | 🔵 (Referenz) |
| C | [MarceloCaporale/codex-agent-mem](https://github.com/MarceloCaporale/codex-agent-mem) | 34 | 98 | Apache-2.0 | OP | Optional |
| C | [micoverde/taac-llm-compression](https://github.com/micoverde/taac-llm-compression) | 0 | 180 | MIT License | KI | 🔵 |
| F | [alexgreensh/token-optimizer](https://github.com/alexgreensh/token-optimizer) | 1860 | 1 | PolyForm Noncommercial 1.0.0 | GP OP | Auditprofil / nicht Lean-Core |

## Schicht 3 Bash- / Tool-Output  (33)

| T | Repo | ★ | d | Lizenz | Gefunden von | Urteil |
|---|---|---:|---:|---|---|---|
| A | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | 97836 | 0 | MIT | AB GP KI MA OP | Nur Lite-Regel |
| A | [rtk-ai/rtk](https://github.com/rtk-ai/rtk) | 75937 | 0 | Apache-2.0 | AB GP KI OP | Starker Wrapper/Filterbaustein, nicht parallel |
| A | [chopratejas/headroom](https://github.com/chopratejas/headroom) → `headroomlabs-ai/headroom` | 66111 | 0 | Apache-2.0 | AB GP KI OP | Durch headroomlabs ersetzen |
| A | [teamchong/pxpipe](https://github.com/teamchong/pxpipe) | 7070 | 2 | MIT | AB GP KI OP | Nicht für Coding-Default |
| A | [jfrog/boost](https://github.com/jfrog/boost) | 436 | 2 | — | GP OP | Starker Benchmarkkandidat unter Preview-Bedingungen |
| A | [edouard-claude/snip](https://github.com/edouard-claude/snip) | 406 | 9 | MIT | AB GP KI MA OP | Filterquelle / Alternative |
| A | [fkiene/llmtrim](https://github.com/fkiene/llmtrim) | 208 | 1 | MPL-2.0 | AB GP KI OP | Experimentell |
| A | [claudioemmanuel/squeez](https://github.com/claudioemmanuel/squeez) | 182 | 1 | Apache-2.0 | AB GP KI MA OP | Capability-gated Turnkey-Alternative |
| A | [ppgranger/token-saver](https://github.com/ppgranger/token-saver) | 136 | 3 | Apache-2.0 | GP KI OP | Filterquelle / Alternative |
| A | [PCIRCLE-AI/toonify-mcp](https://github.com/PCIRCLE-AI/toonify-mcp) | 64 | 1 | MIT | AB GP KI OP | Aktuellen Hook meiden |
| A | [kurovu146/kuro-lean](https://github.com/kurovu146/kuro-lean) | 15 | 3 | MIT | KI | 🔵 |
| A | [giuliastro/HarnessTrim](https://github.com/giuliastro/HarnessTrim) | 12 | 6 | MIT | GP OP | Starke Referenz und expliziter Fallback |
| A | [iceHub82/beeline](https://github.com/iceHub82/beeline) | 7 | 9 | MIT | KI | 🔵 |
| A | [guyoron1/costwise](https://github.com/guyoron1/costwise) | 2 | 1 | — | KI | 🔵 |
| A | [ZizzX/claude-output-trim](https://github.com/ZizzX/claude-output-trim) | 2 | 24 | MIT | GP OP | Kleine Referenz / optionaler Guard-Ersatz |
| A | [dbuzatto/token-diet](https://github.com/dbuzatto/token-diet) | 0 | 7 | MIT | GP OP | Wichtige Runtime-Evidenz / Alternative |
| A | [fantastic-interpolation620/ctx-wire](https://github.com/fantastic-interpolation620/ctx-wire) | 0 | 1 | MIT | KI | 🔵 |
| A | [Guazzihub/Sieve](https://github.com/Guazzihub/Sieve) | 0 | 30 | MIT | KI | 🔵 |
| A | [sphragis-oss/isthmos](https://github.com/sphragis-oss/isthmos) | 0 | 12 | Apache-2.0 | KI | 🔵 |
| A | [vliggio/claude-faa-speak](https://github.com/vliggio/claude-faa-speak) | 0 | 20 | MIT | KI | 🔵 (Kuriosität) |
| A | [wasdevv/lean-output](https://github.com/wasdevv/lean-output) | 0 | 6 | MIT | KI | 🔵 (Ruby) |
| B | [vincentkoc/tokenjuice](https://github.com/vincentkoc/tokenjuice) | 501 | 56 | MIT | GP OP | Breite Cross-Harness-Alternative |
| B | [bitan-del/zap](https://github.com/bitan-del/zap) | 274 | 80 | Apache-2.0 | GP OP | Neue leichte RTK-Alternative |
| B | [AgusRdz/chop](https://github.com/AgusRdz/chop) | 42 | 59 | MIT | GP OP | Sekundäre Alternative |
| B | [AndVl1/gw](https://github.com/AndVl1/gw) | 4 | 49 | MIT | KI | 🔵 (JVM) |
| B | [johnsnow1011/taxman](https://github.com/johnsnow1011/taxman) | 3 | 41 | MIT | KI | 🔵 |
| B | [phuetz/lm-resizer](https://github.com/phuetz/lm-resizer) | 2 | 42 | Apache-2.0 | KI | 🔵 |
| B | [JoonasAaltonen/claude-optimizer](https://github.com/JoonasAaltonen/claude-optimizer) | 0 | 87 | — | KI | 🔵 |
| C | [abhisekjha/pith](https://github.com/abhisekjha/pith) | 97 | 99 | MIT | GP OP | Derzeit nicht übernehmen |
| C | [chopratejas/headroom-zed](https://github.com/chopratejas/headroom-zed) | 59 | 148 | Apache License 2.0 | OP | Nicht Core |
| C | [carlosduplar/caveman-output-style-claude-code](https://github.com/carlosduplar/caveman-output-style-claude-code) | 17 | 99 | MIT | KI | 🔵 |
| C | [helmif/wafi](https://github.com/helmif/wafi) | 0 | 114 | MIT © Helmi Fauzi | KI | 🔵 |
| F | [The-Distillery-dev/thedistillery](https://github.com/The-Distillery-dev/thedistillery) | 104 | 32 | Elastic License 2.0 | GP OP | Separater kommerziell/governed Proxyarm |

## Schicht 4 Read / Code-Retrieval  (26)

| T | Repo | ★ | d | Lizenz | Gefunden von | Urteil |
|---|---|---:|---:|---|---|---|
| A | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | 66154 | 5 | MIT | AB GP KI MA OP | Lean-Retrieval-Favorit |
| A | [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | 38730 | 1 | MIT | GP KI OP | Advanced-Retrieval-Favorit |
| A | [deusdata/codebase-memory-mcp](https://github.com/deusdata/codebase-memory-mcp) | 38730 | 1 | MIT | AB KI MA | Advanced-Retrieval-Favorit |
| A | [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) | 29944 | 11 | MIT | AB GP KI MA OP | Spezialprofil |
| A | [oraios/serena](https://github.com/oraios/serena) | 27939 | 1 | MIT | KI | ✅ (für Edit-Workflows) |
| A | [zilliztech/claude-context](https://github.com/zilliztech/claude-context) | 12388 | 30 | MIT | AB GP KI MA OP | Mature alternative |
| A | [jgravelle/jcodemunch-mcp](https://github.com/jgravelle/jcodemunch-mcp) | 2548 | 0 | — | GP KI OP | Spezialalternative |
| A | [manojmallick/sigmap](https://github.com/manojmallick/sigmap) | 615 | 16 | MIT | AB GP KI OP | On-demand only |
| A | [aovestdipaperino/tokensave](https://github.com/aovestdipaperino/tokensave) | 571 | 5 | — | OP | Pilot (OPUS5 Stufe 4) |
| A | [mpecan/tokf](https://github.com/mpecan/tokf) | 192 | 5 | MIT | GP KI OP | Starke Bash-Alternative |
| A | [sdsrss/code-graph-mcp](https://github.com/sdsrss/code-graph-mcp) | 61 | 10 | MIT | KI | 🔵 |
| A | [hansipie/ecotokens](https://github.com/hansipie/ecotokens) | 18 | 15 | MIT | GP KI OP | Bash-Filter nur nach Trennung |
| A | [ctxlite/ctxlite](https://github.com/ctxlite/ctxlite) | 7 | 27 | — | GP OP | Interessant, aber Überschneidungsprofil |
| A | [cmillstead/codesight-mcp](https://github.com/cmillstead/codesight-mcp) | 1 | 19 | MIT | KI | 🔵 |
| A | [ryanportfolio/STK](https://github.com/ryanportfolio/STK) | 1 | 0 | MIT | KI | 🔵 |
| A | [kmizu/token-saver-plugin](https://github.com/kmizu/token-saver-plugin) | 0 | 7 | — | GP OP | High-potential monolithischer Pilot |
| B | [HKUDS/FastCode](https://github.com/HKUDS/FastCode) | 2285 | 38 | — | GP OP | Research-/Advanced-Retrieval-Kandidat |
| B | [zdk/lowfat](https://github.com/zdk/lowfat) | 566 | 36 | Apache-2.0 | GP OP | Lean-Alternative |
| B | [dereira/goldfish](https://github.com/dereira/goldfish) | 2 | 41 | MIT | KI | 🔵 |
| B | [jaredboynton/semtrim](https://github.com/jaredboynton/semtrim) | 0 | 41 | MIT | GP OP | Konservativer Wrapper-Favorit |
| C | [ericbuess/claude-code-project-index](https://github.com/ericbuess/claude-code-project-index) | 196 | 337 | MIT | GP OP | On-demand / Beta |
| C | [zippoxer/recall](https://github.com/zippoxer/recall) | 194 | 211 | MIT | AB GP MA OP | Nützliche Retrieval-Utility |
| C | [Madhan230205/token-reducer](https://github.com/Madhan230205/token-reducer) | 42 | 104 | MIT | AB GP KI OP | Experimentell |
| F | [mksglu/context-mode](https://github.com/mksglu/context-mode) | 19834 | 1 | Elastic License 2.0 | AB GP KI OP | External-Data-Favorit, native Flächen ausschließen |
| F | [ojuschugh1/sqz](https://github.com/ojuschugh1/sqz) | 593 | 53 | Elastic License 2.0 | AB GP KI OP | Alternative |
| F | [castnettech/mnemosyne](https://github.com/castnettech/mnemosyne) | 60 | 128 | AGPL-3.0 | OP | Optional |

## Schicht 5 Session / Memory  (48)

| T | Repo | ★ | d | Lizenz | Gefunden von | Urteil |
|---|---|---:|---:|---|---|---|
| A | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | 90575 | 3 | Apache-2.0 | AB GP KI MA OP | Optionales Memory-Profil |
| A | [ruvnet/ruflo](https://github.com/ruvnet/ruflo) | 67752 | 1 | MIT | AB GP KI MA OP | Nicht Token-Core |
| A | [MemPalace/mempalace](https://github.com/MemPalace/mempalace) | 58331 | 0 | MIT | KI | Optional |
| A | [mempalace/mempalace](https://github.com/mempalace/mempalace) | 58331 | 0 | MIT | AB GP KI MA OP | Optional |
| A | [toon-format/toon](https://github.com/toon-format/toon) | 25145 | 6 | MIT | AB GP KI MA OP | Bedingte Transformation |
| A | [zilliztech/memsearch](https://github.com/zilliztech/memsearch) | 2458 | 1 | MIT | AB GP KI MA OP | Optional |
| A | [specstoryai/getspecstory](https://github.com/specstoryai/getspecstory) | 1297 | 1 | Apache-2.0 | AB GP MA OP | Offline/optional |
| A | [kbwo/ccmanager](https://github.com/kbwo/ccmanager) | 1218 | 3 | MIT | AB GP MA OP | Nicht Core |
| A | [Mibayy/token-savior](https://github.com/Mibayy/token-savior) | 1113 | 3 | MIT | KI | Breites Alternativprofil |
| A | [mibayy/token-savior](https://github.com/mibayy/token-savior) | 1113 | 3 | MIT | AB GP KI MA OP | Breites Alternativprofil |
| A | [es617/claude-replay](https://github.com/es617/claude-replay) | 801 | 4 | MIT | AB GP MA OP | Offline utility |
| A | [fajarhide/omni](https://github.com/fajarhide/omni) | 320 | 0 | Apache-2.0 | GP OP | Einziger Dedup-Mechanismus im Feld |
| A | [ramakay/claude-self-reflect](https://github.com/ramakay/claude-self-reflect) | 221 | 4 | MIT | AB GP KI MA OP | Optional |
| A | [aerovato/magic-compact](https://github.com/aerovato/magic-compact) | 134 | 1 | BSD-3-Clause | GP KI OP | Bevorzugter manueller Long-Session-Pilot |
| A | [DFKHelper/token-goat](https://github.com/DFKHelper/token-goat) | 83 | 1 | — | GP OP | Breiter Monolith / Lizenz- und Claim-Audit nötig |
| A | [diegosouzapw/OmniGlyph](https://github.com/diegosouzapw/OmniGlyph) | 78 | 20 | MIT | KI | ⚠️ (gleiche Risikoklasse) |
| A | [Capnjbrown/c0ntextKeeper](https://github.com/Capnjbrown/c0ntextKeeper) | 62 | 14 | MIT | KI | 🟡 |
| A | [sergioramosv/squeezr](https://github.com/sergioramosv/squeezr) | 34 | 23 | MIT | KI | 🔵 |
| A | [NodeNestor/claude-rolling-context](https://github.com/NodeNestor/claude-rolling-context) | 27 | 1 | MIT | AB GP KI OP | Optional für sehr lange Sessions |
| A | [alibaizhanov/densely](https://github.com/alibaizhanov/densely) | 6 | 1 | MIT | KI | 🔵 |
| A | [omar-y-abdi/furl-ctx](https://github.com/omar-y-abdi/furl-ctx) | 3 | 1 | Apache-2.0 | KI | 🔵 |
| A | [rupaut98/unforget](https://github.com/rupaut98/unforget) | 3 | 14 | MIT | KI | 🔵 |
| A | [ahmadkassem511/TokenSnap](https://github.com/ahmadkassem511/TokenSnap) | 0 | 30 | Apache-2.0 | KI | 🔵 |
| A | [g4itpl/clear-nudge](https://github.com/g4itpl/clear-nudge) | 0 | 2 | MIT | KI | 🔵 |
| B | [lucasrosati/claude-code-memory-setup](https://github.com/lucasrosati/claude-code-memory-setup) | 931 | 73 | MIT | OP | Optional |
| B | [Compresr-ai/Context-Gateway](https://github.com/Compresr-ai/Context-Gateway) | 631 | 59 | Apache-2.0 | AB GP KI MA OP | Depriorisiert |
| B | [EliaAlberti/cpr-compress-preserve-resume](https://github.com/EliaAlberti/cpr-compress-preserve-resume) | 487 | 83 | MIT | GP OP | Einfache State-/Handoff-Referenz |
| B | [Context-Engine-AI/Context-Engine](https://github.com/Context-Engine-AI/Context-Engine) | 400 | 36 | MIT | GP OP | Kein Open-Source-Core mehr |
| B | [Ruya-AI/cozempic](https://github.com/Ruya-AI/cozempic) | 369 | 41 | MIT | GP OP | Isoliertes Langzeitexperiment |
| B | [LearnPrompt/cc-harness-skills](https://github.com/LearnPrompt/cc-harness-skills) | 234 | 34 | MIT | OP | Adjacent |
| B | [codejunkie99/ztk](https://github.com/codejunkie99/ztk) | 206 | 41 | MIT | GP OP | Interessante ultraleichte Alternative |
| B | [SonicBotMan/lobster-press](https://github.com/SonicBotMan/lobster-press) | 48 | 62 | MIT | OP | Long-tail experiment |
| B | [Anuj7411/sipcode](https://github.com/Anuj7411/sipcode) | 46 | 40 | MIT | GP OP | Neue monolithische Turnkey-Alternative |
| B | [DJLougen/hive](https://github.com/DJLougen/hive) | 36 | 45 | MIT | OP | Long-tail experiment |
| B | [carlosduplar/claude-code-optimizer](https://github.com/carlosduplar/claude-code-optimizer) | 5 | 85 | — | GP OP | Audit-/Regelquelle, nicht blind installieren |
| B | [micaelmalta/token-crunch](https://github.com/micaelmalta/token-crunch) | 2 | 86 | — | GP OP | Interessantes Forschungs-/Pilotprofil |
| B | [Jagganu/context-slim](https://github.com/Jagganu/context-slim) | 1 | 50 | MIT | GP OP | Long-tail / ehrliche kleine Referenz |
| B | [smdysk/cc-parachute](https://github.com/smdysk/cc-parachute) | 0 | 35 | MIT | KI | 🔵 |
| C | [open-compress/claw-compactor](https://github.com/open-compress/claw-compactor) | 2111 | 134 | MIT | AB GP KI MA OP | Bibliothek / Filterquelle |
| C | [L1AD/claude-task-viewer](https://github.com/L1AD/claude-task-viewer) | 703 | 180 | MIT | AB GP MA OP | Adjacent |
| C | [GMaN1911/claude-cognitive](https://github.com/GMaN1911/claude-cognitive) | 449 | 208 | MIT | OP | Optional |
| C | [IyadhKhalfallah/clauditor](https://github.com/IyadhKhalfallah/clauditor) | 424 | 119 | MIT | GP OP | Muster fuer eigenen Waechter |
| C | [severity1/claude-code-auto-memory](https://github.com/severity1/claude-code-auto-memory) | 155 | 117 | MIT | AB GP KI MA OP | Vorsichtig |
| C | [exploreborders/claude-dcp](https://github.com/exploreborders/claude-dcp) | 15 | 126 | MIT | GP OP | Advanced experimental |
| F | [cytostack/openwolf](https://github.com/cytostack/openwolf) | 2184 | 29 | AGPL-3.0 | OP | Turnkey-Alternative |
| F | [AshishKumar4/better-compact](https://github.com/AshishKumar4/better-compact) | 6 | 0 | AGPL-3.0-or-later | GP OP | Advanced experimental |
| X | [iannuttall/claude-sessions](https://github.com/iannuttall/claude-sessions) | 1211 | 423 | MIT | AB GP MA OP | Optional |
| X | [snu-mllab/Context-Memory](https://github.com/snu-mllab/Context-Memory) | 63 | 847 | MIT | OP | Research/experiment |

## Schicht 6 Formate  (3)

| T | Repo | ★ | d | Lizenz | Gefunden von | Urteil |
|---|---|---:|---:|---|---|---|
| A | [Lap-Platform/LAP](https://github.com/Lap-Platform/LAP) | 345 | 14 | Apache-2.0 | OP | Optional |
| A | [Barnett-Studios/cxpak](https://github.com/Barnett-Studios/cxpak) | 25 | 6 | Apache-2.0 | KI | 🔵 |
| B | [sheikhsajid69/toon-skill](https://github.com/sheikhsajid69/toon-skill) | 2 | 41 | MIT | KI | 🔵 |

## Schicht 7 Proxy / Routing / Cache  (18)

| T | Repo | ★ | d | Lizenz | Gefunden von | Urteil |
|---|---|---:|---:|---|---|---|
| A | [BerriAI/litellm](https://github.com/BerriAI/litellm) | 56216 | 0 | — | KI | 🟡 (Enterprise) |
| A | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | 46738 | 0 | MIT | KI | 🟡 |
| A | [musistudio/claude-code-router](https://github.com/musistudio/claude-code-router) | 36615 | 3 | MIT | KI | ✅ (wo Routing gewünscht) |
| A | [decolua/9router](https://github.com/decolua/9router) | 25326 | 8 | MIT | GP OP | Routing, kein eigener Reducer |
| A | [BlockRunAI/ClawRouter](https://github.com/BlockRunAI/ClawRouter) | 6613 | 1 | MIT | AB GP KI OP | Kostenrouting-Option |
| A | [gglucass/headroom-desktop](https://github.com/gglucass/headroom-desktop) | 507 | 1 | MIT | OP | Nicht Core |
| A | [cnighswonger/claude-code-cache-fix](https://github.com/cnighswonger/claude-code-cache-fix) | 414 | 6 | MIT | AB GP KI MA OP | Nur bei gemessenem Cachefehler |
| A | [sliday/tamp](https://github.com/sliday/tamp) | 88 | 18 | — | GP OP | Konservativer Proxy-Pilot |
| A | [ypollak2/llm-router](https://github.com/ypollak2/llm-router) | 67 | 8 | MIT | KI | 🔵 |
| A | [frsorrentino/fable-director](https://github.com/frsorrentino/fable-director) | 4 | 2 | MIT | KI | 🔵 |
| B | [numman-ali/cc-mirror](https://github.com/numman-ali/cc-mirror) | 2257 | 74 | MIT | AB GP MA OP | Routing/experimentation |
| B | [borhen68/TokenTamer](https://github.com/borhen68/TokenTamer) | 128 | 59 | MIT | OP | Nicht Core |
| B | [shouvik12/trooper](https://github.com/shouvik12/trooper) | 34 | 56 | MIT | OP | Nicht Core |
| B | [agiwhitelist/tokdiet](https://github.com/agiwhitelist/tokdiet) | 33 | 56 | MIT | AB GP KI OP | Bevorzugter Proxy-Pilot |
| B | [suenot/claude-code-token-savers](https://github.com/suenot/claude-code-token-savers) | 0 | 32 | MIT | GP OP | Nicht blind installieren |
| C | [flightlesstux/prompt-caching](https://github.com/flightlesstux/prompt-caching) | 132 | 153 | MIT | GP KI OP | Nicht als Claude-Code-Sparer |
| C | [xelektron/token-enhancer](https://github.com/xelektron/token-enhancer) | 66 | 132 | MIT | GP OP | Bedingtes Webprofil |
| C | [pythondatascrape/engram](https://github.com/pythondatascrape/engram) | 17 | 99 | — | GP OP | Experimentell |

## Schicht 8 Verhalten / Skills  (22)

| T | Repo | ★ | d | Lizenz | Gefunden von | Urteil |
|---|---|---:|---:|---|---|---|
| A | [garrytan/gstack](https://github.com/garrytan/gstack) | 127735 | 1 | MIT | AB GP KI MA OP | Produktivitätsstack, nicht Token-Core |
| A | [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | 24363 | 27 | MIT | AB GP MA OP | Nicht Core |
| A | [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) | 20040 | 3 | MIT | AB GP MA OP | Adjacent |
| A | [KKKKhazix/khazix-skills](https://github.com/KKKKhazix/khazix-skills) | 19605 | 2 | MIT | AB GP MA OP | Nicht Core |
| A | [Piebald-AI/claude-code-system-prompts](https://github.com/Piebald-AI/claude-code-system-prompts) | 12272 | 1 | MIT | AB GP KI MA OP | Audit-/Researchquelle |
| A | [xingkongliang/skills-manager](https://github.com/xingkongliang/skills-manager) | 3701 | 1 | MIT | AB GP MA OP | Nicht Core |
| A | [runkids/skillshare](https://github.com/runkids/skillshare) | 2538 | 3 | MIT | AB GP MA OP | Nicht Core |
| A | [chujianyun/skills](https://github.com/chujianyun/skills) | 718 | 16 | — | AB GP MA OP | Nicht Core |
| A | [inference-sh/skills](https://github.com/inference-sh/skills) | 694 | 10 | — | AB GP MA OP | Nicht Core |
| A | [happycapy-ai/Happycapy-skills](https://github.com/happycapy-ai/Happycapy-skills) | 137 | 23 | MIT | AB GP MA OP | Selective |
| A | [Kir93/scrooge-mode](https://github.com/Kir93/scrooge-mode) | 4 | 7 | MIT | GP OP | Long-tail / Regelquelle |
| B | [Orchestra-Research/AI-research-SKILLs](https://github.com/Orchestra-Research/AI-research-SKILLs) | 11651 | 58 | MIT | AB GP MA OP | Nicht Core |
| B | [nidhinjs/prompt-master](https://github.com/nidhinjs/prompt-master) | 11124 | 64 | MIT | AB GP MA OP | On-demand |
| B | [mufeedvh/code2prompt](https://github.com/mufeedvh/code2prompt) | 7597 | 56 | MIT | AB GP KI OP | On-demand packer |
| B | [kayba-ai/agentic-context-engine](https://github.com/kayba-ai/agentic-context-engine) | 2550 | 65 | Apache-2.0 | GP OP | Lernschicht, nicht primärer Kompressor |
| B | [severity1/claude-code-prompt-improver](https://github.com/severity1/claude-code-prompt-improver) | 1851 | 71 | MIT | AB GP KI MA OP | Bedingt |
| B | [awesomo913/Claude-Token-Saver](https://github.com/awesomo913/Claude-Token-Saver) | 16 | 53 | MIT | OP | Nicht Core |
| C | [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | 201965 | 115 | MIT | AB GP KI OP | Selective |
| C | [microsoft/LLMLingua](https://github.com/microsoft/LLMLingua) | 6551 | 289 | MIT | AB GP KI OP | Research-/L5-Baustein |
| C | [coleam00/second-brain-skills](https://github.com/coleam00/second-brain-skills) | 813 | 201 | — | AB GP MA OP | Selective |
| C | [gladehq/claude-shorthand](https://github.com/gladehq/claude-shorthand) | 5 | 150 | MIT | GP OP | Nicht funktionsfähig im aktuellen Vertrag |
| X | [simonw/files-to-prompt](https://github.com/simonw/files-to-prompt) | 2774 | 540 | Apache-2.0 | AB GP KI OP | On-demand utility |

## Schicht 9 Sonstige / unbewertet  (177)

| T | Repo | ★ | d | Lizenz | Gefunden von | Urteil |
|---|---|---:|---:|---|---|---|
| A | [anthropics/claude-code](https://github.com/anthropics/claude-code) | 141266 | 1 | — | KI |  |
| A | [github/spec-kit](https://github.com/github/spec-kit) | 126576 | 1 | MIT | AB GP MA OP | Process tool |
| A | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 116181 | 1 | MIT | AB MA |  |
| A | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | 101665 | 6 | MIT | AB GP KI OP | Policy-Favorit |
| A | [earendil-works/pi](https://github.com/earendil-works/pi) | 88835 | 1 | MIT | AB GP KI MA OP | Reference/alternative |
| A | [nexu-io/open-design](https://github.com/nexu-io/open-design) | 85402 | 0 | Apache-2.0 | AB MA |  |
| A | [lobehub/lobehub](https://github.com/lobehub/lobehub) | 81621 | 0 | — | AB MA |  |
| A | [luongnv89/claude-howto](https://github.com/luongnv89/claude-howto) | 40999 | 7 | MIT | AB MA |  |
| A | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | 33467 | 0 | Apache-2.0 | KI |  |
| A | [yamadashy/repomix](https://github.com/yamadashy/repomix) | 27803 | 2 | MIT | AB GP KI MA OP | On-demand packer |
| A | [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) | 26941 | 4 | Apache-2.0 | KI |  |
| A | [Kilo-Org/kilocode](https://github.com/Kilo-Org/kilocode) | 26839 | 1 | MIT | KI |  |
| A | [OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files) | 26135 | 4 | MIT | AB GP KI MA OP | Core-geeignete State-Schicht |
| A | [slopus/happy](https://github.com/slopus/happy) | 23311 | 3 | MIT | AB GP MA OP | Nicht Core |
| A | [coleam00/Archon](https://github.com/coleam00/Archon) | 23168 | 1 | MIT | AB GP MA OP | Adjacent |
| A | [steipete/CodexBar](https://github.com/steipete/CodexBar) | 20017 | 0 | MIT | AB GP KI MA OP | Optionales UI |
| A | [pingdotgg/t3code](https://github.com/pingdotgg/t3code) | 18470 | 0 | MIT | AB GP MA OP | Nicht Core |
| A | [ccusage/ccusage](https://github.com/ccusage/ccusage) | 17888 | 0 | MIT | AB GP KI MA OP | Empfohlenes Messwerkzeug |
| A | [microsoft/agent-framework](https://github.com/microsoft/agent-framework) | 12758 | 0 | MIT | KI |  |
| A | [AgriciDaniel/claude-obsidian](https://github.com/AgriciDaniel/claude-obsidian) | 10813 | 12 | MIT | AB GP MA OP | Optional |
| A | [Kuberwastaken/claurst](https://github.com/Kuberwastaken/claurst) | 10235 | 13 | GPL-3.0 | AB KI MA |  |
| A | [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action) | 8610 | 1 | MIT | AB MA |  |
| A | [uditgoenka/autoresearch](https://github.com/uditgoenka/autoresearch) | 5822 | 1 | MIT | AB MA |  |
| A | [FlorianBruniaux/claude-code-ultimate-guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide) | 5714 | 7 | — | KI |  |
| A | [tradesdontlie/tradingview-mcp](https://github.com/tradesdontlie/tradingview-mcp) | 5654 | 16 | — | AB MA |  |
| A | [saladday/cc-switch-cli](https://github.com/saladday/cc-switch-cli) | 4649 | 1 | MIT | AB GP MA OP | Operational |
| A | [oomol-lab/open-connector](https://github.com/oomol-lab/open-connector) | 4633 | 0 | Apache-2.0 | AB MA |  |
| A | [UditAkhourii/adhd](https://github.com/UditAkhourii/adhd) | 3532 | 8 | MIT | AB GP MA OP | Adjacent/experimental |
| A | [chachamaru127/claude-code-harness](https://github.com/chachamaru127/claude-code-harness) | 3056 | 1 | MIT | AB GP MA OP | Adjacent |
| A | [supabase/agent-skills](https://github.com/supabase/agent-skills) | 2504 | 1 | MIT | KI |  |
| A | [Piebald-AI/tweakcc](https://github.com/Piebald-AI/tweakcc) | 2421 | 3 | MIT | AB GP KI MA OP | Adjacent |
| A | [Observal/Observal](https://github.com/Observal/Observal) | 2358 | 4 | Apache-2.0 | AB GP KI MA OP | Nicht Core |
| A | [Nimbalyst/nimbalyst](https://github.com/Nimbalyst/nimbalyst) | 1471 | 0 | MIT | AB GP MA OP | Adjacent |
| A | [nimbalyst/nimbalyst](https://github.com/nimbalyst/nimbalyst) | 1471 | 0 | MIT | KI | Adjacent |
| A | [fcambus/spleen](https://github.com/fcambus/spleen) | 1357 | 1 | BSD-2-Clause | KI |  |
| A | [mbailey/voicemode](https://github.com/mbailey/voicemode) | 1320 | 23 | MIT | AB MA |  |
| A | [daaain/claude-code-log](https://github.com/daaain/claude-code-log) | 1193 | 13 | MIT | AB GP MA OP | Offline utility |
| A | [zzet/gortex](https://github.com/zzet/gortex) | 1134 | 1 | Apache-2.0 | KI |  |
| A | [duanyytop/agents-radar](https://github.com/duanyytop/agents-radar) | 951 | 0 | MIT | KI |  |
| A | [opentabs-dev/opentabs](https://github.com/opentabs-dev/opentabs) | 894 | 17 | MIT | AB KI MA |  |
| A | [ruvnet/metaharness](https://github.com/ruvnet/metaharness) | 575 | 2 | MIT | KI |  |
| A | [f/agentlytics](https://github.com/f/agentlytics) | 560 | 10 | — | AB GP KI MA OP | Optional |
| A | [raine/claude-code-proxy](https://github.com/raine/claude-code-proxy) | 490 | 1 | MIT | KI |  |
| A | [karanb192/claude-code-hooks](https://github.com/karanb192/claude-code-hooks) | 470 | 9 | MIT | AB GP KI MA OP | Nicht Core |
| A | [jia-gao/leanctx](https://github.com/jia-gao/leanctx) | 316 | 1 | MIT | AB GP KI OP | Research/secondary |
| A | [Green-PT/honey-for-devs](https://github.com/Green-PT/honey-for-devs) | 229 | 3 | MIT | GP OP | Discovery-only / verify before use |
| A | [HoangP8/tokless](https://github.com/HoangP8/tokless) | 222 | 2 | MIT | GP OP | Selektiver Installer |
| A | [edgee-ai/edgee](https://github.com/edgee-ai/edgee) | 124 | 1 | Apache-2.0 | KI |  |
| A | [hookdeck/webhook-skills](https://github.com/hookdeck/webhook-skills) | 80 | 1 | MIT | AB MA |  |
| A | [pleasedodisturb/awesome-llm-token-optimization](https://github.com/pleasedodisturb/awesome-llm-token-optimization) | 51 | 25 | — | AB GP OP | Discovery-/Researchquelle |
| A | [HaShiShark/context-editor-agent](https://github.com/HaShiShark/context-editor-agent) | 44 | 8 | GPL-3.0 | OP | Experimentell |
| A | [NilsWidal/loobster](https://github.com/NilsWidal/loobster) | 36 | 1 | — | GP OP | Discovery-only / verify before use |
| A | [JeongJaeSoon/agent-guard](https://github.com/JeongJaeSoon/agent-guard) | 19 | 1 | MIT | GP OP | Discovery-only / verify before use |
| A | [mickeyyaya/evolve-loop](https://github.com/mickeyyaya/evolve-loop) | 5 | 0 | Apache-2.0 | KI |  |
| A | [yurukusa/cc-safe-setup](https://github.com/yurukusa/cc-safe-setup) | 4 | 0 | MIT | AB |  |
| A | [All-The-Vibes/TokenMasterX](https://github.com/All-The-Vibes/TokenMasterX) | 3 | 5 | MIT | GP OP | Discovery-only / verify before use |
| A | [Battle-Creek-LLC/ward](https://github.com/Battle-Creek-LLC/ward) | 3 | 22 | MIT | GP OP | Discovery-only / verify before use |
| A | [illuwa/ctx-diet](https://github.com/illuwa/ctx-diet) | 3 | 19 | MIT | GP KI OP | Discovery-only / verify before use |
| A | [vamsiramakrishnan/straitjacket](https://github.com/vamsiramakrishnan/straitjacket) | 3 | 3 | Apache-2.0 | GP OP | Discovery-only / verify before use |
| A | [evan-choi/pxpipe-go](https://github.com/evan-choi/pxpipe-go) | 2 | 1 | MIT | KI |  |
| A | [NodeNestor/nestor-plugins](https://github.com/NodeNestor/nestor-plugins) | 2 | 2 | — | KI |  |
| A | [Ship-Wright/headroom-plugin](https://github.com/Ship-Wright/headroom-plugin) | 2 | 1 | MIT | KI |  |
| A | [Supersynergy/agent-token-saver-skill-router](https://github.com/Supersynergy/agent-token-saver-skill-router) | 1 | 13 | MIT | KI |  |
| A | [zach-source/ctxguard](https://github.com/zach-source/ctxguard) | 1 | 3 | MIT | GP OP | Discovery-only / verify before use |
| A | [Agusx1211/prechew](https://github.com/Agusx1211/prechew) | 0 | 8 | MIT | GP OP | Discovery-only / verify before use |
| A | [alilfrances/tokenslim](https://github.com/alilfrances/tokenslim) | 0 | 21 | MIT | GP OP | Discovery-only / verify before use |
| A | [ChubV/toon-economy](https://github.com/ChubV/toon-economy) | 0 | 4 | — | GP OP | Discovery-only / verify before use |
| A | [Dagmayalew/tokwatch](https://github.com/Dagmayalew/tokwatch) | 0 | 27 | MIT | GP OP | Discovery-only / verify before use |
| A | [damian100/Claude-Token-Diet](https://github.com/damian100/Claude-Token-Diet) | 0 | 23 | MIT | GP OP | Discovery-only / verify before use |
| A | [guy-lifshitz/bytepress](https://github.com/guy-lifshitz/bytepress) | 0 | 24 | MIT | GP OP | Discovery-only / verify before use |
| A | [headroomlabs-ai/strands-headroom](https://github.com/headroomlabs-ai/strands-headroom) | 0 | 11 | Apache-2.0 | KI |  |
| A | [jacobo07/claude-power-pack](https://github.com/jacobo07/claude-power-pack) | 0 | 2 | MIT | GP OP | Discovery-only / verify before use |
| A | [MasterWushi/agent-trim](https://github.com/MasterWushi/agent-trim) | 0 | 15 | MIT | GP OP | Discovery-only / verify before use |
| A | [nsheaps/claude-utils](https://github.com/nsheaps/claude-utils) | 0 | 1 | MIT | GP OP | Discovery-only / verify before use |
| A | [pastorsj/LLMRouting](https://github.com/pastorsj/LLMRouting) | 0 | 9 | — | KI |  |
| A | [somarimapps/tokenwise](https://github.com/somarimapps/tokenwise) | 0 | 21 | MIT | GP OP | Discovery-only / verify before use |
| A | [techdeveloper-org/mcp-token-optimizer](https://github.com/techdeveloper-org/mcp-token-optimizer) | 0 | 6 | — | GP OP | Discovery-only / verify before use |
| A | [YoniYon00/claude-feedback-rings](https://github.com/YoniYon00/claude-feedback-rings) | 0 | 0 | — | KI |  |
| B | [Aider-AI/aider](https://github.com/Aider-AI/aider) | 48160 | 83 | Apache-2.0 | AB GP KI OP | Referenz/Alternative Agent |
| B | [revfactory/harness](https://github.com/revfactory/harness) | 8746 | 64 | Apache-2.0 | AB MA |  |
| B | [bodo-run/yek](https://github.com/bodo-run/yek) → `mohsen1/yek` | 2470 | 45 | MIT | AB GP OP | On-demand utility |
| B | [mohsen1/yek](https://github.com/mohsen1/yek) | 2470 | 45 | MIT | KI |  |
| B | [The-Vibe-Company/companion](https://github.com/The-Vibe-Company/companion) | 2397 | 68 | MIT | AB GP MA OP | Nicht Core |
| B | [0xranx/OpenContext](https://github.com/0xranx/OpenContext) | 729 | 58 | MIT | AB GP KI MA OP | Optional |
| B | [abhishekray07/claude-md-templates](https://github.com/abhishekray07/claude-md-templates) | 314 | 87 | MIT | KI |  |
| B | [Ayanami1314/swe-pruner](https://github.com/Ayanami1314/swe-pruner) | 307 | 44 | MIT | GP OP | Research/experiment |
| B | [MaxForAI/Tokenless](https://github.com/MaxForAI/Tokenless) | 45 | 86 | MIT | GP OP | Long-tail / zu verifizieren |
| B | [Adityapal67/context-graph-compressor](https://github.com/Adityapal67/context-graph-compressor) | 35 | 75 | MIT | OP | Experimentell |
| B | [banyudu/claude-warden](https://github.com/banyudu/claude-warden) | 29 | 44 | MIT | KI |  |
| B | [sup3x/claude-code-eco](https://github.com/sup3x/claude-code-eco) | 27 | 42 | MIT | KI |  |
| B | [jee599/contextzip](https://github.com/jee599/contextzip) | 23 | 71 | — | KI |  |
| B | [sriinnu/clipforge-PAKT](https://github.com/sriinnu/clipforge-PAKT) | 20 | 43 | MIT | AB GP KI OP | Empfohlene innere Transformation |
| B | [ASK-Ai-Canada/ASK-Claude-Token-Optimizer](https://github.com/ASK-Ai-Canada/ASK-Claude-Token-Optimizer) | 19 | 39 | — | GP OP | Discovery-only / verify before use |
| B | [4pixeltechBR/token_saver_ClaudeCode](https://github.com/4pixeltechBR/token_saver_ClaudeCode) | 13 | 55 | MIT | GP OP | Discovery-only / verify before use |
| B | [ran-isenberg/propel](https://github.com/ran-isenberg/propel) | 11 | 74 | MIT | AB GP MA OP | Adjacent |
| B | [RainSunMe/cc-vision-hook](https://github.com/RainSunMe/cc-vision-hook) | 9 | 35 | MIT | GP OP | Discovery-only / verify before use |
| B | [DivyeshPatro/pxpipe-windows](https://github.com/DivyeshPatro/pxpipe-windows) | 7 | 32 | MIT | KI |  |
| B | [thelumiereguy/gemini-agent-bridge](https://github.com/thelumiereguy/gemini-agent-bridge) | 7 | 85 | MIT | GP OP | Discovery-only / verify before use |
| B | [RonnieTheTester/headroom-meter](https://github.com/RonnieTheTester/headroom-meter) | 6 | 50 | MIT | AB GP KI OP | Optional |
| B | [cipherfoxie/agent-bench](https://github.com/cipherfoxie/agent-bench) | 2 | 49 | MIT | KI |  |
| B | [MelihCevhertas/flart](https://github.com/MelihCevhertas/flart) | 2 | 86 | MIT | GP OP | Discovery-only / verify before use |
| B | [AbhayShalghar/ctk](https://github.com/AbhayShalghar/ctk) | 1 | 48 | MIT | GP KI OP | Discovery-only / verify before use |
| B | [InfiniteLife/claude-code-surrogate-guard](https://github.com/InfiniteLife/claude-code-surrogate-guard) | 1 | 45 | MIT | GP OP | Discovery-only / verify before use |
| B | [lelouchB/cc-scrub](https://github.com/lelouchB/cc-scrub) | 1 | 31 | MIT | GP OP | Discovery-only / verify before use |
| B | [rongtnt/claude-squelch](https://github.com/rongtnt/claude-squelch) | 1 | 34 | — | GP OP | Discovery-only / verify before use |
| B | [BAS-More/token-shield](https://github.com/BAS-More/token-shield) | 0 | 36 | MIT | GP OP | Discovery-only / verify before use |
| B | [gritbox/cmo](https://github.com/gritbox/cmo) | 0 | 34 | — | GP OP | Discovery-only / verify before use |
| B | [isaacaranda/ctx-optimizer](https://github.com/isaacaranda/ctx-optimizer) | 0 | 43 | — | GP OP | Discovery-only / verify before use |
| B | [k1y0miiii/json-token-skill](https://github.com/k1y0miiii/json-token-skill) | 0 | 62 | MIT | GP OP | Discovery-only / verify before use |
| B | [mjc02840/tokenkeeper](https://github.com/mjc02840/tokenkeeper) | 0 | 37 | MIT | GP OP | Discovery-only / verify before use |
| B | [Munyathatguy/claude-context-saver](https://github.com/Munyathatguy/claude-context-saver) | 0 | 70 | MIT | GP OP | Discovery-only / verify before use |
| B | [nikkimasani/claude-squelch](https://github.com/nikkimasani/claude-squelch) | 0 | 34 | — | GP OP | Discovery-only / verify before use |
| B | [Sanpelegrino/token-guard](https://github.com/Sanpelegrino/token-guard) | 0 | 46 | — | GP OP | Discovery-only / verify before use |
| B | [soovittt/Glance](https://github.com/soovittt/Glance) | 0 | 41 | MIT | GP OP | Discovery-only / verify before use |
| B | [thavionai/optimize-pilot](https://github.com/thavionai/optimize-pilot) | 0 | 59 | MIT | GP OP | Discovery-only / verify before use |
| B | [VictorRColussi/vrc-optimizer](https://github.com/VictorRColussi/vrc-optimizer) | 0 | 35 | MIT | GP OP | Discovery-only / verify before use |
| C | [coderamp-labs/gitingest](https://github.com/coderamp-labs/gitingest) | 15296 | 362 | MIT | AB GP KI OP | On-demand packer |
| C | [songguoxs/seedance-prompt-skill](https://github.com/songguoxs/seedance-prompt-skill) | 2645 | 182 | MIT | AB MA |  |
| C | [superagent-ai/vibekit](https://github.com/superagent-ai/vibekit) | 1844 | 276 | MIT | AB MA |  |
| C | [simonw/claude-code-transcripts](https://github.com/simonw/claude-code-transcripts) | 1664 | 182 | Apache-2.0 | AB GP MA OP | Offline utility |
| C | [lcoutodemos/clui-cc](https://github.com/lcoutodemos/clui-cc) | 1222 | 140 | MIT | AB GP MA OP | Nicht Core |
| C | [djyde/ccmate](https://github.com/djyde/ccmate) | 628 | 93 | — | AB GP MA OP | Nicht Core |
| C | [Matt-Dionis/claude-code-configs](https://github.com/Matt-Dionis/claude-code-configs) | 625 | 354 | MIT | AB GP MA OP | Nicht Core |
| C | [KyleAMathews/claude-code-ui](https://github.com/KyleAMathews/claude-code-ui) | 412 | 216 | — | AB GP MA OP | Nicht Core |
| C | [tkaufmann/claude-gemini-bridge](https://github.com/tkaufmann/claude-gemini-bridge) | 406 | 361 | MIT | AB GP KI MA OP | Bedingter Offload |
| C | [rixinhahaha/snip](https://github.com/rixinhahaha/snip) | 277 | 98 | MIT | AB KI MA |  |
| C | [gagarinyury/claude-config-editor](https://github.com/gagarinyury/claude-config-editor) | 258 | 288 | MIT | AB GP MA OP | Nicht Core |
| C | [benbasha/Claude-Autopilot](https://github.com/benbasha/Claude-Autopilot) | 246 | 357 | MIT | AB GP MA OP | Nicht Core |
| C | [Vvkmnn/claude-historian-mcp](https://github.com/Vvkmnn/claude-historian-mcp) | 177 | 144 | MIT | AB GP MA OP | Optional |
| C | [yifanzz/claude-code-boost](https://github.com/yifanzz/claude-code-boost) | 164 | 162 | MIT | AB GP KI MA OP | Nicht Core |
| C | [nooscraft/tokuin](https://github.com/nooscraft/tokuin) | 142 | 114 | MIT | AB |  |
| C | [aberemia24/code-executor-MCP](https://github.com/aberemia24/code-executor-MCP) | 130 | 263 | MIT | KI |  |
| C | [alexanderop/walkthrough](https://github.com/alexanderop/walkthrough) | 128 | 143 | — | AB MA |  |
| C | [KINGSTAR-OMEGA/claude-token-optimizer](https://github.com/KINGSTAR-OMEGA/claude-token-optimizer) | 98 | 123 | MIT | AB GP OP | Discovery-only / verify before use |
| C | [walidboulanouar/Ay-Skills](https://github.com/walidboulanouar/Ay-Skills) | 85 | 156 | — | AB MA |  |
| C | [aleks-apostle/claude-code-patches](https://github.com/aleks-apostle/claude-code-patches) | 67 | 247 | — | AB GP MA OP | Nicht Core |
| C | [aleks-apostle/claude-code-thinking-patch](https://github.com/aleks-apostle/claude-code-thinking-patch) → `aleks-apostle/claude-code-patches` | 67 | 247 | — | KI |  |
| C | [ZongqianLi/500xCompressor](https://github.com/ZongqianLi/500xCompressor) | 64 | 157 | — | AB GP KI OP | Nicht produktionsreif |
| C | [KRLabsOrg/squeez](https://github.com/KRLabsOrg/squeez) | 23 | 108 | Apache-2.0 | AB GP KI OP | L5-Spezialprofil |
| C | [OneGoToAI/Pruner](https://github.com/OneGoToAI/Pruner) | 6 | 142 | MIT | GP OP | Research/experiment |
| C | [pathakmukul/claude-code-context-pruner](https://github.com/pathakmukul/claude-code-context-pruner) | 6 | 100 | MIT | GP OP | Long-tail experiment |
| C | [alexanderop/good-docs-writer](https://github.com/alexanderop/good-docs-writer) | 2 | 110 | MIT-0 | AB MA |  |
| C | [itgoyo/awesome-claude-code](https://github.com/itgoyo/awesome-claude-code) | 2 | 122 | — | KI |  |
| C | [aaron-for-value/token-saving-hooks-claude-code](https://github.com/aaron-for-value/token-saving-hooks-claude-code) | 1 | 94 | — | GP OP | Discovery-only / verify before use |
| C | [danieleelti/ClaudeCode-Token-Guard](https://github.com/danieleelti/ClaudeCode-Token-Guard) | 1 | 115 | MIT | GP OP | Discovery-only / verify before use |
| C | [DxTa/claude-dynamic-context-pruning](https://github.com/DxTa/claude-dynamic-context-pruning) | 1 | 167 | MIT | GP OP | Long-tail experiment |
| C | [HamezGuy/openclaude-optimized](https://github.com/HamezGuy/openclaude-optimized) | 1 | 132 | — | GP OP | Discovery-only / verify before use |
| C | [jordan112/skinny-jeans](https://github.com/jordan112/skinny-jeans) | 1 | 181 | MIT | GP OP | Discovery-only / verify before use |
| C | [rish-e/tokenpilot](https://github.com/rish-e/tokenpilot) | 1 | 128 | MIT | GP OP | Discovery-only / verify before use |
| C | [0xAnto/llm-token-reducer](https://github.com/0xAnto/llm-token-reducer) | 0 | 160 | — | AB |  |
| C | [ai-skynet-labs/reduce-tokens](https://github.com/ai-skynet-labs/reduce-tokens) | 0 | 129 | — | AB |  |
| C | [airishka/token-optimizer](https://github.com/airishka/token-optimizer) | 0 | 152 | — | GP OP | Discovery-only / verify before use |
| C | [atarazevich/claude-code-prune](https://github.com/atarazevich/claude-code-prune) | 0 | 172 | MIT | GP OP | Long-tail experiment |
| C | [farhan523/claude-code-lean](https://github.com/farhan523/claude-code-lean) | 0 | 122 | MIT | GP OP | Discovery-only / verify before use |
| C | [fergp92/prompt-quality-gate](https://github.com/fergp92/prompt-quality-gate) | 0 | 134 | MIT | GP OP | Discovery-only / verify before use |
| C | [Gkodkod/token-optimizer](https://github.com/Gkodkod/token-optimizer) | 0 | 152 | — | GP OP | Discovery-only / verify before use |
| C | [Naorn/token-optimizer](https://github.com/Naorn/token-optimizer) | 0 | 164 | — | GP OP | Discovery-only / verify before use |
| C | [oezguercelebi/memento-plugin](https://github.com/oezguercelebi/memento-plugin) | 0 | 206 | MIT | GP OP | Discovery-only / verify before use |
| C | [omer-yehuda/ctxmap](https://github.com/omer-yehuda/ctxmap) | 0 | 163 | MIT | GP OP | Discovery-only / verify before use |
| C | [Takagera13/claude-token-analyzer](https://github.com/Takagera13/claude-token-analyzer) | 0 | 129 | MIT | GP OP | Discovery-only / verify before use |
| C | [thamam/cache-lab](https://github.com/thamam/cache-lab) | 0 | 114 | — | GP OP | Discovery-only / verify before use |
| C | [Yaminie-Hsu/claude-token-lens](https://github.com/Yaminie-Hsu/claude-token-lens) | 0 | 111 | MIT | GP OP | Discovery-only / verify before use |
| F | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | 81340 | 0 | AGPL-3.0-only | AB MA |  |
| F | [winfunc/opcode](https://github.com/winfunc/opcode) | 22364 | 301 | AGPL-3.0 | AB GP MA OP | Nicht Core |
| F | [AndyMik90/Aperant](https://github.com/AndyMik90/Aperant) | 14506 | 60 | AGPL-3.0 | AB GP MA OP | Nicht Core |
| F | [Opencode-DCP/opencode-dynamic-context-pruning](https://github.com/Opencode-DCP/opencode-dynamic-context-pruning) | 3963 | 49 | AGPL-3.0 | GP OP | Referenz, nicht Claude-native |
| F | [milisp/codexia](https://github.com/milisp/codexia) | 881 | 1 | AGPL-3.0 | AB GP MA OP | Nicht Core |
| X | [RonitSachdev/ccundo](https://github.com/RonitSachdev/ccundo) | 1402 | 382 | — | AB GP MA OP | Nicht Core |
| X | [chiphuyen/sniffly](https://github.com/chiphuyen/sniffly) | 1261 | 370 | MIT | AB GP MA OP | Optional |
| X | [ObservedObserver/async-code](https://github.com/ObservedObserver/async-code) | 537 | 374 | Apache-2.0 | AB GP MA OP | Nicht Core |
| X | [ColeMurray/claude-code-otel](https://github.com/ColeMurray/claude-code-otel) | 485 | 422 | MIT | AB GP MA OP | Optional |
| X | [liyucheng09/Selective_Context](https://github.com/liyucheng09/Selective_Context) | 424 | 913 | MIT License | KI |  |
| X | [philipp-spiess/claude-code-costs](https://github.com/philipp-spiess/claude-code-costs) | 203 | 423 | MIT | AB GP MA OP | Optional |
| X | [jeffreysijuntan/lloco](https://github.com/jeffreysijuntan/lloco) | 119 | 789 | MIT | OP | Research/experiment |
| X | [chethanbhatbs/compactor-skill](https://github.com/chethanbhatbs/compactor-skill) | 2 | 59 | MIT | KI |  |
| X | [cardimvitor/Compression](https://github.com/cardimvitor/Compression) | — | — | — | KI |  |
| X | [harrisonsec/](https://github.com/harrisonsec/) | — | — | — | AB |  |
