// KalkiFit «Aktivatsiya voronkasi» — brauzerda: (1) mijoz: ilk_ochilish bir marta (yangi qurilma), eski qurilmada yo'q, birinchi ovqat hodisasi bir marta (usul + vaqt guruhi),
// ovqat nomi/matn yuborilmaydi, bosh ekran belgisi; (2) admin: «Aktivatsiya voronkasi» bloki (platforma ustunlari, taqqoslashlar, usul/vaqt ulushlari, «o'lchanmagan», 360 px siljishsiz).
//   node tools/dizayn/test-aktivatsiya-ui.mjs      (OUT=<papka> — admin skrinshoti)
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs'; import { d1 } from './d1-sqlite.mjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const Dt = S.dates, TODAY = Dt.today();
const STAT = await import(pathToFileURL(path.join(ROOT, 'functions/api/stat.js')).href), ADM = await import(pathToFileURL(path.join(ROOT, 'functions/api/admin/[amal].js')).href);
const SQL = ['stat.sql', 'admin-stat.sql', 'manba.sql', 'aktivatsiya.sql', 'akkaunt.sql', 'zaxira.sql', 'qidiruv.sql'].map((f) => fs.readFileSync(path.join(ROOT, 'migrations', f), 'utf8'));
const db = d1(SQL), NOW = Date.now(), DAY = 86400000, PW = 'test-parol-uzun-24-belgidan-ortiq', env = { KALKIFIT_DB: db, KALKIFIT_ADMIN_PASSWORD: PW, IP_HASH_SALT: 't', STAT_PRUNE_P: '0' };
const U = (i) => '00000000-0000-4000-8000-' + String(i).padStart(12, '0'), UA = { veb: 'Mozilla/5.0 (Windows NT 10.0) Chrome/130', android: 'Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile', 'ios-pwa': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Safari/605.1.15' };
const send = (i, p, h, off, extra = {}) => STAT.qabul(new Request('https://kalki.uz/api/stat', { method: 'POST', headers: { Origin: 'https://kalki.uz', 'User-Agent': UA[p] }, body: JSON.stringify(Object.assign({ q: U(i), p, t: 'uz', h }, extra)) }), env, NOW - off * DAY);
const put = async (i, p, d, o = {}) => { await send(i, p, [['faol', '', 1], ['ilk_ochilish', '', 1]].concat(o.ob ? [['onboarding_tugadi', '', 1]] : [], o.food ? [['ovqat_qoshildi', 'qidiruv', o.food]] : [], o.bo ? [['birinchi_ovqat', o.bo, 1]] : []), d, o.i == null ? {} : { i: o.i }); for (const k of o.back || []) await send(i, p, [['faol', '', 1]], d - k); };
await put(10, 'veb', 10, { ob: 1, food: 3, bo: 'qidiruv.d5', i: 1, back: [1, 3, 7] }); await put(11, 'veb', 10, { ob: 1, food: 1, bo: 'oxirgilar.d30', i: 0, back: [1] }); await put(12, 'veb', 10, { ob: 1, i: 0 }); await put(13, 'android', 10, { ob: 1, food: 2, bo: 'rasm.d5', i: 1, back: [1] }); await put(14, 'ios-pwa', 10, { i: 1 });
await put(15, 'veb', 2, { ob: 1, food: 1, bo: 'ovoz.dx', back: [1] }); await put(16, 'veb', 2, { ob: 1 }); await put(17, 'veb', 0, { ob: 1, food: 1, bo: 'qidiruv.d5' });
await send(700, 'veb', [['faol', '', 1], ['ovqat_qoshildi', 'qidiruv', 3]], 20);
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const noX = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);

/* ---------- (1) mijoz ---------- */
function seed(setup, foods) { const st = S.emptyState(); st.prefs = { tipsDone: true, jokes: false, yemayK: 1, introDone: true }; if (setup) { st.setup = true; st.created = Date.now() - 9 * DAY; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = Dt.addDays(TODAY, -8); S.addWeight(st, TODAY, 80); } return st; }
async function open(o = {}) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((x) => { try { if (sessionStorage.getItem('__a')) return; sessionStorage.setItem('__a', '1'); if (x.st) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_no_fc', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_stat_test', '1'); localStorage.setItem('kalki_lang', 'uz'); Object.keys(x.ls || {}).forEach((k) => localStorage.setItem(k, x.ls[k])); } catch (e) {} }, { st: o.st, ls: o.ls });
  const p = await c.newPage(); p.bodies = []; p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/stat', async (r) => { p.bodies.push(JSON.parse(r.request().postData() || '{}')); await r.fulfill({ status: 204, body: '' }); }); await p.route(/\/api\/(?!stat)/, (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(900); return p;
}
const flush = (p) => p.evaluate(() => window.dispatchEvent(new Event('pagehide'))).then(() => p.waitForTimeout(500));
const evs = (p) => p.bodies.flatMap((x) => (x.h || []).map((h) => h[0] + (h[1] ? '.' + h[1] : '')));
const ls = (p, k) => p.evaluate((x) => localStorage.getItem(x), k);
async function eat(p, q = 'osh') { await p.click('#mainAdd').then(() => p.click('#rzSheet #fdQ')); await p.waitForTimeout(400); await p.fill('#fdQ', q); await p.waitForSelector('[data-act=pickfood]'); await p.waitForTimeout(300); await p.click('[data-act=pickfood] >> nth=0'); await p.waitForSelector('#fsave'); await p.waitForTimeout(300); await p.click('#fsave'); await p.waitForTimeout(800); }
try {
  /* yangi qurilma (holat yo'q): onboarding → ilk_ochilish BIR marta, onboarding vaqti saqlanadi; qayta ochilsa — qayta yuborilmaydi */
  let p = await open({}); await p.waitForSelector('[data-act=obsex]', { timeout: 8000 }); await p.click('[data-act=obsex][data-v=m]'); await p.click('[data-act=oblater]'); await p.waitForSelector('#mainAdd', { timeout: 8000 }); await p.waitForTimeout(500); await flush(p);
  let e = evs(p); assert.equal(e.filter((x) => x === 'ilk_ochilish').length, 1, 'ilk_ochilish — bir marta: ' + e); assert.ok(e.includes('onboarding_keyinroq')); assert.equal(await ls(p, 'kalki_stat_ilk'), '1'); assert.ok(+(await ls(p, 'kalki_stat_obt')) > Date.now() - 60000, 'onboarding tugagan vaqt qurilmada');
  assert.ok(p.bodies.every((x) => x.i === 0 || x.i === 1), 'bosh ekran belgisi har paketda: 0 (oddiy brauzer)'); assert.equal(p.bodies[0].i, 0);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(900); await flush(p); assert.equal(evs(p).filter((x) => x === 'ilk_ochilish').length, 1, 'qayta ochilganda qayta yuborilmaydi');
  /* birinchi ovqat: bir marta, usul + guruh (onboarding'dan < 5 daq — d5), ovqat nomi yo'q */
  await eat(p, 'osh'); await flush(p); e = evs(p); assert.deepEqual(e.filter((x) => /^birinchi_ovqat/.test(x)), ['birinchi_ovqat.qidiruv.d5'], 'birinchi ovqat: usul.guruh'); assert.equal(await ls(p, 'kalki_stat_bo'), '1');
  await eat(p, 'non'); await flush(p); assert.equal(evs(p).filter((x) => /^birinchi_ovqat/.test(x)).length, 1, 'ikkinchi ovqatda qayta yuborilmaydi'); assert.ok(p.bodies.every((x) => Object.keys(x).every((k) => ['q', 'p', 't', 'h', 'e', 'v', 'i'].includes(k)) && x.h.every((h) => !/(^|\W)(osh|non)(\W|$)/i.test(h[1]) && !/\d{2,}/.test(h[1]))), 'ovqat nomi/matn/kkal yuborilmaydi: faqat qat\'iy kalitlar'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Yangi qurilma: onboarding → ilk_ochilish bir marta (qayta ochilganda yo\'q), onboarding vaqti qurilmada; birinchi ovqat bir marta («qidiruv.d5»), ikkinchisida yo\'q; ovqat nomi yuborilmaydi; bosh ekran belgisi 0');
  /* eski qurilma (holat bor): ilk_ochilish va birinchi_ovqat yo'q — o'lchanmaydi */
  p = await open({ st: seed(true) }); await eat(p, 'osh'); await flush(p); e = evs(p); assert.ok(!e.some((x) => /^(ilk_ochilish|birinchi_ovqat)/.test(x)), 'eski qurilma: ' + e); assert.equal(await ls(p, 'kalki_stat_ilk'), '0'); assert.ok(e.includes('ovqat_qoshildi.qidiruv'), 'oddiy hodisa ishlaydi'); await p.context().close();
  log('Eski qurilma (holat bor): ilk_ochilish va birinchi_ovqat yuborilmaydi (o\'lchanmaydi), oddiy hodisalar ishlaydi');
  /* vaqt guruhlari: onboarding tugashidan birinchi ovqatgacha (qurilmadagi vaqt tamg'asi bo'yicha) + belgisiz — dn; bosh ekran: standalone → 1 */
  for (const [min, want] of [[3, 'd5'], [12, 'd30'], [60, 'd120'], [300, 'dx'], [null, 'dn']]) { p = await open({ st: seed(true), ls: Object.assign({ kalki_stat_ilk: '1' }, min == null ? {} : { kalki_stat_obt: String(Date.now() - min * 60000) }) }); await eat(p, 'osh'); await flush(p); assert.deepEqual(evs(p).filter((x) => /^birinchi_ovqat/.test(x)), ['birinchi_ovqat.qidiruv.' + want], min + ' daq → ' + want); await p.context().close(); }
  { const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, serviceWorkers: 'block' }); await c.addInitScript(() => { Object.defineProperty(navigator, 'standalone', { value: true }); localStorage.setItem('kalki_stat_test', '1'); }); const q = await c.newPage(); q.bodies = []; await q.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await q.route('**/api/stat', async (r) => { q.bodies.push(JSON.parse(r.request().postData() || '{}')); await r.fulfill({ status: 204, body: '' }); }); await q.route(/\/api\/(?!stat)/, (r) => r.fulfill({ status: 204, body: '' }));
    await q.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await q.waitForTimeout(800); await flush(q); assert.ok(q.bodies.length && q.bodies.every((x) => x.i === 1), 'standalone → i: 1'); await c.close(); }
  log('Birinchi ovqat vaqt guruhlari: 3 daq → d5, 12 → d30, 60 → d120, 300 → dx, vaqt tamg\'asi yo\'q → dn; bosh ekran (standalone) → i: 1');
  const src = fs.readFileSync(path.join(ROOT, 'assets/kalkifit-app.js'), 'utf8'); assert.match(src, /boFirst\('kechagidek'\)/, '«kechagidek» usuli'); log('«Kechagidek» (ovqat vaqtini takrorlash) birinchi ovqat usuli sifatida belgilanadi');

  /* ---------- (2) admin ---------- */
  for (const w of [1280, 360]) {
    const c = await b.newContext({ viewport: { width: w, height: 900 } }); const pg = await c.newPage(); pg.errs = []; pg.on('pageerror', (er) => pg.errs.push(String(er))); let ck = '';
    await pg.route('**/api/**', async (rt) => { const u = new URL(rt.request().url()), h = Object.assign({}, rt.request().headers(), ck ? { cookie: ck } : {}), m = rt.request().method();
      const rq = new Request('https://kalki.uz' + u.pathname + u.search, { method: m, headers: h, body: m === 'POST' ? rt.request().postData() : undefined });
      const res = u.pathname === '/api/stat' ? await STAT.onRequest({ request: rq, env }) : await ADM.onRequest({ request: rq, env, params: { amal: u.pathname.split('/').pop() } });
      const sc = res.headers.get('Set-Cookie'); if (sc) ck = /Max-Age=0/.test(sc) ? '' : sc.split(';')[0]; await rt.fulfill({ status: res.status, contentType: 'application/json', body: await res.text() }); });
    await pg.goto(BASE + '/admin/kalkifit-statistika.html', { waitUntil: 'networkidle' }); await pg.fill('#pw', PW); await pg.click('#login button'); await pg.waitForSelector('#aktC'); await pg.click('#davr [data-d="30"]'); await pg.waitForTimeout(800); await pg.waitForSelector('#aktT');
    const t = await pg.locator('#aktC').innerText(); assert.match(t, /Aktivatsiya voronkasi/);
    const rows = await pg.locator('#aktT tr').evaluateAll((l) => l.map((r) => [...r.children].map((x) => x.innerText.replace(/\s+/g, ' ').trim()))); assert.deepEqual(rows[0], ['', 'Veb', 'Android ilova', 'iPhone PWA', 'Jami']);
    const R = (name) => rows.find((r) => r[0].startsWith(name)); assert.deepEqual(R('Ilk ochilish').slice(1), ['6', '1', '1', '8']); assert.match(R('Onboarding tugadi')[4], /^7 \/ 8 · 87[.,]5%$/); assert.match(R('Ilk kunda ≥1')[4], /^4 \/ 7 · 57[.,]1%$/); assert.match(R('Ilk kunda ≥3')[4], /^1 \/ 7 · 14[.,]3%$/);
    assert.match(R('D1')[4], /^4 \/ 7 · 57[.,]1%$/); assert.match(R('D3')[4], /^1 \/ 5 · 20%$/); assert.match(R('D7')[4], /^1 \/ 5 · 20%$/); assert.match(R('D7')[1], /^1 \/ 3/); assert.match(R('D7')[3], /^0 \/ 1 · 0%$/, 'iPhone PWA: D7 yetilgan 1 ta, qaytmadi'); assert.match(R('D1')[3], /^0 \/ 1/);
    const sp = (x) => x.replace(/\s+/g, ' '), q1 = sp(await pg.locator('#aktQ').innerText()); assert.match(q1, /Ilk kunda ovqat kiritganlar 4 \/ 4/); assert.match(q1, /Ilk kunda ovqat kiritmaganlar 0 \/ 3/);
    const q2 = sp(await pg.locator('#aktP').innerText()); assert.match(q2, /Bosh ekranga qo'shganlar \(ilk kunda\) 2 \/ 3 · [\d,.]+% 1 \/ 3/); assert.match(q2, /Qo'shmaganlar 1 \/ 2 · [\d,.]+% 0 \/ 2/); assert.match(t, /o'lchanmaganlar[^:]*: 3/);
    const us = sp(await pg.locator('#aktU').innerText()); assert.match(us, /Qidiruv 2 40%/); assert.match(us, /Yaqinda yeganlar 1 20%/); assert.match(us, /Rasm AI 1/); assert.match(us, /Ovoz 1/);
    const vq = sp(await pg.locator('#aktV').innerText()); assert.match(vq, /0–5 daq 2 28[.,]6%/); assert.match(vq, /5–30 daq 1/); assert.match(vq, /2 soat\+ 1/); assert.match(vq, /Birinchi kuni yo'q[^0-9]*(\(shundan[^)]*\) )?3 42[.,]9%/);
    const ol = await pg.locator('#aktC .olchov').innerText(); assert.match(ol, new RegExp("^O'lchov boshlangan: " + STAT.tosh(NOW - 10 * DAY) + ' — undan oldingi qurilmalar o\'lchanmagan: 1 ta')); assert.ok(await noX(pg), w + ' px: gorizontal siljish yo\'q'); assert.deepEqual(pg.errs, []);
    if (process.env.OUT) await pg.locator('#aktC').screenshot({ path: path.join(process.env.OUT, 'aktivatsiya-' + w + '.png') });
    await pg.click('#davr [data-d="7"]'); await pg.waitForTimeout(800); const r7 = await pg.locator('#aktT tr').evaluateAll((l) => l.map((r) => [...r.children].map((x) => x.innerText.replace(/\s+/g, ' ').trim()))); const R7 = (nm) => r7.find((r) => r[0].startsWith(nm));
    assert.deepEqual(R7('Ilk ochilish').slice(1), ['3', '0', '0', '3'], '7 kun: faqat shu davr (bosh 10 kun oldin — davr undan keyin)'); assert.equal(R7('D7')[4], 'yetilmagan', '7 kunlik kogorta: D7 hali yetilmagan — 0 emas'); assert.equal(R7('D1')[2], 'yetilmagan', 'kogorta yo\'q platforma — «yetilmagan»');
    await c.close();
  }
  log('Admin: «Aktivatsiya voronkasi» — platforma ustunlari (veb / Android / PWA / jami), qadamlar n / N · %, D7 kogortasi yo\'q → «yetilmagan», taqqoslashlar (a) va (b), usul va vaqt ulushlari, «O\'lchov boshlangan» + eski qurilmalar «o\'lchanmagan»; 1280 va 360 px — siljishsiz');
} finally { await b.close(); srv.close(); }
console.log('\nHammasi o\'tdi: ' + n + ' ta tekshiruv');
