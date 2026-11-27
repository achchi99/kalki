/* v107: TAYYORLASH USULI (data/baza-usul.json → tools/usul-yasa.js → data/ovqatlar.json oila o'qi «usul»).
 *  1) bazadagi HAR usulli taomning HAR kombinatsiyasida kkal tartibi: chuqur yog' > tova > duxovka ≥ aerogril ≥ bug'/qaynatish;
 *  2) model: yog' shimilishi oraliqlari (tova 5–10, chuqur 10–15, duxovka 1–3, aerogril 0–2, bug'/qaynatish 0), langar qiymati o'zgarmaydi, usul m0 → m0 = o'zi;
 *  3) qamrov (talab qilingan guruhlar) va mavjud alohida usul taomlari (tovuq-kokrak-qov …) — oila varianti (alias), eski yozuvlar (vr) mos;
 *  4) qidiruv/matn/ovoz/AI: usul so'zlari (aerogril, аэрогриль, air fryer, airfryer, аэрофритюрница, duxovka, в духовке, на пару, bug'da, qovurilgan, жареный …) usulni tanlaydi;
 *  5) ro'yxat yorlig'i qisqa («Tovuq kotleti · aerogril»).   node tools/test-usul.js */
'use strict';
const assert = require('assert');
const S = require('../assets/kalkifit-core.js'), Y = require('./usul-yasa.js'), J = require('../data/ovqatlar.json'), U = require('../data/baza-usul.json');
S.setUsul(J.us); const foods = S.buildIndex(S.normFoods(J.foods)), by = Object.fromEntries(foods.map((f) => [f.id, f]));
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. tartib — bazadagi barcha usulli oilalar, har kombinatsiya */
const fams = foods.filter((f) => f.fam && S.usulAx(f)); let combos = 0;
for (const f of fams) {
  const ax = S.usulAx(f), ai = f.fam.ax.indexOf(ax), others = Object.keys(f.fam.g).map((k) => k.split('.')).filter((p) => p[ai] === ax.d);
  for (const p of others) { const byU = {}; ax.o.forEach((o) => { if (!o.u) return; const q = p.slice(); q[ai] = o.i; const sel = S.famSelOf(f, q.join('.')), v = S.famVariant(f, sel); if (v && f.fam.g[q.join('.')]) byU[o.u] = v.k; });
    const bad = Y.tartibXato(byU); assert.deepStrictEqual(bad, [], f.id + ' [' + p.join('.') + ']: ' + bad.join('; ')); combos++; }
}
assert.ok(fams.length >= 30, 'usulli taomlar: ' + fams.length);
ok('Tartib (chuqur yog\' > tova > duxovka ≥ aerogril ≥ bug\'/qaynatish): ' + fams.length + ' ta usulli taom, ' + combos + ' kombinatsiya — buzilish yo\'q');
/* 2. model */
const RNG = { tova: [5, 10], chuqur: [10, 15], duxovka: [1, 3], aerogril: [0, 2], bug: [0, 0], qaynatilgan: [0, 0] };
for (const [c, s] of Object.entries(U.sinf)) for (const [m, a] of Object.entries(s.A)) if (RNG[m]) assert.ok(a >= RNG[m][0] - 1e-9 && a <= RNG[m][1] + 1e-9, c + '.' + m + ': A=' + a + ' (' + RNG[m] + ')');
for (const [c, s] of Object.entries(U.sinf)) for (const m of Object.keys(s.Y)) { const cell = { k: 300, p: 20, f: 20, c: 5, fb: 1 }, r = Y.hisob(cell, m, m, c); assert.ok(Math.abs(r.k - 300) <= 1 && Math.abs(r.f - 20) <= 0.1 && Math.abs(r.p - 20) <= 0.1, c + ' ' + m + '→' + m + ': ' + JSON.stringify(r)); }
const r1 = Y.hisob({ k: 211, p: 19.7, f: 13, c: 4.4 }, 'tova', 'aerogril', 'kotlet'); assert.ok(r1.k < 211 && r1.f < 13 && r1.p >= 19.7, 'kotlet tova→aerogril: ' + JSON.stringify(r1));
ok('Model: yog\' shimilishi sinflarda talab oralig\'ida (tova 5–10 · chuqur 10–15 · duxovka 1–3 · aerogril 0–2 · bug\'/qaynatish 0 g/100 g); usul→o\'zi = o\'zi; kotlet tova→aerogril: kkal va yog\' kamayadi, oqsil kamaymaydi');
/* langar — mavjud qiymat saqlanadi; eski alohida taomlar — oila varianti */
const ALIAS = { 'tovuq-kokrak-qov': ['tovuq-kokrak', 'tova'], 'tovuq-kokrak-duxovka': ['tovuq-kokrak', 'duxovka'], 'tovuq-qanot-duxovka': ['tovuq-qanot', 'duxovka'], 'tovuq-boldir-qov': ['tovuq-boldir-duxovka', 'tova'], 'qovoqcha-qovurilgan': ['qovoqcha', 'tova'], 'baqlajon-qovurilgan': ['baqlajon-qaynatilgan', 'tova'], 'tuxum-qov-yogsiz': ['tuxum', 'yogsiz'] };
const old = { 'tovuq-kokrak-qov': 187, 'tovuq-kokrak-duxovka': 165, 'tovuq-qanot-duxovka': 254, 'tovuq-boldir-qov': 268, 'qovoqcha-qovurilgan': 125, 'baqlajon-qovurilgan': 170, 'tuxum-qov-yogsiz': 143 };
for (const [id, [fid, v]] of Object.entries(ALIAS)) { const a = by[id]; assert.ok(a && a.h && a.al && a.al.f === fid && a.al.v === v, id + ' alias: ' + JSON.stringify(a && a.al)); const vv = S.famVariant(by[fid], S.famSelOf(by[fid], v)); assert.equal(vv.k, old[id], id + ' qiymati saqlandi'); }
/* eski yozuv (usul o'qisiz vr) — standart usul, qiymat o'zgarmagan */
for (const [fid, vr, k] of [['somsa', 'oddiy.yogli', 296], ['manti', 'goshtli', 226], ['shashlik', 'gosht', 240], ['chuchvara', 'goshtli.shorvada', 104], ['kartoshka', 'fri', 310], ['tovuq-kotlet', '', 211]]) { const v = S.famVariant(by[fid], S.famSelOf(by[fid], vr)); assert.equal(v.k, k, fid + ' ' + vr + ' → ' + v.k); }
ok('Mavjud qiymatlar (langar) o\'zgarmadi: ' + Object.keys(ALIAS).join(', ') + ' — endi oila varianti (qidiruvda yashirin, eski yozuvlar ochiladi); usul o\'qi yo\'q eski vr (somsa, manti, shashlik, chuchvara) — standart usul, kkal o\'zgarmagan');
/* 3. qamrov */
const need = { kotlet: ['tovuq-kotlet', 'kurka-kotlet', 'kotlet', 'mol-kotlet-grill', 'baliq-kotlet'], tovuq: ['tovuq-kokrak', 'tovuq-son', 'tovuq-qanot', 'tovuq-boldir-duxovka'], baliq: ['losos', 'treska', 'mintay', 'xek', 'forel'], kartoshka: ['kartoshka'], sirniki: ['sirniki'], chuchvara: ['chuchvara', 'manti'], xamir: ['somsa', 'pirojki'], tuxum: ['tuxum'], sabzavot: ['brokkoli-qaynatilgan', 'gulkaram-qaynatilgan', 'qovoqcha', 'baqlajon-qaynatilgan'], naggets: ['naggets'], kabob: ['shashlik', 'lyulya', 'jigar-kabob'] };
const has = (id, us) => { const a = S.usulAx(by[id]); assert.ok(a, id + ': usul o\'qi yo\'q'); const u = a.o.map((o) => o.u).filter(Boolean); us.forEach((x) => assert.ok(u.includes(x), id + ': ' + x + ' yo\'q (' + u + ')')); };
Object.values(need).flat().forEach((id) => has(id, []));
has('tovuq-kotlet', ['tova', 'duxovka', 'aerogril', 'bug']); has('kartoshka', ['chuqur', 'aerogril', 'duxovka', 'qaynatilgan']); has('chuchvara', ['qaynatilgan', 'tova', 'bug']); has('manti', ['bug', 'qaynatilgan', 'tova']); has('somsa', ['duxovka', 'tova']); has('pirojki', ['duxovka', 'tova']);
has('tuxum', ['qaynatilgan', 'tova']); has('brokkoli-qaynatilgan', ['bug', 'gril', 'tova']); has('shashlik', ['mangal', 'duxovka', 'tova']); has('naggets', ['chuqur', 'aerogril', 'duxovka']); has('losos', ['duxovka', 'aerogril', 'bug', 'tova', 'gril']);
ok('Qamrov: ' + Object.entries(need).map(([g, l]) => g + ' ' + l.length).join(' · ') + ' — har birida talab qilingan usullar');
/* 4. qidiruv / matn / AI */
const Q = { aerogril: ['aerogril', 'aerogrilda', 'аэрогриль', 'в аэрогриле', 'air fryer', 'airfryer', 'аэрофритюрница', 'в аэрофритюрнице'], duxovka: ['duxovka', 'duxovkada', 'в духовке', 'запечённый', 'запеченная'], bug: ['на пару', "bug'da", 'bugda'], tova: ['qovurilgan', 'жареный', 'жареная', 'на сковороде'], qaynatilgan: ['qaynatilgan', 'отварной', 'варёная'], chuqur: ['во фритюре', 'fri'] };
for (const [u, ws] of Object.entries(Q)) for (const w of ws) { const r = S.usulQ('tovuq kotlet ' + w); assert.equal(r.u, u, w + ' → ' + JSON.stringify(r)); assert.equal(r.q, 'tovuq kotlet', w); }
assert.equal(S.usulQ('aerogril').u, null, 'faqat usul so\'zi — taom yo\'q, o\'zgarmaydi'); assert.equal(S.usulQ('qovurma lagmon').u, null, '«qovurma» — taom nomi, usul so\'zi emas');
const P = (q) => { const x = S.parseText(q, foods, {}).items[0]; return x ? { id: x.fam ? x.fam.id : x.fid, vr: x.vr, k: Math.round(S.portion(x.food, x.g).kcal), unit: x.unit } : null; };
const cases = [['tovuq kotlet aerogril', 'tovuq-kotlet', 'aerogril'], ['курица котлета в аэрогриле', 'tovuq-kotlet', 'aerogril'], ['kotlet air fryer', 'kotlet', 'aerogril'], ['Tovuq kotleti (aerogrilda)', 'tovuq-kotlet', 'aerogril'],
  ['2 ta tovuq kotlet duxovkada', 'tovuq-kotlet', 'duxovka'], ["tovuq ko'kragi bug'da 150 g", 'tovuq-kokrak', 'bug'], ['лосось запечённый', 'losos', 'duxovka'], ['kartoshka duxovkada', 'kartoshka', 'duxovka'], ['kartoshka aerogrilda', 'kartoshka', 'aerogril'],
  ['manti qaynatilgan', 'manti', 'goshtli.qaynatilgan'], ['shashlik duxovkada', 'shashlik', 'gosht.duxovka'], ['qovurilgan tuxum', 'tuxum', 'qovurilgan'], ['qovurilgan baqlajon', 'baqlajon-qaynatilgan', 'tova'], ['naggets aerogrilda', 'naggets', 'aerogril'], ['sirniki duxovkada', 'sirniki', 'duxovka']];
for (const [q, id, vr] of cases) { const r = P(q); assert.ok(r && r.id === id && r.vr === vr, q + ' → ' + JSON.stringify(r)); }
const fri = P('kartoshka fri'); assert.ok(fri.vr === 'fri' && fri.unit === 'porsiya' && fri.k > 300, 'kartoshka fri — porsiya: ' + JSON.stringify(fri));
assert.equal(P('qovurilgan sazan').id, 'sazan-qovurma', 'nomi aynan mos alohida taom saqlanadi'); assert.equal(P("qaynatma sho'rva").id, 'shurva', 'usulsiz oila — odatdagidek');
ok('Qidiruv/matn/ovoz/AI (parseText): ' + Object.values(Q).flat().length + ' usul so\'zi (uz/ru/en) aniqlanadi; ' + cases.length + ' ibora — to\'g\'ri taom va usul («tovuq kotlet aerogril», «Tovuq kotleti (aerogrilda)», «лосось запечённый» …); «kartoshka fri» — porsiya (120 g); aynan nomli alohida taom saqlanadi');
/* 5. ro'yxat yorlig'i */
assert.equal(S.famLabel(by['tovuq-kotlet'], 'aerogril', null, 'uz'), 'aerogril'); assert.equal(S.famLabel(by['tovuq-kotlet'], 'aerogril', null, 'ru'), 'в аэрогриле');
assert.equal(S.famLabel(by['tovuq-kokrak'], 'bug', null, 'uz'), "bug'da"); assert.equal(S.famLabel(by.manti, 'goshtli.tova', null, 'uz'), "go'sht, tovada");
ok('Ro\'yxat yorlig\'i: «Tovuq kotleti · aerogril» (ru «в аэрогриле»), «Tovuq ko\'kragi · bug\'da», «Manti · go\'sht, tovada»');
/* jadval (hisobot uchun) */
const T = (id) => { const f = by[id], a = S.usulAx(f); return a.o.map((o) => S.famLabel(f, o.i, null, 'uz') + ' ' + S.famVariant(f, S.famSelOf(f, o.i)).k).join(' · '); };
console.log('  tovuq kotleti (kkal/100 g):', T('tovuq-kotlet')); console.log('  tovuq ko\'kragi:', T('tovuq-kokrak')); console.log('  kartoshka:', T('kartoshka'));
console.log('usul: ' + n + ' guruh OK');
