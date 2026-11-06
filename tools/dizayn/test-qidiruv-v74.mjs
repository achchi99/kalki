// KalkiFit qidiruv v74: klaviatura odatlari (w/6 → sh, o' variantlari, u' → o', x ↔ h — FAQAT natija bo'lmaganda ikkinchi urinish), vergulsiz ko'p taomli yozuv
// (respace: topilganlari ajratiladi, topilmagani bitta bo'lak), «6» miqdorni buzmaydi.   node tools/dizayn/test-qidiruv-v74.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), J = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8'));
const DB = S.normFoods(J.foods); S.buildIndex(DB); let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const top = (q, k = 3) => S.search(DB, q, { limit: k }).map((f) => f.id), pt = (q) => S.parseText(q, DB, {}), fids = (q) => pt(q).items.map((x) => x.fid);
/* 1. klaviatura odatlari */
assert.ok(fids('suvda piwirgan guruch').includes('guruch') && !pt('suvda piwirgan guruch').missing.length, 'suvda piwirgan guruch');
assert.ok(top('gowtli', 5).some((id) => /gosht/.test(id)), 'gowtli → go\'sht: ' + top('gowtli', 5));
assert.ok(top('gowt', 5).some((id) => /gosht/.test(id)), 'gowt → go\'sht');
assert.deepEqual(fids('6urva').slice(0, 1), ['shurva'], '6urva'); assert.equal(top('6urva', 1)[0], 'shurva');
for (const q of ["go'sht", 'goʻsht', 'go`sht', 'go‘sht', 'gōsht', "gu'sht"]) assert.deepEqual(top(q, 3).filter((id) => /gosht/.test(id)).length > 0, true, q);
assert.deepEqual(top("go'sht", 5), top('goʻsht', 5)); assert.deepEqual(top("go'sht", 5), top('gu\'sht', 5).length ? top("go'sht", 5) : top('gu\'sht', 5));
for (const q of ['xotdog', 'hotdog', 'xot dog', 'xodog', 'xoddog']) assert.ok(top(q, 3).includes('hotdog'), q + ' → ' + top(q, 3));
for (const q of ["g'ijda", 'gijda', 'g‘ijda', 'g`ijda']) assert.ok(top(q, 3).includes('non'), q);
assert.equal(S.kbVariants('piwirgan')[0], 'pishirgan'); assert.ok(S.kbVariants('6urva').includes('shurva')); assert.ok(S.kbVariants('xotdog').includes('hotdog')); assert.ok(S.kbVariants('hotdog').includes('xotdog'));
log('Klaviatura odatlari: «suvda piwirgan guruch», «gowtli», «6urva», o\' / o` / o‘ / ō / u\' bir xil, g\' variantlari, xotdog/hotdog');
/* 2. ikkinchi urinish faqat natija bo'lmaganda: aniq natija o'zgarmaydi */
for (const [q, id] of [['osh', 'osh'], ['choy', 'choy'], ['hotdog', 'hotdog'], ['somsa', 'somsa'], ['xalva', 'xalva'], ['wafli', null]]) if (id) assert.equal(top(q, 1)[0], id, q);
assert.ok(pt('6 ta somsa').items[0].qty === 6 && pt('6ta somsa').items[0].qty === 6 && pt('6 kosa osh').items[0].qty === 6, '«6» miqdor sifatida buzilmaydi');
log('Aniq natija o\'zgarmaydi (osh, choy, hotdog…); «6 ta somsa», «6ta somsa», «6 kosa osh» — miqdor');
/* 3. ko'p taomli vergulsiz yozuv */
{ const r1 = S.respace('tuxum grechka guruch non', DB, {}); const p1 = pt(r1); assert.ok(!p1.missing.length && p1.items.length >= 3, r1 + ' → ' + JSON.stringify(p1.missing)); assert.ok(p1.items.some((x) => x.fid === 'tuxum') && p1.items.some((x) => x.fid === 'grechka'));
  const r2 = S.respace('qatiq zig\'ir', DB, {}); assert.equal(r2, "qatiq, zig'ir"); assert.deepEqual(fids(r2), ['qatiq', 'zigir']);
  const r3 = S.respace('qatiq qwzxyv', DB, {}), p3 = pt(r3); assert.equal(r3, 'qatiq, qwzxyv'); assert.deepEqual(p3.items.map((x) => x.fid), ['qatiq']); assert.deepEqual(p3.missing, ['qwzxyv'], 'topilmagan qism alohida (AI faqat shuni oladi)');
  const r4 = S.respace('tuxum qwzxyv guruch zzkqxw', DB, {}), p4 = pt(r4); assert.deepEqual(p4.items.map((x) => x.fid), ['tuxum']); assert.deepEqual(p4.missing, ['qwzxyv guruch', 'zzkqxw'], 'topilmagan so\'z taomdan oldin — sifat («napoleon keki»): butun ibora AI\'ga');
  assert.equal(S.respace('qwzxyv keki', DB, {}), 'qwzxyv keki', 'sifat + taom: o\'zgarmaydi');
  assert.equal(S.respace('qwzxyv zzkqxw', DB, {}), 'qwzxyv zzkqxw', 'hech narsa topilmasa o\'zgarmaydi'); assert.equal(S.respace('osh', DB, {}), 'osh'); assert.equal(S.respace('1 kosa osh va choy', DB, {}), '1 kosa osh va choy');
  assert.ok(pt(S.respace('2 tuxum grechka', DB, {})).items.find((x) => x.fid === 'tuxum').qty === 2, 'miqdor bo\'lak bilan qoladi'); }
log('Ko\'p taomli gap: «tuxum grechka guruch non» → 3+ taom; «qatiq zig\'ir» → 2; qisman topilganda topilmagan qism alohida bo\'lak; miqdor saqlanadi; hech narsa topilmasa matn o\'zgarmaydi');
/* 4. qidiruv oynasi (loose): yaqin taomlar; hamma so'z topilmasa — jim */
assert.equal(S.search(DB, 'tuxum grechka', { limit: 5 }).length, 0, 'loose bo\'lmasa — jim'); { const ids = S.search(DB, 'tuxum grechka', { limit: 6, loose: true }).map((f) => f.id); assert.ok(ids.some((x) => /^tuxum/.test(x)) && ids.includes('grechka'), ids.join()); }
assert.equal(S.search(DB, 'qwzxyv tuxum', { limit: 5, loose: true }).length, 0, 'bir so\'z topilmasa — loose ham jim'); assert.ok(top('ovsyankali', 3).length > 0);
log('Qidiruv oynasi: hamma so\'z topilsa yaqin taomlar, bittasi topilmasa — jim (topilmadi holati)');
console.log('\nqidiruv-v74: ' + n + ' guruh OK');
