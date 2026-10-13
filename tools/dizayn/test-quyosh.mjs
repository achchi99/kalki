// Quyosh paneli kalkulyatori (pog'onali tarif, 2026-06-01): uy sarfi + panel ishlab chiqargani, 2 toifa — QO'LDA hisoblangan natija bilan.
//   node tools/dizayn/test-quyosh.mjs                       # lokal (Pages tartibini taqlid qiluvchi server)
//   node tools/dizayn/test-quyosh.mjs https://<preview>     # jonli
// Tillar: UZ, RU, ЎЗ (?lang=cyr). Bitta Chromium; track() yopadi (CLAUDE.md).
//
// Panel ishlab chiqarishi aniq bo'lishi uchun hudud = Markaz (1500 kVt·soat/kVt/yil), oyiga = kVt × 125:
//   150 kVt·soat = 2 panel × 600 Vt (1,2 kVt) | 300 = 4 × 600 Vt (2,4 kVt) | 400 = 8 × 400 Vt (3,2 kVt). Tizim narxi 9 000 000 so'm/kVt (standart).
// Panel ENG QIMMAT pog'onadagi sarfni birinchi qoplaydi: tejash = to'lov(uy) − to'lov(uy − panel). Qo'lda:
//  oddiy (650 / 900 / 1 100):
//   uy 350, panel 150: 350 = 130 000 + 150×900 = 265 000;  qoladi 200 = 130 000;  tejash 135 000 (150×900, pog'ona 201–500, ≈ 900); yiliga 1 620 000; narx 10 800 000 → 6,7 yil
//   uy 600, panel 300: 600 = 130 000 + 270 000 + 100×1100 = 510 000;  qoladi 300 = 130 000 + 100×900 = 220 000;  tejash 290 000 (200×900 + 100×1100, pog'ona 201–500 va 501–1 000, ≈ 967); yiliga 3 480 000; narx 21 600 000 → 6,2 yil
//   uy 200, panel 400: 200 = 130 000;  qoladi 0;  tejash 130 000 (200×650, pog'ona 0–200, ≈ 650); ORTIQCHA 200; yiliga 1 560 000; narx 28 800 000 → 18,5 yil
//  elektr plitali (325 / 450 / 550):
//   uy 350, panel 150: 132 500 → 65 000;  tejash 67 500 (150×450, ≈ 450); yiliga 810 000 → 13,3 yil
//   uy 600, panel 300: 255 000 → 110 000;  tejash 145 000 (200×450 + 100×550, ≈ 483); yiliga 1 740 000 → 12,4 yil
//   uy 200, panel 400: 65 000 → 0;  tejash 65 000 (200×325, ≈ 325); ortiqcha 200; yiliga 780 000 → 36,9 yil
//  sotish narxi 1 000 so'm/kVt·soat (foydalanuvchi kiritgan; qarorda YO'Q), uy 200/panel 400 oddiy: ortiqcha 200 × 1 000 × 12 = 2 400 000/yil; qoplash 28 800 000 / (1 560 000 + 2 400 000) = 7,3 yil
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

// [uy, panel kVt·soat, panelsIn, panelW, toifa, oldin, keyin, tejash, ortiqcha, yiliga, izoh raqamlari, qoplash yil]
const CASES = [
  [350, 150, 2, 600, 'std',   265000, 130000, 135000, 0,   1620000, [201, 500, 1, 900], 6.7],
  [600, 300, 4, 600, 'std',   510000, 220000, 290000, 0,   3480000, [201, 500, 501, 1000, 1, 967], 6.2],
  [200, 400, 8, 400, 'std',   130000, 0,      130000, 200, 1560000, [0, 200, 1, 650], 18.5],
  [350, 150, 2, 600, 'stove', 132500, 65000,  67500,  0,   810000,  [201, 500, 1, 450], 13.3],
  [600, 300, 4, 600, 'stove', 255000, 110000, 145000, 0,   1740000, [201, 500, 501, 1000, 1, 483], 12.4],
  [200, 400, 8, 400, 'stove', 65000,  0,      65000,  200, 780000,  [0, 200, 1, 325], 36.9]
];
const MODES = [
  { name: 'UZ', url: '/quyosh-panel-kalkulyator' },
  { name: 'RU', url: '/ru/quyosh-panel-kalkulyator' },
  { name: 'ЎЗ', url: '/quyosh-panel-kalkulyator?lang=cyr' }
];

let bad = 0; const table = [];
const T = (ok, name, extra) => { if (!ok) bad++; console.log((ok ? 'OK   ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); return ok; };
const digits = (s) => Number(String(s).replace(/[^\d]/g, '')) || 0;
const nums = (s) => (String(s).replace(/[  ]/g, ' ').match(/\d[\d ]*(?:,\d+)?/g) || []).map((x) => Number(x.replace(/ /g, '').replace(',', '.')));

const b = track(await chromium.launch());
for (const mode of MODES) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 800 }, serviceWorkers: 'block' });
  await ctx.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await p.goto(BASE + mode.url, { waitUntil: 'load' }); await p.waitForTimeout(1800);

  const info = await p.evaluate(() => {
    const body = document.body.innerText.replace(/ /g, ' ');
    const a = document.querySelector('#srcNote a'); const html = document.documentElement.outerHTML; const head = html.slice(0, html.indexOf('</head>'));
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    return { body, link: a ? a.getAttribute('href') : null, dn: (document.getElementById('datanote') || {}).textContent || '', dup,
      cats: [...document.querySelectorAll('#catSeg button')].map((x) => x.textContent.trim() + '|' + x.getAttribute('aria-pressed')),
      tariffInput: !!document.getElementById('tariff'), house: (document.getElementById('monthKwh') || {}).value, sell: (document.getElementById('sellPrice') || {}).value,
      metas: ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'].map((q) => (document.querySelector(q) || {}).content || ''),
      headOk: head.includes('rel="manifest"') && head.includes('apple-touch-icon'),
      firstText: (() => { const w = document.createTreeWalker(document.body, 4); let n; while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (t && !/^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.parentNode.nodeName)) return t.slice(0, 60); } return ''; })(),
      ovf: document.documentElement.scrollWidth - innerWidth };
  });
  T(!info.tariffInput && !/Elektr narxi \(1 kWt\)|Цена электричества \(1 кВт\)/.test(info.body), mode.name + ': tekis narx maydoni (value=650) yo\'q');
  T(info.house === '350', mode.name + ': "Uyning oylik elektr sarfi" standart 350', String(info.house));
  T(!/900[–-]1100|450\s*[-–]\s*900|hududga qarab/.test(info.body), mode.name + ': eski tarif izohi ("900–1100 so\'m") yo\'q');
  T(info.sell === '0' && info.dup.length === 0, mode.name + ': sotish narxi maydoni bor (standart 0), takroriy id yo\'q', info.dup.join(','));
  T(info.link === 'https://lex.uz/uz/docs/-8195731', mode.name + ': manba havolasi lex.uz 243-son', String(info.link));
  const dated = mode.name === 'RU' ? /Тариф с 2026-06-01, дата проверки: 2026-10-13/ : mode.name === 'UZ' ? /Tarif 2026-06-01 dan, tekshirilgan sana: 2026-10-13/ : /Тариф 2026-06-01 дан, текширилган сана: 2026-10-13/;
  const datedCount = (info.body.match(new RegExp(dated.source, 'g')) || []).length;
  T(dated.test(info.dn) && datedCount === 1, mode.name + ': "Tarif 2026-06-01 dan, tekshirilgan sana: 2026-10-13" sahifada AYNAN BIR MARTA', 'marta: ' + datedCount);
  T(info.cats.length === 2 && info.cats[0].endsWith('|true') && info.cats[1].endsWith('|false'), mode.name + ': 2 ta toifa tugmasi (standart: birinchisi)', info.cats.join(' / '));
  const metaOk = mode.name === 'RU' ? /ступенчат/ : /pog'onali|пог'?онали|поғонали/;
  T(info.metas.every((m) => m.length >= 120 && m.length <= 165 && metaOk.test(m)), mode.name + ': meta description/og/twitter bor, 120–165 belgi, yangi tarifni aytadi', info.metas.map((m) => m.length).join('/'));
  T(info.headOk && /Kalki/i.test(info.firstText), mode.name + ': <head> butun va sahifa tepasida begona matn yo\'q', info.firstText);
  T(!/\bkW\b|\bkWt\b/.test(info.body) && !(mode.name === 'ЎЗ' && /[кК]W|W[тТ]/.test(info.body)), mode.name + ': "kW/kWt" yo\'q (kVt / кВт ishlatilgan; ЎЗ da "кW" yo\'q)');
  T(info.ovf <= 0, mode.name + ': 360px da gorizontal siljish yo\'q', String(info.ovf));

  await p.click('[data-region="mid"]');
  for (const [house, gen, cnt, pw, cat, before, after, save, surplus, yearly, noteNums, payback] of CASES) {
    await p.evaluate(({ house, cnt, pw }) => {
      document.getElementById('monthKwh').value = String(house); document.getElementById('panelW').value = String(pw);
      document.getElementById('panelsIn').value = String(cnt); document.getElementById('sellPrice').value = '0';
    }, { house, cnt, pw });
    await p.click(cat === 'std' ? '#catStd' : '#catStove'); await p.click('#calcBtn'); await p.waitForTimeout(450);
    const g = await p.evaluate(() => ({ cnt: document.getElementById('panelCount').textContent, gen: document.getElementById('rMonthGen').textContent, before: document.getElementById('rBillBefore').textContent,
      after: document.getElementById('rBillAfter').textContent, save: document.getElementById('rMonthSave').textContent, sur: document.getElementById('rSurplus').textContent,
      year: document.getElementById('rYearSave').textContent, note: document.getElementById('saveNote').textContent, sn: document.getElementById('surplusNote').textContent,
      snHidden: document.getElementById('surplusNote').hidden, rowSellHidden: document.getElementById('rowSell').hidden, pay: document.getElementById('paybackYr').textContent,
      txt: document.getElementById('receipt').innerText + ' ' + document.getElementById('surplusNote').textContent + document.getElementById('saveNote').textContent }));
    const why = [];
    if (digits(g.cnt) !== cnt) why.push('panel soni ' + g.cnt);
    if (digits(g.gen) !== gen) why.push('oylik ishlab chiqarish ' + digits(g.gen) + ' kutilgan ' + gen);
    if (digits(g.before) !== before) why.push('oldin ' + digits(g.before));
    if (digits(g.after) !== after) why.push('keyin ' + digits(g.after));
    if (digits(g.save) !== save) why.push('tejash ' + digits(g.save));
    if (digits(g.before) - digits(g.after) !== digits(g.save)) why.push('oldin − keyin ≠ tejash');
    if (digits(g.sur) !== surplus) why.push('ortiqcha ' + digits(g.sur));
    if (g.snHidden !== (surplus === 0)) why.push('ortiqcha izohi ko\'rinishi hidden=' + g.snHidden);
    if (!g.rowSellHidden) why.push('sotish qatori ko\'rinib turibdi (narx 0)');
    if (digits(g.year) !== yearly) why.push('yiliga ' + digits(g.year) + ' kutilgan ' + yearly);
    if (JSON.stringify(nums(g.note)) !== JSON.stringify(noteNums)) why.push('izoh ' + JSON.stringify(nums(g.note)) + ' kutilgan ' + JSON.stringify(noteNums));
    const pb = nums(g.pay)[0]; if (pb !== payback) why.push('qoplash ' + g.pay + ' kutilgan ' + payback);
    if (mode.name === 'ЎЗ' && /[A-Za-z]/.test(g.txt.replace(/Kalki|PDF/g, ''))) why.push('ЎЗ da lotin harf: ' + (g.txt.match(/[A-Za-z']+/g) || []).slice(0, 4).join(' '));
    T(!why.length, mode.name + ' · uy ' + house + ' / panel ' + gen + ' · ' + (cat === 'std' ? 'oddiy' : 'elektr plitali') + ': ' + before + ' → ' + after + ', tejash ' + save + (surplus ? ', ortiqcha ' + surplus : '') + ', ' + payback + ' yil', why.join(' | '));
    table.push([mode.name, house + '/' + gen, cat, save, digits(g.save), surplus, digits(g.sur), payback, pb, why.length ? 'FAIL' : 'OK']);
  }
  // sotish narxi (foydalanuvchi kiritadi; qarorda yo'q): uy 200 / panel 400, oddiy
  await p.evaluate(() => { document.getElementById('monthKwh').value = '200'; document.getElementById('panelW').value = '400'; document.getElementById('panelsIn').value = '8'; document.getElementById('sellPrice').value = '1 000'; });
  await p.click('#catStd'); await p.click('#calcBtn'); await p.waitForTimeout(450);
  const s = await p.evaluate(() => ({ sellHidden: document.getElementById('rowSell').hidden, sell: document.getElementById('rSellYear').textContent, pay: document.getElementById('paybackYr').textContent, year: document.getElementById('rYearSave').textContent }));
  T(!s.sellHidden && digits(s.sell) === 2400000 && digits(s.year) === 1560000 && nums(s.pay)[0] === 7.3, mode.name + ' · sotish 1 000 so\'m: ortiqcha 200×1 000×12 = 2 400 000/yil, qoplash 28 800 000/(1 560 000+2 400 000) = 7,3 yil', JSON.stringify(s));
  if (mode.name === 'UZ' && process.env.SHOT_QUYOSH) await p.locator('#receipt').screenshot({ path: process.env.SHOT_QUYOSH }).catch(() => {});
  T(errs.length === 0, mode.name + ': JS xatolari yo\'q', errs.join(' | '));
  await ctx.close();
}
console.log('\nJadval (til · uy/panel · toifa · tejash kutilgan · kalkulyator · ortiqcha kutilgan · kalkulyator · qoplash kutilgan · kalkulyator · holat):');
table.forEach((r) => console.log('  ' + r.join(' · ')));
await b.close();
process.exit(bad ? 1 : 0);
