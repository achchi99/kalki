/* kalki.uz — kalkulyator sahifasi (V2): natija kartasi faqat sig'sa yopishqoq bo'ladi.
 *
 * Shart: (a) kenglik >= 1024px va (b) karta balandligi <= ekran balandligi − sarlavha (64px) − 32px.
 * Aks holda karta oddiy (statik) — "osilib qolmaydi" va pastki qismi kesilmaydi. Karta o'z ustunidan (.res-col,
 * u grid qatorlarining butun balandligini egallaydi) hech qachon chiqmaydi: yopishqoqlik CSS'da .res-col.is-sticky.
 * Natija o'zgarganda (qatorlar soni) ResizeObserver qayta hisoblaydi.
 */
(function (w, d) {
  'use strict';
  /* skelet: id'siz nusxalar (data-skel-src) matnini asl element bilan sinxron saqlaydi (til almashganda ham) */
  function syncSkel() {
    var els = d.querySelectorAll('[data-skel-src]');
    Array.prototype.forEach.call(els, function (el) {
      var src = d.getElementById(el.getAttribute('data-skel-src'));
      if (!src) return;
      var put = function () { if (el.textContent !== src.textContent) el.textContent = src.textContent; };
      put();
      if (w.MutationObserver) new w.MutationObserver(put).observe(src, { childList: true, characterData: true, subtree: true });
    });
  }
  syncSkel();
  var col = d.querySelector('.calc-grid .res-col');
  var card = col && col.querySelector('.receipt');
  if (!col || !card || !w.matchMedia) return;
  var mq = w.matchMedia('(min-width:1024px)');
  var HDR = 64, GAP = 32;

  function update() {
    var fits = card.offsetHeight <= w.innerHeight - HDR - GAP;
    col.classList.toggle('is-sticky', mq.matches && fits);
  }

  if (w.ResizeObserver) new w.ResizeObserver(update).observe(card);
  if (mq.addEventListener) mq.addEventListener('change', update); else if (mq.addListener) mq.addListener(update);
  w.addEventListener('resize', update);
  update();
})(window, document);
