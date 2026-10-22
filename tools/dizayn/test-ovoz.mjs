// KalkiFit v25: ovozli kiritish — 🎤 → «bir piyola osh, ikki tilim non va choy» → ro'yxat (kkal BAZADAN; topilmagani — BITTA AI so'rov, umumiy limit) → tahrirlash/o'chirish → «Hammasini qo'shish»;
//  choy suv hisobiga ham kiradi; mikrofon ruxsati yo'q — aniq matn; limit tugasa — aniq matn; ovoz saqlanmaydi (matn); veb — Web Speech API, APK — native «Ovoz» plagini.   node tools/dizayn/test-ovoz.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), O = require(path.join(ROOT, 'assets/kalkifit-ovoz.js')); const D = S.dates; const TODAY = D.today();
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. sof qism + server */
{ assert.equal(O.code('not-allowed'), 'ruxsat'); assert.equal(O.code('service-not-allowed'), 'ruxsat'); assert.equal(O.code('no-speech'), 'jim'); assert.equal(O.code('network'), 'tarmoq'); assert.equal(O.code('audio-capture'), 'yoq'); assert.equal(O.code('ruxsat'), 'ruxsat'); assert.equal(O.code('boshqa'), 'xato');
  assert.equal(O.create({}).ok(), false, 'Node — qo\'llanmaydi');
  const API = await import(pathToFileURL(path.join(ROOT, 'functions/api/kalkifit.js')).href), kv = new Map(), env = { ANTHROPIC_API_KEY: 'x', KALKI_AI_KV: { get: async (k) => kv.get(k) || null, put: async (k, v) => kv.set(k, v) } };
  const g0 = globalThis.fetch; let calls = 0; globalThis.fetch = async () => { calls++; return new Response(JSON.stringify({ content: [{ text: '[{"nom":"Qandaydir taom","porsiya":"1 porsiya","kcal":300,"o":10,"y":10,"u":40}]' }] }), { status: 200 }); };
  const post = (b) => API.onRequest({ request: new Request('https://kalki.uz/api/kalkifit', { method: 'POST', headers: { Origin: 'https://kalki.uz', 'Content-Type': 'application/json', 'CF-Connecting-IP': '9.9.9.9' }, body: JSON.stringify(b) }), env });
  try { const cid = '11111111-2222-4333-8444-555555555555';
    let r = await post({ matn: 'qandaydir taom', til: 'uz', mijoz_id: cid, manba: 'ovoz', platforma: 'android' }); assert.equal(r.status, 200); const j = await r.json(); assert.equal(j.limit, 2); assert.equal(j.qoldi, 1);
    assert.ok([...kv.keys()].some((k) => /^ai:cid:/.test(k)), 'ovoz — umumiy «ai» hisobi'); r = await post({ matn: 'qandaydir taom', til: 'uz', mijoz_id: cid, manba: 'ovoz', platforma: 'android' }); assert.equal(r.status, 200);
    r = await post({ matn: 'qandaydir taom', til: 'uz', mijoz_id: cid, manba: 'ovoz', platforma: 'android' }); assert.equal(r.status, 429); const j3 = await r.json(); assert.equal(j3.limit, 2); assert.match(j3.xato, /2 ta AI/);
    r = await post({ matn: 'qandaydir taom', til: 'uz', mijoz_id: cid }); assert.equal(r.status, 200, 'oddiy matn — o\'z hisobi (tx)'); assert.ok([...kv.keys()].some((k) => /^tx:cid:/.test(k))); assert.equal(calls, 3);
  } finally { globalThis.fetch = g0; }
  log('Xato kodlari (ruxsat/jim/tarmoq/yoq); server: manba=ovoz → umumiy AI limit (Android 2, 3-chisi 429 «2 ta AI so\'rov»), oddiy matn — o\'z hisobi'); }
/* 2. brauzer */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
const mk = () => { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 86400000; st.prefs = { suvFrom: TODAY, tipsDone: true, yemayK: 1, yemay: [] }; st.profile = { sex: 'm', preg: false, age: 30, height: 175, weight: 80, act: 3, goal: 'lose', goalWeight: null }; st.trackStart = D.addDays(TODAY, -14); S.addWeight(st, TODAY, 80); return st; };
async function open({ url = '/kalkifit', say = 'bir piyola osh, ikki tilim non va choy', err = null, sr = true, native = false, ai = { s: 200, j: { ovqatlar: [{ nom: 'Qandaydir taom', porsiya: '1 porsiya', kcal: 300, o: 10, y: 10, u: 40 }], limit: 5, qoldi: 4 } } } = {}) {
  const c = await b.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((x) => { try { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1');
    window.__sr = []; delete window.SpeechRecognition; delete window.webkitSpeechRecognition;
    if (x.sr) { class F { constructor() { this.lang = ''; } start() { window.__sr.push(this.lang); const R = (t, fin) => ({ results: Object.assign([Object.assign([{ transcript: t }], { isFinal: fin })], {}) }); setTimeout(() => { if (x.err) { this.onerror && this.onerror({ error: x.err }); this.onend && this.onend(); return; } this.onresult && this.onresult(R(x.say.split(',')[0], false)); setTimeout(() => { this.onresult && this.onresult(R(x.say, true)); this.onend && this.onend(); }, 150); }, 150); } stop() {} } window.webkitSpeechRecognition = F; }
    if (x.native) window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: [{ name: 'Ovoz' }], addListener: (pl, ev, cb) => { if (pl === 'Ovoz') window.__part = cb; return { remove() {} }; },
      nativePromise: async (pl, m, o) => { if (pl === 'Ovoz' && m === 'tingla') { window.__sr.push('native:' + o.til); if (window.__part) window.__part({ text: 'osh' }); if (x.err) throw Object.assign(new Error(x.err), { code: x.err }); return { text: x.say }; } if (pl === 'Ovoz') return {}; throw new Error('yo\'q'); } };
  } catch (e) {} }, { st: mk(), say, err, sr, native });
  const p = await c.newPage(); p.errs = []; p.ai = 0; p.on('pageerror', (e) => p.errs.push(String(e)));
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route(/\/api\//, async (r) => { if (/\/api\/kalkifit$/.test(r.request().url())) { p.ai++; p.aiBody = JSON.parse(r.request().postData() || '{}'); return r.fulfill({ status: ai.s, contentType: 'application/json', body: JSON.stringify(ai.j) }); } return r.abort(); });
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200); return p;
}
const txt = async (p, sel) => { const l = p.locator(sel).first(); return (await l.count()) ? (await l.innerText()).replace(/\s+/g, ' ').replace(/ /g, ' ').trim() : null; };
const speak = async (p) => { await p.click('#mainAdd'); await p.waitForSelector('#micBtn'); await p.click('#micBtn'); await p.waitForSelector('#vBox, #vErr, #txOut', { timeout: 5000 }); await p.waitForTimeout(900); };
try {
  let p = await open(); await speak(p); assert.deepEqual(await p.evaluate(() => window.__sr), ['uz-UZ']);
  assert.equal(await p.inputValue('#txQ'), 'bir piyola osh, ikki tilim non va choy', 'tanilgan matn maydonda'); await p.waitForTimeout(500);
  const rows = await p.locator('#txOut .sl-ti').count(); const out = await txt(p, '#txOut'); assert.ok(rows >= 3, 'osh, non, choy: ' + out); assert.match(out, /Osh/); assert.match(out, /Non/i); assert.match(out, /Choy/i); assert.equal(p.ai, 0, 'hammasi bazada — AI so\'rovi YO\'Q');
  assert.match(await txt(p, '#txOut'), /Hammasini qo'shish|qo'shish/i);
  await p.click('#txOut [data-act=txdel] >> nth=1'); await p.waitForTimeout(300); assert.equal(await p.locator('#txOut .sl-ti').count(), rows - 1, 'qatorni o\'chirish');
  await p.click('#txOut [data-act=txsave]'); await p.waitForTimeout(900);
  const st = await p.evaluate(() => { const K = window.__kalkifit, s = K.state, t = Object.keys(s.days).sort().pop(); return { food: s.days[t].food.map((e) => e.fid), w: K.S.waterInfo(s, t) }; });
  assert.equal(st.food.length, rows - 1); assert.ok(st.food.includes('osh') || st.food.some((f) => /^osh/.test(f))); assert.ok(st.w.drink > 0, 'choy suv hisobiga: ' + st.w.drink); assert.deepEqual(p.errs, []); await p.context().close();
  log('🎤 → «bir piyola osh, ikki tilim non va choy» → ro\'yxat (bazadan, AI so\'rovsiz) → qatorni o\'chirish → «Hammasini qo\'shish»; choy suv hisobiga kiradi');
  p = await open({ say: "bir kosa qandaydir g'alati taom" }); await speak(p); await p.waitForTimeout(800); assert.equal(p.ai, 1, 'topilmagani — BITTA AI so\'rov'); assert.equal(p.aiBody.manba, 'ovoz'); assert.match(await txt(p, '#txOut'), /Qandaydir taom/); await p.context().close();
  p = await open({ say: "qandaydir g'alati taom", ai: { s: 429, j: { xato: 'x', sabab: 'mijoz', limit: 5, qoldi: 0 } } }); await speak(p); await p.waitForTimeout(800); assert.equal(p.ai, 1); assert.match(await txt(p, '#txAiErr'), /Bugungi 5 ta AI so'rov ishlatildi/); await p.context().close();
  log('Bazada yo\'q taom — avtomatik BITTA AI so\'rov (manba=ovoz, umumiy limit); limit tugasa — «Bugungi 5 ta AI so\'rov ishlatildi»');
  p = await open({ err: 'not-allowed' }); await speak(p); assert.match(await txt(p, '#vErr'), /Mikrofonga ruxsat berilmadi/); assert.equal(await p.locator('[data-act=vtext]').count(), 1, 'matn bilan yozish yo\'li'); await p.context().close();
  p = await open({ err: 'no-speech' }); await speak(p); assert.match(await txt(p, '#vErr'), /Hech narsa eshitilmadi/); await p.context().close();
  p = await open({ sr: false }); await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); assert.equal(await p.locator('#micBtn').count(), 0, 'qo\'llanmasa — tugma yo\'q'); await p.context().close();
  log('Mikrofon ruxsati yo\'q — aniq matn + «Matn bilan yozish»; jim — «Hech narsa eshitilmadi»; qo\'llanmaydigan brauzerda 🎤 yo\'q');
  p = await open({ url: '/ru/kalkifit', say: 'тарелка плова и чай' }); await speak(p); assert.deepEqual(await p.evaluate(() => window.__sr), ['ru-RU']); assert.match(await txt(p, '#txOut'), /Плов/i); await p.context().close();
  p = await open({ sr: false, native: true }); await p.click('#mainAdd'); await p.waitForSelector('#micBtn'); await p.click('#micBtn'); await p.waitForSelector('#txOut'); await p.waitForTimeout(500); assert.deepEqual(await p.evaluate(() => window.__sr), ['native:uz-UZ']); assert.match(await txt(p, '#txOut'), /Osh/); await p.context().close();
  p = await open({ sr: false, native: true, err: 'ruxsat' }); await p.click('#mainAdd'); await p.click('#micBtn'); await p.waitForSelector('#vErr'); assert.match(await txt(p, '#vErr'), /Mikrofonga ruxsat/); await p.context().close();
  log('RU (ru-RU, «Плов»); APK — native «Ovoz» plagini (uz-UZ), ruxsat berilmasa — aniq matn');
  p = await open({ say: 'osh' }); await p.click('#mainAdd'); await p.click('#micBtn'); await p.waitForSelector('#vBox'); assert.match(await txt(p, '#rzSheet'), /Ovoz saqlanmaydi/); await p.context().close();
  log('Oynada: «Ovoz saqlanmaydi: telefoningiz uni matnga aylantiradi, ilova faqat matnni oladi.»');
} finally { await b.close(); srv.close(); }
console.log('\n' + n + '/' + n + ' OK');
