/* kalki.uz — KalkiFit: «Retseptingizni yengillashtiring» (interfeys). 4 ekran: Kirish → Tahlil → Natija → Ulashish kartochkasi.
 * Hisob: assets/retsept-core.js (mahalliy parser, deterministik qoidalar; kkal/oqsil/yog'/uglevod — FAQAT data/retsept-masalliq.json, USDA). AI (functions/api/retsept.js) FAQAT mahalliy parser tanimagan qatorlarni
 * masalliqqa ajratadi; AI xato/limit/tarmoq yo'q bo'lsa — tushunarli xabar + qo'lda masalliq tanlash (HECH QACHON soxta natija). 3 misol (Osh, Mastava, Manti) AI'siz ishlaydi.
 * kalkifit-app.js dan OLDIN yuklanadi va window.KalkiRetseptUI ni beradi; ilova init() da bog'laydi (api). Kirish nuqtasi: Bugun'dagi eshik karta (yagona). */
(function () {
  'use strict';
  var A = null, R = window.KalkiRetsept, rt = null, tblState = 0, tblWait = [];
  if (!R) return;
  var D = {
    uz: {
      rtDoorT: 'Retseptingizni yengillashtiring', rtDoorS: "Oshingizni 20–30% yengil qilamiz",
      rtH: 'Retseptingizni yuboring — yengilroq qilib beramiz', rtSub: 'Masalliqlarni gramm bilan yozing',
      rtPh: "Onamning oshi: 1 kg guruch, 1 kg qo'y go'shti, 300 g yog', 1 kg sabzi…", rtCam: 'Rasmga olish', rtSoon: 'Tez orada', rtEx: 'Misollar', rtGo: 'Moslashtirish',
      rtEmpty: 'Retseptni yozing yoki misolni tanlang', rtShort: "Matn juda qisqa — masalliqlarni gramm bilan yozing (masalan, «1 kg guruch, 300 g yog'»).", rtLong: 'Matn juda uzun (1500 belgidan oshmasin).',
      rtScan: 'Masalliqlar tanilmoqda…', rtAiBusy: 'AI bilan tekshirilmoqda…', rtFound: '{n} ta masalliq topildi', rtIngT: 'Masalliqlar', rtIngH: "Grammni − / + bilan to'g'rilang. Hammasi bazadagi qiymat bilan hisoblanadi.", rtBase: '100 g da: {b}', rtAiAs: 'AI: «{a}» → {b} (tekshiring)',
      rtUnk: 'tanlang', rtUnkH: 'Bu masalliq bazadan aniq topilmadi — qaysi biri?', rtUnkNo: "Qo'shmaslik", rtNeedH: 'Miqdor aniq emas — gramm kiriting.', rtMore: 'Boshqa…', rtAdd: "Masalliq qo'shish",
      rtPickT: 'Masalliqni tanlang', rtPickQ: 'Qidirish: guruch, sabzi…', rtPickNone: 'Hech narsa topilmadi.', rtNeedFix: 'Sariq belgili masalliqlarni tanlang yoki miqdorini kiriting', rtNone: "Masalliq qo'shing",
      rtPork: "Bitta masalliq ro'yxatda yo'q — qo'shilmadi. Kerak bo'lsa, boshqa masalliq bilan almashtiring.", rtEst: 'taxminiy',
      rtPeople: 'Necha kishiga?', rtNext: 'Davom',
      rtPor: '1 porsiya', rtKcal: 'kkal', rtProtOk: 'oqsil saqlandi', rtProtUp: 'oqsil +{g} g', rtProtDn: 'oqsil −{g} g', rtNoCh: "O'zgarishlarni yoqing",
      rtCmp: 'Oldin / Keyin', rtBefore: 'Oldin', rtAfter: 'Keyin', rtMK: 'Kaloriya', rtMP: 'Oqsil', rtMF: "Yog'",
      rtChT: "Aqlli o'zgarishlar", rtChH: "Har birini yoqing yoki o'chiring — raqam darhol o'zgaradi.", rtBen: '−{k} kkal porsiyada', rtBen0: "kaloriya deyarli o'zgarmaydi", rtBenUp: "+{k} kkal porsiyada, lekin to'yimlilik oshadi",
      rtT0: 'deyarli sezilmaydi', rtT1: 'ozgina farq', rtT2: "boshqacha ta'm", rtNoRules: "Bu retseptda yengillashtirish uchun mos o'zgarish topilmadi — u allaqachon yengil yoki boshqa taom.",
      rtNote: 'Raqamlar taxminiy, KalkiFit bazasi (USDA) asosida.', rtSave: 'Saqlash — Mening taomlarim', rtShare: 'Ulashish', rtSaved: 'Saqlandi: «{n}» — 1 porsiya {k} kkal', rtSavedBtn: 'Bugunga yozish', rtLight: 'yengil', rtNoSave: "Saqlab bo'lmadi — masalliq yo'q",
      rtCardT: 'Ulashish kartochkasi', rtCardH: "Instagram yoki Telegram'ga qo'yish uchun rasm.", rtDl: 'Yuklab olish', rtShared: 'Ulashildi', rtMaking: 'Rasm tayyorlanmoqda…',
      rtLightV: 'Yengil versiya', rtBy: 'KalkiFit bilan hisoblandi', rtCardSub: '1 porsiya: {a} → {b} kkal', rtPeopleN: '{n} kishilik',
      rtLimit: "Bugungi {n} ta AI so'rov ishlatildi. Ertaga yana urinib ko'ring.", rtAiLeft: "Bugungi AI so'rovlari: {n} tadan {q} ta qoldi.",
      rtErrNet: "Internetga ulanib bo'lmadi. Masalliqlarni qo'lda tanlang.", rtErrAi: "AI bu qatorlarni aniqlay olmadi. Quyidagilarni o'zingiz tanlang.", rtErrNone: "Masalliq topilmadi. Retseptni gram bilan yozing yoki masalliqni qo'lda qo'shing.",
      rtBack: 'Orqaga'
    },
    ru: {
      rtDoorT: 'Облегчите свой рецепт', rtDoorS: 'Сделаем ваш плов легче на 20–30%',
      rtH: 'Пришлите рецепт — сделаем его легче', rtSub: 'Напишите ингредиенты с граммами',
      rtPh: 'Мамин плов: 1 кг риса, 1 кг баранины, 300 г масла, 1 кг моркови…', rtCam: 'Сфотографировать', rtSoon: 'Скоро', rtEx: 'Примеры', rtGo: 'Облегчить',
      rtEmpty: 'Напишите рецепт или выберите пример', rtShort: 'Слишком коротко — напишите ингредиенты с граммами (например, «1 кг риса, 300 г масла»).', rtLong: 'Слишком длинно (не больше 1500 символов).',
      rtScan: 'Распознаём ингредиенты…', rtAiBusy: 'Проверяем с помощью ИИ…', rtFound: 'Найдено ингредиентов: {n}', rtIngT: 'Ингредиенты', rtIngH: 'Поправьте граммы кнопками − / +. Всё считается по значениям из базы.', rtBase: 'на 100 г: {b}', rtAiAs: 'ИИ: «{a}» → {b} (проверьте)',
      rtUnk: 'выберите', rtUnkH: 'Этот ингредиент не найден точно в базе — какой именно?', rtUnkNo: 'Не добавлять', rtNeedH: 'Количество неясно — укажите граммы.', rtMore: 'Другое…', rtAdd: 'Добавить ингредиент',
      rtPickT: 'Выберите ингредиент', rtPickQ: 'Поиск: рис, морковь…', rtPickNone: 'Ничего не найдено.', rtNeedFix: 'Выберите ингредиенты с жёлтой меткой или укажите количество', rtNone: 'Добавьте ингредиент',
      rtPork: 'Один ингредиент не найден в списке — не добавлен. При необходимости замените другим.', rtEst: 'примерно',
      rtPeople: 'На сколько человек?', rtNext: 'Дальше',
      rtPor: '1 порция', rtKcal: 'ккал', rtProtOk: 'белок сохранён', rtProtUp: 'белок +{g} г', rtProtDn: 'белок −{g} г', rtNoCh: 'Включите изменения',
      rtCmp: 'До / После', rtBefore: 'До', rtAfter: 'После', rtMK: 'Калории', rtMP: 'Белок', rtMF: 'Жиры',
      rtChT: 'Умные изменения', rtChH: 'Включайте и выключайте — число меняется сразу.', rtBen: '−{k} ккал на порцию', rtBen0: 'калории почти не меняются', rtBenUp: '+{k} ккал на порцию, но сытнее',
      rtT0: 'почти незаметно', rtT1: 'небольшая разница', rtT2: 'другой вкус', rtNoRules: 'Для этого рецепта подходящих изменений не нашлось — он уже лёгкий или это другое блюдо.',
      rtNote: 'Цифры примерные, по базе KalkiFit (USDA).', rtSave: 'Сохранить — Мои блюда', rtShare: 'Поделиться', rtSaved: 'Сохранено: «{n}» — 1 порция {k} ккал', rtSavedBtn: 'Записать на сегодня', rtLight: 'лёгкая', rtNoSave: 'Не удалось сохранить — нет ингредиентов',
      rtCardT: 'Карточка для соцсетей', rtCardH: 'Картинка для Instagram или Telegram.', rtDl: 'Скачать', rtShared: 'Отправлено', rtMaking: 'Готовим картинку…',
      rtLightV: 'Лёгкая версия', rtBy: 'Посчитано в KalkiFit', rtCardSub: '1 порция: {a} → {b} ккал', rtPeopleN: 'на {n} чел.',
      rtLimit: 'Сегодняшние AI-запросы ({n}) использованы. Попробуйте завтра.', rtAiLeft: 'AI-запросов на сегодня: осталось {q} из {n}.',
      rtErrNet: 'Нет соединения с интернетом. Выберите ингредиенты вручную.', rtErrAi: 'ИИ не смог распознать эти строки. Выберите их сами.', rtErrNone: 'Ингредиенты не найдены. Напишите рецепт с граммами или добавьте ингредиент вручную.',
      rtBack: 'Назад'
    }
  };
  var ICONS = {
    rspark: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z M19 16l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z',
    rcam: 'M4 8h3.5L9 5.5h6L16.5 8H20v11H4z M12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
    rdrop: 'M12 3.5c3 4 6 7.2 6 10.8a6 6 0 0 1-12 0C6 10.7 9 7.5 12 3.5z',
    rfat: 'M5 14c0-5 3.2-9 7-9s7 4 7 9c0 4-3.2 6-7 6s-7-2-7-6z M9 13.5h6',
    rleg: 'M14.5 4a5.5 5.5 0 0 1 4 9.4c-1.6 1.6-3.8 2-5.6 1.4l-3.2 3.2a2 2 0 1 1-2.6 2.2 2 2 0 1 1 1.6-3.2l3.2-3.2c-.6-1.8-.2-4 1.4-5.6A5.5 5.5 0 0 1 14.5 4z',
    rcarrot: 'M15 9L5 20c-.8.3-1.3-.2-1-1L15 9z M15 9c-1-2-1-4 0-5 M15 9c2 1 4 1 5 0 M15 9c1.5-1.5 3-2 4.5-1.5',
    rcup: 'M6 5h12l-1.3 14.5a1.5 1.5 0 0 1-1.5 1.5H8.8a1.5 1.5 0 0 1-1.5-1.5z M6.5 10h11',
    rsugar: 'M4 9l8-4 8 4v8l-8 4-8-4z M4 9l8 4 8-4 M12 13v8',
    rok: 'M5 12.5l4.5 4.5L19 7.5', rshare: 'M12 4v11 M7.5 8.5L12 4l4.5 4.5 M5 14v6h14v-6', rdl: 'M12 4v11 M7.5 10.5L12 15l4.5-4.5 M5 20h14', rplus: 'M12 5v14 M5 12h14'
  };
  /* misollar: oddiy matn (mahalliy parser tahlil qiladi — AI'siz) */
  var EX = {
    osh: { chip: { uz: 'Osh', ru: 'Плов' }, uz: "Onamning oshi (8 kishi): 1 kg guruch, 850 g qo'y go'shti, 150 g dumba, 250 ml o'simlik yog'i, 1 kg sabzi, 2 ta piyoz, 1 bosh sarimsoq, zira", ru: 'Мамин плов (на 8 человек): 1 кг риса, 850 г баранины, 150 г курдюка, 250 мл растительного масла, 1 кг моркови, 2 луковицы, 1 головка чеснока, зира' },
    mastava: { chip: { uz: 'Mastava', ru: 'Мастава' }, uz: "Mastava (6 kishi): 500 g mol go'shti, 200 g guruch, 450 g kartoshka, 200 g sabzi, 2 ta piyoz, 3 ta pomidor, 70 ml o'simlik yog'i, 150 g qaymoq, ko'kat", ru: 'Мастава (на 6 человек): 500 г говядины, 200 г риса, 450 г картофеля, 200 г моркови, 2 луковицы, 3 помидора, 70 мл растительного масла, 150 г сметаны, зелень' },
    manti: { chip: { uz: 'Manti', ru: 'Манты' }, uz: "Manti (6 kishi): 500 g un, 500 g qo'y go'shti, 100 g dumba, 600 g piyoz, 1 choy qoshiq tuz, 120 g qaymoq", ru: 'Манты (на 6 человек): 500 г муки, 500 г баранины, 100 г курдюка, 600 г лука, 1 ч. л. соли, 120 г сметаны' }
  };
  var ORDER = ['osh', 'mastava', 'manti'];

  function T(k, o) { return A.T(k, o); }
  function esc(s) { return A.esc(s); }
  function L() { return A.lang() === 'ru' ? 'ru' : 'uz'; }
  function reduce() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function ico(n, c) { return A.ico(n, c); }
  function tr(s) { var K = window.KalkiTranslit; return A.isCyr() && K && K.translit ? K.translit(s) : s; }
  function head(title, back) { return '<div class="sl-yh rt-yh">' + (back ? '<button type="button" class="sl-x" data-act="' + back + '" aria-label="' + esc(T('rtBack')) + '">' + ico('back') + '</button>' : '') + '<h3 class="sl-fwt">' + esc(title) + '</h3><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>'; }
  function count(h) { try { if (A.count) A.count(h); } catch (e) {} }
  function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function nameOf(it) { var m = it.id && R.table()[it.id]; return cap(m ? m[L()] : it.nom); }
  function unitLbl(id) { return R.unitName(id, L()); }
  function ml(id) { return R.isMl(id); }
  function disp(it) { return ml(it.id) ? Math.round(it.g / 0.92 / 5) * 5 : Math.round(it.g); }
  function grams(it, v) { return ml(it.id) ? Math.round(v * 0.92) : v; }
  function step(v, dir) { var s = v >= 300 ? 50 : v >= 100 ? 10 : 5; return Math.max(0, Math.min(5000, dir > 0 ? Math.floor(v / s) * s + s : Math.ceil(v / s) * s - s)); }

  /* ---------- jadval (lazy) ---------- */
  function loadTable(cb) {
    if (tblState === 2) { cb(true); return; } tblWait.push(cb); if (tblState === 1) return; tblState = 1;
    fetch('/data/retsept-masalliq.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { R.init(j); tblState = 2; var w = tblWait; tblWait = []; w.forEach(function (f) { f(true); }); })
      .catch(function () { tblState = 0; var w = tblWait; tblWait = []; w.forEach(function (f) { f(false); }); });
  }

  /* ---------- 1. Kirish ---------- */
  function inHtml() {
    return head('') +
      '<div class="rt-hero rt-in"><span class="rt-spk" aria-hidden="true">' + ico('rspark') + '</span><h2 class="rt-h">' + esc(T('rtH')) + '</h2><p class="rz-mut">' + esc(T('rtSub')) + '</p></div>' +
      '<label class="rt-ta rt-in" for="rtText"><span class="sr">' + esc(T('rtH')) + '</span><textarea id="rtText" rows="6" maxlength="1500" placeholder="' + esc(T('rtPh')) + '">' + esc(rt.shown || '') + '</textarea></label>' +
      '<p class="rt-msg rt-in" id="rtMsg" role="alert" hidden></p>' +
      '<button type="button" class="rz-btn ghost full rt-cam rt-in" disabled aria-disabled="true">' + ico('rcam') + ' ' + esc(T('rtCam')) + ' <span class="rt-soon">' + esc(T('rtSoon')) + '</span></button>' +
      '<div class="rz-st rt-in">' + esc(T('rtEx')) + '</div><div class="rt-chips rt-in" role="group" aria-label="' + esc(T('rtEx')) + '">' + ORDER.map(function (k) { return '<button type="button" class="rz-chip' + (rt.chip === k ? ' on' : '') + '" data-act="rtex" data-x="' + k + '">' + esc(EX[k].chip[L()]) + '</button>'; }).join('') + '</div>' +
      '<p class="rz-mut rt-ai-left rt-in" id="rtAiLeft" role="status"' + (aiq ? '' : ' hidden') + '>' + esc(aiTxt()) + '</p>' +
      '<div class="sl-cta"><button type="button" class="sl-main rt-go" data-act="rtgo">' + ico('rspark') + ' ' + esc(T('rtGo')) + '</button></div>';
  }
  /* AI so'rovlari hisoblagichi: limit serverda (functions/api/retsept.js CLIENT_LIMIT — Android ilovasi 2, veb 5); bu yerda faqat ko'rsatiladi */
  var aiq = null;
  function plat() { var N = window.KalkiNative; try { return N && N.isApp() && N.platform() === 'android' ? 'android' : ''; } catch (e) { return ''; } }
  function aiTxt() { return !aiq ? '' : aiq.qoldi > 0 ? T('rtAiLeft', { q: aiq.qoldi, n: aiq.limit }) : T('rtLimit', { n: aiq.limit }); }
  function aiSet(j) { if (!j || !(j.limit > 0) || typeof j.qoldi !== 'number') return; aiq = { limit: j.limit, qoldi: Math.max(0, j.qoldi) }; var e = A.$('#rtAiLeft'); if (e) { e.textContent = aiTxt(); e.hidden = false; } }
  function aiPeek() {
    try { fetch('/api/retsept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sorov: 'qoldi', mijoz_id: A.cid(), platforma: plat() || undefined }) })
      .then(function (r) { return r.ok ? r.json() : null; }).then(aiSet).catch(function () {}); } catch (e) {}
  }
  function msg(t) { var m = A.$('#rtMsg'); if (!m) return; m.textContent = t || ''; m.hidden = !t; }
  function srcText() { var ta = A.$('#rtText'), v = ta ? ta.value : ''; rt.shown = v; return rt.ex && v === rt.exShown ? rt.exTxt : v; }       // misol (ЎЗ da transliteratsiya ko'rsatilgan) — asl lotin matn tahlil qilinadi

  /* ---------- 2. Tahlil ---------- */
  function rowHtml(it, i, scan) {
    var m = R.table()[it.id];
    if (!it.id) {
      var cands = (it.cands && it.cands.length ? it.cands : []).slice(0, 4);
      return '<div class="rt-ing unk' + (scan ? ' scan' : '') + '" data-i="' + i + '" style="--i:' + i + '"><div class="nm"><b>' + esc(cap(it.nom)) + '</b><span class="rt-warn">' + esc(T('rtUnk')) + '</span></div>' +
        (scan ? '<span class="rt-q" aria-hidden="true">?</span>' : '<p class="rz-mut sm">' + esc(T('rtUnkH')) + '</p><div class="rt-opts">' + cands.map(function (c) { return '<button type="button" class="rz-chip" data-act="rtset" data-i="' + i + '" data-o="' + c + '">' + esc(cap(R.table()[c][L()])) + '</button>'; }).join('') + '<button type="button" class="rz-chip" data-act="rtpick" data-i="' + i + '">' + esc(T('rtMore')) + '</button><button type="button" class="rz-chip" data-act="rtdrop" data-i="' + i + '">' + esc(T('rtUnkNo')) + '</button></div>') + '</div>';
    }
    var need = !(it.g > 0) && it.need, u = unitLbl(it.id);
    return '<div class="rt-ing' + (scan ? ' scan' : '') + (it.g > 0 || need ? '' : ' off') + (need ? ' need' : '') + '" data-i="' + i + '" style="--i:' + i + '"><div class="nm"><b>' + esc(nameOf(it)) + (it.est ? ' <small class="rt-est">' + esc(T('rtEst')) + '</small>' : '') + '</b><small>' + esc(need ? T('rtNeedH') : it.ai ? T('rtAiAs', { a: cap(it.nom), b: m[L()] }) : T('rtBase', { b: m.k + ' ' + T('rtKcal') })) + '</small></div>' +
      (scan ? '<span class="rt-ok" aria-hidden="true">' + ico('rok') + '</span>' : '<div class="rt-step" role="group" aria-label="' + esc(nameOf(it)) + '"><button type="button" class="sl-pill" data-act="rtg" data-i="' + i + '" data-s="-1" aria-label="' + esc(nameOf(it)) + ' −"' + (it.g <= 0 ? ' disabled' : '') + '>−</button><b aria-live="polite">' + disp(it) + ' ' + u + '</b><button type="button" class="sl-pill" data-act="rtg" data-i="' + i + '" data-s="1" aria-label="' + esc(nameOf(it)) + ' +">+</button></div>') + '</div>';
  }
  function anHtml(scan) {
    var rows = rt.items.map(function (it, i) { return rowHtml(it, i, scan); }).join('');
    if (scan) return head(rt.nom || T('rtIngT'), 'rtback1') + '<div class="rt-scanh"><b>' + esc(rt.busy ? T('rtAiBusy') : T('rtScan')) + '</b><span class="rt-bar"><i></i></span></div><div class="rt-ings">' + rows + '</div>';
    var found = rt.items.filter(function (i) { return i.id; }).length;
    return head(rt.nom || T('rtIngT'), 'rtback1') + (rt.err ? '<p class="rt-msg rt-in" role="alert">' + esc(rt.err) + '</p>' : '') + (rt.pork ? '<p class="rt-msg rt-in" role="status">' + esc(T('rtPork')) + '</p>' : '') +
      (found ? '<p class="rt-found rt-in">' + ico('rok') + ' ' + esc(T('rtFound', { n: found })) + '</p>' : '') +
      '<div class="rz-st rt-in">' + esc(T('rtIngT')) + '</div><p class="rz-mut sm rt-in">' + esc(T('rtIngH')) + '</p><div class="rt-ings rt-in">' + rows + '</div>' +
      '<button type="button" class="rz-btn ghost full rt-addb rt-in" data-act="rtpick" data-i="-1">' + ico('rplus') + ' ' + esc(T('rtAdd')) + '</button>' +
      '<div class="rz-st rt-in">' + esc(T('rtPeople')) + '</div><div class="sl-stp rt-in" role="group" aria-label="' + esc(T('rtPeople')) + '"><button type="button" class="sl-pill" data-act="rtn" data-s="-1" aria-label="−"' + (rt.n <= 1 ? ' disabled' : '') + '>−</button><b id="rtN" aria-live="polite">' + rt.n + '</b><button type="button" class="sl-pill" data-act="rtn" data-s="1" aria-label="+"' + (rt.n >= 12 ? ' disabled' : '') + '>+</button></div>' +
      '<div class="sl-cta"><button type="button" class="sl-main" data-act="rtnext">' + esc(T('rtNext')) + '</button></div>';
  }
  /* masalliq tanlagich (tanilmagan masalliq / qo'lda qo'shish) */
  function pickIds(q) {
    var t = R.table(), nq = R.norm(q || ''), ids = Object.keys(t);
    if (nq) ids = ids.filter(function (id) { var m = t[id]; return R.norm(m.uz).indexOf(nq) > -1 || R.norm(m.ru).indexOf(nq) > -1 || (m.a || []).some(function (a) { return R.norm(a).indexOf(nq) === 0; }); });
    return ids.sort(function (a, b) { return R.norm(t[a][L()]).localeCompare(R.norm(t[b][L()])); });
  }
  function pickList(ids) { var t = R.table(); return ids.length ? ids.map(function (id) { return '<button type="button" class="rz-row rt-pr" data-act="rtchoose" data-o="' + id + '"><span class="m"><b>' + esc(cap(t[id][L()])) + '</b></span>' + ico('chev', 'r') + '</button>'; }).join('') : '<p class="rz-mut">' + esc(T('rtPickNone')) + '</p>'; }
  function pickHtml(q) {
    return head(T('rtPickT'), 'rtback2') + '<label class="sl-search rt-search">' + ico('search') + '<input id="rtPQ" type="text" inputmode="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(T('rtPickQ')) + '" value="' + esc(q || '') + '" aria-label="' + esc(T('rtPickT')) + '"></label>' +
      '<div class="rt-plist" id="rtPL">' + pickList(pickIds(q)) + '</div>';
  }

  /* ---------- 3. Natija ---------- */
  var ODO = ' 0123456789';
  function cells(n, w) { var s = String(n); while (s.length < w) s = ' ' + s; return s.split(''); }
  function odo(n, w) { return cells(n, w).map(function (c) { return '<span class="d' + (c === ' ' ? ' b' : '') + '"><span class="s" style="transform:translateY(-' + ODO.indexOf(c) + 'em)">' + ODO.split('').map(function (x) { return '<i>' + (x === ' ' ? '&nbsp;' : x) + '</i>'; }).join('') + '</span></span>'; }).join(''); }
  function setOdo(el, n) {
    if (!el) return; var ds = el.querySelectorAll('.d'), cs = cells(n, ds.length); el.setAttribute('aria-label', n + ' ' + T('rtKcal'));
    if (cs.length !== ds.length) { el.innerHTML = odo(n, cs.length); return; }
    cs.forEach(function (c, i) { ds[i].classList.toggle('b', c === ' '); ds[i].firstChild.style.transform = 'translateY(-' + ODO.indexOf(c) + 'em)'; });
  }
  function active() { return rt.rules.filter(function (r) { return rt.on[r.id]; }); }
  function itemsAfter() { return R.applyRules(rt.items, active()); }
  function baseT() { return R.totals(rt.items, rt.n); }
  function curT() { return R.totals(itemsAfter(), rt.n); }
  function pct(a, b) { return a ? Math.round((b - a) / a * 100) : 0; }
  function protTxt(b, c) { var d = c.p - b.p; if (d >= -1) return d >= 2 ? T('rtProtUp', { g: d }) : T('rtProtOk'); return T('rtProtDn', { g: -d }); }
  function vol(id, g) { return ml(id) ? Math.round(g / 0.92 / 5) * 5 : Math.round(g / 5) * 5; }
  function ruleTitle(r, short) {
    var u = unitLbl(r.ref), ru = L() === 'ru', g = ru ? 'г' : 'g', NB = ' ';
    var a = r.a != null ? vol(r.ref, r.a) : 0, b = r.b != null ? vol(r.ref, r.b) : 0, m = Math.round((r.m || 0) / 5) * 5;
    if (r.id === 'yog') return short ? (ru ? 'Масло ' : "Yog' ") + a + ' → ' + b + ' ' + u : (ru ? 'Меньше масла: ' : "Yog'ni kamaytirish: ") + a + ' → ' + b + NB + u;
    if (r.id === 'dumba') return r.mode === 'yoq' ? (short ? (ru ? 'Без курдюка' : 'Dumbasiz') : (ru ? 'Без курдюка: убираем ' + a + NB + 'г' : 'Dumbasiz: ' + a + NB + 'g dumba olib tashlanadi')) : (short ? (ru ? 'Курдюк ' : 'Dumba ') + a + ' → ' + b + ' ' + g : (ru ? 'Меньше курдюка: ' : 'Dumbani kamaytirish: ') + a + ' → ' + b + NB + g);
    if (r.id === 'gosht') {
      if (r.to === 'tovuq_kokrak' && r.ref === 'qoy') return short ? (ru ? '1/3 мяса — курица' : "1/3 go'sht — tovuq") : (ru ? 'Треть мяса — куриное филе (' + m + NB + 'г)' : "Go'shtning 1/3 qismi — tovuq filesi (" + m + NB + 'g)');
      if (r.ref === 'tovuq_son') return short ? (ru ? 'Курица без кожи' : 'Terisiz tovuq') : (ru ? 'Курица: грудка без кожи (' + m + NB + 'г)' : "Tovuq: terisiz ko'krak (" + m + NB + 'g)');
      return short ? (ru ? '1/2 мяса — постное' : "1/2 go'sht — yog'siz") : (ru ? 'Половина мяса — постная говядина (' + m + NB + 'г)' : "Go'shtning yarmi — yog'siz mol go'shti (" + m + NB + 'g)');
    }
    if (r.id === 'qatiq') return r.kind === 'mayonez' ? (short ? (ru ? 'Майонез → катык' : 'Mayonez → qatiq') : (ru ? 'Половина майонеза — катык (' + m + NB + 'г)' : 'Mayonezning yarmi — qatiq bilan (' + m + NB + 'g)')) : (short ? (ru ? 'Сметана → катык' : 'Qaymoq → qatiq') : (ru ? 'Катык вместо сметаны (' + a + NB + 'г)' : "Qaymoq o'rniga qatiq (" + a + NB + 'g)'));
    if (r.id === 'shakar') return short ? (ru ? 'Сахар −30%' : 'Shakar −30%') : (ru ? 'Меньше сахара: ' : 'Shakarni kamaytirish: ') + a + ' → ' + b + NB + g + ' (−30%)';
    return short ? (ru ? 'Морковь +' : 'Sabzi +') + r.add + ' ' + g : (ru ? 'Больше моркови: ' : "Sabzi ko'proq: ") + a + ' → ' + b + NB + g;
  }
  function barsHtml() {
    return [['k', 'rtMK', T('rtKcal')], ['p', 'rtMP', L() === 'ru' ? 'г' : 'g'], ['f', 'rtMF', L() === 'ru' ? 'г' : 'g']].map(function (m) {
      return '<div class="rt-bm ' + m[0] + '"><div class="h"><span>' + esc(T(m[1])) + '</span><b><span class="o"></span> → <span class="n"></span> ' + esc(m[2]) + '</b></div><div class="rt-br o" aria-hidden="true"><i></i></div><div class="rt-br n" aria-hidden="true"><i></i></div></div>';
    }).join('');
  }
  function chHtml(r) {
    var on = !!rt.on[r.id], k = r.benefit;
    return '<button type="button" class="rt-ch' + (on ? ' on' : '') + '" role="switch" aria-checked="' + on + '" data-act="rttog" data-c="' + r.id + '"><span class="sl-ci">' + ico(r.ic) + '</span>' +
      '<span class="m"><b>' + esc(ruleTitle(r)) + '</b><span class="bn">' + esc(k >= 5 ? T('rtBen', { k: k }) : k <= -5 ? T('rtBenUp', { k: -k }) : T('rtBen0')) + '</span><span class="rt-tb t' + r.taste + '">' + esc(T('rtT' + r.taste)) + '</span></span><span class="rt-sw" aria-hidden="true"><i></i></span></button>';
  }
  function prepRules() {
    var y = []; try { y = A.yemay() || []; } catch (e) {}
    rt.rules = R.suggest(rt.items, { kishi: rt.n, nom: rt.nom, dish: rt.dish, yemay: y }); rt.on = {}; rt.rules.forEach(function (r) { rt.on[r.id] = true; });
  }
  function resHtml() {
    var b = baseT();
    return head(rt.nom || T('rtIngT'), 'rtback2') +
      '<section class="rt-big rt-in" aria-live="polite"><div class="l">' + esc(T('rtPor')) + ' · ' + esc(T('rtPeopleN', { n: rt.n })) + '</div>' +
      '<div class="v"><s class="old">' + b.k + '</s><span class="ar" aria-hidden="true">→</span><span class="rt-odo" id="rtOdo" role="img" aria-label="' + b.k + ' ' + esc(T('rtKcal')) + '">' + odo(b.k, String(b.k).length) + '</span><span class="u">' + esc(T('rtKcal')) + '</span></div><div class="rt-pchip" id="rtChip"></div></section>' +
      '<section class="rt-cmp rt-in"><div class="rz-st">' + esc(T('rtCmp')) + '</div><div class="rt-leg"><span class="o">' + esc(T('rtBefore')) + '</span><span class="n">' + esc(T('rtAfter')) + '</span></div>' + barsHtml() + '</section>' +
      (rt.rules.length ? '<div class="rz-st rt-in">' + esc(T('rtChT')) + '</div><p class="rz-mut sm rt-in">' + esc(T('rtChH')) + '</p><div class="rt-chs rt-in">' + rt.rules.map(chHtml).join('') + '</div>' : '<p class="rt-msg rt-in" role="status">' + esc(T('rtNoRules')) + '</p>') +
      '<p class="rz-priv rt-in">' + esc(T('rtNote')) + '</p>' +
      '<div class="sl-cta rt-cta2"><button type="button" class="sl-main" data-act="rtsave" id="rtSaveB">' + esc(rt.saved ? T('rtSavedBtn') : T('rtSave')) + '</button><button type="button" class="rz-btn ghost rt-shb" data-act="rtshare" aria-label="' + esc(T('rtShare')) + '">' + ico('rshare') + '<span>' + esc(T('rtShare')) + '</span></button></div>';
  }
  function upd(first) {
    var sh = A.$('#rzSheet'); if (!sh || !rt || rt.scr !== 'res') return;
    var b = baseT(), c = curT(), any = rt.rules.some(function (r) { return rt.on[r.id]; }), go = function () { setOdo(sh.querySelector('#rtOdo'), c.k); };
    if (first && !reduce()) setTimeout(go, 350); else go();
    var ch = sh.querySelector('#rtChip'), p = pct(b.k, c.k); ch.className = 'rt-pchip' + (any ? '' : ' none'); ch.textContent = any ? (p < 0 ? '−' + Math.abs(p) : '+' + p) + '% · ' + protTxt(b, c) : T('rtNoCh');
    ['k', 'p', 'f'].forEach(function (m) {
      var row = sh.querySelector('.rt-bm.' + m); if (!row) return; var mx = Math.max(b[m], c[m], 1);
      row.querySelector('.o').textContent = b[m]; row.querySelector('.n').textContent = c[m]; row.querySelector('.rt-br.o i').style.width = Math.round(b[m] / mx * 100) + '%';
      var ni = row.querySelector('.rt-br.n i'), w = Math.round(c[m] / mx * 100) + '%'; if (first && !reduce()) { ni.style.width = Math.round(b[m] / mx * 100) + '%'; setTimeout(function () { ni.style.width = w; }, 380); } else ni.style.width = w;
    });
    rt.rules.forEach(function (r) { var el = sh.querySelector('[data-act=rttog][data-c="' + r.id + '"]'); if (!el) return; var on = !!rt.on[r.id]; el.classList.toggle('on', on); el.setAttribute('aria-checked', on); });
  }

  /* ---------- 4. Ulashish kartochkasi (canvas 1080×1350) ---------- */
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function fitText(ctx, s, max, size, weight) { var z = size; do { ctx.font = weight + ' ' + z + 'px Manrope, system-ui, sans-serif'; if (ctx.measureText(s).width <= max) break; z -= 4; } while (z > 30); return z; }
  function drawCard(cv) {
    var W = 1080, H = 1350, ctx = cv.getContext('2d'), b = baseT(), c = curT(), dk = Math.max(0, b.k - c.k), p = pct(b.k, c.k);
    var acc = '#FF7E5C', acc2 = '#FFB46B', ink = '#FFF4EC', mut = 'rgba(255,244,236,.66)';
    var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#2A1712'); g.addColorStop(1, '#14100F'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var rg = ctx.createRadialGradient(W * 0.82, H * 0.2, 20, W * 0.82, H * 0.2, 640); rg.addColorStop(0, 'rgba(255,126,92,.45)'); rg.addColorStop(1, 'rgba(255,126,92,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    var rg2 = ctx.createRadialGradient(W * 0.1, H * 0.95, 10, W * 0.1, H * 0.95, 520); rg2.addColorStop(0, 'rgba(242,179,61,.18)'); rg2.addColorStop(1, 'rgba(242,179,61,0)'); ctx.fillStyle = rg2; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    rr(ctx, 80, 84, 72, 72, 22); ctx.fillStyle = acc; ctx.fill(); ctx.fillStyle = '#1C0C06'; ctx.font = '800 44px Manrope, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('K', 116, 136);
    ctx.textAlign = 'left'; ctx.fillStyle = ink; ctx.font = '700 38px Manrope, system-ui, sans-serif'; ctx.fillText('KalkiFit', 172, 133);
    var pill = tr(T('rtLightV')); ctx.font = '700 32px Manrope, system-ui, sans-serif'; var pw = ctx.measureText(pill).width + 56; rr(ctx, W - 80 - pw, 88, pw, 64, 32); ctx.strokeStyle = acc; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = acc; ctx.fillText(pill, W - 80 - pw + 28, 131);
    var nm = tr(rt.nom || T('rtIngT')); fitText(ctx, nm, W - 160, 96, 800); ctx.fillStyle = ink; ctx.fillText(nm, 80, 330);
    ctx.font = '600 38px Manrope, system-ui, sans-serif'; ctx.fillStyle = mut; ctx.fillText(tr(T('rtPeopleN', { n: rt.n }) + ' · ' + T('rtPor')), 80, 392);
    var big = '−' + dk; ctx.font = '800 76px Manrope, system-ui, sans-serif'; var uw = ctx.measureText(tr(T('rtKcal'))).width, gg = ctx.createLinearGradient(80, 470, 80, 720); gg.addColorStop(0, acc2); gg.addColorStop(1, acc);
    var bz = fitText(ctx, big, W - 160 - uw - 24, 290, 800); ctx.fillStyle = gg; ctx.fillText(big, 72, 700); var bw = ctx.measureText(big).width;
    ctx.font = '800 76px Manrope, system-ui, sans-serif'; ctx.fillStyle = ink; ctx.fillText(tr(T('rtKcal')), 72 + bw + 24, 700 - bz * 0.06);
    ctx.font = '600 40px Manrope, system-ui, sans-serif'; ctx.fillStyle = mut; ctx.fillText(tr(T('rtCardSub', { a: b.k, b: c.k })) + (p < 0 ? '  ·  −' + Math.abs(p) + '%' : ''), 80, 784);
    ctx.strokeStyle = 'rgba(255,244,236,.14)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(80, 850); ctx.lineTo(W - 80, 850); ctx.stroke();
    var on = active().filter(function (x) { return x.benefit > 0; }).sort(function (a, z) { return z.benefit - a.benefit; }).slice(0, 3);
    on.forEach(function (x, i) {
      var y = 930 + i * 92; ctx.beginPath(); ctx.arc(104, y - 13, 24, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,126,92,.18)'; ctx.fill();
      ctx.strokeStyle = acc; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(93, y - 13); ctx.lineTo(101, y - 5); ctx.lineTo(116, y - 22); ctx.stroke();
      var s = tr(ruleTitle(x, true)); fitText(ctx, s, W - 160 - 70, 44, 700); ctx.fillStyle = ink; ctx.fillText(s, 150, y);
    });
    ctx.font = '800 46px Manrope, system-ui, sans-serif'; ctx.fillStyle = ink; ctx.fillText('kalki.uz', 80, H - 92);
    var kw = ctx.measureText('kalki.uz').width; ctx.beginPath(); ctx.arc(80 + kw + 22, H - 107, 8, 0, Math.PI * 2); ctx.fillStyle = acc; ctx.fill();
    ctx.font = '600 32px Manrope, system-ui, sans-serif'; ctx.fillStyle = mut; ctx.textAlign = 'right'; ctx.fillText(tr(T('rtBy')), W - 80, H - 94); ctx.textAlign = 'left';
  }
  function shareHtml(src) {
    return head(T('rtCardT'), 'rtback3') + '<p class="rz-mut sm">' + esc(T('rtCardH')) + '</p>' +
      '<div class="rt-cardw rt-in">' + (src ? '<img class="rt-card" id="rtCardImg" src="' + src + '" width="1080" height="1350" alt="' + esc((rt.nom || '') + ' — ' + T('rtLightV')) + '">' : '<div class="rt-card wait">' + esc(T('rtMaking')) + '</div>') + '</div>' +
      '<div class="sl-cta rt-cta2"><button type="button" class="sl-main" data-act="rtsend">' + ico('rshare') + ' ' + esc(T('rtShare')) + '</button><button type="button" class="rz-btn ghost rt-shb" data-act="rtdl" aria-label="' + esc(T('rtDl')) + '">' + ico('rdl') + '<span>' + esc(T('rtDl')) + '</span></button></div>';
  }
  function makeCard(cb) {
    var cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350;
    var go = function () { try { drawCard(cv); } catch (e) {} cv.toBlob(function (bl) { rt.blob = bl; if (rt.url) try { URL.revokeObjectURL(rt.url); } catch (e) {} rt.url = bl ? URL.createObjectURL(bl) : null; cb(); }, 'image/png'); };
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('800 120px Manrope'), document.fonts.load('600 40px Manrope'), document.fonts.load('700 40px Manrope')]).then(go, go); else go();
  }
  function fileName() { return 'kalkifit-yengil-' + (R.norm(rt.nom || 'retsept').replace(/[^a-z0-9а-я]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'retsept') + '.png'; }
  function download() { if (!rt.url) return; var a = document.createElement('a'); a.href = rt.url; a.download = fileName(); document.body.appendChild(a); a.click(); document.body.removeChild(a); count('retsept_ulashildi'); }
  function send() {
    if (!rt.blob) return; var f = null; try { f = new File([rt.blob], fileName(), { type: 'image/png' }); } catch (e) {}
    if (f && navigator.canShare && navigator.canShare({ files: [f] }) && navigator.share) { navigator.share({ files: [f], title: rt.nom, text: (rt.nom || '') + ' — ' + T('rtLightV') + ' · kalki.uz' }).then(function () { count('retsept_ulashildi'); A.toast(T('rtShared'), null, true); }, function () {}); }
    else download();
  }

  /* ---------- ekranlar ---------- */
  function show(scr) {
    rt.scr = scr; var html = scr === 'in' ? inHtml() : scr === 'scan' ? anHtml(true) : scr === 'an' ? anHtml(false) : scr === 'pick' ? pickHtml(rt.pq) : scr === 'res' ? resHtml() : shareHtml(rt.url);
    if (A.sheetKind() === 'retsept') A.setSheet(html); else A.openSheet('retsept', html);
    var sh = A.$('#rzSheet'); if (sh) { sh.scrollTop = 0; sh.classList.add('rt-sheet'); }
    if (scr === 'res') { if (!rt.counted) { rt.counted = true; count('retsept_natija'); } upd(true); }
    if (scr === 'pick') { var q = A.$('#rtPQ'); if (q) try { q.focus({ preventScroll: true }); } catch (e) {} }
  }
  function open() { rt = { scr: 'in', shown: '', chip: '', items: [], n: 4, nom: '', rules: [], on: {} }; count('retsept_ochildi'); show('in'); loadTable(function () {}); aiPeek(); }
  function door() { return '<button type="button" class="sl-door rt-door" id="rtDoor" data-act="rtopen"><span class="ic"><span class="rt-sp" aria-hidden="true">' + ico('rspark') + '</span></span><span class="m"><b>' + esc(T('rtDoorT')) + '</b><span>' + esc(T('rtDoorS')) + '</span></span>' + ico('chev', 'r') + '</button>'; }
  function applyParse(p) {
    rt.items = p.items.map(function (it) { var o = Object.assign({}, it); if (o.id && !(o.g > 0)) { o.g = 0; o.need = true; } return o; });
    rt.nom = p.nom || ''; rt.dish = p.dish; rt.pork = p.pork; rt.n = p.kishi || rt.n || 4;
  }
  function toAnalysis() { rt.busy = false; if (!rt.items.length && !rt.err) { rt.err = T('rtErrNone'); count('retsept_xato'); } show('an'); }
  function analyse(text) {
    rt.err = ''; rt.pork = false; rt.busy = false;
    var p = R.parse(text); applyParse(p);
    var unres = rt.items.filter(function (i) { return !i.id; });
    if (!unres.length) { show('scan'); setTimeout(function () { if (rt && rt.scr === 'scan') toAnalysis(); }, reduce() ? 0 : 420 + rt.items.length * 150); return; }
    /* mahalliy parser tanimagan qatorlar — AI (faqat shu qatorlar) */
    rt.busy = true; show('scan'); count('retsept_ai');
    var lines = unres.map(function (i) { return i.line; }).join('\n').slice(0, 700), t0 = Date.now();
    aiCall(lines, function (res) {
      var wait = Math.max(0, (reduce() ? 0 : 900) - (Date.now() - t0));
      setTimeout(function () {
        if (!rt || rt.scr !== 'scan') return;
        if (res.ok) mergeAi(unres, res.list); else rt.err = res.msg;
        if (rt.err) count('retsept_xato');
        toAnalysis();
      }, wait);
    });
  }
  function aiCall(lines, cb) {
    var body = JSON.stringify({ matn: lines, til: A.isCyr() ? 'kirill' : A.lang(), mijoz_id: A.cid(), platforma: plat() || undefined }), done = false, tm = setTimeout(function () { if (!done) { done = true; cb({ ok: false, msg: T('rtErrNet') }); } }, 25000);
    fetch('/api/retsept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); }).then(function (x) {
      if (done) return; done = true; clearTimeout(tm);
      aiSet(x.j); try { if (window.KalkiStatApp) window.KalkiStatApp.add('ai_sorov', 'retsept.' + (x.s === 200 ? 'ok' : x.s === 429 ? 'limit' : 'xato')); } catch (e) {}
      if (x.s === 200 && x.j && Array.isArray(x.j.masalliqlar)) cb({ ok: true, list: x.j.masalliqlar }); else if (x.s === 429 && x.j && x.j.sabab !== 'sayt' && x.j.limit > 0) cb({ ok: false, msg: T('rtLimit', { n: x.j.limit }) }); else cb({ ok: false, msg: x.j && x.j.xato ? x.j.xato : T('rtErrAi') });
    }).catch(function () { if (done) return; done = true; clearTimeout(tm); cb({ ok: false, msg: T('rtErrNet') }); });
  }
  function mergeAi(unres, list) {
    /* AI natijasini o'rniga qo'yish: nom bo'yicha moslash; aniq id bo'lsa — masalliq tanilgan (gramm yo'q bo'lsa — «miqdori» sariq); aks holda sariq qoladi */
    var used = {}, any = false;
    unres.forEach(function (u) {
      var un = R.norm(u.nom), hit = null;
      list.forEach(function (x, k) { if (!hit && !used[k] && x.id && R.table()[x.id] && (R.norm(x.nom).indexOf(un) > -1 || un.indexOf(R.norm(x.nom)) > -1 || R.norm(u.line).indexOf(R.norm(x.nom)) > -1)) { hit = x; used[k] = true; } });
      if (hit) { u.id = hit.id; u.ai = true; u.g = hit.g > 0 ? hit.g : 0; u.need = !(u.g > 0); any = true; }
    });
    if (!any) rt.err = T('rtErrAi');
  }
  function haveYellow() { return rt.items.some(function (it) { return !it.id || (it.need && !(it.g > 0)); }); }
  function save() {
    var items = itemsAfter().filter(function (i) { return i.id && i.g > 0; }), t = R.table();
    var ings = items.map(function (i) { var m = t[i.id]; return { id: null, name: m[L()], g: Math.round(i.g), k: m.k, p: m.p, f: m.f, c: m.c }; });
    var name = (rt.nom || cap(L() === 'ru' ? 'рецепт' : 'retsept')) + ' (' + T('rtLight') + ')'; return A.saveRecipe(name, ings, rt.n);
  }
  function keep(fn) { var sh = A.$('#rzSheet'), sc = sh ? sh.scrollTop : 0; fn(); sh = A.$('#rzSheet'); if (sh) sh.scrollTop = sc; }
  function act(a, el) {
    switch (a) {
      case 'rtopen': open(); return true;
      case 'rtex': { var k = el.getAttribute('data-x'); rt.chip = k; rt.ex = true; rt.exTxt = EX[k][L()]; rt.shown = tr(EX[k][L()]); rt.exShown = rt.shown; var ta = A.$('#rtText'); if (ta) ta.value = rt.shown; msg(''); A.$$('[data-act=rtex]').forEach(function (bt) { bt.classList.toggle('on', bt === el); }); return true; }
      case 'rtgo': {
        var txt = srcText().trim(); if (!txt) { var t0 = A.$('#rtText'); if (t0) { t0.classList.add('err'); setTimeout(function () { t0.classList.remove('err'); }, 600); try { t0.focus({ preventScroll: true }); } catch (e) {} } msg(T('rtEmpty')); return true; }
        if (txt.length < 8) { msg(T('rtShort')); return true; } if (txt.length > 1500) { msg(T('rtLong')); return true; } msg('');
        el.disabled = true; loadTable(function (ok) { el.disabled = false; if (!ok) { msg(T('rtErrNet')); count('retsept_xato'); return; } if (rt && rt.scr === 'in') analyse(txt); }); return true;
      }
      case 'rtback1': rt.err = ''; show('in'); return true;
      case 'rtback2': show('an'); return true;
      case 'rtback3': show('res'); return true;
      case 'rtg': { var it = rt.items[+el.getAttribute('data-i')]; if (!it) return true; it.g = grams(it, step(disp(it), +el.getAttribute('data-s'))); if (it.g > 0) it.need = false; keep(function () { show('an'); }); return true; }
      case 'rtn': rt.n = Math.max(1, Math.min(12, rt.n + (+el.getAttribute('data-s')))); keep(function () { show('an'); }); return true;
      case 'rtset': { var it1 = rt.items[+el.getAttribute('data-i')]; if (it1) { it1.id = el.getAttribute('data-o'); it1.cands = []; if (!(it1.g > 0)) { it1.need = true; it1.g = 0; } } keep(function () { show('an'); }); return true; }
      case 'rtdrop': rt.items.splice(+el.getAttribute('data-i'), 1); keep(function () { show('an'); }); return true;
      case 'rtpick': rt.pickFor = +el.getAttribute('data-i'); rt.pq = ''; show('pick'); return true;
      case 'rtchoose': {
        var id = el.getAttribute('data-o'), f = rt.pickFor;
        if (f >= 0 && rt.items[f]) { var x = rt.items[f]; x.id = id; x.cands = []; if (!(x.g > 0)) { x.g = 0; x.need = true; } } else rt.items.push({ n: 800 + rt.items.length, line: '', nom: R.table()[id].uz, id: id, q: null, b: null, g: 0, need: true, cands: [] });
        show('an'); return true;
      }
      case 'rtnext': {
        if (!rt.items.some(function (i) { return i.id && i.g > 0; }) && !haveYellow()) { rt.err = T('rtNone'); show('an'); return true; }
        if (haveYellow()) { var bad = A.$('.rt-ing.unk, .rt-ing.need'); if (bad) { bad.classList.remove('shake'); void bad.offsetWidth; bad.classList.add('shake'); try { bad.scrollIntoView({ block: 'center', behavior: reduce() ? 'auto' : 'smooth' }); } catch (e) {} } A.toast(T('rtNeedFix')); return true; }
        rt.err = ''; rt.dish = R.dishOf(rt.items, rt.nom); prepRules(); rt.saved = null; rt.counted = false; show('res'); return true;
      }
      case 'rttog': { var rid = el.getAttribute('data-c'); rt.on[rid] = !rt.on[rid]; rt.saved = null; var sb = A.$('#rtSaveB'); if (sb) sb.textContent = T('rtSave'); upd(false); return true; }
      case 'rtsave': {
        if (rt.saved) { A.openAddFood(rt.saved.id); return true; }
        var rec = save(); if (!rec) { A.toast(T('rtNoSave')); return true; } rt.saved = rec; count('retsept_saqlandi'); var sb2 = A.$('#rtSaveB'); if (sb2) sb2.textContent = T('rtSavedBtn'); A.toast(T('rtSaved', { n: rec.n, k: curT().k }), null, true); return true;
      }
      case 'rtshare': rt.url = null; show('share'); makeCard(function () { if (rt.scr === 'share') show('share'); }); return true;
      case 'rtsend': send(); return true;
      case 'rtdl': download(); return true;
    }
    return false;
  }
  function onInput(e) {
    var t = e.target; if (!t || !rt) return;
    if (t.id === 'rtPQ' && rt.scr === 'pick') { rt.pq = t.value; var l = A.$('#rtPL'); if (l) l.innerHTML = pickList(pickIds(rt.pq)); }
    else if (t.id === 'rtText') { rt.shown = t.value; msg(''); }
  }
  function init(api) {
    A = api; Object.keys(D).forEach(function (l) { Object.keys(D[l]).forEach(function (k) { api.D[l][k] = D[l][k]; }); });
    api.addIcons(ICONS); document.addEventListener('input', onInput);
  }
  window.KalkiRetseptUI = { init: init, act: act, door: door, open: open };
})();
