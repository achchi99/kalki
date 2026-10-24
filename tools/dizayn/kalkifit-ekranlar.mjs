// KalkiFit: barcha asosiy ekranlarning skrinshoti + avtomatik tekshiruv (matnlar kesishmaydi, ekrandan/kartadan chiqmaydi).
// 360 va 390 px × textZoom 115% × UZ/ЎЗ/RU × yorug'/tungi; Android ilova ko'rinishi (Capacitor mock).
// Ekranlar: tanishtiruv 1–3, Bugun (to'la, bo'sh), «Qo'shish» varag'i, «Yozish» (qidiruv), Tarix, Profil (tepa/o'rta/past).
//   OUT=<papka> node tools/dizayn/kalkifit-ekranlar.mjs [--tez]   (--tez: faqat 360 dark uz + 390 light ru)
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const T0 = D.today(); const OUT = process.env.OUT || ''; const TEZ = process.argv.includes('--tez');
if (OUT) fs.mkdirSync(OUT, { recursive: true });
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
function seed(lang, full) {
  const st = S.emptyState(); st.setup = true; st.created = Date.now() - 3 * 86400000; st.prefs = { tipsDone: true, jokes: true, qa: 'on', lpTip: 1, yemayK: 1, introDone: true, suvFrom: T0 }; st.profile = { sex: 'f', preg: false, age: 30, height: 165, weight: 70, act: 3, goal: 'lose', goalWeight: null }; st.trackStart = D.addDays(T0, -3); S.addWeight(st, T0, 70);
  if (full) { S.addFood(st, T0, { meal: 'b', ts: 1, fid: 'choy', unit: 'piyola', qty: 1, g: 200, kcal: 38, p: 0, f: 0, c: 9, est: false }); S.addFood(st, T0, { meal: 'l', ts: 2, fid: 'osh', unit: 'kosa', qty: 1, g: 300, kcal: 520, p: 18, f: 22, c: 60, est: false }); S.addFood(st, T0, { meal: 'd', ts: 3, fid: null, name: lang === 'ru' ? 'Шовла (половина тарелки, с мясом и морковью)' : "Shovla (yarim tarelka, go'sht va sabzi bilan)", g: 200, kcal: 290, p: 9, f: 10, c: 40, est: true }); S.setWater(st, T0, 3); }
  return st;
}
const MOCK = () => { window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: ['LocalNotifications', 'Share', 'Filesystem', 'Camera', 'Haptics', 'App', 'Qadam'].map((name) => ({ name, methods: [] })),
  nativePromise: (pl, m) => { if (pl === 'Qadam' && m === 'isAvailable') return Promise.resolve({ available: true, granted: true, enabled: true, source: 'sensor', hc: 'ok', sensor: true, sensorGranted: true }); if (pl === 'Qadam' && m === 'getDays') return Promise.resolve({ kunlar: [{ sana: new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10), qadam: 12482 }] }); if (pl === 'App' && m === 'getInfo') return Promise.resolve({ version: '1.0.6', build: 8 }); return Promise.resolve({}); }, addListener: () => ({ remove() {} }) }; };
const ZOOM = (k) => { if (k === 1) return; const apply = (root) => { const els = [root, ...root.querySelectorAll('*')].filter((e) => !e.__z); const sz = els.map((e) => parseFloat(getComputedStyle(e).fontSize)); els.forEach((e, i) => { e.__z = 1; e.style.setProperty('font-size', (sz[i] * k) + 'px', 'important'); }); };
  apply(document.body); new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((x) => { if (x.nodeType === 1) apply(x); }))).observe(document.body, { childList: true, subtree: true }); };
const CHECK = (scope) => {
  const vis = (e) => { const c = getComputedStyle(e); if (c.visibility === 'hidden' || c.display === 'none' || +c.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const root = document.querySelector(scope); if (!root) return { err: 'yo\'q: ' + scope };
  const all = [...root.querySelectorAll('*')].filter((e) => !e.closest('[hidden],[aria-hidden=true],svg,.rz-sr,.sl-vessel,#kfSplash,.sl-fishswim,.rz-tip,.sl-addbar') && [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) && vis(e));
  /* matn to'rtburchagini overflow:hidden/clip ota-bobolar bilan kesamiz (line-clamp, ellipsis — ko'rinmaydigan qatorlar hisobga olinmaydi); gorizontal aylantiriladigan qator (chiplar) — o'z chegarasi */
  const clipOf = (e) => { let L = -1e9, T = -1e9, R = 1e9, B = 1e9, hs = false; for (let a = e; a && a !== document.body; a = a.parentElement) { const c = getComputedStyle(a); if (c.overflowX !== 'visible' || c.overflowY !== 'visible') { const r = a.getBoundingClientRect(); L = Math.max(L, r.left); T = Math.max(T, r.top); R = Math.min(R, r.right); B = Math.min(B, r.bottom); if (/auto|scroll/.test(c.overflowX)) hs = true; } } return { L, T, R, B, hs }; };
  const boxes = all.map((e) => { const rg = document.createRange(); rg.selectNodeContents(e); const cl = clipOf(e); const rs = [...rg.getClientRects()].map((r) => ({ left: Math.max(r.left, cl.L), top: Math.max(r.top, cl.T), right: Math.min(r.right, cl.R), bottom: Math.min(r.bottom, cl.B) })).filter((r) => r.right - r.left > 1 && r.bottom - r.top > 1); return { e, rs, hs: cl.hs }; }).filter((x) => x.rs.length);
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
const list = TEZ ? combos.filter((c) => (c.w === 360 && !c.h && c.th === 'dark' && c.lang === 'uz') || (c.w === 390 && c.th === 'light' && c.lang === 'ru') || (c.h && c.lang === 'uz')) : combos;
const fails = []; let shots = 0;
try {
  for (const c of list) {
    const tag = `${c.w}${c.h ? 'x' + c.h : ''}-${c.lang}-${c.th}`;
    const mk = async (st, extra) => { const ctx = await b.newContext({ viewport: { width: c.w, height: c.h || 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: c.th, userAgent: 'Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130 Mobile Safari/537.36' });
      await ctx.addInitScript((o) => { try { localStorage.clear(); if (o.st) localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_lang', o.lang); localStorage.setItem('kalki_theme', o.th); if (!o.intro) localStorage.setItem('kalki_intro_v2', '1'); } catch (e) {} }, { st, lang: c.lang, th: c.th, intro: !!(extra && extra.intro) });
      await ctx.addInitScript(MOCK); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e)));
      await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: /ovoz/.test(r.request().url()) ? '{"yoqilgan":true,"limit":15,"qoldi":15}' : /retsept/.test(r.request().url()) ? '{"limit":5,"qoldi":3}' : '{}' }));
      await p.goto(BASE + (c.lang === 'ru' ? '/ru/kalkifit' : c.lang === 'cyr' ? '/kalkifit?lang=cyr' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(1300); await p.evaluate(ZOOM, process.env.ZOOM ? +process.env.ZOOM : 1.15); await p.waitForTimeout(250); return p; };
    const shot = async (p, nm) => { shots++; if (OUT) await p.screenshot({ path: path.join(OUT, `${nm}-${tag}.png`) }); };
    const scan = async (p, where, scope) => { const r = await p.evaluate(CHECK, scope); if (r.err) { fails.push(tag + ' ' + where + ': ' + r.err); return; } if (r.bad.length) fails.push(tag + ' ' + where + ' KESISHADI: ' + r.bad.slice(0, 4).join(' | ')); if (r.over.length) fails.push(tag + ' ' + where + ' ekrandan chiqadi: ' + r.over.slice(0, 4).join(' | ')); if (r.esc.length) fails.push(tag + ' ' + where + ' kartadan chiqadi: ' + r.esc.slice(0, 4).join(' | ')); };
    const mainAt = async (p, f) => { await p.evaluate((f) => { const m = document.getElementById('rzMain'); m.scrollTop = f === 'past' ? m.scrollHeight : f === 'orta' ? m.scrollHeight / 2 - m.clientHeight / 2 : 0; }, f); await p.waitForTimeout(250); };
    /* tanishtiruv (yangi foydalanuvchi, til tanlangan) */
    let p = await mk(null, { intro: true });
    for (let i = 1; i <= 3; i++) { await p.waitForSelector('#rzIntro .in-body'); await p.waitForTimeout(1900); await scan(p, 'Tanishtiruv ' + i, '#rzIntro'); await shot(p, 'tanishtiruv' + i); if (i < 3) await p.click('#rzIntro [data-act=innext]'); }
    await p.click('#rzIntro [data-act=ingo]'); await p.waitForTimeout(500); await shot(p, 'onboarding'); if (p.errs.length) fails.push(tag + ' JS: ' + p.errs[0]); await p.context().close();
    /* Bugun (bo'sh) */
    p = await mk(seed(c.lang, false)); await scan(p, 'Bugun bo\'sh', '#rzMain'); await shot(p, 'bugun-bosh'); await p.context().close();
    /* Bugun (to'la), Qo'shish, Yozish, Tarix, Profil */
    p = await mk(seed(c.lang, true)); await scan(p, 'Bugun', '#rzMain'); await shot(p, 'bugun');
    { const r = await p.evaluate(() => { const big = document.querySelector('.sl-big').getBoundingClientRect(), v = document.querySelector('#kcalBtn svg').getBoundingClientRect(), rs = document.querySelector('.sl-rsub'), rr = rs.getBoundingClientRect(), ib = rs.querySelector('.sl-infob').getBoundingClientRect(), last = [...rs.querySelectorAll('.nw')].pop().getBoundingClientRect(); return { inCard: v.left >= big.left - 0.5 && v.right <= big.right + 0.5 && v.top >= big.top - 0.5, gap: Math.round(rr.top - v.bottom), ibAlone: Math.abs(ib.top - last.top) > 2 || ib.top > last.bottom, burn: !!document.getElementById('kBurn') }; });
      if (!r.inCard) fails.push(tag + ' halqa kartadan chiqqan'); if (r.gap < 12) fails.push(tag + ' halqa ostidagi qator ' + r.gap + ' px (≥12 kerak)'); if (r.ibAlone) fails.push(tag + ' ⓘ alohida qatorda'); if (!r.burn) fails.push(tag + ' «yoqildi» qiymati yo\'q (sinov holati)'); }
    { const g = await p.evaluate(() => { const m = document.getElementById('rzMain'), bar = document.getElementById('rzAddBar').getBoundingClientRect(), mr = m.getBoundingClientRect(); m.scrollTop = m.scrollHeight; const last = [...m.children].filter((e) => e.getBoundingClientRect().height > 0).pop().getBoundingClientRect(); return { mainBottom: mr.bottom, barTop: bar.top, lastBottom: last.bottom, barH: bar.height }; }); if (g.mainBottom > g.barTop + 1) fails.push(tag + ' Bugun: kontent «Qo\'shish» tugmasi ostiga o\'tadi ' + JSON.stringify(g)); if (g.lastBottom > g.mainBottom - 15) fails.push(tag + ' Bugun: oxirgi element tagida 16 px bo\'shliq yo\'q ' + JSON.stringify(g)); await mainAt(p, 'tepa'); } await mainAt(p, 'past'); await scan(p, 'Bugun past', '#rzMain'); await shot(p, 'bugun-past'); await mainAt(p, 'tepa');
    await p.click('#mainAdd'); await p.waitForTimeout(700); await scan(p, 'Qo\'shish', '#rzSheet'); await shot(p, 'qoshish');
    { const t = await p.evaluate(() => { const l = [...document.querySelectorAll('#rzSheet .sl-ptile')].map((e) => { const r = e.getBoundingClientRect(), d = e.querySelector('.d'), b = e.querySelector('b'); return { top: Math.round(r.top), h: Math.round(r.height), l: r.left, r: r.right, clip: e.scrollWidth > e.clientWidth + 1 || d.scrollWidth > d.clientWidth + 1 || b.scrollWidth > b.clientWidth + 1, fs: getComputedStyle(d).fontSize, lines: Math.round(d.getBoundingClientRect().height / parseFloat(getComputedStyle(d).lineHeight)) }; }); return { l, W: innerWidth }; });
      if (t.l.length < 2) fails.push(tag + ' plitkalar < 2'); else { if (new Set(t.l.map((x) => x.top)).size !== 1) fails.push(tag + ' plitkalar bitta qatorda emas ' + JSON.stringify(t.l.map((x) => x.top))); if (new Set(t.l.map((x) => x.h)).size !== 1) fails.push(tag + ' plitka balandligi teng emas ' + JSON.stringify(t.l.map((x) => x.h))); if (t.l.some((x) => x.clip || x.r > t.W + 1 || x.l < -1)) fails.push(tag + ' plitka matni kesilgan/ekrandan chiqqan ' + JSON.stringify(t.l)); if (new Set(t.l.map((x) => x.fs)).size !== 1) fails.push(tag + ' izoh shrifti har xil ' + JSON.stringify(t.l.map((x) => x.fs))); if (t.l.some((x) => x.lines > 3)) fails.push(tag + ' izoh 3 qatordan oshdi ' + JSON.stringify(t.l.map((x) => x.lines))); } }
    { const rc = await p.locator('#fdRecent .sl-rw').count(); if (rc < 1 || rc > 5) fails.push(tag + ' Yaqinda: ' + rc + ' qator'); }
    await p.click('#rzSheet #fdQ'); await p.waitForTimeout(700); await scan(p, 'Qidiruv', '#rzSheet'); await shot(p, 'qidiruv');
    await p.click('#rzSheet [data-act=sheetclose]'); await p.waitForTimeout(500);
    await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(800); await scan(p, 'Tarix', '#rzMain'); await shot(p, 'tarix'); await mainAt(p, 'past'); await shot(p, 'tarix-past');
    await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(800); await scan(p, 'Profil', '#rzMain'); await shot(p, 'profil'); await mainAt(p, 'orta'); await shot(p, 'profil-orta'); await mainAt(p, 'past'); await shot(p, 'profil-past');
    if (p.errs.length) fails.push(tag + ' JS: ' + p.errs[0]); await p.context().close();
    console.log('✓', tag);
  }
} finally { await b.close(); srv.close(); }
console.log(shots + ' ta ekran' + (OUT ? ' → ' + OUT : '') + '; muammo: ' + fails.length); if (fails.length) { console.log(fails.join('\n')); process.exitCode = 1; }
