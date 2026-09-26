/* kalki.uz — avtomobil rasmiylashtirish hisoblash dvigateli.
 *
 * DOM'ga TEGMAYDIGAN sof funksiya. Node'da (tools/test-avto.js) ham,
 * brauzerda (avto-rasmiylashtirish.html) ham bir xil ishlaydi — UMD.
 *
 * Konstanta o'qish yagona yordamchi funksiya (readConst) orqali: holati
 * TASDIQLANGAN yoki NORMATIV_TALQIN bo'lmasa (masalan ZIDDIYAT yoki
 * BLOKLANGAN) — xato tashlaydi. Shu bilan kelajakda holat o'zgarsa ham
 * (masalan hali tasdiqlanmagan konstanta koddan tasodifan ishlatilib
 * ketmaydi) himoyalangan bo'ladi.
 *
 * Formatlash (raqamni bo'shliq bilan ajratish) BU YERDA emas — UI'da.
 * Summalar butun so'mga yaxlitlangan holda (Math.round) qaytariladi.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.KalkiAvto = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var OK_HOLAT = { TASDIQLANGAN: 1, NORMATIV_TALQIN: 1 };

  function readConst(C, id) {
    var c = C[id];
    if (!c) throw new Error('Konstanta topilmadi: ' + id);
    if (!OK_HOLAT[c.holat]) {
      throw new Error('Konstanta holati hisobda ishlatib bo\'lmaydi: ' + id + ' (' + c.holat + ')');
    }
    return c.qiymat;
  }

  var SAYYOR_KALIT = { '1kun': 'avto_sayyor_1kun', '3kun': 'avto_sayyor_3kun', '5kun': 'avto_sayyor_5kun' };
  var SAYYOR_KUN = { '1kun': 1, '3kun': 3, '5kun': 5 };

  function royxatKalit(yoqilgi) {
    return yoqilgi === 'ev_gibrid' ? 'avto_royxat_ev_gibrid' : 'avto_royxat_oddiy';
  }

  function hisobla(kirish, C) {
    var B = readConst(C, 'bhm_qiymati');
    var qatorlar = [];
    var kiritilmagan = [];
    var malumot = [];
    var ogohlantirishlar = [];

    // Bitta stavka-asosli qator qo'shadi. holatOverride berilsa — qatorning
    // "holat"i konstantaning o'z holatidan farqli ko'rsatiladi (masalan
    // "ishlatilgan" stsenariysida ro'yxat stavkasi TASDIQLANGAN, lekin
    // egasi almashishiga qo'llanishi NORMATIV_TALQIN).
    function stavkaQator(kalit, nomi, stavkaBhm, guruh, qayerga, holatOverride) {
      var summa = Math.round(stavkaBhm * B);
      qatorlar.push({
        guruh: guruh,
        nomi: nomi,
        summa: summa,
        stavka_bhm: stavkaBhm,
        kalit: kalit,
        qayerga: qayerga,
        holat: holatOverride || C[kalit].holat
      });
      return summa;
    }

    function kiritilganQator(nomi, summa, qayerga) {
      qatorlar.push({
        guruh: 'kiritilgan', nomi: nomi, summa: Math.round(summa),
        stavka_bhm: null, kalit: null, qayerga: qayerga, holat: 'KIRITILGAN'
      });
    }

    var stsenariy = kirish.stsenariy;
    var royxatK = royxatKalit(kirish.yoqilgi);

    // ---------- ro'yxat ----------
    if (stsenariy === 'yangi') {
      stavkaQator(royxatK,
        kirish.yoqilgi === 'ev_gibrid' ? "Davlat ro'yxatidan o'tkazish (elektromobil/gibrid)" : "Davlat ro'yxatidan o'tkazish",
        readConst(C, royxatK), 'davlat', 'YHXX');
    } else {
      stavkaQator(royxatK,
        kirish.yoqilgi === 'ev_gibrid' ? "Davlat ro'yxatidan o'tkazish (elektromobil/gibrid)" : "Davlat ro'yxatidan o'tkazish",
        readConst(C, royxatK), 'davlat', 'YHXX', 'NORMATIV_TALQIN');
    }

    // ---------- texpasport ----------
    stavkaQator('avto_texpasport', "Ro'yxatdan o'tkazilganlik guvohnomasi (texpasport)",
      readConst(C, 'avto_texpasport'), 'davlat', 'YHXX');

    // ---------- raqam ----------
    if (kirish.raqam === 'oddiy') {
      stavkaQator('avto_raqam_oddiy_juft', "Davlat raqam belgisi (oddiy)",
        readConst(C, 'avto_raqam_oddiy_juft'), 'davlat', 'YHXX');
    } else if (kirish.raqam === 'tanlangan') {
      if (kirish.raqam_invoys == null || kirish.raqam_invoys === '') {
        kiritilmagan.push({ nomi: 'Tanlangan raqam', sabab: 'AvtoRaqam ilovasidagi invoys summasi kiritilmagan', maydon: 'raqam_invoys' });
      } else {
        kiritilganQator('Tanlangan raqam', kirish.raqam_invoys, 'Uzavtomotobelgi');
      }
    } else if (kirish.raqam === 'otkazish') {
      if (kirish.raqam_invoys == null || kirish.raqam_invoys === '') {
        kiritilmagan.push({ nomi: "Raqamni o'tkazish", sabab: 'YHXX invoysidagi summa kiritilmagan', maydon: 'raqam_invoys' });
      } else {
        kiritilganQator("Raqamni o'tkazish", kirish.raqam_invoys, 'YHXX');
      }
      malumot.push({ nomi: "Raqamni o'tkazish", matn: "562-son VMQ, 1-band ‘g’: yagona oshirilgan to'lovning 50 foizi." });
    }

    // ---------- sayyor xizmat (faqat "yangi") ----------
    if (stsenariy === 'yangi' && kirish.sayyor) {
      var sKalit = SAYYOR_KALIT[kirish.sayyor];
      stavkaQator(sKalit, 'YHXX sayyor xizmati (' + SAYYOR_KUN[kirish.sayyor] + ' kun ichida)',
        readConst(C, sKalit), 'davlat', 'YHXX');

      var masofa = kirish.sayyor_masofa_km;
      if (masofa == null || masofa === '') {
        kiritilmagan.push({ nomi: 'Yetkazib berish masofasi', sabab: 'Masofa (km) kiritilmagan', maydon: 'sayyor_masofa_km' });
      } else {
        var bepulKm = readConst(C, 'avto_sayyor_bepul_km');
        if (masofa > bepulKm) {
          var qoshimchaKm = masofa - bepulKm;
          var kmStavka = readConst(C, 'avto_sayyor_km');
          stavkaQator('avto_sayyor_km', 'Yetkazib berish — qo‘shimcha ' + qoshimchaKm + ' km',
            qoshimchaKm * kmStavka, 'davlat', 'YHXX');
        }
      }
    }

    // ---------- notarius (faqat "ishlatilgan") ----------
    if (stsenariy === 'ishlatilgan') {
      var bojStavka = readConst(C, 'notarius_avto_oldisotdi');
      var qarindosh = !!kirish.qarindosh;
      var kredit = !!kirish.kredit;
      var halokat = !!kirish.halokat;
      var qoldiqFoiz = kirish.qoldiq_foiz;

      // Qarindosh va kredit imtiyozlari birga tanlanganda KO'PAYTIRILADI,
      // halokatda qoldiq foiz omili ham shu ko'paytmaga qo'shiladi —
      // e-notarius rasmiy kalkulyatorida tasdiqlangan (2-FAZA, 2.1/2.2).
      var koeff = 1;
      var omillar = [];
      if (qarindosh) {
        koeff *= readConst(C, 'notarius_avto_imtiyoz_qarindosh');
        omillar.push('qarindosh ×0,05');
      }
      if (kredit) {
        koeff *= readConst(C, 'notarius_avto_imtiyoz_kredit');
        omillar.push('kredit ×0,10');
      }
      if (qarindosh && kredit) readConst(C, 'qoida_notarius_imtiyoz_kombinatsiya');

      var bojKiritilmagan = false;
      if (halokat) {
        if (qoldiqFoiz == null || qoldiqFoiz === '') {
          bojKiritilmagan = true;
        } else {
          readConst(C, 'qoida_notarius_halokat_qoldiq_foiz');
          if (qoldiqFoiz < 0 || qoldiqFoiz > 100) {
            ogohlantirishlar.push("Qoldiq foiz 0-100 oralig'ida bo'lishi kerak");
          }
          koeff *= qoldiqFoiz / 100;
          omillar.push('halokat qoldiq ×' + qoldiqFoiz + '%');
        }
      }

      if (bojKiritilmagan) {
        kiritilmagan.push({ nomi: 'Amal qilish qoldiq foizi', sabab: 'Notarius davlat boji hisoblanishi uchun zarur (halokat belgilangan)', maydon: 'qoldiq_foiz' });
      } else {
        var bojNomi = 'Notarius davlat boji' + (omillar.length ? ' (' + omillar.join(' × ') + ')' : '');
        stavkaQator('notarius_avto_oldisotdi', bojNomi, bojStavka * koeff, 'davlat', 'Notarius');
      }

      var gerbliBlank = kirish.gerbli_blank !== false; // standart true
      if (gerbliBlank) {
        var blankSoni = readConst(C, 'notarius_gerb_blank_soni');
        stavkaQator('notarius_gerb_yigimi', "Gerb yig'imi",
          readConst(C, 'notarius_gerb_yigimi') * blankSoni, 'notarius_xizmat', 'Notarius');
      }
      stavkaQator('notarius_xizmat_loyiha_avto', 'Hujjat loyihasini tuzish',
        readConst(C, 'notarius_xizmat_loyiha_avto'), 'notarius_xizmat', 'Notarius');
      stavkaQator('notarius_xizmat_tushuntirish_avto', 'Tushuntirish berish',
        readConst(C, 'notarius_xizmat_tushuntirish_avto'), 'notarius_xizmat', 'Notarius');
      stavkaQator('notarius_xizmat_taqiq_tekshiruv', "Taqiqlanmaganligini tekshirish",
        readConst(C, 'notarius_xizmat_taqiq_tekshiruv'), 'notarius_xizmat', 'Notarius');
      stavkaQator('notarius_xizmat_ijro_qarz_tekshiruv', 'Ijro hujjatlari bo‘yicha qarzdorlikni tekshirish',
        readConst(C, 'notarius_xizmat_ijro_qarz_tekshiruv'), 'notarius_xizmat', 'Notarius');

      var sorovnomaSoni = kirish.notarius_sorovnoma_soni || 0;
      if (sorovnomaSoni > 0) {
        stavkaQator('notarius_xizmat_sorovnoma', "So'rovnoma (" + sorovnomaSoni + ' ta)',
          readConst(C, 'notarius_xizmat_sorovnoma') * sorovnomaSoni, 'notarius_xizmat', 'Notarius');
      }

      if (kirish.notarius_boshqa != null && kirish.notarius_boshqa !== '') {
        kiritilganQator('Boshqa notarial xizmatlar', kirish.notarius_boshqa, 'Notarius');
      }

      ogohlantirishlar.push('Notarius summasi notarial idorada va jismoniy shaxslar uchun hisoblangan');
      ogohlantirishlar.push('Egasi almashganda ro‘yxat stavkasi — normativ talqin, real invoys bilan tasdiqlanmagan');

      // ---------- eskrou ----------
      if (kirish.ishlab_chiqarilgan_yil == null || kirish.ishlab_chiqarilgan_yil === '') {
        ogohlantirishlar.push('Eskrou kerakligini aniqlash uchun ishlab chiqarilgan yilni kiriting');
      } else {
        var chegaraYil = readConst(C, 'eskrou_yosh_chegarasi_yil');
        var yosh = kirish.bugungi_yil - kirish.ishlab_chiqarilgan_yil;
        if (yosh <= chegaraYil) {
          if (yosh === chegaraYil) {
            ogohlantirishlar.push('Chegara holat — aniq sana bo‘yicha notarius yoki bankdan aniqlang');
          }
          malumot.push({ nomi: 'Eskrou', matn: 'Avtomobil yoshi ' + yosh + ' yil — hisob-kitob eskrou orqali amalga oshiriladi (3790-son nizom).' });
          if (kirish.bank_komissiya == null || kirish.bank_komissiya === '') {
            kiritilmagan.push({ nomi: 'Bank komissiyasi', sabab: 'Eskrou komissiyasi kiritilmagan', maydon: 'bank_komissiya' });
          } else {
            kiritilganQator('Bank komissiyasi (eskrou)', kirish.bank_komissiya, 'Bank');
          }
        }
      }
    }

    var jami = 0;
    for (var i = 0; i < qatorlar.length; i++) jami += qatorlar[i].summa;

    return {
      qatorlar: qatorlar,
      kiritilmagan: kiritilmagan,
      malumot: malumot,
      jami_hisoblangan: jami,
      ogohlantirishlar: ogohlantirishlar
    };
  }

  return { hisobla: hisobla, readConst: readConst };
}));
