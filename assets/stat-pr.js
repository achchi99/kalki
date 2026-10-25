/* kalki.uz — KalkiFit statistika: «PR uchun hisobot» matni (8–10 qator, faqat haqiqiy raqamlar; qiymat yo'q bo'lsa qator chiqmaydi). UZ, RU; ЎЗ — UZ matnning translit'i (assets/translit.js).
 *   KalkiStatPR.build(hisobot, 'uz'|'cyr'|'ru', translitFn) → matn.   hisobot — GET /api/stat javobi (functions/api/stat.js). Admin: admin/kalkifit-statistika.html */
(function (root, factory) { var api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiStatPR = api; })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function nf(n) { return String(Math.round(n * 10) / 10).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function pct(a, b) { return b ? Math.round((a - b) / b * 100) : null; }
  var DAVR = { uz: { 1: 'bugun', 7: "so'nggi 7 kun", 30: "so'nggi 30 kun", 0: 'butun davr' }, ru: { 1: 'сегодня', 7: 'последние 7 дней', 30: 'последние 30 дней', 0: 'весь период' } };
  var FUNK = { uz: { ovqat_qoshildi: 'ovqat yozish', ai_sorov: 'AI yordamchi', suv_qoshildi: 'suv hisobi', yeymiz_chip: '«Nima yesam ekan?»', yeymiz_segment: '«Nima yesam ekan?»', buyurtma_hamkor: 'yetkazib berishdan buyurtma', qadam_ulandi: 'qadamni ulash', kun_kartochka_ulashildi: 'kun kartochkasini ulashish', baliq_kuni_obuna: '«Baliq kuni» eslatmasi' },
    ru: { ovqat_qoshildi: 'запись еды', ai_sorov: 'AI-помощник', suv_qoshildi: 'учёт воды', yeymiz_chip: '«Что бы мне съесть?»', yeymiz_segment: '«Что бы мне съесть?»', buyurtma_hamkor: 'заказ доставки', qadam_ulandi: 'подключение шагов', kun_kartochka_ulashildi: 'карточка дня', baliq_kuni_obuna: 'напоминание «Рыбный день»' } };
  function share(list, keys) { var tot = list.reduce(function (a, x) { return a + (x.n || 0); }, 0); if (!tot) return null; return keys.map(function (k) { var x = list.filter(function (y) { return y.k === k[0]; })[0]; return k[1] + ' ' + Math.round(((x && x.n) || 0) / tot * 100) + '%'; }).join(', '); }
  function build(r, lang, tr) {
    var L = lang === 'ru' ? 'ru' : 'uz', k = r.kpi || {}, o = r.oldingi, out = [], ru = L === 'ru';
    var dv = DAVR[L][r.davr] != null ? DAVR[L][r.davr] : DAVR[L][0];
    out.push(ru ? 'KalkiFit — итоги (' + dv + ', ' + r.dan.replace('2000-01-01', 'с начала') + ' – ' + r.gacha + ')' : 'KalkiFit — natijalar (' + dv + ', ' + r.dan.replace('2000-01-01', 'boshidan') + ' – ' + r.gacha + ')');
    if (k.dau || k.wau || k.mau) out.push(ru ? 'Активные пользователи: в среднем ' + nf(k.dau) + ' в день, ' + nf(k.wau) + ' за неделю, ' + nf(k.mau) + ' за месяц.' : 'Faol foydalanuvchilar: kuniga o\'rtacha ' + nf(k.dau) + ', haftasiga ' + nf(k.wau) + ', oyiga ' + nf(k.mau) + '.');
    if (k.yangi) { var dy = o ? pct(k.yangi, o.yangi) : null; out.push((ru ? 'Новых пользователей: ' : 'Yangi foydalanuvchilar: ') + nf(k.yangi) + (dy != null ? (ru ? ' (' + (dy >= 0 ? '+' : '') + dy + '% к прошлому периоду)' : ' (oldingi davrga nisbatan ' + (dy >= 0 ? '+' : '') + dy + '%)') : '') + '.'); }
    if (k.onboarding != null) out.push((ru ? 'Прошли первичную настройку: ' : 'Boshlang\'ich sozlashni tugatganlar: ') + nf(k.onboarding) + '%.');
    if (k.ret1 != null || k.ret7 != null) out.push(ru ? 'Вернулись на следующий день: ' + (k.ret1 != null ? nf(k.ret1) + '%' : '—') + ', через неделю: ' + (k.ret7 != null ? nf(k.ret7) + '%' : '—') + '.' : 'Ertasi kuni qaytganlar: ' + (k.ret1 != null ? nf(k.ret1) + '%' : '—') + ', bir haftadan keyin: ' + (k.ret7 != null ? nf(k.ret7) + '%' : '—') + '.');
    if (k.apk) out.push((ru ? 'Скачиваний Android-приложения: ' : 'Android ilovasi yuklab olindi: ') + nf(k.apk) + (ru ? '.' : ' marta.'));
    if (k.ai) out.push((ru ? 'Запросов к AI-помощнику: ' : 'AI yordamchiga so\'rovlar: ') + nf(k.ai) + '.');
    var top = (r.funksiyalar || []).filter(function (x) { return FUNK[L][x.hodisa]; }).reduce(function (m, x) { m[FUNK[L][x.hodisa]] = (m[FUNK[L][x.hodisa]] || 0) + x.son; return m; }, {}), tk = Object.keys(top).sort(function (a, b) { return top[b] - top[a]; })[0];
    if (tk) out.push((ru ? 'Самая популярная функция: ' : 'Eng ko\'p ishlatilgan funksiya: ') + tk + ' (' + nf(top[tk]) + (ru ? ' раз).' : ' marta).'));
    if (k.baliq) out.push((ru ? 'Подписчиков напоминания «Рыбный день»: ' : '«Baliq kuni» eslatmasi obunachilari: ') + nf(k.baliq) + '.');
    var pl = share(r.platforma || [], [['veb', ru ? 'веб' : 'veb'], ['android', 'Android'], ['ios-pwa', 'iPhone']]); if (pl) out.push((ru ? 'Платформы: ' : 'Platformalar: ') + pl + '.');
    var tl = share(r.til || [], ru ? [['uz', 'узбекский (латиница)'], ['cyr', 'узбекский (кириллица)'], ['ru', 'русский']] : [['uz', "o'zbek (lotin)"], ['cyr', "o'zbek (kirill)"], ['ru', 'rus']]); if (tl) out.push((ru ? 'Языки: ' : 'Tillar: ') + tl + '.');
    var txt = out.slice(0, 11).join('\n');
    return lang === 'cyr' && typeof tr === 'function' ? tr(txt) : txt;
  }
  return { build: build, nf: nf, pct: pct };
});
