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
 *
 * Til (2-FAZA): hisobla(kirish, C, lang) — 'uz' (standart) yoki 'ru'.
 * Bandlarning matn qismi (nomi/sabab/matn/ogohlantirish) shu yerda,
 * TXT lug'ati orqali tanlanadi — sonlar va formula lang'ga bog'liq
 * emas, faqat matn.
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

  var TXT = {
    uz: {
      royxat: function (ev) { return "Davlat ro'yxatidan o'tkazish" + (ev ? ' (elektromobil/gibrid)' : ''); },
      texpasport: "Ro'yxatdan o'tkazilganlik guvohnomasi (texpasport)",
      raqamOddiy: 'Davlat raqam belgisi (oddiy)',
      tanlanganRaqam: 'Tanlangan raqam',
      tanlanganRaqamSabab: 'AvtoRaqam ilovasidagi invoys summasi kiritilmagan',
      raqamOtkazish: "Raqamni o'tkazish",
      raqamOtkazishSabab: 'YHXX invoysidagi summa kiritilmagan',
      raqamOtkazishMalumot: "562-son VMQ, 1-band 'g': yagona oshirilgan to'lovning 50 foizi.",
      sayyor: function (kun) { return 'YHXX sayyor xizmati (' + kun + ' kun ichida)'; },
      masofaNomi: 'Yetkazib berish masofasi',
      masofaSabab: 'Masofa (km) kiritilmagan',
      qoshimchaKm: function (km) { return "Yetkazib berish — qo'shimcha " + km + ' km'; },
      notariusBoj: 'Notarius davlat boji',
      omilQarindosh: 'qarindosh ×0,05',
      omilKredit: 'kredit ×0,10',
      omilHalokat: function (p) { return 'halokat qoldiq ×' + p + '%'; },
      qoldiqFoizNomi: 'Amal qilish qoldiq foizi',
      qoldiqFoizSabab: 'Notarius davlat boji hisoblanishi uchun zarur (halokat belgilangan)',
      qoldiqOgohlantirish: "Qoldiq foiz 0-100 oralig'ida bo'lishi kerak",
      gerbYigimi: "Gerb yig'imi",
      hujjatLoyihasi: 'Hujjat loyihasini tuzish',
      tushuntirish: 'Tushuntirish berish',
      taqiqTekshiruv: 'Taqiqlanmaganligini tekshirish',
      ijroTekshiruv: "Ijro hujjatlari bo'yicha qarzdorlikni tekshirish",
      sorovnoma: function (n) { return "So'rovnoma (" + n + ' ta)'; },
      boshqaNotarial: 'Boshqa notarial xizmatlar',
      bankKomissiya: 'Bank komissiyasi (eskrou)',
      bankKomissiyaSabab: 'Eskrou komissiyasi kiritilmagan',
      eskrouMalumot: function (yosh) { return 'Avtomobil yoshi ' + yosh + " yil — hisob-kitob eskrou orqali amalga oshiriladi (3790-son nizom)."; },
      eskrouLabel: 'Eskrou',
      eskrouYilOgohlantirish: 'Eskrou kerakligini aniqlash uchun ishlab chiqarilgan yilni kiriting',
      chegaraOgohlantirish: "Chegara holat — aniq sana bo'yicha notarius yoki bankdan aniqlang",
      notariusOgohlantirish: 'Notarius summasi notarial idorada va jismoniy shaxslar uchun hisoblangan',
      egasiOgohlantirish: "Egasi almashganda ro'yxat stavkasi — normativ talqin, real invoys bilan tasdiqlanmagan"
    },
    ru: {
      royxat: function (ev) { return 'Государственная регистрация' + (ev ? ' (электромобиль/гибрид)' : ''); },
      texpasport: 'Свидетельство о регистрации (техпаспорт)',
      raqamOddiy: 'Госномер (обычный)',
      tanlanganRaqam: 'Выбранный номер',
      tanlanganRaqamSabab: 'Не указана сумма инвойса в приложении AvtoRaqam',
      raqamOtkazish: 'Перенос номера',
      raqamOtkazishSabab: 'Не указана сумма инвойса ГУБДД',
      raqamOtkazishMalumot: "Постановление КМ №562, п.1 'г': 50% от единой повышенной ставки.",
      sayyor: function (kun) { return 'Выездная услуга ГУБДД (в течение ' + kun + ' дн.)'; },
      masofaNomi: 'Расстояние доставки',
      masofaSabab: 'Не указано расстояние (км)',
      qoshimchaKm: function (km) { return 'Доставка — дополнительные ' + km + ' км'; },
      notariusBoj: 'Госпошлина нотариуса',
      omilQarindosh: 'родственник ×0,05',
      omilKredit: 'кредит ×0,10',
      omilHalokat: function (p) { return 'ДТП, остаток ×' + p + '%'; },
      qoldiqFoizNomi: 'Остаточный процент износа',
      qoldiqFoizSabab: 'Необходим для расчёта госпошлины нотариуса (указано ДТП)',
      qoldiqOgohlantirish: 'Остаточный процент должен быть в диапазоне 0-100',
      gerbYigimi: 'Гербовый сбор',
      hujjatLoyihasi: 'Составление проекта документа',
      tushuntirish: 'Разъяснение',
      taqiqTekshiruv: 'Проверка отсутствия запрета',
      ijroTekshiruv: 'Проверка задолженности по исполнительным документам',
      sorovnoma: function (n) { return 'Запрос (' + n + ' шт.)'; },
      boshqaNotarial: 'Другие нотариальные услуги',
      bankKomissiya: 'Комиссия банка (эскроу)',
      bankKomissiyaSabab: 'Не указана комиссия эскроу-счёта',
      eskrouMalumot: function (yosh) { return 'Возраст автомобиля ' + yosh + ' лет — расчёт производится через эскроу-счёт (Положение №3790).'; },
      eskrouLabel: 'Эскроу',
      eskrouYilOgohlantirish: 'Укажите год выпуска, чтобы определить необходимость эскроу',
      chegaraOgohlantirish: 'Граничный случай — уточните точную дату у нотариуса или в банке',
      notariusOgohlantirish: 'Сумма нотариуса рассчитана для нотариальной конторы и физических лиц',
      egasiOgohlantirish: 'При смене владельца ставка регистрации — нормативная трактовка, не подтверждена реальным инвойсом'
    }
  };

  function hisobla(kirish, C, lang) {
    var T = TXT[lang === 'ru' ? 'ru' : 'uz'];
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
    var evGibrid = kirish.yoqilgi === 'ev_gibrid';

    // ---------- ro'yxat ----------
    if (stsenariy === 'yangi') {
      stavkaQator(royxatK, T.royxat(evGibrid), readConst(C, royxatK), 'davlat', 'YHXX');
    } else {
      stavkaQator(royxatK, T.royxat(evGibrid), readConst(C, royxatK), 'davlat', 'YHXX', 'NORMATIV_TALQIN');
    }

    // ---------- texpasport ----------
    stavkaQator('avto_texpasport', T.texpasport, readConst(C, 'avto_texpasport'), 'davlat', 'YHXX');

    // ---------- raqam ----------
    if (kirish.raqam === 'oddiy') {
      stavkaQator('avto_raqam_oddiy_juft', T.raqamOddiy, readConst(C, 'avto_raqam_oddiy_juft'), 'davlat', 'YHXX');
    } else if (kirish.raqam === 'tanlangan') {
      if (kirish.raqam_invoys == null || kirish.raqam_invoys === '') {
        kiritilmagan.push({ nomi: T.tanlanganRaqam, sabab: T.tanlanganRaqamSabab, maydon: 'raqam_invoys' });
      } else {
        kiritilganQator(T.tanlanganRaqam, kirish.raqam_invoys, 'Uzavtomotobelgi');
      }
    } else if (kirish.raqam === 'otkazish') {
      if (kirish.raqam_invoys == null || kirish.raqam_invoys === '') {
        kiritilmagan.push({ nomi: T.raqamOtkazish, sabab: T.raqamOtkazishSabab, maydon: 'raqam_invoys' });
      } else {
        kiritilganQator(T.raqamOtkazish, kirish.raqam_invoys, 'YHXX');
      }
      malumot.push({ nomi: T.raqamOtkazish, matn: T.raqamOtkazishMalumot });
    }

    // ---------- sayyor xizmat (faqat "yangi") ----------
    if (stsenariy === 'yangi' && kirish.sayyor) {
      var sKalit = SAYYOR_KALIT[kirish.sayyor];
      stavkaQator(sKalit, T.sayyor(SAYYOR_KUN[kirish.sayyor]), readConst(C, sKalit), 'davlat', 'YHXX');

      var masofa = kirish.sayyor_masofa_km;
      if (masofa == null || masofa === '') {
        kiritilmagan.push({ nomi: T.masofaNomi, sabab: T.masofaSabab, maydon: 'sayyor_masofa_km' });
      } else {
        var bepulKm = readConst(C, 'avto_sayyor_bepul_km');
        if (masofa > bepulKm) {
          var qoshimchaKm = masofa - bepulKm;
          var kmStavka = readConst(C, 'avto_sayyor_km');
          stavkaQator('avto_sayyor_km', T.qoshimchaKm(qoshimchaKm), qoshimchaKm * kmStavka, 'davlat', 'YHXX');
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
        omillar.push(T.omilQarindosh);
      }
      if (kredit) {
        koeff *= readConst(C, 'notarius_avto_imtiyoz_kredit');
        omillar.push(T.omilKredit);
      }
      if (qarindosh && kredit) readConst(C, 'qoida_notarius_imtiyoz_kombinatsiya');

      var bojKiritilmagan = false;
      if (halokat) {
        if (qoldiqFoiz == null || qoldiqFoiz === '') {
          bojKiritilmagan = true;
        } else {
          readConst(C, 'qoida_notarius_halokat_qoldiq_foiz');
          if (qoldiqFoiz < 0 || qoldiqFoiz > 100) {
            ogohlantirishlar.push(T.qoldiqOgohlantirish);
          }
          koeff *= qoldiqFoiz / 100;
          omillar.push(T.omilHalokat(qoldiqFoiz));
        }
      }

      if (bojKiritilmagan) {
        kiritilmagan.push({ nomi: T.qoldiqFoizNomi, sabab: T.qoldiqFoizSabab, maydon: 'qoldiq_foiz' });
      } else {
        var bojNomi = T.notariusBoj + (omillar.length ? ' (' + omillar.join(' × ') + ')' : '');
        stavkaQator('notarius_avto_oldisotdi', bojNomi, bojStavka * koeff, 'davlat', 'Notarius');
      }

      var gerbliBlank = kirish.gerbli_blank !== false; // standart true
      if (gerbliBlank) {
        var blankSoni = readConst(C, 'notarius_gerb_blank_soni');
        stavkaQator('notarius_gerb_yigimi', T.gerbYigimi, readConst(C, 'notarius_gerb_yigimi') * blankSoni, 'notarius_xizmat', 'Notarius');
      }
      stavkaQator('notarius_xizmat_loyiha_avto', T.hujjatLoyihasi, readConst(C, 'notarius_xizmat_loyiha_avto'), 'notarius_xizmat', 'Notarius');
      stavkaQator('notarius_xizmat_tushuntirish_avto', T.tushuntirish, readConst(C, 'notarius_xizmat_tushuntirish_avto'), 'notarius_xizmat', 'Notarius');
      stavkaQator('notarius_xizmat_taqiq_tekshiruv', T.taqiqTekshiruv, readConst(C, 'notarius_xizmat_taqiq_tekshiruv'), 'notarius_xizmat', 'Notarius');
      stavkaQator('notarius_xizmat_ijro_qarz_tekshiruv', T.ijroTekshiruv, readConst(C, 'notarius_xizmat_ijro_qarz_tekshiruv'), 'notarius_xizmat', 'Notarius');

      var sorovnomaSoni = kirish.notarius_sorovnoma_soni || 0;
      if (sorovnomaSoni > 0) {
        stavkaQator('notarius_xizmat_sorovnoma', T.sorovnoma(sorovnomaSoni), readConst(C, 'notarius_xizmat_sorovnoma') * sorovnomaSoni, 'notarius_xizmat', 'Notarius');
      }

      if (kirish.notarius_boshqa != null && kirish.notarius_boshqa !== '') {
        kiritilganQator(T.boshqaNotarial, kirish.notarius_boshqa, 'Notarius');
      }

      ogohlantirishlar.push(T.notariusOgohlantirish);
      ogohlantirishlar.push(T.egasiOgohlantirish);

      // ---------- eskrou ----------
      if (kirish.ishlab_chiqarilgan_yil == null || kirish.ishlab_chiqarilgan_yil === '') {
        ogohlantirishlar.push(T.eskrouYilOgohlantirish);
      } else {
        var chegaraYil = readConst(C, 'eskrou_yosh_chegarasi_yil');
        var yosh = kirish.bugungi_yil - kirish.ishlab_chiqarilgan_yil;
        if (yosh <= chegaraYil) {
          if (yosh === chegaraYil) {
            ogohlantirishlar.push(T.chegaraOgohlantirish);
          }
          malumot.push({ nomi: T.eskrouLabel, matn: T.eskrouMalumot(yosh) });
          if (kirish.bank_komissiya == null || kirish.bank_komissiya === '') {
            kiritilmagan.push({ nomi: T.bankKomissiya, sabab: T.bankKomissiyaSabab, maydon: 'bank_komissiya' });
          } else {
            kiritilganQator(T.bankKomissiya, kirish.bank_komissiya, 'Bank');
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
