/* kalki.uz — KalkiFit anonim hisoblagichlar (mijoz): faqat «hodisa nomi + kun + son». Hech qanday id, taom nomi, kkal, profil, IP YO'Q (server ham saqlamaydi).
 * Navbat localStorage "kalki_fit_hisob" da ({ 'YYYY-MM-DD|hodisa': son }); jo'natish: to'planganda / sahifa yopilganda / internet qaytganda; xatoda JIM (navbat saqlanadi, 100 dan oshsa eskisi tashlanadi).
 * Do Not Track yoqilgan bo'lsa — umuman hisoblanmaydi. Ruxsat etilgan nomlar server bilan bir xil (functions/api/hisob.js; test-yeymiz bir-biriga tenglikni tekshiradi). (UMD) */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.KalkiHisob = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var HODISA = ['orinbosar_korsatildi', 'orinbosar_tanlandi', 'baliq_oyna_ochildi', 'baliq_buyurtma_bosildi', 'baliq_kafe_yozildi', 'baliq_uyda_ochildi', 'yeymiz_ochildi', 'yeymiz_tanlandi', 'yeymiz_buyurtma_bosildi', 'yeymiz_uyda_ochildi', 'onboarding_boshlandi', 'onboarding_tugadi', 'onboarding_keyinroq', 'yemaydi_hammasi', 'yemaydi_tanlandi', 'retsept_ochildi', 'retsept_ai', 'retsept_natija', 'retsept_saqlandi', 'retsept_ulashildi', 'retsept_xato'];
  var XIZMAT = ['uzum-tezkor', 'yandex-eda'], LS = 'kalki_fit_hisob', MAXK = 100, BATCH = 5;
  function create(o) {
    o = o || {}; var store = o.storage, today = o.today || function () { return new Date().toISOString().slice(0, 10); }, post = o.post, dnt = o.dnt, q = {}, timer = null, busy = false;
    function rd() { try { var j = JSON.parse(store && store.getItem(LS) || 'null'); q = j && typeof j === 'object' ? j : {}; } catch (e) { q = {}; } }
    function wr() { try { if (store) store.setItem(LS, JSON.stringify(q)); } catch (e) {} }
    function size() { var n = 0, k; for (k in q) n += q[k]; return n; }
    function add(h, xizmat) {
      if (dnt) return false; if (HODISA.indexOf(h) < 0) return false;
      if (xizmat != null) { if (!/_buyurtma_bosildi$/.test(h) || XIZMAT.indexOf(xizmat) < 0) return false; h = h + '.' + xizmat; }
      rd(); var k = today() + '|' + h; q[k] = (q[k] || 0) + 1;
      var keys = Object.keys(q); if (keys.length > MAXK) keys.sort().slice(0, keys.length - MAXK).forEach(function (x) { delete q[x]; });
      wr(); if (size() >= BATCH) flush(); else sched(); return true;
    }
    function sched() { if (timer || !o.setTimeout) return; timer = o.setTimeout(function () { timer = null; flush(); }, 20000); }
    function body() { var k = [], key; for (key in q) { var p = key.split('|'); k.push({ s: p[0], h: p[1], n: Math.min(20, q[key]) }); } return { k: k.slice(0, 40) }; }
    function flush() {
      if (busy || dnt || !post) return Promise.resolve(false); rd(); if (!Object.keys(q).length) return Promise.resolve(true); if (o.online && !o.online()) return Promise.resolve(false);
      var b = body(), sent = {}; b.k.forEach(function (x) { sent[x.s + '|' + x.h] = x.n; }); busy = true;
      return Promise.resolve().then(function () { return post(b); }).then(function (ok) {
        busy = false; if (!ok) return false; rd(); Object.keys(sent).forEach(function (k) { if ((q[k] || 0) <= sent[k]) delete q[k]; else q[k] -= sent[k]; }); wr(); return true;
      }).catch(function () { busy = false; return false; });
    }
    return { add: add, flush: flush, size: function () { rd(); return size(); }, queue: function () { rd(); return JSON.parse(JSON.stringify(q)); } };
  }
  function browser() {
    var w = typeof window !== 'undefined' ? window : null; if (!w) return null; var ls = null; try { ls = w.localStorage; } catch (e) {}
    var h = create({ storage: ls, dnt: w.navigator && (w.navigator.doNotTrack === '1' || w.doNotTrack === '1'), setTimeout: w.setTimeout.bind(w), online: function () { return w.navigator.onLine !== false; },
      today: function () { var d = new Date(Date.now() + 5 * 3600000); return d.toISOString().slice(0, 10); },           // Toshkent kuni
      post: function (b) { return w.fetch('/api/hisob', { method: 'POST', credentials: 'omit', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(function (r) { return r.status === 204 || r.ok; }); } });
    w.addEventListener('pagehide', function () { h.flush(); }); w.document.addEventListener('visibilitychange', function () { if (w.document.visibilityState === 'hidden') h.flush(); }); w.addEventListener('online', function () { h.flush(); });
    setTimeout(function () { h.flush(); }, 4000); return h;
  }
  return { HODISA: HODISA, XIZMAT: XIZMAT, LS: LS, create: create, browser: browser };
});
