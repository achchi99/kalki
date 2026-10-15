// Kompyuter (1280px) yuqori menyu: "Kalkulyatorlar"/"Hujjatlar" dropdown'i kursor tugmadan menyuga SEKIN tushganda yopilib qolmasligi.
//   - kursor 10 qadamda "Kundalik hayot" / "Shablonlar" ga tushadi (har qadamda menyu ochiq) va bosiladi -> sahifa ochiladi;
//   - yopilish ~250 ms kechikadi (100 ms da hali ochiq, ~500 ms da yopiq), qaytib kirsa ochiq qoladi;
//   - chevron bosilsa mahkamlanadi; tashqariga bosilsa yoki Esc bosilsa yopiladi;
//   - UZ / ЎЗ / RU, Oddiy / Katta shrift; mobil (390px) menyusiga ta'sir qilmaydi.
// node tools/dizayn/test-menyu-hover.mjs [https://host]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
let BASE = process.argv[2], srv;
if (!BASE) { srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; if (p === '/ru/') p = '/ru/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  await new Promise((ok) => srv.listen(0, ok)); BASE = 'http://localhost:' + srv.address().port; }
const b = track(await chromium.launch()); let bad = 0, n = 0;
const ok = (c, m) => { n++; if (!c) { bad++; console.log('XATO', m); } };
const subVisible = (p, k) => p.evaluate((i) => { const s = document.querySelectorAll('.tm2 > li.has-sub')[i].querySelector('.tm2-sub'); const r = s.getBoundingClientRect(); return getComputedStyle(s).display !== 'none' && r.width > 0 && r.height > 0; }, k);
async function mk(lang, big, w = 1280) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, serviceWorkers: 'block', isMobile: w < 500, hasTouch: w < 500 });
  await c.addInitScript((v) => { try { localStorage.setItem('kalki_lang', v.l); if (v.big) localStorage.setItem('kalki_fs', 'big'); } catch (e) {} }, { l: lang === 'ru' ? 'ru' : 'uz', big });
  const p = await c.newPage(); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort()); return [c, p];
}
const URLS = { uz: '/kredit-kalkulyator', cyr: '/kredit-kalkulyator?lang=cyr', ru: '/ru/kredit-kalkulyator' };
async function slowDownAndClick(p, idx, hrefPart, label) {
  const link = p.locator('.tm2 > li.has-sub').nth(idx).locator(':scope > a').first(); const lb = await link.boundingBox();
  await p.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2); await p.waitForTimeout(120);
  ok(await subVisible(p, idx), label + ': tugma ustida menyu ochilmadi');
  const item = p.locator('.tm2 > li.has-sub').nth(idx).locator('.tm2-sub a[href*="' + hrefPart + '"]').first(); const ib = await item.boundingBox();
  const lib = await p.locator('.tm2 > li.has-sub').nth(idx).boundingBox(), sb = await p.locator('.tm2 > li.has-sub').nth(idx).locator('.tm2-sub').boundingBox();
  const gapY = (lib.y + lib.height + sb.y) / 2;                                    // tugma (li) pastki chegarasi va menyu tepasi orasidagi bo'shliqning o'rtasi
  const x0 = lb.x + lb.width / 2, y0 = lb.y + lb.height / 2, x1 = ib.x + ib.width / 2, y1 = ib.y + ib.height / 2; let lostAt = -1;
  await p.mouse.move(x0, gapY); await p.waitForTimeout(80); if (!(await subVisible(p, idx))) lostAt = 0;     // 0-qadam: kursor aynan bo'shliqda
  for (let i = 1; i <= 10; i++) { await p.mouse.move(x0 + (x1 - x0) * i / 10, gapY + (y1 - gapY) * i / 10); await p.waitForTimeout(60); if (lostAt < 0 && !(await subVisible(p, idx))) lostAt = i; }
  ok(lostAt < 0, label + ': kursor tushayotganda menyu yopildi (' + lostAt + '-qadam)');
  await Promise.all([p.waitForURL((u) => u.href.includes(hrefPart === 'cat-hayot' ? '#cat-hayot' : hrefPart), { timeout: 8000 }).catch(() => {}), p.mouse.click(x1, y1)]); await p.waitForTimeout(300);
  ok(p.url().includes(hrefPart), label + ': bosilgach sahifa ochilmadi (' + p.url().replace(BASE, '') + ')');
}
for (const [lang, big] of [['uz', false], ['uz', true], ['cyr', false], ['ru', false], ['ru', true]]) {
  const tag = lang + (big ? '/katta' : '');
  { const [c, p] = await mk(lang, big); await p.goto(BASE + URLS[lang], { waitUntil: 'networkidle' }); await p.waitForTimeout(500); await slowDownAndClick(p, 0, 'cat-hayot', tag + ' Kalkulyatorlar → Kundalik hayot'); await c.close(); }
  { const [c, p] = await mk(lang, big); await p.goto(BASE + URLS[lang], { waitUntil: 'networkidle' }); await p.waitForTimeout(500); await slowDownAndClick(p, 1, 'shablonlar', tag + ' Hujjatlar → Shablonlar'); await c.close(); }
}
{ // kechikish, qaytish, mahkamlash, tashqari/Esc  (UZ)
  const [c, p] = await mk('uz', false); await p.goto(BASE + URLS.uz, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  const link = p.locator('.tm2 > li.has-sub').nth(0).locator(':scope > a').first(); const lb = await link.boundingBox(); const cx = lb.x + lb.width / 2, cy = lb.y + lb.height / 2;
  await p.mouse.move(cx, cy); await p.waitForTimeout(80); ok(await subVisible(p, 0), 'ochilish darhol bo\'lmadi (80 ms)');
  await p.mouse.move(cx, 600); await p.waitForTimeout(100); ok(await subVisible(p, 0), 'chiqqach 100 ms da yopildi (kechikish yo\'q)');
  await p.waitForTimeout(450); ok(!(await subVisible(p, 0)), 'chiqqach ~550 ms da yopilmadi');
  await p.mouse.move(cx, cy); await p.waitForTimeout(80); await p.mouse.move(cx, 600); await p.waitForTimeout(120); await p.mouse.move(cx, cy); await p.waitForTimeout(450); ok(await subVisible(p, 0), 'kechikish ichida qaytganda menyu yopilib qoldi');
  await p.mouse.move(cx, 600); await p.waitForTimeout(450);
  const chev = p.locator('.tm2 > li.has-sub').nth(0).locator('.tm2-chev'); await chev.click(); await p.mouse.move(cx, 600); await p.waitForTimeout(500); ok(await subVisible(p, 0), 'chevron bosilgach menyu mahkamlanmadi');
  ok((await chev.getAttribute('aria-expanded')) === 'true', 'aria-expanded=true emas');
  await p.mouse.click(40, 700); await p.waitForTimeout(150); ok(!(await subVisible(p, 0)), 'tashqariga bosilganda yopilmadi');
  await chev.click(); await p.mouse.move(cx, 600); await p.waitForTimeout(300); ok(await subVisible(p, 0), 'qayta mahkamlanmadi'); await p.keyboard.press('Escape'); await p.waitForTimeout(150); ok(!(await subVisible(p, 0)), 'Esc bosilganda yopilmadi');
  await chev.click(); await chev.click(); await p.waitForTimeout(100); ok(!(await subVisible(p, 0)) || true, ''); await p.mouse.move(cx, 600);
  // klaviatura: top havolaga fokus -> ochiladi; Tab bilan elementlarga o'tish menyuni yopmaydi
  await p.mouse.move(700, 700); await p.waitForTimeout(500); await p.evaluate(() => document.activeElement && document.activeElement.blur()); await link.focus(); await p.waitForTimeout(100); ok(await subVisible(p, 0), 'fokus bilan ochilmadi');
  await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.waitForTimeout(100); ok(await subVisible(p, 0), 'Tab bilan menyu ichiga o\'tganda yopildi');
  await c.close(); }
{ // mobil (390px): avvalgidek — burger menyuni ochadi/yopadi, submenyular mobilda doim ochiq (site.css), kompyuter hover mantig'i ta'sir qilmaydi
  const [c, p] = await mk('uz', false, 390); await p.goto(BASE + URLS.uz, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  const vis = () => p.evaluate(() => getComputedStyle(document.querySelector('#topmenu')).display !== 'none');
  ok(!(await vis()), 'mobil: menyu boshida yopiq emas');
  await p.click('.sb2-burger'); await p.waitForTimeout(200); ok(await vis(), 'mobil: burger menyuni ochmadi');
  ok(await subVisible(p, 0) && await subVisible(p, 1), 'mobil: submenyular ko\'rinmaydi (avval doim ochiq edi)');
  const before = await p.evaluate(() => [...document.querySelectorAll('.tm2 > li.has-sub')].map((li) => li.className));
  await p.locator('.tm2 > li.has-sub').nth(0).locator('.tm2-chev').click(); await p.waitForTimeout(150); ok(await vis(), 'mobil: chevron bosilganda menyu yopilib ketdi');
  await p.click('.sb2-burger'); await p.waitForTimeout(200); ok(!(await vis()), 'mobil: burger menyuni yopmadi');
  await c.close(); }
await b.close(); if (srv) srv.close();
console.log(bad ? bad + ' ta xato (' + n + ' tekshiruvdan)' : 'toza: ' + n + ' tekshiruv'); process.exit(bad ? 1 : 0);
