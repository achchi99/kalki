// iPhone: Safari va bosh ekrandagi ilova xotirasi ALOHIDA — tanlov ekrani (onboarding'dan oldin), brauzerda davom etish, «O'rnatish» → clipboard'ga ma'lumot kodi,
// standalone toza holatda «Ko'chirish» (clipboard.readText) → hamma ma'lumot bir xil, buzuq kodlar → xabar, Android/kompyuterda ekran yo'q, UZ/ЎЗ/RU.  Ikkala ilova.
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const I = require(path.join(ROOT, 'assets/app-install.js')); const KF = require(path.join(ROOT, 'assets/kalkifit-core.js')); const RZ = require(path.join(ROOT, 'assets/rozgor-core.js'));
const UA = { ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1', android: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36', desktop: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' };
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = process.env.INSTALL_BASE || 'http://localhost:' + srv.address().port;
const b = track(await chromium.launch()); let n = 0; const log = (m) => console.log('OK  ', ++n + '.', m);
// «Yangiliklar» oynasi sinovlarga xalaqit bermasin: ikkala ilova uchun yangiliklar «ko'rilgan» deb belgilanadi (oyna o'zi test-yangilik.mjs da tekshiriladi)
{ const nc0 = b.newContext.bind(b); b.newContext = async (o) => { const c = await nc0(o); await c.addInitScript(() => { try { for (const a of ['kalkifit', 'rozgor']) if (!localStorage.getItem('kalki_news_' + a)) localStorage.setItem('kalki_news_' + a, '{"shown":999,"read":999}'); } catch (e) {} }); return c; }; }
const TODAY = KF.dates.today();
const DB = KF.normFoods(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods);
function kfState() { const st = KF.emptyState(); st.setup = true; st.created = Date.now() - 5 * 86400000; st.prefs = { tipsDone: true }; st.profile = { sex: 'f', preg: false, age: 31, height: 166, weight: 64.5, act: 2, goal: 'slow', goalWeight: 60 }; KF.addWeight(st, TODAY, 64.5); KF.addWeight(st, KF.dates.addDays(TODAY, -3), 65.2);
  const fd = DB.find((x) => x.id === 'osh'), pt = KF.portion(fd, 300); KF.addFood(st, TODAY, { fid: 'osh', meal: 'l', unit: 'g100', qty: 300, g: pt.g, kcal: pt.kcal, p: pt.p, f: pt.f, c: pt.c, n: fd.n }); KF.setSteps(st, TODAY, 6543); KF.setWater(st, TODAY, 4); return st; }
function rzState() { const st = RZ.emptyState(); st.prefs = { tipsDone: true }; st.setup = true; st.created = Date.now() - 5 * 86400000; st.base = 3000000; st.reserve = 500000; st.income = RZ.addDays(TODAY, 12); st.tx.push({ id: 't1', type: 'exp', amount: 25000, cat: 'oziq', date: TODAY, ts: Date.now() }, { id: 't2', type: 'exp', amount: 12500, cat: 'transport', date: TODAY, ts: Date.now() + 1 }); return st; }
const APPS = { kalkifit: { key: 'kalki_fit', st: kfState, tab: 'profile', name: 'KalkiFit' }, rozgor: { key: 'kalki_rozgor', st: rzState, tab: 'set', name: "Ro'zg'or" } };
async function open(app, { ua = UA.ios, state, standalone = false, lang = '', ls = {}, clip = '' } = {}) {
  const A = APPS[app]; const c = await b.newContext({ userAgent: ua, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  try { await c.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE }); } catch (e) {}
  await c.addInitScript((o) => { try { if (o.state && !localStorage.getItem(o.key)) localStorage.setItem(o.key, JSON.stringify(o.state)); for (const k in o.ls) localStorage.setItem(k, o.ls[k]); } catch (e) {}
    if (o.standalone) { const mm = window.matchMedia.bind(window); window.matchMedia = (q) => /display-mode:\s*standalone/.test(q) ? { matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} } : mm(q); Object.defineProperty(navigator, 'standalone', { get: () => true }); } }, { state, key: A.key, standalone, ls });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort()); await p.route('**/api/**', (r) => r.abort());
  await p.goto(BASE + '/' + app + (lang ? '?lang=' + lang : ''), { waitUntil: 'networkidle' }); await p.waitForTimeout(700); if (clip) await p.evaluate((t) => navigator.clipboard.writeText(t), clip); return p;
}
const T = async (p, sel) => { const l = p.locator(sel).first(); return (await l.count()) ? (await l.innerText()).replace(/\s+/g, ' ').trim() : null; };
const lsOf = (p, key) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);
const norm = (st) => { const o = JSON.parse(JSON.stringify(st)); delete o.lastBackup; return o; };
try {
  // --- kodlash: aylanma, hajm, buzuqlik ---
  { const big = JSON.stringify({ x: 'a'.repeat(5000) }); const z = await I.encodeCode('kalkifit', big); assert.match(z, /^kalki1\.kalkifit\.z\./); assert.ok(z.length < big.length / 3, 'siqildi'); const d = await I.decodeCode('kalkifit', z); assert.equal(d.text, big);
    const pl = I.plainCode('kalkifit', 'salom ўзбек 😀'); assert.equal((await I.decodeCode('kalkifit', pl)).text, 'salom ўзбек 😀');
    for (const [code, err] of [['', 'eEmpty'], ['hello', 'eFmt'], ['kalki1.rozgor.z.AAAA', 'eApp'], ['kalki1.kalkifit.z.@@@', 'eFmt'], ['kalki1.kalkifit.z.AAAA', 'eBad'], ['kalki1.kalkifit.p.' + 'A'.repeat(300001), 'eSize']]) assert.equal((await I.decodeCode('kalkifit', code)).err, err, code.slice(0, 30));
    const huge = await I.encodeCode('kalkifit', JSON.stringify({ x: 'ab'.repeat(150000) })); assert.equal((await I.decodeCode('kalkifit', huge)).err, 'eSize', 'dekodlangan hajm ≤ 200 KB'); log('kod: siqish/ochish aylanmasi, UTF-8, hajm (kod ≤300 000, ochilgan ≤200 KB), buzuq/begona/bo\'sh kodlar aniq xato kalitlari bilan'); }
  for (const app of ['kalkifit', 'rozgor']) {
    const A = APPS[app]; let p;
    /* 1. tanlov ekrani */
    p = await open(app); assert.equal(await p.locator('#rzGate').count(), 1, app + ': iPhone Safari — tanlov ekrani'); const gt = await T(p, '#rzGate'); assert.match(gt, /qanday ishlatasiz\?/); assert.match(gt, /ALOHIDA saqlanadi/); assert.match(gt, /Ilova qilib o'rnatish — tavsiya/); assert.match(gt, /Brauzerda davom etish/);
    assert.equal(await p.locator('#rzOnb').isVisible(), true, 'onboarding ostida'); assert.equal(await p.evaluate(() => { const g = document.getElementById('rzGate'), o = document.getElementById('rzOnb'); return parseInt(getComputedStyle(g).zIndex, 10) > parseInt(getComputedStyle(o).zIndex, 10); }), true, 'tanlov onboarding ustida');
    assert.equal(await lsOf(p, A.key), null, 'onboarding BOSHLANMADI (hech narsa yozilmadi)');
    await p.click('[data-act=gateinst]'); await p.waitForTimeout(900); assert.ok(await p.locator('.inst-step').count() >= 3, 'o\'rnatish qo\'llanmasi ochildi'); assert.equal(await p.locator('#rzGate').count(), 1, 'qo\'llanma ochilganda tanlov ekrani qoladi'); assert.equal(await p.locator('#rzSheet').evaluate((e) => parseInt(getComputedStyle(e).zIndex, 10) > 75), true, 'qo\'llanma tanlov ustida');
    await p.keyboard.press('Escape'); await p.waitForTimeout(500); assert.equal(await p.locator('#rzGate').count(), 1); await p.screenshot({ path: path.join(process.env.INSTALL_SHOTS || '/tmp', app + '_tanlov.png') }).catch(() => {});
    assert.deepEqual(await p.evaluate((k) => JSON.parse(localStorage.getItem('kalki_inst_' + k) || '{}').choice || null, app), null, 'o\'rnatishni tanlash — brauzer tanlovi emas');
    await p.click('[data-act=gateweb]'); await p.waitForTimeout(600); assert.equal(await p.locator('#rzGate').count(), 0); assert.equal(await p.locator('#rzOnb').isVisible(), true, 'onboarding boshlandi'); assert.equal((await p.evaluate((k) => JSON.parse(localStorage.getItem('kalki_inst_' + k)).choice, app)), 'browser');
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); assert.equal(await p.locator('#rzGate').count(), 0, 'tanlov eslab qolindi'); assert.equal(await p.locator('#rzOnb').isVisible(), true); assert.deepEqual(p.errs, []); await p.context().close();
    for (const ua of [UA.android, UA.desktop]) { p = await open(app, { ua }); assert.equal(await p.locator('#rzGate').count(), 0, app + ': Android/kompyuterda ekran YO\'Q'); assert.equal(await p.locator('#rzOnb').isVisible(), true); await p.context().close(); }
    log(app + ': iPhone Safari — onboarding\'dan OLDIN tanlov ekrani (hech narsa yozilmaydi), «o\'rnatish» qo\'llanmasi tanlov ustida ochiladi, «Brauzerda davom etish» → onboarding va eslab qolinadi; Android/kompyuterda ekran yo\'q');
    /* 2. ma'lumot bor → «O'rnatish» → clipboard kodi */
    const src = A.st(); p = await open(app, { state: src }); assert.equal(await p.locator('#rzGate').count(), 0, 'ma\'lumot bor — tanlov ekrani yo\'q');
    await p.click(`[data-act=tab][data-v=${A.tab}]`); await p.waitForTimeout(300); await p.click('[data-inst=row]'); await p.waitForTimeout(1200);
    const code = await p.evaluate(() => navigator.clipboard.readText()); assert.match(code, new RegExp('^kalki1\\.' + app + '\\.[zp]\\.[A-Za-z0-9_-]+$')); assert.match(await T(p, '#rzToast'), /Ma'lumotlaringiz nusxalandi — ilovani ochgach «Ko'chirish»ni bosing/); assert.match(await T(p, '.inst-guide'), /Ma'lumotlaringiz nusxalandi/);
    assert.ok(code.length < 20000, 'ixcham'); const dec = await I.decodeCode(app, code); assert.ok(dec.ok); const parsed = JSON.parse(dec.text); assert.equal(parsed.app, 'kalki-' + app); assert.deepEqual(norm(parsed.state), norm(await lsOf(p, A.key)), 'kod = butun holat');
    await p.evaluate(() => navigator.clipboard.writeText('x')); await p.click('[data-act=instcopy]'); await p.waitForTimeout(800); assert.equal(await p.evaluate(() => navigator.clipboard.readText()).then((t) => t.startsWith('kalki1.')), true, 'qayta nusxalash'); assert.deepEqual(p.errs, []); await p.context().close();
    log(app + ': ma\'lumot bor + «O\'rnatish» (Men qatori) → clipboard\'da ixcham kod (butun holat), toast va qo\'llanmada eslatma, qayta nusxalash');
    /* 3. standalone toza → Ko'chirish → bir xil */
    p = await open(app, { standalone: true, clip: code }); assert.equal(await p.locator('#rzGate').count(), 1, app + ': standalone toza — ko\'chirish ekrani'); assert.match(await T(p, '#rzGate'), /Safari'da ma'lumot kiritgan edingizmi\?/);
    await p.click('[data-act=gatemig]'); await p.waitForTimeout(1500); assert.equal(await p.locator('#rzGate').count(), 0, 'ko\'chirildi'); const got = await lsOf(p, A.key); assert.deepEqual(norm(got), norm(parsed.state), 'hamma ma\'lumot bir xil'); assert.equal(await p.locator('#rzOnb').isVisible(), false, 'onboarding yo\'q — ilova ochildi'); assert.match(await T(p, '#rzToast'), /Ma'lumotlaringiz ko'chirildi/);
    await p.reload({ waitUntil: 'networkidle' }); assert.equal(await p.locator('#rzGate').count(), 0); assert.deepEqual(norm(await lsOf(p, A.key)), norm(parsed.state)); assert.deepEqual(p.errs, []); await p.context().close();
    log(app + ': standalone toza xotira → «Ko\'chirish» (readText) → profil/ovqat/qadam/vazn/sozlamalar aynan bir xil, onboarding\'siz ochiladi');
    /* 4. xatolar */
    for (const [clip, key] of [['salom dunyo', 'eFmt'], ['kalki1.' + (app === 'kalkifit' ? 'rozgor' : 'kalkifit') + '.p.e30', 'eApp'], ['kalki1.' + app + '.z.AAAA', 'eBad'], ['kalki1.' + app + '.p.' + 'A'.repeat(300500), 'eSize'], [' ', 'eEmpty']]) {
      p = await open(app, { standalone: true, clip }); await p.click('[data-act=gatemig]'); await p.waitForTimeout(900); const msg = await T(p, '#mgErr'); assert.ok(msg, app + ' ' + key + ': xabar'); assert.match(msg, { eFmt: new RegExp(A.name + ' kodi emas yoki buzilgan'), eApp: /boshqa ilovaniki/, eBad: /buzilgan yoki eskirgan/, eSize: /juda katta/, eEmpty: /kod topilmadi/ }[key]); assert.equal(await p.locator('#mgPaste').count(), 1, 'qo\'lda joylash maydoni'); assert.equal(await p.locator('#rzGate').count(), 1); assert.equal(await lsOf(p, A.key), null, 'xato kodda hech narsa yozilmadi');
      await p.fill('#mgPaste', 'yana noto\'g\'ri'); await p.click('[data-act=gatepaste]'); await p.waitForTimeout(500); assert.match(await T(p, '#mgErr'), new RegExp(A.name + ' kodi emas yoki buzilgan')); await p.click('[data-act=gateno]'); await p.waitForTimeout(500); assert.equal(await p.locator('#rzGate').count(), 0); assert.equal(await p.locator('#rzOnb').isVisible(), true, 'onboarding'); await p.reload({ waitUntil: 'networkidle' }); assert.equal(await p.locator('#rzGate').count(), 0, '«Yo\'q» eslab qolindi'); await p.context().close(); }
    // qo'lda joylash to'g'ri kod bilan
    p = await open(app, { standalone: true, clip: 'x' }); await p.click('[data-act=gatemig]'); await p.waitForTimeout(600); await p.fill('#mgPaste', code); await p.click('[data-act=gatepaste]'); await p.waitForTimeout(1200); assert.equal(await p.locator('#rzGate').count(), 0); assert.deepEqual(norm(await lsOf(p, A.key)), norm(parsed.state)); await p.context().close();
    // ma'lumot bor standalone — ekran yo'q; buzuq JSON tuzilmasi (to'g'ri kod, noto'g'ri holat)
    p = await open(app, { standalone: true, state: A.st() }); assert.equal(await p.locator('#rzGate').count(), 0); await p.context().close();
    const badState = await I.encodeCode(app, JSON.stringify({ app: 'kalki-' + app, v: 1, state: { nima: 1 } })); p = await open(app, { standalone: true, clip: badState }); await p.click('[data-act=gatemig]'); await p.waitForTimeout(900); assert.match(await T(p, '#mgErr'), /buzilgan/); assert.equal(await lsOf(p, A.key), null); await p.context().close();
    log(app + ': buzuq kodlar (matn, boshqa ilova, buzilgan, juda katta, bo\'sh, noto\'g\'ri sxema) → tushunarli xabar + qo\'lda joylash, hech narsa yozilmaydi; «Yo\'q, yangidan» onboarding\'ga o\'tkazadi va eslab qolinadi; qo\'lda joylash ishlaydi');
    /* 5. tillar */
    const LAT = /\b[A-Za-z']{4,}\b/g, strip = (t) => t.replace(/KalkiFit|Ro'zg'or|Рузгор|Safari|Safari'da|iPhone|Kalki|KalkiFit'ni|Ro'zg'orni|iOS/gi, '').replace(/[A-Za-z]{1,3}\b/g, '');
    for (const lang of ['ru', 'cyr', '']) { for (const mode of ['choice', 'mig']) { p = await open(app, mode === 'choice' ? { lang } : { lang, standalone: true }); const t = await T(p, '#rzGate'); assert.ok(t, lang + mode); if (lang === 'ru') { assert.doesNotMatch(strip(t), LAT, app + ' ru ' + mode + ': ' + strip(t).match(LAT)); assert.match(t, mode === 'choice' ? /Как вы будете пользоваться/ : /Вводили данные в Safari/); } else if (lang === 'cyr') { assert.doesNotMatch(strip(t), LAT, app + ' cyr ' + mode + ': ' + strip(t).match(LAT)); assert.match(t, mode === 'choice' ? /ишлатасиз/ : /Сафари|Safari/); } else assert.doesNotMatch(t, /[А-Яа-яЁё]/); await p.context().close(); } }
    log(app + ': tanlov va ko\'chirish ekranlari UZ / ЎЗ / RU da aralashmasiz');
  }
} finally { await b.close(); srv.close(); }
console.log(`\n${n} ta tekshiruv guruhi o'tdi`);
