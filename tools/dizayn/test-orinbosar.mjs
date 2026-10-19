// KalkiFit «O'rniga» (1-bosqich, ma'lumot): oqsil manbasi teglari, yangi mahalliy oqsilli taomlar (manba, ±15%), o'rinbosar jadvali va qoida, oqsil «sifati».   node tools/dizayn/test-orinbosar.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const O = require(path.join(ROOT, 'assets/orinbosar-core.js')), TG = require(path.join(ROOT, 'tools/oqsil-teglar.js')), GEN = require(path.join(ROOT, 'tools/orinbosar-yasa.js'));
const rd = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const J = rd('data/ovqatlar.json'), T = rd('data/oqsil-manba.json'), TB = rd('data/orinbosar.json'), USDA = rd('data/manba/usda-sr-legacy.json'), foods = J.foods, by = O.index(foods);
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. teglar: hammasida bor, yangilangan, retseptdan avtomatik */
assert.deepEqual(T.teglar, ['qizil', 'tovuq', 'baliq', 'tuxum', 'sut', 'dukkak', 'aralash', 'yoq']);
for (const f of foods) { assert.ok(T.taom[f.i], f.i + ': teg yo\'q'); assert.ok(T.teglar.includes(T.taom[f.i]), f.i + ': noto\'g\'ri teg'); if (f.fam) for (const v of Object.keys(f.fam.g)) assert.ok(T.taom[f.i + '#' + v], f.i + '#' + v + ': teg yo\'q'); }
assert.deepEqual(TG.hammasi().out, T.taom, 'data/oqsil-manba.json eskirgan: node tools/oqsil-teglar.js --yoz');
const tg = (k) => T.taom[k];
assert.equal(tg('osh'), 'qizil'); assert.equal(tg('osh-tovuq'), 'tovuq'); assert.equal(tg('sazan-grill'), 'baliq'); assert.equal(tg('moshkichiri'), 'dukkak'); assert.equal(tg('moshxorda-gostsiz'), 'dukkak'); assert.equal(tg('somsa#oddiy.tovuq'), 'tovuq'); assert.equal(tg('somsa#oddiy.qovoq'), 'yoq');
assert.equal(tg('shashlik#tovuq'), 'tovuq'); assert.equal(tg('lagmon#shorvali.tovuq'), 'tovuq'); assert.equal(tg('lagmon#shorvali.mol'), 'qizil'); assert.equal(tg('qoymoq'), 'tuxum'); assert.equal(tg('qatiq-salat'), 'sut'); assert.equal(tg('kolbasa'), 'aralash'); assert.equal(tg('non'), 'yoq'); assert.equal(tg('shurva'), 'qizil');
const cnt = (arr) => Object.fromEntries(T.teglar.map((t) => [t, arr.filter((k) => T.taom[k] === t).length])), vis = foods.filter((f) => !f.h).map((f) => f.i);
const c = cnt(vis); assert.ok(c.baliq >= 11 && c.tovuq >= 14 && c.qizil >= 30 && c.dukkak >= 13, JSON.stringify(c));
log('oqsil manbasi: ' + foods.length + ' taom + oila kombinatsiyalari (' + Object.keys(T.taom).length + ' kalit) teglangan, retseptdan avtomatik (yangilangan); ko\'rinadigan ' + vis.length + ': ' + JSON.stringify(c));
/* 2. yangi mahalliy oqsilli taomlar: manba (retsept, fdc_id), ±15% (Atwater), 3 til, birliklar */
const YANGI = ['sazan-grill', 'sazan-qovurma', 'baliq-dimlama', 'baliq-shurva', 'tovuq-son-qozon', 'tovuq-kokrak-qozon', 'osh-tovuq', 'dimlama-tovuq', 'loviya-shurva', 'yasmiq-shurva', 'noxat-ragu', 'moshxorda-gostsiz', 'qoymoq', 'omlet-sabzavot', 'qatiq-salat', 'suzma-salat'];
assert.equal(foods.length, 288);
for (const id of YANGI) {
  const f = by[id]; assert.ok(f, id + ': bazada yo\'q'); assert.ok(f.rc && f.x === 1 && f.e === 1, id + ': retsept + «taxminiy»');
  assert.ok(f.ms && /fdc_id \d{6}/.test(f.ms.u) && /fdc_id \d{6}/.test(f.ms.r), id + ': manba bayoni (fdc_id) UZ/RU');
  for (const m of f.ms.u.match(/\d{6}/g)) assert.ok(USDA.foods[m], id + ': USDA ' + m + ' yuklanmagan');
  assert.ok(f.n && f.r && f.a.length >= 2, id + ': nom UZ/RU + sinonim'); assert.ok(f.u.length >= 2 && f.u.some((u) => u[0] === 'g100'), id + ': porsiya birligi');
  const at = 4 * f.p + 9 * f.f + 4 * f.c; assert.ok(Math.abs(at - f.k) <= f.k * 0.15, id + ': kkal ' + f.k + ' ≠ makrodan ' + Math.round(at) + ' (±15%)');
}
const R = (id) => { const f = by[id]; const g = f.u.find((u) => u[0] !== 'g100')[1]; return { id, g, k: Math.round(f.k * g / 100), p: Math.round(f.p * g) / 100, f: Math.round(f.f * g) / 100 }; };
for (const id of ['osh-tovuq', 'sazan-grill', 'loviya-shurva']) assert.ok(R(id).g > 0);
assert.ok(by['sazan-grill'].p >= 15 && by['sazan-grill'].f <= 12 && by['osh-tovuq'].p > by.osh.p, 'sazan/tovuqli osh oqsili');
log('yangi ' + YANGI.length + ' ta taom: hammasida retsept + USDA fdc_id manba (UZ/RU), «taxminiy», ±15% Atwater, birliklar; baza 288 ta');
/* 3. o'rinbosar jadvali */
assert.deepEqual(TB.manba, GEN.yasa().out, 'data/orinbosar.json eskirgan: node tools/orinbosar-yasa.js --yoz');
const srcs = Object.keys(TB.manba); const ISTISNO = new Set(['steyk', 'bekon']);
assert.deepEqual(Object.keys(GEN.MANBA).filter((s) => !TB.manba[s]).sort(), [...ISTISNO].sort(), 'nomzodsiz taomlar (qoidaga javob beradigani yo\'q)');
const variants = (id) => (by[id].fam ? Object.keys(by[id].fam.g).map((v) => id + '#' + v) : [id]);
let jami = 0, kam2 = [];
for (const s of srcs) {
  assert.ok(by[s] && !by[s].h, s + ': manba ko\'rinadigan taom bo\'lishi kerak'); assert.ok(['qizil'].includes(tg(s)) || by[s].f >= 14, s + ': qizil go\'sht yoki yog\' >= 14');
  assert.ok(TB.manba[s].length >= 1 && TB.manba[s].length <= 4, s + ': nomzod soni');
  for (const a of TB.manba[s]) { assert.ok(by[a.i], s + ': nomzod yo\'q ' + a.i); for (const sk of variants(s)) { const k = O.altKey(by, sk, a); if (k) assert.notEqual(O.tegOf(T, k), 'qizil', sk + ': qizil go\'sht o\'rinbosar bo\'la olmaydi ' + k); } }
  /* har bir kombinatsiya uchun: ko'rinadiganlarning hammasi qoidaga javob beradi (mustaqil qayta hisob) */
  for (const sk of variants(s)) {
    const sp = O.defPortion(by, sk), sv = O.valuesOf(by, sk), alts = O.alternatives(by, TB, sk); assert.ok(alts.length <= 3);
    const order = TB.manba[s].map((a) => O.altKey(by, sk, a)).filter(Boolean); let last = -1;
    for (const a of alts) {
      const av = O.valuesOf(by, a.key), ap = O.altPortion(by, a.key, sp), m = ap.g / 100, S = { p: sv.p * sp.g / 100, f: sv.f * sp.g / 100, k: sv.k * sp.g / 100 }, A = { p: av.p * m, f: av.f * m, k: av.k * m };
      assert.ok(A.p >= S.p - 1e-6 && (A.f < S.f - 1e-6 || A.k < S.k - 1e-6), sk + ' → ' + a.key + ': qoida buzilgan'); assert.ok(Math.abs(a.dp - (A.p - S.p)) <= 0.051 && Math.abs(a.df - (A.f - S.f)) <= 0.051 && Math.abs(a.dk - (A.k - S.k)) <= 0.51, sk + ' → ' + a.key + ': farq');
      const ix = order.indexOf(a.key); assert.ok(ix > last, sk + ': tartib (oila birinchi) buzilgan'); last = ix;
    }
    /* ko'rsatilmaganlari — rostdan qoidaga javob bermaydi (yashirin to'g'ri) */
    for (const k of order) if (!alts.some((a) => a.key === k) && alts.length < 3) { const cm = O.compare(by, sk, k); assert.ok(!cm.ok, sk + ' → ' + k + ': qoidaga javob beradi, lekin ko\'rsatilmadi'); }
  }
  const dv = O.alternatives(by, TB, s); jami += dv.length; if (dv.length < 2) kam2.push(s + ':' + dv.length);
  if (!ISTISNO.has(s)) assert.ok(dv.length >= 1, s + ': standart kombinatsiyada o\'rinbosar yo\'q');
}
assert.ok(srcs.length >= 40, 'manba taomlar soni');
log(srcs.length + ' manba taom (qizil go\'sht + yog\'i ≥ 14 g): har bir kombinatsiyada ko\'rsatilganlar qoidaga javob beradi (oqsil ≥ asl VA yog\' yoki kkal kam), farqlar to\'g\'ri, tartib — oila birinchi; standart kombinatsiyada o\'rtacha ' + (jami / srcs.length).toFixed(1) + ' ta; <2: ' + kam2.join(', '));
/* 4. qoida chegaralari */
const P = (k, p, f) => ({ k, p, f });
assert.equal(O.passes(P(200, 10, 10), P(200, 10, 9)), true, 'oqsil teng, yog\' kam');
assert.equal(O.passes(P(200, 10, 10), P(150, 10, 10)), true, 'oqsil teng, yog\' teng, kkal kam');
assert.equal(O.passes(P(200, 10, 10), P(150, 9.9, 5)), false, 'oqsil kam — ko\'rsatilmaydi');
assert.equal(O.passes(P(200, 10, 10), P(250, 20, 12)), false, 'oqsil ko\'p, lekin yog\' ham kkal ham ko\'p');
assert.equal(O.passes(P(200, 10, 10), P(200, 12, 10)), false, 'yog\' ham, kkal ham teng');
assert.equal(O.passes(P(200, 10, 10), P(250, 14, 8)), true, 'yog\' kam (kkal ko\'p bo\'lsa ham)');
const osh = O.alternatives(by, TB, 'osh#kop.kop').map((a) => a.key), osh2 = O.alternatives(by, TB, 'osh').map((a) => a.key);
assert.ok(osh2[0] === 'osh-tovuq' && !osh.includes('osh-tovuq'), 'osh-tovuq: o\'rta go\'shtli oshga ha, eng ko\'p go\'shtlisiga (oqsil 6,4 > 5,7) yo\'q');
log('qoida chegaralari: oqsil teng/kam, yog\' va kkal teng/ko\'p; osh-tovuq o\'rta oshga ko\'rsatiladi, «go\'sht ko\'p» oshga ko\'rsatilmaydi (oqsil kam)');
/* 5. bir xil porsiya */
const sp = O.defPortion(by, 'osh'); assert.deepEqual([sp.u, sp.g], ['likop', 350]); const ot = O.alternatives(by, TB, 'osh')[0]; assert.deepEqual([ot.id, ot.g], ['osh-tovuq', 350]);
const ks = O.alternatives(by, TB, 'shashlik')[0]; assert.equal(ks.key, 'shashlik#tovuq'); assert.equal(ks.g, 80, 'dona — bir xil gramm');
const lg = O.alternatives(by, TB, 'lagmon#qovurma.qoy'); assert.ok(lg.length && lg[0].key === 'lagmon#qovurma.tovuq', 'oila o\'qi saqlanadi (qovurma qoladi, go\'sht tovuq)');
log('bir xil porsiya: 1 likop osh → 1 likop tovuqli osh (350 g); dona → bir xil gramm; oila o\'qi (qovurma) saqlanadi');
/* 6. oqsil «sifati» = 100 kkal ga gramm oqsil */
const q = (id) => O.sifat(O.valuesOf(by, id)); assert.equal(q('tovuq-kokrak'), 19.7); assert.ok(q('tovuq-kokrak') > q('osh') * 3 && q('sazan-grill') > q('osh-tovuq') && q('osh-tovuq') > q('osh')); assert.equal(q('suv'), 0); assert.equal(q('sariyog'), 0.1);
log('oqsil sifati (g oqsil / 100 kkal): tovuq ko\'krak ' + q('tovuq-kokrak') + ' · sazan grill ' + q('sazan-grill') + ' · tovuqli osh ' + q('osh-tovuq') + ' · osh ' + q('osh') + ' · suv 0');
console.log('\nHAMMASI OK (' + n + ' blok)');
