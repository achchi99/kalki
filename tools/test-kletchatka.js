/* v102: KLETCHATKA va makro qoidalari.
 *  1) har bir taomda «fb» maydoni bor: son (g/100 g, manbali — fbs: u USDA · y yorliq · r hisob · t tarkibi bo'yicha 0) yoki null (NOMA'LUM — 0 emas); oila kombinatsiyalarida ham;
 *  2) mantiq: sof go'sht/baliq/tuxum, sut mahsulotlari, yog'lar ≈ 0; kletchatka ≤ uglevod (USDA/hisob); to'liq donli non > oq non; xom yorma > pishgan; qamrov ≥ 85 %;
 *  3) me'yor: 14 g / 1000 kkal, kamida 25 g; kunlik yig'indi «noma'lum» taomlarni sanaydi (≈); oila varianti kletchatkasi;
 *  4) oqsil maqsaddan oshsa — «bajarildi» (yog'/uglevod — «ko'p»); > 2,5 g/kg — yumshoq ma'lumot; TEF bonusi = oqsil × 4 × 0,15 (faqat ma'lumot);
 *  5) maslahatchi: kletchatka kam bo'lsa kechqurun «g» qoidasi (uz/ru × hazil/jiddiy, aniq taomlar bilan).   node tools/test-kletchatka.js */
'use strict';
const assert = require('assert'); const S = require('../assets/kalkifit-core.js'); const MS = require('../assets/kalkifit-maslahat.js');
const KT = require('../assets/kalkifit-tavsiya.js'); const all = S.normFoods(require('../data/ovqatlar.json').foods); KT.init(S.buildIndex(all)); const foods = all.filter((f) => !f.h); const by = Object.fromEntries(all.map((f) => [f.id, f]));
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. maydon */
const noKey = all.filter((f) => !('fb' in f)); assert.deepEqual(noKey.map((f) => f.id), [], 'fb maydoni yo\'q');
const badV = all.filter((f) => f.fb != null && !(typeof f.fb === 'number' && f.fb >= 0 && f.fb <= 50)); assert.deepEqual(badV.map((f) => f.id + '=' + f.fb), [], 'fb oralig\'i 0–50');
const badS = all.filter((f) => (f.fb != null) !== !!f.fbs || (f.fbs && !/^[uyrt]$/.test(f.fbs))); assert.deepEqual(badS.map((f) => f.id), [], 'fbs: son bo\'lsa manba (u/y/r/t), null bo\'lsa yo\'q');
let famN = 0; for (const f of all) if (f.fam) for (const [v, g] of Object.entries(f.fam.g)) { famN++; assert.ok('fb' in g, f.id + '.' + v + ': fb yo\'q'); }
const known = foods.filter((f) => f.fb != null).length, unk = foods.length - known, src = { u: 0, y: 0, r: 0, t: 0 }; foods.forEach((f) => { if (f.fbs) src[f.fbs]++; });
assert.ok(known / foods.length >= 0.85, 'qamrov ' + Math.round(known / foods.length * 100) + ' %');
ok('Har taomda «fb» (' + all.length + ' ta, ' + famN + ' oila kombinatsiyasi): ko\'rinadigan ' + foods.length + ' — manbali ' + known + ' (USDA ' + src.u + ', yorliq ' + src.y + ', hisob ' + src.r + ', tarkibi bo\'yicha 0 — ' + src.t + '), noma\'lum ' + unk);
/* 2. mantiq */
const zero = foods.filter((f) => f.fb != null && ((f.t === 'm' && /^(mol-gosht|qoy-gosht|tovuq-kokrak|tovuq-son|losos|treska|tuxum|mol-qiyma|qoy-qiyma|kurka)(-xom)?$/.test(f.id)) || /^(sut|kefir|qatiq|tvorog\d*|smetana|qaymoq|sariyog|pishloq|yog|zaytun-yogi)$/.test(f.id)) && f.fb > 0.5);
assert.deepEqual(zero.map((f) => f.id + '=' + f.fb), [], 'go\'sht, sut, yog\' ≈ 0');
const overC = foods.filter((f) => f.fb != null && /^[ur]$/.test(f.fbs) && f.fb > f.c + 0.6); assert.deepEqual(overC.map((f) => f.id + ' fb ' + f.fb + ' > c ' + f.c), [], 'kletchatka ≤ uglevod (USDA/hisob)');
const gt = (a, b) => { assert.ok(by[a].fb != null && by[b].fb != null && by[a].fb > by[b].fb, a + ' (' + by[a].fb + ') > ' + b + ' (' + by[b].fb + ')'); };
gt('non-bugdoy', 'non-oq'); gt('grechka-xom', 'grechka'); gt('loviya', 'guruch'); gt('olma', 'sharbat-olma'); gt('yongoq', 'banan');
ok('Mantiq: sof go\'sht/sut/yog\' ≈ 0; kletchatka ≤ uglevod; to\'liq donli > oq non, xom grechka > pishgan, loviya > guruch, olma > olma sharbati');
/* 3. me'yor va kunlik yig'indi */
assert.equal(S.fiberGoal(1500), 25); assert.equal(S.fiberGoal(2000), 28); assert.equal(S.fiberGoal(2500), 35); assert.equal(S.fiberGoal(0), 25);
const look = (id, vr) => { const f = by[id]; if (!f) return null; if (f.fam) return S.famVariant(f, S.famSelOf(f, vr)); return f; };
let r = S.fiberDay([{ fid: 'olma', g: 200 }, { fid: 'loviya', g: 100 }, { name: 'AI taom', g: 300, kcal: 400 }], look);
assert.equal(r.g, Math.round((by.olma.fb * 2 + by.loviya.fb) * 10) / 10); assert.equal(r.unk, 1); assert.equal(r.n, 3);
r = S.fiberDay([{ fid: 'non', vr: 'patir', g: 100 }], look); assert.equal(r.unk, 0); assert.equal(r.g, S.famVariant(by.non, S.famSelOf(by.non, 'patir')).fb);
assert.equal(S.fiberDay([], look).g, 0);
ok('Me\'yor max(25, 14 g/1000 kkal): 1500 → 25, 2000 → 28, 2500 → 35; kunlik yig\'indi — noma\'lum taom (AI) sanaladi (≈), oila varianti (patir) o\'z kletchatkasi bilan');
/* 4. oqsil holati, TEF */
assert.equal(MS.holat(130, 100, 'p'), 'bajarildi'); assert.equal(MS.holat(160, 100, 'p'), 'bajarildi'); assert.equal(MS.holat(100, 100, 'p'), 'bajarildi'); assert.equal(MS.holat(90, 100, 'p'), 'deyarli'); assert.equal(MS.holat(50, 100, 'p'), 'kam');
assert.equal(MS.holat(130, 100, 'f'), 'oshdi'); assert.equal(MS.holat(130, 100, 'c'), 'oshdi'); assert.equal(MS.holat(130, 100), 'oshdi');
const mk = MS.makro({ p: 180, f: 90, c: 400 }, { p: 120, f: 60, c: 300 }); assert.equal(mk.p.st, 'bajarildi'); assert.equal(mk.f.st, 'oshdi'); assert.equal(mk.c.st, 'oshdi');
assert.equal(MS.oqsilYuqori(220, 80), true); assert.equal(MS.oqsilYuqori(190, 80), false);
assert.equal(S.tefBonus(100), 60); assert.equal(S.tefBonus(0), 0); assert.equal(S.tefBonus(150), 90);
ok('Oqsil 100–160 % — «bajarildi» (yashil ✓), yog\'/uglevod 130 % — «ko\'p»; > 2,5 g/kg — yumshoq ma\'lumot; TEF bonusi = oqsil × 4 × 0,15 (100 g → +60 kkal)');
/* 5. maslahatchi */
const ctx = (o) => Object.assign({ tot: { kcal: 1500, p: 100, f: 50, c: 180 }, goals: { p: 110, f: 60, c: 220 }, limit: 1900, floor: 1200, hour: 20, foods: [{ fid: 'osh' }, { fid: 'non' }, { fid: 'choy' }], mode: 'jiddiy', shown: [], dismissed: [] }, o);
let q = MS.qoida(ctx({ fb: { g: 8, goal: 28, unk: 0, n: 3, top: 'grechka, loviya, olma' } })); assert.equal(q && q.id, 'g', 'kechqurun kletchatka kam — «g»');
assert.equal((MS.qoida(ctx({ hour: 12, fb: { g: 8, goal: 28, unk: 0, n: 3, top: 'x' } })) || {}).id === 'g', false, 'kunduzi aytilmaydi');
assert.equal((MS.qoida(ctx({ fb: { g: 8, goal: 28, unk: 2, n: 3, top: 'x' } })) || {}).id === 'g', false, 'noma\'lum taomlar ko\'p — aytilmaydi');
assert.equal((MS.qoida(ctx({ fb: { g: 25, goal: 28, unk: 0, n: 3, top: 'x' } })) || {}).id === 'g', false, 'yetarli — aytilmaydi');
for (const L of ['uz', 'ru']) for (const m of ['hazil', 'jiddiy']) for (let i = 0; i < 5; i++) { const t = MS.matn(q, L, m, i); assert.ok(t.t && t.b, L + m + i); assert.ok(!/[{}]/.test(t.t + t.b), 'to\'ldirilmagan: ' + t.b); const op = KT.opts('B', 20, L, { seed: i + 3, n: 2 }); assert.ok(!op.generic && t.b.toLowerCase().includes(op.first.toLowerCase()) && /20/.test(t.b), L + ' ' + m + ': ' + t.b); assert.ok(!/halol|ҳалол/i.test(t.b)); }
/* v106: aniq taom va gramm — farqdan hisoblangan (kalkifit-tavsiya.js), 80–150 % */
ok('Maslahatchi: kechqurun kletchatka me\'yorning 60 % idan kam bo\'lsa «g» qoidasi (uz/ru × hazil/jiddiy × 5 variant, aniq taomlar va gramm bilan); kunduzi, noma\'lum ko\'p yoki yetarli bo\'lsa — yo\'q');
console.log('kletchatka: ' + n + ' guruh OK');
