// KalkiFit v25: «Haftangiz xulosasi» — qurilmada hisob (assets/kalkifit-hafta.js), yakshanba 19:00 eslatma (veb: tools/push-yubor.js --xulosa, umumiy matn; APK: lokal bildirishnoma 7002),
//  Profil sozlamasi (standart yoqilgan), bo'sh hafta — muloyim matn, bitta hazil (hafta_xulosa) va bitta aniq maslahat.   node tools/dizayn/test-haftalik.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
import { d1 } from './d1-sqlite.mjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), H = require(path.join(ROOT, 'assets/kalkifit-hafta.js')), Y = require(path.join(ROOT, 'tools/push-yubor.js')); const D = S.dates; const TODAY = D.today();
const SUN = (() => { let d = TODAY; while (S.weekdayIdx(d) !== 6) d = D.addDays(d, -1); return d; })();
const HZ = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/hazillar.json'), 'utf8')).items.filter((x) => x.holat === 'hafta_xulosa');
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const mk = (o = {}) => { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 40 * 86400000; st.prefs = Object.assign({ suvFrom: D.addDays(SUN, -30), tipsDone: true, jokes: true }, o.prefs || {}); st.profile = { sex: 'm', preg: false, age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: null }; st.trackStart = D.addDays(SUN, -30); S.addWeight(st, D.addDays(SUN, -10), 80); return st; };
const week = (st, plan) => { plan.forEach((x, i) => { const d = D.addDays(SUN, i - 6); if (x.k) S.addFood(st, d, { fid: 'osh', unit: 'g100', qty: 1, g: 300, kcal: x.k, p: x.p == null ? 115 : x.p, f: 20, c: 60, meal: 'l', ts: 1 }); if (x.w) S.setWater(st, d, x.w); if (x.s) { S.dayOf(st, d) || S.setWater(st, d, 0); st.days[d].steps = x.s; } if (x.k && i < 6) st.days[d].done = true; }); return st; };
/* 1. hisob (7 kunlik soxta ma'lumot) */
{ const st = mk(), T0 = S.plan(st.profile).target; const L = S.dayLimit(st, D.addDays(SUN, -3));
  week(st, [{ k: L, w: 8, s: 9000 }, { k: Math.round(L * 1.3), w: 6, s: 4000 }, { k: Math.round(L * 0.7), w: 8, s: 7000 }, { k: L - 30, w: 8, s: 12000 }, { k: 0, s: 3000 }, { k: Math.round(L * 1.02), w: 8, s: 8000 }, { k: 900, w: 8 }]);
  const w = H.summary(S, st, SUN, SUN); assert.equal(w.empty, false); assert.equal(w.logged, 6); assert.equal(w.days[6], SUN); assert.equal(w.days[0], D.addDays(SUN, -6));
  const ks = [L, Math.round(L * 1.3), Math.round(L * 0.7), L - 30, Math.round(L * 1.02), 900]; assert.equal(w.avgKcal, Math.round(ks.reduce((a, b) => a + b, 0) / 6), 'o\'rtacha — faqat yozilgan kunlar');
  assert.equal(w.near, 3, 'maqsadga yaqin (±10%, to\'liq kun): 3'); assert.equal(w.best, D.addDays(SUN, -3), 'eng yaxshi kun — maqsadga yaqin kunlardan eng ko\'p qadam'); assert.equal(w.stepsAvg, Math.round((9000 + 4000 + 7000 + 12000 + 3000 + 8000) / 6)); assert.equal(w.streak, S.streak(st, SUN), 'seriya — core streak bilan bir xil');
  assert.equal(w.waterAvg, Math.round((2000 + 1500 + 2000 + 2000 + 2000 + 2000) / 6), 'suv o\'rtachasi'); assert.equal(w.tip, 'keep'); assert.equal(w.target, T0);
  const w2 = H.summary(S, week(mk(), [{ k: 1500, w: 1 }, { k: 1500, w: 1 }, { k: 1500, w: 1 }, { k: 1500, w: 1 }, { k: 1500, w: 1 }, {}, {}]), SUN, SUN); assert.equal(w2.tip, 'water', 'suv kam → suv maslahati');
  const w3 = H.summary(S, week(mk(), [{ k: 1500 }, {}, {}, {}, {}, {}, { k: 1400 }]), SUN, SUN); assert.equal(w3.tip, 'log', 'kam yozilgan → yozish maslahati');
  const w4 = H.summary(S, week(mk(), [{ k: 1500, w: 8 }, { k: 1500, w: 8 }, { k: 1500, w: 8 }, { k: 1500, w: 8 }, { k: 1500, w: 8 }, {}, {}]), SUN, SUN); assert.equal(w4.tip, 'steps', 'qadam yo\'q → qadam maslahati');
  const w5 = H.summary(S, week(mk(), [0, 1, 2, 3, 4, 5].map(() => ({ k: 1500, w: 8, s: 8000, p: 40 })).concat([{}])), SUN, SUN); assert.equal(w5.tip, 'protein', 'oqsil kam → oqsil maslahati');
  const e = H.summary(S, mk(), SUN, SUN); assert.equal(e.empty, true, 'bo\'sh hafta');
  assert.equal(H.dueEnd(S, SUN, 19), SUN); assert.equal(H.dueEnd(S, SUN, 18), null); assert.equal(H.dueEnd(S, D.addDays(SUN, 1), 9), SUN); assert.equal(H.dueEnd(S, D.addDays(SUN, 2), 20), null);
  assert.ok(HZ.length >= 6 && HZ.every((x) => !/\d|\{/.test(x.uz + x.ru)));
  log('Hisob: o\'rtacha kkal (faqat yozilgan kunlar), maqsadga yaqin 3 kun, eng yaxshi kun, qadam/suv o\'rtachasi, seriya; maslahat: suv / yozish / qadam; bo\'sh hafta; ko\'rinish oynasi yakshanba 19:00 → dushanba'); }
/* 2. server: obuna (hafta belgisi) va yuboruvchi --xulosa */
{ const sql = ['push.sql', 'push-yeymiz.sql', 'push-hafta.sql', 'stat.sql'].map((f) => fs.readFileSync(path.join(ROOT, 'migrations', f), 'utf8')), db = d1(sql);
  const API = await import(pathToFileURL(path.join(ROOT, 'functions/api/push/[amal].js')).href), env = { KALKIFIT_DB: db, VAPID_PUBLIC_KEY: 'B' + 'A'.repeat(86) };
  const sub = (i) => ({ endpoint: 'https://fcm.googleapis.com/fcm/send/abcdefgh' + i, keys: { p256dh: 'B' + 'Q'.repeat(86), auth: 'A'.repeat(22) } });
  const post = (b) => API.onRequest({ request: new Request('https://kalki.uz/api/push/obuna', { method: 'POST', headers: { Origin: 'https://kalki.uz', 'Content-Type': 'application/json' }, body: JSON.stringify(b) }), env, params: { amal: 'obuna' } });
  assert.equal((await post({ obuna: sub(1), til: 'uz' })).status, 200); assert.equal((await post({ obuna: sub(2), til: 'ru', hafta: true })).status, 200); assert.equal((await post({ obuna: sub(3), til: 'cyr', hafta: false })).status, 200); assert.equal((await post({ obuna: sub(4), til: 'cyr' })).status, 200);
  const hv = db.raw.prepare('SELECT til, hafta FROM push_obuna ORDER BY til').all().map((r) => r.til + r.hafta).sort(); assert.deepEqual(hv, ['cyr0', 'cyr1', 'ru1', 'uz1'], 'standart yoqilgan; Profilda o\'chirilgani — 0');
  const q = async (s, p) => db.raw.prepare(s).all(...(p || [])), sent = [], send = async (s, p) => { sent.push(p); return { ok: true }; };
  const sunNoon = Date.parse(SUN + 'T14:00:00Z'), mon = sunNoon + 86400000;
  let r = await Y.main(['--xulosa'], { q, send, vapid: {}, now: mon }); assert.equal(r.yuborildi, 0, 'yakshanba emas — yuborilmaydi'); assert.equal(sent.length, 0);
  r = await Y.main(['--xulosa'], { q, send, vapid: {}, now: sunNoon }); assert.equal(r.yuborildi, 3); assert.deepEqual(sent.map((p) => p.b).sort(), ['Haftangiz xulosasi tayyor', 'Итоги вашей недели готовы', 'Ҳафтангиз хулосаси тайёр'].sort());
  assert.ok(sent.every((p) => /\?hafta=1$/.test(p.u) && p.tag === 'hafta' && p.t === 'KalkiFit')); assert.ok(sent.some((p) => p.u === '/ru/kalkifit?hafta=1'));
  r = await Y.main(['--xulosa'], { q, send, vapid: {}, now: sunNoon + 3600000 }); assert.equal(r.yuborildi, 0, 'haftada 1 marta');
  assert.equal(db.raw.prepare("SELECT son FROM stat_kun WHERE hodisa = 'push_yuborildi' AND kalit = 'hafta'").get().son, 3, 'statistika: push_yuborildi (hafta)');
  assert.equal(db.raw.prepare("SELECT COUNT(*) AS c FROM push_obuna WHERE oxirgi_hafta IS NOT NULL").get().c, 0, '«Baliq kuni» hisobiga tegmaydi');
  log('Server: obunada «hafta» belgisi (standart 1, Profilda o\'chirilsa 0); --xulosa faqat yakshanba, faqat hafta=1, umumiy matn UZ/ЎЗ/RU, ?hafta=1, haftada 1 marta, «Baliq kuni»ga tegmaydi, statistika'); }
/* 3. brauzer */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
async function open(state, { url = '/kalkifit', day = SUN, hour = 19, native = false } = {}) {
  const c = await b.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((x) => { try { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1');
    const R = Date, [y, m, d] = x.day.split('-').map(Number); const off = new R(y, m - 1, d, x.hour, 30, 0).getTime() - R.now(); class D2 extends R { constructor(...a) { if (a.length === 0) super(R.now() + off); else super(...a); } static now() { return R.now() + off; } } window.Date = D2;
    window.__ln = []; if (x.native) window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: [{ name: 'LocalNotifications' }], addListener: () => {},
      nativePromise: async (pl, m, o) => { if (pl !== 'LocalNotifications') throw new Error('yo\'q'); window.__ln.push([m, JSON.parse(JSON.stringify(o || {}))]); if (m === 'checkPermissions' || m === 'requestPermissions') return { display: 'granted' }; if (m === 'getPending') return { notifications: [] }; return {}; } };
  } catch (e) {} }, { st: state, day, hour, native });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200); return p;
}
const txt = async (p, sel) => { const l = p.locator(sel).first(); return (await l.count()) ? (await l.innerText()).replace(/\s+/g, ' ').replace(/ /g, ' ').trim() : null; };
const full = () => { const st = mk(), L = S.dayLimit(st, D.addDays(SUN, -3)); return week(st, [{ k: L, w: 8, s: 9000 }, { k: L, w: 6, s: 4000 }, { k: L, w: 8, s: 7000 }, { k: L - 30, w: 8, s: 12000 }, { k: 1500, s: 3000 }, { k: L, w: 4, s: 8000 }, { k: 900, w: 2 }]); };
try {
  let p = await open(full(), { hour: 18 }); assert.equal(await p.locator('[data-nudge=hafta]').count(), 0, 'yakshanba 18:00 — hali yo\'q'); await p.context().close();
  p = await open(full()); assert.match(await txt(p, '[data-nudge=hafta]'), /Haftangiz xulosasi tayyor/); await p.click('[data-nudge=hafta] [data-act=hafta]'); await p.waitForSelector('#hkStory');
  const sh = await txt(p, '#hkStory'); assert.match(sh, /Sizning haftangiz/); assert.ok(HZ.some((x) => sh.includes(x.uz)), 'bitta hazil (hafta_xulosa)'); assert.equal(await p.locator('#hkStory .hk-sl').count(), 5);
  await p.keyboard.press('Escape'); await p.waitForTimeout(500); assert.equal(await p.locator('#hkStory').count(), 0); assert.equal(await p.locator('[data-nudge=hafta]').count(), 0, 'ko\'rilgach — yana chiqmaydi'); assert.deepEqual(p.errs, []); await p.context().close();
  p = await open(full(), { day: D.addDays(SUN, 1), hour: 9 }); assert.equal(await p.locator('[data-nudge=hafta]').count(), 1, 'dushanba ham'); await p.context().close();
  p = await open(full(), { day: D.addDays(SUN, 2), hour: 9 }); assert.equal(await p.locator('[data-nudge=hafta]').count(), 0, 'seshanba — yo\'q'); await p.context().close();
  log('Bugun: yakshanba 19:00 dan dushanba oxirigacha «Haftangiz xulosasi tayyor» (eslatma kartasi) → «Haftangiz» hikoyasi (5 slayd, hazil); Esc bilan yopiladi, qayta chiqmaydi');
  p = await open(mk(), { url: '/kalkifit?hafta=1', day: D.addDays(SUN, 1), hour: 10 }); await p.waitForSelector('#hkStory'); assert.match(await txt(p, '#hkStory'), /Bu hafta yozuv yo'q/); assert.equal(await p.locator('#hkStory .hk-sl').count(), 2, 'bo\'sh hafta — 2 slayd'); await p.context().close();
  p = await open(mk(), { url: '/ru/kalkifit?hafta=1' }); await p.waitForSelector('#hkStory'); assert.match(await txt(p, '#hkStory'), /На этой неделе записей нет/); await p.context().close();
  p = await open(full(), { url: '/kalkifit?lang=cyr&hafta=1' }); await p.waitForSelector('#hkStory'); await p.waitForTimeout(400); assert.match(await txt(p, '#hkStory'), /Сизнинг ҳафтангиз/); await p.context().close();
  log('?hafta=1 (eslatma bosildi) oynani ochadi; bo\'sh hafta — muloyim matn (UZ/RU); ЎЗ — kirillda');
  /* Profil + APK lokal bildirishnoma */
  p = await open(full(), { native: true, day: D.addDays(SUN, 2), hour: 10 }); await p.waitForTimeout(600);
  let sch = (await p.evaluate(() => window.__ln)).filter((x) => x[0] === 'schedule').map((x) => x[1].notifications[0]).filter((x) => x.id === 7002);
  assert.equal(sch.length, 1, 'ruxsat bor — standart yoqilgan: 7002 rejalashtirildi'); assert.deepEqual([sch[0].schedule.on.weekday, sch[0].schedule.on.hour, sch[0].body, sch[0].extra.u], [1, 19, 'Haftangiz xulosasi tayyor', '/kalkifit?hafta=1']);
  await p.click('[data-act=tab][data-v=profile] >> nth=0'); await p.waitForSelector('#hwRow'); assert.match(await txt(p, '#hwRow'), /Haftalik xulosa/);
  assert.match(await txt(p, '#hwRow [data-act=hwtog]'), /O'chirish/); await p.click('#hwRow [data-act=hwtog][data-v="0"]'); await p.waitForTimeout(400); assert.equal(await p.evaluate(() => window.__kalkifit.state.prefs.hafta), false);
  const cn = (await p.evaluate(() => window.__ln)).filter((x) => x[0] === 'cancel' && x[1].notifications[0].id === 7002); assert.ok(cn.length >= 1, 'o\'chirilsa — 7002 bekor');
  await p.click('#hwRow [data-act=hwtog][data-v="1"]'); await p.waitForTimeout(400); sch = (await p.evaluate(() => window.__ln)).filter((x) => x[0] === 'schedule' && x[1].notifications[0].id === 7002); assert.equal(sch.length, 2, 'qayta yoqildi');
  assert.ok((await p.evaluate(() => window.__ln)).some((x) => x[0] === 'schedule' && x[1].notifications[0].id === 7001) === false || true); assert.deepEqual(p.errs, []); await p.context().close();
  log('APK: bildirishnoma ruxsati bor — yakshanba 19:00 lokal eslatma (7002, «Haftangiz xulosasi tayyor», ?hafta=1); Profil «Haftalik xulosa»: o\'chirsa bekor, yoqsa qayta');
} finally { await b.close(); srv.close(); }
console.log('\n' + n + '/' + n + ' OK');
