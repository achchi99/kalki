/* kalki.uz -- tools/translit.js uchun sinovlar.
 *
 * Oddiy node skripti (tashqi test freymvorki yo'q, boshqa tools/
 * fayllar bilan bir xil uslub). Ishga tushirish:
 *   node tools/translit-test.js
 * Barcha sinov o'tsa chiqish kodi 0, birortasi yiqilsa 1.
 */
'use strict';
var translit = require('./translit.js').translit;

var APOS_ASCII = '\u0027';
var APOS_CURLY = '’';
var APOS_MODLETTER = 'ʻ';

// Har element: [kirish, kutilgan_natija, izoh]
var CASES = [
  // ---- oddiy harflar ----
  ['aliment', 'алимент', 'oddiy harflar (a,l,i,m,e,n,t)'],
  ['kalkulyator', 'калкулятор', 'oddiy harflar + ya digraf'],

  // ---- sh/ch/ts/yo/yu/ya digraflari (kichik/katta/BARCHA katta) ----
  ['sh', 'ш', 'sh -> sh (kichik)'],
  ['Sh', 'Ш', 'sh -> sh (Bosh harf)'],
  ['SH', 'Ш', 'sh -> sh (BARCHA KATTA)'],
  ['ch', 'ч', 'ch -> ch (kichik)'],
  ['Ch', 'Ч', 'ch -> ch (Bosh harf)'],
  ['ts', 'ц', 'ts -> ts'],
  ['yo', 'ё', 'yo -> yo'],
  ['yu', 'ю', 'yu -> yu'],
  ['ya', 'я', 'ya -> ya'],

  // ---- ng: alohida harf EMAS, ikki harfning oddiy ketma-ketligi ----
  ['ng', 'нг', 'ng -> n+g (alohida ishlov YO’Q, spec talabi)'],
  ['tong', 'тонг', 'ng so’z ichida'],

  // ---- o'/g' -- uchala apostrof turi ham ----
  ['o' + APOS_ASCII + 'zbek', 'ўзбек', 'o-apostrof ASCII turi'],
  ['o' + APOS_CURLY + 'zbek', 'ўзбек', 'o’ jingalak apostrof (’)'],
  ['o' + APOS_MODLETTER + 'zbek', 'ўзбек', 'o’ harf-shakldagi apostrof (ʻ)'],
  ['g' + APOS_ASCII + 'alaba', 'ғалаба', 'g’ ASCII apostrof'],
  ['g' + APOS_CURLY + 'alaba', 'ғалаба', 'g’ jingalak apostrof'],
  ['G' + APOS_ASCII + 'alaba', 'Ғалаба', 'G’ (Bosh harf) -> Ґ'],
  ['O' + APOS_ASCII + 'zbek', 'Ўзбек', 'O’ (Bosh harf) -> Ў'],

  // ---- tutuq belgisi (o'/g' bo'lmagan apostrof) -> ъ ----
  ['ma' + APOS_ASCII + 'lumot', 'маълумот', 'tutuq belgisi -> ъ (ASCII)'],
  ['ma' + APOS_CURLY + 'lumot', 'маълумот', 'tutuq belgisi -> ъ (jingalak)'],

  // ---- so'z boshi/ichi farqi: e/ye ----
  // TUZATILDI (2026-09): dastlabki qoida teskari edi. To'g'ri qoida:
  // yakka "e" so'z boshida -> cyrillic-e (E_START), so'z ichida ->
  // cyrillic-ie (E_MID). "ye" digrafi esa POZITSIYADAN QAT'I NAZAR
  // har doim cyrillic-ie (E_MID) -- chunki cyrillic-ie harfi
  // allaqachon "ye" tovushini ifodalaydi.
  ['element', 'элемент', 'e so’z boshida -> cyrillic-e, ichida -> cyrillic-ie'],
  ['sanoat', 'саноат', 'so’zda "e" umuman yo’q -- nazorat holati'],
  ['ekran', 'экран', 'e so’z boshida -> cyrillic-e'],
  ['ye', 'е', 'ye (yakka digraf) -> cyrillic-ie'],
  ['tuye', 'туе', 'ye so’z ichida -> cyrillic-ie'],
  ['yelka', 'елка', 'ye so’z boshida -> cyrillic-ie (TUZATILDI, avval xato edi)'],
  ['yer', 'ер', 'yer -> ер (asosiy tuzatilgan misol)'],
  ['yetti', 'етти', 'yetti -> етти'],
  ['yengil', 'енгил', 'yengil -> енгил'],
  ['yetkazish', 'етказиш', 'yetkazish -> етказиш'],
  ['eshik', 'эшик', 'eshik -> эшик (yakka e, so’z boshida)'],
  ['ertaga', 'эртага', 'ertaga -> эртага (yakka e, so’z boshida)'],
  ['elektr', 'электр', 'elektr -> электр (yakka e, so’z boshida)'],
  ['e' + APOS_ASCII + 'lon', 'эълон', 'e’lon -> эълон (yakka e boshida + tutuq belgisi)'],
  ['kelmoq', 'келмоқ', 'kelmoq -> келмоқ (yakka e, so’z ichida)'],
  ['tekshirish', 'текшириш', 'tekshirish -> текшириш (yakka e, so’z ichida)'],
  [
    'Yer solig' + APOS_ASCII + 'i',
    'Ер солиғи',
    'Yer solig’i -> Ер солиғи (foydalanuvchi topgan asl misol, endi to’g’ri)'
  ],

  // ---- qisqartmalar saqlanishi ----
  ['MHTEKM', 'MHTEKM', 'qisqartma o’zgarishsiz qoladi'],
  ['QQS', 'QQS', 'qisqartma o’zgarishsiz qoladi'],
  ['PDF', 'PDF', 'qisqartma o’zgarishsiz qoladi'],
  ['Kalki.uz', 'Kalki.uz', 'brend nomi o’zgarishsiz qoladi'],
  ['ST-1', 'ST-1', 'chiziqcha bilan qisqartma o’zgarishsiz qoladi'],

  // ---- aralash matn: qisqartma + o'zbek matn ----
  [
    'MHTEKMning 26,5%idan kam bo' + APOS_ASCII + 'lmasligi kerak',
    'MHTEKMнинг 26,5%идан кам бўлмаслиги керак',
    'qisqartma + qo’shimchali so’z aralash'
  ],
  [
    '1 MHTEKM = 1 360 000 so' + APOS_ASCII + 'm',
    '1 MHTEKM = 1 360 000 сўм',
    'qisqartma + raqam + o’zbek so’z'
  ],
  [
    'PDF va CSV formatda',
    'PDF ва CSV форматда',
    'ikkita qisqartma bitta jumlada'
  ],

  // ---- raqam/valyuta/formulalar o'zgarishsiz ----
  ['2026-yil', '2026-йил', 'raqam o’zgarmaydi, "yil" o’giriladi'],
  ['50%', '50%', 'foiz belgisi bilan raqam o’zgarmaydi'],

  // ---- katta harf bilan boshlanuvchi oddiy so'zlar ----
  ['Toshkent', 'Тошкент', 'bosh harf saqlanadi'],
  ['XIZMAT', 'ХИЗМАТ', 'BARCHA KATTA harflar']
];

var pass = 0, fail = 0;
CASES.forEach(function (c) {
  var input = c[0], expected = c[1], label = c[2];
  var actual = translit(input);
  if (actual === expected) {
    pass++;
  } else {
    fail++;
    console.log('FAIL [' + label + ']');
    console.log('  kirish  : ' + JSON.stringify(input));
    console.log('  kutilgan: ' + JSON.stringify(expected));
    console.log('  chiqdi  : ' + JSON.stringify(actual));
  }
});

console.log('');
console.log(pass + ' ta o’tdi, ' + fail + ' ta yiqildi (jami ' + CASES.length + ')');
process.exit(fail ? 1 : 0);
