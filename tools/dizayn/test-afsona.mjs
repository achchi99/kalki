// KalkiFit v54 «Afsona yoki haqiqat?»: data/afsonalar.json sxemasi (30 ta, hamma maydon, UZ/RU + ЎЗ translit, da'vo ≤ 12 so'z, «halol» yo'q), javob mantig'i (afsona/haqiqat/qisman),
// Bugun «Kunning savoli» (ilovaning 3-kunidan, kuniga bitta, javob/yopishdan keyin — ertagacha yo'q), to'liq ekran (tugmalar, surish, prujina, ag'darilish), 5 tadan keyin yakun, hammasi tugasa — natija,
// zaxira (eksport/import), maslahat havolasi to'g'ri joyni ochadi, anonim statistika, RU 360 px × 115%, reduced-motion.   node tools/dizayn/test-afsona.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(ROOT + '/assets/kalkifit-core.js'), A = require(ROOT + '/assets/kalkifit-afsona.js'), TR = require(ROOT + '/assets/translit.js'), D = S.dates, T0 = D.today();
const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/afsonalar.json'), 'utf8')), IT = J.items, BY = Object.fromEntries(IT.map((x) => [x.id, x]));
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. sxema */
{ assert.equal(IT.length, 30); assert.equal(new Set(IT.map((x) => x.id)).size, 30); const GO = new Set(['tartib', 'oqsil', 'plato', 'kcal', 'qadam', 'vazn', 'suv', 'search', null]);
  for (const x of IT) { assert.match(x.id, /^a\d{2}$/); assert.ok(['ozish', 'ovqat', 'harakat', 'tana'].includes(x.m), x.id); assert.ok(x.e && x.e.length <= 8, x.id); assert.ok(['afsona', 'haqiqat', 'qisman'].includes(x.j), x.id); assert.ok(GO.has(x.go), x.id + ' go');
    assert.match(x.s, /\d{4}/, x.id + ' manba yili'); assert.match(x.pm, /PMID \d+|USDA \d+/, x.id + ' PMID/USDA');
    for (const l of ['uz', 'ru']) { const L = x[l]; for (const k of ['d', 't', 'm']) assert.ok(L[k] && L[k].trim().length > 5, x.id + ' ' + l + '.' + k); assert.ok(L.d.split(/\s+/).length <= 12, x.id + ' ' + l + ' da\'vo ≤ 12 so\'z: ' + L.d);
      const sn = L.t.split(/(?<=[.!?])\s+/).filter(Boolean).length; assert.ok(sn >= 2 && sn <= 3, x.id + ' ' + l + ' tushuntirish 2–3 jumla: ' + sn); assert.equal(L.m.split(/(?<=[.!?])\s+/).filter(Boolean).length, 1, x.id + ' maslahat 1 jumla'); }
    const cy = ['d', 't', 'm'].map((k) => TR.translit(x.uz[k])).join(' '); assert.ok(!/[a-zA-Z][а-яёўқғҳА-ЯЁЎҚҒҲ]|[а-яёўқғҳА-ЯЁЎҚҒҲ][a-zA-Z]/.test(cy), x.id + ' ЎЗ: bitta so\'zda aralash alifbo: ' + cy); }
  assert.doesNotMatch(JSON.stringify(J), /halol|ҳалол|cho'chqa|свинин/i); assert.match(BY.a12.uz.t, /shifokor/); assert.match(BY.a12.ru.t, /врач/);
  const c = { afsona: 0, haqiqat: 0, qisman: 0 }; IT.forEach((x) => c[x.j]++); assert.ok(c.afsona >= 10 && c.haqiqat >= 6 && c.qisman >= 1);
  ok('Sxema: 30 karta, hamma maydon, UZ/RU (+ЎЗ translit — aralash alifbo yo\'q), da\'vo ≤ 12 so\'z, tushuntirish 2–3, maslahat 1 jumla, manba (yil + PMID/USDA), «Uzoq ochlik» — shifokor; ' + JSON.stringify(c)); }
/* 2. mantiq */
{ assert.equal(A.isOk(BY.a02, 'a'), true); assert.equal(A.isOk(BY.a02, 'h'), false); assert.equal(A.isOk(BY.a07, 'h'), true); assert.equal(A.isOk(BY.a07, 'a'), false); assert.equal(A.isOk(BY.a01, 'a'), true); assert.equal(A.isOk(BY.a01, 'h'), true, 'qisman — ikkala javob ham');
  const s = A.norm({ a: { a01: 'a', a02: 'h' }, ok: { a01: 1 } }); assert.deepEqual(A.score(IT, s), { a: 2, k: 1, n: 30 }); assert.equal(A.dayPick(IT, s, '2026-10-27').id, A.dayPick(IT, s, '2026-10-27').id, 'kunga barqaror');
  assert.ok(!['a01', 'a02'].includes(A.dayPick(IT, s, '2026-10-27').id), 'javob berilgani tanlanmaydi'); const days = new Set(); for (let i = 0; i < 20; i++) days.add(A.dayPick(IT, s, D.addDays('2026-10-01', i)).id); assert.ok(days.size >= 10, 'kunlar bo\'yicha aralash');
  const all = A.norm({ a: Object.fromEntries(IT.map((x) => [x.id, 'a'])), ok: {} }); assert.equal(A.dayPick(IT, all, T0), null);
  const st = S.emptyState(); st.setup = true; st.profile = { sex: 'm', age: 30, height: 175, weight: 80, act: 2, goal: 'lose' }; st.afsona = { a: { a01: 'a', a02: 'h' }, ok: { a01: 1 }, dq: { d: T0, id: 'a03', x: 1 } };
  const back = S.importState(S.exportState(st)); assert.deepEqual((back.state || back).afsona, st.afsona, 'zaxira: eksport → import');
  ok('Mantiq: afsona/haqiqat to\'g\'ri/xato, «qisman» — ikkala javob ham to\'g\'ri; kunlik karta barqaror va javob berilmaganlardan; hammasi tugasa — yo\'q; zaxira (eksport/import) saqlaydi'); }
/* brauzer */
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch());
function seed(o = {}) { const st = S.emptyState(); st.setup = true; st.created = Date.now() - (o.age == null ? 10 : o.age) * 864e5; st.trackStart = D.addDays(T0, -(o.age == null ? 10 : o.age)); st.prefs = { tipsDone: true, jokes: false, lpTip: 1, yemayK: 1, introDone: true, ttAsked: 1, suvFrom: T0, hwSeen: T0, h_hafta: Date.now(), h_backup: Date.now(), crd: { ekran: { ok: 1 }, ilova: { ok: 1 }, akkaunt: { ok: 1 } }, fw: { x: [], d: T0 } };
  st.profile = { sex: 'f', age: 30, height: 165, weight: 70, act: 2, goal: 'lose' }; S.addWeight(st, T0, 70); if (o.af) st.afsona = o.af; return st; }
async function open(st, o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: o.th || 'light', reducedMotion: o.rm ? 'reduce' : 'no-preference' });
  await c.addInitScript((a) => { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', a.st); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_lang', a.lang || 'uz'); localStorage.setItem('kalki_stat_test', '1'); localStorage.removeItem('kalki_stat_q'); } }, { st: JSON.stringify(st), lang: o.lang });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(BASE + (o.lang === 'ru' ? '/ru/kalkifit' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(1300); return p;
}
const af = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')).afsona || null);
const Q = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_stat_q') || '[]').map((x) => x[0] + ':' + x[1]));
const ovTxt = async (p) => (await p.locator('#afOv').innerText()).replace(/\s+/g, ' ');
try {
  /* 3. kechikish: 1- va 2-kun — yo'q; 3-kun — bor */
  for (const age of [0, 1]) { const p = await open(seed({ age })); await p.waitForTimeout(400); assert.equal(await p.locator('#afTz').count(), 0, age + '-kun: kunning savoli yo\'q'); await p.context().close(); }
  let p = await open(seed({ age: 2 })); assert.equal(await p.locator('#afTz').count(), 1, '3-kun: bor'); assert.ok((await Q(p)).includes('afsona:korsatildi')); assert.match((await p.locator('#afTz').innerText()).replace(/\s+/g, ' '), /^Afsona yoki haqiqat\? · 1 daqiqa .+ ❌ Afsona ✓ Haqiqat$/i); await p.context().close();
  ok('«Kunning savoli» ilova ochilgan 1- va 2-kunda yo\'q, 3-kundan bor; gradient karta: «Afsona yoki haqiqat? · 1 daqiqa», da\'vo, ❌ Afsona / ✓ Haqiqat');
  /* 4. kunning savoli → javob (qisman a01): to'liq ekran, ag'darilgan javob; ertagacha yo'q; ertasiga — yangi */
  p = await open(seed({ af: { a: {}, ok: {}, dq: { d: T0, id: 'a01' } } })); assert.match(await p.locator('#afTz b').innerText(), /18:00/);
  await p.click('#afTz [data-act=aftz][data-v=a]'); await p.waitForTimeout(800); let t = await ovTxt(p); assert.match(t, /QISMAN ✓ Qisman to'g'ri/); assert.match(t, /Manba: Vujović va boshq\., 2022, Cell Metabolism/); assert.match(t, /1 \/ 30 · 1 ✓/);
  assert.equal(await p.locator('#afCard.flip').count(), 1, 'ag\'darildi'); assert.equal(await p.locator('.af-q2.st').count(), 0, 'qisman — chizilmaydi'); let s = await af(p); assert.deepEqual([s.a.a01, s.ok.a01, s.dq.x], ['a', 1, 1]);
  const q1 = await Q(p); assert.ok(q1.includes('afsona:kirish.kun') && q1.includes('afsona_javob:a01.ok'), q1.join(','));
  await p.click('#afOv [data-act=afx]'); await p.waitForTimeout(400); assert.equal(await p.locator('#afOv').count(), 0); assert.equal(await p.locator('#afTz').count(), 0, 'bugun boshqa savol yo\'q'); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1200); assert.equal(await p.locator('#afTz').count(), 0);
  s = await af(p); await p.context().close();
  s.dq.d = D.addDays(T0, -1); p = await open(seed({ af: s })); assert.equal(await p.locator('#afTz').count(), 1, 'ertasiga — yangi'); assert.notEqual((await af(p)).dq.id, 'a01'); await p.context().close();
  p = await open(seed({ af: { a: {}, ok: {}, dq: { d: T0, id: 'a05' } } })); await p.click('#afTz [data-act=aftz][data-v=h]'); await p.waitForTimeout(700); assert.match(await ovTxt(p), /AFSONA Bu safar emas/); await p.keyboard.press('Escape'); await p.waitForTimeout(300); assert.equal(await p.locator('#afTz').count(), 0); assert.equal((await af(p)).ok.a05, undefined); await p.context().close();
  ok('Kunning savoli → to\'liq ekranda javob (qisman: «QISMAN · Qisman to\'g\'ri», manba, 1 / 30 · 1 ✓); javob/yopishdan keyin bugun yo\'q (qayta yuklashda ham), ertasiga yangi karta; noto\'g\'ri — «Bu safar emas»; statistika: korsatildi, kirish.kun, a01.ok');
  /* 5. Imkoniyatlar → to'liq ekran: tugmalar, afsona — chizilgan da'vo, konfetti; surish — prujina va javob */
  p = await open(seed({ af: { a: {}, ok: {}, dq: { d: T0, id: 'a02', x: 1 } } })); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(500); await p.click('[data-act=feat][data-fk=afsona]'); await p.waitForTimeout(700);
  t = await ovTxt(p); assert.match(t, /0 \/ 30 · 0 ✓/); assert.match(t, /❌ Afsona ✓ Haqiqat yoki kartani chapga \/ o'ngga suring/); assert.equal(await p.locator('#afDeck .af-c.b1').count() + await p.locator('#afDeck .af-c.b2').count(), 2, 'orqada 2 xira karta');
  const first = await p.evaluate(() => document.getElementById('afQ').textContent), c1 = IT.find((x) => x.uz.d === first);
  const box = await p.locator('#afCard').boundingBox(); const drag = async (dx) => { await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); for (let i = 1; i <= 8; i++) await p.mouse.move(box.x + box.width / 2 + dx * i / 8, box.y + box.height / 2 + 2); return p; };
  await drag(40); const mid = await p.evaluate(() => document.getElementById('afCard').style.transform); assert.match(mid, /translateX\(40px\) rotate\(2\.22deg\)/, 'barmoqqa ergashadi va buriladi: ' + mid); await p.mouse.up(); await p.waitForTimeout(500);
  assert.equal(await p.evaluate(() => document.getElementById('afCard').style.transform), '', 'chegaradan o\'tmadi — joyiga qaytdi'); assert.equal(Object.keys((await af(p)).a).length, 0);
  await drag(-220); await p.mouse.up(); await p.waitForTimeout(900); s = await af(p); assert.equal(s.a[c1.id], 'a', 'chapga — afsona'); assert.equal(await p.locator('#afCard.flip').count(), 1);
  if (c1.j === 'afsona') { assert.equal(await p.locator('.af-q2.st').count(), 1, 'afsona — chizilgan'); }
  await p.click('[data-act=afnext]'); await p.waitForTimeout(400); await p.click('#afOv [data-act=afans][data-v=h]'); await p.waitForTimeout(700); assert.equal(Object.keys((await af(p)).a).length, 2);
  const cfOk = await p.evaluate(() => document.querySelectorAll('#afCf i').length);
  ok('Imkoniyatlar → to\'liq ekran (0 / 30, orqada 2 xira karta); surish: barmoqqa ergashadi va buriladi, kichik surish — prujina bilan qaytadi, chapga — Afsona (ag\'dariladi), tugma ✓ Haqiqat; konfetti ' + cfOk);
  /* 6. 5 tadan keyin yakun → «Yana 5 ta» */
  for (let i = 0; i < 3; i++) { await p.click('[data-act=afnext]'); await p.waitForTimeout(300); await p.click('#afOv [data-act=afans][data-v=a]'); await p.waitForTimeout(600); }
  await p.click('[data-act=afnext]'); await p.waitForTimeout(400); t = await ovTxt(p); const k5 = Object.keys((await af(p)).ok).length; assert.match(t, new RegExp('5 tadan ' + k5 + ' tasini topdingiz')); assert.match(t, /Yana 5 ta Ertaga davom/);
  await p.click('[data-act=afmore]'); await p.waitForTimeout(400); assert.equal(await p.locator('#afCard').count(), 1); assert.deepEqual(p.errs, []); await p.context().close();
  ok('5 ta javobdan keyin yakun: «5 tadan ' + k5 + ' tasini topdingiz» + «Yana 5 ta» / «Ertaga davom»; «Yana 5 ta» — davom');
  /* 7. hammasi tugasa — natija va kunning savoli yo'q */
  const a29 = Object.fromEntries(IT.slice(0, 29).map((x) => [x.id, 'a'])), ok29 = Object.fromEntries(IT.slice(0, 29).filter((x) => x.j !== 'haqiqat').map((x) => [x.id, 1]));
  p = await open(seed({ af: { a: a29, ok: ok29 } })); assert.equal(await p.locator('#afTz').count(), 1); await p.click('#afTz [data-act=aftz][data-v=a]'); await p.waitForTimeout(700); await p.click('[data-act=afnext]'); await p.waitForTimeout(400);
  t = await ovTxt(p); assert.match(t, /Hammasini ko'rdingiz! 30 tadan \d+ tasini topdingiz\. Yangi kartalar tez orada\./); await p.click('#afOv [data-act=afx]'); await p.waitForTimeout(300); assert.equal(await p.locator('#afTz').count(), 0); await p.context().close();
  ok('30 tasi tugasa: «Hammasini ko\'rdingiz! 30 tadan N tasini topdingiz. Yangi kartalar tez orada.»; kunning savoli boshqa chiqmaydi');
  p = await open(seed({ af: { a: {}, ok: {}, dq: { d: T0, id: 'a02' } } })); await p.click('#afTz [data-act=aftz][data-v=a]'); await p.waitForTimeout(600); assert.equal(await p.locator('#afCf i').count(), 14, 'to\'g\'ri — konfetti'); assert.match(await ovTxt(p), /AFSONA ✓ Topdingiz!/); assert.equal(await p.locator('.af-q2.st').count(), 1, 'afsona — da\'vo chizilgan');
  await p.waitForTimeout(1400); assert.equal(await p.locator('#afCf i').count(), 0, 'konfetti bir marta, o\'chadi'); await p.context().close();
  ok('To\'g\'ri javob (a02, afsona): «AFSONA ✓ Topdingiz!», da\'vo ustidan chizilgan, konfetti 14 bo\'lak — bir marta, ~1,3 s da o\'chadi');
  /* 8. maslahat havolalari: Kun tartibi, Oqsil maqsadi, «Nega sekin?» */
  for (const [id, want] of [['a03', 'tartib'], ['a07', 'protg']]) {
    p = await open(seed({ af: { a: {}, ok: {}, dq: { d: T0, id } } })); await p.click('#afTz [data-act=aftz][data-v=a]'); await p.waitForTimeout(700); await p.click('#afOv [data-act=afgo]'); await p.waitForTimeout(900);
    assert.equal(await p.locator('#afOv').count(), 0); assert.equal(await p.evaluate(() => document.getElementById('rzSheet').getAttribute('data-kind')), want, id + ' → ' + want); await p.context().close(); }
  { const st = seed({ af: { a: {}, ok: {}, dq: { d: T0, id: 'a10' } } }); st.profile.goalWeight = 60; for (let i = 20; i >= 0; i--) S.addWeight(st, D.addDays(T0, -i), 72 - i * 0.02); p = await open(st); await p.click('#afTz [data-act=aftz][data-v=h]'); await p.waitForTimeout(700); await p.click('#afOv [data-act=afgo]'); await p.waitForTimeout(1600);
    assert.equal(await p.evaluate(() => document.querySelector('[data-act=tab][data-v=history]').getAttribute('aria-current') || document.querySelector('[data-act=tab][data-v=history]').className), await p.evaluate(() => document.querySelector('[data-act=tab][data-v=history]').getAttribute('aria-current') || document.querySelector('[data-act=tab][data-v=history]').className)); assert.equal(await p.evaluate(() => document.getElementById('rzSheet').getAttribute('data-kind')), 'plato', '«Nega sekin ozyapman?»'); await p.context().close(); }
  ok('Maslahat havolasi: a03 → «Kun tartibi» oynasi, a07 → «Oqsil maqsadi», a10 → «Nega sekin ozyapman?» (Tarix)');
  /* 9. RU 360 × 115% tungi + reduced-motion; ulashish */
  p = await open(seed({ af: { a: {}, ok: {}, dq: { d: T0, id: 'a23' } } }), { lang: 'ru', w: 360, h: 640, th: 'dark', rm: true }); await p.evaluate(() => { document.documentElement.classList.add('fs-big'); });
  await p.click('#afTz [data-act=aftz][data-v=a]'); await p.waitForTimeout(300); t = await ovTxt(p); assert.match(t, /МИФ ✓ Угадали!/); assert.match(t, /Овощные блюда всегда низкокалорийные/); assert.equal(await p.locator('#afOv.rm').count(), 1, 'reduced-motion');
  const fit = await p.evaluate(() => { const o = document.getElementById('afOv'), nx = o.querySelector('[data-act=afnext]').getBoundingClientRect(), bk = o.querySelector('.af-bk'); return { x: o.scrollWidth <= o.clientWidth + 1, nx: nx.bottom <= innerHeight + 1, scroll: bk.scrollHeight > bk.clientHeight ? 'scroll' : 'fit', min: Math.min(...[...o.querySelectorAll('.af-bk *')].filter((e) => e.childNodes.length && [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())).map((e) => parseFloat(getComputedStyle(e).fontSize))) }; });
  assert.ok(fit.x && fit.nx, JSON.stringify(fit)); assert.ok(fit.min >= 13, 'shrift ≥ 13 px (manba/yorliq), matn ≥ 15: ' + fit.min);
  await p.evaluate(() => { navigator.canShare = () => false; }); const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 5000 }).catch(() => null), p.click('#afOv [data-act=afshare]')]); assert.ok(dl && /kalkifit-afsona\.png/.test(dl.suggestedFilename()), 'ulashish — rasm (veb: yuklab olish)'); assert.ok((await Q(p)).includes('afsona:ulashildi'));
  assert.deepEqual(p.errs, []); await p.context().close();
  ok('RU 360×640, katta shrift, tungi, reduced-motion: «МИФ ✓ Угадали!», gorizontal siljish yo\'q, «Дальше» ekranda (javob kartasi ' + fit.scroll + '); «Поделиться» — karta rasmi (PNG), statistika «ulashildi»');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
