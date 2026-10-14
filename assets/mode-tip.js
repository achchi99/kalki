/* kalki.uz — rejimli kalkulyatorlarda faol rejim ostida bir qatorli izoh (data/qadamlar.json "modes").
 * Faol tugma — `.on`. Til: faqat URL (/ru/, ?lang=). jsdom (prerender)da ishlamaydi. */
(function () {
  'use strict';
  if (/jsdom/i.test(navigator.userAgent)) return;
  var slug = location.pathname.replace(/^\/(ru\/)?/, '').replace(/\.html$/, '').replace(/\/$/, '');
  if (!slug) return;
  /* Til — sahifaning O'Z tilidan (URL), localStorage'dan emas: /ru/ yo'li yoki ?lang=ru -> RU; ?lang=cyr -> ЎЗ (translit); aks holda UZ. */
  var Q = /[?&]lang=(uz|ru|cyr)\b/.exec(location.search || ''), RU_PATH = /^\/ru(\/|$)/.test(location.pathname);
  var LANG = Q ? Q[1] : (RU_PATH ? 'ru' : 'uz');
  function lang() { return LANG === 'ru' ? 'ru' : 'uz'; }
  function cyr(s) { var K = window.KalkiTranslit; return LANG === 'cyr' && K && K.translit ? K.translit(s) : s; }
  fetch('/data/qadamlar.json').then(function (r) { return r.json(); }).then(function (D) {
    var groups = (D.modes || {})[slug]; if (!groups) return;
    groups.forEach(function (g) {
      var box = document.querySelectorAll(g.sel)[g.idx]; if (!box) return;
      var p = document.createElement('p'); p.className = 'mode-tip'; p.setAttribute('data-lf-skip', '');
      box.parentNode.insertBefore(p, box.nextSibling);
      function upd() {
        var btns = box.querySelectorAll('button'), i = 0;
        for (var k = 0; k < btns.length; k++) if (btns[k].classList.contains('on') || btns[k].getAttribute('aria-selected') === 'true') { i = k; break; }
        var t = g.tips[i] || g.tips[0]; p.textContent = cyr(t[lang()] || t.uz);
      }
      box.addEventListener('click', function () { setTimeout(upd, 0); });
      upd();
    });
  }).catch(function () {});
})();
