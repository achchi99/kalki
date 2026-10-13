// RU/UZ AI blok UI sinovi (wrangler pages dev, jonli Haiku): node tools/ai-sinov/test-ru-ui.mjs [http://localhost:8799]
import { chromium } from 'playwright'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { track } from '../test-cleanup.cjs';
const dir = path.dirname(fileURLToPath(import.meta.url)); const BASE = process.argv[2] || 'http://localhost:8799';
let IPN = 0;
const b = track(await chromium.launch()); const res = [];
const T = (ok, name, info = '') => { res.push(ok); console.log((ok ? 'OK   ' : 'YIQILDI ') + name + (info ? ' — ' + info : '')); };
async function open(url, w = 1280) { const c = await b.newContext({ viewport: { width: w, height: 900 }, serviceWorkers: 'block', extraHTTPHeaders: { 'CF-Connecting-IP': '10.99.' + (Date.now() % 250) + '.' + (++IPN) } }); const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|t\.me/, (r) => r.abort()); await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(700); return { c, p, errs }; }
// --- RU sahifa ---
{ const { c, p, errs } = await open('/ru/ariza-namunasi'); const sec = p.locator('#aiAriza');
  T(await sec.isVisible(), 'RU: AI blok ko\'rinadi');
  const txt = await sec.innerText(); T(/AI напишет заявление/.test(txt) && /новое/i.test(txt) && !/Lotincha|Yozuv|Ariza matnini/.test(txt), 'RU: matnlar ruscha, o\'zbekcha qoldiq yo\'q', txt.replace(/\s+/g, ' ').slice(0, 90));
  T(!(await p.locator('#aiAriza .aiz-ctl').isVisible()), 'RU: Lotin/Kirill tugmasi ko\'rinmaydi');
  T(await p.locator('#aizIn').getAttribute('placeholder').then((x) => /Например/.test(x)), 'RU: placeholder ruscha');
  await p.locator('.aiz-chip').first().click(); T((await p.inputValue('#aizIn')).startsWith('ребёнок заболел'), 'RU: chip matni ruscha');
  await p.fill('#aizIn', 'хочу взять отпуск за свой счёт на 3 дня, нужно срочно уехать по семейным делам');
  const req = p.waitForRequest((r) => r.url().endsWith('/api/ariza')); await p.click('#aizGo'); const rq = await req; const body = JSON.parse(rq.postData());
  T(body.til === 'ru' && body.yozuv === undefined && body.vaziyat.length > 10, 'RU: so\'rovda til:"ru", yozuv yo\'q', JSON.stringify({ til: body.til, yozuv: body.yozuv, turi: body.turi }));
  await p.waitForSelector('#aizMsg.ok', { timeout: 20000 }).catch(() => {}); const msg = await p.locator('#aizMsg').innerText();
  const ta = await p.inputValue('#dgf-erkinMatn').catch(() => ''); T(/Текст готов/.test(msg) && ta.length > 60 && !/[A-Za-z]/.test(ta), 'RU: matn formaga qo\'yildi, xabar ruscha', msg.slice(0, 60) + ' | ' + ta.slice(0, 50));
  const prev = await p.locator('#docPreview, #docBody').first().innerText().catch(() => ''); T(/ЗАЯВЛЕНИЕ/.test(prev) && prev.includes(ta.slice(0, 30)), 'RU: hujjat ko\'rinishida ЗАЯВЛЕНИЕ + AI matni', prev.replace(/\s+/g, ' ').slice(0, 80));
  await p.locator('#aizMore').click(); T(/Закрыть/.test(await p.locator('#aizMore').innerText()) && /Kalki не сохраняет/.test(await p.locator('#aizNote').innerText()), 'RU: "Подробнее" ochiladi');
  await p.screenshot({ path: path.join(dir, 'out', 'ru-ui-1280.png'), fullPage: false }); T(errs.length === 0, 'RU: JS xatosi yo\'q', errs.join(' | ')); await c.close(); }
{ const { c, p, errs } = await open('/ru/ariza-namunasi', 390); const sec = p.locator('#aiAriza'); await sec.scrollIntoViewIfNeeded();
  const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })); T(m.sw <= m.iw, 'RU 390px: gorizontal toshmaydi', JSON.stringify(m));
  await sec.screenshot({ path: path.join(dir, 'out', 'ru-ui-390.png') }); await c.close(); }
// --- UZ sahifa (regressiya) va til almashtirish ---
{ const { c, p, errs } = await open('/ariza-namunasi'); const sec = p.locator('#aiAriza');
  const txt = await sec.innerText(); T(await sec.isVisible() && /AI ariza yozib beradi/.test(txt) && /Lotincha/.test(txt), 'UZ: blok va Lotin/Kirill tugmasi avvalgidek', txt.replace(/\s+/g, ' ').slice(0, 70));
  await p.fill('#aizIn', "bolam 3 kun kasal bo'ldi, maktabga yozishim kerak"); const req = p.waitForRequest((r) => r.url().endsWith('/api/ariza')); await p.click('#aizGo'); const body = JSON.parse((await req).postData());
  T(body.til === undefined && body.yozuv === 'lotin', 'UZ: so\'rovda til yo\'q, yozuv:"lotin"', JSON.stringify({ til: body.til, yozuv: body.yozuv }));
  await p.waitForSelector('#aizMsg.ok', { timeout: 20000 }).catch(() => {}); T(/Matn tayyor/.test(await p.locator('#aizMsg').innerText()), 'UZ: matn tayyor');
  await p.click('#langRu'); await p.waitForTimeout(600); const t2 = await sec.innerText(); T(await sec.isVisible() && /AI напишет заявление/.test(t2) && !/Lotincha/.test(t2), 'UZ sahifada RU tugmasi: blok ruscha bo\'ladi', t2.replace(/\s+/g, ' ').slice(0, 60));
  await p.click('#langUz'); await p.waitForTimeout(600); T(/AI ariza yozib beradi/.test(await sec.innerText()), 'UZ ga qaytganda o\'zbekcha'); T(errs.length === 0, 'UZ: JS xatosi yo\'q', errs.join(' | ')); await c.close(); }
// --- CYR: blok yo'q ---
{ const { c, p } = await open('/cyr/ariza-namunasi'); T(!(await p.locator('#aiAriza').count()), 'CYR: AI blok yo\'q'); await c.close(); }
await b.close(); process.exit(res.every(Boolean) ? 0 : 1);
