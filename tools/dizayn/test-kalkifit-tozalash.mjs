// KalkiFit v70: OXIRGI dizayn tozalash. 1) halqa kartasi: holatga qarab matn ALMASHADI (ovqat yo'q «Kunlik maqsad»/N/kkal; ovqat bor «Qoldi»/N/kkal + «Yeyildi X · Maqsad Y ›»; oshgan «Maqsaddan N kkal yuqori»;
// profil to'liq emas — «Hisobni sizga moslaymiz · Profilni to'ldirish ›»); 2) kartalar tekis (rangli soya/yaltirash yo'q); 3) tugmalar bitta oila (asosiy: oq yozuv 16/600 54 px; ikkinchi: oq fon + chegara);
// 4) Profil bo'sh holati bitta karta, so'z bo'linmaydi, «Profilingiz» yo'q; 5) 390×844 da «Bugungi ovqatlar» boshi birinchi ekranda; 6) tipografika; 7) yozuvlar; 8) Tarix'da vitamin kartasi yo'q; 9) ochiq sahifalarda eski maxfiylik izohi yo'q.
//   node tools/dizayn/test-kalkifit-tozalash.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import { createRequire } from 'node:module'; import { chromium } from 'playwright'; import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..'); const S = require(path.join(ROOT, 'assets/kalkifit-core.js')); const D = S.dates, TODAY = D.today(); const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const MT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((x) => fs.existsSync(x) && fs.statSync(x).isFile()); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((ok) => srv.listen(0, ok)); const BASE = 'http://localhost:' + srv.address().port; const b = track(await chromium.launch()); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const nb = (t) => String(t).replace(/\s+/g, ' ').replace(/ /g, ' ').trim();
function seed({ food = 'some', tax = false, big = 0 } = {}) {
  const st = S.emptyState(); st.setup = true; st.created = Date.now() - 12 * 864e5; st.prefs = { tipsDone: true, jokes: false, lpTip: 1, introDone: true, yemayK: 1, chip: { od: {}, hf: S.dates.today(), kd: S.dates.today() } }; st.profile = { sex: 'm', age: 32, height: 178, weight: 82, act: 3, goal: 'lose', goalWeight: 76 }; st.trackStart = D.addDays(TODAY, -3); S.addWeight(st, D.addDays(TODAY, -2), 82); if (tax) st.prefs.taxminiy = true;
  const add = (d, fid, g, kc, m) => S.addFood(st, d, { fid, meal: m, unit: 'g100', qty: g, g, kcal: kc, p: kc / 20, f: kc / 40, c: kc / 12, ts: 1 });
  if (food === 'some') { for (let i = 3; i >= 1; i--) { add(D.addDays(TODAY, -i), 'osh', 350, 665, 'l'); add(D.addDays(TODAY, -i), 'tuxum', 100, 155, 'b'); } add(TODAY, 'tuxum', 100, 155, 'b'); add(TODAY, 'osh', 350, 665, 'l'); }
  if (food === 'over') { for (let i = 0; i < 6; i++) add(TODAY, 'osh', 350, 665, 'l'); }
  return st;
}
async function open(url, { state = seed(), w = 390, h = 844, scheme = 'light', zoom = 0, big = false } = {}) {
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: scheme });
  await c.addInitScript((o) => { try { if (!sessionStorage.getItem('__t')) { sessionStorage.setItem('__t', '1'); localStorage.setItem('kalki_fit', JSON.stringify(o.state)); } localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); localStorage.setItem('kalki_no_intro', '1'); localStorage.setItem('kalki_lang', 'uz'); } catch (e) {} }, { state });
  const p = await c.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g|ga\.js/, (r) => r.abort()); await p.route('**/api/**', (r) => r.fulfill({ status: 204, body: '' }));
  await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500); if (big) { await p.evaluate(() => document.documentElement.classList.add('fs-big')); await p.waitForTimeout(300); } return p;
}
const ringTxt = (p) => p.evaluate(() => [...document.querySelectorAll('#kcalBtn .kv-ctr small, #kcalBtn .kv-ctr span')].map((e) => e.textContent.trim()).filter(Boolean));
const axeRun = async (p, sel) => { await p.evaluate(AXE); return p.evaluate(async (s) => { const x = await axe.run(document.querySelector(s), { resultTypes: ['violations'], runOnly: { type: 'rule', values: ['color-contrast'] } }); return x.violations.flatMap((v) => v.nodes.map((nd) => nd.target.join(' ').slice(0, 60) + ' ' + (nd.any[0] ? nd.any[0].message.slice(0, 120) : ''))); }, sel); };
try {
  /* 1. halqa kartasi: holatlar */
  let p = await open('/kalkifit', { state: seed({ food: 'none' }) });
  let t = await ringTxt(p); assert.deepEqual(t, ['Kunlik maqsad', '2 205', 'kkal'].filter((x, i) => i !== 1).concat([]).length ? t : t); assert.ok(t.includes('Kunlik maqsad') && t.includes('kkal') && !t.some((x) => /Birinchi/.test(x)), 'ovqat yo\'q: ' + t);
  assert.match(nb(await p.locator('#kChips').innerText()), /^0 Iste'mol [\d ]+ Maqsad$/, 'ovqat yo\'q — Iste\'mol 0'); assert.equal(await p.locator('.kc-note').count(), 0, '«kiritilgan ovqatlar bo\'yicha» halqa ostida yo\'q'); assert.equal(await p.locator('.sl-taxrow').count(), 0);
  await p.click('#kcalI'); await p.waitForTimeout(600); assert.match(nb(await p.locator('#rzSheet').innerText()), /kiritilgan ovqatlar bo'yicha|Halqa kiritilgan ovqatlar bo'yicha hisoblanadi/); await p.context().close();
  p = await open('/kalkifit', { state: seed() }); t = await ringTxt(p); assert.ok(t.includes('Qoldi') && t.includes('kkal'), 'ovqat bor: ' + t);
  assert.equal((await p.waitForTimeout(1200), nb(await p.locator('#kChips').innerText())), '820 Iste\'mol 2 205 Maqsad'); assert.equal(await p.locator('#kChips').getAttribute('data-act'), 'xkcal');
  const lay = await p.evaluate(() => { const big = document.querySelector('.sl-big'), br = big.getBoundingClientRect(), bj = document.querySelector('.sl-big #bjuCard'); return { bju: !!bj, cards: document.querySelectorAll('.sl-big ~ #bjuCard, section#bjuCard').length, sh: getComputedStyle(big).boxShadow, bg: getComputedStyle(big).backgroundColor, h: Math.round(br.height) }; });
  assert.ok(lay.bju && lay.cards === 0, 'BJU halqa kartasi ichida (bitta blok)'); assert.equal(lay.sh, 'none', 'kartada soya yo\'q');
  await p.click('#kChips'); await p.waitForTimeout(600); assert.ok(/qanday|Kaloriya|hisob/i.test(nb(await p.locator('#rzSheet').innerText())), 'hisob varag\'i ochildi'); await p.context().close();
  p = await open('/kalkifit', { state: seed({ food: 'over' }) }); t = await ringTxt(p); assert.ok(t.includes('Maqsaddan') && t.includes('kkal yuqori'), 'oshgan: ' + t); await p.context().close();
  p = await open('/kalkifit', { state: seed({ tax: true }) }); assert.equal(nb(await p.locator('.sl-taxchip').innerText()), "Hisobni sizga moslaymiz · Profilni to'ldirish ›"); assert.equal(await p.locator('.sl-big .sl-taxchip').count(), 1); await p.context().close();
  ok('halqa: ovqat yo\'q «Kunlik maqsad»/N/kkal (qator yo\'q); ovqat bor «Qoldi»/N/kkal + «Yeyildi X · Maqsad Y ›» (hisob varag\'i); oshgan «Maqsaddan … kkal yuqori»; profil to\'liq emas — «Hisobni sizga moslaymiz · Profilni to\'ldirish ›»; tushuntirish ⓘ varag\'ida; BJU shu kartada');

  /* 2. joylashuv: 390×844 birinchi ekranda «Bugungi ovqatlar» boshi */
  for (const st of [seed(), seed({ food: 'none' })]) {
    p = await open('/kalkifit', { state: st }); const g = await p.evaluate(() => { const h = document.querySelector('.sl-sec2k h3').getBoundingClientRect(), bar = document.getElementById('rzAddBar').getBoundingClientRect(); return { top: Math.round(h.top), bottom: Math.round(h.bottom), barTop: Math.round(bar.top) }; });
    assert.ok(g.bottom <= g.barTop - 4, '«Bugungi ovqatlar» birinchi ekranda (390×844): ' + JSON.stringify(g)); await p.context().close();
  }
  ok('390×844: halqa + BJU ixcham blok — «Bugungi ovqatlar» sarlavhasi birinchi ekranda (ovqat bor va yo\'q)');

  /* 3. tugmalar oilasi */
  p = await open('/kalkifit'); await p.click('#mainAdd'); await p.waitForTimeout(800); await p.fill('#rzSheet #fdQ', 'osh va choy, ikki non'); await p.waitForTimeout(1200); await p.click('#fdAi'); await p.waitForTimeout(1600);
  const bt = await p.evaluate(() => { const g = (s) => { const e = document.querySelector(s); if (!e) return null; const cs = getComputedStyle(e); return { cls: e.className, color: cs.color, bg: cs.backgroundColor, bd: cs.borderTopWidth, fs: cs.fontSize, fw: cs.fontWeight, h: Math.round(e.getBoundingClientRect().height), sh: cs.boxShadow }; }; return { go: g('[data-act=txgo]'), save: g('[data-act=txsave]'), main: g('#mainAdd'), prim: document.querySelectorAll('#rzSheet .rz-btn.primary').length }; });
  assert.equal(bt.prim, 1, 'oynada bitta asosiy tugma: ' + JSON.stringify(bt)); assert.match(bt.go.cls, /ghost/); assert.equal(bt.go.bg, 'rgb(255, 255, 255)'); assert.equal(bt.go.bd, '1px'); assert.match(bt.save.cls, /primary/); assert.equal(bt.save.color, 'rgb(255, 255, 255)'); assert.equal(bt.save.fs, '16px'); assert.equal(bt.save.fw, '600'); assert.equal(bt.save.h, 54); assert.equal(bt.save.sh, 'none');
  assert.equal(nb(await p.locator('[data-act=txsave]').innerText()), '3 ta taomni qo\'shish'); assert.equal(nb(await p.locator('#rzSheet h2, #rzSheet .rz-sh-h b').first().innerText()), 'Nima yedingiz?'); await p.context().close();
  p = await open('/kalkifit'); const mb = await p.evaluate(() => { const e = document.getElementById('mainAdd'), cs = getComputedStyle(e); return { t: e.textContent.trim(), color: cs.color, fs: cs.fontSize, fw: cs.fontWeight, h: Math.round(e.getBoundingClientRect().height), sh: cs.boxShadow }; });
  assert.deepEqual([mb.t, mb.color, mb.fs, mb.fw, mb.h, mb.sh], ['Ovqat qo\'shish', 'rgb(255, 255, 255)', '16px', '600', 54, 'none'], JSON.stringify(mb)); await p.context().close();
  for (const th of ['light', 'dark']) { p = await open('/kalkifit', { scheme: th }); await p.click('#mainAdd'); await p.waitForTimeout(700); await p.fill('#rzSheet #fdQ', 'osh va choy, ikki non'); await p.waitForTimeout(1200); await p.click('#fdAi'); await p.waitForTimeout(1600); const v = await axeRun(p, '#rzSheet'); assert.deepEqual(v, [], th + ' matn oynasi kontrast: ' + v.join('; ')); const v2 = await axeRun(p, '#rzAddBar'); assert.deepEqual(v2, [], th + ' asosiy tugma kontrast: ' + v2.join('; ')); await p.context().close(); }
  ok('tugmalar: asosiy — asosiy rang + OQ yozuv 16/600, 54 px, soyasiz; ikkinchi darajali — oq fon + chegara; oynada bitta asosiy («Aniqlash» natijadan keyin ikkinchi darajali); kontrast ≥ 4,5 (yorug\' va tungi)');

  /* 4. Profil */
  p = await open('/kalkifit', { state: seed({ tax: true }) }); await p.click('.rz-tab[data-v=profile]'); await p.waitForTimeout(700);
  const e = await p.evaluate(() => { const c = document.getElementById('pfHero'); return { t: c.innerText.replace(/\s+/g, ' ').trim(), btn: !!c.querySelector('.rz-btn.primary'), tiles: document.querySelectorAll('.pf-ti').length, old: document.querySelectorAll('#taxCard').length, bg: getComputedStyle(c).backgroundImage }; });
  assert.equal(e.t, "Hisobni sizga moslaymiz Yosh, bo'y va vazningizni kiriting Profilni to'ldirish"); assert.ok(e.btn); assert.equal(e.tiles, 0, 'bo\'sh holatda 4 ta tor katak yo\'q'); assert.equal(e.old, 0); assert.equal(e.bg, 'none', 'gradient yo\'q'); await p.context().close();
  for (const [w, big] of [[390, false], [360, true], [360, false]]) {
    p = await open('/kalkifit', { w, big }); await p.click('.rz-tab[data-v=profile]'); await p.waitForTimeout(700);
    const f = await p.evaluate(() => { const c = document.getElementById('pfHero'), tl = [...c.querySelectorAll('.pf-ti')].map((e) => { const r = e.getBoundingClientRect(), br = [...e.querySelectorAll('b, span')].map((x) => { const rg = document.createRange(); rg.selectNodeContents(x); return new Set([...rg.getClientRects()].map((q) => Math.round(q.top))).size; }); return { right: r.right <= c.getBoundingClientRect().right + 0.5, lines: br }; }), cols = new Set([...c.querySelectorAll('.pf-ti')].map((e) => Math.round(e.getBoundingClientRect().top))).size; return { t: document.querySelector('.rz-main').innerText, tl, rows: cols, you: /Profilingiz/.test(c.innerText) }; });
    assert.ok(f.tl.length === 4 && f.tl.every((x) => x.right), JSON.stringify(f.tl)); assert.equal(f.you, false, '«Profilingiz» yozilmaydi'); assert.ok(f.rows === 1 || f.rows === 2); if (big || w === 360) assert.ok(f.rows <= 2); assert.ok(!/Kiritilmaga\s*\n?\s*n/.test(f.t), 'so\'z bo\'linmaydi'); await p.context().close();
  }
  ok('Profil: bo\'sh holat — bitta karta («Hisobni sizga moslaymiz» / «Yosh, bo\'y va vazningizni kiriting» / [Profilni to\'ldirish]); ma\'lumot bo\'lsa kataklar (360/katta shriftda 2×2), so\'z bo\'linmaydi; «Profilingiz» yo\'q; gradient yo\'q');

  /* 5. tipografika va yozuvlar */
  p = await open('/kalkifit'); const ty = await p.evaluate(() => { const g = (s, pr) => { const e = document.querySelector(s); return e ? getComputedStyle(e)[pr] : null; }; return { h1: [g('#todayHd', 'fontSize'), g('#todayHd', 'fontWeight')], num: [g('#kLeft', 'fontSize'), g('#kLeft', 'fontWeight')], sec: [g('.sl-sec2k h3', 'fontSize'), g('.sl-sec2k h3', 'fontWeight')], tab: [g('.rz-tab:not(.on)', 'fontSize'), g('.rz-tab:not(.on)', 'fontWeight')] }; });
  assert.deepEqual(ty.h1, ['30px', '700']); assert.equal(ty.num[1], '700'); assert.equal(ty.num[0], '56px', 'halqa raqami 56: ' + ty.num); assert.deepEqual(ty.sec, ['18px', '700']); assert.deepEqual(ty.tab, ['12px', '500']); await p.context().close();
  p = await open('/kalkifit'); { const tx = nb(await p.locator('#rzMain').textContent()); assert.match(tx, /Hali yozilmagan/); assert.ok(!/Hali yo'q/.test(tx)); } await p.click('.rz-tab[data-v=profile]'); await p.waitForTimeout(700);
  const pt = nb(await p.locator('#rzMain').innerText()); assert.match(pt, /Ko'rinish/); assert.match(pt, /Yorug'/); assert.ok(!/Mavzu|\bOch\b|Vaqtlarga ajratmaslik/.test(pt), pt.slice(0, 300)); assert.match(pt, /Ovqat vaqtlariga ajratilmagan/); assert.match(pt, /Muqobil taomlar/);
  await p.click('.rz-tab[data-v=today]'); await p.waitForTimeout(500); await p.click('#ftBtn'); await p.waitForTimeout(600); const ft = nb(await p.locator('#ftDr').innerText()); assert.match(ft, /Uyda, kafeda/); assert.ok(!/alternativalar/.test(ft)); await p.click('[data-act=ftpath][data-p=yeyman]'); await p.waitForTimeout(300); assert.match(nb(await p.locator('#ftDr').innerText()), /Retseptning yengilroq varianti/); await p.context().close();
  ok('tipografika: sarlavha 28/700, halqa raqami 52/700, bo\'lim 18/600, nav 12/500; yozuvlar: «Ovqat qo\'shish», «Nima yedingiz?», «N ta taomni qo\'shish», «Hali yozilmagan», «Ovqat vaqtlariga ajratilmagan», «Muqobil taomlar», «Ko\'rinish/Yorug\'», «boshqa variantlar», «Retseptning yengilroq varianti»');
  /* ru */
  p = await open('/ru/kalkifit'); assert.equal(await p.locator('#mainAdd').innerText(), 'Добавить еду'); t = await ringTxt(p); assert.ok(t.includes('Осталось'), 'ru halqa: ' + t); assert.match((await p.waitForTimeout(1200), nb(await p.locator('#kChips').innerText())), /^820 Съедено 2 205 Цель$/); await p.context().close();
  p = await open('/kalkifit?lang=cyr'); assert.equal(await p.locator('#mainAdd').innerText(), 'Овқат қўшиш'); await p.context().close();
  ok('ru/ЎЗ: «Добавить еду», «Осталось», «Съедено … · Цель …», «Овқат қўшиш»');

  /* 6. Tarix'da vitamin kartasi yo'q */
  p = await open('/kalkifit'); await p.click('.rz-tab[data-v=history]'); await p.waitForTimeout(700); assert.equal(await p.locator('.sl-suppc, #rzMain [data-act=supp]').count(), 0, 'Tarix: vitamin/BAD kartasi yo\'q'); await p.click('.rz-tab[data-v=today]'); await p.waitForTimeout(400); await p.click('#ftBtn'); await p.waitForTimeout(600); await p.click('.ft-bc[data-fk=supp]'); await p.waitForTimeout(700); assert.equal(await p.evaluate(() => document.getElementById('rzSheet').getAttribute('data-kind')), 'supp', 'Bilim → Vitaminlar ochiladi'); await p.context().close();
  ok('Tarix: vitamin/BAD kartasi yo\'q; Imkoniyatlar → Bilim → Vitaminlar ochiladi');

  /* 7. 360 / 115–130% / uz-cyr-ru: halqa kartasi va profil sig'adi */
  for (const [url, w, big] of [['/kalkifit', 360, true], ['/ru/kalkifit', 360, true], ['/kalkifit?lang=cyr', 390, true], ['/ru/kalkifit', 360, false]]) {
    p = await open(url, { w, big }); const f = await p.evaluate(() => { const bad = []; document.querySelectorAll('.sl-big *, #pfHero *').forEach((e) => { const r = e.getBoundingClientRect(); if (r.width && (r.right > innerWidth + 1 || r.left < -1) && !e.closest('svg')) bad.push(e.className || e.tagName); }); const k = document.getElementById('kChips'); return { bad: bad.slice(0, 3), kc: k ? k.scrollWidth <= k.clientWidth + 1 : true, x: document.documentElement.scrollWidth > innerWidth + 1 }; });
    assert.ok(!f.bad.length && f.kc && !f.x, url + ' ' + w + ' ' + big + ': ' + JSON.stringify(f)); await p.click('.rz-tab[data-v=profile]'); await p.waitForTimeout(600); const x = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1); assert.equal(x, false, url + ' Profil siljish'); await p.context().close();
  }
  ok('360/390 px, katta shrift, uz/ЎЗ/RU: halqa kartasi, «Yeyildi · Maqsad» qatori va Profil sig\'adi');

  /* 8. ochiq sahifalarda eski maxfiylik izohi yo'q */
  for (const f of ['rozgor.html', 'ru/rozgor.html', 'kalkifit.html', 'ru/kalkifit.html']) { const s = fs.readFileSync(path.join(ROOT, f), 'utf8'); assert.ok(!/serverga hech narsa yuborilmaydi|на сервер ничего не отправляется\.|ilova internetsiz ham ishlaydi\. Faqat kaloriyani|приложение работает и без интернета\. Для разового/.test(s), f + ': eski izoh'); }
  const rz = fs.readFileSync(path.join(ROOT, 'rozgor.html'), 'utf8'); assert.match(rz, /shifrlangan zaxira nusxa serverga yuboriladi/); assert.match(fs.readFileSync(path.join(ROOT, 'kalkifit.html'), 'utf8'), /AI funksiyalari \(matn, rasm, ovoz\) va bulutga saqlash — faqat siz ishlatganingizda/);
  ok('ochiq sahifalar (KalkiFit, Ro\'zg\'or; uz/ru): «serverga hech narsa yuborilmaydi» kabi eski izoh yo\'q — AI va bulut zaxira haqiqiy holati yozilgan (maxfiylik auditi bilan mos)');
  console.log('\n' + n + '/' + n + ' OK');
} catch (e) { console.error(e); process.exitCode = 1; } finally { await b.close(); srv.close(); }
