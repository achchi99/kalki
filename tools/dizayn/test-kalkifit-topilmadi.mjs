// KalkiFit: qidiruvda topilmadi holati — o'ngda-chapda tuzoq yo'q: «AI bilan baholash» (yozilgan matn → matn ekrani, yuborishdan oldin izoh va tasdiq tugmasi) va «Qadoq yorlig'ini suratga oling»;
// ko'p so'zli yozuvda («tuxum grechka») har so'zning eng yaqin taomi ko'rsatiladi.   node tools/dizayn/test-kalkifit-topilmadi.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const T0 = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
function seed(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - (o.age || 2) * 864e5; st.prefs = Object.assign({ yemayK: 1, jokes: true, suvFrom: T0, hwSeen: D.today(), ttAsked: 1 }, o.prefs || {}); st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'lose' }; S.addWeight(st, T0, 80);
  (o.food || []).forEach((f, i) => S.addFood(st, T0, Object.assign({ meal: 'l', ts: i + 1, est: false, p: 1, f: 1, c: 1 }, f))); return st; }
async function open({ st = seed(), lang = 'uz', ai = { limit: 5, qoldi: 3 }, ov = { yoqilgan: true, limit: 15, qoldi: 12 }, now = null } = {}) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((o) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_lang', o.lang); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); } } catch (e) {}
    if (o.now) { const off = o.now - Date.now(), R = Date; class D2 extends R { constructor(...a) { if (a.length === 0) super(R.now() + off); else super(...a); } static now() { return R.now() + off; } } window.Date = D2; } }, { st, lang, now });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/**', (r) => { const u = r.request().url(); if (/\/api\/ovoz/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ov) }); if (/\/api\/retsept/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ai) }); return r.abort(); });
  await p.goto(BASE + (lang === 'ru' ? '/ru/kalkifit' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(700); return p;
}
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
const kind = (p) => p.evaluate(() => { const s = document.getElementById('rzSheet'); return s && !s.hidden ? s.getAttribute('data-kind') : null; });
try {
  for (const lang of ['uz', 'ru']) {
    const p = await open({ lang }); let ai = 0; await p.route('**/api/kalkifit', (r) => { ai++; r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, taomlar: [] }) }); });
    await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); await p.waitForTimeout(400);
    await p.fill('#fdQ', 'zzqxwv'); await p.waitForTimeout(450);
    assert.equal(await p.locator('#fdRes .kq-none [data-act=qnai]').count(), 1, lang + ': «AI bilan baholash» bor'); assert.equal(await p.locator('#fdRes .kq-none [data-act=lbphoto]').count(), 1, lang + ': yorliq tugmasi bor');
    assert.match(await txt(p, '#fdRes .kq-none [data-act=qnai] b'), lang === 'uz' ? /AI bilan baholash/ : /ИИ/); assert.equal(await p.locator('#fdRes .kq-none [data-act=qnai]').isDisabled(), false);
    await p.click('#fdRes [data-act=qnai]'); await p.waitForTimeout(500);
    assert.equal(await p.evaluate(() => (document.querySelector('#rzSheet textarea, #rzSheet input[type=text]') || {}).value || ''), 'zzqxwv', lang + ': yozilgan matn matn ekraniga o\'tdi');
    assert.equal(await p.locator('#rzSheet [data-act=txai]').count(), 1, lang + ': «AI bilan aniqlash» tugmasi — tasdiq shu yerda'); assert.equal(ai, 0, lang + ': tasdiqsiz AI so\'rovi yuborilmadi');
    assert.deepEqual(p.errs, []); await p.context().close();
  }
  log('Topilmadi: «AI bilan baholash» (matn ekrani + tasdiq, so\'rov o\'zi ketmaydi) va yorliq tugmasi — UZ/RU');
  const p2 = await open({}); await p2.click('#mainAdd'); await p2.waitForSelector('#fdQ'); await p2.waitForTimeout(400);
  await p2.fill('#fdQ', 'tuxum grechka'); await p2.waitForTimeout(450);
  assert.equal(await p2.locator('#fdRes .kq-none').count(), 0, 'ko\'p so\'zli yozuv: topilmadi emas'); assert.ok(await p2.locator('#fdRes .kq-row, #fdRes [data-act=pick], #fdRes button').count() >= 2, 'tuxum va grechka ko\'rinadi');
  assert.match(await p2.locator('#fdRes').innerText(), /[Tt]uxum/); assert.match(await p2.locator('#fdRes').innerText(), /[Gg]rechka/); assert.deepEqual(p2.errs, []);
  log('Ko\'p so\'zli yozuv («tuxum grechka»): har so\'zning eng yaqin taomi ko\'rinadi'); await p2.context().close();
  /* v74: qisman topilgan gap — «2 tadan 1 tasi topildi», AI faqat topilmagan qism uchun */
  { const p3 = await open({}); const bodies = []; await p3.route('**/api/kalkifit', (r) => { try { bodies.push(JSON.parse(r.request().postData()).matn); } catch (e) {} r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ovqatlar: [] }) }); });
    await p3.click('#mainAdd'); await p3.waitForSelector('#fdQ'); await p3.waitForTimeout(400);
    await p3.fill('#fdQ', 'tuxum grechka guruch non'); await p3.waitForTimeout(500);
    assert.equal(await p3.locator('#fdRes .kq-part').count(), 0, 'hammasi topildi — qisman yozuvi yo\'q'); assert.equal(await p3.locator('#fdRes [data-act=fqai]').count(), 1, '«Hammasini qo\'shish»'); assert.equal(await p3.locator('#fdRes .kq-none').count(), 0);
    await p3.fill('#fdQ', 'qatiq qwzxyv'); await p3.waitForTimeout(500);
    assert.match(await txt(p3, '#fdRes .kq-part'), /2 tadan 1 tasi topildi/); assert.match(await txt(p3, '#fdRes .kq-part'), /AI baholaydi: qwzxyv/); assert.equal(await p3.locator('#fdRes [data-act=qnai]').count(), 0, 'butun matn uchun AI tugmasi yo\'q — faqat topilmagan qism');
    await p3.click('#fdRes [data-act=fqai]'); await p3.waitForTimeout(900);
    assert.deepEqual(bodies, ['qwzxyv'], 'AI faqat topilmagan qismni oladi: ' + JSON.stringify(bodies)); assert.deepEqual(p3.errs, []); await p3.context().close(); }
  log('Qisman topilgan gap: «2 tadan 1 tasi topildi · AI baholaydi: qwzxyv»; AI so\'rovi faqat topilmagan qism; hammasi topilsa — qisman yozuvi va topilmadi yo\'q');
  /* Cheksiz AI akkaunti: «Bugun yana N ta» o'rniga «Cheksiz» */
  for (const [lang, re] of [['uz', /Cheksiz/], ['ru', /Без лимита/]]) { const p4 = await open({ lang, ai: { limit: 2, qoldi: 9999 } }); await p4.click('#mainAdd'); await p4.waitForSelector('#fdQ'); await p4.waitForTimeout(700);
    const body = await p4.locator('#rzSheet').innerText(); assert.match(body, re, lang + ': «Cheksiz»'); assert.doesNotMatch(body, /9999/, lang + ': 9999 ko\'rinmaydi'); assert.deepEqual(p4.errs, []); await p4.context().close(); }
  { const p5 = await open({ ai: { limit: 5, qoldi: 3 } }); await p5.click('#mainAdd'); await p5.waitForSelector('#fdQ'); await p5.waitForTimeout(700); assert.doesNotMatch(await p5.locator('#rzSheet').innerText(), /Cheksiz/, 'belgisiz akkaunt — oddiy son'); await p5.context().close(); }
  log('Cheksiz AI akkaunti (server qoldi = 9999): qo\'shish oynasida «Cheksiz» (UZ/RU), 9999 ko\'rinmaydi; oddiy akkaunt — son');
  /* umumiy qidiruv hodisasi */
  { const c6 = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' }); const seedSt = seed();
    await c6.addInitScript((o) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_lang', 'uz'); localStorage.setItem('kalki_intro_v2', '1'); } } catch (e) {} }, { st: seedSt });
    const p6 = await c6.newPage(); p6.errs = []; p6.on('pageerror', (e) => p6.errs.push(String(e))); await p6.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p6.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await p6.route('**/assets/stat-kun.js*', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: "window.__ev=[];window.KalkiStat={create:function(){var o={add:function(h,k){window.__ev.push([h,k||''])},disabled:function(){return false}};return new Proxy(o,{get:function(t,p){return p in t?t[p]:function(){return null}}})}};" }));
    await p6.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p6.waitForTimeout(700);
    await p6.click('#mainAdd'); await p6.waitForSelector('#fdQ'); await p6.waitForTimeout(400); await p6.fill('#fdQ', 'osh'); await p6.waitForTimeout(3200); await p6.fill('#fdQ', 'zzqxwv'); await p6.waitForTimeout(3200);
    const ev = await p6.evaluate(() => window.__ev.map((x) => x[0])); assert.equal(ev.filter((x) => x === 'qidiruv_jami').length, 2, 'ikki xil so\'rov: ' + ev); assert.equal(ev.filter((x) => x === 'qidiruv_natijasiz').length, 1, 'faqat natijasiz: ' + ev);
    assert.ok((await p6.evaluate(() => window.__ev.filter((x) => /qidiruv_/.test(x[0])).every((x) => x[1] === ''))), 'so\'z/kalit yuborilmaydi'); await c6.close(); }
  log('Umumiy qidiruv hodisasi: «qidiruv_jami» har xil so\'rovga, «qidiruv_natijasiz» natija bo\'lmaganda; so\'z yuborilmaydi');
  console.log('topilmadi: ' + n + ' guruh OK');
} finally { await b.close(); srv.close(); }
