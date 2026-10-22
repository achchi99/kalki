#!/usr/bin/env node
/* kalki.uz — ovqat ikonkalari rejasi: data/ikonka-reja.txt (guruh | slug | tavsif | taom id'lari) → 42 talik to'plamlar (docs/ikonka-toplam-N.txt) + jadval (docs/ikonka-jadval.md).
 *   node tools/ikonka-toplam.js           — tekshiradi va yozadi
 * Tekshiradi: har slug noyob va mavjud ikonka (assets/ovqat) bilan to'qnashmaydi; har id bazada ko'rinadigan va hozir rasmsiz; hamma rasmsiz taom qamrab olingan; tavsifda brend/odam/qo'l/cho'chqa yo'q.
 * Rasm hozircha YASALMAYDI; keyin: to'rni kesish → assets/ovqat/<slug>-128|256.webp + kalkifit-app.js dagi IMGS/IMGMAP. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), R = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const foods = JSON.parse(R('data/ovqatlar.json')).foods.filter((f) => !f.h), by = Object.fromEntries(foods.map((f) => [f.i, f]));
const app = R('assets/kalkifit-app.js').split('\n'), a = app.findIndex((l) => l.startsWith('  var IMGS = {};')), b = app.findIndex((l, i) => i > a && l.startsWith('  function tileHtml'));
const alias = {}; JSON.parse(R('data/ovqatlar.json')).foods.forEach((f) => { if (f.al) alias[f.i] = f.al.f; });
const imgFile = new Function('dbAlias', app.slice(a, b).join('\n') + ';return imgFile')(alias);
const existing = new Set(fs.readdirSync(path.join(ROOT, 'assets/ovqat')).map((x) => x.replace(/-(128|256)\.webp$/, '')));
const noIcon = foods.filter((f) => !imgFile(f.i, null)).map((f) => f.i);
const rows = R('data/ikonka-reja.txt').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => { const p = l.split('|'); if (p.length !== 4) throw new Error('qator noto\'g\'ri: ' + l.slice(0, 60)); return { g: +p[0], slug: p[1].trim(), desc: p[2].trim(), ids: p[3].trim().split(/\s+/).filter(Boolean) }; });
const err = [], seen = new Set(), cover = {};
const BAD = /(coca|pepsi|fanta|sprite|snickers|mars\b|twix|bounty|kitkat|kit kat|milky|m&m|oreo|kinder|milka|alpen|nutella|pringles|lay's|red bull|monster|adrenaline|powerade|mcdonald|big mac|kfc|logo|brand|\bhand\b|\bhands\b|\bperson\b|\bpeople\b|\bpork\b|\bham\b|\bbacon\b|\bpig\b)/i;
for (const r of rows) {
  if (seen.has(r.slug)) err.push('takror slug: ' + r.slug); seen.add(r.slug);
  if (existing.has(r.slug)) err.push('mavjud ikonka bilan to\'qnashadi: ' + r.slug);
  if (!/^[a-z0-9-]+$/.test(r.slug)) err.push('slug noto\'g\'ri: ' + r.slug);
  if (BAD.test(r.desc)) err.push(r.slug + ': tavsifda taqiqlangan so\'z: ' + (r.desc.match(BAD) || [])[0]);
  if (!r.desc.endsWith('.') || r.desc.length < 20) err.push(r.slug + ': tavsif qisqa yoki nuqtasiz');
  if (!r.ids.length) err.push(r.slug + ': taom id yo\'q');
  for (const id of r.ids) { if (id.includes('#')) { const bs = id.split('#')[0]; if (!by[bs] || !by[bs].fam) err.push(r.slug + ': oilasi yo\'q: ' + id); cover[id] = r.slug; continue; } if (!by[id]) err.push(r.slug + ': bazada ko\'rinadigan taom yo\'q: ' + id); else if (!id.includes('#') && !noIcon.includes(id)) err.push(r.slug + ': ' + id + ' allaqachon ikonkali'); if (cover[id]) err.push(id + ': ikki ikonkada (' + cover[id] + ', ' + r.slug + ')'); cover[id] = r.slug; }
}
const rest = noIcon.filter((i) => !cover[i]); const PORK_SKIP = new Set(['bekon']);       // bekon — cho'chqa go'shti: ikonka yo'q (harfli tile qoladi)
const missing = rest.filter((i) => !PORK_SKIP.has(i)); if (missing.length) err.push('ikonkasiz qolgan taomlar (' + missing.length + '): ' + missing.join(' '));
if (err.length) { console.error(err.join('\n')); process.exit(1); }
const order = rows.map((r, i) => ({ r, i })).sort((x, y) => x.r.g - y.r.g || x.i - y.i).map((x) => x.r);
const HEAD = `---
Create ONE square image: a grid of 42 food icons, 6 columns × 7 rows, each icon with its slug written in small dark text below it. Style for every icon: soft 3D illustration (clay / matte 3D icon), not a photograph; one single dish centered at a 45-degree angle; plain solid background #F5F1EA with only a soft contact shadow under the dish; no other text, no logos, no hands, no people, no cutlery unless mentioned, no extra side dishes; warm, appetizing, natural colors; simple shapes; clean edges. Traditional Uzbek (Central Asian) dishes must follow the description exactly — do not substitute Indian, Turkish or Russian versions. Keep the icons in exactly this order:
---
`;
for (const f of fs.readdirSync(path.join(ROOT, 'docs'))) if (/^ikonka-toplam-\d+\.txt$/.test(f)) fs.unlinkSync(path.join(ROOT, 'docs', f));
const sets = []; for (let i = 0; i < order.length; i += 42) sets.push(order.slice(i, i + 42));
sets.forEach((s, k) => fs.writeFileSync(path.join(ROOT, 'docs', 'ikonka-toplam-' + (k + 1) + '.txt'), HEAD + s.map((r) => r.slug + ' — ' + r.desc).join('\n') + '\n'));
const GN = { 1: 'milliy taomlar va Yeymiz', 2: "go'sht, ichki a'zolar, baliq", 3: 'ichimliklar', 4: 'muzqaymoq', 5: 'v20 yangilari (sport, shokolad, gazaklar)', 6: 'qolganlari' };
let md = '# Ovqat ikonkalari rejasi (rasm hali yasalmagan)\n\n`node tools/ikonka-toplam.js` — `data/ikonka-reja.txt` dan to\'plamlar (`docs/ikonka-toplam-N.txt`) va shu jadvalni yasaydi.\n\n- Rasmsiz ko\'rinadigan taom: **' + noIcon.length + '** (shundan ' + missing.length + ' ta ikonka rejalashtirildi' + (PORK_SKIP.size ? '; ' + [...PORK_SKIP].join(', ') + ' — cho\'chqa go\'shti, ikonkasiz' : '') + ')\n- Noyob yangi ikonka: **' + order.length + '**; to\'plam: **' + sets.length + '** (42 talik' + (order.length % 42 ? ', oxirgisi ' + (order.length % 42) + ' ta' : '') + ')\n\n';
sets.forEach((s, k) => { md += '## To\'plam ' + (k + 1) + ' (' + s.length + ')\n\n| № | slug | guruh | ishlatadigan taomlar |\n|---|---|---|---|\n' + s.map((r, i) => '| ' + (i + 1) + ' | `' + r.slug + '` | ' + GN[r.g] + ' | ' + r.ids.map((id) => (by[id.split('#')[0]].n + (id.includes('#') ? ' → ' + id.split('#')[1] : '')).replace(/\|/g, '/') + ' (`' + id + '`)').join(', ') + ' |').join('\n') + '\n\n'; });
fs.writeFileSync(path.join(ROOT, 'docs', 'ikonka-jadval.md'), md);
console.log('rasmsiz:', noIcon.length, '| ikonka rejalashtirilgan taom:', noIcon.length - PORK_SKIP.size, '| noyob ikonka:', order.length, '| to\'plam:', sets.length, '(oxirgisi ' + sets[sets.length - 1].length + ')');
