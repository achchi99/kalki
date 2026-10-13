// Ichki havolalarning BRAUZERDA (JS chizgandan keyin) yaxlitligi: har bir sahifani ochadi, <a href> larni yig'adi,
// har birini Cloudflare Pages tartibi (fayl yoki _redirects) bo'yicha tekshiradi.
//   node tools/dizayn/test-links-runtime.mjs [boshlash] [soni]      # sahifalar ro'yxatidan bo'lak (5 daqiqalik timeout uchun)
// Statik audit (tools/verify-404.js, band d) JS keyin qayta quradigan havolalarni ko'rmaydi: masalan
// shablonlar.html href="'+x.uz+'" (nisbiy) /ru/ ostida /ru/shablon-*.xlsx ga yechilib 404 berardi.
// Lokal server: Pages tartibini taqlid qiladi. Bitta Chromium; track() yopadi (CLAUDE.md).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url);
const { resolves, redirectTarget } = require('../verify-404.js');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

const srv = http.createServer((q, r) => {
  const p = decodeURIComponent(q.url.split('?')[0]);
  const red = redirectTarget(p);
  if (red && !resolves(p)) { r.writeHead(301, { Location: red }); return r.end(); }
  const base = p.replace(/\/$/, '');
  const f = resolves(p) ? [path.join(ROOT, p), path.join(ROOT, base + '.html'), path.join(ROOT, base + '/index.html'), p === '/' ? path.join(ROOT, 'index.html') : ''].find((c) => c && fs.existsSync(c) && fs.statSync(c).isFile()) : null;
  if (!f) { r.writeHead(404, { 'Content-Type': MIME['.html'] }); return r.end(fs.readFileSync(path.join(ROOT, '404.html'))); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f));
});
await new Promise((ok) => srv.listen(0, ok));
const BASE = 'http://localhost:' + srv.address().port;

const pages = [];
for (const d of ['', 'ru', 'cyr']) {
  const dir = path.join(ROOT, d);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.html') && !/^(yandex|offline|404)/.test(x)).sort()) pages.push('/' + (d ? d + '/' : '') + f.replace(/\.html$/, ''));
}
const from = Number(process.argv[2] || 0), count = Number(process.argv[3] || pages.length);
const slice = pages.slice(from, from + count);

const b = track(await chromium.launch());
const ctx = await b.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block' });
await ctx.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|t\.me|lex\.uz/, (r) => r.abort());
const bad = {}; let total = 0, viaRedirect = {};
for (const u of slice) {
  const p = await ctx.newPage();
  try {
    await p.goto(BASE + u, { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(1500);
    const hrefs = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.href));
    for (const h of hrefs) {
      let url; try { url = new URL(h); } catch (e) { continue; }
      if (url.origin !== BASE || !/^https?:$/.test(url.protocol)) continue;
      total++;
      const pn = url.pathname;
      if (resolves(pn)) continue;
      const red = redirectTarget(pn);
      if (red && resolves(red.split('?')[0])) { (viaRedirect[pn] = viaRedirect[pn] || new Set()).add(u); continue; }
      (bad[pn] = bad[pn] || new Set()).add(p.url().replace(BASE, '').split('?')[0] || u);
    }
  } catch (e) { (bad['(sahifa ochilmadi) ' + e.message.slice(0, 50)] = new Set([u])); }
  await p.close();
}
console.log('sahifa:', slice.length, `(${from}..${from + slice.length - 1} / ${pages.length})`, '| havola:', total, '| buzuq noyob:', Object.keys(bad).length, '| redirect orqali:', Object.keys(viaRedirect).length);
for (const [k, s] of Object.entries(bad)) console.log('  BUZUQ', k, '<-', [...s].slice(0, 3).join(', '), s.size > 3 ? '(+' + (s.size - 3) + ')' : '');
for (const k of Object.keys(viaRedirect)) console.log('  redirect', k, '->', redirectTarget(k));
await b.close();
process.exit(Object.keys(bad).length ? 1 : 0);
