// «Google bilan kirish» (functions/_lib/google-id.js, POST /api/akkaunt/google, assets/app-akkaunt.js):
//  soxta RSA kalit bilan imzolangan ID tokenlar — to'g'ri token kiradi; noto'g'ri aud, muddati o'tgan, email_verified=false, boshqa kalit imzosi, iss — rad; mavjud email akkauntiga bog'lanadi;
//  GOOGLE_WEB_CLIENT_ID yo'q → sessiyada google:'' va tugma KO'RINMAYDI; bor → veb'da rasmiy GIS tugmasi, APK'da native tugma (plagin bo'lsa).   node tools/dizayn/test-google.mjs
import assert from 'node:assert/strict'; import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http'; import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..'); const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const API = await imp('functions/api/akkaunt/[amal].js'), GI = await imp('functions/_lib/google-id.js'); const { makeD1 } = await import('./d1-shim.mjs'); const SCHEMA = fs.readFileSync(path.join(ROOT, 'migrations/akkaunt.sql'), 'utf8');
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const CID = '123456789012-abcdefghijklmnopqrstuvwxyz012345.apps.googleusercontent.com';
const kv = () => { const m = new Map(); return { get: async (k) => m.get(k), put: async (k, v) => { m.set(k, v); }, m }; };
const b64u = (b) => Buffer.from(b).toString('base64url');
const pair = async () => { const k = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']); const j = await crypto.subtle.exportKey('jwk', k.publicKey); return { k, jwk: { kty: 'RSA', n: j.n, e: j.e, kid: 'k' + Math.random().toString(36).slice(2, 8), alg: 'RS256', use: 'sig' } }; };
const K1 = await pair(), K2 = await pair(), JWKS = [K1.jwk];
async function tok(claims, key = K1, kid = K1.jwk.kid) { const now = Math.floor(Date.now() / 1000), c = Object.assign({ iss: 'https://accounts.google.com', aud: CID, sub: '1001', email: 'Ali@Gmail.com', email_verified: true, name: 'Ali', iat: now, exp: now + 3600 }, claims);
  const h = b64u(JSON.stringify({ alg: 'RS256', kid, typ: 'JWT' })), p = b64u(JSON.stringify(c)), s = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key.k.privateKey, new TextEncoder().encode(h + '.' + p)); return h + '.' + p + '.' + b64u(new Uint8Array(s)); }
const mkEnv = (x = {}) => Object.assign({ KALKI_AI_KV: kv(), KALKIFIT_DB: makeD1(SCHEMA), AKKAUNT_OTP_PEPPER: 'p'.repeat(40), AKKAUNT_MASTER_KEYS: '1:' + 'Kalit1'.repeat(8), AKKAUNT_DEV: '1', AKKAUNT_ADMIN_PASSWORD: 'adm', IP_HASH_SALT: 'tuz', GOOGLE_WEB_CLIENT_ID: CID, __GOOGLE_JWKS: JWKS }, x);
async function call(env, amal, body, cookie) { const m = amal === 'sessiya' || amal === 'dev-kod' ? 'GET' : 'POST', h = { 'CF-Connecting-IP': '9.9.9.9', 'User-Agent': 'Mozilla/5.0 (Linux; Android 14) Chrome/120 Mobile Safari/537.36', Origin: 'https://akkaunt.kalki-10y.pages.dev' }; if (m === 'POST') h['Content-Type'] = 'application/json'; if (cookie) h.Cookie = cookie; if (m === 'GET' && body && body.__h) Object.assign(h, body.__h);
  const res = await API.onRequest({ request: new Request('https://akkaunt.kalki-10y.pages.dev/api/akkaunt/' + amal + (body && body.__qs || ''), { method: m, headers: h, body: m === 'POST' ? JSON.stringify(body || {}) : undefined }), env, params: { amal } }); const t = await res.text(); let j = null; try { j = JSON.parse(t); } catch (e) {} return { s: res.status, j, cookie: (res.headers.get('Set-Cookie') || '').split(';')[0] }; }
/* 1. tekshiruv kutubxonasi */
{ const T = (c, k, kid) => tok(c, k, kid).then((t) => GI.googleTekshir(t, CID, { jwks: JWKS }));
  assert.deepEqual(await T({}), { email: 'ali@gmail.com', ism: 'Ali' });
  assert.equal((await T({ aud: '999-x.apps.googleusercontent.com' })).xato, 'aud'); assert.equal((await T({ exp: Math.floor(Date.now() / 1000) - 600 })).xato, 'muddat'); assert.equal((await T({ email_verified: false })).xato, 'email');
  assert.equal((await T({ iss: 'https://evil.example' })).xato, 'iss'); assert.equal((await T({}, K2, K1.jwk.kid)).xato, 'imzo', 'boshqa kalit bilan imzo'); assert.equal((await T({}, K2, K2.jwk.kid)).xato, 'kid');
  assert.equal((await GI.googleTekshir('a.b', CID, { jwks: JWKS })).xato, 'format'); const t0 = await tok({}); const [h, p] = t0.split('.'); assert.equal((await GI.googleTekshir(b64u(JSON.stringify({ alg: 'none' })) + '.' + p + '.', CID, { jwks: JWKS })).xato, 'alg'); void h;
  assert.equal((await GI.googleTekshir(t0, 'notog-ri', { jwks: JWKS })).xato, 'aud', 'client ID ko\'rinishi noto\'g\'ri'); assert.equal(GI.cidOk(CID), true); assert.equal(GI.cidOk(''), false);
  log('ID token tekshiruvi: imzo (Google JWKS), iss, aud = WEB client ID, muddat, email_verified — noto\'g\'ri aud / muddati o\'tgan / email_verified=false / boshqa imzo / alg:none — rad'); }
/* 2. endpoint */
{ let env = mkEnv(); let r = await call(env, 'sessiya'); assert.equal(r.j.google, CID);
  r = await call(env, 'google', { credential: await tok({}) }); assert.equal(r.s, 200); assert.equal(r.j.email, 'ali@gmail.com'); assert.equal(r.j.yangi, true); assert.match(r.cookie, /kalki_s=/);
  const s1 = await call(env, 'sessiya', null, r.cookie); assert.equal(s1.j.kirgan, true); assert.equal(s1.j.email, 'ali@gmail.com');
  const u = env.KALKIFIT_DB._raw.prepare('SELECT id, usul FROM akkaunt').all(); assert.equal(u.length, 1); assert.equal(u[0].usul, 'google');
  r = await call(env, 'google', { credential: await tok({ aud: '999-zzzzzzzzzzzz.apps.googleusercontent.com' }) }); assert.equal(r.s, 400); assert.equal(r.j.sabab, 'aud');
  r = await call(env, 'google', { credential: await tok({ exp: Math.floor(Date.now() / 1000) - 3600 }) }); assert.equal(r.s, 400); assert.equal(r.j.sabab, 'muddat');
  r = await call(env, 'google', { credential: await tok({ email_verified: false }) }); assert.equal(r.s, 400); assert.equal(r.j.sabab, 'email');
  /* email bilan ochilgan akkauntga bog'lanadi */
  env = mkEnv(); await call(env, 'kod', { email: 'vali@gmail.com' }); const kod = (await call(env, 'dev-kod', { __qs: '?email=vali%40gmail.com', __h: { 'X-Admin-Password': 'adm' } })).j.kod; const e1 = await call(env, 'kirish', { email: 'vali@gmail.com', kod }); assert.equal(e1.s, 200);
  const id0 = env.KALKIFIT_DB._raw.prepare('SELECT id FROM akkaunt').all()[0].id;
  r = await call(env, 'google', { credential: await tok({ email: 'VALI@gmail.com' }) }); assert.equal(r.s, 200); assert.equal(r.j.yangi, false, 'yangi akkaunt yaratilmadi'); const all = env.KALKIFIT_DB._raw.prepare('SELECT id FROM akkaunt').all(); assert.deepEqual(all.map((x) => x.id), [id0], 'o\'sha akkaunt');
  /* client ID yo'q */
  env = mkEnv({ GOOGLE_WEB_CLIENT_ID: '' }); assert.equal((await call(env, 'sessiya')).j.google, ''); r = await call(env, 'google', { credential: await tok({}) }); assert.equal(r.s, 503);
  log('/api/akkaunt/google: to\'g\'ri token → kirish + cookie (yangi akkaunt, usul=google); noto\'g\'ri aud / muddati o\'tgan / email_verified=false — 400; email bilan ochilgan akkauntga bog\'lanadi (yangi yaratilmaydi); client ID yo\'q → sessiya google:\'\', endpoint 503'); }
/* 3. brauzer: tugma */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
const S = (await import(pathToFileURL(path.join(ROOT, 'assets/kalkifit-core.js')).href)).default || (await import('node:module')).createRequire(import.meta.url)(path.join(ROOT, 'assets/kalkifit-core.js'));
const st = (() => { const x = S.emptyState(); x.setup = true; x.created = Date.now() - 5 * 86400000; x.prefs = { tipsDone: true, yemayK: 1, yemay: [] }; x.profile = { sex: 'm', preg: false, age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; x.trackStart = S.dates.today(); S.addFood(x, S.dates.today(), { fid: 'osh', unit: 'g100', qty: 1, g: 300, kcal: 570, p: 16, f: 27, c: 64, meal: 'l', ts: 1 }); return x; })();
async function open({ google = '', native = false } = {}) {
  const c = await b.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((x) => { localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); window.__g = [];
    if (x.native) window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: [{ name: 'GoogleKirish' }], addListener: () => {}, nativePromise: async (pl, m, o) => { if (pl === 'GoogleKirish') { window.__g.push(o.clientId); return { idToken: 'NATIVE.TOKEN.X' }; } throw new Error('yo\'q'); } }; }, { st, native });
  const p = await c.newPage(); p.posts = []; await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  await p.route(/accounts\.google\.com\/gsi\/client/, (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: "window.google={accounts:{id:{initialize:function(o){window.__gi=o;},renderButton:function(el,o){window.__gr=(window.__gr||[]).concat([o]);var b=document.createElement('button');b.id='gisBtn';b.textContent='Sign in with Google';b.onclick=function(){window.__gi.callback({credential:'WEB.TOKEN.Y'});};el.appendChild(b);}}}};" }));
  await p.route(/\/api\//, async (r) => { const u = r.request().url(); if (/akkaunt\/sessiya/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ yoqilgan: true, kirgan: false, google }) }); if (/akkaunt\/google/.test(u)) { p.posts.push(JSON.parse(r.request().postData() || '{}')); return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, yangi: false, email: 'ali@gmail.com', marketing: 0 }) }); } return r.abort(); });
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(1000); await p.click('[data-act=tab][data-v=profile] >> nth=0'); await p.waitForTimeout(1500); return p;
}
try {
  let p = await open(); assert.equal(await p.locator('.akk-gblock, .akk-gbtn, .akk-gnat').count(), 0, 'client ID yo\'q — Google tugmasi yo\'q'); assert.ok(await p.locator('[data-act=akk]').count() >= 1, 'email bilan kirish bor'); await p.context().close();
  p = await open({ google: CID }); await p.waitForSelector('#gisBtn'); const order = await p.evaluate(() => { const g = document.querySelector('.akk-gblock'), e = document.querySelector('[data-act=akk][data-akk=row]'); return !!(g && e && (g.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING)); }); assert.ok(order, 'Google — birinchi, ostida email');
  assert.equal(await p.evaluate(() => window.__gi.client_id), CID); assert.equal((await p.evaluate(() => window.__gr[0])).text, 'signin_with');
  await p.click('#gisBtn'); await p.waitForTimeout(800); assert.deepEqual(p.posts, [{ credential: 'WEB.TOKEN.Y' }]); await p.context().close();
  p = await open({ google: CID, native: true }); await p.waitForSelector('.akk-gnat'); assert.match(await p.locator('.akk-gnat').innerText(), /Google bilan kirish/); await p.click('.akk-gnat'); await p.waitForTimeout(800); assert.deepEqual(await p.evaluate(() => window.__g), [CID]); assert.deepEqual(p.posts, [{ credential: 'NATIVE.TOKEN.X' }]); await p.context().close();
  log('Profil: client ID yo\'q — Google tugmasi yo\'q; bor — birinchi o\'rinda rasmiy GIS tugmasi (signin_with), ostida email; APK — native «Google bilan kirish» (Credential Manager) → ID token → /api/akkaunt/google');
} finally { await b.close(); srv.close(); }
console.log('\n' + n + '/' + n + ' OK');
