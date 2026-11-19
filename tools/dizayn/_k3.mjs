import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
for (const [u, fill] of [['/tvi-kalkulyator', { age: '30', height: '175', weight: '80' }], ['/ru/tvi-kalkulyator', { age: '15', height: '165', weight: '50' }], ['/ideal-vazn-kalkulyator', { height: '170', weight: '80' }], ['/suv-meyori-kalkulyator', { weight: '75' }]]) {
  const c = await b.newContext({ viewport: { width: 360, height: 800 } }); const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.goto(BASE + u, { waitUntil: 'load' }); await p.waitForTimeout(500); const vis0 = await p.locator('#kfBlok').isVisible();
  for (const [k, v] of Object.entries(fill)) await p.fill('#' + k, v); await p.click('#calcBtn'); await p.waitForTimeout(400);
  console.log(u, '| oldin blok:', vis0, '|', (await p.locator('#receipt').innerText()).replace(/\s+/g, ' ').slice(0, 220), '| blok:', await p.locator('#kfBlok').isVisible() ? (await p.locator('#kfT').innerText()) : '-', '| h1:', await p.locator('h1').innerText(), '| errs:', errs.join(';').slice(0, 200));
  await c.close();
}
await b.close(); srv.close();
