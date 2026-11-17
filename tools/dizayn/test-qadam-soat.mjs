// KalkiFit v84: «Soatdan qadam olish» — soat ilovasi Health Connect'ga yozadi, KalkiFit o'qiydi. Tekshiriladi: Profil'dagi qator va oyna (Health Connect bor/yo'q/o'rnatilmagan/ruxsatsiz/bo'sh),
//  qadam yozayotgan ilovalar, telefon va Health Connect sonlari + «telefon ko'proq» maslahati, ko'rsatma (Honor Health, Huawei, ustuvorlik), tugmalar, manba yozuvi (soat / telefon / qo'lda),
//  qo'lda kiritilgan qadam avtomatik qiymat bilan jim almashtirilmaydi, veb (PWA)da bo'lim yo'q, ru/ЎЗ, 360 px.   node tools/dizayn/test-qadam-soat.mjs
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

const ST2 = (o) => ST(Object.assign({ granted: true, enabled: true, hcGranted: true, hcToday: 3, sensorGranted: true, source: 'hc', hcManbalar: ['com.google.android.apps.fitness', 'com.hihonor.health'] }, o));
const stOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')));
const prof = async (p) => { await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500); };
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
try {
  /* 1. Veb (PWA): bo'lim ham, qadam kartasi ham yo'q */
  let p = await open({ web: true }); await prof(p); assert.equal(await p.locator('#qaWRow').count(), 0, 'vebda «Soatdan qadam olish» yo\'q'); assert.equal(await p.locator('.sl-s').count(), 0); assert.deepEqual(p.errs, []); await p.context().close();
  log('Veb (PWA): «Soatdan qadam olish» bo\'limi ko\'rinmaydi, xato yo\'q');
  /* 2. Health Connect ulangan, soat ilovasi yozgan: qator → oyna: holat, yozayotgan ilovalar, sonlar, ko'rsatma */
  p = await open({ q: { st: ST2(), days: 10200, src: 'hc', hcN: 10200, senN: 5000 }, prefs: {} }); await prof(p);
  assert.equal(await p.locator('#qaWRow').count(), 1); assert.match(await txt(p, '#qaWRow'), /Soatdan qadam olish/); assert.ok((await p.locator('#qaWRow').boundingBox()).height >= 44);
  await p.click('#qaWRow'); await p.waitForSelector('#rzSheet[data-kind=qawatch]'); await p.waitForTimeout(300); let sh = await txt(p, '#rzSheet');
  assert.match(sh, /Health Connect ulangan\./); assert.match(sh, /Qadam yozayotgan ilovalar: Google Fit, Honor Health./); assert.match(sh, /Bugun: Health Connect 10 200 · telefon sensori 5 000/); assert.doesNotMatch(sh, /Telefon bugun ko'proq/, 'soat ko\'p — maslahat yo\'q');
  assert.match(sh, /Honor Health: Sozlamalar → Health Connect/); assert.match(sh, /Huawei Health: Health Connect'ga odatda o'zi yozmaydi/); assert.match(sh, /Samsung Health: Sozlamalar → Health Connect/); assert.match(sh, /Mi Fitness: Profil → Sozlamalar → Health Connect/); assert.match(sh, /Ba'zi versiyalarda bu band yo'q bo'lishi mumkin/); assert.match(sh, /ustuvorlik/); assert.match(sh, /sinxronlashni yoqing/);
  assert.equal(await p.locator('#rzSheet [data-act=qahcset]').count(), 1); await p.click('#rzSheet [data-act=qahcset]'); await p.waitForTimeout(200); let c = await calls(p); assert.ok(c.includes('Qadam.openHealthConnect')); assert.ok(!c.includes('Qadam.ulash'), 'ochish — ruxsat jarayonini boshlamaydi');
  assert.ok(await noOverflow(p)); assert.deepEqual(p.errs, []); log('Ulangan holat: yozayotgan ilovalar, «Health Connect 10 200 · telefon 5 000», ko\'rsatma (Honor Health yo\'li, Huawei, ustuvorlik), «Health Connect\'ni ochish» ruxsat oynasini ochmaydi'); await p.context().close();
  /* 3. Telefon sezilarli ko'p sanagan: maslahat */
  p = await open({ q: { st: ST2(), days: 9000, src: 'sensor', hcN: 4000, senN: 9000 } }); await prof(p); await p.click('#qaWRow'); await p.waitForSelector('#rzSheet[data-kind=qawatch]'); await p.waitForTimeout(300);
  assert.match(await txt(p, '#rzSheet'), /Telefon bugun ko'proq qadam sanagan\. Soat ilovasi hali sinxronlanmagan/); await p.context().close(); log('Telefon soatdan ko\'p sanasa — sabab maslahati (sinxronlanmagan / ustuvorlik)');
  /* 4. Health Connect bor, lekin bugun bo'sh (soat ilovasi yozmayapti) */
  p = await open({ q: { st: ST2({ hcToday: 0, hcManbalar: [], source: 'sensor' }), days: 4000, src: 'sensor', hcN: 0, senN: 4000 } }); await prof(p); await p.click('#qaWRow'); await p.waitForSelector('#rzSheet[data-kind=qawatch]'); await p.waitForTimeout(300);
  sh = await txt(p, '#rzSheet'); assert.match(sh, /Soat ilovangiz Health Connect'ga yozmayapti/); assert.doesNotMatch(sh, /Qadam yozayotgan ilovalar/); await p.context().close(); log('Health Connect\'da bugun ma\'lumot yo\'q — aniq izoh, ro\'yxat chiqmaydi');
  /* 5. O'rnatilmagan: «Health Connect'ni o'rnatish» → Play Market */
  p = await open({ q: { st: ST({ hc: 'install', granted: true, enabled: true, sensorGranted: true, source: 'sensor' }), days: 1200, src: 'sensor' }, prefs: { qa: 'on' }, st: seed({ prefs: { qa: 'on' } }) }); await prof(p); await p.click('#qaWRow'); await p.waitForSelector('#rzSheet[data-kind=qawatch]');
  assert.match(await txt(p, '#rzSheet'), /Health Connect o'rnatilmagan/); assert.equal(await txt(p, '#rzSheet [data-act=qahc]'), "Health Connect'ni o'rnatish"); await p.click('#rzSheet [data-act=qahc]'); await p.waitForTimeout(200); assert.ok((await calls(p)).includes('Qadam.openHealthConnect')); await p.context().close(); log('O\'rnatilmagan: «Health Connect\'ni o\'rnatish» tugmasi → Play Market');
  /* 6. Ruxsat berilmagan: «Health Connect'ni ulash» → ruxsat oynasi → ulandi */
  p = await open({ q: { st: ST({ hc: 'ok', hcGranted: false, granted: true, enabled: true, sensorGranted: true, source: 'sensor' }), ulash: { hcGranted: true, hcToday: 2, source: 'hc' }, days: 7000, src: 'hc', hcN: 7000, senN: 3000 }, st: seed({ prefs: { qa: 'on' } }) }); await prof(p); await p.click('#qaWRow'); await p.waitForSelector('#rzSheet[data-kind=qawatch]');
  assert.match(await txt(p, '#rzSheet'), /ruxsat berilmagan/); await p.click('#rzSheet [data-act=qawconn]'); await p.waitForTimeout(900); assert.ok((await calls(p)).includes('Qadam.ulash'), 'ruxsat oynasi'); assert.equal((await stOf(p)).prefs.qa, 'on'); assert.deepEqual(p.errs, []); await p.context().close(); log('Ruxsat yo\'q: «Health Connect\'ni ulash» → ruxsat oynasi (Qadam.ulash), ulangan belgisi saqlanadi');
  /* 7. Bu telefonda Health Connect yo'q */
  p = await open({ q: { st: ST({ hc: 'none', granted: true, enabled: true, sensorGranted: true, source: 'sensor' }), days: 800, src: 'sensor' }, st: seed({ prefs: { qa: 'on' } }) }); await prof(p); await p.click('#qaWRow'); await p.waitForSelector('#rzSheet[data-kind=qawatch]'); assert.match(await txt(p, '#rzSheet'), /Bu telefonda Health Connect yo'q — qadam telefon sensoridan olinadi\./); assert.equal(await p.locator('#rzSheet [data-act=qahc], #rzSheet [data-act=qawconn], #rzSheet [data-act=qahcset]').count(), 0); await p.context().close(); log('Health Connect yo\'q telefon: izoh, tugma yo\'q');
  /* 8. Manba yozuvi: soat (HC) / telefon / qo'lda */
  p = await open({ q: { st: ST2(), days: 6400, src: 'hc', hcN: 6400, senN: 2000 }, st: seed({ prefs: { qa: 'on' } }) }); assert.equal(await txt(p, '.sl-s .sl-src'), 'Manba: soat (Health Connect)'); assert.ok(await noOverflow(p));
  assert.ok(await p.evaluate(() => { const c = document.querySelector('.sl-s').getBoundingClientRect(), a = document.querySelector('.sl-s .sl-src').getBoundingClientRect(); return a.right <= c.right + 0.5 && a.left >= c.left; }), 'yozuv kartaga sig\'adi (360 px)'); await p.context().close();
  p = await open({ q: { st: ST2({ hcToday: 0, source: 'sensor', hcManbalar: [] }), days: 3100, src: 'sensor', senN: 3100 }, st: seed({ prefs: { qa: 'on' } }) }); assert.equal(await txt(p, '.sl-s .sl-src'), 'Manba: telefon'); await p.context().close();
  /* faqat qo'lda kiritilgan (ulanmagan): «Qo'lda» */
  const sm = seed({ prefs: { qa: 'off' } }); sm.days[TODAY] = { food: [], water: 0, steps: 3000 };
  p = await open({ q: { st: ST({ granted: false, hcGranted: false }), days: 0 }, st: sm }); assert.equal(await txt(p, '.sl-s .sl-src'), "Qo'lda"); await p.context().close();
  log('Manba yozuvi: «Manba: soat (Health Connect)» / «Manba: telefon» / «Qo\'lda» — 360 px kartaga sig\'adi');
  /* 9. Qo'lda kiritilgan qiymat avtomatik bilan jim almashtirilmaydi (avtomatik + qo'lda yig'ma) */
  const s9 = seed({ prefs: { qa: 'on' } }); s9.days[TODAY] = { food: [], water: 0, steps: 3000, sa: 2000 };
  p = await open({ q: { st: ST2(), days: 2500, src: 'hc', hcN: 2500, senN: 800 }, st: s9 }); await p.waitForTimeout(800); let d9 = (await stOf(p)).days[TODAY]; assert.equal(d9.sa, 2500); assert.equal(d9.steps, 3500, 'qo\'lda +1000 saqlandi'); assert.equal(await txt(p, '.sl-s .sl-src'), 'Manba: soat (Health Connect)'); await p.context().close();
  /* avtomatik qiymat kamaysa (soat sinxronlanmagan) — kamaymaydi */
  p = await open({ q: { st: ST2(), days: 1500, src: 'hc', hcN: 1500, senN: 800 }, st: s9 }); await p.waitForTimeout(800); d9 = (await stOf(p)).days[TODAY]; assert.equal(d9.sa, 2000); assert.equal(d9.steps, 3000); await p.context().close();
  log('Qo\'lda qo\'shilgan 1000 qadam avtomatik qiymat (2000 → 2500) bilan jim almashmaydi (3500); avtomatik qiymat kamaymaydi');
  /* 10. RU va ЎЗ */
  p = await open({ lang: 'ru', q: { st: ST2(), days: 10200, src: 'hc', hcN: 10200, senN: 5000 }, st: seed({ prefs: { qa: 'on' } }) }); assert.equal(await txt(p, '.sl-s .sl-src'), 'Источник: часы (Health Connect)'); await prof(p); await p.click('#qaWRow'); await p.waitForSelector('#rzSheet[data-kind=qawatch]'); await p.waitForTimeout(300);
  sh = await txt(p, '#rzSheet'); assert.match(sh, /Шаги с часов/); assert.match(sh, /Honor Health: Настройки → Health Connect/); assert.match(sh, /Huawei Health: в Health Connect обычно сам не пишет/); assert.match(sh, /Сегодня: Health Connect 10 200 · датчик телефона 5 000/); assert.ok(await noOverflow(p)); assert.doesNotMatch(sh, /[A-Za-z]{3,}[А-Яа-я]|[А-Яа-я][A-Za-z]{3,}\b(?<!Health Connect)/, 'aralash yozuv yo\'q'); await p.context().close();
  p = await open({ lang: 'cyr', q: { st: ST2(), days: 10200, src: 'hc', hcN: 10200, senN: 5000 }, st: seed({ prefs: { qa: 'on' } }) }); await prof(p); await p.click('#qaWRow'); await p.waitForSelector('#rzSheet[data-kind=qawatch]'); sh = await txt(p, '#rzSheet'); assert.match(sh, /Соатдан қадам олиш/); assert.match(sh, /Honor Health: Созламалар/); assert.match(sh, /Honor Health\./); assert.ok(await noOverflow(p)); await p.context().close();
  log('RU va ЎЗ matnlari (Источник: часы / Манба…), oyna 360 px da sig\'adi');
  /* 11. QADAM OYNASI (karta bosilganda): holatlar, tugmalar, ko'rsatma, statistika */
  const info = async (o) => { const pp = await open(o); await pp.click('.sl-s [data-act=addsteps]'); await pp.waitForSelector('#rzSheet[data-kind=qainfo]'); await pp.waitForTimeout(400); return pp; };
  const Qs = (pp) => pp.evaluate(() => JSON.parse(localStorage.getItem('kalki_stat_q') || '[]').map((x) => x[0] + ':' + x[1]));
  const S0 = seed({ prefs: { qa: 'on' } });
  /* ruxsat yo'q (HC o'rnatilgan, KalkiFit'ga ruxsat berilmagan; sensor ishlayapti) */
  p = await info({ q: { st: ST({ hc: 'ok', hcGranted: false, granted: true, enabled: true, sensorGranted: true, source: 'sensor' }), ulash: { hcGranted: true, hcToday: 2, source: 'hc' }, days: 17, src: 'sensor', senN: 17 }, st: S0 });
  assert.equal(await p.getAttribute('#qaWSt', 'data-s'), 'perm'); assert.match(await txt(p, '#rzSheet'), /Soatdan qadam olish/i); assert.match(await txt(p, '#qaWSt'), /ruxsat berilmagan/); assert.equal(await txt(p, '#rzSheet [data-act=qawconn]'), 'Ruxsat bering'); assert.ok((await Qs(p)).includes('qadam_oyna:hc_holat.ruxsat_yoq'));
  await p.click('#rzSheet [data-act=qawconn]'); await p.waitForTimeout(900); assert.ok((await calls(p)).includes('Qadam.ulash')); await p.context().close();
  /* HC ulangan, lekin bugun 0 (foydalanuvchi telefoni): aniq ajratish + ko'rsatma + skrinshot tugmasi */
  p = await info({ q: { st: ST2({ hcToday: 0, hcManbalar: [], source: 'sensor' }), days: 17, src: 'sensor', hcN: 0, senN: 17 }, st: S0 });
  assert.equal(await p.getAttribute('#qaWSt', 'data-s'), 'empty'); sh = await txt(p, '#rzSheet'); assert.match(sh, /Soat ilovangiz Health Connect'ga yozmayapti/); assert.match(sh, /Bugun: Health Connect 0 · telefon sensori 17/); assert.match(sh, /Manba: telefon/);
  for (const re of [/Honor Health: Sozlamalar → Health Connect \(yoki «Ma'lumot almashish»\) → «Sync with Health Connect»/, /Ba'zi versiyalarda bu band yo'q/, /Huawei Health: /, /Samsung Health: Sozlamalar/, /Mi Fitness: Profil/, /Soat skrinshotidan qadam/]) assert.match(sh, re);
  assert.equal(await p.locator('#rzSheet [data-act=qahcset]').count(), 1); assert.equal(await p.locator('#rzSheet [data-act=xqopen]').count(), 1); assert.ok((await Qs(p)).includes('qadam_oyna:hc_holat.hc_nol')); assert.ok(await noOverflow(p)); await p.context().close();
  /* HC o'rnatilmagan */
  p = await info({ q: { st: ST({ hc: 'install', granted: true, enabled: true, sensorGranted: true, source: 'sensor' }), days: 100, src: 'sensor', senN: 100 }, st: S0 }); assert.equal(await p.getAttribute('#qaWSt', 'data-s'), 'install'); assert.equal(await p.locator('#rzSheet [data-act=qahc]').count(), 1); assert.ok((await Qs(p)).includes('qadam_oyna:hc_holat.ornatilmagan')); assert.equal(await p.locator('#rzSheet [data-act=xqopen]').count(), 1); await p.context().close();
  /* HC bor va soat yozgan: ko'rsatma ixcham (yo'q), skrinshot tugmasi yo'q */
  p = await info({ q: { st: ST2(), days: 10200, src: 'hc', hcN: 10200, senN: 5000 }, st: S0 }); assert.equal(await p.getAttribute('#qaWSt', 'data-s'), 'ok'); sh = await txt(p, '#rzSheet'); assert.match(sh, /Qadam yozayotgan ilovalar: Google Fit, Honor Health/); assert.doesNotMatch(sh, /Qanday sozlanadi/i); assert.equal(await p.locator('#rzSheet [data-act=xqopen]').count(), 0); assert.ok((await Qs(p)).includes('qadam_oyna:hc_holat.hc_bor')); await p.context().close();
  /* Health Connect yo'q telefon */
  p = await info({ q: { st: ST({ hc: 'none', granted: true, enabled: true, sensorGranted: true, source: 'sensor' }), days: 50, src: 'sensor', senN: 50 }, st: S0 }); assert.equal(await p.getAttribute('#qaWSt', 'data-s'), 'none'); assert.ok((await Qs(p)).includes('qadam_oyna:hc_holat.telefonda_yoq')); await p.context().close();
  log('Qadam oynasi (karta): holatlar — ruxsat yo\'q («Ruxsat bering») / HC 0 («Soat ilovangiz Health Connect\'ga yozmayapti» + Honor/Huawei/Samsung/Mi ko\'rsatmasi + skrinshot) / o\'rnatilmagan / HC bor (ixcham) / telefonda yo\'q; statistika qadam_oyna:hc_holat.*');
  /* 12. SKRINSHOT YO'LI (AI mock): o'qish → tasdiqlash → qo'lda qadam qoidasi bilan saqlash */
  const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64');
  const shotOpen = async (o, ai) => { const pp = await info(o); const reqs = []; await pp.route('**/api/kalkifit-mashq', (r) => { reqs.push(JSON.parse(r.request().postData())); const x = typeof ai === 'function' ? ai(reqs.length) : ai; r.fulfill({ status: x.s || 200, contentType: 'application/json', body: JSON.stringify(x.j) }); }); pp.reqs = reqs; await pp.click('#rzSheet [data-act=xqopen]'); await pp.waitForSelector('#rzSheet[data-kind=exshot]'); return pp; };
  const feed = async (pp) => { await pp.setInputFiles('#xsIn', { name: 's.png', mimeType: 'image/png', buffer: PNG }); await pp.waitForSelector('#rzSheet [data-act=xsgo]'); await pp.click('#rzSheet [data-act=xsgo]'); };
  const E0 = { q: { st: ST2({ hcToday: 0, hcManbalar: [], source: 'sensor' }), days: 17, src: 'sensor', hcN: 0, senN: 17 }, st: (() => { const x = seed({ prefs: { qa: 'on' } }); x.days[TODAY] = { food: [], water: 0, steps: 17, sa: 17 }; return x; })() };
  p = await shotOpen(E0, { j: { qadam: { qadam: 1043, sana: null, manba: 'Honor Health' }, limit: 8, qoldi: 7, akkaunt: false } });
  assert.match(await txt(p, '#rzSheet'), /Soat skrinshotidan qadam/); assert.ok((await Qs(p)).includes('qadam_skrinshot:ochildi')); assert.equal(await p.locator('#rzSheet [data-act=exadd]').count(), 0, 'mashq tugmasi chiqmaydi');
  await feed(p); await p.waitForSelector('#rzSheet[data-kind=qshotc]'); assert.equal(p.reqs[0].tur, 'qadam'); assert.ok(p.reqs[0].imgs.length === 1); assert.ok((await Qs(p)).includes('qadam_skrinshot:oqildi'));
  assert.equal(await p.inputValue('#xqN'), '1043'); sh = await txt(p, '#rzSheet'); assert.match(sh, /Hozir avtomatik sanalgan: 17/); assert.match(sh, /Qo'lda qo'shiladi: \+1 026 · jami 1 043\. Avtomatik qiymat almashtirilmaydi\./);
  await p.fill('#xqN', '1,0a50'); assert.equal(await p.inputValue('#xqN'), '1050'); assert.match(await txt(p, '#xqPrev'), /\+1 033 · jami 1 050/); await p.click('#xqSave'); await p.waitForTimeout(500);
  let d12 = (await stOf(p)).days[TODAY]; assert.equal(d12.sa, 17, 'avtomatik qiymat o\'zgarmadi'); assert.equal(d12.steps, 1050); assert.ok((await Qs(p)).includes('qadam_skrinshot:saqlandi')); assert.match(await txt(p, '#sNum'), /1 050/);
  /* avtomatik keyin o'ssa — qo'lda ustama o'zgarmaydi; qayta qo'lda yozilsa avtomatik almashmaydi */
  await p.evaluate((t) => { window.__q.days = 40; }, TODAY); await p.waitForTimeout(100); assert.deepEqual(p.errs, []); await p.context().close();
  log('Skrinshot yo\'li: tur=qadam so\'rovi, o\'qilgan son tahrirlanadi (faqat raqam), «+1 033 · jami 1 050», saqlash = qo\'lda ustama (sa=17 o\'zgarmaydi, steps=1050), statistika ochildi/oqildi/saqlandi');
  /* soat telefondan kam: hech narsa qo'shilmaydi (saqlash o'chiq) */
  p = await shotOpen({ q: E0.q, st: (() => { const x = seed({ prefs: { qa: 'on' } }); x.days[TODAY] = { food: [], water: 0, steps: 5000, sa: 5000 }; return x; })() }, { j: { qadam: { qadam: 3000, sana: null, manba: '' }, limit: 8, qoldi: 7, akkaunt: false } }); await feed(p); await p.waitForSelector('#rzSheet[data-kind=qshotc]');
  assert.match(await txt(p, '#xqPrev'), /Telefon allaqachon bunchalik yoki ko'proq sanagan/); assert.equal(await p.locator('#xqSave').isDisabled(), true); assert.equal((await stOf(p)).days[TODAY].steps, 5000); await p.context().close();
  /* kecha sanasi: ogohlantirish va o'sha kunga yoziladi */
  p = await shotOpen(E0, { j: { qadam: { qadam: 7000, sana: YD, manba: 'Samsung Health' }, limit: 8, qoldi: 7, akkaunt: false } }); await feed(p); await p.waitForSelector('#rzSheet[data-kind=qshotc]'); assert.match(await txt(p, '#xqDate'), /Ekrandagi sana: /); await p.click('#xqSave'); await p.waitForTimeout(400); const d13 = (await stOf(p)).days; assert.equal(d13[YD].steps, 7000); assert.equal(d13[TODAY].steps, 17); await p.context().close();
  /* qadam ekrani emas / xato / limit */
  p = await shotOpen(E0, { j: { qadam: null, limit: 8, qoldi: 8, akkaunt: false } }); await feed(p); await p.waitForSelector('#xsErr'); assert.match(await txt(p, '#xsErr'), /Skrinshotda kunlik qadam soni topilmadi/); assert.ok((await Qs(p)).includes('qadam_skrinshot:emas')); await p.context().close();
  p = await shotOpen(E0, { j: { s: 502, j: { xato: 'x', sabab: 'provayder' } } }); await feed(p); await p.waitForSelector('#xsErr'); assert.ok((await Qs(p)).includes('qadam_skrinshot:xato')); assert.equal((await stOf(p)).days[TODAY].steps, 17); await p.context().close();
  p = await shotOpen(E0, { j: { s: 429, j: { xato: 'limit', sabab: 'mehmon', limit: 8, qoldi: 0, akkaunt: false } } }); await feed(p); await p.waitForTimeout(700); assert.ok((await txt(p, '#rzSheet')).length > 20); assert.equal((await stOf(p)).days[TODAY].steps, 17); await p.context().close();
  log('Skrinshot: kam bo\'lsa qo\'shilmaydi, kecha sanasi o\'sha kunga yoziladi (ogohlantirish bilan), «qadam ekrani emas» / 502 / 429 — qadam o\'zgarmaydi');
  /* 13. ru va ЎЗ: qadam oynasi va skrinshot matni; 360 px */
  p = await info({ lang: 'ru', q: E0.q, st: E0.st }); sh = await txt(p, '#rzSheet'); assert.match(sh, /Приложение ваших часов не пишет в Health Connect/); assert.match(sh, /Sync with Health Connect/); assert.match(sh, /Шаги по скриншоту часов/); assert.ok(await noOverflow(p)); await p.context().close();
  p = await info({ lang: 'cyr', q: E0.q, st: E0.st }); sh = await txt(p, '#rzSheet'); assert.match(sh, /Соат иловангиз Health Connect/); assert.match(sh, /Sync with Health Connect/); assert.match(sh, /Honor Health/); assert.ok(await noOverflow(p)); await p.context().close();
  log('RU va ЎЗ: qadam oynasi (HC 0 + ko\'rsatma + skrinshot) 360 px da sig\'adi, brend nomlari lotincha');
  console.log('\nTAYYOR:', n, 'guruh');
} finally { await b.close(); srv.close(); }
