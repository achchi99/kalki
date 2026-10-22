/* kalki.uz — KalkiFit: «Menyudan tanlash» — kafe menyusi rasmidan (AI faqat taom NOMI va narxini o'qiydi, /api/kalkifit-menyu) bazadagi taomlarga moslab,
   bugungi qoldiq kkal va «Yemaydiganlarim» bo'yicha 2–3 ta eng mos variant. Kkal/oqsil FAQAT bazadan (odatiy porsiya). DOM'siz: window.KalkiMenyu / require(). */
(function (root) {
  'use strict';
  var NOPE = /(^|[^\p{L}])(cho'chqa|chochqa|choshqa|свинин|свин|bekon|бекон|bacon|pork|ветчин|ham\b|pepperoni|пепперони|salo|сало)/iu;
  function blocked(name) { return NOPE.test(String(name || '').toLowerCase().replace(/[ʻʼ’`‘]/g, "'")); }
  /* cands: [{ key, nom, narx, p: { k, p, … } (odatiy porsiya), sifat, ok (cheklovdan o'tdi) }]; rem — bugungi qoldiq kkal; ch — { oqsil, yengil } chegaralari
     → [{ …cand, why: 'oqsil' | 'yengil' | 'sigadi' }] (≤ 3) */
  function pick(cands, rem, ch) {
    ch = ch || { oqsil: 12, yengil: 0.8 }; var seen = {}, all = [];
    (cands || []).forEach(function (c) { if (!c || !c.p || !(c.p.k > 0) || !c.ok || blocked(c.nom) || seen[c.key]) return; seen[c.key] = 1; all.push(c); });
    if (!all.length) return [];
    var mean = all.reduce(function (a, c) { return a + c.p.k; }, 0) / all.length, fit = rem != null && rem > 0 ? all.filter(function (c) { return c.p.k <= rem; }) : [];
    var pool = (fit.length ? fit : all.slice().sort(function (a, b) { return a.p.k - b.p.k; }).slice(0, 3)).slice(), out = [];
    var why = function (c) { return c.sifat >= ch.oqsil ? 'oqsil' : (all.length > 1 && c.p.k <= mean * ch.yengil ? 'yengil' : (fit.length ? 'sigadi' : 'yengil')); };
    var take = function (c, w) { out.push(Object.assign({}, c, { why: w || why(c) })); pool.splice(pool.indexOf(c), 1); };
    var byProt = function () { return pool.slice().sort(function (a, b) { return b.sifat - a.sifat || a.p.k - b.p.k; })[0]; }, byLight = function () { return pool.slice().sort(function (a, b) { return a.p.k - b.p.k; })[0]; };
    if (pool.length) { var a = byProt(); take(a, a.sifat >= ch.oqsil ? 'oqsil' : null); }
    if (pool.length) { var b = byLight(); take(b, all.length > 1 && b.p.k <= mean * ch.yengil ? 'yengil' : null); }
    if (pool.length) take(byProt());
    return out;
  }
  /* narx: AI o'qigan son (so'm) → «45 000 so'm» */
  function narxTxt(n, lang) { n = Math.round(+n); if (!(n > 0) || n > 100000000) return ''; return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (lang === 'ru' ? ' сум' : " so'm"); }
  var api = { pick: pick, blocked: blocked, narxTxt: narxTxt };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiMenyu = api;
})(typeof window !== 'undefined' ? window : this);
