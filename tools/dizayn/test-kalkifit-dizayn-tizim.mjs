// KalkiFit v69: DIZAYN TIZIMI. 1) tokenlar bitta joyda (kalkifit.css): tipografiya, karta, tugma; v69 bloklarida qattiq rang (#hex/rgb) va 600 dan og'ir shrift YO'Q;
// 2) Imkoniyatlar paneli: 4 yo'l (ichidagilari), «Bilim» qatori, tanishtiruv havolasi paneldan chiqdi (Profil → Sozlamalar), pastdan 220–280 ms, doimiy puls yo'q, reduced-motion;
// 3) kontekstli chiplar (Odatdagilarga saqlash / Kechki ovqat tanlash / Haftangiz tayyor): shartlar va «yopilgach boshqa chiqmaydi»;
// 4) kontrast (axe, WCAG AA) Bugun / panel / yo'l / Profil / Tarix / chip — yorug' va tungi; emoji — faqat hazil/afsona (UI'da chiziqli ikonka).   node tools/dizayn/test-kalkifit-dizayn-tizim.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates; const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const REAL_TODAY = D.today(), TODAY = D.addDays(REAL_TODAY, -((new Date().getDay() - 3 + 7) % 7));          // «bugun» — eng yaqin o'tgan CHORSHANBA: «Haftangiz» (yakshanba 19:00 – dushanba) kabi hafta kuniga bog'liq qoidalar testni tebratmasin
function seed({ days = 4, dinner = false } = {}) {
  const st = S.emptyState(); st.setup = true; st.created = Date.now() - 12 * 864e5; st.prefs = { tipsDone: true, jokes: false, lpTip: 1, introDone: true, yemayK: 1 }; st.profile = { sex: 'm', age: 32, height: 178, weight: 82, act: 3, goal: 'lose', goalWeight: 76 }; st.trackStart = D.addDays(TODAY, -3); S.addWeight(st, D.addDays(TODAY, -2), 82);
  const add = (d, fid, g, kc, m) => S.addFood(st, d, { fid, meal: m, unit: 'g100', qty: g, g, kcal: kc, p: kc / 20, f: kc / 40, c: kc / 12, ts: 1 });
  for (let i = days - 1; i >= 1; i--) { add(D.addDays(TODAY, -i), 'osh', 350, 665, 'l'); add(D.addDays(TODAY, -i), 'tuxum', 100, 155, 'b'); }
  add(TODAY, 'tuxum', 100, 155, 'b'); add(TODAY, 'osh', 350, 665, 'l'); if (dinner) add(TODAY, 'tuxum', 100, 155, 'd'); return st;
}
async function open(url, { state = seed(), w = 390, h = 844, scheme = 'light', fakeHour = null, reduce = false } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: scheme, reducedMotion: reduce ? 'reduce' : 'no-preference' });
  await c.addInitScript((o) => { try { if (!sessionStorage.getItem('__t')) { sessionStorage.setItem('__t', '1'); localStorage.setItem('kalki_fit', JSON.stringify(o.state)); } localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_lang', 'uz');
    { const R = Date, pp = o.vt.split('-'); const off = new R(+pp[0], +pp[1] - 1, +pp[2], o.fakeHour != null ? o.fakeHour : new R().getHours(), 5, 0, 0).getTime() - R.now(); class D2 extends R { constructor(...a) { if (a.length === 0) super(R.now() + off); else super(...a); } static now() { return R.now() + off; } } window.Date = D2; } } catch (e) {} }, { state, fakeHour, vt: TODAY });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(900); return p;
}
const chipTxt = (p) => p.evaluate(() => { const e = document.getElementById('rzChip'); return e && !e.hidden ? e.querySelector('.sl-chip span').textContent : null; });
const waitChip = async (p, ms = 9000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const c = await chipTxt(p); if (c) return c; await p.waitForTimeout(300); } return null; };
const axeRun = async (p, sel) => { await p.evaluate(AXE); return p.evaluate(async (s) => { const x = await axe.run(document.querySelector(s), { resultTypes: ['violations'], runOnly: { type: 'rule', values: ['color-contrast'] } }); return x.violations.flatMap((v) => v.nodes.map((nd) => nd.target.join(' ').slice(0, 60) + ' ' + (nd.any[0] ? nd.any[0].message.slice(0, 140) : ''))); }, sel); };
const msOf = (d) => parseFloat(d) * (/ms$/.test(d) ? 1 : 1000);
try {
  /* 1. tokenlar (kalkifit.css) */
  const css = fs.readFileSync(path.join(ROOT, 'assets/css/kalkifit.css'), 'utf8'), tok = css.slice(css.indexOf('/* v69 DIZAYN TIZIMI — tipografiya'));
  for (const [k, v] of [['--fs-page', '30px'], ['--fs-sec', '18px'], ['--fs-body', '16px'], ['--fs-aux', '13px'], ['--h-btn', '54px'], ['--ms-panel', '280ms'], ['--pad-c', '18px'], ['--r-c', '22px']]) assert.ok(new RegExp(k + ':' + v).test(tok), 'token: ' + k + ' = ' + v);
  assert.match(tok, /--fs-nav:12px/); assert.match(tok, /--fs-hero:56px/); assert.match(css, /--fs-hero:58px/);
  const v69all = css.slice(css.indexOf('/* ===================== v69 DIZAYN TIZIMI: sarlavha')), v70i = v69all.indexOf('/* ===================== v70:'), v69 = v70i > 0 ? v69all.slice(0, v70i) : v69all, v70 = v70i > 0 ? v69all.slice(v70i) : '';
  assert.deepEqual(v70.match(/#[0-9A-Fa-f]{3,8}\b|rgba?\([^)]*\)/g) || [], [], 'v70 bloklarida ham qattiq rang yo\'q'); assert.deepEqual(v70.match(/font-weight:\s*(8|9)00|font-weight:\s*bold/g) || [], [], 'v70: shrift og\'irligi ≤ 700 (faqat sarlavha va halqa raqami 700)');
  assert.deepEqual(v69.match(/#[0-9A-Fa-f]{3,8}\b|rgba?\([^)]*\)/g) || [], [], 'v69 bloklarida qattiq rang yo\'q — faqat tokenlar'); assert.deepEqual(v69.match(/font-weight:\s*(7|8|9)00|font-weight:\s*bold/g) || [], [], 'v69: shrift og\'irligi ≤ 600');
  assert.ok((v69.match(/min-height:var\(--h-btn\)/g) || []).length >= 1, 'asosiy tugma balandligi tokendan');
  let p = await open('/kalkifit');
  const m = await p.evaluate(() => { const g = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e) : null; }, mb = document.querySelector('#mainAdd'), card = g('#bjuCard'), hd = g('#todayHd'); return { title: hd.fontSize, tw: hd.fontWeight, btn: Math.round(mb.getBoundingClientRect().height), cardSh: card.boxShadow }; });
  assert.equal(m.title, '30px'); assert.ok(+m.tw >= 600 && +m.tw <= 700); assert.ok(m.btn >= 48 && m.btn <= 64, 'v93: ➕ tugmasi (markaziy) 48–64: ' + m.btn); assert.equal(m.cardSh, 'none', 'oddiy karta tekis (soya faqat ko\'tarilgan panelda)');
  ok('tokenlar: 28/20/16/14/12.5, ring 52 (katta shriftda 54), karta 18/22, tugma 54; v69 bloklarida #hex/rgb va og\'ir shrift yo\'q; Bugun sarlavhasi 28, tugma 52–56, karta tekis');

  /* 2. Imkoniyatlar paneli: 4 yo'l */

  /* 3. kontekstli chiplar */
  p = await open('/kalkifit', { fakeHour: 19, state: seed({ days: 2 }) });          // 2 kun yozuv (<3) — «Haftangiz» yo'q; 19:05, kechki bo'sh
  assert.equal(await waitChip(p), 'Kechki ovqat tanlash', 'kechki ovqat bo\'sh, 17:00 dan keyin');
  await p.click('#rzChip .sl-chip-x'); await p.waitForTimeout(300); assert.equal(await chipTxt(p), null, 'yopildi'); await p.reload({ waitUntil: 'networkidle' }); assert.equal(await waitChip(p, 5000), null, 'yopilgach shu kuni qayta chiqmaydi');
  p = await open('/kalkifit', { fakeHour: 10, state: seed({ days: 2 }) }); assert.equal(await waitChip(p, 5000), null, '17:00 dan oldin yo\'q');
  p = await open('/kalkifit', { fakeHour: 19, state: seed({ days: 2, dinner: true }) }); assert.equal(await waitChip(p, 5000), null, 'kechki ovqat bor — yo\'q');
  const isMon = S.weekdayIdx(TODAY) === 0;          // v76: «Haftangiz tayyor» chipi — DUSHANBA kuni ilk ochilishda (o'tgan Du–Ya haftada 3+ kun yozuv); boshqa kunlari chip yo'q (nudge kartasi yakshanba kechqurun)
  p = await open('/kalkifit', { fakeHour: 10, state: seed({ days: 4 }) }); if (isMon) assert.equal(await waitChip(p), 'Haftangiz tayyor', 'dushanba: 3+ kun yozuv'); else assert.equal(await waitChip(p, 4000), null, 'dushanba emas — Haftangiz chipi yo\'q');
  if (isMon) { await p.click('#rzChip .sl-chip-x'); await p.waitForTimeout(300); await p.reload({ waitUntil: 'networkidle' }); assert.equal(await waitChip(p, 5000), null, 'Haftangiz: yopilgach shu haftada qayta chiqmaydi'); }
  p = await open('/kalkifit', { fakeHour: 10, state: seed({ days: 2 }) }); assert.equal(await waitChip(p, 5000), null, '<3 kun — Haftangiz chipi yo\'q');
  if (isMon) { p = await open('/kalkifit', { fakeHour: 10, state: seed({ days: 4 }) }); await waitChip(p); await p.click('#rzChip .sl-chip'); await p.waitForTimeout(900); assert.ok(await p.evaluate(() => document.documentElement.classList.contains('hk-on') || !!document.querySelector('.hk')), 'chip «Haftangiz»ni ochadi'); }
  ok('chiplar: «Kechki ovqat tanlash» (17:00 dan keyin, kechki bo\'sh; yopilsa shu kuni qayta yo\'q), «Haftangiz tayyor» (faqat dushanba, 3+ kun; yopilsa shu haftada qayta yo\'q; bosilsa ochiladi); shart bajarilmasa chiqmaydi');
  /* «Odatdagilarga saqlash»: osh 2+ marta yozilgan, yana qo'shilgach */
  p = await open('/kalkifit', { fakeHour: 10, state: seed({ days: 2 }) });
  await p.click('#mainAdd'); await p.waitForTimeout(700); await p.keyboard.type('osh'); await p.waitForTimeout(800);
  await p.locator('[data-act=pickfood]').first().click(); await p.waitForTimeout(800); await p.locator('[data-act=fsave]').first().click(); await p.waitForTimeout(900);
  { const t0 = Date.now(); let c = null; while (Date.now() - t0 < 14000 && !c) { c = await p.evaluate(() => { const e = document.querySelector('#rzChipIn .sl-chip span'); return e ? e.textContent : null; }); if (!c) await p.waitForTimeout(300); } assert.equal(c, 'Odatdagilarga saqlash', 'osh 2+ marta yozilgan — saqlash chipi (ovqat qatori OSTIDA)');
    const pos = await p.evaluate(() => { const ch = document.getElementById('rzChipIn'), pr = ch.previousElementSibling, r = ch.getBoundingClientRect(), pb = pr.getBoundingClientRect(); return { below: r.top >= pb.bottom - 1, inFlow: getComputedStyle(ch).position !== 'fixed' && getComputedStyle(ch).position !== 'absolute', floating: !!document.querySelector('#rzChip:not([hidden])'), prev: pr.className }; }); assert.ok(pos.below && pos.inFlow && !pos.floating, 'chip oqimda, qator ostida, suzuvchi emas: ' + JSON.stringify(pos));
    await p.waitForTimeout(6500); assert.equal(await p.locator('#rzChipIn').count(), 0, '6 s dan keyin o\'zi yo\'qoladi'); }
  p = await open('/kalkifit', { fakeHour: 10, state: seed({ days: 2 }) }); await p.click('#mainAdd'); await p.waitForTimeout(700); await p.keyboard.type('osh'); await p.waitForTimeout(800); await p.locator('[data-act=pickfood]').first().click(); await p.waitForTimeout(800); await p.locator('[data-act=fsave]').first().click(); await p.waitForTimeout(900); await p.waitForSelector('#rzChipIn .sl-chip', { timeout: 14000 });
  await p.click('#rzChipIn .sl-chip'); await p.waitForTimeout(500); assert.ok(await p.evaluate(() => (window.__kalkifit.state.tpls || []).some((t) => t.items.some((x) => x.fid === 'osh'))), 'odatdagiga saqlandi'); assert.equal(await p.locator('#rzChipIn').count(), 0);
  ok('chip «Odatdagilarga saqlash»: 2+ marta yozilgan taom qo\'shilgach; bosilsa «Odatdagi»ga yoziladi');

  /* «Mening kosam»: porsiya oynasida (idishli taom 2+ marta yozilgan, o'z idishi yo'q) — bitta chip; yopilsa shu taom uchun qayta chiqmaydi */
  p = await open('/kalkifit', { fakeHour: 10, state: seed({ days: 4 }) });
  await p.click('#mainAdd'); await p.waitForTimeout(700); await p.keyboard.type('osh'); await p.waitForTimeout(800); await p.locator('[data-act=pickfood]').first().click(); await p.waitForTimeout(900);
  assert.equal(await p.locator('#vSug .sl-chip span').first().textContent(), 'Mening kosam'); assert.equal(await p.locator('#vSug').count(), 1);
  await p.click('#vSug .sl-chip-x'); await p.waitForTimeout(400); assert.equal(await p.locator('#vSug').count(), 0, 'yopildi'); await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  await p.click('#mainAdd'); await p.waitForTimeout(700); await p.keyboard.type('osh'); await p.waitForTimeout(800); await p.locator('[data-act=pickfood]').first().click(); await p.waitForTimeout(900); assert.equal(await p.locator('#vSug').count(), 0, 'yopilgach qayta chiqmaydi');
  ok('chip «Mening kosam»: porsiya oynasida bitta chip; yopilsa shu taom uchun qayta chiqmaydi');

  /* 4. kontrast (axe) + emoji faqat hazil/afsonada */
  for (const th of ['light', 'dark']) {
    p = await open('/kalkifit', { scheme: th, fakeHour: 19, state: seed({ days: 2 }) }); await waitChip(p);          /* v76: chip — «Kechki ovqat tanlash» (Haftangiz chipi faqat dushanba) */
    let v = await axeRun(p, '#rzMain'); assert.deepEqual(v, [], th + ' Bugun kontrast: ' + v.join('; ')); v = await axeRun(p, '#rzChip'); assert.deepEqual(v, [], th + ' chip kontrast: ' + v.join('; '));
    await p.click('#rzChip .sl-chip-x'); await p.click('.rz-tab[data-v=more]'); await p.waitForTimeout(600); v = await axeRun(p, '#rzMain'); assert.deepEqual(v, [], th + ' Yana kontrast: ' + v.join('; '));
    await p.click('.rz-tab[data-v=advice]'); await p.waitForTimeout(600); v = await axeRun(p, '#rzMain'); assert.deepEqual(v, [], th + ' Maslahat kontrast: ' + v.join('; '));
    await p.click('#rzAv'); await p.waitForTimeout(700); v = await axeRun(p, '#rzMain'); assert.deepEqual(v, [], th + ' Profil kontrast: ' + v.join('; '));
    await p.click('.rz-tab[data-v=history]'); await p.waitForTimeout(700); v = await axeRun(p, '#rzMain'); assert.deepEqual(v, [], th + ' Tarix kontrast: ' + v.join('; '));
  }
  ok('kontrast (WCAG AA, axe): Bugun, chip, panel, yo\'l, Profil, Tarix — yorug\' va tungi');
  const src = fs.readFileSync(path.join(ROOT, 'assets/kalkifit-app.js'), 'utf8'), EM = /[\u{1F300}-\u{1FAFF}\u{23F0}-\u{23FF}\u{25B6}\u{2B50}]/u;
  const bad = src.split('\n').filter((l) => !/jkRow/.test(l) && EM.test(l) && /class="ic"[^>]*>[^<]*[\u{1F300}-\u{1FAFF}]|row\('[\u{1F300}-\u{1FAFF}]|setRow\('[a-zA-Z]+', '[\u{1F300}-\u{1FAFF}]|<small><span aria-hidden="true">[\u{1F300}-\u{1FAFF}]/u.test(l));
  assert.deepEqual(bad.map((l) => l.trim().slice(0, 90)), [], 'UI ikonkalarida emoji yo\'q (faqat hazil/afsona matnida)');
  assert.ok(!/S\.EX\[[a-z0-9.]+\]\.e/.test(src), 'mashg\'ulot turlari — chiziqli ikonka (S.EX.e emoji ishlatilmaydi)');
  const ex = fs.readFileSync(path.join(ROOT, 'assets/kalkifit-yeymiz.js'), 'utf8'); assert.ok(!/[\u{1F300}-\u{1FAFF}\u{23F0}\u{26A1}]/u.test(ex.replace(/\/\*[\s\S]*?\*\//g, '')), 'Nima yesam ekan?: emoji yo\'q');
  ok('emoji faqat hazil/afsona matnida: harakat/navigatsiya ikonkalari chiziqli (mashg\'ulot turlari, qadam, baliq, Haftangiz, Nima yesam ekan?)');
  console.log('\n' + n + '/' + n + ' OK');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
