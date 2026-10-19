/* kalki.uz — «Uyda pishiraman» baliq retseptlari: kishi soniga qayta hisob va xarid ro'yxati (UMD, DOM yo'q).
 * Ma'lumot: data/baliq-uy.json (1 kishi uchun grammlar). */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.KalkiBaliqUy = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function r(x, d) { var k = Math.pow(10, d); return Math.round(x * k) / k; }
  function kishiOk(n) { n = Math.round(Number(n)); return n >= 1 && n <= 8 ? n : 4; }
  /* → [{ n, miqdor, birlik, text }] */
  function masalliq(ret, kishi, til) {
    var k = kishiOk(kishi);
    return ret.masalliq.map(function (m) {
      var q = m.g1 * k, txt;
      if (m.birlik === 'dona') { q = Math.round(q * 4) / 4; txt = (q === 0.25 ? '¼' : q === 0.5 ? '½' : q === 0.75 ? '¾' : q % 1 === 0 ? String(q) : (Math.floor(q) + ({ 0.25: '¼', 0.5: '½', 0.75: '¾' })[q % 1])) + (til === 'ru' ? ' шт' : ' dona'); }
      else { q = q >= 20 ? Math.round(q / 5) * 5 : r(q, 0); if (q < 1) q = 1; txt = q + (til === 'ru' ? ' г' : ' g'); }
      return { n: m.n[til === 'ru' ? 'ru' : 'uz'], miqdor: q, birlik: m.birlik, text: txt };
    });
  }
  function royxat(ret, kishi, til) {
    var t = til === 'ru' ? 'ru' : 'uz', k = kishiOk(kishi);
    return (ret.nom[t] + ' — ' + k + (t === 'ru' ? ' чел.' : ' kishi') + '\n') + masalliq(ret, k, t).map(function (m) { return '• ' + m.n + ' — ' + m.text; }).join('\n');
  }
  return { kishiOk: kishiOk, masalliq: masalliq, royxat: royxat };
});
