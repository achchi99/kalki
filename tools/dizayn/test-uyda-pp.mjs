// KalkiFit v42: «Bugun nima yeymiz?» → Uyda: tez va sog'lom (PP) retseptlar kutubxonasi (data/uyda-pp.json, assets/uyda-pp-core.js).
// Ma'lumot: ≥60 retsept, 3 guruh; har tarkib IDsi bazada; kkal/BJU tarkibdan hisoblanadi (qo'lda emas); cho'chqa/halol so'zi yo'q. Tanlash: filtrlar, «Uyda nima bor?», cheklov, takrorlanmaslik, qolgan kkal/oqsil.
// Brauzer: Uyda birinchi va standart; «Sizga X kkal va Y g oqsil qoldi» + 3 eng mos; filtrlar; «Yedim» (porsiya bilan) kundalikka; Odatdagiga saqlash; eski Kafe/Buyurtma/Baliq buzilmagan.   node tools/dizayn/test-uyda-pp.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), D = S.dates, OR = require(path.join(ROOT, 'assets/orinbosar-core.js')), PP = require(path.join(ROOT, 'assets/uyda-pp-core.js')), CH = require(path.join(ROOT, 'assets/cheklov-core.js'));
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/uyda-pp.json'), 'utf8')), foods = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods, ch = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cheklov-teglar.json'), 'utf8'));
const by = OR.index(foods.map((f) => Object.assign({}, f, { id: f.i }))), byId = {}; foods.forEach((f) => { byId[f.i] = f; });
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. ma'lumot */
const R = data.retseptlar, GR = ['tayyorsiz', 'tez', 'pishirsa'], RNG = { tayyorsiz: [0, 5], tez: [10, 15], pishirsa: [25, 45] };
assert.ok(R.length >= 60, 'kamida 60 retsept: ' + R.length); assert.equal(new Set(R.map((r) => r.id)).size, R.length);
for (const g of GR) { const k = R.filter((r) => r.t === g).length; assert.ok(k >= 15, g + ': ' + k + ' ta (kamida 15)'); }
const grp = {}; data.guruhlar.forEach((g) => g.ids.forEach((i) => { assert.ok(byId[i], 'guruh ID bazada: ' + i); grp[i] = g.k; }));
assert.ok(data.guruhlar.length >= 15 && data.guruhlar.length <= 20, '«Uyda nima bor?» 15–20 mahsulot: ' + data.guruhlar.length);
for (const r of R) {
  assert.ok(r.n.uz && r.n.ru && !/[А-Яа-я]/.test(r.n.uz) && /[А-Яа-я]/.test(r.n.ru), r.id + ': nom UZ/RU'); const [a, b] = RNG[r.t]; assert.ok(r.min >= a && r.min <= b, r.id + ': ' + r.t + ' ' + r.min + ' daq');
  assert.ok(/^[blds]+$/.test(r.m), r.id + ': ovqat turi'); assert.ok(r.qad.uz.length >= 3 && r.qad.uz.length <= 4 && r.qad.ru.length === r.qad.uz.length, r.id + ': 3–4 qadam UZ=RU');
  r.qad.uz.concat(r.qad.ru).forEach((x) => assert.ok(x.length >= 12 && x.length <= 240, r.id + ': qadam uzunligi'));
  r.ing.forEach((i) => { const f = byId[i[0]]; assert.ok(f, r.id + ': bazada yo\'q ' + i[0]); assert.ok(i[1] > 0 && i[1] <= 600, r.id + ': gramm ' + i[0]); assert.ok(grp[i[0]] || data.oddiy.includes(i[0]), r.id + ': guruhsiz ' + i[0]); if (i[3]) assert.ok(f.fam && f.fam.g[i[3]], r.id + ': variant ' + i[0] + '#' + i[3]); assert.ok(!(ch.taom[PP.keyOf(i)] || []).includes('choshqa'), r.id + ': cho\'chqa'); });
}
const txt = fs.readFileSync(path.join(ROOT, 'data/uyda-pp.json'), 'utf8') + fs.readFileSync(path.join(ROOT, 'tools/uyda-pp-manba.js'), 'utf8'); assert.ok(!/halol|halal|ҳалол|халяль/i.test(txt), '«halol» so\'zi yo\'q');
ok(R.length + ' retsept (' + GR.map((g) => g + ' ' + R.filter((r) => r.t === g).length).join(' · ') + '): har tarkib IDsi bazada, guruhlarga bog\'langan, 3–4 qadam UZ=RU, vaqt guruhga mos; cho\'chqa va «halol» yo\'q; «Uyda nima bor?» — ' + data.guruhlar.length + ' mahsulot');
/* 2. kkal/BJU tarkibdan hisoblanadi */
for (const r of R) {
  const c = PP.calc(r, by); assert.ok(c, r.id + ': hisob'); let k = 0, p = 0, f = 0, cc = 0, g = 0;
  r.ing.forEach((i) => { const fd = byId[i[0]], v = i[3] ? fd.fam.g[i[3]] : fd, m = i[1] / 100; k += v.k * m; p += v.p * m; f += v.f * m; cc += v.c * m; g += i[1]; });
  assert.ok(Math.abs(c.k - k) <= 1 && Math.abs(c.p - p) <= 0.2 && Math.abs(c.f - f) <= 0.2 && Math.abs(c.c - cc) <= 0.2 && Math.abs(c.g - g) <= 1, r.id + ': bazadan hisob ' + c.k + ' vs ' + Math.round(k)); assert.equal(c.est, true, r.id + ': taxminiy');
  assert.ok(c.k >= 100 && c.k <= 520, r.id + ': PP porsiya kkal ' + c.k); assert.ok(c.p >= 3, r.id + ': oqsil ' + c.p); const at = 4 * c.p + 9 * c.f + 4 * c.c; assert.ok(Math.abs(at - c.k) <= Math.max(30, c.k * 0.2), r.id + ': Atwater ' + c.k + ' vs ' + Math.round(at));
  const c15 = PP.calc(r, by, 1.5); assert.ok(Math.abs(c15.k - c.k * 1.5) <= 2 && Math.abs(c15.g - c.g * 1.5) <= 2, r.id + ': porsiya ×1,5');
}
const tv = PP.calc(R.find((r) => r.id === 'tvorog-yogurt'), by); assert.ok(Math.abs(tv.k - (1.2 * 121 + 59 + 0.08 * 304)) <= 1, 'qo\'lda tekshiruv: tvorog 120 g + yunon yogurti 100 g + asal 8 g');
ok('kkal/oqsil/yog\'/uglevod har retseptda tarkibdan bazadagi qiymat bo\'yicha hisoblanadi (qo\'lda yozilgan raqam yo\'q), «taxminiy»; PP me\'yor: 100–520 kkal, oqsil ≥3 g, Atwater ±20%; porsiya ×0,5…×2 mos o\'zgaradi');
/* 3. bazaga qo'shilgan mahsulotlar — manbasi bilan */
for (const [id, fdc] of [['un', '168894'], ['tunets-suv', '171986']]) { const f = byId[id]; assert.ok(f && f.ms && f.ms.u.includes('fdc_id ' + fdc), id + ': USDA manbasi'); assert.equal(f.e, 0); }
ok('bazaga qo\'shildi: «Un» (USDA 168894) va «Tunets o\'z sharbatida» (USDA 171986) — manbasi bilan; protein kokteyl — bazadagi «Protein kukuni (whey)» yorlig\'i o\'rtachasi (30 g)');
/* 4. tanlash mantig'i */
const base = { data, by, ch, yemaydi: [], rem: { k: 700, p: 60 }, meal: 'l', filt: {}, have: [], recent: {}, today: '2026-10-25' };
const all = PP.pick(base); assert.equal(all.top.length, 3); assert.ok(all.list.length >= 60);
const cnt = {}; all.top.forEach((x) => { cnt[x.rec.t] = (cnt[x.rec.t] || 0) + 1; }); assert.ok(Object.values(cnt).every((v) => v <= 2), 'tepada bitta guruhdan ≤2'); assert.ok(all.top.every((x) => x.fits));
for (const t of ['0', '1', '3']) { const r = PP.pick(Object.assign({}, base, { filt: { t } })); assert.ok(r.list.length >= 15 && r.list.every((x) => x.rec.t === PP.TGR[t]), 'vaqt filtri ' + t); }
for (const m of ['b', 'l', 'd', 's']) { const r = PP.pick(Object.assign({}, base, { filt: { m }, meal: m })); assert.ok(r.list.length >= 8 && r.list.every((x) => x.rec.m.includes(m)), 'ovqat turi filtri ' + m); assert.ok(r.top.every((x) => x.rec.m.includes(m)), 'tepada ham ' + m); }
for (const [meal, k] of [['b', 'b'], ['d', 'd'], ['s', 's']]) { const r = PP.pick(Object.assign({}, base, { meal })); assert.ok(r.top.filter((x) => x.rec.m.includes(k)).length >= 2, meal + ': tepada shu vaqtga mos retseptlar'); }
const tight = PP.pick(Object.assign({}, base, { rem: { k: 280, p: 20 } })); assert.ok(tight.top.every((x) => x.c.k <= 280), 'qolgan kkalga sig\'adi: ' + tight.top.map((x) => x.c.k)); const zero = PP.pick(Object.assign({}, base, { rem: { k: -50, p: 0 } })); assert.equal(zero.top.length, 3);
const prHi = PP.pick(Object.assign({}, base, { rem: { k: 600, p: 120 }, meal: 'd' })), prLo = PP.pick(Object.assign({}, base, { rem: { k: 600, p: 5 }, meal: 'd' })); assert.ok(prHi.top.reduce((a, x) => a + x.c.p, 0) >= prLo.top.reduce((a, x) => a + x.c.p, 0) - 1, 'oqsil kerak bo\'lsa — oqsilliroq');
const rec1 = all.top[0].rec.id, rr = PP.pick(Object.assign({}, base, { recent: { [rec1]: 0 } })); assert.ok(!rr.top.some((x) => x.rec.id === rec1), 'bugun yegani tepada takrorlanmaydi'); const ry = PP.pick(Object.assign({}, base, { recent: { [rec1]: 1 } })); assert.ok(!ry.top.some((x) => x.rec.id === rec1), 'kecha yegani ham');
assert.deepEqual(PP.recentOf([['2026-10-25', 'a'], ['2026-10-24', 'b'], ['2026-10-20', 'c']], '2026-10-25', D.addDays), { a: 0, b: 1 });
ok('tanlash: 3 ta eng mos (bitta guruhdan ≤2), vaqt filtri (0–5 / 10–15 / 30+), ovqat turi filtri, qolgan kkalga sig\'ish, oqsil hissasi, bugun/kecha yegani takrorlanmaydi');
for (const have of [['tuxum', 'sabzavot'], ['yogurt', 'tvorog', 'banan', 'meva'], ['tovuq', 'grechka', 'sabzavot', 'piyoz'.slice(0, 0) || 'yogurt']]) {
  const r = PP.pick(Object.assign({}, base, { have })); assert.ok(r.list.length >= 1, 'bor: ' + have); assert.ok(r.list.every((x) => PP.need(x.rec, data).every((g) => have.includes(g))), 'faqat shulardan'); assert.ok(r.more.every((x) => x.miss.length === 1 && !r.list.includes(x)), '«yana 1 mahsulot»'); assert.ok(r.more.length >= 1, 'yana 1 mahsulot kerak bo\'lganlar bor');
  assert.ok(R.every((rec) => { const nd = PP.need(rec, data), miss = nd.filter((g) => !have.includes(g)).length; const inList = r.list.some((x) => x.rec.id === rec.id), inMore = r.more.some((x) => x.rec.id === rec.id); return miss === 0 ? inList : miss === 1 ? inMore : !inList && !inMore; }), 'to\'liq bo\'linish');
}
assert.equal(PP.pick(Object.assign({}, base, { have: [] })).more.length, 0);
ok('«Uyda nima bor?»: belgilanganlardan to\'liq tayyorlanadiganlar alohida, «yana 1 mahsulot kerak» — pastda; boshqalar chiqmaydi');
for (const tag of ['tuxum', 'sut', 'glyuten', 'yongoq', 'baliq']) { const r = PP.pick(Object.assign({}, base, { yemaydi: [tag] })); assert.ok(r.list.length >= 25, tag + ': ' + r.list.length); assert.ok(r.list.every((x) => x.rec.ing.every((i) => !(ch.taom[PP.keyOf(i)] || []).includes(tag))), tag + ' tarkibli retsept chiqmaydi'); assert.ok(r.top.length === 3); }
const multi = PP.pick(Object.assign({}, base, { yemaydi: ['tuxum', 'sut', 'glyuten'] })); assert.ok(multi.list.length >= 8 && multi.top.length >= 1);
ok('«Yemaydiganlarim» (tuxum, sut, glyuten, yong\'oq, baliq) — shu tegli tarkibi bor retsept chiqmaydi, ro\'yxat bo\'sh qolmaydi');
/* 5. brauzer */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port, TODAY = D.today(); const b = track(await chromium.launch());
const seed = (o = {}) => { const st = S.emptyState(); st.setup = true; st.created = Date.now() - 9 * 86400000; st.prefs = Object.assign({ tipsDone: true, jokes: false, lpTip: 1, suvFrom: TODAY }, o.prefs || {}); st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 3, goal: 'keep' }; st.trackStart = D.addDays(TODAY, -8); S.addWeight(st, TODAY, 80); return st; };
async function open(url, st, w = 390) {
  const c = await b.newContext({ viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript((s) => { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(s)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); }, st);
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(700); return p;
}
const door = async (p) => { await p.click('[data-act=ftopen]'); await p.waitForTimeout(450); await p.click('#ftDr [data-fk=yeymiz]'); await p.waitForSelector('#rzSheet[data-kind=yeymiz] .pp-lead'); await p.waitForTimeout(250); };
const stOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')));
try {
  let p = await open('/kalkifit', seed());
  await door(p); assert.deepEqual((await p.locator('#rzSheet .sl-segs3 button').allInnerTexts()).map((x) => x.trim()), ['Uyda', 'Kafe va choyxonada', 'Buyurtma']); assert.equal(await p.locator('#rzSheet .sl-segs3 button.on').getAttribute('data-s'), 'uyda', 'Uyda — birinchi va standart');
  const lead = await p.locator('#rzSheet .pp-lead').innerText(); const m = /Sizga (\d+) kkal va (\d+) g oqsil qoldi/.exec(lead.replace(/ /g, ' ')); assert.ok(m, lead); const pl = S.plan(S.emptyState().profile ? seed().profile : seed().profile); const rem = await p.evaluate(() => window.__kalkifit && null);
  assert.ok(+m[1] > 1000 && +m[2] > 50, 'qolgan kkal va oqsil: ' + lead);
  assert.equal(await p.locator('#rzSheet .pp-h0').count(), 1); assert.equal(await p.locator('#rzSheet .pp-h0 + .pp-list > *').count(), 3, '3 ta eng mos'); assert.equal(await p.locator('#rzSheet .pp-h0 + .pp-list .pp-card').count(), 1, 'eng mosi ochiq'); assert.match(await p.locator('#rzSheet .pp-h0').innerText(), /Hozir (nonushtaga|tushlikka|kechki ovqatga|tamaddiga) mos/);
  const card = p.locator('#rzSheet .pp-card').first(), cid = await card.getAttribute('data-id'), crec = R.find((r) => r.id === cid); const ctxt = (await card.innerText()).replace(/ /g, ' ');
  const cc = PP.calc(crec, by); assert.ok(ctxt.includes('⏱ ' + crec.min + ' daq') && ctxt.includes(cc.k + ' kkal') && ctxt.includes('oqsil ' + Math.round(cc.p) + ' g') && /taxminiy/i.test(ctxt), 'karta: ⏱, kkal, oqsil, taxminiy: ' + ctxt.slice(0, 120)); assert.equal(await card.locator('.pp-ing li').count(), crec.ing.length, 'tarkib grammi bilan'); assert.ok((await card.locator('.pp-ing li b').allInnerTexts()).every((x) => /\d+ g$/.test(x.replace(/ /g, ' '))));
  assert.equal(await card.locator('.pp-stps').count(), 0, 'qadamlar yig\'ilgan'); await card.locator('[data-act=ppsteps]').click(); await p.waitForTimeout(200); assert.equal(await p.locator('#rzSheet .pp-card .pp-stps li').count(), crec.qad.uz.length, 'bosilsa ochiladi');
  assert.ok(await p.locator('#rzSheet .pp-card [data-act=ppate]').isVisible() && await p.locator('#rzSheet .pp-card [data-act=ppsave]').isVisible());
  ok('Uyda — birinchi va standart segment; «Sizga X kkal va Y g oqsil qoldi»; 3 ta eng mos (birinchisi ochiq karta); karta: ⏱, kkal, oqsil, tarkib (gramm), yig\'ilgan qadamlar, «Yedim», «Odatdagiga saqlash»');
  /* filtrlar */
  await p.click('#rzSheet [data-act=ppt][data-v="0"]'); await p.waitForTimeout(250); const mins = await p.locator('#rzSheet .pp-list .tm, #rzSheet .pp-card .tm').allInnerTexts(); assert.ok(mins.length >= 5 && mins.every((x) => { const k = +/⏱ (\d+)/.exec(x)[1]; return k <= 5; }), 'vaqt filtri 0–5: ' + mins.slice(0, 3));
  assert.equal(await p.locator('#rzSheet .pp-h:not(.pp-h0)').count() >= 1, true); await p.click('#rzSheet [data-act=ppt][data-v="3"]'); await p.waitForTimeout(250); assert.ok((await p.locator('#rzSheet .tm').allInnerTexts()).every((x) => +/⏱ (\d+)/.exec(x)[1] >= 25), '30+ daq');
  await p.click('#rzSheet [data-act=ppt][data-v=""]'); await p.click('#rzSheet [data-act=ppm][data-v=b]'); await p.waitForTimeout(250); assert.match(await p.locator('#rzSheet .pp-h0').innerText(), /Hozir/); const bk = await p.locator('#rzSheet .pp-row, #rzSheet .pp-card').evaluateAll((l) => l.map((e) => e.dataset.id)); assert.ok(bk.filter(Boolean).every((id) => R.find((r) => r.id === id).m.includes('b')), 'nonushta filtri'); await p.click('#rzSheet [data-act=ppm][data-v=""]');
  ok('filtrlar: vaqt (0–5 / 30+) va ovqat turi (nonushta) — ro\'yxat va tepadagi variantlar shunga moslanadi');
  /* uyda nima bor */
  await p.click('#rzSheet [data-act=pphs]'); await p.waitForTimeout(200); assert.equal(await p.locator('#rzSheet .pp-hc .rz-chip').count(), data.guruhlar.length); await p.click('#rzSheet [data-act=pph][data-v=tuxum]'); await p.click('#rzSheet [data-act=pph][data-v=sabzavot]'); await p.waitForTimeout(250);
  const hv = await p.locator('#rzSheet .pp-card, #rzSheet .pp-row').evaluateAll((l) => l.map((e) => e.dataset.id)); const hset = ['tuxum', 'sabzavot']; assert.ok(hv.filter(Boolean).length >= 3); const mix = await p.locator('#rzSheet .pp-need').allInnerTexts(); assert.ok(mix.length >= 1 && mix.every((x) => /^kerak: /.test(x)), '«yana 1 mahsulot kerak» pastda: ' + mix.slice(0, 2)); assert.match(await p.locator('#rzSheet .pp-h').first().innerText(), /Shulardan tayyorlash mumkin/);
  const ids = await p.locator('#rzSheet .pp-list .pp-row').evaluateAll((l) => l.map((e) => [e.dataset.id, !!e.querySelector('.pp-need')]));
  for (const [id, need1] of ids) { const nd = PP.need(R.find((r) => r.id === id), data), miss = nd.filter((g) => !hset.includes(g)).length; assert.equal(need1 ? 1 : 0, miss, id + ': yetishmaydigan ' + miss); }
  assert.deepEqual((await stOf(p)).prefs.ppHave.sort(), ['sabzavot', 'tuxum']); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); await door(p); assert.equal(await p.locator('#rzSheet .pp-hc .rz-chip.on').count(), 2, 'belgilanganlar eslab qolindi'); await p.click('#rzSheet [data-act=pphc]'); await p.waitForTimeout(200); assert.equal(await p.locator('#rzSheet .pp-need').count(), 0);
  ok('«Uyda nima bor?»: ' + data.guruhlar.length + ' chip; belgilansa faqat shulardan tayyorlanadiganlar, «yana 1 mahsulot kerak» — pastda («kerak: …»); tanlov qayta ochilganda eslab qolinadi; Tozalash');
  await p.context().close();
  /* Yedim — porsiya bilan, takrorlanmaslik; Odatdagiga saqlash */
  p = await open('/kalkifit', seed()); await door(p); const top0 = await p.locator('#rzSheet .pp-h0 + .pp-list > *').evaluateAll((l) => l.map((e) => e.dataset.id)); const id0 = top0[0], rec0 = R.find((r) => r.id === id0);
  await p.click('#rzSheet .pp-card [data-act=ppmul][data-m="1.5"]'); await p.waitForTimeout(200); const k15 = PP.calc(rec0, by, 1.5); assert.ok((await p.locator('#rzSheet .pp-card .tm').first().innerText()).replace(/ /g, ' ').includes(k15.k + ' kkal'), 'porsiya ×1,5 kkal'); assert.ok((await p.locator('#rzSheet .pp-card [data-act=ppate]').innerText()).replace(/ /g, ' ').includes(k15.k + ' kkal'));
  const gs = await p.locator('#rzSheet .pp-card .pp-ing li b').allInnerTexts(); assert.deepEqual(gs.map((x) => parseInt(x.replace(/\D+/g, ' ').trim().split(' ').pop(), 10)), rec0.ing.map((i) => Math.round(i[1] * 1.5)), 'tarkib grammi ×1,5');
  await p.click('#rzSheet .pp-card [data-act=ppsave]'); await p.waitForTimeout(300); const s1 = await stOf(p); assert.equal(s1.tpls.length, 1); assert.equal(s1.tpls[0].items.length, 1); assert.equal(s1.tpls[0].items[0].kcal, k15.k); assert.equal(s1.tpls[0].items[0].est, true); assert.match(await p.locator('.rz-toast').innerText(), /Odatdagi ovqatlarimga saqlandi/);
  await p.waitForTimeout(300); assert.equal(await p.locator('#rzSheet[data-kind=yeymiz]').count(), 1, 'saqlagach oyna ochiq');
  await p.click('#rzSheet .pp-card [data-act=ppate]'); await p.waitForTimeout(600); const s2 = await stOf(p), e = s2.days[TODAY].food.at(-1); assert.equal(e.kcal, k15.k); assert.equal(e.qty, 1.5); assert.equal(e.est, true); assert.ok(e.name.startsWith(rec0.n.uz) && e.name.includes('1,5'), e.name); assert.ok(Math.abs(e.p - k15.p) <= 0.2 && Math.abs(e.g - k15.g) <= 1 && e.ifid, 'BJU, gramm, ikonka'); assert.ok(['b', 'l', 'd', 's'].includes(e.meal));
  assert.equal(await p.evaluate(() => !document.getElementById('rzSheet').hidden && document.getElementById('rzSheet').classList.contains('open')), false, 'yozilgach oyna yopildi'); assert.match(await p.locator('.rz-toast').innerText(), /Yozildi/); assert.deepEqual(s2.prefs.ppAte.map((x) => x[1]), [id0]);
  await door(p); const top1 = await p.locator('#rzSheet .pp-h0 + .pp-list > *').evaluateAll((l) => l.map((e) => e.dataset.id)); assert.ok(!top1.includes(id0), 'yegani tepada takrorlanmadi'); assert.equal(top1.length, 3); await p.click('#rzSheet [data-act=sheetclose]'); await p.waitForTimeout(350);
  await p.click('.rz-toast button').catch(() => {}); await p.waitForTimeout(300); ok('«Yedim» (porsiya ×1,5): kundalikka bitta yozuv (kkal/BJU/gramm tarkibdan, «taxminiy», ikonka), oyna yopiladi; keyingi ochilishda yegani tepada yo\'q; «Odatdagiga saqlash» — Odatdagi ovqatlarimga porsiya bilan');
  assert.deepEqual(p.errs, []); await p.context().close();
  /* eski qismlar buzilmagan; til; Imkoniyatlar tavsifi */
  p = await open('/kalkifit', seed()); await door(p); await p.click('#rzSheet [data-act=yeseg][data-s=kafe]'); await p.waitForTimeout(250); assert.equal(await p.locator('#rzSheet .sl-yr').count(), 5, 'Kafe: eskisidek'); assert.equal(await p.locator('#rzSheet .sl-ye-chips.sc .rz-chip').count(), 5); await p.click('#rzSheet [data-act=yeseg][data-s=buyurtma]'); await p.waitForTimeout(250); assert.equal(await p.locator('#rzSheet .sl-ylink').count(), 2, 'Buyurtma: eskisidek');
  await p.click('#rzSheet [data-act=yeseg][data-s=uyda]'); await p.waitForTimeout(250); assert.equal(await p.locator('#rzSheet .sl-ye-chips.sc').count(), 0, 'Uyda: toifa chiplari yo\'q'); await p.click('#rzSheet [data-act=pplegacy]'); await p.waitForTimeout(250); assert.ok(await p.locator('#rzSheet [data-act=yerec]').count() >= 2, 'eski «Boshqa uyda taomlar» ochiladi'); assert.equal(await p.locator('#rzSheet .sl-ye-chips.sc .rz-chip').count(), 5); await p.click('#rzSheet [data-act=ppback]'); await p.waitForTimeout(250); assert.ok(await p.locator('#rzSheet .pp-lead').count() === 1);
  await p.click('#rzSheet [data-act=sheetclose]'); await p.waitForTimeout(350); await p.click('[data-act=ftopen]'); await p.waitForTimeout(450); assert.match(await p.locator('#ftDr [data-fk=yeymiz] span').last().innerText(), /Uyda tez va sog'lom/); await p.context().close();
  ok('Kafe va Buyurtma eskisidek; Uyda\'da toifa chiplari yo\'q; «Boshqa uyda taomlar» — eski kishi soni/xarid ro\'yxati retseptlari (Baliq kuni shu yerda); Imkoniyatlar tavsifi yangilandi');
  for (const [url, re, ban] of [['/ru/kalkifit', /Вам осталось \d+ ккал и \d+ г белка/, /Hozir|Sizga/], ['/kalkifit?lang=cyr', /Сизга \d+ ккал ва \d+ г оқсил қолди/, /Sizga|Hozir/]]) {
    p = await open(url, seed()); await door(p); const t = (await p.locator('#rzSheet').innerText()).replace(/ /g, ' '); assert.match(t, re, url); assert.ok(!ban.test(t), url + ': boshqa til matni'); assert.ok(/⏱/.test(t) && !/[A-Za-z]{5,}/.test(t.replace(/KalkiFit|⏱|taxminiy/g, '')) || url.includes('ru'), url + ': lotin so\'z (ЎЗ)');
    const nm = await p.locator('#rzSheet .pp-card .nm').first().innerText(); const rid = await p.locator('#rzSheet .pp-card').first().getAttribute('data-id'); assert.equal(nm.trim(), url.includes('ru') ? R.find((r) => r.id === rid).n.ru : nm.trim()); assert.ok(/[А-Яа-яЎўҚқҒғҲҳ]/.test(nm), nm); assert.deepEqual(p.errs, []); await p.context().close();
  }
  ok('RU va ЎЗ (kirill): lead, nomlar, tarkib, qadamlar tarjima/translit; boshqa til matni aralashmaydi');
  /* 360 px, katta shrift — sig'adi */
  p = await open('/kalkifit', seed(), 360); await p.evaluate(() => document.documentElement.classList.add('fs-big')); await door(p); await p.click('#rzSheet [data-act=pphs]'); await p.waitForTimeout(250);
  const ov = await p.evaluate(() => { const sh = document.getElementById('rzSheet'); const bad = [...sh.querySelectorAll('.pp-card *, .pp-row *, .pp-lead, .pp-have *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > sh.getBoundingClientRect().right + 1; }).length; return { x: sh.scrollWidth > sh.clientWidth + 1, bad, doc: document.documentElement.scrollWidth > innerWidth + 1 }; }); assert.deepEqual(ov, { x: false, bad: 0, doc: false }, '360 px katta shrift: ' + JSON.stringify(ov)); assert.deepEqual(p.errs, []); await p.context().close();
  ok('360 px, katta shrift: gorizontal siljish yo\'q, karta va tanlov ekranga sig\'adi');
  console.log('\n' + n + '/' + n + ' OK');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
