/* kalki.uz — KalkiFit «OVQATLANISH SIFATI» (v103): kaloriya emas, TARKIB. Sof funksiyalar (brauzer: window.KalkiSifat, node: require) — matnlar maslahatchi kalitlarida (data/maslahatchi-matn.json).
 * Ilmiy chegara: bir xil kaloriyada makro tarkibi tarozidagi vazn yo'qotishni deyarli o'zgartirmaydi — bu modul vazn bo'yicha «X kg kam/ko'p ozdingiz» kabi raqam CHIQARMAYDI.
 * Ko'rsatiladigan oqibatlar: yo'qotilgan vazn tarkibi (oqsil kam bo'lsa — mushak ulushi taxminan ko'proq), to'qlik/ochlik, energiya, uzoq muddatli salomatlik. Formulalar va manbalar: docs/ovqat-sifati.md.
 *
 * Kunlik bal (0–100) = oqsil 30 + yog' 20 + kletchatka 20 + kaloriya rejasi 20 + muntazamlik 10:
 *   oqsil    — 30 × min(1, oqsil / maqsad) (maqsaddan oshishi jarima emas);
 *   yog'     — ≤ 115 % maqsad: 20; 115–160 %: 20 → 0 chiziqli; 160 %+: 0; juda kam (< 50 % maqsad): 20 × ulush / 0,5;
 *   kletchatka — 20 × min(1, g / me'yor); kunning yarmidan ko'p taomida ma'lumot yo'q bo'lsa — komponent hisobga olinmaydi (qolganlari 100 ga keltiriladi);
 *   kaloriya — |yeyilgan − reja| / reja ≤ 10 %: 20; 35 %+: 0; orasi chiziqli; xavfsiz minimumdan kam: ko'pi bilan 5;
 *   muntazamlik — ovqat vaqtlari (nonushta, tushlik, kechki, tamaddi): 3+ → 10, 2 → 6, 1 → 3.
 * Haftalik bal — to'liq kunlar (kamida 2 yozuv va reja kaloriyasining ≥ 50 %) o'rtachasi. */
(function (root, factory) { var api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiSifat = api; })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function num(x) { var n = Number(x); return isFinite(n) ? n : 0; }
  function cl(x, a, b) { return Math.max(a, Math.min(b, x)); }
  var W = { p: 30, f: 20, fb: 20, kcal: 20, mun: 10 };
  function yogO(f, gf) { if (!(gf > 0)) return W.f; var r = f / gf; if (r < 0.5) return W.f * r / 0.5; if (r <= 1.15) return W.f; if (r >= 1.6) return 0; return W.f * (1.6 - r) / 0.45; }
  function kcalO(k, lim, floor) { if (!(lim > 0)) return 0; var d = Math.abs(k - lim) / lim, o = d <= 0.1 ? W.kcal : d >= 0.35 ? 0 : W.kcal * (0.35 - d) / 0.25; if (floor > 0 && k < floor) o = Math.min(o, 5); return o; }
  function munO(m) { return m >= 3 ? 10 : m === 2 ? 6 : m === 1 ? 3 : 0; }
  /* x = { kcal, p, f, c, fb: {g, unk, n}, fbGoal, meals, n, lim, floor, gp, gf } → { ball, parts: [{k, o, max, v, g}], full, fbOff } */
  function kun(x) {
    x = x || {}; var parts = [], fb = x.fb || { g: 0, unk: 0, n: 0 }, fbOff = !(x.fbGoal > 0) || (fb.n > 0 && fb.unk * 2 > fb.n);
    parts.push({ k: 'p', o: x.gp > 0 ? W.p * Math.min(1, num(x.p) / x.gp) : W.p, max: W.p, v: num(x.p), g: num(x.gp) });
    parts.push({ k: 'f', o: yogO(num(x.f), num(x.gf)), max: W.f, v: num(x.f), g: num(x.gf) });
    parts.push({ k: 'fb', o: fbOff ? null : W.fb * Math.min(1, num(fb.g) / x.fbGoal), max: W.fb, v: num(fb.g), g: num(x.fbGoal), off: fbOff, unk: fb.unk });
    parts.push({ k: 'kcal', o: kcalO(num(x.kcal), num(x.lim), num(x.floor)), max: W.kcal, v: num(x.kcal), g: num(x.lim) });
    parts.push({ k: 'mun', o: munO(num(x.meals)), max: W.mun, v: num(x.meals), g: 3 });
    var s = 0, mx = 0; parts.forEach(function (p) { if (p.o == null) return; p.o = Math.round(p.o * 10) / 10; s += p.o; mx += p.max; });
    var full = num(x.n) >= 2 && num(x.lim) > 0 && num(x.kcal) >= num(x.lim) * 0.5;
    return { ball: num(x.n) ? Math.round(cl(s / mx * 100, 0, 100)) : null, parts: parts, full: full, fbOff: fbOff };
  }
  function hafta(days) { var l = (days || []).map(kun).filter(function (r) { return r.full && r.ball != null; }); return { ball: l.length ? Math.round(l.reduce(function (a, r) { return a + r.ball; }, 0) / l.length) : null, n: l.length }; }
  /* haftalik xulosa: days — to'liq kunlar ({kcal, lim, floor, p, gp, f, gf}); o.weights [{d,kg}], o.end (YYYY-MM-DD), o.addDays(d, n) → maslahatchi kalitlari + raqamlar */
  function avgIn(ws, a, b) { var s = 0, n = 0; (ws || []).forEach(function (w) { if (w.d >= a && w.d <= b) { s += num(w.kg); n++; } }); return n ? s / n : null; }
  var MUS_LOW = [0.25, 0.30], MUS_OK = [0.10, 0.15];          // oqsil kam / yetarli bo'lganda yo'qotilgan vaznning mushak ulushi (taxminiy diapazon; docs/ovqat-sifati.md)
  function r1(x) { return Math.max(0.1, Math.round(x * 10) / 10); }
  function xulosa(days, o) {
    o = o || {}; var t = (days || []).length, ok = 0, over = 0, low = 0, pKam = 0, fOshdi = 0;
    (days || []).forEach(function (x) { var k = num(x.kcal), lim = num(x.lim); if (x.floor > 0 && k < x.floor) low++; else if (lim > 0 && k > lim * 1.1) over++; else ok++; if (x.gp > 0 && num(x.p) < x.gp * 0.9) pKam++; if (x.gf > 0 && num(x.f) >= x.gf * 1.15) fOshdi++; });
    var out = { t: t, ok: ok, over: over, low: low, pKam: pKam, fOshdi: fOshdi, dw: null, mus: null, keys: [] }; if (!t) return out;
    out.keys.push(ok >= over && ok >= low ? { k: 'sw_ok', d: { n: ok, t: t } } : over >= low ? { k: 'sw_over', d: { n: over, t: t } } : { k: 'sw_low', d: { n: low, t: t } });
    out.keys.push(pKam || fOshdi ? { k: 'sw_tarkib', d: { p: pKam, f: fOshdi, t: t } } : { k: 'sw_tarkib_ok', d: {} });
    var e = o.end, A = o.addDays, cur = e && A ? avgIn(o.weights, A(e, -6), e) : null, prev = e && A ? avgIn(o.weights, A(e, -13), A(e, -7)) : null;
    if (cur != null && prev != null) {
      var dw = Math.round((cur - prev) * 10) / 10; out.dw = dw; var lost = -dw, fmt = function (x) { return String(r1(x)).replace('.', ','); }, lo = function (x) { return String(Math.max(0.1, Math.floor(x * 10 + 1e-9) / 10)).replace('.', ','); }, hi = function (x) { return String(Math.max(0.1, Math.ceil(x * 10 - 1e-9) / 10)).replace('.', ','); };          // diapazon: pastki — pastga, yuqori — yuqoriga yaxlitlanadi
      if (lost >= 0.2 && pKam * 2 >= t) { out.mus = { a: lo(lost * MUS_LOW[0]), b: hi(lost * MUS_LOW[1]), c: lo(lost * MUS_OK[0]), d: hi(lost * MUS_OK[1]) }; out.keys.push({ k: 'sw_mus', d: Object.assign({ dw: fmt(lost) }, out.mus) }); }
      else if (lost >= 0.2) { out.mus = { c: lo(lost * MUS_OK[0]), d: hi(lost * MUS_OK[1]) }; out.keys.push({ k: 'sw_mus_ok', d: { dw: fmt(lost), c: out.mus.c, d: out.mus.d } }); }
      else out.keys.push({ k: 'sw_flat', d: { dw: (dw > 0 ? '+' : '') + String(dw).replace('.', ',') } });
    } else out.keys.push({ k: 'sw_now', d: {} });
    return out;
  }
  /* shaxsiy naqshlar (kamida 14 kunlik ma'lumot; faqat statistik ma'noli bo'lsa): days — sana bo'yicha tartiblangan to'liq kunlar ({d, kcal, lim, f, gf, p, gp, dinner}) */
  var MIN_DAYS = 14, MIN_N = 4;
  function naqsh(days, A) {
    var out = [], L = (days || []).filter(function (x) { return x && x.d; }); if (L.length < MIN_DAYS) return out;
    var by = {}; L.forEach(function (x) { by[x.d] = x; });
    var hk = 0, hn = 0, ok0 = 0, on = 0; L.forEach(function (x) { var nx = A ? by[A(x.d, 1)] : null; if (!nx || !(nx.lim > 0)) return; var over = nx.kcal > nx.lim * 1.1; if (x.gf > 0 && x.f >= x.gf * 1.15) { hn++; if (over) hk++; } else { on++; if (over) ok0++; } });
    if (hn >= MIN_N && on >= MIN_N && hk / hn >= 0.6 && hk / hn - ok0 / on >= 0.25) out.push({ k: 'pt_fat', d: { k: hk, n: hn } });
    var a = [], b = []; L.forEach(function (x) { if (!(x.gp > 0) || x.dinner == null) return; if (x.p >= x.gp) a.push(x.dinner); else if (x.p < x.gp * 0.9) b.push(x.dinner); });
    if (a.length >= MIN_N && b.length >= MIN_N) { var ma = a.reduce(function (s, v) { return s + v; }, 0) / a.length, mb = b.reduce(function (s, v) { return s + v; }, 0) / b.length, d = mb - ma; if (d >= 150) out.push({ k: 'pt_prot', d: { x: Math.round(d / 10) * 10 } }); }
    return out;
  }
  /* takroriy taom: days7 — [{f, gf, food: [{fid, f}]}]; taom ≥ 3 marta va yog' oshgan kunlarning ≥ 2 tasida yog'ning asosiy manbai → { fid, n } */
  function takror(days7) {
    var cnt = {}, main = {}; (days7 || []).forEach(function (x) { (x.food || []).forEach(function (e) { if (e.fid) cnt[e.fid] = (cnt[e.fid] || 0) + 1; });
      if (x.gf > 0 && x.f >= x.gf * 1.15) { var m = {}, best = null; (x.food || []).forEach(function (e) { if (e.fid) m[e.fid] = (m[e.fid] || 0) + num(e.f); }); Object.keys(m).forEach(function (k) { if (!best || m[k] > m[best]) best = k; }); if (best && m[best] >= x.f * 0.4) main[best] = (main[best] || 0) + 1; } });
    var c = Object.keys(main).filter(function (k) { return main[k] >= 2 && cnt[k] >= 3; }).sort(function (a, b) { return cnt[b] - cnt[a]; })[0];
    return c ? { fid: c, n: cnt[c] } : null;
  }
  /* muqobil: shu guruhdagi (gr[0]) kamida 30 % kam yog'li taomlar; o'zbek taomlari (t: 'o') birinchi */
  function muqobil(f, foods, n) {
    if (!f) return []; var g = (f.gr || [])[0];
    return (foods || []).filter(function (x) { return x !== f && !x.h && !x.tm && !x.custom && x.id !== f.id && (x.gr || [])[0] === g && x.t === f.t && num(x.f) <= num(f.f) * 0.7 && num(x.k) >= num(f.k) * 0.5 && num(x.p) >= 3; })
      .sort(function (a, b) { return (b.t === 'o' ? 1 : 0) - (a.t === 'o' ? 1 : 0) || (b.top ? 1 : 0) - (a.top ? 1 : 0) || num(a.f) - num(b.f); }).slice(0, n || 3);
  }
  return { W: W, kun: kun, hafta: hafta, xulosa: xulosa, naqsh: naqsh, takror: takror, muqobil: muqobil, MUS_LOW: MUS_LOW, MUS_OK: MUS_OK };
});
