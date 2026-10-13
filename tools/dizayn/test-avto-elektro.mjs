// Avto kalkulyatori, ELEKTROMOBIL qismi (pog'onali tarif, 2026-06-01) — QO'LDA hisoblangan natija bilan; boshqa yoqilg'ilar regressiyasi.
//   node tools/dizayn/test-avto-elektro.mjs                       # lokal (Pages tartibini taqlid qiluvchi server)
//   node tools/dizayn/test-avto-elektro.mjs https://<preview>     # jonli
// Tillar: UZ, RU, ЎЗ (?lang=cyr). Bitta Chromium; track() yopadi (CLAUDE.md).
//
// Kirish: oyiga 1 500 km, 15 kVt·soat/100 km, uyda 80%, uyning oylik sarfi 350. Stansiya narxi TEST uchun 2 000 so'm/kVt·soat
// (qarorda yo'q: foydalanuvchi kiritadi; standart 0). Boshqa yillik xarajatlar standart: 400 000 + 2 000 000 + 1 500 000 + 0 + 500 000 = 4 400 000.
//  Jami zaryad = 1500/100 × 15 = 225 kVt·soat/oy: uyda 80% = 180, stansiyada 20% = 45.
//  oddiy:   uy 350 = 130 000 + 150×900 = 265 000; + 180 = 530 = 130 000 + 300×900 + 30×1100 = 433 000;
//           uyda zaryad = 168 000/oy (150×900 + 30×1100), 1 kVt·soat ≈ 933 (pog'ona 201–500 va 501–1 000); stansiya 45 × 2 000 = 90 000/oy
//           yoqilg'i yiliga = 12 × (168 000 + 90 000) = 3 096 000; jami = 3 096 000 + 4 400 000 = 7 496 000; 1 km = 7 496 000 / 18 000 = 416
//  plitali: uy 350 = 65 000 + 150×450 = 132 500; 530 = 65 000 + 135 000 + 30×550 = 216 500; uyda zaryad = 84 000/oy, ≈ 467; stansiya 90 000/oy
//           yoqilg'i yiliga = 12 × (84 000 + 90 000) = 2 088 000; jami 6 488 000; 1 km = 360
//  stansiya narxi kiritilmagan (0), oddiy: yoqilg'i 12 × 168 000 = 2 016 000; jami 6 416 000; "stansiya narxi kiritilmagan" ogohlantirishi
//  boshqa yoqilg'i (oyiga 1 500 km = 180 × 100 km/yil): benzin 180×10×9 000 = 16 200 000 → 20 600 000 | metan 180×12×2 500 = 5 400 000 → 9 800 000
//                                                       propan 180×13×5 500 = 12 870 000 → 17 270 000 | gibrid 180×5×9 000 = 8 100 000 → 12 500 000
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

// [toifa, stansiya narxi, uyda kVt·soat, uy to'lovi/oy, o'rtacha narx, izoh raqamlari, stansiya raqamlari, yoqilg'i yiliga, jami yiliga, 1 km]
// share: null = standart (100%, qo'lda tegilmaydi); son = qo'lda kiritilgan ulush. stNums null = stansiya izohi yashirin.
// 100% (225 kVt·soat uyda): oddiy 575 kVt·soat = 130 000 + 300×900 + 75×1100 = 482 500, −265 000 = 217 500 (≈ 967), yiliga 2 610 000, jami 4 400 000 + 2 610 000 = 7 010 000, 1 km 389;
//   plita 575 = 65 000 + 300×450 + 75×550 = 241 250, −132 500 = 108 750 (≈ 483), yiliga 1 305 000, jami 5 705 000, 1 km 317.
const EV = [
  ['std',   0,    null, 225, 217500, 967, [201, 500, 501, 1000], null, 2610000, 7010000, 389],
  ['stove', 0,    null, 225, 108750, 483, [201, 500, 501, 1000], null, 1305000, 5705000, 317],
  ['std',   2000, 80, 180, 168000, 933, [201, 500, 501, 1000], [45, 2000, 90000], 3096000, 7496000, 416],
  ['stove', 2000, 80, 180, 84000,  467, [201, 500, 501, 1000], [45, 2000, 90000], 2088000, 6488000, 360],
  ['std',   0,    80, 180, 168000, 933, [201, 500, 501, 1000], [],                2016000, 6416000, 356],
];
const OTHER = [['benzin', 20600000], ['metan', 9800000], ['propan', 17270000], ['gibrid', 12500000]];
const MODES = [
  { name: 'UZ', url: '/avto-xarajat-kalkulyator' },
  { name: 'RU', url: '/ru/avto-xarajat-kalkulyator' },
  { name: 'ЎЗ', url: '/avto-xarajat-kalkulyator?lang=cyr' }
];

let bad = 0; const table = [];
const T = (ok, name, extra) => { if (!ok) bad++; console.log((ok ? 'OK   ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); return ok; };
const digits = (s) => Number(String(s).replace(/[^\d]/g, '')) || 0;
const nums = (s) => (String(s).replace(/[  ]/g, ' ').match(/\d[\d ]*(?:,\d+)?/g) || []).map((x) => Number(x.replace(/ /g, '').replace(',', '.')));
const vis = (page, id) => page.evaluate((i) => { const e = document.getElementById(i); return !!e && getComputedStyle(e).display !== 'none' && !e.hidden; }, id);

const b = track(await chromium.launch());
for (const mode of MODES) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 800 }, serviceWorkers: 'block' });
  await ctx.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await p.goto(BASE + mode.url, { waitUntil: 'load' }); await p.waitForTimeout(1800);

  const info = await p.evaluate(() => {
    const html = document.documentElement.outerHTML; const head = html.slice(0, html.indexOf('</head>'));
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    return { body: document.body.innerText.replace(/ /g, ' '), headOk: head.includes('rel="manifest"') && head.includes('apple-touch-icon'), dup, ovf: document.documentElement.scrollWidth - innerWidth,
      has450: /price:\s*450|450 so'm|450 сум/.test(html), dn: (document.getElementById('datanote') || {}).textContent || '',
      firstText: (() => { const w = document.createTreeWalker(document.body, 4); let n; while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (t && !/^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.parentNode.nodeName)) return t.slice(0, 60); } return ''; })() };
  });
  T(info.headOk && /Kalki/i.test(info.firstText) && info.dup.length === 0, mode.name + ': <head> butun, sahifa tepasida begona matn yo\'q, takroriy id yo\'q', info.firstText + ' ' + info.dup.join(','));
  T(!info.has450, mode.name + ': eski 450 so\'m/kVt narxi sahifada yo\'q');
  T(!/Tarif 2026-06-01|Тариф с 2026-06-01|Тариф 2026-06-01/.test(info.body) && /avgust|август|август/i.test(info.dn), mode.name + ': benzin rejimida tarif sanasi ko\'rinmaydi (umumiy "Ma\'lumot ... avgust" qoladi)', info.dn);
  T(info.ovf <= 0, mode.name + ': 360px da gorizontal siljish yo\'q', String(info.ovf));

  // ---- boshqa yoqilg'i regressiyasi (TEGILMAGAN qism) ----
  for (const [fuel, total] of OTHER) {
    await p.click('[data-fuel="' + fuel + '"]'); await p.waitForTimeout(150);
    await p.click('#calcBtn'); await p.waitForTimeout(350);
    const r = await p.evaluate(() => ({ t: document.getElementById('rTotalYear').textContent }));
    const evHidden = !(await vis(p, 'evBox')), priceShown = await vis(p, 'fuelPriceBox');
    T(digits(r.t) === total && evHidden && priceShown, mode.name + ' · ' + fuel + ' (oyiga 1 500 km, standart): jami ' + total + ', elektromobil bloki yashirin, narx maydoni ko\'rinadi', 'jami ' + digits(r.t));
  }

  // ---- elektromobil ----
  await p.click('[data-fuel="elektro"]'); await p.waitForTimeout(200);
  T((await vis(p, 'evBox')) && !(await vis(p, 'fuelPriceBox')), mode.name + ': elektro: uyda/stansiya bloki ko\'rinadi, tekis narx maydoni yashirin');
  const evInfo = await p.evaluate(() => ({ body: document.body.innerText.replace(/ /g, ' '), link: (document.querySelector('#srcNote a') || {}).href || null, dn: (document.getElementById('datanote') || {}).textContent || '',
    cats: [...document.querySelectorAll('#catSeg button')].map((x) => x.getAttribute('aria-pressed')).join(','), share: document.getElementById('homeShare').value, house: document.getElementById('houseKwh').value, sp: document.getElementById('stationPrice').value,
    unit: document.getElementById('consUnit').textContent }));
  const dated = mode.name === 'RU' ? /Тариф с 2026-06-01, дата проверки: 2026-10-13/ : mode.name === 'UZ' ? /Tarif 2026-06-01 dan, tekshirilgan sana: 2026-10-13/ : /Тариф 2026-06-01 дан, текширилган сана: 2026-10-13/;
  const dc = (evInfo.body.match(new RegExp(dated.source, 'g')) || []).length;
  T(dc === 1 && dated.test(evInfo.dn), mode.name + ': elektro: "Tarif 2026-06-01 dan, tekshirilgan sana: 2026-10-13" AYNAN BIR MARTA', 'marta: ' + dc);
  T(evInfo.link === 'https://lex.uz/uz/docs/-8195731' && evInfo.cats === 'true,false' && evInfo.share === '100' && evInfo.house === '350' && evInfo.sp === '0', mode.name + ': elektro: manba havolasi, 2 ta toifa tugmasi, standart 100% / 350 / stansiya 0', JSON.stringify({ l: evInfo.link, c: evInfo.cats, s: evInfo.share, h: evInfo.house, p: evInfo.sp }));
  T(!/\bkW\b|\bkWt\b/.test(evInfo.body) && !(mode.name === 'ЎЗ' && /[кК]W|W[тТ]/.test(evInfo.body)) && /(kVt-soat\/100|кВт-ч\/100|кВт-соат\/100)/.test(evInfo.unit), mode.name + ': elektro: "kW/kWt" yo\'q, birlik "kVt-soat/100" / "кВт-ч/100"', evInfo.unit);

  for (const [cat, sp, share, homeKwh, homeCost, eff, tierNums, stNums, fuelYear, totalYear, perKm] of EV) {
    await p.evaluate(({ sp, share }) => {
      document.getElementById('kmMonth').value = '1 500'; document.getElementById('consumption').value = '15'; if (share !== null) document.getElementById('homeShare').value = String(share);
      document.getElementById('houseKwh').value = '350'; document.getElementById('stationPrice').value = String(sp);
    }, { sp, share });
    await p.click(cat === 'std' ? '#catStd' : '#catStove'); await p.click('#calcBtn'); await p.waitForTimeout(450);
    const g = await p.evaluate(() => ({ fuel: document.getElementById('rFuel').textContent, total: document.getElementById('rTotalYear').textContent, main: document.getElementById('mainNum').textContent,
      perKm: document.getElementById('perKmNote').textContent, home: document.getElementById('evHomeNote').textContent, st: document.getElementById('evStationNote').textContent,
      stHidden: document.getElementById('evStationNote').hidden, txt: document.getElementById('receipt').innerText + ' ' + document.getElementById('evHomeNote').textContent + document.getElementById('evStationNote').textContent }));
    const why = [];
    if (digits(g.fuel) !== fuelYear) why.push('yoqilg\'i ' + digits(g.fuel) + ' kutilgan ' + fuelYear);
    if (digits(g.total) !== totalYear || digits(g.main) !== totalYear) why.push('jami ' + digits(g.total) + ' kutilgan ' + totalYear);
    if (!nums(g.perKm).includes(perKm)) why.push('1 km ' + JSON.stringify(nums(g.perKm)) + ' kutilgan ' + perKm);
    const hn = nums(g.home); const expHome = [homeKwh, ...tierNums, 1, eff, homeCost];
    if (JSON.stringify(hn) !== JSON.stringify(expHome)) why.push('uyda izoh ' + JSON.stringify(hn) + ' kutilgan ' + JSON.stringify(expHome));
    if (stNums === null) { if (!g.stHidden || g.st.trim()) why.push('100% da stansiya izohi/ogohlantirish chiqmasligi kerak: ' + g.st); }
    else {
      if (JSON.stringify(nums(g.st)) !== JSON.stringify(stNums)) why.push('stansiya izohi ' + JSON.stringify(nums(g.st)) + ' kutilgan ' + JSON.stringify(stNums));
      if (g.stHidden) why.push('stansiya izohi yashirin');
      const warn = /Stansiyada zaryad narxini kiriting, aks holda u bepul hisoblanadi|Укажите цену зарядки на станции, иначе она считается бесплатной|Стансияда заряд нархини киритинг, акс ҳолда у бепул ҳисобланади/.test(g.st);
      if (sp === 0 && !warn) why.push('ulush<100% va narx 0: ogohlantirish chiqmadi: ' + g.st);
      if (sp > 0 && warn) why.push('narx kiritilgan, ogohlantirish chiqmasligi kerak');
    }
    if (mode.name === 'ЎЗ' && /[A-Za-z]/.test(g.txt.replace(/Kalki|PDF/g, ''))) why.push('ЎЗ da lotin harf: ' + (g.txt.match(/[A-Za-z']+/g) || []).slice(0, 4).join(' '));
    T(!why.length, mode.name + ' · elektro · ' + (cat === 'std' ? 'oddiy' : 'elektr plitali') + ' · stansiya ' + sp + ': uyda ' + homeCost + '/oy (≈ ' + eff + '), yoqilg\'i ' + fuelYear + '/yil, jami ' + totalYear, why.join(' | '));
    table.push([mode.name, cat, 'stansiya ' + sp, homeCost, 'yil ' + fuelYear, digits(g.fuel), 'jami ' + totalYear, digits(g.total), why.length ? 'FAIL' : 'OK']);
  }
  await p.click('[data-fuel="benzin"]'); await p.waitForTimeout(250);
  const back = await p.evaluate(() => (document.getElementById('datanote') || {}).textContent || '');
  T(!/Tarif 2026-06-01|Тариф с 2026-06-01|Тариф 2026-06-01/.test(back), mode.name + ': benzinga qaytganda tarif sanasi yo\'qoladi', back);
  T(errs.length === 0, mode.name + ': JS xatolari yo\'q', errs.join(' | '));
  await ctx.close();
}
console.log('\nJadval (til · toifa · stansiya · uyda/oy · yoqilg\'i/yil kutilgan · kalkulyator · jami kutilgan · kalkulyator · holat):');
table.forEach((r) => console.log('  ' + r.join(' · ')));
await b.close();
process.exit(bad ? 1 : 0);
