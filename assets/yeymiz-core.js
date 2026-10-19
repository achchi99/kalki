/* kalki.uz — «Bugun nima yeymiz?» va «Boshqa variantlar»: toza hisob (UMD, DOM yo'q).
 * Ma'lumot: data/yeymiz.json (guruhlar), data/cheklov-teglar.json ("Yemaydiganlarim"), data/oqsil-manba.json + data/orinbosar.json (assets/orinbosar-core.js orqali).
 * Qoidalar: har taklif avval cheklovdan o'tadi (cho'chqa HECH QACHON); keyin qolgan kkal sig'imi; keyin oqsil «sifati» (100 kkal ga oqsil g); bir oqsil manbasidan ko'pi bilan 2 ta.
 * Takliflar KO'RSATMA emas — tanlov foydalanuvchida; hech narsa avtomatik yozilmaydi. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(require('./orinbosar-core.js'), require('./cheklov-core.js')); else root.KalkiYeymiz = factory(root.KalkiOrinbosar, root.KalkiCheklov); })(typeof self !== 'undefined' ? self : this, function (OR, CH) {
  'use strict';
  var N = 3;
  function r1(x) { return Math.round(x * 10) / 10; }
  /* taomning «odatiy porsiyasi»: yeymiz.json birlik[] → 'porsiya' → birinchi birlik → 100 g. → { u, n, g, k, p, f, c } */
  function portion(by, data, key) {
    var v = OR.valuesOf(by, key); if (!v) return null; var f = by[v.id]; if (f && f.al && by[f.al.f]) f = by[f.al.f];
    var us = (f.u || []).filter(function (x) { return x[0] !== 'g100'; }), ov = (data.birlik || {})[key], u = null, n = 1, g = 100, i;
    if (ov) for (i = 0; i < us.length; i++) if (us[i][0] === ov.u) { u = us[i][0]; n = ov.n || 1; g = us[i][1] * n; }
    if (!u) { for (i = 0; i < us.length; i++) if (us[i][0] === 'porsiya') { u = 'porsiya'; g = us[i][1]; } }
    if (!u && us.length) { u = us[0][0]; g = us[0][1]; }
    var m = g / 100; return { key: key, id: v.id, v: v.v, u: u, n: n, g: Math.round(g), k: Math.round(v.k * m), p: r1(v.p * m), f: r1(v.f * m), c: r1(v.c * m), sifat: OR.sifat(v), kafe: !!(f && f.kf) };
  }
  function pool(by, data, ch, yemaydi, chips) {
    var list = (data.guruh[chips] || []).filter(function (k) { return OR.valuesOf(by, k) && CH.ruxsat(ch, k, yemaydi); });
    return list;
  }
  /* chip → ≤3 taklif: { items:[portion+tag], sigdi:bool } ; qoldiq (kkal) noma'lum bo'lsa null */
  function suggest(o) {
    var by = o.by, data = o.data, chips = o.chip, tags = o.tags, first = (data.birinchi || {})[chips], rem = o.qoldiq;
    var all = pool(by, data, o.cheklov, o.yemaydi, chips).map(function (k) { var p = portion(by, data, k); if (p) p.teg = OR.tegOf(tags, k); return p; }).filter(Boolean);
    var lim = rem != null && rem >= 150 ? rem * 1.05 + 30 : null, fit = lim == null ? all : all.filter(function (p) { return p.k <= lim; }), sigdi = true;
    if (fit.length < N) { sigdi = fit.length > 0 && lim == null; if (lim != null) { fit = fit.concat(all.filter(function (p) { return fit.indexOf(p) < 0; }).sort(function (a, b) { return a.k - b.k; })).slice(0, N); sigdi = false; } }
    fit = fit.slice().sort(function (a, b) { return b.sifat - a.sifat || a.k - b.k; });
    if (first) { var fi = fit.filter(function (p) { return p.key === first; })[0]; if (fi) { fit.splice(fit.indexOf(fi), 1); fit.unshift(fi); } }
    var out = [], cnt = {};
    fit.forEach(function (p) { if (out.length >= N) return; if ((cnt[p.teg] || 0) >= 2) return; cnt[p.teg] = (cnt[p.teg] || 0) + 1; out.push(p); });
    fit.forEach(function (p) { if (out.length < N && out.indexOf(p) < 0) out.push(p); });
    return { items: out, sigdi: sigdi };
  }
  function groupsOf(data, key) { var s = OR.split(key), g = [], c; for (c in data.guruh) if (data.guruh[c].indexOf(key) > -1 || data.guruh[c].indexOf(s.id) > -1) g.push(c); return g; }
  /* «Boshqa variantlar»: asl taom + porsiya uchun keng ro'yxat. filtr: 'oqsil' (oqsili ko'proq) | 'kam' (kaloriyasi kamroq) | 'tam' (boshqa oqsil manbai). */
  function variants(o) {
    var by = o.by, data = o.data, src = o.key, sp = o.portion, table = o.table, tags = o.tags, f = o.filtr || 'oqsil', sv = OR.valuesOf(by, src); if (!sv) return [];
    var keys = [], add = function (k) { if (k && k !== src && keys.indexOf(k) < 0 && OR.valuesOf(by, k)) keys.push(k); }, i;
    ((table.manba || table)[sv.id] || []).forEach(function (c) { add(OR.altKey(by, src, c)); });
    var gs = groupsOf(data, src); gs.forEach(function (g) { data.guruh[g].forEach(add); });
    var srcTeg = OR.tegOf(tags, src), res = [];
    keys.forEach(function (k) {
      if (!CH.ruxsat(o.cheklov, k, o.yemaydi)) return; var c = OR.compare(by, src, k, sp); if (!c) return; var av = OR.valuesOf(by, k), fd = by[av.id]; if (fd && fd.al && by[fd.al.f]) fd = by[fd.al.f];
      var teg = OR.tegOf(tags, k), it = { key: k, id: av.id, v: av.v, dk: c.dk, dp: c.dp, df: c.df, g: c.g, u: c.u, n: c.n, sifat: OR.sifat(av), teg: teg, kafe: !!(fd && fd.kf), k: Math.round(av.k * c.g / 100), p: r1(av.p * c.g / 100) };
      if (f === 'oqsil' && !(c.dp >= 2)) return; if (f === 'kam' && !(c.dk <= -40)) return; if (f === 'tam' && (teg === srcTeg || teg === 'yoq')) return; res.push(it);
    });
    res.sort(f === 'kam' ? function (a, b) { return a.dk - b.dk; } : f === 'tam' ? function (a, b) { return b.sifat - a.sifat; } : function (a, b) { return b.dp - a.dp; });
    var pin = gs.length ? (data.birinchi || {})[gs.filter(function (g) { return (data.birinchi || {})[g]; })[0]] : null;
    if (pin) { for (i = 0; i < res.length; i++) if (res[i].key === pin) { res.unshift(res.splice(i, 1)[0]); break; } }
    return res.slice(0, 8);
  }
  /* Baliq kuni: kafe/choyxona baliq taomlari va uyda retseptlar (cheklovdan keyin; baliq yemaydiganlarga hammasi bo'sh) */
  function baliqKafe(o) { var by = o.by; return (o.data.baliq.kafe || []).filter(function (k) { return CH.ruxsat(o.cheklov, k, o.yemaydi); }).map(function (k) { return portion(by, o.data, k); }).filter(Boolean); }
  function baliqKunOchiq(yemaydi) { return CH.toza(yemaydi).indexOf('baliq') < 0; }
  /* kun nomlari (du–ya) */
  function kunOk(n) { n = Math.round(Number(n)); return n >= 0 && n <= 6 ? n : 3; }
  return { N: N, portion: portion, suggest: suggest, variants: variants, groupsOf: groupsOf, baliqKafe: baliqKafe, baliqKunOchiq: baliqKunOchiq, kunOk: kunOk };
});
