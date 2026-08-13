#!/usr/bin/env python3
"""scrape_issues.py — offene Issues eines GitHub-Repos ohne API-Key erheben.

Zusammenfuehrung dreier Varianten des Vorgaengerpakets (C.2.2). Die Varianten waren
keine Alternativen, sondern eine Fehlerkorrektur-Kette; uebernommen ist jeweils der
Endstand:

    v1  griff blind auf preloadedQueries[0] zu — bei mehreren eingebetteten Queries
        traf das die falsche und lieferte fremde Issues.
    v2  waehlt die Query ueber owner/name aus den variables aus (v2-Matching).
    v3  umgeht den Antwort-Cache: Zufallsparameter, Cache-Control-Header und sechs
        statt drei Versuchen (v3-Huelle). Ohne das liefert GitHub wiederholt
        dieselbe leere Seite.

Aufruf:
    python3 scrape_issues.py owner/name [owner/name ...]
    python3 scrape_issues.py --json owner/name        # maschinenlesbar

Als Modul: `from scrape_issues import fetch_issues` — dieselbe Implementierung
nutzt repo-audit.py fuer seinen --issues-Modus, damit es nur eine gibt.
"""
from __future__ import annotations

import html
import json
import random
import re
import subprocess
import sys
import time

EMBEDDED = re.compile(
    r'<script type="application/json"[^>]*data-target="react-app\.embeddedData">(.*?)</script>',
    re.S,
)
TAGS = re.compile(r"<[^>]+>")


def _payload(repo: str, attempts: int = 6, pause: float = 2.0) -> dict | None:
    """Eingebettetes JSON der Issue-Seite holen. v3-Huelle: Cache-Busting und Wiederholung."""
    owner, _, name = repo.partition("/")
    if not owner or not name:
        raise ValueError(f"Repo muss owner/name lauten, nicht {repo!r}")
    for attempt in range(attempts):
        url = (
            f"https://github.com/{repo}/issues"
            f"?q=is%3Aissue%20is%3Aopen%20sort%3Acreated-desc&cb={random.randint(1000, 999999)}"
        )
        try:
            done = subprocess.run(
                ["curl", "-sL", "-H", "Cache-Control: no-cache", url],
                capture_output=True, timeout=60,
            )
        except subprocess.TimeoutExpired:
            time.sleep(pause)
            continue
        match = EMBEDDED.search(done.stdout.decode("utf-8", "ignore"))
        if not match:
            time.sleep(pause)
            continue
        try:
            return json.loads(html.unescape(match.group(1)))
        except json.JSONDecodeError:
            time.sleep(pause)
    return None


def fetch_issues(repo: str, attempts: int = 6) -> dict:
    """Offene Issues eines Repos.

    Rueckgabe: {"repo", "issue_count", "issues": [...], "error": None|str}
    Fail-loud: ein Fehlschlag wird als `error` zurueckgegeben, nie als leere Liste —
    sonst ist "keine Issues" nicht von "nicht erreicht" zu unterscheiden.
    """
    owner, _, name = repo.partition("/")
    result: dict = {"repo": repo, "issue_count": None, "issues": [], "error": None}

    data = _payload(repo, attempts=attempts)
    if data is None:
        result["error"] = "keine eingebetteten Daten nach allen Versuchen"
        return result

    # v2-Matching: die Query gehoert zu genau diesem Repo, nicht die erste beliebige.
    queries = data.get("payload", {}).get("preloadedQueries", [])
    chosen = None
    for candidate in queries:
        variables = candidate.get("variables", {})
        if variables.get("owner") == owner and variables.get("name") == name:
            chosen = candidate
            break
    if chosen is None:
        gefunden = [(c.get("variables", {}).get("owner"), c.get("variables", {}).get("name")) for c in queries]
        result["error"] = f"keine passende Query; eingebettet waren: {gefunden}"
        return result

    try:
        search = chosen["result"]["data"]["repository"]["search"]
    except (KeyError, TypeError) as error:
        result["error"] = f"unerwartete Struktur: {error}"
        return result

    result["issue_count"] = search.get("issueCount")
    for edge in search.get("edges", []):
        node = edge.get("node", {})
        if node.get("__typename") != "Issue":
            continue
        result["issues"].append({
            "number": node.get("number"),
            "title": TAGS.sub("", node.get("titleHtml", "")),
            "created": (node.get("createdAt") or "")[:10],
            "updated": (node.get("updatedAt") or "")[:10],
            "labels": [l["node"].get("name") for l in node.get("labels", {}).get("edges", [])],
            "author": (node.get("author") or {}).get("login"),
        })
    return result


def main(argv: list[str]) -> int:
    as_json = "--json" in argv
    repos = [a for a in argv if not a.startswith("--")]
    if not repos:
        print(__doc__.split("Aufruf:")[1].strip(), file=sys.stderr)
        return 2

    results = [fetch_issues(repo) for repo in repos]
    if as_json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        for entry in results:
            print(f"===== {entry['repo']} =====")
            if entry["error"]:
                print(f"FEHLER: {entry['error']}")
                continue
            print("issueCount:", entry["issue_count"])
            for issue in entry["issues"]:
                print(
                    f"#{issue['number']} | {issue['title']} | created {issue['created']} "
                    f"| updated {issue['updated']} | labels {issue['labels']} | author {issue['author']}"
                )
    # Exit 1, sobald ein Repo nicht erhoben werden konnte — ein Teilergebnis darf nicht
    # als vollstaendig durchgehen (L-6).
    return 1 if any(entry["error"] for entry in results) else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
