// "Oddiy" rejim main bilan bir xil: har bir matn elementining hisoblangan shrift o'lchami (320/1280). node tools/dizayn/test-oddiy.mjs <main-worktree> [slug ...]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const NEW = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const OLD = path.resolve(process.argv[2]);
const LIST = process.argv.slice(3).length ? process.argv.slice(3) : ['index', 'kredit-kalkulyator', 'oylik-soliq-kalkulyator', 'ijara-shartnomasi-namunasi', 'ipoteka-2026', 'elektr-xarajat-kalkulyator', 'gaz-xarajat-kalkulyator', 'oila-byudjet-kalkulyator', 'hujjatlar', 'maxfiylik', 'kaloriya-kalkulyator', 'ariza-namunasi'];
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const serve = (root) => new Promise((ok) => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index';
  const f = [path.join(root, p), path.join(root, p + '.html')].find((c) => c.startsWith(root) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }); s.listen(0, () => ok([s, 'http://localhost:' + s.address().port])); });
const [s1, B1] = await serve(OLD), [s2, B2] = await serve(NEW);
const b = track(await chromium.launch()); let bad = 0;
async function sizes(base, slug, w) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: w < 500, serviceWorkers: 'block' }); const p = await c.newPage(); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  await p.goto(base + '/' + (slug === 'index' ? '' : slug), { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const o = []; const wk = document.createTreeWalker(document.querySelector('main') || document.body, NodeFilter.SHOW_TEXT); let n; while ((n = wk.nextNode())) { const t = n.nodeValue.trim(); if (!t) continue; const e = n.parentElement; if (e.closest('script,style,svg,noscript')) continue; const cs = getComputedStyle(e); if (cs.display === 'none') continue; o.push(t.slice(0, 20) + '|' + parseFloat(cs.fontSize).toFixed(2)); } return { o, root: parseFloat(getComputedStyle(document.documentElement).fontSize) }; });
  await c.close(); return r; }
for (const slug of LIST) for (const w of [320, 1280]) {
  const a = await sizes(B1, slug, w), n = await sizes(B2, slug, w); const set = new Map(); for (const x of a.o) set.set(x, (set.get(x) || 0) + 1);
  const diff = []; for (const x of n.o) { if (set.get(x)) set.set(x, set.get(x) - 1); else diff.push(x); }
  const real = diff.filter((x) => !/^(Размер|Shrift|Oddiy|Katta|Обычный|Крупный|1|2|3)/.test(x));
  if (n.root !== 16 || real.length > 0) { bad++; console.log('FARQ', slug, w, 'root=' + n.root, real.slice(0, 5).join(' ; ')); } else console.log('OK  ', slug, w);
}
await b.close(); s1.close(); s2.close(); console.log(bad ? bad + ' ta farq' : 'Oddiy rejim main bilan bir xil'); process.exit(bad ? 1 : 0);
