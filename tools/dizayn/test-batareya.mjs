// KalkiFit v57 (brauzer): batareya — idish to'lqini bo'sh turganda CPU yemasin (docs/testlar.md: SMIL to'lqin 0,36 yadro edi).
// SMIL yo'q; to'lqin animatsiyalari cheklangan va ~10 s da tugaydi; 11 s dan keyin Bugun ekranida birorta animatsiya yurmaydi; ko'rinmasa pauza;
// reduced-motion — animatsiyasiz; oddiy qayta chizishda o'z vaqt chizig'idan davom etadi, raqam o'zgarsa yangidan jonlanadi.
//   node tools/dizayn/test-batareya.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(ROOT + '/assets/kalkifit-core.js'), D = S.dates, T0 = D.today(), Y0 = D.addDays(T0, -1);
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
function seed(kcal) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 864e5; st.trackStart = D.addDays(T0, -9); st.prefs = { tipsDone: true, introDone: true, lpTip: 1, yemayK: 1, jokes: false, ttAsked: 1, suvFrom: T0, hwSeen: T0, h_hafta: Date.now(), h_backup: Date.now(), crd: { ekran: { ok: 1 }, ilova: { ok: 1 }, akkaunt: { ok: 1 } }, fw: { x: [], d: T0 } };
  st.afsona = { a: {}, ok: {}, dq: { d: T0, id: 'a01', x: 1 } }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 2, goal: 'lose' }; S.addWeight(st, T0, 80); S.addFood(st, T0, { meal: 'l', fid: 'osh', kcal, p: 19, f: 25, c: 80, g: 350, ts: 1 }); return st; }
async function open(o = {}) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', reducedMotion: o.reduced ? 'reduce' : 'no-preference' });
  await c.addInitScript((a) => { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', a); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); } }, JSON.stringify(seed(o.kcal || 665)));
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForSelector('#kcalBtn .kv-w', { state: 'attached' }); return p;
}
const waves = (p) => p.evaluate(() => [...document.querySelectorAll('#kcalBtn .kv-w')].map((e) => e.getAnimations().map((a) => { const t = a.effect.getComputedTiming(); return { n: a.animationName, s: a.playState, end: t.endTime, it: t.iterations, cur: a.currentTime }; })));
try {
  /* 1. SMIL yo'q; cheklangan; ~10 s da tugaydi */
  let p = await open(); assert.equal(await p.locator('#kcalBtn animate, #kcalBtn animateTransform, #kcalBtn animateMotion, #kcalBtn set').count(), 0, 'SMIL yo\'q (CPU)');
  let w = await waves(p); assert.equal(w.length, 2); for (const l of w) { assert.ok(l.length >= 2, JSON.stringify(w)); assert.ok(l.every((a) => Number.isFinite(a.end) && a.it !== Infinity), 'cheksiz animatsiya yo\'q: ' + JSON.stringify(l)); assert.ok(Math.max(...l.map((a) => a.end)) <= 10000, 'eng uzuni ≤ 10 s: ' + JSON.stringify(l)); }
  assert.ok(w.flat().some((a) => a.s === 'running'), 'boshida to\'lqin harakatda');
  ok('Idish: SMIL yo\'q, to\'lqin animatsiyalari cheklangan (' + w.map((l) => l.map((a) => a.n + ' ' + (a.end / 1000).toFixed(1) + 's').join(' + ')).join(' | ') + ')');
  /* 2. ko'rinmasa — pauza; qaytganda davom */
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }); await p.waitForTimeout(150);
  w = await waves(p); assert.ok(w.flat().filter((a) => a.s !== 'finished').every((a) => a.s === 'paused'), 'hidden — pauza: ' + JSON.stringify(w)); const c1 = w[0].map((a) => a.cur); await p.waitForTimeout(600); assert.deepEqual((await waves(p))[0].map((a) => a.cur), c1, 'pauzada vaqt yurmaydi');
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }); await p.waitForTimeout(150); assert.ok((await waves(p)).flat().some((a) => a.s === 'running'), 'qaytganda davom etadi');
  ok('Sahifa ko\'rinmasa (visibilitychange → hidden) to\'lqin to\'liq pauza, vaqti yurmaydi; ko\'rinsa davom etadi');
  /* 3. oddiy qayta chizish — davom (qaytadan boshlanmaydi); raqam o'zgarsa — yangidan jonlanadi */
  await p.waitForTimeout(2500); const before = (await waves(p))[0].find((a) => a.n === 'kvSw1z' || a.n === 'kvSw1'); await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(300); await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(200);
  const after = await p.evaluate(() => { const e = document.querySelector('#kcalBtn .kv-w'); return parseFloat(getComputedStyle(e).animationDelay.split(', ')[1]); }); assert.ok(after <= -2.5, 'qayta chizishda vaqt chizig\'i davom etadi (delay ' + after + ' s, oldin ' + JSON.stringify(before) + ')');
  await p.click('[data-act=wadd]'); await p.waitForTimeout(150); const same = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#kcalBtn .kv-w')).animationDelay.split(', ')[1])); assert.ok(same <= -2.5, 'suv qo\'shish (raqam o\'zgarmaydi) — to\'lqin qayta boshlanmaydi: ' + same);
  await p.evaluate(() => { const K = window.__kalkifit, t = K.S.dates.today(); K.S.addFood(K.state, t, { meal: 's', fid: 'olma', kcal: 80, p: 0, f: 0, c: 20, g: 150, ts: 2 }); K.render(); }); await p.waitForTimeout(150);
  const fresh = await p.evaluate(() => { const c = getComputedStyle(document.querySelector('#kcalBtn .kv-w')); return [c.animationName, parseFloat(c.animationDelay.split(', ')[1])]; }); assert.ok(fresh[0].startsWith('kvRise, kvSw1') && fresh[1] > -0.5, 'raqam o\'zgardi — to\'lqin yangidan jonlanadi: ' + fresh);
  ok('Oddiy qayta chizish (tab, suv) — to\'lqin o\'z vaqt chizig\'idan davom etadi; ovqat qo\'shilib raqam o\'zgarsa — yangidan jonlanadi');
  /* 4. 11 s dan keyin Bugun ekranida birorta animatsiya yurmaydi (bo'sh holat — CPU ~0) */
  await p.waitForTimeout(11000); const run = await p.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').map((a) => (a.animationName || a.constructor.name) + ' @' + (a.effect && a.effect.target ? (a.effect.target.id || a.effect.target.className.baseVal || a.effect.target.className) : '')));
  assert.deepEqual(run, [], 'bo\'sh Bugun — yurayotgan animatsiya yo\'q'); assert.deepEqual(p.errs, []); await p.context().close();
  ok('11 s dan keyin Bugun ekranida birorta animatsiya yurmaydi (bo\'sh holatda CPU ~0)');
  /* 5. reduced-motion — animatsiyasiz, suyuqlik darhol o'z darajasida */
  p = await open({ reduced: true }); w = await waves(p); assert.ok(w.every((l) => l.length === 0), 'reduced-motion: animatsiya yo\'q: ' + JSON.stringify(w)); assert.ok((await p.evaluate(() => [...document.querySelectorAll('#kcalBtn .kv-w')].every((e) => /^0px \d/.test(getComputedStyle(e).translate)))), 'suyuqlik o\'z darajasida'); await p.context().close();
  ok('prefers-reduced-motion — to\'lqin harakatsiz, suyuqlik darhol o\'z darajasida');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
