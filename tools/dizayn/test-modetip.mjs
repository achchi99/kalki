import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port;
// Rejim izohi tili sahifaning O'Z tilidan (URL), localStorage'dan emas. node tools/dizayn/test-modetip.mjs
const b = track(await chromium.launch()); let bad = 0;
const CYR = /[Ѐ-ӿ]/, LAT = /[A-Za-z]/;
const CASES = [
  ['uz', 'ru', '/qqs-kalkulyator', (t) => !CYR.test(t) && /QQS/.test(t)],            // ru saqlangan, UZ sahifa -> o'zbekcha
  ['ru', 'uz', '/ru/qqs-kalkulyator', (t) => CYR.test(t) && !/chiqadi|yozing/.test(t)],  // uz saqlangan, RU sahifa -> ruscha
  ['uz', 'cyr', '/qqs-kalkulyator?lang=cyr', (t) => CYR.test(t) && !/[Ыыэ]|получите|Введите/.test(t)], // ЎЗ -> kirill o'zbekcha
  ['uz', 'ru', '/ipoteka-kalkulyator', (t) => !CYR.test(t)],
  ['ru', 'uz', '/ru/yoqilgi-kalkulyator', (t) => CYR.test(t)],
];
for (const [, saved, url, ok] of CASES) {
  const c = await b.newContext({ serviceWorkers: 'block' }); await c.addInitScript((v) => { try { localStorage.setItem('kalki_lang', v); } catch (e) {} }, saved === 'cyr' ? 'uz' : saved);
  const p = await c.newPage(); await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const tip = await p.evaluate(() => document.querySelector('.mode-tip')?.textContent || '');
  const good = !!tip && ok(tip); if (!good) bad++; console.log(good ? 'OK  ' : 'XATO', 'saqlangan=' + saved, url, '->', tip.slice(0, 60)); await c.close();
}
await b.close(); srv.close(); process.exit(bad ? 1 : 0);
