/* v52: admin «topilmagan so'zlar» (production, 2026-10-26 gacha — 53 ta) — tuzatishdan keyin TOPILADI (regression).
 * Telefonda o'zbek lotin yozuvi normalizatsiyasi (w = sh, yolg'iz c = ch, ruscha so'zlarning lotin yozuvi), ko'p taomli uzun qator (son + birlik chegarasi), bazaga qo'shilganlar.
 * Aniq moslik birinchi (v34 tartibi) buzilmagani — test-qidiruv-sifat. Topilmaydiganlar (TOPILMAYDI) — sababi bilan; ular ham ataylab tekshiriladi (o'zgarsa — ro'yxatni yangilang).
 *   node tools/test-qidiruv-topilmadi.js */
'use strict';
const assert = require('assert'); const S = require('../assets/kalkifit-core.js'); const foods = S.buildIndex(S.normFoods(require('../data/ovqatlar.json').foods));
const SOZ = ["150gram olma sirkasi 1owqowiqda asal bn", "1kosa sariyog'li sut 1bo'lak non", "1ta tuxum qaynagan", "2 qovurilgan tuxum", "2 ta mandarin", "2 tuxum", "4kesim non", "4kesim non 2piyola", "4kesim non 2piyola coy", "4kesim non 2piyola qora coy", "4kesim non 2piyola qora coy 50dona uzum", "fuse", "fuse tea", "g'ilak", "kepak non", "kurasan 3dona choy 30pml sasiska 2dona", "lotus", "malokoli", "molokoli pecheniya", "ow1kosa", "pirashki", "sut 200gr qora va kok quruq", "sutlickofe", "teftel", "tovuq file soya", "yarimta non", "yarimta non 50 gram qaymoq", "булочка с шоколадной начинкой", "булочка с шоколадной начинкой 150 г", "булочка с шоколадной начинкой 200 г", "булочка с шоколадом 150 г", "бургеров и 100 порций фри", "какао порошок", "какао порошок 6 г", "котлета по киевски с сыром 110 г", "молоко пастеризованное", "молоко пастеризованное 200 г", "отруби", "отруби 20 г", "отруби 30 г", "рис вареный 100 г", "рис вареный 90 г", "суп 5 злаков", "суп из", "суп из перловки, фасоли", "суп из перловки, фасоли, маша", "суп из перловки, фасоли, маша, мяса", "суп из фасоли", "суп из фасоли и мяса", "суп из фасоли, перловки, мяса", "цезарь", "яйца жареные без масла", "яйца жареные без масла 200 г"];
const TOPILMAYDI = {          // so'z → sabab (bazada yo'q yoki ma'nosi noaniq — foydalanuvchi AI bilan qo'shadi)
  "g'ilak": "ma'nosi aniqlanmadi (mahalliy nom?) — bazaga qo'shilmadi",
};
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const found = (q) => { const r = S.parseText(q, foods, {}); return r.items.length && !r.missing.length ? r.items : null; };
/* 1. har bir so'z */
const miss = SOZ.filter((q) => !TOPILMAYDI[q] && !found(q)); assert.deepEqual(miss, [], 'topilmadi: ' + miss.join(' | '));
const still = Object.keys(TOPILMAYDI).filter((q) => found(q)); assert.deepEqual(still, [], 'endi topiladi — TOPILMAYDI ro\'yxatidan olib tashlang: ' + still.join(' | '));
ok((SOZ.length - Object.keys(TOPILMAYDI).length) + '/' + SOZ.length + ' so\'z topiladi; ' + Object.keys(TOPILMAYDI).length + ' tasi — sababi bilan (bazada yo\'q / noaniq)');
/* 2. aniq natijalar (to'g'ri taom va miqdor) */
const one = (q) => { const it = found(q); assert.ok(it, q); return it.map((x) => x.fid + (x.vr ? ':' + x.vr : '') + ' ' + x.unit + '×' + x.qty + ' ' + Math.round(x.g) + 'g').join(' + '); };
const E = {
  '4kesim non 2piyola qora coy 50dona uzum': 'non:buxanka tilim×4 120g + choy:shakarsiz piyola×2 400g + uzum dona×50 250g',
  'kurasan 3dona choy 30pml sasiska 2dona': null, 'ow1kosa': null, 'fuse tea': null, 'lotus': null, 'molokoli pecheniya': null, 'malokoli': null, 'kepak non': null, 'цезарь': null, '150gram olma sirkasi 1owqowiqda asal bn': null
};
const ID = { 'kurasan 3dona choy 30pml sasiska 2dona': ['kruassan', 'choy', 'sosiska'], 'ow1kosa': ['osh'], 'fuse tea': ['fuze-tea'], 'lotus': ['lotus-biscoff'], 'molokoli pecheniya': ['pechenye-molochnoe'], 'malokoli': ['pechenye-molochnoe'], 'kepak non': ['kepak-non'], 'цезарь': ['sezar-salat'], '150gram olma sirkasi 1owqowiqda asal bn': ['olma-sirka', 'asal'] };
for (const q in E) { if (E[q]) assert.equal(one(q), E[q], q); else assert.deepEqual(found(q).map((x) => x.fid), ID[q], q); }
assert.equal(found('kurasan 3dona choy 30pml sasiska 2dona')[0].qty, 3); assert.equal(found('kurasan 3dona choy 30pml sasiska 2dona')[2].qty, 2); assert.equal(Math.round(found('150gram olma sirkasi 1owqowiqda asal bn')[0].g), 150);
ok('ko\'p taomli qator son + birlik chegarasida: «4kesim non 2piyola qora coy 50dona uzum» → 4 tilim oq non + 2 piyola choy + 50 dona uzum (250 g); «kurasan 3dona choy 30pml sasiska 2dona» → 3 kruassan + choy + 2 sosiska');
/* 3. imlo normalizatsiyasi (aniq natija bo'lmasa) */
const first = (q) => (S.search(foods, q, { limit: 1 })[0] || {}).i;
const NORM = { coy: 'choy', ow: 'osh', sasiska: 'sosiska', sosiska: 'sosiska', gilos: 'gilos', "g'ilos": 'gilos', kurasan: 'kruassan', kruasan: 'kruassan', kruassan: 'kruassan', pecheniya: 'pechenye', pechenye: 'pechenye', molokoli: 'pechenye-molochnoe', 'qora coy': 'choy', waffle: 'vafli-belgiya', wings: 'tovuq-qanot' };
for (const q in NORM) assert.equal(first(q), NORM[q], q + ' → ' + NORM[q] + ' (topildi: ' + first(q) + ')');
ok('normalizatsiya: coy → choy, ow → osh, sasiska → sosiska, gilos/g\'ilos, kurasan/kruasan → kruassan, pecheniya → pechenye, molokoli → sutli pechenye; inglizcha nom (waffle, wings) buzilmaydi');
/* 4. aniq moslik birinchi (v34) */
const EX = { choy: 'choy', osh: 'osh', non: 'non', sut: 'sut', 'oq non': 'non', kola: 'kola', tuxum: 'tuxum' };
for (const q in EX) assert.equal(first(q), EX[q], q);
ok('aniq moslik birinchi o\'rinda qoladi (choy, osh, non, sut, kola, tuxum)');
console.log('qidiruv-topilmadi: ' + n + ' guruh OK');
