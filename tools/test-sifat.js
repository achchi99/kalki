/* v103: OVQATLANISH SIFATI — bal formulasi chegaralari, haftalik xulosa (vazn tarkibi diapazoni), shaxsiy naqshlar (≥ 14 kun, statistik shart), takroriy taom va muqobillar,
 * maslahatchi matnlari (uz/ru × hazil/jiddiy) va TAQIQLANGAN vazn da'volari («yog' tufayli X kg kam ozdingiz» turidagi gaplar YO'Q).   node tools/test-sifat.js */
'use strict';
const assert = require('assert'); const path = require('path');
const Q = require('../assets/kalkifit-sifat.js'), MS = require('../assets/kalkifit-maslahat.js'), S = require('../assets/kalkifit-core.js'); const D = S.dates;
const foods = S.buildIndex(S.normFoods(require('../data/ovqatlar.json').foods)); const by = Object.fromEntries(foods.map((f) => [f.id, f]));
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const base = { kcal: 1800, p: 120, f: 60, c: 200, fb: { g: 28, unk: 0, n: 5 }, fbGoal: 28, meals: 3, n: 5, lim: 1800, floor: 1200, gp: 120, gf: 60 };
const B = (o) => Q.kun(Object.assign({}, base, o)); const part = (r, k) => r.parts.find((p) => p.k === k).o;
/* 1. kunlik bal chegaralari */
assert.equal(B({}).ball, 100); assert.equal(B({ p: 200 }).ball, 100, 'oqsil oshishi — jarima emas'); assert.equal(part(B({ p: 60 }), 'p'), 15);
assert.equal(part(B({ f: 69 }), 'f'), 20, '115 % — to\'liq'); assert.equal(part(B({ f: 96 }), 'f'), 0, '160 % — 0'); assert.ok(Math.abs(part(B({ f: 82.5 }), 'f') - 10) < 0.2, '137,5 % — yarmi'); assert.equal(part(B({ f: 15 }), 'f'), 10, '25 % (juda kam) — 10');
assert.equal(part(B({ kcal: 1980 }), 'kcal'), 20, '+10 % — to\'liq'); assert.equal(part(B({ kcal: 2430 }), 'kcal'), 0, '+35 % — 0'); assert.ok(part(B({ kcal: 1100 }), 'kcal') <= 5, 'xavfsiz minimumdan kam — ≤ 5');
assert.equal(part(B({ meals: 2 }), 'mun'), 6); assert.equal(part(B({ meals: 1 }), 'mun'), 3); assert.equal(part(B({ fb: { g: 14, unk: 0, n: 4 } }), 'fb'), 10);
const off = B({ fb: { g: 0, unk: 3, n: 4 } }); assert.equal(off.fbOff, true); assert.equal(part(off, 'fb'), null); assert.equal(off.ball, 100, 'kletchatka noma\'lum — qolganlari 100 ga keltiriladi');
assert.equal(Q.kun({ n: 0 }).ball, null, 'bo\'sh kun — bal yo\'q'); assert.equal(B({ kcal: 500, n: 1 }).full, false); assert.equal(B({}).full, true);
const worst = B({ p: 0, f: 200, fb: { g: 0, unk: 0, n: 3 }, kcal: 3000, meals: 1 }); assert.ok(worst.ball <= 5 && worst.ball >= 0, 'yomon kun: ' + worst.ball);
assert.equal(Q.hafta([base, Object.assign({}, base, { p: 60 }), Object.assign({}, base, { kcal: 300, n: 1 })]).n, 2, 'haftalik — faqat to\'liq kunlar');
ok('Kunlik bal: ideal 100; oqsil oshishi jarima emas; yog\' 115 % → 20, 160 % → 0; kaloriya ±10 % → 20, 35 % → 0, minimumdan kam ≤ 5; muntazamlik 10/6/3; kletchatka noma\'lum — qayta normallanadi; haftalik — to\'liq kunlar');
/* 2. haftalik xulosa */
const T0 = '2026-11-20', A = D.addDays, wk = (o) => Array.from({ length: 7 }, (_, i) => Object.assign({ d: A(T0, -6 + i) }, base, o));
/* v104: vazn — 14+ kunlik TREND (regressiya), haftalik farq emas */
const lin = (from, to, days, noise) => Array.from({ length: days }, (_, i) => ({ d: A(T0, -(days - 1) + i), kg: Math.round((from + (to - from) * i / (days - 1) + (noise ? noise(i) : 0)) * 10) / 10 }));
const keys = (X) => X.keys.map((k) => k.k); const pd = (n, lowFirst) => Array.from({ length: n }, (_, i) => Object.assign({ d: A(T0, -(n - 1) + i) }, base, i < lowFirst ? { p: 70 } : {}));
const opt = (w, o) => Object.assign({ weights: w, end: T0, addDays: A }, o || {});
// kam ma'lumot
assert.deepEqual(keys(Q.xulosa(wk({}), opt([]))), ['sw_ok', 'sw_tarkib_ok', 'sw_now'], 'vazn yo\'q');
assert.deepEqual(keys(Q.xulosa(wk({}), opt([{ d: A(T0, -20), kg: 91 }, { d: A(T0, -10), kg: 90 }, { d: T0, kg: 88 }]))), ['sw_ok', 'sw_tarkib_ok', 'sw_kam', 'sw_suv'], '3 yozuv — trend yo\'q (−3 kg bo\'lsa ham)');
assert.deepEqual(keys(Q.xulosa(wk({}), opt(lin(91, 88, 10)))), ['sw_ok', 'sw_tarkib_ok', 'sw_kam', 'sw_suv'], '10 kun (< 14) — trend yo\'q');
assert.deepEqual(keys(Q.xulosa(wk({}), opt([{ d: A(T0, -40), kg: 95 }, { d: A(T0, -35), kg: 94 }, { d: A(T0, -13), kg: 90 }, { d: T0, kg: 89 }]))), ['sw_ok', 'sw_tarkib_ok', 'sw_kam', 'sw_suv'], '28 kundan eski yozuvlar hisobga olinmaydi');
// shovqin: ±1 kg tebranish, trend 0 — eski haftalik usul (shu hafta 89,x vs o'tgan 90,x) mushak taxminini chiqarardi
const zz = (i) => [1, -1, 0.6, -0.8, 0.9, -1, 0.3][i % 7];
const noisy = lin(90, 90, 28, (i) => zz(i) + (i >= 21 || i < 7 ? -0.9 : 0.5));          // 1- va oxirgi hafta past (suv): haftalik farq −1,4 kg, trend ≈ 0
const N1 = Q.xulosa(wk({ p: 70 }), opt(noisy)); assert.ok(Math.abs(N1.tr.dw) < 0.5, 'shovqin trendi ' + N1.tr.dw); assert.deepEqual(keys(N1).slice(2), ['sw_flat', 'sw_suv']); assert.equal(N1.mus, null, 'shovqinda mushak taxmini YO\'Q');
const sin = lin(90, 90, 28, (i) => Math.sin(i * 2.4) * 1); const N2 = Q.xulosa(wk({}), opt(sin)); assert.ok(Math.abs(N2.tr.dw) < 0.5, 'sinus ' + N2.tr.dw); assert.equal(keys(N2)[2], 'sw_flat');
// haqiqiy trend: 21 kunda −1,4 kg (±0,6 shovqin); oqsil 3 haftaning 2 tasida kam, oxirgi haftada me'yorda → trend davri bo'yicha ≥ 50 % → sw_mus
const real = lin(90, 88.6, 22, (i) => [0.6, -0.4, 0.2, -0.6, 0.3, 0, -0.2][i % 7]);
const R = Q.xulosa(wk({}), opt(real, { trendDays: pd(22, 15) })); assert.ok(R.tr.dw < -1.1 && R.tr.dw > -1.7, 'trend ' + R.tr.dw); assert.equal(keys(R)[2], 'sw_mus', 'oqsil ulushi trend davri bo\'yicha (bitta hafta emas)'); assert.deepEqual(R.pT, { k: 15, n: 22 });
assert.equal(keys(Q.xulosa(wk({}), opt(real, { trendDays: pd(22, 0) })))[2], 'sw_mus_ok'); assert.equal(keys(Q.xulosa(wk({ p: 70 }), opt(real, { trendDays: pd(22, 5) })))[2], 'sw_mus_ok', 'shu hafta oqsil kam, lekin trend davrida ozchilik');
// yaxlitlash: 0,1 kg; 0,1 dan kami — «juda oz»; 0,06 kabi soxta aniqlik yo'q
const R6 = Q.xulosa(wk({}), opt(lin(90, 89.4, 21), { trendDays: pd(21, 0) })); assert.equal(R6.keys[2].d.cd, 'juda oz'); assert.equal(R6.keys[2].d.dw, '0,6');
assert.equal(Q.xulosa(wk({}), opt(lin(90, 89.4, 21), { trendDays: pd(21, 21), lang: 'ru' })).keys[2].d.cd, 'совсем немного');
assert.equal(Q.diap(0.08, 0.12, 'uz'), '0,1 kg gacha'); assert.equal(Q.diap(0.08, 0.12, 'ru'), 'до 0,1 кг'); assert.equal(Q.diap(0.25, 0.3, 'uz'), '0,3 kg'.replace('0,3', '~0,3')); assert.equal(Q.diap(0.2, 0.36, 'ru'), '0,2–0,4 кг'); assert.equal(Q.diap(0.05, 0.075, 'uz'), 'juda oz');
assert.equal(Q.xulosa(wk({}), opt(lin(90, 89.6, 21))).keys[2].k, 'sw_flat', '−0,4 kg trend (< 0,5) — faqat umumiy');
for (let L = 0.5; L <= 3; L += 0.05) for (const pl of [0, 21]) { const X = Q.xulosa(wk({}), opt(lin(90, 90 - L, 21), { trendDays: pd(21, pl), lang: 'uz' })); const s = JSON.stringify(X.keys); assert.ok(!/\d,\d\d/.test(s), 'soxta aniqlik: ' + s); }
ok('Vazn trendi (≥ 4 yozuv, ≥ 14 kun, 28 kunlik oyna, regressiya): kam ma\'lumot → sw_kam; ±1 kg shovqin (trend ≈ ' + N1.tr.dw.toFixed(2) + ') → mushak taxmini yo\'q; −1,4 kg trend → mushak; oqsil ulushi trend davri bo\'yicha (15/22); < 0,5 kg → umumiy; 0,1 kg yaxlitlash, «juda oz»; suv ±1 kg izohi');
/* 3. shaxsiy naqshlar */
const days = (N, fn) => Array.from({ length: N }, (_, i) => Object.assign({ d: A(T0, -N + 1 + i) }, base, fn(i)));
let P = Q.naqsh(days(20, (i) => (i % 2 ? { f: 90, kcal: 1800 } : { f: 50, kcal: 2100 })), A); assert.deepEqual(P.map((x) => x.k), ['pt_fat'], JSON.stringify(P)); assert.equal(P[0].d.n, 9);
P = Q.naqsh(days(20, (i) => (i % 2 ? { p: 130, dinner: 500 } : { p: 80, dinner: 800 })), A); assert.deepEqual(P.map((x) => x.k), ['pt_prot']); assert.equal(P[0].d.x, 300);
assert.deepEqual(Q.naqsh(days(10, (i) => (i % 2 ? { f: 90 } : { f: 50, kcal: 2100 })), A), [], '14 kundan kam — chiqmaydi');
assert.deepEqual(Q.naqsh(days(20, () => ({ dinner: 600 })), A), [], 'farq yo\'q — chiqmaydi');
ok('Shaxsiy naqshlar: «yog\' ko\'p kundan keyin kaloriya oshdi» (n ≥ 4, ≥ 60 %, farq ≥ 25 punkt), «oqsil yetarli kunlari kechki ovqat −300 kkal»; 14 kundan kam yoki farqsiz — chiqmaydi');
/* 4. takroriy taom va muqobillar */
const kk = (f) => ({ fid: 'qozon-kabob', f });
const tk = Q.takror([{ f: 100, gf: 60, food: [kk(60), { fid: 'non', f: 5 }] }, { f: 95, gf: 60, food: [kk(55)] }, { f: 50, gf: 60, food: [kk(30)] }, { f: 50, gf: 60, food: [{ fid: 'osh', f: 20 }] }]);
assert.deepEqual(tk, { fid: 'qozon-kabob', n: 3 });
assert.equal(Q.takror([{ f: 100, gf: 60, food: [kk(60)] }, { f: 40, gf: 60, food: [kk(20)] }]), null, '2 marta — yo\'q');
const alt = Q.muqobil(by['qozon-kabob'], foods, 3); assert.ok(alt.length >= 2, 'muqobil: ' + alt.map((f) => f.id)); alt.forEach((f) => { assert.ok(f.f <= by['qozon-kabob'].f * 0.7, f.id + ' yog\'i kam'); assert.ok(!f.tm && !f.h); });
ok('Takroriy taom: qozon-kabob 3 marta va yog\'ning asosiy manbai → izoh; muqobillar (yog\'i ≥ 30 % kam): ' + alt.map((f) => f.n).join(', '));
/* 5. matnlar: render (uz/ru × hazil/jiddiy) va taqiqlangan vazn da'volari */
const NEWK = ['ef_a', 'ef_b', 'ef_c', 'ef_d', 'fx_fat', 'fx_carb', 'fx_prot', 'sw_ok', 'sw_over', 'sw_low', 'sw_tarkib', 'sw_tarkib_ok', 'sw_mus', 'sw_mus_ok', 'sw_flat', 'sw_now', 'sw_kam', 'sw_suv', 'pt_fat', 'pt_prot', 'rep_dish'];
const DATA = { x: 18, p: 45, sh: 52, fix: '200 g tovuq ko\'kragi va 150 g bodring', n: 5, t: 7, f: 4, dw: '0,8', ab: '0,2–0,3 kg', cd: 'juda oz', k: 3, dish: 'Qozon kabob', alt: 'dimlama, mastava' };
const M = require('../assets/kalkifit-maslahat-matn.js'); let cnt = 0;
for (const L of ['uz', 'ru']) for (const m of ['hazil', 'jiddiy']) for (const k of NEWK) { const a = M[L][m][k]; assert.ok(a && a.length >= 3, L + m + k); a.forEach((tpl, i) => { const t = MS.say(k, DATA, { lang: L, mode: m, i }); cnt++; assert.ok(t && !/[{}]|undefined|NaN/.test(t), L + m + k + i + ': ' + t); }); }
const BAN = [/kam ozd|ko'?p ozd|ozmaysiz|ozolmaysiz|ozish sekinlash/i, /меньше похуд|больше похуд|не похуде|похудели бы|сбросили бы|сброс[а-я]* меньше/i, /yog'?\s*(tufayli|sababli)[^.]*\d+([.,]\d+)?\s*kg/i, /из-за жир[а-я]*[^.]*\d+([.,]\d+)?\s*кг/i, /halol|ҳалол/i];
let all = 0; for (const L of ['uz', 'ru']) for (const m of ['hazil', 'jiddiy']) for (const k of Object.keys(M[L][m])) M[L][m][k].forEach((t) => { all++; BAN.forEach((re) => assert.ok(!re.test(t), 'taqiqlangan: ' + L + '/' + m + '/' + k + ': ' + t)); });
const appSrc = require('fs').readFileSync(path.join(__dirname, '..', 'assets', 'kalkifit-app.js'), 'utf8'), appStr = (appSrc.match(/(sq|tlSq|tlSw|tlPt)[A-Za-z_]*: ["'][^"']+["']/g) || []).join(' | '); BAN.forEach((re) => assert.ok(!re.test(appStr), 'ilova matni: ' + appStr.slice(0, 200)));
/* maslahatchi kartasi: 1) ta'sir, 2) aniq to'g'rilash */
const q = { id: 'a', data: { x: 22, src: [], fix: '200 g tovuq ko\'kragi va 150 g bodring' } }; for (const L of ['uz', 'ru']) for (const m of ['hazil', 'jiddiy']) { const t = MS.matn(q, L, m, 0); assert.ok(t.b.includes('200 g tovuq'), t.b); assert.ok(t.b.split(/[.!?…](?:\s|$)|\p{Extended_Pictographic}\s*/u).filter((x) => x && x.trim().length > 3).length >= 2, '2 jumla: ' + t.b); }
ok('Matnlar: ' + NEWK.length + ' yangi kalit × 3+ (uz/ru × hazil/jiddiy) — ' + cnt + ' variant to\'ldiriladi; jami ' + all + ' maslahatchi matnida va ilova yorliqlarida «X kg kam/ko\'p ozdingiz» turidagi vazn da\'vosi yo\'q; karta: ta\'sir + aniq taom/gramm');
console.log('sifat: ' + n + ' guruh OK');
