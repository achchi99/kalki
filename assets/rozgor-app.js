/* kalki.uz — "Ro'zg'or" ilovasi (vanilla JS). Hisob: assets/rozgor-core.js. Saqlash: localStorage "kalki_rozgor". Hech narsa serverga yuborilmaydi. */
(function () {
  'use strict';
  if (/jsdom/i.test(navigator.userAgent || '')) return;      // prerender (jsdom) ilova DOM'ini HTML'ga pishirmasin
  var K = window.KalkiRozgor; if (!K) return;
  var LS = 'kalki_rozgor', LS_IMPORT = 'kalki_rozgor_import', DAY_MS = 86400000;
  var D = {
    uz: {
      appName: "Ro'zg'or", navToday: 'Bugun', navHist: 'Tarix', navBills: "To'lovlar", navSet: 'Sozlamalar', navTodayS: 'Bugun', navHistS: 'Tarix', navBillsS: "To'lov", navSetS: 'Sozlama', add: "Xarajat qo'shish", sum: "so'm",
      today: 'Bugun', yesterday: 'Kecha', back: 'Orqaga', next: 'Keyingi', start: 'Boshlash', skip: "Hozircha yo'q", save: 'Saqlash', cancel: 'Bekor qilish', del: "O'chirish", close: 'Yopish', yes: 'Ha', no: "Yo'q", confirm: 'Tasdiqlash',
      o1q: "Hozir qo'lingizda va kartangizda jami qancha pul bor?", o1h: "Naqd va kartadagi pulni qo'shib yozing.", o1ph: 'masalan, 3 000 000',
      o2q: 'Keyingi daromad qachon keladi?', o2h: "Oylik, nafaqa yoki boshqa tushum sanasi. Summasini yozish shart emas.", o2none: "Aniq sanasi yo'q", o2noneH: "Unda hisob oy oxirigacha yuritiladi.", o2date: 'Sana',
      o3q: "Shu kungacha qanday to'lovlar bor?", o3h: "Kredit, ijara, kommunal — nimani to'lashingiz kerak. Hozircha yo'q bo'lsa o'tkazib yuboring.", bKredit: 'Kredit', bIjara: 'Ijara', bKomm: 'Kommunal', bBogcha: "Bog'cha", bOwn: "+ Boshqa to'lov", bName: 'Nomi', bAmt: 'Summa', bDue: 'Sana', bRec: 'Har oy takrorlanadi', o3res: "Zaxira (tegilmaydigan pul, ixtiyoriy)", o3resPh: 'masalan, 500 000',
      hLbl: 'Bugun yana sarflash mumkin', hOver: "Bugun mo'ljaldan oshdi", hShort: 'Keyingi daromadgacha yetishmaydi', hOverSub: "Ertangi mo'ljal: {x} so'm", hShortSub: "Majburiy to'lovlar va zaxiradan keyin pul yetmaydi. To'lovlar sahifasini ko'ring.", hLeft: "Keyingi daromadgacha {d} kun · bo'sh pul {f} so'm", hLeftM: "Oy oxirigacha {d} kun · bo'sh pul {f} so'm", hNoDate: "Daromad sanasi kiritilmagan — hisob oy oxirigacha yuritilmoqda.", hUsed: "Bugungi mo'ljalning {p}% i ishlatildi", hNorm: "Bugungi mo'ljal: {x} so'm",
      upT: "Yaqin to'lovlar", paid: "To'landi", noUp: "Yaqin to'lov yo'q", overdue: "muddati o'tgan", inDays: '{d} kundan keyin', todayWord: 'bugun', tomorrowWord: 'ertaga', monthly: 'har oy',
      txT: 'Bugungi xarajatlar', emptyToday: "Bugun hali xarajat yo'q", emptyTodayH: "Pastdagi «+» tugmasi bilan birinchi xarajatni yozing.", whatif: "Shuni sotib olsam-chi?",
      nudgeIncome: "Daromad keldimi? Tushumni qo'shing va keyingi sanani kiriting.", nudgeIncomeBtn: "Tushum qo'shish", nudgeIdle: "{n} kundan beri yozmadingiz — hisobni tekshiraylikmi?", nudgeIdleBtn: 'Tekshirish', nudgeInstall: "Ilovani bosh ekranga qo'shing — tezroq ochiladi va ma'lumot saqlanadi.", nudgeInstallBtn: "O'rnatish", nudgeIos: "iPhone'da: Safari'da «Ulashish» → «Bosh ekranga qo'shish». Aks holda Safari ma'lumotni o'chirib yuborishi mumkin.", nudgeBackup: 'Zaxira nusxa olish vaqti keldi — ma\'lumot faqat shu qurilmada.', nudgeBackupBtn: 'Nusxa olish', later: 'Keyinroq',
      addT: "Xarajat qo'shish", cats: { oziq: 'Oziq-ovqat', transport: 'Transport', uy: 'Uy', bolalar: 'Bolalar', soglik: "Sog'liq", xarid: 'Xaridlar', dam: 'Dam olish', boshqa: 'Boshqa', tolov: "Majburiy to'lov" }, notePh: 'Izoh (ixtiyoriy)', saved: 'Saqlandi', undone: 'Bekor qilindi', del1: "Yozuv o'chirildi",
      histT: 'Tarix', histMonth: 'Shu oy xarajatlari', histEmpty: "Hali yozuv yo'q", histEmptyH: "Xarajat qo'shsangiz, shu yerda kunlar bo'yicha ko'rinadi.", dayTotal: '{x} so\'m', unrecExp: 'Tafsiloti kiritilmagan sarf', unrecInc: 'Kiritilmagan tushum', incWord: 'Tushum', editT: 'Yozuvni tahrirlash', billPay: "To'lov",
      billsT: "Majburiy to'lovlar", addBill: "+ To'lov qo'shish", billNone: "To'lov yo'q", billNoneH: "Kredit, ijara, kommunal va boshqalarni qo'shing.", billEdit: "To'lovni tahrirlash", reserveT: 'Zaxira', reserveH: "Tegilmaydigan pul — bo'sh puldan ayriladi.", incomeT: 'Keyingi daromad', incomeNone: 'Sana kiritilmagan', incomeEdit: 'Keyingi daromad sanasi', noAmount: 'summasiz', nextIncAmt: 'Kutilayotgan summa (ixtiyoriy)',
      setT: 'Sozlamalar', sCheck: 'Hisobni tekshirish', sCheckH: 'Haqiqiy summani kiriting — farq alohida yozuv bo\'ladi.', sInc: "Tushum qo'shish", sIncH: "Maosh yoki boshqa pul keldi.", sExp: 'Ma\'lumotni yuklab olish (JSON)', sImp: 'Fayldan tiklash', sDel: "Hammasini o'chirish", sLang: 'Til', sFont: "Shrift o'lchami", fN: 'Oddiy', fB: 'Katta', priv: "Ma'lumotlaringiz faqat shu qurilmada saqlanadi. Hech qayerga yuborilmaydi.",
      chkT: 'Hisobni tekshirish', chkQ: "Hozir haqiqatda qancha pulingiz bor?", chkNow: "Ilovada hozir: {x} so'm", chkSame: "Bir xil — farq yo'q.", chkMinus: "Ilovadan {x} so'm kam. «Tafsiloti kiritilmagan sarf» yozuvi qo'shiladi.", chkPlus: "Ilovadan {x} so'm ko'p. «Kiritilmagan tushum» yozuvi qo'shiladi.", chkOk: "Farq yozildi",
      incT: "Tushum qo'shish", incAmt: 'Qancha keldi?', incNext: 'Keyingi daromad qachon?', 
      wiT: "Shuni sotib olsam-chi?", wiAmt: 'Narxi', wiFree: "Xariddan keyin bo'sh pul: {x} so'm", wiNorm: "Qolgan kunlar uchun kunlik mo'ljal: {x} so'm", wiShort: "Xariddan keyin keyingi daromadgacha {x} so'm yetishmaydi.", wiCovers: "Yaqin to'lovlarga yetadi.", wiNo: "Ba'zi to'lovlarga yetmay qolishi mumkin:", wiNote: "Hech narsa saqlanmaydi — faqat oqibatni ko'rsatadi.", wiNoBills: "Yaqin to'lov yo'q.",
      expT: 'Zaxira nusxa', expDone: 'Fayl yuklab olindi', impT: 'Fayldan tiklash', impAsk: "Hozirgi ma'lumot shu fayldagi bilan almashtiriladi. Davom etasizmi?", impOk: 'Tiklandi', impBad: "Fayl noto'g'ri", delAsk1: "Hamma ma'lumot o'chiriladi.", delAsk2: "Aniq o'chiraymi? Qaytarib bo'lmaydi.", deleted: "Hammasi o'chirildi",
      reserveEdit: 'Zaxira summasi', save2: 'Saqlandi',
      errAmt: 'Summani kiriting', errDate: 'Sanani tanlang', persistNote: '',
      pickDate: 'Sana', billName: 'Nomi (masalan, Ijara)'
    },
    ru: {
      appName: 'Рузгор', navToday: 'Сегодня', navHist: 'История', navBills: 'Платежи', navSet: 'Настройки', navTodayS: 'Сегодня', navHistS: 'История', navBillsS: 'Платежи', navSetS: 'Ещё', add: 'Добавить расход', sum: 'сум',
      today: 'Сегодня', yesterday: 'Вчера', back: 'Назад', next: 'Далее', start: 'Начать', skip: 'Пока нет', save: 'Сохранить', cancel: 'Отмена', del: 'Удалить', close: 'Закрыть', yes: 'Да', no: 'Нет', confirm: 'Подтвердить',
      o1q: 'Сколько денег у вас сейчас всего — наличными и на карте?', o1h: 'Сложите наличные и деньги на карте.', o1ph: 'например, 3 000 000',
      o2q: 'Когда придёт следующий доход?', o2h: 'Дата зарплаты, пенсии или другого поступления. Сумму писать не обязательно.', o2none: 'Точной даты нет', o2noneH: 'Тогда счёт ведётся до конца месяца.', o2date: 'Дата',
      o3q: 'Какие платежи будут до этой даты?', o3h: 'Кредит, аренда, коммунальные — что нужно оплатить. Если пока нет, пропустите.', bKredit: 'Кредит', bIjara: 'Аренда', bKomm: 'Коммунальные', bBogcha: 'Детсад', bOwn: '+ Другой платёж', bName: 'Название', bAmt: 'Сумма', bDue: 'Дата', bRec: 'Повторяется каждый месяц', o3res: 'Резерв (неприкосновенные деньги, по желанию)', o3resPh: 'например, 500 000',
      hLbl: 'Сегодня можно потратить ещё', hOver: 'Сегодня сверх нормы', hShort: 'До следующего дохода не хватает', hOverSub: 'Завтрашняя норма: {x} сум', hShortSub: 'После обязательных платежей и резерва денег не хватает. Посмотрите раздел платежей.', hLeft: 'До следующего дохода {d} дн. · свободно {f} сум', hLeftM: 'До конца месяца {d} дн. · свободно {f} сум', hNoDate: 'Дата дохода не указана — счёт ведётся до конца месяца.', hUsed: 'Использовано {p}% дневной нормы', hNorm: 'Дневная норма: {x} сум',
      upT: 'Ближайшие платежи', paid: 'Оплачено', noUp: 'Ближайших платежей нет', overdue: 'просрочен', inDays: 'через {d} дн.', todayWord: 'сегодня', tomorrowWord: 'завтра', monthly: 'ежемесячно',
      txT: 'Расходы за сегодня', emptyToday: 'Сегодня расходов ещё нет', emptyTodayH: 'Запишите первый расход кнопкой «+» внизу.', whatif: 'А если я это куплю?',
      nudgeIncome: 'Пришёл доход? Добавьте поступление и укажите следующую дату.', nudgeIncomeBtn: 'Добавить доход', nudgeIdle: 'Вы не записывали расходы {n} дн. — проверим счёт?', nudgeIdleBtn: 'Проверить', nudgeInstall: 'Добавьте приложение на главный экран — открывается быстрее, данные надёжнее.', nudgeInstallBtn: 'Установить', nudgeIos: 'На iPhone: в Safari «Поделиться» → «На экран «Домой»». Иначе Safari может удалить данные.', nudgeBackup: 'Пора сделать резервную копию — данные хранятся только на этом устройстве.', nudgeBackupBtn: 'Скачать копию', later: 'Позже',
      addT: 'Добавить расход', cats: { oziq: 'Продукты', transport: 'Транспорт', uy: 'Дом', bolalar: 'Дети', soglik: 'Здоровье', xarid: 'Покупки', dam: 'Отдых', boshqa: 'Другое', tolov: 'Обязательный платёж' }, notePh: 'Заметка (по желанию)', saved: 'Сохранено', undone: 'Отменено', del1: 'Запись удалена',
      histT: 'История', histMonth: 'Расходы за месяц', histEmpty: 'Записей пока нет', histEmptyH: 'Добавьте расход — он появится здесь по дням.', dayTotal: '{x} сум', unrecExp: 'Расход без подробностей', unrecInc: 'Незаписанный доход', incWord: 'Поступление', editT: 'Изменить запись', billPay: 'Платёж',
      billsT: 'Обязательные платежи', addBill: '+ Добавить платёж', billNone: 'Платежей нет', billNoneH: 'Добавьте кредит, аренду, коммунальные и другое.', billEdit: 'Изменить платёж', reserveT: 'Резерв', reserveH: 'Неприкосновенные деньги — вычитаются из свободных.', incomeT: 'Следующий доход', incomeNone: 'Дата не указана', incomeEdit: 'Дата следующего дохода', noAmount: 'без суммы', nextIncAmt: 'Ожидаемая сумма (по желанию)',
      setT: 'Настройки', sCheck: 'Проверить счёт', sCheckH: 'Введите реальную сумму — разница станет отдельной записью.', sInc: 'Добавить доход', sIncH: 'Пришла зарплата или другие деньги.', sExp: 'Скачать данные (JSON)', sImp: 'Восстановить из файла', sDel: 'Удалить всё', sLang: 'Язык', sFont: 'Размер шрифта', fN: 'Обычный', fB: 'Крупный', priv: 'Ваши данные хранятся только на этом устройстве. Никуда не отправляются.',
      chkT: 'Проверка счёта', chkQ: 'Сколько денег у вас на самом деле сейчас?', chkNow: 'В приложении сейчас: {x} сум', chkSame: 'Совпадает — разницы нет.', chkMinus: 'Меньше, чем в приложении, на {x} сум. Добавится запись «Расход без подробностей».', chkPlus: 'Больше, чем в приложении, на {x} сум. Добавится запись «Незаписанный доход».', chkOk: 'Разница записана',
      incT: 'Добавить доход', incAmt: 'Сколько пришло?', incNext: 'Когда следующий доход?',
      wiT: 'А если я это куплю?', wiAmt: 'Цена', wiFree: 'Свободных денег после покупки: {x} сум', wiNorm: 'Дневная норма на оставшиеся дни: {x} сум', wiShort: 'После покупки до следующего дохода не хватит {x} сум.', wiCovers: 'На ближайшие платежи хватает.', wiNo: 'На некоторые платежи может не хватить:', wiNote: 'Ничего не сохраняется — только показывает последствия.', wiNoBills: 'Ближайших платежей нет.',
      expT: 'Резервная копия', expDone: 'Файл скачан', impT: 'Восстановление из файла', impAsk: 'Текущие данные будут заменены данными из файла. Продолжить?', impOk: 'Восстановлено', impBad: 'Неверный файл', delAsk1: 'Все данные будут удалены.', delAsk2: 'Точно удалить? Вернуть нельзя.', deleted: 'Всё удалено',
      reserveEdit: 'Сумма резерва', save2: 'Сохранено',
      errAmt: 'Введите сумму', errDate: 'Выберите дату', persistNote: '',
      pickDate: 'Дата', billName: 'Название (например, Аренда)'
    }
  };
  var root = document.getElementById('rzApp');
  var st = null, view = 'today', lang = langNow(), sheetKind = null, undoTimer = null, reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  function langNow() { return document.documentElement.lang === 'ru' ? 'ru' : 'uz'; }
  function T(k, o) { var s = (D[lang] && D[lang][k] != null) ? D[lang][k] : D.uz[k]; if (typeof s === 'string' && o) s = s.replace(/\{(\w+)\}/g, function (m, x) { return o[x] != null ? o[x] : m; }); return s; }
  function catName(c) { return (D[lang].cats && D[lang].cats[c]) || D.uz.cats[c] || c; }
  function $(s, r) { return (r || root).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || root).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function fmt(n) { var r = Math.round(n), neg = r < 0; r = Math.abs(r); return (neg ? '−' : '') + String(r).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function nowTs() { return Math.floor(Date.now() / 1000); }
  function todayStr() { return K.today(); }
  function digits(v) { return String(v == null ? '' : v).replace(/\D/g, ''); }
  function vib(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 15); } catch (e) {} }
  function fmtDate(d) { if (!d) return ''; var t = todayStr(); if (d === t) return T('todayWord'); if (d === K.addDays(t, 1)) return T('tomorrowWord'); var p = K.parse(d); return p ? (p.d < 10 ? '0' : '') + p.d + '.' + (p.m < 10 ? '0' : '') + p.m + '.' + p.y : d; }
  function hhmm(ts) { if (!ts) return ''; var d = new Date(ts * 1000); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }

  /* ---------- saqlash ---------- */
  function load() {
    try { var raw = localStorage.getItem(LS); if (raw) { var s = K.migrate(JSON.parse(raw)); if (s) { if (!s.prefs) s.prefs = {}; return s; } } } catch (e) {}
    var s2 = K.emptyState(); s2.prefs = {}; return s2;
  }
  var persistAsked = false;
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) {}
    if (!persistAsked) { persistAsked = true; try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {} }
  }
  function commit(opts) { save(); render(opts); }

  /* ---------- ikonkalar (inline SVG, bir xil uslub) ---------- */
  var IC = {
    oziq: 'M6 9h12l-1.2 9a2 2 0 0 1-2 1.7H9.2a2 2 0 0 1-2-1.7L6 9z M9 9V6a3 3 0 0 1 6 0v3',
    transport: 'M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M4 11h16 M8 19v-3 M16 19v-3 M7.5 14h.01 M16.5 14h.01',
    uy: 'M3 11l9-8 9 8 M5 10v10h14V10 M10 20v-6h4v6',
    bolalar: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M8.5 10h.01 M15.5 10h.01 M8.5 14.5c1 1.4 2.2 2 3.5 2s2.5-.6 3.5-2',
    soglik: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
    xarid: 'M6 8h12l1 12H5L6 8z M9 8a3 3 0 0 1 6 0',
    dam: 'M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z M16 10h2a2 2 0 0 1 0 4h-2 M8 4v2 M12 4v2',
    boshqa: 'M5 12h.01 M12 12h.01 M19 12h.01',
    tolov: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3z M9 8h6 M9 12h6',
    inc: 'M12 19V5 M6 11l6-6 6 6', adj: 'M12 3v18 M5 8l7-5 7 5 M5 16l7 5 7-5',
    today: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
    hist: 'M12 8v4l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    set: 'M4 6h9 M17 6h3 M13 4v4 M4 12h3 M11 12h9 M7 10v4 M4 18h11 M19 18h1 M15 16v4',
    plus: 'M12 5v14 M5 12h14', chev: 'M9 6l6 6-6 6', lang: 'M3 5h12 M9 3v2 M5 5c1 4 4 7 8 8 M13 5c-1 4-3 7-7 9 M13 21l4-10 4 10 M14.5 17h5',
    check: 'M5 12l5 5 9-10', back: 'M15 6l-6 6 6 6', x: 'M6 6l12 12 M18 6L6 18', bag: 'M6 8h12l1 12H5L6 8z M9 8a3 3 0 0 1 6 0', cal: 'M5 5h14v15H5z M5 10h14 M9 3v4 M15 3v4', rep: 'M4 4v6h6 M20 20v-6h-6 M5 15a8 8 0 0 0 14 3 M19 9A8 8 0 0 0 5 6'
  };
  function ico(name, cls, sw) { return '<svg class="rz-i ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (IC[name] || IC.boshqa) + '"/></svg>'; }
  function catIcon(c, big) { return '<span class="rz-ci rz-c-' + esc(c) + (big ? ' big' : '') + '">' + ico(c, '', c === 'boshqa' ? 3 : 2) + '</span>'; }
  function money(n, cls) { return '<span class="rz-n ' + (cls || '') + '">' + fmt(n) + '</span><small> ' + T('sum') + '</small>'; }

  /* ---------- qobiq ---------- */
  function shell() {
    root.innerHTML =
      '<div class="rz-top"><a class="rz-logo" href="./" data-cyr="skip">Kalki<span>.uz</span></a><div class="rz-title" id="rzTitle"></div>' +
      '<div class="rz-langwrap"><button type="button" class="rz-lang" id="rzLang" data-act="langmenu" aria-label="Til / Язык" data-cyr="skip">' + ico('lang', '', 2) + '<span id="rzLangTxt">UZ</span></button>' +
      '<div class="rz-langmenu" id="rzLangMenu" hidden data-cyr="skip"><button type="button" data-act="lang" data-l="uz">UZ</button><button type="button" data-act="lang" data-l="cyr">ЎЗ</button><button type="button" data-act="lang" data-l="ru">RU</button></div></div></div>' +
      '<main class="rz-main" id="rzMain" tabindex="-1"></main>' +
      '<nav class="rz-nav" aria-label="' + esc(T('appName')) + '"><button type="button" class="rz-tab" data-act="tab" data-v="today">' + ico('today') + '<span class="l" data-k="navToday"></span><span class="s" data-k="navTodayS"></span></button><button type="button" class="rz-tab" data-act="tab" data-v="hist">' + ico('hist') + '<span class="l" data-k="navHist"></span><span class="s" data-k="navHistS"></span></button><span class="rz-fabslot"></span><button type="button" class="rz-tab" data-act="tab" data-v="bills">' + ico('tolov') + '<span class="l" data-k="navBills"></span><span class="s" data-k="navBillsS"></span></button><button type="button" class="rz-tab" data-act="tab" data-v="set">' + ico('set') + '<span class="l" data-k="navSet"></span><span class="s" data-k="navSetS"></span></button>' +
      '<button type="button" class="rz-fab" id="rzFab" data-act="add" aria-label="' + esc(T('add')) + '">' + ico('plus', '', 2.6) + '</button></nav>' +
      '<div class="rz-bg" id="rzBg" hidden data-act="sheetclose"></div><div class="rz-sheet" id="rzSheet" hidden role="dialog" aria-modal="true"></div><div class="rz-toast" id="rzToast" hidden role="status" aria-live="polite"></div><div class="rz-onb" id="rzOnb" hidden></div>';
  }

  /* ---------- raqam animatsiyasi ---------- */
  function setNum(el, to) {
    if (!el) return;
    var from = el._v; el._v = to;
    var txt = fmt(Math.abs(to));
    if (from == null || from === to || reduce) { el.textContent = txt; return; }
    var t0 = performance.now(), dur = 220;
    (function step(now) { var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(Math.abs(Math.round(from + (to - from) * e))); if (p < 1 && el._v === to) requestAnimationFrame(step); else el.textContent = txt; })(t0);
  }

  /* ---------- BUGUN ---------- */
  function nudges(s) {
    var out = [], t = todayStr(), p = st.prefs || (st.prefs = {}), now = Date.now();
    var hid = function (k) { return p['h_' + k] && now - p['h_' + k] < 7 * DAY_MS; };
    if (st.income && st.income.date && st.income.date <= t) out.push({ k: 'income', msg: T('nudgeIncome'), btn: T('nudgeIncomeBtn'), act: 'income' });
    var last = K.lastTxDate(st) || (st.created ? K.today(new Date(st.created)) : null);
    if (last) { var idle = K.daysBetween(last, t); if (idle >= 3 && !hid('idle')) out.push({ k: 'idle', msg: T('nudgeIdle', { n: idle }), btn: T('nudgeIdleBtn'), act: 'check', dismiss: true }); }
    var pwa = window.KalkiPwa;
    if (pwa && !pwa.installed && !hid('install')) {
      if (pwa.canPrompt && pwa.canPrompt()) out.push({ k: 'install', msg: T('nudgeInstall'), btn: T('nudgeInstallBtn'), act: 'install', dismiss: true });
      else if (pwa.ios) out.push({ k: 'install', msg: T('nudgeIos'), dismiss: true });
    }
    var lb = st.lastBackup || st.created || 0;
    if (st.setup && st.tx.length > 0 && now - lb > 7 * DAY_MS && !hid('backup')) out.push({ k: 'backup', msg: T('nudgeBackup'), btn: T('nudgeBackupBtn'), act: 'export', dismiss: true });
    return out;
  }
  function billRow(b, withPay, tapEdit) {
    var t = todayStr(), d = b.due, dl = d < t ? T('overdue') : (d === t ? T('todayWord') : fmtDate(d));
    return '<div class="rz-bill' + (d < t ? ' od' : '') + '"' + (tapEdit ? ' data-act="editbill" data-id="' + b.id + '"' : '') + '><div class="l"><div class="nm">' + esc(b.name) + '</div><div class="dt">' + esc(dl) + (b.recurring ? ' · ' + T('monthly') : '') + '</div></div><div class="r"><div class="am">' + fmt(b.amount) + '<small> ' + T('sum') + '</small></div>' +
      (withPay ? '<button type="button" class="rz-pay" data-act="pay" data-id="' + b.id + '">' + ico('check', '', 2.4) + T('paid') + '</button>' : '') + '</div></div>';
  }
  function txRow(x) {
    var name, c = x.cat, sign = x.type === 'exp' ? '−' : '+', cls = x.type === 'exp' ? 'neg' : 'pos';
    if (x.type === 'adj') { name = x.amount < 0 ? T('unrecExp') : T('unrecInc'); c = 'adj'; sign = x.amount < 0 ? '−' : '+'; cls = x.amount < 0 ? 'neg' : 'pos'; }
    else if (x.type === 'inc') { name = T('incWord'); c = 'inc'; }
    else if (x.bill != null || x.cat === 'tolov') { name = T('billPay') + (x.note ? ': ' + x.note : ''); c = 'tolov'; }
    else name = catName(x.cat) + (x.note ? ' · ' + x.note : '');
    return '<button type="button" class="rz-tx" data-act="edittx" data-id="' + x.id + '">' + catIcon(c) + '<span class="m"><span class="nm">' + esc(name) + '</span><span class="tm">' + esc(hhmm(x.ts)) + '</span></span><span class="am ' + cls + '">' + sign + fmt(Math.abs(x.amount)) + '<small> ' + T('sum') + '</small></span></button>';
  }
  function renderToday() {
    var t = todayStr(), s = K.summary(st, t), lbl, big, cls = '', sub = '';
    if (s.free < 0) { lbl = T('hShort'); big = s.short; cls = 'warn'; sub = T('hShortSub'); }
    else if (s.can < 0) { lbl = T('hOver'); big = s.over; cls = 'warn'; sub = s.tomorrow != null ? T('hOverSub', { x: fmt(s.tomorrow) }) : ''; }
    else { lbl = T('hLbl'); big = s.can; }
    var pct = s.norm > 0 ? Math.min(100, Math.round(s.spent / s.norm * 100)) : (s.spent > 0 ? 100 : 0);
    var left = T(s.mode === 'income' ? 'hLeft' : 'hLeftM', { d: s.days, f: fmt(Math.max(0, s.free)) });
    var h = '<section class="rz-hero ' + cls + '"><div class="rz-hl" id="hLbl">' + esc(lbl) + '</div><div class="rz-big" id="hBig"><span class="rz-bn" id="hNum">' + fmt(big) + '</span><small> ' + T('sum') + '</small></div>' +
      (s.free >= 0 ? '<div class="rz-bar" aria-hidden="true"><i style="width:' + pct + '%"></i></div><div class="rz-used">' + esc(s.can >= 0 ? T('hUsed', { p: pct }) + ' · ' + T('hNorm', { x: fmt(s.norm) }) : T('hNorm', { x: fmt(s.norm) })) + '</div>' : '') +
      (sub ? '<div class="rz-note">' + esc(sub) + '</div>' : '') + '<div class="rz-left">' + esc(left) + '</div>' + (s.mode === 'month' ? '<div class="rz-note sm">' + esc(T('hNoDate')) + '</div>' : '') + '</section>';
    nudges(s).forEach(function (n) { h += '<div class="rz-card nudge" data-nudge="' + n.k + '"><div class="t">' + esc(n.msg) + '</div><div class="b">' + (n.btn ? '<button type="button" class="rz-btn sm" data-act="' + n.act + '">' + esc(n.btn) + '</button>' : '') + (n.dismiss ? '<button type="button" class="rz-btn sm ghost" data-act="hide" data-k="' + n.k + '">' + esc(T('later')) + '</button>' : '') + '</div></div>'; });
    var up = K.upcoming(st, t, 3);
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('upT')) + '</div>' + (up.length ? up.map(function (b) { return billRow(b, true, false); }).join('') : '<div class="rz-mut">' + esc(T('noUp')) + '</div>') + '</section>';
    var todays = st.tx.filter(function (x) { return x.date === t; }).sort(function (a, b) { return (b.ts - a.ts) || (b.id - a.id); });
    h += '<section class="rz-card"><div class="rz-st">' + esc(T('txT')) + '</div>' + (todays.length ? todays.map(txRow).join('') : '<div class="rz-empty">' + ico('xarid', 'big') + '<b>' + esc(T('emptyToday')) + '</b><span>' + esc(T('emptyTodayH')) + '</span></div>') + '</section>';
    h += '<button type="button" class="rz-whatif" data-act="whatif">' + ico('bag') + '<span>' + esc(T('whatif')) + '</span>' + ico('chev', 'r') + '</button>';
    $('#rzMain').innerHTML = h; setNum($('#hNum'), big); var n = $('#hNum'); if (n) n._v = big;
  }

  /* ---------- TARIX ---------- */
  var histMonth = null;
  function renderHist() {
    var t = todayStr(), m = histMonth || K.monthOf(t), h = '<h2 class="rz-h">' + esc(T('histT')) + '</h2>';
    var mc = K.monthByCat(st, m), p = K.parse(m + '-01');
    h += '<section class="rz-card"><div class="rz-monthnav"><button type="button" data-act="mprev" aria-label="‹">' + ico('back') + '</button><b>' + esc(p.y + '-' + (p.m < 10 ? '0' : '') + p.m) + '</b><button type="button" data-act="mnext" aria-label="›">' + ico('chev') + '</button></div><div class="rz-st">' + esc(T('histMonth')) + ' · ' + fmt(mc.total) + ' ' + T('sum') + '</div>';
    h += mc.cats.length ? mc.cats.map(function (c) { return '<div class="rz-cb">' + catIcon(c.cat) + '<div class="m"><div class="rw"><span>' + esc(catName(c.cat)) + '</span><b>' + fmt(c.amount) + '<small> ' + T('sum') + '</small></b></div><div class="rz-bar thin"><i style="width:' + c.share + '%"></i></div></div><span class="sh">' + c.share + '%</span></div>'; }).join('') : '<div class="rz-mut">' + esc(T('histEmpty')) + '</div>';
    h += '</section>';
    var groups = K.dayGroups(st);
    if (!groups.length) h += '<div class="rz-empty">' + ico('hist', 'big') + '<b>' + esc(T('histEmpty')) + '</b><span>' + esc(T('histEmptyH')) + '</span></div>';
    groups.forEach(function (g) { var lab = g.date === t ? T('today') : (g.date === K.addDays(t, -1) ? T('yesterday') : fmtDate(g.date)); h += '<section class="rz-card"><div class="rz-dayh"><b>' + esc(lab) + '</b><span>' + (g.spent ? '−' + fmt(g.spent) + ' ' + T('sum') : '') + '</span></div>' + g.items.map(txRow).join('') + '</section>'; });
    $('#rzMain').innerHTML = h;
  }

  /* ---------- TO'LOVLAR ---------- */
  function renderBills() {
    var t = todayStr(), up = K.upcoming(st, t), h = '<h2 class="rz-h">' + esc(T('billsT')) + '</h2>';
    h += '<section class="rz-card">' + (up.length ? up.map(function (b) { return billRow(b, true, true); }).join('') : '<div class="rz-empty">' + ico('tolov', 'big') + '<b>' + esc(T('billNone')) + '</b><span>' + esc(T('billNoneH')) + '</span></div>') + '<button type="button" class="rz-btn ghost full" data-act="addbill">' + esc(T('addBill')) + '</button></section>';
    h += '<section class="rz-card"><button type="button" class="rz-row" data-act="editreserve"><span class="m"><b>' + esc(T('reserveT')) + '</b><span>' + esc(T('reserveH')) + '</span></span><span class="v">' + fmt(st.reserve) + ' ' + T('sum') + '</span></button>' +
      '<button type="button" class="rz-row" data-act="editincome"><span class="m"><b>' + esc(T('incomeT')) + '</b><span>' + esc(st.income && st.income.date ? fmtDate(st.income.date) + (st.income.amount ? ' · ' + fmt(st.income.amount) + ' ' + T('sum') : ' · ' + T('noAmount')) : T('incomeNone')) + '</span></span>' + ico('chev', 'r') + '</button></section>';
    $('#rzMain').innerHTML = h;
  }

  /* ---------- SOZLAMALAR ---------- */
  function renderSet() {
    var big = document.documentElement.classList.contains('fs-big'), cur = document.documentElement.getAttribute('data-script') === 'cyr' ? 'cyr' : lang;
    var row = function (act, ic, t1, t2) { return '<button type="button" class="rz-row" data-act="' + act + '">' + catIcon(ic) + '<span class="m"><b>' + esc(t1) + '</b>' + (t2 ? '<span>' + esc(t2) + '</span>' : '') + '</span>' + ico('chev', 'r') + '</button>'; };
    var h = '<h2 class="rz-h">' + esc(T('setT')) + '</h2><section class="rz-card">' + row('check', 'rep', T('sCheck'), T('sCheckH')) + row('income', 'inc', T('sInc'), T('sIncH')) + '</section>' +
      '<section class="rz-card">' + row('export', 'tolov', T('sExp'), '') + row('import', 'adj', T('sImp'), '') + row('wipe', 'x', T('sDel'), '') + '</section>' +
      '<section class="rz-card"><div class="rz-st">' + esc(T('sLang')) + '</div><div class="rz-seg" data-cyr="skip"><button type="button" data-act="lang" data-l="uz"' + (cur === 'uz' ? ' class="on"' : '') + '>UZ</button><button type="button" data-act="lang" data-l="cyr"' + (cur === 'cyr' ? ' class="on"' : '') + '>ЎЗ</button><button type="button" data-act="lang" data-l="ru"' + (cur === 'ru' ? ' class="on"' : '') + '>RU</button></div>' +
      '<div class="rz-st" style="margin-top:14px">' + esc(T('sFont')) + '</div><div class="rz-seg"><button type="button" data-act="font" data-f="n"' + (!big ? ' class="on"' : '') + '>' + esc(T('fN')) + '</button><button type="button" data-act="font" data-f="b"' + (big ? ' class="on"' : '') + '>' + esc(T('fB')) + '</button></div></section>' +
      '<p class="rz-priv">' + esc(T('priv')) + '</p>';
    $('#rzMain').innerHTML = h;
  }

  function render() {
    lang = langNow();
    if (!st.setup) { showOnb(); return; }
    var onb = $('#rzOnb'); if (onb) onb.hidden = true;
    $$('[data-k]').forEach(function (e) { e.textContent = T(e.getAttribute('data-k')); });
    $$('.rz-tab').forEach(function (b) { var on = b.getAttribute('data-v') === view; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
    var title = { today: T('appName'), hist: T('histT'), bills: T('billsT'), set: T('setT') }[view]; $('#rzTitle').textContent = title;
    var lt = $('#rzLangTxt'); if (lt) lt.textContent = document.documentElement.getAttribute('data-script') === 'cyr' ? 'ЎЗ' : lang.toUpperCase();
    $('#rzFab').setAttribute('aria-label', T('add'));
    ({ today: renderToday, hist: renderHist, bills: renderBills, set: renderSet })[view]();
  }

  /* ---------- toast / panel ---------- */
  function toast(msg, undo) {
    var el = $('#rzToast'); clearTimeout(undoTimer);
    el.innerHTML = '<span>' + esc(msg) + '</span>' + (undo ? '<button type="button" data-act="undo">' + esc(T('cancel')) + '</button>' : '');
    el._undo = undo || null; el.hidden = false; void el.offsetWidth; el.classList.add('show');
    undoTimer = setTimeout(hideToast, 5000);
  }
  function hideToast() { var el = $('#rzToast'); el.classList.remove('show'); setTimeout(function () { el.hidden = true; el._undo = null; }, 200); }
  function openSheet(kind, html) {
    var sh = $('#rzSheet'), bg = $('#rzBg'); sheetKind = kind;
    sh.innerHTML = '<div class="rz-grab"></div>' + html; sh.hidden = false; bg.hidden = false; void sh.offsetWidth; sh.classList.add('open'); bg.classList.add('open');
    var f = sh.querySelector('input:not([type=hidden]),select'); if (f && kind !== 'add') setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) {} }, 220);
  }
  function closeSheet() {
    var sh = $('#rzSheet'), bg = $('#rzBg'); if (sh.hidden) return; sh.classList.remove('open'); bg.classList.remove('open'); sheetKind = null;
    setTimeout(function () { if (!sheetKind) { sh.hidden = true; bg.hidden = true; sh.innerHTML = ''; } }, 220);
  }
  function shHead(title) { return '<div class="rz-sh-h"><b>' + esc(title) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>'; }
  function fld(id, label, val, ph, extra) { return '<label class="rz-f" for="' + id + '"><span>' + esc(label) + '</span><input id="' + id + '" type="text" inputmode="numeric" autocomplete="off" data-fmt placeholder="' + esc(ph || '') + '" value="' + esc(val || '') + '"' + (extra || '') + '></label>'; }
  function dfld(id, label, val, min) { return '<label class="rz-f" for="' + id + '"><span>' + esc(label) + '</span><input id="' + id + '" type="date" value="' + esc(val || '') + '"' + (min ? ' min="' + min + '"' : '') + '></label>'; }
  function spaced(v) { var d = digits(v).replace(/^0+(?=\d)/, '').slice(0, 12); return d.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

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
    h += '<div class="rz-meta">' + (tx ? dfld('exDate', T('pickDate'), ex.date) : '<div class="rz-seg sm"><button type="button" data-act="day" data-d="t" class="on">' + esc(T('today')) + '</button><button type="button" data-act="day" data-d="y">' + esc(T('yesterday')) + '</button></div>') +
      (ex.type === 'exp' ? '<input class="rz-notein" id="exNote" type="text" maxlength="120" placeholder="' + esc(T('notePh')) + '" value="' + esc(ex.note) + '">' : '') + '</div>';
    h += '<div class="rz-pad">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'].map(function (k) { return '<button type="button" data-act="key" data-k="' + k + '"' + (k === 'del' ? ' aria-label="⌫"' : '') + '>' + (k === 'del' ? '⌫' : k) + '</button>'; }).join('') + '</div>';
    h += '<div class="rz-actions">' + (tx ? '<button type="button" class="rz-btn ghost danger" data-act="exdel">' + esc(T('del')) + '</button>' : '') + '<button type="button" class="rz-btn primary" id="exSave" data-act="exsave"' + (ex.amount ? '' : ' disabled') + '>' + esc(T('save')) + '</button></div>';
    openSheet('add', h);
  }
  function exUpdate() { var n = $('#exNum'); if (n) n.textContent = ex.amount ? spaced(ex.amount) : '0'; var b = $('#exSave'); if (b) b.disabled = !ex.amount; }
  function exSave() {
    if (!ex || !ex.amount) return;
    var amt = parseInt(ex.amount, 10), note = ($('#exNote') && $('#exNote').value) || '';
    if (ex.id != null) {
      var d = $('#exDate') ? $('#exDate').value : ex.date;
      K.updateTx(st, ex.id, { amount: ex.sign * amt, cat: ex.cat, date: d, note: note }); closeSheet(); commit(); vib(); toast(T('saved'));
    } else {
      var date = ex.day === 'y' ? K.addDays(todayStr(), -1) : todayStr(), tx = K.addTx(st, { type: 'exp', amount: amt, cat: ex.cat, date: date, note: note, ts: nowTs() });
      closeSheet(); commit(); vib(); toast(T('saved'), function () { K.removeTx(st, tx.id); commit(); });
    }
  }
  function exDelete() { var id = ex.id, tx = K.removeTx(st, id); closeSheet(); commit(); toast(T('del1'), function () { K.restoreTx(st, tx); commit(); }); }

  /* ---------- tushum / tekshirish / sotib olsam-chi ---------- */
  function openIncome() {
    openSheet('income', shHead(T('incT')) + fld('inAmt', T('incAmt'), '', '0') + dfld('inDate', T('incNext'), '', todayStr()) + fld('inNext', T('nextIncAmt'), '', '') + '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="insave">' + esc(T('save')) + '</button></div>');
  }
  function inSave() {
    var amt = K.posInt($('#inAmt').value), date = $('#inDate').value;
    if (!amt) { flash('#inAmt'); return; }
    var prev = JSON.parse(JSON.stringify(st.income)), tx = K.addIncome(st, amt, todayStr(), date && date > todayStr() ? date : null, $('#inNext').value, nowTs());
    closeSheet(); commit(); vib(); toast(T('saved'), function () { K.removeTx(st, tx.id); st.income = prev; commit(); });
  }
  function flash(sel) { var e = $(sel); if (!e) return; e.classList.add('err'); setTimeout(function () { e.classList.remove('err'); }, 600); try { e.focus({ preventScroll: true }); } catch (x) {} }
  function openCheck() {
    var cur = K.balance(st);
    openSheet('check', shHead(T('chkT')) + '<p class="rz-p">' + esc(T('chkNow', { x: fmt(cur) })) + '</p>' + fld('ckAmt', T('chkQ'), '', '0') + '<p class="rz-p" id="ckInfo"></p><div class="rz-actions"><button type="button" class="rz-btn primary" id="ckGo" data-act="cksave" disabled>' + esc(T('confirm')) + '</button></div>');
  }
  function ckInfo() {
    var v = $('#ckAmt').value, info = $('#ckInfo'), go = $('#ckGo'); if (!digits(v)) { info.textContent = ''; go.disabled = true; return; }
    var diff = K.toInt(v) - K.balance(st); info.textContent = diff === 0 ? T('chkSame') : (diff < 0 ? T('chkMinus', { x: fmt(-diff) }) : T('chkPlus', { x: fmt(diff) })); go.disabled = diff === 0;
  }
  function ckSave() { var v = $('#ckAmt').value; if (!digits(v)) return; var tx = K.reconcile(st, K.toInt(v), todayStr(), nowTs()); closeSheet(); if (tx) { commit(); vib(); toast(T('chkOk'), function () { K.removeTx(st, tx.id); commit(); }); } }
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
    var b = id != null ? st.bills.filter(function (x) { return x.id === id; })[0] : null, defDue = st.income && st.income.date ? K.addDays(st.income.date, -1) : K.addDays(K.firstOfNextMonth(todayStr()), -1);
    openSheet('bill', shHead(b ? T('billEdit') : T('addBill').replace(/^\+\s*/, '')) + '<input type="hidden" id="bId" value="' + (b ? b.id : '') + '">' + '<label class="rz-f" for="bName"><span>' + esc(T('bName')) + '</span><input id="bName" type="text" maxlength="60" placeholder="' + esc(T('billName')) + '" value="' + esc(b ? b.name : '') + '"></label>' + fld('bAmt', T('bAmt'), b ? spaced(b.amount) : '', '0') + dfld('bDue', T('bDue'), b ? b.due : defDue) +
      '<label class="rz-chk"><input type="checkbox" id="bRec"' + (b && b.recurring ? ' checked' : '') + '><span>' + esc(T('bRec')) + '</span></label><div class="rz-actions">' + (b ? '<button type="button" class="rz-btn ghost danger" data-act="bdel">' + esc(T('del')) + '</button>' : '') + '<button type="button" class="rz-btn primary" data-act="bsave">' + esc(T('save')) + '</button></div>');
  }
  function bSave() {
    var id = $('#bId').value, o = { name: $('#bName').value, amount: $('#bAmt').value, due: $('#bDue').value, recurring: $('#bRec').checked };
    if (!K.posInt(o.amount)) { flash('#bAmt'); return; } if (!K.parse(o.due)) { flash('#bDue'); return; }
    if (id) K.updateBill(st, +id, o); else K.addBill(st, o);
    closeSheet(); commit(); vib(); toast(T('saved'));
  }
  function bDelete() { var b = K.removeBill(st, +$('#bId').value); closeSheet(); commit(); toast(T('del1'), function () { if (b) st.bills.push(b); commit(); }); }
  function doPay(id) { var r = K.payBill(st, id, todayStr(), nowTs()); if (!r) return; commit(); vib(); toast(T('saved'), function () { K.undoPayBill(st, r); commit(); }); }
  function openReserve() { openSheet('reserve', shHead(T('reserveEdit')) + fld('rsAmt', T('reserveT'), st.reserve ? spaced(st.reserve) : '', '0') + '<p class="rz-p sm">' + esc(T('reserveH')) + '</p><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="rssave">' + esc(T('save')) + '</button></div>'); }
  function openIncomeDate() {
    openSheet('incdate', shHead(T('incomeEdit')) + dfld('idDate', T('o2date'), st.income && st.income.date || '') + fld('idAmt', T('nextIncAmt'), st.income && st.income.amount ? spaced(st.income.amount) : '', '') +
      '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="idclear">' + esc(T('o2none')) + '</button><button type="button" class="rz-btn primary" data-act="idsave">' + esc(T('save')) + '</button></div>');
  }

  /* ---------- eksport / import / o'chirish ---------- */
  function doExport() {
    st.lastBackup = Date.now(); save();
    var txt = JSON.stringify({ app: 'kalki-rozgor', v: K.VERSION, exportedAt: Date.now(), state: st }, null, 1);
    try { var a = document.createElement('a'), u = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.href = u; a.download = 'kalki-rozgor-' + todayStr() + '.json'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 500); } catch (e) {}
    render(); toast(T('expDone'));
  }
  function doImport() {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json'; inp.style.display = 'none';
    inp.onchange = function () { var f = inp.files && inp.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { var res = K.importState(String(r.result)); if (!res.ok) { toast(T('impBad')); return; } confirmBox(T('impT'), T('impAsk'), function () { res.state.prefs = res.state.prefs || {}; res.state.setup = true; st = res.state; commit(); toast(T('impOk')); }); }; r.readAsText(f); inp.remove(); };
    document.body.appendChild(inp); inp.click();
  }
  function confirmBox(title, text, yes, step2) {
    openSheet('confirm', shHead(title) + '<p class="rz-p">' + esc(text) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(T('cancel')) + '</button><button type="button" class="rz-btn primary danger" id="cfGo">' + esc(T('confirm')) + '</button></div>');
    $('#cfGo').onclick = function () { closeSheet(); if (step2) setTimeout(function () { confirmBox(title, step2, yes); }, 260); else yes(); };
  }
  function wipe() {
    confirmBox(T('sDel'), T('delAsk1'), function () { try { localStorage.removeItem(LS); } catch (e) {} st = K.emptyState(); st.prefs = {}; view = 'today'; ob = null; render(); toast(T('deleted')); }, T('delAsk2'));
  }

  /* ---------- onboarding ---------- */
  var ob = null;
  function defDue() { return ob && ob.none === false && ob.date ? K.addDays(ob.date, -1) : K.addDays(K.firstOfNextMonth(todayStr()), -1); }
  function showOnb() {
    var el = $('#rzOnb');
    if (!ob) {
      ob = { step: 1, balance: '', date: '', none: false, bills: [], reserve: '' };
      try { var imp = JSON.parse(localStorage.getItem(LS_IMPORT) || 'null'); if (imp && imp.bills) ob.bills = imp.bills.filter(function (b) { return K.posInt(b.amount); }).map(function (b) { return { name: String(b.name || ''), amount: spaced(b.amount), due: '', recurring: true }; }); } catch (e) {}
    }
    var s = ob.step, h = '<div class="rz-ob-top">' + (s > 1 ? '<button type="button" class="rz-x" data-act="obback" aria-label="' + esc(T('back')) + '">' + ico('back') + '</button>' : '<span></span>') + '<div class="rz-dots">' + [1, 2, 3].map(function (i) { return '<i class="' + (i === s ? 'on' : (i < s ? 'done' : '')) + '"></i>'; }).join('') + '</div><span></span></div><div class="rz-ob-body">';
    if (s === 1) h += '<h2 class="rz-q">' + esc(T('o1q')) + '</h2><p class="rz-p">' + esc(T('o1h')) + '</p><label class="rz-f big"><input id="obBal" type="text" inputmode="numeric" data-fmt autocomplete="off" placeholder="' + esc(T('o1ph')) + '" value="' + esc(ob.balance) + '"><small>' + T('sum') + '</small></label>';
    if (s === 2) h += '<h2 class="rz-q">' + esc(T('o2q')) + '</h2><p class="rz-p">' + esc(T('o2h')) + '</p>' + (ob.none ? '' : '<label class="rz-f big"><input id="obDate" type="date" min="' + todayStr() + '" value="' + esc(ob.date) + '"></label>') +
      '<button type="button" class="rz-opt' + (ob.none ? ' on' : '') + '" data-act="obnone"><b>' + esc(T('o2none')) + '</b><span>' + esc(T('o2noneH')) + '</span></button>';
    if (s === 3) {
      h += '<h2 class="rz-q">' + esc(T('o3q')) + '</h2><p class="rz-p">' + esc(T('o3h')) + '</p><div class="rz-chips">' + ['bKredit', 'bIjara', 'bKomm', 'bBogcha', 'bOwn'].map(function (c) { return '<button type="button" class="rz-chip" data-act="obadd" data-n="' + c + '">' + esc(T(c)) + '</button>'; }).join('') + '</div>';
      h += ob.bills.map(function (b, i) { return '<div class="rz-obbill" data-i="' + i + '"><div class="r1"><input class="nm" data-f="name" type="text" maxlength="60" placeholder="' + esc(T('bName')) + '" value="' + esc(b.name) + '"><button type="button" class="rz-x" data-act="obdel" data-i="' + i + '" aria-label="' + esc(T('del')) + '">' + ico('x') + '</button></div><div class="r2"><input data-f="amount" data-fmt type="text" inputmode="numeric" placeholder="' + esc(T('bAmt')) + '" value="' + esc(b.amount) + '"><input data-f="due" type="date" value="' + esc(b.due || defDue()) + '"></div></div>'; }).join('');
      h += '<label class="rz-f"><span>' + esc(T('o3res')) + '</span><input id="obRes" type="text" inputmode="numeric" data-fmt autocomplete="off" placeholder="' + esc(T('o3resPh')) + '" value="' + esc(ob.reserve) + '"></label>';
    }
    h += '</div><div class="rz-ob-foot">' + (s === 3 ? '<button type="button" class="rz-btn ghost" data-act="obfinish">' + esc(T('skip')) + '</button>' : '') + '<button type="button" class="rz-btn primary" data-act="obnext">' + esc(s === 3 ? T('start') : T('next')) + '</button></div>';
    el.innerHTML = h; el.hidden = false; el.classList.remove('out');
    var f = el.querySelector('input'); if (f && s !== 2) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) {} }, 100);
  }
  function obRead() {
    var el = $('#rzOnb');
    if (ob.step === 1 && $('#obBal')) ob.balance = $('#obBal').value;
    if (ob.step === 2 && $('#obDate')) ob.date = $('#obDate').value;
    if (ob.step === 3) { $$('.rz-obbill', el).forEach(function (r) { var b = ob.bills[+r.getAttribute('data-i')]; if (!b) return; b.name = r.querySelector('[data-f=name]').value; b.amount = r.querySelector('[data-f=amount]').value; b.due = r.querySelector('[data-f=due]').value; }); ob.reserve = $('#obRes') ? $('#obRes').value : ob.reserve; }
  }
  function obNext(skipBills) {
    obRead();
    if (ob.step === 1) { if (!digits(ob.balance)) { flash('#obBal'); return; } ob.step = 2; showOnb(); return; }
    if (ob.step === 2) { if (!ob.none && !K.parse(ob.date)) { flash('#obDate'); return; } ob.step = 3; showOnb(); return; }
    var s = K.emptyState(); s.prefs = {}; s.base = K.toInt(ob.balance); s.reserve = skipBills ? 0 : K.posInt(ob.reserve); s.income = { date: ob.none ? null : ob.date, amount: null };
    if (!skipBills) ob.bills.forEach(function (b) { if (K.posInt(b.amount)) K.addBill(s, { name: b.name, amount: b.amount, due: K.parse(b.due) ? b.due : defDue(), recurring: !!b.recurring }); });
    s.setup = true; s.created = Date.now(); st = s; try { localStorage.removeItem(LS_IMPORT); } catch (e) {} ob = null; save();
    var el = $('#rzOnb'); el.classList.add('out');
    setTimeout(function () { el.hidden = true; view = 'today'; render(); window.scrollTo(0, 0); if (location.hash === '#boshlash') history.replaceState(null, '', location.pathname + location.search); }, reduce ? 0 : 220);
  }

  /* ---------- hodisalar ---------- */
  root.addEventListener('click', function (e) {
    var lmenu = $('#rzLangMenu'), el = e.target.closest('[data-act]');
    if (!el) { if (lmenu && !lmenu.hidden && !e.target.closest('.rz-langwrap')) lmenu.hidden = true; return; }
    var a = el.getAttribute('data-act'), id = +el.getAttribute('data-id');
    if (a !== 'langmenu' && lmenu) lmenu.hidden = true;
    switch (a) {
      case 'tab': view = el.getAttribute('data-v'); render(); var mm = $('#rzMain'); if (mm) mm.scrollTop = 0; break;
      case 'add': openExpense(); break;
      case 'key': { var k = el.getAttribute('data-k'); if (k === 'del') ex.amount = ex.amount.slice(0, -1); else if ((ex.amount + k).replace(/^0+/, '').length <= 11) ex.amount = (ex.amount + k).replace(/^0+(?=\d)/, '').replace(/^0$/, ''); exUpdate(); vib(5); break; }
      case 'cat': ex.cat = el.getAttribute('data-c'); $$('.rz-cat').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-c') === ex.cat); }); break;
      case 'day': ex.day = el.getAttribute('data-d'); $$('[data-act=day]').forEach(function (b) { b.classList.toggle('on', b === el); }); break;
      case 'exsave': exSave(); break;
      case 'exdel': exDelete(); break;
      case 'edittx': openExpense(id); break;
      case 'pay': doPay(id); break;
      case 'editbill': openBill(id); break;
      case 'addbill': openBill(); break;
      case 'bsave': bSave(); break;
      case 'bdel': bDelete(); break;
      case 'editreserve': openReserve(); break;
      case 'rssave': st.reserve = K.posInt($('#rsAmt').value); closeSheet(); commit(); toast(T('saved')); break;
      case 'editincome': openIncomeDate(); break;
      case 'idsave': { var d = $('#idDate').value; K.setIncomeDate(st, K.parse(d) ? d : null, $('#idAmt').value); closeSheet(); commit(); toast(T('saved')); break; }
      case 'idclear': K.setIncomeDate(st, null, null); closeSheet(); commit(); toast(T('saved')); break;
      case 'income': openIncome(); break;
      case 'insave': inSave(); break;
      case 'check': openCheck(); break;
      case 'cksave': ckSave(); break;
      case 'whatif': openWhatIf(); break;
      case 'export': doExport(); break;
      case 'import': doImport(); break;
      case 'wipe': wipe(); break;
      case 'hide': { (st.prefs || (st.prefs = {}))['h_' + el.getAttribute('data-k')] = Date.now(); commit(); break; }
      case 'install': { var pw = window.KalkiPwa; if (pw && pw.prompt) pw.prompt(); setTimeout(render, 300); break; }
      case 'font': { var big = el.getAttribute('data-f') === 'b'; document.documentElement.classList.toggle('fs-big', big); try { if (big) localStorage.setItem('kalki_fs', 'big'); else localStorage.removeItem('kalki_fs'); } catch (x) {} render(); break; }
      case 'langmenu': lmenu.hidden = !lmenu.hidden; break;
      case 'lang': { var l = el.getAttribute('data-l'), tgt = document.getElementById(l === 'cyr' ? 'langCyr' : (l === 'ru' ? 'langRu' : 'langUz')); if (tgt) tgt.click(); break; }
      case 'mprev': case 'mnext': { var hm = histMonth || K.monthOf(todayStr()), p = K.parse(hm + '-01'); histMonth = K.monthOf(K.addMonthsDom(K.ymd(p.y, p.m, 1), a === 'mprev' ? -1 : 1, 1)); render(); break; }
      case 'sheetclose': closeSheet(); break;
      case 'undo': { var tt = $('#rzToast'), fn = tt._undo; hideToast(); if (fn) { fn(); vib(10); } break; }
      case 'obnext': obNext(false); break;
      case 'obfinish': ob.step = 3; obNext(true); break;
      case 'obback': obRead(); ob.step = Math.max(1, ob.step - 1); showOnb(); break;
      case 'obnone': obRead(); ob.none = !ob.none; if (ob.none) ob.date = ''; showOnb(); break;
      case 'obadd': { obRead(); var nk = el.getAttribute('data-n'); ob.bills.push({ name: nk === 'bOwn' ? '' : T(nk), amount: '', due: defDue(), recurring: nk !== 'bOwn' }); showOnb(); var rows = $$('.rz-obbill'), last = rows[rows.length - 1]; if (last) last.querySelector(nk === 'bOwn' ? '[data-f=name]' : '[data-f=amount]').focus({ preventScroll: true }); break; }
      case 'obdel': obRead(); ob.bills.splice(+el.getAttribute('data-i'), 1); showOnb(); break;
    }
  });
  root.addEventListener('input', function (e) {
    var t = e.target;
    if (t.hasAttribute && t.hasAttribute('data-fmt')) { var v = spaced(t.value); if (v !== t.value) t.value = v; }
    if (t.id === 'ckAmt') ckInfo(); else if (t.id === 'wiAmt') wiUpdate();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!$('#rzSheet').hidden) closeSheet(); else { var lm = $('#rzLangMenu'); if (lm) lm.hidden = true; } } });
  window.addEventListener('beforeinstallprompt', function () { setTimeout(function () { if (st && st.setup && view === 'today') render(); }, 80); });
  var lastDay = K.today();
  document.addEventListener('visibilitychange', function () { if (!document.hidden && st && st.setup) { var d = K.today(); if (d !== lastDay) { lastDay = d; render(); } } });
  try { new MutationObserver(function () { var scr = document.documentElement.getAttribute('data-script'); if (langNow() !== lang || scr !== root._scr) { root._scr = scr; render(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-lang', 'data-script'] }); } catch (e) {}

  /* ---------- ishga tushirish ---------- */
  function init() {
    st = load(); root._scr = document.documentElement.getAttribute('data-script'); shell();
    try { if ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true) document.body.classList.add('rz-standalone'); } catch (e) {}
    render();
    if (location.hash === '#qoshish' && st.setup) openExpense();
    window.__rozgor = { get state() { return st; }, render: render, K: K };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
