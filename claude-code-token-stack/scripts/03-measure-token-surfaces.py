#!/usr/bin/env python3
"""Reproduce claudestack file metrics with an explicitly non-Claude tokenizer."""

from __future__ import annotations

import csv
import hashlib
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

import tiktoken


def tracked_files(repo: Path) -> list[Path]:
    """Dateien des Messziels. Git wird bevorzugt (respektiert .gitignore), ist aber
    keine Bedingung — das Messziel ist oft ein Konfigurationsverzeichnis ohne Repo."""
    try:
        names = subprocess.check_output(
            ["git", "ls-files", "-z"], cwd=repo, stderr=subprocess.DEVNULL
        ).decode("utf-8").split("\0")
        files = [repo / name for name in names if name]
        if files:
            return files
    except (subprocess.CalledProcessError, FileNotFoundError, NotADirectoryError):
        pass
    return [p for p in sorted(repo.rglob("*"))
            if p.is_file() and ".git/" not in p.as_posix() and "__pycache__" not in p.as_posix()]


# Kontextflaechen des Zielbaums. Die Vorgaengerfassung filterte auf die Verzeichnisnamen des
# Validierungskorpus (GPT56SOL_ULTRA_Validation/ und drei weitere); im Zielbaum traf kein Muster
# zu, das Skript lief auf null Records und brach mit IndexError ab, bevor es etwas schrieb (D10).
SURFACES: list[tuple[str, str, str]] = [
    # (Praefix oder exakter Pfad, Datensatzname, Laufzeitsichtbarkeit)
    ("CLAUDE.md", "PREFIX", "always_loaded_instruction_candidate"),
    ("settings.json", "CONFIG", "configuration_not_verbatim_prompt"),
    ("templates/", "TEMPLATES", "template_not_loaded_until_copied"),
    ("rules/", "RULES", "loaded_when_path_scoped_rule_matches"),
    ("hooks/", "HOOKS", "hook_code_not_verbatim_prompt"),
    ("config/", "CONFIG", "configuration_not_verbatim_prompt"),
    ("docs/", "DOCS", "research_or_reference_not_runtime"),
    ("evidence/", "EVIDENCE", "archive_never_read_at_runtime"),
]


def classify(relative: str, extra: list[str]) -> tuple[str, str] | None:
    """Gibt (Datensatz, Laufzeitsichtbarkeit) zurueck oder None, wenn die Datei
    keine Kontextflaeche beruehrt."""
    for pattern in extra:
        if relative == pattern or relative.startswith(pattern):
            return ("EXTRA", "explicitly_requested")
    for prefix, name, visibility in SURFACES:
        if relative == prefix or (prefix.endswith("/") and relative.startswith(prefix)):
            return (name, visibility)
    return None


def git_head(repo: Path) -> str | None:
    """Commit des Messziels, sofern es in einem Repo liegt. Ein Konfigurationsverzeichnis
    ist keines — das ist kein Fehler, sondern nur eine fehlende Herkunftsangabe."""
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=repo, text=True, stderr=subprocess.DEVNULL
        ).strip()
    except (subprocess.CalledProcessError, FileNotFoundError, NotADirectoryError):
        return None


def runtime_visibility(relative: str, text: str, default: str) -> str:
    """Hooks, die additionalContext injizieren, sind teurer als ihr Code vermuten laesst —
    sie schreiben zur Laufzeit in den Kontext."""
    if relative.startswith("hooks/") and "additionalContext" in text:
        return "hook_code_with_conditional_context_injection"
    return default


def main() -> int:
    argv = [a for a in sys.argv[1:] if not a.startswith("--include=")]
    extra = [a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--include=")]
    if len(argv) != 3:
        print(
            "usage: 03-measure-token-surfaces.py MESSZIEL OUT_CSV OUT_JSON [--include=PFAD]...\n"
            "\n"
            "  MESSZIEL   Verzeichnis, dessen Kontextflaechen gemessen werden — ein Paketbaum\n"
            "             oder ein Konfigurationsverzeichnis wie ~/.claude\n"
            "  --include  zusaetzlicher Pfad oder Praefix ausserhalb der bekannten Flaechen\n"
            "\n"
            f"Bekannte Flaechen: {', '.join(p for p, _, _ in SURFACES)}",
            file=sys.stderr,
        )
        return 2

    repo = Path(argv[0]).resolve()
    out_csv = Path(argv[1]).resolve()
    out_json = Path(argv[2]).resolve()
    if not repo.is_dir():
        print(f"FEHLER: Messziel {repo} ist kein Verzeichnis.", file=sys.stderr)
        return 1
    encoder = tiktoken.get_encoding("o200k_base")
    records: list[dict[str, object]] = []

    for file in tracked_files(repo):
        relative = file.relative_to(repo).as_posix()
        hit = classify(relative, extra)
        if hit is None:
            continue
        dataset_id, visibility = hit
        raw = file.read_bytes()
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            continue
        token_count = len(encoder.encode(text))
        records.append(
            {
                "dataset_id": dataset_id,
                "path": relative,
                "sha256": hashlib.sha256(raw).hexdigest(),
                "bytes": len(raw),
                "chars": len(text),
                "lines": len(text.splitlines()),
                "words": len(re.findall(r"\S+", text)),
                "o200k_base_tokens": token_count,
                "chars_per_o200k_token": round(len(text) / token_count, 4) if token_count else None,
                "chars_div_4_estimate": (len(text) + 3) // 4,
                "chars_div_3_estimate": (len(text) + 2) // 3,
                "runtime_visibility": runtime_visibility(relative, text, visibility),
            }
        )

    # Fail-loud (L-6): null Records heisst, dass der Filter nicht griff — nicht, dass das
    # Messziel leer ist. Die Vorgaengerfassung lief hier in einen IndexError, nachdem sie
    # nichts geschrieben hatte; der Grund war aus dem Traceback nicht ablesbar (D10).
    if not records:
        print(
            f"FEHLER: keine Kontextflaeche in {repo} gefunden — es wurde nichts gemessen.\n"
            f"Geprueft wurde auf: {', '.join(p for p, _, _ in SURFACES)}"
            + (f" sowie {', '.join(extra)}" if extra else "")
            + "\nEnthaelt das Messziel andere Pfade, ergaenze sie per --include=PFAD.",
            file=sys.stderr,
        )
        return 1

    by_hash: dict[str, list[str]] = defaultdict(list)
    for record in records:
        by_hash[str(record["sha256"])].append(str(record["path"]))
    duplicate_groups = {digest: paths for digest, paths in by_hash.items() if len(paths) > 1}
    for record in records:
        record["duplicate_group_size"] = len(duplicate_groups.get(str(record["sha256"]), [])) or 1

    totals: dict[str, dict[str, int]] = defaultdict(
        lambda: {"files": 0, "bytes": 0, "chars": 0, "lines": 0, "o200k_base_tokens": 0}
    )
    for record in records:
        total = totals[str(record["dataset_id"])]
        total["files"] += 1
        for field in ("bytes", "chars", "lines", "o200k_base_tokens"):
            total[field] += int(record[field])

    out_csv.parent.mkdir(parents=True, exist_ok=True)
    with out_csv.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(records[0]))
        writer.writeheader()
        writer.writerows(records)

    payload = {
        "schema": "claudestack.file-token-metrics/v1",
        "source_commit": git_head(repo),
        "tokenizer": {
            "name": "tiktoken/o200k_base",
            "status": "comparison_proxy_not_claude_exact",
            "claude_exact_count_available": False,
            "reason": "ANTHROPIC_API_KEY was not configured for the count_tokens endpoint",
        },
        "records": records,
        "totals_by_dataset": dict(totals),
        "duplicate_groups": duplicate_groups,
    }
    out_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"records": len(records), "totals_by_dataset": totals}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
