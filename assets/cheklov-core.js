/* kalki.uz — «Yemaydiganlarim»: taom cheklov teglari bo'yicha filtr (UMD, DOM yo'q).
 * Ma'lumot: data/cheklov-teglar.json (tools/cheklov-teglar.js yasaydi). Teglar: baliq, tuxum, sut, yongoq, glyuten, choshqa.
 * Qoida: «choshqa» foydalanuvchi tanlovidan QAT'I NAZAR doim yashiriladi (halol standart); teg noma'lum taom (kalit yo'q) — xavfsiz tomonga: taklif QILINMAYDI. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.KalkiCheklov = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var TEGLAR = ['baliq', 'tuxum', 'sut', 'yongoq', 'glyuten', 'choshqa'];
  function toza(yemaydi) { var o = ['choshqa']; (yemaydi || []).forEach(function (t) { if (TEGLAR.indexOf(t) > -1 && o.indexOf(t) < 0) o.push(t); }); return o; }
  /* taom kaliti: «id» yoki «id#variant»; variant teglari yo'q bo'lsa — oila (id) teglari */
  function teglari(D, key) { var t = D.taom[key]; if (t) return t; var i = String(key).indexOf('#'); if (i > 0 && D.taom[key.slice(0, i)]) return D.taom[key.slice(0, i)]; return null; }
  function ruxsat(D, key, yemaydi) { var t = teglari(D, key); if (!t) return false; var c = toza(yemaydi); for (var i = 0; i < t.length; i++) if (c.indexOf(t[i]) > -1) return false; return true; }
  function filtr(D, keys, yemaydi) { return keys.filter(function (k) { return ruxsat(D, k, yemaydi); }); }
  return { TEGLAR: TEGLAR, toza: toza, teglari: teglari, ruxsat: ruxsat, filtr: filtr };
});
