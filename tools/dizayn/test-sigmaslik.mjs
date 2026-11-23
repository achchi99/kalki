// KalkiFit «sig'dirish» darvozasi (v93): matnlar ustma-ust tushmaydi, tugmalar matnni kesmaydi, gorizontal aylanish yo'q.
// Brauzer: Chromium + WebKit (Safari; yo'q bo'lsa o'tkazib yuboriladi — `source ~/wk-env.sh`). Kenglik 320 (iPhone SE) · 375 · 390 · 430; til UZ + RU (+ЎЗ kichik kenglikda);
// matn kattalashtirish ×1 va ×1,3 (tor kengliklarda); holatlar: bo'sh kun, to'la kun, makro «много», qadam 0 / 12 000, mashq 0 / 90 daqiqa;
// ekranlar: Bugun, kun xulosasi, maslahat kartasi, makro oynasi, qo'shish oynasi, Tarix, Tahlil, Profil.   Tekshiruv: tools/dizayn/sigmaslik-yadro.mjs (::before/::after matni ham).
//   node tools/dizayn/test-sigmaslik.mjs [--tez]     (--tez: faqat Chromium, 375/320, UZ+RU)      SKRINSHOT_DIR=<papka> — buzilganlarning rasmi
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path';
import { server, brauzerlar, open, seed, CHECK, nat, T0, D } from './sigmaslik-yadro.mjs'; import { pool } from './parallel.mjs';
const TEZ = process.argv.includes('--tez'), OUT = process.env.SKRINSHOT_DIR || '';
const day = (n, rows) => rows.map(([fid, meal, kcal, p, f, c]) => [D.addDays(T0, -n), fid, meal, kcal, p, f, c]);
const bugun = (rows) => rows.map(([fid, meal, kcal, p, f, c]) => [T0, fid, meal, kcal, p, f, c]);
const FULL = bugun([['non', 'b', 500, 15, 2, 100], ['osh', 'l', 800, 25, 35, 110], ['somsa', 'd', 700, 20, 40, 60]]);
const OVER = bugun([['somsa', 'b', 900, 20, 70, 90], ['osh', 'l', 1000, 25, 50, 140], ['kola', 'd', 700, 10, 40, 120]]);          // yog' va uglevod oshgan, oqsil kam
let hist = []; for (let i = 1; i <= 6; i++) hist = hist.concat(day(i, [['osh', 'l', 900, 25, 35, 110], ['kola', 'l', 300, 0, 0, 75], ['somsa', 'd', 900, 25, 50, 80]]));
const click = async (p, sel) => { await p.click(sel); await p.waitForTimeout(450); };
const closeSh = async (p) => { await p.evaluate(() => { const x = document.querySelector('#rzSheet [data-act=sheetclose], #rzSheet .rz-x'); if (x) x.click(); }); await p.waitForTimeout(250); };
/* senariy: {n, st, hour, w? (faqat shu kengliklar), act(p) -> scope, scope} */
const SC = [
  { n: 'bugun-bosh', st: () => seed({}), scope: '#rzMain' },
  { n: 'bugun-to\'la', st: () => seed({ food: FULL, steps: 12000, ex: 90, water: 6 }), scope: '#rzMain' },
  { n: 'bugun-makro-oshdi', st: () => seed({ food: OVER, steps: 0, ex: 0 }), scope: '#rzMain' },
  { n: 'bugun-qadam0-mashq90', st: () => seed({ food: FULL, steps: 0, ex: 90 }), scope: '#rzMain' },
  { n: 'bugun-qadam12000-mashq0', st: () => seed({ food: FULL, steps: 12000, ex: 0 }), scope: '#rzMain' },
  /* v94: iPhone web — qo'lda qadam rejimi («Введите шаги» tugmasi) va mashq 0 («Добавить тренировку»): karta ekran tagida (sticky tugma ishga tushadi) va ekranning o'rtasida; 390 px */
  { n: 'iphone-qadam0-mashq0-pastda', w: [390], st: () => seed({ food: FULL, steps: 0, ex: 0 }), scope: '.sl-act' },
  { n: 'iphone-qadam0-mashq0-ekranda', w: [390], st: () => seed({ food: FULL, steps: 0, ex: 0 }), act: async (p) => { await p.evaluate(() => document.querySelector('.sl-act').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300); return '.sl-act'; } },
  { n: 'iphone-qadam0-mashq0-bosh-kun', w: [390], st: () => seed({}), scope: '#rzMain' },
  { n: 'maslahat-kartasi', st: () => seed({ food: OVER }), hour: 15, scope: '#rzMain', need: '#mslCard' },
  { n: 'kun-xulosasi', st: () => seed({ food: OVER }), hour: 22, scope: '#rzMain', need: '#kxCard' },
  { n: 'makro-oynasi', st: () => seed({ food: OVER }), act: async (p) => { await click(p, '#bjuCard .mk-row[data-m=f]'); await p.waitForSelector('#mkTop'); return '#rzSheet'; } },
  { n: 'qoshish-oynasi', st: () => seed({ food: FULL }), act: async (p) => { await click(p, '#mainAdd'); await p.waitForTimeout(500); return '#rzSheet'; } },
  { n: 'qoshish-natijalar', st: () => seed({ food: FULL }), act: async (p) => { await click(p, '#mainAdd'); await p.fill('#fdQ', 'osh'); await p.waitForTimeout(700); return '#rzSheet'; } },
  { n: 'qoshish-porsiya', st: () => seed({ food: FULL }), act: async (p) => { await click(p, '#mainAdd'); await p.fill('#fdQ', 'osh'); await p.waitForTimeout(700); await click(p, '#rzSheet .sl-rw [data-act], #rzSheet .sl-rw'); await p.waitForTimeout(500); return '#rzSheet'; } },
  { n: 'yana-bolimi', st: () => seed({ food: FULL }), act: async (p) => { await click(p, '[data-act=tab][data-v=more]'); return '#rzMain'; } },
  { n: 'maslahat-bolimi', st: () => seed({ food: OVER }), hour: 15, act: async (p) => { await click(p, '[data-act=tab][data-v=advice]'); await p.waitForTimeout(500); return '#rzMain'; } },
  { n: 'maslahat-kutish', st: () => seed({ food: bugun([['non', 'b', 500, 15, 2, 100]]) }), scope: '#rzMain', need: '#advCard[data-s=wait]' },
  { n: 'kun-tanlangan', st: () => seed({ food: day(2, [['osh', 'l', 900, 25, 45, 110], ['somsa', 'd', 700, 20, 40, 60]]).concat(FULL) }), act: async (p) => { await click(p, '#wkStrip .wd:nth-of-type(5)'); await p.waitForTimeout(500); return '#rzMain'; } },
  { n: 'pastki-panel', st: () => seed({ food: FULL }), scope: '.rz-nav' },
  { n: 'tarix', st: () => seed({ food: hist.concat(FULL) }), act: async (p) => { await click(p, '[data-act=tab][data-v=history]'); await p.waitForSelector('#tlCard'); return '#rzMain'; } },
  { n: 'tahlil-oynasi', st: () => seed({ food: hist }), act: async (p) => { await click(p, '[data-act=tab][data-v=history]'); await click(p, '#tlCard'); await p.waitForSelector('.tl-main'); return '#rzSheet'; } },
  /* v97: bo'sh o'tgan kun, karta ekran tagida (pastga aylantirilgan), Tahlil bo'limi pasti */
  { n: 'kun-tanlangan-bosh', st: () => seed({ food: FULL }), act: async (p) => { await click(p, '#wkStrip .wd:nth-of-type(3)'); await p.waitForTimeout(600); return '#rzMain'; } },
  /* v95: Lola — savol (3 javob tugmasi), javob pufakchasi, «Maslahat» suhbati (salom + xotira + kartadagi so'z) */
  { n: 'lola-savol', st: () => seed({ food: bugun([['non', 'b', 300, 8, 2, 60], ['osh', 'l', 500, 15, 20, 60]]) }), hour: 16, scope: '#rzMain', need: '.lola-ans' },
  { n: 'lola-javob', st: () => seed({ food: bugun([['non', 'b', 300, 8, 2, 60], ['osh', 'l', 500, 15, 20, 60]]) }), hour: 16, act: async (p) => { await click(p, '.lola-ans [data-act=lolaans]'); await p.waitForTimeout(400); return '#rzMain'; } },
  { n: 'lola-sovet', st: () => seed({ food: hist.concat(FULL) }), hour: 10, act: async (p) => { await click(p, '[data-act=tab][data-v=advice]'); await p.waitForTimeout(500); return '#rzMain'; } },
  { n: 'lola-tanlash', st: () => seed({ food: FULL }), act: async (p) => { await click(p, '[data-act=tab][data-v=advice]'); await p.waitForTimeout(400); await p.evaluate(() => { const e = document.getElementById('lolaSetC'); if (e) e.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(300); return '#lolaSetC'; } },
  /* v98: «Анализ» — haftalik makrolar me'yorga nisbatan; qadamni soatdan qo'lda kiritish oynasi (oxirgilar bilan) */
  { n: 'tahlil-makro', st: () => seed({ food: hist.concat(FULL) }), act: async (p) => { await click(p, '[data-act=tab][data-v=history]'); await p.waitForTimeout(500); await p.evaluate(() => { const e = document.getElementById('tlMb'); if (e) e.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(1500); return '#tlMb'; } },
  { n: 'zaxira-eslatma', st: () => { const st = seed({ food: FULL }); delete st.prefs.h_backup; for (let i = 1; i <= 4; i++) st.days[D.addDays(T0, -i)] = Object.assign(st.days[D.addDays(T0, -i)] || {}, { steps: 1000 * i }); return st; }, act: async (p) => { await p.waitForSelector('[data-nudge=backup]', { timeout: 4000 }).catch(() => {}); return '[data-nudge=backup]'; } },
  { n: 'qadam-soat-oyna', st: () => seed({ food: FULL, prefs: { sman: 1 } }), act: async (p) => { await p.evaluate(() => { try { localStorage.setItem('kalki_sw_rec', '[12450,9800,7300]'); } catch (e) { } }); await click(p, '[data-act=stepin], [data-act=stepwatch]'); await p.waitForTimeout(600); return '#rzSheet'; } },
  { n: 'karta-ekran-tagida', st: () => seed({ food: OVER, steps: 0, ex: 0, water: 3 }), hour: 15, act: async (p) => { await p.evaluate(() => { const m = document.getElementById('rzMain'); m.scrollTop = m.scrollHeight; }); await p.waitForTimeout(300); return '#rzMain'; } },
  { n: 'profil', st: () => seed({ food: FULL }), act: async (p) => { await click(p, '[data-act=tab][data-v=profile]'); return '#rzMain'; } },
];
/* matritsa: WebKit (Safari) — 4 kenglik; Chromium (Android WebView) — tanlab. z = matn kattalashtirish (tor kengliklarda ×1,3) */
const CFG = { webkit: [[320, ['uz', 'ru', 'cyr'], [1, 1.3]], [375, ['uz', 'ru', 'cyr'], [1, 1.3]], [390, ['uz', 'ru'], [1]], [430, ['uz', 'ru'], [1]]], chromium: [[320, ['uz', 'ru', 'cyr'], [1]], [320, ['ru'], [1.3]], [390, ['uz', 'ru'], [1]], [430, ['uz'], [1]]] };
const CFG_TEZ = { chromium: [[320, ['uz', 'ru'], [1, 1.3]], [375, ['uz', 'ru'], [1, 1.3]], [390, ['uz', 'ru'], [1]]] };
const jobs = []; for (const eng of TEZ ? ['chromium'] : ['chromium', 'webkit']) for (const sc of SC) for (const [w, langs, zs] of (TEZ ? CFG_TEZ : CFG)[eng]) for (const lang of langs) for (const z of zs) { if (sc.w && !sc.w.includes(w)) continue; jobs.push({ eng, sc, w, lang, z }); }
const { srv, BASE } = await server(); const B = await brauzerlar(); if (!B.webkit && !TEZ) console.log('OGOHLANTIRISH: WebKit ishga tushmadi — faqat Chromium (' + (B.wkXato || '') + ')');
/* 0. kalibrlash: tekshiruv o'zi buzilgan maketni TOPA OLISHI shart (v92 xatosi: ::after matni «Жиры · выше нормы» qo'shni ustunga chiqqan, eski tekshiruv ko'rmagan) */
{ const p = await open(B.chromium, BASE, { w: 320, lang: 'ru', st: seed({}), reduced: true, settle: 200 });
  const r = await p.evaluate((chk) => { document.getElementById('rzMain').insertAdjacentHTML('afterbegin', '<style>.xb-r{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;font-size:13px}.xb-r span{white-space:nowrap}.xb-r span::after{content:" · " attr(data-st)}</style><div id="xb" class="xb-r"><span data-st="мало">Белки</span><span data-st="выше нормы">Жиры</span><span data-st="мало">Углеводы</span></div><div id="xb2" style="position:relative;height:40px"><button style="position:absolute;left:0;top:0;width:120px;height:30px">Введите шаги</button><b style="position:absolute;left:20px;top:8px">0 / 8 000</b></div>');
    return (0, eval)('(' + chk + ')')('#xb'); }, CHECK.toString()); const r2 = await p.evaluate((chk) => (0, eval)('(' + chk + ')')('#xb2'), CHECK.toString());
  assert.ok(r.bad.length + r.clip.length + r.esc.length > 0, "kalibrlash: ::after matnining qo'shni ustunga chiqishi topilmadi — tekshiruv ko'r"); assert.ok(r2.bad.length > 0, "kalibrlash: ustma-ust tushgan tugma + matn topilmadi"); await p.context().close(); }
{ const p = await open(B.chromium, BASE, { w: 390, lang: 'ru', st: seed({}), reduced: true, settle: 200 });
  const r3 = await p.evaluate((chk) => { document.getElementById('rzMain').insertAdjacentHTML('afterbegin', '<div id="xc" style="height:22px;overflow:hidden;width:150px;font-size:16px"><span>Добавить тренировку сегодня вечером</span></div><div id="xd" style="position:relative;height:90px"><button style="display:block;width:100%;height:40px;position:sticky;bottom:0">Введите шаги</button><button id="xe" style="position:absolute;top:10px;left:0;width:60px;height:30px">0 минут</button></div>'); return [(0, eval)('(' + chk + ')')('#xc'), (0, eval)('(' + chk + ')')('#xd')]; }, CHECK.toString());
  assert.ok(r3[0].cut.length > 0, 'kalibrlash: ota overflow:hidden kesgan matn topilmadi'); assert.ok(r3[1].blk.length > 0, 'kalibrlash: ustma-ust tugmalar (blk) topilmadi'); await p.context().close(); }
const fails = []; let n = 0;
await pool(jobs.filter((j) => B[j.eng]), 4, async (j) => {
  let p; try {
    p = await open(B[j.eng], BASE, { w: j.w, lang: j.lang, st: j.sc.st(), hour: j.sc.hour, zoom: j.z, reduced: true, settle: 300, scheme: j.w % 2 ? 'light' : 'dark' }); let scope = j.sc.scope;
    if (j.sc.act) scope = await j.sc.act(p); if (j.sc.need) { await p.waitForTimeout(900); if (!(await p.locator(j.sc.need).count())) { fails.push([j.eng, j.sc.n, j.w, j.lang, 'z' + j.z, 'kutilgan karta yo\'q: ' + j.sc.need].join(' ')); return; } }
    const r = await p.evaluate(CHECK, scope); n++; const t = r.err || nat(r);
    if (t) { fails.push([j.eng, j.sc.n, j.w, j.lang, 'z' + j.z, t.slice(0, 260)].join(' ')); if (OUT) { fs.mkdirSync(OUT, { recursive: true }); await p.screenshot({ path: path.join(OUT, ['xato', j.eng, j.sc.n, j.w, j.lang, 'z' + j.z].join('-').replace(/[^\w.-]/g, '_') + '.png'), fullPage: false }); } }
    if (p.errs.length) fails.push([j.eng, j.sc.n, j.w, j.lang, 'JS xato: ' + p.errs[0].slice(0, 120)].join(' '));
  } catch (e) { fails.push([j.eng, j.sc.n, j.w, j.lang, 'z' + j.z, 'ISTISNO ' + String(e.message).split('\n')[0].slice(0, 160)].join(' ')); } finally { if (p) await p.context().close().catch(() => {}); }
});
await B.chromium.close(); if (B.webkit) await B.webkit.close(); srv.close();
if (fails.length) { console.log(fails.sort().join('\n')); assert.fail(fails.length + ' ta sig\'maslik / ustma-ust tushish (' + n + ' tekshirildi)'); }
console.log('OK   sig\'dirish: ' + n + ' kombinatsiya (' + (TEZ ? 'Chromium' : 'Chromium + ' + (B.webkit ? 'WebKit' : 'WebKit YO\'Q')) + ') — kesishish, chiqish, kesilish, gorizontal aylanish yo\'q');
