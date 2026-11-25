// KalkiFit v103: «Ovqatlanish sifati» ekranda. Halqa yonida bal (0–100), «i» oynasida 5 komponent va formula; maslahatchi kartasi — 1) ta'sir, 2) aniq taom/gramm bilan to'g'rilash;
// Tahlil: 4 haftalik grafik (kaloriya ustuni + sifat nuqtasi), hafta xulosasi (kaloriya · tarkib · vazn tarkibi diapazoni), takroriy taom muqobillari; Haftangiz makro slaydida xulosa. UZ + RU.
//   node tools/dizayn/test-sifat-ui.mjs
import assert from 'node:assert/strict';
import { server, brauzerlar, open, seed, T0, D } from './sigmaslik-yadro.mjs';
const { srv, BASE } = await server(); const B = await brauzerlar(); const br = B.chromium; let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
/* 4 hafta: oxirgi haftada har kuni qozon kabob (yog' ko'p, oqsil kam) — kaloriya joyida */
const food = []; for (let i = 0; i <= 27; i++) { const d = D.addDays(T0, -i); if (i <= 7 && i >= 1) food.push([d, 'qozon-kabob', 'l', 1100, 40, 80, 50], [d, 'non', 'b', 500, 15, 2, 100], [d, 'choy', 'd', 600, 10, 10, 110]); else if (i > 7) food.push([d, 'tovuq-kokrak', 'l', 600, 110, 10, 0], [d, 'grechka', 'b', 600, 20, 5, 120], [d, 'olma', 'd', 500, 2, 1, 120], [d, 'non', 's', 400, 12, 2, 80]); }
const wts = [{ d: D.addDays(T0, -12), kg: 82 }, { d: D.addDays(T0, -9), kg: 82 }, { d: D.addDays(T0, -5), kg: 81 }, { d: D.addDays(T0, -2), kg: 81 }];
try {
  for (const lang of ['uz', 'ru']) {
    const st = seed({ food: food.concat([[T0, 'qozon-kabob', 'l', 1100, 40, 80, 50]]) }); st.weights = wts.concat(st.weights.filter((w) => !wts.some((x) => x.d === w.d))).sort((a, b) => (a.d < b.d ? -1 : 1)); st.prefs.mslMode = 'jiddiy';
    let p = await open(br, BASE, { w: 390, h: 844, lang, st, hour: 20, reduced: true, settle: 600 });
    /* 1. halqa yonidagi bal va «i» */
    const ch = await txt(p, '#sqChip'); assert.match(ch, /^\d{1,3}$/, 'bal: ' + ch); await p.click('#sqChip'); await p.waitForSelector('#sqRows');
    assert.equal(await p.locator('#sqRows .sq-row').count(), 5, '5 komponent'); const sh = await txt(p, '#rzSheet'); assert.match(sh, lang === 'ru' ? /белок 30 \+ жир 20 \+ клетчатка 20 \+ калории 20 \+ регулярность 10/ : /oqsil 30 \+ yog' 20 \+ kletchatka 20 \+ kaloriya 20 \+ muntazamlik 10/); assert.equal(await txt(p, '#sqBall'), ch);
    ok(lang + ': halqa yonida sifat bali ' + ch + '; «i» — 5 komponent va ochkolari, formula');
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    /* 2. maslahatchi kartasi: ta'sir + aniq to'g'rilash */
    const qid = await p.locator('#mslCard').count() ? await p.locator('#mslCard').getAttribute('data-q') : null, card = /^[abcd]$/.test(qid || '') ? await txt(p, '#mslB') : ''; if (card) { assert.match(card, lang === 'ru' ? /\d+ г [а-яё]/ : /\d+ g [a-z']/i, 'aniq taom va gramm: ' + card); ok(lang + ': maslahatchi kartasi — «' + card.slice(0, 120) + '…»'); }
    /* 3. Tahlil */
    await p.click('[data-act=tab][data-v=history]'); await p.waitForSelector('#tlSq'); assert.equal(await p.locator('#tlSq .sq-ch .bg').count(), 4, '4 hafta'); assert.ok(await p.locator('#tlSq .sq-ch .q').count() >= 2);
    const sw = await txt(p, '#tlSw'); assert.match(sw, lang === 'ru' ? /(калори|план)/i : /(kaloriya|reja)/i); assert.match(sw, lang === 'ru' ? /белк/i : /oqsil/i); assert.match(sw, /0,\d/, 'mushak diapazoni: ' + sw); assert.ok(/(qozon|казан)/i.test(sw), 'takroriy taom: ' + sw);
    if (await p.locator('#sqTr').count()) ok(lang + ': trend — «' + await txt(p, '#sqTr') + '»');
    assert.ok(!/(kam ozd|меньше похуд|похудели бы|сбросили бы)/i.test(await txt(p, '#tlSq')), 'vazn da\'vosi yo\'q'); assert.deepEqual(p.errs, []);
    ok(lang + ': Tahlil — 4 haftalik grafik, hafta xulosasi: «' + sw.slice(0, 160) + '…»');
    await p.context().close();
  }
} finally { await B.chromium.close(); if (B.webkit) await B.webkit.close(); srv.close(); }
console.log('sifat-ui: ' + n + ' guruh OK');
