// Service worker yangilanish simulyatsiyasi (Cloudflare Pages sarlavhalarini taqlid qiladi).
//   node tools/sw-simulyatsiya.mjs <eski-papka> <yangi-papka> [--header-fix]
// Eski build'ni ro'yxatdan o'tkazadi, keyin yangi build'ni xizmat qiladi va har tashrifda
// qaysi AI bloki versiyasi ("Yangi" belgisi = 6-bosqich) ko'rinishini yozadi.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const [OLD, NEW] = process.argv.slice(2, 4).map((p) => path.resolve(p));
const HEADER_FIX = process.argv.includes('--header-fix');
let root = OLD;
let hits = [];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.xlsx': 'application/octet-stream', '.docx': 'application/octet-stream', '.xml': 'application/xml', '.txt': 'text/plain' };

function resolveFile(u) {
  let p = decodeURIComponent(u.split('?')[0]);
  if (p === '/') p = '/index';
  let f = path.join(root, p);
  if (!f.startsWith(root)) return null;
  for (const c of [f, f + '.html']) if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  return null;
}
const srv = http.createServer((req, res) => {
  const f = resolveFile(req.url);
  if (req.url.startsWith('/api/')) { res.writeHead(404); return res.end(); }
  if (!f) { res.writeHead(404); return res.end('yo\'q'); }
  const body = fs.readFileSync(f);
  const etag = 'W/"' + crypto.createHash('md5').update(body).digest('hex') + '"';
  const ext = path.extname(f);
  const isHtml = ext === '.html';
  const p = req.url.split('?')[0];
  // Cloudflare Pages sukut: HTML max-age=0, boshqa statik fayllar max-age=14400
  let cc = isHtml ? 'public, max-age=0, must-revalidate' : 'public, max-age=14400, must-revalidate';
  if (HEADER_FIX && p === '/sw.js') cc = 'no-cache, max-age=0'; // _headers qoidasi
  const h = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cc, ETag: etag };
  hits.push(req.method + ' ' + p + (req.headers['if-none-match'] ? ' (cond)' : ''));
  if (req.headers['if-none-match'] === etag) { res.writeHead(304, h); return res.end(); }
  res.writeHead(200, h); res.end(body);
});
await new Promise((r) => srv.listen(8791, r));
const BASE = 'http://localhost:8791';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'allow' });
const page = await ctx.newPage();
let autoReloads = 0;
page.on('framenavigated', (f) => { if (f === page.mainFrame()) autoReloads++; });
const stateOnce = () => page.evaluate(async () => ({
  yangi: !!document.querySelector('.aiz-badge'),
  blok: !!document.getElementById('aiAriza'),
  swv: (await caches.keys()).filter((k) => k.startsWith('kalki-static-')).join(',')
}));
async function state() {
  for (let i = 0; i < 6; i++) {
    try { await page.waitForLoadState('load'); return await stateOnce(); } catch (e) { await page.waitForTimeout(700); }
  }
  return { yangi: null, blok: null, swv: '?' };
}
const row = [];
async function visit(label, wait = 2500, reload = false) {
  hits = []; autoReloads = 0;
  if (reload) await page.reload({ waitUntil: 'load' }); else await page.goto(BASE + '/ariza-namunasi', { waitUntil: 'load' });
  await page.waitForTimeout(wait);
  const s = await state();
  const r = { label, ...s, avto_qayta_yuklash: Math.max(0, autoReloads - 1), tarmoq: hits.filter((x) => /ai-ariza|sw\.js/.test(x)).join('; ') };
  row.push(r); console.log(JSON.stringify(r));
}
// 1) eski build, SW o'rnatiladi
await visit('0: ESKI build, 1-tashrif (SW o\'rnatildi)', 3500);
await visit('0b: ESKI build, 2-tashrif', 2500);
// 2) deploy: yangi build
root = NEW;
console.log('--- DEPLOY: yangi build ---');
for (let i = 1; i <= 4; i++) await visit(i + '-tashrif (goto)', 3000);
await visit('5-tashrif (reload)', 3000, true);
// oflayn: avval ochilgan sahifalar tarmoqsiz ochilishi kerak
await page.goto(BASE + '/kredit-kalkulyator', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await ctx.setOffline(true);
for (const u of ['/ariza-namunasi', '/kredit-kalkulyator', '/hujjatlar']) {
  let ok = false, title = '';
  try { await page.goto(BASE + u, { waitUntil: 'load', timeout: 8000 }); title = await page.title(); ok = !/oflayn|offline|internet/i.test(title) && title.length > 5; } catch (e) { title = 'XATO: ' + e.message.slice(0, 60); }
  console.log('OFLAYN ' + u + ': ' + (ok ? 'ochiladi' : 'OCHILMADI') + ' — ' + title);
}
await browser.close(); srv.close();
const first = row.slice(2).findIndex((r) => r.yangi);
console.log('YANGI versiya birinchi marta: ' + (first < 0 ? 'KO\'RINMADI' : row[first + 2].label));
