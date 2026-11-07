// KalkiFit v75: «Birinchi ovqatingizni yozing» kartasi (aktivatsiya): yangi foydalanuvchida halqa ostida; 3 usul (rasm, ovoz, qidiruv) + soatga qarab 6 tez tanlov (bir bosishda standart porsiya);
// birinchi ovqatda yo'qoladi va «Zo'r boshlanish! Bugun yana N kkal» (1,5 s); «Keyinroq» — bugun qaytmaydi; yozilmagan bo'lsa ertasi kuni birinchi ochilishda BIR marta; eski foydalanuvchida chiqmaydi;
// kontekst chip/karta ko'rinsa ALMASHADI; statistika hodisalari; UZ/RU/ЎЗ; 360 px, katta shrift, qorong'i rejim.   node tools/dizayn/test-birinchi-karta.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const T0 = D.today();
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
function seed(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - (o.age || 2) * 864e5; st.prefs = Object.assign({ yemayK: 1, jokes: true, suvFrom: T0, hwSeen: D.today(), ttAsked: 1 }, o.prefs || {}); st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'lose' }; S.addWeight(st, T0, 80);
  (o.food || []).forEach((f, i) => S.addFood(st, T0, Object.assign({ meal: 'l', ts: i + 1, est: false, p: 1, f: 1, c: 1 }, f))); return st; }
async function open({ st = seed({ age: 0.01 }), lang = 'uz', now = null, w = 390, h = 844, scheme = 'light', ls = {}, ev = true } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: scheme });
  await c.addInitScript((o) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', JSON.stringify(o.st)); localStorage.setItem('kalki_lang', o.lang); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); Object.keys(o.ls).forEach((k) => localStorage.setItem(k, o.ls[k])); } } catch (e) {}
    if (o.now) { const off = o.now - Date.now(), R = Date; class D2 extends R { constructor(...a) { if (a.length === 0) super(R.now() + off); else super(...a); } static now() { return R.now() + off; } } window.Date = D2; } }, { st, lang, now, ls });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ limit: 5, qoldi: 3, yoqilgan: true }) }));
  if (ev) await p.route('**/assets/stat-kun.js*', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: "window.__ev=[];window.KalkiStat={create:function(){var o={add:function(h,k){window.__ev.push(h+'.'+(k||''))},disabled:function(){return false},manba:function(){}};return new Proxy(o,{get:function(t,p){return p in t?t[p]:function(){return null}}})}};" }));
  await p.goto(BASE + '/kalkifit', { waitUntil: 'networkidle' }); await p.waitForTimeout(900); return p;
}
const at = (hh, mm = 0, dayOff = 0) => { const d = new Date(); d.setHours(hh, mm, 0, 0); return d.getTime() + dayOff * 864e5; };
const evs = (p) => p.evaluate(() => window.__ev || []);
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
try {
  /* 1. yangi foydalanuvchi: karta halqa ostida, 3 usul + 6 chip, kontekst narsalar almashgan */
  let p = await open({ now: at(8, 30) });
  assert.equal(await p.locator('#fcCard').count(), 1, 'karta bor'); assert.equal(await txt(p, '#fcCard h3'), 'Birinchi ovqatingizni yozing');
  assert.deepEqual(await p.locator('#fcCard .fc-b span').allInnerTexts(), ['Rasmga olish', 'Aytib berish', 'Qidirish']); assert.equal(await p.locator('#fcCard .fc-chip').count(), 6);
  assert.deepEqual(await p.locator('#fcCard .fc-chip').allInnerTexts(), ['Non', 'Choy', 'Tuxum', 'Qaymoq', 'Sut', 'Olma'], 'nonushta chiplari');
  const ord = await p.evaluate(() => { const m = document.getElementById('rzMain'), k = [...m.children], i = (s) => k.findIndex((e) => e.matches(s)); return { ring: i('.sl-big'), card: i('#fcCard'), meals: i('.sl-sec2k') }; }); assert.ok(ord.ring >= 0 && ord.card === ord.ring + 1 && ord.meals > ord.card, 'halqa → karta → ovqatlar: ' + JSON.stringify(ord));
  assert.equal(await p.locator('.sl-tdempty, #fwCard, .sl-fishslot, #rzChip, #rzChipIn').count(), 0, 'bo\'sh holat matni / maslahat kartasi / chip — almashgan');
  assert.ok((await evs(p)).includes('birinchi_karta.korsatildi'), 'korsatildi hodisasi'); assert.deepEqual(p.errs, []); await p.context().close();
  p = await open({ now: at(13, 0) }); assert.deepEqual(await p.locator('#fcCard .fc-chip').allInnerTexts(), ['Osh', "Sho'rva", 'Manti', "Lag'mon", 'Somsa', 'Sabzavot salati'], 'tushlik chiplari'); await p.context().close();
  p = await open({ now: at(19, 30) }); assert.equal(await p.locator('#fcCard .fc-chip').first().innerText(), 'Osh', 'kechki — tushlik ro\'yxati'); await p.context().close();
  p = await open({ now: at(16, 30) }); assert.equal(await p.locator('#fcCard .fc-chip').first().innerText(), 'Choy', 'tamaddi'); await p.context().close();
  log('Karta: yangi foydalanuvchi, halqa ostida (halqa → karta → ovqatlar); 3 usul + 6 chip (nonushta / tushlik-kechki / tamaddi); bo\'sh holat matni, maslahat kartasi va chip almashgan; «korsatildi» hodisasi');
  /* 2. chip bir bosishda: standart porsiya, karta yo'qoladi, tasdiq, tahrirlash */
  p = await open({ now: at(8, 30) }); await p.click('#fcCard .fc-chip >> nth=1'); await p.waitForTimeout(800);
  const s1 = await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit'))); const day = Object.values(s1.days).find((d) => d.food.length); assert.equal(day.food.length, 1); assert.equal(day.food[0].fid, 'choy'); assert.equal(day.food[0].unit, 'piyola'); assert.equal(day.food[0].qty, 1); assert.equal(day.food[0].meal, 'b');
  assert.equal(await p.locator('#fcCard').count(), 0, 'karta yo\'qoldi'); const tt = await txt(p, '#rzToast'); assert.match(tt, /Zo'r boshlanish! Bugun yana [\d\s]+ kkal/, tt); assert.equal(await p.evaluate(() => document.querySelector('.sl-big').classList.contains('fc-pop')), true, 'halqa nuri');
  await p.waitForTimeout(1700); assert.equal(await p.locator('#rzToast').isVisible(), false, 'tasdiq ~1,5 s'); assert.equal(await p.evaluate(() => document.querySelector('.sl-big').classList.contains('fc-pop')), false);
  await p.click('#rzMain [data-act=editfood]'); await p.waitForTimeout(500); assert.ok(await p.locator('#rzSheet').isVisible(), 'qo\'shilgan ovqatni tahrirlash mumkin');
  const e2 = await evs(p); for (const x of ['birinchi_karta.chip', 'birinchi_karta.qoshildi', 'ovqat_qoshildi.tavsiya']) assert.ok(e2.includes(x), x + ' — ' + e2); assert.deepEqual(p.errs, []);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(600); assert.equal(await p.locator('#fcCard').count(), 0, 'qayta chiqmaydi'); await p.context().close();
  log('Chip bir bosishda: standart porsiya (1 piyola choy), karta yo\'qoladi, «Zo\'r boshlanish! Bugun yana N kkal» ~1,5 s + halqa nuri, qatorni bosib tahrirlash; hodisalar chip / qoshildi; qayta chiqmaydi');
  /* 3. usul tugmalari */
  for (const [act, ev1] of [['fcqid', 'birinchi_karta.qidiruv'], ['fcrasm', 'birinchi_karta.rasm'], ['fcovoz', 'birinchi_karta.ovoz']]) { p = await open({ now: at(9, 0) }); await p.click('#fcCard [data-act=' + act + ']'); await p.waitForTimeout(700); assert.ok((await evs(p)).includes(ev1), act); assert.ok(await p.locator('#rzSheet').isVisible() || act === 'fcovoz', act + ' oyna ochiladi'); await p.context().close(); }
  log('Rasm / Ovoz / Qidirish tugmalari: tegishli oqim ochiladi va hodisa yoziladi');
  /* 4. Keyinroq: bugun qaytmaydi; ertasi birinchi ochilishda BIR marta; keyin chiqmaydi */
  p = await open({ st: seed({ age: 1 }), now: at(10, 0) }); assert.equal(await p.locator('#fcCard').count(), 1, '2-kun: bir marta chiqadi'); await p.click('#fcCard [data-act=fcx]'); await p.waitForTimeout(500); assert.equal(await p.locator('#fcCard').count(), 0); assert.ok((await evs(p)).includes('birinchi_karta.yopildi'));
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); assert.equal(await p.locator('#fcCard').count(), 0, 'Keyinroq — bugun qaytmaydi'); await p.context().close();
  p = await open({ st: seed({ age: 0.01 }), now: at(10, 0) }); await p.click('#fcCard [data-act=fcx]'); await p.waitForTimeout(400); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); assert.equal(await p.locator('#fcCard').count(), 0, '1-kun: Keyinroq — qaytmaydi');
  assert.equal(await p.locator('#fwCard, .sl-tdempty').count() >= 1, true, 'karta yopilgach oddiy holat qaytadi'); await p.context().close();
  p = await open({ st: seed({ age: 1 }), now: at(10, 0) }); assert.equal(await p.locator('#fcCard').count(), 1); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); assert.equal(await p.locator('#fcCard').count(), 0, '2-kun: keyingi ochilishda (seans) qaytmaydi — faqat BIR marta');
  await p.context().close();
  log('Keyinroq: bugun qaytmaydi; 1-kuni yozilmagan bo\'lsa 2-kuni birinchi ochilishda bir marta chiqadi, keyin (qayta ochilganda) chiqmaydi');
  /* 5. eski foydalanuvchi / 3+ kun / ovqati bor — karta umuman chiqmaydi */
  p = await open({ st: seed({ age: 30, food: [{ fid: 'osh', unit: 'kosa', qty: 1, g: 250, kcal: 475 }] }) }); assert.equal(await p.locator('#fcCard').count(), 0, 'eski, ovqati bor'); await p.context().close();
  p = await open({ st: seed({ age: 0.01, food: [{ fid: 'osh', unit: 'kosa', qty: 1, g: 250, kcal: 475 }] }) }); assert.equal(await p.locator('#fcCard').count(), 0, 'yangi, lekin ovqat yozilgan'); await p.context().close();
  p = await open({ st: seed({ age: 6 }) }); assert.equal(await p.locator('#fcCard').count(), 0, '6 kunlik, ovqatsiz — karta yo\'q'); await p.context().close();
  p = await open({ st: seed({ age: 0.01 }), now: at(8, 0, 2) }); assert.equal(await p.locator('#fcCard').count(), 0, '3-kun — yo\'q'); await p.context().close();
  log('Eski foydalanuvchi (ovqati bor), ovqat yozgan yangi, 3+ kunlik ovqatsiz — karta chiqmaydi');
  /* 6. tillar */
  p = await open({ lang: 'ru', now: at(8, 30) }); assert.equal(await txt(p, '#fcCard h3'), 'Запишите первый приём пищи'); assert.deepEqual(await p.locator('#fcCard .fc-b span').allInnerTexts(), ['Сфотографировать', 'Сказать голосом', 'Найти']); assert.equal(await txt(p, '#fcCard .fc-later'), 'Позже'); await p.click('#fcCard .fc-chip >> nth=1'); await p.waitForTimeout(700); assert.match(await txt(p, '#rzToast'), /Отличное начало! Сегодня ещё/); await p.context().close();
  p = await open({ lang: 'cyr', now: at(8, 30) }); assert.equal(await txt(p, '#fcCard h3'), 'Биринчи овқатингизни ёзинг'); assert.equal(await txt(p, '#fcCard .fc-later'), 'Кейинроқ'); await p.context().close();
  log('Tillar: UZ, RU («Запишите первый приём пищи», «Отличное начало!»), ЎЗ (kirill)');
  /* 7. ko'rinish: 360 px, katta shrift, qorong'i — sig'adi, tugmalar ≥ 44 px, gorizontal skroll yo'q */
  for (const [w, sch, big] of [[360, 'light', false], [360, 'dark', true], [390, 'dark', false]]) { p = await open({ w, scheme: sch, now: at(8, 30), ls: big ? { kalki_fs: 'big' } : {} }); if (big) await p.evaluate(() => document.documentElement.classList.add('fs-big')); await p.waitForTimeout(500);
    const m = await p.evaluate(() => { const c = document.getElementById('fcCard').getBoundingClientRect(), bs = [...document.querySelectorAll('#fcCard button')].map((e) => e.getBoundingClientRect()); return { w: innerWidth, sw: document.documentElement.scrollWidth, inside: bs.every((r) => r.left >= c.left - 1 && r.right <= c.right + 1), min: Math.min(...bs.map((r) => r.height)), bg: getComputedStyle(document.getElementById('rzApp')).backgroundColor, cbg: getComputedStyle(document.getElementById('fcCard')).backgroundColor }; });
    assert.ok(m.sw <= m.w && m.inside && m.min >= 44, w + ' ' + sch + ' ' + big + ': ' + JSON.stringify(m)); if (sch === 'dark') assert.notEqual(m.cbg, 'rgb(255, 255, 255)', 'qorong\'i rejim'); assert.deepEqual(p.errs, []); await p.context().close(); }
  /* iPhone Safari (393×659 ko'rinadigan maydon): karta (3 usul + chiplar + «Keyinroq») to'liq, skrollsiz ko'rinadi; pastki «Ovqat qo'shish» tugmasi yashirin (almashgan) */
  { p = await open({ w: 393, h: 659, now: at(8, 30) }); await p.waitForTimeout(600); const m = await p.evaluate(() => { const c = document.getElementById('fcCard').getBoundingClientRect(), nav = document.querySelector('.rz-nav').getBoundingClientRect(), bar = document.getElementById('rzAddBar'); return { top: c.top, bottom: Math.round(c.bottom), nav: Math.round(nav.top), barVisible: !!bar && getComputedStyle(bar).display !== 'none' && !bar.hidden, later: document.querySelector('#fcCard .fc-later').getBoundingClientRect().bottom }; });
    assert.ok(m.bottom <= m.nav + 1 && m.later <= m.nav, 'karta iPhone ekraniga to\'liq sig\'adi: ' + JSON.stringify(m)); assert.equal(m.barVisible, false, 'pastki tugma yashirin'); await p.context().close(); }
  log('Ko\'rinish: 360/390 px, katta shrift, qorong\'i rejim — sig\'adi, tugmalar ≥ 44 px, gorizontal skroll yo\'q; iPhone ko\'rinadigan maydonida (393×659) karta to\'liq, pastki tugma yashirin');
  /* 8. cheklov: kontekst chip kartaga zid kelmaydi (kod darajasida) va hodisa ro'yxati serverda */
  { const app = fs.readFileSync(path.join(ROOT, 'assets/kalkifit-app.js'), 'utf8'); assert.match(app, /view !== 'today' \|\| fcVis\) return false/); assert.match(app, /h \+= fcVis \? '' : slotHtml\(t, x\)/); const STAT = await import('../../functions/api/stat.js'); for (const k of ['korsatildi', 'rasm', 'ovoz', 'qidiruv', 'chip', 'yopildi', 'qoshildi']) assert.ok(STAT.HODISA.birinchi_karta.test(k), k); assert.ok(!STAT.HODISA.birinchi_karta.test('boshqa')); }
  log('Kontekst chip va maslahat kartasi kartaga almashadi (kod); statistika hodisalari serverda qat\'iy ro\'yxat');
  console.log('birinchi-karta: ' + n + ' guruh OK');
} finally { await b.close(); srv.close(); }
