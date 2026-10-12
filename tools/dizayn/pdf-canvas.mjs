// PDF "yuklash natijasi" vizual solishtiruvi: html2canvas chizgan canvas o'lchami va piksel xeshi.
// node tools/dizayn/pdf-canvas.mjs <ildiz-papka> <slug,...>
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
import { chromium } from 'playwright';
const ROOT = path.resolve(process.argv[2]); const SLUGS = (process.argv[3] || 'ariza-namunasi,ishonchnoma-namunasi').split(',');
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port;
const b = await chromium.launch();
for (const slug of SLUGS) {
  const p = await (await b.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block', acceptDownloads: true })).newPage();
  await p.route(/googlesyndication|googletagmanager|fonts\.g/, (r) => r.abort());
  await p.goto(BASE + '/' + slug, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  const els = p.locator('#formHost [data-f]'); const n = await els.count();
  for (let i = 0; i < n; i++) { const e = els.nth(i); if (!(await e.isVisible())) continue; const id = await e.getAttribute('data-f'); const tag = await e.evaluate((x) => x.tagName), type = (await e.getAttribute('type')) || '';
    try { if (tag === 'SELECT') { const o = await e.locator('option').count(); await e.selectOption({ index: Math.min(1, o - 1) }); } else if (type === 'date') await e.fill('2026-03-15'); else await e.fill('Namuna ' + id); } catch (x) {} }
  await p.addScriptTag({ url: '/html2canvas.min.js' });
  await p.evaluate(() => { const o = window.html2canvas; window.html2canvas = async (el, opt) => { const c = await o(el, opt); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0; for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) >>> 0; window.__cv = { w: c.width, h: c.height, hash: h, el: (el.id || el.className || el.tagName) }; return c; }; });
  const w = p.waitForEvent('download', { timeout: 25000 }).catch(() => null); await p.click('.receipt-actions .pdfbtn'); await w;
  console.log(slug, JSON.stringify(await p.evaluate(() => window.__cv)));
  await p.context().close();
}
await b.close(); srv.close();
