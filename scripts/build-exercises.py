"""Builds src/data/exercises.json from the public-domain Free Exercise DB.

Source: https://github.com/yuhonas/free-exercise-db (Unlicense / public domain)
Usage:  python3 scripts/build-exercises.py path/to/exercises.json
"""
import json
import sys

src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else 'src/data/exercises.json'
data = json.load(open(src, encoding='utf-8'))

EQUIP = {
    'body only': 'bodyweight', None: 'other', 'e-z curl bar': 'ez bar',
    'kettlebells': 'kettlebell', 'bands': 'band',
}
DURATION_IDS = {'Plank', 'Push_Up_to_Side_Plank'}


def tracking(x):
    if x['category'] in ('stretching', 'cardio') or x['id'] in DURATION_IDS:
        return 'duration'
    if x.get('equipment') in ('body only', None) and x['category'] in ('strength', 'plyometrics'):
        return 'reps'
    return 'weight'


rows = []
for x in sorted(data, key=lambda e: e['name'].lower()):
    rows.append({
        'id': x['id'],
        'n': x['name'],
        'c': x['category'],
        'e': EQUIP.get(x.get('equipment'), x.get('equipment')),
        'l': x['level'],
        'm': x.get('mechanic'),
        'p': x['primaryMuscles'],
        's': x['secondaryMuscles'],
        'i': x['instructions'],
        'img': x['images'][:2],
        't': tracking(x),
    })

json.dump(rows, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(f'wrote {len(rows)} exercises to {out}')
