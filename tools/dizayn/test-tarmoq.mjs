// KalkiFit v67: fast-food TARMOQLARI menyusi (Evos, Max Way, Oqtepa, Feed Up, KFC, Bellissimo, Les Ailes, Chopar) va muzqaymoq TURLARI — baza darajasida.
// Har tarmoq taomida «taxminiy — tarmoq rasmiy qiymat e'lon qilmagan» belgisi (e=1, tm, Manba matni), og'irlik/tarkib manbasi izohi, USDA komponentlari, 4/9/4;
// qidiruv: «evos/эвос/max way/maxway/oqtepa» → shu tarmoq menyusi, «evos lavash» → aniq taom birinchi; cho'chqa tegi o'zgarmagan.   node tools/dizayn/test-tarmoq.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')); const DB = S.normFoods(J.foods); S.buildIndex(DB);
const by = Object.fromEntries(DB.map((f) => [f.id, f])); let n = 0; const T = (name, fn) => { try { fn(); n++; console.log('OK  ', n + '.', name); } catch (e) { console.log('XATO ' + name + ': ' + e.message); process.exit(1); } };
const ids = (q, l = 40) => S.search(DB, q, { limit: l }).map((f) => f.id);
const TM = DB.filter((f) => f.tm), MIN = { evos: 12, maxway: 12, oqtepa: 10, feedup: 10, kfc: 8, bellissimo: 5, lesailes: 4, chopar: 3 }, NOM = { evos: 'Evos', maxway: 'Max Way', oqtepa: 'Oqtepa Lavash', feedup: 'Feed Up', kfc: 'KFC', bellissimo: 'Bellissimo', lesailes: 'Les Ailes', chopar: 'Chopar Pizza' };
T('har tarmoqda 10–20 tagacha asosiy taom (lavash/shaurma o\'lchamlari, burger, hot-dog, fri, naggets, pitsa…); nom «Tarmoq — taom»', () => {
  for (const [k, m] of Object.entries(MIN)) { const l = TM.filter((f) => f.tm === k); assert.ok(l.length >= m && l.length <= 20, k + ': ' + l.length); for (const f of l) { assert.ok(f.n.startsWith(NOM[k] + ' — '), f.n); assert.ok(f.r.startsWith(NOM[k] + ' — '), f.r); assert.match(f.id, new RegExp('^tm-' + k + '-[a-z]+-')); } }
  for (const k of ['evos', 'maxway', 'oqtepa', 'feedup']) { const t = TM.filter((f) => f.tm === k).map((f) => f.id.split('-')[2]); for (const x of ['lavash', 'burger', 'hotdog']) assert.ok(t.includes(x), k + ' ' + x); }
  assert.ok(TM.filter((f) => f.tm === 'evos' && /-lavash-/.test(f.id)).length >= 4, 'Evos lavash o\'lchamlari');
});
T('«taxminiy» belgisi: e=1, Manba matni «Taxminiy — tarmoq rasmiy qiymat e\'lon qilmagan» + og\'irlik/tarkib qayerdan; qiymat USDA komponentlaridan; 4/9/4 ±15%; porsiya birligi bor', () => {
  for (const f of TM) {
    assert.equal(f.e, 1, f.id); assert.match(f.ms.u, /^Taxminiy — tarmoq rasmiy qiymat e'lon qilmagan\. /, f.id); assert.match(f.ms.r, /^Примерно — сеть не публикует официальные значения\. /, f.id);
    assert.match(f.ms.u, /(menyu|sharh|kombo)/i, f.id + ': og\'irlik manbasi'); assert.match(f.ms.u, /USDA/, f.id);
    const atw = 4 * f.p + 9 * f.f + 4 * f.c; assert.ok(Math.abs(atw - f.k) <= Math.max(12, f.k * 0.15), f.id + ' ' + f.k + ' vs ' + atw);
    assert.ok(f.k >= 150 && f.k <= 360, f.id + ' kkal/100 g ' + f.k); assert.ok(f.u.some((u) => ['dona', 'porsiya'].includes(u[0]) && u[1] >= 15), f.id);
  }
  assert.equal(by['tm-feedup-lavash-mol'].u[0][1], 351, 'Feed Up — rasmiy og\'irlik'); assert.match(by['tm-feedup-lavash-mol'].ms.u, /feedup\.uz/); assert.match(by['tm-kfc-naggets-bayts'].ms.u, /60–67 g/);
  assert.ok(!TM.some((f) => /halol|ҳалол/i.test(f.n + f.r + f.ms.u + f.ms.r)));
  const one = (id) => Math.round(by[id].k * by[id].u[0][1] / 100); assert.ok(one('tm-evos-lavash-mol-m') >= 600 && one('tm-evos-lavash-mol-m') <= 900, 'Evos lavash M ≈ ' + one('tm-evos-lavash-mol-m'));
});
T('qidiruv: evos/эвос/max way/maxway/oqtepa/октепа → faqat shu tarmoq menyusi (asosiysi — lavash — tepada); «evos lavash» → Evos lavash M birinchi', () => {
  for (const [q, k] of [['evos', 'evos'], ['эвос', 'evos'], ['max way', 'maxway'], ['maxway', 'maxway'], ['макс вей', 'maxway'], ['oqtepa', 'oqtepa'], ['октепа', 'oqtepa'], ['kfc', 'kfc'], ['feed up', 'feedup'], ['bellissimo', 'bellissimo']]) {
    const r = ids(q), mine = r.filter((i) => i.startsWith('tm-' + k + '-')); assert.ok(mine.length === TM.filter((f) => f.tm === k).length, q + ': ' + mine.length); assert.ok(r[0].startsWith('tm-' + k + '-'), q + ': ' + r.slice(0, 5)); assert.ok(r.slice(0, MIN[k] + 1).filter((i) => i.startsWith('tm-' + k + '-')).length >= MIN[k], q + ': ' + r.slice(0, MIN[k] + 1));
  }
  assert.match(ids('evos')[0], /^tm-evos-lavash-/); assert.equal(ids('evos lavash')[0], 'tm-evos-lavash-mol-m'); assert.equal(ids('эвос лаваш')[0], 'tm-evos-lavash-mol-m');
  assert.match(ids('maxway lavash')[0], /^tm-maxway-lavash-/); assert.match(ids('kfc tvister')[0], /^tm-kfc-tvister/); assert.match(ids('oqtepa lavash')[0], /^tm-oqtepa-lavash-/);
  assert.equal(ids('lavash')[1], 'lavash-tovuq', 'umumiy «lavash» qidiruvi o\'zgarmadi'); assert.equal(ids('shaurma')[0], 'lavash-tovuq');
});
T('muzqaymoq turlari ko\'rinadi va topiladi: mevali muz, sorbet, sutli, qaymoqli, plombir, eskimo, stakancha, rojok, sendvich, vafli — har biri manbali va odatiy porsiya bilan', () => {
  const W = { 'mevali muz': 'mz-muzli', 'mevali muzqaymoq': 'mz-meva-bar', sorbet: 'mz-sorbet', 'sutli muzqaymoq': 'mz-light', 'qaymoqli muzqaymoq': 'mz-vanil', plombir: 'mz-plombir-briket', eskimo: 'mz-eskimo-glazur', stakancha: 'mz-stakancha', rojok: 'mz-rojok', 'muzqaymoq sendvich': 'mz-sendvich', 'vafli muzqaymoq': 'mz-vafli-briket', 'фруктовый лёд': 'mz-muzli', 'эскимо': 'mz-eskimo-glazur', 'рожок': 'mz-rojok' };
  for (const [q, id] of Object.entries(W)) { assert.equal(ids(q)[0], id, q + ': ' + ids(q).slice(0, 3)); const f = by[id]; assert.ok(!f.h, id + ' yashirin'); assert.match(f.m, /USDA|Hisob/, id); assert.ok(f.u[0][1] >= 50 && f.u[0][1] <= 110, id + ' porsiya ' + f.u[0][1]); }
  assert.ok(by['mz-muzli'].k < 100 && by['mz-meva-bar'].k < 100, 'kam kaloriyali mevali turlar'); assert.ok(ids('muzqaymoq').length >= 12);
});
/* cho'chqa tegi to'plami va teglar — test-yemaydi (to'plam = {bekon, pepperoni}) majburlaydi */
console.log('\nHammasi o\'tdi: ' + n + ' ta tekshiruv');
