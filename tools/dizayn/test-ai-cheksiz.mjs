// KalkiFit «Cheksiz AI» akkaunt belgisi (v74): belgisiz akkaunt limitga tushadi; belgili akkaunt limitdan o'tadi va kuniga 150 da to'xtaydi; belgi FAQAT server sessiyasi orqali ishlaydi
// (mijoz_id, soxta/eskirgan cookie ishlamaydi); email kodda yo'q; admin yoqish/o'chirish + audit jurnali + kunlik hisob; umumiy qidiruv hodisasi va admin'da natijasiz ulush.   node tools/dizayn/test-ai-cheksiz.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { pathToFileURL } from 'node:url';
import { d1 } from './d1-sqlite.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'), imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const RS = await imp('functions/api/kalkifit-rasm.js'), RT = await imp('functions/api/retsept.js'), TX = await imp('functions/api/kalkifit.js'), ADM = await imp('functions/api/admin/[amal].js'), STAT = await imp('functions/api/stat.js'), CK = await imp('functions/_lib/ai-cheksiz.js');
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const rd = (f) => fs.readFileSync(path.join(ROOT, 'migrations', f), 'utf8');
const mig = rd('ai-cheksiz.sql'); assert.match(mig, /ALTER TABLE akkaunt ADD COLUMN ai_cheksiz/); const tbl = mig.split('\n').filter((l) => !/^\s*(--|ALTER)/.test(l)).join('\n');
const db = d1([rd('akkaunt.sql'), rd('zaxira.sql'), rd('zaxira-muddat.sql'), rd('zaxira-tarix.sql'), rd('stat.sql'), rd('admin-stat.sql'), tbl]);
db.raw.exec("CREATE TABLE IF NOT EXISTS audit_dummy (x INTEGER)");
const kv = () => { const m = new Map(); return { get: async (k) => (m.has(k) ? m.get(k) : null), put: async (k, v) => { m.set(k, v); }, delete: async (k) => { m.delete(k); }, m }; };
const env = { ANTHROPIC_API_KEY: 'k', KALKI_AI_KV: kv(), KALKIFIT_DB: db, KALKIFIT_ADMIN_PASSWORD: 'sir-parol', IP_HASH_SALT: 'tuz' };
const JPG = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(300, 7)]).toString('base64');
globalThis.fetch = async (url, opt) => { const b = JSON.parse(opt.body); const img = JSON.stringify(b).includes('"image"'); return { ok: true, status: 200, json: async () => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: img ? '[{"variantlar":[{"nom":"Osh","ehtimol":0.9}],"porsiya":"1 porsiya","g":200,"kcal":300,"o":10,"y":10,"u":30}]' : '[{"nom":"x","porsiya":"1","kcal":100,"o":1,"y":1,"u":1}]' }] }) }; };
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex'), tok = () => crypto.randomBytes(32).toString('base64url');
const now = Date.now(), ABS = now + 100 * 86400000;
const mk = async (id, email, cheksiz, o = {}) => { const t = tok(); db.raw.prepare('INSERT INTO akkaunt (id, email, yaratilgan, oxirgi_kirish, ai_cheksiz) VALUES (?, ?, ?, ?, ?)').run(id, email, now, now, cheksiz ? 1 : 0); db.raw.prepare('INSERT INTO sessiya (id, akkaunt_id, yaratilgan, oxirgi, muddat_abs, qurilma) VALUES (?, ?, ?, ?, ?, ?)').run(sha(t), id, now, o.oxirgi || now, o.abs || ABS, 'test'); return t; };
const A = 'aaaaaaaa11111111', B = 'bbbbbbbb22222222', C = 'cccccccc33333333';
const tA = await mk(A, 'oddiy@example.com', false), tB = await mk(B, 'belgili@example.com', true), tC = await mk(C, 'eski@example.com', true, { abs: now - 1000 });
const H = (t, ip) => ({ 'Content-Type': 'application/json', Origin: 'https://kalki.uz', 'CF-Connecting-IP': ip || '9.9.9.9', ...(t ? { Cookie: '__Host-kalki_s=' + t } : {}) });
const rs = (b, t, ip) => RS.onRequest({ request: new Request('https://kalki.uz/api/kalkifit-rasm', { method: 'POST', headers: H(t, ip), body: JSON.stringify({ img: JPG, ...b }) }), env });
const tx = (b, t, ip) => TX.onRequest({ request: new Request('https://kalki.uz/api/kalkifit', { method: 'POST', headers: H(t, ip), body: JSON.stringify(b) }), env });
const rtq = (b, t, ip) => RT.onRequest({ request: new Request('https://kalki.uz/api/retsept', { method: 'POST', headers: H(t, ip), body: JSON.stringify(b) }), env });
const CID = '11111111-2222-4333-8444-555555555555', P = { mijoz_id: CID, platforma: 'android' };
/* 1. belgisiz akkaunt (sessiyasi bor) — oddiy limit (Android: 2) */
assert.equal((await rs(P, tA)).status, 200); assert.equal((await rs(P, tA)).status, 200); const r3 = await rs(P, tA); assert.equal(r3.status, 429); assert.equal((await r3.json()).sabab, 'mijoz');
log('Belgisiz akkaunt: 2 ta rasm so\'rovi o\'tadi, 3-si 429 (oddiy limit)');
/* 2. soxta / eskirgan / begona cookie va mijoz_id — belgi ishlamaydi */
{ const P2 = { mijoz_id: '22222222-2222-4333-8444-555555555555', platforma: 'android' };
  const ok = async (t) => { await rs(P2, t, '8.8.8.8'); await rs(P2, t, '8.8.8.8'); return (await rs(P2, t, '8.8.8.8')).status; };
  assert.equal(await ok(null), 429, 'cookie yo\'q'); P2.mijoz_id = '33333333-2222-4333-8444-555555555555'; assert.equal(await ok(tok()), 429, 'soxta cookie');
  P2.mijoz_id = '44444444-2222-4333-8444-555555555555'; assert.equal(await ok(tC), 429, 'eskirgan sessiya (muddat_abs o\'tgan) — belgi ishlamaydi'); }
{ const fake = { img: JPG, mijoz_id: '55555555-2222-4333-8444-555555555555', platforma: 'android', ai_cheksiz: true, akkaunt: B, email: 'belgili@example.com' }, go = () => RS.onRequest({ request: new Request('https://kalki.uz/api/kalkifit-rasm', { method: 'POST', headers: { ...H(null, '7.7.7.7'), 'X-Ai-Cheksiz': '1', 'X-Akkaunt': B }, body: JSON.stringify(fake) }), env });
  assert.equal((await go()).status, 200); assert.equal((await go()).status, 200); assert.equal((await go()).status, 429, 'tana/sarlavhadagi «ai_cheksiz» e\'tiborsiz'); }
log('Belgi faqat server sessiyasi orqali: cookie yo\'q / soxta / eskirgan sessiya / tanadagi yoki sarlavhadagi «ai_cheksiz» — oddiy limit');
/* 3. belgili akkaunt limitdan o'tadi (rasm, matn, retsept-qoldi), qoldi = 9999 (ilova «Cheksiz» ko'rsatadi) */
{ const out = []; for (let i = 0; i < 6; i++) { const r = await rs(P, tB, '5.5.5.5'); assert.equal(r.status, 200, 'rasm ' + i); out.push(await r.json()); }
  assert.ok(out.every((j) => j.qoldi === CK.CHEKSIZ_QOLDI), 'rasm javobida qoldi=9999');
  for (let i = 0; i < 3; i++) assert.equal((await tx({ matn: 'zzqxw ovqat ' + i, mijoz_id: CID, platforma: 'android' }, tB, '5.5.5.5')).status, 200, 'matn ' + i);
  assert.deepEqual(await (await rtq({ sorov: 'qoldi', ...P }, tB, '5.5.5.5')).json(), { limit: 2, qoldi: CK.CHEKSIZ_QOLDI }); const qa = await (await rtq({ sorov: 'qoldi', ...P }, tA, '5.5.5.6')).json(); assert.ok(qa.qoldi < 9999); }
log('Belgili akkaunt: rasm 6 + matn 3 so\'rov limitdan o\'tdi; hisoblagich qoldi = 9999 («Cheksiz»), belgisizda oddiy son');
/* 4. kuniga 150 da to'xtaydi (jami, xizmatlar bo'yicha), 151-chi 429 + admin ogohlantirishi */
{ let ok = 9; for (; ok < 150; ok++) { const r = await rs(P, tB, '5.5.5.5'); assert.equal(r.status, 200, 'so\'rov ' + (ok + 1)); }
  const r = await rs(P, tB, '5.5.5.5'); assert.equal(r.status, 429, '151-so\'rov'); assert.equal((await r.json()).sabab, 'cheksiz'); assert.equal((await tx({ matn: 'zzqxw yana', mijoz_id: CID }, tB, '5.5.5.5')).status, 429, 'matn ham to\'xtaydi (umumiy hisob)');
  const jami = db.raw.prepare("SELECT SUM(son) AS n FROM ai_cheksiz_kun WHERE akkaunt_id = ? AND ns != '!chegara'").get(B).n; assert.equal(jami, 150); assert.ok(db.raw.prepare("SELECT son FROM ai_cheksiz_kun WHERE akkaunt_id = ? AND ns = '!chegara'").get(B)); }
log('Belgili akkaunt kuniga 150 ta AI so\'rovda to\'xtaydi (rasm + matn jami), 151-si 429 («cheksiz» sabab), chegara belgisi yoziladi');
/* 5. admin: yoqish/o'chirish (auth, origin, tekshiruv), audit, ro'yxat, kunlik hisob va ogohlantirish */
{ const post = (b, o = {}) => ADM.onRequest({ request: new Request('https://kalki.uz/api/admin/ai-cheksiz', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: o.origin || 'https://kalki.uz', 'CF-Connecting-IP': '1.1.1.1', ...(o.noauth ? {} : { 'X-Admin-Password': 'sir-parol' }) }, body: JSON.stringify(b) }), env, params: { amal: 'ai-cheksiz' } });
  assert.equal((await post({ akkaunt: A, yoq: true }, { noauth: true })).status, 401); assert.equal((await post({ akkaunt: A, yoq: true }, { origin: 'https://evil.example' })).status, 403); assert.equal((await post({ akkaunt: 'zz', yoq: true })).status, 400); assert.equal((await post({ akkaunt: A, yoq: 1 })).status, 400); assert.equal((await post({ akkaunt: 'dddddddd44444444', yoq: true })).status, 404);
  assert.equal((await post({ akkaunt: A, yoq: true })).status, 200); assert.equal(db.raw.prepare('SELECT ai_cheksiz AS c FROM akkaunt WHERE id = ?').get(A).c, 1); assert.equal((await post({ akkaunt: A, yoq: false })).status, 200); assert.equal(db.raw.prepare('SELECT ai_cheksiz AS c FROM akkaunt WHERE id = ?').get(A).c, 0);
  assert.deepEqual(db.raw.prepare("SELECT hodisa FROM audit WHERE akkaunt_id = ? AND hodisa LIKE 'admin_ai_cheksiz%' ORDER BY id").all(A).map((x) => x.hodisa), ['admin_ai_cheksiz_yoq', 'admin_ai_cheksiz_ochir'], 'jurnal (audit)');
  const get = (amal, q = '') => ADM.onRequest({ request: new Request('https://kalki.uz/api/admin/' + amal + q, { headers: { 'X-Admin-Password': 'sir-parol', 'CF-Connecting-IP': '1.1.1.1' } }), env, params: { amal } });
  const list = (await (await get('foydalanuvchilar')).json()).foydalanuvchilar; assert.equal(list.find((x) => x.id === B).ai_cheksiz, 1); assert.equal(list.find((x) => x.id === A).ai_cheksiz, 0);
  assert.equal((await (await get('foydalanuvchilar', '?id=' + B)).json()).ai_cheksiz, 1);
  const st = await (await get('ai-cheksiz-stat')).json(); const row = st.kunlar.find((x) => x.akkaunt === B); assert.equal(row.jami, 150); assert.ok(row.xizmat.img >= 140 && row.xizmat.tx >= 3); assert.equal(row.narx, Math.round(150 * CK.NARX_TAXMINIY * 1000) / 1000); assert.equal(st.chegara, 150); assert.deepEqual(st.ogoh.map((x) => x.akkaunt), [B]);
  assert.equal((await ADM.onRequest({ request: new Request('https://kalki.uz/api/admin/ai-cheksiz-stat'), env, params: { amal: 'ai-cheksiz-stat' } })).status, 401); }
log('Admin: yoqish/o\'chirish (parol, Origin, tekshiruv, 404), audit jurnali, ro\'yxat va tafsilotda belgi, kunlik hisob (xizmat bo\'yicha, taxminiy xarajat), chegaraga yetgan akkaunt ogohlantirishda');
/* 6. email kodda yo'q */
{ const files = ['functions/_lib/ai-cheksiz.js', 'functions/api/kalkifit-quota.js', 'functions/api/admin/[amal].js', 'assets/kalkifit-app.js', 'admin/kalkifit-statistika.html', 'migrations/ai-cheksiz.sql']; for (const f of files) assert.doesNotMatch(fs.readFileSync(path.join(ROOT, f), 'utf8'), /stig707/i, f); }
log('Email kodda/migratsiyada yo\'q — belgi faqat D1 ustuni orqali');
/* 7. umumiy qidiruv hodisasi + admin natijasiz ulush (7 kun) */
{ assert.ok(STAT.HODISA.qidiruv_jami.test('') && STAT.HODISA.qidiruv_natijasiz.test(''));
  const bugun = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10); const old = new Date(Date.now() + 5 * 3600000 - 10 * 86400000).toISOString().slice(0, 10);
  const ins = db.raw.prepare("INSERT INTO stat_kun (kun, hodisa, kalit, platforma, son) VALUES (?, ?, '', 'veb', ?)"); ins.run(bugun, 'qidiruv_jami', 200); ins.run(bugun, 'qidiruv_natijasiz', 22); ins.run(old, 'qidiruv_jami', 1000); ins.run(old, 'qidiruv_natijasiz', 900);
  const h = await STAT.hisobot(db, 7, Date.now()); assert.deepEqual(h.qidiruv7, { kun: 7, jami: 200, natijasiz: 22, foiz: 11 }); }
log('Qidiruv hisobi: «qidiruv_jami» / «qidiruv_natijasiz» qabul qilinadi (so\'zsiz), admin hisobotida 7 kunlik natijasiz ulush (11%), eski kunlar kirmaydi');
console.log('\nai-cheksiz: ' + n + ' guruh OK');
