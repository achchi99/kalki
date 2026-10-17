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
const usda = R('data/manba/usda-sr-legacy.json'), sk = R('data/manba/skurikhin.json'), mas = R('data/baza-masalliq.json').masalliq, rets = R('data/baza-retseptlar.json').retseptlar;
const cur = R('data/manba/baza-v1.json').qiymatlar;      // eski (v1) qiymatlar — muzlatilgan nusxa, solishtirish uchun
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
function calc(rec0, useSk) {
  const rec = rec0.kalibr ? Object.assign({}, rec0, { ingr: rec0.kalibr.ingr, yield_g: rec0.kalibr.yield_g }) : rec0;
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
    const a = calc(r, false), s = r.ikki_manba && !r.kalibr ? calc(r, true) : null, avg = (x, y) => (s ? (x + y) / 2 : x);
    const koef = r.qaror && r.qaror.k_koef || 1, R1 = (x) => Math.round(x * 10) / 10;
    const fin = { k: Math.round(avg(a.k, s && s.k) * koef), p: R1(avg(a.p, s && s.p) * koef), f: R1(avg(a.f, s && s.f) * koef), c: R1(avg(a.c, s && s.c) * koef) };
    const old = r.eski && cur[r.eski] ? cur[r.eski].k : null, d = old ? Math.round((fin.k - old) / old * 100) : null;
    return { id: r.id, nom: r.nom, eski: r.eski || null, old, usda: a, sk: s, k: fin.k, p: fin.p, f: fin.f, c: fin.c, yield_g: a.yield_g, farq: d, x: !r.kalibr, kalibr: !!r.kalibr, qaror: r.qaror || null, atwater: Math.round(4 * fin.p + 9 * fin.f + 4 * fin.c) };
  });
}
/* ---- uy o'lchovi bilan kalibrlash: data/baza-olchovlar.json ---- */
function olchovlar(file) {
  const f = file || path.join(__dirname, '..', 'data', 'baza-olchovlar.json'); if (!fs.existsSync(f)) return [];
  const out = [];
  for (const o of JSON.parse(fs.readFileSync(f, 'utf8')).olchovlar) {
    const xom = Object.entries(o.xom_g || {}).filter(([, g]) => g > 0), bosh = o.qozon_bosh_g, toliq = o.qozon_toliq_g;
    if (!xom.length || !(toliq > bosh) || !(bosh >= 0)) { out.push({ id: o.id, tayyor: false }); continue; }          // hali to'ldirilmagan
    const ingr = xom.map(([m, g]) => ({ m, g })); if (o.suv_g > 0) ingr.push({ m: 'suv', g: o.suv_g });
    const yg = toliq - bosh, c = calc({ ingr, yield_g: yg }, false), rec = rets.find((r) => r.id === o.retsept), h = rec ? hisob().find((x) => x.id === o.retsept) : null;
    const old = rec && rec.eski && cur[rec.eski] ? cur[rec.eski].k : null;
    out.push({ id: o.id, tayyor: true, retsept: o.retsept, yield_g: yg, k: c.k, p: c.p, f: c.f, c: c.c, retseptK: h ? h.k : null, retseptYield: h ? h.yield_g : null, eski: old, ingr, porsiya_g: o.porsiya_g || null, kcalPorsiya: o.porsiya_g ? Math.round(c.k * o.porsiya_g / 100) : null });
  }
  return out;
}
function kalibrlash(rfile, ofile) {                                   // to'ldirilgan o'lchovlarni retseptga yozadi (kalibr) — x belgisi olinadi
  const f = rfile || path.join(__dirname, '..', 'data', 'baza-retseptlar.json'), j = JSON.parse(fs.readFileSync(f, 'utf8')); let n = 0;
  for (const o of olchovlar(ofile)) { if (!o.tayyor) continue; const r = j.retseptlar.find((x) => x.id === o.retsept); if (!r) continue; r.kalibr = { ingr: o.ingr, yield_g: o.yield_g, sana: new Date().toISOString().slice(0, 10) }; n++; }
  fs.writeFileSync(f, JSON.stringify(j, null, 1)); return n;
}
if (require.main === module) {
  const H = hisob();
  if (process.argv.includes('--json')) { console.log(JSON.stringify(H, null, 1)); process.exit(0); }
  if (process.argv.includes('--yoz')) { require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'ovqatlar-build.js')], { stdio: 'inherit' }); process.exit(0); }   // ovqatlar-build.js → tools/baza-v2.js hisob() natijasini bazaga yozadi
  if (process.argv.includes('--olchov') || process.argv.includes('--kalibr')) {
    const O = olchovlar(); if (!O.length || !O.some((o) => o.tayyor)) { console.log("data/baza-olchovlar.json da to'ldirilgan o'lchov yo'q (qozon_bosh_g, qozon_toliq_g va xom_g ni yozing)."); process.exit(0); }
    O.forEach((o) => { if (!o.tayyor) { console.log(o.id.padEnd(10), 'to\'ldirilmagan'); return; }
      console.log(o.id.padEnd(10), 'yield', o.yield_g, 'g · o\'lchangan:', o.k, 'kkal/100 g (O' + o.p + ' Y' + o.f + ' U' + o.c + ')', '· retsept:', o.retseptK, '(yield ' + o.retseptYield + ')', '· bazada (eski):', o.eski == null ? '—' : o.eski, '· farq o\'lchov↔retsept:', o.retseptK ? Math.round((o.k - o.retseptK) / o.retseptK * 100) + '%' : '—', o.kcalPorsiya ? '· 1 porsiya ' + o.porsiya_g + ' g = ' + o.kcalPorsiya + ' kkal' : ''); });
    if (process.argv.includes('--kalibr')) { const n = kalibrlash(); console.log(n + ' ta retsept kalibrlandi (data/baza-retseptlar.json: kalibr). Endi: node tools/baza-hisob.js --yoz'); }
    process.exit(0); }
  console.log('id'.padEnd(26), 'eski'.padStart(5), 'USDA'.padStart(5), 'Skur.'.padStart(5), 'yangi'.padStart(5), 'farq%'.padStart(6), ' belgi');
  H.forEach((h) => console.log(h.id.padEnd(26), String(h.old == null ? '—' : h.old).padStart(5), String(h.usda.k).padStart(5), String(h.sk ? h.sk.k : '—').padStart(5), String(h.k).padStart(5), String(h.farq == null ? '—' : (h.farq > 0 ? '+' : '') + h.farq).padStart(6), ' ' + (h.farq != null && Math.abs(h.farq) > 30 ? 'O\'ZGARTIRMA (>30%)' : (h.farq != null && Math.abs(h.farq) > 15 ? '>15%' : ''))));
}
module.exports = { hisob, calc, olchovlar, kalibrlash };
