#!/usr/bin/env node
/* kalki.uz — data/uyda-pp.json ni tools/uyda-pp-manba.js dan yasaydi (qo'lda tahrir qilinmaydi). Tekshiradi: har ingredient bazada bor; har ingredient «Uyda nima bor?» guruhiga yoki oddiy mahsulotlarga tegishli;
 * qadamlar UZ/RU teng; cho'chqa tegi yo'q. Kkal/BJU YOZILMAYDI — ilovada bazadan hisoblanadi (assets/uyda-pp-core.js).   node tools/uyda-pp-yasa.js [--yoz]   (yozmasa — faqat tekshiradi) */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), { R } = require('./uyda-pp-manba.js');
const foods = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods, by = {}; foods.forEach((f) => { by[f.i] = f; });
const chk = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cheklov-teglar.json'), 'utf8'));
/* «Uyda nima bor?» — tez-tez ishlatiladigan mahsulotlar (chip). ids — shu guruhga kiradigan baza taomlari */
const G = [
  ['tuxum', "Tuxum", 'Яйца', 'tuxum tuxum-xom tuxum-qov-yogsiz'], ['tvorog', 'Tvorog', 'Творог', 'tvorog5'], ['yogurt', 'Yogurt', 'Йогурт', 'yogurt-yunon yogurt-tabiiy'],
  ['sut', "Sut, kefir", 'Молоко, кефир', 'sut sut-yogsiz kefir'], ['lavash', 'Lavash, non', 'Лаваш, хлеб', 'lavash-non tortilya non-bugdoy non-pita'], ['tovuq', 'Tovuq', 'Курица', 'tovuq-kokrak tovuq-kokrak-duxovka kurka-qiyma'],
  ['gosht', "Go'sht", 'Мясо', 'mol-qiyma mol-qaynatilgan'], ['baliq', 'Baliq, tunets', 'Рыба, тунец', 'treska losos krevetka tunets-suv'], ['grechka', 'Grechka', 'Гречка', 'grechka'],
  ['yasmiq', "Yasmiq, mosh, loviya", 'Чечевица, маш, фасоль', 'yasmiq mosh noxat loviya'], ['suli', 'Suli', 'Овсянка', 'suli-xom suli-quruq'], ['guruch', "Guruch, makaron", 'Рис, макароны', 'guruch guruch-xom bulgur makaron-pishgan2'],
  ['kartoshka', 'Kartoshka', 'Картофель', 'kartoshka kartoshka-xom'], ['banan', 'Banan', 'Банан', 'banan'], ['meva', 'Meva', 'Фрукты', 'olma qulupnay malina avokado quruq-orik'],
  ['sabzavot', 'Sabzavot', 'Овощи', 'pomidor bodring sabzi piyoz qalampir ismaloq brokkoli qovoqcha baqlajon gulkaram salat-barg kok-piyoz kokat sarimsoq karam qovoq'],
  ['pishloq', 'Pishloq', 'Сыр', 'pishloq'], ['yongoq', "Yong'oq", 'Орехи', 'yongoq bodom'], ['protein', 'Protein', 'Протеин', 'protein-kukun']
].map((x) => ({ k: x[0], n: { uz: x[1], ru: x[2] }, ids: x[3].split(' ') }));
const ODDIY = 'suv yog zaytun-yogi asal limon un sariyog'.split(' ');          // uyda har doim bor deb hisoblanadi (hisobga olinmaydi)
const GR = new Set(['tayyorsiz', 'tez', 'pishirsa']), errs = [], out = [], seen = new Set();
const grpOf = {}; G.forEach((g) => g.ids.forEach((i) => { if (grpOf[i]) errs.push('ikki guruhda: ' + i); grpOf[i] = g.k; }));
R.trim().split(/\n\s*\n/).forEach((blk) => {
  const L = blk.trim().split('\n'), h = L[0].split('|'); if (h.length !== 6) { errs.push('sarlavha: ' + L[0]); return; }
  const [id, t, min, meals, nu, nr] = h, ing = (L.find((x) => x.startsWith('ing:')) || '').slice(4).split(',').map((s) => s.trim()).filter(Boolean).map((s) => { const a = s.split(':'); const r = [a[0], +a[1]]; if (a[2] || a[3]) r.push(a[2] ? +a[2] : 0); if (a[3]) r.push(a[3]); return r; });
  const su = (L.find((x) => x.startsWith('uz:')) || '').slice(3).split(' / ').map((s) => s.trim()).filter(Boolean), sr = (L.find((x) => x.startsWith('ru:')) || '').slice(3).split(' / ').map((s) => s.trim()).filter(Boolean);
  if (seen.has(id)) errs.push('takror id: ' + id); seen.add(id); if (!GR.has(t)) errs.push(id + ': guruh ' + t);
  if (!/^[bkld]*$/.test(meals.replace(/s/g, '')) || !meals) errs.push(id + ': ovqat turi ' + meals);
  if (!(+min > 0)) errs.push(id + ': daqiqa'); if (t === 'tayyorsiz' && +min > 5) errs.push(id + ': tayyorsiz ≤5 daq'); if (t === 'tez' && (+min < 10 || +min > 15)) errs.push(id + ': tez 10–15 daq'); if (t === 'pishirsa' && (+min < 25 || +min > 45)) errs.push(id + ': pishirsa 25–45 daq');
  if (!ing.length) errs.push(id + ': tarkib yo\'q');
  ing.forEach((r) => { const f = by[r[0]]; if (!f) { errs.push(id + ': bazada yo\'q ' + r[0]); return; } if (!(r[1] > 0)) errs.push(id + ': gramm ' + r[0]); if (!grpOf[r[0]] && ODDIY.indexOf(r[0]) < 0) errs.push(id + ': guruhsiz ingredient ' + r[0]); if (r[3] && !(f.fam && f.fam.g[r[3]])) errs.push(id + ': variant ' + r[0] + '#' + r[3]); if ((chk.taom[r[0]] || []).indexOf('choshqa') > -1) errs.push(id + ': cho\'chqa ' + r[0]); });
  if (su.length < 3 || su.length > 4 || sr.length !== su.length) errs.push(id + ': qadamlar UZ ' + su.length + ' / RU ' + sr.length);
  out.push({ id, t, min: +min, m: meals, n: { uz: nu.trim(), ru: nr.trim() }, ing, qad: { uz: su, ru: sr } });
});
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
const n = {}; out.forEach((r) => { n[r.t] = (n[r.t] || 0) + 1; });
console.log('retseptlar: ' + out.length + ' ' + JSON.stringify(n));
if (process.argv.includes('--yoz')) { fs.writeFileSync(path.join(ROOT, 'data/uyda-pp.json'), JSON.stringify({ v: 1, izoh: "Uyda PP retseptlari (tools/uyda-pp-yasa.js yasaydi, qo'lda tahrir qilinmaydi). Kkal/BJU yo'q: tarkibdan bazadagi qiymatlar bo'yicha hisoblanadi (assets/uyda-pp-core.js).", oddiy: ODDIY, guruhlar: G, retseptlar: out }, null, 1) + '\n'); console.log('data/uyda-pp.json yozildi'); }
