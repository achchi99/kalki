'use strict';
/* tools/baza-mantiq.js uchun QO'LDA ko'rib chiqilgan istisnolar: qoida → { kalit: sabab }. Har biri docs/baza-tekshiruv-2026-11-11.md da ham yozilgan.
 * Kalit: a — «id>asos», b/c/d — id, e — id'lar vergul bilan. */
module.exports = {
  a: {
    'milka>milka-funduk': "«sutli» — mahsulot nomi (Milka sut shokoladi), qo'shimcha emas; funduqli boshqa mahsulot",
    'shokolad-shirin>shokolad-sut': "«shirin, qora» — qora shokolad turi (USDA 167977), qo'shimcha emas; bo'lak 10 g, farq 3 kkal",
    'shokolad-bodom>shokolad-sut': "«sutli shokolad bodomli» — USDA 168754 alohida mahsulot (526 kkal/100 g), asosiy 535 — farq 1,7 %",
    'qalampir-qizil>qalampir': "«sladkiy» — qalampir navi (USDA 170108), qo'shimcha emas",
    'tvorog-donador>tvorog5': "donador (zernistyy) tvorog — USDA 172179 alohida mahsulot, «qaymoqli» — turi; 100 g da 98 kkal"
  },
  b: {},
  c: {
    'makkajoxori': "USDA (modifikatsiyalangan Atwater, kletchatka hisobga olingan): 96 kkal rasmiy",
    'limon': 'USDA: kletchatka 2,8 g — Atwater farqi; kkal rasmiy USDA qiymati',
    'olma-sirka': 'sirka kislotasi (organik kislota) 7 kkal/g — makro formula ushlamaydi',
    'kakao-kukun': 'kletchatka 33 g (hazm bo\'lmaydi) — USDA kkal 228 rasmiy',
    'kepak': 'kletchatka 43 g — USDA kkal 216 rasmiy',
    'makkajoxori-konserva': 'USDA: kletchatka — farq 15 %',
    'laym': 'USDA: kletchatka — Atwater farqi'
  },
  d: {},
  e: {}
};
