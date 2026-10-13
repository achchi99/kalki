/* kalki.uz — assets/gaz-tarif.js (pog'onali gaz tarifi, 2026-06-01) sinovi.
 *   node tools/test-gaz-tarif.js
 * Kutilgan qiymatlar QO'LDA hisoblangan (funksiyadan olinmagan):
 *   isitish mavsumi:  0–500 = 1 100 | 501–2 500 = 2 000 | 2 501–5 000 = 2 300 | 5 001–10 000 = 2 700 | 10 001+ = 3 300
 *   boshqa davr:      0–100 = 1 100 | 101–2 500 = 2 000 | 2 501–5 000 = 2 300 | 5 001–10 000 = 2 700 | 10 001+ = 3 300 */
'use strict';
const G = require('../assets/gaz-tarif.js');
let bad = 0;
const T = (ok, name, extra) => { if (!ok) bad++; console.log((ok ? 'OK   ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// [mavsum, m³, jami, qatorlar [m³, narx]]
const CASES = [
  ['heat', 300, 330000, [[300, 1100]]],                                                                                  // 300×1100
  ['heat', 800, 1150000, [[500, 1100], [300, 2000]]],                                                                    // 550 000 + 600 000
  ['heat', 6000, 13000000, [[500, 1100], [2000, 2000], [2500, 2300], [1000, 2700]]],                                     // 550 000 + 4 000 000 + 5 750 000 + 2 700 000
  ['other', 80, 88000, [[80, 1100]]],
  ['other', 150, 210000, [[100, 1100], [50, 2000]]],                                                                     // 110 000 + 100 000
  ['other', 3000, 6060000, [[100, 1100], [2400, 2000], [500, 2300]]],                                                    // 110 000 + 4 800 000 + 1 150 000
  // chegaralar
  ['heat', 500, 550000, [[500, 1100]]],
  ['heat', 501, 552000, [[500, 1100], [1, 2000]]],
  ['other', 100, 110000, [[100, 1100]]],
  ['other', 101, 112000, [[100, 1100], [1, 2000]]],
  ['heat', 2500, 4550000, [[500, 1100], [2000, 2000]]],                                                                  // 550 000 + 4 000 000
  ['heat', 2501, 4552300, [[500, 1100], [2000, 2000], [1, 2300]]],
  ['heat', 10001, 23803300, [[500, 1100], [2000, 2000], [2500, 2300], [5000, 2700], [1, 3300]]],                         // 550 000 + 4 000 000 + 5 750 000 + 13 500 000 + 3 300
  ['other', 10001, 24163300, [[100, 1100], [2400, 2000], [2500, 2300], [5000, 2700], [1, 3300]]],                        // 110 000 + 4 800 000 + 5 750 000 + 13 500 000 + 3 300
  ['heat', 0.5, 550, [[0.5, 1100]]]
];

for (const [season, m3, total, rows] of CASES) {
  const r = G.tiers(m3, season);
  T(r.total === total, season + ' ' + m3 + ' m³ → ' + total, 'chiqdi ' + r.total);
  T(same(r.rows.map((x) => [x.m3, x.price]), rows), season + ' ' + m3 + ' m³: pog\'ona qatorlari', JSON.stringify(r.rows.map((x) => [x.m3, x.price])));
  T(r.rows.reduce((s, x) => s + x.cost, 0) === r.total, season + ' ' + m3 + ' m³: qatorlar yig\'indisi jamiga teng');
}
T(G.tiers(0, 'heat').total === 0 && G.tiers(0, 'heat').rows.length === 0, '0 m³ → 0 so\'m, qator yo\'q');
T(G.tiers(-5, 'other').total === 0 && G.tiers('abc', 'other').total === 0, 'manfiy/noto\'g\'ri sarf → 0');
T(Math.abs(G.tiers(800, 'heat').effective - 1150000 / 800) < 1e-9, 'o\'rtacha narx = jami / m³ (1 437,5)');

// qaror jadvali bilan mos (raqamlar bitta manbada)
T(same(G.data.prices, [1100, 2000, 2300, 2700, 3300]), 'narxlar 1 100 / 2 000 / 2 300 / 2 700 / 3 300');
T(same(G.data.limits.heat.slice(0, 4), [500, 2500, 5000, 10000]) && same(G.data.limits.other.slice(0, 4), [100, 2500, 5000, 10000]), 'chegaralar: isitish 500…, boshqa 100…');
T(G.data.noMeter.cooking === 2000 && G.data.noMeter.heating === 1550, 'priborsiz (2.4): 2 000 va 1 550 (faqat ma\'lumot)');

// hisoblagich
T(G.meterUsage(12340, 12640).ok && G.meterUsage(12340, 12640).m3 === 300, 'hisoblagich 12 340 → 12 640 = 300 m³');
T(G.tiers(G.meterUsage(12340, 12640).m3, 'heat').total === 330000, 'hisoblagich 300 m³ isitishda = 330 000');
T(G.meterUsage(12640, 12340).ok === false && G.meterUsage(12640, 12340).error === 'less', 'hozirgi < oldingi → xato "less"');
T(G.meterUsage('', 100).error === 'invalid' && G.meterUsage('x', 1).error === 'invalid' && G.meterUsage(-1, 5).error === 'invalid', 'bo\'sh/noto\'g\'ri → xato "invalid"');
T(G.meterUsage(500, 500).ok && G.meterUsage(500, 500).m3 === 0, 'bir xil ko\'rsatkich = 0 m³ (xato emas)');
T(G.meterUsage(100.5, 250.75).m3 === 150.25, 'o\'nlik ko\'rsatkich: 250,75 − 100,5 = 150,25');

// pog'ona o'rni va keyingisiga qolgan
const p1 = G.position(300, 'heat');
T(p1.idx === 0 && p1.price === 1100 && p1.next.from === 501 && p1.next.price === 2000 && p1.next.left === 200, '300 m³ isitishda: 1-pog\'ona, keyingisiga 200 m³ qoldi');
const p2 = G.position(80, 'other');
T(p2.idx === 0 && p2.next.left === 20 && p2.next.from === 101, '80 m³ boshqa davrda: keyingisiga 20 m³ qoldi');
const p3 = G.position(800, 'heat');
T(p3.idx === 1 && p3.from === 501 && p3.to === 2500 && p3.next.left === 1700 && p3.next.price === 2300, '800 m³ isitishda: 2-pog\'ona, keyingisiga 1 700 m³');
const p4 = G.position(20000, 'heat');
T(p4.idx === 4 && p4.next === null, '20 000 m³: oxirgi pog\'ona, keyingisi yo\'q');
T(G.position(500, 'heat').idx === 0 && G.position(501, 'heat').idx === 1 && G.position(100, 'other').idx === 0 && G.position(101, 'other').idx === 1, 'chegara sarflari to\'g\'ri pog\'onaga tushadi');

// mavsum taxmini (204-son, 2-ilova)
const heatMain = [11, 12, 1, 2], otherMain = [3, 4, 5, 6, 7, 8, 9, 10];
T(heatMain.every((m) => G.seasonForMonth(m) === 'heat') && otherMain.every((m) => G.seasonForMonth(m) === 'other'), 'asosiy hududlar: noyabr–fevral isitish, mart–oktabr boshqa');
T(G.seasonForMonth(10, 'qqXorazm') === 'heat' && G.seasonForMonth(3, 'qqXorazm') === 'other', 'Qoraqalpog\'iston/Xorazm: oktabr ham isitish');

// monotonlik: sarf ko'paysa to'lov kamaymaydi; isitishda boshqa davrdan arzon yoki teng emas — 1-pog'ona keng
let mono = true;
for (const s of ['heat', 'other']) { let prev = 0; for (let m = 0; m <= 12000; m += 37) { const t = G.tiers(m, s).total; if (t < prev) mono = false; prev = t; } }
T(mono, 'sarf ko\'paysa to\'lov kamaymaydi (ikkala mavsum)');
let heatLE = true;
for (let m = 0; m <= 12000; m += 53) if (G.tiers(m, 'heat').total > G.tiers(m, 'other').total) heatLE = false;
T(heatLE, 'bir xil sarfda isitish mavsumi boshqa davrdan qimmat emas (1-pog\'ona kengroq)');

console.log('\n' + (bad ? bad + ' ta tekshiruv yiqildi' : 'hammasi joyida'));
process.exit(bad ? 1 : 0);
