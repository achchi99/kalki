// KalkiFit «O'rniga» UI: karta (qoida bajarilganda), 1 asosiy + «Boshqa variantlar» ≤2, o'rinbosarga o'tganda porsiya hajmi saqlanadi, o'chirish (Profil), 360 px/katta shrift,
// «Oqsil manbalari» (Natijalar, Kun yakuni), hazil holatlari (baliq, almashtirish), RU.   node tools/dizayn/test-orinbosar-ui.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const TODAY = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = process.env.INSTALL_BASE || 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); }; const num = (s) => Number(String(s).replace(/[^\d.,-]/g, '').replace(',', '.'));
const E = (fid, p, k, vr) => ({ fid, meal: 'l', unit: 'g100', qty: 100, g: 100, kcal: k, p, f: 5, c: 5, vr: vr || null, ts: 1 });
function seed(entries, o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 86400000; st.prefs = Object.assign({ tipsDone: true, jokes: false }, o.prefs || {}); st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = D.addDays(TODAY, -8); S.addWeight(st, TODAY, 80); (entries || []).forEach(([d, e]) => S.addFood(st, D.addDays(TODAY, d), Object.assign({}, e))); return st; }
async function mk(st, w = 360, h = 640, url = '/kalkifit') {
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block' }); await c.addInitScript((s) => { localStorage.setItem('kalki_fit', JSON.stringify(s)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); }, st);
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(500); return p; }
const txt = (p, s) => p.locator(s).first().innerText(); const stOf = (p) => p.evaluate(() => JSON.parse(JSON.stringify(window.__kalkifit.state)));
async function pick(p, q, nth = 0) { await p.click('#mainAdd'); await p.waitForTimeout(400); await p.fill('#fdQ', q); await p.waitForTimeout(300); await p.click('[data-act=pickfood] >> nth=' + nth); await p.waitForTimeout(500); }
const noX = async (p) => assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'gorizontal skroll yo\'q');
try {
  /* 1. karta: osh → tovuqli osh (oqsil deyarli bir xil, yog' −14 g); 1 asosiy + «Boshqa variantlar» ≤2; CTA'dan oldin */
  let p = await mk(seed()); await pick(p, 'osh'); await p.waitForSelector('#orCard');
  assert.match(await txt(p, '#orCard .sl-or-b.main b'), /Tovuqli osh/); const d1 = await txt(p, '#orCard .sl-or-b.main .m > span'); assert.match(d1, /oqsil deyarli bir xil/); assert.match(d1, /yog' −1[34] g/); assert.match(await txt(p, '#orCard .sl-or-b.main small'), /O'rniga/);
  assert.ok(await p.evaluate(() => { const c = document.getElementById('orCard'), s = document.getElementById('fsave'); return !!(c.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING); }), 'karta CTA\'dan oldin');
  assert.equal(await p.locator('#orCard .sl-or-more[hidden] .sl-or-b').count(), 2, 'yopiq: ≤2 qo\'shimcha'); assert.equal(await p.locator('#orCard .sl-or-b.main').count(), 1); await p.click('[data-act=ormore]'); await p.waitForTimeout(150);
  const more = await p.locator('#orCard .sl-or-more .sl-or-b b').allInnerTexts(); assert.equal(more.length, 2); assert.match(more[0], /Dimlangan baliq/); assert.match(await txt(p, '[data-act=ormore]'), /Yopish/); await noX(p);
  log('Osh: karta «O\'rniga: Tovuqli osh — ' + d1 + '» (CTA\'dan oldin), «Boshqa variantlar» ochilganda 2 ta (' + more.join(', ') + '), gorizontal skroll yo\'q');
  /* 2. o'rinbosarga o'tganda hajm saqlanadi: 2 likop → 2 likop; ro'yxatda saqlanadi, ketma-ket karta chiqmaydi */
  await p.click('[data-act=pwmore]'); await p.waitForTimeout(100); await p.click('[data-act=pwq][data-v="2"]'); await p.waitForTimeout(200); const ds2 = await txt(p, '#orCard .sl-or-b.main .m > span');
  await p.click('#orCard .sl-or-b.main'); await p.waitForTimeout(500); assert.equal((await txt(p, '#fdName')).trim(), 'Tovuqli osh'); assert.equal(num(await p.inputValue('#fdQty')), 2, '2 likop → 2 likop'); assert.match(await txt(p, '#fdGr'), /700/, '700 g'); assert.equal(await p.locator('#orCard').count(), 0, 'o\'rinbosar oynasida yana karta yo\'q');
  assert.match(await txt(p, '#fsave'), /kkal/); await p.click('#fsave'); await p.waitForTimeout(500); const s2 = await stOf(p); assert.equal(s2.days[TODAY].food[0].fid, 'osh-tovuq'); assert.equal(s2.days[TODAY].food[0].qty, 2); log('O\'rinbosarga o\'tish: 2 likop osh → 2 likop tovuqli osh (700 g), saqlandi; karta qaytib chiqmaydi (' + ds2 + ')');
  await p.context().close();
  /* 3. karta yo'q: olma (jadvalda yo'q), eski yozuvni tahrirlash, "Mening" taomi; o'chirilgan sozlama */
  p = await mk(seed()); await pick(p, 'olma'); assert.equal(await p.locator('#orCard').count(), 0, 'olma: karta yo\'q'); await p.context().close();
  p = await mk(seed([[0, E('osh', 9, 300)]])); await p.click('[data-act=editfood] >> nth=0'); await p.waitForTimeout(500); assert.equal(await p.locator('#orCard').count(), 0, 'tahrirlashda karta yo\'q'); await p.context().close();
  p = await mk(seed([], { prefs: { orin: false } })); await pick(p, 'osh'); assert.equal(await p.locator('#orCard').count(), 0, 'sozlama o\'chiq: karta yo\'q'); await p.context().close();
  p = await mk(seed()); await pick(p, 'osh'); await p.click('[data-act=pwmore]'); await p.waitForTimeout(100); await p.click('[data-act=fax][data-a=gosht][data-o=kop]'); await p.waitForTimeout(300); await p.click('[data-act=fax][data-a=yog][data-o=kop]'); await p.waitForTimeout(400);
  const oshKop = await p.locator('#orCard .sl-or-b.main b').count() ? await txt(p, '#orCard .sl-or-b.main b') : ''; assert.ok(!/Tovuqli osh/.test(oshKop), '«go\'sht ko\'p, yog\' ko\'p» oshga tovuqli osh taklif qilinmaydi (oqsil −)'); await p.context().close();
  log('Karta yo\'q: olma, tahrirlash oynasi, sozlama o\'chiq; qoidaga javob bermaydigan kombinatsiya (go\'sht ko\'p) oshga tovuqli osh chiqmaydi');
  /* 4. Profil: «O'rinbosar takliflari» o'chirish/yoqish */
  p = await mk(seed()); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(300); assert.ok(await p.locator('[data-act=ortog][data-v="1"][aria-pressed=true], [data-act=ortog][data-v="1"].on').count() >= 1, 'standart: yoqilgan');
  await p.click('[data-act=ortog][data-v="0"]'); await p.waitForTimeout(250); assert.equal((await stOf(p)).prefs.orin, false); await p.click('[data-act=ortog][data-v="1"]'); await p.waitForTimeout(250); assert.equal((await stOf(p)).prefs.orin, true);
  await p.click('[data-act=ortog][data-v="0"]'); await p.waitForTimeout(250); await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(250); await pick(p, 'osh'); assert.equal(await p.locator('#orCard').count(), 0); await p.context().close();
  log('Profil → «O\'rinbosar takliflari»: standart yoqilgan, o\'chirsa karta chiqmaydi, qayta yoqsa saqlanadi');
  /* 5. 360 px + katta shrift + klaviatura balandligi (past ekran) */
  p = await mk(seed(), 360, 420); await p.evaluate(() => document.documentElement.classList.add('fs-big')); await pick(p, 'osh'); await p.waitForSelector('#orCard'); await noX(p);
  const fits = await p.evaluate(() => { const c = document.getElementById('orCard').getBoundingClientRect(), s = document.getElementById('fsave').getBoundingClientRect(); return { cardOverCta: c.bottom > s.top + 1 && c.top < s.bottom - 1, ctaVisible: s.bottom <= window.innerHeight + 1 }; });
  assert.equal(fits.cardOverCta, false, 'karta CTA ni to\'smaydi'); assert.ok(fits.ctaVisible, 'CTA ko\'rinadi (420 px balandlik, katta shrift)'); await p.context().close();
  log('360×420 (klaviatura ochiq holatiga yaqin) va katta shrift: karta CTA ni to\'smaydi, gorizontal skroll yo\'q');
  /* 6. Oqsil manbalari — Natijalar: 3 kundan kam bo'lsa ko'rsatma; to'liq bo'lsa chiziq + faktik gap (UZ/RU) */
  const wk = []; for (let i = 0; i < 5; i++) { wk.push([-i, E('qoy-gosht', 25, 290)]); wk.push([-i, E('tovuq-kokrak', 30, 150)]); } wk.push([-1, E('losos', 22, 205)]);
  p = await mk(seed([[0, E('osh', 5, 190)]])); await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(600); assert.match(await txt(p, '.sl-orb'), /3 kun yozgandan keyin/); await p.context().close();
  p = await mk(seed(wk)); await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(800); const blk = await txt(p, '.sl-orb'); assert.match(blk, /Oqsil manbalari/); assert.match(blk, /Bu hafta oqsilning \d+% i .+dan\. Baliq 1 marta\./); assert.equal(await p.locator('.sl-orb .orb-bar i').count(), 3, 'qizil, tovuq, baliq'); assert.equal(await p.locator('.sl-orb .orb-leg li').count(), 5);
  const pcs = (await p.locator('.sl-orb .orb-leg li b').allInnerTexts()).map((x) => num(x)); assert.ok(Math.abs(pcs.reduce((a, c) => a + c, 0) - 100) <= 2, 'foizlar ~100: ' + pcs); assert.ok(!/qizil go'sht.*(zararli|yomon)/i.test(blk)); await noX(p);
  const ar = await p.locator('.sl-orb .orb-bar').getAttribute('aria-label'); assert.match(ar, /Qizil go'sht \d+%/); log('Natijalar: «' + blk.replace(/\n+/g, ' | ').slice(0, 170) + '»; chiziq 3 bo\'lak, legenda 5 ta (foizlar ' + pcs.join('/') + '), aria-label bor');
  await p.goto(BASE + '/ru/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(600); await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(800); const ru = await txt(p, '.sl-orb'); assert.match(ru, /Источники белка/); assert.match(ru, /На этой неделе \d+% белка — из .+\. Рыба: 1 раз\./); assert.ok(!/[A-Za-z]{4,}/.test(ru.replace(/KalkiFit/g, '')), 'RU matnda lotincha so\'z yo\'q: ' + ru); await p.context().close();
  log('RU: «' + ru.replace(/\n+/g, ' | ').slice(0, 150) + '»');
  /* 7. Kun yakuni: «Kunni yakunlash» dan keyin shu blok */
  p = await mk(seed(wk)); await p.waitForSelector('#dayEnd'); await p.click('#dayEnd'); await p.waitForTimeout(700); assert.ok(await p.locator('#dayEndDone').count() >= 1); assert.ok(await p.locator('.sl-orb').count() >= 1, 'Kun yakunida blok bor'); assert.match(await txt(p, '.sl-orb'), /Baliq 1 marta/); await p.context().close();
  p = await mk(seed(wk)); await p.waitForSelector('#dayEnd'); assert.equal(await p.locator('.sl-orb').count(), 0, 'kun yopilmaguncha Bugun ekrani uzaymaydi'); await p.context().close();
  log('Kun yakuni: «Kunni yakunlash» dan keyingina blok chiqadi (Bugun ekrani yangi doimiy karta bilan uzaymaydi)');
  /* 8. hazil: baliq yozilganda va almashtirish tanlanganda (hazil yoqilgan) */
  p = await mk(seed([[0, E('mol-gosht', 20, 200)]], { prefs: { jokes: true } })); await p.waitForTimeout(600); await pick(p, 'losos'); await p.click('#fsave'); await p.waitForTimeout(700);
  const G = await p.evaluate(() => window.KalkiFitGaplar.pickTexts('uz', 'food_fish')); const line = await txt(p, '#jLine').catch(() => ''); assert.ok(G.length >= 5 && G.includes(line), 'baliq hazili: ' + line); await p.context().close();
  p = await mk(seed([], { prefs: { jokes: true } })); await p.waitForTimeout(600); await pick(p, 'osh'); await p.click('#orCard .sl-or-b.main'); await p.waitForTimeout(500); await p.click('#fsave'); await p.waitForTimeout(700);
  const A = await p.evaluate(() => window.KalkiFitGaplar.pickTexts('uz', 'alt_chosen')); const line2 = await txt(p, '#jLine').catch(() => ''); assert.ok(A.includes(line2), 'almashtirish hazili: ' + line2); await p.context().close();
  log('Hazil: baliq yozilganda «food_fish» matni, o\'rinbosar tanlanib saqlanganda «alt_chosen» matni Bugun qatorida');
  assert.ok(true);
} finally { await b.close().catch(() => {}); srv.close(); }
console.log('\nHAMMASI OK (' + n + ' blok)');
