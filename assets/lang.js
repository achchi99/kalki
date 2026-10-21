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
  function valid(l) { return l === 'ru' || l === 'uz' || l === 'cyr'; }

  // Eski kalitlardan bir martalik ko'chirish: hozirgi foydalanuvchi tanlovini yo'qotmasin.
  function migrate() {
    if (read()) return;
    for (var i = 0; i < OLD_KEYS.length; i++) {
      var v = ls(function () { return localStorage.getItem(OLD_KEYS[i]); }, null);
      if (valid(v)) { write(v); return; }
    }
  }

  function fromUrl() {
    var m = /[?&]lang=(uz|ru|cyr)\b/.exec(w.location.search || '');
    return m ? m[1] : null;
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
  function stripLangParam(search) {
    var q = (search || '').replace(/^\?/, '').split('&').filter(function (x) { return x && !/^lang=/.test(x); });
    return q;
  }
  // ЎЗ rejimi: shu sahifaning o'zi, ?lang=cyr bilan (yangi sahifa YO'Q).
  // ЎЗ'dan chiqishda tanlov URL'da aniq yoziladi (localStorage bloklangan bo'lsa ham to'g'ri o'tadi).
  function crossLangUrl(targetLang) {
    var p = w.location.pathname;
    var isRu = fromPath() === 'ru';
    var rest = isRu ? p.replace(/^\/ru/, '') : p;
    if (!rest) rest = '/';
    var ruPath = targetLang === 'ru' && (isRu || hasRuPair());   // RU juftligi bo'lmasa /ru/ 404 bo'lardi
    var target = ruPath ? ('/ru' + rest) : rest;
    var q = stripLangParam(w.location.search);
    if (targetLang === 'cyr' || (isCyr() && !ruPath)) q.push('lang=' + targetLang);
    return target + (q.length ? '?' + q.join('&') : '') + (w.location.hash || '');
  }
  function cleanUrl() {
    if (!fromUrl()) return;
    try {
      var q = stripLangParam(w.location.search);
      w.history.replaceState(null, '', w.location.pathname + (q.length ? '?' + q.join('&') : '') + (w.location.hash || ''));
    } catch (e) {}
  }
  // Hozir ЎЗ rejimi yoqilganmi (head'dagi langboot yoki ready() qo'ygan belgi)
  function isCyr() { return d.documentElement.getAttribute('data-script') === 'cyr'; }
  var cyrLoading = false;
  function loadCyr() {
    if (cyrLoading || w.KalkiCyr) return;
    cyrLoading = true;
    ['/assets/translit.js', '/assets/cyr.js'].forEach(function (src) {
      var sc = d.createElement('script');
      sc.src = src;
      sc.async = false;                     // tartib: translit.js, keyin cyr.js
      d.head.appendChild(sc);
    });
  }

  // KalkiFit (<html data-lang-auto>): saqlangan tanlov YO'Q bo'lsa — telefon/brauzer tiliga qarab: ru* → RU, uz-Cyrl → ЎЗ, qolgani → UZ.
  // Faqat shu ilova uchun (qolgan sahifalar pastdagi qoidada qoladi); avtomatik natija SAQLANMAYDI — foydalanuvchi o'zi tanlagach saqlanadi va o'sha qoladi.
  function autoLang() {
    if (!d.documentElement.hasAttribute('data-lang-auto')) return null;
    var n = String((w.navigator && w.navigator.language) || '').toLowerCase();
    if (/^ru(-|_|$)/.test(n)) return 'ru';
    if (/^uz/.test(n) && /cyrl/.test(n)) return 'cyr';
    return null;
  }

  // ?lang= > /ru/ yo'li > saqlangan qiymat > uz (birinchi tashrifda hech qachon
  // brauzer/qurilma tiliga qarab avtomatik RU tanlanmaydi — 2026-09'da real
  // foydalanuvchi buni bug sifatida xabar qilgan: yangi brauzerdan kalki.uz'ga
  // kirilganda ham, Google orqali kirilganda ham standart RU ochilib qolgan
  // edi. Standart til FAQAT foydalanuvchi o'zi til tugmasini bosgach o'zgaradi.)
  function decide() {
    var u = fromUrl();
    if (u) { write(u); return u; }
    var p = fromPath();
    if (p) { write(p); return p; }
    migrate();
    var s = read();
    if (valid(s)) return s;
    return autoLang() || 'uz';
  }

  function markHtml(l) {
    var h = d.documentElement;
    if (l === 'cyr') {                      // sahifaning ichki tili — uz; faqat yozuv kirill
      h.setAttribute('data-lang', 'uz');
      h.setAttribute('data-script', 'cyr');
      h.lang = 'uz';        // atayin 'uz-Cyrl' EMAS: sahifa modullari (masalan AI ariza yordamchisi) lang==='uz' ni kutadi
      return;
    }
    h.setAttribute('data-lang', l);
    h.removeAttribute('data-script');
    h.lang = l;
  }

  // Dasturiy bosish foydalanuvchi bosishidan ajratilishi kerak: aks holda
  // avtomatik tiklanishda ham lang_switch hodisasi yuborilib ketadi.
  var programmatic = false;

  // Sahifaning o'z renderini ishga tushiramiz. Tugma .onclick bilan bog'langan
  // (49/49 sahifada), shuning uchun bosish — universal va xavfsiz yo'l.
  function paint(l) {
    var b = d.getElementById(l === 'ru' ? 'langRu' : 'langUz');   // 'cyr' ham ichki uz
    if (!b || !b.click) return false;
    programmatic = true;
    try { b.click(); } finally { programmatic = false; }
    return true;
  }

  var userChose = false;

  var API = {
    getLang: function () {
      var s = read();
      return valid(s) ? s : 'uz';
    },
    setLang: function (l, opts) {
      if (!valid(l)) return;
      opts = opts || {};
      write(l);
      if (l === 'cyr' || isCyr()) {
        if (opts.user) {
          userChose = true;
          try { if (typeof gtag === 'function') gtag('event', 'lang_switch', { lang: l }); } catch (e00) {}
        }
        if (l === 'cyr' && isCyr() && fromPath() !== 'ru') return;
        w.location.href = crossLangUrl(l);
        return;
      }
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
    if (t.id !== 'langUz' && t.id !== 'langRu' && t.id !== 'langCyr') return;
    var l = t.id === 'langRu' ? 'ru' : t.id === 'langCyr' ? 'cyr' : 'uz';
    // ЎЗ: oddiy <a href> (JS'siz ham ishlaydi); bu yerda faqat tanlovni saqlab, holat (?p=) ni olib o'tamiz.
    // ЎЗ'dan UZ/RU ga o'tish — qayta yuklash: o'girilgan matn lotinga qaytishi uchun.
    if (l === 'cyr' || isCyr()) {
      if (l === 'cyr' && isCyr() && fromPath() !== 'ru') { e.preventDefault(); return; }
      e.preventDefault();
      e.stopImmediatePropagation();
      userChose = true;
      write(l);
      try { if (typeof gtag === 'function') gtag('event', 'lang_switch', { lang: l }); } catch (e4) {}
      w.location.href = crossLangUrl(l);
      return;
    }
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
    cleanUrl();     // joyida almashganda eski ?lang= qolib, qayta yuklashda tanlovni buzmasin
    try { if (typeof gtag === 'function') gtag('event', 'lang_switch', { lang: l }); } catch (e2) {}
  }, true);   // capture: sahifa handleridan oldin saqlaymiz

  function ready() {
    var l = decide();
    var disk = diskLang();
    // /ru/... sahifada ?lang=cyr: lotin juftiga o'tib, ЎЗ rejimini yoqamiz
    if (l === 'cyr' && disk === 'ru') { w.location.replace(crossLangUrl('cyr')); return; }
    markHtml(l);
    if (l === 'cyr') loadCyr();
    var pl = l === 'cyr' ? 'uz' : l;
    // Diskdagi holat allaqachon shu tilda bo'lsa, hech narsa qilish shart emas.
    if (pl !== disk) paint(pl);
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
        if (cur === 'cyr') cur = 'uz';
        if (cur === disk) return;
        paint(cur);
      }, ms);
    });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', ready);
  else ready();
})(window, document);
