/* kalki.uz — aholi uchun tabiiy gazning POG'ONALI tarifi (2026-yil 1-iyundan).
 *
 * BITTA MANBA: gaz kalkulyatori sahifasi, uning SEO/FAQ matni, testlar (tools/test-gaz-tarif.js,
 * tools/dizayn/test-gaz.mjs) va tekshiruv bandi (tools/verify-all.js) shu fayldagi raqamlarni oladi.
 *
 * MANBA: Vazirlar Mahkamasining 2026-yil 15-maydagi 243-son qarori, 1-ilova, II bo'lim "Tabiiy gaz":
 *   2.3  kommunal-maishiy ehtiyojlar uchun aholiga, gazni hisobga olish priborlari MAVJUD bo'lganda —
 *        a) isitish mavsumi, b) boshqa mavsum; bir oydagi iste'moldan kelib chiqib, so'm/m³ (QQS bilan);
 *   2.4  priborlar MAVJUD BO'LMAGANDA — a) ovqat tayyorlash va issiq suv 2 000, b) isitish 1 550.
 * Qaror matni (lex.uz xom HTML) 2026-10-13 da tekshirilgan; ikkilamchi manba (buxgalter.uz) jadvali bilan aynan mos.
 *
 * ISITISH MAVSUMI sanalari 243-son qarorida yo'q: izohda "204-son qarori 2-ilovasi bo'yicha" deb havola berilgan.
 * Vazirlar Mahkamasining 2024-yil 16-apreldagi 204-son qarori (lex.uz/docs/-6884060), 2-ilova:
 *   isitish mavsumi — Qoraqalpog'iston Respublikasi va Xorazm viloyatida oktabr–fevral, boshqa hududlarda noyabr–fevral;
 *   boshqa mavsum  — mart–sentabr (Qoraqalpog'iston, Xorazm) va mart–oktabr (boshqa hududlar).
 *   Izoh (2025-yil 28-fevral 133-son qarori): Energetika vazirligi havo haroratidan kelib chiqib muddatlarni o'zgartirishi
 *   mumkin va buni rasmiy saytida e'lon qiladi — shuning uchun kalkulyator mavsumni FOYDALANUVCHI tanlaydi.
 *
 * DIQQAT (aniqlanmagan nuqtalar):
 *  1) Qaror pog'ona qanday qo'llanishini (faqat oshgan qismigami yoki butun hajm bitta narxdami) aniq aytmaydi —
 *     faqat "bir oydagi iste'moldan kelib chiqib". Kalkulyator elektrdagi kabi pog'onama-pog'ona hisoblaydi
 *     (assets/tarif-core.js). Rasmiy usul aniqlansa, faqat shu yadro o'zgaradi.
 *  2) 2.4-band (priborsiz) uchun qarorda o'lchov birligi ham, sarf me'yori ham ko'rsatilmagan — shuning uchun
 *     kalkulyatorda "hisoblagich yo'q" rejimi YO'Q; bu narxlar faqat ma'lumot sifatida (noMeter) saqlanadi.
 *
 * Brauzerda window.KalkiGazTarif (oldin tarif-core.js yuklansin), Node'da require() — ikkalasida bir xil. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./tarif-core.js'));
  else root.KalkiGazTarif = factory(root.KalkiTarifCore);
})(typeof self !== 'undefined' ? self : this, function (Core) {
  'use strict';

  var DATA = {
    qaror: { uz: 'Vazirlar Mahkamasining 2026-yil 15-maydagi 243-son qarori', ru: 'Постановление Кабинета Министров от 15 мая 2026 года № 243' },
    url: 'https://lex.uz/uz/docs/-8195731',
    amalda: '2026-06-01',          // kuchga kirgan sana
    tekshirilgan: '2026-10-13',    // qaror matnidan raqamlar oxirgi marta tekshirilgan sana
    // Oylik sarf chegaralari (m³), 5 pog'ona: oxirgisi — "va undan yuqori"
    limits: {
      heat:  [500, 2500, 5000, 10000, Infinity],   // 2.3 a) isitish mavsumi
      other: [100, 2500, 5000, 10000, Infinity]    // 2.3 b) boshqa mavsum
    },
    // so'm/m³ (QQS bilan) — ikkala mavsumda pog'ona narxlari bir xil, farq faqat 1-pog'ona chegarasida
    prices: [1100, 2000, 2300, 2700, 3300],
    // 2.4 — gazni hisobga olish priborlari mavjud bo'lmaganda (kalkulyatorda hisoblanmaydi, faqat ma'lumot)
    noMeter: { cooking: 2000, heating: 1550 },
    // Isitish mavsumi (204-son qarori, 2-ilova) — oy raqamlari
    season: {
      url: 'https://lex.uz/docs/-6884060',
      qaror: { uz: 'Vazirlar Mahkamasining 2024-yil 16-apreldagi 204-son qarori, 2-ilova', ru: 'Постановление Кабинета Министров от 16 апреля 2024 года № 204, приложение 2' },
      heat:  { main: [11, 12, 1, 2], qqXorazm: [10, 11, 12, 1, 2] },
      other: { main: [3, 4, 5, 6, 7, 8, 9, 10], qqXorazm: [3, 4, 5, 6, 7, 8, 9] }
    }
  };

  var norm = function (s) { return s === 'heat' ? 'heat' : 'other'; };

  /* m3 — oylik jami sarf; season — 'heat' | 'other'.
   * Qaytaradi: { season, m3, total, effective (so'm/m³, o'rtacha), rows:[{ idx, from, to, m3, price, cost }] } */
  function tiers(m3, season) {
    var s = norm(season);
    var r = Core.tiers(m3, DATA.limits[s], DATA.prices);
    var out = { season: s, m3: r.amount, total: r.total, effective: r.amount > 0 ? r.total / r.amount : 0, rows: [] };
    for (var i = 0; i < r.rows.length; i++) {
      var x = r.rows[i];
      out.rows.push({ idx: x.idx, from: x.from, to: x.to, m3: x.qty, price: x.price, cost: x.cost });
    }
    return out;
  }

  /* Hisoblagich ko'rsatkichlari: { ok:true, m3 } yoki { ok:false, error:'invalid'|'less' } */
  function meterUsage(prev, cur) {
    var p = Number(prev), c = Number(cur);
    if (prev === '' || cur === '' || prev == null || cur == null || !isFinite(p) || !isFinite(c) || p < 0 || c < 0) return { ok: false, error: 'invalid' };
    if (c < p) return { ok: false, error: 'less' };
    return { ok: true, m3: Math.round((c - p) * 1000) / 1000 };
  }

  /* Oy (1–12) bo'yicha TAXMINIY mavsum: asosiy hududlar uchun noyabr–fevral = isitish.
   * Qoraqalpog'iston va Xorazmda oktabr ham isitish (region='qqXorazm'). Energetika vazirligi muddatni o'zgartirishi mumkin. */
  function seasonForMonth(month, region) {
    var key = region === 'qqXorazm' ? 'qqXorazm' : 'main';
    return DATA.season.heat[key].indexOf(Number(month)) > -1 ? 'heat' : 'other';
  }

  /* Joriy sarf qaysi pog'onada va keyingisiga qancha qoldi.
   * Qaytaradi: { idx (0-dan), from, to, price, next:null | { from, price, left (m³: shu narxda yana qancha) } } */
  function position(m3, season) {
    var L = DATA.limits[norm(season)], x = Number(m3) > 0 ? Number(m3) : 0, i = 0;
    while (i < L.length - 1 && x > L[i]) i++;
    var cur = { idx: i, from: i ? L[i - 1] + 1 : 0, to: L[i], price: DATA.prices[i], next: null };
    if (i < L.length - 1) cur.next = { from: L[i] + 1, price: DATA.prices[i + 1], left: L[i] - x };
    return cur;
  }

  return { data: DATA, tiers: tiers, meterUsage: meterUsage, seasonForMonth: seasonForMonth, position: position };
});
