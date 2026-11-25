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
const wts = (a, b) => [A(T0, -13), A(T0, -10), A(T0, -8)].map((d) => ({ d, kg: a })).concat([A(T0, -5), A(T0, -2), T0].map((d) => ({ d, kg: b })));
let X = Q.xulosa(wk({ p: 70, f: 80 }), { weights: wts(90, 89), end: T0, addDays: A });
assert.deepEqual([X.ok, X.pKam, X.fOshdi], [7, 7, 7]); assert.deepEqual(X.keys.map((k) => k.k), ['sw_ok', 'sw_tarkib', 'sw_mus']);
assert.deepEqual(X.mus, { a: '0,2', b: '0,3', c: '0,1', d: '0,2' }); assert.equal(X.keys[2].d.dw, '1');
X = Q.xulosa(wk({}), { weights: wts(90, 89), end: T0, addDays: A }); assert.deepEqual(X.keys.map((k) => k.k), ['sw_ok', 'sw_tarkib_ok', 'sw_mus_ok']);
X = Q.xulosa(wk({ kcal: 2300 }), { weights: wts(90, 90.4), end: T0, addDays: A }); assert.deepEqual(X.keys.map((k) => k.k), ['sw_over', 'sw_tarkib_ok', 'sw_flat']); assert.equal(X.keys[2].d.dw, '+0,4');
X = Q.xulosa(wk({ kcal: 900 }), { weights: [], end: T0, addDays: A }); assert.deepEqual(X.keys.map((k) => k.k), ['sw_low', 'sw_tarkib_ok', 'sw_now']);
ok('Haftalik xulosa: kaloriya (reja/ortiq/kam), tarkib (oqsil kam, yog\' ko\'p kunlar), vazn: −1 kg va oqsil kam → mushak ≈ 0,2–0,3 kg (25–30 %), me\'yorda bo\'lganda ≈ 0,1–0,2 kg (10–15 %); vazn yo\'q — umumiy tushuntirish');
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
const NEWK = ['ef_a', 'ef_b', 'ef_c', 'ef_d', 'fx_fat', 'fx_carb', 'fx_prot', 'sw_ok', 'sw_over', 'sw_low', 'sw_tarkib', 'sw_tarkib_ok', 'sw_mus', 'sw_mus_ok', 'sw_flat', 'sw_now', 'pt_fat', 'pt_prot', 'rep_dish'];
const DATA = { x: 18, p: 45, sh: 52, fix: '200 g tovuq ko\'kragi va 150 g bodring', n: 5, t: 7, f: 4, dw: '0,8', a: '0,2', b: '0,2', c: '0,1', d: '0,1', k: 3, dish: 'Qozon kabob', alt: 'dimlama, mastava' };
const M = require('../assets/kalkifit-maslahat-matn.js'); let cnt = 0;
for (const L of ['uz', 'ru']) for (const m of ['hazil', 'jiddiy']) for (const k of NEWK) { const a = M[L][m][k]; assert.ok(a && a.length >= 4, L + m + k); a.forEach((tpl, i) => { const t = MS.say(k, DATA, { lang: L, mode: m, i }); cnt++; assert.ok(t && !/[{}]|undefined|NaN/.test(t), L + m + k + i + ': ' + t); }); }
const BAN = [/kam ozd|ko'?p ozd|ozmaysiz|ozolmaysiz|ozish sekinlash/i, /меньше похуд|больше похуд|не похуде|похудели бы|сбросили бы|сброс[а-я]* меньше/i, /yog'?\s*(tufayli|sababli)[^.]*\d+([.,]\d+)?\s*kg/i, /из-за жир[а-я]*[^.]*\d+([.,]\d+)?\s*кг/i, /halol|ҳалол/i];
let all = 0; for (const L of ['uz', 'ru']) for (const m of ['hazil', 'jiddiy']) for (const k of Object.keys(M[L][m])) M[L][m][k].forEach((t) => { all++; BAN.forEach((re) => assert.ok(!re.test(t), 'taqiqlangan: ' + L + '/' + m + '/' + k + ': ' + t)); });
const appSrc = require('fs').readFileSync(path.join(__dirname, '..', 'assets', 'kalkifit-app.js'), 'utf8'), appStr = (appSrc.match(/(sq|tlSq|tlSw|tlPt)[A-Za-z_]*: ["'][^"']+["']/g) || []).join(' | '); BAN.forEach((re) => assert.ok(!re.test(appStr), 'ilova matni: ' + appStr.slice(0, 200)));
/* maslahatchi kartasi: 1) ta'sir, 2) aniq to'g'rilash */
const q = { id: 'a', data: { x: 22, src: [], fix: '200 g tovuq ko\'kragi va 150 g bodring' } }; for (const L of ['uz', 'ru']) for (const m of ['hazil', 'jiddiy']) { const t = MS.matn(q, L, m, 0); assert.ok(t.b.includes('200 g tovuq'), t.b); assert.ok(t.b.split(/[.!?…](\s|$)/).filter((x) => x && x.trim().length > 3).length >= 2, '2 jumla: ' + t.b); }
ok('Matnlar: ' + NEWK.length + ' yangi kalit × 4 (uz/ru × hazil/jiddiy) — ' + cnt + ' variant to\'ldiriladi; jami ' + all + ' maslahatchi matnida va ilova yorliqlarida «X kg kam/ko\'p ozdingiz» turidagi vazn da\'vosi yo\'q; karta: ta\'sir + aniq taom/gramm');
console.log('sifat: ' + n + ' guruh OK');
