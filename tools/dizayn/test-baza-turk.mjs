// Turk taomlari (tools/ovqatlar-turk.js, v21): ≥25 taom, manba (USDA / aralashma → «taxminiy»), Atwater ±15%, 3 til + sinonimlar, qidiruv, Yeymiz «Kafe va choyxonada», teglar.   node tools/dizayn/test-baza-turk.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), TR = require(path.join(ROOT, 'tools/ovqatlar-turk.js'));
const A = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods, by = Object.fromEntries(A.map((f) => [f.i, f]));
const USDA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/manba/usda-sr-legacy.json'), 'utf8')).foods;
const YM = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/yeymiz.json'), 'utf8')), CH = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cheklov-teglar.json'), 'utf8'));
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const T = TR.map((r) => by[r[0]]); assert.ok(T.every(Boolean), 'barcha turk qatorlari bazada'); assert.ok(T.length >= 25, 'kamida 25 turk taomi: ' + T.length);
assert.ok(T.every((f) => f.i.startsWith('tr-')));
log('Turk taomlari: ' + T.length);
for (const r of TR) {
  const f = by[r[0]], src = r[6]; assert.ok(f.ms && f.ms.u && f.ms.r, f.i + ': manba bayoni');
  if (src.startsWith('u:')) { const U = USDA[src.slice(2)]; assert.ok(U); assert.equal(f.k, Math.round(U.kcal)); } else { assert.ok(src.startsWith('m:')); assert.equal(f.e, 1, f.i + ': aralashma — taxminiy'); assert.match(f.ms.u, /taxminiy/); assert.match(f.m, /^Hisob: /); }
  const atw = 4 * f.p + 9 * f.f + 4 * f.c; assert.ok(Math.abs(atw - f.k) <= Math.max(15, f.k * 0.15), f.i + ': Atwater ' + f.k + ' vs ' + Math.round(atw));
  assert.ok(f.n && f.r && !/[ўқғҳ]/i.test(f.r) && f.a.length >= 3 && f.u.length >= 2, f.i + ': nomlar/sinonim/porsiya');
  assert.doesNotMatch(JSON.stringify([f.n, f.r, f.a, f.ms]), /halol|ҳалол|халол|cho'chqa|свин|pork/i);
}
log('Har taomda manba; aralashma — «taxminiy» (e=1); Atwater ±15%; 3 til + sinonim; «halol»/cho\'chqa matni yo\'q');
const DB = S.normFoods(A); S.buildIndex(DB); const q = (s) => S.search(DB, s, {}).map((f) => f.id);
const must = { 'донер': 'tr-doner-mol-lavash', 'шаурма донер': 'tr-doner-tovuq-lavash', 'лахмаджун': 'tr-lahmajun', 'искендер': 'tr-iskender', 'кебаб': 'tr-adana-kabob', 'baklava': 'tr-baklava', 'doner': 'tr-doner-tovuq-lavash', 'lahmajun': 'tr-lahmajun', 'iskender': 'tr-iskender', 'пахлава': 'tr-baklava', 'кюнефе': 'tr-kunefe', 'пиде': 'tr-pide-goshtli', 'гёзлеме': 'tr-gozleme', 'менемен': 'tr-menemen', 'лукум': 'tr-lokum', 'сютлач': 'tr-sutlac' };
for (const [k, id] of Object.entries(must)) assert.ok(q(k).slice(0, 12).includes(id), 'qidiruv «' + k + '» → ' + id + ' (topilgan: ' + q(k).slice(0, 6) + ')');
log('Qidiruv: донер, лахмаджун, искендер, baklava, кебаб, пиде, ... topiladi');
const ck = (id) => Object.entries(CH.taom || CH).filter(([k]) => k === id);
for (const id of ['tr-doner-mol-lavash', 'tr-iskender', 'tr-lahmajun', 'tr-pide-goshtli']) { const y = YM.taom[id]; assert.ok(y && /K/.test(y.s) && ['kabob', 'tez'].includes(y.t), id + ': Yeymiz «Kafe va choyxonada»'); }
assert.ok(['tr-doner-mol-lavash', 'tr-adana-kabob', 'tr-iskender'].every((id) => YM.taom[id]));
log('Yeymiz → Kafe va choyxonada: doner, iskender, lahmajun, pide (Kabob / Tez tayyor)');
const app = fs.readFileSync(path.join(ROOT, 'assets/kalkifit-app.js'), 'utf8'); assert.match(app, /cat_turk: 'Turk taomlari'/); assert.match(app, /cat_turk: 'Турецкая кухня'/); assert.match(app, /c === 'turk'\) return \/\^tr-\//);
log('«Turk taomlari» kategoriyasi (UZ/RU)');
const pork = JSON.stringify(CH).match(/"choshqa"/); const pk = Object.entries(CH.taom || {}).filter(([id, v]) => /choshqa/.test(JSON.stringify(v)) && id.startsWith('tr-')); assert.equal(pk.length, 0, 'turk taomlarida cho\'chqa tegi yo\'q');
log('Cho\'chqa tegi turk taomlariga qo\'yilmagan');
console.log('\n' + n + '/' + n + ' OK');
