// KalkiFit v98: qadamni QO'LDA kiritish — birinchi darajali yo'l (Honor soati Health Connect'ga yozmaydi). Yadro (max qoidasi, manba, birlashtirish), Android kartasidagi tugma va oyna,
//  «Шаги ввожу вручную» rejimi (HC so'rovlari yo'q), kechki chip va ertalabki «kecha» taklifi, kechki bildirishnoma (vaqt sozlanadi, bosilsa — oyna).   node tools/dizayn/test-qadam-qolda.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates;
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const TODAY = D.today(), YD = D.addDays(D.today(), -1), UA = 'Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130 Mobile Safari/537.36';
function seed(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 86400000; st.prefs = Object.assign({ tipsDone: true, yemayAsked: 1, jokes: false }, o.prefs || {}); st.profile = { sex: 'm', preg: false, age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: null }; st.trackStart = D.addDays(TODAY, -14); S.addWeight(st, TODAY, 80); return st; }
/* mock: q = { st: holat (isAvailable javobi), ulash: ulashdan keyingi holat, days: bugungi qadam, src, diag } */
const MOCK = (a) => { const q = window.__q = Object.assign({ calls: [] }, a.q);
  window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: ['Qadam', 'App', 'AppLauncher'].map((name) => ({ name, methods: [] })),
    nativePromise: (pl, m, opt) => { q.calls.push(pl + '.' + m); const R = (x) => Promise.resolve(JSON.parse(JSON.stringify(x)));
      if (pl === 'App' && m === 'getInfo') return R({ version: q.ver || '1.0.3', build: q.build || 5 });
      if (pl === 'AppLauncher') return R({});
      if (m === 'isAvailable') return R(q.st);
      if (m === 'ulash') { Object.assign(q.st, q.ulash || {}); return R(Object.assign({}, q.st)); }
      if (m === 'setEnabled') { q.st.enabled = !!opt.on; return R({ enabled: q.st.enabled }); }
      if (m === 'openHealthConnect' || m === 'openGoogleFit') return R({});
      if (m === 'getDays') return R({ kunlar: [{ sana: a.TODAY, qadam: q.days || 0 }], source: q.src || '', hcToday: q.st.hcToday || 0, hcQadam: q.hcN || 0, sensorQadam: q.senN || 0 });
      if (m === 'getToday') return R({ qadam: q.days || 0, sana: a.TODAY, source: q.src || '', hcToday: q.st.hcToday || 0, hcQadam: q.hcN || 0, sensorQadam: q.senN || 0 });
      if (m === 'diag') return R({ matn: 'TYPE_STEP_COUNTER: bor\nHealth Connect: ok\nHC bugungi yozuvlar: 0 ta' });
      return Promise.reject(new Error('?')); },
    addListener: (pl, ev, cb) => { (q.ls = q.ls || {})[pl + ':' + ev] = cb; return { remove() {} }; } }; };
async function open(o = {}) {
  const c = await b.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', userAgent: o.web ? undefined : UA });
  await c.addInitScript((x) => { try { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_stat_test', '1'); if (x.lang) localStorage.setItem('kalki_lang', x.lang);
    if (x.hour != null) { const R = Date; const off = new R(new R().setHours(x.hour, 5, 0, 0)).getTime() - R.now(); class D2 extends R { constructor(...a) { if (a.length === 0) super(R.now() + off); else super(...a); } static now() { return R.now() + off; } } window.Date = D2; } } catch (e) {} }, { st: o.st || seed(), lang: o.lang, hour: o.hour == null ? 15 : o.hour });
  if (!o.web) await c.addInitScript(MOCK, { q: o.q, TODAY });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e)));
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.route('**/ilova/versiya.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ version: '1.0.4', versionCode: o.remote || 5, apk: '/ilova/kalkifit-1.0.4.apk' }) }));
  await p.goto(BASE + (o.lang === 'ru' ? '/ru/kalkifit' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(900); return p;
}
const txt = async (p, sel) => { const l = p.locator(sel).first(); return (await l.count()) ? (await l.innerText()).replace(/\s+/g, ' ').trim() : null; };
const calls = (p) => p.evaluate(() => window.__q.calls.slice());
const visible = (p) => p.evaluate(() => { document.dispatchEvent(new Event('visibilitychange')); });
const ST = (o) => Object.assign({ available: true, granted: false, enabled: false, source: '', hc: 'ok', hcGranted: false, hcToday: 0, sensor: true, sensorGranted: false, fit: false }, o);


const ST2 = (o) => ST(Object.assign({ granted: true, enabled: true, hcGranted: true, hcToday: 3, sensorGranted: true, source: 'hc', hcManbalar: ['com.hihonor.health'] }, o));
try {
  /* 1. yadro: kun = max(avtomatik, soat), manbasi; avtomatik keyin kelsa — soat qiymati yo'qolmaydi; birlashtirish va migratsiya */
  { const st = seed(); S.setAutoSteps(st, TODAY, 3000); S.setWatchSteps(st, TODAY, 9000); let x = st.days[TODAY]; assert.deepEqual([x.steps, x.sa, x.sw, S.stepSrc(x)], [9000, 3000, 9000, 'soat']);
    S.setAutoSteps(st, TODAY, 3500); assert.equal(st.days[TODAY].steps, 9000, 'avtomatik kichik — soat qoladi'); S.setAutoSteps(st, TODAY, 12000); x = st.days[TODAY]; assert.deepEqual([x.steps, S.stepSrc(x)], [12000, 'auto'], 'avtomatik katta — u olinadi');
    S.setWatchSteps(st, TODAY, 4000); assert.equal(st.days[TODAY].steps, 12000, 'soat kichik — avtomatik qoladi (qo\'lda son yo\'qotmaydi)');
    const m = S.migrate(JSON.parse(JSON.stringify(st))); assert.equal(m.days[TODAY].sw, 4000, 'migratsiya — sw saqlanadi');
    const a = seed(), b2 = seed(); S.setWatchSteps(a, YD, 8000); S.stamp(a, 10); S.setAutoSteps(b2, YD, 2000); S.stamp(b2, 20); S.stampReset(); const mg = S.mergeStates(a, b2); assert.deepEqual([mg.days[YD].steps, mg.days[YD].sw, mg.days[YD].sa], [8000, 8000, 2000], 'birlashtirish: soat qiymati yo\'qolmaydi'); }
  log('Yadro: kun = max(avtomatik, soat), manba «soat»/«auto»; kech kelgan kichik avtomatik soatni bosmaydi; migratsiya va ikki qurilma birlashtirishda sw saqlanadi');

  /* 2. Android: kartada DOIM «Ввести шаги с часов» (1 bosish) → raqam klaviaturasi, oxirgilar, skrinshot yo'li; saqlansa manba «с часов» */
  let p = await open({ lang: 'ru', q: { st: ST2(), days: 3000, src: 'hc' } }); await p.waitForTimeout(600);
  assert.equal(await p.locator('[data-act=stepwatch]').count(), 1, 'kartada tugma'); assert.match(await txt(p, '[data-act=stepwatch]'), /Ввести шаги с часов/); await p.click('[data-act=stepwatch]'); await p.waitForSelector('#siN');
  assert.match(await txt(p, '#rzSheet'), /Шаги с часов/); assert.equal(await p.locator('#siN').getAttribute('inputmode'), 'numeric'); await p.waitForTimeout(350); assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.id), 'siN', 'klaviatura darhol');
  assert.equal(await p.locator('#rzSheet [data-act=xqopen]').count(), 1, 'skrinshot yo\'li shu oynada'); await p.fill('#siN', '9500'); await p.click('[data-act=sisave]'); await p.waitForTimeout(500);
  let x = await p.evaluate((t) => JSON.parse(localStorage.getItem('kalki_fit')).days[t], TODAY); assert.equal(x.sw, 9500); assert.equal(x.steps, 9500); assert.match(await txt(p, '.sl-s'), /с часов/);
  await p.click('[data-act=stepwatch]'); await p.waitForSelector('#siN'); assert.equal(await p.locator('[data-act=sirec]').count(), 1, 'oxirgi kiritilgan son eslab qolinadi'); await p.click('[data-act=sirec]'); assert.equal(await p.inputValue('#siN'), '9500'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Android kartasi: «Ввести шаги с часов» doim; oyna — raqam klaviaturasi darhol, oxirgilar, skrinshot yo\'li; saqlansa max qoidasi + manba «с часов (вручную)»');

  /* 3. «Шаги ввожу вручную»: HC so'rovi/ogohlantirishi yo'q; kechki chip (21:00) va ertasi kuni kechagisi */
  const stM = seed({ prefs: { qa: 'on', sman: 1 } }); S.addFood(stM, YD, { fid: 'osh', meal: 'l', unit: 'porsiya', qty: 1, g: 300, kcal: 500, p: 20, f: 20, c: 60 });
  p = await open({ lang: 'ru', st: stM, hour: 21, q: { st: ST({ granted: false, hcGranted: false }), days: 0 } }); await p.waitForTimeout(900);
  assert.equal(await p.locator('#qaLost').count(), 0, 'ruxsat yo\'qoldi kartasi yo\'q'); assert.equal(await p.locator('[data-act=qaulash], [data-act=qafix], [data-act=qafit]').count(), 0, 'ulash/tuzatish so\'rovlari yo\'q');
  await p.waitForSelector('#rzChip .sl-chip', { timeout: 8000 }); assert.match(await txt(p, '#rzChip'), /Сколько шагов на часах сегодня/); await p.click('#rzChip .sl-chip'); await p.waitForSelector('#siN'); assert.match(await txt(p, '#rzSheet'), /Шаги с часов/); await p.context().close();
  p = await open({ lang: 'ru', st: stM, hour: 9, q: { st: ST(), days: 0 } }); await p.waitForSelector('#rzChip .sl-chip', { timeout: 8000 }); assert.match(await txt(p, '#rzChip'), /Вчерашние шаги не внесены/); await p.click('#rzChip .sl-chip'); await p.waitForSelector('#siN'); assert.equal(await p.locator('.si-day button.on').getAttribute('data-v'), YD, 'kechagi kun tanlangan');
  await p.fill('#siN', '7000'); await p.click('[data-act=sisave]'); await p.waitForTimeout(400); assert.equal(await p.evaluate((d) => JSON.parse(localStorage.getItem('kalki_fit')).days[d].sw, YD), 7000); await p.context().close();
  log('«Шаги ввожу вручную»: Health Connect so\'rovlari va ogohlantirishlar yo\'q; 21:00 dan keyin chip «Сколько шагов на часах сегодня?» → kiritish oynasi; ertalab — kechagisi kiritilmagan bo\'lsa taklif (kechagi kun tanlangan)');

  /* 4. Profil: rejim switch + eslatma vaqti; bildirishnoma (har kuni, tanlangan vaqtda), bosilsa — oyna */
  { const MOCKN = (a) => { const q = window.__q; const np = window.Capacitor.nativePromise; window.Capacitor.PluginHeaders.push({ name: 'LocalNotifications', methods: [] }); q.notif = []; window.Capacitor.addListener = (pl, ev, cb) => { q.lsa = q.lsa || {}; (q.lsa[pl + ':' + ev] = q.lsa[pl + ':' + ev] || []).push(cb); return { remove() {} }; };
      window.Capacitor.nativePromise = (pl, m, o) => { if (pl === 'LocalNotifications') { q.calls.push(pl + '.' + m); if (m === 'checkPermissions' || m === 'requestPermissions') return Promise.resolve({ display: 'granted' }); if (m === 'schedule') q.notif.push(o); if (m === 'getPending') return Promise.resolve({ notifications: [] }); return Promise.resolve({}); } return np(pl, m, o); }; };
    const c = await b.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', userAgent: UA });
    await c.addInitScript((x) => { localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_lang', 'ru'); }, { st: seed() });
    await c.addInitScript(MOCK, { q: { st: ST2(), days: 0 }, TODAY }); await c.addInitScript(MOCKN, {});
    p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort()); await p.goto(BASE + '/ru/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(900);
    await p.click('[data-act=tab][data-v=profile]'); await p.waitForSelector('[data-act=smantog]'); await p.click('[data-act=smantog]'); await p.waitForTimeout(500);
    assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')).prefs.sman), 1); const sc = await p.evaluate(() => window.__q.notif.flatMap((o) => o.notifications).filter((n) => n.id === 7003));
    assert.ok(sc.length >= 1, 'kechki eslatma rejalashtirildi'); assert.deepEqual(sc.at(-1).schedule.on, { hour: 21, minute: 0 }); assert.match(sc.at(-1).body, /Сколько шагов на часах сегодня/);
    await p.fill('#swRemT', '20:30'); await p.dispatchEvent('#swRemT', 'change'); await p.waitForTimeout(300); const sc2 = await p.evaluate(() => window.__q.notif.flatMap((o) => o.notifications).filter((n) => n.id === 7003)); assert.deepEqual(sc2.at(-1).schedule.on, { hour: 20, minute: 30 }, 'vaqt o\'zgartirildi');
    await p.evaluate(() => { ((window.__q.lsa || {})['LocalNotifications:localNotificationActionPerformed'] || []).forEach((cb) => cb({ notification: { id: 7003, extra: { qw: 1 } } })); }); await p.waitForSelector('#siN', { timeout: 5000 }); assert.match(await txt(p, '#rzSheet'), /Шаги с часов/, 'eslatma bosilsa — kiritish oynasi');
    assert.deepEqual(p.errs, []); await c.close(); }
  log('Profil: «Шаги ввожу вручную» + kechki eslatma (standart 21:00, o\'zgartirsa bo\'ladi) — har kuni rejalashtiriladi; bosilsa to\'g\'ridan-to\'g\'ri kiritish oynasi');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
