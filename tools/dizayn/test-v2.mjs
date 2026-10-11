// Yangi dizayn brauzer sinovi (lokal statik server): node tools/dizayn/test-v2.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; if (p === '/ru/') p = '/ru/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((ok) => srv.listen(8794, ok));
const B = 'http://localhost:8794';
const b = await chromium.launch();
const errors = [];
const log = (s) => console.log('OK   ' + s);
async function pg(w, h) { const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500, serviceWorkers: 'block' }); const p = await c.newPage();
  p.on('pageerror', (e) => errors.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort()); return p; }
const PAGES = ['/', '/shablonlar', '/gisht-kalkulyator'];
async function go(p, u) { for (let i = 0; i < 3; i++) { try { await p.goto(B + u, { waitUntil: 'networkidle' }); return; } catch (e) { await p.waitForTimeout(400); } } await p.goto(B + u, { waitUntil: 'networkidle' }); }

// 1. toshish yo'q, sarlavha bitta qator, yopishqoq
for (const w of [320, 390, 768, 1280]) {
  const p = await pg(w, 800);
  for (const u of PAGES) {
    await go(p, u);
    const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, hdr: Math.round(document.getElementById('sitebar').getBoundingClientRect().height), pos: getComputedStyle(document.getElementById('sitebar')).position }));
    assert.ok(m.sw <= m.iw, u + ' ' + w + ' toshdi ' + JSON.stringify(m));
    assert.ok(m.hdr <= 64 && m.pos === 'sticky', 'sarlavha ' + JSON.stringify(m));
  }
}
log('320/390/768/1280px: gorizontal toshish yo\'q; sarlavha bitta qator (<=64px), sticky');

// 2. yopishqoqlik
{ const p = await pg(390, 800); await go(p, '/'); await p.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' })); await p.waitForTimeout(500);
  const top = await p.evaluate(() => Math.round(document.getElementById('sitebar').getBoundingClientRect().top)); assert.equal(top, 0); log('sarlavha scroll qilinganda tepada qoladi'); }

// 3. mobil menyu
{ const p = await pg(390, 800); await go(p, '/');
  assert.equal(await p.isVisible('#topmenu'), false);
  await p.click('.sb2-burger'); await p.waitForSelector('#topmenu', { state: 'visible' });
  assert.equal(await p.getAttribute('.sb2-burger', 'aria-expanded'), 'true');
  const fs1 = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#topmenu .tm2>li>a')).fontSize)); assert.ok(fs1 >= 17, 'menyu shrifti ' + fs1);
  const h1 = await p.evaluate(() => Math.round(document.querySelector('#topmenu .tm2>li>a').getBoundingClientRect().height)); assert.ok(h1 >= 44, 'tegish maydoni ' + h1);
  await p.screenshot({ path: path.join(ROOT, 'docs/dizayn-skrinshot/yangi-menyu-390-yopiq.jpg'), type: 'jpeg', quality: 70 });
  await p.click('.tm2>li.has-sub:first-child .tm2-chev'); assert.equal(await p.isVisible('.tm2-sub >> nth=0'), true);
  await p.screenshot({ path: path.join(ROOT, 'docs/dizayn-skrinshot/yangi-menyu-390-ochiq.jpg'), type: 'jpeg', quality: 70 });
  await p.keyboard.press('Escape'); assert.equal(await p.isVisible('#topmenu'), false);
  log('mobil menyu: burger ochadi, akkordeon, Escape yopadi; band ' + fs1 + 'px / ' + h1 + 'px'); }

// 4. desktop ochilma
{ const p = await pg(1280, 800); await go(p, '/');
  await p.hover('.tm2>li.has-sub:first-child'); assert.equal(await p.isVisible('.tm2-sub >> nth=0'), true);
  const nf = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.tm2 a')).fontSize)); assert.ok(nf >= 15);
  await p.screenshot({ path: path.join(ROOT, 'docs/dizayn-skrinshot/yangi-menyu-1280-ochilma.jpg'), clip: { x: 0, y: 0, width: 1280, height: 360 }, type: 'jpeg', quality: 70 });
  log('desktop: ochilma hover bilan ochiladi, menyu ' + nf + 'px'); }

// 5. til almashtirish (RU) — menyu va kontent
for (const u of PAGES) { const p = await pg(1280, 800); await go(p, u); await p.click('#langRu'); await p.waitForURL(/\/ru(\/|$)/, { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(900);
  const t = await p.evaluate(() => [...document.querySelectorAll('#topmenu .tm2 > li > a')].map((a) => a.textContent.trim()));
  assert.deepEqual(t, ['Калькуляторы', 'Документы', 'Статьи'], u + ' RU menyu: ' + t.join('|'));
  assert.ok(await p.evaluate(() => document.documentElement.lang === 'ru')); }
log('RU: menyu (Калькуляторы | Документы | Статьи) uchala sahifada tarjima qilinadi');

// 6. bosh sahifa: render, qidiruv, bo'limlar
{ const p = await pg(1280, 900); await go(p, '/');
  assert.equal(await p.locator('#catGrid .k-card').count(), 5); assert.equal(await p.locator('#popGrid .k-card').count(), 8); assert.equal(await p.locator('#catalog .k-card').count(), 42);
  assert.equal(await p.locator('h1').count(), 1);
  assert.equal(await p.evaluate(() => document.querySelectorAll('.search-shell, #heroChips a').length), 6);
  assert.equal(await p.evaluate(() => /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(document.body.innerText)), false, 'sahifada emoji bor');
  await p.fill('#search', 'kredit'); await p.waitForTimeout(150);
  assert.equal(await p.isVisible('#popSec, #mashhur'), false); const n = await p.locator('#catalog .k-card').count(); assert.ok(n >= 2 && n < 10);
  await p.fill('#search', 'zzzz'); assert.equal(await p.isVisible('#noResults'), true);
  log('bosh sahifa: 5 kategoriya, 8 mashhur, 42 katalog kartasi, 1 ta H1, emoji yo\'q, qidiruv filtri (' + n + ' natija) va "topilmadi" holati'); }

// 7. kalkulyator mantiqi o'zgarmagan + 2 ustunli maket
{ const p = await pg(1280, 900); await go(p, '/gisht-kalkulyator');
  const before = await p.textContent('.big-figure .num');
  const lay = await p.evaluate(() => { const f = document.querySelector('.form-card').getBoundingClientRect(), r = document.querySelector('.receipt').getBoundingClientRect(); return { sameRow: Math.abs(f.top - r.top) < 40, receiptRight: r.left > f.right - 10, pos: getComputedStyle(document.querySelector('.receipt')).position }; });
  assert.deepEqual(lay, { sameRow: true, receiptRight: true, pos: 'sticky' });
  const ins = p.locator('input[type=text]:visible'); await ins.nth(0).fill('20'); await p.click('.calc-btn'); await p.waitForTimeout(300);
  const after = await p.textContent('.big-figure .num'); assert.notEqual(after, before);
  assert.match(after, /dona|шт/);
  log('gisht: natija forma yonida yopishqoq; uzunlik 10 → 20 m: "' + before.trim() + '" → "' + after.trim() + '"'); }
{ const p = await pg(390, 800); await go(p, '/gisht-kalkulyator');
  const o = await p.evaluate(() => { const f = document.querySelector('.form-card').getBoundingClientRect(), r = document.querySelector('.receipt').getBoundingClientRect(); return { stacked: r.top > f.bottom - 5 }; }); assert.equal(o.stacked, true); log('mobil: forma tepada, natija ostida (bir ustun)'); }

// 8. shablonlar filtri
{ const p = await pg(1280, 900); await go(p, '/shablonlar');
  const all = await p.locator('#readyList .tpl:visible').count(); await p.click('#tabs [data-f="doc"]'); const doc = await p.locator('#readyList .tpl:visible').count();
  await p.click('#tabs [data-f="xls"]'); const xls = await p.locator('#readyList .tpl:visible').count();
  assert.deepEqual([all, doc, xls], [6, 1, 5]); log('shablonlar filtri: Hammasi ' + all + ' / Word ' + doc + ' / Excel ' + xls); }

// 9. o'lchovlar "keyin"
console.log('--- o\'lchovlar (keyin) ---');
for (const [w, h] of [[390, 844], [1280, 900]]) { const p = await pg(w, h);
  for (const u of PAGES) { await go(p, u);
    const m = await p.evaluate(() => { const hist = {}; let total = 0; const wk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (wk.nextNode()) { const t = wk.currentNode, s = t.textContent.trim(); if (!s) continue; const el = t.parentElement; if (!el || el.closest('script,style,noscript')) continue; const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || (!el.offsetParent && cs.position !== 'fixed')) continue; const fs = Math.round(parseFloat(cs.fontSize) * 2) / 2; hist[fs] = (hist[fs] || 0) + s.length; total += s.length; }
      const lt = (n) => Math.round(100 * Object.entries(hist).filter(([k]) => +k < n).reduce((a, [, v]) => a + v, 0) / total);
      return { mod: Object.entries(hist).sort((a, b) => b[1] - a[1])[0][0], lt14: lt(14), lt15: lt(15), hdr: Math.round(document.getElementById('sitebar').getBoundingClientRect().height), docH: document.documentElement.scrollHeight }; });
    console.log(w + 'px ' + u, JSON.stringify(m)); } }
const real = errors.filter((e) => !/adsbygoogle|googletag/.test(e)); assert.deepEqual(real, [], real.join(' | ')); log('JS xatolari yo\'q');
await b.close(); srv.close();
