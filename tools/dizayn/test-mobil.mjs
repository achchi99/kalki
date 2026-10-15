// 320/390: amal tugmalari 2×2 + bir qatorda; generatorlarda yopishgan tugma maydonni yopmaydi; hujjat matni chapga tekis. node tools/dizayn/test-mobil.mjs [calc|gen|doc]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
import { pool } from './parallel.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const PG = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/dizayn/pages.json'), 'utf8'));
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port;
const b = track(await chromium.launch()); let bad = 0; const say = (ok, ...a) => { if (!ok) bad++; return ok ? null : ['XATO', ...a].join(' '); };
const mode = process.argv[2] || 'all';
const TASKS = [];
for (const w of [320, 390]) {
  if (mode !== 'gen' && mode !== 'doc') for (const x of PG.filter((x) => x.tur === 'kalkulyator' && (!process.env.ONLY || x.file.startsWith(process.env.ONLY)))) for (const l of ['', 'ru/']) { if (l && !fs.existsSync(path.join(ROOT, 'ru', x.file))) continue; TASKS.push({ kind: 'calc', w, x, l }); }
  if (mode !== 'calc') for (const x of PG.filter((x) => x.tur === 'generator')) TASKS.push({ kind: 'gen', w, x, l: '' });
}
const OUT = await pool(TASKS, undefined, async ({ kind, w, x, l }) => {
  const c = await b.newContext({ viewport: { width: w, height: 700 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' }); const p = await c.newPage();
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  const s = x.file.replace('.html', '');
  await p.goto(BASE + '/' + l + s, { waitUntil: 'networkidle' }); await p.waitForTimeout(kind === 'calc' ? 250 : 300);
  let line = null;
  if (kind === 'calc') {
    const r = await p.evaluate(() => { const a = document.querySelector('.receipt-actions'); if (!a) return null;
      const bs = [...a.querySelectorAll(':scope>button')].filter((e) => getComputedStyle(e).display !== 'none'); const cols = new Set(bs.map((e) => Math.round(e.getBoundingClientRect().left)));
      return { n: bs.length, cols: cols.size, grid: getComputedStyle(a).display, one: bs.every((e) => e.scrollWidth <= e.clientWidth + 1 && e.getBoundingClientRect().height <= 52), det: bs.map((e) => [e.textContent.trim(), e.scrollWidth, e.clientWidth, Math.round(e.getBoundingClientRect().height)]), sw: document.documentElement.scrollWidth <= innerWidth }; });
    if (!r) line = null; else line = say(r.grid === 'grid' && r.cols <= 2 && r.one && r.sw, w, l + s, JSON.stringify(r));
  } else {
    const r = await p.evaluate(async () => {
      const j = document.querySelector('.dg-jump'); const o = { jump: !!j, bad: 0, n: 0, just: [...document.querySelectorAll('.dg-p')].map((e) => getComputedStyle(e).textAlign).filter((v) => v === 'justify').length };
      if (!j || getComputedStyle(j).display === 'none') return o;
      o.padB = parseFloat(getComputedStyle(document.querySelector('main')).paddingBottom);
      const fs = [...document.querySelectorAll('#formHost input,#formHost select,#formHost textarea')].filter((e) => e.offsetParent && e.type !== 'hidden');
      for (const f of fs.slice(0, 40)) { f.focus({ preventScroll: false }); await new Promise((r) => setTimeout(r, 30)); const fr = f.getBoundingClientRect(), jr = j.getBoundingClientRect(); o.n++;
        if (fr.bottom > jr.top && fr.top < jr.bottom && jr.top < innerHeight) o.bad++; }
      return o; });
    line = say(r.bad === 0 && r.just === 0 && (!r.jump || r.padB >= 90 || r.n === 0), w, s, JSON.stringify(r));
  }
  await c.close(); return line;
});
OUT.filter(Boolean).forEach((x) => console.log(x));
console.log(bad ? bad + ' ta muammo' : 'toza'); await b.close(); srv.close(); process.exit(bad ? 1 : 0);
