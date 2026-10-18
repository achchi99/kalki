// Akkaunt (ixtiyoriy kirish: email + kod): server API (functions/api/akkaunt/[amal].js + _lib/akkaunt-*.js, D1 shim) — tarmoqsiz.
// Kod oqimi, noto'g'ri/eskirgan kod, urinish va tezlik chegaralari, sessiya, chiqish, o'chirish, yuklab olish, dev rejimning production'da yopiqligi, server kaliti.
// node tools/dizayn/test-akkaunt-api.mjs
import assert from 'node:assert/strict'; import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath, pathToFileURL } from 'node:url'; import crypto from 'node:crypto';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const API = await imp('functions/api/akkaunt/[amal].js'); const EM = await imp('functions/_lib/akkaunt-email.js'); const KL = await imp('functions/_lib/akkaunt-kalit.js');
const { makeD1 } = await import('./d1-shim.mjs'); const SCHEMA = fs.readFileSync(path.join(ROOT, 'migrations/akkaunt.sql'), 'utf8');
let n = 0; const T = async (name, fn) => { try { await fn(); n++; console.log('OK  ', n + '.', name); } catch (e) { console.log('XATO ' + name + ': ' + (e && e.stack || e)); process.exit(1); } };
const kv = () => { const m = new Map(); return { get: async (k) => m.get(k), put: async (k, v) => { m.set(k, v); }, m }; };
const PEPPER = 'p'.repeat(40), ADMIN = 'admin-parol-sinov';
const mkEnv = (x = {}) => Object.assign({ KALKI_AI_KV: kv(), KALKIFIT_DB: makeD1(SCHEMA), AKKAUNT_OTP_PEPPER: PEPPER, AKKAUNT_DEV: '1', AKKAUNT_ADMIN_PASSWORD: ADMIN, IP_HASH_SALT: 'tuz' }, x);
const PREVIEW = 'https://akkaunt.kalki-10y.pages.dev', PROD = 'https://kalki.uz';
let NOW = Date.now(); const realNow = Date.now; Date.now = () => NOW; const adv = (ms) => { NOW += ms; };
let ipN = 0;
async function call(env, amal, { method, body, cookie, origin, ip, host, ct, headers } = {}) {
  method = method || (['sessiya', 'qurilmalar', 'dev-kod'].includes(amal) ? 'GET' : 'POST'); host = host || PREVIEW;
  const h = Object.assign({ 'CF-Connecting-IP': ip || '9.9.9.' + (++ipN % 250), 'User-Agent': 'Mozilla/5.0 (Linux; Android 14) Chrome/120 Mobile Safari/537.36' }, headers || {});
  if (method === 'POST') h['Content-Type'] = ct || 'application/json'; if (origin !== null) h.Origin = origin || host; if (cookie) h.Cookie = cookie;
  const res = await API.onRequest({ request: new Request(host + '/api/akkaunt/' + amal + (body && body.__qs ? body.__qs : ''), { method, headers: h, body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body || {})) : undefined }), env, params: { amal } });
  const txt = await res.text(); let j = null; try { j = JSON.parse(txt); } catch (e) {} return { s: res.status, j, h: res.headers, txt, cookie: (res.headers.get('Set-Cookie') || '').split(';')[0] };
}
const devKod = async (env, email) => { const r = await call(env, 'dev-kod', { headers: { 'X-Admin-Password': ADMIN }, body: { __qs: '?email=' + encodeURIComponent(email) } }); assert.equal(r.s, 200, 'dev-kod ' + r.txt); return r.j.kod; };
async function kirish(env, email, ip, gap) {                      // kod so'rash + dev orqali olish + kirish → cookie (gap: oldingi so'rovdan beri o'tgan vaqt — 60 s kutish)
  adv(gap || 61000); const k = await call(env, 'kod', { body: { email }, ip }); assert.equal(k.s, 200, k.txt); const kod = await devKod(env, email);
  const r = await call(env, 'kirish', { body: { email, kod }, ip }); assert.equal(r.s, 200, r.txt); return { cookie: r.cookie, r, kod };
}
const raw = (env, q, ...a) => env.KALKIFIT_DB._raw.prepare(q).all(...a);

await T('xizmat sozlanmasa: pepper yo\'q / dev ham, kalit ham yo\'q → yoqilgan:false, boshqa endpoint 503', async () => {
  for (const env of [mkEnv({ AKKAUNT_OTP_PEPPER: undefined }), mkEnv({ AKKAUNT_DEV: undefined }), mkEnv({ KALKIFIT_DB: undefined }), mkEnv({ AKKAUNT_OTP_PEPPER: 'qisqa' })]) {
    const s = await call(env, 'sessiya'); assert.equal(s.s, 200); assert.deepEqual(s.j, { yoqilgan: false });
    assert.equal((await call(env, 'kod', { body: { email: 'a@b.uz' } })).s, 503);
  }
  const env = mkEnv(); env.KALKIFIT_DB = makeD1('SELECT 1');                   // migratsiya yurgizilmagan
  assert.deepEqual((await call(env, 'sessiya')).j, { yoqilgan: false });
});

await T('PRODUCTION\'DA DEV YO\'Q: kalki.uz / www / kalki-10y.pages.dev da AKKAUNT_DEV=1 bo\'lsa ham dev rejim ochilmaydi; Resend kaliti yo\'q → kirish yopiq', async () => {
  for (const host of [PROD, 'https://www.kalki.uz', 'https://kalki-10y.pages.dev']) {
    const env = mkEnv(); assert.equal(EM.devRuxsat(env, new Request(host + '/x')), false, host);
    assert.deepEqual((await call(env, 'sessiya', { host })).j, { yoqilgan: false }, host);
    assert.equal((await call(env, 'kod', { host, body: { email: 'a@b.uz' } })).s, 503); assert.equal((await call(env, 'dev-kod', { host, headers: { 'X-Admin-Password': ADMIN }, body: { __qs: '?email=a@b.uz' } })).s, 503);
  }
  assert.equal(EM.devRuxsat(mkEnv({ AKKAUNT_DEV: '0' }), new Request(PREVIEW + '/x')), false);                    // preview'da ham faqat AKKAUNT_DEV=1 bilan
  assert.equal(EM.devRuxsat(mkEnv(), new Request('https://evil.com/x')), false); assert.equal(EM.devRuxsat(mkEnv(), new Request('http://localhost:8788/x')), false);   // ALLOW_LOCAL_ORIGIN yo'q
  assert.equal(EM.devRuxsat(mkEnv({ ALLOW_LOCAL_ORIGIN: '1' }), new Request('http://localhost:8788/x')), true);
  // production'da kalit bo'lsa — Resend rejimi, dev-kod endpoint 404 (kod hech qachon ko'rinmaydi)
  const env = mkEnv({ AKKAUNT_EMAIL_API_KEY: 're_' + 'x'.repeat(20) }); const sent = []; const f0 = globalThis.fetch; globalThis.fetch = async (u, o) => { sent.push({ u, o }); return new Response('{"id":"1"}', { status: 200 }); };
  try {
    assert.equal((await call(env, 'sessiya', { host: PROD })).j.yoqilgan, true); assert.equal((await call(env, 'sessiya', { host: PROD })).j.dev, false);
    const k = await call(env, 'kod', { host: PROD, body: { email: 'Odam@Mail.RU ', til: 'ru' } }); assert.equal(k.s, 200); assert.equal(k.j.dev, false);
    assert.equal(sent.length, 1); assert.equal(sent[0].u, 'https://api.resend.com/emails'); assert.match(sent[0].o.headers.Authorization, /^Bearer re_x+$/);
    const b = JSON.parse(sent[0].o.body); assert.deepEqual(b.to, ['odam@mail.ru']); assert.match(b.text, /Ваш код входа: \d{6}/); assert.match(b.subject, /^Код входа Kalki\.uz: \d{6}$/);
    const kod = /(\d{6})/.exec(b.text)[1];
    assert.equal((await call(env, 'dev-kod', { host: PROD, headers: { 'X-Admin-Password': ADMIN }, body: { __qs: '?email=odam@mail.ru' } })).s, 404);
    assert.equal(raw(env, "SELECT name FROM sqlite_master WHERE name = 'dev_kod'").length, 0, "production'da dev_kod jadvali ochilmaydi, kod hech qayerga yozilmaydi"); assert.ok(![...env.KALKI_AI_KV.m.keys()].some((k2) => k2.startsWith('akk:dev')));
    const r = await call(env, 'kirish', { host: PROD, body: { email: 'odam@mail.ru', kod } }); assert.equal(r.s, 200);
    assert.match(r.h.get('Set-Cookie'), /^__Host-kalki_s=[A-Za-z0-9_-]{43}; Path=\/; Max-Age=\d+; HttpOnly; SameSite=Lax; Secure$/);
    globalThis.fetch = async () => new Response('{}', { status: 422 });                                                   // provayder xato → 502, hisoblagich ishlaydi
    adv(61000); assert.equal((await call(env, 'kod', { host: PROD, body: { email: 'boshqa@mail.ru' } })).s, 502);
  } finally { globalThis.fetch = f0; }
});

await T('kod oqimi: kod → (dev) → kirish → yangi akkaunt; ikkinchi kirish — mavjud; kod 1 martalik; email kichik harfga', async () => {
  const env = mkEnv(); const s0 = await call(env, 'sessiya'); assert.deepEqual(s0.j, { yoqilgan: true, dev: true, kirgan: false });
  const k = await call(env, 'kod', { body: { email: '  Test.User@Gmail.com ' } }); assert.equal(k.s, 200); assert.deepEqual(k.j, { ok: true, kut: 60, dev: true });
  const kod = await devKod(env, 'test.user@gmail.com'); assert.match(kod, /^\d{6}$/);
  const r = await call(env, 'kirish', { body: { email: 'TEST.user@gmail.com', kod: kod.slice(0, 3) + ' ' + kod.slice(3) } }); assert.equal(r.s, 200, r.txt); assert.equal(r.j.yangi, true); assert.equal(r.j.email, 'test.user@gmail.com'); assert.equal(r.j.marketing, 0);
  const s1 = await call(env, 'sessiya', { cookie: r.cookie }); assert.equal(s1.j.kirgan, true); assert.equal(s1.j.email, 'test.user@gmail.com'); assert.equal(s1.j.marketing, 0); assert.equal(s1.j.qurilmalar, 1);
  assert.equal((await call(env, 'kirish', { body: { email: 'test.user@gmail.com', kod } })).j.e, 'kod_yoq', 'kod bir martalik');
  adv(61000); await call(env, 'kod', { body: { email: 'test.user@gmail.com' } }); const kod2 = await devKod(env, 'test.user@gmail.com');
  const r2 = await call(env, 'kirish', { body: { email: 'test.user@gmail.com', kod: kod2 } }); assert.equal(r2.s, 200); assert.equal(r2.j.yangi, false);
  assert.equal(raw(env, 'SELECT COUNT(*) AS c FROM akkaunt')[0].c, 1); assert.equal(raw(env, 'SELECT COUNT(*) AS c FROM sessiya')[0].c, 2);
  const a = raw(env, 'SELECT * FROM akkaunt')[0]; assert.deepEqual(Object.keys(a).sort(), ['email', 'google_sub', 'id', 'marketing', 'marketing_matn_v', 'marketing_vaqt', 'oxirgi_kirish', 'usul', 'yaratilgan']); assert.equal(a.usul, 'email'); assert.match(a.id, /^[0-9a-f]{24}$/);
});

await T('xavfsizlik: kod bazada xesh (ochiq emas), sessiya token bazada xesh; cookie bayroqlari; javoblar no-store', async () => {
  const env = mkEnv(); const { cookie, kod, r } = await kirish(env, 'x@y.uz');
  const rows = raw(env, 'SELECT * FROM kirish_kodi'); assert.equal(rows.length, 1); assert.match(rows[0].kod_hash, /^[0-9a-f]{64}$/); assert.notEqual(rows[0].kod_hash, kod);
  assert.equal(rows[0].kod_hash, crypto.createHmac('sha256', PEPPER).update('kod|x@y.uz|kirish|' + kod).digest('hex'), 'HMAC(pepper) xeshi');
  const all = JSON.stringify(['akkaunt', 'kirish_kodi', 'sessiya', 'limit_hisob', 'audit'].map((t) => raw(env, 'SELECT * FROM ' + t))); assert.ok(!all.includes('"' + kod + '"') && !all.includes(':' + kod + '"'), 'ochiq kod bazada yo\'q');
  const token = /kalki_s=([A-Za-z0-9_-]{43})/.exec(r.h.get('Set-Cookie'))[1]; assert.ok(!all.includes(token), 'token bazada ochiq yo\'q'); assert.equal(raw(env, 'SELECT id FROM sessiya')[0].id, crypto.createHash('sha256').update(token).digest('hex'));
  assert.match(r.h.get('Set-Cookie'), /HttpOnly/); assert.match(r.h.get('Set-Cookie'), /SameSite=Lax/); assert.match(r.h.get('Set-Cookie'), /^__Host-kalki_s=/); assert.match(r.h.get('Set-Cookie'), /; Secure$/); assert.doesNotMatch(r.h.get('Set-Cookie'), /Domain=/);
  assert.equal(r.h.get('Cache-Control'), 'no-store');
  assert.equal(raw(env, 'SELECT COUNT(*) AS c FROM audit WHERE akkaunt_id IS NOT NULL')[0].c, 1); assert.doesNotMatch(JSON.stringify(raw(env, 'SELECT * FROM audit')), /x@y\.uz|9\.9\.9/, 'audit\'da email/IP yo\'q');
});

await T('noto\'g\'ri kod: "kod_xato"; 5 urinishdan keyin kod qulflanadi (to\'g\'ri kod ham o\'tmaydi); yangi kod so\'rash qulfni ochadi', async () => {
  const env = mkEnv(); const email = 'q@w.uz'; await call(env, 'kod', { body: { email } }); const kod = await devKod(env, email), bad = kod === '000000' ? '111111' : '000000';
  for (let i = 0; i < 4; i++) { const r = await call(env, 'kirish', { body: { email, kod: bad } }); assert.equal(r.s, 400); assert.equal(r.j.e, 'kod_xato'); }
  const r5 = await call(env, 'kirish', { body: { email, kod: bad } }); assert.equal(r5.j.e, 'kod_qulf');
  assert.equal((await call(env, 'kirish', { body: { email, kod } })).j.e, 'kod_qulf', 'to\'g\'ri kod ham o\'tmaydi'); assert.equal(raw(env, 'SELECT COUNT(*) AS c FROM akkaunt')[0].c, 0);
  adv(61000); await call(env, 'kod', { body: { email } }); const kod2 = await devKod(env, email); assert.equal((await call(env, 'kirish', { body: { email, kod: kod2 } })).s, 200);
  assert.equal((await call(env, 'kirish', { body: { email, kod: 'abc123' } })).j.e, 'kod_xato'); assert.equal((await call(env, 'kirish', { body: { email, kod: '12345' } })).j.e, 'kod_xato');
});

await T('eskirgan kod (10 daqiqa) o\'tmaydi; yangi kod eskisini bekor qiladi', async () => {
  const env = mkEnv(); const email = 'e@s.uz'; await call(env, 'kod', { body: { email } }); const eski = await devKod(env, email); adv(10 * 60000 + 1000);
  assert.equal((await call(env, 'kirish', { body: { email, kod: eski } })).j.e, 'kod_yoq');
  await call(env, 'kod', { body: { email } }); const k1 = await devKod(env, email); adv(61000); await call(env, 'kod', { body: { email } }); const k2 = await devKod(env, email);
  if (k1 !== k2) assert.equal((await call(env, 'kirish', { body: { email, kod: k1 } })).j.e, 'kod_xato', 'eski kod bekor (faol kod — yangisi)'); assert.equal((await call(env, 'kirish', { body: { email, kod: k2 } })).s, 200);
  assert.equal((await call(env, 'kirish', { body: { email: 'hech@kim.uz', kod: '123456' } })).j.e, 'kod_yoq', 'so\'ralmagan email');
});

await T('tezlik chegarasi: email 60 s kutish, soatiga 8, kuniga 20; IP soatiga 20; tekshirish IP 30/soat; chegara oynasi tugagach tiklanadi', async () => {
  let env = mkEnv(); const email = 'l@m.uz';
  assert.equal((await call(env, 'kod', { body: { email } })).s, 200); const c = await call(env, 'kod', { body: { email } }); assert.equal(c.s, 429); assert.equal(c.j.e, 'kut'); assert.ok(c.j.kut >= 1 && c.j.kut <= 60);
  for (let i = 1; i < 8; i++) { adv(61000); assert.equal((await call(env, 'kod', { body: { email } })).s, 200, 'urinish ' + (i + 1)); }
  adv(61000); const h = await call(env, 'kod', { body: { email } }); assert.equal(h.s, 429); assert.equal(h.j.e, 'limit'); assert.ok(h.j.kut > 0);
  adv(3600000); assert.equal((await call(env, 'kod', { body: { email } })).s, 200, 'soat oynasi o\'tgach yana mumkin');
  env = mkEnv(); for (let i = 0; i < 20; i++) assert.equal((await call(env, 'kod', { ip: '5.5.5.5', body: { email: 'u' + i + '@x.uz' } })).s, 200); const ipl = await call(env, 'kod', { ip: '5.5.5.5', body: { email: 'u99@x.uz' } }); assert.equal(ipl.s, 429); assert.equal(ipl.j.e, 'limit');
  assert.equal((await call(env, 'kod', { ip: '6.6.6.6', body: { email: 'u99@x.uz' } })).s, 200, 'boshqa IP ta\'sirlanmaydi');
  env = mkEnv(); for (let i = 0; i < 30; i++) await call(env, 'kirish', { ip: '7.7.7.7', body: { email: 'z@z.uz', kod: '123456' } }); assert.equal((await call(env, 'kirish', { ip: '7.7.7.7', body: { email: 'z@z.uz', kod: '123456' } })).j.e, 'limit');
  const lk = raw(env, 'SELECT kalit FROM limit_hisob').map((r) => r.kalit).join(' '); assert.doesNotMatch(lk, /7\.7\.7\.7|z@z\.uz/, 'limit kalitlarida IP/email ochiq emas');
  env = mkEnv(); adv(86400000 + 1000); for (let i = 0; i < 20; i++) { await call(env, 'kod', { body: { email: 'kun@x.uz' } }); adv(3600000 + 61000); }   // soat oynasi har safar tozalanadi, kunlik — 20 ta
  adv(61000); assert.equal((await call(env, 'kod', { body: { email: 'kun@x.uz' } })).j.e, 'limit', 'kuniga 20');
});

await T('enumeratsiya yo\'q: mavjud va mavjud bo\'lmagan email uchun kod so\'rovi bir xil javob; noto\'g\'ri email 400', async () => {
  const env = mkEnv(); await kirish(env, 'bor@x.uz'); adv(61000);
  const a = await call(env, 'kod', { body: { email: 'bor@x.uz' } }), b = await call(env, 'kod', { body: { email: 'yoq@x.uz' } }); assert.equal(a.s, 200); assert.deepEqual(a.j, b.j);
  for (const e of ['', 'abc', 'a@b', 'a b@c.uz', '@x.uz', 'a@@x.uz', null, 5, 'a'.repeat(300) + '@x.uz']) { const r = await call(env, 'kod', { body: { email: e } }); assert.equal(r.s, 400, String(e).slice(0, 20)); assert.equal(r.j.e, 'email'); }
});

await T('CSRF: Origin yo\'q / begona → 403; JSON bo\'lmasa 415; GET\'da ham begona Origin 403; noma\'lum amal 404; noto\'g\'ri usul 405', async () => {
  const env = mkEnv(); const { cookie } = await kirish(env, 'c@s.uz');
  assert.equal((await call(env, 'marketing', { origin: null, cookie, body: { rozi: true } })).s, 403); assert.equal((await call(env, 'marketing', { origin: 'https://evil.com', cookie, body: { rozi: true } })).s, 403);
  assert.equal((await call(env, 'marketing', { cookie, ct: 'text/plain', body: 'rozi=1' })).s, 415); assert.equal((await call(env, 'sessiya', { origin: 'https://evil.com', cookie })).s, 403);
  assert.equal((await call(env, 'marketing', { cookie, body: '{bad' })).s, 400); assert.equal((await call(env, 'yoq')).s, 404); assert.equal((await call(env, 'kod', { method: 'GET' })).s, 405);
  assert.equal((await call(env, 'sessiya', { cookie })).j.marketing, 0, 'rad etilgan so\'rovlar hech narsani o\'zgartirmadi');
});

await T('sessiya: kirilmagan → 401; noto\'g\'ri cookie → kirgan:false + cookie o\'chiriladi; sliding 30 kun; mutlaq 180 kun; ko\'p qurilma, bittadan chiqish, hammasidan chiqish', async () => {
  const env = mkEnv(); assert.equal((await call(env, 'marketing', { body: { rozi: true } })).s, 401); assert.equal((await call(env, 'yuklab')).s, 401);
  const bad = await call(env, 'sessiya', { cookie: '__Host-kalki_s=' + 'A'.repeat(43) }); assert.equal(bad.j.kirgan, false); assert.match(bad.h.get('Set-Cookie'), /Max-Age=0/);
  const bad2 = await call(env, 'marketing', { cookie: '__Host-kalki_s=' + 'A'.repeat(43), body: { rozi: true } }); assert.equal(bad2.s, 401); assert.match(bad2.h.get('Set-Cookie'), /Max-Age=0/);
  const A = await kirish(env, 'ses@x.uz'); adv(61000); await call(env, 'kod', { body: { email: 'ses@x.uz' } }); const B = { cookie: (await call(env, 'kirish', { body: { email: 'ses@x.uz', kod: await devKod(env, 'ses@x.uz') } })).cookie };
  assert.notEqual(A.cookie, B.cookie); assert.equal((await call(env, 'sessiya', { cookie: A.cookie })).j.qurilmalar, 2);
  const q = await call(env, 'qurilmalar', { cookie: A.cookie }); assert.equal(q.j.qurilmalar.length, 2); assert.equal(q.j.qurilmalar.filter((x) => x.joriy).length, 1); assert.match(q.j.qurilmalar[0].qurilma, /Chrome · Android/);
  const ch = await call(env, 'chiqish', { cookie: A.cookie, body: {} }); assert.equal(ch.s, 200); assert.match(ch.h.get('Set-Cookie'), /Max-Age=0/); assert.equal((await call(env, 'sessiya', { cookie: A.cookie })).j.kirgan, false); assert.equal((await call(env, 'sessiya', { cookie: B.cookie })).j.kirgan, true, 'boshqa qurilma qoladi');
  const C = await kirish(env, 'ses@x.uz');
  const hm = await call(env, 'chiqish', { cookie: C.cookie, body: { hammasi: true } }); assert.equal(hm.s, 200); assert.equal((await call(env, 'sessiya', { cookie: B.cookie })).j.kirgan, false); assert.equal(raw(env, 'SELECT COUNT(*) AS c FROM sessiya')[0].c, 0);
  assert.equal((await call(env, 'chiqish', { body: {} })).s, 200, 'chiqish takrorlansa ham xato emas');
  // sliding: har 20 kunda faollik → davom; 31 kun jim → tugaydi; 180 kun mutlaq
  const D = await kirish(env, 'ses@x.uz'); for (let i = 0; i < 9; i++) { adv(20 * 86400000); const s = await call(env, 'sessiya', { cookie: D.cookie }); assert.equal(s.j.kirgan, (i + 1) * 20 < 180, 'kun ' + (i + 1) * 20); }   // faol bo'lsa sliding davom etadi, lekin 180 kunda mutlaq tugaydi
  const F = await kirish(env, 'ses2@x.uz'); adv(31 * 86400000); assert.equal((await call(env, 'sessiya', { cookie: F.cookie })).j.kirgan, false, '30 kundan ortiq jim');
  assert.equal(raw(env, "SELECT COUNT(*) AS c FROM sessiya WHERE akkaunt_id IN (SELECT id FROM akkaunt WHERE email='ses2@x.uz')")[0].c, 0, 'eskirgan sessiya bazadan o\'chadi');
});

await T('sessiya soni 20 bilan cheklanadi (eng eskilari chiqariladi)', async () => {
  const env = mkEnv({ AKKAUNT_EMAIL_KUN_LIMIT: '100' }); const ck = []; for (let i = 0; i < 22; i++) ck.push((await kirish(env, 'kop@x.uz', undefined, 500000)).cookie);
  assert.equal(raw(env, 'SELECT COUNT(*) AS c FROM sessiya')[0].c, 20); assert.equal((await call(env, 'sessiya', { cookie: ck[0] })).j.kirgan, false); assert.equal((await call(env, 'sessiya', { cookie: ck[21] })).j.kirgan, true);
});

await T('marketing roziligi: odatda 0; yoqish/o\'chirish vaqt va matn versiyasi bilan; faqat haqiqiy boolean', async () => {
  const env = mkEnv(); const { cookie } = await kirish(env, 'm@x.uz'); assert.equal(raw(env, 'SELECT marketing, marketing_vaqt FROM akkaunt')[0].marketing, 0);
  for (const bad of [{}, { rozi: 1 }, { rozi: 'true' }, { rozi: null }]) assert.equal((await call(env, 'marketing', { cookie, body: bad })).s, 400);
  const on = await call(env, 'marketing', { cookie, body: { rozi: true } }); assert.deepEqual(on.j, { ok: true, marketing: 1 }); let a = raw(env, 'SELECT * FROM akkaunt')[0]; assert.equal(a.marketing, 1); assert.equal(a.marketing_vaqt, NOW); assert.equal(a.marketing_matn_v, 'm1');
  assert.equal((await call(env, 'sessiya', { cookie })).j.marketing, 1); adv(1000); await call(env, 'marketing', { cookie, body: { rozi: false } }); a = raw(env, 'SELECT * FROM akkaunt')[0]; assert.equal(a.marketing, 0); assert.equal(a.marketing_vaqt, NOW);
});

await T('ma\'lumotni yuklab olish: faqat o\'z akkaunti, minimal maydonlar (ism/telefon yo\'q), token yo\'q', async () => {
  const env = mkEnv(); const A = await kirish(env, 'ya@x.uz'); adv(61000); await kirish(env, 'boshqa@x.uz'); await call(env, 'marketing', { cookie: A.cookie, body: { rozi: true } });
  const y = await call(env, 'yuklab', { cookie: A.cookie }); assert.equal(y.s, 200); assert.equal(y.j.v, 1); assert.equal(y.j.akkaunt.email, 'ya@x.uz'); assert.equal(y.j.akkaunt.marketing, 1); assert.equal(y.j.qurilmalar.length, 1);
  assert.deepEqual(Object.keys(y.j.akkaunt).sort(), ['email', 'id', 'marketing', 'marketing_matn_v', 'marketing_vaqt', 'oxirgi_kirish', 'usul', 'yaratilgan']); assert.ok(!y.txt.includes('boshqa@x.uz')); assert.doesNotMatch(y.txt, /kalki_s|kod_hash|token/i);
});

await T('akkauntni o\'chirish: faqat kirgan va email kodi bilan; hammasi (akkaunt, sessiyalar, kodlar, audit) o\'chadi; keyin shu email yangi akkaunt', async () => {
  const env = mkEnv(); const A = await kirish(env, 'del@x.uz'); adv(61000); const B = await kirish(env, 'saqla@x.uz'); adv(61000);
  assert.equal((await call(env, 'ochirish', { body: { kod: '123456' } })).s, 401); assert.equal((await call(env, 'kod', { body: { maqsad: 'ochirish' } })).s, 401);
  const idA = raw(env, "SELECT id FROM akkaunt WHERE email='del@x.uz'")[0].id;
  // kirish kodi o'chirishga YARAMAYDI (maqsad alohida)
  await call(env, 'kod', { body: { email: 'del@x.uz' } }); const kk = await devKod(env, 'del@x.uz'); assert.equal((await call(env, 'ochirish', { cookie: A.cookie, body: { kod: kk } })).j.e, 'kod_yoq');
  adv(61000); const ko = await call(env, 'kod', { cookie: A.cookie, body: { maqsad: 'ochirish', email: 'saqla@x.uz' } }); assert.equal(ko.s, 200); const dk = await devKod(env, 'del@x.uz');
  assert.equal((await call(env, 'ochirish', { cookie: A.cookie, body: { kod: dk === '000000' ? '111111' : '000000' } })).j.e, 'kod_xato'); assert.equal(raw(env, 'SELECT COUNT(*) AS c FROM akkaunt')[0].c, 2);
  assert.equal((await call(env, 'ochirish', { cookie: B.cookie, body: { kod: dk } })).j.e, 'kod_yoq', 'boshqa akkaunt kodi bilan o\'chirib bo\'lmaydi'); assert.equal(raw(env, 'SELECT COUNT(*) AS c FROM akkaunt')[0].c, 2);
  const d = await call(env, 'ochirish', { cookie: A.cookie, body: { kod: dk } }); assert.equal(d.s, 200); assert.match(d.h.get('Set-Cookie'), /Max-Age=0/);
  assert.equal(raw(env, "SELECT COUNT(*) AS c FROM akkaunt WHERE email='del@x.uz'")[0].c, 0); assert.equal(raw(env, 'SELECT COUNT(*) AS c FROM sessiya WHERE akkaunt_id = ?', idA)[0].c, 0); assert.equal(raw(env, "SELECT COUNT(*) AS c FROM kirish_kodi WHERE email='del@x.uz'")[0].c, 0); assert.equal(raw(env, 'SELECT COUNT(*) AS c FROM audit WHERE akkaunt_id = ?', idA)[0].c, 0);
  assert.equal((await call(env, 'sessiya', { cookie: A.cookie })).j.kirgan, false); assert.equal((await call(env, 'sessiya', { cookie: B.cookie })).j.kirgan, true, 'boshqa akkaunt tegilmagan');
  adv(61000); const re = await kirish(env, 'del@x.uz'); assert.equal(re.r.j.yangi, true); assert.notEqual(raw(env, "SELECT id FROM akkaunt WHERE email='del@x.uz'")[0].id, idA);
});

await T('dev-kod: parolsiz/noto\'g\'ri parol 401; IP chegarasi; faqat dev rejimda', async () => {
  const env = mkEnv(); await call(env, 'kod', { body: { email: 'd@x.uz' } });
  assert.equal((await call(env, 'dev-kod', { body: { __qs: '?email=d@x.uz' } })).s, 401); assert.equal((await call(env, 'dev-kod', { headers: { 'X-Admin-Password': 'xato' }, body: { __qs: '?email=d@x.uz' } })).s, 401);
  assert.equal((await call(env, 'dev-kod', { headers: { 'X-Admin-Password': ADMIN }, body: { __qs: '?email=yoq@x.uz' } })).s, 404);
  for (let i = 0; i < 60; i++) await call(env, 'dev-kod', { ip: '3.3.3.3', headers: { 'X-Admin-Password': 'x' }, body: { __qs: '?email=d@x.uz' } }); assert.equal((await call(env, 'dev-kod', { ip: '3.3.3.3', headers: { 'X-Admin-Password': ADMIN }, body: { __qs: '?email=d@x.uz' } })).s, 429);
});

await T('akkauntsiz rejim avvalgidek: zaxira API akkaunt jadvallarisiz ishlaydi; akkaunt endpointlari zaxira jadvaliga tegmaydi', async () => {
  const Z = await imp('functions/api/zaxira.js'); const zs = fs.readFileSync(path.join(ROOT, 'migrations/zaxira.sql'), 'utf8');
  const env = { KALKI_AI_KV: kv(), KALKIFIT_DB: makeD1(zs) };                         // akkaunt migratsiyasi yo'q, pepper yo'q
  const id = 'a'.repeat(64), blob = 'B'.repeat(40); const put = await Z.onRequest({ request: new Request('https://kalki.uz/api/zaxira', { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: 'https://kalki.uz' }, body: JSON.stringify({ id, ilova: 'kalkifit', kutilgan: 0, blob }) }), env }); assert.equal(put.status, 200);
  const get = await Z.onRequest({ request: new Request('https://kalki.uz/api/zaxira?id=' + id, { headers: { Origin: 'https://kalki.uz' } }), env }); assert.equal((await get.json()).blob, blob);
  assert.deepEqual((await call(env, 'sessiya', { host: PROD })).j, { yoqilgan: false });
  const env2 = mkEnv(); env2.KALKIFIT_DB._raw.exec(zs); await kirish(env2, 'z@x.uz'); assert.equal(env2.KALKIFIT_DB._raw.prepare('SELECT COUNT(*) AS c FROM zaxira').get().c, 0);
  const sch = fs.readFileSync(path.join(ROOT, 'migrations/akkaunt.sql'), 'utf8'); assert.doesNotMatch(sch, /zaxira\s*\(|REFERENCES\s+zaxira/i, 'A bosqichda akkaunt zaxiraga bog\'lanmaydi');
});

await T('server kaliti (AKKAUNT_MASTER_KEYS): format, birinchisi joriy, almashtirish, xato formatlar rad etiladi; barmoq izi kalitni oshkor qilmaydi', async () => {
  const K1 = 'a'.repeat(43), K2 = 'B1'.repeat(30);
  assert.equal(KL.kalitlar({}), null); assert.equal(KL.kalitlar({ AKKAUNT_MASTER_KEYS: '' }), null);
  const one = KL.kalitlar({ AKKAUNT_MASTER_KEYS: '1:' + K1 }); assert.equal(one.joriy.v, 1); assert.equal(one.hammasi.length, 1);
  const two = KL.kalitlar({ AKKAUNT_MASTER_KEYS: '2:' + K2 + ', 1:' + K1 }); assert.equal(two.joriy.v, 2); assert.equal(two.joriy.kalit, K2); assert.deepEqual(two.hammasi.map((x) => x.v), [2, 1]);
  for (const bad of ['1:qisqa', K1, '0:' + K1, '1:' + K1 + ',1:' + K2, 'x:' + K1, '1:' + K1 + ',', '1:' + 'a b'.repeat(20)]) assert.equal(KL.kalitlar({ AKKAUNT_MASTER_KEYS: bad }), null, bad);
  const f = await KL.izi(K1); assert.match(f, /^[0-9a-f]{8}$/); assert.equal(f, await KL.izi(K1)); assert.notEqual(f, await KL.izi(K2)); assert.ok(!K1.includes(f));
});

await T('dev kod ishonchliligi (preview xatosi): ketma-ket ikki so\'rovda OXIRGI kod; "000042" kabi 0 bilan boshlanadigan kod; katta harfli email/bo\'shliqli kod; eski kod bekor; kirish aynan dev-kod qaytargan qiymat bilan o\'tadi', async () => {
  const env = mkEnv(); const E1 = 'Achchii99@Gmail.COM '; const norm = 'achchii99@gmail.com';
  const WC = globalThis.crypto; const gv = WC.getRandomValues.bind(WC); const set = (n) => Object.defineProperty(WC, 'getRandomValues', { configurable: true, writable: true, value: (a) => { if (a instanceof Uint32Array) { a[0] = n; return a; } return gv(a); } });
  try {
    set(11); assert.equal((await call(env, 'kod', { body: { email: E1 } })).s, 200); const k1 = await devKod(env, norm); assert.equal(k1, '000011', '0 bilan boshlanadigan kod satr sifatida qaytadi');
    adv(61000); set(222222); assert.equal((await call(env, 'kod', { body: { email: norm } })).s, 200);
    for (let i = 0; i < 5; i++) assert.equal(await devKod(env, 'ACHCHII99@gmail.com'), '222222', 'har o\'qishda OXIRGI kod (' + i + ')');
    assert.equal((await call(env, 'kirish', { body: { email: norm, kod: k1 } })).j.e, 'kod_xato', 'eski kod bekor');
    const r = await call(env, 'kirish', { body: { email: 'ACHCHII99@GMAIL.com', kod: ' 222 222 ' } }); assert.equal(r.s, 200, r.txt); assert.equal(r.j.email, norm);
    adv(61000); set(7); await call(env, 'kod', { body: { email: norm } }); const z = await devKod(env, norm); assert.equal(z, '000007');
    const rz = await call(env, 'kirish', { body: { email: norm, kod: z } }); assert.equal(rz.s, 200, '0 bilan boshlanadigan kod o\'tadi'); assert.equal(rz.j.yangi, false);
    assert.equal(raw(env, 'SELECT COUNT(*) AS c FROM dev_kod')[0].c, 1, 'har email uchun bitta (oxirgi) dev yozuvi');
    adv(11 * 60000); assert.equal((await call(env, 'dev-kod', { headers: { 'X-Admin-Password': ADMIN }, body: { __qs: '?email=' + norm } })).s, 404, 'dev kod 10 daqiqadan keyin ko\'rinmaydi');
  } finally { delete WC.getRandomValues; }
});

await T('eksport/import (VPS\'ga ko\'chirish): akkaunt JSON → yangi SQLite bir xil; qayta yurgizish ikkilantirmaydi; kodlar/limitlar ko\'chmaydi; Postgres SQL; buzuq fayl rad etiladi; kalit vositasi lib bilan mos', async () => {
  const { execFileSync } = await import('node:child_process'); const os = await import('node:os'); const { createRequire } = await import('node:module'); const require = createRequire(import.meta.url);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'akk-')); try {
    const env = mkEnv(); const A = await kirish(env, 'ko\'chish@x.uz'); await call(env, 'marketing', { cookie: A.cookie, body: { rozi: true } }); await kirish(env, 'ikkinchi@x.uz'); await call(env, 'kod', { body: { email: 'kutayotgan@x.uz' } });
    const src = path.join(tmp, 'src.sqlite'); env.KALKIFIT_DB._raw.exec("VACUUM INTO '" + src + "'");
    const ex = path.join(ROOT, 'tools/akkaunt-export.js'), im = path.join(ROOT, 'tools/akkaunt-import.js'), out = path.join(tmp, 'ex');
    execFileSync('node', [ex, '--sqlite', src, '--out', out], { encoding: 'utf8' }); const j = JSON.parse(fs.readFileSync(out + '.json', 'utf8'));
    assert.equal(j.v, 1); assert.equal(j.jadvallar.akkaunt.length, 2); assert.deepEqual(Object.keys(j.jadvallar), ['akkaunt']); assert.equal(j.jadvallar.akkaunt.find((a) => a.email === 'ko\'chish@x.uz').marketing, 1);
    assert.equal(fs.statSync(out + '.json').mode & 0o077, 0, 'fayl faqat egasiga ochiq (0600)'); assert.doesNotMatch(fs.readFileSync(out + '.json', 'utf8'), /kod_hash|limit_hisob|kalki_s/);
    execFileSync('node', [ex, '--sqlite', src, '--out', out + '2', '--sessions', '--audit', '--format', 'json']); const j2 = JSON.parse(fs.readFileSync(out + '2.json', 'utf8')); assert.equal(j2.jadvallar.sessiya.length, 2); assert.ok(j2.jadvallar.audit.length >= 2);
    const dst = path.join(tmp, 'dst.sqlite'); const o1 = execFileSync('node', [im, out + '2.json', '--to', 'sqlite', '--db', dst, '--tekshir'], { encoding: 'utf8' }); assert.match(o1, /tekshiruv: mos/);
    execFileSync('node', [im, out + '2.json', '--to', 'sqlite', '--db', dst, '--tekshir']);                                             // qayta yurgizish
    const { DatabaseSync } = require('node:sqlite'); const d = new DatabaseSync(dst, { readOnly: true }); assert.equal(d.prepare('SELECT COUNT(*) AS c FROM akkaunt').get().c, 2); assert.equal(d.prepare('SELECT COUNT(*) AS c FROM sessiya').get().c, 2); assert.equal(d.prepare('SELECT COUNT(*) AS c FROM kirish_kodi').get().c, 0, 'kodlar ko\'chmaydi'); assert.equal(d.prepare('SELECT marketing_matn_v AS v FROM akkaunt WHERE email = ?').get('ko\'chish@x.uz').v, 'm1'); d.close();
    execFileSync('node', [im, out + '2.json', '--to', 'sql', '--dialect', 'postgres', '--out', path.join(tmp, 'pg.sql')]); const pg = fs.readFileSync(path.join(tmp, 'pg.sql'), 'utf8');
    assert.match(pg, /BIGINT/); assert.match(pg, /ON CONFLICT \(id\) DO UPDATE/); assert.match(pg, /'ko''chish@x\.uz'/); assert.match(pg, /setval/); assert.doesNotMatch(pg, /AUTOINCREMENT/);
    fs.writeFileSync(path.join(tmp, 'bad.json'), '{"v":2}'); assert.throws(() => execFileSync('node', [im, path.join(tmp, 'bad.json'), '--to', 'sqlite', '--db', path.join(tmp, 'x.sqlite')], { stdio: 'pipe' }));
    // yuklangan baza bilan handler ishlaydi (adapter bazaga bog'liq emas): eksportdan tiklangan akkaunt kod bilan kirishi mumkin
    const env2 = mkEnv(); env2.KALKIFIT_DB._raw.exec('DROP TABLE akkaunt'); env2.KALKIFIT_DB._raw.exec(fs.readFileSync(path.join(ROOT, 'migrations/akkaunt.sql'), 'utf8')); const s2 = new DatabaseSync(dst, { readOnly: true }); const rows = s2.prepare('SELECT * FROM akkaunt').all(); s2.close();
    for (const r of rows) env2.KALKIFIT_DB._raw.prepare('INSERT INTO akkaunt VALUES (?,?,?,?,?,?,?,?,?)').run(r.id, r.email, r.usul, r.google_sub, r.yaratilgan, r.oxirgi_kirish, r.marketing, r.marketing_vaqt, r.marketing_matn_v);
    const re = await kirish(env2, 'ko\'chish@x.uz'); assert.equal(re.r.j.yangi, false); assert.equal(re.r.j.marketing, 1, 'rozilik ko\'chgan');
    const KT = require(path.join(ROOT, 'tools/akkaunt-kalit.js')); const K1 = 'a'.repeat(43); assert.equal(KT.izi(K1), await KL.izi(K1), 'vosita va lib barmoq izi bir xil'); assert.ok(KT.parse('1:' + K1 + ',1:' + K1).xato, 'takror versiya rad'); assert.ok(!KT.parse('1:' + K1).xato);
    const gen = execFileSync('node', [path.join(ROOT, 'tools/akkaunt-kalit.js'), 'yarat', '3'], { encoding: 'utf8' }); const gk = /^3:([A-Za-z0-9_-]+)$/m.exec(gen)[1]; assert.ok(gk.length >= 43); assert.ok(KL.kalitlar({ AKKAUNT_MASTER_KEYS: '3:' + gk })); assert.ok(gen.includes(KT.izi(gk)));
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

Date.now = realNow; console.log('\nAkkaunt API: ' + n + ' tekshiruv OK');
