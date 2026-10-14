// Sarlavha/menyu qatori: 768/1024/1280/1440 da uslubsiz (standart) button yo'q; shrift qatori faqat mobil panelda (≤899px, menyu ochiq).
// node tools/dizayn/test-sarlavha.mjs [https://host]   (lokal yoki jonli)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
let BASE = process.argv[2], srv;
if (!BASE) { srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; if (p === '/ru/') p = '/ru/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }); await new Promise((ok) => srv.listen(0, ok)); BASE = 'http://localhost:' + srv.address().port; }
const PAGES = ['', 'kredit-kalkulyator', 'ijara-shartnomasi-namunasi', 'blog', 'ru/kredit-kalkulyator', 'ru/']; const SHOT = process.env.SHOT;
const b = track(await chromium.launch()); let bad = 0;
for (const w of [768, 1024, 1280, 1440]) for (const pg of PAGES) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, serviceWorkers: 'block' }); const p = await c.newPage(); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  await p.goto(BASE + '/' + pg, { waitUntil: 'networkidle' }); await p.waitForTimeout(250);
  const r = await p.evaluate(() => {
    const bar = document.getElementById('sitebar'); const out = { plain: [], fsVisible: false, sw: document.documentElement.scrollWidth <= innerWidth };
    for (const e of bar.querySelectorAll('button')) { const cs = getComputedStyle(e); const rc = e.getBoundingClientRect(); if (!rc.width || cs.display === 'none' || cs.visibility === 'hidden') continue;
      const noBg = cs.backgroundColor === 'rgba(0, 0, 0, 0)' || cs.backgroundColor === 'transparent'; const std = cs.backgroundColor === 'rgb(239, 239, 239)' || cs.backgroundColor === 'buttonface' || (cs.borderTopStyle === 'outset') || (cs.borderTopWidth === '2px' && cs.borderTopStyle === 'outset');
      if (std || (!noBg && cs.borderTopStyle === 'outset')) out.plain.push((e.id || e.className || e.textContent).toString().slice(0, 20) + ' bg=' + cs.backgroundColor); }
    const fs = bar.querySelector('.tm2-fs'); out.fsVisible = !!fs && getComputedStyle(fs).display !== 'none' && fs.getBoundingClientRect().width > 0; return out; });
  const pr = []; if (r.plain.length) pr.push('uslubsiz button: ' + r.plain.join(', ')); if (r.fsVisible) pr.push('shrift qatori kompyuterda ko\'rinyapti'); if (!r.sw) pr.push('gorizontal siljish');
  if (pr.length) { bad++; console.log('XATO', w, '/' + pg, pr.join('; ')); }
  if (SHOT && pg === '' && (w === 1280 || w === 768)) await p.screenshot({ path: SHOT + '/sarlavha_' + w + '.png', clip: { x: 0, y: 0, width: w, height: 90 } });
  await c.close();
}
// mobil: menyu ochiq — shrift qatori ko'rinadi va uslubli; 320/390
for (const w of [320, 390, 600, 899]) for (const pg of ['', 'ru/kredit-kalkulyator']) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: w < 500, hasTouch: w < 500, serviceWorkers: 'block' }); const p = await c.newPage(); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  await p.goto(BASE + '/' + pg, { waitUntil: 'networkidle' }); await p.click('.sb2-burger'); await p.waitForTimeout(200);
  const r = await p.evaluate(() => { const row = document.querySelector('.tm2-fs'); const bt = [...row.querySelectorAll('.fs-seg button')]; const cs = bt.map((e) => getComputedStyle(e));
    return { vis: getComputedStyle(row).display === 'flex' && row.getBoundingClientRect().width > 0, std: cs.some((x) => x.borderTopStyle === 'outset' || x.backgroundColor === 'rgb(239, 239, 239)'), n: bt.length, fits: row.getBoundingClientRect().right <= innerWidth + 1, pressed: bt.filter((e) => e.getAttribute('aria-pressed') === 'true').length }; });
  if (!r.vis || r.std || r.n !== 2 || !r.fits || r.pressed !== 1) { bad++; console.log('XATO mobil', w, '/' + pg, JSON.stringify(r)); }
  await c.close();
}
console.log(bad ? bad + ' ta muammo' : 'toza'); await b.close(); if (srv) srv.close(); process.exit(bad ? 1 : 0);
