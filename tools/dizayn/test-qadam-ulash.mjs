// KalkiFit Android v23: qadamni BITTA tugma bilan ulash va manba mantiqi (plagin mock, Capacitor.nativePromise) —
//  HC o'rnatilmagan → 1/2 Play Market → qaytganda o'zi 2/2 ruxsat oynasi (ulash); HC bo'sh → «Qadamlar hali kelmayapti» + «Google Fit'ni o'rnatish»;
//  HC + ma'lumot → «Health Connect»; sensor kattaroq → «Telefon sensori»; sensor yo'q → aniq izoh; ruxsat rad → o'chiq, qo'lda kiritish; sensor jonli hodisa → yangilanadi;
//  yashirin diagnostika (versiya qatori 5 marta) + «Nusxalash»; yangilash kartasi (ilova tilida, «Keyinroq» → 3 kun); ilovada «Kalki.uz» sarlavhasi yo'q.   node tools/dizayn/test-qadam-ulash.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates;
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const TODAY = D.today(), UA = 'Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130 Mobile Safari/537.36';
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
      if (m === 'getDays') return R({ kunlar: [{ sana: a.TODAY, qadam: q.days || 0 }], source: q.src || '', hcToday: q.st.hcToday || 0 });
      if (m === 'diag') return R({ matn: 'TYPE_STEP_COUNTER: bor\nHealth Connect: ok\nHC bugungi yozuvlar: 0 ta' });
      return Promise.reject(new Error('?')); },
    addListener: (pl, ev, cb) => { (q.ls = q.ls || {})[pl + ':' + ev] = cb; return { remove() {} }; } }; };
async function open(o = {}) {
  const c = await b.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', userAgent: o.web ? undefined : UA });
  await c.addInitScript((x) => { try { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); if (x.lang) localStorage.setItem('kalki_lang', x.lang);
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
try {
  /* 1. HC o'rnatilmagan → 1/2 → Play Market → qaytganda o'zi 2/2 (ruxsat oynasi) → ulangan */
  let p = await open({ q: { st: ST({ hc: 'install' }), ulash: { granted: true, sensorGranted: true, source: 'sensor' }, days: 2300, src: 'sensor' } });
  await p.click('.sl-s [data-act=addsteps]'); await p.waitForSelector('#rzSheet [data-act=qahc]'); let sh = await txt(p, '#rzSheet'); assert.match(sh, /Qadamlarni ulash/); assert.match(sh, /1\/2 — Health Connect'ni o'rnating, keyin shu yerga qayting\./); assert.equal(await p.locator('#rzSheet [data-act=qahc]').count(), 1, 'BITTA asosiy tugma');
  await p.click('#rzSheet [data-act=qahc]'); await p.waitForTimeout(200); assert.ok((await calls(p)).includes('Qadam.openHealthConnect'), 'Play Market');
  await p.evaluate(() => { window.__q.st.hc = 'ok'; }); await visible(p); await p.waitForTimeout(1300);
  assert.ok((await calls(p)).includes('Qadam.ulash'), 'qaytganda jarayon o\'zi davom etdi (ruxsat oynasi ilovadan)'); assert.equal((await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')).prefs.qa)), 'on');
  await p.waitForTimeout(600); assert.match(await txt(p, '#sNum'), /2 300/); assert.equal(await txt(p, '.sl-s .sl-src'), 'Telefon sensori'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Health Connect yo\'q: «Qadamlarni ulash» → «1/2 — Health Connect\'ni o\'rnating…» [bitta tugma] → Play Market → qaytganda o\'zi ruxsat oynasi (ulash: HC + ACTIVITY_RECOGNITION) → kartada son va manba');
  /* 2. HC bo'sh, sensor ruxsatli lekin 0 → «Qadamlar hali kelmayapti» + Google Fit */
  p = await open({ st: seed({ prefs: { qa: 'on' } }), q: { st: ST({ granted: true, enabled: true, hcGranted: true, sensorGranted: true }), days: 0 } });
  assert.equal(await txt(p, '.sl-s .sl-src'), 'Qadamlar hali kelmayapti'); assert.equal(await txt(p, '.sl-s [data-act=qafit]'), "Google Fit'ni o'rnatish"); await p.click('.sl-s [data-act=qafit]'); await p.waitForTimeout(200); assert.ok((await calls(p)).includes('Qadam.openGoogleFit'));
  await p.click('.sl-s [data-act=addsteps]'); await p.waitForTimeout(500); assert.match(await txt(p, '#rzSheet'), /Google Fit qadamni sanaydi va Health Connect'ga yozadi\./); await p.context().close();
  /* 2b. 1.0.2 holati: HC ruxsati bor, sensor ruxsati YO'Q → kartada «Qadamlarni ulash» (sensor ruxsati so'raladi) */
  p = await open({ st: seed({ prefs: { qa: 'on' } }), q: { st: ST({ granted: true, enabled: true, hcGranted: true, sensorGranted: false }), ulash: { sensorGranted: true }, days: 0 } });
  assert.equal(await txt(p, '.sl-s [data-act=qaulash]'), 'Qadamlarni ulash'); await p.click('.sl-s [data-act=qaulash]'); await p.waitForSelector('#rzSheet [data-act=qayes]'); await p.click('#rzSheet [data-act=qayes]'); await p.waitForTimeout(700); assert.ok((await calls(p)).includes('Qadam.ulash')); await p.context().close();
  log('Health Connect bo\'sh: «Qadamlar hali kelmayapti» + bitta «Google Fit\'ni o\'rnatish» (Play Market), oynada izoh; sensor ruxsati yo\'q (1.0.2 holati) → «Qadamlarni ulash»');
  /* 3. HC + ma'lumot; ikkalasi — kattasi; jonli sensor */
  p = await open({ st: seed({ prefs: { qa: 'on' } }), q: { st: ST({ granted: true, enabled: true, hcGranted: true, hcToday: 4, sensorGranted: true, source: 'hc' }), days: 6400, src: 'hc' } });
  assert.match(await txt(p, '#sNum'), /6 400/); assert.equal(await txt(p, '.sl-s .sl-src'), 'Health Connect'); assert.equal(await p.locator('.sl-s .sl-pill').count(), 0);
  const gd0 = (await calls(p)).filter((x) => x === 'Qadam.getDays').length; await p.evaluate(() => { window.__q.days = 7100; window.__q.src = 'sensor'; window.__q.ls['Qadam:qadam']({ sensor: 7100 }); }); await p.waitForTimeout(900);
  assert.ok((await calls(p)).filter((x) => x === 'Qadam.getDays').length > gd0, 'jonli hodisa → yangilandi'); assert.match(await txt(p, '#sNum'), /7 100/); assert.equal(await txt(p, '.sl-s .sl-src'), 'Telefon sensori', 'sensor kattaroq bo\'lsa — sensor'); await p.context().close();
  log('Health Connect\'da ma\'lumot bor → «Health Connect»; sensor kattaroq bo\'lsa → «Telefon sensori» (har kun kattasi, ikki marta qo\'shilmaydi — native); sensor jonli hodisasi → son darrov yangilanadi');
  /* 4. sensor yo'q telefon */
  p = await open({ st: seed({ prefs: { qa: 'on' } }), q: { st: ST({ granted: true, enabled: true, hcGranted: true, sensor: false }), days: 0 } });
  await p.click('.sl-s [data-act=addsteps]'); await p.waitForTimeout(500); assert.match(await txt(p, '#rzSheet'), /Telefoningizda qadam sensori yo'q — qadamni Google Fit sanaydi\./); await p.context().close();
  /* 5. ruxsat rad */
  p = await open({ q: { st: ST({ hc: 'ok' }), ulash: { granted: false } } }); await p.click('.sl-s [data-act=addsteps]'); await p.waitForSelector('#rzSheet [data-act=qayes]'); assert.match(await txt(p, '#rzSheet'), /«Ruxsat berish»ni bosing — qadamlar o'zi keladi\./); await p.click('#rzSheet [data-act=qayes]'); await p.waitForTimeout(700);
  assert.equal((await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')).prefs.qa)), 'off'); assert.match(await p.locator('body').innerText(), /Ruxsat berilmadi/); assert.equal(await p.locator('.sl-s .sl-pill[data-act=addsteps]').count(), 1, 'qo\'lda kiritish qoladi'); await p.context().close();
  log('Sensor yo\'q telefonda aniq izoh («…qadamni Google Fit sanaydi»); ruxsat rad etilsa — o\'chiq, tushuntirish, qo\'lda kiritish qoladi');
  /* 6. RU matnlari */
  p = await open({ lang: 'ru', q: { st: ST({ hc: 'install' }) } }); await p.click('.sl-s [data-act=addsteps]'); await p.waitForSelector('#rzSheet [data-act=qahc]'); sh = await txt(p, '#rzSheet'); assert.match(sh, /Подключить шаги/); assert.match(sh, /1\/2 — Установите Health Connect и вернитесь сюда\./); await p.context().close();
  log('RU: «Подключить шаги», «1/2 — Установите Health Connect и вернитесь сюда.» (ЎЗ — translit)');
  /* 7. diagnostika */
  p = await open({ q: { st: ST({}) } }); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500); assert.equal(await txt(p, '.sl-ver'), 'KalkiFit 1.0.3 (5)');
  for (let i = 0; i < 5; i++) await p.click('.sl-ver'); await p.waitForSelector('#diagTxt'); const dg = await txt(p, '#diagTxt'); assert.match(dg, /TYPE_STEP_COUNTER: bor/); assert.match(dg, /prefs\.qa/); assert.equal(await p.locator('#rzSheet [data-act=diagcopy]').count(), 1, '«Nusxalash»'); await p.context().close();
  p = await open({ web: true }); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(400); assert.equal(await p.locator('.sl-ver').count(), 0, 'vebda versiya qatori yo\'q'); await p.context().close();
  log('Yashirin diagnostika: Profil → «KalkiFit 1.0.3 (5)» qatorini 5 marta bosish → holatlar ro\'yxati + «Nusxalash»; vebda yo\'q');
  /* 8. yangilash kartasi */
  p = await open({ q: { st: ST({}) }, remote: 6 }); await p.waitForTimeout(500); assert.equal(await txt(p, '#updCard b'), 'Yangi versiya tayyor'); assert.equal(await txt(p, '#updCard [data-act=updgo]'), 'Yangilash'); assert.equal(await txt(p, '#updCard [data-act=updlater]'), 'Keyinroq');
  const uc = await p.evaluate(() => { const e = document.getElementById('updCard'), c = getComputedStyle(e), r = e.getBoundingClientRect(); return { bg: c.backgroundColor, w: r.right <= innerWidth + 0.5 && r.left >= 0, card: e.classList.contains('rz-card') }; }); assert.ok(uc.card && uc.w, 'mavzuga mos karta, ekranga sig\'adi');
  await p.click('#updCard [data-act=updgo]'); await p.waitForTimeout(200); assert.ok((await calls(p)).includes('AppLauncher.openUrl'), 'APK brauzerda yuklanadi');
  await p.click('#updCard [data-act=updlater]'); await p.waitForTimeout(200); assert.equal(await p.locator('#updCard').count(), 0); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1200); assert.equal(await p.locator('#updCard').count(), 0, '«Keyinroq» — 3 kun ko\'rinmaydi');
  await p.evaluate(() => { const l = JSON.parse(localStorage.getItem('kalki_upd_later')); l.t -= 3.1 * 86400000; localStorage.setItem('kalki_upd_later', JSON.stringify(l)); }); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1200); assert.equal(await p.locator('#updCard').count(), 1, '3 kundan keyin yana'); await p.context().close();
  p = await open({ lang: 'ru', q: { st: ST({}) }, remote: 6 }); await p.waitForTimeout(500); assert.equal(await txt(p, '#updCard b'), 'Готова новая версия'); await p.context().close();
  p = await open({ q: { st: ST({}), build: 4, ver: '1.0.2' }, remote: 6 }); await p.waitForTimeout(500); assert.equal(await p.locator('#updCard').count(), 0, '1.0.2 (native banner bor) — sayt kartasi chiqmaydi'); await p.context().close();
  p = await open({ q: { st: ST({}) }, remote: 5 }); await p.waitForTimeout(500); assert.equal(await p.locator('#updCard').count(), 0, 'yangi versiya yo\'q'); await p.context().close();
  log('Yangilash: ilova tilida («Yangi versiya tayyor» [Yangilash] [Keyinroq] / RU «Готова новая версия»), mavzuga mos karta, tor ekranga sig\'adi; «Keyinroq» → 3 kun yo\'q; eski ilovada (build < 5) chiqmaydi');
  /* 9. sarlavha */
  p = await open({ q: { st: ST({}) } }); assert.equal(await p.locator('.rz-top .rz-logo').count(), 0, 'ilovada «Kalki.uz» yo\'q'); assert.equal(await txt(p, '#rzTitle'), 'KalkiFit'); assert.equal(await p.locator('#rzLang').count(), 1); await p.context().close();
  p = await open({ web: true }); assert.equal(await p.locator('.rz-top .rz-logo').count(), 1, 'vebda avvalgidek'); await p.context().close();
  log('Sarlavha: Android ilovasida faqat «KalkiFit» va til tugmasi; vebda «Kalki.uz» havolasi avvalgidek');
} finally { await b.close(); srv.close(); }
console.log('\n' + n + '/' + n + ' OK');
