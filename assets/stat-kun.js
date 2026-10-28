/* kalki.uz — KalkiFit anonim statistika (mijoz): hodisalar navbati (localStorage) → POST /api/stat (sendBeacon; bo'lmasa fetch keepalive). Server: functions/api/stat.js.
 * Yuboriladi: hodisa nomi + qat'iy qo'shimcha kalit (usul/manba/tur…), platforma, til, ekran kengligi (guruh sifatida saqlanadi), APK versiyasi, mijoz_id (server uni sirli tuz bilan xeshlaydi — xom saqlanmaydi).
 * Server User-Agent'dan faqat qurilma TURINI aniqlaydi (OS, brauzer, model — UA bergan bo'lsa); IP va joylashuv saqlanmaydi.
 * YUBORILMAYDI: ovqat, vazn, yosh, ism, email. Hisoblanmaydi: ?demo=1, *.pages.dev (preview), localhost, navigator.webdriver (avtomat/headless), bot UA. Xatoda jim.
 *   var stat = KalkiStat.create({ cid: () => id, platform: () => 'veb', lang: () => 'uz' }); stat.add('ovqat_qoshildi', 'qidiruv'); stat.flush(); */
(function (root, factory) { var api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiStat = api; })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var KEY = 'kalki_stat_q', DAYK = 'kalki_stat_faol', MAX = 60, MKEY = 'kalki_manba';
  /* v61: MANBA (qayerdan keldi) — anonim, FAQAT qisqa kod: x | tg | ig | yt | google | fb | sayt (kalki.uz ichidan) | dir (to'g'ridan) | boshqa.
     Manba: URL'dagi utm_source (yoki ref), bo'lmasa document.referrer DOMENI. To'liq URL, yo'l, so'rov, erkin matn saqlanmaydi va yuborilmaydi (noma'lum utm → «boshqa»). */
  var SITES = { x: ['x.com', 'twitter.com', 't.co'], tg: ['t.me', 'telegram.org', 'telegram.me', 'telegram.dog'], ig: ['instagram.com'], yt: ['youtube.com', 'youtu.be'], fb: ['facebook.com', 'fb.com', 'fb.me'] },
    ALIAS = { x: 'x', twitter: 'x', tg: 'tg', telegram: 'tg', ig: 'ig', instagram: 'ig', yt: 'yt', youtube: 'yt', google: 'google', fb: 'fb', facebook: 'fb', sayt: 'sayt', site: 'sayt', dir: 'dir', direct: 'dir' },
    APPS = [[/^org\.telegram\./, 'tg'], [/^com\.twitter\./, 'x'], [/^com\.instagram\./, 'ig'], [/^com\.google\.android\.youtube$/, 'yt'], [/^com\.facebook\./, 'fb'], [/^com\.google\.android\.googlequicksearchbox$/, 'google']];
  function host(u) { var m = /^(?:[a-z][a-z0-9+.-]*:\/\/)?([^\/?#:\s]+)/i.exec(String(u || '').trim().slice(0, 300)); return m ? m[1].toLowerCase().replace(/^www\./, '') : ''; }
  function ofHost(d, self) {
    if (!d) return ''; var k, i, n;
    if (d === 'kalki.uz' || /\.kalki\.uz$/.test(d) || (self && d === self)) return 'sayt';
    for (i = 0; i < APPS.length; i++) if (APPS[i][0].test(d)) return APPS[i][1];
    if (/(^|\.)google\.[a-z.]+$/.test(d)) return 'google';
    for (k in SITES) for (n = 0; n < SITES[k].length; n++) if (d === SITES[k][n] || d.slice(-SITES[k][n].length - 1) === '.' + SITES[k][n]) return k;
    return 'boshqa';
  }
  function manbaOf(search, referrer, selfHost) {
    var m = /[?&](?:utm_source|ref)=([^&#]*)/i.exec(String(search || '')), v = '';
    if (m) { try { v = decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { v = m[1]; } v = v.trim().toLowerCase().slice(0, 40); }
    if (v) { if (ALIAS[v]) return ALIAS[v]; return /^[a-z0-9.\-]+$/.test(v) && v.indexOf('.') > 0 ? ofHost(host(v), selfHost) : 'boshqa'; }          // noma'lum utm_source — «boshqa» (erkin matn saqlanmaydi)
    var d = host(referrer); return d ? ofHost(d, selfHost) : 'dir';
  }
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
      manba: function () {          // birinchi ochilishda aniqlanib qurilmada BIR MARTA saqlanadi (keyin o'zgarmaydi); demo/preview/bot — ''
        if (dis) return ''; try { var v = ls && ls.getItem(MKEY); if (v && /^[a-z]{1,8}$/.test(v)) return v; var c = manbaOf((w.location || {}).search, w.document && w.document.referrer, (w.location || {}).hostname); if (ls) ls.setItem(MKEY, c); return c; } catch (e) { return ''; }
      },
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
  return { create: create, off: off, manbaOf: manbaOf };
});
