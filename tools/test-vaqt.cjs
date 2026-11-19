/* kalki.uz — testlarda SANA/VAQT yagona yordamchisi (barqaror testlar: "bugungi kun"ga bog'liq yiqilishlar yo'q).
 *
 * Muammo: ilova kunga qarab o'zgaradi (payshanba — «Baliq kuni» kartasi, dushanba — «Haftangiz» chipi, yakshanba 19:00 — hafta xulosasi, oy chegarasi, kun vaqti — ovqat chipi).
 * Test «bugun»ni haqiqiy soatdan olsa, haftaning kuniga qarab tasodifan yiqiladi. Yechim — soat QOTIRILADI:
 *   · standart: eng yaqin O'TGAN SESHANBA, soat 11:00 (haqiqiy sanadan 0–6 kun oldin; payshanba/dushanba/yakshanba kartalari yoqilmaydi);
 *   · vaqt keyin OQADI (qotib turmaydi) — kutishlar, animatsiyalar, taymerlar odatdagidek ishlaydi;
 *   · node (S.dates.today(), new Date(), Date.now()) VA har bir Playwright konteksti (sahifadagi Date) — BIR XIL siljish bilan: test urug'i va ilova bir xil «bugun»ni ko'radi;
 *   · kunga bog'liq kartalar faqat ular uchun yozilgan testlarda yoqiladi (ular `page.clock.setFixedTime(...)` yoki o'z sanasini o'zi beradi — bu yordamchining ustidan ishlaydi).
 *
 * Yoqish:   · tools/testlar.js KalkiFit/Ro'zg'or testlariga `node --require tools/test-vaqt.cjs <test>` beradi (kod ichida kalkifit/rozgor ko'rinsa);
 *           · qo'lda: `node --require ./tools/test-vaqt.cjs tools/dizayn/test-x.mjs` yoki test boshida `require('../test-vaqt.cjs')` (ESM: createRequire).
 * Boshqarish (env):  KF_VAQT=haqiqiy — o'chirish (haqiqiy soat) · KF_VAQT=2026-11-17T11:00:00 — o'z sanangiz (mahalliy vaqt).
 * API:      require('./test-vaqt.cjs') → { nishon(now?), faol, siljish, ISH_SOAT } ;  global.__KF_SILJISH — millisekund siljish (haqiqiy soat bilan farq).
 * Sahifa tomonda (Playwright): har yangi kontekstga init-script — Date.now/new Date siljish bilan; page.clock bilan ishlatilganda clock ustun (ular o'z sanasini beradi). */
'use strict';
const Module = require('module');
const ISH_SOAT = 11, SESHANBA = 2;                                    // 0 = yakshanba … 2 = seshanba
function nishon(now) {                                               // eng yaqin O'TGAN seshanba (bugun seshanba bo'lsa — bugun), soat 11:00 — Date (mahalliy vaqt)
  const r = new Date(now == null ? Date.now() : now); r.setHours(ISH_SOAT, 0, 0, 0);
  while (r.getDay() !== SESHANBA) r.setDate(r.getDate() - 1);
  return r;
}
function parse(v) {
  if (!v || v === 'haqiqiy' || v === 'real' || v === '0') return null;
  const d = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/.test(v) ? new Date(v.length === 10 ? v + 'T' + String(ISH_SOAT).padStart(2, '0') + ':00:00' : v) : null; return d && !isNaN(d) ? d : null;
}
const REAL_NOW = Date.now(), REAL_DATE = Date, env = process.env.KF_VAQT;
const target = env === 'haqiqiy' || env === 'real' ? null : (parse(env) || nishon(REAL_NOW));
const OFF = target ? target.getTime() - REAL_NOW : 0;
if (!global.__KF_VAQT_FAOL && target) {
  global.__KF_VAQT_FAOL = true; global.__KF_SILJISH = OFF; global.__KF_HAQIQIY_DATE = REAL_DATE;
  const NOW = () => REAL_DATE.now() + OFF;
  class D2 extends REAL_DATE {
    constructor(...a) { if (a.length === 0) super(NOW()); else super(...a); }
    static now() { return NOW(); }
  }
  global.Date = D2;
  /* Playwright: har yangi kontekst/sahifaga bir xil siljish (sahifadagi Date). */
  const SRC = '(function(OFF){ var R = Date; if (R.__kfv) return; function NOW(){ return R.now() + OFF; } class D2 extends R { constructor() { var a = arguments; if (a.length === 0) super(NOW()); else super(...a); } static now() { return NOW(); } } D2.__kfv = true; window.Date = D2; })(' + OFF + ')';
  const wrapBrowser = (b) => {
    if (!b || b.__kfv) return b; b.__kfv = true;
    const nc = b.newContext && b.newContext.bind(b), np = b.newPage && b.newPage.bind(b);
    if (nc) b.newContext = async (...a) => { const c = await nc(...a); await c.addInitScript(SRC); return c; };
    if (np) b.newPage = async (...a) => { const p = await np(...a); await p.context().addInitScript(SRC); return p; };
    return b;
  };
  const wrapType = (bt) => {
    if (!bt || bt.__kfv) return bt; bt.__kfv = true;
    const L = bt.launch && bt.launch.bind(bt), P = bt.launchPersistentContext && bt.launchPersistentContext.bind(bt), C = bt.connect && bt.connect.bind(bt);
    if (L) bt.launch = async (...a) => wrapBrowser(await L(...a));
    if (C) bt.connect = async (...a) => wrapBrowser(await C(...a));
    if (P) bt.launchPersistentContext = async (...a) => { const c = await P(...a); await c.addInitScript(SRC); return c; };
    return bt;
  };
  const patchPw = (m) => { if (m && typeof m === 'object') ['chromium', 'firefox', 'webkit'].forEach((k) => { try { wrapType(m[k]); } catch (e) {} }); return m; };
  const load = Module._load;
  Module._load = function (request, parent, isMain) {
    const m = load.apply(this, arguments);
    if (/(^|[\\/])(playwright|playwright-core)([\\/]index\.js)?$/.test(request) || /node_modules[\\/](playwright|playwright-core)[\\/]index\.js$/.test(String(request))) patchPw(m);
    return m;
  };
  /* oldin yuklangan bo'lsa */
  ['playwright', 'playwright-core'].forEach((n) => { try { const k = Object.keys(require.cache).find((f) => new RegExp('node_modules[\\\\/]' + n + '[\\\\/]index\\.js$').test(f)); if (k) patchPw(require.cache[k].exports); } catch (e) {} });
}
module.exports = { nishon, faol: !!target, siljish: OFF, ISH_SOAT, target };
