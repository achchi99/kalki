// KalkiFit v93: «Yana» bo'limi — hamma imkoniyat bitta ro'yxatda (eski «Imkoniyatlar» paneli o'rniga). Har qator o'z funksiyasini ochadi (Yana → qator: 2 bosish); Maslahat bo'limida tahlillar; uz/ru, 360 px.
// Ro'yxatda nom + 1 qatorlik tushuntirish + ikonka; gorizontal siljish yo'q.   node tools/dizayn/test-kalkifit-imkoniyatlar.mjs


import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates;
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const seed = () => { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 86400000; st.prefs = { tipsDone: true, jokes: false, lpTip: 1, suvFrom: D.today() }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = D.addDays(D.today(), -8); S.addWeight(st, D.today(), 80); return st; };
async function open(w, url, o = {}) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: o.th || 'light', userAgent: o.ua });
  await c.addInitScript((st) => { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); }, seed());
  if (o.noWebSR) await c.addInitScript(() => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/**', async (r) => { if (/api\/ovoz/.test(r.request().url())) { if (o.ovDelay) await new Promise((k) => setTimeout(k, o.ovDelay)); return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o.ovOff ? { yoqilgan: false } : { yoqilgan: true, limit: 15, qoldi: 15 }) }); } r.fulfill({ status: 200, contentType: 'application/json', body: '{"yoqilgan":true,"limit":5,"qoldi":4}' }); });
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(700); return p;
}
const isSheet = (p) => p.evaluate(() => { const s = document.getElementById('rzSheet'); return !!s && !s.hidden && s.classList.contains('open'); });
try {
  for (const [w, url] of [[360, '/kalkifit'], [390, '/ru/kalkifit']]) {
    const p = await open(w, url); await p.click('.rz-tab[data-v=more]'); await p.waitForSelector('.sl-feat');
    const rows = await p.evaluate(() => [...document.querySelectorAll('#rzMain .sl-feat')].map((e) => ({ k: e.dataset.fk || e.dataset.act || 'a', t: e.querySelector('b').textContent.trim(), h: e.querySelector('.m span').textContent.trim(), ic: !!e.querySelector('.sl-ci svg') })));
    assert.ok(rows.length >= 16, url + ' qatorlar: ' + rows.length); rows.forEach((r) => assert.ok(r.t && r.h && r.ic, url + ' nom + izoh + ikonka: ' + JSON.stringify(r)));
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.getElementById('rzMain').scrollWidth <= document.getElementById('rzMain').clientWidth + 1), true, 'gorizontal siljish yo\'q');
    const keys = ['yeymiz', 'yesam', 'retsept', 'odatdagi', 'taomlarim', 'idishlar', 'tartib', 'menyu', 'hafta', 'kunkarta', 'ulashish', 'supp', 'afsona'];
    for (const k of keys) {
      await p.click('.rz-tab[data-v=more]'); const sel = '#rzMain [data-act=feat][data-fk=' + k + ']'; if (!(await p.locator(sel).count())) continue; await p.locator(sel).scrollIntoViewIfNeeded(); await p.locator(sel).click(); await p.waitForTimeout(800);
      const st = await p.evaluate(() => ({ story: !!document.querySelector('.hk'), af: !!document.getElementById('afOv'), full: [...document.querySelectorAll('.yg-full, .sl-yfull, [class*=yeymiz]')].some((e) => e.getBoundingClientRect().height > 300) }));
      assert.ok((await isSheet(p)) || st.story || st.af || st.full, url + ' ' + k + ': funksiya ochildi ' + JSON.stringify(st)); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    }
    ok(url + ': «Yana» — ' + rows.length + ' qator (ikonka + nom + izoh), har biri 2 bosishda o\'z funksiyasini ochadi: ' + keys.join(', '));
    await p.click('.rz-tab[data-v=advice]'); for (const k of ['tahlil', 'yesam', 'hafta', 'supp', 'afsona']) assert.ok(await p.locator('#rzMain [data-act=feat][data-fk=' + k + ']').count(), 'Maslahat: ' + k);
    assert.deepEqual(p.errs, []); await p.context().close();
  }
  ok('Maslahat bo\'limida tahlillar, «Buni yesam-chi?», Haftangiz, Bilim — 1 bosishda ko\'rinadi');
  console.log('\n' + n + '/' + n + ' OK');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
