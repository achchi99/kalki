/* Baza v2 — retsept usuli sinovi (node tools/test-baza-hisob.js).
 * Tekshiradi: har masalliqda USDA fdc_id (data/manba da bor) yoki nashr manbasi; Atwater; yield USDA juftidan; ikki manba (norin, sho'rva, qovurdoq);
 * foydalanuvchi qarori (osh 190); sho'rva omillari ~40/~53/~75; uy o'lchovi bilan kalibrlash (yield = to'liq − bo'sh qozon → kkal/100 g avtomatik, eski bilan farq);
 * va (baza yasalgach) ovqatlar.json qiymatlari retseptdan ±1 kkal mos. */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert');
const H = require('./baza-hisob.js');
const R = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const usda = R('data/manba/usda-sr-legacy.json'), sk = R('data/manba/skurikhin.json'), mas = R('data/baza-masalliq.json').masalliq, rets = R('data/baza-retseptlar.json').retseptlar;
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
// 1. manbalar
assert.ok(usda.meta.sha256 && usda.meta.yuklangan && /fdc\.nal\.usda\.gov/.test(usda.meta.url)); assert.ok(sk.meta.yuklangan);
for (const [k, m] of Object.entries(mas)) { if (m.usda) { const f = usda.foods[String(m.usda)]; assert.ok(f && f.kcal >= 0 && f.d, k + ': USDA fdc_id ' + m.usda + ' data/manba da yo\'q'); } if (m.pishgan) assert.ok(usda.foods[String(m.pishgan)], k + ': pishgan id'); if (m.skurikhin) assert.ok(sk.yozuvlar[m.skurikhin] && sk.yozuvlar[m.skurikhin].url, k + ': Skurikhin yozuvi'); const y = m.yield; assert.ok(y && (y.juft || y.q > 0), k + ': yield qoidasi'); if (y.juft) assert.ok(m.pishgan, k + ': juft uchun pishgan id'); }
for (const r of rets) for (const l of r.ingr) assert.ok(mas[l.m], r.id + ': masalliq ro\'yxatda yo\'q: ' + l.m);
ok('har masalliqda USDA fdc_id (data/manba da qiymat, tavsif, sana + sha256) yoki Skurikhin url; yield qoidasi; retseptlardagi hamma masalliq ro\'yxatda (' + Object.keys(mas).length + ' masalliq, ' + rets.length + ' retsept)');
// 2. hisob
const hs = H.hisob(), by = Object.fromEntries(hs.map((h) => [h.id, h]));
for (const h of hs) { assert.ok(h.k > 0 && h.k < 700, h.id + ' kkal ' + h.k); const atw = 4 * h.p + 9 * h.f + 4 * h.c; assert.ok(Math.abs(atw - h.k) <= Math.max(25, h.k * 0.15), h.id + ': Atwater ' + Math.round(atw) + ' ≠ ' + h.k); assert.ok(h.yield_g > 100 && h.x === !h.kalibr, h.id + ': yield/x'); }
ok('hamma retsept: kkal ≈ 4·O+9·Y+4·U (±15%), yield > 0, «taxminiy» belgisi (kalibrlanmaguncha)');
assert.strictEqual(by['osh.orta.odatiy'].k, 190); assert.ok(by['osh.kam.kam'].k < by['osh.orta.odatiy'].k && by['osh.kop.kop'].k > by['osh.orta.odatiy'].k); assert.ok(by['osh.orta.odatiy'].qaror.k_koef > 1);
ok('osh standarti (go\'sht o\'rta × yog\' odatiy) = 190 (foydalanuvchi qarori, izoh bilan), omillar monoton: ' + by['osh.kam.kam'].k + ' … ' + by['osh.kop.kop'].k);
const sh = ['qaynatma', 'odatiy', 'yogli'].map((x) => by['shurva.' + x].k); assert.ok(sh[0] >= 33 && sh[0] <= 46 && sh[1] >= 49 && sh[1] <= 57 && sh[2] >= 68 && sh[2] <= 80 && sh[0] < sh[1] && sh[1] < sh[2], 'sho\'rva ' + sh);
ok('sho\'rva «Tarkibi» (retseptdan): qaynatma ' + sh[0] + ' · odatiy ' + sh[1] + ' · yog\'li quyuq ' + sh[2] + ' (mo\'ljal ~40 / ~53 / ~75)');
for (const id of ['norin', 'qovurdoq', 'shurva.odatiy']) { const h = by[id]; assert.ok(h.sk && h.sk.skCov >= 90, id + ': Skurikhin hisobi'); assert.strictEqual(h.k, Math.round((h.usda.k + h.sk.k) / 2)); }
assert.strictEqual(by.norin.k, 278); ok('norin / qovurdoq / sho\'rva: USDA va Скурихин hisobining o\'rtachasi (norin 278)');
// 3. kalibrlash
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'baza-')), of = path.join(tmp, 'olch.json'), rf = path.join(tmp, 'rets.json');
fs.copyFileSync(path.join(__dirname, '..', 'data', 'baza-retseptlar.json'), rf);
fs.writeFileSync(of, JSON.stringify({ olchovlar: [{ id: 'osh', retsept: 'osh.orta.odatiy', xom_g: { guruch: 1000, qoy: 400, mol: 400, sabzi: 1000, piyoz: 250, yog: 220 }, suv_g: 0, qozon_bosh_g: 3000, qozon_toliq_g: 7400, porsiya_g: 400 }, { id: 'manti', retsept: 'manti.goshtli', xom_g: {}, qozon_bosh_g: null, qozon_toliq_g: null }] }));
const O = H.olchovlar(of); assert.strictEqual(O.length, 2); assert.strictEqual(O[1].tayyor, false); const o = O[0];
assert.ok(o.tayyor && o.yield_g === 4400 && o.retseptK === 190 && o.eski === 200); const kk = (1000 * 365 + 400 * usda.foods['172479'].kcal + 400 * usda.foods['168668'].kcal + 1000 * usda.foods['170393'].kcal + 250 * usda.foods['170000'].kcal + 220 * usda.foods['171024'].kcal) / 4400; assert.ok(Math.abs(o.k - Math.round(kk)) <= 1, 'o\'lchangan kkal ' + o.k + ' ≈ ' + kk.toFixed(1)); assert.strictEqual(o.kcalPorsiya, Math.round(o.k * 4));
ok('uy o\'lchovi: yield = to\'liq − bo\'sh qozon = ' + o.yield_g + ' g → ' + o.k + ' kkal/100 g (retsept ' + o.retseptK + ', eski ' + o.eski + '), 1 lagan 400 g = ' + o.kcalPorsiya + ' kkal; to\'ldirilmagan o\'lchov e\'tiborsiz');
assert.strictEqual(H.kalibrlash(rf, of), 1); const j = JSON.parse(fs.readFileSync(rf, 'utf8')), r = j.retseptlar.find((x) => x.id === 'osh.orta.odatiy'); assert.ok(r.kalibr && r.kalibr.yield_g === 4400 && r.kalibr.ingr.length === 6 && r.kalibr.sana);
ok('--kalibr: retsept `kalibr` bilan yangilandi (yield 4400, 6 masalliq, sana) — «taxminiy» belgisi olinadi (hisob.x = false)');
fs.rmSync(tmp, { recursive: true, force: true });
// 4. baza (yasalgan bo'lsa) retsept bilan mos
const bazaF = path.join(__dirname, '..', 'data', 'ovqatlar.json'); const baza = R('data/ovqatlar.json');
if (baza.v >= 2) {
  const F = Object.fromEntries(baza.foods.map((f) => [f.i, f])); let cnt = 0;
  for (const f of baza.foods) { if (!f.rc) continue; const h = by[f.rc]; if (f.fam) continue; assert.ok(h, f.i + ': retsept ' + f.rc); assert.ok(Math.abs(f.k - h.k) <= 1 && Math.abs(f.p - h.p) <= 0.15 && Math.abs(f.f - h.f) <= 0.15 && Math.abs(f.c - h.c) <= 0.15, f.i + ': baza ' + f.k + ' ≠ retsept ' + h.k); cnt++; }
  for (const f of baza.foods) if (f.fam) for (const [vr, g] of Object.entries(f.fam.g)) { if (!g.rc) continue; const h = by[g.rc]; assert.ok(h && Math.abs(g.k - h.k) <= 1, f.i + '/' + vr + ': baza ' + g.k + ' ≠ retsept ' + (h && h.k)); cnt++; }
  ok('baza ↔ retsept: ' + cnt + ' ta qiymat retseptdan qayta hisoblangan natija bilan mos (±1 kkal)');
}
console.log('\n' + n + ' ta tekshiruv guruhi o\'tdi');
