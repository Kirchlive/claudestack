# Changes: KIMI „Claude-Code-Token-Stack-Konzept" → „claude-token-stack-evaluierung-und-merge"

**Was hier verglichen wird:** Das KIMI-Konzept (224K Zeichen, Note 9/10 – das valideste der fünf Agent-Dokumente) war die inhaltliche Basis des Merges. Dieses Dokument zeigt Punkt für Punkt, was der Merge **behalten**, **geändert**, **ergänzt** oder **gestrichen** hat – und warum.
**Grundlage der Änderungen:** Externe Verifikation per GitHub-API (~95 Repos) + Claude-Code-Docs, funktionale Code-Tests (Node-Lauftests aller Guards) und die vier anderen Agent-Outputs (OPUS, GPT, ABACUS, MANUS).

---

## 1. Unverändert übernommen (Validierung hat KIMI bestätigt)

Diese Punkte wurden geprüft und für korrekt befunden – sie stehen im Merge inhaltlich wie bei KIMI:

| KIMI-Element | Status im Merge | Warum unverändert (einfach erklärt) |
|---|---|---|
| Mechanismus-Logik: Vermeiden → Verlagern → Verdichten → Verbilligen | Übernommen als Gliederungsprinzip | Ist das stärkste Ordnungsmodell aller fünf Outputs. Es sortiert Tools nach *Wirkweise* statt nach Hype. |
| ponytail als einziger Tier-1-Tool-Gewinn (−10,3 %, p=0,004) | Kern-Stack, Schicht 2 | JetBrains-Benchmark extern wörtlich bestätigt. Der einzige unabhängig belegte Tool-Gewinn. |
| Messung zuerst: ccusage + codeburn | Kern-Stack, Schicht 0 | Beide Repos verifiziert; „realisiert schlägt geschätzt" bleibt die Governance-Regel Nr. 1. |
| Native Hebel als größter $-Hebel (Env, CLAUDE.md-Disziplin, /clear+HANDOFF) | Kern-Stack, Schicht 1 | Extern bestätigt (Docs, ~1.800 Tokens git-instructions, Cache-Ökonomie). |
| context-mode (MCP-Sandbox, FTS5 überlebt /compact) | Kern-Stack, Schicht 5 | Repo verifiziert, Beschreibung stimmt mit README überein. |
| magic-compact als beste /compact-Alternative | Kern-Stack, Schicht 6 | README-Analyse bestätigt: cache-schonend, Retrieve-Pfad, First-party-Marketplace. |
| cache-fix konditional (Resume/Lang-Sessions, 3 CC-Cache-Bugs) | Profil B | Zahlen (94,66 vs. 92,44 % Hit-Rate) wörtlich verifiziert. |
| llmtrim ODER tokdiet als cache-sicherer Proxy (nur lange Sessions) | Profil B | Beide READMEs bestätigen Net-Win-Gate und ehrliche A/B-Zahlen. |
| planning-with-files (dateibasierte Persistenz) | Kern-Stack, Schicht 8 | Von KIMI, MANUS und ABACUS unabhängig empfohlen – seltene Dreifach-Konvergenz. |
| mcp-compressor konditional (ab ≥2 schweren MCPs) | Kern-Stack konditional | Schwellenlogik (natives Tool Search ~47–85 % reicht darunter) extern bestätigt. |
| Alle harten Absagen: rtk (CVE-2026-33068, +7,6 %), caveman (8,5 % statt 65 %), headroom-Default (#2438), pxpipe/OmniGlyph (Hex-Recall 0–2/15), LLMLingua-2, globale Memory-MCPs, tweakcc als Primärhebel | Vollständig übernommen, inkl. Re-Evaluierungs-Triggern | Die Absagen sind der wertvollste Teil der KIMI-Arbeit: Security-Befunde und Negativ-Messungen sind extern belegt. Kein anderer Agent hatte diese Tiefe. |
| Ladder-Stufenmodell (0 Filter → 1 Straffen 60–70 % → 2 Compact+Snapshot 80–85 % → 3 Clear+HANDOFF >90 %/Cold-Cache) | Übernommen als Regelwerk-Kern | Konkrete Trigger, preislich gestaffelte Stufen, Fallback-Zähler – direkt betriebsfähig. Erfüllt die vom User geforderte „Ladder"-Regelung. |
| Drei Profile A (kurz) / B (lang, 15–30 % Input) / C (Budget-Routing) | Übernommen und präzisiert | Ehrliche Erwartungswerte statt Werbeversprechen; Aktivierungsregeln verhindern Fehlallokation. |
| „Nicht-additiv"-Regel (Prozente nicht summieren) | Übernommen | Nenner-Logik ist korrekt: jede Schicht verkleinert die Basis der nächsten. |

---

## 2. Geändert / Ersetzt

| # | KIMI (vorher) | Merge (nachher) | Warum (einfach erklärt) |
|---|---|---|---|
| Ä1 | **bash-dump-guard.mjs als ~120-zeiliges Referenz-Design** (Skizze in Kap. 15.2: Loop-Guard, Spill >2k, Dedup, fail-open) | **GPT bash-dump-guard.mjs (1.064 Zeilen) als produktive Version**, KIMI-Skizze ersetzt | KIMIs Version ist ein Konzept, GPTs Version ist **funktional getestet**: 96 % Einsparung bei Dumps im Lauftest, Raw-Archiv recoverbar, fail-open, plus Canary-Absicherung. Getesteter Code schlägt Skizze. KIMIs Design-Prinzipien bleiben die Spezifikation, GPT liefert die Implementierung. |
| Ä2 | **squeez als Primär-Output-Filter** (Kern-Stack #3, Alt: tokf) | **bash-dump-guard (GPT) als Primär-Hook**; squeez/quiet-bash/tokf als Turnkey-Alternativen per A/B-Test | Drei Gründe: (1) Der GPT-Guard ist der einzige funktional verifizierte Filter im Gesamtpaket. (2) OPUS favorisiert quiet-bash mit echten Feldmessungen (~14 % über 136 Sessions). (3) KIMI selbst gibt der Filter-Schicht nur „0–3 % der Rechnung" – bei so kleinem Hebel entscheidet der eigene A/B-Test, nicht der Katalog. |
| Ä3 | KIMI-Regelwerk: 3 harte Regeln + 8-zeilige Konflikt-Matrix (Prosa in Kap. 14.1) | **OPUS context-surface-owners.yaml als maschinenlesbare Owner-Registry** (9 Flächen, 8 Invarianten) | Gleiche Idee („genau ein mutierender Owner pro Fläche"), aber als prüfbares YAML-Artefakt statt Prosa. OPUS hat daraus zwei formalisierte Gesetze gemacht; Maschinenlesbarkeit macht Governance auditierbar. |
| Ä4 | Prefix-Disziplin als Teil von Schicht 1 (Env/CLAUDE.md) | **Eigene Prefix-Fläche mit prefix-budget.mjs** (GPT-Version als Basis + 2 OPUS-Features: Hook-Flächen-Kollisionserkennung, Skill-Namenskollisionen) | OPUS hat mit eigenen Messzahlen gezeigt, dass der Prefix der Hebel Nr. 1 ist (~2 % billed saving bei Bash, Prefix kostet mehr) und dafür lauffähigen Code geliefert (Self-Test 7/7 PASS). GPTs Variante ist reifer (Persistenz, korrektes SessionStart-Gating). Der Merge hebt den Prefix von „Disziplin" zu „überwachter Fläche mit Werkzeug". |
| Ä5 | Code-Indizes nur situativ (Einsatzmatrix Kap. 11.2; serena für Edit-Workflows; THOL-Skepsis) | **codegraph als lean-Default-Retriever** (ab ~300 Dateien), sigmap als CLI-Alternative, codebase-memory-mcp für Monorepos; Regel „genau ein Broad-Retriever" | Vier Agents (GPT, OPUS, MANUS, ABACUS) konvergieren auf codegraph; KIMIs Skepsis (THOL: keine E2E-Ersparnis) bleibt als Warnung erhalten, aber die Konvergenz + der Lean-Charakter (null Prefix) rechtfertigen einen Default mit Messpflicht statt reiner Falls-Unterscheidung. |
| Ä6 | Native Limits: settings.json-Vorlage mit `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | GPT native-token-limits.example.jsonc **+ explizites AUTOCOMPACT-Caveat** (bekannte Upstream-Issues: Variable im settings-env ggf. wirkungslos → Shell-Export als Fallback) | Der externe Fakten-Check (Fehlerregister F5) zeigt: Diese Env-Variable hat dokumentierte Wirkungs-Probleme. Ohne den Hinweis würde der Nutzer eine stille Fehlkonfiguration bauen. |
| Ä7 | Repo-Namen teils alt (implizit) | **Umbenennungen nachgezogen:** `NodeNestor/nestor-lean` → `claude-lean-context`; `bodo-run/yek` → `mohsen1/yek`; `chopratejas/headroom` → `headroomlabs-ai/headroom` | GitHub-API-Verifikation (301-Redirects). Tote Namen führen bei Installation zu 404. KIMI hatte 2 der 3 Renames bereits korrekt – der Merge macht es vollständig. |
| Ä8 | 30-Tage-Rollout mit Wochen-Abnahmekriterien (Kap. 16.1) | **MANUS-10-Wochen-Fahrplan mit Gates + GPT-Benchmark-Plan als Messpflicht** (Stop-Regel: keine Schicht ohne messbaren Net-Win) | Kein Agent – auch KIMI nicht – hat eigene Messungen geliefert. Der Merge macht Messung deshalb zur harten Gate-Bedingung: GPT liefert den einzigen Benchmark-Plan mit Stop-Gates, MANUS die einzige Gate-/A/B-Methodik („Verlierer wird entfernt", Rückbauplan). KIMIs Rollout bleibt als Grobstruktur erhalten. |
| Ä9 | Kurzfassung physisch in Sektion 9 (Dokumentmitte) | Kurzfassung an den Dokumentanfang | Redaktioneller Fehler im Original (F10) – eine Kurzfassung gehört nach vorn. |
| Ä10 | ~180 Repos in 15 Schichten (Anhang A) | Repo-Inventar = **OPUS repo-catalog-v3 (251 Repos, maschinenlesbar)** als Single Source of Truth | KIMIs Matrix ist tief, aber Prosa. OPUS liefert 14 Felder pro Repo, MD+JSON synchron, Evidenzstufen – maschinell auswertbar und aktualisierbar. KIMIs Tiefenurteile bleiben als Evidenz-Kommentare referenziert. |

---

## 3. Neu hinzugefügt (stand bei KIMI nicht / nicht so drin)

| # | Neuer Inhalt | Quelle | Warum (einfach erklärt) |
|---|---|---|---|
| N1 | **11 Neufunde** als Nachtrag (u. a. junhoyeo/tokscale, kenn-io/agentsview, u-ichi/compact-plus, giancarloerra/SocratiCode) | Externe Verifikation 2026-08-13 | Die Agents hatten Lücken bei Observability zweiter Reihe und Compact-State-Preservation. compact-plus ist direkt relevant für Ladder-Stufe 2 (Snapshot/State-Erhalt). |
| N2 | **compact-plus zur Evaluation in Schicht 6/7** (Session/State-Preservation) | Neufund N1 | Passt exakt in die Ladder-Logik (PreCompact-Snapshot), die KIMI beschreibt, für die aber kein dediziertes Tool benannt war. |
| N3 | **ABACUS-Discovery-Funde** in den Katalog (u. a. yurukusa/cc-safe-setup mit large-read-guard/read-budget-guard/token-budget-guard, nooscraft/tokuin, alexgreensh/token-optimizer) | ABACUS (verifiziert real) | ABACUS war der einzige Agent mit echter Neusuche; 19 seiner Funde versandeten in dessen eigener Synthese (F13). Der Merge rettet sie in den Katalog. cc-safe-setup passt exakt zum geforderten Guard-Konzept. |
| N4 | **quiet-bash als Turnkey-Favorit** neben squeez (OPUS-Favorit, ~14 % pooled über 136 Sessions) | OPUS (extern bestätigt: README-Notiz stimmt exakt) | KIMI kannte squeez gut, quiet-bash weniger prominent. OPUS' Wahl stützt sich auf die größte dokumentierte Feld-Stichprobe aller Filter-Tools – Aufnahme als gleichberechtigter A/B-Kandidat. |
| N5 | **Fehlerregister F1–F15** (alle gefundenen Fehler aller Agents mit Schwere und Maßnahme) | Evaluierung | Macht die Validierung nachvollziehbar und verhindert, dass bekannte Fehler (z. B. Packaging-Bugs B1/B2: falscher README-Name in SHA256SUMS, Installer ohne Execute-Bit) in die Produktion wandern. |
| N6 | **Vor-Produktions-Fixliste für die Guard-Suite:** F1 README-Checksumme, F2 `chmod +x`, F3 Secret-Redaction-Overlap, F4 stdin-Größenlimit | Code-Prüfung | Funktionale Tests fanden 4 konkrete Bugs. Ohne Fixes schlägt die Paket-Verifikation fehl bzw. Installation auf frischem Checkout. |
| N7 | **Bewertungsmatrix der fünf Agents** mit Rollenzuordnung („Single Sources of Truth") | Evaluierung | Der User wollte wissen, welcher Output wofür zu nutzen ist: KIMI = Lesefassung/Konzept, OPUS = Inventar, GPT = Werkzeuge, MANUS = Rollout-Methodik, ABACUS = Discovery-Erweiterung. |
| N8 | **Konkrete Kern-Stack-Definition** („Profil A Pflicht: ccusage + native Limits + ponytail + bash-dump-guard + codegraph + context-mode + magic-compact + planning-with-files") | Merge-Synthese | KIMI verteilte die Pflichtliste über Tabelle 14.2 + Konditionale; der Merge macht daraus eine einzeilige, direkt installierbare Liste. |

---

## 4. Gestrichen / Nicht übernommen

| # | KIMI-Element | Warum entfernt (einfach erklärt) |
|---|---|---|
| S1 | **~4–5-fache Wiederholung** der rtk/caveman/headroom-Demontage (Kap. 2.3, 6, 7, 9.1, 14.4 + Kurzfassung) | Inhaltlich korrekt, aber redundant. Der Merge führt jede Absage genau einmal mit Trigger. |
| S2 | **citation.jsonl als Zitationsartefakt** | Technisch defekt (106/153 URLs mit trailing comma, id 20 leere URL – F9). Quellen bleiben als Fußnoten im Konzept erhalten; das defekte JSONL wird nicht als maschinenlesbare Quelle weitergeführt. |
| S3 | **Anhang-A-Rauschen** (Dutzende 0–2-Sterne-Repos in der Vollmatrix) | Kein Entscheidungswert. Der OPUS-Katalog deckt den Suchraum strukturiert ab; KIMIs Tiefenurteile zu relevanten Repos bleiben referenziert. |
| S4 | **Tool-Call-XML-Rest in readmes/llmtrim.md** | Artefakt-Schmutz (Speicherfehler des Agents), kein Inhalt. |
| S5 | **ABACUS-Beiträge, die KIMI widersprechen** (nicht KIMI-Elemente, aber im Merge aktiv verworfen): ABACUS Guard-Code (falsche PreToolUse-stdout-Semantik), Proxy-Chain, „−85–92 %"-Spar-Kaskade, MANUS-Inventar | Der Merge dokumentiert diese Verwerfungen explizit (F11, F12, F14), weil sie technisch falsch bzw. unbelegt sind – KIMI hatte sie implizit richtig gelöst (PostToolUse-Design, keine Kaskaden-Arithmetik). |

---

## 5. Das Wesentliche in drei Sätzen

1. **Inhaltlich ist der Merge zu ~85 % KIMI:** Mechanismus-Logik, Kern-Stack, alle Absagen, Ladder, Profile und Governance-Regeln wurden von der externen Verifikation bestätigt und unverändert übernommen – KIMI war der valideste der fünf Agents.
2. **Die wichtigsten Änderungen betreffen die Ausführung, nicht die Konzepte:** KIMIs Guard-Skizze wird durch GPTs funktional getesteten Guard ersetzt, KIMIs Prosa-Regeln durch OPUS' maschinenlesbare Owner-Registry, und das Repo-Inventar durch OPUS' strukturierten Katalog (251 statt ~180 Repos) – überall gilt: getesteter/strukturierter Code schlägt gute Prosa.
3. **Die wertvollsten Ergänzungen kommen aus der Verifikation selbst:** 11 Neufunde, 3 korrigierte Repo-Umbenennungen, ein AUTOCOMPACT-Warnhinweis, 15 dokumentierte Fehler der anderen Agents und eine harte Messpflicht als Gate – weil kein Agent (auch KIMI nicht) eigene Messungen geliefert hatte.
