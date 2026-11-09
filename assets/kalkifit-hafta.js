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
      var exm = (x.ex || []).reduce(function (a, e) { return a + (e.min || 0); }, 0), exk = exm && S.dayPlan ? (function (dp) { return dp.job ? dp.exNet : dp.exRaw; })(S.dayPlan(st, d)) : 0;          // v55: mashg'ulot daqiqasi va sarfi
      return { d: d, food: x.food.length, kcal: tot.kcal, p: tot.p, steps: x.steps || 0, ml: wi.ml || 0, state: ds.state, limit: ds.limit || S.dayLimit(st, d), exMin: exm, exKcal: exk || 0 };
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
      waterAvg: waterAvg, waterGoal: waterGoal, stepsAvg: stepsAvg, stepsSum: stepD.reduce(function (s, r) { return s + r.steps; }, 0), exMin: rows.reduce(function (s, r) { return s + r.exMin; }, 0), exKcal: rows.reduce(function (s, r) { return s + r.exKcal; }, 0), exDays: rows.filter(function (r) { return r.exMin > 0; }).length, stepGoal: stepGoal, best: best ? best.d : null, streak: S.streak(st, end), tip: tip };
  }
  /* Yakshanba 19:00 dan dushanba oxirigacha ko'rsatiladi; end — xulosa haftasining oxirgi kuni (yakshanba) */
  function dueEnd(S, today, hour) { var wd = S.weekdayIdx(today); if (wd === 6 && hour >= 19) return today; if (wd === 0) return S.dates.addDays(today, -1); return null; }

  /* =====================================================================================================================================================
     v76 «HAFTANGIZ» — Wrapped uslubidagi to'liq model (qurilmada, serverga hech narsa ketmaydi). model(S, st, end, ctx) → { kinds, ... } — slaydlar ma'lumot bo'lsa chiqadi.
     ctx: { today, foodName(fid), foodImg(fid), kcalUnit(fid, unit) → { kcal, name }, goal (oldingi qabul qilingan maqsad), badgesSeen: {id: sana} }
     ===================================================================================================================================================== */
  var KG_KCAL = 7700, FAT_PACK_G = 200, EVEN_TOL = 300, LOW_DAY_DEFICIT = 1000;          // 1 kg yog' ≈ 7700 kkal; sariyog' paketi 200 g; «taxminan teng» ±300 kkal; kuniga >1000 kkal defitsit — ogohlantirish
  /* O'zbekiston shaharlari orasidagi taxminiy yo'l masofalari (km) — «Haftangiz» harakat slaydi taqqoslashi uchun BITTA joyda */
  var ROUTES = [['Xiva', 'Urganch', 35], ['Toshkent', 'Chirchiq', 30], ['Qarshi', 'Muborak', 60], ['Samarqand', 'Jizzax', 120], ['Toshkent', 'Guliston', 110], ['Buxoro', 'Navoiy', 100], ['Andijon', "Farg'ona", 130], ['Samarqand', 'Buxoro', 270], ['Toshkent', 'Samarqand', 300], ['Toshkent', 'Andijon', 330], ['Toshkent', 'Buxoro', 570]];
  /* qiziqarli taqqoslash: [taom id, birlik, ko'plik shakli kalit] — kkal bazadan (ctx.kcalUnit); tasodifiy biri (hafta sanasi bo'yicha barqaror) */
  var FUN = [['somsa', 'dona'], ['osh', 'kosa'], ['lagmon', 'kosa'], ['manti', 'dona'], ['non', 'bolak'], ['banan', 'dona'], ['pitsa', 'bolak']];
  /* NISHONLAR — bitta joyda: id, ikonka (engine ICONS), sinov(model) */
  var BADGES = [
    { id: 'streak7', ic: 'flame', test: function (m) { return m.logged >= 7; } },
    { id: 'near4', ic: 'target', test: function (m) { return m.nearN >= 4; } },
    { id: 'protein', ic: 'shield', test: function (m) { return m.macros.protDays >= 5; } },
    { id: 'water', ic: 'drop', test: function (m) { return m.water.goalDays >= 5; } },
    { id: 'steps', ic: 'shoe', test: function (m) { return m.move.steps > 0 && m.move.avgSteps >= m.move.goal; } },
    { id: 'firstEx', ic: 'bolt', test: function (m) { return m.move.exDays > 0 && !m.move.exBefore; } },
    { id: 'balance', ic: 'scale', test: function (m) { return m.lost.state === 'even' && m.lost.nDays >= 4; } },
    { id: 'saver', ic: 'leaf', test: function (m) { return m.lost.state === 'deficit' && !m.lost.low && m.lost.kg >= 0.2 && m.lost.nDays >= 4; } }
  ];
  function seedOf(str) { var h = 7; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 1000003; return h; }
  function weekEnds(S, today, n) {                      // «Oxirgi 7 kun» (bugun) + tugagan Du–Ya haftalar (oxirgi n ta): har biri { end, kind }
    var D = S.dates, out = [{ end: today, kind: 'rolling' }], wd = S.weekdayIdx(today), sun = wd === 6 ? D.addDays(today, -7) : D.addDays(today, -(wd + 1));
    for (var i = 0; i < (n || 8); i++) out.push({ end: D.addDays(sun, -7 * i), kind: 'week' }); return out;
  }
  function routeOf(km) {                                // eng katta yo'l, masofasi ≤ km; kichikroq bo'lsa — eng qisqasining ulushi
    var best = null; ROUTES.forEach(function (r) { if (r[2] <= km && (!best || r[2] > best[2])) best = r; });
    if (best) { var t = km / best[2]; return { a: best[0], b: best[1], km: best[2], times: Math.round(t * 10) / 10, part: false }; }
    var r0 = ROUTES.slice().sort(function (a, b) { return a[2] - b[2]; })[0]; return { a: r0[0], b: r0[1], km: r0[2], times: Math.min(1, Math.round(km / r0[2] * 100) / 100), part: true };
  }
  function proteinGoal(S, st) { var pl = S.planSt ? S.planSt(st) : S.plan(st.profile); return pl.macros && pl.macros.p ? pl.macros.p : 0; }
  function pickGoal(m) {                                // kelasi hafta uchun BITTA aniq maqsad (ma'lumotga qarab)
    if (m.logged < 5) return { id: 'log', n: 5 };
    if (m.water.avg != null && m.water.avg < m.water.goal * 0.7) return { id: 'water', n: Math.max(4, Math.round(m.water.goal / 250)) };
    if (m.dinnerKcal && m.avgKcal && m.dinnerKcal > m.avgKcal * 0.4 && m.avgKcal > 1500) return { id: 'dinner', n: 300 };
    if (m.move.avgSteps != null && m.move.avgSteps < Math.min(m.move.goal, 7000) * 0.75) return { id: 'steps', n: Math.min(m.move.goal, Math.round(((m.move.avgSteps || 3000) + 1500) / 500) * 500) };
    if (m.macros.protDays < 4) return { id: 'prot', n: 4 };
    return { id: 'keep', n: 0 };
  }
  function evalGoal(g, m) {                              // oldingi hafta maqsadi — shu hafta natijasi: { id, ok } (null — baholab bo'lmaydi)
    if (!g || !g.id) return null; var ok = null;
    if (g.id === 'log') ok = m.logged >= (g.n || 5); else if (g.id === 'water') ok = m.water.avg != null && m.water.avg >= (g.n || 8) * 250 * 0.9;
    else if (g.id === 'dinner') ok = m.dinnerKcal != null && m.dinnerPrev != null ? m.dinnerKcal <= m.dinnerPrev - (g.n || 300) * 0.5 : null;
    else if (g.id === 'steps') ok = m.move.avgSteps != null && m.move.avgSteps >= (g.n || 6000) * 0.95; else if (g.id === 'prot') ok = m.macros.protDays >= (g.n || 4); else if (g.id === 'keep') ok = m.logged >= 4;
    return ok == null ? null : { id: g.id, ok: !!ok, n: g.n || 0 };
  }
  /* bitta hafta: kunlar, balans (energiya) va boshqa hisoblar. prev=true — o'tgan hafta uchun yengil model (faqat taqqoslash). */
  function model(S, st, end, ctx, prev) {
    ctx = ctx || {}; var D = S.dates, today = ctx.today || D.today(), w = summary(S, st, end, today), pl = S.planSt ? S.planSt(st) : S.plan(st.profile), pg = proteinGoal(S, st), self = {};
    var rows = w.rows.map(function (r, i) {
      var x = S.dayOf(st, r.d) || { food: [], water: 0, steps: 0 }, tot = S.sumEntries(x.food), ds = S.dayStatus(st, r.d, today), dp = r.food ? S.dayPlan(st, r.d) : null, dinner = 0;
      x.food.forEach(function (e) { if (e.meal === 'd') dinner += e.kcal || 0; });
      return { d: r.d, dow: S.weekdayIdx(r.d), logged: r.food > 0, n: x.food.length, k: Math.round(tot.kcal), p: tot.p, f: tot.f, c: tot.c, steps: x.steps || 0, ml: r.ml || 0, state: ds.state, complete: !!ds.complete, limit: ds.limit || r.limit,
        spend: dp ? Math.round(dp.sarf) : 0, bmr: dp ? Math.round(dp.bmr) : 0, dinner: Math.round(dinner), exMin: r.exMin || 0, exKcal: r.exKcal || 0 };
    });
    var logged = rows.filter(function (r) { return r.logged; }), loggedN = logged.length, streakMax = 0, cur = 0; rows.forEach(function (r) { cur = r.logged ? cur + 1 : 0; if (cur > streakMax) streakMax = cur; });
    var full = rows.filter(function (r) { return r.complete; }), avgK = full.length ? Math.round(full.reduce(function (a, r) { return a + r.k; }, 0) / full.length) : null, nearN = rows.filter(function (r) { return r.state === 'near'; }).length;
    /* eng yaxshi kun: to'liq kun, maqsadga eng yaqin */
    var best = null; full.forEach(function (r) { var dv = Math.abs(r.k - r.limit); if (!best || dv < best.dv) best = { d: r.d, dv: dv }; });
    /* ---- energiya balansi: farq = sarf − iste'mol (to'liq yozilgan kunlar); defitsit / teng / ortiqcha ---- */
    var incl = full.filter(function (r) { return r.spend > 0; }), tot = incl.reduce(function (a, r) { return a + (r.spend - r.k); }, 0), nD = incl.length;
    var avgEaten = nD ? incl.reduce(function (a, r) { return a + r.k; }, 0) / nD : 0, avgBmr = nD ? incl.reduce(function (a, r) { return a + r.bmr; }, 0) / nD : 0, avgDef = nD ? tot / nD : 0;
    var state = !nD ? 'none' : (tot > EVEN_TOL ? 'deficit' : (tot < -EVEN_TOL ? 'surplus' : 'even')), low = state === 'deficit' && (avgDef > LOW_DAY_DEFICIT || (avgBmr > 0 && avgEaten < avgBmr * 0.8));
    var kg = Math.round(Math.abs(tot) / KG_KCAL * 100) / 100;
    var lost = { state: state, total: Math.round(tot), kg: kg, packs: Math.round(kg * 1000 / FAT_PACK_G * 10) / 10, nDays: nD, low: low, avgEaten: Math.round(avgEaten), avgBmr: Math.round(avgBmr), avgDef: Math.round(avgDef),
      per: incl.map(function (r) { return { d: r.d, dow: r.dow, diff: Math.round(r.spend - r.k) }; }) };
    /* ---- qiziqarli taqqoslash: jami iste'mol kkal = N ta ... ---- */
    var sumK = logged.reduce(function (a, r) { return a + r.k; }, 0), fun = null;
    if (sumK > 0 && ctx.kcalUnit) { var cands = FUN.map(function (f) { var u = ctx.kcalUnit(f[0], f[1]); return u && u.kcal > 0 ? { id: f[0], unit: f[1], name: u.name, one: u.kcal } : null; }).filter(Boolean); if (cands.length) { var c = cands[seedOf(end) % cands.length]; fun = { id: c.id, unit: c.unit, name: c.name, img: ctx.foodImg ? ctx.foodImg(c.id) : '', n: Math.max(1, Math.round(sumK / c.one * 10) / 10), kcal: Math.round(sumK) }; } }
    /* ---- top-3 taom ---- */
    var cnt = {}, order = []; logged.forEach(function (r) { (S.dayOf(st, r.d).food || []).forEach(function (e) { var k = e.fid || (e.name ? 'n:' + e.name : ''); if (!k) return; if (!cnt[k]) { cnt[k] = { fid: e.fid || null, name: e.name || '', n: 0 }; order.push(k); } cnt[k].n++; }); });
    var top = order.map(function (k) { return cnt[k]; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 3).map(function (t) { return { fid: t.fid, n: t.n, name: t.fid && ctx.foodName ? ctx.foodName(t.fid) : t.name, img: t.fid && ctx.foodImg ? ctx.foodImg(t.fid) : '' }; });
    /* ---- makrolar ---- */
    var sp = 0, sf = 0, sc = 0; logged.forEach(function (r) { sp += r.p; sf += r.f; sc += r.c; }); var kP = sp * 4, kF = sf * 9, kC = sc * 4, kT = kP + kF + kC || 1;
    var protDays = pg ? logged.filter(function (r) { return r.n >= 2 && r.p >= pg; }).length : 0;
    var macros = { p: loggedN ? Math.round(sp / loggedN) : 0, f: loggedN ? Math.round(sf / loggedN) : 0, c: loggedN ? Math.round(sc / loggedN) : 0, sh: [kP / kT, kF / kT, kC / kT], protDays: protDays, protGoal: Math.round(pg) };
    /* ---- suv ---- */
    var wDays = rows.filter(function (r) { return r.ml > 0 || r.logged; }), wGoal = pl.water ? pl.water.ml : 2000, wTot = rows.reduce(function (a, r) { return a + r.ml; }, 0);
    var water = { total: wTot, liters: Math.round(wTot / 100) / 10, goal: wGoal, avg: wDays.length ? Math.round(wTot / wDays.length) : null, per: rows.map(function (r) { return { dow: r.dow, ml: r.ml }; }), goalDays: rows.filter(function (r) { return r.ml >= wGoal * 0.9; }).length };
    /* ---- harakat ---- */
    var stepsSum = rows.reduce(function (a, r) { return a + r.steps; }, 0), km = rows.reduce(function (a, r) { return a + (S.stepsStats ? S.stepsStats(st, r.steps).km : 0); }, 0); km = Math.round(km * 10) / 10;
    var exMin = rows.reduce(function (a, r) { return a + r.exMin; }, 0), exK = rows.reduce(function (a, r) { return a + r.exKcal; }, 0), exDays = rows.filter(function (r) { return r.exMin > 0; }).length, stD = rows.filter(function (r) { return r.steps > 0; }), exBefore = false;
    Object.keys(st.days || {}).forEach(function (d) { if (d < w.days[0] && ((st.days[d] || {}).ex || []).length) exBefore = true; });
    var move = { steps: stepsSum, km: km, route: km > 0 ? routeOf(km) : null, exMin: exMin, exKcal: Math.round(exK), exDays: exDays, avgSteps: stD.length ? Math.round(stepsSum / stD.length) : null, goal: st.stepGoal || 8000, exBefore: exBefore };
    /* ---- vazn ---- */
    var ws = S.weekSummary ? S.weekSummary(st, end, today) : null, wIn = (st.weights || []).some(function (x) { return x.d >= w.days[0] && x.d <= end; }), weight = { has: !!(ws && ws.weightDelta != null && wIn), delta: ws && ws.weightDelta != null ? ws.weightDelta : 0 };          // vazn slaydi — shu hafta ichida vazn kiritilgan bo'lsa
    var m = { end: end, from: w.days[0], rows: rows, logged: loggedN, streakMax: streakMax, avgKcal: avgK, target: pl.target, nearN: nearN, best: best ? best.d : null, lost: lost, fun: fun, top: top, macros: macros, water: water, move: move, weight: weight,
      sumKcal: Math.round(sumK), dinnerKcal: loggedN ? Math.round(logged.reduce(function (a, r) { return a + r.dinner; }, 0) / loggedN) : null, empty: !loggedN && !stepsSum && !wTot };
    if (prev) return m;
    /* ---- o'tgan hafta bilan taqqoslash ---- */
    var pm = model(S, st, D.addDays(end, -7), ctx, true); m.dinnerPrev = pm.logged ? pm.dinnerKcal : null;
    var vs = []; if (pm.logged && loggedN) { var add = function (k, now, was, unit) { if (now == null || was == null) return; vs.push({ k: k, now: now, was: was, d: now - was, dir: now > was ? 'up' : (now < was ? 'down' : 'same'), unit: unit || '' }); };
      add('days', loggedN, pm.logged); add('steps', stepsSum, pm.move.steps, 'steps'); add('water', water.liters, pm.water.liters, 'l'); add('prot', macros.protDays, pm.macros.protDays); if (exMin || pm.move.exMin) add('ex', exMin, pm.move.exMin, 'min'); vs = vs.slice(0, 4); }
    m.vs = vs;
    /* ---- nishonlar ---- */
    var seen = ctx.badgesSeen || {}; m.badges = BADGES.filter(function (b) { return b.test(m); }).map(function (b) { return { id: b.id, ic: b.ic, isNew: !seen[b.id] }; });
    /* ---- maqsad ---- */
    m.goal = pickGoal(m); m.goalPrev = evalGoal(ctx.goal, m);
    /* ---- slaydlar rejasi: ma'lumot yo'q bo'lsa tushib qoladi (kamida 4) ---- */
    var few = loggedN <= 2, k = ['intro', 'days']; if (loggedN) k.push('kcal'); if (lost.state !== 'none') k.push('lost'); if (fun && !few) k.push('fun'); if (top.length && !few) k.push('top'); if (loggedN && !few) k.push('macros'); if (wTot > 0 && !few) k.push('water'); if (stepsSum > 0 || exMin > 0) k.push('move');          // 1–2 kun yozilgan hafta: iliq qisqa versiya
    if (weight.has) k.push('weight'); if (vs.length) k.push('vs'); if (m.badges.length) k.push('badges'); k.push('goal', 'final'); m.kinds = k; return m;
  }
  var api = { summary: summary, dueEnd: dueEnd, model: model, weekEnds: weekEnds, routeOf: routeOf, pickGoal: pickGoal, evalGoal: evalGoal, BADGES: BADGES, ROUTES: ROUTES, FUN: FUN, KG_KCAL: KG_KCAL, FAT_PACK_G: FAT_PACK_G, EVEN_TOL: EVEN_TOL, LOW_DAY_DEFICIT: LOW_DAY_DEFICIT };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiHafta = api;
})(typeof window !== 'undefined' ? window : this);
