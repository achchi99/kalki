// KalkiFit v25: «Menyudan tanlash» — menyu surati → AI faqat nom/narx (/api/kalkifit-menyu, umumiy AI limit 'ai', rasm saqlanmaydi) → bazaga moslash →
//  qoldiq kkal va «Yemaydiganlarim» bo'yicha 2–3 variant, bir qatorli sabab («Oqsilga boy», «Yengilroq»), narx, bosilsa qo'shiladi; cho'chqa — hech qachon.   node tools/dizayn/test-menyu.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import os from 'node:os';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), M = require(path.join(ROOT, 'assets/kalkifit-menyu.js')); const D = S.dates; const TODAY = D.today();
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. tanlash (sof) */
{ const c = (key, k, sifat, o = {}) => ({ key, nom: o.nom || key, narx: o.narx || null, p: { k, p: k * sifat / 100 }, sifat, ok: o.ok !== false });
  const L = [c('osh', 700, 6), c('shashlik', 450, 20), c('mastava', 280, 8), c('salat', 150, 5), c('lagmon', 650, 7), c('cheesecake', 400, 3)];
  let r = M.pick(L, 900); assert.equal(r.length, 3); assert.deepEqual([r[0].key, r[0].why], ['shashlik', 'oqsil']); assert.deepEqual([r[1].key, r[1].why], ['salat', 'yengil']); assert.ok(r.every((x) => x.p.k <= 900));
  r = M.pick(L, 300); assert.ok(r.every((x) => x.p.k <= 300), 'qoldiqqa sig\'adiganlar'); assert.deepEqual(r.map((x) => x.key).sort(), ['mastava', 'salat']);
  r = M.pick(L, 0); assert.ok(r.length <= 3 && r.some((x) => x.key === 'salat') && r.every((x) => ['salat', 'mastava', 'cheesecake'].includes(x.key)), 'qoldiq yo\'q → eng yengillari');
  r = M.pick([c('osh', 700, 6, { ok: false }), c('shashlik', 450, 20)], 900); assert.deepEqual(r.map((x) => x.key), ['shashlik'], 'yemaydiganlar (ok=false) — taklif qilinmaydi');
  r = M.pick([c('shashlik', 450, 20, { nom: 'Свиной шашлык Шашлык' }), c('kabob', 400, 18, { nom: "Cho'chqa qovurg'asi Kabob" }), c('x', 300, 18, { nom: 'Pizza pepperoni Pitsa' }), c('mastava', 280, 8)], 900);
  assert.deepEqual(r.map((x) => x.key), ['mastava'], 'cho\'chqa (свин/cho\'chqa/pepperoni) — hech qachon');
  assert.equal(M.pick([], 500).length, 0); assert.equal(M.narxTxt(45000, 'uz'), "45 000 so'm"); assert.equal(M.narxTxt(45000, 'ru'), '45 000 сум'); assert.equal(M.narxTxt(null), '');
  log('Tanlash: qoldiqqa sig\'adigan 2–3 ta (oqsilga boy + yengilroq + yana biri), qoldiq yo\'q → eng yengillari, yemaydiganlar va cho\'chqa — yo\'q, narx formati'); }
/* 2. server */
{ const API = await import(pathToFileURL(path.join(ROOT, 'functions/api/kalkifit-menyu.js')).href), src = fs.readFileSync(path.join(ROOT, 'functions/api/kalkifit-menyu.js'), 'utf8');
  assert.deepEqual(API._test.sanitize([{ nom: 'Osh', asl: 'Плов чайханский', narx: 45000 }, { nom: 'osh', narx: 1 }, { nom: '<b>Somsa</b>', narx: '12000' }, { nom: 'Choy', narx: 9e9 }, null]), [{ nom: 'Osh', asl: 'Плов чайханский', narx: 45000 }, { nom: 'bSomsa/b', asl: 'bSomsa/b', narx: 12000 }, { nom: 'Choy', asl: 'Choy', narx: null }]);
  assert.match(src, /uns: 'ai'/, 'umumiy AI limit'); assert.match(src, /SAQLANMAYDI/); assert.ok(!/kv\.put\([^)]*img/.test(src), 'rasm KV/logga yozilmaydi'); assert.ok(!/console\.(log|error)\([^)]*(b64|img\.)/.test(src));
  const kv = new Map(), env = { ANTHROPIC_API_KEY: 'x', KALKI_AI_KV: { get: async (k) => kv.get(k) || null, put: async (k, v) => kv.set(k, v) } };
  const jpg = 'data:image/jpeg;base64,' + Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(300, 1)]).toString('base64');
  const g0 = globalThis.fetch; let calls = 0; globalThis.fetch = async () => { calls++; return new Response(JSON.stringify({ content: [{ text: '[{"nom":"Osh","asl":"Osh","narx":40000}]' }] }), { status: 200 }); };
  const post = (cid, pl) => API.onRequest({ request: new Request('https://kalki.uz/api/kalkifit-menyu', { method: 'POST', headers: { Origin: 'https://kalki.uz', 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' }, body: JSON.stringify({ img: jpg, til: 'uz', mijoz_id: cid, platforma: pl }) }), env });
  try { const cid = '11111111-2222-4333-8444-555555555555'; let r = await post(cid, 'android'); assert.equal(r.status, 200); const j = await r.json(); assert.equal(j.taomlar[0].narx, 40000); assert.equal(j.limit, 2);
    r = await post(cid, 'android'); assert.equal(r.status, 200); r = await post(cid, 'android'); assert.equal(r.status, 429, 'Android: 2 ta'); assert.equal(calls, 2);
    assert.ok([...kv.keys()].some((k) => /^ai:cid:/.test(k)), 'umumiy «ai» hisobi (rasm/retsept/ovoz bilan)');
    const bad = await API.onRequest({ request: new Request('https://kalki.uz/api/kalkifit-menyu', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{}' }), env }); assert.equal(bad.status, 403);
    /* kesilgan javob saqlanadi; xato sabablari; katta (≤ ~1 MB) menyu rasmi qabul qilinadi */
    assert.deepEqual(API._test.extractMenu('[{"nom":"Osh","asl":"Плов","narx":1000},{"nom":"Somsa","asl":"Сам'), [{ nom: 'Osh', asl: 'Плов', narx: 1000 }], 'max_tokens kesgan javob: tugallangan taomlar saqlanadi'); assert.equal(API._test.extractMenu('Kechirasiz'), null);
    const big = (kb) => 'data:image/jpeg;base64,' + Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.alloc(kb * 1000, 7)]).toString('base64');
    const postImg = (img, cid2) => API.onRequest({ request: new Request('https://kalki.uz/api/kalkifit-menyu', { method: 'POST', headers: { Origin: 'https://kalki.uz', 'Content-Type': 'application/json', 'CF-Connecting-IP': '5.5.5.' + Math.floor(Math.random() * 200) }, body: JSON.stringify({ img, til: 'uz', mijoz_id: cid2 || '33333333-2222-4333-8444-555555555555' }) }), env });
    assert.equal((await postImg(big(900))).status, 200, '900 KB menyu rasmi (1600 px) qabul qilinadi'); let rb = await postImg(big(1100)); assert.equal(rb.status, 413); assert.equal((await rb.json()).sabab, 'hajm');
    rb = await postImg('data:image/jpeg;base64,' + Buffer.from('bu rasm emas '.repeat(40)).toString('base64')); assert.equal(rb.status, 400); assert.equal((await rb.json()).sabab, 'format');
    globalThis.fetch = async () => new Response(JSON.stringify({ content: [{ text: 'Menyu topilmadi' }] }), { status: 200 }); rb = await postImg(big(5), '44444444-2222-4333-8444-555555555555'); assert.equal(rb.status, 502); assert.equal((await rb.json()).sabab, 'parse', 'javob o\'qilmadi → parse');
    globalThis.fetch = async () => new Response('x', { status: 500 }); rb = await postImg(big(5), '55555555-2222-4333-8444-555555555555'); assert.equal(rb.status, 502); assert.equal((await rb.json()).sabab, 'ai', 'model xatosi → ai');
    globalThis.fetch = async () => new Response(JSON.stringify({ content: [{ text: '[{"nom":"Osh","asl":"Плов","narx":1000},{"nom":"Somsa","asl":"Сам' }] }), { status: 200 }); rb = await postImg(big(5), '66666666-2222-4333-8444-555555555555'); assert.equal(rb.status, 200); assert.equal((await rb.json()).taomlar.length, 1, 'kesilgan javobdan ham taomlar');
  } finally { globalThis.fetch = g0; }
  log('Server: nom/asl/narx tozalanadi (kkal yo\'q), umumiy AI limit (Android 2 → 3-chisi 429), boshqa origin — 403, rasm saqlanmaydi/loglanmaydi'); }
/* 3. brauzer */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
const mk = (o = {}) => { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 86400000; st.prefs = Object.assign({ suvFrom: TODAY, tipsDone: true, yemayK: 1, yemay: o.yemay || [] }, o.prefs || {}); st.profile = { sex: 'm', preg: false, age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: null }; st.trackStart = D.addDays(TODAY, -14); S.addWeight(st, TODAY, 80);
  if (o.eaten) S.addFood(st, TODAY, { fid: 'osh', unit: 'g100', qty: 1, g: 300, kcal: o.eaten, p: 20, f: 20, c: 60, meal: 'b', ts: 1 }); return st; };
const MENU = [{ nom: 'Osh', asl: 'Плов', narx: 45000 }, { nom: "Shashlik (qo'y go'shti)", asl: 'Шашлык из баранины', narx: 30000 }, { nom: 'Mastava', asl: 'Мастава', narx: 25000 }, { nom: 'Baliq kabob', asl: 'Рыба на мангале', narx: 55000 }, { nom: 'Pitsa pepperoni', asl: 'Пицца пепперони', narx: 70000 }, { nom: "Cho'chqa qovurg'asi", asl: 'Свиные рёбра', narx: 80000 }, { nom: 'Chizkeyk', asl: 'Чизкейк', narx: 28000 }, { nom: 'Achchiq-chuchuk', asl: 'Ачичук', narx: 15000 }];
async function open(state, { url = '/kalkifit', resp = { s: 200, j: { taomlar: MENU, limit: 5, qoldi: 4 } }, init = '', net = false, hold = 0 } = {}) {
  const c = await b.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((x) => { try { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); } catch (e) {} }, { st: state });
  if (init) await c.addInitScript(init);
  const p = await c.newPage(); p.errs = []; p.req = []; p.on('pageerror', (e) => p.errs.push(String(e)));
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route(/\/api\//, async (r) => { const u = r.request().url(); if (/kalkifit-menyu/.test(u)) { const body = JSON.parse(r.request().postData() || '{}'); p.req.push({ til: body.til, cid: !!body.mijoz_id, img: (body.img || '').length, b64: body.img }); if (net) return r.abort('failed'); if (hold) await new Promise((ok) => setTimeout(ok, hold)); return r.fulfill({ status: resp.s, contentType: 'application/json', body: JSON.stringify(resp.j) }); } return r.abort(); });
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200); return p;
}
const txt = async (p, sel) => { const l = p.locator(sel).first(); return (await l.count()) ? (await l.innerText()).replace(/\s+/g, ' ').replace(/ /g, ' ').trim() : null; };
const IMG = path.join(ROOT, 'assets/ovqat/osh-256.webp');
async function shoot(p) { const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click('[data-act=mnpick]')]); await fc.setFiles(IMG); await p.waitForSelector('#mnRes, #mnErr', { timeout: 15000 }); }
try {
  /* qo'shish oynasidan */
  let p = await open(mk({ eaten: 900 })); await p.click('#mainAdd'); await p.waitForSelector('#mnAdd'); await p.click('#mnAdd'); await p.waitForSelector('[data-act=mnpick]');
  assert.match(await txt(p, '#rzSheet'), /Rasm saqlanmaydi/); await shoot(p); assert.equal(p.req.length, 1); assert.ok(p.req[0].img > 1000 && p.req[0].cid);
  const res = await txt(p, '#rzSheet'); assert.match(res, /Menyudan 8 ta taom topildi/); const rows = await p.locator('#mnList .sl-mnr').count(); assert.ok(rows >= 2 && rows <= 3, 'variantlar: ' + rows);
  assert.ok(!/pepperoni|Pepperoni|cho'chqa|Cho'chqa|Свин/i.test(res), 'cho\'chqa — taklif qilinmaydi (va bu haqda matn yo\'q)'); assert.match(res, /Oqsilga boy|Yengilroq|Qoldiqqa sig'adi/); assert.match(res, /\d[\d ]* so'm/, 'narx ko\'rsatiladi');
  const rem = await p.evaluate(() => { const x = window.__kalkifit; return null; }); void rem;
  const ks = await p.$$eval('#mnList .sl-mnr .tm', (l) => l.map((e) => +((e.textContent.match(/([\d ]+) kkal/) || [])[1] || '0').replace(/\D/g, ''))); assert.ok(ks.every((k) => k > 0));
  const before = await p.evaluate(() => window.__kalkifit.state.days[Object.keys(window.__kalkifit.state.days).sort().pop()].food.length);
  await p.click('#mnList [data-act=mnadd] >> nth=0'); await p.waitForTimeout(900); const after = await p.evaluate(() => window.__kalkifit.state.days[Object.keys(window.__kalkifit.state.days).sort().pop()].food); assert.equal(after.length, before + 1, 'bosilsa qo\'shiladi'); assert.ok(after[after.length - 1].fid, 'bazadagi taom (kkal bazadan)');
  assert.deepEqual(p.errs, []); await p.context().close();
  log('Qo\'shish oynasi → «Rasmdan» yonidagi «Menyudan» → rasm (kichraytirilgan JPEG, mijoz_id) → 2–3 variant, sabab, narx; bosilsa bazadagi taom qo\'shiladi; cho\'chqa yo\'q');
  /* qoldiq kam → qoldiqqa sig'adiganlar; yemaydiganlar */
  p = await open(mk({ eaten: 1900, yemay: ['baliq'] })); await p.click('#mainAdd'); await p.click('#mnAdd'); await shoot(p);
  const left = await p.evaluate(() => window.__kalkifit.state && null); void left; const t2 = await txt(p, '#mnList'); assert.ok(!/Baliq|Рыба/i.test(t2), 'yemaydiganlar (baliq) — yo\'q: ' + t2);
  const ks2 = await p.$$eval('#mnList .sl-mnr .tm', (l) => l.map((e) => +((e.textContent.match(/([\d ]+) kkal/) || [])[1] || '0').replace(/\D/g, '')));
  const lim = await p.evaluate(() => { const K = window.__kalkifit, st = K.state, S = K.S; const t = Object.keys(st.days).sort().pop(), x = st.days[t], pl = S.plan(st.profile), tot = S.sumEntries(x.food); return S.dayBalance(pl.target, tot.kcal, x.steps || 0, 175, 80, 3).remaining; });
  assert.ok(ks2.length >= 1, 'variant bor'); if (lim > 0) assert.ok(ks2.every((k) => k <= lim), 'qoldiqqa sig\'adi: ' + lim + ' / ' + ks2); else assert.ok(ks2.length <= 3); await p.context().close();
  log('«Yemaydiganlarim» (baliq) hisobga olinadi; qoldiq kkal bo\'yicha tanlanadi');
  /* Yeymiz → Kafe → menyu; limit; RU */
  p = await open(mk(), { resp: { s: 429, j: { xato: 'x', sabab: 'mijoz', limit: 5, qoldi: 0 } } }); await p.click('#yeCard'); await p.waitForSelector('#rzSheet[data-kind=yeymiz] .sl-segs3'); await p.click('#rzSheet [data-act=yeseg][data-s=kafe]'); await p.waitForTimeout(300); await p.waitForSelector('#mnDoor'); await p.click('#mnDoor'); await shoot(p);
  assert.match(await txt(p, '#mnErr'), /5/, 'limit matni'); await p.context().close();
  p = await open(mk(), { url: '/ru/kalkifit' }); await p.click('#mainAdd'); await p.waitForSelector('#mnAdd'); assert.match(await txt(p, '#mnAdd'), /По меню/); await p.click('#mnAdd'); await shoot(p); assert.match(await txt(p, '#rzSheet'), /В меню найдено блюд: 8/); assert.equal(p.req[0].til, 'ru'); await p.context().close();
  p = await open(mk(), { resp: { s: 200, j: { taomlar: [], limit: 5, qoldi: 3 } } }); await p.click('#mainAdd'); await p.click('#mnAdd'); await shoot(p); assert.match(await txt(p, '#mnErr'), /Rasmda menyu matni topilmadi/); await p.context().close();
  p = await open(mk()); await p.click('#yeCard'); await p.waitForSelector('#rzSheet[data-kind=yeymiz] .sl-segs3'); await p.click('#rzSheet [data-act=yeseg][data-s=kafe]'); await p.waitForTimeout(300);
  assert.match(await txt(p, '#mnDoor'), /📷\s*Menyuni suratga oling — mosini tanlab beramiz/); assert.equal(await p.locator('#mnTip').count(), 1, 'birinchi marta — ko\'rsatma');
  const top = await p.evaluate(() => { const d = document.getElementById('mnDoor').getBoundingClientRect(), f = document.querySelector('#rzSheet .sl-yr, #rzSheet .rz-empty'); return f ? d.top < f.getBoundingClientRect().top : true; }); assert.ok(top, 'ro\'yxat tepasida');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300); await p.click('#yeCard'); await p.waitForSelector('#rzSheet[data-kind=yeymiz] .sl-segs3'); await p.click('#rzSheet [data-act=yeseg][data-s=kafe]'); await p.waitForTimeout(300); assert.equal(await p.locator('#mnTip').count(), 0, 'qayta ochilganda — ko\'rsatma yo\'q');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300); await p.click('#mainAdd'); await p.waitForSelector('#mnAdd'); const same = await p.evaluate(() => { const a = document.getElementById('phBtn'), b = document.getElementById('mnAdd'); const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return a.parentNode === b.parentNode && Math.abs(ra.top - rb.top) < 1 && Math.abs(ra.height - rb.height) < 1 && Math.abs(ra.width - rb.width) < 2; }); assert.ok(same, '«Rasmdan» va «Menyudan» — bir xil darajada'); assert.equal(await p.locator('.sl-morep #mnAdd').count(), 0, '«Boshqa usullar» ichida emas'); await p.context().close();
  log('«Bugun nima yeymiz?» → Kafe → ro\'yxat tepasida «📷 Menyuni suratga oling — mosini tanlab beramiz» (birinchi marta ko\'rsatma, keyin yo\'q); qo\'shish oynasida «Rasmdan» va «Menyudan» bir xil darajada; limit tugasa — aniq matn; RU; menyu o\'qilmasa — muloyim matn');
  /* iPhone muammolari: katta (48 MP uslubi) rasm kichraytiriladi, createImageBitmap yo'q/xato bo'lsa <img> orqali; xato matnlari aniq */
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kf-menyu-')); try {
    const pg = await b.newPage(); await pg.setContent('<canvas id=c></canvas>');
    const mkJpg = async (W, H, name) => { const d = await pg.evaluate(([W, H]) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#d9c9a8'; x.fillRect(0, 0, W, H); x.fillStyle = '#2a2018'; x.font = '600 ' + Math.round(W / 60) + 'px serif'; for (let i = 0; i < 60; i++) x.fillText("Lag'mon qovurma  Shashlik  45 000 so'm " + i, 40 + (i % 2) * W / 2, 60 + Math.floor(i / 2) * (H / 32)); const im = x.getImageData(0, 0, W, H), a = im.data; let q = 1; for (let i = 0; i < a.length; i += 4) { q = (q * 16807) % 2147483647; const n = ((q / 2147483647) - 0.5) * 40; a[i] += n; a[i + 1] += n; a[i + 2] += n; } x.putImageData(im, 0, 0); return c.toDataURL('image/jpeg', 0.92).split(',')[1]; }, [W, H]); const f = path.join(tmp, name); fs.writeFileSync(f, Buffer.from(d, 'base64')); return f; };
    const dims = (b64) => { const u = Buffer.from(b64, 'base64'); let i = 2; while (i < u.length) { if (u[i] !== 0xFF) { i++; continue; } const m = u[i + 1]; if (m >= 0xC0 && m <= 0xC3) return [u.readUInt16BE(i + 7), u.readUInt16BE(i + 5)]; i += 2 + u.readUInt16BE(i + 2); } return null; };
    const shootF = async (q, f) => { const [fc] = await Promise.all([q.waitForEvent('filechooser'), q.click('[data-act=mnpick]')]); await fc.setFiles(f); await q.waitForSelector('#mnRes, #mnErr', { timeout: 30000 }); };
    const start = async (q) => { await q.click('#mainAdd'); await q.waitForSelector('#mnAdd'); await q.click('#mnAdd'); await q.waitForSelector('[data-act=mnpick]'); };
    const BIG = await mkJpg(6000, 4500, 'katta.jpg'), PORT = await mkJpg(3000, 4000, 'tik.jpg'), BAD = path.join(tmp, 'buzuq.jpg'); fs.writeFileSync(BAD, 'bu rasm emas'); await pg.close();
    let p = await open(mk()); await start(p); await shootF(p, BIG); assert.equal(p.req.length, 1); let d0 = dims(p.req[0].b64), bytes = Math.floor(p.req[0].b64.length * 3 / 4); assert.ok(Math.max(...d0) <= 1600 && Math.max(...d0) >= 1200, 'uzun tomon ≤ 1600 px: ' + d0); assert.ok(bytes <= 700000 * 1.4, 'hajm ≤ ~1 MB: ' + bytes); assert.equal(await p.locator('#mnRes').count(), 1); await p.context().close();
    p = await open(mk()); await start(p); await shootF(p, PORT); d0 = dims(p.req[0].b64); assert.ok(d0[1] > d0[0] && Math.max(...d0) <= 1600, 'tik rasm yo\'nalishi saqlandi: ' + d0); await p.context().close();
    p = await open(mk(), { init: 'window.createImageBitmap = () => Promise.reject(new Error("HEIC"));' }); await start(p); await shootF(p, PORT); assert.equal(p.req.length, 1, 'createImageBitmap xato → <img> orqali yuborildi'); assert.equal(await p.locator('#mnRes').count(), 1); await p.context().close();
    p = await open(mk(), { init: 'delete window.createImageBitmap;' }); await start(p); await shootF(p, PORT); assert.equal(p.req.length, 1, 'createImageBitmap yo\'q (eski Safari)'); await p.context().close();
    p = await open(mk()); await start(p); await shootF(p, BAD); assert.match(await txt(p, '#mnErr'), /Rasm o'qilmadi\. Boshqa rasm tanlang yoki qayta suratga oling\./); assert.equal(p.req.length, 0, 'o\'qilmagan rasm yuborilmaydi'); await p.context().close();
    p = await open(mk(), { net: true }); await start(p); await shootF(p, PORT); assert.match(await txt(p, '#mnErr'), /Internet yo'q yoki aloqa uzildi/); await p.context().close();
    const cases = [[{ s: 429, j: { xato: 'x', sabab: 'mijoz', limit: 5, qoldi: 0 } }, /Bugungi 5 ta AI so'rov ishlatildi/], [{ s: 429, j: { xato: 'x', sabab: 'sayt' } }, /Menyu tahlili bugun juda band/], [{ s: 413, j: { sabab: 'hajm' } }, /Rasm juda katta/], [{ s: 502, j: { sabab: 'parse' } }, /Rasmda menyu matni topilmadi/], [{ s: 502, j: { sabab: 'ai' } }, /Server xatosi/], [{ s: 503, j: {} }, /Server xatosi/], [{ s: 400, j: { sabab: 'format' } }, /Rasm o'qilmadi/]];
    for (const [resp, re] of cases) { p = await open(mk(), { resp }); await start(p); await shootF(p, PORT); assert.match(await txt(p, '#mnErr'), re, 'xato ' + resp.s + '/' + (resp.j.sabab || '')); assert.ok(!/Menyuni o'qib bo'lmadi/.test(await txt(p, '#rzSheet')), 'umumiy «o\'qib bo\'lmadi» matni yo\'q'); await p.context().close(); }
    p = await open(mk(), { resp: { s: 429, j: { xato: 'x', sabab: 'mijoz', limit: 5, qoldi: 0 } }, url: '/ru/kalkifit' }); await start(p); await shootF(p, PORT); assert.match(await txt(p, '#mnErr'), /5/); await p.context().close();
    p = await open(mk(), { net: true, url: '/ru/kalkifit' }); await start(p); await shootF(p, PORT); assert.match(await txt(p, '#mnErr'), /Нет интернета/); await p.context().close();
    p = await open(mk(), { url: '/kalkifit?lang=cyr' }); await p.waitForTimeout(500); await start(p); await p.context().close();
    /* Taom rasmi (rasm-AI) — shu iPhone yo'li (umumiy imgPrep) */
    const rasmOpen = async (resp, init = '') => { const q = await open(mk(), { init }); q.rasm = []; await q.route(/kalkifit-rasm/, (r) => { const bd = JSON.parse(r.request().postData() || '{}'); q.rasm.push({ b64: bd.img }); if (resp === 'net') return r.abort('failed'); return r.fulfill({ status: resp.s, contentType: 'application/json', body: JSON.stringify(resp.j) }); }); await q.click('#mainAdd'); await q.waitForSelector('#phBtn'); await q.click('#phBtn'); return q; };
    const feed = async (q, f) => { await q.setInputFiles('#phIn', f); await q.waitForSelector('.rz-p.warn, .sl-ti', { timeout: 30000 }); await q.waitForTimeout(300); };
    p = await rasmOpen({ s: 200, j: { ovqatlar: [{ nom: 'Osh', ehtimol: 0.9, boshqa: [], porsiya: '1 lagan', g: 350, kcal: 600, o: 20, y: 25, u: 70 }], aniqlik: '±30%', limit: 5, qoldi: 4 } }); await feed(p, BIG); d0 = dims(p.rasm[0].b64); assert.ok(Math.max(...d0) <= 1024 && Math.floor(p.rasm[0].b64.length * 3 / 4) <= 600000 * 1.4, 'taom rasmi ≤ 1024 px va ≤ ~0,8 MB: ' + d0); assert.equal(await p.locator('.sl-ti').count() >= 1, true); await p.context().close();
    p = await rasmOpen({ s: 200, j: { ovqatlar: [{ nom: 'Osh', ehtimol: 0.9, boshqa: [], porsiya: '1', g: 350, kcal: 600, o: 20, y: 25, u: 70 }] } }, 'window.createImageBitmap = () => Promise.reject(new Error("HEIC"));'); await feed(p, PORT); assert.equal(p.rasm.length, 1, 'rasm-AI: createImageBitmap xato → <img> orqali'); await p.context().close();
    p = await rasmOpen({ s: 200, j: {} }); await feed(p, BAD); assert.match(await txt(p, '.rz-p.warn'), /Rasm o'qilmadi\. Boshqa rasm tanlang/); assert.equal(p.rasm.length, 0); await p.context().close();
    p = await rasmOpen('net'); await feed(p, PORT); assert.match(await txt(p, '.rz-p.warn'), /Internet yo'q yoki aloqa uzildi/); await p.context().close();
    p = await rasmOpen({ s: 500, j: {} }); await feed(p, PORT); assert.match(await txt(p, '.rz-p.warn'), /Server xatosi/); await p.context().close();
    p = await rasmOpen({ s: 429, j: { xato: 'x', sabab: 'mijoz', limit: 5, qoldi: 0 } }); await feed(p, PORT); assert.match(await txt(p, '.rz-p.warn'), /Bugungi 5 ta AI so'rov ishlatildi/); await p.context().close();
    log('iPhone: 6000×4500 rasm → ≤ 1600 px va ≤ ~1 MB (tik rasm yo\'nalishi saqlanadi); createImageBitmap xato/yo\'q bo\'lsa <img> orqali; o\'qilmagan rasm yuborilmaydi; aniq xato matnlari: limit / sayt tavani / internet yo\'q / rasm o\'qilmadi / juda katta / menyu matni topilmadi / server xatosi (RU ham)');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
} finally { await b.close(); srv.close(); }
console.log('\n' + n + '/' + n + ' OK');
