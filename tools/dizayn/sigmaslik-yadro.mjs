// KalkiFit «sig'dirish» tekshiruvi uchun umumiy yadro: server, holat (seed), sahifa ochish (Chromium + WebKit, iPhone SE…Pro Max kengliklari) va
// ustma-ust tushish / gorizontal chiqish / kesilish tekshiruvi (CHECK). ::before/::after matni HAM tekshiriladi (v92 xatosi: «Жиры · выше нормы» — ::after matni oddiy
// matn-tugun emas edi, eski tekshiruv uni ko'rmagan).
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium, webkit } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
export const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); export const D = S.dates; export const T0 = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
export async function server() {
  const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); fs.createReadStream(f).pipe(r); });
  await new Promise((ok) => srv.listen(0, ok)); return { srv, BASE: 'http://localhost:' + srv.address().port };
}
/* brauzerlar: Chromium har doim; WebKit (Safari) — ishga tushsa (source ~/wk-env.sh), aks holda null */
export async function brauzerlar() {
  const out = { chromium: track(await chromium.launch()), webkit: null };
  /* WebKit bu mashinada ~/wk-libs (foydalanuvchi kutubxonalari + Mesa) bilan ishlaydi — ~/wk-env.sh ni qo'lda `source` qilmasdan ham ishga tushsin */
  if (fs.existsSync((process.env.HOME || '') + '/wk-libs')) process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = '1';
  const H = process.env.HOME || '', wk = H + '/wk-libs'; const env = fs.existsSync(wk) ? Object.assign({}, process.env, { PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: '1', LD_LIBRARY_PATH: wk + '/usr/lib/x86_64-linux-gnu:' + wk + '/lib/x86_64-linux-gnu:' + (process.env.LD_LIBRARY_PATH || ''), GST_PLUGIN_SYSTEM_PATH: wk + '/usr/lib/x86_64-linux-gnu/gstreamer-1.0', __EGL_VENDOR_LIBRARY_DIRS: wk + '/usr/share/glvnd/egl_vendor.d', LIBGL_DRIVERS_PATH: wk + '/usr/lib/x86_64-linux-gnu/dri', LIBGL_ALWAYS_SOFTWARE: '1', GALLIUM_DRIVER: 'llvmpipe', EGL_PLATFORM: 'surfaceless', WPE_BACKEND_FDO_DISABLE: '' }) : process.env;
  try { out.webkit = track(await webkit.launch({ env })); } catch (e) { out.wkXato = String(e.message || e).split('\n')[0]; }
  return out;
}
export const WIDTHS = [320, 375, 390, 430];
/* seed: o.food = [[sana, fid, meal, kcal, p, f, c]], o.steps, o.ex (daqiqa), o.water, o.age (kun), o.profile */
export function seed(o = {}) {
  const st = S.emptyState(); st.setup = true; const age = o.age == null ? 20 : o.age; st.created = Date.now() - age * 864e5; st.trackStart = D.addDays(T0, -age);
  st.prefs = Object.assign({ tipsDone: true, jokes: false, lpTip: 1, yemayK: 1, ttAsked: 1, suvFrom: T0, hwSeen: T0, baliqOff: true, fc: { done: 1 }, crd: { ekran: { ok: 1 }, ilova: { ok: 1 }, akkaunt: { ok: 1 } }, fw: { x: [], d: T0 }, h_backup: Date.now(), h_hafta: Date.now(), h_tahlil: Date.now(), tlSeen: 1, bx: { off: 1 } }, o.prefs || {});
  st.profile = Object.assign({ sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'slow' }, o.profile || {}); S.addWeight(st, D.addDays(T0, -10), 81); S.addWeight(st, T0, 80);
  (o.food || []).forEach(([d, fid, meal, kcal, pr, f, c], i) => S.addFood(st, d, { fid, meal, unit: 'porsiya', qty: 1, g: 100, kcal, p: pr, f, c, ts: i + 1 }));          // [sana, taom id, ovqat vaqti, kkal, oqsil, yog', uglevod]
  if (o.steps != null) { st.days[T0] = st.days[T0] || {}; st.days[T0].steps = o.steps; } if (o.ex) { st.days[T0] = st.days[T0] || {}; st.days[T0].ex = [{ t: 'x', min: o.ex }]; } if (o.water) S.setWater(st, T0, o.water);
  return st;
}
/* sahifa: o = {w, h, lang, scheme, hour, st, zoom (matn kattalashtirish, 1.15), reduced} */
export async function open(b, BASE, o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: o.scheme || 'light', reducedMotion: o.reduced ? 'reduce' : 'no-preference' });
  await c.addInitScript((a) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', a.st); localStorage.setItem('kalki_lang', a.lang); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_no_fc', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); } } catch (e) {}
    if (a.hour != null) { const R = Date, off = new R(new R().setHours(a.hour, 0, 0, 0)).getTime() - R.now(); class D2 extends R { constructor(...x) { if (x.length === 0) super(R.now() + off); else super(...x); } static now() { return R.now() + off; } } window.Date = D2; } },
  { st: JSON.stringify(o.st || seed()), lang: o.lang === 'cyr' ? 'cyr' : (o.lang || 'uz'), hour: o.hour == null ? 14 : o.hour });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(BASE + (o.lang === 'ru' ? '/ru/kalkifit' : o.lang === 'cyr' ? '/kalkifit?lang=cyr' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForSelector('#bjuCard'); await p.waitForTimeout(o.settle || 700);
  if (o.big) await p.evaluate(() => document.documentElement.classList.add('fs-big'));          // ilovaning «Katta shrift» rejimi
  if (o.zoom && o.zoom !== 1) await p.evaluate(ZOOM, o.zoom);          // tizim matn kattalashtirishi (Dynamic Type / Android textZoom) — har bir elementning shrifti k marta
  if (o.big || o.zoom) await p.waitForTimeout(300);
  return p;
}
export const ZOOM = (k) => { const apply = (root) => { const els = [root, ...root.querySelectorAll('*')].filter((e) => !e.__z); const sz = els.map((e) => parseFloat(getComputedStyle(e).fontSize)); els.forEach((e, i) => { e.__z = 1; e.style.setProperty('font-size', (sz[i] * k) + 'px', 'important'); }); };
  apply(document.body); new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((x) => { if (x.nodeType === 1) apply(x); }))).observe(document.body, { childList: true, subtree: true }); };
/* CHECK (sahifada bajariladi): scope ichida
     bad  — matnli elementlar (va ::before/::after matni) bir-birini kesadi (>2 px);
     over — matn ekran chetidan chiqadi; hscroll — sahifa/konteyner gorizontal aylanadi (scrollWidth > clientWidth);
     esc  — matn o'z kartasi/tugmasidan chiqadi;  clip — nowrap matn o'z katagidan toshadi (qo'shni katakka kirishi mumkin) */
export const CHECK = (scope) => {
  const root = document.querySelector(scope); if (!root) return { err: "yo'q: " + scope };
  const added = [];
  root.querySelectorAll('*').forEach((e) => { if (e.closest('svg')) return; ['::before', '::after'].forEach((ps) => { const cs = getComputedStyle(e, ps), ct = cs.content; if (!ct || ct === 'none' || ct === 'normal') return; const parts = ct.match(/"((?:[^"\\]|\\.)*)"/g); const t = parts ? parts.map((x) => x.slice(1, -1)).join('') : null; if (t == null || !t.trim()) return;
    const s = document.createElement('span'); s.setAttribute('data-pseudo', '1'); s.textContent = t; s.style.cssText = 'font:inherit;color:inherit;white-space:inherit;position:static;display:' + (cs.display === 'block' ? 'block' : 'inline') + ';';
    if (ps === '::before') e.insertBefore(s, e.firstChild); else e.appendChild(s); e.setAttribute('data-nopseudo' + (ps === '::before' ? 'b' : 'a'), '1'); added.push([e, s]); }); });
  const st = document.createElement('style'); st.textContent = '[data-nopseudob]::before{content:none!important}[data-nopseudoa]::after{content:none!important}'; document.head.appendChild(st);
  const vis = (e) => { const c = getComputedStyle(e); if (c.visibility === 'hidden' || c.display === 'none' || +c.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const all = [...root.querySelectorAll('*')].filter((e) => !e.closest('[hidden],[aria-hidden=true],svg,.rz-sr,.sl-vessel,#kfSplash,.sl-fishswim,.rz-tip,.sl-addbar,.ny-bar') && [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) && vis(e));
  const clipOf = (e) => { let L = -1e9, T = -1e9, R = 1e9, B = 1e9, hs = false; for (let a = e; a && a !== document.body; a = a.parentElement) { const c = getComputedStyle(a); if (c.overflowX !== 'visible' || c.overflowY !== 'visible') { const r = a.getBoundingClientRect(); L = Math.max(L, r.left); T = Math.max(T, r.top); R = Math.min(R, r.right); B = Math.min(B, r.bottom); if (/auto|scroll/.test(c.overflowX)) hs = true; } } return { L, T, R, B, hs }; };
  const sb = [...root.querySelectorAll('.pw-bar')].filter(vis).map((x) => x.getBoundingClientRect().top);
  const boxes = all.map((e) => { const rg = document.createRange(); rg.selectNodeContents(e); const cl = clipOf(e); if (sb.length && !e.closest('.pw-bar')) cl.B = Math.min(cl.B, ...sb); const rs = [...rg.getClientRects()].map((r) => ({ left: Math.max(r.left, cl.L), top: Math.max(r.top, cl.T), right: Math.min(r.right, cl.R), bottom: Math.min(r.bottom, cl.B) })).filter((r) => r.right - r.left > 1 && r.bottom - r.top > 1); return { e, rs, hs: cl.hs }; }).filter((x) => x.rs.length);
  const cn = (e) => String(e.className && e.className.baseVal != null ? e.className.baseVal : e.className || '').split(' ')[0] || e.tagName.toLowerCase(); const name = (e) => (e.parentElement && e.parentElement.id !== 'rzMain' ? cn(e.parentElement) + '>' : '') + (e.id ? '#' + e.id : '') + '.' + cn(e) + '«' + e.textContent.trim().slice(0, 22) + '»';
  const bad = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const A = boxes[i], B = boxes[j]; if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
    for (const a of A.rs) for (const c of B.rs) { const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (ox > 2 && oy > 2) { bad.push(name(A.e) + ' × ' + name(B.e)); break; } } }
  const W = document.documentElement.clientWidth, over = boxes.filter((x) => !x.hs && x.rs.some((r) => r.right > W + 1 || r.left < -1)).map((x) => name(x.e));
  const esc = boxes.filter((x) => { if (x.hs) return false; const p = x.e.closest('.rz-card,.sl-card,.sl-meal,button,.rz-row'); if (!p || p === x.e) return false; const pr = p.getBoundingClientRect(); return x.rs.some((r) => r.right > pr.right + 2 || r.left < pr.left - 2); }).map((x) => name(x.e));
  const clip = all.filter((e) => { const c = getComputedStyle(e); if (c.overflowX !== 'visible' || /ellipsis/.test(c.textOverflow) || e.closest('[data-hs]')) return false; const er = e.getBoundingClientRect(); if (er.width < 1) return false;
    return [...e.childNodes].some((n) => { if (n.nodeType !== 3 || !n.textContent.trim()) return false; const rg = document.createRange(); rg.selectNodeContents(n); return [...rg.getClientRects()].some((r) => r.width > 0 && (r.right > er.right + 1.5 || r.left < er.left - 1.5)); }); }).map(name);          /* matn o'z katagidan toshadi (qo'shni katakka kirishi mumkin); ::after hit-area scrollWidth'ga kirmaydi */
  const hscroll = []; if (document.documentElement.scrollWidth > W + 1) hscroll.push('sahifa ' + document.documentElement.scrollWidth + '>' + W);
  root.querySelectorAll('*').forEach((e) => { if (!vis(e)) return; const c = getComputedStyle(e); if (/auto|scroll/.test(c.overflowX) && e.scrollWidth > e.clientWidth + 1 && !e.hasAttribute('data-hs') && !/(^|\s)(sl-chips|sl-qk|kq-chips|rz-chips|ny-ch)\b/.test(String(e.className))) hscroll.push(name(e) + ' ' + e.scrollWidth + '>' + e.clientWidth); });
  added.forEach(([e, s]) => { s.remove(); e.removeAttribute('data-nopseudob'); e.removeAttribute('data-nopseudoa'); }); st.remove();
  return { bad: [...new Set(bad)], over: [...new Set(over)], esc: [...new Set(esc)], clip: [...new Set(clip)], hscroll, n: boxes.length };
};
export const nat = (r) => ['bad', 'over', 'esc', 'clip', 'hscroll'].filter((k) => r[k] && r[k].length).map((k) => k + ': ' + r[k].slice(0, 4).join(' | ')).join(' ;; ');
