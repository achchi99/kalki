// "Ro'zg'or" ilovasi (Playwright): onboarding, 3 qadamda xarajat, bekor qilish, tahrirlash, to'lovni belgilash, "sotib olsam-chi", hisobni tekshirish,
// eksport/import, oflayn, RU/ЎЗ, Katta shrift, tungi rejim (axe kontrast), standalone, oila-byudjetdan o'tish.   node tools/dizayn/test-rozgor.mjs [https://host]
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const K = require(path.join(ROOT, 'assets/rozgor-core.js')); const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
let BASE = process.argv[2], srv;
if (!BASE) { srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; if (p === '/ru/') p = '/ru/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
  await new Promise((ok) => srv.listen(0, ok)); BASE = 'http://localhost:' + srv.address().port; }
const b = track(await chromium.launch()); let n = 0; const log = (m) => { n++; console.log('OK  ', m); };
const nb = (s) => String(s).replace(/ /g, ' ');
const TODAY = K.today();
function seed(o = {}) { const st = K.emptyState(); st.prefs = {}; st.setup = true; st.created = Date.now() - (o.ageDays || 0) * 86400000; st.base = o.base != null ? o.base : 3000000; st.reserve = o.reserve != null ? o.reserve : 500000; if (o.income !== undefined) st.income = { date: o.income, amount: null }; (o.bills || []).forEach((x) => K.addBill(st, x)); (o.tx || []).forEach((x) => K.addTx(st, x)); if (o.lastBackup) st.lastBackup = o.lastBackup; return st; }
const SAMPLE = () => seed({ base: 3000000, reserve: 500000, income: K.addDays(TODAY, 12), bills: [{ name: 'Ijara', amount: 1500000, due: K.addDays(TODAY, 10) }] });
async function open(url, { state, w = 390, h = 844, scheme = 'light', ls = {}, sw = 'block', hash = '' } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500, serviceWorkers: sw, colorScheme: scheme, acceptDownloads: true });
  await c.addInitScript((o) => { try { if (o.state && !localStorage.getItem('kalki_rozgor')) localStorage.setItem('kalki_rozgor', JSON.stringify(o.state)); for (const k in o.ls) localStorage.setItem(k, o.ls[k]); } catch (e) {} }, { state, ls });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|googlesyndication|adsbygoog/.test(m.text())) p.errs.push(m.text()); });
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  await p.goto(BASE + url + hash, { waitUntil: 'networkidle' }); await p.waitForTimeout(500); return p;
}
const txt = async (p, sel) => { const l = p.locator(sel).first(); if (!(await l.count())) return null; return (await l.innerText()).replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim(); };
const stOf = (p) => p.evaluate(() => JSON.parse(JSON.stringify(window.__rozgor.state)));
const keys = async (p, s) => { for (const ch of String(s).replace(/000$/, '')) await p.click(`[data-act=key][data-k="${ch}"]`); if (/000$/.test(s)) await p.click('[data-act=key][data-k="000"]'); };
async function addExp(p, amount, cat) { await p.click('#rzFab'); await keys(p, amount); if (cat) await p.click(`[data-act=cat][data-c=${cat}]`); await p.click('#exSave'); await p.waitForTimeout(300); }
try {
  /* ---- 1. onboarding ---- */
  let p = await open('/rozgor');
  assert.equal(await p.locator('#rzOnb').isVisible(), true); assert.equal(await p.locator('.rz-dots i').count(), 3); assert.equal(await p.locator('h1').count(), 1, 'sahifada bitta H1');
  assert.match(await txt(p, '#rzOnb .rz-q'), /Hozir qo'lingizda va kartangizda jami qancha pul bor/); const t0 = Date.now();
  await p.fill('#obBal', '3000000'); assert.equal(await p.inputValue('#obBal'), '3 000 000'); await p.click('[data-act=obnext]');
  assert.match(await txt(p, '#rzOnb .rz-q'), /Keyingi daromad qachon keladi/); await p.click('[data-act=obback]'); assert.equal(await p.inputValue('#obBal'), '3 000 000', 'orqaga qaytganda qiymat saqlanadi'); await p.click('[data-act=obnext]');
  await p.fill('#obDate', K.addDays(TODAY, 12)); await p.click('[data-act=obnext]');
  assert.match(await txt(p, '#rzOnb .rz-q'), /Shu kungacha qanday to'lovlar bor/); await p.click('[data-n=bIjara]'); await p.fill('.rz-obbill [data-f=amount]', '1500000'); await p.fill('.rz-obbill [data-f=due]', K.addDays(TODAY, 10)); await p.fill('#obRes', '500000'); await p.click('[data-act=obnext]'); await p.waitForTimeout(500);
  assert.ok(Date.now() - t0 < 60000); assert.equal(await p.locator('#rzOnb').isVisible(), false);
  let s = await txt(p, '#hNum'); assert.equal(s, '83 333'); assert.match(await txt(p, '.rz-left'), /Keyingi daromadgacha 12 kun · bo'sh pul 1 000 000 so'm/); assert.equal(await txt(p, '#hLbl'), 'Bugun yana sarflash mumkin'); const sv = await stOf(p); assert.equal(sv.base, 3000000); assert.equal(sv.reserve, 500000); assert.equal(sv.bills.length, 1);
  log('1.  Onboarding (3 qadam, orqaga qaytish, ' + Math.round((Date.now() - t0) / 1000) + ' s): balans 3 000 000, zaxira 500 000, ijara 1 500 000, daromad 12 kundan keyin → bugun 83 333 so\'m');
  /* ---- 2. xarajat 3 qadamda + bekor qilish ---- */
  await p.click('#rzFab'); assert.equal(await p.locator('#rzSheet.open').count(), 1); assert.equal(await p.locator('#exAmt input').count(), 0, 'o\'z klaviaturasi: summa maydoni input emas'); await keys(p, '150000'); assert.equal(await txt(p, '#exNum'), '150 000');
  await p.click('[data-act=key][data-k=del]'); assert.equal(await txt(p, '#exNum'), '15 000'); await p.click('[data-act=key][data-k="0"]'); assert.equal(await p.locator('[data-act=cat]').count(), 8);
  await p.click('[data-act=cat][data-c=oziq]'); await p.click('#exSave'); await p.waitForTimeout(400);
  assert.equal(await p.locator('#rzSheet').isHidden(), true); assert.equal(await txt(p, '#hLbl'), "Bugun mo'ljaldan oshdi"); assert.equal(await txt(p, '#hNum'), '66 667'); assert.match(await txt(p, '.rz-note'), /Ertangi mo'ljal: 77 272 so'm/);
  assert.match(await txt(p, '#rzToast'), /Saqlandi/); assert.equal(await p.locator('.rz-tx').count(), 1);
  await p.click('#rzToast [data-act=undo]'); await p.waitForTimeout(400); assert.equal(await txt(p, '#hNum'), '83 333'); assert.equal((await stOf(p)).tx.length, 0);
  log('2.  Xarajat: summa → toifa → saqlash; o\'z klaviaturasi (⌫), "mo\'ljaldan oshdi 66 667" + ertangi mo\'ljal, toast va "Bekor qilish" holatni tiklaydi');
  /* ---- 3. tahrirlash / o'chirish (Tarix) ---- */
  await addExp(p, '40000', 'transport'); await addExp(p, '25000', 'oziq'); assert.equal(await txt(p, '#hNum'), '18 333'); // 83 333 − 65 000
  await p.click('[data-act=tab][data-v=hist]'); assert.match(await txt(p, '.rz-card .rz-st'), /Shu oy xarajatlari · 65 000/); await p.click('.rz-tx >> nth=1'); await p.waitForTimeout(300);
  assert.equal(await txt(p, '#exNum'), '40 000'); for (let i = 0; i < 5; i++) await p.click('[data-act=key][data-k=del]'); await keys(p, '45000'); await p.click('#exSave'); await p.waitForTimeout(350);
  assert.equal((await stOf(p)).tx.filter((x) => x.amount === 45000).length, 1); await p.click('[data-act=tab][data-v=today]'); assert.equal(await txt(p, '#hNum'), '13 333');
  await p.click('[data-act=tab][data-v=hist]'); await p.click('.rz-tx >> nth=0'); await p.waitForTimeout(250); await p.click('[data-act=exdel]'); await p.waitForTimeout(300); assert.equal((await stOf(p)).tx.length, 1); await p.click('#rzToast [data-act=undo]'); await p.waitForTimeout(300); assert.equal((await stOf(p)).tx.length, 2);
  log('3.  Tarix: oy toifalari (65 000), yozuvni tahrirlash 40 000 → 45 000 (bugun 13 333), o\'chirish va "Bekor qilish"');
  await p.context().close();
  /* ---- 4. to'lovni belgilash (ikki marta ayirilmaydi) ---- */
  p = await open('/rozgor', { state: SAMPLE() }); const before = await p.evaluate(() => { const K2 = window.KalkiRozgor, s = window.__rozgor.state; return K2.summary(s, K2.today()); });
  await p.click('.rz-card .rz-pay >> nth=0'); await p.waitForTimeout(400); const after = await p.evaluate(() => { const K2 = window.KalkiRozgor, s = window.__rozgor.state; return { sm: K2.summary(s, K2.today()), bills: s.bills.length, tx: s.tx.map((x) => [x.type, x.amount, x.bill != null]) }; });
  assert.equal(after.sm.balance, before.balance - 1500000); assert.equal(after.sm.free, before.free); assert.equal(after.sm.norm, before.norm); assert.equal(after.bills, 0); assert.deepEqual(after.tx, [['exp', 1500000, true]]); assert.equal(await txt(p, '#hNum'), '83 333');
  await p.click('#rzToast [data-act=undo]'); await p.waitForTimeout(300); assert.equal((await stOf(p)).bills.length, 1); assert.equal((await stOf(p)).tx.length, 0);
  log('4.  "To\'landi": balans bir marta kamayadi (−1 500 000), bo\'sh pul va mo\'ljal o\'zgarmaydi, to\'lov ro\'yxatdan chiqadi; bekor qilinsa tiklanadi');
  /* ---- 5. sotib olsam-chi ---- */
  await p.click('[data-act=whatif]'); await p.fill('#wiAmt', '300000'); const wi = await txt(p, '#wiOut');
  assert.match(wi, /Xariddan keyin bo'sh pul: 700 000 so'm/); assert.match(wi, /Qolgan kunlar uchun kunlik mo'ljal: 63 636 so'm/); assert.match(wi, /Yaqin to'lovlarga yetadi/); assert.equal((await stOf(p)).tx.length, 0, 'hech narsa saqlanmaydi');
  await p.fill('#wiAmt', '2000000'); assert.match(await txt(p, '#wiOut'), /yetishmaydi/); await p.click('#rzSheet .rz-x'); await p.waitForTimeout(300);
  log('5.  "Shuni sotib olsam-chi?": 300 000 → bo\'sh pul 700 000, mo\'ljal 63 636, to\'lovlarga yetadi; 2 000 000 → yetishmaydi; hech narsa saqlanmaydi');
  /* ---- 6. hisobni tekshirish + tushum ---- */
  await p.click('[data-act=tab][data-v=set]'); await p.click('[data-act=check]'); assert.match(await txt(p, '#rzSheet .rz-p'), /Ilovada hozir: 3 000 000 so'm/); await p.fill('#ckAmt', '2900000'); assert.match(await txt(p, '#ckInfo'), /100 000 so'm kam/); await p.click('#ckGo'); await p.waitForTimeout(400);
  let st2 = await stOf(p); assert.equal(st2.tx.length, 1); assert.equal(st2.tx[0].type, 'adj'); assert.equal(st2.tx[0].amount, -100000); await p.click('[data-act=tab][data-v=hist]'); assert.match(await txt(p, '.rz-tx .nm'), /Tafsiloti kiritilmagan sarf/);
  await p.click('[data-act=tab][data-v=set]'); await p.click('[data-act=income]'); await p.fill('#inAmt', '2000000'); await p.fill('#inDate', K.addDays(TODAY, 30)); await p.click('[data-act=insave]'); await p.waitForTimeout(400);
  st2 = await stOf(p); assert.equal(K.balance(st2), 2900000 + 2000000); assert.equal(st2.income.date, K.addDays(TODAY, 30)); await p.click('[data-act=tab][data-v=today]'); assert.match(await txt(p, '.rz-left'), /30 kun/);
  log('6.  Hisobni tekshirish: 2 900 000 → "Tafsiloti kiritilmagan sarf −100 000" (toifasiz); Tushum +2 000 000 → balans 4 900 000, daromad sanasi +30 kun');
  /* ---- 7. eksport / wipe / import ---- */
  await p.click('[data-act=tab][data-v=set]'); const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=export]')]); const file = path.join(os.tmpdir(), 'rz-' + Date.now() + '.json'); await dl.saveAs(file); const exp = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(exp.app, 'kalki-rozgor'); assert.equal(K.balance(exp.state), 4900000); assert.match(dl.suggestedFilename(), /^kalki-rozgor-\d{4}-\d{2}-\d{2}\.json$/);
  await p.click('[data-act=wipe]'); await p.click('#cfGo'); await p.waitForTimeout(450); await p.click('#cfGo'); await p.waitForTimeout(400); assert.equal(await p.locator('#rzOnb').isVisible(), true, 'o\'chirilgach onboarding'); assert.equal(await p.evaluate(() => localStorage.getItem('kalki_rozgor')), null);
  await p.context().close(); p = await open('/rozgor', { state: seed({}) }); await p.click('[data-act=tab][data-v=set]'); const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click('[data-act=import]')]); await fc.setFiles(file); await p.waitForTimeout(400); assert.match(await txt(p, '#rzSheet .rz-p'), /almashtiriladi/); await p.click('#cfGo'); await p.waitForTimeout(500);
  const imp = await stOf(p); assert.equal(K.balance(imp), 4900000); assert.equal(imp.tx.length, exp.state.tx.length); assert.deepEqual(imp.bills, exp.state.bills); assert.equal(imp.income.date, exp.state.income.date); fs.unlinkSync(file);
  log('7.  Eksport (JSON, kalki-rozgor-sana.json) → "Hammasini o\'chirish" (ikki tasdiq → onboarding) → import: balans, yozuvlar, to\'lovlar aynan tiklandi');
  await p.context().close();
  /* ---- 8. oflayn + #qoshish + eslatmalar ---- */
  p = await open('/rozgor', { state: SAMPLE(), sw: 'allow' }); await p.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.ready); await p.waitForTimeout(1500); await p.context().setOffline(true);
  await p.reload({ waitUntil: 'domcontentloaded' }).catch(() => {}); await p.waitForTimeout(800); const off = await txt(p, '#hNum'); await p.context().setOffline(false);
  assert.equal(off, '83 333', 'oflayn qayta yuklash: ilova va ma\'lumot ishlaydi'); log('8a. Oflayn: service worker keshi bilan sahifa qayta yuklandi, ma\'lumot saqlangan (bugun 83 333)'); await p.context().close();
  p = await open('/rozgor', { state: SAMPLE(), hash: '#qoshish' }); assert.equal(await p.locator('#rzSheet.open').count(), 1); assert.match(await txt(p, '#rzSheet .rz-sh-h'), /Xarajat qo'shish/); log('8b. #qoshish (manifest shortcut) xarajat panelini darrov ochadi'); await p.context().close();
  const old = seed({ ageDays: 10, tx: [{ type: 'exp', amount: 1000, cat: 'oziq', date: K.addDays(TODAY, -4), ts: 1 }], income: K.addDays(TODAY, 12) }); p = await open('/rozgor', { state: old }); const nud = await p.evaluate(() => [...document.querySelectorAll('.nudge .t')].map((e) => e.textContent));
  assert.ok(nud.some((x) => /4 kundan beri yozmadingiz/.test(x)), 'idle: ' + nud.join('|')); assert.ok(nud.some((x) => /Zaxira nusxa olish vaqti keldi/.test(x)), 'backup: ' + nud.join('|')); await p.click('[data-nudge=backup] [data-act=hide]'); await p.waitForTimeout(250); assert.equal(await p.locator('[data-nudge=backup]').count(), 0, '"Keyinroq" 7 kunga yashiradi');
  const inc0 = seed({ income: TODAY }); await p.context().close(); p = await open('/rozgor', { state: inc0 }); assert.ok(await p.locator('[data-nudge=income]').count() === 1); log('8c. Kartalar: "4 kundan beri yozmadingiz", "Zaxira nusxa olish vaqti keldi" (Keyinroq → 7 kun yashiriladi), daromad sanasi kelganda "Tushum qo\'shish"'); await p.context().close();
  /* ---- 9. RU / ЎЗ / Katta / dark / standalone / desktop ---- */
  p = await open('/ru/rozgor', { state: SAMPLE() }); assert.equal(await txt(p, '.rz-nav .rz-tab >> nth=0'), 'Сегодня'); assert.equal(await txt(p, '#hLbl'), 'Сегодня можно потратить ещё'); assert.match(await txt(p, '.rz-left'), /До следующего дохода 12 дн\./); assert.match(await p.title(), /Рузгор/); assert.deepEqual(p.errs, []); await p.click('#rzFab'); assert.match(await txt(p, '.rz-cats'), /Продукты/); await p.context().close();
  p = await open('/rozgor?lang=cyr', { state: SAMPLE() }); await p.waitForTimeout(600); assert.match(await txt(p, '#hLbl'), /Бугун яна сарфлаш мумкин/); assert.match(await txt(p, '#rzTitle'), /Рўзғор/); assert.equal(await txt(p, '.rz-nav .rz-tab >> nth=0'), 'Бугун'); await p.context().close();
  p = await open('/rozgor', { state: SAMPLE(), ls: { kalki_fs: 'big' }, w: 320, h: 640 }); const kt = await p.evaluate(() => ({ big: document.documentElement.classList.contains('fs-big'), sw: document.documentElement.scrollWidth <= innerWidth, tabs: [...document.querySelectorAll('.rz-tab')].map((e) => { const r = e.getBoundingClientRect(); const sp = [...e.querySelectorAll('span')].filter((x) => getComputedStyle(x).display !== 'none')[0].getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), Math.round(sp.right), Math.round(sp.left)]; }), fab: (() => { const r = document.getElementById('rzFab').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })() }));
  assert.ok(kt.big && kt.sw && kt.fab, 'Katta rejim 320px: ' + JSON.stringify(kt)); kt.tabs.forEach(([l, r, sr, sl]) => assert.ok(sl >= l - 1 && sr <= r + 1 && l >= 0 && r <= 320, 'tab yorlig\'i sig\'madi: ' + JSON.stringify(kt.tabs))); await p.click('#rzFab'); const sheetOk = await p.evaluate(() => { const r = document.getElementById('rzSheet').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && document.documentElement.scrollWidth <= innerWidth; }); assert.ok(sheetOk);
  log('9a. RU (Сегодня / «Сегодня можно потратить ещё» / «до следующего дохода 12 дн.»), ЎЗ translit («Бугун яна сарфлаш мумкин», «Рўзғор»), Katta shrift 320px: tab yorliqlari va panel sig\'adi'); await p.context().close();
  for (const scheme of ['light', 'dark']) { p = await open('/rozgor', { state: seed({ income: K.addDays(TODAY, 12), bills: [{ name: 'Ijara', amount: 1500000, due: K.addDays(TODAY, 10) }], tx: [{ type: 'exp', amount: 40000, cat: 'oziq', date: TODAY, ts: 1 }] }), scheme });
    const bg = await p.evaluate(() => getComputedStyle(document.getElementById('rzApp')).backgroundColor); assert.equal(bg, scheme === 'dark' ? 'rgb(15, 23, 20)' : 'rgb(241, 242, 238)');
    for (const v of ['today', 'hist', 'bills', 'set']) { await p.click(`[data-act=tab][data-v=${v}]`); await p.waitForTimeout(250); await p.evaluate(AXE); const res = await p.evaluate(async () => { const r = await axe.run(document.getElementById('rzApp'), { runOnly: { type: 'rule', values: ['color-contrast', 'button-name', 'label'] } }); return r.violations.flatMap((x) => x.nodes.map((nd) => x.id + ' ' + nd.target.join(' ').slice(0, 50) + ' ' + (nd.any[0] ? nd.any[0].message.slice(0, 190) : ''))); }); assert.deepEqual(res, [], scheme + '/' + v + ': axe: ' + res.slice(0, 3).join(' | ')); }
    await p.click('#rzFab'); await p.evaluate(AXE); const rs = await p.evaluate(async () => { const r = await axe.run(document.getElementById('rzSheet'), { runOnly: { type: 'rule', values: ['color-contrast', 'button-name'] } }); return r.violations.flatMap((x) => x.nodes.map((nd) => x.id + ' ' + nd.target.join(' ').slice(0, 50) + ' ' + (nd.any[0] ? nd.any[0].message.slice(0, 190) : ''))); }); assert.deepEqual(rs, [], scheme + ' panel axe: ' + rs.join('|')); assert.deepEqual(p.errs, []); await p.context().close(); }
  log('9b. Tungi/yorug\' rejim: 4 ekran + xarajat paneli — axe (kontrast, tugma nomi, yorliq) 0 xato');
  p = await open('/rozgor', { state: SAMPLE(), w: 1280, h: 800 }); const dk = await p.evaluate(() => { const r = document.getElementById('rzApp').getBoundingClientRect(); return { w: Math.round(r.width), left: Math.round(r.left), right: Math.round(innerWidth - r.right), sitebar: getComputedStyle(document.getElementById('sitebar')).display, below: !!document.querySelector('.rz-below h1, h1'), sw: document.documentElement.scrollWidth <= innerWidth }; });
  assert.ok(dk.w <= 480 && Math.abs(dk.left - dk.right) <= 2, 'markazda tor ustun: ' + JSON.stringify(dk)); assert.equal(dk.sitebar, 'none'); assert.ok(dk.sw); log('9c. Kompyuter 1280px: ilova ' + dk.w + 'px kenglikda markazda, sayt menyusi yashirin, gorizontal siljish yo\'q');
  { const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' }); await c.addInitScript(() => { const mm = window.matchMedia.bind(window); window.matchMedia = (q) => /display-mode:\s*standalone/.test(q) ? { matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} } : mm(q); localStorage.setItem('kalki_rozgor', JSON.stringify(window.__seedState)); });
    await c.addInitScript((st) => { window.__seedState = st; localStorage.setItem('kalki_rozgor', JSON.stringify(st)); }, SAMPLE()); p = await c.newPage(); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort()); await p.goto(BASE + '/rozgor', { waitUntil: 'networkidle' }); await p.waitForTimeout(500); }
  const sa = await p.evaluate(() => ({ cls: document.body.classList.contains('rz-standalone'), below: [...document.querySelectorAll('.rz-below')].every((e) => getComputedStyle(e).display === 'none'), foot: getComputedStyle(document.getElementById('sf2')).display })); assert.ok(sa.cls && sa.below && sa.foot === 'none', 'standalone: SEO matni yashirin: ' + JSON.stringify(sa)); log('9d. display-mode: standalone — SEO matni va footer yashirin (sof ilova)'); await p.context().close();
  /* ---- 10. oila-byudjetdan o'tish ---- */
  p = await open('/oila-byudjet-kalkulyator'); await p.fill('#inc', '8000000'); await p.fill('#mCredit', '1500000'); await p.fill('#mRent', '2000000'); await p.waitForTimeout(250); assert.match(await txt(p, '#btnRozgor'), /Shu reja bilan kundalik hisobni boshlash/);
  await Promise.all([p.waitForURL(/\/rozgor#boshlash$/), p.click('#btnRozgor')]); await p.waitForTimeout(600); assert.equal(await p.locator('#rzOnb').isVisible(), true);
  await p.fill('#obBal', '3000000'); await p.click('[data-act=obnext]'); await p.fill('#obDate', K.addDays(TODAY, 12)); await p.click('[data-act=obnext]'); const rows = await p.evaluate(() => [...document.querySelectorAll('.rz-obbill')].map((r) => [r.querySelector('[data-f=name]').value, r.querySelector('[data-f=amount]').value]));
  assert.deepEqual(rows, [["Kredit va qarz to'lovlari", '1 500 000'], ['Uy ijarasi', '2 000 000']]); await p.click('[data-act=obnext]'); await p.waitForTimeout(500); const fin = await stOf(p); assert.equal(fin.bills.length, 2); assert.equal(fin.bills.reduce((a, x) => a + x.amount, 0), 3500000); assert.equal(await p.evaluate(() => localStorage.getItem('kalki_rozgor_import')), null);
  log('10. oila-byudjet → "Shu reja bilan kundalik hisobni boshlash" → /rozgor#boshlash: majburiy to\'lovlar (kredit 1 500 000, ijara 2 000 000) onboarding\'da tayyor, yakunda 2 ta to\'lov saqlandi'); assert.deepEqual(p.errs, []); await p.context().close();
} finally { await b.close(); if (srv) srv.close(); }
console.log(`\n${n} ta tekshiruv guruhi o'tdi`);
