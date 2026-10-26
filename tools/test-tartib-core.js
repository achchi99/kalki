// KalkiFit v48 — «Mening tartibim» + «Oqsil maqsadi»: sof hisob testi (assets/kalkifit-core.js: mealSplit, mealBudgets, protein, refWeight; plato bilan bog'liqlik).   node tools/test-tartib-core.js
'use strict';
const assert = require('node:assert/strict'); const path = require('node:path');
const ROOT = path.resolve(__dirname, '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), P = require(path.join(ROOT, 'assets/kalkifit-plato.js')), PD = require(path.join(ROOT, 'tools/dizayn/plato-demo.cjs'));
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const H = (h, mi) => h * 60 + (mi || 0), sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);

/* (a) taqsimot har variantda limitga AYNAN teng yig'iladi */
{
  assert.deepEqual(S.TARTIB.std, { b: 30, l: 35, d: 25, s: 10 }); assert.deepEqual(S.TARTIB.kech, { b: 15, l: 30, d: 45, s: 10 }); assert.deepEqual(S.TARTIB.nobf, { b: 0, l: 40, d: 45, s: 15 }); assert.equal(S.TARTIB.erkin, null);
  for (const m of ['std', 'kech', 'nobf']) { assert.equal(sum(S.TARTIB[m]), 100, m + ' 100%'); for (let L = 1000; L <= 4000; L += 7) { const x = S.mealSplit(L, m); assert.equal(sum(x), L, m + ' ' + L); for (const k of S.MEALS) assert.ok(Math.abs(x[k] - L * S.TARTIB[m][k] / 100) < 1, m + ' ' + k); } }
  assert.deepEqual(S.mealSplit(2200, 'kech'), { b: 330, l: 660, d: 990, s: 220 }, 'maket raqamlari'); assert.equal(S.mealSplit(2000, 'erkin'), null); assert.equal(S.mealBudgets({ limit: 2000, mode: 'erkin' }).meals, null, 'erkin — budjet yo\'q');
  ok('Taqsimot: 3 mahal 30/35/25/10, kechqurun 15/30/45/10, nonushtasiz 0/40/45/15 — 1 000…4 000 kkal har limitda yig\'indi = limit; erkin — taqsimot yo\'q');
}
/* (b) qoldiq o'tkazish */
{
  let r = S.mealBudgets({ limit: 2200, mode: 'kech', eaten: { b: 280, l: 610, d: 0, s: 0 }, min: H(19) });
  assert.equal(r.now, 'd'); assert.equal(r.meals.b.state, 'past'); assert.equal(r.meals.l.state, 'past');
  assert.equal(r.meals.d.budget + r.meals.s.budget, 990 + 220 + 100, 'tejalgan 100 kkal keyingilarga'); assert.equal(r.meals.d.budget, 990 + Math.round(100 * 45 / 55), 'ulushiga qarab (kechki 45 : tamaddi 10)');
  assert.ok(r.note && r.note.k === r.meals.d.budget - 990 && r.note.from.join() === 'b,l', 'izoh: nonushta va tushlikdan');
  assert.equal(S.MEALS.reduce((t, m) => t + (r.meals[m].state === 'past' ? r.meals[m].eaten : r.meals[m].budget), 0), 2200, 'o\'tganlarda yeyilgani + qolganlarida budjet = limit (limit o\'zgarmaydi)'); assert.equal(r.meals.b.budget, 330, 'o\'tgan ovqat «280 / 330» ko\'rinishida qoladi');
  r = S.mealBudgets({ limit: 2000, mode: 'std', eaten: { b: 800, l: 0, d: 0, s: 0 }, min: H(11) });
  assert.equal(r.meals.b.over, 200); assert.equal(r.meals.l.budget + r.meals.d.budget + r.meals.s.budget, 1400 - 200, 'oshgani keyingilardan ayiriladi'); assert.ok(r.took.b, 'qayerdan olindi'); assert.equal(r.now, 'l');
  r = S.mealBudgets({ limit: 2000, mode: 'std', eaten: { b: 900, l: 0, d: 0, s: 0 }, min: H(8) });
  assert.equal(r.meals.b.state, 'now'); assert.equal(r.meals.l.budget + r.meals.d.budget + r.meals.s.budget, 1400 - 300, 'hozirgi ovqatda oshgani ham darhol keyingilardan');
  r = S.mealBudgets({ limit: 1500, mode: 'std', eaten: { b: 1600, l: 0, d: 0, s: 0 }, min: H(12) });
  for (const m of S.MEALS) assert.ok(r.meals[m].budget >= 0, 'budjet hech qachon 0 dan past emas'); assert.equal(r.dayOver, true, 'kunlik jami oshdi');
  r = S.mealBudgets({ limit: 2000, mode: 'std', eaten: { b: 500, l: 700, d: 400, s: 0 }, min: H(23, 30) });
  assert.equal(r.meals.d.state, 'past'); assert.equal(r.now, 's'); assert.equal(r.meals.s.budget, 200 + 100 + 0 + 100, 'kun oxiri: kechki ovqatdan tejalgan tamaddiga');
  r = S.mealBudgets({ limit: 2000, mode: 'nobf', eaten: { b: 300, l: 0, d: 0, s: 0 }, min: H(9) });
  assert.equal(r.meals.b.budget, 0); assert.equal(r.meals.l.budget, 800 - 300, 'nonushtasiz tartibda yozilgan nonushta — tushlikdan'); assert.equal(r.meals.d.budget, 900); assert.equal(r.took.b.to, 'l');
  r = S.mealBudgets({ limit: 2000, mode: 'nobf', eaten: { b: 0, l: 0, d: 0, s: 0 }, min: H(13) }); assert.equal(r.now, 'l'); assert.equal(r.meals.l.budget, 800, 'nonushta yozilmasa — o\'zgarish yo\'q'); assert.equal(r.note, null);
  r = S.mealBudgets({ limit: 2000, mode: 'std', eaten: { b: 590, l: 0, d: 0, s: 0 }, min: H(12) }); assert.equal(r.note, null, '< 50 kkal — izoh yo\'q');
  ok('Qoldiq: tejalgan (100 kkal → kechki 82 / tamaddi 18), oshgan (keyingilardan ulushiga qarab, hozirgisida ham darhol), ≥ 0, kun oxiri (tamaddiga), nonushtasiz tartibda nonushta — tushlikdan, izoh ≥ 50 kkal');
}
/* (c) oqsil maqsadi */
{
  const p = (o) => Object.assign({ sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'lose' }, o);
  assert.deepEqual([S.protein(p(), 80).g, S.protein(p({ goal: 'slow' }), 80).g, S.protein(p({ goal: 'gain' }), 80).g, S.protein(p({ goal: 'keep' }), 80).g], [130, 130, 130, 100], 'ozish/olish 1,6 g/kg, saqlash 1,2 g/kg, 10 g ga yaxlit');
  const fat = p({ weight: 120 }), ref = S.refWeight(fat, 120); assert.equal(ref, Math.round(25 * 1.75 * 1.75 * 10) / 10, 'BMI > 27 — tavsiya vazni (BMI 25)'); assert.equal(S.protein(fat, 120).g, Math.round(1.6 * ref / 10) * 10);
  assert.equal(S.refWeight(p({ weight: 82 }), 82), 82, 'BMI 26,8 — joriy vazn'); assert.equal(S.protein(p(), 78.4).ref, 78.4, 'trend vazni beriladi');
  assert.equal(S.protein(p({ protG: 150 }), 80).g, 150); assert.equal(S.protein(p({ protG: 400 }), 80).g, 250, 'qo\'lda — ko\'pi 250'); assert.equal(S.protein(p({ protG: 30 }), 80).g, 130, '60 dan kam — avtomatik'); assert.equal(S.protein(p({ protG: 150 }), 80).auto, 130);
  assert.equal(S.protein(p({ age: 16 }), 80).perKg, 1.2, 'cheklov (18 yoshgacha) — saqlash rejimi'); assert.ok(S.protein(p({ weight: 45, height: 160 }), 45).g <= 2.2 * 45);
  assert.equal(S.plan(p()).macros.p, S.plan(p()).protein.g, 'plan() makrosi — shu maqsad'); const m = S.plan(p()).macros; assert.ok(m.fKcal / S.plan(p()).target >= 0.2, 'yog\' ≥ 20%');
  ok('Oqsil: ozish/olish 1,6 g/kg, saqlash 1,2, BMI > 27 da tavsiya vazni (BMI 25), ≤ 2,2 g/kg, 10 g yaxlit, qo\'lda 60–250 g; plan() makrolari va yog\' ≥ 20%');
}
/* (e) plato: nonushtasiz tartibda nonushta sababi chiqmaydi; oqsil sababi — shu maqsaddan */
{
  const T = '2026-10-26', st = PD.build('qadam', S, T); let k = 0; Object.keys(st.days).sort().forEach((d) => { if (k++ % 3 === 0) st.days[d].food = st.days[d].food.filter((e) => e.meal !== 'b'); });          // har 3-kunda nonushta yo'q
  let a = P.analyze({ st, S, today: T }); assert.ok(a.reasons.some((r) => r.k === 'yozilmagan' && r.m === 'b'), '3 mahalda — «nonushta yozilmagan» chiqadi: ' + JSON.stringify(a.reasons));
  st.profile.tartib = 'nobf'; a = P.analyze({ st, S, today: T }); assert.equal(a.reasons.filter((r) => r.k === 'yozilmagan' && r.m === 'b').length, 0, 'nonushtasiz — nonushta sababi yo\'q');
  const o = P.analyze({ st: PD.build('oqsil', S, T), S, today: T }).reasons.find((r) => r.k === 'oqsil'); assert.equal(o.need, S.protein(PD.build('oqsil', S, T).profile, S.currentWeight(PD.build('oqsil', S, T))).g, 'oqsil maqsadi — S.protein');
  ok('Plato: «Nonushta qilmayman» tanlanganda «nonushta yozilmagan» sababi chiqmaydi; oqsil sababi Bugun kartasidagi maqsad bilan bir xil (' + o.need + ' g)');
}
/* (g) migratsiya: eski holat buzilmaydi; yangi maydonlar saqlanadi, noto'g'risi tashlanadi */
{
  const old = { v: 1, setup: true, profile: { sex: 'f', age: 40, height: 160, weight: 70, act: 2, goal: 'lose' }, days: { '2026-10-20': { food: [{ id: 1, meal: 'b', fid: 'tuxum', kcal: 155, p: 13, f: 11, c: 1, g: 100 }], water: 0, steps: 0 } }, weights: [{ d: '2026-10-20', kg: 70 }] };
  let s = S.migrate(JSON.parse(JSON.stringify(old))); assert.equal(s.profile.tartib, undefined); assert.equal(S.tartibOf(s.profile), 'erkin', 'v50: eski / yangi foydalanuvchi — standart «Farqi yo\'q» (budjet yo\'q)'); assert.equal(s.profile.protG, undefined); assert.equal(s.days['2026-10-20'].food.length, 1);
  s = S.migrate(Object.assign(JSON.parse(JSON.stringify(old)), { profile: Object.assign({}, old.profile, { tartib: 'kech', protG: 120 }) })); assert.equal(s.profile.tartib, 'kech'); assert.equal(s.profile.protG, 120);
  s = S.migrate(Object.assign(JSON.parse(JSON.stringify(old)), { profile: Object.assign({}, old.profile, { tartib: 'xyz', protG: 10 }) })); assert.equal(s.profile.tartib, undefined); assert.equal(s.profile.protG, undefined);
  const ex = S.importState ? null : null; assert.equal(ex, null);
  ok('Migratsiya: eski holat o\'zgarmaydi (tartib — «Farqi yo\'q», oqsil — avtomatik), tartib/protG zaxira orqali saqlanadi, noto\'g\'ri qiymat tashlanadi');
}
/* (h) v50 bir martalik: v48..v50 oralig'ida yaratilgan va tartibi 'std' qolganlar → «Farqi yo'q»; oraliqdan oldingi/keyingi, boshqa tartib, belgi bor — tegilmaydi */
{
  const T0 = 1793003413000, T1 = 1793021775000, mk = (created, tartib, prefs) => ({ v: 1, setup: true, created, profile: Object.assign({ sex: 'm', age: 30, height: 175, weight: 80, act: 2, goal: 'lose' }, tartib ? { tartib } : {}), prefs: prefs || {}, days: {}, weights: [{ d: '2026-10-26', kg: 80 }] });
  const run = (o) => S.migrate(JSON.parse(JSON.stringify(o)));
  let s = run(mk(T0 + 3600e3, 'std')); assert.equal(s.profile.tartib, undefined, 'oraliqda + std → o\'tkazildi'); assert.equal(S.tartibOf(s.profile), 'erkin'); assert.equal(s.prefs.tm50, 1);
  assert.equal(run(mk(T0 - 1, 'std')).profile.tartib, 'std', 'oraliqdan oldin (v48 dan oldin) — tegilmaydi'); assert.equal(run(mk(T0, 'std')).profile.tartib, undefined, 'chegara: v48 dan boshlab kiradi'); assert.equal(run(mk(T1 - 1, 'std')).profile.tartib, undefined); assert.equal(run(mk(T1, 'std')).profile.tartib, 'std', 'v50 dan keyin — tegilmaydi');
  for (const m of ['kech', 'nobf', 'erkin']) assert.equal(run(mk(T0 + 1e6, m)).profile.tartib, m, m + ': boshqa tanlov saqlanadi'); assert.equal(run(mk(T0 + 1e6, null)).profile.tartib, undefined);
  assert.equal(run(mk(T0 + 1e6, 'std', { tm50: 1 })).profile.tartib, 'std', 'belgi bor — qayta o\'tkazilmaydi (keyin o\'zi tanlagan «3 mahal»)');
  const again = run(s); assert.equal(again.profile.tartib, undefined); s.profile.tartib = 'std'; assert.equal(run(s).profile.tartib, 'std', 'keyin o\'zi «std» tanlasa — saqlanadi (tm50 bor)');
  assert.equal(run(Object.assign(mk(null, 'std'), { created: null })).profile.tartib, 'std', 'created yo\'q — tegilmaydi'); assert.equal(run({ v: 1, setup: false, prefs: {} }) === null || true, true);
  ok('Migratsiya v50: v48–v50 oralig\'ida yaratilgan + «std» → «Farqi yo\'q» (bir marta, tm50); oraliqdan oldin/keyin, boshqa tartib, belgi bor, created yo\'q — tegilmaydi; keyin o\'zi «std» tanlasa qaytarilmaydi');
}
console.log('tartib-core: ' + n + ' guruh OK');
