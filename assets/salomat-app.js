/* kalki.uz — "Salomat" ilovasi (vanilla JS): kaloriya, ovqat va qadam. Hisob: assets/salomat-core.js, umumiy komponentlar: assets/app-kit.js.
 * Saqlash: localStorage "kalki_salomat". Hech narsa serverga yuborilmaydi (faqat foydalanuvchi "AI bilan aniqlash"ni bosganda ovqat matni). Baza: data/ovqatlar.json (lazy). */
(function () {
  'use strict';
  if (/jsdom/i.test(navigator.userAgent || '')) return;      // prerender (jsdom) ilova DOM'ini HTML'ga pishirmasin
  var S = window.KalkiSalomat, Dt = S && S.dates; if (!S || !window.RzKit) return;
  var LS = 'kalki_salomat', LS_IMPORT = 'kalki_salomat_import', LS_CID = 'kalki_salomat_cid', DAY_MS = 86400000;
  var D = {
    uz: {
      appName: 'Salomat', navToday: 'Bugun', navFood: 'Ovqat', navSteps: 'Qadam', navMe: 'Men', add: "Ovqat qo'shish", kcal: 'kkal', gram: 'g', km: 'km',
      today: 'Bugun', yesterday: 'Kecha', back: 'Orqaga', next: 'Keyingi', start: 'Boshlash', save: 'Saqlash', cancel: 'Bekor qilish', del: "O'chirish", close: 'Yopish', confirm: 'Tasdiqlash', later: 'Keyinroq', saved: 'Saqlandi', del1: "Yozuv o'chirildi",
      mealb: 'Nonushta', meall: 'Tushlik', mealds: 'Kechki ovqat', mealss: 'Gazak', meald: 'Kechki ovqat', meals: 'Gazak',
      o1q: 'Jinsingiz?', male: 'Erkak', female: 'Ayol', preg: 'Homiladorman yoki emizikli onaman', o2q: 'Yoshingiz nechida?', o2h: "Faqat kunlik me'yorni hisoblash uchun.", o3q: "Bo'yingiz necha sm?", o4q: 'Vazningiz necha kg?', o4h: 'Kasr bilan yozish mumkin: 72,5',
      o5q: "Kuningiz qanday o'tadi?", o6q: 'Maqsadingiz?', errAge: '10 dan 100 gacha yozing', errHeight: '120 dan 230 gacha yozing', errWeight: '30 dan 250 gacha yozing',
      a1: "Ko'proq o'tiraman", a1h: "Ofis yoki uyda ishlayman, kam yuraman", a2: 'Yengil faol', a2h: "Ozgina yuraman yoki haftada 1–2 mashq", a3: "O'rtacha faol", a3h: 'Haftada 3–5 mashq', a4: 'Juda faol', a4h: 'Deyarli har kuni mashq', a5: "Og'ir jismoniy mehnat", a5h: "Kun bo'yi oyoqda, og'ir ish",
      gkeep: 'Vaznni saqlash', gkeepH: "Hozirgi vaznni ushlab turish", gslow: 'Sekin kamaytirish', gslowH: 'Haftasiga ≈ 0,25 kg', glose: 'Kamaytirish', gloseH: 'Haftasiga ≈ 0,5 kg', ggain: "Ko'paytirish", ggainH: 'Haftasiga ≈ 0,25 kg', gLocked: "Sizning holatingizda faqat vaznni saqlash rejimi hisoblanadi.",
      rT: "Sizning kunlik me'yoringiz", rWhyKeep: 'Siz kuniga taxminan {tdee} kkal sarflaysiz. Vaznni saqlash uchun shuncha yeyish kifoya.', rWhyLose: 'Siz kuniga taxminan {tdee} kkal sarflaysiz. Haftasiga ≈ {kg} kg kamaytirish uchun {d} kkal kam yeysiz.', rWhyGain: "Siz kuniga taxminan {tdee} kkal sarflaysiz. Haftasiga ≈ {kg} kg ko'paytirish uchun {d} kkal ko'p yeysiz.",
      rFloor: "Kamaytirish tezligi xavfsiz chegaraga ({min} kkal) moslandi, shuning uchun haftasiga ≈ {kg} kg.", rDoc: "Shifokor bilan maslahatlashing. Bu hisob faqat vaznni saqlash uchun.", under18: "18 yoshdan kichiklar uchun dieta hisoblanmaydi.", pregN: "Homiladorlik va emizish davrida dieta hisoblanmaydi.", lowBmi: "Vazningiz me'yordan past (BMI < 18,5): dieta hisoblanmaydi.",
      disc: "Taxminiy hisob — tibbiy maslahat emas.", rMacro: 'Oqsil {p} g · yog\' {f} g · uglevod {c} g', rWater: 'Suv: {n} stakan ({ml} ml)',
      ringOf: '/ {t} kkal', remLbl: 'Yana yeyish mumkin', overLbl: "Me'yordan ko'p", stepPlus: 'Qadamlar hisobiga +{c} kkal', hHow: 'Bu raqam qanday hisoblanadi?',
      mP: 'Oqsil', mF: "Yog'", mC: 'Uglevod', wT: 'Suv', wOf: '{n} / {m} stakan', wHint: 'Stakanga bosing', wDone: "Suv me'yori bajarildi", sT: 'Qadam', sAdd: 'Qadam kiritish', sNone: 'Bugun hali kiritilmagan', sGoalDone: 'Qadam maqsadi bajarildi',
      addMeal: "+ Qo'shish", emptyMeal: "Hali yo'q",
      aT: "Ovqat qo'shish", aPh: 'Ovqat nomi (osh, somsa, olma…)', aRec: 'Oxirgi', aFav: 'Sevimli', aPop: 'Mashhur', aNone: 'Topilmadi', aNoneH: "Boshqa nom bilan yozing yoki o'z taomingizni qo'shing.", aCustom: "O'z taomimni qo'shish", aText: 'Matn bilan qo\'shish', aLoading: 'Baza yuklanmoqda…', aEst: 'taxminiy', per100: '{k} kkal / 100 g', all: 'Hammasi',
      cat_o: "O'zbek taomlari", cat_n: 'Non', cat_s: 'Sut', cat_m: "Go'sht, baliq, tuxum", cat_g: 'Don va makaron', cat_v: 'Sabzavot', cat_f: 'Meva', cat_d: "Yong'oq, quruq meva", cat_i: 'Ichimlik', cat_q: 'Fast-food', cat_h: 'Shirinlik', cat_x: 'Boshqa',
      pUnit: 'Qancha?', pMeal: 'Qaysi ovqat?', pSave: 'Saqlash', pEstNote: "Taxminiy qiymat: aniq retsept va porsiyaga qarab o'zgaradi.", pEdit: 'Ovqatni tahrirlash', pMacro: "oqsil {p} · yog' {f} · uglevod {c}", favOn: 'Sevimlilarga qo\'shildi', favOff: 'Sevimlilardan olindi',
      cT: "O'z taomim", cName: 'Nomi', cKcal: 'Necha kkal? (bir porsiyada)', cG: "Porsiya og'irligi, g (ixtiyoriy)", cP: 'Oqsil, g (ixtiyoriy)', cF: "Yog', g (ixtiyoriy)", cC: 'Uglevod, g (ixtiyoriy)',
      tT: "Matn bilan qo'shish", tPh: 'Masalan: 1 kosa osh, 2 somsa, choy shakar bilan', tGo: 'Aniqlash', tMiss: 'Topilmadi: {x}', tAi: 'AI bilan aniqlash', tAiNote: "Bu matn AI xizmatiga yuboriladi (profil, vazn va tarix yuborilmaydi).", tAiBusy: 'Aniqlanmoqda…', tAiErr: "AI hozir ishlamayapti. Qo'lda qo'shing.", tOffline: "Internet yo'q — AI ishlamaydi. Topilganlarini saqlashingiz mumkin.", tSave: '{n} ta ovqatni saqlash', tAiTag: 'AI taxmini', tHelp: "Faqat siz tasdiqlaganingizda saqlanadi.", tEmpty: 'Hech narsa topilmadi',
      fT: 'Ovqat', fDay: 'Kun', fAddText: "Matn bilan qo'shish", fFavs: 'Sevimlilar', fNoFavs: "Sevimli ovqatlar yo'q. Ovqat qo'shayotganda yurakchani bosing.",
      stT: 'Qadam', stGoal: 'Maqsad: {x}', stEnter: 'Telefondagi jami qadamni yozing', stWhere: 'Qadam sonini qayerdan topaman?', stWeek: 'Oxirgi 7 kun', stCmp: "Bu {km} km — {route} yo'lining {pct}%", stCmpFull: 'Bu taxminan {route} masofasi ({km} km) dan ko\'proq', stMonth: 'Shu oy', stGoalSet: 'Kunlik qadam maqsadi', stDayEdit: '{d} kuni qadami', stTotal: 'Jami: {n} qadam · {km} km · {k} kkal', stNoRank: 'Bu faqat o\'zingiz uchun — reyting yo\'q.',
      hT: 'Qadam sonini qayerdan topaman?', hIos: "iPhone: «Salomatlik» (Health) ilovasi → Ko'rish → Qadamlar", hSam: 'Samsung: Samsung Health → bosh sahifa → Qadamlar', hGoo: 'Android: Google Fit → bosh sahifa → Qadamlar', hNote: "Jami qadamni yozing — ilova masofa va kaloriyani o'zi hisoblaydi.",
      meT: 'Men', meProf: 'Profil', meEdit: 'Tahrirlash', meW: 'Vazn', meAddW: "Vazn qo'shish", meAvg: '7 kunlik o\'rtacha: {x} kg', meAvgH: "Bir kunlik tebranish muhim emas — o'rtacha chiziqqa qarang.", meNoW: "Vazn yozilmagan", meGoalW: "Maqsad vazni, kg (ixtiyoriy)", meProg: "Maqsadgacha {x} kg qoldi", meDelta: 'Boshlanishdan {x} kg', meShare: 'Natijamni ulashish',
      pfAge: 'Yosh', pfH: "Bo'y, sm", pfW: 'Vazn, kg', pfAct: 'Faollik', pfGoal: 'Maqsad', pfSex: 'Jins', pfSaved: "Me'yor yangilandi: {x} kkal",
      wtT: 'Vaznni yozish', wDay: 'Qaysi kun?',
      shT: 'Natijamni ulashish', shH: "Faqat o'zingiz tanlagan raqamlar rasmga tushadi.", shDays: 'Kunlar', shSteps: 'Qadam', shKm: 'Masofa', shWeight: "Vazn o'zgarishi", shGo: 'Rasmni ulashish', shDl: 'Rasmni yuklab olish', shTitle: 'Mening natijam', shWin: 'Oxirgi 30 kun', shDaysV: 'kun yozdim', shStepsV: 'qadam', shKmV: 'km yurdim', shWV: 'kg', shNone: 'Hech narsa tanlanmagan',
      sExp: "Ma'lumotni yuklab olish (JSON)", sImp: 'Fayldan tiklash', sDel: "Hammasini o'chirish", sLang: 'Til', sFont: "Shrift o'lchami", fN: 'Oddiy', fB: 'Katta', sTips: "Yo'l-yo'riqni qayta ko'rish", sAbout: 'Ilova haqida', priv: "Ma'lumotlaringiz faqat shu qurilmada saqlanadi.", med: "Bu tibbiy maslahat emas. Taxminiy hisob: sog'liq masalasida shifokor bilan maslahatlashing.",
      expDone: 'Fayl yuklab olindi', impT: 'Fayldan tiklash', impAsk: "Hozirgi ma'lumot shu fayldagi bilan almashtiriladi. Davom etasizmi?", impOk: 'Tiklandi', impBad: "Fayl noto'g'ri", delAsk1: "Hamma ma'lumot o'chiriladi.", delAsk2: "Aniq o'chiraymi? Qaytarib bo'lmaydi.", deleted: "Hammasi o'chirildi",
      xKcalT: "Bu raqam qanday hisoblanadi?", xTarget: "Kunlik me'yor", xEaten: 'Yeyilgan', xSteps: 'Qadamlar (50%)', xRem: 'Yana yeyish mumkin', xWhy50: "Qadam kaloriyasining faqat yarmi qo'shiladi: telefon va formulalar taxminiy, shuning uchun ortiqcha hisoblab yubormaslik uchun.", xHowT: "Me'yor qanday chiqdi?", xBmr: 'Tinch holatdagi sarf (BMR)', xBmrN: 'Mifflin–St Jeor formulasi', xAct: 'Faollik koeffitsienti', xTdee: 'Kunlik sarf (TDEE)', xGoal: 'Maqsad uchun farq', xFloor: "Pastki xavfsiz chegara", xTargetR: "Kunlik me'yor",
      xMacroT: 'Qanday hisoblangan?', xProt: 'Oqsil: {pk} g/kg × {w} kg = {p} g', xFat: "Yog': kaloriyaning 27,5% i ÷ 9 = {f} g", xCarb: "Uglevod: qolgan kaloriya ÷ 4 = {c} g", xMacroN: 'Oqsil mushaklarni saqlaydi, yog\' va uglevod energiya beradi.',
      xWaterT: 'Suv me\'yori', xWater: '33 ml × {w} kg = {ml} ml ÷ 250 ml = {n} stakan', xWaterN: 'Issiq kunlarda va mashq qilganda ko\'proq ichsangiz bo\'ladi.',
      xStepT: 'Qadam qanday hisoblanadi?', xStride: "Qadam uzunligi: bo'y × 0,414 = {s} sm", xDist: 'Masofa: {n} qadam × {s} sm = {km} km', xKc: 'Kaloriya: 3,5 × {w} kg × ({km} km ÷ 5 km/soat) = {k} kkal', xKcN: "Yurish tezligi 5 km/soat deb olingan (oddiy yurish). Hisob taxminiy.",
      xWeightT: '7 kunlik o\'rtacha nima?', xWeightN: "Oxirgi 7 kundagi yozuvlarning o'rtachasi. Vazn kun davomida 1–2 kg tebranadi — shu sababli o'rtacha chiziqqa qarang.",
      tip1: "Bu halqa — bugungi me'yor. Ovqat yozsangiz to'ladi, «yana yeyish mumkin» raqami kamayadi.", tip2: "«+» tugmasi — ovqat qo'shish. Odatda 3 ta bosish yetadi.", tip3: "«Qadam» bo'limida telefondagi qadam sonini yozing — ilova masofa va kaloriyani hisoblaydi.",
      wkT: "O'tgan hafta", wkAvgK: "O'rtacha: {x} kkal/kun", wkAvgS: "O'rtacha qadam: {x}", wkW: "Vazn (7 kunlik o'rtacha): {a} → {b} kg", wkDays: '{n} kun yozilgan', wkNone: "Ma'lumot kam",
      nudgeInstall: "Ilovani bosh ekranga qo'shing — tezroq ochiladi va ma'lumot saqlanadi.", nudgeInstallBtn: "O'rnatish", nudgeIos: "iPhone'da: Safari'da «Ulashish» → «Bosh ekranga qo'shish». Aks holda Safari ma'lumotni o'chirib yuborishi mumkin.", nudgeBackup: "Zaxira nusxa olish vaqti keldi — ma'lumot faqat shu qurilmada.", nudgeBackupBtn: 'Nusxa olish',
      qtyMinus: 'Kamaytirish', qtyPlus: "Ko'paytirish", aboutBack: 'Orqaga', errAmt: 'Raqamni kiriting', stepsT: 'Bugungi qadam', stepsOf: '{d} kuni qadami',
      units: { g100: 'g', kosa: 'kosa', likop: 'likop', dona: 'dona', bolak: "bo'lak", stakan: 'stakan', qoshiq: 'osh qoshiq', choyq: 'choy qoshiq', piyola: 'piyola', porsiya: 'porsiya', hovuch: 'hovuch', tilim: 'tilim', shisha: 'shisha' }
    },
    ru: {
      appName: 'Саломат', navToday: 'Сегодня', navFood: 'Еда', navSteps: 'Шаги', navMe: 'Я', add: 'Добавить еду', kcal: 'ккал', gram: 'г', km: 'км',
      today: 'Сегодня', yesterday: 'Вчера', back: 'Назад', next: 'Далее', start: 'Начать', save: 'Сохранить', cancel: 'Отмена', del: 'Удалить', close: 'Закрыть', confirm: 'Подтвердить', later: 'Позже', saved: 'Сохранено', del1: 'Запись удалена',
      mealb: 'Завтрак', meall: 'Обед', mealds: 'Ужин', mealss: 'Перекус', meald: 'Ужин', meals: 'Перекус',
      o1q: 'Ваш пол?', male: 'Мужской', female: 'Женский', preg: 'Я беременна или кормлю грудью', o2q: 'Сколько вам лет?', o2h: 'Только для расчёта дневной нормы.', o3q: 'Ваш рост в сантиметрах?', o4q: 'Ваш вес в килограммах?', o4h: 'Можно с дробью: 72,5',
      o5q: 'Как проходит ваш день?', o6q: 'Ваша цель?', errAge: 'Введите от 10 до 100', errHeight: 'Введите от 120 до 230', errWeight: 'Введите от 30 до 250',
      a1: 'Больше сижу', a1h: 'Работаю в офисе или дома, мало хожу', a2: 'Слегка активный', a2h: 'Немного хожу или 1–2 тренировки в неделю', a3: 'Умеренно активный', a3h: '3–5 тренировок в неделю', a4: 'Очень активный', a4h: 'Тренировки почти каждый день', a5: 'Тяжёлый физический труд', a5h: 'Весь день на ногах, тяжёлая работа',
      gkeep: 'Сохранить вес', gkeepH: 'Удерживать текущий вес', gslow: 'Медленно снижать', gslowH: '≈ 0,25 кг в неделю', glose: 'Снижать', gloseH: '≈ 0,5 кг в неделю', ggain: 'Набирать', ggainH: '≈ 0,25 кг в неделю', gLocked: 'В вашем случае считается только режим сохранения веса.',
      rT: 'Ваша дневная норма', rWhyKeep: 'Вы тратите примерно {tdee} ккал в день. Чтобы сохранить вес, достаточно столько и есть.', rWhyLose: 'Вы тратите примерно {tdee} ккал в день. Чтобы терять ≈ {kg} кг в неделю, нужно есть на {d} ккал меньше.', rWhyGain: 'Вы тратите примерно {tdee} ккал в день. Чтобы набирать ≈ {kg} кг в неделю, нужно есть на {d} ккал больше.',
      rFloor: 'Темп снижения приведён к безопасной границе ({min} ккал), поэтому ≈ {kg} кг в неделю.', rDoc: 'Проконсультируйтесь с врачом. Этот расчёт только для сохранения веса.', under18: 'Для лиц младше 18 лет диета не рассчитывается.', pregN: 'Во время беременности и кормления диета не рассчитывается.', lowBmi: 'Ваш вес ниже нормы (ИМТ < 18,5): диета не рассчитывается.',
      disc: 'Приблизительный расчёт — не медицинская рекомендация.', rMacro: 'Белки {p} г · жиры {f} г · углеводы {c} г', rWater: 'Вода: {n} стаканов ({ml} мл)',
      ringOf: '/ {t} ккал', remLbl: 'Ещё можно съесть', overLbl: 'Больше нормы', stepPlus: 'За счёт шагов +{c} ккал', hHow: 'Как считается это число?',
      mP: 'Белки', mF: 'Жиры', mC: 'Углеводы', wT: 'Вода', wOf: '{n} / {m} стаканов', wHint: 'Нажимайте на стакан', wDone: 'Норма воды выполнена', sT: 'Шаги', sAdd: 'Ввести шаги', sNone: 'Сегодня ещё не введено', sGoalDone: 'Цель по шагам выполнена',
      addMeal: '+ Добавить', emptyMeal: 'Пока пусто',
      aT: 'Добавить еду', aPh: 'Название (плов, самса, яблоко…)', aRec: 'Недавние', aFav: 'Избранное', aPop: 'Популярное', aNone: 'Не найдено', aNoneH: 'Напишите иначе или добавьте своё блюдо.', aCustom: 'Добавить своё блюдо', aText: 'Добавить текстом', aLoading: 'Загрузка базы…', aEst: 'примерно', per100: '{k} ккал / 100 г', all: 'Все',
      cat_o: 'Узбекские блюда', cat_n: 'Хлеб', cat_s: 'Молочное', cat_m: 'Мясо, рыба, яйца', cat_g: 'Крупы и макароны', cat_v: 'Овощи', cat_f: 'Фрукты', cat_d: 'Орехи, сухофрукты', cat_i: 'Напитки', cat_q: 'Фастфуд', cat_h: 'Сладкое', cat_x: 'Другое',
      pUnit: 'Сколько?', pMeal: 'Какой приём пищи?', pSave: 'Сохранить', pEstNote: 'Значение примерное: зависит от рецепта и порции.', pEdit: 'Изменить запись', pMacro: 'белки {p} · жиры {f} · углеводы {c}', favOn: 'Добавлено в избранное', favOff: 'Убрано из избранного',
      cT: 'Моё блюдо', cName: 'Название', cKcal: 'Сколько ккал? (в одной порции)', cG: 'Вес порции, г (по желанию)', cP: 'Белки, г (по желанию)', cF: 'Жиры, г (по желанию)', cC: 'Углеводы, г (по желанию)',
      tT: 'Добавить текстом', tPh: 'Например: 1 миска плова, 2 самсы, чай с сахаром', tGo: 'Распознать', tMiss: 'Не найдено: {x}', tAi: 'Определить с помощью ИИ', tAiNote: 'Этот текст будет отправлен сервису ИИ (профиль, вес и история не отправляются).', tAiBusy: 'Определяю…', tAiErr: 'ИИ сейчас недоступен. Добавьте вручную.', tOffline: 'Нет интернета — ИИ не работает. Найденное можно сохранить.', tSave: 'Сохранить: {n}', tAiTag: 'оценка ИИ', tHelp: 'Сохраняется только после вашего подтверждения.', tEmpty: 'Ничего не найдено',
      fT: 'Еда', fDay: 'День', fAddText: 'Добавить текстом', fFavs: 'Избранное', fNoFavs: 'Избранного нет. Нажмите на сердечко при добавлении еды.',
      stT: 'Шаги', stGoal: 'Цель: {x}', stEnter: 'Введите общее число шагов с телефона', stWhere: 'Где посмотреть число шагов?', stWeek: 'Последние 7 дней', stCmp: 'Это {km} км — {pct}% пути {route}', stCmpFull: 'Это больше расстояния {route} (≈ {km} км)', stMonth: 'За этот месяц', stGoalSet: 'Дневная цель по шагам', stDayEdit: 'Шаги за {d}', stTotal: 'Всего: {n} шагов · {km} км · {k} ккал', stNoRank: 'Это только для вас — никаких рейтингов.',
      hT: 'Где посмотреть число шагов?', hIos: 'iPhone: приложение «Здоровье» → Обзор → Шаги', hSam: 'Samsung: Samsung Health → главная → Шаги', hGoo: 'Android: Google Fit → главная → Шаги', hNote: 'Введите общее число шагов — расстояние и калории приложение посчитает само.',
      meT: 'Я', meProf: 'Профиль', meEdit: 'Изменить', meW: 'Вес', meAddW: 'Записать вес', meAvg: 'Среднее за 7 дней: {x} кг', meAvgH: 'Колебания за один день не важны — смотрите на линию среднего.', meNoW: 'Вес не записан', meGoalW: 'Желаемый вес, кг (по желанию)', meProg: 'До цели осталось {x} кг', meDelta: 'С начала: {x} кг', meShare: 'Поделиться результатом',
      pfAge: 'Возраст', pfH: 'Рост, см', pfW: 'Вес, кг', pfAct: 'Активность', pfGoal: 'Цель', pfSex: 'Пол', pfSaved: 'Норма обновлена: {x} ккал',
      wtT: 'Записать вес', wDay: 'За какой день?',
      shT: 'Поделиться результатом', shH: 'На картинку попадут только выбранные вами цифры.', shDays: 'Дни', shSteps: 'Шаги', shKm: 'Расстояние', shWeight: 'Изменение веса', shGo: 'Поделиться картинкой', shDl: 'Скачать картинку', shTitle: 'Мой результат', shWin: 'Последние 30 дней', shDaysV: 'дн. вёл записи', shStepsV: 'шагов', shKmV: 'км пройдено', shWV: 'кг', shNone: 'Ничего не выбрано',
      sExp: 'Скачать данные (JSON)', sImp: 'Восстановить из файла', sDel: 'Удалить всё', sLang: 'Язык', sFont: 'Размер шрифта', fN: 'Обычный', fB: 'Крупный', sTips: 'Показать подсказки снова', sAbout: 'О приложении', priv: 'Ваши данные хранятся только на этом устройстве.', med: 'Это не медицинская рекомендация. Расчёт приблизительный: по вопросам здоровья консультируйтесь с врачом.',
      expDone: 'Файл скачан', impT: 'Восстановление из файла', impAsk: 'Текущие данные будут заменены данными из файла. Продолжить?', impOk: 'Восстановлено', impBad: 'Неверный файл', delAsk1: 'Все данные будут удалены.', delAsk2: 'Точно удалить? Вернуть нельзя.', deleted: 'Всё удалено',
      xKcalT: 'Как считается это число?', xTarget: 'Дневная норма', xEaten: 'Съедено', xSteps: 'Шаги (50%)', xRem: 'Ещё можно съесть', xWhy50: 'Прибавляется только половина калорий от шагов: телефон и формулы приблизительны, чтобы не посчитать лишнего.', xHowT: 'Как получилась норма?', xBmr: 'Расход в покое (BMR)', xBmrN: 'формула Миффлина — Сан-Жеора', xAct: 'Коэффициент активности', xTdee: 'Дневной расход (TDEE)', xGoal: 'Разница для цели', xFloor: 'Нижняя безопасная граница', xTargetR: 'Дневная норма',
      xMacroT: 'Как посчитано?', xProt: 'Белки: {pk} г/кг × {w} кг = {p} г', xFat: 'Жиры: 27,5% калорий ÷ 9 = {f} г', xCarb: 'Углеводы: остаток калорий ÷ 4 = {c} г', xMacroN: 'Белок сохраняет мышцы, жиры и углеводы дают энергию.',
      xWaterT: 'Норма воды', xWater: '33 мл × {w} кг = {ml} мл ÷ 250 мл = {n} стаканов', xWaterN: 'В жару и при тренировках можно пить больше.',
      xStepT: 'Как считаются шаги?', xStride: 'Длина шага: рост × 0,414 = {s} см', xDist: 'Расстояние: {n} шагов × {s} см = {km} км', xKc: 'Калории: 3,5 × {w} кг × ({km} км ÷ 5 км/ч) = {k} ккал', xKcN: 'Скорость ходьбы принята 5 км/ч (обычная ходьба). Расчёт приблизительный.',
      xWeightT: 'Что такое среднее за 7 дней?', xWeightN: 'Среднее по записям за последние 7 дней. Вес в течение дня колеблется на 1–2 кг — поэтому смотрите на линию среднего.',
      tip1: 'Это кольцо — норма на сегодня. Записываете еду — оно заполняется, а «ещё можно съесть» уменьшается.', tip2: 'Кнопка «+» — добавить еду. Обычно хватает 3 нажатий.', tip3: 'В разделе «Шаги» введите число шагов с телефона — приложение посчитает расстояние и калории.',
      wkT: 'Прошлая неделя', wkAvgK: 'В среднем: {x} ккал/день', wkAvgS: 'В среднем шагов: {x}', wkW: 'Вес (среднее за 7 дней): {a} → {b} кг', wkDays: 'Записей: {n} дн.', wkNone: 'Мало данных',
      nudgeInstall: 'Добавьте приложение на главный экран — открывается быстрее, данные надёжнее.', nudgeInstallBtn: 'Установить', nudgeIos: 'На iPhone: в Safari «Поделиться» → «На экран «Домой»». Иначе Safari может удалить данные.', nudgeBackup: 'Пора сделать резервную копию — данные хранятся только на этом устройстве.', nudgeBackupBtn: 'Скачать копию',
      qtyMinus: 'Меньше', qtyPlus: 'Больше', aboutBack: 'Назад', errAmt: 'Введите число', stepsT: 'Шаги за сегодня', stepsOf: 'Шаги за {d}',
      units: { g100: 'г', kosa: 'миска', likop: 'тарелка', dona: 'шт.', bolak: 'кусок', stakan: 'стакан', qoshiq: 'ст. ложка', choyq: 'ч. ложка', piyola: 'пиала', porsiya: 'порция', hovuch: 'горсть', tilim: 'ломтик', shisha: 'бутылка' }
    }
  };
  var root = document.getElementById('rzApp');
  var st = null, view = 'today', lang = langNow(), enterNext = true, foodDay = null, db = null, dbState = 0, heroPrev = null, seenFood = null, ob = null, reduce = false;
  function langNow() { return document.documentElement.lang === 'ru' ? 'ru' : 'uz'; }
  function isCyr() { return document.documentElement.getAttribute('data-script') === 'cyr'; }
  function T(k, o) { var s = (D[lang] && D[lang][k] != null) ? D[lang][k] : D.uz[k]; if (typeof s === 'string' && o) s = s.replace(/\{(\w+)\}/g, function (m, x) { return o[x] != null ? o[x] : m; }); return s; }
  var kit = RzKit.create({ root: root, K: Dt, t: function (k) { return T(k); }, lang: langNow, isCyr: isCyr });
  reduce = kit.reduce;
  var esc = kit.esc, fmt = kit.fmt, digits = kit.digits, ico = kit.ico, toast = kit.toast, shHead = kit.shHead, flashEl = kit.flashEl, vib = kit.vib, wait = kit.wait;
  function $(s, r) { return (r || root).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || root).querySelectorAll(s)); }
  function nowTs() { return Math.floor(Date.now() / 1000); }
  function todayStr() { return Dt.today(); }
  function prefs() { return st.prefs || (st.prefs = {}); }
  function dec(n, d) { var s = (Math.round(n * Math.pow(10, d || 1)) / Math.pow(10, d || 1)).toString().replace('.', ','); return s; }
  function num(v) { return S.num(v); }
  function KG() { return lang === 'ru' ? 'кг' : 'kg'; }
  function ML() { return lang === 'ru' ? 'мл' : 'ml'; }
  function openSheet(kind, html, o) { kit.openSheet(kind, html, o || { noFocus: true }); }
  function setSheet(html) { var sh = $('#rzSheet'); sh.innerHTML = '<div class="rz-grab" aria-hidden="true"><i></i></div>' + html; kit.dpInit(); }
  function mealName(m) { return T('meal' + (m === 'd' ? 'd' : m)); }
  function nameOf(f) { return lang === 'ru' && f.r ? f.r : f.n; }
  function unitName(u) { return (D[lang].units && D[lang].units[u]) || D.uz.units[u] || u; }
  function qtyStr(q) { return dec(q, 2).replace(/,00$/, ''); }
  function unitLabel(f, u) { var g = S.unitGrams(f, u); return u === 'g100' ? '100 ' + unitName('g100') : '1 ' + unitName(u) + ' · ' + g + ' ' + T('gram'); }
  function portionText(e) { if (e.unit === 'g100') return fmt(e.g) + ' ' + T('gram'); if (e.unit) return qtyStr(e.qty) + ' ' + unitName(e.unit); return e.g ? fmt(e.g) + ' ' + T('gram') : ''; }

  /* ---------- baza (lazy) ---------- */
  var dbWaiters = [];
  function loadDb(cb) {
    if (dbState === 2) { cb && cb(); return; }
    if (cb) dbWaiters.push(cb);
    if (dbState === 1) return; dbState = 1;
    fetch('/data/ovqatlar.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { db = S.normFoods(j.foods); dbState = 2; var w = dbWaiters; dbWaiters = []; w.forEach(function (f) { f(); }); })
      .catch(function () { dbState = 0; var w = dbWaiters; dbWaiters = []; w.forEach(function (f) { f(true); }); });
  }
  function allFoods() { return (db || []).concat(st.customFoods || []); }
  function foodById(id) { var l = allFoods(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }

  /* ---------- saqlash ---------- */
  function load() {
    try { var raw = localStorage.getItem(LS); if (raw) { var s = S.migrate(JSON.parse(raw)); if (s) { if (!s.prefs) s.prefs = {}; return s; } } } catch (e) {}
    var s2 = S.emptyState(); s2.prefs = {}; return s2;
  }
  var persistAsked = false;
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) {}
    if (!persistAsked) { persistAsked = true; try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {} }
  }
  function commit() { save(); render(); }

  /* ---------- ikonkalar ---------- */
  kit.addIcons({
    today: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2', food: 'M7 3v8 M4 3v5a3 3 0 0 0 6 0V3 M7 11v10 M17 21V3c-2.2 1.5-3.5 4-3.5 7.5 0 2 1.2 3 3.5 3', steps: 'M8 4c-1.7 0-3 1.8-3 4.5S6 13 8 13s3-1.4 3-3.5S9.7 4 8 4z M7.5 16.5h.01 M16 9c-1.7 0-3 1.8-3 4.5S14 18 16 18s3-1.4 3-3.5S17.7 9 16 9z M15.5 21.5h.01',
    me: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 3.6-7 8-7s8 3 8 7', drop: 'M12 3s6 6.2 6 10.5A6 6 0 0 1 6 13.5C6 9.2 12 3 12 3z', heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z', search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-5-5',
    minus: 'M5 12h14', pen: 'M4 20h4L19 9l-4-4L4 16v4z M13 7l4 4', share: 'M12 3v12 M7 8l5-5 5 5 M5 14v6h14v-6', text: 'M5 6h14 M5 12h14 M5 18h9', shield: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z', rep: 'M4 4v6h6 M20 20v-6h-6 M5 15a8 8 0 0 0 14 3 M19 9A8 8 0 0 0 5 6',
    scale: 'M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M9 9a4 4 0 0 1 6 0 M12 12l1.5-2', phone: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M11 18h2', flame: 'M12 3c1 3 4 4.5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 2 1.5 1.5C12 8 11 6 12 3z'
  });
  function catIcon(c, big) { return '<span class="sl-ci' + (big ? ' big' : '') + '">' + ico(c) + '</span>'; }

  /* ---------- qobiq ---------- */
  function shell() {
    var tab = function (v, ic, k) { return '<button type="button" class="rz-tab" data-act="tab" data-v="' + v + '">' + ico(ic) + '<span class="l" data-k="' + k + '"></span><span class="s" data-k="' + k + '"></span></button>'; };
    root.innerHTML =
      '<div class="rz-top"><a class="rz-logo" href="./" data-cyr="skip">Kalki<span>.uz</span></a><div class="rz-title" id="rzTitle"></div>' +
      '<div class="rz-langwrap"><button type="button" class="rz-lang" id="rzLang" data-act="langmenu" aria-label="Til / Язык" data-cyr="skip">' + ico('lang', '', 2) + '<span id="rzLangTxt">UZ</span></button>' +
      '<div class="rz-langmenu" id="rzLangMenu" hidden data-cyr="skip"><button type="button" data-act="lang" data-l="uz">UZ</button><button type="button" data-act="lang" data-l="cyr">ЎЗ</button><button type="button" data-act="lang" data-l="ru">RU</button></div></div></div>' +
      '<main class="rz-main" id="rzMain" tabindex="-1"></main>' +
      '<nav class="rz-nav" aria-label="' + esc(T('appName')) + '">' + tab('today', 'today', 'navToday') + tab('food', 'food', 'navFood') + '<span class="rz-fabslot"></span>' + tab('steps', 'steps', 'navSteps') + tab('me', 'me', 'navMe') +
      '<button type="button" class="rz-fab" id="rzFab" data-act="add" aria-label="' + esc(T('add')) + '">' + ico('plus', '', 2.6) + '</button></nav>' +
      kit.shellHtml() + '<div class="rz-onb" id="rzOnb" hidden></div>';
  }

  /* ---------- umumiy bo'laklar ---------- */
  function planNow() { return S.plan(st.profile); }
  function entryRow(e, date) {
    var f = e.fid ? foodById(e.fid) : null, name = f ? nameOf(f) : (e.name || '?'), isNew = seenFood && !seenFood[e.id];
    return '<button type="button" class="sl-row' + (isNew ? ' rz-new' : '') + '" data-act="editfood" data-d="' + date + '" data-id="' + e.id + '"><span class="m"><span class="nm">' + esc(name) + '</span><span class="tm">' + esc(portionText(e)) + (e.est ? ' · ' + esc(T('aEst')) : '') + '</span></span><span class="am">' + (e.est ? '≈ ' : '') + fmt(e.kcal) + '<small> ' + T('kcal') + '</small></span></button>';
  }
  function mealsHtml(date) {
    var x = S.dayOf(st, date) || { food: [] }, h = '';
    S.MEALS.forEach(function (m) {
      var list = x.food.filter(function (e) { return e.meal === m; }), sum = S.sumEntries(list).kcal;
      h += '<section class="rz-card sl-meal"><div class="sl-mh"><b>' + esc(mealName(m)) + '</b><span>' + (list.length ? fmt(sum) + ' ' + T('kcal') : '') + '</span><button type="button" class="sl-plus" data-act="addto" data-m="' + m + '" data-d="' + date + '" aria-label="' + esc(T('add') + ': ' + mealName(m)) + '">' + ico('plus', '', 2.4) + '</button></div>' +
        (list.length ? list.map(function (e) { return entryRow(e, date); }).join('') : '<div class="rz-mut">' + esc(T('emptyMeal')) + '</div>') + '</section>';
    });
    return h;
  }
  function markSeen() { seenFood = {}; Object.keys(st.days).forEach(function (d) { st.days[d].food.forEach(function (e) { seenFood[e.id] = 1; }); }); }
  var C = 2 * Math.PI * 86;
  function ringHtml(id, ratio0) { return '<svg class="sl-ring" viewBox="0 0 200 200" aria-hidden="true"><circle class="tr" cx="100" cy="100" r="86"/><circle class="pg" id="' + id + '" cx="100" cy="100" r="86" transform="rotate(-90 100 100)" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - ratio0)).toFixed(1) + '"/></svg>'; }
  function animRing(id, ratio) { var el = $('#' + id); if (!el) return; requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.strokeDashoffset = (C * (1 - ratio)).toFixed(1); }); }); }
  function glassSvg() { return '<svg viewBox="0 0 24 28" aria-hidden="true"><path class="fill" d="M5.6 9h12.8l-1.3 14.6a1.6 1.6 0 0 1-1.6 1.4H8.5a1.6 1.6 0 0 1-1.6-1.4L5.6 9z"/><path class="ln" d="M4 4h16l-1.8 19.6A2.6 2.6 0 0 1 15.600 26H8.400a2.6 2.6 0 0 1-2.600-2.400L4 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'; }

  function nudges() {
    var out = [], p = prefs(), now = Date.now(), hid = function (k) { return p['h_' + k] && now - p['h_' + k] < 7 * DAY_MS; }, pwa = window.KalkiPwa;
    if (pwa && !pwa.installed && !hid('install')) {
      if (pwa.canPrompt && pwa.canPrompt()) out.push({ k: 'install', msg: T('nudgeInstall'), btn: T('nudgeInstallBtn'), act: 'install' });
      else if (pwa.ios) out.push({ k: 'install', msg: T('nudgeIos') });
    }
    var lb = st.lastBackup || st.created || 0, has = Object.keys(st.days).length > 0;
    if (st.setup && has && now - lb > 7 * DAY_MS && !hid('backup')) out.push({ k: 'backup', msg: T('nudgeBackup'), btn: T('nudgeBackupBtn'), act: 'export' });
    return out;
  }
  function weekCard() {                              // dushanba: o'tgan hafta xulosasi (faqat faktlar)
    var t = todayStr(), p = prefs(); if (S.weekdayIdx(t) !== 0 || p.weekShown === t || p.weekHide === t) return '';
    var w = S.weekSummary(st, Dt.addDays(t, -1)); if (w.empty) return '';
    var rows = [];
    if (w.loggedDays) rows.push(T('wkAvgK', { x: fmt(w.avgKcal) }) + ' · ' + T('wkDays', { n: w.loggedDays }));
    if (w.avgSteps != null) rows.push(T('wkAvgS', { x: fmt(w.avgSteps) }));
    if (w.weightFrom != null && w.weightTo != null) rows.push(T('wkW', { a: dec(w.weightFrom, 1), b: dec(w.weightTo, 1) }));
    return '<section class="rz-card good sl-week"><span class="ic">' + ico('rep') + '</span><div class="m"><b>' + esc(T('wkT')) + '</b>' + rows.map(function (r) { return '<span>' + esc(r) + '</span>'; }).join('') + '</div><button type="button" class="rz-x" data-act="hideweek" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></section>';
  }

  /* ---------- BUGUN ---------- */
  function renderToday() {
    var t = todayStr(), pr = st.profile, pl = planNow(), x = S.dayOf(st, t) || { food: [], water: 0, steps: 0 }, tot = S.sumEntries(x.food), h0 = num(pr.height), w0 = S.currentWeight(st);
    var bal = S.dayBalance(pl.target, tot.kcal, x.steps, h0, w0), ratio = Math.min(1, tot.kcal / pl.target), over = bal.remaining < 0, prev = heroPrev;
    var stp = S.stepsStats(st, x.steps), glasses = pl.water.glasses, wl = Math.min(glasses, x.water);
    var h = weekCard();
    h += '<section class="rz-card sl-hero' + (over ? ' over' : '') + '"><button type="button" class="sl-ringbtn" id="ringBtn" data-act="xkcal" aria-label="' + esc(T('hHow') + ' ' + fmt(tot.kcal) + ' ' + T('ringOf', { t: fmt(pl.target) })) + '">' + ringHtml('ringPg', prev ? prev.ratio : 0) +
      '<span class="sl-rc"><b id="kNum">' + fmt(prev ? prev.eaten : tot.kcal) + '</b><small>' + T('kcal') + '</small><em>' + esc(T('ringOf', { t: fmt(pl.target) })) + '</em></span><span class="rz-qb" aria-hidden="true">?</span></button>' +
      '<div class="sl-rem"><span>' + esc(T(over ? 'overLbl' : 'remLbl')) + '</span><b>' + fmt(Math.abs(bal.remaining)) + '<small> ' + T('kcal') + '</small></b>' + (bal.credit > 0 ? '<em>' + esc(T('stepPlus', { c: fmt(bal.credit) })) + '</em>' : '') + '</div></section>';
    h += '<section class="rz-card sl-macros">' + [['mP', 'p', pl.macros.p], ['mF', 'f', pl.macros.f], ['mC', 'c', pl.macros.c]].map(function (m) { var v = Math.round(tot[m[1]]), r = Math.min(1, v / Math.max(1, m[2])); return '<button type="button" class="sl-mac" data-act="xmacro"><span class="l">' + esc(T(m[0])) + '</span><div class="rz-bar thin" aria-hidden="true"><i style="transform:scaleX(' + r + ')"></i></div><span class="v">' + v + ' / ' + m[2] + ' ' + T('gram') + '</span></button>'; }).join('') + '</section>';
    h += '<section class="rz-card sl-water" id="wCard"><div class="sl-wh"><b>' + ico('drop') + esc(T('wT')) + '</b><button type="button" class="sl-wv" data-act="xwater" id="wTxt">' + esc(T('wOf', { n: wl, m: glasses })) + ' · ' + fmt(x.water * S.GLASS_ML) + ' ' + ML() + '</button></div><div class="sl-glasses" role="group" aria-label="' + esc(T('wT')) + '">';
    for (var i = 0; i < glasses; i++) h += '<button type="button" class="sl-glass' + (i < wl && prev ? ' on' : '') + '" data-act="glass" data-i="' + i + '" data-d="' + (i < wl ? 1 : 0) + '" aria-pressed="' + (i < wl) + '" aria-label="' + (i + 1) + '">' + glassSvg() + '</button>';
    h += '</div><p class="rz-mut sm">' + esc(T('wHint')) + '</p></section>';
    var gr = x.steps / st.stepGoal;
    h += '<section class="rz-card sl-stepcard"><button type="button" class="sl-sn" data-act="xsteps"><span class="l">' + ico('steps') + esc(T('sT')) + '</span><b id="sNum">' + fmt(x.steps) + '</b><span class="u">' + (x.steps ? esc(stp.km.toString().replace('.', ',') + ' ' + T('km') + ' · ' + fmt(stp.kcal) + ' ' + T('kcal')) : esc(T('sNone'))) + '</span></button><div class="rz-bar thin" aria-hidden="true"><i style="transform:scaleX(' + Math.min(1, gr) + ')"></i></div><button type="button" class="rz-btn sm" data-act="addsteps">' + esc(T('sAdd')) + '</button></section>';
    nudges().forEach(function (n) { h += '<div class="rz-card nudge" data-nudge="' + n.k + '"><div class="t">' + esc(n.msg) + '</div><div class="b">' + (n.btn ? '<button type="button" class="rz-btn sm" data-act="' + n.act + '">' + esc(n.btn) + '</button>' : '') + '<button type="button" class="rz-btn sm ghost" data-act="hide" data-k="' + n.k + '">' + esc(T('later')) + '</button></div></div>'; });
    h += mealsHtml(t) + '<p class="rz-priv">' + esc(T('disc')) + '</p>';
    $('#rzMain').innerHTML = h; markSeen();
    var num0 = $('#kNum'); if (prev && prev.eaten !== tot.kcal) kit.setNum(num0, prev.eaten, tot.kcal);
    animRing('ringPg', ratio);
    $$('.sl-glass.on').length || $$('.sl-glass').forEach(function (g, i) { if (i < wl) setTimeout(function () { g.classList.add('on'); }, reduce ? 0 : 60 + i * 45); });
    heroPrev = { eaten: tot.kcal, ratio: ratio };
  }

  /* ---------- OVQAT ---------- */
  function renderFood() {
    var t = todayStr(), d = foodDay || t, x = S.dayOf(st, d), tot = S.sumEntries(x ? x.food : []), pl = planNow();
    var lab = d === t ? T('today') : (d === Dt.addDays(t, -1) ? T('yesterday') : kit.dLabel(d));
    var h = '<h2 class="rz-h">' + esc(T('fT')) + '</h2><section class="rz-card"><div class="rz-monthnav"><button type="button" data-act="dprev" aria-label="‹">' + ico('back') + '</button><b>' + esc(lab) + '</b><button type="button" data-act="dnext" aria-label="›"' + (d >= t ? ' disabled' : '') + '>' + ico('chev') + '</button></div><div class="sl-daysum"><b>' + fmt(tot.kcal) + '</b><small> / ' + fmt(pl.target) + ' ' + T('kcal') + '</small></div></section>';
    h += '<button type="button" class="sl-wide" data-act="addtext" data-d="' + d + '">' + ico('text') + '<span>' + esc(T('fAddText')) + '</span>' + ico('chev', 'r') + '</button>';
    h += mealsHtml(d);
    var favs = st.favs.map(foodById).filter(Boolean);
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('fFavs')) + '</div>' + (favs.length ? favs.slice(0, 8).map(function (f) { return '<button type="button" class="sl-row" data-act="pickfav" data-id="' + esc(f.id) + '" data-d="' + d + '"><span class="m"><span class="nm">' + esc(nameOf(f)) + '</span><span class="tm">' + esc(T('per100', { k: f.k })) + '</span></span>' + ico('heart', 'fv') + '</button>'; }).join('') : '<div class="rz-mut">' + esc(T('fNoFavs')) + '</div>') + '</section>';
    $('#rzMain').innerHTML = h; markSeen();
    if (dbState === 0 && st.favs.length) loadDb(function () { if (view === 'food') render(); });
  }

  /* ---------- QADAM ---------- */
  function renderSteps() {
    var t = todayStr(), x = S.dayOf(st, t) || { steps: 0 }, stp = S.stepsStats(st, x.steps), ser = S.stepsSeries(st, t, 7), tot = S.stepsTotal(st, ser), mx = Math.max(st.stepGoal, Math.max.apply(null, ser.map(function (s) { return s.steps; })), 1), cmp = S.compareKm(tot.km), mon = S.monthSteps(st, Dt.monthOf(t));
    var h = '<h2 class="rz-h">' + esc(T('stT')) + '</h2><section class="rz-card sl-stepbig"><button type="button" class="sl-sn" data-act="xsteps"><span class="l">' + ico('steps') + esc(T('stepsT')) + '</span><b id="sNum">' + fmt(x.steps) + '</b><span class="u">' + (x.steps ? esc(stp.km.toString().replace('.', ',') + ' ' + T('km') + ' · ' + fmt(stp.kcal) + ' ' + T('kcal')) : esc(T('sNone'))) + '</span></button><div class="rz-bar thin" aria-hidden="true"><i style="transform:scaleX(' + Math.min(1, x.steps / st.stepGoal) + ')"></i></div><div class="rz-mut sm">' + esc(T('stGoal', { x: fmt(st.stepGoal) })) + '</div><button type="button" class="rz-btn primary full" data-act="addsteps">' + esc(T('sAdd')) + '</button><button type="button" class="rz-link" data-act="stephelp">' + esc(T('stWhere')) + '</button></section>';
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('stWeek')) + '</div><div class="sl-chart" style="--g:' + (st.stepGoal / mx).toFixed(3) + '" role="img" aria-label="' + esc(T('stWeek')) + '">' + ser.map(function (s) { var wd = S.weekdayIdx(s.d), nm = D[lang] && (lang === 'ru' ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] : ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'])[wd]; return '<button type="button" class="b' + (s.d === t ? ' td' : '') + '" data-act="editsteps" data-d="' + s.d + '" aria-label="' + esc(kit.dLabel(s.d) + ': ' + fmt(s.steps)) + '"><span class="v">' + (s.steps ? fmt(s.steps) : '') + '</span><span class="col"><i style="transform:scaleY(' + (s.steps / mx) + ')"></i></span><span class="d">' + esc(nm) + '</span></button>'; }).join('') + '</div>' +
      '<div class="sl-wtot"><b>' + esc(tot.km.toString().replace('.', ',') + ' ' + T('km')) + '</b><span>' + fmt(tot.steps) + ' · ' + fmt(tot.kcal) + ' ' + T('kcal') + '</span></div>' +
      (tot.km > 0 ? '<p class="rz-p">' + ico('flame', 'sl-inl') + esc(cmp.full ? T('stCmpFull', { route: lang === 'ru' ? cmp.ru : cmp.uz, km: cmp.km }) : T('stCmp', { km: tot.km.toString().replace('.', ','), route: lang === 'ru' ? cmp.ru : cmp.uz, pct: cmp.share })) + '</p>' : '') + '</section>';
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('stMonth')) + '</div><div class="sl-wtot"><b>' + fmt(mon.steps) + '</b><span>' + esc(mon.km.toString().replace('.', ',') + ' ' + T('km') + ' · ' + fmt(mon.kcal) + ' ' + T('kcal')) + '</span></div><button type="button" class="rz-row" data-act="stepgoal"><span class="m"><b>' + esc(T('stGoalSet')) + '</b></span><span class="v">' + fmt(st.stepGoal) + '</span></button><p class="rz-priv">' + esc(T('stNoRank')) + '</p></section>';
    $('#rzMain').innerHTML = h;
    $$('.sl-chart .col i').forEach(function (e, i) { var f = e.style.transform; e.style.transform = 'scaleY(0)'; setTimeout(function () { e.style.transform = f; }, reduce ? 0 : 60 + i * 50); });
  }

  /* ---------- MEN ---------- */
  function weightChart() {
    var ser = S.weightSeries(st.weights).slice(-30); if (ser.length < 2) return '';
    var W = 320, H = 130, pd = 14, kg = ser.map(function (s) { return s.kg; }).concat(ser.map(function (s) { return s.avg; })), mn = Math.min.apply(null, kg) - 0.5, mxv = Math.max.apply(null, kg) + 0.5;
    var X = function (i) { return pd + (W - 2 * pd) * i / (ser.length - 1); }, Y = function (v) { return H - pd - (H - 2 * pd) * (v - mn) / (mxv - mn); };
    var line = ser.map(function (s, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(s.avg).toFixed(1); }).join(' ');
    return '<svg class="sl-wchart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(T('meW')) + '">' + ser.map(function (s, i) { return '<circle class="dot" cx="' + X(i).toFixed(1) + '" cy="' + Y(s.kg).toFixed(1) + '" r="3.2"/>'; }).join('') + '<path class="avg" d="' + line + '" pathLength="1"/></svg>';
  }
  function renderMe() {
    var pr = st.profile, pl = planNow(), cur = S.currentWeight(st), a7 = S.avg7(st.weights, todayStr()), gp = S.goalProgress(st), big = document.documentElement.classList.contains('fs-big'), curL = isCyr() ? 'cyr' : lang;
    var row = function (act, ic, t1, t2) { return '<button type="button" class="rz-row" data-act="' + act + '">' + catIcon(ic) + '<span class="m"><b>' + esc(t1) + '</b>' + (t2 ? '<span>' + esc(t2) + '</span>' : '') + '</span>' + ico('chev', 'r') + '</button>'; };
    var first = st.weights.length ? st.weights[0].kg : cur;
    var h = '<h2 class="rz-h">' + esc(T('meT')) + '</h2><section class="rz-card sl-prof"><div class="sl-pg"><div><small>' + esc(T('pfSex')) + '</small><b>' + esc(T(pr.sex === 'f' ? 'female' : 'male')) + '</b></div><div><small>' + esc(T('pfAge')) + '</small><b>' + pr.age + '</b></div><div><small>' + esc(T('pfH')) + '</small><b>' + pr.height + '</b></div><div><small>' + esc(T('pfW')) + '</small><b>' + dec(num(pr.weight), 1) + '</b></div></div>' +
      '<div class="sl-pt"><span>' + esc(T('rT')) + '</span><b>' + fmt(pl.target) + ' ' + T('kcal') + '</b></div><button type="button" class="rz-btn ghost full" data-act="editprof">' + ico('pen') + ' ' + esc(T('meEdit')) + '</button></section>';
    h += '<section class="rz-card sl-weight"><div class="sl-wh"><b>' + ico('scale') + esc(T('meW')) + '</b><button type="button" class="sl-wv" data-act="xweight">?</button></div>' + (st.weights.length ? '<div class="sl-wbig"><b>' + dec(cur, 1) + '</b><small> ' + KG() + '</small></div><div class="rz-mut">' + (a7 != null ? esc(T('meAvg', { x: dec(a7, 1) })) : '') + '</div>' : '<div class="rz-mut">' + esc(T('meNoW')) + '</div>') + weightChart() +
      (gp ? '<div class="sl-gp"><div class="rz-bar thin" aria-hidden="true"><i style="transform:scaleX(' + gp.share + ')"></i></div><span>' + esc(gp.left > 0 ? T('meProg', { x: dec(gp.left, 1) }) : '✓') + '</span></div>' : '') +
      (st.weights.length > 1 ? '<div class="rz-mut sm">' + esc(T('meDelta', { x: (cur - first > 0 ? '+' : '') + dec(cur - first, 1) })) + '</div>' : '') + '<button type="button" class="rz-btn primary full" data-act="addweight">' + esc(T('meAddW')) + '</button></section>';
    h += '<section class="rz-card">' + row('share', 'share', T('meShare'), T('shH')) + '</section>';
    h += '<section class="rz-card">' + row('export', 'text', T('sExp'), '') + row('import', 'boshqa', T('sImp'), '') + row('wipe', 'x', T('sDel'), '') + '</section>' +
      '<section class="rz-card"><div class="rz-st">' + esc(T('sLang')) + '</div><div class="rz-seg" data-cyr="skip"><button type="button" data-act="lang" data-l="uz"' + (curL === 'uz' ? ' class="on"' : '') + '>UZ</button><button type="button" data-act="lang" data-l="cyr"' + (curL === 'cyr' ? ' class="on"' : '') + '>ЎЗ</button><button type="button" data-act="lang" data-l="ru"' + (curL === 'ru' ? ' class="on"' : '') + '>RU</button></div>' +
      '<div class="rz-st" style="margin-top:14px">' + esc(T('sFont')) + '</div><div class="rz-seg"><button type="button" data-act="font" data-f="n"' + (!big ? ' class="on"' : '') + '>' + esc(T('fN')) + '</button><button type="button" data-act="font" data-f="b"' + (big ? ' class="on"' : '') + '>' + esc(T('fB')) + '</button></div></section>' +
      '<section class="rz-card">' + row('tips', 'help', T('sTips'), '') + '<span class="rz-aboutrow">' + row('about', 'info', T('sAbout'), '') + '</span></section><p class="rz-priv">' + esc(T('priv')) + ' ' + esc(T('med')) + '</p>';
    $('#rzMain').innerHTML = h;
    var p = $('.sl-wchart .avg'); if (p && !reduce) { p.style.strokeDashoffset = '1'; requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.strokeDashoffset = '0'; }); }); }
  }

  function render() {
    lang = langNow();
    $$('[data-k]').forEach(function (e) { e.textContent = T(e.getAttribute('data-k')); });
    var lt0 = isCyr() ? 'ЎЗ' : lang.toUpperCase(), lb0 = $('#rzLang'); if (lb0) lb0.setAttribute('aria-label', lt0 + ' · Til / Язык');
    var ab = document.getElementById('rzAboutBack'); if (ab) ab.textContent = T('aboutBack');
    var lockUi = function (on) { ['#rzMain', '.rz-nav'].forEach(function (q) { var e = $(q); if (e) { e.inert = on; if (on) e.setAttribute('aria-hidden', 'true'); else e.removeAttribute('aria-hidden'); } }); };
    if (!st.setup) { lockUi(true); showOnb(); return; }
    lockUi(false);
    var onb = $('#rzOnb'); if (onb && !onb.classList.contains('out')) onb.hidden = true;
    $$('.rz-tab').forEach(function (b) { var on = b.getAttribute('data-v') === view; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
    var title = { today: T('appName'), food: T('fT'), steps: T('stT'), me: T('meT') }[view]; $('#rzTitle').textContent = title;
    var lt = $('#rzLangTxt'); if (lt) lt.textContent = isCyr() ? 'ЎЗ' : lang.toUpperCase();
    $('#rzFab').setAttribute('aria-label', T('add'));
    var main = $('#rzMain'), sc = main.scrollTop;
    ({ today: renderToday, food: renderFood, steps: renderSteps, me: renderMe })[view]();
    main.classList.toggle('enter', enterNext); enterNext = false; main.scrollTop = sc;
    if (view === 'today' && !prefs().tipsDone && !kit.tipsOn() && !kit.sheetKind()) setTimeout(function () { if (!kit.tipsOn() && st.setup && view === 'today' && !prefs().tipsDone && !kit.sheetKind() && !$('#rzOnb').classList.contains('out')) tipsStart(); }, 500);
  }

  /* ---------- tushuntirish panellari ---------- */
  function xr(sg, label, val, cls, unit) { return '<div class="rz-xr ' + (cls || '') + '"><span class="sg" aria-hidden="true">' + sg + '</span><span class="lb">' + esc(label) + '</span>' + (val == null ? '' : '<b>' + val + (unit === false ? '' : '<small> ' + T('kcal') + '</small>') + '</b>') + '</div>'; }
  function okBtn() { return '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="sheetclose">' + esc(T('close')) + '</button></div>'; }
  function openExplainKcal() {
    var t = todayStr(), pl = planNow(), x = S.dayOf(st, t) || { food: [], steps: 0 }, tot = S.sumEntries(x.food), b = S.dayBalance(pl.target, tot.kcal, x.steps, num(st.profile.height), S.currentWeight(st));
    var h = shHead(T('xKcalT')) + '<div class="rz-xrows">' + xr('', T('xTarget'), fmt(pl.target)) + xr('−', T('xEaten'), fmt(tot.kcal)) + xr('+', T('xSteps'), fmt(b.credit)) + xr('=', T('xRem'), fmt(b.remaining), 'sum big') + '</div><p class="rz-p sm">' + esc(T('xWhy50')) + '</p>';
    h += '<div class="rz-st" style="margin-top:6px">' + esc(T('xHowT')) + '</div><div class="rz-xrows">' + xr('', T('xBmr') + ' · ' + T('xBmrN'), fmt(pl.bmr)) + xr('×', T('xAct'), dec(pl.actK, 3), '', false) + xr('=', T('xTdee'), fmt(pl.tdee), 'sum');
    if (pl.delta) h += xr(pl.delta < 0 ? '−' : '+', T('xGoal') + ' (' + dec(Math.abs(pl.kgPerWeek), 2) + ' ' + KG() + '/' + (lang === 'ru' ? 'нед.' : 'hafta') + ')', fmt(Math.abs(pl.delta)));
    if (pl.floorApplied) h += xr('', T('xFloor'), fmt(pl.floorMin));
    h += xr('=', T('xTargetR'), fmt(pl.target), 'sum big') + '</div><p class="rz-p sm">' + esc(T('disc')) + '</p>' + okBtn();
    openSheet('xkcal', h);
  }
  function openExplainMacro() {
    var pl = planNow(), m = pl.macros, w = S.currentWeight(st);
    openSheet('xmacro', shHead(T('xMacroT')) + '<div class="rz-xrows">' + xr('', T('xProt', { pk: dec(m.pPerKg, 1), w: dec(w, 1), p: m.p }), null) + xr('', T('xFat', { f: m.f }), null) + xr('', T('xCarb', { c: m.c }), null) + '</div><p class="rz-p sm">' + esc(T('xMacroN')) + '</p><p class="rz-p sm">' + esc(T('rMacro', { p: m.p, f: m.f, c: m.c })) + '</p>' + okBtn());
  }
  function openExplainWater() { var pl = planNow(); openSheet('xwater', shHead(T('xWaterT')) + '<div class="rz-xrows">' + xr('', T('xWater', { w: dec(S.currentWeight(st), 1), ml: fmt(pl.water.ml), n: pl.water.glasses }), null) + '</div><p class="rz-p sm">' + esc(T('xWaterN')) + '</p>' + okBtn()); }
  function openExplainSteps() {
    var t = todayStr(), x = S.dayOf(st, t) || { steps: 0 }, h0 = num(st.profile.height), w = S.currentWeight(st), s = x.steps || 10000, km = S.distanceKm(s, h0), sc = Math.round(S.strideM(h0) * 1000) / 10;
    openSheet('xsteps', shHead(T('xStepT')) + '<div class="rz-xrows">' + xr('', T('xStride', { s: dec(sc, 1) }), null) + xr('', T('xDist', { n: fmt(s), s: dec(sc, 1), km: dec(km, 2) }), null) + xr('', T('xKc', { w: dec(w, 1), km: dec(km, 2), k: S.stepKcal(s, h0, w) }), null) + '</div><p class="rz-p sm">' + esc(T('xKcN')) + '</p><p class="rz-p sm">' + esc(T('xWhy50')) + '</p>' + okBtn());
  }
  function openExplainWeight() { openSheet('xweight', shHead(T('xWeightT')) + '<p class="rz-p">' + esc(T('xWeightN')) + '</p>' + okBtn()); }
  function openStepHelp() {
    var blk = function (k) { return '<div class="sl-help">' + ico('phone') + '<span>' + esc(T(k)) + '</span></div>'; };
    openSheet('help', shHead(T('hT')) + blk('hIos') + blk('hSam') + blk('hGoo') + '<p class="rz-p sm">' + esc(T('hNote')) + '</p>' + okBtn());
  }

  /* ---------- ovqat qo'shish (qidiruv → porsiya → saqlash) ---------- */
  var fd = null, CATS = ['o', 'n', 's', 'm', 'g', 'v', 'f', 'd', 'i', 'q', 'h', 'x'];
  function openAdd(o) {
    o = o || {}; fd = { date: o.date || todayStr(), meal: o.meal || S.mealByHour(new Date().getHours()), mode: 'search', q: '', cat: '', food: null, unit: null, qty: 1, editId: null, items: [], busy: false };
    openSheet('add', searchHtml()); loadDb(function (err) { if (fd && fd.mode === 'search') refreshRes(err); });
    if (o.food) pickFood(o.food);
  }
  function searchHtml() {
    return shHead(T('aT')) + '<div class="sl-search">' + ico('search') + '<input id="fdQ" type="text" inputmode="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(T('aPh')) + '" value="' + esc(fd.q) + '" aria-label="' + esc(T('aT')) + '"></div>' +
      '<div class="sl-cats" role="group">' + [''].concat(CATS).map(function (c) { return '<button type="button" class="rz-chip' + (fd.cat === c ? ' on' : '') + '" data-act="fcat" data-c="' + c + '">' + esc(c ? T('cat_' + c) : T('all')) + '</button>'; }).join('') + '</div>' +
      '<div class="sl-res" id="fdRes">' + resultsHtml() + '</div><div class="sl-foot"><button type="button" class="rz-btn ghost sm" data-act="ftext">' + ico('text') + ' ' + esc(T('aText')) + '</button><button type="button" class="rz-btn ghost sm" data-act="fcustom">' + ico('plus') + ' ' + esc(T('aCustom')) + '</button></div>';
  }
  function resRow(f) { return '<button type="button" class="sl-rr" data-act="pickfood" data-id="' + esc(f.id) + '"><span class="m"><span class="nm">' + esc(nameOf(f)) + (st.favs.indexOf(f.id) > -1 ? ' ' + ico('heart', 'fv') : '') + '</span><span class="tm">' + esc(T('per100', { k: f.k })) + (f.e ? ' · ' + esc(T('aEst')) : '') + '</span></span>' + ico('chev', 'r') + '</button>'; }
  function resultsHtml() {
    if (dbState !== 2) return '<div class="rz-mut">' + esc(T('aLoading')) + '</div>';
    var foods = allFoods(), q = fd.q.trim(), list, h = '';
    if (q) { list = S.search(foods, q, { recents: st.recents, favs: st.favs, limit: 40 }); if (fd.cat) list = list.filter(function (f) { return f.t === fd.cat; }); }
    else if (fd.cat) list = foods.filter(function (f) { return f.t === fd.cat; }).slice(0, 60);
    else {
      var rec = st.recents.map(foodById).filter(Boolean), fav = st.favs.map(foodById).filter(Boolean), pop = foods.filter(function (f) { return f.t === 'o'; }).slice(0, 10);
      var sec = function (k, l) { return l.length ? '<div class="rz-st">' + esc(T(k)) + '</div>' + l.map(resRow).join('') : ''; };
      return sec('aFav', fav.slice(0, 5)) + sec('aRec', rec.slice(0, 6)) + sec('aPop', pop);
    }
    if (!list.length) return '<div class="rz-empty"><b>' + esc(T('aNone')) + '</b><span>' + esc(T('aNoneH')) + '</span></div>';
    return list.map(resRow).join('');
  }
  function refreshRes(err) { var r = $('#fdRes'); if (r) r.innerHTML = err ? '<div class="rz-mut">' + esc(T('aNone')) + '</div>' : resultsHtml(); }
  function mealChips(sel, act) { return '<div class="rz-chips" role="group" aria-label="' + esc(T('pMeal')) + '">' + S.MEALS.map(function (m) { return '<button type="button" class="rz-chip' + (sel === m ? ' on' : '') + '" data-act="' + act + '" data-m="' + m + '" aria-pressed="' + (sel === m) + '">' + esc(mealName(m)) + '</button>'; }).join('') + '</div>'; }
  function curGrams() { var f = fd.food; return fd.unit === 'g100' ? fd.qty : S.unitGrams(f, fd.unit) * fd.qty; }
  function pickFood(id) {
    var f = foodById(id); if (!f) { loadDb(function () { pickFood(id); }); return; }
    fd.food = f; fd.mode = 'portion'; fd.unit = f.u[0][0]; fd.qty = fd.unit === 'g100' ? 100 : 1; fd.editId = null; setSheet(portionHtml());
  }
  function portionHtml() {
    var f = fd.food, pt = S.portion(f, curGrams()), fav = st.favs.indexOf(f.id) > -1;
    return '<div class="rz-sh-h sl-ph"><button type="button" class="rz-x" data-act="fback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button><b>' + esc(nameOf(f)) + '</b><button type="button" class="rz-x' + (fav ? ' fav' : '') + '" data-act="ffav" aria-label="' + esc(T('aFav')) + '" aria-pressed="' + fav + '">' + ico('heart') + '</button></div>' +
      '<div class="sl-kc" aria-live="polite"><b id="fdKcal">' + fmt(pt.kcal) + '</b><small> ' + T('kcal') + '</small></div><div class="sl-mc" id="fdMac">' + esc(T('pMacro', { p: dec(pt.p, 0), f: dec(pt.f, 0), c: dec(pt.c, 0) })) + '</div>' +
      '<div class="rz-fl">' + esc(T('pUnit')) + '</div><div class="rz-chips">' + f.u.map(function (u) { return '<button type="button" class="rz-chip' + (fd.unit === u[0] ? ' on' : '') + '" data-act="funit" data-u="' + u[0] + '" aria-pressed="' + (fd.unit === u[0]) + '">' + esc(unitLabel(f, u[0])) + '</button>'; }).join('') + '</div>' +
      '<div class="sl-qty"><button type="button" data-act="fqty" data-s="-1" aria-label="' + esc(T('qtyMinus')) + '">' + ico('minus', '', 2.4) + '</button><b id="fdQty">' + qtyStr(fd.qty) + (fd.unit === 'g100' ? ' ' + T('gram') : '') + '</b><button type="button" data-act="fqty" data-s="1" aria-label="' + esc(T('qtyPlus')) + '">' + ico('plus', '', 2.4) + '</button></div>' +
      '<div class="rz-fl">' + esc(T('pMeal')) + '</div>' + mealChips(fd.meal, 'fmeal') + (f.e ? '<p class="rz-p sm">' + esc(T('pEstNote')) + '</p>' : '') +
      '<div class="rz-actions">' + (fd.editId != null ? '<button type="button" class="rz-btn ghost danger" data-act="fdel">' + esc(T('del')) + '</button>' : '') + '<button type="button" class="rz-btn primary" id="fsave" data-act="fsave">' + esc(T('pSave')) + '</button></div>';
  }
  function portionUpdate() {
    var pt = S.portion(fd.food, curGrams()); kit.setNum($('#fdKcal'), num($('#fdKcal').textContent.replace(/\s/g, '')), pt.kcal, { dur: 200 });
    $('#fdMac').textContent = T('pMacro', { p: dec(pt.p, 0), f: dec(pt.f, 0), c: dec(pt.c, 0) });
    $('#fdQty').textContent = qtyStr(fd.qty) + (fd.unit === 'g100' ? ' ' + T('gram') : '');
  }
  function fSave() {
    var f = fd.food, g = curGrams(), pt = S.portion(f, g);
    if (fd.editId != null) {
      var x = S.dayOf(st, fd.date), e = x && x.food.filter(function (y) { return y.id === fd.editId; })[0];
      if (e) { e.meal = fd.meal; e.unit = fd.unit; e.qty = fd.qty; e.g = pt.g; e.kcal = pt.kcal; e.p = pt.p; e.f = pt.f; e.c = pt.c; }
      kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true); return;
    }
    var it = S.addFood(st, fd.date, { fid: f.id, name: f.custom ? f.n : null, meal: fd.meal, unit: fd.unit, qty: fd.qty, g: pt.g, kcal: pt.kcal, p: pt.p, f: pt.f, c: pt.c, est: !!f.e, ts: nowTs() });
    var date = fd.date; kit.closeSheet(); commit(); vib(); toast(T('saved'), function () { rowOut(it.id, function () { S.removeFood(st, date, it.id); commit(); }); }, true);
    afterWater();
  }
  function rowOut(id, cb) { var el = $('.sl-row[data-id="' + id + '"]'); if (el && !reduce) { el.classList.add('rz-gone'); setTimeout(cb, 230); } else cb(); }
  function openEdit(date, id) {
    var x = S.dayOf(st, date), e = x && x.food.filter(function (y) { return y.id === id; })[0]; if (!e) return;
    var f = e.fid ? foodById(e.fid) : null;
    fd = { date: date, meal: e.meal, mode: 'portion', q: '', cat: '', food: f, unit: e.unit, qty: e.qty, editId: id, items: [] };
    if (f && f.u.some(function (u) { return u[0] === e.unit; })) { openSheet('add', shHead(T('pEdit')) + '', { noFocus: true }); setSheet(portionHtml()); return; }
    fd.food = null;                                   // baza topilmadi / AI yozuvi: faqat bo'lim va o'chirish
    openSheet('add', shHead(T('pEdit')) + '<div class="sl-kc"><b>' + fmt(e.kcal) + '</b><small> ' + T('kcal') + '</small></div><p class="rz-p">' + esc(e.name || '') + (e.est ? ' · ' + esc(T('aEst')) : '') + '</p><div class="rz-fl">' + esc(T('pMeal')) + '</div>' + mealChips(e.meal, 'fmeal2') + '<div class="rz-actions"><button type="button" class="rz-btn ghost danger" data-act="fdel">' + esc(T('del')) + '</button><button type="button" class="rz-btn primary" data-act="sheetclose">' + esc(T('close')) + '</button></div>');
  }
  function fDelete() { var d = fd.date, id = fd.editId; kit.closeSheet(); rowOut(id, function () { var rm = S.removeFood(st, d, id); commit(); toast(T('del1'), function () { S.restoreFood(st, d, rm); commit(); }); }); }

  /* ---------- o'z taomim ---------- */
  function numFld(id, label, val, ph, mode) { return '<label class="rz-f" for="' + id + '"><span>' + esc(label) + '</span><input id="' + id + '" type="text" inputmode="' + (mode || 'decimal') + '" autocomplete="off" placeholder="' + esc(ph || '') + '" value="' + esc(val || '') + '"></label>'; }
  function openCustom(name) {
    fd.mode = 'custom';
    setSheet(shHead(T('cT')) + '<label class="rz-f" for="cuName"><span>' + esc(T('cName')) + '</span><input id="cuName" type="text" maxlength="60" value="' + esc(name || '') + '" placeholder="' + esc(T('cName')) + '"></label>' + numFld('cuK', T('cKcal'), '', '0', 'numeric') + numFld('cuG', T('cG'), '', '', 'numeric') + numFld('cuP', T('cP'), '', '') + numFld('cuF', T('cF'), '', '') + numFld('cuC', T('cC'), '', '') +
      '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="fback">' + esc(T('back')) + '</button><button type="button" class="rz-btn primary" data-act="cusave">' + esc(T('save')) + '</button></div>');
  }
  function cuSave() {
    var name = $('#cuName').value.trim(), k = num($('#cuK').value), g = num($('#cuG').value) || 100, m = 100 / g;
    if (!name) { flashEl($('#cuName')); return; } if (!(k > 0)) { flashEl($('#cuK')); return; }
    var f = S.addCustom(st, { name: name, k: k * m, p: num($('#cuP').value) * m, f: num($('#cuF').value) * m, c: num($('#cuC').value) * m, g: g }); if (!f) return; save();
    fd.food = f; fd.mode = 'portion'; fd.unit = f.u[0][0]; fd.qty = 1; setSheet(portionHtml());
  }

  /* ---------- matn bilan qo'shish (lokal + AI) ---------- */
  function openText(date, keep) {
    fd = keep && fd ? fd : { date: date || todayStr(), meal: S.mealByHour(new Date().getHours()), q: '', cat: '', items: [] };
    if (date) fd.date = date; if (!fd.date) fd.date = todayStr(); fd.mode = 'text'; fd.items = []; fd.missing = []; fd.busy = false; fd.txt = '';
    if (kit.sheetKind() === 'add') setSheet(textHtml()); else openSheet('add', textHtml()); loadDb();
  }
  function textHtml() {
    var offline = navigator.onLine === false, items = fd.items;
    var h = shHead(T('tT')) + '<input id="txQ" class="sl-ta" type="text" autocomplete="off" autocapitalize="off" enterkeyhint="done" placeholder="' + esc(T('tPh')) + '" aria-label="' + esc(T('tT')) + '" value="' + esc(fd.txt || '') + '"><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="fback">' + esc(T('back')) + '</button><button type="button" class="rz-btn primary" data-act="txgo">' + esc(T('tGo')) + '</button></div><div id="txOut">' + textOut() + '</div>';
    return h;
  }
  function textOut() {
    var items = fd.items, h = '', offline = navigator.onLine === false;
    if (fd.parsed && !items.length && !(fd.missing || []).length) h += '<div class="rz-mut">' + esc(T('tEmpty')) + '</div>';
    items.forEach(function (it, i) { h += '<div class="sl-ti"><span class="m"><span class="nm">' + esc(it.name) + '</span><span class="tm">' + esc(it.ptxt) + (it.ai ? ' · ' + esc(T('tAiTag')) : (it.est ? ' · ' + esc(T('aEst')) : '')) + '</span></span><b>' + ((it.ai || it.est) ? '≈ ' : '') + fmt(it.kcal) + '<small> ' + T('kcal') + '</small></b><button type="button" class="rz-x" data-act="txdel" data-i="' + i + '" aria-label="' + esc(T('del')) + '">' + ico('x') + '</button></div>'; });
    if ((fd.missing || []).length) {
      h += '<p class="rz-p warn">' + esc(T('tMiss', { x: fd.missing.join(', ') })) + '</p>';
      h += offline ? '<p class="rz-p sm">' + esc(T('tOffline')) + '</p>' : '<button type="button" class="rz-btn ghost full" data-act="txai"' + (fd.busy ? ' disabled' : '') + '>' + esc(fd.busy ? T('tAiBusy') : T('tAi')) + '</button><p class="rz-p sm">' + esc(T('tAiNote')) + '</p>';
    }
    if (fd.aiErr) h += '<p class="rz-p warn">' + esc(T('tAiErr')) + '</p>';
    if (items.length) h += '<div class="rz-fl">' + esc(T('pMeal')) + '</div>' + mealChips(fd.meal, 'fmeal3') + '<p class="rz-p sm">' + esc(T('tHelp')) + '</p><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="txsave">' + esc(T('tSave', { n: items.length })) + '</button></div>';
    return h;
  }
  function txRefresh() { var o = $('#txOut'); if (o) o.innerHTML = textOut(); }
  function txGo() {
    fd.txt = $('#txQ').value; var run = function () {
      var r = S.parseText(fd.txt, allFoods(), { recents: st.recents, favs: st.favs }); fd.parsed = true; fd.aiErr = false;
      fd.items = r.items.map(function (x) { var pt = S.portion(x.food, x.g); return { name: nameOf(x.food), fid: x.fid, unit: x.unit, qty: x.qty, g: pt.g, kcal: pt.kcal, p: pt.p, f: pt.f, c: pt.c, est: x.est, ai: false, ptxt: x.unit === 'g100' ? fmt(x.g) + ' ' + T('gram') : qtyStr(x.qty) + ' ' + unitName(x.unit) }; });
      fd.missing = r.missing; txRefresh();
    };
    if (dbState === 2) run(); else loadDb(function () { run(); });
  }
  function cid() { try { var c = localStorage.getItem(LS_CID); if (!c) { c = (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) { var r = Math.random() * 16 | 0; return (ch === 'x' ? r : (r & 3 | 8)).toString(16); })); localStorage.setItem(LS_CID, c); } return c; } catch (e) { return ''; } }
  function txAi() {
    if (fd.busy || !fd.missing.length) return; fd.busy = true; fd.aiErr = false; txRefresh();
    var body = { matn: fd.missing.join(', ').slice(0, 300), til: isCyr() ? 'kirill' : lang, mijoz_id: cid() };
    fetch('/api/salomat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); }).then(function (res) {
      fd.busy = false; if (!res.ok || !res.j || !res.j.ovqatlar) { fd.aiErr = true; txRefresh(); return; }
      res.j.ovqatlar.forEach(function (o) { fd.items.push({ name: o.nom, fid: null, unit: null, qty: 1, g: 0, kcal: Math.round(o.kcal), p: o.o, f: o.y, c: o.u, est: true, ai: true, ptxt: o.porsiya || '' }); });
      fd.missing = []; txRefresh();
    }).catch(function () { fd.busy = false; fd.aiErr = true; txRefresh(); });
  }
  function txSave() {
    var n = fd.items.length, date = fd.date, ids = [];
    fd.items.forEach(function (it) { var e = S.addFood(st, date, { fid: it.fid, name: it.fid ? null : it.name, meal: fd.meal, unit: it.unit, qty: it.qty, g: it.g, kcal: it.kcal, p: it.p, f: it.f, c: it.c, est: it.est, ts: nowTs() }); ids.push(e.id); if (it.ai) e.name = it.name + (it.ptxt ? ' (' + it.ptxt + ')' : ''); });
    kit.closeSheet(); commit(); vib(); toast(T('saved') + ': ' + n, function () { ids.forEach(function (id) { S.removeFood(st, date, id); }); commit(); }, true);
  }

  /* ---------- qadam ---------- */
  var sp = null;
  function openSteps(date, goal) {
    date = date || todayStr(); var cur = goal ? st.stepGoal : (S.dayOf(st, date) || { steps: 0 }).steps;
    sp = { date: date, val: '', goal: !!goal, cur: cur };
    openSheet('steps', shHead(goal ? T('stGoalSet') : (date === todayStr() ? T('stepsT') : T('stepsOf', { d: kit.dLabel(date) }))) + '<p class="rz-p sm">' + esc(goal ? '' : T('stEnter')) + '</p><div class="rz-amt" id="spAmt"><span id="spNum">0</span></div><p class="rz-mut sm" id="spHint">' + (cur ? esc(fmt(cur)) : '') + '</p>' + kit.padHtml('int000') + '<div class="rz-actions"><button type="button" class="rz-btn primary" id="spSave" data-act="spsave" disabled>' + esc(T('save')) + '</button></div>');
  }
  function spUpdate() { $('#spNum').textContent = sp.val ? fmt(+sp.val) : '0'; $('#spSave').disabled = !sp.val; }
  function afterWater() { /* qadam/suv/ovqat saqlangach sokin bayram tekshiruvi */ var t = todayStr(), x = S.dayOf(st, t); if (!x) return; var p = prefs(); if (!p.cel || p.cel.d !== t) p.cel = { d: t }; var pl = planNow();
    if (x.water >= pl.water.glasses && !p.cel.w) { p.cel.w = 1; save(); celebrate('wCard', T('wDone')); }
    if (x.steps >= st.stepGoal && !p.cel.s) { p.cel.s = 1; save(); celebrate('ringBtn', T('sGoalDone')); } }
  function celebrate(id, msg) { setTimeout(function () { var el = document.getElementById(id) && $('#' + id); if (el) { el.classList.remove('glow'); void el.offsetWidth; el.classList.add('glow'); } toast(msg, null, true); vib(25); }, 350); }
  function spSave() {
    var v = +sp.val; if (sp.goal) { st.stepGoal = Math.max(1000, Math.min(100000, v)); } else S.setSteps(st, sp.date, v);
    kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true); if (!sp.goal) afterWater();
  }

  /* ---------- vazn ---------- */
  var wf = null;
  function openWeight() {
    wf = { val: dec(S.currentWeight(st), 1) };
    openSheet('weight', shHead(T('wtT')) + '<div class="rz-amt" id="wfAmt"><span id="wfNum">' + esc(wf.val) + '</span><small> ' + KG() + '</small></div>' + kit.padHtml('dec') + kit.dpHtml('wfDate', T('wDay'), todayStr(), 'past', null, todayStr()) + '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="wfsave">' + esc(T('save')) + '</button></div>');
    wf.val = '';
  }
  function wfSave() {
    var kg = num(wf.val.replace(',', '.')), d = kit.dpGet('wfDate') || todayStr(); if (!S.addWeight(st, d, kg)) { flashEl($('#wfAmt')); return; }
    st.profile.weight = S.currentWeight(st); kit.closeSheet(); commit(); vib(); toast(T('saved'), null, true);
  }

  /* ---------- profil tahriri ---------- */
  var pe = null;
  function openProfile() {
    var p = st.profile; pe = { sex: p.sex, preg: p.preg, act: p.act, goal: p.goal };
    openSheet('prof', profHtml(p));
  }
  function profHtml(p) {
    var lock = S.restrictions({ age: num(p.age), sex: pe.sex, preg: pe.preg, weight: num(p.weight), height: num(p.height) }).keepOnly;
    return shHead(T('meEdit')) + '<div class="rz-fl">' + esc(T('pfSex')) + '</div><div class="rz-seg"><button type="button" data-act="pesex" data-v="m"' + (pe.sex === 'm' ? ' class="on"' : '') + '>' + esc(T('male')) + '</button><button type="button" data-act="pesex" data-v="f"' + (pe.sex === 'f' ? ' class="on"' : '') + '>' + esc(T('female')) + '</button></div>' +
      (pe.sex === 'f' ? '<label class="rz-chk"><input type="checkbox" id="peP"' + (pe.preg ? ' checked' : '') + '><span>' + esc(T('preg')) + '</span></label>' : '') +
      numFld('peA', T('pfAge'), p.age, '', 'numeric') + numFld('peH', T('pfH'), p.height, '', 'numeric') + numFld('peW', T('pfW'), dec(num(p.weight), 1), '') + numFld('peG', T('meGoalW'), p.goalWeight ? dec(p.goalWeight, 1) : '', '') +
      '<div class="rz-fl">' + esc(T('pfAct')) + '</div><div class="rz-chips">' + [1, 2, 3, 4, 5].map(function (a) { return '<button type="button" class="rz-chip' + (pe.act === a ? ' on' : '') + '" data-act="peact" data-v="' + a + '">' + esc(T('a' + a)) + '</button>'; }).join('') + '</div>' +
      '<div class="rz-fl">' + esc(T('pfGoal')) + '</div><div class="rz-chips">' + ['keep', 'slow', 'lose', 'gain'].map(function (g) { var off = lock && g !== 'keep'; return '<button type="button" class="rz-chip' + (pe.goal === g ? ' on' : '') + (off ? ' off' : '') + '" data-act="pegoal" data-v="' + g + '"' + (off ? ' aria-disabled="true"' : '') + '>' + esc(T('g' + g)) + '</button>'; }).join('') + '</div>' + (lock ? '<p class="rz-p warn">' + esc(T('gLocked')) + '</p>' : '') +
      '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="pesave">' + esc(T('save')) + '</button></div>';
  }
  function peRead() { var p = {}; var e = $('#peA'); if (!e) return null; p.age = num($('#peA').value); p.height = num($('#peH').value); p.weight = num($('#peW').value); p.goalWeight = num($('#peG').value) || null; if ($('#peP')) pe.preg = $('#peP').checked; return p; }
  function peRepaint() { var cur = peRead() || {}; var p = Object.assign({}, st.profile, cur); var sh = $('#rzSheet'); var keep = sh.scrollTop; setSheet(profHtml(p)); sh.scrollTop = keep; }
  function peSave() {
    var r = peRead(), np = { sex: pe.sex, preg: pe.sex === 'f' && pe.preg, age: r.age, height: r.height, weight: r.weight, act: pe.act, goal: pe.goal, goalWeight: r.goalWeight };
    var er = S.validate(np); if (er.age) return flashEl($('#peA')); if (er.height) return flashEl($('#peH')); if (er.weight) return flashEl($('#peW'));
    st.profile = np; var d = todayStr(); if (st.weights.length === 0 || Math.abs(S.currentWeight(st) - np.weight) > 0.04) S.addWeight(st, d, np.weight);
    kit.closeSheet(); heroPrev = null; commit(); vib(); toast(T('pfSaved', { x: fmt(planNow().target) }), null, true);
  }

  /* ---------- ulashish kartasi (canvas → rasm) ---------- */
  function shareStats() {
    var t = todayStr(), from = Dt.addDays(t, -29), days = 0, steps = 0;
    Object.keys(st.days).forEach(function (d) { if (d >= from && d <= t) { var x = st.days[d]; if (x.food.length || x.steps > 0 || x.water > 0) days++; steps += x.steps || 0; } });
    var ws = st.weights.filter(function (w) { return w.d >= from && w.d <= t; }), dw = ws.length > 1 ? Math.round((ws[ws.length - 1].kg - ws[0].kg) * 10) / 10 : null;
    return { days: days, steps: steps, km: Math.round(S.distanceKm(steps, num(st.profile.height)) * 10) / 10, dw: dw };
  }
  function drawShare(sel) {
    var cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350; var c = cv.getContext('2d'), s = shareStats(), F = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
    var g = c.createLinearGradient(0, 0, 1080, 1350); g.addColorStop(0, '#0E3B2E'); g.addColorStop(1, '#1E7A4A'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1350);
    c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.arc(920, 160, 320, 0, 7); c.fill(); c.beginPath(); c.arc(120, 1240, 260, 0, 7); c.fill();
    c.fillStyle = '#FFB38F'; c.font = '800 54px ' + F; c.fillText('Salomat', 90, 150); c.fillStyle = 'rgba(255,255,255,.8)'; c.font = '600 38px ' + F; c.fillText(T('shWin'), 90, 210);
    c.fillStyle = '#fff'; c.font = '800 68px ' + F; c.fillText(T('shTitle'), 90, 330);
    var rows = []; if (sel.days) rows.push([String(s.days), T('shDaysV')]); if (sel.steps) rows.push([fmt(s.steps), T('shStepsV')]); if (sel.km) rows.push([dec(s.km, 1), T('shKmV')]); if (sel.w && s.dw != null) rows.push([(s.dw > 0 ? '+' : '') + dec(s.dw, 1), T('shWV')]);
    var y = 470; rows.forEach(function (r) { c.fillStyle = '#fff'; c.font = '800 150px ' + F; c.fillText(r[0], 90, y); var w = c.measureText(r[0]).width; c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '600 46px ' + F; c.fillText(r[1], 90 + w + 28, y); y += 210; });
    if (!rows.length) { c.fillStyle = 'rgba(255,255,255,.8)'; c.font = '600 44px ' + F; c.fillText(T('shNone'), 90, 480); }
    c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '700 40px ' + F; c.fillText('kalki.uz/salomat', 90, 1260);
    return cv;
  }
  var shSel = { days: true, steps: true, km: true, w: false };
  function openShare() {
    var s = shareStats(), chk = function (k, key, extra) { return '<label class="rz-chk"><input type="checkbox" data-sh="' + key + '"' + (shSel[key] ? ' checked' : '') + (extra ? ' disabled' : '') + '><span>' + esc(T(k)) + '</span></label>'; };
    openSheet('share', shHead(T('shT')) + '<p class="rz-p sm">' + esc(T('shH')) + '</p>' + chk('shDays', 'days') + chk('shSteps', 'steps') + chk('shKm', 'km') + chk('shWeight', 'w', s.dw == null) + '<div class="sl-cvw"><canvas id="shCv" width="1080" height="1350" role="img" aria-label="' + esc(T('shT')) + '"></canvas></div><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="shdl">' + esc(T('shDl')) + '</button><button type="button" class="rz-btn primary" data-act="shgo">' + ico('share') + ' ' + esc(T('shGo')) + '</button></div>');
    shPaint();
  }
  function shPaint() { var cv = $('#shCv'); if (!cv) return; var src = drawShare(shSel); cv.getContext('2d').drawImage(src, 0, 0); }
  function shBlob(cb) { drawShare(shSel).toBlob(cb, 'image/png'); }
  function shGo(dl) {
    shBlob(function (b) {
      if (!b) return; var f; try { f = new File([b], 'salomat.png', { type: 'image/png' }); } catch (e) { f = null; }
      if (!dl && f && navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: 'Salomat' }).catch(function () {}); return; }
      var a = document.createElement('a'), u = URL.createObjectURL(b); a.href = u; a.download = 'salomat.png'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 500);
    });
  }

  /* ---------- eksport / import / o'chirish ---------- */
  function doExport() {
    st.lastBackup = Date.now(); save(); var txt = S.exportState(st);
    try { var a = document.createElement('a'), u = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.href = u; a.download = 'kalki-salomat-' + todayStr() + '.json'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 500); } catch (e) {}
    render(); toast(T('expDone'), null, true);
  }
  function doImport() {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json'; inp.style.display = 'none';
    inp.onchange = function () { var f = inp.files && inp.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { var res = S.importState(String(r.result)); if (!res.ok) { toast(T('impBad')); return; } confirmBox(T('impT'), T('impAsk'), function () { res.state.prefs = res.state.prefs || {}; res.state.setup = true; st = res.state; seenFood = null; heroPrev = null; commit(); toast(T('impOk'), null, true); }); }; r.readAsText(f); inp.remove(); };
    document.body.appendChild(inp); inp.click();
  }
  function confirmBox(title, text, yes, step2) {
    openSheet('confirm', shHead(title) + '<p class="rz-p">' + esc(text) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(T('cancel')) + '</button><button type="button" class="rz-btn primary danger" id="cfGo">' + esc(T('confirm')) + '</button></div>');
    $('#cfGo').onclick = function () { kit.closeSheet(); if (step2) setTimeout(function () { confirmBox(title, step2, yes); }, 300); else yes(); };
  }
  function wipe() { confirmBox(T('sDel'), T('delAsk1'), function () { try { localStorage.removeItem(LS); } catch (e) {} st = S.emptyState(); st.prefs = {}; view = 'today'; ob = null; seenFood = null; heroPrev = null; render(); toast(T('deleted')); }, T('delAsk2')); }

  /* ---------- yo'l-yo'riq va "ilova haqida" ---------- */
  var TIPS = [{ sel: '#ringBtn', key: 'tip1', pos: 'below', round: true }, { sel: '#rzFab', key: 'tip2', pos: 'above', round: true }, { sel: '.rz-tab[data-v=steps]', key: 'tip3', pos: 'above' }];
  function tipsStart() { kit.tipsStart(TIPS, function () { prefs().tipsDone = true; save(); var f = $('#rzFab'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }); }
  function aboutOpen(on) {
    document.body.classList.toggle('rz-aboutopen', !!on); var a = document.getElementById('rzAbout'); if (!a) return;
    if (on) { a.scrollTop = 0; var b = document.getElementById('rzAboutBack'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} } else { var m = $('#rzMain'); if (m) try { m.focus({ preventScroll: true }); } catch (e) {} }
  }

  /* ---------- onboarding: bir savol — bir ekran ---------- */
  var OBF = { 2: 'age', 3: 'height', 4: 'weight' };
  function obNew() {
    ob = { step: 1, sex: '', preg: false, age: '', height: '', weight: '', act: 0, goal: '', anim: null };
    try {
      var imp = JSON.parse(localStorage.getItem(LS_IMPORT) || 'null');
      if (imp && typeof imp === 'object') {
        ob.sex = imp.sex === 'f' ? 'f' : (imp.sex === 'm' ? 'm' : ''); ob.age = imp.age ? String(Math.round(num(imp.age))) : ''; ob.height = imp.height ? String(Math.round(num(imp.height))) : ''; ob.weight = imp.weight ? String(num(imp.weight)).replace('.', ',') : '';
        ob.act = S.ACT[imp.act] ? +imp.act : 0; ob.goal = S.GOAL_DELTA[imp.goal] != null ? imp.goal : '';
        var er = S.validate(obProfile()); ob.step = !ob.sex ? 1 : er.age ? 2 : er.height ? 3 : er.weight ? 4 : !ob.act ? 5 : !ob.goal ? 6 : 7;
      }
    } catch (e) {}
  }
  function obProfile() { return { sex: ob.sex, preg: ob.sex === 'f' && ob.preg, age: num(ob.age), height: num(ob.height), weight: num(ob.weight), act: ob.act, goal: ob.goal || 'keep', goalWeight: null }; }
  function optBtn(act, v, title, sub, on, off) { return '<button type="button" class="rz-opt big' + (on ? ' on' : '') + (off ? ' off' : '') + '" data-act="' + act + '" data-v="' + v + '" aria-pressed="' + !!on + '"' + (off ? ' aria-disabled="true"' : '') + '><b>' + esc(title) + '</b>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</button>'; }
  function showOnb() {
    var el = $('#rzOnb'); if (!ob) obNew();
    var s = ob.step, an = ob.anim, foot = ''; ob.anim = null;
    var h = '<div class="rz-ob-top">' + (s > 1 ? '<button type="button" class="rz-x" data-act="obback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button>' : '<span></span>') + '<div class="rz-dots">' + [1, 2, 3, 4, 5, 6].map(function (i) { return '<i class="' + (i === s ? 'on' : (i < s ? 'done' : '')) + '"></i>'; }).join('') + '</div><span></span></div><div class="rz-ob-body' + (an ? ' in-' + an : '') + '">';
    if (s === 1) { h += '<h2 class="rz-q">' + esc(T('o1q')) + '</h2>' + optBtn('obsex', 'm', T('male'), '', ob.sex === 'm') + optBtn('obsex', 'f', T('female'), '', ob.sex === 'f') + (ob.sex === 'f' ? '<label class="rz-chk" style="margin-top:12px"><input type="checkbox" id="obPreg"' + (ob.preg ? ' checked' : '') + '><span>' + esc(T('preg')) + '</span></label>' : ''); foot = ob.sex ? 'next' : 'next0'; }
    if (OBF[s]) { var f = OBF[s], unit = f === 'age' ? (lang === 'ru' ? 'лет' : 'yosh') : (f === 'height' ? (lang === 'ru' ? 'см' : 'sm') : (lang === 'ru' ? 'кг' : 'kg'));
      h += '<h2 class="rz-q">' + esc(T('o' + s + 'q')) + '</h2>' + ((s === 2 || s === 4) ? '<p class="rz-p">' + esc(T('o' + s + 'h')) + '</p>' : '') + '<div class="rz-amt sl-obamt" id="obAmt"><span id="obNum">' + (ob[f] ? esc(ob[f]) : '0') + '</span><small> ' + unit + '</small></div><p class="rz-p warn" id="obErr" hidden></p>' + kit.padHtml(f === 'weight' ? 'dec' : 'int'); foot = 'next'; }
    if (s === 5) { h += '<h2 class="rz-q">' + esc(T('o5q')) + '</h2>' + [1, 2, 3, 4, 5].map(function (a) { return optBtn('obact', a, T('a' + a), T('a' + a + 'h'), ob.act === a); }).join(''); foot = ob.act ? 'next' : 'next0'; }
    if (s === 6) { var lock = S.restrictions(obProfile()).keepOnly; h += '<h2 class="rz-q">' + esc(T('o6q')) + '</h2>' + ['keep', 'slow', 'lose', 'gain'].map(function (g) { return optBtn('obgoal', g, T('g' + g), T('g' + g + 'H'), (ob.goal === g) || (lock && g === 'keep' && !ob.goal), lock && g !== 'keep'); }).join('') + (lock ? '<p class="rz-p warn">' + esc(T('gLocked')) + '</p>' : ''); foot = (ob.goal || lock) ? 'next' : 'next0'; }
    if (s === 7) {
      var pr = obProfile(); if (S.restrictions(pr).keepOnly) pr.goal = 'keep'; var pl = S.plan(pr);
      var why = pl.goal === 'keep' ? T('rWhyKeep', { tdee: fmt(pl.tdee) }) : T(pl.goal === 'gain' ? 'rWhyGain' : 'rWhyLose', { tdee: fmt(pl.tdee), kg: dec(Math.abs(pl.kgPerWeek), 2), d: fmt(Math.abs(pl.target - pl.tdee)) });
      h += '<div class="sl-res7"><p class="rz-fl" style="text-align:center">' + esc(T('rT')) + '</p><div class="sl-big" aria-live="polite"><b id="obTarget">' + fmt(pl.target) + '</b><small> ' + T('kcal') + '</small></div><p class="rz-p">' + esc(why) + '</p>' +
        (pl.floorApplied ? '<p class="rz-p warn">' + esc(T('rFloor', { min: fmt(pl.floorMin), kg: dec(Math.abs(pl.kgPerWeek), 2) })) + '</p>' : '') +
        pl.notes.filter(function (n) { return n !== 'floor'; }).map(function (n) { return '<p class="rz-p warn">' + esc(T(n === 'preg' ? 'pregN' : n)) + '</p>'; }).join('') + (pl.doctor ? '<p class="rz-p warn"><b>' + esc(T('rDoc')) + '</b></p>' : '') +
        '<p class="rz-p">' + esc(T('rMacro', { p: pl.macros.p, f: pl.macros.f, c: pl.macros.c })) + '<br>' + esc(T('rWater', { n: pl.water.glasses, ml: fmt(pl.water.ml) })) + '</p><p class="rz-p sm">' + esc(T('disc')) + '</p></div>'; foot = 'start';
    }
    h += '</div>' + (foot === 'next' || foot === 'next0' ? '<div class="rz-ob-foot"><button type="button" class="rz-btn primary" data-act="obnext"' + (foot === 'next0' ? ' disabled' : '') + '>' + esc(s === 6 ? T('next') : T('next')) + '</button></div>' : '') + (foot === 'start' ? '<div class="rz-ob-foot"><button type="button" class="rz-btn primary" data-act="obstart">' + esc(T('start')) + '</button></div>' : '');
    el.innerHTML = h; el.hidden = false; el.classList.remove('out');
    if (s === 7) kit.setNum($('#obTarget'), 0, planOfOb().target, { dur: 700 });
  }
  function planOfOb() { var pr = obProfile(); if (S.restrictions(pr).keepOnly) pr.goal = 'keep'; return S.plan(pr); }
  function obGo(step, an) { ob.step = step; ob.anim = an; showOnb(); }
  function obNext() {
    var s = ob.step;
    if (s === 1) { obGo(2, 'f'); return; }
    if (OBF[s]) { var f = OBF[s], er = S.validate(Object.assign({ sex: 'm', act: 1, goal: 'keep', age: 30, height: 170, weight: 70 }, (function () { var o = {}; o[f] = num(ob[f]); return o; })())); if (er[f] || !ob[f]) { var e = $('#obErr'); e.textContent = T(f === 'age' ? 'errAge' : (f === 'height' ? 'errHeight' : 'errWeight')); e.hidden = false; flashEl($('#obAmt')); vib(30); return; } obGo(s + 1, 'f'); return; }
    if (s === 5) { obGo(6, 'f'); return; }
    if (s === 6) { if (!ob.goal) ob.goal = 'keep'; obGo(7, 'f'); return; }
  }
  function obStart() {
    var pr = obProfile(), n = S.emptyState(); if (S.restrictions(pr).keepOnly) pr.goal = 'keep'; n.prefs = {}; n.profile = pr; n.setup = true; n.created = Date.now(); S.addWeight(n, todayStr(), pr.weight);
    st = n; try { localStorage.removeItem(LS_IMPORT); } catch (e) {} ob = null; seenFood = null; heroPrev = null; save(); loadDb();
    var el = $('#rzOnb'); el.classList.add('out');
    wait(function () { el.hidden = true; el.classList.remove('out'); view = 'today'; enterNext = true; render(); window.scrollTo(0, 0); if (location.hash === '#boshlash') history.replaceState(null, '', location.pathname + location.search); }, 260);
  }

  /* ---------- suv ---------- */
  function glassTap(i) {
    var t = todayStr(), x = S.ensureDay(st, t), pl = planNow(), n = (x.water === i + 1) ? i : i + 1; S.setWater(st, t, n); save();
    $$('.sl-glass').forEach(function (g, j) { var on = j < Math.min(n, pl.water.glasses); g.classList.toggle('on', on); g.setAttribute('aria-pressed', on); });
    var w = $('#wTxt'); if (w) w.textContent = T('wOf', { n: Math.min(n, pl.water.glasses), m: pl.water.glasses }) + ' · ' + fmt(n * S.GLASS_ML) + ' ' + ML(); vib(10); afterWater();
  }

  /* ---------- hodisalar ---------- */
  root.addEventListener('click', function (e) {
    var lmenu = $('#rzLangMenu'), el = e.target.closest('[data-act]');
    if (!el) { if (lmenu && !lmenu.hidden && !e.target.closest('.rz-langwrap')) lmenu.hidden = true; return; }
    var a = el.getAttribute('data-act');
    if (a !== 'langmenu' && lmenu) lmenu.hidden = true;
    if (kit.act(a, el)) return;
    switch (a) {
      case 'tab': if (view !== el.getAttribute('data-v')) { view = el.getAttribute('data-v'); enterNext = true; var mm = $('#rzMain'); if (mm) mm.scrollTop = 0; } render(); break;
      case 'add': { var fb = $('#rzFab'); fb.classList.remove('pop'); void fb.offsetWidth; fb.classList.add('pop'); openAdd({ date: view === 'food' && foodDay ? foodDay : todayStr() }); break; }
      case 'xkcal': openExplainKcal(); break; case 'xmacro': openExplainMacro(); break; case 'xwater': openExplainWater(); break; case 'xsteps': openExplainSteps(); break; case 'xweight': openExplainWeight(); break; case 'stephelp': openStepHelp(); break;
      case 'glass': glassTap(+el.getAttribute('data-i')); break;
      case 'addsteps': openSteps(todayStr()); break; case 'editsteps': openSteps(el.getAttribute('data-d')); break; case 'stepgoal': openSteps(null, true); break;
      case 'key': {
        var k = el.getAttribute('data-k'), ks = kit.sheetKind();
        if (ob && !$('#rzOnb').hidden && OBF[ob.step]) { var f = OBF[ob.step]; ob[f] = kit.padApply(ob[f], k, { max: 3, dec: f === 'weight' ? 1 : 0 }); $('#obNum').textContent = ob[f] || '0'; $('#obErr').hidden = true; vib(5); }
        else if (ks === 'steps') { sp.val = kit.padApply(sp.val, k, { max: 6 }); spUpdate(); vib(5); }
        else if (ks === 'weight') { wf.val = kit.padApply(wf.val, k, { max: 3, dec: 1 }); $('#wfNum').textContent = wf.val || '0'; vib(5); }
        break; }
      case 'spsave': spSave(); break; case 'addweight': openWeight(); break; case 'wfsave': wfSave(); break;
      case 'editprof': openProfile(); break;
      case 'pesex': { peRead(); pe.sex = el.getAttribute('data-v'); if (pe.sex === 'm') pe.preg = false; peRepaint(); break; }
      case 'peact': peRead(); pe.act = +el.getAttribute('data-v'); peRepaint(); break;
      case 'pegoal': if (el.getAttribute('aria-disabled') !== 'true') { peRead(); pe.goal = el.getAttribute('data-v'); peRepaint(); } break;
      case 'pesave': peSave(); break;
      case 'share': openShare(); break; case 'shgo': shGo(false); break; case 'shdl': shGo(true); break;
      case 'export': doExport(); break; case 'import': doImport(); break; case 'wipe': wipe(); break;
      case 'tips': prefs().tipsDone = false; save(); view = 'today'; enterNext = true; var m0 = $('#rzMain'); if (m0) m0.scrollTop = 0; render(); break;
      case 'about': aboutOpen(true); break;
      case 'hide': prefs()['h_' + el.getAttribute('data-k')] = Date.now(); commit(); break;
      case 'hideweek': prefs().weekHide = todayStr(); commit(); break;
      case 'install': { var pw = window.KalkiPwa; if (pw && pw.prompt) pw.prompt(); setTimeout(render, 300); break; }
      case 'font': { var big = el.getAttribute('data-f') === 'b'; document.documentElement.classList.toggle('fs-big', big); try { if (big) localStorage.setItem('kalki_fs', 'big'); else localStorage.removeItem('kalki_fs'); } catch (x) {} render(); break; }
      case 'langmenu': lmenu.hidden = !lmenu.hidden; break;
      case 'lang': { var l = el.getAttribute('data-l'), tgt = document.getElementById(l === 'cyr' ? 'langCyr' : (l === 'ru' ? 'langRu' : 'langUz')); if (tgt) tgt.click(); break; }
      case 'dprev': foodDay = Dt.addDays(foodDay || todayStr(), -1); render(); break;
      case 'dnext': if ((foodDay || todayStr()) < todayStr()) { foodDay = Dt.addDays(foodDay || todayStr(), 1); render(); } break;
      case 'addto': openAdd({ meal: el.getAttribute('data-m'), date: el.getAttribute('data-d') }); break;
      case 'addtext': openText(el.getAttribute('data-d')); break;
      case 'pickfav': openAdd({ date: el.getAttribute('data-d'), food: el.getAttribute('data-id') }); break;
      case 'editfood': openEdit(el.getAttribute('data-d'), +el.getAttribute('data-id')); break;
      case 'pickfood': pickFood(el.getAttribute('data-id')); break;
      case 'fcat': fd.cat = el.getAttribute('data-c'); $$('.sl-cats .rz-chip').forEach(function (b) { b.classList.toggle('on', b === el); }); refreshRes(); break;
      case 'ftext': openText(null, true); break;
      case 'fcustom': { var qv = $('#fdQ'); openCustom(qv ? qv.value : ''); break; }
      case 'cusave': cuSave(); break;
      case 'fback': if (fd.editId != null) kit.closeSheet(); else { fd.mode = 'search'; fd.food = null; setSheet(searchHtml()); refreshRes(dbState === 0); } break;
      case 'ffav': { var on = S.toggleFav(st, fd.food.id); save(); var b = $('[data-act=ffav]'); b.classList.toggle('fav', on); b.setAttribute('aria-pressed', on); toast(T(on ? 'favOn' : 'favOff')); break; }
      case 'funit': { var nu = el.getAttribute('data-u'); if ((nu === 'g100') !== (fd.unit === 'g100')) fd.qty = nu === 'g100' ? 100 : 1; fd.unit = nu; $$('[data-act=funit]').forEach(function (b) { var on2 = b === el; b.classList.toggle('on', on2); b.setAttribute('aria-pressed', on2); }); portionUpdate(); break; }
      case 'fqty': { var step = fd.unit === 'g100' ? 25 : 0.5, nq = fd.qty + (+el.getAttribute('data-s')) * step; fd.qty = Math.max(step, Math.min(fd.unit === 'g100' ? 3000 : 50, Math.round(nq * 100) / 100)); portionUpdate(); vib(5); break; }
      case 'fmeal': fd.meal = el.getAttribute('data-m'); $$('[data-act=fmeal]').forEach(function (b) { var on3 = b === el; b.classList.toggle('on', on3); b.setAttribute('aria-pressed', on3); }); break;
      case 'fmeal2': { var x2 = S.dayOf(st, fd.date), e2 = x2 && x2.food.filter(function (y) { return y.id === fd.editId; })[0]; if (e2) { e2.meal = el.getAttribute('data-m'); save(); kit.closeSheet(); render(); } break; }
      case 'fmeal3': fd.meal = el.getAttribute('data-m'); $$('[data-act=fmeal3]').forEach(function (b) { var on4 = b === el; b.classList.toggle('on', on4); b.setAttribute('aria-pressed', on4); }); break;
      case 'fsave': fSave(); break; case 'fdel': fDelete(); break;
      case 'txgo': txGo(); break; case 'txai': txAi(); break; case 'txsave': txSave(); break;
      case 'txdel': fd.items.splice(+el.getAttribute('data-i'), 1); txRefresh(); break;
      case 'obsex': ob.sex = el.getAttribute('data-v'); if (ob.sex === 'm') ob.preg = false; showOnb(); break;
      case 'obact': ob.act = +el.getAttribute('data-v'); showOnb(); break;
      case 'obgoal': if (el.getAttribute('aria-disabled') !== 'true') { ob.goal = el.getAttribute('data-v'); showOnb(); } break;
      case 'obnext': obNext(); break; case 'obstart': obStart(); break;
      case 'obback': obGo(Math.max(1, ob.step - 1), 'b'); break;
    }
  });
  root.addEventListener('input', function (e) { var t = e.target; if (t.id === 'fdQ') { fd.q = t.value; refreshRes(); } });
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'obPreg') ob.preg = t.checked; else if (t.id === 'peP') { pe.preg = t.checked; peRepaint(); } else if (t.hasAttribute && t.hasAttribute('data-sh')) { shSel[t.getAttribute('data-sh')] = t.checked; shPaint(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (document.body.classList.contains('rz-aboutopen')) aboutOpen(false); else if (kit.sheetKind()) kit.closeSheet(); else { var lm = $('#rzLangMenu'); if (lm) lm.hidden = true; }
  });
  window.addEventListener('beforeinstallprompt', function () { setTimeout(function () { if (st && st.setup && view === 'today' && !kit.tipsOn()) render(); }, 80); });
  var lastDay = Dt.today();
  document.addEventListener('visibilitychange', function () { if (!document.hidden && st && st.setup) { var d = Dt.today(); if (d !== lastDay) { lastDay = d; heroPrev = null; foodDay = null; render(); } } });
  try { var rootScr = document.documentElement.getAttribute('data-script'); new MutationObserver(function () { var scr = document.documentElement.getAttribute('data-script'); if (langNow() !== lang || scr !== rootScr) { rootScr = scr; render(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-lang', 'data-script'] }); } catch (e) {}

  /* ---------- ishga tushirish ---------- */
  function init() {
    st = load(); shell();
    try { if ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true) document.body.classList.add('rz-standalone'); } catch (e) {}
    var ab = document.getElementById('rzAbout');
    if (ab && !document.getElementById('rzAboutBar')) {
      var bar = document.createElement('div'); bar.className = 'rz-about-bar'; bar.id = 'rzAboutBar'; bar.innerHTML = '<button type="button" class="rz-btn sm" id="rzAboutBack"></button>';
      ab.insertBefore(bar, ab.firstChild); bar.firstChild.addEventListener('click', function () { aboutOpen(false); });
    }
    render();
    if (st.setup) setTimeout(function () { loadDb(); }, 1500);
    if (location.hash === '#qoshish' && st.setup) openAdd({});
    if (location.hash === '#haqida') aboutOpen(true);
    window.__salomat = { get state() { return st; }, render: render, S: S };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
