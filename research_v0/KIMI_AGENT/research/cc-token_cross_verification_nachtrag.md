# Cross-Verification — Nachtrag nach Phase 3 (Deep Dives dim01–08)
Stand: 2026-08-13

## Neue/verschärfte Conflict-Zone-Resolutionen aus den Deep Dives

**CZ-1 (Advertised vs. Bill) — VERSCHÄRFT durch Issue-Evidenz:**
- rtk: Zusätzlich zu JetBrains/codepointer jetzt **Security-Klassifikation**: offene Issues #1155 (Permission-Bypass), #3152 (Allow-Pattern-Bruch), **#2345 = CVE-2026-33068** (.env-Exfiltration via `rtk proxy`), #3175 (Community bestätigt Negativ-Messung). → Status: **Nicht empfohlen** (vorher ⚠️). [dim01]
- Negativ-ROI ohne Net-win-Gate bei 3 Tools unabhängig dokumentiert (+7,6/+18/+14 %). Ehrlicher Erwartungswert für die Filter-Schicht: **0–3 % der Rechnung typisch, 10–15 % nur in test/log-lastigen Sessions**. [dim01]

**CZ-4 (Cache-Bruch durch Proxys) — AUFGELÖST mit Tool-Urteilen:**
- **headroom: Cache GEBROCHEN (gemessen)** — Issue #2438: 2–7× Kostensteigerung in beiden Modi + falsche cache_hit-Telemetrie; widerspricht README-Claim. → headroom von ✅ auf **⚠️ (nur nach Versions-Fix-Check)** heruntergestuft. [dim02]
- **Cache-SICHER (Mechanismus-belegt):** squeezr (nach Incident-Postmortem gehärtet), llmtrim, tokdiet, magic-compact, rolling-context, densely. [dim02]
- OmniRoute-Kompression antagonistisch zu Prefix-Cache. [dim05]
- **Regel bestätigt:** maximal EIN BASE_URL-Proxy in der Kette; zwei Proxys brechen sich gegenseitig (Paritok REF-Marker). [dim03]

**CZ-2 (Indizes) — PRÄZISIERT:**
- Mechanismus (Tool-Call-Reduktion) reproduziert unabhängig (−55 % codegraph auf Hono), **Dollar-Effekt nicht** (+6,8 % Kosten; enge Fragen 20–43 % teurer). Alle „×-fach"-Claims sind Query-Isolation; auf E2E-Sessions 0–43 %. [dim07]
- Neue Fallstricke: CBM silent-stale-Graph (#1296/#1191); Deferred-Tool-Loading-Falle (hinter ToolSearch versteckte MCP-Tools werden nie aufgerufen — token-savior-Retraction: 1 Call/143 Sessions); Manifest-Kosten messbar (tiny 0,6kT vs. full 6kT). [dim07][dim03]

**CZ-6 (Formate) — VERSCHÄRFT:**
- TOON: −42,6 % nur vs. pretty JSON; vs. kompaktes JSON ~Parität; **TRON-Studie (arXiv 2605.29676): Parse-Kaskaden in Multi-Turn-Agent-Loops → „not safe as default"**; S-TOON-Delimiter-Injection. → Formate nur INPUT-seitig (Tool-Results), nie output-seitig. [dim04]

**Neue Conflict Zone CZ-9: Memory-Systeme als Token-Verursacher.**
- Recall-stärkste Systeme = höchster statischer Overhead: MemPalace 44 MCP-Tools (4,4–8,6k/Session), agentmemory (rohitg00, 26,9k★) 54 MCP-Tools. Offene Token-relevante Bugs: claude-mem #3480 (Re-Injection bei jedem Read), MemPalace #1601/#906 (PreCompact blockiert Compaction). → Memory-MCP **nie global** registrieren (Subagent-Frontmatter-mcpServers); Datei-Disziplin (planning-with-files/HANDOFF.md) schlägt Memory-Server für statische Fakten. [dim06]

**Neue Conflict Zone CZ-10: Routing-Qualitätsrisiken konkretisiert.**
- CCR: 193 offene Tool-Calling-Issues; DeepSeek-#1378 (reasoning_content-400); CC ≥2.1.196 killt Remote Control bei Custom-Base-URL (→ Forward-Proxy-MITM-Modus nötig). → Routing nur: main+think stark, background/Subagenten billig; native Anthropic-Protokoll-Endpoints bevorzugen; Minimalvariante ohne Proxy: CLAUDE_CODE_SUBAGENT_MODEL=haiku. [dim05]

**Neue Conflict Zone CZ-11: tweakcc/Systemprompt-Patching.**
- Toolsets sparen „several thousand tokens" Prefix, aber durch 0,1×-Cache gedämpft; dokumentierter Bruchzyklus bei CC-Updates (#861/#942/#872) + Binary-Patch + Remote-Skript-Fläche. → **Nicht als Token-Primärhebel**; nur mit Git-verwalteten Diffs + Update-Fenstern. [dim05]

**CZ-8-Update (Regelwerk-Ebene):**
- overloop-PyPI-Seite 404 (Design über libraries.io-Spiegel dokumentiert); Regex-Guard-Compound-Lücke betrifft auch karanb192/damage-control; warden #123 (for/while/if umgeht alwaysDeny) → **Token-Guards gehören output-seitig (PostToolUse), nicht command-seitig**. [dim08]
- Otel Smuggling: OTEL-Telemetrie nur user-seitig konfigurieren, nie projekt-seitig. [dim08][wide05]

## Finale Confidence-Einstufung der Kern-Empfehlungen
| Empfehlung | Confidence |
|---|---|
| Mess-Baseline (ccusage+CodeBurn) vor allem anderen | High |
| Native Hebel + Env-Hygiene zuerst (Cache, CLAUDE.md, Compact-Instructions, MAX_MCP_OUTPUT_TOKENS, Tool Search) | High |
| ponytail als einziger Verhaltens-Skill (unabhängig bestätigt) | High |
| squeez/tokf statt rtk auf der Filter-Schicht | High |
| context-mode für Output-Sandboxing | Medium-High |
| magic-compact + max. ein cache-sicherer Proxy für lange Sessions | Medium |
| cache-fix für --resume-/Lang-Session-Nutzer | Medium-High |
| headroom nur nach Fix-Verifikation von #2438 | Medium |
| Code-Indizes situativ (serena/codegraph/CRG), nie always-on | Medium-High |
| Memory dateibasiert-first, MCP-Memory nur scoped | Medium-High |
| Routing optional mit starkem main+think | Medium |
| PNG-Encoding (pxpipe/OmniGlyph) nur Nische | Medium |
