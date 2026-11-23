// KalkiFit v99: «Haftalik zaxira vaqti» eslatmasi — akkauntli foydalanuvchiga chiqmaydi; mehmonga aniq matn (Google / Faylga saqlash / Keyinroq); Keyinroq 7 kun, 3 marta — 30 kun.  node tools/dizayn/test-zaxira-eslatma.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates;
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const TODAY = D.today();
function seed(prefs) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 86400000; st.prefs = Object.assign({ tipsDone: true, yemayAsked: 1, jokes: false, ttAsked: 1, hwSeen: TODAY, lpTip: 1, yemayK: 1, h_hafta: Date.now(), jobAsked: 1, fc: { done: 1 }, crd: { ekran: { ok: 1 }, ilova: { ok: 1 }, akkaunt: { ok: 1 } } }, prefs || {}); st.profile = { sex: 'm', preg: false, age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: null }; st.trackStart = D.addDays(TODAY, -14); S.addWeight(st, TODAY, 80); for (let i = 1; i <= 4; i++) st.days[D.addDays(TODAY, -i)] = { steps: 1000 * i }; return st; }
async function open(o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 360, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((x) => { try { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_stat_test', '1');
    if (x.akk) localStorage.setItem('kalki_akk', JSON.stringify({ yoq: true, kirgan: true, email: 'a@b.c', il: { kalkifit: 'konv' }, t: Date.now() })); } catch (e) {} }, { st: o.st, akk: o.akk });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e)));
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.goto(BASE + (o.lang === 'ru' ? '/ru/kalkifit' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(900); return p;
}
const txt = async (p, sel) => { const l = p.locator(sel).first(); return (await l.count()) ? (await l.innerText()).replace(/\s+/g, ' ').trim() : null; };
let p, t;
/* 1. mehmon: matn, tugmalar */
p = await open({ st: seed(), lang: 'uz' }); t = await txt(p, '[data-nudge=backup]'); assert.ok(t, 'mehmonga eslatma chiqadi');
assert.match(t, /Ma'lumotlaringizni yo'qotmang/); assert.match(t, /Hozir yozuvlaringiz faqat shu telefonda\. Google orqali kirsangiz, har kuni avtomatik saqlanadi\./); assert.doesNotMatch(t, /Haftalik zaxira vaqti/);
assert.equal((await p.locator('[data-nudge=backup] .rz-btn').allInnerTexts()).map((x) => x.trim()).join('|'), 'Google orqali kirish|Faylga saqlash|Keyinroq'); assert.equal(await p.locator('[data-nudge=backup] .rz-btn.primary').count(), 1, 'asosiy tugma bitta');
assert.deepEqual(p.errs, []); await p.context().close();
p = await open({ st: seed(), lang: 'ru' }); t = await txt(p, '[data-nudge=backup]');
assert.match(t, /Не потеряйте свои записи/); assert.match(t, /Сейчас ваши записи только на этом телефоне\. Если войдёте через Google, они будут сохраняться автоматически каждый день\./); assert.match(t, /Войти через Google/); assert.match(t, /Сохранить в файл/); assert.match(t, /Позже|Потом|Позднее|Не сейчас|Напомнить/i); await p.context().close();
log('Mehmon: «Ma\'lumotlaringizni yo\'qotmang» + 1 jumla + [Google orqali kirish] [Faylga saqlash] [Keyinroq] (uz, ru)');
/* 2. akkauntli — umuman chiqmaydi (zaxira 8 kun oldin, hech qachon yashirilmagan) */
for (const lang of ['uz', 'ru']) { p = await open({ st: seed(), akk: 1, lang }); assert.equal(await p.locator('[data-nudge=backup]').count(), 0, 'akkauntli: eslatma yo\'q ' + lang); await p.context().close(); }
log('Akkauntga kirgan foydalanuvchiga eslatma chiqmaydi');
/* 3. «Keyinroq» → 7 kun; 3 marta → 30 kun */
p = await open({ st: seed(), lang: 'uz' }); await p.click('[data-nudge=backup] [data-act=hide]'); await p.waitForTimeout(300); assert.equal(await p.locator('[data-nudge=backup]').count(), 0);
let pr = await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')).prefs); assert.equal(pr.bkN, 1); await p.context().close();
const DAYMS = 86400000;
for (const [bkN, ago, want, nm] of [[1, 6, 0, '1 marta, 6 kun'], [1, 8, 1, '1 marta, 8 kun'], [2, 8, 1, '2 marta, 8 kun'], [3, 8, 0, '3 marta, 8 kun'], [3, 29, 0, '3 marta, 29 kun'], [3, 31, 1, '3 marta, 31 kun']]) {
  p = await open({ st: seed({ bkN, h_backup: Date.now() - ago * DAYMS }), lang: 'uz' }); assert.equal(await p.locator('[data-nudge=backup]').count(), want, nm); await p.context().close(); }
p = await open({ st: seed({ bkN: 2, h_backup: Date.now() - 8 * DAYMS }), lang: 'uz' }); await p.click('[data-nudge=backup] [data-act=hide]'); await p.waitForTimeout(300);
pr = await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')).prefs); assert.equal(pr.bkN, 3, '3-rad'); await p.context().close();
log('«Keyinroq»: 7 kun; 3 marta rad etilsa — 30 kun');
/* 4. «Faylga saqlash» fayl yuboradi/yuklaydi */
p = await open({ st: seed(), lang: 'uz' }); await p.evaluate(() => { window.__shared = []; navigator.canShare = () => true; navigator.share = (d) => { window.__shared.push(d); return Promise.resolve(); }; });
await p.click('[data-nudge=backup] [data-act=bktg]'); await p.waitForTimeout(600); assert.equal((await p.evaluate(() => window.__shared)).length, 1); assert.equal(await p.locator('[data-nudge=backup]').count(), 0); await p.context().close();
log('«Faylga saqlash» — zaxira faylini beradi');
/* 5. «Google orqali kirish» — akkaunt oynasi ochiladi (server yo'q: xato bo'lmasin) */
p = await open({ st: seed(), lang: 'uz' }); await p.click('[data-nudge=backup] [data-act=bkgoogle]'); await p.waitForTimeout(500); assert.deepEqual(p.errs, []); await p.context().close();
log('«Google orqali kirish» xatosiz ishlaydi');
await b.close(); srv.close();
