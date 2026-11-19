/* kalki.uz — KUNLIK ME'YOR, TVI, IDEAL VAZN va SUV — BITTA umumiy modul (DOM'siz, sof funksiyalar).
 * Ishlatadi: KalkiFit (assets/kalkifit-core.js — plan() shu yerdan), sayt kalkulyatorlari (kaloriya, TVI, ideal vazn, suv me'yori).
 * Shuning uchun kalkulyatordan kelgan odam KalkiFit'da AYNAN o'sha raqamni ko'radi. Brauzerda window.KalkiMeyor, Node'da require().
 * Qoidalar (docs/kalkifit.md): Mifflin–St Jeor BMR × faollik; maqsad deltasi (tez ozish −550, sekin ozish −275, saqlash 0, vazn olish +275 kkal/kun);
 * pastki chegara (erkak 1 500, ayol 1 200 — faqat kamaytirishda); 18 yoshgacha, homiladorlik, TVI < 18,5 — faqat saqlash (shifokor izohi).
 * Hamma natija taxminiy — tibbiy maslahat emas. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.KalkiMeyor = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var ACT = { 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725, 5: 1.9 };                 // faollik koeffitsientlari
  var GOAL_DELTA = { keep: 0, slow: -275, lose: -550, gain: 275 };           // kkal/kun: −0,25 / −0,5 / +0,25 kg/hafta
  var GOALS = ['lose', 'slow', 'keep', 'gain'];
  var FLOOR = { m: 1500, f: 1200 };                                          // kunlik maqsadning pastki chegarasi
  var KCAL_PER_KG = 7700, WATER_ML_PER_KG = 33, GLASS_ML = 250;
  function num(x) { var n = typeof x === 'string' ? parseFloat(x.replace(',', '.').replace(/[\s ]/g, '')) : Number(x); return isFinite(n) ? n : 0; }
  function round1(x) { return Math.round(x * 10) / 10; }
  function bmrRaw(sex, weight, height, age) { return 10 * weight + 6.25 * height - 5 * age + (sex === 'f' ? -161 : 5); }       // Mifflin–St Jeor
  function bmi(weight, height) { return height > 0 ? weight / Math.pow(height / 100, 2) : 0; }
  function restrictions(p) {                        // dieta hisoblanmaydigan holatlar: faqat saqlash rejimi + shifokor izohi
    var age = num(p.age), r = { under18: age < 18, preg: !!(p.preg && p.sex === 'f'), lowBmi: bmi(num(p.weight), num(p.height)) < 18.5 };
    r.keepOnly = r.under18 || r.preg || r.lowBmi; return r;
  }
  /* kunlik me'yor: p = { sex, age, height, weight, act (1–5), goal, preg }, o = { kk (faollik koef. o'rniga, masalan ish turi), corr (kkal tuzatish) } */
  function meyor(p, o) {
    o = o || {}; var w = num(p.weight), h = num(p.height), a = num(p.age), sex = p.sex === 'f' ? 'f' : 'm';
    var r = restrictions(p), goal = r.keepOnly ? 'keep' : (GOAL_DELTA[p.goal] != null ? p.goal : 'keep');
    var kk = o.kk || ACT[p.act] || ACT[1], corr = Math.round(num(o.corr)), bmr = bmrRaw(sex, w, h, a), base0 = Math.round(bmr * kk), tdee = base0 + corr;
    var delta = GOAL_DELTA[goal], raw = tdee + delta, floorMin = FLOOR[sex], target = raw, floorApplied = false;
    if (delta < 0 && raw < floorMin) { target = floorMin; floorApplied = true; }
    return { sex: sex, bmrRaw: bmr, bmr: Math.round(bmr), actK: kk, base0: base0, corr: corr, tdee: tdee, goal: goal, goalAsked: p.goal, goalOverridden: goal !== p.goal,
      delta: delta, rawTarget: raw, target: target, floorApplied: floorApplied, floorMin: floorMin, kgPerWeek: Math.round((target - tdee) * 7 / KCAL_PER_KG * 100) / 100, bmi: round1(bmi(w, h)), restrictions: r };
  }
  /* suv: 33 ml × kg → butun stakan (250 ml) — maqsad hamma ekranda shu */
  function waterGoalMl(glasses) { return Math.max(1, Math.round(+glasses || 0)) * GLASS_ML; }
  function water(weight) { var ml = Math.round(WATER_ML_PER_KG * num(weight)), gl = Math.max(1, Math.round(ml / GLASS_ML)); return { ml: ml, glasses: gl, glassMl: GLASS_ML, goal: waterGoalMl(gl) }; }
  /* TVI (BMI) toifasi — JSST (kattalar, 18+) */
  var BMI_TOIFA = [[16, 'ogir-kam'], [18.5, 'kam'], [25, 'normal'], [30, 'ortiqcha'], [35, 'semizlik1'], [40, 'semizlik2'], [Infinity, 'semizlik3']];
  function bmiToifa(b) { for (var i = 0; i < BMI_TOIFA.length; i++) if (b < BMI_TOIFA[i][0]) return BMI_TOIFA[i][1]; return 'semizlik3'; }
  function normalVazn(height) { var m = height / 100; return { min: round1(18.5 * m * m), max: round1(24.9 * m * m) }; }          // TVI 18,5–24,9 oralig'i
  /* ideal vazn — bir nechta formula (bo'y dyuymda 5 fut = 152,4 sm dan ortig'i); BITTA raqam emas, ORALIQ */
  function idealVazn(sex, height) {
    var inch = Math.max(0, (num(height) - 152.4) / 2.54), f = sex === 'f';
    var r = { devine: f ? 45.5 + 2.3 * inch : 50 + 2.3 * inch, robinson: f ? 49 + 1.7 * inch : 52 + 1.9 * inch, miller: f ? 53.1 + 1.36 * inch : 56.2 + 1.41 * inch, hamwi: f ? 45.5 + 2.2 * inch : 48 + 2.7 * inch };
    Object.keys(r).forEach(function (k) { r[k] = round1(r[k]); });
    var nv = normalVazn(num(height)), fs = [r.devine, r.robinson, r.miller, r.hamwi];
    return { formulalar: r, tvi: nv, min: round1(Math.min.apply(null, fs)), max: round1(Math.max.apply(null, fs)) };
  }
  return { ACT: ACT, GOAL_DELTA: GOAL_DELTA, GOALS: GOALS, FLOOR: FLOOR, KCAL_PER_KG: KCAL_PER_KG, WATER_ML_PER_KG: WATER_ML_PER_KG, GLASS_ML: GLASS_ML,
    num: num, bmrRaw: bmrRaw, bmi: bmi, restrictions: restrictions, meyor: meyor, water: water, waterGoalMl: waterGoalMl, bmiToifa: bmiToifa, normalVazn: normalVazn, idealVazn: idealVazn };
});
