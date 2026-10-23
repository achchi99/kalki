/* kalki.uz — "KalkiFit" ilovasi hisob moduli. DOM'siz, sof funksiyalar (brauzerda window.KalkiFit, Node'da require()).
 * Sana funksiyalari (mahalliy kalendar, UTC'siz) — rozgor-core.js dan. Formulalar va qoidalar: docs/kalkifit.md.
 * Hamma natija "taxminiy hisob": tibbiy maslahat emas. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { var api0 = factory(require('./rozgor-core.js')); try { var fs0 = require('fs'), p0 = require('path'); api0.setSuv(JSON.parse(fs0.readFileSync(p0.join(__dirname, '..', 'data', 'suv-ulush.json'), 'utf8'))); } catch (e) {} module.exports = api0; }       // Node (testlar): suv ulushi jadvali o'zi yuklanadi
  else root.KalkiFit = factory(root.KalkiRozgor);
})(typeof self !== 'undefined' ? self : this, function (D) {
  'use strict';

  var VERSION = 1;
  var ACT = { 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725, 5: 1.9 };                 // faollik koeffitsientlari (oddiy tildagi nomlari ilovada)
  var KCAL_PER_KG = 7700;
  var GOAL_DELTA = { keep: 0, slow: -275, lose: -550, gain: 275 };           // kcal/kun: −0,25 / −0,5 / +0,25 kg/hafta
  var FLOOR = { m: 1500, f: 1200 };                                          // kunlik maqsadning pastki chegarasi
  var PROTEIN_PER_KG = { keep: 1.6, slow: 1.8, lose: 2.0, gain: 1.8 };
  var PROTEIN_MAX_SHARE = 0.35, FAT_SHARE = 0.275;
  var WATER_ML_PER_KG = 33, GLASS_ML = 250;
  var STRIDE_K = 0.414, MET_WALK = 3.5, WALK_KMH = 5, MET_NET = MET_WALK - 1;           // MET_NET: sof sarf (dam olish sarfisiz)
var STEP_BASE = { 1: 4000, 2: 4000, 3: 7000, 4: 10000, 5: 13000 };                    // faollik darajasiga odatiy kunlik qadam (kam harakat / o'rtacha / faol / juda faol) — me'yorga allaqachon kiritilgan
  var MEALS = ['b', 'l', 'd', 's'];                                          // nonushta, tushlik, kechki ovqat, gazak
  var LIMITS = { age: [10, 100], height: [120, 230], weight: [30, 250] };

  function round1(x) { return Math.round(x * 10) / 10; }
  function num(x) { var n = typeof x === 'string' ? parseFloat(x.replace(',', '.').replace(/[\s ]/g, '')) : Number(x); return isFinite(n) ? n : 0; }

  /* ---------- profil va me'yor ---------- */
  function bmrRaw(sex, weight, height, age) { return 10 * weight + 6.25 * height - 5 * age + (sex === 'f' ? -161 : 5); }       // Mifflin–St Jeor
  function bmi(weight, height) { return height > 0 ? weight / Math.pow(height / 100, 2) : 0; }
  function validate(p) {
    var err = {};
    if (!p || (p.sex !== 'm' && p.sex !== 'f')) err.sex = 1;
    [['age', 'age'], ['height', 'height'], ['weight', 'weight']].forEach(function (k) { var v = num(p && p[k[0]]), l = LIMITS[k[1]]; if (!(v >= l[0] && v <= l[1])) err[k[0]] = 1; });
    if (!p || !ACT[p.act]) err.act = 1;
    if (!p || GOAL_DELTA[p.goal] == null) err.goal = 1;
    return err;
  }
  function restrictions(p) {                        // dieta hisoblanmaydigan holatlar: faqat saqlash rejimi + shifokor izohi
    var age = num(p.age), r = { under18: age < 18, preg: !!(p.preg && p.sex === 'f'), lowBmi: bmi(num(p.weight), num(p.height)) < 18.5 };
    r.keepOnly = r.under18 || r.preg || r.lowBmi;
    return r;
  }
  function macros(kcal, weight, goal) {
    var perKg = PROTEIN_PER_KG[goal] || PROTEIN_PER_KG.keep, p = Math.min(perKg * weight, PROTEIN_MAX_SHARE * kcal / 4);
    p = Math.round(p); var f = Math.round(FAT_SHARE * kcal / 9), c = Math.max(0, Math.round((kcal - 4 * p - 9 * f) / 4));
    return { p: p, f: f, c: c, pKcal: 4 * p, fKcal: 9 * f, cKcal: 4 * c, pPerKg: round1(p / weight) };
  }
  function water(weight) { var ml = Math.round(WATER_ML_PER_KG * weight); return { ml: ml, glasses: Math.max(1, Math.round(ml / GLASS_ML)), glassMl: GLASS_ML }; }
  function plan(p) {
    var w = num(p.weight), h = num(p.height), a = num(p.age), sex = p.sex === 'f' ? 'f' : 'm';
    var r = restrictions(p), goal = r.keepOnly ? 'keep' : (GOAL_DELTA[p.goal] != null ? p.goal : 'keep');
    var bmr = bmrRaw(sex, w, h, a), tdee = Math.round(bmr * (ACT[p.act] || ACT[1]));
    var delta = GOAL_DELTA[goal], raw = tdee + delta, floorMin = FLOOR[sex], target = raw, floorApplied = false;
    if (delta < 0 && raw < floorMin) { target = floorMin; floorApplied = true; }
    var out = { sex: sex, bmrRaw: bmr, bmr: Math.round(bmr), act: p.act, actK: ACT[p.act] || ACT[1], tdee: tdee, goal: goal, goalAsked: p.goal, goalOverridden: goal !== p.goal, delta: delta, rawTarget: raw,
      target: target, floorApplied: floorApplied, floorMin: floorMin, kgPerWeek: Math.round((target - tdee) * 7 / KCAL_PER_KG * 100) / 100, bmi: round1(bmi(w, h)), restrictions: r, doctor: r.keepOnly, notes: [] };
    out.macros = macros(target, w, goal); out.water = water(w);
    if (r.under18) out.notes.push('under18'); if (r.preg) out.notes.push('preg'); if (r.lowBmi) out.notes.push('lowBmi'); if (floorApplied) out.notes.push('floor');
    return out;
  }

  /* ---------- qadam ---------- */
  function strideM(height) { return height * STRIDE_K / 100; }
  function distanceKm(steps, height) { return Math.max(0, steps) * strideM(height) / 1000; }
  function stepKcal(steps, height, weight) { return Math.round(MET_WALK * weight * (distanceKm(steps, height) / WALK_KMH)); }
  function stepBase(act) { return STEP_BASE[act] || STEP_BASE[2]; }
  function extraSteps(steps, act) { return Math.max(0, Math.round(num(steps)) - stepBase(act)); }                      // odatiy chegaradan ORTIQ qadamlar
  function stepCredit(steps, height, weight, act) { return Math.round(MET_NET * weight * (distanceKm(extraSteps(steps, act), height) / WALK_KMH)); }   // faqat ortiqcha qadamlar uchun, to'liq sof qiymat (50% emas)
  var ROUTES = [                                                            // taxminiy yo'l masofalari (km): taqqoslash uchun
    [35, 'Toshkent — Chirchiq', 'Ташкент — Чирчик'], [90, 'Qarshi — Shahrisabz', 'Карши — Шахрисабз'], [120, 'Toshkent — Guliston', 'Ташкент — Гулистан'],
    [190, 'Toshkent — Jizzax', 'Ташкент — Джизак'], [270, 'Samarqand — Buxoro', 'Самарканд — Бухара'], [300, 'Toshkent — Samarqand', 'Ташкент — Самарканд'], [450, 'Buxoro — Xiva', 'Бухара — Хива']
  ];
  function compareKm(km) {                          // eng katta sig'adigan yo'l; sig'maganda birinchisining ulushi
    var best = null; for (var i = 0; i < ROUTES.length; i++) if (km >= ROUTES[i][0]) best = i;
    if (best == null) return { idx: 0, uz: ROUTES[0][1], ru: ROUTES[0][2], km: ROUTES[0][0], share: Math.round(km / ROUTES[0][0] * 100), full: false };
    return { idx: best, uz: ROUTES[best][1], ru: ROUTES[best][2], km: ROUTES[best][0], share: 100, full: true };
  }

  /* ---------- kun balansi ---------- */
  function dayBalance(target, eaten, steps, height, weight, act) {
    var sk = stepKcal(steps, height, weight), credit = stepCredit(steps, height, weight, act);
    return { target: target, eaten: eaten, stepKcal: sk, credit: credit, base: stepBase(act), extraSteps: extraSteps(steps, act), remaining: target - eaten + credit };
  }

  /* ---------- ovqat hisobi ---------- */
  function portion(food, grams) {                    // food: 100 g uchun k,p,f,c; grams → yozuv qiymatlari
    var m = grams / 100; return { g: round1(grams), kcal: Math.round(food.k * m), p: round1(food.p * m), f: round1(food.f * m), c: round1(food.c * m) };
  }
  function sumEntries(list) {
    var t = { kcal: 0, p: 0, f: 0, c: 0 }; (list || []).forEach(function (e) { t.kcal += e.kcal || 0; t.p += e.p || 0; t.f += e.f || 0; t.c += e.c || 0; });
    return { kcal: Math.round(t.kcal), p: Math.round(t.p), f: Math.round(t.f), c: Math.round(t.c) };
  }
  function mealByHour(h) { return h >= 5 && h < 11 ? 'b' : (h >= 11 && h < 16 ? 'l' : (h >= 16 && h < 22 ? 'd' : 's')); }       // 05–11 nonushta, 11–16 tushlik, 16–22 kechki ovqat, qolgani tamaddi

  /* ---------- sana bo'yicha ma'lumot ---------- */
  function dayOf(st, d) { return st.days[d] || null; }
  function ensureDay(st, d) { if (!st.days[d]) st.days[d] = { food: [], water: 0, steps: 0 }; if (st.trackStart && d < st.trackStart) st.trackStart = d; return st.days[d]; }   // oldingi sanaga yozilsa, kuzatuv boshlanishi shu sanaga suriladi
  function dayTotals(st, d) { var x = dayOf(st, d); return sumEntries(x ? x.food : []); }
  function emptyState() { return { v: VERSION, setup: false, created: null, seq: 1, profile: null, days: {}, weights: [], customFoods: [], recents: [], favs: [], tpls: [], vessels: [], stepGoal: 8000, prefs: {}, lastBackup: null, trackStart: null }; }
  function addFood(st, d, e) {
    var x = ensureDay(st, d), it = { id: st.seq++, fid: e.fid || null, name: e.name || null, meal: MEALS.indexOf(e.meal) > -1 ? e.meal : 's', unit: e.unit || null, qty: e.qty || 1, g: e.g || 0, kcal: Math.round(e.kcal) || 0, p: round1(e.p || 0), f: round1(e.f || 0), c: round1(e.c || 0), est: !!e.est, ts: e.ts || 0 };
    if (e.vr) it.vr = String(e.vr).slice(0, 40); if (e.sz) it.sz = String(e.sz).slice(0, 20);
    if (e.ifid) it.ifid = String(e.ifid).slice(0, 60); if (/^(salat|shorva|issiq|zakuska|desert)$/.test(e.ikat || '')) it.ikat = e.ikat;          // menyudan: ikonka uchun baza taomi va toifa (kkal'ga ta'sir yo'q)
    if (e.vn) { it.vn = String(e.vn).slice(0, 30); if (FILL[e.vf]) it.vf = e.vf; }                 // «Mening idishim»: idish nomi (snapshot) va to'ldirish
    x.food.push(it); if (it.fid) { st.recents = [it.fid].concat(st.recents.filter(function (r) { return r !== it.fid; })).slice(0, 12); }
    return it;
  }
  function removeFood(st, d, id) { var x = dayOf(st, d); if (!x) return null; for (var i = 0; i < x.food.length; i++) if (x.food[i].id === id) return { item: x.food.splice(i, 1)[0], index: i }; return null; }
  function restoreFood(st, d, rm) { if (!rm) return; ensureDay(st, d).food.splice(Math.min(rm.index, st.days[d].food.length), 0, rm.item); }
  function setWater(st, d, n) { ensureDay(st, d).water = Math.max(0, Math.min(40, Math.round(n))); return st.days[d].water; }
  function setSteps(st, d, n) { ensureDay(st, d).steps = Math.max(0, Math.min(200000, Math.round(num(n)))); return st.days[d].steps; }
  /* avtomatik qadam (Android: apparat hisoblagich): day.sa — avtomatik qism; day.steps = sa + qo'lda qo'shilgan (telefonsiz yurilgan).
     Avtomatik qiymat yangilansa qo'lda qo'shilgani saqlanadi; qolgan hisob (maqsad, kaloriya, tarix) day.steps bilan ishlaydi. */
  function manualSteps(x) { return x ? Math.max(0, Math.round(num(x.steps)) - Math.round(num(x.sa))) : 0; }
  function setAutoSteps(st, d, n) {
    n = Math.max(0, Math.min(200000, Math.round(num(n)))); var x = st.days[d];
    if (!x) { if (!n) return false; x = ensureDay(st, d); }
    if (x.sa === n && x.steps >= n) return false;
    var m = manualSteps(x); x.sa = n; x.steps = Math.min(200000, n + m); return true;
  }
  function setManualSteps(st, d, n) { var x = ensureDay(st, d), a = Math.round(num(x.sa)); x.steps = Math.max(0, Math.min(200000, a + Math.max(0, Math.round(num(n))))); return x.steps; }
  function toggleFav(st, fid) { var i = st.favs.indexOf(fid); if (i > -1) st.favs.splice(i, 1); else st.favs.unshift(fid); return i === -1; }
  function addCustom(st, o) {
    var f = { id: 'c' + st.seq++, n: String(o.name || '').slice(0, 60), k: Math.round(num(o.k)), p: round1(num(o.p)), f: round1(num(o.f)), c: round1(num(o.c)), u: [['g100', 100]], e: 1, t: 'x', custom: 1 };
    if (o.g > 0) f.u.unshift(['porsiya', Math.round(o.g)]); if (!f.n || !(f.k >= 0)) return null; st.customFoods.push(f); return f;
  }

  /* ---------- kun limiti, holat, ketma-ket kunlar, taqvim ---------- */
  function dayLimit(st, d) {                       // shu kun uchun maqsad = me'yor + odatiy qadamdan ORTIQ qadamlarning sof kaloriyasi
    var pl = plan(st.profile), x = dayOf(st, d), steps = x ? x.steps || 0 : 0;
    return pl.target + stepCredit(steps, num(st.profile.height), currentWeight(st), st.profile.act);
  }
  function logged(st, d) { var x = dayOf(st, d); return !!(x && (x.food.length || x.steps > 0)); }
  function hasData(x) { return !!(x && (x.food.length || x.steps > 0 || x.water > 0)); }
  function trackStart(st) {                        // kuzatuv boshlanishi: profil yaratilgan kun; eski foydalanuvchida — eng birinchi yozuv sanasi
    if (st.trackStart && D.parse(st.trackStart)) return st.trackStart;
    var first = null; Object.keys(st.days).forEach(function (d) { if (hasData(st.days[d]) && (!first || d < first)) first = d; });
    if (first) return first; return st.created ? D.today(new Date(st.created)) : null;
  }
  function isComplete(st, d, today) {              // to'liq kun: "Kunni yakunlash" bosilgan yoki kun o'tgan VA yozuv maqsadning ≥ 50% i
    var x = dayOf(st, d); if (!x || !x.food.length) return false; today = today || D.today();
    if (!(x.done || d < today)) return false;
    var lim = dayLimit(st, d); return lim > 0 && sumEntries(x.food).kcal >= 0.5 * lim;
  }
  function dayStatus(st, d, today) {               // pre | none | part | near (±10%) | low | high — faqat TO'LIQ kunlar maqsad bilan solishtiriladi; rang "yaxshi/yomon" ma'nosiz
    today = today || D.today(); var x = dayOf(st, d), start = trackStart(st);
    if (start && d < start) return { state: 'pre', eaten: 0, limit: 0, ratio: 0, complete: false, live: false };
    if (!x || !x.food.length) return { state: 'none', eaten: 0, limit: 0, ratio: 0, complete: false, live: false };
    var eaten = sumEntries(x.food).kcal, limit = dayLimit(st, d), ratio = limit > 0 ? eaten / limit : 0, live = d === today && !x.done;
    if (!isComplete(st, d, today)) return { state: 'part', eaten: eaten, limit: limit, ratio: ratio, complete: false, live: live };
    return { state: Math.abs(ratio - 1) <= 0.10 + 1e-9 ? 'near' : (ratio < 1 ? 'low' : 'high'), eaten: eaten, limit: limit, ratio: ratio, complete: true, live: false };
  }
  function finishDay(st, d, today) {               // "Kunni yakunlash": kun to'liq belgisi; yozuv < 50% bo'lsa kun "qisman" bo'lib qoladi (ok:false)
    var x = dayOf(st, d); if (!x || !x.food.length) return { ok: false, why: 'empty' };
    x.done = true; return { ok: isComplete(st, d, today), why: isComplete(st, d, today) ? '' : 'low' };
  }
  function streak(st, today) {                     // bugungi (yozilgan bo'lsa) yoki kechagi kundan orqaga ketma-ket yozilgan kunlar
    var d = logged(st, today) ? today : D.addDays(today, -1), n = 0;
    while (logged(st, d) && n < 3650) { n++; d = D.addDays(d, -1); }
    return n;
  }
  function monthGrid(st, ym, today) {              // ym = 'YYYY-MM': kunlar + hisob (baho/ball yo'q)
    var p = D.parse(ym + '-01'), n = D.dim(p.y, p.m), days = [], c = { near: 0, low: 0, high: 0, part: 0, none: 0, pre: 0 }; today = today || D.today();
    for (var i = 1; i <= n; i++) { var d = D.ymd(p.y, p.m, i), r = dayStatus(st, d, today); days.push({ d: d, n: i, state: r.state, eaten: r.eaten, limit: r.limit, live: r.live }); if (d <= today) c[r.state]++; }
    return { ym: ym, days: days, first: weekdayIdx(D.ymd(p.y, p.m, 1)), counts: c };
  }
  function minutesToBurn(kcal, weight) { var perMin = MET_WALK * weight / 60; return perMin > 0 ? Math.round(kcal / perMin) : 0; }

  /* ---------- retsept hisoblagich ---------- */
  function recipe(ings, portions) {                // ings: [{g, k, p, f, c (100 g uchun)}] → jami va bir porsiya
    var t = { g: 0, kcal: 0, p: 0, f: 0, c: 0 }; (ings || []).forEach(function (i) { var m = num(i.g) / 100; t.g += num(i.g); t.kcal += i.k * m; t.p += i.p * m; t.f += i.f * m; t.c += i.c * m; });
    var n = Math.max(1, Math.round(num(portions)) || 1);
    var per = { g: Math.round(t.g / n), kcal: Math.round(t.kcal / n), p: round1(t.p / n), f: round1(t.f / n), c: round1(t.c / n) };
    var k100 = t.g > 0 ? { k: Math.round(t.kcal / t.g * 100), p: round1(t.p / t.g * 100), f: round1(t.f / t.g * 100), c: round1(t.c / t.g * 100) } : { k: 0, p: 0, f: 0, c: 0 };
    return { portions: n, total: { g: Math.round(t.g), kcal: Math.round(t.kcal), p: round1(t.p), f: round1(t.f), c: round1(t.c) }, perPortion: per, per100: k100 };
  }
  function saveRecipe(st, o) {                     // shaxsiy taom sifatida saqlaydi (id berilsa — yangilaydi); keyin oddiy qidiruvda chiqadi
    var name = String(o.name || '').trim().slice(0, 60), ings = (o.ings || []).filter(function (i) { return num(i.g) > 0; });
    if (!name || !ings.length) return null;
    var r = recipe(ings, o.portions), f = null;
    if (o.id) f = st.customFoods.filter(function (x) { return x.id === o.id; })[0];
    var rec = { id: f ? f.id : 'c' + st.seq++, n: name, k: r.per100.k, p: r.per100.p, f: r.per100.f, c: r.per100.c, u: [['porsiya', Math.max(1, r.perPortion.g)], ['g100', 100]], e: 1, t: 'x', custom: 1, recipe: { portions: r.portions, ings: ings.map(function (i) { return { id: i.id || null, name: i.name || '', g: Math.round(num(i.g)), k: i.k, p: i.p, f: i.f, c: i.c }; }) } };
    if (f) st.customFoods[st.customFoods.indexOf(f)] = rec; else st.customFoods.push(rec);
    return rec;
  }
  function removeCustom(st, id) { var n = st.customFoods.length; st.customFoods = st.customFoods.filter(function (x) { return x.id !== id; }); st.favs = st.favs.filter(function (x) { return x !== id; }); st.recents = st.recents.filter(function (x) { return x !== id; }); return st.customFoods.length < n; }

  /* ---------- vazn ---------- */
  function addWeight(st, d, kg) {
    kg = Math.round(num(kg) * 10) / 10; if (!(kg >= LIMITS.weight[0] && kg <= LIMITS.weight[1]) || !D.parse(d)) return null;
    var w = st.weights.filter(function (x) { return x.d === d; })[0]; if (w) w.kg = kg; else st.weights.push({ d: d, kg: kg });
    st.weights.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; }); return { d: d, kg: kg };
  }
  function removeWeight(st, d) { var n = st.weights.length; st.weights = st.weights.filter(function (x) { return x.d !== d; }); return st.weights.length < n; }
  function avg7(weights, d) {                       // d va undan oldingi 6 kalendar kundagi yozuvlar o'rtachasi (bo'lmasa null)
    var from = D.addDays(d, -6), s = 0, n = 0;
    weights.forEach(function (w) { if (w.d >= from && w.d <= d) { s += w.kg; n++; } });
    return n ? Math.round(s / n * 10) / 10 : null;
  }
  function weightInfo(st, today) {                 // yorliq turi: first (1 ta o'lchov) | last | avg (2+ ta, tarix <7 kun) | trend (≥7 kunlik tarix)
    var w = st.weights; today = today || D.today(); if (!w.length) return { kind: 'none' };
    var cur = w[w.length - 1].kg, from = D.addDays(today, -6), n7 = w.filter(function (x) { return x.d >= from && x.d <= today; }).length;
    if (w.length === 1) return { kind: 'first', kg: cur };
    var span = D.daysBetween(w[0].d, w[w.length - 1].d);
    if (span >= 6) { var a = avg7(w, today), b = avg7(w, D.addDays(today, -7)); return { kind: 'trend', kg: a != null ? a : cur, avg: a, prev: b, delta: (a != null && b != null) ? Math.round((a - b) * 10) / 10 : null, n: n7 }; }
    if (n7 >= 2) return { kind: 'avg', kg: avg7(w, today), n: n7 };
    return { kind: 'last', kg: cur };
  }
  function weightSeries(weights) { return weights.map(function (w) { return { d: w.d, kg: w.kg, avg: avg7(weights, w.d) }; }); }
  function currentWeight(st) { return st.weights.length ? st.weights[st.weights.length - 1].kg : (st.profile ? num(st.profile.weight) : 0); }
  function goalProgress(st) {                        // maqsad vazn bo'lsa: boshlang'ich → hozirgi → maqsad (0..1)
    var p = st.profile; if (!p || !(num(p.goalWeight) > 0)) return null;
    var start = st.weights.length ? st.weights[0].kg : num(p.weight), cur = currentWeight(st), goal = num(p.goalWeight), tot = start - goal;
    if (tot === 0) return { start: start, cur: cur, goal: goal, share: 1, left: 0 };
    return { start: start, cur: cur, goal: goal, share: Math.max(0, Math.min(1, (start - cur) / tot)), left: round1(Math.abs(cur - goal)) };
  }

  /* ---------- qadam yig'indilari ---------- */
  function stepsSeries(st, end, n) { var out = []; for (var i = n - 1; i >= 0; i--) { var d = D.addDays(end, -i), x = dayOf(st, d); out.push({ d: d, steps: x ? x.steps || 0 : 0 }); } return out; }
  function stepsStats(st, steps) { var h = num(st.profile.height), w = currentWeight(st); return { steps: steps, km: Math.round(distanceKm(steps, h) * 10) / 10, kcal: stepKcal(steps, h, w) }; }
  function stepsTotal(st, list) { var s = 0; list.forEach(function (x) { s += x.steps; }); return stepsStats(st, s); }
  function monthSteps(st, ym) { var s = 0; Object.keys(st.days).forEach(function (d) { if (d.slice(0, 7) === ym) s += st.days[d].steps || 0; }); return stepsStats(st, s); }
  function weekdayIdx(d) { return ((D.daysBetween('1970-01-05', d) % 7) + 7) % 7; }          // 0 = dushanba

  /* ---------- haftalik xulosa (faqat faktlar) ---------- */
  function weekSummary(st, end, today) {            // end — haftaning oxirgi kuni (oxirgi 7 kun); o'rtacha FAQAT to'liq kunlardan (yozilmagan kun 0 kkal emas)
    var days = [], i; for (i = 6; i >= 0; i--) days.push(D.addDays(end, -i)); today = today || D.today();
    var kc = [], stp = [], logged = 0;
    days.forEach(function (d) { var x = dayOf(st, d); if (x && x.food.length) logged++; if (isComplete(st, d, today)) kc.push(sumEntries(x.food).kcal); if (x && x.steps > 0) stp.push(x.steps); });
    var wFrom = avg7(st.weights, days[0]), wTo = avg7(st.weights, end);
    var avgK = kc.length ? Math.round(kc.reduce(function (a, b) { return a + b; }, 0) / kc.length) : null, avgS = stp.length ? Math.round(stp.reduce(function (a, b) { return a + b; }, 0) / stp.length) : null;
    return { days: days, fullDays: kc.length, loggedDays: logged, stepDays: stp.length, avgKcal: avgK, avgSteps: avgS, weightFrom: wFrom, weightTo: wTo, weightDelta: (wFrom != null && wTo != null) ? Math.round((wTo - wFrom) * 10) / 10 : null, empty: !logged && !stp.length && wTo == null };
  }

  /* ---------- migratsiya / eksport / import ---------- */
  function migrate(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    var v = raw.v == null ? 0 : raw.v; if (typeof v !== 'number' || v > VERSION || v < 0) return null;
    var s = emptyState(); if (v === 0 && !raw.profile && !raw.days && !raw.log) return null;
    s.setup = !!raw.setup || !!raw.profile; s.created = raw.created || null; s.seq = Math.max(1, Math.round(num(raw.seq)) || 1);
    s.profile = raw.profile && typeof raw.profile === 'object' ? { sex: raw.profile.sex === 'f' ? 'f' : 'm', preg: !!raw.profile.preg, age: num(raw.profile.age), height: num(raw.profile.height), weight: num(raw.profile.weight), act: ACT[raw.profile.act] ? +raw.profile.act : 2, goal: GOAL_DELTA[raw.profile.goal] != null ? raw.profile.goal : 'keep', goalWeight: num(raw.profile.goalWeight) || null } : null;
    if (raw.days && typeof raw.days === 'object') Object.keys(raw.days).forEach(function (d) { if (!D.parse(d)) return; var x = raw.days[d] || {}; s.days[d] = { food: Array.isArray(x.food) ? x.food.filter(function (e) { return e && typeof e === 'object'; }) : [], water: Math.max(0, Math.round(num(x.water))), steps: Math.max(0, Math.round(num(x.steps))) }; if (num(x.sa) > 0) s.days[d].sa = Math.min(s.days[d].steps, Math.round(num(x.sa))); if (x.party) s.days[d].party = true; if (x.done) s.days[d].done = true; });
    if (v === 0 && Array.isArray(raw.log)) raw.log.forEach(function (e) { if (e && D.parse(e.d || e.date)) { var d = e.d || e.date; ensureDay(s, d).food.push({ id: s.seq++, fid: null, name: String(e.name || '?'), meal: 's', unit: null, qty: 1, g: 0, kcal: Math.round(num(e.kcal)), p: 0, f: 0, c: 0, est: true, ts: 0 }); } });   // eski v0: tekis "log"
    (Array.isArray(raw.weights) ? raw.weights : []).forEach(function (w) { if (w && D.parse(w.d)) addWeight(s, w.d, w.kg); });
    s.customFoods = Array.isArray(raw.customFoods) ? raw.customFoods.filter(function (f) { return f && f.id && f.n; }) : [];
    s.recents = Array.isArray(raw.recents) ? raw.recents.slice(0, 12) : []; s.favs = Array.isArray(raw.favs) ? raw.favs.slice() : [];
    s.tpls = cleanTpls(raw.tpls, s); s.vessels = cleanVessels(raw.vessels, s);
    s.stepGoal = Math.max(1000, Math.round(num(raw.stepGoal)) || 8000); s.prefs = raw.prefs && typeof raw.prefs === 'object' ? raw.prefs : {}; s.lastBackup = raw.lastBackup || null; s.trackStart = raw.trackStart && D.parse(raw.trackStart) ? raw.trackStart : null; if (s.setup && !s.trackStart) s.trackStart = trackStart(s);
    return s;
  }
  /* ---------- «Odatdagi ovqatlarim» (shablonlar) va «Kechagidek» ---------- */
  var TPL_MAX = 12;
  function r1(x) { return Math.round(num(x) * 10) / 10; }
  function cleanTplItem(e) {
    if (!e || typeof e !== 'object') return null; var k = Math.round(num(e.kcal)); if (!(k >= 0) || !(e.fid || e.n || e.name)) return null;
    return { fid: e.fid ? String(e.fid).slice(0, 60) : null, n: String(e.n || e.name || '').slice(0, 80), unit: e.unit ? String(e.unit).slice(0, 20) : null, qty: num(e.qty) > 0 ? Math.min(3000, Math.round(num(e.qty) * 100) / 100) : 1, g: Math.max(0, Math.round(num(e.g))), kcal: k, p: r1(e.p), f: r1(e.f), c: r1(e.c), est: !!e.est, vr: e.vr ? String(e.vr).slice(0, 40) : undefined, sz: e.sz ? String(e.sz).slice(0, 20) : undefined, vn: e.vn ? String(e.vn).slice(0, 30) : undefined, vf: FILL[e.vf] ? e.vf : undefined };
  }
  function cleanTpls(list, s) {
    var out = [], used = {}; (Array.isArray(list) ? list : []).forEach(function (t) {
      if (out.length >= TPL_MAX || !t || typeof t !== 'object') return; var name = String(t.name || '').trim().slice(0, 40), items = (Array.isArray(t.items) ? t.items : []).map(cleanTplItem).filter(Boolean).slice(0, 40); if (!name || !items.length) return;
      var id = Math.round(num(t.id)); if (!(id > 0) || used[id]) id = s.seq++; else if (id >= s.seq) s.seq = id + 1; used[id] = 1; out.push({ id: id, name: name, meal: MEALS.indexOf(t.meal) > -1 ? t.meal : null, items: items });
    }); return out;
  }
  function tplList(st) { return st.tpls || (st.tpls = []); }
  function addTemplate(st, name, entries, meal) {                 // entries: kunning shu ovqati yozuvlari ({fid,n,unit,qty,g,kcal,p,f,c,est}); to'lgan (12) yoki bo'sh bo'lsa — null
    var l = tplList(st); name = String(name || '').trim().slice(0, 40); var items = (entries || []).map(cleanTplItem).filter(Boolean).slice(0, 40);
    if (!name || !items.length || l.length >= TPL_MAX) return null; var t = { id: st.seq++, name: name, meal: MEALS.indexOf(meal) > -1 ? meal : null, items: items }; l.push(t); return t;
  }
  function tplById(st, id) { var l = tplList(st); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function renameTemplate(st, id, name) { var t = tplById(st, id); name = String(name || '').trim().slice(0, 40); if (!t || !name) return false; t.name = name; return true; }
  function removeTemplate(st, id) { var l = tplList(st); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l.splice(i, 1)[0]; return null; }
  function moveTemplate(st, id, dir) { var l = tplList(st), i = -1; for (var k = 0; k < l.length; k++) if (l[k].id === id) i = k; var j = i + (dir < 0 ? -1 : 1); if (i < 0 || j < 0 || j >= l.length) return false; var x = l[i]; l[i] = l[j]; l[j] = x; return true; }
  function tplKcal(t) { return t.items.reduce(function (a, e) { return a + e.kcal; }, 0); }
  function yesterdayEntries(st, date, meal) { var x = dayOf(st, D.addDays(date, -1)); return x ? x.food.filter(function (e) { return e.meal === meal; }) : []; }
  function suggestTemplate(st, today) {                          // oxirgi 14 kunda bir ovqatda 3+ kun birga yeyilgan taomlar to'plami (rad etilgan va allaqachon saqlanganlari — yo'q)
    var no = (st.prefs && st.prefs.tplNo) || [], best = null;
    MEALS.forEach(function (m) {
      var days = []; for (var i = 0; i < 14; i++) { var d = D.addDays(today, -i), x = dayOf(st, d); if (!x) continue; var l = x.food.filter(function (e) { return e.meal === m && e.fid; }); if (l.length) days.push({ d: d, list: l, set: l.map(function (e) { return e.fid; }) }); }
      var cnt = {}; days.forEach(function (y) { y.set.filter(function (v, i, a) { return a.indexOf(v) === i; }).forEach(function (f) { cnt[f] = (cnt[f] || 0) + 1; }); });
      var fr = Object.keys(cnt).filter(function (f) { return cnt[f] >= 3; }).sort(function (a, b) { return cnt[b] - cnt[a] || (a < b ? -1 : 1); }); if (fr.length < 2) return;
      var core = [fr[0]], co = days.filter(function (y) { return y.set.indexOf(fr[0]) > -1; });
      for (var k = 1; k < fr.length && core.length < 6; k++) { var co2 = co.filter(function (y) { return y.set.indexOf(fr[k]) > -1; }); if (co2.length >= 3) { core.push(fr[k]); co = co2; } }
      if (core.length < 2) return; var ids = core.slice().sort(), key = m + '|' + ids.join(',');
      if (no.indexOf(key) > -1 || tplList(st).some(function (t) { return t.meal === m && t.items.length === ids.length && t.items.every(function (it) { return ids.indexOf(it.fid) > -1; }); })) return;
      var last = co[0], entries = last.list.filter(function (e) { return ids.indexOf(e.fid) > -1; });
      var c = { meal: m, key: key, ids: ids, days: co.length, entries: entries }; if (!best || c.days > best.days) best = c;
    }); return best;
  }
  function kechagidekOk(st, date, meal) {                         // shu kunda shu ovqat bo'sh va kecha unda yozuv bo'lgan
    var t = dayOf(st, date); if (t && t.food.some(function (e) { return e.meal === meal; })) return false; return yesterdayEntries(st, date, meal).length > 0;
  }

  /* ---------- «Mening idishim»: foydalanuvchining o'z kosasi/laganining grammi (idish × taom oilasi) ---------- */
  var VESSEL_MAX = 20, VKINDS = ['kosa', 'lagan', 'piyola', 'likopcha', 'custom'], FILL = { yarim: 0.5, tola: 1, kop: 1.25 }, SCALE = { kichik: 0.75, ohshash: 1, katta: 1.3 };
  var VUNIT = { kosa: 'kosa', lagan: 'likop', piyola: 'piyola', likopcha: 'likop', custom: null };      // idish turi → bazadagi standart birlik kaliti
  function cleanVessels(list, s) {
    var out = [], used = {}; (Array.isArray(list) ? list : []).forEach(function (v) {
      if (out.length >= VESSEL_MAX || !v || typeof v !== 'object') return; var kind = VKINDS.indexOf(v.kind) > -1 ? v.kind : 'custom', fam = {}, n = 0;
      if (v.fam && typeof v.fam === 'object') Object.keys(v.fam).slice(0, 60).forEach(function (k) { var g = Math.round(num(v.fam[k])); if (g >= 10 && g <= 3000 && k.length <= 60) { fam[k] = g; n++; } });
      var name = String(v.name || '').trim().slice(0, 30); if (!n || (kind === 'custom' && !name)) return;
      var id = Math.round(num(v.id)); if (!(id > 0) || used[id]) id = s.seq++; else if (id >= s.seq) s.seq = id + 1; used[id] = 1; out.push({ id: id, kind: kind, name: name || undefined, fam: fam });
    }); return out;
  }
  function vList(st) { return st.vessels || (st.vessels = []); }
  function vesselById(st, id) { var l = vList(st); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function vesselsFor(st, famKey) { return vList(st).filter(function (v) { return v.fam[famKey] > 0; }); }
  function addVessel(st, kind, name, famKey, g) {                // yangi idish: boshqa idish bilan to'lgan (20) bo'lsa — null
    var l = vList(st); g = Math.round(num(g)); name = String(name || '').trim().slice(0, 30); kind = VKINDS.indexOf(kind) > -1 ? kind : 'custom';
    if (l.length >= VESSEL_MAX || !famKey || !(g >= 10 && g <= 3000) || (kind === 'custom' && !name)) return null;
    var v = { id: st.seq++, kind: kind, name: name || undefined, fam: {} }; v.fam[famKey] = g; l.push(v); return v;
  }
  function linkVessel(st, id, famKey, g) { var v = vesselById(st, id); g = Math.round(num(g)); if (!v || !famKey || !(g >= 10 && g <= 3000)) return false; v.fam[famKey] = g; return true; }
  function removeVessel(st, id) { var l = vList(st); for (var i = 0; i < l.length; i++) if (l[i].id === id) return { v: l.splice(i, 1)[0], i: i }; return null; }
  function vessGrams(v, famKey, fill) { return v && v.fam[famKey] > 0 ? Math.round(v.fam[famKey] * (FILL[fill] || 1)) : 0; }

  function exportState(st) { return JSON.stringify({ app: 'kalki-kalkifit', v: VERSION, exportedAt: Date.now(), state: st }); }
  function importState(text) {
    var o; try { o = JSON.parse(text); } catch (e) { return { ok: false }; }
    if (!o || o.app !== 'kalki-kalkifit' || !o.state) return { ok: false };
    var s = migrate(o.state); return s && s.profile ? { ok: true, state: s } : { ok: false };
  }

  function normFoods(list) { return list.map(function (f) { var o = {}; for (var k in f) o[k] = f[k]; o.id = f.id || f.i; return o; }); }   // JSON'dagi qisqa 'i' → 'id'

  /* ---------- qidiruv va matn tahlili ---------- */
  var CYR = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ў': 'o', 'қ': 'q', 'ғ': 'g', 'ҳ': 'h' };
  function key(s) {                                  // lotin/kirill/rus + xato yozuvga chidamli kalit: o' o‘ oʻ o` o’ → o, g' → g, ў қ ғ ҳ х ш ч ё ю я → lotin
    var t = String(s || '').toLowerCase().replace(/[’'`‘ʻʼ´′]/g, ''), o = '';
    for (var i = 0; i < t.length; i++) o += CYR[t[i]] != null ? CYR[t[i]] : t[i];
    return o.replace(/w/g, 'v').replace(/kh/g, 'x').replace(/ph/g, 'f').replace(/ts/g, 's').replace(/([a-z])\1+/g, '$1').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function dmax(len) { return len < 3 ? 0 : (len <= 5 ? 1 : 2); }            // xatoga chidamlilik: 3–5 harfda 1 ta, 6+ da 2 ta
  function osa(a, b, max) {                           // Damerau–Levenshtein (harf tushishi, ortiqcha harf, almashishi, ikki harf o'rin almashishi); max dan oshsa max+1
    var la = a.length, lb = b.length; if (Math.abs(la - lb) > max) return max + 1;
    var prev2 = null, prev = [], cur, i, j; for (j = 0; j <= lb; j++) prev[j] = j;
    for (i = 1; i <= la; i++) {
      cur = [i]; var rm = i;
      for (j = 1; j <= lb; j++) { var c = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1, v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c); if (i > 1 && j > 1 && a.charCodeAt(i - 1) === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) v = Math.min(v, prev2[j - 2] + 1); cur[j] = v; if (v < rm) rm = v; }
      if (rm > max) return max + 1; prev2 = prev; prev = cur;
    }
    return prev[lb];
  }
  function foodKeys(f) { if (!f._k) { var arr = [f.n, f.r].concat(f.a || []); f._k = arr.filter(Boolean).map(function (x) { return key(x); }); f._t = f._k.map(function (k) { return k.split(' '); }); f._nl = f._k[0] ? f._k[0].length : 99; } return f; }
  function buildIndex(foods) { foods.forEach(foodKeys); return foods; }       // indeksni oldindan qurish (har harfda qayta hisoblanmaydi)
  /* so'z darajasi: 1 so'zning o'zi · 2 so'z boshidan · 3 so'z boshida xato bilan · 4 ichida · 5 butun so'z xato bilan; {t, d (xato soni), l (uzunlik farqi)} */
  function tokTier(w, q) {
    if (w === q) return { t: 1, d: 0, l: 0 };
    if (w.indexOf(q) === 0) return { t: 2, d: 0, l: w.length - q.length };
    var ql = q.length; if (ql < 3) return null; var tol = dmax(ql), best = null, d, fl = ql <= 4 && w.charAt(0) !== q.charAt(0);      // qisqa so'rovda birinchi harfda xato qidirilmaydi (shovqin kamayadi)
    if (!fl) for (var n = Math.max(3, ql - 1); n <= ql + 1; n++) { if (n > w.length) continue; d = osa(q, w.slice(0, n), tol); if (d <= tol && (!best || d < best.d)) best = { t: 3, d: d, l: Math.abs(w.length - ql) }; }
    if (best) return best;
    if (w.indexOf(q) > 0) return { t: 4, d: 0, l: w.length - ql };
    if (fl) return null; d = osa(q, w, tol); if (d <= tol) return { t: 5, d: d, l: Math.abs(w.length - ql) };
    return null;
  }
  function matchFood(f, qt, whole) {                   // → null | {tier, d, l}; tier 0 — butun so'rov nom/sinonimga aynan mos
    foodKeys(f); for (var k = 0; k < f._k.length; k++) if (f._k[k] === whole) return { tier: 0, d: 0, l: 0 };
    var tier = 0, dd = 0, ll = 0;
    for (var i = 0; i < qt.length; i++) {
      var best = null;
      for (var k2 = 0; k2 < f._t.length; k2++) for (var j = 0; j < f._t[k2].length; j++) { var r = tokTier(f._t[k2][j], qt[i]); if (r && (!best || r.t < best.t || (r.t === best.t && (r.d < best.d || (r.d === best.d && r.l < best.l))))) best = r; }
      if (!best) return null; if (best.t > tier) tier = best.t; dd += best.d; ll += best.l;
    }
    return { tier: tier, d: dd, l: ll };
  }
  function freqMap(st, today, days, alias) {                  // oxirgi N kunda necha marta yeyilgan: { fid: son }
    var out = {}, from = D.addDays(today, -((days || 30) - 1));
    Object.keys(st.days).forEach(function (d) { if (d >= from && d <= today) st.days[d].food.forEach(function (e) { if (e.fid) { var id = (alias && alias[e.fid]) || e.fid; out[id] = (out[id] || 0) + 1; } }); });
    return out;
  }
  function search(foods, q, o) {                       // ① aynan ② so'z boshidan ③ ichida/xato bilan ④ — bir xil darajada: ko'p yeyilgan va sevimlilar yuqorida
    o = o || {}; var qt = key(q).split(' ').filter(Boolean); if (!qt.length) return []; var whole = qt.join(' ');
    var rec = o.recents || [], fav = o.favs || [], freq = o.freq || {}, out = [];
    foods.forEach(function (f, ix) {
      if (f.h) return;                                  // eski id (alias) — qidiruvda ko'rinmaydi, oila ko'rinadi
      var m = matchFood(f, qt, whole); if (!m) return; var r = rec.indexOf(f.id);
      out.push({ f: f, tier: m.tier, pref: (fav.indexOf(f.id) > -1 ? 1000 : 0) + (freq[f.id] || 0), d: m.d, l: m.l, r: r > -1 ? r : 99, nl: f._nl, ix: ix });
    });
    out.sort(function (a, b) { return a.tier - b.tier || b.pref - a.pref || a.d - b.d || a.l - b.l || a.r - b.r || a.ix - b.ix; });
    return out.slice(0, o.limit || 30).map(function (x) { return x.f; });
  }
  var WORDS = { bir: 1, bitta: 1, ikki: 2, ikkita: 2, uch: 3, uchta: 3, tort: 4, tortta: 4, besh: 5, beshta: 5, olti: 6, yetti: 7, sakkiz: 8, tokkiz: 9, on: 10, yarim: 0.5, yarmi: 0.5, odin: 1, one: 1, dva: 2, tri: 3, chetire: 4, pyat: 5, pol: 0.5, polovina: 0.5 };
  var UNITW = { kosa: 'kosa', kosada: 'kosa', miska: 'kosa', miski: 'kosa', kosani: 'kosa', kosadan: 'kosa', likop: 'likop', likopda: 'likop', tarelka: 'likop', lagan: 'likop', lagani: 'likop', laganda: 'likop', lagandan: 'likop', laganlik: 'likop', tarelki: 'likop', tarelku: 'likop', dona: 'dona', ta: 'dona', sht: 'dona', shtuk: 'dona', shtuki: 'dona', bolak: 'bolak', kusok: 'bolak', stakan: 'stakan', stakana: 'stakan', qoshiq: 'qoshiq', lojka: 'qoshiq', piyola: 'piyola', pialo: 'piyola', porsiya: 'porsiya', porsii: 'porsiya', portsiya: 'porsiya', portsiyu: 'porsiya', portsii: 'porsiya', portsiyasi: 'porsiya', hovuch: 'hovuch', gorst: 'hovuch', tilim: 'tilim', lomtik: 'tilim', shisha: 'shisha', butilka: 'shisha', skup: 'skup', skupa: 'skup', skuplar: 'skup', skoop: 'skup', scoop: 'skup', shar: 'shar', shari: 'shar', sharik: 'shar', sharikov: 'shar', banka: 'banka', banki: 'banka', bankasi: 'banka', plitka: 'plitka', plitki: 'plitka', paket: 'paket', paketcha: 'paket', pachka: 'paket', g: 'g100', gr: 'g100', gramm: 'g100', gram: 'g100' };
  var MYW = { laganim: 'lagan', laganimda: 'lagan', laganimdagi: 'lagan', laganimdan: 'lagan', kosam: 'kosa', kosamda: 'kosa', kosamdagi: 'kosa', kosamdan: 'kosa', piyolam: 'piyola', piyolamda: 'piyola', piyolamdagi: 'piyola', likopcham: 'likopcha', likopchamda: 'likopcha' };
  var SZW = { kichik: 'kichik', kichkina: 'kichik', mayda: 'kichik', malenkiy: 'kichik', malenkaya: 'kichik', malenkie: 'kichik', orta: 'orta', ortacha: 'orta', srednyaya: 'orta', sredniy: 'orta', katta: 'katta', yirik: 'katta', bolshoy: 'katta', bolshaya: 'katta', bolshie: 'katta' };
  var STOP = { bilan: 1, sho: 0, bugun: 1, tushlikda: 1, nonushtada: 1, kechqurun: 1, yedim: 1, ichdim: 1, men: 1, va: 1, i: 1, ya: 1, segodnya: 1, el: 1, pil: 1, s: 0 };
  [WORDS, UNITW, STOP, SZW, MYW].forEach(function (m) { Object.keys(m).forEach(function (k) { var kk = key(k); if (kk !== k) { m[kk] = m[k]; delete m[k]; } }); });          // kalitlar key() shaklida (ikki → iki)
  function splitText(text) { return String(text || '').split(/[,;\n+]|\sva\s|\sи\s/i).map(function (x) { return x.trim(); }).filter(Boolean); }
  function parseFragment(fr) {                        // "2 katta somsa" → {qty:2, unit:null, name:'somsa', sz:'katta', raw:'katta somsa'}
    var toks = fr.replace(/(\d)([a-zA-Zа-яА-Я])/g, '$1 $2').split(/\s+/), qty = null, unit = null, name = [], sz = null, raw = [], my = null;
    toks.forEach(function (t, i) {
      var k = key(t), m = /^(\d+(?:[.,]\d+)?)$/.exec(t), more = i < toks.length - 1;
      if (m && qty == null) { qty = parseFloat(m[1].replace(',', '.')); return; }
      if (WORDS[k] != null && qty == null && more && !name.length) { qty = WORDS[k]; return; }       // "to'rt" va "tort" (торт) farqi: so'zdan keyin nom bo'lsagina son
      if (MYW[k] && unit == null && more) { my = MYW[k]; unit = VUNIT[my] || 'likop'; if (qty == null) qty = 1; return; }       // «laganimda osh», «kosamda mastava»
      if (UNITW[k] && unit == null && (qty != null || !name.length) && more) { unit = UNITW[k]; if (qty == null) qty = 1; return; }
      if (STOP[k]) return; raw.push(t); if (SZW[k] && sz == null && more) { sz = SZW[k]; return; } name.push(t);
    });
    if (qty == null && unit == null && name.length >= 3) {                      // "to'y oshidan bir lagan": oxirida «son + birlik»
      var u1 = UNITW[key(name[name.length - 1])], q1 = key(name[name.length - 2]), qv = /^\d+(?:[.,]\d+)?$/.test(q1) ? parseFloat(q1.replace(',', '.')) : WORDS[q1];
      if (u1 && qv != null) { unit = u1; qty = qv; name.length -= 2; raw.length = Math.max(0, raw.length - 2); }
    }
    return { qty: qty, unit: unit, name: name.join(' '), sz: sz, raw: raw.join(' '), my: my };
  }
  /* ---------- oilalar (ota-taom + omillar): baza v2 ---------- */
  function aliasMap(foods) { var m = {}; foods.forEach(function (f) { if (f.al) m[f.id] = f.al.f; }); return m; }      // eski id → oila id
  function famDef(f) { return f && f.fam || null; }
  function famKey(f, sel) { var fm = f.fam; return fm.ax.map(function (a) { return (sel && sel[a.i]) || a.d; }).join('.'); }
  function famSelOf(f, vr) { var fm = f.fam, o = {}, p = String(vr || '').split('.'); fm.ax.forEach(function (a, i) { o[a.i] = p[i] && a.o.some(function (x) { return x.i === p[i]; }) ? p[i] : a.d; }); return o; }
  function famDefault(f) { return famSelOf(f, null); }
  function famVariant(f, sel, sz) {                      // oila + tanlov → oddiy taom ko'rinishi (k,p,f,c,u,e) — mavjud kod (portion/unitGrams) shu bilan ishlaydi
    var fm = f.fam; if (!fm) return f; var vr = famKey(f, sel), g = fm.g[vr] || fm.g[famKey(f, null)], o = {}, k;
    for (k in f) o[k] = f[k];
    o.k = g.k; o.p = g.p; o.f = g.f; o.c = g.c; o.e = g.x ? 1 : 0; o.x = o.e; o.rc = g.rc || null; o.vr = vr;
    var uo = fm.uv && fm.uv[vr], u = f.u.map(function (x) { return [x[0], uo && uo[x[0]] != null ? uo[x[0]] : x[1]]; });
    if (uo) Object.keys(uo).forEach(function (kk) { if (!u.some(function (x) { return x[0] === kk; })) u.splice(u.length - 1, 0, [kk, uo[kk]]); });
    if (fm.sz) { var so = fm.sz.o.filter(function (x) { return x.i === (sz || fm.sz.d); })[0] || fm.sz.o[0]; u = u.map(function (x) { return x[0] === fm.sz.u ? [x[0], Math.round(x[1] * so.m)] : x; }); o.sz = so.i; }
    o.u = u; o.b = (f.b || []).map(function (b) { var q = {}, kk; for (kk in b) q[kk] = b[kk]; var m = u.filter(function (x) { return x[0] === b.k; })[0]; if (m) q.g = m[1]; return q; });
    return o;
  }
  function famLabel(f, vr, sz, lang) {                   // "qovoq, o'rta" — yozuv/qatorda ko'rsatiladigan omillar (faqat kkal'ga ta'sir qiladiganlar + o'lcham)
    var fm = f.fam, p = String(vr || '').split('.'), out = [];
    fm.ax.forEach(function (a, i) { if (!a.s) return; var o = a.o.filter(function (x) { return x.i === (p[i] || a.d); })[0]; if (o) out.push(lang === 'ru' ? o.r : o.n); });
    if (fm.sz && sz) { var so = fm.sz.o.filter(function (x) { return x.i === sz; })[0]; if (so && sz !== fm.sz.d) out.push(lang === 'ru' ? so.r : so.n); }
    return out.join(', ');
  }
  function famPick(f, q) {                               // sinonim bo'yicha qidirilsa: oldindan tanlangan omillar (eng uzun mos kelgan) yoki null
    var fm = f.fam; if (!fm || !fm.sy) return null; var qk = key(q).split(' ').filter(function (w) { return !STOP[w]; }).join(' '); if (!qk) return null;
    var best = null, bl = 0, qt = qk.split(' ');
    fm.sy.forEach(function (sy) {
      var st = key(sy.q).split(' ').filter(function (w) { return !STOP[w]; }), sk = st.join(' '), score = 0;
      if (sk === qk) score = 1000 + sk.length; else if (qk.indexOf(sk) === 0 || (sk.indexOf(qk) === 0 && qk.length >= sk.length * 0.7)) score = 500 + Math.min(sk.length, qk.length);
      else if (st.length > 1 && st.every(function (w) { return qt.indexOf(w) > -1; })) score = 300 + sk.length;
      if (!score && st.length > 1 && st.every(function (w) { return qt.some(function (x) { return x === w || (w.length >= 5 && x.length >= 4 && osa(x, w, 1) <= 1); }); })) score = 200 + sk.length;
      if (score > bl) { bl = score; best = sy; }
    });
    return best ? best.p : null;
  }
  function unitGrams(food, unit) { for (var i = 0; i < food.u.length; i++) if (food.u[i][0] === unit) return food.u[i][1]; return null; }
  var CASE_SUF = /(ning|dan|ni|ga|da|ni|lari|ларни|ов|а|у|ы|и|ой|ом|е)$/;
  function bestHit(foods, name, o) {
    var h = search(foods, name, { limit: 1, recents: o && o.recents, favs: o && o.favs, freq: o && o.freq })[0]; if (h) return h;
    var st = name.split(/\s+/).map(function (w) { return w.length > 4 ? w.replace(CASE_SUF, '') : w; }).join(' ');      // "osh-dan", "плов-а": kelishik/падеж qo'shimchasi
    return st !== name ? search(foods, st, { limit: 1, recents: o && o.recents, favs: o && o.favs, freq: o && o.freq })[0] : null;
  }
  function parseText(text, foods, o) {                // lokal tahlil: topilganlar va topilmaganlar (oila: omillar sinonimdan, o'lcham so'zdan)
    var items = [], miss = [];
    splitText(text).forEach(function (fr) {
      var p = parseFragment(fr); if (!p.name) { miss.push(fr); return; }
      var hit = bestHit(foods, p.name, o), szid = p.sz;
      if (hit && p.sz && !(hit.fam && hit.fam.sz)) { var h2 = bestHit(foods, p.raw, o); if (h2) { hit = h2; szid = null; } }      // "katta burger" — o'lcham omili yo'q, sinonim bo'lishi mumkin
      if (!hit) { miss.push(fr); return; }
      var fam = null, food = hit, sel = null, qn = p.name;
      if (hit.fam) { fam = hit; sel = famDefault(hit); var pk = famPick(hit, p.sz && !hit.fam.sz ? p.raw : p.name) || famPick(hit, p.raw); if (pk) Object.keys(pk).forEach(function (a) { sel[a] = pk[a]; }); if (!hit.fam.sz) szid = null; food = famVariant(hit, sel, szid); }
      var qty = p.qty > 0 ? p.qty : 1, u = p.unit, g;
      if (u === 'g100' && p.qty > 0) { g = p.qty; qty = p.qty; }                // "200 g tovuq"
      else { if (!u || unitGrams(food, u) == null) u = (food.b && food.b.filter(function (b) { return b.d; })[0] || { k: food.u[0][0] }).k; if (unitGrams(food, u) == null) u = food.u[0][0]; g = unitGrams(food, u) * qty; if (u === 'g100') { g = qty * 100; } }
      var vk = fam ? fam.fam.id : hit.id, vs = o && o.vessels ? o.vessels.filter(function (v) { return v.fam[vk] > 0; }) : [];
      if (vs.length && u !== 'g100') {                                         // foydalanuvchining o'z idishi (shu oila uchun): «laganimda», «bir lagan osh», «2 osh»
        var want = p.my ? [p.my] : (u === 'kosa' ? ['kosa'] : (u === 'likop' ? ['lagan', 'likopcha'] : (u === 'piyola' ? ['piyola'] : null))), pickV = null;
        if (want) want.forEach(function (kd) { if (!pickV) pickV = vs.filter(function (v) { return v.kind === kd; })[0]; }); else if (!p.unit) pickV = vs[0];
        if (pickV) { u = 'v:' + pickV.id; g = pickV.fam[vk] * qty; }
      }
      var it = { text: fr, fid: hit.id, food: food, unit: u, qty: qty, g: g, est: !!food.e };
      if (u.indexOf('v:') === 0) { it.vfill = 'tola'; it.vessel = u; }
      if (fam) { it.fam = fam; it.sel = sel; it.szid = fam.fam.sz ? (szid || fam.fam.sz.d) : null; it.vr = food.vr; it.sz = fam.fam.sz ? it.szid : null; }
      items.push(it);
    });
    return { items: items, missing: miss };
  }

  /* ---------- suv hisobi: qo'lda stakanlar + ichimlik/suyuq taomlar (data/suv-ulush.json: id → 0…1) ----------
     Ichimlik/suyuq taom ml'i × ulush HISOBLANADI (saqlanmaydi): yozuv o'chirilsa/porsiya o'zgarsa suv ham o'zi o'zgaradi. Yangi qoida faqat st.prefs.suvFrom (bugundan) kunlar uchun — eski kunlar o'zgarmaydi.
     Yozuvning taomi: e.fid (baza) yoki e.sfid (rasm/AI/retsept yozuvi nomi bo'yicha topilgan baza taomi; ilova saqlaydi). ml ≈ g (suyuqlik zichligi ≈ 1). */
  var SUV = {};
  function setSuv(j) { SUV = (j && j.ulush) || {}; }
  function suvShare(e) { var v = SUV[(e && (e.fid || e.sfid)) || '']; return typeof v === 'number' ? v : 0; }
  function waterInfo(st, d) {
    var x = dayOf(st, d), manual = x && x.water > 0 ? x.water * GLASS_ML : 0, from = st && st.prefs && st.prefs.suvFrom, items = [], drink = 0;
    if (x && from && d >= from) x.food.forEach(function (e) { var sh = suvShare(e); if (sh > 0 && e.g > 0) { var ml = Math.round(e.g * sh); items.push({ e: e, ml: ml, share: sh }); drink += ml; } });
    var ml = manual + drink; return { manual: manual, drink: drink, ml: ml, glasses: Math.floor(ml / GLASS_ML + 1e-9), items: items };
  }

  return { VERSION: VERSION, ACT: ACT, setSuv: setSuv, suvShare: suvShare, waterInfo: waterInfo, GOAL_DELTA: GOAL_DELTA, FLOOR: FLOOR, MEALS: MEALS, LIMITS: LIMITS, KCAL_PER_KG: KCAL_PER_KG, GLASS_ML: GLASS_ML, STEP_BASE: STEP_BASE, MET_NET: MET_NET, ROUTES: ROUTES,
    bmrRaw: bmrRaw, bmi: bmi, validate: validate, restrictions: restrictions, macros: macros, water: water, plan: plan,
    strideM: strideM, distanceKm: distanceKm, stepKcal: stepKcal, stepCredit: stepCredit, stepBase: stepBase, extraSteps: extraSteps, compareKm: compareKm, dayBalance: dayBalance,
    portion: portion, sumEntries: sumEntries, mealByHour: mealByHour, emptyState: emptyState, dayOf: dayOf, ensureDay: ensureDay, dayTotals: dayTotals,
    addFood: addFood, removeFood: removeFood, restoreFood: restoreFood, setWater: setWater, setSteps: setSteps, setAutoSteps: setAutoSteps, setManualSteps: setManualSteps, manualSteps: manualSteps, toggleFav: toggleFav, addCustom: addCustom,
    addWeight: addWeight, removeWeight: removeWeight, avg7: avg7, weightInfo: weightInfo, weightSeries: weightSeries, currentWeight: currentWeight, goalProgress: goalProgress,
    stepsSeries: stepsSeries, stepsStats: stepsStats, stepsTotal: stepsTotal, monthSteps: monthSteps, weekdayIdx: weekdayIdx, weekSummary: weekSummary,
    dayLimit: dayLimit, dayStatus: dayStatus, isComplete: isComplete, finishDay: finishDay, trackStart: trackStart, streak: streak, monthGrid: monthGrid, minutesToBurn: minutesToBurn, recipe: recipe, saveRecipe: saveRecipe, removeCustom: removeCustom,
    migrate: migrate, exportState: exportState, importState: importState, key: key, normFoods: normFoods, buildIndex: buildIndex, freqMap: freqMap, osa: osa, search: search, parseText: parseText, parseFragment: parseFragment, splitText: splitText, unitGrams: unitGrams, VESSEL_MAX: VESSEL_MAX, VKINDS: VKINDS, FILL: FILL, SCALE: SCALE, VUNIT: VUNIT, vesselById: vesselById, vesselsFor: vesselsFor, addVessel: addVessel, linkVessel: linkVessel, removeVessel: removeVessel, vessGrams: vessGrams, cleanVessels: cleanVessels, aliasMap: aliasMap, famDef: famDef, famKey: famKey, famSelOf: famSelOf, famDefault: famDefault, famVariant: famVariant, famLabel: famLabel, famPick: famPick, TPL_MAX: TPL_MAX, cleanTpls: cleanTpls, addTemplate: addTemplate, tplById: tplById, renameTemplate: renameTemplate, removeTemplate: removeTemplate, moveTemplate: moveTemplate, tplKcal: tplKcal, yesterdayEntries: yesterdayEntries, kechagidekOk: kechagidekOk, suggestTemplate: suggestTemplate,
    dates: D, num: num };
});
