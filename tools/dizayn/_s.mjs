import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'application/json' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const B = 'http://localhost:' + srv.address().port;
const b = await chromium.launch(); const O = process.env.OUT;
try { for (const [name, u, big, w] of JSON.parse(process.env.SHOTS)) {
  const c = await b.newContext({ viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', deviceScaleFactor: 1 }); if (big) await c.addInitScript(() => localStorage.setItem('kalki_fs', 'big'));
  const p = await c.newPage(); await p.goto(B + u, { waitUntil: 'networkidle' }); await p.waitForTimeout(400); if (process.env.SEL) { await p.locator(process.env.SEL).first().scrollIntoViewIfNeeded(); await p.waitForTimeout(200); } await p.screenshot({ path: O + '/' + name + '.png' }); await c.close(); } } finally { await b.close(); srv.close(); }
