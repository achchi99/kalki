// KalkiFit: birinchi ochilishda til tanlash ekrani (onboarding'dan oldin): faqat yangi + tili saqlanmagan + demo emas. node tools/dizayn/test-til-ekran.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs'; import { sld, sldVal } from './ob-yordam.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
async function mk(url, o = {}) {
  const c = await b.newContext({ locale: o.locale || 'en-US', viewport: { width: o.w || 390, height: o.h || 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((o2) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_intro_v2', '1'); if (o2.lang) localStorage.setItem('kalki_lang', o2.lang); if (o2.big) localStorage.setItem('kalki_fs', 'big'); } } catch (e) {} }, { lang: o.lang || null, big: !!o.big });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(700); return p; }
const lp = (p) => p.locator('#rzOnb.sl-lp').count();
const st = (p) => p.evaluate(() => ({ stored: localStorage.getItem('kalki_lang'), dl: document.documentElement.getAttribute('data-lang'), sc: document.documentElement.getAttribute('data-script'), q: (document.querySelector('#rzOnb .rz-q') || {}).textContent }));
const settle = async (p) => { await p.waitForLoadState('networkidle'); await p.waitForTimeout(900); };
try {
  /* 1. yangi foydalanuvchi: til ekrani onboarding'dan oldin; uch tugma o'z tilida, sarlavha uch tilda */
  let p = await mk('/kalkifit'); assert.equal(await lp(p), 1, 'til ekrani chiqdi'); assert.equal(await p.locator('#rzOnb .sl-lp-b').count(), 3);
  assert.deepEqual(await p.locator('#rzOnb .sl-lp-b').allInnerTexts(), ['O\u2018zbekcha (lotin)', 'Ўзбекча (кирилл)', 'Русский']);
  const t0 = (await p.locator('#rzOnb .sl-lp-t').innerText()).replace(/\s+/g, ' '); assert.match(t0, /Tilni tanlang/); assert.match(t0, /Тилни танланг/); assert.match(t0, /Выберите язык/); assert.doesNotMatch(await p.locator('body').innerText(), /halol|ҳалол/i);
  assert.equal((await st(p)).stored, null, 'tanlamaguncha hech narsa saqlanmaydi'); assert.equal(await p.locator('.sl-ob-lang').count(), 0, 'onboarding hali yo\'q');
  assert.ok(await p.evaluate(() => { const e = document.getElementById('rzOnb'); return e.scrollHeight <= e.clientHeight + 1 && document.documentElement.scrollWidth <= innerWidth; }), 'sig\'adi, skroll yo\'q');
  assert.ok((await p.locator('#rzOnb .sl-lp-b').evaluateAll((a) => a.map((x) => Math.round(x.getBoundingClientRect().height)))).every((h) => h >= 56), 'katta tugmalar');
  log('Yangi foydalanuvchi: til ekrani (3 katta tugma o\'z tilida, sarlavha uch tilda), hech narsa saqlanmagan, skrollsiz'); await p.context().close();
  /* 2. UZ tanlansa: joyida onboarding (lotin), saqlanadi, qayta ochilganda so'ralmaydi */
  p = await mk('/kalkifit'); await p.click('#rzOnb .sl-lp-b[data-l=uz]'); await p.waitForTimeout(500); let i = await st(p); assert.equal(i.stored, 'uz'); assert.equal(i.q, 'Jinsingiz?'); assert.equal(await lp(p), 0);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(600); assert.equal(await lp(p), 0, 'qayta so\'ralmaydi'); assert.equal((await st(p)).q, 'Jinsingiz?'); assert.deepEqual(p.errs, []); await p.context().close();
  log('UZ: saqlanadi, onboarding lotincha, qayta ochilganda til ekrani YO\'Q');
  /* 3. RU */
  p = await mk('/kalkifit'); await p.click('#rzOnb .sl-lp-b[data-l=ru]'); await p.waitForURL(/\/ru\/kalkifit/); await settle(p); i = await st(p); assert.equal(i.stored, 'ru'); assert.equal(i.dl, 'ru'); assert.equal(i.q, 'Ваш пол?'); assert.equal(await lp(p), 0);
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await settle(p); assert.equal(await lp(p), 0); assert.equal((await st(p)).dl, 'ru', '/kalkifit ham RU (saqlangan)'); await p.context().close();
  log('RU: /ru/kalkifit, saqlanadi, qayta so\'ralmaydi');
  /* 4. ЎЗ */
  p = await mk('/kalkifit'); await p.click('#rzOnb .sl-lp-b[data-l=cyr]'); await p.waitForURL(/lang=cyr/); await settle(p); i = await st(p); assert.equal(i.stored, 'cyr'); assert.equal(i.sc, 'cyr'); assert.match(i.q, /Жинсингиз\?/); assert.equal(await lp(p), 0);
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await settle(p); assert.equal(await lp(p), 0); assert.equal((await st(p)).sc, 'cyr'); await p.context().close();
  log('ЎЗ: ?lang=cyr, saqlanadi, qayta so\'ralmaydi');
  /* 5. telefon tili RU/ЎЗ bo'lsa ham ekran chiqadi; joriy til bilan bir xil tugma bosilsa ham saqlanadi */
  p = await mk('/kalkifit', { locale: 'ru-RU' }); assert.equal(await lp(p), 1); await p.click('#rzOnb .sl-lp-b[data-l=ru]'); await p.waitForFunction(() => /Ваш пол/.test((document.querySelector('#rzOnb .rz-q') || {}).textContent || ''), null, { timeout: 8000 }).catch(() => {}); i = await st(p); assert.equal(i.stored, 'ru', 'avto-til ham bosilganda saqlanadi');          // yukda 500 ms yetmasdi — savol chiqishini kutamiz assert.equal(i.q, 'Ваш пол?'); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); assert.equal(await lp(p), 0); await p.context().close();
  p = await mk('/kalkifit', { locale: 'uz-Cyrl-UZ' }); assert.equal(await lp(p), 1); await p.click('#rzOnb .sl-lp-b[data-l=cyr]'); await p.waitForTimeout(700); i = await st(p); assert.equal(i.stored, 'cyr'); assert.match(i.q, /Жинсингиз/); await p.context().close();
  log('Avto-til (ru / uz-Cyrl) turgan bo\'lsa ham tanlov bosilganda saqlanadi va qayta so\'ralmaydi');
  /* 6. chiqmaydigan holatlar: saqlangan til, ?lang=, /ru/ yo'li, demo, mavjud foydalanuvchi */
  for (const [u, o] of [['/kalkifit', { lang: 'uz' }], ['/kalkifit', { lang: 'ru' }], ['/kalkifit?lang=cyr', {}], ['/kalkifit?lang=uz', {}], ['/ru/kalkifit', {}], ['/kalkifit?demo=1', {}], ['/kalkifit?demo=1&intro=1', {}]]) {
    p = await mk(u, o); await p.waitForTimeout(400); assert.equal(await lp(p), 0, u + ' ' + JSON.stringify(o) + ': til ekrani chiqmasin'); await p.context().close(); }
  const S = (await import(ROOT + '/assets/kalkifit-core.js')).default || (await import(ROOT + '/assets/kalkifit-core.js'));
  const old = S.emptyState ? S.emptyState() : null; if (old) { old.setup = true; old.created = Date.now() - 5 * 864e5; old.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; old.prefs = { tipsDone: true, introDone: true };
    const c = await b.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block' }); await c.addInitScript((j) => { try { localStorage.setItem('kalki_fit', j); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); } catch (e) {} }, JSON.stringify(old));
    p = await c.newPage(); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort()); await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(700); assert.equal(await lp(p), 0, 'mavjud foydalanuvchi: til ekrani YO\'Q'); assert.equal(await p.locator('#rzOnb:not([hidden])').count(), 0); await c.close(); }
  log('Til ekrani chiqmaydi: saqlangan til, ?lang=, /ru/, ?demo=1, ?demo=1&intro=1, mavjud (setup) foydalanuvchi');
  /* 7. onboarding til tugmasi ishlayveradi, 360×640 + katta shrift: til ekrani sig'adi */
  p = await mk('/kalkifit', { w: 360, h: 640, big: true }); assert.equal(await lp(p), 1); assert.ok(await p.evaluate(() => { const e = document.getElementById('rzOnb'); const r = [...e.querySelectorAll('.sl-lp-b')].map((x) => x.getBoundingClientRect()); return e.scrollHeight <= e.clientHeight + 1 && document.documentElement.scrollWidth <= innerWidth && r.every((x) => x.bottom <= innerHeight && x.top >= 0); }), '360×640 katta shrift: sig\'adi'); await p.click('#rzOnb .sl-lp-b[data-l=uz]'); await p.waitForTimeout(500); assert.equal(await p.locator('#rzOnb .sl-ob-lang button').count(), 3, 'keyin onboarding til tugmasi bor'); await p.context().close();
  log('360×640 + katta shrift: til ekrani sig\'adi; tanlagandan keyin onboarding va uning til tugmasi');
  console.log('\nTil ekrani: ' + n + ' tekshiruv OK');
} finally { await b.close().catch(() => {}); srv.close(); }
