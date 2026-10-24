// KalkiFit tanishtiruvi (v32): birinchi ochilishda til tanlangandan KEYIN, profil savollaridan OLDIN — 3 ekran (bitta katta jonli rasm + 1 jumla),
// «O'tkazib yuborish» har ekranda; bir marta (kalki_intro_v2); mavjud foydalanuvchiga avtomatik chiqmaydi; Profil → «Tanishtiruvni qayta ko'rish»; UZ/ЎЗ/RU; Android/veb 2-ekran jumlasi.
//   node tools/dizayn/test-kalkifit-tanishtiruv.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const T0 = S.dates.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const QM = () => { window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: [{ name: 'Qadam', methods: [] }], addListener: () => ({ remove() {} }), nativePromise: (pl, m) => pl === 'Qadam' && m === 'isAvailable' ? Promise.resolve({ available: true, granted: false }) : Promise.resolve({}) }; };
async function open({ lang = 'uz', st = null, seen = false, app = false, url } = {}) {
  const c = await b.newContext({ viewport: { width: 360, height: 760 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((o) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.clear(); if (o.lang) localStorage.setItem('kalki_lang', o.lang); if (o.st) localStorage.setItem('kalki_fit', JSON.stringify(o.st)); if (o.seen) localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); } } catch (e) {} }, { lang, st, seen });
  if (app) await c.addInitScript(QM);
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.goto(BASE + (url || (lang === 'ru' ? '/ru/kalkifit' : lang === 'cyr' ? '/kalkifit?lang=cyr' : '/kalkifit')), { waitUntil: 'networkidle' }); await p.waitForTimeout(600); return p;
}
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
const vis = (p, s) => p.locator(s).first().isVisible().catch(() => false);
function user() { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 5 * 864e5; st.prefs = { yemayK: 1 }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; S.addWeight(st, T0, 80); return st; }
try {
  /* 1. yangi foydalanuvchi (UZ, veb): til tanlangan → 3 ekran → profil savollari */
  let p = await open(); assert.ok(await vis(p, '#rzIntro .in-body'), 'tanishtiruv ochildi'); assert.equal(await vis(p, '#rzOnb .sl-ob-body'), false, 'profil savollari hali yo\'q');
  const H = [], A = [];
  for (let i = 0; i < 3; i++) { H.push(await txt(p, '#inH')); A.push(await p.locator('#rzIntro .in-art .in-a').count()); if (i === 0) assert.equal(await p.locator('#rzIntro .in-c').count(), 3, '1-ekran: ovoz · rasm · menyu'); assert.ok(await vis(p, '#rzIntro [data-act=inskip]'), 'har ekranda «O\'tkazib yuborish»'); assert.equal(await p.locator('#rzIntro .in-p').count(), 0, 'bitta jumla (qo\'shimcha matn yo\'q)'); if (i < 2) await p.click('#rzIntro [data-act=innext]'); }
  assert.deepEqual(H, ['Nima yeganingizni ayting yoki suratga oling', "Choy, sharbat va sho'rva ham suvga o'zi qo'shiladi", 'Har yakshanba: Haftangiz']); assert.deepEqual(A, [1, 1, 1], 'har ekranda bitta katta rasm');
  await p.click('#rzIntro [data-act=ingo]'); await p.waitForTimeout(400);
  assert.equal(await vis(p, '#rzIntro .in-body'), false); assert.ok(await vis(p, '#rzOnb .sl-ob-body'), 'keyin — profil savollari'); assert.equal(await p.evaluate(() => localStorage.getItem('kalki_intro_v2')), '1'); assert.deepEqual(p.errs, []);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); assert.equal(await vis(p, '#rzIntro .in-body'), false, 'qayta ochilganda chiqmaydi'); assert.ok(await vis(p, '#rzOnb .sl-ob-body')); await p.context().close();
  log('Yangi foydalanuvchi: til → tanishtiruv (3 ekran, har birida bitta rasm + 1 jumla, «O\'tkazib yuborish») → profil savollari; bir marta');
  /* 2. «O'tkazib yuborish» 1-ekranda; Android ilovada 2-ekran — qadam */
  p = await open({ app: true }); await p.click('#rzIntro [data-act=innext]'); assert.equal(await txt(p, '#inH'), "Qadamlar va suv o'zi hisoblanadi"); assert.equal(await p.locator('#rzIntro .in-st').count(), 1, 'qadam halqasi');
  await p.click('#rzIntro [data-act=inskip]'); await p.waitForTimeout(400); assert.equal(await vis(p, '#rzIntro .in-body'), false); assert.ok(await vis(p, '#rzOnb .sl-ob-body')); await p.context().close();
  log('Android ilovada 2-ekran: «Qadamlar va suv o\'zi hisoblanadi» (qadam halqasi); «O\'tkazib yuborish» darhol profil savollariga');
  /* 3. RU va ЎЗ */
  p = await open({ lang: 'ru' }); assert.equal(await txt(p, '#inH'), 'Скажите или сфотографируйте, что вы съели'); assert.equal(await txt(p, '#rzIntro [data-act=inskip]'), 'Пропустить'); await p.click('#rzIntro [data-act=innext]'); await p.click('#rzIntro [data-act=innext]'); assert.equal(await txt(p, '#inH'), 'Каждое воскресенье — «Ваша неделя»'); await p.context().close();
  p = await open({ lang: 'cyr' }); assert.equal(await txt(p, '#inH'), 'Нима еганингизни айтинг ёки суратга олинг'); assert.equal(await txt(p, '#rzIntro [data-act=inskip]'), "Ўтказиб юбориш"); await p.context().close();
  log('RU: «Скажите или сфотографируйте, что вы съели» … «Каждое воскресенье — «Ваша неделя»»; ЎЗ — translit');
  /* 4. til hali tanlanmagan — avval til ekrani */
  p = await open({ lang: null }); assert.ok(await vis(p, '.sl-lp [data-act=lppick]'), 'til ekrani birinchi'); assert.equal(await vis(p, '#rzIntro .in-body'), false); await p.click('.sl-lp [data-act=lppick][data-l=uz]'); await p.waitForTimeout(600); assert.ok(await vis(p, '#rzIntro .in-body'), 'til tanlangach — tanishtiruv'); await p.context().close();
  log('Til tanlanmagan bo\'lsa: avval til ekrani, keyin tanishtiruv');
  /* 5. mavjud foydalanuvchi: avtomatik yo'q; Profil → «Tanishtiruvni qayta ko'rish» */
  p = await open({ st: user() }); assert.equal(await vis(p, '#rzIntro .in-body'), false, 'mavjud foydalanuvchiga avtomatik chiqmaydi'); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(400);
  assert.match(await txt(p, '[data-act=intro]'), /Tanishtiruvni qayta ko'rish/); await p.click('[data-act=intro]'); await p.waitForTimeout(300); assert.ok(await vis(p, '#rzIntro .in-body')); await p.keyboard.press('Escape'); await p.waitForTimeout(300); assert.equal(await vis(p, '#rzIntro .in-body'), false, 'Escape yopadi'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Mavjud foydalanuvchiga avtomatik chiqmaydi; Profil → «Tanishtiruvni qayta ko\'rish» ochadi, Escape yopadi');
  console.log('\n' + n + '/' + n + ' OK');
} finally { await b.close(); srv.close(); }
