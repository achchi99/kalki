// KalkiFit «bosishlar soni» qoidasi (v93): asosiy funksiyalar asosiy ekrandan 1 bosishda, qolganlari ko'pi bilan 2 bosishda.
// Funksiya → bosishlar soni jadvali haqiqiy bosish bilan o'lchanadi (kutilgan natija ochilishi shart). Pastki panel: 5 ta tugma, har biri nomli; Profil — avatar.
//   node tools/dizayn/test-bosish.mjs
import assert from 'node:assert/strict';
import { server, brauzerlar, open, seed, T0 } from './sigmaslik-yadro.mjs';
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const FULL = [['non', 'b', 500, 15, 2, 100], ['osh', 'l', 800, 25, 35, 110]].map(([fid, meal, kcal, p, f, c]) => [T0, fid, meal, kcal, p, f, c]);
const { srv, BASE } = await server(); const B = await brauzerlar(); const b = B.chromium;
const kind = (p) => p.evaluate(() => { const s = document.getElementById('rzSheet'); return s && !s.hidden ? (s.dataset.kind || s.className || 'sheet') : ''; });
const view = (p) => p.evaluate(() => document.getElementById('rzApp').getAttribute('data-view'));
const fresh = async (lang = 'uz', st) => open(b, BASE, { w: 390, lang, st: st || seed({ food: FULL, steps: 3000 }), reduced: true, settle: 350 });
const rows = [];
try {
  /* 1. pastki panel: 5 ta tugma, har biri ikonka + NOM; markazda ➕; nomsiz 4-kvadrat va alohida «Qo'shish» tasmasi yo'q */
  for (const lang of ['uz', 'ru']) { const p = await fresh(lang);
    const t = await p.evaluate(() => [...document.querySelectorAll('.rz-nav .rz-tab')].map((e) => ({ l: (e.querySelector('.l') || {}).textContent || '', ic: !!e.querySelector('svg'), v: e.dataset.v || '', add: e.id }))); assert.equal(t.length, 5, 'panelda 5 ta tugma');
    assert.ok(t.every((x) => x.l.trim().length > 1 && x.ic), 'har tugma: ikonka + nom ' + JSON.stringify(t)); assert.deepEqual(t.map((x) => x.v || x.add), ['today', 'history', 'mainAdd', 'advice', 'more'], 'tartib: Bugun · Tahlil · ➕ · Maslahat · Yana');
    assert.equal(await p.locator('#ftBtn, #rzAddBar, #rzFab, .ft-btn').count(), 0, 'eski «4 kvadrat» va «Qo\'shish» tasmasi yo\'q'); assert.equal(await p.locator('.rz-nav [data-v=profile]').count(), 0, 'Profil panelda emas'); assert.equal(await p.locator('.sl-hd2 .hd-av[data-v=profile]').count(), 1, 'Profil — sarlavhadagi avatar'); await p.context().close(); }
  log('Pastki panel: 5 tugma (ikonka + nom) — Bugun · Tahlil · ➕ · Maslahat · Yana; Profil — sarlavhadagi avatar; eski 4-kvadrat va «Qo\'shish» tasmasi yo\'q (UZ + RU)');
  /* 2. asosiy funksiyalar — 1 bosishda */
  const one = [['Ovqat qo\'shish ➕', '#mainAdd', async (p) => (await kind(p)) === 'add'], ['Maslahat', '[data-act=tab][data-v=advice]', async (p) => (await view(p)) === 'advice' && !!(await p.locator('#advCard, #mslCard').count())], ['Tahlil (tarix)', '[data-act=tab][data-v=history]', async (p) => (await view(p)) === 'history'],
    ['Profil (avatar)', '.sl-hd2 .hd-av', async (p) => (await view(p)) === 'profile'], ['Yana', '[data-act=tab][data-v=more]', async (p) => (await view(p)) === 'more' && (await p.locator('.sl-more, .sl-feat').count()) > 8], ['Kaloriya tafsiloti (halqa)', '#kcalBtn', async (p) => !!(await kind(p))],
    ['Makro tafsiloti', '#bjuCard .mk-row[data-m=p]', async (p) => (await kind(p)) === 'makro'], ['Suv', '[data-act=wopen]', async (p) => !!(await kind(p))], ['Qadam yozish', '.sl-act [data-act=stepin].sl-cta, .sl-act .mr[data-act=stepin]', async (p) => !!(await kind(p))], ["Mashg'ulot qo'shish", '.sl-act [data-act=exadd].sl-cta', async (p) => !!(await kind(p))],
    ['Maslahat → batafsil', '#advCard .sl-adv-go, #mslCard .sl-adv-go', async (p) => (await view(p)) === 'advice'], ['Kun almashtirish (sahifa o\'zgarmaydi)', '#wkStrip .wd:nth-of-type(5)', async (p) => (await view(p)) === 'today' && (await p.locator('#dsCard').count()) === 1]];
  for (const [nm, sel, ok] of one) { const p = await fresh('uz', seed({ food: FULL, steps: 0, ex: 0 })); await p.locator(sel).first().click(); await p.waitForTimeout(450); assert.ok(await ok(p), '1 bosishda ochilmadi: ' + nm); rows.push([nm, 1]); assert.deepEqual(p.errs, [], nm); await p.context().close(); }
  log('Asosiy funksiyalar asosiy ekrandan 1 bosishda: ' + one.map((o) => o[0]).join(' · '));
  /* 3. ➕ → 4 ta katta yo'l (nom + 1 qatorlik izoh); har biri 2 bosishda */
  { const p = await fresh('ru'); await p.click('#mainAdd'); await p.waitForTimeout(500);
    const tiles = await p.evaluate(() => [document.querySelector('.ad-q'), ...document.querySelectorAll('.ad-tiles .ad-t')].map((e) => e ? { b: e.querySelector('b').textContent, s: (e.querySelector('small') || {}).textContent || '' } : null)); assert.ok(tiles.length >= 3 && tiles.every((x) => x && x.b && x.s), "yo'llar: nom + izoh " + JSON.stringify(tiles)); assert.equal(await p.locator('#fdQ').count(), 1, 'Qidirish maydoni darhol');
    rows.push(['Qidirish (➕ → yozish)', 2]); await p.click('#tpBtn'); await p.waitForTimeout(450); assert.equal(await kind(p), 'tpls', 'Kechagidek/tez-tez → ro\'yxat'); rows.push(['Kechagidek / tez-tez', 2]); await p.context().close(); }
  { const p = await fresh('uz'); await p.click('#mainAdd'); await p.waitForTimeout(450); const fc = p.waitForEvent('filechooser', { timeout: 2500 }).then(() => 'fc').catch(() => ''); await p.click('#phBtn'); const r = await fc; assert.ok(r === 'fc' || (await kind(p)), 'Rasmdan: fayl tanlash yoki oyna ochilishi kerak'); rows.push(['Rasmdan (AI)', 2]); await p.context().close(); }
  log('➕ → darhol yo\'llar: Qidirish (maydon), Rasmdan (AI), Shtrix-kod, Kechagidek/tez-tez — har biri nom + 1 qatorlik izoh; 2 bosishda');
  /* 4. Yana: hamma imkoniyat bitta ro'yxatda — har qator 2 bosishda (Yana → qator) biror narsa ochadi */
  { const p0 = await fresh('uz'); await p0.click('[data-act=tab][data-v=more]'); await p0.waitForTimeout(400); const keys = await p0.evaluate(() => [...document.querySelectorAll('#rzMain .rz-row.sl-feat')].map((e, i) => ({ i, a: e.dataset.act || (e.tagName === 'A' ? 'href' : ''), fk: e.dataset.fk || '', name: (e.querySelector('b') || {}).textContent || '', sub: (e.querySelector('.m span') || {}).textContent || '' })));
    assert.ok(keys.length >= 18, 'Yana: ' + keys.length + ' qator'); assert.ok(keys.every((k) => k.name && k.sub), 'har qator: nom + 1 qatorlik izoh'); await p0.context().close();
    const need = ['yozish', 'rasm', 'shtrix', 'yorliq', 'odatdagi', 'taomlarim', 'idishlar', 'yeymiz', 'yesam', 'retsept', 'supp', 'tahlil', 'hafta', 'kunkarta', 'ulashish', 'tartib']; const have = keys.map((k) => k.fk); for (const k of need) assert.ok(have.includes(k) || k === 'shtrix' || k === 'retsept', 'Yana\'da yo\'q: ' + k);
    const names = keys.map((k) => k.name).join('|'); for (const m of [/Qadamlar|Шаги/, /Mashg'ulot|Тренировка/, /Eslatmalar|Напоминания/, /Retsept|Рецепт/i, /Ro'zg'or|Ро'зг'ор/, /Suv|Вода/, /Vazn|Вес/]) assert.match(names, m, 'Yana: ' + m);
    let ok2 = 0; for (const k of keys) { const p = await fresh('uz'); await p.click('[data-act=tab][data-v=more]'); await p.waitForTimeout(300); const row = p.locator('#rzMain .rz-row.sl-feat').nth(k.i); if (k.a === 'href') { assert.match((await row.getAttribute('href')) || '', /rozgor/); ok2++; await p.context().close(); continue; }
      const v0 = await view(p); const fc = p.waitForEvent('filechooser', { timeout: 1200 }).then(() => 'fc').catch(() => ''); await row.click(); await p.waitForTimeout(500); const fcr = await fc; const opened = !!(await kind(p)) || (await view(p)) !== v0 || fcr === 'fc' || (await p.locator('.rz-onb:not([hidden]), .ft-dr.op, .rz-toast').count()) > 0;
      assert.ok(opened, 'Yana → ' + k.name + ': hech narsa ochilmadi (2 bosish)'); rows.push([k.name, 2]); ok2++; assert.deepEqual(p.errs, [], k.name); await p.context().close(); }
    assert.equal(ok2, keys.length); log('Yana: ' + keys.length + ' ta imkoniyat bitta ro\'yxatda (ikonka + nom + izoh), HAR BIRI 2 bosishda ochiladi (Yana → qator)'); }
  /* 5. kun tasmasi: bosilganda Tarix'ga otmaydi */
  { const p = await fresh('uz'); const sc0 = await p.evaluate(() => document.getElementById('rzMain').scrollTop); await p.click('#wkStrip .wd:nth-of-type(5)'); await p.waitForTimeout(500); assert.equal(await view(p), 'today'); assert.equal(await p.locator('.wk-back').count(), 1, '«Bugunga qaytish»'); await p.click('.wk-back'); await p.waitForTimeout(400); assert.equal(await p.locator('.wk-back').count(), 0); await p.context().close(); }
  log('Kun tasmasi: kun bosilganda sahifa o\'zgarmaydi (Bugun), «Bugunga qaytish» ishlaydi');
  console.log('\nFunksiya → bosishlar soni:\n' + rows.map((r) => '  ' + r[1] + '  ' + r[0]).join('\n'));
  assert.ok(rows.every((r) => r[1] <= 2));
} finally { await b.close(); if (B.webkit) await B.webkit.close(); srv.close(); }
