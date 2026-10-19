#!/usr/bin/env node
/* kalki.uz — «Yemaydiganlarim»: har taom (va oila kombinatsiyasi) uchun cheklov teglari.
 * Teglar: baliq (baliq va dengiz mahsuloti) · tuxum · sut (sut mahsulotlari) · yongoq (yong'oq, yerfistiq) · glyuten (bug'doy/arpa/javdar/suli, ehtiyotkorlik bilan) · choshqa (cho'chqa go'shti yoki ehtimoliy: kolbasa, bekon, jelatin…).
 * Retseptli taomlar — retsept masalliqlaridan AVTOMATIK (MASALLIQ_TEG); retseptsiz taomlar — pastdagi QO'LDA ro'yxat (QOLDA). Shubhali bo'lsa teg QO'YILADI (ehtiyotkor tomon: cheklovi borga tavsiya chiqmaydi).
 * Standart cheklov: HALOL — «choshqa» tegi bor taom tavsiya qilinmaydi (qidiruv va yozishga tegmaydi). Natija: data/cheklov-teglar.json (kalit: id yoki «id#kombinatsiya»).   node tools/cheklov-teglar.js [--yoz] */
'use strict';
const fs = require('fs'), path = require('path');
const R = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const TEGLAR = ['baliq', 'tuxum', 'sut', 'yongoq', 'glyuten', 'choshqa'];
const MASALLIQ_TEG = { un: ['glyuten'], tuxum: ['tuxum'], sut: ['sut'], qatiq: ['sut'], suzma: ['sut'], sariyog: ['sut'], sazan: ['baliq'], losos: ['baliq'], bulka: ['glyuten'] };
const L = (s) => s.split(/\s+/).filter(Boolean);
const QOLDA = {
  baliq: L('losos tunets treska baliq-qov krevetka sardina qaynatma-baliq'),
  tuxum: L('tuxum tuxum-xom tuxum-qov omlet olivye mayonez blin sirniki naggets kotlet belyashi pelmeni vareniki keks tort napoleon medovik chizkeyk pirog-olma ekler brauni vafli pechenye bulochka kruassan donut chakchak boglirsoq pirojki paxlava protein-bar'),
  sut: L('sut sut-yogsiz qatiq qatiq-yogsiz suzma qurt ayron kefir qaymoq smetana pishloq pishloq-yumshoq tvorog5 tvorog9 sariyog yogurt-meva yogurt-tabiiy muzqaymoq muzqaymoq-eskimo krem-pishloq motsarella sut-kokteyl kakao choy-sut latte kapuchino kofe-3in1 manka sgushyonka shokolad-sut sirok nutella sirniki tort napoleon medovik chizkeyk ekler brauni keks vafli pechenye blin kartoshka-pyure omlet pitsa pitsa-pepperoni pitsa-4 bulochka kruassan donut protein-bar konfet boglirsoq paxlava'),
  yongoq: L('yongoq bodom pista funduk yerfistiq nutella granola protein-bar paxlava brauni konfet'),
  glyuten: L('patir qatlama non-oq non-qora lavash-non baget bulochka kruassan pirojki makaron makaron-xom manka suli suli-xom kornfleks granola kraker suxari tost pitsa pitsa-pepperoni pitsa-4 pelmeni vareniki blin sirniki chebureki belyashi donut keks tort napoleon medovik pirog-olma ekler brauni chizkeyk vafli pechenye chakchak paxlava boglirsoq burger burger-katta hotdog lavash-tovuq lavash-mol lavash-roll doner sendvich naggets tovuq-qov kotlet kolbasa sosiska pivo kvas soya-sous xonim halim sumalak protein-bar somsa-qat somsa-qovoq chuchvara-sho lagmon-qov'),
  choshqa: L('bekon kolbasa sosiska tushonka hotdog pelmeni pitsa pitsa-pepperoni olivye zefir marmelad')
};
function hammasi() {
  const foods = R('data/ovqatlar.json').foods, rets = Object.fromEntries(R('data/baza-retseptlar.json').retseptlar.map((r) => [r.id, r])), by = Object.fromEntries(foods.map((f) => [f.i, f]));
  const manual = {}; for (const t of TEGLAR) for (const id of QOLDA[t]) { if (!by[id]) throw new Error('cheklov: bazada yo\'q taom ' + id + ' (' + t + ')'); (manual[id] = manual[id] || new Set()).add(t); }
  const recTeg = (rid) => { const s = new Set(); for (const l of rets[rid].ingr) (MASALLIQ_TEG[l.m] || []).forEach((t) => s.add(t)); return s; };
  const own = (f) => { const s = new Set(manual[f.i] || []); if (f.rc && rets[f.rc]) recTeg(f.rc).forEach((t) => s.add(t)); return s; };
  const out = {}, manba = {}, ord = (s) => TEGLAR.filter((t) => s.has(t));
  for (const f of foods) { const s = own(f); out[f.i] = ord(s); manba[f.i] = f.rc ? 'retsept' : (manual[f.i] ? 'qo\'lda' : 'yo\'q'); }
  for (const f of foods) if (f.fam) {
    const dk = f.fam.ax.map((a) => a.d).join('.');
    for (const [v, g] of Object.entries(f.fam.g)) {
      const k = f.i + '#' + v, s = new Set();
      if (g.rc && rets[g.rc]) recTeg(g.rc).forEach((t) => s.add(t));
      const al = foods.find((x) => x.al && x.al.f === f.i && x.al.v === v);       // yashirin alias taom (eski id) — shu kombinatsiyaning qo'lda tegi
      if (al) (manual[al.i] || []).forEach((t) => s.add(t)); else if (v === dk) (manual[f.i] || []).forEach((t) => s.add(t));
      if (!al && v !== dk && !g.rc) (manual[f.i] || []).forEach((t) => { if (!f.fam.g || true) s.add(t); });   // aliassiz kombinatsiya: ildiz tegi (ehtiyotkor tomon)
      out[k] = ord(s);
    }
    out[f.i] = out[f.i + '#' + dk] || out[f.i];
  }
  return { out, manba, foods };
}
if (require.main === module) {
  const { out, foods } = hammasi(), vis = foods.filter((f) => !f.h).map((f) => f.i), keys = Object.keys(out).sort();
  const cnt = (list) => Object.fromEntries(TEGLAR.map((t) => [t, list.filter((k) => out[k].includes(t)).length]).concat([['bo\'sh (cheklovsiz)', list.filter((k) => !out[k].length).length]]));
  console.log('Ko\'rinadigan taomlar (' + vis.length + '):', JSON.stringify(cnt(vis))); console.log('Oila kombinatsiyalari bilan (' + keys.length + '):', JSON.stringify(cnt(keys)));
  if (process.argv.includes('--yoz')) {
    const j = { v: 1, izoh: 'Yemaydiganlarim teglari (tools/cheklov-teglar.js yasaydi, qo\'lda tahrir qilinmaydi). Teglar: baliq, tuxum, sut, yongoq, glyuten, choshqa. Retseptli taomlar masalliqdan avtomatik, qolganlari qo\'lda ro\'yxatdan; shubhali bo\'lsa teg qo\'yiladi. Standart cheklov: halol (choshqa).', teglar: TEGLAR, nomlar: { baliq: { uz: 'Baliq va dengiz mahsuloti', ru: 'Рыба и морепродукты' }, tuxum: { uz: 'Tuxum', ru: 'Яйца' }, sut: { uz: 'Sut mahsulotlari', ru: 'Молочные продукты' }, yongoq: { uz: 'Yong\'oq', ru: 'Орехи' }, glyuten: { uz: 'Glyuten', ru: 'Глютен' }, choshqa: { uz: 'Cho\'chqa go\'shti', ru: 'Свинина' } }, standart: ['choshqa'], taom: Object.fromEntries(keys.map((k) => [k, out[k]])) };
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'cheklov-teglar.json'), JSON.stringify(j, null, 1) + '\n'); console.log('data/cheklov-teglar.json yozildi');
  }
}
module.exports = { hammasi, TEGLAR, QOLDA, MASALLIQ_TEG };
