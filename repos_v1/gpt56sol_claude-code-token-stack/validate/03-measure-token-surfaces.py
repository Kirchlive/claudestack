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
    names = subprocess.check_output(["git", "ls-files", "-z"], cwd=repo).decode("utf-8").split("\0")
    return [repo / name for name in names if name]


def selected(relative: str) -> bool:
    return (
        relative.startswith("GPT56SOL_ULTRA_Validation/")
        or relative.startswith("OPUS5_MAX_Validation/")
        or relative.startswith("K3SWARM_MAX_Validation/")
        or relative == "KIMI_AGENT/Claude-Code-Token-Stack-Konzept.md"
        or relative.startswith("Squeez-RTK-Ladder/")
        or relative.startswith("hooks/")
        or relative in {"CLAUDE.md", "settings.json"}
    )


def dataset(relative: str) -> str:
    if relative.startswith("GPT56SOL_ULTRA_Validation/"):
        return "GPT"
    if relative.startswith("OPUS5_MAX_Validation/"):
        return "OPUS"
    if relative.startswith("K3SWARM_MAX_Validation/"):
        return "K3"
    if relative == "KIMI_AGENT/Claude-Code-Token-Stack-Konzept.md":
        return "KIMI"
    if relative.startswith("Squeez-RTK-Ladder/"):
        return "SQUEEZ_RTK_REFERENCE"
    if relative.startswith("hooks/") or relative in {"CLAUDE.md", "settings.json"}:
        return "CURRENT_CLAUDE_FILES"
    raise AssertionError(relative)


def runtime_visibility(relative: str, text: str) -> str:
    if relative == "CLAUDE.md":
        return "always_loaded_instruction_candidate"
    if relative == "settings.json":
        return "configuration_not_verbatim_prompt"
    if relative.startswith("hooks/"):
        return "hook_code_with_conditional_context_injection" if "additionalContext" in text else "hook_code_not_verbatim_prompt"
    return "research_or_reference_not_runtime"


def main() -> int:
    if len(sys.argv) != 4:
        print("usage: 03-measure-token-surfaces.py REPO OUT_CSV OUT_JSON", file=sys.stderr)
        return 2

    repo = Path(sys.argv[1]).resolve()
    out_csv = Path(sys.argv[2]).resolve()
    out_json = Path(sys.argv[3]).resolve()
    encoder = tiktoken.get_encoding("o200k_base")
    records: list[dict[str, object]] = []

    for file in tracked_files(repo):
        relative = file.relative_to(repo).as_posix()
        if not selected(relative):
            continue
        raw = file.read_bytes()
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            continue
        token_count = len(encoder.encode(text))
        records.append(
            {
                "dataset_id": dataset(relative),
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
                "runtime_visibility": runtime_visibility(relative, text),
            }
        )

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
        "source_commit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=repo, text=True).strip(),
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
