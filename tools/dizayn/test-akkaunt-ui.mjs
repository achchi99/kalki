// Akkaunt (ixtiyoriy kirish) — KalkiFit va Ro'zg'or Profil/Sozlamalar'idagi «Kirish» bloki: email → kod → tayyor; UZ/ЎЗ/RU; 360 px + katta shrift; asosiy yo'lga xalaqit bermaydi.
// Server — haqiqiy handler (functions/api/akkaunt/[amal].js) + D1 shim, Playwright so'rovlarni unga yo'naltiradi.   node tools/dizayn/test-akkaunt-ui.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const KF = require(path.join(ROOT, 'assets/kalkifit-core.js')); const RZ = require(path.join(ROOT, 'assets/rozgor-core.js')); const TODAY = KF.dates.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port;
const b = track(await chromium.launch());
const API = await import(pathToFileURL(path.join(ROOT, 'functions/api/akkaunt/[amal].js')).href); const EM = await import(pathToFileURL(path.join(ROOT, 'functions/_lib/akkaunt-email.js')).href);
const { makeD1 } = await import('./d1-shim.mjs'); const SCHEMA = fs.readFileSync(path.join(ROOT, 'migrations/akkaunt.sql'), 'utf8');
{ const nc0 = b.newContext.bind(b); b.newContext = async (o) => { const c = await nc0(o); await c.addInitScript(() => { try { for (const a of ['kalkifit', 'rozgor']) if (!localStorage.getItem('kalki_news_' + a)) localStorage.setItem('kalki_news_' + a, '{"shown":999,"read":999}'); } catch (e) {} }); return c; }; }
const kvf = () => { const m = new Map(); return { get: async (k) => m.get(k), put: async (k, v) => { m.set(k, v); }, m }; };
const mkEnv = () => ({ KALKI_AI_KV: kvf(), KALKIFIT_DB: makeD1(SCHEMA), AKKAUNT_OTP_PEPPER: 'p'.repeat(40), AKKAUNT_DEV: '1', ALLOW_LOCAL_ORIGIN: '1', AKKAUNT_ADMIN_PASSWORD: 'admin-sinov', IP_HASH_SALT: 'tuz' });
let ENV = mkEnv(); let n = 0; const log = (m) => console.log('OK  ', ++n + '.', m);
function kfState() { const st = KF.emptyState(); st.setup = true; st.created = Date.now() - 30 * 86400000; st.prefs = { tipsDone: true }; st.profile = { sex: 'f', preg: false, age: 31, height: 166, weight: 64.5, act: 2, goal: 'slow', goalWeight: 60 }; KF.addWeight(st, TODAY, 64.5); for (let i = 0; i < 3; i++) KF.setSteps(st, KF.dates.addDays(TODAY, -i), 3000 + i * 111); return st; }
function rzState() { const st = RZ.emptyState(); st.prefs = { tipsDone: true }; st.setup = true; st.created = Date.now() - 30 * 86400000; st.base = 3000000; st.reserve = 500000; st.income = RZ.addDays(TODAY, 12); for (let i = 0; i < 3; i++) st.tx.push({ id: 't' + i, type: 'exp', amount: 10000 + i, cat: 'oziq', date: RZ.addDays(TODAY, -i), ts: Date.now() - i }); return st; }
const APPS = { kalkifit: { key: 'kalki_fit', st: kfState, tab: 'profile' }, rozgor: { key: 'kalki_rozgor', st: rzState, tab: 'set' } };
/* mode: 'on' (haqiqiy handler) | 'off' (yoqilgan:false) | '404' (Functions yo'q — statik server) */
async function open(app, { lang = '', mode = 'on', vp = { width: 390, height: 844 }, big = false } = {}) {
  const A = APPS[app]; const c = await b.newContext({ viewport: vp, isMobile: true, hasTouch: true, serviceWorkers: 'block', acceptDownloads: true });
  await c.addInitScript((o) => { try { if (!localStorage.getItem(o.key)) localStorage.setItem(o.key, JSON.stringify(o.state)); if (o.big) localStorage.setItem('kalki_fs', 'big'); } catch (e) {} }, { state: A.st(), key: A.key, big });
  const p = await c.newPage(); p.errs = []; p.akkReq = []; p.jar = ''; p.on('pageerror', (e) => p.errs.push(String(e)));
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/**', async (r) => {
    const rq = r.request(), u = rq.url(); if (!/\/api\/akkaunt\//.test(u)) return r.abort();
    p.akkReq.push(rq.method() + ' ' + new URL(u).pathname); if (mode === '404') return r.fulfill({ status: 404, body: '' }); if (mode === 'off') return r.fulfill({ status: 200, contentType: 'application/json', body: '{"yoqilgan":false}' });
    const h = { 'Content-Type': 'application/json', Origin: new URL(u).origin, 'CF-Connecting-IP': '4.4.4.4', 'X-Admin-Password': rq.headers()['x-admin-password'] || '' }; if (p.jar) h.Cookie = p.jar;
    const res = await API.onRequest({ request: new Request(u, { method: rq.method(), headers: h, body: rq.method() === 'POST' ? (rq.postData() || '{}') : undefined }), env: ENV, params: { amal: new URL(u).pathname.split('/').pop() } });
    const sc = res.headers.get('Set-Cookie'); if (sc) { const kv = sc.split(';')[0]; p.jar = /=$/.test(kv) ? '' : kv; }
    r.fulfill({ status: res.status, contentType: 'application/json', body: await res.text() });
  });
  await p.goto(BASE + (lang === 'ru' ? '/ru/' : '/') + app + (lang === 'cyr' ? '?lang=cyr' : ''), { waitUntil: 'networkidle' }); await p.waitForTimeout(500); return p;
}
const T = async (p, sel) => { const l = p.locator(sel).first(); return (await l.count()) ? (await l.innerText()).replace(/\s+/g, ' ').trim() : null; };
const lsOf = (p, key) => p.evaluate((k) => localStorage.getItem(k), key);
const goProfile = async (p, app) => { await p.click(`[data-act=tab][data-v=${APPS[app].tab}]`); await p.waitForTimeout(500); };
const inView = async (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return 'yoq'; const r = e.getBoundingClientRect(), v = window.visualViewport || { width: innerWidth, height: innerHeight }; return r.left >= -1 && r.right <= v.width + 1 && r.top >= -1 && r.bottom <= v.height + 1 ? 'ok' : JSON.stringify([r.left, r.top, r.right, r.bottom, v.width, v.height].map(Math.round)); }, sel);
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const adminPw = 'admin-sinov';
try {
  for (const app of ['kalkifit', 'rozgor']) {
    /* 1. Yopiq (production kaliti yo'q) — blok umuman ko'rinmaydi, ilova avvalgidek */
    for (const mode of ['off', '404']) {
      const p = await open(app, { mode }); assert.equal(p.akkReq.length, 0, 'ilova ochilganda akkaunt so\'rovi YO\'Q (faqat Profil ochilganda)'); await goProfile(p, app);
      assert.equal(await p.locator('[data-akk=row]').count(), 0, mode + ': kirish qatori ko\'rinmaydi'); assert.ok(await p.locator('.rz-row[data-act=bkcl]').count() > 0, 'bulut qatori joyida');
      await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(200); await goProfile(p, app); assert.equal(p.akkReq.filter((x) => /sessiya/.test(x)).length, 1, 'holat keshlanadi: qayta renderda yana so\'ralmaydi'); assert.deepEqual(p.errs, []); await p.context().close();
    }
    log(app + ': production kaliti yo\'q (yoqilgan:false) yoki Functions yo\'q — «Kirish» ko\'rinmaydi, ilova ochilganda akkaunt so\'rovi yo\'q, holat keshlanadi (qayta-qayta so\'ralmaydi)');

    /* 2. Yoqilgan: email → kod → tayyor */
    ENV = mkEnv(); let p = await open(app); const before = await lsOf(p, APPS[app].key);
    assert.equal(await p.locator('[data-akk=row]').count(), 0, 'Today/asosiy ekranda akkaunt yo\'q'); await goProfile(p, app);
    assert.match(await T(p, '[data-akk=row]'), /Kirish \(ixtiyoriy\)/); assert.match(await T(p, '[data-akk=row]'), /parol kerak emas/);
    await p.click('[data-akk=row]'); await p.waitForTimeout(450); let sh = await T(p, '#rzSheet'); assert.match(sh, /Kirish \(ixtiyoriy\)/); assert.match(sh, /Parol kerak emas/); assert.match(sh, /ilova avvalgidek ishlayveradi/); assert.match(sh, /Test rejimi/); assert.equal(await p.locator('#akkEmail').count(), 1);
    await p.fill('#akkEmail', 'noto\'g\'ri'); await p.click('#akkSend'); await p.waitForTimeout(200); assert.match(await T(p, '#akkErr'), /Email noto'g'ri yozilgan/); assert.equal(p.akkReq.filter((x) => /kod/.test(x)).length, 0, 'noto\'g\'ri email serverga bormaydi');
    await p.fill('#akkEmail', 'Madina@Pochta.uz'); await p.click('#akkSend'); await p.waitForSelector('#akkCode', { timeout: 5000 }); sh = await T(p, '#rzSheet'); assert.match(sh, /madina@pochta\.uz manziliga 6 xonali kod yubordik|Madina@Pochta\.uz manziliga/i); assert.match(sh, /Spam/);
    assert.match(await T(p, '#akkResend'), /Qayta yuborish: \d+ s/); assert.equal(await p.locator('#akkResend').isDisabled(), true);
    await p.fill('#akkCode', '000000'); await p.waitForTimeout(500); let er = await T(p, '#akkErr'); if (!/Kod noto'g'ri/.test(er || '')) { /* 1/10^6 ehtimol: tasodifan to'g'ri */ } else assert.match(er, /Kod noto'g'ri/);
    await p.fill('#akkDevPw', 'xato-parol'); await p.click('[data-act=akkdev]'); await p.waitForTimeout(400); assert.match(await T(p, '#akkErr'), /Kod topilmadi/);
    await p.fill('#akkDevPw', adminPw); await p.click('[data-act=akkdev]'); await p.waitForTimeout(400); const kod = await p.inputValue('#akkCode'); assert.match(kod, /^\d{6}$/); assert.equal(kod, ENV.KALKIFIT_DB._raw.prepare('SELECT kod FROM dev_kod WHERE email = ?').get('madina@pochta.uz').kod);
    await p.click('#akkGo'); await p.waitForTimeout(900); assert.match(await T(p, '#rzToast'), /Akkaunt ochildi/); assert.equal(await p.locator('#rzSheet').evaluate((e) => e.hidden || !e.classList.contains('open')), true, 'panel yopildi');
    assert.match(await T(p, '[data-akk=row]'), /Akkaunt/); assert.match(await T(p, '[data-akk=row]'), /madina@pochta\.uz/);
    assert.equal(await lsOf(p, APPS[app].key), before, 'ilova ma\'lumoti kirishdan o\'zgarmadi'); assert.equal(await lsOf(p, 'kalki_zaxira_' + app), null, 'bulutga saqlash/tiklash kodiga tegilmadi');
    log(app + ': Profil → «Kirish (ixtiyoriy)» → email → kod (qayta yuborish 60 s taymer, noto\'g\'ri email serverga bormaydi, noto\'g\'ri kod xatosi) → «Akkaunt ochildi», qatorda email; ilova ma\'lumoti va tiklash kodi tegilmagan');

    /* 3. Akkaunt paneli: marketing (odatda o'chiq), qurilmalar, yuklab olish */
    await p.click('[data-akk=row]'); await p.waitForTimeout(450); sh = await T(p, '#rzSheet'); assert.match(sh, /Kirgansiz: madina@pochta\.uz/); assert.match(sh, /Kirgan qurilmalar: \d/); assert.match(sh, /Yangilik va maslahatlarni emailga yuborishga roziman/);
    assert.equal(await p.locator('#akkMk').isChecked(), false, 'marketing roziligi odatda O\'CHIQ'); assert.equal(ENV.KALKIFIT_DB._raw.prepare('SELECT marketing FROM akkaunt').get().marketing, 0);
    await p.click('#akkMk'); await p.waitForTimeout(500); assert.equal(ENV.KALKIFIT_DB._raw.prepare('SELECT marketing, marketing_matn_v FROM akkaunt').get().marketing, 1); assert.equal(await p.locator('#akkMk').isChecked(), true);
    await p.click('#akkMk'); await p.waitForTimeout(500); assert.equal(ENV.KALKIFIT_DB._raw.prepare('SELECT marketing FROM akkaunt').get().marketing, 0);
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=akkdl]')]); assert.match(dl.suggestedFilename(), /^kalki-akkaunt-\d{4}-\d{2}-\d{2}\.json$/); const dj = JSON.parse(fs.readFileSync(await dl.path(), 'utf8')); assert.equal(dj.akkaunt.email, 'madina@pochta.uz'); assert.ok(!('name' in dj.akkaunt) && !('phone' in dj.akkaunt));
    log(app + ': akkaunt paneli — marketing roziligi odatda O\'CHIQ, yoqish/o\'chirish serverda saqlanadi, «Ma\'lumotimni yuklab olish» JSON beradi (ism/telefon yo\'q)');

    /* 4. Qayta ochish: sessiya saqlanadi (cookie) → qator darhol akkaunt; chiqish */
    await p.click('#rzSheet .rz-x'); await p.waitForTimeout(350); await p.reload({ waitUntil: 'networkidle' }); await goProfile(p, app); assert.match(await T(p, '[data-akk=row]'), /madina@pochta\.uz/, 'reloaddan keyin ham kirgan');
    await p.click('[data-akk=row]'); await p.waitForTimeout(450); await p.click('[data-act=akkout]'); await p.waitForTimeout(700); assert.match(await T(p, '#rzToast'), /Chiqdingiz/); assert.match(await T(p, '[data-akk=row]'), /Kirish \(ixtiyoriy\)/); assert.equal(ENV.KALKIFIT_DB._raw.prepare('SELECT COUNT(*) AS c FROM sessiya').get().c, 0);
    assert.equal(await lsOf(p, APPS[app].key), before, 'chiqishdan keyin ham ilova ma\'lumoti o\'z joyida');
    log(app + ': sahifa qayta yuklansa kirgan holat saqlanadi; «Chiqish» sessiyani o\'chiradi, ilova ma\'lumoti o\'zgarmaydi');

    /* 5. Akkauntni o'chirish (email kodi bilan) */
    const reset = () => ENV.KALKIFIT_DB._raw.exec('DELETE FROM limit_hisob'); reset(); ENV.KALKI_AI_KV.m.clear(); await p.evaluate(() => localStorage.removeItem('kalki_akk')); await p.reload({ waitUntil: 'networkidle' }); await goProfile(p, app);
    await p.click('[data-akk=row]'); await p.waitForTimeout(400); await p.fill('#akkEmail', 'madina@pochta.uz'); await p.click('#akkSend'); await p.waitForSelector('#akkCode'); await p.fill('#akkDevPw', adminPw); await p.click('[data-act=akkdev]'); await p.waitForTimeout(400); await p.click('#akkGo'); await p.waitForTimeout(900); assert.match(await T(p, '#rzToast'), /Kirdingiz/, 'mavjud akkaunt — «Akkaunt ochildi» emas');
    await p.click('[data-akk=row]'); await p.waitForTimeout(450); await p.click('[data-act=akkdel]'); await p.waitForTimeout(350); assert.match(await T(p, '#rzSheet'), /butunlay o'chadi/); assert.match(await T(p, '#rzSheet'), /bulutdagi zaxira va tiklash kodi saqlanib qoladi/);
    reset(); await p.click('#akkDelSend'); await p.waitForSelector('#akkCode'); await p.fill('#akkDevPw', adminPw); await p.click('[data-act=akkdev]'); await p.waitForTimeout(400); await p.click('#akkGo'); await p.waitForTimeout(900);
    assert.match(await T(p, '#rzToast'), /Akkaunt o'chirildi/); assert.equal(ENV.KALKIFIT_DB._raw.prepare('SELECT COUNT(*) AS c FROM akkaunt').get().c, 0); assert.equal(ENV.KALKIFIT_DB._raw.prepare('SELECT COUNT(*) AS c FROM sessiya').get().c, 0); assert.match(await T(p, '[data-akk=row]'), /Kirish \(ixtiyoriy\)/); assert.equal(await lsOf(p, APPS[app].key), before);
    assert.deepEqual(p.errs, []); await p.context().close();
    log(app + ': akkauntni o\'chirish — ogohlantirish matni, email kodi bilan tasdiq, serverdan hamma narsa o\'chadi, ilova ma\'lumoti saqlanadi');

    /* 6. Tillar: RU va ЎЗ */
    ENV = mkEnv(); p = await open(app, { lang: 'ru' }); await goProfile(p, app); assert.match(await T(p, '[data-akk=row]'), /Вход \(по желанию\)/); await p.click('[data-akk=row]'); await p.waitForTimeout(450); sh = await T(p, '#rzSheet'); assert.match(sh, /Пароль не нужен/); assert.match(sh, /приложение работает как раньше/);
    await p.fill('#akkEmail', 'ru@pochta.uz'); await p.click('#akkSend'); await p.waitForSelector('#akkCode'); assert.match(await T(p, '#rzSheet'), /Мы отправили 6-значный код на ru@pochta\.uz/); await p.fill('#akkCode', '123456'); await p.waitForTimeout(700); assert.match(await T(p, '#akkErr') || '', /Код неверный|Код устарел/); await p.context().close();
    p = await open(app, { lang: 'cyr' }); await goProfile(p, app); assert.match(await T(p, '[data-akk=row]'), /Кириш \(ихтиёрий\)/); await p.click('[data-akk=row]'); await p.waitForTimeout(450); sh = await T(p, '#rzSheet'); assert.match(sh, /Парол керак эмас/); assert.doesNotMatch(sh, /Kirish|Parol/); await p.context().close();
    log(app + ': matnlar RU va ЎЗ da');

    /* 7. 360 px + katta shrift: panel sig'adi, gorizontal siljish yo'q, tugma ko'rinadi (klaviatura ochiq: kichik balandlik) */
    ENV = mkEnv(); for (const [vp, big] of [[{ width: 360, height: 640 }, false], [{ width: 360, height: 640 }, true], [{ width: 360, height: 420 }, true]]) {
      p = await open(app, { vp, big }); assert.equal(await p.evaluate(() => document.documentElement.classList.contains('fs-big')), big, 'katta shrift holati'); await goProfile(p, app); assert.equal(await noOverflow(p), true, 'profil: gorizontal siljish yo\'q'); await p.click('[data-akk=row]'); await p.waitForTimeout(500);
      assert.equal(await noOverflow(p), true); await p.locator('#akkEmail').scrollIntoViewIfNeeded(); assert.equal(await inView(p, '#akkEmail'), 'ok', JSON.stringify(vp) + big + ' email maydoni ko\'rinadi (panel aylanadi)'); await p.fill('#akkEmail', 'katta@pochta.uz'); await p.click('#akkSend'); await p.waitForSelector('#akkCode'); await p.waitForTimeout(400);
      await p.locator('#akkCode').scrollIntoViewIfNeeded(); assert.equal(await inView(p, '#akkCode'), 'ok', 'kod maydoni ko\'rinadi'); await p.locator('#akkGo').scrollIntoViewIfNeeded(); assert.equal(await inView(p, '#akkGo'), 'ok', 'kirish tugmasi'); assert.equal(await noOverflow(p), true);
      if (vp.height >= 500) { await p.fill('#akkDevPw', adminPw); await p.click('[data-act=akkdev]'); await p.waitForTimeout(400); await p.click('#akkGo'); await p.waitForTimeout(900); await p.click('[data-akk=row]'); await p.waitForTimeout(500); assert.equal(await inView(p, '#akkMk'), 'ok', 'marketing katagi ko\'rinadi'); assert.equal(await noOverflow(p), true); assert.ok(((await p.locator('#akkMk').boundingBox()).width) >= 20); }
      assert.deepEqual(p.errs, []); await p.context().close(); ENV = mkEnv();
    }
    log(app + ': 360 px, katta shrift (fs-big) va past balandlik (klaviatura ochiq) — email/kod/tugma/katak ko\'rinadi, gorizontal siljish yo\'q');
  }
  console.log('\nAkkaunt UI: ' + n + ' tekshiruv OK');
} finally { await b.close().catch(() => {}); srv.close(); }
