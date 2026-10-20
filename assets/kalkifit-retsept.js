/* kalki.uz — KalkiFit: «Retseptimni moslashtir» (MAKET). AI YO'Q: soxta ma'lumot bilan bosib ko'riladigan 4 ekran (Kirish → Tahlil → Natija → Ulashish kartochkasi).
 * Hisob maketda ham haqiqiy: masalliq gramm × 100 g dagi qiymat (baza qiymatlariga yaqin, qo'lda) — o'zgarish yoqilsa/o'chirilsa raqamlar qayta hisoblanadi.
 * Keyingi bosqich (haqiqiy AI, baza id, limit, kesh, hisoblagichlar): docs/retsept-reja.md.
 * kalkifit-app.js dan OLDIN yuklanadi va window.KalkiRetseptUI ni beradi; ilova init() da bog'laydi (api). Kirish: «Bugun nima yeymiz?» → Uyda; Profil → Mening taomlarim. */
(function () {
  'use strict';
  var A = null;
  var D = {
    uz: {
      rtRow: "O'z retseptimni yengillashtirish", rtRowS: "Retseptni yuboring — ta'mi qoladi, kaloriyasi kamayadi", rtMk: 'Maket',
      rtH: 'Retseptingizni yuboring — yengilroq qilib beramiz', rtSub: "Masalliqlarni yozing yoki qo'lda yozilgan retseptni rasmga oling.",
      rtPh: "Onamning oshi: 1 kg guruch, 1 kg qo'y go'shti, 300 g yog', 1 kg sabzi…", rtCam: 'Rasmga olish', rtEx: 'Misollar', rtGo: 'Moslashtirish',
      rtEmpty: 'Retseptni yozing yoki misolni tanlang', rtCamRead: "Rasm o'qildi (maket: namunaviy matn)",
      rtScan: 'Masalliqlar tanilmoqda…', rtFound: '{n} ta masalliq topildi', rtIngT: 'Masalliqlar', rtIngH: "Grammni − / + bilan to'g'rilang.", rtBase: 'bazada: {b}',
      rtUnk: 'tanlang', rtUnkH: 'Bu masalliq bazada aniq topilmadi — qaysi biri?', rtUnkNo: "Qo'shmaslik", rtUnkNeed: 'Sariq belgili masalliqni tanlang',
      rtPeople: 'Necha kishiga?', rtNext: 'Davom',
      rtPor: '1 porsiya', rtKcal: 'kkal', rtPct: '{p}%', rtProtOk: 'oqsil saqlandi', rtProtUp: 'oqsil +{g} g', rtProtDn: 'oqsil −{g} g', rtNoCh: "O'zgarishlarni yoqing",
      rtCmp: 'Oldin / Keyin', rtBefore: 'Oldin', rtAfter: 'Keyin', rtMK: 'Kaloriya', rtMP: 'Oqsil', rtMF: "Yog'",
      rtChT: "Aqlli o'zgarishlar", rtChH: "Har birini yoqing yoki o'chiring — raqam darhol o'zgaradi.", rtBen: '−{k} kkal porsiyada', rtBen0: "kaloriya deyarli o'zgarmaydi",
      rtT0: 'deyarli sezilmaydi', rtT1: 'ozgina farq', rtT2: "boshqacha ta'm",
      rtNote: 'Raqamlar taxminiy, KalkiFit bazasi asosida.', rtSave: 'Saqlash — Mening taomlarim', rtShare: 'Ulashish', rtSaved: "Maket: haqiqiy saqlash keyingi bosqichda",
      rtCardT: 'Ulashish kartochkasi', rtCardH: "Instagram yoki Telegram'ga qo'yish uchun rasm.", rtDl: 'Yuklab olish', rtShared: 'Ulashildi', rtMaking: 'Rasm tayyorlanmoqda…',
      rtLight: 'Yengil versiya', rtBy: 'KalkiFit bilan hisoblandi', rtCardSub: '1 porsiya: {a} → {b} kkal', rtPeopleN: '{n} kishilik',
      rtBack: 'Orqaga'
    },
    ru: {
      rtRow: 'Облегчить мой рецепт', rtRowS: 'Пришлите рецепт — вкус сохраним, калорий станет меньше', rtMk: 'Макет',
      rtH: 'Пришлите рецепт — сделаем его легче', rtSub: 'Напишите ингредиенты или сфотографируйте рецепт, написанный от руки.',
      rtPh: 'Мамин плов: 1 кг риса, 1 кг баранины, 300 г масла, 1 кг моркови…', rtCam: 'Сфотографировать', rtEx: 'Примеры', rtGo: 'Облегчить',
      rtEmpty: 'Напишите рецепт или выберите пример', rtCamRead: 'Фото прочитано (макет: пример текста)',
      rtScan: 'Распознаём ингредиенты…', rtFound: 'Найдено ингредиентов: {n}', rtIngT: 'Ингредиенты', rtIngH: 'Поправьте граммы кнопками − / +.', rtBase: 'в базе: {b}',
      rtUnk: 'выберите', rtUnkH: 'Этот ингредиент не найден точно — какой именно?', rtUnkNo: 'Не добавлять', rtUnkNeed: 'Выберите ингредиент с жёлтой меткой',
      rtPeople: 'На сколько человек?', rtNext: 'Дальше',
      rtPor: '1 порция', rtKcal: 'ккал', rtPct: '{p}%', rtProtOk: 'белок сохранён', rtProtUp: 'белок +{g} г', rtProtDn: 'белок −{g} г', rtNoCh: 'Включите изменения',
      rtCmp: 'До / После', rtBefore: 'До', rtAfter: 'После', rtMK: 'Калории', rtMP: 'Белок', rtMF: 'Жиры',
      rtChT: 'Умные изменения', rtChH: 'Включайте и выключайте — число меняется сразу.', rtBen: '−{k} ккал на порцию', rtBen0: 'калории почти не меняются',
      rtT0: 'почти незаметно', rtT1: 'небольшая разница', rtT2: 'другой вкус',
      rtNote: 'Цифры примерные, по базе KalkiFit.', rtSave: 'Сохранить — Мои блюда', rtShare: 'Поделиться', rtSaved: 'Макет: настоящее сохранение — на следующем этапе',
      rtCardT: 'Карточка для соцсетей', rtCardH: 'Картинка для Instagram или Telegram.', rtDl: 'Скачать', rtShared: 'Отправлено', rtMaking: 'Готовим картинку…',
      rtLight: 'Лёгкая версия', rtBy: 'Посчитано в KalkiFit', rtCardSub: '1 порция: {a} → {b} ккал', rtPeopleN: 'на {n} чел.',
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
    rwheat: 'M12 21V9 M12 9c-2.6 0-3.8-2.4-3.8-5 2.2 0 3.8 1.5 3.8 5z M12 9c2.6 0 3.8-2.4 3.8-5-2.2 0-3.8 1.5-3.8 5z M12 14.5c-2.6 0-3.8-2.4-3.8-5 M12 14.5c2.6 0 3.8-2.4 3.8-5',
    rbeef: 'M5 9c2-4 9-5 13-2 3 2.2 2 7-2 8.6-3.6 1.4-6 4-9 3-3-1-3.6-6.4-2-9.6z M12 11a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z',
    rok: 'M5 12.5l4.5 4.5L19 7.5', rshare: 'M12 4v11 M7.5 8.5L12 4l4.5 4.5 M5 14v6h14v-6', rdl: 'M12 4v11 M7.5 10.5L12 15l4.5-4.5 M5 20h14'
  };
  /* ---------- soxta ma'lumot: masalliq (g — butun qozon uchun), 100 g dagi k(kkal)/p(oqsil)/f(yog') — baza qiymatlariga yaqin ---------- */
  var ING = {
    guruch: { uz: 'Guruch', ru: 'Рис', b: { uz: 'Guruch, xom', ru: 'Рис, сырой' }, k: 350, p: 7, f: 0.6 },
    qoy: { uz: "Qo'y go'shti", ru: 'Баранина', b: { uz: "Qo'y go'shti, xom", ru: 'Баранина, сырая' }, k: 250, p: 17, f: 20 },
    dumba: { uz: 'Dumba', ru: 'Курдюк', b: { uz: "Dumba yog'i", ru: 'Курдючный жир' }, k: 760, p: 2, f: 82 },
    yog: { uz: "O'simlik yog'i", ru: 'Растительное масло', b: { uz: "Paxta yog'i", ru: 'Хлопковое масло' }, k: 899, p: 0, f: 99.9 },
    sabzi: { uz: 'Sabzi', ru: 'Морковь', b: { uz: 'Sabzi, sariq', ru: 'Морковь, жёлтая' }, k: 41, p: 0.9, f: 0.2 },
    piyoz: { uz: 'Piyoz', ru: 'Лук', b: { uz: 'Piyoz', ru: 'Лук репчатый' }, k: 40, p: 1.1, f: 0.1 },
    noxat: { uz: "No'xat", ru: 'Нут', b: { uz: "No'xat, quruq", ru: 'Нут, сухой' }, k: 364, p: 19, f: 6 },
    zira: { uz: 'Zira', ru: 'Зира', b: { uz: 'Zira', ru: 'Зира' }, k: 375, p: 18, f: 22 },
    mayiz: { uz: 'Mayiz', ru: 'Изюм', b: { uz: 'Mayiz', ru: 'Изюм' }, k: 299, p: 3.1, f: 0.5 },
    qmayiz: { uz: 'Qora mayiz', ru: 'Тёмный изюм', b: { uz: 'Qora mayiz', ru: 'Тёмный изюм' }, k: 299, p: 3.1, f: 0.5 },
    orik: { uz: "Quritilgan o'rik", ru: 'Курага', b: { uz: "O'rik, quritilgan", ru: 'Курага' }, k: 241, p: 3.4, f: 0.5 },
    tovuq: { uz: 'Tovuq filesi', ru: 'Куриное филе', b: { uz: "Tovuq ko'kragi, xom", ru: 'Куриная грудка, сырая' }, k: 120, p: 22.5, f: 2.6 },
    mol: { uz: "Mol go'shti", ru: 'Говядина', b: { uz: "Mol go'shti, xom", ru: 'Говядина, сырая' }, k: 218, p: 18.6, f: 16 },
    molyog: { uz: "Yog'siz mol go'shti", ru: 'Постная говядина', b: { uz: "Mol go'shti, yog'siz (5%)", ru: 'Говядина постная (5%)' }, k: 137, p: 21, f: 5 },
    kartoshka: { uz: 'Kartoshka', ru: 'Картофель', b: { uz: 'Kartoshka', ru: 'Картофель' }, k: 77, p: 2, f: 0.1 },
    pomidor: { uz: 'Pomidor', ru: 'Помидоры', b: { uz: 'Pomidor', ru: 'Помидоры' }, k: 18, p: 0.9, f: 0.2 },
    qaymoq: { uz: 'Qaymoq (smetana)', ru: 'Сметана', b: { uz: 'Smetana, 20%', ru: 'Сметана, 20%' }, k: 206, p: 2.8, f: 20 },
    qatiq: { uz: 'Qatiq', ru: 'Катык', b: { uz: 'Qatiq, 2,5%', ru: 'Катык, 2,5%' }, k: 53, p: 2.9, f: 2.5 },
    ukrop: { uz: 'Shivit', ru: 'Укроп', b: { uz: 'Shivit', ru: 'Укроп' }, k: 43, p: 3.5, f: 1.1 },
    kashnich: { uz: 'Kashnich', ru: 'Кинза', b: { uz: 'Kashnich', ru: 'Кинза' }, k: 23, p: 2.1, f: 0.5 },
    un: { uz: 'Un', ru: 'Мука', b: { uz: "Bug'doy uni, oliy nav", ru: 'Мука пшеничная, в/с' }, k: 364, p: 10, f: 1 },
    murch: { uz: 'Qora murch', ru: 'Чёрный перец', b: { uz: 'Qora murch', ru: 'Перец чёрный' }, k: 251, p: 10, f: 3.3 }
  };
  /* o'zgarish turlari: scale (ko'paytirish), zero, move (bir qismini boshqa masalliqqa), swap (o'rniga), add (+g) */
  var EX = {
    osh: {
      nom: { uz: 'Onamning oshi', ru: 'Мамин плов' }, chip: { uz: 'Osh', ru: 'Плов' }, n: 6,
      txt: { uz: "Onamning oshi (6 kishi): 450 g guruch, 450 g qo'y go'shti, 60 g dumba, 130 g yog', 450 g sabzi, 150 g piyoz, 70 g no'xat, 40 g kishmish, zira.", ru: 'Мамин плов (на 6): рис 450 г, баранина 450 г, курдюк 60 г, масло 130 г, морковь 450 г, лук 150 г, нут 70 г, кишмиш 40 г, зира.' },
      ings: [['guruch', 450], ['qoy', 450], ['dumba', 60], ['yog', 130], ['sabzi', 450], ['piyoz', 150], ['noxat', 70], ['?kishmish', 40, ['mayiz', 'qmayiz', 'orik']], ['zira', 5]],
      unk: { kishmish: { uz: 'Kishmish', ru: 'Кишмиш' } },
      ch: [
        { id: 'yog', ic: 'rdrop', ops: [['scale', 'yog', 70 / 130]], taste: 0, t: { uz: "Yog'ni kamaytirish: {a} → {b} g", ru: 'Меньше масла: {a} → {b} г' }, s: { uz: "Yog' {a} → {b} g", ru: 'Масло {a} → {b} г' } },
        { id: 'dumba', ic: 'rfat', ops: [['zero', 'dumba']], taste: 1, t: { uz: "Dumbasiz: {a} g dumba olib tashlanadi", ru: 'Без курдюка: убираем {a} г' }, s: { uz: 'Dumbasiz', ru: 'Без курдюка' } },
        { id: 'tovuq', ic: 'rleg', ops: [['move', 'qoy', 1 / 3, 'tovuq']], taste: 1, t: { uz: "Go'shtning 1/3 qismi — tovuq filesi ({m} g)", ru: 'Треть мяса — куриное филе ({m} г)' }, s: { uz: "1/3 go'sht — tovuq", ru: '1/3 мяса — курица' } },
        { id: 'sabzi', ic: 'rcarrot', ops: [['add', 'sabzi', 200], ['add', 'guruch', -50]], taste: 0, t: { uz: 'Sabzi ko\'proq: {a} → {b} g, guruch −50 g', ru: 'Больше моркови: {a} → {b} г, рис −50 г' }, s: { uz: 'Sabzi +200 g', ru: 'Морковь +200 г' } }
      ]
    },
    mastava: {
      nom: { uz: 'Mastava', ru: 'Мастава' }, chip: { uz: 'Mastava', ru: 'Мастава' }, n: 4,
      txt: { uz: "Mastava (4 kishi): 300 g mol go'shti, 120 g guruch, 300 g kartoshka, 150 g sabzi, 120 g piyoz, 200 g pomidor, 60 g yog', 100 g qaymoq, ko'kat.", ru: 'Мастава (на 4): говядина 300 г, рис 120 г, картофель 300 г, морковь 150 г, лук 120 г, помидоры 200 г, масло 60 г, сметана 100 г, зелень.' },
      ings: [['mol', 300], ['guruch', 120], ['kartoshka', 300], ['sabzi', 150], ['piyoz', 120], ['pomidor', 200], ['yog', 60], ['qaymoq', 100], ['?kokat', 20, ['ukrop', 'kashnich']]],
      unk: { kokat: { uz: "Ko'kat", ru: 'Зелень' } },
      ch: [
        { id: 'yog', ic: 'rdrop', ops: [['scale', 'yog', 0.5]], taste: 0, t: { uz: "Yog'ni kamaytirish: {a} → {b} g", ru: 'Меньше масла: {a} → {b} г' }, s: { uz: "Yog' {a} → {b} g", ru: 'Масло {a} → {b} г' } },
        { id: 'molyog', ic: 'rbeef', ops: [['swap', 'mol', 'molyog']], taste: 0, t: { uz: "Yog'siz mol go'shti ({a} g)", ru: 'Постная говядина ({a} г)' }, s: { uz: "Yog'siz go'sht", ru: 'Постное мясо' } },
        { id: 'qatiq', ic: 'rcup', ops: [['swap', 'qaymoq', 'qatiq']], taste: 1, t: { uz: 'Qaymoq o\'rniga qatiq ({a} g)', ru: 'Катык вместо сметаны ({a} г)' }, s: { uz: 'Qaymoq → qatiq', ru: 'Сметана → катык' } }
      ]
    },
    manti: {
      nom: { uz: 'Manti', ru: 'Манты' }, chip: { uz: 'Manti', ru: 'Манты' }, n: 5,
      txt: { uz: "Manti (5 kishi): 500 g un, 500 g qo'y go'shti, 100 g dumba, 600 g piyoz, ziravor, tortishga 150 g qaymoq.", ru: 'Манты (на 5): мука 500 г, баранина 500 г, курдюк 100 г, лук 600 г, специи, к подаче сметана 150 г.' },
      ings: [['un', 500], ['qoy', 500], ['dumba', 100], ['piyoz', 600], ['qaymoq', 150], ['?ziravor', 5, ['zira', 'murch']]],
      unk: { ziravor: { uz: 'Ziravor', ru: 'Специи' } },
      ch: [
        { id: 'dumba', ic: 'rfat', ops: [['scale', 'dumba', 0.3]], taste: 1, t: { uz: 'Dumbani kamaytirish: {a} → {b} g', ru: 'Меньше курдюка: {a} → {b} г' }, s: { uz: 'Dumba {a} → {b} g', ru: 'Курдюк {a} → {b} г' } },
        { id: 'molyog', ic: 'rbeef', ops: [['move', 'qoy', 0.5, 'molyog']], taste: 0, t: { uz: "Go'shtning yarmi — yog'siz mol go'shti ({m} g)", ru: 'Половина мяса — постная говядина ({m} г)' }, s: { uz: "1/2 go'sht — yog'siz", ru: '1/2 мяса — постное' } },
        { id: 'un', ic: 'rwheat', ops: [['scale', 'un', 0.84]], taste: 0, t: { uz: 'Hamir yupqaroq: un {a} → {b} g', ru: 'Тесто тоньше: мука {a} → {b} г' }, s: { uz: 'Yupqa hamir', ru: 'Тонкое тесто' } },
        { id: 'qatiq', ic: 'rcup', ops: [['swap', 'qaymoq', 'qatiq']], taste: 1, t: { uz: 'Qaymoq o\'rniga qatiq bilan tortish', ru: 'Подавать с катыком вместо сметаны' }, s: { uz: 'Qaymoq → qatiq', ru: 'Сметана → катык' } }
      ]
    }
  };
  var ORDER = ['osh', 'mastava', 'manti'];
  var rt = null;                                                   // { scr, ex, text, nom, ings:[{id,g,unk?,opts?,uz?,ru?}], n, on:{}, from }

  function T(k, o) { return A.T(k, o); }
  function esc(s) { return A.esc(s); }
  function L() { return A.lang() === 'ru' ? 'ru' : 'uz'; }
  function lbl(o) { return o ? (L() === 'ru' ? (o.ru || o.uz) : o.uz) : ''; }
  function reduce() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function r5(g) { return Math.max(0, Math.round(g / 5) * 5); }
  function ico(n, c) { return A.ico(n, c); }
  function head(title, back) { return '<div class="sl-yh rt-yh">' + (back ? '<button type="button" class="sl-x" data-act="' + back + '" aria-label="' + esc(T('rtBack')) + '">' + ico('back') + '</button>' : '') + '<h3 class="sl-fwt">' + (title ? esc(title) : '<span class="rt-mk">' + esc(T('rtMk')) + '</span>') + '</h3><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + ico('x') + '</button></div>'; }

  /* ---------- hisob ---------- */
  function ingName(it) { return it.unk ? lbl(it.unkNom) : lbl(ING[it.id]); }
  function cloneIngs(l) { return l.map(function (x) { return { id: x.id, g: x.g, unk: x.unk, unkNom: x.unkNom, opts: x.opts }; }); }
  function applyCh(ings, ch) {
    var l = cloneIngs(ings), find = function (id) { for (var i = 0; i < l.length; i++) if (l[i].id === id && !l[i].unk) return l[i]; return null; };
    ch.ops.forEach(function (o) {
      var it = find(o[1]); if (!it) return;
      if (o[0] === 'scale') it.g = r5(it.g * o[2]);
      else if (o[0] === 'zero') it.g = 0;
      else if (o[0] === 'add') it.g = Math.max(0, it.g + o[2]);
      else if (o[0] === 'swap') it.id = o[2];
      else if (o[0] === 'move') { var m = r5(it.g * o[2]); it.g -= m; var t = find(o[3]); if (t) t.g += m; else l.push({ id: o[3], g: m }); }
    });
    return l;
  }
  function withChanges(ids) { var l = cloneIngs(rt.ings), ex = EX[rt.ex]; ex.ch.forEach(function (c) { if (ids[c.id]) l = applyCh(l, c); }); return l; }
  function totals(l) { var s = { k: 0, p: 0, f: 0 }; l.forEach(function (it) { var d = it.unk ? null : ING[it.id]; if (!d || !it.g) return; s.k += it.g * d.k / 100; s.p += it.g * d.p / 100; s.f += it.g * d.f / 100; }); var n = rt.n || 1; return { k: Math.round(s.k / n), p: Math.round(s.p / n), f: Math.round(s.f / n) }; }
  function base() { return totals(rt.ings); }
  function cur() { return totals(withChanges(rt.on)); }
  function chBenefit(c) { var b = base().k, o = {}; o[c.id] = true; return Math.max(0, b - totals(withChanges(o)).k); }
  function chTitle(c, short) {
    var src = cloneIngs(rt.ings), op = c.ops[0], it = null; src.forEach(function (x) { if (x.id === op[1] && !x.unk) it = x; });
    var a = it ? it.g : 0, aft = applyCh(src, c), b = 0, m = op[0] === 'move' ? r5(a * op[2]) : 0; aft.forEach(function (x) { if (x.id === op[1]) b = x.g; });
    if (op[0] === 'add') { a = it ? it.g : 0; b = a + op[2]; }
    return lbl(short ? c.s : c.t).replace('{a}', a).replace('{b}', b).replace('{m}', m).replace(/(\d) (g|г)\b/g, '$1\u00a0$2');      // «70 g» bir qatorda
  }

  /* ---------- 1. Kirish ---------- */
  function inHtml() {
    return head('') +
      '<div class="rt-hero rt-in"><span class="rt-spk" aria-hidden="true">' + ico('rspark') + '</span><h2 class="rt-h">' + esc(T('rtH')) + '</h2><p class="rz-mut">' + esc(T('rtSub')) + '</p></div>' +
      '<label class="rt-ta rt-in" for="rtText"><span class="sr">' + esc(T('rtH')) + '</span><textarea id="rtText" rows="6" maxlength="1500" placeholder="' + esc(T('rtPh')) + '">' + esc(rt.text || '') + '</textarea></label>' +
      '<button type="button" class="rz-btn ghost full rt-cam rt-in" data-act="rtcam">' + ico('rcam') + ' ' + esc(T('rtCam')) + '</button><input type="file" id="rtFile" accept="image/*" capture="environment" hidden>' +
      '<div class="rz-st rt-in">' + esc(T('rtEx')) + '</div><div class="rt-chips rt-in" role="group" aria-label="' + esc(T('rtEx')) + '">' + ORDER.map(function (k) { return '<button type="button" class="rz-chip' + (rt.chip === k ? ' on' : '') + '" data-act="rtex" data-x="' + k + '">' + esc(lbl(EX[k].chip)) + '</button>'; }).join('') + '</div>' +
      '<div class="sl-cta"><button type="button" class="sl-main rt-go" data-act="rtgo">' + ico('rspark') + ' ' + esc(T('rtGo')) + '</button></div>';
  }
  function pickEx(text) { var t = (text || '').toLowerCase(); if (/mastava|мастава/.test(t)) return 'mastava'; if (/mant[iy]|манты|манти/.test(t)) return 'manti'; return 'osh'; }
  function dishName(text, ex) { var m = /^\s*([^:(\n,]{2,32})\s*[:(]/.exec(text || ''); return m ? m[1].trim() : lbl(EX[ex].nom); }
  function startEx(k, text) {
    var ex = EX[k];
    rt.ex = k; rt.nom = dishName(text, k); rt.n = ex.n; rt.on = {}; ex.ch.forEach(function (c) { rt.on[c.id] = true; });
    rt.ings = ex.ings.map(function (x) { if (x[0].charAt(0) === '?') { var u = x[0].slice(1); return { id: u, g: x[1], unk: true, unkNom: ex.unk[u], opts: x[2] }; } return { id: x[0], g: x[1] }; });
  }

  /* ---------- 2. Tahlil ---------- */
  function ingRow(it, i, scan) {
    var nm = ingName(it);
    if (it.unk) {
      return '<div class="rt-ing unk' + (scan ? ' scan' : '') + '" id="rtUnk" style="--i:' + i + '"><div class="nm"><b>' + esc(nm) + '</b><span class="rt-warn">' + esc(T('rtUnk')) + '</span></div>' +
        (scan ? '<span class="rt-q" aria-hidden="true">?</span>' : '<p class="rz-mut sm">' + esc(T('rtUnkH')) + '</p><div class="rt-opts">' + it.opts.map(function (o) { return '<button type="button" class="rz-chip" data-act="rtunk" data-o="' + o + '">' + esc(lbl(ING[o])) + '</button>'; }).join('') + '<button type="button" class="rz-chip" data-act="rtunk" data-o="">' + esc(T('rtUnkNo')) + '</button></div>') + '</div>';
    }
    var d = ING[it.id];
    return '<div class="rt-ing' + (scan ? ' scan' : '') + (it.g ? '' : ' off') + '" style="--i:' + i + '"><div class="nm"><b>' + esc(nm) + '</b><small>' + esc(T('rtBase', { b: lbl(d.b) })) + '</small></div>' +
      (scan ? '<span class="rt-ok" aria-hidden="true">' + ico('rok') + '</span>' : '<div class="rt-step" role="group" aria-label="' + esc(nm) + '"><button type="button" class="sl-pill" data-act="rtg" data-i="' + i + '" data-s="-1" aria-label="' + esc(nm) + ' −"' + (it.g <= 0 ? ' disabled' : '') + '>−</button><b aria-live="polite">' + it.g + ' g</b><button type="button" class="sl-pill" data-act="rtg" data-i="' + i + '" data-s="1" aria-label="' + esc(nm) + ' +">+</button></div>') + '</div>';
  }
  function anHtml(scan) {
    var rows = rt.ings.map(function (it, i) { return ingRow(it, i, scan); }).join('');
    if (scan) return head(rt.nom, 'rtback1') + '<div class="rt-scanh"><b>' + esc(T('rtScan')) + '</b><span class="rt-bar"><i></i></span></div><div class="rt-ings">' + rows + '</div>';
    return head(rt.nom, 'rtback1') + '<p class="rt-found rt-in">' + ico('rok') + ' ' + esc(T('rtFound', { n: rt.ings.length })) + '</p>' +
      '<div class="rz-st rt-in">' + esc(T('rtIngT')) + '</div><p class="rz-mut sm rt-in">' + esc(T('rtIngH')) + '</p><div class="rt-ings rt-in">' + rows + '</div>' +
      '<div class="rz-st rt-in">' + esc(T('rtPeople')) + '</div><div class="sl-stp rt-in" role="group" aria-label="' + esc(T('rtPeople')) + '"><button type="button" class="sl-pill" data-act="rtn" data-s="-1" aria-label="−"' + (rt.n <= 1 ? ' disabled' : '') + '>−</button><b id="rtN" aria-live="polite">' + rt.n + '</b><button type="button" class="sl-pill" data-act="rtn" data-s="1" aria-label="+"' + (rt.n >= 12 ? ' disabled' : '') + '>+</button></div>' +
      '<div class="sl-cta"><button type="button" class="sl-main" data-act="rtnext">' + esc(T('rtNext')) + '</button></div>';
  }
  function step(g, dir) { var s = g >= 300 ? 50 : g >= 100 ? 10 : 5; return Math.max(0, Math.min(5000, dir > 0 ? Math.floor(g / s) * s + s : Math.ceil(g / s) * s - s)); }

  /* ---------- 3. Natija ---------- */
  /* raqam lentasi: har xona — bo'sh + 0–9 ustuni, translateY bilan aylanadi (pastga «aylanib» tushadi); xonalar soni = asl qiymatnikidek, ortiqcha bosh xona eni 0 ga tushadi */
  var STRIP = ' 0123456789';
  function cells(n, w) { var s = String(n); while (s.length < w) s = ' ' + s; return s.split(''); }
  function odo(n, w) {
    return cells(n, w).map(function (c) { var k = STRIP.indexOf(c); return '<span class="d' + (c === ' ' ? ' b' : '') + '"><span class="s" style="transform:translateY(-' + k + 'em)">' + STRIP.split('').map(function (x) { return '<i>' + (x === ' ' ? '&nbsp;' : x) + '</i>'; }).join('') + '</span></span>'; }).join('');
  }
  function setOdo(el, n) {
    if (!el) return; var ds = el.querySelectorAll('.d'), cs = cells(n, ds.length);
    el.setAttribute('aria-label', n + ' ' + T('rtKcal'));
    if (cs.length !== ds.length) { el.innerHTML = odo(n, cs.length); return; }
    cs.forEach(function (c, i) { ds[i].classList.toggle('b', c === ' '); ds[i].firstChild.style.transform = 'translateY(-' + STRIP.indexOf(c) + 'em)'; });
  }
  function pct(a, b) { return a ? Math.round((b - a) / a * 100) : 0; }
  function protTxt(b, c) { var d = c.p - b.p; if (d >= -1) return d >= 2 ? T('rtProtUp', { g: d }) : T('rtProtOk'); return T('rtProtDn', { g: -d }); }
  function barsHtml() {
    return [['k', 'rtMK', T('rtKcal')], ['p', 'rtMP', 'g'], ['f', 'rtMF', 'g']].map(function (m) {
      return '<div class="rt-bm ' + m[0] + '"><div class="h"><span>' + esc(T(m[1])) + '</span><b><span class="o"></span> → <span class="n"></span> ' + esc(m[2]) + '</b></div>' +
        '<div class="rt-br o" aria-hidden="true"><i></i></div><div class="rt-br n" aria-hidden="true"><i></i></div></div>';
    }).join('');
  }
  function chHtml(c) {
    var on = !!rt.on[c.id], k = chBenefit(c);
    return '<button type="button" class="rt-ch' + (on ? ' on' : '') + '" role="switch" aria-checked="' + on + '" data-act="rttog" data-c="' + c.id + '"><span class="sl-ci">' + ico(c.ic) + '</span>' +
      '<span class="m"><b>' + esc(chTitle(c)) + '</b><span class="bn">' + esc(k >= 5 ? T('rtBen', { k: k }) : T('rtBen0')) + '</span><span class="rt-tb t' + c.taste + '">' + esc(T('rtT' + c.taste)) + '</span></span><span class="rt-sw" aria-hidden="true"><i></i></span></button>';
  }
  function resHtml() {
    var ex = EX[rt.ex], b = base();
    return head(rt.nom, 'rtback2') +
      '<section class="rt-big rt-in" aria-live="polite"><div class="l">' + esc(T('rtPor')) + ' · ' + esc(T('rtPeopleN', { n: rt.n })) + '</div>' +
      '<div class="v"><s class="old">' + b.k + '</s><span class="ar" aria-hidden="true">→</span><span class="rt-odo" id="rtOdo" role="img" aria-label="' + b.k + ' ' + esc(T('rtKcal')) + '">' + odo(b.k) + '</span><span class="u">' + esc(T('rtKcal')) + '</span></div>' +
      '<div class="rt-pchip" id="rtChip"></div></section>' +
      '<section class="rt-cmp rt-in"><div class="rz-st">' + esc(T('rtCmp')) + '</div><div class="rt-leg"><span class="o">' + esc(T('rtBefore')) + '</span><span class="n">' + esc(T('rtAfter')) + '</span></div>' + barsHtml() + '</section>' +
      '<div class="rz-st rt-in">' + esc(T('rtChT')) + '</div><p class="rz-mut sm rt-in">' + esc(T('rtChH')) + '</p><div class="rt-chs rt-in">' + ex.ch.map(chHtml).join('') + '</div>' +
      '<p class="rz-priv rt-in">' + esc(T('rtNote')) + '</p>' +
      '<div class="sl-cta rt-cta2"><button type="button" class="sl-main" data-act="rtsave">' + esc(T('rtSave')) + '</button><button type="button" class="rz-btn ghost rt-shb" data-act="rtshare" aria-label="' + esc(T('rtShare')) + '">' + ico('rshare') + '<span>' + esc(T('rtShare')) + '</span></button></div>';
  }
  function upd(first) {                                           // natija ekranini joyida yangilash (to'liq qayta chizmasdan — animatsiya uzilmasin)
    var sh = A.$('#rzSheet'); if (!sh || !rt || rt.scr !== 'res') return;
    var b = base(), c = cur(), any = Object.keys(rt.on).some(function (k) { return rt.on[k]; });
    var go = function () { setOdo(sh.querySelector('#rtOdo'), c.k); };
    if (first && !reduce()) setTimeout(go, 350); else go();
    var ch = sh.querySelector('#rtChip'), p = pct(b.k, c.k);
    ch.className = 'rt-pchip' + (any ? '' : ' none'); ch.textContent = any ? (p < 0 ? '−' + Math.abs(p) : '+' + p) + '% · ' + protTxt(b, c) : T('rtNoCh');
    ['k', 'p', 'f'].forEach(function (m) {
      var row = sh.querySelector('.rt-bm.' + m); if (!row) return; var mx = Math.max(b[m], c[m], 1);
      row.querySelector('.o').textContent = b[m]; row.querySelector('.n').textContent = c[m];
      row.querySelector('.rt-br.o i').style.width = Math.round(b[m] / mx * 100) + '%';
      var ni = row.querySelector('.rt-br.n i'), w = Math.round(c[m] / mx * 100) + '%';
      if (first && !reduce()) { ni.style.width = Math.round(b[m] / mx * 100) + '%'; setTimeout(function () { ni.style.width = w; }, 380); } else ni.style.width = w;
    });
    EX[rt.ex].ch.forEach(function (cc) { var el = sh.querySelector('[data-act=rttog][data-c="' + cc.id + '"]'); if (!el) return; var on = !!rt.on[cc.id]; el.classList.toggle('on', on); el.setAttribute('aria-checked', on); });
  }

  /* ---------- 4. Ulashish kartochkasi (canvas 1080×1350) ---------- */
  function tr(s) { var K = window.KalkiTranslit; return A.isCyr() && K && K.translit ? K.translit(s) : s; }
  function cssVar(n, d) { try { var v = getComputedStyle(A.$('.rz.sl') || document.documentElement).getPropertyValue(n).trim(); return v || d; } catch (e) { return d; } }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function fitText(ctx, s, max, size, weight) { var z = size; do { ctx.font = weight + ' ' + z + 'px Manrope, system-ui, sans-serif'; if (ctx.measureText(s).width <= max) break; z -= 4; } while (z > 30); return z; }
  function drawCard(cv) {
    var W = 1080, H = 1350, ctx = cv.getContext('2d'), b = base(), c = cur(), dk = b.k - c.k, p = pct(b.k, c.k);
    var acc = '#FF7E5C', acc2 = '#FFB46B', ink = '#FFF4EC', mut = 'rgba(255,244,236,.66)';
    var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#2A1712'); g.addColorStop(1, '#14100F'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var rg = ctx.createRadialGradient(W * 0.82, H * 0.2, 20, W * 0.82, H * 0.2, 640); rg.addColorStop(0, 'rgba(255,126,92,.45)'); rg.addColorStop(1, 'rgba(255,126,92,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    var rg2 = ctx.createRadialGradient(W * 0.1, H * 0.95, 10, W * 0.1, H * 0.95, 520); rg2.addColorStop(0, 'rgba(242,179,61,.18)'); rg2.addColorStop(1, 'rgba(242,179,61,0)'); ctx.fillStyle = rg2; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    /* yuqori: belgi + «Yengil versiya» */
    rr(ctx, 80, 84, 72, 72, 22); ctx.fillStyle = acc; ctx.fill(); ctx.fillStyle = '#1C0C06'; ctx.font = '800 44px Manrope, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('K', 116, 136);
    ctx.textAlign = 'left'; ctx.fillStyle = ink; ctx.font = '700 38px Manrope, system-ui, sans-serif'; ctx.fillText('KalkiFit', 172, 133);
    var pill = tr(T('rtLight')); ctx.font = '700 32px Manrope, system-ui, sans-serif'; var pw = ctx.measureText(pill).width + 56; rr(ctx, W - 80 - pw, 88, pw, 64, 32); ctx.strokeStyle = acc; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = acc; ctx.fillText(pill, W - 80 - pw + 28, 131);
    /* taom nomi */
    var nm = tr(rt.nom); fitText(ctx, nm, W - 160, 96, 800); ctx.fillStyle = ink; ctx.fillText(nm, 80, 330);
    ctx.font = '600 38px Manrope, system-ui, sans-serif'; ctx.fillStyle = mut; ctx.fillText(tr(T('rtPeopleN', { n: rt.n }) + ' · ' + T('rtPor')), 80, 392);
    /* katta raqam */
    var big = '−' + dk, gg = ctx.createLinearGradient(80, 470, 80, 720); gg.addColorStop(0, acc2); gg.addColorStop(1, acc);
    ctx.font = '800 76px Manrope, system-ui, sans-serif'; var uw = ctx.measureText(tr(T('rtKcal'))).width;
    var bz = fitText(ctx, big, W - 160 - uw - 24, 290, 800); ctx.fillStyle = gg; ctx.fillText(big, 72, 700); var bw = ctx.measureText(big).width;
    ctx.font = '800 76px Manrope, system-ui, sans-serif'; ctx.fillStyle = ink; ctx.fillText(tr(T('rtKcal')), 72 + bw + 24, 700 - bz * 0.06);
    ctx.font = '600 40px Manrope, system-ui, sans-serif'; ctx.fillStyle = mut; ctx.fillText(tr(T('rtCardSub', { a: b.k, b: c.k })) + (p < 0 ? '  ·  −' + Math.abs(p) + '%' : ''), 80, 784);
    /* o'zgarishlar */
    ctx.strokeStyle = 'rgba(255,244,236,.14)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(80, 850); ctx.lineTo(W - 80, 850); ctx.stroke();
    var on = EX[rt.ex].ch.filter(function (x) { return rt.on[x.id]; }).sort(function (a, z) { return chBenefit(z) - chBenefit(a); }).slice(0, 3);
    on.forEach(function (x, i) {
      var y = 930 + i * 92; ctx.beginPath(); ctx.arc(104, y - 13, 24, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,126,92,.18)'; ctx.fill();
      ctx.strokeStyle = acc; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(93, y - 13); ctx.lineTo(101, y - 5); ctx.lineTo(116, y - 22); ctx.stroke();
      var s = tr(chTitle(x, true)); fitText(ctx, s, W - 160 - 70, 44, 700); ctx.fillStyle = ink; ctx.fillText(s, 150, y);
    });
    /* pastki qator */
    ctx.font = '800 46px Manrope, system-ui, sans-serif'; ctx.fillStyle = ink; ctx.fillText('kalki.uz', 80, H - 92);
    var kw = ctx.measureText('kalki.uz').width; ctx.beginPath(); ctx.arc(80 + kw + 22, H - 107, 8, 0, Math.PI * 2); ctx.fillStyle = acc; ctx.fill();
    ctx.font = '600 32px Manrope, system-ui, sans-serif'; ctx.fillStyle = mut; ctx.textAlign = 'right'; ctx.fillText(tr(T('rtBy')), W - 80, H - 94); ctx.textAlign = 'left';
  }
  function shareHtml(src) {
    return head(T('rtCardT'), 'rtback3') + '<p class="rz-mut sm">' + esc(T('rtCardH')) + '</p>' +
      '<div class="rt-cardw rt-in">' + (src ? '<img class="rt-card" id="rtCardImg" src="' + src + '" width="1080" height="1350" alt="' + esc(rt.nom + ' — ' + T('rtLight')) + '">' : '<div class="rt-card wait">' + esc(T('rtMaking')) + '</div>') + '</div>' +
      '<div class="sl-cta rt-cta2"><button type="button" class="sl-main" data-act="rtsend">' + ico('rshare') + ' ' + esc(T('rtShare')) + '</button><button type="button" class="rz-btn ghost rt-shb" data-act="rtdl" aria-label="' + esc(T('rtDl')) + '">' + ico('rdl') + '<span>' + esc(T('rtDl')) + '</span></button></div>';
  }
  function makeCard(cb) {
    var cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350;
    var go = function () { try { drawCard(cv); } catch (e) {} cv.toBlob(function (bl) { rt.blob = bl; if (rt.url) try { URL.revokeObjectURL(rt.url); } catch (e) {} rt.url = bl ? URL.createObjectURL(bl) : null; cb(); }, 'image/png'); };
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('800 120px Manrope'), document.fonts.load('600 40px Manrope'), document.fonts.load('700 40px Manrope')]).then(go, go); else go();
  }
  function fileName() { return 'kalkifit-yengil-' + rt.ex + '.png'; }
  function download() { if (!rt.url) return; var a = document.createElement('a'); a.href = rt.url; a.download = fileName(); document.body.appendChild(a); a.click(); document.body.removeChild(a); }
  function send() {
    if (!rt.blob) return; var f = null; try { f = new File([rt.blob], fileName(), { type: 'image/png' }); } catch (e) {}
    if (f && navigator.canShare && navigator.canShare({ files: [f] }) && navigator.share) { navigator.share({ files: [f], title: rt.nom, text: rt.nom + ' — ' + T('rtLight') + ' · kalki.uz' }).then(function () { A.toast(T('rtShared'), null, true); }, function () {}); }
    else download();
  }

  /* ---------- ekranlar ---------- */
  function show(scr) {
    rt.scr = scr; var html = scr === 'in' ? inHtml() : scr === 'scan' ? anHtml(true) : scr === 'an' ? anHtml(false) : scr === 'res' ? resHtml() : shareHtml(rt.url);
    if (A.sheetKind() === 'retsept') A.setSheet(html); else A.openSheet('retsept', html);
    var sh = A.$('#rzSheet'); if (sh) { sh.scrollTop = 0; sh.classList.toggle('rt-sheet', true); }
    if (scr === 'res') upd(true);
  }
  function open(from) { rt = { scr: 'in', text: '', from: from || '' }; show('in'); }
  function analyse() {
    show('scan');
    if (reduce()) { show('an'); return; }
    var tok = rt.tok = {}; setTimeout(function () { if (rt && rt.tok === tok && rt.scr === 'scan') show('an'); }, 360 + rt.ings.length * 170);
  }
  function row() { return '<button type="button" class="rz-row rt-row" data-act="rtopen"><span class="sl-ci rt-ci">' + ico('rspark') + '</span><span class="m"><b>' + esc(T('rtRow')) + '</b><span>' + esc(T('rtRowS')) + '</span></span>' + ico('chev', 'r') + '</button>'; }
  function act(a, el) {
    switch (a) {
      case 'rtopen': open(el.getAttribute('data-f')); return true;
      case 'rtex': { var k = el.getAttribute('data-x'); rt.chip = k; rt.text = lbl(EX[k].txt); var ta = A.$('#rtText'); if (ta) ta.value = rt.text; A.$$('[data-act=rtex]').forEach(function (b) { b.classList.toggle('on', b === el); }); return true; }
      case 'rtcam': { var fi = A.$('#rtFile'); if (fi) fi.click(); return true; }
      case 'rtgo': {
        var t = A.$('#rtText'), v = (t && t.value || '').trim(); rt.text = v;
        if (!v) { if (t) { t.classList.add('err'); setTimeout(function () { t.classList.remove('err'); }, 600); try { t.focus({ preventScroll: true }); } catch (e) {} } A.toast(T('rtEmpty')); return true; }
        startEx(pickEx(v), v); analyse(); return true;
      }
      case 'rtback1': show('in'); return true;
      case 'rtback2': show('an'); return true;
      case 'rtback3': show('res'); return true;
      case 'rtg': { var i = +el.getAttribute('data-i'), it = rt.ings[i]; if (!it) return true; it.g = step(it.g, +el.getAttribute('data-s')); var sc = A.$('#rzSheet').scrollTop; show('an'); A.$('#rzSheet').scrollTop = sc; return true; }
      case 'rtn': { rt.n = Math.max(1, Math.min(12, rt.n + (+el.getAttribute('data-s')))); var sc2 = A.$('#rzSheet').scrollTop; show('an'); A.$('#rzSheet').scrollTop = sc2; return true; }
      case 'rtunk': { var o = el.getAttribute('data-o'); rt.ings.forEach(function (x) { if (x.unk) { if (o) { x.id = o; x.unk = false; } else { x.unk = false; x.id = x.opts[0]; x.g = 0; } } }); var sc3 = A.$('#rzSheet').scrollTop; show('an'); A.$('#rzSheet').scrollTop = sc3; return true; }
      case 'rtnext': {
        var u = A.$('#rtUnk'); if (u) { u.classList.remove('shake'); void u.offsetWidth; u.classList.add('shake'); try { u.scrollIntoView({ block: 'center', behavior: reduce() ? 'auto' : 'smooth' }); } catch (e) {} A.toast(T('rtUnkNeed')); return true; }
        show('res'); return true;
      }
      case 'rttog': { var id = el.getAttribute('data-c'); rt.on[id] = !rt.on[id]; upd(false); return true; }
      case 'rtsave': A.toast(T('rtSaved'), null, true); return true;
      case 'rtshare': rt.url = null; show('share'); makeCard(function () { if (rt.scr === 'share') show('share'); }); return true;
      case 'rtsend': send(); return true;
      case 'rtdl': download(); return true;
    }
    return false;
  }
  function onChange(e) {
    var t = e.target; if (!t || t.id !== 'rtFile' || !rt) return; var f = t.files && t.files[0]; if (!f) return;
    A.toast(T('rtCamRead'), null, true); rt.chip = 'osh'; rt.text = lbl(EX.osh.txt); var ta = A.$('#rtText'); if (ta) ta.value = rt.text; t.value = '';
  }
  function init(api) {
    A = api; Object.keys(D).forEach(function (l) { Object.keys(D[l]).forEach(function (k) { api.D[l][k] = D[l][k]; }); });
    api.addIcons(ICONS); document.addEventListener('change', onChange);
  }
  window.KalkiRetseptUI = { init: init, act: act, row: row, open: open, _ex: EX, _ing: ING, _calc: function (ex, on, n) { var keep = rt; rt = { ex: ex, n: n || EX[ex].n, on: on || {} }; startEx(ex, ''); if (n) rt.n = n; if (on) rt.on = on; var r = { base: base(), cur: cur() }; rt = keep; return r; } };
})();
