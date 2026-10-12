// Service worker simulyatsiyasi: onlayn ochish -> oflayn qayta ochish (V2 uslubi, ikonkalar, nav) + ochilmagan sahifa -> offline.html
// node tools/dizayn/test-sw.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; if (p.endsWith('/')) p += 'index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end('nf'); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port;
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1280, height: 800 } }); const p = await c.newPage();
await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|t\.me/, (r) => r.abort());
const out = []; const T = (ok, name, info = '') => { out.push(ok); console.log((ok ? 'OK   ' : 'YIQILDI ') + name + (info ? ' — ' + info : '')); };
await p.goto(BASE + '/', { waitUntil: 'networkidle' });
await p.evaluate(() => navigator.serviceWorker.ready); await p.waitForTimeout(6000);   // precache tugashi
const keys = await p.evaluate(async () => (await caches.keys()).join(','));
T(/kalki-static-/.test(keys), 'SW o\'rnatildi, kesh yaratildi', keys);
const cached = await p.evaluate(async () => { const k = (await caches.keys()).find((x) => x.startsWith('kalki-static-')); const ca = await caches.open(k); return Promise.all(['/assets/css/site.css', '/assets/css/tokens.css', '/assets/icons.svg', '/assets/nav.js', '/kredit-kalkulyator', '/offline'].map(async (u) => [u, !!(await ca.match(u))])); });
cached.forEach(([u, ok]) => T(ok, 'precache: ' + u));
await c.setOffline(true);
for (const u of ['/kredit-kalkulyator', '/ru/hujjatlar', '/cyr/kredit-kalkulyator', '/qqs-2026']) {
  const rsp = await p.goto(BASE + u, { waitUntil: 'load' }).catch((e) => null); await p.waitForTimeout(500);
  const m = await p.evaluate(() => ({ v2: document.body.classList.contains('v2'), hdr: getComputedStyle(document.getElementById('sitebar') || document.body).position, bg: getComputedStyle(document.body).backgroundColor, svg: !!document.querySelector('svg.ic use') }));
  T(!!rsp && m.v2 && m.bg === 'rgb(241, 242, 238)', 'oflayn ochiladi va V2 uslubi bor: ' + u, JSON.stringify(m));
}
await p.goto(BASE + '/hech-qachon-ochilmagan-sahifa', { waitUntil: 'load' }).catch(() => {}); await p.waitForTimeout(400);
T(/Internet aloqasi yo'q|Нет подключения/.test(await p.evaluate(() => document.body.innerText)), 'ochilmagan sahifa -> offline.html');
await b.close(); srv.close(); process.exit(out.every(Boolean) ? 0 : 1);
