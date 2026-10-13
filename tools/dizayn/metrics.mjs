// Dizayn o'lchovlari: matn belgilari bo'yicha hisoblangan shrift o'lchamlari taqsimoti, sarlavha balandligi.
// node tools/dizayn/metrics.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((ok) => srv.listen(8793, ok));
const b = track(await chromium.launch());
for (const [w, h] of [[390, 844], [1280, 900]]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await page.route(/googlesyndication|googletagmanager|google-analytics/, (r) => r.abort());
  for (const u of ['/', '/shablonlar', '/gisht-kalkulyator']) {
    await page.goto('http://localhost:8793' + u, { waitUntil: 'networkidle' }).catch(() => {});
    const m = await page.evaluate(() => {
      const hist = {}; let total = 0;
      const wk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (wk.nextNode()) { const t = wk.currentNode, s = t.textContent.trim(); if (!s) continue; const el = t.parentElement; if (!el || el.closest('script,style,noscript')) continue;
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || !el.offsetParent && cs.position !== 'fixed') continue;
        const fs = Math.round(parseFloat(cs.fontSize) * 2) / 2; hist[fs] = (hist[fs] || 0) + s.length; total += s.length; }
      const small = Object.entries(hist).filter(([k]) => +k < 14).reduce((a, [, v]) => a + v, 0);
      const lt15 = Object.entries(hist).filter(([k]) => +k < 15).reduce((a, [, v]) => a + v, 0);
      const mode = Object.entries(hist).sort((a, b) => b[1] - a[1])[0][0];
      const nav = document.getElementById('topmenu'), sb = document.getElementById('sitebar');
      const na = nav && nav.querySelector('a');
      return { total, mode, pctLt14: Math.round(100 * small / total), pctLt15: Math.round(100 * lt15 / total),
        navH: nav ? Math.round(nav.getBoundingClientRect().height) : 0, sbH: sb ? Math.round(sb.getBoundingClientRect().height) : 0,
        navFont: na ? getComputedStyle(na).fontSize : '-', headerTotal: Math.round((sb ? sb.getBoundingClientRect().bottom : 0)), docH: document.documentElement.scrollHeight };
    });
    console.log(w + 'px ' + u, JSON.stringify(m));
  }
}
await b.close(); srv.close();
