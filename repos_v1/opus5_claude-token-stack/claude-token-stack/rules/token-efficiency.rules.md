# Token-Effizienz — Laufzeitregeln

_Stand 2026-08-13 · Referenzdatei. Kurz halten: was hier steht, wird bei jeder Kompaktierung reinjiziert._

## Die drei Gesetze

**I — Genau ein mutierender Eigentümer pro Fläche.** Alle passenden Hooks laufen parallel `[DOKU]`. Zwei Rewriter auf derselben Fläche liefern konkurrierende Ergebnisse. Müssen mehrere Regeln greifen, sequenziert **ein** Dispatcher sie intern.

**II — Append-only schlägt Prefix-Rewrite.** Hooks, Skills, Commands und CLI-Wrapper sind cache-neutral. MCP-Verbindungswechsel, Modellwechsel, CLAUDE.md-Änderungen und Plugin-Toggles invalidieren den Prefix `[DOKU]`. Ein Proxy muss den Cache-Write-Aufschlag erst verdienen.

**III — Keine Empfehlung ohne gemessene Lieferfähigkeit.** Erreichbar, nicht archiviert, Commit ≤ 60 Tage, passende Lizenz. Sonst Pilot oder Watchlist, nie stiller Bestandteil.

## Vier Mechanismen, in dieser Reihenfolge

1. **Vermeiden** — der Token entsteht gar nicht. Höchstes Ceiling, kein Qualitätsrisiko.
2. **Verlagern** — verlässt das Fenster, bleibt abrufbar. Braucht Retrieve-Disziplin.
3. **Verdichten** — Information geht verloren. Niedriges Ceiling, dokumentiertes Risiko. **Nur reversibel.**
4. **Verbilligen** — gleiche Tokens, billiger. Wirkt auf die Rechnung, nicht das Fenster.

## Bash und Tool-Output

- **Exakt bleiben:** Fehler, nicht-leeres stderr, Patches, Migrationen, Security-Scans, IaC-Pläne, Krypto-Ausgabe, null-delimited Daten, `# token-raw`.
- **Keine verlustbehaftete Ersetzung ohne abrufbares Original.**
- **Net-Win-Gate:** nichts emittieren, wenn die Ersparnis nach Footer-Overhead unter Byte- **und** Ratio-Schwelle liegt. Belegter Gegenfall ohne dieses Gate: 2.001 Token komprimiert gegen 1.719 verbatim.
- **`updatedToolOutput` bei Built-in-Bash ist ein Objekt** (`stdout`, `stderr`, `interrupted`, `isImage`). Eine String-Ersetzung wird ignoriert.
- **Niemals `permissionDecision: "allow"`.** Nicht weil es gefährlich wäre — die dafür zitierte Bypass-Lücke ist geschlossen — sondern weil ein Output-Owner keinen Grund hat, Berechtigungen zu vergeben.
- **Fail-open bei jedem Fehler.** Ein Guard, der bei kaputtem State blockiert, kostet mehr als er spart.
- **Fail-loud bei fehlendem Prüfgegenstand.** Ein Harness, dessen Ziel nicht existiert, muss scheitern, nicht still weiterlaufen.

## Lesen

- Ganze Datei nur bis N Zeilen, darüber `offset`/`limit` oder Indexabfrage.
- Zweitlesung derselben unveränderten Datei (mtime + Hash) → auf den Stash verweisen. Eine bewusste Einmal-Wiederholung als Escape-Valve.
- Index abfragen und danach trotzdem alle Treffer vollständig lesen: vernichtet den Gewinn.

## Kontext und Regeln

- **CLAUDE.md klein und stabil.** Jede Änderung invalidiert alles danach.
- **`.claude/rules` nur mit hartem Path-Scoping, 3–5 Dateien à unter 30 Zeilen.** Rule-Files werden als `<system-reminder>` bei *jedem* Tool-Call reinjiziert; dokumentiert sind 93.000 Token = 46 % des Fensters bei 11 Dateien und 30 Tool-Calls (Issue #32057, closed as not planned — also unbehoben).
- **MCP-Server projektweise in `.mcp.json`, nie global.** Verbindungsabbruch invalidiert den Prefix.
- **Plugin-Toggles nur zwischen Sessions.**

## Sitzung

- Reihenfolge: TASK-STATE schreiben → `/clear` → Subagent für Bulk → erst dann Werkzeuge.
- **Subagenten isolieren das Fenster und vervielfachen das Volumen (~Faktor 7).** Nur mit hart begrenztem Auftrag. Pauschales Fan-out ist ein Kostenvervielfacher.
- `/rewind` ist die einzige Option, die den Verlauf verkürzt, **ohne den Cache-Key zu ändern** — erster Griff bei Fehlversuchen.

## Verhalten

Implementation Ladder, Halt bei der ersten Sprosse, die trägt:
muss es existieren → ist es im Repo → Standardbibliothek → native Plattform → installierte Dependency → deklarativ/einzeilig → kleinste korrekte Implementierung.

**Nicht verhandelbar:** Security, Datenintegrität, Accessibility, Kompatibilität, Migrationen, Tests, Verification Contract.

⚠️ Aggressive Kürze-Prompts verschlechtern belegt Coding- und Reasoning-Benchmarks. Auf dieser Stufe ist das Qualitätsgate wichtiger als das Tokengate.

## Messen

Drei Begriffe, nie vermischen:

| Begriff | Was |
|---|---|
| Slice-Ersparnis | Bytes, die ein Filter lokal entfernt — die Zahl in fast allen READMEs |
| modellsichtbare Ersparnis | was tatsächlich weniger in den Request geht |
| **End-to-End-Ersparnis** | abgerechnete Tokens über die ganze Aufgabe, inkl. Cache-Creation, Zusatzrunden, Retries, Recovery |

**Nur die dritte entscheidet.** Zielmetrik: **fresh input** (uncached + cache creation), Median gepaart, Streuung ausgewiesen, mindestens 3 Läufe je Arm, Qualitätsgate vor Tokengate.

**README-Prozente sind nicht addierbar** — unterschiedliche Nenner: einzelne Fixture, nur gematchte Calls, Bytes statt Token, ein ausgewählter langer Task, Full-file-Baseline, Listenpreis statt Cache-Preis.

**Ein Ergebnis ohne seinen Geltungsbereich ist eine Werbeaussage.**

## Was nicht Standard wird

Mehrere Rewriter, Replacer, Codeindizes oder Proxys gleichzeitig · ein Proxy ohne Cache-Read/Creation-Messung · verlustbehaftete Ersetzung ohne Original · LLM-Kompression auf Fehlern, Patches oder Security-Ausgaben · TOON/PAKT ohne Shape-Gate · Auto-Update für Komponenten, die Sessiondateien oder API-Traffic verändern · Addition von README-Prozenten · ein Vollstack-Monolith neben einem bestehenden Stack · Elastic 2.0, PolyForm, AGPL oder lizenzlos im dienstlichen Core · ein Repo im Zielstack mit Commit älter als 60 Tage.
