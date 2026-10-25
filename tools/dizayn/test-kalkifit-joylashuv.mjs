// KalkiFit joylashuvi katta shriftda (Android tizim shrifti → WebView textZoom; ilova o'zi 115% bilan cheklaydi, lekin layout 160% gacha ham buzilmasin):
// 360×800 va 393×873, shrift 100/130/160% (har elementning font-size'i ko'paytiriladi — textZoom kabi), qorong'i mavzu, Android ilova (Capacitor mock):
// Bugun, Profil, «Ovqat qo'shish» oynasi — matnli elementlar bir-birini KESMAYDI (bounding box), gorizontal chiqib ketish yo'q, pastki menyu ostida kontent qolmaydi
// (oxirgi element menyudan yuqorida ko'rinadi); ovqat kartasida nom va kkal alohida; skrinshotlar: $OUT (berilsa).   node tools/dizayn/test-kalkifit-joylashuv.mjs
import assert from 'node:assert/strict'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const OUT = process.env.OUT || '';
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const T0 = D.today();
function seed(lang) {
  const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 86400000; st.prefs = { tipsDone: true, jokes: true, qa: 'on', lpTip: 1, yemayAsked: 1 }; st.profile = { sex: 'f', preg: false, age: 30, height: 165, weight: 70, act: 3, goal: 'lose', goalWeight: null }; st.trackStart = D.addDays(T0, -14); S.addWeight(st, T0, 70);
  S.addFood(st, T0, { meal: 'b', ts: 1, fid: 'choy', unit: 'piyola', qty: 1, g: 200, kcal: 38, p: 0, f: 0, c: 9, est: false });
  S.addFood(st, T0, { meal: 'd', ts: 2, fid: null, name: lang === 'ru' ? 'Шовла (половина маленькой тарелки, с мясом и морковью)' : 'Shovla (yarim kichik tarelka, go\'sht va sabzi bilan)', g: 200, kcal: 290, p: 9, f: 10, c: 40, est: true });
  S.addFood(st, T0, { meal: 'd', ts: 3, fid: 'non', unit: 'dona', qty: 1, g: 250, kcal: 600, p: 20, f: 3, c: 120, est: false });
  return st;
}
const MOCK = () => { window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: ['LocalNotifications', 'Share', 'Filesystem', 'Camera', 'Haptics', 'AppLauncher', 'SplashScreen', 'App', 'Qadam'].map((name) => ({ name, methods: [] })),          // Qadam: available+granted (sensor) — Bugun'da qadam kartasi, Profil'da switch qatori
  nativePromise: (pl, m) => { if (pl === 'Qadam' && m === 'isAvailable') return Promise.resolve({ available: true, granted: true, enabled: true, source: 'sensor', hc: 'ok', sensor: true, sensorGranted: true }); if (pl === 'Qadam' && m === 'getDays') return Promise.resolve({ kunlar: [] }); return Promise.resolve({}); }, addListener: () => ({ remove() {} }) }; };
const ZOOM = (k) => { if (k === 1) return; const apply = (root) => { const els = [root, ...root.querySelectorAll('*')].filter((e) => !e.__z); const sz = els.map((e) => parseFloat(getComputedStyle(e).fontSize)); els.forEach((e, i) => { e.__z = 1; e.style.setProperty('font-size', (sz[i] * k) + 'px', 'important'); }); };
  apply(document.body); new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((x) => { if (x.nodeType === 1) apply(x); }))).observe(document.body, { childList: true, subtree: true }); };
/* matnli barg elementlar (matn tuguni bevosita ichida) — ko'rinadigan, bir-birining ichida bo'lmaganlar juft-juft kesishmasin (2 px chidam) */
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
const SIZES = [[360, 800], [393, 873]], ZOOMS = [1, 1.15, 1.3, 1.6];          // 1.15 — ilova cheklovi (Android tizim shrifti katta bo'lsa textZoom 115%), faqat 360 px da
const fails = [];
try {
  for (const lang of ['uz', 'ru']) for (const [w, h] of SIZES) for (const k of ZOOMS) {
    if (lang === 'ru' && w !== 360) continue; if (k === 1.15 && w !== 360) continue;
    const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: 'dark', userAgent: 'Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130 Mobile Safari/537.36' });
    await c.addInitScript((o) => { try { localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_lang', o.lang); } catch (e) {} }, { st: seed(lang), lang });
    await c.addInitScript(MOCK);
    const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 204, body: '' }));
    await p.goto(BASE + (lang === 'ru' ? '/ru/kalkifit' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.evaluate(ZOOM, k); await p.waitForTimeout(1200);
    const tag = `${lang} ${w}×${h} ${Math.round(k * 100)}%`;
    const shot = async (nm) => { if (OUT) await p.screenshot({ path: `${OUT}/${nm}-${lang}-${w}-${Math.round(k * 100)}.png` }); };
    const scan = async (where, scope) => { const r = await p.evaluate(CHECK, scope); if (r.err) { fails.push(tag + ' ' + where + ': ' + r.err); return; } if (r.bad.length) fails.push(tag + ' ' + where + ' KESISHADI: ' + r.bad.slice(0, 6).join(' | ')); if (r.over.length) fails.push(tag + ' ' + where + ' ekrandan chiqadi: ' + r.over.slice(0, 6).join(' | ')); if (r.esc.length) fails.push(tag + ' ' + where + ' kartadan chiqadi: ' + r.esc.slice(0, 6).join(' | ')); return r; };
    /* Bugun */
    await scan('Bugun', '#rzMain'); await shot('bugun');
    const mh = await p.evaluate(() => [...document.querySelectorAll('.sl-mh.ml-h')].map((x) => { const m = x.querySelector('.m').getBoundingClientRect(), k2 = x.querySelector('.ml-k').getBoundingClientRect(), a = x.querySelector('.ml-add').getBoundingClientRect(), c = x.getBoundingClientRect(); return m.right <= k2.left + 1 && k2.right <= a.left + 1 && a.right <= c.right + 1; }));          // v44: nom | katta kkal | «+» — bir qatorda, ustma-ust tushmaydi
    if (!mh.length || mh.some((v) => !v)) fails.push(tag + ' ovqat kartasi sarlavhasi: nom / kkal / «+» ustma-ust');
    /* pastki menyu: oxirgi element (izoh) menyudan yuqoriga chiqariladi */
    const bottom = await p.evaluate(() => { const m = document.getElementById('rzMain'); m.scrollTop = m.scrollHeight; const last = [...m.children].pop(), nav = document.querySelector('.rz-nav'); return { last: last.getBoundingClientRect().bottom, nav: nav.getBoundingClientRect().top }; });
    if (bottom.last > bottom.nav - 4) fails.push(tag + ' Bugun: oxirgi element pastki menyu ostida qoldi (' + Math.round(bottom.last) + ' > ' + Math.round(bottom.nav) + ')');
    await shot('bugun-past');
    /* Profil */
    await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(700); await scan('Profil', '#rzMain'); await shot('profil');
    if (!(await p.locator('#qaRow [role=switch]').count())) fails.push(tag + ' Profil: «Qadamni avtomatik sanash» switch qatori yo\'q'); else { const q = await p.evaluate(() => { const b2 = document.querySelector('#qaRow .t').getBoundingClientRect(), sw = document.querySelector('#qaRow .sl-sw').getBoundingClientRect(); return b2.right <= sw.left + 0.5 && sw.width === 52; }); if (!q) fails.push(tag + ' Profil: qadam qatori matni switch ustiga chiqdi'); }
    const pb = await p.evaluate(() => { const m = document.getElementById('rzMain'); m.scrollTop = m.scrollHeight; const last = [...m.children].pop(), nav = document.querySelector('.rz-nav'); return { last: last.getBoundingClientRect().bottom, nav: nav.getBoundingClientRect().top }; });
    if (pb.last > pb.nav - 4) fails.push(tag + ' Profil: oxirgi element pastki menyu ostida qoldi');
    await shot('profil-past');
    /* Ovqat qo'shish oynasi */
    await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(500); await p.click('#mainAdd').then(() => p.click('#rzSheet #fdQ')); await p.waitForTimeout(900); await scan('Qo\'shish', '#rzSheet'); await shot('qoshish');
    if (errs.length) fails.push(tag + ' JS xato: ' + errs[0]);
    await c.close();
  }
  if (fails.length) { console.log(fails.join('\n')); assert.fail(fails.length + ' ta joylashuv muammosi'); }
  log('Bugun, Profil va «Ovqat qo\'shish»: UZ (360×800, 393×873) va RU (360×800) × shrift 100/115/130/160% (115% — 360 px), Profil\'da qadam switch qatori — matnlar kesishmaydi, ekrandan/kartadan chiqmaydi, kkal nom ostida, oxirgi element pastki menyudan yuqorida');
} finally { await b.close(); srv.close(); }
console.log('\n' + n + '/' + n + ' OK');
