// "Katta" shrift rejimi (html.fs-big): barcha sahifalar UZ/RU 320/390/1280 — gorizontal siljish yo'q, tugma/kartalar sig'adi.
// node tools/dizayn/test-katta.mjs [slug ...]     (Oddiy rejimda ildiz 16px, Katta'da 18.4px ham tekshiriladi)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const V2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/dizayn/v2-pages.json'), 'utf8')).map((f) => f.replace(/\.html$/, ''));
const ONLY = process.argv.slice(2); const LIST = ONLY.length ? ONLY : V2;
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; if (p === '/ru/') p = '/ru/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port;
const b = track(await chromium.launch()); let bad = 0;
for (const w of [320, 390, 1280]) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: w < 500, hasTouch: w < 500, serviceWorkers: 'block' });
  await c.addInitScript(() => { try { localStorage.setItem('kalki_fs', 'big'); } catch (e) {} });
  const p = await c.newPage(); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  for (const slug of LIST) for (const l of ['', 'ru/']) {
    if (l && !fs.existsSync(path.join(ROOT, 'ru', slug + '.html'))) continue;
    await p.goto(BASE + '/' + l + (slug === 'index' ? '' : slug), { waitUntil: 'networkidle' }); await p.waitForTimeout(250);
    const r = await p.evaluate(() => {
      const root = parseFloat(getComputedStyle(document.documentElement).fontSize); const iw = innerWidth; const clip = [];
      for (const e of document.querySelectorAll('button,a.btn,.pg-link,.ib,.receipt-actions>*,.rrow .v,.seg button,.mode-tabs button,.lang-seg>*')) {
        const cs = getComputedStyle(e); if (cs.display === 'none' || !e.getClientRects().length) continue; const rc = e.getBoundingClientRect(); if (!rc.width) continue;
        let held = false; for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { if (getComputedStyle(a).overflowX !== 'visible' && a.getBoundingClientRect().right <= iw + 1) { held = true; break; } }   // ota-konteyner ichida (skroll/kesiladi) — sahifa kengligiga ta'sir qilmaydi
        if (!held && (rc.right > iw + 1 || rc.left < -1)) clip.push('chiqib ketdi[' + Math.round(rc.left) + '..' + Math.round(rc.right) + ']:' + (e.id || e.className || e.tagName) + ':' + (e.textContent || '').trim().slice(0, 18));
        else if (/hidden|clip/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0 && !/^(UL|OL|DIV)$/.test(e.tagName)) clip.push('kesilgan:' + (e.id || e.className || e.tagName) + ':' + (e.textContent || '').trim().slice(0, 18)); }
      return { root, sw: document.documentElement.scrollWidth, iw, big: document.documentElement.classList.contains('fs-big'), clip: clip.slice(0, 3) }; });
    const pr = []; if (!r.big || Math.abs(r.root - 18.4) > .1) pr.push('fs-big yoqilmadi (' + r.root + ')'); if (r.sw > r.iw) pr.push(`toshdi ${r.sw}>${r.iw}`); if (r.clip.length) pr.push(r.clip.join(' | '));
    if (pr.length) { bad++; console.log('XATO', w, l + slug, pr.join('; ')); }
  }
  await c.close();
}
console.log(bad ? bad + ' ta muammo' : 'toza'); await b.close(); srv.close(); process.exit(bad ? 1 : 0);
