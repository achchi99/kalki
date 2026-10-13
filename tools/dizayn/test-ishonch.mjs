// Ishonch matnlari: AI yordamchi ogohlantirishi, katalogda bepul/Premium belgisi, maxfiylik/shartlar koddagi haqiqatga mosligi.
//   node tools/dizayn/test-ishonch.mjs                  # lokal
//   node tools/dizayn/test-ishonch.mjs https://<preview>   # jonli
// Tillar: UZ, RU, ЎЗ (?lang=cyr). Bitta Chromium; track() yopadi (CLAUDE.md).
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


let bad = 0;
const T = (ok, name, extra) => { if (!ok) bad++; console.log((ok ? 'OK   ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); return ok; };
const b = track(await chromium.launch());
async function open(url, w = 360) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 }, serviceWorkers: 'block' });
  await ctx.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await p.goto(BASE + url, { waitUntil: 'load' }); await p.waitForTimeout(1500);
  return { ctx, p, errs };
}
const nbsp = (s) => String(s).replace(/[  ]/g, ' ');

// 1) AI blok: ogohlantirish tugma YONIDA (tugmadan oldin), ko'rinadigan, gorizontal siljish yo'q
const WARN = { uz: "AI yordamchi kiritgan matningizni qayta ishlash uchun serverga yuboradi. Pasport raqami, karta raqami kabi maxfiy ma'lumotlarni yozmang.", ru: 'AI-помощник отправляет введённый вами текст на сервер для обработки. Не указывайте конфиденциальные данные, например номер паспорта или карты.' };
for (const [name, url, key] of [['UZ', '/ariza-namunasi', 'uz'], ['RU', '/ru/ariza-namunasi', 'ru']]) {
  const { ctx, p, errs } = await open(url);
  const g = await p.evaluate(() => {
    const w = document.getElementById('aizWarn'), go = document.getElementById('aizGo');
    const r = w ? w.getBoundingClientRect() : null, rg = go ? go.getBoundingClientRect() : null;
    return { warn: w ? w.textContent : null, next: w ? w.nextElementSibling === go : false, vis: !!r && r.width > 0 && r.height > 0 && getComputedStyle(w).visibility !== 'hidden',
      above: !!r && !!rg && r.bottom <= rg.top + 1, over: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      priv: (document.querySelector('.aiz-priv > span') || {}).textContent || '', body: document.body.innerText };
  });
  T(g.warn === WARN[key], name + ': AI tugmasi yonida aniq ogohlantirish matni', JSON.stringify(g.warn));
  T(g.next && g.vis && g.above, name + ': ogohlantirish tugma bilan yonma-yon, ko\'rinadi', JSON.stringify({ next: g.next, vis: g.vis, above: g.above }));
  T(!g.over, name + ': 360px da gorizontal siljish yo\'q');
  T(!/Matningiz saqlanmaydi|Ваш текст не сохраняется\./.test(g.priv), name + ': qisqa izohda "saqlanmaydi" yolg\'iz qolmagan (serverga yuborilishi aytilgan)', g.priv);
  const nb = nbsp(g.body);
  const claims = [...nb.matchAll(/serverga yuborilmaydi|faqat shu brauzerda saqlanadi|остаются только в вашем браузере/g)];
  T(claims.every((m) => /AI/.test(nb.slice(m.index, m.index + 260))), name + ': sahifadagi "brauzerda qoladi" da\'volari AI istisnosi bilan', claims.length + ' ta');
  T(errs.length === 0, name + ': JS xatolari yo\'q', errs.join(' | '));
  await ctx.close();
}
// ЎЗ: AI bloki bor — ogohlantirish kirill yozuvda, "AI" brendi lotincha, boshqa lotin harf yo'q
{
  const { ctx, p, errs } = await open('/ariza-namunasi?lang=cyr');
  const g = await p.evaluate(() => ({ warn: (document.getElementById('aizWarn') || {}).innerText || '', note: (document.getElementById('aizNote') || {}).textContent || '', body: document.body.innerText }));
  T(/^AI ёрдамчи киритган матнингизни қайта ишлаш учун серверга юборади\. Паспорт рақами, карта рақами каби махфий маълумотларни ёзманг\.$/.test(g.warn), 'ЎЗ: AI ogohlantirishi kirill yozuvda', g.warn);
  T(!/[A-Za-z]/.test(g.warn.replace(/\bAI\b/g, '')), 'ЎЗ: ogohlantirishda AI dan boshqa lotin harf yo\'q', g.warn);
  T(/Anthropic/.test(g.note) && !/Антҳропик/.test(g.note), 'ЎЗ: AI izohida "Anthropic" brend nomi lotincha');
  T(/AI[^.]{0,60}(?:бундан мустасно)/i.test(nbsp(g.body)), 'ЎЗ: forma izohida AI istisnosi kirill yozuvda');
  T(errs.length === 0, 'ЎЗ: JS xatolari yo\'q', errs.join(' | '));
  await ctx.close();
}

// 2) Katalog: har kartochkada bepul/pullik belgisi, narx, "100% bepul" yo'q
const narx = Number((fs.readFileSync(path.join(ROOT, 'assets/hisobsiyosati.js'), 'utf8').match(/narx:\s*(\d+)/) || [])[1]);
for (const [name, url] of [['UZ', '/hujjatlar'], ['RU', '/ru/hujjatlar'], ['ЎЗ', '/hujjatlar?lang=cyr']]) {
  const { ctx, p, errs } = await open(url);
  const g = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('a.doc-card[href]')];
    const free = cards.filter((c) => c.querySelector('.free-tag')), prem = cards.filter((c) => c.hasAttribute('data-premium'));
    const pc = prem[0];
    return { n: cards.length, free: free.length, prem: prem.length, premTag: !!(pc && pc.querySelector('.premium-tag')), premTxt: pc ? pc.innerText : '', premFree: pc ? !!pc.querySelector('.free-tag') : null,
      fc: (document.getElementById('freeCount') || {}).textContent, stats: [...document.querySelectorAll('.stat')].map((x) => x.innerText.replace(/\s+/g, ' ')).join(' | '), over: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      freeTxt: free[0] ? free[0].querySelector('.free-tag').innerText : '' };
  });
  T(g.n === 21 && g.free === 20 && g.prem === 1 && g.free + g.prem === g.n, name + ': 21 kartochka = 20 "bepul" + 1 Premium (hammasida aniq belgi)', JSON.stringify(g));
  T(g.premTag && g.premFree === false, name + ': Premium kartochkada "Premium" belgisi bor, "bepul" belgisi yo\'q');
  T(nbsp(g.premTxt).replace(/ /g, '').includes(String(narx).replace(/\B(?=(\d{3})+(?!\d))/g, '')) || nbsp(g.premTxt).replace(/\s/g, '').includes(String(narx)), name + ': Premium kartochkada narx = PREMIUM.narx (' + narx + ')', g.premTxt.replace(/\s+/g, ' '));
  T(g.fc === '20' && !/100\s?%/.test(g.stats), name + ': statistikada "100% bepul" yo\'q, bepul soni 20', g.stats);
  T(/^(Бепул|Bepul|Бесплатно)$/i.test(g.freeTxt.trim()), name + ': bepul belgisi matni tilga mos', g.freeTxt);
  T(!g.over, name + ': 360px da gorizontal siljish yo\'q');
  T(errs.length === 0, name + ': JS xatolari yo\'q', errs.join(' | '));
  await ctx.close();
}

// 3) Maxfiylik va shartlar: haqiqiy ma'lumot oqimlari (UZ, RU, ЎЗ)
const NEED = { uz: ['Anthropic', 'Google Analytics', 'AdSense', 'localStorage', 'Paynet', '2 kun', '10–500'], ru: ['Anthropic', 'Google Analytics', 'AdSense', 'localStorage', 'Paynet', 'Через 2 дня', '10–500'] };
for (const [name, url, key] of [['UZ', '/maxfiylik', 'uz'], ['RU', '/ru/maxfiylik', 'ru'], ['ЎЗ', '/maxfiylik?lang=cyr', 'cyr']]) {
  const { ctx, p, errs } = await open(url);
  const g = await p.evaluate(() => ({ body: document.body.innerText, over: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 }));
  const nb = nbsp(g.body);
  if (key === 'cyr') {
    for (const w of ['Anthropic', 'Google Analytics', 'AdSense', 'Paynet']) T(nb.includes(w), name + ': "' + w + '" brend nomi lotincha qolgan');
    T(/ёзган ваъзият матни|Ёзган вазият матни|вазият матни/i.test(nb) || /AI ариза ёзиб беради/.test(nb), name + ': AI bo\'limi kirillda');
    T(!/Kelajakda|Келажакда/.test(nb), name + ': "kelajakda AdSense" eskirgan da\'vo yo\'q');
  } else {
    for (const w of NEED[key]) T(nb.includes(w), name + ': maxfiylikda "' + w + '" bor');
    T(!/Kelajakda saytda|В будущем на сайте|ismingiz, telefon raqamingiz kabi shaxsiy ma.lumotlarni so.ramaydi|не запрашивает личные данные/.test(nb), name + ': eskirgan da\'volar yo\'q');
  }
  T(!g.over, name + ': 360px da gorizontal siljish yo\'q');
  T(errs.length === 0, name + ': JS xatolari yo\'q', errs.join(' | '));
  await ctx.close();
}
for (const [name, url] of [['UZ', '/shartlar'], ['RU', '/ru/shartlar']]) {
  const { ctx, p } = await open(url);
  const body = nbsp(await p.evaluate(() => document.body.innerText));
  T(/pullik/i.test(body) || /платн/i.test(body), name + ': shartlarda pullik (Premium) funksiya aytilgan');
  T(/AI/.test(body) && /(serverga|на сервер)/.test(body), name + ': shartlarda AI yordamchi va serverga yuborilishi aytilgan');
  await ctx.close();
}
console.log('\n' + (bad ? bad + ' ta tekshiruv yiqildi' : 'hammasi o\'tdi'));
await b.close();
process.exit(bad ? 1 : 0);
