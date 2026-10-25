// KalkiFit v45 — «Nima yedingiz?» ro'yxatlarida qatorni (nom, rasm, bo'sh joy) bosish ishlaydi, faqat [+] emas.
// Sabab edi: «Yaqinda yeganlaringiz»da fid'siz yozuv (AI/rasm/matn — Lotus Biscoff) qatori `disabled` edi. Endi qator [+] bilan bir xil (xuddi o'sha porsiya qo'shiladi), bazadagi taomda — porsiya oynasi.
// Tekshiruv: Yaqinda (rasmli, ikonkali, kasr porsiyali, fid'siz, bazadan o'chgan), Qidiruv natijalari, Odatdagi, Mening taomlarim — hech bir qator `disabled` emas, balandligi ≥ 48 px, nomiga/rasmiga/o'ng chetiga bosish ishlaydi.
//   node tools/dizayn/test-qator-bosish.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), D = S.dates, TODAY = D.today();
const DB = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods, UY = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/uyda.json'), 'utf8'));
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const nb = (x) => x.replace(/ /g, ' ');
function seed() {
  const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 86400000; st.prefs = { tipsDone: true, lpTip: 1, suvFrom: TODAY, jokes: false }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = D.addDays(TODAY, -8); S.addWeight(st, TODAY, 80);
  const Y = D.addDays(TODAY, -1), A = (e) => S.addFood(st, Y, Object.assign({ ts: 1, est: false, p: 5, f: 5, c: 20, meal: 'b' }, e));
  const veg = DB.find((f) => f.t === 'v' && !f.h);
  A({ fid: 'osh', unit: 'kosa', qty: 1, g: 300, kcal: 600 });
  A({ fid: 'non', unit: 'dona', qty: 0.5, g: 40, kcal: 100 });
  A({ fid: veg.id, unit: 'g100', qty: 150, g: 150, kcal: 50 });
  A({ fid: null, name: 'Lotus Biscoff pechenye', pt: '1,5 porsiya', unit: null, qty: 1.5, g: 24, kcal: 117, est: true, ifid: 'pechenye' });
  A({ fid: null, name: 'Uy lag\'moni', unit: null, qty: 1, g: 300, kcal: 420, est: true });
  A({ fid: 'yoq-taom-xyz', unit: 'dona', qty: 1, g: 100, kcal: 90 });
  const cf = S.addCustom(st, { name: 'Mening somsam', k: 300, p: 10, f: 12, c: 30, g: 90 }); A({ fid: cf.id, unit: 'porsiya', qty: 1, g: 90, kcal: 270 });
  S.addTemplate(st, 'Uy nonushtasi', [{ fid: 'tuxum', unit: 'dona', qty: 2, g: 100, kcal: 155 }], 'b');
  return st;
}
async function open(st, o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: o.th || 'light' });
  await c.addInitScript((s) => { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(s)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); }, st);
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(BASE + (o.url || '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(900); p.cdp = await c.newCDPSession(p); return p;
}
const stOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')));
try {
  const p = await open(seed());
  await p.click('#mainAdd'); await p.waitForSelector('#rzSheet .sl-rw', { timeout: 8000 }); await p.waitForTimeout(700);
  const rows = await p.evaluate(() => [...document.querySelectorAll('#rzSheet .sl-rw')].map((w, i) => { const r = w.querySelector('.sl-rr'), q = r.getBoundingClientRect(); return { i, nm: w.querySelector('.nm').textContent.trim(), dis: r.disabled, h: Math.round(q.height), plus: w.querySelector('.sl-pl').getAttribute('data-act') }; }));
  assert.ok(rows.length >= 6, 'Yaqinda qatorlari: ' + JSON.stringify(rows));
  for (const r of rows) { assert.equal(r.dis, false, r.nm + ': qator disabled emas'); assert.ok(r.h >= 48, r.nm + ': balandlik ≥ 48 px (' + r.h + ')'); }
  assert.ok(rows.some((r) => /Lotus/.test(r.nm)) && rows.some((r) => /lag'moni/.test(r.nm)) && rows.some((r) => /Mening somsam/.test(r.nm)), 'fid\'siz va o\'z taomi qatorlari bor');
  ok('Yaqinda: ' + rows.length + ' qator — hech biri disabled emas, balandlik ≥ 48 px (' + rows.map((r) => r.nm.slice(0, 14)).join(', ') + ')');
  /* har qator turini 3 joyidan bosamiz: nomi, rasmi, nom ostidagi bo'sh joy. Natija: [+] ✓ bo'ladi YOKI porsiya oynasi ochiladi */
    for (let i = 0; i < rows.length; i++) {
    for (const where of ['nm', 'tile', 'edge']) {
      await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); await p.click('#mainAdd'); await p.waitForSelector('#rzSheet .sl-rw'); await p.waitForTimeout(500);
      const w = p.locator('#rzSheet .sl-rw').nth(i), name = (await w.locator('.nm').innerText()).trim();
      const sel = where === 'nm' ? '.nm' : where === 'tile' ? '.sl-tile' : '.sl-rr';
      const box = await w.locator(sel).first().boundingBox(), rr = await w.locator('.sl-rr').boundingBox(), pl = await w.locator('.sl-pl').boundingBox();
      const x = where === 'edge' ? Math.max(rr.x + 4, Math.min(pl.x - 8, rr.x + rr.width - 6)) : box.x + Math.min(box.width / 2, 40), y = rr.y + rr.height / 2;
      const before = await p.evaluate(() => document.querySelectorAll('#rzSheet .sl-pl.done').length);
      await p.touchscreen.tap(x, y); await p.waitForTimeout(650);
      const after = await p.evaluate(() => ({ done: document.querySelectorAll('#rzSheet .sl-pl.done').length, por: !!document.querySelector('#rzSheet #fdQu, #rzSheet #fdKcal, #rzSheet .pw, #rzSheet [data-act=tplchk]'), toast: !document.getElementById('rzToast').hidden }));
      assert.ok(after.done > before || after.por || after.toast, name + ' (' + where + '): bosish hech narsa qilmadi ' + JSON.stringify(after));
    }
  }
  ok('Yaqinda: har qator (rasmli, ikonkali, 0,5/1,5 porsiya, fid\'siz, bazadan o\'chgan, o\'z taomi) nomi, rasmi va bo\'sh joyidan bosilganda ishlaydi');
  /* Lotus: qator = [+] (porsiya 1,5 saqlanadi, nom toza) */
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); await p.click('#mainAdd'); await p.waitForSelector('#rzSheet .sl-rw'); await p.waitForTimeout(500);
  const cnt0 = ((await stOf(p)).days[TODAY] || { food: [] }).food.filter((e) => /Lotus/.test(e.name || '')).length; const li = rows.findIndex((r) => /Lotus/.test(r.nm)); await p.locator('#rzSheet .sl-rw').nth(li).locator('.nm').tap(); await p.waitForTimeout(600);
  const s1 = await stOf(p), tf = (s1.days[TODAY] || { food: [] }).food.filter((e) => /Lotus/.test(e.name || ''));
  assert.equal(tf.length, cnt0 + 1, 'Lotus bugunga bir marta qo\'shildi'); const lt = tf[tf.length - 1]; assert.equal(lt.name, 'Lotus Biscoff pechenye'); assert.equal(lt.pt, '1,5 porsiya'); assert.equal(lt.qty, 1.5);
  ok('Lotus Biscoff: qatorni bosish = [+] — bugunga bir marta qo\'shildi, nom toza, «1,5 porsiya» alohida');
  /* Qidiruv natijalari */
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); await p.fill('#fdQ', 'osh'); await p.waitForTimeout(700);
  const sr = await p.evaluate(() => [...document.querySelectorAll('#rzSheet .sl-rw')].map((w) => ({ dis: w.querySelector('.sl-rr').disabled, h: Math.round(w.querySelector('.sl-rr').getBoundingClientRect().height) })));
  assert.ok(sr.length >= 3 && sr.every((r) => !r.dis && r.h >= 48), 'Qidiruv natijalari: ' + JSON.stringify(sr));
  await p.locator('#rzSheet .sl-rw').nth(0).locator('.nm').tap(); await p.waitForTimeout(700); assert.ok(await p.locator('#rzSheet #fdQu, #rzSheet #fdKcal, #rzSheet .pw').count() > 0 || await p.locator('#rzSheet .sl-pl.done').count() > 0, 'qidiruv: nomni bosish porsiya oynasini ochadi');
  ok('Qidiruv natijalari: ' + sr.length + ' qator, hammasi bosiladi (≥ 48 px), nomi → porsiya oynasi');
  /* Odatdagi (to'plam) va Mening taomlarim (Imkoniyatlar) */
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); await p.click('#mainAdd'); await p.waitForSelector('#rzSheet .sl-rw'); await p.waitForTimeout(500);
  const ti = await p.evaluate(() => { const w = [...document.querySelectorAll('#rzSheet .sl-rw')].find((x) => /Uy nonushtasi/.test(x.textContent)); return w ? [...document.querySelectorAll('#rzSheet .sl-rw')].indexOf(w) : -1; }); assert.ok(ti >= 0, 'Odatdagi qatori bor');
  await p.locator('#rzSheet .sl-rw').nth(ti).locator('.nm').tap(); await p.waitForTimeout(600); assert.ok(await p.locator('#rzSheet [data-act=tplchk]').count() > 0, 'Odatdagi: qator = ro\'yxat ochiladi');
  ok('Odatdagi: qatorni bosish — tarkib ro\'yxati ochiladi');
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  const bad = await p.evaluate(async () => { const out = []; document.querySelectorAll('.rz-main button:disabled').forEach((x) => out.push(x.textContent.trim().slice(0, 30))); return out; });
  assert.deepEqual(bad.filter((t) => /Lotus|osh|Non|somsa/i.test(t)), [], 'Bugun ekranida disabled taom tugmasi yo\'q');
  ok('Bugun: taom qatorlari disabled emas');
  assert.deepEqual(p.errs, [], 'sahifa xatolari');
  await p.context().close();
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
