import csv
from pathlib import Path
import matplotlib.pyplot as plt

input_path = Path('/home/ubuntu/stack_recherche/vergleichsscores_berechnet.csv')
output_path = Path('/home/ubuntu/stack_recherche/assets/gewichtete_repo_bewertung.png')

selected = [
    'AGENTS.md+CLAUDE.md',
    'Agent Skills',
    'Datei- und Textsuche',
    'MCP Katalog/Policy',
    'Native Kompaktierung',
    'Repomix',
    'planning-with-files',
    'Sandbox Code Mode',
    'CCUsage',
    'Spec Kit',
    'TOON',
    'CodeGraph',
    'Squeez',
    'MemSearch',
]

labels = {
    'AGENTS.md+CLAUDE.md': 'AGENTS.md + CLAUDE.md',
    'Agent Skills': 'Agent Skills',
    'Datei- und Textsuche': 'Datei- / Textsuche',
    'MCP Katalog/Policy': 'MCP-Katalog + Policy',
    'Native Kompaktierung': 'Native Kompaktierung',
    'Repomix': 'Repomix',
    'planning-with-files': 'planning-with-files',
    'Sandbox Code Mode': 'Sandbox Code Mode',
    'CCUsage': 'CCUsage',
    'Spec Kit': 'Spec Kit',
    'TOON': 'TOON',
    'CodeGraph': 'CodeGraph',
    'Squeez': 'Squeez',
    'MemSearch': 'MemSearch',
}

values = {}
with input_path.open(newline='', encoding='utf-8') as source:
    for row in csv.DictReader(source):
        values[row['kandidat']] = int(row['gewichteter_wert'])

ordered = [(labels[key], values[key]) for key in selected]
ordered.sort(key=lambda item: item[1])

plt.style.use('seaborn-v0_8-whitegrid')
fig, ax = plt.subplots(figsize=(11, 7.5), dpi=180)
colors = ['#0f766e' if score >= 90 else '#2563eb' if score >= 80 else '#d97706' for _, score in ordered]
bars = ax.barh([label for label, _ in ordered], [score for _, score in ordered], color=colors)
ax.set_xlim(0, 100)
ax.set_xlabel('Gewichteter Architekturwert (0–100)')
ax.set_title('Priorisierte Architekturbausteine: gewichtete Eignung', loc='left', fontweight='bold')
fig.text(0.125, 0.03, 'Bewertung für ein kleines bis mittleres Team: Sicherheit und Kontextqualität vor maximaler Autonomie.', fontsize=9, color='#374151')
ax.axvline(80, color='#94a3b8', linewidth=1, linestyle='--')
ax.text(80.5, len(ordered) - 0.3, 'Kern- / früher Pilot', fontsize=8.5, color='#475569')
for bar, (_, score) in zip(bars, ordered):
    ax.text(score + 1, bar.get_y() + bar.get_height() / 2, str(score), va='center', fontsize=9, fontweight='bold')
for spine in ['top', 'right', 'left']:
    ax.spines[spine].set_visible(False)
ax.tick_params(axis='y', length=0)
fig.tight_layout(rect=(0, 0.06, 1, 1))
output_path.parent.mkdir(parents=True, exist_ok=True)
fig.savefig(output_path, bbox_inches='tight')
