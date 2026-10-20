// KalkiFit «Retseptimni moslashtir» MAKETI (assets/kalkifit-retsept.js): kirish nuqtalari (Profil, Mening taomlarim, «Bugun nima yeymiz?» → Uyda),
// 4 ekran (Kirish → Tahlil → Natija → Ulashish), hisob (osh 6 kishi: 827 → 613 kkal, −26%, oqsil saqlandi), o'zgarish toggle'i raqamni jonli yangilaydi,
// tanilmagan masalliq «tanlang», canvas 1080×1350, reduced-motion (yuklanish ekransiz), 360 px / katta shrift / UZ·ЎЗ·RU — gorizontal skroll yo'q, xato yo'q.
// node tools/dizayn/test-retsept-maket.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs'; import { pool } from './parallel.mjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const TODAY = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
function seed() { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 86400000; st.prefs = { tipsDone: true, jokes: false, yemayK: 1 }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = D.addDays(TODAY, -8); S.addWeight(st, TODAY, 80); return st; }
async function mk(o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, colorScheme: o.dark ? 'dark' : 'light', reducedMotion: o.reduce ? 'reduce' : 'no-preference', isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((s) => { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(s)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); }, seed());
  if (o.big) await c.addInitScript(() => localStorage.setItem('kalki_fs', 'big'));
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e)));
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + (o.url || '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(400); return p; }
const odo = (p) => p.evaluate(() => document.getElementById('rtOdo').getAttribute('aria-label'));
const chip = (p) => p.evaluate(() => document.getElementById('rtChip').textContent);
const noScroll = (p) => p.evaluate(() => { const s = document.getElementById('rzSheet'); return document.documentElement.scrollWidth <= innerWidth + 1 && (!s || s.scrollWidth <= s.clientWidth + 1); });
async function toResult(p, o = {}) {
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(300); await p.click('.rz-main [data-act=rtopen]'); await p.waitForSelector('#rtText');
  await p.click('[data-act=rtex][data-x=' + (o.ex || 'osh') + ']'); await p.click('[data-act=rtgo]');
  await p.waitForSelector('[data-act=rtnext]', { timeout: 6000 }); if (o.unk !== false) { const u = p.locator('[data-act=rtunk]').first(); if (await u.count()) await u.click(); }
  await p.click('[data-act=rtnext]'); await p.waitForSelector('#rtOdo'); await p.waitForTimeout(o.reduce ? 150 : 1000); }
try {
  /* 1. kirish nuqtalari */
  let p = await mk(); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(300);
  const rows = await p.locator('.rz-main .rz-row').evaluateAll((l) => l.map((e) => e.getAttribute('data-act'))); const i = rows.indexOf('rtopen');
  assert.ok(i > -1 && rows[i + 1] === 'rcmine', 'Profil: «Mening taomlarim» tepasida: ' + rows.join(','));
  await p.click('.rz-main [data-act=rcmine]'); await p.waitForSelector('#rzSheet [data-act=rtopen]'); await p.click('#rzSheet [data-act=rtopen]'); await p.waitForSelector('#rtText'); await p.click('#rzSheet .rz-x[data-act=sheetclose]'); await p.waitForTimeout(500);
  await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(300); await p.click('#yeCard [data-act=yechip]'); await p.waitForSelector('[data-act=yeseg]', { timeout: 6000 }); await p.click('[data-act=yeseg][data-s=uyda]'); await p.waitForSelector('#rzSheet [data-act=rtopen]');
  assert.match(await p.locator('#rzSheet [data-act=rtopen]').innerText(), /O'z retseptimni yengillashtirish/); await p.click('#rzSheet [data-act=rtopen]'); await p.waitForSelector('#rtText'); await p.context().close();
  log('Kirish nuqtalari: Profil (Mening taomlarim tepasida), Mening taomlarim oynasi, «Bugun nima yeymiz?» → Uyda — «O\'z retseptimni yengillashtirish»');
  /* 2. kirish ekrani: bo'sh matn — ogohlantirish; misol chipi to'ldiradi */
  p = await mk(); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(300); await p.click('.rz-main [data-act=rtopen]'); await p.waitForSelector('#rtText');
  assert.match(await p.locator('#rtText').getAttribute('placeholder'), /Onamning oshi: 1 kg guruch/); assert.equal(await p.locator('[data-act=rtex]').count(), 3); assert.equal(await p.locator('#rtFile[accept="image/*"]').count(), 1);
  await p.click('[data-act=rtgo]'); await p.waitForTimeout(300); assert.equal(await p.locator('#rtText').count(), 1, 'bo\'sh matn bilan o\'tmaydi'); assert.match(await p.locator('#rzToast').innerText(), /Retseptni yozing/);
  await p.click('[data-act=rtex][data-x=osh]'); assert.match(await p.locator('#rtText').inputValue(), /450 g guruch/);
  /* 3. tahlil: yuklanish → ro'yxat; −/+; kishilar; tanilmagan masalliq */
  await p.click('[data-act=rtgo]'); await p.waitForSelector('.rt-scanh'); assert.ok(await p.locator('.rt-ing.scan').count() >= 8, 'yuklanishda masalliqlar birin-ketin');
  await p.waitForSelector('[data-act=rtnext]', { timeout: 4000 }); assert.equal(await p.locator('.rt-ing').count(), 9); assert.match(await p.locator('#rtUnk').innerText(), /Kishmish[\s\S]*tanlang/);
  await p.click('[data-act=rtnext]'); await p.waitForTimeout(300); assert.equal(await p.locator('#rtOdo').count(), 0, 'tanlanmaguncha o\'tmaydi'); assert.match(await p.locator('#rzToast').innerText(), /Sariq belgili/);
  await p.click('[data-act=rtunk][data-o=mayiz]'); await p.waitForTimeout(150); assert.equal(await p.locator('#rtUnk').count(), 0);
  const g0 = await p.locator('.rt-ing').nth(0).locator('.rt-step b').innerText(); await p.click('.rt-ing >> nth=0 >> [data-s="1"]'); assert.equal(await p.locator('.rt-ing').nth(0).locator('.rt-step b').innerText(), '500 g', g0 + ' → +'); await p.click('.rt-ing >> nth=0 >> [data-s="-1"]');
  await p.click('[data-act=rtn][data-s="1"]'); assert.equal(await p.locator('#rtN').innerText(), '7'); await p.click('[data-act=rtn][data-s="-1"]');
  log('Kirish: placeholder, 3 misol, «Rasmga olish» (image/*), bo\'sh matn — ogohlantirish; Tahlil: yuklanish animatsiyasi → 9 masalliq, − / + gramm, kishilar 1–12, Kishmish «tanlang» tanlanmaguncha Davom yo\'q');
  /* 4. natija: raqam, foiz, oqsil, diagramma, toggle jonli */
  await p.click('[data-act=rtnext]'); await p.waitForSelector('#rtOdo'); await p.waitForTimeout(1000);
  assert.equal(await odo(p), '613 kkal'); assert.equal(await p.locator('.rt-big .old').innerText(), '827'); assert.equal(await chip(p), '−26% · oqsil saqlandi');
  assert.equal(await p.locator('.rt-ch').count(), 4); assert.equal(await p.locator('.rt-ch[aria-checked=true]').count(), 4); assert.match(await p.locator('.rt-ch').first().innerText(), /Yog'ni kamaytirish: 130 → 70\sg[\s\S]*−90 kkal porsiyada[\s\S]*deyarli sezilmaydi/);
  assert.match(await p.locator('.rt-bm.k .h').innerText(), /827 → 613/); const w = await p.locator('.rt-bm.k .rt-br.n i').evaluate((e) => e.style.width); assert.equal(w, '74%');
  await p.click('[data-act=rttog][data-c=dumba]'); await p.waitForTimeout(600); assert.equal(await odo(p), '689 kkal'); assert.equal(await p.locator('[data-c=dumba]').getAttribute('aria-checked'), 'false'); assert.match(await chip(p), /−17%/);
  for (const c of ['yog', 'tovuq', 'sabzi']) await p.click('[data-act=rttog][data-c=' + c + ']'); await p.waitForTimeout(500); assert.equal(await odo(p), '827 kkal'); assert.equal(await chip(p), 'O\'zgarishlarni yoqing');
  for (const c of ['yog', 'dumba', 'tovuq', 'sabzi']) await p.click('[data-act=rttog][data-c=' + c + ']'); await p.waitForTimeout(500); assert.equal(await odo(p), '613 kkal');
  assert.match(await p.locator('#rzSheet .rz-priv', { hasText: 'KalkiFit bazasi' }).first().innerText(), /Raqamlar taxminiy, KalkiFit bazasi asosida/);
  await p.click('[data-act=rtsave]'); await p.waitForTimeout(200); assert.match(await p.locator('#rzToast').innerText(), /Maket/);
  log('Natija: 827 → 613 kkal (odometr), «−26% · oqsil saqlandi», Oldin/Keyin (kkal 74%), 4 o\'zgarish (sarlavha, −90 kkal, ta\'m belgisi), toggle jonli: dumbasiz 689 (−17%), hammasi o\'chiq 827, qayta 613; halol izoh');
  /* 5. ulashish kartochkasi */
  await p.click('[data-act=rtshare]'); await p.waitForSelector('#rtCardImg', { timeout: 8000 }); await p.waitForTimeout(300);
  assert.deepEqual(await p.locator('#rtCardImg').evaluate((e) => [e.naturalWidth, e.naturalHeight]), [1080, 1350]); assert.equal(await p.locator('[data-act=rtsend]').count(), 1); assert.equal(await p.locator('[data-act=rtdl]').count(), 1);
  const dl = p.waitForEvent('download', { timeout: 5000 }); await p.click('[data-act=rtdl]'); assert.match((await dl).suggestedFilename(), /kalkifit-yengil-osh\.png/);
  await p.click('[data-act=rtback3]'); await p.waitForSelector('#rtOdo'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Ulashish: canvas 1080×1350 PNG, «Ulashish» (Web Share, fayl bilan) va «Yuklab olish» (kalkifit-yengil-osh.png), Orqaga → Natija; xatolar yo\'q');
  /* 6. reduced-motion: yuklanish ekransiz, raqam darhol */
  p = await mk({ reduce: true }); await toResult(p, { reduce: true }); assert.equal(await odo(p), '613 kkal'); assert.equal(await p.locator('.rt-odo .s').first().evaluate((e) => getComputedStyle(e).transitionDuration), '0s'); await p.context().close();
  log('prefers-reduced-motion: yuklanish ekranisiz, odometr/diagramma animatsiyasiz');
  /* 7. Mastava, Manti; 360 / katta shrift / dark / RU / ЎЗ — skroll yo'q, xato yo'q */
  const CASES = [{ ex: 'mastava', w: 360, h: 740, want: '385' }, { ex: 'manti', w: 360, h: 740, big: true, dark: true, want: '613' }, { ex: 'osh', w: 360, h: 740, url: '/ru/kalkifit', want: '613 ккал', ru: true }, { ex: 'osh', w: 390, h: 844, url: '/kalkifit?lang=cyr', dark: true, want: '613 ккал', cyr: true }];
  const R = await pool(CASES, 3, async (o) => {
    const q = await mk(o); await toResult(q, o); const v = await odo(q), ok = await noScroll(q), t = await q.locator('#rzSheet').innerText(); const ch = await chip(q);
    await q.click('[data-act=rtshare]'); await q.waitForSelector('#rtCardImg', { timeout: 8000 }); const ok2 = await noScroll(q); const e = q.errs; await q.context().close(); return { o, v, ok, ok2, t, ch, e }; });
  for (const r of R) {
    assert.ok(r.v.startsWith(r.o.want), r.o.ex + ': ' + r.v); assert.ok(r.ok && r.ok2, r.o.ex + ' ' + r.o.w + ': gorizontal skroll'); assert.deepEqual(r.e, [], r.o.ex);
    if (r.o.ru) { assert.match(r.ch, /белок сохранён/); assert.match(r.t, /Умные изменения/); } if (r.o.cyr) { assert.match(r.ch, /оқсил сақланди/); assert.match(r.t, /Ақлли ўзгаришлар/); }
  }
  log('Mastava (551 → 385), Manti (880 → 613), 360 px, katta shrift, dark, RU («белок сохранён»), ЎЗ («оқсил сақланди») — gorizontal skroll yo\'q, kartochka chiziladi, xatolar yo\'q');
  console.log('\n' + n + ' ta tekshiruv o\'tdi');
} finally { await b.close(); srv.close(); }
