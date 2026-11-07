// KalkiFit v75: rasm limiti tugaganda oyna — mehmon (Google bilan kirish + Qidiruv) va akkaunt (ertaga yangilanadi + Qidiruv); UZ/RU/ЎЗ; 360 px, qorong'i; hodisalar rasm.limit.mehmon / .akkaunt / .akkaunt_bosildi.
// node tools/dizayn/test-rasm-limit-ui.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const T0 = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
function seed(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - (o.age || 2) * 864e5; st.prefs = Object.assign({ yemayK: 1, jokes: true, suvFrom: T0, hwSeen: D.today(), ttAsked: 1 }, o.prefs || {}); st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'lose' }; S.addWeight(st, T0, 80);
  (o.food || []).forEach((f, i) => S.addFood(st, T0, Object.assign({ meal: 'l', ts: i + 1, est: false, p: 1, f: 1, c: 1 }, f))); return st; }
let JPG;
async function open({ lang = 'uz', akk = false, w = 390, scheme = 'light', peek = null } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: scheme });
  await c.addInitScript((o) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_lang', o.lang); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_no_fc', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); } } catch (e) {} }, { st: seed({ age: 9 }), lang });
  const p = await c.newPage(); p.errs = []; p.ev = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.route('**/api/retsept', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(peek || { limit: 8, qoldi: 3, akkaunt: akk }) }));
  await p.route('**/api/kalkifit-rasm', (r) => r.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ xato: 'limit', sabab: 'mijoz', limit: akk ? 15 : 8, qoldi: 0, akkaunt: akk }) }));
  await p.route('**/api/akkaunt/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ yoqilgan: true, kirgan: false, google: '' }) }));
  await p.route('**/assets/stat-kun.js*', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: "window.__ev=[];window.KalkiStat={create:function(){var o={add:function(h,k){window.__ev.push(h+'.'+(k||''))},disabled:function(){return false},manba:function(){}};return new Proxy(o,{get:function(t,p){return p in t?t[p]:function(){return null}}})}};" }));
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(800); return p;
}
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
const evs = (p) => p.evaluate(() => window.__ev || []);
const shoot = async (p) => { await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); await p.waitForTimeout(300); await p.click('[data-act=fphoto]').catch(() => {}); };
async function toLimit(p) { await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); await p.waitForTimeout(300); await p.setInputFiles('#phIn', { name: 'o.jpg', mimeType: 'image/jpeg', buffer: JPG }); await p.waitForSelector('.sl-rl', { timeout: 8000 }); }
try {
  { const c = await b.newContext({ viewport: { width: 64, height: 64 } }); const pg = await c.newPage(); await pg.setContent('<body style="margin:0;background:#a33"></body>'); JPG = await pg.screenshot({ type: 'jpeg' }); await c.close(); }
  /* 1. mehmon */
  let p = await open({ akk: false }); await toLimit(p);
  assert.equal(await txt(p, '.sl-rl .rl-t'), "Bugungi rasm limiti tugadi. Google bilan kirsangiz — kuniga 15 ta rasm, ma'lumotlaringiz ham bulutda saqlanadi.");
  assert.deepEqual((await p.locator('.sl-rl .rz-btn').allInnerTexts()).map((x) => x.trim()), ['Google bilan kirish', "Qidiruv orqali qo'shish"]); assert.ok((await evs(p)).includes('ai_sorov.rasm.limit.mehmon'), 'rasm.limit.mehmon: ' + await evs(p));
  await p.click('.sl-rl [data-act=rlgoogle]'); await p.waitForTimeout(700); assert.ok((await evs(p)).includes('ai_sorov.rasm.limit.akkaunt_bosildi'), 'akkaunt_bosildi'); assert.equal(await p.locator('.sl-rl').count(), 0, 'oyna yopildi'); assert.deepEqual(p.errs, []); await p.context().close();
  p = await open({ akk: false }); await toLimit(p); await p.click('.sl-rl [data-act=rlqid]'); await p.waitForTimeout(500); assert.ok(await p.locator('#fdQ').isVisible(), 'Qidiruv orqali qo\'shish — qidiruv ochiladi'); assert.equal(await p.locator('.sl-rl').count(), 0); await p.context().close();
  console.log('OK   1. Mehmon: matn, «Google bilan kirish» + «Qidiruv orqali qo\'shish», rasm.limit.mehmon, akkaunt_bosildi, qidiruvga o\'tish'); n++;
  /* 2. akkaunt */
  p = await open({ akk: true }); await toLimit(p); assert.equal(await txt(p, '.sl-rl .rl-t'), 'Bugungi rasm limiti tugadi, ertaga yangilanadi.'); assert.deepEqual((await p.locator('.sl-rl .rz-btn').allInnerTexts()).map((x) => x.trim()), ["Qidiruv orqali qo'shish"]);
  assert.ok((await evs(p)).includes('ai_sorov.rasm.limit.akkaunt')); assert.equal(await p.locator('[data-act=rlgoogle]').count(), 0); await p.context().close();
  console.log('OK   2. Akkaunt: «Bugungi rasm limiti tugadi, ertaga yangilanadi.» + faqat qidiruv tugmasi, rasm.limit.akkaunt'); n++;
  /* 4. tillar */
  p = await open({ lang: 'ru' }); await toLimit(p); assert.equal(await txt(p, '.sl-rl .rl-t'), 'Лимит фото на сегодня исчерпан. Войдите через Google — 15 фото в день, а данные будут храниться в облаке.'); assert.deepEqual((await p.locator('.sl-rl .rz-btn').allInnerTexts()).map((x) => x.trim()), ['Войти через Google', 'Добавить через поиск']); await p.context().close();
  p = await open({ lang: 'cyr', akk: true }); await toLimit(p); assert.equal(await txt(p, '.sl-rl .rl-t'), 'Бугунги расм лимити тугади, эртага янгиланади.'); await p.context().close();
  console.log('OK   3. Tillar: RU («Лимит фото на сегодня исчерпан…»), ЎЗ (kirill)'); n++;
  /* 5. ko'rinish: 360 px, qorong'i — sig'adi, tugmalar >= 44, gorizontal skroll yo'q */
  for (const [w, sch] of [[360, 'light'], [360, 'dark']]) { p = await open({ w, scheme: sch }); await toLimit(p); const m = await p.evaluate(() => { const c = document.querySelector('.sl-rl').getBoundingClientRect(), s = document.getElementById('rzSheet').getBoundingClientRect(), bs = [...document.querySelectorAll('.sl-rl .rz-btn')].map((e) => e.getBoundingClientRect()); return { sw: document.documentElement.scrollWidth, w: innerWidth, inside: bs.every((r) => r.left >= s.left - 1 && r.right <= s.right + 1), min: Math.min(...bs.map((r) => r.height)), vis: c.bottom <= innerHeight }; });
    assert.ok(m.sw <= m.w && m.inside && m.min >= 44 && m.vis, w + ' ' + sch + ': ' + JSON.stringify(m)); await p.context().close(); }
  console.log('OK   4. Ko\'rinish: 360 px yorug\'/tungi — sig\'adi, tugmalar >= 44 px, gorizontal skroll yo\'q'); n++;
  console.log('rasm-limit-ui: ' + n + ' guruh OK');
} finally { await b.close(); srv.close(); }
