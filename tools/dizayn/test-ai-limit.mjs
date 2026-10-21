// Retsept va rasm AI — BITTA umumiy kunlik hisob (functions/api/kalkifit-quota.js AI_LIMIT: Android 2, veb 5; mijoz_id + IP), sayt tavani alohida; keshdan kelgan javob sanalmaydi.
// + qidiruvda topilmagan so'zlar (functions/api/qidiruv.js): faqat kun + so'z + son, qat'iy tozalash.   node tools/dizayn/test-ai-limit.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url'; import { createRequire } from 'node:module';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..'), imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const RT = await imp('functions/api/retsept.js'), RS = await imp('functions/api/kalkifit-rasm.js'), Q = await imp('functions/api/kalkifit-quota.js'), QD = await imp('functions/api/qidiruv.js');
const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/retsept-masalliq.json'), 'utf8'));
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const kv = () => { const m = new Map(); return { get: async (k) => m.get(k), put: async (k, v) => { m.set(k, v); }, m }; };
const ASSETS = { fetch: async () => new Response(JSON.stringify(TABLE), { status: 200, headers: { 'Content-Type': 'application/json' } }) };
const mkEnv = () => ({ ANTHROPIC_API_KEY: 'k', KALKI_AI_KV: kv(), ASSETS });
const JPG = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(300, 7)]).toString('base64');
const RT_OK = '[{"nom":"mayiz","id":"mayiz","miqdor":40,"birlik":"g"}]', RS_OK = '[{"variantlar":[{"nom":"Qovurilgan jigar","ehtimol":0.6},{"nom":"Jigar kabob","ehtimol":0.25},{"nom":"Go\'sht (aniq emas)","ehtimol":0.15}],"porsiya":"1 porsiya","g":200,"kcal":380,"o":50,"y":16,"u":8}]';
globalThis.fetch = async (url, opt) => { const b = JSON.parse(opt.body); const img = JSON.stringify(b).includes('"image"'); return { ok: true, status: 200, json: async () => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: img ? RS_OK : RT_OK }] }) }; };
const H = { 'Content-Type': 'application/json', Origin: 'https://kalki.uz', 'CF-Connecting-IP': '9.9.9.9' };
const rt = (env, b) => RT.onRequest({ request: new Request('https://kalki.uz/api/retsept', { method: 'POST', headers: H, body: JSON.stringify(b) }), env });
const rs = (env, b) => RS.onRequest({ request: new Request('https://kalki.uz/api/kalkifit-rasm', { method: 'POST', headers: H, body: JSON.stringify(b) }), env });
const A1 = '11111111-2222-4333-8444-555555555555', W1 = '66666666-7777-4888-9999-aaaaaaaaaaaa';
/* 1. Android: retsept 1 + rasm 1 → 3-si (qaysi biri bo'lsa ham) rad */
assert.deepEqual(Q.AI_LIMIT, { veb: 5, android: 2 }); assert.equal(RT._test.CLIENT_LIMIT, Q.AI_LIMIT, 'retsept bitta konstantadan');
for (const third of ['rasm', 'retsept']) {
  const env = mkEnv(), P = { mijoz_id: A1, platforma: 'android' };
  let r = await rt(env, { ...P, matn: 'android retsept 1' }); assert.equal(r.status, 200); assert.equal((await r.json()).qoldi, 1);
  r = await rs(env, { ...P, img: JPG }); assert.equal(r.status, 200); let j = await r.json(); assert.equal(j.qoldi, 0); assert.equal(j.limit, 2);
  assert.deepEqual(j.ovqatlar[0].boshqa.map((x) => x.nom), ['Jigar kabob', "Go'sht (aniq emas)"]); assert.equal(j.ovqatlar[0].nom, 'Qovurilgan jigar');
  r = third === 'rasm' ? await rs(env, { ...P, img: JPG }) : await rt(env, { ...P, matn: 'android retsept 2' }); assert.equal(r.status, 429, third); j = await r.json();
  assert.equal(j.sabab, 'mijoz'); assert.equal(j.limit, 2); assert.equal(j.xato, "Bugungi 2 ta AI so'rov ishlatildi. Ertaga yana urinib ko'ring.");
  assert.deepEqual(await (await rt(env, { sorov: 'qoldi', ...P })).json(), { limit: 2, qoldi: 0 }, 'hisoblagich ikkala oynada bir xil');
  r = await rt(env, { ...P, matn: 'android retsept 1' }); assert.equal(r.status, 200, 'kesh — limitdan keyin ham'); assert.equal((await r.json()).kesh, true);
}
log('Android: retsept 1 + rasm 1 → 3-so\'rov (rasm ham, retsept ham) 429 «Bugungi 2 ta AI so\'rov ishlatildi»; hisoblagich umumiy (2 → 1 → 0); kesh limitdan keyin ham, sanalmaydi');
/* 2. veb: jami 5 (aralash) */
{ const env = mkEnv(); const seq = ['rt', 'rs', 'rt', 'rs', 'rs']; for (let i = 0; i < 5; i++) { const r = seq[i] === 'rt' ? await rt(env, { mijoz_id: W1, matn: 'veb matn ' + i }) : await rs(env, { mijoz_id: W1, img: JPG }); assert.equal(r.status, 200, 'veb ' + (i + 1)); assert.equal((await r.json()).qoldi, 4 - i); }
  assert.equal((await rs(env, { mijoz_id: W1, img: JPG })).status, 429); assert.equal((await rt(env, { mijoz_id: W1, matn: 'veb matn 9' })).status, 429);
  assert.ok([...env.KALKI_AI_KV.m.keys()].some((k) => k.startsWith('rt:site:')) && [...env.KALKI_AI_KV.m.keys()].some((k) => k.startsWith('img:site:')), 'sayt tavani — har xizmatda alohida'); assert.ok([...env.KALKI_AI_KV.m.keys()].some((k) => k.startsWith('ai:cid:')), 'foydalanuvchi hisobi — umumiy ai:'); }
log('Veb: retsept + rasm jami 5 ta (aralash ketma-ketlikda qoldi 4…0), 6-si 429; sayt tavani har xizmatda alohida, foydalanuvchi hisobi umumiy');
/* 3. rasm javobi: variantlar tozalanadi (≤3, takror yo'q, ehtimol bo'yicha), eski format ham */
const S2 = RS._test.sanitize([{ variantlar: [{ nom: 'B', ehtimol: 0.2 }, { nom: '<i>A</i>', ehtimol: 0.7 }, { nom: 'b', ehtimol: 0.1 }, { nom: 'C', ehtimol: 0.05 }, { nom: 'D', ehtimol: 0.01 }], g: 100, kcal: 200, o: 10, y: 10, u: 15 }, { nom: 'Osh', g: 300, kcal: 500, o: 15, y: 20, u: 60 }]);
assert.equal(S2[0].nom, 'iA/i'.replace('iA/i', 'iA/i')); assert.deepEqual(S2[0].boshqa.map((x) => x.nom), ['B', 'C']); assert.equal(S2[1].nom, 'Osh'); assert.deepEqual(S2[1].boshqa, []);
assert.match(RS._test.SYSTEM, /jigar/); assert.match(RS._test.SYSTEM, /Go'sht \(aniq emas\)/); assert.match(RS._test.SYSTEM, /variantlar/); assert.match(RS._test.SYSTEM, /kabob/i); assert.match(RS._test.SYSTEM, /buyrak/);
log('Rasm AI ko\'rsatmasi: ichki a\'zolar (jigar, buyrak…), kabob turlari, milliy taomlar, «Go\'sht (aniq emas)», 2–3 variant; javob tozalanadi (≤3 variant, takrorsiz, ehtimol bo\'yicha; eski format ham)');
/* 4. qidiruv_topilmadi */
const T0 = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
assert.equal(QD.sozTozala('  Курут  '), 'курут'); assert.equal(QD.sozTozala('Muzqaymoq   plombir'), 'muzqaymoq plombir'); assert.equal(QD.sozTozala('+998 90 123 45 67'), ''); assert.equal(QD.sozTozala('ali@mail.uz'), ''); assert.equal(QD.sozTozala('https://x.uz'), ''); assert.equal(QD.sozTozala('a'), ''); assert.equal(QD.sozTozala('x'.repeat(41)), ''); assert.equal(QD.sozTozala('<script>'), ''); assert.equal(QD.sozTozala('1234567'), '');
const ok = QD.tozala({ k: [{ s: T0, q: 'Хасип', n: 1 }, { s: '2020-01-01', q: 'osh', n: 1 }, { s: T0, q: 'tel 998901234567', n: 1 }, { s: T0, q: 'sut', n: 99 }] }, Date.now()); assert.deepEqual(ok, [{ sana: T0, soz: 'хасип', n: 1 }]);
assert.equal(QD.tozala({ k: new Array(21).fill({ s: T0, q: 'x1', n: 1 }) }), null);
const calls = []; const db = { prepare: (s) => ({ bind: (...a) => ({ sql: s, a, all: async () => ({ results: [{ soz: 'хасип', son: 3, kun: 2 }] }) }) }), batch: async (l) => { calls.push(...l); return []; } };
const env = { KALKIFIT_DB: db, KALKIFIT_ADMIN_PASSWORD: 'sir' }, post = (b, h) => QD.onRequest({ request: new Request('https://kalki.uz/api/qidiruv', { method: 'POST', headers: Object.assign({ Origin: 'https://kalki.uz', 'Content-Type': 'application/json' }, h || {}), body: JSON.stringify(b) }), env });
let r = await post({ k: [{ s: T0, q: 'хасип', n: 1 }] }); assert.equal(r.status, 204); assert.match(calls[0].sql, /INSERT INTO qidiruv_topilmadi \(sana, soz, son\) VALUES \(\?, \?, \?\) ON CONFLICT\(sana, soz\) DO UPDATE SET son = son \+ excluded\.son/); assert.deepEqual(calls[0].a, [T0, 'хасип', 1]);
assert.equal((await post({ k: [] }, { Origin: 'https://evil.example' })).status, 403); assert.equal((await QD.onRequest({ request: new Request('https://kalki.uz/api/qidiruv?kun=7'), env })).status, 401);
r = await QD.onRequest({ request: new Request('https://kalki.uz/api/qidiruv?kun=7', { headers: { 'X-Admin-Password': 'sir' } }), env }); assert.equal(r.status, 200); assert.deepEqual((await r.json()).sozlar, [{ soz: 'хасип', son: 3, kun: 2 }]);
const sql = fs.readFileSync(path.join(ROOT, 'migrations/qidiruv.sql'), 'utf8').split('\n').filter((l) => !l.trim().startsWith('--')).join('\n'); for (const re of [/CREATE TABLE IF NOT EXISTS qidiruv_topilmadi/, /sana TEXT NOT NULL/, /soz TEXT NOT NULL/, /son INTEGER NOT NULL DEFAULT 0/, /PRIMARY KEY \(sana, soz\)/]) assert.match(sql, re); assert.equal((sql.match(/ (TEXT|INTEGER) /g) || []).length, 3, 'faqat 3 ustun'); assert.doesNotMatch(sql.replace(/--.*$/gm, ''), /\bip\b|mijoz|user|device/i);
const { hisobot } = (await import('node:module')).createRequire(import.meta.url)(path.join(ROOT, 'tools/qidiruv-hisobot.js')); assert.match(hisobot({ sozlar: [{ soz: 'хасип', son: 3, kun: 2 }] }, 7, 10), /хасип\s+3\s+\(2 kun\)/);
log('Topilmagan so\'zlar: faqat kun + so\'z + son (D1 qidiruv_topilmadi, id/IP yo\'q); telefon/email/havola/uzun/raqamli matn rad; POST 204, Origin 403, GET parol bilan; hisobot skripti');
console.log('\nAI limiti va qidiruv hisoblagichi: ' + n + ' tekshiruv OK');
