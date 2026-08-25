/* kalki.uz — til tanlovi butun sayt bo'ylab saqlanadi.
 *
 * Vazifa taqsimoti:
 *   bu modul  — QAYSI til ekanini hal qiladi, saqlaydi va qo'llashni boshlaydi;
 *   sahifa    — o'zining applyLang() funksiyasi bilan matnni QANDAY chizishni biladi.
 *
 * Sahifalarning til funksiyasi ko'chirilmagan: u har sahifada boshqacha ish
 * qiladi (buildSections, renderResult, seoBlock, document.title, FAQ sxemasi).
 * Shuning uchun modul mavjud #langUz / #langRu tugmasini bosish orqali
 * sahifaning o'z renderini ishga tushiradi — qaror bitta joyda qoladi.
 */
(function (w, d) {
  'use strict';
  if (w.KalkiLang) return;              // idempotent: ikki marta ulansa ham bitta nusxa

  var KEY = 'kalki_lang';
  var OLD_KEYS = ['lang', 'siteLang', 'kalki-lang', 'site_lang'];

  function ls(fn, dflt) {
    try { return fn(); } catch (e) { return dflt; }   // localStorage bloklangan bo'lishi mumkin
  }
  function read() {
    return ls(function () { return localStorage.getItem(KEY); }, null);
  }
  function write(l) {
    ls(function () { localStorage.setItem(KEY, l); });
  }
  function valid(l) { return l === 'ru' || l === 'uz'; }

  // Eski kalitlardan bir martalik ko'chirish: hozirgi foydalanuvchi tanlovini yo'qotmasin.
  function migrate() {
    if (read()) return;
    for (var i = 0; i < OLD_KEYS.length; i++) {
      var v = ls(function () { return localStorage.getItem(OLD_KEYS[i]); }, null);
      if (valid(v)) { write(v); return; }
    }
  }

  function fromUrl() {
    var m = /[?&]lang=(uz|ru)\b/.exec(w.location.search || '');
    return m ? m[1] : null;
  }
  function fromBrowser() {
    var n = (w.navigator && (w.navigator.language || w.navigator.userLanguage)) || '';
    return String(n).slice(0, 2).toLowerCase() === 'ru' ? 'ru' : 'uz';
  }

  // /ru/... yo'li — alohida RU URL'ga ega sahifalar uchun (Variant A).
  // Faqat "/ru/" ostida bo'lsa RU qaytaradi; aks holda null — bu boshqa
  // barcha sahifalarning eski (localStorage'ga asoslangan) xatti-harakatini
  // buzmasligi uchun muhim.
  function fromPath() {
    return /^\/ru(\/|$)/.test(w.location.pathname) ? 'ru' : null;
  }
  // Sahifa qaysi tilda diskda "muzlatilgan": /ru/... bo'lsa ru, aks holda uz.
  function diskLang() {
    return fromPath() === 'ru' ? 'ru' : 'uz';
  }
  // Bu sahifaning boshqa til versiyasi haqiqatan mavjudmi (prerender
  // tomonidan qo'yilgan belgi — Variant A migratsiyasidan o'tgan sahifalar).
  function hasRuPair() {
    return d.documentElement.hasAttribute('data-ru-page');
  }
  // Joriy sahifaning BOSHQA til URL'i (yo'l almashtiriladi, query/hash saqlanadi —
  // masalan kalkulyator holatini uzatuvchi ?p= tilga bog'liq emas).
  function crossLangUrl(targetLang) {
    var p = w.location.pathname;
    var isRu = fromPath() === 'ru';
    var rest = isRu ? p.replace(/^\/ru/, '') : p;
    if (!rest) rest = '/';
    var target = targetLang === 'ru' ? ('/ru' + rest) : rest;
    return target + (w.location.search || '') + (w.location.hash || '');
  }

  // ?lang= > /ru/ yo'li > saqlangan qiymat > brauzer tili > uz
  function decide() {
    var u = fromUrl();
    if (u) { write(u); return u; }
    var p = fromPath();
    if (p) { write(p); return p; }
    migrate();
    var s = read();
    if (valid(s)) return s;
    return fromBrowser();
  }

  function markHtml(l) {
    var h = d.documentElement;
    h.setAttribute('data-lang', l);
    h.lang = l;
  }

  // Dasturiy bosish foydalanuvchi bosishidan ajratilishi kerak: aks holda
  // avtomatik tiklanishda ham lang_switch hodisasi yuborilib ketadi.
  var programmatic = false;

  // Sahifaning o'z renderini ishga tushiramiz. Tugma .onclick bilan bog'langan
  // (49/49 sahifada), shuning uchun bosish — universal va xavfsiz yo'l.
  function paint(l) {
    var b = d.getElementById(l === 'ru' ? 'langRu' : 'langUz');
    if (!b || !b.click) return false;
    programmatic = true;
    try { b.click(); } finally { programmatic = false; }
    return true;
  }

  var userChose = false;

  var API = {
    getLang: function () {
      var s = read();
      return valid(s) ? s : fromBrowser();
    },
    setLang: function (l, opts) {
      if (!valid(l)) return;
      opts = opts || {};
      write(l);
      // Alohida RU URL'ga ega sahifada boshqa tilga o'tish — repaint emas,
      // haqiqiy navigatsiya (Variant A: /ru/... mustaqil indekslanadigan URL).
      if (hasRuPair() && l !== diskLang()) {
        if (opts.user) {
          userChose = true;
          try { if (typeof gtag === 'function') gtag('event', 'lang_switch', { lang: l }); } catch (e0) {}
        }
        w.location.href = crossLangUrl(l);
        return;
      }
      markHtml(l);
      if (!opts.silent) paint(l);
      if (opts.user) {
        userChose = true;
        try { if (typeof gtag === 'function') gtag('event', 'lang_switch', { lang: l }); } catch (e) {}
      }
    },
    applyLang: function (l) { markHtml(l); paint(l); }
  };
  w.KalkiLang = API;

  // Foydalanuvchi tugmani bosganda: saqlaymiz va GA yuboramiz.
  // Delegatsiya — har sahifada alohida yozilmasin. Sahifaning o'z .onclick
  // handleri ham ishlayveradi, biz uni bekor qilmaymiz — FAQAT RU-juftlikka
  // ega bo'lmagan sahifalarda (aks holda navigatsiyadan oldin keraksiz
  // repaint chaqiriladi).
  d.addEventListener('click', function (e) {
    if (programmatic) return;                 // avtomatik tiklanish — bu tanlov emas
    var t = e.target;
    if (!t || !t.id) return;
    if (t.id !== 'langUz' && t.id !== 'langRu') return;
    var l = t.id === 'langRu' ? 'ru' : 'uz';
    if (hasRuPair() && l !== diskLang()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      userChose = true;
      write(l);
      try { if (typeof gtag === 'function') gtag('event', 'lang_switch', { lang: l }); } catch (e3) {}
      w.location.href = crossLangUrl(l);
      return;
    }
    userChose = true;
    write(l);
    markHtml(l);
    try { if (typeof gtag === 'function') gtag('event', 'lang_switch', { lang: l }); } catch (e2) {}
  }, true);   // capture: sahifa handleridan oldin saqlaymiz

  function ready() {
    var l = decide();
    markHtml(l);
    var disk = diskLang();
    // Diskdagi holat allaqachon shu tilda bo'lsa, hech narsa qilish shart emas.
    if (l !== disk) paint(l);
    d.documentElement.setAttribute('data-lang-ready', '1');

    // Sahifalarda bir qism tinglovchilar kechikib bog'lanadi
    // (tmlang, artlang, bcjs, faqschema, docgen — setTimeout ~240 ms).
    // Ular ham to'g'ri tilni olishi uchun qayta qo'llaymiz. Bosish
    // takrorlansa ham natija bir xil, foydalanuvchi o'zi tanlagan bo'lsa
    // aralashmaymiz.
    [360, 900].forEach(function (ms) {
      w.setTimeout(function () {
        if (userChose) return;
        var cur = API.getLang();
        if (cur === disk) return;
        paint(cur);
      }, ms);
    });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', ready);
  else ready();
})(window, document);
