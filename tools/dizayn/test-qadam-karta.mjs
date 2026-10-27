// KalkiFit v49 — Android ilovada Bugun'dagi QADAM KARTASI doim ko'rinadi (suv kartasi yonida), holatlari: yoqilgan (son + progress), ruxsat yo'q («Qadamni yoqish»), rad etilgan (tugma + sozlama yo'li),
// sensor yo'q (qisqa izoh), plagin yo'q (eski ilova: «ilovani yangilang»), ko'prik kech tayyor bo'lsa ham topiladi; veb/iPhone — kartasiz (suv ixcham bitta qator); qadam st.days[d].steps ga yoziladi.
// native ko'prik SOXTA (Capacitor.nativePromise). 360/390 px × 115% × UZ/RU/ЎЗ × tungi.   node tools/dizayn/test-qadam-karta.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), D = S.dates, TODAY = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const nb = (x) => String(x).replace(/[   ]/g, ' ').replace(/\s+/g, ' ').trim();
function seed(prefs) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 864e5; st.trackStart = D.addDays(TODAY, -8); st.prefs = Object.assign({ tipsDone: true, jokes: false, yemayK: 1, introDone: true, lpTip: 1, suvFrom: TODAY, ttAsked: 1, hwSeen: TODAY, h_backup: Date.now() }, prefs || {}); st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'lose', tartib: 'std' }; S.addWeight(st, TODAY, 80); return st; }
/* bridge: 'none' (veb) | 'native-noplugin' (ilova, plagin sarlavhasi yo'q) | 'plugin' | 'late' (sarlavha sahifa yuklangach paydo bo'ladi); pl = { available, granted, grant, today, sensor, sensorGranted, hc } */
async function mk(o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: o.th || 'light' });
  await c.addInitScript((a) => { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(a.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); if (a.lang) localStorage.setItem('kalki_lang', a.lang); }
    if (a.mode === 'none') return; const q = window.__q = Object.assign({ calls: [], available: true, granted: false, grant: true, today: 0, sensor: true, sensorGranted: false, hc: 'none' }, a.pl || {});
    const H = [{ name: 'Share' }]; window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', PluginHeaders: H, nativePromise: (pl, m, opt) => { q.calls.push(pl + '.' + m); if (pl !== 'Qadam') return Promise.reject(new Error('yo\'q'));
      if (m === 'isAvailable') return Promise.resolve({ available: q.available, granted: q.available && q.granted, enabled: !!q.enabled, source: q.granted ? 'sensor' : '', hc: q.hc, sensor: q.sensor, sensorGranted: q.granted || q.sensorGranted });
      if (m === 'requestPermission' || m === 'ulash') { q.granted = !!q.grant; return Promise.resolve({ granted: q.granted, source: 'sensor', sensor: q.sensor, sensorGranted: q.granted }); }
      if (m === 'setEnabled') { q.enabled = !!opt.on && q.granted; return Promise.resolve({ enabled: q.enabled }); } if (m === 'getToday') return Promise.resolve({ qadam: q.today, oxirgiYangilanish: Date.now(), sana: a.TODAY });
      if (m === 'getDays') return Promise.resolve({ source: 'sensor', kunlar: [{ sana: a.TODAY, qadam: q.today }] }); return Promise.reject(new Error('?')); } };
    if (a.mode === 'plugin') H.push({ name: 'Qadam' }); if (a.mode === 'late') setTimeout(() => H.push({ name: 'Qadam' }), 900); }, { st: o.st || seed(o.prefs), mode: o.mode || 'plugin', pl: o.pl || null, lang: o.lang, TODAY });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|\/api\//, (r) => r.abort());
  await p.goto(BASE + (o.lang === 'ru' ? '/ru/kalkifit' : o.lang === 'cyr' ? '/kalkifit?lang=cyr' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(o.wait || 900);
  if (o.zoom) { await p.evaluate((k) => { const ap = (root) => { const els = [root, ...root.querySelectorAll('*')].filter((e) => !e.__z), sz = els.map((e) => parseFloat(getComputedStyle(e).fontSize)); els.forEach((e, i) => { e.__z = 1; e.style.setProperty('font-size', (sz[i] * k) + 'px', 'important'); }); }; ap(document.body); new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((x) => { if (x.nodeType === 1) ap(x); }))).observe(document.body, { childList: true, subtree: true }); }, o.zoom); await p.waitForTimeout(250); }
  return p;
}
const card = (p) => p.evaluate(() => { const c = document.querySelector('.sl-s'); if (!c) return null; const w = document.querySelector('.sl-exc').getBoundingClientRect(), r = c.getBoundingClientRect(), W = document.documentElement.clientWidth;
  const tx = [...c.querySelectorAll('*')].filter((e) => [...e.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim()) && e.getBoundingClientRect().width > 0);
  return { st: c.dataset.st, text: c.innerText.replace(/\s+/g, ' ').trim(), side: Math.abs(r.top - w.top) < 4 && w.left > r.right - 1 && w.right <= W + 0.5, duo: !c.parentNode.classList.contains('one'),          /* v55: qadam — mashg'ulot bilan yonma-yon (suv alohida qatorda) */ out: tx.filter((e) => { const q = e.getBoundingClientRect(); return q.right > r.right + 1 || q.left < r.left - 1; }).map((e) => e.className || e.tagName).slice(0, 3), small: tx.filter((e) => parseFloat(getComputedStyle(e).fontSize) < 12.9).length, hs: document.documentElement.scrollWidth > innerWidth + 1, h: Math.round(r.height), wh: Math.round(w.height) }; });
const stOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')));
try {
  /* 1. veb / iPhone — kartasiz, suv ixcham */
  let p = await mk({ mode: 'none' }); assert.equal(await p.locator('.sl-s:not([data-st=web])').count(), 0, 'v55: vebda faqat qo\'lda kiritish kartasi'); assert.equal(await p.locator('.sl-duo.one #wCard').count(), 1, 'suv bitta ixcham qator'); assert.equal(await p.locator('#wBar').count(), 1); assert.deepEqual(p.errs, []); await p.context().close();
  /* 2. ruxsat BOR — son, progress; qadam st.days[d].steps ga yoziladi */
  p = await mk({ pl: { granted: true, enabled: true, today: 3456, sensorGranted: true }, prefs: { qa: 'on' } }); let c = await card(p); assert.equal(c.st, 'on'); assert.match(c.text, /^Qadam 3 456 \/ [\d ]+ /); assert.ok(c.side && c.duo, 'v55: mashg\'ulot bilan yonma-yon'); assert.ok(!c.out.length && !c.hs);
  assert.equal((await stOf(p)).days[TODAY].steps, 3456, 'st.days[bugun].steps yozildi (plato tahlili uchun)'); await p.context().close();
  ok('Ruxsat bor: «' + c.text + '» suv yonida, qadam st.days[d].steps ga yozildi; veb — kartasiz, suv ixcham');
  /* 3. ruxsat YO'Q (hali so'ralmagan) — «Qadamni yoqish»; bosilsa ruxsat oynasi */
  p = await mk({ pl: { granted: false, grant: true } }); c = await card(p); assert.equal(c.st, 'off'); assert.match(c.text, /Qadamni yoqish/); assert.ok(c.side && !c.out.length && !c.hs, JSON.stringify(c));
  await p.click('.sl-s [data-act=qaulash]'); await p.waitForTimeout(500); assert.equal(await p.evaluate(() => document.getElementById('rzSheet').getAttribute('data-kind')), 'qaask', 'ruxsat oynasi'); await p.click('#rzSheet [data-act=qayes]'); await p.waitForTimeout(700);
  assert.equal((await card(p)).st, 'on', 'ruxsat berildi → yoqildi'); assert.ok((await p.evaluate(() => window.__q.calls)).includes('Qadam.requestPermission') || (await p.evaluate(() => window.__q.calls)).includes('Qadam.ulash')); await p.context().close();
  /* 4. RAD ETILGAN — kartada «Qadamni yoqish», oynada sozlama yo'li */
  p = await mk({ pl: { granted: false, grant: false }, prefs: { qa: 'off' } }); c = await card(p); assert.equal(c.st, 'denied'); assert.match(c.text, /Qadamni yoqish/);
  await p.click('.sl-s [data-act=qaulash]'); await p.waitForTimeout(500); assert.match(nb(await p.locator('#rzSheet .sl-qahint').innerText()), /Telefon sozlamalari → Ilovalar → KalkiFit → Ruxsatlar → Jismoniy faollik/); await p.click('#rzSheet [data-act=qayes]'); await p.waitForTimeout(600); assert.equal((await card(p)).st, 'denied', 'rad etilsa — karta qoladi'); await p.context().close();
  ok('Ruxsat yo\'q: «Qadamni yoqish» → ruxsat oynasi → yoqildi; rad etilgan: tugma qoladi, oynada «Telefon sozlamalari → … → Jismoniy faollik» yo\'li');
  /* 5. sensor yo'q */
  p = await mk({ pl: { available: false, sensor: false } }); c = await card(p); assert.equal(c.st, 'nosensor'); assert.match(c.text, /Bu telefonda qadam sensori yo'q/); assert.ok(c.side && !c.out.length && !c.hs); await p.context().close();
  /* 6. plagin yo'q (eski ilova) — karta baribir bor; ko'prik KECH tayyor bo'lsa — topiladi */
  p = await mk({ mode: 'native-noplugin' }); c = await card(p); assert.equal(c.st, 'old'); assert.match(c.text, /Qadam uchun ilovani yangilang/); assert.ok(c.side); await p.click('.sl-s [data-act=addsteps]'); await p.waitForTimeout(300); assert.match(nb(await p.locator('#rzToast').innerText()), /yangilang/); await p.context().close();
  p = await mk({ mode: 'late', pl: { granted: false }, wait: 5200 }); c = await card(p); assert.ok(['off', 'denied'].includes(c.st), 'kech tayyor bo\'lgan ko\'prik topildi: ' + c.st); assert.match(c.text, /Qadamni yoqish/); assert.deepEqual(p.errs, []); await p.context().close();
  ok('Sensor yo\'q — «Bu telefonda qadam sensori yo\'q»; plagin yo\'q (eski ilova) — karta + «ilovani yangilang»; ko\'prik kech tayyor bo\'lsa ham plagin topiladi va «Qadamni yoqish» chiqadi');
  /* 7. 360/390 px × 115% × UZ/RU/ЎЗ × yorug'/tungi — har holatda karta suv yonida, sig'adi */
  const cases = [['on', { pl: { granted: true, enabled: true, today: 12345, sensorGranted: true }, prefs: { qa: 'on' } }], ['off', { pl: { granted: false } }], ['denied', { pl: { granted: false }, prefs: { qa: 'off' } }], ['nosensor', { pl: { available: false, sensor: false } }], ['old', { mode: 'native-noplugin' }]];
  const rows = [];
  for (const [w, lang, th] of [[360, 'uz', 'light'], [360, 'ru', 'dark'], [390, 'cyr', 'light'], [390, 'uz', 'dark']]) for (const [k, o] of cases) {
    p = await mk(Object.assign({ w, h: 740, lang, th, zoom: 1.15 }, o)); c = await card(p); assert.equal(c.st, k, [w, lang, th, k] + ' holat: ' + c.st);
    assert.ok(c.side && c.duo && !c.out.length && !c.hs && c.small === 0, [w, lang, th, k] + ' sig\'maydi: ' + JSON.stringify(c)); assert.ok(Math.abs(c.h - c.wh) <= 6 || c.h >= c.wh - 40, 'kartalar bir qatorda, balandlik mos: ' + c.h + ' / ' + c.wh); rows.push(c.h); assert.deepEqual(p.errs, []); await p.context().close();
  }
  ok('360/390 px × 115% × UZ/RU/ЎЗ × yorug\'/tungi × 5 holat (' + rows.length + ' kombinatsiya): qadam kartasi suv yonida, sig\'adi, gorizontal siljish yo\'q, ≥ 13 px');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
