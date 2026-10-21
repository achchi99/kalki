/* kalki.uz — KalkiFit Android ilovasi (Capacitor qobiq) bilan ko'prik. window.KalkiNative:
 *   isApp() / platform() / isAndroidBrowser()   — aniqlash (isAndroidBrowser: Android brauzerida, ilova ICHIDA EMAS — «yuklab olish» qatori uchun)
 *   has(plugin)                                 — native plugin bormi (Capacitor.PluginHeaders)
 *   notif.perm() / notif.enable(o) / notif.disable() / notif.onTap(cb)   — «Baliq kuni» haftalik LOKAL bildirishnomasi (@capacitor/local-notifications)
 *   pickPhoto(labels)                           — kamera yoki galereya (@capacitor/camera, PROMPT) → Promise<File|null>
 *   openUrl(url)                                — tashqi brauzer yoki tegishli ilova (Uzum Tezkor, Yandex Eda…) (@capacitor/app-launcher)
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
  var backFn = null, NOTIF_ID = 7001;
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
      schedule: function (o) {
        var wd = ((+o.day || 0) + 1) % 7 + 1;          // 0=dushanba → Capacitor Weekday (1=yakshanba … 7=shanba)
        return call('LocalNotifications', 'cancel', { notifications: [{ id: NOTIF_ID }] }).catch(function () {}).then(function () {
          return call('LocalNotifications', 'schedule', { notifications: [{ id: NOTIF_ID, title: String(o.title || 'KalkiFit').slice(0, 60), body: String(o.body || '').slice(0, 200), smallIcon: 'ic_stat_kalkifit', iconColor: '#E8572F', extra: { u: o.url || '/kalkifit?baliq=1' }, schedule: { on: { weekday: wd, hour: o.hour == null ? 11 : o.hour, minute: 0 }, allowWhileIdle: true } }] });
        });
      },
      disable: function () { if (!N.notif.ok()) return Promise.resolve(); return call('LocalNotifications', 'cancel', { notifications: [{ id: NOTIF_ID }] }).catch(function () {}); },
      pending: function () { if (!N.notif.ok()) return Promise.resolve([]); return call('LocalNotifications', 'getPending').then(function (r) { return (r && r.notifications) || []; }, function () { return []; }); },
      onTap: function (cb) { var c = cap(); if (!N.notif.ok() || !c || typeof c.addListener !== 'function') return; try { c.addListener('LocalNotifications', 'localNotificationActionPerformed', function (e) { var n = e && e.notification; if (n && +n.id === NOTIF_ID) cb(n.extra || {}); }); } catch (e) {} }
    },
    /* ---------- rasm: kamera yoki galereya ---------- */
    canPickPhoto: function () { return N.has('Camera'); },
    pickPhoto: function (L) {
      L = L || {};
      return call('Camera', 'getPhoto', { quality: 82, resultType: 'dataUrl', source: 'PROMPT', width: 1600, height: 1600, correctOrientation: true, saveToGallery: false, promptLabelHeader: L.header || 'Rasm', promptLabelPhoto: L.gallery || 'Galereyadan', promptLabelPicture: L.camera || 'Rasmga olish', promptLabelCancel: L.cancel || 'Bekor qilish' })
        .then(function (r) { return r && r.dataUrl ? dataUrlToFile(r.dataUrl, 'rasm.' + (r.format || 'jpeg')) : null; }, function () { return null; });   // bekor qilinsa — null (xato emas)
    },
    /* ---------- tashqi havola: brauzer yoki tegishli ilova ---------- */
    openUrl: function (url) {
      if (!N.isApp()) return false;
      if (N.has('AppLauncher')) { call('AppLauncher', 'openUrl', { url: url }).catch(function () { try { root.open(url, '_blank'); } catch (e) {} }); return true; }
      return false;
    },
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
    // native splash: sahifa birinchi chizilganda yopiladi (inline #kfSplash xuddi shu ko'rinishda davom etadi — chaqnash yo'q)
    if (N.has('SplashScreen')) { var hide = function () { call('SplashScreen', 'hide', { fadeOutDuration: 150 }).catch(function () {}); }; if (root.document && root.document.readyState !== 'loading') hide(); else if (root.document) root.document.addEventListener('DOMContentLoaded', hide); }
  }
  try { install(); } catch (e) {}
  N._dataUrlToFile = dataUrlToFile;
  return N;
});
