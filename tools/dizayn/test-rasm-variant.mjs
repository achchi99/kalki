// KalkiFit «Rasm orqali qo'shish»: AI 2–3 variant (ehtimol bo'yicha) → asosiysi + «Bu emasmi?» chiplari, bir bosishda almashtirish, nom yozib bazadan qidirish; kkal BAZADAN (bazada yo'q — AI «±30%»);
// umumiy AI limiti matni (UZ/ЎЗ/RU); qidiruvda topilmagan so'z hisoblagichi.   node tools/dizayn/test-rasm-variant.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const S = (await import(ROOT + '/assets/kalkifit-core.js')).default; const D = S.dates;
const dstr = (o) => { const d = new Date(); d.setDate(d.getDate() + o); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const TODAY = dstr(0), YDAY = dstr(-1);
function seed() { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 864e5; st.prefs = { tipsDone: true, jokes: false, yemayK: 1, introDone: true }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = D.addDays(TODAY, -8); S.addWeight(st, TODAY, 80); return st; }
/* o.rasm: (body, nth) → { status, json }; o.android — Capacitor soxta (platforma belgisi) */
async function mk(o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((a) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(a.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_lang', a.lang || 'uz'); } } catch (e) {}
    if (a.android) window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: [], nativePromise: () => Promise.reject(new Error('yo\'q')) }; }, { st: seed(), lang: o.lang, android: !!o.android });
  const p = await c.newPage(); p.errs = []; p.rasm = []; p.peek = []; p.qt = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/kalkifit-rasm', (r) => { const bd = JSON.parse(r.request().postData() || '{}'); p.rasm.push(bd); const x = o.rasm(bd, p.rasm.length); r.fulfill({ status: x.status, contentType: 'application/json', body: JSON.stringify(x.json) }); });
  await p.route('**/api/retsept', (r) => { const bd = JSON.parse(r.request().postData() || '{}'); p.peek.push(bd); r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o.peek ? o.peek(bd) : { limit: 5, qoldi: 5 }) }); });
  await p.route('**/api/qidiruv', (r) => { p.qt.push(JSON.parse(r.request().postData() || '{}')); r.fulfill({ status: 204, body: '' }); });
  await p.route(/\/api\/(?!kalkifit-rasm|retsept|qidiruv)/, (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + (o.url || '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(600); return p; }
const JIGAR = { status: 200, json: { ovqatlar: [{ nom: 'Qovurilgan jigar', ehtimol: 0.62, boshqa: [{ nom: 'Jigar kabob', ehtimol: 0.25 }, { nom: "Go'sht (aniq emas)", ehtimol: 0.13 }], porsiya: '1 porsiya', g: 200, kcal: 460, o: 40, y: 25, u: 20 }, { nom: 'Zzzyx taom', ehtimol: 0.9, boshqa: [], porsiya: '1 dona', g: 100, kcal: 250, o: 5, y: 10, u: 35 }], aniqlik: '±30%', limit: 2, qoldi: 1 } };
let JPG;
async function photo(p) { await p.click('#mainAdd').then(() => p.click('#rzSheet [data-fk=yozish]')); await p.waitForTimeout(300); await p.setInputFiles('#phIn', { name: 'ovqat.jpg', mimeType: 'image/jpeg', buffer: JPG }); await p.waitForSelector('[data-act=txsave]', { timeout: 8000 }); await p.waitForTimeout(300); }
const rows = (p) => p.evaluate(() => [...document.querySelectorAll('#rzSheet .sl-ti')].map((x) => x.innerText.replace(/\s+/g, ' ').trim()));
try {
  { const c = await b.newContext({ viewport: { width: 64, height: 64 } }); const pg = await c.newPage(); await pg.setContent('<body style="margin:0;background:#a33"></body>'); JPG = await pg.screenshot({ type: 'jpeg' }); await c.close(); }
  /* 1. 3 variant: asosiysi + «Bu emasmi?» chiplari; kkal bazadan (mol jigari qovurilgan 175 kkal/100 g × 200 g = 350), bazada yo'q — AI «±30%» */
  let p = await mk({ android: true, rasm: () => JIGAR, peek: () => ({ limit: 2, qoldi: 2 }) }); await photo(p);
  assert.equal(p.rasm[0].platforma, 'android', 'platforma belgisi'); let r = await rows(p);
  assert.match(r[0], /Mol jigari \(qovurilgan\)/); assert.match(r[0], /bazadan/); assert.match(r[0], /350/, 'kkal bazadan: ' + r[0]); assert.doesNotMatch(r[0], /460/);
  assert.match(r[1], /Zzzyx taom/); assert.match(r[1], /±30%/); assert.match(r[1], /250/);
  const chips = await p.locator('#rzSheet .sl-alt').first().innerText(); assert.match(chips, /Bu emasmi\?/); assert.match(chips, /Jigar kabob/); assert.match(chips, /Go'sht \(aniq emas\)/); assert.match(chips, /Boshqasini qidirish/);
  assert.match(await p.locator('#phAiLeft').innerText(), /2 tadan 1 ta qoldi/, 'hisoblagich (umumiy)');
  log('Rasm: asosiy variant + «Bu emasmi?» (Jigar kabob, Go\'sht (aniq emas)) + «Boshqasini qidirish»; kkal BAZADAN (mol jigari qovurilgan, 200 g → 350 kkal, AI 460 emas), bazada yo\'q taom — AI «±30%»; Android belgisi, hisoblagich');
  /* 2. bir bosishda almashtirish */
  await p.click('#rzSheet .sl-alt [data-act=phalt][data-k="0"] >> nth=0'); await p.waitForTimeout(300); r = await rows(p); assert.match(r[0], /Jigar kabob/i); assert.match(r[0], /bazadan/);
  const ch2 = await p.locator('#rzSheet .sl-alt').first().innerText(); assert.match(ch2, /Qovurilgan jigar/, 'oldingi asosiy — endi variantda');
  log('Bir bosishda almashtirish: «Jigar kabob» → bazadagi jigar kabob (kkal bazadan), oldingi asosiysi variantlarga o\'tdi');
  /* 3. nomni yozib bazadan qidirish */
  await p.click('#rzSheet [data-act=phfind] >> nth=0'); await p.waitForSelector('#phFq'); await p.fill('#phFq', 'buyrak'); await p.waitForTimeout(250);
  assert.ok(await p.locator('#phFl [data-act=phpick]').count() >= 1); await p.click('#phFl [data-act=phpick] >> nth=0'); await p.waitForSelector('[data-act=txsave]'); r = await rows(p); assert.match(r[0], /buyrag/i); assert.match(r[0], /bazadan/);
  await p.click('[data-act=txsave]'); await p.waitForTimeout(500); const day = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('kalki_fit')); return Object.values(s.days).flatMap((d) => d.food); }); assert.ok(day.some((e) => /buyrak/.test(e.fid || '')), 'saqlandi (bazadagi taom): ' + JSON.stringify(day.map((e) => e.fid))); assert.deepEqual(p.errs, []); await p.context().close();
  log('«Boshqasini qidirish»: nom yozib bazadan tanlash (buyrak) → kkal bazadan, saqlanadi');
  /* 4. limit: rasm 429 → umumiy matn (UZ/RU), qo'lda qo'shish va qidiruv ishlaydi */
  for (const [lang, url, re] of [['uz', '/kalkifit', /Bugungi 2 ta AI so'rov ishlatildi\. Ertaga yana urinib ko'ring\./], ['ru', '/ru/kalkifit', /Сегодняшние AI-запросы \(2\) использованы/], ['cyr', '/kalkifit?lang=cyr', /Бугунги 2 та AI сўров ишлатилди/]]) {
    p = await mk({ android: true, lang, url, rasm: () => ({ status: 429, json: { xato: 'x', sabab: 'mijoz', limit: 2, qoldi: 0 } }), peek: () => ({ limit: 2, qoldi: 0 }) });
    await p.click('#mainAdd').then(() => p.click('#rzSheet [data-fk=yozish]')); await p.waitForTimeout(300); await p.setInputFiles('#phIn', { name: 'o.jpg', mimeType: 'image/jpeg', buffer: JPG }); await p.waitForTimeout(1500);
    assert.match(await p.locator('#rzSheet').innerText(), re, lang); await p.click('#rzSheet [data-act=fback]').catch(() => {}); await p.waitForTimeout(300); assert.deepEqual(p.errs, []); await p.context().close(); }
  log('Limit (rasm 429): «Bugungi 2 ta AI so\'rov ishlatildi…» UZ/ЎЗ/RU — retsept oynasi bilan bir xil matn');
  /* 5. qidiruvda topilmagan so'z — anonim hisoblagich (faqat so'z + kun) */
  p = await mk({ rasm: () => JIGAR }); await p.click('#mainAdd').then(() => p.click('#rzSheet [data-fk=yozish]')); await p.waitForTimeout(300); const inp = p.locator('#rzSheet input[type=search], #rzSheet #fdQ').first(); await inp.fill('qwzxyv taomi'); await p.waitForTimeout(3200);
  assert.equal(p.qt.length, 1, 'bitta yuborish'); assert.equal(p.qt[0].k.length, 1); assert.equal(p.qt[0].k[0].q, 'qwzxyv taomi'); assert.deepEqual(Object.keys(p.qt[0].k[0]).sort(), ['n', 'q', 's']);
  await inp.fill(''); await inp.fill('qwzxyv taomi'); await p.waitForTimeout(3000); assert.equal(p.qt.length, 1, 'bir kunda bir so\'z bir marta');
  await inp.fill('+998901234567'); await p.waitForTimeout(3000); assert.equal(p.qt.length, 1, 'telefon raqami yuborilmaydi'); await inp.fill('osh'); await p.waitForTimeout(3000); assert.equal(p.qt.length, 1, 'topilgan so\'z yuborilmaydi'); await p.context().close();
  log('Topilmagan so\'z: yozib to\'xtagandan keyin bir marta yuboriladi (faqat so\'z + kun + son); takror, telefon raqami, topilgan so\'z — yuborilmaydi');
  console.log('\nRasm variantlari va qidiruv hisoblagichi: ' + n + ' tekshiruv OK');
} finally { await b.close().catch(() => {}); srv.close(); }
