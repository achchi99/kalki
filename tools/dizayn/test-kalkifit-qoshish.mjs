// KalkiFit v32 soddalik: «Qo'shish» varag'i (4 plitka: Yozish · Ovoz · Rasm · Menyu, bir qatorli izoh, «bugun N ta qoldi», pastda «Yeymiz» havolasi),
// Bugun tartibi (sana+hafta → halqa → bitta karta → suv/qadam → ovqatlar → pastda «Qo'shish»), hazil faqat ovqatdan keyin 4 s, birinchi hafta maslahatlari (kuniga bitta, ishlatilgani o'tkaziladi),
// Profil guruhlari (Men · Sozlamalar · Imkoniyatlar · Ilova · Hisob va zaxira — eng pastda).   node tools/dizayn/test-kalkifit-qoshish.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const T0 = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
function seed(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - (o.age || 2) * 864e5; st.prefs = Object.assign({ yemayK: 1, jokes: true, suvFrom: T0 }, o.prefs || {}); st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'lose' }; S.addWeight(st, T0, 80);
  (o.food || []).forEach((f, i) => S.addFood(st, T0, Object.assign({ meal: 'l', ts: i + 1, est: false, p: 1, f: 1, c: 1 }, f))); return st; }
async function open({ st = seed(), lang = 'uz', ai = { limit: 5, qoldi: 3 }, ov = { yoqilgan: true, limit: 15, qoldi: 12 }, now = null } = {}) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((o) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_lang', o.lang); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); } } catch (e) {}
    if (o.now) { const off = o.now - Date.now(), R = Date; class D2 extends R { constructor(...a) { if (a.length === 0) super(R.now() + off); else super(...a); } static now() { return R.now() + off; } } window.Date = D2; } }, { st, lang, now });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/**', (r) => { const u = r.request().url(); if (/\/api\/ovoz/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ov) }); if (/\/api\/retsept/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ai) }); return r.abort(); });
  await p.goto(BASE + (lang === 'ru' ? '/ru/kalkifit' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(700); return p;
}
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
const kind = (p) => p.evaluate(() => { const s = document.getElementById('rzSheet'); return s && !s.hidden ? s.getAttribute('data-kind') : null; });
try {
  /* 1. Bugun tartibi */
  let p = await open({ st: seed({ food: [{ fid: 'osh', unit: 'kosa', qty: 1, g: 300, kcal: 520 }] }) });
  const order = await p.evaluate(() => [...document.getElementById('rzMain').children].map((e) => e.classList.contains('sl-hd2') ? 'sarlavha' : e.classList.contains('sl-week7') ? 'hafta' : e.classList.contains('sl-big') ? 'halqa' : e.id === 'fwCard' ? 'maslahat' : e.classList.contains('sl-duo') ? 'suv-qadam' : e.classList.contains('sl-sec2') ? 'ovqatlar-sarlavha' : e.classList.contains('sl-meals') ? 'ovqatlar' : e.classList.contains('sl-dayend') ? 'kun-yakuni' : e.classList.contains('sl-addbar') ? 'qoshish' : '?' + e.className));
  assert.deepEqual(order.filter((x) => x !== 'kun-yakuni'), ['sarlavha', 'hafta', 'halqa', 'maslahat', 'suv-qadam', 'ovqatlar-sarlavha', 'ovqatlar', 'qoshish'], 'Bugun: ' + order);
  assert.equal(await p.locator('#rzMain .sl-macs, #rzMain #yeCard, #rzMain #rtDoor, #rzMain .sl-wrow, #rzMain #streakChip, #rzMain .sl-av, #rzMain .sl-suplink, #rzMain #jLine').count(), 0, 'ikkinchi qavatdagilar Bugun\'da yo\'q');
  assert.match(await txt(p, '.sl-rsub'), /520 iste'mol · [\d ]+ maqsad/); assert.equal(await txt(p, '#mainAdd'), "Qo'shish");
  const ab = await p.evaluate(() => { const a = document.querySelector('.sl-addbar').getBoundingClientRect(), nav = document.querySelector('.rz-nav').getBoundingClientRect(); return { bottom: a.bottom, nav: nav.top }; }); assert.ok(ab.bottom <= ab.nav + 1 && ab.bottom > ab.nav - 40, '«Qo\'shish» ekran pastida (yopishqoq): ' + JSON.stringify(ab));
  await p.click('#kcalBtn'); await p.waitForTimeout(400); assert.equal(await p.locator('#rzSheet .sl-macs').count(), 1, 'makrolar — halqa bosilganda'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Bugun: sarlavha+sana → hafta chizig\'i → halqa (qoldi; ostida iste\'mol/maqsad) → bitta karta → suv/qadam → ovqatlar → pastda yopishqoq «Qo\'shish»; makrolar halqa ichida, Yeymiz/retsept/vazn/streak Bugun\'da yo\'q');
  /* 2. bo'sh kun: tushuntirish */
  p = await open(); assert.match(await txt(p, '.sl-tdempty'), /Bugun hali ovqat yozilmagan\. Pastdagi «Qo'shish» tugmasini bosing/); await p.context().close();
  log('Bo\'sh kun: tushuntirish matni («Qo\'shish» — yozing, ayting yoki suratga oling)');
  /* 3. Qo'shish varag'i: 4 plitka */
  p = await open(); await p.click('#mainAdd'); await p.waitForSelector('#rzSheet .sl-ptile'); await p.waitForTimeout(500);
  const tiles = await p.locator('#rzSheet .sl-ptile').evaluateAll((l) => l.map((e) => ({ k: e.getAttribute('data-fk'), b: e.querySelector('b').textContent, d: e.querySelector('.d').textContent, l: e.querySelector('.sl-tl') ? e.querySelector('.sl-tl').textContent : '', ic: !!e.querySelector('.sl-ptile-ic svg') })));
  assert.deepEqual(tiles.map((t) => t.k), ['yozish', 'ovoz', 'rasm', 'menyu']); assert.deepEqual(tiles.map((t) => t.b), ['Yozish', 'Ovoz', 'Rasm', 'Menyu']);
  assert.deepEqual(tiles.map((t) => t.d), ['Nomini yozing, bazadan topamiz', "Ayting: «bir kosa sho'rva va non»", 'Taomni suratga oling', 'Kafe menyusini suratga oling, mosini tanlaymiz']); assert.ok(tiles.every((t) => t.ic), 'har plitkada ikonka');
  assert.deepEqual(tiles.map((t) => t.l), ['', 'bugun 12 ta qoldi', 'bugun 3 ta qoldi', 'bugun 3 ta qoldi'], 'limit yozuvi');
  assert.equal(await txt(p, '#rzSheet .sl-yelink'), "Yeymiz: nima yesam bo'ladi?"); const g = await p.locator('#rzSheet .sl-ptile').evaluateAll((l) => l.map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; })); assert.equal(g[0][1], g[1][1], '2×2'); assert.equal(g[0][0], g[2][0]);
  await p.click('#rzSheet [data-fk=yozish]'); await p.waitForSelector('#fdQ'); assert.equal(await kind(p), 'add'); assert.equal(await txt(p, '#rzSheet .rz-sh-h b'), 'Yozish'); await p.click('#rzSheet [data-act=apback]'); await p.waitForSelector('#rzSheet .sl-ptile'); assert.equal(await p.locator('#rzSheet .sl-ptile').count(), 4, '‹ Orqaga — plitkalarga');
  const [fch] = await Promise.all([p.waitForEvent('filechooser', { timeout: 4000 }), p.click('#rzSheet [data-fk=rasm]')]); assert.ok(fch, 'Rasm — rasm tanlash (vebda fayl oynasi)'); await p.waitForTimeout(300);
  await p.click('#rzSheet [data-act=sheetclose]'); await p.waitForTimeout(400); await p.click('#mainAdd'); await p.waitForSelector('#rzSheet .sl-ptile'); await p.click('#rzSheet [data-fk=menyu]'); await p.waitForTimeout(500); assert.ok(await p.locator('#rzSheet [data-act=mnpick], #rzSheet [data-act=mncam], #rzSheet #mnIn').count() > 0, 'Menyu — menyu oqimi');
  await p.click('#rzSheet [data-act=sheetclose]'); await p.waitForTimeout(400); await p.click('#mainAdd'); await p.waitForSelector('#rzSheet .sl-ptile'); await p.click('#rzSheet .sl-yelink'); await p.waitForTimeout(500); assert.notEqual(await kind(p), 'add', 'Yeymiz ochildi'); assert.deepEqual(p.errs, []); await p.context().close();
  p = await open({ ai: { limit: 5, qoldi: 0 }, ov: { yoqilgan: true, limit: 15, qoldi: 0 } }); await p.click('#mainAdd'); await p.waitForSelector('#rzSheet .sl-ptile'); await p.waitForTimeout(500); assert.equal(await txt(p, '#rzSheet [data-fk=rasm] .sl-tl'), 'bugungi limit tugadi'); await p.context().close();
  p = await open({ lang: 'ru' }); await p.click('#mainAdd'); await p.waitForSelector('#rzSheet .sl-ptile'); assert.deepEqual(await p.locator('#rzSheet .sl-ptile b').allInnerTexts(), ['Написать', 'Голос', 'Фото', 'Меню']); assert.equal(await txt(p, '#rzSheet .rz-sh-h b'), 'Что добавим?'); await p.context().close();
  log('«Qo\'shish» → varaq: 4 katta plitka 2×2 (ikonka, nom, bir qatorli izoh), «bugun N ta qoldi» (AI va ovoz limiti alohida, tugasa — «bugungi limit tugadi»), Yozish → qidiruv (‹ Orqaga), Rasm/Menyu oqimlari, pastda «Yeymiz» havolasi; RU');
  /* 4. ovqatlar ro'yxatidagi «+» — to'g'ridan qidiruv (asosiy yo'l qisqa) */
  p = await open(); await p.click('.sl-meal[data-m=b] [data-act=addto]'); await p.waitForSelector('#fdQ'); assert.equal(await p.locator('#rzSheet .sl-ptile').count(), 0); await p.context().close();
  log('Ovqat vaqti yonidagi «+» — to\'g\'ridan qidiruv');
  /* 5. hazil: faqat ovqat qo'shilgach, 4 soniya */
  p = await open(); assert.equal(await p.locator('#jLine').count(), 0, 'doimiy hazil yo\'q');
  await p.click('.sl-meal[data-m=l] [data-act=addto]'); await p.waitForSelector('#fdQ'); await p.fill('#fdQ', 'olma'); await p.waitForTimeout(400); await p.click('[data-act=pickfood] >> nth=0'); await p.waitForTimeout(300); await p.click('#fsave'); await p.waitForTimeout(700);
  assert.equal(await p.locator('.sl-big #jLine').count(), 1, 'ovqatdan keyin pufak'); const jt = await txt(p, '#jLine'); assert.ok(jt.length > 3); await p.waitForTimeout(4200); assert.equal(await p.locator('#jLine').count(), 0, '4 soniyadan keyin yo\'qoladi');
  await p.click('#wCard [data-act=wadd]'); await p.waitForTimeout(600); assert.equal(await p.locator('#jLine').count(), 0, 'suvdan keyin hazil yo\'q'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Hazil: doimiy turmaydi; ovqat qo\'shilgach halqa ustida pufak, 4 soniyada yo\'qoladi; suvdan keyin chiqmaydi');
  /* 6. birinchi hafta maslahatlari: kuniga bitta, yopsa qaytmaydi, ishlatilgani o'tkaziladi */
  p = await open(); assert.equal(await p.locator('#fwCard').getAttribute('data-fk'), 'ovoz'); assert.match(await txt(p, '#fwCard'), /Ovoz bilan qo'shing.*Sinab ko'rish/);
  await p.click('#fwCard [data-act=fwx]'); await p.waitForTimeout(300); assert.equal(await p.locator('#fwCard').count(), 0, 'yopildi — bugun boshqasi yo\'q');
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); assert.equal(await p.locator('#fwCard').count(), 0, 'qaytmaydi'); await p.context().close();
  let st = seed({ prefs: { fw: { x: ['ovoz'], k: null, d: D.addDays(T0, -1) }, used: { rasm: 1 } } });
  p = await open({ st }); assert.equal(await p.locator('#fwCard').getAttribute('data-fk'), 'menyu', 'ertasiga keyingisi; rasm ishlatilgan — o\'tkazildi'); await p.click('#fwCard [data-act=fwtry]'); await p.waitForTimeout(600); assert.ok(await p.locator('#rzSheet [data-act=mnpick], #rzSheet [data-act=mncam], #rzSheet #mnIn').count() > 0, '«Sinab ko\'rish» — funksiya ochiladi');
  const pf = await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')).prefs.fw); assert.ok(pf.x.includes('menyu')); await p.context().close();
  p = await open({ st: seed({ age: 30 }) }); assert.equal(await p.locator('#fwCard').count(), 0, '3 haftadan keyin maslahat yo\'q'); await p.context().close();
  log('Birinchi hafta maslahatlari: ovoz → (rasm ishlatilgan — o\'tkaziladi) → menyu …; kuniga bitta, ✕ — qaytmaydi, «Sinab ko\'rish» funksiyani ochadi; 3 haftadan keyin yo\'q');
  /* 7. Profil guruhlari va «Imkoniyatlar» */
  p = await open(); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500);
  assert.deepEqual(await p.locator('#rzMain .sl-grp').allInnerTexts().then((l) => l.map((x) => x.toUpperCase())), ['MEN', 'SOZLAMALAR', 'IMKONIYATLAR', 'ILOVA', 'HISOB VA ZAXIRA']);
  const ord = await p.evaluate(() => { const y = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top : -1; }; return [y('.sl-prof'), y('#remCard'), y('#rzMain [data-act=lang]'), y('#rzMain [data-act=theme]'), y('#ynCard'), y('.sl-feats'), y('[data-act=intro]'), y('[data-act=export]')]; });
  assert.ok(ord.every((v) => v > 0) && ord.every((v, i) => !i || v > ord[i - 1]), 'tartib: ma\'lumotlar → eslatmalar → til → tungi rejim → yemaydiganlarim → imkoniyatlar → tanishtiruv → hisob/zaxira (eng pastda): ' + ord);
  const feats = await p.locator('.sl-feat').evaluateAll((l) => l.map((e) => [e.querySelector('b').textContent, e.querySelector('.m span').textContent, e.querySelector('[data-act=feat]').textContent]));
  assert.ok(feats.length >= 10 && feats.every((f) => f[0] && f[1] && f[2] === 'Ochish'), 'har biri: nom, izoh, «Ochish»: ' + feats.length);
  await p.click('.sl-feat [data-fk=yesam]'); await p.waitForTimeout(500); assert.equal(await kind(p), 'yesam'); assert.equal(await p.locator('#rzFab').isVisible(), false, 'Profilda suzuvchi «+» yo\'q'); assert.deepEqual(p.errs, []); await p.context().close();
  log('Profil: Men · Sozlamalar · Imkoniyatlar (har funksiya: nom, bir qatorli izoh, «Ochish») · Ilova · Hisob va zaxira (eng pastda); suzuvchi «+» yo\'q');
  console.log('\n' + n + '/' + n + ' OK');
} finally { await b.close(); srv.close(); }
