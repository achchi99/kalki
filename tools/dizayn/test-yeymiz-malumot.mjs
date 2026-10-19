// «Bugun nima yeymiz?» 1-bosqich (ma'lumot): Yemaydiganlarim teglari, kafe/choyxona porsiyalari, uyda baliq retseptlari, yetkazish havolalari.   node tools/dizayn/test-yeymiz-malumot.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const rd = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const C = require(path.join(ROOT, 'assets/cheklov-core.js')), GEN = require(path.join(ROOT, 'tools/cheklov-teglar.js')), BU = require(path.join(ROOT, 'assets/baliq-uy-core.js')), BG = require(path.join(ROOT, 'tools/baliq-uy-yasa.js'));
const OR = require(path.join(ROOT, 'assets/orinbosar-core.js')), YC = require(path.join(ROOT, 'assets/yeymiz-core.js')), YD = rd('data/yeymiz.json'), OQT = rd('data/oqsil-manba.json'), TABLE = rd('data/orinbosar.json');
const D = rd('data/cheklov-teglar.json'), foods = rd('data/ovqatlar.json').foods, OQ = rd('data/oqsil-manba.json'), BUJ = rd('data/baliq-uy.json'), P = rd('assets/partners.json');
const by = Object.fromEntries(foods.map((f) => [f.i, f])); let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. cheklov teglari */
assert.deepEqual(GEN.hammasi().out, D.taom, 'data/cheklov-teglar.json eskirgan: node tools/cheklov-teglar.js --yoz');
for (const f of foods) { assert.ok(Array.isArray(D.taom[f.i]), f.i + ': teg yo\'q'); if (f.fam) for (const v of Object.keys(f.fam.g)) assert.ok(Array.isArray(D.taom[f.i + '#' + v]), f.i + '#' + v + ': teg yo\'q'); }
for (const k of Object.keys(OQ.taom)) assert.ok(D.taom[k], k + ': cheklov tegi yo\'q (oqsil-manba bilan bir xil kalitlar)');
const has = (k, t) => assert.ok(D.taom[k].includes(t), k + ' → ' + t); for (const k of ['sazan-grill', 'baliq-shurva', 'kafe-losos-steyk', 'kafe-baliq-shashlik']) has(k, 'baliq');
has('qoymoq', 'tuxum'); has('omlet-sabzavot', 'tuxum'); has('qatiq-salat', 'sut'); has('bekon', 'choshqa'); has('kolbasa', 'choshqa'); has('baget', 'glyuten');
log('teglar: ' + Object.keys(D.taom).length + ' kalit (taom + oila kombinatsiyasi), generator bilan mos');
/* 2. cho'chqa HECH QACHON; tanlov bo'sh bo'lsa ham */
const kal = Object.keys(D.taom); const bosh = C.filtr(D, kal, []);
for (const k of bosh) assert.ok(!D.taom[k].includes('choshqa'), k + ': cho\'chqa taklif qilinmoqda'); assert.ok(!bosh.includes('bekon'));
const ch = kal.filter((k) => D.taom[k].includes('choshqa')); assert.ok(ch.length >= 8, 'cho\'chqali taomlar: ' + ch.length); log('cho\'chqa: ' + ch.length + ' kalit har qanday tanlovda yashirin (' + ch.slice(0, 6).join(', ') + '…)');
/* 3. baliq yemaydigan: baliq hech qayerda */
const nb = C.filtr(D, kal, ['baliq']); for (const k of nb) assert.ok(!D.taom[k].includes('baliq'), k + ': baliq qoldi'); for (const k of ['sazan-grill', 'sazan-qovurma', 'baliq-dimlama', 'kafe-sazan-qovurma', 'kafe-losos-steyk', 'sazan-duxovka', 'kafe-baliq-shurva']) assert.ok(!nb.includes(k), k);
assert.ok(nb.includes('osh') && nb.includes('kafe-kabob')); assert.ok(!C.ruxsat(D, 'noma\'lum-taom', []), 'noma\'lum taom taklif qilinmaydi'); assert.ok(!C.ruxsat(D, 'qoymoq', ['tuxum']) && C.ruxsat(D, 'qoymoq', ['baliq']));
for (const t of C.TEGLAR) { const f = C.filtr(D, kal, [t]); assert.ok(f.length > 0 && f.length <= bosh.length, t); for (const k of f) assert.ok(!D.taom[k].includes(t), k + ' / ' + t); }
log('har bir cheklov (baliq, tuxum, sut, yong\'oq, glyuten) filtrdan keyin shu tegli taom qolmaydi; noma\'lum taom taklif qilinmaydi');
/* 4. kafe / choyxona taomlari: manba, ogohlantirish, ±15% */
const KAFE = foods.filter((f) => f.kf); assert.equal(KAFE.length, 10, 'kafe taomlari');
for (const f of KAFE) { assert.ok(f.rc && f.x === 1, f.i + ': retsept + taxminiy'); assert.ok(/fdc_id \d{6}|Скурихин/.test(f.ms.u), f.i + ': manba'); assert.ok(/Kafe\/choyxona porsiyasi — taxminiy, joyga qarab farq qiladi/.test(f.ms.u) && /Порция кафе\/чайханы|кафе\/чайхан/i.test(f.ms.r), f.i + ': kafe izohi UZ/RU'); assert.ok(f.u.some((u) => u[0] !== 'g100'), f.i + ': porsiya birligi'); const kc = f.p * 4 + f.f * 9 + f.c * 4; assert.ok(Math.abs(kc - f.k) / f.k <= 0.15, f.i + ': Atwater ±15% ' + kc + ' vs ' + f.k); }
assert.ok(!foods.filter((f) => !f.kf).some((f) => /Kafe\/choyxona porsiyasi/.test((f.ms || {}).u || '')), 'kafe izohi faqat kafe taomlarida');
log('kafe/choyxona: ' + KAFE.length + ' taom — hammasida manba (USDA/Скурихин), «taxminiy, joyga qarab farq qiladi» izohi (UZ/RU), ±15%');
/* 5. uyda baliq retseptlari */
const regen = BG.yasa(); assert.deepEqual(regen, BUJ.retseptlar, 'data/baliq-uy.json eskirgan: node tools/baliq-uy-yasa.js --yoz'); assert.equal(BUJ.retseptlar.length, 3);
for (const r of BUJ.retseptlar) { assert.ok(by[r.taom], r.taom + ': bazada'); assert.ok(r.qadamlar.uz.length >= 5 && r.qadamlar.uz.length <= 7 && r.qadamlar.ru.length === r.qadamlar.uz.length, r.id + ': 5–7 qadam UZ/RU'); assert.ok(r.nom.uz && r.nom.ru && r.vaqt.uz && r.vaqt.ru); assert.ok(r.masalliq[0].m === 'sazan' && r.masalliq[0].g1 === 250); assert.ok(!D.taom[r.taom] || D.taom[r.taom].includes('baliq'), r.id + ': baliq tegi'); }
const dux = BUJ.retseptlar.find((r) => r.id === 'duxovka'); const m1 = BU.masalliq(dux, 1, 'uz'), m4 = BU.masalliq(dux, 4, 'uz'); assert.equal(m1[0].miqdor, 250); assert.equal(m4[0].miqdor, 1000);
for (let i = 0; i < m1.length; i++) { if (m1[i].birlik === 'g' && m1[i].miqdor >= 20) assert.ok(Math.abs(m4[i].miqdor - 4 * m1[i].miqdor) <= 10, m1[i].n); }
assert.equal(BU.kishiOk(0), 4); assert.equal(BU.kishiOk(9), 4); assert.equal(BU.kishiOk(8), 8); const ls = BU.royxat(dux, 4, 'ru'); assert.ok(/4 чел\./.test(ls) && /Карп — 1000 г/.test(ls) && /Лимон — 1 шт/.test(ls)); assert.ok(/¼ dona/.test(BU.royxat(BUJ.retseptlar[0], 1, 'uz')));
log('uyda baliq: 3 retsept (tovada, duxovka, gril), 5–7 qadam UZ/RU; 1 → 4 kishi: sazan 250 → 1000 g; xarid ro\'yxati (UZ/RU)');
/* 6. yetkazish havolalari: partners.json */
const Y = P.partners.filter((p) => p.categories.includes('yetkazish')); assert.ok(Y.length >= 1); assert.ok(P.fallback.yetkazish);
for (const p of Y) { assert.match(p.url, /^https:\/\//); assert.equal(p.type, 'organic'); assert.equal(p.append_utm, false, 'UTM hozircha yo\'q (hamkor maydoni bo\'sh)'); }
const act = Y.filter((p) => p.active !== false); assert.ok(act.length >= 1 && act.every((p) => p.tekshiruv && /ochiladi/.test(p.tekshiruv)), 'faqat tekshirilgan havola faol'); assert.ok(Y.filter((p) => p.active === false).every((p) => /tekshirilmagan|qo'shilgan/.test(p.tekshiruv)));
const pj = fs.readFileSync(path.join(ROOT, 'assets/partners.js'), 'utf8'); assert.ok(/noopener/.test(pj), 'partners.js: rel noopener');
log('yetkazish: faol ' + act.map((p) => p.id).join(', ') + '; nofaol (telefonda tekshirilmagan) ' + Y.filter((p) => p.active === false).map((p) => p.id).join(', '));
/* 7. data/yeymiz.json: guruhlar butunligi; yeymiz-core: cheklov, sig'im, tartib */
const by2 = OR.index(foods); assert.deepEqual(Object.keys(YD.guruh), ['kabob', 'suyuq', 'tandir', 'tez']);
for (const [g, l] of Object.entries(YD.guruh)) { assert.ok(l.length >= 6, g); for (const k of l) { assert.ok(OR.valuesOf(by2, k), g + ': taom yo\'q ' + k); assert.ok(D.taom[k], k + ': cheklov tegi yo\'q'); } } for (const [g, k] of Object.entries(YD.birinchi)) assert.ok(YD.guruh[g].includes(k));
for (const k of YD.baliq.kafe) { assert.ok(by2[k] && by2[k].kf, k); assert.ok(D.taom[k].includes('baliq'), k + ': baliq tegi'); } assert.deepEqual(YD.baliq.uyda, BUJ.retseptlar.map((r) => r.id)); assert.equal(YD.kun.nomlar.uz.length, 7); assert.equal(YD.kun.nomlar.ru.length, 7);
const sg = (chip, yemaydi, qoldiq) => YC.suggest({ by: by2, data: YD, chip, tags: OQT, cheklov: D, yemaydi, qoldiq });
const r0 = sg('kabob', [], null); assert.equal(r0.items.length, 3); assert.equal(r0.items[0].key, 'kafe-tovuq-shashlik', 'kabob: choyxona tovuq shashlik birinchi'); assert.ok(r0.items[0].kafe && r0.items[0].g === 180 && r0.items[0].k > 300);
let kombo = 0; for (let m = 0; m < 32; m++) { const ye = ['baliq', 'tuxum', 'sut', 'yongoq', 'glyuten'].filter((t, i) => (m >> i) & 1); for (const chip of Object.keys(YD.guruh)) { const r = sg(chip, ye, 600); assert.ok(r.items.length <= 3); for (const it of r.items) for (const t of D.taom[it.key]) assert.ok(t !== 'choshqa' && !ye.includes(t), chip + ' / ' + ye + ' → ' + it.key + ' (' + t + ')'); kombo++; } }
log('yeymiz.json: guruhlar (4 chip × ≥6 taom) bazada va cheklov tegli; yeymiz-core: ' + kombo + ' kombinatsiya (32 cheklov to\'plami × 4 chip) — taklifda cheklangan teg ham, cho\'chqa ham yo\'q; kabob: choyxona tovuq shashlik birinchi');
const rs = sg('suyuq', [], 250); for (const it of rs.items) assert.ok(it.k <= 250 * 1.05 + 30 || !rs.sigdi, it.key); const rlow = sg('kabob', [], 160); assert.ok(rlow.items.length >= 1 && rlow.sigdi === false, 'qolgan kkal kam: eng yengillar, «sig\'masligi mumkin» belgisi');
const SRC = { by: by2, data: YD, key: 'shashlik#gosht', portion: { u: 'porsiya', g: 200, n: 1 }, table: TABLE, tags: OQT, cheklov: D, yemaydi: [] };
const vo = YC.variants(Object.assign({ filtr: 'oqsil' }, SRC)), vk = YC.variants(Object.assign({ filtr: 'kam' }, SRC)), vt = YC.variants(Object.assign({ filtr: 'tam' }, SRC)); assert.equal(vo[0].key, 'kafe-tovuq-shashlik', 'kabob: choyxona tovuq shashlik birinchi'); for (const v of vo) assert.ok(v.dp >= 2, 'oqsil ko\'proq: ' + v.key); for (const v of vk) assert.ok(v.dk <= -40, 'kaloriya kamroq: ' + v.key); for (const v of vt) assert.notEqual(v.teg, 'qizil', 'boshqa ta\'m: ' + v.key); assert.ok(vo.length >= 3 && vk.length >= 3 && vt.length >= 3);
const vb = YC.variants(Object.assign({}, SRC, { yemaydi: ['baliq'], filtr: 'oqsil' })).concat(YC.variants(Object.assign({}, SRC, { yemaydi: ['baliq'], filtr: 'tam' }))); assert.ok(vb.length > 0 && vb.every((v) => !D.taom[v.key].includes('baliq')), 'Boshqa variantlar: baliq yemaydiganga baliq yo\'q');
const kz = YC.baliqKafe({ by: by2, data: YD, cheklov: D, yemaydi: [] }); assert.equal(kz.length, 4); assert.ok(kz.every((p) => p.kafe)); assert.equal(YC.baliqKafe({ by: by2, data: YD, cheklov: D, yemaydi: ['baliq'] }).length, 0); assert.equal(YC.baliqKunOchiq([]), true); assert.equal(YC.baliqKunOchiq(['baliq']), false); assert.equal(YC.kunOk(9), 3); assert.equal(YC.kunOk(0), 0);
log('Boshqa variantlar: filtrlar to\'g\'ri (Oqsili ko\'proq dp≥2 · Kaloriyasi kamroq dk≤−40 · Boshqa ta\'m — boshqa manba), kabobda choyxona tovuq shashlik birinchi, baliq yemaydiganga baliq yo\'q; Baliq kuni: 4 kafe taomi, baliq yemaydiganga 0');
console.log('\n' + n + ' ta tekshiruv o\'tdi');
