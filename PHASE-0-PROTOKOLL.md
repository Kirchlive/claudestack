# PHASE-0-PROTOKOLL

**Erhoben:** 2026-08-13 · **Maschine:** WSL2 Ubuntu 24.04 (`rob@`), Claude Code 2.1.231
**Bezug:** `repos_v2/UMSETZUNGSPLAN-claude-code-integration.md` §PHASE 0 (AP-0.1 … AP-0.6)
**Gate P0:** Vorher/Nachher-`/context`-Differenz · Root-`CLAUDE.md` ≤ 4 KB · genau ein mutierender `PreToolUse:Bash`-Hook

---

## 0. Kernbefund: Es gibt nichts zu subtrahieren

Phase 0 ist im Plan als **reine Subtraktion** konzipiert — 25 aktive Plugins kürzen, eine 8,4 KB große Root-`CLAUDE.md` entschlacken, drei mutierende Bash-Hooks auf einen reduzieren. **Keine dieser drei Voraussetzungen liegt auf dieser Maschine vor.** Die Ausgangslage ist bereits minimal.

Damit bestätigt sich Risiko **R-2** des Plans empirisch: die Akzeptanzwerte des Korpus (25 Plugins, 1.975 Token Prefix, 5 `PreToolUse:Bash`-Handler, 8 Kollisionsbefunde) sind fremdmaschinenspezifisch und dürfen nicht als Gates übernommen werden. Sie beschreiben eine andere Installation.

---

## 1. Ist-Zustand der Kontextflächen

### 1.1 Gemessene Token (Tokenizer `tiktoken/o200k_base`, identisch zur Referenzmessung F-5)

| Fläche | Bytes | Tokens | sha256[:12] |
|---|---:|---:|---|
| Root-`CLAUDE.md` (`~/.claude/CLAUDE.md`) | — | — | **nicht vorhanden** |
| Projekt-`CLAUDE.md` (`.claude-tweak/CLAUDE.md`) | — | — | **nicht vorhanden** |
| `~/.claude/settings.json` | 994 | 280 | `464f4c199498` |
| **Summe** | **994** | **280** | |

### 1.2 Vergleich zur Referenzmaschine des Korpus

| Fläche | Referenz (F-5, doppelt verifiziert) | Diese Maschine | Delta |
|---|---:|---:|---:|
| Root-`CLAUDE.md` | 8.416 B / 1.975 Tok | 0 / 0 | **−1.975 Tok** |
| `settings.json` | 10.707 B / 2.984 Tok | 994 B / 280 Tok | **−2.704 Tok** |
| **Summe** | **4.959 Tok** | **280 Tok** | **−4.679 Tok** |

Der Referenzwert 1.975 Token ist laut Meta-Validierung §8 der einzige Wert des gesamten Korpus, den GPT56 und OPUS5 unabhängig voneinander aufs Token identisch gemessen haben. Er ist als Vergleichsanker belastbar — aber er beschreibt nicht diese Installation.

> **Offen (AP-0.1/AP-0.3):** Die `/context`-Messung mit einer festen Aufgabe muss der Nutzer selbst ausführen; sie ist von außen nicht abrufbar. Erst sie liefert die vollständige Baseline inklusive Systemprompt, Werkzeugschemata und Skill-Listing — die hier gemessenen 280 Token decken nur die dateibasierten Flächen ab.

---

## 2. Hook-Inventur (AP-0.5)

| Event | Matcher | Kommando | Herkunft | Mutationsart | Prüfung |
|---|---|---|---|---|---|
| `PreToolUse` | `Skill` | `ccstatusline --hook` | `ccstatusline-managed` | **keine** | stdout leer, Exit 0 |
| `UserPromptSubmit` | — | `ccstatusline --hook` | `ccstatusline-managed` | **keine** | stdout leer, Exit 0 |

**Verifikationsmethode:** beide Hooks mit synthetischem stdin-Payload aufgerufen; keiner gibt stdout aus, keiner setzt `permissionDecision`, `updatedInput` oder `updatedToolOutput`. Es sind reine Observer für die Statuszeile.

**Ergebnis gegen Gesetz I (L-1):**

| Fläche | Mutierende Owner | Bewertung |
|---|---:|---|
| `PreToolUse:Bash` | **0** | Gate verlangt „genau einer"; null ist konform (unbesetzt), nicht defekt |
| `PostToolUse:Bash` | **0** | frei für den Dispatcher ab Phase 6 |
| Prefix / Read / Session | **0** | unbesetzt |

Die im Plan geforderte Reduktion von drei auf einen Bash-Mutator entfällt — es gibt keinen.

---

## 3. Plugins und Werkzeuge (AP-0.2, AP-0.6)

**Als Claude-Code-Plugins aktiviert: keine.** `enabledPlugins` ist leer; registriert ist nur der Marketplace `claude-plugins-official`, ohne installierte Plugins. Die Plugin-Diät gegen 25 aktive Plugins entfällt ersatzlos, ebenso die Prüfung der 10 deaktivierten Plugins auf weiterlaufende Shell-Hooks (AP-0.6).

**Aber:** mehrere Werkzeuge des Korpus sind npm-global installiert (`~/.npm-global/lib/node_modules`):

| Paket | Fläche laut Korpus | Bewertung im Korpus | Zustand hier |
|---|---|---|---|
| `@dietrichgebert/ponytail` | Verhalten | einziger Tier-1-Beleg (−10,3 %, p=0,004) | installiert, **nicht** in Claude Code eingebunden |
| `@colbymchenry/codegraph` | Retrieval | konditional mit Versionspin | installiert, nicht eingebunden |
| `context-mode` | Externe Massendaten | **Lizenz-Fence Elastic 2.0** (L-8) | installiert, nicht eingebunden |
| `caveman` / `caveman-installer` | Verhalten | 66 (v5.1) | installiert, nicht eingebunden |
| `claude-code-cache-fix` | Proxy | GPT56 `reject`, 39 — schlechteste Issue-Bilanz des Felds | installiert, nicht eingebunden |
| `ccstatusline` | — | nicht im Korpus bewertet | **aktiv** (Statuszeile + 2 Observer-Hooks) |

**Befund:** Diese Pakete liegen auf der Platte, beeinflussen aber den Kontext nicht — sie sind weder als Plugin aktiviert noch als Hook registriert noch als MCP-Server eingebunden. Sie kosten null Token. Eine „Diät" wäre hier Aufräumen des Dateisystems, keine Token-Maßnahme. **Vor jeder späteren Aktivierung gilt L-3 (Messung vor Installation) und für `context-mode` die Lizenzsperre L-8.**

---

## 4. Native env-Deckel (Vorgriff Phase 1)

Gesetzt ist genau eine Variable, und zwar nicht aus dem Plan:

| Variable | Wert | Zweck |
|---|---|---|
| `CLAUDE_CODE_FORK_SUBAGENT` | `"1"` | schaltet den Fork-Subagent-Typ frei (Arbeitsmittel dieser Umsetzung, kein Token-Deckel) |

Die fünf Deckel aus Phase 1 (`MAX_MCP_OUTPUT_TOKENS`, `BASH_MAX_OUTPUT_LENGTH`, `TASK_MAX_OUTPUT_LENGTH`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`) sind **nicht gesetzt** — weder in `settings.json` noch in der Shell-Umgebung. Ausgangslage „0 von 5", sauberer Kontrollarm für die Einzelmessungen der Phase 1.

**Korrektur (nachgetragen, siehe P0-4):** `ENABLE_TOOL_SEARCH` ist **gesetzt** — aber nicht in `settings.json`, sondern als Shell-Export in `~/.bashrc:163` (`export ENABLE_TOOL_SEARCH=true`). Claude Code startet als Kindprozess der Shell und erbt die Variable; in der Prozessumgebung (`/proc/<pid>/environ`) ist sie nachweisbar aktiv.

Damit steht der Ist-Zustand zwischen zwei Empfehlungen des Korpus:

| Quelle | Empfehlung | Begründung |
|---|---|---|
| Umsetzungsplan AP-1.6 | **nicht setzen** | auf dem direkten Anthropic-Pfad ist Tool Search bereits Default (`auto` = 10-%-Vorab-Schwelle); nie pauschal `false` |
| Meta-Validierung §9 / OPUS5 Runde 2 | **`true` setzen** | `unset` = `auto` = Schwellenmodus; tokenminimal ist `true` (Issue #19890) |

Beide meinen dieselbe Sache aus verschiedenen Blickwinkeln: AP-1.6 warnt vor `false`, OPUS5 empfiehlt `true` gegenüber `auto`. Der vorgefundene Zustand folgt OPUS5. **Er wird nicht verändert** — aber er ist kein neutraler Kontrollarm mehr: eine spätere A/B-Messung der Tool-Search-Fläche müsste ihn als gesetzten Arm behandeln.

Nebenbefund: `ENABLE_TOOL_SEARCH` in der Shell zu setzen ist die einzig wirksame Methode für Variablen, die Claude Code vor dem Lesen von `settings.json` auswertet — dasselbe Muster, das der Plan für `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` als Fallback vorsieht (AP-1.5, Fehlerregister F5).

Nebenbefund: `autoCompactEnabled` steht auf `false`. Das berührt AP-1.5 — ein `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` hätte bei abgeschaltetem Autocompact keine beobachtbare Wirkung. Die Reihenfolge ist bei der Pilotierung zu beachten.

---

## 5. Toolchain

| | vorher | jetzt | Weg |
|---|---|---|---|
| Node | 22.23.2 (NodeSource/apt) | **24.19.0 LTS** | nvm, Default gesetzt |
| npm | 12.0.2 | 11.17.0 (Node-24-gebündelt) | mit Node |
| Python | 3.12.3 (System) | **3.14.0** zusätzlich | `uv`, System-3.12 unangetastet |

Eingriff dabei: `prefix=~/.npm-global` musste aus `~/.npmrc` entfernt werden (Backup `~/.npmrc.bak-20260813`), weil nvm sonst still auf System-Node zurückfällt. Die dort installierten Pakete bleiben über den PATH-Eintrag in `.bashrc` erreichbar.

**Wirksamkeitsgrenze:** Node 24 greift in interaktiven Shells. Nicht-interaktive Shells sehen weiterhin System-Node 22.23.2, weil Ubuntus `.bashrc` vor dem nvm-Block abbricht. Für `npm test` in Phase 4 ist nvm explizit zu sourcen.

---

## 6. Fail-loud-Befunde

| # | Befund | Konsequenz |
|---|---|---|
| P0-1 | **`validate/03-measure-token-surfaces.py` ist nicht unverändert lauffähig.** Seine `selected()`-Funktion filtert auf die alte Repo-Struktur (`GPT56SOL_ULTRA_Validation/`, `OPUS5_MAX_Validation/`, `K3SWARM_MAX_Validation/`, `Squeez-RTK-Ladder/`); im vorliegenden Checkout trifft kein Pfad zu → 0 Records → `IndexError` an `records[0]` (Zeile 117). Der Plan führt es in §5.1 als „✅ lauffähig, kein Archiv". | Aufnahme ins Defektregister (AP-5.3); Pfadfilter beim Umzug nach `scripts/` anpassen. Die Messung in §1.1 wurde ersatzweise direkt mit `o200k_base` erhoben. |
| P0-2 | **Zwei Hooks waren registriert, obwohl der erste Blick auf `settings.json` keine zeigte** — sie kamen durch `ccstatusline` hinzu. Nicht angenommen, sondern durch Aufruf geprüft. | Verfahren für Phase 6 übernehmen: Hook-Registrierungen vor jeder Messung neu inventarisieren, nie aus dem Gedächtnis. |
| P0-3 | **Die `/context`-Baseline fehlt weiterhin** und ist von hier aus nicht erhebbar. | AP-0.1/AP-0.3 bleiben offen; Gate P0 ist bis dahin **nicht** vollständig erfüllt. Wird nicht als bestanden gewertet (L-6). |
| P0-4 | **Diese Erhebung war unvollständig.** Die erste Fassung prüfte env-Variablen nur in `settings.json` und führte `ENABLE_TOOL_SEARCH` als ungesetzt. Tatsächlich exportiert `~/.bashrc:163` sie auf `true`; Claude Code erbt sie als Kindprozess der Shell. Gefunden nicht bei der Erhebung, sondern beim Schreiben von `config/settings.patch.json` in Phase 5 (dort als D14 registriert). | §4 korrigiert. **Verfahrensregel für alle künftigen Ist-Erhebungen:** Umgebungsvariablen sind in drei Quellen zu prüfen — `settings.json`, die Shell-Profile (`~/.bashrc`, `~/.profile`, `~/.zshrc`) und die tatsächliche Prozessumgebung (`/proc/<pid>/environ`). Nur die dritte ist beweisend, die ersten beiden erklären das Zustandekommen. |

---

## 7. Gate-Bewertung P0

| Kriterium | Status | Begründung |
|---|---|---|
| Vorher/Nachher-`/context`-Differenz dokumentiert | ❌ **offen** | Messung nur durch den Nutzer möglich (P0-3) |
| Root-`CLAUDE.md` ≤ 4 KB | ✅ **erfüllt** | existiert nicht (0 B) |
| Genau ein mutierender `PreToolUse:Bash`-Hook | ✅ **erfüllt** | null Mutatoren; Fläche unbesetzt und frei für den Dispatcher |
| Protokoll vorhanden | ✅ | dieses Dokument |

**Gesamt: teilweise erfüllt.** Die Subtraktionsziele sind erreicht, weil nichts zu subtrahieren war. Die Referenzzahl, gegen die Phase 6 misst, fehlt und muss vom Nutzer erhoben werden — bevorzugt jetzt, solange der Zustand unverändert ist, damit sie als echte Nullmessung taugt.

### Empfohlenes Vorgehen für die offene Messung

1. Eine feste, wiederholbare Aufgabe definieren (der Plan verlangt dieselbe für alle Vergleiche).
2. `/context` in frischer Session ausführen, Ausgabe vollständig protokollieren.
3. Diese Zahl ist die Baseline — jede spätere Messung (Phase 1 je Deckel, Phase 6 Shadow) läuft gegen sie.

Da diese Maschine keine Altlast trägt, ist die Zweitmessung nach „Diät" gegenstandslos; die Erstmessung ist zugleich die Referenz.
