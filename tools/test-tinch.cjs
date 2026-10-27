/* Test rejimida CPU tejash (tools/testlar.js NODE_OPTIONS=--require orqali yuklaydi; qo'lda: node -r ./tools/test-tinch.cjs test.mjs).
 *
 * O'lchov (docs/testlar.md): KalkiFit «idishi»dagi cheksiz SVG to'lqin (SMIL animateTransform, clipPath ichida) har kadrda butun SVG'ni
 * qayta chizadi — ochiq sahifa boshiga ~0,38 yadro, test kutayotgan paytda ham. To'liq darvozada CPU 85 % band edi.
 *
 * Qiladi: har bir brauzer kontekstiga init skript — sahifadagi har SVG paydo bo'lgandan 1,6 s keyin (ko'tarilish animatsiyasi ≤ 1,3 s
 * tugagach) uning SMIL animatsiyalarini to'xtatadi (svg.pauseAnimations()). DOM, atributlar (dur, repeatCount), ko'tarilish va
 * CSS animatsiyalar o'zgarmaydi — testlar tekshiradigan narsa bir xil; faqat bezak to'lqini joyida qotadi.
 * Skrinshot asbobi (kalkifit-ekranlar.mjs) runner'siz yuradi — u yerda to'lqin odatdagidek. O'chirish: TEST_TINCH=0. */
'use strict';
function patch(pw) {
  if (!pw || pw.__tinchDone) return pw; pw.__tinchDone = true;
  {
    const INIT = () => {
      const tick = () => { const now = performance.now(); document.querySelectorAll('svg').forEach((v) => { if (!v.pauseAnimations) return; if (v.__tt == null) { v.__tt = now; return; } if (!v.__tp && now - v.__tt > 1600) { v.__tp = 1; try { v.pauseAnimations(); } catch (e) { /* */ } } }); };
      setInterval(tick, 400);
    };
    const wrapBrowser = (b) => { if (!b || b.__tinch) return b; b.__tinch = true; const nc = b.newContext.bind(b);
      b.newContext = async (...a) => { const c = await nc(...a); await c.addInitScript(INIT); return c; }; return b; };
    for (const bt of [pw.chromium, pw.firefox, pw.webkit]) { if (!bt || bt.__tinch) continue; bt.__tinch = true;
      const l = bt.launch.bind(bt); bt.launch = async (...a) => wrapBrowser(await l(...a));
      const lp = bt.launchPersistentContext && bt.launchPersistentContext.bind(bt); if (lp) bt.launchPersistentContext = async (...a) => { const c = await lp(...a); await c.addInitScript(INIT); return c; }; }
  }
  return pw;
}
/* runner bu faylni faqat brauzer testlariga (tools/dizayn/*.mjs) beradi; ESM `import 'playwright'` ham shu CJS keshidagi obyektni oladi */
if (process.env.TEST_TINCH !== '0') { try { patch(require('playwright')); } catch (e) { /* playwright yo'q */ } }
