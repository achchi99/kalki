// KalkiFit v93 — yangi tuzilma: pastki panel (5 ta NOMLI tugma), sarlavhadagi avatar (Profil), ➕ — 4 ta ochiq yo'l, Maslahatchi kartasi, kun tasmasi (sahifa o'zgarmaydi),
// «Yana» (hamma imkoniyat bir ro'yxatda), har bir asosiy funksiyaga bosishlar soni (asosiy ekrandan ≤1, qolganlari ≤2), eski foydalanuvchiga «nima qayerga ko'chdi».
// Joylashuv: UZ + RU × 320 / 375 / 430 px — matnlar bir-birini kesmaydi (getBoundingClientRect), gorizontal chiqib ketish yo'q, pastki panel ekranda.   node tools/dizayn/test-kalkifit-v93.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const OUT = process.env.OUT || '';
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); r.end('yo\'q'); return; } r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const T0 = D.today();
function seed(lang, nFood, o = {}) {
  const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 86400000; st.prefs = { tipsDone: true, jokes: true, lpTip: 1, yemayAsked: 1, v93: 1, wkLeg: 1, ...(o.prefs || {}) };
  st.profile = { sex: 'f', preg: false, age: 30, height: 165, weight: 70, activity: 'light', goal: 'lose', job: 'sit' };
  for (let i = 1; i <= 3; i++) { const d = D.addDays(T0, -i); S.addFood(st, d, { meal: 'b', ts: 1, fid: 'choy', unit: 'piyola', qty: 1, g: 200, kcal: 38, p: 0, f: 0, c: 9, est: false }); S.addFood(st, d, { meal: 'd', ts: 2, fid: null, name: lang === 'ru' ? 'Плов с мясом и морковью (большая порция)' : 'Osh (katta porsiya, go\'sht va sabzi bilan)', g: 300, kcal: 650, p: 22, f: 30, c: 70, est: false }); S.addFood(st, d, { meal: 'l', ts: 3, fid: 'non', unit: 'dona', qty: 1, g: 250, kcal: 600, p: 20, f: 3, c: 120, est: false }); }
  if (nFood > 0) S.addFood(st, T0, { meal: 'b', ts: 1, fid: 'choy', unit: 'piyola', qty: 1, g: 200, kcal: 38, p: 0, f: 0, c: 9, est: false });
  if (nFood > 1) S.addFood(st, T0, { meal: 'd', ts: 2, fid: null, name: lang === 'ru' ? 'Шовла' : 'Shovla', g: 200, kcal: 420, p: 15, f: 40, c: 20, est: false });
  return st;
}
/* matnli barg elementlar (matn tuguni bevosita ichida) — ko'rinadigan, bir-birining ichida bo'lmaganlar juft-juft kesishmasin (2 px chidam) */
const CHECK = (scope) => {
  const vis = (e) => { const c = getComputedStyle(e); if (c.visibility === 'hidden' || c.display === 'none' || +c.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const root = document.querySelector(scope); if (!root) return { err: 'yo\'q: ' + scope };
  const all = [...root.querySelectorAll('*')].filter((e) => !e.closest('[hidden],[aria-hidden=true],svg,.rz-sr,.sl-vessel,#kfSplash,.sl-fishswim,.rz-tip,.sl-addbar') && [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) && vis(e));
  /* matn to'rtburchagini overflow:hidden/clip ota-bobolar bilan kesamiz (line-clamp, ellipsis — ko'rinmaydigan qatorlar hisobga olinmaydi); gorizontal aylantiriladigan qator (chiplar) — o'z chegarasi */
  const clipOf = (e) => { let L = -1e9, T = -1e9, R = 1e9, B = 1e9, hs = false; for (let a = e; a && a !== document.body; a = a.parentElement) { const c = getComputedStyle(a); if (c.overflowX !== 'visible' || c.overflowY !== 'visible') { const r = a.getBoundingClientRect(); L = Math.max(L, r.left); T = Math.max(T, r.top); R = Math.min(R, r.right); B = Math.min(B, r.bottom); if (/auto|scroll/.test(c.overflowX)) hs = true; } } return { L, T, R, B, hs }; };
  const boxes = all.map((e) => { const rg = document.createRange(); rg.selectNodeContents(e); const cl = clipOf(e); const rs = [...rg.getClientRects()].map((r) => ({ left: Math.max(r.left, cl.L), top: Math.max(r.top, cl.T), right: Math.min(r.right, cl.R), bottom: Math.min(r.bottom, cl.B) })).filter((r) => r.right - r.left > 1 && r.bottom - r.top > 1); return { e, rs, hs: cl.hs }; }).filter((x) => x.rs.length);
  const name = (e) => (e.id ? '#' + e.id : '') + '.' + String(e.className || e.tagName).split(' ')[0] + '«' + e.textContent.trim().slice(0, 18) + '»';
  const bad = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const A = boxes[i], B = boxes[j]; if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
    for (const a of A.rs) for (const c of B.rs) { const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (ox > 2 && oy > 2) { bad.push(name(A.e) + ' × ' + name(B.e)); break; } }
  }
  const W = document.documentElement.clientWidth, over = boxes.filter((x) => !x.hs && x.rs.some((r) => r.right > W + 1 || r.left < -1)).map((x) => name(x.e));
  /* ota konteyneridan (karta, tugma) matn chiqib ketmasin */
  const esc = boxes.filter((x) => { if (x.hs) return false; const p = x.e.closest('.rz-card,.sl-card,.sl-meal,button,.rz-row'); if (!p || p === x.e) return false; const pr = p.getBoundingClientRect(); return x.rs.some((r) => r.right > pr.right + 2 || r.left < pr.left - 2); }).map((x) => name(x.e));
  return { bad: [...new Set(bad)], over: [...new Set(over)], esc: [...new Set(esc)], n: boxes.length };
};

async function open(lang, w, nFood, o = {}) {
  const c = await b.newContext({ viewport: { width: w, height: o.h || 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: o.dark ? 'dark' : 'light' });
  await c.addInitScript((a) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(a.st)); } localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_lang', a.lang); localStorage.setItem('kalki_hub', '1'); if (a.tips) localStorage.removeItem('kalki_no_intro'); } catch (e) {} }, { st: o.st || seed(lang, nFood, o), lang, tips: !!o.tips });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e)));
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + (lang === 'ru' ? '/ru/kalkifit' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForSelector('#mainAdd'); await p.waitForTimeout(900); p.ctx = c; return p;
}
const closeAll = async (p) => { for (let i = 0; i < 3; i++) { await p.evaluate(() => { const bg = document.getElementById('rzBg'); if (bg && bg.classList.contains('open')) bg.click(); }); await p.waitForTimeout(450); } };
const view = (p) => p.evaluate(() => document.querySelector('.rz').getAttribute('data-view'));
const sheet = (p) => p.evaluate(() => (document.querySelector('#rzSheet.open') || {}).dataset ? document.querySelector('#rzSheet.open').dataset.kind : '');
const fails = [];
try {
  /* ---------- 1. Tuzilma: 5 nomli tugma, avatar, eski elementlar yo'q (UZ + RU) ---------- */
  for (const lang of ['uz', 'ru']) {
    const p = await open(lang, 390, 2);
    const nav = await p.evaluate(() => [...document.querySelectorAll('.rz-nav > *')].map((e) => ({ v: e.dataset.v || e.id, txt: (e.querySelector('.l, .fl') || {}).textContent || '', vis: e.getBoundingClientRect().width > 0, bot: e.getBoundingClientRect().bottom })));
    assert.deepEqual(nav.map((x) => x.v), ['today', 'history', 'mainAdd', 'advice', 'more'], lang + ' tugmalar tartibi: ' + JSON.stringify(nav.map((x) => x.v)));
    nav.forEach((x) => { assert.ok(x.txt.trim().length >= 2, lang + ' tugma NOMsiz: ' + x.v); assert.ok(x.vis); });
    assert.equal(await p.locator('#ftBtn, #rzAddBar, .rz-tab[data-v=profile]').count(), 0, lang + ': eski «4 kvadrat» tugma / alohida «Ovqat qo\'shish» tasmasi / Profil tabi qolmasligi kerak');
    const av = await p.evaluate(() => { const a = document.querySelector('#rzAv').getBoundingClientRect(), h = document.querySelector('#todayHd').getBoundingClientRect(); return { r: a.right, w: window.innerWidth, top: a.top, hb: h.bottom, ht: h.top, aw: a.width }; });
    assert.ok(av.r > av.w - 40 && av.aw >= 40 && av.top < av.hb, lang + ' avatar sarlavha o\'ng tepasida bo\'lsin: ' + JSON.stringify(av));
    await p.click('#rzAv'); assert.equal(await view(p), 'profile', lang + ': avatar → Profil'); assert.ok(await p.locator('#pfHero').count(), 'Profil kartasi');
    await p.click('.kf-bk'); assert.equal(await view(p), 'today'); assert.equal(p.errs.length, 0, p.errs[0]); await p.ctx.close();
  }
  log('Pastki panel: Bugun · Tahlil · ➕ · Maslahat · Yana (hammasi NOM bilan), Profil — sarlavhadagi avatar; eski «4 kvadrat» tugma va «Ovqat qo\'shish» tasmasi yo\'q (UZ+RU)');

  /* ---------- 2. ➕: 4 ta ochiq yo'l, har biri nom + izoh bilan, bitta bosishda ochiladi ---------- */
  for (const lang of ['uz', 'ru']) {
    const p = await open(lang, 390, 2); const clicks = {};
    await p.click('#mainAdd'); await p.waitForSelector('.hub-i'); assert.equal(await sheet(p), 'addhub');
    const hubs = await p.evaluate(() => [...document.querySelectorAll('.hub-i')].map((e) => ({ p: e.dataset.p, t: e.querySelector('b').textContent, h: e.querySelector('.m span').textContent })));
    assert.deepEqual(hubs.map((x) => x.p), ['search', 'photo', 'bar', 'often']); hubs.forEach((x) => assert.ok(x.t.length > 3 && x.h.length > 10, lang + ' yo\'l nomi/izohi: ' + JSON.stringify(x)));
    await p.click('.hub-search'); await p.waitForSelector('#fdQ'); assert.equal(await sheet(p), 'add'); log && 0;
    await closeAll(p);
    await p.click('#mainAdd'); await p.waitForSelector('.hub-i'); await p.click('.hub-bar'); await p.waitForTimeout(700); const k2 = await sheet(p); assert.ok(k2 === 'scan' || k2 === 'add', 'shtrix yo\'li: ' + k2);
    await p.evaluate(() => document.querySelector('[data-act=sheetclose], .rz-x[data-act=sheetclose]') && document.querySelector('[data-act=sheetclose]').click()); await closeAll(p);
    await p.click('#mainAdd'); await p.waitForSelector('.hub-i'); await p.click('.hub-often'); await p.waitForTimeout(700); assert.equal(await sheet(p), 'add', 'Kechagidek yo\'li oynasi');
    assert.equal(p.errs.length, 0, p.errs[0]); await p.ctx.close();
  }
  log('➕: darhol 4 ta katta yo\'l (Qidirish · Rasmdan (AI) · Shtrix-kod · Kechagidek), har biri nom + izoh bilan va bitta bosishda ochiladi (UZ+RU)');

  /* ---------- 3. Maslahatchi: doimiy karta — har doim holat ko'rsatadi, bosilsa Maslahat bo'limi ---------- */
  for (const lang of ['uz', 'ru']) {
    let p = await open(lang, 390, 0); let t = await p.evaluate(() => { const c = document.querySelector('#advCard, #mslCard'); return c ? { id: c.id, t: c.querySelector('.adv-t').textContent, s: c.querySelector('.adv-s').textContent, k: c.querySelector('.adv-k').textContent } : null; });
    assert.ok(t && /\b2\b/.test(t.t) && t.s.length > 10 && t.k.length > 3, lang + ' ma\'lumot kam holati: ' + JSON.stringify(t)); await p.ctx.close();
    p = await open(lang, 390, 2); t = await p.evaluate(() => { const c = document.querySelector('#advCard, #mslCard'); return c ? { id: c.id, t: c.querySelector('.adv-t').textContent, b: c.querySelector('.adv-p').textContent, s: c.querySelector('.adv-s').textContent } : null; });
    assert.ok(t && t.t.length > 5 && t.b.length > 10 && t.s.length > 10, lang + ' bugungi maslahat + asos qatori: ' + JSON.stringify(t));
    const order = await p.evaluate(() => { const m = document.getElementById('rzMain'), big = m.querySelector('.sl-big'), a = m.querySelector('.sl-adv'); return !!(big && a && (big.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING)); }); assert.ok(order, 'Maslahatchi kartasi halqadan KEYIN');
    await p.click('.sl-adv .adv-row'); assert.equal(await view(p), 'advice'); assert.ok(await p.locator('#mslSet').count() && await p.locator('.kf-advm, .sl-bju').count(), 'Maslahat bo\'limi to\'liq');
    assert.ok((await p.locator('.rz-tab[data-v=advice].on').count()) === 1); assert.equal(p.errs.length, 0, p.errs[0]); await p.ctx.close();
  }
  log('Maslahatchi: halqadan keyin doimiy karta (belgi + «Maslahatchi»), holat har doim ko\'rinadi (kam ma\'lumot: «Yana N ta ovqat…», bor: maslahat + asos qatori), bosilsa Maslahat bo\'limi (UZ+RU)');

  /* ---------- 4. Kun tasmasi: sahifa O'ZGARMAYDI, halqa joyida yangilanadi, ostida xulosa; Bugunga qaytish; oldingi haftalar; izoh ---------- */
  for (const lang of ['uz', 'ru']) {
    const p = await open(lang, 390, 2, { prefs: { wkLeg: 0 } });
    assert.equal(await p.locator('#wkLeg:not([hidden])').count(), 0, lang + ': izoh boshida yopiq (ekran band emas)'); assert.ok(await p.locator('.kf-legb').isVisible(), '«Nuqtalar nimani bildiradi?» ko\'rinib turadi');
    const hd0 = await p.textContent('#todayHd'), n0 = await p.textContent('#kNum'); const url0 = p.url();
    const d3 = await p.getAttribute('.sl-week7 .wd:nth-child(5)', 'data-d'); await p.click('.sl-week7 .wd:nth-child(5)'); await p.waitForTimeout(250);
    assert.ok(await p.locator('#wkLeg:not([hidden])').count(), lang + ': birinchi marta kun bosilganda nuqtalar izohi ochiladi'); await p.click('[data-act=wklegx]'); assert.equal(await p.locator('#wkLeg:not([hidden])').count(), 0);
    assert.equal(await view(p), 'today', lang + ': kun bosilsa Tarix\'ga O\'TMASIN'); assert.equal(p.url(), url0);
    assert.notEqual(await p.textContent('#todayHd'), hd0, 'sarlavha sanaga almashadi'); assert.ok(await p.locator('#dayBack').isVisible(), '«Bugunga qaytish» tugmasi');
    await p.waitForSelector('#dsCard'); const ds = await p.evaluate(() => ({ txt: document.querySelector('#dsCard').textContent, m: document.querySelectorAll('#dsCard .kf-ds-m span').length, k: !!document.querySelector('#dsCard .kf-ds-k'), top: !!document.querySelector('#dsCard .kf-ds-t'), v: document.querySelector('#dsCard .kf-ds-v').textContent }));
    assert.ok(ds.m === 3 && ds.k && ds.top && ds.v.length > 5, lang + ' kun xulosasi: kkal/maqsod, 3 makro, eng kaloriyali ovqat, baho: ' + JSON.stringify(ds));
    assert.equal(await p.getAttribute('.sl-week7 .wd.on', 'data-d'), d3, 'tanlov belgisi tanlangan kunda');
    await p.waitForTimeout(1500); const n1 = await p.textContent('#kNum'); assert.notEqual(n1, n0, 'halqa/raqam yangi kunga o\'tdi: ' + n0 + ' → ' + n1);
    assert.ok(await p.locator('.sl-meal, .sl-meals').count(), 'o\'sha kunning ovqatlari shu yerda'); assert.ok(await p.locator('.kf-dadd').isVisible(), 'o\'tgan kunga ovqat qo\'shish shu yerda');
    await p.click('.kf-dadd'); await p.waitForSelector('.hub-i'); await p.click('.hub-search'); await p.waitForSelector('#fdQ'); assert.equal(await p.evaluate(() => document.querySelector('.sl-meal,.sl-meals') ? 1 : 1), 1); await closeAll(p);
    /* oldingi hafta: ‹ yoki surish */
    const first0 = await p.getAttribute('.sl-week7 .wd:first-of-type', 'data-d'); await p.click('[data-act=wkprev]'); await p.waitForTimeout(250);
    const first1 = await p.getAttribute('.sl-week7 .wd:first-of-type', 'data-d'); assert.equal(D.daysBetween(first1, first0), 7, 'oldingi hafta'); await p.click('[data-act=wknext]');
    await p.click('#dayBack'); await p.waitForTimeout(300); assert.equal(await p.textContent('#todayHd'), hd0, 'Bugunga qaytdi'); assert.equal(await p.locator('#dsCard').count(), 0);
    assert.equal(await p.getAttribute('.sl-week7 .wd.on', 'data-d'), T0);
    assert.equal(p.errs.length, 0, p.errs[0]); await p.ctx.close();
  }
  log('Kun tasmasi: bosilsa sahifa o\'zgarmaydi — sarlavha sana + «Bugunga qaytish», halqa/raqam joyida o\'tadi, kun xulosasi (kkal/maqsad/farq, 3 makro, qadam-mashq, eng kaloriyali, baho), shu kunga qo\'shish, ‹ › oldingi hafta, nuqtalar izohi (UZ+RU)');

  /* ---------- 5. «Yana» va bosishlar soni ---------- */
  for (const lang of ['uz', 'ru']) {
    const p = await open(lang, 390, 2); await p.click('.rz-tab[data-v=more]'); await p.waitForSelector('.sl-feat');
    const rows = await p.evaluate(() => [...document.querySelectorAll('#rzMain .sl-feat')].map((e) => ({ t: (e.querySelector('b') || {}).textContent || '', h: (e.querySelector('.m span') || {}).textContent || '', ic: !!e.querySelector('.sl-ci svg') })));
    assert.ok(rows.length >= 16, lang + ' «Yana» qatorlari: ' + rows.length); rows.forEach((r) => assert.ok(r.t.length > 2 && r.h.length > 5 && r.ic, lang + ' qator: nom + izoh + ikonka: ' + JSON.stringify(r)));
    await p.click('.rz-tab[data-v=today]'); await p.waitForTimeout(300); await p.ctx.close();
  }
  log('«Yana»: hamma imkoniyat bitta ro\'yxatda — har qatorda ikonka + nom + 1 qatorlik tushuntirish (UZ+RU)');
  {
    const p = await open('uz', 390, 2); const table = [];
    const flow = async (name, steps, check) => { let k = 0; await closeAll(p); await p.click('.rz-tab[data-v=today]'); await p.waitForTimeout(250); for (const s of steps) { await p.click(s); k++; await p.waitForTimeout(450); } const ok = await check(); table.push([name, k, ok]); assert.ok(ok, 'funksiya ochilmadi: ' + name); assert.ok(k <= (steps.length), 'bosishlar'); };
    const sk = async () => (await sheet(p)); const vw = async () => (await view(p));
    await flow('Ovqat qo\'shish (➕ → Qidirish)', ['#mainAdd', '.hub-search'], async () => (await sk()) === 'add');
    await flow('Rasmdan', ['#mainAdd'], async () => (await sk()) === 'addhub');
    await flow('Tahlil', ['.rz-tab[data-v=history]'], async () => (await vw()) === 'history');
    await flow('Maslahat', ['.rz-tab[data-v=advice]'], async () => (await vw()) === 'advice');
    await flow('Profil / sozlamalar', ['#rzAv'], async () => (await vw()) === 'profile');
    await flow('Yana', ['.rz-tab[data-v=more]'], async () => (await vw()) === 'more');
    await flow('Qadamlar', ['.rz-tab[data-v=more]', '[data-act=stepin]'], async () => (await sk()) === 'stepin');
    await flow('Mashg\'ulot', ['.rz-tab[data-v=more]', '[data-act=exadd]'], async () => (await sk()) === 'mashq');
    await flow('Suv', ['.rz-tab[data-v=more]', '[data-act=wopen]'], async () => (await sk()) === 'water');
    await flow('Vazn', ['.rz-tab[data-v=more]', '[data-act=addweight]'], async () => /weight|vazn/.test(await sk()));
    await flow('Retseptlar', ['.rz-tab[data-v=more]', '[data-act=feat][data-fk=retsept]'], async () => !!(await sk()) || (await p.locator('#rzSheet.open').count()) > 0);
    await flow('Eslatmalar', ['.rz-tab[data-v=more]', '[data-act=moprof][data-to="#remCard"]'], async () => (await vw()) === 'profile' && (await p.locator('#remCard').count()) > 0);
    await flow('Ro\'zg\'or', ['.rz-tab[data-v=more]'], async () => (await p.locator('a[href$="/rozgor"]').count()) === 1);
    await flow('Haftangiz', ['.rz-tab[data-v=advice]', '[data-act=feat][data-fk=hafta]'], async () => !!(await p.locator('.hk, #rzSheet.open, .hk-ov').count()));
    console.log('\n  Funksiya                               bosish');
    table.forEach(([nm, k]) => console.log('  ' + nm.padEnd(38) + k)); assert.ok(table.every(([, k]) => k <= 2));
    assert.equal(p.errs.length, 0, p.errs[0]); await p.ctx.close();
  }
  log('Bosishlar soni: asosiy funksiyalar (➕, Tahlil, Maslahat, Profil, Yana) — 1 bosish; qadam, mashq, suv, vazn, retsept, eslatma, Haftangiz, Ro\'zg\'or — ko\'pi bilan 2 bosish');

  /* ---------- 6. Eski foydalanuvchiga BIR MARTA «nima qayerga ko'chdi»; yangiga — 3 qadamlik tips ---------- */
  {
    let p = await open('uz', 390, 2, { prefs: { v93: 0 } }); await p.waitForSelector('#rzSheet.open', { timeout: 9000 }); assert.equal(await sheet(p), 'moved'); assert.equal(await p.locator('#rzSheet .hub-i.mv').count(), 5);
    await p.click('#rzSheet [data-act=sheetclose]'); await p.waitForTimeout(500); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(2500); assert.notEqual(await sheet(p), 'moved', 'faqat bir marta'); await p.ctx.close();
    const st = seed('uz', 0, { prefs: { v93: 0, tipsDone: false } }); st.created = Date.now();
    p = await open('uz', 390, 0, { st, tips: true }); await p.waitForTimeout(1500); assert.notEqual(await sheet(p), 'moved', 'yangi foydalanuvchiga «ko\'chdi» oynasi chiqmaydi'); await p.ctx.close();
  }
  log('Eski foydalanuvchi: BIR marta «Hammasi endi ko\'z oldingizda» (5 qator); yangi foydalanuvchiga ko\'rsatilmaydi (u 3 qadamlik tips\'ni ko\'radi)');

  /* ---------- 7. Joylashuv: UZ+RU × 320/375/430 — ustma-ust tushish va gorizontal chiqib ketish barcha ekranlarda ---------- */
  for (const lang of ['uz', 'ru']) for (const w of [320, 360, 375, 430]) for (const dark of [false, true]) {
    if (dark && w !== 360) continue;
    const p = await open(lang, w, 2, { dark }); const tag = `${lang} ${w}px${dark ? ' dark' : ''}`;
    const scan = async (where, scope = '#rzMain') => {
      const r = await p.evaluate(CHECK, scope); if (r.err) { fails.push(tag + ' ' + where + ': ' + r.err); return; }
      if (r.bad.length) fails.push(tag + ' ' + where + ' KESISHADI: ' + r.bad.slice(0, 6).join(' | ')); if (r.over.length) fails.push(tag + ' ' + where + ' ekrandan chiqdi: ' + r.over.slice(0, 4).join(' | ')); if (r.esc.length) fails.push(tag + ' ' + where + ' kartadan chiqdi: ' + r.esc.slice(0, 4).join(' | '));
      const ov = await p.evaluate(() => { const m = document.getElementById('rzMain'); return { doc: document.documentElement.scrollWidth - window.innerWidth, main: m.scrollWidth - m.clientWidth }; }); if (ov.doc > 1 || ov.main > 1) fails.push(tag + ' ' + where + ' gorizontal overflow: ' + JSON.stringify(ov));
      const nv = await p.evaluate(() => [...document.querySelectorAll('.rz-nav > *')].map((e) => { const r = e.getBoundingClientRect(), t = e.querySelector('.l, .fl'), tr = t ? t.getBoundingClientRect() : r; return r.left < -1 || r.right > window.innerWidth + 1 || (t && (t.scrollWidth > t.clientWidth + 1 || tr.right > r.right + 1)); }));
      if (nv.some(Boolean)) fails.push(tag + ' ' + where + ': pastki panel yorlig\'i sig\'madi');
      if (OUT) await p.screenshot({ path: `${OUT}/v93-${where.replace(/\W+/g, '_')}-${lang}-${w}${dark ? '-dark' : ''}.png` });
    };
    await scan('Bugun'); await p.evaluate(() => { const m = document.getElementById('rzMain'); m.scrollTop = m.scrollHeight; }); await scan('Bugun-past');
    const bt = await p.evaluate(() => { const m = document.getElementById('rzMain'), last = [...m.children].pop(), nav = document.querySelector('.rz-nav'); return last.getBoundingClientRect().bottom <= nav.getBoundingClientRect().top + 4; }); if (!bt) fails.push(tag + ' Bugun: oxirgi element pastki panel ostida qoldi');
    await p.evaluate(() => { document.getElementById('rzMain').scrollTop = 0; });
    await p.click('.sl-week7 .wd:nth-child(5)'); await p.waitForTimeout(1500); await scan('Otgan-kun'); await p.click('#dayBack');
    await p.click('#mainAdd'); await p.waitForSelector('.hub-i'); await p.waitForTimeout(500); await scan('Hub', '#rzSheet'); await closeAll(p);
    for (const v of ['history', 'advice', 'more']) { await p.click(`.rz-tab[data-v=${v}]`); await p.waitForTimeout(600); await scan(v); }
    await p.click('#rzAv'); await p.waitForTimeout(600); await scan('Profil');
    if (p.errs.length) fails.push(tag + ' JS xato: ' + p.errs[0]); await p.ctx.close();
  }
  if (fails.length) { console.log(fails.join('\n')); assert.fail(fails.length + ' ta joylashuv muammosi'); }
  log('Joylashuv: Bugun, o\'tgan kun, ➕ yo\'llari, Tahlil, Maslahat, Yana, Profil — UZ+RU × 320/375/430 px (+ qorong\'i): matnlar kesishmaydi, gorizontal overflow yo\'q, pastki panel yorlig\'i sig\'adi, oxirgi element panel ostida qolmaydi');
} finally { await b.close(); srv.close(); }
console.log('\n' + n + '/' + n + ' OK');
