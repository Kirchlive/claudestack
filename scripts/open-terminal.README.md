# open-terminal.sh — Erkennung und Grenzen

**Erstellt:** 2026-08-14 · Ermittelt das eigene Terminal und öffnet darin Fenster oder Tab.

## Die Erkennungsregel

Unter WSL läuft das Skript die **Elternkette** des selbst gestarteten `powershell.exe`-Prozesses hoch, bis `explorer.exe` erreicht ist. Der letzte Prozess davor, der kein Interop-Glied ist (`powershell`, `pwsh`, `wsl`, `conhost`, `cmd`), ist das Terminal — mit vollständigem Pfad.

Gemessen auf dieser Maschine:

```
Ebene 0  powershell.exe   selbst gestartet
Ebene 1  wsl.exe          C:\Program Files\WSL\wsl.exe
Ebene 2  wsl.exe          C:\Windows\SYSTEM32\wsl.exe
Ebene 3  warp.exe         C:\Apps\Warp\warp.exe        ← Terminal
Ebene 4  explorer.exe                                  ← Kettenende
```

**Warum nicht nach dem Pfad suchen:** Warp liegt hier unter `C:\Apps\Warp\` — ein untypischer Ort. Suchläufe in `AppData\Local\Programs` und `Program Files` fanden nichts. Der laufende Prozess kennt seinen Pfad, jede Verzeichnisheuristik rät.

Umgebungsvariablen (`TERM_PROGRAM`, `WT_SESSION`, `TERMINAL_EMULATOR`) werden zuerst gelesen, weil sie nichts kosten — sie liefern aber nur den **Namen**, nicht den Pfad. Die Kette liefert beides.

## Kosten und Cache

| Weg | Dauer |
|---|---:|
| Elternkette (PowerShell) | 0,46 s |
| Cache (`~/.cache/terminal-exe`) | 0,015 s |

Der Cache wird verworfen, sobald der hinterlegte Pfad nicht mehr ausführbar ist. Umgehung mit `--no-cache`.

## Was getestet ist

| Prüfung | Ergebnis |
|---|---|
| Erkennung über Elternkette | ✅ `wsl` / `warp` / `/mnt/c/Apps/Warp/warp.exe` |
| Cache anlegen und lesen | ✅ Faktor 31 schneller |
| Verfallener Cache (Pfad existiert nicht) | ✅ verworfen, Neuermittlung |
| `powershell.exe` nicht auffindbar | ✅ Exit 1, Ursache benannt |
| Nicht existierendes Verzeichnis | ✅ Exit 1 |
| Unbekanntes Argument | ✅ Exit 1 |
| Trockenlauf `--dry-run` | ✅ zeigt den Befehl, führt nichts aus |
| Kommando an Warp | ✅ Exit 3, Hinweis, Kommando in der Zwischenablage (`Get-Clipboard` bestätigt) |

## Was **nicht** sauber verifizierbar ist

**Ob tatsächlich ein Tab aufgeht.** Warp führt Tabs im selben Prozess und Fenster — Prozess- und Fensterzählung bleiben bei 1, egal wie viele Tabs offen sind. Der einzige beobachtbare Indikator war ein Wechsel des Fenstertitels (`plugin` → `bash`) während der Testreihe, was auf eine neu aktivierte Shell hindeutet. Welcher der drei Aufrufwege ihn ausgelöst hat, ließ sich von außen nicht unterscheiden.

**Die visuelle Bestätigung liegt beim Nutzer.** Das Skript meldet Exit 0, wenn der Startbefehl fehlerfrei abgesetzt wurde — nicht, wenn ein Fenster nachweislich erschien. Diese Grenze ist bewusst so gezogen; alles andere wäre eine Behauptung ohne Beleg.

## Was an Warp herausgefunden wurde

1. **Die CLI hat keine Fenster- oder Tabsteuerung.** `warp.exe --help` listet ausschließlich Agent- und Cloud-Funktionen (`agent`, `environment`, `mcp`, `run`, `model`, `memory`, `login`, `schedule`, …). Kein `new-tab`, kein `new-window`, keine Verzeichnisoption.
2. **Das URI-Schema ist registriert:** `HKCR\warp` → `"C:\Apps\Warp\warp.exe" "%0"`. Verwendet wird `warp://action/new_tab`.
3. **Die Session-Kennung steht in der Umgebung:** `WARP_FOCUS_URL=warp://session/<uuid>` — Warp reicht sie über `WSLENV` nach Linux durch. Damit ließe sich gezielt eine bestehende Sitzung fokussieren.
4. **Arbeitsverzeichnis und Startkommando lassen sich über das Schema nicht übergeben.** Deshalb legt das Skript ein angefordertes Kommando in die Zwischenablage und meldet Exit 3, statt es stillschweigend fallen zu lassen.

## Terminals

| Terminal | Stand |
|---|---|
| **Warp** (WSL) | getestet, Erkennung und Aufruf belegt |
| Windows Terminal | implementiert (`wt.exe -w 0 nt -d`), **nicht getestet** — hier nicht installiert |
| iTerm2, Terminal.app | implementiert (`osascript`), **nicht getestet** — kein macOS |
| VS Code | erkannt, meldet bewusst Exit 1: integrierte Terminals sind von außen nicht steuerbar |
| Unbekannte | Rückfallebene — Programm ohne Argumente starten, öffnet unter Windows meist ein neues Fenster |

## Verwendung

```bash
scripts/open-terminal.sh --detect-only                    # nur erkennen
scripts/open-terminal.sh -d ~/projekt                     # Tab/Fenster öffnen
scripts/open-terminal.sh -d ~/projekt -c 'befehl'         # mit Startkommando
scripts/open-terminal.sh --dry-run -d ~/projekt           # zeigen, nicht ausführen
```

Exit-Codes: `0` abgesetzt · `1` Erkennung oder Argument fehlerhaft · `3` Fenster geöffnet, Kommando **nicht** übernommen (liegt in der Zwischenablage).
