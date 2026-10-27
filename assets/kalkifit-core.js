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
  var PROTEIN_MAX_SHARE = 0.35, FAT_SHARE = 0.2;          // v50: yog' maqsadi — kunlik kkalning 20% i (pastki chegara, IOM AMDR 20–35%); uglevod — qolgani
  var WATER_ML_PER_KG = 33, GLASS_ML = 250;
  var STRIDE_K = 0.414, MET_WALK = 3.5, WALK_KMH = 5, MET_NET = MET_WALK - 1;           // MET_NET: sof sarf (dam olish sarfisiz)
var STEP_BASE = { 1: 4000, 2: 4000, 3: 7000, 4: 10000, 5: 13000 };          // ESKI (v50 gacha) — faqat eski testlar/ko'rsatkich uchun; limitda ishlatilmaydi                    // faollik darajasiga odatiy kunlik qadam (kam harakat / o'rtacha / faol / juda faol) — me'yorga allaqachon kiritilgan
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
  function macros(kcal, weight, goal, pg) {          // pg — oqsil maqsadi (protein()); berilmasa eski hisob (moslik uchun)
    var perKg = PROTEIN_PER_KG[goal] || PROTEIN_PER_KG.keep, p = pg > 0 ? pg : Math.min(perKg * weight, PROTEIN_MAX_SHARE * kcal / 4);
    p = Math.round(p); var f = Math.ceil(FAT_SHARE * kcal / 9),          /* ≥ 20% (pastga yaxlitlansa chegaradan tushardi) */ c = Math.max(0, Math.round((kcal - 4 * p - 9 * f) / 4));
    return { p: p, f: f, c: c, pKcal: 4 * p, fKcal: 9 * f, cKcal: 4 * c, pPerKg: round1(p / weight) };
  }
  /* ---------- oqsil maqsadi (v48): ozish/vazn olish 1,6 g/kg, saqlash 1,2 g/kg; kg — BMI > 27 bo'lsa bo'ydan tavsiya vazni (BMI 25), aks holda joriy (trend) vazn.
     Yuqori chegara 2,2 g/kg, 10 g ga yaxlitlanadi; qo'lda (profile.protG) 60–250 g. Plato tahlili ham AYNAN shu funksiyadan foydalanadi. Manbalar: docs/tartib.md */
  var PROT_K = { lose: 1.6, slow: 1.6, gain: 1.6, keep: 1.2 }, PROT_MAX = 2.2, PROT_MIN_G = 60, PROT_MAX_G = 250, REF_BMI = 27, REF_TO = 25;
  function refWeight(p, kg) { var h = num(p && p.height) / 100, w = num(kg) || num(p && p.weight); return h > 0 && w / (h * h) > REF_BMI ? Math.round(REF_TO * h * h * 10) / 10 : w; }
  function protein(p, kg) {
    var ref = refWeight(p, kg), goal = (restrictions(p).keepOnly ? 'keep' : p && p.goal) || 'keep', k = PROT_K[goal] || PROT_K.keep;
    var auto = Math.round(Math.min(k, PROT_MAX) * ref / 10) * 10, man = num(p && p.protG), g = man >= PROT_MIN_G ? Math.min(PROT_MAX_G, Math.round(man)) : auto;
    return { g: g, auto: auto, manual: man >= PROT_MIN_G, ref: ref, perKg: k };
  }
  /* ---------- «Mening tartibim» (v48): kunlik limit ovqat vaqtlariga bo'linadi (limit o'zgarmaydi). Ulushlar: nonushta / tushlik / kechki / tamaddi ---------- */
  var TM50_FROM = 1793003413000, TM50_TO = 1793021775000;          // v48 va v50 relizlari (merge vaqti, UTC ms) — onboarding'da tartib savoli bo'lgan oraliq
  var TARTIB = { std: { b: 30, l: 35, d: 25, s: 10 }, kech: { b: 15, l: 30, d: 45, s: 10 }, nobf: { b: 0, l: 40, d: 45, s: 15 }, erkin: null }, TARTIB_DEF = 'erkin';          // v50: standart — «Farqi yo'q» (budjet ko'rinmaydi); tanlaganlarniki saqlanadi
  function tartibOf(p) { var t = p && p.tartib; return TARTIB.hasOwnProperty(t) ? t : TARTIB_DEF; }
  function mealSplit(limit, mode) {                // butun sonlar, yig'indisi AYNAN limitga teng (eng katta qoldiq usuli)
    var sh = TARTIB[mode]; limit = Math.max(0, Math.round(num(limit))); if (!sh) return null;
    var raw = MEALS.map(function (m) { return limit * sh[m] / 100; }), out = {}, fl = raw.map(Math.floor), left = limit - fl.reduce(function (a, b) { return a + b; }, 0);
    raw.map(function (v, i) { return [v - fl[i], i]; }).sort(function (a, b) { return b[0] - a[0] || a[1] - b[1]; }).slice(0, left).forEach(function (x) { fl[x[1]]++; });
    MEALS.forEach(function (m, i) { out[m] = fl[i]; }); return out;
  }
  /* ovqat vaqti budjetlari + qoldiq o'tkazish.  o = { limit, mode, eaten: {b,l,d,s}, min (kun daqiqasi, 0–1439) }
     Tartib vaqtda: nonushta (10:30 gacha) → tushlik (15:30 gacha) → kechki (23:00 gacha); tamaddi — butun kun (o'tib ketmaydi).
     O'tib ketgan ovqat vaqtining farqi (tejalgan +, oshgan −) keyingi, hali o'tmagan ovqatlarga ULUSHIGA qarab o'tadi; hozirgi/keyingi ovqatda oshgani darhol keyingilardan olinadi.
     Budjet hech qachon 0 dan past bo'lmaydi. Ulushi 0 bo'lgan ovqat (nonushtasiz tartibda nonushta) yozilsa — farq avval TUSHLIKdan olinadi. */
  var MEAL_END = { b: 630, l: 930, d: 1380 }, CARRY_ORD = ['b', 'l', 'd', 's'];
  function mealBudgets(o) {
    var mode = TARTIB[o.mode] ? o.mode : (o.mode === 'erkin' ? 'erkin' : TARTIB_DEF), sh = TARTIB[mode], limit = Math.max(0, Math.round(num(o.limit))), ea = o.eaten || {}, min = o.min == null ? 720 : o.min;
    if (!sh) return { mode: mode, meals: null };
    var base = mealSplit(limit, mode), bud = {}, st = {}, now = mealByHour(Math.floor(min / 60), min % 60), moves = [];
    MEALS.forEach(function (m) { bud[m] = base[m]; st[m] = m !== 's' && min >= MEAL_END[m] ? 'past' : (m === now ? 'now' : 'next'); });
    if (min >= MEAL_END.d) st.s = 'now';
    var give = function (from, amt) {                                    // amt > 0 — tejalgan, < 0 — oshgan; ulushiga qarab keyingilarga
      var idx = CARRY_ORD.indexOf(from), rcp = CARRY_ORD.slice(idx + 1).filter(function (m) { return st[m] !== 'past' && sh[m] > 0; });
      if (!rcp.length) return;
      if (amt < 0 && sh[from] === 0 && rcp.indexOf('l') > -1) {           // nonushtasiz tartibda yozilgan nonushta — avval tushlikdan
        var take = Math.min(bud.l, -amt); bud.l -= take; moves.push({ from: from, to: 'l', k: -take }); amt += take; if (amt >= 0) return; rcp = rcp.filter(function (m) { return m !== 'l'; }); if (!rcp.length) return;
      }
      var tot = rcp.reduce(function (a, m) { return a + sh[m]; }, 0), rest = amt;
      rcp.forEach(function (m, i) { var part = i === rcp.length - 1 ? rest : Math.round(amt * sh[m] / tot); rest -= part; var nb = Math.max(0, bud[m] + part); moves.push({ from: from, to: m, k: nb - bud[m] }); bud[m] = nb; });
    };
    CARRY_ORD.forEach(function (m) {
      var e = Math.round(num(ea[m]));
      if (st[m] === 'past') give(m, bud[m] - e);
      else if (e > bud[m]) give(m, bud[m] - e);
    });
    var meals = {}; MEALS.forEach(function (m) { var e = Math.round(num(ea[m])); meals[m] = { share: sh[m], base: base[m], budget: bud[m], eaten: e, left: Math.max(0, bud[m] - e), state: st[m], over: e > bud[m] ? e - bud[m] : 0 }; });
    var tgt = st[now] === 'past' ? null : now, got = moves.filter(function (x) { return x.to === tgt && x.k > 0; }), saved = got.reduce(function (a, x) { return a + x.k; }, 0);
    var tookFrom = {}; moves.forEach(function (x) { if (x.k < 0) { if (!tookFrom[x.from] || x.k < tookFrom[x.from].k) tookFrom[x.from] = { to: x.to, k: x.k }; } });
    var eatenAll = MEALS.reduce(function (a, m) { return a + Math.round(num(ea[m])); }, 0);
    return { mode: mode, meals: meals, now: tgt, note: saved >= 50 ? { k: saved, from: got.map(function (x) { return x.from; }).filter(function (v, i, a) { return a.indexOf(v) === i; }) } : null, took: tookFrom, dayOver: eatenAll > limit, limit: limit };
  }
  function water(weight) { var ml = Math.round(WATER_ML_PER_KG * weight); return { ml: ml, glasses: Math.max(1, Math.round(ml / GLASS_ML)), glassMl: GLASS_ML }; }
  /* ---------- v51: KUNLIK ME'YOR — YAGONA MODEL (docs/limit.md) ----------
     limit = BMR (Mifflin–St Jeor) × koeff + shaxsiy tuzatish + qadam krediti ± maqsad, pastki chegaradan (S.FLOOR) past emas.
     Koeff: Android ilovada (ish turi tanlangan va qadam yoqilgan) — ISH TURI (yurishsiz, kundalik hayot; shu turga kiritilgan qadam bazasi bilan), aks holda — umumiy faollik (ACT, yurish ichida) va kredit 0.
     Qadam krediti: max(0, qadam − baza) × bo'y × 0,415 / 1000 km × vazn × 0,5 kkal/kg/km (ACSM sof) × 0,7, kuniga ≤ 500. Bazadan kam qadam ayirilmaydi. */
  var LIM = {
    JOB: { sit: { k: 1.40, base: 5000 }, stand: { k: 1.60, base: 7500 }, heavy: { k: 1.85, base: 10000 } },          // FAO/WHO/UNU 2004 PAL (sedentary/light 1,40–1,69, active 1,70–1,99) + Tudor-Locke qadam toifalari (<5 000 / 7 500 / 10 000)
    JOB_ACT: { sit: 2, stand: 3, heavy: 5 },          // qadam o'chsa — mos umumiy daraja (yurish ichida)
    STRIDE: 0.415, WALK: 0.5, CRED_K: 0.7, CRED_MAX: 500, SUM_MAX: 800,          // v55: qadam + mashg'ulot krediti birga kuniga ≤ 800 kkal
    CORR_MAX: 1000
  };
  function jobOn(st) { var p = st && st.profile, q = st && st.prefs; return !!(p && LIM.JOB[p.job] && q && (q.qa === 'on' || q.qm === 'on')); }          // ish turi modeli: tasdiqlangan ish turi + qadam manbasi (Android avtomatik «qa» yoki v55: iPhone/veb qo'lda «qm»)
  /* v55: MASHG'ULOT — 2024 Adult Compendium of Physical Activities (Herrmann va boshq., J Sport Health Sci 2024; pacompendium.com), MET: [yengil, o'rtacha, og'ir] (kodlar — docs/limit.md).
     spm — mashg'ulotda taxminiy qadam/daqiqa (qadam hosil qiladigan turlar; qadam bilan ikki marta hisoblamaslik uchun). Kkal (NET) = (MET − 1) × vazn × soat (tinch holat BMR'da bor). */
  var EX = {
    yugurish: { met: [6.5, 7.5, 9.3], spm: 160, e: '🏃' }, zal: { met: [3.5, 5.0, 6.0], e: '🏋️' }, velosiped: { met: [4.0, 6.8, 8.0], e: '🚴' }, futbol: { met: [3.5, 7.0, 9.5], spm: 110, e: '⚽' },
    suzish: { met: [5.8, 8.0, 9.8], e: '🏊' }, uyda: { met: [2.8, 3.8, 7.5], e: '🤸' }, raqs: { met: [3.0, 5.0, 9.8], spm: 70, e: '💃' }, yoga: { met: [2.3, 2.7, 4.0], e: '🧘' },
    kurash: { met: [5.3, 7.8, 10.3], e: '🥊' }, voleybol: { met: [3.0, 6.0, 8.0], spm: 80, e: '🏐' }, ogir: { met: [3.8, 5.0, 7.8], e: '🧹' }, boshqa: { met: [3.0, 4.5, 7.0], e: '➕' }
  };
  var EX_ORDER = ['yugurish', 'zal', 'velosiped', 'futbol', 'suzish', 'uyda', 'raqs', 'yoga', 'kurash', 'voleybol', 'ogir', 'boshqa'];
  function exNet(e, w) { var d = EX[e && e.t]; if (!d) return 0; var met = d.met[Math.max(0, Math.min(2, e.lv == null ? 1 : e.lv))]; return Math.round(Math.max(0, met - 1) * num(w) * Math.max(0, num(e.min)) / 60); }
  function walkNet(steps, height, weight) { return Math.max(0, num(steps)) * num(height) * LIM.STRIDE / 100 / 1000 * num(weight) * LIM.WALK; }          // qadam sof kkal (0,7 siz)
  var STEPS_SANE = 40000;          /* v52: kuniga 40 000 dan ko'p qadam — xato deb olinadi: kredit va plato hisobiga kirmaydi */
  function creditOf(steps, height, weight, base) {
    var extra = Math.max(0, Math.round(num(steps)) - base); if (!extra) return 0;
    return Math.min(LIM.CRED_MAX, Math.round(extra * num(height) * LIM.STRIDE / 100 / 1000 * num(weight) * LIM.WALK * LIM.CRED_K));
  }
  function plan(p, o) {
    var w = num(p.weight), h = num(p.height), a = num(p.age), sex = p.sex === 'f' ? 'f' : 'm', job = !!(o && o.job) && LIM.JOB[p.job] ? p.job : null;
    var r = restrictions(p), goal = r.keepOnly ? 'keep' : (GOAL_DELTA[p.goal] != null ? p.goal : 'keep');
    var kk = job ? LIM.JOB[job].k : (ACT[p.act] || ACT[1]), corr = Math.max(-LIM.CORR_MAX, Math.min(LIM.CORR_MAX, Math.round(num(p.corr)))), bmr = bmrRaw(sex, w, h, a), base0 = Math.round(bmr * kk), tdee = base0 + corr;
    var delta = GOAL_DELTA[goal], raw = tdee + delta, floorMin = FLOOR[sex], target = raw, floorApplied = false;
    if (delta < 0 && raw < floorMin) { target = floorMin; floorApplied = true; }
    var out = { sex: sex, bmrRaw: bmr, bmr: Math.round(bmr), act: p.act, actK: kk, job: job, jobBase: job ? LIM.JOB[job].base : 0, base0: base0, corr: corr, tdee: tdee, goal: goal, goalAsked: p.goal, goalOverridden: goal !== p.goal, delta: delta, rawTarget: raw,
      target: target, floorApplied: floorApplied, floorMin: floorMin, kgPerWeek: Math.round((target - tdee) * 7 / KCAL_PER_KG * 100) / 100, bmi: round1(bmi(w, h)), restrictions: r, doctor: r.keepOnly, notes: [] };
    out.protein = protein(p, w); out.macros = macros(target, w, goal, out.protein.g); out.water = water(w);
    if (r.under18) out.notes.push('under18'); if (r.preg) out.notes.push('preg'); if (r.lowBmi) out.notes.push('lowBmi'); if (floorApplied) out.notes.push('floor');
    return out;
  }

  /* ---------- qadam ---------- */
  function strideM(height) { return height * STRIDE_K / 100; }
  function distanceKm(steps, height) { return Math.max(0, steps) * strideM(height) / 1000; }
  function stepKcal(steps, height, weight) { return Math.round(MET_WALK * weight * (distanceKm(steps, height) / WALK_KMH)); }
  function stepBase(act) { return STEP_BASE[act] || STEP_BASE[2]; }
  function extraSteps(steps, act) { return Math.max(0, Math.round(num(steps)) - stepBase(act)); }                      // odatiy chegaradan ORTIQ qadamlar
  function stepCredit(steps, height, weight, base) { return creditOf(steps, height, weight, base == null ? 0 : base); }          // v51: yagona kredit formulasi (creditOf)
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
  function dayBalance(st, d, eaten) { var dp = dayPlan(st, d); return { target: dp.target, eaten: eaten, credit: Math.max(0, dp.limit - dp.target), base: dp.base, extraSteps: dp.extra, limit: dp.limit, remaining: dp.limit - eaten, dp: dp }; }          // v51: dayPlan ustida

  /* ---------- ovqat hisobi ---------- */
  function portion(food, grams) {                    // food: 100 g uchun k,p,f,c; grams → yozuv qiymatlari
    var m = grams / 100; return { g: round1(grams), kcal: Math.round(food.k * m), p: round1(food.p * m), f: round1(food.f * m), c: round1(food.c * m) };
  }
  function sumEntries(list) {
    var t = { kcal: 0, p: 0, f: 0, c: 0 }; (list || []).forEach(function (e) { t.kcal += e.kcal || 0; t.p += e.p || 0; t.f += e.f || 0; t.c += e.c || 0; });
    return { kcal: Math.round(t.kcal), p: Math.round(t.p), f: Math.round(t.f), c: Math.round(t.c) };
  }
  function mealByHour(h, mi) { var t = h * 60 + (mi || 0); return t >= 300 && t < 630 ? 'b' : (t >= 630 && t < 930 ? 'l' : (t >= 930 && t < 1080 ? 's' : (t >= 1080 && t < 1380 ? 'd' : 's'))); }       // 05:00–10:30 nonushta, 10:30–15:30 tushlik, 15:30–18:00 tamaddi, 18:00–23:00 kechki ovqat, qolgan vaqt tamaddi

  /* ---------- sana bo'yicha ma'lumot ---------- */
  function dayOf(st, d) { return st.days[d] || null; }
  function ensureDay(st, d) { if (!st.days[d]) st.days[d] = { food: [], water: 0, steps: 0 }; if (st.trackStart && d < st.trackStart) st.trackStart = d; return st.days[d]; }   // oldingi sanaga yozilsa, kuzatuv boshlanishi shu sanaga suriladi
  function dayTotals(st, d) { var x = dayOf(st, d); return sumEntries(x ? x.food : []); }
  function emptyState() { return { v: VERSION, setup: false, created: null, seq: 1, profile: null, days: {}, weights: [], customFoods: [], recents: [], favs: [], tpls: [], vessels: [], stepGoal: 8000, prefs: {}, lastBackup: null, trackStart: null }; }
  function addFood(st, d, e) {
    var x = ensureDay(st, d), it = { id: st.seq++, fid: e.fid || null, name: e.name || null, meal: MEALS.indexOf(e.meal) > -1 ? e.meal : 's', unit: e.unit || null, qty: e.qty || 1, g: e.g || 0, kcal: Math.round(e.kcal) || 0, p: round1(e.p || 0), f: round1(e.f || 0), c: round1(e.c || 0), est: !!e.est, ts: e.ts || 0 };
    if (e.vr) it.vr = String(e.vr).slice(0, 40); if (e.sz) it.sz = String(e.sz).slice(0, 20);
    if (e.pt && !it.fid) it.pt = String(e.pt).slice(0, 60);          // bazada yo'q yozuv (AI/rasm/matn): porsiya matni ALOHIDA — nomga qo'shilmaydi
    if (e.ifid) it.ifid = String(e.ifid).slice(0, 60); if (/^(salat|shorva|issiq|zakuska|desert)$/.test(e.ikat || '')) it.ikat = e.ikat;          // menyudan: ikonka uchun baza taomi va toifa (kkal'ga ta'sir yo'q)
    if (e.vn) { it.vn = String(e.vn).slice(0, 30); if (FILL[e.vf]) it.vf = e.vf; }                 // «Mening idishim»: idish nomi (snapshot) va to'ldirish
    x.food.push(it); if (it.fid) { st.recents = [it.fid].concat(st.recents.filter(function (r) { return r !== it.fid; })).slice(0, 12); }
    return it;
  }
  function removeFood(st, d, id) { var x = dayOf(st, d); if (!x) return null; for (var i = 0; i < x.food.length; i++) if (x.food[i].id === id) return { item: x.food.splice(i, 1)[0], index: i }; return null; }
  function restoreFood(st, d, rm) { if (!rm) return; ensureDay(st, d).food.splice(Math.min(rm.index, st.days[d].food.length), 0, rm.item); }
  function setWater(st, d, n) { ensureDay(st, d).water = Math.max(0, Math.min(40, Math.round(n))); return st.days[d].water; }
  function setSteps(st, d, n) { ensureDay(st, d).steps = Math.max(0, Math.min(200000, Math.round(num(n)))); return st.days[d].steps; }
  /* avtomatik qadam (Android: sensor / Health Connect — native qatlam har kun uchun KATTASINI beradi, bu JAMI qiymat).
     day.sa — shu kungacha ko'rilgan eng katta avtomatik jami (KAMAYMAYDI); day.steps = sa + (eski qo'lda qo'shilgan, o'zgarmas ustama).
     Idempotent: bir xil jami necha marta kelsa ham natija bir xil; kechikkan kichik qiymat kattasini bosmaydi.
     Manbasi noma'lum eski yozuv (sa yo'q, steps > 0 — qo'lda kiritilgan yoki boshqa qurilmadan) QO'SHILMAYDI: kun = max(eski, avtomatik). */
  function manualSteps(x) { return x && x.sa != null ? Math.max(0, Math.round(num(x.steps)) - Math.round(num(x.sa))) : 0; }
  function setAutoSteps(st, d, n) {
    n = Math.max(0, Math.min(200000, Math.round(num(n)))); var x = st.days[d];
    if (!x) { if (!n) return false; x = ensureDay(st, d); }
    var old = Math.round(num(x.steps)), a;
    if (x.sa == null) { a = Math.max(old, n); if (!a) return false; x.sa = a; x.steps = a; return true; }          /* eski yozuv: kattasi, yig'ma emas */
    var sa = Math.round(num(x.sa)), m = Math.max(0, old - sa); a = Math.max(sa, n);
    if (a === sa && old === a + m) return false;
    x.sa = a; x.steps = Math.min(200000, a + m); return true;
  }
  function setManualSteps(st, d, n) { var x = ensureDay(st, d), a = Math.round(num(x.sa)); x.steps = Math.max(0, Math.min(200000, a + Math.max(0, Math.round(num(n))))); return x.steps; }
  function toggleFav(st, fid) { var i = st.favs.indexOf(fid); if (i > -1) st.favs.splice(i, 1); else st.favs.unshift(fid); return i === -1; }
  function addCustom(st, o) {
    var f = { id: 'c' + st.seq++, n: String(o.name || '').slice(0, 60), k: Math.round(num(o.k)), p: round1(num(o.p)), f: round1(num(o.f)), c: round1(num(o.c)), u: [['g100', 100]], e: 1, t: 'x', custom: 1 };
    if (o.g > 0) f.u.unshift(['porsiya', Math.round(o.g)]); if (!f.n || !(f.k >= 0)) return null; st.customFoods.push(f); return f;
  }

  /* ---------- kun limiti, holat, ketma-ket kunlar, taqvim ---------- */
  function planSt(st) { return plan(st.profile, { job: jobOn(st) }); }
  /* BITTA manba: shu kun uchun to'liq hisob (halqa, budjetlar, «Nima yesam», plato, Haftangiz, (i) — hammasi shundan) */
  /* v55: limit = BMR × k + qadam krediti + MASHG'ULOT krediti + shaxsiy tuzatish ± maqsad (ozishda pastki chegaradan past emas). Ikki marta hisoblamaslik:
     • qadam bazasidagi qadam — k ichida (kredit faqat bazadan ortig'iga);
     • qadam hosil qiladigan mashg'ulot (yugurish, futbol…): uning taxminiy qadami = daqiqa × spm (kunlik qadamdan oshmaydi); shundan bazadan ORTIQ qismga allaqachon qadam krediti berilgan bo'lishi mumkin —
       ustma-ust qism = min(mashg'ulot qadami, max(0, kunlik qadam − baza)); mashg'ulot NET = max(0, mashg'ulot kkal − ustma-ust qadamning sof kkal'i);
     • kreditlar: qadam — creditOf (×0,7, ≤ 500), mashg'ulot — NET × 0,7; ikkalasi birga ≤ 800. Ish turi modeli bo'lmasa (ACT, yurish va odatiy sport daraja ichida) — kredit 0.
     Balans (ko'rsatish): sarf = BMR × k + tuzatish + qadam NET (bazadan ortig'i, to'liq) + mashg'ulot NET (to'liq); balans = iste'mol − sarf. */
  function dayPlan(st, d, stepsOver) {
    var pl = planSt(st), x = d ? dayOf(st, d) : null, steps = stepsOver != null ? num(stepsOver) : (x ? x.steps || 0 : 0), suspect = steps > STEPS_SANE, h = num(st.profile.height), w = currentWeight(st) || num(st.profile.weight);
    var exs = x && Array.isArray(x.ex) ? x.ex : [], exRaw = 0, exMin = 0, exSteps = 0; exs.forEach(function (e) { exRaw += exNet(e, w); exMin += Math.max(0, num(e.min)); exSteps += Math.max(0, num(e.min)) * ((EX[e.t] || {}).spm || 0); });
    var okSteps = pl.job && !suspect, extra = okSteps ? Math.max(0, Math.round(steps) - pl.jobBase) : 0, overlap = okSteps ? Math.min(Math.min(exSteps, steps), extra) : 0;
    var overKcal = Math.round(walkNet(overlap, h, w)), exNetV = Math.max(0, exRaw - overKcal), stepNet = Math.round(walkNet(extra, h, w));
    var stepCredit = okSteps ? creditOf(steps, h, w, pl.jobBase) : 0, exCredit = pl.job ? Math.round(exNetV * LIM.CRED_K) : 0, credit = Math.min(LIM.SUM_MAX, stepCredit + exCredit);
    if (stepCredit + exCredit > LIM.SUM_MAX) exCredit = Math.max(0, LIM.SUM_MAX - stepCredit);
    var spend = pl.tdee + credit, raw = spend + pl.delta, limit = raw, floorAdd = 0;
    if (pl.delta < 0 && raw < pl.floorMin) { floorAdd = pl.floorMin - raw; limit = pl.floorMin; }
    var sarf = pl.tdee + (pl.job ? stepNet + exNetV : 0);
    return { plan: pl, bmr: pl.bmr, k: pl.actK, life: pl.base0 - pl.bmr, corr: pl.corr, job: pl.job, base: pl.jobBase, steps: steps, extra: extra, suspect: suspect, stepCredit: stepCredit, stepNet: pl.job ? stepNet : 0,
      ex: exs, exMin: exMin, exRaw: exRaw, exOverlap: overKcal, exNet: exNetV, exCredit: exCredit, credit: credit, spend: spend, sarf: sarf, delta: pl.delta, floorAdd: floorAdd, limit: limit, target: pl.target };
  }
  /* v56: balans — HOZIRGACHA. Bugun uchun kun ulushi f = (mahalliy soat + daqiqa/60) / 24 (00:00 dan, chiziqli; uyqu alohida emas); o'tgan kunlar — f = 1.
     hozirgacha sarf = (BMR × k + tuzatish) × f + qadam NET + mashg'ulot NET (to'liq — ular haqiqatda bo'lgan); balans = iste'mol − hozirgacha sarf; reja ulushi = delta × f.
     holat: bal > tol → «Hozircha ortiqcha» (ozish/saqlash), bal < rejaF − tol → «Ozish tomonda», aks holda «Rejaga mos» (tol = 100 kkal). Kun yakunida (f = 1) — to'liq sarf (dp.sarf). */
  var BAL_TOL = 100;
  function dayFrac(d, now) { now = now || new Date(); var t = D.today(now); if (d < t) return 1; if (d > t) return 0; return Math.max(0, Math.min(1, (now.getHours() + now.getMinutes() / 60) / 24)); }
  function dayBal(st, d, eaten, now) {
    var dp = dayPlan(st, d), e = Math.round(num(eaten)), f = dayFrac(d, now), mov = dp.job ? dp.stepNet + dp.exNet : 0, base = dp.sarf - mov, sarfNow = Math.round(base * f) + mov, bal = e - sarfNow, rejaF = Math.round(dp.delta * f);
    var st0 = dp.delta > 0 ? (bal < rejaF - BAL_TOL ? 'kam' : 'mos') : (bal > BAL_TOL ? 'ortiq' : (dp.delta < 0 && bal < rejaF - BAL_TOL ? 'ozish' : 'mos'));
    return { eaten: e, f: f, base: base, mov: mov, sarfNow: sarfNow, sarf: sarfNow, sarfDay: dp.sarf, bal: bal, balDay: e - dp.sarf, reja: dp.delta, rejaF: rejaF, holat: st0, dp: dp };
  }
  /* mashg'ulot yozuvlari (kun ichida) */
  function addEx(st, d, o) { var x = ensureDay(st, d); x.ex = Array.isArray(x.ex) ? x.ex : []; var e = { id: 'e' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36), t: EX[o.t] ? o.t : 'boshqa', min: Math.max(1, Math.min(600, Math.round(num(o.min)))), lv: Math.max(0, Math.min(2, Math.round(num(o.lv == null ? 1 : o.lv)))), ts: o.ts || Date.now() }; x.ex.push(e); return e; }
  function updEx(st, d, id, o) { var x = dayOf(st, d), e = x && x.ex && x.ex.filter(function (y) { return y.id === id; })[0]; if (!e) return null; if (o.t && EX[o.t]) e.t = o.t; if (o.min != null) e.min = Math.max(1, Math.min(600, Math.round(num(o.min)))); if (o.lv != null) e.lv = Math.max(0, Math.min(2, Math.round(num(o.lv)))); return e; }
  function removeEx(st, d, id) { var x = dayOf(st, d); if (!x || !x.ex) return null; for (var i = 0; i < x.ex.length; i++) if (x.ex[i].id === id) return { item: x.ex.splice(i, 1)[0], index: i }; return null; }
  function restoreEx(st, d, rm) { if (!rm) return; var x = ensureDay(st, d); x.ex = Array.isArray(x.ex) ? x.ex : []; x.ex.splice(Math.min(rm.index, x.ex.length), 0, rm.item); }
  function cleanEx(a) { return Array.isArray(a) ? a.filter(function (e) { return e && EX[e.t] && num(e.min) > 0; }).slice(0, 30).map(function (e) { return { id: String(e.id || ('e' + Math.random().toString(36).slice(2, 8))).slice(0, 24), t: e.t, min: Math.max(1, Math.min(600, Math.round(num(e.min)))), lv: Math.max(0, Math.min(2, Math.round(num(e.lv == null ? 1 : e.lv)))), ts: num(e.ts) || 0 }; }) : []; }
  function dayLimit(st, d) { return dayPlan(st, d).limit; }
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
  function cleanAfsona(x) {                          // v54: «Afsona yoki haqiqat?» — javoblar (a/h), to'g'rilar, kunning savoli
    if (!x || typeof x !== 'object') return undefined; var o = { a: {}, ok: {} }, ID = /^a\d{2}$/;
    if (x.a && typeof x.a === 'object') Object.keys(x.a).forEach(function (k) { if (ID.test(k) && (x.a[k] === 'a' || x.a[k] === 'h')) o.a[k] = x.a[k]; });
    if (x.ok && typeof x.ok === 'object') Object.keys(x.ok).forEach(function (k) { if (o.a[k] && x.ok[k]) o.ok[k] = 1; });
    if (x.dq && typeof x.dq === 'object' && D.parse(String(x.dq.d || '')) && ID.test(String(x.dq.id || ''))) o.dq = { d: x.dq.d, id: x.dq.id, x: x.dq.x ? 1 : 0 };
    return o;
  }
  function migrate(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    var v = raw.v == null ? 0 : raw.v; if (typeof v !== 'number' || v > VERSION || v < 0) return null;
    var s = emptyState(); if (v === 0 && !raw.profile && !raw.days && !raw.log) return null;
    s.setup = !!raw.setup || !!raw.profile; s.created = raw.created || null; s.seq = Math.max(1, Math.round(num(raw.seq)) || 1);
    s.profile = raw.profile && typeof raw.profile === 'object' ? { sex: raw.profile.sex === 'f' ? 'f' : 'm', preg: !!raw.profile.preg, age: num(raw.profile.age), height: num(raw.profile.height), weight: num(raw.profile.weight), act: ACT[raw.profile.act] ? +raw.profile.act : 2, goal: GOAL_DELTA[raw.profile.goal] != null ? raw.profile.goal : 'keep', goalWeight: num(raw.profile.goalWeight) || null } : null;
    if (s.profile && TARTIB.hasOwnProperty(raw.profile.tartib)) s.profile.tartib = raw.profile.tartib;          // v48: «Mening tartibim» va qo'lda oqsil maqsadi (yo'q bo'lsa — standart, avtomatik)
    if (s.profile && num(raw.profile.protG) >= PROT_MIN_G) s.profile.protG = Math.min(PROT_MAX_G, Math.round(num(raw.profile.protG)));
    if (s.profile && LIM.JOB[raw.profile.job]) s.profile.job = raw.profile.job;          // v51: Android ish turi (tasdiqlangan) va shaxsiy tuzatish (adaptiv me'yor)
    if (s.profile && num(raw.profile.corr) && Math.abs(num(raw.profile.corr)) <= LIM.CORR_MAX) s.profile.corr = Math.round(num(raw.profile.corr));
    if (raw.days && typeof raw.days === 'object') Object.keys(raw.days).forEach(function (d) { if (!D.parse(d)) return; var x = raw.days[d] || {}; s.days[d] = { food: Array.isArray(x.food) ? x.food.filter(function (e) { return e && typeof e === 'object'; }) : [], water: Math.max(0, Math.round(num(x.water))), steps: Math.max(0, Math.round(num(x.steps))) }; if (Array.isArray(x.ex) && x.ex.length) { var cx = cleanEx(x.ex); if (cx.length) s.days[d].ex = cx; } if (num(x.sa) > 0) s.days[d].sa = Math.min(s.days[d].steps, Math.round(num(x.sa))); var dd = s.days[d]; if (dd.sa >= 500 && Math.abs(dd.steps - 2 * dd.sa) <= dd.sa * 0.02) dd.steps = dd.sa;          /* v52: eski xato (qo'lda yozilgan + sensor yig'ilgan) — ANIQ ikki barobar bo'lsa tuzatiladi */ if (x.party) s.days[d].party = true; if (x.done) s.days[d].done = true; });
    Object.keys(s.days).forEach(function (d) { s.days[d].food.forEach(function (e) { if (!e.fid && typeof e.name === 'string' && !e.pt) { var sp = ptSplit(e.name); if (sp.pt) { e.name = sp.n; e.pt = sp.pt.slice(0, 60); } } }); });          // nomga yopishgan porsiya → `pt`
    if (v === 0 && Array.isArray(raw.log)) raw.log.forEach(function (e) { if (e && D.parse(e.d || e.date)) { var d = e.d || e.date; ensureDay(s, d).food.push({ id: s.seq++, fid: null, name: String(e.name || '?'), meal: 's', unit: null, qty: 1, g: 0, kcal: Math.round(num(e.kcal)), p: 0, f: 0, c: 0, est: true, ts: 0 }); } });   // eski v0: tekis "log"
    (Array.isArray(raw.weights) ? raw.weights : []).forEach(function (w) { if (w && D.parse(w.d)) addWeight(s, w.d, w.kg); });
    s.customFoods = Array.isArray(raw.customFoods) ? raw.customFoods.filter(function (f) { return f && f.id && f.n; }) : [];
    s.recents = Array.isArray(raw.recents) ? raw.recents.slice(0, 12) : []; s.favs = Array.isArray(raw.favs) ? raw.favs.slice() : [];
    s.tpls = cleanTpls(raw.tpls, s); s.vessels = cleanVessels(raw.vessels, s); s.afsona = cleanAfsona(raw.afsona);
    s.stepGoal = Math.max(1000, Math.round(num(raw.stepGoal)) || 8000); s.prefs = raw.prefs && typeof raw.prefs === 'object' ? raw.prefs : {}; s.lastBackup = raw.lastBackup || null; s.trackStart = raw.trackStart && D.parse(raw.trackStart) ? raw.trackStart : null; if (s.setup && !s.trackStart) s.trackStart = trackStart(s);
    /* v50 bir martalik tuzatish (qurilmada): v48 onboarding'da «Kun tartibi» savoli bor edi — «O'tkazib yuborish» ham 'std' yozardi. v48 (2026-10-26 08:30 UTC) dan v50 (13:36 UTC) gacha YARATILGAN va tartibi 'std' qolganlar
       tanlamagan hisoblanadi → «Farqi yo'q». Tanlov belgisi yo'q (o'tkazib yuborish bilan tanlov bir xil yoziladi), shuning uchun sana bo'yicha. Oraliqdan oldingi/keyingilarga tegilmaydi. prefs.tm50 — bir marta (keyin 'std' ni o'zi tanlasa qaytarilmaydi). */
    if (s.profile && !s.prefs.tm50) { s.prefs.tm50 = 1; if (s.profile.tartib === 'std' && s.created >= TM50_FROM && s.created < TM50_TO) delete s.profile.tartib; }
    return s;
  }
  /* ---------- «Odatdagi ovqatlarim» (shablonlar) va «Kechagidek» ---------- */
  var TPL_MAX = 12;
  function r1(x) { return Math.round(num(x) * 10) / 10; }
  /* eski xato: AI/rasm yozuvida porsiya nomga qo'shilardi («Lotus Biscoff pechenye (1,5 porsiya)», ostida «1 porsiya»). Endi alohida `pt`; eski yozuvlar yuklanganda ajratiladi */
  var PT_RE = /\d|porsiya|порци|dona|шт|kosa|коса|миск|stakan|стакан|piyola|пиал|qoshiq|ложк|bo'lak|bolak|кус|tilim|ломт|lagan|likop|тарел|\bml\b|мл|\bg\b|\bг\b|\bl\b|\bл\b|yarim|пол/i;
  function ptSplit(n, pt) { if (pt) return { n: n, pt: String(pt) }; var m = /^(.+?)\s*\(([^()]{1,60})\)\s*$/.exec(n); return m && PT_RE.test(m[2]) ? { n: m[1], pt: m[2] } : { n: n, pt: '' }; }
  function cleanTplItem(e) {
    if (!e || typeof e !== 'object') return null; var k = Math.round(num(e.kcal)); if (!(k >= 0) || !(e.fid || e.n || e.name)) return null;
    var sp = e.fid ? null : ptSplit(String(e.n || e.name || ''), e.pt);
    return { fid: e.fid ? String(e.fid).slice(0, 60) : null, n: sp ? sp.n.slice(0, 80) : String(e.n || e.name || '').slice(0, 80), pt: sp && sp.pt ? sp.pt.slice(0, 60) : undefined, unit: e.unit ? String(e.unit).slice(0, 20) : null, qty: num(e.qty) > 0 ? Math.min(3000, Math.round(num(e.qty) * 100) / 100) : 1, g: Math.max(0, Math.round(num(e.g))), kcal: k, p: r1(e.p), f: r1(e.f), c: r1(e.c), est: !!e.est, vr: e.vr ? String(e.vr).slice(0, 40) : undefined, sz: e.sz ? String(e.sz).slice(0, 20) : undefined, vn: e.vn ? String(e.vn).slice(0, 30) : undefined, vf: FILL[e.vf] ? e.vf : undefined };
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
  function key(s, raw) {                             // lotin/kirill/rus + xato yozuvga chidamli kalit: o' o‘ oʻ o` o’ → o, g' → g, ў қ ғ ҳ х ш ч ё ю я → lotin; raw — qo'sh harflar yig'ilmaydi (qatiq ≠ qattiq)
    var t = String(s || '').toLowerCase().replace(/[’'`‘ʻʼ´′]/g, ''), o = '';
    for (var i = 0; i < t.length; i++) o += CYR[t[i]] != null ? CYR[t[i]] : t[i];
    return o.replace(/w/g, 'v').replace(/kh/g, 'x').replace(/ph/g, 'f').replace(/ts/g, 's').replace(raw ? /$^/ : /([a-z])\1+/g, '$1').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
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
  /* ---- QIDIRUV (v34) ----
     Daraja (kichigi yaxshi): 0 — to'liq nom aynan · 1.2 — sinonim aynan · 1.3 — qavssiz nom aynan · 1.4 — guruh («osh/palov/плов/ош» → palov turlari) · 2 — nom so'rov bilan boshlanadi ·
     3 — nomdagi so'zlar so'rov so'zlari bilan boshlanadi · 4 — sinonim/boshqa yozuv (boshlanadi › so'z boshi) · 5 — imlo xatosi (faqat 5+ harfli so'rovda).
     3–4 harfli so'rovda faqat so'z boshidan mos keladi (so'z o'rtasidan va xato bilan — yo'q: «пло» → «пломбир» chiqmaydi).
     Bir darajada: sevimli/ko'p yeyilgan › ommaboplik (milliy taomlar, POP) › qisqa nom. */
  function foodKeys(f) {
    if (!f._nk) {
      var nm = [f.n, f.r].filter(Boolean), base = nm.map(function (x) { return String(x).replace(/\([^)]*\)/g, ' '); });
      var kc = function (x) { return key(x); };          // .map(key) emas: map indeksni 2-argument (raw) qilib yuboradi
      f._nk = nm.map(kc).concat(base.map(kc)).filter(function (x, i, a) { return x && a.indexOf(x) === i; });
      f._nw = f._nk.map(function (k) { return k.split(' '); });
      f._ak = (f.a || []).map(kc).filter(Boolean); f._aw = f._ak.map(function (k) { return k.split(' '); });
      var kr = function (x) { return key(x, true); };
      f._full = nm.map(kr);
      f._nkr = nm.map(kr).concat(base.map(kr)).filter(function (x, i, a) { return x && a.indexOf(x) === i; }); f._nwr = f._nkr.map(function (k) { return k.split(' '); });
      f._cmp = f._nk.concat(f._ak).map(function (k) { return k.replace(/[ -]/g, ''); });          // probel/defissiz («sutlickofe» ~ «sutli kofe»)
      f._nl = f._nk[0] ? f._nk[0].length : 99;
    }
    return f;
  }
  function buildIndex(foods) { foods.forEach(foodKeys); return foods; }       // indeksni oldindan qurish (har harfda qayta hisoblanmaydi)
  /* guruhlar: so'rov → bir oila taomlari (nomi boshqacha bo'lsa ham) */
  var GROUP_Q = { osh: 'palov', palov: 'palov', plov: 'palov', pilov: 'palov', palav: 'palov', pilaf: 'palov', 'osh palov': 'palov', 'toy oshi': 'palov', qaymoq: 'qaymoq', kaymak: 'qaymoq', protein: 'protein' };
  var GROUP = { palov: ['osh', 'toy-oshi', 'samarqand-oshi', 'fargona-oshi', 'buxoro-oshi', 'buxoro-oshi-qazili', 'buxoro-oshi-bedana', 'choyxona-osh', 'osh-tovuq'], qaymoq: ['qaymoq', 'smetana', 'qaymoq-10', 'qaymoq-yogli'], protein: ['protein-kukun', 'protein-izolyat', 'protein-kazein'] };          // «protein» — avval kukunlar, keyin batonchik
  /* ommaboplik: mashhur milliy taomlar (bir darajada oldinda) */
  var POP = { osh: 10, non: 10, choy: 10, shurva: 9, lagmon: 9, somsa: 9, manti: 9, chuchvara: 8, norin: 8, shashlik: 8, 'qozon-kabob': 8, dimlama: 7, mastava: 7, chalop: 6, moshxorda: 6, xonim: 6, qatiq: 7, sut: 7, kefir: 6, 'choyxona-osh': 7, 'toy-oshi': 8, 'samarqand-oshi': 7, 'fargona-oshi': 7, 'buxoro-oshi': 6, 'osh-tovuq': 6, halim: 5, beshbarmoq: 5, 'mosh-xorda': 6, tuxum: 7, kabob: 7, ayron: 5, qaymoq: 5, suzma: 5, 'protein-kukun': 3, 'protein-izolyat': 2, 'protein-kazein': 1 };
  function popOf(f) { return (POP[f.id] || 0) + (f.top ? 2 : 0) + (f.t === 'o' ? 1 : 0); }
  function wordsStart(words, qt, fuzzy) {              // har bir so'rov so'zi nomdagi biror so'z BOSHIDA (fuzzy: 5+ harfda xato bilan) → {d} | null
    var d = 0;
    for (var i = 0; i < qt.length; i++) {
      var q = qt[i], ok = false, bd = 9;
      for (var j = 0; j < words.length; j++) { var w = words[j];
        if (w === q) { ok = true; bd = 0; break; } if (w.indexOf(q) === 0) { ok = true; if (bd > 0.1) bd = 0.1; continue; }          // butun so'z > so'z boshi
        if (fuzzy && q.length >= 5) { var tol = q.length >= 6 ? 2 : 1, dd = osa(q, w.slice(0, q.length), tol); if (dd > tol) dd = osa(q, w, tol); if (dd <= tol && dd < bd) { ok = true; bd = dd; } }
      }
      if (!ok) return null; d += bd;
    }
    return { d: d };
  }
  function nameTier(nk, nw, qt, whole) {
    var i; for (i = 0; i < nk.length; i++) if (nk[i] === whole) return 0;
    for (i = 0; i < nk.length; i++) if (nk[i].indexOf(whole) === 0 && (nk[i].length === whole.length || nk[i].charAt(whole.length) === ' ')) return 2;          // nom so'rov (butun so'z) bilan boshlanadi; «choy» → «Choyxona oshi» emas, u so'z boshi darajasida
    var b = -1; for (i = 0; i < nw.length; i++) { var w0 = wordsStart(nw[i], qt, false); if (w0 && (b < 0 || 3 + w0.d < b)) b = 3 + w0.d; } return b;          // 3 — butun so'z, 3.1 — so'z boshi
  }
  function matchFood(f, qt, whole, grp, fz, qtr, wholeR) {          // → null | {tier, d}; fz — imlo xatosi bilan qidirish (faqat aniq natija yo'q bo'lsa)
    foodKeys(f); var i, m, tr = nameTier(f._nkr, f._nwr, qtr, wholeR);
    if (f._full.indexOf(wholeR) > -1) return { tier: 0, d: 0 };          // to'liq nom aynan
    for (i = 0; i < f._ak.length; i++) if (f._ak[i] === whole) return { tier: 1.2, d: 0 };          // sinonim AYNAN («пельмени» → chuchvara, «govyadina» → mol go'shti)
    if (tr === 0) return { tier: 1.3, d: 0 };          // qavssiz nom aynan («Osh (palov)» ← osh)
    if (grp && GROUP[grp].indexOf(f.id) > -1) return { tier: 1.4, d: 0 };
    if (tr > 0) return { tier: tr, d: 0 };
    var collapsed = nameTier(f._nk, f._nw, qt, whole) > -1;          // faqat qo'sh harf yig'ilganda mos (qatiq ~ qattiq) — sinonimlardan keyin
    for (i = 0; i < f._ak.length; i++) if (f._ak[i].indexOf(whole) === 0) return { tier: 4.1, d: 0 };
    for (i = 0; i < f._aw.length; i++) if (wordsStart(f._aw[i], qt, false)) return { tier: 4.2, d: 0 };
    if (qt.length > 1) { if (!f._allw) f._allw = [].concat.apply([], f._nw.concat(f._aw)); if (wordsStart(f._allw, qt, false)) return { tier: 4.3, d: 0 }; }          // ko'p so'zli so'rov: so'zlar nom va sinonimlarda (masalan «sazan baliq»)
    if (collapsed) return { tier: 4.5, d: 0 };
    var wc = whole.replace(/[ -]/g, ''); if (wc.length >= 4 && f._cmp.indexOf(wc) > -1) return { tier: 4.6, d: 0 };          // probel/defissiz aynan
    if (!fz || wc.length < 5) return null;          // qisqa so'rov: xato bilan qidirilmaydi
    if (wc.length >= 8) for (i = 0; i < f._cmp.length; i++) { if (Math.abs(f._cmp[i].length - wc.length) <= 1 && osa(f._cmp[i], wc) <= 1) return { tier: 5, d: 0.5 }; }          // qo'shib yozilgan + 1 harf xato («sutlickofe»)
    var best = null; f._nw.concat(f._aw).forEach(function (ws) { m = wordsStart(ws, qt, true); if (m && (!best || m.d < best.d)) best = m; });
    return best ? { tier: 5, d: best.d } : null;
  }
  function freqMap(st, today, days, alias) {                  // oxirgi N kunda necha marta yeyilgan: { fid: son }
    var out = {}, from = D.addDays(today, -((days || 30) - 1));
    Object.keys(st.days).forEach(function (d) { if (d >= from && d <= today) st.days[d].food.forEach(function (e) { if (e.fid) { var id = (alias && alias[e.fid]) || e.fid; out[id] = (out[id] || 0) + 1; } }); });
    return out;
  }
  /* v52: telefonda o'zbek lotin yozuvi — aniq natija bo'lmasa (aniq moslik tartibi buzilmaydi): w → sh («ow», «qowiq»), yolg'iz c → ch («coy»), ruscha so'zlarning lotin yozuvi */
  var SPELL = { kurasan: 'kruassan', kurassan: 'kruassan', kruasan: 'kruassan', kruason: 'kruassan', molokoli: 'molochnoye', malokoli: 'molochnoye', molochniy: 'molochnoye', molochnoe: 'molochnoye', pecheniya: 'pechenye', pechenya: 'pechenye', pechene: 'pechenye', pechenie: 'pechenye', pechenyi: 'pechenye', sasiska: 'sosiska', sosiskalar: 'sosiska', qaynagan: 'qaynatilgan', qaynagani: 'qaynatilgan', kepakli: 'kepak' };
  function spellVar(q) {
    var t = String(q || '').toLowerCase().split(/\s+/).map(function (w) {
      if (!/^[a-z'’ʻ`0-9-]+$/.test(w)) return w; var k = key(w, true); if (SPELL[k]) return SPELL[k];
      var v = w.replace(/w/g, 'sh').replace(/c(?!h)/g, 'ch'); var kv = key(v, true); return SPELL[kv] || v;
    }).join(' ');
    return t !== String(q || '').toLowerCase() ? t : null;
  }
  function search(foods, q, o) {                       // daraja › sevimli/ko'p yeyilgan › ommaboplik › qisqa nom
    o = o || {}; var qt = key(q).split(' ').filter(Boolean); if (!qt.length) return [];
    if (!o._sv && /^[a-z0-9 '’ʻ`-]+$/i.test(q) && /w|c(?!h)/i.test(q)) { var svf = spellVar(q); if (svf) { var rf = search(foods, svf, Object.assign({}, o, { _sv: 1, _nofz: 1 })); if (rf.length) return rf; } }          /* v52: «ow», «coy» — telefonda sh/ch; inglizcha nom (waffle) variantda topilmasa — o'zi qidiriladi */
    var whole = qt.join(' '), grp = GROUP_Q[whole] || null, qtr = key(q, true).split(' ').filter(Boolean), wholeR = qtr.join(' ');
    var rec = o.recents || [], fav = o.favs || [], freq = o.freq || {}, out = [];
    var pass = function (fz) { foods.forEach(function (f, ix) {
      if (f.h) return;                                  // eski id (alias) — qidiruvda ko'rinmaydi, oila ko'rinadi
      var m = matchFood(f, qt, whole, grp, fz, qtr, wholeR); if (!m || (fz && m.tier < 5)) return; var r = rec.indexOf(f.id);
      out.push({ f: f, tier: m.tier, pref: (fav.indexOf(f.id) > -1 ? 1000 : 0) + (freq[f.id] || 0), pop: popOf(f), d: m.d, r: r > -1 ? r : 99, nl: f._nl, ix: ix });
    }); };
    pass(false); if (!out.length) { var soft = qt.filter(function (w) { return !SOFT[w]; }); if (!o._soft && soft.length && soft.length < qt.length) return search(foods, soft.join(' '), Object.assign({}, o, { _soft: 1 })); var sv = !o._sv && spellVar(q); if (sv) { var r2 = search(foods, sv, Object.assign({}, o, { _sv: 1, _soft: 0 })); if (r2.length) return r2; } if (!o._nofz) pass(true); }          // aniq natija yo'q: avval «вареный/отварной/пастеризованное/без масла»siz, keyin imlo xatosi bilan
    out.sort(function (a, b) { return a.tier - b.tier || a.d - b.d || b.pref - a.pref || b.pop - a.pop || a.r - b.r || a.nl - b.nl || a.ix - b.ix; });
    return out.slice(0, o.limit || 30).map(function (x) { return x.f; });
  }
  var WORDS = { bir: 1, bitta: 1, ikki: 2, ikkita: 2, uch: 3, uchta: 3, tort: 4, tortta: 4, besh: 5, beshta: 5, olti: 6, yetti: 7, sakkiz: 8, tokkiz: 9, on: 10, yarim: 0.5, yarmi: 0.5, yarimta: 0.5, yarimtasi: 0.5, polovinka: 0.5, polovinu: 0.5, odin: 1, one: 1, dva: 2, tri: 3, chetire: 4, pyat: 5, pol: 0.5, polovina: 0.5 };
  var UNITW = { kosa: 'kosa', kosada: 'kosa', miska: 'kosa', miski: 'kosa', kosani: 'kosa', kosadan: 'kosa', likop: 'likop', likopda: 'likop', tarelka: 'likop', lagan: 'likop', lagani: 'likop', laganda: 'likop', lagandan: 'likop', laganlik: 'likop', tarelki: 'likop', tarelku: 'likop', dona: 'dona', ta: 'dona', sht: 'dona', shtuk: 'dona', shtuki: 'dona', bolak: 'bolak', kusok: 'bolak', stakan: 'stakan', stakana: 'stakan', qoshiq: 'qoshiq', lojka: 'qoshiq', piyola: 'piyola', pialo: 'piyola', porsiya: 'porsiya', porsii: 'porsiya', portsiya: 'porsiya', portsiyu: 'porsiya', portsii: 'porsiya', portsiyasi: 'porsiya', porsiy: 'porsiya', portsiy: 'porsiya', hovuch: 'hovuch', gorst: 'hovuch', tilim: 'tilim', lomtik: 'tilim', shisha: 'shisha', butilka: 'shisha', skup: 'skup', skupa: 'skup', skuplar: 'skup', skoop: 'skup', scoop: 'skup', shar: 'shar', shari: 'shar', sharik: 'shar', sharikov: 'shar', banka: 'banka', banki: 'banka', bankasi: 'banka', plitka: 'plitka', plitki: 'plitka', paket: 'paket', paketcha: 'paket', pachka: 'paket', g: 'g100', gr: 'g100', gramm: 'g100', gram: 'g100', gramma: 'g100', grammov: 'g100', ml: 'ml', millilitr: 'ml', mililitr: 'ml', pml: 'ml', qoshiqda: 'qoshiq', qoshiqdan: 'qoshiq', oshqoshiq: 'qoshiq', oshqoshiqda: 'qoshiq', piyolada: 'piyola', stakanda: 'stakan', bolagi: 'bolak' };          // v52: «30pml» (telefonda xato), «1 qoshiqda» («kesim non» — nom: oq non tilimi)
  var MYW = { laganim: 'lagan', laganimda: 'lagan', laganimdagi: 'lagan', laganimdan: 'lagan', kosam: 'kosa', kosamda: 'kosa', kosamdagi: 'kosa', kosamdan: 'kosa', piyolam: 'piyola', piyolamda: 'piyola', piyolamdagi: 'piyola', likopcham: 'likopcha', likopchamda: 'likopcha' };
  var SZW = { kichik: 'kichik', kichkina: 'kichik', mayda: 'kichik', malenkiy: 'kichik', malenkaya: 'kichik', malenkie: 'kichik', orta: 'orta', ortacha: 'orta', srednyaya: 'orta', sredniy: 'orta', katta: 'katta', yirik: 'katta', bolshoy: 'katta', bolshaya: 'katta', bolshie: 'katta' };
  var SLICEW = { kesim: 1, kesma: 1, kesilgan: 1, kesimi: 1 };
  var STOP = { bilan: 1, sho: 0, bugun: 1, tushlikda: 1, nonushtada: 1, kechqurun: 1, yedim: 1, ichdim: 1, men: 1, va: 1, i: 1, ya: 1, segodnya: 1, el: 1, pil: 1, s: 0 , bn: 1, bln: 1 };
  [WORDS, UNITW, STOP, SZW, MYW].forEach(function (m) { Object.keys(m).forEach(function (k) { var kk = key(k); if (kk !== k) { m[kk] = m[k]; delete m[k]; } }); });
  [WORDS, UNITW].forEach(function (m) { Object.keys(m).forEach(function (k) { var a = k.replace(/sh/g, 'v'), b = k.replace(/ch/g, 'c'); if (a !== k && m[a] == null) m[a] = m[k]; if (b !== k && m[b] == null) m[b] = m[k]; }); });          // v52: «qowiq» (w = sh → key: v), «piyola» … «c» = «ch»          // kalitlar key() shaklida (ikki → iki)
  /* qidiruvda YUMSHOQ so'zlar: aniq natija bo'lmasa tashlab qayta qidiriladi (sifat, pishirish usuli) — key() shaklida */
  var SOFT = {}; 'vareniy varyoniy varenniy varenaya varyonaya varenoe varyonoe varenie varyonie otvarnoy otvarnaya otvarnoe otvarnie otvarnoy pasterizovannoe pasterizovanniy pasterizovannaya pasterizovannie svejiy svejaya svejee domashniy domashnyaya domashnee bez masla maslom qaynatilgan qaynatma pishgan uy uyda s so'.split(' ').forEach(function (w) { SOFT[key(w)] = 1; });
  function qtyNum(t) { var m = /^(\d+(?:[.,]\d+)?)$/.exec(t); if (m) return parseFloat(m[1].replace(',', '.')); m = /^(\d+)\/(\d+)$/.exec(t); return m && +m[2] ? +m[1] / +m[2] : null; }
  function qtyToks(fr) { return String(fr || '').replace(/(\d)([^\d\s.,\/%])/g, '$1 $2').replace(/([a-zA-Zа-яА-ЯёЁ'ʻ’])(\d)/g, '$1 $2').split(/\s+/).filter(Boolean); }
  /* «рис вареный 100 г», «yarimta non», «2 шт котлета», «50 gram qaymoq» → { name, qty, unit ('g100' | 'ml' | birlik | null) }. Oxiridagi YOLG'IZ son miqdor emas («sut 1,5» — yog'lilik) */
  function isWordQ(w) { return WORDS[key(w || '')] != null && !/^\d/.test(w); }
  function splitQty(fr) {
    var t = qtyToks(fr), qty = null, unit = null, U = function (w) { return UNITW[key(w || '')] || null; };
    if (t.length > 1 && (qtyNum(t[0]) != null || isWordQ(t[0]))) { qty = qtyNum(t[0]) != null ? qtyNum(t[0]) : WORDS[key(t[0])]; t.shift(); if (t.length > 1 && U(t[0])) unit = U(t.shift()); }          // boshida
    if (qty == null && t.length > 2 && U(t[t.length - 1]) && qtyNum(t[t.length - 2]) != null) { unit = U(t[t.length - 1]); qty = qtyNum(t[t.length - 2]); t.length -= 2; }          // oxirida
    return { name: t.join(' '), qty: qty, unit: unit };
  }
  /* bir nechta taom: «, ; + va и» bo'yicha, so'ng o'rtadagi miqdor guruhi bo'yicha. Guruh chapdagi taomga tegishli, agar chapning o'z miqdori bo'lmasa («sut 200gr | qora»); bo'lsa — o'ngdagisiga («yarimta non | 50 gram qaymoq») */
  function splitParts(text) {
    var out = [];
    splitText(text).forEach(function (part) {
      var t = qtyToks(part), cur = { w: [], qn: 0 }, i = 0, U = function (j) { return j < t.length && !!UNITW[key(t[j])]; };
      while (i < t.length) {
        var g = (qtyNum(t[i]) != null || isWordQ(t[i])) ? (U(i + 1) ? 2 : (isWordQ(t[i]) || !cur.w.length ? 1 : 0)) : 0;          // v52: qism boshidagi yolg'iz son ham miqdor («4 non 2 piyola choy»)
        if (g && cur.w.slice(cur.qn).some(function (w) { return !STOP[key(w)]; }) && i + g < t.length) {          // chapda faqat «bugun», «men» — alohida qism emas
          if (cur.qn) { out.push(cur.w.join(' ')); cur = { w: [], qn: 0 }; }
          else { out.push(cur.w.concat(t.slice(i, i + g)).join(' ')); cur = { w: [], qn: 0 }; i += g; continue; }
        }
        if (g && !cur.w.length) cur.qn = g;
        cur.w = cur.w.concat(t.slice(i, i + (g || 1))); i += g || 1;
      }
      if (cur.w.length) out.push(cur.w.join(' '));
    });
    return out.map(teaFix);
  }
  function teaFix(fr) {                                // «qora», «ko'k quruq» (choy kontekstida) → «qora choy», «ko'k choy shakarsiz»
    var t = fr.split(/\s+/), kk = t.map(function (w) { return key(w); }), tea = { qora: 1, kok: 1, yashil: 1, chernyy: 0 };
    var core = kk.filter(function (w) { return !(qtyNum(w) != null || UNITW[w] || WORDS[w] != null); });
    if (core.length && core.every(function (w) { return tea[w] || w === 'quruq'; }) && core.some(function (w) { return tea[w]; })) { t = t.map(function (w) { return key(w) === 'quruq' ? 'shakarsiz' : w; }); t.splice(t.length - (key(t[t.length - 1]) === 'shakarsiz' ? 1 : 0), 0, 'choy'); return t.join(' '); }
    if (kk.indexOf('choy') > -1 || kk.indexOf('chay') > -1) return t.map(function (w) { return key(w) === 'quruq' ? 'shakarsiz' : w; }).join(' ');
    return fr;
  }
  function splitText(text) { return String(text || '').replace(/(\d),(\d)/g, '$1\u0001$2').split(/[,;\n+]|\sva\s|\sи\s/i).map(function (x) { return x.replace(/\u0001/g, ',').trim(); }).filter(Boolean); }          // «sut 1,5» — o'nlik vergul bo'luvchi emas
  function parseFragment(fr) {                        // "2 katta somsa" → {qty:2, unit:null, name:'somsa', sz:'katta', raw:'katta somsa'}
    var tq = splitQty(fr), tail = null; if (tq.qty != null && tq.unit && qtyToks(fr).length && !(qtyNum(qtyToks(fr)[0]) != null || isWordQ(qtyToks(fr)[0]))) { tail = tq; fr = tq.name; }          // oxiridagi «100 г» / «200 мл»
    var toks = fr.replace(/(\d)([a-zA-Zа-яА-Я])/g, '$1 $2').split(/\s+/), qty = null, unit = null, name = [], sz = null, raw = [], my = null;
    toks.forEach(function (t, i) {
      var k = key(t), m = /^(\d+(?:[.,]\d+)?)$/.exec(t), more = i < toks.length - 1;
      if (m && qty == null) { qty = parseFloat(m[1].replace(',', '.')); return; }
      if (WORDS[k] != null && qty == null && more && !name.length) { qty = WORDS[k]; return; }       // "to'rt" va "tort" (торт) farqi: so'zdan keyin nom bo'lsagina son
      if (MYW[k] && unit == null && more) { my = MYW[k]; unit = VUNIT[my] || 'likop'; if (qty == null) qty = 1; return; }       // «laganimda osh», «kosamda mastava»
      if (UNITW[k] && unit == null && (qty != null || !name.length) && more) { unit = UNITW[k]; if (qty == null) qty = 1; return; }
      if (STOP[k]) return; raw.push(t); if (SZW[k] && sz == null && more) { sz = SZW[k]; return; } if (SLICEW[k] && unit == null && more) { unit = 'tilim'; if (qty == null) qty = 1; } name.push(t);          // v52: «4 kesim non» — 4 tilim, nom «kesim non» (oq non)
    });
    if (qty == null && unit == null && name.length >= 3) {                      // "to'y oshidan bir lagan": oxirida «son + birlik»
      var u1 = UNITW[key(name[name.length - 1])], q1 = key(name[name.length - 2]), qv = /^\d+(?:[.,]\d+)?$/.test(q1) ? parseFloat(q1.replace(',', '.')) : WORDS[q1];
      if (u1 && qv != null) { unit = u1; qty = qv; name.length -= 2; raw.length = Math.max(0, raw.length - 2); }
    }
    if (tail) { qty = tail.qty; unit = tail.unit; }
    if (unit === 'ml') unit = 'g100';          // ichimlikda 100 ml ≈ 100 g
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
  /* v55: matn/ovozdan mashg'ulot: «30 daqiqa futbol o'ynadim», «bir soat zal», «пробежка 20 минут». Kkal — formula (S.exNet), AI emas */
  var EXW = {}; [['yugurish', 'yugurish yugurdim yuguraman yugurib jogging jog run running бег бегал бегала побегал пробежка пробежал'], ['zal', 'zal zalda trenajor trenajyor kuch shtanga качалка зал зале залe тренажер тренажёр тренажерный силовая штанга'],
    ['velosiped', 'velosiped velosipedda velo велосипед велосипеде вело'], ['futbol', 'futbol futbolga futbolda футбол футбола мини-футбол'], ['suzish', 'suzish suzdim suzdik basseyn basseynda плавание плавал плавала бассейн бассейне'],
    ['uyda', 'zaryadka fitnes fitness mashq mashqlar зарядка фитнес отжимания приседания'], ['raqs', 'raqs raqsga raqsga tushdim zumba танцы танцевал танцевала зумба'], ['yoga', 'yoga chozilish йога растяжка'],
    ['kurash', 'kurash boks karate dzyudo judo kikboksing бокс борьба карате дзюдо кикбоксинг'], ['voleybol', 'voleybol basketbol волейбол баскетбол'], ['ogir', 'bogda qurilish ogir ish огород стройка ремонт'], ['boshqa', 'sport trenirovka тренировка спорт']].forEach(function (r) { r[1].split(' ').forEach(function (w) { EXW[key(w)] = r[0]; }); });
  function parseEx(fr) {
    var k = key(fr), ws = k.split(' '), t = null, i;
    for (i = 0; i < ws.length; i++) { var c = EXW[ws[i]] || (i < ws.length - 1 ? EXW[ws[i] + ' ' + ws[i + 1]] : null); if (c && (!t || t === 'boshqa')) t = c; }          // aniq tur «sport/тренировка» dan ustun
    if (!t) return null;
    var m = /(\d+(?:[.,]\d+)?)\s*(daqiqa|daq|min|minut|minuta|minutlik|мин|минут|минуты|минута)/i.exec(fr), h = /(\d+(?:[.,]\d+)?)\s*(soat|час|часа|часов)/i.exec(fr), min = null;
    if (m) min = parseFloat(m[1].replace(',', '.')); else if (h) min = parseFloat(h[1].replace(',', '.')) * 60; else if (/yarim soat|полчаса/i.test(fr)) min = 30; else if (/bir soat|(^|\s)час(\s|$)/i.test(fr)) min = 60;
    var lv = /yengil|sekin|легк|медлен/i.test(fr) ? 0 : (/qattiq|tez|og'?ir|kuchli|интенсив|тяжел|быстр/i.test(fr) ? 2 : 1);
    return { t: t, min: min ? Math.max(1, Math.min(600, Math.round(min))) : 30, lv: lv, guess: !min };
  }
  function parseText(text, foods, o) {                // lokal tahlil: topilganlar va topilmaganlar (oila: omillar sinonimdan, o'lcham so'zdan)
    var items = [], miss = [], exs = [];
    var frs = []; splitParts(text).forEach(function (fr) {
      var ex = parseEx(fr); if (ex && !(parseFragment(fr).name && bestHit(foods, parseFragment(fr).name, o) && !/\d\s*(daqiqa|daq|min|minut|мин|минут|soat|час)/i.test(fr))) { ex.text = fr; exs.push(ex); return; }          // v55: mashg'ulot (ovqat emas)          // «non bilan choy», «чай с сахаром»: butun nom topilmasa — «bilan / с» bo'yicha bo'linadi
      var m = /^(.+?)\s+(?:bilan|с|со)\s+(.+)$/i.exec(fr), p0 = parseFragment(fr);
      if (m && !(p0.name && bestHit(foods, p0.name, o))) { var a1 = parseFragment(m[1]), b1 = parseFragment(m[2]); if (a1.name && b1.name && bestHit(foods, a1.name, o) && bestHit(foods, b1.name, o)) { frs.push(m[1], m[2]); return; } }
      frs.push(fr);
    });
    frs.forEach(function (fr) {
      var p = parseFragment(fr); if (!p.name) { miss.push(fr); return; }
      var hit = bestHit(foods, p.name, o), szid = p.sz;
      if (hit && p.sz && !(hit.fam && hit.fam.sz)) { var h2 = bestHit(foods, p.raw, o); if (h2) { hit = h2; szid = null; } }      // "katta burger" — o'lcham omili yo'q, sinonim bo'lishi mumkin
      if (!hit) { var fr2 = fr.replace(/\s+\d+(?:[.,]\d+)?(?:\s+\S+)?$/, ''); if (fr2 !== fr && /\d/.test(fr2)) { var p2 = parseFragment(fr2), h2b = p2.name && bestHit(foods, p2.name, o); if (h2b) { p = p2; hit = h2b; fr = fr2; } } }          // v52: oxiridagi to'liq yozilmagan «… 2 piyola» (keyingi taom hali yozilmagan)
      if (!hit) { miss.push(fr); return; }
      var fam = null, food = hit, sel = null, qn = p.name;
      if (hit.fam) { fam = hit; sel = famDefault(hit); var pk = famPick(hit, p.sz && !hit.fam.sz ? p.raw : p.name) || famPick(hit, p.raw); if (pk) Object.keys(pk).forEach(function (a) { sel[a] = pk[a]; }); if (!hit.fam.sz) szid = null; food = famVariant(hit, sel, szid); }
      if (fam && p.unit && p.unit !== 'g100' && unitGrams(food, p.unit) == null && fam.fam.uv) {          // v52: so'ralgan birlik shu variantda yo'q («2 tilim non» → obi non emas, tilimli variant)
        var vk2 = Object.keys(fam.fam.uv).filter(function (k) { return fam.fam.uv[k] && fam.fam.uv[k][p.unit] != null; })[0];
        if (vk2) { sel = famSelOf(fam, vk2); food = famVariant(fam, sel, szid); }
      }
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
    return { items: items, missing: miss, ex: exs };
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
    bmrRaw: bmrRaw, bmi: bmi, refWeight: refWeight, protein: protein, PROT_K: PROT_K, TARTIB: TARTIB, TARTIB_DEF: TARTIB_DEF, tartibOf: tartibOf, mealSplit: mealSplit, mealBudgets: mealBudgets, MEAL_END: MEAL_END, validate: validate, restrictions: restrictions, macros: macros, water: water, plan: plan,
    strideM: strideM, distanceKm: distanceKm, stepKcal: stepKcal, stepCredit: stepCredit, stepBase: stepBase, extraSteps: extraSteps, compareKm: compareKm, dayBalance: dayBalance,
    portion: portion, sumEntries: sumEntries, mealByHour: mealByHour, emptyState: emptyState, dayOf: dayOf, ensureDay: ensureDay, dayTotals: dayTotals,
    addFood: addFood, removeFood: removeFood, restoreFood: restoreFood, setWater: setWater, setSteps: setSteps, setAutoSteps: setAutoSteps, setManualSteps: setManualSteps, manualSteps: manualSteps, toggleFav: toggleFav, addCustom: addCustom,
    addWeight: addWeight, removeWeight: removeWeight, avg7: avg7, weightInfo: weightInfo, weightSeries: weightSeries, currentWeight: currentWeight, goalProgress: goalProgress,
    stepsSeries: stepsSeries, stepsStats: stepsStats, stepsTotal: stepsTotal, monthSteps: monthSteps, weekdayIdx: weekdayIdx, weekSummary: weekSummary,
    dayLimit: dayLimit, dayPlan: dayPlan, STEPS_SANE: STEPS_SANE, dayBal: dayBal, dayFrac: dayFrac, parseEx: parseEx, EX: EX, EX_ORDER: EX_ORDER, exNet: exNet, walkNet: walkNet, addEx: addEx, updEx: updEx, removeEx: removeEx, restoreEx: restoreEx, planSt: planSt, jobOn: jobOn, creditOf: creditOf, LIM: LIM, dayStatus: dayStatus, isComplete: isComplete, finishDay: finishDay, trackStart: trackStart, streak: streak, monthGrid: monthGrid, minutesToBurn: minutesToBurn, recipe: recipe, saveRecipe: saveRecipe, removeCustom: removeCustom,
    migrate: migrate, ptSplit: ptSplit, exportState: exportState, importState: importState, key: key, normFoods: normFoods, buildIndex: buildIndex, freqMap: freqMap, osa: osa, search: search, parseText: parseText, splitQty: splitQty, splitParts: splitParts, parseFragment: parseFragment, splitText: splitText, unitGrams: unitGrams, VESSEL_MAX: VESSEL_MAX, VKINDS: VKINDS, FILL: FILL, SCALE: SCALE, VUNIT: VUNIT, vesselById: vesselById, vesselsFor: vesselsFor, addVessel: addVessel, linkVessel: linkVessel, removeVessel: removeVessel, vessGrams: vessGrams, cleanVessels: cleanVessels, aliasMap: aliasMap, famDef: famDef, famKey: famKey, famSelOf: famSelOf, famDefault: famDefault, famVariant: famVariant, famLabel: famLabel, famPick: famPick, TPL_MAX: TPL_MAX, cleanTpls: cleanTpls, addTemplate: addTemplate, tplById: tplById, renameTemplate: renameTemplate, removeTemplate: removeTemplate, moveTemplate: moveTemplate, tplKcal: tplKcal, yesterdayEntries: yesterdayEntries, kechagidekOk: kechagidekOk, suggestTemplate: suggestTemplate,
    dates: D, num: num };
});
