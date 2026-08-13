#!/usr/bin/env bash
# ab-harness.sh — gepaarter A/B-Lauf nach den Regeln, die in der Ladder-Serie
# den Unterschied zwischen "-0,3 % bei 33 % Rauschen" und "-27,2 % bei 3 % Rauschen"
# ausgemacht haben. Keine dieser Regeln betrifft das gemessene Werkzeug.
#
#   R1  Korpus einfrieren und Pruefsumme vor UND nach jedem Arm vergleichen.
#   R2  Je Lauf ein eigenes Verzeichnis. Nie wiederverwenden.
#   R3  Auswertung und Antwortschluessel AUSSERHALB der Messflaeche ablegen.
#   R4  Grundlast aus der Aufgabe entfernen. Jede Zeile ohne Bezug zur Messfrage
#       ist Rauschen mal voller Turn-Varianz.
#   R5  Effekt buendeln: alle Faelle in EINEN Lauf, nicht ueber Sessions verteilen.
#   R6  Jeder Fall unter 32 KB Ausgabe, sonst lagert die Umgebung genau die
#       entscheidende Stelle aus und sie erreicht den Kontext nie.
#   R7  CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=0 — ein gespawnter Teammate hat in
#       Serie v4 einen Lauf blockiert und ungueltig gemacht.
#   R8  Je Lauf eine AB-ANOMALIES.md schreiben. Hat zweimal einen stillen Defekt
#       aufgedeckt und ist der wirksamste Einzelbaustein des Harness.
#
# Zielmetrik: fresh input (uncached + cache creation), Median gepaart, Streuung
# ausgewiesen. NICHT Bytes, NICHT Slice-Kompressionsrate.
#
#   ./ab-harness.sh --corpus ./corpus --task ./ab-task.md --runs 3 --out ./ab-runs
#   ./ab-harness.sh --report ./ab-runs

set -euo pipefail

CORPUS=""; TASK=""; RUNS=3; OUT="./ab-runs"; REPORT=""
ARM_A_CMD="${ARM_A_CMD:-}"   # z. B. "" (Baseline)
ARM_B_CMD="${ARM_B_CMD:-}"   # z. B. "aktiviere Owner X"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --corpus) CORPUS="$2"; shift 2;;
    --task)   TASK="$2";   shift 2;;
    --runs)   RUNS="$2";   shift 2;;
    --out)    OUT="$2";    shift 2;;
    --report) REPORT="$2"; shift 2;;
    *) echo "unbekannte Option: $1" >&2; exit 2;;
  esac
done

die() { echo "ab-harness: $*" >&2; exit 1; }

if [[ -n "$REPORT" ]]; then
  [[ -d "$REPORT" ]] || die "Report-Verzeichnis fehlt: $REPORT"
  python3 - "$REPORT" <<'PY'
import json,sys,statistics,pathlib
root=pathlib.Path(sys.argv[1])
runs=[]
for f in sorted(root.glob("*/metrics.json")):
    try: runs.append(json.loads(f.read_text()))
    except Exception as e: print(f"! {f}: {e}")
if not runs: sys.exit("keine metrics.json gefunden — Laeufe unvollstaendig")
for arm in ("A","B"):
    v=[r["fresh_input"] for r in runs if r.get("arm")==arm and r.get("valid")]
    if not v: print(f"Arm {arm}: keine gueltigen Laeufe"); continue
    med=statistics.median(v); spread=(max(v)-min(v))/med*100 if med else 0
    print(f"Arm {arm}: n={len(v)} median fresh input={med:,.0f} Streuung={spread:.0f}%")
a=[r["fresh_input"] for r in runs if r.get("arm")=="A" and r.get("valid")]
b=[r["fresh_input"] for r in runs if r.get("arm")=="B" and r.get("valid")]
if a and b:
    ma,mb=statistics.median(a),statistics.median(b)
    d=(mb-ma)/ma*100
    sa=(max(a)-min(a))/ma*100; sb=(max(b)-min(b))/mb*100
    print(f"\ngepaart: {d:+.1f} %")
    if abs(d) < max(sa,sb):
        print("WARNUNG: die Differenz liegt innerhalb der Streuung. Das ist KEIN Ergebnis.")
        print("         Grundlast senken (R4), Faelle buendeln (R5), dann erneut messen.")
PY
  exit 0
fi

[[ -n "$CORPUS" ]] || die "--corpus fehlt"
[[ -d "$CORPUS" ]] || die "Korpus nicht gefunden: $CORPUS"     # fail-loud
[[ -n "$TASK"   ]] || die "--task fehlt"
[[ -f "$TASK"   ]] || die "Aufgabendatei nicht gefunden: $TASK" # fail-loud
command -v shasum >/dev/null || command -v sha256sum >/dev/null || die "kein sha256-Werkzeug"

SHACMD="sha256sum"; command -v sha256sum >/dev/null || SHACMD="shasum -a 256"
corpus_sha() { find "$CORPUS" -type f -print0 | sort -z | xargs -0 $SHACMD | $SHACMD | cut -c1-16; }

mkdir -p "$OUT"
BASE_SHA="$(corpus_sha)"
echo "Korpus-SHA: $BASE_SHA"
echo "$BASE_SHA" > "$OUT/corpus.sha"

# R3: Auswertung liegt NICHT unter $OUT
EVAL_DIR="$(dirname "$OUT")/auswertung"
mkdir -p "$EVAL_DIR"
[[ "$EVAL_DIR" == "$OUT"* ]] && die "Auswertung liegt in der Messflaeche — R3 verletzt"

for arm in A B; do
  cmd_var="ARM_${arm}_CMD"; cmd="${!cmd_var}"
  for i in $(seq 1 "$RUNS"); do
    ts="$(date +%Y%m%d-%H%M%S)"
    dir="$OUT/${arm}${i}-${ts}"          # R2: Zeitstempel, nie wiederverwendbar
    [[ -e "$dir" ]] && die "Laufverzeichnis existiert bereits: $dir"
    mkdir -p "$dir"
    cp -R "$CORPUS" "$dir/corpus"        # R1: Kopie je Lauf
    cp "$TASK" "$dir/task.md"
    : > "$dir/AB-ANOMALIES.md"           # R8: Pflichtdatei, leer angelegt

    echo "== Arm $arm Lauf $i -> $dir"
    echo "   Umschaltung: ${cmd:-<keine, Baseline>}"
    [[ -n "$cmd" ]] && ( cd "$dir" && eval "$cmd" ) || true

    cat > "$dir/RUN.md" <<EOF
# Lauf ${arm}${i}
- Arm: $arm
- Umschaltung: ${cmd:-Baseline}
- Korpus-SHA vorher: $BASE_SHA
- Aufgabe: $(basename "$TASK")

## Durchfuehrung
    cd "$dir"
    CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=0 claude -p "\$(cat task.md)"

## Danach
1. \`/context\` und \`ccusage\` auslesen, Werte in metrics.json eintragen:
   { "arm": "$arm", "run": $i, "fresh_input": <uncached+cache_creation>,
     "cache_read": <n>, "output": <n>, "turns": <n>, "valid": true, "quality_ok": true }
2. Auffaelligkeiten in AB-ANOMALIES.md. Leer lassen ist eine Aussage, kein Versaeumnis.
3. Qualitaetsgate VOR Tokengate: sind die Antworten fachlich gleichwertig?
EOF
    after="$(corpus_sha)"
    if [[ "$after" != "$BASE_SHA" ]]; then
      echo "KORPUS VERAENDERT ($BASE_SHA -> $after) — Lauf ungueltig" | tee -a "$dir/AB-ANOMALIES.md"
      echo '{"valid": false, "reason": "corpus drift"}' > "$dir/metrics.json"
    fi
  done
done

cat <<EOF

Vorbereitet: $((RUNS*2)) Laufverzeichnisse unter $OUT
Auswertung:  $EVAL_DIR   (ausserhalb der Messflaeche, R3)

Naechster Schritt: jeden Lauf nach RUN.md ausfuehren, metrics.json fuellen,
dann:  ./ab-harness.sh --report "$OUT"
EOF
