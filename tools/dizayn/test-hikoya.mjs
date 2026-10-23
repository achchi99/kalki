// KalkiFit v26: «Haftangiz» hikoyasi (assets/kalkifit-hikoya.js) — Tarix tepasidagi jonli karta → to'liq ekranli 5 slayd (progress, chap/o'ng, pastga surib yopish, Esc),
//  raqamlar to'g'ri (7 kunlik soxta ma'lumot), kam ma'lumot — qisqa variant, ulashish rasmi VAZNSIZ, prefers-reduced-motion — animatsiyasiz, qorong'i mavzu.   node tools/dizayn/test-hikoya.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), KH = require(path.join(ROOT, 'assets/kalkifit-hikoya.js')), HF = require(path.join(ROOT, 'assets/kalkifit-hafta.js')); const D = S.dates; const T = D.today();
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. sof */
{ assert.deepEqual(KH.plan({ logged: 0 }), ['intro', 'tip']); assert.deepEqual(KH.plan({ logged: 2 }), ['intro', 'kcal', 'tip']); assert.deepEqual(KH.plan({ logged: 7 }), ['intro', 'kcal', 'move', 'best', 'tip']);
  const sd = KH.shareData({ range: 'r', days: [{ l: 'Du', k: 100, near: true }], weight: 'Vazn: -0,6 kg', food: { name: 'Osh' }, target: 2000, near: 1, L: {} }); assert.ok(!('weight' in sd) && !JSON.stringify(sd).includes('Vazn'), 'ulashish ma\'lumotida vazn yo\'q');
  log('Slaydlar rejasi (0 kun → 2, ≤ 2 kun → 3, aks holda 5); ulashish ma\'lumoti — oq ro\'yxat, vazn yo\'q'); }
/* 2. brauzer */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
const mk = (days) => { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 40 * 86400000; st.prefs = { suvFrom: D.addDays(T, -30), tipsDone: true, yemayK: 1, yemay: [], jokes: true }; st.profile = { sex: 'm', preg: false, age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: null }; st.trackStart = D.addDays(T, -30); S.addWeight(st, D.addDays(T, -12), 80.6); S.addWeight(st, T, 80);
  const L = S.dayLimit(st, D.addDays(T, -3)), ks = [0.95, 1.3, 1.0, 0.7, 1.02, 1.25, 0.6];
  for (let i = 7 - days; i < 7; i++) { const d = D.addDays(T, i - 6); S.addFood(st, d, { fid: i % 3 ? 'osh' : 'shashlik', unit: 'g100', qty: 1, g: 300, kcal: Math.round(L * ks[i]), p: 110, f: 40, c: 150, meal: 'l', ts: 1 }); S.setWater(st, d, 6); st.days[d].steps = 4000 + i * 1000; if (i < 6) st.days[d].done = true; }
  return st; };
async function open(state, { dark = false, reduce = false, w = 390 } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: dark ? 'dark' : 'light', reducedMotion: reduce ? 'reduce' : 'no-preference' });
  await c.addInitScript((x) => { try { localStorage.setItem('kalki_fit', JSON.stringify(x)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1');
    window.__sh = []; navigator.canShare = (d) => !!(d && d.files); navigator.share = async (d) => { const bm = await createImageBitmap(d.files[0]); window.__sh.push({ name: d.files[0].name, w: bm.width, h: bm.height }); };
    document.addEventListener('DOMContentLoaded', () => { const K = window.KalkiHikoya; if (K) { const d0 = K.drawShare; K.drawShare = (cv, s, tr) => { window.__sd = JSON.parse(JSON.stringify(s)); return d0(cv, s, tr); }; } }); } catch (e) {} }, state);
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(1000); await p.click('[data-act=tab][data-v=history] >> nth=0'); await p.waitForSelector('#hkCard'); return p;
}
const txt = async (p, sel) => { const l = p.locator(sel).first(); return (await l.count()) ? (await l.innerText()).replace(/\s+/g, ' ').replace(/ /g, ' ').trim() : null; };
const num = (s) => +String(s).replace(/\D/g, '');
const right = (p) => p.mouse.click(p.viewportSize().width - 30, 420), left = (p) => p.mouse.click(30, 420);
try {
  const st = mk(7), w = HF.summary(S, st, T, T);
  let p = await open(st); assert.match(await txt(p, '#hkCard'), /Haftangiz/); assert.match(await txt(p, '#hkCard'), /7 kun yozildi/); assert.equal(await p.locator('#hkCard .mini i').count(), 7);
  await p.click('#hkCard'); await p.waitForSelector('#hkStory'); assert.equal(await p.locator('#hkStory .hk-sl').count(), 5); assert.equal(await p.locator('#hkStory .hk-prog span').count(), 5);
  assert.match(await txt(p, '.hk-sl.on'), /Sizning haftangiz/); assert.match(await txt(p, '.hk-sl.on'), /7 kundan 7 kuni/);
  await right(p); await p.waitForTimeout(1300); assert.equal(await p.getAttribute('.hk-sl.on', 'data-k'), 'kcal'); assert.equal(num(await txt(p, '.hk-sl.on .hk-num b')), w.near, 'maqsadga yaqin kunlar (count-up oxiri)'); assert.equal(await p.locator('.hk-sl.on .hk-bars7 i').count(), 7);
  const tf = await p.evaluate(() => getComputedStyle(document.querySelector('.hk-sl.on .hk-bars7 i')).transform); assert.ok(tf === 'none' || /matrix\(1, 0, 0, 1,/.test(tf), 'ustunlar o\'sib chiqdi: ' + tf);
  await right(p); await p.waitForTimeout(1300); assert.equal(await p.getAttribute('.hk-sl.on', 'data-k'), 'move'); const mv = await p.$$eval('.hk-sl.on [data-cu]', (l) => l.map((e) => e.textContent)); assert.deepEqual(mv.map(num), [w.waterAvg, w.stepsSum], 'suv o\'rtachasi va jami qadam');
  await left(p); await p.waitForTimeout(300); assert.equal(await p.getAttribute('.hk-sl.on', 'data-k'), 'kcal', 'chapga bosish — orqaga'); await right(p); await right(p); await p.waitForTimeout(1300);
  assert.equal(await p.getAttribute('.hk-sl.on', 'data-k'), 'best'); const bt = await txt(p, '.hk-sl.on'); assert.match(bt, /eng yaxshi kun/i); assert.match(bt, new RegExp(String(w.streak) + ' kun ketma-ket')); assert.match(bt, /Eng ko'p yeyilgan/); assert.match(await txt(p, '#hkWt'), /Vazn \(faqat sizga ko'rinadi\): -0,6 kg/);
  await right(p); await p.waitForTimeout(500); assert.equal(await p.getAttribute('.hk-sl.on', 'data-k'), 'tip'); await p.click('.hk-sl.on [data-hk=share]'); await p.waitForTimeout(900);
  assert.deepEqual(await p.evaluate(() => window.__sh), [{ name: 'kalkifit-hafta.png', w: 1080, h: 1350 }]); const sd = await p.evaluate(() => window.__sd); assert.ok(!JSON.stringify(sd).match(/Vazn|weight|80[,.]|kg/i), 'ulashish rasmida vazn yo\'q: ' + JSON.stringify(sd).slice(0, 200));
  await p.click('.hk-sl.on [data-hk=close]'); await p.waitForTimeout(400); assert.equal(await p.locator('#hkStory').count(), 0); assert.deepEqual(p.errs, []);
  log('Tarix: «Haftangiz ▶» (7 mini ustun, «7 kun yozildi») → 5 slayd; maqsadga yaqin kunlar ' + w.near + '/7, 7 ustun o\'sadi, suv ' + w.waterAvg + ' ml, qadam ' + w.stepsSum + ', eng yaxshi kun, seriya, taom, vazn faqat 4-slaydda; ulashish PNG 1080×1350 VAZNSIZ; chap/o\'ng, «Yopish»');
  await p.click('#hkCard'); await p.waitForSelector('#hkStory'); await p.waitForTimeout(4600); assert.equal(await p.getAttribute('.hk-sl.on', 'data-k'), 'kcal', '~4 s dan keyin o\'zi o\'tadi');
  await p.mouse.move(200, 300); await p.mouse.down(); await p.mouse.move(200, 380, { steps: 4 }); await p.mouse.move(200, 470, { steps: 4 }); await p.mouse.up(); await p.waitForTimeout(500); assert.equal(await p.locator('#hkStory').count(), 0, 'pastga surib yopish'); await p.context().close();
  log('Avtomatik o\'tish (~4 s), pastga surib yopish');
  p = await open(mk(2)); await p.click('#hkCard'); await p.waitForSelector('#hkStory'); assert.equal(await p.locator('#hkStory .hk-sl').count(), 3); await right(p); await p.waitForTimeout(400); assert.match(await txt(p, '.hk-sl.on .hk-hint'), /Hali ma'lumot kam/); await p.context().close();
  p = await open(mk(0)); assert.match(await txt(p, '#hkCard'), /Hafta endi boshlanmoqda/); await p.click('#hkCard'); await p.waitForSelector('#hkStory'); assert.equal(await p.locator('#hkStory .hk-sl').count(), 2); assert.match(await txt(p, '.hk-sl.on'), /Bu hafta yozuv yo'q/); await p.context().close();
  log('Kam ma\'lumot (2 kun) — 3 slayd va «Hali ma\'lumot kam» ko\'rsatmasi; bo\'sh hafta — 2 slayd, muloyim matn');
  p = await open(mk(7), { reduce: true, dark: true, w: 360 }); await p.click('#hkCard'); await p.waitForSelector('#hkStory'); assert.equal(await p.evaluate(() => document.getElementById('hkStory').className), 'hk dk rm');
  await right(p); await p.waitForTimeout(150); assert.equal(num(await txt(p, '.hk-sl.on .hk-num b')), w.near, 'reduced-motion: raqam darrov'); const an = await p.evaluate(() => getComputedStyle(document.querySelector('.hk-sl.on .hk-bars7 i')).transitionDuration); assert.equal(an, '0s', 'animatsiyasiz');
  const fit = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth, [...document.querySelectorAll('#hkStory .hk-sl.on *')].every((e) => e.getBoundingClientRect().right <= innerWidth + 1)]); assert.equal(fit[0], fit[1]); assert.ok(fit[2], '360 px da sig\'adi'); assert.deepEqual(p.errs, []); await p.context().close();
  log('prefers-reduced-motion — animatsiyasiz (raqamlar darrov, transition 0s); qorong\'i mavzu; 360 px da sig\'adi');
} finally { await b.close(); srv.close(); }
console.log('\n' + n + '/' + n + ' OK');
