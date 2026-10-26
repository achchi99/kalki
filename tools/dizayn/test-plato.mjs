// KalkiFit v46 — «Vazn trendi» + «Nega sekin ozyapman?» (maket ~/plato-maket.html; hisob: assets/kalkifit-plato.js, sof test: tools/test-plato-core.js).
// Tarix: trend kartasi (nuqtalar + yashil chiziq, «1-hafta: suv» belgisi va bir martalik izoh, davr 4 hafta / 3 oy / hammasi), ostida «Nega sekin ozyapman?» kartasi;
// oyna: kutilgan / haqiqiy, sabablar (ta'sir bo'yicha), «Shu hafta sinab ko'ring» (belgi eslab qolinadi), «Eslatib turilsin», «Manbalar», tortib yopish;
// holatlar: ma'lumot kam / juda tez / qadamsiz (iPhone) / maqsad «saqlash» — karta yo'q; Imkoniyatlar → Natijalar qatori; «Haftangiz» ichida bir marta; anonim stat hodisalari; 360 px × 115% × RU/ЎЗ × tungi.
//   node tools/dizayn/test-plato.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), PD = require(path.join(ROOT, 'tools/dizayn/plato-demo.cjs'));
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((o) => srv.listen(0, o)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const nb = (x) => String(x).replace(/[  ]/g, ' ');
async function open(st, o = {}) {
  const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: o.th || 'light' });
  await c.addInitScript((x) => { if (!localStorage.getItem('kalki_fit')) localStorage.setItem('kalki_fit', JSON.stringify(x.st)); localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_stat_test', '1'); if (x.lang) localStorage.setItem('kalki_lang', x.lang); }, { st, lang: o.lang });
  const p = await c.newPage(); p.errs = []; p.stat = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort());
  await p.route('**/api/**', (r) => { if (/\/api\/stat/.test(r.request().url())) p.stat.push(r.request().postData() || ''); r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
  await p.goto(BASE + (o.lang === 'ru' ? '/ru/kalkifit' : o.lang === 'cyr' ? '/kalkifit?lang=cyr' : '/kalkifit'), { waitUntil: 'networkidle' }); await p.waitForTimeout(900); p.cdp = await c.newCDPSession(p);
  if (o.zoom) { await p.evaluate((k) => { const ap = (root) => { const els = [root, ...root.querySelectorAll('*')].filter((e) => !e.__z), sz = els.map((e) => parseFloat(getComputedStyle(e).fontSize)); els.forEach((e, i) => { e.__z = 1; e.style.setProperty('font-size', (sz[i] * k) + 'px', 'important'); }); }; ap(document.body); new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((x) => { if (x.nodeType === 1) ap(x); }))).observe(document.body, { childList: true, subtree: true }); }, o.zoom); await p.waitForTimeout(200); }
  return p;
}
const stOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kalki_fit')));
const statAll = async (p) => (await p.evaluate(() => localStorage.getItem('kalki_stat_q') || '')) + ' ' + p.stat.join(' ');
const hist = async (p) => { await p.click('[data-act=tab][data-v=history]'); await p.waitForTimeout(800); };
const sheet = (p) => p.evaluate(() => { const s = document.getElementById('rzSheet'); return !s.hidden && s.classList.contains('open') ? s.getAttribute('data-kind') : null; });
const touch = async (p, pts, gap = 16) => { const s = p.cdp; await s.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pts[0][0], y: pts[0][1] }] }); for (const q of pts.slice(1)) { await s.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: q[0], y: q[1] }] }); await p.waitForTimeout(gap); } await s.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
try {
  /* ---- 1. Tarix: «Vazn trendi» kartasi ---- */
  let p = await open(PD.build('demo', S)); await hist(p);
  let c = await p.evaluate(() => { const w = document.querySelector('.pl-w'); return { t: w.querySelector('.sl-wh b').textContent.trim(), big: w.querySelector('.sl-wbig b').textContent, sm: w.querySelector('.sl-wbig small').textContent, lbl: document.getElementById('wLbl').textContent, ok: document.getElementById('wLbl').classList.contains('ok'), dots: w.querySelectorAll('svg .dot').length, line: !!w.querySelector('svg path.avg'), band: !!w.querySelector('svg .wb'), bandT: (w.querySelector('svg .wt') || {}).textContent, note: !!document.getElementById('plWater'), lg: w.querySelectorAll('.pl-lg span').length, per: [...w.querySelectorAll('.pl-pc')].map((x) => x.textContent + (x.getAttribute('aria-pressed') === 'true' ? '*' : '')) }; });
  assert.equal(c.t, 'Vazn trendi'); assert.match(c.big, /^\d{2,3},\d$/, 'trend vazni bitta kasr bilan: ' + c.big); assert.match(nb(c.sm), /kg · trend/);
  assert.match(nb(c.lbl), /^−\d+,\d kg · haftasiga −\d,\d{1,2} kg$/, 'o\'zgarish va haftalik tezlik: ' + c.lbl); assert.ok(c.ok, 'ozish maqsadida tushish — yashil');
  assert.ok(c.dots >= 8 && c.line, 'kulrang nuqtalar + yashil trend chizig\'i'); assert.ok(c.band && /suv/.test(c.bandT) && c.note, '1-hafta: suv — fon va izoh'); assert.equal(c.lg, 2); assert.deepEqual(c.per, ['4 hafta*', '3 oy', 'Hammasi']);
  const sm = await p.evaluate(() => { const P = window.KalkiPlato, st = JSON.parse(localStorage.getItem('kalki_fit')); return P.summary(st.weights, window.KalkiFit.dates.today(), 28, window.KalkiFit.dates); });
  assert.equal(c.big, sm.kg.toFixed(1).replace('.', ','), 'katta raqam = EMA trend (oxirgi o\'lchov emas)');
  await p.click('.pl-pc[data-k=all]'); await p.waitForTimeout(400); const dAll = await p.locator('.pl-w svg .dot').count(); assert.ok(dAll > c.dots, '«Hammasi»da ko\'proq nuqta: ' + dAll + ' > ' + c.dots); assert.equal(await p.locator('.pl-pc[data-k=all]').getAttribute('aria-pressed'), 'true');
  await p.click('#plWater [data-act=plwater]'); await p.waitForTimeout(300); assert.equal(await p.locator('#plWater').count(), 0);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(700); await hist(p); assert.equal(await p.locator('#plWater').count(), 0, 'yopilgan izoh qayta chiqmaydi'); assert.equal(await p.locator('.pl-w svg .wb').count(), 0, 'fon ham'); assert.equal(await p.locator('.pl-pc[data-k=all]').getAttribute('aria-pressed'), 'true', 'davr tanlovi eslab qolinadi');
  ok('Vazn trendi: EMA trend vazni (' + c.big + ' kg), «' + nb(c.lbl) + '», nuqtalar + yashil chiziq, «1-hafta: suv» fon/izoh (yopsa qaytmaydi), davr 4 hafta / 3 oy / hammasi (eslab qolinadi)');
  /* ---- 2. «Nega sekin ozyapman?» kartasi va oyna ---- */
  assert.match(nb(await p.locator('#plCta').innerText()), /Nega sekin ozyapman\?\s+Ma'lumotlaringizdan 3 ta sabab topildi/);
  await p.click('#plCta'); await p.waitForTimeout(700); assert.equal(await sheet(p), 'plato');
  let o = await p.evaluate(() => { const s = document.getElementById('rzSheet'); return { h: s.querySelector('h2, .rz-sh-h b, .rz-h').textContent.trim(), sub: s.querySelector('.pl-sub').textContent, cmp: [...s.querySelectorAll('.pl-cmp b')].map((x) => x.textContent), gap: s.querySelector('.pl-note.ye').textContent, rs: [...s.querySelectorAll('.pl-cs')].map((x) => x.dataset.r), k: [...s.querySelectorAll('.pl-cs .k')].map((x) => x.textContent), tr: [...s.querySelectorAll('.pl-ti')].map((x) => x.dataset.k), ft: s.querySelector('.pl-ft').textContent, bg: getComputedStyle(s).backgroundColor, card: getComputedStyle(s.querySelector('.pl-cs')).backgroundColor }; });
  assert.match(o.h, /Nega sekin ozyapman/); assert.match(nb(o.sub), /^So'nggi \d+ kun · sizning yozuvlaringiz bo'yicha$/); assert.ok(o.cmp.length === 2 && o.cmp.every((x) => /^[−+]?\d+,\d kg$/.test(nb(x))), 'kutilgan / haqiqiy: ' + o.cmp);
  assert.match(nb(o.gap), /Farq ~\d+,\d kg — kuniga ~\d+ kkal/); assert.deepEqual(o.rs, ['yozilmagan', 'qadam', 'oqsil'], 'sabablar tartibi'); assert.match(nb(o.k[0]), /^\d kun \/ 28 · ≈ −\d+ kkal\/kun$/); assert.match(nb(o.k[1]), /^≈ −\d+ kkal\/kun$/); assert.match(nb(o.k[2]), /^\d+ \/ \d+ g$/);
  assert.deepEqual(o.tr, ['log_d', 'walk', 'prot']); assert.equal(nb(o.ft), 'Hisob taxminiy: 1 kg yog\' ≈ 7 700 kkal. Bu tibbiy maslahat emas.'); assert.notEqual(o.bg, o.card, 'oyna foni va kartalar farqlanadi (maket)');
  assert.equal(await p.locator('#rzSheet .pl-src li').count(), 0); await p.click('#rzSheet [data-act=plsrc]'); await p.waitForTimeout(250); assert.equal(await p.locator('#rzSheet .pl-src li').count(), 6, 'Manbalar — 6 ta'); assert.equal(await p.locator('#rzSheet [data-act=plsrc]').getAttribute('aria-expanded'), 'true');
  ok('Oyna: kutilgan ' + o.cmp[0] + ' / haqiqiy ' + o.cmp[1] + ', «' + nb(o.gap).slice(0, 40) + '…», sabablar ' + o.rs.join(' › ') + ' (kkal/kun, «7 kun / 28», «48 / 95 g»), 3 ta ish, «Manbalar» (6), pastki izoh');
  /* checklist eslab qolinadi; «Eslatib turilsin» — keyingi ochilishda ilova ichida */
  await p.click('#rzSheet [data-act=pltry][data-k=walk]'); await p.waitForTimeout(250); assert.equal(await p.locator('#rzSheet [data-act=pltry][data-k=walk]').getAttribute('aria-checked'), 'true');
  await p.click('#rzSheet [data-act=plrem]'); await p.waitForTimeout(300); assert.match(nb(await p.locator('#rzToast').innerText()), /Eslatish yoqildi/); assert.equal(await p.locator('#rzSheet [data-act=plrem]').getAttribute('aria-pressed'), 'true');
  let s1 = await stOf(p); assert.equal(s1.prefs.plato.c.walk, true); assert.equal(s1.prefs.plato.rem, true);
  const ev = await statAll(p); assert.ok(/plato_ochildi/.test(ev) && /plato_sabab/.test(ev) && /plato_belgi/.test(ev), 'stat: ochildi, sabab, belgi — ' + ev.slice(0, 200)); assert.ok(!/84|kkal|vazn/.test(ev.replace(/plato_\w+/g, '')), 'stat anonim (vazn/kkal yo\'q)');
  /* tortib yopish (umumiy mexanizm): tutqichdan 35% */
  await p.evaluate(() => { document.getElementById('rzSheet').scrollTop = 0; }); await p.waitForTimeout(500);
  const hb = await p.locator('#rzSheet').boundingBox(); await touch(p, Array.from({ length: 9 }, (_, i) => [195, hb.y + 12 + i * hb.height * 0.35 / 8])); await p.waitForTimeout(500); assert.equal(await sheet(p), null, 'tortib yopildi');
  await p.click('#plCta'); await p.waitForTimeout(600); assert.equal(await p.locator('#rzSheet [data-act=pltry][data-k=walk]').getAttribute('aria-checked'), 'true', 'qayta ochilganda belgi saqlangan'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  s1 = await stOf(p); s1.prefs.plato.remD = '2000-01-01'; await p.evaluate((x) => localStorage.setItem('kalki_fit', JSON.stringify(x)), s1); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(2600);
  assert.match(nb(await p.locator('#rzToast').innerText()), /^Bu hafta: Kechki ovqatni ham yozing/, 'keyingi ochilishda eslatma — birinchi belgilanmagan ish'); await p.context().close();
  ok('Sinab ko\'ring: belgi saqlanadi (qayta ochish, qayta yuklash); «Eslatib turilsin» → keyingi ochilishda «Bu hafta: …» (kuniga 1); tortib yopish ishlaydi; stat hodisalari anonim');
  /* ---- 3. holatlar ---- */
  p = await open(PD.build('kam', S)); await hist(p); assert.match(nb(await p.locator('#plCta').innerText()), /yana \d+ (kun|marta)/i, 'ma\'lumot kam: nima yetmasligi'); assert.ok(await p.locator('#plCta.need').count());
  await p.click('#plCta'); await p.waitForTimeout(600); assert.match(nb(await p.locator('#rzSheet').innerText()), /Tahlil uchun ma'lumot yetarli emas[\s\S]*yana \d+/i); assert.equal(await p.locator('#rzSheet .pl-cs').count(), 0); await p.context().close();
  p = await open(PD.build('tez', S)); await hist(p); await p.click('#plCta'); await p.waitForTimeout(600); let tx = nb(await p.locator('#rzSheet').innerText());
  assert.match(tx, /Juda tez ketyapsiz/); assert.match(tx, /mushak va kuchingizga zarar/); assert.equal(await p.locator('#rzSheet .pl-cs').count(), 0, 'tez ozishda sabablar o\'rniga ogohlantirish');
  await p.click('#rzSheet [data-act=plgoal]'); await p.waitForTimeout(700); assert.equal(await sheet(p), 'prof', 'Limitni oshirish → Profil (maqsad)'); await p.context().close();
  p = await open(PD.build('ios', S)); await hist(p); await p.click('#plCta'); await p.waitForTimeout(600); tx = nb(await p.locator('#rzSheet').innerText());
  assert.equal(await p.locator('#rzSheet .pl-cs[data-r=qadam]').count(), 0); assert.ok(!/qadam ma'lumoti|qadam yo'q|iPhone/i.test(tx), 'qadamsizlik haqida gap yo\'q'); assert.ok(await p.locator('#rzSheet .pl-cs').count() >= 1); await p.context().close();
  p = await open(PD.build('joyida', S)); await hist(p); assert.match(nb(await p.locator('#plCta').innerText()), /Hammasi to'g'ri ketyapti/); await p.click('#plCta'); await p.waitForTimeout(600); assert.match(nb(await p.locator('#rzSheet').innerText()), /−0,3 kg ham normal/); await p.context().close();
  for (const k of ['saqlash', 'olish']) { p = await open(PD.build(k, S)); await hist(p); assert.equal(await p.locator('#plCta').count(), 0, k + ': karta yo\'q'); assert.ok(await p.locator('.pl-w').count(), 'trend kartasi baribir bor'); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(600); assert.equal(await p.locator('[data-act=feat][data-fk=plato]').count(), 0, k + ': Imkoniyatlar qatori yo\'q'); await p.context().close(); }
  ok('Holatlar: ma\'lumot kam — «Yana N …»; juda tez — ogohlantirish + «Limitni oshirish» (Profil); qadamsiz — qadam sababi ham, bu haqda gap ham yo\'q; joyida — «Hammasi to\'g\'ri»; saqlash / vazn olish — karta va qator yo\'q');
  /* ---- 4. Imkoniyatlar → Natijalar; «Haftangiz» ichida bir marta ---- */
  p = await open(PD.build('demo', S)); await p.click('[data-act=tab][data-v=profile]'); await p.waitForTimeout(600);
  const fr = p.locator('.sl-feats [data-act=feat][data-fk=plato]'); assert.equal(await fr.count(), 1); assert.match(nb(await fr.innerText()), /Nega sekin ozyapman\?\s+Ma'lumotlaringizdan sababni topadi/);
  await fr.click(); await p.waitForTimeout(600); assert.equal(await sheet(p), 'plato'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.click('[data-act=tab][data-v=today]'); await p.waitForTimeout(500); await p.click('[data-act=ftopen]'); await p.waitForTimeout(500);
  assert.equal(await p.locator('#ftDr.op').count(), 1, 'chap panel ochildi'); { const g = await p.evaluate(() => { const el = document.querySelector('#ftDr [data-fk=plato]'); if (!el) return null; let h = el.closest('.ft-grp').previousElementSibling; return h && h.textContent; }); assert.equal(g, 'Natijalar', 'chap panel: Natijalar guruhida'); await p.keyboard.press('Escape'); await p.waitForTimeout(400); }
  await p.context().close(); p = await open(PD.build('ios', S)); await hist(p); await p.click('#hkCard'); await p.waitForTimeout(600); for (let i = 0; i < 6 && !(await p.locator('[data-hk=plato]').count()); i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(350); }
  assert.equal(await p.locator('.hk-pl:not(.hk-pr)').count(), 1, 'Haftangiz: eslatma matni'); assert.match(nb(await p.locator('.hk-pl:not(.hk-pr)').textContent()), /kutilganidan sekin tushyapti/);
  await p.click('[data-hk=plato]'); await p.waitForTimeout(800); assert.equal(await sheet(p), 'plato', 'Haftangiz → tahlil'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  assert.ok((await stOf(p)).prefs.plato.hk, 'bir marta ko\'rsatildi');
  await p.click('#hkCard'); await p.waitForTimeout(600); for (let i = 0; i < 6; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300); } assert.equal(await p.locator('[data-hk=plato]').count(), 0, 'ikkinchi marta yo\'q'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  assert.deepEqual(p.errs, []); await p.context().close();
  ok('Kirish (demo/qadamsiz): Profil va chap panel → «Natijalar» guruhida «Nega sekin ozyapman?»; «Haftangiz» oxirgi slaydida bir marta eslatma + [Nega sekin?] → tahlil (push yo\'q)');
  /* ---- 5. 360 px × 115% × RU / ЎЗ × tungi: sig'adi, ≥ 15 px, og'irlik ≤ 700, lotin-kirill aralashmaydi ---- */
  for (const [lang, th] of [['ru', 'light'], ['cyr', 'dark'], ['uz', 'dark']]) {
    p = await open(PD.build('demo', S), { w: 360, h: 740, lang, th, zoom: 1.15 }); await hist(p);
    const chk = (sel) => p.evaluate((q) => { const r = document.querySelector(q), W = document.documentElement.clientWidth; const tx = [...r.querySelectorAll('*')].filter((e) => !e.closest('svg') && [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) && e.getBoundingClientRect().width > 0);
      return { x: document.documentElement.scrollWidth > innerWidth + 1, out: tx.filter((e) => { const b = e.getBoundingClientRect(); return b.right > W + 1 || b.left < -1; }).map((e) => e.className).slice(0, 3), small: tx.filter((e) => parseFloat(getComputedStyle(e).fontSize) < 14.9 * 1.0).map((e) => e.className + ':' + getComputedStyle(e).fontSize).slice(0, 3), heavy: tx.filter((e) => +getComputedStyle(e).fontWeight > 700).length, mix: tx.map((e) => e.textContent).join(' ').split(/[\s«»().,:;!?—–\/·~≈−+%]+/).filter((w) => /[a-z]/i.test(w) && /[а-яёўқғҳ]/i.test(w)) }; }, sel);
    let r = await chk('.pl-w'); assert.ok(!r.x && !r.out.length && !r.small.length && !r.heavy, lang + ' Tarix: ' + JSON.stringify(r)); assert.deepEqual(r.mix, [], lang + ': aralash alifbo');
    await p.click('#plCta'); await p.waitForTimeout(700); await p.click('#rzSheet [data-act=plsrc]'); await p.waitForTimeout(250); r = await chk('#rzSheet'); assert.ok(!r.x && !r.out.length && !r.small.length && !r.heavy, lang + ' oyna: ' + JSON.stringify(r)); assert.deepEqual(r.mix, [], lang + ' oyna: aralash alifbo');
    if (lang === 'ru') assert.match(nb(await p.locator('#rzSheet').innerText()), /Почему вес уходит медленно\?[\s\S]*Найденные причины[\s\S]*Это не медицинский совет/);
    if (lang === 'cyr') assert.match(nb(await p.locator('#rzSheet').innerText()), /Нега секин озяпман\?/);
    assert.deepEqual(p.errs, []); await p.context().close();
  }
  ok('360 px × 115%: RU (yorug\'), ЎЗ va UZ (tungi) — gorizontal siljish yo\'q, matn ≥ 15 px, og\'irlik ≤ 700, so\'zda aralash alifbo yo\'q');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
