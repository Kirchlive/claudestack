---
id: CTS-DOC-WAVE-001
schema: claudestack.document/v1
document_type: rollout_gate_contract
title: Wellenvertrag
version: 2
status: release_candidate
language: de
last_reviewed: 2026-08-13
applies_to: claude-code-token-stack/v2
---

# Wellenvertrag

> **Der Fahrplan steht in [`waves/WAVE-INDEX.md`](../waves/WAVE-INDEX.md), der
> Fortschritt in [`waves/WAVE-STATE.md`](../waves/WAVE-STATE.md).** Dieses
> Dokument dupliziert ihn nicht mehr — es beschreibt nur noch die Regeln, nach
> denen eine Welle als bestanden gilt.

Zwei Fahrpläne nebeneinander sind schlimmer als keiner: sie driften, und niemand
merkt, welcher gilt. Die frühere Wellenliste dieses Dokuments ist in den
Wave-Index übergegangen.

## Der Vertrag

1. **Eine Welle ändert genau eine Variable.** Wer Algorithmus und Population
   zugleich ändert, kann das Ergebnis keiner Ursache zuordnen.
2. **Die nächste Welle startet erst nach Gate, dokumentierter Entscheidung und
   geprüftem Rollback.** Nicht nach Ablauf einer Frist.
3. **Jede Welle hat einen benannten Rollback**, der vor dem Start einmal
   ausgeführt wurde. Ein ungetesteter Rollback ist keiner.
4. **Nullergebnisse sind Ergebnisse.** Eine Welle, die nichts bringt, wird
   dokumentiert und zurückgebaut — nicht stillschweigend behalten.
5. **Fremde Akzeptanzwerte gelten nicht.** Jede Schwelle wird auf der
   Zielmaschine neu erhoben (siehe unten).

## Warum die Akzeptanzwerte neu zu erheben sind

Der Wave-Index trägt Zahlen aus der Entstehung des Korpus: 25 aktive Plugins,
1.975 Token Prefix, fünf `PreToolUse:Bash`-Handler, acht Kollisionsbefunde.
**Diese Werte stammen von einer anderen Maschine.** Auf der Maschine, auf der
dieses Paket zusammengeführt wurde, ergab die Erhebung:

| Größe | Korpus-Referenz | hier gemessen |
|---|---:|---:|
| aktive Plugins | 25 | **0** |
| Root-`CLAUDE.md` | 8.416 B / 1.975 Tok | **nicht vorhanden** |
| `settings.json` | 10.707 B / 2.984 Tok | 994 B / **280 Tok** |
| mutierende `PreToolUse:Bash`-Hooks | 3–5 | **0** |

Das ist kein Erfolg der Optimierung, sondern eine andere Ausgangslage. Wer die
Korpus-Zahlen als Gates übernimmt, misst gegen eine Maschine, die es hier nicht
gibt. **Die E2E-Baseline auf der eigenen Maschine ist die einzige verbleibende
Wahrheitsquelle** — darin sind sich alle drei Quellpakete und alle drei
Meta-Validierungsrunden einig.

## Gate-Kennungen

Die Wellen verweisen auf zwei Messgates, die in
[`BENCHMARK.md`](BENCHMARK.md) definiert sind:

| Gate | Gegenstand | Bestanden, wenn |
|---|---|---|
| `CTS-BENCH-GATE-001` | Dispatcher im Shadow-Modus | kein Qualitäts- oder Latenzschaden; Aufrufpfad nachweislich erreicht |
| `CTS-BENCH-GATE-002` | Bash-Output-Elision unter `enforce` | Net-Win größer als die Streuung **und** Recovery-Stichprobe 100 % exakt |

Ein Gate, dessen Prüfgegenstand fehlt, ist **nicht bestanden** — es ist
gescheitert (L-6). Diese Regel hat ihren Ursprung in zwei Defekten, bei denen
Testsuiten still durchliefen, weil ihre Prüfobjekte nicht existierten (D2, D3 im
[Defektregister](DEFEKTE.md)).

## Betrieb nach dem Rollout

- regelmäßig `doctor`, Tests, Recovery-Smoke und `prune` prüfen;
- Config- und Paketänderungen erneut durch Shadow/Canary führen;
- `ccusage`-Trends beobachten, aber Ursachen **nur** durch kontrollierten
  A/B-Lauf zuschreiben;
- Decision-IDs bei Änderungen fortschreiben, nicht umnummerieren.
