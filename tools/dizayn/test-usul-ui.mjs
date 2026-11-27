// KalkiFit v107: TAYYORLASH USULI — porsiya oynasida usul chiplari (ko'rinadi, o'raladi), tanlov kkal/BJU ni darhol o'zgartiradi, yozuvda saqlanadi va ro'yxatda
// «Tovuq kotleti · aerogril»; shu taom qayta ochilsa — oxirgi usul eslab qolingan; qidiruvda usul so'zi («tovuq kotlet aerogril», «котлета в аэрогриле») usulni tanlaydi;
// 320 px + katta matnda chiplar o'raladi (gorizontal aylanmaydi, ekrandan chiqmaydi). UZ + RU.   node tools/dizayn/test-usul-ui.mjs
import assert from 'node:assert/strict';
import { server, brauzerlar, open, seed, T0 } from './sigmaslik-yadro.mjs';
const { srv, BASE } = await server(); const B = await brauzerlar(); const br = B.chromium; let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const W = (p, ms = 450) => p.waitForTimeout(ms);
const kc = (p) => p.evaluate(() => +document.getElementById('fdKcal').textContent.replace(/\s/g, ''));
const chips = (p) => p.evaluate(() => [...document.querySelectorAll('#fdUsul .rz-chip')].map((b) => ({ t: b.textContent.trim(), o: b.getAttribute('data-o'), on: b.classList.contains('on') })));
async function search(p, q) { await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); await p.fill('#fdQ', q); await W(p, 700); }
async function pick(p, i = 0) { await p.locator('#fdRes .sl-rw [data-act=pickfood]').nth(i).click(); await W(p, 500); await p.waitForSelector('#fdUsul'); }
try {
  /* 1–3. uz: chiplar, kkal o'zgarishi, saqlash va ro'yxat yorlig'i; qayta ochilganda — eslab qolingan */
  { const p = await open(br, BASE, { w: 390, st: seed({ food: [[T0, 'tuxum', 'b', 150, 12, 10, 1]] }), hour: 13, settle: 500 });
    await search(p, 'tovuq kotleti'); await pick(p); let c = await chips(p);
    assert.deepEqual(c.map((x) => x.o), ['tova', 'duxovka', 'aerogril', 'bug'], 'tovuq kotleti usullari: ' + JSON.stringify(c)); assert.deepEqual(c.filter((x) => x.on).map((x) => x.o), ['tova'], 'standart — tova');
    assert.deepEqual(c.map((x) => x.t), ['Tovada qovurilgan', 'Duxovkada', 'Aerogrilda', "Bug'da"]);
    const k0 = await kc(p), f0 = await p.evaluate(() => +document.getElementById('fdMf').textContent); await p.click('#fdUsul [data-o=aerogril]'); await W(p);
    const k1 = await kc(p), f1 = await p.evaluate(() => +document.getElementById('fdMf').textContent); c = await chips(p);
    assert.ok(k1 < k0 && f1 < f0, 'aerogril — kkal va yog\' kam: ' + k0 + '→' + k1 + ', ' + f0 + '→' + f1); assert.deepEqual(c.filter((x) => x.on).map((x) => x.o), ['aerogril']);
    assert.match(await p.textContent('#fdVar'), /aerogril/, 'sarlavha ostida usul');
    await p.click('#fsave'); await W(p, 600);
    const e = await p.evaluate(() => { const K = window.__kalkifit, l = K.state.days[K.S.dates.today()].food; return l[l.length - 1]; });
    assert.equal(e.fid, 'tovuq-kotlet'); assert.equal(e.vr, 'aerogril', 'yozuvda usul'); assert.equal(Math.round(e.kcal), k1, 'yozuv kkal = oynadagi');
    const row = await p.evaluate(() => { const m = document.querySelector('.sl-meal[data-m=l]'); return (m ? m.innerText : document.getElementById('rzMain').innerText).replace(/\s+/g, ' '); });
    assert.match(row, /Tovuq kotleti[^|]*aerogril/, 'ro\'yxatda «Tovuq kotleti · aerogril»: ' + row.slice(0, 300));
    ok('uz: chiplar (Tovada qovurilgan · Duxovkada · Aerogrilda · Bug\'da), standart tova ' + k0 + ' kkal → aerogril ' + k1 + ' kkal (yog\' ' + f0 + '→' + f1 + ' g); yozuvda vr=aerogril, ro\'yxatda «Tovuq kotleti · aerogril»');
    await search(p, 'tovuq kotleti'); await pick(p); c = await chips(p); assert.deepEqual(c.filter((x) => x.on).map((x) => x.o), ['aerogril'], 'qayta ochilganda oxirgi usul: ' + JSON.stringify(c));
    ok('Shu taom qayta ochilsa — oxirgi tanlangan usul (aerogril) eslab qolingan');
    await p.keyboard.press('Escape'); await W(p, 400);
    /* qidiruvda usul so'zi */
    for (const [q, u] of [['tovuq kotlet duxovka', 'duxovka'], ["tovuq ko'kragi bug'da", 'bug'], ['kartoshka aerogril', 'aerogril'], ['manti qaynatilgan', 'qaynatilgan']]) {
      await search(p, q); const t0 = await p.evaluate(() => (document.querySelector('#fdRes .sl-rw [data-act=pickfood]') || {}).textContent || ''); await pick(p); const cc = await chips(p);
      assert.deepEqual(cc.filter((x) => x.on).map((x) => x.o), [u], q + ': ' + JSON.stringify(cc) + ' | 1-natija: ' + t0); await p.keyboard.press('Escape'); await W(p, 400); }
    ok('Qidiruv: «tovuq kotlet duxovka», «tovuq ko\'kragi bug\'da», «kartoshka aerogril», «manti qaynatilgan» — 1-natija shu taom, usul oldindan tanlangan');
    assert.deepEqual(p.errs, []); await p.context().close(); }
  /* 4. ru: nomlar va qidiruv (аэрогриль / air fryer / в духовке) */
  { const p = await open(br, BASE, { w: 390, lang: 'ru', st: seed(), hour: 13, settle: 500 });
    for (const [q, u] of [['котлета куриная в аэрогриле', 'aerogril'], ['куриная грудка air fryer', 'aerogril'], ['лосось в духовке', 'duxovka'], ['манты на пару', 'bug']]) {
      await search(p, q); await pick(p); const cc = await chips(p); assert.deepEqual(cc.filter((x) => x.on).map((x) => x.o), [u], q + ': ' + JSON.stringify(cc)); await p.keyboard.press('Escape'); await W(p, 400); }
    await search(p, 'котлета куриная'); await pick(p); const cc = await chips(p); assert.deepEqual(cc.map((x) => x.t), ['На сковороде', 'В духовке', 'В аэрогриле', 'На пару']); assert.equal(await p.textContent('#fdUsul .rz-fl'), 'Способ приготовления');
    assert.deepEqual(p.errs, []); await p.context().close();
    ok('ru: «Способ приготовления» — На сковороде · В духовке · В аэрогриле · На пару; «котлета куриная в аэрогриле», «air fryer», «в духовке», «на пару» — usul tanlanadi'); }
  /* 5. 320 px + katta matn: chiplar o'raladi, sig'adi */
  for (const lang of ['uz', 'ru']) { const p = await open(br, BASE, { w: 320, lang, st: seed(), hour: 13, zoom: 1.3, settle: 500 });
    await search(p, lang === 'ru' ? 'куриная грудка' : "tovuq ko'kragi"); await pick(p);
    const g = await p.evaluate(() => { const box = document.querySelector('#fdUsul .pw-uc'), cs = [...box.querySelectorAll('.rz-chip')], r = box.getBoundingClientRect(), tops = new Set(cs.map((c) => Math.round(c.getBoundingClientRect().top)));
      return { n: cs.length, rows: tops.size, sw: box.scrollWidth, cw: box.clientWidth, out: cs.filter((c) => { const q = c.getBoundingClientRect(); return q.right > r.right + 1 || q.left < r.left - 1 || q.right > innerWidth; }).length, page: document.documentElement.scrollWidth <= innerWidth + 1 }; });
    assert.equal(g.n, 6); assert.ok(g.rows >= 2, 'o\'raladi: ' + JSON.stringify(g)); assert.ok(g.sw <= g.cw + 1 && g.out === 0 && g.page, 'sig\'adi: ' + JSON.stringify(g)); assert.deepEqual(p.errs, []); await p.context().close();
    ok(lang + ' 320 px, matn 130 %: 6 ta usul chipi ' + g.rows + ' qatorga o\'raladi, gorizontal aylanmaydi, ekrandan chiqmaydi'); }
} finally { await B.chromium.close(); if (B.webkit) await B.webkit.close(); srv.close(); }
console.log('usul-ui: ' + n + ' guruh OK');
