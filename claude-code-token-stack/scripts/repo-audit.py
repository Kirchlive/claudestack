#!/usr/bin/env python3
"""repo-audit.py — Lieferfähigkeit, Wartungslast und Rechtslage je Repository messen.

Reproduziert die Bloecke A, B und C der 1-bis-100-Bewertung aus UPDATE-PHASE3.md.
D (geprüfte Korrektheit) und E (Hebel) stehen in judgments.json; sie werden eingelesen,
nicht gemessen. Ohne ausdrueckliche Pruefung ist D = 0.

    python3 repo-audit.py --repos repos.txt --judgments judgments.json --out audit.json
    python3 repo-audit.py --repo owner/name

Gemessen wird ausschliesslich per HTTP gegen github.com:
    /<repo>                     Sterne, offene Issues, offene PRs, Lizenz
    /<repo>/commits/HEAD.atom   letzter Commit, Median-Abstand im Feed
    /<repo>/releases.atom       letztes Release

Keine API-Keys, kein Rate-Limit-Problem bei moderater Nebenlaeufigkeit.
Bewusst KEINE Uebernahme von README-Angaben: Sterne und Daten werden gescraped.
"""
import argparse, concurrent.futures as cf, datetime, gzip, json, re, sys, time, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (compatible; repo-audit)", "Accept-Encoding": "gzip"}
TODAY = datetime.date.today()

PERMISSIVE = ("mit", "apache", "bsd", "isc", "mpl", "unlicense", "zlib")
COPYLEFT = ("gpl", "agpl", "lgpl")
FENCE = ("elastic", "polyform", "busl", "sspl", "commons clause")


def get(url, tries=3):
    for a in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                raw = r.read()
                if r.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
                return raw.decode("utf-8", "ignore")
        except Exception as e:
            if getattr(e, "code", None) in (404, 410, 451):
                return None
            time.sleep(2 + a * 3)
    return None



LICENSE_PATTERNS = [
    r"octicon-law.*?</svg></span>\s*<span[^>]*>([^<]{2,45})</span>",
    r"octicon-law[^>]*></svg>\s*([^<]{2,45})<",
]
LICENSE_KEYWORDS = [
    ("Elastic License 2.0", ("elastic license",)),
    ("PolyForm Noncommercial", ("polyform noncommercial",)),
    ("PolyForm", ("polyform",)),
    ("Business Source License", ("business source license",)),
    ("SSPL", ("server side public license",)),
    ("AGPL-3.0", ("gnu affero",)),
    ("GPL-3.0", ("gnu general public license", "version 3")),
    ("LGPL", ("gnu lesser general public",)),
    ("Apache-2.0", ("apache license", "version 2.0")),
    ("MPL-2.0", ("mozilla public license",)),
    ("BSD-3-Clause", ("redistributions in binary form", "neither the name")),
    ("BSD-2-Clause", ("redistributions in binary form",)),
    ("ISC", ("permission to use, copy, modify, and/or distribute",)),
    ("Unlicense", ("this is free and unencumbered software",)),
    ("MIT", ("permission is hereby granted, free of charge",)),
]


def detect_license(repo, home_html):
    """Lizenz bestimmen. Die Repo-Startseite zeigt bei Nicht-SPDX-Lizenzen nur das
    Wort "License"; in dem Fall wird die LICENSE-Datei selbst gelesen. Ohne diesen
    Fallback laufen genau die Faelle ins Leere, auf die es ankommt: Elastic 2.0 und
    PolyForm Noncommercial werden dann als "unklar" statt als Fence gewertet."""
    label = None
    for pat in LICENSE_PATTERNS:
        m = re.findall(pat, home_html, re.S)
        if m:
            label = m[0].strip()
            break
    if label and label.lower() not in ("license", "licence", ""):
        return label
    for path in ("LICENSE", "LICENSE.md", "LICENSE.txt", "LICENCE", "COPYING"):
        txt = get(f"https://raw.githubusercontent.com/{repo}/HEAD/{path}", tries=1)
        if not txt:
            continue
        low = txt[:4000].lower()
        for name, needles in LICENSE_KEYWORDS:
            if all(n in low for n in needles):
                return name
        # Manche Repos legen an LICENSE nur einen Verweis ab (Monorepos).
        if len(txt.strip()) < 200 and "/" in txt:
            target = txt.strip().lstrip("./")
            nested = get(f"https://raw.githubusercontent.com/{repo}/HEAD/{target}", tries=1)
            if nested:
                low = nested[:4000].lower()
                for name, needles in LICENSE_KEYWORDS:
                    if all(n in low for n in needles):
                        return name
        return "unbekannt (LICENSE vorhanden, nicht erkannt)"
    return None

def measure(repo):
    d = {"repo": repo, "measured_at": TODAY.isoformat()}
    h = get(f"https://github.com/{repo}")
    if h is None:
        d["exists"] = False
        return d
    d["exists"] = True
    m = re.search(r'"stargazerCount":(\d+)', h)
    d["stars"] = int(m.group(1)) if m else None
    m = re.search(r'id="issues-repo-tab-count"[^>]*title="([\d,]+)"', h)
    d["open_issues"] = int(m.group(1).replace(",", "")) if m else None
    m = re.search(r'id="pull-requests-repo-tab-count"[^>]*title="([\d,]+)"', h)
    d["open_prs"] = int(m.group(1).replace(",", "")) if m else None
    d["license"] = detect_license(repo, h)
    d["archived"] = "Public archive" in h or "This repository has been archived" in h

    x = get(f"https://github.com/{repo}/commits/HEAD.atom")
    if x:
        ds = sorted(set(re.findall(r"<updated>(\d{4}-\d\d-\d\d)T", x)), reverse=True)
        d["last_commit"] = ds[0] if ds else None
        if len(ds) >= 2:
            dt = [datetime.date.fromisoformat(s) for s in ds]
            gaps = sorted((dt[i] - dt[i + 1]).days for i in range(len(dt) - 1))
            d["median_gap_days"] = gaps[len(gaps) // 2]

    r = get(f"https://github.com/{repo}/releases.atom")
    if r:
        rd = sorted(set(re.findall(r"<updated>(\d{4}-\d\d-\d\d)T", r)), reverse=True)
        d["last_release"] = rd[0] if rd else None
    return d


def score(d, judgments=None):
    """A (30) + B (20) + C (15) gemessen, D Korrektheit (20) + E Hebel (15) aus judgments.json."""
    out = {}
    lc = d.get("last_commit")
    days = (TODAY - datetime.date.fromisoformat(lc)).days if lc else 999
    out["days_since_commit"] = days
    A = 30 if days <= 7 else 26 if days <= 14 else 22 if days <= 30 else 15 if days <= 60 else 8 if days <= 120 else 2
    rel = d.get("last_release")
    if rel and (TODAY - datetime.date.fromisoformat(rel)).days > 90:
        A = max(0, A - 4)
    if d.get("archived"):
        A = 0
    out["A_lieferfaehigkeit"] = A

    s, oi, op = d.get("stars") or 0, d.get("open_issues"), d.get("open_prs")
    if oi is None:
        B, load = 10, None
    else:
        load = oi / max(s, 1) * 1000
        B = 20 if load < 1 else 17 if load < 3 else 14 if load < 6 else 10 if load < 12 else 6 if load < 25 else 2
        if oi and op and oi >= 20 and op > oi:
            B = max(0, B - 3)
    out["issues_per_1k_stars"] = round(load, 2) if load is not None else None
    out["B_wartungslast"] = B

    L = (d.get("license") or "").lower()
    if not L:
        C = 3
    elif any(x in L for x in FENCE):
        C = 0
    elif any(x in L for x in COPYLEFT):
        C = 7
    elif any(x in L for x in PERMISSIVE):
        C = 15
    else:
        C = 8
    out["C_recht"] = C

    # Achse D war bis Schema 4.1 ein KONVERGENZTERM: Punkte fuer die Anzahl der
    # Datensaetze, die ein Repo empfehlen. Das ist ein Zirkelschluss - es misst die
    # Popularitaet im eigenen Korpus und verbucht sie als Evidenz. Alle drei
    # Bewertungsmodelle haben dem zugestimmt. Ersetzt durch:
    #
    #   D = geprüfte KORREKTHEIT (0-20). Tut das Werkzeug, was es behauptet?
    #       Quelle ist eine ausdrueckliche Pruefung je Repo in judgments.json.
    #       Ohne Pruefung: 0 Punkte. Ein ungeprueftes Werkzeug verdient keine
    #       Korrektheitspunkte, nur weil viele es nennen.
    #
    # Belegfall fuer die Notwendigkeit: claude-code-cache-fix hat die schlechteste
    # Fehlerbilanz des Feldes (87 offene Issues je 1.000 Sterne) und kam unter der
    # alten Formel trotzdem auf 75, weil A und C unberuehrt blieben.
    ev = (judgments or {}).get(d["repo"], {})
    tier = ev.get("evidence_tier", 1)
    out["D_korrektheit"] = int(ev.get("correctness_0_20", 0))
    out["D_quelle"] = ev.get("correctness_source", "ungeprueft")
    out["E_hebel"] = {3: 15, 2: 11, 1: 7}.get(tier, 7)
    out["score"] = out["A_lieferfaehigkeit"] + out["B_wartungslast"] + out["C_recht"] + out["D_korrektheit"] + out["E_hebel"]

    flags = []
    if not d.get("exists"):
        flags.append("NICHT-ERREICHBAR")
    if d.get("archived"):
        flags.append("ARCHIVIERT")
    if days > 60:
        flags.append(f"STALE>{60 if days <= 180 else 180}d")
    if C == 0:
        flags.append("LIZENZ-FENCE")
    if C == 3:
        flags.append("LIZENZ-UNKLAR")
    if s and s < 5:
        flags.append("MINI<5*")
    if rel and lc and rel > lc:
        flags.append("RELEASE-NACH-COMMIT")
    if oi and op and op > oi and oi >= 20:
        flags.append("PR-RUECKSTAU")
    out["flags"] = flags
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", action="append", default=[])
    ap.add_argument("--repos", help="Datei mit einem owner/name je Zeile")
    ap.add_argument("--judgments", help="judgments.json mit geprüfter Korrektheit und Evidenztier je Repo")
    ap.add_argument("--out", default="audit.json")
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--issues", action="store_true",
                    help="Offene Issues je Repo mit erheben (Titel, Labels, Daten). "
                         "Nutzt scrape_issues.fetch_issues — eine Implementierung, zwei Aufrufwege.")
    a = ap.parse_args()

    repos = list(a.repo)
    if a.repos:
        repos += [l.strip() for l in open(a.repos, encoding="utf-8") if l.strip() and not l.startswith("#")]
    repos = sorted(set(repos))
    if not repos:
        ap.error("keine Repositories angegeben")

    judgments = json.load(open(a.judgments, encoding="utf-8")) if a.judgments else {}

    rows = []
    with cf.ThreadPoolExecutor(max_workers=a.workers) as ex:
        for d in ex.map(measure, repos):
            d.update(score(d, judgments))
            rows.append(d)

    # Issue-Detailerhebung (C.2.2: die drei Scrape-Varianten sind hier eingearbeitet).
    # Getrennt vom Scoring, weil sie langsamer ist und nicht in die Bewertung einfliesst —
    # sie liefert die Belege, mit denen ein Urteil begruendet wird.
    if a.issues:
        try:
            from scrape_issues import fetch_issues
        except ImportError as error:
            print(f"FEHLER: --issues braucht scrape_issues.py neben repo-audit.py ({error})", file=sys.stderr)
            return 1
        fehlgeschlagen = []
        with cf.ThreadPoolExecutor(max_workers=min(a.workers, 3)) as ex:
            for row, detail in zip(rows, ex.map(fetch_issues, [r["repo"] for r in rows])):
                row["issue_details"] = detail
                if detail.get("error"):
                    fehlgeschlagen.append(f"{detail['repo']}: {detail['error']}")
        # L-6: nicht erhoben ist nicht dasselbe wie "keine Issues".
        if fehlgeschlagen:
            print(f"\nISSUE-ERHEBUNG UNVOLLSTAENDIG ({len(fehlgeschlagen)} von {len(rows)}):", file=sys.stderr)
            for zeile in fehlgeschlagen:
                print(f"  {zeile}", file=sys.stderr)

    rows.sort(key=lambda r: -r["score"])
    json.dump({"generated": TODAY.isoformat(), "count": len(rows),
               "method": "HTTP-Scrape github.com; A/B/C gemessen, D Korrektheit aus ausdruecklicher Pruefung, E kodiert",
               "repositories": rows}, open(a.out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print(f"{'repo':<40}{'A':>4}{'B':>4}{'C':>4}{'D':>4}{'E':>4}{'SUM':>5}  flags")
    for r in rows:
        print(f"{r['repo']:<40}{r['A_lieferfaehigkeit']:>4}{r['B_wartungslast']:>4}{r['C_recht']:>4}"
              f"{r['D_korrektheit']:>4}{r['E_hebel']:>4}{r['score']:>5}  {','.join(r['flags'])}")
    print(f"\ngeschrieben: {a.out}")


if __name__ == "__main__":
    sys.exit(main())
