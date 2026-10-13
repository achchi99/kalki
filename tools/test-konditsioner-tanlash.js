/* kalki.uz — assets/konditsioner.js (sinf tanlash) sinovi.
 *   node tools/test-konditsioner-tanlash.js
 * Qoidalar: (1) tavsiya hech qachon kerakli quvvatdan kichik emas; (2) bitta sinf yetsa — eng kichik yetarlisi;
 * (3) eng katta sinfdan (7,0 kW) oshsa — eng kam sonli birliklar, jami >= kerakli va shu sondagi birliklar orasida eng kichigi.
 * Kutilgan qiymatlar QO'LDA (sinflar: 7 = 2,1 | 9 = 2,6 | 12 = 3,5 | 18 = 5,2 | 24 = 7,0 kW), 2-qism esa
 * ALOHIDA yozilgan to'liq qidiruv (oracle) bilan solishtiriladi. */
'use strict';
const assert = require('assert');
const K = require('../assets/konditsioner.js');

let pass = 0, fail = 0;
function T(name, fn) { try { fn(); pass++; console.log('OK   ' + name); } catch (e) { fail++; console.log('FAIL ' + name + ' — ' + e.message.split('\n')[0]); } }
const names = (r) => r.units.map((u) => u.name);

// [kerakli kW, kutilgan birliklar, kutilgan jami kW] — qo'lda:
//  2,0  -> 2,1 >= 2,0: "7"                      | 3,6 -> 3,5 < 3,6 <= 5,2: "18" (12 yetmaydi)
//  7,0  -> 7,0 >= 7,0: "24"                     | 11,1 -> bitta 7,0 yetmaydi; 2 ta: 24+12 = 10,5 < 11,1, 24+18 = 12,2 >= 11,1  => 24 + 18
//  15   -> 2 ta eng ko'pi 14,0 < 15 => 3 ta; 18+18+18 = 15,6 (24+18+12 = 15,7; 24+18+9 = 14,8 yetmaydi) => 3 × 18
//  7,1  -> 2 ta: 18+7 = 7,3 >= 7,1 (kichigi)    | 14 -> 24+24 = 14,0 (aniq)
const CASES = [
  [2.0, ['7'], 2.1], [3.6, ['18'], 5.2], [7.0, ['24'], 7.0], [11.1, ['24', '18'], 12.2], [15, ['18', '18', '18'], 15.6],
  [2.1, ['7'], 2.1], [2.2, ['9'], 2.6], [3.5, ['12'], 3.5], [5.2, ['18'], 5.2], [5.21, ['24'], 7.0],
  [7.01, ['18', '7'], 7.3], [7.1, ['18', '7'], 7.3], [14, ['24', '24'], 14.0], [14.01, ['24', '18', '7'], 14.3]
];
CASES.forEach(([need, units, total]) => T(need + ' kW -> ' + units.join(' + ') + ' (' + total + ' kW)', () => {
  const r = K.recommend(need);
  assert.deepStrictEqual(names(r), units); assert.strictEqual(r.totalKw, total); assert.strictEqual(r.count, units.length);
  assert.strictEqual(r.multi, units.length > 1);
}));

// ---- mustaqil oracle: n ta birlik orasida yig'indisi >= kerakli bo'lgan eng kichigi ----
const KW = K.classes.map((c) => Math.round(c.kw * 10));          // [21, 26, 35, 52, 70]
function oracle(needKw) {
  const needT = Math.ceil(needKw * 10 - 1e-9);
  for (let n = 1; n <= 40; n++) {
    if (n * KW[KW.length - 1] < needT) continue;                  // n ta eng kattasi ham yetmaydi — n kam
    let best = Infinity;
    const walk = (i, left, sum) => {
      if (i === KW.length) { if (left === 0 && sum >= needT && sum < best) best = sum; return; }
      for (let c = 0; c <= left; c++) walk(i + 1, left - c, sum + c * KW[i]);
    };
    walk(0, n, 0);
    if (best < Infinity) return { n, total: best / 10 };
  }
  return null;
}
T('0,1 dan 80 kW gacha (0,1 qadam): tavsiya hech qachon kerakli quvvatdan kichik emas', () => {
  for (let t = 1; t <= 800; t++) { const need = t / 10; const r = K.recommend(need); assert.ok(r.totalKw >= need - 1e-9, need + ' kW uchun jami ' + r.totalKw); }
});
T('0,1 dan 80 kW gacha: birliklar soni va jami quvvat mustaqil qidiruv (oracle) bilan bir xil', () => {
  for (let t = 1; t <= 800; t++) { const need = t / 10; const r = K.recommend(need), o = oracle(need);
    assert.strictEqual(r.count, o.n, need + ' kW: birliklar soni'); assert.strictEqual(r.totalKw, o.total, need + ' kW: jami'); }
});
T('bitta sinf yetsa — faqat bitta va u eng kichik yetarlisi', () => {
  for (let t = 1; t <= 70; t++) { const need = t / 10; const r = K.recommend(need);
    assert.strictEqual(r.count, 1, need); const smaller = K.classes.filter((c) => Math.round(c.kw * 10) < Math.round(r.totalKw * 10));
    assert.ok(smaller.every((c) => Math.round(c.kw * 10) < Math.ceil(need * 10 - 1e-9)), need + ': kichikroq sinf yetardi'); }
});
T('7,0 kW dan oshganda har doim 2 ta yoki ko\'p (bitta emas)', () => { for (let t = 71; t <= 400; t++) assert.ok(K.recommend(t / 10).multi, String(t / 10)); });
T('birliklar kattadan kichikka tartiblangan', () => { [11.1, 15, 25, 50].forEach((n) => { const q = K.recommend(n).units.map((u) => u.kw); assert.deepStrictEqual(q, q.slice().sort((a, b) => b - a)); }); });
T('describe: "24 + 18", "2 × 24", "3 × 18", "7"', () => {
  assert.strictEqual(K.describe(K.recommend(11.1).units), '24 + 18'); assert.strictEqual(K.describe(K.recommend(14).units), '2 × 24');
  assert.strictEqual(K.describe(K.recommend(15).units), '3 × 18'); assert.strictEqual(K.describe(K.recommend(2).units), '7');
});
T('0 yoki manfiy kerakli quvvat: eng kichik sinf, xato yo\'q', () => [0, -1, NaN, undefined].forEach((n) => assert.deepStrictEqual(names(K.recommend(n)), ['7'])));
T('juda katta quvvat (400 kW): 40 dan ko\'p birlik — eng katta sinfdan n ta, jami yetarli', () => { const r = K.recommend(400); assert.ok(r.totalKw >= 400); assert.ok(r.units.every((u) => u.name === '24')); });

console.log(fail ? fail + ' ta yiqildi (jami ' + (pass + fail) + ')' : 'hammasi joyida (' + pass + ' ta)');
process.exit(fail ? 1 : 0);
