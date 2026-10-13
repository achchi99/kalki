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

  /* Mavjud iste'molga (base, kVt·soat) QO'SHILGAN qurilma (add, kVt·soat) uchun qo'shimcha to'lov:
   *   cost = to'lov(base + add) − to'lov(base)
   * Pog'onali tarifda qurilma uyning mavjud sarfi ustiga tushadi, shuning uchun uning 1 kVt·soati bitta narx emas.
   * Qaytaradi: { cat, base, add, baseTotal, total, cost, effective (so'm/kVt·soat, o'rtacha), rows } —
   * rows: qurilma sarfi tushgan pog'onalar ([{ idx, from, to, kwh, price, cost }], faqat qurilma ulushi). */
  function incremental(base, add, cat) {
    var a = tiers(base, cat), b = tiers(Number(base > 0 ? base : 0) + Number(add > 0 ? add : 0), cat);
    var rows = [];
    for (var i = 0; i < b.rows.length; i++) {
      var r = b.rows[i], before = 0;
      for (var j = 0; j < a.rows.length; j++) if (a.rows[j].idx === r.idx) before = a.rows[j].kwh;
      var part = r.kwh - before;
      if (part > 1e-9) rows.push({ idx: r.idx, from: r.from, to: r.to, kwh: part, price: r.price, cost: Math.round(part * r.price) });
    }
    var addKwh = add > 0 ? Number(add) : 0, cost = b.total - a.total;
    return { cat: b.cat, base: a.kwh, add: addKwh, baseTotal: a.total, total: b.total, cost: cost, effective: addKwh > 0 ? cost / addKwh : 0, rows: rows };
  }

  /* Quyosh paneli: uy sarfi (house, kVt·soat/oy) va panel ishlab chiqargani (gen, kVt·soat/oy).
   * Panel ENG QIMMAT pog'onadagi sarfni birinchi bo'lib qoplaydi: tejash = to'lov(uy) − to'lov(uy − qoplangani).
   *   covered = min(uy, panel); surplus = max(0, panel − uy)  (ortiqcha tejashga kirmaydi; sotish narxi qarorda YO'Q)
   * Qaytaradi: { cat, house, gen, covered, surplus, before, after, saving, effective (so'm/kVt·soat), rows } —
   * rows: panel qoplagan pog'onalar ([{ idx, from, to, kwh, price, cost }], pastdan yuqoriga). */
  function saving(house, gen, cat) {
    var H = house > 0 ? Number(house) : 0, G = gen > 0 ? Number(gen) : 0;
    var covered = Math.min(H, G), surplus = Math.max(0, G - H);
    var a = tiers(H, cat), b = tiers(H - covered, cat);
    var rows = [];
    for (var i = 0; i < a.rows.length; i++) {
      var r = a.rows[i], left = 0;
      for (var j = 0; j < b.rows.length; j++) if (b.rows[j].idx === r.idx) left = b.rows[j].kwh;
      var part = r.kwh - left;
      if (part > 1e-9) rows.push({ idx: r.idx, from: r.from, to: r.to, kwh: part, price: r.price, cost: Math.round(part * r.price) });
    }
    var save = a.total - b.total;
    return { cat: a.cat, house: a.kwh, gen: G, covered: covered, surplus: surplus, before: a.total, after: b.total, saving: save, effective: covered > 0 ? save / covered : 0, rows: rows };
  }

  return { data: DATA, tiers: tiers, incremental: incremental, saving: saving };
});
