/* Kalki.uz — hisob siyosati generatori mantiqi.
   assets/docgen.js'ning yordamchi funksiyalaridan (KD.blocksToHtml,
   KD.buildDocx, KD.loadDocx, KD.saveBlob) foydalanadi, lekin uni
   o'zgartirmaydi — bu alohida modul, chunki bu yerdagi band+profil+
   tanlov_erkinligi filtrlash mantiqi boshqa hech qanday hujjat
   generatorida yo'q (docs/hisob-siyosati-audit.md, FAZA 0, 1.2-band).

   To'lov qatlami hali ulanmagan (arxitektura-siyosati.md, 1.5-band):
   PREMIUM.yoqilgan har doim false turadi FAZA 1-2-3 davomida. Bu obyekt
   orqali BARCHA "pullik" mantiq o'tadi — hozircha hech narsa emas.
*/
(function (root) {
  'use strict';

  var KD = root.KalkiDoc;
  var HS = {};

  var PREMIUM = {
    yoqilgan: false,
    ochish: function () { return false; }
  };
  HS.PREMIUM = PREMIUM;

  /* ---------- profil aniqlash: 2 savol -> 6 profildan biri ---------- */
  var PROFILE_MAP = {
    savdo: { yoq: 'P1', ha: 'P2' },
    ishlab_chiqarish: { yoq: 'P3', ha: 'P4' },
    xizmat: { yoq: 'P5', ha: 'P6' }
  };

  HS.resolveProfile = function (faoliyat, qqs) {
    var row = PROFILE_MAP[faoliyat] || PROFILE_MAP.savdo;
    return row[qqs] || row.yoq;
  };

  /* ---------- bandlarni hujjat + profil bo'yicha filtrlash ---------- */
  HS.bandsFor = function (data, hujjat, profil) {
    return (data.bandlar || []).filter(function (b) {
      return b.hujjat === hujjat && b.profillar.indexOf(profil) > -1;
    });
  };

  // Bo'lim tartibi — bandlar massividagi birinchi uchrashuv tartibi bo'yicha
  // (data/hisob-siyosati.json'da bandlar allaqachon bo'lim tartibida yozilgan).
  HS.byBolim = function (bands) {
    var order = [], map = {};
    bands.forEach(function (b) {
      if (!map[b.bolim]) { map[b.bolim] = []; order.push(b.bolim); }
      map[b.bolim].push(b);
    });
    return order.map(function (bo) { return { bolim: bo, items: map[bo] }; });
  };

  function L(uz, ru, lang) { return lang === 'ru' ? (ru || uz) : uz; }

  var TXT = {
    placeholder: { uz: "[Ushbu band buxgalter tomonidan to'ldiriladi]", ru: '[Этот пункт заполняется бухгалтером]' },
    qatiyNote: {
      uz: "Tanlov ko'rsatilmaydi — qonun bo'yicha faqat shu usul qo'llaniladi.",
      ru: 'Выбор не предоставляется — по закону применяется только этот метод.'
    },
    tanlangan: { uz: 'Tanlangan variant: ', ru: 'Выбранный вариант: ' },
    rekvizitlar: { uz: 'Rekvizitlar', ru: 'Реквизиты' }
  };

  // Band uchun "hozir tanlangan" variant kodini aniqlaydi: foydalanuvchi
  // aniq tanlagan bo'lsa o'shani, aks holda joriy profilga tavsiya
  // etilganini, aks holda ro'yxatdagi birinchisini.
  HS.pickVariant = function (band, profil, chosenKod) {
    var vlist = band.variantlar || [];
    if (!vlist.length) return null;
    if (chosenKod) {
      var found = vlist.filter(function (v) { return v.kod === chosenKod; })[0];
      if (found) return found;
    }
    var byProfile = vlist.filter(function (v) {
      return v.tavsiya_profillar && v.tavsiya_profillar.indexOf(profil) > -1;
    })[0];
    return byProfile || vlist[0];
  };

  // Bitta bandni preview blocklariga aylantiradi. `chosenKod` — foydalanuvchi
  // shu band uchun tanlagan variant kodi (agar bo'lsa), state.variants dan.
  HS.bandToBlocks = function (band, lang, profil, chosenKod) {
    var out = [];
    out.push({ k: 'h', text: L(band.sarlavha_uz, band.sarlavha_ru, lang) });

    var vlist = band.variantlar || [];
    var isQatiy = band.tanlov_erkinligi === 'qatiy';
    var chosen = HS.pickVariant(band, profil, chosenKod);

    if (isQatiy) {
      if (chosen) out.push({ k: 'p', text: L(chosen.nom_uz, chosen.nom_ru, lang) });
      out.push({ k: 'note', text: L(TXT.qatiyNote.uz, TXT.qatiyNote.ru, lang) });
    } else if (vlist.length > 1 && chosen) {
      out.push({ k: 'p', text: L(TXT.tanlangan.uz, TXT.tanlangan.ru, lang) + L(chosen.nom_uz, chosen.nom_ru, lang) });
    } else if (chosen) {
      out.push({ k: 'p', text: L(chosen.nom_uz, chosen.nom_ru, lang) });
    }

    var matn = chosen ? L(chosen.matn_uz, chosen.matn_ru, lang) : null;
    out.push({ k: 'note', text: matn || L(TXT.placeholder.uz, TXT.placeholder.ru, lang) });
    return out;
  };

  // Butun hujjat (BUP yoki NUP) uchun to'liq blok ro'yxati.
  // reqLines — rekvizit qatorlari (forma maydonlaridan tayyorlangan matn massivi).
  HS.buildDocBlocks = function (opts) {
    var data = opts.data, hujjat = opts.hujjat, profil = opts.profil,
      lang = opts.lang, variants = opts.variants || {}, reqLines = opts.reqLines || [];
    var blocks = [];
    blocks.push({ k: 'title', text: opts.title });
    if (opts.subtitle) blocks.push({ k: 'sub', text: opts.subtitle });
    if (reqLines.length) {
      blocks.push({ k: 'h', text: L(TXT.rekvizitlar.uz, TXT.rekvizitlar.ru, lang) });
      reqLines.forEach(function (t) { blocks.push({ k: 'p', text: t }); });
      blocks.push({ k: 'gap' });
    }
    HS.byBolim(HS.bandsFor(data, hujjat, profil)).forEach(function (g) {
      blocks.push({ k: 'h', text: g.bolim });
      g.items.forEach(function (b) {
        blocks = blocks.concat(HS.bandToBlocks(b, lang, profil, variants[b.id]));
      });
    });
    return blocks;
  };

  root.KalkiHS = HS;
})(typeof window !== 'undefined' ? window : this);

/* Node ostida test qilish uchun */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = (typeof window !== 'undefined' ? window : this).KalkiHS;
}
