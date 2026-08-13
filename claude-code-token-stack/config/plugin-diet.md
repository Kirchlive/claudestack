# Plugin-Diät — Wave 01-1

**Ausgangsmessung 13.08.2026:** 25 aktive Plugins aus 18 Marketplaces (28 bekannte Marketplaces in `settings.json`). Budget des Prüfwerkzeugs: 12.

## Warum das die Stufe-0-Maßnahme mit dem größten Adressaten ist

Die früher tragende Begründung „~100 Token je Skill" ist **gestrichen**. Die eigene `settings.json` trägt `skillListingBudgetFraction: 0.01` und `skillListingMaxDescChars: 150` — ein Budget**anteil** ist ein Deckel, keine Stückkostenlogik. Die lineare Rechnung „n × 100" ist als Modell falsch.

Was bleibt: Plugins bringen Skills, Commands, Agents, Hooks und teils MCP-Server mit. Jede dieser Oberflächen kostet Prefix oder erzeugt Hook-Registrierungen. **Der Posten ist real, seine Größe ist unbekannt** — das ist der Grund, warum diese Wave mit einer Messung beginnt und nicht mit einer Kürzung.

## Verfahren

1. `/context` mit einer definierten Aufgabe, Startzustand notieren.
2. Plugins nach der Tabelle unten deaktivieren. **Zwischen Sessions, nie mitten drin** — ein Plugin-Toggle in der laufenden Session schreibt gecachten User-Content vollständig neu.
3. `/context` mit **derselben** Aufgabe und demselben Startzustand.
4. Differenz protokollieren. Das ist die Zahl, die über den Rest des Stacks entscheidet.

## Klassifikation der 25 aktiven Plugins

| Behalten | Begründung |
|---|---|
| `ponytail@ponytail` | Einziger Tier-1-belegter Werkzeuggewinn im ganzen Feld (−10,3 %, p = 0,004). Σ 90 (OPUS v5.1, Abdeckung 1,0; die frühere Angabe 97 stammte aus v4 — R-9/ADR-017). |
| `context-mode@context-mode` | Trägt die Fläche „externe Massendaten". **Achtung: Elastic 2.0** — für dienstliche Nutzung gesondert klären. |
| `caveman@caveman` | In `CLAUDE.md` als Response-Style-Fallback verdrahtet. Entfernen bricht die dortige Regel. |
| `prompt-improver@severity1-marketplace` | UserPromptSubmit, mutiert nicht. Wirkung messbar behaupten lassen, sonst raus. |

| Prüfen | Frage |
|---|---|
| `claude-mem@thedotmack` | Trägt ein **offenes** Issue (#3480): der `file-context`-Hook reinjiziert denselben Block bei jedem Tool-Call. Genau das Muster, das bei `.claude/rules` 46 % des Fensters gekostet hat. **Vor der Diät prüfen, nicht danach.** |
| `fan-out-subagents@fan-out-subagents` | Subagenten isolieren das Fenster, vervielfachen aber das Volumen um ~Faktor 7. Pauschales Fan-out ist ein Kostenvervielfacher. Nur mit hart begrenzten Aufträgen. |
| `superpowers@`, `skill-library@`, `research-skills@`, `happycapy-skills@`, `mattpocock-skills@`, `andrej-karpathy-skills@`, `adhd@` | Sieben Skill-Sammlungen gleichzeitig. Welche wurden in den letzten 30 Tagen tatsächlich aufgerufen? Die Frage ist über die Session-Transkripte beantwortbar. |
| `council@`, `stress-test@`, `cmux-ai-agents-bundle@` | Spezialwerkzeuge. Bei Bedarf einschalten, nicht dauerhaft. |
| 6 × `@claude-code-hooks` (`bounty-board`, `context-hogs`, `dead-end-registry`, `dead-rules-audit`, `pr-provenance-stamp`, `standup-autopilot`) | Bringen Hooks mit. Zwei davon (`protect-tests`, `protect-secrets`) sind bereits als Dispatcher-Stufen eingeplant. Die übrigen gegen Regel R8 prüfen: mutieren sie oder injizieren sie Kontext? Dann ins Budget. |

| Bereits inaktiv | — |
|---|---|
| 10 Plugins stehen auf `false` | Prüfen, ob ihre Hooks noch registriert sind. Ein deaktiviertes Plugin, dessen Shell-Hooks weiterlaufen, ist ein bekannter Fall. |

## Akzeptanzgate

`/context` vorher/nachher **plus** `node hooks/optional/prefix-budget.mjs --report` vorher/nachher. Zwei Zahlen, eine gemessen, eine geschätzt — die Abweichung zwischen beiden lag im Test bei 6,5 %.
