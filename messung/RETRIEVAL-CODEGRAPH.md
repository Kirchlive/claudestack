# Retrieval-Fläche — codegraph, gemessen

**Erhoben:** 2026-08-14 · **Entscheidung: CLI ja, MCP nein.**

## Messung (Zwei-Arm-Vergleich, direkter Nachweis)

Korpus `~/serena` (ext4, git clean @5cb3bf9). Frage: Weg eines Tool-Aufrufs von der
Registrierung bis zur Ausführung — eine Strukturfrage über Dateigrenzen.

| Arm | Kontext für dieselbe Frage |
|---|---:|
| **A — nativ** (grep + `tools_base.py`) | 17.457 B |
| **B — `codegraph explore`** (ein Aufruf) | 14.413 B |
| **Ersparnis** | **3.044 B = 17,4 % ≈ 761 Token** |

Arm B lieferte 39 Symbole aus 5 Dateien in 364 Zeilen. Die Antwortqualität wurde nicht
gegengeprüft — geprüft wurde die Funktionalität des Werkzeugs, nicht seine Trefferqualität.

**Einstandspreis:** Index über 281 Dateien, 5.283 Knoten, 11.282 Kanten in **1,82 s**, 13 MB.
Das Repo blieb git-unverändert (lokaler Ignore über `.git/info/exclude`).

**Abdeckungsfrage, offen:** 281 indizierte Dateien bei 1.541 Python-Dateien im Repo — das
Werkzeug filtert, nach welchem Kriterium wurde nicht geklärt.

## Warum CLI und nicht MCP

| | |
|---|---:|
| Ersparnis je Frage | ~761 Token |
| MCP-Dauerlast je Sitzung | **~1.150 Token** (Server-Instruktionen, **nicht** deferierbar) |
| Break-even | **ab 2 Fragen je Sitzung** |
| CLI-Dauerlast | **0** |

Als MCP-Server wäre codegraph unterhalb von zwei Strukturfragen pro Sitzung ein
Verlustgeschäft. Als CLI kostet es im Leerlauf nichts und spart ab der ersten Frage.

Drei weitere Gründe gegen die Einbindung, unabhängig vom Messwert:

1. **Der Hersteller selbst** schließt den Nutzen für dieses Setup aus: "a sub-agent reads
   files regardless and CodeGraph becomes overhead" — Subagenten-Delegation ist hier der
   Normalbetrieb.
2. **Veraltung ist strukturell**: auf `/mnt/c` schaltet codegraph den Datei-Watcher selbst ab
   (WSL2/DrvFs zu langsam). Zusammen mit seiner Instruktion "Trust codegraph's results —
   don't re-verify them with grep" ergibt das selbstbewusst falsche Antworten.
3. **Der Installer schreibt vier Dinge**, nicht eines: MCP-Eintrag, Permissions, einen
   `UserPromptSubmit`-Hook (Default *ja*) und einen Block in der Root-`CLAUDE.md`.

## Nutzung

Nicht als Plugin, nicht als MCP-Server, sondern als Werkzeug mit **explizitem Pfad** —
es gibt keine Projekterkennung über eine Integration:

```bash
cd <projekt> && DO_NOT_TRACK=1 codegraph explore "<frage>"
# Index einmalig: codegraph init   ·   nach Änderungen: codegraph sync
```

Auf `/mnt/c` ist `sync` **Pflicht vor jeder Nutzung** — dort aktualisiert sich nichts selbst.

## Hygiene, vorgefunden und bereinigt

| Befund | Zustand |
|---|---|
| Zwei verwaiste `serve --mcp`-Prozessbäume (3,5 h alt) | beendet |
| Telemetrie `enabled=true`, `consent=default-notice` | **aus**, `consent=cli` |
| 4 gepufferte Ereignisse für `telemetry.getcodegraph.com` | vom Werkzeug selbst gelöscht |
| Update-Check ruft eigenständig die GitHub-API (24-h-TTL) | dokumentiert, nicht abgeschaltet |

Lizenz geklärt: **MIT**, upstream belegt (Repo-LICENSE, npm-Metadaten). Die fehlende
LICENSE-Datei im Tarball ist ein Packaging-Detail, kein Lizenzmangel.

## Einordnung

Beworben sind laut README 69 % weniger Token. Gemessen: **17,4 %** — rund ein Viertel.
Die Erfahrungsregel bestätigt sich erneut, diesmal an einem Werkzeug, das der Korpus
einhellig positiv bewertet hat (Konsens 81,9, in allen drei Paketen konditional empfohlen).

Die Fläche gilt damit als **besetzt durch ein CLI-Werkzeug ohne Dauerlast** — nicht als
integrierte Fläche. §3.1 des Plans ("genau einer, aufgabenabhängig") ist erfüllt, ohne dass
sigmap und codebase-memory-mcp geprüft werden mussten: Ein Werkzeug ohne Dauerlast
konkurriert nicht um dieselbe Fläche.
