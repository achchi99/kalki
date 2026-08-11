/* kalki.uz — footerdagi huquqiy havolalar va mualliflik qatorining tili.
 *
 * MUAMMO NIMADA EDI. #legal-links bloki 56 sahifada ham to'g'ridan-to'g'ri
 * HTML'ga yozilgan, lekin unda HECH QANDAY i18n atributi yo'q edi: na
 * data-i, na data-*-uz/ru. Sahifalarning o'z applyLang() funksiyasi faqat
 * [data-i] elementlarini aylanib chiqadi, shuning uchun bu blokni umuman
 * ko'rmasdi. Ya'ni sabab "til almashganda footer qayta render bo'lmayapti"
 * emas — kalitlar mavjud emas edi. Mualliflik qatori esa ikki tilni bitta
 * satrda saqlardi ("Achchi loyihasi · Проект Achchi"), ya'ni RU rejimda ham
 * o'zbekchasi, UZ rejimda ham ruschasi ko'rinib turardi.
 *
 * Bu modul elementlarni YARATMAYDI — ular prerender qilingan HTML'da
 * statik turishi kerak. U faqat joriy tilga qarab matnni qo'yadi.
 */
(function (w, d) {
  'use strict';

  function lang() {
    return d.documentElement.lang === 'ru' ? 'ru' : 'uz';
  }

  function apply() {
    var key = lang() === 'ru' ? 'data-lf-ru' : 'data-lf-uz';
    var els = d.querySelectorAll('[data-lf-uz]');
    for (var i = 0; i < els.length; i++) {
      var v = els[i].getAttribute(key);
      if (v) els[i].textContent = v;
    }
  }

  // Til tugmasi — delegatsiya orqali, sahifaning o'z .onclick handleriga
  // tegmaymiz. Sahifa o'z renderini tugatishi uchun biroz kutamiz.
  d.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || (t.id !== 'langUz' && t.id !== 'langRu')) return;
    w.setTimeout(apply, 180);
  }, true);

  // lang.js saqlangan RU tilini kechikib qo'llaydi (360 va 900 ms) —
  // footer ham o'sha bosqichlarda qayta o'qiladi.
  function init() {
    apply();
    [400, 950].forEach(function (ms) { w.setTimeout(apply, ms); });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();

  w.KalkiFooterLang = { apply: apply };
})(window, document);
