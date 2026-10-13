// 404 sahifa (Chromium, 360px): noma'lum chuqur manzil -> HTTP 404 + V2 sahifa; til tugmalari; havolalar.
//   node tools/dizayn/test-404.mjs                       # lokal: Cloudflare Pages tartibini taqlid qiluvchi server
//   node tools/dizayn/test-404.mjs https://<preview>     # jonli preview/production
// Bitta Chromium; tugagach yoki xatoda track() yopadi (CLAUDE.md qoidasi).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url);
const { resolves } = require('../verify-404.js');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

let BASE = process.argv[2];
if (!BASE) {
  const srv = http.createServer((q, r) => {
    const p = decodeURIComponent(q.url.split('?')[0]);
    const base = p.replace(/\/$/, '');
    const f = resolves(p) ? [path.join(ROOT, p), path.join(ROOT, base + '.html'), path.join(ROOT, base + '/index.html'), p === '/' ? path.join(ROOT, 'index.html') : ''].find((c) => c && fs.existsSync(c) && fs.statSync(c).isFile()) : null;
    if (!f) { r.writeHead(404, { 'Content-Type': MIME['.html'] }); return r.end(fs.readFileSync(path.join(ROOT, '404.html'))); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f));
  });
  await new Promise((ok) => srv.listen(0, ok));
  BASE = 'http://localhost:' + srv.address().port;
}
BASE = BASE.replace(/\/$/, '');

let bad = 0;
const T = (ok, name, extra) => { if (!ok) bad++; console.log((ok ? 'OK   ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); };
const b = track(await chromium.launch());
const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: 'block' });
await ctx.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
const h1 = async () => (await p.textContent('h1')).trim();
const settle = () => p.waitForTimeout(1500);

for (const u of ['/yoq-sahifa', '/ru/yoq/chuqur/manzil', '/claude.md']) {
  const r = await p.goto(BASE + u, { waitUntil: 'load' });
  await settle();
  T(r.status() === 404, u + ' -> HTTP 404', 'status ' + r.status());
}

// /ru/ ostidagi noma'lum manzil — ruscha 404 (lang.js yo'ldan tilni oladi)
await p.goto(BASE + '/ru/yoq/chuqur/manzil', { waitUntil: 'load' }); await settle();
T((await h1()) === 'Страница не найдена', '/ru/... noma\'lum manzilda 404 sahifa RUSCHA', await h1());
await p.evaluate(() => { try { localStorage.clear(); } catch (e) { /* bloklangan bo'lishi mumkin */ } });

// chuqur manzilda to'liq dizayn (lotin rejimida)
await p.goto(BASE + '/yoq/chuqur/manzil', { waitUntil: 'load' }); await settle();
const m = await p.evaluate(() => {
  const seg = [...document.querySelectorAll('.lang-seg > *')].map((e) => { const r = e.getBoundingClientRect(); return e.textContent + ':' + Math.round(r.width) + 'x' + Math.round(r.height); });
  const logo = document.querySelector('.sb2 .logo');
  return { h1: document.querySelector('h1').innerText.trim(), seg, ovf: document.documentElement.scrollWidth - innerWidth, v2: document.body.classList.contains('v2'),
    bg: getComputedStyle(document.body).backgroundColor, logoHref: logo && logo.getAttribute('href'), cards: document.querySelectorAll('#popGrid .k-card').length,
    robots: (document.querySelector('meta[name=robots]') || {}).content, footer: !!document.getElementById('sf2'), lang: document.documentElement.lang };
});
T(m.h1 === 'Sahifa topilmadi', 'h1 "Sahifa topilmadi"', m.h1);
T(m.v2 && m.bg !== 'rgb(255, 255, 255)' && m.bg !== 'rgba(0, 0, 0, 0)', 'V2 stil yuklandi (chuqur manzilda ham: /assets/ absolyut)', m.bg);
T(m.logoHref === '/' && m.footer, 'logotip "/" ga olib boradi, footer bor', String(m.logoHref));
T(m.cards === 4, 'mashhur bo\'limlar: 4 karta', String(m.cards));
T(/noindex/.test(m.robots || ''), 'noindex', m.robots);
T(m.seg.length === 3 && m.seg.every((x) => { const [w, h] = x.split(':')[1].split('x').map(Number); return w >= 44 && h >= 44; }), 'UZ | ЎЗ | RU tugmalari >=44px', m.seg.join(' '));
T(m.ovf <= 0, '360px: gorizontal siljish yo\'q', String(m.ovf));
T(m.seg.map((x) => x.split(':')[0]).join('|') === 'UZ|ЎЗ|RU', 'tugma yorliqlari "UZ | ЎЗ | RU"', m.seg.map((x) => x.split(':')[0]).join('|'));
if (process.env.SHOT_404) await p.screenshot({ path: process.env.SHOT_404 }).catch(() => {});   // ixtiyoriy: repo ichiga yozilmaydi

// til aylanishi: manzil o'zgarmaydi (404 sahifa boshqa tilda ham 404 sahifa)
const path0 = new URL(p.url()).pathname;
await p.click('#langRu'); await settle();
T((await h1()) === 'Страница не найдена' && new URL(p.url()).pathname === path0, 'RU: matn ruscha, manzil o\'zgarmadi', await h1());
await p.click('#langCyr'); await settle();
const cyrH = await h1();
T(/^Саҳифа топилмади$/.test(cyrH) && new URL(p.url()).pathname === path0 && /lang=cyr/.test(p.url()), 'ЎЗ: matn kirillda (?lang=cyr), manzil o\'zgarmadi', cyrH);
const segTxt = await p.evaluate(() => [...document.querySelectorAll('.lang-seg > *')].map((e) => e.textContent).join('|'));
T(segTxt === 'UZ|ЎЗ|RU', 'ЎЗ rejimida ham tugmalar "UZ | ЎЗ | RU"', segTxt);
await p.click('#langUz'); await settle();
T((await h1()) === 'Sahifa topilmadi', 'UZ: matn lotinda qaytdi', await h1());

// havola ishlaydi
await p.click('#popGrid .k-card >> nth=0'); await p.waitForLoadState('load'); await settle();
const dest = await p.evaluate(() => ({ path: location.pathname, h1: document.querySelector('h1').innerText.trim() }));
T(dest.path === '/kredit-kalkulyator' && /Kredit/i.test(dest.h1), 'karta havolasi haqiqiy sahifaga olib boradi', dest.path + ' | ' + dest.h1);
T(errs.length === 0, 'JS xatolari yo\'q', errs.join(' | '));
await b.close();
process.exit(bad ? 1 : 0);
