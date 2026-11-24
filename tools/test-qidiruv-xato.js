/* v100: XATOGA CHIDAMLI QIDIRUV va BAZA BO'SHLIQLARI (admin «topilmagan» 7 kun, 22/752 = 2,9 %).
 *  1) A: statistikadagi har bir topilmagan so'rov endi to'g'ri taomni topadi (parseText = AI matn yo'li, search = qidiruv oynasi).
 *  2) B: fonetik/fuzzy qidiruv (o/u/a almashuvi, y/ʼ tushishi, -li/-liy/-lik, k/g, f/v …) — faqat aniq natija bo'lmaganda; tasodifiy imlo xatolarida tiklash ulushi; miqdor so'zlari («bulak», «kichikbulak»).
 *  3) REGRESSIYA: aniq so'rov natijasi o'zgarmagan — fuzzy o'chirilgan (ph:false) va yoqilgan qidiruv bir xil (har bir nom/sinonim bo'yicha), fuzzy faqat natija bo'lmaganda (.fuzzy bayrog'i).
 *  4) C: yog'lilik/variant slotlari (tools/baza-bitta-variant.js) — hammasi to'ldirilgan, «bitta variant» guruh yo'q; raqam bilan yozilsa («творог 1», «kefir 2.5») variant, miqdor emas.
 *   node tools/test-qidiruv-xato.js */
'use strict';
const assert = require('assert'); const fs = require('fs'); const path = require('path');
const S = require('../assets/kalkifit-core.js'); const foods = S.buildIndex(S.normFoods(require('../data/ovqatlar.json').foods));
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const parse = (q) => S.parseText(q, foods, {}); const ids = (q) => parse(q).items.map((x) => x.fid + (x.vr ? ':' + x.vr : ''));
const top = (q, k) => S.search(foods, q, { limit: k || 3 });
/* ---- 1. A: topilmaganlar ---- */
const A = [['afisyanka', 'suli'], ['afisyanka kasha', 'suli'], ['gushtliy perok', /^(pirojki-duxovka-gosht|gumma)$/], ['ismaloq uy pichagi', 'ismaloqli-pirog'], ['kari', 'tovuq-kari'], ['labne', 'labne'], ['padlifkali lagmon', 'lagmon'],
  ['san sebastian', 'chizkeyk-san-sebastyan'], ["suvak sho'rva", 'shurva'], ['turub', /^turp/]];
for (const [q, want] of A) { const it = parse(q); assert.ok(it.items.length && !it.missing.length, 'parseText topilmadi: ' + q); const f = it.items[0].fid; assert.ok(want instanceof RegExp ? want.test(f) : f === want, q + ' → ' + f + ' (kutilgan ' + want + ')');
  const t = top(q, 3).map((x) => x.id); assert.ok(t.some((i) => (want instanceof RegExp ? want.test(i) : i === want)), 'search ' + q + ': ' + t.join(',')); }
assert.equal(parse("suvak sho'rva").items[0].vr, 'qaynatma', '«suyak sho\'rva» — qaynatma (bulyon) varianti');
const xr = top('xrus', 3).map((x) => x.id); assert.ok(xr.includes('guruch-xlebets'), 'xrus → xrustyashiy xlebtsi: ' + xr.join(',')); const zf = top('zaf', 3); assert.equal(zf[0].id, 'zefir', 'zaf → zefir'); assert.ok(zf.fuzzy, 'zaf — fuzzy (Balki: …)');
/* ko'p taomli va miqdor so'zlari */
let r = parse('shurva bir bulak patir'); assert.deepEqual(r.items.map((x) => x.fid), ['shurva', 'non'], 'sho\'rva + patir: ' + JSON.stringify(r.items.map((x) => x.fid))); assert.equal(r.items[1].vr, 'patir'); assert.ok(!r.missing.length);
r = parse('tuxum qovurilgan kichikbulak'); assert.equal(r.items.length, 1); assert.equal(r.items[0].fid, 'tuxum'); assert.equal(r.items[0].vr, 'qovurilgan'); const eg = S.unitGrams(r.items[0].food, 'dona'); assert.ok(r.items[0].g > 0 && r.items[0].g < eg * 0.6, 'kichik bo\'lak — bitta tuxumdan kam: ' + r.items[0].g + ' / ' + eg);
for (const q of ['bir bulak chizkeyk', "bir bo'lak chizkeyk", 'birbulak chizkeyk', 'kichikbulak chizkeyk', "kichik bo'lak chizkeyk", 'chizkeyk bir bulak', 'chizkeyk kichik bulak']) { const it = parse(q); assert.ok(it.items.length === 1 && /^(tort|chizkeyk)$/.test(it.items[0].fid) && (it.items[0].vr || 'chizkeyk') === 'chizkeyk', q + ' → ' + JSON.stringify(ids(q))); assert.equal(it.items[0].unit, 'bolak', q + ': birlik bo\'lak'); }
assert.ok(parse('kichik bo\'lak chizkeyk').items[0].qty === 1 && parse('bir bulak non').items.length === 1);
ok('A: afisyanka, afisyanka kasha, gushtliy perok, ismaloq uy pichagi, kari, labne, padlifkali lagmon, san sebastian, suvak sho\'rva, turub — to\'g\'ri taom (AI matn yo\'li ham, qidiruv ham); xrus → xlebtsi, zaf → zefir (Balki); «shurva bir bulak patir» → 2 taom; «kichikbulak» — kichik bo\'lak');
/* ---- 2. B: fonetik qidiruv ---- */
const FZ = [['pirok', /pirojki|pirog|gumma/], ['gushtli somsa', /^somsa/], ['palaf', /^osh$|osh/], ['lagmin', /lagmon/], ['kuskuz', /kuskus/], ['sosiskaa', /sosiska/], ['xrusyashiy xlebsi', /xlebets/]];
const fzFail = FZ.filter(([q, re]) => !top(q, 5).some((f) => re.test(f.id))); assert.deepEqual(fzFail.map((x) => x[0]), [], 'fuzzy topilmadi: ' + fzFail.map((x) => x[0]));
/* tasodifiy imlo xatolari: har bir (≥6 harfli bitta so'zli) nomga o/u, a/o almashuvi, y tushishi, -li → -liy — tiklash ulushi */
const sk = S.search; let tot = 0, hit = 0; const bad = [];
const mut = (w) => { const m = []; const i1 = w.search(/o/); if (i1 > 0) m.push(w.slice(0, i1) + 'u' + w.slice(i1 + 1)); const i2 = w.search(/u/); if (i2 > 0) m.push(w.slice(0, i2) + 'o' + w.slice(i2 + 1)); if (/y/.test(w)) m.push(w.replace('y', '')); const i3 = w.search(/a/); if (i3 > 1) m.push(w.slice(0, i3) + 'o' + w.slice(i3 + 1)); return m; };
for (const f of foods) { if (f.h || f.tm || !f.n || tot >= 600) continue; const w = f.n.replace(/\(.*$/, '').trim().toLowerCase().replace(/['’ʻ`‘]/g, ''); if (/\s/.test(w) || w.length < 6 || !/^[a-z]+$/.test(w)) continue;
  const mm = mut(w).filter((x) => x !== w); if (!mm.length) continue; const q = mm[0]; if (foods.some((g) => g.id !== f.id && S.search([g], q, { limit: 1, ph: false }).length)) { /* boshqa taomga aniq mos — xato emas */ }
  tot++; const t = S.search(foods, q, { limit: 8 }); if (t.some((x) => x.id === f.id || x.id.indexOf(f.id) === 0 || f.id.indexOf(x.id) === 0 || (x.fam && f.fam && x.fam.id === f.fam.id))) hit++; else bad.push(w + ' → ' + q + ' → ' + t.slice(0, 2).map((x) => x.id).join(',')); }
const rate = hit / tot; assert.ok(tot >= 150, 'namuna kam: ' + tot); assert.ok(rate >= 0.88, 'imlo xatosidan tiklash ' + Math.round(rate * 100) + ' % (' + hit + '/' + tot + '); xatolar: ' + bad.slice(0, 15).join(' | '));
ok('B: fonetik moslik (' + FZ.length + ' so\'rov: pirok, gushtli somsa, palaf, lagmin …) va tasodifiy imlo xatosi (o↔u, a↔o, y tushishi): ' + hit + '/' + tot + ' = ' + Math.round(rate * 100) + ' % tiklanadi');
/* ---- 3. regressiya: aniq natija o'zgarmagan ---- */
let reg = 0; const diffs = [];
const sample = []; foods.forEach((f, i) => { if (f.h) return; sample.push(f.n, f.r); (f.a || []).slice(0, 3).forEach((a) => sample.push(a)); });
for (const q of sample) { if (!q) continue; const off = S.search(foods, q, { limit: 5, ph: false }); const on = S.search(foods, q, { limit: 5 }); reg++;
  if (off.length) { if (on.fuzzy || on.map((x) => x.id).join() !== off.map((x) => x.id).join()) diffs.push(q); } else if (on.length && !on.fuzzy) diffs.push(q + ' (fuzzy bayroqsiz)'); }
assert.deepEqual(diffs.slice(0, 10), [], 'aniq natija o\'zgardi (' + diffs.length + '): ' + diffs.slice(0, 10).join(' | '));
for (const q of ['osh', 'non', 'choy', 'sut', 'kola', 'tuxum', 'somsa', 'lagmon', 'kefir', 'tvorog', 'qatiq', 'pishloq', 'kolbasa']) assert.ok(!top(q, 5).fuzzy, q + ': aniq so\'rov fuzzy bo\'lmasin');
assert.equal(top('kefr').length, 0, '4 harfli imlo xatosi qidirilmaydi (kefr); lekin 5+ da: ' + top('lagmn')[0].id); assert.equal(top('lagmn')[0].id, 'lagmon');
ok('Regressiya: ' + reg + ' nom/sinonim so\'rovi — fuzzy o\'chirilgan va yoqilgan qidiruv aynan bir xil; fuzzy faqat natija bo\'lmaganda (.fuzzy)');
/* ---- 4. C: yog'lilik / variant slotlari ---- */
const BV = require('./baza-bitta-variant.js').run(path.join(__dirname, '..')); const bo = BV.filter((g) => g.bosh.length || g.bitta);
assert.deepEqual(bo.map((g) => g.guruh + ': ' + g.bosh.join(',')), [], 'variant slotlari bo\'sh');
const V = (q) => { const l = top(q, 1), f = l[0], pk = f.fam ? S.famPick(f, q) : null; return f.fam ? S.famVariant(f, Object.assign(S.famDefault(f), pk || {})) : f; };
for (const [q, fat] of [['творог 1', 1], ['tvorog 2', 2], ['творог 1%', 1], ['kefir 2.5', 2.5], ['kefir 1', 1], ['sut 1,5', 1.5], ['smetana 25', 25], ['сметана 10', 10], ['qatiq 2.5', 2.6]]) assert.ok(Math.abs(V(q).f - fat) <= 0.8, q + ' → yog\' ' + V(q).f + ' (kutilgan ' + fat + ')');
for (const [q, vr] of [['tvorog 1', '1'], ['творог 2', '2'], ['kefir 1', 'f1'], ['kefir 3.2', 'f32'], ['sut 2.5', 'f25'], ['smetana 15', 'f15']]) { const it = parse(q).items[0]; assert.equal(it.vr, vr, q + ' — variant (miqdor emas)'); assert.equal(it.qty, 1, q + ' — miqdor 1'); }
assert.equal(parse('2 sut').items[0].qty, 2, '«2 sut» — 2 stakan'); assert.equal(parse('sut 200 ml').items[0].g, 200, '«sut 200 ml» — 200 g'); assert.equal(parse('tvorog 2 piyola').items[0].qty, 2, '«tvorog 2 piyola» — miqdor');
ok('C: ' + BV.length + ' guruh, ' + BV.reduce((a, g) => a + g.slotlar, 0) + ' variant slot — hammasi to\'ldirilgan, «bitta variant» guruh yo\'q; «творог 1», «kefir 2.5», «сметана 10» — shu yog\'lilik (miqdor emas), «2 sut», «sut 200 ml» o\'zgarmagan');
/* ---- 5. manba va mantiq: yangi taomlar ---- */
const NEW = ['ismaloqli-pirog', 'tovuq-kari', 'chizkeyk-san-sebastyan', 'labne', 'yogurt-kam', 'yogurt-yogsiz', 'yogurt-yunon-5', 'yogurt-ichimlik', 'ryajenka-25', 'ryajenka-4', 'sariyog-725', 'sariyog-825', 'pishloq-edam', 'pishloq-rossiya', 'pishloq-adigey', 'mozzarella-kam', 'qaymoq-20',
  'mol-file-xom', 'mol-antrekot-xom', 'mol-yelka-xom', 'mol-son-xom', 'mol-tosh-xom', 'mol-qiyma-5', 'mol-qiyma-10', 'mol-qiyma-20', 'qoy-son-xom', 'qoy-yelka-xom', 'qoy-bel-xom', 'qoy-boldir-xom', 'tovuq-kanat-xom', 'tovuq-boldir-xom', 'tovuq-jigar-xom', 'tovuq-yurak-xom', 'tovuq-oshqozon-xom', 'tovuq-kokrak-terili-xom', 'tovuq-qiyma-xom', 'kurka-qiyma-xom',
  'kolbasa-mol-kam-yogli', 'sosiska-mol-kam-yogli', 'sosiska-kurka', 'pastrami-kurka'];
const miss = NEW.filter((i) => !foods.find((f) => f.id === i)); assert.deepEqual(miss, [], 'yangi taom yo\'q: ' + miss);
for (const id of NEW) { const f = foods.find((x) => x.id === id); assert.ok(f.m && f.ms && f.ms.u && f.ms.r, id + ': manba majburiy (uz+ru)'); assert.ok(f.n && f.r, id + ': uz+ru nom'); assert.ok(!/ \/ /.test(f.n + f.r), id + ': «A / B» nom yo\'q'); assert.ok(!/halol|ҳалол/i.test([f.n, f.r].concat(f.a || []).join(' ')), id + ': halol so\'zi yo\'q'); assert.ok(/(USDA|Yorliq|Hisob|Retsept|Скурихин)/i.test(f.m), id + ': manba turi: ' + f.m);
  const at = 4 * f.p + 4 * f.c + 9 * f.f; if (f.k > 30) assert.ok(Math.abs(at - f.k) / f.k <= 0.15, id + ': Atwater ±15%: ' + f.k + ' vs ' + Math.round(at)); }
const pork = foods.filter((f) => !f.h && /cho'?chqa|свинин|pork|bekon|pepperoni/i.test((f.n + ' ' + f.r + ' ' + (f.a || []).join(' ')))).map((f) => f.id); NEW.forEach((i) => assert.ok(!pork.includes(i), i + ': cho\'chqa yo\'q'));
ok('Yangi ' + NEW.length + ' taom: uz+ru nom, manba (USDA / yorliq / hisob) va bayoni bor, Atwater ±15 %, «A / B» nom yo\'q, cho\'chqa/halol yo\'q');
/* ---- 6. onigiri: «onigiri» yozilsa hamma variant; manba, dona og'irligi ---- */
const ON = ['onigiri-tunets', 'onigiri-losos', 'onigiri-tovuq', 'onigiri-oddiy'];
for (const q of ['onigiri', 'onigri', 'anigiri', 'онигири', 'рисовый шарик', 'omusubi']) { const t = top(q, 10).map((x) => x.id); const miss = ON.filter((i) => !t.includes(i)); assert.deepEqual(miss, [], q + ': hamma onigiri chiqsin (yo\'q: ' + miss + ')'); assert.equal(t[0], 'onigiri-tunets', q + ': eng ommabop — tunets-mayonez birinchi'); }
for (const [q, id] of [['онигири с тунцом', 'onigiri-tunets'], ['tuna mayo onigiri', 'onigiri-tunets'], ['onigiri salmon', 'onigiri-losos'], ['онигири с лососем', 'onigiri-losos'], ['onigiri teriyaki', 'onigiri-tovuq'], ['онигири с курицей', 'onigiri-tovuq'], ['plain onigiri', 'onigiri-oddiy']]) assert.equal(top(q, 1)[0].id, id, q);
for (const id of ON) { const f = foods.find((x) => x.id === id); assert.equal(S.unitGrams(f, 'dona') >= 100 && S.unitGrams(f, 'dona') <= 120, true, id + ': dona 100–120 g'); assert.ok(f.ms && f.ms.u && f.ms.r && /(Lawson|Mitsuwa|Kizvna|USDA)/.test(f.ms.u + f.m), id + ': manba'); assert.ok(/ \/ /.test(f.n + f.r) === false); assert.ok(f.gr && f.gr.includes('guruch'), id + ': guruh guruch'); }
assert.ok(parse('onigiri tunets 2 dona').items[0].fid === 'onigiri-tunets' && parse('2 onigiri losos').items[0].qty === 2);
ok('Onigiri: «onigiri/onigri/anigiri/онигири/рисовый шарик/omusubi» — 4 variant (tunets-mayonez birinchi); sinonimlar; dona 100–120 g; manba yorliq (Lawson, Mitsuwa, Kizvna) / retsept hisobi (USDA); guruh «guruch»');
console.log('qidiruv-xato: ' + n + ' guruh OK');
