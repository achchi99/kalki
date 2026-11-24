#!/usr/bin/env python3
"""kalki.uz — KalkiFit kletchatka (v102): data/manba/usda-sr-legacy.json dagi HAR BIR USDA yozuviga «fib» (Fiber, total dietary, nutrient 1079, g/100 g) qo'shadi.
Manba: rasmiy SR Legacy CSV arxivi (sha256 meta bilan tekshiriladi). USDA da qiymat yo'q bo'lsa — «fib» qo'yilmaydi (noma'lum, 0 emas).
Ishlatish:  python3 tools/usda-kletchatka.py <FoodData_Central_sr_legacy_food_csv_2018-04.zip>"""
import csv, hashlib, io, json, os, sys, zipfile
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
zp = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
P = os.path.join(ROOT, 'data', 'manba', 'usda-sr-legacy.json')
db = json.load(open(P, encoding='utf8'))
if hashlib.sha256(open(zp, 'rb').read()).hexdigest() != db['meta']['sha256']: sys.exit('XATO: arxiv sha256 mos emas')
z = zipfile.ZipFile(zp); base = 'FoodData_Central_sr_legacy_food_csv_2018-04/'
ids = set(db['foods']); fib = {}
for r in csv.DictReader(io.TextIOWrapper(z.open(base + 'food_nutrient.csv'), encoding='utf-8')):
    if r['nutrient_id'] == '1079' and r['fdc_id'] in ids: fib[r['fdc_id']] = round(float(r['amount']), 2)
n = 0
for i, f in db['foods'].items():
    if i in fib: f['fib'] = fib[i]; n += 1
    else: f.pop('fib', None)
db['meta']['kletchatka'] = 'fib — Fiber, total dietary (nutrient 1079), g/100 g; yo\'q bo\'lsa — USDA da qiymat yo\'q (noma\'lum)'
json.dump(db, open(P, 'w', encoding='utf8'), ensure_ascii=False, indent=1); open(P, 'a').write('\n')
print('USDA yozuvlari:', len(ids), '| kletchatka bor:', n, '| yo\'q:', len(ids) - n)
