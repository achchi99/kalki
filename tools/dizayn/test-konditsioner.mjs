// Konditsioner kalkulyatori (pog'onali tarif, 2026-06-01): uy sarfi + konditsioner, 2 toifa — QO'LDA hisoblangan natija bilan.
//   node tools/dizayn/test-konditsioner.mjs                       # lokal (Pages tartibini taqlid qiluvchi server)
//   node tools/dizayn/test-konditsioner.mjs https://<preview>     # jonli
// Tillar: UZ, RU, ЎЗ (?lang=cyr). Bitta Chromium; track() yopadi (CLAUDE.md).
//
// Konditsioner sarfi 180 kVt·soat/oy: 9-sinf (2,6 kW) / 3 = 0,8667 kW, inverter o'chiq, soat = 6/0,8667 (kuniga 6 kVt·soat × 30).
// Qurilma narxi = to'lov(uy + konditsioner) − to'lov(faqat uy). Kutilgan qiymatlar QO'LDA (kalkulyator kodidan olinmagan):
//  oddiy toifa (650 / 900 / 1 100):
//   uy 150: 150×650 = 97 500;  uy+kond 330 = 200×650 + 130×900 = 130 000 + 117 000 = 247 000;  farq 149 500 (= 50×650 + 130×900), 1 kVt·soat ≈ 831
//   uy 400: 200×650 + 200×900 = 310 000;  580 = 130 000 + 300×900 + 80×1100 = 130 000 + 270 000 + 88 000 = 488 000;  farq 178 000 (= 100×900 + 80×1100), ≈ 989
//  elektr plitali (325 / 450 / 550):
//   uy 150: 48 750;  330 = 65 000 + 130×450 = 123 500;  farq 74 750, ≈ 415
//   uy 400: 65 000 + 200×450 = 155 000;  580 = 65 000 + 135 000 + 80×550 = 244 000;  farq 89 000, ≈ 494
//  yozgi 3 oy = farq × 3.
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

// [uy kVt·soat, konditsioner kVt·soat, toifa, uy to'lovi, jami to'lov, konditsioner to'lovi, yozgi 3 oy, o'rtacha narx, izoh raqamlari]
const NOTE_A = [0, 200, 201, 500, 1];     // "0–200 va 201–500 … 1 kVt-soat taxminan X": X oxirida qo'shiladi
const NOTE_B = [201, 500, 501, 1000, 1];
const CASES = [
  [150, 180, 'std',   97500, 247000, 149500, 448500, 831, NOTE_A],
  [400, 180, 'std',   310000, 488000, 178000, 534000, 989, NOTE_B],
  [150, 180, 'stove', 48750, 123500, 74750, 224250, 415, NOTE_A],
  [400, 180, 'stove', 155000, 244000, 89000, 267000, 494, NOTE_B]
];
const MODES = [
  { name: 'UZ', url: '/konditsioner-kalkulyator' },
  { name: 'RU', url: '/ru/konditsioner-kalkulyator' },
  { name: 'ЎЗ', url: '/konditsioner-kalkulyator?lang=cyr' }
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
    const faq = (document.getElementById('faq-ld') || {}).textContent || '';
    const a = document.querySelector('#srcNote a'); const head = document.documentElement.outerHTML.slice(0, document.documentElement.outerHTML.indexOf('</head>'));
    return { body, faq, link: a ? a.getAttribute('href') : null, dn: (document.getElementById('datanote') || {}).textContent || '',
      cats: [...document.querySelectorAll('#catSeg button')].map((x) => x.textContent.trim() + '|' + x.getAttribute('aria-pressed')),
      tariffInput: !!document.getElementById('tariff'), house: (document.getElementById('houseKwh') || {}).value,
      metas: ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'].map((q) => (document.querySelector(q) || {}).content || ''),
      headOk: head.includes('rel="manifest"') && head.includes('apple-touch-icon'),
      firstText: (() => { const w = document.createTreeWalker(document.body, 4); let n; while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (t && !/^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.parentNode.nodeName)) return t.slice(0, 60); } return ''; })(),
      ovf: document.documentElement.scrollWidth - innerWidth };
  });
  T(!/Elektr narxi \(kWt\)|Цена \(кВт\)/.test(info.body) && !info.tariffInput, mode.name + ': tekis narx maydoni ("Elektr narxi", value=650) yo\'q');
  T(info.house === '250', mode.name + ': uy sarfi maydoni bor, standart 250', String(info.house));
  T(!/450\s*[-–]\s*900|hududga qarab/.test(info.body + info.faq), mode.name + ': eski tarif ("450–900") sahifada ham, FAQ da ham yo\'q');
  T(info.link === 'https://lex.uz/uz/docs/-8195731', mode.name + ': manba havolasi lex.uz 243-son', String(info.link));
  const dated = mode.name === 'RU' ? /Тариф с 2026-06-01, дата проверки: 2026-10-13/ : mode.name === 'UZ' ? /Tarif 2026-06-01 dan, tekshirilgan sana: 2026-10-13/ : /Тариф 2026-06-01 дан, текширилган сана: 2026-10-13/;
  T(dated.test(info.dn) && dated.test(info.body), mode.name + ': "Tarif 2026-06-01 dan, tekshirilgan sana: 2026-10-13" yozuvi', info.dn);
  T(info.cats.length === 2 && info.cats[0].endsWith('|true') && info.cats[1].endsWith('|false'), mode.name + ': 2 ta toifa tugmasi (standart: birinchisi)', info.cats.join(' / '));
  T(/650/.test(info.faq) && /243/.test(info.faq) && /178\s?000/.test(info.faq), mode.name + ': FAQ da yangi tarif va misol (650, 243-son, 178 000)');
  const metaOk = mode.name === 'RU' ? /ступенчат/ : /pog'onali|пог'?онали|поғонали/;
  T(info.metas.every((m) => m.length > 40 && metaOk.test(m)), mode.name + ': meta description / og / twitter bor va yangi tarifni aytadi', info.metas.map((m) => m.slice(0, 22)).join(' | '));
  T(info.headOk && /Kalki/i.test(info.firstText) && !/\\g|^>/.test(info.firstText), mode.name + ': <head> butun (manifest/ikonka) va sahifa tepasida begona matn yo\'q', info.firstText);
  T(info.ovf <= 0, mode.name + ': 360px da gorizontal siljish yo\'q', String(info.ovf));

  for (const [house, ac, cat, expHouse, expTotal, expCost, expSummer, expEff, noteNums] of CASES) {
    await p.evaluate(({ house }) => {
      document.getElementById('inverter').checked = false;
      document.getElementById('hours').value = String(6 / (2.6 / 3));            // 9-sinf: 0,8667 kW × soat × 30 kun = 180 kVt·soat
      document.getElementById('houseKwh').value = String(house);
    }, { house });
    await p.click(cat === 'std' ? '#catStd' : '#catStove');
    await p.click('#calcBtn'); await p.waitForTimeout(500);
    const got = await p.evaluate(() => ({ cls: document.getElementById('btuClass').textContent, day: document.getElementById('rDayKwh').textContent, month: document.getElementById('rMonthKwh').textContent,
      houseCost: document.getElementById('rHouseCost').textContent, total: document.getElementById('rTotalCost').textContent, cost: document.getElementById('rMonth').textContent,
      summer: document.getElementById('rSummer').textContent, note: document.getElementById('effNote').textContent, txt: document.getElementById('elecBox').innerText }));
    const why = [];
    if (!/9/.test(got.cls)) why.push('sinf ' + got.cls);
    if (digits(got.month) !== ac) why.push('konditsioner sarfi ' + digits(got.month));
    if (digits(got.houseCost) !== expHouse) why.push('uy to\'lovi ' + digits(got.houseCost));
    if (digits(got.total) !== expTotal) why.push('jami ' + digits(got.total));
    if (digits(got.cost) !== expCost) why.push('konditsioner ' + digits(got.cost));
    if (digits(got.summer) !== expSummer) why.push('yozgi ' + digits(got.summer));
    if (digits(got.total) - digits(got.houseCost) !== digits(got.cost)) why.push('jami − uy ≠ konditsioner');
    const nn = nums(got.note);
    if (JSON.stringify(nn) !== JSON.stringify([...noteNums, expEff])) why.push('izoh raqamlari ' + JSON.stringify(nn) + ' kutilgan ' + JSON.stringify([...noteNums, expEff]));
    if (mode.name === 'ЎЗ' && /[A-Za-z]/.test(got.txt.replace(/Kalki|PDF/g, ''))) why.push('ЎЗ da lotin harf: ' + (got.txt.match(/[A-Za-z']+/g) || []).slice(0, 4).join(' '));
    T(!why.length, mode.name + ' · uy ' + house + ' + konditsioner ' + ac + ' · ' + (cat === 'std' ? 'oddiy' : 'elektr plitali') + ': ' + expHouse + ' → ' + expTotal + ', konditsioner ' + expCost + ' (≈ ' + expEff + ' so\'m/kVt·soat)', why.join(' | '));
    table.push([mode.name, house, ac, cat, expCost, digits(got.cost), expEff, nn[nn.length - 1], why.length ? 'FAIL' : 'OK']);
  }

  // toifani hisobdan KEYIN almashtirish natijani qayta hisoblaydi
  await p.click('#catStd'); await p.waitForTimeout(250); const c1 = digits(await p.evaluate(() => document.getElementById('rMonth').textContent));
  await p.click('#catStove'); await p.waitForTimeout(250); const c2 = digits(await p.evaluate(() => document.getElementById('rMonth').textContent));
  T(c1 > c2 && c2 > 0, mode.name + ': toifa almashtirilganda natija qayta hisoblanadi (oddiy > plitali)', c1 + ' vs ' + c2);
  if (mode.name === 'UZ' && process.env.SHOT_KOND) await p.locator('#elecBox').screenshot({ path: process.env.SHOT_KOND }).catch(() => {});
  T(errs.length === 0, mode.name + ': JS xatolari yo\'q', errs.join(' | '));
  await ctx.close();
}
console.log('\nJadval (til · uy · konditsioner · toifa · kutilgan · kalkulyator · narx kutilgan · izohda · holat):');
table.forEach((r) => console.log('  ' + r.join(' · ')));
await b.close();
process.exit(bad ? 1 : 0);
