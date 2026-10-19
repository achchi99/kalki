/* kalki.uz — «ilova ichidamiz?» aniqlash (KalkiFit Android qobiq ilovasi, Capacitor). window.KalkiNative:
 *   isApp()             → true, agar sayt Capacitor ilovasi (native qobiq) ichida ochilgan (window.Capacitor mavjud va platforma 'web' emas)
 *   platform()          → 'android' | 'ios' | 'web'
 *   isAndroidBrowser()  → Android brauzerida (ilova ICHIDA EMAS) — «Android ilovasini yuklab olish» qatori uchun
 * Hozircha faqat aniqlash. 2-bosqichda native qadam sensori/Health Connect tugmalari faqat isApp() bo'lganda chiqadi. */
(function (root, factory) {
  var api = factory(root); if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiNative = api;
})(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this), function (root) {
  'use strict';
  function cap() { return root.Capacitor || null; }
  var N = {
    isApp: function () {
      var c = cap(); if (!c) return false;
      try { if (typeof c.isNativePlatform === 'function') return !!c.isNativePlatform(); if (typeof c.getPlatform === 'function') return c.getPlatform() !== 'web'; } catch (e) {}
      return false;
    },
    platform: function () { var c = cap(); try { return c && typeof c.getPlatform === 'function' ? String(c.getPlatform()) : 'web'; } catch (e) { return 'web'; } },
    isAndroidBrowser: function () { var ua = (root.navigator && root.navigator.userAgent) || ''; return !N.isApp() && /Android/i.test(ua); }
  };
  return N;
});
