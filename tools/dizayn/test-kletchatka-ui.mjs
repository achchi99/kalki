// KalkiFit v102: KLETCHATKA, oqsil holati va TEF — ekranda. Bugun: makro panel ostida «Kletchatka X / G g» (BJU ustunlari o'zgarmaydi), noma'lum taom bo'lsa «≈»;
// «i» oynasi (nima va nega, me'yor, noma'lum soni); porsiya oynasida kletchatka; kun xulosasi; Tahlil (haftalik o'rtacha); oqsil maqsaddan oshsa — ✓ (bajarildi), yog' — ▴;
// halqa izohida TEF bonusi (Qoldi raqami o'zgarmaydi). UZ + RU.   node tools/dizayn/test-kletchatka-ui.mjs
import assert from 'node:assert/strict';
import { server, brauzerlar, open, seed, T0, D } from './sigmaslik-yadro.mjs';
const { srv, BASE } = await server(); const B = await brauzerlar(); const br = B.chromium; let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
const week = []; for (let i = 0; i <= 6; i++) { const d = D.addDays(T0, -i); week.push([d, 'grechka', 'l', 300, 10, 3, 60], [d, 'olma', 'd', 52, 0.3, 0.2, 14], [d, 'osh', 'l', 900, 30, 35, 110], [d, 'non', 'b', 500, 15, 2, 100]); }
try {
  for (const lang of ['uz', 'ru']) {
    const W = lang === 'ru' ? { fb: 'Клетчатка', g: 'г', unk: 'нет данных', tef: /\+\d+ ккал/ } : { fb: 'Kletchatka', g: 'g', unk: "ma'lumot yo'q", tef: /\+\d+ kkal/ };
    /* 1. Bugun qatori, ≈, «i» */
    let p = await open(br, BASE, { w: 390, h: 844, lang, st: seed({ food: week }), hour: 20, reduced: true, settle: 500 });
    const row = await txt(p, '#fbRow'); assert.match(row, new RegExp('^' + W.fb + ' \\d+(,\\d)? / \\d+ ' + W.g + '$'), row); assert.ok(!row.includes('≈'), 'ma\'lum taomlar — ≈ yo\'q: ' + row);
    const cols = await p.locator('#bjuCard .mk-row').count(); assert.equal(cols, 3, 'BJU — 3 ustun (kletchatka 4-makro emas)');
    await p.click('#fbRow'); await p.waitForSelector('#rzSheet'); const sh = await txt(p, '#rzSheet'); assert.match(sh, lang === 'ru' ? /пищевые волокна/ : /hazm bo'lmaydigan tola/); assert.match(sh, lang === 'ru' ? /14 г на каждые 1000 ккал/ : /14 g, kamida 25 g/); assert.equal(await p.locator('#fbUnk').count(), 0);
    assert.deepEqual(p.errs, []); await p.context().close();
    const wk2 = week.concat([[T0, 'ai-taom-yoq', 'd', 400, 10, 10, 50]]);
    p = await open(br, BASE, { w: 390, h: 844, lang, st: seed({ food: wk2 }), hour: 20, reduced: true, settle: 500 });
    assert.match(await txt(p, '#fbRow'), /≈\d/, 'noma\'lum taom — ≈'); await p.click('#fbRow'); await p.waitForSelector('#fbUnk'); assert.match(await txt(p, '#fbUnk'), /1/); await p.context().close();
    ok(lang + ': Bugun — «' + row + '» makro panel ostida (BJU 3 ustun), noma\'lum taom bo\'lsa «≈» va oynada soni; «i» — nima va nega, me\'yor');
    /* 2. porsiya oynasi */
    p = await open(br, BASE, { w: 390, h: 844, lang, st: seed({ food: week }), hour: 14, reduced: true, settle: 500 });
    await p.click('#mainAdd'); await p.waitForSelector('#rzSheet #fdQ'); await p.fill('#rzSheet #fdQ', lang === 'ru' ? 'груша' : 'nok'); await p.waitForSelector('[data-act=pickfood][data-id=nok]'); await p.locator('[data-act=pickfood][data-id=nok]').first().click(); await p.waitForSelector('#fdFb');
    const pf = await txt(p, '#fdFb'); assert.match(pf, new RegExp(W.fb + ': \\d+(,\\d)? ' + W.g), pf); await p.context().close();
    p = await open(br, BASE, { w: 390, h: 844, lang, st: seed({ food: week }), hour: 14, reduced: true, settle: 500 });
    await p.click('#mainAdd'); await p.waitForSelector('#rzSheet #fdQ'); await p.fill('#rzSheet #fdQ', lang === 'ru' ? 'сумаляк' : 'sumalak'); await p.waitForSelector('[data-act=pickfood][data-id=sumalak]'); await p.locator('[data-act=pickfood][data-id=sumalak]').first().click(); await p.waitForSelector('#fdFb');
    assert.ok((await txt(p, '#fdFb')).includes(W.unk), 'noma\'lum: ' + await txt(p, '#fdFb')); await p.context().close();
    ok(lang + ': porsiya oynasi — «' + pf + '»; ma\'lumoti yo\'q taomda — «' + W.unk + '» (0 emas)');
    /* 3. kun xulosasi, Tahlil */
    p = await open(br, BASE, { w: 390, h: 844, lang, st: seed({ food: week }), hour: 14, reduced: true, settle: 500 });
    await p.locator('.sl-week7 .wd').nth(5).click(); await p.waitForSelector('#dsCard .ds-fb'); assert.match(await txt(p, '#dsCard .ds-fb'), new RegExp(W.fb + ' \\d'));
    await p.click('[data-act=tab][data-v=history]'); await p.waitForSelector('#tlMb'); assert.match(await txt(p, '#tlMb .hk-fb'), new RegExp(W.fb + '.*\\d+ / \\d+ ' + W.g)); assert.deepEqual(p.errs, []); await p.context().close();
    ok(lang + ': kun xulosasi va Tahlil (haftalik o\'rtacha) — kletchatka qatori');
    /* 4. oqsil oshdi — ✓; yog' — ▴; TEF */
    const hp = [[T0, 'tovuq-kokrak', 'l', 900, 190, 20, 0], [T0, 'yog', 'd', 900, 0, 100, 0]];
    p = await open(br, BASE, { w: 390, h: 844, lang, st: seed({ food: hp }), hour: 14, reduced: true, settle: 500 });
    assert.ok(await p.locator('#bjuCard .mk-row[data-m=p].mk-bajarildi').count() === 1, 'oqsil > 100 % — bajarildi (✓)'); assert.ok(await p.locator('#bjuCard .mk-row[data-m=f].mk-oshdi').count() === 1, 'yog\' > 115 % — ko\'p (▴)');
    const rem0 = await txt(p, '#kChips'); await p.click('#kcalBtn'); await p.waitForSelector('#xkTef'); const tef = await txt(p, '#xkTef'); assert.match(tef, W.tef); assert.match(tef, /190/);
    assert.equal(await txt(p, '#kChips'), rem0, 'Qoldi raqami o\'zgarmaydi'); assert.deepEqual(p.errs, []); await p.context().close();
    ok(lang + ': oqsil maqsaddan oshdi — «bajarildi» ✓, yog\' — «ko\'p» ▴; halqa izohida TEF bonusi («' + tef.match(W.tef)[0] + '»), Qoldi o\'zgarmaydi');
  }
} finally { await B.chromium.close(); if (B.webkit) await B.webkit.close(); srv.close(); }
console.log('kletchatka-ui: ' + n + ' guruh OK');
