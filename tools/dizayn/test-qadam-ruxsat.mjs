// KalkiFit v83: Android — qayta o'rnatish/yangilashdan keyin qadam ruxsati JIM yo'qolishi. «ulangan» belgisi (prefs.qa = 'on') bor, lekin telefonda ruxsat yo'q:
// 1) Bugun'da aniq ogohlantirish kartasi («Qadam sanash to'xtadi») + mini-halqada belgi + bir bosishda ruxsat oynasi; jim nol ko'rsatilmaydi; 2) «boshqa so'ramaslik» (oyna chiqmadi) — sozlamaga yo'riqnoma + «Sozlamani ochish»;
// 3) ruxsat qaytgach (tugma yoki tizim sozlamasidan, ilova oldinga qaytganda) — karta yo'qoladi, 30 kunlik qadam qayta o'qiladi (bo'shliq yo'q); 4) hodisalar qadam_ruxsat (yoq / qaytdi / sozlamaga_otdi; bir yo'qolish — bir marta);
// 5) bildirishnoma ruxsati ham (Profil → Eslatmalar: «yoqilgan», lekin tizim ruxsati yo'q → ogohlantirish + «Yoqish»); 6) oddiy holatlarda (ruxsat bor / hech qachon ulanmagan / foydalanuvchi o'chirgan) karta YO'Q; ESKI APK (sozlama yo'q) — yo'riqnoma matni; RU, tungi.
//   node tools/dizayn/test-qadam-ruxsat.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const S = (await import(ROOT + '/assets/kalkifit-core.js')).default; const D = S.dates;
const dstr = (o) => { const d = new Date(); d.setDate(d.getDate() + o); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const TODAY = dstr(0), YDAY = dstr(-1), D3 = dstr(-3);
function seed(prefs) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 864e5; st.prefs = Object.assign({ tipsDone: true, jokes: false, yemayK: 1, introDone: true, lpTip: 1, ttAsked: 1, hwSeen: TODAY, h_hafta: Date.now(), h_backup: Date.now(), crd: { ekran: { ok: 1 }, ilova: { ok: 1 }, akkaunt: { ok: 1 } } }, prefs || {});
  st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 2, goal: 'lose', job: 'sit' }; S.addWeight(st, TODAY, 80); return st; }
/* plugin: { available, granted, sensor, grant (requestPermission natijasi), instant (oyna chiqmadi — tezda rad), sozlama (openSettings bor?), notif: 'granted'|'prompt'|'denied', notifGrant, days: [{sana, qadam}] } */
async function mk(o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', locale: 'uz-UZ', colorScheme: o.th || 'light' });
  await c.addInitScript((a) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(a.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_stat_test', '1'); localStorage.removeItem('kalki_stat_q'); if (a.lang) localStorage.setItem('kalki_lang', a.lang); } } catch (e) {}
    const q = window.__q = Object.assign({ calls: [], days: [], notif: 'granted' }, a.plugin);
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: [{ name: 'Qadam' }, { name: 'LocalNotifications' }],
      nativePromise: (pl, m, opt) => { q.calls.push(pl + '.' + m + (opt && opt.n ? ':' + opt.n : '') + (opt && 'on' in opt ? ':' + opt.on : ''));
        if (pl === 'LocalNotifications') { if (m === 'checkPermissions') return Promise.resolve({ display: q.notif }); if (m === 'requestPermissions') { if (q.notifGrant) q.notif = 'granted'; return Promise.resolve({ display: q.notifGrant ? 'granted' : 'denied' }); } return Promise.resolve({}); }
        if (pl !== 'Qadam') return Promise.reject(new Error('yo\'q'));
        if (m === 'isAvailable') return Promise.resolve({ available: q.available, granted: q.available && q.granted, enabled: !!q.enabled, sensor: true, sensorGranted: q.granted, hc: 'none', source: q.granted ? 'sensor' : '' });
        if (m === 'requestPermission' || m === 'ulash') { if (q.instant) return Promise.resolve({ granted: false, sensor: true, sensorGranted: false }); q.granted = !!q.grant; return Promise.resolve({ granted: q.granted, sensor: true, sensorGranted: q.granted, source: 'sensor' }); }
        if (m === 'setEnabled') { q.enabled = !!opt.on && q.granted; return Promise.resolve({ enabled: q.enabled }); }
        if (m === 'getToday') return Promise.resolve({ qadam: 0, oxirgiYangilanish: Date.now(), sana: a.TODAY });
        if (m === 'getDays') return Promise.resolve({ kunlar: q.days, source: 'sensor' });
        if (m === 'openSettings') return q.sozlama === false ? Promise.reject(new Error('eski APK')) : Promise.resolve({});
        return Promise.reject(new Error('?')); }, addListener: () => ({ remove() {} }) }; }, { st: o.st || seed({ qa: 'on' }), plugin: o.plugin || {}, lang: o.lang, TODAY });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.goto(BASE + (o.lang === 'ru' ? '/ru/kalkifit' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(1500); return p; }
const Q = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_stat_q') || '[]').map((x) => x[0] + ':' + x[1]));
const calls = (p) => p.evaluate(() => window.__q.calls); const nb = (s) => String(s).replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
const kind = (p) => p.evaluate(() => { const s = document.getElementById('rzSheet'); return !s.hidden && s.classList.contains('open') ? s.getAttribute('data-kind') : null; });
const stOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')));
const show = (p) => p.evaluate(() => { document.dispatchEvent(new Event('visibilitychange')); });
try {
  /* 1. ruxsat yo'qolgan: karta, mini-halqa belgisi, jim nol yo'q, hodisa bir marta */
  let p = await mk({ plugin: { available: true, granted: false, grant: true, days: [] } });
  assert.equal(await p.locator('#qaLost').count(), 1, 'ogohlantirish kartasi'); const t1 = nb(await p.locator('#qaLost').innerText()); assert.match(t1, /Qadam sanash to'xtadi/); assert.match(t1, /Ruxsatni qayta bering/); assert.equal(await p.locator('#qaLost [data-act=qafix]').count(), 1);
  assert.ok(await p.locator('#qaLost').evaluate((e) => e.getAttribute('role') === 'alert'), 'role=alert'); assert.equal(await p.locator('.sl-s .sl-warnb').count(), 1, 'mini-halqada ogohlantirish belgisi'); assert.equal(await p.locator('.sl-s[data-st=lost]').count(), 1); assert.match(nb(await p.locator('.sl-s .sl-pill:not(.sw-pill)').innerText()), /Ruxsat kerak/);
  assert.ok((await p.locator('#qaLost [data-act=qafix]').boundingBox()).height >= 44, 'tugma ≥ 44 px'); assert.equal((await Q(p)).filter((x) => x === 'qadam_ruxsat:yoq').length, 1); await show(p); await p.waitForTimeout(500); assert.equal((await Q(p)).filter((x) => x === 'qadam_ruxsat:yoq').length, 1, 'bir yo\'qolish — bir marta');
  assert.equal((await stOf(p)).prefs.qa, 'on', '«ulangan» belgisi o\'zgarmadi'); assert.deepEqual(p.errs, []);
  log('Ruxsat yo\'q + «ulangan» belgisi: «Qadam sanash to\'xtadi» kartasi (role=alert, tugma ≥ 44 px), mini-halqada «!» va «Ruxsat kerak», hodisa qadam_ruxsat:yoq — bir marta');
  /* 2. «Ruxsatni qayta berish» → tizim oynasi → ruxsat berildi: karta yo'qoladi, qaytdi, 30 kunlik qayta o'qish, bo'shliq to'ldirildi */
  await p.evaluate((a) => { window.__q.days = [{ sana: a.d3, qadam: 4321 }, { sana: a.y, qadam: 5000 }, { sana: a.t, qadam: 1200 }]; }, { d3: D3, y: YDAY, t: TODAY }); await p.click('#qaLost [data-act=qafix]'); await p.waitForTimeout(1300);
  assert.equal(await p.locator('#qaLost').count(), 0, 'karta yo\'qoldi'); assert.equal(await p.locator('.sl-s .sl-warnb').count(), 0); const c2 = await calls(p); assert.ok(c2.includes('Qadam.setEnabled:true'), 'native qayta yoqildi'); assert.ok(c2.includes('Qadam.getDays:30'), '30 kunlik qayta o\'qish: ' + c2.join()); let s2 = await stOf(p);
  assert.equal(s2.days[D3].steps, 4321, 'o\'tkazib yuborilgan kun to\'ldirildi'); assert.equal(s2.days[TODAY].steps, 1200); assert.equal(s2.prefs.qaLost, undefined); assert.ok((await Q(p)).includes('qadam_ruxsat:qaytdi')); assert.equal((await Q(p)).filter((x) => x === 'qadam_ruxsat:qaytdi').length, 1);
  assert.equal(await p.locator('.sl-s[data-st=on]').count(), 1); log('«Ruxsatni qayta berish» → karta yo\'qoladi, native qayta yoqiladi, getDays(30) bilan 3 kun oldingi qadam ham tiklandi, hodisa qaytdi (bir marta)'); await p.context().close();
  /* 3. «boshqa so'ramaslik»: oyna chiqmadi → yo'riqnoma + «Sozlamani ochish» (eski APK — matn) */
  p = await mk({ plugin: { available: true, granted: false, instant: true, days: [] } }); await p.click('#qaLost [data-act=qafix]'); await p.waitForTimeout(700); assert.equal(await kind(p), 'qaset'); const t3 = nb(await p.locator('#rzSheet').innerText());
  assert.match(t3, /Telefon bu ruxsatni qayta so'ramayapti/); assert.match(t3, /Jismoniy faollik/); assert.match(t3, /Health Connect → Ilova ruxsatlari → KalkiFit/); assert.equal(await p.locator('#qaLost').count(), 1, 'ruxsat yo\'q — karta turaveradi');
  await p.click('#rzSheet [data-act=qaset]'); await p.waitForTimeout(400); assert.ok((await calls(p)).includes('Qadam.openSettings')); assert.ok((await Q(p)).includes('qadam_ruxsat:sozlamaga_otdi'));
  /* tizim sozlamasidan ruxsat berildi, ilova oldinga qaytdi */
  await p.evaluate((a) => { window.__q.granted = true; window.__q.days = [{ sana: a.d3, qadam: 777 }, { sana: a.t, qadam: 900 }]; }, { d3: D3, t: TODAY }); await p.keyboard.press('Escape'); await show(p); await p.waitForTimeout(1500);
  assert.equal(await p.locator('#qaLost').count(), 0, 'sozlamadan qaytgach karta yo\'qoldi'); assert.ok((await calls(p)).includes('Qadam.getDays:30')); const s3 = await stOf(p); assert.equal(s3.days[D3].steps, 777); assert.ok((await Q(p)).includes('qadam_ruxsat:qaytdi')); assert.equal(s3.prefs.qaBlk, undefined);
  log('Oyna chiqmasa: yo\'riqnoma (Sozlamani ochish → Jismoniy faollik; Health Connect yo\'li), openSettings + hodisa sozlamaga_otdi; sozlamadan ruxsat berilib qaytilsa — karta o\'zi yo\'qoladi, 30 kun qayta o\'qiladi'); await p.context().close();
  p = await mk({ plugin: { available: true, granted: false, instant: true, sozlama: false } }); await p.click('#qaLost [data-act=qafix]'); await p.waitForTimeout(600); await p.click('#rzSheet [data-act=qaset]'); await p.waitForTimeout(500); assert.match(nb(await p.locator('.rz-toast, #rzToast, [role=status]').allInnerTexts().then((l) => l.join(' '))), /Telefon sozlamalari → Ilovalar → KalkiFit → Ruxsatlar → Jismoniy faollik/, 'eski APK — matnli yo\'riqnoma'); await p.context().close();
  log('Eski APK (openSettings yo\'q): xabarda sozlama yo\'li matn bilan');
  /* 4. oddiy holatlarda karta YO'Q */
  for (const [nm, o] of [['ruxsat bor', { st: seed({ qa: 'on' }), plugin: { available: true, granted: true, enabled: true, days: [{ sana: TODAY, qadam: 3000 }] } }], ['hech qachon ulanmagan', { st: seed({}), plugin: { available: true, granted: false } }], ['foydalanuvchi o\'chirgan (off)', { st: seed({ qa: 'off' }), plugin: { available: true, granted: false } }], ['sensor ham, HC ham yo\'q', { st: seed({ qa: 'on' }), plugin: { available: false, granted: false } }]]) {
    const q = await mk(o); assert.equal(await q.locator('#qaLost').count(), 0, nm); assert.equal(await q.locator('.sl-warnb').count(), 0, nm); assert.ok(!(await Q(q)).includes('qadam_ruxsat:yoq'), nm + ': hodisa yo\'q'); assert.deepEqual(q.errs, [], nm); await q.context().close(); }
  log('Karta YO\'Q: ruxsat bor / hech qachon ulanmagan / foydalanuvchi o\'chirgan / qadam manbai umuman yo\'q — hodisa ham yo\'q');
  /* 5. bildirishnoma ruxsati (Profil → Eslatmalar) */
  p = await mk({ st: seed({ qa: 'off', push: { on: true, local: true, t: 1 } }), plugin: { available: false, notif: 'prompt', notifGrant: true } }); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(900);
  const t5 = nb(await p.locator('#pushRow').innerText()); assert.match(t5, /Bildirishnomalar o'chiq — telefon sozlamasidan yoqing/); assert.equal(await p.locator('#pushRow [data-act=pushfix]').count(), 1); assert.ok((await Q(p)).includes('qadam_ruxsat:bildirishnoma_yoq'));
  await p.click('#pushRow [data-act=pushfix]'); await p.waitForTimeout(900); assert.doesNotMatch(nb(await p.locator('#pushRow').innerText()), /Bildirishnomalar o'chiq/); assert.ok((await Q(p)).includes('qadam_ruxsat:bildirishnoma_qaytdi')); assert.equal((await stOf(p)).prefs.pushLost, undefined); await p.context().close();
  p = await mk({ st: seed({ qa: 'off', push: { on: true, local: true, t: 1 } }), plugin: { available: false, notif: 'granted' } }); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(700); assert.doesNotMatch(nb(await p.locator('#pushRow').innerText()), /o'chiq/); assert.ok(!(await Q(p)).includes('qadam_ruxsat:bildirishnoma_yoq')); await p.context().close();
  log('Bildirishnoma: «yoqilgan» + tizim ruxsati yo\'q → Profil\'da ogohlantirish + «Yoqish» (ruxsat so\'raladi, qaytsa qator tozalanadi); ruxsat bor — jim; hodisalar bildirishnoma_yoq / qaytdi');
  /* 6. RU, tungi, tor ekran */
  p = await mk({ lang: 'ru', w: 360, h: 740, th: 'dark', plugin: { available: true, granted: false, instant: true } }); assert.match(nb(await p.locator('#qaLost').innerText()), /Подсчёт шагов остановился/); assert.match(nb(await p.locator('#qaLost').innerText()), /Вернуть разрешение/); assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'gorizontal siljish yo\'q');
  await p.click('#qaLost [data-act=qafix]'); await p.waitForTimeout(600); assert.match(nb(await p.locator('#rzSheet').innerText()), /Телефон больше не запрашивает это разрешение/); assert.match(nb(await p.locator('#rzSheet').innerText()), /Открыть настройки/); assert.deepEqual(p.errs, []); await p.context().close();
  log('RU + tungi 360 px: matnlar, siljish yo\'q, yo\'riqnoma oynasi');
  console.log('\nHammasi o\'tdi: ' + n);
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
