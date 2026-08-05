/* kalki.uz — natija blokidan keyingi "ma'lumot qaysi sanaga tegishli" izohi.
 *
 * SANA BITTA JOYDA TURADI: keyingi safar faqat quyidagi DATA_DATE o'zgartiriladi
 * va u 36 ta kalkulyator/generator sahifasida bir vaqtda yangilanadi.
 *
 * Bu izoh narx, stavka yoki muddat ko'rsatmaydi — u faqat sahifadagi mantiq
 * qaysi davrga qarab tuzilganini aytadi.
 */
(function (w, d) {
  'use strict';

  var DATA_DATE = {
    uz: "Ma'lumot 2026-yil avgust holatiga ko'ra",
    ru: "Данные по состоянию на август 2026 года"
  };

  var ID = 'datanote';
  var STYLE = 'margin-top:10px;font-size:12px;line-height:1.45;color:#8A968F;font-weight:600';

  function lang() {
    return d.documentElement.lang === 'ru' ? 'ru' : 'uz';
  }

  // Izoh natija blokidan keyin turadi. Natija bloki bo'lmagan sahifalarda
  // (dtm, kaloriya, yer-konvertor) SEO matnidan oldingi joy o'sha o'rinni beradi.
  function anchor() {
    var rc = d.querySelectorAll('.receipt, #receipt');
    if (rc.length) return { node: rc[rc.length - 1], before: false };
    var seo = d.getElementById('seoBlock');
    if (seo) return { node: seo, before: true };
    return null;
  }

  // Guard faqat ELEMENT YARATISHNI o'tkazib yuboradi: prerender qilingan
  // sahifada element allaqachon HTML ichida bo'ladi, uni qayta yaratmaymiz —
  // lekin matn qo'yish va til tinglovchisi baribir ishlaydi.
  function ensure() {
    var el = d.getElementById(ID);
    if (el) return el;
    var a = anchor();
    if (!a) return null;
    el = d.createElement('div');
    el.id = ID;
    el.className = 'datanote noprint';
    el.setAttribute('style', STYLE);
    if (a.before) a.node.parentNode.insertBefore(el, a.node);
    else a.node.parentNode.insertBefore(el, a.node.nextSibling);
    return el;
  }

  function apply() {
    var el = ensure();
    if (el) el.textContent = DATA_DATE[lang()];
  }

  // Til tugmasi — delegatsiya orqali, sahifaning o'z .onclick handleriga
  // tegmaymiz. Sahifa o'z renderini tugatishi uchun biroz kutamiz.
  d.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.id) return;
    if (t.id !== 'langUz' && t.id !== 'langRu') return;
    w.setTimeout(apply, 180);
  }, true);

  // lang.js saqlangan RU tilini kechikib qo'llaydi (360 va 900 ms) —
  // izoh ham o'sha bosqichlarda qayta o'qiladi.
  function init() {
    apply();
    [400, 950].forEach(function (ms) { w.setTimeout(apply, ms); });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();

  w.KalkiDataNote = { apply: apply, date: DATA_DATE };
})(window, document);
