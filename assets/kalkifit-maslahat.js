/* kalki.uz — KalkiFit «Maslahatchi» (jonli nutritsiolog): QOIDALAR, matnlar, kun xulosasi, «Tahlil». Hammasi qurilmada, AI so'rovisiz, DOM'siz (UMD: window.KalkiMaslahat / require()).
 * Qoidalar (ustuvorlik tartibida, bir vaqtda bittasi):
 *   kam — kech (≥ 19:00) va iste'mol xavfsiz pastki chegaradan past: ogohlantirish (hech qachon maqtov emas);
 *   a yog' ≥ maqsad × 1,15 · b uglevod ≥ × 1,15 va oqsil < maqsad · c soat ≥ 17:00 va oqsil < × 0,60 · d kkal 85–115 % va kkalning > 45 % i yog'dan ·
 *   e kkal ≥ me'yor × 1,15 · f kech (≥ 19:00), kkal 90–110 % va har makro 85–115 % — maqtov.
 * Cheklovlar: kuniga ≤ 2 karta; kunning birinchi ovqatida faqat ijobiy/betaraf (a, b, d, e yo'q); faqat nonushta yozilgan bo'lsa — yetishmovchilik (b, c) yo'q;
 *   yopilgan qoida shu kuni qaytmaydi; yangi foydalanuvchining 1-kunida — hech narsa; «O'chirilgan» rejim — hech narsa.
 * Matn: har qoidaga 6 ta (0–2 jiddiy, 3–5 yengil hazil — ovqat haqida, odam haqida emas). «Jiddiy» rejim — faqat 0–2. Ketma-ket takrorlanmaydi.
 * «Tahlil»: faqat tugagan to'liq kunlar (S.avgDay qoidasi) — 14 kunlik oyna; kam bo'lsa «yana N kun». */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.KalkiMaslahat = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var OVER = 1.15, PROT_EVE = 0.6, EVE_H = 17, LATE_H = 19, FAT_SH = 0.45, MAX_DAY = 2, MIN_DAYS = 4, WIN = 14;
  var NEG = { a: 1, b: 1, d: 1, e: 1 }, DEFICIT = { b: 1, c: 1, g: 1 };
  var CHIP = { g: ['sabzavot', 'dukkakli', 'meva'], a: ['tovuq', 'baliq', 'sabzavot'], b: ['tuxum', 'sut', 'tovuq'], c: ['tovuq', 'baliq', 'sut', 'tuxum'], d: ['baliq', 'tovuq', 'dukkakli'], e: ['sabzavot', 'meva'], f: [], kam: [] };
  var ICON = { g: 'don', a: 'yog', b: 'don', c: 'mushak', d: 'yog', e: 'tarozi', f: 'yulduz', kam: 'ogoh' };
  function num(x) { var n = Number(x); return isFinite(n) ? n : 0; }
  function r(x) { return Math.round(x); }

  /* ---------- makro holati ---------- */
  /* v95: 4 holat — YAGONA manba (Bugun ▾ ✓ ▴, «Maslahat» yorliqlari, makro oynasi, kun xulosasi, matnlar). Ekrandagi butun sonlar bilan hisoblanadi — matn raqamga zid bo'lmaydi:
     kam < 85 % · deyarli 85–99 % (yana N g) · bajarildi 100–114 % · oshdi ≥ 115 % */
  var STATES = ['kam', 'deyarli', 'bajarildi', 'oshdi'];
  function holat(v, g, k) { var vr = r(num(v)), gr = r(num(g)); if (gr <= 0) return vr > 0 ? (k === 'p' ? 'bajarildi' : 'oshdi') : 'kam'; var st = vr * 100 >= gr * 115 ? 'oshdi' : vr >= gr ? 'bajarildi' : vr * 100 >= gr * 85 ? 'deyarli' : 'kam'; return k === 'p' && st === 'oshdi' ? 'bajarildi' : st; }          // v102: oqsil maqsaddan oshsa ham «bajarildi» (yashil ✓) — ogohlantirish emas; yog'/uglevod — «ko'p» qoladi
  var PROT_HI = 2.5;          // g/kg — undan yuqori oqsil: faqat yumshoq ma'lumot (oqsilYuqori)
  function oqsilYuqori(v, kg) { return num(kg) > 0 && num(v) > PROT_HI * num(kg); }
  function yetdi(st) { return st === 'bajarildi' || st === 'oshdi'; }
  function belgi(st) { return st === 'bajarildi' ? 'ok' : st === 'oshdi' ? 'up' : 'dn'; }          // ✓ · ▴ · ▾ (deyarli ham ▾ — hali yetmagan)
  function makro(tot, goals) { var o = {}; ['p', 'f', 'c'].forEach(function (k) { var v = num(tot[k]), g = num(goals[k]), vr = r(v), gr = r(g); o[k] = { v: v, g: g, r: g > 0 ? v / g : 0, st: holat(v, g, k), left: Math.max(0, gr - vr), x: Math.max(0, vr - gr) }; }); return o; }
  /* bugun shu makroni qaysi taomlar bergan: [{ name, g, kcal }] (bir xil taom qo'shiladi) */
  function manba(foods, k, nameOf, n) {
    var m = {}, order = []; (foods || []).forEach(function (e) { var nm = nameOf ? nameOf(e) : (e.name || e.fid || ''); if (!nm) return; if (!m[nm]) { m[nm] = { name: nm, g: 0, kcal: 0 }; order.push(nm); } m[nm].g += num(e[k]); m[nm].kcal += num(e.kcal); });
    return order.map(function (x) { return m[x]; }).filter(function (x) { return (k === 'kcal' ? x.kcal : x.g) > 0.5; }).sort(function (a, b) { return k === 'kcal' ? b.kcal - a.kcal : b.g - a.g; }).slice(0, n || 3);
  }

  /* ---------- qoida tanlash ----------
     c = { tot, goals {p,f,c}, limit, floor, hour, foods, nameOf, firstMeal, breakfastOnly, day1, mode, shown [], dismissed [] } → { id, data, chips } | null */
  function qoida(c) {
    if (!c || c.mode === 'off' || c.day1 || !(c.foods && c.foods.length)) return null;
    var t = c.tot, g = c.goals, lim = num(c.limit), k = num(t.kcal), h = num(c.hour), shown = c.shown || [], dis = c.dismissed || [], cands = [];
    if (h >= LATE_H && k > 0 && c.floor > 0 && k < c.floor) cands.push({ id: 'kam', data: { k: r(k), min: r(c.floor) } });
    if (g.f > 0 && t.f >= g.f * OVER) cands.push({ id: 'a', data: { x: r(t.f - g.f), src: manba(c.foods, 'f', c.nameOf, 2) } });
    if (g.c > 0 && t.c >= g.c * OVER && t.p < g.p) cands.push({ id: 'b', data: { x: r(t.c - g.c), p: r(g.p - t.p), src: manba(c.foods, 'c', c.nameOf, 2) } });
    if (h >= EVE_H && g.p > 0 && t.p < g.p * PROT_EVE) cands.push({ id: 'c', data: { p: r(g.p - t.p) } });
    var fatSh = k > 0 ? t.f * 9 / k : 0;
    if (lim > 0 && k >= lim * 0.85 && k <= lim * OVER && fatSh > FAT_SH) cands.push({ id: 'd', data: { sh: r(fatSh * 100), src: manba(c.foods, 'f', c.nameOf, 2) } });
    if (lim > 0 && k >= lim * OVER) cands.push({ id: 'e', data: { x: r(k - lim), src: manba(c.foods, 'kcal', c.nameOf, 2) } });
    var fb = c.fb; if (fb && fb.goal > 0 && h >= EVE_H && c.foods.length >= 2 && fb.unk * 2 <= fb.n && fb.g < fb.goal * 0.6) cands.push({ id: 'g', data: { x: r(fb.goal - fb.g), top: fb.top || '' } });          // v102: kletchatka kam (kechqurun; noma'lum taomlar yarmidan ko'p bo'lsa — aytilmaydi)
    if (h >= LATE_H && lim > 0 && k >= lim * 0.9 && k <= lim * 1.1 && ['p', 'f', 'c'].every(function (m) { return g[m] > 0 && t[m] >= g[m] * 0.85 && t[m] <= g[m] * OVER; }) && !(c.floor > 0 && k < c.floor)) cands.push({ id: 'f', data: {} });
    for (var i = 0; i < cands.length; i++) {
      var q = cands[i];
      if (q.id !== 'kam') {
        if (dis.indexOf(q.id) >= 0) continue;
        if (c.firstMeal && NEG[q.id]) continue;                                   // birinchi ovqat — faqat ijobiy/betaraf
        if (c.breakfastOnly && DEFICIT[q.id]) continue;                           // nonushtadan keyin — kun hali oldinda
        if (shown.indexOf(q.id) < 0 && shown.length >= MAX_DAY) continue;         // kuniga ≤ 2 xil karta
      } else if (dis.indexOf('kam') >= 0) continue;
      q.chips = CHIP[q.id] || []; q.icon = ICON[q.id]; return q;
    }
    return null;
  }

  /* ---------- v95: Lola matnlari — assets/kalkifit-maslahat-matn.js (uslub × til × kalit → 5 variant). Hamma maslahatchi matni shu yerdan ---------- */
  var MATN = null; try { if (typeof module === 'object' && module.exports) MATN = require('./kalkifit-maslahat-matn.js'); } catch (e) { MATN = null; }
  function lib() { return MATN || (typeof self !== 'undefined' && self.KalkiMaslahatMatn) || null; }
  function uslub(mode) { return mode === 'hazil' ? 'hazil' : 'jiddiy'; }          // «O'chirilgan» rejimda ko'rinadigan joylar (Tahlil, kun xulosasi) — jiddiy
  function list(key, lang, mode) { var M = lib(), L = lang === 'ru' ? 'ru' : 'uz', m = uslub(mode); return (M && M[L] && M[L][m] && M[L][m][key]) || []; }
  function bor(key) { return list(key, 'uz', 'jiddiy').length > 0; }
  function fillD(s, o, g) { o = o || {}; return String(s).replace(/\{([^{}|]+)\|([^{}|]+)\}/g, function (m, f, mm) { return g === 'm' ? mm : f; }).replace(/\{(\w+)\}/g, function (m, k) { var v = o[k]; if (v == null && k === 'Src' && o.src != null) { v = String(o.src); v = v.charAt(0).toUpperCase() + v.slice(1); } return v != null ? v : ''; }).replace(/\s+([,.!?])/g, '$1').replace(/\s{2,}/g, ' ').trim().replace(/(^|[.!?]\s+)([a-zа-яё])/g, function (m, p, c) { return p + c.toUpperCase(); }); }          // gap boshi — katta harf ({name} boshida bo'lsa ham)
  /* o = { lang, mode, i | pick(key, n) } */
  function ruN(n, a, b, c) { n = Math.abs(n) % 100; var m = n % 10; return n > 10 && n < 20 ? c : m === 1 ? a : m >= 2 && m <= 4 ? b : c; }
  function plRu(t) { return String(t).replace(/(\d+)(\s+)(дней|дня|день)(?![а-яё])/g, function (x, n, sp) { return n + sp + ruN(+n, 'день', 'дня', 'дней'); }).replace(/(\d+)(\s+)(раз|раза)(?![а-яё])/g, function (x, n, sp) { return n + sp + ruN(+n, 'раз', 'раза', 'раз'); }); }          // v103: «4 дней» → «4 дня»
  function say(key, data, o) { o = o || {}; var a = list(key, o.lang, o.mode); if (!a.length) return ''; var i = typeof o.i === 'number' ? o.i : (o.pick ? o.pick(key + '.' + uslub(o.mode), a.length) : 0); i = ((num(i) % a.length) + a.length) % a.length; var out = fillD(a[i], Object.assign({ ism: o.ism || (o.lang === 'ru' ? 'Лола' : 'Lola') }, data), o.g); return o.lang === 'ru' ? plRu(out) : out; }          // o.g — maslahatchi jinsi (RU fe'l/sifat: {рада|рад}), o.ism — ismi
  /* ---------- matnlar ---------- */
  var TX = {
    uz: {
      t: { a: "Yog' oshdi", b: 'Uglevod oldinda', c: 'Oqsilga yana {p} g', d: "Tarkib og'di", e: "Bugun me'yordan ko'p", f: 'Muvozanatli kun', kam: 'Juda kam yeyapsiz' },
      a: ["Yog' bugun {x} g oshdi — asosan {src}dan. Kechki ovqatga tovuq yoki baliq olsak, tenglashadi.", "Bugun yog' maqsaddan {x} g ko'p, ko'pi {src}dan. Keyingi ovqatda yog'sizroq oqsil tanlasak yetadi.", "Yog' bo'yicha {x} g ortiqcha, manbasi — {src}. Qolgan ovqatlarni yengilroq olamiz.",
        "{Src} bugun yog'ni {x} g oshirib yubordi. Kechqurun tovuq yoki baliq vaziyatni o'nglaydi.", "Yog' {x} g oldinda — {src} o'z ishini qildi. Kechki ovqatda tovuq yoki baliq navbatda.", "{Src} saxiylik qildi: yog' {x} g ko'p. Kechki taom yog'sizroq bo'lsa, kun muvozanatlashadi."],
      b: ["Uglevod bugun {x} g oldinda, oqsil esa orqada (yana {p} g). Non o'rniga tuxum yoki qatiq?", "Uglevod maqsaddan {x} g ko'p, oqsilga hali {p} g bor. Keyingi taomda tuxum, qatiq yoki tovuq yaxshi tanlov.", "Bugun uglevod {x} g ortiq, oqsil kam (yana {p} g). Nonni kamaytirib, oqsilli taom qo'shsak, tenglashadi.",
        "Non va xamir bugun yetakchi: uglevod {x} g oshdi, oqsil {p} g ortda. Navbat tuxum yoki qatiqqa!", "Uglevod poygada oldinda ({x} g), oqsil orqada ({p} g). Unga tuxum yoki qatiq bilan yordam beramiz.", "Bugungi stolda uglevod hukmron — {x} g ortiq. Oqsilga {p} g kerak: qatiq yoki tuxum bilan muvozanat."],
      c: ["Oqsilga hali {p} g bor. Kechki ovqat — imkoniyat.", "Bugun oqsil {p} g yetmayapti. Kechki ovqatga tovuq, baliq yoki qatiq qo'shsak, yetib boramiz.", "Oqsil maqsadiga {p} g qoldi — kechki taom shu uchun eng qulay payt.",
        "Oqsil hali {p} g kutyapti. Kechki ovqatda uni xursand qilamiz: tovuq yoki baliq.", "Kun oxiriga yaqinlashdik, oqsilga esa {p} g kerak. Kechki ovqat — hal qiluvchi tur!", "Oqsil hisobida {p} g bo'sh joy bor. Kechki taomga tuxum, qatiq yoki go'sht taklif qilamiz."],
      d: ["Kaloriya joyida, lekin {sh} % i yog'dan keldi. Oqsil va uglevod kam bo'lsa, to'qlik tez o'tadi.", "Kaloriya me'yorda, ammo {sh} % i yog'dan — asosan {src}dan. Oqsil ko'proq bo'lsa, uzoqroq to'q yurasiz.", "Raqam to'g'ri, tarkib og'gan: kaloriyaning {sh} % i yog'dan. Ertaga yog'sizroq oqsil qo'shib ko'ring — to'qlik uzoqroq saqlanadi.",
        "Kaloriya joyida, lekin yog' ulushi {sh} % — {src} ko'p joy egalladi. Oqsil ham o'z ulushini so'rayapti: u to'qlikni uzoqroq ushlaydi.", "Hisob to'g'ri, ammo yog' {sh} % bilan stolni egallab oldi. Ertaga oqsilga ko'proq joy beramiz — to'qlik uzoqroq bo'ladi.", "Kaloriya — joyida, yog' — {sh} %, biroz ko'p. Oqsil ko'proq bo'lsa, to'qlik uzoqroq saqlanadi."],
      e: ["Bugun me'yordan {x} kkal ko'p bo'ldi — bir kunlik holat, xavotir yo'q. Ertaga kechki ovqatni biroz kichikroq olsak bas.", "Me'yordan {x} kkal oshdi, asosan {src}dan. Hech gap yo'q — ertaga bitta kichik qadam: non porsiyasini yarmiga qisqartiring.", "{x} kkal ortiqcha. Bir kun natijani buzmaydi; ertaga 15 daqiqa piyoda yursangiz, tenglashtirishga yordam beradi.",
        "Bugun dasturxon saxiy bo'ldi: +{x} kkal. Ertaga shirinlikni bir bo'lakka qisqartiramiz — shu yetadi.", "{Src} bugun me'yorni {x} kkal ga ochib yubordi. Ertaga kechki ovqatda kichikroq likopcha — kichik, lekin foydali qadam.", "+{x} kkal — mehmondorchilik kunlari bo'ladi. Ertangi reja: bitta ovqatni sabzavot bilan to'ldiramiz."],
      f: ["Bugun kaloriya ham, oqsil, yog' va uglevod ham joyida. Zo'r kun!", "Muvozanatli kun: hamma ko'rsatkich maqsad atrofida. Shu tartibni ertaga ham davom ettiramiz.", "Kaloriya va makrolar — hammasi joyida. Bunday kunlar natijani mustahkamlaydi.",
        "Oqsil, yog', uglevod — uchalasi ham kelishib oldi. Bugun stol a'lo baho oldi!", "Bugungi taomlar maqsadga aniq tushdi — likopcha ham, hisob ham chiroyli.", "Hamma ko'rsatkich joyida. Shu ruhda davom!"],
      kam: ["Bugun hozircha {k} kkal — bu xavfsiz chegaradan ({min} kkal) past. Juda kam yeyish sog'liqqa zarar; yana bir to'yimli taom qo'shing."],
      va: ' va ', chipT: 'Muqobil:'
    },
    ru: {
      t: { a: 'Жиры выше нормы', b: 'Углеводы впереди', c: 'Белка ещё {p} г', d: 'Состав перекошен', e: 'Сегодня больше нормы', f: 'Сбалансированный день', kam: 'Вы едите слишком мало' },
      a: ['Жиры сегодня выше нормы на {x} г — в основном {src}. Если на ужин взять курицу или рыбу, всё выровняется.', 'Жиров сегодня на {x} г больше цели, больше всего — {src}. В следующий приём пищи достаточно выбрать нежирный белок.', 'Жиры: +{x} г, источник — {src}. Остальную еду возьмём полегче.',
        '{Src} сегодня добавили {x} г жира сверх нормы. Вечером курица или рыба всё поправят.', 'Жиры впереди на {x} г — {src} постарались. На ужин очередь за курицей или рыбой.', '{Src} оказались щедрыми: жиров на {x} г больше. Ужин понежирнее — и день сбалансирован.'],
      b: ['Углеводы сегодня впереди на {x} г, а белок отстаёт (ещё {p} г). Яйцо или катык вместо хлеба?', 'Углеводов на {x} г больше цели, белка ещё не хватает {p} г. В следующий приём — яйца, катык или курица.', 'Сегодня углеводов +{x} г, белка мало (ещё {p} г). Меньше хлеба, больше белковой еды — и всё выровняется.',
        'Хлеб и тесто сегодня лидируют: углеводы +{x} г, белок отстаёт на {p} г. Очередь за яйцом или катыком!', 'В гонке углеводы впереди (+{x} г), белок сзади ({p} г). Поможем ему яйцом или катыком.', 'Сегодня на столе правят углеводы — +{x} г. Белку нужно {p} г: катык или яйцо вернут баланс.'],
      c: ['До цели по белку ещё {p} г. Ужин — хорошая возможность.', 'Сегодня не хватает {p} г белка. Добавьте на ужин курицу, рыбу или катык — и цель достигнута.', 'До цели по белку осталось {p} г — ужин для этого самое удобное время.',
        'Белок ещё ждёт {p} г. Порадуем его на ужин: курица или рыба.', 'День близится к концу, а белку нужно {p} г. Ужин — решающий раунд!', 'В графе «белок» свободно {p} г. На ужин предлагаем яйца, катык или мясо.'],
      d: ['Калории в норме, но {sh} % пришло из жиров. Когда белка и углеводов мало, сытость быстро проходит.', 'Калории в норме, но {sh} % — из жиров, в основном {src}. С бо́льшим количеством белка вы дольше сыты.', 'Число верное, состав перекошен: {sh} % калорий — из жиров. Завтра добавьте нежирный белок — сытость держится дольше.',
        'Калории в норме, но доля жиров {sh} % — {src} заняли много места. Белок тоже просит свою долю: он дольше держит сытость.', 'Счёт верный, но жиры заняли {sh} % стола. Завтра дадим больше места белку — сытость будет дольше.', 'Калории — в норме, жиры — {sh} %, многовато. С бо́льшим количеством белка сытость держится дольше.'],
      e: ['Сегодня на {x} ккал больше нормы — это один день, волноваться не о чем. Завтра чуть меньшая порция на ужин — и достаточно.', 'Норма превышена на {x} ккал, в основном {src}. Ничего страшного — завтра один небольшой шаг: половина порции хлеба.', '+{x} ккал. Один день не портит результат; 15 минут пешком завтра помогут выровнять.',
        'Сегодня стол был щедрым: +{x} ккал. Завтра ограничим сладкое одним кусочком — этого хватит.', '{Src} сегодня раздвинули норму на {x} ккал. Завтра на ужин тарелка поменьше — маленький, но полезный шаг.', '+{x} ккал — бывают дни гостей. План на завтра: одну еду дополним овощами.'],
      f: ['Сегодня и калории, и белки, жиры, углеводы — в норме. Отличный день!', 'Сбалансированный день: все показатели около цели. Продолжим так же завтра.', 'Калории и макросы — всё в норме. Такие дни закрепляют результат.',
        'Белки, жиры, углеводы — все трое договорились. Сегодня стол получил пятёрку!', 'Сегодняшняя еда точно попала в цель — и тарелка, и счёт красивые.', 'Все показатели в норме. Так держать!'],
      kam: ['Сегодня пока {k} ккал — это ниже безопасной границы ({min} ккал). Слишком мало еды вредно для здоровья; добавьте ещё один сытный приём пищи.'],
      va: ' и ', chipT: 'Вместо этого:'
    }
  };
  function fill(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
  function srcText(src, L) { var nm = (src || []).map(function (x) { return String(x.name).replace(/\s*\([^)]*\)/g, '').trim().toLowerCase(); }); return nm.length ? nm.join(TX[L].va) : (L === 'ru' ? 'еда' : 'ovqat'); }
  /* variant tanlash: jiddiy — 0–2; hazil — 0–5; oxirgi ishlatilgani takrorlanmaydi (last — oxirgi indeks) */
  function variant(id, mode, last, seed) { var n = list('r_' + id, 'uz', mode).length; if (n <= 1) return 0; var i = Math.abs(num(seed)) % n; if (i === last) i = (i + 1) % n; return i; }
  function matn(q, lang, mode, vi) {
    var L = lang === 'ru' ? 'ru' : 'uz', d = q.data || {}, src = srcText(d.src, L), o = { x: d.x, p: d.p, sh: d.sh, k: d.k, min: d.min, top: d.top, src: src, Src: src.charAt(0).toUpperCase() + src.slice(1) };
    var FX = { a: 'fx_fat', d: 'fx_fat', b: 'fx_carb', c: 'fx_prot' }; o.fix = d.fix;
    if (d.fix && FX[q.id] && bor('ef_' + q.id) && bor(FX[q.id])) return { t: say('rt_' + q.id, o, { lang: L, mode: mode, i: vi || 0 }), b: say('ef_' + q.id, o, { lang: L, mode: mode, i: vi || 0 }) + ' ' + say(FX[q.id], o, { lang: L, mode: mode, i: vi || 0 }) };          // v103: 1) nimaga ta'sir qiladi, 2) kunning qolganini qanday to'g'irlash (aniq taom va gramm)
    if (bor('r_' + q.id)) return { t: say('rt_' + q.id, o, { lang: L, mode: mode, i: vi || 0 }), b: say('r_' + q.id, o, { lang: L, mode: mode, i: vi || 0 }) };
    return { t: fill(TX[L].t[q.id], o), b: fill(TX[L][q.id][vi || 0], o) };
  }

  /* ---------- kun xulosasi: 3 qator ---------- */
  var XT = {
    uz: { okP: "Oqsil maqsadi bajarildi: {v} / {g} g", okK: "Kaloriya me'yorda: {v} / {g} kkal", okW: "Suv maqsadi bajarildi: {v} ml", okS: 'Qadam: {v}', okN: '{n} ta ovqat yozildi — hisob aniq', offF: "Yog' {x} g ko'p — {src}", offC: 'Uglevod {x} g ko\'p — {src}', offP: 'Oqsil {x} g yetmadi', offK: "Me'yordan {x} kkal ko'p — {src}", offLow: "Juda kam yedingiz: {k} kkal (xavfsiz chegara {min})", off0: "Og'ish yo'q — hammasi maqsad atrofida",
      nxF: 'Ertaga tushlikka tovuq yoki baliq tanlang', nxC: 'Ertaga nonni yarim bo\'lakka qisqartiring', nxP: 'Ertaga nonushtaga tuxum yoki qatiq qo\'shing', nxK: 'Ertaga kechki ovqatni kichikroq likopchada', nxLow: "Ertaga 3 mahal to'yimli ovqat — nonushtani tashlab ketmang", nx0: 'Ertaga ham shu tartibda davom eting' },
    ru: { okP: 'Цель по белку выполнена: {v} / {g} г', okK: 'Калории в норме: {v} / {g} ккал', okW: 'Цель по воде выполнена: {v} мл', okS: 'Шаги: {v}', okN: 'Записано приёмов пищи: {n} — счёт точный', offF: 'Жиров на {x} г больше — {src}', offC: 'Углеводов на {x} г больше — {src}', offP: 'Белка не хватило {x} г', offK: 'Больше нормы на {x} ккал — {src}', offLow: 'Вы съели слишком мало: {k} ккал (безопасная граница {min})', off0: 'Отклонений нет — всё около цели',
      nxF: 'Завтра на обед выберите курицу или рыбу', nxC: 'Завтра хлеба — половина куска', nxP: 'Завтра на завтрак добавьте яйцо или катык', nxK: 'Завтра ужин — на тарелке поменьше', nxLow: 'Завтра три сытных приёма пищи — не пропускайте завтрак', nx0: 'Завтра продолжайте так же' }
  };
  function nf(n) { return String(r(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  /* c = { tot, goals, limit, floor, foods, nameOf, water (ml), waterGoal, steps, stepGoal } → { yaxshi, ogdi, ertaga, k: 'f'|'c'|'p'|'k'|'low'|'0' } */
  function xulosa(c, lang, mode, pick) {
    var L = lang === 'ru' ? 'ru' : 'uz', X0 = XT[L], X = {}; Object.keys(X0).forEach(function (k) { X[k] = bor('x_' + k) ? { key: 'x_' + k } : X0[k]; });
    var fill = function (s0, o) { return s0 && s0.key ? say(s0.key, o, { lang: L, mode: mode, pick: pick }) : fillD(s0, o); };
    var t = c.tot, g = c.goals, k = num(t.kcal), lim = num(c.limit), good = null, off = null, kk = '0';
    var low = c.floor > 0 && k > 0 && k < c.floor;
    if (!low) { if (g.p > 0 && yetdi(holat(t.p, g.p, 'p'))) good = fill(X.okP, { v: r(t.p), g: r(g.p) }); else if (lim > 0 && k >= lim * 0.9 && k <= lim * 1.1) good = fill(X.okK, { v: nf(k), g: nf(lim) }); else if (c.waterGoal > 0 && c.water >= c.waterGoal) good = fill(X.okW, { v: nf(c.water) }); else if (c.stepGoal > 0 && c.steps >= c.stepGoal) good = fill(X.okS, { v: nf(c.steps) }); }
    if (!good) good = fill(X.okN, { n: (c.foods || []).length });
    var devs = [];
    if (low) { off = fill(X.offLow, { k: nf(k), min: nf(c.floor) }); kk = 'low'; }
    else {
      if (g.f > 0 && t.f > g.f * OVER) devs.push({ k: 'f', s: (t.f - g.f) * 9, txt: fill(X.offF, { x: r(t.f - g.f), src: srcText(manba(c.foods, 'f', c.nameOf, 2), L) }) });
      if (g.c > 0 && t.c > g.c * OVER) devs.push({ k: 'c', s: (t.c - g.c) * 4, txt: fill(X.offC, { x: r(t.c - g.c), src: srcText(manba(c.foods, 'c', c.nameOf, 2), L) }) });
      if (lim > 0 && k > lim * OVER) devs.push({ k: 'k', s: k - lim, txt: fill(X.offK, { x: nf(k - lim), src: srcText(manba(c.foods, 'kcal', c.nameOf, 2), L) }) });
      if (g.p > 0 && holat(t.p, g.p, 'p') === 'kam') devs.push({ k: 'p', s: (g.p - t.p) * 4, txt: fill(X.offP, { x: r(g.p - t.p) }) });
      devs.sort(function (a, b) { return b.s - a.s; });
      if (devs.length) { off = devs[0].txt; kk = devs[0].k; } else off = fill(X.off0, {});
    }
    var nx = fill({ f: X.nxF, c: X.nxC, p: X.nxP, k: X.nxK, low: X.nxLow, '0': X.nx0 }[kk], {});
    return { yaxshi: good, ogdi: off, ertaga: nx, k: kk, low: low };
  }

  /* ---------- «Tahlil»: rows — faqat tugagan to'liq kunlar ----------
     row = { d, wd (0=Du … 6=Ya), kcal, p, f, limit, pgoal, foods: [{ name, kcal, f, meal, drink }] }; window — oynadagi barcha kunlar soni, logged — ovqat yozilgan kunlar soni */
  function tahlil(rows, o) {
    o = o || {}; var n = rows.length; if (n < MIN_DAYS) return { need: MIN_DAYS - n, n: n };
    var tot = rows.reduce(function (a, x) { return a + num(x.kcal); }, 0), avg = tot / n, F = [];
    var all = []; rows.forEach(function (x) { (x.foods || []).forEach(function (e) { all.push(e); }); });
    var top = manba(all, 'kcal', function (e) { return e.name; }, 5).map(function (x) { return { name: x.name, kcal: r(x.kcal), sh: tot ? x.kcal / tot : 0 }; });
    F.push({ k: 'top', top: top, perDay: top.length ? r(top[0].kcal / n) : 0, score: top.length && top[0].sh >= 0.25 ? top[0].kcal / n * 0.2 : 0 });          // ta'sir: eng katta taom porsiyasini 20 % kamaytirish (kkal/kun)
    var fat = manba(all, 'f', function (e) { return e.name; }, 3).map(function (x) { return { name: x.name, g: r(x.g) }; }), fatSh = tot ? rows.reduce(function (a, x) { return a + num(x.f) * 9; }, 0) / tot : 0;
    F.push({ k: 'yog', top: fat, sh: r(fatSh * 100), score: fatSh > FAT_SH ? (fatSh - 0.35) * avg : 0 });
    var dn = rows.map(function (x) { var d = (x.foods || []).filter(function (e) { return e.meal === 'd'; }).reduce(function (a, e) { return a + num(e.kcal); }, 0); return x.kcal ? d / x.kcal : 0; }), dsh = dn.reduce(function (a, b) { return a + b; }, 0) / n;
    F.push({ k: 'kechki', sh: r(dsh * 100), per: dn.map(function (v) { return r(v * 100); }), score: dsh > 0.4 ? (dsh - 0.33) * avg : 0 });
    var we = rows.filter(function (x) { return x.wd >= 5; }), wk = rows.filter(function (x) { return x.wd < 5; });
    if (we.length && wk.length) { var aw = we.reduce(function (a, x) { return a + num(x.kcal); }, 0) / we.length, ak = wk.reduce(function (a, x) { return a + num(x.kcal); }, 0) / wk.length; F.push({ k: 'damolish', ish: r(ak), dam: r(aw), diff: r(aw - ak), score: aw - ak >= 200 ? (aw - ak) * 2 / 7 : 0 }); }
    var pd = rows.filter(function (x) { return x.pgoal > 0 && x.p >= x.pgoal; }).length; F.push({ k: 'oqsil', ok: pd, n: n, per: rows.map(function (x) { return x.pgoal ? Math.min(150, r(x.p / x.pgoal * 100)) : 0; }), score: pd / n <= 0.4 ? 120 : 0 });
    var dr = rows.reduce(function (a, x) { return a + (x.foods || []).filter(function (e) { return e.drink; }).reduce(function (s, e) { return s + num(e.kcal); }, 0); }, 0) / n;
    F.push({ k: 'ichimlik', perDay: r(dr), score: dr >= 100 ? dr : 0 });
    var un = Math.max(0, num(o.window) - n); F.push({ k: 'yozilmagan', n: un, of: num(o.window), score: un >= 3 ? 250 : 0 });
    var best = F.slice().sort(function (a, b) { return b.score - a.score; })[0], main = best && best.score > 0 ? best.k : null;
    return { n: n, avg: r(avg), findings: F, main: main };
  }
  return { OVER: OVER, PROT_EVE: PROT_EVE, EVE_H: EVE_H, LATE_H: LATE_H, FAT_SH: FAT_SH, MAX_DAY: MAX_DAY, MIN_DAYS: MIN_DAYS, WIN: WIN, CHIP: CHIP, ICON: ICON, TX: TX, XT: XT,
    STATES: STATES, yetdi: yetdi, belgi: belgi, say: say, list: list, bor: bor, fillD: fillD, lib: lib, uslub: uslub,
    holat: holat, plRu: plRu, oqsilYuqori: oqsilYuqori, makro: makro, manba: manba, qoida: qoida, variant: variant, matn: matn, srcText: srcText, xulosa: xulosa, tahlil: tahlil };
});
