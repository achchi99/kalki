// kalki.uz → KalkiFit: sayt trafigini ilovaga yo'naltirish.
//  · kalkulyator natijasidan KEYINGI blok (natijagacha yo'q, 18 yoshgacha yo'q), har kalkulyatorga o'z matni, bosilganda qiymatlar FAQAT localStorage orqali
//    onboardingga (URL'ga shaxsiy ma'lumot yo'q), onboarding: «kalkulyatordan olindi — tekshiring» + bitta tasdiq → Bugun + «Birinchi ovqat»; bir marta ishlatiladi;
//    mavjud foydalanuvchida ustidan yozilmaydi;
//  · joylar: menyu, bosh sahifa, kategoriya kartasi — HTML'da utm YO'Q (SEO), bosilganda ?utm_source=sayt-<joy>; o'lchov: ko'rsatildi/bosildi (anonim, DNT/GPC — yo'q);
//  · server: /api/stat {sb,h} → stat_kun; manba sayt-<joy> → admin voronkasi; sinonimlar.   node tools/dizayn/test-sayt-kalkifit.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs'; import { d1 } from './d1-sqlite.mjs'; import { kut } from './kut.mjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), K = require(path.join(ROOT, 'assets/stat-kun.js')); const D = S.dates, T0 = D.today();
const OUT = process.env.SKRINSHOT_DIR || ''; let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/' || p === '/ru/') p += 'index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
async function open(url, { w = 360, ls = {}, dnt = false, st = null } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: 780 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((o) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_stat_test', '1'); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); if (o.st) localStorage.setItem('kalki_fit', o.st); Object.keys(o.ls).forEach((k) => localStorage.setItem(k, o.ls[k])); } } catch (e) {}
    if (o.dnt) Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' }); }, { ls, dnt, st: st ? JSON.stringify(st) : null });
  const p = await c.newPage(); p.errs = []; p.sb = []; p.on('pageerror', (e) => p.errs.push(String(e)));
  p.on('request', (r) => { if (!/\/api\/stat$/.test(r.url()) || r.method() !== 'POST') return; let j = null; try { j = JSON.parse(r.postData() || 'null'); } catch (e) {} if (j && j.sb) p.sb.push(j.sb + '.' + j.h); });          // sendBeacon ham ko'rinadi
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js|yandex|mc\.ru/, (r) => r.abort());
  await p.route('**/api/stat', (r) => r.fulfill({ status: 204, body: '' }));
  await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(BASE + url, { waitUntil: 'domcontentloaded' }); await p.waitForLoadState('load'); return p;
}
const shot = async (p, nm, sel) => { if (!OUT) return; try { if (sel) await p.locator(sel).first().screenshot({ path: path.join(OUT, nm) }); else await p.screenshot({ path: path.join(OUT, nm) }); } catch (e) {} };
const imp = (p) => p.evaluate(() => localStorage.getItem('kalki_fit_import'));
try {
  /* 0. SEO: HTML manbasida utm yo'q (ichki havolalar toza), menyu va joylar belgilangan */
  for (const f of ['index.html', 'ru/index.html', 'kaloriya-kalkulyator.html', 'ru/kaloriya-kalkulyator.html', 'alkogol-kalkulyator.html', 'blog.html']) { const h = fs.readFileSync(path.join(ROOT, f), 'utf8'); assert.doesNotMatch(h, /utm_source=sayt/, f + ': HTML\'da utm yo\'q'); assert.match(h, /<a href="kalkifit" data-kf="menyu"[^>]*>KalkiFit<\/a>/, f + ': menyuda KalkiFit'); }
  assert.match(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), /data-kf="bosh"/); assert.match(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), /data-kf-k="bosh"/);
  assert.equal(K.manbaOf('?utm_source=sayt-kaloriya', '', 'kalki.uz'), 'sayt-kaloriya'); assert.equal(K.manbaOf('?utm_source=sayt-menyu', '', 'kalki.uz'), 'sayt-menyu'); assert.equal(K.manbaOf('?utm_source=sayt-xyz', '', 'kalki.uz'), 'boshqa'); assert.equal(K.manbaOf('', 'https://kalki.uz/kredit', 'kalki.uz'), 'sayt');
  log("SEO: HTML'da utm yo'q (UZ/RU), menyuda «KalkiFit», bosh sahifa kartasi belgilangan; manba kodi sayt-<joy> (noma'lum — «boshqa»)");

  /* 1. kaloriya: natijagacha blok yo'q → hisob → blok (o'z matni, son), CLS yo'q (foydalanuvchi bosgandan keyin) */
  let p = await open('/kaloriya-kalkulyator');
  assert.equal(await p.locator('#kfBlok').isVisible(), false, 'natijagacha blok ko\'rinmaydi'); assert.deepEqual(p.sb, []);
  await p.fill('#weight', '75'); await p.click('#calcBtn'); await p.waitForSelector('#kfBlok:not([hidden]) #btnKalkiFit');
  const nb = (await p.locator('#nbNum').innerText()).replace(/\D/g, ''), kt = (await p.locator('#kfT').innerText()).replace(/\s+/g, ' ');
  assert.equal(kt, "Kunlik me'yoringiz: " + Number(nb).toLocaleString('ru-RU').replace(/\s/g, ' ') + ' kkal.', kt); assert.match(await p.locator('#kfBlok').innerText(), /ovqatni rasm yoki ovoz bilan yozing/); assert.match(await p.locator('#btnKalkiFit').innerText(), /KalkiFit'da davom etish/);
  const im = await p.locator('#kfBlok .kf-sh').evaluate((e) => [e.getAttribute('width'), e.getAttribute('height'), e.getAttribute('src')]); assert.deepEqual(im, ['64', '128', '/assets/kalkifit-mini.webp'], 'skrinshot o\'lchami oldindan (CLS yo\'q)');
  const bx = await p.locator('#kfBlok').boundingBox(); assert.ok(bx.width <= 360 && bx.height < 330, 'mobil 360 px da ixcham: ' + JSON.stringify(bx));
  await kut(() => p.sb.length, (x) => x >= 1); assert.deepEqual(p.sb, ['kaloriya.k'], 'ko\'rsatildi — bir marta');
  await p.click('#calcBtn'); await p.waitForTimeout(300); assert.deepEqual(p.sb, ['kaloriya.k'], 'qayta hisob — qayta sanalmaydi');
  await shot(p, 'keyin-v90-1-kaloriya-light.png', '#normBanner');
  await Promise.all([p.waitForURL(/\/kalkifit\?utm_source=sayt-kaloriya#boshlash$/), p.click('#btnKalkiFit')]);
  assert.doesNotMatch(p.url(), /75|weight|vazn|sex|age/i, 'URL\'da shaxsiy ma\'lumot yo\'q: ' + p.url()); assert.ok(p.sb.includes('kaloriya.b'), 'bosildi: ' + p.sb);
  await p.waitForSelector('#rzOnb:not([hidden])'); await p.waitForSelector('#obImp');
  assert.match(await p.locator('#obImp').innerText(), /Kalkulyatordagi ma'lumotlaringiz olindi — qolganini to'ldiring/, 'yosh/bo\'y taxminiy edi — qolgani so\'raladi');
  assert.equal(await imp(p), null, 'import o\'qilgan zahoti o\'chdi (bir marta)'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Kaloriya: natijagacha blok yo\'q; hisobdan keyin «Kunlik me\'yoringiz: N kkal» + «KalkiFit\'da davom etish» + skrinshot (64×128, ixcham); ko\'rsatildi 1 marta; URL\'da faqat utm; qolgani so\'raladi');

  /* 2. to'liq ma'lumot (aniqroq rejim) → onboarding natija ekrani: «kalkulyatordan olindi — tekshiring» + bitta tasdiq → Bugun + «Birinchi ovqat» */
  p = await open('/kaloriya-kalkulyator'); await p.click('#gF'); await p.fill('#weight', '64'); await p.click('#detailToggle'); await p.fill('#age', '41'); await p.fill('#height', '168'); await p.click('[data-g=lose]'); await p.click('#calcBtn'); await p.waitForSelector('#btnKalkiFit');
  await Promise.all([p.waitForURL(/\/kalkifit\?utm_source=sayt-kaloriya#boshlash$/), p.click('#btnKalkiFit')]); await p.waitForSelector('#obImp'); await p.waitForSelector('#obTarget');
  const ib = (await p.locator('#obImp').innerText()).replace(/\s+/g, ' '); assert.match(ib, /Ma'lumotlaringiz kalkulyatordan olindi — tekshiring/); assert.match(ib, /Ayol · 41 yosh · 168 sm · 64 kg/); assert.match(ib, /O'zgartirish/);
  await p.waitForFunction(() => { const e = document.querySelector('#kfSplash'); return !e || e.hidden || getComputedStyle(e).display === 'none' || getComputedStyle(e).opacity === '0'; }, null, { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(900);
  await shot(p, 'keyin-v90-5-onboarding-light.png');
  await p.click('[data-act=obstart]'); await p.waitForSelector('#rzOnb', { state: 'hidden' }); await p.waitForSelector('#fcCard');
  const st1 = await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit'))); assert.deepEqual([st1.profile.sex, st1.profile.age, st1.profile.height, st1.profile.weight, st1.profile.goal], ['f', 41, 168, 64, 'lose']); assert.equal(await imp(p), null);
  const man = await p.evaluate(() => localStorage.getItem('kalki_manba')); assert.equal(man, 'sayt-kaloriya', 'manba qurilmada: ' + man);
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600); assert.equal(await p.locator('#rzOnb').isVisible(), false); assert.deepEqual(p.errs, []); await p.context().close();
  log('To\'liq ma\'lumot: onboarding darhol natijada — «kalkulyatordan olindi — tekshiring» (Ayol · 41 yosh · 168 sm · 64 kg …) + bitta «Boshlash» → Bugun + «Birinchi ovqat» kartasi; manba sayt-kaloriya');

  /* 3. «O'zgartirish» — boshidan, qiymatlar saqlangan */
  p = await open('/kalkifit#boshlash', { ls: { kalki_fit_import: JSON.stringify({ from: 'kaloriya', sex: 'm', age: 35, height: 180, weight: 90, act: 2, goal: 'keep', ts: Date.now() }) } }); await p.waitForSelector('#obImp');
  await p.click('[data-act=obimpedit]'); await p.waitForSelector('[data-act=obsex][data-v=m].on'); assert.equal(await p.locator('#obImp').count(), 0, 'tahrirda to\'liq banner yo\'q'); await p.context().close();
  /* eski (2 kundan ortiq) import — e'tiborsiz */
  p = await open('/kalkifit#boshlash', { ls: { kalki_fit_import: JSON.stringify({ from: 'kaloriya', sex: 'm', age: 35, height: 180, weight: 90, act: 2, goal: 'keep', ts: Date.now() - 3 * 864e5 }) } }); await p.waitForSelector('#rzOnb:not([hidden])'); await p.waitForTimeout(400); assert.equal(await p.locator('#obImp').count(), 0); assert.equal(await imp(p), null); await p.context().close();
  log('«O\'zgartirish» — 1-ekrandan, qiymatlar saqlangan; 2 kundan eski import e\'tiborsiz (va o\'chadi)');

  /* 4. MAVJUD foydalanuvchi — ustidan yozilmaydi, import o'chadi */
  const ex = S.emptyState(); ex.setup = true; ex.created = Date.now() - 20 * 864e5; ex.prefs = { tipsDone: true, jokes: false, fc: { done: 1 } }; ex.profile = { sex: 'm', age: 52, height: 171, weight: 88, act: 1, goal: 'slow' }; S.addWeight(ex, T0, 88);
  p = await open('/kalkifit?utm_source=sayt-kaloriya#boshlash', { st: ex, ls: { kalki_fit_import: JSON.stringify({ from: 'kaloriya', sex: 'f', age: 25, height: 160, weight: 55, act: 4, goal: 'gain', ts: Date.now() }) } }); await p.waitForTimeout(1200);
  assert.equal(await p.locator('#rzOnb').isVisible(), false); const st2 = await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit'))); assert.deepEqual(['sex', 'age', 'height', 'weight', 'act', 'goal'].map((k) => st2.profile[k]), ['m', 52, 171, 88, 1, 'slow'], 'profil o\'zgarmadi'); assert.equal(await imp(p), null, 'import o\'chirildi'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Mavjud foydalanuvchi: kalkulyator qiymatlari ustidan yozilmaydi (profil aynan o\'sha), import o\'chiriladi');

  /* 5. 18 yoshgacha — blok yo'q */
  p = await open('/kaloriya-kalkulyator'); await p.fill('#weight', '55'); await p.click('#detailToggle'); await p.fill('#age', '15'); await p.fill('#height', '165'); await p.click('#calcBtn'); await p.waitForTimeout(400); assert.equal(await p.locator('#kfBlok').isVisible(), false, '18 yoshgacha KalkiFit taklifi yo\'q'); await p.context().close();
  /* RU */
  p = await open('/ru/kaloriya-kalkulyator'); await p.fill('#weight', '80'); await p.click('#calcBtn'); await p.waitForSelector('#btnKalkiFit'); assert.match(await p.locator('#kfT').innerText(), /^Ваша дневная норма: [\d\s ]+ ккал\.$/); assert.match(await p.locator('#btnKalkiFit').innerText(), /Продолжить в KalkiFit/);
  await shot(p, 'keyin-v90-2-kaloriya-ru-light.png', '#normBanner');
  await Promise.all([p.waitForURL(/\/ru\/kalkifit\?utm_source=sayt-kaloriya#boshlash$/), p.click('#btnKalkiFit')]); await p.context().close();
  log('18 yoshgacha — blok yo\'q; RU matn va /ru/kalkifit');

  /* 6. alkogol: sahifa ochilgandagi namunaviy natijada blok yo'q; «Hisoblash»dan keyin — ichimlik kaloriyasi; faqat jins va vazn uzatiladi */
  p = await open('/alkogol-kalkulyator'); await p.waitForTimeout(400); assert.equal(await p.locator('#kfBlok').isVisible(), false, 'namunaviy natijada blok yo\'q');
  await p.fill('#weight', '70'); await p.click('#calcBtn'); await p.waitForSelector('#kfBlok:not([hidden]) #btnKalkiFit'); assert.match(await p.locator('#kfT').innerText(), /^Bu ichimliklarda ≈ \d[\d\s ]* kkal bor\.$/);
  await shot(p, 'keyin-v90-3-alkogol-light.png', '#kfBlok');
  await p.evaluate(() => { window.__nav = []; }); await p.route('**/kalkifit*', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>ok</body></html>' }));
  await Promise.all([p.waitForURL(/\/kalkifit\?utm_source=sayt-alkogol#boshlash$/), p.click('#btnKalkiFit')]); const ia = JSON.parse(await imp(p)); assert.deepEqual([ia.from, ia.sex, ia.weight, ia.age, ia.height], ['alkogol', 'm', 70, undefined, undefined]); assert.ok(p.sb.includes('alkogol.k') && p.sb.includes('alkogol.b'), p.sb); await p.context().close();
  log('Alkogol: namunaviy natijada blok yo\'q, «Hisoblash»dan keyin «Bu ichimliklarda ≈ N kkal bor» — faqat jins va vazn uzatiladi; ko\'rsatildi/bosildi');

  /* 7. menyu, bosh sahifa kartasi, kategoriya kartasi — utm faqat bosilganda; ko'rsatildi (ko'rinsa) */
  p = await open('/kredit-kalkulyator', { w: 1200 }); await p.route('**/kalkifit*', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>ok</body></html>' }));
  assert.equal(await p.locator('#topmenu a[data-kf=menyu]').getAttribute('href'), 'kalkifit', 'menyu havolasi toza');
  await Promise.all([p.waitForURL(/\/kalkifit\?utm_source=sayt-menyu$/), p.click('#topmenu a[data-kf=menyu]')]); assert.deepEqual(p.sb, ['menyu.b'], 'menyu: faqat bosildi (ko\'rsatildi sanalmaydi)'); await p.context().close();
  p = await open('/'); await p.route('**/kalkifit*', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>ok</body></html>' }));
  await p.locator('#appKalkifit').scrollIntoViewIfNeeded(); await kut(() => p.sb.slice(), (x) => x.includes('bosh.k')); assert.ok(p.sb.includes('bosh.k'), 'bosh sahifa kartasi ko\'rsatildi: ' + p.sb);
  await shot(p, 'keyin-v90-4-bosh-light.png', '#yangi-ilovalar');
  await Promise.all([p.waitForURL(/\/kalkifit\?utm_source=sayt-bosh$/), p.click('#appKalkifit [data-kf=bosh]')]); assert.ok(p.sb.includes('bosh.b')); await p.context().close();
  p = await open('/'); await p.route('**/kalkifit*', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>ok</body></html>' }));
  await p.evaluate(() => { const d = document.getElementById('allcalc'); if (d) d.open = true; }); const kc = p.locator('a.k-card[data-kf=kategoriya]'); assert.equal(await kc.count(), 1, 'kategoriya kartasi'); assert.equal(await kc.getAttribute('href'), 'kalkifit');
  await kc.scrollIntoViewIfNeeded(); await kut(() => p.sb.slice(), (x) => x.includes('kategoriya.k'));
  await Promise.all([p.waitForURL(/\/kalkifit\?utm_source=sayt-kategoriya$/), kc.click()]); assert.ok(p.sb.includes('kategoriya.k') && p.sb.includes('kategoriya.b'), p.sb); await p.context().close();
  log('Menyu (bosildi), bosh sahifa kartasi va «Kundalik hayot» kartasi (ko\'rsatildi → bosildi): HTML\'da toza href, bosilganda ?utm_source=sayt-<joy>');

  /* 8. DNT — hech narsa yuborilmaydi, utm esa qoladi (manba uchun) */
  p = await open('/kaloriya-kalkulyator', { dnt: true }); await p.evaluate(() => localStorage.removeItem('kalki_stat_test')); await p.fill('#weight', '75'); await p.click('#calcBtn'); await p.waitForSelector('#btnKalkiFit'); await p.waitForTimeout(400);
  await p.route('**/kalkifit*', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>ok</body></html>' })); await Promise.all([p.waitForURL(/utm_source=sayt-kaloriya/), p.click('#btnKalkiFit')]); assert.deepEqual(p.sb, [], 'DNT: sanagich yo\'q'); await p.context().close();
  log('DNT/GPC: ko\'rsatildi/bosildi yuborilmaydi');

  /* 9. server: {sb,h} → stat_kun (id yo'q); voronka sayt-<joy> */
  const SQL = ['stat.sql', 'admin-stat.sql', 'manba.sql', 'aktivatsiya.sql'].map((f) => fs.readFileSync(path.join(ROOT, 'migrations', f), 'utf8')), db = d1(SQL);
  const API = await import(pathToFileURL(path.join(ROOT, 'functions/api/stat.js')).href), env = { KALKIFIT_DB: db, STAT_ALLOW_LOCAL: '1', IP_HASH_SALT: 'sir-tuz', STAT_PRUNE_P: '0' };
  const post = (bo, h = {}) => API.qabul(new Request('https://kalki.uz/api/stat', { method: 'POST', headers: Object.assign({ Origin: 'https://kalki.uz', 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile' }, h), body: JSON.stringify(bo) }), env, Date.now());
  for (const x of [['kaloriya', 'k'], ['kaloriya', 'k'], ['kaloriya', 'b'], ['menyu', 'b'], ['yomon', 'k'], ['kaloriya', 'x']]) await post({ sb: x[0], h: x[1] });
  await post({ sb: 'bosh', h: 'k' }, { DNT: '1' });
  const rows = await db.prepare("SELECT kalit, platforma, son FROM stat_kun WHERE hodisa = 'sayt_blok' ORDER BY kalit").all(); assert.deepEqual(rows.results.map((r) => [r.kalit, r.platforma, r.son]), [['kaloriya.bosildi', 'sayt', 1], ['kaloriya.korsatildi', 'sayt', 2], ['menyu.bosildi', 'sayt', 1]]);
  const k1 = Math.random().toString(16).slice(2) + '-0000-4000-8000-000000000000'; const q = (i) => ('aaaaaaaa-bbbb-4ccc-8ddd-' + String(i).padStart(12, '0'));
  await post({ q: q(1), p: 'veb', t: 'uz', h: [['ilk_ochilish', '', 1], ['yangi_foydalanuvchi', 'sayt-kaloriya', 1], ['onboarding_tugadi', '', 1], ['ovqat_qoshildi', 'qidiruv', 1], ['birinchi_ovqat', 'qidiruv.d5', 1]] });
  await post({ q: q(2), p: 'veb', t: 'uz', h: [['ilk_ochilish', '', 1], ['yangi_foydalanuvchi', 'sayt-kaloriya', 1], ['onboarding_tugadi', '', 1]] });
  await post({ q: q(3), p: 'veb', t: 'uz', h: [['yangi_foydalanuvchi', 'sayt-zz', 1]] });
  const t = D.today(), sb = await API.saytBloklar(db, D.addDays(t, -2), D.addDays(t, 1)), kal = sb.find((x) => x.joy === 'kaloriya');
  assert.deepEqual([kal.korsatildi, kal.bosildi, kal.yangi, kal.ob, kal.ovqat], [2, 1, 2, 2, 1], JSON.stringify(kal)); assert.equal(sb.length, 6); void k1;
  const adm = fs.readFileSync(path.join(ROOT, 'admin/kalkifit-statistika.html'), 'utf8'); assert.match(adm, /function saytHtml\(r\)/); assert.match(adm, /manHtml\(r\)\+saytHtml\(r\)/);
  log('Server: {sb,h} → stat_kun (joy whitelist, DNT — yozilmaydi); voronka: kaloriya — ko\'rsatildi 2 → bosildi 1 → onboarding 2 → birinchi ovqat 1; admin «kalki.uz → KalkiFit» jadvali');

  /* 10. sinonimlar */
  const DB = S.normFoods(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods); S.buildIndex(DB); const top = (s) => S.search(DB, s, { limit: 3 }).map((f) => f.id);
  const same = (s, canon) => { const a = top(s)[0], c0 = top(canon)[0]; assert.ok(a && a === c0, s + ' → ' + top(s) + ' (kutilgan: «' + canon + '» natijasi ' + c0 + ')'); };          // oila taomlari (omlet — «tuxum» oilasi varianti) — kanonik so'rov natijasi bilan bir xil
  for (const [s, canon] of [['amlit', 'omlet'], ['amlet', 'omlet'], ['tuxumli amlit', 'omlet'], ["tuxum sarig'isiz", 'tuxum oqi'], ['қайнатилган жўхори', "makkajo'xori qaynatilgan"], ["qaynatilgan jo'xori", "makkajo'xori qaynatilgan"], ["shakarli yeryong'oqcha", "shakarli yeryong'oq"]]) same(s, canon);
  assert.equal(top('tuxum oqi')[0], 'tuxum-oqi'); assert.equal(top("makkajo'xori qaynatilgan")[0], 'makkajoxori'); assert.equal(top("shakarli yeryong'oq")[0], 'yeryongoq-shakarli');
  log("Sinonimlar: amlit/amlet/tuxumli amlit → omlet; tuxum sarig'isiz → tuxum oqi; қайнатилган жўхори → makkajo'xori (qaynatilgan); shakarli yeryong'oqcha → shakarli yeryong'oq");
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
