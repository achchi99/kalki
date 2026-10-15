// "Naqd, nasiya yoki kredit" kalkulyatori: hisob moduli (assets/nasiya-hisob.js) + sahifa (UZ/RU/ЎЗ) + kredit-kalkulyator bilan mosligi.
// node tools/dizayn/test-nasiya.mjs [https://host]      (host berilmasa — lokal statik server)
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const K = require(path.join(ROOT, 'assets/nasiya-hisob.js'));
let ok = 0; const log = (m) => { ok++; console.log('OK  ', m); };
const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg}: ${a} != ${b} (±${eps})`);

/* ---- MUSTAQIL hisob: Excel RATE(nper, pmt, pv) mantig'i (Newton, MODULDAN FARQLI algoritm; yopiq formula) ---- */
function excelRate(nper, pmt, pv, guess = 0.1) {           // pv = qarz (musbat), pmt = oylik to'lov (musbat)
  let r = guess;
  for (let i = 0; i < 200; i++) {
    const f = pv - pmt * (1 - Math.pow(1 + r, -nper)) / r;
    const h = 1e-7, f2 = pv - pmt * (1 - Math.pow(1 + r + h, -nper)) / (r + h);
    const d = (f2 - f) / h; const nr = r - f / d; if (Math.abs(nr - r) < 1e-15) { r = nr; break; } r = nr > 0 ? nr : r / 2;
  }
  return r;
}
const pmtFormula = (P, i, n) => P * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);

/* ---- A) hisob moduli ---- */
{ // 1. etalon: 6 000 000, boshlang'ich 0, 12 × 650 000
  const n = K.nasiya({ price: 6e6, down: 0, n: 12, mode: 'pay', monthly: 650000 });
  const ref = excelRate(12, 650000, 6e6);
  near(n.r, ref, 1e-9, 'RATE(12;-650000;6000000)'); near(n.nominal, 12 * ref, 1e-8, 'nominal'); near(n.effective, Math.pow(1 + ref, 12) - 1, 1e-8, 'effektiv');
  assert.ok(n.r > 0.0428 && n.r < 0.0430 && n.nominal > 0.51 && n.nominal < 0.52, 'etalon: oylik ≈ 4,3%, nominal ≈ 51–52%');
  assert.equal(Math.round(n.total), 7800000); assert.equal(Math.round(n.over), 1800000); near(n.markupPct, 30, 1e-9, 'ustama 30%');
  log(`1. etalon 6 000 000 / 12×650 000: oylik r=${(n.r * 100).toFixed(4)}%, nominal ${(n.nominal * 100).toFixed(2)}%, effektiv ${(n.effective * 100).toFixed(2)}% (Excel RATE bilan ±1e-9)`); }
{ // 2. 0% nasiya (ustama 0) va oylik × oy = narx
  const a = K.nasiya({ price: 6e6, n: 12, mode: 'markup', markupPct: 0 }), b = K.nasiya({ price: 6e6, n: 12, mode: 'pay', monthly: 500000 });
  assert.equal(a.r, 0); assert.equal(b.r, 0); assert.equal(a.nominal, 0); assert.equal(a.effective, 0); assert.equal(Math.round(a.over), 0);
  a.rows.forEach((r) => near(r.interest, 0, 1e-9, 'foiz 0')); near(a.rows[11].balance, 0, 1e-9, 'qoldiq 0');
  log('2. 0% nasiya: haqiqiy stavka 0, ortiqcha to\'lov 0, jadvalda foiz 0'); }
{ // 3. boshlang'ich to'lovli nasiya (pay)
  const n = K.nasiya({ price: 6e6, down: 1e6, n: 10, mode: 'pay', monthly: 560000 });
  assert.equal(n.financed, 5e6); assert.equal(Math.round(n.total), 1e6 + 5.6e6); near(n.r, excelRate(10, 560000, 5e6), 1e-9, 'RATE(10;-560000;5000000)');
  near(n.rows.reduce((s, r) => s + r.principal, 0), 5e6, 1e-6, 'asosiy qarz yig\'indisi'); near(n.rows[9].balance, 0, 1e-6, 'qoldiq 0');
  log('3. boshlang\'ich to\'lovli nasiya (1 000 000): moliyalashtirilgan 5 000 000, RATE mos, jadval qarzni yopadi'); }
{ // 4. ustama rejimi + boshlang'ich to'lov
  const n = K.nasiya({ price: 6e6, down: 1e6, n: 12, mode: 'markup', markupPct: 30 });
  near(n.monthly, 5e6 * 1.3 / 12, 1e-6, 'oylik = financed×1,3/12'); assert.equal(Math.round(n.total), Math.round(1e6 + 6.5e6)); near(n.r, excelRate(12, n.monthly, 5e6), 1e-9, 'RATE');
  log('4. ustama 30% + boshlang\'ich 1 000 000: oylik = 5 000 000×1,3/12, RATE mos'); }
{ // 5. kredit annuitet: kredit-kalkulyator formulasi, nominal = yillik foiz
  const k = K.kredit({ price: 6e6, down: 0, n: 12, ratePct: 28, type: 'ann' });
  near(k.monthly, pmtFormula(6e6, 0.28 / 12, 12), 1e-6, 'annuitet'); near(k.total, 12 * pmtFormula(6e6, 0.28 / 12, 12), 1e-5, 'jami'); near(k.nominal, 0.28, 1e-9, 'nominal = 28%'); near(k.effective, Math.pow(1 + 0.28 / 12, 12) - 1, 1e-9, 'effektiv');
  near(k.rows[11].balance, 0, 1e-6, 'qoldiq 0'); log(`5. kredit annuitet 28%/12 oy: oylik ${Math.round(k.monthly)}, jami ${Math.round(k.total)}, nominal 28,00%`); }
{ // 6. kredit differensial
  const P = 6e6, i = 0.28 / 12, n = 12, k = K.kredit({ price: P, down: 0, n, ratePct: 28, type: 'diff' });
  near(k.first, P / n + P * i, 1e-6, 'birinchi'); near(k.last, P / n * (1 + i), 1e-6, 'oxirgi'); near(k.interest, P * i * (n + 1) / 2, 1e-6, 'foiz yig\'indisi'); near(k.nominal, 0.28, 1e-9, 'diff nominal = 28%');
  log('6. differensial: birinchi/oxirgi to\'lov, foiz yig\'indisi P·i·(n+1)/2, nominal 28%'); }
{ // 7. komissiyali kredit (foiz): jami narxga qo'shiladi, haqiqiy stavka nominaldan yuqori
  const k = K.kredit({ price: 6e6, down: 0, n: 12, ratePct: 28, type: 'ann', commKind: 'pct', commValue: 2 }), b = K.kredit({ price: 6e6, down: 0, n: 12, ratePct: 28, type: 'ann' });
  near(k.comm, 120000, 1e-6, 'komissiya 2%'); near(k.total, b.total + 120000, 1e-5, 'jami + komissiya'); assert.ok(k.nominal > b.nominal && k.effective > b.effective);
  near(k.r, excelRate(12, k.monthly, 6e6 - 120000), 1e-9, 'RATE(12; pmt; financed−komissiya)');
  const s = K.kredit({ price: 6e6, down: 0, n: 12, ratePct: 28, type: 'ann', commKind: 'sum', commValue: 120000 }); near(s.total, k.total, 1e-6, 'so\'mdagi komissiya = foizdagi'); near(s.nominal, k.nominal, 1e-12, 'bir xil stavka');
  log(`7. komissiya 2% (=120 000 so'm): jami +120 000, haqiqiy stavka ${(k.nominal * 100).toFixed(2)}% > 28%; foiz va so'm ko'rinishi bir xil`); }
{ // 8. noto'g'ri kirish
  const lo = K.nasiya({ price: 6e6, n: 12, mode: 'pay', monthly: 400000 }); assert.equal(lo.error, 'low'); near(lo.minMonthly, 500000, 1e-9, 'kamida oylik');
  assert.equal(K.nasiya({ price: 6e6, down: 6e6, n: 12, mode: 'pay', monthly: 1 }).error, 'down'); assert.equal(K.nasiya({ price: 0, n: 12, mode: 'pay', monthly: 1 }).error, 'price');
  assert.equal(K.nasiya({ price: 6e6, n: 0, mode: 'pay', monthly: 1e6 }).error, 'n'); assert.equal(K.nasiya({ price: 6e6, n: 12, mode: 'markup', markupPct: -5 }).error, 'markup');
  assert.equal(K.nasiya({ price: 6e6, n: 12, mode: 'pay', monthly: 0 }).error, 'monthly'); assert.equal(K.kredit({ price: 6e6, n: 12, ratePct: -1 }).error, 'rate');
  assert.equal(K.kredit({ price: 6e6, n: 12, ratePct: 28, commKind: 'pct', commValue: 100 }).error, 'comm'); assert.equal(K.kredit({ price: 6e6, n: 1.5, ratePct: 28 }).error, 'n');
  log('8. noto\'g\'ri kirish: oylik×oy < summa (kamida 500 000), boshlang\'ich ≥ narx, n, ustama<0, foiz<0, komissiya ≥ summa — xato kodlari'); }
{ // 9. solishtirish
  const n = K.nasiya({ price: 6e6, n: 12, mode: 'pay', monthly: 650000 }), k = K.kredit({ price: 6e6, n: 12, ratePct: 28, type: 'ann' }), c = K.compare(6e6, n, k);
  assert.equal(c.cheapest, 'naqd'); near(c.nasiyaMinusKredit, n.total - k.total, 1e-6, 'nasiya − kredit'); assert.ok(c.nasiyaMinusKredit > 0);
  const z = K.compare(6e6, K.nasiya({ price: 6e6, n: 12, mode: 'markup', markupPct: 0 }), null); assert.equal(z.cheapest, 'naqd'); assert.equal(z.items.length, 2);
  log('9. compare: eng arzoni naqd, nasiya−kredit farqi; 0% nasiya naqdga teng (cheapest = naqd)'); }
{ // 10. IRR: monotonlik/aniqlik — uzun muddat, katta ustama
  for (const [m, n, pr] of [[10, 6, 6e6], [100, 12, 6e6], [30, 36, 2e7], [5, 3, 1e6]]) { const x = K.nasiya({ price: pr, n, mode: 'markup', markupPct: m }); near(K.npv(x.r, x.financed, x.rows.map((r) => r.pay)), 0, 1e-4, `NPV(r)=0 (${m}%, ${n} oy)`); near(x.r, excelRate(n, x.monthly, x.financed), 1e-9, `RATE (${m}%, ${n} oy)`); }
  log('10. IRR aniqligi: NPV(r)≈0 va Excel RATE ±1e-9 (10%/6, 100%/12, 30%/36, 5%/3 oy)'); }

/* ---- B) sahifa va kredit-kalkulyator bilan moslik ---- */
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
let BASE = process.argv[2], srv;
if (!BASE) { srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; if (p === '/ru/') p = '/ru/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }); await new Promise((ok2) => srv.listen(0, ok2)); BASE = 'http://localhost:' + srv.address().port; }
const b = track(await chromium.launch());
const mk = async (w = 1280, h = 900) => { const c = await b.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block' }); const p = await c.newPage(); p.errs = [];
  p.on('pageerror', (e) => p.errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|googlesyndication|adsbygoog/.test(m.text())) p.errs.push(m.text()); });
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort()); return p; };
const nb = (s) => String(s).replace(/\u00A0/g, ' ');
const digits = (s) => Number(String(s).replace(/[^\d−-]/g, '').replace('−', '-'));
const set = async (p, id, v) => { await p.fill('#' + id, v); };
const URL_UZ = '/naqd-nasiya-kredit-kalkulyator';
try {
  const p = await mk(); await p.goto(BASE + URL_UZ, { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  // 11. standart (misol) qiymatlar: 3 karta, etalon summalar, yashil — naqd; xulosa; haqiqiy stavka
  const d = await p.evaluate(() => ({ cards: [...document.querySelectorAll('.nk-card')].map((c) => [c.querySelector('h3').firstChild.textContent, c.querySelector('.nk-total').textContent, c.classList.contains('best')]), v1: document.getElementById('v1').textContent, v2: document.getElementById('v2').textContent, rate: [...document.querySelectorAll('.nk-rate .big')].map((e) => e.textContent), ex: document.querySelector('.nk-ex')?.textContent }));
  assert.equal(d.cards.length, 3); assert.deepEqual(d.cards.map((c) => c[0]), ['Naqd', 'Nasiya', 'Kredit']);
  assert.equal(digits(d.cards[0][1]), 6000000); assert.equal(digits(d.cards[1][1]), 7800000); assert.equal(digits(d.cards[2][1]), Math.round(K.kredit({ price: 6e6, n: 12, ratePct: 28, type: 'ann' }).total));
  assert.equal(d.cards.filter((c) => c[2]).length, 1); assert.equal(d.cards[0][2], true); assert.match(nb(d.v1), /Nasiya kreditdan 851 569 so'm qimmat/); assert.match(nb(d.v2), /yillik ~51% bilan kredit/); assert.ok(d.ex && /misol/.test(d.ex), 'misol ekani ko\'rinadi');
  assert.match(nb(d.rate[0]), /51,4%/); log('11. sahifa (UZ) standart misol: Naqd 6 000 000 / Nasiya 7 800 000 / Kredit ' + nb(d.cards[2][1]) + ', xulosa "' + d.v1 + '", nasiya haqiqiy stavka ' + d.rate[0]);
  { const note = await p.evaluate(() => [document.querySelector('.nk-card.kredit .nk-rate .sm:last-child')?.textContent || '', document.querySelector('.nk-card.kredit .nk-rate .sm')?.textContent || '']);
    assert.ok(!/Komissiya/.test(note.join(' ')), 'komissiya 0: "Komissiya bilan..." yozuvi chiqmasin'); assert.match(note[1], /Haqiqiy yillik stavka/); }
  // 12. ustama rejimi — "wow" jumla; 0% ustama
  await p.click('#mMarkup'); await set(p, 'nMarkup', '30'); await p.waitForTimeout(150);
  let w = await p.evaluate(() => [document.getElementById('v2').textContent, document.getElementById('fldMonthly').hidden, document.getElementById('fldMarkup').hidden]);
  assert.match(nb(w[0]), /Ustama 30% ko'rinadi, lekin aslida yillik ~51% kredit olgandek/); assert.equal(w[1], true); assert.equal(w[2], false);
  await set(p, 'nMarkup', '0'); await p.waitForTimeout(150); w = await p.evaluate(() => [document.getElementById('v2').textContent, document.querySelectorAll('.nk-card.best').length, document.querySelector('.nk-card.nasiya .nk-diff').textContent]);
  assert.match(w[0], /haqiqiy stavka ham 0%/); assert.match(w[2], /naqd narxga teng/); log('12. ustama rejimi: "Ustama 30% ko\'rinadi, lekin aslida yillik ~51% kredit olgandek"; 0% ustama → haqiqiy stavka 0%, narxga teng');
  await set(p, 'nMarkup', '30');
  // 13. noto'g'ri kirish: oylik × oy < summa → tushunarli xato, natijada nasiya kartasi yo'q
  await p.click('#mPay'); await set(p, 'nMonthly', '400 000'); await p.waitForTimeout(150);
  const e = await p.evaluate(() => ({ t: document.getElementById('nasErr').textContent, hid: document.getElementById('nasErr').hidden, cards: [...document.querySelectorAll('.nk-card h3')].map((h) => h.firstChild.textContent), v1: document.getElementById('v1').textContent }));
  assert.equal(e.hid, false); assert.match(e.t, /4 800 000 so'm\) moliyalashtirilgan summadan \(6 000 000 so'm\) kam.*kamida 500 000 so'm/); assert.deepEqual(e.cards, ['Naqd', 'Kredit']); assert.match(nb(e.v1), /Kredit naqd narxdan/);
  log('13. noto\'g\'ri kirish (400 000 × 12 < 6 000 000): xato "' + e.t.replace(/ /g, ' ') + '"; faqat Naqd va Kredit kartalari');
  await set(p, 'nMonthly', '650 000');
  // 14. kredit: differensial, komissiya; jadval yig'iladigan
  await p.click('#tDiff'); await set(p, 'kComm', '2'); await p.waitForTimeout(150);
  const kd = await p.evaluate(() => ({ cardK: document.querySelector('.nk-card.kredit .nk-total').textContent, rows: [...document.querySelectorAll('.nk-card.kredit .nk-row .k')].map((x) => x.textContent), open: document.getElementById('schedK').open, trs: document.querySelectorAll('#tblK tbody tr').length, trN: document.querySelectorAll('#tblN tbody tr').length }));
  const kk = K.kredit({ price: 6e6, n: 12, ratePct: 28, type: 'diff', commKind: 'pct', commValue: 2 }); assert.equal(digits(kd.cardK), Math.round(kk.total)); assert.ok(kd.rows.includes('Komissiya') && kd.rows.includes('Birinchi / oxirgi oy')); assert.equal(kd.open, false); assert.equal(kd.trs, 12); assert.equal(kd.trN, 12);
  log('14. kredit differensial + komissiya 2%: kartadagi jami modul bilan bir xil, jadvallar yopiq (details), 12 qator');
  { const n2 = await p.evaluate(() => document.querySelector('.nk-card.kredit .nk-rate .sm:last-child')?.textContent || ''); assert.match(n2, /Komissiya bilan hisoblangan/, 'komissiya > 0: "Komissiya bilan..." yozuvi chiqsin'); }
  // 15. ulashish URL: holatni tiklash
  await set(p, 'price', '8 500 000'); await p.waitForTimeout(100); const url = await p.evaluate(() => window.__buildShareUrl()); const q = await mk(); await q.goto(url.replace(/^https?:\/\/[^/]+/, BASE), { waitUntil: 'networkidle' }); await q.waitForTimeout(500);
  const st = await q.evaluate(() => ({ price: document.getElementById('price').value, comm: document.getElementById('kComm').value, diff: document.getElementById('tDiff').classList.contains('on'), n: document.querySelector('.nk-card.naqd .nk-total').textContent }));
  assert.equal(st.price, '8 500 000'); assert.equal(st.comm, '2'); assert.equal(st.diff, true); assert.equal(digits(st.n), 8500000); log('15. ulashish havolasi: narx, komissiya va "differensial" tiklanadi'); await q.context().close();
  assert.deepEqual(p.errs, [], 'konsol xatolari: ' + p.errs.join(' | ')); await p.context().close();
  // 16. RU va ЎЗ
  const r = await mk(); await r.goto(BASE + '/ru' + URL_UZ, { waitUntil: 'networkidle' }); await r.waitForTimeout(500);
  const ru = await r.evaluate(() => ({ h1: document.querySelector('h1').textContent, v1: document.getElementById('v1').textContent, steps: [...document.querySelectorAll('.qadamlar li')].map((x) => x.textContent), tip: document.querySelector('.mode-tip')?.textContent, cards: [...document.querySelectorAll('.nk-card h3')].map((h) => h.firstChild.textContent), lat: (document.querySelector('main').innerText.replace(/Kalki\.uz|PDF|CSV|Telegram/g, '').match(/[A-Za-z]{4,}/g) || []).join(',') }));
  assert.match(ru.h1, /Наличные, рассрочка или кредит/); assert.match(nb(ru.v1), /Рассрочка дороже кредита на 851 569 сум/); assert.deepEqual(ru.cards, ['Наличные', 'Рассрочка', 'Кредит']); assert.equal(ru.steps.length, 3); assert.ok(/ставку/.test(ru.tip), 'RU rejim izohi'); assert.equal(ru.lat, '', 'RU sahifada lotincha matn qolmasin: ' + ru.lat);
  assert.deepEqual(r.errs, []); await r.context().close();
  const c = await mk(); await c.goto(BASE + URL_UZ + '?lang=cyr', { waitUntil: 'networkidle' }); await c.waitForTimeout(900);
  const cy = await c.evaluate(() => ({ h1: document.querySelector('h1').textContent, v1: document.getElementById('v1').textContent, cards: [...document.querySelectorAll('.nk-card h3')].map((h) => h.firstChild.textContent), lat: (document.querySelector('main').innerText.match(/[A-Za-z]{3,}/g) || []).filter((x) => !/^(PDF|CSV|IRR|Kalki|Telegram)$/.test(x)) }));
  assert.match(cy.h1, /Нақд, насия ёки кредит/); assert.deepEqual(cy.cards, ['Нақд', 'Насия', 'Кредит']); assert.match(nb(cy.v1), /Насия кредитдан 851 569 сўм қиммат/); assert.deepEqual(cy.lat, [], 'ЎЗ да лотин қолмасин: ' + cy.lat.join(','));
  log('16. RU: sarlavha, xulosa, kartalar, 3 qadam, rejim izohi; ЎЗ (translit): "' + cy.h1 + '" / "' + cy.v1 + '"'); await c.context().close();
  // 17. kredit-kalkulyator bilan bir xil natija (annuitet va differensial; sahifaning o'z formulasi bilan)
  const kp = await mk(); await kp.goto(BASE + '/kredit-kalkulyator', { waitUntil: 'networkidle' }); await kp.waitForTimeout(400);
  for (const [type, sel] of [['ann', '#tAnn'], ['diff', '#tDiff']]) { await kp.fill('#amount', '5 000 000'); await kp.fill('#rate', '28'); await kp.fill('#term', '18'); await kp.click(sel); await kp.click('#calcBtn'); await kp.waitForTimeout(200);
    const pg = await kp.evaluate(() => ({ total: document.getElementById('rTotal').textContent, main: document.getElementById('mainNum').textContent })); const m = K.kredit({ price: 5e6, n: 18, ratePct: 28, type });
    assert.equal(digits(pg.total), Math.round(m.total), 'jami (' + type + ')'); if (type === 'ann') assert.equal(digits(pg.main), Math.round(m.monthly)); else { const nums = pg.main.match(/\d[\d\s ]*/g).map(digits); assert.equal(nums[0], Math.round(m.first)); assert.equal(nums[1], Math.round(m.last)); } }
  log('17. kredit-kalkulyator sahifasi bilan bir xil: 5 000 000 / 28% / 18 oy — annuitet va differensial jami va oylik to\'lovlar mos'); await kp.context().close();
} finally { await b.close(); if (srv) srv.close(); }
console.log(`\n${ok} ta tekshiruv guruhi o'tdi`);
