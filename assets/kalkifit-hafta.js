/* kalki.uz — KalkiFit: «Haftangiz xulosasi» (oxirgi 7 kun). Hammasi QURILMADA hisoblanadi (serverga hech narsa ketmaydi).
   O'rtacha kkal (yozilgan kunlar), maqsadga yaqin kunlar (to'liq kun, ±10%), suv, qadam, eng yaxshi kun, ketma-ket kunlar, bitta aniq maslahat.
   DOM'siz: brauzerda window.KalkiHafta, Node'da require(). */
(function (root) {
  'use strict';
  function avg(a) { return a.length ? Math.round(a.reduce(function (s, x) { return s + x; }, 0) / a.length) : null; }
  /* S — KalkiFit core; end — haftaning oxirgi kuni (odatda bugun, yakshanba) */
  function summary(S, st, end, today) {
    var D = S.dates, days = [], i; today = today || end; for (i = 6; i >= 0; i--) days.push(D.addDays(end, -i));
    var pl = S.planSt ? S.planSt(st) : S.plan(st.profile), rows = days.map(function (d) {
      var x = S.dayOf(st, d) || { food: [], water: 0, steps: 0 }, tot = S.sumEntries(x.food), ds = S.dayStatus(st, d, today), wi = S.waterInfo ? S.waterInfo(st, d) : { ml: (x.water || 0) * S.GLASS_ML };
      return { d: d, food: x.food.length, kcal: tot.kcal, p: tot.p, steps: x.steps || 0, ml: wi.ml || 0, state: ds.state, limit: ds.limit || S.dayLimit(st, d) };
    });
    var logged = rows.filter(function (r) { return r.food > 0; }), stepD = rows.filter(function (r) { return r.steps > 0; }), wD = rows.filter(function (r) { return r.ml > 0 || r.food > 0; });
    var empty = !logged.length && !stepD.length && !rows.some(function (r) { return r.ml > 0; });
    var near = rows.filter(function (r) { return r.state === 'near'; }), high = rows.filter(function (r) { return r.state === 'high'; });
    var best = null;
    near.forEach(function (r) { if (!best || r.steps > best.steps) best = r; });
    if (!best) logged.forEach(function (r) { if (r.state === 'live' || r.state === 'part' && r.d === today) return; var dv = Math.abs(r.kcal - r.limit); if (!best || dv < Math.abs(best.kcal - best.limit)) best = r; });
    if (!best) stepD.forEach(function (r) { if (!best || r.steps > best.steps) best = r; });
    var waterAvg = avg(wD.map(function (r) { return r.ml; })), stepsAvg = avg(stepD.map(function (r) { return r.steps; })), pAvg = avg(logged.map(function (r) { return r.p; }));
    var waterGoal = pl.water ? pl.water.ml : 2000, stepGoal = st.stepGoal || 8000, tip = 'keep';
    if (logged.length < 4) tip = 'log';
    else if (waterAvg != null && waterAvg < waterGoal * 0.6) tip = 'water';
    else if (stepsAvg == null || stepsAvg < Math.min(5000, stepGoal * 0.6)) tip = 'steps';
    else if (high.length >= 3) tip = 'over';
    else if (pl.macros && pAvg != null && pAvg < pl.macros.p * 0.7) tip = 'protein';
    return { days: days, rows: rows, empty: empty, logged: logged.length, avgKcal: avg(logged.map(function (r) { return r.kcal; })), target: pl.target, near: near.length, high: high.length,
      waterAvg: waterAvg, waterGoal: waterGoal, stepsAvg: stepsAvg, stepsSum: stepD.reduce(function (s, r) { return s + r.steps; }, 0), stepGoal: stepGoal, best: best ? best.d : null, streak: S.streak(st, end), tip: tip };
  }
  /* Yakshanba 19:00 dan dushanba oxirigacha ko'rsatiladi; end — xulosa haftasining oxirgi kuni (yakshanba) */
  function dueEnd(S, today, hour) { var wd = S.weekdayIdx(today); if (wd === 6 && hour >= 19) return today; if (wd === 0) return S.dates.addDays(today, -1); return null; }
  var api = { summary: summary, dueEnd: dueEnd };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiHafta = api;
})(typeof window !== 'undefined' ? window : this);
