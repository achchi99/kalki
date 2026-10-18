/* kalki.uz — "Ro'zg'or" ilovasi (vanilla JS). Hisob: assets/rozgor-core.js. Saqlash: localStorage "kalki_rozgor". Hech narsa serverga yuborilmaydi. */
(function () {
  'use strict';
  if (/jsdom/i.test(navigator.userAgent || '')) return;      // prerender (jsdom) ilova DOM'ini HTML'ga pishirmasin
  var K = window.KalkiRozgor; if (!K) return;
  var LS = 'kalki_rozgor', LS_IMPORT = 'kalki_rozgor_import', DAY_MS = 86400000;
  var D = {
    uz: {
      appName: "Ro'zg'or", navToday: 'Bugun', navHist: 'Tarix', navBills: "To'lovlar", navSet: 'Sozlama', navTodayS: 'Bugun', navHistS: 'Tarix', navBillsS: "To'lov", navSetS: 'Sozlama', add: "Xarajat qo'shish", sum: "so'm",
      today: 'Bugun', yesterday: 'Kecha', tomorrow: 'Ertaga', back: 'Orqaga', next: 'Keyingi', start: 'Boshlash', save: 'Saqlash', cancel: 'Bekor qilish', del: "O'chirish", close: 'Yopish', yes: 'Ha', no: "Yo'q", confirm: 'Tasdiqlash',
      o1q: "Hozir qo'lingizda va kartangizda jami qancha pul bor?", o1h: "Naqd va kartadagi pulni qo'shib yozing.", o1ph: 'masalan, 3 000 000',
      o2q: 'Oylik (pul tushishi) qachon keladi?', o2h: "Maosh, nafaqa yoki boshqa pul keladigan kun. Summasini yozish shart emas.", o2none: "Aniq kunini bilmayman", o2noneH: "Unda hisob oy oxirigacha yuritiladi.",
      o3q: "Oylikkacha to'lashingiz kerak bo'lgan to'lovlar bormi?", o3h: "Masalan: kredit, ijara, kommunal, bog'cha.", o3yes: "Ha, bor", o3no: "Yo'q, hozircha yo'q", o3f: "To'lov qo'shing", o3kind: "Qanday to'lov?", o3name: 'Nomi', o3amt: "Qancha to'lanadi?", o3due: "Qaysi kuni to'lanadi?", o3more: "Yana qo'shish", o3done: 'Tayyor', o3skip: "Bu to'lovni o'tkazib yuborish", o3left: "Oila byudjetidan yana {n} ta to'lov bor.",
      bKredit: 'Kredit', bIjara: 'Ijara', bKomm: 'Kommunal', bBogcha: "Bog'cha", bOwn: 'Boshqa', bName: 'Nomi', bAmt: 'Summa', bDue: "To'lov kuni", bRec: 'Har oy takrorlanadi', billName: 'Nomi (masalan, Ijara)',
      hLbl: 'Bugun yana sarflash mumkin', hOver: 'Bugungi limitdan oshib ketdi', hShort: 'Oylikkacha pul yetmaydi', hOverSub: "Ertangi limit: {x} so'm", hShortSub: "To'lovlar va tegmaydigan puldan keyin pul yetmaydi. «To'lovlar» bo'limini ko'ring.", hLeft: "Oylikkacha {d} kun · sarflash mumkin bo'lgan pul: {f} so'm", hLeftM: "Oy oxirigacha {d} kun · sarflash mumkin bo'lgan pul: {f} so'm", hNoDate: "Oylik kuni kiritilmagan — hisob oy oxirigacha yuritilmoqda.", hUsed: "Bugungi limitdan {p}% ishlatildi", hUsed0: "Bugun hali hech narsa sarflanmadi", hNorm: "Kunlik limit: {x} so'm", hHow: 'Bu raqam qanday hisoblanadi?',
      upT: "Yaqin to'lovlar", paid: "To'landi", noUp: "Yaqin to'lov yo'q", overdue: "muddati o'tgan", todayWord: 'bugun', tomorrowWord: 'ertaga', monthly: 'har oy',
      txT: 'Bugungi xarajatlar', emptyToday: "Bugun hali xarajat yo'q", emptyTodayH: "Pastdagi «+» tugmasi bilan birinchi xarajatni yozing.", whatif: "Shuni sotib olsam-chi?",
      nudgeIncome: "Oylik keldimi? Pul tushganini yozing va keyingi kunni kiriting.", nudgeIncomeBtn: 'Pul tushdi', nudgeIdle: "{n} kundan beri yozmadingiz — hisobni tekshiraylikmi?", nudgeIdleBtn: 'Tekshirish', nudgeInstall: "Ilovani bosh ekranga qo'shing — tezroq ochiladi va ma'lumot saqlanadi.", nudgeInstallBtn: "O'rnatish", nudgeIos: "iPhone'da: Safari'da «Ulashish» → «Bosh ekranga qo'shish». Aks holda Safari ma'lumotni o'chirib yuborishi mumkin.", nudgeBackup: "Haftalik zaxira vaqti — ma'lumot faqat shu qurilmada.", nudgeBackupBtn: 'Telegramga yuborish', later: 'Keyinroq',
      savedY: 'Kecha {x} so\'m tejadingiz', savedYh: "Kunlik limitdan kam sarfladingiz. Barakalla!",
      addT: "Xarajat qo'shish", cats: { oziq: 'Oziq-ovqat', transport: 'Transport', uy: 'Uy', bolalar: 'Bolalar', soglik: "Sog'liq", xarid: 'Xaridlar', dam: 'Dam olish', boshqa: 'Boshqa', tolov: "To'lov" }, notePh: 'Izoh (ixtiyoriy)', saved: 'Saqlandi', undone: 'Bekor qilindi', del1: "Yozuv o'chirildi",
      histT: 'Tarix', histMonth: 'Shu oy xarajatlari', histEmpty: "Hali yozuv yo'q", histEmptyH: "Xarajat qo'shsangiz, shu yerda kunlar bo'yicha ko'rinadi.", unrecExp: 'Yozilmagan xarajatlar', unrecInc: 'Yozilmagan tushum', unrecSub: 'Hisobni tekshirganingizda farq chiqdi', incWord: 'Pul tushdi', editT: 'Yozuvni tahrirlash', billPay: "To'lov",
      billsT: "To'lovlar", addBill: "+ To'lov qo'shish", billNone: "To'lov yo'q", billNoneH: "Kredit, ijara, kommunal va boshqalarni qo'shing.", billEdit: "To'lovni tahrirlash", reserveT: 'Tegmaydigan pul', reserveH: "Shu summa limitga kirmaydi — zaxirada turadi (masalan, favqulodda holat uchun).", incomeT: 'Keyingi oylik', incomeNone: 'Kun kiritilmagan', incomeEdit: 'Keyingi oylik kuni', noAmount: 'summasiz', nextIncAmt: 'Kutilayotgan summa (ixtiyoriy)',
      setT: 'Sozlamalar', sCheck: 'Hisobni tekshirish', sCheckH: "Pulingizni sanab, ilovadagi raqam bilan solishtiring.", sInc: 'Pul tushdi', sIncH: "Oylik yoki boshqa pul keldi.", sRes: 'Tegmaydigan pul', sResH: "Limitga kirmaydigan zaxira", sExp: 'Zaxira nusxa olish', sImp: 'Zaxira nusxadan tiklash', sDel: "Hammasini o'chirish", sLang: 'Til', sFont: "Shrift o'lchami", fN: 'Oddiy', fB: 'Katta', sTips: "Yo'l-yo'riqni qayta ko'rish", sAbout: 'Bu ilova haqida', priv: "Ma'lumotlaringiz faqat shu qurilmada saqlanadi. Hech qayerga yuborilmaydi.",
      chkT: 'Hisobni tekshirish', chkIntro: "Hamyon va kartadagi pulni sanab chiqing. Ilovadagi raqam to'g'ri bo'lmasa, farqni yozib qo'yamiz.", chkQ: 'Haqiqatda sizda hozir qancha pul bor?', chkNow: "Ilovada hozir: {x} so'm", chkSame: "Bir xil — farq yo'q.", chkMinus: "Ilovadan {x} so'm kam. Farq «Yozilmagan xarajatlar» deb yoziladi va hisobdagi pul {x} so'mga kamayadi.", chkPlus: "Ilovadan {x} so'm ko'p. Farq «Yozilmagan tushum» deb yoziladi.", chkBig: "Farq juda katta. Summani to'g'ri yozdingizmi?", chkGo: "Ha, farqni yozib qo'y", chkOk: 'Farq yozildi',
      incT: 'Pul tushdi', incAmt: 'Qancha tushdi?', incNext: 'Keyingi oylik qachon?',
      wiT: "Shuni sotib olsam-chi?", wiAmt: 'Narxi', wiFree: "Xariddan keyin sarflash mumkin bo'lgan pul: {x} so'm", wiNorm: "Qolgan kunlar uchun kunlik limit: {x} so'm", wiShort: "Xariddan keyin oylikkacha {x} so'm yetishmaydi.", wiCovers: "Yaqin to'lovlarga yetadi.", wiNo: "Ba'zi to'lovlarga yetmay qolishi mumkin:", wiNote: "Hech narsa saqlanmaydi — faqat oqibatni ko'rsatadi.", wiNoBills: "Yaqin to'lov yo'q.",
      expDone: 'Zaxira nusxa saqlandi', impT: 'Zaxira nusxadan tiklash', impAsk: "Hozirgi ma'lumot zaxira nusxadagi bilan almashtiriladi. Davom etasizmi?", impOk: 'Tiklandi', impBad: "Zaxira nusxa fayli noto'g'ri", delAsk1: "Hamma ma'lumot o'chiriladi.", delAsk2: "Aniq o'chiraymi? Qaytarib bo'lmaydi.", deleted: "Hammasi o'chirildi",
      reserveEdit: 'Tegmaydigan pul',
      xT: 'Bu raqam qanday hisoblanadi?', xNow: 'Hozirgi pulingiz', xBills: "Oylikkacha to'lovlar", xRes: 'Tegmaydigan pul', xFree: 'Sarflash mumkin', xSpent: 'Bugun yozilgan xarajatlar', xStart: 'Bugun boshida sarflash mumkin edi', xDays: '{d} kun (oylikkacha)', xDaysM: '{d} kun (oy oxirigacha)', xNorm: 'kuniga (kunlik limit)', xSpent2: 'Bugun sarflandi', xCan: 'Bugun yana mumkin', xNote: "Bugun hisobga kiradi, oylik kuni kirmaydi. Limit kun davomida o'zgarmaydi.", xShort: "Pul oylikkacha yetmaydi: {x} so'm kam.", xOver: "Bugungi limitdan {x} so'm oshdi — ertangi limit kamayadi.",
      tip1: "Bu raqam — bugungi limit. Shuncha so'm sarflasangiz, oylikkacha pulingiz yetadi.", tip2: "«+» tugmasi — xarajat yozish. Har bir sarfni shu yerda yozib boring.", tip3: "«To'lovlar» bo'limida to'langan to'lovni «To'landi» deb belgilang.", tipOk: 'Tushunarli', tipOf: '{i} / {n}',
      aboutBack: 'Orqaga', aboutT: 'Bu ilova haqida',
    },
    ru: {
      appName: 'Рузгор', navToday: 'Сегодня', navHist: 'История', navBills: 'Платежи', navSet: 'Ещё', navTodayS: 'Сегодня', navHistS: 'История', navBillsS: 'Платежи', navSetS: 'Ещё', add: 'Добавить расход', sum: 'сум',
      today: 'Сегодня', yesterday: 'Вчера', tomorrow: 'Завтра', back: 'Назад', next: 'Далее', start: 'Начать', save: 'Сохранить', cancel: 'Отмена', del: 'Удалить', close: 'Закрыть', yes: 'Да', no: 'Нет', confirm: 'Подтвердить',
      o1q: 'Сколько денег у вас сейчас всего — наличными и на карте?', o1h: 'Сложите наличные и деньги на карте.', o1ph: 'например, 3 000 000',
      o2q: 'Когда придёт зарплата (или другие деньги)?', o2h: 'День, когда придут зарплата, пенсия или другие деньги. Сумму писать не обязательно.', o2none: 'Не знаю точного дня', o2noneH: 'Тогда счёт ведётся до конца месяца.',
      o3q: 'Есть ли платежи, которые нужно внести до зарплаты?', o3h: 'Например: кредит, аренда, коммунальные, детсад.', o3yes: 'Да, есть', o3no: 'Нет, пока нет', o3f: 'Добавьте платёж', o3kind: 'Какой платёж?', o3name: 'Название', o3amt: 'Сколько платить?', o3due: 'В какой день платить?', o3more: 'Добавить ещё', o3done: 'Готово', o3skip: 'Пропустить этот платёж', o3left: 'Из семейного бюджета ещё платежей: {n}.',
      bKredit: 'Кредит', bIjara: 'Аренда', bKomm: 'Коммунальные', bBogcha: 'Детсад', bOwn: 'Другое', bName: 'Название', bAmt: 'Сумма', bDue: 'День платежа', bRec: 'Повторяется каждый месяц', billName: 'Название (например, Аренда)',
      hLbl: 'Сегодня можно потратить ещё', hOver: 'Вы вышли за дневной лимит', hShort: 'До зарплаты не хватает денег', hOverSub: 'Завтрашний лимит: {x} сум', hShortSub: 'После платежей и неприкосновенных денег средств не хватает. Загляните в раздел «Платежи».', hLeft: 'До зарплаты {d} дн. · можно потратить: {f} сум', hLeftM: 'До конца месяца {d} дн. · можно потратить: {f} сум', hNoDate: 'День зарплаты не указан — счёт ведётся до конца месяца.', hUsed: 'Использовано {p}% дневного лимита', hUsed0: 'Сегодня пока ничего не потрачено', hNorm: 'Дневной лимит: {x} сум', hHow: 'Как считается это число?',
      upT: 'Ближайшие платежи', paid: 'Оплачено', noUp: 'Ближайших платежей нет', overdue: 'просрочен', todayWord: 'сегодня', tomorrowWord: 'завтра', monthly: 'ежемесячно',
      txT: 'Расходы за сегодня', emptyToday: 'Сегодня расходов ещё нет', emptyTodayH: 'Запишите первый расход кнопкой «+» внизу.', whatif: 'А если я это куплю?',
      nudgeIncome: 'Пришла зарплата? Отметьте, что деньги пришли, и укажите следующий день.', nudgeIncomeBtn: 'Деньги пришли', nudgeIdle: 'Вы не записывали расходы {n} дн. — проверим счёт?', nudgeIdleBtn: 'Проверить', nudgeInstall: 'Добавьте приложение на главный экран — открывается быстрее, данные надёжнее.', nudgeInstallBtn: 'Установить', nudgeIos: 'На iPhone: в Safari «Поделиться» → «На экран «Домой»». Иначе Safari может удалить данные.', nudgeBackup: 'Пора сделать недельную копию — данные хранятся только на этом устройстве.', nudgeBackupBtn: 'Отправить в Telegram', later: 'Позже',
      savedY: 'Вчера вы сэкономили {x} сум', savedYh: 'Вы потратили меньше дневного лимита. Так держать!',
      addT: 'Добавить расход', cats: { oziq: 'Продукты', transport: 'Транспорт', uy: 'Дом', bolalar: 'Дети', soglik: 'Здоровье', xarid: 'Покупки', dam: 'Отдых', boshqa: 'Другое', tolov: 'Платёж' }, notePh: 'Заметка (по желанию)', saved: 'Сохранено', undone: 'Отменено', del1: 'Запись удалена',
      histT: 'История', histMonth: 'Расходы за месяц', histEmpty: 'Записей пока нет', histEmptyH: 'Добавьте расход — он появится здесь по дням.', unrecExp: 'Незаписанные расходы', unrecInc: 'Незаписанный доход', unrecSub: 'Разница при проверке счёта', incWord: 'Деньги пришли', editT: 'Изменить запись', billPay: 'Платёж',
      billsT: 'Платежи', addBill: '+ Добавить платёж', billNone: 'Платежей нет', billNoneH: 'Добавьте кредит, аренду, коммунальные и другое.', billEdit: 'Изменить платёж', reserveT: 'Неприкосновенные деньги', reserveH: 'Эта сумма не входит в лимит — лежит в запасе (например, на непредвиденный случай).', incomeT: 'Следующая зарплата', incomeNone: 'День не указан', incomeEdit: 'День следующей зарплаты', noAmount: 'без суммы', nextIncAmt: 'Ожидаемая сумма (по желанию)',
      setT: 'Настройки', sCheck: 'Проверить счёт', sCheckH: 'Пересчитайте деньги и сравните с числом в приложении.', sInc: 'Деньги пришли', sIncH: 'Зарплата или другие деньги.', sRes: 'Неприкосновенные деньги', sResH: 'Не входит в дневной лимит', sExp: 'Сделать резервную копию', sImp: 'Восстановить из резервной копии', sDel: 'Удалить всё', sLang: 'Язык', sFont: 'Размер шрифта', fN: 'Обычный', fB: 'Крупный', sTips: 'Показать подсказки снова', sAbout: 'О приложении', priv: 'Ваши данные хранятся только на этом устройстве. Никуда не отправляются.',
      chkT: 'Проверка счёта', chkIntro: 'Пересчитайте деньги в кошельке и на карте. Если число в приложении неверно, мы запишем разницу.', chkQ: 'Сколько денег у вас сейчас на самом деле?', chkNow: 'В приложении сейчас: {x} сум', chkSame: 'Совпадает — разницы нет.', chkMinus: 'Меньше, чем в приложении, на {x} сум. Разница запишется как «Незаписанные расходы», денег на счёте станет меньше на {x} сум.', chkPlus: 'Больше, чем в приложении, на {x} сум. Разница запишется как «Незаписанный доход».', chkBig: 'Разница очень большая. Вы правильно ввели сумму?', chkGo: 'Да, записать разницу', chkOk: 'Разница записана',
      incT: 'Деньги пришли', incAmt: 'Сколько пришло?', incNext: 'Когда следующая зарплата?',
      wiT: 'А если я это куплю?', wiAmt: 'Цена', wiFree: 'Можно будет потратить после покупки: {x} сум', wiNorm: 'Дневной лимит на оставшиеся дни: {x} сум', wiShort: 'После покупки до зарплаты не хватит {x} сум.', wiCovers: 'На ближайшие платежи хватает.', wiNo: 'На некоторые платежи может не хватить:', wiNote: 'Ничего не сохраняется — только показывает последствия.', wiNoBills: 'Ближайших платежей нет.',
      expDone: 'Резервная копия сохранена', impT: 'Восстановление из резервной копии', impAsk: 'Текущие данные будут заменены данными из резервной копии. Продолжить?', impOk: 'Восстановлено', impBad: 'Неверный файл резервной копии', delAsk1: 'Все данные будут удалены.', delAsk2: 'Точно удалить? Вернуть нельзя.', deleted: 'Всё удалено',
      reserveEdit: 'Неприкосновенные деньги',
      xT: 'Как считается это число?', xNow: 'Ваши деньги сейчас', xBills: 'Платежи до зарплаты', xRes: 'Неприкосновенные деньги', xFree: 'Можно тратить', xSpent: 'Расходы, записанные сегодня', xStart: 'В начале дня можно было тратить', xDays: '{d} дн. (до зарплаты)', xDaysM: '{d} дн. (до конца месяца)', xNorm: 'в день (дневной лимит)', xSpent2: 'Сегодня потрачено', xCan: 'Сегодня ещё можно', xNote: 'Сегодняшний день считается, день зарплаты — нет. Лимит в течение дня не меняется.', xShort: 'Денег до зарплаты не хватает: {x} сум.', xOver: 'Вы вышли за дневной лимит на {x} сум — завтрашний лимит станет меньше.',
      tip1: 'Это число — лимит на сегодня. Тратьте не больше, и денег хватит до зарплаты.', tip2: 'Кнопка «+» — записать расход. Записывайте каждую трату здесь.', tip3: 'В разделе «Платежи» отмечайте оплаченные платежи кнопкой «Оплачено».', tipOk: 'Понятно', tipOf: '{i} / {n}',
      aboutBack: 'Назад', aboutT: 'О приложении',
      wd: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], mon: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
    }
  };
  var root = document.getElementById('rzApp');
  var st = null, view = 'today', lang = langNow(), reduce = false, seenTx = null, heroPrev = null, enterNext = true;
  var kit = RzKit.create({ root: root, K: K, t: function (k) { return T(k); }, lang: langNow, isCyr: isCyr });
  var inst = KalkiInstall.create({ app: 'rozgor', name: "Ro'zg'or", nameAcc: "Ro'zg'orni", nameRu: 'Рузгор', mark: 'R', color: '#0E3B2E', kit: kit, lang: langNow, root: root, hasData: function () { return !!(st && st.setup); }, exportText: function () { return JSON.stringify({ app: 'kalki-rozgor', v: K.VERSION, exportedAt: Date.now(), state: st }); }, importText: function (t) { return K.importState(t); }, applyState: function (ns) { ns.prefs = ns.prefs || {}; ns.setup = true; st = ns; seenTx = null; heroPrev = null; save(); }, onGate: function () { render(); }, rowIcon: 'rz-ci rz-c-boshqa', setup: function () { return !!(st && st.setup); }, ready: function () { return !!(st && st.setup && st.tx && st.tx.length > 0); }, onChange: function () { if (st && st.setup && !kit.tipsOn() && (view === 'today' || view === 'set') && !kit.sheetKind()) render(); } });
  reduce = kit.reduce;
  var esc = kit.esc, fmt = kit.fmt, digits = kit.digits, spaced = kit.spaced, vib = kit.vib, wait = kit.wait, ico = kit.ico, okCheck = kit.okCheck, monthName = kit.monthName, dLabel = kit.dLabel, setNum = kit.setNum, toast = kit.toast, hideToast = kit.hideToast, shHead = kit.shHead, fld = kit.fld, closeSheet = kit.closeSheet, flashEl = kit.flashEl, dpHtml = kit.dpHtml, dpGet = kit.dpGet, dpPaint = kit.dpPaint, dpSet = kit.dpSet, dpInit = kit.dpInit, qDate = kit.qDate;
  function openSheet(kind, html) { kit.openSheet(kind, html, { noFocus: kind === 'add' }); }
  function langNow() { return document.documentElement.lang === 'ru' ? 'ru' : 'uz'; }
  function isCyr() { return document.documentElement.getAttribute('data-script') === 'cyr'; }
  function T(k, o) { var s = (D[lang] && D[lang][k] != null) ? D[lang][k] : D.uz[k]; if (typeof s === 'string' && o) s = s.replace(/\{(\w+)\}/g, function (m, x) { return o[x] != null ? o[x] : m; }); return s; }
  function catName(c) { return (D[lang].cats && D[lang].cats[c]) || D.uz.cats[c] || c; }
  function $(s, r) { return (r || root).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || root).querySelectorAll(s)); }
  function nowTs() { return Math.floor(Date.now() / 1000); }
  function todayStr() { return K.today(); }
  function fmtDate(d) { if (!d) return ''; var t = todayStr(); if (d === t) return T('todayWord'); if (d === K.addDays(t, 1)) return T('tomorrowWord'); return dLabel(d); }
  function hhmm(ts) { if (!ts) return ''; var d = new Date(ts * 1000); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
  function prefs() { return st.prefs || (st.prefs = {}); }

  /* ---------- saqlash ---------- */
  function load() {
    try { var raw = localStorage.getItem(LS); if (raw) { var s = K.migrate(JSON.parse(raw)); if (s) { if (!s.prefs) s.prefs = {}; return s; } } } catch (e) {}
    var s2 = K.emptyState(); s2.prefs = {}; return s2;
  }
  var persistAsked = false;
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) {}
    if (typeof bk !== 'undefined' && bk) bk.touch();
    if (!persistAsked) { persistAsked = true; try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {} }
  }
  function commit(opts) { save(); render(opts); }

  /* ---------- ikonkalar (inline SVG, bir xil uslub) ---------- */
  kit.addIcons({
    oziq: 'M6 9h12l-1.2 9a2 2 0 0 1-2 1.7H9.2a2 2 0 0 1-2-1.7L6 9z M9 9V6a3 3 0 0 1 6 0v3',
    transport: 'M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M4 11h16 M8 19v-3 M16 19v-3 M7.5 14h.01 M16.5 14h.01',
    uy: 'M3 11l9-8 9 8 M5 10v10h14V10 M10 20v-6h4v6',
    bolalar: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M8.5 10h.01 M15.5 10h.01 M8.5 14.5c1 1.4 2.2 2 3.5 2s2.5-.6 3.5-2',
    soglik: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
    xarid: 'M6 8h12l1 12H5L6 8z M9 8a3 3 0 0 1 6 0',
    dam: 'M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z M16 10h2a2 2 0 0 1 0 4h-2 M8 4v2 M12 4v2',
    boshqa: 'M5 12h.01 M12 12h.01 M19 12h.01',
    tolov: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3z M9 8h6 M9 12h6',
    inc: 'M12 19V5 M6 11l6-6 6 6', adj: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.6 9.4a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1.1.9-1.1 1.7 M12 16.8h.01',
    today: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
    hist: 'M12 8v4l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    set: 'M4 6h9 M17 6h3 M13 4v4 M4 12h3 M11 12h9 M7 10v4 M4 18h11 M19 18h1 M15 16v4',
    plus: 'M12 5v14 M5 12h14', chev: 'M9 6l6 6-6 6', lang: 'M3 5h12 M9 3v2 M5 5c1 4 4 7 8 8 M13 5c-1 4-3 7-7 9 M13 21l4-10 4 10 M14.5 17h5',
    check: 'M5 12l5 5 9-10', back: 'M15 6l-6 6 6 6', x: 'M6 6l12 12 M18 6L6 18', bag: 'M6 8h12l1 12H5L6 8z M9 8a3 3 0 0 1 6 0', cal: 'M5 5h14v15H5z M5 10h14 M9 3v4 M15 3v4', rep: 'M4 4v6h6 M20 20v-6h-6 M5 15a8 8 0 0 0 14 3 M19 9A8 8 0 0 0 5 6',
    shield: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z', help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.6 9.4a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1.1.9-1.1 1.7 M12 16.8h.01', info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5 M12 7.8h.01'
  });
  function catIcon(c, big) { return '<span class="rz-ci rz-c-' + esc(c) + (big ? ' big' : '') + '">' + ico(c, '', c === 'boshqa' ? 3 : 2) + '</span>'; }
  /* ---------- qobiq ---------- */
  function shell() {
    root.innerHTML =
      '<div class="rz-top"><a class="rz-logo" href="./" data-cyr="skip">Kalki<span>.uz</span></a><div class="rz-title" id="rzTitle"></div>' +
      '<div class="rz-langwrap"><button type="button" class="rz-lang" id="rzLang" data-act="langmenu" aria-label="Til / Язык" data-cyr="skip">' + ico('lang', '', 2) + '<span id="rzLangTxt">UZ</span></button>' +
      '<div class="rz-langmenu" id="rzLangMenu" hidden data-cyr="skip"><button type="button" data-act="lang" data-l="uz">UZ</button><button type="button" data-act="lang" data-l="cyr">ЎЗ</button><button type="button" data-act="lang" data-l="ru">RU</button></div></div></div>' +
      '<main class="rz-main" id="rzMain" tabindex="-1"></main>' +
      '<nav class="rz-nav" aria-label="' + esc(T('appName')) + '"><button type="button" class="rz-tab" data-act="tab" data-v="today">' + ico('today') + '<span class="l" data-k="navToday"></span><span class="s" data-k="navTodayS"></span></button><button type="button" class="rz-tab" data-act="tab" data-v="hist">' + ico('hist') + '<span class="l" data-k="navHist"></span><span class="s" data-k="navHistS"></span></button><span class="rz-fabslot"></span><button type="button" class="rz-tab" data-act="tab" data-v="bills">' + ico('tolov') + '<span class="l" data-k="navBills"></span><span class="s" data-k="navBillsS"></span></button><button type="button" class="rz-tab" data-act="tab" data-v="set">' + ico('set') + '<span class="l" data-k="navSet"></span><span class="s" data-k="navSetS"></span></button>' +
      '<button type="button" class="rz-fab" id="rzFab" data-act="add" aria-label="' + esc(T('add')) + '">' + ico('plus', '', 2.6) + '</button></nav>' +
      kit.shellHtml() + '<div class="rz-onb" id="rzOnb" hidden></div>';
  }

  /* ---------- BUGUN ---------- */
  var bk = KalkiBackup.create({ app: 'rozgor', autoSaved: function () { return akk.autoSaved(); }, fileBase: 'rozgor', name: "Ro'zg'or", kit: kit, lang: langNow, rowIcon: 'rz-ci rz-c-boshqa', hasData: function () { return !!(st && st.setup); }, exportText: function () { return JSON.stringify({ app: 'kalki-rozgor', v: K.VERSION, exportedAt: Date.now(), state: st }); }, today: function () { return todayStr(); }, getLast: function () { return st.lastBackup || 0; }, setLast: function (t) { st.lastBackup = t; save(); }, created: function () { return st.created; }, dayCount: function () { var o = {}; st.tx.forEach(function (x) { o[x.date] = 1; }); return Object.keys(o).length; }, pickFile: function () { doImport(); }, sig: function () { return JSON.stringify(st); }, root: root, importText: function (t) { return K.importState(t); }, applyState: function (ns) { ns.prefs = ns.prefs || {}; ns.setup = true; st = ns; seenTx = null; heroPrev = null; save(); }, onChange: function () { if (st && st.setup && !kit.sheetKind() && !kit.tipsOn()) render(); } });
  var akk = KalkiAkkaunt.create({ app: 'rozgor', kit: kit, lang: langNow, bk: bk, rowIcon: 'rz-ci rz-c-boshqa', hasData: function () { return !!(st && st.setup); }, isTrivial: function () { return !!(st && st.setup && !(st.tx || []).length && !(st.bills || []).length); }, onChange: function () { if (st && st.setup && !kit.tipsOn() && (view === 'today' || view === 'set') && !kit.sheetKind()) render(); }, onOnb: function () { if (st && !st.setup && $('#rzOnb') && !$('#rzOnb').hidden && ob && ob.step === 1) showOnb(); } });
  function goTab(v, fn) { if (view !== v) { var tb = $('[data-act=tab][data-v=' + v + ']'); if (tb) tb.click(); } setTimeout(fn, 480); return true; }
  var news = KalkiNews.create({ app: 'rozgor', kit: kit, lang: langNow, root: root, rowIcon: 'rz-ci rz-c-boshqa', isSetup: function () { return !!(st && st.setup); }, onChange: function () { if (st && st.setup && !kit.sheetKind() && !kit.tipsOn()) render(); }, targets: {
    backup: function (n) { return goTab('set', function () { n.highlight($('[data-bk=tg]') || $('#rzMain')); }); } } });
  function nudges() {
    var out = [], t = todayStr(), p = prefs(), now = Date.now();
    var hid = function (k) { return p['h_' + k] && now - p['h_' + k] < 7 * DAY_MS; };
    if (st.income && st.income.date && st.income.date <= t) out.push({ k: 'income', msg: T('nudgeIncome'), btn: T('nudgeIncomeBtn'), act: 'income' });
    var last = K.lastTxDate(st) || (st.created ? K.today(new Date(st.created)) : null);
    if (last) { var idle = K.daysBetween(last, t); if (idle >= 3 && !hid('idle')) out.push({ k: 'idle', msg: T('nudgeIdle', { n: idle }), btn: T('nudgeIdleBtn'), act: 'check', dismiss: true }); }
    if (bk.remindDue() && !hid('backup')) out.push({ k: 'backup', msg: T('nudgeBackup'), btn: T('nudgeBackupBtn'), act: 'bktg', dismiss: true });
    return out;
  }
  function billRow(b, withPay, tapEdit) {
    var t = todayStr(), d = b.due, dl = d < t ? T('overdue') : (d === t ? T('todayWord') : fmtDate(d));
    return '<div class="rz-bill' + (d < t ? ' od' : '') + '" data-bill="' + b.id + '"' + (tapEdit ? ' data-act="editbill" data-id="' + b.id + '"' : '') + '><div class="l"><div class="nm">' + esc(b.name) + '</div><div class="dt">' + esc(dl) + (b.recurring ? ' · ' + T('monthly') : '') + '</div></div><div class="r"><div class="am">' + fmt(b.amount) + '<small> ' + T('sum') + '</small></div>' +
      (withPay ? '<button type="button" class="rz-pay" data-act="pay" data-id="' + b.id + '"><svg class="rz-paychk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" pathLength="1"/></svg>' + T('paid') + '</button>' : '') + '</div></div>';
  }
  function txRow(x) {
    var name, sub = hhmm(x.ts), c = x.cat, sign = x.type === 'exp' ? '−' : '+', cls = x.type === 'exp' ? 'neg' : 'pos';
    if (x.type === 'adj') { name = x.amount < 0 ? T('unrecExp') : T('unrecInc'); sub = T('unrecSub'); c = 'adj'; sign = x.amount < 0 ? '−' : '+'; cls = x.amount < 0 ? 'neg' : 'pos'; }
    else if (x.type === 'inc') { name = T('incWord'); c = 'inc'; }
    else if (x.bill != null || x.cat === 'tolov') { name = T('billPay') + (x.note ? ': ' + x.note : ''); c = 'tolov'; }
    else name = catName(x.cat) + (x.note ? ' · ' + x.note : '');
    var isNew = seenTx && !seenTx[x.id];
    return '<button type="button" class="rz-tx' + (isNew ? ' rz-new' : '') + '" data-act="edittx" data-id="' + x.id + '">' + catIcon(c) + '<span class="m"><span class="nm">' + esc(name) + '</span><span class="tm">' + esc(sub) + '</span></span><span class="am ' + cls + '">' + sign + fmt(Math.abs(x.amount)) + '<small> ' + T('sum') + '</small></span></button>';
  }
  function markSeen() { seenTx = {}; st.tx.forEach(function (x) { seenTx[x.id] = 1; }); }
  function savedCard(s) {                      // kecha mo'ljaldan kam sarflangan bo'lsa — sokin xabar (kuniga bir marta hisoblanadi)
    var p = prefs(), t = todayStr();
    if (!p.savedMsg || p.savedMsg.d !== t) {
      var y = K.addDays(t, -1);
      if (p.snap && p.snap.d === y) { var sp = K.spentToday(st, y), sv = p.snap.n - sp; p.savedMsg = (sp > 0 && sv > 0) ? { d: t, x: sv } : { d: t, x: 0 }; save(); }
    }
    var m = p.savedMsg;
    if (!m || m.d !== t || !m.x || m.hide) return '';
    return '<div class="rz-card good" role="status"><span class="ic">' + okCheck() + '</span><div class="m"><b>' + esc(T('savedY', { x: fmt(m.x) })) + '</b><span>' + esc(T('savedYh')) + '</span></div><button type="button" class="rz-x" data-act="hidesaved" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>';
  }
  function renderToday() {
    var t = todayStr(), s = K.summary(st, t), lbl, big, cls = '', sub = '';
    if (s.free < 0) { lbl = T('hShort'); big = s.short; cls = 'warn'; sub = T('hShortSub'); }
    else if (s.can < 0) { lbl = T('hOver'); big = s.over; cls = 'warn'; sub = s.tomorrow != null ? T('hOverSub', { x: fmt(s.tomorrow) }) : ''; }
    else { lbl = T('hLbl'); big = s.can; }
    var ratio = s.norm > 0 ? Math.min(1, s.spent / s.norm) : (s.spent > 0 ? 1 : 0), pct = Math.round(ratio * 100);
    var left = T(s.mode === 'income' ? 'hLeft' : 'hLeftM', { d: s.days, f: fmt(Math.max(0, s.free)) });
    var prev = heroPrev && heroPrev.cls === cls ? heroPrev : null;
    var h = (inst.isTop() ? inst.cardHtml() : '') + savedCard(s) + '<section class="rz-hero ' + cls + '"><div class="rz-hl" id="hLbl">' + esc(lbl) + '</div><button type="button" class="rz-bigbtn" id="hBig" data-act="explain" aria-label="' + esc(lbl + ': ' + fmt(big) + ' ' + T('sum') + '. ' + T('hHow')) + '"><span class="rz-big"><span class="rz-bn" id="hNum">' + fmt(prev ? prev.big : big) + '</span><small> ' + T('sum') + '</small></span><span class="rz-qb" aria-hidden="true">?</span></button>' +
      (s.free >= 0 ? '<div class="rz-bar" aria-hidden="true"><i id="hBar" style="transform:scaleX(' + (prev ? prev.ratio : 0) + ')"></i></div><div class="rz-used">' + esc(s.can >= 0 ? (pct > 0 ? T('hUsed', { p: pct }) : T('hUsed0')) + ' · ' + T('hNorm', { x: fmt(s.norm) }) : T('hNorm', { x: fmt(s.norm) })) + '</div>' : '') +
      (sub ? '<div class="rz-note">' + esc(sub) + '</div>' : '') + '<div class="rz-left">' + esc(left) + '</div>' + (s.mode === 'month' ? '<div class="rz-note sm">' + esc(T('hNoDate')) + '</div>' : '') + '</section>';
    if (!inst.isTop()) h += inst.cardHtml();
    nudges().forEach(function (n) { h += '<div class="rz-card nudge" data-nudge="' + n.k + '"><div class="t">' + esc(n.msg) + '</div><div class="b">' + (n.btn ? '<button type="button" class="rz-btn sm" data-act="' + n.act + '">' + esc(n.btn) + '</button>' : '') + (n.dismiss ? '<button type="button" class="rz-btn sm ghost" data-act="hide" data-k="' + n.k + '">' + esc(T('later')) + '</button>' : '') + '</div></div>'; });
    var up = K.upcoming(st, t, 3);
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('upT')) + '</div>' + (up.length ? up.map(function (b) { return billRow(b, true, false); }).join('') : '<div class="rz-mut">' + esc(T('noUp')) + '</div>') + '</section>';
    var todays = st.tx.filter(function (x) { return x.date === t; }).sort(function (a, b) { return (b.ts - a.ts) || (b.id - a.id); });
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('txT')) + '</div>' + (todays.length ? todays.map(txRow).join('') : '<div class="rz-empty">' + ico('xarid', 'big') + '<b>' + esc(T('emptyToday')) + '</b><span>' + esc(T('emptyTodayH')) + '</span></div>') + '</section>';
    h += '<button type="button" class="rz-whatif" data-act="whatif">' + ico('bag') + '<span>' + esc(T('whatif')) + '</span>' + ico('chev', 'r') + '</button>';
    $('#rzMain').innerHTML = h; markSeen();
    var num = $('#hNum'), bar = $('#hBar');
    if (prev && prev.big !== big) setNum(num, prev.big, big);
    if (bar && prev && prev.ratio !== ratio) requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.transform = 'scaleX(' + ratio + ')'; }); });
    else if (bar && !prev) requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.transform = 'scaleX(' + ratio + ')'; }); });
    heroPrev = { big: big, ratio: ratio, cls: cls };
    var p = prefs(); if (!p.snap || p.snap.d !== t || p.snap.n !== s.norm) { p.snap = { d: t, n: s.norm }; save(); }
  }

  /* ---------- TARIX ---------- */
  var histMonth = null;
  function renderHist() {
    var t = todayStr(), m = histMonth || K.monthOf(t), h = '<h2 class="rz-h">' + esc(T('histT')) + '</h2>';
    var mc = K.monthByCat(st, m), p = K.parse(m + '-01');
    h += '<section class="rz-card"><div class="rz-monthnav"><button type="button" data-act="mprev" aria-label="‹">' + ico('back') + '</button><b>' + esc(monthName(p.m, true) + ' ' + p.y) + '</b><button type="button" data-act="mnext" aria-label="›">' + ico('chev') + '</button></div><div class="rz-st">' + esc(T('histMonth')) + ' · ' + fmt(mc.total) + ' ' + T('sum') + '</div>';
    h += mc.cats.length ? mc.cats.map(function (c) { return '<div class="rz-cb">' + catIcon(c.cat) + '<div class="m"><div class="rw"><span>' + esc(catName(c.cat)) + '</span><b>' + fmt(c.amount) + '<small> ' + T('sum') + '</small></b></div><div class="rz-bar thin"><i style="transform:scaleX(' + (c.share / 100) + ')"></i></div></div><span class="sh">' + c.share + '%</span></div>'; }).join('') : '<div class="rz-mut">' + esc(T('histEmpty')) + '</div>';
    h += '</section>';
    var groups = K.dayGroups(st);
    if (!groups.length) h += '<div class="rz-empty">' + ico('hist', 'big') + '<b>' + esc(T('histEmpty')) + '</b><span>' + esc(T('histEmptyH')) + '</span></div>';
    groups.forEach(function (g) { var lab = g.date === t ? T('today') : (g.date === K.addDays(t, -1) ? T('yesterday') : dLabel(g.date)); h += '<section class="rz-card"><div class="rz-dayh"><b>' + esc(lab) + '</b><span>' + (g.spent ? '−' + fmt(g.spent) + ' ' + T('sum') : '') + '</span></div>' + g.items.map(txRow).join('') + '</section>'; });
    $('#rzMain').innerHTML = h; markSeen();
  }

  /* ---------- TO'LOVLAR ---------- */
  function renderBills() {
    var t = todayStr(), up = K.upcoming(st, t), h = '<h2 class="rz-h">' + esc(T('billsT')) + '</h2>';
    h += '<section class="rz-card">' + (up.length ? up.map(function (b) { return billRow(b, true, true); }).join('') : '<div class="rz-empty">' + ico('tolov', 'big') + '<b>' + esc(T('billNone')) + '</b><span>' + esc(T('billNoneH')) + '</span></div>') + '<button type="button" class="rz-btn ghost full" data-act="addbill">' + esc(T('addBill')) + '</button></section>';
    h += '<section class="rz-card"><button type="button" class="rz-row" data-act="editincome"><span class="m"><b>' + esc(T('incomeT')) + '</b><span>' + esc(st.income && st.income.date ? fmtDate(st.income.date) + (st.income.amount ? ' · ' + fmt(st.income.amount) + ' ' + T('sum') : '') : T('incomeNone')) + '</span></span>' + ico('chev', 'r') + '</button></section>';
    $('#rzMain').innerHTML = h;
  }

  /* ---------- SOZLAMALAR ---------- */
  function renderSet() {
    var big = document.documentElement.classList.contains('fs-big'), cur = isCyr() ? 'cyr' : lang;
    var row = function (act, ic, t1, t2, val) { return '<button type="button" class="rz-row" data-act="' + act + '">' + catIcon(ic) + '<span class="m"><b>' + esc(t1) + '</b>' + (t2 ? '<span>' + esc(t2) + '</span>' : '') + '</span>' + (val ? '<span class="v">' + esc(val) + '</span>' : ico('chev', 'r')) + '</button>'; };
    var h = '<h2 class="rz-h">' + esc(T('setT')) + '</h2><section class="rz-card">' + row('check', 'rep', T('sCheck'), T('sCheckH')) + row('income', 'inc', T('sInc'), T('sIncH')) + row('editreserve', 'shield', T('sRes'), T('sResH'), fmt(st.reserve) + ' ' + T('sum')) + '</section>' +
      '<section class="rz-card">' + (inst.row() ? inst.row().html : '') + (akk.enabled() ? akk.rowHtml() + akk.more(bk.tgRow() + bk.cloudHtml() + akk.strictRow() + row('export', 'tolov', T('sExp'), '') + row('import', 'boshqa', T('sImp'), '') + bk.lastHtml()) + row('wipe', 'x', T('sDel'), '') : bk.tgRow() + bk.cloudHtml() + akk.rowHtml() + row('export', 'tolov', T('sExp'), '') + row('import', 'boshqa', T('sImp'), '') + row('wipe', 'x', T('sDel'), '') + bk.lastHtml()) + '</section>' +
      '<section class="rz-card"><div class="rz-st">' + esc(T('sLang')) + '</div><div class="rz-seg" data-cyr="skip"><button type="button" data-act="lang" data-l="uz"' + (cur === 'uz' ? ' class="on"' : '') + '>UZ</button><button type="button" data-act="lang" data-l="cyr"' + (cur === 'cyr' ? ' class="on"' : '') + '>ЎЗ</button><button type="button" data-act="lang" data-l="ru"' + (cur === 'ru' ? ' class="on"' : '') + '>RU</button></div>' +
      '<div class="rz-st" style="margin-top:14px">' + esc(T('sFont')) + '</div><div class="rz-seg"><button type="button" data-act="font" data-f="n"' + (!big ? ' class="on"' : '') + '>' + esc(T('fN')) + '</button><button type="button" data-act="font" data-f="b"' + (big ? ' class="on"' : '') + '>' + esc(T('fB')) + '</button></div></section>' +
      '<section class="rz-card">' + news.row() + row('tips', 'help', T('sTips'), '') + '<span class="rz-aboutrow">' + row('about', 'info', T('sAbout'), '') + '</span></section>' +
      '<p class="rz-priv">' + esc(T('priv')) + '</p>';
    $('#rzMain').innerHTML = h;
  }

  function render() {
    lang = langNow();
    $$('[data-k]').forEach(function (e) { e.textContent = T(e.getAttribute('data-k')); });
    var lt0 = isCyr() ? 'ЎЗ' : lang.toUpperCase(), lb0 = $('#rzLang'); if (lb0) lb0.setAttribute('aria-label', lt0 + ' · Til / Язык');
    var ab = document.getElementById('rzAboutBack'); if (ab) ab.textContent = T('aboutBack');
    var lockUi = function (on) { ['#rzMain', '.rz-nav'].forEach(function (q) { var e = $(q); if (e) { e.inert = on; if (on) e.setAttribute('aria-hidden', 'true'); else e.removeAttribute('aria-hidden'); } }); };
    if (!st.setup) { lockUi(true); showOnb(); return; }
    lockUi(false); akk.check();
    var onb = $('#rzOnb'); if (onb && !onb.classList.contains('out')) onb.hidden = true;
    $$('.rz-tab').forEach(function (b) { var on = b.getAttribute('data-v') === view; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
    var title = { today: T('appName'), hist: T('histT'), bills: T('billsT'), set: T('setT') }[view]; $('#rzTitle').textContent = title;
    var lt = $('#rzLangTxt'); if (lt) lt.textContent = isCyr() ? 'ЎЗ' : lang.toUpperCase();
    $('#rzFab').setAttribute('aria-label', T('add'));
    var main = $('#rzMain'), sc = main.scrollTop;
    ({ today: renderToday, hist: renderHist, bills: renderBills, set: renderSet })[view]();
    main.classList.toggle('enter', enterNext); enterNext = false;
    main.scrollTop = sc;
    var p = prefs(); if (view === 'today' && !p.tipsDone && !kit.tipsOn() && !kit.sheetKind()) setTimeout(function () { if (!kit.tipsOn() && st.setup && view === 'today' && !prefs().tipsDone && !kit.sheetKind() && !$('#rzOnb').classList.contains('out')) tipsStart(); }, 450);
  }

  /* ---------- xarajat qo'shish / tahrirlash ---------- */
  var ex = null;
  function openExpense(editId) {
    var t = todayStr(), tx = null;
    if (editId != null) tx = st.tx.filter(function (x) { return x.id === editId; })[0];
    ex = tx ? { id: tx.id, type: tx.type, amount: String(Math.abs(tx.amount)), sign: tx.amount < 0 ? -1 : 1, cat: tx.cat, date: tx.date, note: tx.note || '' } : { id: null, type: 'exp', amount: '', sign: 1, cat: K.recentCats(st)[0], date: t, note: '', day: 't' };
    var h = shHead(tx ? T('editT') : T('addT')) + '<div class="rz-amt" id="exAmt"><span id="exNum">' + (ex.amount ? spaced(ex.amount) : '0') + '</span><small> ' + T('sum') + '</small></div>';
    if (ex.type === 'exp') {
      h += '<div class="rz-cats">' + K.recentCats(st).map(function (c) { return '<button type="button" class="rz-cat' + (c === ex.cat ? ' on' : '') + '" data-act="cat" data-c="' + c + '">' + catIcon(c, true) + '<span>' + esc(catName(c)) + '</span></button>'; }).join('') + '</div>';
    }
    h += '<div class="rz-meta">' + (tx ? dpHtml('exDate', T('pickDate'), ex.date, 'exp', null, t) : '<div class="rz-seg sm"><button type="button" data-act="day" data-d="t" class="on">' + esc(T('today')) + '</button><button type="button" data-act="day" data-d="y">' + esc(T('yesterday')) + '</button></div>') +
      (ex.type === 'exp' ? '<input class="rz-notein" id="exNote" type="text" maxlength="120" placeholder="' + esc(T('notePh')) + '" value="' + esc(ex.note) + '">' : '') + '</div>';
    h += kit.padHtml('int000');
    h += '<div class="rz-actions">' + (tx ? '<button type="button" class="rz-btn ghost danger" data-act="exdel">' + esc(T('del')) + '</button>' : '') + '<button type="button" class="rz-btn primary" id="exSave" data-act="exsave"' + (ex.amount ? '' : ' disabled') + '>' + esc(T('save')) + '</button></div>';
    openSheet('add', h);
  }
  function exUpdate() { var n = $('#exNum'); if (n) n.textContent = ex.amount ? spaced(ex.amount) : '0'; var b = $('#exSave'); if (b) b.disabled = !ex.amount; }
  function rowOut(id, cb) {
    var el = $('.rz-tx[data-id="' + id + '"]');
    if (el && !reduce) { el.classList.add('rz-gone'); setTimeout(cb, 230); } else cb();
  }
  function exSave() {
    if (!ex || !ex.amount) return;
    var amt = parseInt(ex.amount, 10), note = ($('#exNote') && $('#exNote').value) || '';
    if (ex.id != null) {
      var d = $('#exDate') ? dpGet('exDate') || ex.date : ex.date;
      K.updateTx(st, ex.id, { amount: ex.sign * amt, cat: ex.cat, date: d, note: note }); closeSheet(); commit(); vib(); toast(T('saved'), null, true);
    } else {
      var date = ex.day === 'y' ? K.addDays(todayStr(), -1) : todayStr(), tx = K.addTx(st, { type: 'exp', amount: amt, cat: ex.cat, date: date, note: note, ts: nowTs() });
      closeSheet(); commit(); vib(); toast(T('saved'), function () { rowOut(tx.id, function () { K.removeTx(st, tx.id); commit(); }); }, true);
    }
  }
  function exDelete() { var id = ex.id; closeSheet(); rowOut(id, function () { var tx = K.removeTx(st, id); commit(); toast(T('del1'), function () { K.restoreTx(st, tx); commit(); }); }); }

  /* ---------- "bu raqam qanday hisoblanadi?" ---------- */
  function openExplain() {
    var s = K.summary(st, todayStr());
    var row = function (sg, label, val, cls) { return '<div class="rz-xr ' + (cls || '') + '"><span class="sg" aria-hidden="true">' + sg + '</span><span class="lb">' + esc(label) + '</span>' + (val == null ? '' : '<b>' + fmt(val) + '<small> ' + T('sum') + '</small></b>') + '</div>'; };
    var h = shHead(T('xT')) + '<div class="rz-xrows">' + row('', T('xNow'), s.balance) + row('−', T('xBills'), s.due) + row('−', T('xRes'), s.reserve) + row('=', T('xFree'), s.free, 'sum');
    if (s.spent > 0) h += row('+', T('xSpent'), s.spent) + row('=', T('xStart'), s.free + s.spent, 'sum');
    h += row('÷', T(s.mode === 'income' ? 'xDays' : 'xDaysM', { d: s.days }), null) + row('=', T('xNorm'), s.norm, 'sum big');
    if (s.spent > 0) h += row('−', T('xSpent2'), s.spent) + row('=', T('xCan'), s.can, 'sum big');
    h += '</div>';
    if (s.free < 0) h += '<p class="rz-p warn">' + esc(T('xShort', { x: fmt(s.short) })) + '</p>'; else if (s.can < 0) h += '<p class="rz-p warn">' + esc(T('xOver', { x: fmt(s.over) })) + '</p>';
    h += '<p class="rz-p sm">' + esc(T('xNote')) + '</p><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="sheetclose">' + esc(T('tipOk')) + '</button></div>';
    openSheet('explain', h);
  }

  /* ---------- tushum / tekshirish / sotib olsam-chi ---------- */
  function flash(sel) { flashEl($(sel)); }
  function openIncome() {
    openSheet('income', shHead(T('incT')) + fld('inAmt', T('incAmt'), '', '0') + dpHtml('inDate', T('incNext'), '', 'inc', K.addDays(todayStr(), 0)) + fld('inNext', T('nextIncAmt'), '', '') + '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="insave">' + esc(T('save')) + '</button></div>');
  }
  function inSave() {
    var amt = K.posInt($('#inAmt').value), date = dpGet('inDate');
    if (!amt) { flash('#inAmt'); return; }
    var prev = JSON.parse(JSON.stringify(st.income)), tx = K.addIncome(st, amt, todayStr(), date && date >= todayStr() ? date : null, $('#inNext').value, nowTs());
    closeSheet(); commit(); vib(); toast(T('saved'), function () { K.removeTx(st, tx.id); st.income = prev; commit(); }, true);
  }
  function openCheck() {
    var cur = K.balance(st);
    openSheet('check', shHead(T('chkT')) + '<p class="rz-p">' + esc(T('chkIntro')) + '</p><p class="rz-p"><b>' + esc(T('chkNow', { x: fmt(cur) })) + '</b></p>' + fld('ckAmt', T('chkQ'), '', '0') + '<p class="rz-p" id="ckInfo" aria-live="polite"></p><div class="rz-actions"><button type="button" class="rz-btn primary" id="ckGo" data-act="cksave" disabled>' + esc(T('chkGo')) + '</button></div>');
  }
  function ckInfo() {
    var v = $('#ckAmt').value, info = $('#ckInfo'), go = $('#ckGo'); if (!digits(v)) { info.textContent = ''; go.disabled = true; return; }
    var bal = K.balance(st), diff = K.toInt(v) - bal, msg = diff === 0 ? T('chkSame') : (diff < 0 ? T('chkMinus', { x: fmt(-diff) }) : T('chkPlus', { x: fmt(diff) }));
    if (diff !== 0 && bal > 0 && Math.abs(diff) > bal / 2) msg += ' ' + T('chkBig');
    info.textContent = msg; go.disabled = diff === 0;
  }
  function ckSave() { var v = $('#ckAmt').value; if (!digits(v)) return; var tx = K.reconcile(st, K.toInt(v), todayStr(), nowTs()); closeSheet(); if (tx) { commit(); vib(); toast(T('chkOk'), function () { K.removeTx(st, tx.id); commit(); }, true); } }
  function openWhatIf() {
    openSheet('whatif', shHead(T('wiT')) + fld('wiAmt', T('wiAmt'), '', '0') + '<div class="rz-wi" id="wiOut"></div><p class="rz-p sm">' + esc(T('wiNote')) + '</p>');
  }
  function wiUpdate() {
    var a = K.posInt($('#wiAmt').value), out = $('#wiOut'); if (!a) { out.innerHTML = ''; return; }
    var w = K.whatIf(st, todayStr(), a), h = '';
    if (w.short2 > 0) h += '<div class="rz-wi-l warn">' + esc(T('wiShort', { x: fmt(w.short2) })) + '</div>';
    else h += '<div class="rz-wi-l">' + esc(T('wiFree', { x: fmt(w.free2) })) + '</div>';
    h += '<div class="rz-wi-l">' + esc(T('wiNorm', { x: fmt(w.days > 1 ? w.tomorrow2 : Math.max(0, w.free2)) })) + '</div>';
    if (!w.bills.length) h += '<div class="rz-wi-l mut">' + esc(T('wiNoBills')) + '</div>';
    else if (w.coversAll) h += '<div class="rz-wi-l ok">' + ico('check', '', 2.4) + esc(T('wiCovers')) + '</div>';
    else { h += '<div class="rz-wi-l warn">' + esc(T('wiNo')) + '</div>'; w.bills.forEach(function (b) { h += '<div class="rz-wi-b' + (b.ok ? '' : ' no') + '"><span>' + esc(b.name) + ' · ' + esc(fmtDate(b.due)) + '</span><b>' + fmt(b.amount) + '</b></div>'; }); }
    out.innerHTML = h;
  }

  /* ---------- to'lovlar ---------- */
  function openBill(id) {
    var b = id != null ? st.bills.filter(function (x) { return x.id === id; })[0] : null;
    openSheet('bill', shHead(b ? T('billEdit') : T('addBill').replace(/^\+\s*/, '')) + '<input type="hidden" id="bId" value="' + (b ? b.id : '') + '">' + '<label class="rz-f" for="bName"><span>' + esc(T('bName')) + '</span><input id="bName" type="text" maxlength="60" placeholder="' + esc(T('billName')) + '" value="' + esc(b ? b.name : '') + '"></label>' + fld('bAmt', T('bAmt'), b ? spaced(b.amount) : '', '0') + dpHtml('bDue', T('bDue'), b ? b.due : '', 'inc') +
      '<label class="rz-chk"><input type="checkbox" id="bRec"' + (b && b.recurring ? ' checked' : '') + '><span>' + esc(T('bRec')) + '</span></label><div class="rz-actions">' + (b ? '<button type="button" class="rz-btn ghost danger" data-act="bdel">' + esc(T('del')) + '</button>' : '') + '<button type="button" class="rz-btn primary" data-act="bsave">' + esc(T('save')) + '</button></div>');
  }
  function bSave() {
    var id = $('#bId').value, o = { name: $('#bName').value, amount: $('#bAmt').value, due: dpGet('bDue'), recurring: $('#bRec').checked };
    if (!K.posInt(o.amount)) { flash('#bAmt'); return; } if (!K.parse(o.due)) { flashEl($('#bDue')); return; }
    if (id) K.updateBill(st, +id, o); else K.addBill(st, o);
    closeSheet(); commit(); vib(); toast(T('saved'), null, true);
  }
  function bDelete() { var b = K.removeBill(st, +$('#bId').value); closeSheet(); commit(); toast(T('del1'), function () { if (b) st.bills.push(b); commit(); }); }
  function doPay(id, btn) {                      // belgi chiziladi, karta yumshoq yo'qoladi, so'ng hisobga olinadi
    if (btn.disabled) return; btn.disabled = true; btn.classList.add('done'); vib();
    var row = btn.closest('.rz-bill');
    wait(function () {
      if (row) row.classList.add('gone');
      wait(function () { var r = K.payBill(st, id, todayStr(), nowTs()); if (!r) { render(); return; } commit(); toast(T('saved'), function () { K.undoPayBill(st, r); commit(); }, true); }, 260);
    }, 380);
  }
  function openReserve() { openSheet('reserve', shHead(T('reserveEdit')) + fld('rsAmt', T('reserveT'), st.reserve ? spaced(st.reserve) : '', '0') + '<p class="rz-p sm">' + esc(T('reserveH')) + '</p><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="rssave">' + esc(T('save')) + '</button></div>'); }
  function openIncomeDate() {
    openSheet('incdate', shHead(T('incomeEdit')) + dpHtml('idDate', T('pickDate'), st.income && st.income.date || '', 'inc') + fld('idAmt', T('nextIncAmt'), st.income && st.income.amount ? spaced(st.income.amount) : '', '') +
      '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="idclear">' + esc(T('o2none')) + '</button><button type="button" class="rz-btn primary" data-act="idsave">' + esc(T('save')) + '</button></div>');
  }

  /* ---------- eksport / import / o'chirish ---------- */
  function doExport() {
    st.lastBackup = Date.now(); save();
    var txt = JSON.stringify({ app: 'kalki-rozgor', v: K.VERSION, exportedAt: Date.now(), state: st }, null, 1);
    try { var a = document.createElement('a'), u = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.href = u; a.download = bk.fileName(); document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 500); } catch (e) {}
    render(); toast(T('expDone'), null, true);
  }
  function doImport() {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json'; inp.style.display = 'none';
    inp.onchange = function () { var f = inp.files && inp.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { var res = K.importState(String(r.result)); if (!res.ok) { toast(T('impBad')); return; } confirmBox(T('impT'), T('impAsk'), function () { res.state.prefs = res.state.prefs || {}; res.state.setup = true; st = res.state; seenTx = null; heroPrev = null; commit(); toast(T('impOk'), null, true); }); }; r.readAsText(f); inp.remove(); };
    document.body.appendChild(inp); inp.click();
  }
  function confirmBox(title, text, yes, step2) {
    openSheet('confirm', shHead(title) + '<p class="rz-p">' + esc(text) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(T('cancel')) + '</button><button type="button" class="rz-btn primary danger" id="cfGo">' + esc(T('confirm')) + '</button></div>');
    $('#cfGo').onclick = function () { closeSheet(); if (step2) setTimeout(function () { confirmBox(title, step2, yes); }, 300); else yes(); };
  }
  function wipe() {
    confirmBox(T('sDel'), T('delAsk1'), function () { try { localStorage.removeItem(LS); } catch (e) {} st = K.emptyState(); st.prefs = {}; view = 'today'; ob = null; seenTx = null; heroPrev = null; render(); toast(T('deleted')); }, T('delAsk2'));
  }

  /* ---------- birinchi marta yo'l-yo'riq (3 qadam) ---------- */
  var TIPS = [{ sel: '#hBig', key: 'tip1', pos: 'below' }, { sel: '#rzFab', key: 'tip2', pos: 'above', round: true }, { sel: '.rz-tab[data-v=bills]', key: 'tip3', pos: 'above' }];
  function tipsStart() { kit.tipsStart(TIPS, function () { prefs().tipsDone = true; save(); var f = $('#rzFab'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }); }

  /* ---------- "Bu ilova haqida" (SEO matni sahifada qoladi, lekin ilova ochiq paytida ko'rinmaydi) ---------- */
  function aboutOpen(on) {
    document.body.classList.toggle('rz-aboutopen', !!on); var a = document.getElementById('rzAbout'); if (!a) return;
    if (on) { a.scrollTop = 0; var b = document.getElementById('rzAboutBack'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} } else { var m = $('#rzMain'); if (m) try { m.focus({ preventScroll: true }); } catch (e) {} }
  }

  /* ---------- onboarding ---------- */
  var ob = null, KIND = { kredit: 'bKredit', ijara: 'bIjara', komm: 'bKomm', bogcha: 'bBogcha', own: 'bOwn' };
  function newDraft(b) { return { kind: b ? 'own' : '', name: b ? b.name : '', amount: b ? b.amount : '', due: '', imp: !!b }; }
  function showOnb() {
    var el = $('#rzOnb');
    if (!ob) {
      ob = { step: 1, balance: '', date: '', none: false, bills: [], queue: [], sub: 'ask', dr: newDraft(), anim: null, imp: false };
      try {
        var imp = JSON.parse(localStorage.getItem(LS_IMPORT) || 'null');
        if (imp && imp.bills) { ob.queue = imp.bills.filter(function (b) { return K.posInt(b.amount); }).map(function (b) { return { name: String(b.name || ''), amount: spaced(b.amount) }; }); if (ob.queue.length) { ob.imp = true; ob.sub = 'form'; ob.dr = newDraft(ob.queue.shift()); } }
      } catch (e) {}
    }
    var s = ob.step, an = ob.anim; ob.anim = null;
    var h = '<div class="rz-ob-top">' + (s > 1 ? '<button type="button" class="rz-x" data-act="obback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button>' : '<span></span>') + '<div class="rz-dots">' + [1, 2, 3].map(function (i) { return '<i class="' + (i === s ? 'on' : (i < s ? 'done' : '')) + '"></i>'; }).join('') + '</div><span></span></div><div class="rz-ob-body' + (an ? ' in-' + an : '') + '">', foot = '';
    if (s === 1) { h += '<h2 class="rz-q">' + esc(T('o1q')) + '</h2><p class="rz-p">' + esc(T('o1h')) + '</p><div class="rz-amt" id="obBal" role="status"><span id="obBalNum">' + (ob.balance ? spaced(ob.balance) : '0') + '</span><small> ' + T('sum') + '</small></div>' + kit.padHtml('int000') + bk.restoreLink() + akk.restoreLink(); foot = 'next'; }
    if (s === 2) { h += '<h2 class="rz-q">' + esc(T('o2q')) + '</h2><p class="rz-p">' + esc(T('o2h')) + '</p>' + (ob.none ? '' : dpHtml('obDate', T('pickDate'), ob.date, 'inc', todayStr())) + '<button type="button" class="rz-opt' + (ob.none ? ' on' : '') + '" data-act="obnone"><b>' + esc(T('o2none')) + '</b><span>' + esc(T('o2noneH')) + '</span></button>'; foot = 'next'; }
    if (s === 3 && ob.sub === 'ask') { h += '<h2 class="rz-q">' + esc(T('o3q')) + '</h2><p class="rz-p">' + esc(T('o3h')) + '</p><button type="button" class="rz-opt big" data-act="obyes"><b>' + esc(T('o3yes')) + '</b></button><button type="button" class="rz-opt big" data-act="obno"><b>' + esc(T('o3no')) + '</b></button>'; }
    if (s === 3 && ob.sub === 'form') {
      var d = ob.dr;
      h += ob.bills.map(function (b, i) { return '<div class="rz-obdone"><span class="m"><b>' + esc(b.name) + '</b> · ' + fmt(K.toInt(b.amount)) + ' ' + T('sum') + ' · ' + esc(dLabel(b.due)) + '</span><button type="button" class="rz-x" data-act="obdel" data-i="' + i + '" aria-label="' + esc(T('del')) + '">' + ico('x') + '</button></div>'; }).join('');
      h += '<h2 class="rz-q">' + esc(T('o3f')) + '</h2>' + (ob.queue.length ? '<p class="rz-p sm">' + esc(T('o3left', { n: ob.queue.length })) + '</p>' : '') + '<div class="rz-fl">' + esc(T('o3kind')) + '</div><div class="rz-chips rz-kinds" id="obKinds">' + Object.keys(KIND).map(function (k) { return '<button type="button" class="rz-chip' + (d.kind === k ? ' on' : '') + '" data-act="obkind" data-k="' + k + '" aria-pressed="' + (d.kind === k) + '">' + esc(T(KIND[k])) + '</button>'; }).join('') + '</div>';
      if (d.kind === 'own') h += '<label class="rz-f" for="obName"><span>' + esc(T('o3name')) + '</span><input id="obName" type="text" maxlength="60" placeholder="' + esc(T('billName')) + '" value="' + esc(d.name) + '"></label>';
      h += fld('obAmt', T('o3amt'), d.amount, '0') + dpHtml('obDue', T('o3due'), d.due, 'inc');
      if (d.imp) h += '<button type="button" class="rz-link" data-act="obskip">' + esc(T('o3skip')) + '</button>';
      foot = 'bills';
    }
    h += '</div>';
    if (foot === 'next') h += '<div class="rz-ob-foot"><button type="button" class="rz-btn primary" data-act="obnext">' + esc(T('next')) + '</button></div>';
    if (foot === 'bills') h += '<div class="rz-ob-foot"><button type="button" class="rz-btn ghost" data-act="obmore">' + esc(T('o3more')) + '</button><button type="button" class="rz-btn primary" data-act="obdone">' + esc(T('o3done')) + '</button></div>';
    el.innerHTML = h; el.hidden = false; el.classList.remove('out'); dpInit();
    var f = el.querySelector('input[type=text]'); if (f && s !== 2 && !(s === 3 && !an && ob.sub === 'form' && ob.dr.kind === '')) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) {} }, 120);
  }
  function obRead() {
    if (ob.step === 2 && $('#obDate')) ob.date = dpGet('obDate');
    if (ob.step === 3 && ob.sub === 'form' && $('#obAmt')) { ob.dr.amount = $('#obAmt').value; ob.dr.due = dpGet('obDue'); if ($('#obName')) ob.dr.name = $('#obName').value; }
  }
  function obGo(step, an) { ob.step = step; ob.anim = an; showOnb(); }
  function obCommit() {                          // joriy to'lov formasini ro'yxatga qo'shadi: 'empty' | 'ok' | 'bad'
    var d = ob.dr; if (!d.kind && !digits(d.amount) && !d.due && !d.name) return 'empty';
    var bad = false;
    if (!d.kind) { flashEl($('#obKinds')); bad = true; }
    if (!K.posInt(d.amount)) { flash('#obAmt'); bad = true; }
    if (!K.parse(d.due)) { flashEl($('#obDue')); bad = true; }
    if (bad) return 'bad';
    ob.bills.push({ name: d.kind === 'own' ? (d.name.trim() || T('bOwn')) : T(KIND[d.kind]), amount: d.amount, due: d.due, recurring: d.kind !== 'own' });
    ob.dr = ob.queue.length ? newDraft(ob.queue.shift()) : newDraft(); return 'ok';
  }
  function obFinish() {
    var s = K.emptyState(); s.prefs = {}; s.base = K.toInt(ob.balance); s.reserve = 0; s.income = { date: ob.none ? null : ob.date, amount: null };
    ob.bills.forEach(function (b) { K.addBill(s, { name: b.name, amount: b.amount, due: b.due, recurring: !!b.recurring }); });
    s.setup = true; s.created = Date.now(); st = s; try { localStorage.removeItem(LS_IMPORT); } catch (e) {} ob = null; seenTx = null; heroPrev = null; save();
    var el = $('#rzOnb'); el.classList.add('out');
    wait(function () { el.hidden = true; el.classList.remove('out'); view = 'today'; enterNext = true; render(); window.scrollTo(0, 0); if (location.hash === '#boshlash') history.replaceState(null, '', location.pathname + location.search); }, 260);
  }
  function obNext() {
    obRead();
    if (ob.step === 1) { if (!digits(ob.balance)) { flash('#obBal'); return; } obGo(2, 'f'); return; }
    if (ob.step === 2) { if (!ob.none && !K.parse(ob.date)) { flashEl($('#obDate')); return; } obGo(3, 'f'); return; }
  }

  /* ---------- hodisalar ---------- */
  root.addEventListener('click', function (e) {
    var lmenu = $('#rzLangMenu'), el = e.target.closest('[data-act]');
    if (!el) { if (lmenu && !lmenu.hidden && !e.target.closest('.rz-langwrap')) lmenu.hidden = true; return; }
    var a = el.getAttribute('data-act'), id = +el.getAttribute('data-id');
    if (a !== 'langmenu' && lmenu) lmenu.hidden = true;
    if (kit.act(a, el)) return;
    switch (a) {
      case 'tab': if (view !== el.getAttribute('data-v')) { view = el.getAttribute('data-v'); enterNext = true; var mm = $('#rzMain'); if (mm) mm.scrollTop = 0; } render(); break;
      case 'add': { var fb = $('#rzFab'); fb.classList.remove('pop'); void fb.offsetWidth; fb.classList.add('pop'); openExpense(); break; }
      case 'key': if (ob && $('#obBal') && !$('#rzOnb').hidden) { ob.balance = kit.padApply(ob.balance, el.getAttribute('data-k'), { max: 11 }); var obn = $('#obBalNum'); if (obn) obn.textContent = ob.balance ? spaced(ob.balance) : '0'; vib(5); break; } ex.amount = kit.padApply(ex.amount, el.getAttribute('data-k'), { max: 11 }); exUpdate(); vib(5); break;
      case 'cat': ex.cat = el.getAttribute('data-c'); $$('.rz-cat').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-c') === ex.cat); }); break;
      case 'day': ex.day = el.getAttribute('data-d'); $$('[data-act=day]').forEach(function (b) { b.classList.toggle('on', b === el); }); break;
      case 'exsave': exSave(); break;
      case 'exdel': exDelete(); break;
      case 'edittx': openExpense(id); break;
      case 'explain': openExplain(); break;
      case 'pay': doPay(id, el); break;
      case 'editbill': openBill(id); break;
      case 'addbill': openBill(); break;
      case 'bsave': bSave(); break;
      case 'bdel': bDelete(); break;
      case 'editreserve': openReserve(); break;
      case 'rssave': st.reserve = K.posInt($('#rsAmt').value); closeSheet(); commit(); toast(T('saved'), null, true); break;
      case 'editincome': openIncomeDate(); break;
      case 'idsave': { var d = dpGet('idDate'); K.setIncomeDate(st, K.parse(d) ? d : null, $('#idAmt').value); closeSheet(); commit(); toast(T('saved'), null, true); break; }
      case 'idclear': K.setIncomeDate(st, null, null); closeSheet(); commit(); toast(T('saved'), null, true); break;
      case 'income': openIncome(); break;
      case 'insave': inSave(); break;
      case 'check': openCheck(); break;
      case 'cksave': ckSave(); break;
      case 'whatif': openWhatIf(); break;
      case 'export': doExport(); break;
      case 'import': bk.restoreSheet(); break;
      case 'wipe': wipe(); break;
      case 'tips': prefs().tipsDone = false; save(); view = 'today'; enterNext = true; var m0 = $('#rzMain'); if (m0) m0.scrollTop = 0; render(); break;
      case 'about': aboutOpen(true); break;
      case 'hidesaved': prefs().savedMsg.hide = true; commit(); break;
      case 'hide': { prefs()['h_' + el.getAttribute('data-k')] = Date.now(); commit(); break; }
      case 'font': { var big = el.getAttribute('data-f') === 'b'; document.documentElement.classList.toggle('fs-big', big); try { if (big) localStorage.setItem('kalki_fs', 'big'); else localStorage.removeItem('kalki_fs'); } catch (x) {} render(); break; }
      case 'langmenu': lmenu.hidden = !lmenu.hidden; break;
      case 'lang': { var l = el.getAttribute('data-l'), tgt = document.getElementById(l === 'cyr' ? 'langCyr' : (l === 'ru' ? 'langRu' : 'langUz')); if (tgt) tgt.click(); break; }
      case 'mprev': case 'mnext': { var hm = histMonth || K.monthOf(todayStr()), p = K.parse(hm + '-01'); histMonth = K.monthOf(K.addMonthsDom(K.ymd(p.y, p.m, 1), a === 'mprev' ? -1 : 1, 1)); render(); break; }
      /* onboarding */
      case 'obnext': obNext(); break;
      case 'obback': { obRead(); if (ob.step === 3 && ob.sub === 'form' && !ob.imp && !ob.bills.length) { ob.sub = 'ask'; ob.anim = 'b'; showOnb(); } else obGo(Math.max(1, ob.step - 1), 'b'); break; }
      case 'obnone': obRead(); ob.none = !ob.none; if (ob.none) ob.date = ''; showOnb(); break;
      case 'obyes': ob.sub = 'form'; ob.anim = 'f'; showOnb(); break;
      case 'obno': obRead(); obFinish(); break;
      case 'obkind': { obRead(); ob.dr.kind = el.getAttribute('data-k'); showOnb(); var af = $(ob.dr.kind === 'own' ? '#obName' : '#obAmt'); if (af) try { af.focus({ preventScroll: true }); } catch (x) {} break; }
      case 'obmore': { obRead(); var r1 = obCommit(); if (r1 === 'empty') { flashEl($('#obKinds')); break; } if (r1 === 'ok') { ob.anim = 'f'; showOnb(); } break; }
      case 'obdone': { obRead(); var r2 = obCommit(); if (r2 === 'bad') break; if (r2 === 'ok' && ob.queue.length + (ob.dr.imp ? 1 : 0) > 0) { ob.anim = 'f'; showOnb(); break; } obFinish(); break; }
      case 'obskip': ob.dr = ob.queue.length ? newDraft(ob.queue.shift()) : newDraft(); if (!ob.queue.length && !ob.dr.imp) ob.imp = false; ob.anim = 'f'; showOnb(); break;
      case 'obdel': obRead(); ob.bills.splice(+el.getAttribute('data-i'), 1); showOnb(); break;
    }
  });
  root.addEventListener('input', function (e) {
    var t = e.target;
    if (t.hasAttribute && t.hasAttribute('data-fmt')) { var v = spaced(t.value); if (v !== t.value) t.value = v; }
    if (t.id === 'ckAmt') ckInfo(); else if (t.id === 'wiAmt') wiUpdate();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (document.body.classList.contains('rz-aboutopen')) aboutOpen(false); else if (kit.sheetKind()) closeSheet(); else { var lm = $('#rzLangMenu'); if (lm) lm.hidden = true; }
  });
  var lastDay = K.today();
  document.addEventListener('visibilitychange', function () { if (!document.hidden && st && st.setup) { var d = K.today(); if (d !== lastDay) { lastDay = d; heroPrev = null; render(); } } });
  try { new MutationObserver(function () { var scr = document.documentElement.getAttribute('data-script'); if (langNow() !== lang || scr !== root._scr) { root._scr = scr; render(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-lang', 'data-script'] }); } catch (e) {}

  /* ---------- ishga tushirish ---------- */
  function init() {
    st = load(); root._scr = document.documentElement.getAttribute('data-script'); shell();
    try { if ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true) document.body.classList.add('rz-standalone'); } catch (e) {}
    var ab = document.getElementById('rzAbout');
    if (ab && !document.getElementById('rzAboutBar')) {
      var bar = document.createElement('div'); bar.className = 'rz-about-bar'; bar.id = 'rzAboutBar'; bar.innerHTML = '<button type="button" class="rz-btn sm" id="rzAboutBack"></button>';
      ab.insertBefore(bar, ab.firstChild); bar.firstChild.addEventListener('click', function () { aboutOpen(false); });
    }
    render(); inst.gate();
    if (location.hash === '#qoshish' && st.setup) openExpense();
    if (location.hash === '#haqida') aboutOpen(true);
    window.__rozgor = { get state() { return st; }, render: render, K: K };
    // pwa-install.js (KalkiPwa: iPhone ko'rsatmasi, Android o'rnatish) shu skriptdan KEYIN yuklanadi — sahifa yuklangach "o'rnatish" kartasi uchun qayta chizamiz
    if (document.readyState !== 'complete') window.addEventListener('load', function () { if (st && st.setup && view === 'today' && !kit.sheetKind() && !kit.tipsOn()) render(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
