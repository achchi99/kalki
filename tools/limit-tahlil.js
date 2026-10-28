#!/usr/bin/env node
/* KalkiFit kunlik me'yori — tahlil jadvali (docs/limit.md, v62). Ishga tushirish: node tools/limit-tahlil.js [--md]
   Sintetik profillar (vazn 60–110, qadam 3k/8k/15k/20k, ish turi) uchun:
   • ESKI (v51–v61) va YANGI (v62, S.dayPlan) limit — «saqlash» maqsadi, mashg'ulotsiz;
   • IOM 2005 EER (DLW asosidagi tenglamalar; BMI ≥ 25 — ortiqcha vazn tenglamalari), PA toifasi qadamdan (ADL ≈ 2 500 qadam, 1 mil ≈ 2 000 qadam;
     sedentary < 1,5 mil, low active 1,5–3, active 3–10, very active ≥ 10 — DGA 2005 / IOM ta'riflari, taxminiy);
   • soat (wearable) modeli: (BMR + barcha qadamning sof yurish kkal'i) / 0,9 — «resting + active + TEF 10%». */
'use strict';
const S = require('../assets/kalkifit-core.js');
const OLD = { JOB: { sit: { k: 1.40, base: 5000 }, stand: { k: 1.60, base: 7500 }, heavy: { k: 1.85, base: 10000 } }, CRED_K: 0.7, TAPER: null };

function bmr(sex, w, h, a) { return 10 * w + 6.25 * h - 5 * a + (sex === 'f' ? -161 : 5); }
function walk(steps, h, w) { return Math.max(0, steps) * h * 0.415 / 100 / 1000 * w * 0.5; }
function oldLimit(p, steps) {
  const j = OLD.JOB[p.job], base = Math.round(bmr(p.sex, p.w, p.h, p.a) * j.k), extra = Math.max(0, steps - j.base);
  return base + Math.min(500, Math.round(walk(extra, p.h, p.w) * OLD.CRED_K));
}
function newLimit(p, steps) {
  const st = { setup: true, profile: { sex: p.sex, weight: p.w, height: p.h, age: p.a, goal: 'keep', job: p.job, act: 2 }, prefs: { qa: 'on' }, days: {}, weights: [] };
  return S.dayPlan(st, null, steps).limit;
}
function iom(p, steps) {
  const miles = Math.max(0, steps - 2500) / 2000, cat = miles < 1.5 ? 0 : miles < 3 ? 1 : miles < 10 ? 2 : 3, H = p.h / 100, bmi = p.w / (H * H), A = p.a, W = p.w;
  if (p.sex === 'm') return bmi < 25 ? 662 - 9.53 * A + [1, 1.11, 1.25, 1.48][cat] * (15.91 * W + 539.6 * H) : 1086 - 10.1 * A + [1, 1.12, 1.29, 1.59][cat] * (13.7 * W + 416 * H);
  return bmi < 25 ? 354 - 6.91 * A + [1, 1.12, 1.27, 1.45][cat] * (9.36 * W + 726 * H) : 448 - 7.95 * A + [1, 1.16, 1.27, 1.44][cat] * (11.4 * W + 619 * H);
}
function watch(p, steps) { return (bmr(p.sex, p.w, p.h, p.a) + walk(steps, p.h, p.w)) / 0.9; }
const FAO = { stand: 1.70, heavy: 2.00 };          // FAO/WHO/UNU 2004: «active/moderately active» va «vigorous» toifalarining PASTKI chegarasi (ish turi bor qatorlar uchun)

const R = Math.round, rows = [], STEPS = [3000, 8000, 15000, 20000];
const PROF = [];
[60, 70, 80, 90, 100, 110].forEach(w => PROF.push({ sex: 'm', w, h: 176, a: 35, job: 'sit' }));
[60, 70, 80, 90, 100, 110].forEach(w => PROF.push({ sex: 'f', w, h: 163, a: 35, job: 'sit' }));
[70, 90].forEach(w => { PROF.push({ sex: 'm', w, h: 176, a: 35, job: 'stand' }); PROF.push({ sex: 'm', w, h: 176, a: 35, job: 'heavy' }); });
PROF.forEach(p => STEPS.forEach(s => {
  const o = oldLimit(p, s), n = newLimit(p, s), i = p.job === 'sit' ? R(iom(p, s)) : R(bmr(p.sex, p.w, p.h, p.a) * FAO[p.job]), wv = p.job === 'sit' ? R(watch(p, s)) : i, lo = Math.min(i, wv);
  rows.push({ p, s, o, n, i, wv, overO: o - lo, overN: n - lo });
}));
const fmt = x => (x > 0 ? '+' : '') + x, nb = x => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
console.log('| Profil | Qadam | Eski | Yangi | IOM EER (ish: FAO) | Soat modeli | Eski − min(ref) | Yangi − min(ref) |');
console.log('|---|---:|---:|---:|---:|---:|---:|---:|');
rows.forEach(r => console.log(`| ${r.p.sex === 'm' ? 'E' : 'A'} ${r.p.w} kg, ${r.p.job} | ${nb(r.s)} | ${nb(r.o)} | ${nb(r.n)} | ${nb(r.i)} | ${nb(r.wv)} | ${fmt(r.overO)} | ${fmt(r.overN)} |`));
const over = k => rows.filter(r => r[k] > 0).length;
console.log(`\nmin(IOM, soat) dan yuqori: eski ${over('overO')}/${rows.length}, yangi ${over('overN')}/${rows.length}; o'rtacha farq eski ${R(rows.reduce((a, r) => a + r.overO, 0) / rows.length)}, yangi ${R(rows.reduce((a, r) => a + r.overN, 0) / rows.length)} kkal`);
const u = { sex: 'm', w: 100, h: 183, a: 35, job: 'sit' };
console.log(`Foydalanuvchi holati (taxminiy profil E 100 kg 183 sm 35 y, 15 780 qadam): eski ${oldLimit(u, 15780)}, yangi ${newLimit(u, 15780)}, IOM ${R(iom(u, 15780))}, soat modeli ${R(watch(u, 15780))}`);
