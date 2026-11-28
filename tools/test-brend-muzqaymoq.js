/* Muzqaymoq brendlari («48 копеек», «Bahrom»): har mahsulotda yorliq qiymati + manba havolasi (https), Atwater ±15%, kkal = yorliq, dona = qadoq og'irligi;
 * qidiruv (uz/ЎЗ/ru sinonimlar) brend mahsulotini topadi; brend nomi yozilsa («Bahrom» — yorlig'i yo'q) natija bo'sh emas: br ro'yxatida mos UMUMIY taomlar («Balki: …»),
 * o'ylab topilgan raqam yo'q (Bahrom mahsulotlari bazada YO'Q — yorliq kelgunicha).   node tools/test-brend-muzqaymoq.js */
'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path');
const S = require(path.join(__dirname, '..', 'assets', 'kalkifit-core.js'));
const J = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'ovqatlar.json'), 'utf8')), A = J.foods, by = Object.fromEntries(A.map((f) => [f.i, f]));
const YQ = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'manba', 'yorliq.json'), 'utf8')).yorliq;
const DB = S.normFoods(A); S.buildIndex(DB);
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const k48 = A.filter((f) => f.i.startsWith('mz-48k-'));
assert.ok(k48.length >= 6, '48 копеек: kamida 6 tur — ' + k48.length);
for (const f of k48) {
  assert.ok(/https:\/\/[^ )]+/.test(f.m), f.i + ': manba havolasi (m)'); assert.ok(/https:\/\//.test(f.ms.u) && /https:\/\//.test(f.ms.r), f.i + ': manba havolasi (ms)');
  const atw = 4 * f.p + 9 * f.f + 4 * f.c; assert.ok(Math.abs(atw - f.k) <= Math.max(20, f.k * 0.15), f.i + ': Atwater'); assert.equal(f.e, 0, f.i + ': yorliq — taxminiy emas');
  const don = f.u.find((u) => u[0] !== 'g100'); assert.ok(don && don[1] >= 50 && don[1] <= 450, f.i + ': qadoq porsiyasi'); assert.ok(f.u.some((u) => u[0] === 'g100'), f.i + ': 100 g');
  assert.ok(f.a.some((a) => /48/.test(a)) && f.a.some((a) => /копеек/.test(a)), f.i + ': sinonim (lotin + kirill)');
}
for (const k of Object.keys(YQ).filter((x) => x.startsWith('k48-'))) assert.ok(/^https:\/\//.test(YQ[k].url) && YQ[k].k > 0, k + ': manba url');
ok('48 копеек: ' + k48.length + ' tur — yorliq qiymati, manba havolasi (m + ms), Atwater, qadoq porsiyasi + 100 g');
const top = (q) => S.search(DB, q, { limit: 8 }).map((f) => f.id);
for (const [q, id] of [['48 kopeek stakancha', 'mz-48k-stakan-plombir'], ['48 копеек эскимо', 'mz-48k-eskimo-klyukva'], ['48 копеек пломбир стаканчик', 'mz-48k-stakan-plombir'], ['48 kopeek briket', 'mz-48k-plombir-210'], ['48 копеек рожок', 'mz-48k-rojok-mindal'], ['48 копеек', null], ['48 kopeek', null]]) {
  const r = top(q); assert.ok(r.length, q + ': natija yo\'q'); if (id) assert.ok(r.slice(0, 3).includes(id), q + ' → ' + r.join(','));
  else assert.ok(r.some((i) => i.startsWith('mz-48k-')), q + ' → ' + r.join(','));
}
ok('Qidiruv: 48 копеек / 48 kopeek (+ tur nomi, uz/ru) brend mahsulotini topadi');
/* Bahroma (Qozog'iston, Shin-Line; «Bahrom»/«Бахром» deb yozilsa ham shu): yorliq mahsulotlari + yo'qlari uchun «Balki» */
const bh = A.filter((f) => f.i.startsWith('mz-bahroma-')); assert.ok(bh.length >= 6, 'Bahroma: kamida 6 tur — ' + bh.length);
for (const f of bh) {
  assert.ok(/https:\/\/[^ )]+/.test(f.m) && /https:\/\//.test(f.ms.u), f.i + ': manba havolasi'); const atw = 4 * f.p + 9 * f.f + 4 * f.c; assert.ok(Math.abs(atw - f.k) <= Math.max(20, f.k * 0.15), f.i + ': Atwater'); assert.equal(f.e, 0);
  assert.ok(f.u.some((u) => u[0] !== 'g100' && u[1] >= 50 && u[1] <= 450) && f.u.some((u) => u[0] === 'g100'), f.i + ': porsiya'); ['bahroma', 'бахрома', 'bahrom', 'бахром'].forEach((a) => assert.ok(f.a.includes(a), f.i + ': sinonim ' + a));
}
for (const k of Object.keys(YQ).filter((x) => x.startsWith('bahroma-'))) assert.ok(/^https:\/\//.test(YQ[k].url) && YQ[k].k > 0, k + ': manba url');
for (const q of ['Bahrom', 'Бахром', 'Bahroma', 'Бахрома', 'bahrom muzqaymoq', 'мороженое Бахром', 'мороженое Бахрома', 'bahrom eskimo', 'бахром эскимо']) { const r = top(q); assert.ok(r.filter((i) => i.startsWith('mz-bahroma-')).length >= 2, q + ' → ' + r.join(',')); }
ok('Bahroma: ' + bh.length + ' tur — yorliq qiymati, manba havolasi, Atwater, porsiya; «Bahrom»/«Бахром»/«Bahroma»/«Бахрома»/«мороженое Бахром» → Bahroma mahsulotlari');
const norm = (x) => ' ' + S.key(x) + ' ';
const br = J.br; assert.ok(Array.isArray(br) && br.length >= 2, 'br');
const rel = (q) => { const s = norm(q), out = []; br.forEach((b) => { if (b.a.some((a) => s.indexOf(' ' + S.key(a) + ' ') >= 0)) b.f.forEach((i) => out.indexOf(i) < 0 && out.push(i)); }); return out; };
for (const q of ['Bahrom', 'Бахром', 'Bahroma', 'Бахрома', 'baxroma', 'Baxrom', 'bahrom muzqaymoq', 'мороженое Бахром']) { const r = rel(q); assert.ok(r.includes('mz-stakancha') && r.includes('mz-rojok') && r.includes('mz-sendvich'), q + ': yorlig\'i yo\'q turlar uchun umumiy taomlar «Balki»da'); assert.ok(!r.includes('mz-eskimo-glazur') && !r.includes('mz-plombir-briket') && !r.includes('mz-meva-bar'), q + ': yorlig\'i bor turlarning umumiy nusxasi takrorlanmaydi'); r.forEach((i) => assert.ok(by[i] && /^mz-/.test(i) && !/^mz-(48k|bahroma)-/.test(i), q + ': ' + i)); }
ok('Bahroma: yorlig\'i yo\'q turlar (stakancha, rojok, sendvich, vafli, vanil) uchun umumiy taomlar «Balki»da; yorlig\'i borlari takrorlanmaydi');
const r48 = rel('48 копеек'); assert.ok(!r48.includes('mz-stakancha') && !r48.includes('mz-eskimo-glazur') && r48.includes('mz-sendvich'), '48 копеек: yorlig\'i bor turlar umumiy ro\'yxatdan tushgan, yo\'qlari qolgan');
ok('48 копеек: yorlig\'i bor turlarning umumiy nusxasi «Balki»da takrorlanmaydi, yo\'qlari (sendvich, vafli, vanil) qoladi');
const app = fs.readFileSync(path.join(__dirname, '..', 'assets', 'kalkifit-app.js'), 'utf8'); assert.ok(/function brandRel\(/.test(app) && /brandRel\(qn\)/.test(app) && /dbBr = j\.br/.test(app), 'ilova brandRel');
ok('Ilova: brandRel — natija yo\'q bo\'lsa «Balki», natija bor bo\'lsa oxirida taklif');
console.log('\nMuzqaymoq brendlari: ' + n + ' tekshiruv OK');
