// Bazani kengaytirish, 2-bosqich (tools/ovqatlar-kengaytma3.js, v65): do'kon brendlari (FAQAT yorliq — OFF shtrix-kodi), fast-food (umumiy nom, USDA → «taxminiy»), sport;
// avvalgi 1-bosqich test naqshi: sxema (maydonlar, manba bo'sh emas, makro tekshiruvi), manba turi (USDA fdc_id / yorliq / aralashma → «taxminiy»),
// qidiruv (har yangi taom o'z nomi va 1–2 sinonimi bilan topiladi), «topilmadi» ro'yxati (D1, 2026-10-30 holati) endi topiladi, mavjud qidiruv buzilmagan (aniq moslik birinchi),
// takror taom yo'q, cho'chqa tegi o'zgarmagan, ikonka (mavjud rasm yoki rejalashtirilgan, harfli tile yo'q).   node tools/dizayn/test-baza1.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), K = require(path.join(ROOT, 'tools/ovqatlar-kengaytma3.js'));
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
/* 4. brend qoidasi: brend nomi FAQAT yorliq bilan (haqiqiy shtrix-kod); fast-food — umumiy nom, tarmoq nomi yo'q, «taxminiy» */
const CHAIN = /\b(evos|max ?way|oqtepa|bellissimo|belissimo|kfc|mcdonald|burger king|wendy'?s|subway)\b/i;
let brand = 0, fast = 0;
for (const { r, f } of yangi) {
  const s = r[6];
  if (s.startsWith('y:')) { brand++; const L = YQ[s.slice(2)]; assert.ok(!/^0*99990/.test(L.code), f.i + ': OFF «99990…» soxta kod emas'); assert.ok(L.nom && L.nom.length > 2, f.i + ': yorliqdagi nom'); }
  if (f.t === 'q') { fast++; assert.ok(s.startsWith('m:') && f.e === 1, f.i + ': fast-food — taxminiy'); assert.doesNotMatch(f.n + ' ' + f.r + ' ' + f.a.join(' '), CHAIN, f.i + ': tarmoq nomi yo\'q (rasmiy qiymat e\'lon qilinmagan)'); }
}
assert.ok(brand >= 45 && fast >= 5, 'brend ' + brand + ', fast-food ' + fast);
log('Brend: ' + brand + ' ta — hammasi haqiqiy shtrix-kodli yorliq bilan; fast-food: ' + fast + ' ta umumiy nom (Evos/Max Way/Oqtepa/Bellissimo/KFC nomi yo\'q), «taxminiy»');
/* 5. qidiruv: brend nomi (lotin/kirill/imlo) → 1-o'rin; mavjud asosiy so'rovlar buzilmagan */
const Q = [['raffaello', 'raffaello'], ['рафаэлло', 'raffaello'], ['ferrero', 'ferrero-rocher'], ['чупа чупс', 'chupa-chups'], ['флеш ап', 'flash-up'], ['flash up', 'flash-up'], ['горилла', 'gorilla'], ['burn', 'burn'], ['активиа', 'activia'], ['даниссимо', 'danissimo'], ['agusha', 'agusha-tvorog'], ['твистер', 'tvister'], ['стрипсы', 'tovuq-boneless'], ['кесадилья', 'kesadilya'], ['чикенбургер', 'sendvich-tovuq'], ['шаурма', 'lavash-tovuq'], ['bonaqua', 'suv'], ['hydrolife', 'suv'], ['mirinda', 'mirinda'], ['lipton', 'lipton-ice-tea'], ['кириешки', 'kirieshki'], ['cheetos', 'cheetos'], ['optimum nutrition', 'on-whey'], ['сырный соус', 'sous-pishloqli'], ['чесночный соус', 'sous-sarimsoqli']];
for (const [s, id] of Q) assert.equal(top(s, 1)[0], id, '«' + s + '» → ' + top(s).join(','));
for (const [s, id] of [['osh', 'osh'], ['choy', 'choy'], ['non', 'non'], ['sut', 'sut'], ['olma', 'olma'], ['tuxum', 'tuxum'], ['snickers', 'snickers'], ['milka', 'milka'], ['twix', 'twix'], ['coca cola', 'coca-cola'], ['burger', 'burger'], ['lavash', 'lavash-non'], ['smetana', 'smetana'], ['tvorog', 'tvorog5'], ['kefir', 'kefir'], ['shokolad', 'shokolad-sut'], ['plov', 'osh'], ['чай', 'choy'], ['хлеб', 'non']])
  assert.equal(top(s, 1)[0], id, 'regressiya: «' + s + '» → ' + top(s).join(','));
log('Qidiruv: ' + Q.length + ' brend/fast-food so\'rovi (lotin, kirill, imlo) 1-o\'rinda; regressiya — 19 asosiy so\'rov (snickers, milka, burger, lavash, smetana… ) o\'zgarmagan');
/* 6. takror yo'q: har yorliq va har USDA id bitta taomda */
const used = {}; A.forEach((f) => { const m = /^(?:Yorliq: .*\(OFF (\d+)\)|USDA FDC (\d+))$/.exec(f.m || ''); const k = m && (m[1] || m[2]); if (k) (used[k] = used[k] || []).push(f.i); });
for (const { r } of yangi) { const k = r[6].startsWith('y:') ? YQ[r[6].slice(2)].code : (/^m:u:(\d+)\*100$/.exec(r[6]) || [])[1]; if (k && used[k]) assert.ok(used[k].length <= 1, r[0] + ': manba boshqa taomda ham: ' + used[k]); }
assert.ok(!by.bounty && by['kokos-batonchik'], 'Bounty — mavjud «Bounty turi» (takror yaratilmadi)');
log('Takror taom yo\'q: har yorliq/USDA manbasi bitta taomda; Bounty — mavjud yozuvda');
/* 7. cheklov teglari */
const CT = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cheklov-teglar.json'), 'utf8')).taom; const pork = Object.keys(CT).filter((k) => (CT[k] || []).includes('choshqa')).sort();
assert.deepEqual(pork, ['bekon', 'pitsa#pepperoni', 'pitsa-pepperoni'].sort(), 'cho\'chqa tegi o\'zgarmagan: ' + pork);
for (const [id, t] of [['raffaello', 'sut'], ['raffaello', 'yongoq'], ['tvister', 'glyuten'], ['on-whey', 'sut'], ['milka-funduk', 'yongoq'], ['tovuq-burger-grill', 'tuxum']]) assert.ok((CT[id] || []).includes(t), id + ': ' + t);
log('Cheklov teglari: cho\'chqa — faqat bekon/pepperoni; brend va fast-food taomlarida sut/yong\'oq/glyuten/tuxum');
/* 8. ikonka: har yangi taom mos mavjud rasmda yoki rejada; reja vositasi (tools/ikonka-toplam.js) xatosiz, barcha generic taom rejada */

const reja = fs.readFileSync(path.join(ROOT, 'data/ikonka-reja.txt'), 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('|')), rejaIds = new Map(); reja.forEach((r) => r[3].trim().split(/\s+/).forEach((i) => rejaIds.set(i, r[1].trim())));
const IMG2 = Function('return ' + app.match(/var IMG2 = (\{[^\n]*?\});/)[1])(), have = new Set(fs.readdirSync(path.join(ROOT, 'assets/ovqat')).map((x) => x.replace(/-(128|256)\.webp$/, '')));
let img = 0; for (const { f } of yangi) { const sl = IMG2[f.i] || rejaIds.get(f.i); assert.ok(sl, f.i + ': ikonka yo\'q'); if (have.has(sl)) img++; }
const { spawnSync } = await import('node:child_process'); const t = spawnSync(process.execPath, [path.join(ROOT, 'tools/ikonka-toplam.js'), '--tekshir'], { encoding: 'utf8' });
assert.equal(t.status, 0, 'ikonka-toplam.js: ' + (t.stderr || t.stdout).slice(0, 400)); const gm = /generic: (\d+), rejalashtirilgan yangi ikonka: (\d+)/.exec(t.stdout);
log('Ikonka: ' + img + '/' + yangi.length + ' yangi taom mos mavjud rasm bilan; tools/ikonka-toplam.js --tekshir xatosiz — generic ' + gm[1] + ' ta, hammasi rejada (' + gm[2] + ' yangi ikonka)');
console.log('baza2: ' + n + ' guruh OK');
