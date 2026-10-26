// KalkiFit «Vazn trendi» + «Nega sekin ozyapman?» — sof hisob testi (assets/kalkifit-plato.js).   node tools/test-plato-core.js
// Trend (shovqin va sakrashga chidamli), sababchilar (har sabab uchun sintetik 28 kunlik foydalanuvchi: tools/dizayn/plato-demo.cjs), xavfsizlik (limit pastki chegaradan past emas), qadamsiz (iPhone veb), boshqa maqsadlar.
'use strict';
const assert = require('node:assert/strict'); const path = require('node:path');
const ROOT = path.resolve(__dirname, '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), P = require(path.join(ROOT, 'assets/kalkifit-plato.js')), PD = require(path.join(ROOT, 'tools/dizayn/plato-demo.cjs')), D = S.dates;
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const T = '2026-10-26', st0 = (k) => PD.build(k, S, T), an = (st) => P.analyze({ st, S, today: T });

/* 1. trend: shovqinli qator — silliq, kunlik ±1 kg sakrash chiziqni 0,15 kg dan ko'p siljitmaydi, vaqtga moslangan */
{
  let s = 3; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }, W = [];
  for (let i = 0; i < 60; i++) W.push({ d: D.addDays('2026-08-01', i), kg: 90 - i * 0.05 + (rnd() - 0.5) * 2 });
  const ser = P.trend(W, D), raw = W.map((w) => w.kg), tr = ser.map((x) => x.t);
  const jit = (a) => a.slice(1).reduce((m, x, i) => Math.max(m, Math.abs(x - a[i])), 0);
  assert.ok(jit(tr) < 0.25 && jit(raw) > 1, 'kunlik o\'zgarish: trend ' + jit(tr).toFixed(2) + ' / xom ' + jit(raw).toFixed(2));
  assert.ok(Math.abs(tr[59] - (90 - 59 * 0.05)) < 0.9, 'trend haqiqiy darajaga yaqin: ' + tr[59]);
  const W2 = W.map((w) => ({ ...w })); W2[40].kg += 3; const t2 = P.trend(W2, D);
  assert.ok(Math.abs(t2[40].t - tr[40]) <= 0.31 && Math.abs(t2[45].t - tr[45]) < 0.2, '+3 kg bitta sakrash: trend ≤ 0,3 kg siljiydi, 5 kunda qaytadi');
  const a = P.trend([{ d: '2026-01-01', kg: 80 }, { d: '2026-01-02', kg: 79 }], D), b = P.trend([{ d: '2026-01-01', kg: 80 }, { d: '2026-01-11', kg: 79 }], D);
  assert.equal(a[1].t, 79.9); assert.ok(Math.abs(b[1].t - (80 - (1 - Math.pow(0.9, 10)))) < 0.01, '10 kunlik oraliq: a = 1 − 0,9^10');
  const sm = P.summary(W, D.addDays('2026-08-01', 59), 28, D); assert.ok(sm.perWeek < 0 && sm.change < 0 && sm.n >= 28, 'davr xulosasi: ' + JSON.stringify({ c: sm.change, w: sm.perWeek }));
  assert.equal(P.summary(W, D.addDays('2026-08-01', 59), 0, D).n, 60, '«Hammasi» — barcha o\'lchovlar');
  ok('Trend: alfa 0,1 (oraliqqa moslangan), shovqinda silliq, +3 kg sakrashga chidamli; davr bo\'yicha o\'zgarish va haftalik tezlik');
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
  assert.ok(Math.abs(a.reasons[0].kcal - Math.round(a.reasons[0].n * 600 * 1.12 / 28)) <= 6, 'yozilmagan kkal = kunlar × shaxsiy o\'rtacha / 28: ' + a.reasons[0].kcal); assert.ok(a.tries.includes('log_d'));
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
