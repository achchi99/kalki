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

console.log(fail ? fail + ' ta yiqildi (jami ' + (pass + fail) + ')' : 'hammasi joyida (' + pass + ' ta)');
process.exit(fail ? 1 : 0);
