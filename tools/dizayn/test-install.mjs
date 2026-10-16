// "Ilovani o'rnatish" yagona komponenti (assets/app-install.js) — KalkiFit va Ro'zg'or: Android Chrome (beforeinstallprompt), iPhone Safari (iOS 18 / 26 qo'llanma),
// iPhone Chrome, Telegram (Android: intent://, iPhone: Safari'da ochish ko'rsatmasi), standalone, "Keyinroq" 3 kun / 3 rad, UZ/ЎЗ/RU.   node tools/dizayn/test-install.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const I = require(path.join(ROOT, 'assets/app-install.js')); const KF = require(path.join(ROOT, 'assets/kalkifit-core.js')); const RZ = require(path.join(ROOT, 'assets/rozgor-core.js'));
const SHOTS = process.env.INSTALL_SHOTS || '';
const UA = {
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  ios18: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
  ios26: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
  iosChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1',
  iosFx: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/133.0 Mobile/15E148 Safari/605.1.15',
  tgAndroid: 'Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.0.0 Mobile Safari/537.36',
  tgIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  igIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0.0 (iPhone14,5)',
  desktop: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
};
// --- sof aniqlash ---
{ const d = (u, o) => I.detect(u, o);
  assert.equal(d(UA.android).kind, 'android'); assert.equal(d(UA.ios18).kind, 'ios'); assert.equal(d(UA.ios18).browser, 'safari'); assert.equal(d(UA.ios18).ios26, false); assert.equal(d(UA.ios26).ios26, true);
  assert.equal(d(UA.iosChrome).browser, 'chrome'); assert.equal(d(UA.iosFx).browser, 'firefox'); assert.equal(d(UA.tgAndroid).kind, 'inapp'); assert.equal(d(UA.tgIos).kind, 'inapp'); assert.equal(d(UA.tgIos, { telegram: true }).inapp, 'telegram'); assert.equal(d(UA.igIos).inapp, 'instagram');
  assert.equal(d(UA.desktop).kind, 'desktop'); assert.equal(d(UA.android, { standalone: true }).kind, 'standalone');
  assert.equal(d('Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 FBAV/450').inapp, 'facebook'); assert.equal(d('Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile Safari/537.36 musical_ly_2023').inapp, 'tiktok'); assert.equal(d('Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile Safari/537.36 WhatsApp/2.23').inapp, 'whatsapp');
  assert.equal(I.intentUrl({ host: 'kalki.uz', pathname: '/kalkifit', search: '' }), 'intent://kalki.uz/kalkifit#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=https%3A%2F%2Fkalki.uz%2Fkalkifit;end');
  assert.equal(I.safariUrl({ host: 'kalki.uz', pathname: '/ru/rozgor', search: '?lang=cyr' }), 'x-safari-https://kalki.uz/ru/rozgor?lang=cyr'); console.log('OK   0. aniqlash: Android/iPhone Safari (iOS 18 va 26)/Chrome/Firefox, Telegram·Instagram·Facebook·TikTok·WhatsApp, standalone; intent:// va x-safari-https:// havolalari'); }
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port;
const b = track(await chromium.launch()); let n = 1; const log = (m) => { console.log('OK  ', n++ + '.', m); };
const TODAY = KF.dates.today();
function kfState(withFood = true) { const st = KF.emptyState(); st.setup = true; st.created = Date.now() - 5 * 86400000; st.prefs = { tipsDone: true }; st.profile = { sex: 'm', preg: false, age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: null }; KF.addWeight(st, TODAY, 80);
  if (withFood) { const db = KF.normFoods(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods), fd = db.find((x) => x.id === 'osh'), pt = KF.portion(fd, 300); KF.addFood(st, TODAY, { fid: 'osh', meal: 'l', unit: 'g100', qty: 300, g: pt.g, kcal: pt.kcal, p: pt.p, f: pt.f, c: pt.c, n: fd.n }); } return st; }
function rzState(withTx = true) { const st = RZ.emptyState(); st.prefs = { tipsDone: true }; st.setup = true; st.created = Date.now() - 5 * 86400000; st.base = 3000000; st.reserve = 500000; st.income = RZ.addDays(TODAY, 12); if (withTx) st.tx.push({ id: 't1', type: 'exp', amount: 25000, cat: 'oziq', date: TODAY, ts: Date.now() }); return st; }
async function open(app, { ua, state, ls = {}, standalone = false, lang = '', w = 390, h = 844, fakeBip = false } = {}) {
  const key = app === 'kalkifit' ? 'kalki_fit' : 'kalki_rozgor';
  const c = await b.newContext({ userAgent: ua, viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((o) => { try { if (o.state && !localStorage.getItem(o.key)) localStorage.setItem(o.key, JSON.stringify(o.state)); for (const k in o.ls) localStorage.setItem(k, o.ls[k]); } catch (e) {}
    if (o.standalone) { const mm = window.matchMedia.bind(window); window.matchMedia = (q) => /display-mode:\s*standalone/.test(q) ? { matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} } : mm(q); }
    window.__nav = []; }, { state, key, ls, standalone });
  const p = await c.newPage(); p.errs = []; p.failed = []; p.on('pageerror', (e) => p.errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|googlesyndication|adsbygoog|net::ERR/.test(m.text())) p.errs.push(m.text()); });
  p.on('requestfailed', (r) => p.failed.push(r.url())); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  await p.route('**/api/**', (r) => r.abort());
  await p.goto(BASE + '/' + app + (lang ? '?lang=' + lang : ''), { waitUntil: 'networkidle' }); await p.waitForTimeout(700); return p;
}
const bip = (p) => p.evaluate(() => { window.__prompted = 0; const e = new Event('beforeinstallprompt', { cancelable: true }); e.prompt = () => { window.__prompted++; return Promise.resolve(); }; e.userChoice = new Promise((ok) => { window.__choose = ok; }); window.dispatchEvent(e); });
const T = async (p, sel) => { const l = p.locator(sel).first(); return (await l.count()) ? (await l.innerText()).replace(/\s+/g, ' ').trim() : null; };
const stOf = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}'), 'kalki_inst_x');
const instState = (p, app) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}'), 'kalki_inst_' + app);
const shot = async (p, name) => { if (!SHOTS) return; const tall = /iphone|korsatma|qollanma/.test(name); if (tall) { await p.setViewportSize({ width: 390, height: 1500 }); await p.waitForTimeout(500); } await p.screenshot({ path: path.join(SHOTS, name + '.png') }); if (tall) await p.setViewportSize({ width: 390, height: 844 }); };
try {
  for (const app of ['kalkifit', 'rozgor']) {
    const st = () => (app === 'kalkifit' ? kfState : rzState);
    /* 1. Android Chrome */
    let p = await open(app, { ua: UA.android, state: st()(false) }); await bip(p); await p.waitForTimeout(300); assert.equal(await p.locator('[data-inst=card]').count(), 0, app + ': birinchi yozuvsiz karta yo\'q'); await p.context().close();
    p = await open(app, { ua: UA.android, state: st()(true) }); assert.equal(await p.locator('[data-inst=card]').count(), 0, 'bip kelmaguncha karta yo\'q'); await bip(p); await p.waitForTimeout(400);
    assert.equal(await p.locator('[data-inst=card]').count(), 1, app + ': Android karta'); assert.match(await T(p, '[data-inst=card]'), /Ilovani telefoningizga o'rnating — har kuni bir bosishda ochiladi/); assert.match(await T(p, '[data-inst=card]'), /ma'lumotlaringiz ishonchliroq saqlanadi/); await shot(p, app + '_android_karta');
    await p.click('[data-act=inst]'); assert.equal(await p.evaluate(() => window.__prompted), 1, 'prompt() chaqirildi'); await p.evaluate(() => window.__choose({ outcome: 'dismissed' })); await p.waitForTimeout(400);
    let s = await instState(p, app); assert.equal(s.res, 'dismissed'); assert.equal(s.nos, 1); assert.ok(Math.abs(s.later - (Date.now() + 3 * 86400000)) < 60000, 'dismissed → 3 kun'); assert.equal(await p.locator('[data-inst=card]').count(), 0);
    await p.evaluate(() => window.dispatchEvent(new Event('appinstalled'))); await p.waitForTimeout(400); assert.match(await T(p, '#rzToast'), /O'rnatildi ✓/); s = await instState(p, app); assert.equal(s.res, 'accepted'); assert.ok(s.ok > 0);
    await p.click('[data-act=tab][data-v=' + (app === 'kalkifit' ? 'me' : 'set') + ']'); await p.waitForTimeout(300); assert.equal(await p.locator('[data-inst=row]').count(), 0, 'o\'rnatilgach Men qatori yo\'q'); assert.deepEqual(p.errs, []); await p.context().close();
    /* Men qatori (doimiy) + accepted */
    p = await open(app, { ua: UA.android, state: st()(true) }); await bip(p); await p.click('[data-act=tab][data-v=' + (app === 'kalkifit' ? 'me' : 'set') + ']'); await p.waitForTimeout(300); assert.equal(await p.locator('[data-inst=row]').count(), 1, 'doimiy qator'); await p.click('[data-inst=row]'); assert.equal(await p.evaluate(() => window.__prompted), 1);
    await p.evaluate(() => window.__choose({ outcome: 'accepted' })); await p.waitForTimeout(300); assert.equal((await instState(p, app)).res, 'accepted'); await p.context().close();
    log(app + ': Android Chrome — karta faqat birinchi yozuvdan keyin, prompt() chaqiriladi, natija eslab qolinadi, appinstalled → «O\'rnatildi ✓» va tugmalar yo\'qoladi, Men qatori doimiy');
    /* 2. iPhone Safari iOS 18 / 26 */
    p = await open(app, { ua: UA.ios18, state: st()(true) }); assert.equal(await p.locator('[data-inst=card]').count(), 1); await p.click('[data-act=instguide]'); await p.waitForTimeout(900);
    assert.equal(await p.locator('.inst-step').count(), 3, 'iOS 18: 3 qadam'); assert.equal(await p.locator('.inst-step svg.ig').count(), 3); assert.ok(await p.locator('.ig-pulse').count() >= 2 && await p.locator('.ig-arrow').count() >= 3, 'pulsatsiya + strelka'); const g18 = await T(p, '.inst-guide'); assert.match(g18, /Ulashish/); assert.match(g18, /Bosh ekranga qo'shish/); assert.match(g18, /Qo'shish/);
    const a1 = await p.evaluate(() => getComputedStyle(document.querySelector('.ig-arrow')).animationName); assert.ok(/ig/.test(a1), 'strelka animatsiyasi'); await shot(p, app + '_iphone_18');
    await p.click('[data-act=instv][data-v="26"]'); await p.waitForTimeout(600); assert.equal(await p.locator('.inst-step').count(), 4, 'iOS 26: 4 qadam'); assert.match(await T(p, '.inst-guide'), /«⋯»/); assert.notEqual(await p.locator('.inst-fig').first().innerHTML(), '', ''); await shot(p, app + '_iphone_26');
    await p.click('[data-act=instv][data-v="18"]'); await p.waitForTimeout(400); assert.equal(await p.locator('.inst-step').count(), 3); await p.keyboard.press('Escape'); await p.context().close();
    p = await open(app, { ua: UA.ios26, state: st()(true) }); await p.click('[data-act=instguide]'); await p.waitForTimeout(700); assert.equal(await p.locator('.inst-step').count(), 4, 'Version/26 → iOS 26 qo\'llanma o\'zi tanlanadi'); assert.equal(await p.locator('[data-act=instv][data-v="26"].on').count(), 1); await p.context().close();
    p = await open(app, { ua: UA.iosChrome, state: st()(true) }); await p.click('[data-act=instguide]'); await p.waitForTimeout(700); assert.equal(await p.locator('.inst-step').count(), 3); assert.match(await T(p, '.inst-guide'), /Chrome'da/); assert.match(await T(p, '.inst-guide'), /Manzil qatoridagi/); assert.equal(await p.locator('[data-act=instv]').count(), 0); await p.context().close();
    p = await open(app, { ua: UA.iosFx, state: st()(true) }); await p.click('[data-act=instguide]'); await p.waitForTimeout(700); assert.equal(await p.locator('.inst-step').count(), 4); assert.match(await T(p, '.inst-guide'), /Firefox'da/); await p.context().close();
    log(app + ': iPhone Safari — qo\'llanma (iOS 16–18: 3 qadam; iOS 26: «⋯» → Ulashish → …, 4 qadam), pulsatsiya va strelka animatsiyasi; Version/26 avtomatik; Chrome va Firefox o\'z rasmlari bilan');
    /* 3. Telegram */
    p = await open(app, { ua: UA.tgAndroid, state: st()(false) }); assert.equal(await p.locator('[data-inst=card]').count(), 1, 'ichki brauzerda onboardingdan keyin darrov'); assert.match(await T(p, '[data-inst=card]'), /Ilovani o'rnatish uchun uni brauzerda oching/); const topFirst = await p.evaluate(() => document.querySelector('#rzMain').firstElementChild.getAttribute('data-inst')); assert.equal(topFirst, 'card', 'karta ilova tepasida'); await shot(p, app + '_telegram_karta');
    await p.click('[data-act=instopen]'); await p.waitForTimeout(600); console.log('  intent failed:', JSON.stringify(p.failed.filter((u) => !/^http/.test(u)))); assert.ok(p.failed.some((u) => u.startsWith('intent://')), 'intent:// urinildi: ' + p.failed.join(',')); await p.context().close();
    p = await open(app, { ua: UA.tgIos, state: st()(false) }); assert.equal(await p.locator('[data-inst=card]').count(), 1); await p.click('[data-act=instopen]'); await p.waitForTimeout(2200);
    assert.ok(p.failed.some((u) => u.startsWith('x-safari-https://')), 'x-safari-https:// urinildi: ' + p.failed.join(',')); assert.equal(await p.locator('.inst-step').count(), 2, 'Safari\'da ochish ko\'rsatmasi'); assert.match(await T(p, '.inst-guide'), /Safari'da ochish/); assert.match(await T(p, '.inst-guide'), /«⋯»/); await shot(p, app + '_telegram_iphone_korsatma'); await p.context().close();
    p = await open(app, { ua: UA.tgAndroid, state: st()(false) }); const navUrl = await p.evaluate(() => { const l = window.location; return null; }); await p.context().close();
    log(app + ': ichki brauzer (Telegram Android: intent://… Chrome\'da ochish; Telegram iPhone: x-safari-https:// + «⋯ → Safari\'da ochish» ko\'rsatmasi), karta ilova tepasida');
    /* 4. standalone */
    for (const ua of [UA.android, UA.ios18, UA.tgAndroid]) { p = await open(app, { ua, state: st()(true), standalone: true }); await bip(p); await p.waitForTimeout(300); assert.equal(await p.locator('[data-inst]').count(), 0, app + ': standalone — o\'rnatish elementlari yo\'q'); await p.click('[data-act=tab][data-v=' + (app === 'kalkifit' ? 'me' : 'set') + ']'); assert.equal(await p.locator('[data-inst=row]').count(), 0); await p.context().close(); }
    log(app + ': standalone rejimda (Android, iPhone, ichki) o\'rnatish karta/qatori/qo\'llanmasi umuman yo\'q');
    /* 5. Keyinroq: 3 kun; 3 rad → faqat qator */
    p = await open(app, { ua: UA.ios18, state: st()(true) }); await p.click('[data-act=instlater]'); await p.waitForTimeout(300); s = await instState(p, app); assert.equal(s.nos, 1); assert.ok(Math.abs(s.later - (Date.now() + 3 * 86400000)) < 60000); assert.equal(await p.locator('[data-inst=card]').count(), 0);
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); assert.equal(await p.locator('[data-inst=card]').count(), 0, '3 kun ko\'rinmaydi'); await p.context().close();
    p = await open(app, { ua: UA.ios18, state: st()(true), ls: { ['kalki_inst_' + app]: JSON.stringify({ nos: 1, later: Date.now() - 1000 }) } }); assert.equal(await p.locator('[data-inst=card]').count(), 1, '3 kundan keyin qaytadi'); await p.context().close();
    p = await open(app, { ua: UA.ios18, state: st()(true), ls: { ['kalki_inst_' + app]: JSON.stringify({ nos: 3, later: Date.now() - 1000 }) } }); assert.equal(await p.locator('[data-inst=card]').count(), 0, '3 rad → karta yo\'q'); await p.click('[data-act=tab][data-v=' + (app === 'kalkifit' ? 'me' : 'set') + ']'); await p.waitForTimeout(300); assert.equal(await p.locator('[data-inst=row]').count(), 1, 'faqat Men qatori qoladi'); await p.click('[data-inst=row]'); await p.waitForTimeout(700); assert.equal(await p.locator('.inst-step').count(), 3); await p.context().close();
    log(app + ': «Keyinroq» → 3 kun yashirin (qayta yuklashdan keyin ham), 3 kundan keyin qaytadi, 3 marta rad etilsa faqat Men qatori qoladi');
    /* 6. tillar */
    const LAT = /\b[A-Za-z']{4,}\b/g, CYR = /[А-Яа-яЁёЎўҚқҒғҲҳ]/;
    for (const [lang, ua] of [['', UA.ios18], ['ru', UA.ios18], ['cyr', UA.ios18], ['cyr', UA.ios26], ['ru', UA.tgIos]]) {
      p = await open(app, { ua, state: st()(true), lang }); const card = await T(p, '[data-inst=card]'); assert.ok(card, lang + ' karta'); await p.click(ua === UA.tgIos ? '[data-act=instopen]' : '[data-act=instguide]'); await p.waitForTimeout(ua === UA.tgIos ? 2300 : 900);
      const guide = await T(p, '.inst-guide'); const strip = (t) => t.replace(/KalkiFit|Ro'zg'or|Рузгор|Safari|Chrome|Firefox|Telegram|iOS|Instagram|Ro.zg.or|Рўзғор|Ўзғор/gi, '').replace(/[A-Za-z]{1,3}\b/g, '');
      for (const [nm, t] of [['karta', card], ['qo\'llanma', guide]]) { if (lang === 'ru') assert.doesNotMatch(strip(t), LAT, app + '/ru/' + nm + ': lotincha: ' + (strip(t).match(LAT) || [''])[0]); else if (lang === 'cyr') assert.doesNotMatch(strip(t), LAT, app + '/ЎЗ/' + nm + ': lotincha: ' + (strip(t).match(LAT) || [''])[0] + ' | ' + t.slice(0, 120)); else assert.ok(!CYR.test(t), app + '/UZ/' + nm + ': kirill'); }
      if (lang === 'cyr') { assert.match(guide, /Улашиш/); assert.ok(await p.locator('.ig-mark').first().evaluate((e) => /^(KF|R)$/.test(e.textContent)), 'ikonka belgisi lotincha qoladi'); await shot(p, app + '_cyr_qollanma'); } if (lang === 'ru') assert.match(guide, /Поделиться|Safari/);
      assert.deepEqual(p.errs, []); await p.context().close(); }
    log(app + ': UZ / ЎЗ / RU — karta va qo\'llanma matnlari (SVG yozuvlari ham) o\'z tilida, aralashma yo\'q');
  }

  /* Ro'zg'or: umumiy kit — tez bosish va touch-action */
  { const { devices } = await import('playwright'); const c = await b.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' }); await c.addInitScript((st) => localStorage.setItem('kalki_rozgor', JSON.stringify(st)), rzState(true)); const q = await c.newPage(); await q.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort()); await q.route('**/api/**', (r) => r.abort());
    await q.goto(BASE + '/rozgor', { waitUntil: 'networkidle' }); await q.waitForTimeout(600); await q.click('#rzFab'); await q.waitForTimeout(500);
    for (let i = 0; i < 3; i++) { const bx = await q.locator('[data-act=key][data-k="1"]').boundingBox(); await q.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); await q.waitForTimeout(80); }
    await q.waitForTimeout(300); assert.equal((await q.locator('#exNum').innerText()).replace(/\s/g, ''), '111', 'Ro\'zg\'or: tez bosish → 111'); assert.equal(await q.evaluate(() => window.visualViewport.scale), 1);
    assert.deepEqual(await q.evaluate(() => ['#rzApp button', '.rz-pad button', '#rzApp'].map((s) => getComputedStyle(document.querySelector(s)).touchAction)), ['manipulation', 'manipulation', 'manipulation']); await c.close(); }
  log('Ro\'zg\'or (umumiy kit): iPhone emulyatsiyasida tez bosish → 111, zoom 1, touch-action: manipulation');
  /* 7. kompyuter: bip bo'lsa karta, bo'lmasa yo'q */
  let p = await open('kalkifit', { ua: UA.desktop, state: kfState(true), w: 390 }); assert.equal(await p.locator('[data-inst]').count(), 0, 'bip yo\'q → hech narsa'); await bip(p); await p.waitForTimeout(300); assert.equal(await p.locator('[data-inst=card]').count(), 1); await p.context().close();
  log('Kompyuter Chrome/Edge: beforeinstallprompt kelsa karta chiqadi, kelmasa hech narsa ko\'rinmaydi');
} finally { await b.close(); srv.close(); }
console.log(`\n${n - 1} ta tekshiruv guruhi o'tdi`);
