/* kalki.uz — "Telefonga o'rnatish" (PWA). Majburiy oyna YO'Q: footer'ning pastida kichik tugma.
 *  - Chrome/Android: beforeinstallprompt kelganda tugma ko'rinadi (bosilganda o'rnatish oynasi).
 *  - iPhone/iPad (Safari): tugma emas, qisqa ko'rsatma: "Ulashish → Bosh ekranga qo'shish".
 *  - Allaqachon o'rnatilgan (standalone) bo'lsa — hech narsa ko'rinmaydi.
 * Faqat brauzerda yaratiladi (HTML'ga statik yozilmaydi): prerender va /cyr/ (JS-siz) o'zgarmaydi.
 * O'chirish: PWA_INSTALL_YOQILGAN = false. */
(function () {
  'use strict';
  var PWA_INSTALL_YOQILGAN = true;
  if (!PWA_INSTALL_YOQILGAN) return;
  if (/jsdom/i.test(navigator.userAgent || '')) return;

  var T = {
    uz: { btn: "Telefonga o'rnatish", ios: "iPhone'da o'rnatish: Safari'da «Ulashish» → «Bosh ekranga qo'shish».", note: "Kalki.uz ilova kabi ochiladi" },
    ru: { btn: 'Установить на телефон', ios: 'Установка на iPhone: в Safari «Поделиться» → «На экран „Домой“».', note: 'Kalki.uz откроется как приложение' }
  };
  function lang() { return document.documentElement.lang === 'ru' ? 'ru' : 'uz'; }
  function standalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  }
  // Boshqa modullar (assets/prognoz.js) uchun kichik ochiq interfeys: ilova o'rnatilganmi, o'rnatish oynasini ochish mumkinmi.
  var api = window.KalkiPwa = { installed: standalone(), ios: false, canPrompt: function () { return false; }, prompt: function () { return false; }, iosHint: function () { return T[lang()].ios; } };
  if (standalone()) return;

  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isSafariIOS = isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  var deferred = null, box = null, btn = null, hint = null;
  api.ios = isSafariIOS;
  api.canPrompt = function () { return !!deferred; };
  api.prompt = function () {
    if (!deferred) return false;
    var d = deferred; deferred = null; if (btn) btn.hidden = true; if (box) box.hidden = true;
    try { d.prompt(); if (d.userChoice && d.userChoice.then) d.userChoice.then(function () {}, function () {}); } catch (e) {}
    return true;
  };

  function css() {
    if (document.getElementById('pwacss')) return;
    var st = document.createElement('style'); st.id = 'pwacss';
    st.textContent = '.pwa-inst{margin:20px 0 0;display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px}.pwa-inst[hidden]{display:none}' +
      '.pwa-inst button{border:1.5px solid rgba(255,255,255,.45);background:transparent;color:#fff;font:inherit;font-size:15px;font-weight:600;min-height:44px;padding:8px 16px;border-radius:10px;cursor:pointer}' +
      '.pwa-inst button:hover{background:rgba(255,255,255,.12);border-color:#fff}' +
      '.pwa-inst .pwa-note,.pwa-inst .pwa-ios{font-size:14px;line-height:1.5;color:#D2E0D8;margin:0}';
    document.head.appendChild(st);
  }
  function mount() {
    if (box) return box;
    var host = document.querySelector('#sf2 .sf2-in');
    if (!host) return null;
    css();
    box = document.createElement('div'); box.className = 'pwa-inst'; box.id = 'pwaInst'; box.hidden = true;
    btn = document.createElement('button'); btn.type = 'button'; btn.id = 'pwaBtn'; btn.hidden = true;
    hint = document.createElement('p'); hint.className = 'pwa-ios'; hint.hidden = true;
    box.appendChild(btn); box.appendChild(hint);
    var note = host.querySelector('.sf2-note');
    if (note && note.parentNode === host) host.insertBefore(box, note); else host.appendChild(box);
    btn.addEventListener('click', function () {
      if (!deferred) return;
      var d = deferred; deferred = null; btn.hidden = true; box.hidden = true;
      try { d.prompt(); if (d.userChoice && d.userChoice.then) d.userChoice.then(function () {}, function () {}); } catch (e) {}
    });
    return box;
  }
  function labels() {
    if (!box) return;
    var t = T[lang()];
    btn.textContent = t.btn; hint.textContent = t.ios;
  }
  function show() { if (!mount()) return; labels(); box.hidden = !(btn && !btn.hidden) && !(hint && !hint.hidden); }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    if (!mount()) return;
    btn.hidden = false; labels(); box.hidden = false;
  });
  window.addEventListener('appinstalled', function () { deferred = null; if (box) box.hidden = true; });

  function init() {
    if (isSafariIOS && mount()) { hint.hidden = false; labels(); box.hidden = false; }
    new MutationObserver(labels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
