#!/usr/bin/env python3
"""kalki.uz — bazani kengaytirish uchun USDA SR Legacy qiymatlarini data/manba/usda-sr-legacy.json ga QO'SHADI (mavjudlariga tegmaydi).
Manba: rasmiy CSV arxiv (https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip), sha256 meta bilan tekshiriladi.
Qaysi id lar: tools/ovqatlar-kengaytma*.js va tools/ovqatlar-turk.js dagi barcha `u:<fdc_id>` (aralashmalar ichidagilari ham) — faylda yo'qlari.
Ishlatish:  python3 tools/usda-qoshimcha.py <zip yo'li> [teg]      (teg — meta.qoshimcha kaliti, standart: bugungi sana)
Har id: tavsif, kkal/oqsil/yog'/uglevod/suv (100 g), uy o'lchovlari — tools/baza-manba-yukla.py bilan bir xil shakl."""
import csv, datetime, glob, hashlib, io, json, os, re, sys, zipfile
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
zp = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
teg = sys.argv[2] if len(sys.argv) > 2 else datetime.date.today().isoformat()
P = os.path.join(ROOT, 'data', 'manba', 'usda-sr-legacy.json')
db = json.load(open(P, encoding='utf8'))
sha = hashlib.sha256(open(zp, 'rb').read()).hexdigest()
if sha != db['meta']['sha256']: sys.exit('XATO: arxiv sha256 mos emas (%s) — boshqa nashr' % sha)
ids = set()
for f in glob.glob(os.path.join(ROOT, 'tools', 'ovqatlar-kengaytma*.js')) + [os.path.join(ROOT, 'tools', 'ovqatlar-turk.js')]:
    ids |= set(re.findall(r'\bu:(\d{5,7})\b', open(f, encoding='utf8').read()))
new = sorted(i for i in ids if i not in db['foods'])
if not new: print('yangi id yo\'q'); sys.exit(0)
z = zipfile.ZipFile(zp); base = 'FoodData_Central_sr_legacy_food_csv_2018-04/'
rd = lambda n: csv.DictReader(io.TextIOWrapper(z.open(base + n), encoding='utf-8'))
want = {'1008': 'kcal', '1003': 'p', '1004': 'f', '1005': 'c', '1051': 'suv'}
foods = {r['fdc_id']: r['description'] for r in rd('food.csv') if r['fdc_id'] in new}
miss = set(new) - set(foods)
if miss: sys.exit('Topilmadi (SR Legacy da yo\'q): %s' % sorted(miss))
out = {i: {'d': foods[i]} for i in new}
for r in rd('food_nutrient.csv'):
    k = want.get(r['nutrient_id'])
    if k and r['fdc_id'] in out: out[r['fdc_id']][k] = float(r['amount'])
meas = {r['id']: r['name'] for r in rd('measure_unit.csv')}
for r in rd('food_portion.csv'):
    if r['fdc_id'] in out:
        out[r['fdc_id']].setdefault('o', []).append({'nom': (r['modifier'] or meas.get(r['measure_unit_id'], '')).strip(), 'miqdor': float(r['amount'] or 1), 'g': float(r['gram_weight'])})
for i, v in out.items():
    for k in ('kcal', 'p', 'f', 'c'):
        if k not in v: sys.exit('XATO: %s da %s yo\'q' % (i, k))
db['foods'].update(out)
db['meta'].setdefault('qoshimcha', {}).setdefault(teg, [])
db['meta']['qoshimcha'][teg] = sorted(set(db['meta']['qoshimcha'][teg]) | set(new))
json.dump(db, open(P, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(len(new), 'ta yangi id qo\'shildi:', ' '.join(new))
