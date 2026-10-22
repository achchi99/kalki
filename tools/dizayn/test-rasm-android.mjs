// Android ilovasida «Rasm bilan qo'shish»: native PROMPT oynasi ishlatilmaydi — sayt o'z tanlov oynasini ko'rsatadi (Galereyadan / Rasmga olish / Fayllardan);
// @capacitor/camera (soxta) source=PHOTOS|CAMERA bilan chaqiriladi; galereyadan rasm → AI oynasi; kamera ruxsati rad → matn (UZ/RU/ЎЗ) va galereya hamon ishlaydi; galereya xatosi → fayl tanlash zaxirasi;
// vebda (Capacitor yo'q) — avvalgidek fayl tanlash.   node tools/dizayn/test-rasm-android.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const S = (await import(ROOT + '/assets/kalkifit-core.js')).default;
function seed() { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 864e5; st.prefs = { tipsDone: true, jokes: false, yemayK: 1, introDone: true }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; return st; }
let JPG64; { const c = await b.newContext({ viewport: { width: 64, height: 64 } }); const pg = await c.newPage(); await pg.setContent('<body style="margin:0;background:#8a4a2a"></body>'); JPG64 = (await pg.screenshot({ type: 'jpeg' })).toString('base64'); await c.close(); }
/* o.cap: null (veb) | { photos: 'ok'|'xato'|'bekor', camera: 'ok'|'ruxsat'|'bekor' } */
async function mk(o = {}) {
  const c = await b.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((a) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(a.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_lang', a.lang || 'uz'); } } catch (e) {}
    if (!a.cap) return; const q = window.__cap = { calls: [] };
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: [{ name: 'Camera' }],
      nativePromise: (pl, m, opt) => { q.calls.push(pl + '.' + m + ':' + (opt && opt.source)); if (pl !== 'Camera' || m !== 'getPhoto') return Promise.reject(new Error('yo\'q'));
        const mode = opt.source === 'CAMERA' ? a.cap.camera : a.cap.photos; if (mode === 'ok') return Promise.resolve({ dataUrl: 'data:image/jpeg;base64,' + a.jpg, format: 'jpeg' });
        if (mode === 'ruxsat') return Promise.reject(new Error('User denied access to camera')); if (mode === 'bekor') return Promise.reject(new Error('User cancelled photos app')); return Promise.reject(new Error('Unable to resolve photo activity')); } }; }, { st: seed(), cap: o.cap || null, lang: o.lang, jpg: JPG64 });
  const p = await c.newPage(); p.errs = []; p.rasm = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/kalkifit-rasm', (r) => { p.rasm.push(JSON.parse(r.request().postData() || '{}')); r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ovqatlar: [{ nom: 'Qovurilgan jigar', ehtimol: 0.6, boshqa: [{ nom: 'Jigar kabob', ehtimol: 0.3 }], porsiya: '1 porsiya', g: 200, kcal: 460, o: 40, y: 25, u: 20 }], aniqlik: '±30%', limit: 5, qoldi: 4 }) }); });
  await p.route('**/api/retsept', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ limit: 5, qoldi: 5 }) })); await p.route(/\/api\/(?!kalkifit-rasm|retsept)/, (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + (o.url || '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(600); return p; }
const cam = async (p) => { await p.click('#mainAdd'); await p.waitForTimeout(300); await p.click('#phBtn'); await p.waitForTimeout(400); };
const calls = (p) => p.evaluate(() => window.__cap.calls.slice());
try {
  /* 1. Android: «Rasm» tugmasi native oynani chaqirmaydi — sayt oynasi 3 tugma bilan */
  let p = await mk({ cap: { photos: 'ok', camera: 'ok' } }); await cam(p); assert.deepEqual(await calls(p), [], 'bosilganda native chaqiruv YO\'Q (PROMPT ishlatilmaydi)');
  const t = (await p.locator('#rzSheet').innerText()).replace(/\s+/g, ' '); assert.match(t, /Galereyadan/); assert.match(t, /Rasmga olish/); assert.match(t, /Fayllardan/); assert.equal(await p.locator('#rzSheet [data-act=fphotog]').count(), 1);
  assert.ok((await p.locator('#rzSheet .sl-phc .rz-btn').evaluateAll((a) => a.map((x) => x.getBoundingClientRect().height))).every((h) => h >= 44), 'katta tugmalar');
  log('Android: «Rasm» → o\'z tanlov oynamiz (Galereyadan · Rasmga olish · Fayllardan), native PROMPT chaqirilmaydi, tugmalar ≥44 px');
  /* 2. galereya → AI oynasi */
  await p.click('[data-act=fphotog]'); await p.waitForSelector('[data-act=txsave]', { timeout: 8000 }); assert.deepEqual(await calls(p), ['Camera.getPhoto:PHOTOS']); assert.equal(p.rasm.length, 1); assert.ok(p.rasm[0].img.length > 100); assert.match(await p.locator('#rzSheet').innerText(), /Qovurilgan jigar|Mol jigari/);
  log('Galereyadan rasm (source=PHOTOS) → AI so\'rovi → natija oynasi'); await p.context().close();
  /* 3. kamera → AI */
  p = await mk({ cap: { photos: 'ok', camera: 'ok' } }); await cam(p); await p.click('[data-act=fphotoc]'); await p.waitForSelector('[data-act=txsave]', { timeout: 8000 }); assert.deepEqual(await calls(p), ['Camera.getPhoto:CAMERA']); await p.context().close();
  log('Kameradan rasm (source=CAMERA) → AI so\'rovi → natija oynasi');
  /* 4. kamera ruxsati rad: matn (UZ/RU/ЎЗ), galereya hamon ishlaydi */
  for (const [lang, url, re] of [['uz', '/kalkifit', /Kameraga ruxsat berilmadi/], ['ru', '/ru/kalkifit', /Нет доступа к камере/], ['cyr', '/kalkifit?lang=cyr', /Камерага рухсат берилмади/]]) {
    p = await mk({ cap: { photos: 'ok', camera: 'ruxsat' }, lang, url }); await cam(p); await p.click('[data-act=fphotoc]'); await p.waitForTimeout(500); assert.match(await p.locator('#rzSheet').innerText(), re, lang); assert.equal(await p.locator('[data-act=fphotog]').count(), 1, 'galereya tugmasi turibdi');
    await p.click('[data-act=fphotog]'); await p.waitForSelector('[data-act=txsave]', { timeout: 8000 }); assert.deepEqual(await calls(p), ['Camera.getPhoto:CAMERA', 'Camera.getPhoto:PHOTOS']); assert.deepEqual(p.errs, []); await p.context().close(); }
  log('Kamera ruxsati rad: «Kameraga ruxsat berilmadi…» UZ/ЎЗ/RU, tanlov oynasi va galereya ishlaydi');
  /* 5. bekor qilish — xabarsiz; galereya xatosi — fayl tanlash zaxirasi */
  p = await mk({ cap: { photos: 'bekor', camera: 'bekor' } }); await cam(p); await p.click('[data-act=fphotoc]'); await p.waitForTimeout(400); assert.equal(await p.locator('.rz-p.warn').count(), 0, 'bekor — xabar yo\'q'); assert.equal(await p.locator('[data-act=fphotog]').count(), 1); await p.context().close();
  p = await mk({ cap: { photos: 'xato', camera: 'ok' } }); await cam(p); const fc = p.waitForEvent('filechooser', { timeout: 4000 }); await p.click('[data-act=fphotog]'); const ch = await fc; assert.ok(ch.isMultiple() === false); await ch.setFiles({ name: 'r.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(JPG64, 'base64') });
  await p.waitForSelector('[data-act=txsave]', { timeout: 8000 }); assert.equal(p.rasm.length, 1); await p.context().close();
  p = await mk({ cap: { photos: 'ok', camera: 'ok' } }); await cam(p); const fc2 = p.waitForEvent('filechooser', { timeout: 4000 }); await p.click('[data-act=fphotof]'); await (await fc2).setFiles({ name: 'r.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(JPG64, 'base64') }); await p.waitForSelector('[data-act=txsave]', { timeout: 8000 }); await p.context().close();
  log('Bekor qilish — xabarsiz; galereya xatosi → WebView fayl tanlovi zaxirada; «Fayllardan» tugmasi ham ishlaydi');
  /* 6. veb (Capacitor yo'q): avvalgidek — kamera tugmasi bevosita fayl tanlashni ochadi */
  p = await mk({ cap: null }); await p.click('#mainAdd'); await p.waitForTimeout(300); const fc3 = p.waitForEvent('filechooser', { timeout: 4000 }); await p.click('#phBtn'); await (await fc3).setFiles({ name: 'r.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(JPG64, 'base64') }); await p.waitForSelector('[data-act=txsave]', { timeout: 8000 }); assert.deepEqual(p.errs, []); await p.context().close();
  log('Veb: kamera tugmasi avvalgidek fayl tanlashni ochadi, tanlov oynasi chiqmaydi');
  console.log('\nAndroid rasm tanlash: ' + n + ' tekshiruv OK');
} finally { await b.close().catch(() => {}); srv.close(); }
