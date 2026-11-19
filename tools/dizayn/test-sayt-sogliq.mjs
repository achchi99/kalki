// kalki.uz sog'liq sahifalari: BITTA formula (assets/meyor-core.js — kaloriya kalkulyatori = KalkiFit me'yori), TVI / ideal vazn / suv me'yori kalkulyatorlari,
// 50 ta taom kaloriya sahifasi (/kaloriya/<taom>, RU), indeks, sitemap, deep link /kalkifit?taom=<id>, «Manba» → «Batafsil».   node tools/dizayn/test-sayt-sogliq.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), M = require(path.join(ROOT, 'assets/meyor-core.js')), D = S.dates, T0 = D.today();
const OUT = process.env.SKRINSHOT_DIR || ''; let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
async function open(url, { w = 360, st = null, ls = {} } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((o) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); if (o.st) localStorage.setItem('kalki_fit', o.st); Object.keys(o.ls).forEach((k) => localStorage.setItem(k, o.ls[k])); } } catch (e) {} }, { st: st ? JSON.stringify(st) : null, ls });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e)));
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(BASE + url, { waitUntil: 'load' }); return p;
}
const shot = async (p, nm) => { if (OUT) await p.screenshot({ path: path.join(OUT, nm), fullPage: false }).catch(() => {}); };
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
const digits = (s) => Number(String(s).replace(/[^\d]/g, ''));
try {
  /* 1. BITTA formula: meyor-core = KalkiFit plan (barcha profillar) */
  let cnt = 0; for (const sex of ['m', 'f']) for (const age of [16, 25, 45, 70]) for (const h of [150, 170, 190]) for (const w of [45, 60, 85, 120]) for (const act of [1, 3, 5]) for (const goal of ['lose', 'slow', 'keep', 'gain']) { const p = { sex, age, height: h, weight: w, act, goal }; assert.equal(M.meyor(p).target, S.plan(p).target, JSON.stringify(p)); cnt++; }
  assert.deepEqual(M.GOAL_DELTA, { keep: 0, slow: -275, lose: -550, gain: 275 }); assert.equal(S.water(75).goal, M.water(75).goal);
  log('BITTA formula: meyor-core.meyor() = KalkiFit S.plan() (' + cnt + ' profil); maqsadlar −550/−275/0/+275; suv bir xil');

  /* 2. kaloriya kalkulyatori natijasi = KalkiFit me'yori (aniqroq rejim, 4 maqsad, pastki chegara, 18 yoshgacha) */
  const ACTV = { 1: '1.2', 2: '1.375', 3: '1.55', 4: '1.725', 5: '1.9' };
  for (const c0 of [{ sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'lose' }, { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'slow' }, { sex: 'f', age: 41, height: 168, weight: 64, act: 2, goal: 'keep' }, { sex: 'f', age: 35, height: 160, weight: 70, act: 4, goal: 'gain' }, { sex: 'f', age: 60, height: 150, weight: 50, act: 1, goal: 'lose' }, { sex: 'm', age: 16, height: 170, weight: 60, act: 3, goal: 'lose' }]) {
    const p = await open('/kaloriya-kalkulyator'); if (c0.sex === 'f') await p.click('#gF'); await p.fill('#weight', String(c0.weight)); await p.click('#detailToggle'); await p.fill('#age', String(c0.age)); await p.fill('#height', String(c0.height));
    await p.selectOption('#activity', ACTV[c0.act]).catch(() => {}); await p.click('[data-g=' + c0.goal + ']'); await p.click('#calcBtn'); await p.waitForTimeout(200);
    const site = digits(await txt(p, '#nbNum')), app = S.plan(c0).target; assert.equal(site, app, 'kalkulyator = KalkiFit: ' + JSON.stringify(c0) + ' ' + site + ' vs ' + app);
    if (c0.age === 60) assert.equal(await p.locator('#nbFloor').isVisible(), true, 'pastki chegara izohi'); assert.deepEqual(p.errs, []); await p.context().close();
  }
  { const p = await open('/kaloriya-kalkulyator'); assert.equal(await p.locator('.seg4 [data-g]').count(), 4); assert.deepEqual(await p.locator('.seg4 [data-g]').evaluateAll((e) => e.map((x) => x.getAttribute('data-g'))), ['lose', 'slow', 'keep', 'gain']); assert.doesNotMatch(await p.content(), /−15%|\+12%/); await p.context().close(); }
  log('Kaloriya kalkulyatori = KalkiFit me\'yori (6 holat: tez/sekin ozish, saqlash, vazn olish, ayol pastki chegara 1 200, 16 yosh — faqat saqlash); 4 maqsad; «−15 %/+12 %» qolmadi');

  /* 3. TVI */
  { let p = await open('/tvi-kalkulyator'); assert.equal(await p.locator('#kfBlok').isVisible(), false); await p.fill('#age', '30'); await p.fill('#height', '175'); await p.fill('#weight', '80'); await p.click('#calcBtn'); await p.waitForSelector('#kfBlok:not([hidden])');
    assert.equal(await txt(p, '#mainNum'), '26,1'); assert.equal(await txt(p, '#rCat'), 'Ortiqcha vazn'); assert.equal(await txt(p, '#rRange'), '56,7 – 76,3 kg'); assert.equal(await txt(p, '#rDiff'), '−3,7 kg'); assert.equal(await txt(p, '#kfT'), 'Sizning TVI: 26,1.');
    await p.locator('#receipt').scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await shot(p, 'keyin-v91-1-tvi-light.png');
    await p.route('**/kalkifit*', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: 'ok' })); await Promise.all([p.waitForURL(/\/kalkifit\?utm_source=sayt-tvi#boshlash$/), p.click('#btnKalkiFit')]); const im = JSON.parse(await p.evaluate(() => localStorage.getItem('kalki_fit_import'))); assert.deepEqual([im.from, im.sex, im.age, im.height, im.weight], ['tvi', 'm', 30, 175, 80]); await p.context().close();
    for (const [h, w, cat] of [[170, 53.3, 'Kam vazn'], [170, 53.5, 'Normal'], [170, 72.2, 'Ortiqcha vazn'], [170, 86.7, 'Semizlik, I daraja'], [170, 46, 'Jiddiy kam vazn']]) { p = await open('/tvi-kalkulyator'); await p.fill('#age', '40'); await p.fill('#height', String(h)); await p.fill('#weight', String(w)); await p.click('#calcBtn'); await p.waitForTimeout(150); assert.equal(await txt(p, '#rCat'), cat, h + '/' + w + ' → ' + (await txt(p, '#mainNum'))); await p.context().close(); }
    p = await open('/tvi-kalkulyator'); await p.fill('#age', '15'); await p.fill('#height', '165'); await p.fill('#weight', '50'); await p.click('#calcBtn'); await p.waitForTimeout(250); assert.equal(await p.locator('#kidMsg').isVisible(), true); assert.match(await txt(p, '#kidMsg'), /foizlik \(percentil\)/); assert.equal(await p.locator('#kfBlok').isVisible(), false, '18 yoshgacha KalkiFit bloki yo\'q'); assert.match(await txt(p, '#rCat'), /baholanmaydi/); await p.context().close();
    p = await open('/tvi-kalkulyator'); await p.fill('#age', '30'); await p.fill('#height', '50'); await p.fill('#weight', '80'); await p.click('#calcBtn'); await p.waitForTimeout(200); assert.equal(await p.locator('#heightErr').isVisible(), true); assert.equal(await p.locator('#kfBlok').isVisible(), false); await p.context().close();
    p = await open('/ru/tvi-kalkulyator'); await p.fill('#age', '30'); await p.fill('#height', '175'); await p.fill('#weight', '80'); await p.click('#calcBtn'); await p.waitForSelector('#kfT'); assert.equal(await txt(p, '#rCat'), 'Избыточный вес'); assert.equal(await txt(p, '#kfT'), 'Ваш ИМТ: 26,1.'); assert.match(await txt(p, 'h1'), /Калькулятор ИМТ/); assert.deepEqual(p.errs, []); await p.context().close(); }
  log('TVI: 175 sm / 80 kg → 26,1, «Ortiqcha vazn», oraliq 56,7–76,3, −3,7 kg; chegaralar 18,5/25/30/16; 18 yoshgacha — percentil izohi, blok yo\'q; xato kiritish; RU; KalkiFit\'ga jins/yosh/bo\'y/vazn');

  /* 4. ideal vazn */
  { let p = await open('/ideal-vazn-kalkulyator'); await p.fill('#height', '170'); await p.click('#calcBtn'); await p.waitForSelector('#kfBlok:not([hidden])'); const r = M.idealVazn('m', 170);
    assert.equal(await txt(p, '#mainNum'), String(r.min).replace('.', ',') + ' – ' + String(r.max).replace('.', ',') + ' kg'); assert.equal(await txt(p, '#rTvi'), '53,5 – 72,0 kg'); for (const id of ['rDev', 'rRob', 'rMil', 'rHam']) assert.match(await txt(p, '#' + id), /^\d+,\d kg$/);
    assert.equal(await p.locator('#rNowRow').isVisible(), false); await p.locator('#receipt').scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await shot(p, 'keyin-v91-2-ideal-vazn-light.png'); await p.context().close();
    p = await open('/ideal-vazn-kalkulyator'); await p.click('#gF'); await p.fill('#height', '150'); await p.fill('#weight', '60'); await p.click('#calcBtn'); await p.waitForTimeout(200); assert.equal(await p.locator('#shortMsg').isVisible(), true, '152 sm dan past — izoh'); assert.match(await txt(p, '#rNow'), /kg ortiq/); await p.context().close(); }
  log('Ideal vazn: oraliq (Devine/Robinson/Miller/Hamwi) + TVI 18,5–24,9; 152 sm dan past — izoh; hozirgi vazn bilan farq');

  /* 5. suv me'yori = KalkiFit */
  for (const w of [48, 62.5, 75, 93]) { const p = await open('/suv-meyori-kalkulyator'); await p.fill('#weight', String(w).replace('.', ',')); await p.click('#calcBtn'); await p.waitForSelector('#kfBlok:not([hidden])'); const g = S.water(w).goal; assert.equal(digits(await txt(p, '#mainNum')), g, w + ' kg → ' + g); assert.equal(digits(await txt(p, '#kfT')), g); if (w === 75) await p.locator('#receipt').scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await shot(p, 'keyin-v91-3-suv-light.png'); await p.context().close(); }
  log('Suv me\'yori = KalkiFit S.water().goal (48 / 62,5 / 75 / 93 kg) — butun stakanga yaxlitlangan');

  /* 6. taom sahifalari: 50 × UZ/RU, majburiy bloklar, raqamlar bazadan, sitemap, indeks */
  const DB = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods, FB = Object.fromEntries(DB.map((f) => [f.i, f])), IDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/taom-sahifalar.json'), 'utf8')).ids, SM = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  assert.equal(IDS.length, 50); const { mainUnit } = require(path.join(ROOT, 'tools/taom-sahifa-yasa.js'));
  for (const id of IDS) for (const L of ['uz', 'ru']) {
    const f = FB[id], h = fs.readFileSync(path.join(ROOT, (L === 'ru' ? 'ru/' : '') + 'kaloriya/' + id + '.html'), 'utf8'), u = mainUnit(f), kp = Math.round(f.k * u[1] / 100);
    const h1 = /<h1[^>]*>([^<]*)<\/h1>/.exec(h)[1]; assert.match(h1, L === 'uz' ? /kaloriyasi — 1 .+ ≈ [\d ]+ kkal$/ : /^Калорийность: .+ — 1 .+ ≈ [\d ]+ ккал$/, id + ' ' + L + ' H1'); assert.equal(digits(h1.split('≈')[1]), kp, id + ' H1 soni bazadan');
    for (const bl of ['tkMacro', 'tkPors', 'tkCta', 'tkSrc', 'tkSim', 'tkLight', 'tkFaq']) assert.ok(h.includes('id="' + bl + '"'), id + ' ' + L + ' ' + bl);
    assert.ok((h.split('id="tkSim"')[1].split('</section>')[0].match(/<a href=/g) || []).length >= 3, id + ' o\'xshash ≥ 3'); assert.ok((h.split('id="tkLight"')[1].split('</section>')[0].match(/<li>/g) || []).length >= 2, id + ' maslahat ≥ 2');
    assert.match(h, new RegExp('<a class="tk-go" id="tkGo" href="' + (L === 'ru' ? '/ru' : '') + '/kalkifit\\?taom=' + id + '" data-kf="taom-' + id + '"')); assert.match(h, /"@type":"FAQPage"/); assert.match(h, /"@type":"BreadcrumbList"/);
    assert.match(h, new RegExp('<link rel="canonical" href="https://kalki.uz' + (L === 'ru' ? '/ru' : '') + '/kaloriya/' + id + '">')); assert.match(h, /hreflang="ru"/); assert.doesNotMatch(h, /noindex/); assert.doesNotMatch(h, /utm_source/);
    assert.doesNotMatch(h.replace(/<script[\s\S]*?<\/script>/g, ''), /davolaydi|shifobaxsh|kasallikni|лечит|исцеля|детокс|сжигает жир/i, id + ' tibbiy da\'vo yo\'q'); assert.ok(h.includes(L === 'ru' ? f.ms.r.slice(0, 30) : f.ms.u.slice(0, 30)), id + ' manba matni');
    assert.ok(SM.includes('<loc>https://kalki.uz' + (L === 'ru' ? '/ru' : '') + '/kaloriya/' + id + '</loc>'), id + ' sitemap');
  }
  assert.ok(SM.includes('<loc>https://kalki.uz/kaloriya/</loc>') && SM.includes('<loc>https://kalki.uz/ru/kaloriya/</loc>'));
  log('Taom sahifalari: 50 × UZ/RU — H1 «1 <birlik> ≈ N kkal» bazadan, makro, porsiyalar, manba, o\'xshash ≥ 3, maslahat ≥ 2, FAQ JSON-LD, deep link, canonical/hreflang, noindex/utm/tibbiy da\'vo yo\'q, sitemap');

  /* 7. brauzerda: osh sahifasi, indeks qidiruvi, «KalkiFit'da yozish» → qo'shish oynasi (deep link) */
  { let p = await open('/kaloriya/osh'); assert.match(await txt(p, 'h1'), /^Osh \(palov\) kaloriyasi — 1 tarelka ≈ 665 kkal$/); assert.equal(await p.locator('#tkPors tbody tr').count(), 4); assert.ok(await p.locator('#tkVar tbody tr').count() >= 2); assert.deepEqual(p.errs, []);
    await shot(p, 'keyin-v91-4-taom-osh-light.png'); assert.equal(await p.locator('#tkGo').getAttribute('href'), '/kalkifit?taom=osh'); await p.context().close();
    p = await open('/ru/kaloriya/somsa'); assert.match(await txt(p, 'h1'), /^Калорийность: самса — 1 шт\. ≈ 355 ккал$/); await shot(p, 'keyin-v91-5-taom-somsa-ru-light.png'); await p.context().close();
    p = await open('/kaloriya/qatiq'); await shot(p, 'keyin-v91-6-taom-qatiq-light.png'); await p.context().close();
    p = await open('/kaloriya/'); assert.equal(await p.locator('#tkList li').count(), 50); await p.fill('#tkQ', 'lag'); await p.waitForTimeout(100); const vis = await p.locator('#tkList li:not([hidden])').allInnerTexts(); assert.ok(vis.length >= 1 && vis.every((x) => /lag/i.test(x)), vis.join('|')); await p.context().close();
    const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 864e5; st.prefs = { tipsDone: true, jokes: false, fc: { done: 1 }, baliqOff: true }; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; S.addWeight(st, T0, 80);
    p = await open('/kalkifit?utm_source=sayt-taom-osh&taom=osh', { st }); await p.waitForSelector('#fdName', { timeout: 15000 }); assert.match(await txt(p, '#fdName'), /^Osh/); assert.doesNotMatch(p.url(), /taom=/, 'deep link URL\'dan olib tashlandi');
    await p.click('[data-act=pwsrc]'); await p.waitForSelector('#srcMore a'); assert.equal(await p.locator('#srcMore a').getAttribute('href'), '/kaloriya/osh'); assert.deepEqual(p.errs, []); await p.context().close();
    p = await open('/kalkifit?taom=manti'); await p.waitForTimeout(800); assert.equal(await p.evaluate(() => sessionStorage.getItem('kf_taom')), 'manti', 'yangi foydalanuvchi — onboarding\'dan keyin ochiladi'); await p.context().close(); }
  log('Brauzer: osh sahifasi (H1, porsiyalar, variantlar), RU somsa, indeks qidiruvi; «KalkiFit\'da yozish» → /kalkifit?taom=osh → Osh porsiyasi ochiladi, «Manba» → «Batafsil» /kaloriya/osh; yangi foydalanuvchida onboarding\'dan keyin');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
