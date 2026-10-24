/* KalkiFit qidiruv sifati (v34): 30+ mashhur so'rov (UZ/RU/ЎЗ yozuvi) — 1-natija kutilgan taom, birinchi 3 tasi mantiqiy,
 * birinchi 5 talikda so'rovga aloqasi yo'q taom yo'q (nom/sinonim so'zi so'rov bilan boshlanadi yoki shu guruh: osh/palov/плов → palov turlari).
 * Kam harfli so'rovda (3–4) tasodifiy moslik yo'q («плов» → «пломбир», «Сухое молоко» chiqmaydi); imlo xatosi faqat 5+ harfda.   node tools/test-qidiruv-sifat.js */
'use strict';
const assert = require('assert'), path = require('path');
const S = require(path.join(__dirname, '..', 'assets', 'kalkifit-core.js'));
const DB = S.normFoods(require(path.join(__dirname, '..', 'data', 'ovqatlar.json')).foods); S.buildIndex(DB);
const by = {}; DB.forEach((f) => { by[f.id] = f; });
const PALOV = ['osh', 'toy-oshi', 'samarqand-oshi', 'fargona-oshi', 'buxoro-oshi', 'choyxona-osh', 'osh-tovuq'];
const top = (q, n = 5) => S.search(DB, q, { limit: n });
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
// [so'rov, 1-natija (id yoki id lar), birinchi 3 talikka ruxsat etilgan id'lar (null — tekshiruv aloqa bo'yicha)]
const CASES = [
  ['osh', 'osh', PALOV], ['palov', 'osh', PALOV], ['плов', 'osh', PALOV], ['ош', 'osh', PALOV], ['палов', 'osh', PALOV], ['ош палов', null, null],
  ["sho'rva", 'shurva', null], ['шурпа', 'shurva', null], ['shorva', 'shurva', null],
  ["lag'mon", 'lagmon', null], ['лагман', 'lagmon', null], ['lagmon', 'lagmon', null],
  ['manti', 'manti', null], ['манты', 'manti', null], ['somsa', null, null], ['самса', null, null],
  ['chuchvara', 'chuchvara', null], ['чучвара', 'chuchvara', null], ['norin', 'norin', null], ['нарын', 'norin', null],
  ['shashlik', null, null], ['шашлык', null, null], ['qozon kabob', 'qozon-kabob', null], ['казан кебаб', 'qozon-kabob', null],
  ['dimlama', 'dimlama', null], ['димлама', 'dimlama', null], ['mastava', 'mastava', null], ['мастава', 'mastava', null],
  ['chalop', 'chalop', null], ['чалоп', 'chalop', null], ['non', 'non', null], ['лепешка', 'non', null],
  ["moshxo'rda", 'moshxorda', null], ['xonim', 'xonim', null], ['halim', null, null], ['beshbarmoq', null, null],
  ['qatiq', 'qatiq', null], ['kefir', 'kefir', null], ['sut', 'sut', null], ['молоко', 'sut', null], ['choy', 'choy', null], ['tuxum', 'tuxum', null], ['kabob', null, null],
  ['Нарын', 'norin', null], ['Ош', 'osh', PALOV], ['Шўрва', 'shurva', null], ['Лағмон', 'lagmon', null]
];
const words = (f) => { S.key(''); const a = [f.n, f.r].concat(f.a || []).filter(Boolean); return a.map((x) => S.key(x)).join(' ').split(' ').concat(a.map((x) => S.key(x, true)).join(' ').split(' ')); };
function related(f, q) {
  if (/^(osh|palov|plov|ош|палов|плов|ош палов)$/i.test(q.trim()) && PALOV.includes(f.id)) return true;
  const ws = words(f), qt = S.key(q, true).split(' ').filter(Boolean), qc = S.key(q).split(' ').filter(Boolean);
  return qt.every((t, i) => ws.some((w) => w.indexOf(t) === 0 || w.indexOf(qc[i]) === 0));
}
for (const [q, first, top3] of CASES) {
  const r = top(q), ids = r.map((f) => f.id), nm = r.map((f) => f.n).join(' | ');
  assert.ok(r.length >= 1, q + ': natija yo\'q');
  if (first) assert.equal(ids[0], first, q + ': 1-natija ' + first + ' bo\'lishi kerak — ' + nm);
  if (top3) ids.slice(0, 3).forEach((id) => assert.ok(top3.includes(id), q + ': birinchi 3 talikda ' + id + ' — ' + nm));
  r.forEach((f) => assert.ok(related(f, q), q + ': «' + f.n + '» so\'rovga aloqasi yo\'q — ' + nm));
}
ok(CASES.length + ' ta mashhur so\'rov (UZ/RU/ЎЗ): 1-natija kutilgan taom, birinchi 3 tasi mantiqiy, 5 talikda aloqasiz taom yo\'q');
/* palov turlari */
{ for (const q of ['плов', 'palov', 'osh', 'ош']) { const ids = top(q, 10).map((f) => f.id); PALOV.forEach((id) => assert.ok(ids.includes(id), q + ': ' + id)); }
  ['toy-oshi', 'samarqand-oshi', 'fargona-oshi', 'buxoro-oshi'].forEach((id) => { const f = by[id]; assert.ok(f && f.k > 150 && f.k < 260, id + ' kkal ' + (f && f.k)); assert.equal(f.x, 1, id + ': taxminiy (retsept hisobi)'); });
  ok('Palov turlari: oddiy (osh, to\'y oshi), Samarqand, Farg\'ona, Buxoro, choyxona, tovuqli — «плов/palov/osh/ош» da 10 talikda; yangilari retsept bo\'yicha (taxminiy)'); }
/* shovqin: kam harfli so'rov va imlo xatosi */
{ for (const q of ['плов', 'plov', 'osh']) { const r = top(q, 30).map((f) => f.n).join(' | '); assert.ok(!/plombir|Quruq sut|Bulgur|Shovla/i.test(r), q + ': shovqin — ' + r); }
  assert.ok(!top('пло', 30).some((f) => f.id === 'sut-kukun'), 'пло → Сухое молоко yo\'q');
  assert.equal(top('kefr').length, 0, '4 harfda imlo xatosi qidirilmaydi'); assert.equal(top('lagmn')[0].id, 'lagmon', '5 harfda imlo xatosi: lagmn → Lag\'mon'); assert.equal(top('mastva')[0].id, 'mastava');
  const qa = top('qatiq', 5).map((f) => f.id); assert.ok(!qa.includes('ledenets') && !qa.includes('pishloq'), 'qatiq ≠ qattiq: ' + qa);
  ok('Shovqin yo\'q: «плов/plov/osh» → plombir, quruq sut, bulgur, shovla yo\'q; 4 harfda xato qidirilmaydi, 5+ harfda — topadi (lagmn, mastva); qatiq ≠ qattiq'); }
/* sut mahsulotlari: yog'liligi bo'yicha variantlar */
{ const sut = by.sut.fam; assert.deepEqual(sut.ax[0].o.map((o) => o.n), ['0,5%', '1%', '1,5%', '2%', '2,5%', '3,2%', '6%']); assert.deepEqual(['f05', 'f1', 'f15', 'f2', 'f25', 'odatiy', 'f6'].map((k) => sut.g[k].f), [0.5, 1, 1.5, 2, 2.5, 3.2, 6]);
  assert.ok(sut.g.f1.k >= 40 && sut.g.f1.k <= 45 && sut.g.f2.k >= 48 && sut.g.f2.k <= 52, 'USDA 1% va 2% sut');
  assert.deepEqual(by.kefir.fam.ax[0].o.map((o) => o.n), ['1%', '2,5%', '3,2%']); assert.deepEqual(by.smetana.fam.ax[0].o.map((o) => o.n), ['10%', '15%', '20%', '25%']);
  for (const [q, v] of [['sut 1', 'f1'], ['sut 1%', 'f1'], ['sut 2', 'f2'], ['молоко 2%', 'f2'], ['sut 1,5', 'f15'], ['sut 3,2', 'odatiy']]) assert.equal((S.famPick(by.sut, q) || {}).yogliligi, v, q);
  const qy = top('qaymoq', 6).map((f) => f.id); ['qaymoq', 'smetana', 'qaymoq-10'].forEach((id) => assert.ok(qy.includes(id), 'qaymoq: ' + id + ' / ' + qy));
  ok('Sut: 0,5 · 1 · 1,5 · 2 · 2,5 · 3,2 · 6% (1% va 2% — USDA), kefir 1 · 2,5 · 3,2%, smetana (qaymoq) 10 · 15 · 20 · 25%; «sut 2%» → 2%; «qaymoq» → qaymoq, smetana, qaymoq 10%'); }
console.log('\n' + n + '/' + n + ' OK');
