// PWA tekshiruvi: manifest validatsiyasi, ikonka o'lchamlari, <head> havolalari (UZ/RU/CYR), installability (CDP), o'rnatish tugmasi (Android/iOS), /cyr/ JS-siz.
// node tools/dizayn/test-pwa.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const res = [];
const SHOTDIR = process.env.SKRINSHOT_DIR || path.join(ROOT, 'docs/dizayn-skrinshot');          // runner: vaqtinchalik papka (repo o'zgarmaydi)
const T = (ok, name, info = '') => { res.push(ok); console.log((ok ? 'OK   ' : 'YIQILDI ') + name + (info ? ' — ' + info : '')); };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port;
// 1) manifest
const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
T(m.name === 'Kalki.uz — kalkulyatorlar va hujjatlar' && m.short_name === 'Kalki' && m.start_url === '/?source=pwa' && m.scope === '/' && m.display === 'standalone' && m.lang === 'uz', 'manifest: name/short_name/start_url/scope/display/lang');
T(/^#[0-9a-f]{6}$/i.test(m.theme_color) && /^#[0-9a-f]{6}$/i.test(m.background_color), 'manifest: theme_color/background_color', m.theme_color + ' / ' + m.background_color);
const tok = fs.readFileSync(path.join(ROOT, 'assets/css/tokens.css'), 'utf8'); T(tok.includes('--ink:' + m.theme_color.toUpperCase()) && tok.includes('--bg:' + m.background_color.toUpperCase()), 'manifest ranglari dizayn tokenlaridan (--ink, --bg)');
const sizeOf = (f) => { const d = fs.readFileSync(path.join(ROOT, f)); return d.readUInt32BE(16) + 'x' + d.readUInt32BE(20); };
for (const i of m.icons) { const f = i.src.replace(/^\//, ''); T(fs.existsSync(path.join(ROOT, f)) && sizeOf(f) === i.sizes, 'ikonka ' + i.src + ' (' + i.purpose + ')', sizeOf(f)); }
T(m.icons.some((i) => i.purpose === 'maskable' && i.sizes === '512x512') && m.icons.some((i) => i.sizes === '192x192') && m.icons.some((i) => i.sizes === '512x512' && i.purpose === 'any'), 'ikonkalar: 192, 512, maskable 512');
T(sizeOf('assets/icons/apple-touch-icon-180.png') === '180x180', 'apple-touch-icon 180x180');
// 1b) Ro'zg'or — alohida manifest (UZ va RU): o'z nomi, start_url, scope, ikonkalar
for (const [file, nm, st, sc] of [['rozgor.webmanifest', "Ro'zg'or", '/rozgor?src=pwa', '/rozgor'], ['ru/rozgor.webmanifest', 'Рузгор', '/ru/rozgor?src=pwa', '/ru/rozgor']]) {
  const rm = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  T(rm.name === nm && rm.short_name === nm && rm.start_url === st && rm.scope === sc && rm.display === 'standalone' && rm.start_url.startsWith(rm.scope) && rm.id !== m.id, file + ': alohida nom/start_url/scope', rm.start_url + ' | ' + rm.scope);
  for (const i of rm.icons) { const f = i.src.replace(/^\//, ''); T(fs.existsSync(path.join(ROOT, f)) && sizeOf(f) === i.sizes, file + ' ikonka ' + i.src + ' (' + i.purpose + ')', sizeOf(f)); }
}
T(sizeOf('assets/icons/rozgor-apple-180.png') === '180x180', 'Ro\'zg\'or apple-touch-icon 180x180');
// 1b) KalkiFit — alohida manifest: o'z nomi, id, ikonkalar
const sm = JSON.parse(fs.readFileSync(path.join(ROOT, 'kalkifit.webmanifest'), 'utf8'));
T(sm.short_name === 'KalkiFit' && sm.id === '/kalkifit' && sm.start_url === '/kalkifit?source=pwa' && sm.scope === '/' && sm.display === 'standalone' && sm.id !== m.id, 'KalkiFit manifest: alohida nom/id/start_url');
for (const i of sm.icons) { const f = i.src.replace(/^\//, ''); T(fs.existsSync(path.join(ROOT, f)) && sizeOf(f) === i.sizes, 'KalkiFit ikonka ' + i.src + ' (' + i.purpose + ')', sizeOf(f)); }
T(sizeOf('assets/icons/kalkifit-apple-180.png') === '180x180', 'KalkiFit apple-touch-icon 180x180');
// 2) <head> havolalari (barcha sahifa, UZ/RU/CYR)
let miss = [], cnt = 0;
const dirs = ['', 'ru/', 'cyr/'];
for (const d of dirs) for (const f of fs.readdirSync(path.join(ROOT, d || '.')).filter((x) => x.endsWith('.html') && !/^(yandex|offline)/.test(x))) { cnt++; const h = fs.readFileSync(path.join(ROOT, d + f), 'utf8'); const head = h.slice(0, h.indexOf('</head>'));
  const own = f === 'rozgor.html' ? (d === 'ru/' ? '/ru/rozgor.webmanifest' : '/rozgor.webmanifest') : (f === 'kalkifit.html' ? '/kalkifit.webmanifest' : null);   // Ro'zg'or va KalkiFit — alohida PWA (o'z manifest va ikonkasi)
  if (!head.includes('<link rel="manifest" href="' + (own || '/manifest.webmanifest') + '"') || !head.includes('rel="apple-touch-icon" href="/assets/icons/' + (own ? (f === 'kalkifit.html' ? 'kalkifit-apple-180.png' : 'rozgor-apple-180.png') : 'apple-touch-icon-180.png') + '"') || (head.match(/rel="manifest"/g) || []).length !== 1) miss.push(d + f); }
T(miss.length === 0, 'manifest + apple-touch-icon barcha sahifa <head> da (bittadan)', cnt + ' sahifa' + (miss.length ? ', yo\'q: ' + miss.slice(0, 4).join(', ') : ''));
const cy = fs.readdirSync(path.join(ROOT, 'cyr')).filter((x) => x.endsWith('.html')); T(cy.every((f) => !/<script(?![^>]*type="application\/(ld\+)?json")[^>]*>/.test(fs.readFileSync(path.join(ROOT, 'cyr', f), 'utf8'))), '/cyr/: ijro etiladigan skript yo\'q (faqat <link>)', cy.length + ' sahifa');
// 3) installability (CDP) va tugma
const b = track(await chromium.launch()); let c = await b.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'allow' }); let p = await c.newPage();
// «Yangiliklar» oynasi sinovlarga xalaqit bermasin: ikkala ilova uchun yangiliklar «ko'rilgan» deb belgilanadi (oyna o'zi test-yangilik.mjs da tekshiriladi)
{ const nc0 = b.newContext.bind(b); b.newContext = async (o) => { const c = await nc0(o); await c.addInitScript(() => { try { for (const a of ['kalkifit', 'rozgor']) if (!localStorage.getItem('kalki_news_' + a)) localStorage.setItem('kalki_news_' + a, '{"shown":999,"read":999}'); } catch (e) {} }); return c; }; }
await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|t\.me/, (r) => r.abort()); await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.evaluate(() => navigator.serviceWorker.ready); await p.waitForTimeout(1500);
const cdp = await c.newCDPSession(p); const inst = await cdp.send('Page.getInstallabilityErrors').catch((e) => ({ installabilityErrors: [{ errorId: 'cdp:' + e.message }] }));
T(inst.installabilityErrors.length === 0, 'installability (Chrome CDP): xato yo\'q', JSON.stringify(inst.installabilityErrors.map((e) => e.errorId)));
const mf = await p.evaluate(async () => { const l = document.querySelector('link[rel=manifest]'); const r = await fetch(l.href); return { ok: r.ok, ct: r.headers.get('content-type') }; }); T(mf.ok, 'manifest yuklanadi', mf.ct);
// Android: beforeinstallprompt sintetik
T(!(await p.locator('#pwaInst:visible').count()), 'o\'rnatish tugmasi dastlab ko\'rinmaydi (majburiy oyna yo\'q)');
await p.evaluate(() => { const e = new Event('beforeinstallprompt', { cancelable: true }); e.prompt = () => { window.__prompted = true; }; e.userChoice = Promise.resolve({ outcome: 'accepted' }); window.dispatchEvent(e); });
await p.waitForTimeout(200); const bt = p.locator('#pwaBtn'); T(await bt.isVisible() && /Telefonga o'rnatish/.test(await bt.innerText()), 'beforeinstallprompt → "Telefonga o\'rnatish" tugmasi ko\'rinadi');
await bt.click(); T(await p.evaluate(() => window.__prompted === true) && !(await bt.isVisible()), 'tugma bosilsa prompt() chaqiriladi va tugma yashiriladi');
await c.close();
// RU matni
c = await b.newContext({ viewport: { width: 390, height: 800 } }); p = await c.newPage(); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|t\.me/, (r) => r.abort()); await p.goto(BASE + '/ru/kredit-kalkulyator', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);   // sw-boot birinchi marta sahifani qayta yuklashi mumkin
await p.evaluate(() => { const e = new Event('beforeinstallprompt', { cancelable: true }); e.prompt = () => {}; window.dispatchEvent(e); }); await p.waitForTimeout(200);
T(/Установить на телефон/.test(await p.locator('#pwaBtn').innerText()), 'RU: "Установить на телефон"'); await p.screenshot({ path: path.join(SHOTDIR, 'pwa-ru-footer-390.png'), clip: { x: 0, y: 0, width: 390, height: 10 } }).catch(() => {});
await p.locator('#sf2').scrollIntoViewIfNeeded(); await p.locator('#pwaInst').screenshot({ path: path.join(SHOTDIR, 'pwa-ru-tugma.png') }); await c.close();
// iPhone Safari: ko'rsatma
c = await b.newContext({ viewport: { width: 390, height: 800 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' }); p = await c.newPage();
await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|t\.me/, (r) => r.abort()); await p.goto(BASE + '/kredit-kalkulyator', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
const hint = await p.locator('#pwaInst .pwa-ios').innerText().catch(() => ''); T(/Ulashish.*Bosh ekranga qo'shish/.test(hint) && !(await p.locator('#pwaBtn').isVisible()), 'iPhone Safari: "Ulashish → Bosh ekranga qo\'shish" ko\'rsatmasi, tugma yo\'q', hint);
await p.evaluate(() => { document.documentElement.lang = 'ru'; }); await p.waitForTimeout(200); T(/Поделиться/.test(await p.locator('#pwaInst .pwa-ios').innerText()), 'iPhone: RU ko\'rsatma');
await p.locator('#pwaInst').scrollIntoViewIfNeeded(); await p.locator('#pwaInst').screenshot({ path: path.join(SHOTDIR, 'pwa-ios-korsatma.png') }); await c.close();
// standalone: hech narsa
c = await b.newContext({ viewport: { width: 390, height: 800 } }); p = await c.newPage(); await p.addInitScript(() => { const mm = window.matchMedia.bind(window); window.matchMedia = (q) => (/display-mode: standalone/.test(q) ? { matches: true, addListener() {}, addEventListener() {}, removeEventListener() {} } : mm(q)); });
await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|t\.me/, (r) => r.abort()); await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500); await p.evaluate(() => { const e = new Event('beforeinstallprompt', { cancelable: true }); e.prompt = () => {}; window.dispatchEvent(e); }); await p.waitForTimeout(200);
T(!(await p.locator('#pwaInst').count()), 'o\'rnatilgan (standalone) rejimda tugma/ko\'rsatma yo\'q'); await c.close();
await b.close(); srv.close(); process.exit(res.every(Boolean) ? 0 : 1);
