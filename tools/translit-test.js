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

  // ---- brend va fayl formatlari lotincha qoladi; o'zbekcha qisqartmalar kirillga o'giriladi ----
  ['MHTEKM', 'МҲТЕКМ', 'o’zbekcha qisqartma harfma-harf kirillga o’giriladi'],
  ['QQS', 'ҚҚС', 'QQS -> ҚҚС'],
  ['DTM', 'ДТМ', 'DTM -> ДТМ'],
  ['YHXX', 'ЙҲХХ', 'YHXX -> ЙҲХХ'],
  ['MCHJ', 'МЧЖ', 'katta harfli digraflar (CH -> Ч, J -> Ж)'],
  ['ST-1', 'СТ-1', 'chiziqcha bilan qisqartma ham o’giriladi'],
  ['PDF', 'PDF', 'fayl formati o’zgarishsiz qoladi'],
  ['Kalki.uz', 'Kalki.uz', 'brend nomi o’zgarishsiz qoladi'],
  ['Telegram', 'Telegram', 'brend nomi o’zgarishsiz qoladi'],
  ["iPhone'da: Safari'da «Ulashish»", "iPhone'да: Safari'да «Улашиш»", 'brend lotinda, apostrofli qo’shimcha to’g’ri ulanadi (иПхонеьда эмас)'],
  ["iPhone'да: Safari'да", "iPhone'да: Safari'да", 'allaqachon o’girilgan matn qayta o’girilsa buzilmaydi (иПхонеъда эмас)'],
  ["Android va Chrome orqali, Samsung telefonida", 'Android ва Chrome орқали, Samsung телефонида', 'Android/Chrome/Samsung brendlari lotinda'],
  ['iOS 17 da, iPhone da', 'iOS 17 да, iPhone да', 'iOS/iPhone alohida so’z sifatida'],
  ["KalkiFit ilovasi, KalkiFit'da", "KalkiFit иловаси, KalkiFit'да", 'KalkiFit brendi lotinda (Kalki/KalkiFit)'],
  ["Kalki jamoasi", 'Kalki жамоаси', 'Kalki brendi lotinda'],
  ['Маълумот (JSON)', 'Маълумот (JSON)', 'format nomi lotinda'],
  ["JSON fayl", 'JSON файл', 'JSON lotinda, qolgani o’giriladi'],
  ['PDFga', 'PDF-га', 'brend + qo’shimcha: aralash so’z emas, defis bilan'],
  ['Wordda', 'Word-да', 'brend + qo’shimcha: defis bilan'],

  // ---- aralash matn: qisqartma + o'zbek matn ----
  [
    'MHTEKMning 26,5%idan kam bo' + APOS_ASCII + 'lmasligi kerak',
    'МҲТЕКМнинг 26,5%идан кам бўлмаслиги керак',
    'qisqartma + qo’shimchali so’z'
  ],
  [
    '1 MHTEKM = 1 360 000 so' + APOS_ASCII + 'm',
    '1 МҲТЕКМ = 1 360 000 сўм',
    'qisqartma + raqam + o’zbek so’z'
  ],
  [
    'PDF va CSV formatda',
    'PDF ва CSV форматда',
    'ikkita fayl formati bitta jumlada'
  ],

  // ---- ц-lug'ati: rus tilidan o'zlashgan so'zlarda "s" -> "ц" (qo'shimchalar bilan ham) ----
  ['differensial', 'дифференциал', 'differensial -> дифференциал'],
  ['differensial usulda', 'дифференциал усулда', 'differensial usulda'],
  ['differensialni', 'дифференциални', 'qo’shimcha: differensialni'],
  ['Differensial', 'Дифференциал', 'bosh harf'],
  ['DIFFERENSIAL', 'ДИФФЕРЕНЦИАЛ', 'BARCHA KATTA'],
  ['sement', 'цемент', 'sement -> цемент'],
  ['sementni', 'цементни', 'qo’shimcha: sementni'],
  ['Sement narxi', 'Цемент нархи', 'bosh harf + oddiy so’z'],
  ['funksiya', 'функция', 'funksiya -> функция'],
  ['funksiyasi', 'функцияси', 'qo’shimcha: funksiyasi'],
  ['aksiya', 'акция', 'aksiya -> акция'],
  ['aksiz', 'акциз', 'aksiz -> акциз'],
  ['aksizlar', 'акцизлар', 'qo’shimcha: aksizlar'],
  ['auksion', 'аукцион', 'auksion -> аукцион'],
  ['potensial', 'потенциал', 'potensial -> потенциал'],
  ['prinsip', 'принцип', 'prinsip -> принцип'],
  ['sentner', 'центнер', 'sentner -> центнер'],
  ['sentr', 'центр', 'sentr -> центр'],
  ['kommersiya', 'коммерция', 'kommersiya -> коммерция'],
  ['sikl', 'цикл', 'sikl -> цикл'],
  ['ssenariylarni', 'сценарийларни', 'ssenariy + qo’shimcha'],
  ['stsenariy', 'сценарий', 'stsenariy (ts digrafi) -> сценарий'],
  ['sanksiya', 'санкция', 'sanksiya -> санкция'],
  ['kvitansiya', 'квитанция', 'kvitansiya -> квитанция'],
  ['inflyatsiya', 'инфляция', 'ts digrafi lug’atsiz ham ц'],
  ['kompensatsiya', 'компенсация', 'ts digrafi'],
  ['litsenziya', 'лицензия', 'ts digrafi'],
  ['deklaratsiya', 'декларация', 'ts digrafi'],
  ['politsiya', 'полиция', 'ts digrafi'],
  // lug'atda YO'Q: "с" bilan qoladi
  ['pensiya', 'пенсия', 'pensiya "с" bilan qoladi'],
  ['versiya', 'версия', 'versiya "с" bilan qoladi'],
  ['sessiya', 'сессия', 'sessiya "с" bilan qoladi'],
  ['konsalting', 'консалтинг', 'konsalting "с" bilan'],
  ['sentyabr', 'сентябр', 'sentyabr "с" bilan'],
  ['sertifikat', 'сертификат', 'sertifikat "с" bilan'],

  // ---- AI brend: lotincha qoladi, qo'shimcha defis bilan ----
  ['AI', 'AI', 'AI o’zgarishsiz'],
  ['AIga', 'AI-га', 'AI + qo’shimcha: defis'],
  ['AI' + APOS_ASCII + 'ning', 'AI-нинг', 'AI + apostrofli qo’shimcha'],
  ['AI yordamchi', 'AI ёрдамчи', 'AI + oddiy so’z'],
  ['AI-ariza', 'AI-ариза', 'AI + defis + so’z'],
  ['MAIN', 'МАИН', 'so’z ichidagi "AI" tegilmaydi'],

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
