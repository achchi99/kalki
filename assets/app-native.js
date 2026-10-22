/* kalki.uz — KalkiFit Android ilovasi (Capacitor qobiq) bilan ko'prik. window.KalkiNative:
 *   isApp() / platform() / isAndroidBrowser()   — aniqlash (isAndroidBrowser: Android brauzerida, ilova ICHIDA EMAS — «yuklab olish» qatori uchun)
 *   has(plugin)                                 — native plugin bormi (Capacitor.PluginHeaders)
 *   notif.perm() / notif.enable(o) / notif.disable() / notif.onTap(cb)   — «Baliq kuni» haftalik LOKAL bildirishnomasi (@capacitor/local-notifications)
 *   pickPhoto(labels)                           — (eski) kamera yoki galereya (@capacitor/camera, native PROMPT oynasi) → Promise<File|null>
 *   pickPhotoFrom('PHOTOS'|'CAMERA')            — tanlangan manba (native oyna YO'Q; sayt o'z tanlov oynasini ko'rsatadi) → Promise<{file}|{cancel:true}|{error:'camera'|'other', message}>
 *   openUrl(url)                                — tashqi brauzer yoki tegishli ilova (Uzum Tezkor, Yandex Eda…) (@capacitor/app-launcher)
 *   qadam.ok() / status() / perm() / enable(on) / today() / days(n) / hcInstall()   — qadam: Health Connect (Google Fit, Samsung Health…) yoki apparat hisoblagich (ilovadagi «Qadam» plagini, kalkifit-android: qadam/);
 *                                               status() → { available, granted, enabled, source: 'hc'|'sensor'|'', hc: 'ok'|'install'|'none' }
 *   setBack(fn) / back()                        — Android «Orqaga» (MainActivity chaqiradi): fn() → 'sheet'|'step'|'tab'|'onb'|'overlay' (ushlandi) yoki 'home'
 * Ilova ichida navigator.share/canShare (fayl bilan — Filesystem keshi orqali, @capacitor/share) va navigator.vibrate (@capacitor/haptics) native'ga yo'naltiriladi —
 * mavjud kod (retsept kartochkasi, natijalar rasmi, Telegram zaxira, ro'yxat ulashish, kit.vib) o'zgarmasdan ishlaydi.
 * Sahifa kalki.uz'dan yuklanadi, @capacitor/* JS paketlari YO'Q — faqat native-bridge (Capacitor.nativePromise / addListener). Brauzerda hammasi jim (false/null). */
(function (root, factory) {
  var api = factory(root); if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiNative = api;
})(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this), function (root) {
  'use strict';
  function cap() { return root.Capacitor || null; }
  function call(plugin, method, opts) { var c = cap(); if (!c || typeof c.nativePromise !== 'function') return Promise.reject(new Error('native yo\'q')); return c.nativePromise(plugin, method, opts || {}); }
  var backFn = null, NOTIF_ID = 7001, open0 = root.open;
  var N = {
    isApp: function () {
      var c = cap(); if (!c) return false;
      try { if (typeof c.isNativePlatform === 'function') return !!c.isNativePlatform(); if (typeof c.getPlatform === 'function') return c.getPlatform() !== 'web'; } catch (e) {}
      return false;
    },
    platform: function () { var c = cap(); try { return c && typeof c.getPlatform === 'function' ? String(c.getPlatform()) : 'web'; } catch (e) { return 'web'; } },
    isAndroidBrowser: function () { var ua = (root.navigator && root.navigator.userAgent) || ''; return !N.isApp() && /Android/i.test(ua); },
    has: function (name) { var c = cap(); if (!N.isApp() || !c) return false; var h = c.PluginHeaders; return Array.isArray(h) ? h.some(function (x) { return x && x.name === name; }) : false; },
    call: call,
    /* ---------- «Baliq kuni»: haftalik lokal bildirishnoma ---------- */
    notif: {
      ok: function () { return N.has('LocalNotifications'); },
      perm: function () { if (!N.notif.ok()) return Promise.resolve('na'); return call('LocalNotifications', 'checkPermissions').then(function (r) { return (r && r.display) || 'prompt'; }, function () { return 'na'; }); },
      /* o = { day: 0..6 (0 = dushanba), hour: 11, title, body, url } → Promise<'on'|'denied'|'na'> (ruxsatni FAQAT shu chaqiruvda so'raydi — foydalanuvchi bosganda) */
      enable: function (o) {
        if (!N.notif.ok()) return Promise.resolve('na');
        return call('LocalNotifications', 'requestPermissions').then(function (r) {
          if (!r || r.display !== 'granted') return 'denied';
          return N.notif.schedule(o).then(function () { return 'on'; });
        });
      },
      /* ruxsat bor deb hisoblab qayta rejalashtirish (kun/til o'zgarganda; ruxsat so'ramaydi) */
      schedule: function (o) {                        // o.id — boshqa haftalik eslatma uchun (standart: «Baliq kuni»; 7002 — «Haftalik xulosa»)
        var wd = ((+o.day || 0) + 1) % 7 + 1, id = +o.id || NOTIF_ID;          // 0=dushanba → Capacitor Weekday (1=yakshanba … 7=shanba)
        return call('LocalNotifications', 'cancel', { notifications: [{ id: id }] }).catch(function () {}).then(function () {
          return call('LocalNotifications', 'schedule', { notifications: [{ id: id, title: String(o.title || 'KalkiFit').slice(0, 60), body: String(o.body || '').slice(0, 200), smallIcon: 'ic_stat_kalkifit', iconColor: '#E8572F', extra: { u: o.url || '/kalkifit?baliq=1' }, schedule: { on: { weekday: wd, hour: o.hour == null ? 11 : o.hour, minute: 0 }, allowWhileIdle: true } }] });
        });
      },
      disable: function (id) { if (!N.notif.ok()) return Promise.resolve(); return call('LocalNotifications', 'cancel', { notifications: [{ id: +id || NOTIF_ID }] }).catch(function () {}); },
      pending: function () { if (!N.notif.ok()) return Promise.resolve([]); return call('LocalNotifications', 'getPending').then(function (r) { return (r && r.notifications) || []; }, function () { return []; }); },
      onTap: function (cb, id) { var c = cap(), want = +id || NOTIF_ID; if (!N.notif.ok() || !c || typeof c.addListener !== 'function') return; try { c.addListener('LocalNotifications', 'localNotificationActionPerformed', function (e) { var n = e && e.notification; if (n && +n.id === want) cb(n.extra || {}); }); } catch (e) {} }
    },
    /* ---------- rasm: kamera yoki galereya ---------- */
    canPickPhoto: function () { return N.has('Camera'); },
    pickPhoto: function (L) {
      L = L || {};
      return call('Camera', 'getPhoto', { quality: 82, resultType: 'dataUrl', source: 'PROMPT', width: 1600, height: 1600, correctOrientation: true, saveToGallery: false, promptLabelHeader: L.header || 'Rasm', promptLabelPhoto: L.gallery || 'Galereyadan', promptLabelPicture: L.camera || 'Rasmga olish', promptLabelCancel: L.cancel || 'Bekor qilish' })
        .then(function (r) { return r && r.dataUrl ? dataUrlToFile(r.dataUrl, 'rasm.' + (r.format || 'jpeg')) : null; }, function () { return null; });   // bekor qilinsa — null (xato emas)
    },
    /* manba aniq (PHOTOS — tizim Photo Picker, ruxsat kerak emas; CAMERA — tizim kamerasi). Native PROMPT ishlatilmaydi: u ba'zi telefonlarda qora/xira ko'rinib, bosishlarga javob bermagan. */
    pickPhotoFrom: function (source) {
      return call('Camera', 'getPhoto', { quality: 82, resultType: 'dataUrl', source: source === 'CAMERA' ? 'CAMERA' : 'PHOTOS', width: 1600, height: 1600, correctOrientation: true, saveToGallery: false })
        .then(function (r) { var f = r && r.dataUrl ? dataUrlToFile(r.dataUrl, 'rasm.' + (r.format || 'jpeg')) : null; return f ? { file: f } : { error: 'other', message: 'bo\'sh javob' }; },
          function (e) { var m = String((e && (e.message || e.errorMessage || e.code)) || e || ''); if (/cancel/i.test(m)) return { cancel: true }; return { error: /denied|permission|camera|resolve/i.test(m) && source === 'CAMERA' ? 'camera' : 'other', message: m.slice(0, 80) }; });
    },
    /* ---------- tashqi havola: brauzer yoki tegishli ilova ---------- */
    /* ilova ichida qoladigan manzil: shu sayt + /kalkifit (yoki /ru/kalkifit) va undagi ma'lumot/asset so'rovlari; qolgani — tashqi */
    external: function (u) {
      if (!u || !/^https?:$/.test(u.protocol)) return !!(u && /^(mailto|tel|sms|tg|whatsapp|intent|market|geo):$/.test(u.protocol));
      if (u.host !== root.location.host) return true;
      return !/^\/(ru\/)?kalkifit(\/|\.html|$|\?)/.test(u.pathname + (u.search ? '?' : ''));
    },
    openUrl: function (url) {
      if (!N.isApp()) return false;
      if (N.has('AppLauncher')) { call('AppLauncher', 'openUrl', { url: url }).catch(function () { try { if (open0) open0.call(root, url, '_blank'); } catch (e) {} }); return true; }
      return false;
    },
    /* ---------- qadam: apparat hisoblagich (faqat ilovada; veb/iPhone'da ok() = false) ---------- */
    qadam: {
      ok: function () { return N.has('Qadam'); },
      status: function () { if (!N.qadam.ok()) return Promise.resolve({ available: false, granted: false, enabled: false }); return call('Qadam', 'isAvailable').catch(function () { return { available: false, granted: false, enabled: false }; }); },
      perm: function () { if (!N.qadam.ok()) return Promise.resolve({ granted: false }); return call('Qadam', 'requestPermission').catch(function () { return { granted: false }; }); },          // → { granted, source: 'hc'|'sensor' } (Health Connect bo'lsa — u, bo'lmasa sensor)
      ulash: function () { if (!N.qadam.ok()) return Promise.resolve({ granted: false }); var old = function () { return call('Qadam', 'requestPermission').catch(function () { return { granted: false }; }); }; return call('Qadam', 'ulash').then(function (r) { return r && typeof r.granted === 'boolean' ? r : old(); }, old); },      // BITTA bosish: Health Connect ruxsat oynasi + ACTIVITY_RECOGNITION
      fitInstall: function () { if (!N.qadam.ok()) return Promise.resolve(false); return call('Qadam', 'openGoogleFit').then(function () { return true; }, function () { return false; }); },
      diag: function () { if (!N.qadam.ok()) return Promise.resolve(''); return call('Qadam', 'diag').then(function (r) { return (r && r.matn) || ''; }, function (e) { return 'diag xato: ' + ((e && e.message) || e); }); },
      onLive: function (cb) { var c = cap(); if (!N.qadam.ok() || !c || typeof c.addListener !== 'function') return; try { c.addListener('Qadam', 'qadam', function (e) { cb(e || {}); }); } catch (e) {} },      // ilova ochiq: sensor har yangi qadamda
      hcInstall: function () { if (!N.qadam.ok()) return Promise.resolve(false); return call('Qadam', 'openHealthConnect').then(function () { return true; }, function () { return false; }); },
      enable: function (on) { if (!N.qadam.ok()) return Promise.resolve({ enabled: false }); return call('Qadam', 'setEnabled', { on: !!on }).catch(function () { return { enabled: false }; }); },
      today: function () { if (!N.qadam.ok()) return Promise.resolve(null); return call('Qadam', 'getToday').catch(function () { return null; }); },
      days: function (n) { if (!N.qadam.ok()) return Promise.resolve([]); return call('Qadam', 'getDays', { n: n || 7 }).then(function (r) { var l = (r && r.kunlar) || []; if (r && r.source != null) l.source = r.source; if (r && r.hcToday != null) l.hcToday = r.hcToday; return l; }, function () { return []; }); }      // ro'yxat + .source ('hc'|'sensor'|''), .hcToday
    },
    /* ---------- ilova versiyasi (App.getInfo: { version, build }) — yangilanish banneri uchun ---------- */
    appInfo: function () { if (!N.has('App')) return Promise.resolve(null); return call('App', 'getInfo').then(function (r) { return r && r.build ? { version: String(r.version || ''), build: +r.build || 0 } : null; }, function () { return null; }); },
    /* ---------- «Orqaga» ---------- */
    setBack: function (fn) { backFn = typeof fn === 'function' ? fn : null; },
    back: function () { if (!backFn) return ''; try { return String(backFn() || 'home'); } catch (e) { return 'home'; } }
  };
  function dataUrlToFile(u, name) {
    var m = /^data:([^;,]+)?(;base64)?,(.*)$/.exec(u); if (!m) return null; var bin = root.atob(m[3]), a = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
    var type = m[1] || 'image/jpeg'; try { return new root.File([a], name, { type: type }); } catch (e) { var b = new root.Blob([a], { type: type }); b.name = name; return b; }
  }
  function blobB64(b) { return new Promise(function (ok, no) { var r = new root.FileReader(); r.onload = function () { ok(String(r.result).split(',')[1] || ''); }; r.onerror = no; r.readAsDataURL(b); }); }
  /* ---------- ilova ichida: Web Share / Vibration API native'ga ---------- */
  function install() {
    if (!N.isApp() || !root.navigator) return;
    var nav = root.navigator;
    if (N.has('Share')) {
      var canShare = function (d) { if (!d) return false; if (d.files && d.files.length) return N.has('Filesystem'); return !!(d.text || d.url || d.title); };
      var share = function (d) {
        d = d || {}; var files = d.files ? [].slice.call(d.files) : [];
        var prep = files.length ? Promise.all(files.map(function (f, i) {
          var nm = String(f.name || ('kalkifit-' + Date.now() + '-' + i + '.png')).replace(/[^\w.\-]+/g, '_');
          return blobB64(f).then(function (b64) { return call('Filesystem', 'writeFile', { path: 'ulashish/' + nm, data: b64, directory: 'CACHE', recursive: true }); }).then(function (r) { return r.uri; });
        })) : Promise.resolve([]);
        return prep.then(function (uris) {
          var o = { dialogTitle: d.title || 'KalkiFit' }; if (d.title) o.title = d.title; if (d.text) o.text = d.text; if (d.url) o.url = d.url; if (uris.length) o.files = uris;
          return call('Share', 'share', o).then(function () {}, function (e) { var x = new Error((e && e.message) || 'bekor'); x.name = 'AbortError'; throw x; });
        });
      };
      try { Object.defineProperty(nav, 'share', { value: share, configurable: true, writable: true }); Object.defineProperty(nav, 'canShare', { value: canShare, configurable: true, writable: true }); } catch (e) {}
    }
    if (N.has('Haptics')) {
      var vib = function (p) { var ms = Array.isArray(p) ? p.reduce(function (a, x, i) { return i % 2 ? a : a + (+x || 0); }, 0) : +p || 0; if (ms > 0) call('Haptics', 'vibrate', { duration: Math.min(ms, 400) }).catch(function () {}); return true; };
      try { Object.defineProperty(nav, 'vibrate', { value: vib, configurable: true, writable: true }); } catch (e) {}
    }
    /* Havolalar: ilova ichida faqat KalkiFit (/kalkifit, /ru/kalkifit) qoladi; boshqa kalki.uz sahifalari, maxfiylik, Uzum/Yandex Eda va h.k. —
       TIZIM brauzerida/ilovasida (WebView ichida ochilsa «Internet yo'q» oynasi chiqardi, orqaga qaytish ham yo'qolardi). */
    if (N.has('AppLauncher') && root.document) {
      root.document.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey) return;
        var a = e.target && e.target.closest ? e.target.closest('a[href]') : null; if (!a || a.hasAttribute('download') || a.hasAttribute('data-act')) return;      // data-act — ilovaning o'z ishlovchisi (u o'zi openUrl qiladi)
        var href = a.getAttribute('href') || ''; if (!href || href.charAt(0) === '#' || /^(javascript|blob|data):/i.test(href)) return;
        var u; try { u = new root.URL(href, root.location.href); } catch (x) { return; }
        if (!N.external(u)) return;
        e.preventDefault(); N.openUrl(u.href);
      });
      root.open = function (url) { try { var u = new root.URL(String(url || ''), root.location.href); if (N.external(u)) { N.openUrl(u.href); return null; } } catch (x) {} return open0 ? open0.apply(root, arguments) : null; };
    }
    // native splash: sahifa birinchi chizilganda yopiladi (inline #kfSplash xuddi shu ko'rinishda davom etadi — chaqnash yo'q)
    if (N.has('SplashScreen')) { var hide = function () { call('SplashScreen', 'hide', { fadeOutDuration: 150 }).catch(function () {}); }; if (root.document && root.document.readyState !== 'loading') hide(); else if (root.document) root.document.addEventListener('DOMContentLoaded', hide); }
  }
  try { install(); } catch (e) {}
  N._dataUrlToFile = dataUrlToFile;
  return N;
});
