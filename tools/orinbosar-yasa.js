#!/usr/bin/env node
/* kalki.uz — data/orinbosar.json yasovchi: qizil go'shtli va yog'i ko'p taomlar uchun oqsilga boy o'rinbosar NOMZODLARI.
 * Tartib: avval o'sha oila (osh → tovuqli osh, somsa → tovuqli somsa, shashlik → tovuq shashlik, kabob → tovuq soni), keyin umumiy (baliq, tuxum, dukkak).
 * Nomzod jadvalga tushishi uchun qoida (assets/orinbosar-core.js passes): oqsil ≥ asl×0.90 VA (yog' yoki kkal ≤ asl×0.85) VA farq sezilarli (|kkal| ≥ 40 yoki |yog'| ≥ 5 g); shu taomning kamida bitta kombinatsiyasi uchun bajarilsin.
 * Har manbaga ≤4 nomzod (har xil oqsil manbai birinchi navbatda), ilovada eng ko'pi 3 ta ko'rsatiladi.   node tools/orinbosar-yasa.js [--yoz] */
'use strict';
const fs = require('fs'), path = require('path');
const O = require('../assets/orinbosar-core.js');
const J = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'ovqatlar.json'), 'utf8')), TG = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'oqsil-manba.json'), 'utf8'));
const by = O.index(J.foods), A = (i, x) => Object.assign({ i }, x || {});
const TABAQ = [A('baliq-dimlama'), A('qoymoq'), A('noxat-ragu')];                                      // likop/kosa turidagi taomlar uchun umumiy: baliq, dukkak, tuxum
const KABOB = [A('shashlik', { v: 'tovuq' }), A('tovuq-son'), A('sazan-grill'), A('tovuq-kokrak'), A('kurka'), A('omlet-sabzavot'), A('noxat-ragu')];
const QOZON = [A('tovuq-son-qozon'), A('tovuq-kokrak-qozon'), A('dimlama-tovuq'), A('baliq-dimlama'), A('noxat-ragu'), A('qoymoq')];
const SHURVA = [A('baliq-shurva'), A('loviya-shurva'), A('yasmiq-shurva'), A('moshxorda-gostsiz'), A('tovuq-shurva')];
const FAST = [A('lavash-tovuq', { v: 'tovuq' }), A('sendvich'), A('tovuq-kokrak'), A('sazan-grill'), A('omlet-sabzavot')];
const QAYTA = [A('tovuq-kokrak'), A('sazan-grill'), A('kurka'), A('omlet-sabzavot'), A('qoymoq'), A('noxat-ragu')];
const XAMIR = [A('somsa', { v: 'oddiy.tovuq' }), A('sazan-grill'), A('sendvich'), A('omlet-sabzavot'), A('noxat-ragu')];
/* manba taom → nomzodlar (oila birinchi, keyin umumiy). Kalit: oila ildizi yoki yakka taom id. */
const MANBA = {
  osh: [A('osh-tovuq')].concat(TABAQ), shovla: [A('osh-tovuq')].concat(TABAQ), 'ugra-osh': [A('osh-tovuq')].concat(TABAQ),
  somsa: [A('somsa', { set: { ichi: 'tovuq' } }), A('chuchvara', { v: 'tovuq.qaynatma' })].concat(XAMIR), manti: [A('chuchvara', { v: 'tovuq.qaynatma' }), A('somsa', { v: 'oddiy.tovuq' }), A('tovuq-kokrak'), A('sazan-grill'), A('omlet-sabzavot')],
  chuchvara: [A('chuchvara', { set: { ichi: 'tovuq' } }), A('somsa', { v: 'oddiy.tovuq' })].concat(TABAQ), lagmon: [A('lagmon', { set: { gosht: 'tovuq' } }), A('baliq-shurva'), A('loviya-shurva'), A('noxat-ragu')],
  norin: [A('tovuq-kokrak-qozon')].concat(TABAQ), chebureki: XAMIR, belyashi: XAMIR,
  shurva: SHURVA, mastava: SHURVA, dimlama: [A('dimlama-tovuq')].concat(TABAQ), 'qozon-kabob': QOZON, qovurdoq: QOZON, jarkop: QOZON, dolma: [A('tovuq-kokrak-qozon')].concat(TABAQ),
  shashlik: [A('shashlik', { set: { gosht: 'tovuq' } }), A('sazan-grill'), A('tovuq-son'), A('tovuq-kokrak'), A('omlet-sabzavot'), A('noxat-ragu')],
  'jigar-kabob': KABOB, lyulya: KABOB, 'tandir-gosht': KABOB, qazi: KABOB, jiz: KABOB, beshbarmoq: [A('tovuq-kokrak-qozon')].concat(TABAQ), 'mol-gosht': KABOB, 'mol-qiyma': KABOB, 'qoy-gosht': KABOB, 'ot-gosht': KABOB, jigar: KABOB, steyk: KABOB, kotlet: KABOB,
  doner: FAST, burger: FAST, hotdog: FAST, tushonka: QAYTA, kolbasa: QAYTA, sosiska: QAYTA, bekon: QAYTA, olivye: [A('qatiq-salat'), A('suzma-salat'), A('qoymoq'), A('omlet-sabzavot')],
  'tovuq-qanot': QAYTA, 'tovuq-qov': QAYTA, naggets: QAYTA
};
function variantlar(id) { const f = by[id]; return f.fam ? Object.keys(f.fam.g).map((v) => id + '#' + v) : [id]; }
function yasa() {
  const out = {}, hisobot = [];
  for (const [src, list] of Object.entries(MANBA)) {
    if (!by[src]) throw new Error('manba taom yo\'q: ' + src);
    const ok = [];
    for (const alt of list) {
      if (!by[alt.i]) throw new Error('nomzod yo\'q: ' + alt.i);
      const kamida = variantlar(src).some((sk) => { const k = O.altKey(by, sk, alt); if (!k || k === sk) return false; const c = O.compare(by, sk, k); return c && c.ok; });
      if (kamida) ok.push(alt);
    }
    /* har xil oqsil manbai birinchi navbatda, keyin qolganlari (tartib saqlanadi); eng ko'pi 4 */
    const tegOf = (alt) => O.tegOf(TG, O.altKey(by, variantlar(src)[0], alt) || alt.i), used = new Set(), first = [], rest = [];
    for (const alt of ok) { const t = tegOf(alt); if (!used.has(t)) { used.add(t); first.push(alt); } else rest.push(alt); }
    const pick = first.concat(rest).slice(0, 4), ordered = ok.filter((a) => pick.includes(a));
    if (ordered.length) out[src] = ordered; hisobot.push([src, ordered.length]);       // nomzodsiz taom jadvalga tushmaydi (qoidaga javob beradigan o'rinbosar yo'q)
  }
  return { out, hisobot };
}
if (require.main === module) {
  const { out, hisobot } = yasa();
  console.log('manba taomlar:', hisobot.length, '| nomzodsiz:', hisobot.filter((h) => !h[1]).map((h) => h[0]).join(', ') || '—', '| 1 ta:', hisobot.filter((h) => h[1] === 1).map((h) => h[0]).join(', ') || '—');
  if (process.argv.includes('--yoz')) {
    const j = { v: 1, izoh: 'O\'rinbosar nomzodlari (tools/orinbosar-yasa.js yasaydi, qo\'lda tahrir qilinmaydi). Ilova har safar assets/orinbosar-core.js qoidasi bilan filtrlaydi: oqsil ≥ asl×0.90 VA (yog\' yoki kkal ≤ asl×0.85) VA farq sezilarli; eng ko\'pi 3 (1 asosiy + 2 «Boshqa variantlar»). Nomzod: {i} | {i,v: kombinatsiya} | {i,set:{o\'q:qiymat}} (shu oila, boshqa o\'qlar saqlanadi).', qoida: Object.assign({ max: O.MAX }, O.QOIDA), manba: out };
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'orinbosar.json'), JSON.stringify(j, null, 1) + '\n'); console.log('data/orinbosar.json yozildi');
  }
}
module.exports = { yasa, MANBA };
