// KalkiFit: YANGI QURILMA + akkaunt sinxroni. A qurilmada boy ma'lumot bulutga yoziladi; B — butunlay toza (hech bir bayroqsiz) Android WebView / iPhone WebKit:
// onboarding → «Avval ishlatganman» → email → tiklash → birinchi ekranda halqa + makrolar + Maslahatchi boshi + ovqatlar bor; qayta ochilganda ham.   node tools/dizayn/test-yangi-qurilma.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
import { brauzerlar, seed, S, T0, D } from './sigmaslik-yadro.mjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const SHOT = process.env.YQ_SHOT || ''; const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port;
const B = await brauzerlar();
const API = await import(pathToFileURL(path.join(ROOT, 'functions/api/akkaunt/[amal].js')).href); const ZAX = await import(pathToFileURL(path.join(ROOT, 'functions/api/zaxira.js')).href);
const { makeD1 } = await import('./d1-shim.mjs'); const SCHEMA = fs.readFileSync(path.join(ROOT, 'migrations/akkaunt.sql'), 'utf8') + '\n' + fs.readFileSync(path.join(ROOT, 'migrations/zaxira.sql'), 'utf8');
const kvf = () => { const m = new Map(); return { get: async (k) => m.get(k), put: async (k, v) => { m.set(k, v); }, m }; };
const mkEnv = () => ({ KALKI_AI_KV: kvf(), KALKIFIT_DB: makeD1(SCHEMA), AKKAUNT_OTP_PEPPER: 'p'.repeat(40), AKKAUNT_MASTER_KEYS: '1:' + 'Kalit1'.repeat(8), AKKAUNT_DEV: '1', ALLOW_LOCAL_ORIGIN: '1', AKKAUNT_ADMIN_PASSWORD: 'admin-sinov', IP_HASH_SALT: 'tuz' });
let ENV = mkEnv(); const DB = () => ENV.KALKIFIT_DB._raw; let n = 0; const log = (m) => console.log('OK  ', ++n + '.', m);
const ANDROID = `window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: [], addListener: () => ({ remove() {} }) };`;
const SIZES = [[360, 740], [360, 640], [412, 915], [390, 844], [375, 667]];
const PLATS = [['android-webview', 'chromium', { viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-A546B Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.0.0 Mobile Safari/537.36', native: true }], ['iphone-webkit', 'webkit', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]];
function richState() { const st = seed({ age: 40, steps: 6200, ex: 25, water: 3, food: [[T0, 'osh', 'l', 520, 18, 22, 60], [T0, 'non', 'b', 250, 8, 2, 48], [T0, 'olma', 's', 80, 0, 0, 20], [D.addDays(T0, -1), 'osh', 'l', 500, 16, 20, 58], [D.addDays(T0, -2), 'non', 'b', 260, 8, 3, 49]] }); st.prefs.tipsDone = true; return st; }
async function open(plat, { state = null, ls = {} } = {}) {          // state=null → BUTUNLAY toza qurilma (bayroqsiz: tanishtiruv, yangilik, «ko'chdi» qatlamlari o'zi chiqadi)
  const [, br, o] = plat; const b = B[br]; const c = await b.newContext({ viewport: o.viewport, deviceScaleFactor: o.deviceScaleFactor, isMobile: o.isMobile, hasTouch: o.hasTouch, userAgent: o.userAgent, serviceWorkers: 'block' });
  if (o.native) await c.addInitScript(ANDROID);
  await c.addInitScript((a) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); if (a.st) localStorage.setItem('kalki_fit', a.st); for (const k of Object.keys(a.ls)) localStorage.setItem(k, a.ls[k]); } } catch (e) {} }, { st: state && JSON.stringify(state), ls });
  const p = await c.newPage(); p.errs = []; p.jar = ''; p.req = []; p.on('pageerror', (e) => p.errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') p.errs.push('console: ' + m.text()); });
  await c.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|gsi\/client/, (r) => r.abort());
  await c.route('**/api/**', async (r) => {
    const rq = r.request(), u = rq.url(), pn = new URL(u).pathname; p.req.push(rq.method() + ' ' + pn.replace('/api/', '')); const h = { 'Content-Type': 'application/json', Origin: new URL(u).origin, 'CF-Connecting-IP': '4.4.4.4', 'X-Admin-Password': rq.headers()['x-admin-password'] || '' }; if (p.jar) h.Cookie = p.jar;
    if (/\/api\/zaxira/.test(u)) { const zr = await ZAX.onRequest({ request: new Request(u, { method: rq.method(), headers: h, body: rq.postData() || undefined }), env: ENV }); return r.fulfill({ status: zr.status, contentType: 'application/json', body: await zr.text() }); }
    if (!/\/api\/akkaunt\//.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    const res = await API.onRequest({ request: new Request(u, { method: rq.method(), headers: h, body: rq.method() === 'POST' ? (rq.postData() || '{}') : undefined }), env: ENV, params: { amal: pn.split('/').pop() } }); const sc = res.headers.get('Set-Cookie'); if (sc) { const kv = sc.split(';')[0]; p.jar = /=$/.test(kv) ? '' : kv; }
    r.fulfill({ status: res.status, contentType: 'application/json', body: await res.text() });
  });
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(900); return p;
}
const devKod = (email) => DB().prepare('SELECT kod FROM dev_kod WHERE email = ?').get(email).kod;
const snap = (p, nom) => SHOT ? p.screenshot({ path: path.join(SHOT, nom + '.png') }) : null;
/* birinchi ekran: ko'rinadigan bo'limlar (viewport ichida kamida min px) */
const FIRST = (p) => p.evaluate(() => { const nv = document.querySelector('.rz-nav'), vh = nv ? Math.round(nv.getBoundingClientRect().top) : innerHeight, f = (sel) => { const e = document.querySelector(sel); if (!e) return -1; const r = e.getBoundingClientRect(); if (!r.width || !r.height || getComputedStyle(e).visibility === 'hidden') return -1; return Math.round(Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0))); };
  const top = (sel) => { const e = document.querySelector(sel); return e ? Math.round(e.getBoundingClientRect().top) : -1; };
  const cx = innerWidth / 2, cy = vh / 2, hit = document.elementFromPoint(cx, cy);
  return { vh, ring: f('.sl-vsvg'), bju: f('#bjuCard'), adv: Math.max(f('#advCard'), f('#mslCard')), ds: f('#dsCard'), food: f('.sl-meal, .sl-sec2, #foodList'), tops: { ring: top('.sl-vsvg'), bju: top('#bjuCard'), adv: top('#advCard') }, overlay: document.querySelector('#rzOnb, #rzSheet, .kn-ov, .kf-intro, #kfIntro, .rz-ov') ? [...document.querySelectorAll('#rzOnb, #rzSheet, .kn-ov, .kf-intro, #kfIntro, .rz-ov')].map((e) => e.id + '.' + e.className + ':' + getComputedStyle(e).display).join('|') : '', hit: hit ? (hit.id || hit.className || hit.tagName) : null, h: document.documentElement.scrollHeight, text: (document.querySelector('#rzMain') || document.body).innerText.replace(/\s+/g, ' ').slice(0, 200) }; });
async function newDevice(plat, tag, sess = {}) {
  const ph = plat[0]; const dev2 = await open(plat); await snap(dev2, `${ph}-1-toza-ochilish`);
  if (await dev2.locator('[data-act=lppick]').count()) { await dev2.click('[data-act=lppick][data-l=uz]'); await dev2.waitForTimeout(900); await snap(dev2, `${ph}-1b-til-keyin`); }
  if (await dev2.locator('[data-act=inskip]').count()) { await dev2.click('[data-act=inskip]'); await dev2.waitForTimeout(900); await snap(dev2, `${ph}-1c-tanishtiruv-keyin`); }
  const onb = await dev2.locator('#rzOnb').isVisible().catch(() => false); sess.onb = onb;
  if (await dev2.locator('#obUsed').count()) { await dev2.click('#obUsed'); await dev2.waitForSelector('[data-act=obusedacc]'); await dev2.click('[data-act=obusedacc]'); } else await dev2.click('[data-akk=onb]');
  await dev2.waitForTimeout(450); await dev2.fill('#akkEmail', 'Yangi@Pochta.uz'); DB().exec('DELETE FROM limit_hisob'); await dev2.click('#akkSend'); await dev2.waitForSelector('#akkCode', { timeout: 8000 }); await dev2.fill('#akkCode', devKod('yangi@pochta.uz'));
  await dev2.waitForFunction(() => { try { const s = JSON.parse(localStorage.getItem('kalki_fit') || 'null'); return !!(s && s.setup && Object.keys(s.days || {}).length); } catch (e) { return false; } }, null, { timeout: 15000 }); await dev2.waitForTimeout(1800);
  return dev2;
}
const SZ = { 'android-webview': [[360, 740], [360, 640], [412, 915]], 'iphone-webkit': [[390, 844], [375, 667], [390, 664]] };
const MIN = 56;          // Maslahatchi kartasining ko'rinadigan (pastki panel ustidagi) qismi, px
try {
  for (const plat0 of PLATS) {
    if (!B[plat0[1]]) { console.log('SKIP', plat0[0], B.wkXato || ''); continue; }
    for (const [w, h] of SZ[plat0[0]]) {
      const plat = [plat0[0], plat0[1], Object.assign({}, plat0[2], { viewport: { width: w, height: h } })]; const ph = `${plat0[0]}-${w}x${h}`; ENV = mkEnv();
      /* A qurilma: boy ma'lumot → akkaunt → bulut */
      const a = await open(plat, { state: richState(), ls: { kalki_intro_v2: '1', kalki_no_fc: '1', kalki_news_kalkifit: '{"shown":999,"read":999}' } });
      await a.click('[data-act=tab][data-v=profile]').catch(() => {}); await a.waitForTimeout(500);
      await a.click('[data-akk=row]'); await a.waitForTimeout(450); await a.fill('#akkEmail', 'Yangi@Pochta.uz'); await a.click('#akkSend'); await a.waitForSelector('#akkCode'); await a.fill('#akkCode', devKod('yangi@pochta.uz'));
      await a.waitForFunction(() => { try { const o = JSON.parse(localStorage.getItem('kalki_zaxira_kalkifit')); return o.ver > 0 && !o.pending; } catch (e) { return false; } }, null, { timeout: 15000 });
      assert.equal(DB().prepare('SELECT COUNT(*) AS c FROM zaxira').get().c, 1, 'A: bulutga yozildi');
      /* B: butunlay toza qurilma → sinxron → birinchi ekran; keyin qayta ochish */
      const sess = {}; const b2 = await newDevice(plat, 'b', sess); const f1 = await FIRST(b2); await snap(b2, `${ph}-2-sinxrondan-keyin`);
      await b2.reload({ waitUntil: 'networkidle' }); await b2.waitForTimeout(1500); const f2 = await FIRST(b2); await snap(b2, `${ph}-3-qayta-ochilganda`);
      assert.ok(sess.onb, ph + ': yangi qurilma — onboarding/til tanlash chiqdi');
      for (const [nom, f] of [['sinxrondan keyin', f1], ['qayta ochilganda', f2]]) {
        const m = `${ph} ${nom}: ${JSON.stringify(f)}`;
        assert.ok(f.ring >= 120, 'halqa birinchi ekranda: ' + m); assert.ok(f.bju >= 70, 'makrolar (Oqsil/Yog\'/Uglevod) birinchi ekranda: ' + m); assert.ok(f.adv >= MIN, `Maslahatchi kartasining boshi birinchi ekranda (pastki panel USTIDA kamida ${MIN}px): ` + m);
        assert.ok(!/(^|\|)\w*:?(block|flex)/.test((f.overlay || '').split('|').filter((x) => !/:none$/.test(x)).join('|')) , 'ko\'rinadigan qatlam yo\'q: ' + m);
      }
      const ids = await b2.evaluate(() => ({ food: document.querySelectorAll('.sl-meal').length, steps: !!document.querySelector('.sl-s, .sl-act'), msl: !!document.querySelector('#advCard,#mslCard'), ds: document.querySelectorAll('.sl-meal .sl-rw, .sl-meal .sl-row').length }));
      assert.ok(ids.food >= 3 && ids.msl && ids.steps, ph + ': sinxrondan keyin hamma bo\'lim qayta chizilgan ' + JSON.stringify(ids)); assert.ok(!b2.errs.some((e) => /^[^c]/.test(e) || /TypeError|ReferenceError/.test(e)), ph + ' xatolar: ' + b2.errs.join(' | '));
      log(`${ph}: yangi qurilma + akkaunt sinxroni — halqa ${f1.ring}px, makrolar ${f1.bju}px, Maslahatchi ${f1.adv}px ko'rinadi (qayta ochganda ${f2.adv}px), ovqatlar/qadam bor, xato yo'q`);
      await a.context().close(); await b2.context().close();
    }
  }
} finally { await Promise.all(Object.values(B).filter((x) => x && x.close).map((x) => x.close().catch(() => {}))); srv.close(); }
