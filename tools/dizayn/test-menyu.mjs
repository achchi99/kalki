// KalkiFit v25: «Menyudan tanlash» — menyu surati → AI faqat nom/narx (/api/kalkifit-menyu, umumiy AI limit 'ai', rasm saqlanmaydi) → bazaga moslash →
//  qoldiq kkal va «Yemaydiganlarim» bo'yicha 2–3 variant, bir qatorli sabab («Oqsilga boy», «Yengilroq»), narx, bosilsa qo'shiladi; cho'chqa — hech qachon.   node tools/dizayn/test-menyu.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
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
  } finally { globalThis.fetch = g0; }
  log('Server: nom/asl/narx tozalanadi (kkal yo\'q), umumiy AI limit (Android 2 → 3-chisi 429), boshqa origin — 403, rasm saqlanmaydi/loglanmaydi'); }
/* 3. brauzer */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
const mk = (o = {}) => { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 86400000; st.prefs = Object.assign({ suvFrom: TODAY, tipsDone: true, yemayK: 1, yemay: o.yemay || [] }, o.prefs || {}); st.profile = { sex: 'm', preg: false, age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: null }; st.trackStart = D.addDays(TODAY, -14); S.addWeight(st, TODAY, 80);
  if (o.eaten) S.addFood(st, TODAY, { fid: 'osh', unit: 'g100', qty: 1, g: 300, kcal: o.eaten, p: 20, f: 20, c: 60, meal: 'b', ts: 1 }); return st; };
const MENU = [{ nom: 'Osh', asl: 'Плов', narx: 45000 }, { nom: "Shashlik (qo'y go'shti)", asl: 'Шашлык из баранины', narx: 30000 }, { nom: 'Mastava', asl: 'Мастава', narx: 25000 }, { nom: 'Baliq kabob', asl: 'Рыба на мангале', narx: 55000 }, { nom: 'Pitsa pepperoni', asl: 'Пицца пепперони', narx: 70000 }, { nom: "Cho'chqa qovurg'asi", asl: 'Свиные рёбра', narx: 80000 }, { nom: 'Chizkeyk', asl: 'Чизкейк', narx: 28000 }, { nom: 'Achchiq-chuchuk', asl: 'Ачичук', narx: 15000 }];
async function open(state, { url = '/kalkifit', resp = { s: 200, j: { taomlar: MENU, limit: 5, qoldi: 4 } } } = {}) {
  const c = await b.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((x) => { try { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); } catch (e) {} }, { st: state });
  const p = await c.newPage(); p.errs = []; p.req = []; p.on('pageerror', (e) => p.errs.push(String(e)));
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route(/\/api\//, async (r) => { const u = r.request().url(); if (/kalkifit-menyu/.test(u)) { const body = JSON.parse(r.request().postData() || '{}'); p.req.push({ til: body.til, cid: !!body.mijoz_id, img: (body.img || '').length }); return r.fulfill({ status: resp.s, contentType: 'application/json', body: JSON.stringify(resp.j) }); } return r.abort(); });
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
  log('Qo\'shish oynasi → «Menyudan tanlash» → rasm (kichraytirilgan JPEG, mijoz_id) → 2–3 variant, sabab, narx; bosilsa bazadagi taom qo\'shiladi; cho\'chqa yo\'q');
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
  p = await open(mk(), { url: '/ru/kalkifit' }); await p.click('#mainAdd'); await p.waitForSelector('#mnAdd'); assert.match(await txt(p, '#mnAdd'), /Выбрать по меню/); await p.click('#mnAdd'); await shoot(p); assert.match(await txt(p, '#rzSheet'), /В меню найдено блюд: 8/); assert.equal(p.req[0].til, 'ru'); await p.context().close();
  p = await open(mk(), { resp: { s: 200, j: { taomlar: [], limit: 5, qoldi: 3 } } }); await p.click('#mainAdd'); await p.click('#mnAdd'); await shoot(p); assert.match(await txt(p, '#mnErr'), /Menyudan taom topilmadi/); await p.context().close();
  log('«Bugun nima yeymiz?» → Kafe → «Menyudan tanlash»; limit tugasa — aniq matn; RU; menyu o\'qilmasa — muloyim matn');
} finally { await b.close(); srv.close(); }
console.log('\n' + n + '/' + n + ' OK');
