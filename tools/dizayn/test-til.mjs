// KalkiFit tili: (1) birinchi ochilishda telefon/brauzer tiliga qarab (ru* → RU, uz-Cyrl → ЎЗ, qolgani → UZ), oldin tanlangan til qoladi, faqat KalkiFit (+ /ilova) uchun;
// (2) onboarding'ning har ekranida UZ · ЎЗ · RU tugmasi: joriy ekran darhol shu tilga o'tadi, kiritilgan qiymatlar (jins, yosh, bo'y, vazn…) yo'qolmaydi, natija ekrani ham qayta chiziladi.   node tools/dizayn/test-til.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs'; import { sld, sldVal } from './ob-yordam.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
async function mk(url, o = {}) {
  const c = await b.newContext({ locale: o.locale || 'en-US', viewport: { width: o.w || 390, height: o.h || 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((o2) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); if (o2.lang) localStorage.setItem('kalki_lang', o2.lang); } } catch (e) {} }, { lang: o.lang || null });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(700); return p; }
const info = (p) => p.evaluate(() => ({ lang: document.documentElement.lang, dl: document.documentElement.getAttribute('data-lang'), sc: document.documentElement.getAttribute('data-script'), path: location.pathname + location.search, q: (document.querySelector('#rzOnb .rz-q') || {}).textContent || '', stored: localStorage.getItem('kalki_lang') }));
const settle = async (p) => { await p.waitForLoadState('networkidle'); await p.waitForTimeout(900); };
try {
  /* 1. birinchi ochilish: telefon tili */
  let p = await mk('/kalkifit', { locale: 'ru-RU' }); let i = await info(p); assert.equal(i.dl, 'ru'); assert.equal(i.q, 'Ваш пол?'); assert.equal(i.stored, null, 'avtomatik tanlov SAQLANMAYDI (foydalanuvchi o\'zi tanlagach saqlanadi)'); await p.context().close();
  p = await mk('/kalkifit', { locale: 'ru' }); assert.equal((await info(p)).dl, 'ru'); await p.context().close();
  p = await mk('/kalkifit', { locale: 'uz-Cyrl-UZ' }); i = await info(p); assert.equal(i.sc, 'cyr'); assert.equal(i.dl, 'uz'); assert.match(i.q, /Жинсингиз\?/); await p.context().close();
  for (const loc of ['en-US', 'uz-UZ', 'uz', 'tr-TR', 'de-DE']) { p = await mk('/kalkifit', { locale: loc }); i = await info(p); assert.equal(i.dl, 'uz', loc); assert.equal(i.sc, null, loc); assert.equal(i.q, 'Jinsingiz?', loc); await p.context().close(); }
  log('Birinchi ochilish: ru* → RU, uz-Cyrl → ЎЗ, uz/en/tr/de → UZ (lotin); avtomatik natija saqlanmaydi');
  /* 2. oldin tanlangan til qoladi */
  p = await mk('/kalkifit', { locale: 'ru-RU', lang: 'uz' }); assert.equal((await info(p)).q, 'Jinsingiz?', 'RU telefon, lekin UZ tanlangan → UZ'); await p.context().close();
  p = await mk('/kalkifit', { locale: 'en-US', lang: 'ru' }); assert.equal((await info(p)).dl, 'ru'); await p.context().close();
  p = await mk('/kalkifit', { locale: 'en-US', lang: 'cyr' }); assert.equal((await info(p)).sc, 'cyr'); await p.context().close();
  p = await mk('/kalkifit?lang=uz', { locale: 'ru-RU' }); assert.equal((await info(p)).q, 'Jinsingiz?', '?lang= tanlovi telefon tilidan ustun'); await p.context().close();
  p = await mk('/ru/kalkifit', { locale: 'en-US' }); assert.equal((await info(p)).dl, 'ru'); await p.context().close();
  log('Oldin tanlangan til (saqlangan, ?lang=, /ru/ yo\'li) telefon tilidan ustun');
  /* 3. faqat KalkiFit (+ /ilova): qolgan sahifalar avvalgidek (birinchi tashrifda avtomatik RU YO'Q — lang.js qoidasi) */
  p = await mk('/kaloriya-kalkulyator', { locale: 'ru-RU' }); i = await info(p); assert.equal(i.dl, 'uz', 'boshqa sahifalarda avtomatik til yo\'q'); await p.context().close();
  p = await mk('/ilova/', { locale: 'ru-RU' }); assert.equal(await p.evaluate(() => document.querySelector('h1').textContent), 'Приложение KalkiFit для Android'); await p.context().close();
  p = await mk('/ilova/', { locale: 'uz-Cyrl' }); assert.match(await p.evaluate(() => document.querySelector('h1').textContent), /илова/i); await p.context().close();
  p = await mk('/ilova/', { locale: 'en-US' }); assert.equal(await p.evaluate(() => document.querySelector('h1').textContent), 'KalkiFit Android ilovasi'); await p.context().close();
  log('Avto-til faqat KalkiFit va /ilova uchun; boshqa sahifalar o\'zgarmagan');
  /* 4. onboarding til tugmasi: ko'rinishi (har ekranda), joriy holat */
  p = await mk('/kalkifit', { locale: 'en-US' }); const seg = async () => p.evaluate(() => [...document.querySelectorAll('#rzOnb .sl-ob-lang button')].map((x) => [x.textContent, x.getAttribute('aria-pressed'), Math.round(x.getBoundingClientRect().height)]));
  assert.deepEqual((await seg()).map((x) => x.slice(0, 2)), [['UZ', 'true'], ['ЎЗ', 'false'], ['RU', 'false']], '1-ekranda UZ · ЎЗ · RU, joriy — UZ'); assert.ok((await seg()).every((x) => x[2] >= 40), 'tugma ≥40 px');
  assert.equal(await p.locator('#rzOnb .sl-ob-top').getAttribute('data-cyr'), 'skip', 'tugmalar tarjimaga tegilmaydi'); assert.ok(await p.evaluate(() => { const r = document.querySelector('#rzOnb .sl-ob-lang').getBoundingClientRect(); return r.top < 80 && r.right <= innerWidth; }), 'tepada');
  await p.click('[data-act=obsex][data-v=f]'); for (const step of [2, 3, 4, 5, 6, 7]) { await p.click('[data-act=obnext]'); await p.waitForTimeout(90); if (step === 5) await p.click('[data-act=obact][data-v="3"]'); if (step === 6) await p.click('[data-act=obgoal][data-v=keep]'); assert.equal(await p.locator('#rzOnb .sl-ob-lang button').count(), 3, step + '-ekranda ham til tugmasi bor'); }
  await p.click('[data-act=obnext]'); await p.waitForTimeout(500); assert.equal(await p.locator('#obTarget').count(), 1, 'natija ekrani'); assert.equal(await p.locator('#rzOnb .sl-ob-lang button').count(), 3, 'natija ekranida ham'); await p.context().close();
  log('Til tugmasi UZ · ЎЗ · RU onboarding\'ning har ekranida (1–8, natija ham): tepada, ≥40 px, tarjimaga tegilmaydi');
  /* 5. UZ → RU → ЎЗ → UZ: qiymatlar saqlanadi (sahifa qayta yuklanadi — sessionStorage orqali tiklanadi) */
  p = await mk('/kalkifit', { locale: 'en-US' }); await p.click('[data-act=obsex][data-v=f]'); await p.click('[data-act=obnext]'); await sld(p, 'obAge', 41); assert.equal(await sldVal(p, 'obAge'), '41');
  await p.click('#rzOnb [data-act=oblang][data-l=ru]'); await p.waitForURL(/\/ru\/kalkifit/); await settle(p); i = await info(p); assert.equal(i.dl, 'ru'); assert.equal(i.q, 'Сколько вам лет?'); assert.equal(await sldVal(p, 'obAge'), '41', 'yosh saqlandi (RU)'); assert.deepEqual((await seg()).map((x) => x.slice(0, 2)), [['UZ', 'false'], ['ЎЗ', 'false'], ['RU', 'true']]);
  await p.click('[data-act=obnext]'); await sld(p, 'obHeight', 168); await p.click('#rzOnb [data-act=oblang][data-l=cyr]'); await p.waitForURL(/lang=cyr/); await settle(p); i = await info(p); assert.equal(i.sc, 'cyr'); assert.match(i.q, /Бўйингиз/); assert.equal(await sldVal(p, 'obHeight'), '168', 'bo\'y saqlandi (ЎЗ)'); assert.equal(await p.locator('#rzOnb .sl-ob-lang button[aria-pressed=true]').innerText(), 'ЎЗ');
  await p.click('#rzOnb [data-act=oblang][data-l=uz]'); await p.waitForURL((u) => !/lang=cyr/.test(u.href) && !/\/ru\//.test(u.pathname)); await settle(p); i = await info(p); assert.equal(i.sc, null); assert.equal(i.q, "Bo'yingiz necha sm?"); assert.equal(await sldVal(p, 'obHeight'), '168', 'bo\'y saqlandi (UZ)');
  await p.click('[data-act=obback]'); await p.waitForTimeout(150); assert.equal(await sldVal(p, 'obAge'), '41', 'orqaga: yosh hamon 41'); assert.deepEqual(p.errs, []); await p.context().close();
  log('UZ → RU → ЎЗ → UZ: joriy ekran yangi tilda, kiritilgan jins/yosh/bo\'y yo\'qolmaydi (sahifa qayta yuklanganda ham tiklanadi), qadam o\'sha joyda');
  /* 6. natija ekrani ham qayta chiziladi */
  p = await mk('/kalkifit', { locale: 'en-US' }); await p.click('[data-act=obsex][data-v=m]'); await p.click('[data-act=obnext]'); await sld(p, 'obAge', 35); await p.click('[data-act=obnext]'); await sld(p, 'obHeight', 180); await p.click('[data-act=obnext]'); await sld(p, 'obWeight', 82); await p.click('[data-act=obnext]');
  await p.click('[data-act=obact][data-v="3"]'); await p.click('[data-act=obnext]'); await p.click('[data-act=obgoal][data-v=keep]'); await p.click('[data-act=obnext]'); await p.click('[data-act=obnext]'); await p.waitForSelector('#obTarget'); await p.waitForTimeout(1000);
  const tgt = await p.locator('#obTarget').innerText(); assert.match(await txt(p, '#rzOnb .sl-res7'), /Kunlik me'yoringiz/i);
  await p.click('#rzOnb [data-act=oblang][data-l=ru]'); await p.waitForURL(/\/ru\/kalkifit/); await settle(p); await p.waitForSelector('#obTarget'); await p.waitForTimeout(1000); assert.match(await txt(p, '#rzOnb .sl-res7'), /дневная норма/i, 'natija ekrani RU'); assert.equal(await p.locator('#obTarget').innerText(), tgt, 'me\'yor raqami o\'zgarmadi');
  await p.click('#rzOnb [data-act=oblang][data-l=cyr]'); await p.waitForURL(/lang=cyr/); await settle(p); await p.waitForSelector('#obTarget'); await p.waitForTimeout(1000); assert.match(await txt(p, '#rzOnb .sl-res7'), /кунлик меъёрингиз/i, 'natija ekrani ЎЗ'); assert.equal(await p.locator('#obTarget').innerText(), tgt); assert.deepEqual(p.errs, []); await p.context().close();
  log('Natija ekrani ham qayta chiziladi (UZ → RU → ЎЗ): me\'yor raqami bir xil, matn yangi tilda');
  /* 7. RU telefon: /kalkifit'da RU (sahifa o'zgarmaydi) → UZ ga joyida o'tadi (qayta yuklashsiz), qiymatlar saqlanadi */
  p = await mk('/kalkifit', { locale: 'ru-RU' }); await p.click('[data-act=obsex][data-v=m]'); await p.click('[data-act=obnext]'); await sld(p, 'obAge', 52); await p.evaluate(() => { window.__same = 1; });
  await p.click('#rzOnb [data-act=oblang][data-l=uz]'); await p.waitForTimeout(900); i = await info(p); assert.equal(i.dl, 'uz'); assert.equal(i.q, 'Yoshingiz nechida?'); assert.equal(await sldVal(p, 'obAge'), '52'); assert.equal(await p.evaluate(() => window.__same), 1, 'sahifa qayta yuklanmadi — darhol'); assert.equal(i.stored, 'uz', 'foydalanuvchi tanlovi saqlandi');
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(600); assert.equal((await info(p)).dl, 'uz', 'qayta ochilganda tanlangan til qoladi (RU telefon bo\'lsa ham)'); await p.context().close();
  log('RU telefon: avtomatik RU; UZ tugmasi — darhol (qayta yuklashsiz), qiymat saqlanadi; tanlov keyingi ochilishda ham qoladi');
  /* 8. 360 px va katta shrift: tugmalar sig'adi */
  p = await mk('/kalkifit', { locale: 'en-US', w: 360, h: 640 }); await p.evaluate(() => document.documentElement.classList.add('fs-big')); await p.click('[data-act=obsex][data-v=m]'); await p.waitForTimeout(200);
  assert.ok(await p.evaluate(() => { const o = document.getElementById('rzOnb'), l = o.querySelector('.sl-ob-lang').getBoundingClientRect(), f = o.querySelector('.sl-ob-foot').getBoundingClientRect(); return l.right <= innerWidth && l.left >= 0 && f.bottom <= innerHeight + 1 && document.documentElement.scrollWidth <= innerWidth + 1; }), '360 px + katta shrift: sig\'adi'); await p.context().close();
  log('360×640 + katta shrift: til tugmasi va tugmalar sig\'adi, gorizontal skroll yo\'q');
  console.log('\nTil: ' + n + ' tekshiruv OK');
} finally { await b.close().catch(() => {}); srv.close(); }
async function txt(p, s) { return (await p.locator(s).first().innerText()).replace(/\s+/g, ' '); }
