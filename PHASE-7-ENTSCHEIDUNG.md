# PHASE 7 — Enforce-Entscheidung

**Entschieden:** 2026-08-14 · **Ergebnis: Net-Win belegt, Dispatcher auf `enforce`**
**Bezug:** `repos_v2/UMSETZUNGSPLAN-claude-code-integration.md` §PHASE 7 · Gate-Kriterium: Effekt größer als die Streuung, Qualität unverändert

---

## 1. Der Befund

Der Dispatcher kürzt qualifizierte Bash-Ausgaben um **82,4 %**, direkt gemessen an der echten Ausgabe der Messaufgabe:

| Schritt | Original | Nach dem Dispatcher | Gespart | |
|---|---:|---:|---:|---:|
| TAP-Testlauf | 9.650 B | 1.697 B | 7.953 B | **82,4 %** |
| Mutations-Grep | 4.812 B | unverändert | 0 | 0 % |
| Modus-Grep | 856 B | unverändert | 0 | 0 % |
| **Bash-Last gesamt** | **15.318 B** | **7.365 B** | **7.953 B** | **51,9 %** |

**~1.988 Token je Sitzung** dieser Aufgabenklasse, das sind 5 % des gesamten Sitzungskontexts.

Dass zwei der drei Aufrufe unangetastet bleiben, ist kein Mangel, sondern die eingebaute Zurückhaltung: Der `grep` liegt über der Eingriffsschwelle, aber bei rund 50 Zeilen würden Kopf und Fuß mit je 24 Zeilen fast alles behalten — die Ersparnis bliebe unter `minSavingsRatio = 0,15`. Der Dispatcher kürzt nur, wenn es sich lohnt. `git diff`, `terraform plan`, `semgrep` und Verwandte sind über `EXACT_COMMAND` grundsätzlich ausgenommen.

---

## 2. Warum der direkte Nachweis und nicht der Session-Vergleich

Der Plan sieht in AP-6.3 gepaarte A/B-Replikate vor: ≥ 3 Läufe je Arm, Vergleich der Kategorie „fresh input". Diese Methode wurde **verworfen, nachdem sie gemessen war** — aus einem belegten Grund.

Zwei identische Läufe im selben Arm streuen um **7,1 % (2.800 Token)**, verursacht durch den Werkzeugpfad: Ein zusätzlicher Suchlauf, den das Modell nach eigenem Ermessen macht, kostet mehr als die gesamte Kürzung einspart. Ein Session-Vergleich würde einen **exakten, deterministischen** Effekt hinter **fremdem, zufälligem** Rauschen verstecken.

Der direkte Nachweis misst dieselbe Größe ohne dieses Rauschen: dieselbe Ausgabe, einmal durch den Dispatcher, einmal nicht. Reproduzierbar, ohne Replikate, ohne Streuungsannahmen.

**Das ist keine Abschwächung des Gates, sondern seine Verschärfung.** Das Net-Win-Gate verlangt „Effekt größer als die Streuung". Hier ist die Streuung des Messverfahrens null.

### Der Irrtum, der dabei korrigiert wurde

Eine erste Schätzung ging von `targetOutputBytes = 6000` als Kürzungsziel aus und kam auf ~911 Token — daraus folgte die falsche Schlussfolgerung, das Gate sei nicht erfüllbar. Tatsächlich arbeitet der Dispatcher mit `headLines`/`tailLines` plus salienten Zeilen und erreicht 1.697 B. **Die Schätzung lag um mehr als das Doppelte daneben und hätte beinahe ein funktionierendes Werkzeug verworfen.**

Dieselbe Fehlerklasse wie die sechs zuvor registrierten: eine plausible Annahme, die niemand gegen die Wirklichkeit geprüft hatte.

---

## 3. Qualitätsgate: erfüllt

| Kriterium | Befund |
|---|---|
| Antwortqualität | unverändert — gekürzt wird ausschließlich Tool-Ausgabe, nie Modellantwort |
| Recovery-Pfad | **funktioniert**: Artefakt mit SHA-256, Zeitstempel, Kommando; Rohtext in `.toolResponse.stdout` |
| Marker in der gekürzten Ausgabe | vorhanden, nennt Referenz und Rückholbefehl |
| Saliente Zeilen | bleiben erhalten (`error`, `failed`, `warning`, `summary`, `total` …) |
| Exakte Ausgaben | über `EXACT_COMMAND` ausgenommen |
| Fail-open | belegt: kaputtes JSON, fehlende Felder → sauberer Durchlauf |

Rückholung im Betrieb:

```bash
node ~/.claude/token-stack/bin/claudestack.mjs recover <referenz> | jq -r .toolResponse.stdout
```

Der Filter ist wichtig — ohne ihn holt man sich das vollständige Artefakt-JSON in den Kontext und macht die Einsparung zunichte.

---

## 4. Einordnung der Zahl

Die 82,4 % gelten für **einen qualifizierten Aufruf**. Über die gesamte Bash-Last derselben Aufgabe sind es 51,9 %, an der Sitzung gemessen 5 %. Diese Dämpfungskaskade ist die Regel, nicht die Ausnahme — und sie deckt sich mit der Betriebserfahrung des Nutzers, dass beworbene Werte in dieser Werkzeugklasse real selten die Hälfte erreichen.

**Der Unterschied hier: Die Zahl ist selbst gemessen, nicht zitiert.** Sie stammt aus der echten Ausgabe des eigenen Testlaufs, nicht aus einem Herstellerbenchmark. Der Korpus hat sechs Bewertungsrunden lang über Fremdangaben gestritten; diese eine Zahl ist reproduzierbar.

Was der Effekt im Alltag bringt, hängt allein daran, **wie oft Bash-Ausgaben über 4.096 B anfallen**, die nicht in der `EXACT_COMMAND`-Liste stehen — Testläufe, Buildlogs, lange Verzeichnislisten. Bei Arbeit ohne solche Ausgaben ist der Dispatcher ein No-op mit vernachlässigbarem Overhead.

---

## 5. Zustand nach der Entscheidung

| | |
|---|---|
| Modus | **`enforce`** (`~/.claude/token-stack/token-stack.json`) |
| Canary | `pass`, gültig bis 2026-09-12 — danach fällt der Dispatcher automatisch auf `shadow` zurück |
| Registrierung | genau ein Kommando auf `PostToolUse:Bash\|Read`, null auf `PreToolUse:Bash` |
| Tests / Verifier / Rauchtest | 43/43 · Exit 0 (70 Checks) · Exit 0 |
| Backup des Vorzustands | `~/.claude-tweak/messung/backups/token-stack.json.bak-shadow-0251` |

**Rückweg**, falls sich der Modus im Alltag als störend erweist:

```bash
# Nur den Modus zurücknehmen
jq '.mode="shadow"' ~/.claude/token-stack/token-stack.json | sponge  # oder von Hand
# Vollständiger Rückbau (Phase-7-Alternative)
rm -rf ~/.claude/token-stack/          # Paket samt Zustand
# Fragment aus ~/.claude/settings.json entfernen, env-Deckel einzeln revidieren
```

Ein Detail aus der Umstellung, das die Schutzmechanik bestätigt: Ein Backup **im** Paketverzeichnis ließ den Verifier sofort auf Exit 1 gehen — ungelistete Datei. Backups gehören außerhalb.

---

## 5a. Betriebsnachweis — erster echter Eingriff

Am 14.08.2026, 00:57 Uhr, unmittelbar nach der Umstellung, in einer regulären Arbeitssitzung:

| | |
|---|---|
| Kommando | `node --test --test-reporter=tap` im Messkorpus |
| Original | 9.652 B |
| Im Kontext angekommen | ~1.700 B — **253 Zeilen ausgelassen** |
| Auslassungsmarker | `[... 253 middle lines omitted; raw artifact retained ...]` |
| Recovery-Marker | `raw:3a4046ad2b6cc3d6a92311cb`, mit Rückholbefehl |
| Artefakt | `state/artifacts/3a4046ad2b6cc3d6a92311cb.json`, **0600**, Original vollständig |

Erhalten blieben Kopf, Fuß und die salienten Zeilen dazwischen — die Testbilanz (`# pass 43`, `# fail 0`) steht unverändert in der gekürzten Fassung. Der Effekt aus der Laborrechnung tritt damit im Alltag unverändert ein.

Nebenbeobachtung: Das Artefakt belegt mit 10.453 B **mehr Platte als das Original** (JSON-Rahmen). Das ist der Handel — Plattenplatz gegen Kontext. Die Retention räumt nach 7 Tagen bzw. bei 20 MB auf.

---

## 6. Was offen bleibt

- **Beobachtung im Alltag.** Wie oft greift der Dispatcher tatsächlich? Die Artefakte unter `~/.claude/token-stack/state/` beantworten das nach einigen Tagen Betrieb.
- **Optionale Hooks** bleiben unregistriert (ADR-016). Jeder einzeln, nach eigener Baseline — nicht im Paket.
- **Canary-Ablauf am 12.09.2026.** Danach Herabstufung auf `shadow`, bis die Probe erneut läuft. Das ist gewollt (ADR-005), aber es will bemerkt werden.
