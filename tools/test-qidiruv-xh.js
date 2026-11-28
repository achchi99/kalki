/* O'zbek lotin yozuvidagi x/h almashuvi qidiruvda umumiy qoida: x ≡ h ≡ kh (baxroma = bahroma = бахрома, xolodets = holodets, baxor = bahor, xurmo = hurmo).
 * Bazadagi har bir x/h li nomning ikki varianti bir xil natija beradi; Бахрома so'rovlari Bahroma mahsulotlarini chiqaradi.   node tools/test-qidiruv-xh.js */
'use strict';
const assert = require('assert'), path = require('path');
const S = require(path.join(__dirname, '..', 'assets', 'kalkifit-core.js'));
const DB = S.normFoods(require(path.join(__dirname, '..', 'data', 'ovqatlar.json')).foods); S.buildIndex(DB);
const ids = (q) => S.search(DB, q, { limit: 12 }).map((f) => f.id).join(',');
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
assert.equal(S.key('baxroma'), S.key('bahroma')); assert.equal(S.key('xolodets'), S.key('holodets')); assert.equal(S.key('baxor'), S.key('bahor')); assert.equal(S.key('бахрома'), S.key('bahroma')); assert.equal(S.key('Хурмо'), S.key('hurmo')); assert.equal(S.key('Bakhroma'), S.key('bahroma'));
ok('key(): baxroma = bahroma = бахрома = bakhroma; xolodets = holodets; baxor = bahor; хурмо = hurmo');
/* umumiy: bazadagi barcha x/h li nomlarning so'zlari — x↔h almashtirilgan variant bir xil natija */
let cnt = 0; const seen = new Set();
for (const f of DB) for (const nm of [f.n].concat(f.a || [])) { if (!/^[a-z' ]+$/i.test(nm)) continue; for (const w of nm.toLowerCase().split(/\s+/)) { if (w.length < 4 || !/[xh]/.test(w) || seen.has(w)) continue; seen.add(w);
  const a = w.replace(/x/g, 'h'), b = w.replace(/(?<![sckgz])h/g, 'x'); if (a === b) continue; const A = ids(a), B = ids(b), C = ids(w); assert.equal(A, B, '«' + a + '» ≠ «' + b + '»'); assert.equal(A, C, '«' + a + '» ≠ «' + w + '»'); cnt++; } }
assert.ok(cnt >= 100, 'kamida 100 ta x/h li so\'z: ' + cnt); ok('x/h variantlari bir xil natija: ' + cnt + ' ta so\'z (bazadagi nom va sinonimlardan)');
for (const [x, h] of [['xolodets', 'holodets'], ['baxor', 'bahor'], ['xurmo', 'hurmo'], ['xamir', 'hamir'], ['baxroma', 'bahroma']]) assert.equal(ids(x), ids(h), x + ' ≠ ' + h);
assert.ok(ids('bahor').split(',').includes('bahor-salati'), 'bahor → Bahor salati'); assert.ok(ids('baxor').split(',').includes('bahor-salati'), 'baxor → Bahor salati');
ok('xolodets/holodets, baxor/bahor (→ Bahor salati), xurmo/hurmo, xamir/hamir, baxroma/bahroma — bir xil');
for (const q of ['baxroma', 'bahroma', 'бахрома', 'бахром', 'Baxroma', 'BAHROMA', 'bahrom', 'baxrom', 'бахрома мороженое', 'baxroma muzqaymoq', 'bahroma eskimo', 'baxroma pinta']) { const r = ids(q).split(',').filter((i) => /^mz-bahroma-/.test(i)); assert.ok(r.length >= (/pinta|eskimo/.test(q) ? 1 : 2), q + ': Bahroma mahsulotlari — ' + ids(q)); assert.ok(/^mz-bahroma-/.test(ids(q).split(',')[0]), q + ': 1-natija Bahroma — ' + ids(q)); }
assert.equal(ids('baxroma'), ids('bahroma')); assert.equal(ids('бахрома'), ids('bahroma'));
ok('«baxroma», «bahroma», «бахрома», «бахром», «bahrom», «baxrom» + muzqaymoq/eskimo/pinta — Bahroma mahsulotlari birinchi');
console.log('\nQidiruv x/h: ' + n + ' tekshiruv OK');
