/* v108: SUSHI, KIMBAP, BEZE (tools/ovqatlar-kengaytma9.js + tools/retsept-v108.js).
 *  1) har taom: manba (USDA retsept hisobi), kkal = retsept hisobi, birliklar (dona og'irligi, set = 8 dona, kimbap bo'lak/rulet, beze kichik/katta), tegi, guruhi, kletchatka;
 *  2) mantiq: tempura va pishirilgan roll — mayonez/yog' hisobiga oddiy rollardan kaloriyaliroq (100 g, 1 dona va 1 set bo'yicha); makro ≈ kkal;
 *  3) qidiruv: har sinonim (uz/ru/en) to'g'ri taomni BIRINCHI topadi; «зефир» qidiruvi o'zgarmagan, «безе» → beze birinchi, zefir — «Balki» taklifida (bl);
 *  4) matn/ovoz/AI (parseText): «1 set», «sushi set», «3 кусочка кимбап», beze kichik/katta.   node tools/test-sushi.js */
'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path');
const R = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
const S = require('../assets/kalkifit-core.js'), RH = require('./retsept-hisob.js'), RA = require('./retsept-v108.js');
const J = R('data/ovqatlar.json'); S.setUsul(J.us); const foods = S.buildIndex(S.normFoods(J.foods)), by = Object.fromEntries(foods.map((f) => [f.id, f]));
const U = (f, u) => { const x = f.u.find((q) => q[0] === u); return x ? x[1] : null; }, perU = (f, u) => f.k * U(f, u) / 100;
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const NEW = ['roll-maki-losos', 'roll-ugor', 'roll-pishirilgan', 'nigiri-tunets', 'nigiri-ugor', 'sashimi-losos', 'imbir-marinad', 'vasabi', 'kimbap-klassik', 'kimbap-tunets', 'kimbap-bulgogi', 'beze'];
/* 1. manba va hisob */
for (const id of NEW) { const f = by[id]; assert.ok(f && !f.h, id + ': bazada yo\'q'); assert.ok(f.ms && /USDA/.test(f.ms.u) && /USDA/.test(f.ms.r), id + ': manba (USDA) bayoni uz+ru'); assert.ok(/^Retsept hisobi|^USDA FDC/.test(f.m), id + ': manba: ' + f.m); assert.ok(f.k > 0 && f.p >= 0 && f.f >= 0 && f.c >= 0);
  const mac = 4 * f.p + 4 * f.c + 9 * f.f; assert.ok(Math.abs(mac - f.k) <= Math.max(10, f.k * 0.15), id + ': makro ' + Math.round(mac) + ' ≠ ' + f.k); assert.ok(f.gr && f.gr.length >= 1, id + ': guruh'); assert.ok(f.fb != null || f.fbs, id + ': kletchatka');
  if (RA[id]) { const h = RH.hisob(RA[id]); assert.ok(Math.abs(h.k - f.k) <= 1 && Math.abs(h.p - f.p) <= 0.1 && Math.abs(h.f - f.f) <= 0.1 && Math.abs(h.c - f.c) <= 0.1, id + ': kkal retsept hisobiga mos (' + Math.round(h.k) + ' / ' + f.k + ')'); assert.ok(/Retsept hisobi/.test(f.m) && /g/.test(f.ms.u)); } }
ok(NEW.length + ' ta yangi taom: manba USDA (uz+ru), kkal = retsept hisobi, makro ≈ kkal, guruh va kletchatka bor');
/* 1b. birliklar */
const WT = { 'roll-maki-losos': 25, 'roll-ugor': 30, 'roll-pishirilgan': 30, 'nigiri-tunets': 30, 'nigiri-ugor': 30, 'sushi-nigiri': 30, 'roll-filadelfiya': 30, 'roll-kaliforniya': 30, 'roll-tempura': 35, 'maki-bodring': 25 };
for (const [id, w] of Object.entries(WT)) { assert.equal(U(by[id], 'dona'), w, id + ': dona ' + w + ' g'); assert.equal(U(by[id], 'set'), 8 * w, id + ': set = 8 dona (' + 8 * w + ' g)'); assert.equal(by[id].u[0][0], 'dona', id + ': standart birlik — dona'); }
for (const id of ['kimbap-klassik', 'kimbap-tunets', 'kimbap-bulgogi']) { assert.equal(U(by[id], 'bolak'), 20, id + ': bo\'lak ≈ 20 g'); const r = U(by[id], 'rulet'); assert.ok(r >= 160 && r <= 200 && r % 20 === 0 && r / 20 >= 8 && r / 20 <= 10, id + ': butun rulet 8–10 bo\'lak (' + r + ' g)'); }
assert.equal(U(by.beze, 'dona_s'), 5); assert.equal(U(by.beze, 'dona_l'), 15); assert.equal(U(by.beze, 'dona'), 10, 'beze: o\'rtacha dona = kichik va katta o\'rtasi'); assert.equal(by.beze.u[0][0], 'dona'); assert.deepEqual(by['sashimi-losos'].u, [['g100', 100]], 'sashimi — gramm'); assert.equal(U(by['soya-sous'], 'qoshiq'), 15, 'soya sousi — 1 osh qoshiq'); assert.ok(U(by['imbir-marinad'], 'qoshiq') && U(by.vasabi, 'choyq'));
ok('Birliklar: dona og\'irligi (maki 25, rollar/nigiri 30, tempura 35 g), set = 8 dona (200–280 g), kimbap bo\'lak 20 g va rulet 180 g (9 bo\'lak), beze dona 10 (kichik 5 / katta 15) g, sashimi — gramm, soya sousi — 1 osh qoshiq');
/* 2. mantiq: tempura va pishirilgan roll > oddiy rollar */
const PLAIN = ['roll-filadelfiya', 'roll-kaliforniya', 'roll-maki-losos', 'maki-bodring', 'roll-ugor'], RICH = ['roll-tempura', 'roll-pishirilgan'];
for (const r of RICH) for (const p of PLAIN) { const a = by[r], b = by[p]; assert.ok(a.k > b.k + 10, r + ' (' + a.k + ') > ' + p + ' (' + b.k + ') 100 g da'); assert.ok(perU(a, 'dona') > perU(b, 'dona'), r + ' > ' + p + ' 1 dona da'); assert.ok(perU(a, 'set') > perU(b, 'set'), r + ' > ' + p + ' 1 set da'); assert.ok(a.f > b.f, r + ': yog\' ko\'proq (' + a.f + ' > ' + b.f + ')'); }
assert.ok(by['roll-pishirilgan'].k > 200 && by['roll-tempura'].k > 200, 'tempura/pishirilgan ≥ 200 kkal/100 g');
assert.ok(by['kimbap-tunets'].k > by['kimbap-klassik'].k && by['kimbap-bulgogi'].p > by['kimbap-klassik'].p, 'kimbap: tunets-mayonez kaloriyaliroq, bulgogi oqsilliroq');
assert.ok(by['maki-bodring'].k < by['roll-maki-losos'].k && by['nigiri-tunets'].k < by['nigiri-ugor'].k && by['sushi-nigiri'].k > by['nigiri-tunets'].k, 'nigiri: tunets (yog\'siz baliq) < losos < ugor');
assert.ok(by.beze.k >= 380 && by.beze.k <= 400 && by.beze.c > 90, 'beze quruq: 380–400 kkal/100 g (' + by.beze.k + ')');
ok('Mantiq: tempura (' + by['roll-tempura'].k + ') va pishirilgan roll (' + by['roll-pishirilgan'].k + ' kkal/100 g) oddiy rollardan (' + PLAIN.map((p) => by[p].k).join(', ') + ') kaloriyaliroq — 100 g, 1 dona va 1 set bo\'yicha; yog\' ham ko\'p; kimbap tartibi; beze ' + by.beze.k + ' kkal');
/* 2b. teglar */
const CT = R('data/cheklov-teglar.json').taom, OQ = R('data/oqsil-manba.json').taom;
const has = (id, t) => assert.ok(CT[id].includes(t), id + ': ' + t + ' tegi kerak');
['roll-maki-losos', 'roll-ugor', 'roll-pishirilgan', 'nigiri-tunets', 'nigiri-ugor', 'sashimi-losos', 'kimbap-tunets'].forEach((i) => has(i, 'baliq')); ['roll-pishirilgan', 'kimbap-klassik', 'kimbap-tunets', 'kimbap-bulgogi', 'beze'].forEach((i) => has(i, 'tuxum')); has('roll-pishirilgan', 'sut'); ['roll-ugor', 'nigiri-ugor', 'kimbap-bulgogi'].forEach((i) => has(i, 'glyuten'));
for (const id of NEW) { assert.ok(Array.isArray(CT[id]) && !CT[id].includes('choshqa'), id + ': cho\'chqa tegi yo\'q (faqat bekon, pepperoni)'); assert.ok(OQ[id], id + ': oqsil manbasi tegi'); }
assert.deepEqual(OQ['kimbap-bulgogi'], 'qizil'); assert.equal(OQ['sashimi-losos'], 'baliq'); assert.equal(OQ.beze, 'tuxum');
ok('Teglar: baliq/tuxum/sut/glyuten (ehtiyotkor), cho\'chqa tegi yo\'q; oqsil manbasi tegi har taomda');
/* 3. qidiruv */
const SR = {
  'roll-kaliforniya': ['роллы', 'ролл', 'roll', 'rol', 'rull', 'калифорния', 'kaliforniya', 'rolli'],
  'sushi-nigiri': ['суши', 'sushi', 'nigiri', 'нигири', 'суши лосось', 'nigiri losos'],
  'roll-filadelfiya': ['филадельфия', 'filadelfiya', 'philadelphia', 'ролл филадельфия'],
  'roll-pishirilgan': ['запечённый ролл', 'запеченный ролл', 'запечённые роллы', 'zapechenniy roll', 'pishirilgan roll', 'baked roll'],
  'roll-tempura': ['tempura', 'темпура', 'tempura roll'],
  'roll-maki-losos': ['maki', 'маки', 'maki losos', 'маки с лососем'],
  'maki-bodring': ['maki bodring', 'kappa maki', 'ролл с огурцом'],
  'roll-ugor': ['ugor', 'угорь', 'unagi', 'ilonbaliq', 'ролл с угрём'],
  'nigiri-tunets': ['nigiri tunets', 'нигири тунец', 'суши с тунцом', 'maguro'],
  'nigiri-ugor': ['nigiri ugor', 'нигири угорь', 'суши с угрём'],
  'sashimi-losos': ['sashimi', 'сашими', 'sashimi losos', 'сашими лосось'],
  'imbir-marinad': ['имбирь маринованный', 'imbir marinadi', 'marinadlangan imbir', 'gari', 'гари', 'pickled ginger'],
  vasabi: ['васаби', 'vasabi', 'wasabi'],
  'soya-sous': ['соевый соус', 'soya sousi', 'soy sauce', 'shoyu', 'соус соевый'],
  'kimbap-klassik': ['кимбап', 'kimbap', 'кимпаб', 'kimpab', 'gimbap', 'kimbab', 'кимбаб', 'гимбап', 'корейский ролл'],
  'kimbap-tunets': ['кимбап с тунцом', 'kimbap tunets', 'chamchi kimbap', 'кимбап тунец'],
  'kimbap-bulgogi': ['кимбап с говядиной', 'bulgogi kimbap', 'kimbap bulgogi', 'кимбап бульгоги'],
  beze: ['безе', 'меренга', 'meringue', 'beze', 'merenga', 'oq beze'],
  zefir: ['зефир', 'zefir', 'зефир белый']
};
let cnt = 0; for (const [id, qs] of Object.entries(SR)) for (const q of qs) { const r = S.search(foods, q, { limit: 5 }); assert.equal(r[0] && r[0].id, id, '«' + q + '» → ' + id + ' (bor: ' + r.map((x) => x.id).join(', ') + ')'); cnt++; }
assert.equal(S.search(foods, 'imbir', { limit: 3 })[0].id, 'zanjabil', '«imbir» — xom zanjabil (o\'zgarmadi)'); assert.equal(S.search(foods, 'lavash roll', { limit: 3 })[0].id, 'lavash-roll');
ok('Qidiruv: ' + cnt + ' ta sinonim (uz/ЎЗ/ru/en: суши, роллы, ролл, sushi, rol, rull, филадельфия, калифорния, запечённый ролл, maki, nigiri, кимбап, кимпаб, gimbap, kimbab, безе, меренга, meringue …) — to\'g\'ri taom BIRINCHI');
/* zefir va beze */
const zf = by.zefir; assert.deepEqual([zf.k, zf.p, zf.f, zf.c, U(zf, 'dona')], [330, 1, 0, 80, 35], 'zefir qiymati o\'zgarmagan'); assert.ok(!zf.bl && !zf.h);
for (const q of ['зефир', 'zefir']) { const r = S.search(foods, q, { limit: 10 }).map((f) => f.id); assert.deepEqual(r, ['zefir', 'choko-pie'], '«' + q + '» natijasi o\'zgarmagan: ' + r); }
for (const q of ['безе', 'beze', 'меренга']) { const r = S.search(foods, q, { limit: 10 }).map((f) => f.id); assert.deepEqual(r, ['beze'], q + ': faqat beze (zefir — «Balki»da)'); }
assert.deepEqual(by.beze.bl, ['zefir'], 'beze → Balki: zefir'); assert.ok(by[by.beze.bl[0]] && !by[by.beze.bl[0]].h);
ok('«зефир» natijasi o\'zgarmagan (zefir, choko-pie); «безе» → beze birinchi va yagona, zefir — «Balki» taklifida (beze.bl)');
/* 4. matn/ovoz/AI (parseText) */
const P = (q) => { const r = S.parseText(q, foods, {}); assert.deepEqual(r.missing, [], q + ': topilmagan qism'); return r.items.map((x) => [x.fid, x.unit, x.qty, Math.round(x.g)]); };
const PC = [['sushi set', [['sushi-nigiri', 'set', 1, 240]]], ['суши сет', [['sushi-nigiri', 'set', 1, 240]]], ['1 set филадельфия', [['roll-filadelfiya', 'set', 1, 240]]], ['2 сета калифорния', [['roll-kaliforniya', 'set', 2, 480]]], ['set roll', [['roll-kaliforniya', 'set', 1, 240]]],
  ['8 dona filadelfiya', [['roll-filadelfiya', 'dona', 8, 240]]], ['3 ta nigiri tunets', [['nigiri-tunets', 'dona', 3, 90]]], ['запеченный ролл 4 шт', [['roll-pishirilgan', 'dona', 4, 120]]], ['6 штук ролл с угрём', [['roll-ugor', 'dona', 6, 180]]],
  ['3 bolak kimbap', [['kimbap-klassik', 'bolak', 3, 60]]], ['3 кусочка кимбап', [['kimbap-klassik', 'bolak', 3, 60]]], ['кимбап с тунцом 2 кусочка', [['kimbap-tunets', 'bolak', 2, 40]]], ['100 g sashimi', [['sashimi-losos', 'g100', 100, 100]]],
  ['100 г безе', [['beze', 'g100', 100, 100]]], ['5 ta beze', [['beze', 'dona', 5, 50]]], ['1 qoshiq soya sousi', [['soya-sous', 'qoshiq', 1, 15]]], ['1 qoshiq imbir marinadi', [['imbir-marinad', 'qoshiq', 1, 15]]]];
for (const [q, w] of PC) assert.deepEqual(P(q), w, q);
const b2 = S.parseText('2 kichik beze', foods, {}).items[0]; assert.ok(b2.fid === 'beze' && b2.unit === 'dona_s' && b2.g === 10, 'kichik beze: ' + JSON.stringify([b2.unit, b2.g])); const b3 = S.parseText('3 katta beze', foods, {}).items[0]; assert.ok(b3.unit === 'dona_l' && b3.g === 45, 'katta beze: ' + b3.unit + ' ' + b3.g);
assert.deepEqual(P('kombo set').length, 1, '«set» faqat «set» birligi bor taomda birlik bo\'ladi');          // set birligi yo'q taomda — oddiy qidiruv
ok('Matn/ovoz/AI: ' + PC.length + ' ibora (sushi set → 1 set 240 g, «3 кусочка кимбап» → 3 bo\'lak, 2 kichik beze 10 g, 3 katta beze 45 g, «100 г безе» …)');
/* 5. ikonka rejasi */
const plan = fs.readFileSync(path.join(__dirname, '..', 'data/ikonka-reja.txt'), 'utf8'); for (const id of NEW) assert.ok(new RegExp('\\|' + id + '\\s*$', 'm').test(plan), id + ': ikonka rejasida yo\'q');
assert.ok(!/\b(pork|ham|bacon|hand|finger)\b/i.test(plan.split('# v108')[1] || ''), 'v108 ikonka tavsifida cho\'chqa/qo\'l yo\'q');
ok('Ikonka rejasi: ' + NEW.length + ' ta yangi taom rejada (cho\'chqa/qo\'l so\'zlari yo\'q)');
/* jadval (hisobot uchun) */
for (const id of ['sushi-nigiri', 'nigiri-tunets', 'nigiri-ugor', 'roll-filadelfiya', 'roll-kaliforniya', 'roll-maki-losos', 'maki-bodring', 'roll-ugor', 'roll-tempura', 'roll-pishirilgan', 'kimbap-klassik', 'kimbap-tunets', 'kimbap-bulgogi', 'beze']) { const f = by[id]; console.log('  ' + id.padEnd(17), String(f.k).padStart(4), 'kkal/100 g |', f.u.filter((u) => u[0] !== 'g100').map((u) => u[0] + ' ' + u[1] + ' g = ' + Math.round(f.k * u[1] / 100) + ' kkal').join(' · ')); }
console.log('sushi: ' + n + ' guruh OK');
