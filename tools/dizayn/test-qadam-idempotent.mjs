// v52: kunlik qadam IDEMPOTENT — qayta ochish, fon/oldi, qayta yuklash, ikki manba, kechikkan kichik qiymat, kun almashuvi: har birida qadam aniq 9 000.   node tools/dizayn/test-qadam-idempotent.mjs
// (Android plagini SOXTA — Capacitor.nativePromise mock; eski yozuv + sensor yig'ilmaydi.)

import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const S = (await import(ROOT + '/assets/kalkifit-core.js')).default; const D = S.dates;
const dstr = (o) => { const d = new Date(); d.setDate(d.getDate() + o); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const TODAY = dstr(0), YDAY = dstr(-1);
function seed() { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 864e5; st.prefs = { tipsDone: true, jokes: false, yemayK: 1, introDone: true }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = D.addDays(TODAY, -8); S.addWeight(st, TODAY, 80); return st; }
/* o.plugin: null (veb) | { available, granted, grant (requestPermission natijasi), today, yday } */
async function mk(o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', locale: 'uz-UZ' });
  await c.addInitScript((a) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(a.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_lang', a.lang || 'uz'); } } catch (e) {}
    if (!a.plugin) return;
    const q = window.__q = Object.assign({ calls: [] }, a.plugin);
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: [{ name: 'Qadam' }],
      nativePromise: (pl, m, opt) => { q.calls.push(pl + '.' + m + (opt && 'on' in opt ? ':' + opt.on : '')); if (pl !== 'Qadam') return Promise.reject(new Error('yo\'q'));
        if (m === 'isAvailable') return Promise.resolve({ available: q.available, granted: q.available && q.granted, enabled: !!q.enabled });
        if (m === 'requestPermission') { q.granted = !!q.grant; return Promise.resolve({ granted: q.granted }); }
        if (m === 'setEnabled') { q.enabled = !!opt.on && q.granted; return Promise.resolve({ enabled: q.enabled }); }
        if (m === 'getToday') return Promise.resolve({ qadam: q.today, oxirgiYangilanish: Date.now(), sana: a.TODAY });
        if (m === 'getDays') return Promise.resolve({ kunlar: [{ sana: a.YDAY, qadam: q.yday }, { sana: a.TODAY, qadam: q.today }], source: q.source || 'sensor' });
        return Promise.reject(new Error('?')); } }; }, { st: o.st || seed(), plugin: o.plugin || null, lang: o.lang, TODAY, YDAY });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.goto(BASE + (o.url || '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(700); return p; }
const day = (p, d) => p.evaluate((d) => { const s = JSON.parse(localStorage.getItem('kalki_fit')); return s.days[d] || null; }, d);
const prefs = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')).prefs);
const num = async (p) => +(await p.locator('#sNum').first().innerText()).replace(/\D/g, '');
const calls = (p) => p.evaluate(() => window.__q.calls.slice());
try {
  const seedQ = () => { const x = seed(); x.prefs.qa = 'on'; return x; };
  const P = { available: true, granted: true, enabled: true, today: 9000, yday: 0 };
  const stepsOf = async (p, d) => ((await day(p, d)) || {}).steps || 0;
  const vis = async (p) => { await p.evaluate(() => { document.dispatchEvent(new Event('visibilitychange')); }); await p.waitForTimeout(500); };
  /* 1. eski yozuv (qo'lda kiritilgan, sa yo'q) 9 000 + sensor 9 000 → 9 000; qayta ochish/yuklash 3 marta, fon/oldi 5 marta */
  const st = seedQ(); S.setSteps(st, TODAY, 9000); let p = await mk({ st, plugin: Object.assign({}, P) }); await p.waitForTimeout(900);
  assert.equal(await num(p), 9000, 'ilova: 9 000'); assert.equal(await stepsOf(p, TODAY), 9000);
  for (let i = 0; i < 3; i++) { await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(900); assert.equal(await num(p), 9000, 'qayta yuklash ' + (i + 1)); }
  for (let i = 0; i < 5; i++) await vis(p); assert.equal(await stepsOf(p, TODAY), 9000, 'fon/oldi 5×'); log('eski yozuv 9 000 + sensor 9 000 = 9 000; qayta yuklash 3×, fon/oldi 5× — o\'zgarmaydi');
  /* 2. sensor sekin keladi: kichik qiymat (kechikkan) va 0 — 9 000 ni bosmaydi; o'ssa — o'sadi (qo'shilmaydi) */
  await p.evaluate(() => { window.__q.today = 4000; }); await vis(p); assert.equal(await stepsOf(p, TODAY), 9000, 'kechikkan 4 000'); await p.evaluate(() => { window.__q.today = 0; }); await vis(p); assert.equal(await stepsOf(p, TODAY), 9000, '0');
  await p.evaluate(() => { window.__q.today = 9400; }); await vis(p); assert.equal(await stepsOf(p, TODAY), 9400, 'sensor o\'sdi: 9 400 (9 000 + 9 400 emas)'); assert.equal(await num(p), 9400); log('kechikkan 4 000 / 0 — 9 000 qoladi; sensor 9 400 ga o\'sdi — 9 400 (qo\'shilmaydi)');
  assert.deepEqual(p.errs, []); await p.context().close();
  /* 3. ikki manba: native HC va sensordan KATTASINI beradi (source almashadi) — qiymat o'zgarmasa o'zgarmaydi */
  p = await mk({ st: seedQ(), plugin: Object.assign({}, P, { today: 8000 }) }); await p.waitForTimeout(800); assert.equal(await stepsOf(p, TODAY), 8000);
  await p.evaluate(() => { window.__q.today = 9000; window.__q.source = 'hc'; }); await vis(p); assert.equal(await stepsOf(p, TODAY), 9000); await p.evaluate(() => { window.__q.source = 'sensor'; }); await vis(p); await vis(p); assert.equal(await stepsOf(p, TODAY), 9000, 'manba almashsa ham 9 000'); await p.context().close();
  log('ikki manba (sensor 8 000 → HC 9 000 → sensor): 9 000, yig\'ma emas');
  /* 4. kun almashuvi: kecha 9 000 + bugun 0 dan; kecha qiymati qayta kelsa o'zgarmaydi */
  p = await mk({ st: seedQ(), plugin: Object.assign({}, P, { today: 0, yday: 9000 }) }); await p.waitForTimeout(800); assert.equal(await stepsOf(p, YDAY), 9000); assert.equal(await stepsOf(p, TODAY), 0, 'bugun 0 dan'); await vis(p); await vis(p); assert.equal(await stepsOf(p, YDAY), 9000); assert.equal(await stepsOf(p, TODAY), 0);
  await p.evaluate(() => { window.__q.today = 150; }); await vis(p); assert.equal(await stepsOf(p, TODAY), 150); assert.equal(await stepsOf(p, YDAY), 9000); assert.deepEqual(p.errs, []); await p.context().close(); log('kun almashuvi: kecha 9 000 o\'zgarmaydi, bugun 0 dan (150)');
  /* 5. eski xato yozuv (18 000, sa 9 000) ilova ochilganda tuzatiladi; 14 000 (sa 9 000) — tegilmaydi */
  const bad = seedQ(); bad.days[TODAY] = { food: [], water: 0, steps: 18000, sa: 9000 }; bad.days[YDAY] = { food: [], water: 0, steps: 14000, sa: 9000 };
  p = await mk({ st: bad, plugin: Object.assign({}, P, { today: 9000, yday: 9000 }) }); await p.waitForTimeout(900); assert.equal(await stepsOf(p, TODAY), 9000, 'aniq ikki barobar tuzatildi'); assert.equal(await stepsOf(p, YDAY), 14000, 'noaniq — tegilmaydi'); assert.deepEqual(p.errs, []); await p.context().close(); log('eski xato: 18 000 (sa 9 000) → 9 000; 14 000 (sa 9 000) — noaniq, tegilmaydi');
} finally { await b.close(); srv.close(); }
console.log(n + ' guruh OK');
