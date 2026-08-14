# Prefix-Fläche — abschließender Befund

**Erhoben:** 2026-08-14 · **Werkzeug:** `hooks/optional/prefix-budget.mjs --report` (K3-Träger mit portiertem OPUS-D1-Fix)
**Ergebnis: Auf dieser Installation gibt es keine Prefix-Fläche zu optimieren.**

---

## 1. Die Messung

`prefix-budget --report`, ausgeführt aus dem Projektverzeichnis:

```
Skill metadata:            0 chars (~0 est. tokens), budget 8000 chars
Active/discovered skills:  0/0; name-only: 0
Candidate CLAUDE.md:       0 file(s), 0 B
Potential rules:           0 file(s), 0 B
Enabled plugins:           0; marketplaces: 0
Declared MCP servers:      0 (schemas not measured)
Registered hooks:          6; skill name collisions: 0
→ No configured budget exceeded.
```

## 2. Gegenprobe gegen `/context`

| Kategorie | `prefix-budget` | `/context` | Erklärung |
|---|---:|---:|---|
| Skills | 0 | **2.100** | gebündelt unter `/tmp/claude-1000/bundled-skills/2.1.231/`, keine Projektquelle |
| System tools | — | **19.400** | in der Anwendung eingebaut, keine Konfigurationsquelle |
| Memory files | 0 | 279 | Auto-Memory, kein `CLAUDE.md`-Kandidat |
| MCP-Werkzeuge | 0 | 0 | „schemas not measured" — hier ohnehin durch Tool Search deferiert |
| Registrierte Hooks | **6** ✓ | — | korrekt erkannt, keine Kollisionen |

**Das Werkzeug ist nicht defekt.** Es misst genau die Quellen, für die es gebaut wurde: `.claude/skills/`, projektlokale und User-`CLAUDE.md`, `enabledPlugins`, Marketplaces, deklarierte MCP-Server. Auf dieser Maschine ist **jede einzelne dieser Quellen leer**. Was tatsächlich Kontext kostet, stammt aus der Anwendung selbst und liegt außerhalb seines Zugriffs.

Der portierte D1-Fix arbeitet dabei korrekt: sechs registrierte Hooks erkannt, null Kollisionen gemeldet — was dem Ist-Zustand entspricht.

---

## 3. Konsequenzen

**Die Prefix-Fläche ist erledigt, nicht offen.** Sie ist leer, nicht unbesetzt. Der Referenzwert des Korpus — 1.975 Token bei 8,4 KB `CLAUDE.md`, der einzige doppelt verifizierte Wert des gesamten Materials — beschreibt eine Installation mit lokaler `CLAUDE.md` und 25 aktiven Plugins. Beides existiert hier nicht.

**`prefix-budget` als Observer zu registrieren, bringt auf dieser Maschine nichts.** Es würde konstant Nullen melden. Ein Punkt weniger auf der Aktivierungsliste nach ADR-016.

**Dritte unabhängige Bestätigung von Risiko R-2:**

| Erhebung | Korpus-Erwartung | Ist-Zustand |
|---|---|---|
| Phase 0 | 4.959 Token auf Dateiflächen | **280** |
| Leerlast | MCP-Schemas 4,4–8,6k Token | **0** (Tool Search) |
| Prefix-Fläche | 1.975 Token `CLAUDE.md` | **existiert nicht** |

Die Akzeptanzwerte des Korpus sind nicht bloß ungenau für diese Maschine — sie beschreiben durchweg Kostenstellen, die hier gar nicht existieren.

---

## 4. Was von den offenen Flächen bleibt

| Fläche | Stand nach diesem Befund |
|---|---|
| **Prefix** | **erledigt** — leer, nichts zu optimieren |
| Bash-Output | besetzt, `enforce`, 82,4 % belegt |
| **Retrieval** | offen und realistisch: `codegraph` liegt installiert und ungenutzt (MIT, Konsens 81,9). Derselbe direkte Nachweis wie beim Dispatcher wäre möglich |
| Proxy | blockiert — Cache- und CA-Risiko, Kandidaten ausgesetzt |
| Format | blockiert — `toonify` erst nach Audit |
| Externe Massendaten | blockiert — Elastic-2.0-Lizenzfence (L-8) |
| Deny-Gate `PreToolUse:Bash` | Policy-Frage, keine Messfrage |

Von sieben Flächen ist damit eine besetzt, eine erledigt, eine offen und vier bewusst blockiert — **je mit dokumentierter Re-Entry-Bedingung**, wie es §7.3 des Plans verlangt.
