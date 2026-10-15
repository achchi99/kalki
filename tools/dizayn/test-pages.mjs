// Barcha V2 sahifalar (v2-pages.json, UZ+RU): toshish 320/390/768/1280, konsol xatolari, emoji, til tozaligi, sticky kesishish.
// node tools/dizayn/test-pages.mjs [slug ...]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
import { pool } from './parallel.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const V2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/dizayn/v2-pages.json'), 'utf8')).map((f) => f.replace(/\.html$/, ''));
const ONLY = process.argv.slice(2); const LIST = ONLY.length ? V2.filter((s) => ONLY.includes(s)) : V2;
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; if (p === '/ru/') p = '/ru/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port;
const b = track(await chromium.launch()); let bad = 0; const rows = [];
const EMO = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
async function ctxPage(w, h) { const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500, serviceWorkers: 'block' }); const p = await c.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 140))); p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|googlesyndication|adsbygoogle|googletag|fonts\.g|ERR_FAILED|ERR_ABORTED/.test(m.text())) errs.push(m.text().slice(0, 140)); });
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort()); return [p, errs]; }
const TASKS = []; for (const slug of LIST) for (const lang of ['uz', 'ru'].filter((l) => l === 'uz' || fs.existsSync(path.join(ROOT, 'ru', slug + '.html')))) TASKS.push({ slug, lang });
const LINES = await pool(TASKS, undefined, async ({ slug, lang }) => {
  const url = (lang === 'ru' ? '/ru/' : '/') + (slug === 'index' ? '' : slug); const probs = [];
  for (const [w, h] of [[320, 640], [390, 844], [768, 1024], [1280, 800]]) {
    const [p, errs] = await ctxPage(w, h);
    try { await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(350); } catch (e) { probs.push(`${w}: yuklanmadi`); continue; }
    const m = await p.evaluate(() => { const bc = document.getElementById('breadcrumb'); document.querySelectorAll('.xlink-ic').forEach((e) => { e.textContent = ''; }); const t = document.body.innerText.replace(bc ? bc.innerText : '', ''); const h1 = (document.querySelector('h1') || {}).innerText || '';
      return { sw: document.documentElement.scrollWidth, iw: innerWidth, hdr: Math.round((document.getElementById('sitebar') || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect().height), v2: document.body.classList.contains('v2'), app: document.body.classList.contains('rz-body'), text: t, h1 }; });
    if (m.sw > m.iw) probs.push(`${w}px: toshdi (${m.sw}>${m.iw})`);
    if (!m.v2) probs.push('body.v2 yo\'q'); if (!m.app && (m.hdr > 64 || m.hdr < 50)) probs.push(`${w}px: sarlavha ${m.hdr}px`);   // m.app — ilova sahifasi (Ro'zg'or): sayt sarlavhasi atayin yashirin
    if (errs.length) probs.push(`${w}px: konsol: ${errs[0]}`);
    if (w === 1280) {
      const body = m.text.replace(m.h1, '');   // H1 dagi emoji SEO uchun saqlanadi
      if (EMO.test(body)) probs.push('emoji: ' + (body.match(EMO) || [''])[0]);
      if (lang === 'uz' && slug !== 'uy-qurish-kalkulyator' && /[\u0400-\u04FF]/.test(body.replace(/ЎЗ|Кириллча|график отпусков|(?<=40% )идан/g, ''))) probs.push('UZ sahifada kirill: ' + (body.match(/[\u0400-\u04FF]+/) || [''])[0]);   // uy-qurish: asl matnda kirill "материал" bor (main'da ham)
      if (lang === 'ru' && /(^|[^A-Za-z])[a-z]+['\u2019\u02bb\u2018][a-z]+/.test(body)) probs.push('RU sahifada o\'zbekcha: ' + (body.match(/(^|[^A-Za-z])[a-z]+['\u2019\u02bb\u2018][a-z]+/) || [''])[0]);
    }
    await p.context().close();
  }
  rows.push([slug, lang, probs.length ? probs.slice(0, 4).join(' | ') : 'OK']); if (probs.length) bad++; return (probs.length ? 'MUAMMO ' : 'OK     ') + slug + ' ' + lang + (probs.length ? ' — ' + probs.slice(0, 4).join(' | ') : '');
});
LINES.forEach((l) => console.log(l));
await b.close(); srv.close(); console.log(bad ? bad + ' ta muammoli sahifa' : 'barcha sahifalar toza'); process.exit(bad ? 1 : 0);
