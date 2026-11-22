// KalkiFit v88 «Ovqat eslatmalari» — ilova: taklif kartasi (birinchi ovqatdan keyin, ruxsat — faqat bosilgandan so'ng), Android lokal bildirishnomalar (Capacitor mock:
// 7 kunlik reja, yozilgan ovqat → bugungi bekor, ruxsat berildi / rad etildi / yo'qoldi), bosilganda shu ovqatning qo'shish oynasi (qidiruv fokusda, «Kecha kabi», «Oxirgilar»,
// 10 daqiqada yozildi), Profil sozlamalari (vaqt, yoqish/o'chirish, siyrak → «Hammasini qaytarish»), veb-push (obuna, jadval, «yozildi»/«bosildi» belgisi — taomsiz),
// iPhone (bosh ekranga qo'shing yo'riqnomasi), statistika; RU/ЎЗ; 360 px.   node tools/dizayn/test-eslatma-ui.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates;
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const T0 = D.today(), YD = D.addDays(T0, -1);
function seed(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - (o.age == null ? 10 : o.age) * 864e5; st.prefs = Object.assign({ baliqOff: true, yemayK: 1, jokes: false, suvFrom: T0, hwSeen: T0, ttAsked: 1, lpTip: 1, fc: { done: 1 }, hafta: false }, o.prefs || {}); st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'lose' }; S.addWeight(st, T0, 80);
  (o.food || []).forEach(([d, fid, meal, kcal]) => S.addFood(st, d, { fid, meal, unit: 'porsiya', qty: 1, g: 100, kcal, p: 5, f: 5, c: 5, ts: 1 })); return st; }
/* Android: Capacitor + LocalNotifications mock — q.sch (rejalanganlar), q.cancel, q.perm, q.ask (requestPermissions javobi), q.ls (tinglovchilar) */
const NATIVE = (o) => { const q = window.__q = { sch: [], cancelled: [], calls: [], perm: o.perm || 'prompt', ask: o.ask || 'granted', ls: {} };
  window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: ['LocalNotifications', 'App', 'Qadam'].map((name) => ({ name, methods: [] })),
    nativePromise: (pl, m, opt) => { q.calls.push(pl + '.' + m); const R = (x) => Promise.resolve(JSON.parse(JSON.stringify(x)));
      if (pl === 'App' && m === 'getInfo') return R({ version: '1.0.13', build: 15 });
      if (pl === 'LocalNotifications') { if (m === 'checkPermissions') return R({ display: q.perm }); if (m === 'requestPermissions') { q.perm = q.ask; return R({ display: q.ask }); }
        if (m === 'schedule') { (opt.notifications || []).forEach((x) => { q.sch = q.sch.filter((y) => y.id !== x.id); q.sch.push({ id: x.id, at: x.schedule && x.schedule.at ? new Date(x.schedule.at).getTime() : null, body: x.body, extra: x.extra, weekly: !!(x.schedule && x.schedule.on) }); }); return R({}); }
        if (m === 'cancel') { const ids = (opt.notifications || []).map((x) => x.id); q.cancelled.push(ids); q.sch = q.sch.filter((y) => !ids.includes(y.id)); return R({}); }
        if (m === 'getPending') return R({ notifications: q.sch }); }
      if (pl === 'Qadam' && m === 'isAvailable') return R({ available: false });
      return Promise.reject(new Error('?')); },
    addListener: (pl, ev, cb) => { (q.ls[pl + ':' + ev] = q.ls[pl + ':' + ev] || []).push(cb); return { remove() {} }; } }; };
/* veb: Notification + PushManager + serviceWorker mock */
const WEB = (o) => { const q = window.__w = { perm: o.perm || 'default', sub: null };
  const sub = () => ({ endpoint: 'https://fcm.googleapis.com/fcm/send/testendpoint123', toJSON() { return { endpoint: this.endpoint, keys: { p256dh: 'B'.repeat(87), auth: 'A'.repeat(22) } }; }, unsubscribe() { q.sub = null; return Promise.resolve(true); } });
  const reg = { pushManager: { getSubscription: () => Promise.resolve(q.sub), subscribe: () => { q.sub = sub(); return Promise.resolve(q.sub); } }, showNotification() {} };
  window.Notification = function () {}; Object.defineProperty(window.Notification, 'permission', { get: () => q.perm }); window.Notification.requestPermission = () => { q.perm = o.ask || 'granted'; return Promise.resolve(q.perm); };
  window.PushManager = function () {};
  try { Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { ready: Promise.resolve(reg), register: () => Promise.resolve(reg), getRegistration: () => Promise.resolve(reg), addEventListener() {}, controller: null } }); } catch (e) {}
  if (o.sub) q.sub = sub(); };
async function open({ st = seed(), lang = 'uz', w = 390, scheme = 'light', native = null, web = null, ua = null, hour = 9, ls = {}, url = '' } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: scheme, userAgent: ua || undefined });
  await c.addInitScript((o) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_lang', o.lang); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_no_fc', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); Object.keys(o.ls).forEach((k) => localStorage.setItem(k, o.ls[k])); } } catch (e) {}
    const R = Date, off = new R(new R().setHours(o.hour, 0, 0, 0)).getTime() - R.now(); class D2 extends R { constructor(...a) { if (a.length === 0) super(R.now() + off); else super(...a); } static now() { return R.now() + off; } } window.Date = D2; }, { st, lang, ls, hour });
  if (native) await c.addInitScript(NATIVE, native); if (web) await c.addInitScript(WEB, web);
  const p = await c.newPage(); p.errs = []; p.api = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/push/**', async (r) => { const u = r.request().url(), a = u.split('/api/push/')[1].split('?')[0]; let body = null; try { body = JSON.parse(r.request().postData() || 'null'); } catch (e) {} p.api.push([a, body]);
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(a === 'kalit' ? { yoqilgan: !!web, kalit: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U' } : { ok: true, siyrak: web && web.siyrak ? 1 : 0 }) }); });
  await p.route('**/api/**', (r) => r.fallback ? r.fallback() : r.continue());
  await p.route('**/assets/stat-kun.js*', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: "window.__ev=[];window.KalkiStat={create:function(){var o={add:function(h,k){window.__ev.push(h+'.'+(k||''))},disabled:function(){return false},manba:function(){}};return new Proxy(o,{get:function(t,p){return p in t?t[p]:function(){return null}}})}};" }));
  await p.goto(BASE + (lang === 'ru' ? '/ru/kalkifit' : '/kalkifit') + (lang === 'cyr' ? '?lang=cyr' : '') + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1000); return p;
}
const evs = (p) => p.evaluate(() => window.__ev || []);
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
const stOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')));
const nq = (p) => p.evaluate(() => window.__q);
const prof = async (p) => { await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500); };
const noOver = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
async function quickAdd(p, q, id) { await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); await p.fill('#fdQ', q); await p.waitForTimeout(500); await p.click('#rzSheet [data-act=pickfood][data-id="' + id + '"]'); await p.waitForSelector('#fsave'); await p.click('#fsave'); await p.waitForTimeout(700); }
const REM = (o) => Object.assign({ on: 1 }, o);
try {
  /* 1. Android: taklif kartasi (bugun ovqat yozilgan) → «Yoqish» → ruxsat so'rovi FAQAT shundan keyin → 7 kunlik reja */
  let p = await open({ native: {}, st: seed({ food: [[T0, 'non', 'b', 230]] }) });
  assert.equal(await p.locator('#remOffer').count(), 1, 'taklif kartasi'); assert.match(await txt(p, '#remOffer'), /Ovqat vaqtida eslatib turaymi\? Nonushta 08:30, tushlik 13:30, kechki 19:30/);
  assert.ok(!(await nq(p)).calls.includes('LocalNotifications.requestPermissions'), 'ruxsat hali so\'ralmagan'); assert.ok(await noOver(p));
  await p.click('#remOffer [data-act=remyes]'); await p.waitForTimeout(900); let q = await nq(p);
  assert.ok(q.calls.includes('LocalNotifications.requestPermissions')); const rem = q.sch.filter((x) => x.id >= 7100 && x.id <= 7199).sort((a, c) => a.at - c.at);
  assert.equal(rem.length, 2 + 6 * 3, 'bugun: tushlik + kechki, keyingi 6 kun: 3 tadan'); assert.equal(new Date(rem[0].at).getHours() * 60 + new Date(rem[0].at).getMinutes(), 810);
  assert.deepEqual(rem[0].extra, { m: 'l', k: T0 }); assert.deepEqual(rem[1].extra, { m: 'l', k: T0 }, 'kechki — o\'tkazib yuborilgan tushlikni ochadi'); assert.match(rem[1].body, /[Tt]ushlik/);
  assert.equal((await stOf(p)).prefs.rem.on, 1); assert.equal(await p.locator('#remOffer').count(), 0); const e1 = await evs(p); for (const x of ['eslatma.taklif.korsatildi', 'eslatma.taklif.yoqildi', 'eslatma.yoqildi']) assert.ok(e1.includes(x), x);
  log('Android: taklif kartasi (birinchi ovqatdan keyin) → «Yoqish» → ruxsat so\'rovi → 7 kunlik reja (bugun 13:30 tushlik, 19:30 kechki «tushlik yozilmagan», keyin 3 tadan)');
  /* 2. ovqat yozildi → bugungi tushlik eslatmasi bekor, kechki oddiy; statistika «otkazildi» */
  await quickAdd(p, 'osh', 'osh'); await p.waitForTimeout(700); q = await nq(p); const today = q.sch.filter((x) => x.id >= 7100 && x.id < 7110);
  const ml = (await stOf(p)).days[T0].food.slice(-1)[0].meal; assert.equal(ml, 'b', 'soat 09:00 — nonushtaga yozildi');
  assert.equal(today.length, 2, 'nonushta yozilgan — bugun hali tushlik va kechki');
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('kalki_fit')); }); await p.context().close();
  p = await open({ native: { perm: 'granted' }, st: seed({ food: [[T0, 'non', 'b', 230], [YD, 'osh', 'l', 600]], prefs: { rem: REM() } }), hour: 12 });
  await p.waitForTimeout(500); q = await nq(p); assert.ok(q.sch.some((x) => x.id === 7101), 'bugungi tushlik rejada');
  await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); await p.fill('#fdQ', 'osh'); await p.waitForTimeout(500); await p.click('#rzSheet [data-act=pickfood][data-id="osh"]'); await p.waitForSelector('#fsave');
  await p.click('[data-act=pwmeal]'); await p.click('[data-act=fmeal][data-m=l]'); await p.click('#fsave'); await p.waitForTimeout(900); q = await nq(p);
  assert.ok(!q.sch.some((x) => x.id === 7101), 'tushlik yozildi — bugungi tushlik eslatmasi bekor'); const dn = q.sch.find((x) => x.id === 7103); assert.ok(dn && dn.extra.m === 'd', 'kechki — oddiy (hammasi yozilgan)');
  assert.ok((await evs(p)).includes('eslatma.otkazildi')); log('Android: ovqat yozilsa bugungi shu eslatma bekor bo\'ladi, kechki matn qayta hisoblanadi («otkazildi»)');
  /* 3. bosilganda: shu ovqatning qo'shish oynasi, qidiruv fokusda, «Kecha kabi» (kecha tushlik bor) va «Oxirgilar»; 10 daqiqada yozildi */
  await p.context().close(); p = await open({ native: { perm: 'granted' }, st: seed({ food: [[YD, 'osh', 'l', 600]], prefs: { rem: REM() } }), hour: 13 });
  await p.evaluate(() => { (window.__q.ls['LocalNotifications:localNotificationActionPerformed'] || []).forEach((cb) => cb({ notification: { id: 7101, extra: { m: 'l', k: 'x' } } })); }); await p.waitForTimeout(900);
  assert.equal(await p.locator('#rzSheet #fdQ').count(), 1, 'qo\'shish oynasi'); assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.id), 'fdQ', 'qidiruv fokusda');
  assert.match(await txt(p, '#remChips'), /Kecha kabi.*Oxirgilar/); assert.match(await txt(p, '#rzSheet .kq-h'), /Tushlik/);
  await p.click('#remChips [data-act=yday]'); await p.waitForTimeout(700); assert.ok(await p.locator('#rzSheet').isVisible(), '«Kecha kabi» ro\'yxati');
  let e3 = await evs(p); assert.ok(e3.includes('eslatma.bosildi')); assert.equal((await stOf(p)).prefs.rem.log[T0].c, 1);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400); await quickAdd(p, 'non', 'non'); e3 = await evs(p); assert.ok(e3.includes('eslatma.ovqat_yozildi'), '10 daqiqa ichida yozildi');
  assert.deepEqual(p.errs, []); log('bosilganda: tushlik qo\'shish oynasi, qidiruv fokusda, «Kecha kabi» va «Oxirgilar» chiplari; «bosildi» → yozilsa «ovqat_yozildi»');
  /* 4. Profil: sozlamalar (4 ovqat, vaqt, switch), vaqt o'zgarsa reja yangilanadi; o'chirish — hammasi bekor */
  await p.keyboard.press('Escape'); await prof(p); assert.equal(await p.locator('#remRow [data-act=remtog]').getAttribute('aria-checked'), 'true');
  assert.deepEqual(await p.locator('#remMeals .n').allInnerTexts(), ['Nonushta', 'Tushlik', 'Tamaddi', 'Kechki ovqat']); assert.deepEqual(await p.locator('#remMeals .sl-remt').evaluateAll((l) => l.map((x) => x.value)), ['08:30', '13:30', '16:30', '19:30']);
  await p.locator('#remMeals .sl-remt[data-m=b]').fill('07:45'); await p.locator('#remMeals .sl-remt[data-m=b]').dispatchEvent('change'); await p.waitForTimeout(700); q = await nq(p);
  const b2 = q.sch.find((x) => x.id === 7110); assert.ok(b2, 'ertangi nonushta'); assert.equal(new Date(b2.at).getHours() * 60 + new Date(b2.at).getMinutes(), 465); assert.equal((await stOf(p)).prefs.rem.m.b.t, 465);
  await p.click('#remMeals [data-act=remmeal][data-m=l]'); await p.waitForTimeout(500); q = await nq(p); assert.ok(!q.sch.some((x) => x.id % 10 === 1), 'tushlik o\'chirildi — rejada yo\'q');
  assert.ok(await noOver(p)); await p.click('#remRow [data-act=remtog]'); await p.waitForTimeout(500); q = await nq(p); assert.equal(q.sch.filter((x) => x.id >= 7100 && x.id <= 7199).length, 0, 'o\'chirildi — hammasi bekor'); assert.ok((await evs(p)).includes('eslatma.ochirildi'));
  await p.context().close(); log('Profil: Nonushta / Tushlik / Tamaddi / Kechki — vaqt (07:45 → reja yangilandi) va switch; o\'chirilsa barcha eslatmalar bekor');
  /* 5. ruxsat rad etildi / yo'qoldi (qadamdagidek ogohlantirish) */
  p = await open({ native: { ask: 'denied' }, st: seed({ food: [[T0, 'non', 'b', 230]] }) }); await p.click('#remOffer [data-act=remyes]'); await p.waitForTimeout(700);
  assert.notEqual((await stOf(p)).prefs.rem && (await stOf(p)).prefs.rem.on, 1); assert.match(await txt(p, '#rzToast'), /ruxsat berilmadi/); await p.context().close();
  p = await open({ native: { perm: 'denied', ask: 'granted' }, st: seed({ prefs: { rem: REM() } }) }); await p.waitForTimeout(400);
  assert.equal(await p.locator('#remLost').count(), 1); assert.match(await txt(p, '#remLost'), /Ovqat eslatmalari to'xtadi/); assert.ok((await evs(p)).includes('eslatma.ruxsat_yoq'));
  await prof(p); assert.match(await txt(p, '#remRow'), /Bildirishnoma ruxsati yo'q/); await p.click('#remLost [data-act=remfix]').catch(async () => { await p.click('#remRow [data-act=remfix]'); }); await p.waitForTimeout(700);
  q = await nq(p); assert.ok(q.sch.some((x) => x.id >= 7100), 'ruxsat qaytdi — qayta rejalandi'); await p.context().close();
  log('ruxsat: rad etilsa — yoqilmaydi; yo\'qolsa — Bugun\'da «Ovqat eslatmalari to\'xtadi» kartasi va Profil\'da izoh, «Ruxsat berish» → qayta rejalanadi');
  /* 6. siyraklashish: 3 kun yuborilgan, bosilmagan → siyrak (faqat kechki), Profil'da «Eslatmalar kamaytirildi» → «Hammasini qaytarish» */
  const L3 = { [D.addDays(T0, -1)]: { s: 3 }, [D.addDays(T0, -2)]: { s: 2 }, [D.addDays(T0, -3)]: { s: 3 } };
  p = await open({ native: { perm: 'granted' }, st: seed({ prefs: { rem: REM({ log: L3 }) } }), hour: 6 }); await p.waitForTimeout(500); q = await nq(p);
  assert.equal((await stOf(p)).prefs.rem.sp, 1); assert.ok((await evs(p)).includes('eslatma.siyraklashdi')); const sp = q.sch.filter((x) => x.id >= 7100 && x.id <= 7199); assert.equal(sp.length, 7, 'kuniga 1 ta'); assert.ok(sp.every((x) => x.id % 10 === 3), 'faqat kechki');
  await prof(p); assert.match(await txt(p, '#remSparse'), /Eslatmalar kamaytirildi/); await p.click('#remSparse [data-act=remfull]'); await p.waitForTimeout(600); q = await nq(p);
  assert.equal((await stOf(p)).prefs.rem.sp, undefined); assert.ok(q.sch.filter((x) => x.id >= 7100 && x.id <= 7199).length > 7); await p.context().close();
  log('siyraklashish: 3 kun bosilmasa — kuniga 1 ta (kechki), Profil\'da «Eslatmalar kamaytirildi» → «Hammasini qaytarish»');
  /* 7. veb-push: Profil'dan yoqish → obuna (baliq kuni — yo'q), jadval + vaqt mintaqasi; ovqat yozilsa «yozildi» (faqat belgi); ?eslatma=d — bosildi + oyna */
  p = await open({ web: {}, st: seed() }); await prof(p); await p.click('#remRow [data-act=remtog]'); await p.waitForTimeout(900);
  const ob = p.api.find((x) => x[0] === 'obuna'), es = p.api.find((x) => x[0] === 'eslatma'); assert.ok(ob && ob[1].baliqsiz === true, 'faqat ovqat eslatmasi — baliq kuni yuborilmaydi');
  assert.deepEqual(es[1].jadval, { b: 510, l: 810, s: null, d: 1170, u: 'hazil' });          // v95: u — maslahatchi uslubi (eslatma matni) assert.equal(es[1].tz, (await p.evaluate(() => -new Date().getTimezoneOffset())) || 0); assert.equal((await stOf(p)).prefs.rem.on, 1);
  await p.click('[data-act=tab][data-v=today]'); await quickAdd(p, 'non', 'non'); await p.waitForTimeout(500); const yz = p.api.filter((x) => x[0] === 'yozildi');
  assert.deepEqual(yz.map((x) => Object.keys(x[1]).sort().join(',')), ['endpoint,kun,ovqat'], 'faqat belgi — taom nomi/kkal yo\'q'); assert.equal(yz[0][1].ovqat, 'b'); await p.context().close();
  p = await open({ web: { sub: true, perm: 'granted' }, st: seed({ prefs: { rem: REM({ wsync: T0 }) } }), url: '?eslatma=d&k=' + T0 }); await p.waitForTimeout(800);
  assert.equal(await p.locator('#rzSheet #fdQ').count(), 1); assert.match(await txt(p, '#rzSheet .kq-h'), /Kechki/); assert.ok(p.api.some((x) => x[0] === 'bosildi')); assert.ok((await evs(p)).includes('eslatma.bosildi')); await p.context().close();
  log('veb-push: obuna (baliq kuni bilan aralashmaydi), jadval va vaqt mintaqasi serverga; ovqat yozilsa faqat «yozildi» belgisi; ?eslatma=d → kechki ovqat oynasi va «bosildi»');
  /* 8. iPhone (bosh ekranga qo'shilmagan) va push yo'q brauzer — yo'riqnoma; taklif kartasi chiqmaydi */
  const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  p = await open({ web: {}, ua: IOS, st: seed({ food: [[T0, 'non', 'b', 230]] }) }); assert.equal(await p.locator('#remOffer').count(), 0); await prof(p);
  assert.match(await txt(p, '#remRow'), /iPhone'da faqat Bosh ekranga qo'shilgan ilovada ishlaydi/); await p.click('#remRow [data-act=remhow]'); await p.waitForTimeout(400); assert.match(await txt(p, '#rzSheet'), /«Ulashish» tugmasi → «Bosh ekranga»/); await p.context().close();
  p = await open({ st: seed() }); await prof(p); assert.match(await txt(p, '#remRow'), /Bu brauzerda eslatma ishlamaydi/); await p.click('#remRow [data-act=remtog]'); await p.waitForTimeout(400); assert.match(await txt(p, '#rzSheet'), /KalkiFit ilovasini o'rnating/); await p.context().close();
  log('iPhone (Safari tab): «faqat Bosh ekranga qo\'shilgan ilovada» + 3 qadam yo\'riqnoma; push yo\'q brauzer — yo\'riqnoma; taklif kartasi chiqmaydi');
  /* 9. RU / ЎЗ, 360 px, tungi */
  p = await open({ lang: 'ru', native: {}, st: seed({ food: [[T0, 'non', 'b', 230]] }) }); assert.match(await txt(p, '#remOffer'), /Напоминать во время еды\?/); await prof(p); assert.match(await txt(p, '#remRow'), /Напоминания о еде/); await p.context().close();
  p = await open({ lang: 'cyr', native: { perm: 'granted' }, w: 360, scheme: 'dark', st: seed({ prefs: { rem: REM() } }) }); await prof(p); assert.match(await txt(p, '#remRow'), /Овқат эслатмалари/); assert.ok(await noOver(p));
  q = await nq(p); assert.ok(q.sch.some((x) => /[а-яўқғҳ]/i.test(x.body)), 'ЎЗ: bildirishnoma matni kirillda'); await p.context().close();
  log('RU va ЎЗ (bildirishnoma matni ham kirillda), 360 px, tungi');
  console.log('\nTAYYOR:', n, 'guruh');
} finally { await b.close(); srv.close(); }
