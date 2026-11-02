// KalkiFit: bulut zaxira HIMOYASI — server 422 {himoya} (bulutda mazmunli nusxa, bu qurilmada kichik) → ilova ustidan yozmaydi, «Bulutda ma'lumotingiz bor — tiklaysizmi?» deb so'raydi (uz/ru); «Baribir saqlash» — majbur bilan.
//   node tools/dizayn/test-kalkifit-zaxira-himoya.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates, TODAY = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const seed = () => { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 864e5; st.prefs = { tipsDone: true, jokes: false, lpTip: 1, introDone: true }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: 75 }; st.trackStart = D.addDays(TODAY, -8); S.addWeight(st, TODAY, 80); for (let i = 3; i >= 0; i--) S.addFood(st, D.addDays(TODAY, -i), { fid: 'osh', meal: 'l', unit: 'g100', qty: 350, g: 350, kcal: 665, p: 33, f: 16, c: 55, ts: 1 }); return st; };
async function open(url, { w = 390, scheme = 'light', safe = '47px', big = false, reduce = false } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: scheme, reducedMotion: reduce ? 'reduce' : 'no-preference' });
  await c.addInitScript((o) => { try { localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); } catch (e) {} document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.setProperty('--safe-top', o.safe); if (o.big) document.documentElement.classList.add('fs-big'); }); }, { st: seed(), safe, big });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200); return p;
}


const CODE = 'KF-ABCD-EFGH-JKLM-NPQR-STUV-WXYZ-2345';
try {
  for (const [url, T] of [['/kalkifit', { t: "Bulutda ma'lumotingiz bor — tiklaysizmi?", take: 'Tiklash', keep: 'Baribir shu qurilmadagini saqlash' }], ['/ru/kalkifit', { t: 'В облаке есть ваши данные — восстановить?', take: 'Восстановить', keep: 'Всё равно сохранить с этого устройства' }]]) {
    const c = await b.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    await c.addInitScript((o) => { try { if (!sessionStorage.getItem('__t')) { sessionStorage.setItem('__t', '1'); localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_zaxira_kalkifit', JSON.stringify({ on: true, code: o.code, ver: 7, last: Date.now() - 864e5, pending: true, conflict: 0, sig: '' })); } localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); } catch (e) {} }, { st: seed(), code: CODE });
    const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); const puts = [];
    await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
    await p.route('**/api/**', (r) => r.fulfill({ status: 204, body: '' }));
    await p.route('**/api/zaxira**', async (r) => { const q = r.request(); if (q.method() === 'PUT') { const bd = JSON.parse(q.postData()); puts.push(bd); const ok = bd.majbur || puts.length > 1; return r.fulfill({ status: ok ? 200 : 422, contentType: 'application/json', body: JSON.stringify(ok ? { versiya: bd.kutilgan + 1 } : { xato: 'x', himoya: true, versiya: 7 }) }); } return r.fulfill({ status: 404, contentType: 'application/json', body: '{}' }); });
    await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.evaluate(() => KalkiBackup.instances.kalkifit.flush(true)); await p.waitForSelector('#rzSheet:not([hidden]) .bk-sheet', { timeout: 15000 });
    const tx = await p.locator('#rzSheet').innerText(); assert.ok(tx.includes(T.t) && tx.includes(T.take) && tx.includes(T.keep), url + ': himoya oynasi: ' + tx.slice(0, 120));
    assert.equal(puts.length >= 1 && puts.every((x) => !x.majbur), true, 'majbur yuborilmadi'); const n0 = puts.length;
    const cs = await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_zaxira_kalkifit'))); assert.equal(cs.shrink, 7); assert.equal(cs.pending, true);
    await p.evaluate(() => KalkiBackup.instances.kalkifit.flush(true)); await p.waitForTimeout(800); assert.equal(puts.length, n0, 'himoya holatida qayta urinilmaydi (flush to\'xtaydi)');
    await p.click('[data-act=bkforce]'); await p.waitForTimeout(1500); assert.ok(puts.every((x) => !x.majbur), 'v71.1: «Baribir saqlash» ham almashtirmaydi/majburlamaydi — birlashtiradi (majbur yuborilmaydi)'); const cs2 = await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_zaxira_kalkifit'))); assert.equal(cs2.shrink, 0); assert.deepEqual(p.errs, []); await c.close();
  }
  console.log('OK zaxira-himoya: 422 → «tiklaysizmi?» oynasi (uz/ru), qayta urinish yo\'q, «baribir saqlash» — majbur bilan');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
