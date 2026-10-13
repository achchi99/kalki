/* kalki.uz — pog'onali tarif hisobining UMUMIY yadrosi (elektr va gaz uchun).
 *
 * Narxlar va chegaralar bu yerda YO'Q: ular assets/elektr-tarif.js va assets/gaz-tarif.js da (har biri o'z manbasi bilan).
 * Bu fayl faqat hisob qoidasini biladi — pog'onama-pog'ona: har bir pog'ona doirasidagi miqdor o'z narxida.
 *
 * tiers(amount, limits, prices) -> { amount, total, rows:[{ idx, from, to, qty, price, cost }] }
 *   limits — har pog'onaning yuqori chegarasi (oxirgisi Infinity), prices — shu pog'onalar narxi.
 *   Har pog'ona summasi so'mga yaxlitlanadi, jami = yaxlitlangan qatorlar yig'indisi
 *   (ekrandagi qatorlar yig'indisi jamiga aynan teng bo'lsin).
 *   Faqat miqdor tushgan pog'onalar qaytadi.
 *
 * Brauzerda window.KalkiTarifCore, Node'da require() — ikkalasida bir xil. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KalkiTarifCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function tiers(amount, limits, prices) {
    amount = Number(amount);
    var out = { amount: amount > 0 ? amount : 0, total: 0, rows: [] };
    if (!(amount > 0)) return out;
    var prev = 0;
    for (var i = 0; i < limits.length && prev < amount; i++) {
      var upTo = Math.min(amount, limits[i]);
      var part = upTo - prev;
      if (part > 0) {
        var cost = Math.round(part * prices[i]);
        out.rows.push({ idx: i, from: i === 0 ? 0 : limits[i - 1] + 1, to: limits[i], qty: part, price: prices[i], cost: cost });
        out.total += cost;
      }
      prev = limits[i];
    }
    return out;
  }

  return { tiers: tiers };
});
