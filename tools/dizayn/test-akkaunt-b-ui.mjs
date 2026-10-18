// Akkaunt B bosqich (gibrid): kirgan foydalanuvchi ma'lumoti avtomatik saqlanadi, YANGI QURILMADA (ikkinchi brauzer konteksti) email bilan tiklanadi; tiklash-kodli foydalanuvchi
// qayta yuklamasdan ulanadi; chiqish/kirish; ikki tomonda ma'lumot bo'lsa tanlov; qat'iy rejim; «Boshqa usullar»; Telegram eslatmasi; xato matnlari.   node tools/dizayn/test-akkaunt-b-ui.mjs
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
{ const nc0 = b.newContext.bind(b); b.newContext = async (o) => { const c = await nc0(o); await c.addInitScript(() => { try { for (const a of ['kalkifit', 'rozgor']) if (!localStorage.getItem('kalki_news_' + a)) localStorage.setItem('kalki_news_' + a, '{"shown":999,"read":999}'); } catch (e) {} }); return c; }; }
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
try {
  for (const app of ['kalkifit', 'rozgor']) {
    const A = APPS[app];
    /* 1. Avtomatik saqlash + YANGI QURILMADA tiklash (ikki brauzer konteksti) */
    ENV = mkEnv(); let d1 = await open(app, { state: A.st(MARK[app], 4) }); await goProfile(d1, app);
    await login(d1, app, 'Yangi@Pochta.uz'); await waitUploaded(d1, app);
    const c1 = await cs(d1, app); assert.equal(c1.on, true); assert.match(c1.code, /^(KF|RZ)-([A-Z2-9]{4}-){6}[A-Z2-9]{4}$/);
    assert.equal(rows().length, 1); assert.equal(rows()[0].rejim, 'konvert'); assert.equal(rows()[0].ilova, app); assert.equal(DB().prepare('SELECT COUNT(*) AS c FROM zaxira').get().c, 1, 'bulutga avtomatik yozildi');
    const dump = JSON.stringify(DB().prepare('SELECT * FROM akkaunt_ilova').all()); assert.ok(!dump.includes(c1.code.replace(/-/g, '').slice(3)), 'serverda kod ochiq emas');
    assert.match(await T(d1, '[data-akk=row]'), /yangi@pochta\.uz · avtomatik saqlanadi/);
    const dev2 = await open(app, {}); assert.ok(await dev2.locator('#rzOnb').isVisible(), 'yangi qurilma — onboarding'); assert.match(await T(dev2, '[data-akk=onb]'), /Email bilan kirish \(yangi telefon\)/);
    await dev2.click('[data-akk=onb]'); await dev2.waitForTimeout(500); assert.equal(await covers(dev2, '#rzSheet'), 'ok', 'kirish paneli onboarding USTIDA ko\'rinadi'); assert.match(await T(dev2, '#rzSheet'), /Email bilan kirish/);
    await sendMail(dev2, 'YANGI@pochta.uz'); await dev2.fill('#akkCode', devKod('yangi@pochta.uz')); await dev2.waitForTimeout(2200);
    assert.equal(await dev2.locator('#rzOnb').isVisible().catch(() => false), false, 'tiklagach onboarding yopildi'); const s2 = await lsJ(dev2, A.key); assert.equal(A.mark(s2), MARK[app], 'ma\'lumot tiklandi'); assert.equal(A.size(s2), A.size(await lsJ(d1, A.key)));
    assert.equal((await cs(dev2, app)).code, c1.code, 'yangi qurilma ham shu kod bilan avtomatik saqlaydi'); assert.ok(!dev2.req.includes('PUT zaxira'), 'tiklash — faqat o\'qish'); assert.deepEqual(d1.errs.concat(dev2.errs), []);
    await dev2.click(`[data-act=tab][data-v=${A.tab}]`); await dev2.waitForTimeout(500); assert.match(await T(dev2, '[data-akk=row]'), /avtomatik saqlanadi/);
    log(app + ': kirgach ma\'lumot avtomatik bulutga yoziladi (kod serverda faqat shifrlangan); YANGI QURILMA (ikkinchi brauzer konteksti): onboardingda «Email bilan kirish» → kod → ma\'lumot o\'zi tiklanadi, panel onboarding ustida');
    await d1.context().close(); await dev2.context().close();

    /* 2. Tiklash-kodli foydalanuvchi — zaxirasi qayta yuklanmasdan ulanadi; chiqish/kirish takrori */
    ENV = mkEnv(); const KOD = BK.genCode(app), keys = await BK.deriveKeys(app, BK.parseCode(app, KOD).body), st0 = A.st(MARK[app], 3);
    await ZAX.onRequest({ request: new Request(BASE + '/api/zaxira', { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: BASE, 'CF-Connecting-IP': '4.4.4.4' }, body: JSON.stringify({ id: keys.id, ilova: app, kutilgan: 0, blob: await BK.seal(app, keys, A.exp(st0)) }) }), env: ENV });
    const csSeed = { on: true, code: KOD, ver: 1, last: Date.now(), pending: false, conflict: 0, sig: '' };
    let d = await open(app, { state: st0, ls: { ['kalki_zaxira_' + app]: csSeed } }); await goProfile(d, app); const zBefore = DB().prepare('SELECT blob, versiya FROM zaxira').get();
    await login(d, app, 'kodli@pochta.uz'); await d.waitForTimeout(1500);
    assert.equal(rows().length, 1); assert.equal(rows()[0].zaxira_id, keys.id, 'mavjud zaxira ulandi'); assert.equal((await cs(d, app)).code, KOD, 'kod o\'zgarmadi (yangisi yaratilmadi)'); assert.ok(!d.req.some((x) => /^PUT zaxira/.test(x)), 'qayta yuklanmadi');
    const zAfter = DB().prepare('SELECT blob, versiya FROM zaxira').get(); assert.deepEqual(zAfter, zBefore, 'zaxira bayt-bayt o\'zgarmagan'); assert.equal(DB().prepare('SELECT COUNT(*) AS c FROM zaxira').get().c, 1);
    await d.click('[data-akk=row]'); await d.waitForTimeout(450); await d.click('[data-act=akkout]'); await d.waitForTimeout(700); assert.equal(rows().length, 1, 'chiqish ulanishni o\'chirmaydi'); assert.equal((await cs(d, app)).on, true, 'chiqishdan keyin ham bulut ishlayveradi');
    await d.waitForSelector('[data-akk=row]'); await login(d, app, 'kodli@pochta.uz'); await d.waitForTimeout(1200);
    assert.equal(rows().length, 1); assert.equal((await cs(d, app)).code, KOD); assert.equal(await d.locator('#rzSheet.open').count(), 0, 'takror kirishda tanlov oynasi chiqmaydi'); assert.ok(!d.req.some((x) => /^PUT zaxira/.test(x))); assert.deepEqual(d.errs, []);
    await d.click('[data-akk=row]'); await d.waitForTimeout(450); await d.click('[data-act=akkout]'); await d.waitForTimeout(500);
    log(app + ': tiklash-kodli foydalanuvchi kirsa zaxirasi akkauntga ULANADI (yangi kod yaratilmaydi, zaxira qayta yuklanmaydi — bayt-bayt bir xil); chiqish/kirish takrori ulanishni buzmaydi'); await d.context().close();

    /* 3. Ikkala tomonda ma'lumot: tanlov. a) akkauntdagini olish  b) shu qurilmadagini saqlash */
    for (const pick of ['cloud', 'local']) {
      ENV = mkEnv(); const a = await open(app, { state: A.st(MARK[app], 4) }); await goProfile(a, app); await login(a, app, 'tanlov@pochta.uz'); await waitUploaded(a, app); const accCode = (await cs(a, app)).code; const ver0 = (await cs(a, app)).ver;
      const other = pick === 'cloud' ? (app === 'kalkifit' ? 55.5 : 1111000) : (app === 'kalkifit' ? 66.6 : 2222000);
      const bdev = await open(app, { state: A.st(other, 2) }); await goProfile(bdev, app); await login(bdev, app, 'tanlov@pochta.uz'); await bdev.waitForTimeout(800);
      assert.match(await T(bdev, '#rzSheet'), /Bu qurilmada ham ma'lumot bor/); assert.match(await T(bdev, '#rzSheet'), /Qaysi biri qolsin/); assert.equal(A.mark(await lsJ(bdev, A.key)), other, 'jimgina ustiga yozilmadi');
      if (pick === 'cloud') { await bdev.click('[data-act=akkcfcloud]'); await bdev.waitForTimeout(1500); assert.equal(A.mark(await lsJ(bdev, A.key)), MARK[app], 'akkauntdagi nusxa olindi'); assert.equal((await cs(bdev, app)).code, accCode); }
      else {
        await bdev.click('[data-act=akkcflocal]'); await waitUploaded(bdev, app, ver0); const c = await cs(bdev, app); assert.equal(c.code, accCode, 'shu qurilma akkaunt kodiga yozadi'); assert.ok(c.ver > ver0, 'bulutdagi versiya oshdi');
        const g = await (await ZAX.onRequest({ request: new Request(BASE + '/api/zaxira?id=' + (await BK.deriveKeys(app, BK.parseCode(app, accCode).body)).id, { headers: { Origin: BASE, 'CF-Connecting-IP': '4.4.4.4' } }), env: ENV })).json();
        const kk = await BK.deriveKeys(app, BK.parseCode(app, accCode).body); const txt = await BK.open(app, kk, g.blob); assert.ok(txt.includes(String(other)), 'bulutda endi shu qurilma ma\'lumoti');
      }
      assert.deepEqual(a.errs.concat(bdev.errs), []); await a.context().close(); await bdev.context().close();
    }
    log(app + ': ikkala qurilmada ma\'lumot bo\'lsa — jimgina ustiga yozilmaydi, «Qaysi biri qolsin?» tanlovi: akkauntdagini olish / shu qurilmadagini saqlash (ikkalasi tekshirildi)');

    /* 4. «Boshqa usullar» (yig'ilgan) + qat'iy rejim */
    ENV = mkEnv(); d1 = await open(app, { state: A.st(MARK[app], 3) }); await goProfile(d1, app); await d1.waitForTimeout(400);
    assert.equal(await d1.locator('details.akk-more').count(), 1); assert.equal(await d1.locator('details.akk-more').evaluate((e) => e.open), false, '«Boshqa usullar» yig\'ilgan'); assert.equal(await d1.locator('[data-bk=tg]').isVisible(), false, 'Telegram zaxirasi yig\'ilgan'); assert.match(await T(d1, 'details.akk-more > summary'), /Boshqa usullar/);
    assert.equal(await d1.locator('[data-akk=strict]').count(), 0, 'kirmagan foydalanuvchiga qat\'iy rejim ko\'rinmaydi');
    await d1.click('details.akk-more > summary'); await d1.waitForTimeout(300); assert.equal(await d1.locator('[data-bk=tg]').isVisible(), true); assert.equal(await d1.locator('[data-bk=cloudoff]').count(), 1, 'tiklash kodi bilan bulut o\'chirilmagan, shu yerda'); assert.ok(await d1.locator('[data-act=export]').isVisible());
    await login(d1, app, 'qatiy@pochta.uz'); await waitUploaded(d1, app); await d1.waitForTimeout(500); assert.equal(await d1.locator('details.akk-more').evaluate((e) => e.open), true, 'ochiq holat render o\'tganda saqlanadi');
    const code1 = (await cs(d1, app)).code; assert.match(await T(d1, '[data-akk=strict]'), /Qat'iy rejim/);
    await d1.click('[data-akk=strict]'); await d1.waitForTimeout(450); let sh = await T(d1, '#rzSheet'); assert.match(sh, /serverda saqlanmaydi/); assert.match(sh, /hech kim — biz ham — tiklay olmaydi/); assert.ok(sh.includes(code1), 'qat\'iy rejimni yoqishdan oldin kod ko\'rsatiladi (yozib olish uchun)');
    await d1.click('[data-act=akkstrictgo]'); await d1.waitForTimeout(900); assert.equal(rows()[0].rejim, 'qatiy'); assert.equal(rows()[0].kod_konvert, null); assert.equal(rows()[0].zaxira_id, null); assert.match(await T(d1, '[data-akk=strict]'), /Yoqilgan/);
    assert.ok(!JSON.stringify(DB().prepare('SELECT * FROM akkaunt_ilova').all()).includes(code1.replace(/-/g, '').slice(2)), 'qat\'iy rejimda server kodni saqlamaydi');
    // yangi qurilma: qat'iy rejim — avtomatik tiklanMAYDI, kod so'raladi; kod bilan tiklanadi
    const d3 = await open(app, {}); await d3.click('[data-akk=onb]'); await d3.waitForTimeout(450); await sendMail(d3, 'qatiy@pochta.uz'); await d3.fill('#akkCode', devKod('qatiy@pochta.uz')); await d3.waitForTimeout(1500);
    assert.match(await T(d3, '#rzSheet'), /Qat'iy rejim yoqilgan/); assert.ok(await d3.locator('#rzOnb').isVisible(), 'ma\'lumot o\'zi tiklanmadi'); assert.ok(!d3.req.some((x) => /^GET zaxira/.test(x)));
    await d3.click('[data-act=akkstrictcode]'); await d3.waitForSelector('#bkCodeIn', { timeout: 5000 }); await d3.fill('#bkCodeIn', code1); await d3.click('#bkGo'); await d3.waitForTimeout(1800); assert.equal(A.mark(await lsJ(d3, A.key)), MARK[app], 'kod bilan tiklandi');
    // konvertga qaytish (kod bor qurilmada)
    await goProfile(d1, app); await d1.click('details.akk-more > summary').catch(() => {}); await d1.waitForTimeout(200); if (!(await d1.locator('[data-akk=strict]').isVisible())) await d1.click('details.akk-more > summary'); await d1.click('[data-akk=strict]'); await d1.waitForTimeout(450); assert.match(await T(d1, '#rzSheet'), /Email bilan tiklashni yoqish/);
    await d1.click('[data-act=akkstrictback]'); await d1.waitForTimeout(900); assert.equal(rows()[0].rejim, 'konvert'); assert.ok(rows()[0].kod_konvert); assert.match(await T(d1, '[data-akk=strict]'), /serverda saqlanmaydi/);
    assert.deepEqual(d1.errs.concat(d3.errs), []); await d1.context().close(); await d3.context().close();
    log(app + ': «Boshqa usullar» (Telegram, tiklash kodi bilan bulut, eksport/import) yig\'ilgan; «Qat\'iy rejim» ichida: kod ko\'rsatiladi, server saqlamaydi, yangi qurilmada avtomatik tiklanmaydi — kod so\'raladi; konvertga qaytish ishlaydi');

    /* 5. Telegram haftalik eslatma kirgan va avtomatik saqlanayotganga chiqmaydi */
    ENV = mkEnv(); const old = A.st(MARK[app], 5, Date.now() - 8 * 86400000);
    let r1 = await open(app, { state: old, mode: 'off' }); assert.equal(await r1.locator('[data-nudge=backup]').count(), 1, 'akkauntsiz: eslatma bor (avvalgidek)'); await r1.context().close();
    r1 = await open(app, { state: old }); assert.equal(await r1.locator('[data-nudge=backup]').count(), 1, 'kirmagan: eslatma bor'); await goProfile(r1, app); await login(r1, app, 'eslatma@pochta.uz'); await waitUploaded(r1, app);
    await r1.click(`[data-act=tab][data-v=today]`); await r1.waitForTimeout(500); assert.equal(await r1.locator('[data-nudge=backup]').count(), 0, 'kirgan va avtomatik saqlanayotgan: Telegram eslatmasi chiqmaydi'); assert.deepEqual(r1.errs, []);
    log(app + ': kirgan va avtomatik saqlanayotgan foydalanuvchiga haftalik Telegram eslatmasi chiqmaydi (kirmagan/akkauntsizga avvalgidek chiqadi)'); await r1.context().close();
  }

  /* 7. Telefondagi haqiqiy ketma-ketlik (iPhone Safari → Chrome): a) kirish → ma'lumot → DARHOL yopish; b) 2-qurilmada onboarding tugagan (deyarli bo'sh) holda Profil'dan kirish; c) onboarding havolasi orqali */
  const change = async (p, app) => { await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(250); if (app === 'kalkifit') await p.click('[data-act=wadd]'); else { await p.click('#rzFab'); await p.waitForTimeout(500); for (const k of ['2', '5', '0', '0', '0']) await p.click(`[data-act=key][data-k="${k}"]`); await p.click('#exSave'); } await p.waitForTimeout(250); };
  const serverState = async (app, code) => { const k = await BK.deriveKeys(app, BK.parseCode(app, code).body), r = DB().prepare('SELECT blob, versiya FROM zaxira WHERE id = ?').get(k.id); return r ? { v: r.versiya, st: JSON.parse(await BK.open(app, k, r.blob)).state } : null; };
  const until = async (fn, ms = 3000) => { const t0 = Date.now(); for (;;) { const v = await fn(); if (v) return v; if (Date.now() - t0 > ms) return null; await new Promise((r) => setTimeout(r, 100)); } };
  for (const app of ['kalkifit', 'rozgor']) {
    const A = APPS[app];
    for (const hide of ['pagehide', 'visibilitychange']) {
      ENV = mkEnv(); const t1 = await open(app, { state: A.triv() }); await goProfile(t1, app); const t0 = Date.now(); await login(t1, app, 'tel@pochta.uz'); await waitUploaded(t1, app); const firstMs = Date.now() - t0;
      const code = (await cs(t1, app)).code; assert.ok(await serverState(app, code), 'kirish bilan birga birinchi saqlash bo\'ldi'); assert.ok(firstMs < 6000, 'birinchi saqlash darhol (kirishdan ' + firstMs + ' ms)');
      await change(t1, app); assert.ok(A.has(await lsJ(t1, A.key)), 'ma\'lumot qo\'shildi');
      // 4 s debounce tugamasdan fonga o'tish/yopish: faqat pagehide/visibilitychange saqlay oladi
      if (hide === 'pagehide') {
        // Playwright navigatsiya paytidagi keepalive so'rovni ushlay olmaydi (brauzer o'zi yuboradi) — shuning uchun bu yerda faqat: pagehide ishladi va oldindan tayyorlangan nusxa yuborildi
        // (holat: pending=false, versiya +1), tayyor nusxa joriy holatga aynan mos edi. Serverga yetishi pastda visibilitychange variantida (sahifa tirik) tekshiriladi.
        await t1.goto('about:blank'); const q = await t1.context().newPage(); await q.goto(BASE + '/assets/app-backup.js'); const c2 = await lsJ(q, 'kalki_zaxira_' + app);
        assert.equal(c2.pending, false, 'pagehide: sinxron keepalive yuborildi (pending=false)'); assert.equal(c2.ver, 2, 'pagehide: versiya oshirildi'); await t1.context().close(); continue;
      }
      await t1.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
      const got = await until(async () => { const x = await serverState(app, code); return x && A.has(x.st) ? x : null; }, 3000); assert.ok(got, hide + ': ma\'lumot debounce kutmasdan serverga yetdi'); assert.ok(got.v >= 2);
      // b) 2-qurilma: onboarding tugagan (faqat profil), Profil'dan kirish → o'zi tiklanadi (tanlov oynasisiz), bulutdagi nusxa ustiga yozilmaydi
      const t2 = await open(app, { state: A.triv() }); await goProfile(t2, app); await login(t2, app, 'tel@pochta.uz'); await t2.waitForTimeout(1800);
      assert.ok(A.has(await lsJ(t2, A.key)), hide + ' b) deyarli bo\'sh qurilma akkauntdan tiklandi'); assert.equal(await t2.locator('[data-act=akkcfcloud]').count(), 0, 'tanlov oynasi chiqmadi (bo\'sh lokal)'); assert.ok(!t2.req.some((x) => /^PUT zaxira/.test(x)), 'bo\'sh qurilma bulutga YOZMADI'); assert.equal((await serverState(app, code)).v, got.v, 'bulutdagi versiya o\'zgarmadi');
      // c) 3-qurilma: yangi (onboarding) → havola orqali
      const t3 = await open(app, {}); await login(t3, app, 'tel@pochta.uz', { onb: true }); await t3.waitForTimeout(1800); assert.ok(A.has(await lsJ(t3, A.key)), hide + ' c) onboarding havolasi orqali tiklandi'); assert.ok(!t3.req.some((x) => /^PUT zaxira/.test(x)));
      assert.deepEqual(t2.errs.concat(t3.errs), []); await t1.context().close(); await t2.context().close(); await t3.context().close();
    }
    log(app + ': telefondagi ketma-ketlik — (a) kirish bilan birinchi saqlash darhol, ma\'lumot qo\'shilib DARHOL yopilsa ham (pagehide / visibilitychange, 4 s debounce kutilmaydi) serverga yetadi; (b) deyarli bo\'sh qurilmada Profil\'dan kirish → o\'zi tiklanadi, bulutga yozmaydi; (c) onboarding havolasi orqali tiklanadi');
    /* 8. Xato: boshqa email (masalan gmail.con) — ogohlantirish */
    ENV = mkEnv(); const ty = await open(app, { state: A.triv() }); await goProfile(ty, app); await ty.click('[data-akk=row]'); await ty.waitForTimeout(450); await ty.fill('#akkEmail', 'achchii99@gmail.con'); await ty.click('#akkSend'); await ty.waitForTimeout(250);
    assert.match(await T(ty, '#akkErr'), /Email manzilida xato bo'lishi mumkin\. «achchii99@gmail\.con» o'rniga «achchii99@gmail\.com» yozdik/); assert.equal(await ty.inputValue('#akkEmail'), 'achchii99@gmail.com'); assert.ok(!ty.req.some((x) => /kod$/.test(x)), 'tuzatilmaguncha kod yuborilmadi');
    await ty.click('#akkSend'); await ty.waitForSelector('#akkCode', { timeout: 6000 }); assert.ok(DB().prepare("SELECT 1 FROM dev_kod WHERE email = 'achchii99@gmail.com'").get(), 'tuzatilgan manzilga yuborildi'); await ty.context().close();
    log(app + ': email xatosi («gmail.con») bilinadi: maydon tuzatiladi, ogohlantirish chiqadi, tasdiqlanmaguncha kod yuborilmaydi');
  }

  /* 6. Xato xabarlari — oddiy tilda, nima qilish kerakligi bilan (UZ/RU/ЎЗ); test bloki faqat kod bosqichida */
  ENV = mkEnv(); { const app = 'kalkifit'; let p = await open(app, { state: APPS[app].st(MARK[app]) }); await goProfile(p, app); await p.click('[data-akk=row]'); await p.waitForTimeout(450);
    await p.click('#akkSend'); await p.waitForTimeout(200); assert.match(await T(p, '#akkErr'), /Email yozilmagan\. Manzilingizni kiriting, masalan: ism@pochta\.uz/);
    await p.fill('#akkEmail', 'ism@pochta'); await p.click('#akkSend'); await p.waitForTimeout(200); assert.match(await T(p, '#akkErr'), /Email noto'g'ri yozilgan\. «@» belgisi va domenni tekshiring/);
    p.force = { kod: { s: 429, j: { xato: 'x', e: 'limit', kut: 1500 } } }; await p.fill('#akkEmail', 'xato@pochta.uz'); await p.click('#akkSend'); await p.waitForTimeout(400); assert.match(await T(p, '#akkErr'), /Urinishlar chegarasi to'ldi\. 25 daqiqadan keyin qayta urinib ko'ring\./);
    p.force = { kod: { s: 429, j: { xato: 'x', e: 'kut', kut: 40 } } }; await p.click('#akkSend'); await p.waitForTimeout(400); assert.match(await T(p, '#akkErr'), /Kod yaqinda yuborilgan\. 40 soniyadan keyin/); p.force = null;
    await sendMail(p, 'xato@pochta.uz'); assert.equal(await p.locator('#akkDevPw').count(), 1, 'test bloki kod bosqichida bor'); await p.fill('#akkCode', ''); await p.click('#akkGo'); await p.waitForTimeout(200); assert.match(await T(p, '#akkErr'), /Emaildagi 6 xonali kodni kiriting/);
    const good = devKod('xato@pochta.uz'), bad = good === '111111' ? '222222' : '111111'; await p.fill('#akkCode', bad); await p.waitForTimeout(700); assert.match(await T(p, '#akkErr'), /Kod noto'g'ri\. Emaildagi 6 xonali kodni qayta kiriting\./);
    DB().exec("UPDATE kirish_kodi SET muddat = 1"); await p.fill('#akkCode', good); await p.waitForTimeout(700); assert.match(await T(p, '#akkErr'), /Kod eskirgan \(10 daqiqa o'tgan\) yoki undan keyin yangi kod yuborilgan\. «Kodni qayta yuborish»ni bosing/);
    await p.context().close(); p = await open(app, { state: APPS[app].st(MARK[app]) }); await goProfile(p, app); await p.click('[data-akk=row]'); await p.waitForTimeout(450); await sendMail(p, 'qulf@pochta.uz'); const g2 = devKod('qulf@pochta.uz'), b2 = g2 === '111111' ? '222222' : '111111';
    for (let i = 0; i < 5; i++) { await p.fill('#akkCode', b2 + ''); await p.waitForTimeout(500); } assert.match(await T(p, '#akkErr'), /Juda ko'p noto'g'ri urinish — xavfsizlik uchun kod bekor qilindi\. «Kodni qayta yuborish»ni bosib yangi kod oling\./); await p.context().close();
    for (const [lang, re1, re2] of [['ru', /Email не указан\. Введите адрес/, /Лимит попыток исчерпан\. Повторите через 25 мин\./], ['cyr', /ёзилмаган\. Манзилингизни киритинг/, /Уринишлар чегараси тўлди\. 25 дақиқадан кейин қайта уриниб кўринг/]]) {
      p = await open(app, { state: APPS[app].st(MARK[app]), lang }); await goProfile(p, app); await p.click('[data-akk=row]'); await p.waitForTimeout(450); await p.click('#akkSend'); await p.waitForTimeout(200); assert.match(await T(p, '#akkErr'), re1);
      p.force = { kod: { s: 429, j: { xato: 'x', e: 'limit', kut: 1500 } } }; await p.fill('#akkEmail', 'x@pochta.uz'); await p.click('#akkSend'); await p.waitForTimeout(400); assert.match(await T(p, '#akkErr'), re2); await p.context().close();
    }
    log('xato xabarlari (UZ/RU/ЎЗ): email yozilmagan/noto\'g\'ri, soatlik chegara «N daqiqadan keyin», kutish soniyasi, kod kiritilmagan/noto\'g\'ri/eskirgan/ko\'p urinish — har biri nima qilish kerakligi bilan; test bloki faqat kod bosqichida'); }
  console.log('\nAkkaunt B UI: ' + n + ' tekshiruv OK');
} finally { await b.close().catch(() => {}); srv.close(); }
