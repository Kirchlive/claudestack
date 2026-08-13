#!/usr/bin/env python3
"""Kollisionsinventur der drei Quellpakete (Phase 2, AP-2.1/AP-2.2).

Erzeugt:
  inventory/collision-inventory.tsv   eine Zeile je Paketdatei
  MERGE-MANIFEST.tsv                  eine Zeile je uebernommener Datei

Das Aktions- und Zielpfad-Mapping ist woertlich aus UMSETZUNGSPLAN §5.1-5.3
(Datei-Arbeitsliste) und CLAUDESTACK-FINALIZE §C.2 kodiert. Es wird hier NICHT
neu entschieden - L-1 bis L-5 stehen fest, dieses Skript wendet sie nur an.

Fail-loud (L-6): jede Datei ohne Mapping-Eintrag landet in der Spalte aktion
als "NICHT_ZUGEORDNET" und wird am Ende gesondert ausgewiesen.
"""

from __future__ import annotations

import hashlib
import re
import sys
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
QUELLEN = REPO / "repos_v2"

PAKETE = {
    "gpt56sol": "gpt56sol_claude-code-token-stack",
    "k3swarm": "k3swarm_claude-token-stack-paket",
    "opus5": "opus5_claude-token-stack",
}

# ---------------------------------------------------------------------------
# Mapping: relativer Quellpfad -> (aktion, zielpfad, flaeche, begruendung)
# aktion: unveraendert | angepasst | evidence | verworfen | neu_erzeugt
# zielpfad "-" = wird nicht uebernommen
# ---------------------------------------------------------------------------

MAPPING: dict[str, dict[str, tuple[str, str, str, str]]] = {}

# --- GPT56SOL (33) - Traeger, UMSETZUNGSPLAN §5.1 --------------------------
MAPPING["gpt56sol"] = {
    # unveraendert (6)
    "hooks/claudestack.mjs": ("unveraendert", "hooks/claudestack.mjs", "bash_output", "308-Byte-Shim, einzige registrierte Hook-Datei"),
    "templates/TASK-STATE.md": ("unveraendert", "templates/TASK-STATE.md", "session", "gewinnt gegen K3- und OPUS-Variante"),
    "tests/benchmark.test.mjs": ("unveraendert", "tests/benchmark.test.mjs", "none", "Testsuite des Traegers"),
    "scripts/evaluate-benchmark.mjs": ("unveraendert", "scripts/evaluate-benchmark.mjs", "none", "Auswertung Benchmarklaeufe"),
    "examples/benchmark-runs.example.jsonl": ("unveraendert", "examples/benchmark-runs.example.jsonl", "none", "Beispieldaten"),
    "validate/03-measure-token-surfaces.py": ("unveraendert", "scripts/03-measure-token-surfaces.py", "prefix", "lauffaehig, kein Archiv - erzeugt Prefix-Messung neu"),
    # angepasst (19)
    "package.json": ("angepasst", "package.json", "none", "Version 2.0.0, files-Feld um waves/ und hooks/optional/ erweitern"),
    "README.md": ("angepasst", "README.md", "none", "Herkunftsabschnitt, MERGE-MANIFEST-Verweis, Phase-0-Hinweis"),
    "bin/claudestack.mjs": ("angepasst", "bin/claudestack.mjs", "none", "Unterbefehl evidence ergaenzen"),
    "src/stack.mjs": ("angepasst", "src/stack.mjs", "bash_output", "C.3.1 - Canary-Anbindung, Deny-Gate-Grenze, String-Normalisierung"),
    "config/token-stack.schema.json": ("angepasst", "config/token-stack.schema.json", "none", "Felder fuer Canary-Pfad und optionale Hooks"),
    "config/token-stack.default.json": ("angepasst", "config/token-stack.default.json", "none", "mode off statt shadow bis Phase 3"),
    "config/context-surface-owners.json": ("angepasst", "config/context-surface-owners.json", "none", "C.3.2 - Zusammenfuehrung dreier Registries"),
    "rules/token-stack.md": ("angepasst", "rules/token-stack.md", "none", "C.3.3 - Zusammenfuehrung dreier Regelwerke, <3KB"),
    "templates/CLAUDE.md": ("angepasst", "templates/CLAUDE.md", "prefix", "C.3.4 - harte Obergrenze 4KB, Compact-Block aus K3"),
    "tests/stack.test.mjs": ("angepasst", "tests/stack.test.mjs", "none", "Faelle fuer die drei neuen stack.mjs-Zweige"),
    "tests/cli.test.mjs": ("angepasst", "tests/cli.test.mjs", "none", "Fall fuer evidence-Unterbefehl"),
    "scripts/verify-package.mjs": ("angepasst", "scripts/verify-package.mjs", "none", "C.3.5 - Fail-loud-Block, 9 Semantik-Checks, Byte-Deckel"),
    "docs/ARCHITECTURE.md": ("angepasst", "docs/ARCHITECTURE.md", "none", "Absatz zu optionalen Hooks und Nichtregistrierung"),
    "docs/DECISIONS.md": ("angepasst", "docs/DECISIONS.md", "none", "ADR-015 bis ADR-017 ergaenzen"),
    "docs/SECURITY.md": ("angepasst", "docs/SECURITY.md", "none", "Guard-Namenskollision und Deny-Gate im Quellrepo"),
    "docs/MIGRATION.md": ("angepasst", "docs/MIGRATION.md", "none", "Phase 0 als Vorbedingung voranstellen"),
    "docs/WAVES.md": ("angepasst", "docs/WAVES.md", "none", "auf waves/WAVE-INDEX.md verweisen statt duplizieren"),
    "docs/BENCHMARK.md": ("angepasst", "docs/BENCHMARK.md", "none", "gepaarter Aufbau, Endpunktdefinition fresh input"),
    "docs/REPO-MATRIX.md": ("angepasst", "docs/REPO-MATRIX.md", "none", "C.3.6 - Divergenzspalten opus_score, k3_score, dissens"),
    # neu erzeugt (1)
    "SHA256SUMS.txt": ("neu_erzeugt", "SHA256SUMS.txt", "none", "nach Zusammenfuehrung neu berechnet - alte Summen ungueltig"),
    # evidence (7)
    "validate/01-validation-crosswalk-5point.md": ("evidence", "evidence/gpt56/01-validation-crosswalk-5point.md", "none", "Archiv"),
    "validate/02-squeez-rtk-ladder-reference-audit.md": ("evidence", "evidence/gpt56/02-squeez-rtk-ladder-reference-audit.md", "ladder", "Archiv - Ladder-Messwerte"),
    "validate/03-file-token-metrics.csv": ("evidence", "evidence/gpt56/03-file-token-metrics.csv", "none", "Archiv"),
    "validate/03-file-token-metrics.json": ("evidence", "evidence/gpt56/03-file-token-metrics.json", "none", "Archiv"),
    "validate/04-second-validation-100point.md": ("evidence", "evidence/gpt56/04-second-validation-100point.md", "none", "Archiv - Quelle fuer judgments.json"),
    "validate/05-final-consolidated-token-stack.md": ("evidence", "evidence/gpt56/05-final-consolidated-token-stack.md", "none", "Archiv"),
    "validate/06-incoming-reconciliation.md": ("evidence", "evidence/gpt56/06-incoming-reconciliation.md", "none", "Archiv - Verifier-Pflichtdatei, Pfad in verify-package.mjs anpassen"),
}

# --- K3SWARM (54) - Pfropfung Flaechen/Tests, UMSETZUNGSPLAN §5.2 ----------
MAPPING["k3swarm"] = {
    # unveraendert (4)
    "hooks/read-slice-guard.mjs": ("unveraendert", "hooks/optional/read-slice-guard.mjs", "read", "Regelmodul, wird von read-context-guard geladen"),
    "hooks/reread-guard.mjs": ("unveraendert", "hooks/optional/reread-guard.mjs", "read", "Regelmodul"),
    "hooks/ctx-used-marker.mjs": ("unveraendert", "hooks/optional/ctx-used-marker.mjs", "session", "Observer, unveraendert"),
    "hooks/lib/token-stack-shared.mjs": ("unveraendert", "hooks/optional/lib/token-stack-shared.mjs", "none", "gemeinsame Bibliothek der optionalen Hooks"),
    # angepasst (22)
    "hooks/claude-hook-capability-canary.mjs": ("angepasst", "hooks/optional/claude-hook-capability-canary.mjs", "canary", "C.3.7 - Ausgabepfad an Dispatcher, expiresAt ergaenzen"),
    "hooks/prefix-budget.mjs": ("angepasst", "hooks/optional/prefix-budget.mjs", "prefix", "C.3.8 - Traeger des Duells, D1-Block aus OPUS portieren"),
    "hooks/read-context-guard.mjs": ("angepasst", "hooks/optional/read-context-guard.mjs", "read", "Pfade relativ machen, CLAUDE_CONFIG_DIR-Support"),
    "hooks/session-economy.mjs": ("angepasst", "hooks/optional/session-economy.mjs", "session", "Observer, Nudge an gemeinsames Budget binden"),
    "hooks/bash-size-feedback.mjs": ("angepasst", "hooks/optional/bash-size-feedback.mjs", "bash_output", "zaehlt in dasselbe Nudge-Budget"),
    "hooks/tests/hook-contract-smoke.mjs": ("angepasst", "tests/contract/hook-contract-smoke.mjs", "none", "ROOT-Aufloesung nach Umzug anpassen"),
    "hooks/tests/test-guard-all.mjs": ("angepasst", "tests/contract/test-guard-all.mjs", "none", "fail-silent in t()-Hilfsfunktion beheben, process.execPath"),
    "config/native-token-limits.example.jsonc": ("angepasst", "config/native-token-limits.example.jsonc", "none", "Caveats zu AUTOCOMPACT_PCT_OVERRIDE und ENABLE_TOOL_SEARCH pruefen"),
    "config/bash-dump-guard.config.json": ("angepasst", "config/bash-dump-guard.config.json", "bash_output", "Pilotwerte 4096/512/15% in Dispatcher-Config uebertragen"),
    "regelwerk/token-efficiency.rules.md": ("angepasst", "rules/token-stack.md", "none", "C.3.3 - inhaltliche Ergaenzung der GPT-Kurzfassung"),
    "regelwerk/context-surface-owners.yaml": ("angepasst", "config/context-surface-owners.json", "none", "C.3.2 - Schluesselmengen-Diff in die JSON-Registry"),
    "regelwerk/CLAUDE.md.template": ("angepasst", "templates/CLAUDE.md", "prefix", "C.3.4 - nur Compact-Block und Ladder-Verweis uebernehmen"),
    "regelwerk/LADDER.md": ("angepasst", "docs/LADDER.md", "ladder", "Geltungsbereich auf Quelltext <32KB einengen"),
    "planung/MESSPLAN.md": ("angepasst", "docs/MESSPLAN.md", "none", "Endpunktdefinition fresh input, Schwellen als provisorisch kennzeichnen"),
    "planung/ROLLOUT.md": ("angepasst", "docs/ROLLOUT.md", "none", "mit waves/WAVE-INDEX.md abgleichen, keine zwei Fahrplaene"),
    "scripts/benchmark-harness.md": ("angepasst", "docs/BENCHMARK.md", "none", "einarbeiten, nicht doppeln"),
    "scripts/verify-package.sh": ("angepasst", "scripts/verify-package.mjs", "none", "C.3.5 - 9 Semantik-Checks uebernehmen, Skript selbst entfaellt"),
    "katalog/kern-katalog.md": ("angepasst", "docs/REPO-MATRIX.md", "none", "C.3.6 - Flags und Aktivierungsgates in dieselbe Zeile"),
    "katalog/HINWEIS.md": ("angepasst", "docs/REPO-MATRIX.md", "none", "Konsolidierungsregeln als Fussnote"),
    "docs/scrape_issues.py": ("angepasst", "scripts/scrape_issues.py", "none", "lauffaehig - mit repo-audit.py zusammenfuehren"),
    "docs/scrape_issues2.py": ("angepasst", "scripts/repo-audit.py", "none", "Variante in repo-audit.py einarbeiten"),
    "docs/scrape_issues3.py": ("angepasst", "scripts/repo-audit.py", "none", "Variante in repo-audit.py einarbeiten"),
    # evidence (21)
    "hooks/ladder-ledger.mjs": ("evidence", "evidence/k3/ladder-ledger.mjs", "ladder", "Referenz - Ladder bleibt aus (L-9)"),
    "hooks/ladder-retrieve-gate.mjs": ("evidence", "evidence/k3/ladder-retrieve-gate.mjs", "ladder", "gemessen +9,6% - verworfen, Code als Evidenz"),
    "hooks/ladder-retrieve-filter.mjs": ("evidence", "evidence/k3/ladder-retrieve-filter.mjs", "ladder", "gemessen -0,3% - verworfen, Code als Evidenz"),
    "config/ladder-config.json": ("evidence", "evidence/k3/ladder-config.json", "ladder", "Referenz"),
    "VALIDIERUNG.md": ("evidence", "evidence/k3/VALIDIERUNG.md", "none", "§5 Messreihen und §6 Eigenpruefung - wertvollster Teil"),
    "KONZEPT.md": ("evidence", "evidence/k3/KONZEPT.md", "none", "Archiv"),
    "MASTERPLAN.md": ("evidence", "evidence/k3/MASTERPLAN.md", "none", "Archiv - waves/ gewinnt als Fahrplan"),
    "README.md": ("evidence", "evidence/k3/README.md", "none", "Archiv - GPT-README gewinnt"),
    "docs/finaler-abgleich.md": ("evidence", "evidence/k3/finaler-abgleich.md", "none", "Archiv"),
    "docs/K3SWARM-REVISION-3RUNDE.md": ("evidence", "evidence/k3/K3SWARM-REVISION-3RUNDE.md", "none", "Archiv"),
    "docs/vergleich-4wege.md": ("evidence", "evidence/k3/vergleich-4wege.md", "none", "Archiv"),
    "docs/zweitvalidierung-update.md": ("evidence", "evidence/k3/zweitvalidierung-update.md", "none", "Archiv - Quelle der K3-Scores"),
    "docs/verifikationsbericht-claudestack.md": ("evidence", "evidence/k3/verifikationsbericht-claudestack.md", "none", "Archiv"),
    "docs/SQUEEZ-RTK-LADDER-ANALYSE.md": ("evidence", "evidence/k3/SQUEEZ-RTK-LADDER-ANALYSE.md", "ladder", "Archiv - Ladder-Messbefund F-4"),
    "docs/review-bericht.md": ("evidence", "evidence/k3/review-bericht.md", "none", "Archiv"),
    "docs/changes.md": ("evidence", "evidence/k3/changes.md", "none", "Archiv - ponytail-Beleg"),
    "docs/plan.md": ("evidence", "evidence/k3/plan.md", "none", "Archiv"),
    "docs/claude-token-stack-evaluierung-und-merge.md": ("evidence", "evidence/k3/claude-token-stack-evaluierung-und-merge.md", "none", "Archiv"),
    "docs/issues_out.txt": ("evidence", "evidence/k3/issues/issues_out.txt", "none", "Rohdaten der Issue-Recherche"),
    "docs/issues_out2.txt": ("evidence", "evidence/k3/issues/issues_out2.txt", "none", "Rohdaten"),
    "docs/issues_out3.txt": ("evidence", "evidence/k3/issues/issues_out3.txt", "none", "Rohdaten"),
    # verworfen (7)
    "hooks/bash-dump-guard.mjs": ("verworfen", "-", "bash_output", "zweiter Bash-Output-Owner - Gesetz I (L-1)"),
    "hooks/bash-dump-gate.mjs": ("verworfen", "-", "bash_pre_gate", "PreToolUse-Deny-Gate - getrennte Policy-Frage im Quellrepo"),
    "hooks/tests/test-ladder.mjs": ("verworfen", "-", "ladder", "prueft die nicht uebernommenen Ladder-Rungs"),
    "config/settings.json": ("verworfen", "-", "none", "Volltemplate - widerspricht dem Fragment-Ansatz (L-10)"),
    "regelwerk/TASK-STATE.template.md": ("verworfen", "-", "session", "GPT-Variante gewinnt"),
    "scripts/install.sh": ("verworfen", "-", "none", "merged settings.json ohne Baseline - widerspricht ADR-012"),
    "docs/claude-token-stack-evaluierung-und-merge.docx": ("verworfen", "-", "none", "Binaerdublette derselben Datei"),
}

# --- OPUS5 (25) - Pfropfung Governance, UMSETZUNGSPLAN §5.3 ----------------
MAPPING["opus5"] = {
    # unveraendert (1)
    "config/plugin-diet.md": ("unveraendert", "config/plugin-diet.md", "none", "Grundlage fuer Phase 0"),
    # angepasst (13)
    "waves/WAVE-INDEX.md": ("angepasst", "waves/WAVE-INDEX.md", "none", "Wave 0 = Phase 0 voranstellen, Acceptance-Werte neu erheben"),
    "waves/WAVE-STATE.md": ("angepasst", "waves/WAVE-STATE.md", "none", "auf leer zuruecksetzen - traegt fremden Fortschritt"),
    "DEFEKTE.md": ("angepasst", "docs/DEFEKTE.md", "none", "C.3.10 - mit GPT-Befunden zu einem Register, D1-D9"),
    "scripts/judgments.json": ("angepasst", "scripts/judgments.json", "none", "C.3.11 - source_model und Abdeckung ergaenzen"),
    "scripts/ab-harness.sh": ("angepasst", "scripts/ab-harness.sh", "none", "chmod +x, Fail-loud-Fix an :105"),
    "scripts/repo-audit.py": ("angepasst", "scripts/repo-audit.py", "none", "die drei K3-Scrape-Varianten einarbeiten"),
    "scripts/repos.txt": ("angepasst", "scripts/repos.txt", "none", "auf Zielmatrix kuerzen - Schluesselmenge 33"),
    "scripts/verify-stack.mjs": ("angepasst", "scripts/verify-package.mjs", "none", "C.3.5 - Fail-loud-Block uebernehmen"),
    "config/settings.patch.json": ("angepasst", "config/settings.patch.json", "none", "gegen echten Ist-Stand neu erzeugen"),
    "rules/token-efficiency.rules.md": ("angepasst", "rules/token-stack.md", "none", "C.3.3 - inhaltliche Ergaenzung"),
    "rules/context-surface-owners.yaml": ("angepasst", "config/context-surface-owners.json", "none", "C.3.2 - Schluesselmengen-Diff"),
    "hooks/prefix-budget.mjs": ("angepasst", "hooks/optional/prefix-budget.mjs", "prefix", "C.3.8 - D1-Block und Gesamt-Budget nach K3-Traeger portieren"),
    "validate/scores100-v51.json": ("angepasst", "scripts/scores100-v51.json", "none", "lauffaehige Datenquelle, Abdeckung getrennt ausweisen"),
    # evidence (6)
    "hooks/bash-owner-dispatch.mjs": ("evidence", "evidence/opus5/bash-owner-dispatch.mjs", "bash_output", "dritter Dispatcher auf derselben Flaeche - Referenz"),
    "hooks/bash-owner-dispatch.config.example.json": ("evidence", "evidence/opus5/bash-owner-dispatch.config.example.json", "bash_output", "gehoert zum Dispatcher"),
    "hooks/hooks.settings.example.json": ("evidence", "evidence/opus5/hooks.settings.example.json", "bash_output", "Registrierungsbeispiel des Dispatchers"),
    "KONZEPT-v5.md": ("evidence", "evidence/opus5/KONZEPT-v5.md", "none", "Archiv - Abschnitte nach ARCHITECTURE.md"),
    "MASTERPLAN.md": ("evidence", "evidence/opus5/MASTERPLAN.md", "none", "Archiv - waves/ gewinnt"),
    "README.md": ("evidence", "evidence/opus5/README.md", "none", "Archiv"),
    # verworfen (5)
    "TASK-STATE.template.md": ("verworfen", "-", "session", "GPT-Variante gewinnt"),
    "MANIFEST.json": ("verworfen", "-", "none", "package.json plus SHA256SUMS.txt ersetzen es"),
    "validate/DEFEKTE.md": ("verworfen", "-", "none", "byteidentische Dublette der Wurzelkopie"),
    "validate/judgments.json": ("verworfen", "-", "none", "byteidentische Dublette der Wurzelkopie"),
    "validate/KONZEPT-v5.md": ("verworfen", "-", "none", "byteidentische Dublette der Wurzelkopie"),
}

# ---------------------------------------------------------------------------
# Mutations- und Hook-Event-Erkennung
# ---------------------------------------------------------------------------

RE_EVENT = re.compile(r'["\']?(PreToolUse|PostToolUse|PreCompact|PostCompact|SessionStart|SessionEnd|UserPromptSubmit|Stop|Notification)["\']?')
RE_MATCHER = re.compile(r'matcher["\']?\s*[:=]\s*["\']([^"\']+)["\']')

MUTATIONS = {
    "permissionDecision": "permissionDecision",
    "updatedToolOutput": "updatedToolOutput",
    "updatedInput": "updatedInput",
}


def analysiere_quelltext(text: str) -> tuple[str, str]:
    events = sorted(set(RE_EVENT.findall(text)))
    matcher = sorted(set(RE_MATCHER.findall(text)))
    teile = events + [f"matcher:{m}" for m in matcher]
    mutationen = [name for schluessel, name in MUTATIONS.items() if schluessel in text]
    if not mutationen:
        mutationen = ["observer"] if events else ["none"]
    return ",".join(teile), ",".join(mutationen)


def main() -> int:
    if not QUELLEN.is_dir():
        print(f"FEHLER: Quellverzeichnis fehlt: {QUELLEN}", file=sys.stderr)
        return 2

    datensaetze: list[dict[str, object]] = []
    basenamen: dict[str, set[str]] = defaultdict(set)
    hashes: dict[str, list[str]] = defaultdict(list)

    for paket, verzeichnis in PAKETE.items():
        wurzel = QUELLEN / verzeichnis
        if not wurzel.is_dir():
            print(f"FEHLER (fail-loud): Paketverzeichnis fehlt: {wurzel}", file=sys.stderr)
            return 2
        for datei in sorted(p for p in wurzel.rglob("*") if p.is_file()):
            relativ = datei.relative_to(wurzel).as_posix()
            roh = datei.read_bytes()
            digest = hashlib.sha256(roh).hexdigest()
            try:
                text = roh.decode("utf-8")
            except UnicodeDecodeError:
                text = ""
            events, mutation = analysiere_quelltext(text) if datei.suffix == ".mjs" else ("", "")
            aktion, ziel, flaeche, grund = MAPPING[paket].get(
                relativ, ("NICHT_ZUGEORDNET", "-", "none", "FAIL-LOUD: kein Mapping-Eintrag in UMSETZUNGSPLAN §5")
            )
            datensaetze.append({
                "paket": paket, "pfad": relativ, "sha256": digest, "bytes": len(roh),
                "basename": datei.name, "hook_events": events, "mutation": mutation,
                "surface": flaeche, "aktion": aktion, "notiz": grund, "zielpfad": ziel,
            })
            basenamen[datei.name].add(digest)
            hashes[digest].append(f"{paket}/{relativ}")

    dublettengruppen = {d: p for d, p in hashes.items() if len(p) > 1}
    gruppen_id = {d: f"D{i + 1}" for i, d in enumerate(sorted(dublettengruppen))}

    for eintrag in datensaetze:
        name = str(eintrag["basename"])
        eintrag["basename_kollision"] = "ja" if len(basenamen[name]) > 1 else "nein"
        eintrag["dublette_gruppe"] = gruppen_id.get(str(eintrag["sha256"]), "")

    spalten = ["paket", "pfad", "sha256", "bytes", "basename", "basename_kollision",
               "dublette_gruppe", "hook_events", "mutation", "surface", "aktion", "notiz"]
    ziel_tsv = REPO / "inventory" / "collision-inventory.tsv"
    ziel_tsv.parent.mkdir(parents=True, exist_ok=True)
    with ziel_tsv.open("w", encoding="utf-8") as handle:
        handle.write("\t".join(spalten) + "\n")
        for eintrag in datensaetze:
            handle.write("\t".join(str(eintrag[s]) for s in spalten) + "\n")

    uebernommen = [e for e in datensaetze if e["aktion"] in {"unveraendert", "angepasst", "evidence"}]
    manifest = REPO / "MERGE-MANIFEST.tsv"
    with manifest.open("w", encoding="utf-8") as handle:
        handle.write("quelle\tzielpfad\tsha256\tflaeche\tbegruendung\n")
        for e in uebernommen:
            handle.write(f"{e['paket']}/{e['pfad']}\t{e['zielpfad']}\t{e['sha256']}\t{e['surface']}\t{e['notiz']}\n")

    bilanz: dict[str, int] = defaultdict(int)
    for e in datensaetze:
        bilanz[str(e["aktion"])] += 1
    nicht_zugeordnet = [f"{e['paket']}/{e['pfad']}" for e in datensaetze if e["aktion"] == "NICHT_ZUGEORDNET"]

    print(f"Dateien gesamt: {len(datensaetze)}")
    for aktion in ("unveraendert", "angepasst", "evidence", "verworfen", "neu_erzeugt", "NICHT_ZUGEORDNET"):
        print(f"  {aktion:<18} {bilanz.get(aktion, 0)}")
    print(f"MERGE-MANIFEST-Zeilen: {len(uebernommen)}")
    print(f"Dublettengruppen: {len(dublettengruppen)}")
    print(f"Basename-Kollisionen: {sum(1 for n, h in basenamen.items() if len(h) > 1)} Namen")
    if nicht_zugeordnet:
        print("FAIL-LOUD nicht zugeordnet:")
        for eintrag in nicht_zugeordnet:
            print(f"  {eintrag}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
