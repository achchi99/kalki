// KalkiFit v69: Bugun → «Imkoniyatlar» (pastdan chiqadigan panel, 4 yo'l: Ovqat yozish · Nima yeyman? · Mening taomlarim · Natijalarim; pastda «Bilim»). Limitlar (Ovoz/Rasm/Menyu — aniq davr bilan),
// yopish: ✕, fon, Escape, pastga surish, Android «orqaga»; har band o'z funksiyasini ochadi; Profil → Imkoniyatlar bilan BITTA ro'yxat; iPhone veb ovozi (server orqali); uz/cyr/ru, 360 px × 115%. (Tokenlar/chiplar/kontrast — test-kalkifit-dizayn-tizim.)
// Halqaga tegilmaydi.   node tools/dizayn/test-kalkifit-imkoniyatlar.mjs

import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates;
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const seed = () => { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 86400000; st.prefs = { tipsDone: true, jokes: false, lpTip: 1, suvFrom: D.today() }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = D.addDays(D.today(), -8); S.addWeight(st, D.today(), 80); return st; };
async function open(w, url, o = {}) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: o.th || 'light', userAgent: o.ua });
  await c.addInitScript((st) => { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); }, seed());
  if (o.noWebSR) await c.addInitScript(() => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/**', async (r) => { if (/api\/ovoz/.test(r.request().url())) { if (o.ovDelay) await new Promise((k) => setTimeout(k, o.ovDelay)); return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o.ovOff ? { yoqilgan: false } : { yoqilgan: true, limit: 15, qoldi: 15 }) }); } r.fulfill({ status: 200, contentType: 'application/json', body: '{"yoqilgan":true,"limit":5,"qoldi":4}' }); });
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(700); return p;
}
const isOpen = (p) => p.evaluate(() => { const d = document.getElementById('ftDr'); return !!d && !d.hidden && d.classList.contains('op'); });
const openDr = async (p) => { await p.click('#ftBtn'); await p.waitForTimeout(500); assert.ok(await isOpen(p), 'panel ochildi'); };
const closedAfter = async (p, how) => { await p.waitForTimeout(450); assert.equal(await isOpen(p), false, how + ': yopildi'); assert.equal(await p.evaluate(() => document.getElementById('ftDr').hidden), true, how + ': yashirildi'); };
try {
  /* 1. tugma: «Imkoniyatlar» + 4 kvadrat belgisi, raqam va puls yo'q; 390 px — sarlavha yonida */
  let p = await open(390, '/kalkifit');
  const g = await p.evaluate(() => { const bt = document.getElementById('ftBtn'), br = bt.getBoundingClientRect(), h = document.getElementById('todayHd').getBoundingClientRect(); return { txt: bt.querySelector('b').textContent, n: bt.querySelectorAll('.n').length, shine: bt.classList.contains('shine'), right: br.right > 300, beside: br.top < h.bottom + 6 }; });
  assert.equal(g.txt, 'Imkoniyatlar'); assert.equal(g.n, 0); assert.equal(g.shine, false); assert.ok(g.right && g.beside, '390 px: sarlavha yonida');
  ok('tugma: «Imkoniyatlar» + belgi; raqam va yaltirash yo\'q; sarlavha yonida');
  /* 2. panel pastdan: 4 yo'l, limitlar aniq davr bilan, tanishtiruv havolasi yo'q */
  const ring0 = await p.evaluate(() => { const r = document.getElementById('kcalBtn').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  await openDr(p);
  const d = await p.evaluate(() => { const dr = document.getElementById('ftDr'), r = dr.getBoundingClientRect(), ov = document.querySelector('.ft-ov'), cs = getComputedStyle(dr); return { bottom: Math.round(r.bottom), w: Math.round(r.width), vh: innerHeight, radT: cs.borderTopLeftRadius, radB: cs.borderBottomLeftRadius, ov: !ov.hidden && +getComputedStyle(ov).opacity > 0.9, role: dr.getAttribute('role'), focus: document.activeElement && document.activeElement.className, paths: [...dr.querySelectorAll('.ft-pt')].map((e) => e.dataset.p), intro: dr.querySelectorAll('[data-act=ftintro]').length, bilim: [...dr.querySelectorAll('.ft-bc')].map((e) => e.dataset.fk) }; });
  assert.equal(d.bottom, d.vh); assert.ok(d.w <= 560); assert.notEqual(d.radT, '0px'); assert.equal(d.radB, '0px'); assert.ok(d.ov, 'fon xiralashgan'); assert.equal(d.role, 'dialog'); assert.deepEqual(d.paths, ['yozish', 'yeyman', 'mening', 'natija']); assert.equal(d.intro, 0); assert.deepEqual(d.bilim, ['supp', 'afsona']);
  await p.click('[data-act=ftpath][data-p=yozish]'); await p.waitForTimeout(250);
  const lim = await p.evaluate(() => [...document.querySelectorAll('#ftDr .sl-feat')].filter((e) => e.querySelector('.ft-lim')).map((e) => e.dataset.fk + ':' + e.querySelector('.ft-lim').textContent)); assert.deepEqual(lim, ['ovoz:Bugun yana 15 ta', 'rasm:Bugun yana 4 ta', 'menyu:Bugun yana 4 ta']);
  await p.click('[data-act=ftback]'); await p.waitForTimeout(250);
  ok('panel pastdan: yuqori burchaklar yumaloq, fon xira; 4 yo\'l + «Bilim»; tanishtiruv havolasi yo\'q; Ovoz/Rasm/Menyu limiti aniq davr bilan');
  /* 3. yopish: ✕, fon, Escape, Android «orqaga», pastga surish */
  await p.click('#ftDr .ft-x'); await closedAfter(p, '✕'); assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.id), 'ftBtn', 'fokus tugmaga qaytdi');
  await openDr(p); await p.mouse.click(200, 60); await closedAfter(p, 'fon');
  await openDr(p); await p.keyboard.press('Escape'); await closedAfter(p, 'Escape');
  await openDr(p); assert.equal(await p.evaluate(() => window.KalkiNative.back()), 'overlay'); await closedAfter(p, 'Android orqaga');
  await openDr(p); await p.click('[data-act=ftpath][data-p=yozish]'); await p.waitForTimeout(250); assert.equal(await p.evaluate(() => window.KalkiNative.back()), 'overlay'); await p.waitForTimeout(300); assert.equal(await isOpen(p), true, 'yo\'l ichida «orqaga» — 4 yo\'lga qaytadi'); assert.equal(await p.locator('#ftDr .ft-pt').count(), 4); await p.keyboard.press('Escape'); await closedAfter(p, 'Escape (yo\'l)');
  const cdp = await p.context().newCDPSession(p), tp = (type, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: 195, y }] });
  await openDr(p); const top = await p.evaluate(() => Math.round(document.getElementById('ftDr').getBoundingClientRect().top)); await tp('touchStart', top + 50); for (const y of [top + 60, top + 80, top + 100]) { await tp('touchMove', y); await p.waitForTimeout(16); }
  const mid = await p.evaluate(() => document.getElementById('ftDr').style.transform); assert.match(mid, /translateY\(\d+/, 'barmoqqa ergashadi: ' + mid); await tp('touchEnd'); await p.waitForTimeout(80); assert.equal(await isOpen(p), true, 'oz surilsa qaytadi');
  await tp('touchStart', top + 50); for (const y of [top + 90, top + 170, top + 250, top + 330]) { await tp('touchMove', y); await p.waitForTimeout(16); } await tp('touchEnd'); await closedAfter(p, 'pastga surish');
  ok('yopish: ✕ (fokus tugmaga qaytadi), fon, Escape, Android «orqaga», pastga surish (barmoqqa ergashadi; oz surilsa joyiga qaytadi)');
  /* 4. har band o'z funksiyasini ochadi */
  const keys = ['yozish', 'ovoz', 'rasm', 'yorliq', 'menyu', 'yeymiz', 'yesam', 'retsept', 'odatdagi', 'taomlarim', 'idishlar', 'tartib', 'hafta', 'kunkarta', 'ulashish']; const pOf = { yozish: 'yozish', ovoz: 'yozish', rasm: 'yozish', yorliq: 'yozish', menyu: 'yozish', yeymiz: 'yeyman', yesam: 'yeyman', retsept: 'yeyman', odatdagi: 'mening', taomlarim: 'mening', idishlar: 'mening', tartib: 'mening', hafta: 'natija', kunkarta: 'natija', ulashish: 'natija' };
  for (const k of keys.concat(['supp', 'afsona'])) {
    await openDr(p); if (pOf[k]) { await p.click('[data-act=ftpath][data-p=' + pOf[k] + ']'); await p.waitForTimeout(250); }
    const sel = pOf[k] ? '#ftDr [data-act=feat][data-fk=' + k + ']' : '#ftDr .ft-bc[data-fk=' + k + ']'; if (!(await p.locator(sel).count())) continue; await p.locator(sel).scrollIntoViewIfNeeded(); await p.locator(sel).click(); await p.waitForTimeout(700);
    assert.equal(await isOpen(p), false, k + ': panel yopildi');
    const st = await p.evaluate(() => ({ sheet: !document.getElementById('rzSheet').hidden && document.getElementById('rzSheet').classList.contains('open'), kind: document.getElementById('rzSheet').getAttribute('data-kind'), story: !!document.querySelector('.hk, [class*=hikoya], [class*=hk-]'), full: [...document.querySelectorAll('.yg-full, .sl-yfull, [class*=yeymiz]')].some((e) => e.getBoundingClientRect().height > 300) }));
    if (k === 'afsona') { assert.equal(await p.locator('#afOv').count(), 1, 'afsona: to\'liq ekran'); await p.click('#afOv [data-act=afx]'); await p.waitForTimeout(400); continue; }
    if (k === 'hafta') { assert.ok(st.story, 'hafta: hikoya'); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); continue; }
    assert.ok(st.sheet || st.full, k + ': funksiya ochildi ' + JSON.stringify(st)); if (k === 'ovoz' || k === 'rasm') assert.equal(st.kind, 'add');
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  }
  ok('har band bosilganda panel yopilib, o\'z funksiyasi ochiladi (' + keys.join(', ') + ', supp, afsona)');
  /* 5. halqa o'zgarmadi; Profil → Imkoniyatlar — panel bilan bitta ro'yxat; tanishtiruv Profil → Sozlamalar'da */
  const ring1 = await p.evaluate(() => { const r = document.getElementById('kcalBtn').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }); assert.deepEqual(ring1, ring0, 'halqa o\'lchami o\'zgarmadi');
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500); assert.deepEqual(await p.locator('.sl-feats .sl-feat').evaluateAll((l) => l.map((e) => e.dataset.fk).sort()), keys.concat(['supp', 'afsona']).sort(), 'Profil va panel — bitta ro\'yxat');
  await p.click('[data-act=intro]'); await p.waitForTimeout(600); assert.equal(await p.evaluate(() => !document.getElementById('rzIntro').hidden), true, 'tanishtiruv ochildi (Profil → Sozlamalar)');
  assert.deepEqual(p.errs, []); await p.context().close(); ok('Profil → Imkoniyatlar — shu ro\'yxat; «Tanishtiruvni qayta ko\'rish» Profil → Sozlamalar\'da ishlaydi; halqa o\'zgarmadi');
  /* 6. iPhone veb: ovoz server orqali — javob kelmasdan ham ko'rinadi; server o'chirgan bo'lsa — qator yo'q */
  p = await open(390, '/kalkifit', { ua: IPHONE, noWebSR: true, ovDelay: 1500 }); await openDr(p); await p.click('[data-act=ftpath][data-p=yozish]'); await p.waitForTimeout(250);
  assert.equal(await p.locator('#ftDr [data-fk=ovoz]').count(), 1, 'iPhone: ovoz javobdan oldin ham ko\'rinadi'); await p.waitForTimeout(1800); assert.equal(await p.locator('#ftDr [data-fk=ovoz]').count(), 1, 'server yoqilgan — qoladi'); assert.match(await p.locator('#ftDr [data-fk=ovoz] .ft-lim').innerText(), /Bugun yana 15 ta/);
  await p.click('#ftDr [data-fk=ovoz]'); await p.waitForTimeout(700); assert.equal(await p.evaluate(() => document.getElementById('rzSheet').getAttribute('data-kind')), 'add'); await p.context().close();
  p = await open(390, '/kalkifit', { ua: IPHONE, noWebSR: true, ovOff: true }); await p.waitForTimeout(300); await openDr(p); await p.click('[data-act=ftpath][data-p=yozish]'); await p.waitForTimeout(400);
  assert.deepEqual(await p.evaluate(() => [...document.querySelectorAll('#ftDr .sl-feat')].map((e) => e.dataset.fk)), ['yozish', 'rasm', 'yorliq', 'menyu']); await p.context().close();
  ok('iPhone veb (Web Speech yo\'q): ovoz server orqali — doim ko\'rinadi, bosilsa ovoz oynasi; server ovozni o\'chirgan bo\'lsa — qator yo\'q');
  /* 7. tillar va 360 px × 115% */
  for (const [url, t1, t2] of [['/ru/kalkifit', 'Возможности', 'Записать еду'], ['/kalkifit?lang=cyr', 'Имкониятлар', 'Овқат ёзиш']]) { p = await open(390, url, { th: 'dark' }); assert.equal(await p.locator('#ftBtn b').innerText(), t1); await openDr(p); const tx = await p.locator('#ftDr').innerText(); assert.ok(tx.includes(t1) && tx.toLowerCase().includes(t2.toLowerCase()), url + ': ' + tx.slice(0, 80)); assert.deepEqual(p.errs, []); await p.context().close(); }
  p = await open(360, '/kalkifit'); await p.evaluate(() => document.documentElement.classList.add('fs-big')); await p.waitForTimeout(300);
  const t = await p.evaluate(() => { const bt = document.getElementById('ftBtn'), br = bt.getBoundingClientRect(); const kids = [...bt.children].map((e) => e.getBoundingClientRect()); return { clip: kids.some((r) => r.right > br.right + 1 || r.left < br.left - 1), inside: br.left >= 0 && br.right <= innerWidth }; });
  assert.ok(!t.clip && t.inside, '360 px 115%: tugma kesilmaydi: ' + JSON.stringify(t)); await openDr(p); assert.equal(await p.evaluate(() => { const d = document.getElementById('ftDr'); return d.scrollWidth <= d.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth; }), true, 'panelda gorizontal siljish yo\'q');
  for (const k of ['yozish', 'yeyman', 'mening', 'natija']) { await p.click('[data-act=ftpath][data-p=' + k + ']'); await p.waitForTimeout(250); assert.equal(await p.evaluate(() => { const d = document.getElementById('ftDr'); return d.scrollWidth <= d.clientWidth + 1; }), true, k + ': siljish yo\'q'); await p.click('[data-act=ftback]'); await p.waitForTimeout(250); }
  ok('uz / cyr / ru (tungi); 360 px × 115%: tugma kesilmaydi; panel va 4 yo\'lda gorizontal siljish yo\'q');
  console.log('\n' + n + '/' + n + ' OK');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
