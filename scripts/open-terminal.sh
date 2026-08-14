#!/usr/bin/env bash
# open-terminal.sh — identifiziert das eigene Terminal und öffnet darin ein neues Fenster/Tab.
#
# ABLAUF:  Plattform erkennen → Terminal identifizieren → Startbefehl wählen → ausführen.
#
# WARUM ELTERNKETTE STATT PFAD-RATEN (der Kern dieses Skripts):
#   Unter WSL hängt ein aus Linux gestarteter powershell.exe-Prozess über wsl.exe am
#   Terminal-Fenster. Läuft man die Kette per ParentProcessId hoch, findet man das Terminal
#   samt vollständigem Pfad — ohne zu wissen, welches Terminal es überhaupt ist:
#
#       Ebene 0  powershell.exe   (selbst gestartet)
#       Ebene 1  wsl.exe          C:\Program Files\WSL\wsl.exe
#       Ebene 2  wsl.exe          C:\Windows\SYSTEM32\wsl.exe
#       Ebene 3  warp.exe         C:\Apps\Warp\warp.exe      ← das Terminal
#       Ebene 4  explorer.exe                                ← Kettenende
#
#   Regel: hochlaufen bis explorer.exe; der Prozess unmittelbar davor ist das Terminal.
#   Pfad-Raten scheitert: Warp lag hier unter C:\Apps\Warp\ — Suchen in AppData\Local\Programs
#   und Program Files fanden nichts. Der laufende Prozess weiß es, Verzeichnisheuristik nicht.
#
# FAIL-LOUD: Jeder Zweig, der seinen Gegenstand nicht findet, meldet das benannt und
#   beendet mit Exit != 0. Kein stilles Durchlaufen.
#
# Verwendung:
#   open-terminal.sh [-d VERZEICHNIS] [-c KOMMANDO] [--no-cache] [--dry-run] [--detect-only]
#
set -uo pipefail

CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/terminal-exe"
DIR="" CMD="" NO_CACHE=0 DRY=0 DETECT_ONLY=0

die()  { printf 'FEHLER: %s\n' "$*" >&2; exit 1; }
warn() { printf 'HINWEIS: %s\n' "$*" >&2; }
info() { printf '%s\n' "$*"; }

while [ $# -gt 0 ]; do
  case "$1" in
    -d|--dir)      DIR="${2:-}"; shift 2 || die "-d braucht ein Verzeichnis" ;;
    -c|--command)  CMD="${2:-}"; shift 2 || die "-c braucht ein Kommando" ;;
    --no-cache)    NO_CACHE=1; shift ;;
    --dry-run)     DRY=1; shift ;;
    --detect-only) DETECT_ONLY=1; shift ;;
    -h|--help)     sed -n '2,22p' "$0"; exit 0 ;;
    *)             die "unbekanntes Argument: $1" ;;
  esac
done

[ -n "$DIR" ] && [ ! -d "$DIR" ] && die "Verzeichnis existiert nicht: $DIR"

# ---------------------------------------------------------------- 1. Plattform
plattform() {
  case "${OSTYPE:-}" in
    darwin*)        echo macos; return ;;
    msys*|cygwin*)  echo windows-gitbash; return ;;
  esac
  if [ -r /proc/version ] && grep -qi microsoft /proc/version; then
    echo wsl; return
  fi
  [ -n "${WSL_DISTRO_NAME:-}" ] && { echo wsl; return; }
  echo linux
}
PLATTFORM="$(plattform)"

# ------------------------------------------------- 2. Terminal identifizieren
# Billige Quelle zuerst: Umgebungsvariablen. Sie liefern den Namen, nicht den Pfad.
terminal_aus_env() {
  [ -n "${WT_SESSION:-}" ] && { echo "windows-terminal"; return; }
  [ -n "${TERMINAL_EMULATOR:-}" ] && { echo "jetbrains"; return; }
  case "${TERM_PROGRAM:-}" in
    WarpTerminal)   echo warp ;;
    vscode)         echo vscode ;;
    iTerm.app)      echo iterm ;;
    Apple_Terminal) echo apple-terminal ;;
    ghostty)        echo ghostty ;;
    *)              echo "" ;;
  esac
}

# Belastbare Quelle unter WSL: die Elternkette. Liefert Name UND Pfad.
# Ausgabe: "<prozessname>|<windows-pfad>"
terminal_aus_kette() {
  command -v powershell.exe >/dev/null 2>&1 || return 1
  powershell.exe -NoProfile -NonInteractive -Command '
    $me = $PID; $letzter = $null
    for ($i = 0; $i -lt 12; $i++) {
      $p = Get-CimInstance Win32_Process -Filter "ProcessId=$me" -EA 0
      if (-not $p) { break }
      if ($p.Name -ieq "explorer.exe") { break }   # Kettenende erreicht
      if ($p.Name -inotmatch "^(powershell|pwsh|wsl|conhost|cmd)\.exe$") {
        $letzter = $p                              # Kandidat: kein Interop-Glied
      }
      $me = $p.ParentProcessId
      if (-not $me) { break }
    }
    if ($letzter) { "{0}|{1}" -f $letzter.Name, $letzter.ExecutablePath }
  ' 2>/dev/null | tr -d '\r' | grep -m1 '|' || return 1
}

lies_cache() {
  [ "$NO_CACHE" -eq 1 ] && return 1
  [ -r "$CACHE" ] || return 1
  local zeile name pfad linuxpfad
  zeile="$(head -1 "$CACHE")"
  name="${zeile%%|*}"; pfad="${zeile#*|}"
  [ -n "$name" ] && [ -n "$pfad" ] || return 1
  linuxpfad="$(wslpfad "$pfad")"
  [ -x "$linuxpfad" ] || return 1          # Cache verfallen: exe weg oder verschoben
  echo "$zeile"
}

wslpfad() {  # C:\A\b.exe -> /mnt/c/A/b.exe
  printf '%s' "$1" | sed -e 's|\\|/|g' -e 's|^\([A-Za-z]\):|/mnt/\L\1|'
}

TERM_NAME="$(terminal_aus_env)"
TERM_EXE=""

if [ "$PLATTFORM" = "wsl" ]; then
  if treffer="$(lies_cache)"; then
    TERM_PROC="${treffer%%|*}"; TERM_EXE="$(wslpfad "${treffer#*|}")"
    QUELLE="Cache"
  elif treffer="$(terminal_aus_kette)"; then
    printf '%s\n' "$treffer" > "$CACHE"
    TERM_PROC="${treffer%%|*}"; TERM_EXE="$(wslpfad "${treffer#*|}")"
    QUELLE="Elternkette"
  else
    die "Terminal nicht ermittelbar: Elternkette lieferte kein Ergebnis und kein gültiger Cache vorhanden.
       Prüfen: 'command -v powershell.exe' und ob /proc/sys/fs/binfmt_misc/WSLInterop aktiviert ist."
  fi
  [ -x "$TERM_EXE" ] || die "Terminal-Programm nicht ausführbar: $TERM_EXE (aus $QUELLE)"
  # Namen aus der Kette ableiten, falls die Umgebungsvariable nichts hergab
  if [ -z "$TERM_NAME" ]; then
    case "${TERM_PROC,,}" in
      warp.exe)             TERM_NAME=warp ;;
      windowsterminal.exe)  TERM_NAME=windows-terminal ;;
      *)                    TERM_NAME="${TERM_PROC%.exe}" ;;
    esac
  fi
fi

[ -z "$TERM_NAME" ] && die "Terminal nicht identifizierbar: weder TERM_PROGRAM/WT_SESSION gesetzt noch (auf WSL) über die Elternkette ermittelbar."

if [ "$DETECT_ONLY" -eq 1 ]; then
  info "Plattform: $PLATTFORM"
  info "Terminal:  $TERM_NAME"
  [ -n "$TERM_EXE" ] && info "Programm:  $TERM_EXE (${QUELLE:-env})"
  exit 0
fi

# ------------------------------------------------------ 3./4. Startbefehl bauen
ZIEL="${DIR:-$PWD}"
WINZIEL=""
[ "$PLATTFORM" = "wsl" ] && WINZIEL="$(wslpath -w "$ZIEL" 2>/dev/null || true)"

starte() {  # nur ausführen, wenn nicht --dry-run
  if [ "$DRY" -eq 1 ]; then info "[dry-run] $*"; return 0; fi
  "$@" >/dev/null 2>&1 &
  disown 2>/dev/null || true
  return 0
}

KOMMANDO_DURCHGEREICHT=0

case "$TERM_NAME" in
  windows-terminal)
    # Neuer Tab im aktuellen Fenster; -d setzt das Arbeitsverzeichnis.
    command -v wt.exe >/dev/null 2>&1 || die "wt.exe nicht im PATH, obwohl Windows Terminal erkannt wurde."
    if [ -n "$CMD" ]; then
      starte wt.exe -w 0 nt -d "${WINZIEL:-$ZIEL}" wsl.exe -d "${WSL_DISTRO_NAME:-}" -- bash -lc "$CMD; exec bash"
      KOMMANDO_DURCHGEREICHT=1
    else
      starte wt.exe -w 0 nt -d "${WINZIEL:-$ZIEL}"
    fi
    ;;

  warp)
    # Warps CLI kennt KEINE Fenster-/Tabsteuerung (alle Subcommands sind Agent-/Cloud-Funktionen).
    # Steuerung läuft über das registrierte URI-Schema warp:// (HKCR\warp -> "warp.exe" "%0").
    # warp://action/new_tab öffnet einen Tab; ein Arbeitsverzeichnis oder Kommando lässt sich
    # darüber nicht übergeben — deshalb der Zwischenablage-Weg unten.
    [ -n "$TERM_EXE" ] || die "Warp erkannt, aber kein Programmpfad ermittelt."
    starte "$TERM_EXE" "warp://action/new_tab"
    ;;

  iterm)
    command -v osascript >/dev/null 2>&1 || die "osascript fehlt — iTerm nicht steuerbar."
    if [ -n "$CMD" ]; then
      starte osascript -e 'tell application "iTerm" to tell current window to create tab with default profile' \
                       -e "tell application \"iTerm\" to tell current session of current window to write text \"cd '$ZIEL' && $CMD\""
      KOMMANDO_DURCHGEREICHT=1
    else
      starte osascript -e 'tell application "iTerm" to tell current window to create tab with default profile' \
                       -e "tell application \"iTerm\" to tell current session of current window to write text \"cd '$ZIEL'\""
      KOMMANDO_DURCHGEREICHT=1
    fi
    ;;

  apple-terminal)
    command -v osascript >/dev/null 2>&1 || die "osascript fehlt — Terminal.app nicht steuerbar."
    starte osascript -e "tell application \"Terminal\" to do script \"cd '$ZIEL'${CMD:+ && $CMD}\"" \
                     -e 'tell application "Terminal" to activate'
    KOMMANDO_DURCHGEREICHT=1
    ;;

  vscode)
    die "VS-Code-integriertes Terminal: neue Tabs sind von außen nicht steuerbar.
       Nutze in VS Code Strg+Umschalt+\` oder starte ein eigenständiges Terminal."
    ;;

  *)
    # Rückfallebene: die exe ohne Argumente starten — öffnet unter Windows in aller Regel
    # ein neues Fenster. Nur möglich, wenn ein Pfad bekannt ist.
    [ -n "$TERM_EXE" ] || die "Kein Startbefehl für '$TERM_NAME' bekannt und kein Programmpfad ermittelt."
    warn "Kein spezifischer Startbefehl für '$TERM_NAME' — starte das Programm ohne Argumente (neues Fenster)."
    starte "$TERM_EXE"
    ;;
esac

# ------------------------------------------------------------------ 5. Bericht
info "Plattform: $PLATTFORM · Terminal: $TERM_NAME${TERM_EXE:+ ($TERM_EXE)}${QUELLE:+ [$QUELLE]}"
info "Verzeichnis: $ZIEL"

if [ -n "$CMD" ] && [ "$KOMMANDO_DURCHGEREICHT" -eq 0 ]; then
  # Fail-loud statt stillem Verschlucken: sagen, dass es nicht ging — und das Kommando
  # in die Zwischenablage legen, damit es mit einem Einfügen verfügbar ist.
  if command -v clip.exe >/dev/null 2>&1; then
    printf '%s' "$CMD" | clip.exe
    warn "'$TERM_NAME' kann kein Startkommando übernehmen. Es liegt in der Zwischenablage:"
  else
    warn "'$TERM_NAME' kann kein Startkommando übernehmen und clip.exe fehlt. Von Hand ausführen:"
  fi
  printf '  %s\n' "$CMD" >&2
  exit 3   # eigener Code: Fenster geöffnet, Kommando NICHT übernommen
fi
exit 0
