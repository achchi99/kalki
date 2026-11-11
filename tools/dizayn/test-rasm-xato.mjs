// KalkiFit rasm AI server xatolari (v77): provayder 5xx/429/timeout/400/401, kesilgan javob, katta/noto'g'ri rasm — sabab kodlari, qayta urinish, limit hisobi XATODA kamaymaydi
// (oddiy mehmon va Cheksiz akkaunt), server natija hisobi (rasm_srv) va admin xato ulushi.   node tools/dizayn/test-rasm-xato.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { pathToFileURL } from 'node:url';
import { d1 } from './d1-sqlite.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'), imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const RS = await imp('functions/api/kalkifit-rasm.js'), STAT = await imp('functions/api/stat.js');
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const rd = (f) => fs.readFileSync(path.join(ROOT, 'migrations', f), 'utf8');
const mig = rd('ai-cheksiz.sql'), tbl = mig.split('\n').filter((l) => !/^\s*(--|ALTER)/.test(l)).join('\n');
const db = d1([rd('akkaunt.sql'), rd('zaxira.sql'), rd('zaxira-muddat.sql'), rd('zaxira-tarix.sql'), rd('stat.sql'), rd('admin-stat.sql'), tbl]);
const kv = () => { const m = new Map(); return { get: async (k) => (m.has(k) ? m.get(k) : null), put: async (k, v) => { m.set(k, v); }, delete: async (k) => { m.delete(k); }, m }; };
const env = { ANTHROPIC_API_KEY: 'k', KALKI_AI_KV: kv(), KALKIFIT_DB: db, IP_HASH_SALT: 'tuz' };
const JPG = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(300, 7)]).toString('base64');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex'), now = Date.now();
const mk = (id, email, cheksiz) => { const t = crypto.randomBytes(32).toString('base64url'); db.raw.prepare('INSERT INTO akkaunt (id, email, yaratilgan, oxirgi_kirish, ai_cheksiz) VALUES (?, ?, ?, ?, ?)').run(id, email, now, now, cheksiz ? 1 : 0); db.raw.prepare('INSERT INTO sessiya (id, akkaunt_id, yaratilgan, oxirgi, muddat_abs, qurilma) VALUES (?, ?, ?, ?, ?, ?)').run(sha(t), id, now, now, now + 100 * 86400000, 'test'); return t; };
const tOddiy = mk('aaaaaaaa11111111', 'oddiy@example.com', false), tCheksiz = mk('bbbbbbbb22222222', 'cheksiz@example.com', true);
const H = (t, ip) => ({ 'Content-Type': 'application/json', Origin: 'https://kalki.uz', 'CF-Connecting-IP': ip, ...(t ? { Cookie: '__Host-kalki_s=' + t } : {}) });
const go = (b, t, ip) => RS.onRequest({ request: new Request('https://kalki.uz/api/kalkifit-rasm', { method: 'POST', headers: H(t, ip || '7.7.7.7'), body: JSON.stringify({ img: JPG, til: 'ru', ...b }) }), env });
const OK = '[{"variantlar":[{"nom":"Osh","ehtimol":0.9}],"porsiya":"1 lagan","g":300,"kcal":500,"o":15,"y":20,"u":60}]';
let calls = [], script = [];                                      // script: har chaqiruv uchun javob (oxirgisi takrorlanadi)
globalThis.fetch = async (url, opt) => {
  const b = JSON.parse(opt.body); calls.push(b); const s = script[Math.min(calls.length - 1, script.length - 1)];
  if (s === 'timeout') { const e = new Error('abort'); e.name = 'AbortError'; throw e; } if (s === 'net') throw new TypeError('fetch failed');
  if (typeof s === 'number') return { ok: false, status: s, headers: { get: () => null }, json: async () => ({ error: { type: 'x' } }) };
  return { ok: true, status: 200, headers: { get: () => null }, json: async () => ({ stop_reason: s.stop || 'end_turn', content: [{ type: 'text', text: s.text }] }) };
};
const setup = (...s) => { calls = []; script = s; };
const tashkent = () => new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
const cnt = async (cid) => { let t = 0; for (const [k, v] of env.KALKI_AI_KV.m) if (k.startsWith('ai:cid:')) t += parseInt(v, 10) || 0; return t; };
const sums = () => Object.fromEntries(db.raw.prepare("SELECT kalit, son FROM stat_kun WHERE hodisa = 'rasm_srv'").all().map((r) => [r.kalit.split('.')[0], 0]).map(([k]) => [k, db.raw.prepare("SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = 'rasm_srv' AND kalit LIKE ?").get(k + '.%').n]));
const CID = '11111111-2222-4333-8444-555555555555';
/* 1. ichki: kesilgan javob (max_tokens) — tugagan taomlar saqlanadi; so'rovda max_tokens 1800 */
{ const cut = OK.slice(0, -1) + ',{"variantlar":[{"nom":"Sam'; setup({ text: '[' + OK.slice(1, -1) + ',' + OK.slice(1, -1).replace('Osh', 'Somsa') + ',{"variantlar":[{"nom":"Non","ehtim', stop: 'max_tokens' });
  const r = await go({ mijoz_id: CID }); assert.equal(r.status, 200); const j = await r.json(); assert.equal(j.ovqatlar.length, 2, 'kesilgan oxirgi taom tashlanadi, qolgani saqlanadi'); assert.deepEqual(j.ovqatlar.map((x) => x.nom), ['Osh', 'Somsa']); assert.equal(calls[0].max_tokens, 1800); assert.equal(calls.length, 1, 'qayta urinish kerak emas'); }
log('Kesilgan javob (5–6 taom, max_tokens): 200, tugagan taomlar saqlandi, max_tokens = 1800 (eski 700 — 502 «Ошибка сервера» sababi edi)');
/* 2. provayder 500 → 500 → 200: avtomatik qayta urinish */
{ setup(500, 503, { text: OK }); const t0 = Date.now(), r = await go({ mijoz_id: CID }); assert.equal(r.status, 200); assert.equal(calls.length, 3); assert.ok(Date.now() - t0 >= 1200, 'urinishlar orasida qisqa kutish'); }
log('Provayder 500, 503 keyin 200: server o\'zi 3 urinishda javob oldi (kutish bilan)');
/* 3. provayder doim 500 → 502 sabab=provayder; limit kamaymaydi */
{ const before = await cnt(); setup(500); const r = await go({ mijoz_id: CID }); const j = await r.json(); assert.equal(r.status, 502); assert.equal(j.sabab, 'provayder'); assert.equal(calls.length, 3); assert.equal(j.qidiruv, true); assert.ok(j.xato && !/ошибка сервера/i.test(j.xato)); assert.equal(await cnt(), before, 'xato — limit hisobi kamaymadi'); }
log('Provayder doim 500: 3 urinishdan so\'ng 502 sabab=provayder; limit hisobi o\'zgarmadi');
/* 4. 429/529 → 503 sabab=band + Retry-After */
{ const before = await cnt(); setup(529); const r = await go({ mijoz_id: CID }); const j = await r.json(); assert.equal(r.status, 503); assert.equal(j.sabab, 'band'); assert.equal(r.headers.get('Retry-After'), '60'); assert.match(j.xato, /band/); assert.equal(await cnt(), before); setup(429); assert.equal((await (await go({ mijoz_id: CID })).json()).sabab, 'band'); }
log('Provayder 429/529: sabab=band («AI hozir band, 1 daqiqadan keyin…»), Retry-After 60, limit kamaymadi');
/* 5. timeout → 504 sabab=vaqt */
{ const before = await cnt(); setup('timeout'); const r = await go({ mijoz_id: CID }); assert.equal(r.status, 504); assert.equal((await r.json()).sabab, 'vaqt'); assert.equal(await cnt(), before); setup('net'); assert.equal((await (await go({ mijoz_id: CID })).json()).sabab, 'provayder'); }
log('Timeout → 504 sabab=vaqt; tarmoq uzilishi → provayder; limit kamaymadi');
/* 6. 400 (rasm yaramadi) → format, qayta urinishsiz; 401 → ichki, qayta urinishsiz */
{ setup(400); let r = await go({ mijoz_id: CID }); assert.equal(r.status, 400); assert.equal((await r.json()).sabab, 'format'); assert.equal(calls.length, 1); setup(401); r = await go({ mijoz_id: CID }); assert.equal(r.status, 503); assert.equal((await r.json()).sabab, 'ichki'); assert.equal(calls.length, 1); }
log('Provayder 400 → format, 401 → ichki: qayta urinish yo\'q (foydasiz)');
/* 7. katta va noto'g'ri rasm: provayderga bormaydi, limit olinmaydi */
{ const before = await cnt(); setup({ text: OK }); const big = 'A'.repeat(1100000); let r = await RS.onRequest({ request: new Request('https://kalki.uz/api/kalkifit-rasm', { method: 'POST', headers: H(null, '7.7.7.7'), body: JSON.stringify({ img: big, mijoz_id: CID }) }), env }); assert.equal(r.status, 413); assert.equal((await r.json()).sabab, 'hajm');
  const mid = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF]), Buffer.alloc(800000, 1)]).toString('base64'); r = await go({ img: mid, mijoz_id: CID }); assert.equal(r.status, 413); assert.equal((await r.json()).sabab, 'hajm');
  r = await go({ img: Buffer.alloc(500, 3).toString('base64'), mijoz_id: CID }); assert.equal(r.status, 400); assert.equal((await r.json()).sabab, 'format'); assert.equal(calls.length, 0); assert.equal(await cnt(), before); }
log('Katta rasm (>700 KB) → 413 hajm; JPEG emas → 400 format; provayderga bormaydi, limit olinmaydi');
/* 8. Mehmon: ketma-ket xatolardan keyin ham 8 ta muvaffaqiyatli so'rov o'tadi (xato hisoblanmaydi) */
{ const C2 = '22222222-2222-4333-8444-555555555555'; setup(500); for (let i = 0; i < 4; i++) assert.equal((await go({ mijoz_id: C2 }, null, '6.6.6.6')).status, 502); setup({ text: OK }); for (let i = 0; i < 8; i++) assert.equal((await go({ mijoz_id: C2 }, null, '6.6.6.6')).status, 200, 'so\'rov ' + (i + 1)); const r9 = await go({ mijoz_id: C2 }, null, '6.6.6.6'); assert.equal(r9.status, 429); }
log('Mehmon: 4 ta xatodan keyin ham 8 ta muvaffaqiyatli so\'rov o\'tdi, 9-chisi 429 (xatolar limitdan yemadi)');
/* 9. Cheksiz akkaunt: xuddi shu rasm — muvaffaqiyatda sanaladi, xatoda qaytariladi; oddiy akkaunt bilan bir xil natija */
{ const dayCount = (id) => (db.raw.prepare("SELECT COALESCE(SUM(son),0) AS n FROM ai_cheksiz_kun WHERE akkaunt_id = ? AND kun = ? AND ns != '!chegara'").get(id, tashkent()) || {}).n;
  setup({ text: OK }); const ok1 = await go({ mijoz_id: CID }, tCheksiz, '5.5.5.5'), j1 = await ok1.json(); assert.equal(ok1.status, 200); assert.equal(dayCount('bbbbbbbb22222222'), 1);   const o1 = await (await go({ mijoz_id: CID }, tOddiy, '4.4.4.4')).json(); assert.deepEqual(o1.ovqatlar, j1.ovqatlar, 'bir xil rasm — bir xil natija'); const siteBefore = parseInt(env.KALKI_AI_KV.m.get('img:site:' + tashkent()), 10);
  setup(500); const bad = await go({ mijoz_id: CID }, tCheksiz, '5.5.5.5'); assert.equal(bad.status, 502); assert.equal((await bad.json()).sabab, 'provayder'); assert.equal(dayCount('bbbbbbbb22222222'), 1, 'xato — kunlik hisob (150) kamaydi emas, oshmadi ham'); assert.equal(parseInt(env.KALKI_AI_KV.m.get('img:site:' + tashkent()), 10), siteBefore, 'sayt hisobi ham qaytarildi');
  setup('timeout'); assert.equal((await go({ mijoz_id: CID }, tCheksiz, '5.5.5.5')).status, 504); assert.equal(dayCount('bbbbbbbb22222222'), 1);
  setup({ text: OK }); assert.equal((await go({ mijoz_id: CID }, tCheksiz, '5.5.5.5')).status, 200); assert.equal(dayCount('bbbbbbbb22222222'), 2); }
log('Cheksiz akkaunt: muvaffaqiyat sanaladi (1→2), provayder xatosi/timeout hisobdan qaytariladi; oddiy akkaunt bilan bir xil rasm — bir xil natija');
/* 10. server natija hisobi: rasm_srv (ok + sabablar) va admin xato ulushi */
{ const s = sums(); for (const k of ['ok', 'provayder', 'band', 'vaqt', 'hajm', 'format', 'ichki']) assert.ok(s[k] > 0, 'rasm_srv.' + k); }
{ const bugun = tashkent(), kecha = new Date(Date.parse(bugun + 'T12:00:00Z') - 86400000).toISOString().slice(0, 10), soat = 14;
  const rows = [{ kun: bugun, kalit: 'ok.10', n: 8 }, { kun: bugun, kalit: 'provayder.11', n: 1 }, { kun: bugun, kalit: 'ok.20', n: 50 }, { kun: kecha, kalit: 'ok.15', n: 10 }, { kun: kecha, kalit: 'vaqt.16', n: 3 }, { kun: kecha, kalit: 'ok.09', n: 40 }];
  const r = STAT.rasmXatoYig(rows, bugun, soat, bugun); assert.deepEqual([r.soat24.jami, r.soat24.xato], [8 + 1 + 10 + 3, 4], 'oxirgi 24 soat: bugun ≤14, kecha >14'); assert.equal(r.soat24.foiz, Math.round(4 / 22 * 1000) / 10); assert.equal(r.ogoh, true); assert.equal(r.soat24.sabab.vaqt, 3); assert.equal(r.davr.jami, 8 + 1 + 50);
  const ok = STAT.rasmXatoYig([{ kun: bugun, kalit: 'ok.10', n: 50 }, { kun: bugun, kalit: 'band.11', n: 2 }], bugun, soat, bugun); assert.equal(ok.ogoh, false); assert.equal(ok.soat24.foiz, 3.8);
  assert.equal(STAT.rasmXatoYig([{ kun: bugun, kalit: 'provayder.11', n: 3 }], bugun, soat, bugun).ogoh, false, '5 tadan kam so\'rov — ogohlantirish yo\'q'); assert.equal(STAT.rasmXatoYig([], bugun, soat, bugun).soat24.foiz, null); }
log('Server natija hisobi (rasm_srv) sabablar bo\'yicha yoziladi; admin: oxirgi 24 soat ulushi, > 10 % ogohlantirish (kamida 5 so\'rovda)');
console.log('\nrasm-xato: ' + n + ' tekshiruv o\'tdi');
