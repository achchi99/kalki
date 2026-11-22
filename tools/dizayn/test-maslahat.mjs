// KalkiFit «Maslahatchi» (jonli nutritsiolog): qoidalar chegaralari (14/15 %, 16:59/17:00), ustuvorlik, kuniga 2 ta, birinchi ovqat / nonushta / 1-kun, kam yeyishda maqtov yo'q,
// matn takrorlanmasligi (uz/ru, 6 tadan), makro holati va top-3, kun xulosasi, Tahlil hisobi; brauzerda: makro paneli + oynasi, maslahat kartasi (chip, yopish, almashish, sozlama),
// kun xulosasi, Tahlil (Tarix kartasi, Imkoniyatlar, «yana N kun»), RU.   node tools/dizayn/test-maslahat.mjs   (SKRINSHOT_DIR — ixtiyoriy)
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module';
import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), M = require(path.join(ROOT, 'assets/kalkifit-maslahat.js')), D = S.dates, T0 = D.today();
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const G = { p: 100, f: 60, c: 250 }, LIM = 2000, nm = (e) => e.name;
const ctx = (o) => Object.assign({ tot: { kcal: 1500, p: 80, f: 50, c: 200 }, goals: G, limit: LIM, floor: 1500, hour: 13, foods: [{ name: 'Somsa', meal: 'l', kcal: 600, p: 20, f: 30, c: 60 }, { name: 'Qazi', meal: 'l', kcal: 400, p: 15, f: 35, c: 0 }, { name: 'Non', meal: 'b', kcal: 500, p: 15, f: 2, c: 100 }], nameOf: nm, firstMeal: false, breakfastOnly: false, day1: false, mode: 'hazil', shown: [], dismissed: [] }, o);
const id = (o) => { const q = M.qoida(ctx(o)); return q ? q.id : null; };
/* 1. chegaralar */
assert.equal(id({ tot: { kcal: 1500, p: 80, f: 68.9, c: 200 } }), null, "yog' 14,8 % — yo'q"); assert.equal(id({ tot: { kcal: 1500, p: 80, f: 69, c: 200 } }), 'a', "yog' 15 % — a");
assert.equal(id({ tot: { kcal: 1500, p: 80, f: 50, c: 287 } }), null, 'uglevod 14,8 %'); assert.equal(id({ tot: { kcal: 1500, p: 80, f: 50, c: 288 } }), 'b', 'uglevod 15,2 %, oqsil < maqsad');
assert.equal(id({ tot: { kcal: 1500, p: 100, f: 50, c: 300 } }), null, 'uglevod oshdi, lekin oqsil bajarilgan — b yo\'q');
assert.equal(id({ hour: 16, tot: { kcal: 1500, p: 50, f: 50, c: 200 } }), null, '16:59 — c yo\'q'); assert.equal(id({ hour: 17, tot: { kcal: 1500, p: 59, f: 50, c: 200 } }), 'c', '17:00 — c'); assert.equal(id({ hour: 17, tot: { kcal: 1500, p: 60, f: 50, c: 200 } }), null, 'oqsil aynan 60 % — c yo\'q');
assert.equal(id({ tot: { kcal: 1700, p: 70, f: 86, c: 120 } }), 'a', 'yog\' ham oshgan — a ustun (d emas)'); assert.equal(id({ dismissed: ['a'], tot: { kcal: 1800, p: 90, f: 95, c: 160 } }), 'd', 'kkal 90 %, yog\' 47,5 % (a yopilgan) — d'); assert.equal(id({ dismissed: ['a'], tot: { kcal: 1800, p: 90, f: 89, c: 160 } }), null, 'yog\' 44,5 % — d yo\'q');
assert.equal(id({ tot: { kcal: 2299, p: 100, f: 60, c: 250 } }), null, 'kkal 14,95 %'); assert.equal(id({ tot: { kcal: 2300, p: 100, f: 60, c: 250 } }), 'e', 'kkal 15 % — e');
assert.equal(id({ hour: 19, tot: { kcal: 2000, p: 100, f: 60, c: 250 } }), 'f', 'kech, hammasi joyida — maqtov'); assert.equal(id({ hour: 18, tot: { kcal: 2000, p: 100, f: 60, c: 250 } }), null, '18:00 — hali erta');
log("Chegaralar: yog' 14,8/15 %, uglevod 14,8/15,2 %, soat 16/17, oqsil 60 %, kkal 14,95/15 %, maqtov faqat kech");
/* 2. ustuvorlik va cheklovlar */
assert.equal(id({ tot: { kcal: 2500, p: 50, f: 80, c: 320 } }), 'a', 'a > b > e'); assert.equal(id({ tot: { kcal: 2500, p: 50, f: 50, c: 320 } }), 'b');
assert.equal(id({ shown: ['a', 'b'], tot: { kcal: 2500, p: 100, f: 60, c: 250 } }), null, 'kuniga 2 ta — uchinchisi yo\'q'); assert.equal(id({ shown: ['a', 'e'], tot: { kcal: 2500, p: 100, f: 60, c: 250 } }), 'e', 'allaqachon ko\'rsatilgani — qoladi');
assert.equal(id({ dismissed: ['a'], tot: { kcal: 1500, p: 80, f: 80, c: 200 } }), null, 'yopilgan qoida qaytmaydi');
assert.equal(id({ firstMeal: true, tot: { kcal: 1500, p: 80, f: 80, c: 200 } }), null, 'birinchi ovqat — salbiy yo\'q'); assert.equal(id({ breakfastOnly: true, tot: { kcal: 1000, p: 30, f: 30, c: 290 } }), null, 'nonushtadan keyin — yetishmovchilik yo\'q');
assert.equal(id({ day1: true, tot: { kcal: 1500, p: 80, f: 80, c: 200 } }), null, '1-kun'); assert.equal(id({ mode: 'off', tot: { kcal: 1500, p: 80, f: 80, c: 200 } }), null, 'o\'chirilgan');
/* kam yeyish: hech qachon maqtov, faqat ogohlantirish */
const lowG = { p: 50, f: 30, c: 120 }; assert.equal(id({ hour: 20, floor: 1200, limit: 1200, goals: lowG, tot: { kcal: 1100, p: 50, f: 30, c: 120 } }), 'kam'); assert.equal(id({ hour: 20, floor: 1200, limit: 1150, goals: lowG, tot: { kcal: 1100, p: 50, f: 30, c: 120 } }), 'kam', 'me\'yor ham past bo\'lsa — baribir maqtov yo\'q');
assert.equal(id({ hour: 14, floor: 1500, tot: { kcal: 900, p: 50, f: 30, c: 100 } }), null, 'kunduzi hali ogohlantirish yo\'q');
log('Ustuvorlik a > b > … ; kuniga 2 ta; yopilgani qaytmaydi; birinchi ovqat/nonushta/1-kun/o\'chirilgan — yo\'q; kam yeyishda maqtov emas, ogohlantirish');
/* 3. matnlar */
for (const L of ['uz', 'ru']) for (const md of ['hazil', 'jiddiy']) for (const r of ['a', 'b', 'c', 'd', 'e', 'f']) for (let i = 0; i < 5; i++) { const t = M.matn({ id: r, data: { x: 18, p: 45, sh: 52, src: [{ name: 'Somsa' }, { name: 'Qazi (ot go\'shti)' }] } }, L, md, i); assert.doesNotMatch(t.b + t.t, /\{\w+\}/, L + r + i); assert.doesNotMatch(t.b, /semiz|yalqov|ochko'z|жирн(ый|ая) вы|ленив|обжор/i, 'uyaltiruvchi so\'z yo\'q'); }
for (let k = 0; k < 40; k++) { const last = k % 5, v = M.variant('a', 'hazil', last, k); assert.notEqual(v, last, 'takrorlanmaydi'); assert.ok(M.variant('a', 'jiddiy', 0, k) < 5); }
log('Matnlar: har qoidaga 5 ta (uz/ru × hazil/jiddiy — test-maslahatchi), hammasi to\'ldirilgan, uyaltiruvchi so\'z yo\'q; ketma-ket takrorlanmaydi');
/* 4. makro, top-3, xulosa, tahlil */
const mk = M.makro({ p: 50, f: 69, c: 250 }, G); assert.deepEqual([mk.p.st, mk.f.st, mk.c.st], ['kam', 'oshdi', 'bajarildi']);
assert.deepEqual(M.manba([{ name: 'Somsa', f: 14 }, { name: 'Qazi', f: 20 }, { name: 'Somsa', f: 14 }, { name: 'Non', f: 1 }, { name: 'Choy', f: 0 }], 'f', nm, 3).map((x) => [x.name, x.g]), [['Somsa', 28], ['Qazi', 20], ['Non', 1]]);
const xs = M.xulosa(ctx({ tot: { kcal: 2400, p: 110, f: 80, c: 260 }, foods: ctx({}).foods }), 'uz'); assert.ok(/110/.test(xs.yaxshi) && /100/.test(xs.yaxshi), xs.yaxshi); assert.ok(/400/.test(xs.ogdi), xs.ogdi); assert.equal(xs.k, 'k'); assert.ok(xs.ertaga.length > 5);
const lw = M.xulosa(ctx({ floor: 1500, tot: { kcal: 900, p: 120, f: 20, c: 100 } }), 'uz'); assert.ok(lw.low); assert.doesNotMatch(lw.yaxshi, /bajarildi|me'yorda/, 'kam yeyishda maqtov yo\'q'); assert.ok(/900/.test(lw.ogdi) && /1 ?500/.test(lw.ogdi), lw.ogdi);
assert.equal(M.tahlil([{}, {}, {}], { window: 14 }).need, 1);
const rows = []; for (let i = 0; i < 8; i++) { const we = i % 7 >= 5; rows.push({ d: 'x' + i, wd: i % 7, kcal: we ? 2600 : 2000, p: i < 2 ? 110 : 60, f: 70, limit: 2000, pgoal: 100, foods: [{ name: 'Osh', kcal: 900, f: 40, meal: 'l' }, { name: 'Kola', kcal: we ? 300 : 200, f: 0, meal: 'l', drink: true }, { name: 'Somsa', kcal: we ? 1400 : 900, f: 30, meal: 'd' }] }); }
const an = M.tahlil(rows, { window: 14 }), F = Object.fromEntries(an.findings.map((f) => [f.k, f]));
assert.equal(an.n, 8); assert.deepEqual(F.top.top.map((x) => x.name), ['Somsa', 'Osh', 'Kola']); assert.equal(F.oqsil.ok, 2); assert.equal(F.yozilmagan.n, 6); assert.equal(F.ichimlik.perDay, 225); assert.equal(F.damolish.diff, 600); assert.ok(F.kechki.sh > 40);
assert.equal(an.main, 'kechki', 'asosiy sabab — eng katta ta\'sir (kkal/kun): ' + an.findings.map((f) => f.k + ':' + Math.round(f.score)).join(' '));
log('Makro holati (kam/joyida/oshdi), top-3 gramm bilan; kun xulosasi (kam yeyishda maqtov yo\'q); Tahlil: top-5, ichimlik/kun, dam olish farqi, oqsil kunlari, yozilmagan kunlar, asosiy sabab');

/* ---------- brauzer ---------- */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
function seed(o = {}) {
  const st = S.emptyState(); st.setup = true; st.created = Date.now() - (o.age == null ? 20 : o.age) * 864e5; st.trackStart = D.addDays(T0, -(o.age == null ? 20 : o.age)); st.prefs = Object.assign({ tipsDone: true, jokes: false, lpTip: 1, yemayK: 1, ttAsked: 1, suvFrom: T0, hwSeen: T0, baliqOff: true, fc: { done: 1 }, crd: { ekran: { ok: 1 }, ilova: { ok: 1 }, akkaunt: { ok: 1 } }, fw: { x: [], d: T0 }, h_backup: Date.now(), h_hafta: Date.now(), bx: { off: 1 } }, o.prefs || {});
  st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'slow' }; S.addWeight(st, D.addDays(T0, -10), 81); S.addWeight(st, T0, 80);
  (o.food || []).forEach(([d, fid, meal, kcal, p, f, c], i) => S.addFood(st, d, { fid, meal, unit: 'porsiya', qty: 1, g: 100, kcal, p, f, c, ts: i + 1 }));
  (o.done || []).forEach((d) => { if (st.days[d]) st.days[d].done = true; }); return st;
}
async function open(o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: o.scheme || 'light', reducedMotion: o.reduced ? 'reduce' : 'no-preference' });
  await c.addInitScript((a) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', a.st); localStorage.setItem('kalki_lang', a.lang); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_no_fc', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); } } catch (e) {}
    if (a.hour != null) { const R = Date, off = new R(new R().setHours(a.hour, a.min || 0, 0, 0)).getTime() - R.now(); class D2 extends R { constructor(...x) { if (x.length === 0) super(R.now() + off); else super(...x); } static now() { return R.now() + off; } } window.Date = D2; } }, { st: JSON.stringify(o.st || seed()), lang: o.lang || 'uz', hour: o.hour == null ? 14 : o.hour, min: o.min });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(BASE + (o.lang === 'ru' ? '/ru/kalkifit' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForSelector('#bjuCard'); await p.waitForTimeout(600); return p;
}
const OUT = process.env.SKRINSHOT_DIR || ''; const shot = async (p, nm, sel) => { if (!OUT) return; try { await (sel ? p.locator(sel).first() : p).screenshot({ path: path.join(OUT, nm) }); } catch (e) {} };
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
try {
  /* 5. makro paneli + oynasi */
  { const st = seed({ food: [[T0, 'somsa', 'l', 600, 20, 40, 60], [T0, 'non', 'b', 500, 15, 2, 100], [T0, 'qazi', 'l', 300, 10, 28, 0]] }); const pl = S.plan(st.profile).macros;
    const p = await open({ st }); const rows = await p.locator('#bjuCard .mk-row').evaluateAll((e) => e.map((x) => [x.getAttribute('data-m'), x.className.match(/mk-(kam|deyarli|bajarildi|oshdi)/)[1], x.getAttribute('aria-label')]));
    assert.deepEqual(rows.map((r) => r[0]), ['p', 'f', 'c']); const exp = (v, g) => M.holat(v, g); assert.deepEqual(rows.map((r) => r[1]), [exp(45, pl.p), exp(70, pl.f), exp(160, pl.c)]);
    const fOver = await p.locator('#bjuCard .mk-row[data-m=f]').evaluate((e) => [getComputedStyle(e.querySelector('.mk-f')).backgroundColor, parseFloat(e.querySelector('.mk-g').style.left)]); assert.ok(fOver[1] < 100, 'maqsad belgisi chiziq ichida');
    await p.click('#bjuCard .mk-row[data-m=f]'); await p.waitForSelector('#mkTop'); const top = await p.locator('#mkTop .rz-row').allInnerTexts(); assert.equal(top.length, 3); assert.match(top[0], /^1\. Somsa[\s\S]*40 g$/); assert.match(top[1], /^2\. Qazi[\s\S]*28 g$/); assert.ok((await txt(p, '#mkTip')).length > 10);
    assert.deepEqual(p.errs, []); await p.context().close(); }
  log('Makro paneli: 3 chiziq (yeyildi / maqsad, kam·joyida·oshdi), maqsad belgisi; bosilsa — top-3 taom gramm bilan + maslahat');

  /* 6. maslahat kartasi: a (yog') — raqam va sabab, chip → guruh qidiruvi; ✕ — qaytmaydi */
  { const st = seed({ food: [[T0, 'non', 'b', 300, 8, 2, 60], [T0, 'somsa', 'l', 700, 22, 52, 70], [T0, 'qazi', 'l', 300, 10, 28, 0]] }); const pl = S.plan(st.profile).macros;
    let p = await open({ st }); await p.waitForSelector('#mslCard'); assert.equal(await p.locator('#mslCard').getAttribute('data-q'), 'a'); const tb = await txt(p, '#mslB'); assert.ok(tb.includes(String(Math.round(82 - pl.f))), tb + ' ~ ' + (82 - pl.f)); 
    assert.ok(await p.locator('#mslCard [data-act=mslgo]').count() >= 2, 'muqobil chiplar'); assert.equal(await p.locator('#bxCard, #remOffer, #fwCard').count(), 0, 'boshqa kartalar bilan almashadi');
    await p.click('#mslCard [data-act=mslgo] >> nth=0'); await p.waitForSelector('#rzSheet.open'); assert.match(await txt(p, '#rzSheet'), /Tovuq|Baliq|Sabzavot/); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await p.click('#mslCard [data-act=mslx]'); await p.waitForTimeout(300); assert.equal(await p.locator('#mslCard').count(), 0); const sv = await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')).prefs.msl); assert.deepEqual(sv.dis, ['a']); assert.deepEqual(p.errs, []); await p.context().close(); }
  log("Maslahat kartasi: «Yog' oshdi» — gramm va sabab taom (somsa), muqobil chiplar → guruh qidiruvi, boshqa kontekst kartalar o'rnida; ✕ — shu kuni qaytmaydi");

  /* 7. 1-kun / birinchi ovqat / sozlama o'chirilgan / RU */
  { let p = await open({ st: seed({ age: 0, food: [[T0, 'somsa', 'l', 900, 22, 80, 70]] }) }); assert.equal(await p.locator('#mslCard').count(), 0, '1-kun'); await p.context().close();
    p = await open({ st: seed({ food: [[T0, 'somsa', 'l', 900, 22, 80, 70]] }) }); assert.equal(await p.locator('#mslCard').count(), 0, 'birinchi ovqat — salbiy yo\'q'); await p.context().close();
    p = await open({ st: seed({ prefs: { mslMode: 'off' }, food: [[T0, 'non', 'b', 300, 8, 2, 60], [T0, 'somsa', 'l', 900, 22, 80, 70]] }) }); assert.equal(await p.locator('#mslCard').count(), 0, 'o\'chirilgan'); await p.click('[data-act=tab][data-v=profile]'); await p.waitForSelector('#mslSet'); assert.equal(await p.locator('#mslSet [data-act=mslmode][data-v=off]').getAttribute('aria-checked'), 'true'); await p.click('#mslSet [data-act=mslmode][data-v=jiddiy]'); assert.equal((await p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')).prefs.mslMode)), 'jiddiy'); await p.context().close();
    p = await open({ lang: 'ru', hour: 18, st: seed({ food: [[T0, 'non', 'b', 300, 8, 2, 60], [T0, 'osh', 'l', 500, 15, 18, 60]] }) }); await p.waitForSelector('#mslCard'); assert.equal(await p.locator('#mslCard').getAttribute('data-q'), 'c'); assert.match(await txt(p, '#mslCard .msl-t'), /\d+ г/); await p.context().close(); }
  log('1-kun va kunning birinchi ovqati — karta yo\'q; «O\'chirilgan» — yo\'q, Profil → Maslahatchi (3 rejim); RU (18:00, oqsil kam → c)');

  /* 8. kun xulosasi */
  { const p = await open({ hour: 20, st: seed({ food: [[T0, 'non', 'b', 300, 8, 2, 60], [T0, 'somsa', 'l', 700, 22, 52, 70], [T0, 'osh', 'd', 700, 25, 25, 90]] }) });
    await p.evaluate(() => { const K = window.__kalkifit; }); await p.waitForTimeout(1200); if (!(await p.locator('#kxList').count())) { await p.click('#dayEnd'); await p.waitForSelector('#kxList', { timeout: 5000 }); }
    const li = await p.locator('#kxList li').allInnerTexts(); assert.equal(li.length, 3); assert.match(li[1], /Og'di[\s\S]*\d/); assert.equal(await p.locator('#kxRings .kx-r').count(), 3); assert.deepEqual(p.errs, []); await p.context().close(); }
  log('Kun xulosasi: 21:00 dan keyin bir marta (yoki «Kunni yakunlash») — 3 qator (yaxshi / og\'di raqam + sabab / ertaga) va 3 makro halqasi');

  /* 9. Tahlil */
  { const food = []; for (let i = 1; i <= 6; i++) { const d = D.addDays(T0, -i); food.push([d, 'osh', 'l', 900, 25, 35, 110], [d, 'kola', 'l', 300, 0, 0, 75], [d, 'somsa', 'd', 900, 25, 50, 80]); }
    const st = seed({ food }); let p = await open({ st }); await p.click('[data-act=tab][data-v=history]'); await p.waitForSelector('#tlCard'); assert.match(await txt(p, '#tlCard'), /^Tahlil/);
    const tops = await p.evaluate(() => [document.getElementById('tlCard').getBoundingClientRect().top, (document.getElementById('hkCard') || document.body).getBoundingClientRect().top]); assert.ok(tops[0] <= tops[1], 'Tarix — eng tepada');
    await p.click('#tlCard'); await p.waitForSelector('.tl-main'); assert.match(await txt(p, '.tl-main'), /asosiy sababi/); assert.ok(await p.locator('.tl-f').count() >= 6); assert.match(await txt(p, '.tl-f[data-k=ichimlik]'), /300 kkal/); assert.deepEqual(p.errs, []); await p.context().close();
    p = await open({ st: seed({ food: food.slice(0, 6) }) }); await p.click('[data-act=tab][data-v=history]'); await p.waitForSelector('#tlCard'); assert.match(await txt(p, '#tlCard'), /yana 2 kun/i); await p.context().close(); }
  log('Tahlil: Tarix\'da eng tepada; asosiy sabab katta, topilmalar (ichimlik 300 kkal/kun …); 2 kun bo\'lsa — «yana 2 kun»');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
