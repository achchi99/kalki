// KalkiFit: qurilmalarni YOZUV DARAJASIDA birlashtirish (assets/kalkifit-core.js: stamp / mergeStates) — hech bir yozuv yo'qolmaydi, o'chirilgani qayta tirilmaydi, bo'sh holat to'ldirilgan holatni bosmaydi.
//   node tools/dizayn/test-kalkifit-merge.mjs
import assert from 'node:assert/strict'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates;
let n = 0; const T = (name, fn) => { try { fn(); n++; } catch (e) { console.log('XATO ' + name + ': ' + (e && e.stack || e)); process.exit(1); } };
const d0 = '2026-10-20', d1 = '2026-10-21', d2 = '2026-10-22', d3 = '2026-10-23';
const base = () => { const st = S.emptyState(); st.setup = true; st.created = 1; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: 75 }; st.prefs = {}; return st; };
const add = (st, d, name, kcal, ts) => S.addFood(st, d, { fid: null, name, meal: 'l', unit: 'porsiya', qty: 1, g: 100, kcal, p: 1, f: 1, c: 1, ts });
const clone = (x) => JSON.parse(JSON.stringify(x)); const names = (st) => Object.keys(st.days).sort().flatMap((d) => st.days[d].food.map((e) => d.slice(8) + ':' + e.name)).sort();
const sync = (st) => S.migrate(JSON.parse(JSON.stringify(st)));            // bulutga chiqib, qaytib kelish (importState yo'li)
T('1 ikki qurilma: har biri o\'z kunlariga yozgan — birlashmada HAMMASI bor', () => {
  const a = base(); S.stamp(a, 1000); add(a, d0, 'A0', 100, 1001); S.stamp(a, 1001); const b = sync(a); S.stampReset();
  S.stamp(a, 2000); add(a, d1, 'A1', 200, 2001); add(a, d2, 'A2', 300, 2002); S.stamp(a, 2002);
  S.stampReset(); S.stamp(b, 3000); add(b, d3, 'B3', 400, 3001); add(b, d0, 'B0', 500, 3002); S.stamp(b, 3002);
  const m = S.mergeStates(a, b); assert.deepEqual(names(m), ['20:A0', '20:B0', '21:A1', '22:A2', '23:B3']); const m2 = S.mergeStates(b, a); assert.deepEqual(names(m2), names(m), 'tartibga bog\'liq emas');
  const ids = Object.values(m.days).flatMap((x) => x.food.map((e) => e.id)); assert.equal(new Set(ids).size, ids.length, 'id yagona'); assert.ok(m.seq > Math.max(...ids));
  const again = S.mergeStates(m, b); assert.deepEqual(names(again), names(m), 'qayta birlashtirish o\'zgartirmaydi (idempotent)'); });
T('2 o\'chirish qayta tirilmaydi; boshqa qurilmada o\'zgartirilgan yozuv saqlanadi', () => {
  const a = base(); S.stamp(a, 1000); const x = add(a, d0, 'X', 100, 1001), y = add(a, d0, 'Y', 200, 1002), z = add(a, d0, 'Z', 300, 1003); S.stamp(a, 1003); const b = sync(a); S.stampReset();
  S.stamp(a, 2000); S.removeFood(a, d0, x.id); S.stamp(a, 2001);                                     // A: X ni o'chirdi
  S.stampReset(); S.stamp(b, 3000); b.days[d0].food.find((e) => e.name === 'Y').kcal = 999; S.stamp(b, 3001);     // B: Y ni tahrirladi
  let m = S.mergeStates(a, b); assert.deepEqual(names(m), ['20:Y', '20:Z']); assert.equal(m.days[d0].food.find((e) => e.name === 'Y').kcal, 999, 'tahrir saqlandi');
  m = S.mergeStates(m, b); assert.deepEqual(names(m), ['20:Y', '20:Z'], 'o\'chirilgan X qayta tirilmadi (B hali X ni saqlaydi)');
});
T('3 o\'chirilgandan KEYIN boshqa qurilmada tahrirlangan yozuv (m > tomb) — saqlanadi', () => {
  const a = base(); S.stamp(a, 1000); const x = add(a, d0, 'X', 100, 1001); S.stamp(a, 1001); const b = sync(a); S.stampReset();
  S.stamp(a, 2000); S.removeFood(a, d0, x.id); S.stamp(a, 2001); S.stampReset(); S.stamp(b, 3000); b.days[d0].food[0].kcal = 555; S.stamp(b, 3001);
  const m = S.mergeStates(a, b); assert.deepEqual(names(m), ['20:X'], 'o\'chirishdan keyin tahrir — yozuv qoladi (yo\'qotmaslik ustuvor)'); });
T('4 bir xil ikki alohida yozuv (ikki stakan choy) — ikkalasi ham qoladi; eski (u siz) yozuvlar takrorlanmaydi', () => {
  const a = base(); add(a, d0, 'Choy', 38, 1); add(a, d0, 'Choy', 38, 1); const b = clone(a);          // u/m belgisiz eski holat
  const m = S.mergeStates(a, b); assert.equal(m.days[d0].food.length, 2, 'takrorlanmadi'); const c = base(); add(c, d0, 'Choy', 38, 1); add(c, d0, 'Choy', 38, 1); add(c, d0, 'Choy', 38, 1); assert.equal(S.mergeStates(a, c).days[d0].food.length, 3, 'uchinchisi qo\'shildi'); });
T('5 BO\'SH holat to\'ldirilgan holatni bosmaydi (ikkala tomonda ham)', () => {
  const full = base(); S.stamp(full, 1000); for (let i = 0; i < 6; i++) add(full, i % 2 ? d0 : d1, 'F' + i, 100 + i, 1001 + i); S.stamp(full, 1010); const empty = base(); empty.upd = 9999;          // bo'sh, lekin «yangiroq»
  for (const m of [S.mergeStates(empty, full), S.mergeStates(full, empty)]) { assert.equal(S.countState(m).food, 6); assert.equal(Object.keys(m.days).length, 2); } });
T('6 suv/qadam — kattasi; vazn — sana bo\'yicha birlashma, o\'chirilgan vazn tiklanmaydi; profil — yangisidan', () => {
  const a = base(); S.stamp(a, 1000); S.ensureDay(a, d0).water = 3; S.ensureDay(a, d0).steps = 1000; S.addWeight(a, d0, 80); S.addWeight(a, d1, 79); S.stamp(a, 1001); const b = sync(a); S.stampReset();
  S.stamp(b, 2000); b.days[d0].water = 5; b.days[d0].steps = 500; S.addWeight(b, d2, 78); b.profile.weight = 78; S.stamp(b, 2001); S.stampReset();
  S.stamp(a, 3000); S.removeWeight(a, d1); S.stamp(a, 3001); a.profile.goalWeight = 70; S.stamp(a, 3002);
  const m = S.mergeStates(a, b); assert.equal(m.days[d0].water, 5); assert.equal(m.days[d0].steps, 1000); assert.deepEqual(m.weights.map((w) => w.d), [d0, d2], 'd1 o\'chirilgan, d2 qo\'shilgan'); assert.equal(m.profile.goalWeight, 70, 'upd yangi tomon (A) profili'); });
T('7 o\'z taomlari: bir id — ikki xil taom bo\'lsa ikkalasi ham qoladi, yozuvlar to\'g\'ri bog\'lanadi', () => {
  const a = base(); S.stamp(a, 1000); const fa = S.addCustom ? null : null; a.customFoods = [{ id: 'c5', n: 'Osh A', k: 100, p: 1, f: 1, c: 1, u: [['g100', 100]], e: 1, t: 'x' }]; a.seq = 6; S.addFood(a, d0, { fid: 'c5', meal: 'l', unit: 'g100', qty: 1, g: 100, kcal: 100, ts: 1 }); S.stamp(a, 1001);
  const b = base(); S.stamp(b, 2000); b.customFoods = [{ id: 'c5', n: 'Sho\'rva B', k: 50, p: 1, f: 1, c: 1, u: [['g100', 100]], e: 1, t: 'x' }]; b.seq = 6; S.addFood(b, d1, { fid: 'c5', meal: 'l', unit: 'g100', qty: 1, g: 100, kcal: 50, ts: 2 }); S.stamp(b, 2001);
  const m = S.mergeStates(a, b); assert.equal(m.customFoods.length, 2); const byName = Object.fromEntries(m.customFoods.map((f) => [f.n, f.id])); assert.notEqual(byName['Osh A'], byName['Sho\'rva B']);
  assert.equal(m.days[d0].food[0].fid, byName['Osh A']); assert.equal(m.days[d1].food[0].fid, byName['Sho\'rva B'], 'yozuv o\'z taomiga bog\'langan'); });
T('8 stamp: yangi yozuv u/m oladi; o\'zgarsa m yangilanadi; o\'chirilsa tomb; undo (restoreFood) — tomb bekor; sessiyalar o\'rtasida yolg\'on tomb yo\'q', () => {
  const a = base(); S.stamp(a, 1000); const e = add(a, d0, 'E', 100, 5); S.stamp(a, 1100); assert.ok(e.u && e.m === 1100); e.kcal = 5; S.stamp(a, 1200); assert.equal(e.m, 1200);
  const rm = S.removeFood(a, d0, e.id); S.stamp(a, 1300); assert.equal(a.tomb[e.u], 1300); S.restoreFood(a, d0, rm); rm.item.m = 1400; S.stamp(a, 1400); assert.ok(!a.tomb[e.u], 'undo: tomb olib tashlandi');
  const c = sync(a); S.stampReset(); S.stamp(c, 2000); assert.deepEqual(Object.keys(c.tomb), [], 'yuklangan holatda yolg\'on tomb yo\'q'); });
T('9 eski versiya (u/m/tomb yo\'q) bulut nusxasi bilan birlashadi (import yo\'li)', () => {
  const old = base(); add(old, d0, 'Eski', 100, 7); const raw = JSON.parse(JSON.stringify(old)); delete raw.tomb; delete raw.upd; const r = S.migrate(raw); const l = base(); S.stamp(l, 10); add(l, d1, 'Yangi', 1, 8); S.stamp(l, 11);
  const m = S.mergeStates(l, r); assert.deepEqual(names(m), ['20:Eski', '21:Yangi']); });
console.log('OK ' + n + '/9 kalkifit-merge');
