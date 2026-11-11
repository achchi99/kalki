// KalkiFit v77: rasm AI xato oynasi — sababga qarab aniq matn (provayder / band / vaqt / hajm / format / tarmoq), UZ + RU, 360/390 px, «Qidiruv orqali qo'shish» tugmasi, hodisalar.   node tools/dizayn/test-rasm-xato-ui.mjs
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
async function open({ lang = 'uz', akk = false, w = 390, scheme = 'light', peek = null, rasm = null } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: scheme });
  await c.addInitScript((o) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_lang', o.lang); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_no_fc', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); } } catch (e) {} }, { st: seed({ age: 9 }), lang });
  const p = await c.newPage(); p.errs = []; p.ev = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.route('**/api/retsept', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(peek || { limit: 8, qoldi: 3, akkaunt: akk }) }));
  await p.route('**/api/kalkifit-rasm', (r) => (rasm === 'abort' ? r.abort('failed') : r.fulfill(rasm)));
  await p.route('**/api/akkaunt/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ yoqilgan: true, kirgan: false, google: '' }) }));
  await p.route('**/assets/stat-kun.js*', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: "window.__ev=[];window.KalkiStat={create:function(){var o={add:function(h,k){window.__ev.push(h+'.'+(k||''))},disabled:function(){return false},manba:function(){}};return new Proxy(o,{get:function(t,p){return p in t?t[p]:function(){return null}}})}};" }));
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(800); return p;
}
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
const evs = (p) => p.evaluate(() => window.__ev || []);
const R = (status, o) => ({ status, contentType: 'application/json', body: JSON.stringify(o) });
async function upload(p) { await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); await p.waitForTimeout(300); await p.setInputFiles('#phIn', { name: 'o.jpg', mimeType: 'image/jpeg', buffer: JPG }); await p.waitForSelector('.rz-p.warn', { timeout: 8000 }); }
const CASES = [
  // [nom, javob, uz matn, ru matn, qidiruv tugmasi bormi, hodisa]
  ['provayder', R(502, { xato: 'x', sabab: 'provayder', qidiruv: true }), "AI hozir javob bermadi. Qidiruv orqali qo'shing.", 'ИИ сейчас не ответил. Добавьте через поиск.', true, 'ai_sorov.rasm.server'],
  ['band', R(503, { xato: 'x', sabab: 'band', qidiruv: true }), "AI hozir band, 1 daqiqadan keyin urinib ko'ring.", 'ИИ сейчас занят, попробуйте через минуту.', true, 'ai_sorov.rasm.server'],
  ['vaqt', R(504, { xato: 'x', sabab: 'vaqt', qidiruv: true }), 'Javob kechikdi. Qayta urinib ko\'ring.', 'Ответ задержался. Попробуйте ещё раз.', true, 'ai_sorov.rasm.vaqt'],
  ['hajm', R(413, { xato: 'x', sabab: 'hajm' }), 'Rasm juda katta. Boshqa rasm tanlang.', 'Фото слишком большое. Выберите другое.', false, 'ai_sorov.rasm.hajm'],
  ['format', R(400, { xato: 'x', sabab: 'format' }), "Rasm o'qilmadi. Boshqa rasm tanlang yoki qayta suratga oling.", 'Фото не удалось прочитать. Выберите другое или снимите заново.', false, 'ai_sorov.rasm.format'],
  ['tarmoq', 'abort', "Internet yo'q yoki aloqa uzildi. Ulanishni tekshirib, qayta urinib ko'ring.", 'Нет интернета или связь прервалась. Проверьте соединение и попробуйте снова.', true, 'ai_sorov.rasm.tarmoq']
];
try {
  { const c = await b.newContext({ viewport: { width: 64, height: 64 } }); const pg = await c.newPage(); await pg.setContent('<body style="margin:0;background:#a33"></body>'); JPG = await pg.screenshot({ type: 'jpeg' }); await c.close(); }
  for (const [nom, javob, uz, ru, qid, ev] of CASES) {
    for (const [lang, want, w] of [['uz', uz, 360], ['ru', ru, 390]]) {
      const p = await open({ lang, w, rasm: javob }); await upload(p);
      assert.equal(await txt(p, '.rz-p.warn'), want, nom + ' ' + lang); assert.ok(!/Ошибка сервера|Server xatosi/.test(await p.locator('body').innerText()), nom + ': umumiy «Ошибка сервера» yo\'q');
      assert.equal(await p.locator('#phToSearch').count(), qid ? 1 : 0, nom + ': «Qidiruv orqali qo\'shish» tugmasi'); if (qid) { assert.equal(await txt(p, '#phToSearch'), lang === 'ru' ? 'Добавить через поиск' : "Qidiruv orqali qo'shish"); const bx = await p.locator('#phToSearch').boundingBox(); assert.ok(bx.x >= 0 && bx.x + bx.width <= w, nom + ': 360 px ga sig\'adi'); }
      assert.ok((await evs(p)).includes(ev), nom + ' hodisa ' + ev + ': ' + (await evs(p)).join(',')); assert.deepEqual(p.errs, []);
      if (qid && lang === 'uz') { await p.click('#phToSearch'); await p.waitForTimeout(500); assert.ok(await p.locator('#fdQ').isVisible(), nom + ': tugma qidiruvni ochadi'); }
      await p.context().close();
    }
    log(nom + ': aniq matn (uz/ru), ' + (qid ? 'qidiruv tugmasi bor' : 'tugma yo\'q (boshqa rasm tanlash kerak)') + ', hodisa ' + ev);
  }
  console.log('\nrasm-xato-ui: ' + n + ' tekshiruv o\'tdi');
} finally { await b.close(); srv.close(); }
