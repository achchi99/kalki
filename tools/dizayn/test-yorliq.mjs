// KalkiFit v67 «Yorliqdan qo'shish» (brauzer, soxta AI javobi): topilmadi kartasi + bir martalik maslahat, bo'sh qidiruvdagi havola, Imkoniyatlar;
// surat → AI raqamlari → tasdiqlash varag'i → «Mening taomlarim» (qidiruvda birinchi, «meniki», Manba — yorliq); 4/9/4 ogohlantirishi; qo'lda kiritish;
// anonim taklif — ruxsat BIR marta, yuboriladi faqat nom + raqamlar (rasm emas); limit va «o'qilmadi» xatolari; tarmoq taomi — «taxminiy» belgisi va Manba;
// 360 px + katta shrift (fs-big) — varaq sig'adi; UZ/ЎЗ/RU.   node tools/dizayn/test-yorliq.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const S = (await import(ROOT + '/assets/kalkifit-core.js')).default; const D = S.dates;
const dstr = (o) => { const d = new Date(); d.setDate(d.getDate() + o); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const TODAY = dstr(0);
function seed(prefs) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 864e5; st.prefs = Object.assign({ tipsDone: true, jokes: false, yemayK: 1, introDone: true }, prefs || {}); st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = D.addDays(TODAY, -8); S.addWeight(st, TODAY, 80); return st; }
const LABEL = { status: 200, json: { yorliq: { nom: 'Musaffo qatiq 2,5%', kcal: 53, o: 2.9, y: 2.5, u: 4.7, qadoq: 450, birlik: 'g' }, limit: 5, qoldi: 3 } };
async function mk(o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((a) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(a.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_lang', a.lang || 'uz'); if (a.big) localStorage.setItem('kalki_fs', 'big'); } } catch (e) {} }, { st: seed(o.prefs), lang: o.lang, big: !!o.big });
  const p = await c.newPage(); p.errs = []; p.rasm = []; p.yq = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/kalkifit-rasm', (r) => { const bd = JSON.parse(r.request().postData() || '{}'); p.rasm.push(bd); const x = (o.rasm || (() => LABEL))(bd, p.rasm.length); r.fulfill({ status: x.status, contentType: 'application/json', body: JSON.stringify(x.json) }); });
  await p.route('**/api/kalkifit-yorliq', (r) => { if (r.request().method() === 'POST') { p.yq.push(r.request().postData() || ''); return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); } r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ v: 1, taomlar: o.umumiy || [] }) }); });
  await p.route('**/api/retsept', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ limit: 5, qoldi: 4 }) }));
  await p.route(/\/api\/(?!kalkifit-rasm|kalkifit-yorliq|retsept)/, (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(600); return p;
}
const stOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')));
const sheet = (p) => p.locator('#rzSheet').innerText();
async function search(p, q) { if (!(await p.locator('#rzSheet #fdQ').count())) { await p.click('#mainAdd'); await p.waitForTimeout(300); } await p.fill('#fdQ', q); await p.waitForTimeout(350); }
let JPG;
try {
  { const c = await b.newContext({ viewport: { width: 64, height: 64 } }); const pg = await c.newPage(); await pg.setContent('<body style="margin:0;background:#eee"></body>'); JPG = await pg.screenshot({ type: 'jpeg' }); await c.close(); }
  /* 1. topilmadi → karta + «Qo'lda kiritish» + bir martalik maslahat; bo'sh qidiruvda havola */
  let p = await mk();
  await p.click('#mainAdd'); await p.waitForTimeout(300); assert.equal(await p.locator('#rzSheet [data-act=lbphoto].kq-lbl').count(), 1, 'bo\'sh qidiruv: «Qadoqli mahsulot? Yorlig\'idan qo\'shing»');
  await search(p, 'qzxwvj'); let t = await p.locator('#fdRes').innerText();
  assert.match(t, /Topilmadimi\? Qadoq yorlig'ini suratga oling/); assert.match(t, /Qo'lda kiritish/); assert.match(t, /Maslahat: bir marta qo'shgan taomingiz/);
  assert.equal((await stOf(p)).prefs.lbTip, 1); await p.keyboard.press('Escape'); await p.waitForTimeout(400); await search(p, 'qzxwvk'); assert.doesNotMatch(await p.locator('#fdRes').innerText(), /Maslahat:/, 'maslahat bir marta');
  log('Topilmadi: «Topilmadimi? Qadoq yorlig\'ini suratga oling» kartasi, «Qo\'lda kiritish», birinchi marta — maslahat (keyin yo\'q); bo\'sh qidiruvda sokin havola');
  /* 2. surat → AI → varaq → saqlash (+ ruxsat) → porsiya; taklif — faqat nom + raqamlar */
  await p.fill('#fdQ', ''); await p.waitForTimeout(200); await p.click('#rzSheet [data-act=lbphoto].kq-lbl'); await p.waitForTimeout(300);
  t = await sheet(p); assert.match(t, /Yorliqdan qo'shish/); assert.match(t, /Ozuqaviy qiymat/); assert.match(t, /Bugun yana 4 ta surat \(taom rasmi bilan umumiy, 5 tadan\)/);
  await p.setInputFiles('#phIn', { name: 'yorliq.jpg', mimeType: 'image/jpeg', buffer: JPG }); await p.waitForSelector('#cuK', { timeout: 8000 }); await p.waitForTimeout(200);
  assert.equal(p.rasm[0].tur, 'yorliq'); assert.ok(p.rasm[0].img && p.rasm[0].img.length > 100);
  assert.equal(await p.inputValue('#cuName'), 'Musaffo qatiq 2,5%'); assert.equal(await p.inputValue('#cuK'), '53'); assert.equal(await p.inputValue('#cuP'), '2,9'); assert.equal(await p.inputValue('#cuG'), '450');
  assert.match(await sheet(p), /Yorliqdan o'qildi — raqamlarni qadoq bilan solishtirib chiqing/); assert.equal(await p.locator('#lbChk .warn').count(), 0, 'mos raqamlar — ogohlantirish yo\'q');
  assert.equal(await p.locator('[data-act=lbb][data-b="100"][aria-pressed=true]').count(), 1);
  await p.check('#lbShare'); await p.click('[data-act=cusave]'); await p.waitForSelector('#fdName', { timeout: 5000 }); await p.waitForTimeout(400);
  assert.equal(await p.locator('#fdName').innerText(), 'Musaffo qatiq 2,5%');
  let st = await stOf(p); const cf = st.customFoods[0]; assert.equal(cf.src, 'yorliq'); assert.equal(cf.e, 0); assert.equal(cf.k, 53); assert.deepEqual(cf.u, [['qadoq', 450], ['g100', 100]]); assert.equal(st.prefs.lbShare, true); assert.match(cf.ms.u, /Qadoq yorlig'i/);
  await p.waitForTimeout(300); assert.equal(p.yq.length, 1, 'taklif yuborildi'); const body = JSON.parse(p.yq[0]);
  assert.deepEqual(Object.keys(body).sort(), ['birlik', 'g', 'kcal', 'manba', 'mijoz_id', 'nom', 'o', 'til', 'u', 'y']); assert.equal(body.kcal, 53); assert.equal(body.manba, 'rasm'); assert.ok(!/img|base64|\/9j\//.test(p.yq[0]), 'rasm yuborilmaydi');
  await p.click('[data-act=pwsrc]'); await p.waitForTimeout(300); assert.match(await sheet(p), /Qadoq yorlig'i — o'zingiz tasdiqlagan qiymat/); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  log('Surat → AI raqamlari (100 g; tur «yorliq») → tasdiqlash varag\'i to\'ldirildi → saqlandi (e=0, qadoq 450 g, Manba «Qadoq yorlig\'i») → porsiya; taklif: faqat nom + raqamlar, rasm yo\'q');
  /* 3. qidiruvda birinchi, «meniki» */
  await search(p, 'musaffo'); const first = p.locator('#fdRes .sl-rw').first(); assert.match(await first.innerText(), /Musaffo qatiq 2,5%/); assert.match(await first.innerText(), /meniki/);
  log('Saqlangan yorliq — qidiruvda BIRINCHI («meniki»)');
  /* 4. qo'lda: 4/9/4 ogohlantirishi, tuzatilsa yo'qoladi; ruxsat qayta so'ralmaydi (berilgan — yuboriladi; mos kelmasa — yuborilmaydi) */
  await search(p, 'zzqqyy'); await p.click('#fdRes [data-act=lbman]'); await p.waitForTimeout(300); assert.equal(await p.locator('#lbShare').count(), 0, 'ruxsat bir marta so\'raladi');
  await p.fill('#cuK', '500'); await p.fill('#cuP', '10'); await p.fill('#cuF', '10'); await p.fill('#cuC', '10'); await p.waitForTimeout(150);
  t = await p.locator('#lbChk').innerText(); assert.match(t, /mos emas/); assert.match(t, /≈ 170 kkal, yozilgani 500 kkal/);
  await p.fill('#cuK', '172'); await p.waitForTimeout(150); assert.equal((await p.locator('#lbChk').innerText()).trim(), '', '±15% ichida — ogohlantirish yo\'q');
  await p.fill('#cuK', '500'); await p.click('[data-act=cusave]'); await p.waitForSelector('#fdName'); await p.waitForTimeout(400); st = await stOf(p); assert.equal(st.customFoods[1].src, 'qolda'); assert.equal(st.customFoods[1].n, 'zzqqyy'); assert.equal(p.yq.length, 1, 'mos kelmagan raqamlar taklif qilinmaydi');
  log('Qo\'lda kiritish (o\'sha varaq): 4/9/4 ±15% dan farq — ogohlantirish (saqlashni to\'smaydi), mos kelsa yo\'qoladi; ruxsat qayta so\'ralmaydi; mos kelmagani taklif qilinmaydi');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300); assert.deepEqual(p.errs, []); await p.context().close();
  /* 5. ruxsat berilmasa — hech narsa yuborilmaydi; «o'qilmadi» va limit xatolari */
  p = await mk({ rasm: (bd, i) => (i === 1 ? { status: 200, json: { yorliq: null, limit: 5, qoldi: 2 } } : { status: 429, json: { xato: 'x', sabab: 'mijoz', limit: 5, qoldi: 0 } }) });
  await p.click('#mainAdd'); await p.waitForTimeout(300); await p.click('#rzSheet [data-act=lbphoto].kq-lbl'); await p.waitForTimeout(200);
  await p.setInputFiles('#phIn', { name: 'a.jpg', mimeType: 'image/jpeg', buffer: JPG }); await p.waitForTimeout(900); assert.match(await sheet(p), /raqamlarni o'qib bo'lmadi/);
  await p.setInputFiles('#phIn', { name: 'a.jpg', mimeType: 'image/jpeg', buffer: JPG }); await p.waitForTimeout(900); t = await sheet(p); assert.match(t, /Bugungi 5 ta AI so'rov/); assert.equal(await p.locator('[data-act=lbfile][disabled]').count(), 1, 'limit tugasa tugma o\'chadi');
  await p.click('[data-act=lbman]'); await p.waitForTimeout(200); await p.fill('#cuName', 'Lays chips'); await p.fill('#cuK', '536'); await p.fill('#cuP', '6,5'); await p.fill('#cuF', '33'); await p.fill('#cuC', '52');
  assert.equal(await p.isChecked('#lbShare'), false, 'ruxsat — sukut bo\'yicha yo\'q'); await p.click('[data-act=cusave]'); await p.waitForSelector('#fdName'); await p.waitForTimeout(400);
  assert.equal(p.yq.length, 0); assert.equal((await stOf(p)).prefs.lbShare, false); assert.deepEqual(p.errs, []); await p.context().close();
  log('«O\'qilmadi» → qayta suratga olish/qo\'lda maslahati; limit tugadi → aniq xabar, tugma o\'chadi; ruxsat berilmasa — hech narsa yuborilmaydi');
  /* 6. Imkoniyatlar, Mening taomlarim, admin qo'shgan umumiy yorliq qidiruvda; tarmoq taomi — «taxminiy» belgisi */
  p = await mk({ umumiy: [{ i: 'yq-0123456789', n: 'Bahor kefir 1%', r: 'Кефир Бахор 1%', a: [], k: 40, p: 3, f: 1, c: 4, t: 's', e: 0, u: [['qadoq', 900], ['g100', 100]], ms: { u: "Qadoq yorlig'i (foydalanuvchi yuborgan, admin tekshirgan)", r: 'x' }, yq: 1 }] });
  await p.click('#ftBtn'); await p.waitForTimeout(500); assert.ok(await p.locator('[data-act=feat][data-fk=yorliq]').count() >= 1, 'Imkoniyatlar: «Yorliqdan qo\'shish»'); await p.click('[data-act=feat][data-fk=yorliq] >> nth=0'); await p.waitForTimeout(400); assert.match(await sheet(p), /Yorliqdan qo'shish/);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await search(p, 'bahor kefir'); assert.match(await p.locator('#fdRes .sl-rw').first().innerText(), /Bahor kefir 1%/, 'admin qo\'shgan yorliq — umumiy bazada');
  await search(p, 'evos lavash'); const r0 = p.locator('#fdRes .sl-rw').first(); assert.match(await r0.innerText(), /Evos — Lavash mol \(M\)/); assert.match(await r0.innerText(), /taxminiy/);
  await r0.locator('.sl-rr').click(); await p.waitForTimeout(400); assert.match(await sheet(p), /Taxminiy — tarmoq rasmiy qiymat e'lon qilmagan/); assert.match(await p.locator('#fdKcal').innerText(), /^7\d\d$/);
  await p.click('[data-act=pwsrc]'); await p.waitForTimeout(300); assert.match(await sheet(p), /Taxminiy — tarmoq rasmiy qiymat e'lon qilmagan\. Og'irlik menyuda e'lon qilinmagan/); assert.deepEqual(p.errs, []); await p.context().close();
  log('Imkoniyatlar → «Yorliqdan qo\'shish»; admin qo\'shgan yorliq qidiruvda; «evos lavash» → Evos lavash M, «taxminiy» belgisi qatorda, kartada va Manba varag\'ida');
  /* 7. 360 px + katta shrift: varaq sig'adi (gorizontal toshish yo'q), RU va ЎЗ matnlari */
  for (const [lang, re] of [['ru', /Не нашли\? Сфотографируйте этикетку/], ['cyr', /Топилмадими\?/]]) {
    p = await mk({ w: 360, h: 640, big: true, lang });
    await search(p, 'qzxwvj'); assert.match(await p.locator('#fdRes').innerText(), re);
    await p.click('#fdRes [data-act=lbman]'); await p.waitForTimeout(300); await p.fill('#cuK', '500'); await p.fill('#cuP', '10'); await p.waitForTimeout(150);
    const ov = await p.evaluate(() => { const sh = document.getElementById('rzSheet'), bad = []; sh.querySelectorAll('*').forEach((e) => { const r = e.getBoundingClientRect(); if (r.width && (r.right > innerWidth + 1 || r.left < -1)) bad.push(e.className || e.tagName); }); return { bad: bad.slice(0, 5), sw: sh.scrollWidth - sh.clientWidth }; });
    assert.deepEqual(ov.bad, [], lang + ': chiqib ketgan'); assert.ok(ov.sw <= 1, lang + ': gorizontal skrol'); assert.equal(await p.locator('#lbChk .warn').count(), 1);
    const fs0 = await p.evaluate(() => Math.min(...[...document.querySelectorAll('#rzSheet label span, #rzSheet .rz-chip, #rzSheet .warn')].map((e) => parseFloat(getComputedStyle(e).fontSize)))); assert.ok(fs0 >= 15, 'shrift ≥ 15 px: ' + fs0);
    assert.deepEqual(p.errs, []); await p.context().close();
  }
  log('360 px + katta shrift (RU, ЎЗ): varaq sig\'adi, gorizontal toshish yo\'q, matn ≥ 15 px');
} finally { await b.close(); srv.close(); }
console.log('\nHammasi o\'tdi: ' + n + ' ta tekshiruv');
