// KalkiFit v108: SUSHI, KIMBAP, BEZE — ilovada: porsiya oynasida «set (8 dona)» / «butun rulet» / kichik-katta birliklari, qidiruvda «Balki» taklifi (безе → beze birinchi, zefir — taklifda;
// «зефир» o'zgarmagan), 320 px + katta matnda birlik chiplari o'raladi (gorizontal aylanmaydi). UZ + RU.   node tools/dizayn/test-sushi-ui.mjs
import assert from 'node:assert/strict';
import { server, brauzerlar, open, seed } from './sigmaslik-yadro.mjs';
const { srv, BASE } = await server(); const B = await brauzerlar(); const br = B.chromium; let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const W = (p, ms = 450) => p.waitForTimeout(ms);
const more = async (p) => { if (await p.locator('#pwMore[hidden]').count()) { await p.click('[data-act=pwmore]'); await p.waitForTimeout(150); } };          // «Turi va hajmi ›» — birliklar yopiq bo'lishi mumkin
const num = (p, sel) => p.evaluate((s) => +document.querySelector(s).textContent.replace(/[^\d]/g, ''), sel);
const units = (p) => p.evaluate(() => [...document.querySelectorAll('#fdUnits .rz-chip')].map((b) => ({ t: b.textContent.trim().replace(/\s+/g, ' '), on: b.classList.contains('on'), u: b.getAttribute('data-u') || b.getAttribute('data-o') })).filter((x) => x.u && x.u !== 'g100'));          // «gramm» va «+ Mening idishim» — umumiy chiplar
async function search(p, q) { await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); await p.fill('#fdQ', q); await W(p, 700); }
async function pick(p, i = 0) { await p.locator('#fdRes .sl-rw [data-act=pickfood]').nth(i).click(); await W(p, 500); await p.waitForSelector('#fdQu'); await more(p); await p.waitForSelector('#fdUnits'); }
const ugOf = (p) => p.evaluate(() => (document.getElementById('fdUg') || {}).textContent || '');
const rows = (p) => p.evaluate(() => [...document.querySelectorAll('#fdRes .sl-rw')].map((r) => r.innerText.replace(/\s+/g, ' ').trim()));
try {
  /* 1. uz: sushi — «set (8 dona)» birligi; tanlansa 8 dona = 240 g */
  { const p = await open(br, BASE, { w: 390, st: seed(), hour: 13, settle: 500 });
    await search(p, 'sushi'); await pick(p); let u = await units(p); const names = u.map((x) => x.t);
    assert.ok(names.some((t) => /^set \(8 dona\)/.test(t)), 'set birligi: ' + JSON.stringify(names)); assert.ok(u.find((x) => x.on).t.startsWith('dona'), 'standart birlik — dona: ' + JSON.stringify(u));
    const ug1 = await ugOf(p); assert.match(ug1, /1 dona ≈ 30 g/, 'dona: ' + ug1); await p.locator('#fdUnits .rz-chip', { hasText: /^set \(8 dona\)/ }).click(); await W(p);
    const ug8 = await ugOf(p); assert.match(ug8, /1 set \(8 dona\) ≈ 240 g/, 'set: ' + ug8);
    assert.deepEqual(p.errs, []); await p.context().close(); ok('uz: «sushi» → nigiri; birliklar «dona» (standart, 1 dona ≈ 30 g) va «set (8 dona)» (1 set ≈ 240 g)'); }
  /* 2. uz: kimbap — bo'lak va butun rulet; beze — dona / kichik / katta */
  { const p = await open(br, BASE, { w: 390, st: seed(), hour: 13, settle: 500 });
    await search(p, 'kimbap'); await pick(p); let u = await units(p); assert.deepEqual(u.map((x) => x.t.split(' · ')[0]), ["bo'lak", 'butun rulet'], 'kimbap birliklari: ' + JSON.stringify(u));
    assert.match(await ugOf(p), /1 bo'lak ≈ 20 g/); await p.locator('#fdUnits .rz-chip', { hasText: /butun rulet/ }).click(); await W(p); const ur = await ugOf(p); assert.match(ur, /1 butun rulet ≈ 180 g/, 'rulet: ' + ur);
    await p.keyboard.press('Escape'); await W(p, 400);
    await search(p, 'beze'); await pick(p); u = await units(p); assert.deepEqual(u.map((x) => x.t.split(' · ')[0]), ['dona', 'kichik', 'katta'], 'beze birliklari: ' + JSON.stringify(u));
    const g = []; for (const t of ['dona', 'kichik', 'katta']) { await p.locator('#fdUnits .rz-chip', { hasText: new RegExp('^' + t) }).click(); await W(p, 300); g.push((/≈ (\d+) g/.exec(await ugOf(p)) || [])[1]); }
    assert.deepEqual(g, ['10', '5', '15'], 'beze: dona 10 g, kichik 5 g, katta 15 g'); assert.deepEqual(p.errs, []); await p.context().close(); ok('uz: kimbap — «bo\'lak» (20 g) va «butun rulet» (180 g); beze — dona 10 g, kichik 5 g, katta 15 g'); }
  /* 3. ru: «безе» → beze birinchi, «Balki» taklifida зефир; «зефир» — o'zgarmagan (taklif yo'q) */
  { const p = await open(br, BASE, { w: 390, lang: 'ru', st: seed(), hour: 13, settle: 500 });
    await search(p, 'безе'); let r = await rows(p); assert.ok(/^Безе/.test(r[0]), '1-natija — Безе: ' + r[0]); assert.equal(r.length, 2, 'beze + taklif: ' + JSON.stringify(r)); assert.ok(/^Зефир/.test(r[1]), 'taklif — Зефир: ' + r[1]);
    assert.equal(await p.locator('#fdRes .kq-fz').count(), 1, '«Balki» izohi bitta'); const idx = await p.evaluate(() => { const ch = [...document.getElementById('fdRes').children], f = ch.findIndex((e) => e.classList.contains('kq-fz')), b = ch.findIndex((e) => /^Безе/.test(e.innerText)); return { f, b }; });
    assert.ok(idx.b < idx.f, 'izoh — beze qatoridan KEYIN'); await p.fill('#fdQ', 'зефир'); await W(p, 700); r = await rows(p); assert.ok(/^Зефир/.test(r[0]), '«зефир» → Зефир birinchi'); assert.equal(await p.locator('#fdRes .kq-fz').count(), 0, '«зефир» da Balki yo\'q'); assert.ok(!r.some((x) => /^Безе/.test(x)), 'зефир ro\'yxatida безе yo\'q');
    await p.fill('#fdQ', 'кимбап'); await W(p, 700); r = await rows(p); assert.ok(/^Кимбап/.test(r[0]), 'кимбап: ' + r[0]); await p.fill('#fdQ', 'роллы'); await W(p, 700); r = await rows(p); assert.ok(/^Ролл/.test(r[0]), 'роллы: ' + r[0]);
    await p.fill('#fdQ', 'суши'); await W(p, 700); await pick(p); const u = (await units(p)).map((x) => x.t); assert.ok(u.some((t) => /^сет \(8 шт\.\)/.test(t)), 'ru set birligi: ' + JSON.stringify(u));
    assert.deepEqual(p.errs, []); await p.context().close(); ok('ru: «безе» → Безе, ostida «Balki: …» va Зефир; «зефир» — taklifsiz, o\'zgarmagan; «кимбап», «роллы», «суши» → «сет (8 шт.)»'); }
  /* 4. 320 px + matn 130 %: birlik chiplari o'raladi, sig'adi (set, rulet, kichik/katta) */
  for (const [lang, q] of [['uz', 'kimbap'], ['uz', 'roll tempura'], ['ru', 'кимбап'], ['ru', 'безе']]) { const p = await open(br, BASE, { w: 320, lang, st: seed(), hour: 13, zoom: 1.3, settle: 500 }); await search(p, q); await pick(p);
    const g = await p.evaluate(() => { const box = document.getElementById('fdUnits'), cs = [...box.querySelectorAll('.rz-chip')], r = box.getBoundingClientRect(); return { n: cs.length, sw: box.scrollWidth, cw: box.clientWidth, out: cs.filter((c) => { const x = c.getBoundingClientRect(); return x.right > r.right + 1 || x.left < r.left - 1 || x.right > innerWidth; }).length, page: document.documentElement.scrollWidth <= innerWidth + 1 }; });
    assert.ok(g.n >= 3 && g.sw <= g.cw + 1 && g.out === 0 && g.page, lang + ' «' + q + '» 320 px: ' + JSON.stringify(g)); assert.deepEqual(p.errs, []); await p.context().close(); }
  ok('320 px, matn 130 %: birlik chiplari (set, butun rulet, kichik/katta; uz + ru) sig\'adi, gorizontal aylanmaydi');
} finally { await B.chromium.close(); if (B.webkit) await B.webkit.close(); srv.close(); }
console.log('sushi-ui: ' + n + ' guruh OK');
