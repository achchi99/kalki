// KalkiFit «Vazn trendi» + «Nega sekin ozyapman?» — sof hisob testi (assets/kalkifit-plato.js).   node tools/test-plato-core.js
// Trend (shovqin va sakrashga chidamli), sababchilar (har sabab uchun sintetik 28 kunlik foydalanuvchi: tools/dizayn/plato-demo.cjs), xavfsizlik (limit pastki chegaradan past emas), qadamsiz (iPhone veb), boshqa maqsadlar.
'use strict';
const assert = require('node:assert/strict'); const path = require('node:path');
const ROOT = path.resolve(__dirname, '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), P = require(path.join(ROOT, 'assets/kalkifit-plato.js')), PD = require(path.join(ROOT, 'tools/dizayn/plato-demo.cjs')), D = S.dates;
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const T = '2026-10-26', st0 = (k) => PD.build(k, S, T), an = (st) => P.analyze({ st, S, today: T });

/* 1. trend (Holt, v47): doimiy ozishda nuqtalar o'rtasidan (o'rtacha og'ish ≤ 0,2 kg), +1,5 kg sakrash ≤ 0,3 kg, plato, 2–3 yozuv; eski EMA bilan solishtirish */
{
  const rngf = (s) => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const ser = (kind, step, seed, amp = 1.0) => { const r = rngf(seed), W = [], tru = []; for (let i = 0; i < 70; i += step) { const t = kind === 'plato' ? 90 - Math.min(i, 35) * 0.08 : 90 - i * 0.08; tru.push(t); W.push({ d: D.addDays('2026-07-01', i), kg: Math.round((t + (r() - 0.5) * amp) * 10) / 10 }); } return { W, tru }; };
  const ema = (W) => { let t = null, p = null; return W.map((w) => { if (t == null) t = w.kg; else t += (1 - 0.9 ** D.daysBetween(p, w.d)) * (w.kg - t); p = w.d; return { t }; }); };
  const M = {}, R = [];
  for (const step of [1, 2, 3]) {
    let bias = 0, be = 0, nb = 0, lift = 0, lmax = 0, pe = 0, ps = 0;
    for (let k = 1; k <= 30; k++) {
      const { W } = ser('loss', step, k * 7), tr = P.trend(W, D), te = ema(W); tr.forEach((x, q) => { if (q * step >= 21) { bias += x.t - x.kg; be += te[q].t - x.kg; nb++; } });
      const j = Math.floor(50 / step), W2 = W.map((w) => ({ ...w })); W2[j].kg += 1.5; const t2 = P.trend(W2, D), l = Math.max(...[0, 1, 2, 3].map((q) => t2[j + q].t - tr[j + q].t)); lift += l / 30; lmax = Math.max(lmax, l);
      const pl = ser('plato', step, k * 11), tp = P.trend(pl.W, D), z = tp[tp.length - 1]; pe += Math.abs(z.t - pl.tru[pl.tru.length - 1]) / 30; ps += Math.abs(z.s * 7) / 30;
    }
    M[step] = { bias: bias / nb, ema: be / nb, lift, lmax, pe, ps };
    R.push('har ' + step + ' kunda: og\'ish ' + (bias / nb).toFixed(2) + ' (EMA ' + (be / nb).toFixed(2) + '), sakrash ' + lift.toFixed(2) + ' (eng yomoni ' + lmax.toFixed(2) + '), plato xato ' + pe.toFixed(2) + ' kg, tezlik ' + ps.toFixed(2) + ' kg/hafta');
  }
  for (const st of [1, 2, 3]) { assert.ok(Math.abs(M[st].bias) <= 0.2, 'doimiy ozish: o\'rtacha og\'ish ' + M[st].bias); assert.ok(M[st].ema > 0.5, 'eski EMA orqada qolardi: ' + M[st].ema); assert.ok(M[st].lift <= 0.3, '+1,5 kg sakrash (o\'rtacha): ' + M[st].lift); assert.ok(M[st].pe <= 0.25 && M[st].ps <= 0.15, 'plato: daraja va tezlik ' + M[st].pe + ' / ' + M[st].ps); }
  assert.ok(M[1].lmax <= 0.3, 'har kuni tortishda eng yomon sakrash ≤ 0,3: ' + M[1].lmax);
  /* shovqinsiz: aniq chiziq, bitta sakrash */
  const W0 = Array.from({ length: 30 }, (_, i) => ({ d: D.addDays('2026-07-01', i * 2), kg: Math.round((90 - i * 0.16) * 10) / 10 })), t0 = P.trend(W0, D);
  assert.ok(Math.abs(t0[29].t - W0[29].kg) <= 0.1, 'shovqinsiz ozish: trend = tarozi (' + t0[29].t + ' / ' + W0[29].kg + ')'); assert.ok(Math.abs(t0[29].s * 7 + 0.56) < 0.05, 'tezlik −0,56 kg/hafta: ' + t0[29].s * 7);
  const W1 = W0.map((w) => ({ ...w })); W1[20].kg += 1.5; const t1 = P.trend(W1, D); assert.ok(Math.max(...[20, 21, 22, 23].map((q) => t1[q].t - t0[q].t)) <= 0.3, 'shovqinsiz qatorda bitta +1,5 kg sakrash ≤ 0,3 kg');
  const Wend = W0.map((w) => ({ ...w })); Wend[29].kg += 1.5; assert.ok(P.trend(Wend, D)[29].t - t0[29].t <= 0.3, 'oxirgi o\'lchov sakrash bo\'lsa ham ≤ 0,3 kg (tasdiq yo\'q)');
  const Wjump = W0.map((w, i) => ({ ...w, kg: i >= 20 ? w.kg - 2 : w.kg })), tj = P.trend(Wjump, D); assert.ok(Math.abs(tj[29].t - Wjump[29].kg) < 0.5, 'tasdiqlangan haqiqiy o\'zgarish (−2 kg) qabul qilinadi: ' + tj[29].t + ' / ' + Wjump[29].kg);
  /* 2–3 yozuv */
  const f2 = P.trend([{ d: '2026-01-01', kg: 85 }, { d: '2026-01-08', kg: 84.4 }], D), f3 = P.trend([{ d: '2026-01-01', kg: 85 }, { d: '2026-01-08', kg: 84.4 }, { d: '2026-01-15', kg: 84.0 }], D);
  assert.equal(P.trend([{ d: '2026-01-01', kg: 85 }], D)[0].t, 85); assert.ok(f2[1].t < 85 && f2[1].t >= 84.4 && f3[2].t >= 84.0 && f3[2].t < f3[1].t, '2–3 yozuv: ' + f2.map((x) => x.t) + ' | ' + f3.map((x) => x.t));
  const sm = P.summary(ser('loss', 1, 5).W, D.addDays('2026-07-01', 69), 28, D); assert.ok(sm.perWeek < -0.4 && sm.perWeek > -0.75, 'haftalik tezlik yangi trenddan: ' + sm.perWeek);
  ok('Trend (Holt, sakrash cheklovi): ' + R.join('; '));
}
/* 2. birinchi hafta «suv» oralig'i */
{
  const sm = P.summary(st0('demo').weights, T, 0, D); assert.ok(sm.water && sm.water.kg >= 1, 'demo: suv oralig\'i ' + JSON.stringify(sm.water));
  assert.equal(P.summary(st0('joyida').weights, T, 0, D).water, null, 'bir tekis ozishda belgilanmaydi');
  ok('1-hafta «suv»: tez boshlang\'ich tushish belgilanadi (' + sm.water.kg + ' kg), bir tekis qatorda yo\'q');
}
/* 3. sababchilar: to'g'ri sabab, to'g'ri tartib, to'g'ri kkal */
{
  const R = (k) => an(st0(k)), ks = (a) => a.reasons.map((r) => r.k);
  let a = R('qadam'); assert.equal(a.state, 'slow'); assert.equal(ks(a)[0], 'qadam');
  const r = a.reasons[0], want = (r.a - r.b) * 178 * 0.415 / 100 / 1000 * S.currentWeight(st0('qadam')) * 0.5; assert.ok(Math.abs(r.kcal - want) < 15 && r.a >= 7800 && r.b <= 5500, 'qadam kkal: ' + r.kcal + ' ≈ ' + Math.round(want));
  assert.ok(a.tries.includes('walk'));
  a = R('kechki'); assert.equal(ks(a)[0], 'yozilmagan'); assert.equal(a.reasons[0].m, 'd'); assert.ok(a.reasons[0].n >= 7 && a.reasons[0].n <= 9, 'kechki: ' + a.reasons[0].n + ' kun');
  assert.ok(Math.abs(a.reasons[0].kcal - Math.round(a.reasons[0].n * 600 * 1.2 / 28)) <= 6, 'yozilmagan kkal = kunlar × shaxsiy o\'rtacha / 28: ' + a.reasons[0].kcal); assert.ok(a.tries.includes('log_d'));
  a = R('damolish'); assert.equal(ks(a)[0], 'damolish'); assert.ok(a.reasons[0].diff >= 300, 'dam olish farqi ' + a.reasons[0].diff); assert.equal(a.reasons[0].kcal, Math.round(a.reasons[0].diff * 2 / 7));
  a = R('oqsil'); assert.ok(ks(a).includes('oqsil')); const o = a.reasons.find((x) => x.k === 'oqsil'); assert.ok(o.g < o.need && o.need === Math.round(1.2 * P.refWeight(st0('oqsil').profile, S.currentWeight(st0('oqsil'))) / 5) * 5, 'oqsil ' + o.g + ' / ' + o.need);
  a = R('demo'); assert.deepEqual(ks(a), ['yozilmagan', 'qadam', 'oqsil'], 'demo tartibi (kkal bo\'yicha, oqsil oxirida): ' + ks(a)); assert.ok(a.reasons[0].kcal > a.reasons[1].kcal);
  assert.ok(a.expected < a.actual && a.expected < 0, 'kutilgan > haqiqiy tushish');
  ok('Sabablar: qadam (Δqadam × bo\'y×0,415 × vazn × 0,5), kechki ovqat yozilmagan (kun × o\'rtacha / 28), dam olish (+≥300), oqsil (< 1,2 g/kg); tartib — ta\'sir bo\'yicha, ≤ 3');
}
/* 4. holatlar: hammasi joyida / ma'lumot yetarli emas / juda tez */
{
  let a = an(st0('joyida')); assert.equal(a.state, 'fine', 'joyida: ' + a.state + ' ' + JSON.stringify(a.reasons)); assert.equal(a.reasons.length, 0);
  a = an(st0('kam')); assert.equal(a.state, 'need'); assert.ok(a.need && (a.need.span > 0 || a.need.food > 0 || a.need.weights > 0), JSON.stringify(a.need));
  const st = st0('joyida'); st.created = Date.now() - 10 * 864e5; st.trackStart = D.addDays(T, -10); Object.keys(st.days).forEach((d) => { if (d < st.trackStart) delete st.days[d]; }); st.weights = st.weights.filter((w) => w.d >= st.trackStart);
  a = an(st); assert.equal(a.state, 'need'); assert.ok(a.need.days >= 10, 'kunlar yetmaydi: ' + JSON.stringify(a.need));
  a = an(st0('tez')); assert.equal(a.state, 'fast'); assert.equal(a.reasons.length, 0, 'tez ozishda sabab/«kamroq yeng» yo\'q');
  ok('Holatlar: joyida → «Hammasi to\'g\'ri», 21 kun / 3 vazn / 14 kun oraliq / 10 kun ovqat yetmasa → nima yetmasligi, haftasiga > 1% → yumshoq ogohlantirish');
}
/* 5. xavfsizlik: hech bir holatda limit pastki chegaradan past tavsiya qilinmaydi; «kamroq yeng» birinchi emas (umuman yo'q) */
{
  for (const k of PD.KINDS) for (const sex of ['m', 'f']) for (const act of [1, 2, 3]) {
    const st = st0(k); st.profile.sex = sex; st.profile.act = act; if (sex === 'f') { st.profile.height = 160; st.profile.weight = 70; }
    const a = an(st); if (!a.show || a.state === 'need') continue;
    assert.ok(a.target >= S.FLOOR[sex], k + ': limit ' + a.target + ' ≥ ' + S.FLOOR[sex]); assert.equal(a.floor, S.FLOOR[sex]);
    const d = a.reasons.find((r) => r.k === 'defitsit'); if (d) assert.ok(d.minK === S.FLOOR[sex]);
    assert.ok(!(a.tries || []).some((t) => /less|kam|cut/.test(t)), 'kaloriyani kamaytirish taklifi yo\'q: ' + a.tries);
  }
  for (const l of ['uz', 'ru']) for (const [k, v] of Object.entries(P.TX[l])) {
    assert.ok(!/halol|ҳалол|алд|yolg'on|aldayap|лож|обман/i.test(v), l + '.' + k + ': taqiqlangan/ayblovchi so\'z');
    if (/^plT_/.test(k)) assert.ok(!/kamroq yeng|kaloriyani kamayt|меньше ешьте|снизьте калор/i.test(v), l + '.' + k + ': «kamroq yeng» taklifi');
  }
  for (const k of Object.keys(P.TX.uz)) assert.ok(P.TX.ru[k] != null, 'RU tarjima yo\'q: ' + k);
  const lowF = st0('joyida'); lowF.profile = { sex: 'f', age: 50, height: 152, weight: 55, act: 1, goal: 'lose' }; lowF.weights = lowF.weights.map((w) => ({ d: w.d, kg: Math.round((w.kg - 31) * 10) / 10 })); /* vazn ham shu odamniki */ const pl = S.plan(lowF.profile);
  assert.ok(pl.floorApplied && pl.target === 1200); const a = an(lowF); if (a.state !== 'need' && a.state !== 'fast') { const d = a.reasons.find((r) => r.k === 'defitsit'); assert.ok((d && d.floor) || a.reasons.length === 3, 'pastki chegarada: defitsit sababi «kamaytirmaymiz» matni bilan: ' + JSON.stringify(a.reasons)); }
  ok('Xavfsizlik: 11 holat × 2 jins × 3 faollik — limit ≥ pastki chegara (1500/1200), «kamroq yeng» taklifi yo\'q, ayblovchi so\'z yo\'q, RU to\'liq');
}
/* 6. qadamsiz (iPhone veb) va boshqa maqsadlar */
{
  let a = an(st0('ios')); assert.ok(a.show && !a.reasons.some((r) => r.k === 'qadam'), 'qadamsiz: qadam sababi yo\'q'); assert.ok(a.state === 'slow' && a.reasons[0].k === 'porsiya', 'tushuntirilmagan farq — porsiya: ' + JSON.stringify(a.reasons));
  for (const k of ['saqlash', 'olish']) { a = an(st0(k)); assert.equal(a.show, false, k + ': karta chiqmaydi'); assert.equal(a.state, 'none'); }
  const s2 = st0('demo'); s2.setup = false; assert.equal(an(s2).show, false);
  ok('iPhone (qadamsiz) — qadam sababi chiqmaydi; maqsad «saqlash» / «vazn olish» — tahlil yo\'q');
}
/* 7. «Shu hafta sinab ko'ring» va «Haftangiz» eslatmasi */
{
  assert.deepEqual(P.tries([{ k: 'qadam' }, { k: 'yozilmagan', m: 'd' }, { k: 'oqsil' }]), ['walk', 'log_d', 'prot']); assert.deepEqual(P.tries([]), ['walk', 'weigh', 'sleep']); assert.equal(P.tries([{ k: 'oqsil' }]).length, 3);
  assert.equal(P.stalled(an(st0('ios'))), true, 'kutilganning yarmidan kam'); assert.equal(P.stalled(an(st0('demo'))), false, 'kutilganning 88% i — eslatma yo\'q'); assert.equal(P.stalled(an(st0('joyida'))), false); assert.equal(P.stalled(an(st0('kam'))), false);
  assert.equal(P.weekKey('2026-10-28', S), '2026-10-26', 'hafta — dushanbadan');
  ok('Sinab ko\'ring: sabablarga mos 2–3 ish (to\'ldiruvchi: yurish, tortish, uyqu); «Haftangiz» eslatmasi faqat sekin holatda');
}
console.log('plato-core: ' + n + ' guruh OK');
