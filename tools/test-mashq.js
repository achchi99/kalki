/* v55: mashg'ulot + qo'lda qadam (iPhone/veb) + kunlik balans — S.dayPlan (yagona funksiya), hech narsa ikki marta hisoblanmaydi (docs/limit.md).   node tools/test-mashq.js */
'use strict';
const assert = require('assert'); const S = require('../assets/kalkifit-core.js'); const D = S.dates, T = D.today();
const foods = S.buildIndex(S.normFoods(require('../data/ovqatlar.json').foods));
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const mk = (o = {}) => { const st = S.emptyState(); st.setup = true; st.profile = Object.assign({ sex: 'm', age: 35, height: 175, weight: 80, act: 2, goal: 'lose', job: 'sit' }, o.p); st.prefs = Object.assign({ qa: 'on' }, o.q); S.addWeight(st, T, 80); return st; };
/* 1. MET (2024 Compendium) — NET: (MET − 1) × kg × soat */
{ assert.equal(S.exNet({ t: 'yugurish', min: 25, lv: 1 }, 80), Math.round(6.5 * 80 * 25 / 60)); assert.equal(S.exNet({ t: 'zal', min: 60, lv: 0 }, 70), Math.round(2.5 * 70)); assert.equal(S.exNet({ t: 'futbol', min: 45, lv: 2 }, 80), Math.round(8.5 * 80 * 0.75));
  assert.deepEqual(S.EX.yugurish.met, [6.5, 7.5, 9.3]); assert.equal(S.EX_ORDER.length, 12); assert.ok(!S.EX.piyoda, 'piyoda yurish alohida tur emas (qadam bilan)'); for (const k of S.EX_ORDER) assert.ok(S.EX[k].met.every((m, i, a) => m > 1 && (!i || m >= a[i - 1])), k);
  ok('MET NET: yugurish o\'rtacha 25 daq × 80 kg = (7,5 − 1) × 80 × 25/60 = 217 kkal; zal yengil 60 daq × 70 kg = 175; 12 tur, piyoda yurish yo\'q (qadam), yengil ≤ o\'rtacha ≤ og\'ir'); }
/* 2. yugurish + qadam — ikki marta emas (Android avtomatik va iPhone qo'lda) */
for (const q of [{ qa: 'on' }, { qa: undefined, qm: 'on' }]) {
  const a = mk({ q }); S.addEx(a, T, { t: 'yugurish', min: 25, lv: 1 }); const run = S.dayPlan(a, T);
  const b = mk({ q }); S.addEx(b, T, { t: 'yugurish', min: 25, lv: 1 }); S.setSteps(b, T, 9000); const both = S.dayPlan(b, T);          // 9 000 = 5 000 baza + 4 000 (yugurishdagi 25 × 160)
  assert.equal(both.exOverlap, Math.round(S.walkNet(4000, 175, 80)), 'ustma-ust qadam'); assert.equal(both.credit, run.credit, 'kredit: yugurish + uning qadami = faqat yugurish'); assert.equal(both.sarf, run.sarf, 'sarf ham bir xil');
  const c = mk({ q }); S.addEx(c, T, { t: 'yugurish', min: 25, lv: 1 }); S.setSteps(c, T, 12000); const more = S.dayPlan(c, T); assert.ok(more.credit > both.credit, 'yugurishdan tashqari yurish (3 000) — qo\'shiladi'); assert.equal(more.exOverlap, both.exOverlap);
  const z = mk({ q }); S.addEx(z, T, { t: 'zal', min: 60, lv: 1 }); S.setSteps(z, T, 9000); const zz = S.dayPlan(z, T); assert.equal(zz.exOverlap, 0, 'zal — qadam hosil qilmaydi');
}
ok('Yugurish 25 daq + 9 000 qadam (Android va iPhone qo\'lda): yugurishdagi ~4 000 qadam qadam kreditida — mashg\'ulotdan ayiriladi, kredit va sarf faqat yugurish bilan bir xil; qo\'shimcha yurish qo\'shiladi; zal — ustma-ust yo\'q');
/* 3. 0,7 va 800 chegarasi */
{ const a = mk(); S.addEx(a, T, { t: 'zal', min: 60, lv: 1 }); const d = S.dayPlan(a, T); assert.equal(d.exCredit, Math.round(S.exNet({ t: 'zal', min: 60, lv: 1 }, 80) * 0.7));
  const b = mk(); S.addEx(b, T, { t: 'kurash', min: 180, lv: 2 }); S.setSteps(b, T, 30000); const e = S.dayPlan(b, T); assert.equal(e.credit, 800, 'qadam + mashg\'ulot ≤ 800'); assert.equal(e.stepCredit + e.exCredit, 800); assert.ok(e.sarf > e.plan.tdee + 1500, 'sarf to\'liq (cheklovsiz)');
  assert.equal(e.limit, e.plan.tdee + 800 + e.delta); ok('Mashg\'ulot krediti = NET × 0,7; qadam + mashg\'ulot krediti ≤ 800 kkal (sarf esa to\'liq ko\'rsatiladi)'); }
/* 4. iPhone: qo'lda qadam → ish turi tasdiqlangan (qm) — kredit; tasdiqlanmagan / ACT — 0; kiritilmagan kun — k ish turidan */
{ const web = mk({ q: { qa: undefined, qm: 'on' } }); S.setSteps(web, T, 9000); assert.ok(S.dayPlan(web, T).stepCredit > 0); assert.equal(S.dayPlan(web, T).k, 1.4);
  const off = mk({ q: { qa: undefined, qm: 'off' } }); S.setSteps(off, T, 9000); S.addEx(off, T, { t: 'futbol', min: 60, lv: 1 }); const o = S.dayPlan(off, T); assert.deepEqual([o.credit, o.job, o.sarf], [0, null, o.plan.tdee], 'tasdiqlanmagan — kredit 0, sarf = umumiy daraja (yurish ichida)');
  const none = mk({ q: { qa: undefined, qm: 'on' } }); const z = S.dayPlan(none, T); assert.deepEqual([z.credit, z.k, z.job], [0, 1.4, 'sit'], 'qadam kiritilmagan kun — kredit 0, k ish turidan (eski daraja emas)');
  ok('iPhone/veb: qo\'lda qadam + ish turi tasdiqlangan → kredit (k = 1,40); tasdiqlanmasa — kredit 0, sarf = umumiy daraja; kiritilmagan kun — kredit 0, k ish turidan'); }
/* 5. balans = iste'mol − sarf; tafsilot yig'indisi = sarf */
{ const a = mk(); S.setSteps(a, T, 8420); S.addEx(a, T, { t: 'yugurish', min: 25, lv: 1 }); S.addEx(a, T, { t: 'zal', min: 20, lv: 1 }); const b1 = S.dayBal(a, T, 1635), d = b1.dp;
  assert.equal(b1.bal, 1635 - b1.sarfNow); assert.equal(d.bmr + d.life + d.corr + d.stepNet + d.exNet, b1.sarfDay, 'tinch + kundalik + tuzatish + qadam + mashg\'ulot = kunlik jami sarf'); assert.equal(b1.reja, d.delta);
  assert.equal(S.dayBalance(a, T, 1635).remaining, d.limit - 1635, 'halqa qoldig\'i — shu limitdan'); ok('Balans = iste\'mol − hozirgacha sarf (' + b1.bal + '); tafsilot qatorlari yig\'indisi = kunlik jami sarf (' + b1.sarfDay + '); halqa qoldig\'i — o\'sha dayPlan limitidan'); }
/* 5b. v56: balans — HOZIRGACHA sarf (tinch qism kunning o'tgan ulushida, harakat to'liq); 08 / 14 / 23:59; o'tgan kun — to'liq */
{ const at = (h, m) => { const [y, mo, dd] = T.split('-').map(Number); return new Date(y, mo - 1, dd, h, m || 0); };
  const a = mk(); S.setSteps(a, T, 8420); S.addEx(a, T, { t: 'zal', min: 30, lv: 1 }); const dp = S.dayPlan(a, T), mov = dp.stepNet + dp.exNet, base = dp.sarf - mov;
  assert.ok(mov > 0 && dp.delta < 0);
  const h8 = S.dayBal(a, T, 450, at(8)); assert.equal(h8.f, 8 / 24); assert.equal(h8.sarfNow, Math.round(base * 8 / 24) + mov); assert.equal(h8.bal, 450 - h8.sarfNow); assert.equal(h8.rejaF, Math.round(dp.delta / 3));
  assert.notEqual(h8.holat, 'ortiq', 'ertalab nonushtadan keyin «ortiqcha» emas: ' + JSON.stringify(h8));
  const h14 = S.dayBal(a, T, 1200, at(14)); assert.equal(h14.sarfNow, Math.round(base * 14 / 24) + mov); assert.equal(h14.holat, h14.bal > 100 ? 'ortiq' : h14.bal < h14.rejaF - 100 ? 'ozish' : 'mos');
  const big = S.dayBal(a, T, h14.sarfNow + 300, at(14)); assert.equal(big.holat, 'ortiq'); assert.equal(S.dayBal(a, T, h14.sarfNow + h14.rejaF, at(14)).holat, 'mos'); assert.equal(S.dayBal(a, T, h14.sarfNow + h14.rejaF - 300, at(14)).holat, 'ozish');
  const h23 = S.dayBal(a, T, 1800, at(23, 59)); assert.ok(Math.abs(h23.sarfNow - dp.sarf) <= Math.ceil(base / 1440) + 1, '23:59 ≈ to\'liq kun');
  const h24 = S.dayBal(a, T, 1800, new Date(at(23, 59).getTime() + 59999)); assert.ok(h24.sarfNow <= dp.sarf);
  assert.equal(S.dayBal(a, T, 1800, at(0)).sarfNow, mov, '00:00 — faqat harakat');
  const y = D.addDays(T, -1); S.setSteps(a, y, 3000); const yb = S.dayBal(a, y, 1800, at(8)); assert.equal(yb.f, 1); assert.equal(yb.sarfNow, S.dayPlan(a, y).sarf, 'o\'tgan kun — to\'liq sarf');
  ok('«Hozirgacha» balans: 08:00 — sarf ' + h8.sarfNow + ' (tinch × 8/24 + harakat), «ortiqcha» emas; 14:00 — holat chegaralari (±100, reja ulushi); 23:59 — kunlik to\'liq sarf (' + dp.sarf + '); 00:00 — faqat harakat; kecha — to\'liq'); }
/* 6. matndan mashg'ulot */
{ const P = (q) => S.parseText(q, foods, {}); let r = P("30 daqiqa futbol o'ynadim"); assert.deepEqual(r.ex.map((e) => [e.t, e.min, e.lv]), [['futbol', 30, 1]]); assert.equal(r.items.length + r.missing.length, 0);
  r = P('yarim soat yugurdim, 2 ta non va choy'); assert.deepEqual(r.ex.map((e) => [e.t, e.min]), [['yugurish', 30]]); assert.deepEqual(r.items.map((x) => x.fid), ['non', 'choy']);
  assert.deepEqual(P('пробежка 20 минут').ex.map((e) => [e.t, e.min]), [['yugurish', 20]]); assert.deepEqual(P('45 min qattiq boks').ex.map((e) => [e.t, e.min, e.lv]), [['kurash', 45, 2]]); assert.deepEqual(P('sport zalda 1 soat').ex.map((e) => e.t), ['zal']); assert.equal(P('osh va choy').ex.length, 0);
  ok('Matn/ovoz: «30 daqiqa futbol o\'ynadim» → futbol 30 daq; «yarim soat yugurdim, 2 ta non va choy» → yugurish + non + choy; «пробежка 20 минут», «45 min qattiq boks» (og\'ir), «sport zalda 1 soat» → zal; ovqat — mashg\'ulot emas'); }
/* 7. migratsiya / zaxira */
{ const a = mk(); S.addEx(a, T, { t: 'raqs', min: 40, lv: 0 }); const raw = JSON.parse(JSON.stringify(a)); raw.days[T].ex.push({ t: 'xyz', min: 10 }, { t: 'zal', min: 0 }); const m = S.migrate(raw); assert.deepEqual(m.days[T].ex.map((e) => [e.t, e.min, e.lv]), [['raqs', 40, 0]]);
  const back = S.importState(S.exportState(a)); assert.equal((back.state || back).days[T].ex.length, 1); const rm = S.removeEx(a, T, a.days[T].ex[0].id); assert.equal(a.days[T].ex.length, 0); S.restoreEx(a, T, rm); assert.equal(a.days[T].ex.length, 1);
  ok('Migratsiya (noto\'g\'ri tur / 0 daqiqa tashlanadi), eksport/import, o\'chirish + qaytarish'); }
/* 8. plato: 5-sabab «mashg'ulot kunlari ko'proq yeyiladi» — mashg'ulot kunlari iste'mol farqi limitga qo'shilgan kreditdan ≥ 200 kkal ortiq */
{ const P = require('../assets/kalkifit-plato.js'); const mkP = (exEat) => { const a = mk(); a.created = Date.now() - 40 * 864e5; a.trackStart = D.addDays(T, -40); a.weights = []; let kg = 86;
    for (let i = 30; i >= 1; i--) { const d = D.addDays(T, -i), ex = i % 3 === 0; S.addFood(a, d, { meal: 'l', fid: 'x', name: 'x', kcal: ex ? 2100 + exEat : 2100, p: 140, f: 60, c: 200, g: 500 }); if (ex) S.addEx(a, d, { t: 'zal', min: 60, lv: 1 }); if (i % 4 === 0 || i === 1) S.addWeight(a, d, kg -= 0.02); }
    a.profile.weight = 86; return P.analyze({ st: a, S, today: T }); };
  const hi = mkP(700), lo = mkP(150); const r = hi && hi.reasons ? hi.reasons.find((x) => x.k === 'mashq') : null;
  assert.ok(r, 'sabab: ' + JSON.stringify(hi && hi.reasons)); assert.ok(r.diff >= 600 && r.cred > 0); assert.ok(!(lo && lo.reasons || []).some((x) => x.k === 'mashq'), 'farq kreditdan kam — sabab yo\'q');
  ok('Plato 5-sabab: mashg\'ulot kunlari +' + r.diff + ' kkal ko\'p, limitga ' + r.cred + ' kkal qo\'shilgan → «Mashg\'ulot kunlari ko\'proq yeyiladi»; farq kreditdan kam bo\'lsa — chiqmaydi'); }
console.log('mashq: ' + n + ' guruh OK');
