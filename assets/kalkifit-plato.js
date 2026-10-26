/* kalki.uz — KalkiFit: «Vazn trendi» va «Nega sekin ozyapman?» (shaxsiy plato tahlili). AI YO'Q — foydalanuvchining o'z ma'lumotidan deterministik hisob, DOM yo'q (UMD).
 * Trend (v47): Holt ikki parametrli silliqlash — daraja + tezlik (kg/kun), oraliq dt kunga moslangan (a = 1 − (1 − 0,2)^dt, b = 1 − (1 − 0,08)^dt); doimiy ozishda EMA kabi orqada qolmaydi.
 *   Yolg'iz sakrash (|farq| > 2σ, keyingi o'lchov tasdiqlamasa) ±0,3σ gacha cheklanadi; tasdiqlansa (haqiqiy o'zgarish) ±3σ. σ — so'nggi 12 bashorat xatosining robust bahosi (≥ 0,3 kg). Tanlov sababi va raqamlar: docs/plato.md.
 * Tahlil (so'nggi 28 kun, bugun hisobga kirmaydi): kutilgan = Σ(sarf − yozilgan kkal) / 7700, sarf = TDEE (limit + rejadagi defitsit) + ortiqcha qadam krediti (ilova hisobi bilan bir xil);
 * haqiqiy = trend o'zgarishi. Sabablar kkal/kun ta'siri bo'yicha saralanadi (ko'pi bilan 3). Limit hech qachon pastki chegaradan (S.FLOOR) past tavsiya qilinmaydi.
 * Raqamlar va manbalar: docs/plato.md.   window.KalkiPlato / require() */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.KalkiPlato = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var PROT_SH = 0.85, ALPHA = 0.2, BETA = 0.08, KSIG = 2, LOCLIP = 0.3, SMIN = 0.3, KCAL_KG = 7700, WIN = 28, WALK_K = 0.5, STRIDE = 0.415, PROT = 1.2, WKEND = 300, LOWDAY = 0.6, SMALL_DEF = 250, FAST = 0.01;
  var LOSE = { lose: 1, slow: 1 };
  function r1(x) { return Math.round(x * 10) / 10; }
  function num(x) { var n = Number(x); return isFinite(n) ? n : 0; }

  /* ---------- trend ---------- */
  /* weights: [{d, kg}] (sana bo'yicha) → [{d, kg, t, s}] ; t — shu o'lchovdagi trend darajasi, s — tezlik (kg/kun) */
  function trend(weights, D) {
    var W = (weights || []).filter(function (w) { return w && w.kg > 0; }), out = [], L = null, T = 0, prev = null, res = [];
    W.forEach(function (w, i) {
      if (L == null) L = w.kg;
      else {
        var dt = Math.max(1, D.daysBetween(prev, w.d)), A = 1 - Math.pow(1 - ALPHA, dt), B = 1 - Math.pow(1 - BETA, dt), pred = L + T * dt, e = w.kg - pred;
        var rs = res.slice(-12).map(Math.abs).sort(function (x, y) { return x - y; }), sg = Math.max(SMIN, 1.4826 * (rs.length ? rs[Math.floor(rs.length / 2)] : 0));
        res.push(Math.max(-3 * sg, Math.min(3 * sg, e)));
        if (Math.abs(e) > KSIG * sg) {                 // katta farq: keyingi o'lchov ham shu tomonda bo'lsa — haqiqiy o'zgarish, bo'lmasa — yolg'iz sakrash (sho'r ovqat, suv)
          var nx = W[i + 1], e2 = nx ? nx.kg - (pred + T * D.daysBetween(w.d, nx.d)) : 0, ok = !!nx && (e2 > 0) === (e > 0) && Math.abs(e2) > KSIG * sg, c = (ok ? 3 : LOCLIP) * sg;
          if (Math.abs(e) > c) e = e > 0 ? c : -c;
        }
        var L2 = pred + A * e; T = T + B * ((L2 - L) / dt - T); L = L2;
      }
      prev = w.d; out.push({ d: w.d, kg: w.kg, t: Math.round(L * 100) / 100, s: Math.round(T * 1000) / 1000 });
    });
    return out;
  }
  /* d sanadagi trend: oxirgi o'lchov ≤ d (bo'lmasa null) */
  function trendAt(ser, d) { var v = null; for (var i = 0; i < ser.length; i++) { if (ser[i].d <= d) v = ser[i].t; else break; } return v; }
  /* birinchi 7–10 kundagi tez tushish (asosan suv): kamida 14 kunlik tarix, boshlang'ich 10 kunda ≥ 1 kg va keyingi tezlikdan ≥ 2 barobar tez */
  function waterSpan(ser, D) {
    if (ser.length < 4) return null; var d0 = ser[0].d, last = ser[ser.length - 1].d; if (D.daysBetween(d0, last) < 14) return null;
    var e = null; ser.forEach(function (x) { if (D.daysBetween(d0, x.d) <= 10) e = x; }); if (!e || e === ser[0]) return null;
    var dd = D.daysBetween(d0, e.d), early = ser[0].kg - e.kg; if (dd < 4 || early < 1) return null;
    var restDays = D.daysBetween(e.d, last), rest = (e.t - ser[ser.length - 1].t) / Math.max(1, restDays) * 7, rate = early / dd * 7;
    return rate >= Math.max(0.5, 1.5 * rest) ? { from: d0, to: e.d, kg: r1(early) } : null;
  }
  /* sarlavha: davr (kun yoki null — hammasi) bo'yicha trend vazni, o'zgarish, haftalik tezlik */
  function summary(weights, today, days, D) {
    var ser = trend(weights, D); if (!ser.length) return null;
    var from = days ? D.addDays(today, -days) : ser[0].d, sub = ser.filter(function (x) { return x.d >= from; });
    var t1 = ser[ser.length - 1].t, t0 = trendAt(ser, from), d0 = from;
    if (t0 == null) { if (!sub.length) return null; t0 = sub[0].t; d0 = sub[0].d; }
    var span = D.daysBetween(d0, ser[ser.length - 1].d);
    return { ser: ser, sub: sub.length ? sub : ser.slice(-1), from: from, kg: r1(t1), cur: ser[ser.length - 1].kg, change: r1(t1 - t0), span: span, perWeek: span >= 7 ? Math.round((t1 - t0) / span * 7 * 100) / 100 : null, n: sub.length, water: waterSpan(ser, D) };
  }
  /* «haftada 2–3 marta torting» — so'nggi 14 kunda 2 tadan kam o'lchov (yoki umuman yo'q) */
  function fewWeighs(weights, today, D) { var from = D.addDays(today, -13); return (weights || []).filter(function (w) { return w.d >= from && w.d <= today; }).length < 2; }

  /* ---------- tahlil ---------- */
  function isLose(st) { return !!(st && st.setup && st.profile && LOSE[st.profile.goal]); }
  function avg(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; }
  /* o: { st, S (kalkifit-core), today } → natija (pastdagi izoh) */
  function analyze(o) {
    var st = o.st, S = o.S, D = S.dates, today = o.today || D.today(), p = st && st.profile;
    var res = { show: isLose(st), state: 'none', reasons: [], tries: [], need: null };
    if (!res.show) return res;
    var cur = S.currentWeight(st), pl = S.plan(Object.assign({}, p, { weight: cur || p.weight })), end = D.addDays(today, -1), start = D.addDays(today, -WIN);
    var since = st.trackStart || (st.created ? D.ymd(new Date(st.created)) : null) || (st.weights[0] && st.weights[0].d) || today;
    if (st.created && D.ymd(new Date(st.created)) < since) since = D.ymd(new Date(st.created)); var firstFood = null; Object.keys(st.days || {}).forEach(function (d) { var x = st.days[d]; if (x && x.food && x.food.length && (!firstFood || d < firstFood)) firstFood = d; });
    if (firstFood && firstFood < since) since = firstFood;
    var used = Math.max(0, D.daysBetween(since, today));
    var wIn = st.weights.filter(function (w) { return w.d >= start && w.d <= today; }), wSpan = wIn.length > 1 ? D.daysBetween(wIn[0].d, wIn[wIn.length - 1].d) : 0;
    var days = [], d; for (d = start; d <= end; d = D.addDays(d, 1)) days.push(d);
    var rows = days.map(function (d) { var x = S.dayOf(st, d), f = (x && x.food) || [], t = S.sumEntries(f), m = {}; f.forEach(function (e) { m[e.meal] = (m[e.meal] || 0) + (e.kcal || 0); }); return { d: d, n: f.length, k: t.kcal, p: t.p, m: m, steps: num(x && x.steps), wd: S.weekdayIdx(d) }; });
    var logged = rows.filter(function (r) { return r.n > 0; });
    var miss = { days: Math.max(0, 21 - used), weights: Math.max(0, 3 - wIn.length), span: wIn.length >= 2 ? Math.max(0, 14 - wSpan) : 14, food: Math.max(0, 10 - logged.length) };
    if (miss.days || miss.weights || miss.span || miss.food) { res.state = 'need'; res.need = miss; res.needDays = Math.max(miss.days, miss.food, miss.weights ? 0 : miss.span); return res; }

    var ser = trend(st.weights, D), wFrom = wIn[0].d, t0 = trendAt(ser, wFrom), t1 = trendAt(ser, today), n = Math.max(1, D.daysBetween(wFrom, today));
    var spend = function (r) { return pl.tdee + S.stepCredit(r.steps, num(p.height), cur, p.act); };
    var lg = logged.filter(function (r) { return r.d >= wFrom; }); if (lg.length < 5) lg = logged;
    var defAvg = avg(lg.map(function (r) { return spend(r) - r.k; }));
    var expKg = r1(-defAvg * n / KCAL_KG), actKg = r1(t1 - t0), perWeek = Math.round((t1 - t0) / n * 7 * 100) / 100;
    res.period = { from: wFrom, days: n }; res.expected = expKg; res.actual = actKg; res.perWeek = perWeek;
    res.gapKg = r1(Math.max(0, actKg - expKg)); res.gapKcal = Math.round(Math.max(0, (actKg - expKg) * KCAL_KG / n));
    res.target = pl.target; res.floor = pl.floorMin; res.tdee = pl.tdee;

    /* xavfsizlik: juda tez (haftasiga vaznning > 1%, 3+ hafta) yoki iste'mol doimo juda past → tahlil o'rniga yumshoq ogohlantirish */
    var w21 = st.weights.filter(function (w) { return w.d >= D.addDays(today, -21); }), r21 = null;
    if (w21.length >= 2 && D.daysBetween(w21[0].d, w21[w21.length - 1].d) >= 18) { var a21 = trendAt(ser, w21[0].d), b21 = trendAt(ser, w21[w21.length - 1].d); r21 = (a21 - b21) / D.daysBetween(w21[0].d, w21[w21.length - 1].d) * 7; }
    var lowShare = logged.filter(function (r) { return r.k < pl.floorMin * 0.8; }).length / logged.length;
    if (r21 != null && r21 > FAST * cur) { res.state = 'fast'; res.kind = 'fast'; res.rate = r1(r21); return res; }
    if (lowShare >= 0.7 && actKg < 0) { res.state = 'fast'; res.kind = 'low'; res.avgK = Math.round(avg(logged.map(function (r) { return r.k; }))); return res; }

    /* sabablar */
    var R = [], tgt = pl.target, h = num(p.height);
    /* 1) qadam kamaydi — faqat qadam ma'lumoti bo'lsa (iPhone veb'da yo'q — sabab chiqmaydi, aytilmaydi ham) */
    var s1 = rows.slice(0, 14).filter(function (r) { return r.steps > 0; }), s2 = rows.slice(14).filter(function (r) { return r.steps > 0; });
    if (s1.length >= 5 && s2.length >= 5) {
      var a1 = Math.round(avg(s1.map(function (r) { return r.steps; }))), a2 = Math.round(avg(s2.map(function (r) { return r.steps; }))), ds = a1 - a2;
      if (ds >= 1000) R.push({ k: 'qadam', kcal: Math.round(ds * h * STRIDE / 100 / 1000 * cur * WALK_K), a: Math.round(a1 / 100) * 100, b: Math.round(a2 / 100) * 100 });
    }
    /* 2) yozilmagan ovqatlar: odatda yeyiladigan ovqat vaqti (≥ 50% kunda) yozilmagan kunlar + kun jami limitning 60% idan past kunlar */
    var mAvg = {}, best = null; ['b', 'l', 'd'].filter(function (m) { return !(m === 'b' && S.tartibOf && S.tartibOf(p) === 'nobf'); }).forEach(function (m) {          // «Nonushta qilmayman» — nonushta sababi chiqmaydi
      var has = logged.filter(function (r) { return r.m[m] > 0; }), mis = logged.filter(function (r) { return !(r.m[m] > 0); });
      mAvg[m] = has.length ? avg(has.map(function (r) { return r.m[m]; })) : 0;
      if (has.length >= logged.length * 0.5 && mis.length && (!best || mis.length * mAvg[m] > best.n * mAvg[best.m])) best = { m: m, n: mis.length, list: mis };
    });
    var full = logged.filter(function (r) { return r.k >= tgt * LOWDAY; }), fullAvg = full.length ? avg(full.map(function (r) { return r.k; })) : tgt;
    var lowD = logged.filter(function (r) { return r.k < tgt * LOWDAY && !(best && best.list.indexOf(r) > -1); });
    var unl = (best && best.n >= 3 ? best.n * mAvg[best.m] : 0) + lowD.reduce(function (s, r) { return s + Math.max(0, fullAvg - r.k); }, 0), unk = Math.round(unl / WIN);
    if ((best && best.n >= 3) || lowD.length >= 3) { if (unk >= 40) R.push({ k: 'yozilmagan', kcal: unk, m: best && best.n >= 3 ? best.m : null, n: best && best.n >= 3 ? best.n : 0, low: lowD.length, of: WIN }); }
    /* 3) dam olish kunlari (shanba–yakshanba) ish kunlaridan ≥ 300 kkal ko'p */
    var we = full.filter(function (r) { return r.wd >= 5; }), wk = full.filter(function (r) { return r.wd < 5; });
    if (we.length >= 2 && wk.length >= 4) { var dw = Math.round(avg(we.map(function (r) { return r.k; })) - avg(wk.map(function (r) { return r.k; }))); if (dw >= WKEND) R.push({ k: 'damolish', kcal: Math.round(dw * 2 / 7), diff: dw }); }
    /* 4) oqsil kam — maqsad Bugun kartasidagi bilan BIR XIL (S.protein: 1,6 / 1,2 g/kg, BMI > 27 da tavsiya vazni); o'rtacha maqsadning 85% idan past bo'lsa. kkal emas, «58 / 110 g» */
    var need = S.protein(p, cur).g, pa = Math.round(avg(full.map(function (r) { return r.p; })));
    if (full.length >= 5 && pa < need * PROT_SH) R.push({ k: 'oqsil', g: pa, need: need });
    /* 6) rejadagi defitsit juda kichik (< 250 kkal) — maqsadni ko'rib chiqish; limit pastki chegaradan tushirilmaydi */
    var def = pl.tdee - pl.target; if (def < SMALL_DEF) R.push({ k: 'defitsit', def: Math.max(0, def), floor: pl.floorApplied, minK: pl.floorMin });
    var slow = perWeek > -0.1 || (expKg < 0 && actKg > expKg * 0.5);
    /* tushuntirilmagan katta farq (≥ 200 kkal/kun): ko'z bilan chamalangan porsiya, yog', ichimlik — o'z-o'zini qayd qilishda odatiy (ayblovsiz) */
    var expl = R.reduce(function (sx, x) { return sx + (x.kcal || 0); }, 0), un = res.gapKcal - expl;
    if (slow && un >= 200) R.push({ k: 'porsiya', kcal: Math.min(600, Math.round(un / 10) * 10), gap: res.gapKcal });
    var ORD = { oqsil: 1, defitsit: 2 };
    R.sort(function (x, y) { var ox = ORD[x.k] || 0, oy = ORD[y.k] || 0; return ox !== oy ? ox - oy : (y.kcal || 0) - (x.kcal || 0); });

    res.slow = slow; res.reasons = R.slice(0, 3);
    res.state = res.reasons.length ? 'slow' : 'fine';          // sabab topilmasa — «Hammasi to'g'ri ketyapti, sabr qiling»
    res.tries = tries(res.reasons);
    return res;
  }
  /* «Shu hafta sinab ko'ring» — sabablarga mos 2–3 ish; hech qachon «kamroq yeng» birinchi emas (umuman yo'q) */
  var TRY = { qadam: 'walk', yozilmagan: 'log', damolish: 'wkend', oqsil: 'prot', defitsit: 'goal', porsiya: 'gram' };
  function tries(reasons) {
    var out = []; (reasons || []).forEach(function (r) { var k = TRY[r.k]; if (k && out.indexOf(k) < 0) out.push(k === 'log' && r.m ? 'log_' + r.m : k); });
    ['walk', 'weigh', 'sleep'].forEach(function (k) { if (out.length < 3 && out.indexOf(k) < 0) out.push(k); });
    return out.slice(0, 3);
  }
  /* «Haftangiz» ichidagi bir martalik eslatma: 14+ kun deyarli o'zgarmagan (haftasiga < 0,1 kg) yoki kutilganning yarmidan kam */
  function stalled(a) { return !!(a && a.state === 'slow' && a.period && a.period.days >= 14 && (a.perWeek > -0.1 || (a.expected < 0 && a.actual > a.expected * 0.5))); }
  function weekKey(today, S) { return S.dates.addDays(today, -S.weekdayIdx(today)); }

  /* matnlar (UZ lotin, RU; ЎЗ — brauzerda translit). «halol» so'zi ishlatilmaydi; ayblovchi so'z yo'q */
  var TX = {
    uz: {
      plTrendT: 'Vazn trendi', plTrend: 'trend', plP28: '4 hafta', plP91: '3 oy', plPAll: 'Hammasi', plChg: '{c} kg · haftasiga {w} kg', plChg0: '{c} kg', plDots: 'tortilgan kunlar', plLine: 'haqiqiy trend',
      plWaterL: '1-hafta: suv', plWater: "Birinchi haftadagi tez tushish asosan suv edi. Kunlik sakrashlarga emas, yashil chiziqqa qarang.", plWeigh: "Maslahat: haftada 2–3 marta, ertalab, bir xil sharoitda torting — chiziq aniqroq bo'ladi.",
      plQ: 'Nega sekin ozyapman?', plCtaN: "Ma'lumotlaringizdan {n} ta sabab topildi", plCta1: "Ma'lumotlaringizdan 1 ta sabab topildi", plCtaOk: "Hammasi to'g'ri ketyapti — qarang", plCtaFast: 'Juda tez ketyapsiz — bir qarang',
      plNeedD: "Yana {n} kun yozing — keyin tahlil qilaman", plNeedW: "Yana {n} marta vazn yozing (kamida 2 hafta oralig'ida) — keyin tahlil qilaman", plNeedF: "Yana {n} kun ovqat yozing — keyin tahlil qilaman", plNeedS: "Vazn yozuvlari kamida 2 hafta oralig'ida bo'lsin — yana {n} kundan keyin torting",
      plSub: "So'nggi {n} kun · sizning yozuvlaringiz bo'yicha", plExp: "Yozuvlarga ko'ra kutilgan", plAct: 'Haqiqiy trend', plGap: 'Farq ~{kg} kg — kuniga ~{k} kkal. Sabablari quyida, eng kattasi birinchi.', plGap0: "Farq sezilarli emas — yozuvlaringiz va vazningiz bir-biriga mos.",
      plRs: 'Topilgan sabablar', plTry: "Shu hafta sinab ko'ring", plRem: 'Eslatib turilsin', plRemOn: 'Eslatish yoqildi', plRemOff: "Eslatishni o'chirish", plFoot: "Hisob taxminiy: 1 kg yog' ≈ 7 700 kkal. Bu tibbiy maslahat emas.", plSrc: 'Manbalar',
      plR_qadam: 'Kamroq yura boshladingiz', plR_qadamP: "Boshida kuniga {a} qadam edi, so'nggi 2 haftada {b}. Dietada organizm sezdirmasdan harakatni kamaytiradi — platoning eng ko'p uchraydigan sababi shu.", plKd: '≈ −{k} kkal/kun',
      plR_yoz_b: 'Nonushta {n} kunda yozilmagan', plR_yoz_l: 'Tushlik {n} kunda yozilmagan', plR_yoz_d: 'Kechki ovqat {n} kunda yozilmagan', plR_yozLow: "{n} kunda yozuv kam", plR_yozP: 'Yozilmagan ovqat ham kaloriya. Kechki ovqat odatda kunning eng kattasi.', plR_yozPLow: "Kun jami limitning 60% idan past bo'lgan kunlar — to'liq yozilmagan bo'lishi mumkin.", plR_yozX: ' Yana {n} kunda kun jami limitning 60% idan past.', plDays: '{n} kun / {of}',
      plR_damolish: "Dam olish kunlari ko'proq", plR_damolishP: "Shanba–yakshanba kuniga o'rtacha {d} kkal ko'p yeyilgan. Ikki kun haftaning foydasini yeb qo'yishi mumkin.",
      plR_oqsil: "Oqsil kam: o'rtacha {g} g", plR_oqsilP: 'Sizga ~{n} g tavsiya. Oqsil to\'q tutadi va hazmiga ko\'proq kaloriya ketadi.', plGr: '{g} / {n} g',
      plR_porsiya: "Porsiyalar taxminan yozilgan bo'lishi mumkin", plR_porsiyaP: "Yozuvlarga ko'ra vazn tezroq tushishi kerak edi. Ko'pincha sabab — ko'z bilan chamalangan porsiya, ovqatga qo'shilgan yog' va shirin ichimliklar. Bu hammada bo'ladi.",
      plR_defitsit: 'Rejadagi farq juda kichik', plR_defitsitP: "Limitingiz sarfdan kuniga atigi {d} kkal kam — natija sekin bo'ladi. Maqsadni Profil'da ko'rib chiqing.", plR_defitsitF: "Limitingiz xavfsiz pastki chegarada ({k} kkal) — uni kamaytirmaymiz. Harakat va yozuv to'liqligi yordam beradi.", plR_defK: '{d} kkal/kun',
      plT_walk: "Har ovqatdan keyin 10 daqiqa yuring (+2 500 qadam)", plT_log_b: "Nonushtani ham yozing — ovoz bilan 5 soniya", plT_log_l: "Tushlikni ham yozing — ovoz bilan 5 soniya", plT_log_d: "Kechki ovqatni ham yozing — ovoz bilan 5 soniya", plT_log: "Har kuni hamma ovqatni yozing — ovoz bilan 5 soniya",
      plT_wkend: "Shanba–yakshanba uchun oldindan reja: bitta ovqatni yengil qiling", plT_prot: "Nonushtaga tvorog yoki tuxum qo'shing (+20 g oqsil)", plT_goal: "Profil'da maqsad va faollikni ko'rib chiqing", plT_weigh: "Haftada 2–3 marta ertalab torting", plT_sleep: "7–8 soat uxlang — kam uyqu ishtahani oshiradi", plT_gram: "Bir hafta asosiy taomni tarozida tortib yozing (gramm bilan)",
      plOkT: "Hammasi to'g'ri ketyapti", plOk: "Yozuvlaringiz va vazningiz mos. Haftasiga −0,3 kg ham normal — sabr qiling, yashil chiziq pastga ketyapti.", plOkW: "Hozirgi tezlik: haftasiga {w} kg.",
      plFastT: 'Juda tez ketyapsiz', plFast: "So'nggi 3 haftada haftasiga ~{w} kg — bu vazningizning 1% idan ko'p. Bu mushak va kuchingizga zarar qilishi mumkin.", plLow: "Kunlik iste'mol ko'pincha juda past (o'rtacha {k} kkal). Bu mushak va kuchingizga zarar qilishi mumkin.", plFastB: 'Limitni oshirish', plFastH: "Profil'da maqsadni «sekin ozish» yoki «saqlash» qiling — limit oshadi.",
      plNeedT: "Tahlil uchun ma'lumot yetarli emas", plNeedH: "Kamida 21 kun foydalanish, 3 ta vazn (2 hafta oralig'ida) va 10 kun ovqat yozuvi kerak.",
      plHk: "Vazningiz kutilganidan sekin tushyapti. Sababini birga topamiz.", plHkB: 'Nega sekin?', plRemToast: 'Bu hafta: {x}',
      ft_plato: 'Nega sekin ozyapman?', ft_platoH: "Ma'lumotlaringizdan sababni topadi",
      plS1: "Hall K. D. (2008). Vazn yo'qotish uchun kerakli energiya taqchilligi. Int J Obes 32:573–576 — 7 700 kkal/kg qoidasi va uning cheklovi",
      plS2: "ACSM yurish tenglamasi: 0,1 ml O₂/kg/m → ≈ 0,5 kkal/kg/km (sof sarf)", plS3: "Qadam uzunligi ≈ bo'y × 0,415 (pedometrlarda keng qo'llanadigan baho)",
      plS4: "Morton R. W. va boshq. (2018), Br J Sports Med; Hector & Phillips (2018) — kaloriya kam paytda oqsil 1,2–1,6 g/kg va undan yuqori", plS5: "Rosenbaum M., Leibel R. L. (2010). Adaptive thermogenesis in humans. Int J Obes 34:S47–S55 — dietada harakat sarfi kamayadi",
      plS6: "Racette S. B. va boshq. (2008), Obesity — dam olish kunlari ko'proq yeyiladi; o'z-o'zini qayd qilishda ovqat kam yoziladi (Ravelli & Schoeller, 2020)"
    },
    ru: {
      plTrendT: 'Тренд веса', plTrend: 'тренд', plP28: '4 нед.', plP91: '3 мес.', plPAll: 'Всё', plChg: '{c} кг · в неделю {w} кг', plChg0: '{c} кг', plDots: 'дни взвешивания', plLine: 'настоящий тренд',
      plWaterL: '1-я неделя: вода', plWater: 'Быстрое снижение в первую неделю — в основном вода. Смотрите не на скачки по дням, а на зелёную линию.', plWeigh: 'Совет: взвешивайтесь 2–3 раза в неделю, утром, в одинаковых условиях — линия будет точнее.',
      plQ: 'Почему вес уходит медленно?', plCtaN: 'По вашим данным найдено причин: {n}', plCta1: 'По вашим данным найдена 1 причина', plCtaOk: 'Всё идёт как надо — посмотрите', plCtaFast: 'Слишком быстро — взгляните',
      plNeedD: 'Записывайте ещё {n} дн. — потом разберу', plNeedW: 'Запишите вес ещё {n} раз (с интервалом не меньше 2 недель) — потом разберу', plNeedF: 'Записывайте еду ещё {n} дн. — потом разберу', plNeedS: 'Нужны записи веса с разницей хотя бы 2 недели — взвесьтесь через {n} дн.',
      plSub: 'Последние {n} дн. · по вашим записям', plExp: 'Ожидалось по записям', plAct: 'Настоящий тренд', plGap: 'Разница ~{kg} кг — около {k} ккал в день. Причины ниже, самая большая — первой.', plGap0: 'Разница небольшая — записи и вес совпадают.',
      plRs: 'Найденные причины', plTry: 'Попробуйте на этой неделе', plRem: 'Напоминать', plRemOn: 'Напоминание включено', plRemOff: 'Выключить напоминание', plFoot: 'Расчёт примерный: 1 кг жира ≈ 7 700 ккал. Это не медицинский совет.', plSrc: 'Источники',
      plR_qadam: 'Вы стали меньше ходить', plR_qadamP: 'В начале было {a} шагов в день, за последние 2 недели — {b}. На диете организм незаметно снижает движение — это самая частая причина плато.', plKd: '≈ −{k} ккал/день',
      plR_yoz_b: 'Завтрак не записан {n} дн.', plR_yoz_l: 'Обед не записан {n} дн.', plR_yoz_d: 'Ужин не записан {n} дн.', plR_yozLow: 'Мало записей в {n} дн.', plR_yozP: 'Незаписанная еда тоже калории. Ужин обычно самый большой приём пищи.', plR_yozPLow: 'Дни, когда итог ниже 60% лимита, — возможно, записано не всё.', plR_yozX: ' Ещё {n} дн. итог ниже 60% лимита.', plDays: '{n} дн. / {of}',
      plR_damolish: 'В выходные больше', plR_damolishP: 'В субботу–воскресенье в среднем на {d} ккал в день больше. Два дня могут съесть пользу всей недели.',
      plR_oqsil: 'Мало белка: в среднем {g} г', plR_oqsilP: 'Вам рекомендуется ~{n} г. Белок дольше насыщает, и на его усвоение уходит больше калорий.', plGr: '{g} / {n} г',
      plR_porsiya: 'Порции могли быть записаны примерно', plR_porsiyaP: 'По записям вес должен был уходить быстрее. Чаще всего причина — порции «на глаз», масло в блюдах и сладкие напитки. Так бывает у всех.',
      plR_defitsit: 'Разница в плане очень маленькая', plR_defitsitP: 'Лимит меньше расхода всего на {d} ккал в день — результат будет медленным. Пересмотрите цель в Профиле.', plR_defitsitF: 'Лимит уже на безопасной нижней границе ({k} ккал) — снижать его не будем. Помогут движение и полные записи.', plR_defK: '{d} ккал/день',
      plT_walk: 'После каждой еды 10 минут прогулки (+2 500 шагов)', plT_log_b: 'Записывайте и завтрак — голосом за 5 секунд', plT_log_l: 'Записывайте и обед — голосом за 5 секунд', plT_log_d: 'Записывайте и ужин — голосом за 5 секунд', plT_log: 'Записывайте всю еду — голосом за 5 секунд',
      plT_wkend: 'План на выходные заранее: один приём пищи полегче', plT_prot: 'Добавьте к завтраку творог или яйца (+20 г белка)', plT_goal: 'Пересмотрите цель и активность в Профиле', plT_weigh: 'Взвешивайтесь 2–3 раза в неделю утром', plT_sleep: 'Спите 7–8 часов — недосып усиливает аппетит', plT_gram: 'Неделю взвешивайте основное блюдо и записывайте в граммах',
      plOkT: 'Всё идёт как надо', plOk: 'Записи и вес совпадают. Даже −0,3 кг в неделю — это нормально, наберитесь терпения: зелёная линия идёт вниз.', plOkW: 'Сейчас: {w} кг в неделю.',
      plFastT: 'Слишком быстро', plFast: 'За последние 3 недели ~{w} кг в неделю — больше 1% вашего веса. Это может навредить мышцам и силам.', plLow: 'Дневное потребление часто слишком низкое (в среднем {k} ккал). Это может навредить мышцам и силам.', plFastB: 'Повысить лимит', plFastH: 'В Профиле выберите цель «худеть медленно» или «поддерживать» — лимит станет выше.',
      plNeedT: 'Пока мало данных для разбора', plNeedH: 'Нужно минимум 21 день, 3 записи веса (с разницей 2 недели) и 10 дней записей еды.',
      plHk: 'Вес уходит медленнее, чем ожидалось. Давайте вместе найдём причину.', plHkB: 'Почему медленно?', plRemToast: 'На этой неделе: {x}',
      ft_plato: 'Почему вес уходит медленно?', ft_platoH: 'Находит причину по вашим данным',
      plS1: 'Hall K. D. (2008). What is the required energy deficit per unit weight loss? Int J Obes 32:573–576 — правило 7 700 ккал/кг и его ограничения',
      plS2: 'Уравнение ходьбы ACSM: 0,1 мл O₂/кг/м → ≈ 0,5 ккал/кг/км (чистый расход)', plS3: 'Длина шага ≈ рост × 0,415 (распространённая оценка в шагомерах)',
      plS4: 'Morton R. W. и др. (2018), Br J Sports Med; Hector & Phillips (2018) — белок 1,2–1,6 г/кг и выше при дефиците калорий', plS5: 'Rosenbaum M., Leibel R. L. (2010). Adaptive thermogenesis in humans. Int J Obes 34:S47–S55 — на диете снижается расход на движение',
      plS6: 'Racette S. B. и др. (2008), Obesity — в выходные едят больше; при самозаписи еда недоучитывается (Ravelli & Schoeller, 2020)'
    }
  };
  var SRC = ['plS1', 'plS2', 'plS3', 'plS4', 'plS5', 'plS6'];
  return { ALPHA: ALPHA, BETA: BETA, KCAL_KG: KCAL_KG, WIN: WIN, WALK_K: WALK_K, STRIDE: STRIDE, PROT: PROT, trend: trend, trendAt: trendAt, waterSpan: waterSpan, summary: summary, fewWeighs: fewWeighs, analyze: analyze, tries: tries, isLose: isLose, stalled: stalled, weekKey: weekKey, PROT_SH: PROT_SH, TX: TX, SRC: SRC };
});
