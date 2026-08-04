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

  // ?lang= > saqlangan qiymat > brauzer tili > uz
  function decide() {
    var u = fromUrl();
    if (u) { write(u); return u; }
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
  // handleri ham ishlayveradi, biz uni bekor qilmaymiz.
  d.addEventListener('click', function (e) {
    if (programmatic) return;                 // avtomatik tiklanish — bu tanlov emas
    var t = e.target;
    if (!t || !t.id) return;
    if (t.id !== 'langUz' && t.id !== 'langRu') return;
    var l = t.id === 'langRu' ? 'ru' : 'uz';
    userChose = true;
    write(l);
    markHtml(l);
    try { if (typeof gtag === 'function') gtag('event', 'lang_switch', { lang: l }); } catch (e2) {}
  }, true);   // capture: sahifa handleridan oldin saqlaymiz

  function ready() {
    var l = decide();
    markHtml(l);
    // UZ — diskdagi holat, hech narsa qilish shart emas.
    if (l === 'ru') paint('ru');
    d.documentElement.setAttribute('data-lang-ready', '1');

    // Sahifalarda bir qism tinglovchilar kechikib bog'lanadi
    // (tmlang, artlang, bcjs, faqschema, docgen — setTimeout ~240 ms).
    // Ular ham RU ni olishi uchun qayta qo'llaymiz. Bosish takrorlansa ham
    // natija bir xil, foydalanuvchi o'zi tanlagan bo'lsa aralashmaymiz.
    [360, 900].forEach(function (ms) {
      w.setTimeout(function () {
        if (userChose) return;
        if (API.getLang() !== 'ru') return;
        paint('ru');
      }, ms);
    });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', ready);
  else ready();
})(window, document);
