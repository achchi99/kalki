#!/usr/bin/env python3
"""docs/dizayn-tarqatish.md ni pages.json + v2-pages.json + holat.json dan yig'adi. python3 tools/dizayn/tarqatish-doc.py"""
import json, os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')) + '/'
pages = json.load(open(R + 'tools/dizayn/pages.json')); v2 = [f[:-5] for f in json.load(open(R + 'tools/dizayn/v2-pages.json'))]
holat = json.load(open(R + 'tools/dizayn/holat.json')) if os.path.exists(R + 'tools/dizayn/holat.json') else {}
KAT = {'moliya': 'Moliya (--cat-moliya)', 'qurilish': 'Qurilish (--cat-qurilish)', 'kommunal': 'Kommunal (--cat-kommunal)', 'hayot': 'Hayotiy (--cat-hayot)', 'huquqiy': 'Huquqiy (--cat-huquqiy)', 'hujjat': 'Hujjat (brend)'}
BN = {0: '0 (tasdiqlangan 1a–1d)', 1: '1', 2: '2', 3: '3', 4: '4'}
rows = sorted(pages, key=lambda p: (p['partiya'], -(p['klik_uz'] + p['klik_ru'])))
L = []
L.append('# Dizayn tarqatish jarayoni (V2 → butun sayt)\n')
L.append('Manba: `tools/dizayn/pages.json` (inventar: tur, kategoriya, GSC kliklari, partiya), `tools/dizayn/v2-pages.json` (V2 ro\'yxati), `tools/dizayn/holat.json` (test natijalari). Jadvalni qayta yig\'ish: `python3 tools/dizayn/tarqatish-doc.py`.\n')
L.append('**Partiyalar:** 0 — tasdiqlangan 3 sahifa; 1 — GSC bo\'yicha eng ko\'p kiriladigan 10 ta generator/kalkulyator; 2 — qolgan kalkulyatorlar; 3 — qolgan generatorlar; 4 — maqola, hub, huquqiy, boshqa; 5 — `/cyr/` (JS\'siz, alohida).\n')
L.append('**Tekshiruvlar:** *oltin* — `tools/dizayn/oltin.mjs compare` (kalkulyator natijalari 3 kirish to\'plami, generator matni + Word matni + PDF sahifa/hajm, AI blok mock); *SEO* — `tools/dizayn/seo-diff.mjs main` (title, H1, description, canonical, hreflang, OG, JSON-LD, answerbox matni/sanasi/tartibi, ichki havolalar kamaymasligi); *sahifa testi* — `test-pages.mjs` (320/390/768/1280 toshish, konsol, emoji, til tozaligi); *sticky* — `test-sticky.mjs`.\n')
L.append('## Jarayon jadvali\n')
L.append('| sahifa | tur | kategoriya | partiya | RU | CYR | klik UZ+RU | holat | oltin | SEO | sahifa testi | sticky |\n|---|---|---|---|---|---|---|---|---|---|---|---|')
for p in rows:
    h = holat.get(p['slug'], {})
    st = 'V2' if p['slug'] in v2 else ('muammo' if h.get('muammo') else 'eski')
    L.append('| %s | %s | %s | %s | %s | %s | %d | %s | %s | %s | %s | %s |' % (p['slug'], p['tur'], KAT.get(p['kat'], p['kat'] or '—'), BN[p['partiya']], 'ha' if p['ru'] else '—', 'ha (eski)' if p['cyr'] else '—', p['klik_uz'] + p['klik_ru'], st, h.get('oltin', '—'), h.get('seo', '—'), h.get('test', '—'), h.get('sticky', '—')))
n_v2 = sum(1 for p in pages if p['slug'] in v2)
L.append('\nJami: %d sahifa (UZ), V2: %d, qolgan: %d.\n' % (len(pages), n_v2, len(pages) - n_v2))
if os.path.exists(R + 'tools/dizayn/tarqatish-izoh.md'): L.append(open(R + 'tools/dizayn/tarqatish-izoh.md').read())
open(R + 'docs/dizayn-tarqatish.md', 'w').write('\n'.join(L) + '\n')
print('yozildi: docs/dizayn-tarqatish.md', n_v2, '/', len(pages))
