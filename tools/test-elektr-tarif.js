/* kalki.uz — assets/elektr-tarif.js (pog'onali elektr tarifi, 2026-06-01) sinovi.
 *   node tools/test-elektr-tarif.js
 * Kutilgan qiymatlar QO'LDA hisoblangan (funksiyaning o'zidan olinmagan). Manba: VM 15.05.2026, 243-son, 1-ilova:
 *   oddiy:  650 / 900 / 1 100 / 1 600 / 1 900 / 2 200;  elektr plitali: 325 / 450 / 550 / 800 / 950 / 1 100 so'm/kVt·soat. */
'use strict';
const assert = require('assert');
const { tiers, data } = require('../assets/elektr-tarif.js');

let pass = 0, fail = 0;
function T(name, fn) { try { fn(); pass++; console.log('OK   ' + name); } catch (e) { fail++; console.log('FAIL ' + name + ' — ' + e.message.split('\n')[0]); } }

// [kVt·soat, oddiy toifa, elektr plitali toifa] — qo'lda:
//  150  oddiy 150×650 = 97 500;                       plitali 150×325 = 48 750
//  350  oddiy 200×650 + 150×900 = 130 000+135 000;    plitali 200×325 + 150×450 = 65 000+67 500
//  800  oddiy 200×650 + 300×900 + 300×1100 = 130 000+270 000+330 000;  plitali 65 000 + 300×450 + 300×550 = 65 000+135 000+165 000
const CASES = [
  [150, 97500, 48750], [350, 265000, 132500], [800, 730000, 365000],
  [200, 130000, 65000], [201, 130900, 65450], [500, 400000, 200000], [501, 401100, 200550],
  [1000, 950000, 475000], [1001, 951600, 475800],
  [5000, 7350000, 3675000], [6000, 9250000, 4625000], [10000, 16850000, 8425000], [12000, 21250000, 10625000]
];
CASES.forEach(([k, std, stove]) => {
  T(k + ' kVt·soat, oddiy = ' + std, () => assert.strictEqual(tiers(k, 'std').total, std));
  T(k + ' kVt·soat, elektr plitali = ' + stove, () => assert.strictEqual(tiers(k, 'stove').total, stove));
});

T('350 oddiy: qatorlar 200×650 va 150×900', () => {
  const r = tiers(350, 'std').rows;
  assert.deepStrictEqual(r.map((x) => [x.from, x.to, x.kwh, x.price, x.cost]), [[0, 200, 200, 650, 130000], [201, 500, 150, 900, 135000]]);
});
T('800 plitali: uchta qator 200×325, 300×450, 300×550', () => {
  const r = tiers(800, 'stove').rows;
  assert.deepStrictEqual(r.map((x) => [x.kwh, x.price, x.cost]), [[200, 325, 65000], [300, 450, 135000], [300, 550, 165000]]);
});
T('jami = qatorlar yig\'indisi (har doim)', () => {
  [0.5, 17.3, 149.9, 200.5, 733.3, 1234.5, 9999.9, 15000.2].forEach((k) => ['std', 'stove'].forEach((c) => {
    const r = tiers(k, c); assert.strictEqual(r.total, r.rows.reduce((s, x) => s + x.cost, 0));
  }));
});
T('kasr iste\'mol: 200.5 oddiy = 130 000 + 0.5×900', () => assert.strictEqual(tiers(200.5, 'std').total, 130450));
T('0, manfiy va NaN: qator ham, summa ham yo\'q', () => [0, -5, NaN, undefined, null].forEach((k) => { const r = tiers(k, 'std'); assert.strictEqual(r.total, 0); assert.strictEqual(r.rows.length, 0); }));
T('noma\'lum toifa — oddiy toifa', () => assert.strictEqual(tiers(350, 'x').total, 265000));
T('pog\'ona soni 6 va narxlar o\'sib boradi (ikkala toifada)', () => ['std', 'stove'].forEach((c) => {
  const p = data.prices[c]; assert.strictEqual(p.length, data.limits.length); for (let i = 1; i < p.length; i++) assert.ok(p[i] > p[i - 1], c + ' ' + i);
}));
T('sanalar: amalda 2026-06-01, tekshirilgan 2026-10-13, manba lex.uz', () => {
  assert.strictEqual(data.amalda, '2026-06-01'); assert.strictEqual(data.tekshirilgan, '2026-10-13'); assert.ok(/^https:\/\/lex\.uz\//.test(data.url));
});

// ---- incremental(): uy sarfiga QO'SHILGAN qurilma (konditsioner) — qo'lda hisoblangan ----
// [uy, qurilma, toifa, uy to'lovi, jami to'lov, qurilma to'lovi, qurilma pog'onalari [kVt·soat × narx]]
//  uy 150 + 180, oddiy:   150×650 = 97 500; 330 = 200×650 + 130×900 = 247 000; farq 149 500 = 50×650 + 130×900
//  uy 400 + 180, oddiy:   400 = 130 000 + 200×900 = 310 000; 580 = 130 000 + 300×900 + 80×1100 = 488 000; farq 178 000 = 100×900 + 80×1100
//  uy 150 + 180, plitali: 48 750; 330 = 65 000 + 130×450 = 123 500; farq 74 750 = 50×325 + 130×450
//  uy 400 + 180, plitali: 400 = 65 000 + 200×450 = 155 000; 580 = 65 000 + 135 000 + 80×550 = 244 000; farq 89 000 = 100×450 + 80×550
//  uy 250 + 100, oddiy:   250 = 130 000 + 50×900 = 175 000; 350 = 265 000; farq 90 000 = 100×900 (bitta pog'ona)
//  uy 900 + 300, oddiy:   900 = 130 000 + 270 000 + 400×1100 = 840 000; 1200 = 130 000 + 270 000 + 500×1100 + 200×1600 = 1 270 000; farq 430 000 = 100×1100 + 200×1600
//  uy 900 + 300, plitali: 900 = 65 000 + 135 000 + 400×550 = 420 000; 1200 = 65 000 + 135 000 + 500×550 + 200×800 = 635 000; farq 215 000 = 100×550 + 200×800
const INC = [
  [150, 180, 'std',   97500, 247000, 149500, [[50, 650], [130, 900]]],
  [400, 180, 'std',   310000, 488000, 178000, [[100, 900], [80, 1100]]],
  [150, 180, 'stove', 48750, 123500, 74750, [[50, 325], [130, 450]]],
  [400, 180, 'stove', 155000, 244000, 89000, [[100, 450], [80, 550]]],
  [250, 100, 'std',   175000, 265000, 90000, [[100, 900]]],
  [900, 300, 'std',   840000, 1270000, 430000, [[100, 1100], [200, 1600]]],
  [900, 300, 'stove', 420000, 635000, 215000, [[100, 550], [200, 800]]]
];
const { incremental } = require('../assets/elektr-tarif.js');
INC.forEach(([h, a, c, base, total, cost, parts]) => {
  T('uy ' + h + ' + qurilma ' + a + ' (' + c + '): uy ' + base + ', jami ' + total + ', qo\'shimcha ' + cost, () => {
    const r = incremental(h, a, c);
    assert.strictEqual(r.baseTotal, base); assert.strictEqual(r.total, total); assert.strictEqual(r.cost, cost);
    assert.deepStrictEqual(r.rows.map((x) => [Math.round(x.kwh * 1e6) / 1e6, x.price]), parts);
    assert.ok(Math.abs(r.effective - cost / a) < 1e-9);
  });
});
T('qurilma sarfi 0 yoki manfiy: qo\'shimcha to\'lov 0, qator yo\'q', () => [0, -3, NaN, undefined].forEach((a) => { const r = incremental(250, a, 'std'); assert.strictEqual(r.cost, 0); assert.strictEqual(r.rows.length, 0); assert.strictEqual(r.effective, 0); }));
T('uy sarfi 0: qo\'shimcha to\'lov = qurilmaning o\'z to\'lovi', () => assert.strictEqual(incremental(0, 350, 'std').cost, 265000));
T('o\'rtacha narx: uy 400 + 180 oddiy = 178 000 / 180 = 988,9', () => assert.strictEqual(Math.round(incremental(400, 180, 'std').effective), 989));

// ---- saving(): quyosh paneli — panel eng qimmat pog'onadagi sarfni birinchi qoplaydi (qo'lda hisoblangan) ----
// [uy, panel, toifa, qoplangan, ortiqcha, to'lov oldin, keyin, tejash, [pog'ona ulushlari kVt·soat × narx]]
//  350/150 oddiy:   350 = 130 000 + 150×900 = 265 000; qoladi 200 = 130 000; tejash 135 000 (= 150×900); pog'ona 201–500
//  600/300 oddiy:   600 = 130 000 + 270 000 + 100×1100 = 510 000; qoladi 300 = 130 000 + 100×900 = 220 000; tejash 290 000 (= 200×900 + 100×1100)
//  200/400 oddiy:   200 = 130 000; qoladi 0; tejash 130 000 (= 200×650); ortiqcha 200
//  350/150 plitali: 350 = 65 000 + 150×450 = 132 500; qoladi 200 = 65 000; tejash 67 500 (= 150×450)
//  600/300 plitali: 600 = 65 000 + 135 000 + 100×550 = 255 000; qoladi 300 = 65 000 + 100×450 = 110 000; tejash 145 000 (= 200×450 + 100×550)
//  200/400 plitali: 200 = 65 000; qoladi 0; tejash 65 000 (= 200×325); ortiqcha 200
const SAV = [
  [350, 150, 'std',   150, 0,   265000, 130000, 135000, [[150, 900]]],
  [600, 300, 'std',   300, 0,   510000, 220000, 290000, [[200, 900], [100, 1100]]],
  [200, 400, 'std',   200, 200, 130000, 0,      130000, [[200, 650]]],
  [350, 150, 'stove', 150, 0,   132500, 65000,  67500,  [[150, 450]]],
  [600, 300, 'stove', 300, 0,   255000, 110000, 145000, [[200, 450], [100, 550]]],
  [200, 400, 'stove', 200, 200, 65000,  0,      65000,  [[200, 325]]]
];
const { saving } = require('../assets/elektr-tarif.js');
SAV.forEach(([h, g, c, cov, sur, before, after, save, parts]) => {
  T('quyosh: uy ' + h + ', panel ' + g + ' (' + c + '): oldin ' + before + ', keyin ' + after + ', tejash ' + save + (sur ? ', ortiqcha ' + sur : ''), () => {
    const r = saving(h, g, c);
    assert.strictEqual(r.covered, cov); assert.strictEqual(r.surplus, sur); assert.strictEqual(r.before, before); assert.strictEqual(r.after, after); assert.strictEqual(r.saving, save);
    assert.deepStrictEqual(r.rows.map((x) => [Math.round(x.kwh * 1e6) / 1e6, x.price]), parts);
    assert.ok(Math.abs(r.effective - save / cov) < 1e-9);
  });
});
T('quyosh: panel 0 yoki uy 0 — tejash 0, manfiy bo\'lmaydi', () => { [[350, 0], [0, 300], [350, -5], [-1, 100], [NaN, 100]].forEach(([h, g]) => { const r = saving(h, g, 'std'); assert.strictEqual(r.saving, 0); assert.ok(r.surplus >= 0); }); });
T('quyosh: tejash hech qachon uy to\'lovidan ko\'p emas va panel ko\'paysa kamaymaydi', () => {
  ['std', 'stove'].forEach((c) => [120, 350, 777, 1500].forEach((h) => { let prev = -1; for (let g = 0; g <= 2000; g += 25) { const r = saving(h, g, c); assert.ok(r.saving <= r.before && r.saving >= prev, c + ' ' + h + ' ' + g); prev = r.saving; } }));
});
T('quyosh: panel 1 kVt·soat o\'rtacha narxi eng qimmat pog\'ona narxidan oshmaydi', () => { const r = saving(600, 300, 'std'); assert.ok(r.effective <= 1100 && r.effective > 900); });

console.log(fail ? fail + ' ta yiqildi (jami ' + (pass + fail) + ')' : 'hammasi joyida (' + pass + ' ta)');
process.exit(fail ? 1 : 0);
