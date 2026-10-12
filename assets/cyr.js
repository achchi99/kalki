/* kalki.uz — ЎЗ (o'zbek kirill) rejimi: sahifa BRAUZERDA lotindan kirillga o'giriladi.
 *
 * NEGA SHU YO'L. Statik /cyr/ juftligi faqat 4 sahifada bor va u yerda JS yo'q
 * (kalkulyator ishlamaydi). Qolgan 75 sahifa uchun ikkinchi HTML nusxa yaratish
 * indekslanadigan sahifalarni ikki baravar qilardi. Shuning uchun ЎЗ — shu sahifaning
 * o'zi, ?lang=cyr bilan ochilganda ko'rinadigan matn assets/translit.js (prerender
 * ishlatadigan o'sha modul) orqali o'giriladi. Canonical lotin sahifada qoladi.
 *
 * Bu modul faqat assets/lang.js ЎЗ rejimini tanlaganda yuklanadi (UZ/RU foydalanuvchilar
 * uchun bitta ortiqcha bayt ham yuklanmaydi).
 *
 * Tegilmaydi: <script>, <style>, textarea, [contenteditable], [data-cyr="skip"] va
 * input qiymatlari (foydalanuvchi yozgani). Dinamik matn (kalkulyator natijasi,
 * xato xabari) MutationObserver orqali o'giriladi; alert/confirm/prompt va
 * clipboard.writeText ham o'giriladi.
 *
 * Teskari yo'nalish (kirill -> lotin) QAYTA YUKLASH bilan: lang.js sahifani lotin
 * holatida qayta ochadi, shuning uchun asl matnni eslab qolish kerak emas.
 */
(function (w, d) {
  'use strict';
  if (w.KalkiCyr || !w.KalkiTranslit) return;
  var tr = w.KalkiTranslit.translit;
  var LAT = /[A-Za-z]/;
  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, TEMPLATE: 1 };
  var busy = false;

  function skipped(node) {
    for (var el = node.nodeType === 1 ? node : node.parentNode; el && el.nodeType === 1; el = el.parentNode) {
      if (SKIP_TAG[el.tagName]) return true;
      if (el.isContentEditable || el.getAttribute('data-cyr') === 'skip') return true;
    }
    return false;
  }
  function fixText(n) {
    var v = n.data;
    if (!v || !LAT.test(v) || skipped(n)) return;
    var o = tr(v);
    if (o !== v) n.data = o;
  }
  function fixAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var v = el.getAttribute(ATTRS[i]);
      if (v && LAT.test(v)) { var o = tr(v); if (o !== v) el.setAttribute(ATTRS[i], o); }
    }
  }
  function fixTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { fixText(root); return; }
    if (root.nodeType !== 1 || skipped(root)) return;
    fixAttrs(root);
    var tw = d.createTreeWalker(root, 5 /* TEXT | ELEMENT */, null);
    var n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 3) fixText(n);
      else if (n.nodeType === 1) fixAttrs(n);
    }
  }
  function fixTitle() {
    if (d.title && LAT.test(d.title)) { var o = tr(d.title); if (o !== d.title) d.title = o; }
  }

  /* ---- til tugmalari va <html> belgilari ---- */
  function mark() {
    var h = d.documentElement;
    if (h.lang !== 'uz') h.lang = 'uz';        // 'uz-Cyrl' emas: ai-ariza.js kabi modullar lang==='uz' ni kutadi
    if (h.getAttribute('data-script') !== 'cyr') h.setAttribute('data-script', 'cyr');
    var set = function (id, on) {
      var b = d.getElementById(id);
      if (b && b.classList.contains('on') !== on) b.classList.toggle('on', on);
      if (b && on) b.setAttribute('aria-current', 'true'); else if (b) b.removeAttribute('aria-current');
    };
    set('langUz', false); set('langRu', false); set('langCyr', true);
    // Til tugmalari HAR DOIM "UZ | ЎЗ | RU" (translit tegmaydi; sahifaning o'z skripti o'zgartirsa ham tiklanadi)
    [['langUz', 'UZ'], ['langCyr', 'ЎЗ'], ['langRu', 'RU']].forEach(function (p) {
      var b = d.getElementById(p[0]);
      if (b && b.textContent !== p[1]) b.textContent = p[1];
    });
  }

  function run(fn) {
    if (busy) return;
    busy = true;
    try { fn(); } catch (e) {} finally { busy = false; }
  }

  var mo = new MutationObserver(function (muts) {
    run(function () {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'characterData') fixText(m.target);
        else if (m.type === 'childList') {
          for (var j = 0; j < m.addedNodes.length; j++) fixTree(m.addedNodes[j]);
          if (m.target && m.target.nodeName === 'TITLE') fixTitle();
        } else if (m.type === 'attributes') {
          if (m.target === d.documentElement || (m.target.closest && m.target.closest('.lang-seg'))) mark();
          else fixAttrs(m.target);
        }
      }
      mo.takeRecords();     // o'z yozuvlarimiz qayta ishlanmasin
    });
  });

  function start() {
    run(function () { fixTree(d.body); fixTitle(); mark(); });
    mo.observe(d.documentElement, {
      subtree: true, childList: true, characterData: true,
      attributes: true, attributeFilter: ATTRS.concat(['class', 'lang'])
    });
    // sahifalar o'z til funksiyasini kechikib (~240 ms) qayta qo'llaydi: oxirgisi bizniki bo'lsin
    [360, 900].forEach(function (ms) { w.setTimeout(function () { run(function () { fixTree(d.body); fixTitle(); mark(); }); }, ms); });
  }

  /* ---- dasturiy chiqishlar ---- */
  ['alert', 'confirm', 'prompt'].forEach(function (k) {
    var orig = w[k];
    if (typeof orig !== 'function') return;
    w[k] = function (msg) {
      var a = Array.prototype.slice.call(arguments);
      if (typeof a[0] === 'string') a[0] = tr(a[0]);
      return orig.apply(w, a);
    };
  });
  try {
    var cb = w.navigator && w.navigator.clipboard;
    if (cb && typeof cb.writeText === 'function') {
      var wt = cb.writeText.bind(cb);
      cb.writeText = function (t) { return wt(typeof t === 'string' ? tr(t) : t); };
    }
  } catch (e) {}

  w.KalkiCyr = { translit: tr, refresh: function () { run(function () { fixTree(d.body); fixTitle(); mark(); }); } };

  if (d.body) start(); else d.addEventListener('DOMContentLoaded', start);
})(window, document);
