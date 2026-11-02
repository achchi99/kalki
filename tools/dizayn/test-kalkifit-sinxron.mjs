// KalkiFit «MA'LUMOT HECH QACHON YO'QOLMASIN» — regressiya (2026-11-02, stig707 voqeasi): qayta o'rnatish + akkaunt → tiklanadi; 409/konflikt → birlashadi, sinxron to'xtamaydi; ikki qurilma — hech bir yozuv yo'qolmaydi;
// o'chirilgan yozuv qayta tirilmaydi; bo'sh holat ustidan yozmaydi; oflayn navbat; 24 soat → banner; akkauntsiz karta; APK onlayn → yangi web.   node tools/dizayn/test-kalkifit-sinxron.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const KF = require(path.join(ROOT, 'assets/kalkifit-core.js')); const RZ = require(path.join(ROOT, 'assets/rozgor-core.js')); const BK = require(path.join(ROOT, 'assets/app-backup.js')); const TODAY = KF.dates.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port;
const b = track(await chromium.launch());
const API = await import(pathToFileURL(path.join(ROOT, 'functions/api/akkaunt/[amal].js')).href); const ZAX = await import(pathToFileURL(path.join(ROOT, 'functions/api/zaxira.js')).href);
const { makeD1 } = await import('./d1-shim.mjs'); const SCHEMA = fs.readFileSync(path.join(ROOT, 'migrations/akkaunt.sql'), 'utf8') + '\n' + fs.readFileSync(path.join(ROOT, 'migrations/zaxira.sql'), 'utf8');
{ const nc0 = b.newContext.bind(b); b.newContext = async (o) => { const c = await nc0(o); await c.addInitScript(() => { try { localStorage.setItem('kalki_no_intro', '1'); for (const a of ['kalkifit', 'rozgor']) if (!localStorage.getItem('kalki_news_' + a)) localStorage.setItem('kalki_news_' + a, '{"shown":999,"read":999}'); } catch (e) {} }); return c; }; }
const kvf = () => { const m = new Map(); return { get: async (k) => m.get(k), put: async (k, v) => { m.set(k, v); }, m }; };
const mkEnv = () => ({ KALKI_AI_KV: kvf(), KALKIFIT_DB: makeD1(SCHEMA), AKKAUNT_OTP_PEPPER: 'p'.repeat(40), AKKAUNT_MASTER_KEYS: '1:' + 'Kalit1'.repeat(8), AKKAUNT_DEV: '1', ALLOW_LOCAL_ORIGIN: '1', AKKAUNT_ADMIN_PASSWORD: 'admin-sinov', IP_HASH_SALT: 'tuz' });
let ENV = mkEnv(); let n = 0; const log = (m) => console.log('OK  ', ++n + '.', m); const DB = () => ENV.KALKIFIT_DB._raw;
const MARK = { kalkifit: 71.3, rozgor: 4321000 };
function kfState(w, days = 3, last = 0) { const st = KF.emptyState(); st.setup = true; st.created = Date.now() - 30 * 86400000; st.prefs = { tipsDone: true }; st.profile = { sex: 'f', preg: false, age: 31, height: 166, weight: w, act: 2, goal: 'slow', goalWeight: 60 }; KF.addWeight(st, TODAY, w); for (let i = 0; i < days; i++) KF.setSteps(st, KF.dates.addDays(TODAY, -i), 3000 + i * 111); if (last) st.lastBackup = last; return st; }
function rzState(base, days = 3, last = 0) { const st = RZ.emptyState(); st.prefs = { tipsDone: true }; st.setup = true; st.created = Date.now() - 30 * 86400000; st.base = base; st.reserve = 500000; st.income = RZ.addDays(TODAY, 12); for (let i = 0; i < days; i++) st.tx.push({ id: 't' + i, type: 'exp', amount: 10000 + i, cat: 'oziq', date: RZ.addDays(TODAY, -i), ts: Date.now() - i }); if (last) st.lastBackup = last; return st; }
const APPS = { kalkifit: { key: 'kalki_fit', st: kfState, tab: 'profile', has: (s) => Object.keys(s.days).some((d) => s.days[d].water > 0), triv: () => kfState(66.6, 0), mark: (s) => s.profile.weight, size: (s) => Object.keys(s.days).length, exp: (st) => KF.exportState(st) }, rozgor: { key: 'kalki_rozgor', st: rzState, tab: 'set', has: (s) => s.tx.length > 0, triv: () => rzState(1500000, 0), mark: (s) => s.base, size: (s) => s.tx.length, exp: (st) => JSON.stringify({ app: 'kalki-rozgor', v: RZ.VERSION, exportedAt: Date.now(), state: st }) } };
async function open(app, { state, lang = '', mode = 'on', vp = { width: 390, height: 844 }, ls = {}, force = null } = {}) {
  const A = APPS[app]; const c = await b.newContext({ viewport: vp, isMobile: true, hasTouch: true, serviceWorkers: 'block', acceptDownloads: true });
  await c.addInitScript((o) => { try { if (o.state && !localStorage.getItem(o.key)) localStorage.setItem(o.key, JSON.stringify(o.state)); for (const k of Object.keys(o.ls)) if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(o.ls[k])); } catch (e) {} }, { state, key: A.key, ls });
  const p = await c.newPage(); p.errs = []; p.req = []; p.jar = ''; p.cev = []; c.on('request', (rq) => { if (/zaxira/.test(rq.url())) p.cev.push('req ' + rq.method()); }); c.on('requestfailed', (rq) => { if (/zaxira/.test(rq.url())) p.cev.push('failed ' + rq.method() + ' ' + (rq.failure() || {}).errorText); }); c.on('requestfinished', (rq) => { if (/zaxira/.test(rq.url())) p.cev.push('done ' + rq.method()); }); p.force = force; p.on('pageerror', (e) => p.errs.push(String(e)));
  await c.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await c.route('**/api/**', async (r) => {   // kontekst darajasida: sahifa yopilgandan keyingi (keepalive) so'rovlar ham qayta ishlanadi
    const rq = r.request(), u = rq.url(), pn = new URL(u).pathname; p.req.push(rq.method() + ' ' + pn.replace('/api/', ''));
    const h = { 'Content-Type': 'application/json', Origin: new URL(u).origin, 'CF-Connecting-IP': '4.4.4.4', 'X-Admin-Password': rq.headers()['x-admin-password'] || '' }; if (p.jar) h.Cookie = p.jar;
    if (/\/api\/zaxira/.test(u)) { const zr = await ZAX.onRequest({ request: new Request(u, { method: rq.method(), headers: h, body: rq.postData() || undefined }), env: ENV }); return r.fulfill({ status: zr.status, contentType: 'application/json', body: await zr.text() }); }
    if (!/\/api\/akkaunt\//.test(u)) return r.abort(); if (mode === 'off') return r.fulfill({ status: 200, contentType: 'application/json', body: '{"yoqilgan":false}' });
    const amal = pn.split('/').pop(); if (p.force && p.force[amal]) return r.fulfill({ status: p.force[amal].s, contentType: 'application/json', body: JSON.stringify(p.force[amal].j) });
    const res = await API.onRequest({ request: new Request(u, { method: rq.method(), headers: h, body: rq.method() === 'POST' ? (rq.postData() || '{}') : undefined }), env: ENV, params: { amal } });
    const sc = res.headers.get('Set-Cookie'); if (sc) { const kv = sc.split(';')[0]; p.jar = /=$/.test(kv) ? '' : kv; }
    r.fulfill({ status: res.status, contentType: 'application/json', body: await res.text() });
  });
  await p.goto(BASE + (lang === 'ru' ? '/ru/' : '/') + app + (lang === 'cyr' ? '?lang=cyr' : ''), { waitUntil: 'networkidle' }); await p.waitForTimeout(500); return p;
}
const T = async (p, sel) => { const l = p.locator(sel).first(); return (await l.count()) ? (await l.innerText()).replace(/\s+/g, ' ').trim() : null; };
const lsJ = (p, key) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);
const goProfile = async (p, app) => { await p.click(`[data-act=tab][data-v=${APPS[app].tab}]`); await p.waitForTimeout(500); };
const resetLimits = () => DB().exec('DELETE FROM limit_hisob');
const devKod = (email) => DB().prepare('SELECT kod FROM dev_kod WHERE email = ?').get(email).kod;
async function sendMail(p, email) { await p.fill('#akkEmail', email); resetLimits(); await p.click('#akkSend'); await p.waitForSelector('#akkCode', { timeout: 8000 }); }
async function login(p, app, email, { onb = false } = {}) {                  // sahifada: Profil ochiq yoki onboarding; kodni dev jadvaldan olib kiritadi (6 raqam → avto-tekshiruv)
  if (onb) await p.click('[data-akk=onb]'); else await p.click('[data-akk=row]'); await p.waitForTimeout(450); await sendMail(p, email); await p.fill('#akkCode', devKod(email.toLowerCase())); await p.waitForTimeout(1500);
}
const cs = (p, app) => lsJ(p, 'kalki_zaxira_' + app);
const waitUploaded = (p, app, over = 0) => p.waitForFunction((a) => { try { const o = JSON.parse(localStorage.getItem(a.k)); return o.ver > a.v && !o.pending; } catch (e) { return false; } }, { k: 'kalki_zaxira_' + app, v: over }, { timeout: 15000 });
const rows = () => DB().prepare('SELECT * FROM akkaunt_ilova ORDER BY ilova').all();
const covers = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return 'yoq'; const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 30)); return e.contains(t) ? 'ok' : (t ? t.className || t.tagName : 'null'); }, sel);
const KFA = APPS.kalkifit, app = 'kalkifit';
const foods = (p) => lsJ(p, 'kalki_fit').then((s) => Object.values(s.days).reduce((n, d) => n + (d.food || []).length, 0));
const addEgg = async (p) => { await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(300); await p.click('#mainAdd'); await p.waitForTimeout(600); await p.fill('#rzSheet #fdQ', 'tuxum'); await p.waitForTimeout(700); await p.locator('[data-act=fadd]').first().click(); await p.waitForTimeout(400); await p.keyboard.press('Escape'); await p.waitForTimeout(400); };
const delFirst = async (p) => { await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(300); if (await p.locator('[data-act=mlmore]').count()) { await p.locator('[data-act=mlmore]').first().click(); await p.waitForTimeout(500); } const row = p.locator('#rzMain [data-act=editfood]', { hasText: 'Yozuv' }).first(); await row.click(); await p.waitForTimeout(900); await p.click('[data-act=fdel]'); await p.waitForTimeout(500); };
const cloudState = async (code) => { const kk = await BK.deriveKeys(app, BK.parseCode(app, code).body), g = await (await ZAX.onRequest({ request: new Request(BASE + '/api/zaxira?id=' + kk.id, { headers: { Origin: BASE, 'CF-Connecting-IP': '4.4.4.4' } }), env: ENV })).json(); return { st: JSON.parse(await BK.open(app, kk, g.blob)).state, ver: g.versiya }; };
const cnt = (st) => Object.values(st.days).reduce((n, d) => n + (d.food || []).length, 0);
const fast = (p) => p.evaluate(() => { KalkiBackup.instances.kalkifit.debounceMs = 300; });
const kfWith = (n) => { const st = kfState(70, 3); const d = KF.dates.today(); for (let i = 0; i < n; i++) KF.addFood(st, i === 1 ? KF.dates.addDays(d, -1) : d, { fid: null, name: 'Yozuv' + i, meal: 'l', unit: 'porsiya', qty: 1, g: 100, kcal: 100 + i, p: 1, f: 1, c: 1, ts: 1000 + i }); return st; };
try {
  /* 1. Qayta o'rnatish + akkaunt → tiklanadi (yangi qurilma, bo'sh xotira) */
  ENV = mkEnv(); const a = await open(app, { state: kfWith(5) }); await goProfile(a, app); await login(a, app, 'sinxron@pochta.uz'); await waitUploaded(a, app); const code = (await cs(a, app)).code; const n0 = await foods(a);
  let b2 = await open(app, {}); assert.equal(await b2.locator('#rzOnb').isVisible(), true, 'yangi o\'rnatish — onboarding'); await login(b2, app, 'sinxron@pochta.uz', { onb: true }); await b2.waitForTimeout(1500);
  assert.equal(await b2.locator('#rzOnb').isVisible(), false); assert.equal(await foods(b2), n0, 'qayta o\'rnatish + akkaunt: ma\'lumot tiklandi'); log('qayta o\'rnatish + akkaunt → hamma yozuv tiklanadi');
  /* 2. Ikki qurilma bir vaqtda: 409 → birlashadi, sinxron to'xtamaydi, hech bir yozuv yo'qolmaydi */
  await fast(a); await fast(b2); await addEgg(a); await waitUploaded(a, app, (await cs(a, app)).ver - 1); await addEgg(b2); await b2.waitForTimeout(5500);          // b2 eski versiya bilan yozadi → 409 → birlashtirish
  const cb = await cs(b2, app); assert.equal(cb.conflict, 0, 'konflikt belgisi yo\'q'); assert.equal(cb.pending, false, 'sinxron to\'xtamadi'); const cl = await cloudState(code); assert.equal(cnt(cl.st), n0 + 2, 'bulutda ikkala qurilma yozuvi'); assert.equal(await foods(b2), n0 + 2);
  await a.evaluate(() => KalkiBackup.instances.kalkifit.pullIfNewer(true)); await a.waitForTimeout(800); assert.equal(await foods(a), n0 + 2, 'a qurilma ham birlashdi'); log('ikki qurilma bir vaqtda (409): birlashadi, sinxron to\'xtamaydi, hech bir yozuv yo\'qolmaydi');
  /* 3. O'chirilgan yozuv qayta tirilmaydi */
  await delFirst(a); await a.waitForTimeout(5500); const clD = await cloudState(code); assert.equal(cnt(clD.st), n0 + 1, 'a o\'chirdi — bulutda 1 ta kam'); await b2.evaluate(() => KalkiBackup.instances.kalkifit.pullIfNewer(true)); await b2.waitForTimeout(1000); assert.equal(await foods(b2), n0 + 1, 'b ham o\'chirdi (qayta tirilmadi)');
  await addEgg(b2); await b2.waitForTimeout(5500); assert.equal(cnt((await cloudState(code)).st), n0 + 2, 'b yangi yozuv qo\'shdi, o\'chirilgani qaytmadi'); log('o\'chirilgan yozuv qayta tirilmaydi (tomb)');
  /* 4. Bo'sh holat bulut ustidan yozmaydi: mahalliy holat yo'qolsa — boshlanishda bulutdan tiklanadi */
  const vBefore = (await cloudState(code)).ver; await b2.evaluate(() => { localStorage.removeItem('kalki_fit'); }); await b2.reload({ waitUntil: 'networkidle' }); await b2.waitForTimeout(5500);
  assert.equal(await foods(b2), n0 + 2, 'mahalliy holat yo\'qolgan — bulutdan tiklandi'); assert.ok(cnt((await cloudState(code)).st) === n0 + 2 && (await cloudState(code)).ver >= vBefore, 'bulut bo\'sh holat bilan almashtirilmadi'); log('bo\'sh mahalliy holat bulut ustidan yozmaydi — bulutdan tiklanadi');
  /* 5. Oflayn navbat */
  await fast(b2); const blk = (r) => r.abort(); await b2.context().route('**/api/zaxira**', blk); await addEgg(b2); await b2.waitForTimeout(800); let co = await cs(b2, app); assert.equal(co.pending, true, 'oflayn: navbatda'); const nOff = cnt((await cloudState(code)).st); assert.equal(nOff, n0 + 2, 'oflaynda yuborilmadi');
  await b2.context().unroute('**/api/zaxira**', blk); await b2.evaluate(() => window.dispatchEvent(new Event('online'))); await b2.waitForTimeout(5500); co = await cs(b2, app); assert.equal(co.pending, false); assert.equal(cnt((await cloudState(code)).st), n0 + 3, 'internet kelgach yuborildi'); log('oflayn navbat: internet kelganda yuboriladi');
  /* 6. Ilova ochilganda avval bulutdan tortiladi (boshqa qurilma yozgan) */
  await addEgg(a); await a.waitForTimeout(5500); const nA = await foods(a); await b2.reload({ waitUntil: 'networkidle' }); await b2.waitForTimeout(5500); assert.equal(await foods(b2), nA, 'ochilganda bulutdagi yangi yozuvlar tortildi'); log('ilova ochilganda avval bulutdan tortiladi (birlashtiriladi)');
  /* 7. 24 soat yuborilmasa — Bugun'da sariq banner sabab bilan */
  const e = await open(app, { state: kfWith(3), ls: { kalki_zaxira_kalkifit: { on: true, code: BK.genCode(app), ver: 3, last: Date.now() - 30 * 3600000, pending: true, conflict: 0, shrink: 0, sig: '', psince: Date.now() - 26 * 3600000, err: 'offline', errAt: Date.now() } } }); await e.waitForTimeout(1500);
  const bn = await T(e, '.sl-bkb'); assert.match(bn || '', /Ma'lumotlaringiz bulutga saqlanmayapti/); assert.match(bn, /Hozir saqlash/); log('24 soatdan ko\'p yuborilmasa — Bugun ekranida sariq banner (sabab bilan)');
  /* 8. Akkauntsiz yumshoq karta: 2+ kun yozuvdan keyin, 7 kunda bir */
  const g = await open(app, { state: kfWith(2) }); await g.waitForTimeout(4200); assert.equal(await g.locator('.sl-gc').count(), 1, 'karta chiqdi'); assert.match(await T(g, '.sl-gc'), /Ma'lumotingiz faqat shu telefonda/); await g.click('[data-act=gcno]'); await g.waitForTimeout(400); assert.equal(await g.locator('.sl-gc').count(), 0);
  await g.evaluate(() => localStorage.setItem('kalki_fit_gcard', String(Date.now() - 8 * 864e5))); await g.reload({ waitUntil: 'networkidle' }); await g.waitForTimeout(4200); assert.equal(await g.locator('.sl-gc').count(), 1, '7 kundan keyin qaytdi');
  const onbg = await open(app, {}); assert.match(await T(onbg, '[data-akk=onb]'), /Oldin KalkiFit ishlatganmisiz\? Hisobingizga kiring/); log('akkauntsiz: yumshoq karta (2+ kun, 7 kunda bir) va birinchi ochilishda «Oldin ishlatganmisiz? Hisobingizga kiring»');
  /* 9. Android: APK onlayn bo'lsa HAR DOIM yangi web; zaxira qoidalari (qobiq loyihasi bo'lsa) */
  const sb = fs.readFileSync(path.join(ROOT, 'assets/sw-boot.js'), 'utf8'); assert.match(sb, /sw_update_app_reload/, 'ilovada yangi SW egallasa — darhol qayta yuklanadi'); const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'); assert.match(sw, /freshFirst/);
  const AND = path.join(process.env.HOME || '', 'projects/kalkifit-android'); if (fs.existsSync(AND)) { const cap = JSON.parse(fs.readFileSync(path.join(AND, 'capacitor.config.json'), 'utf8')); assert.equal(cap.server.url, 'https://kalki.uz/kalkifit', 'ilova har doim jonli saytni ochadi (bundled fayllar faqat offline.html)'); assert.ok(fs.existsSync(path.join(AND, 'android/app/src/main/res/xml/backup_rules.xml')) && fs.existsSync(path.join(AND, 'android/app/src/main/res/xml/data_extraction_rules.xml')), 'Auto Backup qoidalari'); const mf = fs.readFileSync(path.join(AND, 'android/app/src/main/AndroidManifest.xml'), 'utf8'); assert.match(mf, /allowBackup="true"/); assert.match(mf, /dataExtractionRules/); const vj = JSON.parse(fs.readFileSync(path.join(ROOT, 'ilova/versiya.json'), 'utf8')); const gr = fs.readFileSync(path.join(AND, 'android/app/build.gradle'), 'utf8'); assert.equal(+/versionCode (\d+)/.exec(gr)[1], vj.versionCode, 'saytdagi havola = so\'nggi versionCode'); assert.ok(fs.existsSync(path.join(ROOT, vj.apk.slice(1)))); }
  log('Android: ilova jonli saytni ochadi, yangi SW egallasa darhol yangilanadi, Auto Backup qoidalari, saytdagi havola so\'nggi APK\'ga');
  console.log('\n' + n + '/' + n + ' OK');
} catch (e2) { console.error(e2); process.exitCode = 1; } finally { await b.close(); srv.close(); }
