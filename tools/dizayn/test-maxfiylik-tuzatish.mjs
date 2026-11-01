// KalkiFit v68+ MAXFIYLIK tuzatishlari (audit: docs/maxfiylik-audit.md): (1) akkaunt o'chirilganda eslatma obunasi va bulut zaxira o'chadi (boshqalarniki — yo'q);
// (2) Do Not Track / Global Privacy Control — /api/stat ga qurilma hodisalari yuborilmaydi (mijoz va server); (3) Google skripti faqat «Google bilan kirish» bosilgach yuklanadi;
// (4) bulut zaxira saqlash muddati: 12 oy sinxronsiz → ogoh, 30 kun keyin o'chadi (soxta vaqt bilan), sinxron/«holat» ogohni bekor qiladi, cron skripti; maxfiylik matnlari.
//   node tools/dizayn/test-maxfiylik-tuzatish.mjs
import assert from 'node:assert/strict'; import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http'; import { fileURLToPath, pathToFileURL } from 'node:url'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..'), require = createRequire(import.meta.url);
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const AK = await imp('functions/api/akkaunt/[amal].js'), ZAPI = await imp('functions/api/zaxira.js'), ZS = await imp('functions/_lib/zaxira-store.js'), ZM = await imp('functions/_lib/zaxira-muddat.js'), STAT = await imp('functions/api/stat.js');
const BKM = require(path.join(ROOT, 'assets/app-backup.js')), SC = require(path.join(ROOT, 'assets/stat-kun.js')), S = require(path.join(ROOT, 'assets/kalkifit-core.js'));
const { makeD1 } = await import('./d1-shim.mjs'); const { d1 } = await import('./d1-sqlite.mjs');
const SQL = ['akkaunt.sql', 'zaxira.sql', 'push.sql', 'zaxira-muddat.sql', 'stat.sql', 'admin-stat.sql', 'manba.sql'].map((f) => fs.readFileSync(path.join(ROOT, 'migrations', f), 'utf8')).join('\n');
let n = 0; const T = async (name, fn) => { try { await fn(); n++; console.log('OK  ', n + '.', name); } catch (e) { console.log('XATO ' + name + ': ' + (e && e.stack || e)); process.exit(1); } };
const kv = () => { const m = new Map(); return { get: async (k) => m.get(k), put: async (k, v) => { m.set(k, v); }, delete: async (k) => { m.delete(k); }, m }; };
const PEPPER = 'p'.repeat(40), ADMIN = 'admin-parol-sinov', MK1 = '1:' + 'Kalit1'.repeat(8), PREVIEW = 'https://akkaunt.kalki-10y.pages.dev';
let NOW = Date.now(); const realNow = Date.now; Date.now = () => NOW; const adv = (ms) => { NOW += ms; }; let ipN = 0;
const mkEnv = () => ({ KALKI_AI_KV: kv(), KALKIFIT_DB: makeD1(SQL), AKKAUNT_OTP_PEPPER: PEPPER, AKKAUNT_MASTER_KEYS: MK1, AKKAUNT_DEV: '1', AKKAUNT_ADMIN_PASSWORD: ADMIN, IP_HASH_SALT: 'tuz' });
async function call(env, amal, { body, cookie } = {}) {
  const method = ['sessiya', 'dev-kod'].includes(amal) ? 'GET' : 'POST', h = { 'CF-Connecting-IP': '9.9.9.' + (++ipN % 250), 'User-Agent': 'Mozilla/5.0 (Linux; Android 14) Chrome/120 Mobile Safari/537.36', Origin: PREVIEW }; if (method === 'POST') h['Content-Type'] = 'application/json'; if (cookie) h.Cookie = cookie;
  if (amal === 'dev-kod') h['X-Admin-Password'] = ADMIN; const res = await AK.onRequest({ request: new Request(PREVIEW + '/api/akkaunt/' + amal + (body && body.__qs ? body.__qs : ''), { method, headers: h, body: method === 'POST' ? JSON.stringify(body || {}) : undefined }), env, params: { amal } });
  const txt = await res.text(); let j = null; try { j = JSON.parse(txt); } catch (e) {} return { s: res.status, j, h: res.headers, cookie: (res.headers.get('Set-Cookie') || '').split(';')[0] };
}
const devKod = async (env, email) => (await call(env, 'dev-kod', { body: { __qs: '?email=' + encodeURIComponent(email) } })).j.kod;
async function kirish(env, email) { adv(61000); await call(env, 'kod', { body: { email } }); const kod = await devKod(env, email); const r = await call(env, 'kirish', { body: { email, kod } }); assert.equal(r.s, 200); return { cookie: r.cookie, id: r.j && r.j.id }; }
const raw = (env, q, ...a) => env.KALKIFIT_DB._raw.prepare(q).all(...a);
const HEX = (c) => c.repeat(64);

await T('1. Akkaunt o\'chirilganda: eslatma obunasi va (konvert rejimidagi) bulut zaxira o\'chadi; boshqa akkaunt va akkauntsiz yozuvlar — qoladi', async () => {
  const env = mkEnv(), A = await kirish(env, 'del@x.uz'), B = await kirish(env, 'saqla@x.uz'); const ids = raw(env, 'SELECT id, email FROM akkaunt ORDER BY email'); const aid = ids.find((x) => x.email === 'del@x.uz').id, bid = ids.find((x) => x.email === 'saqla@x.uz').id;
  const db = env.KALKIFIT_DB._raw; const ins = (q, ...a) => db.prepare(q).run(...a);
  ins("INSERT INTO zaxira (id, ilova, blob, versiya, yangilangan) VALUES (?, 'kalkifit', 'AAAAAAAAAAAAAAAAAAAAAAAA', 1, ?)", HEX('a'), NOW); ins("INSERT INTO zaxira (id, ilova, blob, versiya, yangilangan) VALUES (?, 'kalkifit', 'BBBBBBBBBBBBBBBBBBBBBBBB', 1, ?)", HEX('b'), NOW); ins("INSERT INTO zaxira (id, ilova, blob, versiya, yangilangan) VALUES (?, 'kalkifit', 'CCCCCCCCCCCCCCCCCCCCCCCC', 1, ?)", HEX('c'), NOW);
  ins("INSERT INTO akkaunt_ilova (akkaunt_id, ilova, zaxira_id, kod_konvert, rejim, master_v, ulangan) VALUES (?, 'kalkifit', ?, 'k', 'konvert', 1, ?)", aid, HEX('a'), NOW); ins("INSERT INTO akkaunt_ilova (akkaunt_id, ilova, zaxira_id, kod_konvert, rejim, master_v, ulangan) VALUES (?, 'kalkifit', ?, 'k', 'konvert', 1, ?)", bid, HEX('b'), NOW);
  for (const [i, ak] of [['p1', aid], ['p2', aid], ['p3', bid], ['p4', null]]) ins("INSERT INTO push_obuna (id, endpoint, p256dh, auth, til, akkaunt_id, yaratilgan) VALUES (?, 'https://push.example/' || ?, 'k', 'a', 'uz', ?, ?)", i, i, ak, NOW);
  adv(61000); await call(env, 'kod', { cookie: A.cookie, body: { maqsad: 'ochirish' } }); const dk = await devKod(env, 'del@x.uz'); const d = await call(env, 'ochirish', { cookie: A.cookie, body: { kod: dk } }); assert.equal(d.s, 200);
  assert.deepEqual(raw(env, 'SELECT id FROM push_obuna ORDER BY id').map((x) => x.id), ['p3', 'p4'], 'o\'chirilgan akkauntning obunalari yo\'q; boshqa akkaunt va akkauntsiz — qoldi');
  assert.deepEqual(raw(env, 'SELECT id FROM zaxira ORDER BY id').map((x) => x.id), [HEX('b'), HEX('c')], 'akkauntga bog\'langan zaxira o\'chdi; boshqasi va bog\'lanmagani (qat\'iy rejim/kodsiz) qoldi'); assert.equal(raw(env, 'SELECT COUNT(*) AS c FROM akkaunt_ilova')[0].c, 1);
  const env2 = mkEnv(); env2.KALKIFIT_DB = makeD1(SQL.replace(/CREATE TABLE IF NOT EXISTS push_obuna[\s\S]*?\);/, '').replace(/CREATE INDEX IF NOT EXISTS push_obuna_akkaunt[^;]*;/, '')); const A2 = await kirish(env2, 'x@x.uz'); adv(61000); await call(env2, 'kod', { cookie: A2.cookie, body: { maqsad: 'ochirish' } }); const dk2 = await devKod(env2, 'x@x.uz'); assert.equal((await call(env2, 'ochirish', { cookie: A2.cookie, body: { kod: dk2 } })).s, 200, 'push jadvali yo\'q — o\'chirish yiqilmaydi');
});

const ZQ = (env, m, qs, body) => ZAPI.onRequest({ request: new Request('https://kalki.uz/api/zaxira' + (qs || ''), { method: m, headers: Object.assign({ Origin: 'https://kalki.uz', 'CF-Connecting-IP': '1.2.3.4' }, body ? { 'Content-Type': 'application/json' } : {}), body: body ? JSON.stringify(body) : undefined }), env });
await T('2. Saqlash muddati: 12 oy sinxronsiz → ogoh; 30 kun keyin ham sinxronsiz → o\'chadi (soxta vaqt); PUT va «holat» ogohni bekor qiladi; ogoh bir marta qaytadi; quruq rejim', async () => {
  const env = mkEnv(), db = env.KALKIFIT_DB._raw, store = ZS.makeStore(env), D = 86400000, T0 = Date.UTC(2026, 10, 1);
  const put = (id, ms, extra) => db.prepare("INSERT INTO zaxira (id, ilova, blob, versiya, yangilangan, oxirgi, ogoh) VALUES (?, 'kalkifit', 'ZZZZZZZZZZZZZZZZZZZZZZZZ', 1, ?, ?, ?)").run(id, ms, extra && extra.ox !== undefined ? extra.ox : ms, extra && extra.og !== undefined ? extra.og : null);
  put(HEX('1'), T0 - 400 * D);              // 13 oy sinxronsiz → ogoh
  put(HEX('2'), T0 - 200 * D);              // faol
  put(HEX('3'), T0 - 500 * D, { og: T0 - 31 * D });          // ogohlantirilgan, 31 kun o'tdi, sinxron yo'q → o'chadi
  put(HEX('4'), T0 - 500 * D, { og: T0 - 10 * D });          // ogohlantirilgan, 10 kun — hali muddat ichida
  put(HEX('5'), T0 - 500 * D, { og: T0 - 40 * D, ox: T0 - 5 * D });          // ogohdan keyin sinxron bo'lgan (ox > og) — o'chmaydi
  db.prepare("INSERT INTO zaxira (id, ilova, blob, versiya, yangilangan) VALUES (?, 'kalkifit', 'ZZZZZZZZZZZZZZZZZZZZZZZZ', 1, ?)").run(HEX('6'), T0 - 400 * D);          // eski qator (oxirgi NULL) — yangilangan bo'yicha
  db.prepare("INSERT INTO akkaunt_ilova (akkaunt_id, ilova, zaxira_id, kod_konvert, rejim, master_v, ulangan) VALUES ('a1', 'kalkifit', ?, 'k', 'konvert', 1, ?)").run(HEX('3'), T0);
  const q = await store.muddat(T0, true); assert.deepEqual([q.ogoh, q.ochirildi, q.quruq], [2, 1, true], 'quruq: hech narsa o\'zgarmaydi'); assert.equal(db.prepare('SELECT COUNT(*) AS c FROM zaxira').get().c, 6);
  const r = await store.muddat(T0); assert.deepEqual([r.ogoh, r.ochirildi], [2, 1]); const left = db.prepare('SELECT id, ogoh FROM zaxira ORDER BY id').all().map((x) => [x.id.slice(0, 1), x.ogoh ? 'og' : '-']); assert.deepEqual(left, [['1', 'og'], ['2', '-'], ['4', 'og'], ['5', 'og'], ['6', 'og']], 'o\'chdi: 3 (13 oy + 31 kun ogoh)');
  assert.equal(db.prepare('SELECT COUNT(*) AS c FROM akkaunt_ilova').get().c, 0, 'o\'chirilgan zaxiraga bog\'langan akkaunt konverti ham o\'chdi');
  const r2 = await store.muddat(T0); assert.deepEqual([r2.ogoh, r2.ochirildi], [0, 0], 'takroriy yurgizish — hech narsa');
  /* ogohlantirishdan 30 kun o'tgach (soxta vaqt) sinxronsiz qolganlar o'chadi */
  const r3 = await store.muddat(T0 + 31 * D); assert.equal(r3.ochirildi >= 3, true, '1, 6 va 4 — ogohdan 30+ kun, sinxronsiz'); assert.ok(db.prepare('SELECT id FROM zaxira WHERE id = ?').get(HEX('2')), 'faol zaxira (200 kun) — qoladi');
  /* PUT va «holat» bekor qiladi; ogoh bir marta qaytadi */
  const e2 = mkEnv(), d2 = e2.KALKIFIT_DB._raw, s2 = ZS.makeStore(e2); d2.prepare("INSERT INTO zaxira (id, ilova, blob, versiya, yangilangan, oxirgi, ogoh) VALUES (?, 'kalkifit', 'ZZZZZZZZZZZZZZZZZZZZZZZZ', 3, ?, ?, ?)").run(HEX('7'), T0 - 400 * D, T0 - 400 * D, T0 - 5 * D);
  const h1 = await s2.holat(HEX('7'), T0); assert.deepEqual(h1, { yangilangan: T0 - 400 * D, ogoh: T0 - 5 * D }, 'ogoh qaytdi'); const h2 = await s2.holat(HEX('7'), T0 + 1000); assert.equal(h2.ogoh, 0, 'ikkinchi so\'rovda yo\'q (bekor bo\'lgan)'); assert.equal(await s2.holat(HEX('9'), T0), null);
  assert.equal((await s2.muddat(T0 + 60 * D)).ochirildi, 0, 'sinxron bo\'lgani uchun o\'chmaydi'); d2.prepare('UPDATE zaxira SET ogoh = ? WHERE id = ?').run(T0 - 40 * D, HEX('7')); const pr = await s2.put(HEX('7'), 'kalkifit', 'YYYYYYYYYYYYYYYYYYYYYYYY', 3, T0); assert.deepEqual([pr.ok, pr.versiya], [true, 4]); assert.equal(d2.prepare('SELECT ogoh FROM zaxira WHERE id = ?').get(HEX('7')).ogoh, null, 'PUT ogohni bekor qildi'); assert.equal((await s2.muddat(T0 + 5 * D)).ochirildi, 0);
  /* API: GET ?holat=1 — blobsiz */
  d2.prepare('UPDATE zaxira SET ogoh = ? WHERE id = ?').run(T0 - 1 * D, HEX('7')); const ge = Object.assign(e2, { KALKI_AI_KV: kv() }); const gr = await ZQ(ge, 'GET', '?id=' + HEX('7') + '&holat=1'); assert.equal(gr.status, 200); const gj = await gr.json(); assert.deepEqual(Object.keys(gj).sort(), ['ogoh', 'yangilangan']); assert.equal(gj.ogoh, T0 - 1 * D); assert.equal((await ZQ(ge, 'GET', '?id=' + HEX('8') + '&holat=1')).status, 404);
  /* migratsiyasiz (ustunlar yo'q): put/holat yiqilmaydi */
  const e3 = mkEnv(); e3.KALKIFIT_DB = makeD1('CREATE TABLE zaxira (id TEXT PRIMARY KEY, ilova TEXT NOT NULL, blob TEXT NOT NULL, versiya INTEGER NOT NULL DEFAULT 1, yangilangan INTEGER NOT NULL);'); const s3 = ZS.makeStore(e3); assert.equal((await s3.put(HEX('e'), 'kalkifit', 'XXXXXXXXXXXXXXXXXXXXXXXX', 0, T0)).ok, true); assert.equal((await s3.put(HEX('e'), 'kalkifit', 'WWWWWWWWWWWWWWWWWWWWWWWW', 1, T0)).ok, true); assert.equal((await s3.holat(HEX('e'), T0)).ogoh, 0);
  assert.equal(ZM.YIL_MS, 365 * 86400000); assert.equal(ZM.OGOH_MS, 30 * 86400000);
});

await T('3. Cron skripti: tools/zaxira-muddat.js mavjud, qoida bitta joyda (zaxira-muddat.js), --quruq, kalit chiqarilmaydi', async () => {
  const sc = fs.readFileSync(path.join(ROOT, 'tools/zaxira-muddat.js'), 'utf8'); assert.match(sc, /zaxira-muddat\.js/); assert.match(sc, /--quruq/); assert.match(sc, /Cron \(server vaqti UTC\)/); assert.ok(!/console\.log\([^)]*tok/.test(sc), 'token chiqarilmaydi'); assert.match(sc, /\.cf-token/);
  const { main } = require(path.join(ROOT, 'tools/zaxira-muddat.js')); assert.equal(typeof main, 'function');
});

await T('4. DNT / GPC: mijoz statistikani yubormaydi (test belgisi ham aylanib o\'tmaydi); server DNT/Sec-GPC sarlavhasida hech narsa yozmaydi', async () => {
  const win = (nv) => ({ navigator: Object.assign({ userAgent: 'Mozilla/5.0 Chrome/130' }, nv), location: { hostname: 'kalki.uz', search: '' }, localStorage: { getItem: (k) => (k === 'kalki_stat_test' ? '1' : null), setItem() {}, removeItem() {} } });
  assert.equal(SC.off({ win: win({}) }), false, 'DNT yo\'q — ishlaydi (test belgisi bilan)'); assert.equal(SC.off({ win: win({ doNotTrack: '1' }) }), true); assert.equal(SC.off({ win: win({ doNotTrack: 'yes' }) }), true); assert.equal(SC.off({ win: win({ globalPrivacyControl: true }) }), true); assert.equal(SC.off({ win: win({ doNotTrack: '0' }) }), false);
  const sent = []; const st = SC.create({ win: Object.assign(win({ globalPrivacyControl: true }), { fetch: (u, o) => { sent.push(u); return Promise.resolve(); } }), storage: { getItem: () => null, setItem() {}, removeItem() {} }, cid: () => 'id', delay: 1 }); assert.equal(st.add('ovqat_qoshildi', 'qidiruv'), false); assert.equal(st.disabled(), true); assert.equal(st.flush(), false); assert.deepEqual(sent, []);
  const db = d1([SQL]), env = { KALKIFIT_DB: db, IP_HASH_SALT: 't', STAT_PRUNE_P: '0' }; const U = '00000000-0000-4000-8000-000000000001';
  const req = (h) => new Request('https://kalki.uz/api/stat', { method: 'POST', headers: Object.assign({ Origin: 'https://kalki.uz', 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile' }, h), body: JSON.stringify({ q: U, p: 'veb', t: 'uz', h: [['faol', '', 1], ['ovqat_qoshildi', 'qidiruv', 1]] }) });
  for (const h of [{ DNT: '1' }, { 'Sec-GPC': '1' }]) { const r = await STAT.qabul(req(h), env, Date.now()); assert.equal(r.status, 204); } assert.equal(db.raw.prepare('SELECT COUNT(*) AS c FROM stat_qurilma').get().c, 0, 'DNT/GPC — qurilma qatori yo\'q'); assert.equal(db.raw.prepare('SELECT COUNT(*) AS c FROM stat_kun').get().c, 0);
  await STAT.qabul(req({}), env, Date.now()); assert.equal(db.raw.prepare('SELECT COUNT(*) AS c FROM stat_qurilma').get().c, 1, 'sarlavhasiz — yoziladi (nazorat)');
});

/* ---------- brauzer ---------- */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; Date.now = realNow; const b = track(await chromium.launch());
const Dt = S.dates, TODAY = Dt.today();
function seed() { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 864e5; st.prefs = { tipsDone: true, jokes: false, yemayK: 1, introDone: true }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = Dt.addDays(TODAY, -8); S.addWeight(st, TODAY, 80); return st; }
async function open(o = {}) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((a) => { try { if (sessionStorage.getItem('__t')) return; sessionStorage.setItem('__t', '1'); localStorage.setItem('kalki_fit', JSON.stringify(a.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_stat_test', '1'); Object.keys(a.ls || {}).forEach((k) => localStorage.setItem(k, a.ls[k])); } catch (e) {} if (a.dnt) { Object.defineProperty(navigator, 'doNotTrack', { value: '1' }); } if (a.gpc) { Object.defineProperty(navigator, 'globalPrivacyControl', { value: true }); } }, { st: seed(), ls: o.ls, dnt: o.dnt, gpc: o.gpc });
  const p = await c.newPage(); p.stat = []; p.google = []; p.zx = []; p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('https://accounts.google.com/**', (r) => { p.google.push(r.request().url()); r.fulfill({ status: 200, contentType: 'text/javascript', body: '/* test */' }); });
  await p.route('**/api/stat', (r) => { p.stat.push(r.request().postData()); r.fulfill({ status: 204, body: '' }); });
  await p.route('**/api/zaxira**', (r) => { p.zx.push(r.request().method() + ' ' + new URL(r.request().url()).search); const u = new URL(r.request().url()); if (u.searchParams.get('holat')) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ yangilangan: 1, ogoh: o.ogoh || 0 }) }); r.fulfill({ status: 204, body: '' }); });
  await p.route('**/api/akkaunt/sessiya', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ yoqilgan: true, kirgan: false, google: 'test-client.apps.googleusercontent.com', ilovalar: {}, qurilmalar: [] }) }));
  await p.route(/\/api\/(?!stat|zaxira|akkaunt\/sessiya)/, (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(800); return p;
}
const flush = (p) => p.evaluate(() => window.dispatchEvent(new Event('pagehide'))).then(() => p.waitForTimeout(500));
try {
  await T('5. Brauzer: DNT yoki GPC yoqilganda /api/stat ga hech narsa yuborilmaydi (oddiy holatda — yuboriladi)', async () => {
    let p = await open({}); await p.click('#mainAdd'); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await flush(p); assert.ok(p.stat.length >= 1, 'nazorat: oddiy brauzerda statistika ketadi'); await p.context().close();
    for (const o of [{ dnt: true }, { gpc: true }]) { p = await open(o); await p.click('#mainAdd'); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await flush(p); assert.deepEqual(p.stat, [], JSON.stringify(o) + ': /api/stat — bo\'sh'); assert.deepEqual(p.errs, []); await p.context().close(); }
  });
  await T('6. Google skripti: Profil ochilganda ham YUKLANMAYDI; «Google bilan kirish» bosilgach yuklanadi', async () => {
    const p = await open({}); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(1500); await p.waitForSelector('[data-act=akkgweb]', { timeout: 8000 }); assert.deepEqual(p.google, [], 'bosishdan oldin accounts.google.com ga so\'rov yo\'q'); assert.equal(await p.locator('script[src*="accounts.google.com"]').count(), 0);
    await p.click('[data-act=akkgweb]'); await p.waitForTimeout(1200); assert.deepEqual(p.google, ['https://accounts.google.com/gsi/client'], 'bosilgach — skript yuklandi'); assert.deepEqual(p.errs.filter((e) => !/google/i.test(e)), []); await p.context().close();
  });
  await T('7. Bulut zaxira muddati (mijoz): ogoh bo\'lsa bir martalik xabar (qayta ochilganda yo\'q); ogoh yo\'q — xabar yo\'q; kuniga bir marta holat so\'rovi', async () => {
    const ls = { kalki_zaxira_kalkifit: JSON.stringify({ on: true, code: BKM.genCode('kalkifit'), ver: 1, last: Date.now() - 864e5, pending: false, conflict: 0, sig: '' }) };
    let p = await open({ ls, ogoh: Date.now() - 864e5 * 3 }); await p.waitForTimeout(5200); assert.ok(p.zx.some((x) => /holat=1/.test(x)), 'holat so\'rovi: ' + p.zx); assert.match(await p.locator('#rzSheet').innerText(), /12 oydan beri hech qanday sinxron bo'lmagan edi[\s\S]*saqlanib qoladi/); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    const og0 = await p.evaluate(() => localStorage.getItem('kalki_zaxira_kalkifit_og')); assert.ok(+og0 > 0); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(5200); assert.equal(p.zx.filter((x) => /holat=1/.test(x)).length >= 1, true); assert.doesNotMatch((await p.locator('#rzSheet').innerText().catch(() => '')) || '', /12 oydan beri/, 'ikkinchi ochilishda xabar yo\'q (kuniga bir so\'rov + bir martalik)'); await p.context().close();
    p = await open({ ls, ogoh: 0 }); await p.waitForTimeout(5200); assert.doesNotMatch((await p.locator('#rzSheet').innerText().catch(() => '')) || '', /12 oydan beri/, 'ogoh yo\'q — xabar yo\'q'); await p.context().close();
  });
  await T('8. Matnlar: maxfiylik.html (UZ/RU), ilova va hujjat yangi qoidalarni aytadi; eski «saqlanib qoladi» va «server tomonidan ko\'rilmaydi» yo\'q', async () => {
    const mx = fs.readFileSync(path.join(ROOT, 'maxfiylik.html'), 'utf8'); for (const re of [/Saqlash muddati:<\/b> shifrlangan nusxa 12 oy/, /Срок хранения:<\/b> если в течение 12 месяцев/, /Do Not Track[^<]*Global Privacy Control[^<]*umuman yubormaydi/, /Do Not Track[^<]*Global Privacy Control[^<]*вообще не отправляет/, /tugmasini bosganingizdan keyin yuklanadi/, /только после нажатия кнопки/, /eslatma obunasi, akkauntga bogʻliq yozuvlar va bulutdagi zaxira bazadan butunlay oʻchadi/, /подписка на напоминания, связанные с аккаунтом записи и облачная копия полностью стираются/]) assert.match(mx, re, String(re));
    assert.doesNotMatch(mx, /bulutdagi zaxira va tiklash kodi bunga bogʻliq emas va saqlanib qoladi/); assert.doesNotMatch(mx, /облачная копия и код восстановления от этого не зависят/);
    const ak = fs.readFileSync(path.join(ROOT, 'assets/app-akkaunt.js'), 'utf8'); assert.match(ak, /eslatma obunasi va bulutdagi zaxira serverdan butunlay o'chadi/); assert.match(ak, /подписка на напоминания и облачная копия будут полностью удалены/); assert.doesNotMatch(ak, /bulutdagi zaxira \(tiklash kodi bilan\) saqlanib qoladi/);
    const ad = fs.readFileSync(path.join(ROOT, 'docs/maxfiylik-audit.md'), 'utf8'); assert.match(ad, /## Tuzatildi \(v68\+, «tuzatish:»\)/); assert.match(ad, /12 oy/); assert.doesNotMatch(ad, /^## Matn bilan tuzatilmagan/m);
  });
} finally { await b.close(); srv.close(); }
console.log('\nHammasi o\'tdi: ' + n + ' ta tekshiruv');
