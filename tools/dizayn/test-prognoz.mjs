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
  const ctx = await b.newContext({ viewport: { width: o.width || 390, height: 900 }, serviceWorkers: 'block' });
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
async function addEntry(p, d, v) { await p.fill('#pgDate', d); await p.fill('#pgVal', String(v)); await p.click('#pgSave'); await p.waitForTimeout(120); }
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
async function axeOk(p) { await p.evaluate(AXE); const r = await p.evaluate(async () => { const x = await axe.run('#receipt', { runOnly: ['color-contrast'] }); return x.violations.map((v) => v.nodes.map((n) => n.target.join(' ') + ' ' + (n.any[0] ? n.any[0].message : '')).join('; ')); }); return r; }

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
    for (const [dd, v] of entries) await addEntry(o.p, dd, v);
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

// ---- 5) bitta yozuv; 6) kamaygan/kelajak; saqlanmaydi; yangi kundalik; o'chirish; hammasini o'chirish (sahifa ichidagi tasdiq) ----
{
  const o = await open('elektr', 'UZ', 10, 11); let dialog = false; o.p.on('dialog', (d) => { dialog = true; d.dismiss(); });
  await o.p.click('#modeProg'); await addEntry(o.p, '2026-10-05', 10100);
  let g = await read(o.p, 'elektr');
  const needTxt = await o.p.evaluate(() => document.getElementById('devRows').innerText);
  T(needTxt.includes(TXT.UZ.need) && g.main === '—', '5) bitta yozuv → "Yana bitta ko\'rsatkich kiriting", summa yo\'q', needTxt.replace(/\s+/g, ' '));
  await addEntry(o.p, '2026-10-01', 10000); await addEntry(o.p, '2026-10-11', 10150);
  const store = () => o.p.evaluate(() => JSON.parse(localStorage.getItem('kalki_prognoz_elektr_v1') || '{"entries":[]}').entries.map((e) => e.d + '=' + e.v).join(','));
  T(await store() === '2026-10-01=10000,2026-10-05=10100,2026-10-11=10150', 'yozuvlar localStorage da tartib bilan saqlandi', await store());
  await addEntry(o.p, '2026-10-11', 10050);
  g = await read(o.p, 'elektr'); const st1 = await store();
  T(TXT.UZ.less.test(g.msg) && st1.endsWith('2026-10-11=10150') && (await o.p.locator('#pgNew').count()) === 1, '6) kamaygan ko\'rsatkich → xato, SAQLANMAYDI, "Yangi kundalik boshlang" tugmasi', g.msg + ' | ' + st1);
  await addEntry(o.p, '2026-10-12', 10200);
  g = await read(o.p, 'elektr'); T(TXT.UZ.fut.test(g.msg) && !(await store()).includes('10-12'), '6) kelajak sana → xato, saqlanmaydi', g.msg);
  await addEntry(o.p, '2026-10-05', 10120);
  T((await store()).includes('2026-10-05=10120') && !(await store()).includes('=10100'), 'shu sanaga ikkinchi yozuv eskisini almashtiradi', await store());
  await addEntry(o.p, '2026-10-11', 10050);
  await o.p.click('#pgNew'); await o.p.waitForTimeout(150);
  T(await store() === '2026-10-11=10050', '6) "Yangi kundalik boshlang": eski yozuvlar o\'chdi, yangi ko\'rsatkich boshlang\'ich', await store());
  await addEntry(o.p, '2026-10-05', 10000); await addEntry(o.p, '2026-10-08', 10020);
  await o.p.click('[data-del="2026-10-08"]'); await o.p.waitForTimeout(100);
  T(!(await store()).includes('10-08'), 'bitta yozuvni o\'chirish (✕) ishlaydi', await store());
  await o.p.click('#pgClear'); await o.p.waitForTimeout(100);
  const conf = await o.p.locator('#pgConf').count(); T(conf === 1 && (await store()).length > 0, 'hammasini o\'chirish: avval sahifa ichidagi tasdiq (hali o\'chmagan)');
  await o.p.click('#pgNo'); T((await store()).length > 0, 'tasdiqda "Bekor qilish" — yozuvlar joyida');
  await o.p.click('#pgClear'); await o.p.click('#pgYes'); await o.p.waitForTimeout(100);
  T(await store() === '' && !dialog, 'tasdiqdan keyin hammasi o\'chdi; alert/confirm ishlatilmadi', await store());
  const priv = await o.p.evaluate(() => document.getElementById('pgPriv').textContent);
  T(priv.includes(TXT.UZ.priv), 'matn: "Ko\'rsatkichlar faqat shu qurilmada saqlanadi."', priv);
  T(o.errs.length === 0, '5/6) JS xatolari yo\'q', o.errs.join(' | ')); await o.ctx.close();
}
// ---- 7) davr boshida yozuv yo'q: interpolyatsiya ----
{
  const o = await open('elektr', 'UZ', 10, 15); await o.p.click('#modeProg');
  for (const [dd, v] of [['2026-09-25', 9900], ['2026-10-05', 10000], ['2026-10-15', 10200]]) await addEntry(o.p, dd, v);
  await o.p.waitForTimeout(250); const g = await read(o.p, 'elektr'); const rv = g.rows.map((x) => nums(x)[0]);
  T(rv[0] === 240 && rv[1] === 17.1 && rv[2] === 531.4 && digits(g.main) === 434571 && g.infoBlk.some((x) => /qo'shni yozuvlar/.test(x)), '7) interpolyatsiya 9 960: shu paytgacha 240, 14 kun → 17,1/kun, prognoz 531,4, summa 434 571', JSON.stringify([rv.slice(0, 3), g.main, g.infoBlk]));
  await o.ctx.close();
}
// ---- o'tgan davrlar, rejim avtomatik ochilishi, localStorage o'chirilgan brauzer, ulashish, PWA ----
{
  const seed = ['kalki_prognoz_elektr_v1', JSON.stringify({ entries: [{ d: '2026-08-01', v: 1000 }, { d: '2026-09-01', v: 1200 }, { d: '2026-10-01', v: 1500 }, { d: '2026-10-15', v: 1600 }], billDay: 1 })];
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
  await o.p.click('#modeProg'); await addEntry(o.p, '2026-10-01', 10000); await addEntry(o.p, '2026-10-11', 10150);
  const g = await read(o.p, page); const note = await o.p.evaluate(() => document.getElementById('pgPriv').textContent);
  T(o.errs.length === 0 && digits(g.main) > 0 && note.includes(TXT.UZ.store), '8) ' + page + ': localStorage taqiqlangan brauzerda xatosiz ishlaydi (sessiya ichida), "Bu brauzerda saqlab bo\'lmadi" deydi', o.errs.join(' | ') + ' ' + g.main);
  await o.ctx.close();
}
{
  const o = await open('elektr', 'UZ', 10, 11); await o.p.click('#modeProg');
  await o.p.evaluate(() => { window.KalkiPwa = { installed: false, ios: false, canPrompt: () => true, prompt: () => { window.__pwaPrompt = 1; return true; }, iosHint: () => 'x' }; });
  await addEntry(o.p, '2026-10-01', 10000);
  const c1 = await o.p.locator('#pgPwaBox').count(); await addEntry(o.p, '2026-10-11', 10150);
  const c2 = await o.p.locator('#pgPwaBox').count();
  T(c1 === 0 && c2 === 1, 'PWA taklifi 1-yozuvdan keyin yo\'q, 2-yozuvdan keyin chiqadi');
  await o.p.click('#pgPwaX'); await addEntry(o.p, '2026-10-11', 10160);
  const c3 = await o.p.locator('#pgPwaBox').count(); const ts = await o.p.evaluate(() => localStorage.getItem('kalki_prog_pwa'));
  T(c3 === 0 && !!ts, 'yopilgach qayta chiqmaydi, vaqt saqlandi (30 kun)'); await o.ctx.close();
  const day = 86400000, T0 = new Date(2026, 9, 11, 12).getTime();
  for (const [ago, want] of [[29, 0], [31, 1]]) {
    const q = await open('elektr', 'UZ', 10, 11, { seed: ['kalki_prog_pwa', String(T0 - ago * day)] }); await q.p.click('#modeProg');
    await q.p.evaluate(() => { window.KalkiPwa = { installed: false, ios: false, canPrompt: () => true, prompt: () => true, iosHint: () => 'x' }; });
    await addEntry(q.p, '2026-10-01', 10000); await addEntry(q.p, '2026-10-11', 10150);
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
for (const [page, m, d, entries, cat] of [['elektr', 10, 16, [['2026-10-01', 20000], ['2026-10-16', 20300]]], ['gaz', 11, 11, [['2026-11-01', 5000], ['2026-11-11', 5200]]]]) for (const w of [320, 390]) {
  const o = await open(page, 'UZ', m, d, { width: w }); await o.p.click('#modeProg'); for (const [dd, v] of entries) await addEntry(o.p, dd, v); await o.p.waitForTimeout(250);
  const g = await o.p.evaluate(() => {
    const vw = document.documentElement.clientWidth, over = document.documentElement.scrollWidth > vw + 1, pl = document.querySelector('#tierBar .tb'), r = pl.getBoundingClientRect();
    const lab = document.querySelector('#tierBar .tb-nowlab').getBoundingClientRect(), val = document.querySelector('#tierBar .tb-val').getBoundingClientRect();
    const blocks = [...document.querySelectorAll('#extraRows .pg-blk, #progBox input, #progBox button')].map((e) => e.getBoundingClientRect()).filter((x) => x.width > 0);
    return { over, plate: Math.round(r.width), labIn: lab.left >= r.left - 1 && lab.right <= r.right + 1, valIn: val.left >= r.left - 1 && val.right <= r.right + 1, inVp: blocks.every((x) => x.left >= -1 && x.right <= vw + 1), segClip: [...pl.querySelectorAll('.tb-seg')].some((e) => e.scrollWidth > e.clientWidth + 1) };
  });
  const ax = await axeOk(o.p);
  T(!g.over && g.plate > 200 && g.labIn && g.valIn && g.inVp && !g.segClip && !ax.length, page + ' · ' + w + ' px: prognoz kartasi sig\'adi (chiziq ' + g.plate + ' px, "hozir" va strelka yozuvi ichkarida), kontrast (axe) toza', JSON.stringify(g) + ' ' + ax.join('|').slice(0, 160));
  await o.ctx.close();
}
console.log('\nJadval (til · holat · sahifa · toifa · kutilgan · kalkulyator · natija):');
table.forEach((r) => console.log('  ' + r.join(' · ')));
console.log('\n' + (bad ? bad + ' ta tekshiruv yiqildi' : 'hammasi o\'tdi'));
await b.close();
process.exit(bad ? 1 : 0);
