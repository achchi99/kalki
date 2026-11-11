// KalkiFit bazasi: MANTIQIY tekshiruv (har deployda) — a–e qoidalari (tools/baza-mantiq.js) + qahva oilasi + qidiruv («кофе», «kofe», «qahva» → shakarsiz qora qahva birinchi).
//   node tools/dizayn/test-baza-mantiq.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), M = require(path.join(ROOT, 'tools/baza-mantiq.js'));
const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')); const DB = S.normFoods(J.foods); S.buildIndex(DB); const by = Object.fromEntries(DB.map((f) => [f.id, f]));
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. a–e: ro'yxatlar bo'sh (istisnolar sababi bilan) */
const r = M.tekshir(J.foods);
for (const k of ['a', 'b', 'c', 'd', 'e']) assert.equal(r[k].length, 0, k + ' qoidasi buzilgan:\n' + r[k].map((x) => JSON.stringify(x)).join('\n'));
for (const k of ['a', 'b', 'c', 'd', 'e']) for (const key of Object.keys(M.ISTISNO[k])) assert.ok(String(M.ISTISNO[k][key]).length > 10, k + ' istisno sababsiz: ' + key);
log('a–e: ziddiyat yo\'q (istisnolar: ' + ['a', 'b', 'c', 'd', 'e'].map((k) => k + '=' + (r['istisno_' + k] || []).length).join(', ') + ')');
/* 2. qoida o'zi ishlaydi: sun'iy ziddiyatlar topiladi */
let _c = 0; const mk = (o) => { _c++; return Object.assign({ i: 'x' + _c, n: 'N' + _c, r: 'R' + _c, k: 10, p: 0, f: 0, c: 2.5, t: 'i', u: [['stakan', 200], ['g100', 100]] }, o); };
const bad = M.tekshir([mk({ i: 'k1', n: 'Kofe', k: 30 }), mk({ i: 'k2', n: 'Kofe (shakar bilan)', r: 'Кофе с сахаром', k: 10 }), mk({ i: 'k3', n: 'Kakao', u: [['piyola', 200], ['g100', 100]] }), mk({ i: 'k4', n: 'Choy (shakarsiz)', r: 'Чай', k: 40 }), mk({ i: 'k5', n: 'Dub', r: 'Дуб', k: 400, p: 0, c: 0 }), mk({ i: 'k6', n: 'Dub', r: 'Дуб2' })]);
assert.equal(bad.a.length, 1, JSON.stringify(bad.a)); assert.equal(bad.b.length, 1, JSON.stringify(bad.b)); assert.ok(bad.c.length >= 1); assert.ok(bad.d.length >= 1); assert.equal(bad.e.length, 1); log('qoidalar sun\'iy ziddiyatni topadi (a–e)');
/* 3. qahva oilasi: har birlikda kkal mantiqli, qo'shimcha kamaytirmaydi */
const kk = (f, u) => { const x = f.u.find((q) => q[0] === u); return x ? Math.round(f.k * x[1] / 100 * 10) / 10 : null; };
const kofe = by.kofe; assert.ok(kofe && kofe.fam, 'kofe oilasi'); assert.ok(!kofe.u.some((x) => x[0] === 'piyola'), 'qahvada «piyola» yo\'q');
const vars = {}; for (const v of kofe.fam.ax[0].o) { vars[v.i] = S.famVariant(kofe, { turi: v.i }); assert.ok(!vars[v.i].u.some((x) => x[0] === 'piyola'), v.i + ': piyola yo\'q'); }
assert.ok(kk(vars.qora, 'chashka') <= 5, 'qora qahva 1 chashka ≤ 5 kkal: ' + kk(vars.qora, 'chashka'));
for (const v of Object.keys(vars)) for (const u of ['chashka', 'stakan']) { const a = kk(vars[v], u); if (a == null || v === 'qora') continue; assert.ok(a > kk(vars.qora, u), v + ' ' + u + ' qora qahvadan kam emas'); }
assert.ok(kk(by['qahva-shakar'], 'chashka') >= kk(by.kofe, 'chashka') + 30, 'qora + 2 ch.q shakar ≥ qora + 30 kkal');
assert.ok(kk(by['qahva-shakar'], 'chashka') > 35 && kk(by['qahva-shakar'], 'chashka') < 50, 'qora + 2 ch.q shakar ≈ 41 kkal: ' + kk(by['qahva-shakar'], 'chashka'));
assert.ok(kk(by['qahva-sutli-shakar'], 'chashka') > kk(by['qahva-sutli'], 'chashka') + 30, 'sutli + shakar > sutli');
assert.ok(kk(by['qahva-sutli'], 'chashka') > kk(by.kofe, 'chashka'), 'sutli > qora');
assert.ok(kk(by.amerikano, 'chashka') < 10 && kk(by.espresso, 'dona') < 5, 'amerikano/espresso kam kkal');
assert.ok(kk(vars['3in1'], 'chashka') > 60 && kk(vars['3in1'], 'chashka') < 90, '3 в 1 ≈ 74 kkal/chashka (1 paket)');
for (const id of ['kofe', 'qahva-sutli', 'qahva-shakar', 'qahva-sutli-shakar', 'raf', 'mokka', 'tr-qahva', 'tr-qahva-shakar', 'amerikano', 'kakao']) assert.ok(by[id] && by[id].u.some((x) => x[0] === 'chashka' || x[0] === 'stakan') && !by[id].u.some((x) => x[0] === 'piyola'), id + ': chashka/stakan, piyola emas');
log('qahva oilasi: birliklar va kkal mantiqli (qora ≈ 2, +2 ch.q shakar ≈ 41, 3 в 1 ≈ 74)');
/* 4. qidiruv: «кофе», «kofe», «kofe»/«qahva» → birinchi shakarsiz qora qahva; «3 в 1» alohida aniq nom */
for (const q of ['кофе', 'Кофе', 'kofe', 'Kofe', 'qahva', 'coffee']) { const h = S.search(DB, q, { limit: 5 }); assert.equal(h[0].id, 'kofe', q + ' → ' + h.map((x) => x.id).join(',')); const f = S.famVariant(h[0], S.famDefault(h[0])); assert.ok(kk(f, 'chashka') <= 5, q + ': kkal ' + kk(f, 'chashka')); }
for (const q of ['кофе с сахаром', 'кофе чёрный с сахаром', 'qahva shakar bilan']) { const h = S.search(DB, q, { limit: 3 }); assert.equal(h[0].id, 'qahva-shakar', q + ' → ' + h.map((x) => x.id).join(',')); }
const h31 = S.search(DB, 'кофе 3 в 1', { limit: 3 })[0]; assert.equal(h31.id, 'kofe'); assert.equal(S.famPick(h31, 'кофе 3 в 1').turi, '3in1');
log('qidiruv: «кофе/kofe/qahva» → qora shakarsiz; shakarli → alohida; «3 в 1» → 3in1');
/* 5. chashka birligi: yozuvdan tanib olinadi */
const p = S.parseText('2 chashka kofe', DB, {}); assert.ok(p.items.length === 1 && p.items[0].unit === 'chashka' && p.items[0].g === 400, JSON.stringify(p.items.map((x) => [x.food.id, x.unit, x.g])));
log('«2 chashka kofe» → 400 g');
console.log('\nbaza-mantiq: ' + n + ' tekshiruv o\'tdi');
