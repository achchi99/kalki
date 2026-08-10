/* kalki.uz — natija kartochkasi ostidagi Telegram tugmasining tili.
 *
 * Tugmaning O'ZI HTML ichida statik turadi (#tgcta > a). Bu modul uni
 * YARATMAYDI — faqat joriy tilga qarab matnini almashtiradi. Sabab: tugma
 * prerender qilingan HTML'da bo'lishi kerak, aks holda u JS yuklanmaguncha
 * ko'rinmay turadi va Google uni statik holda ko'rmaydi.
 *
 * Ilgari bu tugma o'ram <div> siz yolg'iz <a> bo'lib turgan edi: inline
 * elementning vertikal padding'i satr balandligini oshirmaydi, shuning uchun
 * u ustidagi "Ma'lumot ... holatiga ko'ra" izohini 8.6 px qoplab turardi.
 */
(function (w, d) {
  'use strict';

  function lang() {
    return d.documentElement.lang === 'ru' ? 'ru' : 'uz';
  }

  function apply() {
    var els = d.querySelectorAll('[data-tg-uz]');
    var key = lang() === 'ru' ? 'data-tg-ru' : 'data-tg-uz';
    for (var i = 0; i < els.length; i++) {
      var v = els[i].getAttribute(key);
      if (v) els[i].textContent = v;
    }
  }

  // Til tugmasi — delegatsiya orqali: sahifaning o'z .onclick handleriga
  // tegilmaydi. Sahifa o'z renderini tugatishi uchun biroz kutamiz.
  d.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || (t.id !== 'langUz' && t.id !== 'langRu')) return;
    w.setTimeout(apply, 180);
  }, true);

  // lang.js saqlangan RU tilini kechikib qo'llaydi (360 va 900 ms) —
  // tugma matni ham o'sha bosqichlarda qayta o'qiladi.
  function init() {
    apply();
    [400, 950].forEach(function (ms) { w.setTimeout(apply, ms); });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();

  w.KalkiTgCta = { apply: apply };
})(window, document);
