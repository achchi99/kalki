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
  console.log('topilmadi: ' + n + ' guruh OK');
} finally { await b.close(); srv.close(); }
