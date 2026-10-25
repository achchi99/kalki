/* KalkiFit qidiruv: miqdor, bir nechta taom va yozilish farqlari (AI'siz). 13 ta haqiqiy «topilmadi» so'rovi: har biri to'g'ri taomni topadi,
 * miqdor to'g'ri o'qiladi (boshida/oxirida: 100 г, 200gr, yarimta), ko'p taomli so'rov to'g'ri bo'linadi. Admin yig'ishi: miqdorsiz (functions/_lib/soz-norm.js).
 *   node tools/test-qidiruv-miqdor.js */
'use strict';
const assert = require('assert'), path = require('path');
const S = require(path.join(__dirname, '..', 'assets', 'kalkifit-core.js'));
const DB = S.normFoods(require(path.join(__dirname, '..', 'data', 'ovqatlar.json')).foods); S.buildIndex(DB);
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
// [so'rov, qidiriladigan nom, miqdor, birlik, natija id (birinchi 3 talikda), parseText: [[id, gramm]...]]
const ONE = [
  ['рис вареный 100 г', 'рис вареный', 100, 'g100', 'guruch', [['guruch', 100]]],
  ['рис вареный 90 г', 'рис вареный', 90, 'g100', 'guruch', [['guruch', 90]]],
  ['яйца жареные без масла 200 г', 'яйца жареные без масла', 200, 'g100', 'tuxum-qov-yogsiz', [['tuxum-qov-yogsiz', 200]]],
  ['отруби 30 г', 'отруби', 30, 'g100', 'kepak', [['kepak', 30]]],
  ['молоко пастеризованное 200 г', 'молоко пастеризованное', 200, 'g100', 'sut', [['sut', 200]]],
  ['котлета по киевски с сыром 110 г', 'котлета по киевски с сыром', 110, 'g100', 'kotleta-kiyev', [['kotleta-kiyev', 110]]],
  ['какао порошок 6 г', 'какао порошок', 6, 'g100', 'kakao-kukun', [['kakao-kukun', 6]]],
  ['булочка с шоколадной начинкой 150 г', 'булочка с шоколадной начинкой', 150, 'g100', 'bulochka-shokolad', [['bulochka-shokolad', 150]]],
  ['yarimta non', 'non', 0.5, null, 'non', [['non', null]]],
  ['teftel', 'teftel', null, null, 'tefteli', [['tefteli', null]]],
  ['sutlickofe', 'sutlickofe', null, null, 'qahva-sutli', [['qahva-sutli', null]]],
  ['sutli kofe', 'sutli kofe', null, null, 'qahva-sutli', null],
  ['200 мл молока', 'молока', 200, 'ml', 'sut', null], ['2 ta somsa', 'somsa', 2, 'dona', null, null], ['1,5 kosa osh', 'osh', 1.5, 'kosa', 'osh', null],
  ['sut 1,5', 'sut 1,5', null, null, 'sut', null]          // yolg'iz oxirgi son — miqdor emas (yog'liligi)
];
for (const [q, nm, qty, u, id, pt] of ONE) {
  const sq = S.splitQty(q); assert.deepEqual([sq.name, sq.qty, sq.unit], [nm, qty, u], q + ': miqdor');
  if (id) { const r = S.search(DB, sq.name, { limit: 3 }).map((f) => f.id); assert.ok(r.includes(id), q + ' → ' + id + ' (bor: ' + r.join(',') + ')'); }
  if (pt) { const p = S.parseText(q, DB, {}); assert.deepEqual(p.missing, [], q + ': topilmagan qism yo\'q'); assert.deepEqual(p.items.map((x) => [x.fid, pt[0][1] == null ? null : Math.round(x.g)]), pt, q + ': parseText'); }
}
ok(ONE.length + " ta bitta taomli so'rov: miqdor (boshida/oxirida, 100 г / 200 мл / 2 ta / yarimta / 1,5) ajraladi, nom bo'yicha to'g'ri taom topiladi; «sut 1,5» — miqdor emas");
assert.equal(S.parseText('yarimta non', DB, {}).items[0].qty, 0.5, 'yarimta = 0,5');
const MULTI = [
  ['yarimta non 50 gram qaymoq', ['yarimta non', '50 gram qaymoq'], [['non', 0.5, null], ['qaymoq', 50, 'g100']]],
  ['sut 200gr qora va kok quruq', ['sut 200 gr', 'qora choy', 'kok choy shakarsiz'], [['sut', 200, 'g100'], ['choy', 1, null], ['yashil-choy', 1, null]]],
  ['osh va choy', ['osh', 'choy'], [['osh', 1, null], ['choy', 1, null]]],
  ['2 ta somsa, choy', ['2 ta somsa', 'choy'], null],
  ['non + qatiq', ['non', 'qatiq'], [['non', 1, null], ['qatiq', 1, null]]]
];
for (const [q, parts, items] of MULTI) {
  assert.deepEqual(S.splitParts(q), parts, q + ': qismlar');
  if (items) { const p = S.parseText(q, DB, {}); assert.deepEqual(p.missing, [], q + ': hammasi topildi (AI kerak emas)'); assert.deepEqual(p.items.map((x) => [x.fid, x.qty, x.unit === 'g100' ? 'g100' : null]), items, q + ': taomlar'); }
}
ok("ko'p taomli: «yarimta non 50 gram qaymoq» → non ½ + qaymoq 50 g; «sut 200gr qora va kok quruq» → sut 200 g + qora choy + ko'k choy (shakarsiz); va / , / + bo'yicha");
for (const [a, b] of [['tefteli', 'teftel'], ['sutli kofe', 'sutlikofe'], ['рис', 'guruch'], ['яйца', 'tuxum'], ['молоко', 'sut'], ['отруби', 'kepak']]) assert.equal(S.search(DB, b, { limit: 1 })[0].id, S.search(DB, a, { limit: 1 })[0].id, a + ' = ' + b);
ok("yozilish farqlari: bo'shliqsiz (sutlikofe), oxirgi harf (teftel), sinonimlar (рис/яйца/молоко/отруби)");
const ids = new Set(DB.map((f) => f.id)); for (const id of ['kakao-kukun', 'kepak', 'tuxum-qov-yogsiz', 'kotleta-kiyev', 'bulochka-shokolad', 'guruch']) assert.ok(ids.has(id), id);
const k = (id) => DB.find((f) => f.id === id).k; assert.ok(k('kepak') > 200 && k('kepak') < 230, 'kepak USDA 216'); assert.ok(k('kakao-kukun') > 220 && k('kakao-kukun') < 240, 'kakao USDA 228'); assert.equal(DB.find((f) => f.id === 'kotleta-kiyev').e, 1, 'kotleta — taxminiy aralash');
ok('bazada yangi taomlar manbasi bilan: kakao kukuni, kepak, yog\'siz qovurilgan tuxum, kotleta po-kiyevski (taxminiy), shokoladli bulochka; qaynatilgan guruch bor');
(async () => {
  const { miqdorsiz, yigMiqdorsiz } = await import(path.join(__dirname, '..', 'functions', '_lib', 'soz-norm.js'));
  assert.equal(miqdorsiz('рис вареный 100 г'), 'рис вареный'); assert.equal(miqdorsiz('yarimta non'), 'non'); assert.equal(miqdorsiz('sut 1,5'), 'sut 1,5'); assert.equal(miqdorsiz('2ta somsa'), 'somsa'); assert.equal(miqdorsiz('100gr'), '100gr');
  assert.deepEqual(yigMiqdorsiz([{ soz: 'рис вареный 100 г', son: 3 }, { soz: 'рис вареный 90 г', son: 2 }, { soz: 'teftel', son: 4 }]), [{ soz: 'рис вареный', son: 5, kun: 0 }, { soz: 'teftel', son: 4, kun: 0 }]);
  ok("admin «topilmagan so'zlar» miqdorsiz yig'iladi («рис вареный 100 г» + «90 г» = «рис вареный»)");
  console.log('\n' + n + '/' + n + ' OK');
})().catch((e) => { console.error(e); process.exitCode = 1; });
