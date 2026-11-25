// KalkiFit v103: «Ovqatlanish sifati» ekranda. Halqa yonida bal (0–100), «i» oynasida 5 komponent va formula; maslahatchi kartasi — 1) ta'sir, 2) aniq taom/gramm bilan to'g'rilash;
// Tahlil: 4 haftalik grafik (kaloriya ustuni + sifat nuqtasi), hafta xulosasi (kaloriya · tarkib · vazn tarkibi diapazoni), takroriy taom muqobillari; Haftangiz makro slaydida xulosa. UZ + RU.
//   node tools/dizayn/test-sifat-ui.mjs
import assert from 'node:assert/strict';
import { server, brauzerlar, open, seed, T0, D } from './sigmaslik-yadro.mjs';
const { srv, BASE } = await server(); const B = await brauzerlar(); const br = B.chromium; let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const txt = async (p, s) => (await p.locator(s).first().innerText()).replace(/\s+/g, ' ').trim();
/* 4 hafta: oxirgi haftada har kuni qozon kabob (yog' ko'p, oqsil kam) — kaloriya joyida */
const food = []; for (let i = 0; i <= 27; i++) { const d = D.addDays(T0, -i); if (i <= 7 && i >= 1) food.push([d, 'qozon-kabob', 'l', 1100, 40, 80, 50], [d, 'non', 'b', 500, 15, 2, 100], [d, 'choy', 'd', 600, 10, 10, 110]); else if (i > 7) food.push([d, 'tovuq-kokrak', 'l', 600, 110, 10, 0], [d, 'grechka', 'b', 600, 20, 5, 120], [d, 'olma', 'd', 500, 2, 1, 120], [d, 'non', 's', 400, 12, 2, 80]); }
const wts = [[-20, 83], [-16, 82.9], [-12, 82.4], [-8, 82.2], [-5, 81.9], [-1, 81.6]].map(([i, kg]) => ({ d: D.addDays(T0, i), kg }));          // v104: 19 kunlik trend ≈ −1,4 kg (≥ 4 yozuv, ≥ 14 kun)
/* v104: medal — geometriya (halqa / ⓘ bilan kesishmaydi, istisnosiz), ranglar va kontrast, animatsiya (virtual soat + pause/currentTime — deterministik), yulduzcha, oyna chiziqlari */
const FX = [[T0, 'tuxum', 'b', 450, 35, 25, 10], [T0, 'tovuq-kokrak', 'l', 700, 80, 20, 40], [T0, 'grechka', 'l', 500, 18, 8, 90], [T0, 'olma', 's', 200, 1, 1, 50]];          // + loviya → bal ≥ 80
const LOV = { fid: 'loviya', meal: 'd', unit: 'porsiya', qty: 1, g: 100, kcal: 500, p: 30, f: 10, c: 70 };
const CLOCK = () => {
  const real = { now: performance.now.bind(performance), raf: window.requestAnimationFrame.bind(window), caf: window.cancelAnimationFrame.bind(window) };
  let on = false, vt = 0, t0 = 0, q = [], id = 0; const seen = new Map();
  performance.now = () => (on ? vt : real.now());
  window.requestAnimationFrame = (cb) => { if (!on) return real.raf(cb); q.push([++id, cb]); return -id; };
  window.cancelAnimationFrame = (i) => { if (i < 0) q = q.filter((e) => -e[0] !== i); else real.caf(i); };
  const disc = () => { void document.documentElement.offsetWidth; for (const a of document.getAnimations()) if (!seen.has(a)) { a.pause(); seen.set(a, vt); } };
  const sync = () => { for (const [a, s0] of seen) { try { a.currentTime = Math.max(0, vt - s0); } catch (e) { } } };
  const grab = () => { const c = document.getElementById('sqChip'); if (!c) return null; const an = (s) => { const e = c.querySelector(s); return e ? e.getAnimations().filter((a) => a.playState !== 'finished').length : 0; };
    return { off: parseFloat(getComputedStyle(c.querySelector('.sq-arc')).strokeDashoffset), n: parseInt(c.querySelector('b').textContent, 10), b: +c.dataset.b, up: c.classList.contains('sq-up'), star: c.classList.contains('sq-star'), sp: an('.sq-sp'), st: an('.sq-st'), md: an('.sq-md'), cls: c.className }; };
  const at = (T) => { disc(); while (vt - t0 < T) { vt = Math.min(vt + 16, t0 + T); const cbs = q; q = []; cbs.forEach(([, cb]) => cb(vt)); disc(); sync(); } sync(); return grab(); };
  window.__clk = { arm: () => { on = true; vt = real.now(); t0 = vt; seen.clear(); q = []; }, at, grab,
    end: async (T) => { at(T); const fa = [...seen.keys()]; fa.forEach((a) => { try { a.finish(); } catch (e) { } }); await Promise.all(fa.map((a) => a.finished.then(() => 0, () => 0))); on = false; return grab(); } };
  window.__add = (f) => { const K = window.__kalkifit; K.S.addFood(K.state, K.S.dates.today(), Object.assign({ ts: Date.now() }, f)); K.render(); };
};
const lum = (c) => { const m = c.match(/[\d.]+/g).slice(0, 3).map((v) => +v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
try {
  for (const lang of ['uz', 'ru']) {
    const st = seed({ food: food.concat([[T0, 'qozon-kabob', 'l', 1100, 40, 80, 50]]) }); st.weights = wts.concat(st.weights.filter((w) => !wts.some((x) => x.d === w.d))).sort((a, b) => (a.d < b.d ? -1 : 1)); st.prefs.mslMode = 'jiddiy';
    let p = await open(br, BASE, { w: 390, h: 844, lang, st, hour: 20, reduced: true, settle: 600 });
    /* 1. halqa yonidagi bal va «i» */
    const ch = await txt(p, '#sqChip b'); assert.match(await txt(p, '#sqChip small'), lang === 'ru' ? /^Качество$/ : /^Sifat$/); assert.match(ch, /^\d{1,3}$/, 'bal: ' + ch); await p.click('#sqChip'); await p.waitForSelector('#sqRows');
    assert.equal(await p.locator('#sqRows .sq-row').count(), 5, '5 komponent'); const sh = await txt(p, '#rzSheet'); assert.match(sh, lang === 'ru' ? /белок 30 \+ жир 20 \+ клетчатка 20 \+ калории 20 \+ регулярность 10/ : /oqsil 30 \+ yog' 20 \+ kletchatka 20 \+ kaloriya 20 \+ muntazamlik 10/); assert.equal(await txt(p, '#sqBall'), ch);
    ok(lang + ': halqa yonida sifat bali ' + ch + '; «i» — 5 komponent va ochkolari, formula');
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    /* 2. maslahatchi kartasi: ta'sir + aniq to'g'rilash */
    const qid = await p.locator('#mslCard').count() ? await p.locator('#mslCard').getAttribute('data-q') : null, card = /^[abcd]$/.test(qid || '') ? await txt(p, '#mslB') : ''; if (card) { assert.match(card, lang === 'ru' ? /\d+ г [а-яё]/ : /\d+ g [a-z']/i, 'aniq taom va gramm: ' + card); ok(lang + ': maslahatchi kartasi — «' + card.slice(0, 120) + '…»'); }
    /* 3. Tahlil */
    await p.click('[data-act=tab][data-v=history]'); await p.waitForSelector('#tlSq'); assert.equal(await p.locator('#tlSq .sq-ch .bg').count(), 4, '4 hafta'); assert.ok(await p.locator('#tlSq .sq-ch .q').count() >= 2);
    const sw = await txt(p, '#tlSw'); assert.match(sw, lang === 'ru' ? /(калори|план)/i : /(kaloriya|reja)/i); assert.match(sw, lang === 'ru' ? /белк/i : /oqsil/i); assert.match(sw, /0,\d/, 'mushak diapazoni: ' + sw); assert.match(sw, /±1 (kg|кг)/, 'suv izohi: ' + sw); assert.ok(!/\d,\d\d/.test(sw), 'soxta aniqlik: ' + sw); assert.ok(/(qozon|казан)/i.test(sw), 'takroriy taom: ' + sw);
    if (await p.locator('#sqTr').count()) ok(lang + ': trend — «' + await txt(p, '#sqTr') + '»');
    assert.ok(!/(kam ozd|меньше похуд|похудели бы|сбросили бы)/i.test(await txt(p, '#tlSq')), 'vazn da\'vosi yo\'q'); assert.deepEqual(p.errs, []);
    ok(lang + ': Tahlil — 4 haftalik grafik, hafta xulosasi: «' + sw.slice(0, 160) + '…»');
    await p.context().close();
  }
  /* 4. geometriya: 320–430 × uz/ru × matn 100/130 % — medal halqa tugmasi va ⓘ bilan KESISHMAYDI (0 px), doira va yorliq halqa chizig'iga tegmaydi */
  let worst = 1e9;
  for (const w of [320, 360, 390, 430]) for (const lang of ['uz', 'ru']) for (const zoom of [1, 1.3]) {
    const p = await open(br, BASE, { w, lang, st: seed({ food: FX }), reduced: true, zoom, settle: 400 });
    const g = await p.evaluate(() => { const R = (e) => e.getBoundingClientRect(), c = document.getElementById('sqChip'), m = R(c), v = R(document.getElementById('kcalBtn')), i = R(document.getElementById('kcalI')), svg = R(document.querySelector('.sl-vsvg')), md = R(c.querySelector('.sq-md')), lb = R(c.querySelector('small'));
      const X = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0;
      const cx = svg.left + svg.width / 2, cy = svg.top + svg.height / 2, Ro = svg.width / 220 * 107;          // halqa: r 105 + chiziq 4/2
      const dRect = (r) => Math.hypot(Math.max(r.left - cx, 0, cx - r.right), Math.max(r.top - cy, 0, cy - r.bottom));
      return { xv: X(m, v), xi: X(m, i), gapMd: Math.hypot(md.left + md.width / 2 - cx, md.top + md.height / 2 - cy) - md.width / 2 - Ro, gapLb: dRect(lb) - Ro, fit: m.left >= 0 && lb.right <= innerWidth }; });
    const tag = w + ' ' + lang + ' ' + zoom; assert.equal(g.xv, false, tag + ': medal halqa tugmasi bilan kesishdi'); assert.equal(g.xi, false, tag + ': medal ⓘ bilan kesishdi'); assert.ok(g.gapMd >= 1 && g.gapLb >= 1, tag + ': halqa chizig\'iga tegdi: ' + JSON.stringify(g)); assert.ok(g.fit, tag);
    worst = Math.min(worst, g.gapMd, g.gapLb); await p.context().close();
  }
  ok('Medal geometriyasi (320/360/390/430 × uz/ru × 100/130 %): halqa tugmasi va ⓘ bilan kesishish 0 px; halqa chizig\'igacha eng kami ' + worst.toFixed(1) + ' px');
  /* 5. rang va kontrast: 80+ yashil, 60–79 sariq, < 60 to'q sariq; yoy ↔ fon ≥ 3:1, raqam ↔ fon ≥ 4,5:1 — yorug' va tungi */
  for (const scheme of ['light', 'dark']) { const p = await open(br, BASE, { w: 390, st: seed({ food: FX }), reduced: true, scheme, settle: 400 });
    const c = await p.evaluate(() => { const el = document.getElementById('sqChip'), o = {}; for (const k of ['hi', 'mid', 'lo']) { el.className = 'kc-sq sq-' + k; const bg = getComputedStyle(el.querySelector('.sq-md')).backgroundColor, cv = document.createElement('canvas').getContext('2d'); cv.fillStyle = bg; cv.fillRect(0, 0, 1, 1); const px = cv.getImageData(0, 0, 1, 1).data; o[k] = { arc: getComputedStyle(el.querySelector('.sq-arc')).stroke, num: getComputedStyle(el.querySelector('b')).color, bg: 'rgb(' + px[0] + ',' + px[1] + ',' + px[2] + ')', card: getComputedStyle(document.querySelector('.sl-big')).backgroundColor }; } return o; });
    const hue = (s) => { const [r, g, b] = s.match(/[\d.]+/g).map(Number); return g > r ? 'yashil' : g > b * 1.3 && g > r * 0.55 ? 'sariq' : 'to\'q sariq'; };
    for (const k of ['hi', 'mid', 'lo']) { const x = c[k]; assert.ok(cr(x.arc, x.bg) >= 3, scheme + ' ' + k + ': yoy kontrasti ' + cr(x.arc, x.bg).toFixed(2)); assert.ok(cr(x.num, x.bg) >= 4.5, scheme + ' ' + k + ': raqam kontrasti ' + cr(x.num, x.bg).toFixed(2)); }
    assert.equal(hue(c.hi.arc), 'yashil'); assert.notEqual(c.mid.arc, c.lo.arc); const [r, g] = c.lo.arc.match(/[\d.]+/g).map(Number); assert.ok(g / r > 0.3, scheme + ': < 60 — qizil emas (to\'q sariq): ' + c.lo.arc);
    ok(scheme + ': medal ranglari ' + ['hi', 'mid', 'lo'].map((k) => k + ' ' + c[k].arc + ' (yoy ' + cr(c[k].arc, c[k].bg).toFixed(1) + ':1, raqam ' + cr(c[k].num, c[k].bg).toFixed(1) + ':1)').join(', '));
    await p.context().close(); }
  const cls = await (async () => { const p = await open(br, BASE, { w: 390, st: seed({ food: FX }), reduced: true, settle: 300 }); const r = await p.evaluate(() => document.getElementById('sqChip').className); await p.context().close(); return r; })(); assert.match(cls, /sq-mid|sq-lo/);
  /* 6. animatsiya (deterministik): ekranga kirish — yoy 0 dan, raqam sanaladi (~700 ms); ovqat qo'shilib bal oshsa — eski → yangi + pulse + yaltirash; 80 ga yetganda — yulduzcha (kuniga 1); tushsa — faqat silliq o'tish */
  { const p = await open(br, BASE, { w: 390, st: seed({ food: FX }), reduced: false, settle: 1500 }); await p.evaluate(() => localStorage.removeItem('kalki_sq80')); await p.evaluate(CLOCK);
    await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(600);
    const e = await p.evaluate(async () => { const c = window.__clk; c.arm(); document.querySelector('[data-act=tab][data-v=today]').click(); const a0 = c.at(0), a100 = c.at(100), a350 = c.at(350), fin = await c.end(1500); return { a0, a100, a350, fin }; });
    const B0 = e.fin.b; assert.ok(B0 > 0 && B0 < 80, 'boshlang\'ich bal < 80: ' + B0); assert.ok(e.a0.off > 97 && e.a0.n <= 2, 'kirish — 0 dan: ' + JSON.stringify(e.a0));
    for (const x of [e.a100, e.a350]) { assert.ok(x.off < 100 - 1 && x.off > 100 - B0 + 1, 'yoy oraliq: ' + x.off); assert.ok(x.n > 0 && x.n < B0, 'raqam oraliq: ' + x.n); } assert.ok(e.a350.off < e.a100.off, 'yoy to\'lib boradi');
    assert.ok(Math.abs(e.fin.off - (100 - B0)) < 0.5 && e.fin.n === B0, 'oxiri: ' + JSON.stringify(e.fin)); assert.equal(e.a100.up, false, 'kirishda pulse yo\'q');
    ok('Kirish: yoy 100 → ' + (100 - B0) + ' (100 ms: ' + e.a100.off.toFixed(1) + ', 350 ms: ' + e.a350.off.toFixed(1) + '), raqam 0 → ' + B0 + ' (' + e.a100.n + ', ' + e.a350.n + ')');
    const u = await p.evaluate(async (f) => { const c = window.__clk; c.arm(); window.__add(f); const a100 = c.at(100), a350 = c.at(350), fin = await c.end(2500); return { a100, a350, fin }; }, LOV);
    const B1 = u.fin.b; assert.ok(B1 >= 80 && B1 > B0, 'qo\'shilgach ≥ 80: ' + B1); assert.equal(u.a100.up, true, 'oshdi — pulse'); assert.ok(u.a100.md > 0 && u.a100.sp > 0, 'pulse + yaltirash animatsiyasi: ' + JSON.stringify(u.a100)); assert.equal(u.a100.star, true, '80 ga bugun birinchi marta — yulduzcha'); assert.ok(u.a350.st + u.a100.st > 0 || u.fin.star);
    for (const x of [u.a100, u.a350]) { assert.ok(x.off < 100 - B0 && x.off > 100 - B1, 'eski → yangi yoy: ' + x.off); assert.ok(x.n >= B0 && x.n <= B1, 'raqam: ' + x.n); }
    ok('Qo\'shildi: ' + B0 + ' → ' + B1 + ' silliq (100 ms: ' + u.a100.n + '), pulse + yaltirash, 80 ga yetdi — yulduzcha');
    const d = await p.evaluate(async () => { const c = window.__clk, K = window.__kalkifit, t = K.S.dates.today(), L = K.S.dayOf(K.state, t).food; c.arm(); K.S.addFood(K.state, t, { fid: 'somsa', meal: 's', unit: 'porsiya', qty: 1, g: 100, kcal: 900, p: 10, f: 70, c: 60, ts: Date.now() }); K.render(); const a100 = c.at(100), fin = await c.end(2500); return { a100, fin, n: L.length }; });
    assert.ok(d.fin.b < B1, 'bal tushdi: ' + d.fin.b); assert.equal(d.a100.up, false, 'tushganda pulse yo\'q'); assert.equal(d.a100.sp + d.a100.md + d.a100.st, 0, 'tushganda effekt yo\'q'); assert.equal(d.a100.star, false); assert.ok(d.a100.off > 100 - B1 && d.a100.off < 100 - d.fin.b, 'tushish ham silliq: ' + d.a100.off);
    const s2 = await p.evaluate(async () => { const c = window.__clk, K = window.__kalkifit, t = K.S.dates.today(), L = K.S.dayOf(K.state, t).food; L.splice(L.findIndex((e) => e.fid === 'somsa'), 1); c.arm(); K.render(); const a = c.at(100); await c.end(2500); return a; });
    assert.equal(s2.star, false, 'yulduzcha kuniga bir marta'); assert.equal(s2.up, true);
    ok('Bal tushdi (' + B1 + ' → ' + d.fin.b + '): faqat silliq o\'tish, pulse/yaltirash yo\'q; yana 80+ — yulduzcha qayta chiqmaydi (kuniga 1)');
    /* oyna: 5 chiziq ketma-ket o'sadi (transform scaleX, kechikish ortib boradi) */
    await p.click('#sqChip'); await p.waitForSelector('#sqRows .sq-bar i');
    const bars = await p.evaluate(() => [...document.querySelectorAll('#sqRows .sq-bar i')].map((e) => { const a = e.getAnimations()[0]; return a ? { delay: a.effect.getTiming().delay, prop: Object.keys(a.effect.getKeyframes()[0]).filter((k) => !/offset|easing|composite|computedOffset/.test(k)) } : null; }));
    assert.equal(bars.length, 5); bars.forEach((b, i) => { assert.ok(b, 'chiziq ' + i + ' animatsiyasi'); assert.deepEqual(b.prop, ['transform']); if (i) assert.ok(b.delay > bars[i - 1].delay, 'ketma-ket'); });
    ok('Oyna: 5 komponent chizig\'i ketma-ket o\'sadi (faqat transform; kechikish ' + bars.map((b) => Math.round(b.delay)).join('/') + ' ms)'); assert.deepEqual(p.errs, []); await p.context().close(); }
  /* 7. reduced-motion: animatsiya yo'q — qiymat darhol */
  { const p = await open(br, BASE, { w: 390, st: seed({ food: FX }), reduced: true, settle: 400 }); await p.evaluate(CLOCK);
    const r = await p.evaluate(async (f) => { const c = window.__clk; c.arm(); window.__add(f); const a = c.at(16); return Object.assign(a, { an: document.getElementById('sqChip').getAnimations({ subtree: true }).length }); }, LOV);
    assert.equal(r.an, 0, 'reduced-motion: animatsiya yo\'q'); assert.equal(r.n, r.b); assert.ok(Math.abs(r.off - (100 - r.b)) < 0.5);
    await p.click('#sqChip'); await p.waitForSelector('#sqRows .sq-bar i'); assert.equal(await p.evaluate(() => document.querySelector('#sqRows').getAnimations({ subtree: true }).length), 0); assert.equal(await txt(p, '#sqBall'), String(r.b));
    ok('reduced-motion: medal va oyna chiziqlari animatsiyasiz, qiymat darhol (' + r.b + ')'); await p.context().close(); }
} finally { await B.chromium.close(); if (B.webkit) await B.webkit.close(); srv.close(); }
console.log('sifat-ui: ' + n + ' guruh OK');
