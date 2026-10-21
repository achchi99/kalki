// KalkiFit: Android'da avtomatik qadam (KalkiNative.qadam → ilovadagi «Qadam» plagini) — plagin SOXTA (Capacitor.nativePromise mock).
// Plagin yo'q (veb/iPhone) — karta avvalgidek; sensor yo'q — funksiya ko'rinmaydi; birinchi bosishda tushuntirish oynasi (Ruxsat berish / Keyinroq), rad etilsa qayta so'ralmaydi;
// avtomatik qiymat «Avtomatik» belgisi bilan, qo'lda qo'shilgani ustiga qo'shiladi (avtomatik yangilanganda yo'qolmaydi); Profil'da yoqish/o'chirish; UZ/ЎЗ/RU.   node tools/dizayn/test-qadam-auto.mjs
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
async function enter2(p, v) { await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('#spAmt'); await enter(p, v); }
async function enter(p, v) { for (const ch of String(v)) await p.click(`#rzSheet [data-k="${ch}"]`); await p.click('#spSave'); await p.waitForTimeout(450); }
try {
  /* 1. veb / iPhone: plagin yo'q — hamma narsa avvalgidek */
  let p = await mk(); assert.equal(await p.locator('.sl-auto').count(), 0); await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('#spAmt'); assert.match(await p.locator('#rzSheet').innerText(), /Telefondagi jami qadamni yozing/); await enter(p, 4200); assert.equal(await num(p), 4200);
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(300); assert.equal(await p.locator('.sl-qa').count(), 0, 'Profil: qator yo\'q'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Veb/iPhone (plagin yo\'q): karta, qo\'lda kiritish va Profil avvalgidek, xato yo\'q');
  /* 2. sensor yo'q telefon */
  p = await mk({ plugin: { available: false, granted: false, today: 0, yday: 0 } }); await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('#spAmt'); assert.equal(await p.locator('[data-act=qayes]').count(), 0, 'so\'ralmaydi');
  await p.keyboard.press('Escape'); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(300); assert.equal(await p.locator('.sl-qa').count(), 0); assert.deepEqual(p.errs, []); await p.context().close();
  log('Sensor yo\'q telefonda funksiya ko\'rinmaydi, qo\'lda kiritish qoladi');
  /* 3. birinchi bosish: tushuntirish oynasi → Keyinroq → qo'lda kiritish; qayta so'ralmaydi */
  p = await mk({ plugin: { available: true, granted: false, grant: true, today: 3456, yday: 8000 } }); assert.equal(await p.locator('.sl-auto').count(), 0, 'ruxsatsiz — belgi yo\'q');
  await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('[data-act=qayes]'); const ask = await p.locator('#rzSheet').innerText(); assert.match(ask, /Qadamlaringizni avtomatik sanaymizmi\?/); assert.match(ask, /Telefon o'zi sanaydi, joylashuvingiz olinmaydi\./); assert.match(ask, /Ruxsat berish/); assert.match(ask, /Keyinroq/); assert.doesNotMatch(ask, /halol/i);
  await p.click('[data-act=qalater]'); await p.waitForSelector('#spAmt'); assert.equal((await prefs(p)).qa, 'later'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('#spAmt'); assert.equal(await p.locator('[data-act=qayes]').count(), 0, '«Keyinroq»dan keyin qayta so\'ralmaydi'); assert.ok(!(await calls(p)).includes('Qadam.requestPermission'), 'ruxsat so\'ralmagan'); await p.context().close();
  log('Birinchi bosishda oddiy oyna («Qadamlaringizni avtomatik sanaymizmi? Telefon o\'zi sanaydi, joylashuvingiz olinmaydi.» [Ruxsat berish] [Keyinroq]); «Keyinroq» → qo\'lda kiritish, qayta so\'ralmaydi');
  /* 4. Ruxsat berish → avtomatik qiymat + «Avtomatik» belgisi; qo'lda qo'shilgani ustiga qo'shiladi; yangilanganda yo'qolmaydi */
  p = await mk({ plugin: { available: true, granted: false, grant: true, today: 3456, yday: 8000 } });
  await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('[data-act=qayes]'); await p.click('[data-act=qayes]'); await p.waitForTimeout(700);
  assert.equal((await prefs(p)).qa, 'on'); assert.ok((await calls(p)).includes('Qadam.setEnabled:true')); assert.equal(await num(p), 3456); assert.equal(await p.locator('.sl-s .sl-auto').innerText(), 'Avtomatik');
  assert.deepEqual(await day(p, YDAY).then((x) => [x.sa, x.steps]), [8000, 8000], 'kechagi kun ham (tarix)');
  await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('#spAmt'); assert.match(await p.locator('#rzSheet').innerText(), /Telefonsiz yurgan qadamlaringizni qo'shing\. Avtomatik sanalgani \(3 456\) o'zgarmaydi\./); await enter(p, 500);
  assert.equal(await num(p), 3956, 'avtomatik + qo\'lda'); assert.deepEqual(await day(p, TODAY).then((x) => [x.sa, x.steps]), [3456, 3956]);
  await p.evaluate(() => { window.__q.today = 4100; document.dispatchEvent(new Event('visibilitychange')); }); await p.waitForTimeout(700); assert.equal(await num(p), 4600, 'avtomatik yangilandi, qo\'lda qo\'shilgan 500 saqlandi');
  await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('#spAmt'); assert.match(await p.locator('#spHint').innerText(), /Qo'shilgan: 500/); await enter(p, 200); assert.equal(await num(p), 4300, 'qo\'lda qismi 200 ga o\'zgardi (avtomatik 4 100 + 200)');
  await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('#spAmt'); await p.click('#rzSheet [data-k="0"]'); assert.equal(await p.locator('#spNum').innerText(), '0'); await p.click('#spSave'); await p.waitForTimeout(450); assert.equal(await num(p), 4100, '«0» — qo\'lda qismi nolga, avtomatik o\'zgarmadi'); assert.equal((await day(p, TODAY)).sa, 4100);
  await enter2(p, 200); assert.equal(await num(p), 4300); await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('#spClear'); await p.click('#spClear'); await p.waitForTimeout(450); assert.equal(await num(p), 4100, '«Tozalash»'); assert.equal((await day(p, TODAY)).sa, 4100);
  await enter2(p, 200); assert.equal(await num(p), 4300);
  await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(400); assert.equal(await p.locator('.sl-stepbig .sl-auto').count(), 1, 'Natijalar: belgi'); assert.equal(await num(p), 4300);
  log('Ruxsat → bugungi qadam o\'zi (3 456) + «Avtomatik» belgisi, kechagi kun ham; qo\'lda +500 → 3 956; avtomatik 4 100 ga yangilansa → 4 600 (qo\'lda qismi saqlanadi); Natijalar ham');
  /* 5. maqsad va kaloriya avtomatik qiymat bilan */
  await p.evaluate(() => { window.__q.today = 15000; document.dispatchEvent(new Event('visibilitychange')); }); await p.waitForTimeout(400); await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(700);
  assert.equal(await num(p), 15200); assert.ok(await p.locator('#kBurn').count() === 1, 'qadam hisobiga kkal (+)'); const cel = await prefs(p); assert.ok(cel.cel && cel.cel.s === 1, 'kunlik maqsad bajarildi'); assert.deepEqual(p.errs, []);
  /* 6. Profil: o'chirish → belgi yo'q, setEnabled(false); qayta yoqish */
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(300); assert.match(await p.locator('.sl-qa').innerText(), /Qadamni avtomatik sanash/); await p.click('[data-act=qatog][data-v="0"]'); await p.waitForTimeout(300);
  assert.equal((await prefs(p)).qa, 'off'); assert.ok((await calls(p)).includes('Qadam.setEnabled:false')); await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(300); assert.equal(await p.locator('.sl-auto').count(), 0); assert.equal(await num(p), 15200, 'yozilgan qadam qoladi');
  await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('#spAmt'); assert.equal(await p.locator('[data-act=qayes]').count(), 0); await p.keyboard.press('Escape');
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(300); await p.click('[data-act=qatog][data-v="1"]'); await p.waitForTimeout(600); assert.equal((await prefs(p)).qa, 'on'); await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(300); assert.equal(await p.locator('.sl-auto').count(), 1); assert.deepEqual(p.errs, []); await p.context().close();
  log('Kunlik maqsad va kaloriya avtomatik qiymat bilan; Profil → «Qadamni avtomatik sanash» o\'chirish/yoqish (yozilgan qadam o\'chmaydi)');
  /* 7. rad etildi → qayta-qayta so'ralmaydi */
  p = await mk({ plugin: { available: true, granted: false, grant: false, today: 3000, yday: 0 } }); await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('[data-act=qayes]'); await p.click('[data-act=qayes]'); await p.waitForTimeout(600);
  assert.equal((await prefs(p)).qa, 'off'); assert.match(await p.locator('body').innerText(), /Ruxsat berilmadi/); assert.equal(await p.locator('.sl-auto').count(), 0);
  await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('#spAmt'); assert.equal(await p.locator('[data-act=qayes]').count(), 0, 'qayta so\'ralmaydi'); await p.keyboard.press('Escape');
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(600); await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('#spAmt'); assert.equal(await p.locator('[data-act=qayes]').count(), 0, 'qayta ochilganda ham'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Rad etilsa: tushuntirish toast, qayta so\'ralmaydi (qayta ochilganda ham)');
  /* 8. RU va ЎЗ matnlari, 360 px katta shrift: kartaga sig'adi */
  for (const [lang, url, re, badge] of [['ru', '/ru/kalkifit', /Считать шаги автоматически\?[\s\S]*Телефон считает сам, местоположение не используется\.[\s\S]*Разрешить[\s\S]*Позже/, 'Авто'], ['cyr', '/kalkifit?lang=cyr', /Қадамларингизни автоматик санаймизми\?[\s\S]*Телефон ўзи санайди, жойлашувингиз олинмайди\.[\s\S]*Рухсат бериш[\s\S]*Кейинроқ/, 'Автоматик']]) {
    p = await mk({ plugin: { available: true, granted: false, grant: true, today: 12345, yday: 0 }, url, lang, w: 360, h: 640 }); await p.evaluate(() => document.documentElement.classList.add('fs-big'));
    await p.click('.sl-s [data-act=addsteps] >> nth=0'); await p.waitForSelector('[data-act=qayes]'); await p.waitForTimeout(300); assert.match(await p.locator('#rzSheet').innerText(), re, lang); await p.click('[data-act=qayes]'); await p.waitForTimeout(700);
    assert.equal((await p.locator('.sl-s .sl-auto').innerText()).trim(), badge); const g = await p.evaluate(() => { const c = document.querySelector('.sl-s').getBoundingClientRect(), a = document.querySelector('.sl-s .sl-auto').getBoundingClientRect(); return { ok: a.right <= c.right + 0.5 && a.left >= c.left, sw: document.documentElement.scrollWidth <= innerWidth }; });
    assert.ok(g.ok && g.sw, lang + ': belgi kartaga sig\'adi'); assert.deepEqual(p.errs, []); await p.context().close(); }
  log('RU va ЎЗ matnlari (oyna, belgi), 360 px + katta shrift: belgi kartaga sig\'adi, gorizontal skroll yo\'q');
  console.log('\nAvtomatik qadam: ' + n + ' tekshiruv OK');
} finally { await b.close().catch(() => {}); srv.close(); }
