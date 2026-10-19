/* kalki.uz — «O'rniga» (oqsilga boy o'rinbosar) hisobi: toza funksiyalar, DOM yo'q (UMD).
 * Ma'lumot: data/ovqatlar.json (foods), data/oqsil-manba.json (teglar), data/orinbosar.json (nomzodlar).
 * Qoida: o'rinbosar FAQAT oqsili asl x 0.90 dan kam bo'lmasa, yog'i yoki kkali asl x 0.85 dan oshmasa va farq sezilarli (|kkal| >= 40 yoki |yog'| >= 5 g) bo'lsa ko'rsatiladi — bir xil porsiya uchun (1 likop → 1 likop; dona/bo'lak bo'lsa — bir xil gramm).
 * Taom kaliti: «id» (oila bo'lsa — standart kombinatsiya) yoki «id#kombinatsiya» (masalan «somsa#oddiy.tovuq»). */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.KalkiOrinbosar = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var MAX = 3;
  function index(foods) { var m = {}; for (var i = 0; i < foods.length; i++) m[foods[i].i] = foods[i]; return m; }
  function defVariant(f) { return f && f.fam ? f.fam.ax.map(function (a) { return a.d; }).join('.') : null; }
  function famRoot(by, f) { return f && f.al && by[f.al.f] ? by[f.al.f] : f; }                  // yashirin alias (eski id) → oila
  function split(key) { var i = String(key).indexOf('#'); return i < 0 ? { id: key, v: null } : { id: key.slice(0, i), v: key.slice(i + 1) }; }
  /* kalit → { k, p, f, c, id, v } (100 g uchun) yoki null */
  function valuesOf(by, key) {
    var s = split(key), f = by[s.id]; if (!f) return null;
    if (f.al && by[f.al.f]) { f = by[f.al.f]; s.v = s.v || f.al && null; if (!s.v) s.v = by[split(key).id].al.v; }
    if (f.fam) { var v = s.v || defVariant(f), g = f.fam.g[v]; if (!g) return null; return { id: f.i, v: v, k: g.k, p: g.p, f: g.f, c: g.c }; }
    return { id: f.i, v: null, k: f.k, p: f.p, f: f.f, c: f.c };
  }
  /* o'rinbosar nomzodi → kalit (asl taom kombinatsiyasi src ga qarab). alt: { i } | { i, v } | { i, set: { o'q: qiymat } } */
  function altKey(by, srcKey, alt) {
    if (alt.v) return alt.i + '#' + alt.v;
    if (alt.set) {
      var sv = valuesOf(by, srcKey), f = by[alt.i]; if (!sv || !f || !f.fam || sv.id !== alt.i) return null;
      var cur = sv.v.split('.'), out = f.fam.ax.map(function (a, n) { return alt.set[a.i] != null ? alt.set[a.i] : cur[n]; }).join('.');
      return alt.i + '#' + out;
    }
    return alt.i;
  }
  function r1(x) { return Math.round(x * 10) / 10; }
  /* porsiya: { u: birlik nomi|null, g: gramm }. Asl taomning standart porsiyasi — birinchi (g100 dan boshqa) birlik. */
  function unitsOf(by, key) { var s = split(key), f = by[s.id]; if (f && f.al && by[f.al.f]) f = by[f.al.f]; return f && f.u ? f.u.filter(function (x) { return x[0] !== 'g100'; }) : []; }
  function defPortion(by, key) { var u = unitsOf(by, key)[0]; return u ? { u: u[0], g: u[1] } : { u: null, g: 100 }; }
  /* «bir xil porsiya»: idish birligi (likop, kosa, piyola, porsiya) o'rinbosarda ham bo'lsa — o'sha birlik (1 likop → 1 likop); aks holda (dona, bo'lak... — o'lchami taomga qarab farq qiladi) — bir xil gramm */
  var IDISH = { likop: 1, kosa: 1, piyola: 1, porsiya: 1 };
  function altPortion(by, altKey, srcPortion) {
    var us = unitsOf(by, altKey), i;
    if (srcPortion.u && IDISH[srcPortion.u]) for (i = 0; i < us.length; i++) if (us[i][0] === srcPortion.u) return { u: us[i][0], g: us[i][1] };
    return { u: null, g: srcPortion.g };
  }
  function portionVals(v, g) { var m = g / 100; return { k: v.k * m, p: v.p * m, f: v.f * m }; }
  /* qoida (porsiya uchun): oqsil >= asl VA (yog' < asl YOKI kkal < asl) */
  /* qoida (porsiya uchun, 2-tahrir): oqsil >= asl x 0.90 VA (yog' <= asl x 0.85 YOKI kkal <= asl x 0.85) VA farq sezilarli (|kkal| >= 40 YOKI |yog'| >= 5 g) */
  var EPS = 1e-6, K_OQSIL = 0.90, K_KAM = 0.85, MIN_KKAL = 40, MIN_YOG = 5;                  // EPS — float xatosi (teng qiymatlar) uchun
  function passes(src, alt) {
    if (!(alt.p >= src.p * K_OQSIL - EPS)) return false;
    if (!(alt.f <= src.f * K_KAM + EPS || alt.k <= src.k * K_KAM + EPS)) return false;
    return Math.abs(alt.k - src.k) >= MIN_KKAL - EPS || Math.abs(alt.f - src.f) >= MIN_YOG - EPS;
  }
  /* asl va o'rinbosar porsiyalari bo'yicha taqqoslash: { ok, dk, dp, df, g, u } */
  function compare(by, srcKey, altKeyStr, srcPortion) {
    var sv = valuesOf(by, srcKey), av = valuesOf(by, altKeyStr); if (!sv || !av) return null;
    var sp = srcPortion || defPortion(by, srcKey), ap = altPortion(by, altKeyStr, sp), S = portionVals(sv, sp.g), A = portionVals(av, ap.g);
    return { ok: passes(S, A), dk: Math.round(A.k - S.k), dp: r1(A.p - S.p), df: r1(A.f - S.f), g: ap.g, u: ap.u, sg: sp.g, su: sp.u };
  }
  /* oqsil «sifati»: 100 kkal ga necha gramm oqsil */
  function sifat(v) { return v && v.k > 0 ? r1(v.p / v.k * 100) : 0; }
  /* jadval: { manba: { <oila yoki taom id>: [alt, ...] } }  →  tartiblangan, qoidaga javob beradigan o'rinbosarlar (eng ko'pi MAX) */
  function alternatives(foods, table, srcKey, srcPortion) {
    var by = Array.isArray(foods) ? index(foods) : foods, sv = valuesOf(by, srcKey); if (!sv) return [];
    var cand = (table.manba || table)[sv.id]; if (!cand) return [];
    var out = [];
    for (var i = 0; i < cand.length && out.length < MAX; i++) {
      var key = altKey(by, srcKey, cand[i]); if (!key || key === srcKey) continue;
      var c = compare(by, srcKey, key, srcPortion); if (!c || !c.ok) continue;
      var av = valuesOf(by, key); out.push({ key: key, id: av.id, v: av.v, dk: c.dk, dp: c.dp, df: c.df, g: c.g, u: c.u, sifat: sifat(av) });
    }
    return out;
  }
  /* karta matni uchun: oqsil farqi |dp| < 2 g bo'lsa «deyarli bir xil» (halol matn) */
  function deyarli(dp) { return Math.abs(dp) < 2; }
  function tegOf(teglar, key) { var t = teglar.taom || teglar, s = split(key); return t[key] || t[s.id] || 'yoq'; }
  return { MAX: MAX, QOIDA: { oqsil: K_OQSIL, kam: K_KAM, minKkal: MIN_KKAL, minYog: MIN_YOG }, deyarli: deyarli, index: index, defVariant: defVariant, famRoot: famRoot, split: split, valuesOf: valuesOf, altKey: altKey, defPortion: defPortion, altPortion: altPortion, compare: compare, passes: passes, sifat: sifat, alternatives: alternatives, tegOf: tegOf };
});
