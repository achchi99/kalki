// Mavzu skrinshotlari (360 px, qorong'i va och): node tools/dizayn/tema-shot.mjs <oldin|keyin>   → docs/tema/<teg>-<ekran>-<dark|light>.png
// KalkiFit: Bugun, Ovqat qo'shish, Porsiya, Profil, Natijalar, Kundalik (taqvim); Ro'zg'or: Bugun, Hisoblar, Sozlamalar. Brauzer track() bilan yopiladi.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const KF = require(path.join(ROOT, 'assets/kalkifit-core.js')); const RZ = require(path.join(ROOT, 'assets/rozgor-core.js')); const D = KF.dates, TODAY = D.today();
const TAG = process.argv[2] || 'keyin'; const OUT = path.join(ROOT, 'docs', 'tema'); fs.mkdirSync(OUT, { recursive: true });
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
function kfSeed() {
  const st = KF.emptyState(); st.setup = true; st.created = Date.now() - 40 * 86400000; st.prefs = { tipsDone: true, jokes: true }; st.profile = { sex: 'f', preg: false, age: 31, height: 166, weight: 64.5, act: 2, goal: 'slow', goalWeight: 60 }; st.trackStart = D.addDays(TODAY, -30);
  for (let i = 0; i < 12; i++) KF.addWeight(st, D.addDays(TODAY, -i * 2), 66 - i * 0.12);
  for (let i = 0; i < 24; i++) { const d = D.addDays(TODAY, -i); if (i % 4 === 3) continue; KF.setSteps(st, d, 4000 + (i * 713) % 6000); KF.setWater(st, d, 3 + (i % 5)); if (i > 0) { KF.addFood(st, d, { meal: 'b', ts: 1, fid: 'chuchvara', unit: 'kosa', qty: 1, g: 250, kcal: 300 + (i * 37) % 700, p: 12, f: 10, c: 40, est: false }); KF.addFood(st, d, { meal: 'l', ts: 2, fid: 'chuchvara', unit: 'kosa', qty: 1, g: 250, kcal: 500 + (i * 53) % 800, p: 20, f: 18, c: 60, est: false }); } }
  KF.addFood(st, TODAY, { meal: 'b', ts: 1, fid: 'chuchvara', unit: 'kosa', qty: 1, g: 250, kcal: 420, p: 18, f: 14, c: 52, est: false }); KF.addFood(st, TODAY, { meal: 'l', ts: 2, fid: 'chuchvara', unit: 'kosa', qty: 1, g: 250, kcal: 380, p: 16, f: 12, c: 46, est: false }); KF.setWater(st, TODAY, 4); KF.setSteps(st, TODAY, 6240); return st;
}
function rzSeed() {
  const st = RZ.emptyState(); st.prefs = { tipsDone: true }; st.setup = true; st.created = Date.now() - 30 * 86400000; st.base = 3200000; st.reserve = 500000; st.income = RZ.addDays(TODAY, 9);
  const cats = ['oziq', 'transport', 'salomat', 'kiyim', 'ovqat', 'aloqa']; for (let i = 0; i < 14; i++) st.tx.push({ id: 't' + i, type: 'exp', amount: 18000 + i * 9300, cat: cats[i % cats.length], date: RZ.addDays(TODAY, -(i % 7)), ts: Date.now() - i * 1000 });
  st.bills = [{ id: 'b1', kind: 'komm', name: 'Kommunal', amount: 420000, due: RZ.addDays(TODAY, 3), repeat: 'monthly' }, { id: 'b2', kind: 'kredit', name: 'Kredit', amount: 1250000, due: RZ.addDays(TODAY, 1), repeat: 'monthly' }, { id: 'b3', kind: 'ijara', name: 'Ijara', amount: 2600000, due: RZ.addDays(TODAY, 6), repeat: 'monthly' }]; return st;
}
async function open(app, scheme, h) {
  const c = await b.newContext({ viewport: { width: 360, height: h || 780 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: scheme, deviceScaleFactor: 2 });
  await c.addInitScript((o) => { try { localStorage.setItem(o.k, JSON.stringify(o.s)); localStorage.setItem('kalki_news_' + o.app, '{"shown":999,"read":999}'); localStorage.setItem('kalki_theme', o.scheme); } catch (e) {} }, { k: app === 'kalkifit' ? 'kalki_fit' : 'kalki_rozgor', s: app === 'kalkifit' ? kfSeed() : rzSeed(), app, scheme });
  const p = await c.newPage(); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort()); await p.goto(BASE + '/' + app, { waitUntil: 'networkidle' }); await p.evaluate((s) => { document.documentElement.setAttribute('data-theme', s); }, scheme); await p.waitForTimeout(1200); return p;
}
const shot = async (p, name, scheme) => { await p.waitForTimeout(450); await p.screenshot({ path: path.join(OUT, `${TAG}-${name}-${scheme}.png`) }); console.log('  ', `${TAG}-${name}-${scheme}.png`); };
try {
  for (const scheme of ['dark', 'light']) {
    let p = await open('kalkifit', scheme); await shot(p, 'kf-bugun', scheme);
    await p.click('#mainAdd'); await p.waitForTimeout(700); await shot(p, 'kf-ovqat', scheme);
    await p.fill('#fdQ', 'chuchvara').catch(() => {}); await p.waitForTimeout(400); await p.click('[data-act=pickfood] >> nth=0').catch(() => {}); await p.waitForTimeout(700); await shot(p, 'kf-porsiya', scheme); await p.context().close();
    p = await open('kalkifit', scheme); await p.click('#mainAdd'); await p.waitForTimeout(600); await p.fill('#fdQ', 'olma'); await p.waitForTimeout(700); await shot(p, 'kf-qidiruv', scheme); await p.context().close();
    for (const [v, nm, hh] of [['profile', 'kf-profil', 1500], ['results', 'kf-natijalar', 1300], ['diary', 'kf-kundalik', 1100]]) { p = await open('kalkifit', scheme, hh); await p.click(`[data-act=tab][data-v=${v}]`); await p.waitForTimeout(900); await shot(p, nm, scheme); await p.context().close(); }
    p = await open('rozgor', scheme); await shot(p, 'rz-bugun', scheme); await p.context().close();
    p = await open('rozgor', scheme, 1200); const tabs = await p.$$eval('[data-act=tab]', (e) => e.map((x) => x.getAttribute('data-v'))); for (const [v, nm] of [[tabs.find((x) => /bill|hisob/.test(x)), 'rz-hisoblar'], ['set', 'rz-sozlamalar']]) { if (!v) continue; await p.click(`[data-act=tab][data-v=${v}]`); await p.waitForTimeout(800); await shot(p, nm, scheme); } await p.context().close();
  }
} finally { await b.close().catch(() => {}); srv.close(); }
