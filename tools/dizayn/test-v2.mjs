// Yangi dizayn brauzer sinovi (lokal statik server): node tools/dizayn/test-v2.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index'; if (p === '/ru/') p = '/ru/index';
  const f = [path.join(ROOT, p), path.join(ROOT, p + '.html')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((ok) => srv.listen(8794, ok));
const B = 'http://localhost:8794';
const b = track(await chromium.launch());
const errors = [];
const log = (s) => console.log('OK   ' + s);
async function pg(w, h) { const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500, serviceWorkers: 'block' }); const p = await c.newPage();
  p.on('pageerror', (e) => errors.push(String(e))); await p.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort()); return p; }
const PAGES = ['/', '/shablonlar', '/gisht-kalkulyator'];
async function go(p, u) { for (let i = 0; i < 3; i++) { try { await p.goto(B + u, { waitUntil: 'networkidle' }); return; } catch (e) { await p.waitForTimeout(400); } } await p.goto(B + u, { waitUntil: 'networkidle' }); }

// 1. toshish yo'q, sarlavha bitta qator, yopishqoq
for (const w of [320, 390, 768, 1280]) {
  const p = await pg(w, 800);
  for (const u of PAGES) {
    await go(p, u);
    const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, hdr: Math.round(document.getElementById('sitebar').getBoundingClientRect().height), pos: getComputedStyle(document.getElementById('sitebar')).position }));
    assert.ok(m.sw <= m.iw, u + ' ' + w + ' toshdi ' + JSON.stringify(m));
    assert.ok(m.hdr <= 64 && m.pos === 'sticky', 'sarlavha ' + JSON.stringify(m));
  }
}
log('320/390/768/1280px: gorizontal toshish yo\'q; sarlavha bitta qator (<=64px), sticky');

// 2. yopishqoqlik
{ const p = await pg(390, 800); await go(p, '/'); await p.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' })); await p.waitForTimeout(500);
  const top = await p.evaluate(() => Math.round(document.getElementById('sitebar').getBoundingClientRect().top)); assert.equal(top, 0); log('sarlavha scroll qilinganda tepada qoladi'); }

// 3. mobil menyu
{ const p = await pg(390, 800); await go(p, '/');
  assert.equal(await p.isVisible('#topmenu'), false);
  await p.click('.sb2-burger'); await p.waitForSelector('#topmenu', { state: 'visible' });
  assert.equal(await p.getAttribute('.sb2-burger', 'aria-expanded'), 'true');
  const fs1 = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#topmenu .tm2>li>a')).fontSize)); assert.ok(fs1 >= 17, 'menyu shrifti ' + fs1);
  const h1 = await p.evaluate(() => Math.round(document.querySelector('#topmenu .tm2>li>a').getBoundingClientRect().height)); assert.ok(h1 >= 44, 'tegish maydoni ' + h1);
  await p.screenshot({ path: path.join(ROOT, 'docs/dizayn-skrinshot/yangi-menyu-390-yopiq.jpg'), type: 'jpeg', quality: 70 });
  await p.click('.tm2>li.has-sub:first-child .tm2-chev'); assert.equal(await p.isVisible('.tm2-sub >> nth=0'), true);
  await p.screenshot({ path: path.join(ROOT, 'docs/dizayn-skrinshot/yangi-menyu-390-ochiq.jpg'), type: 'jpeg', quality: 70 });
  await p.keyboard.press('Escape'); assert.equal(await p.isVisible('#topmenu'), false);
  log('mobil menyu: burger ochadi, akkordeon, Escape yopadi; band ' + fs1 + 'px / ' + h1 + 'px'); }

// 4. desktop ochilma
{ const p = await pg(1280, 800); await go(p, '/');
  await p.hover('.tm2>li.has-sub:first-child'); assert.equal(await p.isVisible('.tm2-sub >> nth=0'), true);
  const nf = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.tm2 a')).fontSize)); assert.ok(nf >= 15);
  await p.screenshot({ path: path.join(ROOT, 'docs/dizayn-skrinshot/yangi-menyu-1280-ochilma.jpg'), clip: { x: 0, y: 0, width: 1280, height: 360 }, type: 'jpeg', quality: 70 });
  log('desktop: ochilma hover bilan ochiladi, menyu ' + nf + 'px'); }

// 5. til almashtirish (RU) — menyu va kontent
for (const u of PAGES) { const p = await pg(1280, 800); await go(p, u); await p.click('#langRu'); await p.waitForURL(/\/ru(\/|$)/, { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(900);
  const t = await p.evaluate(() => [...document.querySelectorAll('#topmenu .tm2 > li > a')].map((a) => a.textContent.trim()));
  assert.deepEqual(t, ['Калькуляторы', 'Документы', 'Статьи'], u + ' RU menyu: ' + t.join('|'));
  assert.ok(await p.evaluate(() => document.documentElement.lang === 'ru')); }
log('RU: menyu (Калькуляторы | Документы | Статьи) uchala sahifada tarjima qilinadi');

// 6. bosh sahifa: render, qidiruv, yig'iladigan katalog, kategoriya ranglari
{ const p = await pg(1280, 900); await go(p, '/');
  assert.equal(await p.locator('#catGrid .k-card').count(), 5); assert.equal(await p.locator('#popGrid .k-card').count(), 8); assert.equal(await p.locator('#catalog .k-card').count(), 44);
  assert.equal(await p.locator('h1').count(), 1);
  assert.equal(await p.evaluate(() => document.getElementById('allcalc').open), false, 'katalog yopiq bo\'lishi kerak');
  assert.equal(await p.evaluate(() => /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(document.body.innerText)), false, 'sahifada emoji bor');
  const colors = await p.evaluate(() => [...document.querySelectorAll('#catGrid .k-card')].map((c) => getComputedStyle(c).borderTopColor));
  assert.equal(new Set(colors).size, 5, 'kategoriya ranglari: ' + colors.join(' | '));
  assert.equal(colors[1], 'rgb(164, 72, 42)');
  const ico = await p.evaluate(() => { const e = document.querySelector('#catGrid .k-ico'); const r = e.getBoundingClientRect(), s = e.querySelector('svg').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), Math.round(s.width), getComputedStyle(e).borderTopLeftRadius]; });
  assert.deepEqual(ico, [44, 44, 22, '10px']);
  await p.evaluate(() => { location.hash = '#cat-qurilish'; }); await p.waitForTimeout(500);
  assert.equal(await p.evaluate(() => document.getElementById('allcalc').open), true, '#cat- havola katalogni ochishi kerak');
  await go(p, '/'); await p.fill('#search', 'kredit'); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => document.getElementById('allcalc').open), true, 'qidiruv katalogni ochadi');
  assert.equal(await p.isVisible('#mashhur'), false); const n = await p.locator('#catalog .k-card:visible').count(); assert.ok(n >= 2 && n < 10);
  await p.fill('#search', 'zzzz'); assert.equal(await p.isVisible('#noResults'), true);
  log('bosh sahifa: 5 kategoriya (5 xil rang, 44px plitka/22px ikonka/10px radius), 8 mashhur, 42 katalog kartasi <details> da (yopiq; #cat- va qidiruv ochadi), 1 ta H1, emoji yo\'q, qidiruv (' + n + ' natija)'); }
{ const p = await pg(390, 844); await go(p, '/'); const h = await p.evaluate(() => document.documentElement.scrollHeight); assert.ok(h < 8000, 'mobil bosh sahifa balandligi ' + h); log('mobil bosh sahifa balandligi: ' + h + 'px (oldin 12338px)'); }

// 7. kalkulyator: maket, to'q natija kartasi, mantiq, ishonch qatori, "Qanday hisoblandi?", tegishli, xnav, PDF
{ const p = await pg(1280, 900); await go(p, '/gisht-kalkulyator');
  const before = await p.textContent('.big-figure .num');
  const lay = await p.evaluate(() => { const f = document.querySelector('.form-card').getBoundingClientRect(), r = document.querySelector('.receipt').getBoundingClientRect(); return { sameRow: Math.abs(f.top - r.top) < 40, receiptRight: r.left > f.right - 10, pos: getComputedStyle(document.querySelector('.receipt')).position, flag: document.querySelector('.res-col').classList.contains('is-sticky') }; });
  assert.deepEqual(lay, { sameRow: true, receiptRight: true, pos: 'sticky', flag: true });
  const card = await p.evaluate(() => { const b = getComputedStyle(document.querySelector('.receipt-body')), n = getComputedStyle(document.querySelector('.big-figure .num')); return { bg: b.backgroundColor, color: n.color, size: parseFloat(n.fontSize), tab: n.fontVariantNumeric }; });
  assert.equal(card.bg, 'rgb(14, 59, 46)'); assert.equal(card.color, 'rgb(255, 255, 255)'); assert.ok(card.size >= 36 && card.size <= 40, 'natija shrifti ' + card.size); assert.match(card.tab, /tabular-nums/);
  const unit = await p.evaluate(() => { const shell = [...document.querySelectorAll('.input-shell')].find((e) => e.getBoundingClientRect().height > 0 && e.querySelector('.unit')); const u = getComputedStyle(shell.querySelector('.unit')); return { bl: u.borderLeftWidth, bg: u.backgroundColor, h: Math.round(shell.getBoundingClientRect().height) }; });
  assert.equal(unit.bl, '0px'); assert.equal(unit.bg, 'rgba(0, 0, 0, 0)'); assert.ok(unit.h >= 52, 'maydon balandligi ' + unit.h);
  const ins = p.locator('input[type=text]:visible'); await ins.nth(0).fill('20'); await p.click('.calc-btn'); await p.waitForTimeout(300);
  const after = await p.textContent('.big-figure .num'); assert.notEqual(after, before); assert.match(after, /dona|шт/);
  log('gisht: natija to\'q kartada (40px? ' + card.size + 'px, tabular-nums), forma yonida yopishqoq; maydon ' + unit.h + 'px, birlik ichkarida; 10 → 20 m: "' + before.trim() + '" → "' + after.trim() + '"');
  assert.match(await p.textContent('.meta-line'), /Hisob usuli:/); assert.equal(await p.locator('.meta-line').count(), 1);
  assert.equal(await p.evaluate(() => /Yangilangan: 2026-09-29/.test(document.getElementById('answerbox').innerText)), true, 'answerbox sanasi 2026-09-29 bo\'lib qolishi kerak');
  assert.equal(await p.evaluate(() => document.getElementById('how').open), false); await p.click('#how summary'); assert.equal(await p.evaluate(() => document.getElementById('how').open), true);
  assert.equal(await p.locator('#how li').count(), 4);
  log('ishonch qatori "Hisob usuli", answerbox sanasi o\'zgarmagan (2026-09-29); "Qanday hisoblandi?" yig\'iladi/ochiladi (4 qadam)');
  assert.equal(await p.evaluate(() => { const e = document.getElementById('fbcall'); return !!e && !e.closest('details') && e.offsetParent !== null && e.getBoundingClientRect().height > 0; }), true, '#fbcall ko\'rinmaydi (details ichida?)');
  assert.equal(await p.evaluate(() => !document.querySelector('.calc-grid #fbcall, .calc-grid #related, .calc-grid #xnav, .calc-grid #seoBlock')), true, 'pastki bloklar grid ichida');
  assert.equal(await p.locator('#related .k-card').count(), 5);
  const xn = await p.evaluate(() => ({ open: document.getElementById('xnav').open, links: document.querySelectorAll('#xnav a').length, groups: document.querySelectorAll('#xnav .xn-t').length }));
  assert.equal(xn.open, false); assert.equal(xn.groups, 6); assert.equal(xn.links, 52, 'xnav havolalar soni ' + xn.links);
  log('tegishli kalkulyatorlar: 5 karta; "Barcha kalkulyatorlar" <details>: ' + xn.links + ' havola, ' + xn.groups + ' guruh (yopiq)');
  // #langCyr (ЎЗ tugmasi) — yagona ruxsat etilgan kirill belgi
  assert.equal(await p.evaluate(() => /[\u0400-\u04FF]/.test(document.body.innerText.replace(document.getElementById('langCyr').innerText, ''))), false, 'UZ sahifada kirill harf bor');
  assert.equal(await p.evaluate(() => /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(document.body.innerText)), false);
  await p.evaluate(() => { window.__pl = []; new MutationObserver(() => { var r = document.querySelector('.receipt'); if (r && r.classList.contains('pdf-light')) window.__pl.push(1); }).observe(document.querySelector('.receipt'), { attributes: true, attributeFilter: ['class'] }); });
  const dl = p.waitForEvent('download', { timeout: 20000 }).catch(() => null); await p.click('.receipt-actions .pdfbtn'); const d = await dl;
  const pl = await p.evaluate(() => window.__pl.length); assert.ok(pl >= 1, 'PDF paytida yorug\' holat qo\'yilmadi'); assert.equal(await p.evaluate(() => document.querySelector('.receipt').classList.contains('pdf-light')), false, 'yorug\' holat olinmadi');
  log('PDF: yaratish paytida yorug\' holat vaqtincha qo\'yiladi va olinadi' + (d ? ' (fayl: ' + d.suggestedFilename() + ')' : ' (yuklab olish hodisasi kutilmadi)')); }
{ const p = await pg(1280, 900); await go(p, '/ru/gisht-kalkulyator');
  const t = await p.evaluate(() => document.body.innerText);
  assert.equal(/[a-z]+['\u2019\u02bb\u2018][a-z]+/i.test(t), false, 'RU sahifada o\'zbekcha so\'z: ' + (t.match(/[a-z]+['\u2019\u02bb\u2018][a-z]+/i) || [''])[0]);
  assert.equal(/ \/ [А-Я]/.test(t), false, 'aralash "UZ / RU" yorliq');
  log('RU gisht: o\'zbekcha so\'z va aralash "Kredit / Кредит" yorliqlar yo\'q'); }
{ const p = await pg(390, 800); await go(p, '/gisht-kalkulyator');
  const o = await p.evaluate(() => { const f = document.querySelector('.form-card').getBoundingClientRect(), r = document.querySelector('.receipt').getBoundingClientRect(); return { stacked: r.top > f.bottom - 5 }; }); assert.equal(o.stacked, true); log('mobil: forma tepada, natija ostida (bir ustun)'); }

// 7b. 1c: kalkulyator "sahifa boshi" bandi
{ const p = await pg(390, 844); await go(p, '/gisht-kalkulyator');
  const m = await p.evaluate(() => { const lab = [...document.querySelectorAll('.form-card label')].find((l) => l.getBoundingClientRect().height > 0); const r = lab.getBoundingClientRect();
    const band = document.querySelector('header.pagehead.band'); const card = document.querySelector('.ab-card').getBoundingClientRect(); const h1 = document.querySelector('h1').getBoundingClientRect();
    const sub = getComputedStyle(document.querySelector('.ct-l .sub')); const ab = document.getElementById('answerbox');
    return { label: lab.textContent.trim(), bottom: Math.round(r.bottom), bandBg: getComputedStyle(band).backgroundColor, cardBelowH1: card.top > h1.bottom, subSize: sub.fontSize, subColor: sub.color, abDisplay: getComputedStyle(ab).display,
      over: document.querySelector('.ab-over').textContent.trim(), metaRows: document.querySelectorAll('.ab-card .ab-meta, .ab-card .meta-line').length, oldMeta: document.querySelectorAll('.ct-l .meta-line').length,
      txt: parseFloat(getComputedStyle(document.querySelector('.ab-card .ab-text')).fontSize), sw: document.documentElement.scrollWidth, iw: innerWidth }; });
  assert.equal(m.label, 'Material turi'); assert.ok(m.bottom <= 844, 'forma 1-ekranda emas: ' + m.bottom); assert.equal(m.abDisplay, 'contents'); assert.equal(m.over, 'Qisqacha'); assert.equal(m.metaRows, 2); assert.equal(m.oldMeta, 0);
  assert.equal(m.subSize, '17px'); assert.equal(m.txt, 17); assert.ok(m.cardBelowH1); assert.ok(m.sw <= m.iw); assert.notEqual(m.bandBg, 'rgba(0, 0, 0, 0)');
  log('390×844: forma "Material turi" birinchi ekranda (pastki chegara ' + m.bottom + 'px < 844), band fonida tint ' + m.bandBg + ', answerbox 17px, subtitle 17px'); }
{ const p = await pg(320, 700); await go(p, '/gisht-kalkulyator'); const o = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })); assert.ok(o.sw <= o.iw); log('320px: toshmaydi'); }
{ const p = await pg(1280, 800); await go(p, '/gisht-kalkulyator');
  const r = await p.evaluate(() => { const h = document.querySelector('.ct-l h1').getBoundingClientRect(), c = document.querySelector('.ab-card').getBoundingClientRect(); return { right: c.left > h.right - 20, sameRow: Math.abs((c.top + c.bottom) / 2 - (h.top + h.bottom) / 2) < 120 }; });
  assert.deepEqual(r, { right: true, sameRow: true }); log('1280px: chapda yorliq/H1/subtitle, o\'ngda answerbox kartasi (ikki ustun)'); }
{ const p = await pg(390, 844); await go(p, '/ru/gisht-kalkulyator'); const t = await p.evaluate(() => ({ over: document.querySelector('.ab-over').textContent.trim(), meta: document.querySelector('.ab-card .ab-meta').textContent.trim(), method: document.querySelector('.ab-card .meta-line').textContent.trim() }));
  assert.equal(t.over, 'Кратко'); assert.match(t.meta, /^Обновлено: 2026-09-29/); assert.match(t.method, /^Метод расчёта:/); log('RU: "Кратко" · "' + t.meta + '" · "Метод расчёта:"'); }

// 8. shablonlar filtri
{ const p = await pg(1280, 900); await go(p, '/shablonlar');
  const all = await p.locator('#readyList .tpl:visible').count(); await p.click('#tabs [data-f="doc"]'); const doc = await p.locator('#readyList .tpl:visible').count();
  await p.click('#tabs [data-f="xls"]'); const xls = await p.locator('#readyList .tpl:visible').count();
  assert.deepEqual([all, doc, xls], [6, 1, 5]); log('shablonlar filtri: Hammasi ' + all + ' / Word ' + doc + ' / Excel ' + xls); }

// 9. o'lchovlar "keyin"
console.log('--- o\'lchovlar (keyin) ---');
for (const [w, h] of [[390, 844], [1280, 900]]) { const p = await pg(w, h);
  for (const u of PAGES) { await go(p, u);
    const m = await p.evaluate(() => { const hist = {}; let total = 0; const wk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (wk.nextNode()) { const t = wk.currentNode, s = t.textContent.trim(); if (!s) continue; const el = t.parentElement; if (!el || el.closest('script,style,noscript')) continue; const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || (!el.offsetParent && cs.position !== 'fixed')) continue; const fs = Math.round(parseFloat(cs.fontSize) * 2) / 2; hist[fs] = (hist[fs] || 0) + s.length; total += s.length; }
      const lt = (n) => Math.round(100 * Object.entries(hist).filter(([k]) => +k < n).reduce((a, [, v]) => a + v, 0) / total);
      return { mod: Object.entries(hist).sort((a, b) => b[1] - a[1])[0][0], lt14: lt(14), lt15: lt(15), hdr: Math.round(document.getElementById('sitebar').getBoundingClientRect().height), docH: document.documentElement.scrollHeight }; });
    console.log(w + 'px ' + u, JSON.stringify(m)); } }
const real = errors.filter((e) => !/adsbygoogle|googletag/.test(e)); assert.deepEqual(real, [], real.join(' | ')); log('JS xatolari yo\'q');
await b.close(); srv.close();
