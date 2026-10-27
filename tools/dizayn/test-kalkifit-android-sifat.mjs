// KalkiFit Android ilovasi sifati (sinovchi skrinshotlari bo'yicha, v22): Capacitor mock bilan —
//  1) ochilganda avtomatik qayta yuklanish YO'Q (service worker yangilansa ham; oddiy sahifada esa avvalgidek), 2) ilova ichida o'rnatish/«brauzerda oching» takliflari yo'q,
//  3) tashqi havolalar tizim brauzerida (AppLauncher), KalkiFit havolalari ichida, 4) hazil: yoqilganda Bugun'da kuniga kamida bitta, o'chirilganda yo'q, faqat ✕ yopadi,
//  5) rasm/AI yozuvi bazadagi taomga mos kelsa — o'sha ikonka, 6) avtomatik qadam: «+ Qo'shish» yo'q, manba nomi, bosilsa jami, qo'lda kiritish yo'q; vebda qadam kartasi yo'q,
//  7) ortiqcha matnlar: «uzun bosing» doimiy matni yo'q (bir martalik maslahat), bo'sh ovqat kartasida «Hali yozilmadi» yo'q, «Kunni yakunlash» kechqurun yoki 2+ yozuvda.
//   node tools/dizayn/test-kalkifit-android-sifat.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates;
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const T0 = D.today(), UA_WV = 'Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UQ1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0 Mobile Safari/537.36';
function seed(o = {}) {
  const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 86400000; st.prefs = Object.assign({ tipsDone: true, yemayAsked: 1 }, o.prefs || {}); st.profile = { sex: 'm', preg: false, age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: null }; st.trackStart = D.addDays(T0, -14); S.addWeight(st, T0, 80);
  (o.entries || []).forEach((e, i) => S.addFood(st, T0, Object.assign({ meal: 'l', ts: i + 1, p: 5, f: 5, c: 20, est: false }, e))); return st;
}
const MOCK = (o) => { const L = window.__nat = { calls: [] }; window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: ['LocalNotifications', 'Share', 'Filesystem', 'Camera', 'Haptics', 'AppLauncher', 'SplashScreen', 'App'].concat(o.qadam ? ['Qadam'] : []).map((name) => ({ name, methods: [] })),
  nativePromise: (pl, m, a) => { L.calls.push([pl, m, JSON.parse(JSON.stringify(a || {}))]); if (pl === 'Qadam' && m === 'isAvailable') return Promise.resolve(o.qadam); if (pl === 'Qadam' && m === 'getDays') return Promise.resolve({ kunlar: o.days || [] }); return Promise.resolve({}); }, addListener: () => ({ remove() {} }) }; };
async function open(url, { state, app = false, qadam = null, days, hour = null, sw = false, w = 390 } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: sw ? 'allow' : 'block', userAgent: app ? UA_WV : undefined });
  await c.addInitScript((x) => { try { if (x.state && !localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.state)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1');
    if (x.hour != null) { const R = Date; const off = new R(new R().setHours(x.hour, 5, 0, 0)).getTime() - R.now(); class D2 extends R { constructor(...a) { if (a.length === 0) super(R.now() + off); else super(...a); } static now() { return R.now() + off; } } window.Date = D2; } } catch (e) {} }, { state, hour });
  if (app) await c.addInitScript(MOCK, { qadam, days });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e)));
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(900); return p;
}
const txt = async (p, sel) => { const l = p.locator(sel).first(); return (await l.count()) ? (await l.innerText()).replace(/\s+/g, ' ').trim() : null; };
const calls = (p, pl, m) => p.evaluate(([a, b2]) => window.__nat.calls.filter((x) => x[0] === a && x[1] === b2).map((x) => x[2]), [pl, m]);
try {
  /* 1. qayta yuklanish */
  let p = await open('/kalkifit', { state: seed(), app: true, sw: true });
  assert.equal(await p.evaluate(() => !!(window.KalkiSW && KalkiSW.isQuiet())), true, 'ilova sw-boot\'ni «jim» rejimga o\'tkazdi');
  await p.evaluate(() => { window.__mark = 1; const e = navigator.serviceWorker; e.dispatchEvent(new Event('controllerchange')); e.dispatchEvent(new Event('controllerchange')); }); await p.waitForTimeout(1500);
  assert.equal(await p.evaluate(() => window.__mark), 1, 'service worker almashsa ham sahifa qayta yuklanmadi'); assert.equal(await p.locator('#sw-update-bar').count(), 0, 'chiziq ham yo\'q'); await p.context().close();
  p = await open('/kredit-kalkulyator', { sw: true }); await p.evaluate(() => { window.__mark = 1; const e = navigator.serviceWorker; e.dispatchEvent(new Event('controllerchange')); e.dispatchEvent(new Event('controllerchange')); }); await p.waitForTimeout(2500);
  assert.equal(await p.evaluate(() => window.__mark), undefined, 'oddiy sahifada (tegilmagan) — avvalgidek qayta yuklanadi'); await p.context().close();
  log('Ilova ochilganda avtomatik qayta yuklanish yo\'q (service worker almashsa ham, chiziq ham yo\'q — yangi versiya keyingi ochilishda); oddiy sahifalarda avvalgi xatti-harakat');
  /* 2. o'rnatish takliflari */
  p = await open('/kalkifit', { state: seed({ entries: [{ fid: 'osh', unit: 'likop', qty: 1, g: 300, kcal: 500 }] }), app: true });
  assert.equal(await p.locator('[data-inst]').count(), 0, 'Bugun: o\'rnatish kartasi yo\'q'); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500);
  const prof = await txt(p, '#rzMain'); assert.equal(await p.locator('[data-inst], [data-act=instopen], [data-act=apk]').count(), 0, 'Profil: o\'rnatish/yuklab olish qatori yo\'q'); assert.doesNotMatch(prof, /brauzerda oching|Brauzerda ochish|Bosh ekranga qo'shing|Ilovani o'rnatish|yuklab olish/i);
  assert.match(prof, /Ma'lumotlarni saqlash/); assert.doesNotMatch(prof, /\(email\)/);
  /* 3. tashqi havolalar */
  await p.evaluate(() => { for (const [id, h] of [['xa', 'https://uzum.uz/uz/product/1'], ['xb', '/maxfiylik'], ['xc', '/kalkifit?demo=1']]) { const a = document.createElement('a'); a.id = id; a.href = h; a.textContent = id; a.style.cssText = 'position:fixed;top:0;left:0;z-index:99999'; document.body.appendChild(a); a.addEventListener('click', (e) => { window.__nav = (window.__nav || []).concat(id + ':' + e.defaultPrevented); }); } });
  const url0 = p.url(); await p.evaluate(() => document.getElementById('xa').click()); await p.evaluate(() => document.getElementById('xb').click()); await p.waitForTimeout(300);
  const ol = (await calls(p, 'AppLauncher', 'openUrl')).map((x) => x.url); assert.deepEqual(ol, ['https://uzum.uz/uz/product/1', BASE + '/maxfiylik'], 'Uzum va boshqa sahifa — tizim brauzerida'); assert.equal(p.url(), url0, 'ilova o\'z joyida qoldi');
  assert.equal(await p.evaluate(() => KalkiNative.external(new URL('/kalkifit?demo=1', location.href)) || KalkiNative.external(new URL('/ru/kalkifit', location.href))), false, 'KalkiFit havolalari ilova ichida');
  assert.equal(await p.evaluate(() => { window.open('https://eda.yandex.uz/x'); return window.__nat.calls.filter((c) => c[1] === 'openUrl').length; }), 3, 'window.open ham tizim brauzerida'); assert.deepEqual(p.errs, []); await p.context().close();
  p = await open('/kalkifit', { state: seed() }); assert.equal(await p.evaluate(() => typeof KalkiNative.external), 'function'); await p.evaluate(() => { const a = document.createElement('a'); a.id = 'xa'; a.href = '#x'; document.body.appendChild(a); }); await p.context().close();
  log('Ilova ichida o\'rnatish taklifi, «Brauzerda ochish», «Bosh ekranga qo\'shish», «yuklab olish» yo\'q; tashqi havolalar (Uzum, kalki.uz boshqa sahifalari, window.open) — tizim brauzerida (AppLauncher), KalkiFit — ichida');
  /* 4. hazil */
  for (const h of [9, 15]) { p = await open('/kalkifit', { state: seed({ prefs: { jokes: true }, entries: [{ fid: 'osh', unit: 'likop', qty: 1, g: 300, kcal: 500 }] }), hour: h }); await p.waitForTimeout(500);
    assert.equal(await p.locator('#jLine').count(), 0, h + ':00 — hazil Bugun\'da doimiy turmaydi (faqat ovqat qo\'shilgach 4 s)'); await p.context().close(); }
  p = await open('/kalkifit', { state: seed({ prefs: { jokes: false }, entries: [{ fid: 'osh', unit: 'likop', qty: 1, g: 300, kcal: 500 }] }), hour: 9 }); assert.equal(await p.locator('#jLine').count(), 0, 'o\'chirilganda yo\'q'); await p.context().close();
  log('Hazil: Bugun\'da doimiy qator yo\'q (faqat ovqat qo\'shilgach 4 s pufak — test-kalkifit-qoshish), o\'chirilganda ham yo\'q');
  /* 5. rasm/AI yozuvi — bazadagi taom ikonkasi */
  p = await open('/kalkifit', { state: seed({ entries: [{ fid: null, name: 'Shovla (yarim kichik tarelka)', g: 200, kcal: 290, est: true, meal: 'd' }] }) }); await p.waitForTimeout(1500);
  assert.equal(await p.locator('.sl-meal[data-m=d] .sl-mh .ml-ic.ml-d svg').count(), 1, 'v44: kechki ovqat kartasida DOIMIY oy ikonkasi (taom rasmi emas)'); const src = await p.locator('.sl-meal[data-m=d] .ml-r .sl-tile img').first().getAttribute('src').catch(() => null); assert.match(src || '', /shovla/, 'qatorda shovla rasmi (harf emas)');
  assert.equal((await p.evaluate(() => window.__kalkifit.state.days[Object.keys(window.__kalkifit.state.days).pop()].food[0].ifid)), 'shovla', 'mos bazaviy taom id\'si saqlandi');
  assert.match(await txt(p, '.sl-meal[data-m=d] .sl-ents'), /≈ 290/, 'kkal o\'zgarmadi (AI qiymati)'); await p.context().close();
  log('Rasm/AI orqali qo\'shilgan «Shovla (yarim kichik tarelka)» — bazadagi shovla ikonkasi, id saqlanadi (ifid), kkal o\'zgarmaydi');
  /* 6. qadam */
  p = await open('/kalkifit', { state: seed({ prefs: { qa: 'on' } }), app: true, qadam: { available: true, granted: true, enabled: true, source: 'hc', hc: 'ok' }, days: [{ sana: T0, qadam: 5432 }] }); await p.waitForTimeout(800);
  assert.equal(await p.locator('.sl-s .sl-pill').count(), 0, 'avtomatik: «+ Qo\'shish» yo\'q'); assert.equal(await txt(p, '.sl-s .sl-src'), 'Health Connect'); assert.match(await txt(p, '#sNum'), /5 432/);
  await p.click('.sl-s [data-act=addsteps]'); await p.waitForTimeout(500); assert.equal(await p.locator('#rzSheet [data-act=qafix], #spNum').count(), 0, 'qo\'lda kiritish yo\'q (faqat avtomatik)'); assert.match(await txt(p, '#rzSheet'), /5 432/); await p.context().close();
  p = await open('/kalkifit', { state: seed({ prefs: { qa: 'on' } }), app: true, qadam: { available: true, granted: true, enabled: true, source: 'sensor', hc: 'install', sensor: true, sensorGranted: true }, days: [{ sana: T0, qadam: 1500 }] }); assert.equal(await txt(p, '.sl-s .sl-src'), 'Telefon sensori');
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500); assert.match(await txt(p, '#qaRow'), /Telefon sensori orqali/); assert.equal(await p.getAttribute('#qaRow [data-act=qatog]', 'aria-checked'), 'true', 'Profil: switch'); assert.equal(await p.locator('#qaRow [data-act=qahc]').count(), 0, 'switch qatori oddiy'); await p.context().close();
  p = await open('/kalkifit', { state: seed() }); assert.equal(await p.locator('.sl-s:not([data-st=web]), [data-act=addsteps]').count(), 0, 'v55: vebda avtomatik qadam kartasi yo\'q — faqat qo\'lda kiritish (Android\'da emas)'); await p.context().close();
  log('Qadam: faqat avtomatik (Health Connect / Telefon sensori) — kartada manba nomi, bosilsa jami (qo\'lda kiritish yo\'q); Profil\'da switch + «Telefon sensori orqali»; vebda qadam kartasi yo\'q');
  /* 7. matnlar */
  p = await open('/kalkifit', { state: seed({ entries: [{ fid: 'osh', unit: 'likop', qty: 1, g: 300, kcal: 500 }] }), hour: 10 });
  assert.equal(await p.locator('.sl-lphint').count(), 0, '«uzun bosing» doimiy matni yo\'q'); const all = await txt(p, '#rzMain'); assert.doesNotMatch(all, /Hali yozilmadi|uzun bosing/i);
  assert.equal(await p.locator('#dayEnd').count(), 0, '10:00, 1 yozuv — «Kunni yakunlash» yo\'q'); assert.match(await txt(p, '#rzToast') || '', /uzun bosing/i, 'bir martalik maslahat'); 
  assert.equal(await p.locator('.sl-meal.empty .sl-dash span').count(), 0, 'bo\'sh kartada faqat «+»'); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1600); assert.doesNotMatch(await txt(p, '#rzToast') || '', /uzun bosing/i, 'maslahat qayta chiqmaydi'); await p.context().close();
  p = await open('/kalkifit', { state: seed({ entries: [{ fid: 'osh', unit: 'likop', qty: 1, g: 300, kcal: 500 }] }), hour: 20 }); assert.equal(await p.locator('#dayEnd').count(), 1, '20:00 — bor'); await p.context().close();
  p = await open('/kalkifit', { state: seed({ entries: [{ fid: 'osh', unit: 'likop', qty: 1, g: 300, kcal: 500 }, { fid: 'non', unit: 'dona', qty: 1, g: 250, kcal: 600, meal: 'b' }] }), hour: 10 }); assert.equal(await p.locator('#dayEnd').count(), 1, '2 yozuv — bor'); await p.context().close();
  log('Matnlar: «Taomni uzun bosing» doimiy emas (birinchi marta bitta maslahat), bo\'sh kartada «Hali yozilmadi» yo\'q (faqat nom + «+»), «Kunni yakunlash» 19:00 dan keyin yoki 2+ yozuvda');
} finally { await b.close(); srv.close(); }
console.log('\n' + n + '/' + n + ' OK');
