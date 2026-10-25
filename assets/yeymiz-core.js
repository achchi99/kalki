/* kalki.uz — «Bugun nima yeymiz?» va «Boshqa variantlar»: toza hisob (UMD, DOM yo'q).
 * Ma'lumot: data/yeymiz.json (toifa tegi, segment, tartib, uyda), data/cheklov-teglar.json ("Yemaydiganlarim"), data/oqsil-manba.json + data/orinbosar.json (assets/orinbosar-core.js orqali).
 * Qoidalar: (1) har taom BITTA `yeymiz_toifa` tegiga ega — tegsiz taom hech qaysi chipga tushmaydi; (2) cheklov (tanlangan teglar + cho'chqa) — yagona yashirish sababi; hech narsa kaloriya uchun YASHIRILMAYDI;
 * (3) tartib — mashhurlik (qo'lda); belgilar: «Oqsilga boy» (oqsil/kkal), «Yengilroq» (toifa o'rtachasidan ≥20% kam kkal), «Bugungi limitdan oshadi» (yumshoq izoh). Takliflar ko'rsatma emas: hech narsa avtomatik yozilmaydi. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(require('./orinbosar-core.js'), require('./cheklov-core.js')); else root.KalkiYeymiz = factory(root.KalkiOrinbosar, root.KalkiCheklov); })(typeof self !== 'undefined' ? self : this, function (OR, CH) {
  'use strict';
  var SEG = ['uyda', 'kafe', 'buyurtma'], SEGH = { kafe: 'K', buyurtma: 'B' }, SHOW = 5;
  function r1(x) { return Math.round(x * 10) / 10; }
  /* taomning «odatiy porsiyasi»: yeymiz.json birlik[] → 'porsiya' → birinchi birlik → 100 g. → { u, n, g, k, p, f, c, sifat, kafe } */
  function portion(by, data, key) {
    var v = OR.valuesOf(by, key); if (!v) return null; var f = by[v.id]; if (f && f.al && by[f.al.f]) f = by[f.al.f];
    var us = (f.u || []).filter(function (x) { return x[0] !== 'g100'; }), ov = (data.birlik || {})[key], u = null, n = 1, g = 100, i;
    if (ov) for (i = 0; i < us.length; i++) if (us[i][0] === ov.u) { u = us[i][0]; n = ov.n || 1; g = us[i][1] * n; }
    if (!u) { for (i = 0; i < us.length; i++) if (us[i][0] === 'porsiya') { u = 'porsiya'; g = us[i][1]; } }
    if (!u && us.length) { u = us[0][0]; g = us[0][1]; }
    var m = g / 100; return { key: key, id: v.id, v: v.v, u: u, n: n, g: Math.round(g), k: Math.round(v.k * m), p: r1(v.p * m), f: r1(v.f * m), c: r1(v.c * m), sifat: OR.sifat(v), kafe: !!(f && f.kf) };
  }
  function toifaOf(data, key) { var t = data.taom[key]; return t ? t.t : null; }
  /* toifa a'zolari (cheklovsiz, tartib bilan): seg — 'kafe' | 'buyurtma' | null (hammasi) */
  function members(data, toifa, seg) {
    var out = [], h = seg ? SEGH[seg] : null, k;
    if (toifa === 'baliq') { (data.baliq || []).forEach(function (x) { out.push(x); }); }
    for (k in data.taom) { var t = data.taom[k]; if (t.t === toifa && (!h || t.s.indexOf(h) > -1) && out.indexOf(k) < 0) out.push(k); }
    return out;
  }
  function allToifa(data, toifa) { var o = members(data, toifa, null); if (toifa === 'baliq') { /* baliq ro'yxati asosiy */ } return o; }
  /* chip + segment → { items (barchasi, cheklovdan keyin, tartib bilan), ortacha } ; belgilar: flags.oqsil / flags.yengil / flags.oshadi */
  function list(o) {
    var by = o.by, data = o.data, ch = data.chegara || { oqsil: 12, yengil: 0.8 }, rem = o.qoldiq, all = members(data, o.toifa, null).map(function (k) { return portion(by, data, k); }).filter(Boolean);
    var mean = all.length ? all.reduce(function (a, p) { return a + p.k; }, 0) / all.length : 0, keys = members(data, o.toifa, o.seg), out = [];
    keys.forEach(function (k) {
      if (!CH.ruxsat(o.cheklov, k, o.yemaydi)) return; var p = portion(by, data, k); if (!p) return;
      p.teg = OR.tegOf(o.tags, k); p.flags = { oqsil: p.sifat >= ch.oqsil, yengil: mean > 0 && p.k <= mean * ch.yengil, oshadi: rem != null && p.k > rem }; out.push(p);
    });
    return { items: out, ortacha: Math.round(mean) };
  }
  /* uyda retseptlari (cheklov taomga qo'llanadi) */
  function uyda(o) { var ids = (o.data.uyda || {})[o.toifa] || []; return ids.map(function (id) { return o.uyda.retseptlar.filter(function (r) { return r.id === id; })[0]; }).filter(function (r) { return r && CH.ruxsat(o.cheklov, r.taom, o.yemaydi); }); }
  function groupsOf(data, key) { var s = OR.split(key), g = [], t = data.taom[key] || data.taom[s.id], mt = (data.manba_toifa || {})[s.id]; if (t) g.push(t.t); else if (mt) g.push(mt); if ((data.baliq || []).indexOf(key) > -1 && g.indexOf('baliq') < 0) g.push('baliq'); return g; }
  /* «Boshqa variantlar»: asl taom + porsiya uchun keng ro'yxat. filtr: 'oqsil' | 'kam' | 'tam'. */
  function variants(o) {
    var by = o.by, data = o.data, src = o.key, sp = o.portion, table = o.table, tags = o.tags, f = o.filtr || 'oqsil', sv = OR.valuesOf(by, src); if (!sv) return [];
    var keys = [], add = function (k) { if (k && k !== src && keys.indexOf(k) < 0 && OR.valuesOf(by, k)) keys.push(k); };
    ((table.manba || table)[sv.id] || []).forEach(function (c) { add(OR.altKey(by, src, c)); });
    var gs = groupsOf(data, src); gs.forEach(function (g) { members(data, g, null).forEach(add); });
    var srcTeg = OR.tegOf(tags, src), res = [];
    keys.forEach(function (k) {
      if (!CH.ruxsat(o.cheklov, k, o.yemaydi)) return; var c = OR.compare(by, src, k, sp); if (!c) return; var av = OR.valuesOf(by, k), fd = by[av.id]; if (fd && fd.al && by[fd.al.f]) fd = by[fd.al.f];
      var teg = OR.tegOf(tags, k), it = { key: k, id: av.id, v: av.v, dk: c.dk, dp: c.dp, df: c.df, g: c.g, u: c.u, n: c.n, sifat: OR.sifat(av), teg: teg, kafe: !!(fd && fd.kf), k: Math.round(av.k * c.g / 100), p: r1(av.p * c.g / 100) };
      if (f === 'oqsil' && !(c.dp >= 2)) return; if (f === 'kam' && !(c.dk <= -40)) return; if (f === 'tam' && (teg === srcTeg || teg === 'yoq')) return; res.push(it);
    });
    res.sort(f === 'kam' ? function (a, b) { return a.dk - b.dk; } : f === 'tam' ? function (a, b) { return b.sifat - a.sifat; } : function (a, b) { return b.dp - a.dp; });
    var pin = null; gs.forEach(function (g) { if (!pin && (data.birinchi || {})[g]) pin = data.birinchi[g]; });
    if (pin) { for (var i = 0; i < res.length; i++) if (res[i].key === pin) { res.unshift(res.splice(i, 1)[0]); break; } }
    return res.slice(0, 8);
  }
  function baliqKunOchiq(yemaydi) { return CH.toza(yemaydi).indexOf('baliq') < 0; }
  function kunOk(n) { n = Math.round(Number(n)); return n >= 0 && n <= 6 ? n : 3; }
  /* birlamchi segment: HAR DOIM «Uyda» (tez PP retseptlar, v42); Kafe va Buyurtma — yonidagi segmentlarda */
  function segBoshlang() { return 'uyda'; }
  return { SEG: SEG, SHOW: SHOW, portion: portion, toifaOf: toifaOf, members: members, list: list, uyda: uyda, variants: variants, groupsOf: groupsOf, baliqKunOchiq: baliqKunOchiq, kunOk: kunOk, segBoshlang: segBoshlang };
});
