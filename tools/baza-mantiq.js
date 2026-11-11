#!/usr/bin/env node
/* kalki.uz — KalkiFit bazasining MANTIQIY tekshiruvi (v77): butun data/ovqatlar.json bo'yicha doimiy qoidalar. Test: tools/dizayn/test-baza-mantiq.mjs (har deployda).
 *   a) qo'shimchali variant (shakar/sut/qaymoq/yog'li/asal bilan) bir xil o'lchovda asosiy taomdan kam bo'lmasin;
 *   b) ichimlikda «piyola» faqat choyga xos (qahva/kakao/sut/sharbat/gazli — chashka/stakan/ml);
 *   c) makro: 4·oqsil + 4·uglevod + 9·yog' ≈ kkal (±15 %, kichik qiymatda ±10 kkal; spirtli ichimlik — istisno);
 *   d) shubhali: shakarsiz choy/qahva/suv > 10 kkal/100 g; bir o'lchovli ichimlik > 400 kkal (sut kokteyli/ proteindan tashqari);
 *   e) bir xil nomli (uz yoki ru) dublikat — turli id'da, ko'rinadigan (h≠1) taomlar.
 *   node tools/baza-mantiq.js [--json]   — ro'yxatni chiqaradi (istisnolar alohida ko'rsatiladi). */
'use strict';
const fs = require('fs'), path = require('path');
/* ISTISNO: qoida → { id: sabab } — qo'lda ko'rib chiqilgan, tuzatilmaydigan (sababi bilan) */
const ISTISNO = require('./baza-mantiq-istisno.js');
const QUSH = [
  ['shakar', /shakar(?:li)?\s+bilan|shakarli|\bс\s+сахаром|сладк|shirin\b|с\s+медом|с\s+мёдом|asal\s+bilan|navvot|нават|наб[ао]т/i], ['sut', /sut\s+bilan|sutli\b|с\s+молоком|молочн/i], ['qaymoq', /qaymoqli|qaymoq\s+bilan|со\s+сливками|сливочн/i], ['yog', /yog'li|жирн/i]
];
const ASOS_BUZ = /shakarsiz|без\s+сахара|yog'siz|обезжир|нежирн/i;           // «asosiy» deb hisoblanadi (qo'shimchasiz)
const norm = (s) => String(s || '').toLowerCase().replace(/[’‘ʻʼ`´]/g, "'").replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
const stripQ = (s) => norm(s).replace(/shakar(?:li)?\s+bilan|sut\s+bilan|qaymoq\s+bilan|asal\s+bilan|shakarli|sutli|qaymoqli|yog'li|shakarsiz|yog'siz|с\s+сахаром|с\s+молоком|со\s+сливками|без\s+сахара|с\s+медом|с\s+мёдом|сладкий|жирный/gi, ' ').replace(/\s+/g, ' ').trim();
const nameAll = (f) => (f.n + ' ' + f.r);
const unitG = (f, u) => { const x = (f.u || []).find((q) => q[0] === u); return x ? x[1] : null; };
const perUnit = (f, u) => { const g = unitG(f, u); return g ? f.k * g / 100 : null; };
function tekshir(foods) {
  const out = { a: [], b: [], c: [], d: [], e: [] }, vis = foods.filter((f) => !f.h);
  /* a) qo'shimchali ≥ asosiy */
  const groups = {}; vis.forEach((f) => { const k = stripQ(f.n) + '|' + f.t; (groups[k] = groups[k] || []).push(f); });
  vis.forEach((f) => {
    const q = QUSH.filter(([, re]) => re.test(nameAll(f))).map((x) => x[0]); if (!q.length || ASOS_BUZ.test(nameAll(f))) return;
    const base = (groups[stripQ(f.n) + '|' + f.t] || []).filter((b) => b !== f && !QUSH.some(([, re]) => re.test(nameAll(b))) || ASOS_BUZ.test(nameAll(b)) && b !== f && stripQ(b.n) === stripQ(f.n));
    base.filter((b) => !/xom\b|\bxom|сыр|сухо|quruq|kukun/i.test(nameAll(b))).forEach((b) => { const shared = (f.u || []).map((x) => x[0]).filter((u) => u !== 'g100' && unitG(b, u)); let bad = null;
      shared.forEach((u) => { const pf = perUnit(f, u), pb = perUnit(b, u); if (pf != null && pb != null && pf < pb - 0.5) bad = bad || { u: u, fk: Math.round(pf * 10) / 10, bk: Math.round(pb * 10) / 10 }; });
      if (!shared.length && f.k < b.k - 0.5) bad = { u: '100 g', fk: f.k, bk: b.k };
      if (bad) out.a.push({ id: f.i, n: f.n, asos: b.i, asosN: b.n, birlik: bad.u, variantKkal: bad.fk, asosKkal: bad.bk, qoshimcha: q.join('+') }); });
  });
  /* b) ichimlik o'lchovi: «piyola» faqat choy */
  vis.forEach((f) => { if (f.t !== 'i') return; const tea = /choy|чай|chay/i.test(f.i + ' ' + nameAll(f)); const hasP = (f.u || []).some((u) => u[0] === 'piyola'); if (hasP && !tea) out.b.push({ id: f.i, n: f.n, birliklar: (f.u || []).map((u) => u[0] + ':' + u[1]).join(',') }); });
  /* c) makro ±15 % */
  vis.forEach((f) => { if (/^(aroq|konyak|vino|pivo)/.test(f.i)) return; const atw = 4 * f.p + 4 * f.c + 9 * f.f; if (Math.abs(atw - f.k) > Math.max(10, f.k * 0.15)) out.c.push({ id: f.i, n: f.n, kkal: f.k, hisob: Math.round(atw), farq: Math.round((atw - f.k) / Math.max(1, f.k) * 100) }); });
  /* d) shubhali */
  vis.forEach((f) => { const nm = f.i + ' ' + nameAll(f); const plain = /(choy|чай|qahva|кофе|kofe|suv\b|вода)/i.test(nm) && !QUSH.some(([, re]) => re.test(nameAll(f))) && !/qaymoq|сливк|latte|латте|капучино|kapuchino|raf|раф|mokka|мокка|sut|молок|3 ?in ?1|3 в 1|gazli|sharbat|сок|limon|лимон|sirop|сироп|kvas|квас|kompot|компот|shakar|сахар|asal|мёд|мед|energ|энерг|turk|тур|espresso|эспрессо|sovuq|холодн|iced|kokos|кокос|navvot|нават/i.test(nm) && f.t === 'i';
    if (plain && f.k > 10) out.d.push({ id: f.i, n: f.n, kkal: f.k, sabab: 'shakarsiz choy/qahva/suv > 10 kkal/100 g' });
    if (f.t === 'i') (f.u || []).forEach((u) => { if (u[0] === 'g100' || /^shisha(?:1|15)$/.test(u[0]) || /^(vino|aroq|konyak|pivo)/.test(f.i)) return; const kk = f.k * u[1] / 100; if (kk > 400 && !/kokteyl|коктейл|protein|протеин|gainer|geyner|sut-kok|smuzi|смузи/i.test(nm)) out.d.push({ id: f.i, n: f.n, kkal: Math.round(kk), sabab: 'bir o\'lchovli ichimlik > 400 kkal (' + u[0] + ':' + u[1] + ')' }); }); });
  /* e) dublikat nomlar */
  const seen = {}; vis.forEach((f) => { [['n', f.n], ['r', f.r]].forEach(([l, v]) => { const nv = String(v || '').toLowerCase().replace(/[’‘ʻʼ`´]/g, "'").replace(/ё/g, 'е').replace(/\s+/g, ' ').trim(), k = l + '|' + nv; if (!nv) return; (seen[k] = seen[k] || []).push(f); }); });
  const dup = {}; Object.keys(seen).forEach((k) => { const l = seen[k]; if (l.length > 1) { const key = l.map((x) => x.i).sort().join(','); if (!dup[key]) { dup[key] = 1; out.e.push({ nom: k.split('|')[1], idlar: l.map((x) => x.i), ildiz: l.map((x) => x.n + ' / ' + x.r).join(' || ') }); } } });
  /* istisnolar */
  const filt = (rule, idOf) => { const ex = ISTISNO[rule] || {}; const keep = [], skipped = []; out[rule].forEach((x) => { const k = idOf(x); (ex[k] ? skipped : keep).push(x); }); out[rule] = keep; out['istisno_' + rule] = skipped; };
  filt('a', (x) => x.id + '>' + x.asos); filt('b', (x) => x.id); filt('c', (x) => x.id); filt('d', (x) => x.id); filt('e', (x) => x.idlar.join(','));
  return out;
}
module.exports = { tekshir, ISTISNO };
if (require.main === module) {
  const foods = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'ovqatlar.json'), 'utf8')).foods, r = tekshir(foods);
  if (process.argv.includes('--json')) console.log(JSON.stringify(r, null, 1)); else { for (const k of ['a', 'b', 'c', 'd', 'e']) { console.log('== ' + k + ': ' + r[k].length + ' ta (istisno: ' + (r['istisno_' + k] || []).length + ')'); r[k].forEach((x) => console.log('  ' + JSON.stringify(x))); } }
}
