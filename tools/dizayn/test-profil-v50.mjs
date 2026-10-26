// KalkiFit v50 — Profil (maket ~/profil-maket.html, 2-ekran): hero (gradient, avatar, «Xush kelibsiz 👋», tahrirlash), maqsad progressi (trend vaznidan; 0 dan to'ladi), maqsadsiz — «Maqsad vaznini qo'shing»,
// 4 plitka (bosilsa — o'sha maydon), kunlik me'yor (defitsit yorlig'i; bosilsa (i) tushuntirish), «Ovqatlanish» (Kun tartibi · Oqsil maqsadi · Yemaydiganlarim), kontrast AA, reduced-motion, 360/390 × 115% × UZ/RU/ЎЗ × tungi.
//   node tools/dizayn/test-profil-v50.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), P = require(path.join(ROOT, 'assets/kalkifit-plato.js')), D = S.dates, TODAY = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const nb = (x) => String(x).replace(/[   ]/g, ' ').replace(/\s+/g, ' ').trim(), F = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
function seed(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 864e5; st.prefs = { tipsDone: true, lpTip: 1, suvFrom: TODAY, jokes: false, hwSeen: TODAY, yemayK: 1, ttAsked: 1, h_backup: Date.now(), yemay: o.yemay || [] };
  st.profile = Object.assign({ sex: 'm', age: 35, height: 186, weight: 91.5, act: 2, goal: 'lose', goalWeight: 82, tartib: 'kech' }, o.profile || {}); S.addWeight(st, D.addDays(TODAY, -30), 91.5); S.addWeight(st, D.addDays(TODAY, -15), 90.2); S.addWeight(st, TODAY, 89); return st; }
async function open(st, o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: o.th || 'light', reducedMotion: o.rm ? 'reduce' : 'no-preference' });
  await c.addInitScript((x) => { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); if (x.lang) localStorage.setItem('kalki_lang', x.lang); }, { st, lang: o.lang });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(BASE + (o.lang === 'ru' ? '/ru/kalkifit' : o.lang === 'cyr' ? '/kalkifit?lang=cyr' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  if (o.zoom) { await p.evaluate((k) => { const ap = (root) => { const els = [root, ...root.querySelectorAll('*')].filter((e) => !e.__z), sz = els.map((e) => parseFloat(getComputedStyle(e).fontSize)); els.forEach((e, i) => { e.__z = 1; e.style.setProperty('font-size', (sz[i] * k) + 'px', 'important'); }); }; ap(document.body); new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((x) => { if (x.nodeType === 1) ap(x); }))).observe(document.body, { childList: true, subtree: true }); }, o.zoom); }
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(o.wait || 1700); return p;
}
const sheet = (p) => p.evaluate(() => { const s = document.getElementById('rzSheet'); return !s.hidden && s.classList.contains('open') ? s.getAttribute('data-kind') : null; });
const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number).slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; };
try {
  /* 1. hero: avatar, salom, tahrirlash; maqsad progressi trend vaznidan, 0 dan to'ladi */
  let st = seed(), p = await open(st, { wait: 200 });
  const w0 = await p.evaluate(() => { const i = document.querySelector('.pf-gb i'); return i ? i.getBoundingClientRect().width : -1; }); await p.waitForTimeout(1700);
  const h = await p.evaluate(() => { const e = document.getElementById('pfHero'), i = e.querySelector('.pf-gb i'); return { t: e.innerText, av: !!e.querySelector('.pf-av'), ed: e.querySelector('[data-act=editprof]') ? 1 : 0, w: i.getBoundingClientRect().width, W: i.parentNode.getBoundingClientRect().width, bg: getComputedStyle(e).backgroundImage, now: e.querySelector('.pf-gs span:nth-child(2)').textContent }; });
  const kg = P.summary(st.weights, TODAY, 0, D).kg, share = (91.5 - kg) / (91.5 - 82);
  assert.match(nb(h.t), /Xush kelibsiz 👋 Profilingiz/); assert.ok(h.av && h.ed); assert.match(h.bg, /linear-gradient/); assert.match(nb(h.t), /Maqsad: 82 kg gacha −\d,\d kg ✓/);
  assert.equal(nb(h.now), 'Hozir ' + String(Math.round(kg * 10) / 10).replace('.', ',') + ' kg', 'hozirgi — trend vazni'); assert.ok(Math.abs(h.w / h.W - share) < 0.03, 'progress ' + (h.w / h.W).toFixed(3) + ' ≈ ' + share.toFixed(3)); assert.ok(w0 >= 0 && w0 < h.w * 0.6, 'chiziq 0 dan to\'ladi: ' + w0 + ' → ' + h.w);
  await p.click('#pfHero [data-act=editprof]'); await p.waitForTimeout(500); assert.equal(await sheet(p), 'prof'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  /* 2. plitkalar: jins, yosh, bo'y, vazn; bosilsa — o'sha maydon */
  const tl = await p.evaluate(() => [...document.querySelectorAll('.pf-ti')].map((e) => ({ k: e.dataset.k, t: e.innerText.replace(/\s+/g, ' ').trim(), d: getComputedStyle(e).animationDelay })));
  assert.deepEqual(tl.map((x) => x.k), ['sex', 'age', 'height', 'weight']); assert.deepEqual(tl.map((x) => x.t), ['Erkak jins', '35 yosh', "186 bo'y, sm", String(Math.round(kg * 10) / 10).replace('.', ',') + ' vazn, kg']); assert.deepEqual(tl.map((x) => x.d), ['0s', '0.06s', '0.12s', '0.18s'], 'ketma-ket (60 ms)');
  await p.click('.pf-ti[data-k=height]'); await p.waitForTimeout(900); assert.equal(await sheet(p), 'prof'); assert.ok(await p.evaluate(() => { const e = document.querySelector('#rzSheet #peH'); const r = e.closest('[data-sld], .rz-f') || e, q = r.getBoundingClientRect(); return q.top >= 0 && q.bottom <= innerHeight; }), 'bo\'y maydoni ko\'rinadi'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  /* 3. kunlik me'yor */
  const pl = S.plan(st.profile), nr = nb(await p.locator('.pf-norm').innerText()); assert.match(nr, new RegExp('^' + F(pl.target) + " kkal Kunlik me'yoringiz · ozish −" + F(pl.tdee - pl.target) + '/kun$'));
  await p.click('.pf-norm'); await p.waitForTimeout(500); assert.equal(await sheet(p), 'xkcal', '(i) tushuntirish'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  /* 4. «Ovqatlanish» */
  assert.equal(nb(await p.locator('.pf-grp').innerText()), "Kun tartibi Kechqurun ko'proq Oqsil maqsadi " + S.protein(st.profile, kg).g + " g Yemaydiganlarim Yo'q");
  await p.click('.pf-grp [data-act=yqbel]'); await p.waitForTimeout(500); assert.equal(await sheet(p), 'yemay'); await p.click('#rzSheet [data-act=yntog][data-t=baliq]'); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.waitForTimeout(500); assert.match(nb(await p.locator('.pf-grp').innerText()), /Yemaydiganlarim 1 ta$/);
  await p.click('.pf-grp [data-act=ttopen]'); await p.waitForTimeout(500); assert.equal(await sheet(p), 'tartib'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  /* kontrast (AA): hero matni oq, fon gradientning eng och nuqtasi */
  const cr = (1.05) / (lum('rgb(194,65,12)') + 0.05); assert.ok(cr >= 4.5, 'oq / #C2410C kontrast ' + cr.toFixed(2)); assert.deepEqual(p.errs, []); await p.context().close();
  ok('Hero: gradient, avatar, «Xush kelibsiz 👋», tahrirlash; maqsad «82 kg gacha», trend vazni, progress 0 dan ' + Math.round(share * 100) + '% gacha to\'ladi; kontrast ' + cr.toFixed(1) + ':1');
  ok('Plitkalar (jins/yosh/bo\'y/vazn, 60 ms oraliq, bosilsa — o\'sha maydon); me\'yor «' + nr + '» → (i); «Ovqatlanish»: Kun tartibi · Oqsil maqsadi · Yemaydiganlarim (oyna, qiymat yangilanadi)');
  /* 5. maqsadsiz; reduced-motion */
  p = await open(seed({ profile: { goalWeight: null } }), { rm: true }); assert.equal(await p.locator('.pf-goal').count(), 0); assert.match(nb(await p.locator('.pf-gadd').innerText()), /Maqsad vaznini qo'shing/);
  assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.pf-b1')).animationName), 'none', 'reduced-motion — animatsiya yo\'q');
  await p.click('.pf-gadd'); await p.waitForTimeout(900); assert.equal(await sheet(p), 'prof'); assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.id), 'peG', 'maqsad vazni maydoni'); await p.context().close();
  ok('Maqsad vazni yo\'q — «Maqsad vaznini qo\'shing» (profil oynasida maydonga fokus); prefers-reduced-motion — animatsiya o\'chadi');
  /* 6. 360/390 × 115% × UZ/RU/ЎЗ × yorug'/tungi — sig'adi */
  for (const [w, lang, th] of [[360, 'uz', 'dark'], [360, 'ru', 'light'], [390, 'cyr', 'dark']]) {
    p = await open(seed({ yemay: ['baliq', 'sut'] }), { w, h: 740, lang, th, zoom: 1.15 });
    const r = await p.evaluate(() => { const W = document.documentElement.clientWidth, out = [], q = ['.pf-hero', '.pf-tiles', '.pf-norm', '.pf-grp']; q.forEach((s) => { const c = document.querySelector(s); if (!c) { out.push('yo\'q ' + s); return; } const cr = c.getBoundingClientRect(); [...c.querySelectorAll('*')].filter((e) => [...e.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim())).forEach((e) => { const b = e.getBoundingClientRect(); if (b.width && (b.right > cr.right + 1 || b.left < cr.left - 1 || b.right > W)) out.push(s + ' ' + (e.className || e.tagName)); }); }); return { out: out.slice(0, 4), hs: document.documentElement.scrollWidth > innerWidth + 1 }; });
    assert.ok(!r.out.length && !r.hs, [w, lang, th] + ': ' + JSON.stringify(r)); if (lang === 'ru') assert.match(nb(await p.locator('.pf-grp').innerText()), /Режим питания Вечером больше Цель по белку \d+ g Не ем 2/); assert.deepEqual(p.errs, []); await p.context().close();
  }
  ok('360/390 px × 115% × UZ/RU/ЎЗ × yorug\'/tungi: hero, plitkalar, me\'yor va «Ovqatlanish» sig\'adi, gorizontal siljish yo\'q');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
