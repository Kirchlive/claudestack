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
  command -v python3 >/dev/null || die "python3 fehlt — Auswertung nicht moeglich"  # fail-loud
  # Exit-Semantik: 0 = Net-Win-Gate erfuellt · 3 = Gate nicht erfuellt (kein Ergebnis)
  #                1 = fehlende/unlesbare Pruefgegenstaende (nie als bestanden werten)
  python3 - "$REPORT" <<'PY'
import json,sys,statistics,pathlib
MIN_REPLIKATE=3                      # Gate P6: >= 3 gepaarte Replikate
root=pathlib.Path(sys.argv[1])

runs=[]; unlesbar=[]
for f in sorted(root.glob("*/metrics.json")):
    try: runs.append(json.loads(f.read_text()))
    except Exception as e: unlesbar.append((f,e))

dirs=[d for d in sorted(root.glob("*")) if d.is_dir()]
ohne_metrics=[d.name for d in dirs if not (d/"metrics.json").exists()]
ohne_anomalien=[d.name for d in dirs if not (d/"AB-ANOMALIES.md").exists()]   # R8

# --- Fail-loud: fehlende Pruefgegenstaende werden NIE als bestanden gewertet ---
fehlend=[]
for f,e in unlesbar: print(f"! nicht lesbar: {f}: {e}")
if unlesbar:       fehlend.append(f"{len(unlesbar)} metrics.json nicht lesbar")
if ohne_metrics:   print("! ohne metrics.json: "+", ".join(ohne_metrics));      fehlend.append(f"{len(ohne_metrics)} Laeufe ohne metrics.json")
if ohne_anomalien: print("! ohne AB-ANOMALIES.md (R8): "+", ".join(ohne_anomalien)); fehlend.append(f"{len(ohne_anomalien)} Laeufe ohne AB-ANOMALIES.md")

if not runs and not fehlend:
    fehlend.append("keine metrics.json gefunden")

def frisch(r):
    v=r.get("fresh_input")
    return v if isinstance(v,(int,float)) else None

gate=[]                              # Gruende, warum das Gate nicht erfuellt ist
# valide Laeufe ohne verwertbaren Messwert sind ein Befund, kein stiller Ausfall
kaputt=[r for r in runs if r.get("valid") and frisch(r) is None]
if kaputt: fehlend.append(f"{len(kaputt)} gueltige Laeufe ohne fresh_input")

# Qualitaetsgate VOR Tokengate (bisher nur Prosa in RUN.md, nie geprueft)
schlecht=[r for r in runs if r.get("valid") and r.get("quality_ok") is not True]
if schlecht:
    gate.append(f"{len(schlecht)} Laeufe ohne quality_ok=true — Qualitaetsgate vor Tokengate")

serie={}
for arm in ("A","B"):
    v=[frisch(r) for r in runs if r.get("arm")==arm and r.get("valid") and frisch(r) is not None]
    if not v:
        print(f"Arm {arm}: keine gueltigen Laeufe"); gate.append(f"Arm {arm}: keine gueltigen Laeufe"); continue
    med=statistics.median(v); spread=(max(v)-min(v))/med*100 if med else 0
    serie[arm]=(v,med,spread)
    print(f"Arm {arm}: n={len(v)} median fresh input={med:,.0f} Streuung={spread:.0f}%")
    if len(v)<MIN_REPLIKATE: gate.append(f"Arm {arm}: nur {len(v)} von {MIN_REPLIKATE} Replikaten")

if "A" in serie and "B" in serie:
    (a,ma,sa),(b,mb,sb)=serie["A"],serie["B"]
    d=(mb-ma)/ma*100
    print(f"\ngepaart: {d:+.1f} %")
    if abs(d) < max(sa,sb):
        print("WARNUNG: die Differenz liegt innerhalb der Streuung. Das ist KEIN Ergebnis.")
        print("         Grundlast senken (R4), Faelle buendeln (R5), dann erneut messen.")
        gate.append(f"Effekt {d:+.1f} % kleiner als Streuung {max(sa,sb):.0f} % — kein Effekt")
    elif d >= 0:
        gate.append(f"kein Nettogewinn: {d:+.1f} %")

if fehlend:
    print("\nFEHLENDE PRUEFGEGENSTAENDE:")
    for x in fehlend: print("  -",x)
    print("Ergebnis wird NICHT als bestanden gewertet.")
    sys.exit(1)
if gate:
    print("\nNET-WIN-GATE NICHT ERFUELLT:")
    for x in gate: print("  -",x)
    print("Konsequenz nach Phase 7: Verlierer samt Hooks, State und env vollstaendig entfernen.")
    sys.exit(3)
print("\nNET-WIN-GATE ERFUELLT — Nettogewinn groesser als Streuung, Qualitaet unveraendert.")
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
    # Fail-loud: ein "|| true" hier machte einen Fehlschlag der Umschaltung
    # ununterscheidbar vom Baseline-Fall. Der Lauf mass dann zweimal denselben
    # Zustand und meldete erwartungsgemaess "kein Unterschied" (D2-Muster).
    if [[ -n "$cmd" ]]; then
      if ! ( cd "$dir" && eval "$cmd" ) > "$dir/arm-switch.log" 2>&1; then
        echo "ARM-UMSCHALTUNG FEHLGESCHLAGEN (Arm $arm, Lauf $i): $cmd" | tee -a "$dir/AB-ANOMALIES.md" >&2
        echo '{"valid": false, "reason": "arm switch failed"}' > "$dir/metrics.json"
        die "Arm-Umschaltung fehlgeschlagen — Lauf ${arm}${i} wuerde den falschen Zustand messen. Protokoll: $dir/arm-switch.log"
      fi
      echo "   Umschaltung OK (Protokoll: $dir/arm-switch.log)"
    fi

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
