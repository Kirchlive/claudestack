import csv
from pathlib import Path

input_path = Path('/home/ubuntu/stack_recherche/vergleichsscores.csv')
output_path = Path('/home/ubuntu/stack_recherche/vergleichsscores_berechnet.csv')
weights = {
    'kontext': 25,
    'sicherheit': 25,
    'portabilitaet': 15,
    'betrieb': 15,
    'governance': 10,
    'integration': 10,
}

with input_path.open(newline='', encoding='utf-8') as source:
    rows = list(csv.DictReader(source))

for row in rows:
    total = sum(int(row[criterion]) * weight / 5 for criterion, weight in weights.items())
    row['gewichteter_wert'] = f'{total:.0f}'

with output_path.open('w', newline='', encoding='utf-8') as target:
    writer = csv.DictWriter(target, fieldnames=[*rows[0].keys()])
    writer.writeheader()
    writer.writerows(rows)

for row in rows:
    print(f"{row['kandidat']}: {row['gewichteter_wert']}")
