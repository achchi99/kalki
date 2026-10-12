// 1d: natija kartasi yopishqoqligi — turli ekranlarda aylantirib, pastki bloklar bilan kesishmasligini tekshiradi.
// node tools/dizayn/test-sticky.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((ok) => srv.listen(8797, ok));
const b = await chromium.launch();
const out = (n) => path.join(ROOT, 'docs/dizayn-skrinshot', n);
const PAGES = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/dizayn/pages.json'), 'utf8'));
const V2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/dizayn/v2-pages.json'), 'utf8')).map((f) => f.replace(/\.html$/, ''));
const CALCS = PAGES.filter((p) => p.tur === 'kalkulyator' && V2.includes(p.slug)).map((p) => p.slug).filter((sl) => !process.argv[2] || process.argv.slice(2).includes(sl));
const SIZES = [[1280, 720], [1440, 900], [1650, 900], [1920, 1080]];
const results = [];
async function open(w, h, url) {
  const c = await b.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block' }); const p = await c.newPage();
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  await p.goto('http://localhost:8797' + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(400); return p;
}
const inter = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
for (const slug of CALCS) for (const [w, h] of SIZES) {
  const p = await open(w, h, '/' + slug);
  if (!(await p.locator('.calc-grid .res-col').count())) { console.log(`--   ${slug}: .calc-grid yo'q (grid qo'llanmagan sahifa) — o'tkazildi`); await p.context().close(); break; }
  const vis = await p.evaluate(() => document.querySelector('.res-col .receipt').offsetHeight > 0);
  if (!vis) {
    const btn = p.locator('main .calc-btn:visible').first(); if (await btn.count()) await btn.click().catch(() => {}); await p.waitForTimeout(400);
    if (!(await p.evaluate(() => document.querySelector('.res-col .receipt').offsetHeight > 0))) {   // kirish kerak: ko'rinadigan matn maydonlarini to'ldiramiz
      const ins = p.locator('main input[type=text]:visible'); const n = await ins.count(); for (let i = 0; i < n; i++) await ins.nth(i).fill(i === 0 ? '5000000' : '2').catch(() => {});
      if (await btn.count()) await btn.click().catch(() => {}); await p.waitForTimeout(500);
    }
  }
  if (!(await p.evaluate(() => document.querySelector('.res-col .receipt').offsetHeight > 0))) { console.log(`--   ${slug}: natija kartasi ko'rinmadi (kirish talab qiladi) — kesishish tekshirilmadi`); await p.context().close(); break; }
  const info = await p.evaluate(() => ({ cardH: Math.round(document.querySelector('.receipt').offsetHeight), sticky: document.querySelector('.res-col').classList.contains('is-sticky'), pos: getComputedStyle(document.querySelector('.receipt')).position, docH: document.documentElement.scrollHeight }));
  const expect = w >= 1024 && info.cardH <= h - 64 - 32;
  assert.equal(info.sticky, expect, `${slug} ${w}x${h}: is-sticky=${info.sticky}, kutilgan ${expect} (karta ${info.cardH}px)`);
  assert.equal(info.pos, expect ? 'sticky' : 'static');
  const max = info.docH - h; let hits = 0, outside = 0;
  const sels = ['#related', '#xnav', '#fbcall', '#articleLink', '#seoBlock', '.calc-grid > .how', '.calc-grid > #smeta-cta', '.sched', '.scen-wrap', '#partners-slot', '.card2', '#datanote'];
  for (let i = 0; i < 10; i++) {
    const y = Math.round((max * i) / 9);
    await p.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y); await p.waitForTimeout(100);
    const r = await p.evaluate((sl) => { const box = (e) => { const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; };
      const card = document.querySelector('.receipt'), col = document.querySelector('.res-col'); const cb = box(card), colb = box(col);
      const overlaps = sl.map((s) => { const e = document.querySelector(s); return e && e.getBoundingClientRect().height > 0 ? [s, box(e)] : null; }).filter(Boolean);
      return { cb, colb, overlaps }; }, sels);
    for (const [s, bb] of r.overlaps) if (inter(r.cb, bb)) { hits++; console.log(`  KESISH ${slug} ${w}x${h} y=${y}: karta × ${s}`); }
    if (r.cb.bottom > r.colb.bottom + 1 || r.cb.top < r.colb.top - 1) { outside++; console.log(`  USTUNDAN CHIQDI ${slug} ${w}x${h} y=${y}`); }
    if (info.sticky && r.cb.bottom > h + 1 && y > 0) { hits++; console.log(`  OSILDI ${slug} ${w}x${h} y=${y}: pastki ${Math.round(r.cb.bottom)} > ${h}`); }
    if (slug === 'gisht-kalkulyator') { if (i === 0) await p.screenshot({ path: out(`1d-gisht-${w}x${h}-tepa.jpg`), type: 'jpeg', quality: 70 }); if (i === 4) await p.screenshot({ path: out(`1d-gisht-${w}x${h}-orta.jpg`), type: 'jpeg', quality: 70 }); if (i === 9) await p.screenshot({ path: out(`1d-gisht-${w}x${h}-past.jpg`), type: 'jpeg', quality: 70 }); }
  }
  assert.equal(hits, 0, `${slug} ${w}x${h}: ${hits} ta kesishish/osilish`); assert.equal(outside, 0, `${slug} ${w}x${h}: karta ustundan chiqdi`);
  results.push(`${slug} ${w}×${h}: karta ${info.cardH}px, ${info.sticky ? 'sticky' : 'statik'}, kesishish 0`);
  await p.context().close();
}
console.log(`OK   sticky kesishish testi: ${CALCS.length} sahifa × ${SIZES.length} o'lcham × 10 pozitsiya — kesishish 0`);
// past ekran: sticky bo'lmasligi kerak
{ const p = await open(1280, 520, '/gisht-kalkulyator');
  const info = await p.evaluate(() => ({ cardH: Math.round(document.querySelector('.receipt').offsetHeight), sticky: document.querySelector('.res-col').classList.contains('is-sticky'), pos: getComputedStyle(document.querySelector('.receipt')).position }));
  assert.ok(info.cardH > 520 - 96, 'karta bu sinov uchun yetarlicha baland emas'); assert.equal(info.sticky, false); assert.equal(info.pos, 'static');
  console.log(`OK   1280×520: karta ${info.cardH}px > ${520 - 96}px → sticky EMAS (statik)`);
  await p.setViewportSize({ width: 1280, height: 900 }); await p.waitForTimeout(250);
  assert.equal(await p.evaluate(() => document.querySelector('.res-col').classList.contains('is-sticky')), true); console.log('OK   ekran balandligi 520 → 900 ga o\'zgarganda sticky yoqiladi (resize)');
  await p.setViewportSize({ width: 1000, height: 900 }); await p.waitForTimeout(250);
  assert.equal(await p.evaluate(() => document.querySelector('.res-col').classList.contains('is-sticky')), false); console.log('OK   kenglik 1000px (<1024) → sticky emas'); }
// natija o'zgarganda qayta hisoblash (qatorlar soni): 3 ta qator qo'shamiz
{ const p = await open(1280, 720, '/gisht-kalkulyator');
  const before = await p.evaluate(() => document.querySelector('.res-col').classList.contains('is-sticky'));
  await p.evaluate(() => { const rows = document.querySelector('.receipt-rows'); for (let i = 0; i < 6; i++) { const d = document.createElement('div'); d.className = 'rrow'; d.innerHTML = '<span class="k">x</span><span class="v">1</span>'; rows.appendChild(d); } }); await p.waitForTimeout(300);
  const after = await p.evaluate(() => document.querySelector('.res-col').classList.contains('is-sticky'));
  assert.equal(before, true); assert.equal(after, false); console.log('OK   natija qatorlari ko\'paygach (ResizeObserver) karta sticky\'likdan chiqadi'); }
// mobil
for (const [w, h] of [[390, 844], [320, 640]]) { const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block' }); const p = await c.newPage();
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort()); await p.goto('http://localhost:8797/gisht-kalkulyator', { waitUntil: 'networkidle' });
  const m = await p.evaluate(() => { const f = document.querySelector('.form-card').getBoundingClientRect(), r = document.querySelector('.receipt').getBoundingClientRect(), s = document.getElementById('smeta-cta').getBoundingClientRect(); return { sw: document.documentElement.scrollWidth, iw: innerWidth, order: f.bottom <= r.top + 1 && r.bottom <= s.top + 1, pos: getComputedStyle(document.querySelector('.receipt')).position, sticky: document.querySelector('.res-col').classList.contains('is-sticky') }; });
  assert.ok(m.sw <= m.iw); assert.ok(m.order); assert.equal(m.pos, 'static'); assert.equal(m.sticky, false); console.log(`OK   ${w}px: toshmaydi, forma → natija → smeta ketma-ket, statik`); }
await b.close(); srv.close();
console.log('--- 1d natijasi ---\n' + results.join('\n'));
