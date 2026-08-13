## 15. Das Regelwerk: bash-dump-guard.mjs, Ladder und Konfigurations-Vorlagen

Die zentrale Erkenntnis dieses Reports vorweg: Das eigentliche Produkt ist nicht das einzelne Tool, sondern das Regelwerk, in dem es läuft. Dieselben Werkzeuge wirken oder schaden je nach Verdrahtung — ein Rewrite-Hook mit `permissionDecision: "allow"` hat bei rtk sämtliche Deny-Rules der Nutzer ausgehebelt[^2^]; ein blockierender PreCompact-Hook hat bei MemPalace die Compaction unlösbar verklemmt[^21^]; Regex-basierte Command-Guards lassen sich über Compound-Befehle austricksen[^4^]. Umgekehrt erzeugt ein kleiner, korrekt verdrahteter Guard mehr realen Effekt als drei weitere Kompressions-Tools. Dieses Kapitel liefert das Regelwerk als installierbare Referenz: Design-Prinzipien (15.1), den Guard `bash-dump-guard.mjs` als lauffähige Skizze (15.2), das Ladder-Eskalationsmodell (15.3) und die zugehörigen Konfigurations-Vorlagen samt Messkette (15.4).

### 15.1 Design-Prinzipien für Guards

Sechs Prinzipien, jedes aus einem dokumentierten Schadensfall abgeleitet:

1. **Output-seitig statt command-seitig.** Token-Guards gehören in PostToolUse auf das Ergebnis, nicht in PreToolUse auf die Befehlssemantik. Die Marktanalyse von claude-command-policy zeigt: Die Star-Führer (damage-control, karanb192) matchen Regex auf den ganzen Command-String und scheitern an gequoteten Separatoren und `&&`-Ketten; selbst der AST-basierte warden hat mit Issue #123 eine offene Lücke — `for/while/if`-Konstrukte liefern `allow` und umgehen alle Regeln inklusive `alwaysDeny`[^4^][^5^]. Wer keinen Parser vendorn will, verzichtet konsequent auf Command-Analyse. Ein Guard, der nur Output-Größe und Wiederholung betrachtet, umgeht die Compound-Falle konstruktiv.
2. **Fail-open.** Jeder Fehler (korruptes stdin-JSON, I/O-Problem) endet in Exit 0 ohne Entscheidung. Ein Guard, der Arbeit blockiert, wird deinstalliert — overloop und CodeBurns Budget-Hooks sind beide explizit fail-open ausgelegt[^1^][^14^].
3. **Niemals `permissionDecision: "allow"` emittieren.** rtk-Issue #260 belegt: Ein Hook, der pauschal `allow` plus `updatedInput` zurückgibt, umging die komplette Permission-Kette inklusive aller `deny`-Regeln — `git push --force` lief trotz konfiguriertem Verbot[^2^]. Zwar behauptet die aktuelle Hook-Dokumentation, eine Hook-Entscheidung überstimme nie eine deny/ask-Regel[^3^]; der dokumentierte Bug rät zum defensiven Verzicht. Dieser Guard kennt nur zwei Ausgänge: `deny` oder pass-through.
4. **State pro Session, weil der Hook ein frischer Prozess ist.** Jeder Hook-Aufruf startet einen neuen Prozess; Zustand muss auf Disk, keyed by `session_id` — das overloop-Muster[^1^].
5. **Deny-Respekt.** Riskante Befehle bleiben unangetastet („unwrapped"): Der Guard ersetzt keine Kommandos, schreibt keine Inputs um und fasst sicherheitsrelevante Pfade nicht an. Was `permissions.deny` abfängt, erreicht den Guard gar nicht erst.
6. **stderr bzw. Deny-Reason muss eine Alternative nennen.** Ein Block ohne Handlungsalternative schickt das Modell in eine Retry-Schleife, die selbst Tokens verbrennt; die Praxis-Note aus dem Totalum-Playbook ist eindeutig: Der Block-Text muss sagen, was stattdessen zu tun ist[^6^].

Diese Prinzipien sind keine Stilfrage, sondern die Differenz zwischen „Guard hilft" und „Guard ist selbst das Problem". Tabelle 15.1 ordnet jedem Prinzip den auslösenden Issue-Befund und die konkrete Konsequenz für das Referenz-Design zu.

**Tabelle 15.1 — Guard-Prinzipien, Issue-Befunde, Design-Konsequenzen**

| Prinzip | Dokumentierter Schadensfall | Konsequenz im Referenz-Design |
|---|---|---|
| Output-seitig statt command-seitig | warden #123: `for/while/if` umgeht `alwaysDeny`[^5^]; Regex-Ganzzahl-Matching bei damage-control/karanb192[^4^][^7^] | Guard liest nur Output-Größe/Wiederholung; kein Command-Parsing, kein Compound-Problem |
| Fail-open | overloop-Philosophie; CodeBurn guard-Hooks fail-open[^1^][^14^] | Jeder `catch` endet in `process.exit(0)` |
| Nie `allow` | rtk #260: Rewrite-Hook umging alle Deny-Rules[^2^] | Nur `deny` oder nichts; Kürzung via `updatedToolOutput` in PostToolUse (verändert nur, was das Modell sieht)[^3^] |
| State pro Session | Hook-Prozess ist zustandslos (overloop `~/.overloop`)[^1^] | `~/.bash-dump-guard/<session_id>.json` + Spill-Verzeichnis pro Session |
| Deny-Respekt | rtk #260 als Negativbeleg[^2^] | Kein Rewrite, kein `updatedInput`; Sicherheit bleibt bei `permissions.deny` |
| Alternative in der Block-Reason | Retry-Schleifen ohne Alternative[^6^] | Jede Deny-Reason nennt Retrieve-Pfad oder Strategiewechsel |

Die Tabelle zeigt ein Muster, das sich durch das gesamte Research-Material zieht: Jede Zeile ist eine bezahlte Rechnung der Community. Die Compound-Lücke und der rtk-Bypass sind keine theoretischen Risiken, sondern reproduzierte Bugs in den jeweils populärsten Tools ihrer Kategorie — Popularität korreliert hier invers mit technischer Korrektheit[^4^]. Wer die sechs Prinzipien beim Selbstbau oder bei der Tool-Auswahl anlegt, filtert damit den Großteil des Marktes weg: LLM-in-the-loop-Approval-Hooks scheiden aus (kosten selbst Tokens, probabilistisch statt deterministisch), Command-Rewriter scheiden aus (rtk-Muster), blockierende State-Hooks scheiden aus (MemPalace-Muster). Übrig bleibt ein schmales, aber belastbares Design-Fenster — und genau darin sitzt der folgende Guard. Zugleich erklärt die Tabelle, warum das Referenz-Design bewusst klein ist: Jede Funktion, die man weglässt (Rewrite, Allow, Command-Analyse), ist eine Angriffs- oder Fehlerfläche weniger. Der Guard ist in unter einer Sekunde Laufzeit budgetiert, weil Hook-Latenz im Hot-Path liegt und Audit-Aufgaben asynchron laufen müssen[^8^].

### 15.2 bash-dump-guard.mjs — Referenz-Design

**Ziel:** Ein einziger Node-Hook (`.mjs`, Node ≥ 18, keine Dependencies — Claude Code bringt Node ohnehin mit), der das bewährte overloop-Muster[^1^] als ausbaubare Referenz implementiert: **Loop-Guard** (PreToolUse: identischer Call ab der dritten Wiederholung in Folge geblockt), **Spill** (PostToolUse: Output > 2.000 Tokens wandert in eine Spill-Datei unter `~/.bash-dump-guard/spill/<session>/`; das Modell bekommt eine Preview von je ~40 Zeilen Kopf und Fuß plus Retrieve-Pfad) und **Dedup-Guard** (identisches Output bzw. erneutes Lesen einer unveränderten Datei → Block bzw. Ein-Zeilen-Ersatz). Die Datei-Struktur:

```
~/.claude/hooks/bash-dump-guard.mjs     # der Hook
~/.bash-dump-guard/<session_id>.json    # State: Fingerprints, Zähler
~/.bash-dump-guard/spill/<session_id>/<ts>-<hash8>.log   # volle Outputs
```

Die Kernlogik, austüftelt auf Basis der offiziellen Hook-API (stdin-JSON, Exit 0/2, `hookSpecificOutput` mit `permissionDecision` bzw. `updatedToolOutput`)[^3^]:

```javascript
#!/usr/bin/env node
// bash-dump-guard.mjs — PreToolUse (Loop + Read-Dedup) + PostToolUse (Spill + Output-Dedup)
// Vertrag: stdin = Hook-Event-JSON; Exit 0 + optionales JSON auf stdout.
// Regeln: NIEMALS permissionDecision:"allow" (rtk #260); fail-open bei jedem Fehler;
// keine Command-Analyse (Compound-Lücke); jede deny-Reason nennt eine Alternative.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// ---- Tunables (per Env überschreibbar, s. settings.json-Vorlage) ----
const SPILL_TOKENS  = +(process.env.BDG_SPILL_TOKENS  ?? 2000); // >N Tokens → Spill
const PREVIEW_LINES = +(process.env.BDG_PREVIEW_LINES ?? 40);   // Kopf+Fuß je
const LOOP_LIMIT    = +(process.env.BDG_LOOP_LIMIT    ?? 3);    // n-te Wiederholung → deny
const STATE_DIR = join(homedir(), '.bash-dump-guard');

// ---- stdin lesen; fail-open bei jedem Fehler ----
const raw = await new Promise(res => {
  let d = ''; process.stdin.on('data', c => d += c).on('end', () => res(d));
});
let ev; try { ev = JSON.parse(raw); } catch { process.exit(0); }

const PRE_TOOLS  = new Set(['Bash', 'Read']);                  // Loop/Dedup
const POST_TOOLS = new Set(['Bash', 'Read', 'Grep', 'Glob']);  // Spill/Dedup
if (ev.hook_event_name === 'PreToolUse'  && !PRE_TOOLS.has(ev.tool_name))  process.exit(0);
if (ev.hook_event_name === 'PostToolUse' && !POST_TOOLS.has(ev.tool_name)) process.exit(0);

// Token-Schätzung ceil(chars/4) — konservative Größenordnung, ausreichend für Guards
const estTokens = s => Math.ceil((s?.length ?? 0) / 4);
// Fingerprint: sha1(tool_name + canonical(args)) — overloop-Muster
const canon = o => JSON.stringify(o, Object.keys(o ?? {}).sort());
const fp = obj => createHash('sha1').update(canon(obj)).digest('hex');

// ---- State pro Session laden/speichern (Hook-Prozess ist zustandslos) ----
const stateFile = join(STATE_DIR, `${ev.session_id}.json`);
let st = {}; try { st = JSON.parse(readFileSync(stateFile, 'utf8')); } catch {}
st.lastFp ??= null; st.lastN ??= 0; st.outputs ??= {}; st.reads ??= {};
const save = () => { try {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(stateFile, JSON.stringify(st));
} catch {} };
const out = o => { process.stdout.write(JSON.stringify(o)); process.exit(0); };

// ==================== PreToolUse: LOOP-GUARD + READ-DEDUP ====================
if (ev.hook_event_name === 'PreToolUse') {
  const f = fp({ tool: ev.tool_name, args: ev.tool_input });
  const n = (f === st.lastFp) ? st.lastN + 1 : 1;
  st.lastFp = f; st.lastN = n;

  // (a) READ-DEDUP: unveränderte Datei erneut lesen → blocken (Mutation via mtime erkannt)
  if (ev.tool_name === 'Read') {
    const p = ev.tool_input?.file_path;
    let mtime = null; try { mtime = statSync(p).mtimeMs; } catch {}
    if (p && st.reads[p] && st.reads[p].mtime === mtime) {
      save();
      out({ hookSpecificOutput: { hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          `Dedup-Guard: ${p} wurde in dieser Session bereits gelesen und ist ` +
          `unverändert (Inhalt im Kontext bzw. ${st.reads[p].spill ?? 'Transkript'}). ` +
          `Arbeite mit dem vorhandenen Inhalt; bei Änderungsverdacht erst 'git diff'.` }});
    }
    if (p && mtime !== null) st.reads[p] = { mtime };
  }

  // (b) LOOP-GUARD: n-te identische Wiederholung in Folge → deny mit Alternative
  if (n > LOOP_LIMIT) {
    save();
    out({ hookSpecificOutput: { hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        `Loop-Guard: identischer ${ev.tool_name}-Call zum ${n}. Mal in Folge. ` +
        `Ändere die Strategie, statt denselben Befund erneut abzufragen ` +
        `(frühere Volltexte liegen ggf. in ~/.bash-dump-guard/spill/${ev.session_id}/).` }});
  }
  save();
  process.exit(0); // pass-through: Permission-System entscheidet — kein allow!
}

// ==================== PostToolUse: SPILL + OUTPUT-DEDUP ====================
if (ev.hook_event_name === 'PostToolUse') {
  const r = ev.tool_response;
  const text = typeof r === 'string' ? r
    : (r?.content ?? r?.stdout ?? JSON.stringify(r ?? ''));
  const h = fp(text);

  // (a) OUTPUT-DEDUP: identisches Result schon gesehen → Ein-Zeilen-Ersatz
  if (st.outputs[h]) {
    save();
    out({ hookSpecificOutput: { hookEventName: 'PostToolUse',
      updatedToolOutput:
        `[dedup] Identisches Output wie zuvor (~${estTokens(text)} Tokens eingespart). ` +
        `Volltext: ${st.outputs[h]}` }});
  }

  // (b) SPILL: großes Output auslagern, Preview + Retrieve-Pfad zurückgeben
  if (estTokens(text) > SPILL_TOKENS) {
    const dir  = join(STATE_DIR, 'spill', ev.session_id);
    const file = join(dir, `${Date.now()}-${h.slice(0, 8)}.log`);
    try { mkdirSync(dir, { recursive: true }); writeFileSync(file, text); }
    catch { process.exit(0); }                    // fail-open
    st.outputs[h] = file;
    if (ev.tool_name === 'Read' && ev.tool_input?.file_path)
      st.reads[ev.tool_input.file_path] = { ...(st.reads[ev.tool_input.file_path] ?? {}), spill: file };
    save();
    const lines = text.split('\n');
    const preview = lines.length <= PREVIEW_LINES * 2 ? text
      : lines.slice(0, PREVIEW_LINES).join('\n')
        + `\n… [${lines.length - 2 * PREVIEW_LINES} Zeilen / ~${estTokens(text)} Tokens gekürzt] …\n`
        + lines.slice(-PREVIEW_LINES).join('\n');
    out({ hookSpecificOutput: { hookEventName: 'PostToolUse',
      updatedToolOutput:
        `${preview}\n\n[bash-dump-guard] Volltext (${lines.length} Zeilen, ` +
        `~${estTokens(text)} Tokens): ${file}\nBei Bedarf gezielt nachlesen: ` +
        `grep/sed/awk auf diesen Pfad — NICHT den Befehl wiederholen.` }});
  }
  st.outputs[h] ??= '(inline)'; save();
}
process.exit(0);
```

**Registrierung in `settings.json`** (Matcher decken die vier Output-quellen ab, Timeout hält den Hot-Path kurz):

```json
{
  "hooks": {
    "PreToolUse":  [{ "matcher": "Bash|Read",
      "hooks": [{ "type": "command",
        "command": "node ~/.claude/hooks/bash-dump-guard.mjs", "timeout": 5 }] }],
    "PostToolUse": [{ "matcher": "Bash|Read|Grep|Glob",
      "hooks": [{ "type": "command",
        "command": "node ~/.claude/hooks/bash-dump-guard.mjs", "timeout": 5 }] }]
  }
}
```

Drei Betriebsentscheidungen sind bewusst so getroffen. Erstens `.mjs` ohne Dependencies: Claude Code bringt Node mit, der Guard installiert nichts nach und überlebt jedes `npm prune`. Zweitens Timeout-Disziplin: Der Hook läuft im Hot-Path jedes Tool-Calls und muss unter einer Sekunde bleiben; Spill-Schreiben ist O(Output), es gibt kein Netz und keinen LLM im Guard — alles Langsame (Audit, Auswertung) gehört in `"async": true`-Hooks, die null Latenz kosten[^8^]. Drittens bewusstes Under-Triggering: Der Loop-Guard zählt nur Wiederholungen *in Folge* (Reset bei jedem anderen Call), der Spill-Guard feuert erst über 2.000 Tokens, der Dedup-Guard nur bei beweisbar unveränderten Dateien. Das ist die Governor-Lektion — Filter, die unique Daten passieren lassen, halten ihre Decision-Preservation bei 100 %, während aggressive Kompressoren dokumentierte Fehlentscheidungen erzeugen[^13^]. Ein Guard, der zweimal zu wenig blockt, wird behalten; einer, der einmal zu viel blockt, wird deinstalliert.

**Bekannte Grenzen:** Die Form von `tool_response` variiert je Claude-Code-Version (String vs. Objekt) — vor Produktivbetrieb das reale Payload der eigenen Version mit einem Event-Logger nach karanb192-Muster inspizieren[^7^]. `updatedToolOutput` ersetzt das Result nur für das Modell; der Volltext bleibt im Transkript-JSONL, Messtools sehen weiterhin alles (gewollt). Der Loop-Guard zählt nur unmittelbare Wiederholungen — bewusst, um False-Positives bei legitimen `git status`-Serien klein zu halten[^1^]. Und der Read-Dedup-Guard muss mtime-basiert invalidieren: Der claude-mem-Bug #1719 (Read-Cache/Truncation, inzwischen geschlossen) zeigt, was passiert, wenn Truncation/Dedup gegen zwischenzeitlich geänderte Dateien läuft — die Datei wird für den Rest der Session faktisch unlesbar.

### 15.3 Das Ladder-Stufenmodell

„Ladder" ist kein kanonisches Produkt, sondern die operationalisierte Summe konsistenter Community-Muster: die Governor-Empfehlungsleiter compress→split→filter→/clear→/compact[^13^], die clear-nudge-Prämisse „früh clearen ist billiger als spät compactet zu werden"[^10^], der compact-middleware-Trigger bei 85 % Fensterfüllung[^12^] und die Cold-Cache-Ökonomie des context-cost-guard[^11^]. Messbasis für die Kontext-Prozente ist die Statusline (token-tracker liefert einen Ctx-%-Balken[^17^]) oder hook-seitige Transkript-Messung (letzter Usage-Record: `input + cache_read + cache_creation`)[^10^][^11^].

**Tabelle 15.2 — Das Ladder-Stufenmodell: Trigger, Aktionen, Tool-Zuordnung**

| Stufe | Name | Trigger (konkret) | Aktionen / zugeordnete Tools | Kosten der Aktion |
|---|---|---|---|---|
| **0** | Filtern vorm Modell (always-on) | kontinuierlich, kein Schwellwert | bash-dump-guard.mjs (Spill > 2k Tokens, Dedup, Loop-Guard); squeez/context-mode auf der Filter-Schicht (Kap. 7–8); `MAX_MCP_OUTPUT_TOKENS=15000`; deny-Liste für `.env`/`rm -rf`; MCP-Hygiene via `codeburn optimize`[^14^] | ~0 (deterministisch) |
| **1** | Straffen | Kontext 60–70 % **oder** Fallback > 25 Tool-Calls ohne Taskwechsel | clear-nudge gelb (einmaliger Hinweis pro Schwelle)[^10^]; `/rewind` für Fehlversuche (entfernt Sackgassen-Turns statt sie mitzuschleppen); Microcompact-Disziplin: alte Tool-Results nicht erneut quoten, Keep-last-5-Regel[^12^] | ~0 |
| **2** | Compact + Snapshot | Kontext 80–85 % **oder** Taskgrenze (Tests grün, Commit steht) **oder** Fallback > 40 Tool-Calls | PreCompact-Snapshot (Transkript sichern, fail-open!)[^9^]; `/compact` mit Fokus-Instruktion aus CLAUDE.md; magic-compact/rolling-context für lange Sessions (Kap. 9); danach Top-Dateien + Plan re-injizieren[^12^] | 1 LLM-Summary-Call; irreversibel → nur mit Snapshot |
| **3** | Clear + HANDOFF.md | Kontext > 90 % **oder** Cold-Cache-Kombination: ≥ 60k Kontext UND ≥ 55 min idle (jeder weitere Turn kostet ~20× Input)[^11^] **oder** harter Themawechsel | context-cost-guard-Block einmal wirken lassen[^11^]; HANDOFF.md schreiben (Ziel, Stand, offene Tasks, Pfade); `/clear`; Neustart ~41k Tokens + 2 Sätze Kontext ≈ 5 Tool-Calls[^10^]; cache-fix bei `--resume`-Nutzern (Kap. 13) | niedrig mit gutem Handoff; hoch ohne |

Drei Lektionen stecken in dieser Tabelle. Erstens: Die Stufen sind preislich gestaffelt — Stufe 0 und 1 kosten nichts, Stufe 2 kostet einen Summary-Call, und nur Stufe 3 bezahlt den Neustart-Preis, der bei einem sauberen HANDOFF.md auf etwa fünf Tool-Calls komprimierbar ist[^10^]. Wer also früh eskaliert (Stufe 1 bei 60 %, nicht bei 95 %), vermeidet die teuren Stufen fast vollständig; der clear-nudge-Fallbeleg (ein einziges Fenster mit 14.268 Tool-Calls à 500k Tokens fraß 49 % eines Wochenkontingents) zeigt die Kosten des Zuwartens[^10^]. Zweitens: Die Zähler-Fallbacks (>25 / >40 Tool-Calls) sind Pflicht, weil Kontext-Prozente headless oder ohne Statusline nicht verfügbar sind — Trigger-Redundanz ist hier Governance, nicht Luxus. Drittens: Stufe 3 schlägt Stufe 2, sobald die Cold-Cache-Kombination greift, weil dann jeder weitere Turn im alten Fenster rund das 20-Fache an Input kostet[^11^] — ein `/compact` rettet dann Tokens im Fenster, aber nicht mehr Geld auf der Rechnung. Eskalation ist monoton innerhalb eines Tasks und resettet am Taskwechsel; jede Stufe spricht einmal pro Schwelle, nicht jeden Turn, weil Dauer-Nudges selbst zum Kontext-Problem werden[^10^].

### 15.4 Konfigurations-Vorlagen

**settings.json / permissions (Referenz-Vorlage, Kommentare vor Einsatz entfernen):**

```jsonc
{
  // Historie behalten — Default löscht Session-Dateien nach 30 Tagen
  // und zerstört die Messbasis rückwirkend (toktrack-Befund)[^18^]
  "cleanupPeriodDays": 9999999999,
  "env": {
    "MAX_MCP_OUTPUT_TOKENS": "15000",        // MCP-Tool-Outputs deckeln
    "BASH_MAX_OUTPUT_LENGTH": "30000",       // Bash-Output-Deckel (Zeichen)
    "ENABLE_CLAUDEAI_MCP_SERVERS": "false",  // Cloud-MCP-Injection aus (~600+ Tokens/Session)[^23^]
    "BDG_SPILL_TOKENS": "2000",
    "BDG_LOOP_LIMIT": "3"
    // OTEL nur bewusst und NUR user-seitig, niemals in committed
    // Projekt-Settings: Otel-Smuggling (Exfiltration via Projekt-Config)[^19^]
    // "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    // "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:4317"
  },
  "permissions": {
    "deny": [
      "Bash(rm -rf *)", "Bash(git push --force*)", "Bash(git push -f*)",
      "Bash(git reset --hard*)", "Bash(sudo*)",
      "Bash(curl *| sh*)", "Bash(curl *| bash*)",
      "Read(./.env)", "Read(**/.env)", "Edit(./.env)", "Write(./.env)"
    ],
    "allow": [
      "Bash(git status)", "Bash(git diff*)", "Bash(git log*)",
      "Bash(ls*)", "Bash(cat*)", "Bash(rg*)", "Bash(npm test*)"
    ]
    // Faustregel: deny klein & katastrophal halten; Alltagsfreigaben lieber
    // über compound-sicheren Guard (warden) statt Regex-Ganzzahl-allow[^4^]
  },
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash|Read",
        "hooks": [{ "type": "command",
          "command": "node ~/.claude/hooks/bash-dump-guard.mjs", "timeout": 5 }] }
    ],
    "PostToolUse": [
      { "matcher": "Bash|Read|Grep|Glob",
        "hooks": [{ "type": "command",
          "command": "node ~/.claude/hooks/bash-dump-guard.mjs", "timeout": 5 }] },
      // Audit-Trail async (null Latenz im Hot-Path)[^8^]:
      { "hooks": [{ "type": "command",
          "command": "jq -c '{ts: now, s: .session_id, tool: .tool_name, in: .tool_input}' >> ~/.claude/audit.jsonl",
          "async": true }] }
    ],
    "PreCompact": [
      // Snapshot MUSS fail-open sein (|| true): MemPalace #856/#906
      // zeigen, dass ein blockierender PreCompact-Hook die Compaction
      // abbricht und die Session unrettbar verklemmt[^21^][^22^]
      { "hooks": [{ "type": "command",
          "command": "cp \"$CLAUDE_TRANSCRIPT_PATH\" ~/.claude/snapshots/$(date +%s).jsonl || true" }] }
    ]
  }
}
```

**CLAUDE.md-Template** (Anthropic-Vorgabe < 200 Zeilen, Community-Praxis für die Root-Datei < 60 Zeilen — Kap. 14.2; Rule-Files sparsam, weil `.claude/rules` bei jedem Tool-Call re-injiziert wird — in einer gemessenen Session fraßen elf Rule-Files über 30 Tool-Calls ≈ 93k Tokens = 46 % des Fensters (Issue #32057)[^20^]):

```markdown
# Projekt X
- Stack: TypeScript/Next.js, pnpm, Vitest. Tests: `pnpm test`.
- Konventionen: keine Default-Exports; Fehler als Result-Typen.
- Nichts hier, was Claude aus dem Code ableiten kann.

## Compact Instructions
- Keep: aktueller Plan, geänderte Dateien, offene Failing-Tests, HANDOFF.md-Pfad
- Summarize: Explorations-Befunde, Alternativen-Diskussionen
- Drop: Tool-Rohtexte, gelöste Irrläufer, wiederholte Reads
```

**Messkette in 5 Schritten (Installations-Reihenfolge, ~15 Minuten):**

1. **Baseline:** `npx ccusage daily` und/oder `npx codeburn` — historische Auswertung, wo Tokens und Dollars tatsächlich hingehen[^15^][^14^].
2. **Env-Hygiene:** obige `env`- und `permissions`-Blöcke setzen; `cleanupPeriodDays` hochziehen, sonst löscht der 30-Tage-Default die Messbasis[^18^].
3. **Guard:** `bash-dump-guard.mjs` registrieren (Stufe 0) und eine Woche nur beobachten, bevor Schwellen verschärft werden.
4. **Filter/Sandbox + Live-Ampel:** squeez/context-mode nach Kap. 7–8; `uv tool install claude-monitor` für das 5h-Fenster (labelt Schätzwerte ehrlich als `local_estimate` vs. `official`)[^16^] oder token-tracker für den Ctx-%-Balken[^17^].
5. **Wöchentlicher Abgleich:** `codeburn act report` vergleicht realisierte gegen geschätzte Ersparnis (realized vs. estimated, nach ≥ 3 Tagen); monatlich `codeburn optimize` neu laufen lassen[^14^]. Ohne diesen Schritt bleibt jede Ersparnis Behauptung.

Damit schließt sich der Kreis zur Eröffnung: Das Regelwerk ist der Punkt, an dem alle vorherigen Kapitel zu Betrieb werden — die Filter-Schicht (Kap. 7–8) wird zur Stufe-0-Policy, die Compact-Tools (Kap. 9) zur Stufe-2-Routine, das Monitoring (Kap. 4) zur Messkette. Wer nur eines aus diesem Report mitnimmt: Installieren Sie die Messkette zuerst, den Guard danach — und lassen Sie jede Stufe von gemessenen Triggern feuern, nicht von Gefühl.

### Quellen dieses Kapitels

[^1^]: libraries.io/pypi/overloop — overloop 0.3.0 (Fingerprint-/Loop-/Dedup-/Truncate-Design, Spill-File, `~/.overloop`-State), 2026-07-04 — https://libraries.io/pypi/overloop
[^2^]: rtk-ai/rtk Issue #260 — „Security: PreToolUse hook bypasses Claude Code deny rules via permissionDecision: allow", 2026-02-23 — https://github.com/rtk-ai/rtk/issues/260
[^3^]: morphllm.com — Claude-Code-Hooks Event-I/O-Referenz (Exit 0/2, hookSpecificOutput, updatedToolOutput, „hook decision never bypasses deny/ask rule"), 2026-06-18 — https://morphllm.com/claude-code-hooks
[^4^]: YoraiLevi/claude-command-policy — docs/PRIOR-ART.md (Compound-Command-Befund, Popularität-vs.-Qualität), 2026-06-26 — https://github.com/YoraiLevi/claude-command-policy/blob/main/docs/PRIOR-ART.md
[^5^]: banyudu/claude-warden Issue #123 — „for/while/if-Konstrukte liefern allow und umgehen alle Regeln inkl. alwaysDeny" — https://github.com/banyudu/claude-warden/issues/123
[^6^]: totalum.app — „Claude Code Hooks in 2026: A Production Playbook" (stderr muss Alternative nennen, sonst Retry-Schleife), 2026-06-26 — https://www.totalum.app/blog/claude-code-hooks-totalum
[^7^]: karanb192/claude-code-hooks — README (Event-Logger-Muster, Safety-Levels, async-Recorder) — https://github.com/karanb192/claude-code-hooks
[^8^]: thomas-wiegold.com — „Claude Code Hooks" (Hot-Path-Latenz, async-Audit, Hook-Gotchas), 2026-05-10 — https://thomas-wiegold.com/blog/claude-code-hooks
[^9^]: disler/claude-code-hooks-mastery — README (`pre_compact.py` Transkript-Snapshot, Hook-Best-Practices) — https://github.com/disler/claude-code-hooks-mastery
[^10^]: g4itpl/clear-nudge — README (Einmal-pro-Schwelle-Semantik; 49-%-Wochenkontingent-Fall; Neustart ≈ 41k Tokens ≈ 5 Tool-Calls) — https://github.com/g4itpl/clear-nudge
[^11^]: JanBancerewicz/context-cost-guard — README (Cold-Cache-Trigger ≥60k UND ≥55 min idle → ~20× Kosten; fail-open, Snooze) — https://github.com/JanBancerewicz/context-cost-guard
[^12^]: emanueleielo/compact-middleware — README (Trigger 0,85 Fensterfüllung, Microcompact Keep-last-5, Restoration-Muster), 2026-04-02 — https://github.com/emanueleielo/compact-middleware
[^13^]: 0xhimanshu/governor — README v0.2.3 (Empfehlungsleiter compress→split→filter→/clear→/compact, >40 %-Dup-Filter, Telemetry-Ledger) — https://github.com/0xhimanshu/governor
[^14^]: getagentseal/codeburn — README v0.9.20 (optimize/--apply/act report/guard; Hooks fail-open; Soft-Cap $5/Hard-Cap $15) — https://github.com/getagentseal/codeburn
[^15^]: ccusage/ccusage — README (Daily/Weekly/Monthly/Session-Reports, 5h-Blocks, JSON-Export) — https://github.com/ccusage/ccusage
[^16^]: Maciek-roboblog/Claude-Code-Usage-Monitor — README v4.0.0 (5h-Fenster-Prognose, Provenance-Labels official/local_estimate) — https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor
[^17^]: stormzhang/token-tracker — README (4-zeilige Statusline mit Ctx-%-Balken) — https://github.com/stormzhang/token-tracker
[^18^]: mag123c/toktrack — README (`cleanupPeriodDays`-Default 30 löscht Messbasis; audit/Cache) — https://github.com/mag123c/toktrack
[^19^]: bloom.security — „Welcome to Otel Claudeifornia" (Otel Smuggling: Projekt-Settings aktivieren Telemetry auf Angreifer-Endpoint, otelHeadersHelper-RCE), 2026-07-29 — https://bloom.security/blog/welcome-to-otel-claudeifornia
[^20^]: anthropics/claude-code Issue #32057 — „Rules re-injected as system-reminders on every tool call" (93k Tokens / 46 % des Fensters) — https://github.com/anthropics/claude-code/issues/32057
[^21^]: MemPalace/mempalace Issue #856 — „preCompact hook cancels compaction instead of deferring" (block = Abbruch, kein Retry), 2026-04-14 — https://github.com/MemPalace/mempalace/issues/856
[^22^]: MemPalace/mempalace Issue #906 — „preCompact hook prevents compacting when context limit is reached" (unrettbar verklemmte Session), 2026-04-15 — https://github.com/MemPalace/mempalace/issues/906
[^23^]: Growth4U-systems/claude-token-hygiene — README (`ENABLE_CLAUDEAI_MCP_SERVERS=false`, System-Kontext-Overhead 15–35k Tokens) — https://github.com/Growth4U-systems/claude-token-hygiene
