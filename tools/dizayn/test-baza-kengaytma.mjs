// Bazani kengaytirish (tools/ovqatlar-kengaytma.js + 11 milliy retsept): manba har yozuvda, qiymat manbadan (USDA FDC / yorliq / aralashma), Atwater ±15%,
// uch til (lotin nom, RU nom, kirill — translit), sinonimlar, qidiruv (мороженое, курут, печень, кола, протеиновый батончик), tuzatilgan nomlar.   node tools/dizayn/test-baza-kengaytma.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), K = require(path.join(ROOT, 'tools/ovqatlar-kengaytma.js'));
const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')), A = J.foods, by = Object.fromEntries(A.map((f) => [f.i, f]));
const USDA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/manba/usda-sr-legacy.json'), 'utf8')).foods;
const YQ = fs.existsSync(path.join(ROOT, 'data/manba/yorliq.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'data/manba/yorliq.json'), 'utf8')).yorliq : {};
const MILLIY = ['tuxum-barak', 'hasip', 'kesma', 'unash', 'jigar-qovurma', 'mampar', 'shivit-oshi', 'kok-chuchvara', 'yupqa', 'goshtli-non', 'kartoshka-qovurma'];
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const yangi = K.filter((r) => by[r[0]]).map((r) => ({ r, f: by[r[0]] })), milliy = MILLIY.map((i) => by[i]);
/* 1. soni */
assert.ok(milliy.every(Boolean), 'milliy retsept taomlar bazada');
assert.ok(yangi.length + milliy.length >= 300, 'kamida 300 yangi taom: ' + (yangi.length + milliy.length));
const tur = {}; yangi.forEach(({ f }) => { tur[f.t] = (tur[f.t] || 0) + 1; });
log('Yangi taomlar: ' + (yangi.length + milliy.length) + ' (kengaytma ' + yangi.length + ' + milliy retsept ' + milliy.length + '); tur bo\'yicha ' + JSON.stringify(tur));
/* 2. manba va qiymat manbadan */
for (const { r, f } of yangi) {
  const src = r[6]; assert.ok(f.ms && f.ms.u && f.ms.r && f.ms.u.length > 30, f.i + ': manba bayoni'); assert.ok(f.m, f.i + ': m');
  if (src.startsWith('u:')) { const U = USDA[src.slice(2)]; assert.ok(U, f.i + ': USDA id saqlangan'); assert.equal(f.k, Math.round(U.kcal), f.i + ': kkal = USDA'); assert.ok(Math.abs(f.p - U.p) < 0.06 && Math.abs(f.f - U.f) < 0.06, f.i + ': makro = USDA'); assert.match(f.ms.u, new RegExp('fdc_id ' + src.slice(2))); assert.equal(f.e, 0); }
  else if (src.startsWith('y:')) { const L = YQ[src.slice(2)]; assert.ok(L && L.code, f.i + ': yorliq'); assert.equal(f.k, Math.round(L.k)); assert.match(f.ms.u, /yorlig'i bo'yicha.*shtrix-kod \d+/); assert.match(f.ms.r, /По этикетке/); assert.equal(f.e, 0); }
  else { assert.ok(src.startsWith('m:')); assert.equal(f.e, 1, f.i + ': aralashma — taxminiy'); assert.match(f.ms.u, /Hisob \(taxminiy/); }
  const atw = 4 * f.p + 9 * f.f + 4 * f.c; assert.ok(Math.abs(atw - f.k) <= Math.max(15, f.k * 0.15), f.i + ': Atwater ' + f.k + ' vs ' + Math.round(atw));
  assert.ok(f.k >= 0 && f.k <= 900 && f.p >= 0 && f.f >= 0 && f.c >= 0, f.i + ': oraliq');
  if (f.t === 'm' && /(go'sht|jigar|buyrak|yurak|til|qorin|miya|o'pka|kotlet)/i.test(f.n) && src.startsWith('u:')) assert.match(USDA[src.slice(2)].d, /cooked|roasted|braised|simmered|fried|broiled|dried|cured|jerky|meatballs/i, f.i + ': go\'sht — pishgan (cooked) qiymat');
}
for (const f of milliy) { assert.ok(f.rc && f.ms && f.ms.u, f.i + ': retsept manbasi'); assert.equal(f.x, 1, f.i + ': taxminiy'); const atw = 4 * f.p + 9 * f.f + 4 * f.c; assert.ok(Math.abs(atw - f.k) <= Math.max(15, f.k * 0.15), f.i + ': Atwater'); }
log('Har yozuvda manba: USDA fdc_id (qiymat aynan USDA, go\'sht — pishgan) · yorliq (Open Food Facts shtrix-kodi) · aralashma («taxminiy»); milliy — retsept (taxminiy); Atwater ±15%');
/* 3. nomlar, porsiya, sinonimlar */
for (const { r, f } of yangi) {
  assert.ok(f.n && f.r && !/[ўқғҳЎҚҒҲ]/.test(f.r), f.i + ': RU nomda o\'zbek harfi yo\'q'); assert.ok(f.a.length >= 1, f.i + ': sinonim'); assert.ok(f.u.length >= 2, f.i + ': odatiy porsiya + 100 g');
  assert.doesNotMatch(JSON.stringify([f.n, f.r, f.a, f.ms]), /halol|ҳалол|халол/i); assert.doesNotMatch(JSON.stringify([f.n, f.r, f.ms]), /cho'chqa|свин/i);
}
const units = new Set(A.flatMap((f) => f.u.map((u) => u[0]))); for (const u of ['shisha05', 'shisha1', 'shisha15', 'banka', 'shar']) assert.ok(units.has(u), 'birlik ' + u);
const app = fs.readFileSync(path.join(ROOT, 'assets/kalkifit-app.js'), 'utf8'); for (const u of ['shisha05', 'shisha1', 'shisha15', 'banka', 'shar', 'paket', 'plitka']) assert.ok(app.includes(u + ": '"), 'birlik nomi ' + u);
log('Nomlar (lotin + RU; ЎЗ — translit), RU nomda o\'zbek harfi yo\'q, sinonimlar, porsiya (dona/stakan/shisha 0,5/1/1,5 l/banka/shar + 100 g); «halol»/cho\'chqa matni yo\'q');
/* 4. tuzatilgan nomlar */
assert.equal(by.qurt.r, 'Курут'); assert.ok(by.qurt.a.includes('курт'), 'курт — sinonim'); assert.equal(by.qovurdoq.r, 'Ковурдак (жаркое)'); assert.match(by['tandir-gosht'].r, /^Тандыр-гушт/); assert.equal(by.navvot.n, 'Novvot'); assert.match(by.jiz.r, /^Джиз/);
const qy = A.find((f) => f.i === 'qoymoq'); if (qy) assert.doesNotMatch(qy.r, /[ўқ]/);
log('Tuzatilgan nomlar: Qurt → «Курут» (курт — sinonim), Qovurdoq → «Ковурдак», Tandir go\'sht → «Тандыр-гушт», Navvot → «Novvot», Jiz → «Джиз», Qo\'ymoq RU nomida kirill-o\'zbek harfi yo\'q');
/* 5. qidiruv (uch til) */
const DB = S.normFoods(A); S.buildIndex(DB); const q = (s) => S.search(DB, s, {}).map((f) => f.id);
const has = (s, re) => { const r = q(s).slice(0, 8); assert.ok(r.some((id) => re.test(id)), s + ' → ' + r.join(', ')); };
has('мороженое', /^mz-|muzqaymoq/); assert.ok(q('мороженое').filter((i) => /^mz-|muzqaymoq/.test(i)).length >= 5, 'мороженое: kamida 5 tur'); has('пломбир', /plombir|muzqaymoq/); has('музқаймоқ', /mz-|muzqaymoq/);
has('курут', /^qurt$/); has('курт', /^qurt$/); has('қурт', /^qurt$/);
has('печень', /jigar/); has('жигар', /jigar/); has('qovurilgan jigar', /^mol-jigar-qov$/);
has('кола', /kola|coca-cola|pepsi/); has('протеиновый батончик', /protein-bar/); has('сникерс', /^snickers$/); has('семечки', /pista-qovurilgan|kungaboqar/); has('почки', /buyrak/); has('язык', /til$/); has('сердечки', /yurak/);
has('латте', /kofe|latte/); has('энергетик', /energetik|red-bull|monster/); has('кефир', /kefir/);
log('Qidiruv: мороженое (≥5 tur), пломбир, музқаймоқ, курут/курт/қурт, печень/жигар/«qovurilgan jigar», кола, протеиновый батончик, сникерс, семечки, почки, язык, сердечки, латте, энергетик, кефир');
console.log('\nBaza kengaytmasi: ' + n + ' tekshiruv OK');
