// KalkiFit v79 shtrix-kod serveri (tarmoqsiz: D1 shim + KV mock + OFF fetch mock): zanjir (o'z jadval → KV kesh → OFF → topilmadi), yaroqsiz OFF javobi, kesh (OFF'ga qayta bormaydi),
// OFF tarmoq xatosi keshlanmaydi, kod tekshiruvi (EAN-13/8/UPC-A), User-Agent (shaxsiy email yo'q), AI limitidan sarflamaydi, ODbL: OFF o'z jadvalimizga yozilmaydi,
// yorliq taklifi shtrix-kod bilan (≥2 bir xil → shtrix_mahsulot), admin qo'shsa — hamma uchun, statistika hodisalari.   node tools/dizayn/test-shtrix-api.mjs
import assert from 'node:assert/strict'; import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..'); const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const SH = await imp('functions/api/shtrix.js'), YQ = await imp('functions/api/kalkifit-yorliq.js'), STAT = await imp('functions/api/stat.js'); const { makeD1 } = await import('./d1-shim.mjs');
const SCHEMA = fs.readFileSync(path.join(ROOT, 'migrations/yorliq.sql'), 'utf8') + '\nALTER TABLE yorliq_taklif ADD COLUMN kod TEXT;\n' + fs.readFileSync(path.join(ROOT, 'migrations/shtrix.sql'), 'utf8');
let n = 0; const T = async (name, fn) => { try { await fn(); n++; console.log('OK  ', n + '.', name); } catch (e) { console.log('XATO ' + name + ': ' + (e && e.stack || e)); process.exit(1); } };
const kv = () => { const m = new Map(), ttl = new Map(); return { get: async (k) => m.get(k), put: async (k, v, o) => { m.set(k, String(v)); if (o && o.expirationTtl) ttl.set(k, o.expirationTtl); }, delete: async (k) => { m.delete(k); }, m, ttl }; };
const GET = (q, ip = '7.7.7.7') => new Request('https://kalki.uz/api/shtrix' + q, { headers: { 'CF-Connecting-IP': ip } });
const rd = async (r) => ({ s: r.status, j: await r.json() });
const OK13 = '5449000000996', BAD13 = '5449000000995', EAN8 = '96385074', UPCA = '036000291452';          // Coca-Cola, noto'g'ri nazorat, EAN-8, UPC-A (→ 0036000291452)
const offJ = (o = {}) => ({ status: 1, product: Object.assign({ code: OK13, product_name: 'Test batonchik', product_name_ru: 'Тестовый батончик', brands: 'TestBrend,Boshqa', quantity: '40 g', product_quantity: '40', serving_quantity: 40, nutriments: { 'energy-kcal_100g': 480, proteins_100g: 6, fat_100g: 24, carbohydrates_100g: 60 } }, o) });
let calls = [], offReply = null; const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opt) => { calls.push({ url: String(url), ua: opt && opt.headers && opt.headers['User-Agent'] }); const r = offReply ? await offReply(String(url)) : { status: 404, body: { status: 0 } }; if (r instanceof Error) throw r; return new Response(JSON.stringify(r.body), { status: r.status }); };
const mkEnv = () => ({ KALKIFIT_DB: makeD1(SCHEMA), KALKI_AI_KV: kv() });

await T('kod tekshiruvi: EAN-13, EAN-8, UPC-A (12 → 13), nazorat raqami; yaroqsiz — rad', async () => {
  assert.equal(SH.normKod(OK13), OK13); assert.equal(SH.normKod(BAD13), null); assert.equal(SH.normKod(EAN8), EAN8); assert.equal(SH.normKod(UPCA), '0' + UPCA);
  for (const b of ['', 'abc', '123', '12345678901234567', null, undefined, '5449000000 996']) assert.equal(SH.normKod(b), null, String(b));
  const env = mkEnv(); assert.equal((await rd(await SH.onRequest({ request: GET('?kod=' + BAD13), env }))).s, 400); assert.equal(calls.length, 0, 'yaroqsiz kod — OFF\'ga so\'rov yo\'q');
  assert.equal((await SH.onRequest({ request: new Request('https://kalki.uz/api/shtrix?kod=' + OK13, { method: 'POST' }), env })).status, 405);
  assert.equal((await SH.onRequest({ request: new Request('https://kalki.uz/api/shtrix?kod=' + OK13, { headers: { Origin: 'https://evil.example' } }), env })).status, 403);
});
await T('zanjir a): o\'z jadvalimizda bor — shu (OFF\'ga bormaydi), manba=oz, tasdiqlangan belgisi', async () => {
  calls = []; const env = mkEnv(); await env.KALKIFIT_DB.prepare("INSERT INTO shtrix_mahsulot (kod, nom, brend, kcal, oqsil, yog, uglevod, qadoq, birlik, manba, tasdiqlangan) VALUES (?, 'Musaffo qatiq', 'Musaffo', 52, 3, 2.5, 4.6, 450, 'g', 'admin', 1)").bind(OK13).run();
  const r = await rd(await SH.onRequest({ request: GET('?kod=' + OK13), env })); assert.equal(r.s, 200); assert.equal(r.j.manba, 'oz'); assert.deepEqual([r.j.mahsulot.nom, r.j.mahsulot.brend, r.j.mahsulot.k, r.j.mahsulot.qadoq, r.j.mahsulot.tasdiqlangan], ['Musaffo qatiq', 'Musaffo', 52, 450, true]); assert.equal(calls.length, 0);
});
await T('zanjir b+c): jadvalda yo\'q → OFF (faqat kerakli fields, User-Agent: ilova + sayt aloqa sahifasi, shaxsiy email YO\'Q) → kesh', async () => {
  calls = []; offReply = async () => ({ status: 200, body: offJ() }); const env = mkEnv();
  const r = await rd(await SH.onRequest({ request: GET('?kod=' + OK13 + '&til=ru'), env })); assert.equal(r.j.manba, 'off'); assert.equal(r.j.mahsulot.nom, 'Тестовый батончик'); assert.equal(r.j.mahsulot.brend, 'TestBrend'); assert.deepEqual([r.j.mahsulot.k, r.j.mahsulot.qadoq, r.j.mahsulot.porsiya, r.j.mahsulot.birlik], [480, 40, 40, 'g']);
  assert.equal(calls.length, 1); assert.match(calls[0].url, /^https:\/\/world\.openfoodfacts\.org\/api\/v2\/product\/5449000000996\?fields=/); assert.match(calls[0].url, /nutriments/); assert.doesNotMatch(calls[0].url, /ingredients|images|nutriscore/);
  assert.match(calls[0].ua, /^KalkiFit\/\d/); assert.match(calls[0].ua, /kalki\.uz/); assert.doesNotMatch(calls[0].ua, /@|gmail|mail/i);
  const r2 = await rd(await SH.onRequest({ request: GET('?kod=' + OK13), env })); assert.equal(calls.length, 1, 'qayta skaner — kesh, OFF\'ga bormaydi'); assert.equal(r2.j.mahsulot.nom, 'Test batonchik'); assert.equal(r2.j.kesh, true);
  assert.equal(env.KALKI_AI_KV.ttl.get('shtrix:off:' + OK13), 30 * 86400);
});
await T('ODbL: OFF natijasi o\'z jadvalimizga YOZILMAYDI (alohida kesh, manba=off); topilmadi sanagichi ham yozilmaydi', async () => {
  const env = mkEnv(); offReply = async () => ({ status: 200, body: offJ() }); await SH.onRequest({ request: GET('?kod=' + OK13), env });
  assert.equal(env.KALKIFIT_DB._raw.prepare('SELECT COUNT(*) AS n FROM shtrix_mahsulot').get().n, 0); assert.equal(env.KALKIFIT_DB._raw.prepare('SELECT COUNT(*) AS n FROM shtrix_topilmadi').get().n, 0);
  assert.ok([...env.KALKI_AI_KV.m.keys()].some((k) => k.startsWith('shtrix:off:')));
  const src = fs.readFileSync(path.join(ROOT, 'functions/api/shtrix.js'), 'utf8'); assert.doesNotMatch(src, /INSERT[^;]*shtrix_mahsulot/i, 'shtrix.js shtrix_mahsulot ga yozmaydi');
});
await T('yaroqsiz OFF javobi — «topilmadi»: kkal yo\'q, mantiqsiz kkal, makro 4/9/4 ga mos emas, makro yo\'q, nomsiz, status 0; topilmadi sanagichi va 3 kunlik salbiy kesh', async () => {
  const cases = [{ nutriments: { proteins_100g: 5, fat_100g: 5, carbohydrates_100g: 5 } }, { nutriments: { 'energy-kcal_100g': 1500, proteins_100g: 5, fat_100g: 5, carbohydrates_100g: 5 } }, { nutriments: { 'energy-kcal_100g': 480, proteins_100g: 1, fat_100g: 1, carbohydrates_100g: 10 } }, { nutriments: { 'energy-kcal_100g': 100 } }, { product_name: '', product_name_ru: '', nutriments: { 'energy-kcal_100g': 100, proteins_100g: 5, fat_100g: 2, carbohydrates_100g: 15 } }, { nutriments: { 'energy-kcal_100g': 300, proteins_100g: 60, fat_100g: 30, carbohydrates_100g: 30 } }];
  for (const [i, c] of cases.entries()) { calls = []; const env = mkEnv(); offReply = async () => ({ status: 200, body: offJ(c) }); const r = await rd(await SH.onRequest({ request: GET('?kod=' + OK13), env })); assert.equal(r.j.topilmadi, true, 'holat ' + i + ': ' + JSON.stringify(r.j)); assert.equal(r.j.vaqtincha, undefined);
    assert.equal(env.KALKIFIT_DB._raw.prepare('SELECT soni FROM shtrix_topilmadi WHERE kod = ?').get(OK13).soni, 1); assert.equal(env.KALKI_AI_KV.ttl.get('shtrix:off:' + OK13), 3 * 86400); await SH.onRequest({ request: GET('?kod=' + OK13), env }); assert.equal(calls.length, 1, 'salbiy kesh: OFF\'ga qayta bormaydi'); assert.equal(env.KALKIFIT_DB._raw.prepare('SELECT soni FROM shtrix_topilmadi WHERE kod = ?').get(OK13).soni, 2); }
  offReply = async () => ({ status: 404, body: { status: 0, status_verbose: 'product not found' } }); const e2 = mkEnv(); assert.equal((await rd(await SH.onRequest({ request: GET('?kod=' + OK13), env: e2 }))).j.topilmadi, true);
  assert.equal(SH.offDan({ status: 1, product: { product_name: 'X1', nutriments: { energy_100g: 1600, proteins_100g: 5, fat_100g: 20, carbohydrates_100g: 45 } } }, OK13).k, 382, 'kJ → kkal (energy_100g / 4,184)');
});
await T('OFF tarmoq xatosi / vaqt / 5xx: «vaqtincha», keshlanmaydi, «topilmadi» ro\'yxatiga yozilmaydi', async () => {
  for (const rep of [async () => new Error('tarmoq'), async () => ({ status: 503, body: {} })]) { calls = []; const env = mkEnv(); offReply = rep; const r = await rd(await SH.onRequest({ request: GET('?kod=' + OK13), env })); assert.deepEqual([r.s, r.j.topilmadi, r.j.vaqtincha], [200, true, true]); assert.equal(env.KALKI_AI_KV.m.has('shtrix:off:' + OK13), false); assert.equal(env.KALKIFIT_DB._raw.prepare('SELECT COUNT(*) AS n FROM shtrix_topilmadi').get().n, 0);
    offReply = async () => ({ status: 200, body: offJ() }); assert.equal((await rd(await SH.onRequest({ request: GET('?kod=' + OK13), env }))).j.manba, 'off', 'keyingi urinishda topiladi'); }
});
const ean = (d) => { let sum = 0; for (let i = 0; i < 12; i++) sum += +d[11 - i] * (i % 2 === 0 ? 3 : 1); return d + ((10 - (sum % 10)) % 10); };
await T('limit: AI hisobidan sarflamaydi (alohida «sh» hisobi); IP limiti oshsa — 429; OFF sutkalik sayt tavani oshsa — OFF\'ga bormaydi', async () => {
  const codes = ['460000000001', '460000000002', '460000000003'].map(ean); assert.ok(codes.every((k) => SH.normKod(k)));
  const env = mkEnv(); offReply = async () => ({ status: 200, body: offJ() }); await SH.onRequest({ request: GET('?kod=' + codes[0]), env });
  const keys = [...env.KALKI_AI_KV.m.keys()]; assert.ok(keys.some((k) => k.startsWith('sh:')), 'alohida sh hisobi: ' + keys.join(',')); assert.ok(keys.every((k) => !/^(ai|img|rasm|tx|ov):/.test(k)), 'AI/rasm kalitlari ishlatilmagan: ' + keys.join(','));
  const e3 = mkEnv(); e3.SHTRIX_LIMIT = '2'; offReply = async () => ({ status: 404, body: { status: 0 } }); const ss = []; for (const k of codes) ss.push((await SH.onRequest({ request: GET('?kod=' + k, '8.8.8.8'), env: e3 })).status); assert.deepEqual(ss, [200, 200, 429]);
  const e4 = mkEnv(); e4.SHTRIX_OFF_LIMIT = '1'; calls = []; const rr = []; for (const [i, k] of codes.slice(0, 2).entries()) rr.push(await rd(await SH.onRequest({ request: GET('?kod=' + k, '9.9.9.' + i), env: e4 }))); assert.equal(calls.length, 1, 'OFF sutkalik tavan'); assert.equal(rr[1].j.vaqtincha, true);
});
await T('yorliq taklifi shtrix-kod bilan: kod saqlanadi, yaroqsiz kod rad; hamma uchun FAQAT ≥2 HAR XIL Google akkauntdan bir xil taklif kelganda; mehmon/email-akkaunt/takroriy ovoz — o\'tmaydi; kodsiz taklif eskicha', async () => {
  const env = mkEnv(), raw = env.KALKIFIT_DB._raw, now = Date.now(), sha = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map((b) => b.toString(16).padStart(2, '0')).join('');
  raw.exec('CREATE TABLE akkaunt (id TEXT PRIMARY KEY, usul TEXT NOT NULL DEFAULT \'email\'); CREATE TABLE sessiya (id TEXT PRIMARY KEY, akkaunt_id TEXT NOT NULL, oxirgi INTEGER NOT NULL, muddat_abs INTEGER NOT NULL);');
  const tok = (c) => c.repeat(43).slice(0, 43), mk = async (id, usul, c, o = {}) => { raw.prepare('INSERT INTO akkaunt (id, usul) VALUES (?, ?)').run(id, usul); raw.prepare('INSERT INTO sessiya (id, akkaunt_id, oxirgi, muddat_abs) VALUES (?, ?, ?, ?)').run(await sha(tok(c)), id, o.oxirgi || now, o.abs || now + 86400000); };
  await mk('g1', 'google', 'a'); await mk('g2', 'ikkalasi', 'b'); await mk('e1', 'email', 'c'); await mk('g3', 'google', 'd', { abs: now - 1000 });
  const post = (b, ip, t) => YQ.onRequest({ request: new Request('https://kalki.uz/api/kalkifit-yorliq', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', Origin: 'https://kalki.uz', 'CF-Connecting-IP': ip }, t ? { Cookie: '__Host-kalki_s=' + tok(t) } : {}), body: JSON.stringify(b) }), env });
  const cnt = (t) => raw.prepare('SELECT COUNT(*) AS n FROM ' + t).get().n;
  const B = { nom: 'Test shirinlik', kcal: 400, o: 5, y: 15, u: 60, g: 45, manba: 'rasm', til: 'uz', kod: OK13 };
  assert.equal((await post(Object.assign({}, B, { kod: BAD13 }), '1.1.1.1', 'a')).status, 400);
  assert.equal((await post(B, '1.1.1.1', 'a')).status, 200); assert.equal(raw.prepare('SELECT kod FROM yorliq_taklif').get().kod, OK13); assert.equal(cnt('shtrix_mahsulot'), 0, '1 ta akkaunt — jadvalga o\'tmaydi');
  assert.equal((await post(B, '1.1.1.1', 'a')).status, 200); assert.equal((await post(B, '9.9.9.9', 'a')).status, 200); assert.equal(cnt('shtrix_mahsulot'), 0, 'bir akkaunt takror (boshqa IP ham) — bitta ovoz');
  for (let i = 0; i < 3; i++) assert.equal((await post(B, '2.2.2.' + i)).status, 200); assert.equal(cnt('shtrix_mahsulot'), 0, 'mehmon takliflari (cookie yo\'q) — avtomatik o\'tmaydi');
  assert.equal((await post(B, '2.2.2.9', 'c')).status, 200); assert.equal(cnt('shtrix_mahsulot'), 0, 'faqat email-kod bilan kirgan akkaunt — Google emas, hisoblanmaydi');
  assert.equal((await post(B, '2.2.2.8', 'd')).status, 200); assert.equal(cnt('shtrix_mahsulot'), 0, 'muddati o\'tgan sessiya — mehmon');
  assert.equal(raw.prepare('SELECT jami FROM yorliq_taklif').get().jami >= 7, true, 'hamma taklif admin navbatida (jami hisoblanadi)'); assert.equal(raw.prepare("SELECT holat FROM yorliq_taklif").get().holat, 'yangi');
  assert.equal((await post(B, '3.3.3.3', 'b')).status, 200); const row = raw.prepare('SELECT * FROM shtrix_mahsulot').get(); assert.deepEqual([row.kod, row.nom, row.kcal, row.qadoq, row.manba, row.tasdiqlangan], [OK13, 'Test shirinlik', 400, 45, 'yorliq', 0], '2-HAR XIL Google akkaunt — hamma uchun');
  const r = await rd(await SH.onRequest({ request: GET('?kod=' + OK13), env })); assert.equal(r.j.manba, 'oz'); assert.equal(r.j.mahsulot.tasdiqlangan, false);
  assert.equal((await post({ nom: 'Oddiy', kcal: 100, o: 3, y: 2, u: 17, manba: 'qolda', til: 'uz' }, '4.4.4.4', 'a')).status, 200); assert.equal(raw.prepare("SELECT COUNT(*) AS n FROM yorliq_taklif WHERE kod IS NOT NULL").get().n, 1);
  /* boshqa qiymat (kkal) — boshqa taklif: akkauntlar bir xil qiymat bo'yicha sanaladi */
  const B2 = Object.assign({}, B, { kod: ean('590123456789'), kcal: 410 }); assert.equal((await post(B2, '5.5.5.5', 'a')).status, 200); assert.equal((await post(Object.assign({}, B2, { kcal: 380 }), '5.5.5.6', 'b')).status, 200); assert.equal(raw.prepare("SELECT COUNT(*) AS n FROM shtrix_mahsulot WHERE kod = ?").get(B2.kod).n, 0, 'har xil qiymat — bir xil taklif emas');
  /* akkaunt o'chirilsa ovozlari ham o'chadi */
  const { makeStore } = await imp('functions/_lib/akkaunt-store.js'); assert.ok(makeStore, 'akkaunt-store mavjud'); assert.ok(/DELETE FROM shtrix_taklif_akk WHERE akkaunt_id/.test(fs.readFileSync(path.join(ROOT, 'functions/_lib/akkaunt-store.js'), 'utf8')));
});
await T('statistika: shtrix hodisalari qabul qilinadi (ochildi, topildi.oz/off, topilmadi, yorliqqa_otdi, qoshildi), boshqasi — yo\'q; admin kartasi manbasi bor', async () => {
  const src = fs.readFileSync(path.join(ROOT, 'functions/api/stat.js'), 'utf8'); const m = /shtrix: (\/\^[^,]+\$\/)/.exec(src); assert.ok(m, 'stat.js shtrix qoidasi'); const re = new RegExp(m[1].slice(1, -1));
  for (const k of ['ochildi', 'topildi.oz', 'topildi.off', 'topilmadi', 'yorliqqa_otdi', 'qoshildi']) assert.ok(re.test(k), k); for (const k of ['7501234567890', 'topildi.x', '']) assert.ok(!re.test(k), k);
  assert.match(fs.readFileSync(path.join(ROOT, 'admin/kalkifit-statistika.html'), 'utf8'), /Shtrix-kod skaneri/); assert.ok(STAT);
});
globalThis.fetch = realFetch; console.log(`\n${n} ta tekshiruv guruhi o'tdi`);
