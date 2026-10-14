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
  function parse(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); if (!m) return null; var y = +m[1], mo = +m[2], d = +m[3]; var t = Date.UTC(y, mo - 1, d); var x = new Date(t); if (x.getUTCFullYear() !== y || x.getUTCMonth() !== mo - 1 || x.getUTCDate() !== d) return null; return { y: y, m: mo, d: d, t: t }; }
  function toDays(s) { var p = parse(s); return p ? Math.round(p.t / DAY) : NaN; }
  function fromDays(n) { var x = new Date(n * DAY); return x.getUTCFullYear() + '-' + pad(x.getUTCMonth() + 1) + '-' + pad(x.getUTCDate()); }
  function diff(a, b) { return toDays(b) - toDays(a); }                       // b − a (kun)
  function addDays(s, n) { return fromDays(toDays(s) + n); }
  function dim(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }       // m: 1–12
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
    var projected = used + rate * (remaining + unknown);
    var T = opts.tiers, L = opts.limits, r = { ok: true, period: per, approx: approx, interpolated: !!(base && !base.exact), startVal: baseVal, lastVal: last.v, lastDate: last.d,
      used: used, elapsed: elapsed, remaining: remaining, rate: rate, projected: projected, total: T(projected).total, avg: projected > 0 ? T(projected).total / projected : 0, cross: null, advice: null, tier: 1 };
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
      title: "Hisoblagich kundaligi", date: "Sana", val: "Ko'rsatkich", save: "Saqlash", billDay: "Hisob kuni", billHint: "Oy shu kundan boshlanadi (1–31).",
      listTitle: "Oxirgi yozuvlar", del: "O'chirish", clearAll: "Hammasini o'chirish", sure: "Hamma ko'rsatkichlar o'chiriladi. Davom etasizmi?", yes: "Ha, o'chirish", no: "Bekor qilish",
      privacy: "Ko'rsatkichlar faqat shu qurilmada saqlanadi.", noStore: "Bu brauzerda saqlab bo'lmadi — ko'rsatkichlar faqat shu sessiya ichida turadi.",
      errInvalid: "Sana va ko'rsatkichni to'g'ri kiriting.", errFuture: "Kelajak sanani kiritib bo'lmaydi.", errLess: "Ko'rsatkich oldingi sanadagidan kichik bo'lishi mumkin emas. Hisoblagich almashtirilganmi?", newDiary: "Yangi kundalik boshlang",
      empty: "Hali yozuv yo'q.", saved: "Saqlandi.", replaced: "Shu sanadagi eski yozuv almashtirildi.",
      need: "Yana bitta ko'rsatkich kiriting", needSub: "Prognoz uchun hisob davrida kamida ikkita ko'rsatkich kerak (yoki davr boshidagi + bitta).",
      tag: "Oy oxiri prognozi", lbl: "Oy oxirida taxminan", approx: "taxminiy: davr boshidagi ko'rsatkich yo'q, birinchi yozuvdan hisoblandi", interp: "Davr boshidagi ko'rsatkich qo'shni yozuvlar orasidan hisoblandi.",
      kUsed: "Shu paytgacha sarf", kRate: "Kunlik o'rtacha", kProj: "Prognoz sarf", kAvg: "1 {u} o'rtacha narxi", kPeriod: "Hisob davri", kLeft: "Davr oxirigacha", days: "kun",
      warn: "{date} {price} {cur}lik pog'onaga o'tasiz", advice: "Kuniga {x} {u} kamaytirsangiz, shu pog'onada qolasiz va {y} {cur} tejaysiz.", endTier: "Bu oy {n}-pog'onada yakunlaysiz.", noCross: "Joriy sur'atda pog'onadan o'tmaysiz.",
      tierTitle: "Prognoz pog'onalar bo'yicha", past: "O'tgan davrlar", pastRow: "{a} – {b}", vsPrev: "oldingiga nisbatan",
      barCap: "Strelka — oy oxiridagi prognoz, «hozir» — shu paytgacha sarf. Rangli blokda — pog'ona narxi, pastda — chegara.", barAria: "Prognoz pog'ona chizig'i: oy oxirida taxminan {p} {u}, {n}-pog'ona; hozirgacha {used} {u}.",
      share: "Ulashish", copied: "Nusxalandi ✓", shareTxt: "Oy oxirida taxminan {sum} {cur} ({n}-pog'ona)",
      pwa: "Ilovani o'rnating — keyingi ko'rsatkichni bir bosishda kiritasiz", pwaBtn: "O'rnatish", pwaClose: "Yopish", cur: "so'm", per: "oy"
    },
    ru: {
      title: "Дневник показаний счётчика", date: "Дата", val: "Показание", save: "Сохранить", billDay: "День расчёта", billHint: "Месяц начинается с этого дня (1–31).",
      listTitle: "Последние записи", del: "Удалить", clearAll: "Удалить всё", sure: "Все показания будут удалены. Продолжить?", yes: "Да, удалить", no: "Отмена",
      privacy: "Показания хранятся только на этом устройстве.", noStore: "В этом браузере сохранить не удалось — показания хранятся только в рамках этой сессии.",
      errInvalid: "Введите дату и показание корректно.", errFuture: "Нельзя вводить будущую дату.", errLess: "Показание не может быть меньше показания за более раннюю дату. Счётчик заменили?", newDiary: "Начать новый дневник",
      empty: "Записей пока нет.", saved: "Сохранено.", replaced: "Прежняя запись за эту дату заменена.",
      need: "Введите ещё одно показание", needSub: "Для прогноза нужно минимум два показания в расчётном периоде (или показание на начало периода + одно).",
      tag: "Прогноз на конец месяца", lbl: "К концу месяца примерно", approx: "ориентировочно: нет показания на начало периода, расчёт от первой записи", interp: "Показание на начало периода рассчитано по соседним записям.",
      kUsed: "Расход на данный момент", kRate: "В среднем в день", kProj: "Прогноз расхода", kAvg: "Средняя цена 1 {u}", kPeriod: "Расчётный период", kLeft: "До конца периода", days: "дн.",
      warn: "{date} вы перейдёте на ступень по {price} {cur}", advice: "Если сократить на {x} {u} в день, останетесь на этой ступени и сэкономите {y} {cur}.", endTier: "В этом месяце вы закончите на {n}-й ступени.", noCross: "При текущем темпе вы не перейдёте на другую ступень.",
      tierTitle: "Прогноз по ступеням", past: "Прошлые периоды", pastRow: "{a} – {b}", vsPrev: "к предыдущему",
      barCap: "Стрелка — прогноз на конец месяца, «сейчас» — расход на данный момент. Цветной блок — цена ступени, внизу — граница.", barAria: "Шкала ступеней прогноза: к концу месяца примерно {p} {u}, {n}-я ступень; на данный момент {used} {u}.",
      share: "Поделиться", copied: "Скопировано ✓", shareTxt: "К концу месяца примерно {sum} {cur} ({n}-я ступень)",
      pwa: "Установите приложение — следующее показание вводится в одно касание", pwaBtn: "Установить", pwaClose: "Закрыть", cur: "сум", per: "мес"
    }
  };
  var NBSP = String.fromCharCode(160);
  var fmt = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP); };
  var fmt1 = function (x) { var r = Math.round(x * 10) / 10, p = String(r).split('.'); return fmt(parseInt(p[0], 10)) + (p[1] ? ',' + p[1] : ''); };
  var esc = function (x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  function todayStr() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function lang() { return doc.documentElement.lang === 'ru' ? 'ru' : 'uz'; }
  function dateTxt(s, ordinalUz) { var p = parse(s), L = lang(); return L === 'ru' ? p.d + ' ' + MON.ru[p.m - 1] : p.d + '-' + MON.uz[p.m - 1]; }
  function dateLoc(s) { var p = parse(s), L = lang(); if (L === 'ru') return p.d + ' ' + MON.ru[p.m - 1]; var m = MON.uz[p.m - 1]; return p.d + '-' + m + 'da'; }

  var CSS = '.pg-box{margin-top:6px}.pg-h{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--accent,#6FB3D9);margin:4px 0 12px;display:flex;align-items:center;gap:8px}.pg-h::after{content:"";flex:1;height:1px;background:var(--line,#DDE5E0)}'
    + '.pg-row{display:flex;gap:10px;flex-wrap:wrap}.pg-row .field{flex:1 1 130px;min-width:0;margin-bottom:12px}.pg-box input[type=date]{flex:1;border:0;outline:0;background:transparent;font:inherit;font-size:16px;font-weight:700;color:var(--ink,#16211C);padding:12px 10px;min-width:0}'
    + '.pg-msg{font-size:12.5px;font-weight:700;margin:2px 0 10px;min-height:0}.pg-msg.err{color:#B04A3A}.pg-msg.ok{color:#1E6B45}.pg-btn{border:1.5px solid var(--cat,#1D4E6B);background:#fff;color:var(--cat,#1D4E6B);font:inherit;font-size:14px;font-weight:800;padding:10px 14px;border-radius:10px;cursor:pointer;min-height:44px}'
    + '.pg-btn.pri{background:var(--cat,#1D4E6B);color:#fff}.pg-btn.danger{border-color:#B04A3A;color:#B04A3A}.pg-list{margin:6px 0 8px;padding:0;list-style:none}.pg-list li{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--line,#DDE5E0);border-radius:9px;margin-bottom:6px;font-size:14px;font-weight:700;background:#FBFCFB}'
    + '.pg-list .d{flex:1;color:#33403A}.pg-list .v{font-variant-numeric:tabular-nums}.pg-x{border:0;background:transparent;color:#B04A3A;font:inherit;font-size:18px;line-height:1;width:44px;height:44px;cursor:pointer;border-radius:8px}'
    + '.pg-note{font-size:12.5px;color:var(--muted,#5C6B63);margin:6px 0}.pg-confirm{background:#FBF3E6;border:1px solid #EFDCBB;border-radius:10px;padding:10px 12px;margin:8px 0;font-size:13.5px;font-weight:700;color:#3E3212}.pg-confirm .pg-row{margin-top:8px}'
    + '.pg-pwa{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;background:var(--cat-soft,#E8F1F6);border-radius:10px;padding:10px 12px;margin:10px 0;font-size:13.5px;font-weight:700;color:var(--cat,#1D4E6B)}.pg-pwa span{flex:1 1 200px}'
    + '.pg-blk{border-radius:10px;padding:10px 12px;margin:10px 0;font-size:14px;font-weight:700;line-height:1.45}.pg-warn{background:#FFF1E0;color:#6B3200;border:1px solid #F0C48A}.pg-tip{background:#E7F3EC;color:#14452B;border:1px solid #B7DAC5}.pg-info{background:rgba(255,255,255,.08);color:#D2E0D8;font-weight:600;font-size:13px}'
    + '.pg-past .rrow .k small{display:block;font-size:11px;opacity:.75;margin-top:2px}';
  function addCss() { if (doc.getElementById('prognozcss')) return; var s = doc.createElement('style'); s.id = 'prognozcss'; s.textContent = CSS; doc.head.appendChild(s); }

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
  /* init({ key, form, result: { tag, mainNum, lbl, rows, tiers, extra, bar, box }, unit:{uz,ru}, tariff: fn() -> { tiers(q), limits, bar:[{from,to,price}], ctxNote }, onActive }) */
  function init(o) {
    addCss();
    var store = makeStore(o.key), st = store.get(), active = false, msg = { text: '', cls: '' }, confirmAll = false, lastErrLess = null, pwaShown = false;
    var form = o.form, R = o.result;
    var unit = function () { return o.unit[lang()]; };
    var t = function (k) { return TX[lang()][k]; };

    function ctx() { return o.tariff(); }
    function compute() { var c = ctx(); return { c: c, f: forecast({ entries: st.entries, today: todayStr(), billDay: st.billDay, tiers: c.tiers, limits: c.limits }) }; }

    function drawForm() {
      var L = TX[lang()], today = todayStr(), list = st.entries.slice().reverse().slice(0, 8);
      var h = '<div class="pg-box"><div class="pg-h">' + esc(L.title) + '</div>'
        + '<div class="pg-row"><div class="field"><label for="pgDate">' + esc(L.date) + '</label><div class="input-shell"><input type="date" id="pgDate" value="' + today + '" max="' + today + '"></div></div>'
        + '<div class="field"><label for="pgVal">' + esc(L.val) + '</label><div class="input-shell"><input type="text" id="pgVal" inputmode="decimal" autocomplete="off" placeholder="12 345"><span class="unit">' + esc(unit()) + '</span></div></div></div>'
        + '<div class="pg-msg ' + msg.cls + '" id="pgMsg" role="' + (msg.cls === 'err' ? 'alert' : 'status') + '">' + esc(msg.text) + '</div>'
        + (lastErrLess ? '<button type="button" class="pg-btn danger" id="pgNew">' + esc(L.newDiary) + '</button>' : '')
        + '<button type="button" class="pg-btn pri" id="pgSave">' + esc(L.save) + '</button>'
        + '<div class="pg-row" style="margin-top:14px"><div class="field" style="max-width:160px"><label for="pgBill">' + esc(L.billDay) + '</label><div class="input-shell"><input type="text" id="pgBill" inputmode="numeric" value="' + st.billDay + '" autocomplete="off"></div></div><p class="pg-note" style="flex:2 1 160px;align-self:center">' + esc(L.billHint) + '</p></div>'
        + '<div class="pg-h">' + esc(L.listTitle) + '</div>';
      if (!list.length) h += '<p class="pg-note">' + esc(L.empty) + '</p>';
      else {
        h += '<ul class="pg-list" id="pgList">';
        list.forEach(function (e) { h += '<li><span class="d">' + esc(dateTxt(e.d)) + ' <small style="color:#5C6B63;font-weight:600">' + esc(e.d) + '</small></span><span class="v">' + fmt1(e.v) + ' ' + esc(unit()) + '</span><button type="button" class="pg-x" data-del="' + esc(e.d) + '" aria-label="' + esc(L.del) + ' ' + esc(e.d) + '">✕</button></li>'; });
        h += '</ul>';
        if (confirmAll) h += '<div class="pg-confirm" id="pgConf" role="alertdialog"><div>' + esc(L.sure) + '</div><div class="pg-row"><button type="button" class="pg-btn danger" id="pgYes">' + esc(L.yes) + '</button><button type="button" class="pg-btn" id="pgNo">' + esc(L.no) + '</button></div></div>';
        else h += '<button type="button" class="pg-btn" id="pgClear">' + esc(L.clearAll) + '</button>';
      }
      h += '<p class="pg-note" id="pgPriv">' + esc(L.privacy) + (store.ok() ? '' : ' ' + esc(L.noStore)) + '</p><div id="pgPwa"></div></div>';
      form.innerHTML = h;
      bindForm();
      if (pwaShown) drawPwa();
    }

    function setMsg(text, cls) { msg = { text: text, cls: cls || '' }; var e = doc.getElementById('pgMsg'); if (e) { e.textContent = text; e.className = 'pg-msg ' + (cls || ''); e.setAttribute('role', cls === 'err' ? 'alert' : 'status'); } }
    function numIn(s) { return parseFloat(String(s).replace(new RegExp(NBSP, 'g'), '').replace(/\s/g, '').replace(',', '.')); }

    function add(d, v) {
      var err = validate(st.entries, todayStr(), d, v);
      if (err) { lastErrLess = err === 'less' ? { d: d, v: v } : null; drawForm(); setMsg(t(err === 'invalid' ? 'errInvalid' : err === 'future' ? 'errFuture' : 'errLess'), 'err'); return false; }
      lastErrLess = null;
      var had = st.entries.some(function (e) { return e.d === d; });
      st.entries = sorted(st.entries.filter(function (e) { return e.d !== d; }).concat([{ d: d, v: v }]));
      store.save();
      msg = { text: t('saved') + (had ? ' ' + t('replaced') : ''), cls: 'ok' };
      if (st.entries.length >= 2) maybePwa();
      drawForm(); renderResult(); if (o.onChange) o.onChange();
      return true;
    }

    function bindForm() {
      var $ = function (id) { return doc.getElementById(id); };
      $('pgSave').onclick = function () { var d = $('pgDate').value, v = numIn($('pgVal').value); if (!$('pgVal').value.trim()) v = NaN; add(d, v); };
      $('pgVal').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('pgSave').click(); } });
      $('pgBill').addEventListener('change', function () { var v = parseInt(String(this.value).replace(/\D/g, ''), 10); st.billDay = Math.min(31, Math.max(1, v || 1)); this.value = st.billDay; store.save(); renderResult(); if (o.onChange) o.onChange(); });
      var nb = $('pgNew'); if (nb) nb.onclick = function () { var e = lastErrLess; st.entries = []; store.save(); lastErrLess = null; if (e) { st.entries = [{ d: e.d, v: e.v }]; store.save(); } msg = { text: t('saved'), cls: 'ok' }; drawForm(); renderResult(); if (o.onChange) o.onChange(); };
      var ls = $('pgList'); if (ls) ls.addEventListener('click', function (ev) { var b = ev.target.closest ? ev.target.closest('[data-del]') : null; if (!b) return; var d = b.getAttribute('data-del'); st.entries = st.entries.filter(function (e) { return e.d !== d; }); store.save(); msg = { text: '', cls: '' }; drawForm(); renderResult(); if (o.onChange) o.onChange(); });
      var cl = $('pgClear'); if (cl) cl.onclick = function () { confirmAll = true; drawForm(); };
      var no = $('pgNo'); if (no) no.onclick = function () { confirmAll = false; drawForm(); };
      var ye = $('pgYes'); if (ye) ye.onclick = function () { st.entries = []; store.save(); confirmAll = false; msg = { text: '', cls: '' }; drawForm(); renderResult(); if (o.onChange) o.onChange(); };
    }

    /* ---- PWA yumshoq taklif: 2-yozuvdan keyin, o'rnatilmagan bo'lsa, bir marta yopilsa 30 kun ko'rsatilmaydi ---- */
    var PWA_KEY = 'kalki_prog_pwa';
    function maybePwa() {
      var api = root.KalkiPwa; if (!api || api.installed) return;
      if (!(api.canPrompt() || api.ios)) return;
      var ts = 0; try { ts = parseInt(root.localStorage.getItem(PWA_KEY), 10) || 0; } catch (e) {}
      if (ts && Date.now() - ts < 30 * DAY) return;
      pwaShown = true;
    }
    function drawPwa() {
      var box = doc.getElementById('pgPwa'); if (!box) return; var api = root.KalkiPwa, L = TX[lang()];
      box.innerHTML = '<div class="pg-pwa" id="pgPwaBox"><span>' + esc(L.pwa) + (api && api.ios && !api.canPrompt() ? '<br><small>' + esc(api.iosHint()) + '</small>' : '') + '</span>'
        + (api && api.canPrompt() ? '<button type="button" class="pg-btn pri" id="pgPwaGo">' + esc(L.pwaBtn) + '</button>' : '') + '<button type="button" class="pg-btn" id="pgPwaX">' + esc(L.pwaClose) + '</button></div>';
      var close = function () { pwaShown = false; try { root.localStorage.setItem(PWA_KEY, String(Date.now())); } catch (e) {} box.innerHTML = ''; };
      doc.getElementById('pgPwaX').onclick = close;
      var go = doc.getElementById('pgPwaGo'); if (go) go.onclick = function () { api.prompt(); close(); };
    }

    /* ---- Natija ---- */
    function row(k, v, extra) { return '<div class="rrow"><span class="k">' + k + (extra || '') + '</span><span class="v">' + v + '</span></div>'; }
    function summaryText() {
      var s = compute(); if (!s.f.ok) return '';
      return TX[lang()].shareTxt.replace('{sum}', fmt(s.f.total)).replace('{cur}', t('cur')).replace('{n}', s.f.tier);
    }
    function renderResult() {
      if (!active) return;
      var L = TX[lang()], s = compute(), f = s.f, cur = ' ' + L.cur, u = unit();
      R.tag.textContent = L.tag; R.lbl.textContent = L.lbl;
      if (!f.ok) {
        R.mainNum.textContent = '—'; R.rows.innerHTML = '<div class="pg-blk pg-info"><b>' + esc(L.need) + '</b><br>' + esc(L.needSub) + '</div>';
        R.tiers.innerHTML = ''; R.extra.innerHTML = ''; R.bar.innerHTML = ''; if (R.tiersTitle) R.tiersTitle.hidden = true; if (R.pastBox) R.pastBox.innerHTML = '';
        o.setShown && o.setShown(true); return;
      }
      R.mainNum.textContent = fmt(f.total) + cur;
      var h = row(esc(L.kUsed), fmt1(f.used) + ' ' + esc(u)) + row(esc(L.kRate), fmt1(f.rate) + ' ' + esc(u)) + row(esc(L.kProj), fmt1(f.projected) + ' ' + esc(u)) + row(esc(L.kAvg.replace('{u}', u)), fmt(f.avg) + cur);
      h += row(esc(L.kPeriod), esc(dateTxt(f.period.start) + ' – ' + dateTxt(addDays(f.period.end, -1))), '') + row(esc(L.kLeft), f.remaining + ' ' + esc(L.days));
      R.rows.innerHTML = h;
      var th = ''; var T = s.c.tiers(f.projected);
      for (var j = 0; j < T.rows.length; j++) { var r = T.rows[j]; th += '<div class="rrow"><span class="k">' + (r.to === Infinity ? fmt(r.from) + '+' : fmt(r.from) + '–' + fmt(r.to)) + ' ' + esc(u) + '<span class="fx">' + fmt1(r.qty != null ? r.qty : (r.kwh != null ? r.kwh : r.m3)) + ' × ' + fmt(r.price) + cur + '</span></span><span class="v">' + fmt(r.cost) + cur + '</span></div>'; }
      R.tiers.innerHTML = th; if (R.tiersTitle) { R.tiersTitle.hidden = false; R.tiersTitle.textContent = L.tierTitle; }
      var ex = '';
      if (f.approx) ex += '<div class="pg-blk pg-info">' + esc(L.approx) + '</div>'; else if (f.interpolated) ex += '<div class="pg-blk pg-info">' + esc(L.interp) + '</div>';
      if (f.cross) ex += '<div class="pg-blk pg-warn" id="pgWarn">' + esc(L.warn.replace('{date}', dateLoc(f.cross.date)).replace('{price}', fmt(s.c.prices ? s.c.prices[f.cross.idx] : 0)).replace('{cur}', L.cur)) + '</div>';
      if (f.advice) ex += '<div class="pg-blk pg-tip" id="pgTip">' + esc(L.advice.replace('{x}', fmt1(f.advice.cut)).replace('{u}', u).replace('{y}', fmt(f.advice.save)).replace('{cur}', L.cur)) + '</div>';
      else ex += '<div class="pg-blk pg-info" id="pgTier">' + esc(L.endTier.replace('{n}', f.tier)) + (f.cross ? '' : ' ' + esc(L.noCross)) + '</div>';
      R.extra.innerHTML = ex;
      R.bar.innerHTML = '';
      if (window.KalkiTierBar && s.c.bar) window.KalkiTierBar.render(R.bar, { tiers: s.c.bar, value: f.projected, valueLabel: fmt1(f.projected) + ' ' + u, mark: { value: f.used, label: lang() === 'ru' ? 'сейчас' : 'hozir' }, caption: L.barCap,
        ariaLabel: L.barAria.replace('{p}', fmt1(f.projected)).replace(/\{u\}/g, u).replace('{n}', f.tier).replace('{used}', fmt1(f.used)) });
      // o'tgan davrlar
      var pp = pastPeriods({ entries: st.entries, today: todayStr(), billDay: st.billDay, tiers: s.c.tiers }, 6), pb = '';
      if (pp.length) {
        pb = '<div class="tier-title">' + esc(L.past) + '</div><div class="receipt-rows pg-past">';
        pp.forEach(function (p) { pb += row(esc(dateTxt(p.start)) + ' – ' + esc(dateTxt(addDays(p.end, -1))), fmt(p.total) + cur, '<small>' + fmt1(p.used) + ' ' + esc(u) + (p.pct != null ? ' · ' + (p.pct >= 0 ? '+' : '−') + fmt(Math.abs(p.pct)) + '% ' + esc(L.vsPrev) : '') + '</small>'); });
        pb += '</div>';
      }
      if (R.pastBox) R.pastBox.innerHTML = pb;
      o.setShown && o.setShown(true);
    }

    return {
      setActive: function (a) { active = !!a; if (active) { drawForm(); renderResult(); } },
      refresh: function () { if (active) { drawForm(); renderResult(); } },
      render: renderResult, summary: summaryText, hasEntries: function () { return st.entries.length > 0; }, state: function () { return st; }, storageOk: function () { return store.ok(); },
      add: add
    };
  }

  core.init = init; core.todayStr = todayStr;
  return core;
});
