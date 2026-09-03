/* kalki.uz — service worker ro'yxatdan o'tkazish va yangilanishni boshqarish.
 *
 * MUAMMO. Ilgari bu kod har sahifada inline turardi va `controllerchange`
 * hodisasida sahifani SO'ROQSIZ qayta yuklardi. Deploy foydalanuvchi ish
 * ustida bo'lgan paytga to'g'ri kelsa — mehnat shartnomasini yarmigacha
 * to'ldirgan yoki marosim kalkulyatorida o'nlab tanlov qilgan bo'lsa —
 * hammasi yo'qolardi. Versiya nomuvofiqligidan ko'ra og'irroq zarar.
 *
 * YECHIM. Qayta yuklash faqat YO'QOTADIGAN NARSA YO'Q bo'lganda bo'ladi:
 *   - foydalanuvchi hali biror maydonga tegmagan bo'lsa;
 *   - va ayni paytda fayl (Word/PDF) yasalayotgan bo'lmasa.
 * Aks holda sahifa pastida kichik, to'sib qo'ymaydigan chiziq chiqadi.
 *
 * NOZIK JIHAT. `__userTouched` FAQAT haqiqiy foydalanuvchi harakatidan
 * yoqiladi. Sahifalar holatni URL parametridan tiklaganda o'zi sun'iy
 * `change` hodisasini tarqatadi (document.createEvent('HTMLEvents') —
 * 30 dan ortiq sahifada shunday). Agar bayroq shundan ham yoqilsa,
 * qayta yuklash hech qachon ishlamay qolardi va butun himoya ma'nosini
 * yo'qotardi. Shuning uchun `e.isTrusted` tekshiriladi.
 */
(function (w, d) {
  'use strict';
  if (w.KalkiSW) return;                  // idempotent: ikki marta ulansa ham bitta nusxa

  var BAR_ID = 'sw-update-bar';
  var SEEN_KEY = 'kalki_sw_bar_closed';   // sessiya davomida: yopilgan chiziq qaytmaydi

  var userTouched = false;
  var reloaded = false;
  var holds = 0;                          // fayl yasalayotgan jarayonlar soni

  function slug() {
    try { return (w.location.pathname || '').replace(/^\//, '').replace(/\.html$/, '') || 'index'; }
    catch (e) { return ''; }
  }
  function ga(name, params) {
    try { if (typeof w.gtag === 'function') w.gtag('event', name, params || {}); } catch (e) {}
  }
  function ru() { return d.documentElement.lang === 'ru'; }
  function ss(fn, dflt) {
    try { return fn(); } catch (e) { return dflt; }   // sessionStorage bloklangan bo'lishi mumkin
  }

  /* ---------- 1. Haqiqiy foydalanuvchi tegishi ---------- */
  // capture: sahifaning o'z handleri hodisani to'xtatsa ham biz ko'ramiz.
  function touch(e) {
    if (!e || !e.isTrusted) return;       // dasturiy dispatch — bu tanlov emas
    userTouched = true;
  }
  d.addEventListener('input', touch, true);
  d.addEventListener('change', touch, true);

  /* ---------- 2. Fayl yasalayotgan payt ---------- */
  // Word/PDF tugmalari bosilganda o'zini disabled qiladi va tugagach qaytaradi
  // (assets/docgen.js dagi #wordBtn, kalkulyator sahifalaridagi .pdfbtn).
  // Shu holatni kuzatamiz — 30 ta sahifadagi inline kodga tegmaslik uchun.
  function hold() { holds++; }
  function release() { if (holds > 0) holds--; }

  function watchButton(btn) {
    hold();
    var t0 = Date.now();
    (function poll() {
      // tugma yana bosiladigan holga qaytdi -> jarayon tugadi (yoki xato bo'ldi)
      if (!btn.disabled || Date.now() - t0 > 60000) { release(); return; }
      w.setTimeout(poll, 400);
    })();
  }

  d.addEventListener('click', function (e) {
    if (!e || !e.isTrusted) return;
    var t = e.target;
    if (!t || !t.closest) return;
    var btn = t.closest('.pdfbtn, #wordBtn, #pdfBtn');
    if (!btn) return;
    // disabled sinxron qo'yiladi, biz undan keyin qaraymiz
    w.setTimeout(function () { if (btn.disabled) watchButton(btn); }, 0);
  }, true);

  /* ---------- 3. Yangilanish chizig'i ---------- */
  var TEXT = {
    uz: { msg: 'Sayt yangilandi. Qulay paytda sahifani yangilang.', btn: 'Yangilash', close: 'Yopish' },
    ru: { msg: 'Сайт обновлён. Обновите страницу, когда будет удобно.', btn: 'Обновить', close: 'Закрыть' }
  };

  function showBar() {
    if (ss(function () { return sessionStorage.getItem(SEEN_KEY); }, null)) return;
    if (d.getElementById(BAR_ID)) return;          // guard faqat YARATISHNI o'tkazib yuboradi
    var t = TEXT[ru() ? 'ru' : 'uz'];

    var bar = d.createElement('div');
    bar.id = BAR_ID;
    bar.className = 'noprint';
    bar.setAttribute('role', 'status');
    bar.setAttribute('style', 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;'
      + 'max-width:520px;margin:0 auto;display:flex;align-items:center;gap:10px;'
      + 'background:#16211C;color:#fff;border-radius:12px;padding:10px 10px 10px 14px;'
      + 'box-shadow:0 8px 28px rgba(0,0,0,.28);font-size:13px;font-weight:600;line-height:1.35;'
      + 'padding-bottom:calc(10px + env(safe-area-inset-bottom))');

    var msg = d.createElement('span');
    msg.textContent = t.msg;
    msg.setAttribute('style', 'flex:1;min-width:0');

    var go = d.createElement('button');
    go.type = 'button';
    go.textContent = t.btn;
    go.setAttribute('style', 'flex:none;min-height:36px;background:#D99A2B;color:#16211C;border:0;'
      + 'border-radius:9px;padding:8px 14px;font:inherit;font-weight:800;cursor:pointer');
    go.addEventListener('click', function () { w.location.reload(); });

    var x = d.createElement('button');
    x.type = 'button';
    x.textContent = '✕';
    x.setAttribute('aria-label', t.close);
    x.setAttribute('style', 'flex:none;width:32px;min-height:32px;background:transparent;color:#C9D6CE;'
      + 'border:0;font:inherit;font-size:16px;line-height:1;cursor:pointer');
    x.addEventListener('click', function () {
      ss(function () { sessionStorage.setItem(SEEN_KEY, '1'); });
      if (bar.parentNode) bar.parentNode.removeChild(bar);
    });

    bar.appendChild(msg);
    bar.appendChild(go);
    bar.appendChild(x);
    d.body.appendChild(bar);
  }

  /* ---------- 4. Ro'yxatdan o'tkazish va controllerchange ---------- */
  w.KalkiSW = {
    hold: hold,
    release: release,
    isDirty: function () { return userTouched || holds > 0; },
    showBar: showBar
  };

  if (!('serviceWorker' in w.navigator)) return;

  w.navigator.serviceWorker.register('/sw.js')['catch'](function () {});

  w.navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (reloaded) return;                 // cheksiz sikl bo'lmasin
    if (userTouched || holds > 0) {
      ga('sw_update_deferred', { page: slug() });
      showBar();
      return;
    }
    reloaded = true;
    w.location.reload();
  });
})(window, document);
