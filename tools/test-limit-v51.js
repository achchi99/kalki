// KalkiFit v51 — kunlik me'yor: yagona model (S.dayPlan), qadam ikki marta hisoblanmaydi, o'zini to'g'rilaydigan me'yor (KalkiPlato.adapt).   node tools/test-limit-v51.js
'use strict';
const assert = require('node:assert/strict'); const path = require('node:path');
const ROOT = path.resolve(__dirname, '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), P = require(path.join(ROOT, 'assets/kalkifit-plato.js')), D = S.dates;
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const T0 = '2026-10-27';
const prof = (o) => Object.assign({ sex: 'm', age: 35, height: 175, weight: 80, act: 2, goal: 'lose' }, o || {});
function mk(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.parse('2026-09-01T08:00:00Z'); st.trackStart = '2026-09-01'; st.profile = prof(o.profile); st.prefs = Object.assign({}, o.prefs || {}); if (o.steps != null) S.ensureDay(st, T0).steps = o.steps; S.addWeight(st, '2026-09-01', st.profile.weight); return st; }
const BMR = S.bmrRaw('m', 80, 175, 35);

/* (a) Android: baza ostida/ustida, 0,7 koeffitsient, ≤ 500 */
{
  const st = mk({ profile: { job: 'sit' }, prefs: { qa: 'on' }, steps: 9000 }); let dp = S.dayPlan(st, T0);
  const want = Math.round((9000 - 5000) * 175 * 0.415 / 100 / 1000 * 80 * 0.5 * 0.7); assert.equal(dp.credit, want); assert.equal(dp.k, 1.35); assert.equal(dp.base, 5000); assert.equal(dp.life, Math.round(BMR * 1.35) - Math.round(BMR));          // v62: 1,40 → 1,35
  assert.equal(Math.round(dp.credit / 0.7), Math.round((9000 - 5000) * 175 * 0.415 / 100 / 1000 * 80 * 0.5), '0,7 — konservativ');
  S.ensureDay(st, T0).steps = 4000; dp = S.dayPlan(st, T0); assert.equal(dp.credit, 0); assert.equal(dp.limit, S.planSt(st).target, 'bazadan kam — limitdan AYIRILMAYDI');
  S.ensureDay(st, T0).steps = 39000; assert.equal(S.dayPlan(st, T0).credit, 500, 'kuniga ≤ 500'); S.ensureDay(st, T0).steps = 80000; assert.equal(S.dayPlan(st, T0).credit, 0, '40 000+ — shubhali kun, kredit 0 (v52)');
  for (const [j, k, b] of [['stand', 1.6, 7500], ['heavy', 1.85, 10000]]) { st.profile.job = j; S.ensureDay(st, T0).steps = b + 2000; const q = S.dayPlan(st, T0); assert.equal(q.k, k); assert.equal(q.base, b); assert.ok(q.credit > 0); }
  ok('Android (ish turi + qadam): kredit = (qadam − baza) × bo\'y×0,415 × vazn × 0,5 × 0,7 (4 000 qadam ustida → ' + want + ' kkal); bazadan kam — 0 (ayirilmaydi); ≤ 500; o\'tirib/tik turib/og\'ir: 1,35/5 000 · 1,60/7 500 · 1,85/10 000');
}
/* (b) iPhone / qadamsiz / tasdiqlanmagan Android — kredit 0 */
{
  for (const o of [{}, { prefs: { qa: 'on' } }, { profile: { job: 'sit' } }, { profile: { job: 'sit' }, prefs: { qa: 'off' } }]) { const st = mk(Object.assign({ steps: 15000 }, o)); const dp = S.dayPlan(st, T0); assert.equal(dp.credit, 0, JSON.stringify(o)); assert.equal(dp.k, S.ACT[2]); assert.equal(dp.limit, S.plan(st.profile).target); }
  ok('iPhone veb, qadam ruxsati yo\'q yoki ish turi tasdiqlanmagan Android — umumiy faollik (yurish ichida), kredit 0');
}
/* (c) ikki marta hisoblash yo'q: bir xil odam, o'xshash kun — Android (ish turi + qadam) va iPhone (umumiy PAL) ±10% */
{
  const rows = [];
  for (const [job, act, steps, who] of [['sit', 2, 7000, 'ofis, ozgina yuradi'], ['sit', 2, 9000, 'ofis, ko\'p yuradi'], ['stand', 3, 9500, 'sotuvchi'], ['heavy', 5, 12000, 'qurilishchi']]) for (const goal of ['keep', 'lose']) for (const sex of ['m', 'f']) {
    const base = { sex, goal, act, weight: sex === 'f' ? 68 : 82, height: sex === 'f' ? 163 : 178, age: 33 };
    const and = mk({ profile: Object.assign({}, base, { job }), prefs: { qa: 'on' }, steps }), ios = mk({ profile: base, steps });
    const a = S.dayPlan(and, T0).limit, i = S.dayPlan(ios, T0).limit, d = (a - i) / i; rows.push([who, sex, goal, a, i, (d * 100).toFixed(1) + '%']);
    assert.ok(Math.abs(d) <= 0.10, who + ' ' + sex + ' ' + goal + ': Android ' + a + ' / iPhone ' + i + ' (' + (d * 100).toFixed(1) + '%)');
  }
  ok('Android ↔ iPhone (o\'xshash kun): ' + rows.length + ' juft ±10% ichida — eng katta farq ' + rows.reduce((m, r) => Math.max(m, Math.abs(parseFloat(r[5]))), 0).toFixed(1) + '%');
}
/* (f) (i) tushuntirish yig'indisi = limit (har holatda, pastki chegara va tuzatish bilan) */
{
  for (const o of [{ profile: { job: 'sit' }, prefs: { qa: 'on' }, steps: 11000 }, { steps: 9000 }, { profile: { sex: 'f', weight: 50, height: 150, age: 60, act: 1, goal: 'lose' } }, { profile: { job: 'heavy', corr: -180, goal: 'gain' }, prefs: { qa: 'on' }, steps: 16000 }, { profile: { corr: 150, goal: 'keep' } }]) {
    const dp = S.dayPlan(mk(o), T0); assert.equal(dp.bmr + dp.life + dp.credit + dp.corr + dp.delta + dp.floorAdd, dp.limit, JSON.stringify(o)); if (dp.floorAdd) assert.equal(dp.limit, dp.plan.floorMin);
  }
  ok('(i): tinch holat + kundalik hayot + ortiqcha qadam + shaxsiy tuzatish ± maqsad + pastki chegaragacha = kunlik me\'yor (5 holat)');
}
/* (d) adaptiv me'yor */
function adaptSt(o) {
  const st = mk({ profile: o.profile || {} }); st.created = Date.parse('2026-09-10T08:00:00Z'); st.trackStart = '2026-09-10'; st.weights = []; const days = 40; let kg = o.kg0 || 86;
  for (let i = days; i >= 1; i--) { const d = D.addDays(T0, -i); const full = !(o.partial && i % 3 === 0); S.addFood(st, d, { meal: 'l', fid: 'x', name: 'x', kcal: full ? o.intake : 300, p: 30, f: 20, c: 100, g: 300 }); kg -= (o.perDay || 0); if (i % 4 === 0) S.addWeight(st, d, Math.round(kg * 10) / 10); }
  S.addWeight(st, D.addDays(T0, -1), Math.round(kg * 10) / 10); st.profile.weight = 86; return st;
}
{
  const base = adaptSt({ intake: 2000, perDay: 0.1 / 7, profile: { weight: 86, height: 178 } }), f0 = S.dayPlan(base, T0, 0);
  let a = P.adapt({ st: base, S, today: T0 }); assert.ok(a, 'taklif bor'); assert.ok(a.diff <= -150, 'kuzatuv sarfi formuladan past: ' + JSON.stringify(a));
  assert.equal(Math.abs(a.delta), Math.round(a.formula * 0.1 / 10) * 10, 'bir martada ±10% dan ko\'p emas'); assert.ok(a.limitNew < a.limitOld && a.limitNew >= f0.plan.floorMin);
  assert.equal(P.adapt({ st: adaptSt({ intake: 2000, perDay: 0.1 / 7, partial: true, profile: { weight: 86, height: 178 } }), S, today: T0 }), null, 'to\'liq yozilmagan (< 80%) — taklif yo\'q');
  assert.equal(P.adapt({ st: base, S, today: T0, last: Date.now() - 5 * 864e5, now: Date.now() }), null, '14 kunda bir marta'); assert.ok(P.adapt({ st: base, S, today: T0, last: Date.now() - 15 * 864e5, now: Date.now() }), '15 kundan keyin — yana');
  const near = adaptSt({ intake: f0.spend - 550, perDay: 550 / 7700, profile: { weight: 86, height: 178 } }); assert.equal(P.adapt({ st: near, S, today: T0 }), null, 'farq < 150 — taklif yo\'q');
  const up = adaptSt({ intake: 2400, perDay: 0.9 / 7, profile: { weight: 86, height: 178 } }); a = P.adapt({ st: up, S, today: T0 }); assert.ok(a && a.delta > 0, 'sarf yuqori — oshirish taklifi: ' + JSON.stringify(a));
  const fem = adaptSt({ intake: 1250, perDay: 0, kg0: 60, profile: { sex: 'f', weight: 60, height: 158, age: 50, act: 1, goal: 'lose' } }); const fa = P.adapt({ st: fem, S, today: T0 }); assert.ok(!fa || fa.limitNew >= 1200, 'pastki chegaradan pastga tushmaydi: ' + JSON.stringify(fa));
  const fast = adaptSt({ intake: 1500, perDay: 1.6 / 7, profile: { weight: 86, height: 178 } }); const fs = P.adapt({ st: fast, S, today: T0 }); assert.ok(!fs || fs.delta > 0, 'juda tez ozishda faqat oshirish: ' + JSON.stringify(fs));
  const st2 = adaptSt({ intake: 2000, perDay: 0.1 / 7, profile: { weight: 86, height: 178 } }); st2.profile.corr = a ? 0 : 0; const y = P.adapt({ st: st2, S, today: T0 }); st2.profile.corr = y.corr; assert.equal(S.dayPlan(st2, T0, 0).limit, y.limitNew, 'qabul qilingan tuzatish limitga kiradi');
  const kept = S.migrate(JSON.parse(JSON.stringify(st2))); assert.equal(kept.profile.corr, y.corr, 'tuzatish zaxira/migratsiyada saqlanadi');
  ok('Adaptiv: to\'liq yozuvda farq ≥ 150 → taklif (±10%, 10 kkal yaxlit), to\'liqsiz — yo\'q, 14 kunda bir marta, farq < 150 — yo\'q, oshirish ham, pastki chegara, juda tez ozishda faqat oshirish; tuzatish saqlanadi');
}
/* (e) migratsiya */
{
  const old = { v: 1, setup: true, profile: { sex: 'm', age: 35, height: 175, weight: 80, act: 3, goal: 'lose' }, prefs: { qa: 'on' }, days: { [T0]: { food: [], water: 0, steps: 14000 } }, weights: [{ d: T0, kg: 80 }] };
  let s = S.migrate(JSON.parse(JSON.stringify(old))); assert.equal(s.profile.job, undefined); assert.equal(S.dayPlan(s, T0).credit, 0, 'tasdiqlanmagan Android — kredit 0 (eski PAL bilan ikki marta hisoblanmaydi)'); assert.equal(S.dayPlan(s, T0).limit, S.plan(s.profile).target);
  s = S.migrate(Object.assign(JSON.parse(JSON.stringify(old)), { profile: Object.assign({}, old.profile, { job: 'stand', corr: 120 }) })); assert.equal(s.profile.job, 'stand'); assert.equal(s.profile.corr, 120); assert.ok(S.dayPlan(s, T0).credit > 0);
  s = S.migrate(Object.assign(JSON.parse(JSON.stringify(old)), { profile: Object.assign({}, old.profile, { job: 'xyz', corr: 99999 }) })); assert.equal(s.profile.job, undefined); assert.equal(s.profile.corr, undefined, 'noto\'g\'ri qiymat tashlanadi');
  const ex = S.exportState ? S.exportState(s) : null; if (ex) assert.ok(JSON.stringify(ex).length > 10);
  ok('Migratsiya: eski Android holati (qa on, ish turi yo\'q) — kredit 0; job/corr zaxira orqali saqlanadi, noto\'g\'risi tashlanadi');
}
console.log('limit-v51: ' + n + ' guruh OK');
