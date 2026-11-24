/* kalki.uz — KalkiFit KLETCHATKA (v102): har bir taomga fb (g/100 g) va fbs (manba) qo'yadi. tools/ovqatlar-build.js oxirida chaqiriladi.
 * Manba tartibi (birinchi topilgani):
 *   1) kengaytma qatori: u:<fdc> (USDA «Fiber, total dietary»), y:<yorliq> (Open Food Facts fiber_100g), m: aralashma / retsept-hisob (masalliqlardan, gramm bo'yicha);
 *   2) baza retsepti (rc, data/baza-retseptlar.json) — masalliqlarning USDA kletchatkasi va yield (tools/baza-hisob.js kletchatka());
 *   3) «USDA FDC <id>» manbali oddiy mahsulot; 4) baza-oddiy.json dagi tekshirilgan USDA juftligi; 5) v78 aralashma hisobi (tools/baza-manba-v78.js);
 *   6) oddiy mahsulot — bir xil USDA yozuvi (tools/kletchatka-usda.js, faqat kletchatka olinadi);
 *   7) tarkibi bo'yicha 0: faqat hayvon mahsuloti / sof yog' / shakar / suv, choy, qahva, gazli ichimlik (o'simlik qismi yo'q).
 * Topilmasa — fb: null (NOMA'LUM, 0 emas). Oilalar: har kombinatsiyaga fam.g[v].fb. Скурихин masalliqlari: o'simliklar — USDA analogi, hayvon/yog' — 0, qolgani noma'lum.
 * fbs: 'u' USDA · 'y' yorliq · 'r' retsept/aralashma hisobi · 't' tarkibi bo'yicha 0. */
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..'), RD = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const R1 = (x) => Math.round(x * 10) / 10;
function qoy(foods) {
  const U = RD('data/manba/usda-sr-legacy.json').foods, YQ = RD('data/manba/yorliq.json').yorliq, OD = RD('data/baza-oddiy.json').oddiy, FAM = RD('data/baza-oilalar.json');
  const KU = require('./kletchatka-usda.js'), H = require('./baza-hisob.js'), RH = require('./retsept-hisob.js'), RA = RH.all(), V78 = require('./baza-manba-v78.js');
  const SKF = { qoy: 0, mol: 0, ot: 0, dumba: 0, yog: 0, suluguni: 0, tvorog9: 0, kartoshka: 'u:170026', piyoz: 'u:170000', sabzi: 'u:170393', pomidor: 'u:170457', un: 'u:168894' };          // Скурихин: hayvon/yog' — 0, o'simlik — USDA analogi
  const tok = (t) => { if (t === 'suv') return 0; let m = /^(?:u:)?(\d+)$/.exec(t); if (m) { const x = U[m[1]]; return x && x.fib != null ? x.fib : null; }
    m = /^y:(.+)$/.exec(t); if (m) { const x = YQ[m[1]]; return x && x.fib != null ? x.fib : null; }
    m = /^s:(.+)$/.exec(t); if (m) { const v = SKF[m[1]]; return v == null ? null : (typeof v === 'number' ? v : tok(v)); } return null; };
  const mix = (src) => { const ps = src.split('+').map((x) => { const i = x.lastIndexOf('*'); return { t: x.slice(0, i), g: +x.slice(i + 1) }; }); let s = 0, G = 0;
    for (const p of ps) { const v = tok(p.t); if (v == null) return null; s += v * p.g; G += p.g; } return G > 0 ? R1(s / G) : null; };
  const recipe = (rec) => { let s = 0, sum = 0; for (const [t, g] of rec.mas) { const v = tok(t); if (v == null) return null; s += v * +g / 100; sum += +g; } const out = rec.chiqish > 0 ? rec.chiqish : sum; return R1(s / out * 100); };
  /* kengaytma qatorlari: id → manba */
  const files = ['ovqatlar-kengaytma.js', 'ovqatlar-turk.js', 'ovqatlar-kengaytma2.js', 'ovqatlar-kengaytma3.js', 'ovqatlar-kengaytma4.js', 'ovqatlar-kengaytma5.js', 'ovqatlar-kengaytma6.js', 'ovqatlar-kengaytma7.js', 'ovqatlar-kengaytma8a.js', 'ovqatlar-kengaytma8b.js', 'ovqatlar-kengaytma8c.js'].filter((f) => fs.existsSync(path.join(__dirname, f)));
  const SRC = {}; for (const f of files) for (const r of require('./' + f)) SRC[r[0]] = r[6];
  const ZERO = (f) => { const s = (f.i + ' ' + f.n + ' ' + f.r).toLowerCase();
    if (/(meva|mevali|qulupnay|shokolad|asal bilan|vanil|massa|salat|zigir|granola|suli|non|xamir|panir|kotlet|tefteli|zrazy|rulet|sous|sabzavot|kartosh|guruch|loviya|qo'ziqorin|qoziqorin|ananas|olma|tort|pechen|pirog|piroj|kompot|sharbat|smuzi|kakao|shokolad|nektar|kvas|matcha|zanjabil|mohito|limon|yalpiz|kokos|bodom|soya|ovsyan|овся|фрукт|ягод|шокол|овощ|хлеб)/.test(s)) return false;
    if (f.t === 'm' && !/(kolbasa|sosiska|vetchina|pashtet|konserva|krab|tushonka|dimlangan|grill|befstrog|chaxox|otbivnoy|hotdog|kabob-bolak)/.test(s)) return true;          // sof go'sht, baliq, tuxum
    if (f.t === 's' && /^(sut|kefir|qatiq|tvorog|smetana|qaymoq|sariyog|pishloq|suzma|qurt|ayron|ryajenka|prostokvasha|yogurt-(tabiiy|kam|yogsiz|yunon)|labne|echki-suti|mozzarella|motsarella|brinza|krem-pishloq|president-(smetana|pishloq|brinza)|domik-qaymoq|valio-yogurt)/.test(f.i)) return true;
    if (f.t === 'i' && /^ryajenka/.test(f.i)) return true;
    if (/^(protein-(kukun|izolyat|kazein)|aminokislota|karamel|chupa-chups|roshen-karamel|fuze-tea|lipton-ice-tea)$/.test(f.i)) return true;          // sof oqsil kukuni, aminokislota, shakar karameli, shirin choy
    if (/^(yog|zaytun-yogi|kunjut-yogi|kokos-yogi|sariyog|dumba|shakar|navvot|asal)$|-yogi$/.test(f.i)) return true;
    if (f.t === 'i' && /^(suv|gazli-suv|kola|coca-cola|pepsi|fanta|sprite|mirinda|limonad$|limonad-limon|gazli-limonad|apelsin-gazli|energetik|red-bull|monster|burn|adrenaline|flash-up|gorilla|sport-izotonik|choy|choy-shakar|choy-sut|yashil-choy|kok-choy|jasmin-choy|tr-choy|kofe|espresso|amerikano|qahva|tr-qahva|latte|kapuchino|flet|aroq|konyak|vino|pivo|tarxun|sutli-choy|shirchoy)/.test(f.i)) return true;
    return false; };
  const set = (f, v, s) => { f.fb = v == null ? null : R1(v); if (v == null) delete f.fbs; else f.fbs = s; };
  const idx = Object.fromEntries(foods.map((f) => [f.i, f]));
  for (const f of foods) {
    let v = null, s = null; const src = SRC[f.i], m = String(f.m || '');
    if (src != null) { if (RA[f.i]) { v = recipe(RA[f.i]); s = 'r'; } else if (/^u:\d+$/.test(src)) { v = tok(src); s = 'u'; } else if (/^y:/.test(src)) { v = tok(src); s = 'y'; } else if (/^s:/.test(src)) { v = tok(src); s = 'r'; } else if (/^m:/.test(src)) { v = mix(src.slice(2)); s = 'r'; } }
    if (v == null && f.rc) { v = H.kletchatka(f.rc); s = 'r'; }
    if (v == null) { const u = /^USDA FDC (\d+)/.exec(m); if (u) { v = tok('u:' + u[1]); s = 'u'; } }
    if (v == null && OD[f.i] && OD[f.i].usda && f.tk) { v = tok('u:' + OD[f.i].usda); s = 'u'; }
    if (v == null && V78[f.i]) { v = mix(V78[f.i]); s = 'r'; }
    if (v == null && KU[f.i]) { v = tok('u:' + KU[f.i]); s = 'u'; }          // oddiy mahsulot: bir xil USDA yozuvi (faqat kletchatka)
    if (v == null) { const ids = [...new Set((m.match(/USDA (?:FDC )?(\d{6})/g) || []).map((x) => x.replace(/\D/g, '')))]; if (ids.length === 1 && !/[+]/.test(m.replace(/calorizator/, ''))) { v = tok('u:' + ids[0]); s = 'u'; } }
    if (v == null && ZERO(f)) { v = 0; s = 't'; }
    set(f, v, s);
  }
  /* oilalar: har kombinatsiya */
  for (const d of FAM.oilalar) { const base = idx[d.id]; if (!base || !base.fam) continue;
    for (const c of d.grid) { const g = base.fam.g[c.v]; if (!g) continue; let v = null;
      if (c.rc) v = H.kletchatka(c.rc); if (v == null && c.from && idx[c.from]) v = idx[c.from].fb; g.fb = v == null ? null : R1(v); }
    const defV = d.axes.map((a) => a.d).join('.'); const dg = base.fam.g[defV]; if (dg) { base.fb = dg.fb; if (dg.fb == null) delete base.fbs; else base.fbs = base.fbs || 'r'; } }
  const st = { jami: foods.length, manbali: foods.filter((f) => f.fb != null).length, nomalum: foods.filter((f) => f.fb == null).length, u: 0, y: 0, r: 0, t: 0 };
  foods.forEach((f) => { if (f.fbs) st[f.fbs]++; }); return st;
}
module.exports = { qoy };
