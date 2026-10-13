/* kalki.uz -- lotin (uz-Latn) -> kirill (uz-Cyrl) transliteratsiyasi.
 *
 * YAGONA MANBA: bu fayl ham Node'da (prerender, tools/translit.js orqali),
 * ham brauzerda (assets/cyr.js, window.KalkiTranslit) ishlaydi.
 *
 * FAQAT BIR TOMONLAMA: lotin -> kirill. Teskarisi (kirill -> lotin)
 * kerak emas va qo'llab-quvvatlanmaydi.
 *
 * Bu -- sof matn funksiyasi (DOM'ga tegmaydi). Chaqiruvchi kod (masalan
 * prerender.js, keyingi FAZA'da) uni faqat matn tugunlariga (textContent)
 * qo'llashi kerak -- HTML teglari va atributlariga emas. URL, email,
 * telefon raqam va qisqartmalar shu modulning o'zi tomonidan
 * himoyalanadi (pastga qarang).
 *
 * Barcha maxsus Unicode belgilar \uXXXX qochish ketma-ketligi bilan
 * yozilgan (manba faylida "buzuq" ko'rinishdagi belgilarga yo'l
 * qo'ymaslik uchun) -- faqat KIRILL HARFLARI (string QIYMATLARI
 * ichida, identifikatorlarda emas) to'g'ridan-to'g'ri yozilgan.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KalkiTranslit = factory();
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

// Apostrof turlari: ASCII to'g'ri qo'shtirnoq (U+0027), o'ng bitta
// qo'shtirnoq / "aqlli qo'shtirnoq" (U+2019), harf-shaklidagi teskari
// vergul (U+02BB, o'zbek nashrlarida keng ishlatiladi).
var APOS_ASCII = '\u0027';
var APOS_CURLY = '’';
var APOS_MODLETTER = 'ʻ';
var APOS_CHARS = APOS_ASCII + APOS_CURLY + APOS_MODLETTER;

// Placeholder markerlari -- Unicode Private Use Area (matnda deyarli
// hech qachon tabiiy ravishda uchramaydi, shuning uchun haqiqiy
// raqamlar bilan chalkashmaydi).
var PH_OPEN = '';
var PH_CLOSE = '';

/* Lotincha QOLADIGAN so'zlar: faqat brend nomlari va fayl formatlari.
 * O'zbekcha qisqartmalar (QQS, DTM, YHXX, MHTEKM, BHM, ST-1) bu yerda YO'Q:
 * ular harfma-harf kirillga o'giriladi (QQS -> ҚҚС, DTM -> ДТМ). Kengaytirilishi mumkin (translit(text, {abbr: [...]}) orqali
 * qo'shimcha so'zlar berish mumkin -- standart ro'yxatni almashtirmaydi,
 * unga qo'shiladi). Katta-kichik harf ANIQ mos kelishi kerak. */
var DEFAULT_ABBR = [
  'Kalki.uz', 'kalki.uz', 'Telegram',
  'PDF', 'CSV', 'Word', 'Excel', 'AI',
  'Anthropic', 'Google', 'Analytics', 'AdSense', 'Cloudflare', 'localStorage',
  '@achchi90', '@kalki_uz', 'achchi90', 'kalki_uz'
];

/* Rus tilidan o'zlashgan so'zlarda lotincha "s" kirillda "ц" bo'ladi (sement -> цемент),
 * lekin pensiya/versiya/sessiya/konsalting/sentyabr/sertifikat "с" bilan qoladi.
 * Buni QOIDA bilan aniqlab bo'lmaydi — shuning uchun LUG'AT: faqat shu ildizlar.
 * Kalit — so'z BOSHIDAGI ildiz (kichik harf); qo'shimcha qismi odatiy tarzda o'giriladi
 * (differensialni -> дифференциални, funksiyasi -> функцияси). "ts" bilan yozilganlar
 * (inflyatsiya, kompensatsiya, litsenziya, deklaratsiya) lug'atsiz ham "ц" bo'ladi.
 * Ro'yxat sayt matnini RU sahifalar bilan solishtirib tuzilgan (tools/matn-istisno.json izohi). */
var TS_DICT = [
  ['differensial', 'дифференциал'], ['funksiya', 'функция'], ['funksional', 'функционал'],
  ['potensial', 'потенциал'], ['prinsip', 'принцип'], ['sement', 'цемент'],
  ['sentner', 'центнер'], ['sentr', 'центр'], ['kommersiya', 'коммерция'],
  ['sikl', 'цикл'], ['aksiya', 'акция'], ['aksiz', 'акциз'], ['auksion', 'аукцион'],
  ['fraksiya', 'фракция'], ['kvitansiya', 'квитанция'], ['proporsional', 'пропорционал'],
  ['sanksiya', 'санкция'], ['silindr', 'цилиндр'], ['sirkul', 'циркул'],
  ['ssenariy', 'сценарий']
];
TS_DICT.sort(function (a, b) { return b[0].length - a[0].length; });   // uzunroq ildiz avval

function tsLookup(lowerWord) {
  for (var k = 0; k < TS_DICT.length; k++) {
    if (lowerWord.indexOf(TS_DICT[k][0]) === 0) return TS_DICT[k];
  }
  return null;
}

// Bitta harfga to'g'ridan-to'g'ri mos keladigan oddiy harflar (kichik
// registr). Katta registr chaqiruv vaqtida hisoblanadi (applyCase).
var SINGLE = {
  a: 'а', // a
  b: 'б', // b
  d: 'д', // d
  f: 'ф', // f
  g: 'г', // g
  h: 'ҳ', // h (uzbek-specific "ha")
  i: 'и', // i
  j: 'ж', // j
  k: 'к', // k
  l: 'л', // l
  m: 'м', // m
  n: 'н', // n
  o: 'о', // o
  p: 'п', // p
  q: 'қ', // q (uzbek-specific "qa")
  r: 'р', // r
  s: 'с', // s
  t: 'т', // t
  u: 'у', // u
  v: 'в', // v
  x: 'х', // x
  y: 'й', // y
  z: 'з', // z
  // c -- lotin o'zbek alifbosida mustaqil harf emas. "ts" digraf
  // sifatida alohida ishlov beriladi (pastga qarang); yakka "c" duch
  // kelsa (kam uchraydi, masalan xorijiy so'zda) "k" bilan bir xil
  // ko'riladi, ehtiyot chorasi.
  c: 'к'
};

/* Ikki harfdan bitta kirill harfiga tushadigan digraflar. "ng" BU
 * YERDA YO'Q -- u alohida harf emas, "n"+"g" ning oddiy ketma-ketligi
 * ("нг"), maxsus ishlov shart emas (spec: "Alohida harf
 * emas, ikki harf"). o'/g' apostrof-birikmalari ham alohida, pastda. */
var DIGRAPH = [
  ['s', 'h', 'ш'], // sh -> sh (cyrillic sha)
  ['c', 'h', 'ч'], // ch -> ch (cyrillic che)
  ['t', 's', 'ц'], // ts -> ts (cyrillic tse)
  ['y', 'o', 'ё'], // yo -> yo (cyrillic yo)
  ['y', 'u', 'ю'], // yu -> yu (cyrillic yu)
  ['y', 'a', 'я']  // ya -> ya (cyrillic ya)
];

var E_START = 'э'; // cyrillic e -- faqat yakka "e" so'z boshida (masalan eshik)
var E_MID = 'е';   // cyrillic ie -- "ye" digrafida (har doim) va yakka "e" so'z ichida
var TUTUQ = 'ъ';   // cyrillic hard sign (tutuq belgisi)
var OG_APOS = { o: 'ў', g: 'ғ' }; // o' -> o with breve equivalent (uzbek), g' -> g with stroke (uzbek)

function isUpperChar(ch) {
  return ch !== ch.toLowerCase() && ch === ch.toUpperCase();
}
function applyCase(cyr, sourceFirstChar) {
  return isUpperChar(sourceFirstChar) ? cyr.toUpperCase() : cyr;
}

function isApos(ch) {
  return ch === APOS_ASCII || ch === APOS_CURLY || ch === APOS_MODLETTER;
}

/* Bitta "so'z" (faqat lotin harflari + apostrof-belgilar ketma-ketligi)
 * ustida ishlaydi. i===0 -- shu so'zning eng boshi. */
function translitWord(word, notStart) {
  var out = '';
  var i = 0;
  var n = word.length;
  if (!notStart) {
    var hit = tsLookup(word.toLowerCase());
    if (hit) {
      var stem = word.slice(0, hit[0].length);
      var cyr = hit[1];
      if (stem === stem.toUpperCase() && stem !== stem.toLowerCase() && (word.length > 1) && word === word.toUpperCase()) cyr = cyr.toUpperCase();
      else if (isUpperChar(stem[0])) cyr = cyr.charAt(0).toUpperCase() + cyr.slice(1);
      return cyr + (word.length > stem.length ? translitWord(word.slice(stem.length), true) : '');
    }
  }
  while (i < n) {
    var ch = word[i];
    var lower = ch.toLowerCase();
    var atStart = (i === 0 && !notStart);

    // 1) o' / g' (uchala apostrof turi ham)
    if ((lower === 'o' || lower === 'g') && i + 1 < n && isApos(word[i + 1])) {
      out += applyCase(OG_APOS[lower], ch);
      i += 2;
      continue;
    }

    // 2) ikki harfli digraflar (sh, ch, ts, yo, yu, ya)
    var matched = null;
    for (var d = 0; d < DIGRAPH.length; d++) {
      var first = DIGRAPH[d][0], second = DIGRAPH[d][1];
      if (i + 1 < n && lower === first && word[i + 1].toLowerCase() === second) {
        // "yo'" (yo'q, yo'l) -- bu "ё" emas, "й" + "ў": apostrofli "o'" keyingi
        // bosqichda ("ў") alohida ishlanadi (tuzatildi 2026-10: oldin "ёъқ" chiqardi).
        if (first === 'y' && second === 'o' && i + 2 < n && isApos(word[i + 2])) continue;
        matched = DIGRAPH[d][2];
        break;
      }
    }
    if (matched) {
      out += applyCase(matched, ch);
      i += 2;
      continue;
    }

    // 3) "ye" -- HAR DOIM cyrillic-ie (e), pozitsiyadan qat'i nazar.
    // Tuzatildi (2026-09): dastlabki qoida teskari edi ("ye so'z
    // boshida -> cyrillic-e" deb yozilgan edi). Haqiqiy qoida: o'zbek
    // kirill yozuvida cyrillic-ie harfi (е) ALLAQACHON "ye" tovushini
    // ifodalaydi (yer -> yer-e, yetti -> yet-t-i, yengil -> yen-g-i-l),
    // cyrillic-e (э) esa faqat SOF "e" tovushi uchun (so'z boshidagi
    // yakka "e", masalan eshik -> e-sh-i-k). Shuning uchun "ye" digrafi
    // pozitsiyasidan qat'i nazar doim bitta natija beradi.
    if (lower === 'y' && i + 1 < n && word[i + 1].toLowerCase() === 'e') {
      out += applyCase(E_MID, ch);
      i += 2;
      continue;
    }

    // 4) yakka "e" -- so'z boshida cyrillic-e, so'z ichida cyrillic-ie
    if (lower === 'e') {
      out += applyCase(atStart ? E_START : E_MID, ch);
      i += 1;
      continue;
    }

    // 5) tutuq belgisi (o'/g' bo'lmagan apostrof)
    if (isApos(ch)) {
      out += TUTUQ;
      i += 1;
      continue;
    }

    // 6) oddiy bitta harf
    if (SINGLE[lower] !== undefined) {
      out += applyCase(SINGLE[lower], ch);
      i += 1;
      continue;
    }

    // Kutilmagan belgi -- o'zgarishsiz qo'shiladi (ehtiyot chorasi).
    out += ch;
    i += 1;
  }
  return out;
}

function isWordChar(ch) {
  if (ch >= 'A' && ch <= 'Z') return true;
  if (ch >= 'a' && ch <= 'z') return true;
  return isApos(ch);
}

/* Matnni "translit-layiq" (lotin harf + apostrof-belgi) va "boshqa"
 * (bo'shliq, tinish belgisi, raqam, va h.k.) qismlarga bo'lib, faqat
 * birinchisini o'giradi. */
function translitPlain(text) {
  var out = '';
  var i = 0;
  var n = text.length;
  while (i < n) {
    if (isWordChar(text[i])) {
      var j = i + 1;
      while (j < n && isWordChar(text[j])) j++;
      out += translitWord(text.slice(i, j));
      i = j;
    } else {
      out += text[i];
      i++;
    }
  }
  return out;
}

/* URL, email, telefon raqam kabi naqshlar -- translitdan butunlay
 * himoyalanadi (placeholder bilan almashtirilib, oxirida asl holicha
 * qaytariladi). */
var PROTECT_PATTERNS = [
  /https?:\/\/[^\s<>"']+/g,             // URL
  /[\w.+-]+@[\w-]+\.[\w.-]+/g,          // email
  /\+?\d[\d\s\-()]{6,}\d/g              // telefon (qo'pol taxmin)
];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {string} text -- lotin (uz-Latn) matn.
 * @param {{abbr?: string[]}} [opts] -- abbr: standart qisqartmalar
 *   ro'yxatiga QO'SHIMCHA saqlanadigan so'zlar (standartni almashtirmaydi).
 * @returns {string} kirill (uz-Cyrl) matn.
 */
function translit(text, opts) {
  if (text == null) return text;
  text = String(text);
  if (!text) return text;

  var abbrList = DEFAULT_ABBR.concat((opts && opts.abbr) || []);
  // Uzunroq qisqartmalar avval tekshirilsin (masalan "ST-1" "ST"dan oldin).
  abbrList.sort(function (a, b) { return b.length - a.length; });

  var placeholders = [];
  function protect(re) {
    text = text.replace(re, function (m) {
      var idx = placeholders.length;
      placeholders.push(m);
      return PH_OPEN + idx + PH_CLOSE;
    });
  }

  // 1) URL / email / telefon
  PROTECT_PATTERNS.forEach(protect);

  // 2) qisqartmalar -- aniq (case-sensitive) matn sifatida himoyalanadi.
  // "PDFga" kabi qo'shimchali holatlarda ildiz "PDF" himoyalanadi,
  // qolgan qism ("ga") keyingi bosqichda oddiy tarzda o'giriladi.
  // Brend/format harfga yopishgan qo'shimcha bilan kelsa ("Wordga") aralash
  // alifbo hosil bo'lmasin: brend + defis + o'girilgan qo'shimcha ("Word-га").
  abbrList.forEach(function (abbr) {
    var ab = escapeRegExp(abbr);
    var before = '(?<![A-Za-z' + APOS_CHARS + '])';   // so'z ichida emas ("MAIN" ichidagi "AI" tegilmaydi)
    // qo'shimcha bilan: AIga / AI'ning -> "AI-га" / "AI-нинг" (apostrof yutiladi)
    text = text.replace(new RegExp(before + ab + '[' + APOS_CHARS + ']?(?=[A-Za-z])', 'g'), function (m) {
      var idx = placeholders.length;
      placeholders.push(abbr);
      return PH_OPEN + idx + PH_CLOSE + '-';
    });
    protect(new RegExp(before + ab + '(?![A-Za-z])', 'g'));
  });

  // 3) qolgan matnni translit qilish
  text = translitPlain(text);

  // 4) placeholderlarni asl holiga qaytarish. PH_OPEN/PH_CLOSE Private
  // Use Area belgilari bo'lgani uchun matndagi haqiqiy raqamlar bilan
  // chalkashmaydi (oddiy /(\d+)/g bilan tiklash XATO bo'lardi -- u
  // "1 360 000" kabi haqiqiy raqamlarni ham index deb adashtirardi).
  var restoreRe = new RegExp(PH_OPEN + '(\\d+)' + PH_CLOSE, 'g');
  text = text.replace(restoreRe, function (_, idx) {
    return placeholders[Number(idx)];
  });

  return text;
}

return { translit: translit, DEFAULT_ABBR: DEFAULT_ABBR };
});
