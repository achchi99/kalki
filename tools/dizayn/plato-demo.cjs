/* «Nega sekin ozyapman?» uchun sinov/demo foydalanuvchilari (sintetik, deterministik). Testlar va skrinshot asbobi shu yerdan oladi.
   Vazn energiya balansidan yasaladi: haqiqiy sarf (TDEE + ortiqcha qadam) − (yozilgan + yozilmagan «yashirin» iste'mol), 7 700 kkal/kg, ±0,6 kg shovqin.
   build(kind, S, today) → state.  kind: qadam | kechki | damolish | oqsil | joyida | kam | tez | ios | saqlash | olish | demo */
function rng(seed) { let s = seed || 1; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
const KINDS = ['qadam', 'kechki', 'damolish', 'oqsil', 'joyida', 'kam', 'tez', 'ios', 'saqlash', 'olish', 'demo'];
function build(kind, S, today) {
  const D = S.dates, T = today || D.today(), r = rng(7), st = S.emptyState();
  st.setup = true; st.created = Date.now() - 40 * 864e5; st.trackStart = D.addDays(T, -40);
  st.profile = { sex: 'm', age: 35, height: 178, weight: 88, act: 2, goal: kind === 'saqlash' ? 'keep' : kind === 'olish' ? 'gain' : 'lose' };
  st.prefs = { tipsDone: true, lpTip: 1, suvFrom: T, jokes: false, hwSeen: T, yemayK: 1 };
  const pl = S.plan(st.profile), N = kind === 'kam' ? 12 : 35, prot = kind === 'oqsil' || kind === 'demo' ? 0.55 : 1.7;
  const eat = kind === 'tez' ? 0.5 : kind === 'olish' ? 1.6 : kind === 'saqlash' ? 1.35 : 1.12;          // ~1 900 kkal: limitga yaqin
  let kg = 88, wsum = 0; const W = [];
  for (let i = N; i >= 1; i--) {
    const d = D.addDays(T, -i), x = S.ensureDay(st, d), we = S.weekdayIdx(d) >= 5;
    if (kind !== 'ios') x.steps = kind === 'qadam' || kind === 'demo' ? (i > 14 ? 8200 : 5100) + Math.round(r() * 600 - 300) : 7600 + Math.round(r() * 800 - 400);
    const A = (meal, kcal) => { S.addFood(st, d, { meal, fid: 'x' + meal, name: { b: 'Nonushta', l: 'Tushlik', d: 'Kechki', s: 'Tamaddi' }[meal], kcal, p: Math.round(kcal * prot * 0.05), f: Math.round(kcal / 30), c: Math.round(kcal / 9), g: 250, est: false, ts: 1 }); return kcal; };
    let logged = 0, hidden = 0; const add = kind === 'damolish' && we ? 1.5 : 1;
    if (!(kind === 'kam' && i > 10)) {
      logged += A('b', Math.round(450 * eat * add)) + A('l', Math.round(650 * eat * add));
      const dn = Math.round(600 * eat * add); if ((kind === 'kechki' || kind === 'demo') && i % 4 === 0) hidden += dn; else logged += A('d', dn);
      if (kind === 'damolish' && we) logged += A('s', 400);
    } else hidden += 1700 * eat;
    if (kind === 'ios') hidden += 350;          // qadamsiz, porsiyalar «ko'z bilan»
    if (kind === 'demo') hidden += 150;
    const spend = pl.tdee + S.stepCredit(x.steps || 0, 178, kg, 2) - (kind === 'qadam' || kind === 'demo' ? (i <= 14 ? 120 : 0) : 0);          // dietada harakat kamayishi (NEAT)
    kg -= (spend - logged - hidden) / 7700 + (kind === 'demo' && i > N - 7 ? 0.3 : 0);          // demo: 1-haftada suv
    W.push([d, kg]);
  }
  W.forEach(([d, v], j) => { if (j % (kind === 'kam' ? 6 : 3) === 0 || j === W.length - 1) S.addWeight(st, d, Math.round((v + (r() - 0.5) * 1.2) * 10) / 10); });
  return st;
}
module.exports = { build, KINDS };
