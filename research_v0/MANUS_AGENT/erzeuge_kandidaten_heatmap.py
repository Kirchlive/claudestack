import csv
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np

input_path = Path('/home/ubuntu/stack_recherche/vergleichsscores.csv')
output_path = Path('/home/ubuntu/stack_recherche/assets/kandidaten_heatmap.png')

selected = [
    'CodeGraph',
    'Claude Context',
    'Squeez',
    'Claw Compactor',
    'MemSearch',
    'Claude-Mem',
    'Context Gateway',
    'Ruflo',
    'Open Connector',
]
labels = {
    'CodeGraph': 'CodeGraph',
    'Claude Context': 'Claude Context',
    'Squeez': 'Squeez',
    'Claw Compactor': 'Claw Compactor',
    'MemSearch': 'MemSearch',
    'Claude-Mem': 'Claude-Mem',
    'Context Gateway': 'Context Gateway',
    'Ruflo': 'Ruflo',
    'Open Connector': 'Open Connector',
}
criteria = [
    ('kontext', 'Kontext'),
    ('sicherheit', 'Sicherheit'),
    ('portabilitaet', 'Portabilität'),
    ('betrieb', 'Betrieb'),
    ('governance', 'Governance'),
    ('integration', 'Integration'),
]

rows = {}
with input_path.open(newline='', encoding='utf-8') as source:
    for row in csv.DictReader(source):
        rows[row['kandidat']] = row

data = np.array([[int(rows[key][criterion]) for criterion, _ in criteria] for key in selected])

plt.style.use('seaborn-v0_8-white')
fig, ax = plt.subplots(figsize=(11.5, 6.6), dpi=180)
image = ax.imshow(data, cmap='YlGnBu', vmin=1, vmax=5, aspect='auto')
ax.set_xticks(np.arange(len(criteria)), labels=[label for _, label in criteria], fontsize=10)
ax.set_yticks(np.arange(len(selected)), labels=[labels[key] for key in selected], fontsize=10)
ax.set_title('Pilotkandidaten: Eignung nach Entscheidungsdimension', loc='left', pad=16, fontweight='bold')
for row_index in range(data.shape[0]):
    for col_index in range(data.shape[1]):
        value = data[row_index, col_index]
        ax.text(col_index, row_index, value, ha='center', va='center', fontsize=10, fontweight='bold', color='white' if value >= 4 else '#1f2937')
colorbar = fig.colorbar(image, ax=ax, shrink=0.88, pad=0.02, ticks=[1, 2, 3, 4, 5])
colorbar.set_label('Qualitative Eignung (1 = gering, 5 = hoch)', rotation=90, labelpad=12)
ax.set_xlabel('Bewertungsdimension')
ax.set_ylabel('Repository / Architekturbaustein')
fig.text(0.125, 0.02, 'Die Werte sind die dokumentierte Architekturgewichtung, keine empirischen Leistungsbenchmarks.', fontsize=9, color='#374151')
fig.tight_layout(rect=(0, 0.05, 1, 1))
output_path.parent.mkdir(parents=True, exist_ok=True)
fig.savefig(output_path, bbox_inches='tight')
