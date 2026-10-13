// Production ko'rinish tekshiruvi (AI so'rovisiz): node tools/ai-sinov/test-prod-ui.mjs https://kalki.uz
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { track } from '../test-cleanup.cjs';
const P = process.argv[2];
const b = track(await chromium.launch());
const page = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
const hidden = () => page.evaluate(() => { const e = document.getElementById('aiAriza'); return !e || e.hidden || e.offsetParent === null; });
await page.goto(P + '/ariza-namunasi', { waitUntil: 'networkidle' });
await page.waitForSelector('#aiAriza', { state: 'visible' });
console.log('OK   UZ: blok ko\'rinadi, tugma: ' + (await page.textContent('#aizGo')));
await page.setViewportSize({ width: 320, height: 700 }); await page.reload({ waitUntil: 'networkidle' });
const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
assert.ok(m.sw <= m.iw); console.log('OK   320px toshmaydi', JSON.stringify(m));
await page.setViewportSize({ width: 1280, height: 900 });
for (const u of ['/ru/ariza-namunasi', '/cyr/ariza-namunasi']) { await page.goto(P + u, { waitUntil: 'networkidle' }); assert.equal(await hidden(), true, u); console.log('OK   ' + u + ': blok ko\'rinmaydi'); }
for (const u of ['/kredit-kalkulyator', '/oylik-soliq-kalkulyator', '/ipoteka-kalkulyator']) { await page.goto(P + u, { waitUntil: 'networkidle' }); assert.equal(await page.evaluate(() => document.querySelectorAll('h1').length > 0 && !document.getElementById('aiAriza')), true, u); console.log('OK   ' + u + ': ochiladi, blok yo\'q'); }
assert.deepEqual(errs.filter((e) => !/adsbygoogle|gtag|googletag/.test(e)), []); console.log('OK   JS xatolari yo\'q');
await b.close();
