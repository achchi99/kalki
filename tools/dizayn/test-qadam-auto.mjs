// KalkiFit: Android'da avtomatik qadam (KalkiNative.qadam → ilovadagi «Qadam» plagini) — plagin SOXTA (Capacitor.nativePromise mock).
// Qadam FAQAT avtomatik (qo'lda kiritish yo'q). Plagin yo'q (veb/iPhone) — Bugun'da karta yo'q, Tarix'da bitta qator; sensor yo'q — so'ralmaydi; birinchi bosishda ulash oynasi (Ruxsat berish / Keyinroq);
// avtomatik qiymat + manba nomi; Profil'da switch (Eslatmalar kabi) bilan yoqish/o'chirish; UZ/ЎЗ/RU.   node tools/dizayn/test-qadam-auto.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const S = (await import(ROOT + '/assets/kalkifit-core.js')).default; const D = S.dates;
const dstr = (o) => { const d = new Date(); d.setDate(d.getDate() + o); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const TODAY = dstr(0), YDAY = dstr(-1);
function seed() { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 864e5; st.prefs = { tipsDone: true, jokes: false, yemayK: 1, introDone: true }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = D.addDays(TODAY, -8); S.addWeight(st, TODAY, 80); return st; }
/* o.plugin: null (veb) | { available, granted, grant (requestPermission natijasi), today, yday } */
async function mk(o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', locale: 'uz-UZ' });
  await c.addInitScript((a) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(a.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_lang', a.lang || 'uz'); } } catch (e) {}
    if (!a.plugin) return;
    const q = window.__q = Object.assign({ calls: [] }, a.plugin);
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: [{ name: 'Qadam' }],
      nativePromise: (pl, m, opt) => { q.calls.push(pl + '.' + m + (opt && 'on' in opt ? ':' + opt.on : '')); if (pl !== 'Qadam') return Promise.reject(new Error('yo\'q'));
        if (m === 'isAvailable') return Promise.resolve({ available: q.available, granted: q.available && q.granted, enabled: !!q.enabled });
        if (m === 'requestPermission') { q.granted = !!q.grant; return Promise.resolve({ granted: q.granted }); }
        if (m === 'setEnabled') { q.enabled = !!opt.on && q.granted; return Promise.resolve({ enabled: q.enabled }); }
        if (m === 'getToday') return Promise.resolve({ qadam: q.today, oxirgiYangilanish: Date.now(), sana: a.TODAY });
        if (m === 'getDays') return Promise.resolve({ kunlar: [{ sana: a.YDAY, qadam: q.yday }, { sana: a.TODAY, qadam: q.today }] });
        return Promise.reject(new Error('?')); } }; }, { st: o.st || seed(), plugin: o.plugin || null, lang: o.lang, TODAY, YDAY });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.goto(BASE + (o.url || '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(700); return p; }
const day = (p, d) => p.evaluate((d) => { const s = JSON.parse(localStorage.getItem('kalki_fit')); return s.days[d] || null; }, d);
const prefs = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')).prefs);
const num = async (p) => +(await p.locator('#sNum').first().innerText()).replace(/\D/g, '');
const calls = (p) => p.evaluate(() => window.__q.calls.slice());
try {
  /* 1. veb / iPhone: plagin yo'q — qadam kartasi YO'Q (qo'lda kiritish yo'q), Tarix'da bitta qator */
  let p = await mk(); assert.equal(await p.locator('.sl-s').count(), 0, 'Bugun: qadam kartasi yo\'q'); assert.equal(await p.locator('[data-act=addsteps]').count(), 0); assert.equal(await p.locator('.sl-duo.one #wCard').count(), 1, 'suv kartasi to\'liq kenglikda');
  await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(300); assert.equal((await p.locator('.sl-stepweb').innerText()).trim(), 'Qadam ilovada avtomatik sanaladi'); assert.equal(await p.locator('.sl-stepbig, [data-act=stephelp]').count(), 0);
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(300); assert.equal(await p.locator('#qaRow').count(), 0, 'Profil: qator yo\'q'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Veb/iPhone (plagin yo\'q): Bugun\'da qadam kartasi yo\'q, Tarix\'da bitta qator «Qadam ilovada avtomatik sanaladi», Profil\'da qator yo\'q');
  /* 2. sensor/Health Connect yo'q telefon: karta bor, bosilsa — ma'lumot oynasi (qo'lda kiritish yo'q) */
  p = await mk({ plugin: { available: false, granted: false, today: 0, yday: 0 } }); await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForTimeout(500); assert.equal(await p.locator('[data-act=qayes]').count(), 0, 'so\'ralmaydi'); assert.equal(await p.locator('#spAmt, [data-act=qafix]').count(), 0, 'qo\'lda kiritish yo\'q');
  await p.keyboard.press('Escape'); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(300); assert.equal(await p.locator('#qaRow').count(), 0); assert.deepEqual(p.errs, []); await p.context().close();
  log('Sensor yo\'q telefonda: so\'ralmaydi, qo\'lda kiritish yo\'q, Profil\'da qator yo\'q');
  /* 3. birinchi bosish: ulash oynasi → Keyinroq → oyna yopiladi; kartada «Yoqish» */
  p = await mk({ plugin: { available: true, granted: false, grant: true, today: 3456, yday: 8000 } }); assert.equal(await p.locator('.sl-src').count(), 0, 'ruxsatsiz — manba yo\'q');
  await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('[data-act=qayes]'); const ask = await p.locator('#rzSheet').innerText(); assert.match(ask, /Qadamlarni ulash/); assert.match(ask, /«Ruxsat berish»ni bosing/); assert.match(ask, /Qadamlar Health Connect \(Google Fit va boshqalar\) yoki telefon sensoridan olinadi\. Joylashuv olinmaydi\./); assert.match(ask, /Ruxsat berish/); assert.match(ask, /Keyinroq/); assert.doesNotMatch(ask, /halol/i);
  await p.click('[data-act=qalater]'); await p.waitForTimeout(400); assert.equal((await prefs(p)).qa, 'later'); assert.equal(await p.locator('#spAmt').count(), 0, 'qo\'lda kiritish oynasi yo\'q'); assert.ok(!(await calls(p)).includes('Qadam.requestPermission'), 'ruxsat so\'ralmagan');
  assert.equal((await p.locator('.sl-s .sl-pill[data-act=qaulash]').innerText()).trim(), 'Yoqish'); await p.context().close();
  log('Birinchi bosishda ulash oynasi [Ruxsat berish] [Keyinroq]; «Keyinroq» → oyna yopiladi, kartada «Yoqish» (qo\'lda kiritish yo\'q)');
  /* 4. Ruxsat berish → avtomatik qiymat + manba; karta bosilsa — faqat ma'lumot */
  p = await mk({ plugin: { available: true, granted: false, grant: true, today: 3456, yday: 8000 } });
  await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('[data-act=qayes]'); await p.click('[data-act=qayes]'); await p.waitForTimeout(700);
  assert.equal((await prefs(p)).qa, 'on'); assert.ok((await calls(p)).includes('Qadam.setEnabled:true')); assert.equal(await num(p), 3456); assert.equal(await p.locator('.sl-s .sl-src').innerText(), 'Telefon sensori'); assert.equal(await p.locator('.sl-s .sl-pill').count(), 0, 'avtomatik — tugma yo\'q');
  assert.deepEqual(await day(p, YDAY).then((x) => [x.sa, x.steps]), [8000, 8000], 'kechagi kun ham (tarix)');
  await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForTimeout(500); assert.match(await p.locator('#rzSheet').innerText(), /3 456/); assert.equal(await p.locator('#rzSheet [data-act=qafix], #spAmt').count(), 0, '«Qo\'lda tuzatish» yo\'q'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.evaluate(() => { document.querySelector('.sl-macs').__keep = 1; document.querySelector('#mainAdd').__keep = 1; });
  await p.evaluate(() => { window.__q.today = 4100; document.dispatchEvent(new Event('visibilitychange')); }); await p.waitForTimeout(700); assert.equal(await num(p), 4100, 'avtomatik yangilandi');
  const kept = await p.evaluate(() => ({ mac: document.querySelector('.sl-macs').__keep === 1, add: document.querySelector('#mainAdd').__keep === 1, anim: getComputedStyle(document.querySelector('.sl-big')).animationName, quiet: !!(window.KalkiSW && KalkiSW.isQuiet()) }));
  assert.ok(kept.mac && kept.add, 'qadam yangilanganda o\'zgarmagan bloklar joyida qoldi (butun ekran qayta chizilmaydi): ' + JSON.stringify(kept)); assert.equal(kept.anim, 'none', 'kaloriya kartasi qayta chizilganda «fadeUp» qayta o\'ynamaydi'); assert.ok(kept.quiet, 'SW yangilansa ham ish paytida reload yo\'q (quiet)');
  await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(400); assert.equal(await p.locator('.sl-stepbig .sl-src').count(), 1, 'Tarix: manba nomi'); assert.equal(await num(p), 4100); assert.equal(await p.locator('[data-act=editsteps], .sl-stepbig [data-act=addsteps], [data-act=stephelp]').count(), 0, 'Tarix: kiritish yo\'q');
  log('Ruxsat → bugungi qadam o\'zi (3 456) + manba nomi, kechagi kun ham; karta bosilsa faqat jami va manba; avtomatik 4 100 ga yangilanadi — o\'zgarmagan bloklar joyida qoladi, animatsiya qayta o\'ynamaydi, reload yo\'q; Tarix\'da kiritish yo\'q');
  /* 5. maqsad va kaloriya avtomatik qiymat bilan */
  await p.evaluate(() => { window.__q.today = 15000; document.dispatchEvent(new Event('visibilitychange')); }); await p.waitForTimeout(400); await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(700);
  assert.equal(await num(p), 15000); assert.ok(await p.locator('#kBurn').count() === 1, 'qadam hisobiga kkal (+)'); const cel = await prefs(p); assert.ok(cel.cel && cel.cel.s === 1, 'kunlik maqsad bajarildi'); assert.deepEqual(p.errs, []);
  /* 6. Profil: switch (Eslatmalar kabi) — o'chirish / yoqish */
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(300); assert.match(await p.locator('#qaRow').innerText(), /Qadamni avtomatik sanash\s*Telefon sensori orqali/); assert.equal(await p.locator('#qaRow [role=switch][aria-checked=true]').count(), 1); assert.equal(await p.locator('#qaRow').getByText(/Yoqilgan|O'chirilgan/).count(), 0, 'eski segment yo\'q');
  await p.click('#qaRow [data-act=qatog]'); await p.waitForTimeout(300);
  assert.equal((await prefs(p)).qa, 'off'); assert.ok((await calls(p)).includes('Qadam.setEnabled:false')); assert.equal(await p.locator('#qaRow [role=switch][aria-checked=false]').count(), 1); await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(300); assert.equal(await p.locator('.sl-src').count(), 0); assert.equal(await p.locator('.sl-s .sl-pill[data-act=qaulash]').count(), 1, 'o\'chirilgach — «Yoqish»'); assert.equal(await num(p), 15000, 'yozilgan qadam qoladi');
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(300); await p.click('#qaRow [data-act=qatog]'); await p.waitForTimeout(600); assert.equal((await prefs(p)).qa, 'on'); await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(300); assert.equal(await p.locator('.sl-s .sl-src').count(), 1); assert.deepEqual(p.errs, []); await p.context().close();
  log('Kunlik maqsad va kaloriya avtomatik qiymat bilan; Profil → «Qadamni avtomatik sanash» switch (izoh «Telefon sensori orqali»), o\'chirish/yoqish (yozilgan qadam o\'chmaydi)');
  /* 7. rad etildi → toast; qo'lda kiritish yo'q */
  p = await mk({ plugin: { available: true, granted: false, grant: false, today: 3000, yday: 0 } }); await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('[data-act=qayes]'); await p.click('[data-act=qayes]'); await p.waitForTimeout(600);
  assert.equal((await prefs(p)).qa, 'off'); assert.match(await p.locator('body').innerText(), /Ruxsat berilmadi/); assert.equal(await p.locator('.sl-src').count(), 0); assert.equal(await p.locator('#spAmt').count(), 0); assert.deepEqual(p.errs, []); await p.context().close();
  log('Rad etilsa: tushuntirish toast, qo\'lda kiritish oynasi yo\'q');
  /* 7b. Profil 360 px, katta shrift (textZoom ~115%): switch qatori — matn switch bilan kesishmaydi */
  p = await mk({ plugin: { available: true, granted: true, grant: true, enabled: true, today: 3000, yday: 0 }, st: Object.assign(seed(), { prefs: Object.assign(seed().prefs, { qa: 'on' }) }), w: 360, h: 760 }); await p.evaluate(() => document.documentElement.classList.add('fs-big'));
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500);
  const gq = await p.evaluate(() => { const r = (q) => document.querySelector(q).getBoundingClientRect(), t = r('#qaRow .t b'), sm = r('#qaRow .t small'), sw = r('#qaRow .sl-sw'), row = r('#qaRow'); return { w: Math.round(sw.width), ov: t.right > sw.left + 0.5 || sm.right > sw.left + 0.5, inRow: sw.right <= row.right + 0.5 && sw.top >= row.top - 0.5 && sw.bottom <= row.bottom + 0.5 }; });
  assert.equal(gq.w, 52, 'switch 52 px'); assert.ok(!gq.ov, 'matn switch ustiga chiqmaydi'); assert.ok(gq.inRow, 'switch qator ichida'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Profil 360 px + katta shrift: «Qadamni avtomatik sanash» qatori — matn switch bilan kesishmaydi');
  /* 8. RU va ЎЗ matnlari, 360 px katta shrift: kartaga sig'adi */
  for (const [lang, url, re, badge] of [['ru', '/ru/kalkifit', /Подключить шаги[\s\S]*Шаги берутся из Health Connect \(Google Fit и другие\) или датчика телефона\. Местоположение не используется\.[\s\S]*Разрешить[\s\S]*Позже/, 'Датчик телефона'], ['cyr', '/kalkifit?lang=cyr', /Қадамларни улаш[\s\S]*Қадамлар Health Connect \(Google Fit ва бошқалар\) ёки телефон сенсоридан олинади\. Жойлашув олинмайди\.[\s\S]*Рухсат бериш[\s\S]*Кейинроқ/, 'Телефон сенсори']]) {
    p = await mk({ plugin: { available: true, granted: false, grant: true, today: 12345, yday: 0 }, url, lang, w: 360, h: 640 }); await p.evaluate(() => document.documentElement.classList.add('fs-big'));
    await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('[data-act=qayes]'); await p.waitForTimeout(300); assert.match(await p.locator('#rzSheet').innerText(), re, lang); await p.click('[data-act=qayes]'); await p.waitForTimeout(700);
    assert.equal((await p.locator('.sl-s .sl-src').innerText()).trim(), badge); const g = await p.evaluate(() => { const c = document.querySelector('.sl-s').getBoundingClientRect(), a = document.querySelector('.sl-s .sl-src').getBoundingClientRect(); return { ok: a.right <= c.right + 0.5 && a.left >= c.left, sw: document.documentElement.scrollWidth <= innerWidth }; });
    assert.ok(g.ok && g.sw, lang + ': belgi kartaga sig\'adi'); assert.deepEqual(p.errs, []); await p.context().close(); }
  log('RU va ЎЗ matnlari (oyna, belgi), 360 px + katta shrift: belgi kartaga sig\'adi, gorizontal skroll yo\'q');
  console.log('\nAvtomatik qadam: ' + n + ' tekshiruv OK');
} finally { await b.close().catch(() => {}); srv.close(); }
