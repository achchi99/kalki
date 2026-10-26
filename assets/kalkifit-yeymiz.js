/* kalki.uz — KalkiFit: «Bugun nima yeymiz?» (har chip uchun BITTA umumiy oyna: Kafe va choyxonada · Buyurtma · Uyda; Baliq kuni ham shu komponent), «Yemaydiganlarim», «Boshqa variantlar» (interfeys).
 * Hisob: assets/yeymiz-core.js, cheklov-core.js, uyda-core.js; hisoblagich: hisob-kun.js. kalkifit-app.js dan OLDIN yuklanadi va window.KalkiYeymizUI ni beradi; ilova init() da bog'laydi (api).
 * Faqat IKKI kirish nuqtasi: «Boshqa variantlar» («O'rniga» kartasida) va «Bugun nima yeymiz?» kartasi (Bugun, «Ovqat qo'shish» ostida). */
(function () {
  'use strict';
  var CH = window.KalkiCheklov, YC = window.KalkiYeymiz, UY = window.KalkiUyda, OR = window.KalkiOrinbosar, HS = window.KalkiHisob, PP = window.KalkiUydaPP;
  if (!CH || !YC || !UY || !OR) return;
  var CHIPS = ['kabob', 'suyuq', 'tandir', 'tez', 'baliq'], CHTAGS = ['baliq', 'tuxum', 'sut', 'yongoq', 'glyuten'], LSEG = 'kalki_fit_yseg';
  var D = {
    uz: {
      rBadge: 'Yemaydiganlaringizda', rWarn: "Siz {x} yemaydiganlar ro'yxatiga qo'shgansiz", pCtaForce: "Baribir qo'shish · {k} kkal", ya_baliq: 'baliqni', ya_tuxum: 'tuxumni', ya_sut: 'sut mahsulotlarini', ya_yongoq: "yong'oqni", ya_glyuten: 'glyutenni',
      nyStNo: "Uyda tez tayyorlanadigan sog'lom variantlar", nyStNoS: "Profilni to'ldirsangiz, qolgan kkalga moslab beramiz.", nyStOk: 'Sizga {k} kkal va {p} g oqsil qoldi', nyStOkK: 'Sizga {k} kkal qoldi', nyStOkS: 'Kun vaqtiga mos variantlar tepada.', nyStOkP: 'Oqsilga boy variantlar tepada.', nyStOkPd: "Oqsil me'yori bajarildi — yengil variantlar ham bor.",
      nyStLow: 'Bugungi limit deyarli tugadi — {k} kkal qoldi.', nyStLowP: "Lekin oqsil {p} g kam. Yengil, oqsilga boy variantlar tepada.", nyStLowN: 'Eng yengil variantlar tepada.', nyStOver: 'Bugungi limitga yetdingiz — bu ham yaxshi natija.', nyStOverS: 'Och qolsangiz, eng yengil variantlar tepada.',
      chAll: 'Hammasi', ch5: '⚡ 5 daq gacha', ch15: '15 daq gacha', ch30: '30+ daq', chHave: '🧺 Uyda borlar', chHaveN: '🧺 Uyda borlar · {n}',
      lbBest_b: 'Nonushtaga eng mos', lbBest_l: 'Tushlikka eng mos', lbBest_d: 'Kechki ovqatga eng mos', lbBest_s: 'Tamaddiga eng mos', lbMore: 'Yana variantlar', lbHave: 'Uyda borlardan', lbNeed: 'Yana 1 mahsulot kerak', lbNeedX: 'kerak: {x}', lbFish: 'Baliq kuni — uyda', lbFit: "Bugungi limitga sig'adi", lbOver: 'Bugungi limitdan oshadi', lbPop: 'Mashhur taomlar', lbHalf: 'yarim porsiya — {k} kkal',
      tgOqsil: 'Oqsilga boy', tgYengil: 'yengil', fMin: '{n} daq', fK: '{k} kkal', fP: 'oqsil {p} g', nyNote: "Kkal — taxminiy, bazadagi mahsulotlardan hisoblangan.", nyNoHave: "Shu mahsulotlardan hozircha tayyorlanadigani yo'q — yana bittasini belgilang.", nyNoAll: "Mos retsept topilmadi — boshqa filtrni tanlang.",
      dtMin: 'daqiqa', dtK: 'kkal', dtP: 'oqsil', dtF: "yog'", dtPort: 'Porsiya', dtIng: "Kerak bo'ladi", dtSteps: 'Tayyorlash', dtAte: 'Yedim · {k} kkal', dtSave: 'Odatdagiga saqlash', dtBack: 'Orqaga', dtDona: 'dona', addA: "Qo'shish: {x}", addHalf: "Yarim porsiya qo'shish: {x}",
      lbGuest: 'Mehmonga va bayramga', lbGuestH: "{n} ta retsept — kishi soni va xarid ro'yxati bilan",
      hvT: 'Uyda nima bor?', hvH: 'Belgilang — faqat shulardan tayyorlanadiganlar chiqadi.', hvGo: "Ko'rsatish · {n}", hvGo0: "Belgilang", hvClear: 'Tozalash',
      ppAteDone: 'Yozildi: {x}', ppSaved: "«{x}» Odatdagi ovqatlarimga saqlandi",
      yzT: 'Nima yesam ekan?', yzDoorS: "Uyda tez va sog'lom, kafe yoki buyurtma", yzC_kabob: 'Kabob', yzC_suyuq: 'Suyuq ovqat', yzC_tandir: 'Tandir', yzC_tez: 'Tez tayyor', yzC_baliq: 'Baliq',
      yzS_kafe: 'Kafeda', yzS_buyurtma: 'Buyurtma', yzS_uyda: 'Uyda', yzKafe: 'kafe', yzUy: 'uyda', yzFacts: '{u} · {k} kkal · oqsil {p} g', yzAdd: 'Qo\'shish', yzMore: 'Yana ko\'rsatish',
      yzNote: 'Porsiya taxminiy — nomni bosib o\'zgartiring', yzF_oqsil: 'Oqsilga boy', yzF_yengil: 'Yengilroq', yzOsh: 'Bugungi limitdan oshadi', yzLeft: 'Bugun yana ≈ {k} kkal sig\'adi',
      mnBaza: 'bazada: {n} ≈ {g} g', mnYig: 'bazada: {n} ≈ {g} g (tarkibidan)', mnKk: '{k} kkal · oqsil {p} g', mnEst: 'taxminiy',
      mnCta: 'Menyuni suratga oling — mosini tanlab beramiz', mnTip: 'Yangi: kafe menyusini suratga oling — 2–3 mos taomni tanlab beramiz.', mnBtn: 'Menyudan tanlash', mnT: 'Menyudan tanlash', mnH: "Kafe menyusini suratga oling — bugungi qoldig'ingizga mos 2–3 taomni tanlab beramiz.", mnPriv: "Rasm saqlanmaydi. Kaloriya — bazamizdan; tarkibidan hisoblanganlari taxminiy.", mnPick: 'Menyu rasmini tanlash', mnCam: 'Rasmga olish', mnGal: 'Galereyadan', mnBusy: "Menyu o'qilmoqda…", mnRes: "Menyudan {n} ta taom topildi. Sizga mos:", mnLeft: "Bugun yana ≈ {k} kkal sig'adi", mnW_oqsil: 'Oqsilga boy', mnW_yengil: 'Yengilroq', mnW_sigadi: "Qoldiqqa sig'adi", mnNo: "Rasmda menyu matni topilmadi — yaqinroq va tekis suratga oling.", mnNoFit: "Menyudagi taomlar bazamizda topilmadi. Qidiruvdan tanlang.", mnErr: "Menyuni o'qib bo'lmadi. Keyinroq urinib ko'ring.", mnE_net: "Internet yo'q yoki aloqa uzildi. Ulanishni tekshirib, qayta urinib ko'ring.", mnE_time: "Javob kechikdi. Qayta urinib ko'ring.", mnE_fmt: "Rasm o'qilmadi. Boshqa rasm tanlang yoki qayta suratga oling.", mnE_big: 'Rasm juda katta. Boshqa rasm tanlang.', mnE_srv: "Server xatosi. Birozdan keyin qayta urinib ko'ring.", mnE_site: 'Menyu tahlili bugun juda band. Ertaga yana ishlaydi.', mnAgain: 'Boshqa rasm', mnAdded: "Qo'shildi: {n}",
      yzNo: 'Bu yerda sizga mos taom topilmadi.', yzNoH: 'Qidiruvdan o\'zingiz tanlang.', yzSearch: 'Qidirish',
      yzOrdH: 'Yetkazib berish xizmatida «{q}» deb qidiring. Tugmani bossangiz so\'z nusxalanadi.', yzCopied: '«{q}» nusxalandi — ilovada qidiruvga qo\'ying', yzOrdList: 'Odatiy buyurtmalar (o\'rtacha porsiya)', yzOrdNone: 'Havolalar hozir yuklanmadi. Internetni tekshirib, qayta urining.', yzUyH: 'Qaysi usulda pishirasiz?',
      yzMeal_b: 'Nonushtaga yozildi', yzMeal_l: 'Tushlikka yozildi', yzMeal_d: 'Kechki ovqatga yozildi', yzMeal_s: 'Tamaddiga yozildi',
      yqT: 'Yemaydigan narsangiz bormi?', yqBel: 'Belgilash', yqNo: 'Yo\'q', obYwarn: 'Kafe taomlari tarkibi joyga qarab farq qiladi — allergiyangiz bo\'lsa, buyurtmada so\'rang.',
      ynT: 'Yemaydiganlarim', ynH: 'Belgilanganlar takliflarda chiqmaydi.', yn_baliq: 'Baliq', yn_tuxum: 'Tuxum', yn_sut: 'Sut mahsuloti', yn_yongoq: 'Yong\'oq', yn_glyuten: 'Glyuten', obYq: 'Yemaydigan narsalaringiz bormi?', obYh: 'Ixtiyoriy. Belgilasangiz, takliflarda chiqmaydi. Keyin Profilda o\'zgartirasiz.', obYlink: 'Yemaydiganlarim bor (ixtiyoriy)', obYok: 'Tayyor',
      fwT: 'Baliq kuni', fwNo: 'Baliq yoqtirmayman', fwDay: 'Boshqa kun', fwTime: 'Vaqt: {t}', fwK1: '1 kishiga ≈ {k} kkal', fwPeople: 'Necha kishiga?', fwMas: 'Masalliqlar', fwQad: 'Tayyorlash', fwCopy: 'Xarid ro\'yxatini nusxalash', fwShare: 'Ulashish', fwCopied: 'Xarid ro\'yxati nusxalandi', fwLog: 'Yedim — yozish', fwKcalN: '1 kishiga ≈ {k} kkal (taxminiy). Tuz, ziravor, limon kkalga kirmaydi.', fwBack: 'Orqaga',
      fwNoDone: 'Baliq endi takliflarda chiqmaydi', fwDayT: 'Baliq kuni qaysi kun?', fwDayH: 'Eslatma (yoqilgan bo\'lsa) shu kuni keladi.', fwDayDone: 'Baliq kuni o\'zgardi: {d}', fwDayRow: 'Eslatma kuni',
      bvT: 'Boshqa variantlar', bvOpen: 'Boshqa variantlar', bvF_oqsil: 'Oqsili ko\'proq', bvF_kam: 'Kaloriyasi kamroq', bvF_tam: 'Boshqa ta\'m', bvFor: 'Siz tanlagan: {n}', bvNone: 'Bu filtr bo\'yicha variant topilmadi.'
    },
    ru: {
      rBadge: 'В «Не ем»', rWarn: 'Вы добавили в «Не ем»: {x}', pCtaForce: 'Всё равно добавить · {k} ккал', ya_baliq: 'рыба', ya_tuxum: 'яйца', ya_sut: 'молочные продукты', ya_yongoq: 'орехи', ya_glyuten: 'глютен',
      nyStNo: 'Быстрые полезные блюда дома', nyStNoS: 'Заполните профиль — подберём под остаток калорий.', nyStOk: 'Вам осталось {k} ккал и {p} г белка', nyStOkK: 'Вам осталось {k} ккал', nyStOkS: 'Сверху — подходящее для этого времени.', nyStOkP: 'Сверху — блюда, богатые белком.', nyStOkPd: 'Норма белка выполнена — есть и лёгкие варианты.',
      nyStLow: 'Лимит на сегодня почти исчерпан — осталось {k} ккал.', nyStLowP: 'Но белка не хватает {p} г. Лёгкие белковые варианты сверху.', nyStLowN: 'Самые лёгкие варианты сверху.', nyStOver: 'Лимит на сегодня набран — это тоже хороший результат.', nyStOverS: 'Если голодны — самые лёгкие варианты сверху.',
      chAll: 'Все', ch5: '⚡ до 5 мин', ch15: 'до 15 мин', ch30: '30+ мин', chHave: '🧺 Что есть дома', chHaveN: '🧺 Что есть дома · {n}',
      lbBest_b: 'Лучше всего на завтрак', lbBest_l: 'Лучше всего на обед', lbBest_d: 'Лучше всего на ужин', lbBest_s: 'Лучше всего на перекус', lbMore: 'Ещё варианты', lbHave: 'Из того, что есть дома', lbNeed: 'Нужен ещё 1 продукт', lbNeedX: 'нужно: {x}', lbFish: 'Рыбный день — дома', lbFit: 'Помещается в лимит', lbOver: 'Больше дневного лимита', lbPop: 'Популярные блюда', lbHalf: 'полпорции — {k} ккал',
      tgOqsil: 'Много белка', tgYengil: 'лёгкое', fMin: '{n} мин', fK: '{k} ккал', fP: 'белок {p} г', nyNote: 'Ккал — примерно, рассчитано по продуктам из базы.', nyNoHave: 'Из этих продуктов пока ничего не приготовить — отметьте ещё один.', nyNoAll: 'Подходящих рецептов нет — выберите другой фильтр.',
      dtMin: 'минут', dtK: 'ккал', dtP: 'белок', dtF: 'жиры', dtPort: 'Порция', dtIng: 'Понадобится', dtSteps: 'Приготовление', dtAte: 'Съел · {k} ккал', dtSave: 'Сохранить в «Обычные»', dtBack: 'Назад', dtDona: 'шт.', addA: 'Добавить: {x}', addHalf: 'Добавить полпорции: {x}',
      lbGuest: 'Для гостей и праздника', lbGuestH: '{n} рецептов — на число гостей, со списком покупок',
      hvT: 'Что есть дома?', hvH: 'Отметьте — покажем только то, что из этого можно приготовить.', hvGo: 'Показать · {n}', hvGo0: 'Отметьте продукты', hvClear: 'Очистить',
      ppAteDone: 'Записано: {x}', ppSaved: '«{x}» сохранено в «Обычные приёмы пищи»',
      yzT: 'Что бы мне съесть?', yzDoorS: 'Дома быстро и полезно, кафе или заказ', yzC_kabob: 'Кебаб', yzC_suyuq: 'Суп', yzC_tandir: 'Тандыр', yzC_tez: 'Быстро', yzC_baliq: 'Рыба',
      yzS_kafe: 'В кафе', yzS_buyurtma: 'Заказ', yzS_uyda: 'Дома', yzKafe: 'кафе', yzUy: 'дома', yzFacts: '{u} · {k} ккал · белок {p} г', yzAdd: 'Добавить', yzMore: 'Показать ещё',
      yzNote: 'Порция примерная — нажмите на название', yzF_oqsil: 'Много белка', yzF_yengil: 'Полегче', yzOsh: 'Превышает дневной лимит', yzLeft: 'Сегодня ещё поместится ≈ {k} ккал',
      mnBaza: 'по базе: {n} ≈ {g} г', mnYig: 'по базе: {n} ≈ {g} г (по составу)', mnKk: '{k} ккал · белок {p} г', mnEst: 'примерно',
      mnCta: 'Сфотографируйте меню — подберём подходящее', mnTip: 'Новое: сфотографируйте меню кафе — подберём 2–3 подходящих блюда.', mnBtn: 'Выбрать по меню', mnT: 'Выбрать по меню', mnH: 'Сфотографируйте меню кафе — подберём 2–3 блюда под ваш остаток на сегодня.', mnPriv: 'Фото не сохраняется. Калории — из нашей базы; рассчитанные по составу — примерные.', mnPick: 'Выбрать фото меню', mnCam: 'Сфотографировать', mnGal: 'Из галереи', mnBusy: 'Читаем меню…', mnRes: 'В меню найдено блюд: {n}. Вам подойдут:', mnLeft: 'Сегодня ещё влезает ≈ {k} ккал', mnW_oqsil: 'Богато белком', mnW_yengil: 'Полегче', mnW_sigadi: 'Влезает в остаток', mnNo: 'На фото не найден текст меню — снимите ближе и ровнее.', mnNoFit: 'Блюд из меню нет в нашей базе. Выберите через поиск.', mnErr: 'Не удалось прочитать меню. Попробуйте позже.', mnE_net: 'Нет интернета или связь прервалась. Проверьте соединение и попробуйте снова.', mnE_time: 'Ответ задержался. Попробуйте ещё раз.', mnE_fmt: 'Фото не удалось прочитать. Выберите другое или снимите заново.', mnE_big: 'Фото слишком большое. Выберите другое.', mnE_srv: 'Ошибка сервера. Попробуйте чуть позже.', mnE_site: 'Разбор меню сегодня перегружен. Завтра снова заработает.', mnAgain: 'Другое фото', mnAdded: 'Добавлено: {n}',
      yzNo: 'Подходящих блюд здесь не нашлось.', yzNoH: 'Выберите через поиск.', yzSearch: 'Искать',
      yzOrdH: 'Найдите «{q}» в сервисе доставки. По нажатию слово копируется.', yzCopied: '«{q}» скопировано — вставьте в поиск приложения', yzOrdList: 'Частые заказы (средняя порция)', yzOrdNone: 'Ссылки сейчас не загрузились. Проверьте интернет и повторите.', yzUyH: 'Как будете готовить?',
      yzMeal_b: 'Записано на завтрак', yzMeal_l: 'Записано на обед', yzMeal_d: 'Записано на ужин', yzMeal_s: 'Записано на перекус',
      yqT: 'Есть что-то, что вы не едите?', yqBel: 'Отметить', yqNo: 'Нет', obYwarn: 'Состав блюд в кафе зависит от заведения — при аллергии уточняйте при заказе.',
      ynT: 'Не ем', ynH: 'Отмеченное в предложениях не появится.', yn_baliq: 'Рыба', yn_tuxum: 'Яйца', yn_sut: 'Молочное', yn_yongoq: 'Орехи', yn_glyuten: 'Глютен', obYq: 'Есть продукты, которые вы не едите?', obYh: 'По желанию. Отмеченное не будет предлагаться. Позже можно изменить в Профиле.', obYlink: 'Есть продукты, которые не ем (по желанию)', obYok: 'Готово',
      fwT: 'Рыбный день', fwNo: 'Не люблю рыбу', fwDay: 'Другой день', fwTime: 'Время: {t}', fwK1: 'На 1 человека ≈ {k} ккал', fwPeople: 'На сколько человек?', fwMas: 'Продукты', fwQad: 'Приготовление', fwCopy: 'Скопировать список покупок', fwShare: 'Поделиться', fwCopied: 'Список покупок скопирован', fwLog: 'Съел — записать', fwKcalN: 'На 1 человека ≈ {k} ккал (примерно). Соль, специи и лимон в ккал не входят.', fwBack: 'Назад',
      fwNoDone: 'Рыба больше не предлагается', fwDayT: 'В какой день рыбный день?', fwDayH: 'Напоминание (если включено) придёт в этот день.', fwDayDone: 'Рыбный день изменён: {d}', fwDayRow: 'День напоминания',
      bvT: 'Другие варианты', bvOpen: 'Другие варианты', bvF_oqsil: 'Больше белка', bvF_kam: 'Меньше калорий', bvF_tam: 'Другой вкус', bvFor: 'Вы выбрали: {n}', bvNone: 'По этому фильтру вариантов нет.'
    }
  };
  /* toifa ikonkalari (rasmi yo'q taomlar uchun): six · kosa · tandir · lavash · baliq; segmentlar: vilka-pichoq · sumka · uy */
  var ICONS = {
    zfork: 'M7 3v7a2 2 0 0 0 4 0V3 M9 3v18 M17 3c-2.500 2-3 5-3 8h3v10', zbag: 'M6 8h12l-1 12H7z M9 8V7a3 3 0 0 1 6 0v1', zhome: 'M4 11l8-7 8 7 M6 10v10h12V10 M10 20v-5h4v5',
    zsix: 'M3 21L21 3 M8 12l4 4 M11 9l4 4 M14 6l4 4', zbowl: 'M4 11h16a8 8 0 0 1-16 0z M9 7c0-1 1-1 1-2 M13 7c0-1 1-1 1-2', ztandir: 'M5 21h14 M7 21V11a5 5 0 0 1 10 0v10 M9 15h6', zlavash: 'M5 8c0-2 3-4 7-4s7 2 7 4v8c0 2-3 4-7 4s-7-2-7-4z M5 8c0 2 3 4 7 4s7-2 7-4', zfish: 'M3 12c4-6 11-6 15 0-4 6-11 6-15 0z M18 12l3-3v6z M8 11h.01'
  };
  var IKON = {};      // taom id → ikonka (toifadan); data yuklanmasa ham kerak bo'ladigan taomlar ro'yxati qo'lda saqlanadi (test data/yeymiz.json va uyda.json bilan solishtiradi)
  (function () { var m = { zsix: 'kafe-tovuq-shashlik kafe-qoy-shashlik kafe-lyulya kafe-mol-shashlik kafe-tovuq-qanot kafe-jigar-kabob kafe-jiz kafe-qovurga kafe-baliq-shashlik kafe-sabzavot-shashlik uy-tovuq-shashlik uy-lyulya kafe-tovuq-son-grill',
    zbowl: 'kafe-shurva kafe-mastava kafe-lagmon-qoy kafe-moshxorda kafe-chuchvara-shorva kafe-tovuq-shurva kafe-lagmon-tovuq kafe-kartoshka-shurva kafe-baliq-shurva uy-tovuq-shurva mastava moshxorda', ztandir: 'tandir-gosht kafe-tandir-tovuq kafe-tandir-kabob somsa uy-tovuq-duxovka uy-qoy-duxovka',
    zlavash: 'lavash-tovuq doner burger hotdog-mol hotdog-tovuq sendvich qoymoq tuxum omlet-sabzavot uy-lavash-tovuq', zfish: 'kafe-sazan-qovurma kafe-losos-steyk sazan-qovurma sazan-grill sazan-duxovka baliq-shurva baliq-dimlama' };
    Object.keys(m).forEach(function (ic) { m[ic].split(' ').forEach(function (id) { IKON[id] = ic; }); }); })();
  var A = null, data = null, ch = null, uy = null, pp = null, partners = null, ldState = 0, wait = [], pState = 0, hs = null, WD = { uz: ['Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha', 'Ya'], ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] };
  var WDF = { uz: ['dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'yakshanba'], ru: ['понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу', 'воскресенье'] };
  var yv = { toifa: 'kabob', seg: 'kafe', open: {}, f: 'oqsil' };
  function T(k, o) { return A.T(k, o); }
  function esc(s) { return A.esc(s); }
  function L() { return A.lang() === 'ru' ? 'ru' : 'uz'; }
  function loadJson(url, ok, fail) { fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(ok).catch(fail || function () {}); }
  var chState = 0, chWait = [];
  function chReady() { return chState === 2; }
  function loadCh(cb) {                                 // faqat cheklov-teglar.json (ovqat qo'shish ro'yxatlari uchun yengil)
    if (chState === 2) { if (cb) cb(); return; } if (cb) chWait.push(cb); if (chState === 1) return; chState = 1;
    loadJson('/data/cheklov-teglar.json', function (j) { ch = j; chState = 2; var w = chWait; chWait = []; w.forEach(function (f) { f(); }); }, function () { chState = 0; chWait = []; });
  }
  function load(cb) {                                   // yeymiz.json + cheklov-teglar.json + uyda.json (lazy; bir marta)
    if (ldState === 2) { if (cb) cb(); return; } if (cb) wait.push(cb); if (ldState === 1) return; ldState = 1;
    var left = PP ? 4 : 3, done = function () { if (--left) return; ldState = 2; var w = wait; wait = []; w.forEach(function (f) { f(); }); }, fail = function () { ldState = 0; wait = []; };
    loadJson('/data/yeymiz.json', function (j) { data = j; done(); }, fail); loadCh(done); loadJson('/data/uyda.json', function (j) { uy = j; done(); }, fail); if (PP) loadJson('/data/uyda-pp.json', function (j) { pp = j; done(); }, fail);
  }
  /* ---------- «Yemaydiganlarim» — ovqat ro'yxatlari uchun YAGONA qoida (cho'chqa: hech qayerda; tanlangan teglar: yashiriladi/belgilanadi/ogohlantiriladi) ---------- */
  function keysOf(f, vr) { var id = f.al ? f.al.f : f.id, v = vr || (f.al ? f.al.v : null); if (f.fam && !v) return Object.keys(f.fam.g).map(function (k) { return f.fam.id + '#' + k; }); return [v ? id + '#' + v : id]; }
  /* → { pork: bool, hit: [teg, …] } — oila (variantsiz) uchun: faqat BARCHA variantlar cheklangan bo'lsa */
  function rinfo(f, vr) {
    if (!ch || !f || f.custom) return { pork: false, hit: [] }; var user = yemay(), keys = keysOf(f, vr), per = keys.map(function (k) { var t = ch.taom[k] || []; return { pork: t.indexOf('choshqa') > -1, hit: t.filter(function (x) { return x !== 'choshqa' && user.indexOf(x) > -1; }) }; });
    if (per.length === 1) return per[0];
    var allPork = per.every(function (x) { return x.pork; }), hit = [], allBlocked = per.every(function (x) { return x.pork || x.hit.length; });
    if (allBlocked && !allPork) per.forEach(function (x) { x.hit.forEach(function (t) { if (hit.indexOf(t) < 0) hit.push(t); }); });
    return { pork: allPork, hit: allPork ? [] : hit };
  }
  function hitText(hit) { return hit.map(function (t) { return T('ya_' + t); }).join(', '); }
  function yemay() { var p = A.prefs().yemay; return Array.isArray(p) ? p : []; }
  function avoids(t) { return CH.toza(yemay()).indexOf(t) > -1; }
  function count(h, x) { if (hs) { try { hs.add(h, x); } catch (e) {} } }
  function sev(h, k) { try { if (window.KalkiStatApp) window.KalkiStatApp.add(h, k); } catch (e) {} }          // anonim statistika (assets/stat-kun.js)
  var STCH = { kabob: 1, suyuq: 1, tandir: 1, tez: 1, baliq: 1 };          // statistika: ruxsat etilgan chip kalitlari (CHIPS massivi bilan aralashmasin)
  function lbl(o) { return L() === 'ru' ? (o.ru || o.uz) : o.uz; }
  function lsGet() { try { return localStorage.getItem(LSEG); } catch (e) { return null; } }
  function lsSet(v) { try { localStorage.setItem(LSEG, v); } catch (e) {} }
  /* ---------- Yemaydiganlarim ---------- */
  function chipsHtml(sel, act) { return '<div class="sl-yn" role="group" aria-label="' + esc(T('ynT')) + '">' + CHTAGS.map(function (t) { var on = sel.indexOf(t) > -1; return '<button type="button" class="rz-chip' + (on ? ' on' : '') + '" data-act="' + act + '" data-t="' + t + '" aria-pressed="' + on + '">' + esc(T('yn_' + t)) + '</button>'; }).join('') + '</div>'; }
  function profileCard() { return '<section class="rz-card sl-ync" id="ynCard">' + A.infoTitle(T('ynT'), T('ynH')) + chipsHtml(yemay(), 'yntog') + '</section>'; }
  function setYemay(list) { A.prefs().yemay = list; A.prefs().yemayK = 1; A.save(); if (list.indexOf('baliq') > -1) A.prefs().baliqOff = true; A.pushResync(); }
  function toggleYemay(t) { var l = yemay().slice(), i = l.indexOf(t); if (i > -1) l.splice(i, 1); else l.push(t); setYemay(l); }
  function filterAlts(list) { if (ldState !== 2) { load(function () { A.render(); }); return yemay().length ? [] : list; } return list.filter(function (a) { return CH.ruxsat(ch, a.key, yemay()); }); }
  /* ---------- kun tanlash (Baliq kuni): oyna va Profil ---------- */
  function kunNow() { var k = A.prefs().baliqKun; return YC.kunOk(k == null ? 3 : k); }
  function dayName(i) { return WDF[L()][i]; }
  function dayChips(act) { var cur = kunNow(); return '<div class="sl-days" role="radiogroup" aria-label="' + esc(T('fwDayRow')) + '">' + WD[L()].map(function (n, i) { return '<button type="button" role="radio" class="rz-chip' + (i === cur ? ' on' : '') + '" aria-checked="' + (i === cur) + '" data-act="' + act + '" data-d="' + i + '">' + esc(n) + '</button>'; }).join('') + '</div>'; }
  function profileDays() { return dayChips('fwdayprof'); }
  function kunQisqa() { return WD[L()][kunNow()]; }
  function daySheet() { A.openSheet('fwday', A.shHead(T('fwDayT')) + '<p class="rz-p">' + esc(T('fwDayH')) + '</p>' + dayChips('fwdaypick')); }          // Profil → Baliq kuni qatori: kun tanlash (7 chip)
  /* ---------- «Nima yesam ekan?» — YAGONA karkas (maket: ~/nima-yesam-maket.html): oyna doim bir xil balandlikda; tepa qism (sarlavha, segment, holat qatori, BITTA chip qatori) qotib turadi, faqat ro'yxat aylanadi.
     Uyda — tez PP retseptlar (data/uyda-pp.json; hisob va tanlash — assets/uyda-pp-core.js; kkal/BJU tarkibdan bazadan, «taxminiy» — ro'yxat oxirida bitta izoh). Kafeda / Buyurtma — data/yeymiz.json (shu karkasda).
     Retsept sahifasi va «Uyda nima bor?» — oyna ICHIDA o'ngdan kirib keladigan qatlam (‹, Android «orqaga», Escape bilan qaytadi). ---------- */
  var pv = { t: null, haveOn: false, dt: null, mult: {} };          // t: '5' | '15' | '30' | null; dt: retsept id | '#have' | null
  var TF = { '5': { max: 5 }, '15': { max: 15 }, '30': { min: 25 } };
  function ppHave() { var h = A.prefs().ppHave; return Array.isArray(h) && pp ? h.filter(function (k) { return pp.guruhlar.some(function (g) { return g.k === k; }); }) : []; }
  function ppSetHave(l) { A.prefs().ppHave = l; A.save(); }
  function ppRecent() { return PP.recentOf(A.prefs().ppAte, A.today(), A.addDays); }
  function ppGroupName(k) { var g = pp.guruhlar.filter(function (x) { return x.k === k; })[0]; return g ? lbl(g.n) : k; }
  function haveActive() { return pv.haveOn && ppHave().length > 0; }
  function ppSel() { var f = Object.assign({}, TF[pv.t] || {}); return PP.pick({ data: pp, by: A.by(), ch: ch, yemaydi: yemay(), rem: A.remFull(), meal: A.mealNow(), filt: f, have: haveActive() ? ppHave() : [], recent: ppRecent(), today: A.today() }); }
  function fmtN(n) { return String(Math.round(n * 10) / 10).replace('.', ','); }
  function recTile(r, px, hi) { return A.tileFile(r.ic, lbl(r.n), px, hi); }
  /* holat qatori: qolgan kkal va oqsilga qarab bitta aniq gap (+ izoh) */
  function statusHtml() {
    var rem = A.remFull(), b, s;
    if (!rem) { b = T('nyStNo'); s = T('nyStNoS'); }
    else {
      var k = Math.round(rem.k), p = Math.round(rem.p);
      if (k <= 0) { b = T('nyStOver'); s = T('nyStOverS'); }
      else if (k < PP.LOW) { b = T('nyStLow', { k: k }); s = p >= 15 ? T('nyStLowP', { p: p }) : T('nyStLowN'); }
      else { b = rem.lab ? (p > 0 ? T('nyStMeal', { m: rem.lab, k: A.fmt(k), p: p }) : T('nyStMealK', { m: rem.lab, k: A.fmt(k) })) : (p > 0 ? T('nyStOk', { k: k, p: p }) : T('nyStOkK', { k: k })); s = p <= 0 ? T('nyStOkPd') : (p * 4 >= k * 0.3 ? T('nyStOkP') : T('nyStOkS')); }          // v48: «Kechki ovqatga 1 090 kkal va 45 g oqsil qoldi"
    }
    return '<div class="ny-st" id="nySt" role="status"><b>' + esc(b) + '</b>' + (s ? '<span>' + esc(s) + '</span>' : '') + '</div>';
  }
  function chipBtn(on, act, v, txt, cls, attr) { return '<button type="button" class="ny-c' + (on ? ' on' : '') + (cls ? ' ' + cls : '') + '" data-act="' + act + '" data-' + (attr || 'v') + '="' + esc(v) + '" aria-pressed="' + on + '">' + esc(txt) + '</button>'; }
  function chipsHtmlNy() {
    if (yv.seg === 'uyda') { var hv = ppHave(), on = haveActive(); return '<div class="ny-ch" role="group">' + [['', 'chAll'], ['5', 'ch5'], ['15', 'ch15'], ['30', 'ch30']].map(function (x) { return chipBtn((pv.t || '') === x[0], 'nyt', x[0], T(x[1])); }).join('') + chipBtn(on, 'nyhave', '', on ? T('chHaveN', { n: hv.length }) : T('chHave'), 'ho') + '</div>'; }
    return '<div class="ny-ch" role="group">' + CHIPS.filter(function (c) { return !(c === 'baliq' && avoids('baliq')); }).map(function (c) { return chipBtn(c === yv.toifa, 'yechip2', c, T('yzC_' + c), '', 'c'); }).join('') + '</div>';
  }
  function segHtml() { return '<div class="ny-seg" role="tablist">' + YC.SEG.map(function (s) { var on = s === yv.seg; return '<button type="button" role="tab" class="' + (on ? 'on' : '') + '" aria-selected="' + on + '" data-act="yeseg" data-s="' + s + '">' + (s === 'uyda' ? A.ico('zhome') : '') + '<span>' + esc(T('yzS_' + s)) + '</span></button>'; }).join('') + '</div>'; }
  /* ixcham karta: rasm, nom, ⏱ daq · kkal · oqsil (yashil); o'ngda «+» — bir bosishda (✓ — qayta bosilsa bekor) */
  function card(o) {
    return '<div class="ny-it"' + (o.id ? ' data-id="' + esc(o.id) + '"' : '') + '><button type="button" class="ny-m" ' + o.main + '>' + o.tile + '<span class="tx">' + (o.tag ? '<span class="ny-tag">' + esc(o.tag) + '</span>' : '') + '<b class="nm">' + esc(o.name) + '</b><span class="mt">' + o.facts + '</span>' + (o.extra || '') + '</span></button>' +
      (o.plus ? '<button type="button" class="ny-pl' + (o.done ? ' done' : '') + '" ' + o.plus + ' aria-label="' + esc(T(o.halfBtn ? 'addHalf' : 'addA', { x: o.name })) + '">' + (o.done ? A.ico('check', '', 2.6) : (o.halfBtn ? '½' : A.ico('plus', '', 2.4))) + '</button>' : A.ico('chev', 'r')) + '</div>';
  }
  function facts(min, k, p) { return (min ? '⏱ ' + esc(T('fMin', { n: min })) + ' · ' : '') + esc(T('fK', { k: k })) + ' · <i class="ny-p">' + esc(T('fP', { p: Math.round(p) })) + '</i>'; }
  function recCard(x, best) {
    var r = x.rec, tag = best ? [x.oqsil ? T('tgOqsil') : '', x.yengil ? T('tgYengil') : ''].filter(Boolean).join(' · ') : '';
    if (tag) tag = tag.charAt(0).toUpperCase() + tag.slice(1);
    return card({ id: r.id, main: 'data-act="nyopen" data-id="' + esc(r.id) + '"', tile: recTile(r, 56), name: lbl(r.n), tag: tag, facts: facts(r.min, x.c.k, x.c.p), extra: x.miss && x.miss.length ? '<span class="ny-need">' + esc(T('lbNeedX', { x: x.miss.map(ppGroupName).join(', ') })) + '</span>' : '', plus: 'data-act="nyadd" data-id="' + esc(r.id) + '"', done: A.added('r:' + r.id) });
  }
  function lb(t) { return '<h3 class="ny-lb">' + esc(t) + '</h3>'; }
  function uydaList() {
    var sel = ppSel(), have = haveActive(), meal = A.mealNow(), h = '';
    if (yv.toifa === 'baliq' && uy) {                    // Baliq kuni: uydagi baliq retseptlari (kishi soni, xarid ro'yxati) — tepada
      var rs = YC.uyda({ data: data, toifa: 'baliq', uyda: uy, cheklov: ch, yemaydi: yemay() });
      if (rs.length) h += lb(T('lbFish')) + rs.map(function (r) { var p = YC.portion(A.by(), { birlik: {} }, r.taom); return card({ main: 'data-act="yerec" data-id="' + esc(r.id) + '"', tile: A.tileHtml(r.taom, null, lbl(r.nom), 56), name: lbl(r.nom), facts: esc(T('fwTime', { t: lbl(r.vaqt) })) + (p ? ' · ' + esc(T('fK', { k: p.k })) : '') }); }).join('');
    }
    if (!sel.list.length && !sel.more.length) return h + '<div class="rz-empty"><b>' + esc(have ? T('nyNoHave') : T('nyNoAll')) + '</b></div>';
    var topIds = sel.top.map(function (x) { return x.rec.id; }), rest = sel.list.filter(function (x) { return topIds.indexOf(x.rec.id) < 0; });          // TAKRORSIZ: tepadagilar pastda yo'q
    if (sel.top.length) h += lb(have ? T('lbHave') : T('lbBest_' + meal)) + sel.top.map(function (x) { return recCard(x, true); }).join('');
    else if (have) h += '<div class="rz-empty"><b>' + esc(T('nyNoHave')) + '</b></div>';
    if (rest.length) h += lb(T('lbMore')) + rest.map(function (x) { return recCard(x, false); }).join('');
    if (have && sel.more.length) h += lb(T('lbNeed')) + sel.more.map(function (x) { return recCard(x, false); }).join('');
    return h + '<p class="ny-note">' + esc(T('nyNote')) + '</p>' + guestHtml();
  }
  /* «Mehmonga va bayramga»: eski toifa bo'yicha uyda retseptlari (kishi soni, xarid ro'yxati) — ro'yxat ENG OXIRIDA, yig'ilgan; asosiy tavsiyalarga aralashmaydi */
  function guestHtml() {
    if (!uy) return ''; var rs = uy.retseptlar.filter(function (r) { return CH.ruxsat(ch, r.taom, yemay()); }); if (!rs.length) return '';
    var h = '<button type="button" class="ny-acc" data-act="nyguest" aria-expanded="' + !!pv.guest + '"><span class="tx"><b>' + esc(T('lbGuest')) + '</b><span>' + esc(T('lbGuestH', { n: rs.length })) + '</span></span>' + A.ico('chev', 'r') + '</button>';
    if (!pv.guest) return h;
    return h + '<div class="ny-guest">' + rs.map(function (r) { var p = YC.portion(A.by(), { birlik: {} }, r.taom); return card({ main: 'data-act="yerec" data-id="' + esc(r.id) + '"', tile: A.tileHtml(r.taom, null, lbl(r.nom), 56), name: lbl(r.nom), facts: esc(T('fwTime', { t: lbl(r.vaqt) })) + (p ? ' · ' + esc(T('fwK1', { k: p.k })) : '') }); }).join('') + '</div>';
  }
  /* Kafeda / Buyurtma: shu karkas va karta uslubi; limitdan oshadiganlar pastda («yarim porsiya — N kkal» bilan) */
  function kafeCard(p, over) {
    var half = over ? Math.round(p.k / 2) : 0;
    return card({ main: 'data-act="yepick" data-k="' + esc(p.key) + '"' + por(p), tile: A.tileHtml(p.id, p.v, nameOfKey(p), 56), name: nameOfKey(p), tag: [p.flags && p.flags.oqsil ? T('yzF_oqsil') : '', p.flags && p.flags.yengil ? T('yzF_yengil') : ''].filter(Boolean).join(' · '), facts: esc(unitTxt(p)) + ' · ' + esc(T('fK', { k: p.k })) + ' · <i class="ny-p">' + esc(T('fP', { p: Math.round(p.p) })) + '</i>',
      extra: over ? '<span class="ny-half">' + esc(T('lbHalf', { k: half })) + '</span>' : '', halfBtn: over, plus: 'data-act="' + (over ? 'nykhalf' : 'nykadd') + '" data-k="' + esc(p.key) + '"' + por(p), done: A.added('k:' + p.key + (over ? '|h' : '')) });          // limitdan oshadigani: «+» — yarim porsiya (to'liq porsiya — kartani bosib)
  }
  function kafeList() {
    var rem = A.remaining(), r = YC.list({ by: A.by(), data: data, toifa: yv.toifa, seg: yv.seg, tags: A.tags(), cheklov: ch, yemaydi: yemay(), qoldiq: rem }), h = '';
    yv.shown = r.items.map(function (p) { return p.key; });
    if (yv.seg === 'kafe' && window.KalkiMenyu) { var tip = yv.tip || !A.prefs().mnTip; if (tip && !yv.tip) { yv.tip = true; A.prefs().mnTip = 1; A.save(); } h += '<div class="sl-mncw"><button type="button" class="sl-mncta" data-act="mnopen" data-f="yeymiz" id="mnDoor"><span class="ic" aria-hidden="true">📷</span><span>' + esc(T('mnCta')) + '</span>' + A.ico('chev', 'r') + '</button>' + (tip ? '<p class="sl-tipb" id="mnTip" role="note">' + esc(T('mnTip')) + '</p>' : '') + '</div>'; }
    if (yv.seg === 'buyurtma') h += orderLinks();
    if (!r.items.length) return h + emptyHtml();
    var fit = r.items.filter(function (p) { return !p.flags.oshadi; }), over = r.items.filter(function (p) { return p.flags.oshadi; });
    if (fit.length) h += lb(yv.seg === 'buyurtma' ? T('yzOrdList') : (rem != null ? T('lbFit') : T('lbPop'))) + fit.map(function (p) { return kafeCard(p, false); }).join('');
    if (over.length) h += lb(T('lbOver')) + over.map(function (p) { return kafeCard(p, true); }).join('');
    return h + '<p class="ny-note">' + esc(T('yzNote')) + '</p>' + (yv.toifa === 'baliq' ? fishFoot() : '');
  }
  function fishFoot() { return '<div class="sl-fwf"><button type="button" class="sl-txtbtn" data-act="fwno">' + esc(T('fwNo')) + '</button><button type="button" class="sl-txtbtn" data-act="fwday">' + esc(T('fwDay')) + '</button></div>'; }
  /* retsept sahifasi: katta rasm, nom, 4 raqam, porsiya, «Kerak bo'ladi» (gramm porsiyaga qarab), «Tayyorlash» (raqamli, doim ochiq), «taxminiy»; pastda qotib turgan «Yedim · N kkal» + ☆ */
  function dtHtml(anim) {
    if (pv.dt === '#have') return haveHtml(anim);
    var r = PP.byId(pp, pv.dt); if (!r) return ''; var m = pv.mult[r.id] || 1, c = PP.calc(r, A.by(), m), nm = lbl(r.n);
    return '<div class="ny-dt' + (anim ? '' : ' in') + '" id="nyDt" role="dialog" aria-label="' + esc(nm) + '"><div class="ny-hero">' + recTile(r, 112, true) + '<button type="button" class="ny-bk" data-act="nyback" aria-label="' + esc(T('dtBack')) + '">' + A.ico('back') + '</button></div><div class="ny-db">' +
      '<h2 class="ny-dn">' + esc(nm) + '</h2><div class="ny-kp"><div><b>' + r.min + '</b>' + esc(T('dtMin')) + '</div><div><b>' + c.k + '</b>' + esc(T('dtK')) + '</div><div><b>' + Math.round(c.p) + ' ' + esc(T('gram')) + '</b>' + esc(T('dtP')) + '</div><div><b>' + Math.round(c.f) + ' ' + esc(T('gram')) + '</b>' + esc(T('dtF')) + '</div></div>' +
      lb(T('dtPort')) + '<div class="ny-por" role="radiogroup">' + PP.MULTS.map(function (k) { return '<button type="button" role="radio" class="' + (k === m ? 'on' : '') + '" aria-checked="' + (k === m) + '" data-act="nymul" data-m="' + k + '">' + (k === 0.5 ? '½' : k === 1.5 ? '1½' : k) + '</button>'; }).join('') + '</div>' +
      lb(T('dtIng')) + '<div class="ny-ing">' + c.items.map(function (i) { return '<div><span>' + esc(nameOfKey({ id: i.id, v: i.v })) + '</span><b>' + (i.n ? esc(fmtN(i.n) + ' ' + T('dtDona')) + ' · ' : '') + esc(i.g + ' ' + T('gram')) + '</b></div>'; }).join('') + '</div>' +
      lb(T('dtSteps')) + '<ol class="ny-stp">' + r.qad[L()].map(function (z, i) { return '<li><em>' + (i + 1) + '</em><span>' + esc(z) + '</span></li>'; }).join('') + '</ol><p class="ny-note">' + esc(T('nyNote')) + '</p></div>' +
      '<div class="ny-bar"><button type="button" class="sl-main ny-yed" data-act="nyate" data-id="' + esc(r.id) + '">' + esc(T('dtAte', { k: c.k })) + '</button><button type="button" class="ny-sv" data-act="nysave" data-id="' + esc(r.id) + '" aria-label="' + esc(T('dtSave')) + '">' + A.ico('star') + '</button></div></div>';
  }
  function haveHtml(anim) {
    var hv = ppHave();
    return '<div class="ny-dt' + (anim ? '' : ' in') + '" id="nyDt" role="dialog" aria-label="' + esc(T('hvT')) + '"><div class="ny-db ny-hvb"><div class="ny-hd2"><button type="button" class="ny-bk" data-act="nyback" aria-label="' + esc(T('dtBack')) + '">' + A.ico('back') + '</button><h2 class="ny-dn">' + esc(T('hvT')) + '</h2></div><p class="ny-hvh">' + esc(T('hvH')) + '</p><div class="ny-hv" role="group">' +
      pp.guruhlar.map(function (g) { var on = hv.indexOf(g.k) > -1; return chipBtn(on, 'pph', g.k, lbl(g.n)); }).join('') + '</div></div><div class="ny-bar"><button type="button" class="sl-main ny-yed" data-act="nyhvgo"' + (hv.length ? '' : ' disabled') + '>' + esc(hv.length ? T('hvGo', { n: hv.length }) : T('hvGo0')) + '</button>' + (hv.length ? '<button type="button" class="rz-btn ghost ny-hvc" data-act="pphc">' + esc(T('hvClear')) + '</button>' : '') + '</div></div>';
  }
  function frame(top, body, extra) { return '<div class="ny">' + (top ? '<div class="ny-top">' + top + '</div>' : '') + '<div class="ny-list" id="nyList">' + body + '</div>' + (extra || '') + '</div>'; }
  function page(html) { return frame('', html); }           // eski ichki sahifalar (Baliq kuni retsepti, kun tanlash) — shu karkasda, butun sahifa aylanadi
  function winHtml(anim) {
    var title = yv.toifa === 'baliq' ? T('fwT') : T('yzT');          // Baliq kuni (eslatma/chip) — o'z sarlavhasi bilan
    var top = '<div class="ny-hd"><h2 class="ny-t">' + esc(title) + '</h2><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + A.ico('x') + '</button></div>' + segHtml() + statusHtml() + chipsHtmlNy();
    return frame(top, yv.seg === 'uyda' ? uydaList() : kafeList(), pv.dt && pp ? dtHtml(anim) : '');
  }
  function draw(o) {                                        // o: { anim — qatlam kirib kelsin, reset — ro'yxat tepadan }
    o = o || {}; var l0 = A.$('#nyList'), d0 = A.$('#nyDt .ny-db'), ls = l0 && !o.reset ? l0.scrollTop : 0, ds = d0 && !o.anim ? d0.scrollTop : 0;
    if (A.sheetKind() !== 'yeymiz') A.openSheet('yeymiz', winHtml(o.anim)); else A.setSheet(winHtml(o.anim)); var l1 = A.$('#nyList'), d1 = A.$('#nyDt .ny-db'); if (l1) l1.scrollTop = ls; if (d1) d1.scrollTop = ds;
    if (o.anim) { var dt = A.$('#nyDt'); if (dt) { void dt.offsetWidth; requestAnimationFrame(function () { dt.classList.add('in'); var f = dt.querySelector('.ny-bk'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }); } }
  }
  function dtOpen(id) { pv.dt = id; draw({ anim: !A.reduce() }); }
  function dtClose() {                                      // qatlam o'ngga chiqib ketadi, ro'yxat joyida
    if (!pv.dt) return false; var dt = A.$('#nyDt'), id = pv.dt; pv.dt = null;
    if (!dt || A.reduce()) { draw(); return true; } dt.classList.remove('in'); setTimeout(function () { if (!pv.dt && A.sheetKind() === 'yeymiz') draw(); var b = A.$('#nyList [data-id="' + id + '"] .ny-m'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} }, 300); return true;
  }
  function backStep() { return A.sheetKind() === 'yeymiz' && !!pv.dt && dtClose(); }
  function redraw() { if (A.sheetKind() === 'yeymiz' && A.$('#nyList')) draw(); }
  function ppItem(id) { var r = PP.byId(pp, id), m = pv.mult[id] || 1; if (!r) return null; var c = PP.calc(r, A.by(), m); return c ? { r: r, c: c, m: m, name: lbl(r.n) + (m === 1 ? '' : ' × ' + fmtN(m)) } : null; }
  function ppEntry(it) { return { id: it.r.id, name: it.name, qty: it.m, g: it.c.g, k: it.c.k, p: it.c.p, f: it.c.f, c: it.c.c, ifid: it.r.ic }; }
  function ppAte(id) { var it = ppItem(id); if (!it) return; sev('ovqat_qoshildi', 'tavsiya'); count('yeymiz_tanlandi'); pv.dt = null; A.logRecipe(ppEntry(it)); }
  function ppQuick(id) { var r = PP.byId(pp, id), c = r && PP.calc(r, A.by(), 1); if (!c) return; if (!A.added('r:' + id)) { sev('ovqat_qoshildi', 'tavsiya'); count('yeymiz_tanlandi'); } A.quickRecipe('r:' + id, { id: id, name: lbl(r.n), qty: 1, g: c.g, k: c.k, p: c.p, f: c.f, c: c.c, ifid: r.ic }); }
  function ppSave(id) { var it = ppItem(id); if (!it) return; A.saveTpl(lbl(it.r.n), { n: lbl(it.r.n), unit: 'porsiya', qty: it.m, g: it.c.g, kcal: it.c.k, p: it.c.p, f: it.c.f, c: it.c.c, est: true }); }
  /* ---------- umumiy yordamchilar ---------- */
  function badge(p) { return '<span class="sl-kb' + (p.kafe ? '' : ' uy') + '">' + esc(T(p.kafe ? 'yzKafe' : 'yzUy')) + '</span>'; }          // «Boshqa variantlar» (porsiya oynasi)
  function iconName(id) { var s = OR.split(id).id; return IKON[id] || IKON[s] || null; }
  function unitTxt(p) { var u = p.u && p.u !== 'g100' ? A.unitName(p.u) : ''; return (u ? (p.n > 1 ? p.n + ' ' : '') + u + ' ' : '') + p.g + ' ' + T('gram'); }
  function nameOfKey(p) { var f = A.foodById(p.id); if (!f) return p.id; var b = f.al ? (A.foodById(f.al.f) || f) : f, lb0 = p.v && b.fam ? A.S.famLabel(b, p.v, null, A.lang()) : ''; return A.nameOf(b) + (lb0 ? ' · ' + lb0 : ''); }
  function por(p) { return ' data-u="' + esc(p.u || '') + '" data-n="' + (p.n || 1) + '" data-g="' + (p.g || 0) + '"'; }
  function porOf(el) { return { u: el.getAttribute('data-u') || null, n: +el.getAttribute('data-n') || 1, g: +el.getAttribute('data-g') || 0 }; }
  function head(title, back) { return '<div class="sl-yh">' + (back ? '<button type="button" class="sl-x" data-act="' + back + '" aria-label="' + esc(T('fwBack')) + '">' + A.ico('back') + '</button>' : '') + '<h3 class="sl-fwt">' + esc(title) + '</h3><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + A.ico('x') + '</button></div>'; }
  function emptyHtml() { return '<div class="rz-empty"><b>' + esc(T('yzNo')) + '</b><p>' + esc(T('yzNoH')) + '</p></div><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="yesearch">' + esc(T('yzSearch')) + '</button></div>'; }
  function qWord() { var q = data.toifalar[yv.toifa].qidiruv; return q[L()]; }
  function orderLinks() {
    var l = partners || [], q = qWord();
    return '<p class="ny-hint">' + esc(T('yzOrdH', { q: q })) + '</p>' + (l.length ? '<div class="sl-ylinks">' + l.map(function (p) { return '<a class="rz-btn primary full sl-ylink" data-act="yeorder" data-p="' + esc(p.id) + '" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.name) + ' ' + A.ico('share') + '</a>'; }).join('') + '</div>' : '<p class="rz-p warn">' + esc(T('yzOrdNone')) + '</p>');
  }
  function show(toifa) {                                  // oynani ochish (Imkoniyatlar, banner, eslatma): doim Uyda
    if (toifa === 'baliq') count('baliq_oyna_ochildi'); else count('yeymiz_ochildi');
    yv.tip = false; pv.dt = null; A.addedReset(); load(function () { A.withDb(function () { loadPartners(function () { yv.toifa = toifa; yv.seg = YC.segBoshlang(new Date(), lsGet()); yv.open = {}; if (A.sheetKind() === 'yeymiz') draw({ reset: true }); else A.openSheet('yeymiz', winHtml()); }); }); });
  }
  function openFish() { show('baliq'); }
  function back() { A.withDb(function () { loadPartners(function () { if (A.sheetKind() === 'yeymiz') draw(); else A.openSheet('yeymiz', winHtml()); }); }); }
  function loadPartners(cb) {
    if (pState === 2) { cb(); return; } loadJson('/assets/partners.json', function (j) {
      var now = new Date().toISOString().slice(0, 10), l = (j.partners || []).filter(function (p) { return p.active !== false && (p.categories || []).indexOf('yetkazish') > -1 && (!p.valid_until || String(p.valid_until) >= now); });
      partners = l.map(function (p) { return { id: p.id, name: lbl(p.name || {}) || p.id, url: p.url }; }); pState = 2; cb();
    }, function () { partners = []; cb(); });
  }
  /* ---------- Bugun kartasi ---------- */
  function todayCard() {                                  // Bugun: katta ESHIK karta (chiplar oyna ichida) — «Bugun nima yeymiz?» uchun yagona kirish
    return '<button type="button" class="sl-door" id="yeCard" data-act="yedoor"><span class="ic">' + A.ico('zfork') + '</span><span class="m"><b>' + esc(T('yzT')) + '</b><span>' + esc(T('yzDoorS')) + '</span></span>' + A.ico('chev', 'r') + '</button>';
  }
  /* ---------- Uyda: retsept ---------- */
  var rv = { id: null, n: 4 };
  function recipe(id) { return UY.byId(uy, id); }
  function recHtml() {
    var r = recipe(rv.id), l = L(), mas = UY.masalliq(r, rv.n, l), p = YC.portion(A.by(), { birlik: {} }, r.taom);
    return head(lbl(r.nom), 'yeuyback') + '<p class="rz-mut sm">' + esc(T('fwTime', { t: lbl(r.vaqt) })) + '</p>' +
      '<div class="rz-st">' + esc(T('fwPeople')) + '</div><div class="sl-stp" role="group" aria-label="' + esc(T('fwPeople')) + '"><button type="button" class="sl-pill" data-act="fwn" data-s="-1" aria-label="−"' + (rv.n <= 1 ? ' disabled' : '') + '>−</button><b id="fwN" aria-live="polite">' + rv.n + '</b><button type="button" class="sl-pill" data-act="fwn" data-s="1" aria-label="+"' + (rv.n >= 8 ? ' disabled' : '') + '>+</button></div>' +
      '<div class="rz-st">' + esc(T('fwMas')) + '</div><ul class="sl-mas" id="fwMas">' + mas.map(function (m) { return '<li><span>' + esc(m.n) + '</span><b>' + esc(m.text) + '</b></li>'; }).join('') + '</ul>' +
      '<div class="sl-fwb"><button type="button" class="rz-btn ghost sm" data-act="fwcopy">' + esc(T('fwCopy')) + '</button>' + (navigator.share ? '<button type="button" class="rz-btn ghost sm" data-act="fwshare">' + esc(T('fwShare')) + '</button>' : '') + '</div>' +
      '<div class="rz-st">' + esc(T('fwQad')) + '</div><ol class="sl-stps">' + r.qadamlar[l].map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' + (p ? '<p class="rz-priv">' + esc(T('fwKcalN', { k: p.k })) + '</p>' : '') +
      '<div class="sl-cta"><button type="button" class="sl-main" data-act="fwlog" data-k="' + esc(r.taom) + '">' + esc(T('fwLog')) + '</button></div>';
  }
  function listText() { return UY.royxat(recipe(rv.id), rv.n, L()); }
  function copyText(txt, msg) {
    var done = function () { A.toast(msg, null, true); };
    if (navigator.clipboard && navigator.clipboard.writeText) { try { navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt, done); }); } catch (e) { fallbackCopy(txt, done); } } else fallbackCopy(txt, done);
  }
  function fallbackCopy(txt, done) { try { var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); done(); } catch (e) {} }
  function dayHtml() { return head(T('fwDayT'), 'yewback') + '<p class="rz-p">' + esc(T('fwDayH')) + '</p>' + dayChips('fwdayset'); }
  /* ---------- Boshqa variantlar ---------- */
  var vv = { f: 'oqsil' };
  function varHtml() {
    var s = A.orSrc(); if (!s) return '';
    var list = YC.variants({ by: A.by(), data: data, key: s.key, portion: s.sp, table: A.table(), tags: A.tags(), cheklov: ch, yemaydi: yemay(), filtr: vv.f }); vv.list = list;
    var f0 = A.foodById(OR.split(s.key).id), nm = f0 ? A.nameOf(f0.al ? (A.foodById(f0.al.f) || f0) : f0) : '';
    var rows = list.map(function (v, i) {
      var p = { id: v.id, v: v.v, key: v.key, kafe: v.kafe };
      return '<button type="button" class="sl-yr-b full" data-act="yevgo" data-i="' + i + '">' + A.tileHtml(v.id, v.v, nameOfKey(p), 44) + '<span class="m"><span class="nm">' + esc(nameOfKey(p)) + ' ' + badge(p) + '</span><span class="tm">' + esc(A.orDesc(v)) + '</span></span>' + A.ico('chev', 'r') + '</button>';
    }).join('');
    return head(T('bvT'), 'yevback') + '<p class="rz-mut sm">' + esc(T('bvFor', { n: nm })) + '</p><div class="sl-ye-chips in" role="radiogroup">' + ['oqsil', 'kam', 'tam'].map(function (k) { return '<button type="button" role="radio" class="rz-chip' + (k === vv.f ? ' on' : '') + '" aria-checked="' + (k === vv.f) + '" data-act="yevf" data-f="' + k + '">' + esc(T('bvF_' + k)) + '</button>'; }).join('') + '</div>' +
      '<div class="sl-yrs">' + (rows || '<div class="rz-empty"><b>' + esc(T('bvNone')) + '</b></div>') + '</div>' + (list.some(function (v) { return v.kafe; }) ? '<p class="rz-priv">' + esc(T('yzNote')) + '</p>' : '');
  }
  function openVariants() { load(function () { vv.f = 'oqsil'; A.setSheet(varHtml()); }); }
  function varBtn() { return '<button type="button" class="sl-txtbtn" data-act="yevopen">' + esc(T('bvOpen')) + '</button>'; }
  /* ---------- mavjud foydalanuvchi: «Yemaydigan narsangiz bormi?» (bir martalik ixcham karta, Bugun) ---------- */
  function yemayAsked() { var p = A.prefs(); return p.yemayK != null || Array.isArray(p.yemay); }
  function yemayCard() {
    if (yemayAsked()) return '';
    return '<section class="rz-card sl-yq" id="yqCard"><b class="t">' + esc(T('yqT')) + '</b><div class="b"><button type="button" class="rz-btn sm" data-act="yqbel">' + esc(T('yqBel')) + '</button><button type="button" class="rz-btn ghost sm" data-act="yqyoq">' + esc(T('yqNo')) + '</button></div></section>';
  }
  function yemaySheet() { return head(T('ynT')) + '<p class="rz-p">' + esc(T('ynH')) + '</p>' + chipsHtml(yemay(), 'yntog') + '<p class="rz-priv sl-ywarn">' + esc(T('obYwarn')) + '</p><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="yqok">' + esc(T('obYok')) + '</button></div>'; }
  /* ---------- «Menyudan tanlash» (assets/kalkifit-menyu.js; AI faqat nom/narx o'qiydi, kkal — bazadan) ---------- */
  var mv = { busy: false, err: '', picks: null, n: 0, from: 'yeymiz' };
  function mnNative() { var N = window.KalkiNative; return !!(N && N.canPickPhoto && N.canPickPhoto() && N.pickPhotoFrom); }
  function mnBtns() { return mnNative() ? '<div class="sl-phc"><button type="button" class="rz-btn primary full" data-act="mngal">' + A.ico('img') + ' ' + esc(T('mnGal')) + '</button><button type="button" class="rz-btn primary full" data-act="mncam">' + A.ico('cam') + ' ' + esc(T('mnCam')) + '</button></div>'
    : '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="mnpick">' + A.ico('cam') + ' ' + esc(T('mnPick')) + '</button></div><input type="file" id="mnIn" accept="image/*" hidden>'; }
  function mnCard(c, i) {
    var nr = KalkiMenyu.narxTxt(c.narx, L(), c.valyuta), db = c.src === 'baza' ? (L() === 'ru' && c.dbNomRu ? c.dbNomRu : c.dbNom) : c.nom;
    var tile = A.tileHtml(c.ifid || '', null, c.asl, 44, false, c.bolim);
    return '<div class="sl-yr sl-mnr" data-src="' + c.src + '"><div class="sl-yr-b sl-mnb">' + tile + '<span class="m"><span class="nm sl-mnasl" data-cyr="skip">' + esc(c.asl) + '</span><span class="tm sl-mndb">' + esc(T(c.src === 'baza' ? 'mnBaza' : 'mnYig', { n: db, g: c.g })) + '</span><span class="tm">' + (c.est ? '≈ ' : '') + esc(T('mnKk', { k: c.k, p: Math.round(c.p) })) + (c.est ? ' · <i class="sl-mnest">' + esc(T('mnEst')) + '</i>' : '') + (nr ? ' · <b class="sl-mnp" data-cyr="skip">' + esc(nr) + '</b>' : '') + '</span><span class="sl-fls"><span class="sl-fl ' + (c.why === 'oqsil' ? 'o' : 'y') + '">' + esc(T('mnW_' + c.why)) + '</span></span></span></div><button type="button" class="sl-pill sl-yr-add" data-act="mnadd" data-i="' + i + '">' + esc(T('yzAdd')) + '</button></div>';
  }
  function mnHtml() {
    var h = head(T('mnT'), mv.from === 'yeymiz' ? 'yewback' : null), rem = A.remaining();
    if (mv.busy) return h + '<div class="rz-empty" id="mnBusy"><div class="sl-spin" aria-hidden="true"></div><b>' + esc(T('mnBusy')) + '</b></div>';
    if (mv.picks) {
      if (!mv.picks.length) return h + '<p class="rz-p warn" id="mnErr">' + esc(T(mv.n ? 'mnNoFit' : 'mnNo')) + '</p>' + (mv.n ? '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="yesearch">' + esc(T('yzSearch')) + '</button></div>' : mnBtns());
      return h + '<p class="rz-p" id="mnRes">' + esc(T('mnRes', { n: mv.n })) + '</p>' + (rem != null && rem > 0 ? '<p class="rz-p sm">' + esc(T('mnLeft', { k: rem })) + '</p>' : '') + '<div id="mnList">' + mv.picks.map(function (c, i) { return mnCard(c, i); }).join('') + '</div><p class="rz-priv">' + esc(T('mnPriv')) + '</p><div class="sl-fwf"><button type="button" class="sl-txtbtn" data-act="mnagain">' + esc(T('mnAgain')) + '</button></div>';
    }
    return h + '<p class="rz-p">' + esc(T('mnH')) + '</p>' + (mv.err ? '<p class="rz-p warn" id="mnErr">' + esc(mv.err) + '</p>' : '') + mnBtns() + '<p class="rz-priv">' + esc(T('mnPriv')) + '</p>';
  }
  function mnDraw() { if (A.sheetKind() !== 'menyu') A.openSheet('menyu', mnHtml()); else A.setSheet(mnHtml()); var i = A.$('#mnIn'); if (i && !i._b) { i._b = 1; i.addEventListener('change', function () { var f = i.files && i.files[0]; if (f) mnFile(f); }); } }
  function menuOpen(from) { mv = { busy: false, err: '', picks: null, n: 0, from: from === 'add' ? 'add' : 'yeymiz' }; mnDraw(); }
  function mnMatch(list) {                              // menyu taomi → bo'limi mos baza taomi yoki tarkibdan yig'ish (KalkiMenyu.plan); yemaydiganlar va cho'chqa — taklif qilinmaydi
    var by = A.by(), ym = yemay(), out = [];
    var ctx = { byId: function (id) { var f = A.foodById(id); return f && f.k != null ? f : null; }, match: function (n) { return A.matchFood(n); },
      portion: function (f) { var p = YC.portion(by, data, f.id); return p ? { g: p.g, k: p.k, p: p.p, f: p.f, c: p.c, u: p.u, n: p.n } : null; } };
    list.forEach(function (t) { var c = KalkiMenyu.plan(t, ctx); if (!c) return; c.ok = c.fid ? CH.ruxsat(ch, c.fid, ym) : KalkiMenyu.tegOk(t.tarkib, ym); if (!c.fid) c.ok = c.ok && KalkiMenyu.tegOk(t.tarkib, ['choshqa']); out.push(c); });
    return out;
  }
  function mnFile(file) {
    if (!file) return; mv.busy = true; mv.err = ''; mv.picks = null; mnDraw();
    var fail = function (key, ev, txt) { if (ev) sev('ai_sorov', 'menyu.' + ev); mv.busy = false; mv.err = txt || T(key); mnDraw(); };
    if (navigator.onLine === false) { fail('mnE_net', 'tarmoq'); return; }
    A.imgPrep(file, { px: 1600, maxBytes: 700000 }, function (b64, perr) {
      if (!b64) { perr === 'hajm' ? fail('mnE_big', 'hajm') : fail('mnE_fmt', 'format'); return; }
      var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, 50000);
      fetch('/api/kalkifit-menyu', { method: 'POST', signal: ctl ? ctl.signal : undefined, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ img: b64, til: A.isCyr && A.isCyr() ? 'kirill' : A.lang(), mijoz_id: A.cid(), platforma: A.aiPlat() || undefined }) })
        .then(function (r) { clearTimeout(tm); return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); }).then(function (res) {
          var j = res.j || {}; A.aiqSet && A.aiqSet(j);
          if (res.s === 429) { sev('ai_sorov', 'menyu.limit'); fail('', '', j.sabab !== 'sayt' && j.limit > 0 ? T('aiLimit', { n: j.limit }) : T('mnE_site')); return; }
          if (res.s === 413) { fail('mnE_big', 'hajm'); return; }
          if (res.s === 400 && (j.sabab === 'format' || !j.sabab)) { fail('mnE_fmt', 'format'); return; }
          if (res.s === 502 && j.sabab === 'parse') { fail('mnNo', 'bosh'); return; }          // model javobini o'qib bo'lmadi — odatda rasmda menyu matni yo'q/xira
          if (res.s !== 200 || !Array.isArray(j.taomlar)) { fail('mnE_srv', 'server'); return; }
          sev('ai_sorov', 'menyu.ok'); try { if (window.KalkiStatApp && KalkiStatApp.aiOpen) KalkiStatApp.aiOpen('menyu'); } catch (e) {}          // v52: AI natija voronkasi
          load(function () { A.withDb(function () { var c = mnMatch(j.taomlar); mv.n = j.taomlar.length; mv.picks = j.taomlar.length ? KalkiMenyu.pick(c, A.remaining(), data.chegara) : []; mv.busy = false; mnDraw(); }); });
        }).catch(function (e) { clearTimeout(tm); var k = A.aiNetErr(e); fail(k === 'vaqt' ? 'mnE_time' : 'mnE_net', k); });
    });
  }
  function mnNativePick(src) { KalkiNative.pickPhotoFrom(src).then(function (r) { if (r && r.file) mnFile(r.file); else if (r && r.error) { mv.err = T('mnErr'); mnDraw(); } }); }

  /* ---------- amallar ---------- */
  function dayChosen(d) { A.prefs().baliqKun = d; A.save(); A.pushResync(); }
  function act(a, el, ev) {
    switch (a) {
      case 'yedoor': show('kabob'); return true;
      case 'nyt': pv.t = el.getAttribute('data-v') || null; draw({ reset: true }); return true;
      case 'nyhave': dtOpen('#have'); return true;
      case 'pph': { var hk = el.getAttribute('data-v'), hl = ppHave().slice(), hi = hl.indexOf(hk); if (hi > -1) hl.splice(hi, 1); else hl.push(hk); ppSetHave(hl); draw(); return true; }
      case 'pphc': ppSetHave([]); pv.haveOn = false; pv.dt = null; draw({ reset: true }); return true;
      case 'nyhvgo': pv.haveOn = ppHave().length > 0; pv.dt = null; draw({ reset: true }); return true;
      case 'nyopen': dtOpen(el.getAttribute('data-id')); return true;
      case 'nyback': dtClose(); return true;
      case 'nyguest': pv.guest = !pv.guest; draw(); if (pv.guest) { var gl = A.$('#nyList'), ga = A.$('#nyList .ny-acc'); if (gl && ga) gl.scrollTop = Math.max(0, ga.offsetTop - 8); } return true;
      case 'nymul': if (pv.dt) { pv.mult[pv.dt] = +el.getAttribute('data-m') || 1; draw(); } return true;
      case 'nyate': ppAte(el.getAttribute('data-id')); return true;
      case 'nysave': ppSave(el.getAttribute('data-id')); return true;
      case 'nyadd': ppQuick(el.getAttribute('data-id')); return true;
      case 'nykadd': case 'nykhalf': { var kk = el.getAttribute('data-k'), half = a === 'nykhalf'; if (!A.added('k:' + kk + (half ? '|h' : ''))) { sev('ovqat_qoshildi', 'tavsiya'); count(yv.toifa === 'baliq' ? 'baliq_kafe_yozildi' : 'yeymiz_tanlandi'); } A.quickKey('k:' + kk + (half ? '|h' : ''), kk, porOf(el), half); return true; }
      case 'yechip': sev('yeymiz_chip', STCH[el.getAttribute('data-c')] ? el.getAttribute('data-c') : 'boshqa'); show(el.getAttribute('data-c')); return true;
      case 'yechip2': { var c = el.getAttribute('data-c'); sev('yeymiz_chip', STCH[c] ? c : 'boshqa'); if (c === 'baliq') count('baliq_oyna_ochildi'); yv.toifa = c; draw({ reset: true }); return true; }
      case 'yeseg': pv.dt = null; sev('yeymiz_segment', /^(kafe|buyurtma|uyda)$/.test(el.getAttribute('data-s')) ? el.getAttribute('data-s') : 'kafe'); yv.seg = el.getAttribute('data-s'); lsSet(yv.seg); draw({ reset: true }); return true;
      case 'yepick': { count(yv.toifa === 'baliq' ? 'baliq_kafe_yozildi' : 'yeymiz_tanlandi'); A.pickKey(el.getAttribute('data-k'), 'y', porOf(el)); return true; }
      case 'yeadd': { sev('ovqat_qoshildi', 'tavsiya'); count(yv.toifa === 'baliq' ? 'baliq_kafe_yozildi' : 'yeymiz_tanlandi'); A.logKey(el.getAttribute('data-k'), porOf(el)); return true; }
      case 'yesearch': A.openAdd({}); return true;
      case 'yeorder': { sev('buyurtma_hamkor', /uzum/.test(el.getAttribute('data-p') || '') ? 'uzum' : 'yandex'); var q = qWord(); count(yv.toifa === 'baliq' ? 'baliq_buyurtma_bosildi' : 'yeymiz_buyurtma_bosildi', el.getAttribute('data-p')); copyText(q, T('yzCopied', { q: q })); if (A.openExternal(el.getAttribute('href')) && ev) ev.preventDefault(); return true; }
      case 'yerec': { rv = { id: el.getAttribute('data-id'), n: UY.kishiOk(A.prefs().baliqKishi || uy.kishi.standart) }; count(yv.toifa === 'baliq' ? 'baliq_uyda_ochildi' : 'yeymiz_uyda_ochildi'); A.setSheet(page(recHtml())); return true; }
      case 'yeuyback': draw(); return true;
      case 'yntog': toggleYemay(el.getAttribute('data-t')); if (A.sheetKind() === 'yemay') A.setSheet(yemaySheet()); else A.render(); return true;
      case 'obyntog': A.obYnToggle(el.getAttribute('data-t')); return true;
      case 'yqbel': A.openSheet('yemay', yemaySheet()); return true;
      case 'yqyoq': A.prefs().yemayK = 1; count('yemaydi_hammasi'); A.save(); A.render(); return true;
      case 'yqok': { A.prefs().yemayK = 1; count(yemay().length ? 'yemaydi_tanlandi' : 'yemaydi_hammasi'); A.save(); A.closeSheet(); A.render(); return true; }
      case 'fwn': { rv.n = UY.kishiOk(Math.max(1, Math.min(8, rv.n + (+el.getAttribute('data-s'))))); A.prefs().baliqKishi = rv.n; A.save(); var sc = A.$('#nyList') ? A.$('#nyList').scrollTop : 0; A.setSheet(page(recHtml())); if (A.$('#nyList')) A.$('#nyList').scrollTop = sc; return true; }
      case 'fwcopy': copyText(listText(), T('fwCopied')); return true;
      case 'fwshare': { var txt = listText(); if (navigator.share) navigator.share({ text: txt }).catch(function () {}); else copyText(txt, T('fwCopied')); return true; }
      case 'fwlog': A.pickKey(el.getAttribute('data-k'), 'y'); return true;
      case 'fwno': { var prev = yemay().slice(), pb = A.prefs().baliqOff; setYemay(prev.indexOf('baliq') > -1 ? prev : prev.concat('baliq')); A.closeSheet(); A.render(); A.toast(T('fwNoDone'), function () { A.prefs().baliqOff = pb; setYemay(prev); A.render(); }, true); return true; }
      case 'fwday': A.setSheet(page(dayHtml())); return true;
      case 'yewback': draw(); return true;
      case 'fwdayset': { var d = +el.getAttribute('data-d'); dayChosen(d); A.closeSheet(); A.render(); A.toast(T('fwDayDone', { d: dayName(d) }), null, true); return true; }
      case 'fwdayprof': { dayChosen(+el.getAttribute('data-d')); A.render(); return true; }
      case 'fwdaypick': { var d2 = +el.getAttribute('data-d'); dayChosen(d2); A.closeSheet(); A.render(); A.toast(T('fwDayDone', { d: dayName(d2) }), null, true); return true; }
      case 'yevopen': openVariants(); return true;
      case 'mnopen': yv.tip = false; menuOpen(el.getAttribute('data-f')); return true;
      case 'mnpick': { var mi = A.$('#mnIn'); if (mi) { mi.value = ''; mi.click(); } return true; }
      case 'mngal': mnNativePick('PHOTOS'); return true; case 'mncam': mnNativePick('CAMERA'); return true;
      case 'mnagain': menuOpen(mv.from); return true;
      case 'mnadd': { var mc = mv.picks && mv.picks[+el.getAttribute('data-i')]; if (mc) A.logMenu(mc); return true; }
      case 'yevf': vv.f = el.getAttribute('data-f'); A.setSheet(varHtml()); return true;
      case 'yevback': A.setSheet(A.portionHtml()); return true;
      case 'yevgo': { var it = vv.list && vv.list[+el.getAttribute('data-i')]; if (it) { count('orinbosar_tanlandi'); A.orApply(it); } return true; }
    }
    return false;
  }
  function init(api) {
    A = api; Object.keys(D).forEach(function (l) { Object.keys(D[l]).forEach(function (k) { api.D[l][k] = D[l][k]; }); });
    api.addIcons(ICONS); hs = HS && HS.browser ? HS.browser() : null;
  }
  window.KalkiYeymizUI = { backStep: backStep, redraw: redraw, kunQisqa: kunQisqa, daySheet: daySheet, menuOpen: menuOpen, chReady: chReady, loadCh: loadCh, rinfo: rinfo, hitText: hitText, init: init, act: act, load: load, todayCard: todayCard, profileCard: profileCard, profileDays: profileDays, filterAlts: filterAlts, varBtn: varBtn, count: count, chipsHtml: chipsHtml, yemayCard: yemayCard, yBack: back, fishBack: back, openFish: openFish, avoids: avoids, yemay: yemay, kunBugun: kunNow, dayName: dayName, iconFor: iconName, badge: badge, chips: CHIPS, D: D, IKON: IKON };
})();
