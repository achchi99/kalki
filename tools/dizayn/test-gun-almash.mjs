// KalkiFit «kun almashishi» (v96): kun bosilganda layout BIR PIKSEL ham siljimaydi; halqa yoyi, markaziy raqam, to'lqin, makro chiziq/raqamlar, sarlavha, tanlov belgisi
// silliq o'zgaradi (oraliq kadrlar virtual soat + pause()/currentTime bilan DETERMINISTIK tekshiriladi, v100); sarlavha tiniq (filter/blur/doimiy transform yo'q); kun xulosasi/Maslahat kartasi birinchi ekranda ko'rinadi;
// prefers-reduced-motion'da animatsiya yo'q.   WebKit (Safari) + Chromium; UZ + RU; 375×812 va 390×844.   node tools/dizayn/test-gun-almash.mjs
import assert from 'node:assert/strict';
import { server, brauzerlar, open, seed, T0, D } from './sigmaslik-yadro.mjs';
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
const row = (k, rows) => rows.map(([fid, meal, kcal, p, f, c]) => [D.addDays(T0, -k), fid, meal, kcal, p, f, c]);
const MID = [...row(0, [['non', 'b', 500, 15, 2, 100], ['osh', 'l', 800, 25, 35, 110]]), ...row(1, [['non', 'b', 450, 14, 3, 90], ['osh', 'l', 900, 25, 45, 110], ['somsa', 'd', 600, 20, 40, 60]]), ...row(2, [['osh', 'l', 900, 25, 45, 110], ['somsa', 'd', 700, 20, 40, 60], ['kola', 'd', 300, 0, 0, 75]]), ...row(3, [['non', 'b', 400, 12, 2, 80]])];
const { srv, BASE } = await server(); const B = await brauzerlar(); const ENG = [['webkit', B.webkit], ['chromium', B.chromium]].filter((e) => e[1]);
if (!B.webkit) console.log('OGOHLANTIRISH: WebKit yo\'q — faqat Chromium');
const TOPS = ['.sl-hd2', '.wk-hd', '#wkStrip', '.sl-big', '#kcalBtn', '#kChips', '#bjuCard'];
const tops = (p) => p.evaluate((ss) => Object.fromEntries(ss.map((s) => { const e = document.querySelector(s); return [s, e ? Math.round(e.getBoundingClientRect().top * 10) / 10 : null]; })), TOPS);
const same = (a, b, tag) => { for (const k of TOPS) { assert.ok(a[k] != null && b[k] != null, tag + ': ' + k + ' yo\'q'); assert.ok(Math.abs(a[k] - b[k]) <= 1, tag + ': ' + k + ' ' + a[k] + ' → ' + b[k] + ' (siljidi)'); } };
const VP = [[375, 812], [390, 844]]; const RUN = (k) => !(process.env.SKIP || '').split(',').includes(String(k));          // SKIP=1,2 — ayrim bo'limlarni o'tkazish (tuzatishdan oldingi holatni bo'lak-bo'lak ko'rsatish uchun)
/* v100: DETERMINISTIK vaqt. Real setTimeout/waitForTimeout o'rniga: (1) «settled» — barcha chekli WAAPI/CSS animatsiyalar `finished` bo'lguncha kutadi (siljish tekshiruvi shundan KEYIN);
   (2) CLOCK — sahifada performance.now/requestAnimationFrame virtual soatga almashtiriladi, barcha animatsiyalar pause() qilinib currentTime aniq qiymatga qo'yiladi (60/100/250 ms) — yuk ostida ham bir xil natija. */
const settled = (p) => p.evaluate(async () => { for (let i = 0; i < 12; i++) { const as = document.getAnimations().filter((a) => { try { return a.effect.getComputedTiming().endTime !== Infinity; } catch (e) { return false; } }); if (!as.length) break; await Promise.all(as.map((a) => a.finished.then(() => 0, () => 0))); } await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
const CLOCK = () => {
  const real = { now: performance.now.bind(performance), raf: window.requestAnimationFrame.bind(window), caf: window.cancelAnimationFrame.bind(window) };
  let on = false, vt = 0, t0 = 0, q = [], id = 0; const seen = new Map();
  performance.now = () => (on ? vt : real.now());
  window.requestAnimationFrame = (cb) => { if (!on) return real.raf(cb); q.push([++id, cb]); return -id; };
  window.cancelAnimationFrame = (i) => { if (i < 0) q = q.filter((e) => -e[0] !== i); else real.caf(i); };
  const disc = () => { void document.documentElement.offsetWidth; for (const a of document.getAnimations()) if (!seen.has(a)) { a.pause(); seen.set(a, vt); } };
  const sync = () => { for (const [a, s0] of seen) { try { a.currentTime = Math.max(0, vt - s0); } catch (e) { } } };
  const at = (T) => { disc(); while (vt - t0 < T) { vt = Math.min(vt + 16, t0 + T); const cbs = q; q = []; cbs.forEach(([, cb]) => cb(vt)); disc(); sync(); } sync(); return window.__grab(); };
  const fin = (a) => { try { return a.effect.getComputedTiming().endTime !== Infinity; } catch (e) { return false; } };
  window.__clk = { arm: () => { on = true; vt = real.now(); t0 = vt; seen.clear(); q = []; }, at,
    end: async (T) => { at(T); const fa = [...seen.keys()].filter(fin); fa.forEach((a) => { try { a.finish(); } catch (e) { } }); await Promise.all(fa.map((a) => a.finished.then(() => 0, () => 0))); return at(T + 48); } };
};
try {
  for (const [en, br] of ENG) for (const lang of ['uz', 'ru']) for (const [w, h] of VP) {
    const tag = [en, lang, w + 'x' + h].join(' ');
    /* 1. layout siljimaydi (izoh qatori ochiq va yopiq holatda; kun, oldingi hafta, bugunga qaytish) */
    if (RUN(1)) for (const legend of [true, false]) {
      const p = await open(br, BASE, { w, h, lang, st: seed({ food: MID }), hour: 14, reduced: true, settle: 500 }); if (!legend) { await p.click('[data-act=wklegx]'); await settled(p); }
      const t0 = await tops(p);
      await p.locator('.sl-week7 .wd').nth(5).click(); await settled(p); same(t0, await tops(p), tag + ' kecha');
      await p.locator('.sl-week7 .wd').nth(3).click(); await settled(p); same(t0, await tops(p), tag + ' 3 kun oldin');
      await p.click('[data-act=wkprev]'); await settled(p); same(t0, await tops(p), tag + ' oldingi hafta');
      await p.click('.wk-back'); await settled(p); same(t0, await tops(p), tag + ' bugunga qaytish'); assert.deepEqual(p.errs, []); await p.context().close();
    }
    /* 2. birinchi ekran: o'tgan kun xulosasi va (bugun) Maslahat kartasi ko'rinadi */
    if (RUN(2)) { const p = await open(br, BASE, { w, h, lang, st: seed({ food: MID }), hour: 14, reduced: true, settle: 500 }); await p.click('[data-act=wklegx]'); await settled(p);
      const vis = (sel) => p.evaluate((s) => { const e = document.querySelector(s), nav = document.querySelector('.rz-nav').getBoundingClientRect(); return e ? Math.round(nav.top - e.getBoundingClientRect().top) : null; }, sel);
      assert.ok((await vis('#advCard, #mslCard')) >= 36, tag + ': Maslahat kartasi birinchi ekranda (≥36 px — sarlavhasi ko\'rinadi; v102: makro ostida kletchatka qatori qo\'shildi): ' + await vis('#advCard, #mslCard'));
      await p.locator('.sl-week7 .wd').nth(5).click(); await settled(p); assert.ok((await vis('#dsCard')) >= 36, tag + ': kun xulosasi birinchi ekranda: ' + await vis('#dsCard')); await p.context().close(); }
    /* 3. animatsiya: oraliq kadrlar (100 ms va 250 ms) — halqa yoyi, raqam, makro chiziq/raqam, sarlavha; getAnimations() bor */
    if (RUN(3)) { const p = await open(br, BASE, { w, h, lang, st: seed({ food: MID }), hour: 14, reduced: false, settle: 1800 }); await p.click('[data-act=wklegx]'); await settled(p); await p.evaluate(CLOCK);
      await p.evaluate(() => { window.__grab = () => { const arc = document.querySelector('.sl-big .kv-arc'), bar = document.querySelector('#bjuCard .mk-row[data-m=p] .mk-f'), mv = document.querySelector('#bjuCard .mk-row[data-m=p] .mv b'), hd = document.querySelector('.sl-hd2 .t'); const m = new DOMMatrix(getComputedStyle(bar).transform); const sq = document.querySelector('#sqChip .sq-arc'), sqb = document.querySelector('#sqChip b'); return { sq: sq ? parseFloat(getComputedStyle(sq).strokeDashoffset) : null, sqn: sqb ? parseInt(sqb.textContent, 10) : null, arc: parseFloat(getComputedStyle(arc).strokeDasharray), num: parseInt(document.getElementById('kLeft').textContent.replace(/\s/g, ''), 10), bar: m.a, mv: parseInt(mv.textContent.replace(/\s/g, ''), 10), op: +getComputedStyle(hd).opacity, ghost: document.querySelectorAll('.fx-ghost').length, anims: document.getAnimations().length }; }; });
      const b = await p.evaluate(() => window.__grab());
      const { a60, a100, a250, fin } = await p.evaluate(async () => { const c = window.__clk; c.arm(); document.querySelectorAll('.sl-week7 .wd')[5].click(); const a60 = c.at(60), a100 = c.at(100), a250 = c.at(250); const fin = await c.end(1500); return { a60, a100, a250, fin }; });
      const between = (v, x, y, k) => assert.ok(v > Math.min(x, y) + 0.01 * Math.abs(x - y) && v < Math.max(x, y) - 0.01 * Math.abs(x - y), tag + ': ' + k + ' oraliq emas: ' + v + ' (' + x + ' → ' + y + ')');
      assert.ok(Math.abs(fin.arc - b.arc) > 5, tag + ': yoy qiymati o\'zgarishi kerak'); assert.ok(fin.num !== b.num);
      for (const [k, x] of [['100 ms', a100], ['250 ms', a250]]) { between(x.arc, b.arc, fin.arc, 'halqa yoyi ' + k); between(x.num, b.num, fin.num, 'markaziy raqam ' + k); if (Math.abs(fin.bar - b.bar) > 0.05) between(x.bar, b.bar, fin.bar, 'makro chizig\'i ' + k); if (fin.mv !== b.mv) between(x.mv, b.mv, fin.mv, 'makro raqami ' + k); }
      if (b.sq != null && fin.sq != null && Math.abs(fin.sq - b.sq) >= 3) { for (const [k, x] of [['100 ms', a100], ['250 ms', a250]]) { between(x.sq, b.sq, fin.sq, 'sifat medali yoyi ' + k); between(x.sqn, b.sqn, fin.sqn, 'sifat bali ' + k); } }          // v104: medal ham kun almashganda silliq
      assert.ok(a60.anims > 0, tag + ': document.getAnimations() bo\'sh'); assert.ok(a100.op > 0 && a100.op < 1 || a60.op < 1, tag + ': sarlavha crossfade ko\'rinmadi: ' + a60.op + '/' + a100.op); assert.ok(a60.ghost + a100.ghost >= 1, tag + ': eski sarlavha (ghost) chiqib ketmadi');
      const tr = await p.evaluate(() => [...document.querySelectorAll('.sl-week7 .wd-pill, #bjuCard .mk-f')].map((e) => parseFloat(getComputedStyle(e).transitionDuration) + '|' + e.className)); assert.ok(tr.some((x) => /mk-f/.test(x) && parseFloat(x) > 0), 'makro chizig\'ida transition-duration > 0: ' + tr); assert.ok(tr.some((x) => /wd-pill/.test(x) && parseFloat(x) > 0), 'tanlov belgisida transition-duration > 0');
      assert.deepEqual(p.errs, []); await p.context().close(); }
    /* 4. prefers-reduced-motion: animatsiya yo'q */
    { const p = await open(br, BASE, { w, h, lang, st: seed({ food: MID }), hour: 14, reduced: true, settle: 600 }); await p.click('[data-act=wklegx]'); await settled(p);
      await p.evaluate(() => { window.__an = 0; const o = Element.prototype.animate; Element.prototype.animate = function (k, t) { const d = typeof t === 'number' ? t : (t && t.duration) || 0; if (d > 0) window.__an++; return o.apply(this, arguments); }; });
      await p.locator('.sl-week7 .wd').nth(5).click(); await settled(p);
      const r = await p.evaluate(() => ({ made: window.__an, anims: document.getAnimations().filter((a) => a.effect && a.effect.getTiming().duration > 0 && a.playState === 'running').length, ghost: document.querySelectorAll('.fx-ghost').length })); assert.equal(r.ghost, 0, tag + ': reduced-motion — ghost yo\'q'); assert.equal(r.made, 0, tag + ': reduced-motion — element.animate() chaqirilmaydi: ' + r.made); assert.equal(r.anims, 0, tag + ': reduced-motion — ishlayotgan animatsiya yo\'q: ' + r.anims); await p.context().close(); }
  }
  log('Kun almashganda sarlavha, hafta qatori, tasma, halqa, makro panelning top qiymati ±1 px teng (kun, 3 kun oldin, oldingi hafta, bugunga qaytish; izoh qatori ochiq/yopiq); UZ+RU, 375×812 va 390×844, WebKit+Chromium');
  log('Birinchi ekranda: bugun — Maslahat kartasi, tanlangan kun — kun xulosasi (≥56 px ko\'rinadi)');
  log('Animatsiya: 100 ms va 250 ms oraliq kadrda halqa yoyi, markaziy raqam, makro chizig\'i va raqami oraliq qiymatda; sarlavha crossfade; document.getAnimations() bor; tasma/makro transition > 0');
  log('prefers-reduced-motion: ghost va ishlayotgan animatsiya yo\'q');
  /* 6. ovqat qo'shilganda ham xuddi shu animatsiyalar (halqa yoyi, markaziy raqam, makro chizig'i) */
  for (const [en, br] of ENG) { const p = await open(br, BASE, { w: 390, h: 844, lang: 'uz', st: seed({ food: row(0, [['non', 'b', 300, 10, 2, 60]]) }), hour: 14, reduced: false, settle: 1800 }); await p.click('[data-act=wklegx]'); await settled(p);
    await p.click('#mainAdd'); await p.waitForSelector('#rzSheet #fdQ'); await settled(p); await p.fill('#rzSheet #fdQ', 'osh'); await p.waitForSelector('[data-act=fadd]'); await settled(p);
    await p.evaluate(CLOCK); await p.evaluate(() => { window.__grab = () => { const arc = document.querySelector('.sl-big .kv-arc'), bar = document.querySelector('#bjuCard .mk-row[data-m=c] .mk-f'); const sq = document.querySelector('#sqChip .sq-arc'), sqb = document.querySelector('#sqChip b'); return { sq: sq ? parseFloat(getComputedStyle(sq).strokeDashoffset) : null, sqn: sqb ? parseInt(sqb.textContent, 10) : null, arc: parseFloat(getComputedStyle(arc).strokeDasharray), num: parseInt(document.getElementById('kLeft').textContent.replace(/\s/g, ''), 10), bar: new DOMMatrix(getComputedStyle(bar).transform).a }; }; });
    const b = await p.evaluate(() => window.__grab());
    const [x1, x2, fin] = await p.evaluate(async () => { const c = window.__clk; c.arm(); document.querySelector('[data-act=fadd]').click(); return [c.at(100), c.at(250), await c.end(1700)]; });
    const r = { b, s: [x1, x2, fin] };
    assert.ok(fin.num < b.num && fin.arc > b.arc + 5, en + ': ovqat qo\'shilganda qiymatlar o\'zgarishi kerak: ' + JSON.stringify(r));
    for (const [k, x] of [['100 ms', x1], ['250 ms', x2]]) { assert.ok(x.arc > b.arc + 0.5 && x.arc < fin.arc - 0.5, en + ' qo\'shilganda halqa yoyi ' + k + ' oraliq emas: ' + x.arc + ' (' + b.arc + ' → ' + fin.arc + ')'); assert.ok(x.num < b.num && x.num > fin.num, en + ' qo\'shilganda raqam ' + k + ' oraliq emas: ' + x.num + ' (' + b.num + ' → ' + fin.num + ')'); }
    await p.context().close(); }
  log('Ovqat qo\'shilganda ham: halqa yoyi va markaziy raqam 100/250 ms da oraliq qiymatda (WebKit + Chromium)');
  /* 5. sarlavha tiniq: filter/backdrop-filter/doimiy transform/will-change yo'q (iOS'da qatlamda matn xira chiqmasin) */
  for (const [en, br] of ENG) for (const lang of ['uz', 'ru']) { const p = await open(br, BASE, { w: 390, h: 844, lang, st: seed({ food: MID }), hour: 14, reduced: false, settle: 2200 });
    const bad = await p.evaluate(() => { const out = []; for (let e = document.querySelector('#todayHd'); e && e.id !== 'rzApp'; e = e.parentElement) { const c = getComputedStyle(e); const f = (c.filter || 'none'), bf = (c.backdropFilter || c.webkitBackdropFilter || 'none'); if (f !== 'none' || bf !== 'none' || c.transform !== 'none' || (c.willChange !== 'auto' && c.willChange !== '') || e.getAnimations().length) out.push((e.id || e.className) + ' ' + f + ' ' + bf + ' ' + c.transform + ' ' + c.willChange + ' anim=' + e.getAnimations().length); } return out; }); assert.deepEqual(bad, [], en + ' ' + lang + ': sarlavha zanjirida filter/transform/will-change/animatsiya qolgan: ' + bad.join(' ; ')); await p.context().close(); }
  log('Sarlavha tiniq: «Bugun/sana» zanjirida filter, backdrop-filter, doimiy transform, will-change va ishlayotgan animatsiya yo\'q');
} finally { await B.chromium.close(); if (B.webkit) await B.webkit.close(); srv.close(); }
