// Bazani kengaytirish, 3-bosqich (tools/ovqatlar-kengaytma6.js, v66): meva/sabzavot/ko'kat (mahalliy), quruq meva, qovurilgan urug'lar, dukkak va makaron (xom/pishgan) — USDA;
// avvalgi 1-bosqich test naqshi: sxema (maydonlar, manba bo'sh emas, makro tekshiruvi), manba turi (USDA fdc_id / yorliq / aralashma → «taxminiy»),
// qidiruv (har yangi taom o'z nomi va 1–2 sinonimi bilan topiladi), «topilmadi» ro'yxati (D1, 2026-10-30 holati) endi topiladi, mavjud qidiruv buzilmagan (aniq moslik birinchi),
// takror taom yo'q, cho'chqa tegi o'zgarmagan, ikonka (mavjud rasm yoki rejalashtirilgan, harfli tile yo'q).   node tools/dizayn/test-baza4.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), K = require(path.join(ROOT, 'tools/ovqatlar-kengaytma6.js'));
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
  const AF = f.i === 'laym' ? [3.36, 8.37, 2.48] : [4, 9, 4], atw = AF[0] * f.p + AF[1] * f.f + AF[2] * f.c;          // laym: USDA sitrus omillari (uglevod 2,48 kkal/g — organik kislotalar), umumiy 4·9·4 bilan 47 chiqadi
  if (ALC.has(f.i)) assert.ok(f.k >= atw - 5, f.i + ': alkogol — kkal makrodan katta (spirt 7 kkal/g)');
  else assert.ok(Math.abs(atw - f.k) <= Math.max(10, f.k * 0.15), f.i + ': Atwater ±15%: ' + f.k + ' vs ' + Math.round(atw));
  assert.ok(f.k >= 0 && f.k <= 900 && f.p >= 0 && f.f >= 0 && f.c >= 0, f.i + ': oraliq (100 g da ≤ 900 kkal)');
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
let q = 0; for (const { f } of yangi) { const qs = [f.n, f.a[0], f.a.find((x) => /[а-яё]/i.test(x))]; for (const s of qs) { q++; assert.ok(top(s).includes(f.i), f.i + ': «' + s + '» → ' + top(s).join(',')); } }
log('Qidiruv: ' + q + ' so\'rov — har yangi taom nomi, 1-sinonimi va ruscha sinonimi bilan birinchi 3 talikda');
/* 4. yangi sinonimlar: bazada bor taomga yo'naltiradi (imlo/kirill/ruscha/qisqartma) */
const SYN = [['bayram oshi', 'osh'], ['toshkent oshi', 'osh'], ['yashil osh', 'shivit-oshi'], ['toshkent manti', 'manti'], ['манты с мясом', 'manti'], ['qo\'l norin', 'norin'], ['xonim qovoqli', 'xonim'], ['qovurma shurva', 'shurva'], ['лагман с мясом', 'lagmon'], ['qiyma shashlik', 'lyulya'], ['шашлык печень', 'jigar-kabob'], ['g\'ijda', 'non'], ['хлеб бородинский', 'non-qora'], ['gul parvarda', 'parvarda'], ['7up', 'sprite'], ['multifrukt', 'rich-sharbat'], ['americano', 'kofe'], ['flat white', 'kofe'], ['4 ta pishloq', 'pitsa'], ['xotdog', 'hotdog'], ['xoddog', 'hotdog'], ['sosimka', 'sosiska'], ['mayanezli salat', 'olivye'], ['crab salad', 'krab-salat'], ['сосиска в тесте', 'sosiskali-bulochka'], ['sasiskali bulochka', 'sosiskali-bulochka'], ['choy malina', 'choy'], ['chai latte', 'choy-qaymoqli'], ['ряженка', 'ryajenka'], ['снежок', 'prostokvasha'], ['doritos', 'chips-nachos'], ['kimchi salat', 'kimchi'], ['koreys salat', 'kimchi'], ['филадельфия', 'roll-filadelfiya'], ['суши', 'sushi-nigiri'], ['maki', 'roll-kaliforniya'], ['mocha', 'mokka'], ['pitsa bo\'lak', 'pitsa'], ['kalbasali xodog', 'hotdog']];
for (const [s, id] of SYN) assert.ok(top(s, 3).includes(id), '«' + s + '» → ' + top(s).join(',') + ' (kutilgan ' + id + ')');
log('Sinonim: ' + SYN.length + ' yangi so\'rov (imlo, kirill, ruscha, qisqartma) bazadagi taomni topadi');
/* 5. eski «topilmadi» so'zlari (D1, 2026-10 holati) — yangi baza bilan topiladigan ulush kamaymagan; ko'p so'zli yozuvda har so'zning eng yaqin taomi (o.loose) */
for (const [s, ids] of [['tuxum grechka', ['tuxum', 'grechka']], ['non kalbasa', ['non', 'hotdog']]]) { const r = S.search(DB, s, { limit: 6, loose: true }).map((f) => f.id); for (const id of ids) assert.ok(r.includes(id), '«' + s + '» (loose) → ' + r.join(',')); assert.equal(S.search(DB, s, { limit: 6 }).length, 0, '«' + s + '»: loose bo\'lmasa — jim (parseText noto\'g\'ri taomni jimgina olmasin)'); }
assert.equal(S.search(DB, 'asdf qwer', { limit: 3, loose: true }).length, 0, 'bema\'ni yozuv — topilmadi');
assert.ok(top('ovsyankali', 3).length > 0 && top('mayonezli salat', 3).length > 0, '-li qo\'shimchasi');
log('Qidiruv: -li/-lik qo\'shimchasi; ko\'p so\'zli yozuvda har so\'zning eng yaqin taomi (faqat qidiruv oynasida); bema\'ni yozuv — topilmadi');
/* 6. qidiruv regressiyasi: asosiy so'rovlar 1-o'rinda */
for (const [s, id] of [['osh', 'osh'], ['choy', 'choy'], ['non', 'non'], ['sut', 'sut'], ['somsa', 'somsa'], ['manti', 'manti'], ['lagmon', 'lagmon'], ['shashlik', 'shashlik'], ['kefir', 'kefir'], ['pitsa', 'pitsa'], ['hotdog', 'hotdog'], ['kola', 'kola'], ['kofe', 'kofe'], ['sushi', 'sushi-nigiri'], ['kimchi', 'kimchi']]) assert.equal(top(s, 1)[0], id, 'regressiya: «' + s + '» → ' + top(s).join(','));
log('Regressiya: 15 asosiy so\'rov 1-o\'rinda');
/* 7. cheklov teglari */
const CT = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cheklov-teglar.json'), 'utf8')).taom; const pork = Object.keys(CT).filter((k) => (CT[k] || []).includes('choshqa')).sort();
assert.deepEqual(pork, ['bekon', 'pitsa#pepperoni', 'pitsa-pepperoni'].sort(), 'cho\'chqa tegi o\'zgarmagan: ' + pork);
for (const [id, t] of [['somsa-pishloq', 'sut'], ['somsa-pishloq', 'glyuten'], ['sushi-nigiri', 'baliq'], ['roll-filadelfiya', 'sut'], ['shakshuka', 'tuxum']]) assert.ok((CT[id] || []).includes(t), id + ': ' + t);
log('Cheklov teglari: cho\'chqa — faqat bekon/pepperoni; yangi taomlarda sut/tuxum/baliq/glyuten');
/* 8. jami baza hajmi o'sgan va ikonka rejasi to'liq */
assert.ok(A.length >= 1016, 'baza hajmi ' + A.length);
const { spawnSync } = await import('node:child_process'); const tt = spawnSync(process.execPath, [path.join(ROOT, 'tools/ikonka-toplam.js'), '--tekshir'], { encoding: 'utf8' });
assert.equal(tt.status, 0, 'ikonka-toplam.js: ' + (tt.stderr || tt.stdout).slice(0, 400));
log('Baza: ' + A.length + ' taom; ikonka rejasi xatosiz (rasmsiz yangi taomlar — rejada)');
console.log('baza4: ' + n + ' guruh OK');
