// KalkiFit anonim statistika — brauzerda: hodisalar /api/stat ga sendBeacon bilan boradi (faol, suv, ovqat qo'shildi usul bilan, til), ?demo=1 da hech narsa yuborilmaydi,
// tanada ovqat nomi/kkal/vazn yo'q; APK yuklab olish sahifasi ham hisoblaydi.   node tools/dizayn/test-stat-ui.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const TODAY = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.apk': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; if (p.endsWith('/')) p += 'index.html'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); if (f.endsWith('.apk')) return r.end('x'); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
function seed() { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 86400000; st.prefs = { tipsDone: true, yemayAsked: 1, jokes: false }; st.profile = { sex: 'm', preg: false, age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: null }; st.trackStart = D.addDays(TODAY, -14); S.addWeight(st, TODAY, 80); return st; }
async function open(url, test = true) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((x) => { try { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); if (x.test) localStorage.setItem('kalki_stat_test', '1'); } catch (e) {} }, { st: seed(), test });
  const p = await c.newPage(); p.bodies = []; p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/stat', async (r) => { p.bodies.push(r.request().postData()); await r.fulfill({ status: 204, body: '' }); }); await p.route(/\/api\/(?!stat)/, (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(900); return p;
}
const flush = (p) => p.evaluate(() => window.dispatchEvent(new Event('pagehide'))).then(() => p.waitForTimeout(500));
const evs = (p) => p.bodies.flatMap((x) => { try { return JSON.parse(x).h.map((h) => h[0] + (h[1] ? '.' + h[1] : '')); } catch (e) { return []; } });
try {
  let p = await open('/kalkifit');
  await p.click('.sl-w [data-act=wadd]'); await p.waitForTimeout(300);
  await p.click('#mainAdd').then(() => p.click('#rzSheet #fdQ')); await p.waitForTimeout(400); await p.fill('#fdQ', 'osh'); await p.waitForSelector('[data-act=pickfood]'); await p.waitForTimeout(300); await p.click('[data-act=pickfood] >> nth=0'); await p.waitForSelector('#fsave'); await p.waitForTimeout(300); await p.click('#fsave'); await p.waitForTimeout(800);
  await flush(p); const e = evs(p); assert.ok(e.includes('faol') && e.includes('suv_qoshildi') && e.includes('ovqat_qoshildi.qidiruv'), 'hodisalar: ' + e.join(','));
  const body = JSON.parse(p.bodies[0]); assert.deepEqual(Object.keys(body).sort(), ['e', 'h', 'p', 'q', 't', 'v']); assert.equal(body.p, 'veb'); assert.equal(body.t, 'uz'); assert.match(body.q, /^[0-9a-f-]{36}$/);
  for (const raw of p.bodies) { const j = JSON.parse(raw); assert.deepEqual(Object.keys(j).sort(), ['e', 'h', 'p', 'q', 't', 'v']); for (const h of j.h) assert.ok(h.length === 3 && typeof h[2] === 'number' && !/osh|palov|kkal|kcal|vazn|weight|\d{2,}/i.test(h[1]), 'tanada ovqat/kkal/vazn yo\'q: ' + h); } assert.deepEqual(p.errs, []); await p.context().close();
  log('Ilova: faol, suv_qoshildi, ovqat_qoshildi.qidiruv → /api/stat (sendBeacon, sahifa yopilganda); tanada faqat q, p, t, h — ovqat nomi, kkal, vazn yo\'q');
  p = await open('/kalkifit?demo=1'); await p.waitForTimeout(500); await p.click('.sl-w [data-act=wadd]').catch(() => {}); await flush(p); assert.equal(p.bodies.length, 0, '?demo=1 — hech narsa yuborilmadi'); await p.context().close();
  p = await open('/kalkifit', false); await p.click('.sl-w [data-act=wadd]'); await flush(p); assert.equal(p.bodies.length, 0, 'localhost/webdriver (sinov bayrog\'isiz) — yuborilmaydi'); await p.context().close();
  log('?demo=1 va avtomat/lokal (webdriver, localhost) — hech narsa yuborilmaydi');
  p = await open('/ilova/'); await p.evaluate(() => { const a = document.getElementById('ilDl'); a.removeAttribute('download'); a.href = '#'; }); await p.click('#ilDl'); await p.waitForTimeout(500); assert.ok(evs(p).includes('apk_yuklandi'), 'APK sahifasi: ' + evs(p)); await p.context().close();
  log('/ilova: «Yuklab olish» bosilganda apk_yuklandi');
} finally { await b.close(); srv.close(); }
console.log('\n' + n + '/' + n + ' OK');
