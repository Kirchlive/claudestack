# dim05: Routing, Cache & Systemprompt

**Dimension:** Modell-Routing, Prompt-Cache-Ebene & Systemprompt-Härtung
**Datum:** 2026-08-13 · **Scope:** (a) Router/Gateways (Kosten-, nicht Token-Hebel, strategisch), (b) Cache-Hygiene/Bugfixes (größter Input-Kostenhebel), (c) Systemprompt-/Installations-Patches, (d) semantisches Caching.

## Kurzfassung

Vier Befunde tragen diese Schicht:

1. **Cache-Hygiene schlägt alles andere auf dieser Ebene.** Anthropic-Cache-Reads kosten 0,1× des Input-Preises; Claude Code cached serverseitig automatisch — aber CC selbst bustet den Cache durch bekannte Bugs (Resume-Scatter, Fingerprint-Instabilität, Tool-Ordering) und Verhaltensweisen (Git-Status-Injektion, Modellwechsel). `claude-code-cache-fix` misst 95,5 % Hit-Rate durch seinen Proxy vs. 82,3 % direkt auf dem ersten Warm-Turn[^4^]. Eine resumed Session kann ohne Fix ~$5–10/h statt ~$0,50/h brennen[^4^].
2. **Routing spart Geld, nicht Tokens** — und ist nur ohne Qualitätsverlust möglich, wenn Haupt- und Think-Pfade auf starken Modellen bleiben und billige Modelle gezielt für Hintergrund-/Subagenten-Arbeit genutzt werden. Nicht-Anthropische Modelle in CC haben dokumentierte Tool-Calling-Probleme (193 offene Tool-Issues in claude-code-router; DeepSeek-`reasoning_content`-Bug #1378)[^15^][^16^].
3. **Systemprompt-Patching (tweakcc)** kann den gecachten Prefix um mehrere tausend Tokens schrumpfen (Toolsets ohne ungenutzte Tool-Beschreibungen), bricht aber bei CC-Updates und erzwingt einen Re-Patch-Loop (Issues #861, #872, #942)[^6^][^7^].
4. **Semantisches Response-Caching ist für CC-Sessions nicht realistisch** (stateful, wachsender Prefix → praktisch keine exakten/ähnlichen Treffer; Staleness-Risiko bei Code). Realistisch ist dagegen Datei-IO-Caching (mtime/Hash-basiert, z. B. semantic-cache-mcp) und das native serverseitige Prompt-Caching, dessen Hygiene Punkt 1 ist[^14^][^19^].

## Vergleichsmatrix

| Tool | Ebene | Sparhebel | Größenordnung (Hersteller/Messung) | Risiko Qualität | Risiko Bruch bei Updates | Security | Reife (Stand 2026-08) |
|---|---|---|---|---|---|---|---|
| **claude-code-cache-fix** (414★) | Cache-Fix (lokaler Proxy, MITM-fähig) | **Kosten** (Cache-Hit-Rate↑) + Beobachtbarkeit | 95,5 % vs. 82,3 % Hit-Rate (A/B, erster Warm-Turn); Dogfood 94,66 % vs. 92,44 %; Resume-Problem $0,50/h→$5–10/h verhindert[^4^] | Keins (normalisiert nur Request-Struktur; Read-only-Telemetrie) | Niedrig–mittel (wire-basiert, CC-Versions-adaptiv; Extensions ggf. nachjustieren) | **Beachten:** MITM-CA im Forward-Modus (`NODE_EXTRA_CA_CERTS`); Proxy sieht API-Traffic; Bootstrap-Defense als Security-Feature[^4^] | Hoch (v4.0.0, täglich gepflegt, 46 offene Issues, aktive Releases)[^27^] |
| **claude-code-router** (36,6k★) | Routing/Gateway (lokal, :3456) | **Geld** (Provider-Arbitrage, Free-Tier) | Community 50–99 % Kosten↓ je nach Strategie; kein Token-Hebel[^1^] | **Hoch** bei schwachen/non-Anthropic-Modellen (Tool-Calling-Brüche, s. #1378)[^15^] | Mittel (Transformer pro Provider; v2→v3-Umbruch auf SQLite/Desktop-App) | Lokal; Keys lokal; Vorsicht bei Dritt-Endpoints (Prompt-Daten verlassen Anthropic) | Hoch, aber 1.069 offene Issues; Z.ai-/Kimi-gesponsert[^1^][^27^] |
| **OpenRouter (nativ, „Anthropic Skin")** | Routing/Gateway (gehostet, kein Proxy) | **Geld** + Failover/Budgets | Provider-Failover unter CC; nur 3 Env-Vars[^17^][^18^] | Niedrig, **solange Anthropic-Modelle** (1P-Kompatibilität nur dort garantiert)[^18^] | Sehr niedrig (kein lokaler Stack) | Gehosteter Dritt-Anbieter sieht Prompts (Logging opt-in); Key-Hygiene nötig[^17^] | Hoch (offizielle CC-Integrations-Doku)[^17^] |
| **tweakcc** (2,4k★) | Systemprompt-/Installations-Patch | **Tokens** (Prefix-Schrumpfung: Toolsets, Prompt-Edits) + UX | „mehrere tausend Tokens" durch Entfernen ungenutzter Tool-Beschreibungen[^6^] | Mittel (fehlende Tools/Prompt-Edits können Verhalten ändern; Issue #872: Claude nach Prompt-Edit unbenutzbar)[^7^] | **Hoch** (Patches schlagen bei neuen CC-Versionen fehl: #861 @2.1.202, #942 @2.1.227; Re-Patch via `npx tweakcc --apply`)[^7^] | Patcht Bun-Binary/cli.js; `adhoc-patch` kann Skripte von HTTP-URL ausführen (Missbrauchsfläche); ToS-Grauzone[^6^] | Mittel–hoch (v4.0.0, verifiziert bis CC 2.1.162; Prompt-Daten minutenschnell nach Release)[^6^] |
| **claude-code-system-prompts** (12,3k★) | Wissensbasis (kein Tool) | Indirekt (grundlage für Patches/Audits) | 515 Prompts mit Token-Counts; Changelog seit CC 2.0.14 (255 Versionen)[^8^] | — | — | — | Hoch (Update binnen Minuten nach jedem CC-Release)[^8^] |
| **LiteLLM** (56,2k★) | Gateway (Team/Enterprise) + sem. Cache | **Geld** (Budgets, Fallbacks) + Antwort-Cache für stateless Calls | complexity_router-Tiers SIMPLE→REASONING; redis-/valkey-semantic Cache[^10^][^24^] | Mittel (Mid-Session-Modellwechsel bricht Thinking-Signaturen, #26005)[^11^] | Niedrig (Server-Software) | Eigener Stack nötig; Cache-Incident 02/2026 (Eviction schloss aktive Clients)[^25^] | Sehr hoch (4.896 offene Issues = Enterprise-Software-Realität)[^27^] |
| **OmniRoute** (46,6k★) | Gateway + Kompression + Fallback | **Tokens** (RTK/Caveman-Kompression 15–95 %) + Geld (338 Provider, 90+ Free-Tiers) | ~89 % Token-Ø auf tool-lastigen Sessions (Hersteller); 4-Tier-Fallback[^13^] | **Hoch** (Kompression verändert Kontext; aggressiver Modus altert alte Turns) | Mittel | Lokal, AES-256-GCM-Keys; **Konflikt: Kompression bustet Anthropic-Prefix-Cache**[^13^] | Mittel (sehr aktiv, 423 offene Issues)[^27^] |
| **ClawRouter** (6,6k★) | Routing (agent-nativ, Krypto-Zahlung) | **Geld** (15 Dimensionen, Profile free/auto/eco/premium) | 88 % (auto) / 98 % (eco) Ersparnis vs. Opus-Pinning (Hersteller); <1 ms lokales Scoring[^9^] | Mittel–hoch (Tiering auf billige Tiers) | Niedrig–mittel | Wallet-Signatur, USDC/x402-Zahlungen — Nische; für CC separates Produkt (BRCC)[^9^] | Mittel |
| **llm-router** (67★) | Routing via CC-Hooks + MCP (kein Proxy) | **Geld** (Zero-Claude-Modus, Free-first-Chains) | 60–80 % (Hersteller, Claude Code via Hooks); Heuristik-Classifier ~70 %[^12^] | Mittel (Free-first = schwächere Modelle; `~`-Bypass nötig) | Niedrig (Hooks statt Binary-Patch) | Gut: Secrets lokal, fail-closed, SQLite lokal[^12^] | Niedrig (jung, 0 offene Issues, RouterArena #8)[^12^] |
| **semantic-cache-mcp** (2★) | Datei-IO-Cache (MCP) — **kein** LLM-Antwort-Cache | **Tokens** (Re-Reads ~5 statt voller Datei-Tokens; Diffs) | 98,9 % auf eigenem 41-Datei-Korpus (Hersteller-Benchmark)[^14^] | Mittel (Stale-Read-Risiko bei externen Änderungen; Summary-Modus verliert Detail) | Niedrig | MCP sieht gesamten Datei-IO; native Read/Edit/Write müssen geblockt werden[^14^] | Niedrig (2★, Einzelautor, Bench nur auf eigenem Korpus) |

**Einordnung der Ebenen:** Cache-Fix = größter *Input-Kosten*-Hebel (0,1×-Reads sichern); Routing = *Preis-pro-Token*-Hebel (strategisch, kein Token-Hebel); Systemprompt-Patch = *Prefix-Größen*-Hebel (wirkt auf jede Anfrage, aber durch 0,1×-Caching abgefedert); Datei-IO-Cache = *Tool-Output-Token*-Hebel; Semantischer Antwort-Cache = für CC praktisch irrelevant (s. Frage iv).

## Detailprofile

### 1) musistudio/claude-code-router — 36.610★, 1.069 offene Issues, push 2026-08-11[^27^]

**Was:** Lokaler Multi-Provider-Router/Gateway für Claude Code (und inzwischen Codex, Grok CLI, Kimi CLI, Kilo Code, OpenCode, Pi, ZCode). Protokoll-Support: OpenAI Chat/Responses, Anthropic Messages, Gemini, OpenRouter, DeepSeek, SiliconFlow, Moonshot/Kimi Code, Mistral, Z.AI, Bailian, Custom[^1^]. Gesponsert u. a. von Kimi/Moonshot (Kimi K3 als Built-in-Preset) und Z.ai[^1^].

**Installation/Verdrahtung:**
- **v3 (aktuell):** Desktop-App (Electron) oder `npm install -g @musistudio/claude-code-router` → `ccr ui` → Management-UI auf `http://127.0.0.1:3458`, Gateway auf `http://127.0.0.1:3456`; Konfiguration in SQLite; Agent-Profile setzen die CC-Verdrahtung (Env) automatisch[^1^].
- **v2 (weiterhin in Community-Setups verbreitet):** `~/.claude-code-router/config.json` mit `Providers` + `Router`-Rollen, Start via `ccr code`, nach Config-Änderung `ccr restart`[^2^]:

```json
"Router": {
  "default": "deepseek,deepseek-chat",
  "background": "ollama,qwen2.5-coder:latest",
  "think": "deepseek,deepseek-reasoner",
  "longContext": "openrouter,google/gemini-2.5-pro-preview",
  "longContextThreshold": 60000,
  "webSearch": "gemini,gemini-2.5-flash"
}
```

- Rollen: `default` (Hauptdialog), `background` (Hintergrund-Jobs wie Titel-Generierung), `think` (Reasoning), `longContext` (+Threshold in Tokens), `webSearch`, `image`[^2^].

**Routing in v3:** Built-in „Claude Code"-Route (Main-Requests → Agent-Config-Modell, wenn Client kein bekanntes Modell wählt); **Subagent/Workflow-Auto-Routing** per Tag-Injektion: CCR schreibt verfügbare Modelle mitsamt *Description* in die Beschreibungen der `Agent`/`Task`-Tools; Subagenten-Prompts beginnen dann mit `<CCR-SUBAGENT-MODEL>provider/model</...>`, das CCR extrahiert und danach routet[^3^]. Benutzerdefinierte Regeln mit Bedingungen auf Headern/Body (`messages.0.role`, `tools`), Rewrites, Retries, geordnete Fallbacks[^3^].

**Failure-Modes (Issues):** 193 offene Issues mit „tool"-Bezug[^16^]. Herausragend #1378: DeepSeek V4 im Thinking-Modus + Tool-Calls → 400 (`reasoning_content` muss zurückgereicht werden; CC stripped es, Router injiziert es nicht) — „effectively always" broken bei Tool-Nutzung; zusätzlich umgeht dieser Pfad offenbar `transformer.use`, `api_base_url` und Custom-Transformer[^15^]. Häufige Generika: „400 Missing model", „500", „A.map is not a function"[^16^]. LiteLLM-Pendant: #26005 — Mid-Session-Wechsel GLM→Anthropic bricht `thinking.signature`[^11^].

**Wartungslast:** Mittel. Transformer je Provider pflegen; v2→v3-Umbruch (config.json → SQLite/Desktop); Provider-APIs ändern sich laufend.

### 2) cnighswonger/claude-code-cache-fix — 414★, 46 offene Issues, push 2026-08-12[^27^]

**Was:** Lokaler HTTP-Proxy zwischen CC und Anthropic-API, der Prompt-Cache-Bugs fixt, den Request-Prefix stabilisiert und Cache-Regressionen beobachtbar macht. Funktioniert mit allen CC-Versionen inkl. Bun-Binary v2.1.113+[^4^].

**Gefixte Kern-Bugs (Resume-Kostenexplosion, bis ~10–20×):** `$0,50/h → $5–10/h` ohne sichtbare Warnung bei `--resume`/`/resume`[^4^]:
1. **Partial Block Scatter** — Attachment-Blöcke (Skills, MCP-Server, deferred Tools, Hooks) gehören in `messages[0]`, driften bei Resume in spätere Messages → Prefix ändert sich.
2. **Fingerprint-Instabilität** — `cc_version`-Fingerprint (z. B. `2.1.92.a3f`) wird aus `messages[0]` inkl. Meta-Blöcken berechnet; Block-Verschiebung → neuer Fingerprint → neuer Systemprompt → Cache-Bust.
3. **Nicht-deterministische Tool-Reihenfolge** — Tool-Definitionen in wechselnder Reihenfolge ändern Request-Bytes → Cache-Key ungültig[^4^].

**Messwerte:** A/B (v3.0.0 auf CC v2.1.117): **95,5 % Hit-Rate durch Proxy vs. 82,3 % direkt** am ersten Warm-Turn; 7-Tage-Dogfood (37 Sessions): **94,66 % vs. 92,44 %**, thinking-block-sanitize feuerte auf ~35 % der Sessions (~800 Blöcke/Tag)[^4^].

**Installation:** `npm install -g claude-code-cache-fix`, Proxy auf `localhost:9801`, dann CC hindurch starten[^4^]:
- **Reverse-Proxy-Modus:** `ANTHROPIC_BASE_URL` auf den Proxy zeigen lassen. **Achtung:** Ab CC ≥ 2.1.196 deaktiviert eine nicht-Anthropic Base-URL **Remote Control** (`/remote-control`), `/schedule` und claude.ai-MCP-Connectors[^4^].
- **Forward-Proxy-Modus (empfohlen bei Remote-Control-Nutzung):** `CACHE_FIX_FORWARD_PROXY=on`; Proxy terminiert TLS vor dem echten `api.anthropic.com` als `HTTPS_PROXY`; benötigt MITM-CA: `NODE_EXTRA_CA_CERTS=~/.claude/cache-fix-ca/ca.pem`; `ANTHROPIC_BASE_URL` bleibt ungesetzt[^4^]. Koexistenz mit anderen MITM via `ca-trust.d` (Issue #293)[^5^].

**Extensions (Auswahl, `proxy/extensions/`, ein File pro Transform):** `fingerprint-strip`, `sort-stabilization`, `ttl-management`, `identity-normalization`, `fresh-session-sort`, `cache-control-normalize`, `cache-telemetry` (→ `~/.claude/quota-status/`), `session-health`, `thinking-block-sanitize` (Default seit v4.0.0; mildert Thinking-Desync-400, CC#63147), `workflow-agent-id-synthesis`, `session-budget-breaker` (opt-in hartes Session-Budget), `auto-1m-guard` (warnt/stripped `context-1m`-Beta-Header gegen ungewollte 1M-Kontext-Overage auf Pro), `bootstrap-defense` (audit/block/allowlist für serverseitig injizierte Prompt-Bestandteile via `/api/claude_cli/bootstrap`; Disclosure Mai 2026, von Anthropic als „Informative" geschlossen)[^4^].

**Wartungslast/Fallstricke:** Dienst-Betrieb (Service/Docker); `CACHE_FIX_DOWNLOAD_REWRITE` bricht `claude update` → aus lassen[^4^]; Hot-Reload seit v4 opt-in (stale-import-Race #196)[^5^]. Offene Punkte: Cache-Warmer-Feature (#127, #263), Telemetrie-Korrektur `CACHE_CREATE_RATE_1H` (#330), CC toggelt `anthropic-beta`-Header zwischen Turns (#326, upstream)[^5^].

**Kostenlose Sofortmaßnahmen aus dem Projekt (kein Proxy nötig):** `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1` spart **~1.800 Tokens/Call** — CC injiziert live `git status` in den Systemprompt; jede Dateiänderung ändert ihn → Prefix-Bust. Der Fix muss an der Quelle (vor Prompt-Komposition) passieren, nicht post-hoc im Proxy[^4^]. Plus empfohlener `settings.json`-Env-Block: `CLAUDE_CODE_DISABLE_LEGACY_MODEL_REMAP=1` (verhindert stilles Modell-Remapping nach Updates — „single most impactful flag"), `ANTHROPIC_MODEL` + `ANTHROPIC_SMALL_FAST_MODEL` pinnen (Prefix-Stabilität über Versionswechsel)[^4^].

### 3) Piebald-AI/tweakcc — 2.421★, 55 offene Issues, push 2026-08-12[^27^]

**Was:** CLI-Tool, das Claude Code patcht: Systemprompts (alle Teile), Toolsets, Subagent-Modelle, Themes/UI, Thinking-Verben, Statusline, Context-Limit für Dritt-APIs (`CLAUDE_CODE_CONTEXT_LIMIT`), Read-Max-Tokens[^6^].

**Mechanik:** Patcht die minifizierte `cli.js`; bei nativer Installation wird das Bun-Binary via node-lief (LIEF-Bindings) entpackt, gepatcht, repackt (Apple Silicon: Ad-hoc-Signatur). Konfiguration in `~/.tweakcc/config.json`. Nach jedem CC-Update sind Patches weg → `npx tweakcc --apply` (stellt vorher aus Backup wieder her)[^6^]. Systemprompt-Teile liegen als Markdown-Dateien in `~/.tweakcc/system-prompts`; Prompt-Daten werden binnen Minuten nach jedem CC-Release von GitHub geladen; bei Konflikten (eigene + Anthropic-Änderung) HTML-Diff zur manuellen Auflösung; Git-Versionierung empfohlen[^6^]. Verifiziert bis CC **2.1.162**; Systemprompt-Patching garantiert für alle Versionen mit extrahierten Prompts (≥ 2.0.14)[^6^].

**Token-Hebel konkret:** **Toolsets** (`/toolset`-Kommando) entfernen ungenutzte Builtin-Tools *komplett aus dem Systemprompt* (nicht nur Permission-Deny) — „the accumulated size of their descriptions and parameters can bloat the context by several thousand tokens" (Beispiele: `Skill`, `SlashCommand`, `BashOutput`)[^6^]. Da der Prefix gecacht wird, wirkt die Ersparnis gedämpft (0,1×), aber bei Cache-Busts und auf der ersten Anfrage voll.

**Failure-Modes (Issues):** #872 „Unable to Use Claude After Modifying the System Prompt" (7 Kommentare); #861 vier Patches schlagen auf CC 2.1.202 fehl; #942 Opusplan[1m]- und Clear-Screen-Patches finden ihre Patterns auf 2.1.227 nicht (2026-08-10); #927 Pattern-Highlighter silently skipped (Windows); #706 „What's the latest supported version?"; #101 Feature-Wunsch: Customizations automatisch über Updates propagieren[^7^].

**Security-Hinweis:** `tweakcc adhoc-patch` führt Custom-Skripte aus — auch von HTTP-URLs (Gist/Pastebin) — mit Nutzerrechten auf der CC-Installation; `--config-url` zieht Remote-Config. Bequem, aber Supply-Chain-Fläche[^6^].

### 4) Piebald-AI/claude-code-system-prompts — 12.267★, 9 offene Issues[^27^]

**Was:** Referenz-Repo: **515 Systemprompt-Teile mit Token-Counts**, extrahiert aus jeder CC-Version (Changelog seit 2.0.14, 255 Versionen, aktuell CC v2.1.229 vom 2026-08-12); Diffs je Release; Aufschlüsselung der Builtin-Tool-Beschreibungen (17 Tools, 0 bis mehrere tausend Tokens), Subagent-Prompts (Task/Plan/Explore), Utility-Prompts (Compaction, WebFetch-Summary, Bash-Analyse, CLAUDE.md-/Output-Style-/Statusline-Erzeugung)[^8^]. Grundlage für tweakcc-Patches, Cache-Audits und Prefix-Budgeting. Kein Tool — Wissensbasis.

### 5) BerriAI/litellm — 56.203★, 4.896 offene Issues, push 2026-08-13[^27^]

**Was:** AI-Gateway/Proxy + SDK für 100+ LLMs; Router mit Retries/Fallbacks/Load-Balancing, Spend-Tracking, Virtual Keys, Budgets; `auto_router`/`complexity_router` mit Tiers (SIMPLE/MEDIUM/COMPLEX/REASONING)[^10^][^11^].

**Caching:** In-Memory, Disk, Redis, S3, GCS, **redis-semantic** (RedisVL/RediSearch) und seit 06/2026 **valkey-semantic** (valkey-search, auch AWS ElastiCache) mit `similarity_threshold` (Default 0,8) und Embedding-Modell; Per-Call-Kontrolle (`no-cache`, `no-store`, `ttl`, `s-maxage`, Namespaces)[^10^][^24^]. **Limitationen:** Response-Cache unterstützt den OpenAI-`/responses`-Endpoint nicht; Setup-Friktion (#14889, #12401: redisvl/RediSearch-Abhängigkeiten); Incident 02/2026: Cache-Eviction schloss in Benutzung befindliche httpx-Clients (Fix v1.81.14.rc.2)[^25^][^23^].

**CC-Relevanz:** Als Team-Gateway vor CC (ANTHROPIC_BASE_URL → LiteLLM) für Budgets/Fallbacks/Keys. **Aber:** Issue #26005 — complexity_router schaltete mitten in der Session GLM→Anthropic um und brach mit `thinking.signature`-400; Modellwechsel mid-session ist für CC giftig (Cache + Thinking-State)[^11^]. Semantischer Antwort-Cache: für CC-Sessions praktisch trefferlos (s. Frage iv), sinnvoll nur für stateless Side-Calls.

### 6) ypollak2/llm-router — 67★, push 2026-08-05[^27^]

**Was:** Routing **ohne Proxy**: `pip install llm-routing` → `llm-router install` richtet CC-Hooks (`UserPromptSubmit` etc.) + MCP-Tools ein. Heuristischer Komplexitäts-Classifier (Regex, ~70 %), Free-first-Fallback-Ketten, `zero_claude`-Modus (Claude-Quota schonen), Policies (u. a. `cost_aggressive` mit OpenRouter-Key für Open-Weight-Pool), lokale SQLite-Telemetrie, Secrets lokal/fail-closed; funktioniert mit 0 API-Keys auf Pro/Max-Subscriptions; `~`-Prefix bypassed Routing. Hersteller-Angabe: 60–80 % Ersparnis für Claude Code; RouterArena #8[^12^].

**Einordnung:** Architektonisch der sauberste Ansatz für CC-Routing ohne Binary-Patch und ohne Proxy — aber jung (67★), Classifier-Güte begrenzt; Free-first bedeutet Qualitätsverlust beim Hauptdialog, wenn nicht gebypassed.

### 7) diegosouzapw/OmniRoute — 46.596★, 423 offene Issues, push 2026-08-12[^27^]

**Was:** Local-first-Gateway (`localhost:20128`) für 338 Provider, 90+ Free-Tiers; 4-Tier-Auto-Fallback (Subscription → API → Cheap → Free); AES-256-GCM-verschlüsselte Keys; 105 MCP-Tools; 19 Routing-Strategien — darunter **`cache-optimized`** (pinnt Requests mit wiederverwendbaren Prefixen auf denselben Account, um Prompt-Cache-Hits zu maximieren)[^13^].

**Token-Hebel:** Gestackte Kompressions-Engines **RTK + Caveman**: 15–95 % Token-Reduktion, ~89 % Ø auf tool-lastigen Sessions (Hersteller); Stufen bis „Aggressive" (progressive Alterung alter Turns), Session-Dedup[^13^].

**Konflikt (wichtig für diese Schicht):** Prompt-Kompression und Anthropic-Prefix-Caching sind **antagonistisch** — jede Byte-Änderung am Verlauf bustet den 0,1×-Cache. OmniRoute lohnt sich daher primär beim Routing auf nicht-Anthropische Billig-/Free-Modelle; bei bezahlten Anthropic-Calls ist Cache-Hygiene (cache-fix) der bessere Hebel. Kompression verändert zudem den Modell-Kontext (Qualitätsrisiko).

### 8) BlockRunAI/ClawRouter — 6.613★, push 2026-08-12[^27^]

**Was:** Agent-nativer Router mit Krypto-Bezahlschiene (USDC via x402, Wallet-Signatur-Auth). 15-dimensionales lokales Scoring (<1 ms), Routing-Profile `free/auto/eco/premium`, Tiers SIMPLE/MEDIUM/COMPLEX/REASONING; Hersteller: 88 % (auto) bzw. 98 % (eco) Ersparnis vs. Opus-Pinning[^9^]. Für Claude Code wird auf das Schwesterprodukt **BRCC** verwiesen[^9^]. **Einordnung:** interessantes Routing-Design, aber Zahlungsmodell-Nische; für CC-Token-Minimierung zweitranging.

### 9) CoderDayton/semantic-cache-mcp — 2★, push 2026-07-28[^27^]

**Was (Namensirrtum aufklären):** **Kein** semantischer LLM-Antwort-Cache, sondern ein **Datei-IO-Cache** als MCP-Server (`smart_read`, `batch_read`, `search`, `edit`). Mechanik exakt, nicht embedding-basiert: `stat()`/mtime-Match → ~5-Token-Stub (99 % Fälle, ~1 ms, keine Disk-IO); mtime-Drift → BLAKE3-Hash-Match → ~5 Tokens; geänderte Datei → Unified-Diff (80–95 %); neu/groß → Summary/Full. Hersteller-Benchmark auf eigenem 41-Datei-Korpus (212.499 Tokens): **98,9 % Token-Ersparnis** über Wiederhol-Phasen[^14^].

**Installation:** MCP in `~/.claude.json` (`uvx semantic-cache-mcp`); **empfohlen: native Datei-Tools blocken** — `~/.claude/settings.json` → `permissions.deny: ["Read","Edit","Write"]`, damit sämtlicher Datei-IO durch den MCP läuft[^14^].

**Einordnung:** Konzeptuell stärkster *direkter* Token-Hebel in dieser Repo-Gruppe (Tool-Outputs sind der größte wachsende Kontextteil), aber: 2★/Einzelautor, Benchmark nur auf eigenem Korpus, Stale-Read-Risiko bei externen Dateiänderungen, MCP sieht allen Datei-IO, und das Blocken nativer Tools ist ein tiefer Eingriff in CC-Verhalten. Pilotprojekt-Status.

## Sekundär-Repos Kurzliste

| Repo | Stand (★, push) | Befund |
|---|---|---|
| **flightlesstux/prompt-caching** | 132★, 2026-06-12 | **Scope-Verifikation bestätigt: NICHT für CC-Sessions.** MCP-Plugin für eigene Anthropic-SDK-Apps (injiziert `cache_control`, analysiert Cacheability). README explizit: „Claude Code already handles prompt caching automatically… You cannot add more caching on top of Claude Code's own sessions, and you don't need to."[^19^] |
| **ruvnet/metaharness** (@metaharness/router) | 574★, 2026-08-11 | Meta-Harness zum Bau eigener Agent-Harnesses (CLI, MCP, Memory); Router-Baustein jung; nicht CC-spezifisch. Beobachten.[^22^] |
| **tkaufmann/claude-gemini-bridge** | 406★, **stale 2025-08-17** | Gemini für Großanalysen aus CC heraus; seit einem Jahr ungepflegt.[^22^] |
| **frsorrentino/fable-director** | 4★, 2026-08-11 | Token-Governance als CC-Plugin: Pre-Budget-Deklaration vor Delegation, Hook blockt Turn bei 3× Estimate, externe Free-Executoren für Bulk, Telemetrie. Ehrlich: +5 % Overhead bei Kleinstaufgaben; ~25 % weniger Tokens bei großen Lesejobs (Hersteller, 2.389 Sessions Telemetrie-Basis).[^21^] |
| **guyoron1/costwise** | 2★, 2026-08-12 | Hooks-basiert: `UserPromptSubmit`-Routing + RTK-Output-Filter (60–90 % Input-Ersparnis Hersteller) + „Ponytail"-Output-Reduktion; kein Proxy. Konzeptuell relevant, winzig.[^20^] |
| **lidge-jun/opencodex** | 9,6k★, 2026-08-12 | Universal-Provider-Proxy für Codex & Claude Code (beliebige LLMs). Alternative zu CCR, primär Codex-fokussiert.[^22^] |
| **aleks-apostle/claude-code-patches** | 67★, **stale 2025-12-09** | Nur ein Patch: Thinking-Traces default-expandiert. Für Token-Minimierung irrelevant.[^22^] |
| **zilliztech/GPTCache** | 8,1k★, **stale 2025-07-11**, 95 offene Issues | Referenz-Implementierung semantischer LLM-Caches (LangChain/llama_index-Integration). Für CC-Sessions ungeeignet (s. Frage iv); Projekt seit >1 Jahr nicht gepusht.[^22^] |
| **OpenRouter-Setup (offizielle Doku + Blog)** | — | **Sauberster Routing-Pfad ohne lokalen Proxy:** `ANTHROPIC_BASE_URL=https://openrouter.ai/api`, OpenRouter-Key als `ANTHROPIC_API_KEY`, **`ANTHROPIC_AUTH_TOKEN=""` explizit leer**, vorher `/logout` (gecachtes OAuth überstimmt Env → model-not-found-Fehler). „Anthropic Skin" reicht Thinking-Blöcke und natives Tool-Use unverändert durch; Provider-Failover unter CC. Modell-Slots via `ANTHROPIC_DEFAULT_OPUS/SONNET/HAIKU/FABLE_MODEL` + `CLAUDE_CODE_SUBAGENT_MODEL`; optionale Gateway-Modellauswahl `CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1`. Empfehlung der Doku: **bei Anthropic-Modellen bleiben** — Kompatibilität nur mit Anthropic-1P garantiert.[^17^][^18^] |

## Cache-Hygiene-Playbook (aus Befunden destilliert)

**Ökonomie:** Cache-Read 0,1× Input, Write 1,25× (5 min) / 2× (1 h). Rechenbeispiel (40k-Prefix, 30 Turns, Opus): $6,30 → $1,13 = **82 % Ersparnis** bei intaktem Cache. Jede Invalidation zahlt Write-Kosten erneut.

**Stufe 0 — kostenlos, sofort, jedermann:**
1. `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1` — live-`git status` im Systemprompt bustet den Prefix bei jedem Edit; spart ~1.800 Tokens/Call[^4^].
2. Modelle **pinnen**: `ANTHROPIC_MODEL`, `ANTHROPIC_SMALL_FAST_MODEL`; dazu `CLAUDE_CODE_DISABLE_LEGACY_MODEL_REMAP=1` (verhindert stilles Remapping nach CC-Updates → Prefix stabil)[^4^].
3. **Keine Mid-Session-Modell-/Effort-Wechsel** (`/model`) — invalidiert Cache und kann Thinking-Signaturen brechen[^11^]. Modellwahl beim Sessionstart.
4. MCP-Server sparsam halten; An/Aus wechselt Tool-Liste → neuer Prefix.
5. `/compact` bewusst einsetzen (invalidiert, ist aber bei sehr langen Sessions günstiger als Volllängen-Re-Send).
6. Diagnostische Slash-Kommandos sparsam — blähen die History (CC#49335)[^4^].
7. `CLAUDE_CODE_DISABLE_1M_CONTEXT=1`, wenn kein 1M-Kontext gewollt (Overage-Schutz, CC#64919)[^4^].

**Stufe 1 — messen statt raten:** Session-Transkripte mit den cache-fix-Analysetools auf Cache-Read-/Create-Verhältnis prüfen (vor Installation möglich)[^4^]. Bei Gateway-Nutzung Statusline/Dashboards (CCR-Logs, OpenRouter-Activity, LiteLLM `/cache/ping`).

**Stufe 2 — Proxy-Fix für Resume-/Lang-Sessions und Quota-Druck:** `claude-code-cache-fix` v4 (Reverse-Modus; Forward-Modus wenn Remote Control gebraucht wird). Erwartung: Hit-Rate von ~82 % → ~95 % auf Warm-Turns[^4^]. Telemetrie unter `~/.claude/quota-status/` beobachten.

**Stufe 3 — Prefix schrumpfen (optional):** tweakcc-Toolsets (ungenutzte Tools raus), kurze CLAUDE.md, Output-Styles diszipliniert. Regel: Prefix-Bytes kosten dank Cache nur 0,1× — aber bei jedem Bust und jedem ersten Turn voll.

**Anti-Patterns:** Prompt-Kompression auf bezahlten Anthropic-Calls (bustet Cache)[^13^]; Mid-Session-Failover zwischen Modellfamilien[^11^]; Free-Model-Rotation mitten in der Session (Rate-Limits 20 req/min, ~200/Tag; Qualitäts- und Privacy-Verlust)[^28^]; semantische Antwort-Caches vor CC hängen (s. iv).

## Konflikte & Fallstricke

1. **Kompression vs. Prompt-Caching:** OmniRoute-RTK/Caveman verändern Verlaufsbytes → 0,1×-Cache dahin. Kompression nur bei non-Anthropic-Billigrouting sinnvoll[^13^].
2. **Modellwechsel mid-session:** LiteLLM complexity_router #26005 (Thinking-Signature-400)[^11^]; CCR-Nutzer berichten analoge Desyncs; CC-seitig behebt cache-fix die Thinking-Desync-400 via `thinking-block-sanitize` (CC#63147)[^4^].
3. **CCR-Subagent-Tag-Injektion** schreibt Modellbeschreibungen in `Agent`/`Task`-Tool-Descriptions → größerer und potenziell churnender Prefix (bei häufigem Modellkatalog-Wechsel)[^3^].
4. **Non-Anthropic-Modelle in CC:** Tool-Calling-Brüche sind die Regel, nicht die Ausnahme (193 offene Tool-Issues CCR; DeepSeek #1378: `reasoning_content`-400 bei jedem Multi-Turn mit Tools; Transformer-Hooks feuern auf diesem Pfad nicht)[^15^][^16^]. OpenRouter-Doku: Kompatibilität nur mit Anthropic-1P garantiert[^18^].
5. **Auth-Fallen bei Gateways:** gecachtes OAuth-Login überstimmt Env-Vars → `/logout` nötig; `ANTHROPIC_AUTH_TOKEN` muss *explizit leer* sein, sonst Fallback/401 (CC#33330: OAuth + gesetzte Env-Vars → 401)[^17^][^23^]. Pro-Subscription + Gateway-Env = bekannte Konfliktquelle.
6. **CC ≥ 2.1.196:** jede nicht-Anthropic `ANTHROPIC_BASE_URL` deaktiviert Remote Control, `/schedule`, claude.ai-MCP-Connectors (CC behandelt Custom-Base-URL wie Bedrock/Vertex-Gateway) — betrifft Router *und* cache-fix-Reverse-Modus; cache-fix-Forward-Modus umgeht das[^4^].
7. **MITM-Sicherheitsfläche:** Forward-Proxy erfordert CA-Installation (`NODE_EXTRA_CA_CERTS`); falsch abgesichert ist das ein Angriffsvektor auf sämtlichen HTTPS-Verkehr der Shell; cache-fix tunnel-t nicht-anthropic Hosts blind, aber ein toter Proxy bricht HTTPS in der Shell (daher scoping per Funktion empfohlen)[^4^].
8. **tweakcc-Bruchzyklus:** Patches scheitern nach CC-Updates (#861, #942); schlimmster Fall: CC unbenutzbar nach Prompt-Edit (#872); `adhoc-patch` von URLs = Supply-Chain-Risiko[^6^][^7^].
9. **Kosten-Paradox des Response-Cachings:** Anthropic-Write-Kosten (1,25×) ohne Treffer-Sicherheit können Kosten *erhöhen*; bei CC steuert CC die `cache_control`-Breakpoints selbst — manuelle Einmischung kontraproduktiv[^19^][^23^].
10. **Stale/Abandoned:** GPTCache (>1 J.), claude-gemini-bridge (1 J.), claude-code-patches (8 M.) — nicht mehr einplanen[^22^].

## Stack-Empfehlung für diese Schicht

**Antwort (i) — Lohnt cache-fix für jeden CC-Nutzer?** Für **--resume-/Lang-Session-Nutzer und alle mit Quota-/API-Kostendruck: ja, klar** — das Projekt existiert genau für diesen $0,50/h→$5–10/h-Fall und misst 95,5 % vs. 82,3 % Hit-Rate[^4^]. Für **jeden** Nutzer: nein — das README selbst nennt vier gute Gründe dagegen (seltene Resumes, kein Quota-Druck, kein Proxy im API-Pfad gewünscht, frische Kurz-Sessions)[^4^]. Empfehlung: erst mit den mitgelieferten Transkript-Tools messen, dann entscheiden. Die **Stufe-0-Env-Hygiene** (Git-Instructions aus, Modelle pinnen, Legacy-Remap aus) lohnt dagegen für jeden, kostet nichts und braucht keinen Proxy.

**Antwort (ii) — Wann claude-code-router und wie ohne Qualitätsverlust?** Sinnvoll bei: Anthropic-Quota erschöpft, echte Multi-Provider-Strategie, Free-/Billigmodelle für Hintergrundarbeit, Long-Context-Overflow (Gemini), Team-Governance. **Ohne Qualitätsverlust:** Hauptdialog + `think` auf Frontier-Niveau lassen (Anthropic oder vergleichbar), Billigmodelle **nur** auf `background`/Subagenten (Titel, Kompaktierung, Fan-out); `longContext` auf große Fenster pinnen; Provider mit **nativem Anthropic-Protokoll** bevorzugen (Anthropic-1P via OpenRouter Skin, DeepSeek-`/anthropic`-Endpoint, Kimi/Z.ai-Native-Pass-Through) statt OpenAI-Format-Transformern; nach Setup Tool-Calling-Smoke-Test (Multi-Turn mit mind. einem Tool-Call), weil Transformer-Pfade wie in #1378 still versagen können[^15^]. Minimalvariante ganz ohne Router: `CLAUDE_CODE_SUBAGENT_MODEL=haiku` (bzw. billiges Gateway-Modell) — kostenloses, sofortiges Rollen-Splitting[^17^][^26^]. Wer keinen lokalen Proxy will: OpenRouter-Nativpfad (3 Env-Vars), bei Anthropic-Modellen bleiben[^17^][^18^].

**Antwort (iii) — Systemprompts patchen (tweakcc)?** **Nur mit Augenmaß.** Der Token-Nutzen ist real aber zweitrangig: Toolsets entfernen „several thousand tokens" aus dem Prefix[^6^] — dank 0,1×-Caching ist das ein kleiner wiederkehrender Betrag (volle Wirkung nur bei Busts/erstem Turn). Größerer praktischer Nutzen: UX/Toolset-Modi (z. B. Research-Toolset), Subagent-Modellwahl, Sichtbarkeit der Prompt-Teile. Dem steht ein **dokumentierter Bruchzyklus** gegenüber (Re-Patch nach jedem CC-Update; Issues #861/#942/#872) plus Binary-Patching und Remote-Skript-Fläche[^7^]. Empfehlung: Für Token-Minimierung **nicht** primär; wer patcht, hält Prompt-Diffs in Git (vom Projekt empfohlen), pinned CC-Auto-Updates auf kontrollierte Fenster und testet nach jedem Re-Patch. Alternative ohne Patch: CLAUDE.md/Output-Styles/Permissions — schwächer, aber bruchfest.

**Antwort (iv) — Semantisches Caching für CC realistisch?** **Nein, nicht als Antwort-Cache.** CC-Sessions sind stateful mit strikt wachsendem Prefix — identische oder ähnliche Gesamt-Requests wiederholen sich praktisch nie; Embedding-Caches (LiteLLM redis-/valkey-semantic, GPTCache) sind für stateless Q&A/FAQ gebaut und liefern hier ~0 Treffer bei Staleness-Risiko (Code-Antworten von gestern sind falsch)[^10^][^22^][^24^]. Hinzu: LiteLLM-Response-Cache deckt `/responses` nicht ab und hatte Setup-/Stabilitätsissues[^23^][^25^]. **Realistisch ist:** (1) serverseitiges Prompt-Caching, das CC schon macht — Hygiene sichern (cache-fix, Stufe 0); (2) **Datei-IO-Caching** (semantic-cache-mcp-Ansatz: mtime/BLAKE3, Diff-Rückgabe) als echter Tool-Output-Hebel — pilotieren, nicht blind vertrauen (2★, eigener Bench)[^14^]; (3) Gateway-Response-Cache höchstens für stateless Nebenaufrufe (Commit-Messages, Klassifikation).

**Empfohlener Schicht-Stack (Bottom-up):**
1. **Alle:** Stufe-0-Env-Hygiene (Playbook).
2. **Quota-/Resume-Nutzer:** + cache-fix v4 (Forward-Modus, wenn Remote Control genutzt wird).
3. **Kostenoptimierer:** + OpenRouter nativ (Anthropic-Modelle) **oder** CCR mit konservativem Rollen-Mapping (background→billig, think/main→stark); kein Mid-Session-Switch.
4. **Optional:** tweakcc-Toolsets (Wartungsloop akzeptieren); semantic-cache-mcp als Pilot für Lese-lastige Workflows.
5. **Explizit nicht:** semantische Antwort-Caches, Mid-Session-Kompression auf Anthropic-Calls, Free-Model-Rotation im Hauptdialog.

## Quellen

[^1^]: github.com/musistudio/claude-code-router — README (v3, Gateway :3456/:3458, Provider-Liste, Kimi/Z.ai-Sponsoring) — https://github.com/musistudio/claude-code-router
[^2^]: claude-code-router v2.0.0 README — config.json `Router`-Rollen (default/background/think/longContext/webSearch), `ccr code`, `ccr restart` — https://raw.githubusercontent.com/musistudio/claude-code-router/v2.0.0/README.md
[^3^]: claude-code-router Docs „Routing" (repo docs/src) — Built-in CC-Route, `<CCR-SUBAGENT-MODEL>`-Tag-Injektion, Regelbedingungen — https://github.com/musistudio/claude-code-router/tree/main/docs
[^4^]: github.com/cnighswonger/claude-code-cache-fix — README v4.0.0 (3 Resume-Bugs, 95,5 %/82,3 % A/B, 94,66 %/92,44 % Dogfood, Extensions, Forward/Reverse-Modus, CC≥2.1.196-Einschränkung, `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1` ~1.800 Tokens, Env-Empfehlungen, Bootstrap-Disclosure) — https://github.com/cnighswonger/claude-code-cache-fix
[^5^]: cache-fix offene Issues (GitHub API, 2026-08-13): #127/#263 Cache-Warmer, #293 ca-trust.d, #330 CACHE_CREATE_RATE_1H, #326 anthropic-beta-Toggling — https://github.com/cnighswonger/claude-code-cache-fix/issues
[^6^]: github.com/Piebald-AI/tweakcc — README v4.0.0 (cli.js-/Bun-Patching via node-lief, `~/.tweakcc`, `--apply`/Backup-Restore, Systemprompt-Markdown-Workflow, Toolsets „several thousand tokens", adhoc-patch/config-url, verifiziert CC 2.1.162) — https://github.com/Piebald-AI/tweakcc
[^7^]: tweakcc offene Issues (GitHub API, 2026-08-13): #872, #861, #942, #927, #922/#921, #706, #101 — https://github.com/Piebald-AI/tweakcc/issues
[^8^]: github.com/Piebald-AI/claude-code-system-prompts — 515 Prompts mit Token-Counts, Changelog 255 Versionen seit 2.0.14, Stand CC v2.1.229 — https://github.com/Piebald-AI/claude-code-system-prompts
[^9^]: github.com/BlockRunAI/ClawRouter — README (15-Dimensionen-Scoring, Profile free/auto/eco/premium, 88 %/98 % Ersparnis, x402/USDC, BRCC-Verweis) — https://github.com/BlockRunAI/ClawRouter
[^10^]: github.com/BerriAI/litellm + Caching-Doku (In-Memory/Redis/S3/GCS/Disk/redis-semantic; Per-Call no-cache/no-store/ttl) — https://github.com/BerriAI/litellm · https://docs.litellm.ai/docs/caching/all_caches
[^11^]: LiteLLM Issue #26005 — complexity_router: Thinking-Signature-400 nach Mid-Session-Wechsel GLM→Anthropic — https://github.com/BerriAI/litellm/issues/26005
[^12^]: github.com/ypollak2/llm-router — README (`pip install llm-routing`, Hooks statt Proxy, zero_claude, ~70 %-Classifier, 60–80 %, fail-closed) — https://github.com/ypollak2/llm-router
[^13^]: github.com/diegosouzapw/OmniRoute — README (338 Provider, RTK+Caveman 15–95 %/~89 %, 4-Tier-Fallback, 19 Strategien inkl. cache-optimized, AES-256-GCM) — https://github.com/diegosouzapw/OmniRoute
[^14^]: github.com/CoderDayton/semantic-cache-mcp — README (smart_read/batch_read; mtime/BLAKE3/Diff; 98,9 % Bench auf 41 Dateien; `permissions.deny: Read,Edit,Write`) — https://github.com/CoderDayton/semantic-cache-mcp
[^15^]: claude-code-router Issue #1378 — DeepSeek V4 Thinking + Tool-Calls: `reasoning_content`-400; Transformer-Hooks feuern nicht auf /v1/messages-Pfad — https://github.com/musistudio/claude-code-router/issues/1378
[^16^]: claude-code-router Issue-Suche „tool" (193 offene Issues; u. a. #1643 tool_result-Verlust openai_responses, #1397 korrupte Tool-Call-Deltas) — https://github.com/musistudio/claude-code-router/issues
[^17^]: OpenRouter Docs — Claude Code Integration (ANTHROPIC_BASE_URL=https://openrouter.ai/api, AUTH_TOKEN explizit leer, /logout, Modell-Slot-Env-Vars, Gateway-Discovery) — https://openrouter.ai/docs/cookbook/coding-agents/claude-code-integration
[^18^]: OpenRouter Blog — „Claude Code with OpenRouter: Setup, Models, and Costs" (Anthropic Skin, Failover, Empfehlung Anthropic-1P) — https://openrouter.ai/blog/tutorials/claude-code-openrouter/
[^19^]: github.com/flightlesstux/prompt-caching — README (Scope-Hinweis: nicht für CC-Sessions; cache_control-Injection für eigene SDK-Apps) — https://github.com/flightlesstux/prompt-caching
[^20^]: github.com/guyoron1/costwise — README (Hooks: UserPromptSubmit-Routing, RTK-Filter, Ponytail) — https://github.com/guyoron1/costwise
[^21^]: github.com/frsorrentino/fable-director — README (Pre-Budget-Hooks, 3×-Block, ~25 % weniger Tokens bei Lesejobs, +5 % Overhead, 2.389-Sessions-Telemetrie) — https://github.com/frsorrentino/fable-director
[^22^]: GitHub-API-Metadaten (2026-08-13): ruvnet/metaharness 574★; tkaufmann/claude-gemini-bridge 406★ (stale 2025-08); lidge-jun/opencodex 9,6k★; aleks-apostle/claude-code-patches 67★ (stale 2025-12); zilliztech/GPTCache 8,1k★ (stale 2025-07, 95 offene Issues)
[^23^]: anthropics/claude-code Issue #33330 — OAuth bricht bei gesetztem ANTHROPIC_AUTH_TOKEN/BASE_URL (401); OpenEDX LLM-Caching-ADR (LiteLLM-Cache-Limitation /responses; Anthropic-Write-Kosten-Warnung) — https://github.com/anthropics/claude-code/issues/33330 · https://docs.openedx.org/projects/openedx-ai-extensions/en/latest/decisions/0004-llm-caching-strategy.html
[^24^]: LiteLLM Blog — Semantic Caching auf Valkey/ElastiCache (`type: valkey-semantic`, similarity_threshold 0,8) — https://docs.litellm.ai/blog/valkey_semantic_caching
[^25^]: LiteLLM Blog — Incident Report: Cache-Eviction schloss aktive httpx-Clients (02/2026, Fix v1.81.14.rc.2); Issues #14889/#12401 (redis-semantic Setup) — https://docs.litellm.ai/blog/tags/caching
[^26^]: andrewbaker.ninja — ANTHROPIC_BASE_URL-Guide (DeepSeek-`/anthropic`-Endpoint, Tiered-Model-Skript, `CLAUDE_CODE_SUBAGENT_MODEL`, settings.local.json-Scoping) — https://andrewbaker.ninja/2026/08/10/how-to-run-claude-code-on-openrouter-and-deepseek-the-anthropic_base_url-guide/
[^27^]: GitHub-API-Repo-Metadaten der Primär-Repos, abgerufen 2026-08-13 (Stars/Open-Issues/Push-Daten wie in den Profilen)
[^28^]: MindStudio-Blog — OpenRouter-Free-Models mit CC (Rate-Limits 20 req/min, ~200/Tag je Modell; Rotations-Workaround) — https://www.mindstudio.ai/blog/open-router-free-models-claude-code-cost-reduction
