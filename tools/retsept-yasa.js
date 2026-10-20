#!/usr/bin/env node
/* kalki.uz — «Retseptimni yengillashtir»: masalliq jadvali (data/retsept-masalliq.json) ni yasaydi.
 * Manba: data/baza-masalliq.json (47 masalliq, USDA SR Legacy ID) + data/manba/usda-sr-legacy.json (100 g dagi kkal/oqsil/yog'/uglevod) + pastdagi QO'SHIMCHA (USDA SR Legacy qiymatlari, izoh bilan).
 * Har masalliq: uz/ru nomi, alias o'zaklari (matndan topish uchun), 100 g dagi k/p/f/c, o'lchov birliklari (g), teglar (qoida uchun), cheklov tegi (Yemaydiganlarim).
 *   node tools/retsept-yasa.js          → faylni yozadi
 *   node tools/retsept-yasa.js --tekshir → fayl hozirgi manbalarga mos ekanini tekshiradi (chiqish kodi 1 — mos emas)
 * Kkal/oqsil/yog'/uglevod HECH QACHON AI'dan olinmaydi — faqat shu jadvaldan. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const rd = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const BAZA = rd('data/baza-masalliq.json').masalliq, USDA = rd('data/manba/usda-sr-legacy.json').foods;

/* alias o'zaklari: uz (lotin, apostrof ' ) va ru. Uzunroq alias avval tekshiriladi. a: uz, r: ru */
const ALIAS = {
  guruch: { a: ['guruch', 'devzira', 'lazer'], r: ['рис'] },
  sabzi: { a: ['sabzi'], r: ['морков'] },
  piyoz: { a: ['piyoz'], r: ['лук', 'луковиц'] },
  qoy: { a: ["qo'y go'sht", 'qoy gosht', "qo'y", 'qoy'], r: ['баранин'] },
  qoy_yogsiz: { a: ["yog'siz qo'y", "yog'siz qoy"], r: ['постн баранин'] },
  mol: { a: ["mol go'sht", 'mol gosht', 'mol'], r: ['говядин'] },
  mol_yogsiz: { a: ["yog'siz mol go'sht", "yog'siz mol", "yog'siz go'sht"], r: ['постн говядин', 'постн мяс'] },
  tovuq_kokrak: { a: ["tovuq ko'krag", "tovuq ko'krak", 'tovuq fil', 'file'], r: ['курин грудк', 'курин филе', 'грудк', 'филе'] },
  tovuq_son: { a: ["tovuq go'sht", 'tovuq', 'tovuq son'], r: ['курин', 'курица', 'курицы'] },
  dumba: { a: ['dumba'], r: ['курдюк'] },
  yog: { a: ["o'simlik yog'", 'osimlik yog', 'paxta yog', 'kungaboqar yog', "yog'", 'yog'], r: ['растительн масл', 'подсолнечн масл', 'хлопков масл', 'масл'] },
  un: { a: ['un'], r: ['мука', 'муки', 'муку'] },
  kartoshka: { a: ['kartoshka'], r: ['картоф', 'картошк'] },
  qovoq: { a: ['qovoq'], r: ['тыкв'] },
  sariyog: { a: ["sariyog'", 'sariyog', 'margarin'], r: ['сливочн масл', 'маргарин'] },
  tuxum: { a: ['tuxum'], r: ['яйц', 'яиц'] },
  sut: { a: ['sut'], r: ['молок'] },
  karam: { a: ['karam'], r: ['капуст'] },
  pomidor: { a: ['pomidor', 'tomat'], r: ['помидор', 'томат'] },
  qalampir: { a: ["bolgar qalampir", "bulg'or qalampir", "bolg'or qalampir", 'qalampir'], r: ['болгарск перец', 'сладк перец', 'перец болгарск'] },
  kokat: { a: ["ko'kat", 'kokat', 'shivit', 'kashnich', 'petrushka'], r: ['зелен', 'укроп', 'кинз', 'петрушк'] },
  mosh: { a: ['mosh'], r: ['маш'] },
  noxat: { a: ["no'xat", 'nohut', 'noxat'], r: ['нут'] },
  bodring: { a: ['bodring', 'tuzlangan bodring'], r: ['огурец', 'огурц', 'солен огурц', 'солен огурец'] },
  redis: { a: ['turp', 'redis'], r: ['редис'] },
  qatiq: { a: ['qatiq', 'yogurt', 'yoghurt'], r: ['катык', 'йогурт', 'кефир'] },
  uzum_barg: { a: ['uzum barg'], r: ['виноградн'] },
  shakar: { a: ['shakar'], r: ['сахар'] },
  sazan: { a: ['sazan'], r: ['карп', 'сазан'] },
  loviya_oq: { a: ['loviya'], r: ['фасол'] },
  yasmiq: { a: ['yasmiq'], r: ['чечевиц'] },
  suzma: { a: ['suzma'], r: ['творог'] },
  losos: { a: ['losos', 'qizil baliq'], r: ['лосос', 'семг'] },
  jigar: { a: ['jigar'], r: ['печен'] },
  qoy_qovurga: { a: ["qo'y qovurg'a", 'qovurg'], r: ['ребр'] },
  tovuq_qanot: { a: ['tovuq qanot', 'qanot'], r: ['крыл'] },
  sosiska_mol: { a: ['sosiska'], r: ['сосис'] },
  bulka: { a: ['bulka', 'bulochka', 'non'], r: ['булочк', 'булк', 'хлеб'] },
  baqlajon: { a: ['baqlajon'], r: ['баклажан'] },
  qoziqorin: { a: ["qo'ziqorin", 'qoziqorin', 'shampinon'], r: ['шампиньон', 'гриб'] },
  kolbasa_mol: { a: ['kolbasa'], r: ['колбас'] },
  tushonka_mol: { a: ['tushonka'], r: ['тушенк', 'тушёнк'] },
  /* qo'shimcha (baza-masalliq.json da yo'q) */
  sarimsoq: { a: ['sarimsoq'], r: ['чеснок'] },
  mayiz: { a: ['mayiz', 'kishmish'], r: ['изюм', 'кишмиш'] },
  qaymoq: { a: ['qaymoq', 'smetana'], r: ['сметан'] },
  mayonez: { a: ['mayonez'], r: ['майонез'] },
  yashil_noxat: { a: ["yashil no'xat", 'yashil noxat', "konserva no'xat", 'burchoq'], r: ['зелен горош', 'горош'] },
  ziravor: { a: ['ziravor', 'zira', 'murch', 'tuz', "qora murch", 'dalchin', 'zirabarg'], r: ['специи', 'зира', 'сол', 'перец', 'перц', 'приправ'] }
};
/* USDA qiymati (SR Legacy, 100 g) — baza-masalliq.json da yo'q masalliqlar; ID — USDA NDB raqami (bilingan), bo'lmasa null */
const EXTRA = {
  sarimsoq: { uz: 'sarimsoq', ru: 'чеснок', usda: 169230, d: 'Garlic, raw', k: 149, p: 6.36, f: 0.5, c: 33.06 },
  mayiz: { uz: 'mayiz (kishmish)', ru: 'изюм', usda: null, d: 'Raisins, seedless', k: 299, p: 3.07, f: 0.46, c: 79.18 },
  qaymoq: { uz: 'qaymoq (smetana)', ru: 'сметана', usda: null, d: 'Sour cream, cultured', k: 198, p: 2.44, f: 19.35, c: 4.63 },
  mayonez: { uz: 'mayonez', ru: 'майонез', usda: null, d: 'Salad dressing, mayonnaise, regular', k: 680, p: 0.96, f: 74.85, c: 0.57 },
  yashil_noxat: { uz: "yashil no'xat", ru: 'зелёный горошек', usda: null, d: 'Peas, green, raw', k: 81, p: 5.42, f: 0.4, c: 14.45 },
  ziravor: { uz: 'ziravor, tuz', ru: 'специи, соль', usda: null, d: "ziravor/tuz — kaloriyasi e'tiborsiz (odatda 5–10 g)", k: 0, p: 0, f: 0, c: 0 }
};
/* o'lchov: dona (1 dona/bosh g), osh (osh qoshiq g), choy (choy qoshiq g), stakan (g), ml (g/ml zichlik) */
const UNITS = {
  guruch: { osh: 12, choy: 4, stakan: 180 }, sabzi: { dona: 80, stakan: 110 }, piyoz: { dona: 110 }, qoy: {}, mol: {}, tovuq_kokrak: { dona: 220 }, tovuq_son: { dona: 190 },
  dumba: {}, yog: { osh: 14, choy: 4.5, stakan: 230, ml: 0.92 }, un: { osh: 8, choy: 3, stakan: 130 }, kartoshka: { dona: 130 }, qovoq: {}, sariyog: { osh: 14, choy: 4.7, stakan: 227 },
  tuxum: { dona: 50 }, sut: { osh: 15, choy: 5, stakan: 250, ml: 1.03 }, karam: {}, pomidor: { dona: 120 }, qalampir: { dona: 120 }, kokat: { osh: 4, stakan: 30 },
  noxat: { osh: 12, stakan: 190 }, mosh: { osh: 13, stakan: 200 }, bodring: { dona: 100 }, qatiq: { osh: 15, choy: 5, stakan: 250, ml: 1.03 }, shakar: { osh: 12.5, choy: 4.2, stakan: 200 },
  sarimsoq: { dona: 40 }, mayiz: { osh: 10, stakan: 150 }, qaymoq: { osh: 12, choy: 4, stakan: 240, ml: 1.0 }, mayonez: { osh: 14, choy: 4.6, stakan: 230, ml: 0.92 },
  yashil_noxat: { osh: 10, stakan: 160 }, ziravor: { osh: 8, choy: 3 }, kolbasa_mol: { dona: 100 }, bulka: { dona: 60 }, loviya_oq: { stakan: 200 }, yasmiq: { stakan: 190 }, suzma: { osh: 18 }
};
/* teglar (qoidalar uchun): moy (yog'), dumba, yogligosht (yog'li go'sht), yogsiz (yog'siz go'sht/parranda), qaymoq, mayonez, shakar, sabzavot; cheklov: Yemaydiganlarim kalitlari (cheklov-core) */
const TAGS = {
  yog: ['moy'], sariyog: ['moy'], dumba: ['dumba'], qoy: ['yogligosht'], mol: ['yogligosht'], tovuq_son: ['yogligosht'], tovuq_qanot: ['yogligosht'], qoy_qovurga: ['yogligosht'],
  qoy_yogsiz: ['yogsiz'], mol_yogsiz: ['yogsiz'], tovuq_kokrak: ['yogsiz'], qaymoq: ['qaymoq'], mayonez: ['mayonez'], shakar: ['shakar'],
  sabzi: ['sabzavot'], pomidor: ['sabzavot'], karam: ['sabzavot'], qovoq: ['sabzavot'], baqlajon: ['sabzavot'], qalampir: ['sabzavot'], bodring: ['sabzavot']
};
const CHEK = { sut: ['sut'], qatiq: ['sut'], qaymoq: ['sut'], suzma: ['sut'], sariyog: ['sut'], tuxum: ['tuxum'], sazan: ['baliq'], losos: ['baliq'], un: ['glyuten'], bulka: ['glyuten'], noxat: [], mayonez: ['tuxum'] };

function build() {
  const out = {};
  for (const id of Object.keys(ALIAS)) {
    const b = BAZA[id], x = b ? USDA[b.usda] : EXTRA[id];
    if (!x) { if (id === 'suv') continue; throw new Error('masalliq manbasi yo\'q: ' + id); }
    const nom = b ? b : x;
    out[id] = { uz: (b && b.uz) || x.uz, ru: (b && b.ru) || x.ru, a: ALIAS[id].a, r: ALIAS[id].r, k: Math.round(x.kcal != null ? x.kcal : x.k), p: x.p, f: x.f, c: x.c, u: UNITS[id] || {}, t: TAGS[id] || [], ch: CHEK[id] || [], y: b ? b.usda : (x.usda || null), m: b ? 'USDA SR Legacy ' + b.usda + ': ' + x.d : 'USDA SR Legacy (qo\'lda): ' + x.d };
  }
  /* pishgan (tayyor taom) asosli masalliqlar (qoy_pishgan, mol_pishgan, tovuq_teri…) retsept (xom) masalliqlari emas — jadvalga kirmaydi */
  return { v: 1, izoh: "«Retseptimni yengillashtir» masalliq jadvali. tools/retsept-yasa.js yasaydi (qo'lda tahrirlanmaydi). k/p/f/c — 100 g (xom) dagi qiymat, USDA SR Legacy. Kkal/makro faqat shu jadvaldan hisoblanadi (AI emas).", masalliq: out };
}
const text = JSON.stringify(build(), null, 1) + '\n', file = path.join(ROOT, 'data/retsept-masalliq.json');
if (process.argv.includes('--tekshir')) { const cur = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''; if (cur !== text) { console.log('data/retsept-masalliq.json manbalarga mos emas — node tools/retsept-yasa.js'); process.exit(1); } console.log('OK  retsept-masalliq.json manbalarga mos (' + Object.keys(JSON.parse(cur).masalliq).length + ' masalliq)'); }
else { fs.writeFileSync(file, text); console.log('yozildi: data/retsept-masalliq.json (' + Object.keys(build().masalliq).length + ' masalliq)'); }
