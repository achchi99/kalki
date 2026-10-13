// Piksel-darajadagi regressiya: har sahifaning (UZ, boshlang'ich holat) to'liq skrinshoti hash'i, 390 va 1280 px.
// node tools/dizayn/shot-hash.mjs <chiqish.json> [slug,slug,...]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const [OUT, SL] = process.argv.slice(2);
const V2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/dizayn/v2-pages.json'), 'utf8')).map((f) => f.replace(/\.html$/, ''));
const LIST = SL ? SL.split(',') : V2;
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((o) => srv.listen(0, o)); const port = srv.address().port; const b = track(await chromium.launch()); const res = {};
for (const slug of LIST) for (const w of [390, 1280]) {
  const c = await b.newContext({ viewport: { width: w, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' }); const p = await c.newPage();
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|t\.me|adsbygoogle/, (r) => r.abort());
  await p.goto(`http://localhost:${port}/${slug === 'index' ? '' : slug}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(350);
  await p.addStyleTag({ content: '*{animation:none!important;transition:none!important;caret-color:transparent!important}' });
  const buf = await p.screenshot({ fullPage: true, type: 'png' }); res[`${slug}@${w}`] = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
  if (process.env.SAVE) { fs.mkdirSync(process.env.SAVE, { recursive: true }); fs.writeFileSync(path.join(process.env.SAVE, `${slug}@${w}.png`), buf); }
  await c.close(); }
fs.writeFileSync(OUT, JSON.stringify(res, null, 1)); await b.close(); srv.close(); console.log('yozildi', OUT, Object.keys(res).length);
