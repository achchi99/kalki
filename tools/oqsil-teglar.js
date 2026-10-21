#!/usr/bin/env node
/* kalki.uz — «Oqsil manbasi» teglari: data/ovqatlar.json dagi har taom (va oila kombinatsiyasi) uchun asosiy oqsil manbai.
 * Teglar: qizil (mol/qo'y/ot go'shti) · tovuq · baliq · tuxum · sut · dukkak · aralash · yoq.
 * Retseptli taomlar — retsept masalliqlaridagi oqsil grammidan AVTOMATIK (USDA/Скурихин qiymati bilan): hayvon/dukkak oqsili butun oqsilning ≥30% bo'lsa
 * va bitta manba ≥60% bo'lsa — shu manba; ≥2 manba aralash bo'lsa — aralash; aks holda yoq. Retseptsiz taomlar — pastdagi QOLDA jadval (id → teg), qolganlari tur (t) bo'yicha.
 * Natija: data/oqsil-manba.json (kalit: «id» yoki oila kombinatsiyasi uchun «id#kombinatsiya»).   node tools/oqsil-teglar.js [--yoz]   (--yoz bo'lmasa — faqat jadval) */
'use strict';
const fs = require('fs'), path = require('path');
const R = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const TEGLAR = ['qizil', 'tovuq', 'baliq', 'tuxum', 'sut', 'dukkak', 'aralash', 'yoq'];
const MASALLIQ_TEG = { mol: 'qizil', mol_yogsiz: 'qizil', qoy: 'qizil', qoy_yogsiz: 'qizil', dumba: 'qizil', tovuq_kokrak: 'tovuq', tovuq_son: 'tovuq', tovuq_son_teriz: 'tovuq', sazan: 'baliq', losos: 'baliq', qoy_pishgan: 'qizil', mol_pishgan: 'qizil', jigar: 'qizil', qoy_qovurga: 'qizil', tovuq_qanot: 'tovuq', tovuq_teri: 'tovuq', sosiska_mol: 'qizil', kolbasa_mol: 'qizil', tushonka_mol: 'qizil', sosiska_tovuq: 'tovuq', tuxum: 'tuxum', qatiq: 'sut', sut: 'sut', suzma: 'sut', sut_0: 'sut', sut_1: 'sut', sut_2: 'sut', qaymoq_yarim: 'sut', qaymoq_yengil: 'sut', smetana_20: 'sut', smetana_12: 'sut', kefir_1: 'sut', protein_whey: 'sut', mosh: 'dukkak', noxat: 'dukkak', loviya_oq: 'dukkak', yasmiq: 'dukkak' };
/* Retseptsiz taomlar (id → teg). Qolgani: tur bo'yicha (pastda TUR). */
const QOLDA = {
  'yengil-osh': 'tovuq', 'somsa-qat': 'qizil', 'somsa-qovoq': 'yoq', 'chuchvara-sho': 'qizil', 'lagmon-qov': 'qizil', shashlik: 'qizil', 'shashlik-tovuq': 'tovuq', 'jigar-kabob': 'qizil', lyulya: 'qizil', 'tandir-gosht': 'qizil', qazi: 'qizil',
  sumalak: 'yoq', halim: 'aralash', xonim: 'aralash', 'tuxum-qov': 'tuxum', omlet: 'tuxum', olivye: 'aralash', 'dolma-uzum': 'qizil', jiz: 'qizil', beshbarmoq: 'qizil', 'tovuq-shurva': 'tovuq', borsch: 'aralash', 'qaynatma-baliq': 'baliq',
  'tushonka': 'aralash', kolbasa: 'aralash', sosiska: 'aralash', bekon: 'aralash', 'mol-gosht': 'qizil', 'mol-qiyma': 'qizil', 'qoy-gosht': 'qizil', 'ot-gosht': 'qizil', jigar: 'qizil', steyk: 'qizil', kotlet: 'qizil',
  'tovuq-kokrak': 'tovuq', 'tovuq-son': 'tovuq', 'tovuq-qanot': 'tovuq', 'tovuq-qov': 'tovuq', kurka: 'tovuq', 'tovuq-jigar': 'tovuq', tuxum: 'tuxum', 'tuxum-xom': 'tuxum',
  losos: 'baliq', tunets: 'baliq', treska: 'baliq', 'baliq-qov': 'baliq', krevetka: 'baliq', sardina: 'baliq',
  mosh: 'dukkak', noxat: 'dukkak', loviya: 'dukkak', yasmiq: 'dukkak', 'yashil-loviya': 'dukkak', 'yashil-noxat': 'dukkak', xummus: 'dukkak', tofu: 'dukkak', 'protein-bar': 'aralash', 'protein-kukun': 'sut', 'protein-izolyat': 'sut', 'protein-kazein': 'sut', aminokislota: 'yoq',
  sariyog: 'yoq', qaymoq: 'yoq', 'sut-kokteyl': 'sut', kakao: 'sut',
  'lavash-tovuq': 'tovuq', 'lavash-mol': 'qizil', doner: 'qizil', burger: 'qizil', 'burger-katta': 'qizil', hotdog: 'aralash', pitsa: 'aralash', 'pitsa-pepperoni': 'aralash', 'pitsa-4': 'sut', chebureki: 'qizil', belyashi: 'qizil',
  naggets: 'tovuq', sendvich: 'tovuq', pelmeni: 'aralash', vareniki: 'yoq', blin: 'yoq', sirniki: 'sut', 'lavash-roll': 'tovuq', sgushyonka: 'sut', chizkeyk: 'sut', sirok: 'sut', 'muzqaymoq-eskimo': 'yoq', pirojki: 'yoq'
};
const TUR = { s: 'sut' };           // sut mahsulotlari (qolda ro'yxatdan tashqari) — sut; boshqa turlar (don, sabzavot, meva, shirinlik, ichimlik...) — yoq
function recTeg(rec, mas, usda) {
  const by = {}; let tot = 0;
  for (const l of rec.ingr) {
    const m = mas[l.m]; if (!m || !m.usda) continue; const u = usda.foods[String(m.usda)]; const p = u.p * l.g / 100; tot += p;
    const t = MASALLIQ_TEG[l.m]; if (t) by[t] = (by[t] || 0) + p;
  }
  const an = Object.values(by).reduce((a, b) => a + b, 0);
  if (!(tot > 0) || an / tot < 0.30) return { teg: 'yoq', by, tot };
  const top = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
  return { teg: top[1] / an >= 0.60 ? top[0] : 'aralash', by, tot };
}
function hammasi() {
  const foods = R('data/ovqatlar.json').foods, rets = Object.fromEntries(R('data/baza-retseptlar.json').retseptlar.map((r) => [r.id, r])), mas = R('data/baza-masalliq.json').masalliq, usda = R('data/manba/usda-sr-legacy.json');
  const out = {}, nega = {};
  Object.assign(QOLDA, require('./ovqatlar-kengaytma.js').OQSIL);         // kengaytma taomlari (tools/ovqatlar-kengaytma.js)
  const own = (f) => { if (f.rc && rets[f.rc]) { const r = recTeg(rets[f.rc], mas, usda); nega[f.i] = 'retsept ' + f.rc; return r.teg; } if (QOLDA[f.i]) { nega[f.i] = 'qo\'lda'; return QOLDA[f.i]; } nega[f.i] = 'tur ' + f.t; return TUR[f.t] || 'yoq'; };
  for (const f of foods) {
    out[f.i] = own(f);
    if (f.fam) for (const [v, g] of Object.entries(f.fam.g)) {
      const k = f.i + '#' + v;
      if (g.rc && rets[g.rc]) { out[k] = recTeg(rets[g.rc], mas, usda).teg; nega[k] = 'retsept ' + g.rc; } else { out[k] = QOLDA[f.i + '#' + v] || out[f.i]; nega[k] = 'oila'; }
    }
  }
  /* oila kombinatsiyasi retseptsiz («from»): asl taomning tegi */
  const FROM = { 'shashlik#gosht': 'qizil', 'shashlik#tovuq': 'tovuq', 'lavash-tovuq#tovuq': 'tovuq', 'lavash-tovuq#mol': 'qizil' };
  Object.assign(out, FROM);
  /* oila ildizining tegi = standart kombinatsiyaniki */
  for (const f of foods) if (f.fam) { const dk = f.fam.ax.map((a) => a.d).join('.'); if (out[f.i + '#' + dk]) out[f.i] = out[f.i + '#' + dk]; else if (f.fam.g[dk] === undefined && out[f.i + '#' + Object.keys(f.fam.g)[0]]) out[f.i] = out[f.i + '#' + Object.keys(f.fam.g)[0]]; }
  return { out, nega, foods };
}
if (require.main === module) {
  const { out, foods } = hammasi(), keys = Object.keys(out).sort();
  const cnt = (pred) => TEGLAR.map((t) => [t, keys.filter((k) => pred(k) && out[k] === t).length]);
  const vis = foods.filter((f) => !f.h).map((f) => f.i);
  console.log('Ko\'rinadigan taomlar (' + vis.length + '):', JSON.stringify(Object.fromEntries(TEGLAR.map((t) => [t, vis.filter((i) => out[i] === t).length]))));
  console.log('Oila kombinatsiyalari bilan (' + keys.length + '):', JSON.stringify(Object.fromEntries(cnt(() => true))));
  if (process.argv.includes('--yoz')) {
    const j = { v: 1, izoh: 'Oqsil manbasi teglari (tools/oqsil-teglar.js yasaydi, qo\'lda tahrir qilinmaydi). Kalit: taom id yoki oila kombinatsiyasi «id#kombinatsiya». qizil — mol/qo\'y/ot go\'shti; aralash — bir necha manba; yoq — sezilarli oqsil manbai yo\'q.', teglar: TEGLAR, taom: Object.fromEntries(keys.map((k) => [k, out[k]])) };
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'oqsil-manba.json'), JSON.stringify(j, null, 1) + '\n'); console.log('data/oqsil-manba.json yozildi');
  }
}
module.exports = { hammasi, TEGLAR, QOLDA, MASALLIQ_TEG };
