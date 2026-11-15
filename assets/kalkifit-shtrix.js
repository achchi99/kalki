/* kalki.uz — KalkiFit v79: SHTRIX-KOD SKANERI (mijoz yadrosi; UI — kalkifit-app.js). window.KalkiShtrix (UMD, DOM'siz qismlari test uchun).
 *   normKod(s)            — EAN-13 / EAN-8 / UPC-A (12 → oldiga 0) va nazorat raqami; yaroqsiz — null
 *   kind()                — 'native' (BarcodeDetector bor: Android Chrome/WebView…) | 'wasm' (iPhone Safari va boshqalar: ZBar WebAssembly zaxirasi) | 'yoq' (kamera API yo'q)
 *   start(video, o)       — kamerani ochadi va tanib turadi: o.onCode(kod), o.onError(sabab: 'ruxsat'|'kamera'|'xavfsiz'|'boshqa'); { stop() } qaytaradi.
 *                           Video elementi DOM'dan chiqib ketsa o'zi to'xtaydi (oyna yopilganda kamera qolib ketmaydi).
 *   scanFile(file)        — bitta suratdan o'qish (kamera ruxsatsiz zaxira: iPhone/Android «suratga olish») → Promise<kod|null>
 *   get(kod, til)         — GET /api/shtrix → Promise<{ s, j }>
 * ZBar WASM (assets/vendor/zbar, LGPL-2.1+) FAQAT skaner ochilganda yuklanadi (lazy) va faqat native detektor yo'q bo'lsa. */
(function (root, f) { if (typeof module === 'object' && module.exports) module.exports = f(root); else root.KalkiShtrix = f(root); })(typeof window !== 'undefined' ? window : globalThis, function (W) {
  'use strict';
  var FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'], ZB = '/assets/vendor/zbar/', zbarP = null, det = null;
  function normKod(s) {
    var k = String(s == null ? '' : s).trim(); if (!/^\d{8}$|^\d{12,13}$/.test(k)) return null;
    if (k.length === 12) k = '0' + k;
    var sum = 0, i; for (i = 0; i < k.length - 1; i++) sum += +k[k.length - 2 - i] * (i % 2 === 0 ? 3 : 1);
    return (10 - (sum % 10)) % 10 === +k[k.length - 1] ? k : null;
  }
  function kind() {
    if (!W.navigator || !W.navigator.mediaDevices || !W.navigator.mediaDevices.getUserMedia) return 'yoq';
    return W.BarcodeDetector ? 'native' : 'wasm';
  }
  function loadZbar() {          // lazy: skript + wasm — faqat birinchi ochilishda
    if (zbarP) return zbarP;
    zbarP = new Promise(function (ok, no) {
      if (W.zbarWasm) { ok(W.zbarWasm); return; }
      var s = W.document.createElement('script'); s.src = ZB + 'zbar.js'; s.async = true;
      s.onload = function () { try { W.zbarWasm.setModuleArgs({ locateFile: function (n) { return ZB + n; } }); ok(W.zbarWasm); } catch (e) { zbarP = null; no(e); } };
      s.onerror = function () { zbarP = null; no(new Error('zbar')); }; W.document.head.appendChild(s);
    });
    return zbarP;
  }
  function getDet() { if (!det) { try { det = new W.BarcodeDetector({ formats: FORMATS }); } catch (e) { det = null; } } return det; }
  var cv = null;
  function frameData(src, w, h, crop) {          // markaziy kesim (ramka) → ImageData
    if (!cv) cv = W.document.createElement('canvas');
    var cw = Math.round(w * (crop || 1)), ch = Math.round(h * (crop ? Math.min(1, crop * 0.6) : 1)), sx = Math.round((w - cw) / 2), sy = Math.round((h - ch) / 2), sc = cw > 900 ? 900 / cw : 1;
    cv.width = Math.round(cw * sc); cv.height = Math.round(ch * sc); var g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(src, sx, sy, cw, ch, 0, 0, cv.width, cv.height);
    return g.getImageData(0, 0, cv.width, cv.height);
  }
  function zbarRead(z, id) {
    return z.scanImageData(id).then(function (syms) {
      for (var i = 0; i < syms.length; i++) { var t = String(syms[i].typeName || ''), v = syms[i].decode ? syms[i].decode() : ''; if (/EAN|UPC/i.test(t)) { var k = normKod(v); if (k) return k; } }
      return null;
    });
  }
  function readSource(src, w, h, crop) {          // → Promise<kod|null>
    if (kind() === 'native' && getDet()) return getDet().detect(src).then(function (r) { for (var i = 0; i < r.length; i++) { var k = normKod(r[i].rawValue); if (k) return k; } return null; }, function () { return null; });
    return loadZbar().then(function (z) { return zbarRead(z, frameData(src, w, h, crop)); });
  }
  function start(video, o) {
    o = o || {}; var stopped = false, stream = null, last = null, same = 0, busy = false, tm = null;
    function fail(e) { var n = e && e.name; o.onError && o.onError(n === 'NotAllowedError' || n === 'SecurityError' || n === 'PermissionDeniedError' ? 'ruxsat' : (n === 'NotFoundError' || n === 'OverconstrainedError' || n === 'NotReadableError' || n === 'DevicesNotFoundError' ? 'kamera' : 'boshqa')); }
    function stop() { stopped = true; if (tm) clearTimeout(tm); if (stream) { stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} }); stream = null; } try { video.srcObject = null; } catch (e) {} }
    function tick() {
      if (stopped) return; if (!W.document.body.contains(video)) { stop(); return; }
      if (busy || video.readyState < 2 || !video.videoWidth) { tm = setTimeout(tick, 120); return; }
      busy = true;
      readSource(video, video.videoWidth, video.videoHeight, 0.8).then(function (k) {
        busy = false; if (stopped) return;
        if (k) { same = k === last ? same + 1 : 1; last = k; if (same >= (kind() === 'native' ? 1 : 2)) { stop(); o.onCode && o.onCode(k); return; } } else { same = 0; last = null; }
        tm = setTimeout(tick, kind() === 'native' ? 90 : 140);
      }, function () { busy = false; tm = setTimeout(tick, 400); });
    }
    if (kind() === 'yoq') { setTimeout(function () { o.onError && o.onError(W.isSecureContext === false ? 'xavfsiz' : 'kamera'); }, 0); return { stop: stop }; }
    if (kind() === 'wasm') loadZbar().catch(function () {});          // kamera ochilguncha wasm yuklanib tursin
    W.navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }).then(function (s) {
      if (stopped || !W.document.body.contains(video)) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      stream = s; video.setAttribute('playsinline', ''); video.muted = true; video.srcObject = s; var p = video.play(); if (p && p.catch) p.catch(function () {}); tick();
    }, fail);
    return { stop: stop };
  }
  function scanFile(file) {
    return new Promise(function (ok) {
      if (!file || !W.createImageBitmap) { ok(null); return; }
      W.createImageBitmap(file).then(function (bm) {
        var w = bm.width, h = bm.height, tries = [function () { return readSource(bm, w, h, 0); }];
        (function next(i) { if (i >= tries.length) { try { bm.close(); } catch (e) {} ok(null); return; } tries[i]().then(function (k) { if (k) { try { bm.close(); } catch (e) {} ok(k); } else next(i + 1); }, function () { next(i + 1); }); })(0);
      }, function () { ok(null); });
    });
  }
  function get(kod, til) { return W.fetch('/api/shtrix?kod=' + encodeURIComponent(kod) + '&til=' + encodeURIComponent(til || 'uz'), { headers: { Accept: 'application/json' } }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); }); }
  return { normKod: normKod, kind: kind, start: start, scanFile: scanFile, get: get, loadZbar: loadZbar, FORMATS: FORMATS };
});
