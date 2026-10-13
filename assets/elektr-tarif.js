/* kalki.uz — aholi uchun POG'ONALI elektr tarifi (2026-yil 1-iyundan).
 *
 * BITTA MANBA: sahifa (elektr-xarajat-kalkulyator), uning SEO/FAQ matni, testlar (tools/test-elektr-tarif.js,
 * tools/dizayn/test-elektr.mjs) va tekshiruv bandi (tools/verify-all.js) shu fayldagi raqamlarni oladi —
 * narx bir joyda o'zgaradi, matn bilan ajralib ketmaydi.
 *
 * MANBA: Vazirlar Mahkamasining 2026-yil 15-maydagi 243-son qarori, 1-ilova, I bo'lim "Elektr energiyasi":
 *   1.2.1 — ovqat tayyorlash uchun markazlashgan elektr plitalar bilan jihozlangan ko'p kvartirali uylar va
 *           yotoqxonalarda yashaydigan maishiy iste'molchilar (stove);
 *   1.2.2 — qolgan maishiy iste'molchilar (std).
 * Narxlar QQS hisobga olingan holda, so'm/kVt·soat; qaror matnidan (lex.uz xom HTML) 2026-10-13 da tekshirilgan,
 * gov.uz/minenergy xabari 3 pog'onani, buxgalter.uz esa 1000 kVt·soatdan yuqori pog'onalarni tasdiqlaydi.
 *
 * DIQQAT (aniqlanmagan nuqta): qaror matni pog'ona qanday qo'llanishini (faqat oshgan qismigami yoki butun
 * hajm bitta narxdami) aniq aytmaydi — faqat "bir oydagi iste'moldan kelib chiqib". Kalkulyator pog'onama-pog'ona
 * (har bir pog'ona doirasidagi qism o'z narxida) hisoblaydi: 350 kVt·soat = 200×650 + 150×900. Rasmiy usul
 * aniqlansa, faqat tiers() ni o'zgartirish kifoya.
 *
 * Brauzerda window.KalkiElektrTarif, Node'da require() — ikkalasida bir xil. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KalkiElektrTarif = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DATA = {
    qaror: { uz: 'Vazirlar Mahkamasining 2026-yil 15-maydagi 243-son qarori', ru: 'Постановление Кабинета Министров от 15 мая 2026 года № 243' },
    url: 'https://lex.uz/uz/docs/-8195731',
    amalda: '2026-06-01',          // kuchga kirgan sana
    tekshirilgan: '2026-10-13',    // qaror matnidan raqamlar oxirgi marta tekshirilgan sana
    // Oylik iste'mol chegaralari (kVt·soat): 200 gacha, 201–500, 501–1 000, 1 001–5 000, 5 001–10 000, 10 001 va undan yuqori
    limits: [200, 500, 1000, 5000, 10000, Infinity],
    // so'm/kVt·soat (QQS bilan)
    prices: {
      std:   [650, 900, 1100, 1600, 1900, 2200],     // 1.2.2 — qolgan maishiy iste'molchilar
      stove: [325, 450, 550, 800, 950, 1100]         // 1.2.1 — elektr plitali ko'p kvartirali uy / yotoqxona
    }
  };

  /* kwh — oylik jami iste'mol; cat — 'std' | 'stove'.
   * Qaytaradi: { cat, kwh, total, rows:[{ idx, from, to, kwh, price, cost }] } — faqat iste'mol tushgan pog'onalar.
   * Har bir pog'ona summasi so'mga yaxlitlanadi, jami = yaxlitlangan qatorlar yig'indisi (ekrandagi qatorlar
   * yig'indisi jamiga aynan teng bo'lsin). */
  function tiers(kwh, cat) {
    var prices = DATA.prices[cat] || DATA.prices.std;
    kwh = Number(kwh);
    var out = { cat: DATA.prices[cat] ? cat : 'std', kwh: kwh > 0 ? kwh : 0, total: 0, rows: [] };
    if (!(kwh > 0)) return out;
    var prev = 0;
    for (var i = 0; i < DATA.limits.length && prev < kwh; i++) {
      var upTo = Math.min(kwh, DATA.limits[i]);
      var part = upTo - prev;
      if (part > 0) {
        var cost = Math.round(part * prices[i]);
        out.rows.push({ idx: i, from: i === 0 ? 0 : DATA.limits[i - 1] + 1, to: DATA.limits[i], kwh: part, price: prices[i], cost: cost });
        out.total += cost;
      }
      prev = DATA.limits[i];
    }
    return out;
  }

  return { data: DATA, tiers: tiers };
});
