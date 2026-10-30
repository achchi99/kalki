// KalkiFit v40: Bugun → «Imkoniyatlar» (maket: ~/imkoniyatlar-maket.html). Tugma: gradient, son nishoni (featList'dan), yaltirash faqat BIR marta.
// Panel CHAPDAN chiqadi (min(86vw, 360px)), guruhlar: Tez qo'shish (Ovoz/Rasm/Menyu, limiti bilan) → Natijalar → Nima yesam bo'ladi? → Mening → Sog'liq, pastda «Tanishtiruvni qayta ko'rish».
// Yopish: ✕, fon, chapga surish (barmoqqa ergashadi), Escape, Android «orqaga». Har element o'z funksiyasini ochadi; Profil → Imkoniyatlar bilan BITTA ro'yxat.
// iPhone veb: ovoz (server orqali) ko'rinadi; server ovozni o'chirgan bo'lsa — karta yo'q va to'rda bo'sh joy qolmaydi. Halqaga tegilmaydi.   node tools/dizayn/test-kalkifit-imkoniyatlar.mjs
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
  /* 1. tugma: gradient, ikonka kvadrati, son = featList; yaltirash faqat bir marta */
  let p = await open(390, '/kalkifit');
  const g = await p.evaluate(() => { const b = document.getElementById('ftBtn'), cs = getComputedStyle(b), br = b.getBoundingClientRect(), h = document.getElementById('todayHd').getBoundingClientRect(); return { txt: b.querySelector('b').textContent, n: +b.querySelector('.n').textContent, bg: cs.backgroundImage, ic: getComputedStyle(b.querySelector('.ic')).backgroundImage, shine: b.classList.contains('shine'), right: br.right <= innerWidth - 8, beside: br.top < h.bottom && br.left > h.right }; });
  assert.equal(g.txt, 'Imkoniyatlar'); assert.match(g.bg, /linear-gradient/); assert.match(g.ic, /linear-gradient/); assert.equal(g.shine, true, 'birinchi ochilishda yaltiraydi'); assert.ok(g.right); assert.ok(g.beside, '390 px: sarlavha yonida (maketdagidek)');
  await p.waitForTimeout(2400); assert.equal(await p.evaluate(() => localStorage.getItem('kalki_ft_anim')), '1'); assert.equal(await p.locator('#ftBtn.shine').count(), 0);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); assert.equal(await p.locator('#ftBtn.shine').count(), 0, 'qayta yuklaganda yaltiramaydi');
  ok('tugma: gradient, rangli ikonka kvadrati, «Imkoniyatlar» + son nishoni; yaltirash faqat bir marta; 390 px — sarlavha yonida');
  /* 2. panel chapdan: o'lcham, fon, fokus, guruhlar tartibi, limitlar */
  const ring0 = await p.evaluate(() => { const r = document.getElementById('kcalBtn').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  await openDr(p);
  const d = await p.evaluate(() => { const dr = document.getElementById('ftDr'), r = dr.getBoundingClientRect(), ov = document.querySelector('.ft-ov'), cs = getComputedStyle(dr);
    return { left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), rad: cs.borderTopRightRadius, radL: cs.borderTopLeftRadius, ov: !ov.hidden && +getComputedStyle(ov).opacity > 0.9, blur: /blur/.test(getComputedStyle(ov).backdropFilter || getComputedStyle(ov).webkitBackdropFilter || ''), role: dr.getAttribute('role'), focus: document.activeElement && document.activeElement.classList.contains('ft-x'),
      secs: [...dr.querySelectorAll('.ft-sec')].map((e) => e.textContent), tiles: [...dr.querySelectorAll('.ft-t')].map((e) => e.dataset.fk + ':' + e.querySelector('small').textContent), keys: [...dr.querySelectorAll('[data-act=feat]')].map((e) => e.dataset.fk), cnt: +document.querySelector('#ftBtn .n').textContent, foot: (dr.querySelector('[data-act=ftintro]') || {}).textContent, its: dr.querySelectorAll('.it').length, dly: dr.querySelector('.ft-grp.it').style.animationDelay }; });
  assert.equal(d.left, 0); assert.equal(d.w, Math.round(Math.min(390 * 0.86, 360))); assert.equal(d.h, 800); assert.notEqual(d.rad, '0px'); assert.equal(d.radL, '0px'); assert.ok(d.ov && d.blur, 'fon xiralashgan va blur'); assert.equal(d.role, 'dialog'); assert.ok(d.focus, 'fokus ✕ da');
  assert.deepEqual(d.secs.map((x) => x.toLowerCase()), ["tez qo'shish", 'natijalar', 'ovqat tanlash', 'mening', "sog'liq", 'bilim']);          // v54: «Bilim» — Afsona yoki haqiqat?
  assert.deepEqual(d.tiles, ['ovoz:15 ta qoldi', 'rasm:4 ta qoldi', 'menyu:4 ta qoldi']); assert.equal(d.keys.length, d.cnt, 'nishon soni = panel elementlari'); assert.equal(d.foot, "Tanishtiruvni qayta ko'rish"); assert.ok(d.its > 8 && /ms$/.test(d.dly), 'elementlar ketma-ket paydo bo\'ladi');
  assert.deepEqual(d.keys, ['ovoz', 'rasm', 'menyu', 'hafta', 'kunkarta', 'ulashish', 'yeymiz', 'yesam', 'retsept', 'odatdagi', 'taomlarim', 'yorliq', 'idishlar', 'tartib', 'supp', 'afsona']);          // v48: «Mening tartibim» — «Mening» guruhida
  ok('panel chapdan: kenglik min(86vw, 360), o\'ng burchaklari yumaloq, fon xira + blur, fokus ✕; guruhlar maketdagidek; Ovoz/Rasm/Menyu limiti bilan; son = ' + d.cnt);
  /* 3. yopish: ✕, fon, Escape, chapga surish, Android «orqaga» */
  await p.click('#ftDr .ft-x'); await closedAfter(p, '✕'); assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.id), 'ftBtn', 'fokus tugmaga qaytdi');
  await openDr(p); await p.mouse.click(380, 400); await closedAfter(p, 'fon');
  await openDr(p); await p.keyboard.press('Escape'); await closedAfter(p, 'Escape');
  await openDr(p); assert.equal(await p.evaluate(() => window.KalkiNative.back()), 'overlay'); await closedAfter(p, 'Android orqaga');
  const cdp = await p.context().newCDPSession(p), tp = (type, x) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y: 400 }] });
  await openDr(p); await tp('touchStart', 250); for (const x of [235, 215, 195]) { await tp('touchMove', x); await p.waitForTimeout(16); }
  const mid = await p.evaluate(() => document.getElementById('ftDr').style.transform); assert.match(mid, /translateX\(-\d+/, 'barmoqqa ergashadi: ' + mid); await tp('touchEnd'); await p.waitForTimeout(80); assert.equal(await isOpen(p), true, '55 px — qaytadi'); assert.equal(await p.evaluate(() => document.getElementById('ftDr').style.transform), '');
  await tp('touchStart', 250); for (const x of [220, 180, 140, 110]) { await tp('touchMove', x); await p.waitForTimeout(16); } await tp('touchEnd'); await closedAfter(p, 'chapga surish');
  ok('yopish: ✕ (fokus tugmaga qaytadi), fonga bosish, Escape, Android «orqaga», chapga surish (barmoqqa ergashadi; oz surilsa — joyiga qaytadi)');
  /* 4. har element o'z funksiyasini ochadi */
  for (const k of d.keys) {
    await openDr(p); await p.locator('#ftDr [data-act=feat][data-fk=' + k + ']').scrollIntoViewIfNeeded(); await p.locator('#ftDr [data-act=feat][data-fk=' + k + ']').click(); await p.waitForTimeout(650);
    assert.equal(await isOpen(p), false, k + ': panel yopildi');
    const st = await p.evaluate(() => ({ sheet: !document.getElementById('rzSheet').hidden && document.getElementById('rzSheet').classList.contains('open'), kind: document.getElementById('rzSheet').getAttribute('data-kind'), story: !!document.querySelector('.hk, [class*=hikoya], [class*=hk-]'), full: [...document.querySelectorAll('.yg-full, .sl-yfull, [class*=yeymiz]')].some((e) => e.getBoundingClientRect().height > 300) }));
    if (k === 'afsona') { assert.equal(await p.locator('#afOv').count(), 1, 'afsona: to\'liq ekran'); await p.click('#afOv [data-act=afx]'); await p.waitForTimeout(400); continue; }          // v54
    if (k === 'hafta') { assert.ok(st.story, 'hafta: hikoya'); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); continue; }
    assert.ok(st.sheet || st.full, k + ': funksiya ochildi ' + JSON.stringify(st)); if (k === 'ovoz' || k === 'rasm') assert.equal(st.kind, 'add');
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  }
  ok('har element bosilganda panel yopilib, o\'z funksiyasi ochiladi (' + d.keys.join(', ') + ')');
  /* 5. tanishtiruv, halqa, Profil bilan bitta ro'yxat */
  await openDr(p); await p.click('#ftDr [data-act=ftintro]'); await p.waitForTimeout(600); assert.equal(await p.evaluate(() => !document.getElementById('rzIntro').hidden), true, 'tanishtiruv ochildi'); await p.keyboard.press('Escape'); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  const ring1 = await p.evaluate(() => { const r = document.getElementById('kcalBtn').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }); assert.deepEqual(ring1, ring0, 'halqa o\'lchami o\'zgarmadi');
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500); assert.deepEqual(await p.locator('.sl-feats .sl-feat').evaluateAll((l) => l.map((e) => e.dataset.fk)), d.keys, 'Profil va panel — bitta ro\'yxat, bir xil tartib');
  assert.deepEqual(p.errs, []); await p.context().close(); ok('«Tanishtiruvni qayta ko\'rish» — tanishtiruv ochiladi; halqa o\'zgarmadi; Profil → Imkoniyatlar — shu ro\'yxat, shu tartib');
  /* 6. iPhone veb: ovoz server orqali — javob kelmasdan ham ko'rinadi; server o'chirgan bo'lsa — yo'q va bo'sh joy qolmaydi */
  p = await open(390, '/kalkifit', { ua: IPHONE, noWebSR: true, ovDelay: 1500 }); await openDr(p);
  assert.equal(await p.locator('#ftDr .ft-t[data-fk=ovoz]').count(), 1, 'iPhone: ovoz javobdan oldin ham ko\'rinadi'); await p.waitForTimeout(1800); assert.equal(await p.locator('#ftDr .ft-t[data-fk=ovoz]').count(), 1, 'server yoqilgan — qoladi'); assert.match(await p.locator('#ftDr .ft-t[data-fk=ovoz] small').innerText(), /15 ta qoldi/);
  await p.click('#ftDr .ft-t[data-fk=ovoz]'); await p.waitForTimeout(700); assert.equal(await p.evaluate(() => document.getElementById('rzSheet').getAttribute('data-kind')), 'add'); await p.context().close();
  p = await open(390, '/kalkifit', { ua: IPHONE, noWebSR: true, ovOff: true }); await p.waitForTimeout(300); await openDr(p); await p.waitForTimeout(600);
  const q = await p.evaluate(() => { const t = [...document.querySelectorAll('#ftDr .ft-t')], qa = document.querySelector('#ftDr .ft-qa').getBoundingClientRect(); return { keys: t.map((e) => e.dataset.fk), fill: Math.round(t[t.length - 1].getBoundingClientRect().right) >= Math.round(qa.right) - 1, eq: new Set(t.map((e) => Math.round(e.getBoundingClientRect().width))).size === 1, cnt: +document.querySelector('#ftBtn .n').textContent, all: document.querySelectorAll('#ftDr [data-act=feat]').length }; });
  assert.deepEqual(q.keys, ['rasm', 'menyu']); assert.ok(q.fill && q.eq, 'to\'rda bo\'sh joy yo\'q: ' + JSON.stringify(q)); await p.context().close();
  ok('iPhone veb (Web Speech yo\'q): ovoz server orqali — panelda doim ko\'rinadi, bosilsa ovoz oynasi; server ovozni o\'chirgan bo\'lsa karta yo\'q, qolganlari qatorni to\'ldiradi');
  /* 7. tillar va 360 px × 115% */
  for (const [url, t1, t2] of [['/ru/kalkifit', 'Возможности', 'Быстро добавить'], ['/kalkifit?lang=cyr', 'Имкониятлар', 'Тез қўшиш']]) { p = await open(390, url, { th: 'dark' }); assert.equal(await p.locator('#ftBtn b').innerText(), t1); await openDr(p); const tx = await p.locator('#ftDr').innerText(); assert.ok(tx.includes(t1) && tx.toLowerCase().includes(t2.toLowerCase()), url + ': ' + tx.slice(0, 80)); assert.deepEqual(p.errs, []); await p.context().close(); }
  p = await open(360, '/kalkifit'); await p.evaluate(() => document.documentElement.classList.add('fs-big')); await p.waitForTimeout(300);
  const t = await p.evaluate(() => { const b = document.getElementById('ftBtn'), dd = document.querySelector('.sl-hd2 .d'), br = b.getBoundingClientRect(); const kids = [...b.children].map((e) => e.getBoundingClientRect()); return { clip: kids.some((r) => r.right > br.right + 0.5 || r.left < br.left - 0.5) || b.querySelector('b').scrollWidth > b.querySelector('b').clientWidth + 1, inside: br.left >= 8 && br.right <= innerWidth - 8, below: br.top >= dd.getBoundingClientRect().bottom - 2 }; });
  assert.ok(!t.clip && t.inside && t.below, '360 px 115%: ' + JSON.stringify(t)); await openDr(p); assert.equal(await p.evaluate(() => { const d = document.getElementById('ftDr'); return d.scrollWidth <= d.clientWidth + 1; }), true, 'panelda gorizontal siljish yo\'q'); await p.context().close();
  ok('uz / cyr / ru (yorug\' va tungi); 360 px × 115%: tugma sana ostiga tushadi, yozuvi qisqarmaydi; panelda gorizontal siljish yo\'q');
  console.log('\n' + n + '/' + n + ' OK');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
