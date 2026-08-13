# PHASE-2-BEFUND — Kollisionsinventur

**Erzeugt:** 2026-08-13 · **Grundlage:** UMSETZUNGSPLAN §5 (Datei-Arbeitsliste), CLAUDESTACK-FINALIZE §C.2
**Artefakte:** `inventory/collision-inventory.tsv` (112 Zeilen + Header) · `MERGE-MANIFEST.tsv` (99 Zeilen + Header)
**Skript:** `inventory/collision-inventory.py` (Python 3.14, reproduzierbar)

---

## 1. Bilanz: Ist gegen Plan

| Aktion | Plan (§3.1, F-1-korrigiert) | Ist | Abweichung |
|---|---:|---:|---|
| unveraendert | 11 | **11** | keine |
| angepasst | 54 | **54** | keine |
| evidence | 34 | **34** | keine |
| verworfen | 12 | **12** | keine |
| neu_erzeugt | — | **1** | siehe B-1 |
| **Summe** | **111** | **112** | +1 (B-1) |
| nicht zugeordnet | 0 | **0** | keine |

Die F-1-korrigierte Bilanz des Plans (11/54/34/13) wird bestätigt, mit der dort bereits vermerkten
Einschränkung: das 13. verworfene Element ist das Leerverzeichnis `{waves,rules,hooks,scripts,config}`,
das im GitHub-Checkout **nicht mehr existiert**. Auf Dateiebene sind es 12. Die Bilanz-Zeile der
FINALIZE (24/44/34/11/3) ist damit erneut widerlegt — Aufnahme als D8 bleibt in AP-5.3 offen.

### B-1 — Vokabular-Erweiterung (fail-loud)

Das vorgegebene Aktionsvokabular (`unveraendert | angepasst | evidence | verworfen`) deckt
`gpt56sol/SHA256SUMS.txt` nicht ab. Die Datei existiert im Quellpaket, wird aber laut §5.1 (🆕) und
C.2.1 **neu erzeugt**, weil die alten Summen nach der Zusammenführung ungültig sind. Sie ist weder
übernommen noch verworfen. Kodiert als eigene Aktion `neu_erzeugt`; die Entscheidung wurde nicht
stillschweigend in eine der vier Kategorien gedrückt.

Damit gilt: 111 zugeordnete + 1 neu erzeugt = 112 Dateien = vollständige Abdeckung.

---

## 2. Byteidentische Dubletten — 3 Gruppen, alle paketintern (F-2 bestätigt)

| Gruppe | Dateien | Bytes |
|---|---|---:|
| D1 | `opus5/KONZEPT-v5.md` ↔ `opus5/validate/KONZEPT-v5.md` | 43.708 |
| D2 | `opus5/scripts/judgments.json` ↔ `opus5/validate/judgments.json` | 6.003 |
| D3 | `opus5/DEFEKTE.md` ↔ `opus5/validate/DEFEKTE.md` | 5.687 |

Summe ~55 KB Dublette. **Keine paketübergreifenden Byte-Dubletten** — F-3 bestätigt.
Auflösung nach §5.3/AP-3.2: die Wurzelkopien sind maßgeblich, die `validate/`-Kopien entfallen.

---

## 3. Basename-Kollisionen — 7 Namen (§1.4b bestätigt)

| Basename | Vorkommen | Auflösung |
|---|---|---|
| `prefix-budget.mjs` | k3swarm 23.977 B ↔ opus5 14.582 B | **Duell C.3.8** — K3 als Träger, D1-Block aus OPUS portieren (AP-4.3) |
| `context-surface-owners.yaml` | k3swarm 4.865 B ↔ opus5 5.490 B | beide → eine JSON-Registry (C.3.2) |
| `token-efficiency.rules.md` | k3swarm 7.771 B ↔ opus5 5.574 B | beide → `rules/token-stack.md` (C.3.3) |
| `TASK-STATE.template.md` | k3swarm 1.391 B ↔ opus5 611 B | **beide verworfen**, GPT-Fassung gewinnt |
| `MASTERPLAN.md` | k3swarm 7.520 B ↔ opus5 3.767 B | beide → `evidence/`, `waves/` gewinnt als Fahrplan |
| `README.md` | 3 verschiedene (6.790 / 6.768 / 5.018 B) | GPT gewinnt + Herkunftsabschnitt, andere → `evidence/` |
| `claudestack.mjs` | gpt56sol `bin/` 2.871 B ↔ `hooks/` 308 B | **paketintern, beide behalten** — verschiedene Zielpfade, keine Kollision im Zielbaum |

---

## 4. Mutator-Flächen mit mehr als einem Kandidaten

### 4.1 `PostToolUse:Bash` — Output-Mutation (Gesetz I, L-1)

| Kandidat | Erkannte Mutation | Entscheidung |
|---|---|---|
| `gpt56sol/src/stack.mjs` | `permissionDecision`, `updatedToolOutput` | **alleiniger Owner** (Träger-Dispatcher) |
| `k3swarm/hooks/bash-dump-guard.mjs` | `updatedToolOutput` | verworfen — zweiter Owner auf derselben Fläche |
| `opus5/hooks/bash-owner-dispatch.mjs` | `permissionDecision`, `updatedToolOutput`, `updatedInput` | `evidence/` — dritter Dispatcher, Referenz |
| `k3swarm/hooks/ladder-retrieve-filter.mjs` | `updatedToolOutput` | `evidence/` — gemessen −0,3 % (L-9) |

F-7 bestätigt: genau drei konkurrierende Bash-Output-Mutatoren, einer überlebt.

### 4.2 `PreToolUse:Bash` — Deny-Gate

| Kandidat | Erkannte Mutation | Entscheidung |
|---|---|---|
| `k3swarm/hooks/bash-dump-gate.mjs` | `permissionDecision` | verworfen — getrennte Policy-Frage im Quellrepo |
| `k3swarm/hooks/ladder-retrieve-gate.mjs` | `permissionDecision` | `evidence/` — gemessen +9,6 % (L-9) |

Fläche bleibt **unbesetzt**; der Dispatcher meldet Fremd-Mutatoren, blockiert aber nicht (C.3.1.2).

### 4.3 Übrige Flächen — je ein Kandidat

`read` → `read-context-guard.mjs` (optional, nicht registriert) · `prefix` → Duell C.3.8, Observer ohne
Mutationsrecht · `session` → `session-economy.mjs`, `ctx-used-marker.mjs` (Observer) · `canary` → Probe,
kein Hook (C.3.7).

---

## 5. Zielpfade mit mehreren Quellen — beabsichtigte Zusammenführungen

Acht Zielpfade erhalten Inhalt aus mehr als einer Quelle. Das ist kein Konflikt, sondern die in C.3
vorgesehene Zusammenführung — im `MERGE-MANIFEST.tsv` steht je Quelldatei eine eigene Zeile, damit die
Provenienz erhalten bleibt:

| Zielpfad | Quellen |
|---|---:|
| `config/context-surface-owners.json` | 3 |
| `rules/token-stack.md` | 3 |
| `docs/REPO-MATRIX.md` | 3 |
| `scripts/verify-package.mjs` | 3 |
| `scripts/repo-audit.py` | 3 |
| `templates/CLAUDE.md` | 2 |
| `docs/BENCHMARK.md` | 2 |
| `hooks/optional/prefix-budget.mjs` | 2 |

---

## 6. Fail-loud-Liste (L-6)

**Nicht zugeordnete Dateien: keine.** Alle 112 Dateien tragen einen Mapping-Eintrag.

Gemeldet werden stattdessen drei methodische Einschränkungen, die aus den Daten selbst nicht sichtbar
wären:

| # | Befund | Konsequenz |
|---|---|---|
| **F-A** | Die Mutations-Spalte ist eine **rein textuelle** Erkennung (Vorkommen von `permissionDecision` / `updatedToolOutput` / `updatedInput` im Quelltext). Sie unterscheidet nicht zwischen „Hook mutiert" und „Datei erwähnt den Schlüssel". | Vier Dateien sind dadurch **falsch-positiv** klassifiziert: `gpt56sol/scripts/verify-package.mjs` (prüft den `allow`-Bann), `gpt56sol/tests/stack.test.mjs`, `k3swarm/hooks/tests/hook-contract-smoke.mjs`, `k3swarm/hooks/tests/test-guard-all.mjs` (Fixtures). Alle tragen `surface=none` und sind keine Hooks. |
| **F-B** | `k3swarm/hooks/claude-hook-capability-canary.mjs` enthält alle drei Mutationsschlüssel, **weil es die Fähigkeiten probt**, nicht weil es mutiert. | Nach C.3.7 ist die Probe kein registrierter Hook, sondern CLI-/Handaufruf. Die Zeile ist als `surface=canary` geführt, nicht als Mutator-Kandidat. |
| **F-C** | Das Leerverzeichnis `{waves,rules,hooks,scripts,config}` (OPUS5, Brace-Expansion-Defekt) **existiert im Checkout nicht** und konnte daher nicht inventarisiert werden. | Nur `TREE.txt` bezeugt es. Status im Defektregister: „historisch/beobachtet" (AP-5.3). |

Zusätzlich bestätigt sich der in Phase 0 erhobene Befund, dass
`gpt56sol/validate/03-measure-token-surfaces.py` trotz der Einstufung „lauffähig, kein Archiv" (§5.1)
**nicht unverändert lauffähig** ist: seine `selected()`-Funktion filtert auf die alte Repo-Struktur und
liefert für jedes andere Repository null Records, was in `records[0]` zu einem `IndexError` führt.
Gehört in dasselbe Korrektur-Register wie D8.

---

## 7. Akzeptanzgate P2

| Kriterium | Status |
|---|---|
| `MERGE-MANIFEST.tsv` enthält 65 übernommene (11 + 54) + 34 `evidence/`-Zeilen = 99 | **erfüllt** (99 Zeilen) |
| Jede Konfliktzeile hat genau einen `owner`, übrige als Alternativen | **erfüllt** — Mutator-Flächen §4, nichts weggelassen |
| Alle Zeilen parsebar, konstante Spaltenzahl | **erfüllt** — 12 bzw. 5 Spalten durchgängig |
| Konflikte markiert | **erfüllt** — 3 Dubletten, 7 Basename-Kollisionen, 2 Mutator-Flächen |
