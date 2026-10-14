/* kalki.uz — "Oy oxiri prognozi" (hisoblagich kundaligi): elektr va gaz sahifalari uchun UMUMIY modul.
 *
 * Odam oy davomida hisoblagich ko'rsatkichlarini yozib boradi; modul oy oxiridagi summani, qimmat pog'onaga qachon
 * o'tishini va qancha tejash mumkinligini aytadi.
 *
 * TARIF RAQAMLARI BU YERDA YO'Q: sahifa `tariff()` orqali pog'onama-pog'ona hisob funksiyasini (assets/tarif-core.js
 * asosidagi elektr-tarif.js / gaz-tarif.js) va chegaralarni beradi.
 *
 * SAQLASH: faqat localStorage (serverga hech narsa ketmaydi). Kalit elektr va gaz uchun alohida. Storage ishlamasa
 * (private rejim, taqiqlangan) — sessiya ichida xotirada ishlaydi va "Bu brauzerda saqlab bo'lmadi" deydi.
 *
 * HISOB (joriy hisob davri):
 *   davr boshi   = oxirgi "hisob kuni" (standart 1); davr uzunligi = keyingi hisob kunigacha kunlar
 *   boshlang'ich = davr boshidagi yozuv; yo'q bo'lsa — davr boshidan OLDINGI va KEYINGI yozuvlar orasida chiziqli
 *                  interpolyatsiya; ular ham bo'lmasa — davr ichidagi BIRINCHI yozuv ("taxminiy" belgisi bilan)
 *   shu_paytgacha = oxirgi ko'rsatkich − boshlang'ich;  sur'at = shu_paytgacha / o'tgan kun
 *   prognoz sarf  = shu_paytgacha + sur'at × qolgan kun;  summa = pog'onama-pog'ona
 *   keyingi chegara = prognoz davomida kesib o'tiladigan birinchi pog'ona chegarasi; sana = oxirgi yozuv sanasi + ceil((chegara − shu_paytgacha) / sur'at)
 *   maslahat: kerakli kamaytirish = sur'at − (chegara − shu_paytgacha) / qolgan kun; <= 50% × sur'at bo'lsa
 *             "kuniga X kamaytirsangiz Y so'm tejaysiz" (Y = summa(prognoz) − summa(chegara)), aks holda maslahat yo'q.
 * Sana: faqat kalendar yil/oy/kun (UTC/Date yo'q) — vaqt zonasi natijaga ta'sir qilmaydi; localStorage'da sana "YYYY-MM-DD" satri.
 * Eslatma: "bugun" o'rniga OXIRGI YOZUV sanasi olinadi (ko'rsatkich bugun kiritilgan bo'lsa ikkalasi bir xil;
 * kiritilmagan bo'lsa sur'at va qolgan kunlar eskirgan "bugun"dan emas, haqiqiy o'lchov kunidan hisoblanadi).
 *
 * Brauzerda window.KalkiPrognoz, Node'da require() (sof hisob testlari uchun) — ikkalasida bir xil. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root);
  else root.KalkiPrognoz = factory(root);
})(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';

  /* ======================= SOF HISOB (DOM va storage'siz) ======================= */
  var DAY = 86400000;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  // Sana hisobi FAQAT kalendar raqamlari (yil/oy/kun) bilan: Date obyekti, UTC va vaqt zonasi umuman ishlatilmaydi.
  // (Faqat "bugun" brauzerning mahalliy yil/oy/kun'idan olinadi — todayStr.) Kunlar soni — Hinnant "days from civil" algoritmi.
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function dim(y, m) { return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]; }   // m: 1–12
  function parse(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); if (!m) return null; var y = +m[1], mo = +m[2], d = +m[3]; if (mo < 1 || mo > 12 || d < 1 || d > dim(y, mo)) return null; return { y: y, m: mo, d: d }; }
  function civilToDays(y, m, d) { y -= m <= 2 ? 1 : 0; var era = Math.floor(y / 400), yoe = y - era * 400, doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1, doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy; return era * 146097 + doe - 719468; }
  function daysToCivil(z) { z += 719468; var era = Math.floor(z / 146097), doe = z - era * 146097, yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365), y = yoe + era * 400, doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100)), mp = Math.floor((5 * doy + 2) / 153), d = doy - Math.floor((153 * mp + 2) / 5) + 1, m = mp + (mp < 10 ? 3 : -9); return [y + (m <= 2 ? 1 : 0), m, d]; }
  function toDays(s) { var p = parse(s); return p ? civilToDays(p.y, p.m, p.d) : NaN; }
  function fromDays(n) { var c = daysToCivil(n); return c[0] + '-' + pad(c[1]) + '-' + pad(c[2]); }
  function diff(a, b) { return toDays(b) - toDays(a); }                       // b − a (kun)
  function addDays(s, n) { return fromDays(toDays(s) + n); }
  function clampDay(y, m, bd) { return Math.min(Math.max(1, bd | 0), dim(y, m)); }
  function ymd(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }
  function shiftMonth(y, m, k) { var t = (y * 12 + (m - 1)) + k; return [Math.floor(t / 12), (t % 12 + 12) % 12 + 1]; }

  /* Davr boshi/oxiri (oxiri — KEYINGI davr boshi, o'zi kirmaydi). k — davrni k oyga siljitish (-1 = oldingi). */
  function periodOf(today, billDay, k) {
    var p = parse(today); if (!p) return null;
    var bd = Math.min(Math.max(1, billDay | 0), 31);
    var cur = p.d >= clampDay(p.y, p.m, bd) ? [p.y, p.m] : shiftMonth(p.y, p.m, -1);
    var s = shiftMonth(cur[0], cur[1], k || 0), e = shiftMonth(s[0], s[1], 1);
    var start = ymd(s[0], s[1], clampDay(s[0], s[1], bd)), end = ymd(e[0], e[1], clampDay(e[0], e[1], bd));
    return { start: start, end: end, len: diff(start, end) };
  }

  function sorted(entries) { return entries.filter(function (e) { return parse(e.d) && isFinite(e.v); }).slice().sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; }); }

  /* Sana bo'yicha ko'rsatkich: aynan yozuv bo'lsa o'sha, oldingi va keyingi yozuv orasida bo'lsa interpolyatsiya, aks holda null. */
  function readingAt(entries, date) {
    var prev = null, next = null;
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.d === date) return { v: e.v, exact: true };
      if (e.d < date) prev = e; else if (!next) next = e;
    }
    if (prev && next) return { v: prev.v + (next.v - prev.v) * diff(prev.d, date) / diff(prev.d, next.d), exact: false };
    return null;
  }

  /* opts: { entries, today, billDay, tiers: fn(qty)->{total,rows}, limits: [..., Infinity] } */
  function forecast(opts) {
    var E = sorted(opts.entries || []), today = opts.today, per = periodOf(today, opts.billDay || 1, 0);
    if (!per) return { ok: false, reason: 'few' };
    var inPeriod = E.filter(function (e) { return e.d >= per.start && e.d <= today; });
    var base = readingAt(E.filter(function (e) { return e.d <= today; }), per.start), baseDate = per.start, approx = false, baseVal;
    if (base) baseVal = base.v;
    else if (inPeriod.length) { baseVal = inPeriod[0].v; baseDate = inPeriod[0].d; approx = true; }
    else return { ok: false, reason: 'few', period: per };
    var last = E.filter(function (e) { return e.d <= today; }).pop();
    if (!last || last.d <= baseDate) return { ok: false, reason: 'few', period: per };
    var used = last.v - baseVal, elapsed = diff(baseDate, last.d), rate = used / elapsed;
    var sinceStart = diff(per.start, last.d), remaining = Math.max(0, per.len - sinceStart);
    var unknown = approx ? diff(per.start, baseDate) : 0;           // taxminiy: birinchi yozuvgacha o'tgan kunlar ham sur'atdan baholanadi
    var measured = used;
    if (approx) used = measured + rate * unknown;                   // "shu paytgacha sarf": o'lchangan + davr boshigacha baholangan qism (≈)
    var projected = used + rate * remaining;
    var T = opts.tiers, L = opts.limits, r = { ok: true, period: per, approx: approx, interpolated: !!(base && !base.exact), startVal: baseVal, lastVal: last.v, lastDate: last.d,
      used: used, measured: measured, unknownDays: unknown, elapsed: elapsed, remaining: remaining, rate: rate, projected: projected, total: T(projected).total, avg: projected > 0 ? T(projected).total / projected : 0, cross: null, advice: null, tier: 1 };
    for (var i = 0; i < L.length; i++) if (projected <= L[i]) { r.tier = i + 1; break; }
    if (rate > 0) {
      for (var j = 0; j < L.length - 1; j++) {
        var lim = L[j];
        if (lim >= used && lim < projected) {
          var ahead = Math.max(1, Math.ceil((lim - used) / rate - 1e-9));
          r.cross = { limit: lim, idx: j + 1, daysAhead: ahead, date: addDays(last.d, ahead) };
          if (remaining > 0) {
            var cut = rate - (lim - used) / remaining;
            if (cut > 0 && cut <= 0.5 * rate) r.advice = { cut: cut, save: T(projected).total - T(lim).total, limit: lim };
          }
          break;
        }
      }
    }
    return r;
  }

  /* Oxirgi `count` TO'LIQ davr (yozuvlar yetarli bo'lsa): [{ start, end, used, total, pct (oldingi davrga nisbatan, %) }], eng yangisi birinchi. */
  function pastPeriods(opts, count) {
    var E = sorted(opts.entries || []).filter(function (e) { return e.d <= opts.today; }), out = [];
    for (var k = -1; k >= -24 && out.length < (count || 6); k--) {
      var per = periodOf(opts.today, opts.billDay || 1, k), a = readingAt(E, per.start), b = readingAt(E, per.end);
      if (!a || !b) { if (out.length) break; else continue; }
      var used = b.v - a.v; if (used < 0) continue;
      out.push({ start: per.start, end: per.end, used: used, total: opts.tiers(used).total });
    }
    for (var i = 0; i < out.length; i++) { var o = out[i + 1]; out[i].pct = o && o.used > 0 ? (out[i].used - o.used) / o.used * 100 : null; }
    return out;
  }

  /* Yozuv qo'shishni tekshirish: 'invalid' | 'future' | 'less' (oldingi sanadan kichik / keyingisidan katta) | null */
  function validate(entries, today, d, v) {
    if (!parse(d) || !isFinite(v) || v < 0) return 'invalid';
    if (d > today) return 'future';
    var E = sorted(entries).filter(function (e) { return e.d !== d; });
    for (var i = 0; i < E.length; i++) { if (E[i].d < d && E[i].v > v) return 'less'; if (E[i].d > d && E[i].v < v) return 'less'; }
    return null;
  }

  var core = { parse: parse, diff: diff, addDays: addDays, periodOf: periodOf, readingAt: readingAt, forecast: forecast, pastPeriods: pastPeriods, validate: validate, sorted: sorted };
  if (!root || !root.document) return core;

  /* ============================== BRAUZER QISMI ============================== */
  var doc = root.document;
  var MON = { uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'], ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'] };
  var TX = {
    uz: {
      lead: "", steps: ["Kvitansiyadagi oxirgi ko'rsatkichni yozing.", "Hisoblagichdagi hozirgi raqamni yozing.", "Har 5–7 kunda yangi raqam kiriting — prognoz aniqlashib boradi."], billLine: "Hisob kuni: {n}", billChg: "o'zgartirish",
      startLbl: "Oy boshidagi ko'rsatkich", startHint: "Kvitansiyadagi oxirgi ko'rsatkich yoki oy boshida yozib olgan raqamingiz", curLbl: "Hisoblagichdagi hozirgi raqam", ph: "masalan, 12345",
      dateOn: "Sana: {d}", dateToday: "Sana: bugun, {d}", chg: "sanani o'zgartirish", go: "Oy oxirini hisoblash",
      errBoth: "Ikkala raqamni ham kiriting.", errOrder: "Oy boshi sanasi hozirgi sanadan keyin bo'lishi mumkin emas.", errSame: "Ikkala raqam uchun sana bir xil — oy boshi sanasini o'zgartiring.", errLess2: "Hozirgi raqam oy boshidagi raqamdan kichik bo'lishi mumkin emas — raqamlarni tekshiring. Hisoblagich almashtirilganmi?",
      updLbl: "Bugungi raqam", updBtn: "Yangilash", listSum: "Yozuvlar ({n})", setSum: "Sozlamalar", billDay: "Hisob kuni", billHint: "Oy shu kundan boshlanadi (1–31).", date: "Sana",
      del: "O'chirish", clearAll: "Hammasini o'chirish", sure: "Hamma ko'rsatkichlar o'chiriladi va hisob kuni 1 ga qaytariladi. Davom etasizmi?", yes: "Ha, o'chirish", no: "Bekor qilish",
      privacy: "Ko'rsatkichlar faqat shu qurilmada saqlanadi.", noStore: "Bu brauzerda saqlab bo'lmadi — ko'rsatkichlar faqat shu sessiya ichida turadi.",
      errInvalid: "Sana va ko'rsatkichni to'g'ri kiriting.", errFuture: "Kelajak sanani kiritib bo'lmaydi.", errLess: "Ko'rsatkich oldingi sanadagidan kichik bo'lishi mumkin emas. Hisoblagich almashtirilganmi?", newDiary: "Yangi kundalik boshlang",
      newSure: "Eski yozuvlar o'chiriladi, shu ko'rsatkich yangi kundalikning boshi bo'ladi. Davom etasizmi?", newYes: "Ha, boshlash",
      empty: "Hali yozuv yo'q.", saved: "Saqlandi.", replaced: "Shu sanadagi eski yozuv almashtirildi.",
      need: "Yana bitta ko'rsatkich kiriting", needSub: "Prognoz uchun hisob davrida kamida ikkita ko'rsatkich kerak (yoki davr boshidagi + bitta).",
      approxNote: "taxminiy, davr boshida yozuv yo'q",
      tag: "Oy oxiri prognozi", lbl: "Oy oxirida taxminan", approx: "taxminiy: davr boshidagi ko'rsatkich yo'q, birinchi yozuvdan hisoblandi", interp: "Davr boshidagi ko'rsatkich qo'shni yozuvlar orasidan hisoblandi.",
      kUsed: "Shu paytgacha sarf", kRate: "Kunlik o'rtacha", kProj: "Prognoz sarf", kAvg: "1 {u} o'rtacha narxi", kPeriod: "Hisob davri", kLeft: "Davr oxirigacha", days: "kun",
      warn: "{date} {price} {cur}lik pog'onaga o'tasiz", advice: "Kuniga {x} {u} kamaytirsangiz, shu pog'onada qolasiz va {y} {cur} tejaysiz.", endTier: "Bu oy {n}-pog'onada yakunlaysiz.", noCross: "Joriy sur'atda pog'onadan o'tmaysiz.",
      tierTitle: "Prognoz pog'onalar bo'yicha", past: "O'tgan davrlar", vsPrev: "oldingiga nisbatan",
      barCap: "Strelka — oy oxiridagi prognoz, «hozir» — shu paytgacha sarf. Rangli blokda — pog'ona narxi, pastda — chegara.", barAria: "Prognoz pog'ona chizig'i: oy oxirida taxminan {p} {u}, {n}-pog'ona; hozirgacha {used} {u}.",
      shareTxt: "Oy oxirida taxminan {sum} {cur} ({n}-pog'ona)",
      pwa: "Ilovani o'rnating — keyingi ko'rsatkichni bir bosishda kiritasiz", pwaBtn: "O'rnatish", pwaClose: "Yopish", cur: "so'm"
    },
    ru: {
      lead: "", steps: ["Впишите последнее показание из квитанции.", "Впишите текущее показание счётчика.", "Раз в 5–7 дней вводите новое число — прогноз будет уточняться."], billLine: "День расчёта: {n}", billChg: "изменить",
      startLbl: "Показание на начало месяца", startHint: "Последнее показание из квитанции или число, записанное в начале месяца", curLbl: "Текущее показание счётчика", ph: "например, 12345",
      dateOn: "Дата: {d}", dateToday: "Дата: сегодня, {d}", chg: "изменить дату", go: "Рассчитать конец месяца",
      errBoth: "Введите оба числа.", errOrder: "Дата начала месяца не может быть позже текущей даты.", errSame: "Для обоих чисел дата одинакова — измените дату начала месяца.", errLess2: "Текущее показание не может быть меньше показания на начало месяца — проверьте числа. Счётчик заменили?",
      updLbl: "Сегодняшнее показание", updBtn: "Обновить", listSum: "Записи ({n})", setSum: "Настройки", billDay: "День расчёта", billHint: "Месяц начинается с этого дня (1–31).", date: "Дата",
      del: "Удалить", clearAll: "Удалить всё", sure: "Все показания будут удалены, а день расчёта вернётся к 1. Продолжить?", yes: "Да, удалить", no: "Отмена",
      privacy: "Показания хранятся только на этом устройстве.", noStore: "В этом браузере сохранить не удалось — показания хранятся только в рамках этой сессии.",
      errInvalid: "Введите дату и показание корректно.", errFuture: "Нельзя вводить будущую дату.", errLess: "Показание не может быть меньше показания за более раннюю дату. Счётчик заменили?", newDiary: "Начать новый дневник",
      newSure: "Старые записи будут удалены, это показание станет началом нового дневника. Продолжить?", newYes: "Да, начать",
      empty: "Записей пока нет.", saved: "Сохранено.", replaced: "Прежняя запись за эту дату заменена.",
      need: "Введите ещё одно показание", needSub: "Для прогноза нужно минимум два показания в расчётном периоде (или показание на начало периода + одно).",
      approxNote: "ориентировочно, нет записи на начало периода",
      tag: "Прогноз на конец месяца", lbl: "К концу месяца примерно", approx: "ориентировочно: нет показания на начало периода, расчёт от первой записи", interp: "Показание на начало периода рассчитано по соседним записям.",
      kUsed: "Расход на данный момент", kRate: "В среднем в день", kProj: "Прогноз расхода", kAvg: "Средняя цена 1 {u}", kPeriod: "Расчётный период", kLeft: "До конца периода", days: "дн.",
      warn: "{date} вы перейдёте на ступень по {price} {cur}", advice: "Если сократить на {x} {u} в день, останетесь на этой ступени и сэкономите {y} {cur}.", endTier: "В этом месяце вы закончите на {n}-й ступени.", noCross: "При текущем темпе вы не перейдёте на другую ступень.",
      tierTitle: "Прогноз по ступеням", past: "Прошлые периоды", vsPrev: "к предыдущему",
      barCap: "Стрелка — прогноз на конец месяца, «сейчас» — расход на данный момент. Цветной блок — цена ступени, внизу — граница.", barAria: "Шкала ступеней прогноза: к концу месяца примерно {p} {u}, {n}-я ступень; на данный момент {used} {u}.",
      shareTxt: "К концу месяца примерно {sum} {cur} ({n}-я ступень)",
      pwa: "Установите приложение — следующее показание вводится в одно касание", pwaBtn: "Установить", pwaClose: "Закрыть", cur: "сум"
    }
  };
  var NBSP = String.fromCharCode(160);
  var fmt = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP); };
  var fmt1 = function (x) { var r = Math.round(x * 10) / 10, p = String(r).split('.'); return fmt(parseInt(p[0], 10)) + (p[1] ? ',' + p[1] : ''); };
  var esc = function (x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  function todayStr() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function lang() { return doc.documentElement.lang === 'ru' ? 'ru' : 'uz'; }
  function dateTxt(s) { var p = parse(s), L = lang(); return L === 'ru' ? p.d + ' ' + MON.ru[p.m - 1] : p.d + '-' + MON.uz[p.m - 1]; }
  function dateLoc(s) { var p = parse(s); if (lang() === 'ru') return p.d + ' ' + MON.ru[p.m - 1]; return p.d + '-' + MON.uz[p.m - 1] + 'da'; }

  var CSS = '.pg-box{margin-top:2px}.pg-lead{font-size:13.5px;line-height:1.4;color:#33403A;font-weight:600;margin:0 0 12px}'
    + '.pg-box input[type=date]{flex:1;border:0;outline:0;background:transparent;font:inherit;font-size:16px;font-weight:700;color:var(--ink,#16211C);padding:10px;min-width:0}'
    + '.pg-steps{margin:0 0 14px;padding:0;list-style:none;counter-reset:pgs}.pg-steps li{counter-increment:pgs;display:flex;gap:10px;align-items:flex-start;font-size:15px;line-height:1.4;font-weight:600;color:#33403A;margin:0 0 8px}.pg-steps li::before{content:counter(pgs);flex:none;width:26px;height:26px;border-radius:50%;background:var(--cat,#1D4E6B);color:#fff;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;margin-top:-1px}'
    + '.pg-hint{font-size:12px;line-height:1.35;color:var(--muted,#5C6B63);margin:5px 0 0}.pg-dline{font-size:12px;color:var(--muted,#5C6B63);margin:4px 0 0}'
    + '.pg-link{border:0;background:none;padding:0;font:inherit;font-size:12px;font-weight:700;color:var(--cat,#1D4E6B);text-decoration:underline;cursor:pointer}'
    + '.pg-msg{font-size:12.5px;font-weight:700;margin:2px 0 8px;min-height:0}.pg-msg:empty{display:none}.pg-msg.err{color:#B04A3A}.pg-msg.ok{color:#1E6B45}'
    + '.pg-btn{border:1.5px solid var(--cat,#1D4E6B);background:#fff;color:var(--cat,#1D4E6B);font:inherit;font-size:14px;font-weight:800;padding:10px 14px;border-radius:10px;cursor:pointer;min-height:44px}.pg-btn.pri{background:var(--cat,#1D4E6B);color:#fff}.pg-btn.danger{border-color:#B04A3A;color:#B04A3A}'
    + '.pg-upd{display:flex;gap:8px;align-items:stretch}.pg-upd .input-shell{flex:1;min-width:0}.pg-lbl{display:block;font-size:12.5px;font-weight:700;color:var(--muted,#5C6B63);margin:0 0 5px}'
    + '.pg-det{border:1px solid var(--line,#DDE5E0);border-radius:10px;margin:8px 0;background:#FBFCFB}.pg-det>summary{cursor:pointer;font-size:13.5px;font-weight:700;color:#33403A;padding:10px 12px;list-style:none;min-height:44px;display:flex;align-items:center}.pg-det>summary::-webkit-details-marker{display:none}.pg-det>summary::after{content:"▾";margin-left:auto;color:#5C6B63}.pg-det[open]>summary::after{content:"▴"}.pg-det>div{padding:0 12px 12px}'
    + '.pg-list{margin:0 0 8px;padding:0;list-style:none}.pg-list li{display:flex;align-items:center;gap:8px;padding:6px 4px 6px 10px;border:1px solid var(--line,#DDE5E0);border-radius:9px;margin-bottom:6px;font-size:14px;font-weight:700;background:#fff}'
    + '.pg-list .d{flex:1;color:#33403A}.pg-list .v{font-variant-numeric:tabular-nums}.pg-x{border:0;background:transparent;color:#B04A3A;font:inherit;font-size:18px;line-height:1;width:44px;height:44px;cursor:pointer;border-radius:8px}'
    + '.pg-note{font-size:11.5px;color:var(--muted,#5C6B63);margin:8px 0 0}.pg-confirm{background:#FBF3E6;border:1px solid #EFDCBB;border-radius:10px;padding:10px 12px;margin:8px 0;font-size:13.5px;font-weight:700;color:#3E3212}.pg-confirm .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}'
    + '.pg-set{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap}.pg-set .fld{width:130px}.pg-set p{flex:1 1 140px;margin:0}'
    + '.pg-pwa{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;background:var(--cat-soft,#E8F1F6);border-radius:10px;padding:10px 12px;margin:10px 0;font-size:13.5px;font-weight:700;color:var(--cat,#1D4E6B)}.pg-pwa span{flex:1 1 200px}'
    + '.pg-blk{border-radius:10px;padding:10px 12px;margin:10px 0;font-size:14px;font-weight:700;line-height:1.45}.pg-warn{background:#FFF1E0;color:#6B3200;border:1px solid #F0C48A}.pg-tip{background:#E7F3EC;color:#14452B;border:1px solid #B7DAC5}.pg-info{background:rgba(255,255,255,.08);color:#D2E0D8;font-weight:600;font-size:13px}.pg-need{background:#F2F5F3;color:#33403A;font-weight:600;font-size:13px;margin:0 0 10px}'
    + '.pg-bline{margin:-4px 0 12px}.pg-approx{display:block;font-size:13px;font-weight:500;opacity:.85;margin-top:2px}'
    + '.pg-past .rrow .k small{display:block;font-size:11px;opacity:.75;margin-top:2px}'
    // Prognoz rejimida joyni tejash: ixcham oraliqlar, izohlar yig'iq (ⓘ), bo'sh natija kartasi yo'q
    + '.g-prog .form-card{padding:14px 14px 16px;margin-top:10px}.g-prog .field{margin-bottom:10px}.g-prog .form-card label{margin-bottom:5px}'
    + '.g-prog .seg{padding:3px;gap:3px}.g-prog .seg button{padding:7px 4px;font-size:12.5px;line-height:1.2}.g-prog #modeSeg{grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr)}.g-prog #modeSeg button{padding:7px 1px;font-size:11.5px;letter-spacing:-.1px;overflow-wrap:break-word;min-width:0}.g-prog #catSeg,.g-prog #seasonSeg{grid-template-columns:repeat(2,1fr)}'
    + '.g-prog #modeLbl{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;margin:0}'
    + '#modeSeg{grid-template-columns:repeat(2,1fr)}@media (max-width:360px){.g-prog #modeSeg{grid-auto-flow:row;grid-template-columns:repeat(2,1fr)}}'
    + '.g-prog .form-card label{font-size:12.5px}.g-prog .form-card .input-shell input{padding:9px 12px}.g-prog .form-card .calc-btn{padding:12px 14px;font-size:16px;margin-top:4px}.g-prog .pg-lead{font-size:13px;margin-bottom:8px}'
    + '.g-prog .hint-c{display:none}.g-prog .hint-c.open{display:block}.ibrow{display:none;gap:16px;flex-wrap:wrap;margin-top:4px}.g-prog .ibrow{display:flex}'
    + '.ib{border:0;background:none;color:var(--cat,#1D4E6B);font:inherit;font-size:12.5px;font-weight:700;text-decoration:underline;cursor:pointer;padding:4px 0;min-height:32px}'
    + '.mode-tip{font-size:15px;line-height:1.45;color:#46544C;margin:8px 0 0;font-weight:500}.g-prog .mode-tip{display:none}'
    + '.g-prog .receipt{scroll-margin-top:72px}.calc-grid.g-nores .res-col{display:none!important}';
  // prerender (jsdom) HTML'ga CSS yozib qo'ymasin; brauzerda mavjud <style> bo'lsa ham yangilanadi
  function addCss() { if (/jsdom/i.test((root.navigator || {}).userAgent || '')) return; var s = doc.getElementById('prognozcss') || doc.createElement('style'); s.id = 'prognozcss'; s.textContent = CSS; if (!s.parentNode) doc.head.appendChild(s); }

  /* ------- Storage ------- */
  function makeStore(key) {
    var mem = { entries: [], billDay: 1 }, okFlag = true;
    function load() {
      var raw = null;
      try { raw = root.localStorage.getItem(key); } catch (e) { okFlag = false; }
      if (raw) { try { var o = JSON.parse(raw); if (o && Array.isArray(o.entries)) { mem.entries = sorted(o.entries.map(function (e) { return { d: e.d, v: Number(e.v) }; })); mem.billDay = Math.min(31, Math.max(1, parseInt(o.billDay, 10) || 1)); } } catch (e2) {} }
      try { root.localStorage.setItem(key + '_probe', '1'); root.localStorage.removeItem(key + '_probe'); } catch (e3) { okFlag = false; }
    }
    function save() { try { root.localStorage.setItem(key, JSON.stringify({ entries: mem.entries, billDay: mem.billDay })); } catch (e) { okFlag = false; } }
    load();
    return { get: function () { return mem; }, save: save, ok: function () { return okFlag; } };
  }

  /* ------- UI ------- */
  /* init({ key, form, after, grid, result:{tag,mainNum,lbl,rows,tiers,tiersTitle,extra,bar,pastBox}, unit:{uz,ru},
   *        tariff: fn() -> { tiers(q), limits, prices, bar:[{from,to,price}] }, setShown(bool), onChange })
   *  form  — forma kartasi ichidagi konteyner (BIRINCHI KIRISH: 2 maydon, yoki ma'lumot yetmaganda ixcham panel)
   *  after — natija kartasi ostidagi konteyner (KEYINGI KIRISHLAR: bitta qator + yig'iq ro'yxat/sozlamalar)
   *  grid  — .calc-grid: `g-prog` (prognoz rejimi) va `g-nores` (natija kartasi yo'q) sinflari shu yerga qo'yiladi */
  function init(o) {
    addCss();
    var store = makeStore(o.key), st = store.get(), active = false, R = o.result, form = o.form;
    var ui = { err: '', dB: false, dS: false, dC: false, dU: false, confirmAll: false, confirmNew: false, lessEntry: null, pwa: false, listOpen: false, setOpen: false, info: '' };
    var unit = function () { return o.unit[lang()]; };
    var t = function (k) { return TX[lang()][k]; };
    var $ = function (id) { return doc.getElementById(id); };
    function ctx() { return o.tariff(); }
    function compute() { var c = ctx(); return { c: c, f: forecast({ entries: st.entries, today: todayStr(), billDay: st.billDay, tiers: c.tiers, limits: c.limits }) }; }
    function changed() { if (o.onChange) o.onChange(); }
    function numIn(s) { return parseFloat(String(s).replace(new RegExp(NBSP, 'g'), '').replace(/\s/g, '').replace(',', '.')); }
    function setErr(text) { ui.err = text; var e = $('pgMsg'); if (e) { e.textContent = text; e.className = 'pg-msg' + (text ? ' err' : ''); } }
    function clearErrOnInput(ids) { ids.forEach(function (id) { var e = $(id); if (e) e.addEventListener('input', function () { if (ui.err) setErr(''); }); }); }

    /* ---- BIRINCHI KIRISH: 2 maydon ---- */
    function dateLine(d, isToday, key, shown) {
      var L = TX[lang()];
      return '<p class="pg-dline">' + esc((isToday ? L.dateToday : L.dateOn).replace('{d}', dateTxt(d))) + ' · <button type="button" class="pg-link" id="' + key + 'Chg">' + esc(L.chg) + '</button></p>'
        + (shown ? '<div class="input-shell" style="margin-top:6px"><input type="date" id="' + key + 'D" value="' + d + '" max="' + todayStr() + '"></div>' : '');
    }
    function stepsHtml() { var L = TX[lang()]; return '<ol class="pg-steps" id="pgSteps">' + L.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>'; }
    // Hisob kuni 1 dan boshqa bo'lsa — birinchi kirishda ham KO'RINADI (sukut bo'yicha oy boshi shunga qarab hisoblanadi)
    function billLine() {
      if (st.billDay === 1 && !ui.dB) return '';
      var L = TX[lang()];
      return '<p class="pg-dline pg-bline" id="pgBLine">' + esc(L.billLine.replace('{n}', st.billDay)) + ' · <button type="button" class="pg-link" id="pgBChg">' + esc(L.billChg) + '</button></p>'
        + (ui.dB ? '<div class="input-shell" style="margin:0 0 12px;max-width:140px"><input type="text" id="pgB1" inputmode="numeric" value="' + st.billDay + '" autocomplete="off"></div>' : '');
    }
    function drawFirst() {
      var L = TX[lang()], today = todayStr(), sd = ui.sDate || periodOf(today, st.billDay, 0).start, cd = ui.cDate || today;
      form.innerHTML = '<div class="pg-box">' + stepsHtml() + billLine()
        + '<div class="field"><label for="pgS">' + esc(L.startLbl) + '</label><div class="input-shell"><input type="text" id="pgS" inputmode="decimal" autocomplete="off" placeholder="' + esc(L.ph) + '" value="' + esc(ui.sVal || '') + '"><span class="unit">' + esc(unit()) + '</span></div>'
        + dateLine(sd, false, 'pgS', ui.dS) + '</div>'
        + '<div class="field"><label for="pgC">' + esc(L.curLbl) + '</label><div class="input-shell"><input type="text" id="pgC" inputmode="decimal" autocomplete="off" placeholder="' + esc(L.ph) + '" value="' + esc(ui.cVal || '') + '"><span class="unit">' + esc(unit()) + '</span></div>'
        + dateLine(cd, cd === today, 'pgC', ui.dC) + '</div>'
        + '<div class="pg-msg' + (ui.err ? ' err' : '') + '" id="pgMsg" role="alert">' + esc(ui.err) + '</div>'
        + '<button type="button" class="calc-btn" id="pgGo">' + esc(L.go) + '</button>'
        + '<p class="pg-note" id="pgPriv">' + esc(L.privacy) + (store.ok() ? '' : ' ' + esc(L.noStore)) + '</p></div>';
      after_().innerHTML = '';
      $('pgSChg').onclick = function () { keepVals(); ui.dS = true; drawFirst(); };
      var bc = $('pgBChg'); if (bc) bc.onclick = function () { keepVals(); ui.dB = true; drawFirst(); };
      var b1 = $('pgB1'); if (b1) b1.addEventListener('change', function () { keepVals(); var v = parseInt(String(this.value).replace(/\D/g, ''), 10); st.billDay = Math.min(31, Math.max(1, v || 1)); store.save(); ui.dB = false; ui.sDate = null; drawFirst(); changed(); });
      $('pgCChg').onclick = function () { keepVals(); ui.dC = true; drawFirst(); };
      clearErrOnInput(['pgS', 'pgC', 'pgSD', 'pgCD']);
      var onEnter = function (e) { if (e.key === 'Enter') { e.preventDefault(); $('pgGo').click(); } };
      $('pgS').addEventListener('keydown', onEnter); $('pgC').addEventListener('keydown', onEnter);
      $('pgGo').onclick = go;
    }
    function keepVals() { ui.sVal = $('pgS').value; ui.cVal = $('pgC').value; if ($('pgSD')) ui.sDate = $('pgSD').value; if ($('pgCD')) ui.cDate = $('pgCD').value; }
    function go() {
      keepVals(); var today = todayStr(), d1 = $('pgSD') ? $('pgSD').value : (ui.sDate || periodOf(today, st.billDay, 0).start), d2 = $('pgCD') ? $('pgCD').value : (ui.cDate || today);
      var v1 = ui.sVal.trim() === '' ? NaN : numIn(ui.sVal), v2 = ui.cVal.trim() === '' ? NaN : numIn(ui.cVal);
      if (!isFinite(v1) || !isFinite(v2) || v1 < 0 || v2 < 0) return setErr(t('errBoth'));
      if (!parse(d1) || !parse(d2)) return setErr(t('errInvalid'));
      if (d2 > today || d1 > today) return setErr(t('errFuture'));
      if (d1 > d2) return setErr(t('errOrder'));
      if (d1 === d2) { ui.dS = true; drawFirst(); return setErr(t('errSame')); }
      if (v2 < v1) return setErr(t('errLess2'));
      st.entries = sorted([{ d: d1, v: v1 }, { d: d2, v: v2 }]); store.save();
      ui.err = ''; ui.sVal = ui.cVal = ''; ui.sDate = ui.cDate = null; ui.dS = ui.dC = false; maybePwa();
      render(); changed();
      var rc = $('receipt'); if (rc && rc.scrollIntoView) { try { rc.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { rc.scrollIntoView(); } }
    }

    /* ---- KEYINGI KIRISHLAR: bitta qator + yig'iq ro'yxat/sozlamalar ---- */
    function drawPanel(target, f) {
      var L = TX[lang()], today = todayStr(), list = st.entries.slice().reverse();
      var h = '<div class="pg-box">' + (!f.ok ? stepsHtml() + '<div class="pg-blk pg-need" id="pgNeed"><b>' + esc(L.need) + '</b><br>' + esc(L.needSub) + '</div>' : '')
        + '<label class="pg-lbl" for="pgVal">' + esc(L.updLbl) + '</label>'
        + '<div class="pg-upd"><div class="input-shell"><input type="text" id="pgVal" inputmode="decimal" autocomplete="off" placeholder="' + esc(L.ph) + '"><span class="unit">' + esc(unit()) + '</span></div><button type="button" class="pg-btn pri" id="pgSave">' + esc(L.updBtn) + '</button></div>'
        + '<p class="pg-dline">' + esc(L.dateToday.replace('{d}', dateTxt(today))) + ' · <button type="button" class="pg-link" id="pgUChg">' + esc(L.chg) + '</button></p>'
        + (ui.dU ? '<div class="input-shell" style="margin:6px 0"><input type="date" id="pgDate" value="' + today + '" max="' + today + '"></div>' : '')
        + '<div class="pg-msg' + (ui.err ? ' err' : '') + '" id="pgMsg" role="alert">' + esc(ui.err) + '</div>'
        + (ui.lessEntry && !ui.confirmNew ? '<button type="button" class="pg-btn danger" id="pgNew">' + esc(L.newDiary) + '</button>' : '')
        + (ui.confirmNew ? '<div class="pg-confirm" id="pgNewConf" role="alertdialog"><div>' + esc(L.newSure) + '</div><div class="row"><button type="button" class="pg-btn danger" id="pgNewYes">' + esc(L.newYes) + '</button><button type="button" class="pg-btn" id="pgNewNo">' + esc(L.no) + '</button></div></div>' : '')
        + '<details class="pg-det" id="pgListDet"' + (ui.listOpen ? ' open' : '') + '><summary>' + esc(L.listSum.replace('{n}', st.entries.length)) + '</summary><div>';
      if (!list.length) h += '<p class="pg-note">' + esc(L.empty) + '</p>';
      else {
        h += '<ul class="pg-list" id="pgList">';
        list.slice(0, 12).forEach(function (e) { h += '<li><span class="d">' + esc(dateTxt(e.d)) + ' <small style="color:#5C6B63;font-weight:600">' + esc(e.d) + '</small></span><span class="v">' + fmt1(e.v) + ' ' + esc(unit()) + '</span><button type="button" class="pg-x" data-del="' + esc(e.d) + '" aria-label="' + esc(L.del) + ' ' + esc(e.d) + '">✕</button></li>'; });
        h += '</ul>';
        if (ui.confirmAll) h += '<div class="pg-confirm" id="pgConf" role="alertdialog"><div>' + esc(L.sure) + '</div><div class="row"><button type="button" class="pg-btn danger" id="pgYes">' + esc(L.yes) + '</button><button type="button" class="pg-btn" id="pgNo">' + esc(L.no) + '</button></div></div>';
        else h += '<button type="button" class="pg-btn" id="pgClear">' + esc(L.clearAll) + '</button>';
      }
      h += '</div></details><details class="pg-det" id="pgSetDet"' + (ui.setOpen ? ' open' : '') + '><summary>' + esc(L.setSum) + '</summary><div><div class="pg-set"><div class="fld"><label for="pgBill" class="pg-lbl">' + esc(L.billDay) + '</label><div class="input-shell"><input type="text" id="pgBill" inputmode="numeric" value="' + st.billDay + '" autocomplete="off"></div></div><p class="pg-note">' + esc(L.billHint) + '</p></div></div></details>'
        + '<p class="pg-note" id="pgPriv">' + esc(L.privacy) + (store.ok() ? '' : ' ' + esc(L.noStore)) + '</p><div id="pgPwa"></div></div>';
      target.innerHTML = h;
      if (target === after_()) form.innerHTML = '';
      bindPanel();
      if (ui.pwa) drawPwa();
    }
    function after_() { return o.after || form; }
    function bindPanel() {
      $('pgSave').onclick = function () { var raw = $('pgVal').value, d = $('pgDate') ? $('pgDate').value : todayStr(); add(d, raw.trim() === '' ? NaN : numIn(raw)); };
      $('pgVal').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('pgSave').click(); } });
      clearErrOnInput(['pgVal', 'pgDate']);
      $('pgUChg').onclick = function () { ui.dU = true; render(); };
      $('pgBill').addEventListener('input', function () { var v = parseInt(String(this.value).replace(/\D/g, ''), 10); if (!(v >= 1 && v <= 31)) return; st.billDay = v; store.save(); var s2 = compute(); if (s2.f.ok) { showResult(true); renderResult(s2); } else render(); changed(); });
      $('pgBill').addEventListener('change', function () { var v = parseInt(String(this.value).replace(/\D/g, ''), 10); st.billDay = Math.min(31, Math.max(1, v || 1)); this.value = st.billDay; store.save(); render(); changed(); });
      $('pgListDet').addEventListener('toggle', function () { ui.listOpen = this.open; });
      $('pgSetDet').addEventListener('toggle', function () { ui.setOpen = this.open; });
      var nb = $('pgNew'); if (nb) nb.onclick = function () { ui.confirmNew = true; render(); };
      var ny = $('pgNewYes'); if (ny) ny.onclick = function () { var e = ui.lessEntry; st.entries = e ? [{ d: e.d, v: e.v }] : []; store.save(); ui.lessEntry = null; ui.confirmNew = false; ui.err = ''; render(); changed(); };
      var nn = $('pgNewNo'); if (nn) nn.onclick = function () { ui.confirmNew = false; render(); };
      var ls = $('pgList'); if (ls) ls.addEventListener('click', function (ev) { var b = ev.target.closest ? ev.target.closest('[data-del]') : null; if (!b) return; var d = b.getAttribute('data-del'); st.entries = st.entries.filter(function (e) { return e.d !== d; }); store.save(); ui.err = ''; render(); changed(); });
      var cl = $('pgClear'); if (cl) cl.onclick = function () { ui.confirmAll = true; ui.listOpen = true; render(); };
      var no = $('pgNo'); if (no) no.onclick = function () { ui.confirmAll = false; render(); };
      var ye = $('pgYes'); if (ye) ye.onclick = function () { st.entries = []; st.billDay = 1; store.save(); ui.confirmAll = false; ui.err = ''; ui.listOpen = false; render(); changed(); };
    }

    function add(d, v) {
      var err = validate(st.entries, todayStr(), d, v);
      if (err) { ui.lessEntry = err === 'less' ? { d: d, v: v } : null; ui.err = t(err === 'invalid' ? 'errInvalid' : err === 'future' ? 'errFuture' : 'errLess'); render(); return false; }
      ui.lessEntry = null; ui.err = ''; ui.dU = false;
      st.entries = sorted(st.entries.filter(function (e) { return e.d !== d; }).concat([{ d: d, v: v }]));
      store.save();
      if (st.entries.length >= 2) maybePwa();
      render(); changed();
      return true;
    }

    /* ---- PWA yumshoq taklif: 2-yozuvdan keyin, o'rnatilmagan bo'lsa, bir marta yopilsa 30 kun ko'rsatilmaydi ---- */
    var PWA_KEY = 'kalki_prog_pwa';
    function maybePwa() {
      var api = root.KalkiPwa; if (!api || api.installed) return;
      if (!(api.canPrompt() || api.ios)) return;
      var ts = 0; try { ts = parseInt(root.localStorage.getItem(PWA_KEY), 10) || 0; } catch (e) {}
      if (ts && Date.now() - ts < 30 * DAY) return;
      ui.pwa = true;
    }
    function drawPwa() {
      var box = $('pgPwa'); if (!box) return; var api = root.KalkiPwa, L = TX[lang()];
      box.innerHTML = '<div class="pg-pwa" id="pgPwaBox"><span>' + esc(L.pwa) + (api && api.ios && !api.canPrompt() ? '<br><small>' + esc(api.iosHint()) + '</small>' : '') + '</span>'
        + (api && api.canPrompt() ? '<button type="button" class="pg-btn pri" id="pgPwaGo">' + esc(L.pwaBtn) + '</button>' : '') + '<button type="button" class="pg-btn" id="pgPwaX">' + esc(L.pwaClose) + '</button></div>';
      var close = function () { ui.pwa = false; try { root.localStorage.setItem(PWA_KEY, String(Date.now())); } catch (e) {} box.innerHTML = ''; };
      $('pgPwaX').onclick = close;
      var gob = $('pgPwaGo'); if (gob) gob.onclick = function () { api.prompt(); close(); };
    }

    /* ---- Natija ---- */
    function row(k, v, extra) { return '<div class="rrow"><span class="k">' + k + (extra || '') + '</span><span class="v">' + v + '</span></div>'; }
    function summaryText() { var s = compute(); if (!s.f.ok) return ''; return TX[lang()].shareTxt.replace('{sum}', fmt(s.f.total)).replace('{cur}', t('cur')).replace('{n}', s.f.tier); }
    function renderResult(s) {
      var L = TX[lang()], f = s.f, cur = ' ' + L.cur, u = unit();
      R.tag.textContent = L.tag; R.lbl.textContent = L.lbl; R.mainNum.textContent = fmt(f.total) + cur;
      var h = row(esc(L.kUsed), (f.approx ? '≈' : '') + fmt1(f.used) + ' ' + esc(u) + (f.approx ? '<small class="pg-approx">(' + esc(L.approxNote) + ')</small>' : '')) + row(esc(L.kRate), fmt1(f.rate) + ' ' + esc(u)) + row(esc(L.kProj), fmt1(f.projected) + ' ' + esc(u)) + row(esc(L.kAvg.replace('{u}', u)), fmt(f.avg) + cur);
      h += row(esc(L.kPeriod), esc(dateTxt(f.period.start) + ' – ' + dateTxt(addDays(f.period.end, -1)))) + row(esc(L.kLeft), f.remaining + ' ' + esc(L.days));
      R.rows.innerHTML = h;
      var th = '', T = s.c.tiers(f.projected);
      for (var j = 0; j < T.rows.length; j++) { var r = T.rows[j]; th += '<div class="rrow"><span class="k">' + (r.to === Infinity ? fmt(r.from) + '+' : fmt(r.from) + '–' + fmt(r.to)) + ' ' + esc(u) + '<span class="fx">' + fmt1(r.qty != null ? r.qty : (r.kwh != null ? r.kwh : r.m3)) + ' × ' + fmt(r.price) + cur + '</span></span><span class="v">' + fmt(r.cost) + cur + '</span></div>'; }
      R.tiers.innerHTML = th; if (R.tiersTitle) { R.tiersTitle.hidden = false; R.tiersTitle.textContent = L.tierTitle; }
      var ex = '';
      if (f.approx) ex += '<div class="pg-blk pg-info">' + esc(L.approx) + '</div>'; else if (f.interpolated) ex += '<div class="pg-blk pg-info">' + esc(L.interp) + '</div>';
      if (f.cross) ex += '<div class="pg-blk pg-warn" id="pgWarn">' + esc(L.warn.replace('{date}', dateLoc(f.cross.date)).replace('{price}', fmt(s.c.prices ? s.c.prices[f.cross.idx] : 0)).replace('{cur}', L.cur)) + '</div>';
      if (f.advice) ex += '<div class="pg-blk pg-tip" id="pgTip">' + esc(L.advice.replace('{x}', fmt1(f.advice.cut)).replace('{u}', u).replace('{y}', fmt(f.advice.save)).replace('{cur}', L.cur)) + '</div>';
      else ex += '<div class="pg-blk pg-info" id="pgTier">' + esc(L.endTier.replace('{n}', f.tier)) + (f.cross ? '' : ' ' + esc(L.noCross)) + '</div>';
      R.extra.innerHTML = ex; R.bar.innerHTML = '';
      if (root.KalkiTierBar && s.c.bar) root.KalkiTierBar.render(R.bar, { tiers: s.c.bar, value: f.projected, valueLabel: fmt1(f.projected) + ' ' + u, mark: { value: f.used, label: lang() === 'ru' ? 'сейчас' : 'hozir' }, caption: L.barCap,
        ariaLabel: L.barAria.replace('{p}', fmt1(f.projected)).replace(/\{u\}/g, u).replace('{n}', f.tier).replace('{used}', fmt1(f.used)) });
      var pp = pastPeriods({ entries: st.entries, today: todayStr(), billDay: st.billDay, tiers: s.c.tiers }, 6), pb = '';
      if (pp.length) {
        pb = '<div class="tier-title">' + esc(L.past) + '</div><div class="receipt-rows pg-past">';
        pp.forEach(function (p) { pb += row(esc(dateTxt(p.start)) + ' – ' + esc(dateTxt(addDays(p.end, -1))), fmt(p.total) + cur, '<small>' + fmt1(p.used) + ' ' + esc(u) + (p.pct != null ? ' · ' + (p.pct >= 0 ? '+' : '−') + fmt(Math.abs(p.pct)) + '% ' + esc(L.vsPrev) : '') + '</small>'); });
        pb += '</div>';
      }
      if (R.pastBox) R.pastBox.innerHTML = pb;
    }
    function showResult(v) { if (o.grid) o.grid.classList.toggle('g-nores', !v); if (o.setShown) o.setShown(!!v); }

    function render() {
      if (!active) return;
      var s = compute(), has = st.entries.length > 0;
      if (!has) { drawFirst(); if (o.after) o.after.innerHTML = ''; showResult(false); return; }
      if (s.f.ok) { showResult(true); renderResult(s); drawPanel(after_(), s.f); }
      else { drawPanel(form, s.f); if (o.after) o.after.innerHTML = ''; showResult(false); }
    }

    return {
      setActive: function (a) {
        active = !!a;
        if (o.grid) { o.grid.classList.toggle('g-prog', active); if (!active) o.grid.classList.remove('g-nores'); }
        if (active) render(); else { form.innerHTML = ''; if (o.after) o.after.innerHTML = ''; }
      },
      refresh: function () { render(); }, render: render, summary: summaryText, hasEntries: function () { return st.entries.length > 0; }, state: function () { return st; }, storageOk: function () { return store.ok(); }, add: add
    };
  }

  core.init = init; core.todayStr = todayStr;
  return core;
});
