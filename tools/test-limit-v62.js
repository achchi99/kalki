// KalkiFit v62 — me'yor ehtiyotkorroq: o'tirib ishlovchi k 1,35, 12 000+ qadamga ×0,5, zal MET, soat (iPhone «Aktiv energiya», Android Health Connect), adaptiv 14 kun, limShift.   node tools/test-limit-v62.js
'use strict';
const assert = require('node:assert/strict'); const path = require('node:path');
const ROOT = path.resolve(__dirname, '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), P = require(path.join(ROOT, 'assets/kalkifit-plato.js')), D = S.dates;
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const T0 = '2026-10-27', Y0 = D.addDays(T0, -1);
function mk(p, q) { const st = S.emptyState(); st.setup = true; st.created = Date.parse('2026-09-01T08:00:00Z'); st.trackStart = '2026-09-01'; st.profile = Object.assign({ sex: 'm', age: 35, height: 183, weight: 100, act: 2, goal: 'keep', job: 'sit' }, p || {}); st.prefs = Object.assign({ qa: 'on' }, q || {}); S.addWeight(st, '2026-09-01', st.profile.weight); return st; }
const sumOk = (dp, m) => assert.equal(dp.bmr + dp.life + dp.credit + dp.corr + dp.delta + dp.floorAdd - (dp.dev ? dp.dev.cut : 0), dp.limit, m + ': (i) yig\'indisi = limit');

/* 1. koeffitsient va qadam egri chizig'i */
{
  const st = mk(); const bmr = S.bmrRaw('m', 100, 183, 35);
  assert.equal(S.LIM.JOB.sit.k, 1.35); assert.equal(S.LIM.JOB.sit.base, 5000); assert.equal(S.LIM.JOB.stand.k, 1.60); assert.equal(S.LIM.JOB.heavy.k, 1.85);
  assert.equal(S.dayPlan(st, Y0, 0).limit, Math.round(bmr * 1.35), 'saqlash, qadamsiz — BMR × 1,35');
  const w = (s) => S.walkNet(s, 183, 100);
  assert.equal(S.creditOf(12000, 183, 100, 5000), Math.round(w(7000) * 0.7), '12 000 gacha — ×0,7');
  assert.equal(S.creditOf(15780, 183, 100, 5000), Math.round(w(7000) * 0.7 + w(3780) * 0.5), '12 000 dan ortig\'i — ×0,5');
  assert.equal(S.creditOf(13000, 183, 100, 12500), Math.round(w(500) * 0.5), 'baza 12 000 dan yuqori bo\'lsa ham to\'g\'ri');
  assert.equal(S.creditOf(4000, 183, 100, 5000), 0, 'bazadan kam — 0');
  for (const s of [3000, 8000, 12000, 15000, 20000, 30000]) { const a = S.dayPlan(mk(), Y0, s).limit, b = S.dayPlan(mk(), Y0, s, { old: true }).limit; assert.ok(a < b, s + ': yangi < eski (' + a + ' / ' + b + ')'); }
  for (let s = 0; s <= 40000; s += 500) { const c = S.creditOf(s, 183, 100, 5000), c2 = S.creditOf(s + 500, 183, 100, 5000); assert.ok(c2 >= c, 'kredit qadam bilan kamaymaydi'); }
  ok('o\'tirib: k 1,35 (baza 5 000); kredit 12 000 gacha ×0,7, undan ortig\'i ×0,5; har qadam darajasida yangi limit eskisidan kichik; kredit monoton');
}
/* 2. foydalanuvchi holati (28-okt): taxminiy profil E 100 kg 183 sm 35 y, 15 780 qadam */
{
  const st = mk(); const a = S.dayPlan(st, Y0, 15780).limit, b = S.dayPlan(st, Y0, 15780, { old: true }).limit;
  assert.ok(a <= 2950 && a >= 2850, 'yangi ' + a + ' soat oralig\'ida (2 900–2 950 atrofida)'); assert.ok(b - a >= 100, 'eski ' + b + ' dan ≥ 100 kam');
  ok('Real holat: eski ' + b + ' → yangi ' + a + ' kkal (soat + TEF ≈ 2 900–2 950)');
}
/* 3. zal MET (Compendium 02054) */
{
  assert.deepEqual(S.EX.zal.met, [3.0, 3.5, 5.0]); assert.equal(S.exNet({ t: 'zal', min: 60, lv: 1 }, 100), 250);
  ok('Zal: yengil 3,0 · o\'rtacha 3,5 (02054, 8–15 takror, dam bilan) · og\'ir 5,0 — 60 daq × 100 kg o\'rtacha = 250 kkal NET');
}
/* 4. iPhone «Aktiv energiya»: qadam + mashg'ulot krediti O'RNIGA, ikki marta emas */
{
  const st = mk({}, { qa: undefined, qm: 'on' }); S.setSteps(st, Y0, 15780); S.addEx(st, Y0, { t: 'zal', min: 69, lv: 1 });
  const before = S.dayPlan(st, Y0); assert.ok(before.stepCredit > 0 && before.exCredit > 0);
  S.setAe(st, Y0, 690); const dp = S.dayPlan(st, Y0), base = S.aeBase(S.bmrRaw('m', 100, 183, 35), 1.35);
  assert.equal(dp.aeBase, base); assert.equal(base, Math.round(S.bmrRaw('m', 100, 183, 35) * (1.35 * 0.9 - 1)));
  assert.equal(dp.stepCredit, 0); assert.equal(dp.exCredit, 0); assert.equal(dp.aeCredit, Math.round((690 - base) * 0.7)); assert.equal(dp.credit, dp.aeCredit, 'kredit faqat soatdan');
  assert.equal(dp.limit, dp.plan.tdee + dp.aeCredit); sumOk(dp, 'ae');
  S.setSteps(st, Y0, 25000); S.addEx(st, Y0, { t: 'yugurish', min: 60, lv: 2 }); assert.equal(S.dayPlan(st, Y0).limit, dp.limit, 'qadam/mashg\'ulot qo\'shilsa ham o\'zgarmaydi (soat ichida)');
  S.setAe(st, Y0, 100); assert.equal(S.dayPlan(st, Y0).aeCredit, 0, 'bazaviy harakatdan kam — 0 (ayirilmaydi)'); assert.equal(S.dayPlan(st, Y0).limit, S.dayPlan(st, Y0).plan.tdee);
  S.setAe(st, Y0, 5000); assert.equal(S.dayPlan(st, Y0).aeCredit, 800, '≤ 800');
  S.setAe(st, Y0, 0); assert.equal(S.dayOf(st, Y0).ae, undefined, '0 — o\'chiriladi'); assert.ok(S.dayPlan(st, Y0).stepCredit > 0, 'qadam krediti qaytadi');
  const noJob = mk({ job: undefined }, { qa: undefined }); S.setAe(noJob, Y0, 900); assert.equal(S.dayPlan(noJob, Y0).credit, 0, 'ish turi modeli yo\'q (umumiy faollik) — soat krediti ham 0');
  const lose = mk({ goal: 'lose' }, { qa: undefined, qm: 'on' }); S.setAe(lose, Y0, 800); sumOk(S.dayPlan(lose, Y0), 'ae+lose');
  ok('Aktiv energiya: kredit = (aktiv − BMR×(k×0,9−1)) × 0,7, ≤ 800; qadam va mashg\'ulot krediti 0 (ikki marta emas); kam bo\'lsa 0; ish turisiz — 0');
}
/* 5. Android soat (Health Connect): ≥ 10% kam bo'lsa — kichigi; to'liq kun sharti */
{
  const st = mk({ goal: 'lose' }); S.setSteps(st, Y0, 15780); const f = S.dayPlan(st, Y0);
  S.setDev(st, Y0, { tot: 2680, totH: 23.6, src: 'com.huawei.health' }); assert.equal(S.dayPlan(st, Y0).dev, null, '2 680 / 0,9 = 2 978 — 10% dan kam farq: o\'zgarmaydi');
  S.setDev(st, Y0, { tot: 2200, totH: 23.6, src: 'com.huawei.health' }); let dp = S.dayPlan(st, Y0);
  assert.ok(dp.dev && dp.dev.total === Math.round(2200 / 0.9)); assert.equal(dp.spend, dp.dev.total); assert.equal(dp.limit, dp.dev.total - 550); assert.ok(dp.limit < f.limit); sumOk(dp, 'dev');
  S.setDev(st, Y0, { tot: 1500, totH: 9, src: 'x' }); assert.equal(S.dayPlan(st, Y0).dev, null, 'soat kun bo\'yi taqilmagan (9 soat) — jami ishlatilmaydi');
  S.setDev(st, Y0, { tot: 1500, totH: 9, act: 300, src: 'x' }); dp = S.dayPlan(st, Y0); assert.equal(dp.dev.total, Math.round((S.bmrRaw('m', 100, 183, 35) + 300) / 0.9), 'jami to\'liq emas — BMR + aktiv');
  S.setDev(st, Y0, { tot: 400, totH: 23, src: 'x' }); assert.equal(S.dayPlan(st, Y0).dev.total, Math.round(S.bmrRaw('m', 100, 183, 35) * 1.2), 'BMR × 1,2 dan past olinmaydi (soat xatosi)');
  S.setDev(st, Y0, { tot: 1500, totH: 9, act: 300, src: 'x' });
  const low = mk({ sex: 'f', weight: 55, height: 158, age: 50, goal: 'lose' }); S.setDev(low, Y0, { tot: 900, totH: 24, src: 'x' }); dp = S.dayPlan(low, Y0); assert.equal(dp.limit, 1200, 'pastki chegara saqlanadi'); sumOk(dp, 'dev+floor');
  const T = D.today(), td = mk(); S.setDev(td, T, { tot: 1000, totH: 10, src: 'x' });
  const at = (h) => { const d = new Date(); d.setHours(h, 0, 0, 0); return d; };
  assert.equal(S.dayPlan(td, T, null, { now: at(15) }).dev, null, 'bugun 20:00 gacha — solishtirilmaydi');
  S.setDev(td, T, { tot: 1900, totH: 20.5, src: 'x' }); dp = S.dayPlan(td, T, null, { now: at(21) }); const bmr = S.bmrRaw('m', 100, 183, 35);
  assert.ok(dp.dev, '21:00 — solishtiriladi'); assert.equal(dp.dev.total, Math.round((1900 + bmr * 3 / 24) / 0.9), 'qolgan 3 soat — tinch holat');
  S.setAe(td, T, 600); assert.equal(S.dayPlan(td, T, null, { now: at(21) }).dev, null, 'qo\'lda aktiv energiya bo\'lsa — Android solishtiruvi yo\'q (bitta manba)');
  assert.equal(S.dayPlan(st, Y0, null, { noDev: true }).dev, null);
  const m = S.migrate(JSON.parse(JSON.stringify(st))); assert.deepEqual(m.days[Y0].dev, { tot: 1500, totH: 9, act: 300, src: 'x' }, 'migratsiyada saqlanadi'); assert.equal(S.migrate(Object.assign(JSON.parse(JSON.stringify(st)), { days: { [Y0]: { food: [], water: 0, steps: 0, dev: { tot: 'x' }, ae: -5 } } })).days[Y0].dev, undefined, 'buzuq qiymat tashlanadi');
  ok('Soat (Android): qurilma + TEF (÷0,9) formuladan ≥ 10% kam — o\'sha kun limiti undan; < 10% — o\'zgarmaydi; 20 soatdan kam taqilgan — BMR + aktiv; BMR × 1,2 dan past emas; bugun 20:00 dan keyin; pastki chegara; migratsiya');
}
/* 6. adaptiv: 14 kun, birinchi taklif faqat pasaytirsa ham */
{
  assert.equal(P.AD.DAYS, 14); assert.equal(P.AD.WEIGHTS, 4); assert.equal(P.AD.FULL, 0.8);
  const st = mk({ weight: 86, goal: 'lose' }); st.created = Date.parse(D.addDays(T0, -15) + 'T08:00:00Z'); st.trackStart = D.addDays(T0, -15); st.weights = [];
  for (let i = 15; i >= 1; i--) { const d = D.addDays(T0, -i); S.addFood(st, d, { meal: 'l', fid: 'x', name: 'x', kcal: 2100, p: 30, f: 20, c: 100, g: 300 }); if (i % 4 === 1) S.addWeight(st, d, 86); }
  S.addWeight(st, D.addDays(T0, -1), 86); const a = P.adapt({ st, S, today: T0 }); assert.ok(a && a.delta < 0, '15 kun, vazn o\'zgarmadi — pasaytirish taklifi: ' + JSON.stringify(a));
  st.trackStart = D.addDays(T0, -10); st.created = Date.parse(D.addDays(T0, -10) + 'T08:00:00Z'); assert.equal(P.adapt({ st, S, today: T0 }), null, '10 kun — hali emas');
  ok('Adaptiv: 14 kundan (80% to\'liq, ≥ 4 tortilish); pasaytirish taklifi ham chiqadi (' + (a.limitOld) + ' → ' + a.limitNew + ')');
}
/* 7. limShift: eski foydalanuvchiga bir martalik izoh (> 8%) */
{
  const st = mk({ sex: 'f', weight: 60, height: 163, goal: 'lose' }); const T = D.today();
  for (let i = 0; i < 7; i++) { const d = D.addDays(T, -i); S.setSteps(st, d, 20000); S.addEx(st, d, { t: 'zal', min: 90, lv: 2 }); }
  let r = S.limShift(st, T); assert.ok(r.pct < -0.08, 'faol ayol, 20 000 qadam + og\'ir zal: ' + (r.pct * 100).toFixed(1) + '%'); assert.equal(r.days, 7);
  const calm = mk(); r = S.limShift(calm, T); assert.ok(Math.abs(r.pct) < 0.08 && r.pct < 0, 'oddiy holat: ' + (r.pct * 100).toFixed(1) + '% — izoh kerak emas');
  ok('limShift: 7 kun o\'rtacha eski/yangi limit; faol holatda > 8% (izoh), oddiyda ~' + (r.pct * 100).toFixed(1) + '% (izohsiz)');
}
console.log('limit-v62: ' + n + ' guruh OK');
