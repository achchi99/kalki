// KalkiFit tashqi audit tuzatishlari: maqsad nomi (bitta funksiya, izoh oynasi har maqsadga), manba belgisi + porsiya grammi, o'rtacha faqat tugagan kunlardan,
// qadam holati platformaga qarab, suv maqsadi bitta funksiya, «Avval ishlatganman».   node tools/dizayn/test-audit-izoh.mjs   (SKRINSHOT_DIR — rasmlar)
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates;
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const T0 = D.today(), YD = D.addDays(T0, -1);
function seed(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - (o.age == null ? 10 : o.age) * 864e5; st.prefs = Object.assign({ yemayK: 1, jokes: false, suvFrom: T0, hwSeen: T0, ttAsked: 1, lpTip: 1, fc: { done: 1 }, hafta: false }, o.prefs || {}); st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: o.goal || 'slow' }; S.addWeight(st, T0, 80);
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
import os from 'node:os'; const OUT = process.env.SKRINSHOT_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'audit-')); fs.mkdirSync(OUT, { recursive: true });

const evs = (p) => p.evaluate(() => window.__ev || []);
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
const nb = (s) => s.replace(/[  ]/g, ' ');
const D2 = (n) => D.addDays(T0, -n);
/* 1. maqsad nomi — BITTA funksiya: izoh oynasi har maqsadga mos; «saqlanadi» faqat saqlash maqsadida */
{
  assert.equal(S.goalKind('slow'), 'lose'); assert.equal(S.goalKind('lose'), 'lose'); assert.equal(S.goalKind('keep'), 'keep'); assert.equal(S.goalKind('gain'), 'gain'); assert.equal(S.goalKind(undefined), 'keep');
  const SNAP = { slow: /^Sekin ozish maqsadingiz — [\d ]+ kkal \(saqlash me'yoridan 275 kkal kam\)\. Bugun [\d ]+ kkal qoldi\.$/, lose: /^Ozish maqsadingiz — [\d ]+ kkal \(saqlash me'yoridan 550 kkal kam\)\. Bugun [\d ]+ kkal qoldi\.$/,
    keep: /^Vaznni saqlash maqsadingiz — [\d ]+ kkal\. Shu raqamdan oshmasangiz — vazningiz saqlanadi\. Bugun [\d ]+ kkal qoldi\.$/, gain: /^Vazn olish maqsadingiz — [\d ]+ kkal \(saqlash me'yoridan 275 kkal ko'p\)\. Bugun yana [\d ]+ kkal yeyish mumkin\.$/ };
  const SUB = { slow: 'maqsad: sekin ozish', lose: 'maqsad: ozish', keep: 'maqsad: saqlash', gain: 'maqsad: vazn olish' };
  for (const g of ['slow', 'lose', 'keep', 'gain']) {
    const st = seed({ goal: g, food: [[T0, 'osh', 'l', 665]] }), pl = S.plan(st.profile), p = await open({ st, hour: 14 });
    await p.click('[data-act=xkcal] >> nth=0'); await p.waitForSelector('#hwRows');
    const tip = nb(await txt(p, '.hw-tip')), sub = nb(await txt(p, '#hwRows .hw-r small'));
    assert.match(tip, SNAP[g], g + ': ' + tip); assert.equal(sub, SUB[g], g + ' qator: ' + sub);
    assert.ok(tip.includes(nb(new Intl.NumberFormat('ru-RU').format(pl.target)).replace(/,/g, ' ')) || tip.replace(/ /g, '').includes(String(pl.target)), g + ': maqsad soni ' + pl.target + ' / ' + tip);
    assert.ok(tip.replace(/ /g, '').includes(String(pl.target - 665)), g + ': qoldiq ' + (pl.target - 665));
    const all = nb(await txt(p, '#rzSheet')); if (g !== 'keep') { assert.doesNotMatch(all, /saqlanadi|vaznni saqlash uchun/i, g + ': «saqlanadi» chiqmasin'); } else assert.match(all, /saqlanadi/);
    if (g === 'slow') { await p.screenshot({ path: path.join(OUT, 'izoh-sekin.png') }); }
    assert.deepEqual(p.errs, []); await p.context().close();
  }
  /* RU */
  { const p = await open({ st: seed({ goal: 'slow', food: [[T0, 'osh', 'l', 665]] }), lang: 'ru', hour: 14 }); await p.click('[data-act=xkcal] >> nth=0'); await p.waitForSelector('#hwRows');
    assert.match(nb(await txt(p, '.hw-tip')), /^Цель «Медленное похудение» — [\d ]+ ккал \(на 275 ккал меньше нормы поддержания\)\. Сегодня осталось [\d ]+ ккал\.$/); assert.doesNotMatch(nb(await txt(p, '#rzSheet')), /сохранится|для поддержания веса/); await p.context().close(); }
  /* ЎЗ */
  { const p = await open({ st: seed({ goal: 'slow', food: [[T0, 'osh', 'l', 665]] }), lang: 'cyr', hour: 14 }); await p.click('[data-act=xkcal] >> nth=0'); await p.waitForSelector('#hwRows'); await p.waitForTimeout(300);
    assert.match(nb(await txt(p, '.hw-tip')), /^Секин озиш мақсадингиз — /); await p.context().close(); }
  log("maqsad izohi: 4 maqsad (uz snapshot) + RU/ЎЗ; «saqlanadi» faqat saqlash maqsadida; qatorda «maqsad: …»");
}
/* 2. belgi: retsept hisobi / Manba: USDA; porsiya grammi; «Tarozida tekshirilgan» hech kimda yo'q */
{
  const F = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods; assert.equal(F.filter((f) => f.tarozi).length, 0, 'tarozi belgisi hozircha hech kimda yo\'q');
  const usda = F.find((f) => !f.fam && !f.rc && /^USDA FDC \d/.test(f.m || '') && f.u && f.u.some((u) => u[0] !== 'g100'));
  for (const [q, re] of [['osh', /Retsept bo'yicha hisoblangan/], [usda.n, /Manba: USDA/]]) {
    const p = await open({ st: seed({}), hour: 13 }); await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); await p.fill('#fdQ', q); await p.waitForTimeout(700); await p.click('#fdRes [data-act] >> nth=0'); await p.waitForSelector('#fdQuick');
    const tz = nb(await txt(p, '.sl-tz')); assert.match(tz, re, q + ': ' + tz); assert.doesNotMatch(tz, /Tekshirilgan/, q + ': «Tekshirilgan» yo\'q');
    if (q === 'osh') { assert.match(tz, /1 tarelka ≈ 350 g/, 'osh: 1 tarelka ≈ 350 g / ' + tz); await p.screenshot({ path: path.join(OUT, 'osh-karta.png') }); await p.click('#fdSrcB'); await p.waitForTimeout(300); assert.doesNotMatch(nb(await txt(p, '#rzSheet')), /✓ Tekshirilgan/); }
    assert.deepEqual(p.errs, []); await p.context().close();
  }
  { const p = await open({ st: seed({}), lang: 'ru', hour: 13 }); await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); await p.fill('#fdQ', 'плов'); await p.waitForTimeout(700); await p.click('#fdRes [data-act] >> nth=0'); await p.waitForSelector('#fdQuick');
    assert.match(nb(await txt(p, '.sl-tz')), /Расчёт по рецепту/); await p.context().close(); }
  log('belgi: osh — «Retsept bo\'yicha hisoblangan» + «1 tarelka ≈ 350 g»; USDA taomi — «Manba: USDA»; RU «Расчёт по рецепту»; tarozi maydoni bo\'sh');
}
/* 3. o'rtacha — faqat tugagan kunlar (bugun kirmaydi) */
{
  const lim = S.plan(seed({}).profile).target;
  { const p = await open({ st: seed({ food: [[T0, 'osh', 'l', 665]] }), hour: 14 }); await p.click('[data-act=tab][data-v=history]'); await p.waitForSelector('#hkCard');
    assert.equal(nb(await txt(p, '#hkCard .m span')), 'Bugun hozircha 665 kkal yozildi'); await p.screenshot({ path: path.join(OUT, 'haftangiz-1kun.png') });
    assert.match(nb(await txt(p, '#calSum')), /O'rtacha, kkal —/); await p.context().close(); }
  { const k = Math.round(lim * 0.9), st = seed({ food: [[D2(1), 'osh', 'l', k], [D2(2), 'osh', 'l', k], [D2(3), 'osh', 'l', k], [T0, 'osh', 'l', 665]] });
    const w = S.weekSummary(st, T0, T0); assert.equal(w.fullDays, 3); assert.equal(w.avgKcal, k);
    const p = await open({ st, hour: 14 }); await p.click('[data-act=tab][data-v=history]'); await p.waitForSelector('#hkCard');
    assert.equal(nb(await txt(p, '#hkCard .m span')), "O'rtacha " + new Intl.NumberFormat('ru-RU').format(k).replace(/ /g, ' ') + " kkal · 3 kun bo'yicha (bugun hisobga kirmaydi)");
    const sameMonth = D2(3).slice(0, 7) === T0.slice(0, 7); if (sameMonth) assert.match(nb(await txt(p, '#calSum')), /3 kun bo'yicha/);
    await p.context().close(); }
  { const st = seed({ food: [[T0, 'osh', 'l', 665]] }); st.days[T0].done = true; assert.equal(S.weekSummary(st, T0, T0).avgKcal, null, 'bugun yakunlangan bo\'lsa ham kirmaydi'); assert.equal(S.monthSummary(st, T0.slice(0, 7), T0).avg, null); }
  log("o'rtacha: birinchi kun — «Bugun hozircha 665 kkal yozildi» va «—»; 3 kun — «3 kun bo'yicha (bugun hisobga kirmaydi)»; yakunlangan bugun ham kirmaydi");
}
/* 4. qadam holati — platformaga qarab */
{
  { const p = await open({ st: seed({}), hour: 10 }); const m = nb(await txt(p, '#sMode')); assert.equal(m, "Qo'lda kiritiladi"); await p.locator('.sl-s').first().screenshot({ path: path.join(OUT, 'qadam-veb.png') }).catch(() => {});
    await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(500); const hs = nb(await p.evaluate(() => document.body.innerText)); assert.doesNotMatch(hs, /Qadam ilovada avtomatik sanaladi/); assert.match(hs, /Qo'lda kiritiladi/);
    await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(300); await p.click('[data-act=stepin] >> nth=0'); await p.waitForSelector('#siCred'); assert.ok((await txt(p, '#siCred')).length > 20, 'qadam oynasida limit izohi'); await p.context().close(); }
  { const p = await open({ st: seed({}), hour: 10, native: {} }); await p.waitForTimeout(500); const m = nb(await txt(p, '#sMode')); assert.match(m, /^Avtomatik/, 'ilova: ' + m); await p.locator('.sl-s').first().screenshot({ path: path.join(OUT, 'qadam-ilova.png') }).catch(() => {}); await p.context().close(); }
  log("qadam: veb — «Qo'lda kiritiladi» (karta, Tarix, oynada limit izohi); ilova — «Avtomatik…»");
}
/* 5a. suv maqsadi — bitta funksiya */
{
  for (const kg of [55, 62.5, 75, 80, 93]) { const w = S.water(kg); assert.equal(w.goal, S.waterGoalMl(w.glasses)); assert.equal(w.goal % 250, 0); }
  const st = seed({}); st.profile.weight = 75; st.weights = []; S.addWeight(st, T0, 75); const pl = S.plan(st.profile), g = S.waterGoalMl(pl.water.glasses);
  const p = await open({ st, hour: 10 }); const wt = nb(await txt(p, '#wTxt')); assert.ok(wt.replace(/ /g, '').includes('/' + g), 'kundalik: ' + wt + ' ≠ ' + g); await p.context().close();
  log('suv: maqsad = butun stakan (250 ml) — onboarding yakuni va kundalik bir xil (' + g + ' ml)');
}
/* 5b. «Avval ishlatganman» — bitta tugma → usul tanlash */
{
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' }); await c.addInitScript(() => { try { localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_lang', 'uz'); } catch (e) {} });
  const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e))); await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  if (await p.locator('[data-act=lppick][data-l=uz]').count()) { await p.click('[data-act=lppick][data-l=uz]'); await p.waitForTimeout(600); }
  await p.waitForSelector('#obUsed'); assert.equal(await p.locator('.sl-ob .bk-rclink').count(), 1, 'faqat bitta havola'); assert.equal((await txt(p, '#obUsed')), 'Avval ishlatganman');
  await p.click('#obUsed'); await p.waitForSelector('[data-act=obusedcode]'); assert.equal(await p.locator('#rzSheet.open').count(), 0, 'oyna ustiga oyna yo\'q'); assert.match(await txt(p, '.sl-ob-in'), /qanday qaytaramiz/);
  await p.click('[data-act=obusedx]'); await p.waitForSelector('#obUsed'); await p.click('#obUsed'); await p.waitForSelector('[data-act=obusedcode]');
  await p.click('[data-act=obusedcode]'); await p.waitForTimeout(700); assert.ok(await p.locator('.bk-ov, .rz-ov, [id^=bkRc], input[placeholder^="KF-"]').count() > 0, 'tiklash kodi oynasi ochildi'); assert.deepEqual(errs, []); await c.close();
  log('«Avval ishlatganman»: bitta tugma → usul tanlash → tiklash kodi oynasi');
}
await b.close(); srv.close(); console.log('\nHammasi o\'tdi: ' + n + ' guruh');
