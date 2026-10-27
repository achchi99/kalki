// "Oy oxiri prognozi" (assets/prognoz.js) — elektr va gaz sahifalari, UZ / RU / ЎЗ. Bugungi sana qat'iy beriladi; kutilgan qiymatlar QO'LDA hisoblangan.
//   node tools/dizayn/test-prognoz.mjs                      # lokal
//   node tools/dizayn/test-prognoz.mjs https://<preview>    # jonli
// Sof hisob (interpolyatsiya, chegaralar, hisob kuni…) alohida: tools/test-prognoz.js. Bu yerda — brauzerda to'liq oqim.
//  1) elektr oddiy 01.10=10 000, 11.10=10 150: 368 500; "15-oktabr"; maslahat YO'Q; "2-pog'ona"     2) 01.10=20 000, 16.10=20 300: 532 000; "26-oktabr"; 132 000 tejash
//  3) shu, elektr plitali: 266 000; tejash 66 000                                                       4) gaz isitish 01.11=5 000, 11.11=5 200: 750 000; "26-noyabr"; 200 000 tejash
//  strelka o'rni = (pog'ona + ulush)/pog'onalar soni: 1) 465 → (1 + 265/300)/6 = 31,39; hozir 150 → 0,75/6 = 12,5 | 2) 620 → (2 + 120/500)/6 = 37,33; 300 → (1 + 100/300)/6 = 22,22 | 4) 600 → (1 + 100/2000)/5 = 21; 200 → 0,4/5 = 8
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
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
let bad = 0; const table = [];
const T = (ok, name, extra) => { if (!ok) bad++; console.log((ok ? 'OK   ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); return ok; };
const digits = (s) => Number(String(s).replace(/[^\d]/g, '')) || 0;
const nums = (s) => (String(s).replace(/[  ]/g, ' ').match(/\d[\d ]*(?:,\d+)?/g) || []).map((x) => Number(x.replace(/ /g, '').replace(',', '.')));
const nb = (s) => String(s).replace(/[  ]/g, ' ');
const b = track(await chromium.launch());
const PAGES = { elektr: { url: '/elektr-xarajat-kalkulyator', rows: 'devRows' }, gaz: { url: '/gaz-xarajat-kalkulyator', rows: 'useRows' } };
const LANGS = { UZ: '', RU: '/ru', 'ЎЗ': '' };
const fixDate = (m, d) => `(() => { const R = Date, T = new R(2026, ${m - 1}, ${d}, 12).getTime(); class D extends R { constructor(...a) { if (a.length === 0) super(T); else super(...a); } static now() { return T; } } window.Date = D; })();`;
async function open(page, lang, m, d, o = {}) {
  const ctx = await b.newContext(Object.assign({ viewport: { width: o.width || 390, height: 900 }, serviceWorkers: 'block' }, process.env.PROG_TZ ? { timezoneId: process.env.PROG_TZ } : {}));
  await ctx.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  await ctx.addInitScript(fixDate(m, d));
  if (o.seed) await ctx.addInitScript((s) => { try { localStorage.setItem(s[0], s[1]); } catch (e) {} }, o.seed);
  if (o.noStorage) await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } }); });
  if (o.share) await ctx.addInitScript(() => { window.__shared = null; navigator.share = (x) => { window.__shared = x; return Promise.resolve(); }; });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  await p.goto(BASE + (lang === 'RU' ? '/ru' : '') + PAGES[page].url + (lang === 'ЎЗ' ? '?lang=cyr' : ''), { waitUntil: 'load' }); await p.waitForTimeout(1300);
  return { ctx, p, errs };
}
// BIRINCHI KIRISH: 2 maydon (oy boshi sanasi avtomatik = davr boshi, hozirgi sana = bugun; kerak bo'lsa "sanani o'zgartirish" orqali)
async function firstRun(p, v1, v2, o = {}) {
  if (o.sd) { await p.click('#pgSChg'); await p.fill('#pgSD', o.sd); }
  if (o.cd) { await p.click('#pgCChg'); await p.fill('#pgCD', o.cd); }
  await p.fill('#pgS', String(v1)); await p.fill('#pgC', String(v2)); await p.click('#pgGo'); await p.waitForTimeout(300);
}
// KEYINGI KIRISH: bitta qator (sana avtomatik bugun; boshqa sana uchun "sanani o'zgartirish")
async function update(p, d, v, today) {
  if (d !== today && !(await p.locator('#pgDate').count())) await p.click('#pgUChg');
  if (d !== today) await p.fill('#pgDate', d);
  await p.fill('#pgVal', String(v)); await p.click('#pgSave'); await p.waitForTimeout(150);
}
const openDet = async (p, id) => { if (!(await p.evaluate((i) => document.getElementById(i).open, id))) await p.click('#' + id + ' summary'); };
async function read(p, page) {
  return p.evaluate((rowsId) => {
    const q = (s) => document.querySelector(s), rows = [...document.querySelectorAll('#' + rowsId + ' .rrow')].map((r) => r.querySelector('.v').textContent);
    const bar = q('#tierBar .tb'), now = q('#tierBar .tb-nowtri');
    return { main: q('#mainNum').textContent, lbl: q('#lblEl').textContent, tag: q('#rTagEl').textContent, rows, warn: (q('#pgWarn') || {}).textContent || null, tip: (q('#pgTip') || {}).textContent || null, tierLine: (q('#pgTier') || {}).textContent || null,
      barX: bar ? Number(bar.getAttribute('data-x')) : null, nowX: now ? parseFloat(now.style.left) : null, nowLab: (q('#tierBar .tb-nowlab') || {}).textContent || null,
      infoBlk: [...document.querySelectorAll('#extraRows .pg-info')].map((x) => x.textContent), past: (q('#pastBox') || {}).innerText || '', shown: q('#receipt').classList.contains('show'),
      msg: (q('#pgMsg') || {}).textContent || '', list: [...document.querySelectorAll('#pgList li')].length, plate: bar ? bar.getBoundingClientRect().width : 0 };
  }, PAGES[page].rows);
}
async function axeOk(p) { await p.evaluate(AXE); const r = await p.evaluate(async () => { const x = await axe.run('#receipt', { resultTypes: ['violations'], runOnly: ['color-contrast'] }); return x.violations.map((v) => v.nodes.map((n) => n.target.join(' ') + ' ' + (n.any[0] ? n.any[0].message : '')).join('; ')); }); return r; }

// [nom, sahifa, davr(oy, kun), toifa, yozuvlar, jami, [sarf, sur'at, prognoz], chegara sana [kun, oy] va yangi narx, maslahat [x matn son, y], tier-chizig'i [x, hozir x], pog'ona]
const CASES = [
  ['1', 'elektr', [10, 11], 'std', [['2026-10-01', 10000], ['2026-10-11', 10150]], 368500, [150, 15, 465], [15, 900], null, [31.39, 12.5], 2],
  ['2', 'elektr', [10, 16], 'std', [['2026-10-01', 20000], ['2026-10-16', 20300]], 532000, [300, 20, 620], [26, 1100], [7.5, 132000], [37.33, 22.22], 3],
  ['3', 'elektr', [10, 16], 'stove', [['2026-10-01', 20000], ['2026-10-16', 20300]], 266000, [300, 20, 620], [26, 550], [7.5, 66000], [37.33, 22.22], 3],
  ['4', 'gaz', [11, 11], 'heat', [['2026-11-01', 5000], ['2026-11-11', 5200]], 750000, [200, 20, 600], [26, 2000], [5, 200000], [21, 8], 2]
];
const TXT = {
  UZ: { warn: (d, p, mon) => d + '-' + mon + 'da ' + p + " so'mlik pog'onaga o'tasiz", tip: (x, u, y) => 'Kuniga ' + x + ' ' + u + " kamaytirsangiz, shu pog'onada qolasiz va " + y + " so'm tejaysiz.", tier: (n) => 'Bu oy ' + n + "-pog'onada yakunlaysiz.", need: "Yana bitta ko'rsatkich kiriting", less: /kichik/, fut: /Kelajak/, unit: { elektr: 'kVt-soat', gaz: 'm³' }, mon: { 10: 'oktabr', 11: 'noyabr' }, store: "Bu brauzerda saqlab bo'lmadi", priv: "Ko'rsatkichlar faqat shu qurilmada saqlanadi.", tag: 'Oy oxiri prognozi', lbl: 'Oy oxirida taxminan' },
  RU: { warn: (d, p, mon) => d + ' ' + mon + ' вы перейдёте на ступень по ' + p + ' сум', tip: (x, u, y) => 'Если сократить на ' + x + ' ' + u + ' в день, останетесь на этой ступени и сэкономите ' + y + ' сум.', tier: (n) => 'В этом месяце вы закончите на ' + n + '-й ступени.', need: 'Введите ещё одно показание', less: /меньше/, fut: /будущую/, unit: { elektr: 'кВт-ч', gaz: 'м³' }, mon: { 10: 'октября', 11: 'ноября' }, store: 'В этом браузере сохранить не удалось', priv: 'Показания хранятся только на этом устройстве.', tag: 'Прогноз на конец месяца', lbl: 'К концу месяца примерно' }
};
for (const lang of ['UZ', 'RU', 'ЎЗ']) {
  const X = TXT[lang] || TXT.UZ;
  for (const [id, page, [m, d], cat, entries, jami, [used, rate, proj], [cday, cprice], advice, [bx, nx], tier] of CASES) {
    const o = await open(page, lang, m, d);
    if (cat !== 'std' && cat !== 'heat') await o.p.click('#catStove');
    await o.p.click('#modeProg'); await o.p.waitForTimeout(200);
    await firstRun(o.p, entries[0][1], entries[1][1]);
    await o.p.waitForTimeout(250);
    const g = await read(o.p, page); const why = [];
    if (digits(g.main) !== jami) why.push('jami ' + digits(g.main) + ' kutilgan ' + jami);
    const rv = g.rows.map((x) => nums(x)[0]);
    if (rv[0] !== used || rv[1] !== rate || rv[2] !== proj) why.push('sarf/sur\'at/prognoz ' + JSON.stringify(rv.slice(0, 3)) + ' kutilgan ' + JSON.stringify([used, rate, proj]));
    if (!g.warn || JSON.stringify(nums(g.warn)) !== JSON.stringify([cday, cprice])) why.push('chegara ogohlantirishi ' + g.warn + ' kutilgan [' + cday + ',' + cprice + ']');
    if (lang !== 'ЎЗ' && X.warn && g.warn && nb(g.warn) !== X.warn(cday, String(cprice).replace(/\B(?=(\d{3})+(?!\d))/g, ' '), X.mon[m])) why.push('ogohlantirish matni: ' + nb(g.warn));
    if (advice) {
      const [ax, ay] = advice;
      if (!g.tip || JSON.stringify(nums(g.tip)) !== JSON.stringify([ax, ay])) why.push('maslahat ' + g.tip + ' kutilgan [' + ax + ',' + ay + ']');
      if (lang !== 'ЎЗ' && g.tip && nb(g.tip) !== X.tip(String(ax).replace('.', ','), X.unit[page], String(ay).replace(/\B(?=(\d{3})+(?!\d))/g, ' '))) why.push('maslahat matni: ' + nb(g.tip));
    } else {
      if (g.tip) why.push('maslahat bo\'lmasligi kerak: ' + g.tip);
      if (!g.tierLine || nums(g.tierLine)[0] !== tier || (lang !== 'ЎЗ' && nb(g.tierLine).trim() !== X.tier(tier))) why.push('"N-pog\'onada yakunlaysiz" ' + g.tierLine);
    }
    if (g.barX === null || Math.abs(g.barX - bx) > 0.01 || Math.abs(g.nowX - nx) > 0.01) why.push('tier-bar strelka/hozir ' + g.barX + '/' + g.nowX + ' kutilgan ' + bx + '/' + nx);
    if (lang !== 'ЎЗ' && (g.tag !== X.tag || g.lbl !== X.lbl)) why.push('sarlavha/izoh ' + g.tag + ' | ' + g.lbl);
    if (lang === 'ЎЗ' && /[A-Za-z]/.test(g.rows.join(' ') + (g.warn || '') + (g.tip || '') + (g.tierLine || '') + g.past)) why.push('ЎЗ da lotin harf');
    if (lang === 'UZ') { const ax = await axeOk(o.p); if (ax.length) why.push('kontrast: ' + ax.join(' | ').slice(0, 200)); }
    T(!why.length, lang + ' · ' + id + ' · ' + page + ' ' + cat + ': ' + jami + ' (sarf ' + used + ', sur\'at ' + rate + ', prognoz ' + proj + '; chegara ' + cday + '-' + (lang === 'RU' ? X.mon[m] : (TXT.UZ.mon[m])) + ')', why.join(' | '));
    table.push([lang, id, page, cat, jami, digits(g.main), why.length ? 'FAIL' : 'OK']);
    T(o.errs.length === 0, lang + ' · ' + id + ': JS xatolari yo\'q', o.errs.join(' | '));
    await o.ctx.close();
  }
}

// ---- 5) ma'lumot yetmaydi: bo'sh qora karta YO'Q; 6) kamaygan/kelajak; yangi kundalik (tasdiq bilan); o'chirish; hammasini o'chirish ----
const SEED_E = (entries) => ['kalki_prognoz_elektr_v1', JSON.stringify({ entries, billDay: 1 })];
{
  const o = await open('elektr', 'UZ', 10, 11, { seed: SEED_E([{ d: '2026-10-05', v: 10100 }]) });
  const g = await o.p.evaluate(() => ({ prog: document.getElementById('modeProg').classList.contains('on'), need: (document.getElementById('pgNeed') || {}).innerText || '', shown: document.getElementById('receipt').classList.contains('show'),
    resCol: getComputedStyle(document.querySelector('.res-col')).display, skel: [...document.querySelectorAll('.res-skel')].some((e) => e.getBoundingClientRect().height > 0), main: document.getElementById('mainNum').textContent }));
  T(g.prog && g.need.includes(TXT.UZ.need) && !g.shown && g.resCol === 'none' && !g.skel, '5) bitta yozuv: "Yana bitta ko\'rsatkich kiriting", bo\'sh qora natija kartasi ("—") KO\'RSATILMAYDI', JSON.stringify(g));
  await o.ctx.close();
}
{
  const o = await open('elektr', 'UZ', 10, 11, { seed: SEED_E([{ d: '2026-10-01', v: 10000 }, { d: '2026-10-05', v: 10100 }, { d: '2026-10-11', v: 10150 }]) }); let dialog = false; o.p.on('dialog', (d) => { dialog = true; d.dismiss(); });
  const TD = '2026-10-11';
  const store = () => o.p.evaluate(() => JSON.parse(localStorage.getItem('kalki_prognoz_elektr_v1') || '{"entries":[]}').entries.map((e) => e.d + '=' + e.v).join(','));
  T(await store() === '2026-10-01=10000,2026-10-05=10100,2026-10-11=10150', 'yozuvlar localStorage da tartib bilan', await store());
  await update(o.p, TD, 10050, TD);
  let g = await read(o.p, 'elektr'); const st1 = await store();
  T(TXT.UZ.less.test(g.msg) && st1.endsWith('2026-10-11=10150') && (await o.p.locator('#pgNew').count()) === 1, '6) kamaygan ko\'rsatkich → xato (tugma bosilgach), SAQLANMAYDI, "Yangi kundalik boshlang" tugmasi', g.msg + ' | ' + st1);
  await update(o.p, '2026-10-12', 10200, TD);
  g = await read(o.p, 'elektr'); T(TXT.UZ.fut.test(g.msg) && !(await store()).includes('10-12'), '6) kelajak sana → xato, saqlanmaydi', g.msg);
  await update(o.p, '2026-10-05', 10120, TD);
  T((await store()).includes('2026-10-05=10120') && !(await store()).includes('=10100'), 'shu sanaga ikkinchi yozuv eskisini almashtiradi', await store());
  await update(o.p, TD, 10050, TD);
  await o.p.click('#pgNew'); await o.p.waitForTimeout(100);
  const conf1 = await o.p.locator('#pgNewConf').count(), still = await store();
  T(conf1 === 1 && still.includes('2026-10-01=10000'), '5-band: "Yangi kundalik boshlang" avval sahifa ichidagi TASDIQ so\'raydi (yozuvlar hali joyida)');
  await o.p.click('#pgNewNo'); await o.p.waitForTimeout(80);
  T((await o.p.locator('#pgNewConf').count()) === 0 && (await store()) === still, 'tasdiqda "Bekor qilish" — hech narsa o\'chmaydi');
  await o.p.click('#pgNew'); await o.p.click('#pgNewYes'); await o.p.waitForTimeout(150);
  T(await store() === '2026-10-11=10050', '"Ha, boshlash": eski yozuvlar o\'chdi, yangi ko\'rsatkich boshlang\'ich', await store());
  await update(o.p, '2026-10-05', 10000, TD); await update(o.p, '2026-10-08', 10020, TD);
  await openDet(o.p, 'pgListDet'); await o.p.click('[data-del="2026-10-08"]'); await o.p.waitForTimeout(100);
  T(!(await store()).includes('10-08'), 'bitta yozuvni o\'chirish (✕) ishlaydi (ro\'yxat yig\'iq, ochilgach)', await store());
  await openDet(o.p, 'pgListDet'); await o.p.click('#pgClear'); await o.p.waitForTimeout(100);
  T((await o.p.locator('#pgConf').count()) === 1 && (await store()).length > 0, 'hammasini o\'chirish: avval sahifa ichidagi tasdiq (hali o\'chmagan)');
  await o.p.click('#pgNo'); T((await store()).length > 0, 'tasdiqda "Bekor qilish" — yozuvlar joyida');
  await openDet(o.p, 'pgListDet'); await o.p.click('#pgClear'); await o.p.click('#pgYes'); await o.p.waitForTimeout(150);
  const back = await o.p.evaluate(() => !!document.getElementById('pgGo'));
  T(await store() === '' && !dialog && back, 'tasdiqdan keyin hammasi o\'chdi, birinchi kirish ekraniga qaytdi; alert/confirm ishlatilmadi', await store());
  const priv = await o.p.evaluate(() => [...document.querySelectorAll('#pgPriv')].map((x) => x.textContent).join('|'));
  T(priv.includes(TXT.UZ.priv) && (await o.p.locator('#pgPriv').count()) === 1, 'matn: "Ko\'rsatkichlar faqat shu qurilmada saqlanadi." — bir marta', priv);
  T(o.errs.length === 0, '5/6) JS xatolari yo\'q', o.errs.join(' | ')); await o.ctx.close();
}
// ---- 7) davr boshida yozuv yo'q: interpolyatsiya ----
{
  const o = await open('elektr', 'UZ', 10, 15); await o.p.click('#modeProg'); const TD = '2026-10-15';
  await firstRun(o.p, 9900, 10200, { sd: '2026-09-25' });
  await update(o.p, '2026-10-05', 10000, TD);
  await o.p.waitForTimeout(250); const g = await read(o.p, 'elektr'); const rv = g.rows.map((x) => nums(x)[0]);
  T(rv[0] === 240 && rv[1] === 17.1 && rv[2] === 531.4 && digits(g.main) === 434571 && g.infoBlk.some((x) => /qo'shni yozuvlar/.test(x)), '7) interpolyatsiya 9 960: shu paytgacha 240, 14 kun → 17,1/kun, prognoz 531,4, summa 434 571', JSON.stringify([rv.slice(0, 3), g.main, g.infoBlk]));
  await o.ctx.close();
}
// ---- o'tgan davrlar, rejim avtomatik ochilishi, localStorage o'chirilgan brauzer, ulashish, PWA ----
{
  const seed = SEED_E([{ d: '2026-08-01', v: 1000 }, { d: '2026-09-01', v: 1200 }, { d: '2026-10-01', v: 1500 }, { d: '2026-10-15', v: 1600 }]);
  const o = await open('elektr', 'UZ', 10, 15, { seed, share: true });
  const on = await o.p.evaluate(() => document.getElementById('modeProg').classList.contains('on') && !document.getElementById('modeDev').classList.contains('on'));
  const g = await read(o.p, 'elektr');
  T(on && g.shown, 'yozuvlar bor → sahifa "Prognoz" rejimida ochiladi');
  T(/220[\s ]000/.test(g.past) && /\+50%/.test(g.past) && /130[\s ]000/.test(g.past), 'o\'tgan davrlar: sentabr 300 kVt-soat = 220 000 (+50%), avgust 200 = 130 000', g.past.replace(/\s+/g, ' '));
  await o.p.click('#shareBtn'); await o.p.waitForTimeout(150);
  const sh = await o.p.evaluate(() => window.__shared);
  T(sh && /taxminan/.test(sh.text) && /\d{3}/.test(sh.text) && !/1600|1500|1000|\?p=/.test(sh.text + ' ' + sh.url) && !/\?/.test(sh.url), 'ulashish: faqat summa va pog\'ona matni (ko\'rsatkichlar va ?p= yo\'q)', JSON.stringify(sh));
  await o.ctx.close();
  const d = await open('elektr', 'UZ', 10, 15);
  const defMode = await d.p.evaluate(() => document.getElementById('modeDev').classList.contains('on') && !!document.getElementById('devList').children.length);
  T(defMode, 'yozuv yo\'q → standart rejim "Qurilmalar bo\'yicha" (SEO/golden buzilmaydi)'); await d.ctx.close();
}
for (const page of ['elektr', 'gaz']) {
  const o = await open(page, 'UZ', 10, 11, { noStorage: true });
  await o.p.click('#modeProg'); await firstRun(o.p, 10000, 10150);
  const g = await read(o.p, page); const note = await o.p.evaluate(() => document.getElementById('pgPriv').textContent);
  T(o.errs.length === 0 && digits(g.main) > 0 && note.includes(TXT.UZ.store), '8) ' + page + ': localStorage taqiqlangan brauzerda xatosiz ishlaydi (sessiya ichida), "Bu brauzerda saqlab bo\'lmadi" deydi', o.errs.join(' | ') + ' ' + g.main);
  await o.ctx.close();
}
{
  const o = await open('elektr', 'UZ', 10, 11); await o.p.click('#modeProg');
  await o.p.evaluate(() => { window.KalkiPwa = { installed: false, ios: false, canPrompt: () => true, prompt: () => { window.__pwaPrompt = 1; return true; }, iosHint: () => 'x' }; });
  const c1 = await o.p.locator('#pgPwaBox').count(); await firstRun(o.p, 10000, 10150);
  const c2 = await o.p.locator('#pgPwaBox').count();
  T(c1 === 0 && c2 === 1, 'PWA taklifi 2 ta yozuv saqlangandan keyin chiqadi (oldin yo\'q)');
  await o.p.click('#pgPwaX'); await update(o.p, '2026-10-11', 10160, '2026-10-11');
  const c3 = await o.p.locator('#pgPwaBox').count(); const ts = await o.p.evaluate(() => localStorage.getItem('kalki_prog_pwa'));
  T(c3 === 0 && !!ts, 'yopilgach qayta chiqmaydi, vaqt saqlandi (30 kun)'); await o.ctx.close();
  const day = 86400000, T0 = new Date(2026, 9, 11, 12).getTime();
  for (const [ago, want] of [[29, 0], [31, 1]]) {
    const q = await open('elektr', 'UZ', 10, 11, { seed: ['kalki_prog_pwa', String(T0 - ago * day)] }); await q.p.click('#modeProg');
    await q.p.evaluate(() => { window.KalkiPwa = { installed: false, ios: false, canPrompt: () => true, prompt: () => true, iosHint: () => 'x' }; });
    await firstRun(q.p, 10000, 10150);
    T((await q.p.locator('#pgPwaBox').count()) === want, 'PWA taklifi: oxirgi yopilishdan ' + ago + ' kun o\'tgan → ' + (want ? 'ko\'rsatiladi' : 'ko\'rsatilmaydi')); await q.ctx.close();
  }
}
// ---- A) elektr: rejimlar va tier-bar ----
{
  const o = await open('elektr', 'UZ', 10, 15);
  const bar = async () => o.p.evaluate(() => { const pl = document.querySelector('#tierBar .tb'); if (!pl) return null; const segs = [...pl.querySelectorAll('.tb-seg')]; const v = pl.querySelector('.tb-val'), r = pl.getBoundingClientRect(), vr = v ? v.getBoundingClientRect() : null;
    return { n: segs.length, bg: segs.map((x) => getComputedStyle(x).backgroundColor), x: Number(pl.getAttribute('data-x')), tier: Number(pl.getAttribute('data-tier')), in: !vr || (vr.left >= r.left - 1 && vr.right <= r.right + 1), w: r.width, ticks: [...pl.querySelectorAll('.tb-tick')].map((e) => e.textContent.replace(/\s/g, '')).join(','), prices: segs.map((x) => x.textContent.replace(/\s/g, '')).join(',') }; });
  const main = () => o.p.evaluate(() => document.getElementById('mainNum').textContent);
  await o.p.click('#modeUse'); await o.p.fill('#kwhIn', '350'); await o.p.click('#calcBtn'); await o.p.waitForTimeout(200);
  let b1 = await bar();
  T(digits(await main()) === 265000, '9) "Sarf bo\'yicha" 350 kVt-soat oddiy = 265 000', await main());
  T(b1 && b1.n === 6 && new Set(b1.bg).size === 6 && b1.prices === '650,900,1100,1600,1900,2200' && b1.ticks === '0,200,500,1000,5000,10000' && b1.tier === 2 && Math.abs(b1.x - 25) < 0.01 && b1.in, 'elektr tier-bar: 6 pog\'ona (650…2 200), 6 xil rang, strelka 350 → (1 + 150/300)/6 = 25%', JSON.stringify(b1));
  await o.p.click('#catStove'); await o.p.waitForTimeout(150); b1 = await bar();
  T(digits(await main()) === 132500 && b1.prices === '325,450,550,800,950,1100', 'elektr plitali toifa: 132 500, narxlar 325…1 100 (chiziq toifaga qarab)', await main() + ' ' + (b1 && b1.prices));
  await o.p.click('#catStd');
  await o.p.click('#modeMeter'); await o.p.fill('#prevIn', '12 000'); await o.p.fill('#curIn', '12 350'); await o.p.click('#calcBtn'); await o.p.waitForTimeout(200);
  T(digits(await main()) === 265000, '9) "Hisoblagich" 12 000 → 12 350 = 350 kVt-soat = 265 000', await main());
  await o.p.fill('#prevIn', '12 350'); await o.p.fill('#curIn', '12 000'); await o.p.click('#calcBtn'); await o.p.waitForTimeout(200);
  const er = await o.p.evaluate(() => ({ t: document.getElementById('meterMsg').textContent, v: !document.getElementById('meterMsg').hidden, shown: document.getElementById('receipt').classList.contains('show') }));
  T(er.v && /kichik/.test(er.t) && !er.shown, 'hozirgi < oldingi → xato xabari, natija yashirin', er.t);
  await o.p.click('#modeDev'); await o.p.waitForTimeout(150);
  const dev = await o.p.evaluate(() => ({ list: document.getElementById('devList').children.length, box: !document.getElementById('devBox').hidden }));
  T(dev.list === 9 && dev.box, '"Qurilmalar bo\'yicha" rejimi qaytadi: 9 qurilma ro\'yxati joyida');
  T(o.errs.length === 0, 'elektr rejimlari: JS xatolari yo\'q', o.errs.join(' | ')); await o.ctx.close();
}
// ---- 320 px: prognoz kartasi sig'adi (elektr 2-holat, gaz 4-holat), kontrast ----
for (const [page, m, d, entries] of [['elektr', 10, 16, [['2026-10-01', 20000], ['2026-10-16', 20300]]], ['gaz', 11, 11, [['2026-11-01', 5000], ['2026-11-11', 5200]]]]) for (const w of [320, 390]) {
  const o = await open(page, 'UZ', m, d, { width: w }); await o.p.click('#modeProg'); await firstRun(o.p, entries[0][1], entries[1][1]); await o.p.waitForTimeout(250);
  const g = await o.p.evaluate(() => {
    const vw = document.documentElement.clientWidth, over = document.documentElement.scrollWidth > vw + 1, pl = document.querySelector('#tierBar .tb'), r = pl.getBoundingClientRect();
    const lab = document.querySelector('#tierBar .tb-nowlab').getBoundingClientRect(), val = document.querySelector('#tierBar .tb-val').getBoundingClientRect();
    const blocks = [...document.querySelectorAll('#extraRows .pg-blk, #progAfter input, #progAfter button')].map((e) => e.getBoundingClientRect()).filter((x) => x.width > 0);
    return { over, plate: Math.round(r.width), labIn: lab.left >= r.left - 1 && lab.right <= r.right + 1, valIn: val.left >= r.left - 1 && val.right <= r.right + 1, inVp: blocks.every((x) => x.left >= -1 && x.right <= vw + 1), segClip: [...pl.querySelectorAll('.tb-seg')].some((e) => e.scrollWidth > e.clientWidth + 1) };
  });
  const ax = await axeOk(o.p);
  T(!g.over && g.plate > 200 && g.labIn && g.valIn && g.inVp && !g.segClip && !ax.length, page + ' · ' + w + ' px: prognoz kartasi sig\'adi (chiziq ' + g.plate + ' px, "hozir" va strelka yozuvi ichkarida), kontrast (axe) toza', JSON.stringify(g) + ' ' + ax.join('|').slice(0, 160));
  await o.ctx.close();
}
// ---- YANGI UX: birinchi kirish (2 maydon), keyingi kirish (1 qator), bo'sh holat, xato faqat tugmadan keyin, ixcham joylashuv ----
const UXT = {
  UZ: { go: 'Oy oxirini hisoblash', err: /Ikkala raqamni ham kiriting/, startLbl: "Oy boshidagi ko'rsatkich", curLbl: 'Hisoblagichdagi hozirgi raqam', steps: ["Kvitansiyadagi oxirgi ko'rsatkichni yozing.", 'Hisoblagichdagi hozirgi raqamni yozing.', "Har 5–7 kunda yangi raqam kiriting — prognoz aniqlashib boradi."], upd: 'Yangilash', sum: /^Yozuvlar \(2\)/, ph: /masalan/ },
  RU: { go: 'Рассчитать конец месяца', err: /Введите оба числа/, startLbl: 'Показание на начало месяца', curLbl: 'Текущее показание счётчика', steps: ['Впишите последнее показание из квитанции.', 'Впишите текущее показание счётчика.', 'Раз в 5–7 дней вводите новое число — прогноз будет уточняться.'], upd: 'Обновить', sum: /^Записи \(2\)/, ph: /например/ },
  'ЎЗ': { go: 'Ой охирини ҳисоблаш', err: /Иккала рақамни ҳам киритинг/, startLbl: 'Ой бошидаги кўрсаткич', curLbl: 'Ҳисоблагичдаги ҳозирги рақам', steps: ['Квитанциядаги охирги кўрсаткични ёзинг.', 'Ҳисоблагичдаги ҳозирги рақамни ёзинг.', 'Ҳар 5–7 кунда янги рақам киритинг — прогноз аниқлашиб боради.'], upd: 'Янгилаш', sum: /^Ёзувлар \(2\)/, ph: /масалан/ }
};
for (const page of ['elektr', 'gaz']) for (const lang of ['UZ', 'RU', 'ЎЗ']) for (const w of [320, 390]) {
  const X = UXT[lang];
  const o = await open(page, lang, 10, 11, { width: w }); await o.p.click('#modeProg'); await o.p.waitForTimeout(250);
  const f = await o.p.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
    const box = document.getElementById('progBox'), ins = [...box.querySelectorAll('input')].filter(vis);
    return { texts: ins.filter((e) => e.type === 'text').length, dates: ins.filter((e) => e.type === 'date').length, ids: ins.map((e) => e.id).join(','), ph: ins.map((e) => e.placeholder), vals: ins.map((e) => e.value),
      go: (document.getElementById('pgGo') || {}).textContent, lbls: [...box.querySelectorAll('label')].map((l) => l.textContent), steps: [...box.querySelectorAll('#pgSteps li')].map((x) => x.textContent), stepsNum: getComputedStyle(box.querySelector('#pgSteps li'), '::before').content, olTag: !!box.querySelector('ol#pgSteps'), stepsVisible: box.querySelector('#pgSteps').getBoundingClientRect().height > 0, hint: (box.querySelector('.pg-hint') || {}).textContent || '', err: (document.getElementById('pgMsg') || {}).textContent || '',
      list: !!box.querySelector('.pg-list'), resCol: getComputedStyle(document.querySelector('.res-col')).display, shown: document.getElementById('receipt').classList.contains('show'), skel: [...document.querySelectorAll('.res-skel')].some(vis),
      catHint: document.getElementById('catHint') ? getComputedStyle(document.getElementById('catHint')).display : null, srcNote: getComputedStyle(document.getElementById('srcNote')).display, ib: [...document.querySelectorAll('.ibrow')].some(vis), over: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      seasonHint: document.getElementById('seasonHint') ? getComputedStyle(document.getElementById('seasonHint')).display : null,
      segOk: (() => { const sg = document.getElementById('modeSeg').getBoundingClientRect(); return [...document.querySelectorAll('#modeSeg button')].every((x) => { const r = x.getBoundingClientRect(); return r.left >= sg.left - 1 && r.right <= sg.right + 1 && x.scrollWidth <= x.clientWidth + 1; }); })() };
  });
  const why = [];
  if (f.texts !== 2 || f.dates !== 0 || f.ids !== 'pgS,pgC') why.push('birinchi kirishda 2 ta matn maydoni bo\'lishi kerak: ' + f.ids + ' date=' + f.dates);
  if (f.go !== X.go) why.push('tugma "' + f.go + '"');
  if (!f.lbls.includes(X.startLbl) || !f.lbls.includes(X.curLbl)) why.push('maydon nomlari: ' + JSON.stringify(f.lbls));
  if (JSON.stringify(f.steps) !== JSON.stringify(X.steps) || !f.olTag || !f.stepsVisible || !/counter|\d/.test(f.stepsNum) || f.hint !== '') why.push('qo\'llanma (3 qadam, raqamli, yig\'ilmaydi): ' + JSON.stringify([f.steps, f.olTag, f.stepsVisible, f.stepsNum]));
  if (f.ph.some((x) => !X.ph.test(x) || /^\d+$/.test(x)) || f.vals.some((x) => x !== '')) why.push('placeholder/qiymat: ' + JSON.stringify([f.ph, f.vals]));
  if (f.err !== '') why.push('xato oldindan chiqdi: ' + f.err);
  if (f.list || f.resCol !== 'none' || f.shown || f.skel) why.push('bo\'sh holatda natija kartasi ko\'rinyapti: ' + JSON.stringify([f.resCol, f.shown, f.skel]));
  if (f.srcNote !== 'none' || (f.catHint !== null && f.catHint !== 'none') || (f.seasonHint !== null && f.seasonHint !== 'none') || !f.ib) why.push('izohlar yig\'iq bo\'lishi kerak: ' + JSON.stringify([f.catHint, f.seasonHint, f.srcNote, f.ib]));
  if (f.over) why.push('gorizontal siljish');
  if (!f.segOk) why.push('rejim tugmalari seg ichiga sig\'madi yoki yozuvi kesildi');
  await o.p.fill('#pgS', '1'); await o.p.waitForTimeout(80);
  const typed = await o.p.evaluate(() => (document.getElementById('pgMsg') || {}).textContent || '');
  if (typed !== '') why.push('maydon to\'ldirilganda xato chiqdi (tugma bosilmagan)');
  await o.p.fill('#pgS', ''); await o.p.click('#pgGo'); await o.p.waitForTimeout(120);
  const afterClick = await o.p.evaluate(() => { const m = document.getElementById('pgMsg'); return { t: m.textContent, role: m.getAttribute('role'), vis: m.getBoundingClientRect().height > 0 }; });
  if (!X.err.test(afterClick.t) || afterClick.role !== 'alert' || !afterClick.vis) why.push('tugma bosilgach xato chiqishi kerak: ' + JSON.stringify(afterClick));
  await o.p.fill('#pgS', '10000'); await o.p.waitForTimeout(80);
  const cleared = await o.p.evaluate(() => (document.getElementById('pgMsg') || {}).textContent || '');
  if (cleared !== '') why.push('yozishni boshlagach xato yo\'qolishi kerak');
  T(!why.length, 'UX · ' + page + ' · ' + lang + ' · ' + w + ' px: birinchi kirish — faqat 2 maydon + katta tugma, xato faqat tugmadan keyin, bo\'sh qora karta yo\'q, izohlar yig\'iq', why.join(' | '));
  // ikkala maydonni to'ldirib hisoblash → natija darhol, forma bitta qatorga aylanadi
  await o.p.fill('#pgS', '10000'); await o.p.fill('#pgC', '10150'); await o.p.click('#pgGo'); await o.p.waitForTimeout(300);
  const n = await o.p.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (!e.checkVisibility || e.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true })); };
    const after = document.getElementById('progAfter'), ins = [...after.querySelectorAll('input')].filter(vis), dets = [...after.querySelectorAll('details')];
    const r = document.getElementById('receipt').getBoundingClientRect(), upd = document.getElementById('pgSave');
    return { shown: document.getElementById('receipt').classList.contains('show') && r.height > 0, main: document.getElementById('mainNum').textContent, texts: ins.filter((e) => e.type === 'text').length, dates: ins.filter((e) => e.type === 'date').length, firstGone: !document.getElementById('pgS'),
      updTxt: upd ? upd.textContent : null, sum0: dets[0] ? dets[0].querySelector('summary').textContent : '', open: dets.map((x) => x.open), nDet: dets.length, recAbove: upd ? r.top < upd.getBoundingClientRect().top : false, dateLink: !!document.getElementById('pgUChg'), over: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 };
  });
  T(n.shown && /\d/.test(n.main) && n.texts === 1 && n.dates === 0 && n.firstGone && n.updTxt === X.upd && X.sum.test(n.sum0) && n.nDet === 2 && n.open.every((x) => !x) && n.recAbove && n.dateLink && !n.over, 'UX · ' + page + ' · ' + lang + ' · ' + w + ' px: keyingi kirish — natija tepada, ostida BITTA qator [raqam][Yangilash], sana yashirin, "Yozuvlar (2)" va "Sozlamalar" yig\'iq', JSON.stringify(n));
  T(o.errs.length === 0, 'UX · ' + page + ' · ' + lang + ' · ' + w + ': JS xatolari yo\'q', o.errs.join(' | '));
  await o.ctx.close();
}
// ---- IXCHAM JOYLASHUV: 390 px da birinchi kirishda rejim tugmalari + toifa + 2 maydon + tugma bir ekranga sig'adi ----
for (const page of ['elektr', 'gaz']) {
  const ctx = await b.newContext(Object.assign({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', isMobile: true, hasTouch: true }, process.env.PROG_TZ ? { timezoneId: process.env.PROG_TZ } : {}));
  await ctx.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort()); await ctx.addInitScript(fixDate(10, 11));
  const p = await ctx.newPage(); await p.goto(BASE + PAGES[page].url, { waitUntil: 'load' }); await p.waitForTimeout(1200); await p.click('#modeProg'); await p.waitForTimeout(300);
  const g = await p.evaluate(() => { const a = document.getElementById('modeSeg').getBoundingClientRect(), z = document.getElementById('pgGo').getBoundingClientRect(), y = window.scrollY; return { h: Math.round(z.bottom - a.top), top: Math.round(a.top + y), btn: Math.round(z.height), formBottom: Math.round(document.querySelector('.form-card').getBoundingClientRect().bottom + y) }; });
  // Tipografiya (>=17 px matn, 3 qadamli qo'llanma) bilan birinchi kirish bloki endi ~1 ekran: elektr <= 900 px, gaz <= 820 px (toifa tanlovi yo'q)
  T(g.h <= (page === 'elektr' ? 900 : 820) && g.btn >= 44, page + ' · 390x844: rejim tugmalaridan "Oy oxirini hisoblash" tugmasigacha ' + g.h + ' px (≤ ' + (page === 'elektr' ? 900 : 820) + '), tugma balandligi ' + g.btn, JSON.stringify(g));
  await p.evaluate((y) => window.scrollTo(0, y - 70), g.top);
  await p.screenshot({ path: process.env.PROG_SHOT ? process.env.PROG_SHOT + '-' + page + '-first.png' : '/tmp/pg-' + page + '-first.png' });
  await p.fill('#pgS', '10000'); await p.fill('#pgC', '10150'); await p.click('#pgGo'); await p.waitForTimeout(800);
  await p.screenshot({ path: process.env.PROG_SHOT ? process.env.PROG_SHOT + '-' + page + '-result.png' : '/tmp/pg-' + page + '-result.png' });
  await ctx.close();
}
// ---- boshqa rejimlarda izohlar OCHIQ qoladi (elektr): qurilmalar rejimi o'zgarmagan ----
{
  const o = await open('elektr', 'UZ', 10, 15);
  const g = await o.p.evaluate(() => ({ cat: getComputedStyle(document.getElementById('catHint')).display, src: getComputedStyle(document.getElementById('srcNote')).display, ib: [...document.querySelectorAll('.ibrow')].some((e) => e.getBoundingClientRect().height > 0) }));
  T(g.cat !== 'none' && g.src !== 'none' && !g.ib, 'Qurilmalar rejimida toifa izohi va manba matni ko\'rinadi, ⓘ havolalari yo\'q (faqat Prognoz rejimida yig\'iladi)', JSON.stringify(g));
  await o.p.click('#modeProg'); await o.p.click('[data-ib="catHint"]'); await o.p.waitForTimeout(80);
  const g2 = await o.p.evaluate(() => getComputedStyle(document.getElementById('catHint')).display);
  T(g2 !== 'none', '"ⓘ Toifa haqida" bosilganda izoh ochiladi', g2); await o.ctx.close();
}
// ---- VAQT ZONASI: haqiqiy soat (clock) + timezoneId; telefondagi holat barcha zonalarda bir xil; yarim tun yaqinida ham ----
const TZS = [['Asia/Tashkent', '2026-10-14T09:00:00+05:00'], ['Asia/Tashkent', '2026-10-14T00:20:00+05:00'], ['Asia/Tashkent', '2026-10-14T23:50:00+05:00'], ['UTC', '2026-10-14T12:00:00Z'], ['America/New_York', '2026-10-14T09:00:00-04:00'], ['Pacific/Kiritimati', '2026-10-14T01:00:00+14:00']];
for (const [tz, iso] of TZS) for (const lang of ['UZ', 'RU', 'ЎЗ']) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 }, timezoneId: tz, serviceWorkers: 'block' }); await ctx.clock.install({ time: new Date(iso) });
  await ctx.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  await p.goto(BASE + (lang === 'RU' ? '/ru' : '') + PAGES.elektr.url + (lang === 'ЎЗ' ? '?lang=cyr' : ''), { waitUntil: 'load' }); await p.waitForTimeout(900);
  await p.click('#modeProg'); const sline = await p.evaluate(() => document.getElementById('pgSChg').parentNode.textContent.replace(/\s+/g, ' ')); await firstRun(p, 10000, 10260);
  const g = await read(p, 'elektr'); const per = await p.evaluate(() => [...document.querySelectorAll('#devRows .rrow')].map((r) => r.innerText.replace(/\s+/g, ' ')).find((x) => /1.*31/.test(x) && /–/.test(x)) || '');
  const rv = g.rows.map((x) => nums(x)[0]); const why = [];
  if (digits(g.main) !== 532000) why.push('summa ' + digits(g.main));
  if (JSON.stringify(rv.slice(0, 3)) !== JSON.stringify([260, 20, 620])) why.push('sarf/sur\'at/prognoz ' + JSON.stringify(rv.slice(0, 3)));
  if (JSON.stringify(nums(g.warn || '')) !== JSON.stringify([26, 1100])) why.push('26-oktabr/1 100: ' + g.warn);
  if (JSON.stringify(nums(g.tip || '')) !== JSON.stringify([6.7, 132000])) why.push('maslahat 6,7 / 132 000: ' + g.tip);
  const nm = per.replace(/[  ]/g, ' ');
  if (!/^.*(1-oktabr – 31-oktabr|1 октября – 31 октября|1-октабр – 31-октабр)/.test(nm)) why.push('davr: ' + nm);
  if (!/(1-oktabr|1 октября|1-октабр)/.test(sline)) why.push('oy boshi sanasi: ' + sline);
  T(!why.length && errs.length === 0, 'VAQT ZONASI ' + tz + ' ' + iso.slice(11, 16) + ' · ' + lang + ': davr 1–31-oktabr, 532 000, 26-oktabr, 6,7 kVt-soat, 132 000', why.join(' | ') + errs.join('|'));
  await ctx.close();
}
for (const [tz, iso] of [['Asia/Tashkent', '2026-11-11T09:00:00+05:00'], ['America/New_York', '2026-11-11T09:00:00-05:00'], ['UTC', '2026-11-11T12:00:00Z']]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 }, timezoneId: tz, serviceWorkers: 'block' }); await ctx.clock.install({ time: new Date(iso) });
  await ctx.route(/googlesyndication|googletagmanager|google-analytics|fonts\.g/, (r) => r.abort());
  const p = await ctx.newPage(); await p.goto(BASE + PAGES.gaz.url, { waitUntil: 'load' }); await p.waitForTimeout(900); await p.click('#modeProg'); await firstRun(p, 5000, 5200);
  const g = await read(p, 'gaz'); const nm = (await p.evaluate(() => [...document.querySelectorAll('#useRows .rrow')].map((r) => r.innerText.replace(/\s+/g, ' ')).join('|'))).replace(/[  ]/g, ' ');
  T(digits(g.main) === 750000 && /1-noyabr – 30-noyabr/.test(nm) && JSON.stringify(nums(g.warn || '')) === JSON.stringify([26, 2000]) && JSON.stringify(nums(g.tip || '')) === JSON.stringify([5, 200000]), 'VAQT ZONASI ' + tz + ' · gaz isitish: davr 1–30-noyabr, 750 000, 26-noyabr, 200 000', g.main + ' ' + nm);
  await ctx.close();
}
// ---- hisob kuni 1 dan boshqa bo'lsa birinchi kirishda KO'RINADI (yashirin eski sozlama oy boshini siljitmaydi) ----
{
  const o = await open('elektr', 'UZ', 10, 14, { seed: ['kalki_prognoz_elektr_v1', JSON.stringify({ entries: [], billDay: 30 })] }); await o.p.click('#modeProg');
  const g = await o.p.evaluate(() => ({ line: (document.getElementById('pgBLine') || {}).textContent || '', sline: document.getElementById('pgSChg').parentNode.textContent }));
  T(/Hisob kuni: 30/.test(g.line) && /30-sentabr/.test(g.sline), 'hisob kuni 30 bo\'lsa, birinchi kirishda "Hisob kuni: 30 · o\'zgartirish" ko\'rinadi va oy boshi 30-sentabr', JSON.stringify(g));
  await o.p.click('#pgBChg'); await o.p.fill('#pgB1', '1'); await o.p.dispatchEvent('#pgB1', 'change'); await o.p.waitForTimeout(150);
  const g2 = await o.p.evaluate(() => ({ sline: document.getElementById('pgSChg').parentNode.textContent, bline: !!document.getElementById('pgBLine') }));
  T(/1-oktabr/.test(g2.sline) && !g2.bline, 'hisob kuni 1 ga o\'zgartirilgach oy boshi 1-oktabr, qator yo\'qoladi', JSON.stringify(g2));
  const d0 = await open('elektr', 'UZ', 10, 14); await d0.p.click('#modeProg');
  T((await d0.p.locator('#pgBLine').count()) === 0, 'hisob kuni 1 (standart) bo\'lsa qo\'shimcha qator ko\'rsatilmaydi'); await d0.ctx.close(); await o.ctx.close();
}
// ---- hisob kuni qatori: qadamlar OSTIDA (maydonlar orasida emas); "Hammasini o'chirish" hisob kunini 1 ga qaytaradi (tasdiq matnida aytilgan) ----
for (const lang of ['UZ', 'RU', 'ЎЗ']) for (const page of ['elektr', 'gaz']) {
  const key = page === 'elektr' ? 'kalki_prognoz_elektr_v1' : 'kalki_prognoz_gaz_v1';
  const o = await open(page, lang, 10, 14, { seed: [key, JSON.stringify({ entries: [], billDay: 30 })] }); await o.p.click('#modeProg');
  const pos = await o.p.evaluate(() => { const st = document.getElementById('pgSteps'), bl = document.getElementById('pgBLine'), f1 = document.getElementById('pgS'), f2 = document.getElementById('pgC'), F = Node.DOCUMENT_POSITION_FOLLOWING;
    return { afterSteps: !!(st.compareDocumentPosition(bl) & F), beforeFields: !!(bl.compareDocumentPosition(f1) & F) && !!(bl.compareDocumentPosition(f2) & F), small: parseFloat(getComputedStyle(bl).fontSize) <= 15.5, txt: bl.textContent.replace(/\s+/g, ' ') }; });
  T(pos.afterSteps && pos.beforeFields && pos.small && /30/.test(pos.txt), 'hisob kuni qatori ' + page + ' · ' + lang + ': qadamlar ostida, ikki maydondan oldin (orasida emas), kichik', JSON.stringify(pos));
  await o.ctx.close();
}
for (const page of ['elektr', 'gaz']) {
  const key = page === 'elektr' ? 'kalki_prognoz_elektr_v1' : 'kalki_prognoz_gaz_v1';
  const ents = page === 'elektr' ? [{ d: '2026-10-01', v: 10000 }, { d: '2026-10-14', v: 10260 }] : [{ d: '2026-11-01', v: 5000 }, { d: '2026-11-11', v: 5200 }];
  const [mm, dd] = page === 'elektr' ? [10, 14] : [11, 11];
  for (const lang of ['UZ', 'RU']) {
    const o = await open(page, lang, mm, dd, { seed: [key, JSON.stringify({ entries: ents, billDay: 30 })] });
    await openDet(o.p, 'pgListDet'); await o.p.click('#pgClear'); await o.p.waitForTimeout(100);
    const conf = await o.p.evaluate(() => document.getElementById('pgConf').innerText.replace(/\s+/g, ' '));
    T(/1 ga qaytariladi/.test(conf) || /вернётся к 1/.test(conf), 'hammasini o\'chirish tasdig\'i ' + page + ' · ' + lang + ' hisob kunini 1 ga qaytarishini aytadi', conf);
    await o.p.click('#pgNo'); const st0 = await o.p.evaluate((k) => JSON.parse(localStorage.getItem(k)).billDay, key);
    await openDet(o.p, 'pgListDet'); await o.p.click('#pgClear'); await o.p.click('#pgYes'); await o.p.waitForTimeout(150);
    const st1 = await o.p.evaluate((k) => { const x = JSON.parse(localStorage.getItem(k)); return x.billDay + ':' + x.entries.length; }, key);
    const first = await o.p.evaluate(() => ({ go: !!document.getElementById('pgGo'), bline: !!document.getElementById('pgBLine'), sline: document.getElementById('pgSChg').parentNode.textContent }));
    T(st0 === 30 && st1 === '1:0' && first.go && !first.bline, 'tasdiqdan keyin ' + page + ' · ' + lang + ': yozuvlar o\'chdi, hisob kuni 1 ga qaytdi (bekor qilganda 30 qoladi), birinchi kirish ekrani, qo\'shimcha qator yo\'q', st0 + ' ' + st1 + ' ' + JSON.stringify(first));
    await o.ctx.close();
  }
}
// ---- taxminiy sarf: davr boshida yozuv yo'q → "≈280 kVt-soat (taxminiy, ...)"; hisob kuni o'zgarsa natija DARHOL qayta hisoblanadi ----
const APPROX = {
  elektr: { ents: [{ d: '2026-10-01', v: 10000 }, { d: '2026-10-14', v: 10260 }], md: [10, 14], key: 'kalki_prognoz_elektr_v1', exact: [532000, 260], approx: [510000, 280], rows: 'devRows' },
  gaz: { ents: [{ d: '2026-11-01', v: 5000 }, { d: '2026-11-11', v: 5200 }], md: [11, 11], key: 'kalki_prognoz_gaz_v1', exact: [750000, 200], approx: [790000, 240], rows: 'useRows' }
};
//  elektr: hisob kuni 30 → davr 30.09–30.10, 01.10 birinchi yozuv: o'lchangan 260 + 1 kun × 20 = ≈280; prognoz 280 + 20×16 = 600 → 510 000
//  gaz (isitish): hisob kuni 30 → davr 30.10–30.11 (31 kun), 01.11 birinchi yozuv: o'lchangan 200 + 2 kun × 20 = ≈240; o'tgan 12, qolgan 19 → prognoz 240 + 20×19 = 620 → 500×1 100 + 120×2 000 = 790 000
for (const page of ['elektr', 'gaz']) for (const lang of ['UZ', 'RU', 'ЎЗ']) {
  const A = APPROX[page]; const o = await open(page, lang, A.md[0], A.md[1], { seed: [A.key, JSON.stringify({ entries: A.ents, billDay: 1 })] });
  const rd = async () => o.p.evaluate((rid) => ({ main: document.getElementById('mainNum').textContent, used: document.querySelector('#' + rid + ' .rrow .v').innerText.replace(/\s+/g, ' '), approxNote: !!document.querySelector('#' + rid + ' .pg-approx'), warnBlk: !!document.querySelector('#extraRows .pg-info') }), A.rows);
  const e = await rd();
  await openDet(o.p, 'pgSetDet'); await o.p.fill('#pgBill', '30'); await o.p.waitForTimeout(120);
  const a = await rd();
  await o.p.fill('#pgBill', '1'); await o.p.waitForTimeout(120);
  const b2 = await rd();
  const note = await o.p.evaluate(() => 0);
  const why = [];
  if (digits(e.main) !== A.exact[0] || nums(e.used)[0] !== A.exact[1] || /≈/.test(e.used) || e.approxNote) why.push('aniq holat: ' + JSON.stringify(e));
  if (digits(a.main) !== A.approx[0] || nums(a.used)[0] !== A.approx[1] || !/≈/.test(a.used) || !a.approxNote) why.push('hisob kuni 30 → darhol qayta hisoblash (taxminiy): ' + JSON.stringify(a));
  if (lang === 'UZ' && !/\(taxminiy, davr boshida yozuv yo'q\)/.test(a.used)) why.push('UZ yozuvi: ' + a.used);
  if (lang === 'RU' && !/\(ориентировочно, нет записи на начало периода\)/.test(a.used)) why.push('RU yozuvi: ' + a.used);
  if (digits(b2.main) !== A.exact[0] || /≈/.test(b2.used)) why.push('hisob kuni 1 ga qaytgach aniq: ' + JSON.stringify(b2));
  T(!why.length, 'taxminiy sarf ' + page + ' · ' + lang + ': hisob kuni 1 → ' + A.exact[0] + ' (' + A.exact[1] + '), 30 → ' + A.approx[0] + ' (≈' + A.approx[1] + ', taxminiy), 1 ga qaytgach yana aniq — yozish paytida darhol', why.join(' | '));
  await o.ctx.close();
}
// ---- rejim izohlari (bitta qisqa qator) ----
const TIPS = {
  UZ: { elektr: { dev: "Uydagi qurilmalarni belgilang, oylik sarf va to'lov chiqadi", use: 'Kvitansiyadagi kVt-soatni yozing', meter: 'Oldingi va hozirgi raqamni yozing' }, gaz: { use: "Kvitansiyadagi m³ ni yozing", meter: 'Oldingi va hozirgi raqamni yozing' } },
  RU: { elektr: { dev: 'Отметьте приборы дома — получите месячный расход и оплату', use: 'Впишите кВт-ч из квитанции', meter: 'Впишите предыдущее и текущее показание' }, gaz: { use: 'Впишите м³ из квитанции', meter: 'Впишите предыдущее и текущее показание' } },
  'ЎЗ': { elektr: { dev: 'Уйдаги қурилмаларни белгиланг, ойлик сарф ва тўлов чиқади', use: 'Квитанциядаги кВт-соатни ёзинг', meter: 'Олдинги ва ҳозирги рақамни ёзинг' }, gaz: { use: 'Квитанциядаги м³ ни ёзинг', meter: 'Олдинги ва ҳозирги рақамни ёзинг' } }
};
for (const lang of ['UZ', 'RU', 'ЎЗ']) for (const page of ['elektr', 'gaz']) {
  const o = await open(page, lang, 10, 14); const why = [];
  const modes = page === 'elektr' ? [['dev', '#modeDev'], ['use', '#modeUse'], ['meter', '#modeMeter']] : [['use', '#modeUse'], ['meter', '#modeMeter']];
  for (const [m, sel] of modes) { await o.p.click(sel); await o.p.waitForTimeout(100); const tip = await o.p.evaluate(() => { const e = document.getElementById('modeTip'); return { t: e.textContent.replace(/[  ]/g, ' '), vis: e.getBoundingClientRect().height > 0, sz: parseFloat(getComputedStyle(e).fontSize) }; });
    if (tip.t !== TIPS[lang][page][m] || !tip.vis) why.push(m + ': "' + tip.t + '" ' + tip.vis); }
  await o.p.click('#modeProg'); const pt = await o.p.evaluate(() => ({ tipVis: document.getElementById('modeTip').getBoundingClientRect().height > 0, steps: document.querySelectorAll('#pgSteps li').length }));
  if (pt.tipVis || pt.steps !== 3) why.push('prognozda 1 qatorli izoh o\'rniga 3 qadam bo\'lishi kerak: ' + JSON.stringify(pt));
  T(!why.length, 'rejim izohlari · ' + page + ' · ' + lang + ': har rejimda bitta qisqa qator, prognozda 3 qadam', why.join(' | ')); await o.ctx.close();
}
// ---- TIPOGRAFIYA (elektr va gaz, pilot): o'lchamlar shkala bo'yicha, matn >= 16/17 px, izoh >= 15 px va kontrast >= 4,5:1, havolalar tagi chiziqsiz ----
const SCALE = new Set([14, 15, 17, 18, 20, 24, 32, 40, 44]);   // 40 — mavjud katta summa (o'zgarmaydi)
for (const page of ['elektr', 'gaz']) for (const w of [390, 320]) {
  const o = await open(page, 'UZ', 10, 14, { width: w }); await o.p.click('#modeProg'); await o.p.waitForTimeout(250);
  const read1 = () => o.p.evaluate(() => {
    const cs = (sel) => { const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); return { fs: parseFloat(c.fontSize), fw: parseInt(c.fontWeight, 10), lh: parseFloat(c.lineHeight) / parseFloat(c.fontSize), color: c.color, td: c.textDecorationLine, bg: c.backgroundColor }; };
    return { label: cs('#progBox label'), step: cs('#pgSteps li'), hint: cs('#pgBLine,.pg-dline'), link: cs('#pgSChg'), ib: cs('.ibrow .ib'), input: cs('#pgS'), btn: cs('#pgGo'), tip: cs('.pg-note'), seg: cs('#modeSeg button'), h1: cs('h1') };
  });
  const f = await read1();
  await o.p.fill('#pgS', '10000'); await o.p.fill('#pgC', '10260'); await o.p.click('#pgGo'); await o.p.waitForTimeout(500);
  const r = await o.p.evaluate(() => {
    const cs = (sel) => { const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); return { fs: parseFloat(c.fontSize), fw: parseInt(c.fontWeight, 10), lh: parseFloat(c.lineHeight) / parseFloat(c.fontSize), color: c.color }; };
    return { k: cs('#devRows .rrow .k, #useRows .rrow .k'), v: cs('#devRows .rrow .v, #useRows .rrow .v'), fx: cs('#tierRows .fx'), num: cs('#mainNum'), seg: cs('.tb-seg'), tick: cs('.tb-tick'), cap: cs('.tb-cap'), val: cs('.tb-val'), lab: cs('.tb-nowlab'), blk: cs('.pg-warn, .pg-tip'), upd: cs('#pgUChg'), det: cs('.pg-det summary') };
  });
  const why = [];
  const chk = (n, v, min, opt = {}) => { if (!v) { why.push(n + ' topilmadi'); return; } if (v.fs < min) why.push(n + ' ' + v.fs + 'px < ' + min); if (!opt.free && !SCALE.has(v.fs)) why.push(n + ' ' + v.fs + 'px shkalada yo\'q'); if (opt.fw && v.fw < opt.fw) why.push(n + ' og\'irlik ' + v.fw); };
  chk('label', f.label, 17, { fw: 600 }); chk('qadam matni', f.step, 17); chk('izoh/sana qatori', f.hint, 15); chk('kiritish maydoni', f.input, 18); chk('katta tugma', f.btn, 18); chk('maxfiylik izohi', f.tip, 15); chk('segment', f.seg, 15); chk('havola-tugma', f.link, 15, { fw: 600 }); chk('ⓘ havola', f.ib, 15, { fw: 600 });
  if (f.step.lh < 1.45) why.push('matn qator balandligi ' + f.step.lh.toFixed(2)); if (f.h1.lh > 1.25) why.push('sarlavha qator balandligi ' + f.h1.lh.toFixed(2));
  if (f.link.td !== 'none' || f.ib.td !== 'none') why.push('havola-tugmada tagiga chiziq bor: ' + f.link.td + '/' + f.ib.td);
  chk('natija nomi', r.k, 17); chk('natija qiymati', r.v, 18, { fw: 600 }); chk('pog\'ona izohi (m × narx)', r.fx, 15); chk('chiziq: narx', r.seg, 15); chk('chiziq: chegara', r.tick, 14); chk('chiziq: izoh', r.cap, 14); chk('chiziq: strelka yozuvi', r.val, 15); chk('chiziq: hozir', r.lab, 14); if (r.blk) chk('ogohlantirish', r.blk, 17); chk('yig\'iq sarlavha', r.det, 17, { fw: 600 });
  if (r.num.fs !== 40 && r.num.fs !== 44) why.push('katta summa o\'zgargan: ' + r.num.fs);
  // kontrast (axe) forma va natija: >= 4,5:1
  await o.p.evaluate(AXE); const ax = await o.p.evaluate(async () => { const x = await axe.run(['#progAfter', '#receipt', '.form-card'], { resultTypes: ['violations'], runOnly: ['color-contrast'] }); return x.violations.map((v) => v.nodes.map((n) => n.target.join(' ')).join('; ')); });
  if (ax.length) why.push('kontrast: ' + ax.join(' | ').slice(0, 160));
  T(!why.length, 'TIPOGRAFIYA · ' + page + ' · ' + w + ' px: label 17/600, matn 17, izoh 15 (kontrast >= 4,5), natija nomi 17 / qiymati 18/600, chiziq raqami 15 / chegara 14, havolalar chiziqsiz, o\'lchamlar shkalada', why.join(' | ')); await o.ctx.close();
}
console.log('\nJadval (til · holat · sahifa · toifa · kutilgan · kalkulyator · natija):');
table.forEach((r) => console.log('  ' + r.join(' · ')));
console.log('\n' + (bad ? bad + ' ta tekshiruv yiqildi' : 'hammasi o\'tdi'));
await b.close();
process.exit(bad ? 1 : 0);
