// Dizayn skrinshotlari: node tools/dizayn/shot.mjs <prefiks> [--full]
// Lokal statik server (Cloudflare Pages yo'l qoidalari: /x -> x.html) + Playwright.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const PREFIX = process.argv[2] || 'x';
const PAGES = [['index', '/'], ['shablonlar', '/shablonlar'], ['gisht', '/gisht-kalkulyator']];
const VIEWS = [['390', 390, 844], ['1280', 1280, 900]];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f));
});
await new Promise((ok) => srv.listen(8792, ok));
const b = track(await chromium.launch());
for (const [vn, w, h] of VIEWS) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 500, hasTouch: w < 500 });
  const page = await ctx.newPage();
  await page.route(/googlesyndication|googletagmanager|google-analytics/, (r) => r.abort());
  for (const [pn, url] of PAGES) {
    await page.goto('http://localhost:8792' + url, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(700);
    const out = path.join(ROOT, 'docs', 'dizayn-skrinshot', `${PREFIX}-${pn}-${vn}.jpg`);
    await page.screenshot({ path: out, type: 'jpeg', quality: 68, fullPage: true });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: out.replace('.jpg', '-ekran.jpg'), type: 'jpeg', quality: 80 });
    const m = await page.evaluate(() => ({ h: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, body: getComputedStyle(document.body).fontSize }));
    console.log(PREFIX, pn, vn, JSON.stringify(m), Math.round(fs.statSync(out).size / 1024) + 'KB');
  }
  await ctx.close();
}
await b.close(); srv.close();
