#!/usr/bin/env node
/* kalki.uz — baza v2: retseptdan 100 g dagi kkal/O/Y/U hisoblash.
 * FAQAT shu manbalardan: data/manba/usda-sr-legacy.json (USDA FDC SR Legacy, fdc_id bilan), data/manba/skurikhin.json (Скурихин jadvali, ikkinchi mustaqil manba),
 * data/baza-masalliq.json (masalliq → fdc_id / skurikhin / yield qoidasi), data/baza-retseptlar.json (xom vazn + yield). Qo'lda raqam yozilmaydi.
 * Yield: juft (xom/pishgan USDA yozuvlari) bo'lsa — nisbat avtomatik (oqsil yoki kkal bo'yicha); aks holda masalliq `q` yoki retsept satri `y` (taxmin=true — tarozida tekshiriladi).
 * Ishlatish:  node tools/baza-hisob.js            — hisobot (jadval)      node tools/baza-hisob.js --json   — mashina o'qiydigan natija
 *             (2-bosqich: --yoz ovqatlar.json ga yozadi — hozircha O'CHIRILGAN, jadval tasdiqlanmaguncha) */
'use strict';
const fs = require('fs'), path = require('path');
const R = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const usda = R('data/manba/usda-sr-legacy.json'), sk = R('data/manba/skurikhin.json'), mas = R('data/baza-masalliq.json').masalliq, rets = R('data/baza-retseptlar.json').retseptlar, foods = R('data/ovqatlar.json').foods;
const cur = {}; foods.forEach((f) => { cur[f.i] = f; });
const nutU = (id) => { const f = usda.foods[String(id)]; if (!f) throw new Error('USDA id yo\'q: ' + id); return f; };
function ingNut(key, useSk, sKey) {                       // 100 g xom masalliq: [kkal, O, Y, U, manba]
  const m = mas[key]; if (!m) throw new Error('masalliq yo\'q: ' + key);
  if (!m.usda) return { k: 0, p: 0, f: 0, c: 0, src: 'suv' };
  const sk1 = useSk && sk.yozuvlar[sKey || m.skurikhin];
  if (sk1) return { k: sk1.kcal, p: sk1.p, f: sk1.f, c: sk1.c, src: 'sk' };
  const u = nutU(m.usda); return { k: u.kcal, p: u.p, f: u.f, c: u.c, src: 'usda' };
}
function yieldK(key, line) {
  if (line.y != null) return { q: line.y, taxmin: true, src: 'retsept' };
  const m = mas[key], y = m.yield;
  if (y.juft) { const a = nutU(m.usda), b = nutU(m.pishgan), mk = y.belgi; return { q: a[mk] / b[mk], taxmin: false, src: 'usda-juft ' + m.usda + '→' + m.pishgan + ' (' + mk + ')' }; }
  return { q: y.q, taxmin: !!y.taxmin, src: y.tarif ? 'ta\'rif' : 'taxmin' };
}
function calc(rec, useSk) {
  let k = 0, p = 0, f = 0, c = 0, mass = 0, raw = 0, cov = 0, taxminMass = 0;
  for (const l of rec.ingr) {
    const n = ingNut(l.m, useSk, useSk ? l.s : null), y = yieldK(l.m, l);
    k += n.k * l.g / 100; p += n.p * l.g / 100; f += n.f * l.g / 100; c += n.c * l.g / 100; mass += l.g * y.q;
    if (l.m !== 'suv') { raw += l.g; if (n.src === 'sk' || !useSk) cov += l.g; }
    if (y.taxmin && l.m !== 'suv') taxminMass += l.g * y.q;
  }
  const m = rec.yield_g || mass, r1 = (x) => Math.round(x / m * 1000) / 10;
  return { k: Math.round(k / m * 100), p: r1(p), f: r1(f), c: r1(c), yield_g: Math.round(m), raw, taxminYield: Math.round(taxminMass / mass * 100), skCov: useSk ? Math.round(cov / raw * 100) : 100 };
}
function hisob() {
  return rets.map((r) => {
    const a = calc(r, false), s = r.taxminiy ? calc(r, true) : null, fin = s ? Math.round((a.k + s.k) / 2) : a.k, old = r.eski && cur[r.eski] ? cur[r.eski].k : null;
    const d = old ? Math.round((fin - old) / old * 100) : null;
    return { id: r.id, nom: r.nom, eski: r.eski || null, old, usda: a, sk: s, k: fin, farq: d, taxminiy: !!r.taxminiy, atwater: Math.round(4 * a.p + 9 * a.f + 4 * a.c) };
  });
}
if (require.main === module) {
  const H = hisob();
  if (process.argv.includes('--json')) { console.log(JSON.stringify(H, null, 1)); process.exit(0); }
  if (process.argv.includes('--yoz')) { console.error('--yoz hali yoqilmagan: 15%+ farq jadvali tasdiqlangandan keyin (2-bosqich).'); process.exit(2); }
  console.log('id'.padEnd(26), 'eski'.padStart(5), 'USDA'.padStart(5), 'Skur.'.padStart(5), 'yangi'.padStart(5), 'farq%'.padStart(6), ' belgi');
  H.forEach((h) => console.log(h.id.padEnd(26), String(h.old == null ? '—' : h.old).padStart(5), String(h.usda.k).padStart(5), String(h.sk ? h.sk.k : '—').padStart(5), String(h.k).padStart(5), String(h.farq == null ? '—' : (h.farq > 0 ? '+' : '') + h.farq).padStart(6), ' ' + (h.farq != null && Math.abs(h.farq) > 30 ? 'O\'ZGARTIRMA (>30%)' : (h.farq != null && Math.abs(h.farq) > 15 ? '>15%' : ''))));
}
module.exports = { hisob, calc };
