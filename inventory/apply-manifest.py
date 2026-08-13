#!/usr/bin/env python3
"""AP-3.3 / AP-3.8: Manifest anwenden — jede uebernommene Datei an ihren Zielpfad.

Mehrfach belegte Zielpfade (Zusammenfuehrungen) werden NICHT ueberkopiert; sie
entstehen redaktionell in AP-3.4/3.5/3.6 (Phase 3) bzw. AP-4.3/4.4/5.1/5.5.
Ausnahme: zwei Zusammenfuehrungsziele haben keinen GPT56SOL-Anteil, dort wird
die im Plan designierte Traegerquelle als Basis gelegt.
"""
from __future__ import annotations

import csv
import hashlib
import shutil
import sys
from collections import Counter
from pathlib import Path

ROOT = Path("/home/rob/.claude-tweak")
SRC = ROOT / "repos_v2"
DST = ROOT / "claude-code-token-stack"
PAKET_DIR = {
    "gpt56sol": "gpt56sol_claude-code-token-stack",
    "k3swarm": "k3swarm_claude-token-stack-paket",
    "opus5": "opus5_claude-token-stack",
}
# Zusammenfuehrungsziel -> Traegerquelle, die jetzt als Basis gelegt wird.
# Ziele mit GPT56SOL-Anteil brauchen keinen Eintrag: der Traeger liegt bereits.
BASIS_QUELLE = {
    "scripts/repo-audit.py": "opus5/scripts/repo-audit.py",
    "hooks/optional/prefix-budget.mjs": "k3swarm/hooks/prefix-budget.mjs",
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def quelle_pfad(quelle: str) -> Path:
    paket, _, rest = quelle.partition("/")
    return SRC / PAKET_DIR[paket] / rest


def main() -> int:
    with (ROOT / "MERGE-MANIFEST.tsv").open(encoding="utf-8") as fh:
        zeilen = list(csv.DictReader(fh, delimiter="\t"))

    ziel_count = Counter(z["zielpfad"] for z in zeilen)
    kopiert, uebersprungen, bearbeitet, fehler = [], [], [], []

    for z in zeilen:
        quelle, ziel = z["quelle"], z["zielpfad"]
        src = quelle_pfad(quelle)
        if not src.is_file():
            fehler.append(f"QUELLE FEHLT: {quelle}")
            continue
        ist_hash = sha256(src)
        if ist_hash != z["sha256"]:
            fehler.append(f"HASH-ABWEICHUNG: {quelle}")
            continue
        if ziel_count[ziel] > 1 and BASIS_QUELLE.get(ziel) != quelle:
            uebersprungen.append(f"{quelle} -> {ziel}")
            continue
        dst = DST / ziel
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.exists():
            if sha256(dst) == ist_hash:
                continue  # Traegerdatei liegt bereits identisch (cp -r)
            # Zieldatei existiert und weicht ab: redaktionell bearbeitet.
            # NICHT ueberschreiben — sonst zerstoert ein Wiederholungslauf die
            # Arbeit der Phasen 3-5 (Lehre aus Befund P3-1).
            bearbeitet.append(f"{ziel} (weicht von {quelle} ab, bleibt unberuehrt)")
            continue
        shutil.copy2(src, dst)
        kopiert.append(ziel)

    print(f"kopiert:        {len(kopiert)}")
    print(f"geschuetzt:     {len(bearbeitet)} (bereits bearbeitet, nicht ueberschrieben)")
    for b in sorted(bearbeitet):
        print(f"  = {b}")
    print(f"uebersprungen:  {len(uebersprungen)} (Zusammenfuehrungen, redaktionell)")
    for u in sorted(uebersprungen):
        print(f"  - {u}")
    if fehler:
        print(f"\nFAIL-LOUD ({len(fehler)}):")
        for f in fehler:
            print(f"  ! {f}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
