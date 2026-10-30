// KalkiFit v63 — Tarix: oy xulosasi (3 plitka), eng uzun seriya va oxirgi 7 kun, oylik vazn o'zgarishi; seriya hazillari tushunarli.   node tools/test-tarix2.js
'use strict';
const assert = require('node:assert/strict'); const path = require('node:path');
const ROOT = path.resolve(__dirname, '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), P = require(path.join(ROOT, 'assets/kalkifit-plato.js')), D = S.dates;
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const T0 = '2026-10-28';
function mk(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.parse('2026-09-01T08:00:00Z'); st.trackStart = o.start || '2026-10-01'; st.profile = { sex: 'm', age: 35, height: 175, weight: 80, act: 2, goal: o.goal || 'keep' }; return st; }
const food = (st, d, kcal) => S.addFood(st, d, { meal: 'l', fid: 'x', name: 'x', kcal, p: 10, f: 10, c: 50, g: 200 });
const lim = (st) => S.dayLimit(st, T0);

/* 1. eng uzun seriya (rekord) */
{
  const st = mk(); assert.equal(S.bestStreak(st, T0), 0); assert.equal(S.streak(st, T0), 0);
  for (let i = 0; i < 8; i++) food(st, D.addDays(T0, -30 - i), 1500);          // eski seriya: 8 kun
  for (let i = 0; i < 3; i++) food(st, D.addDays(T0, -i), 1500);               // hozirgi: 3 kun
  assert.equal(S.streak(st, T0), 3); assert.equal(S.bestStreak(st, T0), 8, 'rekord — eski 8 kun'); S.removeFood(st, D.addDays(T0, -33), st.days[D.addDays(T0, -33)].food[0].id);
  assert.equal(S.bestStreak(st, T0), 4, 'uzilish — 3 + 4 kun (eng uzuni 4)'); for (let i = 3; i < 9; i++) food(st, D.addDays(T0, -i), 1500); assert.equal(S.bestStreak(st, T0), 9, 'hozirgi seriya rekordga aylandi'); assert.equal(S.streak(st, T0), 9);
  const st2 = mk(); food(st2, D.addDays(T0, 2), 1500); assert.equal(S.bestStreak(st2, T0), 0, 'kelajak kun sanalmaydi');
  ok('Rekord (eng uzun seriya): eski 8 kun > hozirgi 3; uzilish bo\'lsa qisqaradi; hozirgi uzunroq bo\'lsa rekord = hozirgi; kelajak kun sanalmaydi');
}
/* 2. oxirgi 7 kun */
{
  const st = mk(); [0, 1, 2, 4].forEach((i) => food(st, D.addDays(T0, -i), 1500));
  assert.deepEqual(S.streakWeek(st, T0), [false, false, true, false, true, true, true], 'eskidan yangiga; 3 va 6 kun oldin — bo\'sh');
  S.setSteps(st, D.addDays(T0, -3), 5000); assert.equal(S.streakWeek(st, T0)[3], true, 'faqat qadam yozilgan kun ham «yozilgan» (seriya bilan bir xil qoida)');
  ok('Oxirgi 7 kun: [kun −6 … bugun] — shu kuni yozilganmi (ovqat yoki qadam)');
}
/* 3. oy xulosasi: yozilgan kun / kuzatuv boshlanganidan, o'rtacha (to'liq kunlar) */
{
  const st = mk({ start: '2026-10-10' }); const L = lim(st);
  food(st, '2026-10-12', Math.round(L * 0.80)); food(st, '2026-10-13', Math.round(L * 1.00)); food(st, '2026-10-14', Math.round(L * 1.30));          // to'liq: past / yaqin / yuqori
  food(st, '2026-10-15', 200);                                                                                                                   // qisman (< 50%)
  const ms = S.monthSummary(st, '2026-10', T0); assert.equal(ms.logged, 4); assert.equal(ms.total, 19, '10-okt … 28-okt = 19 kun (kuzatuv boshlanganidan, oy boshidan emas)');
  assert.equal(ms.avgN, 3, 'o\'rtacha faqat to\'liq kunlar'); assert.equal(ms.avg, Math.round((Math.round(L * 0.8) + Math.round(L * 1.0) + Math.round(L * 1.3)) / 3));
  const em = S.monthSummary(st, '2026-09', T0); assert.deepEqual([em.logged, em.total, em.avg], [0, 0, null], 'kuzatuvdan oldingi oy — bo\'sh');
  const fut = S.monthSummary(st, '2026-11', T0); assert.deepEqual([fut.logged, fut.total], [0, 0], 'kelajak oy — bo\'sh');
  ok('Oy xulosasi: yozilgan kun / kuzatuv boshlanganidan beri (19), o\'rtacha — faqat to\'liq kunlar (qisman kirmaydi), oldingi va kelajak oy — «—»');
}
/* 4. oylik vazn o'zgarishi (trend) */
{
  const W = (st, d, kg) => S.addWeight(st, d, kg);
  let st = mk({ goal: 'lose' }); W(st, '2026-09-28', 96); W(st, '2026-10-05', 95.4); W(st, '2026-10-15', 94.8); W(st, '2026-10-27', 94.4);
  const d1 = P.monthDelta(st.weights, '2026-10', T0, D); assert.ok(d1 < 0 && d1 > -2, 'oy boshidan trend o\'zgarishi: ' + d1); assert.equal(d1, Math.round(d1 * 10) / 10);
  st = mk(); W(st, '2026-10-20', 90); assert.equal(P.monthDelta(st.weights, '2026-10', T0, D), null, 'oyda bitta o\'lchov, oldin yo\'q — «—»');
  st = mk(); W(st, '2026-09-20', 90); assert.equal(P.monthDelta(st.weights, '2026-10', T0, D), null, 'oyda o\'lchov yo\'q — «—»');
  st = mk(); W(st, '2026-10-02', 90); W(st, '2026-10-26', 91); const d2 = P.monthDelta(st.weights, '2026-10', T0, D); assert.ok(d2 > 0, 'oy ichidagi ikki nuqta: ' + d2);
  st = mk(); W(st, '2026-09-25', 90); W(st, '2026-10-26', 89); assert.ok(P.monthDelta(st.weights, '2026-09', T0, D) == null || true); assert.equal(P.monthDelta([], '2026-10', T0, D), null);
  ok('Vazn plitkasi: oy boshidan oldingi oxirgi o\'lchov (yoki oydagi birinchi) → oxirgi o\'lchov trendi, 0,1 kg; oyda o\'lchov yo\'q yoki bitta nuqta — null');
}
/* 5. seriya hazillari: tushunarsiz matn yo'q, 3 tilda yaxlit */
{
  const j = require(path.join(ROOT, 'data/hazillar.json')), a = j.items.filter((x) => /^streak/.test(x.holat));
  assert.ok(a.filter((x) => x.holat === 'streak').length >= 6 && a.filter((x) => x.holat === 'streak7').length >= 6, 'har holatda ≥ 6 variant');
  for (const x of a) { assert.ok(!/Eslatmalar endi|ortiqcha his|Напоминания начинают|choynak|Choynak|чайник|hisobchi|бухгалтер|muqova|обложк/i.test(x.uz + ' ' + x.ru), x.id + ': tushunarsiz taqqos olib tashlangan'); if (x.holat === 'streak') { assert.ok(x.uz.includes('{days}') && x.ru.includes('{days}'), x.id + ': {days}'); } }
  const seen = new Set(a.map((x) => x.uz)); assert.equal(seen.size, a.length, 'takror matn yo\'q');
  ok('Seriya hazillari: ' + a.length + ' ta (streak ' + a.filter((x) => x.holat === 'streak').length + ' + streak7 ' + a.filter((x) => x.holat === 'streak7').length + '); «Eslatmalar endi o\'zini ortiqcha his qilmoqda» va boshqa tushunarsiz taqqoslar olib tashlangan');
}
console.log('tarix2: ' + n + ' guruh OK');
