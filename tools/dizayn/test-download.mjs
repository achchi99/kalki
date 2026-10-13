// Yuklab olish havolalari (Chromium): sahifani JS bilan ochadi, SAHIFA CHIZGAN <a download>/fayl havolalarini
// haqiqatan BOSADI va olingan fayl repodagi fayl bilan bir xil ekanini tekshiradi.
//   node tools/dizayn/test-download.mjs https://<preview>      # jonli (tavsiya etiladi: Pages haqiqiy javoblari)
//   node tools/dizayn/test-download.mjs                        # lokal (Pages tartibini taqlid qiladi, _redirects ham)
// Nega kerak: statik HTML'dagi havola to'g'ri bo'lsa ham, sahifa JS'i uni brauzerda QAYTA quradi
// (shablonlar.html: href="'+x.uz+'" — nisbiy, /ru/ ostida /ru/shablon-*.xlsx ga yechilardi).
// Bitta Chromium; tugagach yoki xatoda track() yopadi (CLAUDE.md qoidasi).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url);
const { resolves, redirectTarget } = require('../verify-404.js');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };

let BASE = process.argv[2];
if (!BASE) {
  const srv = http.createServer((q, r) => {
    const p = decodeURIComponent(q.url.split('?')[0]);
    const red = redirectTarget(p);
    if (red) { r.writeHead(301, { Location: red }); return r.end(); }
    const base = p.replace(/\/$/, '');
    const f = resolves(p) ? [path.join(ROOT, p), path.join(ROOT, base + '.html'), path.join(ROOT, base + '/index.html'), p === '/' ? path.join(ROOT, 'index.html') : ''].find((c) => c && fs.existsSync(c) && fs.statSync(c).isFile()) : null;
    if (!f) { r.writeHead(404, { 'Content-Type': MIME['.html'] }); return r.end(fs.readFileSync(path.join(ROOT, '404.html'))); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f));
  });
  await new Promise((ok) => srv.listen(0, ok));
  BASE = 'http://localhost:' + srv.address().port;
}
BASE = BASE.replace(/\/$/, '');

// yuklab olish havolasi bor sahifalar (UZ + RU)
const PAGES = ['/shablonlar', '/ru/shablonlar', '/ijara-shartnomasi-namunasi', '/ru/ijara-shartnomasi-namunasi', '/mehnat-shartnomasi-namunasi', '/ru/mehnat-shartnomasi-namunasi',
  '/qqs-kalkulyator', '/ru/qqs-kalkulyator', '/oila-byudjet-kalkulyator', '/ru/oila-byudjet-kalkulyator', '/tushuntirish-xati-namunasi', '/ru/tushuntirish-xati-namunasi'];
const FILE = /\.(xlsx|docx|pdf|zip|csv)(?=$|[?#])/i;

let bad = 0, total = 0;
const b = track(await chromium.launch());
const ctx = await b.newContext({ viewport: { width: 390, height: 900 }, acceptDownloads: true, serviceWorkers: process.env.SW === 'allow' ? 'allow' : 'block' });
await ctx.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
const rows = [];
for (const url of PAGES) {
  const p = await ctx.newPage();
  await p.goto(BASE + url, { waitUntil: 'load' });
  await p.waitForTimeout(1800);                                   // sahifaning til/chizish skriptlari tugasin
  const links = await p.evaluate(() => [...document.querySelectorAll('a[href]')]
    .filter((a) => a.hasAttribute('download') || /\.(xlsx|docx|pdf|zip|csv)(?=$|[?#])/i.test(a.getAttribute('href')))
    .map((a) => ({ href: a.href, raw: a.getAttribute('href'), label: (a.textContent || '').trim().slice(0, 24) })));
  const seen = new Set();
  for (const l of links) {
    if (seen.has(l.href)) continue; seen.add(l.href);
    total++;
    const name = decodeURIComponent(new URL(l.href).pathname.split('/').pop());
    let res = '';
    const q = await ctx.newPage();                                 // har havola uchun YANGI sahifa: Chromium bir sahifadan ketma-ket
    try {                                                          // ko'p yuklashni to'xtatadi ("multiple downloads") — soxta xato bermasin
      await q.goto(BASE + url, { waitUntil: 'load' }); await q.waitForTimeout(1500);
      const dl = q.waitForEvent('download', { timeout: 8000 });
      await q.evaluate((h) => { const a = [...document.querySelectorAll('a[href]')].find((x) => x.href === h); a.click(); }, l.href);
      const d = await dl;
      const tmp = await d.path();
      const got = tmp ? fs.readFileSync(tmp) : Buffer.alloc(0);
      const file = path.join(ROOT, name);
      const want = fs.existsSync(file) ? fs.readFileSync(file) : null;
      const magic = got.slice(0, 4).toString('hex');
      const ok = got.length > 200 && magic === '504b0304' && (!want || got.equals(want));
      res = (ok ? 'OK' : 'FAIL') + ' ' + d.suggestedFilename() + ' ' + got.length + 'b' + (ok ? '' : ' magic=' + magic + (want && !got.equals(want) ? ' (repodagi fayldan farq)' : ''));
      if (!ok) bad++;
    } catch (e) {
      bad++; res = 'FAIL yuklanmadi: ' + e.message.split('\n')[0].slice(0, 70) + ' -> ' + new URL(l.href).pathname;
    }
    await q.close();
    rows.push(url.padEnd(34) + ' ' + l.raw.slice(0, 38).padEnd(38) + ' ' + res);
  }
  await p.close();
}
rows.forEach((r) => console.log(r));
console.log('tekshirilgan yuklash havolasi:', total, '| buzuq:', bad);
await b.close();
process.exit(bad ? 1 : 0);
