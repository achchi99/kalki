// Bazani kengaytirish, 1-bosqich (tools/ovqatlar-kengaytma2.js, v64): sxema (maydonlar, manba bo'sh emas, makro tekshiruvi), manba turi (USDA fdc_id / yorliq / aralashma → «taxminiy»),
// qidiruv (har yangi taom o'z nomi va 1–2 sinonimi bilan topiladi), «topilmadi» ro'yxati (D1, 2026-10-30 holati) endi topiladi, mavjud qidiruv buzilmagan (aniq moslik birinchi),
// takror taom yo'q, cho'chqa tegi o'zgarmagan, ikonka (mavjud rasm yoki rejalashtirilgan, harfli tile yo'q).   node tools/dizayn/test-baza1.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), K = require(path.join(ROOT, 'tools/ovqatlar-kengaytma2.js'));
const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')), A = J.foods, by = Object.fromEntries(A.map((f) => [f.i, f]));
const USDA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/manba/usda-sr-legacy.json'), 'utf8')).foods, YQ = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/manba/yorliq.json'), 'utf8')).yorliq;
const DB = S.normFoods(A); S.buildIndex(DB); const top = (q, n = 3) => S.search(DB, q, { limit: n }).map((f) => f.id);
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const ALC = new Set(['aroq', 'konyak', 'vino-oq', 'vino-shirin', 'pivo-yengil']);          // alkogol: 7 kkal/g — Atwater (4·9·4) dan katta bo'ladi
const yangi = K.map((r) => ({ r, f: by[r[0]] }));
/* 1. sxema va manba */
const ids = new Set(); for (const { r, f } of yangi) { assert.ok(f, r[0] + ': bazada yo\'q'); assert.ok(!ids.has(f.i), 'takror id ' + f.i); ids.add(f.i); }
const tur = {}, src = { usda: 0, yorliq: 0, hisob: 0 };
for (const { r, f } of yangi) {
  tur[f.t] = (tur[f.t] || 0) + 1; const s = r[6];
  for (const k of ['n', 'r', 'k', 'p', 'f', 'c', 't', 'u', 'm', 'ms']) assert.ok(f[k] != null && f[k] !== '', f.i + ': maydon ' + k);
  assert.ok(f.ms.u.length > 30 && f.ms.r.length > 30, f.i + ': manba bayoni (uz/ru)');
  if (s.startsWith('u:')) { const U = USDA[s.slice(2)]; assert.ok(U, f.i + ': USDA id saqlangan'); assert.equal(f.k, Math.round(U.kcal)); assert.ok(Math.abs(f.p - U.p) < 0.06 && Math.abs(f.f - U.f) < 0.06 && Math.abs(f.c - U.c) < 0.06, f.i + ': makro = USDA'); assert.equal(f.e, 0); src.usda++; }
  else if (s.startsWith('y:')) { const L = YQ[s.slice(2)]; assert.ok(L && /^\d{8,14}$/.test(L.code), f.i + ': yorliq shtrix-kodi'); assert.equal(f.k, Math.round(L.k)); assert.equal(f.e, 0); src.yorliq++; }
  else { assert.ok(s.startsWith('m:')); assert.equal(f.e, 1, f.i + ': aralashma — taxminiy'); assert.match(f.ms.u, /Hisob \(taxminiy/); src.hisob++; }
  const atw = 4 * f.p + 9 * f.f + 4 * f.c;
  if (ALC.has(f.i)) assert.ok(f.k >= atw - 5, f.i + ': alkogol — kkal makrodan katta (spirt 7 kkal/g)');
  else assert.ok(Math.abs(atw - f.k) <= Math.max(10, f.k * 0.15), f.i + ': Atwater ±15%: ' + f.k + ' vs ' + Math.round(atw));
  assert.ok(f.k >= 0 && f.k <= 900 && f.p >= 0 && f.f >= 0 && f.c >= 0, f.i + ': oraliq (100 g da ≤ 900 kkal)');
  if (f.t === 'm' && /(go'sht|kotlet|bedana \(|grill|soya)/i.test(f.n) && s.startsWith('u:')) assert.match(USDA[s.slice(2)].d, /cooked|roasted|braised|broiled/i, f.i + ': go\'sht — pishgan qiymat');
}
log('Sxema: ' + yangi.length + ' ta yangi taom (tur: ' + JSON.stringify(tur) + '); manba: USDA ' + src.usda + ', yorliq ' + src.yorliq + ', hisob (taxminiy) ' + src.hisob + '; Atwater ±15% (alkogol — istisno), ≤ 900 kkal, go\'sht — pishgan');
/* 2. nomlar, porsiya, sinonim, taqiqlangan so'z */
const app = fs.readFileSync(path.join(ROOT, 'assets/kalkifit-app.js'), 'utf8'), unitsUz = app.match(/units: \{[^}]*\}/g);
for (const { f } of yangi) {
  assert.ok(f.a.length >= 3, f.i + ': kamida 3 sinonim'); assert.ok(f.a.some((x) => /[а-яё]/i.test(x)), f.i + ': ruscha sinonim'); assert.ok(!/[ўқғҳЎҚҒҲ]/.test(f.r), f.i + ': RU nomda o\'zbek harfi yo\'q');
  assert.ok(f.u.length >= 2 && f.u.every((u) => u[1] > 0), f.i + ': real porsiya + 100 g'); for (const [u] of f.u) assert.ok(unitsUz.every((d) => d.includes(u + ': ')), f.i + ': birlik nomi uz/ru ' + u);
  assert.doesNotMatch(JSON.stringify([f.n, f.r, f.a, f.ms]), /halol|ҳалол|халол|cho'chqa|свин/i, f.i);
}
log('Nomlar: lotin + RU (ЎЗ — translit), ≥ 3 sinonim (RU bilan), real porsiyalar (yangi: ryumka, bokal — uz/ru nomi bilan); «halol»/cho\'chqa so\'zi yo\'q');
/* 3. qidiruv: har yangi taom o'z nomi va 1–2 sinonimi bilan (top-3) */
let q = 0; for (const { f } of yangi) { const qs = [f.n.replace(/\s*\(.*\)$/, ''), f.a[0], f.a.find((x) => /[а-яё]/i.test(x))]; for (const s of qs) { q++; assert.ok(top(s).includes(f.i), f.i + ': «' + s + '» → ' + top(s).join(',')); } }
log('Qidiruv: ' + q + ' so\'rov — har yangi taom nomi, 1-sinonimi va ruscha sinonimi bilan birinchi 3 talikda');
/* 4. «topilmadi» (D1, 2026-10-30) va AI takliflari — endi topiladi; aniq moslik birinchi */
const NOW = [['tovuq file soya', 'tovuq-soya'], ['shashlikli xot dog', 'hotdog-shashlik'], ['чечевица товуқ билан', 'yasmiq-tovuq'], ['суп 5 злаков', 'besh-don-shurva'], ["guruch sho'rva", 'guruch-shurva'], ['quruqcoy', 'choy'],
  ['navot choy', 'choy-navvot'], ['limonli choy', 'choy-limon'], ['golubika', 'chernika'], ['ekra', 'ikra-baqlajon'], ['tuyur non', 'non'], ['bozor noni', 'non'], ['kurasan', 'kruassan'], ["tuxum sarig'i", 'tuxum-sarigi'],
  ["ko'k olma", 'kok-olma'], ['сдобная булочка', 'sdoba'], ['makaron palov', 'makaron-gosht'], ['отруби', 'kepak'], ['какао порошок', 'kakao-kukun'], ['цезарь', 'sezar-salat'], ['teftel', 'tefteli'], ['lotus', 'lotus-biscoff'], ['fuse tea', 'fuze-tea'],
  ['sariyogli sut', 'sariyogli-sut'], ['tarxun', 'tarxun'], ['bedana tuxumi', 'bedana-tuxum'], ['okroshka', 'okroshka'], ['aroq', 'aroq'], ['jarkoe', 'jarkop'], ["zig'ir", 'zigir'], ['yasmiq xom', 'yasmiq-xom']];
for (const [s, id] of NOW) assert.equal(top(s, 1)[0], id, '«' + s + '» → ' + top(s).join(','));
const P = S.parseText('4kesim non 2piyola qora coy 50dona uzum', DB); assert.equal(P.missing.length, 0, 'ko\'p taomli matn: ' + P.missing.join('|'));
log('«Topilmadi» va AI takliflari: ' + NOW.length + ' so\'rov 1-o\'rinda to\'g\'ri taom (yasmiq tovuqli, 5 donli sho\'rva, navvotli/limonli choy, golubika → chernika, ekra, tuyur non, ko\'k olma…)');
/* 5. mavjud qidiruv buzilmagan — aniq moslik birinchi */
for (const [s, id] of [['osh', 'osh'], ['choy', 'choy'], ['non', 'non'], ['sut', 'sut'], ['olma', 'olma'], ['tuxum', 'tuxum'], ['mosh', 'mosh'], ['yasmiq', 'yasmiq'], ['grechka', 'grechka'], ['vino', 'vino'], ['pivo', 'pivo'], ['shashlik', 'shashlik'], ['kotlet', 'kotlet'], ['bulochka', 'bulochka'], ['tvorog', 'tvorog5'], ['kolbasa', 'kolbasa'], ['makaron', 'makaron'], ['suli', 'suli'], ['manka', 'manka'], ['kuskus', 'kuskus'], ['plov', 'osh'], ['чай', 'choy'], ['хлеб', 'non']])
  assert.equal(top(s, 1)[0], id, 'regressiya: «' + s + '» → ' + top(s).join(','));
log('Regressiya: mavjud 23 asosiy so\'rov (osh, choy, non, sut, olma, tuxum, mosh, grechka, vino, pivo, kotlet, tvorog…) — 1-o\'rinda o\'sha taom (yangi xom/sutli variantlar oldinga chiqmaydi)');
/* 6. takror yo'q: golubika — chernika (bir xil USDA 171711) sinonimi; bir xil manba bitta taomda */
const fdc = {}; A.forEach((f) => { const m = /^USDA FDC (\d+)$/.exec(f.m || ''); if (m) (fdc[m[1]] = fdc[m[1]] || []).push(f.i); }); for (const { r } of yangi) if (r[6].startsWith('u:')) assert.equal((fdc[r[6].slice(2)] || []).length, 1, r[0] + ': shu USDA id boshqa taomda ham: ' + (fdc[r[6].slice(2)] || []).join(','));
assert.ok(!by.golubika && by.chernika.a.includes('golubika'), 'golubika — chernika sinonimi (takror taom emas)');
log('Takror taom yo\'q: har USDA id bitta taomda; golubika → chernika sinonimi');
/* 7. cheklov teglari: cho'chqa tegi o'zgarmagan; yangi taomlarda allergen teglari */
const CT = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cheklov-teglar.json'), 'utf8')).taom; const pork = Object.keys(CT).filter((k) => (CT[k] || []).includes('choshqa')).sort();
assert.deepEqual(pork, ['bekon', 'pitsa#pepperoni', 'pitsa-pepperoni'].sort(), 'cho\'chqa tegi to\'plami o\'zgarmagan: ' + pork);
for (const [id, t] of [['tuxum-sarigi', 'tuxum'], ['gumma', 'glyuten'], ['krab-salat', 'baliq'], ['tvorog-zapekanka', 'sut'], ['sdoba', 'glyuten'], ['sezar-roll', 'sut']]) assert.ok((CT[id] || []).includes(t), id + ': ' + t + ' tegi');
log('Cheklov teglari: cho\'chqa — faqat bekon/pepperoni (o\'zgarmagan); yangi taomlarda tuxum/glyuten/baliq/sut teglari');
/* 8. ikonka: mavjud mos rasm yoki rejalashtirilgan (data/ikonka-reja.txt), harfli tile yo'q */
const reja = fs.readFileSync(path.join(ROOT, 'data/ikonka-reja.txt'), 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('|')), rejaIds = new Map(); reja.forEach((r) => r[3].trim().split(/\s+/).forEach((i) => rejaIds.set(i, r[1].trim())));
const IMG2 = Function('return ' + app.match(/var IMG2 = (\{[^\n]*?\});/)[1])(), have = new Set(fs.readdirSync(path.join(ROOT, 'assets/ovqat')).map((x) => x.replace(/-(128|256)\.webp$/, '')));
let img = 0; for (const { f } of yangi) { const sl = IMG2[f.i] || rejaIds.get(f.i); assert.ok(sl, f.i + ': ikonka rejada ham, xaritada ham yo\'q'); if (have.has(sl)) img++; }
assert.ok(img >= 40, 'mos mavjud rasm: ' + img);
log('Ikonka: ' + img + ' ta yangi taom mos mavjud rasm bilan, qolgani rejalashtirilgan (docs/ikonka-toplam-v64.txt); harfli tile yo\'q');
console.log('baza1: ' + n + ' guruh OK');
