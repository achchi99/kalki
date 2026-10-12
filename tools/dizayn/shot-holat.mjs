// node tools/dizayn/shot-holat.mjs <prefiks> slug,slug  — har bir sahifa: 390/1280 × boshlang'ich/hisoblangan (to'liq sahifa)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const [PREFIX, SL] = process.argv.slice(2); const SLUGS = SL.split(',');
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((o) => srv.listen(8802, o)); const b = await chromium.launch();
for (const slug of SLUGS) for (const w of [390, 1280]) for (const st of ['boshlangich', 'hisoblangan']) {
  const c = await b.newContext({ viewport: { width: w, height: 900 }, serviceWorkers: 'block' }); const p = await c.newPage();
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|t\.me/, (r) => r.abort());
  await p.goto('http://localhost:8802/' + slug, { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  if (st === 'hisoblangan') { const btn = p.locator('main .calc-btn:visible').first(); if (await btn.count()) await btn.click().catch(() => {}); await p.waitForTimeout(600); }
  const f = `docs/dizayn-skrinshot/${PREFIX}-${slug.replace('-kalkulyator', '')}-${w}-${st}.jpg`;
  await p.screenshot({ path: path.join(ROOT, f), fullPage: true, type: 'jpeg', quality: 70 }); console.log(f); await c.close();
}
await b.close(); srv.close();
