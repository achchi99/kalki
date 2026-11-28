/* kalki.uz — v108: sushi, kimbap, beze uchun STANDART RETSEPTLAR (tools/ovqatlar-kengaytma9.js shu yerdan hisoblanadi).
 * Format — tools/retsept-hisob.js: mas — NETTO gramm (jami ≈ 100 g tayyor taom); chiqish — tayyor taom grammi (pishirish/quritish yo'qotishidan keyin; berilmasa — masalliqlar yig'indisi).
 * Masalliq qiymati FAQAT USDA FDC SR Legacy (data/manba/usda-sr-legacy.json); qo'lda yozilgan raqam yo'q. Tuz (0 kkal) ko'rsatilmagan.
 * Sushi guruchi: pishgan guruch + sirka + shakar (mavjud rollar bilan bir xil nisbat: 100 g guruchga ≈ 2,5 g shakar, 4 g sirka). Hujjat: docs/baza-kengaytma-v108.md */
'use strict';
const RICE = 'u:168878', SALMON = 'u:175167', SUGAR = 'u:169655', VINEGAR = 'u:172237', NORI = 'u:168458', CUC = 'u:168409', TERI = 'u:171167', MAYO = 'u:171009', SES = 'u:170151', SESOIL = 'u:171016',
  EGG = 'u:173423', CARROT = 'u:170393', SPINACH = 'u:168463', RADISH = 'u:168451', BOLOGNA = 'u:173857';

module.exports = {
  /* ── SUSHI: rollar (dona ≈ 25–35 g; «set» = 8 dona) ── */
  'roll-maki-losos': { porsiya: 'maki roll, 6 dona (≈150 g)', izoh: 'xosomaki: guruch qatlami + nori ichida losos (xom); 1 dona ≈ 25 g',
    mas: [[RICE, 70, 'pishgan guruch'], [SALMON, 20, 'losos (xom)'], [NORI, 3, 'nori'], [SUGAR, 2, 'shakar'], [VINEGAR, 3, 'guruch sirkasi']] },
  'roll-ugor': { porsiya: 'roll, 8 dona (≈240 g)', izoh: 'uramaki: guruch + pishirilgan ilonbaliq (unagi) + bodring, ustiga kabayaki sousi (teriyaki turi) va kunjut; 1 dona ≈ 30 g',
    mas: [[RICE, 60, 'pishgan guruch'], ['u:174194', 22, 'ilonbaliq (pishirilgan)'], [CUC, 6, 'bodring'], [TERI, 6, 'kabayaki/teriyaki sousi'], [SES, 1, 'kunjut'], [NORI, 3, 'nori'], [SUGAR, 2, 'shakar'], [VINEGAR, 3, 'guruch sirkasi']] },
  'roll-pishirilgan': { porsiya: 'roll, 8 dona (≈240 g)', chiqish: 91, izoh: 'zapechonniy: guruch + losos + krem-pishloq + bodring, ustiga mayonezli sous va motsarella; duxovkada pishiriladi (≈10 % namlik yo\'qotish); 1 dona ≈ 30 g',
    mas: [[RICE, 48, 'pishgan guruch'], [SALMON, 15, 'losos (xom)'], ['u:173418', 9, 'krem-pishloq'], ['u:170846', 6, 'motsarella'], [MAYO, 8, 'mayonez (sous)'], [CUC, 8, 'bodring'], [NORI, 2, 'nori'], [SUGAR, 1.5, 'shakar'], [VINEGAR, 2.5, 'guruch sirkasi']] },

  /* ── SUSHI: imbir marinadi (gari) ── */
  'imbir-marinad': { porsiya: 'osh qoshiq ≈ 15 g', izoh: 'gari: yupqa imbir bo\'laklari shirin sirkada (imbir ≈ 65 %, shakar 5 %, sirka 10 %, suv 20 %); marinadlashda shakar va suv almashinuvi hisobga olinmagan — taxminiy, haqiqiy qiymat past bo\'lishi mumkin',
    mas: [['u:169231', 65, 'imbir ildizi'], [SUGAR, 5, 'shakar'], [VINEGAR, 10, 'guruch sirkasi'], ['suv', 20, 'suv']] },

  /* ── KIMBAP (gimbap): 1 bo'lak ≈ 20 g; butun rulet ≈ 9 bo'lak ── */
  'kimbap-klassik': { porsiya: 'rulet ≈ 180 g (9 bo\'lak)', izoh: 'guruch (kunjut moyi bilan) + tuxum omleti, kolbasa, sabzi, ismaloq, sarg\'ish turp (danmuji), bodring; nori ichida',
    mas: [[RICE, 55, 'pishgan guruch'], [EGG, 14, 'tuxum (omlet)'], [BOLOGNA, 10, 'kolbasa (kurka)'], [CARROT, 6, 'sabzi'], [SPINACH, 6, 'ismaloq (qaynatilgan)'], [RADISH, 5, 'sarg\'ish turp (danmuji)'], [SUGAR, 1, 'shakar (turp uchun)'], [CUC, 5, 'bodring'], [NORI, 3, 'nori'], [SESOIL, 3, 'kunjut moyi'], [SES, 0.5, 'kunjut']] },
  'kimbap-tunets': { porsiya: 'rulet ≈ 180 g (9 bo\'lak)', izoh: 'guruch + tunets-mayonez (suvdagi konserva tunets + mayonez), tuxum, sabzi, bodring, sarg\'ish turp; nori ichida',
    mas: [[RICE, 55, 'pishgan guruch'], ['u:171986', 14, 'tunets (konserva, suvda)'], [MAYO, 8, 'mayonez'], [EGG, 8, 'tuxum (omlet)'], [CARROT, 5, 'sabzi'], [CUC, 6, 'bodring'], [RADISH, 5, 'sarg\'ish turp (danmuji)'], [SUGAR, 1, 'shakar (turp uchun)'], [NORI, 3, 'nori'], [SESOIL, 2, 'kunjut moyi'], [SES, 0.5, 'kunjut']] },
  'kimbap-bulgogi': { porsiya: 'rulet ≈ 180 g (9 bo\'lak)', izoh: 'guruch + bulgogi (soya sousi, shakar va kunjut moyida marinadlangan mol go\'shti, qovurilgan), tuxum, sabzi, ismaloq, turp, bodring; nori ichida',
    mas: [[RICE, 55, 'pishgan guruch'], ['u:168710', 20, 'mol go\'shti (qovurilgan)'], ['u:174277', 1.5, 'soya sousi'], [SUGAR, 1.5, 'shakar (marinad)'], [SESOIL, 3, 'kunjut moyi (marinad va guruch)'], [EGG, 8, 'tuxum (omlet)'], [CARROT, 5, 'sabzi'], [SPINACH, 5, 'ismaloq (qaynatilgan)'], [RADISH, 5, 'sarg\'ish turp (danmuji)'], [SUGAR, 1, 'shakar (turp uchun)'], [CUC, 5, 'bodring'], [NORI, 3, 'nori'], [SES, 0.5, 'kunjut']] },

  /* ── BEZE (меренга): oq, quruq. Klassik nisbat — 1 qism tuxum oqi : 2 qism shakar (vazn bo'yicha); 100 °C da quritiladi, tayyor namlik ≈ 1 % ── */
  'beze': { porsiya: 'dona 5–15 g', chiqish: 214, izoh: 'tuxum oqi 100 g + shakar 200 g; tuxum oqi quruq moddasi ≈ 12,4 g + shakar 200 g = 212,4 g → ≈ 1 % namlik bilan 214 g',
    mas: [['u:172183', 100, 'tuxum oqi (xom)'], [SUGAR, 200, 'shakar']] }
};
