// KalkiFit v39: Bugun → «Imkoniyatlar» tugmasi va paneli. Tugma sarlavha yonida (ikkilamchi), yengil harakat — faqat BIR marta (qayta yuklaganda yo'q);
// panel — 6 asosiy (2×3: ovoz, rasm, menyu, yeymiz, hafta, kun yakuni) + «Yana» ro'yxati; har element o'z funksiyasini ochadi; Profil → Imkoniyatlar bilan BITTA ro'yxat; halqa joyida; uz/cyr/ru.
//   node tools/dizayn/test-kalkifit-imkoniyatlar.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates;
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const seed = (extra) => { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 86400000; st.prefs = Object.assign({ tipsDone: true, jokes: false, lpTip: 1, suvFrom: D.today() }, extra || {}); st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = D.addDays(D.today(), -8); S.addWeight(st, D.today(), 80); return st; };
async function open(w, url, st, fresh) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((o) => { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); }, { st, fresh: true });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"yoqilgan":true,"limit":15,"qoldi":3}' }));
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(700); return p;
}
try {
  /* 1. tugma: sarlavha yonida, har uch tilda; yengil harakat — faqat birinchi ochilishda */
  let p = await open(390, '/kalkifit', seed());
  assert.equal(await p.locator('.sl-hd2 #ftBtn').count(), 1); assert.equal((await p.locator('#ftBtn').innerText()).trim(), 'Imkoniyatlar'); assert.equal(await p.locator('#ftBtn svg').count(), 1);
  const g = await p.evaluate(() => { const b = document.getElementById('ftBtn'), h = document.getElementById('todayHd'), br = b.getBoundingClientRect(), hr = h.getBoundingClientRect(), cs = getComputedStyle(b); return { sameRow: br.top < hr.bottom + 40, right: br.right <= innerWidth - 8, border: cs.borderTopWidth, bg: cs.backgroundColor, wob: b.classList.contains('wob') }; });
  assert.equal(g.border, '1px', 'chegarali'); assert.equal(g.bg, 'rgba(0, 0, 0, 0)', 'ikkilamchi: to\'ldirilmagan'); assert.ok(g.right); assert.equal(g.wob, true, 'birinchi ochilishda harakat'); await p.waitForTimeout(2200); assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')).prefs.ftAnim), 1, 'harakat tugagach belgilandi'); assert.equal(await p.locator('#ftBtn.wob').count(), 0);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(600); assert.equal(await p.locator('#ftBtn.wob').count(), 0, 'qayta yuklaganda harakat YO\'Q'); assert.equal(await p.locator('#ftBtn').count(), 1);
  await p.context().close(); ok('tugma sarlavha yonida (ikonka + «Imkoniyatlar», chegarali, to\'ldirilmagan); yengil harakat faqat bir marta (qayta yuklaganda yo\'q)');
  for (const [url, txt] of [['/ru/kalkifit', 'Возможности'], ['/kalkifit?lang=cyr', 'Имкониятлар']]) { p = await open(390, url, seed()); assert.equal((await p.locator('#ftBtn').innerText()).trim(), txt, url); await p.click('#ftBtn'); await p.waitForTimeout(500); assert.match(await p.locator('#rzSheet .rz-sh-h, #rzSheet').first().innerText(), new RegExp(txt)); assert.ok(!/[A-Za-z]{4,}/.test((await p.locator('#rzSheet').innerText()).replace(/KalkiFit|Wi-Fi|AI|PWA/g, '')) || url.includes('ru') === false, 'ru: lotin so\'z yo\'q'); await p.context().close(); }
  ok('uz / cyr / ru: «Imkoniyatlar / Имкониятлар / Возможности»');
  /* 2. 360 px × 115%: sig'masa sana ostiga tushadi, yozuv qisqarmaydi */
  p = await open(360, '/kalkifit', seed()); await p.evaluate(() => { document.documentElement.classList.add('fs-big'); }); await p.waitForTimeout(300);
  const t = await p.evaluate(() => { const b = document.getElementById('ftBtn'), d = document.querySelector('.sl-hd2 .d'), br = b.getBoundingClientRect(); return { clip: b.scrollWidth > b.clientWidth + 1, inside: br.left >= 8 && br.right <= innerWidth - 8, ok: br.top >= d.getBoundingClientRect().bottom - 2 || br.left > d.getBoundingClientRect().right, w: br.width }; });
  assert.ok(!t.clip && t.inside && t.ok, JSON.stringify(t)); await p.context().close(); ok('360 px, katta shrift: tugma ekran ichida, yozuvi qisqarmaydi, sana bilan to\'qnashmaydi');
  /* 3. panel */
  p = await open(390, '/kalkifit', seed());
  const ring0 = await p.evaluate(() => { const r = document.getElementById('kcalBtn').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  await p.click('#ftBtn'); await p.waitForTimeout(600); assert.equal(await p.evaluate(() => document.getElementById('rzSheet').getAttribute('data-kind')), 'feats');
  const keys = await p.locator('#rzSheet .ft-tile').evaluateAll((l) => l.map((e) => e.dataset.fk)); assert.deepEqual(keys.slice(-3), ['yeymiz', 'hafta', 'kunkarta']); assert.ok(keys.includes('rasm')); assert.ok(keys.length >= 5 && keys.length <= 6);
  const tl = await p.locator('#rzSheet .ft-tile').evaluateAll((l) => l.map((e) => ({ ic: !!e.querySelector('svg'), nm: e.querySelector('b').innerText, h: e.querySelector('.h').innerText.length > 5, lim: !!e.querySelector('.ft-lim') })));
  assert.ok(tl.every((x) => x.ic && x.nm && x.h)); assert.equal(tl.filter((x) => x.lim).length, tl.filter((x) => /Ovoz|Rasm|Menyu/.test(x.nm)).length, 'limit faqat ovoz/rasm/menyuda'); assert.match(await p.locator('#rzSheet .ft-lim').first().innerText(), /3 ta qoldi/);
  const more = await p.locator('#rzSheet .ft-more .sl-feat').evaluateAll((l) => l.map((e) => e.dataset.fk)); assert.deepEqual(more.slice(0, 4), ['retsept', 'odatdagi', 'taomlarim', 'idishlar']); assert.ok(more.includes('supp') && more.includes('yesam'));
  assert.match(await p.locator('#rzSheet').innerText(), /Yana/); assert.equal(await p.locator('#rzSheet').evaluate((e) => e.scrollWidth <= e.clientWidth + 1), true);
  ok('panel: 6 asosiy (ikonka, nom, izoh; AI limiti faqat ovoz/rasm/menyuda) + «Yana»: retsept, odatdagi, taomlarim, idishlar, yesam, ulashish, vitaminlar');
  /* 4. har element o'z funksiyasini ochadi */
  const KIND = { hafta: 'week', kunkarta: 'daycard', odatdagi: 'tpls', taomlarim: 'rcmine', idishlar: 'vm', supp: 'supp', yesam: 'yesam', rasm: 'add', ovoz: 'add', yeymiz: null, retsept: null, menyu: null };
  for (const k of [...keys, ...more]) { if (!(k in KIND)) continue; if (process.env.DBG) console.log('->', k); await p.evaluate(() => document.querySelector('[data-act=ftopen]').click()); await p.waitForTimeout(450); if (!(await p.locator('#rzSheet').getAttribute('data-kind') === 'feats')) { await p.waitForTimeout(300); } await p.locator('#rzSheet [data-act=feat][data-fk=' + k + ']').scrollIntoViewIfNeeded(); await p.locator('#rzSheet [data-act=feat][data-fk=' + k + ']').click(); await p.waitForTimeout(600);
    const story = await p.evaluate(() => !!document.querySelector('.hk, [class*=hikoya], [class*=hk-]'));
    if (k === 'hafta') { assert.ok(story, 'hafta: to\'liq ekranli hikoya ochildi'); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); continue; }
    const kind = await p.evaluate(() => document.getElementById('rzSheet').getAttribute('data-kind')), vis = await p.evaluate(() => !document.getElementById('rzSheet').hidden); assert.notEqual(kind, 'feats', k + ': panel boshqa funksiyaga almashdi'); if (KIND[k]) { assert.ok(vis, k + ': varaq ochilmadi'); }
    await p.keyboard.press('Escape'); await p.evaluate(() => { const s = document.getElementById('rzSheet'); if (!s.hidden && document.querySelector('[data-act=sheetclose]')) document.querySelector('#rzSheet [data-act=sheetclose]')?.click(); }); await p.waitForTimeout(450); }
  ok('har element bosilganda o\'z funksiyasini ochadi (ovoz, rasm, menyu, yeymiz, hafta, kun yakuni, retsept, odatdagi, taomlarim, idishlar, yesam, vitaminlar)');
  /* 5. halqa joyida; Profil → Imkoniyatlar bilan bitta ro'yxat */
  const ring1 = await p.evaluate(() => { const r = document.getElementById('kcalBtn').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }); assert.deepEqual(ring1, ring0, 'halqa o\'lchami o\'zgarmadi');
  const panelKeys = [...keys, ...more].sort(); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500);
  const prof = await p.locator('.sl-feats:not(.ft-more) .sl-feat').evaluateAll((l) => l.map((e) => e.dataset.fk)).catch(() => []); assert.deepEqual(prof.slice().sort(), panelKeys, 'Profil va panel — bitta ro\'yxat: ' + prof.join());
  assert.ok(p.errs.length === 0, p.errs.join()); await p.context().close(); ok('halqa o\'lchami o\'zgarmadi; Profil → Imkoniyatlar va panel — bitta konfiguratsiyadan (bir xil kalitlar)');
  console.log('\n' + n + '/' + n + ' OK');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
