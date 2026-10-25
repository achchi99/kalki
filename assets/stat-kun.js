/* kalki.uz — KalkiFit anonim statistika (mijoz): hodisalar navbati (localStorage) → POST /api/stat (sendBeacon; bo'lmasa fetch keepalive). Server: functions/api/stat.js.
 * Yuboriladi: hodisa nomi + qat'iy qo'shimcha kalit (usul/manba/tur…), platforma, til, ekran kengligi (guruh sifatida saqlanadi), APK versiyasi, mijoz_id (server uni sirli tuz bilan xeshlaydi — xom saqlanmaydi).
 * Server User-Agent'dan faqat qurilma TURINI aniqlaydi (OS, brauzer, model — UA bergan bo'lsa); IP va joylashuv saqlanmaydi.
 * YUBORILMAYDI: ovqat, vazn, yosh, ism, email. Hisoblanmaydi: ?demo=1, *.pages.dev (preview), localhost, navigator.webdriver (avtomat/headless), bot UA. Xatoda jim.
 *   var stat = KalkiStat.create({ cid: () => id, platform: () => 'veb', lang: () => 'uz' }); stat.add('ovqat_qoshildi', 'qidiruv'); stat.flush(); */
(function (root, factory) { var api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiStat = api; })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var KEY = 'kalki_stat_q', DAYK = 'kalki_stat_faol', MAX = 60;
  function off(o) {
    var w = o.win || (typeof window !== 'undefined' ? window : null); if (!w) return true;
    try { if (w.localStorage && w.localStorage.getItem('kalki_stat_test') === '1') return false; } catch (e) {}            // faqat test
    var loc = w.location || {}, host = String(loc.hostname || ''), q = String(loc.search || ''), ua = String((w.navigator && w.navigator.userAgent) || '');
    return /[?&]demo=1\b/.test(q) || /\.pages\.dev$/.test(host) || host === 'localhost' || host === '127.0.0.1' || !!(w.navigator && w.navigator.webdriver) || /bot\b|crawl|spider|headless|lighthouse/i.test(ua);
  }
  function create(o) {
    o = o || {}; var w = o.win || (typeof window !== 'undefined' ? window : {}), ls = o.storage || (function () { try { return w.localStorage; } catch (e) { return null; } })(), dis = off(o), timer = 0;
    function read() { try { var a = JSON.parse((ls && ls.getItem(KEY)) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
    function write(a) { try { if (ls) ls.setItem(KEY, JSON.stringify(a.slice(-MAX))); } catch (e) {} }
    function today() { return new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10); }          // Toshkent kuni
    var api = {
      disabled: function () { return dis; },
      queue: read,
      add: function (h, k) {
        if (dis || !h) return false; var a = read(), kk = k == null ? '' : String(k), f = a.filter(function (x) { return x[0] === h && x[1] === kk; })[0];
        if (f) f[2] = Math.min(20, (f[2] || 1) + 1); else a.push([h, kk, 1]); write(a);
        clearTimeout(timer); timer = setTimeout(api.flush, o.delay == null ? 8000 : o.delay); if (timer && timer.unref) timer.unref(); return true;
      },
      faol: function () { if (dis) return false; var t = today(); try { if (ls && ls.getItem(DAYK) === t) return false; if (ls) ls.setItem(DAYK, t); } catch (e) {} return api.add('faol'); },          // kuniga 1 marta
      flush: function () {
        if (dis) return false; var a = read(); if (!a.length) return false; var id = o.cid ? o.cid() : ''; if (!id) return false;
        var sw = 0; try { sw = Math.round((w.screen && w.screen.width) || w.innerWidth || 0); } catch (e) {}
        var body = JSON.stringify({ q: id, p: o.platform ? o.platform() : 'veb', t: o.lang ? o.lang() : 'uz', h: a.slice(0, 30), e: sw, v: o.ver ? String(o.ver() || '') : '' }), ok = false;          // e — ekran kengligi (serverda guruhga aylanadi), v — APK versiyasi
        try { var nav = w.navigator; if (nav && nav.sendBeacon) ok = nav.sendBeacon('/api/stat', new w.Blob([body], { type: 'application/json' })); } catch (e) { ok = false; }
        if (!ok) { try { w.fetch('/api/stat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {}); ok = true; } catch (e) { ok = false; } }
        if (ok) write(a.slice(30)); return ok;
      }
    };
    try { if (w.addEventListener) { w.addEventListener('pagehide', api.flush); if (w.document) w.document.addEventListener('visibilitychange', function () { if (w.document.visibilityState === 'hidden') api.flush(); }); } } catch (e) {}
    return api;
  }
  return { create: create, off: off };
});
