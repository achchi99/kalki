'use strict';
/* tools/baza-mantiq.js uchun QO'LDA ko'rib chiqilgan istisnolar: qoida → { kalit: sabab }. Har biri docs/baza-tekshiruv-2026-11-11.md da ham yozilgan.
 * Kalit: a — «id>asos», b/c/d — id, e — id'lar vergul bilan. */
module.exports = {
  a: {
    'milka>milka-funduk': "«sutli» — mahsulot nomi (Milka sut shokoladi), qo'shimcha emas; funduqli boshqa mahsulot",
    'shokolad-shirin>shokolad-sut': "«shirin, qora» — qora shokolad turi (USDA 167977), qo'shimcha emas; bo'lak 10 g, farq 3 kkal",
    'shokolad-bodom>shokolad-sut': "«sutli shokolad bodomli» — USDA 168754 alohida mahsulot (526 kkal/100 g), asosiy 535 — farq 1,7 %",
    'qalampir-qizil>qalampir': "«sladkiy» — qalampir navi (USDA 170108), qo'shimcha emas",
    'tvorog-donador>tvorog5': "donador (zernistyy) tvorog — USDA 172179 alohida mahsulot, «qaymoqli» — turi; 100 g da 98 kkal",
    'salat-sabzavot>sabzavot-salat-mayonez': "v87: ikki xil salat — «yog'li» (o'simlik yog'i bilan) va mayonezli; mayonezlisi og'irroq bo'lishi to'g'ri",
    'salat-sabzavot>sabzavot-salat-smetana': "v87: o'simlik yog'li va smetanali salat — ikki xil zapravka; farq 4 kkal/tarelka",
    'bulochka>bulochka-mak': "v87: mak urug'li bulochka — boshqa mahsulot (USDA 175161 asosida), oddiy shirin bulochkadan og'irroq",
    'choy-shakar1>sutli-choy': "v87: «sutli choy» — sut qo'shimchasi (shakar emas); shakarli qora choy bilan solishtirilmaydi",
    'sutli-guruch-shurva>guruch-shurva': "v87: sutli guruch sho'rva — go'shtsiz sutli taom; go'shtli guruch sho'rva boshqa retsept",
    'tvorog-asal>tvorog-smetana': "v87: asalli va smetanali tvorog — ikki xil qo'shimcha, bir-birining asosi emas",
    'mol-gosht-xom-yogli>mol-gosht': "v87: xom go'sht (100 g xom) va pishgan go'sht — suv yo'qotishi sababli pishgani zichroq",
    'qalampir-yashil>qalampir': "v87: «сладкий» — qalampir navi (USDA 170427 yashil), qo'shimcha emas",
    'bodom-shakarli>bodom': "v87: shakarli draje bodom — USDA 169387 (yong'oq ulushi kam, yog' kam) — 100 g da xom bodomdan kam bo'lishi to'g'ri",
    'bodom-shakarli>bodom-qovurilgan': "v87: shakarli draje — yog'i kam alohida mahsulot (yuqoridagi sabab)",
    'bodom-shakarli>bodom-asalli': "v87: draje (qobiqli shakar) va asalli qovurilgan bodom — ikki xil mahsulot",
    'yeryongoq-shakarli>yerfistiq-tuzli': "v87: shakarli glazurdagi yeryong'oq — glazur ulushi yog'ni kamaytiradi (USDA asosida), qovurilgan tuzlidan kam bo'lishi to'g'ri",
    'mayonez-light>mayonez': "v87: kam yog'li (30 %) mayonez — yengil mahsulot, qo'shimcha emas"
  },
  b: {},
  c: {
    'makkajoxori': "USDA (modifikatsiyalangan Atwater, kletchatka hisobga olingan): 96 kkal rasmiy",
    'limon': 'USDA: kletchatka 2,8 g — Atwater farqi; kkal rasmiy USDA qiymati',
    'olma-sirka': 'sirka kislotasi (organik kislota) 7 kkal/g — makro formula ushlamaydi',
    'kakao-kukun': 'kletchatka 33 g (hazm bo\'lmaydi) — USDA kkal 228 rasmiy',
    'kepak': 'kletchatka 43 g — USDA kkal 216 rasmiy',
    'makkajoxori-konserva': 'USDA: kletchatka — farq 15 %',
    'laym': 'USDA: kletchatka — Atwater farqi',
    'tomat-pasta': 'v87: USDA 170459 — kletchatka 4,1 g va organik kislotalar; kkal 82 rasmiy USDA qiymati',
    'balzamik': 'v87: USDA 172241 — sirka kislotasi va qand spirtlari Atwater formulasiga tushmaydi; kkal 88 rasmiy USDA qiymati'
  },
  d: {
    'shirchoy-tuzli': "v87: shirchoy — sutli choy (sut ~40 %), «shakarsiz» bo'lsa ham sut kkal beradi; nomida «sut» so'zi yo'q, shuning uchun qoida ushlaydi",
    'raf-vanil': "v87: kafe rafi — qaymoq + vanil siropi; katta stakan (450 ml) ~520 kkal — kafe menyularida shunday",
    'issiq-shokolad-kafe': "v87: qaymoqli issiq shokolad, katta stakan 450 ml ~440 kkal — real kafe qiymati"
  },
  e: {},
  f: {},
  g: {},
  h: {},
  i: {}
};
