// KalkiFit rasm AI limiti (v75): mehmon (akkauntsiz) 8, akkaunt bilan kirgan 15 (sessiya — SERVERDA), Cheksiz AI akkaunti o'zgarishsiz (kuniga 150), butun saytda rasm so'rovlari 1000 dan oshsa
// hamma ESKI limitga (Android 2 / veb 5) qaytadi + admin ogohlantirishi; sana Toshkent vaqti bilan yangilanadi; 429 javobida akkaunt belgisi; hodisalar.   node tools/dizayn/test-rasm-limit.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { pathToFileURL } from 'node:url';
import { d1 } from './d1-sqlite.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'), imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const RS = await imp('functions/api/kalkifit-rasm.js'), RT = await imp('functions/api/retsept.js'), Q = await imp('functions/api/kalkifit-quota.js'), STAT = await imp('functions/api/stat.js');
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const rd = (f) => fs.readFileSync(path.join(ROOT, 'migrations', f), 'utf8'); const mig = rd('ai-cheksiz.sql').split('\n').filter((l) => !/^\s*(--|ALTER)/.test(l)).join('\n');
const db = d1([rd('akkaunt.sql'), rd('zaxira.sql'), rd('zaxira-muddat.sql'), rd('zaxira-tarix.sql'), rd('stat.sql'), rd('admin-stat.sql'), mig]);
const kv = () => { const m = new Map(); return { get: async (k) => (m.has(k) ? m.get(k) : null), put: async (k, v) => { m.set(k, v); }, delete: async (k) => { m.delete(k); }, m }; };
const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/retsept-masalliq.json'), 'utf8')), ASSETS = { fetch: async () => new Response(JSON.stringify(TABLE), { status: 200, headers: { 'Content-Type': 'application/json' } }) };
const mkEnv = () => ({ ANTHROPIC_API_KEY: 'k', KALKI_AI_KV: kv(), KALKIFIT_DB: db, IP_HASH_SALT: 'tuz', ASSETS });
const JPG = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(300, 7)]).toString('base64');
globalThis.fetch = async (url, opt) => { const b = JSON.parse(opt.body); const img = JSON.stringify(b).includes('"image"'); return { ok: true, status: 200, json: async () => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: img ? '[{"variantlar":[{"nom":"Osh","ehtimol":0.9}],"porsiya":"1 porsiya","g":200,"kcal":300,"o":10,"y":10,"u":30}]' : '[{"nom":"mayiz","id":"mayiz","miqdor":40,"birlik":"g"}]' }] }) }; };
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex'), tok = () => crypto.randomBytes(32).toString('base64url');
const now = Date.now(), ABS = now + 100 * 86400000;
const mk = (id, email, c) => { const t = tok(); db.raw.prepare('INSERT INTO akkaunt (id, email, yaratilgan, oxirgi_kirish, ai_cheksiz) VALUES (?, ?, ?, ?, ?)').run(id, email, now, now, c ? 1 : 0); db.raw.prepare('INSERT INTO sessiya (id, akkaunt_id, yaratilgan, oxirgi, muddat_abs, qurilma) VALUES (?, ?, ?, ?, ?, ?)').run(sha(t), id, now, now, ABS, 't'); return t; };
const tA = mk('aaaaaaaa11111111', 'a@example.com', false), tC = mk('cccccccc33333333', 'c@example.com', true);
const H = (t, ip) => ({ 'Content-Type': 'application/json', Origin: 'https://kalki.uz', 'CF-Connecting-IP': ip || '9.9.9.9', ...(t ? { Cookie: '__Host-kalki_s=' + t } : {}) });
const rs = (env, b, t, ip) => RS.onRequest({ request: new Request('https://kalki.uz/api/kalkifit-rasm', { method: 'POST', headers: H(t, ip), body: JSON.stringify({ img: JPG, ...b }) }), env });
const rt = (env, b, t, ip) => RT.onRequest({ request: new Request('https://kalki.uz/api/retsept', { method: 'POST', headers: H(t, ip), body: JSON.stringify(b) }), env });
const uid = (i) => String(i).padStart(8, '1') + '-2222-4333-8444-555555555555';
/* 1. konstantalar va mehmon: 8 ta, 9-chisi 429 (akkaunt: false) */
assert.deepEqual(Q.RASM_LIMIT, { mehmon: 8, akkaunt: 15 }); assert.equal(Q.RASM_UMUMIY_CHEGARA, 1000); assert.deepEqual(Q.AI_LIMIT, { veb: 5, android: 2 }, 'eski limit zaxirada');
assert.ok(Q.RASM_LIMIT.mehmon >= Q.AI_LIMIT.veb && Q.RASM_LIMIT.akkaunt >= Q.AI_LIMIT.veb, 'eski limitdan kam emas');
for (const pf of [undefined, 'android']) { const env = mkEnv(); const P = { mijoz_id: uid(1), platforma: pf }; for (let i = 0; i < 8; i++) { const r = await rs(env, P); assert.equal(r.status, 200, (pf || 'veb') + ' ' + (i + 1)); const j = await r.json(); assert.equal(j.limit, 8); assert.equal(j.qoldi, 7 - i); assert.equal(j.akkaunt, false); }
  const r = await rs(env, P); assert.equal(r.status, 429); const j = await r.json(); assert.equal(j.sabab, 'mijoz'); assert.equal(j.limit, 8); assert.equal(j.akkaunt, false); assert.equal(j.qoldi, 0); }
log('Mehmon (akkauntsiz, veb va Android): kuniga 8 ta rasm, 9-chisi 429 (akkaunt: false); eski limitdan (5/2) kam emas');
/* 2. akkaunt (sessiya cookie): 15 ta; hisob serverda — mijoz_id almashsa ham sessiya bo'yicha emas, mijoz/IP bo'yicha */
{ const env = mkEnv(); for (let i = 0; i < 15; i++) { const r = await rs(env, { mijoz_id: uid(2) }, tA); assert.equal(r.status, 200, 'akkaunt ' + (i + 1)); const j = await r.json(); assert.equal(j.limit, 15); assert.equal(j.akkaunt, true); }
  const r = await rs(env, { mijoz_id: uid(2) }, tA); assert.equal(r.status, 429); const j = await r.json(); assert.equal(j.limit, 15); assert.equal(j.akkaunt, true);
  assert.deepEqual(await (await rt(env, { sorov: 'qoldi', mijoz_id: uid(2) }, tA)).json(), { limit: 15, qoldi: 0, akkaunt: true }, 'hisoblagich akkaunt belgisi bilan');
  assert.deepEqual(await (await rt(env, { sorov: 'qoldi', mijoz_id: uid(3) }, null, '8.8.8.8')).json(), { limit: 8, qoldi: 8, akkaunt: false }, 'mehmon hisoblagichi');
  const r2 = await rs(env, { mijoz_id: uid(4), akkaunt: true, ai_cheksiz: true, platforma: 'android' }, 'x'.repeat(43), '7.7.7.7'); assert.equal(r2.status, 200); for (let i = 0; i < 7; i++) await rs(env, { mijoz_id: uid(4), akkaunt: true }, 'x'.repeat(43), '7.7.7.7'); assert.equal((await rs(env, { mijoz_id: uid(4), akkaunt: true }, 'x'.repeat(43), '7.7.7.7')).status, 429, 'soxta cookie / tanadagi «akkaunt» — mehmon limiti'); }
log('Akkaunt (server sessiyasi): kuniga 15 ta, 16-chisi 429 (akkaunt: true); hisoblagich {limit, qoldi, akkaunt}; soxta cookie va tanadagi belgi — mehmon (8)');
/* 3. rasm + retsept umumiy hisob (menyu ham): jami 8 / 15 */
{ const env = mkEnv(); for (let i = 0; i < 4; i++) assert.equal((await rs(env, { mijoz_id: uid(5) })).status, 200); for (let i = 0; i < 4; i++) assert.equal((await rt(env, { matn: 'umumiy ' + i, mijoz_id: uid(5) })).status, 200); assert.equal((await rs(env, { mijoz_id: uid(5) })).status, 429); assert.equal((await rt(env, { matn: 'umumiy 9', mijoz_id: uid(5) })).status, 429); }
log('Rasm + retsept (menyu) — bitta umumiy hisob: mehmonda jami 8');
/* 4. Cheksiz AI akkaunti: limit qo'llanmaydi, qoldi = 9999 (kuniga 150 chegara avvalgidek) */
{ const env = mkEnv(); for (let i = 0; i < 20; i++) { const r = await rs(env, { mijoz_id: uid(6) }, tC); assert.equal(r.status, 200); assert.equal((await r.json()).qoldi, 9999); } assert.equal((await (await rt(env, { sorov: 'qoldi', mijoz_id: uid(6) }, tC)).json()).qoldi, 9999); }
log('Cheksiz AI akkaunti avvalgidek: 20 ta rasm limitsiz, qoldi = 9999');
/* 5. umumiy chegara (1000): oshgach hamma ESKI limitga (veb 5 / Android 2), akkaunt ham; admin ogohlantirishi (stat_kun) bir marta */
{ const env = mkEnv(), day = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10); await env.KALKI_AI_KV.put('img:site:' + day, String(Q.RASM_UMUMIY_CHEGARA - 1));
  assert.equal((await rs(env, { mijoz_id: uid(7) }, tA, '6.6.6.6')).status, 200, '1000-chi so\'rov hali yangi limit bilan'); assert.equal(await env.KALKI_AI_KV.get('img:site:' + day), '1000');
  let r = await rs(env, { mijoz_id: uid(8) }, tA, '6.6.6.7'); assert.equal(r.status, 200); let j = await r.json(); assert.equal(j.limit, 5, 'akkaunt ham eski limitga: ' + j.limit); assert.equal(j.akkaunt, true);
  for (let i = 0; i < 4; i++) await rs(env, { mijoz_id: uid(8) }, tA, '6.6.6.7'); r = await rs(env, { mijoz_id: uid(8) }, tA, '6.6.6.7'); assert.equal(r.status, 429, 'eski limit 5'); j = await r.json(); assert.equal(j.limit, 5);
  r = await rs(env, { mijoz_id: uid(9), platforma: 'android' }, null, '6.6.6.8'); assert.equal((await r.json()).limit, 2, 'Android mehmon — eski 2');
  const w = db.raw.prepare("SELECT son FROM stat_kun WHERE hodisa = 'rasm_umumiy_chegara' AND kun = ?").all(day); assert.equal(w.length, 1); assert.equal(w[0].son, 1, 'ogohlantirish bir marta');
  const h = await STAT.hisobot(db, 7, Date.now()); assert.deepEqual(h.rasmUmumiy, [day]); assert.match(fs.readFileSync(path.join(ROOT, 'admin/kalkifit-statistika.html'), 'utf8'), /rasmOgoh/);
  const env2 = mkEnv(); assert.equal((await (await rs(env2, { mijoz_id: uid(10) })).json()).limit, 8, 'boshqa kun / yangi hisob — yana 8'); }
log('Umumiy chegara 1000 (bitta konstanta): 1000-chi so\'rov hali yangi limit; undan keyin hamma eski limitga (akkaunt 5, Android mehmon 2); admin ogohlantirishi kuniga bir marta (stat_kun rasm_umumiy_chegara)');
/* 6. Toshkent sanasi: kun yarim tunda (UTC+5) yangilanadi */
{ const env = mkEnv(), RN = Date.now, tz = (y, m, d, h, mi) => Date.UTC(y, m - 1, d, h, mi) - 5 * 3600000;
  try { Date.now = () => tz(2026, 11, 7, 23, 50); for (let i = 0; i < 8; i++) assert.equal((await rs(env, { mijoz_id: uid(11) })).status, 200); assert.equal((await rs(env, { mijoz_id: uid(11) })).status, 429);
    Date.now = () => tz(2026, 11, 8, 0, 5); assert.equal((await rs(env, { mijoz_id: uid(11) })).status, 200, 'Toshkent 00:05 — yangi kun'); } finally { Date.now = RN; } }
log('Sana Toshkent vaqti bilan: 23:50 da limit tugadi, 00:05 (UTC+5) da yangilandi');
/* 7. hodisalar */
{ for (const k of ['rasm.limit', 'rasm.limit.mehmon', 'rasm.limit.akkaunt', 'rasm.limit.akkaunt_bosildi', 'rasm.ok']) assert.ok(STAT.HODISA.ai_sorov.test(k), k); assert.ok(!STAT.HODISA.ai_sorov.test('rasm.limit.boshqa')); assert.ok(!STAT.HODISA.ai_sorov.test('menyu.limit.mehmon'));
  const day = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10), ins = db.raw.prepare("INSERT INTO stat_kun (kun, hodisa, kalit, platforma, son) VALUES (?, 'ai_sorov', ?, 'veb', ?)"); ins.run(day, 'rasm.limit.mehmon', 20); ins.run(day, 'rasm.limit.akkaunt', 3); ins.run(day, 'rasm.limit.akkaunt_bosildi', 6);
  const h = await STAT.hisobot(db, 7, Date.now()); assert.deepEqual(h.rasmLim, { mehmon: 20, akkaunt: 3, bosildi: 6 }); }
log('Hodisalar: rasm.limit.mehmon / .akkaunt / .akkaunt_bosildi qabul qilinadi (qat\'iy ro\'yxat); admin hisobotida limit bo\'yicha taqsimot');
console.log('\nrasm-limit: ' + n + ' guruh OK');
