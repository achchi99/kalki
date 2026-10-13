// /cyr/ sahifalar (JS yo'q): toshish (320/390/768/1280), konsol xatosi, ijro etiladigan skript yo'qligi, mobil menyu CSS-only ishlashi, axe color-contrast.
// node tools/dizayn/test-cyr.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
const SL = fs.readdirSync(path.join(ROOT, 'cyr')).filter((f) => f.endsWith('.html')).map((f) => f.replace(/\.html$/, '')); let bad = 0;
for (const slug of SL) { const probs = [];
  for (const w of [320, 390, 768, 1280]) {
    const c = await b.newContext({ viewport: { width: w, height: 800 }, serviceWorkers: 'block', isMobile: w < 500 }); const p = await c.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 100))); p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|fonts\.g|ERR_FAIL/.test(m.text())) errs.push(m.text().slice(0, 100)); });
    await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort()); await p.goto(`${BASE}/cyr/${slug}`, { waitUntil: 'networkidle' });
    const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, scripts: [...document.scripts].filter((s) => !/json/.test(s.type)).length, v2: document.body.classList.contains('v2') }));
    if (m.sw > m.iw) probs.push(`${w}px: toshdi`); if (m.scripts) probs.push('ijro etiladigan skript bor'); if (!m.v2) probs.push('body.v2 yo\'q'); if (errs.length) probs.push(`${w}: konsol ${errs[0]}`);
    if (w < 900) { const menu = p.locator('#topmenu'); const before = await menu.isVisible(); await p.locator('#navtoggle').click(); const open = await menu.isVisible(); await p.locator('#navtoggle').click(); const closed = !(await menu.isVisible());
      if (before || !open || !closed) probs.push(`${w}px: mobil menyu (yopiq=${!before}, ochiq=${open}, qayta yopildi=${closed})`); }
    if (w === 390 || w === 1280) { await p.evaluate(AXE); const v = await p.evaluate(async () => (await axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] } })).violations.flatMap((x) => x.nodes.map((n) => n.target.join(' ').slice(0, 60)))); if (v.length) probs.push(`${w}px: kontrast ${v.length} (${v[0]})`); }
    await c.close(); }
  console.log((probs.length ? 'MUAMMO ' : 'OK     ') + 'cyr/' + slug + (probs.length ? ' — ' + probs.join(' | ') : '')); bad += probs.length; }
await b.close(); srv.close(); process.exit(bad ? 1 : 0);
