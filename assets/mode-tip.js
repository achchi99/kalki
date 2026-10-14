/* kalki.uz — rejimli kalkulyatorlarda faol rejim ostida bir qatorli izoh (data/qadamlar.json "modes").
 * Faol tugma — `.on`. Til: html[data-lang] (ru) yoki data-script=cyr (translit). jsdom (prerender)da ishlamaydi. */
(function () {
  'use strict';
  if (/jsdom/i.test(navigator.userAgent)) return;
  var slug = location.pathname.replace(/^\/(ru\/)?/, '').replace(/\.html$/, '').replace(/\/$/, '');
  if (!slug) return;
  function lang() { var h = document.documentElement; return h.getAttribute('data-lang') === 'ru' ? 'ru' : 'uz'; }
  function cyr(s) { var K = window.KalkiTranslit; return document.documentElement.getAttribute('data-script') === 'cyr' && K && K.translit ? K.translit(s) : s; }
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
      new MutationObserver(upd).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang', 'data-script'] });
      upd();
    });
  }).catch(function () {});
})();
