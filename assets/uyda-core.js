/* kalki.uz — «Uyda» retseptlari: kishi soniga qayta hisob va xarid ro'yxati (UMD, DOM yo'q).
 * Ma'lumot: data/uyda.json (1 kishi uchun grammlar; tools/uyda-yasa.js yasaydi). */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.KalkiUyda = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function r(x, d) { var k = Math.pow(10, d); return Math.round(x * k) / k; }
  function kishiOk(n) { n = Math.round(Number(n)); return n >= 1 && n <= 8 ? n : 4; }
  var FR = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
  /* → [{ n, miqdor, birlik, text }] */
  function masalliq(ret, kishi, til) {
    var k = kishiOk(kishi), ru = til === 'ru';
    return ret.masalliq.map(function (m) {
      var q = m.g1 * k, txt;
      if (m.birlik === 'dona') { q = Math.round(q * 4) / 4; var w = Math.floor(q), fr = q - w; txt = (w ? String(w) : '') + (fr ? FR[fr] : '') + (ru ? ' шт' : ' dona'); }
      else { q = q >= 20 ? Math.round(q / 5) * 5 : r(q, 0); if (q < 1) q = 1; txt = q + (m.birlik === 'ml' ? (ru ? ' мл' : ' ml') : (ru ? ' г' : ' g')); }
      return { n: m.n[ru ? 'ru' : 'uz'], miqdor: q, birlik: m.birlik, text: txt };
    });
  }
  function royxat(ret, kishi, til) {
    var t = til === 'ru' ? 'ru' : 'uz', k = kishiOk(kishi);
    return (ret.nom[t] + ' — ' + k + (t === 'ru' ? ' чел.' : ' kishi') + '\n') + masalliq(ret, k, t).map(function (m) { return '• ' + m.n + ' — ' + m.text; }).join('\n');
  }
  function byId(data, id) { return data.retseptlar.filter(function (x) { return x.id === id; })[0] || null; }
  function toifa(data, t) { return data.retseptlar.filter(function (x) { return x.toifa === t; }); }
  return { kishiOk: kishiOk, masalliq: masalliq, royxat: royxat, byId: byId, toifa: toifa };
});
