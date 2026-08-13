# Kern-Katalog — die 25 bewerteten Schlüssel-Repos

_Stand Messfelder: repo-catalog-v4, 2026-08-13. Scores aus der Zweitvalidierung
(Rubric: Evidenz 25 / Aktualität 20 / Lizenz 15 / Mechanismus-Fit 20 /
Konvergenz 10 / Risiko 10). Flags: ★ = GitHub-Stars, d = Tage seit letztem
Commit, ⚠ = Flag (Substanz/Lieferfähigkeit). Konvergenz: Empfehlung in
OPUS_V4 / GPT56 / K3 / KIMI (✅ Kern · 🔶 konditional · ⬜ nicht behandelt · ❌ abgelehnt)._

| Repo | Score | ★ | d | Lizenz | V4/G56/K3/KIMI | Entscheidung |
|---|---|---|---|---|---|---|
| ccusage/ccusage | **93** | 17.888 | 0 | MIT | ✅✅✅✅ | KERN (Messung) |
| DietrichGebert/ponytail | **92** | 101.665 | 6 | MIT | ✅🔶✅✅ | KERN (Verhalten) |
| OthmanAdi/planning-with-files | **87** | 26.135 | 4 | MIT | ✅✅✅✅ | KERN (Persistenz) |
| colbymchenry/codegraph | **83** | 66.154 | 5 | MIT | ✅✅✅🔶 | KERN bedingt (ab ~300 Dateien/Relationsfragen) |
| aerovato/magic-compact | **82** | 134 | 1 | BSD-3 | ✅🔶✅✅ | KERN bedingt (Profil B) |
| cnighswonger/claude-code-cache-fix | **82** | 414 | 6 | MIT | 🔶🔶✅✅ | konditional (Resume/Cache-Fehler) |
| getagentseal/codeburn | **81** | 9.283 | 1 | MIT | ✅⬜✅✅ | KERN (Governance-Loop) |
| claudioemmanuel/squeez | **80** | 182 | 1 | Apache-2.0 | ✅🔶🔶✅ | Turnkey-Filter, A/B vs. eigenem Guard |
| PCIRCLE-AI/toonify-mcp | **78** | 64 | 1 | MIT | ✅❌→✅🔶✅ | rehabilitiert (Fix 0.8.2), Format-Pilot, **Pin ≥ 0.8.2** |
| mksglu/context-mode | **77** | 19.834 | 1 | ELv2 (Fence) | ✅✅✅✅ | KERN bedingt (External; **ELv2 prüfen**) |
| fajarhide/omni | **77** | 320 | 0 | Apache-2.0 | ✅✅⬜⬜ | Dedup-Pilot (einziger Cross-Call-Mechanismus) |
| fkiene/llmtrim | **75** | 208 | 1 | MPL-2.0 | 🔶🔶✅✅ | Proxy-Option B (API-Billing, lange Sessions) |
| oraios/serena | **74** | 27.939 | 1 | MIT | ✅🔶🔶🔶 | Spezial (Edit-Workflows) |
| DeusData/codebase-memory-mcp | **74** | 38.730 | 1 | MIT | ✅🔶🔶⬜ | Spezial (große Polyglot-Monorepos) |
| NodeNestor/claude-rolling-context | **73** | 27 | 1 | MIT | ⬜⬜🔶✅ | Spezial (Abo-Poweruser; „wash" bei kurzen) |
| agiwhitelist/tokdiet | **72** | 53 ↑ | 56 ⚠ | MIT | 🔶🔶✅✅ | konditional (API-Billing only; Security-Audit vorher) |
| mpecan/tokf | **72** | 192 | 5 | MIT | ⬜🔶🔶🔶 | Filter-Alternative |
| edouard-claude/snip | **71** | 406 | 9 | MIT | ✅🔶🔶⬜ | testbarer Filter (YAML-Regeln) |
| manojmallick/sigmap | **70** | 615 | 16 | MIT | 🔶🔶🔶⬜ | CLI-Alternative Retrieval (null Prefix) |
| u-ichi/compact-plus | **68** | ~189 | ~35 | MIT (README) | ⬜⬜✅⬜ | **Pilot Ladder-Stufe 2** (State-Preservation) |
| yurukusa/cc-safe-setup | **68** | 4 ⚠ | 0 | MIT | ⬜⬜✅⬜ | Referenz/Teile-Spender (Guard-Muster) |
| atlassian-labs/mcp-compressor | **67** | 106 | 16 | Apache-2.0 | 🔶⬜🔶✅ | konditional (≥ 2 schwere MCPs) |
| yoeld-wix/quiet-bash | **65** | 5 ⚠ | 38 ⚠ | MIT | 🔶⬜🔶⬜ | A/B-Kandidat statt Favorit (abgestuft, U2) |
| zdk/lowfat | **64** | 566 | 36 ⚠ | Apache-2.0 | 🔶🔶⬜⬜ | Pilot nur (nahe 60-Tage-Regel, U4) |
| NodeNestor/claude-lean-context | **56** | 1 ⚠ | n.g. | MIT | 🔶⬜⬜⬜ | Watchlist (Substanz offen, U7) |

**Plus Eigenbau:** `bash-dump-guard` v3.1 (Paket) — Score **83** — KERN als
eigener Bash-Owner, Pflicht-A/B gegen squeez.

**Konvergenz-Befund:** Volle 4/4-Kernempfehlung nur für **ccusage, ponytail,
planning-with-files, context-mode** (+ magic-compact 3,5/4). Die Bash-Owner-
Frage ist der größte Streitpunkt (squeez vs. eigener Guard vs. quiet-bash vs.
omni — je Datensatz anders) → Pflicht-A/B im Rollout (Wave 6).

**Abgesagt (nicht im Kern-Katalog, Trigger in KONZEPT.md § 8):** rtk, caveman,
headroom, pxpipe/OmniGlyph, 500xCompressor, LLMLingua-2-Hooks, globale
Memory-MCPs (Default), semtrim, token-optimizer (PolyForm), sqz (Elastic 2.0).
