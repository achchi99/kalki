// Majburiy kontrast testi (har bir partiyada): axe-core "color-contrast" + diagramma ranglari (>=3:1).
// Barcha V2 sahifalar × UZ/RU × 390 va 1280 px × 2 holat (boshlang'ich/skelet; birinchi oltin kirish bilan hisoblangandan keyin).
// node tools/dizayn/test-kontrast.mjs [slug,slug,...]      Chiqish kodi 1 — agar xato bo'lsa.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
const require = createRequire(import.meta.url); const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((ok) => srv.listen(8798, ok));
const V2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/dizayn/v2-pages.json'), 'utf8')).map((f) => f.replace(/\.html$/, ''));
const only = process.argv[2] ? process.argv[2].split(',') : null;
const SLUGS = V2.filter((s) => !only || only.includes(s));
const b = await chromium.launch();
const lum = ([r, g, bl]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl); };
const ratio = (a, c) => { const x = lum(a), y = lum(c); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const rgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
async function calculate(p) {
  const vis = () => p.evaluate(() => { const r = document.querySelector('.res-col .receipt, #receipt'); return !!r && r.offsetHeight > 0; });
  const btn = p.locator('main .calc-btn:visible').first(); if (await btn.count()) await btn.click({ timeout: 1500 }).catch(() => {});
  await p.waitForTimeout(450);
  if (!(await vis()) && !(await p.locator('.dg-form, #formHost').count())) {
    const ins = p.locator('main input[type=text]:visible'); const n = await ins.count(); for (let i = 0; i < n; i++) await ins.nth(i).fill(i === 0 ? '5000000' : '2').catch(() => {});
    if (await btn.count()) await btn.click({ timeout: 1500 }).catch(() => {}); await p.waitForTimeout(450);
  }
  // generatorlar: ko'rinadigan maydonlarga namunaviy matn
  if (await p.locator('#formHost [data-f]').count()) {
    const els = p.locator('#formHost [data-f]:visible'); const n = await els.count();
    for (let i = 0; i < n; i++) { const e = els.nth(i); const tag = await e.evaluate((x) => x.tagName); if (tag === 'INPUT' || tag === 'TEXTAREA') { const t = (await e.getAttribute('type')) || 'text'; await e.fill(t === 'date' ? '2026-01-15' : t === 'number' ? '5' : 'Namuna matn').catch(() => {}); } }
    await p.waitForTimeout(500);
  }
}
let bad = 0; const table = []; const uniq = new Map();
for (const slug of SLUGS) for (const lang of ['uz', 'ru']) {
  const url = (lang === 'ru' ? '/ru/' : '/') + slug; const row = { sahifa: (lang === 'ru' ? 'ru/' : '') + slug, xato: 0, tafsilot: [] };
  for (const w of [390, 1280]) for (const state of ['boshlang\'ich', 'hisoblangan']) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, serviceWorkers: 'block', locale: lang === 'ru' ? 'ru' : 'uz' }); const p = await ctx.newPage();
    await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|t\.me|lex\.uz/, (r) => r.abort());
    await p.goto('http://localhost:8798' + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    if (state === 'hisoblangan') await calculate(p);
    await p.evaluate(AXE);
    const res = await p.evaluate(async () => { const r = await axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] } });
      return r.violations.flatMap((v) => v.nodes.map((n) => ({ t: n.target.join(' ').slice(0, 70), m: (n.any[0] && n.any[0].message || '').slice(0, 130) }))); });
    // diagramma ranglari: seriya (fill/stroke) fonga nisbatan >= 3:1
    const chart = await p.evaluate(() => { const out = []; document.querySelectorAll('svg [class*="pc-principal"], svg [class*="pc-interest"], svg [class*="pc-"]:not([class*="axis"]):not([class*="grid"]):not([class*="txt"])').forEach((e) => {
      const cs = getComputedStyle(e); if (!e.getBoundingClientRect().width) return; let bg = e; let c = 'rgba(0, 0, 0, 0)';
      while (bg) { c = getComputedStyle(bg).backgroundColor; if (!/rgba\(.*, 0\)|transparent/.test(c)) break; bg = bg.parentElement; }
      out.push({ cls: String(e.getAttribute('class')), fill: cs.fill, stroke: cs.stroke, bg: c }); }); return out; });
    for (const c of chart) { const col = /rgb/.test(c.fill) ? c.fill : c.stroke; if (!/rgb/.test(col)) continue; const r = ratio(rgb(col), rgb(c.bg)); if (r < 3) res.push({ t: 'diagramma ' + c.cls, m: 'seriya rangi ' + col + ' fon ' + c.bg + ' = ' + r.toFixed(2) + ':1 (<3)' }); }
    res.forEach((x) => { const k = x.t.replace(/:nth-child\(\d+\)/g, '') + ' | ' + x.m.replace(/^Element has insufficient color contrast of /, '').slice(0, 90); uniq.set(k, (uniq.get(k) || 0) + 1); });
    if (res.length) { row.xato += res.length; res.slice(0, 4).forEach((x) => row.tafsilot.push(`${w}px/${state}: ${x.t} — ${x.m}`)); }
    await ctx.close();
  }
  bad += row.xato; table.push(row); console.log((row.xato ? 'XATO ' : 'OK   ') + row.sahifa + ' — ' + row.xato); if (!process.env.QUIET) row.tafsilot.forEach((t) => console.log('      ' + t));
}
await b.close(); srv.close();
if (uniq.size) { console.log('\nNOYOB xatolar (selektor | nisbat, ranglar) × necha marta:'); [...uniq].sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log('  ' + n + '× ' + k)); }
console.log(bad ? `\nJami ${bad} ta kontrast xatosi (${table.filter((r) => r.xato).length}/${table.length} sahifa)` : `\nKontrast: ${table.length} sahifa (UZ+RU, 390/1280, 2 holat) — 0 xato`);
process.exit(bad ? 1 : 0);
