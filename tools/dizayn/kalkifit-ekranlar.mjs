// KalkiFit: barcha asosiy ekranlarning skrinshoti + avtomatik tekshiruv (matnlar kesishmaydi, ekrandan/kartadan chiqmaydi).
// 360 va 390 px × textZoom 115% × UZ/ЎЗ/RU × yorug'/tungi; Android ilova ko'rinishi (Capacitor mock).
// Ekranlar: tanishtiruv 1–3, Bugun (to'la, bo'sh), qo'shish oqimi (1: «Nima yedingiz?», ovqat vaqti ro'yxati, 2: natijalar, 3: porsiya), Tarix, Profil (tepa/o'rta/past).
//   OUT=<papka> node tools/dizayn/kalkifit-ekranlar.mjs                 TO'LIQ: 14 kombinatsiya × hamma bo'lim, 4 sahifa parallel — ish OXIRIDA bir marta
//   OUT=<papka> node tools/dizayn/kalkifit-ekranlar.mjs --faqat          ITERATSIYA: o'zgargan fayllarga qarab bo'limlar (xarita: FAYL_BOLIM, KALIT), 2 kombinatsiya (390 uz tungi + 360 ru yorug')
//   OUT=<papka> node tools/dizayn/kalkifit-ekranlar.mjs --faqat v56,asosiy   — bo'limlarni qo'lda; --list — nima tanlanishini ko'rsatadi
//   --tez: 3 kombinatsiya (360 dark uz + 390 light ru + 360×640 uz), hamma bo'lim.  EKRAN_PAR=N — parallel sahifalar (standart 4).
//   Yurish paytida kod o'zgarsa (tools/kod-kuzat.cjs) — yurish to'xtatiladi (chiqish kodi 3): eski kod natijasi kerak emas.
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs'; import { pool } from './parallel.mjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const T0 = D.today(); const OUT = process.env.OUT || ''; const TEZ = process.argv.includes('--tez');
if (OUT) fs.mkdirSync(OUT, { recursive: true });
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
function seed(lang, full) {
  const st = S.emptyState(); st.setup = true; st.created = Date.now() - 3 * 86400000; st.prefs = { tipsDone: true, jokes: true, qa: 'on', lpTip: 1, yemayK: 1, introDone: true, suvFrom: T0 }; st.profile = { sex: 'f', preg: false, age: 30, height: 165, weight: 70, act: 3, goal: 'lose', goalWeight: null, job: 'stand' };          /* v51: Android — ish turi tasdiqlangan (qadam krediti bor) */ st.trackStart = D.addDays(T0, -3); S.addWeight(st, T0, 70);
  if (full) { S.addFood(st, T0, { meal: 'b', ts: 1, fid: 'choy', unit: 'piyola', qty: 1, g: 200, kcal: 38, p: 0, f: 0, c: 9, est: false }); S.addFood(st, T0, { meal: 'l', ts: 2, fid: 'osh', unit: 'kosa', qty: 1, g: 300, kcal: 520, p: 18, f: 22, c: 60, est: false }); S.addFood(st, T0, { meal: 'd', ts: 3, fid: null, name: lang === 'ru' ? 'Шовла (половина тарелки, с мясом и морковью)' : "Shovla (yarim tarelka, go'sht va sabzi bilan)", g: 200, kcal: 290, p: 9, f: 10, c: 40, est: true }); S.setWater(st, T0, 3); }
  return st;
}
const MOCK = () => { window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: ['LocalNotifications', 'Share', 'Filesystem', 'Camera', 'Haptics', 'App', 'Qadam'].map((name) => ({ name, methods: [] })),
  nativePromise: (pl, m) => { if (pl === 'Qadam' && m === 'isAvailable') return Promise.resolve(window.__qaState === 'off' ? { available: true, granted: false, enabled: false, source: '', hc: 'none', sensor: true, sensorGranted: false } : window.__qaState === 'nosensor' ? { available: false, granted: false, enabled: false, sensor: false } : { available: true, granted: true, enabled: true, source: 'sensor', hc: 'ok', sensor: true, sensorGranted: true }); if (pl === 'Qadam' && m === 'getDays') return Promise.resolve({ kunlar: [{ sana: (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })(), qadam: 12482 }] }); if (pl === 'App' && m === 'getInfo') return Promise.resolve({ version: '1.0.7', build: 9 }); return Promise.resolve({}); }, addListener: () => ({ remove() {} }) }; };
const ZOOM = (k) => { if (k === 1) return; const apply = (root) => { const els = [root, ...root.querySelectorAll('*')].filter((e) => !e.__z); const sz = els.map((e) => parseFloat(getComputedStyle(e).fontSize)); els.forEach((e, i) => { e.__z = 1; e.style.setProperty('font-size', (sz[i] * k) + 'px', 'important'); }); };
  apply(document.body); new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((x) => { if (x.nodeType === 1) apply(x); }))).observe(document.body, { childList: true, subtree: true }); };
const CHECK = (scope) => {
  const vis = (e) => { const c = getComputedStyle(e); if (c.visibility === 'hidden' || c.display === 'none' || +c.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const root = document.querySelector(scope); if (!root) return { err: 'yo\'q: ' + scope };
  const all = [...root.querySelectorAll('*')].filter((e) => !e.closest('[hidden],[aria-hidden=true],svg,.rz-sr,.sl-vessel,#kfSplash,.sl-fishswim,.rz-tip,.sl-addbar,.ny-bar') && [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) && vis(e));
  /* matn to'rtburchagini overflow:hidden/clip ota-bobolar bilan kesamiz (line-clamp, ellipsis — ko'rinmaydigan qatorlar hisobga olinmaydi); gorizontal aylantiriladigan qator (chiplar) — o'z chegarasi */
  const clipOf = (e) => { let L = -1e9, T = -1e9, R = 1e9, B = 1e9, hs = false; for (let a = e; a && a !== document.body; a = a.parentElement) { const c = getComputedStyle(a); if (c.overflowX !== 'visible' || c.overflowY !== 'visible') { const r = a.getBoundingClientRect(); L = Math.max(L, r.left); T = Math.max(T, r.top); R = Math.min(R, r.right); B = Math.min(B, r.bottom); if (/auto|scroll/.test(c.overflowX)) hs = true; } } return { L, T, R, B, hs }; };
  const sb = [...root.querySelectorAll('.pw-bar')].filter(vis).map((x) => x.getBoundingClientRect().top);          /* v56: qotgan panel ostiga aylanib kirgan kontent — ko'rinmaydi (yopilgan emas) */
  const boxes = all.map((e) => { const rg = document.createRange(); rg.selectNodeContents(e); const cl = clipOf(e); if (sb.length && !e.closest('.pw-bar')) cl.B = Math.min(cl.B, ...sb); const rs = [...rg.getClientRects()].map((r) => ({ left: Math.max(r.left, cl.L), top: Math.max(r.top, cl.T), right: Math.min(r.right, cl.R), bottom: Math.min(r.bottom, cl.B) })).filter((r) => r.right - r.left > 1 && r.bottom - r.top > 1); return { e, rs, hs: cl.hs }; }).filter((x) => x.rs.length);
  const name = (e) => (e.id ? '#' + e.id : '') + '.' + String(e.className || e.tagName).split(' ')[0] + '«' + e.textContent.trim().slice(0, 18) + '»';
  const bad = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const A = boxes[i], B = boxes[j]; if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
    for (const a of A.rs) for (const c of B.rs) { const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (ox > 2 && oy > 2) { bad.push(name(A.e) + ' × ' + name(B.e)); break; } }
  }
  const W = document.documentElement.clientWidth, over = boxes.filter((x) => !x.hs && x.rs.some((r) => r.right > W + 1 || r.left < -1)).map((x) => name(x.e));
  /* ota konteyneridan (karta, tugma) matn chiqib ketmasin */
  const esc = boxes.filter((x) => { if (x.hs) return false; const p = x.e.closest('.rz-card,.sl-card,.sl-meal,button,.rz-row'); if (!p || p === x.e) return false; const pr = p.getBoundingClientRect(); return x.rs.some((r) => r.right > pr.right + 2 || r.left < pr.left - 2); }).map((x) => name(x.e));
  return { bad: [...new Set(bad)], over: [...new Set(over)], esc: [...new Set(esc)], n: boxes.length };
};
const combos = []; for (const w of [360, 390]) for (const lang of ['uz', 'cyr', 'ru']) for (const th of ['light', 'dark']) combos.push({ w, lang, th }); for (const lang of ['uz', 'ru']) combos.push({ w: 360, h: 640, lang, th: 'dark' });          // kichik balandlik 360×640
const ARG = (n) => { const i = process.argv.indexOf('--' + n); return i < 0 ? null : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true); };
const FAQAT = ARG('faqat'), PAR = Math.max(1, Number(process.env.EKRAN_PAR) || 4);
const list = FAQAT ? combos.filter((c) => !c.h && ((c.w === 390 && c.lang === 'uz' && c.th === 'dark') || (c.w === 360 && c.lang === 'ru' && c.th === 'light'))) : TEZ ? combos.filter((c) => (c.w === 360 && !c.h && c.th === 'dark' && c.lang === 'uz') || (c.w === 390 && c.th === 'light' && c.lang === 'ru') || (c.h && c.lang === 'uz')) : combos;
const fails = []; let shots = 0;
const MAKET = path.join(process.env.HOME || '', 'imkoniyatlar-maket.html');
const MAKET2 = path.join(process.env.HOME || '', 'nima-yesam-maket.html');          // «Nima yesam ekan?» maketi: ro'yxat va #d (retsept sahifasi) — yonma-yon
async function yonma2(p, th, nm, hash) {
  const cx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: th }), m = await cx.newPage(); await m.goto('file://' + MAKET2 + hash); await m.waitForTimeout(300);
  const a = (await m.screenshot()).toString('base64'), bb = (await p.screenshot()).toString('base64'); await m.setViewportSize({ width: 800, height: 900 });
  await m.setContent('<body style="margin:0;display:flex;gap:20px;background:#888;padding:10px"><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">maket</figcaption><img width="390" src="data:image/png;base64,' + a + '"></figure><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">ilova</figcaption><img width="390" src="data:image/png;base64,' + bb + '"></figure></body>');
  await m.screenshot({ path: path.join(OUT, nm + '-' + th + '.png'), fullPage: true }); await cx.close();
}          // tasdiqlangan maket (repoda emas): 390×844 da shu holat bilan yonma-yon — «maket | ilova»
const MAKET3 = path.join(process.env.HOME || '', 'plato-maket.html'), PD = require(path.join(ROOT, 'tools/dizayn/plato-demo.cjs'));          // «Vazn trendi» + «Nega sekin ozyapman?» maketi
async function yonma3(p, th, nm, sel) {          // maketda sel (karta yoki oyna) tepaga aylantiriladi — ilovaning shu holati bilan yonma-yon
  const cx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: th }), m = await cx.newPage(); await m.goto('file://' + MAKET3); await m.waitForTimeout(300);
  await m.evaluate((q) => { const e = document.querySelector(q); if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 8); }, sel); await m.waitForTimeout(150);
  const a = (await m.screenshot()).toString('base64'), bb = (await p.screenshot()).toString('base64'); await m.setViewportSize({ width: 800, height: 900 });
  await m.setContent('<body style="margin:0;display:flex;gap:20px;background:#888;padding:10px"><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">maket</figcaption><img width="390" src="data:image/png;base64,' + a + '"></figure><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">ilova</figcaption><img width="390" src="data:image/png;base64,' + bb + '"></figure></body>');
  await m.screenshot({ path: path.join(OUT, nm + '-' + th + '.png'), fullPage: true }); await cx.close();
}
const MAKET4 = path.join(process.env.HOME || '', 'tartib-maket.html');          // «Mening tartibim» maketi: 860 px da ikki telefon (0 — tanlov, 1 — Bugun)
async function yonma4(p, th, nm, idx) {
  const cx = await b.newContext({ viewport: { width: 860, height: 900 }, colorScheme: th }), m = await cx.newPage(); await m.goto('file://' + MAKET4); await m.waitForTimeout(300);
  const a = (await m.locator('.ph').nth(idx).screenshot()).toString('base64'), bb = (await p.screenshot()).toString('base64');
  await m.setContent('<body style="margin:0;display:flex;gap:20px;background:#888;padding:10px"><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">maket</figcaption><img width="390" src="data:image/png;base64,' + a + '"></figure><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">ilova</figcaption><img width="390" src="data:image/png;base64,' + bb + '"></figure></body>');
  await m.screenshot({ path: path.join(OUT, nm + '-' + th + '.png'), fullPage: true }); await cx.close();
}
const MAKET5 = path.join(process.env.HOME || '', 'profil-maket.html');          // v50 maketi: 1290 px da uch telefon (0 — Bugun BJU + hazil, 1 — Profil, 2 — Kun tartibi)
const MAKET10 = path.join(process.env.HOME || '', 'mashq2-maket.html');          // v59: 2 telefon (0 — halqa «i» + «Hisob ›» qatori, 1 — mashg'ulot qo'shish oynasi)
const MAKET9 = path.join(process.env.HOME || '', 'sodda-maket.html');          // v58: 2 telefon (0 — Bugun: bitta raqam + chiplar, 1 — «N kkal qanday chiqdi?»)
const MAKET8 = path.join(process.env.HOME || '', 'harakat-maket.html'), MAKET8B = path.join(process.env.HOME || '', 'balans-variant.html');          // v56: 3 telefon (0 — Bugun balans + harakat, 1 — bo'sh / to'lgan kartalar, 2 — tahrir oynasi); balans — A «Ikki chiziq» (.col 0)
async function yonmaG(p, th, nm, file, sel, idx) {
  const cx = await b.newContext({ viewport: { width: 1290, height: 900 }, colorScheme: th }), m = await cx.newPage(); await m.goto('file://' + file); await m.waitForTimeout(800);
  const a = (await m.locator(sel).nth(idx).screenshot()).toString('base64'), bb = (await p.screenshot()).toString('base64');
  await m.setContent('<body style="margin:0;display:flex;gap:20px;background:#888;padding:10px;align-items:flex-start"><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">maket</figcaption><img width="390" src="data:image/png;base64,' + a + '"></figure><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">ilova</figcaption><img width="390" src="data:image/png;base64,' + bb + '"></figure></body>');
  await m.screenshot({ path: path.join(OUT, nm + '-' + th + '.png'), fullPage: true }); await cx.close();
}
const MAKET6 = path.join(process.env.HOME || '', 'afsona-maket.html');          // v54 «Afsona yoki haqiqat?» maketi: 1290 px da uch telefon (0 — Bugun kunning savoli, 1 — savol, 2 — javob)
async function yonma6(p, th, nm, idx) {
  const cx = await b.newContext({ viewport: { width: 1290, height: 900 }, colorScheme: th }), m = await cx.newPage(); await m.goto('file://' + MAKET6); await m.waitForTimeout(800);
  const a = (await m.locator('.ph').nth(idx).screenshot()).toString('base64'), bb = (await p.screenshot()).toString('base64');
  await m.setContent('<body style="margin:0;display:flex;gap:20px;background:#888;padding:10px"><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">maket</figcaption><img width="390" src="data:image/png;base64,' + a + '"></figure><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">ilova</figcaption><img width="390" src="data:image/png;base64,' + bb + '"></figure></body>');
  await m.screenshot({ path: path.join(OUT, nm + '-' + th + '.png'), fullPage: true }); await cx.close();
}
async function yonma5(p, th, nm, idx) {
  const cx = await b.newContext({ viewport: { width: 1290, height: 900 }, colorScheme: th }), m = await cx.newPage(); await m.goto('file://' + MAKET5); await m.waitForTimeout(2000);
  const a = (await m.locator('.ph').nth(idx).screenshot()).toString('base64'), bb = (await p.screenshot()).toString('base64');
  await m.setContent('<body style="margin:0;display:flex;gap:20px;background:#888;padding:10px"><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">maket</figcaption><img width="390" src="data:image/png;base64,' + a + '"></figure><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">ilova</figcaption><img width="390" src="data:image/png;base64,' + bb + '"></figure></body>');
  await m.screenshot({ path: path.join(OUT, nm + '-' + th + '.png'), fullPage: true }); await cx.close();
}
async function yonma(p, th, nm) {
  const cx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: th }), m = await cx.newPage(); await m.goto('file://' + MAKET); await m.waitForTimeout(300); await m.click('.fb'); await m.waitForTimeout(900);
  if (/-3$/.test(nm)) { await m.evaluate(() => { document.getElementById('dr').scrollTop = 1e5; }); await m.waitForTimeout(200); }
  const a = (await m.screenshot()).toString('base64'), bb = (await p.screenshot()).toString('base64'); await m.setViewportSize({ width: 800, height: 900 });
  await m.setContent('<body style="margin:0;display:flex;gap:20px;background:#888;padding:10px"><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">maket</figcaption><img width="390" src="data:image/png;base64,' + a + '"></figure><figure style="margin:0"><figcaption style="font:600 14px sans-serif;color:#fff">ilova</figcaption><img width="390" src="data:image/png;base64,' + bb + '"></figure></body>');
  await m.screenshot({ path: path.join(OUT, nm + '-' + th + '.png'), fullPage: true }); await cx.close();
}
/* bir kombinatsiya (o'lcham × til × tema) uchun yordamchilar: mk (yangi kontekst), shot, scan, mainAt */
function yordam(c) {
  const tag = `${c.w}${c.h ? 'x' + c.h : ''}-${c.lang}-${c.th}`;
  const mk = async (st, extra) => { const ctx = await b.newContext({ viewport: { width: c.w, height: c.h || 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: c.th, userAgent: 'Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130 Mobile Safari/537.36' });
    await ctx.addInitScript((o) => { try { localStorage.clear(); if (o.st) localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_lang', o.lang); localStorage.setItem('kalki_theme', o.th); if (!o.intro) localStorage.setItem('kalki_intro_v2', '1'); } catch (e) {} window.__qaState = o.qa || 'on'; }, { st, lang: c.lang, th: c.th, intro: !!(extra && extra.intro), qa: extra && extra.qa });
    await ctx.addInitScript(MOCK); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e)));
    await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: /ovoz/.test(r.request().url()) ? '{"yoqilgan":true,"limit":15,"qoldi":15}' : /retsept/.test(r.request().url()) ? '{"limit":5,"qoldi":3}' : '{}' }));
    await p.goto(BASE + (c.lang === 'ru' ? '/ru/kalkifit' : c.lang === 'cyr' ? '/kalkifit?lang=cyr' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(1300); await p.evaluate(ZOOM, process.env.ZOOM ? +process.env.ZOOM : 1.15); await p.waitForTimeout(250); return p; };
  /* qotgan tugma (Tarix «+», Bugun «Qo'shish») aylantiriladigan kontentning KO'RINADIGAN qismi bilan kesishmasin (karta «›», ovqat vaqti «+» va h.k. yopilmasin) */
  const FAB = () => { const m = document.getElementById('rzMain'), mr = m.getBoundingClientRect(), sh = document.getElementById('rzSheet'); if (sh && !sh.hidden && sh.classList.contains('open')) return [];
    const fx = ['rzFab', 'rzAddBar'].map((id) => document.getElementById(id)).filter((e) => e && !e.hidden && getComputedStyle(e).display !== 'none').map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0);
    const out = []; m.querySelectorAll('button, a, [data-act], .rz-i, b, span, p, h2, h3, svg').forEach((e) => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return; const t = Math.max(r.top, mr.top), bt = Math.min(r.bottom, mr.bottom); if (bt - t < 2) return;
      for (const f of fx) if (Math.min(r.right, f.right) - Math.max(r.left, f.left) > 2 && Math.min(bt, f.bottom) - Math.max(t, f.top) > 2) { out.push((e.id ? '#' + e.id : '') + '.' + String(e.className && e.className.baseVal != null ? e.className.baseVal : e.className).split(' ')[0]); break; } });
    return [...new Set(out)].slice(0, 4); };
  const shot = async (p, nm) => { shots++; const h = await p.evaluate(FAB).catch(() => []); if (h.length) fails.push(tag + ' ' + nm + ': qotgan tugma kontentni yopadi — ' + h.join(', ')); if (OUT) await p.screenshot({ path: path.join(OUT, `${nm}-${tag}.png`) }); };
  const scan = async (p, where, scope) => { const x2 = await p.evaluate((sc) => { const root = document.querySelector(sc); if (!root) return null; const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }; return { tl: [...root.querySelectorAll('.sl-tile.sl-tl')].filter(vis).length, pt: [...root.querySelectorAll('.nm, b')].filter(vis).map((e) => e.textContent).filter((t) => /\(\s*\d+([.,]\d+)?\s*(porsiya|порци|dona|шт|g|г|ml|мл|kosa|piyola|stakan)\b[^)]*\)\s*$/i.test(t)).slice(0, 3) }; }, scope); if (x2 && x2.tl) fails.push(tag + ' ' + where + ': harf-zaglushka ' + x2.tl + ' ta'); if (x2 && x2.pt.length) fails.push(tag + ' ' + where + ': nomga yopishgan miqdor: ' + x2.pt.join(' | ')); const gl = await p.evaluate((sc) => { const root = document.querySelector(sc); if (!root) return []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), o = []; let n; while ((n = w.nextNode())) { const e = n.parentElement; if (!e || !e.getClientRects().length) continue; const m = n.textContent.match(/[\u25A1\uFFFD\u2070\u2080]/); if (m) o.push(m[0] + ' «' + n.textContent.trim().slice(0, 24) + '»'); } return o.slice(0, 3); }, scope); if (gl.length) fails.push(tag + ' ' + where + ': buzilgan belgi (□ / ₀ / ⁰ / �): ' + gl.join(' | '));          // v56: emoji/ikonka o'rniga quti yoki «₀⁰» chiqmasin
    const r = await p.evaluate(CHECK, scope); if (r.err) { fails.push(tag + ' ' + where + ': ' + r.err); return; } if (r.bad.length) fails.push(tag + ' ' + where + ' KESISHADI: ' + r.bad.slice(0, 4).join(' | ')); if (r.over.length) fails.push(tag + ' ' + where + ' ekrandan chiqadi: ' + r.over.slice(0, 4).join(' | ')); if (r.esc.length) fails.push(tag + ' ' + where + ' kartadan chiqadi: ' + r.esc.slice(0, 4).join(' | ')); };
  const mainAt = async (p, f) => { await p.evaluate((f) => { const m = document.getElementById('rzMain'); m.scrollTop = f === 'past' ? m.scrollHeight : f === 'orta' ? m.scrollHeight / 2 - m.clientHeight / 2 : 0; }, f); await p.waitForTimeout(250); };
  return { tag, mk, shot, scan, mainAt };
}
/* BO'LIMLAR — har biri o'z kontekstini ochadi va yopadi (mustaqil): parallel yurishi va --faqat bilan tanlanishi mumkin */
const BOLIM = {};
BOLIM['tanishtiruv'] = async (c, { tag, mk, shot, scan, mainAt }) => { let p;
  /* tanishtiruv (yangi foydalanuvchi, til tanlangan) */
  p = await mk(null, { intro: true });
  for (let i = 1; i <= 3; i++) { await p.waitForSelector('#rzIntro .in-body'); await p.waitForTimeout(1900); await scan(p, 'Tanishtiruv ' + i, '#rzIntro'); await shot(p, 'tanishtiruv' + i); if (i < 3) await p.click('#rzIntro [data-act=innext]'); }
  await p.click('#rzIntro [data-act=ingo]'); await p.waitForTimeout(500); await shot(p, 'onboarding'); if (p.errs.length) fails.push(tag + ' JS: ' + p.errs[0]); await p.context().close();
};
BOLIM['bosh'] = async (c, { tag, mk, shot, scan, mainAt }) => { let p;
  /* Bugun (bo'sh) */
  p = await mk(seed(c.lang, false)); await scan(p, 'Bugun bo\'sh', '#rzMain'); await shot(p, 'bugun-bosh'); await p.context().close();
};
BOLIM['asosiy'] = async (c, { tag, mk, shot, scan, mainAt }) => { let p;
  /* Bugun (to'la), Qo'shish, Yozish, Tarix, Profil */
  p = await mk(seed(c.lang, true)); await scan(p, 'Bugun', '#rzMain'); await shot(p, 'bugun');
  { const r = await p.evaluate(() => { const big = document.querySelector('.sl-big').getBoundingClientRect(), v = document.querySelector('#kcalBtn svg').getBoundingClientRect(), bb = document.getElementById('kChips'), br = bb ? bb.getBoundingClientRect() : null; return { inCard: v.left >= big.left - 0.5 && v.right <= big.right + 0.5 && v.top >= big.top - 0.5, gap: br ? Math.round(br.top - v.bottom) : -1, old: document.querySelectorAll('.sl-rsub, #kGoal').length, bal: !!bb && br.bottom <= big.bottom + 0.5 }; });          // v56: «iste'mol · maqsad» qatori o'rniga balans bloki
    if (!r.inCard) fails.push(tag + ' halqa kartadan chiqqan'); if (r.gap < 12) fails.push(tag + ' halqa ostidagi chiplar ' + r.gap + ' px (≥12 kerak)'); if (r.old) fails.push(tag + ' eski «iste\'mol · maqsad» qatori qolgan'); if (!r.bal) fails.push(tag + ' chiplar kartada emas'); if (await p.locator('#balBtn, .bl-a').count()) fails.push(tag + ' v58: balans bloki qolgan'); }
  await p.evaluate(() => { const m = document.getElementById('rzMain'), c = document.getElementById('bjuCard'); m.scrollTop = c.offsetTop - 330; }); await p.waitForTimeout(250); await shot(p, 'bju');
  { const r = await p.evaluate(() => { const c = document.getElementById('bjuCard'); if (!c) return null; const cr = c.getBoundingClientRect(), du = document.querySelector('.sl-duo').getBoundingClientRect(), ml = document.querySelector('.sl-meal, .sl-meals').getBoundingClientRect(), cols = [...c.querySelectorAll('.mc')].map((e) => { const er = e.getBoundingClientRect(); return er.right <= cr.right + 1 && er.left >= cr.left - 1 && [...e.querySelectorAll('.mh, .mv')].every((x) => x.scrollWidth <= x.clientWidth + 1); }), tip = c.querySelector('.bj-tip');          // v50: BJU 3 ustun + oqsil maslahati
    return { h: Math.round(cr.height), after: cr.top >= du.bottom - 1, before: cr.bottom <= ml.top, cols, tip: !!tip && (function () { const rg = document.createRange(); rg.selectNodeContents(tip); return new Set([...rg.getClientRects()].map((q) => Math.round(q.top))).size === 1; })() }; });
    if (!r) fails.push(tag + ' BJU kartasi yo\'q'); else { if (!r.after || !r.before) fails.push(tag + ' BJU kartasi suvdan keyin/ovqatlardan oldin emas'); if (r.h > 170) fails.push(tag + ' BJU kartasi balandligi ' + r.h); if (r.cols.length !== 3 || r.cols.some((x) => !x)) fails.push(tag + ' BJU ustunlari sig\'madi'); if (!r.tip) fails.push(tag + ' oqsil maslahati bitta qatorda emas'); } }
  { const d = await p.evaluate(() => { const w = document.querySelector('.sl-exc').getBoundingClientRect(), st = document.querySelector('.sl-s'), wc = document.getElementById('wCard'); return { two: !!st && !st.parentNode.classList.contains('one'), side: !!st && Math.abs(st.getBoundingClientRect().top - w.top) < 4 && w.left > st.getBoundingClientRect().right - 1, wOne: !!wc && wc.parentNode.classList.contains('one'), bar: !!document.getElementById('wBar') }; }); if (!d.two || !d.side || !d.wOne || !d.bar) fails.push(tag + ' Android: qadam va mashg\'ulot yonma-yon, suv alohida ixcham qator bo\'lishi kerak ' + JSON.stringify(d)); }          /* v55 */
  { const g = await p.evaluate(() => { const m = document.getElementById('rzMain'), bar = document.getElementById('rzAddBar').getBoundingClientRect(), mr = m.getBoundingClientRect(); m.scrollTop = m.scrollHeight; const last = [...m.children].filter((e) => e.getBoundingClientRect().height > 0).pop().getBoundingClientRect(); return { mainBottom: mr.bottom, barTop: bar.top, lastBottom: last.bottom, barH: bar.height }; }); if (g.mainBottom > g.barTop + 1) fails.push(tag + ' Bugun: kontent «Qo\'shish» tugmasi ostiga o\'tadi ' + JSON.stringify(g)); if (g.lastBottom > g.mainBottom - 15) fails.push(tag + ' Bugun: oxirgi element tagida 16 px bo\'shliq yo\'q ' + JSON.stringify(g)); await mainAt(p, 'tepa'); } await mainAt(p, 'past'); await scan(p, 'Bugun past', '#rzMain'); await shot(p, 'bugun-past'); await mainAt(p, 'tepa');
  /* «Imkoniyatlar» tugmasi (390 px — sarlavha yonida, tor ekranda sana ostida) va CHAP paneli (maket: ~/imkoniyatlar-maket.html — 390 px'da yonma-yon rasm) */
  { await p.evaluate(() => { document.getElementById('rzMain').scrollTop = 0; }); await p.waitForTimeout(200);
    const r = await p.evaluate(() => { const b = document.getElementById('ftBtn'), d = document.querySelector('.sl-hd2 .d'), big = document.querySelector('.sl-big'); if (!b) return null; const br = b.getBoundingClientRect(), dr = d.getBoundingClientRect(), bg = big.getBoundingClientRect(), kids = [...b.children].map((e) => e.getBoundingClientRect()); return { txt: b.textContent.trim(), right: br.right <= innerWidth - 8, left: br.left >= 8, clip: kids.some((k) => k.right > br.right + 0.5) || b.querySelector('b').scrollWidth > b.querySelector('b').clientWidth + 1, h: Math.round(br.height), noOverlap: br.bottom <= bg.top + 1, titleOk: br.left >= dr.right - 1 || br.top >= dr.bottom - 2 }; });
    if (!r) fails.push(tag + ' «Imkoniyatlar» tugmasi yo\'q'); else { if (!r.txt) fails.push(tag + ' tugma yozuvi bo\'sh'); if (!r.right || !r.left) fails.push(tag + ' tugma ekrandan chiqdi'); if (r.clip) fails.push(tag + ' tugma yozuvi qisqardi'); if (r.h < 44) fails.push(tag + ' tugma balandligi ' + r.h); if (!r.noOverlap || !r.titleOk) fails.push(tag + ' tugma sarlavha/halqa bilan to\'qnashdi: ' + JSON.stringify(r)); }
    await p.click('#ftBtn'); await p.waitForTimeout(1300); await scan(p, 'Imkoniyatlar paneli', '#ftDr'); await shot(p, 'imkoniyatlar');
    const q = await p.evaluate(() => { const dr = document.getElementById('ftDr'), t = [...dr.querySelectorAll('.ft-t')], r = dr.getBoundingClientRect(); return { n: t.length, rows: new Set(t.map((e) => Math.round(e.getBoundingClientRect().top))).size, w: Math.round(r.width), left: Math.round(r.left), grp: dr.querySelectorAll('.ft-grp').length, items: dr.querySelectorAll('[data-act=feat]').length, cnt: +document.querySelector('#ftBtn .n').textContent, clipX: dr.scrollWidth > dr.clientWidth + 1, tileClip: t.some((e) => [...e.querySelectorAll('b,small')].some((x) => x.getBoundingClientRect().right > e.getBoundingClientRect().right + 0.5)) }; });
    if (q.n < 2 || q.rows !== 1) fails.push(tag + ' tez qo\'shish kartalari: ' + JSON.stringify(q)); if (q.grp < 4) fails.push(tag + ' guruhlar: ' + q.grp); if (q.items !== q.cnt) fails.push(tag + ' son nishoni ' + q.cnt + ' ≠ ' + q.items); if (q.clipX || q.tileClip) fails.push(tag + ' panel/karta matni sig\'madi'); if (q.left !== 0 || q.w !== Math.round(Math.min(c.w * 0.86, 360))) fails.push(tag + ' panel o\'lchami ' + q.left + '/' + q.w);
    if (OUT && c.w === 390 && !c.h && c.lang === 'uz' && fs.existsSync(MAKET)) await yonma(p, c.th, 'imkoniyatlar-maket-2');
    await p.evaluate(() => { document.getElementById('ftDr').scrollTop = 1e5; }); await p.waitForTimeout(300); await scan(p, 'Imkoniyatlar paneli (past)', '#ftDr'); await shot(p, 'imkoniyatlar-past');
    if (OUT && c.w === 390 && !c.h && c.lang === 'uz' && fs.existsSync(MAKET)) await yonma(p, c.th, 'imkoniyatlar-maket-3');
    await p.keyboard.press('Escape'); await p.waitForTimeout(450); if (await p.evaluate(() => !document.getElementById('ftDr').hidden)) fails.push(tag + ' Escape panelni yopmadi'); }
  /* hazil pufagi: [+] bilan qo'shilgach varaq yopilganda kaloriya kartasi ustida ko'rinadi (v41 regressiya: varaq ostida qolib ko'rinmay o'tardi) */
  { await p.evaluate(() => { document.getElementById('rzMain').scrollTop = 0; }); await p.click('#mainAdd'); await p.waitForTimeout(600); await p.fill('#rzSheet #fdQ', c.lang === 'ru' ? 'плов' : (c.lang === 'cyr' ? 'ош' : 'osh')); await p.waitForTimeout(600); await p.click('#fdRes .sl-pl >> nth=0'); await p.waitForTimeout(500);
    await p.waitForTimeout(4300); await p.keyboard.press('Escape'); await p.waitForTimeout(900); await p.evaluate(() => { const e = document.querySelector('.sl-big #jLine'); if (e) e.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(300);          // v50: hazil oqimda (halqa kartasi ichida) — pastda bo'lsa aylantiriladi
    const j = await p.evaluate(() => { const e = document.querySelector('.sl-big #jLine'); if (!e) return null; const r = e.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2), bg = document.querySelector('.sl-big').getBoundingClientRect(); return { onTop: !!hit && (hit === e || e.contains(hit)), inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, inCard: r.left >= bg.left - 1 && r.right <= bg.right + 1 && r.bottom <= bg.bottom + 1, clip: e.scrollHeight > e.clientHeight + 1 }; });
    if (!j) fails.push(tag + ' hazil pufagi varaq yopilgach ko\'rinmadi'); else { if (!j.onTop || !j.inView || !j.inCard) fails.push(tag + ' hazil pufagi yopilgan/ekrandan chiqqan: ' + JSON.stringify(j)); if (j.clip) fails.push(tag + ' hazil matni kesildi'); await scan(p, 'Hazil pufagi', '#jLine'); await shot(p, 'hazil'); }
    await p.waitForTimeout(4400); }
  /* «Nima yesam ekan?» (maket: ~/nima-yesam-maket.html; 390 uz — yonma-yon): ro'yxat, retsept sahifasi (tepa/past), Kafeda; balandlik barqaror, faqat ro'yxat aylanadi */
  { await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(300); await p.click('[data-act=ftopen]'); await p.waitForTimeout(600); await p.click('#ftDr [data-fk=yeymiz]'); await p.waitForSelector('#nyList .ny-it'); await p.waitForTimeout(500);
    const H = []; const hh = async () => H.push(await p.evaluate(() => Math.round(document.getElementById('rzSheet').getBoundingClientRect().height)));
    await hh(); await scan(p, 'Nima yesam (ro\'yxat)', '#rzSheet'); await shot(p, 'nima-1'); if (OUT && c.w === 390 && !c.h && c.lang === 'uz' && fs.existsSync(MAKET2)) await yonma2(p, c.th, 'nima-maket-1', '');
    const lt = await p.evaluate(() => { const l = document.querySelector('#nyList .ny-it'); return [...document.querySelectorAll('#nyList .sl-tile.sl-tl')].length; }); if (lt) fails.push(tag + ' Nima yesam: harf-zaglushka ' + lt + ' ta');
    await p.click('#nyList .ny-m >> nth=2'); await p.waitForTimeout(600); await hh(); await scan(p, 'Nima yesam (retsept)', '#nyDt'); await shot(p, 'nima-2'); if (OUT && c.w === 390 && !c.h && c.lang === 'uz' && fs.existsSync(MAKET2)) await yonma2(p, c.th, 'nima-maket-2', '#d');
    await p.evaluate(() => { document.querySelector('#nyDt .ny-db').scrollTop = 1e5; }); await p.waitForTimeout(250); await scan(p, 'Nima yesam (retsept past)', '#nyDt'); await shot(p, 'nima-3');
    await p.click('#nyDt [data-act=nyback]'); await p.waitForTimeout(450); await p.click('#rzSheet [data-act=yeseg][data-s=kafe]'); await p.waitForTimeout(400); await hh(); await scan(p, 'Nima yesam (Kafeda)', '#rzSheet'); await shot(p, 'nima-4');
    await p.click('#rzSheet [data-act=yeseg][data-s=buyurtma]'); await p.waitForTimeout(400); await hh(); await p.click('#rzSheet [data-act=yeseg][data-s=uyda]'); await p.waitForTimeout(300); await p.click('#rzSheet [data-act=nyhave]'); await p.waitForTimeout(500); await scan(p, 'Nima yesam (uyda bor)', '#nyDt'); await shot(p, 'nima-5'); await p.click('#nyDt [data-act=nyback]'); await p.waitForTimeout(450);
    if (new Set(H).size !== 1) fails.push(tag + ' Nima yesam: balandlik sakraydi ' + H);
    const o = await p.evaluate(() => { const sh = document.getElementById('rzSheet'); return { x: sh.scrollWidth > sh.clientWidth + 1 || document.documentElement.scrollWidth > innerWidth + 1, small: [...sh.querySelectorAll('.ny *')].filter((e) => [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 14.9).length, heavy: [...sh.querySelectorAll('.ny *')].filter((e) => [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) && +getComputedStyle(e).fontWeight > 600).length }; });
    if (o.x) fails.push(tag + ' Nima yesam: gorizontal siljish'); if (o.small) fails.push(tag + ' Nima yesam: 15 px dan kichik matn ' + o.small); if (o.heavy) fails.push(tag + ' Nima yesam: og\'irlik > 600: ' + o.heavy);
    await p.click('#rzSheet [data-act=sheetclose]'); await p.waitForTimeout(450); }
  /* qo'shish oqimi (maket: 3 ekran) — 1) «Nima yedingiz?» 2) «osh» natijalari 3) porsiya */
  await p.click('#mainAdd'); await p.waitForTimeout(700); await scan(p, 'Qo\'shish 1', '#rzSheet'); await shot(p, 'qoshish');
  { const t = await p.evaluate(() => { const sh = document.getElementById('rzSheet'), two = [...sh.querySelectorAll('.kq-two .kq-b2')].map((e) => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), clip: e.scrollWidth > e.clientWidth + 1 }; }), m = sh.querySelector('#kqMeal'), q = sh.querySelector('#fdQ'), mic = sh.querySelector('.kq-srch .kq-mic');
      return { two, meal: !!m && m.getBoundingClientRect().right <= innerWidth, focus: document.activeElement === q, mic: !!mic, rc: sh.querySelectorAll('#fdRecent .sl-rw').length, bottom: Math.round(sh.getBoundingClientRect().bottom), vh: innerHeight }; });
    if (t.two.length < 1) fails.push(tag + ' rasm/menyu tugmasi yo\'q'); else { if (new Set(t.two.map((x) => x.top)).size !== 1) fails.push(tag + ' rasm/menyu bitta qatorda emas'); if (t.two.some((x) => x.clip)) fails.push(tag + ' rasm/menyu matni sig\'madi'); }
    if (!t.meal) fails.push(tag + ' ovqat vaqti chipi ko\'rinmaydi'); if (t.focus) fails.push(tag + ' klaviatura o\'zi ochildi (fokus)'); if (!t.mic) fails.push(tag + ' qidiruvda mikrofon yo\'q'); if (t.rc < 1 || t.rc > 8) fails.push(tag + ' Yaqinda: ' + t.rc + ' qator'); }
  await p.click('#kqMeal'); await p.waitForTimeout(250); { const n = await p.locator('#kqMM:not([hidden]) [data-act=qmealset]').count(); if (n !== 4) fails.push(tag + ' ovqat vaqti ro\'yxati: ' + n); } await scan(p, 'Ovqat vaqti', '#kqMM'); await shot(p, 'qoshish-vaqt'); await p.click('#kqMeal'); await p.waitForTimeout(200);
  await p.fill('#rzSheet #fdQ', c.lang === 'ru' ? 'плов' : (c.lang === 'cyr' ? 'ош' : 'osh')); await p.waitForTimeout(700); await scan(p, 'Qo\'shish 2', '#rzSheet'); await shot(p, 'qidiruv');
  { const t = await p.evaluate(() => ({ pick: document.getElementById('fdPickW').hidden, n: document.querySelectorAll('#fdRes .sl-rw').length, plus: document.querySelectorAll('#fdRes .sl-rw .sl-pl').length })); if (!t.pick) fails.push(tag + ' natijada tugmalar/Yaqinda yashirinmadi'); if (t.n < 3 || t.plus !== t.n) fails.push(tag + ' natijalar: ' + t.n + ' qator, + ' + t.plus); }
  await p.click('#fdRes .sl-rw .sl-rr'); await p.waitForTimeout(700); await shot(p, 'porsiya');
  { const t = await p.evaluate(() => { const ch = [...document.querySelectorAll('#fdQuick .kq-chip')].map((e) => Math.round(e.getBoundingClientRect().top)), cta = document.getElementById('fsave').getBoundingClientRect(); return { ch, cta: cta.bottom <= innerHeight + 1 && cta.top >= 0 }; });
    if (t.ch.length !== 4 || new Set(t.ch).size !== 1) fails.push(tag + ' porsiya tugmalari: ' + JSON.stringify(t.ch)); if (!t.cta) fails.push(tag + ' «… qo\'shish» tugmasi ekranda emas'); }
  await p.evaluate(() => { const sh = document.getElementById('rzSheet'); sh.scrollTop = sh.scrollHeight; }); await p.waitForTimeout(250); await scan(p, 'Qo\'shish 3 (past)', '#rzSheet');          // yopishqoq tugma ostidan o'tgan qism — pastga aylantirilganda hammasi ochiq
  await p.click('#rzSheet [data-act=sheetclose]'); await p.waitForTimeout(500);
  await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(800); await scan(p, 'Tarix', '#rzMain'); await shot(p, 'tarix'); await mainAt(p, 'orta'); await shot(p, 'tarix-orta'); await mainAt(p, 'past'); await shot(p, 'tarix-past');
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(800); await scan(p, 'Profil', '#rzMain'); await shot(p, 'profil'); await mainAt(p, 'orta'); await shot(p, 'profil-orta'); await mainAt(p, 'past'); await shot(p, 'profil-past');
  if (p.errs.length) fails.push(tag + ' JS: ' + p.errs[0]); await p.context().close();
};
BOLIM['plato'] = async (c, { tag, mk, shot, scan, mainAt }) => { let p;
  /* «Vazn trendi» + «Nega sekin ozyapman?» (demo foydalanuvchi: 1-hafta suv, kechki ovqat yozilmagan, qadam kamaygan, oqsil kam) */
  { p = await mk(PD.build('demo', S)); await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(900);
    await p.evaluate(() => { const m = document.getElementById('rzMain'), w = document.querySelector('.pl-w'); m.scrollTop = w.offsetTop - 12; }); await p.waitForTimeout(400);
    await scan(p, 'Vazn trendi', '.pl-w'); await shot(p, 'plato-trend'); if (OUT && c.w === 390 && !c.h && c.lang === 'uz' && fs.existsSync(MAKET3)) await yonma3(p, c.th, 'plato-maket-1', '.c');
    const t = await p.evaluate(() => ({ ch: !!document.querySelector('.pl-w svg .avg'), band: !!document.querySelector('.pl-w svg .wb'), note: !!document.getElementById('plWater'), cta: !!document.getElementById('plCta'), x: document.documentElement.scrollWidth > innerWidth + 1 }));
    if (!t.ch || !t.cta) fails.push(tag + ' Vazn trendi: chiziq/karta yo\'q ' + JSON.stringify(t)); if (t.x) fails.push(tag + ' Vazn trendi: gorizontal siljish');
    await p.click('#plCta'); await p.waitForTimeout(800); await scan(p, 'Nega sekin (tepa)', '#rzSheet'); await shot(p, 'plato-1'); if (OUT && c.w === 390 && !c.h && c.lang === 'uz' && fs.existsSync(MAKET3)) await yonma3(p, c.th, 'plato-maket-2', '.sh');
    const o = await p.evaluate(() => { const sh = document.getElementById('rzSheet'); return { n: sh.querySelectorAll('.pl-cs').length, tr: sh.querySelectorAll('.pl-ti').length, x: sh.scrollWidth > sh.clientWidth + 1, small: [...sh.querySelectorAll('*')].filter((e) => [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 14.9 && !e.closest('svg')).map((e) => e.className).slice(0, 3), heavy: [...sh.querySelectorAll('*')].filter((e) => +getComputedStyle(e).fontWeight > 700).length }; });
    if (o.n < 1 || o.tr < 2) fails.push(tag + ' Nega sekin: sabab/ish yo\'q ' + JSON.stringify(o)); if (o.x) fails.push(tag + ' Nega sekin: gorizontal siljish'); if (o.small.length) fails.push(tag + ' Nega sekin: 15 px dan kichik ' + o.small); if (o.heavy) fails.push(tag + ' Nega sekin: og\'irlik > 700');
    await p.evaluate(() => { const sh = document.getElementById('rzSheet'); sh.scrollTop = sh.scrollHeight; }); await p.waitForTimeout(250); await p.click('#rzSheet [data-act=plsrc]'); await p.waitForTimeout(300);
    await p.evaluate(() => { const sh = document.getElementById('rzSheet'); sh.scrollTop = sh.scrollHeight; }); await p.waitForTimeout(250); await scan(p, 'Nega sekin (past, manbalar)', '#rzSheet'); await shot(p, 'plato-2');
    if (p.errs.length) fails.push(tag + ' JS (plato): ' + p.errs[0]); await p.context().close(); }
};
BOLIM['android'] = async (c, { tag, mk, shot, scan, mainAt }) => { let p;
  /* Android: qadam kartasi holatlari (yoqilgan, ruxsat yo'q, sensor yo'q) — Bugun'da suv yonida DOIM; keyingi dizayn o'zgarishlarida yo'qolmasin (v49) */
  for (const [qa, want] of [['on', /\d/], ['off', /Qadamni yoqish|Включить шаги|Қадамни ёқиш/], ['nosensor', /sensori yo'q|датчика|сенсори йўқ/]]) {
    p = await mk(seed(c.lang, true), { qa }); await p.waitForTimeout(500);
    const sc = await p.evaluate(() => { const s0 = document.querySelector('.sl-s'), w = document.querySelector('.sl-exc'); if (!s0 || !w) return null; const r = s0.getBoundingClientRect(), q = w.getBoundingClientRect(); return { st: s0.dataset.st, text: s0.innerText, side: Math.abs(r.top - q.top) < 4 && q.left > r.right - 1 && q.right <= document.documentElement.clientWidth + 1, one: s0.parentNode.classList.contains('one') };          /* v55: qadam — mashg'ulot bilan yonma-yon */ });
    if (!sc) fails.push(tag + ' Android (' + qa + '): QADAM KARTASI YO\'Q'); else { if (!sc.side || sc.one) fails.push(tag + ' Android (' + qa + '): qadam kartasi mashg\'ulot yonida emas'); if (!want.test(sc.text)) fails.push(tag + ' Android (' + qa + '): karta matni ' + JSON.stringify(sc.text)); }
    await p.evaluate(() => { const m = document.getElementById('rzMain'), w = document.getElementById('wCard'); m.scrollTop = Math.max(0, w.offsetTop - 120); }); await p.waitForTimeout(300);
    await scan(p, 'Android qadam (' + qa + ')', '#rzMain'); await shot(p, 'android-qadam-' + qa); await p.context().close();
  }
};
BOLIM['v50'] = async (c, { tag, mk, shot, scan, mainAt }) => { let p;
  /* v50: Bugun (BJU + hazil), Profil (hero), Kun tartibi — maket bilan yonma-yon */
  { const st = seed(c.lang, true); st.profile.goalWeight = st.profile.weight - 6; st.profile.tartib = 'kech'; st.prefs.ttAsked = 1; S.addWeight(st, D.addDays(T0, -20), st.profile.weight + 1.5);
    const YM = OUT && c.w === 390 && !c.h && c.lang === 'uz' && fs.existsSync(MAKET5);
    p = await mk(st); await p.evaluate(() => window.__kalkifit.jokeTest('Sinov: hazil halqa kartasi ichida.')); await p.waitForTimeout(700); await p.evaluate(() => { const m = document.getElementById('rzMain'), c2 = document.querySelector('.sl-big'); m.scrollTop = c2.offsetTop - 12; }); await p.waitForTimeout(300);
    const jk = await p.evaluate(() => { const j = document.getElementById('jLine'), ring = document.getElementById('kcalBtn'); if (!j) return null; const a2 = j.getBoundingClientRect(), r2 = ring.getBoundingClientRect(); return a2.top >= r2.bottom - 1; }); if (!jk) fails.push(tag + ' hazil halqa ostida (ichida) emas yoki yo\'q');
    await scan(p, 'Bugun (hazil)', '#rzMain'); await shot(p, 'v50-bugun'); if (YM) await yonma5(p, c.th, 'v50-maket-1', 0);
    await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(1800); await scan(p, 'Profil (hero)', '#rzMain'); await shot(p, 'v50-profil'); if (YM) await yonma5(p, c.th, 'v50-maket-2', 1);
    await p.click('[data-act=ttopen]'); await p.waitForTimeout(800); await scan(p, 'Kun tartibi', '#rzSheet'); await shot(p, 'v50-tartib'); if (YM) await yonma5(p, c.th, 'v50-maket-3', 2);
    if (p.errs.length) fails.push(tag + ' JS (v50): ' + p.errs[0]); await p.context().close(); }
};
BOLIM['tartib'] = async (c, { tag, mk, shot, scan, mainAt }) => { let p;
  /* «Mening tartibim» + oqsil kartasi (kechqurun ko'p yeyman; nonushta va tushlik yozilgan) */
  { const st = seed(c.lang, false); st.profile.tartib = 'kech'; st.prefs.ttAsked = 1; [['b', 'tuxum', 200, 18], ['l', 'osh', 500, 22]].forEach(([m, fid, k, pp]) => S.addFood(st, T0, { meal: m, fid, unit: 'g100', qty: 200, g: 200, kcal: k, p: pp, f: 10, c: 40, est: false, ts: 1 }));
    p = await mk(st); await p.evaluate(() => { const m = document.getElementById('rzMain'), c = document.getElementById('bjuCard'); m.scrollTop = c.offsetTop - 12; }); await p.waitForTimeout(400);
    await scan(p, 'Oqsil + ovqatlar', '#rzMain'); await shot(p, 'tartib-bugun'); if (OUT && c.w === 390 && !c.h && c.lang === 'uz' && fs.existsSync(MAKET4)) await yonma4(p, c.th, 'tartib-maket-2', 1);
    const o = await p.evaluate(() => ({ pr: !!document.querySelector('#bjuCard.bj3 .bj-tip'), old: 0, sub: [...document.querySelectorAll('.sl-meal .ml-sub, .sl-meal .ml-empty .m > span')].map((e) => e.textContent).concat([...document.querySelectorAll('.sl-meal .ml-k')].map((e) => e.getAttribute('aria-label'))) }));
    if (!o.pr || o.old) fails.push(tag + ' oqsil kartasi: ' + JSON.stringify(o)); if (!o.sub.some((x) => /\d+ \/ \d+|qoldirilgan|оставлено|отложено|қолдирилган/.test(x))) fails.push(tag + ' ovqat budjeti ko\'rinmaydi: ' + o.sub.join(' | '));
    await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500); await p.click('[data-act=ttopen]'); await p.waitForTimeout(700); await scan(p, 'Mening tartibim', '#rzSheet'); await shot(p, 'tartib-oyna'); if (OUT && c.w === 390 && !c.h && c.lang === 'uz' && fs.existsSync(MAKET4)) await yonma4(p, c.th, 'tartib-maket-1', 0);
    if (p.errs.length) fails.push(tag + ' JS (tartib): ' + p.errs[0]); await p.context().close(); }
};
BOLIM['v56'] = async (c, { tag, mk, shot, scan, mainAt }) => { let p;
  /* v56: balans «Ikki chiziq» + Qadam/Mashg'ulot kartalari (bo'sh / to'lgan) + tahrir oynasi (maket bilan yonma-yon: 390 uz) */
  { const base = () => { const st = seed(c.lang, true); st.created = Date.now() - 10 * 86400000; st.prefs.ttAsked = 1; st.prefs.h_hafta = Date.now(); st.prefs.h_backup = Date.now(); st.prefs.crd = { ekran: { ok: 1 }, ilova: { ok: 1 }, akkaunt: { ok: 1 } }; st.prefs.fw = { x: [], d: T0 }; st.afsona = { a: {}, ok: {}, dq: { d: T0, id: 'a01', x: 1 } }; st.profile.job = 'sit'; return st; };
    const YM = OUT && c.w === 390 && !c.h && c.lang === 'uz' && fs.existsSync(MAKET8), YM9 = OUT && c.w === 390 && !c.h && c.lang === 'uz' && fs.existsSync(MAKET9), YM10 = OUT && c.w === 390 && !c.h && c.lang === 'uz' && fs.existsSync(MAKET10), toCards = (p) => p.evaluate(() => { const m = document.getElementById('rzMain'), c2 = document.querySelector('.sl-big'); m.scrollTop = c2.offsetTop + c2.offsetHeight - 470; });
    let st = base(); S.ensureDay(st, T0).steps = 5620; S.addEx(st, T0, { t: 'futbol', min: 45, lv: 1 });
    p = await mk(st); await p.waitForTimeout(900); await toCards(p); await p.waitForTimeout(300); await scan(p, 'Balans + harakat', '#rzMain'); await shot(p, 'v56-bugun'); if (YM) await yonmaG(p, c.th, 'v56-maket-1', MAKET8, '.ph', 0); if (YM9 || YM10) { await p.evaluate(() => { const m = document.getElementById('rzMain'); m.scrollTop = document.querySelector('.sl-big').offsetTop - 60; }); await p.waitForTimeout(250); if (YM10) await yonmaG(p, c.th, 'v59-maket-1', MAKET10, '.ph', 0); await toCards(p); await p.waitForTimeout(200); }
    await p.click('.sl-exc .mr'); await p.waitForTimeout(600); await scan(p, 'Mashg\'ulotlar ro\'yxati', '#rzSheet'); await shot(p, 'v56-exlist'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await p.click('[data-act=exadd]'); await p.waitForTimeout(700); await scan(p, 'Mashg\'ulot qo\'shish', '#rzSheet'); await shot(p, 'v59-mashq'); if (YM10) await yonmaG(p, c.th, 'v59-maket-2', MAKET10, '.ph', 1); await p.evaluate(() => { document.getElementById('rzSheet').scrollTop = 1e5; }); await p.waitForTimeout(300); await scan(p, 'Mashg\'ulot qo\'shish (past)', '#rzSheet'); await shot(p, 'v59-mashq-past'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await p.click('#kcalBtn'); await p.waitForTimeout(600); await scan(p, 'Qanday chiqdi?', '#rzSheet'); await shot(p, 'v58-qanday'); if (YM9) await yonmaG(p, c.th, 'v58-maket-2', MAKET9, '.ph', 1); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await p.evaluate(() => { const r = document.querySelector('#rzMain .sl-row'); r.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(200); await p.click('#rzMain .sl-row >> nth=0'); await p.waitForTimeout(800); await scan(p, 'Tahrir oynasi', '#rzSheet'); await shot(p, 'v56-tahrir'); if (YM) await yonmaG(p, c.th, 'v56-maket-3', MAKET8, '.ph', 2);
    if (p.errs.length) fails.push(tag + ' JS (v56): ' + p.errs[0]); await p.context().close();
    st = base(); st.days[T0] && (st.days[T0].steps = 0); p = await mk(st); await p.waitForTimeout(900); await toCards(p); await p.waitForTimeout(300); await scan(p, 'Bo\'sh kartalar', '#rzMain'); await shot(p, 'v56-bosh'); if (YM) await yonmaG(p, c.th, 'v56-maket-2', MAKET8, '.ph', 1);
    if (p.errs.length) fails.push(tag + ' JS (v56 bo\'sh): ' + p.errs[0]); await p.context().close(); }
};
BOLIM['afsona'] = async (c, { tag, mk, shot, scan, mainAt }) => { let p;
  /* v54: «Afsona yoki haqiqat?» — Bugun kunning savoli, savol, javob (maket bilan yonma-yon: 390 uz) */
  { const st = seed(c.lang, false); st.created = Date.now() - 10 * 86400000; st.prefs.ttAsked = 1; st.prefs.h_hafta = Date.now(); st.prefs.h_backup = Date.now(); st.prefs.crd = { ekran: { ok: 1 }, ilova: { ok: 1 }, akkaunt: { ok: 1 } }; st.prefs.fw = { x: [], d: T0 }; st.afsona = { a: {}, ok: {}, dq: { d: T0, id: 'a01' } };
    const YM = OUT && c.w === 390 && !c.h && c.lang === 'uz' && fs.existsSync(MAKET6);
    p = await mk(st); await p.waitForTimeout(500); if (!(await p.locator('#afTz').count())) fails.push(tag + ' v54: kunning savoli yo\'q');
    else { await p.evaluate(() => { const m = document.getElementById('rzMain'), c2 = document.getElementById('afTz'); m.scrollTop = c2.offsetTop - 300; }); await p.waitForTimeout(250); await scan(p, 'Kunning savoli', '#afTz'); await shot(p, 'v54-kun'); if (YM) await yonma6(p, c.th, 'v54-maket-1', 0);
      await p.evaluate(() => { localStorage.setItem('kalki_stat_q', '[]'); }); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(400); await p.click('[data-act=feat][data-fk=afsona]'); await p.waitForTimeout(900);
      await scan(p, 'Afsona savol', '#afOv'); await shot(p, 'v54-savol'); if (YM) await yonma6(p, c.th, 'v54-maket-2', 1);
      await p.click('#afOv [data-act=afans][data-v=a]'); await p.waitForTimeout(900); await scan(p, 'Afsona javob', '#afOv'); await shot(p, 'v54-javob'); if (YM) await yonma6(p, c.th, 'v54-maket-3', 2); }
    if (p.errs.length) fails.push(tag + ' JS (v54): ' + p.errs[0]); await p.context().close(); }
};
BOLIM['v51'] = async (c, { tag, mk, shot, scan, mainAt }) => { let p;
  /* v51: mavjud Android — ish turi kartasi → oyna (Hozirgi → Yangi) → tasdiqlash → (i) formula va qatorlar (docs/limit.md) */
  { const st = seed(c.lang, true); delete st.profile.job; st.prefs.ttAsked = 1; st.prefs.h_hafta = Date.now(); st.prefs.h_backup = Date.now();
    p = await mk(st); await p.waitForTimeout(400); if (!(await p.locator('#jbCard').count())) fails.push(tag + ' v51: ish turi kartasi yo\'q');
    else { await scan(p, 'Ish turi kartasi', '#rzMain'); await shot(p, 'v51-karta'); await p.click('#jbCard [data-act=jbopen]'); await p.waitForTimeout(600); await p.click('#rzSheet [data-act=jbpick][data-v=stand]'); await p.waitForTimeout(400);
      await scan(p, 'Ish turi oynasi', '#rzSheet'); await shot(p, 'v51-oyna'); await p.click('#rzSheet [data-act=jbok]'); await p.waitForTimeout(600); }
    await p.click('#kcalBtn'); await p.waitForTimeout(500); await p.click('#rzSheet [data-act=xkform]'); await p.waitForTimeout(600); await scan(p, 'Me\'yor (i)', '#rzSheet'); await shot(p, 'v51-xkcal');
    if (p.errs.length) fails.push(tag + ' JS (v51): ' + p.errs[0]); await p.context().close(); }
};
/* ---------- --faqat: o'zgargan fayl → bo'limlar ---------- */
const FAYL_BOLIM = {          // fayl o'zi bo'limni belgilaydi
  'assets/kalkifit-intro.js': ['tanishtiruv'], 'assets/kalkifit-plato.js': ['plato'], 'assets/kalkifit-hikoya.js': ['plato'], 'tools/dizayn/plato-demo.cjs': ['plato'],
  'assets/app-native.js': ['android', 'v51'], 'assets/kalkifit-afsona.js': ['afsona'], 'data/afsonalar.json': ['afsona'], 'assets/kalkifit-yeymiz.js': ['asosiy'], 'assets/kalkifit-retsept.js': ['asosiy'],
  'data/yeymiz.json': ['asosiy'], 'data/hazillar.json': ['asosiy', 'v50'], 'assets/kalkifit-gaplar.js': ['asosiy', 'v50'], 'data/ovqatlar.json': ['asosiy'], 'kalkifit.html': ['bosh', 'asosiy'], 'ru/kalkifit.html': ['bosh', 'asosiy'],
};
const UMUMIY = ['assets/kalkifit-app.js', 'assets/css/kalkifit.css', 'assets/css/appkit.css', 'assets/app-kit.js', 'assets/kalkifit-core.js', 'assets/translit.js', 'assets/cyr.js'];
const KALIT = {          // umumiy fayl o'zgarsa — diff matnida shu kalit so'zlar bo'lsa, bo'lim tanlanadi (hech biri topilmasa — bosh + asosiy)
  tanishtiruv: ['rzIntro', 'in-body', 'innext', 'ingo', 'obstart', 'rz-onb', 'intro'], bosh: ['sl-tdempty', 'tdEmpty'],
  asosiy: ['sl-big', 'vessel', 'kcalBtn', 'bjuCard', 'bj3', 'ftBtn', 'ftDr', 'ft-', 'jLine', 'hz-', 'yeymiz', 'ny-', 'fdQ', 'fdRes', 'sl-rr', 'kq-', 'sl-meal', 'rzAddBar', 'mainAdd', 'sl-duo', 'wCard', 'sl-hd2', 'renderToday', 'renderHistory', 'renderProfile', 'rz-tab'],
  plato: ['plato', 'pl-', 'wTrend', 'hikoya'], android: ['qaSrc', 'stepCardHtml', 'qaulash', 'addsteps', 'qaFit', 'qaState', 'stepState'],
  v50: ['sl-prof', 'pf-', 'hero', 'jokeTest', 'kunTartib', 'renderProfile'], tartib: ['tartib', 'tt-', 'ttopen', 'bj-tip'],
  v56: ['kc-row', 'kc-i', 'kcChipsHtml', 'ex-t', 'ex-in', 'ex-res', 'exApply', 'exSheetHtml', 'openKcalHow', 'hw-r', 'exGain', 'sl-ab2', 'pw-bar', 'pw-row', 'kq-m4', 'kq-seg', 'exlist', 'openBal', 'exCard', 'stepWeb', 'stepCardHtml', 'portionHtml', 'pwBody', 'miniRing', 'sl-exc'],
  afsona: ['afsona', 'af-', 'afTz'], v51: ['jbCard', 'jb-', 'jobOn', 'dayPlan', 'xkcal', 'xkRows'],
};
function tanla() {
  if (!FAQAT) return { ids: Object.keys(BOLIM), why: 'to\'liq' };
  if (FAQAT !== true) { const ids = String(FAQAT).split(','); ids.forEach((x) => { if (!BOLIM[x]) { console.log('Noma\'lum bo\'lim: ' + x + ' (bor: ' + Object.keys(BOLIM).join(', ') + ')'); process.exit(2); } }); return { ids, why: 'qo\'lda' }; }
  const git = (...a) => { try { return require('child_process').execFileSync('git', a, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 }).toString(); } catch (e) { return ''; } };
  const mb = git('merge-base', 'HEAD', 'origin/main').trim(), base = mb && mb !== git('rev-parse', 'HEAD').trim() ? mb : 'HEAD';
  const files = [...new Set(git('diff', '--name-only', base).split('\n').concat(git('ls-files', '--others', '--exclude-standard').split('\n')).filter(Boolean))];
  const set = new Set(), why = [];
  if (files.includes('tools/dizayn/kalkifit-ekranlar.mjs')) { why.push('asbobning o\'zi o\'zgargan → hammasi'); Object.keys(BOLIM).forEach((x) => set.add(x)); }
  files.forEach((f) => (FAYL_BOLIM[f] || []).forEach((x) => { set.add(x); why.push(f + ' → ' + x); }));
  const um = files.filter((f) => UMUMIY.includes(f));
  if (um.length) { const d = git('diff', '-U0', base, '--', ...um).split('\n').filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---)/.test(l)).join('\n'); let hit = false;
    for (const [id, ks] of Object.entries(KALIT)) { const k = ks.find((x) => d.includes(x)); if (k) { set.add(id); hit = true; why.push(um.join(', ') + ' «' + k + '» → ' + id); } }
    if (!hit) { set.add('bosh'); set.add('asosiy'); why.push(um.join(', ') + ' → bosh, asosiy (kalit so\'z topilmadi)'); } }
  if (!set.size) { set.add('bosh'); set.add('asosiy'); why.push('ilova fayli o\'zgarmagan → bosh, asosiy'); }
  return { ids: Object.keys(BOLIM).filter((x) => set.has(x)), why: why.join('; ') };
}
/* kombinatsiya × bo'lim — mustaqil birliklar, PAR tasi baravar (har biri o'z konteksti); eng uzun bo'lim (asosiy) birinchi */
async function ishga(list) {
  const { ids, why } = tanla(); const ORDER = ['asosiy', 'v56', 'v50', 'afsona', 'plato', 'tartib', 'v51', 'android', 'tanishtiruv', 'bosh'];
  const units = []; ids.slice().sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)).forEach((id) => list.forEach((c) => units.push({ c, id })));
  console.log('Bo\'limlar: ' + ids.join(', ') + ' (' + why + ') | kombinatsiyalar: ' + list.length + ' | birliklar: ' + units.length + ' | parallel: ' + PAR);
  if (ARG('list')) return;
  const left = new Map(list.map((c) => [c, ids.length]));
  const { kuzat } = require('../kod-kuzat.cjs'); const w = kuzat({ onChange: async (f) => { console.log('\n! Kod o\'zgardi (' + f + ') — skrinshot yurishi to\'xtatildi: eski kod natijasi kerak emas.'); try { await b.close(); } catch (e) { /* */ } process.exit(3); } });
  await pool(units, PAR, async ({ c, id }) => { const H = yordam(c);
    try { await BOLIM[id](c, H); } catch (e) { fails.push(H.tag + ' [' + id + '] XATO: ' + String(e && e.message || e).split('\n')[0].slice(0, 200)); }
    left.set(c, left.get(c) - 1); if (!left.get(c)) console.log('✓', H.tag); });
  w.stop();
}
try {
  await ishga(list);
} finally { await b.close(); srv.close(); }
console.log(shots + ' ta ekran' + (OUT ? ' → ' + OUT : '') + '; muammo: ' + fails.length); if (fails.length) { console.log(fails.join('\n')); process.exitCode = 1; }
