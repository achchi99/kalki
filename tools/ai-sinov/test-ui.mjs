// Brauzer sinovi: node tools/ai-sinov/test-ui.mjs [http://localhost:8788]  (wrangler pages dev ishlab turishi kerak)
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://localhost:8788';
const shot = (p, n) => p.screenshot({ path: path.join(dir, 'out', n), fullPage: false });
const NOTE = "Vaziyatni oddiy so'zlar bilan yozing. Ism, telefon va pasport ma'lumotini yozmang — ular kerak emas. Kalki matningizni saqlamaydi; u faqat ariza matnini tayyorlash uchun AI xizmatiga yuboriladi. AI qonun moddalari va raqamlarni qo'shmaydi — tayyor matnni o'qib, tekshirib chiqing.";
let ipn = 0; const RUN = Date.now() % 100000;
const log = (s) => console.log('OK  ' + s);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
let mode = null; // null = haqiqiy; {status, body} = soxta
await page.route('**/api/ariza', async (route) => {
  if (mode) return route.fulfill({ status: mode.status, contentType: 'application/json', body: JSON.stringify(mode.body) });
  if (mode === 'abort') return route.abort();
  await route.continue({ headers: { ...route.request().headers(), 'cf-connecting-ip': '10.2.' + RUN + '.' + (++ipn) } });
});
await page.goto(BASE + '/ariza-namunasi', { waitUntil: 'networkidle' });

// 1. blok ko'rinadi, izoh aynan shu matn
await page.waitForSelector('#aiAriza', { state: 'visible' });
await page.click('#aizMore');
assert.equal((await page.textContent('#aizNote')).trim(), NOTE);
assert.equal(await page.isVisible('#aizNote'), true);
assert.equal(await page.getAttribute('#aizIn', 'maxlength'), '500');
log('blok ko\'rinadi, izoh matni aynan to\'g\'ri, maxlength=500');
await shot(page, 'ui-desktop-1.png');

// 2. hisoblagich
await page.fill('#aizIn', "bolam 3 kun kasal bo'ldi, maktabga yozishim kerak");
assert.match(await page.textContent('#aizCnt'), /^49 \/ 500$/);
log('belgi hisoblagichi');

// 3. yuborish: "Yozilmoqda..." holati va qayta bosish bloklanadi
const respP = page.waitForResponse('**/api/ariza');
await page.click('#aizGo');
assert.equal((await page.textContent('#aizGo')).trim(), 'Yozilmoqda…');
assert.equal(await page.isDisabled('#aizGo'), true);
const resp = await respP;
assert.equal(resp.status(), 200);
await page.waitForFunction(() => document.getElementById('aizGo').textContent === 'Ariza matnini yozish');
const f1 = await page.inputValue('#dgf-erkinMatn');
assert.equal(await page.inputValue('#dgf-atype'), 'erkin');
assert.ok(f1.split(/\s+/).length >= 25, 'natija maydonga tushdi');
assert.ok((await page.textContent('#docBody')).includes(f1.split('\n')[0].slice(0, 30)), 'ko\'rik hujjatida ham');
assert.equal(await page.isVisible('#aizAgain'), true);
log('"Yozilmoqda...", natija #dgf-erkinMatn va ko\'rik hujjatiga tushdi (' + f1.split(/\s+/).length + ' so\'z)');
await shot(page, 'ui-desktop-2-natija.png');

// 4. nusxa olish
await page.click('#aizCopy');
await page.waitForFunction(() => document.getElementById('aizCopy').textContent === 'Nusxalandi');
assert.equal(await page.evaluate(() => navigator.clipboard.readText()), f1);
log('"Nusxa olish" yangi matnni nusxaladi');

// 5. almashtirish so'rovi (confirm() ishlatilmaydi)
page.on('dialog', () => { throw new Error('confirm/alert ishlatilgan'); });
await page.fill('#dgf-erkinMatn', f1 + ' MEN_YOZDIM');
await page.click('#aizAgain');
await page.waitForSelector('#aizAsk', { state: 'visible' });
assert.match(await page.textContent('#aizAsk'), /Joriy matn almashtirilsinmi\?/);
await page.click('#aizNo');
assert.equal(await page.inputValue('#dgf-erkinMatn'), f1 + ' MEN_YOZDIM');
log('"Yo\'q" — joriy matn saqlandi');
await page.click('#aizAgain');
await page.waitForSelector('#aizAsk', { state: 'visible' });
await page.click('#aizYes');
const f2 = await page.inputValue('#dgf-erkinMatn');
assert.ok(f2 && !f2.includes('MEN_YOZDIM'));
log('"Ha" — matn almashtirildi');

// 6. rad
await page.fill('#aizIn', "menga sevgi haqida she'r yozib ber");
await page.click('#aizGo');
await page.waitForFunction(() => /faqat ariza matnini yozadi/.test(document.getElementById('aizMsg').textContent));
assert.equal(await page.inputValue('#dgf-erkinMatn'), f2);
log('rad: xabar chiqdi, maydon o\'zgarmadi');

// 7. xatolar
for (const [m, txt] of [[{ status: 429, body: { xato: "Bugungi limit tugadi. Ertaga yana urinib ko'ring." } }, 'Bugungi limit tugadi'],
  [{ status: 502, body: { xato: "Hozircha matn tayyorlab bo'lmadi. Birozdan so'ng urinib ko'ring." } }, 'Hozircha matn tayyorlab bo\'lmadi']]) {
  mode = m; await page.click('#aizGo');
  await page.waitForFunction((t) => document.getElementById('aizMsg').textContent.includes(t), txt);
  assert.equal(await page.isDisabled('#aizGo'), false);
}
mode = 'abort'; await page.click('#aizGo');
await page.waitForFunction(() => /Hozircha matn tayyorlab bo'lmadi/.test(document.getElementById('aizMsg').textContent));
mode = null;
log('429 / 502 / tarmoq xatosi — inline xabar, tugma qayta ochiladi');
await page.fill('#aizIn', 'qisqa');
await page.click('#aizGo');
assert.match(await page.textContent('#aizMsg'), /10–500 belgi/);
log('qisqa kiritish — 400 xabari (so\'rovsiz)');

// 8. RU tugmasi RU sahifaga o'tkazadi — blok u yerda ko'rinmaydi
await page.click('#langRu');
await page.waitForURL(/\/ru\//);
await page.waitForLoadState('networkidle');
assert.equal(await page.evaluate(() => { var e = document.getElementById('aiAriza'); return !e || e.hidden || e.offsetParent === null; }), true);
await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
await ctx.clearCookies();
log('RU tugmasi: ' + new URL(page.url()).pathname + ' — blok ko\'rinmaydi');

// 9. 320px — gorizontal toshish yo'q
await page.setViewportSize({ width: 320, height: 700 });
await page.goto(BASE + '/ariza-namunasi', { waitUntil: 'networkidle' });
await page.fill('#aizIn', 'a'.repeat(500));
const m = await page.evaluate(() => {
  const b = document.getElementById('aiAriza').getBoundingClientRect();
  return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, r: b.right, l: b.left };
});
assert.ok(m.sw <= m.iw, 'sahifa toshdi: ' + JSON.stringify(m));
assert.ok(m.r <= m.iw && m.l >= 0, 'blok toshdi: ' + JSON.stringify(m));
await page.evaluate(() => document.getElementById('aiAriza').scrollIntoView());
await shot(page, 'ui-320.png');
log('320px: toshib ketmaydi ' + JSON.stringify(m));

// 10. RU / CYR sahifalarda blok ko'rinmaydi
for (const u of ['/ru/ariza-namunasi', '/cyr/ariza-namunasi']) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE + u, { waitUntil: 'networkidle' });
  assert.equal(await page.evaluate(() => { var e = document.getElementById('aiAriza'); return !e || e.hidden || e.offsetParent === null; }), true, u);
}
log('RU va CYR sahifalarda blok ko\'rinmaydi');

const real = errors.filter((e) => !/favicon|adsbygoogle|googletagmanager|net::ERR|Failed to load resource|429|502/.test(e));
assert.deepEqual(real, [], 'konsol xatolari: ' + real.join(' | '));
log('konsolda kutilmagan xato yo\'q');
await browser.close();
