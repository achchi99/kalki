#!/usr/bin/env python3
"""kalki.uz — USDA FoodData Central (SR Legacy) dan FAQAT kerakli masalliqlarni data/manba/usda-sr-legacy.json ga ko'chiradi.
Manba: rasmiy CSV arxiv (https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip) — API emas (DEMO_KEY limiti: soatiga 30 so'rov).
Ishlatish:  python3 tools/baza-manba-yukla.py <zip yo'li>      (zip yo'q bo'lsa avval yuklab oling: curl -O <URL>)
Ro'yxat: data/baza-masalliq.json dagi har masalliqning `usda` (va `pishgan`) fdc_id lari. Natijada har id uchun: tavsif, kkal/oqsil/yog'/uglevod/suv (100 g), uy o'lchovlari (food_portion), yuklash sanasi.
tools/baza-hisob.js faqat shu fayldan (va data/manba/skurikhin.json dan) hisoblaydi — qo'lda raqam yozilmaydi."""
import csv, hashlib, io, json, os, sys, zipfile, datetime
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
zp = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
mas = json.load(open(os.path.join(ROOT, 'data', 'baza-masalliq.json'), encoding='utf8'))
ids = set()
for v in mas['masalliq'].values():
    for k in ('usda', 'pishgan'):
        if v.get(k): ids.add(str(v[k]))
od = json.load(open(os.path.join(ROOT, 'data', 'baza-oddiy.json'), encoding='utf8'))
for v in od['oddiy'].values():
    if v.get('usda'): ids.add(str(v['usda']))
z = zipfile.ZipFile(zp); base = 'FoodData_Central_sr_legacy_food_csv_2018-04/'
rd = lambda n: csv.DictReader(io.TextIOWrapper(z.open(base + n), encoding='utf-8'))
want = {'1008': 'kcal', '1003': 'p', '1004': 'f', '1005': 'c', '1051': 'suv'}
foods = {r['fdc_id']: r['description'] for r in rd('food.csv') if r['fdc_id'] in ids}
out = {i: {'d': foods[i]} for i in sorted(ids)}
miss = ids - set(foods)
if miss: sys.exit('Topilmadi: %s' % sorted(miss))
for r in rd('food_nutrient.csv'):
    k = want.get(r['nutrient_id'])
    if k and r['fdc_id'] in out: out[r['fdc_id']][k] = float(r['amount'])
meas = {r['id']: r['name'] for r in rd('measure_unit.csv')}
for r in rd('food_portion.csv'):
    if r['fdc_id'] in out:
        out[r['fdc_id']].setdefault('o', []).append({'nom': (r['modifier'] or meas.get(r['measure_unit_id'], '')).strip(), 'miqdor': float(r['amount'] or 1), 'g': float(r['gram_weight'])})
sha = hashlib.sha256(open(zp, 'rb').read()).hexdigest()
meta = {'manba': 'USDA FoodData Central, SR Legacy (2018-04), CSV arxiv', 'url': 'https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip', 'sha256': sha, 'yuklangan': datetime.date.today().isoformat(), 'eslatma': 'Faqat data/baza-masalliq.json da ishlatilgan id lar; qiymatlar 100 g uchun'}
json.dump({'meta': meta, 'foods': out}, open(os.path.join(ROOT, 'data', 'manba', 'usda-sr-legacy.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(len(out), 'ta id yozildi')
