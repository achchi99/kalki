/* kalki.uz — KalkiFit: "qiziqarli gaplar" (yengil sarkazmli, do'stona hazillar). MATNLAR — data/hazillar.json (items: id, holat, uz, ru; neytral matnlar ham shu yerda). DOM'siz, sof funksiyalar (brauzerda window.KalkiFitGaplar, Node'da require()).
 * Matnlar UZ (ЎЗ — shu matnning kirill ko'rinishi, runtime translit) va RU alohida yozilgan. Taqqoslashlar HAQIQIY: masofa — data/masofalar.json (OSRM yo'l masofalari),
 * kaloriya — ovqatlar bazasidagi qiymat. QOIDALAR: vazn/tana haqida hazil yo'q (vazn faqat 7 kunlik o'rtacha bilan, baholamasdan); limitdan oshganda yumshoq amaliy chiqish;
 * 3 kundan ortiq ketma-ket oshsa hazil o'chadi, faqat neytral fakt; bir kunda variant takrorlanmaydi. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KalkiFitGaplar = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var TEXTS = { uz: {}, ru: {} }, IDS = {}, NEUTRAL = {};      // matnlar data/hazillar.json da (items: id, holat, uz, ru); brauzerda ilova yuklab setTexts() ga beradi, Node'da shu yerning o'zida o'qiladi
  function setTexts(j) {
    var T = { uz: {}, ru: {} }, I = {};
    if (j && j.items) j.items.forEach(function (it) { if (!it || !it.holat || !it.uz || !it.ru) return; var h = it.holat; (T.uz[h] = T.uz[h] || []).push(it.uz); (T.ru[h] = T.ru[h] || []).push(it.ru); (I[h] = I[h] || []).push(it.id || h + '#' + I[h].length); });
    else { var S = (j && j.states) || {}; Object.keys(S).forEach(function (id) { ['uz', 'ru'].forEach(function (l) { if (S[id][l] && S[id][l].length) T[l][id] = S[id][l].slice(); }); }); }      // eski format (states) — moslik
    TEXTS = T; IDS = I; NEUTRAL = (j && j.neutral) || {}; if (api) { api.TEXTS = TEXTS; api.IDS = IDS; api.NEUTRAL = NEUTRAL; }
  }

  /* ---------- taqiqlangan so'zlar (test shu ro'yxat bo'yicha barcha gaplarni tekshiradi) ---------- */
  var BANNED = ['semiz', "ozg'in", '\\bozgin\\b', "yog' bosgan", 'yog bosgan', "to'lag", 'tolag', 'kilo', 'yana yedingiz', 'yeb qo\'yding', 'yeb qoyding', "tuta olmadingiz", 'uyat', 'aybdor', 'ayb ', 'dangasa', 'majbursiz', 'kerak', 'shart', 'jazo',
    '\\bsemir', '\\bozib\\b', '\\bqorin', 'badan', 'figura', 'tanang', 'tanangiz', 'ortiqcha vazn', 'ochlik', 'och qol', 'och yur', 'yemang', 'kamroq yeng', 'ko\'proq yeng', 'gunoh', 'aybli', 'qiyshiq', 'bukri', 'xunuk', 'chiroyli bo', 'ahmoq', 'tentak', 'jinni',
    "to'lmay", "to'ldir", 'yetishma', 'yetmayap', 'kam yed', 'kam ovqat', 'yetarli yem', '\\byeng\\b', 'ovqat yeng', 'ovqatni qo\'shing', 'не наполн', 'недоед', 'недостаточно', 'мало съел', 'мало ел', 'не хватает', 'съешьте', 'поешьте', 'ешьте', 'доешь',
    'толст', 'жирн', 'тощ', 'худ', 'опять поел', 'снова поел', 'виноват', 'стыд', 'надо', 'должн', 'обязан', 'лентяй', 'срыв', 'наказан',
    'похуде', 'живот', 'фигур', '\\bтел[оа]\\b', 'голод', 'не ешь', 'меньше ешь', 'больше ешь', '\\bгрех', '\\bвина\\b', 'урод', 'глуп', 'дурак', 'идиот'];

  /* ---------- sana, bayramlar ---------- */
  var FIXED = { '01-01': 1, '01-14': 1, '03-08': 1, '03-21': 1, '05-09': 1, '09-01': 1, '10-01': 1, '12-08': 1, '12-31': 1 };
  var HAYIT = { '2026': ['2026-03-20', '2026-05-27'], '2027': ['2027-03-09', '2027-05-16'], '2028': ['2028-02-26', '2028-05-05'], '2029': ['2029-02-14', '2029-04-24'] };   // Ro'za va Qurbon hayit (taxminiy; 3 kun)
  function addDay(iso, n, D) { return D.addDays(iso, n); }
  function isHoliday(date, D) {
    if (FIXED[date.slice(5)]) return true;
    var h = HAYIT[date.slice(0, 4)] || [];
    for (var i = 0; i < h.length; i++) for (var k = 0; k < 3; k++) if (addDay(h[i], k, D) === date) return true;
    return false;
  }

  /* ---------- masofalar (data/masofalar.json: { nodes:[{id,uz,ru,ruGen,region}], upper:[[…]] }) ---------- */
  function kmBetween(M, a, b) {
    var ia = -1, ib = -1, i; for (i = 0; i < M.nodes.length; i++) { if (M.nodes[i].id === a) ia = i; if (M.nodes[i].id === b) ib = i; }
    if (ia < 0 || ib < 0 || ia === ib) return null; var lo = Math.min(ia, ib), hi = Math.max(ia, ib); return M.upper[lo][hi - lo - 1];
  }
  function nodeOf(M, id) { for (var i = 0; i < M.nodes.length; i++) if (M.nodes[i].id === id) return M.nodes[i]; return null; }
  function routeFor(M, city, km) {                 // shahardan chiqadigan eng yaqin mos marshrut: full (km ≥ masofa) yoki part (km < eng yaqin masofa)
    var from = nodeOf(M, city) || nodeOf(M, 'toshkent'), opts = [];
    M.nodes.forEach(function (n) { if (n.id !== from.id) { var d = kmBetween(M, from.id, n.id); if (d) opts.push({ to: n, km: d }); } });
    opts.sort(function (a, b) { return a.km - b.km; });
    var best = null; opts.forEach(function (o) { if (o.km <= km) best = o; });
    if (best) return { type: 'full', from: from, to: best.to, km: best.km, pct: 100 };
    var near = opts[0]; return { type: 'part', from: from, to: near.to, km: near.km, pct: Math.max(1, Math.round(km / near.km * 100)) };
  }
  function routePhrase(r, lang) { return lang === 'ru' ? 'от ' + r.from.ruGen + ' до ' + r.to.ruGen : r.from.uz + 'dan ' + r.to.uz + 'gacha'; }

  /* ---------- kaloriya taqqoslash: qadamlar yoqqan kkal ≈ bazadagi ovqat ---------- */
  var BURN = [
    { id: 'shokolad-sut', unit: 'bolak', uz: ["shokolad bo'lagini", "shokolad bo'lagi"], ru: { g: 'f', one: 'дольку шоколада', few: 'дольки шоколада', many: 'долек шоколада', nom: 'шоколад' } },
    { id: 'banan', unit: 'dona', uz: ['bananni', 'banan'], ru: { g: 'm', one: 'банан', few: 'банана', many: 'бананов', nom: 'банан' } },
    { id: 'non', unit: 'bolak', uz: ["non bo'lagini", "non bo'lagi"], ru: { g: 'm', one: 'кусок лепёшки', few: 'куска лепёшки', many: 'кусков лепёшки', nom: 'лепёшка' } },
    { id: 'kola', unit: 'stakan', uz: ['stakan kolani', 'kola'], ru: { g: 'm', one: 'стакан колы', few: 'стакана колы', many: 'стаканов колы', nom: 'кола' } },
    { id: 'somsa', unit: 'dona', uz: ['somsani', 'somsa'], ru: { g: 'f', one: 'самсу', few: 'самсы', many: 'самс', nom: 'самса' } },
    { id: 'burger', unit: 'dona', uz: ['burgerni', 'burger'], ru: { g: 'm', one: 'бургер', few: 'бургера', many: 'бургеров', nom: 'бургер' } },
    { id: 'osh', unit: 'likop', uz: ['likop oshni', 'osh'], ru: { g: 'f', one: 'тарелку плова', few: 'тарелки плова', many: 'тарелок плова', nom: 'плов' } }
  ];
  function burnFood(kcal, foods, S, lang) {        // { food: "bitta somsani" | "одну самсу", foodNom, n, unitKcal, id } yoki null
    var map = {}; (foods || []).forEach(function (f) { map[f.id] = f; });
    var items = BURN.map(function (b) { var f = map[b.id]; if (!f) return null; var g = S.unitGrams(f, b.unit); return g ? { b: b, k: Math.round(f.k * g / 100) } : null; }).filter(Boolean).sort(function (a, c) { return a.k - c.k; });
    var pick = null; items.forEach(function (it) { if (it.k <= kcal && Math.floor(kcal / it.k) <= 9) pick = it; }); if (!pick) items.forEach(function (it) { if (!pick && it.k <= kcal) pick = it; });
    if (!pick) return null; var n = Math.max(1, Math.min(9, Math.floor(kcal / pick.k)));
    if (lang === 'ru') { var r = pick.b.ru, w = n % 10 === 1 && n % 100 !== 11 ? 'one' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'few' : 'many'); var one = r.g === 'f' ? 'одну ' : 'один '; return { food: (n === 1 ? one + r.one : n + ' ' + r[w]), foodNom: r.nom, n: n, unitKcal: pick.k, id: pick.b.id }; }
    return { food: (n === 1 ? 'bitta ' : n + ' ta ') + pick.b.uz[0], foodNom: pick.b.uz[1], n: n, unitKcal: pick.k, id: pick.b.id };
  }

  /* ---------- tanlash: bir kunda takrorlanmaydi, qayta chizilganda barqaror ---------- */
  function fill(tpl, p) { return String(tpl).replace(/\{(\w+)\}/g, function (m, k) { return p && p[k] != null ? p[k] : ''; }).replace(/\s+([.,!?])/g, '$1').replace(/\s{2,}/g, ' ').trim(); }
  function jk(ctx, day) { var st = ctx.st, p = ctx.store || st.prefs || (st.prefs = {}); if (!p.jk || p.jk.d !== day) p.jk = { d: day, used: {}, cur: null, last: (p.jk && p.jk.last) || {} }; if (!p.jk.last) p.jk.last = {}; return p.jk; }
  /* tanlash: bir kunda takrorlanmaydi; OXIRGI 7 KUNDA ko'rsatilgan hazil (id bo'yicha) qayta chiqmaydi — hammasi ko'rilgan bo'lsa eng eskisi; ctx.fresh — hodisa uchun yangi tanlov */
  function seenOf(ctx) { var p = ctx.store || (ctx.st && ctx.st.prefs) || {}; if (!p.seen || typeof p.seen !== 'object') p.seen = {}; return p.seen; }
  function pickLine(ctx, state, params, key) {
    var list = (TEXTS[ctx.lang] || TEXTS.uz)[state]; if (!list || !list.length) return null;
    var j = jk(ctx, ctx.today); key = key || state; var ids = IDS[state] || [], idOf = function (i) { return ids[i] || state + '#' + i; };
    if (!ctx.fresh && j.cur && j.cur.key === key && j.cur.state === state && list[j.cur.idx] != null) return { state: state, text: fill(list[j.cur.idx], params), id: idOf(j.cur.idx) };
    var used = j.used[state] || (j.used[state] = []), last = j.last[state], avail = []; for (var i = 0; i < list.length; i++) if (used.indexOf(i) < 0 && !(list.length > 1 && i === last)) avail.push(i);
    if (!avail.length) { used.length = 0; for (i = 0; i < list.length; i++) if (!(list.length > 1 && i === last)) avail.push(i); }
    var seen = seenOf(ctx), D = ctx.S && ctx.S.dates, lim7 = D ? D.addDays(ctx.today, -6) : ctx.today, fresh7 = avail.filter(function (i) { var d = seen[idOf(i)]; return !d || d < lim7; });
    if (fresh7.length) avail = fresh7; else avail.sort(function (a, b) { return String(seen[idOf(a)] || '').localeCompare(String(seen[idOf(b)] || '')); }), avail = avail.slice(0, 1);
    var idx = avail[Math.floor((ctx.rng ? ctx.rng() : Math.random()) * avail.length)]; used.push(idx); j.last[state] = idx; if (!ctx.fresh) j.cur = { key: key, state: state, idx: idx };
    seen[idOf(idx)] = ctx.today; if (D) { var old = D.addDays(ctx.today, -14); Object.keys(seen).forEach(function (k) { if (seen[k] < old) delete seen[k]; }); }
    return { state: state, text: fill(list[idx], params), id: idOf(idx) };
  }
  /* yozuv turlari (ovqatlar bazasi: t — o milliy, q fast-food, h shirinlik …) */
  function foodMap(ctx) { var f = ctx.foods; if (!f) return {}; if (!f.__m) { var m = {}; f.forEach(function (x) { m[x.id || x.i] = x; }); try { Object.defineProperty(f, '__m', { value: m }); } catch (e) { return m; } } return f.__m; }
  function kindOf(ctx, e) { var fid = String((e && e.fid) || ''), f = foodMap(ctx)[fid] || {}, t = f.t || ''; return { t: t, osh: /^osh/.test(fid), non: /^non/.test(fid), choy: /^(choy|tea)/.test(fid), sweet: t === 'h', fast: t === 'q' }; }
  function pickTexts(lang, state) { return (TEXTS[lang] || TEXTS.uz)[state] || []; }

  /* ---------- vaziyatlar ---------- */
  function fmtKm(km) { return String(Math.round(km * 10) / 10).replace('.', ','); }
  function dayStats(ctx, d) { var S = ctx.S, st = ctx.st; return S.dayStatus(st, d, ctx.today); }
  function nf(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function overRun(ctx) {                          // faqat TO'LIQ kunlar (state 'high' = to'liq va maqsaddan >10% yuqori); ketma-ket 3+ kun — hazil o'rniga neytral fakt
    var S = ctx.S, t = ctx.today, D = S.dates, run = 0, d = t, sum = 0; if (dayStats(ctx, d).state !== 'high') d = D.addDays(t, -1); var d0 = d;
    while (run < 7) { var r = dayStats(ctx, d); if (r.state !== 'high') break; run++; sum += r.eaten; d = D.addDays(d, -1); }
    if (run < 3) return null; var avg = Math.round(sum / run), lsum = 0, dd = d0; for (var i = 0; i < run; i++) { lsum += dayStats(ctx, dd).limit; dd = D.addDays(dd, -1); }
    return pickLine(ctx, 'over_neutral', { avg: avg, pct: Math.round((sum / lsum - 1) * 100) }, 'over_neutral');
  }
  function todayLine(ctx) {                        // Bugun ekrani (kaloriya doirasi ostidagi pufak) uchun BITTA qator; mos holat bo'lmasa ham kunlik umumiy hazil (hazil o'chirilgan bo'lsa — null)
    if (ctx.jokesOn === false) return null;
    var S = ctx.S, st = ctx.st, t = ctx.today, x = S.dayOf(st, t) || { food: [], water: 0, steps: 0 }, pl = S.plan(st.profile), tot = S.sumEntries(x.food), eaten = tot.kcal, lim = S.dayLimit(st, t), D = S.dates, hour = ctx.hour == null ? 12 : ctx.hour;
    var P = function (state, par) { return pickLine(ctx, state, par || {}, state); }, K = x.food.map(function (e) { return kindOf(ctx, e); }), cnt = function (k) { return K.filter(function (q) { return q[k]; }).length; };
    if (isHoliday(t, D) || x.party) return P('holiday');
    var on = overRun(ctx); if (on) return on;
    if (eaten > lim) return P('over', { over: nf(eaten - lim) });
    var fresh = st.created && (Date.now() - st.created) < 24 * 3600 * 1000;      // yangi foydalanuvchining birinchi kunida «qadam 0»/«suv 0» hazili yo'q
    if (hour >= 22 && x.food.some(function (e) { return e.ts && new Date(e.ts).getHours() >= 22; })) return P('late_food');
    if (hour >= 19 && x.food.length >= 2 && Math.abs(eaten - lim) <= lim * 0.05) return P('on_target');
    if (cnt('sweet')) return P('food_sweet'); if (cnt('fast')) return P('food_fast');
    if (cnt('non') >= 3) return P('bread_much'); if (cnt('osh')) return P('food_osh'); if (cnt('choy') >= 2) return P('tea');
    if (hour >= 18 && x.food.length >= 2 && pl.macros && tot.p < pl.macros.p * 0.5) return P('protein_low');
    if (x.steps >= st.stepGoal) return P('steps_goal');
    if (!x.steps && hour >= 13 && !fresh) return P('zero_steps');
    if (x.steps > 0 && x.steps < 3000 && hour >= 17 && !fresh) return P('steps_couch');
    if (x.food.length && hour >= 20 && eaten < 0.4 * lim && !x.done) return P('log_low');
    var wg = S.waterInfo(st, t).glasses, target = pl.water.glasses; if (wg >= target) return P('water_ok', { glasses: wg, target: target });          // suv = qo'lda + ichimliklar (waterInfo)
    if (!wg && hour >= 12 && !fresh) return P('water_none');
    if (wg >= Math.ceil(target / 2) && hour >= 14) return P('water_half');
    if (x.steps >= 2000) {
      var h = Number(st.profile.height), w = S.currentWeight(st), km = S.distanceKm(x.steps, h), kc = S.stepKcal(x.steps, h, w), dom = Number(t.slice(8));
      var bf = ctx.foods ? burnFood(kc, ctx.foods, S, ctx.lang) : null, rt = ctx.masofa ? routeFor(ctx.masofa, ctx.city, km) : null;
      if (bf && dom % 3 === 1) return pickLine(ctx, 'burn', { kcal: kc, food: bf.food, foodNom: bf.foodNom }, 'burn|' + bf.id);
      if (rt && dom % 3 === 2) return pickLine(ctx, rt.type === 'full' ? 'dist_full_day' : 'dist_part', { km: fmtKm(km), route: routePhrase(rt, ctx.lang), routeKm: rt.km, pct: rt.pct }, 'day|' + rt.to.id);
    }
    var sk = S.streak(st, t); if (sk >= 3) return pickLine(ctx, sk >= 7 && sk % 7 === 0 ? 'streak7' : 'streak', { days: sk }, 'streak');
    if (!x.food.length) { var lastD = Object.keys(st.days).filter(function (d) { return d < t && st.days[d].food && st.days[d].food.length; }).sort().pop(); if (lastD && lastD < D.addDays(t, -2)) return P('comeback'); }
    if (ctx.fishDay) return P('fish_day');
    if (S.weekdayIdx && S.weekdayIdx(t) >= 5) return P('weekend');
    if (hour < 12 && x.food.some(function (e) { return e.meal === 'b'; })) return P('breakfast');
    if (hour < 12) return P('day_morning');
    return P('day_any');
  }
  function cardLine(ctx, state) {                  // kun kartasi uchun BITTA hazil (raqamsiz holat: on_target / dayend / dayend_high); kun va til bo'yicha barqaror — qayta chizilganda o'zgarmaydi
    if (ctx.jokesOn === false) return null; var p = ctx.store || (ctx.st && ctx.st.prefs) || {}, k = p.kc;
    if (k && k.d === ctx.today && k.s === state && k.l === ctx.lang) return { state: state, text: k.t };
    var c = {}; for (var x in ctx) c[x] = ctx[x]; c.fresh = true; var l = pickLine(c, state, {}, 'card'); if (l) p.kc = { d: ctx.today, s: state, l: ctx.lang, t: l.text }; return l;
  }
  function neutralLine(ctx, kind, p) { var n = NEUTRAL[kind], t = n && (n[ctx.lang] || n.uz); return t ? { state: 'neutral_' + kind, text: fill(t, p) } : null; }
  /* Hodisadan keyingi bir qatorli gap: kind = food | water | steps | weight | dayend. Hazil o'chirilgan bo'lsa shu vaziyat uchun NEUTRAL fakt qaytadi. */
  function eventLine(ctx, kind, p) {
    p = p || {}; var S = ctx.S, st = ctx.st, t = ctx.today, x = S.dayOf(st, t) || { food: [], water: 0, steps: 0 }, pl = S.plan(st.profile), eaten = S.sumEntries(x.food).kcal, lim = S.dayLimit(st, t), hour = ctx.hour == null ? 12 : ctx.hour, sk = S.streak(st, t);
    var jc = {}; Object.keys(ctx).forEach(function (k) { jc[k] = ctx[k]; }); jc.fresh = true; jc.jokesOn = true; var state = null, par = {}, nk = kind, np = {};
    if (kind === 'food') {
      nk = 'food'; np = { eaten: nf(eaten) };
      if (eaten > lim) { var on = overRun(jc); if (on) return ctx.jokesOn === false ? neutralLine(ctx, nk, np) : on; state = 'over'; par = { over: nf(eaten - lim) }; }
      else if (p.alt) state = 'alt_chosen';
      else if (p.fish) state = 'food_fish';
      else if (p.drink1) state = 'ichimlik_suvga_qoshildi';          // birinchi marta ichimlik yozilganda: bitta yengil maslahat (keyin umumiy holatlar)
      else if (hour >= 22) state = 'late_food';
      else {
        var lastE = x.food.slice().sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); }).pop(), lk = kindOf(ctx, lastE), nonN = x.food.filter(function (e) { return kindOf(ctx, e).non; }).length, choyN = x.food.filter(function (e) { return kindOf(ctx, e).choy; }).length;
        if (p.sweet || lk.sweet) state = 'food_sweet';
        else if (lk.fast) state = 'food_fast';
        else if (lk.osh) state = 'food_osh';
        else if (lk.non && nonN >= 3) state = 'bread_much';
        else if (lk.choy && choyN >= 2) state = 'tea';
        else if (x.food.length === 1 && lastE && lastE.meal === 'b' && hour < 12 && sk < 3) state = 'breakfast';
      }
      if (state) {}
      else if (x.food.length === 1) state = sk >= 7 && sk % 7 === 0 ? 'streak7' : (sk >= 3 ? 'streak' : 'food_first'), par = { days: sk };
      else if (hour >= 20 && eaten < 0.4 * lim && !x.done) state = 'log_low';
      else if (hour >= 18 && eaten <= lim && x.food.length > 2) state = 'within', par = { left: nf(lim - eaten) };
      else state = 'food_add';
    } else if (kind === 'water') {
      var tg = pl.water.glasses, wi = S.waterInfo(st, t), wg2 = wi.glasses; nk = 'water'; np = { ml: nf(wi.ml), goal: nf(tg * S.GLASS_ML) };
      if (wg2 === tg) { state = 'water_ok'; par = { glasses: wg2, target: tg }; } else if (wg2 === Math.ceil(tg / 2)) state = 'water_half';
    } else if (kind === 'steps') {
      var goal = st.stepGoal, sc = Number(p.steps) || x.steps; nk = 'steps'; np = par = { steps: nf(sc), goal: nf(goal) };
      if (sc >= goal && !(p.prev >= goal)) state = 'steps_goal'; else if (hour >= 18 && sc > 0 && sc < 2000) state = 'steps_couch'; else state = 'steps_add';
    } else if (kind === 'weight') { return neutralLine(ctx, 'weight', { kg: String(Math.round(Number(p.kg) * 10) / 10).replace('.', ',') }); }      // vazn haqida hazil YO'Q — faqat neytral fakt
    else if (kind === 'dayend') { nk = 'dayend'; state = dayStats(jc, t).state === 'high' ? 'dayend_high' : 'dayend'; }
    if (!state) return null;
    if (ctx.jokesOn === false) return neutralLine(ctx, nk, np);
    return pickLine(jc, state, par, 'ev|' + kind + '|' + state);
  }
  function distLines(ctx) {                        // Qadam ekrani: oxirgi 7 kun va shu oy uchun masofa gaplari
    if (ctx.jokesOn === false || !ctx.masofa) return { week: null, month: null };
    var S = ctx.S, st = ctx.st, t = ctx.today, D = S.dates, week = S.stepsTotal(st, S.stepsSeries(st, t, 7)), mon = S.monthSteps(st, D.monthOf(t)), out = { week: null, month: null };
    [['week', week, 'dist_full_week'], ['month', mon, 'dist_full_month']].forEach(function (a) {
      var km = a[1].km; if (!(km >= 1)) return; var rt = routeFor(ctx.masofa, ctx.city, km);
      out[a[0]] = pickLine(ctx, rt.type === 'full' ? a[2] : 'dist_part', { km: fmtKm(km), route: routePhrase(rt, ctx.lang), routeKm: rt.km, pct: rt.pct }, a[0] + '|' + rt.to.id);
    });
    return out;
  }
  function weightLine(ctx) {                       // v23: vazn/tana haqida hazil yo'q — hech narsa qaytarmaydi (vazn faqat raqam sifatida ko'rsatiladi)
    return null; var S = ctx.S, st = ctx.st, t = ctx.today, D = S.dates;
    if (S.weightInfo(st, t).kind !== 'trend') return null;                      // <7 kunlik tarixda trend gapi yo'q
    var a = S.avg7(st.weights, t), b = S.avg7(st.weights, D.addDays(t, -7)); if (a == null || b == null) return null;
    var dl = Math.round((a - b) * 10) / 10, abs = String(Math.abs(dl)).replace('.', ',');
    return pickLine(ctx, dl <= -0.2 ? 'weight_down' : (dl >= 0.2 ? 'weight_up' : 'weight_flat'), { delta: abs }, 'weight|' + (dl <= -0.2 ? 'd' : dl >= 0.2 ? 'u' : 'f'));
  }
  function streakLine(ctx) { if (ctx.jokesOn === false) return null; var n = ctx.S.streak(ctx.st, ctx.today); return n >= 3 ? pickLine(ctx, 'streak', { days: n }, 'streak2') : null; }

  var api = { TEXTS: TEXTS, NEUTRAL: NEUTRAL, setTexts: setTexts, BANNED: BANNED, FIXED: FIXED, isHoliday: isHoliday, kmBetween: kmBetween, nodeOf: nodeOf, routeFor: routeFor, routePhrase: routePhrase, burnFood: burnFood, fill: fill, pickLine: pickLine, pickTexts: pickTexts,
    IDS: IDS, kindOf: kindOf, todayLine: todayLine, eventLine: eventLine, cardLine: cardLine, neutralLine: neutralLine, distLines: distLines, weightLine: weightLine, streakLine: streakLine, fmtKm: fmtKm };
  if (typeof module === 'object' && module.exports) { try { var fs = require('fs'), path = require('path'); setTexts(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'hazillar.json'), 'utf8'))); } catch (e) {} }
  return api;
});
