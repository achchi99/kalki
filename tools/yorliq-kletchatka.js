/* kalki.uz — KalkiFit kletchatka (v102): data/manba/yorliq.json dagi har bir yorliqqa Open Food Facts dan «fib» (fiber_100g, g/100 g) qo'shadi.
 * Yorliqda kletchatka ko'rsatilmagan bo'lsa — «fib» qo'yilmaydi (noma'lum, 0 emas). Allaqachon «fib» bor yozuvlar qayta so'ralmaydi (--hammasi — hammasini).
 * Ishlatish:  node tools/yorliq-kletchatka.js [--hammasi]      (OFF API: 1 so'rov / 1,5 s) */
'use strict';
const fs = require('fs'), path = require('path'), P = path.join(__dirname, '..', 'data', 'manba', 'yorliq.json');
const j = JSON.parse(fs.readFileSync(P, 'utf8')), all = process.argv.includes('--hammasi'), sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  let n = 0, bor = 0, yoq = 0, xato = 0;
  for (const [key, y] of Object.entries(j.yorliq)) {
    if (!y.code || (!all && (y.fib != null || y.fibYoq))) continue; n++;
    let ok = false;
    for (let t = 0; t < 3 && !ok; t++) {
      try { const r = await fetch('https://world.openfoodfacts.org/api/v2/product/' + y.code + '?fields=nutriments', { headers: { 'User-Agent': 'KalkiFitBaza/1.0' } });
        const d = await r.json(); const v = d && d.product && d.product.nutriments ? d.product.nutriments.fiber_100g : undefined; ok = true;
        if (v != null && isFinite(+v)) { y.fib = Math.round(+v * 10) / 10; delete y.fibYoq; bor++; } else { delete y.fib; y.fibYoq = 1; yoq++; } }
      catch (e) { await sleep(4000); }
    }
    if (!ok) xato++; await sleep(1500);
  }
  fs.writeFileSync(P, JSON.stringify(j, null, 1) + '\n');
  console.log('so\'raldi:', n, '| kletchatka bor:', bor, '| yorliqda yo\'q:', yoq, '| xato:', xato);
})();
