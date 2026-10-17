// Oila byudjeti kalkulyatori — SODDALIK testi (390px, telefon): 1 daqiqada oylik reja.
//   - boshlang'ich holat: maydonlar bo'sh (soxta raqam yo'q), natija yashirin; birinchi ekranda h1 + va'da + birinchi maydon;
//   - daromad 8 000 000 → kredit 1 500 000 → ijara 2 000 000 → natija: 3 harakat (≤5), natija raqami birinchi ekran + bitta scroll ichida;
//   - asosiy natijada "ball/salomatlik/koeffitsient/indeks" so'zlari yo'q, "reja" izohi bor; so'm yoziladi, inputmode=numeric;
//   - minus chiqsa yashirilmaydi (sokin ogohlantirish + eng katta to'lov); oziq-ovqat taxmini "taxminiy" belgisi bilan;
//   - eski saqlangan ma'lumot (kalki_byudjet v1), eski ulashish havolasi va crosslink havolasi ko'chiriladi; yangi ulashish havolasi tiklanadi;
//   - UZ / RU / ЎЗ.   node tools/dizayn/test-sodda.mjs [https://host]
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
let BASE = process.argv[2], srv;
if (!BASE) { srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; if (p === '/ru/') p = '/ru/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  await new Promise((ok) => srv.listen(0, ok)); BASE = 'http://localhost:' + srv.address().port; }
const b = track(await chromium.launch()); let n = 0; const log = (m) => { n++; console.log('OK  ', m); };
const nb = (s) => String(s).replace(/ /g, ' ');
const URL_UZ = '/oila-byudjet-kalkulyator'; const SHOT = process.env.SHOT;
async function open(url, { pre, w = 390 } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: 844 }, isMobile: w < 500, hasTouch: w < 500, serviceWorkers: 'block' });
  if (pre) await c.addInitScript(pre.fn, pre.arg);
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|googlesyndication|adsbygoog/.test(m.text())) p.errs.push(m.text()); });
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(500); return p;
}
try {
  /* ---- 1. UZ: boshlang'ich holat + 3 harakat ---- */
  const p = await open(URL_UZ);
  const s0 = await p.evaluate(() => ({ vals: [...document.querySelectorAll('main input[type=text]')].filter((i) => i.value).map((i) => i.id + '=' + i.value), recv: getComputedStyle(document.getElementById('receipt')).display,
    h1: (() => { const r = document.querySelector('h1').getBoundingClientRect(); return [r.top >= 0, r.bottom <= innerHeight]; })(), sub: document.querySelector('header .sub').textContent, inc: (() => { const r = document.getElementById('inc').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; })(),
    ph: document.getElementById('inc').placeholder, mode: [...document.querySelectorAll('main input[type=text]')].every((i) => i.getAttribute('inputmode') === 'numeric' || i.getAttribute('inputmode') === 'decimal'), steps: document.querySelectorAll('.qadamlar li').length, abCard: getComputedStyle(document.querySelector('.ab-card')).display }));
  assert.deepEqual(s0.vals, [], 'maydonlar oldindan soxta raqam bilan to\'ldirilmasin: ' + s0.vals.join(','));
  assert.equal(s0.recv, 'none', 'natija daromadsiz yashirin bo\'lsin'); assert.equal(s0.sub, "Oylik daromad va majburiy to'lovlarni kiriting — oy oxirida qancha qolishini ko'rasiz.");
  assert.ok(s0.inc.bottom <= 844, 'birinchi maydon birinchi ekranda emas (' + s0.inc.bottom + 'px)'); assert.match(s0.ph, /^masalan, 8 000 000$/); assert.ok(s0.mode, 'inputmode'); assert.equal(s0.steps, 3);
  log('1a. UZ boshlang\'ich: maydonlar bo\'sh, natija yashirin, va\'da jumlasi, birinchi maydon ' + s0.inc.bottom + 'px da (birinchi ekran ichida), 3 qadam');
  if (SHOT) await p.screenshot({ path: SHOT + '/sodda_1ekran_uz.png' });
  let actions = 0;
  await p.fill('#inc', '8000000'); actions++; await p.fill('#mCredit', '1500000'); actions++; await p.fill('#mRent', '2000000'); actions++; await p.waitForTimeout(250);
  const r1 = await p.evaluate(() => { const num = document.getElementById('mainNum'), r = num.getBoundingClientRect(); const box = document.getElementById('resBox'); const clone = box.cloneNode(true); clone.querySelector('details')?.remove();
    return { text: num.textContent, y: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), lbl: document.getElementById('bjLbl').textContent, note: document.querySelector('.bj-note').textContent, main: clone.textContent, inputs: document.getElementById('inc').value, shown: getComputedStyle(document.getElementById('receipt')).display, tag: document.querySelector('#receipt .receipt-tag').textContent }; });
  assert.equal(nb(r1.text), "4 500 000 so'm"); assert.equal(r1.lbl, "Majburiy to'lovlardan keyin qoladi", 'kundalik xarajatsiz holat sarlavhasi'); assert.equal(r1.note, "Bu siz kiritgan raqamlar asosidagi reja, haqiqiy sarfingiz emas."); assert.equal(r1.inputs, '8 000 000');
  assert.ok(actions <= 5, 'harakatlar soni ' + actions); assert.ok(r1.bottom <= 844 * 2, 'natija raqami birinchi ekran + bitta scroll ichida emas: ' + r1.bottom + 'px'); assert.notEqual(r1.shown, 'none');
  assert.ok(!/ball|salomatlik|koeffitsient|indeks|optimal|индекс|баллов|здоровь/i.test(r1.main), 'asosiy natijada taqiqlangan so\'z: ' + (r1.main.match(/ball|salomatlik|koeffitsient|indeks|optimal/i) || [''])[0]); assert.ok(/reja/i.test(r1.main));
  log(`1b. 8 000 000 − kredit 1 500 000 − ijara 2 000 000 = ${nb(r1.text)}: ${actions} harakat, natija raqami sahifa ${r1.bottom}px da (≤ ${844 * 2}), asosiy natijada "ball/salomatlik" yo'q, "reja" izohi bor`);
  // ---- 1b'. A holat: kundalik xarajat kiritilmagan ----
  const a1 = await p.evaluate(() => ({ rest: document.getElementById('bjRest').textContent, restVis: !document.getElementById('bjRest').hidden && getComputedStyle(document.getElementById('bjRest')).display !== 'none', pctHidden: document.getElementById('bjPct').hidden, btn: document.getElementById('btnDaily').textContent, btnVis: !document.getElementById('btnDaily').hidden && getComputedStyle(document.getElementById('btnDaily')).display !== 'none', all: document.getElementById('resBox').innerText.replace(/\s+/g, ' ') }));
  assert.equal(a1.rest, 'Oziq-ovqat, transport va boshqa kundalik xarajatlar shu puldan qilinadi.'); assert.ok(a1.restVis); assert.ok(a1.pctHidden, 'A holatda foiz jumlasi chiqmasin'); assert.ok(!/ortib qolishi/.test(a1.all), '"ortib qolishi mumkin" A holatda chiqmasin'); assert.equal(a1.btn, "Kundalik xarajatlarni qo'shish"); assert.ok(a1.btnVis);
  await p.click('#btnDaily'); await p.waitForTimeout(400); const fb = await p.evaluate(() => ({ open: document.getElementById('dMore').open, active: document.activeElement && document.activeElement.id })); assert.equal(fb.open, true); assert.equal(fb.active, 'food');
  log('1b-A. Kundalik xarajat YO\'Q: "Majburiy to\'lovlardan keyin qoladi 4 500 000 so\'m" + "Oziq-ovqat, transport… shu puldan qilinadi." + tugma; foiz jumlasi yo\'q; tugma "Boshqa xarajatlar"ni ochib oziq-ovqatga fokus beradi');
  if (SHOT) { await p.evaluate(() => { document.getElementById('dMore').open = false; }); await p.locator('#receipt').scrollIntoViewIfNeeded(); await p.waitForTimeout(150); await p.screenshot({ path: SHOT + '/sodda_A_uz.png' }); }
  // ---- 1b''. B holat: kamida bitta kundalik xarajat ----
  await p.evaluate(() => { document.getElementById('dMore').open = true; }); await p.fill('#oTrans', '600000'); await p.waitForTimeout(250);
  const b1 = await p.evaluate(() => ({ lbl: document.getElementById('bjLbl').textContent, num: document.getElementById('mainNum').textContent, pct: document.getElementById('bjPct').textContent, pctHidden: document.getElementById('bjPct').hidden, restHidden: document.getElementById('bjRest').hidden, btnHidden: document.getElementById('btnDaily').hidden }));
  assert.equal(b1.lbl, "Reja bo'yicha oy oxirida qolishi mumkin"); assert.equal(nb(b1.num), "3 900 000 so'm"); assert.match(b1.pct, /ortib qolishi mumkin/); assert.equal(b1.pctHidden, false); assert.equal(b1.restHidden, true); assert.equal(b1.btnHidden, true);
  const miss = await p.evaluate(() => ({ vis: !document.getElementById('bjMiss').hidden && getComputedStyle(document.getElementById('bjMiss')).display !== 'none', txt: document.getElementById('bjMiss').innerText.replace(/\s+/g, ' ') }));
  assert.ok(miss.vis, 'B holat, oziq-ovqat bo\'sh: izoh chiqmadi'); assert.equal(miss.txt, "Oziq-ovqat hali kiritilmagan. Qo'shish");
  await p.click('#btnFoodAdd'); await p.waitForTimeout(300); assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.id), 'food', '"Qo\'shish" oziq-ovqatga fokus bermadi');
  await p.fill('#food', '3000000'); await p.waitForTimeout(200); assert.equal(await p.evaluate(() => document.getElementById('bjMiss').hidden), true, 'oziq-ovqat kiritilgach izoh yo\'qolsin'); await p.fill('#food', ''); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => document.getElementById('bjMiss').hidden), false); assert.equal(await p.evaluate(() => document.getElementById('bjLbl').textContent), "Reja bo'yicha oy oxirida qolishi mumkin");
  log('1b-B. Kundalik xarajat BOR (transport 600 000): "Reja bo\'yicha oy oxirida qolishi mumkin 3 900 000 so\'m" + "Rejaga ko\'ra daromadning 49% i ortib qolishi mumkin."; tugma va "shu puldan" izohi yo\'q');
  if (SHOT) { await p.evaluate(() => { document.getElementById('dMore').open = false; }); await p.locator('#receipt').scrollIntoViewIfNeeded(); await p.waitForTimeout(150); await p.screenshot({ path: SHOT + '/sodda_B_uz.png' }); }
  await p.evaluate(() => { document.getElementById('dMore').open = true; }); await p.fill('#oTrans', ''); await p.waitForTimeout(150);
  if (SHOT) { await p.locator('#receipt').scrollIntoViewIfNeeded(); await p.waitForTimeout(150); await p.screenshot({ path: SHOT + '/sodda_natija_uz.png' }); }
  // batafsil: ochiladigan, chiziqli ulush
  const d1 = await p.evaluate(() => { const det = document.getElementById('bjDet'); const open0 = det.open; det.open = true; return { open0, rows: det.querySelectorAll('.bj-row').length, bars: det.querySelectorAll('.bar i').length, txt: det.textContent.replace(/\s+/g, ' ') }; });
  assert.equal(d1.open0, false); assert.equal(d1.rows, 2); assert.equal(d1.bars, 2); assert.match(nb(d1.txt), /Kredit va qarz to'lovlari\s*1 500 000 so'm\s*daromadning 19% i/); log('1c. "Batafsil ko\'rish" yopiq; ochilsa: har xarajat qatori, ulushi va chiziqli diagramma');
  // ---- 2. minus: yashirilmaydi ----
  await p.fill('#inc', '3000000'); await p.waitForTimeout(200);
  const m1 = await p.evaluate(() => ({ num: document.getElementById('mainNum').textContent, lbl: document.getElementById('bjLbl').textContent, tip: document.getElementById('bjTip').textContent, tipHidden: document.getElementById('bjTip').hidden, neg: document.getElementById('mainNum').classList.contains('neg'), color: getComputedStyle(document.getElementById('mainNum')).color, pct: document.getElementById('bjPct').hidden }));
  assert.equal(nb(m1.num), "500 000 so'm"); assert.equal(m1.lbl, "Rejaga ko'ra oyiga yetishmaydi"); assert.equal(m1.tipHidden, false); assert.match(nb(m1.tip), /Eng katta to'lov: Uy ijarasi — 2 000 000 so'm \(daromadning 67% i\)/); assert.equal(m1.neg, true);
  const [rr, gg] = m1.color.match(/\d+/g).map(Number); assert.ok(!(rr > 180 && gg < 80), 'minus qizil bo\'lmasin (sokin rang): ' + m1.color);
  log('2.  Minus yashirilmaydi: "Rejaga ko\'ra oyiga yetishmaydi 500 000 so\'m" + "Eng katta to\'lov: Uy ijarasi…", sokin (amber) rang ' + m1.color);
  // ---- 3. oziq-ovqat taxmini ----
  await p.fill('#inc', '8000000'); await p.evaluate(() => { document.getElementById('dMore').open = true; });
  const h0 = await p.evaluate(() => document.getElementById('foodBox').hidden); assert.equal(h0, true, 'oila tarkibi faqat tugma bosilganda so\'ralsin');
  await p.click('#btnFood'); await p.fill('#adults', '2'); await p.fill('#kids', '2'); await p.click('#btnFoodGo'); await p.waitForTimeout(250);
  const f1 = await p.evaluate(() => ({ food: document.getElementById('food').value, badge: !document.getElementById('estBadge').hidden, est: !document.getElementById('bjEst').hidden, estTxt: document.getElementById('bjEstTxt').textContent }));
  assert.ok(f1.badge && f1.est && /taxminiy/.test(f1.estTxt) && /\d/.test(f1.food)); await p.fill('#food', '2500000'); await p.waitForTimeout(150);
  const f2 = await p.evaluate(() => ({ badge: !document.getElementById('estBadge').hidden, est: !document.getElementById('bjEst').hidden })); assert.ok(!f2.badge && !f2.est);
  log('3.  Oziq-ovqat: oila tarkibi faqat "taxminan hisoblab ber" bosilganda; taxmin "taxminiy" belgisi bilan ' + f1.food + ' so\'m; qo\'lda o\'zgartirilsa belgi yo\'qoladi');
  assert.deepEqual(p.errs, [], 'konsol xatolari: ' + p.errs.join(' | ')); await p.context().close();
  /* ---- 4. moslik: eski saqlangan ma'lumot (v1) ---- */
  const OLD = { m: { '2026-08': { income: 8000000, spend: 4200000, credit: 800000, save: 3000000, score: 71 } }, last: { f: { incH: '5 000 000', incW: '3 000 000', incX: '500 000', adults: '2', kidsG: '1', kidsM: '1', kidsU: '0', costG: '400 000', costM: '200 000', costU: '1 500 000', komm: '650 000', rent: '1 200 000', trans: '600 000', conn: '200 000', health: '300 000', fun: '500 000', other: '300 000', saveMonth: '0', savePool: '12 000 000' },
    loc: 'tosh', src: 2, credits: [{ n: 'Ipoteka', pay: '1 800 000', mon: '120', rate: '' }, { n: 'Avto', pay: '700 000', mon: '24', rate: '' }], touched: { food: true, edu: true, fixed: true, health: false, fun: false, saveMonth: false, savePool: true, src: true } } };
  const q = await open(URL_UZ, { pre: { fn: (o) => { try { if (!localStorage.getItem('kalki_byudjet')) localStorage.setItem('kalki_byudjet', JSON.stringify(o)); } catch (e) {} }, arg: OLD } });
  const v1 = await q.evaluate(() => ({ f: Object.fromEntries([...document.querySelectorAll('main input[type=text]')].map((i) => [i.id, i.value])), num: document.getElementById('mainNum').textContent, loc: document.querySelector('[data-loc].on')?.getAttribute('data-loc'), est: !document.getElementById('estBadge').hidden,
    hist: document.getElementById('detBody').textContent.replace(/\s+/g, ' '), ls: JSON.parse(localStorage.getItem('kalki_byudjet')) }));
  assert.equal(v1.f.inc, '8 000 000'); assert.equal(v1.f.incX, '500 000'); assert.equal(v1.f.mCredit, '2 500 000'); assert.equal(v1.f.mKomm, '650 000'); assert.equal(v1.f.mRent, '1 200 000'); assert.equal(v1.f.mEdu, '600 000');
  assert.equal(v1.f.oTrans, '600 000'); assert.equal(v1.f.oOther, '300 000'); assert.equal(v1.f.savePool, '12 000 000'); assert.equal(v1.f.oHealth, '', 'tegilmagan (taxminiy) sog\'liq xarajati soxta haqiqat sifatida ko\'chirilmasin'); assert.equal(v1.f.oFun, '');
  assert.ok(v1.est && /^\d/.test(v1.f.food), 'oziq-ovqat taxmin sifatida qayta hisoblanishi kerak'); assert.equal(v1.loc, 'tosh'); assert.match(nb(v1.hist), /avgust 3 000 000 so'm|2026-yil avgust: qolishi 3 000 000 so'm/); assert.ok(v1.ls.m['2026-08'] && v1.ls.m['2026-08'].save === 3000000, 'eski oylik tarix yo\'qolmasin'); assert.equal(v1.ls.last.v, 2);
  log('4a. Eski saqlangan ma\'lumot (v1): daromad 5M+3M → 8 000 000, kreditlar → 2 500 000, ijara/kommunal/ta\'lim/transport/boshqa ko\'chdi, oziq-ovqat tarkibdan taxmin, tegilmagan standart qiymatlar ko\'chirilmadi, oylik tarix saqlandi, yangi shaklga o\'tdi'); await q.context().close();
  // eski ulashish havolasi + crosslink + yangi havola
  const enc = (o) => Buffer.from(JSON.stringify(o), 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const legacy = enc({ i: { incH: '5 000 000', incW: '3 000 000', incX: '0', adults: '2', kidsG: '1', kidsM: '0', kidsU: '0', costG: '400 000', costM: '200 000', costU: '1 500 000', komm: '500 000', rent: '0', trans: '600 000', conn: '200 000', health: '300 000', fun: '500 000', other: '300 000', saveMonth: '0', savePool: '0' }, b: ['button[data-loc="tosh"]'], c: {} });
  const l1 = await open(URL_UZ + '?p=' + legacy); const lv = await l1.evaluate(() => ({ inc: document.getElementById('inc').value, edu: document.getElementById('mEdu').value, komm: document.getElementById('mKomm').value, health: document.getElementById('oHealth').value, num: document.getElementById('mainNum').textContent, loc: document.querySelector('[data-loc].on')?.getAttribute('data-loc') }));
  assert.equal(lv.inc, '8 000 000'); assert.equal(lv.edu, '400 000'); assert.equal(lv.komm, '500 000'); assert.equal(lv.health, '300 000'); assert.equal(lv.loc, 'tosh'); assert.match(nb(lv.num), /\d/); log('4b. Eski ulashish havolasi (incH/incW/costG…, data-loc) ochiladi: daromad 8 000 000, ta\'lim 400 000, kommunal 500 000, joy Toshkent, natija chiqadi'); await l1.context().close();
  const x1 = await open(URL_UZ + '?p=' + enc({ i: { incX: '1500000' } }) + '&xfrom=ijara-shartnomasi-namunasi'); const xv = await x1.evaluate(() => ({ incX: document.getElementById('incX').value, open: document.getElementById('dMore').open, banner: !!document.getElementById('xlBanner') }));
  assert.equal(xv.incX, '1 500 000'); assert.equal(xv.open, true); log('4c. Crosslink havolasi (ijara daromadi → incX): maydon to\'ldiriladi, "Boshqa xarajatlar" bo\'limi ochiladi' + (xv.banner ? ', "manba" izohi chiqadi' : '')); await x1.context().close();
  const s1 = await open(URL_UZ); await s1.fill('#inc', '9000000'); await s1.fill('#mKomm', '700000'); await s1.waitForTimeout(150); const url = await s1.evaluate(() => window.__buildShareUrl());
  const s2 = await open(url.replace(/^https?:\/\/[^/]+/, '')); const sv = await s2.evaluate(() => ({ inc: document.getElementById('inc').value, komm: document.getElementById('mKomm').value, num: document.getElementById('mainNum').textContent })); assert.equal(sv.inc, '9 000 000'); assert.equal(sv.komm, '700 000'); assert.equal(nb(sv.num), "8 300 000 so'm"); log('4d. Yangi ulashish havolasi: daromad va to\'lovlar tiklanadi, natija 8 300 000'); await s1.context().close(); await s2.context().close();
  /* ---- 5. RU va ЎЗ ---- */
  const ru = await open('/ru' + URL_UZ); await ru.fill('#inc', '8000000'); await ru.fill('#mCredit', '1500000'); await ru.fill('#mRent', '2000000'); await ru.waitForTimeout(250);
  const rv = await ru.evaluate(() => ({ h1: document.querySelector('h1').textContent, sub: document.querySelector('header .sub').textContent, lbl: document.getElementById('bjLbl').textContent, num: document.getElementById('mainNum').textContent, note: document.querySelector('.bj-note').textContent, steps: document.querySelectorAll('.qadamlar li').length, ph: document.getElementById('inc').placeholder, lat: (document.querySelector('main').innerText.replace(/Kalki\.uz|PDF|Telegram/g, '').match(/[A-Za-z]{4,}/g) || []).join(',') }));
  assert.match(rv.h1, /семейного бюджета/); assert.equal(rv.sub, 'Введите доход за месяц и обязательные платежи — увидите, сколько останется к концу месяца.'); assert.equal(rv.lbl, 'После обязательных платежей остаётся'); assert.equal(nb(rv.num), '4 500 000 сум'); assert.match(rv.note, /план/); assert.equal(rv.steps, 3); assert.match(rv.ph, /^например, 8 000 000$/); assert.equal(rv.lat, '', 'RU da lotincha matn: ' + rv.lat);
  await ru.evaluate(() => { document.getElementById('dMore').open = true; }); await ru.fill('#oTrans', '600000'); await ru.waitForTimeout(250);
  const rb = await ru.evaluate(() => ({ lbl: document.getElementById('bjLbl').textContent, num: document.getElementById('mainNum').textContent, pct: document.getElementById('bjPct').textContent }));
  assert.equal(rb.lbl, 'По плану к концу месяца может остаться'); assert.equal(await ru.evaluate(() => document.getElementById('bjMiss').innerText.replace(/\s+/g, ' ')), 'Продукты ещё не введены. Добавить'); assert.equal(nb(rb.num), '3 900 000 сум'); assert.match(rb.pct, /По плану может остаться 49% дохода/);
  assert.deepEqual(ru.errs, []); log('5a. RU: va\'da, "По плану… может остаться 4 500 000 сум", план-изоҳ, 3 шага, placeholder; lotincha matn yo\'q'); await ru.context().close();
  const cy = await open(URL_UZ + '?lang=cyr'); await cy.fill('#inc', '8000000'); await cy.fill('#mCredit', '1500000'); await cy.fill('#mRent', '2000000'); await cy.waitForTimeout(500);
  const cv = await cy.evaluate(() => ({ h1: document.querySelector('h1').textContent, lbl: document.getElementById('bjLbl').textContent, num: document.getElementById('mainNum').textContent, lat: (document.querySelector('main').innerText.replace(/Kalki\.uz|PDF|Telegram/g, '').match(/[A-Za-z]{3,}/g) || []).join(',') }));
  assert.match(cv.h1, /Оилавий бюджет калькулятори/); assert.match(cv.lbl, /Мажбурий тўловлардан кейин қолади/); assert.equal(nb(cv.num), '4 500 000 сўм'); assert.equal(cv.lat, '', 'ЎЗ да лотин: ' + cv.lat); await cy.evaluate(() => { document.getElementById('dMore').open = true; }); await cy.fill('#oTrans', '600000'); await cy.waitForTimeout(500);
  const cb = await cy.evaluate(() => ({ lbl: document.getElementById('bjLbl').textContent, pct: document.getElementById('bjPct').textContent })); assert.match(cb.lbl, /Режа бўйича ой охирида қолиши мумкин/); assert.match(await cy.evaluate(() => document.getElementById('bjMiss').innerText), /Озиқ-овқат ҳали киритилмаган/); assert.match(cb.pct, /ортиб қолиши мумкин/);
  log('5b. ЎЗ (translit): "' + cv.lbl + ' ' + nb(cv.num) + '" / kundalik xarajat bilan: "' + cb.lbl + '"'); await cy.context().close();
} finally { await b.close(); if (srv) srv.close(); }
console.log(`\n${n} ta tekshiruv guruhi o'tdi`);
