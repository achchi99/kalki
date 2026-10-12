// node tools/dizayn/shot1.mjs <prefiks> <yo'l,yo'l..> [kenglik=1280]  — to'liq sahifa skrinshoti (holatsiz)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const [PREFIX, SL, W = '1280'] = process.argv.slice(2);
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((o) => srv.listen(0, o)); const port = srv.address().port; const b = await chromium.launch();
for (const slug of SL.split(',')) { const c = await b.newContext({ viewport: { width: +W, height: 900 }, serviceWorkers: 'block' }); const p = await c.newPage();
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|t\.me/, (r) => r.abort());
  await p.goto(`http://localhost:${port}/${slug}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  const f = `docs/dizayn-skrinshot/${PREFIX}-${slug.replace(/\//g, '_')}-${W}.jpg`; await p.screenshot({ path: path.join(ROOT, f), fullPage: true, type: 'jpeg', quality: 65 }); console.log(f); await c.close(); }
await b.close(); srv.close();
