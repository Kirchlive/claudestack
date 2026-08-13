from __future__ import annotations

import csv
import re
from pathlib import Path
from urllib.parse import urlparse

source = Path('/home/ubuntu/upload/pasted_content.txt')
out_dir = Path('/home/ubuntu/stack_recherche')
out_dir.mkdir(parents=True, exist_ok=True)
text = source.read_text(encoding='utf-8')

pattern = re.compile(r'https?://github\.com/([^/\s\]#?]+)/([^/\s\]?#]+)', re.I)
repos: list[tuple[str, str, str]] = []
seen: set[str] = set()
for owner, repo in pattern.findall(text):
    repo = repo.rstrip(').,')
    key = f'{owner}/{repo}'.lower()
    if key not in seen:
        seen.add(key)
        repos.append((owner, repo, f'https://github.com/{owner}/{repo}'))

def category(owner: str, repo: str) -> str:
    s = f'{owner}/{repo}'.lower()
    if any(x in s for x in ['compress', 'squeez', 'lingua', 'context', 'token', 'trim', 'compactor', 'headroom', 'cache']):
        return 'Kontext- und Token-Optimierung'
    if any(x in s for x in ['memory', 'recall', 'memsearch', 'historian', 'second-brain', 'obsidian']):
        return 'Persistentes Gedächtnis und Wissensbasis'
    if any(x in s for x in ['graph', 'codegraph', 'ingest', 'repomix', 'files-to-prompt', 'code2prompt', 'yek']):
        return 'Codebasis-Indexierung und Kontextaufbereitung'
    if any(x in s for x in ['usage', 'cost', 'monitor', 'pulse', 'otel', 'log', 'analytics', 'agentlytics', 'sniffly', 'meter']):
        return 'Beobachtbarkeit und Kostensteuerung'
    if any(x in s for x in ['skill', 'prompt', 'spec', 'planning', 'autopilot', 'harness', 'subagent', 'ruflo', 'orchestra']):
        return 'Arbeitsablauf, Skills und Orchestrierung'
    if any(x in s for x in ['ui', 'viewer', 'bar', 'manager', 'config', 'switch', 'replay', 'sessions', 'mirror']):
        return 'Bedienoberfläche und Sitzungsverwaltung'
    if any(x in s for x in ['mcp', 'connector', 'gateway', 'bridge', 'webhook', 'voicemode']):
        return 'Integration und Werkzeugzugriff'
    return 'Weitere Bewertung erforderlich'

with (out_dir / 'repo_inventar.csv').open('w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['nummer', 'repository', 'url', 'funktionsfeld'])
    writer.writeheader()
    for i, (owner, repo, url) in enumerate(repos, 1):
        writer.writerow({'nummer': i, 'repository': f'{owner}/{repo}', 'url': url, 'funktionsfeld': category(owner, repo)})

by_category: dict[str, list[str]] = {}
for owner, repo, _ in repos:
    by_category.setdefault(category(owner, repo), []).append(f'{owner}/{repo}')

lines = ['# Normalisiertes Repository-Inventar', '', f'**Eindeutige Repository-Verweise:** {len(repos)}.', '', '## Verteilung nach Funktionsfeld', '', '| Funktionsfeld | Anzahl |', '|---|---:|']
for cat, values in sorted(by_category.items(), key=lambda item: (-len(item[1]), item[0])):
    lines.append(f'| {cat} | {len(values)} |')
lines.append('')
for cat, values in sorted(by_category.items(), key=lambda item: (-len(item[1]), item[0])):
    lines.extend([f'## {cat}', ''])
    lines.extend([f'- `{value}`' for value in values])
    lines.append('')
(out_dir / 'repo_inventar.md').write_text('\n'.join(lines), encoding='utf-8')
print(f'{len(repos)} eindeutige Repositories in {out_dir} erfasst.')
