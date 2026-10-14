// Gaz xarajati kalkulyatori (pog'onali tarif, 2026-06-01): QO'LDA hisoblangan natijalar, UZ / RU / ЎЗ.
//   node tools/dizayn/test-gaz.mjs                       # lokal (Pages tartibini taqlid qiluvchi server)
//   node tools/dizayn/test-gaz.mjs https://<preview>     # jonli
// Bitta Chromium; track() yopadi (CLAUDE.md). Kutilgan qiymatlar funksiyadan OLINMAGAN.
//
//  isitish: 0–500 = 1 100 | 501–2 500 = 2 000 | 2 501–5 000 = 2 300 | 5 001–10 000 = 2 700 | 10 001+ = 3 300
//  boshqa:  0–100 = 1 100 | 101–2 500 = 2 000 | (qolgani isitishdagidek)
//   isitish   300 = 330 000                      | boshqa davrda shu sarf: 100×1 100 + 200×2 000 = 510 000
//   isitish   800 = 550 000 + 600 000 = 1 150 000| boshqa: 110 000 + 700×2 000 = 1 510 000
//   isitish 6 000 = 550 000 + 4 000 000 + 5 750 000 + 2 700 000 = 13 000 000 | boshqa: 110 000 + 4 800 000 + 5 750 000 + 2 700 000 = 13 360 000
//   boshqa     80 = 88 000                       | isitishda shu sarf: 88 000 (farq yo'q)
//   boshqa    150 = 110 000 + 100 000 = 210 000  | isitish: 165 000
//   boshqa  3 000 = 110 000 + 4 800 000 + 1 150 000 = 6 060 000 | isitish: 550 000 + 4 000 000 + 1 150 000 = 5 700 000
//   hisoblagich 12 340 → 12 640 = 300 m³ (isitishda 330 000)
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { track } from '../test-cleanup.cjs';
const require = createRequire(import.meta.url);
const { resolves, redirectTarget } = require('../verify-404.js');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

let BASE = process.argv[2];
if (!BASE) {
  const srv = http.createServer((q, r) => {
    const p = decodeURIComponent(q.url.split('?')[0]);
    const red = redirectTarget(p);
    if (red && !resolves(p)) { r.writeHead(301, { Location: red }); return r.end(); }
    const base = p.replace(/\/$/, '');
    const f = resolves(p) ? [path.join(ROOT, p), path.join(ROOT, base + '.html'), path.join(ROOT, base + '/index.html'), p === '/' ? path.join(ROOT, 'index.html') : ''].find((c) => c && fs.existsSync(c) && fs.statSync(c).isFile()) : null;
    if (!f) { r.writeHead(404, { 'Content-Type': MIME['.html'] }); return r.end(fs.readFileSync(path.join(ROOT, '404.html'))); }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f));
  });
  await new Promise((ok) => srv.listen(0, ok));
  BASE = 'http://localhost:' + srv.address().port;
}
BASE = BASE.replace(/\/$/, '');


// [rejim, davr, kirish, jami, boshqa-davr jami, o'rtacha narx, [pog'ona qatorlari m³, narx], izoh raqamlari]
const CASES = [
  ['use', 'heat', ['300'], 330000, 510000, 1100, [[300, 1100]], [1, 0, 500, 1100, 501, 200, 2000]],
  ['use', 'heat', ['800'], 1150000, 1510000, 1438, [[500, 1100], [300, 2000]], [2, 501, 2500, 2000, 2501, 1700, 2300]],
  ['use', 'heat', ['6000'], 13000000, 13360000, 2167, [[500, 1100], [2000, 2000], [2500, 2300], [1000, 2700]], [4, 5001, 10000, 2700, 10001, 4000, 3300]],
  ['use', 'other', ['80'], 88000, 88000, 1100, [[80, 1100]], [1, 0, 100, 1100, 101, 20, 2000]],
  ['use', 'other', ['150'], 210000, 165000, 1400, [[100, 1100], [50, 2000]], [2, 101, 2500, 2000, 2501, 2350, 2300]],
  ['use', 'other', ['3000'], 6060000, 5700000, 2020, [[100, 1100], [2400, 2000], [500, 2300]], [3, 2501, 5000, 2300, 5001, 2000, 2700]],
  ['meter', 'heat', ['12340', '12640'], 330000, 510000, 1100, [[300, 1100]], [1, 0, 500, 1100, 501, 200, 2000]]
];
// pog'ona chizig'i (assets/tier-bar.js): [pog'ona raqami (1-dan), strelka x %] — QO'LDA: x = (pog'ona + pog'ona ichidagi ulush) / 5
//  isitish 300: 300/500 = 0,6 → 0,6/5 = 12 | 800: (800−500)/2000 = 0,15 → 1,15/5 = 23 | 6000: (6000−5000)/5000 = 0,2 → 3,2/5 = 64
//  boshqa 80: 80/100 = 0,8 → 0,8/5 = 16 | 150: (150−100)/2400 = 0,0208 → 1,0208/5 = 20,42 | 3000: (3000−2500)/2500 = 0,2 → 2,2/5 = 44
const BAR = [[1, 12], [2, 23], [4, 64], [1, 16], [2, 20.42], [3, 44], [1, 12]];
const BAR_COLORS = ['rgb(30, 123, 75)', 'rgb(79, 127, 18)', 'rgb(138, 101, 0)', 'rgb(181, 71, 10)', 'rgb(179, 38, 30)'];   // yashil → qizil
const BAR_TICKS = { heat: [0, 500, 2500, 5000, 10000], other: [0, 100, 2500, 5000, 10000] };
const BAR_PRICES = [1100, 2000, 2300, 2700, 3300];
const lumT = ([r, g, bl]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl); };
const cr = (c1, c2) => { const x = lumT(c1), y = lumT(c2); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const rgbOf = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
// "Shu sarf boshqa davrda bo'lsa" qatori ostidagi aniq gap (minus belgisisiz): farq = boshqa davr jami − joriy jami (QO'LDA)
//  isitish 300: 510 000 − 330 000 = 180 000 qimmatroq | 800: 1 510 000 − 1 150 000 = 360 000 qimmatroq | 6000: 13 360 000 − 13 000 000 = 360 000 qimmatroq
//  boshqa 80: 88 000 − 88 000 = 0 (farq yo'q) | 150: 165 000 − 210 000 = 45 000 arzonroq | 3000: 5 700 000 − 6 060 000 = 360 000 arzonroq
const CMP = [['pricier', 180000], ['pricier', 360000], ['pricier', 360000], ['none', 0], ['cheaper', 45000], ['cheaper', 360000], ['pricier', 180000]];
const CMP_TXT = {
  UZ: { heatCur: { pricier: (x) => 'Boshqa davrda ' + x + " so'm qimmatroq" }, otherCur: { cheaper: (x) => 'Isitish mavsumida ' + x + " so'm arzonroq" }, none: "Narx farqi yo'q" },
  RU: { heatCur: { pricier: (x) => 'В остальной период на ' + x + ' сум дороже' }, otherCur: { cheaper: (x) => 'В отопительный сезон на ' + x + ' сум дешевле' }, none: 'Разницы в цене нет' },
  'ЎЗ': { heatCur: { pricier: (x) => 'Бошқа даврда ' + x + ' сўм қимматроқ' }, otherCur: { cheaper: (x) => 'Иситиш мавсумида ' + x + ' сўм арзонроқ' }, none: 'Нарх фарқи йўқ' }
};
const MODES = [
  { name: 'UZ', url: '/gaz-xarajat-kalkulyator', approx: /TAXMINIY/i, qq: /Qoraqalpog'iston va Xorazmda oktabr ham isitish mavsumi/, less: /kichik/, inv: /raqam/, shu: /^Davrlar farqi/ },
  { name: 'RU', url: '/ru/gaz-xarajat-kalkulyator', approx: /ОРИЕНТИРОВОЧНЫЙ/i, qq: /В Каракалпакстане и Хорезмской области октябрь тоже входит в отопительный сезон/, less: /меньше/, inv: /числами/, shu: /^Разница между периодами/ },
  { name: 'ЎЗ', url: '/gaz-xarajat-kalkulyator?lang=cyr', approx: /ТАХМИНИЙ/i, qq: /Қорақалпоғистон ва Хоразмда октабр ҳам иситиш мавсуми/, less: /кичик/, inv: /рақам/, shu: /^Даврлар фарқи/ }
];

let bad = 0; const table = [];
const T = (ok, name, extra) => { if (!ok) bad++; console.log((ok ? 'OK   ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); return ok; };
const digits = (s) => Number(String(s).replace(/[^\d]/g, '')) || 0;
const nums = (s) => (String(s).replace(/[  ]/g, ' ').match(/\d[\d ]*(?:,\d+)?/g) || []).map((x) => Number(x.replace(/ /g, '').replace(',', '.')));

const b = track(await chromium.launch());
const fixDate = (month) => `(() => { const R = Date, T = new R(2026, ${month - 1}, 15, 12).getTime(); class D extends R { constructor(...a) { if (a.length === 0) super(T); else super(...a); } static now() { return T; } } window.Date = D; })();`;
async function open(url, month, width) {
  const ctx = await b.newContext({ viewport: { width: width || 360, height: 800 }, serviceWorkers: 'block' });
  await ctx.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  if (month) await ctx.addInitScript(fixDate(month));
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await p.goto(BASE + url, { waitUntil: 'load' }); await p.waitForTimeout(1500);
  return { ctx, p, errs };
}
async function setIn(p, id, v) { await p.fill('#' + id, v); }

for (const mode of MODES) {
  const { ctx, p, errs } = await open(mode.url, 12);
  const info = await p.evaluate(() => {
    const body = document.body.innerText.replace(/[  ]/g, ' ');
    const a = document.querySelector('#srcNote a'), ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    return { body, link: a ? a.getAttribute('href') : null, link204: (document.querySelector('#seasonHint a') || {}).href || null, dn: (document.getElementById('datanote') || {}).textContent || '',
      dup: ids.filter((x, i) => ids.indexOf(x) !== i), seg: [...document.querySelectorAll('#modeSeg button, #seasonSeg button')].map((x) => x.getAttribute('aria-pressed')).join(','),
      heatOn: document.getElementById('seasonHeat').classList.contains('on'), hint: document.getElementById('seasonHint').textContent, over: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      title: document.title, h1: document.querySelector('h1').textContent };
  });
  const dated = mode.name === 'RU' ? /Тариф с 2026-06-01, дата проверки: 2026-10-13/ : mode.name === 'UZ' ? /Tarif 2026-06-01 dan, tekshirilgan sana: 2026-10-13/ : /Тариф 2026-06-01 дан, текширилган сана: 2026-10-13/;
  T(info.dup.length === 0, mode.name + ': takroriy id yo\'q', info.dup.join(','));
  T(info.link === 'https://lex.uz/uz/docs/-8195731' && /lex\.uz\/docs\/-6884060/.test(info.link204 || ''), mode.name + ': manba havolalari (243-son va mavsum uchun 204-son)', info.link + ' | ' + info.link204);
  T(dated.test(info.dn) && (info.body.match(new RegExp(dated.source, 'g')) || []).length === 1, mode.name + ': "Tarif 2026-06-01 dan, tekshirilgan sana: 2026-10-13" AYNAN BIR MARTA');
  T(info.heatOn && mode.approx.test(info.hint), mode.name + ': dekabrda boshlang\'ich davr = isitish mavsumi, izohda "taxminiy"', info.hint.slice(0, 60));
  T(mode.qq.test(info.hint.replace(/[\u00a0\u202f]/g, ' ')), mode.name + ': mavsum izohida «Qoraqalpog\'iston va Xorazmda oktabr ham isitish mavsumi»', info.hint.slice(0, 160));
  T(!/\bkW\b|\bkWt\b/.test(info.body) && !(mode.name === 'ЎЗ' && /[кК]W|W[тТ]/.test(info.body)), mode.name + ': "kW/кW" aralash yozuv yo\'q');
  T(!info.over, mode.name + ': 360px da gorizontal siljish yo\'q');
  await ctx.close();
  // ---- davr standarti oyga qarab (taxminiy) ----
  for (const [month, want] of [[1, true], [2, true], [3, false], [7, false], [10, false], [11, true], [12, true]]) {
    const o = await open(mode.url, month); const on = await o.p.evaluate(() => document.getElementById('seasonHeat').classList.contains('on'));
    T(on === want, mode.name + ': ' + month + '-oy standart davr ' + (want ? 'isitish' : 'boshqa'), String(on)); await o.ctx.close();
  }

  const o = await open(mode.url, 12); const q = o.p;
  for (const [ci, [mrej, davr, kir, jami, boshqa, avg, rows, note]] of CASES.entries()) {
    await q.click(mrej === 'use' ? '#modeUse' : '#modeMeter');
    await q.click(davr === 'heat' ? '#seasonHeat' : '#seasonOther');
    if (mrej === 'use') await setIn(q, 'm3In', kir[0]); else { await setIn(q, 'prevIn', kir[0]); await setIn(q, 'curIn', kir[1]); }
    await q.click('#calcBtn'); await q.waitForTimeout(250);
    const g = await q.evaluate(() => ({ main: document.getElementById('mainNum').textContent, rt: document.getElementById('rTotal').textContent, shown: document.getElementById('receipt').classList.contains('show'),
      tiers: [...document.querySelectorAll('#tierRows .rrow')].map((r) => ({ fx: r.querySelector('.fx').textContent, v: r.querySelector('.v').textContent })),
      extra: [...document.querySelectorAll('#extraRows .rrow')].map((r) => r.innerText.replace(/\s+/g, ' ')), pos: document.getElementById('posNote').textContent, use: document.getElementById('useRows').innerText.replace(/\s+/g, ' ') }));
    const why = [];
    if (digits(g.main) !== jami || digits(g.rt) !== jami) why.push('jami ' + digits(g.main) + ' kutilgan ' + jami);
    if (!g.shown) why.push('natija ko\'rinmadi');
    const got = g.tiers.map((r) => nums(r.fx)); const exp = rows.map(([m3, pr]) => [m3, pr]);
    if (JSON.stringify(got) !== JSON.stringify(exp)) why.push('pog\'onalar ' + JSON.stringify(got) + ' kutilgan ' + JSON.stringify(exp));
    if (g.tiers.reduce((s, r) => s + digits(r.v), 0) !== jami) why.push('qatorlar yig\'indisi jamiga teng emas');
    const avgN = nums(g.extra[0]); if (avgN[avgN.length - 1] !== avg) why.push('o\'rtacha narx ' + avgN[avgN.length - 1] + ' kutilgan ' + avg);
    const ot = g.extra[1] || ''; const otNums = nums(ot);
    { const [dir, amt] = CMP[ci], X = String(amt).replace(/\B(?=(\d{3})+(?!\d))/g, ' '), C = CMP_TXT[mode.name];
      const want = dir === 'none' ? C.none : (davr === 'heat' ? C.heatCur : C.otherCur)[dir](X);
      if (!ot.replace(/[\u00a0\u202f]/g, ' ').includes(want)) why.push('taqqoslash gapi kutilgan "' + want + '" | ' + ot);
      if (/[−–—]|(^|[\s(])-\d/.test(ot.replace(/[\u00a0\u202f]/g, ' ').replace(/\d+\s*[–-]\s*\d+/g, ''))) why.push('taqqoslash qatorida minus belgisi bor: ' + ot); }
    if (otNums[otNums.length - 1] !== boshqa || !mode.shu.test(ot)) why.push('boshqa davr jami ' + otNums[otNums.length - 1] + ' kutilgan ' + boshqa + ' | ' + ot);
    if (JSON.stringify(nums(g.pos)) !== JSON.stringify(note)) why.push('izoh ' + JSON.stringify(nums(g.pos)) + ' kutilgan ' + JSON.stringify(note));
    if (mode.name === 'ЎЗ' && /[A-Za-z]/.test(g.extra.join(' ') + g.pos + g.use)) why.push('ЎЗ da lotin harf: ' + (g.pos.match(/[A-Za-z]+/g) || []).join(' '));
    // ---- pog'ona chizig'i ----
    const tb = await q.evaluate(() => {
      const pl = document.querySelector('#tierBar .tb'); if (!pl) return null;
      const segs = [...pl.querySelectorAll('.tb-seg')], val = pl.querySelector('.tb-val'), pr = pl.getBoundingClientRect(), vr = val ? val.getBoundingClientRect() : null;
      const rc = document.getElementById('receipt').getBoundingClientRect();
      return { n: segs.length, bg: segs.map((x) => getComputedStyle(x).backgroundColor), col: segs.map((x) => getComputedStyle(x).color), txt: segs.map((x) => x.textContent.replace(/\s/g, '')), on: segs.findIndex((x) => x.classList.contains('on')) + 1,
        x: Number(pl.getAttribute('data-x')), tier: Number(pl.getAttribute('data-tier')), label: val ? val.textContent : '', inside: !!vr && vr.left >= pr.left - 1 && vr.right <= pr.right + 1,
        ticks: [...pl.querySelectorAll('.tb-tick')].map((x) => x.textContent.replace(/\s/g, '')), aria: pl.getAttribute('aria-label'), role: pl.getAttribute('role'), fits: pr.left >= rc.left - 1 && pr.right <= rc.right + 1, cap: !!pl.querySelector('.tb-cap') };
    });
    const [btier, bx] = BAR[ci];
    if (!tb) why.push('pog\'ona chizig\'i yo\'q');
    else {
      if (tb.n !== 5 || new Set(tb.bg).size !== 5 || JSON.stringify(tb.bg) !== JSON.stringify(BAR_COLORS)) why.push('ranglar ' + tb.bg.join('|'));
      if (tb.col.some((c, i) => cr(rgbOf(c), rgbOf(tb.bg[i])) < 4.5)) why.push('pog\'ona ichidagi yozuv kontrasti < 4,5');
      if (JSON.stringify(tb.txt.map((x) => digits(x))) !== JSON.stringify(BAR_PRICES)) why.push('narxlar ' + tb.txt.join(','));
      if (tb.on !== btier || tb.tier !== btier) why.push('pog\'ona ' + tb.on + ' kutilgan ' + btier);
      if (Math.abs(tb.x - bx) > 0.01) why.push('strelka x ' + tb.x + ' kutilgan ' + bx);
      if (tb.label.replace(/\s/g, '') !== (rows.reduce((s, r) => s + r[0], 0) + 'm³').replace(/\s/g, '') && !/m³|м³/.test(tb.label)) why.push('strelka yozuvi ' + tb.label);
      if (!tb.inside || !tb.fits) why.push('strelka yozuvi/chizig\'i kartadan chiqib ketdi');
      if (JSON.stringify(tb.ticks.map((x) => digits(x))) !== JSON.stringify(BAR_TICKS[davr])) why.push('chegaralar ' + tb.ticks.join(','));
      if (tb.role !== 'img' || !/\d/.test(tb.aria || '') || !tb.cap) why.push('aria/izoh yo\'q');
    }
    T(!why.length, mode.name + ' · ' + mrej + ' · ' + davr + ' · ' + kir.join('→') + ': ' + jami + ' (boshqa davr ' + boshqa + ', ≈ ' + avg + ')', why.join(' | '));
    table.push([mode.name, mrej, davr, kir.join('→'), jami, digits(g.main), why.length ? 'FAIL' : 'OK']);
  }
  // ---- pog'ona chizig'i: 320 px da sig'adi, chetki qiymatlarda yozuv kartadan chiqmaydi ----
  {
    const w = await open(mode.url, 12, 320);
    for (const [m3, sx] of [['1', 1], ['500', 20], ['20000', 90], ['10001', 90]]) {
      await w.p.click('#modeUse'); await w.p.click('#seasonHeat'); await setIn(w.p, 'm3In', m3); await w.p.click('#calcBtn'); await w.p.waitForTimeout(200);
      const g = await w.p.evaluate(() => { const pl = document.querySelector('#tierBar .tb'), v = pl.querySelector('.tb-val').getBoundingClientRect(), r = pl.getBoundingClientRect();
        return { x: Number(pl.getAttribute('data-x')), in: v.left >= r.left - 1 && v.right <= r.right + 1, over: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, w: Math.round(r.width), segW: Math.round(pl.querySelector('.tb-seg').getBoundingClientRect().width),
          clip: [...pl.querySelectorAll('.tb-seg, .tb-tick')].some((e) => e.scrollWidth > e.clientWidth + 1 && e.classList.contains('tb-seg')) }; });
      T(g.in && !g.over && !g.clip && g.w > 200, mode.name + ' · 320 px · ' + m3 + ' m³: chiziq sig\'adi (kenglik ' + g.w + ', pog\'ona ' + g.segW + '), yozuv kartadan chiqmaydi, x=' + g.x, JSON.stringify(g));
    }
    T(w.errs.length === 0, mode.name + ' · 320 px: JS xatolari yo\'q', w.errs.join(' | '));
    await w.ctx.close();
  }
  // ---- hisoblagich xatolari ----
  await q.click('#modeMeter'); await q.click('#seasonHeat');
  await setIn(q, 'prevIn', '12 640'); await setIn(q, 'curIn', '12 340'); await q.click('#calcBtn'); await q.waitForTimeout(200);
  const e1 = await q.evaluate(() => { const m = document.getElementById('meterMsg'); return { vis: !m.hidden && m.getBoundingClientRect().height > 0, txt: m.textContent, shown: document.getElementById('receipt').classList.contains('show'), role: m.getAttribute('role') }; });
  T(e1.vis && mode.less.test(e1.txt) && !e1.shown && e1.role === 'alert', mode.name + ': hozirgi < oldingi → aniq xato xabari, natija yashirin', e1.txt);
  await setIn(q, 'curIn', ''); await q.click('#calcBtn'); await q.waitForTimeout(200);
  const e2 = await q.evaluate(() => { const m = document.getElementById('meterMsg'); return { vis: !m.hidden, txt: m.textContent, shown: document.getElementById('receipt').classList.contains('show') }; });
  T(e2.vis && mode.inv.test(e2.txt) && !e2.shown, mode.name + ': bo\'sh ko\'rsatkich → xato xabari', e2.txt);
  await setIn(q, 'curIn', '12 700'); await q.click('#calcBtn'); await q.waitForTimeout(200);
  const e3 = await q.evaluate(() => ({ hid: document.getElementById('meterMsg').hidden, main: document.getElementById('mainNum').textContent }));
  T(e3.hid && digits(e3.main) === 60 * 1100, mode.name + ': to\'g\'rilangach xato yo\'qoladi, 60 m³ × 1 100 = 66 000', e3.main);
  // ---- ulashish (?p=) ----
  await q.click('#modeUse'); await q.click('#seasonOther'); await setIn(q, 'm3In', '150'); await q.click('#calcBtn'); await q.waitForTimeout(200);
  const link = await q.evaluate(() => window.__buildShareUrl());
  const o2 = await open(link.replace(/^https?:\/\/[^/]+/, '').replace(/^\/(?=ru\/|gaz)/, '/')); await o2.p.waitForTimeout(900);
  const sh = await o2.p.evaluate(() => ({ main: document.getElementById('mainNum').textContent, other: document.getElementById('seasonOther').classList.contains('on'), v: document.getElementById('m3In').value }));
  T(digits(sh.main) === 210000 && sh.other && sh.v === '150', mode.name + ': ulashish havolasi holatni tiklaydi (boshqa davr, 150 m³ → 210 000)', JSON.stringify(sh));
  await o2.ctx.close();
  T(errs.length === 0 && o.errs.length === 0, mode.name + ': JS xatolari yo\'q', errs.concat(o.errs).join(' | '));
  await o.ctx.close();
}
console.log('\nJadval (til · rejim · davr · kirish · kutilgan · kalkulyator · holat):');
table.forEach((r) => console.log('  ' + r.join(' · ')));
console.log('\n' + (bad ? bad + ' ta tekshiruv yiqildi' : 'hammasi o\'tdi'));
await b.close();
process.exit(bad ? 1 : 0);
