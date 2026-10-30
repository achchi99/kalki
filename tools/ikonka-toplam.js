#!/usr/bin/env node
/* kalki.uz — ovqat ikonkalari rejasi: data/ikonka-reja.txt (guruh | slug | tavsif | taom id'lari) → hali RASMI YO'Q ikonkalar uchun 42 talik to'plamlar (docs/ikonka-toplam-N.txt) + jadval (docs/ikonka-jadval.md).
 *   node tools/ikonka-toplam.js           — tekshiradi va yozadi;  --tekshir — faqat tekshiradi (testlar)
 * v65 (qayta yozildi): reja — butun tarix (rasmi bor va yo'q slug'lar). Holat — HOZIRGI ilova xaritasi bo'yicha (IMGS/IMGMAP/IMG2 + IKONKA-XARITA):
 *   • «generic» = rasmsiz taom (tur ikonkasi ko'rinadi); har biri rasmi YO'Q bitta reja qatorida bo'lishi shart (aks holda — xato, ro'yxat bilan);
 *   • yashirin (h: 1, masalan eski muzqaymoq turlari) taomlar ham bazada bor — xato emas; rasmi bor taom eski reja qatorida qolsa — faqat ogohlantirish;
 *   • rasmi bor to'plam fayllari (docs/ikonka-toplam-N.txt) O'ZGARMAYDI (ikonka-kes.js shu tartib bilan kesgan); qolganlari — keyingi N dan qayta yoziladi.
 * Tavsifda brend/odam/qo'l/cho'chqa yo'q. Rasm keyin: to'r → node tools/ikonka-kes.js ~/toplam-N.jpg (--quru bilan oldin tekshiring). */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), R = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const all = JSON.parse(R('data/ovqatlar.json')).foods, byAll = Object.fromEntries(all.map((f) => [f.i, f]));
const foods = all.filter((f) => !f.h), by = byAll;          // eski kod uchun: by — barcha (yashirin ham)
const app = R('assets/kalkifit-app.js').split('\n'), a = app.findIndex((l) => l.startsWith('  var IMGS = {};')), b = app.findIndex((l, i) => i > a && l.startsWith('  function tileHtml'));
const alias = {}; all.forEach((f) => { if (f.al) alias[f.i] = f.al.f; });
const imgFile = new Function('dbAlias', app.slice(a, b).join('\n') + ';return imgFile')(alias);          // HOZIRGI holat (IKONKA-XARITA bilan)
const HAVE = new Set(fs.readdirSync(path.join(ROOT, 'assets/ovqat')).filter((x) => /-256\.webp$/.test(x)).map((x) => x.replace(/-256\.webp$/, '')));
const PORK_SKIP = new Set(['bekon']);          // cho'chqa go'shti: ikonka yo'q (tur ikonkasi qoladi)
const generic = all.filter((f) => !f.al && !f.i.startsWith('tr-') && !PORK_SKIP.has(f.i) && !imgFile(f.i, null)).map((f) => f.i);
const rows = R('data/ikonka-reja.txt').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => { const p = l.split('|'); if (p.length !== 4) throw new Error('qator noto\'g\'ri: ' + l.slice(0, 60)); return { g: +p[0], slug: p[1].trim(), desc: p[2].trim(), ids: p[3].trim().split(/\s+/).filter(Boolean) }; });
const planned = new Set(rows.map((r) => r.slug));
const err = [], warn = [], seen = new Set(), cover = {};
const BAD = /(coca|pepsi|fanta|sprite|snickers|mars\b|twix|bounty|kitkat|kit kat|milky|m&m|oreo|kinder|milka|alpen|nutella|pringles|lay's|red bull|monster|adrenaline|powerade|mcdonald|big mac|kfc|raffaello|ferrero|toblerone|haribo|chupa|cheetos|activia|danissimo|ehrmann|president|valio|logo|brand|\bhand\b|\bhands\b|\bperson\b|\bpeople\b|\bpork\b|\bham\b|\bbacon\b|\bpig\b)/i;
for (const r of rows) {
  if (seen.has(r.slug)) err.push('takror slug: ' + r.slug); seen.add(r.slug);
  if (!/^[a-z0-9-]+$/.test(r.slug)) err.push('slug noto\'g\'ri: ' + r.slug);
  if (!r.ids.length) err.push(r.slug + ': taom id yo\'q');
  r.done = HAVE.has(r.slug); if (r.done) continue;          // rasmi bor — tarix, tekshirilmaydi
  if (BAD.test(r.desc)) err.push(r.slug + ': tavsifda taqiqlangan so\'z: ' + (r.desc.match(BAD) || [])[0]);
  if (!r.desc.endsWith('.') || r.desc.length < 20) err.push(r.slug + ': tavsif qisqa yoki nuqtasiz');
  r.need = [];
  for (const id of r.ids) {
    const bs = id.split('#')[0]; if (!byAll[bs]) { err.push(r.slug + ': bazada yo\'q: ' + id); continue; } if (id.includes('#') && !byAll[bs].fam) { err.push(r.slug + ': oilasi yo\'q: ' + id); continue; }
    if (id.includes('#') ? imgFile(bs, id.split('#')[1]) : imgFile(id, null)) { warn.push(r.slug + ': ' + id + ' allaqachon rasmli (eski reja)'); continue; }
    if (cover[id]) err.push(id + ': ikki ikonkada (' + cover[id] + ', ' + r.slug + ')'); cover[id] = r.slug; r.need.push(id);
  }
}
const missing = generic.filter((i) => !cover[i]); if (missing.length) err.push('rejada yo\'q generic taomlar (' + missing.length + '): ' + missing.join(' '));
if (err.length) { console.error(err.join('\n')); process.exit(1); }
const order = rows.filter((r) => !r.done && r.need.length).map((r, i) => ({ r, i })).sort((x, y) => x.r.g - y.r.g || x.i - y.i).map((x) => x.r);
const stale = rows.filter((r) => !r.done && !r.need.length).map((r) => r.slug); if (stale.length) warn.push('rasmsiz, lekin endi kerak emas (taomlari boshqa rasmga ulangan): ' + stale.join(' '));
/* rasm generatori uchun aniq prompt (mavjud ikonkalar uslubi; ikonka-kes.js shu to'rni kesadi: fon → #F3EBE4, taom 90%, yozuv olib tashlanadi) */
const head = (n, rowsN) => `---
Create ONE square image (1:1, at least 2048 × 2048 px): a grid of ${n} food icons, exactly 6 columns × ${rowsN} rows, all cells the same size, evenly spaced, no borders or lines between cells.
Under each icon write its slug in small dark sans-serif text (one line, centered) — nothing else in the image.
${n < 6 * rowsN ? 'The last ' + (6 * rowsN - n) + ' cell(s) of the bottom row stay EMPTY (background only).\n' : ''}Icon style (identical for every icon, matching an existing app icon set): soft 3D illustration — clay / matte 3D icon, NOT a photograph; one single dish or product centered in its cell, seen from a 45-degree angle, filling about 75–80% of the cell; plain solid warm cream background #F3EBE4 across the WHOLE image (same color in every cell); only a soft contact shadow under the dish; warm, appetizing, natural colors; simple rounded shapes; clean edges; gentle soft light from the top-left.
No logos, no brand names, no packaging text, no other text, no hands, no people, no cutlery unless mentioned, no extra side dishes, no frames, no gradients in the background.
Traditional Uzbek (Central Asian) dishes must follow the description exactly — do not substitute Indian, Turkish or Russian versions. Branded snacks are drawn as a generic unbranded product.
Keep the icons in exactly this order (left to right, top to bottom):
---
`;
const HEAD = head(42, 7);
if (process.argv.includes('--tekshir')) { if (warn.length) console.log('ogohlantirish: ' + warn.length); console.log('TEKSHIRUV OK — generic: ' + generic.length + ', rejalashtirilgan yangi ikonka: ' + order.length); process.exit(0); }          // test uchun: hech narsa yozmaydi
const DOCS = path.join(ROOT, 'docs'), setFiles = fs.readdirSync(DOCS).filter((f) => /^ikonka-toplam-(\d+|v\d+)\.txt$/.test(f));
const slugsOf = (f) => R('docs/' + f).split('\n').map((l) => (l.match(/^([a-z0-9-]+) — /) || [])[1]).filter(Boolean);
const doneN = setFiles.filter((f) => /^ikonka-toplam-\d+\.txt$/.test(f) && slugsOf(f).every((s) => HAVE.has(s))).map((f) => +f.match(/\d+/)[0]);
for (const f of setFiles) if (!doneN.includes(+((f.match(/^ikonka-toplam-(\d+)\.txt$/) || [])[1]))) fs.unlinkSync(path.join(DOCS, f));          // rasmsiz/eskirgan to'plam fayllari qayta yoziladi
const N0 = (doneN.length ? Math.max(...doneN) : 0) + 1;
const sets = []; for (let i = 0; i < order.length; i += 42) sets.push(order.slice(i, i + 42));
if (sets.length > 1 && sets[sets.length - 1].length <= 12) { const tail = sets.pop(); sets[sets.length - 1] = sets[sets.length - 1].concat(tail); }          // kichik qoldiq alohida to'r bo'lmasin: oxirgi to'r 6×8 gacha
sets.forEach((s, k) => fs.writeFileSync(path.join(DOCS, 'ikonka-toplam-' + (N0 + k) + '.txt'), head(s.length, Math.ceil(s.length / 6)) + s.map((r) => r.slug + ' — ' + r.desc).join('\n') + '\n'));
const GN = { 1: 'milliy taomlar va Yeymiz', 2: "go'sht, ichki a'zolar, baliq", 3: 'ichimliklar', 4: 'muzqaymoq', 5: 'v20 yangilari (sport, shokolad, gazaklar)', 6: 'qolganlari' };
let md = '# Ovqat ikonkalari rejasi\n\n`node tools/ikonka-toplam.js` — `data/ikonka-reja.txt` dan hali rasmi yo\'q ikonkalar to\'plamlari (`docs/ikonka-toplam-N.txt`) va shu jadval. Rasm: to\'rni yarating → `node tools/ikonka-kes.js ~/toplam-N.jpg --quru` (kontakt-varaqni ko\'ring) → `node tools/ikonka-kes.js ~/toplam-N.jpg` (oxirgi to\'plam 7 qatordan kam bo\'lsa: `--qator <qatorlar>`).\n\n- Generic (tur ikonkasi) taom: **' + generic.length + '**' + (PORK_SKIP.size ? ' (' + [...PORK_SKIP].join(', ') + ' — cho\'chqa go\'shti, ikonkasiz, sanalmaydi)' : '') + '\n- Yangi ikonka: **' + order.length + '**; to\'plam: **' + sets.length + '** (' + sets.map((s, k) => '№' + (N0 + k) + ' — ' + s.length + ' ta, 6×' + Math.ceil(s.length / 6)).join('; ') + ')\n\n';
sets.forEach((s, k) => { md += '## To\'plam ' + (N0 + k) + ' (' + s.length + ')\n\n| № | slug | guruh | ishlatadigan taomlar |\n|---|---|---|---|\n' + s.map((r, i) => '| ' + (i + 1) + ' | `' + r.slug + '` | ' + GN[r.g] + ' | ' + r.need.map((id) => (byAll[id.split('#')[0]].n + (id.includes('#') ? ' → ' + id.split('#')[1] : '')).replace(/\|/g, '/') + ' (`' + id + '`)').join(', ') + ' |').join('\n') + '\n\n'; });
fs.writeFileSync(path.join(DOCS, 'ikonka-jadval.md'), md);
if (warn.length) console.log('ogohlantirish (' + warn.length + '):\n  ' + warn.slice(0, 12).join('\n  ') + (warn.length > 12 ? '\n  …' : ''));
console.log('generic:', generic.length, '| yangi ikonka:', order.length, '| to\'plam:', sets.length, sets.length ? '(№' + N0 + '…' + (N0 + sets.length - 1) + ', oxirgisi ' + sets[sets.length - 1].length + ')' : '');

/* Turk taomlari (v21): alohida reja → docs/ikonka-toplam-turk.txt (bitta to'plam; yuqoridagi bilan bir xil uslub prompti, faqat milliy taom jumlasi turkcha) */
{
  const tf = path.join(ROOT, 'data/ikonka-reja-turk.txt');
  if (fs.existsSync(tf)) {
    const tr = R('data/ikonka-reja-turk.txt').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => { const p = l.split('|'); if (p.length !== 4) throw new Error('turk reja: qator noto\'g\'ri: ' + l.slice(0, 60)); return { g: +p[0], slug: p[1].trim(), desc: p[2].trim(), ids: p[3].trim().split(/\s+/) }; });
    const e2 = [], sl = new Set(), cv = new Set(), allSlugs = new Set(fs.readdirSync(path.join(ROOT, 'assets/ovqat')).map((x) => x.replace(/-(128|256)\.webp$/, '')));
    for (const r of tr) {
      if (sl.has(r.slug)) e2.push('turk: takror slug ' + r.slug); sl.add(r.slug);
      if (!/^[a-z0-9-]+$/.test(r.slug)) e2.push('turk: slug noto\'g\'ri ' + r.slug);
      if (planned.has(r.slug)) e2.push('turk: asosiy reja bilan to\'qnashadi ' + r.slug);
      if (BAD.test(r.desc)) e2.push('turk ' + r.slug + ': taqiqlangan so\'z: ' + (r.desc.match(BAD) || [])[0]);
      if (!r.desc.endsWith('.') || r.desc.length < 20) e2.push('turk ' + r.slug + ': tavsif qisqa');
      for (const id of r.ids) { if (!by[id]) e2.push('turk ' + r.slug + ': baza\'da yo\'q ' + id); cv.add(id); }
    }
    foods.filter((f) => f.i.startsWith('tr-') && !cv.has(f.i)).forEach((f) => e2.push('turk: ikonkasiz taom ' + f.i));
    if (tr.length > 42) e2.push('turk: 42 tadan ko\'p (' + tr.length + ')');
    if (e2.length) { console.error(e2.join('\n')); process.exit(1); }
    const HT = HEAD.replace('Traditional Uzbek (Central Asian) dishes must follow the description exactly — do not substitute Indian, Turkish or Russian versions.', 'Traditional Turkish dishes must follow the description exactly — do not substitute Greek, Arab or Russian versions.');
    fs.writeFileSync(path.join(ROOT, 'docs', 'ikonka-toplam-turk.txt'), HT + tr.map((r) => r.slug + ' — ' + r.desc).join('\n') + '\n');
    console.log('turk: ikonka', tr.length, '| taom', cv.size, '→ docs/ikonka-toplam-turk.txt');
  }
}
