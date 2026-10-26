// KalkiFit v48 — «Mening tartibim» (kunlik limitni ovqat vaqtlariga bo'lish) + «Oqsil maqsadi» (maket ~/tartib-maket.html; hisob: tools/test-tartib-core.js).
// Onboarding 9-ekran (o'tkazib yuborilsa — 3 mahal), mavjud foydalanuvchiga bir martalik karta, Profil va Imkoniyatlar; Bugun: ovqat budjetlari («280 / 330 kkal», «hozir», qoldiq izohi),
// nonushtasiz tartib, erkin; oqsil kartasi (BJU birlashdi); «Nima yesam ekan?» hozirgi ovqat budjeti bilan; Profil'da oqsilni qo'lda o'zgartirish; «Haftangiz»da oqsil kunlari; 360 px × 115% × RU/ЎЗ × tungi.
//   node tools/dizayn/test-tartib.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
import { onb } from './ob-yordam.mjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), P = require(path.join(ROOT, 'assets/kalkifit-plato.js')), D = S.dates;
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const nb = (x) => String(x).replace(/[\u00a0\u202f\u2009]/g, ' ').replace(/\s+/g, ' ').trim(), F = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const T0 = '2026-10-28';          // chorshanba (yakshanba/dushanba «Haftangiz» eslatmasi aralashmasin)
function seed(o = {}) {
  const st = S.emptyState(); st.setup = true; st.created = Date.now() - 20 * 864e5; st.trackStart = D.addDays(T0, -20);
  st.prefs = Object.assign({ tipsDone: true, lpTip: 1, suvFrom: T0, jokes: false, hwSeen: D.addDays(T0, -3), yemayK: 1, ttAsked: 1, h_backup: Date.now(), used: { ovoz: 1, rasm: 1, menyu: 1, yeymiz: 1, hafta: 1, kunkarta: 1, google: 1 } }, o.prefs || {});
  st.profile = Object.assign({ sex: 'm', age: 32, height: 178, weight: 86, act: 2, goal: 'lose' }, o.profile || {}); if (o.tartib) st.profile.tartib = o.tartib;
  S.addWeight(st, D.addDays(T0, -10), 86.4); S.addWeight(st, T0, 85.6);
  const A = (d, meal, kcal, p) => S.addFood(st, d, { meal, fid: null, name: { b: 'Tuxum', l: 'Osh', d: 'Shorva', s: 'Olma' }[meal], kcal, p, f: Math.round(kcal / 25), c: Math.round(kcal / 8), g: 200, est: false, ts: 1 });
  for (const [meal, k, p] of o.food || [['b', 280, 18], ['l', 610, 22]]) A(T0, meal, k, p);
  for (let i = 1; i <= 6; i++) { const d = D.addDays(T0, -i); A(d, 'b', 400, 30); A(d, 'l', 700, i <= 4 ? 60 : 20); A(d, 'd', 600, 40); }          // o'tgan hafta: 4 kun oqsil ≥ maqsad
  return st;
}
async function open(st, o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: o.th || 'light', timezoneId: 'Asia/Tashkent' });
  await c.addInitScript((x) => { if (x.st && !localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_stat_test', '1'); if (x.lang) localStorage.setItem('kalki_lang', x.lang); }, { st, lang: o.lang });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.clock.setFixedTime(new Date(T0 + 'T' + (o.at || '19:05') + ':00+05:00'));
  await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(BASE + (o.lang === 'ru' ? '/ru/kalkifit' : o.lang === 'cyr' ? '/kalkifit?lang=cyr' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  if (o.zoom) { await p.evaluate((k) => { const ap = (root) => { const els = [root, ...root.querySelectorAll('*')].filter((e) => !e.__z), sz = els.map((e) => parseFloat(getComputedStyle(e).fontSize)); els.forEach((e, i) => { e.__z = 1; e.style.setProperty('font-size', (sz[i] * k) + 'px', 'important'); }); }; ap(document.body); new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((x) => { if (x.nodeType === 1) ap(x); }))).observe(document.body, { childList: true, subtree: true }); }, o.zoom); await p.waitForTimeout(200); }
  return p;
}
const stOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')));
const sheet = (p) => p.evaluate(() => { const s = document.getElementById('rzSheet'); return !s.hidden && s.classList.contains('open') ? s.getAttribute('data-kind') : null; });
const expBud = (st, at) => { const pl = S.plan(st.profile), x = st.days[T0], ea = {}; S.MEALS.forEach((m) => { ea[m] = S.sumEntries(x.food.filter((e) => e.meal === m)).kcal; }); const [h, mi] = at.split(':').map(Number); return S.mealBudgets({ limit: pl.target, mode: S.tartibOf(st.profile), eaten: ea, min: h * 60 + mi }); };
const meal = (p, m) => p.evaluate((m) => { const s = document.querySelector('.sl-meal[data-m=' + m + ']'); if (!s) return null; return { now: s.classList.contains('now'), tag: (s.querySelector('.ml-now') || {}).textContent || '', sub: (s.querySelector('.ml-sub') || s.querySelector('.ml-empty .m > span') || {}).textContent || '', empty: s.classList.contains('empty') }; }, m);
try {
  /* ---- 1. onboarding: 9-ekran ixtiyoriy; o'tkazib yuborilsa — 3 mahal ---- */
  let p = await open(null); await onb(p, { sex: 'm', age: 30, h: 175, w: 80, act: 3, goal: 'lose', yemay: [] }); await p.click('[data-act=obstart]'); await p.waitForTimeout(600);
  assert.equal(nb(await p.locator('#rzOnb .rz-q').innerText()), 'Qanday ovqatlanasiz?'); assert.match(nb(await p.locator('#rzOnb').innerText()), /Qoida yo'q — o'zingizga qulayini tanlang\. Kunlik limit o'zgarmaydi, faqat ovqatlarga bo'linadi\./);
  let o = await p.evaluate(() => [...document.querySelectorAll('#rzOnb .tt-opt')].map((e) => e.dataset.k + (e.getAttribute('aria-checked') === 'true' ? '*' : '') + ':' + e.querySelectorAll('.tt-dist i').length));
  assert.deepEqual(o, ['std*:4', 'kech:4', 'nobf:3', 'erkin:0'], 'variantlar, standart 3 mahal, taqsimot chizig\'i');
  await p.click('[data-act=obtskip]'); await p.waitForTimeout(700); let s1 = await stOf(p); assert.equal(s1.profile.tartib, 'std', 'o\'tkazib yuborildi — 3 mahal'); assert.equal(s1.prefs.ttAsked, 1); assert.equal(await p.locator('#ttCard').count(), 0);
  assert.ok(/tartib_tanlandi/.test(await p.evaluate(() => localStorage.getItem('kalki_stat_q') || '')), 'stat: tartib tanlandi'); await p.context().close();
  p = await open(null); await onb(p, { sex: 'f', age: 28, h: 165, w: 72, act: 2, goal: 'slow', yemay: [] }); await p.click('[data-act=obstart]'); await p.waitForTimeout(500); await p.click('#rzOnb [data-act=obtpick][data-k=kech]'); await p.waitForTimeout(200);
  assert.equal(await p.locator('#rzOnb .tt-opt[data-k=kech]').getAttribute('aria-checked'), 'true'); await p.click('[data-act=obtsave]'); await p.waitForTimeout(700); assert.equal((await stOf(p)).profile.tartib, 'kech'); await p.context().close();
  ok('Onboarding: natijadan keyin «Qanday ovqatlanasiz?» (4 variant, rangli taqsimot, standart 3 mahal); «O\'tkazib yuborish» → 3 mahal, tanlansa — saqlanadi');
  /* ---- 2. mavjud foydalanuvchi: Bugun'da BIR MARTA karta; Profil; Imkoniyatlar ---- */
  p = await open(seed({ prefs: { ttAsked: 0 } })); assert.equal(await p.locator('#ttCard').count(), 1, 'mavjud foydalanuvchiga karta: ' + await p.evaluate(() => { const b = document.querySelector('.sl-big'); let e = b && b.nextElementSibling; return e ? e.className + ' ' + (e.id || '') + ' ' + e.textContent.slice(0, 60) : '-'; })); assert.match(nb(await p.locator('#ttCard').innerText()), /Qanday ovqatlanasiz\? Limitni ovqatlaringizga moslaymiz/);
  await p.click('#ttCard [data-act=ttno]'); await p.waitForTimeout(300); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(800); assert.equal(await p.locator('#ttCard').count(), 0, 'yopsa qaytmaydi'); await p.context().close();
  p = await open(seed({ prefs: { ttAsked: 0 } })); await p.click('#ttCard [data-act=ttopen]'); await p.waitForTimeout(600); assert.equal(await sheet(p), 'tartib'); await p.click('#rzSheet [data-act=ttpick][data-k=nobf]'); await p.click('#rzSheet [data-act=ttsave]'); await p.waitForTimeout(600);
  s1 = await stOf(p); assert.equal(s1.profile.tartib, 'nobf'); assert.equal(await p.locator('#ttCard').count(), 0);
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(600); assert.match(nb(await p.locator('.tt-prof').innerText()), /Mening tartibim Nonushta qilmayman Oqsil maqsadi \d+ g · avtomatik/);
  const fr = await p.evaluate(() => { const e = document.querySelector('.sl-feats [data-fk=tartib]'); return e ? e.textContent : ''; }); assert.match(nb(fr), /Mening tartibim/, 'Imkoniyatlar ro\'yxatida');
  await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(400); await p.click('[data-act=ftopen]'); await p.waitForTimeout(500); assert.equal(await p.evaluate(() => { const e = document.querySelector('#ftDr [data-fk=tartib]'); return e && e.closest('.ft-grp').previousElementSibling.textContent; }), 'Mening', 'chap panel: «Mening» guruhida'); await p.keyboard.press('Escape'); await p.context().close();
  ok('Mavjud foydalanuvchi: Bugun\'da bir martalik «Qanday ovqatlanasiz?» (yopsa qaytmaydi) → oyna → saqlanadi; Profil → «Mening tartibim» / «Oqsil maqsadi»; Imkoniyatlar → «Mening»');
  /* ---- 3. Bugun: ovqat budjetlari va qoldiq o'tkazish (kechqurun ko'p, 19:05) ---- */
  let st = seed({ tartib: 'kech', food: [['b', 200, 18], ['l', 500, 22]] }); p = await open(st); let eb = expBud(st, '19:05'); assert.ok(eb.note && eb.note.k >= 50, 'sinov holati: tejalgan ≥ 50');
  let mB = await meal(p, 'b'), mL = await meal(p, 'l'), mD = await meal(p, 'd'), mS = await meal(p, 's');
  assert.equal(nb(mB.sub), '200 / ' + eb.meals.b.budget + ' kkal'); const UZA = { b: 'nonushta', l: 'tushlik', d: 'kechki ovqat', s: 'tamaddi' }; assert.equal(nb(mL.sub), eb.meals.l.over ? '+' + eb.meals.l.over + ' kkal ' + UZA[eb.took.l.to] + 'dan olindi' : '500 / ' + eb.meals.l.budget + ' kkal', 'oshgan — yumshoq «… dan olindi»');
  assert.ok(mD.now && nb(mD.tag) === 'hozir', 'kechki — hozir'); assert.equal(nb(mD.sub), 'Sizga ' + F(eb.meals.d.left) + ' kkal qoldirilgan'); assert.equal(nb(mS.sub), '0 / ' + eb.meals.s.budget + ' kkal');
  assert.equal(nb(await p.locator('#mbNote').innerText()), 'Nonushta va tushlikdan tejalgan ' + eb.note.k + ' kkal kechki ovqatga o\'tdi');
  assert.equal(await p.locator('.sl-meal .ml-sub.over, .sl-meal [style*="danger"]').count(), 0, 'qizil/ayblovchi rang yo\'q');
  ok('Budjetlar (kechqurun ko\'p, 19:05): «200 / ' + eb.meals.b.budget + ' kkal», tushlik «' + nb(mL.sub) + '», kechki «hozir · Sizga ' + eb.meals.d.left + ' kkal qoldirilgan», tamaddi «0 / ' + eb.meals.s.budget + '», izoh «… tejalgan ' + eb.note.k + ' kkal kechki ovqatga o\'tdi»');
  /* oqsil kartasi (BJU birlashdi) */
  const pg = S.protein(st.profile, P.summary(st.weights, T0, 0, D).kg).g;
  const pc = await p.evaluate(() => { const c = document.getElementById('bjuCard'); return { v: c.querySelector('.pr-v').textContent, tip: c.querySelector('.pr-tip').textContent, mini: [...c.querySelectorAll('.pr-mini .mc')].map((x) => x.innerText), old: document.querySelectorAll('.sl-bju').length }; });
  assert.equal(nb(pc.v), '40 / ' + pg + ' g'); assert.equal(pc.old, 0, 'eski BJU qatori yo\'q (takror emas)'); assert.match(nb(pc.tip), /^Kechki ovqatga ~\d+ g qoldi — masalan, \d+ g [a-zʻ' ]+\.$/i, 'maslahat: ' + pc.tip);
  assert.match(nb(pc.mini[0]), /^\d+ g yog' · (20%\+ ✓|20% dan kam)/); assert.match(nb(pc.mini[1]), /^\d+ g uglevod · erkin$/);
  /* (d) «Nima yesam ekan?» — hozirgi ovqat budjeti */
  await p.click('[data-act=ftopen]'); await p.waitForTimeout(400); await p.click('#ftDr [data-act=feat][data-fk=yesam], #ftDr [data-act=feat][data-fk=yeymiz]'); await p.waitForSelector('#nySt', { timeout: 8000 }); await p.waitForTimeout(400);
  const ny = nb(await p.locator('#nySt b').innerText()); assert.match(ny, new RegExp('^Kechki ovqatga ' + F(eb.meals.d.left) + ' kkal va \\d+ g oqsil qoldi$'), 'holat qatori: ' + ny);
  const rem = await p.evaluate(() => window.__kalkifit && window.__kalkifit.remFull ? window.__kalkifit.remFull() : null); if (rem) assert.equal(rem.k, eb.meals.d.left);
  assert.deepEqual(p.errs, []); await p.context().close();
  ok('Oqsil kartasi: «40 / ' + pg + ' g», «' + nb(pc.tip) + '», yog\' / uglevod plitkalari; eski BJU qatori yo\'q; «Nima yesam ekan?»: «' + ny + '»');
  /* ---- 4. nonushtasiz va erkin ---- */
  st = seed({ tartib: 'nobf', food: [['l', 610, 22]] }); p = await open(st, { at: '13:10' }); assert.equal(await meal(p, 'b'), null, 'nonushtasiz: nonushta kartasi (bo\'sh ramka ham) yo\'q');
  eb = expBud(st, '13:10'); mL = await meal(p, 'l'); assert.ok(mL.now); await p.context().close();
  st = seed({ tartib: 'nobf', food: [['b', 300, 10]] }); p = await open(st, { at: '09:00' }); mB = await meal(p, 'b'); assert.ok(mB && !mB.empty, 'nonushta yozilsa — oddiy ko\'rinadi'); eb = expBud(st, '09:00');
  assert.equal(eb.meals.l.budget, Math.round(st.profile && S.mealSplit(S.plan(st.profile).target, 'nobf').l) - 300); assert.equal(nb((await meal(p, 'l')).sub), '0 / ' + eb.meals.l.budget + ' kkal', 'budjeti tushlikdan olindi'); assert.match(nb(mB.sub), /^\+300 kkal tushlikdan olindi$/); await p.context().close();
  st = seed({ tartib: 'erkin' }); p = await open(st); mB = await meal(p, 'b'); assert.match(nb(mB.sub), /^1 ta · kunning \d+%$/, 'erkin — hozirgidek'); assert.equal(await p.locator('.ml-now, #mbNote').count(), 0); assert.match(nb(await p.locator('#bjuCard .pr-tip').innerText()), /^Bugun yana ~\d+ g/); await p.context().close();
  ok('Nonushtasiz: bo\'sh nonushta kartasi chiqmaydi, yozilsa — oddiy va budjeti tushlikdan olinadi («+300 kkal tushlikdan olindi»); erkin — budjet yo\'q, oqsil maslahati kunlik');
  /* ---- 5. oqsil maqsadini qo'lda o'zgartirish; «Haftangiz»da oqsil kunlari ---- */
  st = seed({ tartib: 'std' }); p = await open(st, { at: '12:00' }); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500); await p.click('[data-act=protg]'); await p.waitForTimeout(500);
  const g0 = +(await p.locator('#pgVal').innerText()).replace(/\D/g, ''); assert.equal(g0, pg); await p.click('#rzSheet [data-act=pgm][data-d="10"]'); await p.click('#rzSheet [data-act=pgm][data-d="10"]'); await p.click('#rzSheet [data-act=pgsave]'); await p.waitForTimeout(500);
  assert.equal((await stOf(p)).profile.protG, pg + 20); assert.match(nb(await p.locator('.tt-prof').innerText()), new RegExp('Oqsil maqsadi ' + (pg + 20) + ' g'), 'qo\'lda — «avtomatik» yozuvi yo\'q');
  await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(400); assert.match(nb(await p.locator('#bjuCard .pr-v').innerText()), new RegExp('/ ' + (pg + 20) + ' g'));
  await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(400); await p.click('[data-act=protg]'); await p.waitForTimeout(400); await p.click('#rzSheet [data-act=pgauto]'); await p.waitForTimeout(400); assert.equal((await stOf(p)).profile.protG, undefined, 'avtomatikka qaytdi');
  await p.waitForTimeout(500); await p.click('[data-act=protg]'); await p.waitForTimeout(500); for (let i = 0; i < 25; i++) { const bt = p.locator('#rzSheet [data-act=pgm][data-d="10"]'); if (await bt.isDisabled()) break; await bt.click(); } assert.equal(+(await p.locator('#pgVal').innerText()).replace(/\D/g, ''), 250, 'ko\'pi 250 g'); assert.ok(await p.locator('#rzSheet [data-act=pgm][data-d="10"]').isDisabled()); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(500); await p.click('#hkCard'); await p.waitForTimeout(600); for (let i = 0; i < 6; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300); }
  assert.match(nb(await p.locator('.hk-pr').textContent()), /^Bu hafta \d kun oqsil maqsadiga yetdingiz$/); await p.keyboard.press('Escape'); assert.deepEqual(p.errs, []); await p.context().close();
  ok('Oqsil maqsadi: Profil\'da ±10 g (60–250), Bugun kartasi yangilanadi, «Avtomatik» qaytaradi; «Haftangiz»: «Bu hafta N kun oqsil maqsadiga yetdingiz»');
  /* ---- 6. 360 px × 115% × RU / ЎЗ × tungi ---- */
  for (const [lang, th] of [['ru', 'light'], ['cyr', 'dark'], ['uz', 'dark']]) {
    p = await open(seed({ tartib: 'kech' }), { w: 360, h: 740, lang, th, zoom: 1.15 });
    const chk = (sel) => p.evaluate((q) => { const r = document.querySelector(q), W = document.documentElement.clientWidth; const tx = [...r.querySelectorAll('*')].filter((e) => !e.closest('svg') && [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) && e.getBoundingClientRect().width > 0);
      return { x: document.documentElement.scrollWidth > innerWidth + 1, out: tx.filter((e) => { const b = e.getBoundingClientRect(); return b.right > W + 1 || b.left < -1; }).map((e) => e.className).slice(0, 3), small: tx.filter((e) => parseFloat(getComputedStyle(e).fontSize) < 14.9).map((e) => e.className + ':' + getComputedStyle(e).fontSize).slice(0, 3), heavy: tx.filter((e) => +getComputedStyle(e).fontWeight > 700).length, mix: tx.map((e) => e.textContent).join(' ').split(/[\s«»().,:;!?—–\/·~≈−+%✓]+/).filter((w) => /[a-z]/i.test(w) && /[а-яёўқғҳ]/i.test(w)) }; }, sel);
    for (const sel of ['#bjuCard', '.sl-meals']) { const r = await chk(sel); assert.ok(!r.x && !r.out.length && !r.small.length && !r.heavy, lang + ' ' + sel + ': ' + JSON.stringify(r)); assert.deepEqual(r.mix, [], lang + ' ' + sel + ': aralash alifbo'); }
    await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(400); await p.click('[data-act=ttopen]'); await p.waitForTimeout(600); const r = await chk('#rzSheet'); assert.ok(!r.x && !r.out.length && !r.small.length && !r.heavy, lang + ' oyna: ' + JSON.stringify(r)); assert.deepEqual(r.mix, []);
    if (lang === 'ru') assert.match(nb(await p.locator('#rzSheet').innerText()), /Как вы питаетесь\?[\s\S]*Вечером ем больше[\s\S]*Не завтракаю/);
    if (lang === 'cyr') assert.match(nb(await p.locator('#rzSheet').innerText()), /Қандай овқатланасиз\?/);
    assert.deepEqual(p.errs, []); await p.context().close();
  }
  ok('360 px × 115%: RU (yorug\'), ЎЗ va UZ (tungi) — oqsil kartasi, ovqatlar va tartib oynasi sig\'adi, ≥ 15 px, og\'irlik ≤ 700, aralash alifbo yo\'q');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
