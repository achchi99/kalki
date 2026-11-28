// Muzqaymoq brendlari — ilovada qidiruv: «Bahrom» (yorlig'i yo'q) → «Balki: …» + umumiy Plombir vafli stakanchada / Eskimo (raqam o'ylab topilmaydi); «48 копеек» → brend mahsulotlari;
// ЎЗ kirill, RU, lotin yozuvi; «Topilmadi» chiqmaydi.   node tools/dizayn/test-brend-muzqaymoq-ui.mjs
import assert from 'node:assert/strict';
import { server, brauzerlar, open, seed } from './sigmaslik-yadro.mjs';
const { srv, BASE } = await server(); const B = await brauzerlar(); const br = B.chromium; let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const W = (p, ms = 450) => p.waitForTimeout(ms);
async function search(p, q) { if (!(await p.locator('#fdQ').count())) { await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); } await p.fill('#fdQ', q); await W(p, 800); }
const rows = (p) => p.evaluate(() => [...document.querySelectorAll('#fdRes .sl-rw')].map((r) => r.innerText.replace(/\s+/g, ' ').trim()));
const fz = (p) => p.locator('#fdRes .kq-fz').count();
try {
  for (const [lang, w, qs] of [['uz', 390, ['Bahrom', 'bahrom muzqaymoq', 'Бахром', 'Bahroma']], ['ru', 390, ['Бахром', 'мороженое Бахрома', 'bahrom eskimo']]]) {
    const p = await open(br, BASE, { w, lang, st: seed(), hour: 13, settle: 500 });
    for (const q of qs) { await search(p, q); const r = await rows(p); const txt = await p.locator('#fdRes').innerText();
      assert.ok(r.length >= 8, q + ': natija: ' + JSON.stringify(r)); assert.ok(r.filter((x) => /^Bahroma/.test(x)).length >= 2, q + ': Bahroma mahsulotlari: ' + JSON.stringify(r)); assert.equal(await fz(p), 1, q + ': «Balki» izohi');
      assert.doesNotMatch(txt, /^Topilmadi|Не найдено/, q + ': «Topilmadi» yo\'q'); assert.ok(r.some((x) => /stakanchada|стаканчике/i.test(x) && !/^(Bahroma|48)/.test(x)), q + ': yorlig\'i yo\'q tur — umumiy Plombir vafli stakanchada («Balki»da): ' + JSON.stringify(r)); assert.ok(!r.some((x) => /^48/.test(x)), q + ': 48 kopeek aralashmagan'); }
    assert.deepEqual(p.errs, []); await p.context().close(); }
  ok('uz/ru: «Bahrom», «Bahroma», «bahrom muzqaymoq», «Бахром», «мороженое Бахрома», «bahrom eskimo» → Bahroma mahsulotlari + «Balki: …» da yorlig\'i yo\'q turlar (Plombir vafli stakanchada…); «Topilmadi» yo\'q');
  { const p = await open(br, BASE, { w: 390, lang: 'uz', st: seed(), hour: 13, settle: 500 });
    await search(p, '48 копеек'); let r = await rows(p); assert.ok(r.filter((x) => /48 kopeek/.test(x)).length >= 5, '48 копеек: ' + JSON.stringify(r));
    await search(p, '48 kopeek stakancha'); r = await rows(p); assert.ok(/^48 kopeek — plombir vafli stakanchada/.test(r[0]), '1-natija: ' + r[0]); assert.match(r[0], /203/, 'kkal: 88 g × 231 / 100 = 203');
    await search(p, '48 копеек эскимо'); r = await rows(p); assert.ok(/eskimo/i.test(r[0]) && /48/.test(r[0]), 'эскимо: ' + r[0]);
    assert.deepEqual(p.errs, []); await p.context().close(); ok('«48 копеек» / «48 kopeek stakancha» / «48 копеек эскимо» → brend mahsulotlari (88 g stakancha = 203 kkal)'); }
  { const p = await open(br, BASE, { w: 320, lang: 'uz', st: seed(), hour: 13, zoom: 1.3, settle: 500 }); await search(p, 'Bahrom');
    const g = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })); assert.ok(g.sw <= g.cw + 1, '320 px gorizontal aylanmaydi: ' + JSON.stringify(g)); assert.deepEqual(p.errs, []); await p.context().close(); ok('320 px, matn 130 %: «Bahrom» natijasi sig\'adi'); }
} finally { await B.chromium.close(); if (B.webkit) await B.webkit.close(); srv.close(); }
console.log('brend-muzqaymoq-ui: ' + n + ' guruh OK');
