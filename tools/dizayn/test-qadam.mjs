// 320px: qadamlar qatori ≤2, matn shrifti ≥14px (ko'rinadigan matn tugunlari). node tools/dizayn/test-qadam.mjs [slug ...]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
import { pool } from './parallel.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const V2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/dizayn/v2-pages.json'), 'utf8')).map((f) => f.replace(/\.html$/, ''));
const ONLY = process.argv.slice(2); const LIST = ONLY.length ? ONLY : V2;
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; if (p === '/ru/') p = '/ru/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port;
const b = track(await chromium.launch()); let bad = 0;
const TASKS = []; for (const slug of LIST) for (const lang of ['uz', 'ru']) { if (lang === 'ru' && !fs.existsSync(path.join(ROOT, 'ru', slug + '.html'))) continue; TASKS.push({ slug, lang }); }
const OUT = await pool(TASKS, undefined, async ({ slug, lang }) => {
  const c = await b.newContext({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const p = await c.newPage(); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  await p.goto(BASE + (lang === 'ru' ? '/ru/' : '/') + (slug === 'index' ? '' : slug), { waitUntil: 'networkidle' }); await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const out = { steps: [], small: [] };
    document.querySelectorAll('.qadamlar li').forEach((li) => { const cs = getComputedStyle(li); const n = Math.round(li.getBoundingClientRect().height / parseFloat(cs.lineHeight)); out.steps.push(n); });
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { if (!n.nodeValue.trim()) continue; const e = n.parentElement; if (!e || e.closest('script,style,noscript,svg,.xlink-ic')) continue;
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue; const rc = e.getBoundingClientRect(); if (!rc.width || !rc.height) continue;
      const fs = parseFloat(cs.fontSize); if (fs < 13.99) out.small.push(fs + ' ' + (e.className || e.tagName) + ' «' + n.nodeValue.trim().slice(0, 30) + '»'); }
    return out; });
  const pr = []; if (r.steps.some((n) => n > 2)) pr.push('qadam qatori ' + r.steps.join('/')); if (r.small.length) pr.push('kichik shrift: ' + r.small.slice(0, 3).join(' | ') + ' (' + r.small.length + ')');
  await c.close(); if (pr.length) { bad++; return 'XATO ' + slug + ' ' + lang + ' ' + pr.join('; '); } return null;
});
OUT.filter(Boolean).forEach((x) => console.log(x));
console.log(bad ? bad + ' ta sahifada muammo' : 'toza'); await b.close(); srv.close(); process.exit(bad ? 1 : 0);
