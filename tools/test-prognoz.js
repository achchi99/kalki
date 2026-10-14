/* kalki.uz — assets/prognoz.js sof hisobi (oy oxiri prognozi) sinovi.   node tools/test-prognoz.js
 * Kutilgan qiymatlar QO'LDA hisoblangan (funksiyadan olinmagan). Bugungi sana qat'iy beriladi.
 *
 * Elektr, oddiy toifa, hisob kuni 1, oktabr (31 kun). Tarif: 0–200 = 650 | 201–500 = 900 | 501–1000 = 1100 (elektr plitali: 325 / 450 / 550)
 *  1) 01.10 = 10 000, 11.10 = 10 150, bugun 11.10: shu paytgacha 150, o'tgan 10 kun, sur'at 15, qolgan 21, prognoz 150 + 15×21 = 465,
 *     summa 130 000 + 265×900 = 368 500; chegara 200 → sana 11.10 + ceil(50/15 = 3,33) = 4 kun → 15.10;
 *     kamaytirish = 15 − 50/21 = 12,62 (> 7,5 = 50%) → maslahat YO'Q; 2-pog'ona.
 *  2) 01.10 = 20 000, 16.10 = 20 300, bugun 16.10: shu paytgacha 300, o'tgan 15, sur'at 20, qolgan 16, prognoz 300 + 320 = 620,
 *     summa 130 000 + 270 000 + 120×1 100 = 532 000; chegara 500 → 16.10 + ceil(200/20 = 10) = 26.10;
 *     kamaytirish = 20 − 200/16 = 7,5 (37,5%) → maslahat: tejash 532 000 − 400 000 = 132 000.
 *  3) shu 2-holat elektr plitali: 65 000 + 135 000 + 120×550 = 266 000; tejash 266 000 − 200 000 = 66 000.
 * Gaz, isitish mavsumi, noyabr (30 kun). Tarif: 0–500 = 1 100 | 501–2 500 = 2 000
 *  4) 01.11 = 5 000, 11.11 = 5 200, bugun 11.11: shu paytgacha 200, o'tgan 10, sur'at 20, qolgan 20, prognoz 600,
 *     summa 500×1 100 + 100×2 000 = 750 000; chegara 500 → 11.11 + ceil(300/20 = 15) = 26.11; kamaytirish = 20 − 300/20 = 5 (25%) → tejash 750 000 − 550 000 = 200 000.
 *  5) bitta yozuv → "yana bitta ko'rsatkich".  6) kamaygan ko'rsatkich → xato, saqlanmaydi.
 *  7) 25.09 = 9 900, 05.10 = 10 000, 15.10 = 10 200, bugun 15.10: 01.10 dagi qiymat 9 900 + 100×6/10 = 9 960; shu paytgacha 240; o'tgan 14 kun. */
'use strict';
const P = require('../assets/prognoz.js');
const E = require('../assets/elektr-tarif.js');
const G = require('../assets/gaz-tarif.js');
let bad = 0;
const T = (ok, name, extra) => { if (!ok) bad++; console.log((ok ? 'OK   ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); };
const near = (a, b, e) => Math.abs(a - b) <= (e || 1e-9);
const elektr = (cat) => ({ tiers: (q) => E.tiers(q, cat), limits: E.data.limits });
const gaz = (s) => ({ tiers: (q) => G.tiers(q, s), limits: G.data.limits[s] });

// ---- 1
let f = P.forecast(Object.assign({ entries: [{ d: '2026-10-01', v: 10000 }, { d: '2026-10-11', v: 10150 }], today: '2026-10-11', billDay: 1 }, elektr('std')));
T(f.ok && f.used === 150 && f.elapsed === 10 && f.rate === 15 && f.remaining === 21 && f.period.len === 31, '1) elektr: shu paytgacha 150, sur\'at 15/kun, qolgan 21 kun', JSON.stringify([f.used, f.elapsed, f.rate, f.remaining, f.period.len]));
T(near(f.projected, 465) && f.total === 368500, '1) prognoz 465 kVt-soat, summa 368 500', f.projected + ' / ' + f.total);
T(f.cross && f.cross.limit === 200 && f.cross.date === '2026-10-15' && f.cross.daysAhead === 4 && f.cross.idx === 1, '1) chegara 200 → 15.10', JSON.stringify(f.cross));
T(f.advice === null && f.tier === 2, '1) kerakli kamaytirish 12,62 > 50% → maslahat yo\'q; 2-pog\'ona', JSON.stringify(f.advice) + ' tier ' + f.tier);
T(near(f.avg, 368500 / 465, 1e-9), '1) 1 kVt-soat o\'rtacha narxi = jami / sarf');
// ---- 2
f = P.forecast(Object.assign({ entries: [{ d: '2026-10-01', v: 20000 }, { d: '2026-10-16', v: 20300 }], today: '2026-10-16', billDay: 1 }, elektr('std')));
T(f.used === 300 && f.elapsed === 15 && f.rate === 20 && f.remaining === 16 && near(f.projected, 620) && f.total === 532000, '2) elektr: 300 / 20 kunlik / qolgan 16 / prognoz 620 / summa 532 000', JSON.stringify([f.used, f.rate, f.remaining, f.projected, f.total]));
T(f.cross && f.cross.limit === 500 && f.cross.date === '2026-10-26' && f.cross.daysAhead === 10, '2) chegara 500 → 26.10', JSON.stringify(f.cross));
T(f.advice && near(f.advice.cut, 7.5) && f.advice.save === 132000 && f.tier === 3, '2) maslahat: kuniga 7,5 kamaytirsangiz 132 000 so\'m tejaysiz', JSON.stringify(f.advice));
// ---- 3
f = P.forecast(Object.assign({ entries: [{ d: '2026-10-01', v: 20000 }, { d: '2026-10-16', v: 20300 }], today: '2026-10-16', billDay: 1 }, elektr('stove')));
T(f.total === 266000 && f.advice && f.advice.save === 66000 && near(f.advice.cut, 7.5), '3) elektr plitali: summa 266 000, tejash 66 000', JSON.stringify([f.total, f.advice]));
// ---- 4
f = P.forecast(Object.assign({ entries: [{ d: '2026-11-01', v: 5000 }, { d: '2026-11-11', v: 5200 }], today: '2026-11-11', billDay: 1 }, gaz('heat')));
T(f.used === 200 && f.rate === 20 && f.remaining === 20 && f.period.len === 30 && near(f.projected, 600) && f.total === 750000, '4) gaz isitish: 200 / 20 / qolgan 20 / prognoz 600 / summa 750 000', JSON.stringify([f.used, f.rate, f.remaining, f.projected, f.total]));
T(f.cross && f.cross.limit === 500 && f.cross.date === '2026-11-26' && f.advice && near(f.advice.cut, 5) && f.advice.save === 200000, '4) chegara 500 → 26.11; kuniga 5 m³ kamaytirsangiz 200 000 so\'m tejaysiz', JSON.stringify([f.cross, f.advice]));
// ---- 5
f = P.forecast(Object.assign({ entries: [{ d: '2026-10-05', v: 10100 }], today: '2026-10-11', billDay: 1 }, elektr('std')));
T(f.ok === false && f.reason === 'few', '5) bitta yozuv → "yana bitta ko\'rsatkich"');
f = P.forecast(Object.assign({ entries: [{ d: '2026-10-01', v: 10000 }], today: '2026-10-11', billDay: 1 }, elektr('std')));
T(f.ok === false, '5) faqat davr boshidagi yozuv ham yetmaydi (o\'tgan kun 0)');
f = P.forecast(Object.assign({ entries: [], today: '2026-10-11', billDay: 1 }, elektr('std')));
T(f.ok === false, '5) yozuv yo\'q → prognoz yo\'q');
// ---- 6
const ent = [{ d: '2026-10-01', v: 10000 }, { d: '2026-10-11', v: 10150 }];
T(P.validate(ent, '2026-10-12', '2026-10-12', 10100) === 'less', '6) kamaygan ko\'rsatkich (10 100 < 10 150) → xato "less"');
T(P.validate(ent, '2026-10-12', '2026-10-05', 10200) === 'less', '6) oldingi sanaga keyingisidan katta qiymat → xato');
T(P.validate(ent, '2026-10-12', '2026-10-13', 10200) === 'future', '6) kelajak sana → xato "future"');
T(P.validate(ent, '2026-10-12', '2026-10-11', 10150) === null && P.validate(ent, '2026-10-12', '2026-10-11', 10200) === null, '6) shu sanaga ikkinchi yozuv eskisini almashtiradi (xato emas)');
T(P.validate(ent, '2026-10-12', '2026-10-12', 'x') === 'invalid' && P.validate(ent, '2026-10-12', '2026-13-40', 5) === 'invalid', '6) noto\'g\'ri qiymat/sana → "invalid"');
// ---- 7
f = P.forecast(Object.assign({ entries: [{ d: '2026-09-25', v: 9900 }, { d: '2026-10-05', v: 10000 }, { d: '2026-10-15', v: 10200 }], today: '2026-10-15', billDay: 1 }, elektr('std')));
T(near(f.startVal, 9960) && f.used === 240 && f.elapsed === 14 && f.interpolated && !f.approx, '7) davr boshi interpolyatsiya: 9 960, shu paytgacha 240, o\'tgan 14 kun', JSON.stringify([f.startVal, f.used, f.elapsed]));
// taxminiy: davr boshidan oldingi yozuv yo'q, birinchi yozuv davr ichida
f = P.forecast(Object.assign({ entries: [{ d: '2026-10-06', v: 10100 }, { d: '2026-10-16', v: 10250 }], today: '2026-10-16', billDay: 1 }, elektr('std')));
T(f.ok && f.approx && f.measured === 150 && f.unknownDays === 5 && near(f.used, 225) && f.elapsed === 10 && near(f.rate, 15) && near(f.projected, 465), '7b) boshlang\'ich = davr ichidagi birinchi yozuv ("taxminiy"): o\'lchangan 150 + davr boshigacha 5 kun × 15 = shu paytgacha ≈225; qolgan 31−15 = 16 kun → prognoz 225 + 15×16 = 465', JSON.stringify([f.approx, f.measured, f.used, f.rate, f.projected]));
// ---- TELEFONDAGI HOLAT (Asia/Tashkent): hisob kuni 1; 01.10 = 10 000, 14.10 = 10 260; bugun 14.10 (barcha vaqt zonalarida bir xil)
// shu paytgacha 260, o'tgan 13 kun, sur'at 20, qolgan 31 − 13 = 18; prognoz 260 + 20×18 = 620; summa 130 000 + 270 000 + 120×1 100 = 532 000;
// chegara 500: 14.10 + ceil(240/20 = 12) = 26.10; kamaytirish = 20 − 240/18 = 6,667 (≤ 10 = 50%) → tejash 532 000 − 400 000 = 132 000
f = P.forecast(Object.assign({ entries: [{ d: '2026-10-01', v: 10000 }, { d: '2026-10-14', v: 10260 }], today: '2026-10-14', billDay: 1 }, elektr('std')));
T(f.ok && f.period.start === '2026-10-01' && f.period.end === '2026-11-01' && f.period.len === 31 && f.used === 260 && f.elapsed === 13 && f.remaining === 18 && f.rate === 20 && near(f.projected, 620) && f.total === 532000, 'telefon: davr 1-oktabr – 31-oktabr (31 kun), 260 / 13 kun / qolgan 18 / prognoz 620 / summa 532 000', JSON.stringify([f.period, f.used, f.elapsed, f.remaining, f.total]));
T(f.cross && f.cross.date === '2026-10-26' && f.advice && near(f.advice.cut, 6.6667, 1e-3) && f.advice.save === 132000, 'telefon: 26-oktabrda qimmat pog\'ona; kuniga 6,7 kVt-soat kamaytirsangiz 132 000 tejaysiz', JSON.stringify([f.cross, f.advice]));
// hisob kuni 30 bo'lsa (yashirin eski sozlama) — aynan shu "30-sentabr – 29-oktabr" va 462 857 chiqadi: bu vaqt zonasi emas, hisob kuni natijasi
f = P.forecast(Object.assign({ entries: [{ d: '2026-09-30', v: 10000 }, { d: '2026-10-14', v: 10260 }], today: '2026-10-14', billDay: 30 }, elektr('std')));
T(f.period.start === '2026-09-30' && f.period.end === '2026-10-30' && f.period.len === 30 && f.total === 462857, 'hisob kuni 30: davr 30-sentabr – 29-oktabr (30 kun), summa 462 857 (hisob kunining natijasi)', JSON.stringify([f.period, f.total]));
// ---- kalendar arifmetikasi (Date/UTC'siz): kunlar soni, oy oxirlari, kabisa yili, yil chegarasi
T(P.diff('2026-10-01', '2026-11-01') === 31 && P.diff('2026-02-01', '2026-03-01') === 28 && P.diff('2028-02-01', '2028-03-01') === 29 && P.diff('2026-12-31', '2027-01-01') === 1 && P.diff('1999-12-31', '2000-03-01') === 61, 'kunlar soni: oktabr 31, fevral 28/29, yil chegarasi, 2000 (kabisa)');
T(P.addDays('2026-10-14', 12) === '2026-10-26' && P.addDays('2026-10-31', 1) === '2026-11-01' && P.addDays('2026-03-01', -1) === '2026-02-28' && P.addDays('2028-03-01', -1) === '2028-02-29' && P.addDays('2026-01-01', -1) === '2025-12-31', 'addDays: oy/yil chegaralari');
let rt = true; for (let n = -800; n <= 40000; n += 7) { const d = P.addDays('2000-01-01', n); if (P.diff('2000-01-01', d) !== n || !P.parse(d)) rt = false; }
T(rt, 'addDays/diff aylanma tekshiruv (−800 … +40 000 kun, har 7 kun)');
T(P.parse('2026-02-29') === null && P.parse('2028-02-29') !== null && P.parse('2026-13-01') === null && P.parse('2026-1-1') === null, 'sanani tekshirish: 29-fevral faqat kabisa yilida');
// ---- hisob kunini 30 ga o'zgartirish natijani qayta hisoblaydi (davr boshida yozuv yo'q → taxminiy): 01.10 = 10 000, 14.10 = 10 260, bugun 14.10
// davr 30.09–30.10 (30 kun); birinchi yozuv 01.10: o'lchangan 260 (13 kun, sur'at 20), davr boshigacha 1 kun × 20 → shu paytgacha ≈280;
// o'tgan 14 kun, qolgan 30 − 14 = 16 → prognoz 280 + 20×16 = 600; summa 130 000 + 270 000 + 100×1 100 = 510 000
f = P.forecast(Object.assign({ entries: [{ d: '2026-10-01', v: 10000 }, { d: '2026-10-14', v: 10260 }], today: '2026-10-14', billDay: 30 }, elektr('std')));
T(f.ok && f.approx && f.measured === 260 && near(f.used, 280) && f.remaining === 16 && near(f.projected, 600) && f.total === 510000, 'hisob kuni 30 (davr boshida yozuv yo\'q): shu paytgacha ≈280 (taxminiy), prognoz 600, summa 510 000', JSON.stringify([f.approx, f.measured, f.used, f.remaining, f.projected, f.total]));
f = P.forecast(Object.assign({ entries: [{ d: '2026-10-01', v: 10000 }, { d: '2026-10-14', v: 10260 }], today: '2026-10-14', billDay: 1 }, elektr('std')));
T(!f.approx && f.used === 260 && f.total === 532000, 'hisob kuni 1 ga qaytgach: aniq 260 (taxminiy emas), summa 532 000');
// ---- hisob kuni
let per = P.periodOf('2026-10-11', 15, 0);
T(per.start === '2026-09-15' && per.end === '2026-10-15' && per.len === 30, 'hisob kuni 15, bugun 11.10 → davr 15.09–15.10 (30 kun)', JSON.stringify(per));
per = P.periodOf('2026-10-20', 15, 0);
T(per.start === '2026-10-15' && per.end === '2026-11-15' && per.len === 31, 'hisob kuni 15, bugun 20.10 → davr 15.10–15.11 (31 kun)');
per = P.periodOf('2026-03-05', 31, 0);
T(per.start === '2026-02-28' && per.end === '2026-03-31' && per.len === 31, 'hisob kuni 31, bugun 05.03 → davr fevralning oxirgi kunidan (28.02) 31.03 gacha');
T(P.periodOf('2026-02-10', 1, 0).len === 28 && P.periodOf('2028-02-10', 1, 0).len === 29, 'fevral 28 / kabisa yilida 29 kun');
// ---- o'tgan davrlar (qo'lda): 01.08 = 1000, 01.09 = 1200 (avgust 200), 01.10 = 1500 (sentabr 300), bugun 15.10
const pp = P.pastPeriods(Object.assign({ entries: [{ d: '2026-08-01', v: 1000 }, { d: '2026-09-01', v: 1200 }, { d: '2026-10-01', v: 1500 }, { d: '2026-10-15', v: 1600 }], today: '2026-10-15', billDay: 1 }, elektr('std')), 6);
T(pp.length === 2 && pp[0].start === '2026-09-01' && pp[0].used === 300 && pp[0].total === 130000 + 100 * 900 && pp[1].used === 200 && pp[1].total === 130000 && near(pp[0].pct, 50), 'o\'tgan davrlar: sentabr 300 (220 000, +50%), avgust 200 (130 000)', JSON.stringify(pp.map((p) => [p.start, p.used, p.total, p.pct])));
// ---- nolinchi sur'at
f = P.forecast(Object.assign({ entries: [{ d: '2026-10-01', v: 100 }, { d: '2026-10-11', v: 100 }], today: '2026-10-11', billDay: 1 }, elektr('std')));
T(f.ok && f.rate === 0 && f.total === 0 && f.cross === null && f.advice === null, 'sarf yo\'q: sur\'at 0, summa 0, chegara/maslahat yo\'q');
// ---- allaqachon o'tilgan chegara uchun maslahat yo'q
f = P.forecast(Object.assign({ entries: [{ d: '2026-10-01', v: 0 }, { d: '2026-10-10', v: 360 }], today: '2026-10-10', billDay: 1 }, elektr('std')));
T(f.used === 360 && f.cross && f.cross.limit === 500, 'o\'tilgan chegara (200) hisobga olinmaydi, keyingisi 500', JSON.stringify(f.cross));
console.log('\n' + (bad ? bad + ' ta tekshiruv yiqildi' : 'hammasi joyida'));
process.exit(bad ? 1 : 0);
