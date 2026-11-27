// KalkiFit v105: TIL ARALASHUVI — uchta rejimda (uz-lotin, ЎЗ, ru) ilova ekranlari, oynalar, «Haftangiz» slaydlari, ulashish rasmlari (canvas fillText),
// push/bildirishnoma matnlari va maslahatchi matnlari render qilinib tekshiriladi:
//   uz — kirill harfi yo'q; ЎЗ — lotin so'z yo'q; ru — o'zbekcha-lotin so'z yo'q. Istisno: brend/birlik (translit.js DEFAULT_ABBR + ALLOW), til tugmalari (data-cyr=skip).
// Sinov holati ataylab «xavfli»: maslahatchi ismi kirillcha («Холмс» — foydalanuvchi yozgan), fid'siz ruscha yozuv («гранат»), boshqa tilda qo'shilgan yozuvlar, hafta ma'lumoti (yo'l, puls).
//   node tools/dizayn/test-til-aralash.mjs            (SHOW=1 — topilganlarni chiqarish)
import assert from 'node:assert/strict';
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { server, brauzerlar, seed, T0, D, ROOT } from './sigmaslik-yadro.mjs';
const require = createRequire(import.meta.url); const TR = require(path.join(ROOT, 'assets/translit.js')), MS = require(path.join(ROOT, 'assets/kalkifit-maslahat.js')), M = require(path.join(ROOT, 'assets/kalkifit-maslahat-matn.js')), KI = require(path.join(ROOT, 'assets/kalkifit-ism.js'));
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
/* brend/birlik — har rejimda lotincha qolishi mumkin */
const ALLOW = new Set(TR.DEFAULT_ABBR.concat(['KalkiFit', 'Kalki', 'AI', 'OK', 'BMI', 'kcal', 'Wi-Fi', 'SE', 'iPhone', 'Android', 'Google', 'Telegram', 'Health', 'Connect', 'Fit', 'Samsung']).flatMap((w) => String(w).split(/[\s.]+/)));
const CYR = /[А-Яа-яЁёЎўҚқҒғҲҳ]/, latWords = (s) => (s.match(/[A-Za-z][A-Za-z0-9'’ʻ‘-]*/g) || []).map((w) => w.replace(/['’ʻ‘-]+$/, '')).filter((w) => w.length > 1 && !ALLOW.has(w) && !/^[A-Z][A-Z0-9-]+$/.test(w));          // katta harfli qisqartma (AMD, BCAA, DHA) — istisno
const bad = (s, mode) => mode === 'uz' ? CYR.test(s) : latWords(s).length > 0;
/* ---------------- 1. maslahatchi va push matnlari (node) ---------------- */
if (!process.env.ONLY_UI) { const SAMPLE = { uz: { name: 'anor', src: 'qozon-kabob va non', Src: 'Qozon-kabob va non', dish: 'Qozon-kabob', alt: 'dimlama, mastava', top: 'grechka, loviya', fix: '200 g tovuq ko\'kragi va 150 g bodring', m: 'oqsil', M: 'Oqsil', f: 'Osh', ab: '0,2–0,3 kg', cd: 'juda oz' },
    ru: { name: 'гранат', src: 'казан-кабоб и хлеб', Src: 'Казан-кабоб и хлеб', dish: 'Казан-кабоб', alt: 'димлама, мастава', top: 'гречка, фасоль', fix: '200 г куриной грудки и 150 г огурцов', m: 'белок', M: 'Белок', f: 'Плов', ab: '0,2–0,3 кг', cd: 'совсем немного' } };
  const NUM = { x: 25, p: 40, sh: 52, k: '1 200', min: '1 500', l: '2 400', left: 400, n: 3, t: 7, v: 131, g: 130, pg: 22, pleft: 30, fg: 24, pct: 26, dw: '0,8' };
  const errs = []; let cnt = 0;
  for (const L of ['uz', 'ru']) for (const m of ['hazil', 'jiddiy']) for (const k of Object.keys(M[L][m])) M[L][m][k].forEach((tpl, i) => { for (const g of ['f', 'm']) {
    const t = MS.say(k, Object.assign({}, NUM, SAMPLE[L]), { lang: L, mode: m, i, g, ism: L === 'ru' ? 'Холмс' : 'Holms' }); cnt++;
    if (bad(t, L)) errs.push(`${L}/${m}/${k}#${i}: «${t}»`);
    if (L === 'uz') { const c = TR.translit(t); if (latWords(c).length) errs.push(`ЎЗ ${m}/${k}#${i}: «${c}» (${latWords(c)})`); } } });
  assert.deepEqual(errs.slice(0, 8), [], 'maslahatchi matnlarida til aralashuvi'); ok('Maslahatchi: ' + cnt + ' render (uz/ru × hazil/jiddiy × ayol/erkak) + ЎЗ translit — aralashuv yo\'q');
  /* push (veb + Android): sarlavha va matn har rejimda */
  const Q = await import(path.join(ROOT, 'functions/_lib/eslatma-qoida.js')), tx = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/eslatmalar.json'), 'utf8')), pe = []; let pc = 0;
  for (const til of ['uz', 'cyr', 'ru']) for (const u of ['hazil', 'jiddiy']) for (const ism of [null, 'Lola', 'Лола', 'Холмс', 'Holms']) for (const it of [{ meal: 'b' }, { meal: 'l' }, { meal: 's' }, { meal: 'd' }, { kind: 'x', miss: 'b' }, { kind: 'x', miss: 'l' }])
    for (let i = 0; i < 6; i++) { const r = Q.matn(tx, til, it, i, TR.translit, u, ism); pc++; const md = til === 'cyr' ? 'cyr' : til; for (const s of [r.t, r.b]) if (bad(s, md)) pe.push(til + '/' + u + '/' + ism + ': «' + s + '»'); }
  assert.deepEqual([...new Set(pe)].slice(0, 6), [], 'push matnlarida aralashuv'); ok('Push: ' + pc + ' xabar (uz/ЎЗ/ru × uslub × ism × ovqat) — sarlavha va matn joriy yozuvda');
  assert.equal(KI.yozuv('Холмс', 'uz'), 'Holms'); assert.equal(KI.yozuv('Holms', 'ru'), 'Холмс'); assert.equal(KI.yozuv('Холмс', 'cyr'), 'Холмс'); assert.equal(KI.yozuv('Lola', 'ru'), 'Лола');
  ok('Ism yozuvi: uz Holms · ЎЗ Холмс · ru Холмс (saqlangan qiymat o\'zgarmaydi)'); }
/* ---------------- 2. brauzer: ekranlar, oynalar, Haftangiz, ulashish rasmlari ---------------- */
const SCAN = (mode) => { const out = [], CY = /[А-Яа-яЁёЎўҚқҒғҲҳ]/, A = new Set(window.__allow);
  const lw = (s) => (s.match(/[A-Za-z][A-Za-z0-9'’ʻ‘-]*/g) || []).map((w) => w.replace(/['’ʻ‘-]+$/, '')).filter((w) => w.length > 1 && !A.has(w) && !/^[A-Z][A-Z0-9-]+$/.test(w));
  const isBad = (s) => { s = s.replace(/\b[\w-]+(\.[\w-]+)*\.(uz|com|org|net)(\/\S*)?/gi, ' '); return mode === 'uz' ? CY.test(s) : lw(s).length > 0; };          // domen/URL — istisno
  const vis = (e) => { for (let a = e; a && a !== document.body; a = a.parentElement) { if (a.hidden) return false; const c = getComputedStyle(a); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0 && a.id !== 'hkStory') return false; } return e.getClientRects().length > 0; };
  const skip = (e) => !!e.closest('[data-cyr=skip],script,style,noscript,[data-user],.rz-langwrap,#rzLangMenu,.sl-lp,input,textarea,[contenteditable]');
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let t;
  while ((t = w.nextNode())) { const s = t.textContent.trim(); if (!s || !t.parentElement || skip(t.parentElement) || !vis(t.parentElement)) continue; if (isBad(s)) out.push(s.slice(0, 90) + '  ⟵ ' + (t.parentElement.id || t.parentElement.className || t.parentElement.tagName)); }
  document.querySelectorAll('[aria-label],[title],[placeholder]').forEach((e) => { if (skip(e) || !vis(e)) return; ['aria-label', 'title', 'placeholder'].forEach((a) => { const s = e.getAttribute(a); if (s && isBad(s)) out.push('@' + a + ' «' + s.slice(0, 80) + '» ⟵ ' + (e.id || e.className)); }); });
  (window.__cv || []).splice(0).forEach((s) => { if (isBad(s)) out.push('canvas «' + s.slice(0, 80) + '»'); });
  return [...new Set(out)]; };
const st0 = () => { const food = []; for (let i = 0; i < 7; i++) { const d = D.addDays(T0, -i); food.push([d, 'osh', 'l', 750, 25, 32, 90], [d, 'tuxum', 'b', 160, 13, 11, 1], [d, 'tovuq-kokrak', 'd', 330, 60, 8, 0]); }
  const st = seed({ food, steps: 9000, water: 1500, ex: 30 }); st.prefs.lola = { av: 'timur', ism: 'Холмс' }; st.prefs.mslMode = 'hazil'; st.prefs.city = 'qarshi';
  for (let i = 1; i < 7; i++) { const d = D.addDays(T0, -i); st.days[d].steps = 8000 + i * 700; st.days[d].ex = [{ id: 'e' + i, t: 'yugurish', min: 30, lv: 1, ts: 1 }]; }
  st.days[T0].food.push({ id: 'g1', name: 'гранат', meal: 's', unit: 'g', qty: 200, g: 200, kcal: 166, p: 3, f: 2, c: 38, ts: 99 }, { id: 'g2', name: 'Olma', meal: 's', unit: 'g', qty: 150, g: 150, kcal: 78, p: 0, f: 0, c: 20, ts: 100 });
  st.weights = [-20, -14, -9, -4, 0].map((i, j) => ({ d: D.addDays(T0, i), kg: 82 - j * 0.4 })); return st; };
const { srv, BASE } = await server(); const B = await brauzerlar(); const br = B.chromium; const found = {};
async function page(mode) {
  const c = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', deviceScaleFactor: 1 });
  await c.addInitScript((a) => { try { if (!sessionStorage.getItem('__t0')) { sessionStorage.setItem('__t0', '1'); localStorage.setItem('kalki_fit', a.st); localStorage.setItem('kalki_lang', a.lang); localStorage.setItem('kalki_intro_v2', '1'); localStorage.setItem('kalki_no_fc', '1'); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); } } catch (e) {}
    window.__allow = a.allow; window.__cv = []; const P = CanvasRenderingContext2D.prototype; ['fillText', 'strokeText'].forEach((k) => { const o = P[k]; P[k] = function (s) { try { window.__cv.push(String(s)); } catch (e) {} return o.apply(this, arguments); }; });
    navigator.share = () => Promise.resolve(); navigator.canShare = () => true; },
  { st: JSON.stringify(st0()), lang: mode, allow: [...ALLOW] });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await p.goto(BASE + (mode === 'ru' ? '/ru/kalkifit' : mode === 'cyr' ? '/kalkifit?lang=cyr' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForSelector('#bjuCard'); await p.waitForTimeout(900); return p;
}
const MODES = [['uz', 'uz'], ['cyr', 'ЎЗ'], ['ru', 'ru']];
try {
  for (const [mode, nm] of MODES) {
    const md = mode === 'cyr' ? 'cyr' : mode, p = await page(mode), F = found[nm] = {}, settle = (ms = 450) => p.waitForTimeout(ms);
    const scan = async (where) => { await settle(250); const r = await p.evaluate(SCAN, md === 'uz' ? 'uz' : 'x'); if (r.length) F[where] = r; };
    const close = async () => { await p.keyboard.press('Escape'); await settle(350); };
    await scan('Bugun');
    for (const [sel, w] of [['#kcalBtn', 'Kaloriya oynasi'], ['#sqChip', 'Sifat oynasi'], ['#mainAdd', 'Qo\'shish oynasi'], ['#bjuCard [data-act]', 'Makro oynasi']]) { if (await p.locator(sel).count()) { await p.locator(sel).first().click(); await settle(); await scan(w); await close(); } }
    /* v107: porsiya oynasi — tayyorlash usuli chiplari (Tovada qovurilgan · Duxovkada · Aerogrilda · Bug'da) */
    { await p.click('#mainAdd'); await p.waitForSelector('#fdQ'); await p.fill('#fdQ', mode === 'ru' ? 'котлета куриная' : 'tovuq kotleti'); await settle(700);
      await p.locator('#fdRes .sl-rw [data-act=pickfood]').first().click(); await p.waitForSelector('#fdUsul'); await p.click('#fdUsul [data-o=aerogril]'); await settle(); await scan('Porsiya oynasi (usul chiplari)'); await close(); await close(); }
    if (await p.locator('.sl-week7 .wd').count()) { await p.locator('.sl-week7 .wd').nth(5).click(); await settle(); await scan('Kecha (kun xulosasi)'); await p.click('.wk-back').catch(() => {}); await settle(); }
    await p.click('[data-act=tab][data-v=history]'); await settle(700); await scan('Tahlil');
    if (await p.locator('#hkCard').count()) { await p.click('#hkCard'); await p.waitForSelector('#hkStory .hk-sl.on'); await settle(600); const k = await p.locator('#hkStory .hk-prog span').count();
      for (let i = 0; i < k; i++) { await scan('Haftangiz slayd ' + (i + 1)); await p.evaluate(() => { const el = document.getElementById('hkStory'); if (!el) return; const W = el.clientWidth; el.dispatchEvent(new PointerEvent('pointerdown', { clientX: W * 0.85, clientY: 300, bubbles: true })); el.dispatchEvent(new PointerEvent('pointerup', { clientX: W * 0.85, clientY: 300, bubbles: true })); }); await settle(500); }
      if (await p.locator('#hkStory').count()) { for (const b of ['share', 'save']) { const l = p.locator('#hkStory [data-hk=' + b + ']'); if (await l.count()) { await l.first().click().catch(() => {}); await settle(900); } } await scan('Haftangiz ulashish rasmlari'); }
      await p.keyboard.press('Escape'); await settle(500); }
    await p.click('[data-act=tab][data-v=advice]').catch(() => {}); await settle(700); await scan('Maslahat');
    const who = await p.evaluate(() => (document.querySelector('.lola-n b') || {}).textContent || ''); assert.equal(who, mode === 'uz' ? 'Holms' : 'Холмс', nm + ': maslahatchi ismi joriy yozuvda');
    await p.click('[data-act=tab][data-v=more]').catch(() => {}); await settle(700); await scan('Yana');
    /* Yana — har bir imkoniyatni ochib (oyna/ekran), skaner va yopish; kamera/ovoz/tashqi havola talab qiladiganlari o'tkaziladi */
    const rows = await p.evaluate(() => [...document.querySelectorAll('.sl-morec [data-act]')].map((e, i) => ({ i, a: e.getAttribute('data-act'), k: e.getAttribute('data-k') || e.getAttribute('data-f') || '', t: (e.textContent || '').trim().slice(0, 30) })));
    for (const r of rows) { if (/ovoz|rasm|shtrix|yorliq|menyu|kamera|exshot|share|tel|ext/i.test(r.a + ' ' + r.k)) continue;
      await p.click('[data-act=tab][data-v=more]').catch(() => {}); await settle(400); const el = p.locator('.sl-morec [data-act]').nth(r.i); if (!(await el.count())) continue;
      await el.click({ timeout: 3000 }).catch(() => {}); await settle(700); await scan('Yana → ' + r.t); await p.keyboard.press('Escape'); await settle(300); await p.keyboard.press('Escape'); await settle(300); }
    if (await p.locator('.hd-av').count()) { await p.locator('.hd-av').first().click(); await settle(700); await scan('Profil'); }
    assert.deepEqual(p.errs, [], nm + ' JS xato'); await p.context().close();
  }
  /* bildirishnoma havolasi eski tilda (obuna ru paytida) — foydalanuvchi tanlagan tilga o'tadi */
  for (const [want, from, exp] of [['uz', '/ru/kalkifit?hafta=1', '/kalkifit'], ['ru', '/kalkifit?eslatma=l&k=1', '/ru/kalkifit'], ['cyr', '/ru/kalkifit?hafta=1', '/kalkifit']]) {
    const c = await br.newContext({ serviceWorkers: 'block' }); await c.addInitScript((a) => { try { localStorage.setItem('kalki_fit', a.st); localStorage.setItem('kalki_lang', a.l); localStorage.setItem('kalki_intro_v2', '1'); } catch (e) {} }, { st: JSON.stringify(st0()), l: want });
    const p = await c.newPage(); await p.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' })); await p.goto(BASE + from); await p.waitForURL((u) => u.pathname === exp, { timeout: 8000 }); await p.waitForSelector('#rzApp'); await p.waitForTimeout(600);
    const g = await p.evaluate(() => [localStorage.getItem('kalki_lang'), document.documentElement.lang, document.documentElement.getAttribute('data-script')]); assert.equal(g[0], want, 'tanlov saqlanadi'); assert.equal(g[1], want === 'ru' ? 'ru' : 'uz'); if (want === 'cyr') assert.equal(g[2], 'cyr'); await c.close(); }
  ok('Bildirishnoma havolasi eski tilda bo\'lsa — tanlangan tilga (uz/ru/ЎЗ) o\'tadi, parametrlar saqlanadi');
} finally { await B.chromium.close(); if (B.webkit) await B.webkit.close(); srv.close(); }
const tot = Object.values(found).reduce((a, F) => a + Object.values(F).reduce((x, l) => x + l.length, 0), 0);
if (tot || process.env.SHOW) for (const [nm, F] of Object.entries(found)) for (const [w, l] of Object.entries(F)) { console.log('— ' + nm + ' · ' + w); l.forEach((s) => console.log('    ' + s)); }
assert.equal(tot, 0, 'til aralashuvi topildi: ' + tot + ' ta');
ok('Ekranlar (Bugun, kaloriya/sifat/qo\'shish/makro oynalari, kun xulosasi, Tahlil, Haftangiz — barcha slaydlar va ulashish rasmlari, Maslahat, Yana, Profil) × uz/ЎЗ/ru — aralashuv yo\'q');
console.log('til-aralash: ' + n + ' guruh OK');
