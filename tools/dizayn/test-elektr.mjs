// Elektr kalkulyatori (pog'onali tarif, 2026-06-01): 150 / 350 / 800 kVt·soat × 2 toifa — QO'LDA hisoblangan natija bilan.
//   node tools/dizayn/test-elektr.mjs                       # lokal (Pages tartibini taqlid qiluvchi server)
//   node tools/dizayn/test-elektr.mjs https://<preview>     # jonli
// Tillar: UZ, RU, ЎЗ (?lang=cyr). Bitta Chromium; track() yopadi (CLAUDE.md).
//
// Kutilgan qiymatlar QO'LDA (kalkulyator kodidan olinmagan). Manba: VM 15.05.2026, 243-son:
//   oddiy:   0–200 = 650, 201–500 = 900, 501–1 000 = 1 100
//   plitali: 0–200 = 325, 201–500 = 450, 501–1 000 = 550
//   150  oddiy 150×650 = 97 500                          | plitali 150×325 = 48 750
//   350  oddiy 200×650 + 150×900 = 130 000 + 135 000 = 265 000 | plitali 200×325 + 150×450 = 65 000 + 67 500 = 132 500
//   800  oddiy 200×650 + 300×900 + 300×1100 = 130 000 + 270 000 + 330 000 = 730 000
//        plitali 200×325 + 300×450 + 300×550 = 65 000 + 135 000 + 165 000 = 365 000
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

// [kVt·soat, toifa, [[pog'ona-dan, pog'ona-gacha(null=+), kVt·soat, narx, summa], ...], jami]
const CASES = [
  [150, 'std',   [[0, 200, 150, 650, 97500]], 97500],
  [350, 'std',   [[0, 200, 200, 650, 130000], [201, 500, 150, 900, 135000]], 265000],
  [800, 'std',   [[0, 200, 200, 650, 130000], [201, 500, 300, 900, 270000], [501, 1000, 300, 1100, 330000]], 730000],
  [150, 'stove', [[0, 200, 150, 325, 48750]], 48750],
  [350, 'stove', [[0, 200, 200, 325, 65000], [201, 500, 150, 450, 67500]], 132500],
  [800, 'stove', [[0, 200, 200, 325, 65000], [201, 500, 300, 450, 135000], [501, 1000, 300, 550, 165000]], 365000]
];
const MODES = [
  { name: 'UZ', url: '/elektr-xarajat-kalkulyator', cases: CASES, latin: true },
  { name: 'RU', url: '/ru/elektr-xarajat-kalkulyator', cases: CASES, latin: false },
  { name: 'ЎЗ', url: '/elektr-xarajat-kalkulyator?lang=cyr', cases: [CASES[1], CASES[2], CASES[4], CASES[5]], latin: false }
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

  // --- matn tekshiruvlari ---
  const info = await p.evaluate(() => {
    const body = document.body.innerText.replace(/ /g, ' ');
    const faq = (document.getElementById('faq-ld') || {}).textContent || '';
    const a = document.querySelector('#srcNote a');
    return { body, faq, link: a ? a.getAttribute('href') : null, dn: (document.getElementById('datanote') || {}).textContent || '',
      cats: [...document.querySelectorAll('#catSeg button')].map((x) => x.textContent.trim() + '|' + x.getAttribute('aria-pressed')),
      tarifInput: !!document.getElementById('tarif'), ovf: document.documentElement.scrollWidth - innerWidth,
      metas: ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'].map((q) => (document.querySelector(q) || {}).content || ''),
      firstText: (() => { const w = document.createTreeWalker(document.body, 4); let n; while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (t && !/^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.parentNode.nodeName)) return t.slice(0, 60); } return ''; })() };
  });
  const OLD = /hududga qarab|450\s*[-–]\s*900|taxminan 450|примерно 450|зависит от региона|ҳудудга қараб|450\s*[-–]\s*900/i;
  T(!OLD.test(info.body) && !OLD.test(info.faq), mode.name + ': eski tarif ("450–900", "hududga qarab") sahifada ham, FAQ da ham yo\'q');
  T(info.link === 'https://lex.uz/uz/docs/-8195731', mode.name + ': manba havolasi lex.uz 243-son qarori', String(info.link));
  const dated = mode.name === 'RU' ? /Тариф с 2026-06-01, дата проверки: 2026-10-13/ : mode.name === 'UZ' ? /Tarif 2026-06-01 dan, tekshirilgan sana: 2026-10-13/ : /Тариф 2026-06-01 дан, текширилган сана: 2026-10-13/;
  const datedCount = (info.body.match(new RegExp(dated.source, 'g')) || []).length;
  T(dated.test(info.dn) && datedCount === 1, mode.name + ': "Tarif 2026-06-01 dan, tekshirilgan sana: 2026-10-13" yozuvi sahifada AYNAN BIR MARTA (karta ichida va tagida takrorlanmaydi)', 'marta: ' + datedCount + ' | ' + info.dn);
  T(info.cats.length === 2 && info.cats[0].endsWith('|true') && info.cats[1].endsWith('|false') && !info.tarifInput, mode.name + ': 2 ta toifa tugmasi (standart: birinchisi), eski narx maydoni yo\'q', info.cats.join(' / '));
  T(/650/.test(info.faq) && /2\s?200/.test(info.faq) && /243/.test(info.faq), mode.name + ': FAQ da yangi tarif (650 … 2 200, 243-son)');
  T(info.ovf <= 0, mode.name + ': 360px da gorizontal siljish yo\'q', String(info.ovf));
  const metaOk = mode.name === 'RU' ? /ступенчат/ : mode.name === 'UZ' ? /pog'onali/ : /pog'onali|пог'?онали|поғонали/;   // ЎЗ rejimida meta teglar lotincha qoladi (cyr.js faqat ko'rinadigan matn va sarlavhani o'giradi — butun saytda shunday)
  T(info.metas.every((m) => m.length > 40 && metaOk.test(m)), mode.name + ': meta description / og / twitter teglari bor va yangi tarifni aytadi', info.metas.map((m) => m.slice(0, 24)).join(' | '));
  T(!/\\g<|\\g&lt;|^>/.test(info.firstText) && /Kalki/i.test(info.firstText), mode.name + ': sahifa tepasida begona matn yo\'q (birinchi matn: logotip)', info.firstText);

  // --- hisob: 6 (yoki 4) holat ---
  for (const [kwh, cat, expRows, expTotal] of mode.cases) {
    await p.evaluate(({ kwh }) => {
      document.querySelectorAll('#devList input[type=checkbox]').forEach((c) => { c.checked = false; });
      const c = document.getElementById('d_isit'); c.checked = true;
      document.getElementById('h_isit').value = String(kwh / 60);          // 2000 Vt × (kwh/60) soat × 30 kun / 1000 = kwh
    }, { kwh });
    await p.click(cat === 'std' ? '#catStd' : '#catStove');
    await p.click('#calcBtn'); await p.waitForTimeout(500);
    const got = await p.evaluate(() => ({
      total: document.getElementById('mainNum').textContent, rTotal: document.getElementById('rTotal').textContent,
      rows: [...document.querySelectorAll('#tierRows .rrow')].map((r) => ({ k: r.querySelector('.k').childNodes[0].textContent, fx: r.querySelector('.fx').textContent, v: r.querySelector('.v').textContent })),
      pressed: [...document.querySelectorAll('#catSeg button')].map((x) => x.getAttribute('aria-pressed')).join(','),
      note: (document.querySelector('.res-extras .note') || {}).textContent || '', txt: document.getElementById('receipt').innerText }));
    let ok = digits(got.total) === expTotal && digits(got.rTotal) === expTotal && got.rows.length === expRows.length;
    const why = [];
    if (!ok) why.push('jami ' + digits(got.total) + ' / qatorlar ' + got.rows.length);
    expRows.forEach((e, i) => {
      const r = got.rows[i]; if (!r) { ok = false; return; }
      const kn = nums(r.k), fn = nums(r.fx), vn = digits(r.v);
      const rowOk = kn[0] === e[0] && (e[1] === null || kn[1] === e[1]) && fn[0] === e[2] && fn[1] === e[3] && vn === e[4];
      if (!rowOk) { ok = false; why.push('qator ' + (i + 1) + ': ' + r.k + ' | ' + r.fx + ' | ' + r.v); }
    });
    const sumRows = got.rows.reduce((s, r) => s + digits(r.v), 0);
    if (sumRows !== expTotal) { ok = false; why.push('qatorlar yig\'indisi ' + sumRows); }
    if (mode.latin === false && mode.name === 'ЎЗ' && /[A-Za-z]/.test(got.txt.replace(/Kalki|PDF/g, ''))) { ok = false; why.push('ЎЗ natijada lotin harf: ' + (got.txt.match(/[A-Za-z']+/g) || []).slice(0, 4).join(' ')); }
    T(ok, mode.name + ' · ' + kwh + ' kVt·soat · ' + (cat === 'std' ? 'oddiy' : 'elektr plitali') + ' = ' + expTotal.toLocaleString('en').replace(/,/g, ' ') + ' (' + expRows.map((e) => e[2] + '×' + e[3]).join(' + ') + ')', why.join(' | '));
    table.push([mode.name, kwh, cat, expTotal, digits(got.total), ok ? 'OK' : 'FAIL']);
  }

  // toifani hisobdan KEYIN almashtirish natijani avtomatik qayta hisoblaydi
  await p.click('#catStd'); await p.waitForTimeout(300);
  const t1 = digits(await p.evaluate(() => document.getElementById('mainNum').textContent));
  await p.click('#catStove'); await p.waitForTimeout(300);
  const t2 = digits(await p.evaluate(() => document.getElementById('mainNum').textContent));
  T(t1 > 0 && t2 > 0 && t1 === 2 * t2 || Math.abs(t1 - 2 * t2) <= 1, mode.name + ': toifa almashtirilganda natija qayta hisoblanadi (oddiy = 2 × plitali)', t1 + ' vs ' + t2);
  if (mode.name === 'UZ' && process.env.SHOT_ELEKTR) await p.screenshot({ path: process.env.SHOT_ELEKTR, fullPage: true }).catch(() => {});
  T(errs.length === 0, mode.name + ': JS xatolari yo\'q', errs.join(' | '));
  await ctx.close();
}
console.log('\nJadval (til · kVt·soat · toifa · kutilgan · kalkulyator · holat):');
table.forEach((r) => console.log('  ' + r.join(' · ')));
await b.close();
process.exit(bad ? 1 : 0);
