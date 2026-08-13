# VALIDATION — Prüfbericht zu `Kirchlive/claudestack`

**Stand:** 13. August 2026
**Gegenstand:** fünf Agent-Ausgaben zur selben Aufgabe (ABACUS, GPT55SOL_PRO, KIMI, MANUS, OPUS5_MAX), 3,7 MB, 132 Dateien
**Zweck:** gleichwertige Prüfung, Vergleich und Bewertung als Grundlage für `KONZEPT-v4.md` und `repo-catalog-v4.json`

Alle Zahlen in diesem Dokument stammen aus eigenen Messungen in einer Linux-Sandbox mit Netzzugang. Keine Zahl ist aus einer README, einer Agent-Angabe oder einem Hersteller-Benchmark übernommen.

---

## 1. Prüfverfahren

| Prüfung | Methode | Umfang |
|---|---|---|
| Repo-Existenz | HTTP-HEAD auf `github.com/<owner>/<repo>` | 376 |
| Sterne | Scrape `stargazerCount` + Gegenprobe `repo-stars-counter-star` | 376 |
| Letzter Commit | `commits/HEAD.atom` | 374 |
| Lizenz | Scrape der Lizenz-Anzeige der Repo-Seite | 376 |
| Weiterleitungen / Umbenennungen | finale URL nach Redirect | 376 |
| Syntax | `node --check` | 10 `.mjs` |
| Funktion | mitgelieferte Self-Tests, Smoke-Test, `verify-package.sh` | 13 Läufe |
| Verhalten unter Last | synthetischer 100-KB-PostToolUse-Payload gegen `bash-dump-guard.mjs` | 1 |
| Integrität | `sha256sum -c` | 42 Dateien |
| Reproduzierbarkeit | MANUS-Score-Skript neu ausgeführt und Ausgabe verglichen | 1 |
| Faktenlage | offizielle Claude-Code-Doku und Changelog | 4 Kernaussagen |

**Eigener Fehler, dokumentiert:** Mein erster Extraktor benutzte `str.rstrip('.git')`; das entfernt zeichenweise aus der Menge `{. g i t}` und trunkierte 58 Repo-Namen (`code2prompt` → `code2promp`, `gitingest` → `gitinges`). Das hätte eine Halluzinationsquote von ~15 % je Agent vorgetäuscht. Nach Korrektur auf `re.sub(r'\.git$','',…)` blieben zwei nicht erreichbare Namen übrig. Wer diesen Bericht nachprüft, sollte genau diese Stelle zuerst prüfen.

---

## 2. Struktur des Korpus — es sind keine fünf unabhängigen Durchgänge

| Beziehung | Befund | Beleg |
|---|---|---|
| GPT55SOL_PRO ⊂ OPUS5_MAX | **exakt deckungsgleich** | 228 von 228 Repos, identisches JSON-Schema, Beispieleintrag wortgleich |
| OPUS5_MAX | deklarierter Merge aus „Durchgang 1" + „Revision 2" | eigenes `CHANGELOG.md` |
| MANUS_AGENT ⊂ ABACUS_AGENT | vollständig | 105 von 105 Repos |
| KIMI_AGENT | eigenständig | 95 exklusive Repos, eigene Methodik, eigener Zitationsapparat |

**Überschneidungsmatrix (Repos):**

|  | ABACUS | GPT55SOL | KIMI | MANUS | OPUS5 |
|---|---:|---:|---:|---:|---:|
| **ABACUS** | 140 | 112 | 66 | 105 | 114 |
| **GPT55SOL** | 112 | 228 | 72 | 84 | **228** |
| **KIMI** | 66 | 72 | 174 | 41 | 72 |
| **MANUS** | 105 | 84 | 41 | 105 | 84 |
| **OPUS5** | 114 | **228** | 72 | 84 | 251 |

**Konsequenz für die Bewertung:** Übereinstimmung zwischen OPUS5 und GPT55SOL ist *keine* Bestätigung durch zwei Quellen. Real unabhängig sind zwei Linien — (A) GPT55SOL/OPUS5, Stand 10.08., Ownership- und Capability-Perspektive; (B) KIMI, Stand 13.08., Anatomie- und Evidenz-Perspektive. Wo diese beiden übereinstimmen, ist die Aussage belastbar.

---

## 3. Halluzinationsprüfung

| Agent | Repos referenziert | nicht erreichbar | Quote |
|---|---:|---:|---:|
| ABACUS | 140 | 1 | 0,7 % |
| GPT55SOL | 228 | 0 | 0,0 % |
| KIMI | 174 | 1 | 0,6 % |
| MANUS | 105 | 0 | 0,0 % |
| OPUS5 | 251 | 0 | 0,0 % |

Die zwei Ausreißer sind `harrisonsec/` (abgeschnittener Name, ABACUS) und `cardimvitor/Compression` (KIMI). **Kein Agent hat Repositories erfunden.** Das gilt für alle fünf gleichermaßen und ist das stärkste gemeinsame Ergebnis des Korpus.

**Sechs Umbenennungen** habe ich aufgelöst:

| genannt | tatsächlich |
|---|---|
| `chopratejas/headroom` | `headroomlabs-ai/headroom` |
| `bodo-run/yek` | `mohsen1/yek` |
| `NodeNestor/nestor-lean` | `NodeNestor/claude-lean-context` |
| `aleks-apostle/claude-code-thinking-patch` | `aleks-apostle/claude-code-patches` |

### Stichprobe auf KIMIs Sternangaben

KIMI ist der einzige Agent, der Sternzahlen im Fließtext führt. Gegenprobe an 14 Werten:

| Repo | KIMI | gemessen | Δ |
|---|---:|---:|---|
| rtk-ai/rtk | 76k | 75.937 | ✓ |
| JuliusBrussee/caveman | 98k | 97.836 | ✓ |
| headroomlabs-ai/headroom | 66.088 | 66.111 | ✓ |
| colbymchenry/codegraph | 66k | 66.154 | ✓ |
| mksglu/context-mode | 19.825 | 19.834 | ✓ |
| teamchong/pxpipe | 7.063 | 7.070 | ✓ |
| ccusage/ccusage | 17,9k | 17.888 | ✓ |
| claudioemmanuel/squeez | 182 | 182 | ✓ |
| ojuschugh1/sqz | 593 | 593 | ✓ |
| agiwhitelist/tokdiet | 33 | 33 | ✓ |

**KIMIs Zahlenwerk ist belastbar.** Abweichungen liegen im Bereich des Zuwachses zwischen Erhebung und Nachprüfung.

### Zitationsapparat KIMI

153 Zitate in `cc-token-stack.citation.jsonl`, davon 105 auf GitHub. Stichprobe über alle 47 Nicht-GitHub-Quellen plus 12 zufällige GitHub-Quellen: **52 von 59 antworten mit 200**. Die sieben Ausfälle sind drei leere URL-Felder, zwei 404 (`docs.anthropic.com/s/claude-code-cost`, `dailyaiworld.com/…`), ein 403 (OpenReview-PDF) und ein 429 (Rate-Limit). Keine erfundene Domain.

---

## 4. Entdeckungsleistung

Gemessen gegen die 142 Repos deiner Seed-Liste:

| Agent | gesamt | **neu** | exklusiv neu |
|---|---:|---:|---:|
| OPUS5_MAX | 251 | 141 | 21 |
| GPT55SOL_PRO | 228 | 118 | 0 |
| KIMI_AGENT | 174 | **105** | **95** |
| ABACUS_AGENT | 140 | 10 | 5 |
| MANUS_AGENT | 105 | **0** | 0 |

**Union aller neuen Funde: 241 Repositories.**

- **MANUS hat die Kernaufgabe nicht erfüllt.** Kein einziges Repo über die Vorgabe hinaus. Im selben Ordner liegen zwei Fremdkörper aus dem Agent-Harness: `SKILL.md` (ein ImageGen-Skill) und `article-structure.md` (eine SEO-Schablone für Vergleichsartikel). Die Ausgabe ist erkennbar von dieser Schablone geformt, nicht von der Aufgabe.
- **OPUS5/GPT55 haben ihre 118–141 Funde am 10.08. gemacht**, nicht in diesem Durchgang. Das mindert den Wert nicht, verschiebt aber die Zurechnung: die eigentliche Neuentdeckungsarbeit vom 13.08. stammt von KIMI.
- **KIMIs exklusive Funde** enthalten mehrere ernstzunehmende Kandidaten: `atlassian-labs/mcp-compressor`, `oraios/serena`, `musistudio/claude-code-router`, `maximhq/bifrost`, `microsoft/acon`, `banyudu/claude-warden`, `0xhimanshu/governor`, `Paritok-official/paritok-4b-v1`, `edgee-ai/edgee`, `Capnjbrown/c0ntextKeeper` — plus zwei Awesome-Listen als eigenständige Discovery-Quelle.

---

## 5. Funktionsprüfung — nur zwei Pakete enthalten lauffähigen Code

| Prüfung | GPT55SOL | OPUS5 | KIMI | MANUS | ABACUS |
|---|---|---|---|---|---|
| `node --check` | 9/9 OK | 1/1 OK | — | — | — |
| Self-Tests | 5/5 bestanden | 7/7 bestanden | — | — | — |
| `hook-contract-smoke.mjs` | OK | — | — | — | — |
| `verify-package.sh` | OK (228 Repos, JSONC, YAML, Bash-Budget-Alignment) | — | — | — | — |
| SHA256SUMS | 33/34 | 7/8 | — | — | — |
| Score-Nachrechnung | — | — | — | **identisch reproduziert** | — |

Die jeweils eine fehlende Prüfsumme ist beide Male `README.md` — Folge deiner Umbenennung zu `README_gpt.md` / `README_opus.md` beim Zusammenlegen, kein Agentfehler. Die `.sh`-Dateien haben im Repo kein Executable-Bit (`-rw-r--r--`), `verify-package.sh` bricht deshalb an der letzten Zeile ab.

### Der wichtigste Einzelbefund: der Guard läuft still ins Leere

`bash-dump-guard.mjs` gefüttert mit einem realistischen PostToolUse-Payload (1.200 Logzeilen, ~100 KB):

```
exit 0
stdout: (leer, 0 Bytes)

--status:
  activation: { requested: "auto", effective: "shadow",
                replacementAllowed: false,
                reason: "capability-record-missing" }
```

**Der Guard tut ohne gefahrenen Canary nichts — und meldet das nicht.** Wer das Paket ohne `--probe` installiert, betreibt einen Hook, der in `settings.json` aktiv aussieht und keine einzige Ausgabe anfasst. OPUS5 v3 warnt vor genau diesem stillen Shadow-Fallback; hier ist er reproduziert. Das ist keine Fehlfunktion, sondern eine bewusst konservative Voreinstellung — aber sie muss beim Rollout bekannt sein.

### OPUS5 `prefix-budget.mjs`

7/7 Self-Tests bestanden, darunter *„Gesetz-I-Kollision erkannt"*. `--report` läuft read-only durch, exit 0, ändert nichts, weist die eigenen Zahlen ausdrücklich als Schätzung aus und verweist auf `/context` als belastbaren Wert. Das Skript ist übernehmbar.

---

## 6. Faktenprüfung gegen die offizielle Doku

| Behauptung | Quelle | Ergebnis |
|---|---|---|
| Alle passenden Hooks laufen **parallel**; gleiche Handler werden dedupliziert | Hooks-Referenz (`code.claude.com/docs/en/hooks`) | **bestätigt** |
| `hookSpecificOutput.updatedToolOutput` gilt seit 2.1.121 für **alle** Tools (vorher MCP-only) | Claude-Code-Changelog | **bestätigt** |
| `MAX_MCP_OUTPUT_TOKENS` (Default 25000), `BASH_MAX_OUTPUT_LENGTH`, `TASK_MAX_OUTPUT_LENGTH`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS` existieren; Werte als Strings | Env-Var-Referenz + mehrere Sekundärquellen | **bestätigt** |
| Fable 5 ignoriert `MAX_THINKING_TOKENS` | zwei unabhängige Sekundärquellen | **plausibel, nicht erstquellenbelegt** |

**Damit ist die ABACUS-Architektur mechanisch widerlegt.** ABACUS empfiehlt in Kapitel 6 explizit eine *„Hook-Chain (Reihenfolge)"* mit zwei konkurrierenden `PreToolUse:Bash`-Mutatoren (`sqz` und `snip pipe`) sowie eine *„Proxy-Chain"* aus mehreren hintereinandergeschalteten komprimierenden Proxys mit fester Portreihenfolge. Beides funktioniert so nicht: die Hooks laufen parallel und liefern konkurrierende `updatedInput`-Objekte; eine Reihenfolge existiert nicht.

Dazu kommt bei ABACUS die Kumulativrechnung *„Schicht 1–6 (vollständig): −85–92 % gegenüber unkonfiguriertem Baseline"* — addierte README-Prozente aus unterschiedlichen Nennern. OPUS5 und KIMI schließen genau diese Rechenweise unabhängig voneinander ausdrücklich aus.

**MANUS misst am Thema vorbei.** Das Bewertungsmodell ist sauber und reproduzierbar (Skript + Daten liegen bei, meine Neuberechnung ergibt bitidentische Werte), aber die sechs Kriterien — kontext, sicherheit, portabilitaet, betrieb, governance, integration — enthalten **kein Token- und kein Cache-Kriterium**. Höchstbewertet mit je 100 Punkten: „AGENTS.md+CLAUDE.md" und „ADRs/Runbooks/Tests". CLAUDE.md ist aber Prefix-*Kosten*, die jede Runde neu abgerechnet werden.

---

## 7. Konvergenz der zwei unabhängigen Linien

Mit völlig verschiedener Methodik kommen OPUS5 und KIMI auf dieselben Invarianten. Das ist das belastbarste Ergebnis des gesamten Korpus:

| Invariante | OPUS5 v3 | KIMI |
|---|---|---|
| Genau ein mutierender Eigentümer pro Fläche | „Gesetz I" | „genau ein Rewrite-Hook auf Schicht 3" |
| Genau ein `BASE_URL`-Proxy | „Gesetz II" — Proxy muss den Cache-Aufschlag erst verdienen | „der BASE_URL-Slot ist die knappste Ressource des Stacks" |
| Bash-Output ist **nicht** der große Hebel | Fläche 5 von Platz 1 in die Mitte sortiert | „die populärsten Tools adressieren den kleinsten Hebel (~20 %)" |
| Prefix und Cache zuerst | Stufe 0 Prefix-Diät vor jeder Werkzeugentscheidung | „Cache-Hit-Rate > 90 % ist Kennzahl Nummer eins" |
| README-Prozente sind nicht addierbar | eigener Abschnitt mit sieben Nenner-Gründen | „wer die Prozente summiert, belügt sich selbst" |
| Ehrlichkeit schlägt Sterne | „Sterne messen Aufmerksamkeit, nicht Korrektheit" | Insight 5: unabhängige Messung invertiert die Star-Rangliste |
| Niemals `permissionDecision: allow` im Guard | „Auto-allow ohne statische Deny-/Ask-Regeln" ausgeschlossen | „NIEMALS allow (rtk #260)" |

Diese sieben Punkte decken sich zusätzlich mit deinen eigenen Messreihen: Ladder −27,2 % auf enger Klasse gegenüber −0,3 % gepaart; 3,5k Token SessionStart-Guidance mit 0 von 92 erwarteten Aufrufen; 286 Token pro Session durch eine nicht registrierte MCP-Anbindung.

---

## 8. Zwei Schwachstellen, die kein Agent benennt

### 8.1 Empfohlene Repos ohne Substanz

| Repo | Rolle in OPUS5 v3 | gemessen |
|---|---|---|
| `jaredboynton/semtrim` | Stufe 3, „nur PreTool, konservativ" | **0 ★**, letzter Commit 03.07.2026 (41 Tage) |
| `NodeNestor/nestor-lean` → `claude-lean-context` | Stufe 3 „maximale Turnkey-Abdeckung"; Entscheidungsmatrix bei Read/Edit-Loops; Katalogurteil *„Sehr starke monolithische Alternative"* | **1 ★** |
| `agiwhitelist/tokdiet` | Kandidat für den einen Proxy-Slot (auch bei KIMI) | 33 ★, 56 Tage still |
| `ojuschugh1/sqz` | Bash-Owner-Kandidat | 593 ★, 53 Tage still, **Elastic 2.0** |
| `zdk/lowfat` | Stufe 3, „Messbarkeit ist das Kriterium" | 566 ★, 36 Tage still |

OPUS5 formuliert korrekt, dass Sterne Aufmerksamkeit und nicht Korrektheit messen. Ein Repo mit einem Stern als *„sehr starke Alternative"* in den Zielstack zu schreiben, ist trotzdem ein Supply-Chain-Risiko, das im Dokument an keiner Stelle steht.

### 8.2 Lizenz-Fences sind benannt, aber keinem Repo zugeordnet

OPUS5 nennt Elastic 2.0 und PolyForm Noncommercial abstrakt unter „Was nicht Standard wird". Im eigenen Katalog steht bei allen tragenden Einträgen `license: "not-reviewed"`. Gemessen:

| Repo | Lizenz | Relevanz |
|---|---|---|
| **`alexgreensh/token-optimizer`** | **PolyForm Noncommercial 1.0.0** | OPUS5 §4 nennt es als **das einzige** Repo im Feld, das ernsthaft auf dem Prefix arbeitet — und damit als den größten unbesetzten Hebel. Für dienstliche Nutzung ist es damit **gesperrt**. |
| `mksglu/context-mode` | Elastic License 2.0 | Kernempfehlung bei KIMI (Schicht 4), Entscheidungsmatrix bei OPUS5 |
| `ojuschugh1/sqz` | Elastic License 2.0 | Bash-Owner-Kandidat |
| 9 weitere (AGPL-3.0 u. a.) | siehe Katalog, Flag `LIZENZ-FENCE` | |

Über alle 376 Repos: **12 mit Lizenz-Fence, 60 ohne erkennbare Lizenz.** Ein Repo ohne Lizenz ist rechtlich kein Freibrief, sondern „alle Rechte vorbehalten".

---

## 9. Gesamtzustand des Korpus (eigene Messung, 376 Repos)

| Kennzahl | Wert |
|---|---:|
| erreichbar | 374 |
| letzter Commit ≤ 7 Tage | 135 |
| letzter Commit ≤ 30 Tage | 196 |
| 31–90 Tage | 86 |
| 91–365 Tage | 79 |
| älter als 1 Jahr | 12 |
| archiviert | 2 |
| Lizenz MIT / Apache-2.0 | 294 |
| Lizenz-Fence (Elastic / PolyForm / AGPL) | 12 |
| Lizenz nicht erkennbar | 60 |
| unter 5 Sternen | 101 |
| **freigabefähig** (aktiv ≤ 60 Tage, nicht archiviert, keine Fence) | **249** |
| davon mit mindestens einer Agent-Bewertung | 210 |

---

## 10. Bewertung

| Kriterium | OPUS5 | KIMI | GPT55SOL | ABACUS | MANUS |
|---|---|---|---|---|---|
| Entdeckung | 141 neu (Stand 10.08.) | **105 neu, 95 exklusiv** | 118 (Teilmenge von OPUS5) | 10 | 0 |
| Evidenzdisziplin | **Marker `[DOKU]`/`[GEMESSEN]`/`[PROJEKT]`/`[SEKUNDÄR]`/`[SCHLUSS]`** | 153 Zitate, Tier-System, Cross-Verification | gut | Zahlen ohne Quelle | keine Quellenbindung |
| Mechanik korrekt | **verifiziert korrekt** | verifiziert korrekt | überwiegend korrekt | **falsch** (Hook-/Proxy-Chain) | am Thema vorbei |
| Lauffähige Artefakte | 1 Skript, 7/7 grün | keine | **12 Skripte, alles grün** | keine | Score-Skript, reproduzierbar |
| Selbstkorrektur | **eigenes Korrekturkapitel gegen beide Vorfassungen** | Cross-Verification + Nachtrag | Changelog | keine | keine |
| Umfang / Lesbarkeit | 3.578 Wörter, dicht | 26.698 Wörter, gründlich aber lang | technisch | 6.795 Wörter HTML | 4 Dokumente, redundant |
| Direkt umsetzbar | **ja** | ja | ja | nein | teilweise |

**Rangfolge nach Nutzwert: OPUS5_MAX ≈ KIMI > GPT55SOL_PRO > ABACUS > MANUS.**

OPUS5 und KIMI sind komplementär, nicht redundant. OPUS5 liefert Ordnung und Betriebsdisziplin, KIMI Breite, Belege und die Konfliktmatrix. GPT55SOL liefert das, was beiden fehlt: funktionierenden, getesteten Code.

---

## 11. Was in `KONZEPT-v4.md` übernommen wurde — und was nicht

| Quelle | übernommen | verworfen |
|---|---|---|
| OPUS5_MAX | Gesetz I + II, neun Flächen, Stufen 0–7, Regeln R1–R8, Migrationskapitel, Belastbarkeitsraster | Repo-Nennungen ohne Aktivitäts- und Lizenzprüfung |
| KIMI | Konfliktmatrix, Vier-Mechanismen-Ordnung, Loop-Guard-Muster, verifizierte Kennzahlen | Länge; Schichtenkette als Kette gelesen |
| GPT55SOL | gesamtes Hook-Paket als Implementierung von R1–R5, Benchmarkplan, Owner-Registry | Installer-Default `bash-dump-guard.mjs` (Namenskollision) |
| ABACUS | Kategorienschnitt des Inventars, Liste der Nicht-Empfehlungen | Hook-Chain, Proxy-Chain, Kumulativrechnung −85–92 % |
| MANUS | Prinzip der reproduzierbaren Bewertung (Skript + Daten beilegen) | Bewertungsmatrix als Entscheidungsgrundlage |
| **eigene Messung** | Aktivität, Sterne, Lizenz, Archivstatus für alle 376; Shadow-Fallback-Befund; PolyForm-Sperre | — |

---

## 12. Grenzen dieser Prüfung

- Sterne und Commit-Daten sind eine **Momentaufnahme vom 13.08.2026**. Aktivität misst Bewegung, nicht Qualität; ein stiller Commit-Feed kann ein fertiges Werkzeug bedeuten.
- Die Lizenzerkennung liest die Anzeige der Repo-Seite. 60 Repos ohne erkennbare Lizenz können eine haben, die GitHub nicht klassifiziert. Für jeden Kandidaten, der produktiv gehen soll, gilt: `LICENSE`-Datei selbst lesen.
- Ich habe **keinen** der katalogisierten Fremd-Repos ausgeführt oder installiert. Geprüft wurden ausschließlich die im Korpus mitgelieferten Skripte.
- Kein Agent und auch diese Prüfung liefern eine **End-to-End-Token-Messung**. Sämtliche Ersparnisangaben im Korpus bleiben unbestätigt, bis der Benchmarkplan gefahren ist.
- Vollständigkeit der Repo-Landschaft ist nicht beweisbar. Private, gelöschte, frisch erstellte und umbenannte Repositories fehlen zwangsläufig.
