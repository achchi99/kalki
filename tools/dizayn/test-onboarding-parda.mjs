// «Keyinroq» yo'li: Bugun ochilgach kulrang parda ekranni qoplab qolmasin (iPhone Safari xatosi). 1 s ichida «Ovqat qo'shish» ko'rinadi va bosiladi; ochiq qatlam (yo'l-yo'riq) kartasi ekran ichida;
// parda yoki Escape bosilsa yopiladi; nishon ekrandan tashqarida bo'lsa qadam o'tkaziladi; skroll 0.   node tools/dizayn/test-onboarding-parda.mjs   (WEBKIT=1 — o'rnatilgan WebKit'ni sinaydi, bo'lmasa Chromium)
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { chromium, webkit } from 'playwright'; import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port;
let b, eng = 'chromium'; if (process.env.WEBKIT) { try { b = track(await webkit.launch()); eng = 'webkit'; } catch (e) { console.log('WebKit ishga tushmadi → Chromium:', String(e).split('\n')[0]); } } if (!b) b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
async function mk(o) {
  const c = await b.newContext({ colorScheme: o.dark ? 'dark' : 'light', reducedMotion: o.reduce ? 'reduce' : 'no-preference', viewport: { width: o.w, height: o.h }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((far) => { localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); if (far) document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '#kcalBtn{position:relative;top:2500px}'; document.head.appendChild(s); }); }, !!o.far);
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(400); return p; }
/* Bugun ochilgach: ko'rinadigan va bosiladigan «Ovqat qo'shish»; ochiq qatlam ichidagi kontent viewport ichida */
const probe = (p) => p.evaluate(() => {
  const vw = innerWidth, vh = innerHeight, inV = (r) => r.width > 0 && r.height > 0 && r.left >= -1 && r.top >= -1 && r.right <= vw + 1 && r.bottom <= vh + 1;
  const add = document.getElementById('mainAdd'); let r = add.getBoundingClientRect(); if (!inV(r) && !window.__noScroll) { document.getElementById('rzMain').scrollTop += Math.round(r.top + r.height / 2 - vh / 2); r = add.getBoundingClientRect(); }      /* kichik ekranda «Ovqat qo'shish» nav ostida — odatdagidek skroll bilan */
  const tips = document.getElementById('rzTips'), tOn = tips && !tips.hidden, card = tOn && tips.querySelector('.rz-tipcard');
  const bg = document.getElementById('rzBg'), sh = document.getElementById('rzSheet'), onb = document.getElementById('rzOnb'), main = document.getElementById('rzMain');
  const cx = r ? Math.round(r.left + r.width / 2) : 0, cy = r ? Math.round(r.top + r.height / 2) : 0, hit = r && document.elementFromPoint(cx, cy);
  return { addVis: !!r && r.width > 0 && inV(r), addHit: !!hit && (hit === add || add.contains(hit)), tipsOn: !!tOn, cardIn: card ? inV(card.getBoundingClientRect()) : null, cardH: card ? Math.round(card.getBoundingClientRect().height) : 0, bgOn: !!bg && !bg.hidden, shOn: !!sh && !sh.hidden, onbOn: !!onb && !onb.hidden, sc: main ? main.scrollTop : -1, wy: scrollY, root: [document.querySelector('.rz').scrollTop, document.documentElement.scrollTop] }; });
const probe0 = (p) => p.evaluate(() => { window.__noScroll = true; }).then(() => probe(p)).finally(() => p.evaluate(() => { window.__noScroll = false; }));
const SC = [[390, 844, false, false], [390, 844, true, true], [360, 640, false, true], [360, 640, true, false]];
try {
  for (const [w, h, dark, reduce] of SC) {
    const tag = `${w}×${h} ${dark ? 'dark' : 'light'} ${reduce ? 'reduced-motion' : 'animatsiya'}`;
    const p = await mk({ w, h, dark, reduce }); await p.click('[data-act=obsex][data-v=m]'); await p.click('[data-act=oblater]'); await p.waitForTimeout(1000);
    let r = await probe0(p); assert.equal(r.onbOn, false, tag + ': onboarding qatlami yopilmagan'); assert.equal(r.sc, 0, tag + ': skroll 0 emas'); assert.equal(r.wy, 0, tag + ': oyna skrolli 0 emas'); assert.deepEqual(r.root, [0, 0], tag + ': ildiz siljigan');
    if (r.tipsOn) { assert.equal(r.cardIn, true, tag + ': yo\'l-yo\'riq kartasi ekran ichida emas ' + JSON.stringify(r)); assert.equal(r.addHit, false, tag + ': parda ostida bosib bo\'lmaydi (kutilgan)'); }
    /* parda bosilsa yopiladi */
    if (r.tipsOn) { await p.mouse.click(4, h - 4); await p.waitForTimeout(250); r = await probe(p); assert.equal(r.tipsOn, false, tag + ': parda bosilganda yopilmadi'); }
    r = await probe(p); assert.ok(r.addVis, tag + ': «Ovqat qo\'shish» ko\'rinmaydi ' + JSON.stringify(r)); assert.ok(r.addHit, tag + ': «Ovqat qo\'shish» ustida to\'siq bor'); assert.deepEqual([r.bgOn, r.shOn, r.onbOn], [false, false, false], tag + ': ochiq qatlam qoldi');
    await p.mouse.click(...(await p.evaluate(() => { const r = document.getElementById('mainAdd').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }))); await p.waitForTimeout(500); assert.equal((await probe(p)).shOn, true, tag + ': «Ovqat qo\'shish» ochmadi');
    /* sheet orqa pardasi bosilsa yopiladi */
    await p.mouse.click(w / 2, 6); await p.waitForTimeout(500); r = await probe(p); assert.deepEqual([r.bgOn, r.shOn], [false, false], tag + ': sheet pardasi bosilganda yopilmadi'); assert.deepEqual(p.errs, [], tag);
    await p.context().close();
  }
  log('«Keyinroq» → Bugun (390/360, light/dark, reduced-motion bor/yo\'q, ' + eng + '): 1 s ichida onboarding yopiq, skroll 0, kartа ekran ichida, parda bosilsa yopiladi, «Ovqat qo\'shish» ko\'rinadi va bosiladi, sheet pardasi yopadi');
  /* Escape yo'l-yo'riqni yopadi */
  let p = await mk({ w: 390, h: 844 }); await p.click('[data-act=obsex][data-v=f]'); await p.click('[data-act=oblater]'); await p.waitForSelector('#rzTips', { state: 'visible', timeout: 3000 }); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  let r = await probe(p); assert.equal(r.tipsOn, false, 'Escape yo\'l-yo\'riqni yopmadi'); assert.ok(r.addHit); assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')).prefs.tipsDone), true, 'yopilgach qayta chiqmasligi kerak'); await p.context().close();
  log('Escape yo\'l-yo\'riqni yopadi va qayta chiqmaydi (tipsDone)');
  /* nishon ekrandan tashqarida: qadam o'tkaziladi / karta baribir ekran ichida, ilova qotmaydi */
  for (const [w, h] of [[390, 844], [360, 640]]) {
    p = await mk({ w, h, far: true }); await p.click('[data-act=obsex][data-v=m]'); await p.click('[data-act=oblater]'); await p.waitForTimeout(1200); r = await probe(p);
    if (r.tipsOn) { assert.equal(r.cardIn, true, `${w}: nishon ekrandan tashqarida — karta ekran ichida bo'lishi shart ` + JSON.stringify(r)); await p.mouse.click(4, h - 4); await p.waitForTimeout(250); r = await probe(p); }
    assert.equal(r.tipsOn, false, `${w}: parda bosilgach yopiq`); assert.ok(r.addVis && r.addHit, `${w}: «Ovqat qo'shish» bosiladi ` + JSON.stringify(r)); await p.context().close();
  }
  log('Nishon (#kcalBtn) ekrandan tashqarida: qadam o\'tkaziladi yoki karta ekran ichida; ilova qotmaydi, parda yopiladi');
  console.log('\n' + n + ' ta tekshiruv o\'tdi (' + eng + ')');
} finally { await b.close(); srv.close(); }
