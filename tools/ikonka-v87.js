#!/usr/bin/env node
/* kalki.uz — v87: yangi taomlar (tools/ovqatlar-kengaytma8a/8b/8c) uchun ikonka.
 *   (1) VAQTINCHA eng yaqin mavjud ikonka → assets/kalkifit-app.js dagi IKONKA-VAQTINCHA bloki (IMGTMP). O'z rasmi chizilgach (IKX) — u ustun turadi.
 *   (2) O'z ikonkasi rejasi → data/ikonka-reja.txt (9-guruh; tavsif — nomlardan avtomatik, chizishdan oldin ko'rib chiqing) → node tools/ikonka-toplam.js to'plamlarni yozadi.
 *   node tools/ikonka-v87.js            — yozadi (takror ishga tushirsa ham bir xil natija) */
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const rows = ['8a', '8b', '8c'].flatMap((x) => require('./ovqatlar-kengaytma' + x + '.js'));
const HAVE = new Set(fs.readdirSync(path.join(ROOT, 'assets/ovqat')).filter((x) => /-256\.webp$/.test(x)).map((x) => x.replace(/-256\.webp$/, '')));
const R = [          // [regex (id + uz nom), ikonka] — birinchi mos kelgani
  [/shirchoy|sutli-choy|masala/, 'choy-sutli'], [/muzli-choy|ays-ti|ays-matcha/, 'choy-sovuq'], [/kok-choy|matcha|jasmin/, 'kok-choy'], [/choy|karkade|namatak|moychechak|erl-grey/, 'qora-choy'],
  [/ays-latte|ays-amerikano|ays-kapuchino|frappe/, 'kofe-muzli'], [/kakao|issiq-shokolad/, 'issiq-shokolad'], [/amerikano|doppio|espresso/, 'kofe'], [/kapuchino|latte|flet|raf|mokko|kofe|qahva/, 'kofe-latte'],
  [/limonad|moxito|mohito/, 'limonad'], [/smuzi/, 'smuzi'], [/milksheyk/, 'sut-kokteyl'], [/sharbat-sabzi|sabzi-sharbat|fresh-sabzi/, 'sharbat-sabzi'], [/sharbat|fresh/, 'sharbat-meva'], [/kompot/, 'kompot'], [/ayron/, 'ayron'], [/energetik/, 'energetik'],
  [/mastava/, 'mastava'], [/moshxorda/, 'moshxorda'], [/mosh-shurva/, 'moshxorda'], [/borsh/, 'borsch'], [/lagmon/, 'lagmon'], [/lapsha|ugra/, 'shurva-lapsha'], [/pomidor-shurva/, 'shurva-pomidor'], [/qoziqorin.*(krem|shurva)/, 'shurva-qoziqorin'],
  [/yasmiq|mercimek/, 'yasmiq-shurva'], [/loviya-shurva|gorox/, 'loviya-shurva'], [/kartoshka-shurva/, 'kartoshka-shurva'], [/uxa|solyanka-baliq/, 'baliq-uxa'], [/ramen|fo-bo|tom-yam/, 'ramen'], [/atala|goja|umoch|sutli-guruch/, 'shirguruch'],
  [/okroshka/, 'salat-qatiq'], [/qovoq-krem|brokkoli-krem/, 'shurva-pomidor'], [/shurva|shchi|rassolnik|solyanka|xarcho|piyova|qaynatma|kifta|frikadel|minestrone|yayla|grechka-shurva/, 'shorva'],
  [/sezar/, 'sezar-salat'], [/olivye|mimoza|kapriz|obzhorka|tbilisi|ananas-tovuq|qoziqorin-salat|loviya-salat/, 'olivye'], [/salat|lecho|xe-baliq|kaprese/, 'salat-sabzavot'], [/koreys/, 'koreys-sabzi'],
  [/pirojki/, 'pirojki'], [/kruassan|rogalik/, 'kruassan'], [/grenki|tost|buterbrod|sendvich/, 'tost'], [/xachapuri/, 'pitsa-pishloq'], [/non|sushki|baranki|bulochka/, 'obi-non'],
  [/blin/, 'blin'], [/vareniki/, 'vareniki'], [/pasta|karbonara|alfredo|makaron/, 'spagetti'], [/guruch/, 'guruch'], [/grechka/, 'grechka'], [/kartoshka/, 'kartoshka'], [/ovsyan|suli/, 'suli-botqa'],
  [/tvorog/, 'tvorog'], [/yogurt|qatiq/, 'yogurt'], [/pishloq|ghee|sariyog/, 'pishloq-qattiq'], [/echki-suti|sut\b/, 'sut'],
  [/losos|poke|maki|sushi/, 'losos-steyk'], [/skumbriya/, 'skumbriya'], [/kambala|sudak|sibas|laqqa|osetr|xek|baliq/, 'baliq-qovurilgan'],
  [/jigar/, 'jigar-mol'], [/kotlet|zrazy|otbivnoy/, 'kotlet'], [/kolbasa|vetchina/, 'kolbasa'], [/sosiska|hot-?dog/, 'hot-dog'], [/kurka/, 'kurka'], [/tovuq|chaxoxbili|teriyaki/, 'tovuq'], [/qoy-/, 'qoy-gosht'], [/mol-|befstrog|gosht/, 'mol-gosht'],
  [/tiramisu|panna|puding|chizkeyk/, 'chizkeyk'], [/tort|pirojnoe|muraveynik|smetannik|sharlotka|korzinochka|trubochka|fondant|makaron-pechenye|makarun|rulet/, 'tort-shokolad'], [/pechenye|oreshki|savoyardi|vafli/, 'pechenye-qumli'],
  [/bodom/, 'bodom'], [/yeryongoq|yerfistiq/, 'yeryongoq'], [/olma/, 'olma'], [/qoziqorin/, 'shampinon'], [/baqlajon/, 'baqlajon'], [/qovoqcha/, 'qovoqcha'], [/rukkola|aysberg|salat-barg/, 'salat-barg'], [/qalampir/, 'qalampir'],
  [/sabzavot/, 'sabzavot-ragu'], [/meva/, 'sharbat-meva'], [/kokos/, 'kokos'], [/adjika|ketchup/, 'ketchup'], [/mayonez/, 'mayonez'], [/sous/, 'sous-oq'], [/yog/, 'yog']
];
const TUR = { i: 'drink, served in a typical glass or cup', o: 'dish, one portion in a bowl (kosa) or plate', n: 'bread or pastry', s: 'dairy product', m: 'meat, poultry or fish', g: 'grain, pasta or potato side dish', v: 'vegetable dish', f: 'fruit', d: 'nuts or dried fruit', q: 'cafe or fast-food dish', h: 'dessert or sweet', x: 'sauce or condiment' };
const tmp = {}, reja = [], noIcon = [];
for (const r of rows) {
  const [id, uz, ru, , t] = r, s = id + ' ' + uz.toLowerCase();
  const hit = R.find(([re]) => re.test(s)), ic = hit && HAVE.has(hit[1]) ? hit[1] : null;
  if (ic) tmp[id] = ic; else noIcon.push(id);
  const slug = 'v87-' + id; const desc = (TUR[t] || 'food') + ': ' + ru.replace(/\|/g, '/') + ' (' + uz.replace(/\|/g, '/') + '), realistic single serving, top-down three-quarter view, no text.';
  reja.push('9|' + slug + '|' + desc + '|' + id);
}
/* (1) ilova bloki */
const AP = path.join(ROOT, 'assets/kalkifit-app.js'); let a = fs.readFileSync(AP, 'utf8');
const BLK = '  /* IKONKA-VAQTINCHA:BOSH — tools/ikonka-v87.js yozadi: v87 yangi taomlariga o\'z rasmi chizilguncha eng yaqin mavjud ikonka (IKX — o\'z rasmi — ustun) */\n  var IMGTMP = ' + JSON.stringify(tmp) + ';\n  if (typeof NO_TMP === \'undefined\' || !NO_TMP) Object.keys(IMGTMP).forEach(function (k) { if (!IMGS[k]) IMGS[k] = IMGTMP[k]; });\n  /* IKONKA-VAQTINCHA:OXIR */\n';
const re = /  \/\* IKONKA-VAQTINCHA:BOSH[\s\S]*?IKONKA-VAQTINCHA:OXIR \*\/\n/;
if (re.test(a)) a = a.replace(re, BLK); else { const anchor = "  Object.keys(IMG2).forEach(function (k) { if (!IMGS[k]) IMGS[k] = IMG2[k]; });\n"; if (!a.includes(anchor)) throw new Error('IMG2 joyi topilmadi'); a = a.replace(anchor, anchor + BLK); }
fs.writeFileSync(AP, a);
/* (2) reja */
const RP = path.join(ROOT, 'data/ikonka-reja.txt'); let t = fs.readFileSync(RP, 'utf8').split('\n').filter((l) => !/^9\|v87-/.test(l)).join('\n').replace(/\n+$/, '\n');
fs.writeFileSync(RP, t + reja.join('\n') + '\n');
console.log('vaqtincha ikonka:', Object.keys(tmp).length, '| mos ikonka topilmadi (tur ikonkasi):', noIcon.length, noIcon.join(' '), '| reja qatorlari:', reja.length);
