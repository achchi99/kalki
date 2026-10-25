/* kalki.uz — «Uyda» PP retseptlari: hisob va tanlash mantig'i (UMD, DOM yo'q). Ma'lumot: data/uyda-pp.json (tools/uyda-pp-yasa.js), baza: data/ovqatlar.json.
 * Kkal/BJU QO'LDA YOZILMAGAN: tarkibdagi har mahsulot grammi × bazadagi qiymat (assets/orinbosar-core.js valuesOf: oilada variant ham). Natija har doim «taxminiy».
 * Tanlash: cheklov (Yemaydiganlarim; cho'chqa hech qachon) → vaqt/ovqat filtri → «Uyda nima bor?» → saralash: ovqat vaqtiga mosligi, qolgan kkalga sig'ishi, oqsilga hissasi; bugun/kecha yeganlari takrorlanmaydi. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(require('./orinbosar-core.js'), require('./cheklov-core.js')); else root.KalkiUydaPP = factory(root.KalkiOrinbosar, root.KalkiCheklov); })(typeof self !== 'undefined' ? self : this, function (OR, CH) {
  'use strict';
  var TGR = { '0': 'tayyorsiz', '1': 'tez', '3': 'pishirsa' }, MULTS = [0.5, 1, 1.5, 2], SHARE = { b: 0.3, l: 0.4, d: 0.35, s: 0.12 },
    TEZ = { b: { tayyorsiz: 10, tez: 10, pishirsa: 0 }, l: { tayyorsiz: 4, tez: 12, pishirsa: 4 }, d: { tayyorsiz: 4, tez: 12, pishirsa: 4 }, s: { tayyorsiz: 14, tez: 6, pishirsa: 0 } };          // «hozir nima yesam?» — avval tezi (ovqat vaqtiga qarab)
  function r1(x) { return Math.round(x * 10) / 10; }
  function keyOf(i) { return i[0] + (i[3] ? '#' + i[3] : ''); }
  /* bir porsiya (mult=1) yoki mult marta: { g, k, p, f, c, est, items:[{ id, v, g, n, k, p }] } */
  function calc(rec, by, mult) {
    mult = mult > 0 ? mult : 1; var t = { g: 0, k: 0, p: 0, f: 0, c: 0, est: true, items: [] }, ok = true;
    rec.ing.forEach(function (i) {
      var v = OR.valuesOf(by, keyOf(i)); if (!v) { ok = false; return; } var g = i[1] * mult, m = g / 100;
      t.g += g; t.k += v.k * m; t.p += v.p * m; t.f += v.f * m; t.c += v.c * m; t.items.push({ id: i[0], v: i[3] || null, g: Math.round(g), n: i[2] ? i[2] * mult : 0, k: v.k * m, p: v.p * m });
    });
    if (!ok) return null;
    t.g = Math.round(t.g); t.k = Math.round(t.k); t.p = r1(t.p); t.f = r1(t.f); t.c = r1(t.c); return t;
  }
  function allowed(rec, ch, yemaydi) { return rec.ing.every(function (i) { return CH.ruxsat(ch, keyOf(i), yemaydi || []); }); }
  /* retseptga kerak guruhlar («Uyda nima bor?» chiplari); oddiy mahsulotlar (suv, yog', un…) hisobga olinmaydi */
  function need(rec, data) {
    var of = {}, out = []; data.guruhlar.forEach(function (g) { g.ids.forEach(function (id) { of[id] = g.k; }); });
    rec.ing.forEach(function (i) { var g = of[i[0]]; if (g && out.indexOf(g) < 0) out.push(g); }); return out;
  }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h; }
  var LOW = 250, ZAX = 60;          // qolgan kkal < 250 — «limit deyarli tugadi» rejimi; tavsiya kkal ≤ qolgan + kichik zaxira (60), bo'lmasa eng yengillari
  /* o: { data, by, ch, yemaydi, rem:{k,p}|null, meal, filt:{t, m, max (daqiqa ≤), min (daqiqa ≥)}, have:[guruh], recent:{id: kunlarOldin}, today:'YYYY-MM-DD' }
     → { top:[3], list:[...], more:[...], fit:{k,p}, low } ; element: { rec, c (calc), miss:[guruh], fits, score, oqsil, yengil, ago } */
  function pick(o) {
    var rem = o.rem || null, meal = o.meal || 's', filt = o.filt || {}, have = o.have || [], recent = o.recent || {}, out = [];
    var left = rem ? rem.k : null, low = left != null && left < LOW, cap = left != null ? Math.max(0, left) + ZAX : Infinity;
    o.data.retseptlar.forEach(function (rec) {
      if (!allowed(rec, o.ch, o.yemaydi)) return;
      if (filt.t && rec.t !== TGR[filt.t]) return; if (filt.m && rec.m.indexOf(filt.m) < 0) return; if (filt.max && rec.min > filt.max) return; if (filt.min && rec.min < filt.min) return;
      var c = calc(rec, o.by); if (!c) return; var nd = need(rec, o.data), miss = have.length ? nd.filter(function (g) { return have.indexOf(g) < 0; }) : [];
      var fits = c.k <= cap, dens = c.k > 0 ? c.p * 4 / c.k : 0, s;
      if (low) s = 40 * Math.min(1, dens / 0.5) - c.k / 15 + (rec.m.indexOf(meal) > -1 ? 10 : 0);          // limit kam: avval kam kkal + oqsil zichligi yuqori
      else {
        var ideal = left > 0 ? Math.min(480, Math.max(150, left * (SHARE[meal] || 0.3))) : 0; s = (TEZ[meal] || TEZ.s)[rec.t] || 0;
        if (rec.m.indexOf(meal) > -1) s += 30;
        if (left != null) s += fits ? 20 - Math.min(15, Math.abs(c.k - ideal) / Math.max(1, ideal) * 15) : -40;
        var pn = rem && rem.p > 0 ? rem.p * (meal === 's' ? 0.2 : 0.35) : 25; s += 25 * Math.min(1, c.p / pn);
      }
      s += hash(rec.id + (o.today || '')) % 7;
      var ago = recent[rec.id]; if (ago === 0) s -= 100; else if (ago === 1) s -= 60;
      out.push({ rec: rec, c: c, miss: miss, fits: fits, score: s, oqsil: c.p >= 15 && dens >= 0.3, yengil: c.k <= 200, ago: ago });
    });
    var sort = function (a, b) { if (a.fits !== b.fits) return a.fits ? -1 : 1; if (!a.fits && low) return a.c.k - b.c.k || b.c.p - a.c.p; return b.score - a.score || (a.rec.id < b.rec.id ? -1 : 1); };
    var exact = out.filter(function (x) { return !x.miss.length; }), more = have.length ? out.filter(function (x) { return x.miss.length === 1; }) : []; exact.sort(sort); more.sort(sort);
    var top = [], cnt = {}, pool = exact.filter(function (x) { return x.ago == null; });          // bugun/kecha yegani — tepada takrorlanmaydi (agar boshqa variant yetarli bo'lsa)
    if (pool.length < 3) pool = exact;
    pool.forEach(function (x) { if (top.length < 3 && (low || (cnt[x.rec.t] || 0) < 2)) { top.push(x); cnt[x.rec.t] = (cnt[x.rec.t] || 0) + 1; } });
    pool.forEach(function (x) { if (top.length < 3 && top.indexOf(x) < 0) top.push(x); });
    return { top: top, list: exact, more: more, fit: rem, low: low };
  }
  /* oxirgi yegan retseptlar: prefs.ppAte = [[sana, id], …] → { id: kunlarOldin } (faqat bugun/kecha) */
  function recentOf(ate, today, addDays) {
    var out = {}, y = addDays(today, -1); (ate || []).forEach(function (e) { if (e[0] === today) out[e[1]] = 0; else if (e[0] === y && out[e[1]] == null) out[e[1]] = 1; }); return out;
  }
  function pruneAte(ate, today, addDays) { var lim = addDays(today, -3); return (ate || []).filter(function (e) { return e[0] >= lim; }).slice(-30); }
  function byId(data, id) { for (var i = 0; i < data.retseptlar.length; i++) if (data.retseptlar[i].id === id) return data.retseptlar[i]; return null; }
  return { LOW: LOW, ZAX: ZAX, TGR: TGR, MULTS: MULTS, calc: calc, allowed: allowed, need: need, pick: pick, recentOf: recentOf, pruneAte: pruneAte, byId: byId, keyOf: keyOf };
});
