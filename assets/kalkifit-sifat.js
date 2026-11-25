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
  /* v104: vazn TRENDI — haftalik farq emas (suv ±1 kg). Oxirgi TW kun ichidagi yozuvlar, kamida T_N ta va T_SPAN kun oralig'ida → chiziqli regressiya (eng kichik kvadratlar);
     o'zgarish = qiyalik × oraliq. Mushak ulushi faqat trend bo'yicha yo'qotish ≥ T_MIN kg bo'lsa. docs/ovqat-sifati.md */
  var MUS_LOW = [0.25, 0.30], MUS_OK = [0.10, 0.15];          // oqsil kam / yetarli bo'lganda yo'qotilgan vaznning mushak ulushi (taxminiy diapazon; docs/ovqat-sifati.md)
  var TW = 28, T_N = 4, T_SPAN = 14, T_MIN = 0.5;
  function dn(d) { var m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d || ''); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5 : NaN; }
  function trend(ws, end, A) {
    var from = A ? A(end, -(TW - 1)) : '', by = {};
    (ws || []).forEach(function (w) { var kg = num(w && w.kg); if (w && w.d >= from && w.d <= end && kg > 0) by[w.d] = kg; });          // bir kunda bir nechta — oxirgisi
    var L = Object.keys(by).sort(); if (!L.length) return { n: 0 };
    var span = Math.round(dn(L[L.length - 1]) - dn(L[0])); if (L.length < T_N || span < T_SPAN) return { n: L.length, span: span };
    var x0 = dn(L[0]), X = L.map(function (d) { return dn(d) - x0; }), Y = L.map(function (d) { return by[d]; }), n = L.length, mx = 0, my = 0, sxx = 0, sxy = 0, i;
    for (i = 0; i < n; i++) { mx += X[i] / n; my += Y[i] / n; }
    for (i = 0; i < n; i++) { sxx += (X[i] - mx) * (X[i] - mx); sxy += (X[i] - mx) * (Y[i] - my); }
    var k = sxx ? sxy / sxx : 0; return { n: n, span: span, from: L[0], to: L[n - 1], slope: k, dw: k * span };
  }
  var TXT = { uz: { oz: 'juda oz', upto: '{b} kg gacha', one: '~{a} kg', rng: '{a}–{b} kg' }, ru: { oz: 'совсем немного', upto: 'до {b} кг', one: '~{a} кг', rng: '{a}–{b} кг' } };
  function c1(x) { return String(Math.round(x * 10) / 10).replace('.', ','); }          // 0,1 kg aniqlik — 0,06 kabi soxta aniqlik yo'q
  function diap(x, y, lang) {
    var T = TXT[lang] || TXT.uz, a = Math.round(x * 10) / 10, b = Math.round(y * 10) / 10, f = function (s) { return s.replace('{a}', c1(a)).replace('{b}', c1(b)); };
    if (y < 0.1) return T.oz; if (x < 0.1) return f(T.upto); return a === b ? f(T.one) : f(T.rng);
  }
  function xulosa(days, o) {
    o = o || {}; var t = (days || []).length, ok = 0, over = 0, low = 0, pKam = 0, fOshdi = 0, pk = function (x) { return x.gp > 0 && num(x.p) < x.gp * 0.9; };
    (days || []).forEach(function (x) { var k = num(x.kcal), lim = num(x.lim); if (x.floor > 0 && k < x.floor) low++; else if (lim > 0 && k > lim * 1.1) over++; else ok++; if (pk(x)) pKam++; if (x.gf > 0 && num(x.f) >= x.gf * 1.15) fOshdi++; });
    var out = { t: t, ok: ok, over: over, low: low, pKam: pKam, fOshdi: fOshdi, dw: null, mus: null, tr: null, keys: [] }; if (!t) return out;
    out.keys.push(ok >= Math.ceil(t * 0.7) ? { k: 'sw_ok', d: { n: ok, t: t } } : over >= low ? { k: 'sw_over', d: { n: over, t: t } } : { k: 'sw_low', d: { n: low, t: t } });          // maqtov — kamida 70 % kun reja ichida
    out.keys.push(pKam || fOshdi ? { k: 'sw_tarkib', d: { p: pKam, f: fOshdi, t: t } } : { k: 'sw_tarkib_ok', d: {} });
    var e = o.end, lang = o.lang === 'ru' ? 'ru' : 'uz', tr = e && o.addDays ? trend(o.weights, e, o.addDays) : { n: 0 }; out.tr = tr;
    if (!tr.n) { out.keys.push({ k: 'sw_now', d: {} }); return out; }
    if (tr.dw == null) { out.keys.push({ k: 'sw_kam', d: {} }, { k: 'sw_suv', d: {} }); return out; }
    var dw = Math.round(tr.dw * 10) / 10, lost = -tr.dw, nd = tr.span + 1; out.dw = dw;
    if (lost >= T_MIN) {
      var TD = (o.trendDays || days || []).filter(function (x) { return !x.d || x.d >= tr.from && x.d <= tr.to; }), tp = 0;          // oqsil kam kunlar ulushi — SHU trend davri bo'yicha
      TD.forEach(function (x) { if (pk(x)) tp++; }); out.pT = { k: tp, n: TD.length };
      var cd = diap(lost * MUS_OK[0], lost * MUS_OK[1], lang);
      if (TD.length && tp * 2 >= TD.length) { out.mus = { ab: diap(lost * MUS_LOW[0], lost * MUS_LOW[1], lang), cd: cd }; out.keys.push({ k: 'sw_mus', d: { n: nd, dw: c1(lost), ab: out.mus.ab, cd: cd } }); }
      else { out.mus = { cd: cd }; out.keys.push({ k: 'sw_mus_ok', d: { n: nd, dw: c1(lost), cd: cd } }); }
    } else out.keys.push({ k: 'sw_flat', d: { n: nd, dw: dw > 0 ? '+' + c1(dw) : dw < 0 ? '−' + c1(-dw) : '0' } });
    out.keys.push({ k: 'sw_suv', d: {} });
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
  return { W: W, kun: kun, hafta: hafta, xulosa: xulosa, naqsh: naqsh, takror: takror, muqobil: muqobil, MUS_LOW: MUS_LOW, MUS_OK: MUS_OK, trend: trend, diap: diap, T_MIN: T_MIN };
});
