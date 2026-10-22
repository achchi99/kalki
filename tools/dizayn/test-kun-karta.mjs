// KalkiFit v25: «Kun kartasi» (assets/kalkifit-kunkarta.js) — kun yakuni rasmi 1080×1350 PNG:
//  tugma faqat kun yakunlangach yoki 19:00 dan; bitta «Ulashish» tugmasi; Web Share (fayl bilan) → bo'lmasa yuklab olish; APK — Capacitor Filesystem + Share;
//  rasmda: sana, iste'mol/maqsad, suv, qadam, asosiy taom, kun natijasiga mos hazil (on_target / dayend / dayend_high); vazn/yosh YO'Q; tema (och/qorong'i); UZ/ЎЗ/RU.
//  node tools/dizayn/test-kun-karta.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), KK = require(path.join(ROOT, 'assets/kalkifit-kunkarta.js')), G = require(path.join(ROOT, 'assets/kalkifit-gaplar.js')); const D = S.dates; const TODAY = D.today();
const HZ = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/hazillar.json'), 'utf8')).items, of = (h, l = 'uz') => HZ.filter((x) => x.holat === h).map((x) => x[l]);
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. sof qism */
{ assert.equal(KK.jokeState(2000, 2000), 'on_target'); assert.equal(KK.jokeState(2090, 2000), 'on_target'); assert.equal(KK.jokeState(2300, 2000), 'dayend_high'); assert.equal(KK.jokeState(1500, 2000), 'dayend'); assert.equal(KK.jokeState(2150, 2000), 'dayend');
  const c = KK.card({ eaten: -5, limit: 0, ml: 'x', steps: 1234.6, weight: 80, age: 30, food: 'Osh', letter: 'osh' }); assert.deepEqual([c.eaten, c.limit, c.steps, c.letter], [0, 1, 1235, 'O']); assert.ok(!('weight' in c) && !('age' in c), 'kartaga vazn/yosh kirmaydi');
  for (const s of ['on_target', 'dayend', 'dayend_high']) for (const t of [...of(s), ...of(s, 'ru')]) assert.ok(!/\{\w+\}|\d/.test(t), 'hazil raqamsiz: ' + t);
  const st = S.emptyState(), store = {}, ctx = { store, S, st, today: TODAY, lang: 'uz', jokesOn: true }; const a = G.cardLine(ctx, 'on_target'), b2 = G.cardLine(ctx, 'on_target'); assert.ok(of('on_target').includes(a.text)); assert.equal(a.text, b2.text, 'qayta chizilganda bir xil');
  assert.ok(of('dayend').includes(G.cardLine(ctx, 'dayend').text)); assert.equal(G.cardLine({ ...ctx, jokesOn: false }, 'dayend'), null, 'hazil o\'chiq — hazilsiz');
  log('Hazil holati kun natijasidan (±5% → on_target, >10% → dayend_high, qolgani → dayend), raqamsiz, kun bo\'yi barqaror; hazil o\'chiq bo\'lsa yo\'q; kartaga vazn/yosh kirmaydi'); }
/* 2. brauzer */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
const mk = (o = {}) => { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 86400000; st.prefs = Object.assign({ suvFrom: TODAY, tipsDone: true, jokes: true }, o.prefs || {}); st.profile = { sex: 'm', preg: false, age: 37, height: 175, weight: 83.4, act: 3, goal: 'lose', goalWeight: 77 }; st.trackStart = D.addDays(TODAY, -14); S.addWeight(st, TODAY, 83.4);
  S.addFood(st, TODAY, { fid: 'osh', unit: 'g100', qty: 1, g: 350, kcal: o.kcal || 620, p: 20, f: 25, c: 70, meal: 'l', ts: 1 }); S.addFood(st, TODAY, { fid: 'choy', unit: 'piyola', qty: 1, g: 250, kcal: 2, p: 0, f: 0, c: 0, meal: 'b', ts: 2 }); st.days[TODAY].steps = 6400; if (o.done) st.days[TODAY].done = true; return st; };
async function open(state, { url = '/kalkifit', hour = 20, native = false, share = true } = {}) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', acceptDownloads: true });
  await c.addInitScript((x) => { try { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1');
    const R = Date; const off = new R(new R().setHours(x.hour, 5, 0, 0)).getTime() - R.now(); class D2 extends R { constructor(...a) { if (a.length === 0) super(R.now() + off); else super(...a); } static now() { return R.now() + off; } } window.Date = D2;
    window.__sh = []; if (x.share) { navigator.canShare = (d) => !!(d && d.files && d.files.length); navigator.share = async (d) => { const f = d.files[0]; const bm = await createImageBitmap(f); window.__sh.push({ name: f.name, type: f.type, w: bm.width, h: bm.height }); }; } else { navigator.canShare = undefined; navigator.share = undefined; }
    if (x.native) window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: [{ name: 'Filesystem' }, { name: 'Share' }], addListener: () => {},          // native-bridge (Plugins proxy YO'Q)
      nativePromise: async (pl, m, o) => { if (pl === 'Filesystem' && m === 'writeFile') { window.__sh.push({ fs: o.path, dir: o.directory, len: o.data.length }); return { uri: 'file:///cache/' + o.path }; } if (pl === 'Share') { window.__sh.push({ files: o.files }); return {}; } throw new Error('yo\'q'); } };
    document.addEventListener('DOMContentLoaded', () => { const K = window.KalkiKunKarta; if (K) { const d0 = K.draw; K.draw = (cv, d) => { window.__kd = JSON.parse(JSON.stringify(Object.assign({}, d, { img: !!d.img }))); return d0(cv, d); }; } });
  } catch (e) {} }, { st: state, hour, native, share });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200); return p;
}
const openCard = async (p) => { await p.click('#dayCard'); await p.waitForSelector('#kcCv'); await p.waitForTimeout(700); return p.evaluate(() => window.__kd); };
try {
  /* tugma qachon */
  let p = await open(mk(), { hour: 15 }); assert.equal(await p.locator('#dayCard').count(), 0, '15:00 va kun yakunlanmagan — tugma yo\'q'); await p.context().close();
  p = await open(mk({ done: true }), { hour: 15 }); assert.equal(await p.locator('#dayCard').count(), 1, 'kun yakunlangan — tugma bor'); await p.context().close();
  p = await open(mk(), { hour: 20 }); assert.equal(await p.locator('#dayCard').count(), 1, '19:00 dan — tugma bor');
  log('«Kunni ulashish» faqat kun yakunlangach yoki 19:00 dan (Bugun ekrani uzaymaydi — kichik matnli tugma)');
  /* karta ma'lumoti + bitta tugma + Web Share */
  const d = await openCard(p); const sheet = p.locator('#rzSheet'); assert.equal(await sheet.locator('button.rz-btn').count(), 1, 'bitta tugma'); assert.match(await sheet.locator('#kcGo').innerText(), /Ulashish/);
  assert.deepEqual(await p.evaluate(() => { const c = document.getElementById('kcCv'); return [c.width, c.height]; }), [1080, 1350]);
  assert.equal(d.eaten, 622); assert.ok(d.limit > 1000); assert.equal(d.steps, 6400); assert.ok(d.ml >= 250, 'choy suvga kirgan'); assert.match(d.food, /Osh|Palov/i); assert.equal(d.img, true, 'osh ikonkasi'); assert.ok(d.date.length > 5);
  const flat = JSON.stringify(d); assert.ok(!/83[.,]4|\b37\b|\b77\b|weight|age|kg/i.test(flat), 'vazn/yosh/maqsad vazni yo\'q: ' + flat); assert.equal(d.dark, false);
  assert.ok(of('dayend').includes(d.joke), 'kam yegan kun → dayend hazili: ' + d.joke);
  await p.click('#kcGo'); await p.waitForTimeout(900); const sh = await p.evaluate(() => window.__sh); assert.deepEqual(sh, [{ name: 'kalkifit-kun.png', type: 'image/png', w: 1080, h: 1350 }], 'Web Share: PNG 1080×1350');
  assert.deepEqual(p.errs, []); await p.context().close();
  log('Oyna: kanvas 1080×1350, BITTA «Ulashish»; Web Share fayl bilan (PNG 1080×1350); kartada iste\'mol/maqsad, suv (choy bilan), 6 400 qadam, osh ikonkasi, sana; vazn/yosh/maqsad vazni yo\'q');
  /* yuklab olish (Web Share yo'q) */
  p = await open(mk(), { share: false }); await openCard(p); const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#kcGo')]); assert.equal(dl.suggestedFilename(), 'kalkifit-kun.png'); await p.context().close();
  /* APK: Capacitor */
  p = await open(mk(), { native: true }); await openCard(p); await p.click('#kcGo'); await p.waitForTimeout(1000); const ns = await p.evaluate(() => window.__sh);
  assert.equal(ns[0].fs, 'kalkifit-kun.png'); assert.equal(ns[0].dir, 'CACHE'); assert.ok(ns[0].len > 5000); assert.deepEqual(ns[1], { files: ['file:///cache/kalkifit-kun.png'] }); await p.context().close();
  log('Web Share yo\'q → «kalkifit-kun.png» yuklab olinadi; APK → Filesystem (CACHE) + Capacitor Share');
  /* hazil kun natijasiga mos; tema */
  const lim = await (async () => { const q = await open(mk()); const x = await openCard(q); await q.context().close(); return x.limit; })();
  p = await open(mk({ kcal: lim - 2 })); let x = await openCard(p); assert.ok(of('on_target').includes(x.joke), 'maqsadga aniq → on_target: ' + x.joke); await p.context().close();
  p = await open(mk({ kcal: Math.round(lim * 1.4), prefs: { theme: 'dark' } })); x = await openCard(p); assert.ok(of('dayend_high').includes(x.joke), 'oshgan kun → dayend_high'); assert.equal(x.dark, true, 'qorong\'i tema');
  const px = await p.evaluate(() => Array.from(document.getElementById('kcCv').getContext('2d').getImageData(4, 4, 1, 1).data.slice(0, 3))); assert.ok(px[0] < 60, 'qorong\'i fon: ' + px); await p.context().close();
  p = await open(mk({ prefs: { jokes: false } })); x = await openCard(p); assert.equal(x.joke, '', 'hazil o\'chiq'); await p.context().close();
  log('Hazil: maqsadga aniq → on_target, oshgan → dayend_high; qorong\'i temada qorong\'i fon; hazil o\'chiq bo\'lsa — yo\'q');
  /* tillar */
  p = await open(mk(), { url: '/ru/kalkifit' }); assert.match(await p.locator('#dayCard').innerText(), /Поделиться днём/); x = await openCard(p); assert.match(x.L.steps, /Шаги/); assert.ok(of('dayend', 'ru').includes(x.joke)); await p.context().close();
  p = await open(mk(), { url: '/kalkifit?lang=cyr' }); await p.waitForTimeout(500); x = await openCard(p); assert.match(x.date, /[А-Яа-яЎўҚқҒғҲҳ]/); assert.match(x.L.top, /^[^a-z]+$/i.test(x.L.top) ? /./ : /Кун/); assert.ok(!/[a-z]/i.test(x.joke), 'ЎЗ hazil kirillda: ' + x.joke); await p.context().close();
  log('RU («Поделиться днём», «Шаги») va ЎЗ (rasm matni kirillda) ishlaydi');
} finally { await b.close(); srv.close(); }
console.log('\n' + n + '/' + n + ' OK');
