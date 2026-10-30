// Bazani kengaytirish, 3-bosqich (tools/ovqatlar-kengaytma4.js, v66): meva/sabzavot/ko'kat (mahalliy), quruq meva, qovurilgan urug'lar, dukkak va makaron (xom/pishgan) — USDA;
// avvalgi 1-bosqich test naqshi: sxema (maydonlar, manba bo'sh emas, makro tekshiruvi), manba turi (USDA fdc_id / yorliq / aralashma → «taxminiy»),
// qidiruv (har yangi taom o'z nomi va 1–2 sinonimi bilan topiladi), «topilmadi» ro'yxati (D1, 2026-10-30 holati) endi topiladi, mavjud qidiruv buzilmagan (aniq moslik birinchi),
// takror taom yo'q, cho'chqa tegi o'zgarmagan, ikonka (mavjud rasm yoki rejalashtirilgan, harfli tile yo'q).   node tools/dizayn/test-baza1.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), K = require(path.join(ROOT, 'tools/ovqatlar-kengaytma4.js'));
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
/* 4. manba ulushi va xom/pishgan juftliklari mantiqiy (xom 100 g — pishgandan kaloriyali) */
assert.ok(src.usda >= 30 && src.yorliq === 0, 'USDA ' + src.usda);
for (const [x, p] of [['makaron-butun-don-xom', 'makaron-butun-don'], ['mosh-xom', 'mosh'], ['noxat-xom', 'noxat'], ['loviya-xom', 'loviya'], ['yasmiq-xom', 'yasmiq'], ['guruch-xom', 'guruch'], ['grechka-xom', 'grechka'], ['makaron-xom', 'makaron'], ['lapsha-xom', 'makaron'], ['sholgom', 'sholgom-pishgan']])
  assert.ok(by[x].k >= by[p].k && by[x].c >= by[p].c * 0.95, x + ' (' + by[x].k + ') ≥ ' + p + ' (' + by[p].k + ')');
assert.ok(by['kungaboqar-qovurilgan'].k > 500 && by['kunjut-qovurilgan'].k > 500, 'qovurilgan urug\'lar');
log('Manba: USDA ' + src.usda + ', analog (taxminiy) ' + src.hisob + '; xom ↔ pishgan juftliklari: xom kaloriyaliroq (makaron, mosh, no\'xat, loviya, yasmiq, guruch, grechka, sholg\'om)');
/* 5. qidiruv: mahalliy nomlar va sinonimlar (rovoch, qoqi, jusay, sholg'om, alcha, turshak, devzira, torlama…) 1-o'rinda; regressiya */
const Q = [['rovoch', 'rovoch'], ['ревень', 'rovoch'], ['qoqi', 'qoqi'], ['jusay', 'jusay'], ['джусай', 'jusay'], ["sholg'om", 'sholgom'], ['репа', 'sholgom'], ['rayhon', 'rayhon'], ['yalpiz', 'yalpiz'], ['мята', 'yalpiz'], ['topinambur', 'yer-nok'], ['laym', 'laym'], ['qoq xurmo', 'xurmo-quruq'], ['alcha', 'oluxori'], ['алыча', 'oluxori'], ['turshak', 'quruq-orik'], ['devzira', 'guruch-xom'], ['torlama', 'qovun'], ['qovurilgan semechki', 'kungaboqar-qovurilgan'], ['pekin karam', 'pekin-karam'], ['mosh nihol', 'mosh-nihol'], ['oq loviya', 'loviya-oq'], ['butun donli makaron', 'makaron-butun-don'], ['karpuz', 'tarvuz']];
for (const [s, id] of Q) assert.equal(top(s, 1)[0], id, '«' + s + '» → ' + top(s).join(','));
for (const [s, id] of [['osh', 'osh'], ['choy', 'choy'], ['non', 'non'], ['sut', 'sut'], ['olma', 'olma'], ['tuxum', 'tuxum'], ['xurmo', 'xurmo'], ['karam', 'karam'], ['mosh', 'mosh'], ['loviya', 'loviya'], ['noxat', 'noxat'], ['makaron', 'makaron'], ['guruch', 'guruch'], ['mayiz', 'mayiz'], ['kunjut', 'kunjut'], ['qovun', 'qovun'], ['tarvuz', 'tarvuz'], ['limon', 'limon'], ['plov', 'osh'], ['хлеб', 'non']])
  assert.equal(top(s, 1)[0], id, 'regressiya: «' + s + '» → ' + top(s).join(','));
log('Qidiruv: ' + Q.length + ' mahalliy nom/sinonim 1-o\'rinda; regressiya — 20 asosiy so\'rov (xurmo, karam, mosh, makaron, guruch, mayiz, qovun… — yangi xom/quruq variant oldinga chiqmaydi)');
/* 6. takror yo'q: yangi USDA id avval bazada ishlatilmagan */
const used = {}; A.forEach((f) => { const m = /^USDA FDC (\d+)$/.exec(f.m || ''); if (m) (used[m[1]] = used[m[1]] || []).push(f.i); });
for (const { r } of yangi) { const k = (/^u:(\d+)$/.exec(r[6]) || [])[1]; if (k) assert.equal(used[k].length, 1, r[0] + ': ' + used[k]); }
log('Takror taom yo\'q: har yangi USDA manbasi bitta taomda (alcha, turshak, devzira, torlama, karpuz — mavjud taomga sinonim)');
/* 7. cheklov teglari */
const CT = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cheklov-teglar.json'), 'utf8')).taom; const pork = Object.keys(CT).filter((k) => (CT[k] || []).includes('choshqa')).sort();
assert.deepEqual(pork, ['bekon', 'pitsa#pepperoni', 'pitsa-pepperoni'].sort(), 'cho\'chqa tegi o\'zgarmagan: ' + pork);
for (const [id, t] of [['lapsha-xom', 'tuxum'], ['lapsha-xom', 'glyuten'], ['makaron-butun-don', 'glyuten']]) assert.ok((CT[id] || []).includes(t), id + ': ' + t); for (const id of ['rovoch', 'laym', 'soya-pishgan']) assert.deepEqual(CT[id] || [], [], id + ': cheklovsiz');
log('Cheklov teglari: cho\'chqa — faqat bekon/pepperoni; lapsha — tuxum/glyuten, meva/sabzavot — cheklovsiz');
/* 8. ikonka: har yangi taom mos mavjud rasmda yoki rejada; reja vositasi (tools/ikonka-toplam.js) xatosiz, barcha generic taom rejada */

const reja = fs.readFileSync(path.join(ROOT, 'data/ikonka-reja.txt'), 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('|')), rejaIds = new Map(); reja.forEach((r) => r[3].trim().split(/\s+/).forEach((i) => rejaIds.set(i, r[1].trim())));
const IMG2 = Function('return ' + app.match(/var IMG2 = (\{[^\n]*?\});/)[1])(), have = new Set(fs.readdirSync(path.join(ROOT, 'assets/ovqat')).map((x) => x.replace(/-(128|256)\.webp$/, '')));
let img = 0; for (const { f } of yangi) { const sl = IMG2[f.i] || rejaIds.get(f.i); assert.ok(sl, f.i + ': ikonka yo\'q'); if (have.has(sl)) img++; }
const { spawnSync } = await import('node:child_process'); const t = spawnSync(process.execPath, [path.join(ROOT, 'tools/ikonka-toplam.js'), '--tekshir'], { encoding: 'utf8' });
assert.equal(t.status, 0, 'ikonka-toplam.js: ' + (t.stderr || t.stdout).slice(0, 400)); const gm = /generic: (\d+), rejalashtirilgan yangi ikonka: (\d+)/.exec(t.stdout);
log('Ikonka: ' + img + '/' + yangi.length + ' yangi taom mos mavjud rasm bilan; tools/ikonka-toplam.js --tekshir xatosiz — generic ' + gm[1] + ' ta, hammasi rejada (' + gm[2] + ' yangi ikonka)');
console.log('baza3: ' + n + ' guruh OK');
