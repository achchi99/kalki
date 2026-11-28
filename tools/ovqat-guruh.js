/* kalki.uz — KalkiFit: har taomga GURUH tegi (v87, «bir xillik maslahati» uchun). ovqatlar-build.js oxirida chaqiriladi: o.gr = ['kartoshka', …] (1–2 ta, asosiysi birinchi).
 * Guruhlar: kartoshka · guruch (guruch va yormalar) · xamir (xamirli/unli) · qizil_gosht · tovuq · baliq (baliq va dengiz) · tuxum · dukkakli · sabzavot · meva (meva, quruq meva, yong'oq)
 *   · sut (sut mahsuloti) · shirinlik · fastfud · ichimlik · boshqa (yog', sous, protein kukuni — maslahatda ishlatilmaydi).
 * Qoida: tur (t) + id/nom (uz, ru) bo'yicha; aralash taomda asosiy 1–2 guruh. Noto'g'ri tushganlar — QOLDA (id → guruhlar). Test: tools/dizayn/test-baza-mantiq.mjs (har ko'rinadigan taomda guruh bor). */
'use strict';
const GURUH = ['kartoshka', 'guruch', 'xamir', 'qizil_gosht', 'tovuq', 'baliq', 'tuxum', 'dukkakli', 'sabzavot', 'meva', 'sut', 'shirinlik', 'fastfud', 'ichimlik', 'boshqa'];
const RE = {
  kartoshka: /kartosh|картоф|картош|\bfri\b|фри|kumpir|pyure|пюре|chips|чипс|draniki|драник/i,
  guruch: /guruch|mastava|мастава|рис\b|рисов|\bosh\b|oshi\b|palov|плов|shavla|шавля|kichiri|кичири|shirguruch|grechka|гречк|suli\b|овсян|bulgur|булгур|kuskus|кускус|perlovka|перлов|tariq|пшён|kinoa|киноа|manka|манк|botqa|каша|ganfan|ганфан|granola|kornfleks|мюсли|makkajo'xori|makkajoxori|кукуруз/i,
  xamir: /non\b|nonli|лепёшк|хлеб|somsa|самс|manti|манты|chuchvara|чучвар|pelmen|пельмен|lag'?mon|лагман|xonim|ханум|norin|нарын|kuksi|кукси|ugra|угра|beshbarmoq|бешбармак|makaron|макарон|lapsha|лапш|spagetti|спагетти|lazanya|лазань|pirojki|пирож|pirashki|bulochka|булочк|kruassan|круассан|blin|блин|chebure|чебурек|belyash|беляш|lavash|лаваш|pitsa|пицц|pide|lahmajun|gözleme|gozleme|borek|börek|boregi|xamir|тесто|tortilya|тортиль|baget|багет|tost|тост|suxari|сухар|bagel|бейгл|simit|chalpak|чалпак|qushtili|gumma|гумма|vareniki|варени|kesma|unash|mampar|chalop|ramen|рамен|doshirak|udon|удон|soba\b|соба|vafli|вафл|pechen|печень|kraker|крекер|sirniki|сырник|chapati|lochira|sdoba|сдоб|un\b|мука|umoch|go'?ja|atala|yupqa|kepak/i,
  qizil_gosht: /go'?sht|gosht|мяс|говя|баран|телят|mol\b|mol-|qo'?y\b|qoy-|qo'y|kabob|кабоб|кебаб|shashlik|шашлык|lyulya|люля|qazi|казы|jigar|печён|kolbasa|колбас|sosiska|сосиск|kotlet|котлет|tefteli|тефтел|frikadel|фрикадел|kifta|qiyma|фарш|steyk|стейк|bifshteks|qovurdoq|ковурдак|norin|jarkop|qozon kabob|qovurma|dimlama|gulyash|гуляш|befstrogan|tushonka|тушёнк|dumba|ot go'?sht|buzoq|echki|quyon|кролик|hasip|xasip|jiz|бекон|bekon|ветчин|burger|бургер|chizburger|doner|донер|shaurma|шаурм|donar|hot-?dog|xot-?dog|хот-?дог|qorin|til\b|miya|buyrak|yurak|o'?pka|solyanka|солянк|xarcho|харчо|chili|bolonez|болонез|iskender|adana|urfa|kofte|köfte/i,
  tovuq: /tovuq|куриц|курин|kurka|индей|ordak|утк|bedana|перепел|qanot|nagget|наггет|strips|kfc|tvister|твистер|chiken|chicken|tavuk/i,
  baliq: /baliq|рыб|losos|лосос|tunets|тунец|treska|треск|krevetk|кревет|sardina|сардин|skumbriya|скумбри|seld|сельд|selyodk|forel|форел|mintay|минтай|kalmar|кальмар|ikra|икра|krab|краб|midiya|миди|sazan|сазан|tilapiya|chortan|okun|окун|uxa\b|уха|sushi|суши|qizil baliq/i,
  tuxum: /tuxum|яйц|яич|omlet|омлет|menemen|shakshuka|шакшук|qoymoq|bedana tuxum/i,
  dukkakli: /mosh\b|mosh-|moshxo'?rda|машхурд|маш\b|no'?xat|noxat|нохат|нут\b|loviya|фасол|yasmiq|чечевиц|mercimek|merjimek|gorox|горох|xummus|хумус|falafel|soya\b|soya-|tofu|тофу|yerfistiq|арахис|yeryong'?oq|fasulye|ezogelin/i,
  sabzavot: /sabzavot|овощ|salat|салат|karam|капуст|pomidor|помидор|томат|bodring|огур|sabzi|морков|piyoz|лук\b|baqlajon|баклажан|qovoq|тыкв|qalampir|перец|lavlagi|свекл|svekla|brokkoli|брокколи|gulkaram|цветн|ismaloq|шпинат|ko'?kat|зелен|qo'?ziqorin|гриб|vinegret|винегрет|achchiq-?chuchuk|ачичук|achichuk|dolma|долма|borsh|борщ|shchi|щи|okroshka|окрошк|ragu|рагу|patlican|karniyarik|coban|kisir|cacik|turp|редис|sarimsoq|чеснок|makkajo'?xori|кабачок|qovoqcha|ratatuy|minestrone|krem-sho'?rva|qaynatma|piyova|toshkent salat|bahor/i,
  meva: /meva|фрукт|olma\b|яблок|nok\b|груш|banan|банан|apelsin|апельсин|mandarin|мандарин|uzum|виноград|tarvuz|арбуз|qovun|дын|o'?rik|абрикос|shaftoli|персик|olcha|вишн|gilos|черешн|anor|гранат|xurmo|хурм|anjir|инжир|behi|айв|kivi|киви|limon|лимон|qulupnay|клубник|malina|малин|mango|манго|ananas|ананас|avokado|авокадо|golubika|голубик|smorodina|смородин|mayiz|изюм|quruq|сушён|finik|финик|chernosliv|черносл|yong'?oq|орех|bodom|миндал|pista|фисташ|funduk|фундук|keshyu|кешью|kunjut|кунжут|kungaboqar|семечк|chia|zig'?ir|lyon|kokos|кокос|do'?lana|боярыш|klyukva|клюкв|na'?matak/i,
  sut: /\bsut\b|sut-|sutli|молок|молоч|qatiq|катык|kefir|кефир|yogurt|йогурт|smetana|сметан|qaymoq|сливк|каймак|tvorog|творог|pishloq|сыр|suzma|сузьм|qurt|курт|brinza|брынз|ayron|айран|ryajenka|ряжен|prostokvasha|простокваш|aktimel|sariyog'?|сливочн/i,
  shirinlik: /shirin|сладк|tort|торт|pirog|пирог|pirojn|пирожн|shokolad|шокол|konfet|конфет|muzqaymoq|морожен|halva|халв|pahlava|пахлав|chak-?chak|чак-?чак|navvot|нават|asal|мёд|мед\b|murabbo|варень|джем|keks|кекс|muffin|маффин|brauni|брауни|chizkeyk|чизкейк|tiramisu|тирамису|napoleon|наполеон|medovik|медовик|ekler|эклер|ponchik|пончик|donut|vafli|sumalak|сумаляк|nishalda|pishmaniye|xalvaitar|holvaytar|shakar|сахар|lokum|рахат|zefir|зефир|marmelad|мармелад|desert|десерт/i
};
const Q = {          // qo'lda: avtomatik noto'g'ri tushadiganlar (id → guruhlar)
  'roll-maki-losos': ['guruch', 'baliq'], 'roll-ugor': ['guruch', 'baliq'], 'roll-pishirilgan': ['guruch', 'baliq'], 'nigiri-tunets': ['guruch', 'baliq'], 'nigiri-ugor': ['guruch', 'baliq'], 'sashimi-losos': ['baliq'], 'imbir-marinad': ['boshqa'], vasabi: ['boshqa'],
  'kimbap-klassik': ['guruch', 'tuxum'], 'kimbap-tunets': ['guruch', 'baliq'], 'kimbap-bulgogi': ['guruch', 'qizil_gosht'], beze: ['shirinlik'],          // v108: sushi, kimbap, beze
  'onigiri-tunets': ['guruch', 'baliq'], 'onigiri-losos': ['guruch', 'baliq'], 'onigiri-tovuq': ['guruch', 'tovuq'], 'onigiri-oddiy': ['guruch'],          // v100: onigiri (guruch tamaddisi)
  dimlama: ['sabzavot', 'qizil_gosht'], 'dimlama-tovuq': ['sabzavot', 'tovuq'], halim: ['guruch', 'qizil_gosht'], sumalak: ['shirinlik'], achichuk: ['sabzavot'], jiz: ['qizil_gosht'], 'kafe-jiz': ['qizil_gosht'],
  'sut-oshi': ['sut', 'xamir'], shirguruch: ['guruch', 'sut'], okroshka: ['sabzavot', 'sut'], 'ganfan': ['guruch', 'qizil_gosht'], 'qatiq-salat': ['sut', 'sabzavot'], 'suzma-salat': ['sut', 'sabzavot'],
  'omlet-sabzavot': ['tuxum', 'sabzavot'], 'tuxum-barak': ['xamir', 'tuxum'], 'tr-menemen': ['tuxum', 'sabzavot'], 'tr-cacik': ['sut', 'sabzavot'], 'tr-mucver': ['sabzavot', 'tuxum'], qoymoq: ['tuxum', 'xamir'],
  'krab-salat': ['baliq', 'sabzavot'], olivye: ['sabzavot', 'kartoshka'], vinegret: ['sabzavot'], 'toshkent-salat': ['sabzavot', 'qizil_gosht'], 'koreys-sabzi': ['sabzavot'], 'sezar-salat': ['sabzavot', 'tovuq'],
  'guruch-qovurilgan': ['guruch'], 'tovuq-shirin-nordon': ['tovuq'], 'chili-konkarne': ['qizil_gosht', 'dukkakli'], 'tr-kuru-fasulye': ['dukkakli'], falafel: ['dukkakli'], xummus: ['dukkakli'], 'xummus-uy': ['dukkakli'], tahini: ['meva'],
  'kakao-kukun': ['ichimlik'], nesquik: ['ichimlik'], 'olma-sirka': ['boshqa'], 'shokolad-sirop': ['shirinlik'], 'yeryongoq-pasta': ['dukkakli'], 'qaymoq-kukun': ['sut'], 'protein-bar': ['shirinlik'], 'protein-bar-60': ['shirinlik'], 'protein-bar-40': ['shirinlik'],
  'sport-snickers-marathon': ['shirinlik'], 'protein-pechenye': ['shirinlik'], 'fitkit-cake': ['shirinlik'], 'protein-rex': ['shirinlik'], 'protein-rex-tiramisu': ['shirinlik'], nishalda: ['shirinlik'], pishmaniye: ['shirinlik'], xalvaitar: ['shirinlik'], 'shokolad-batonchik': ['shirinlik'],
  asal: ['shirinlik'], kunjut: ['meva'], 'tovuq-bulon': ['tovuq'], 'qaynatma-baliq': ['baliq'], qazi: ['qizil_gosht'], 'gosht-dimlangan-konserva': ['qizil_gosht'], sendvich: ['fastfud', 'xamir'],
  blin: ['xamir'], sirniki: ['sut', 'xamir'], vareniki: ['xamir'], pelmeni: ['xamir', 'qizil_gosht'], donut: ['shirinlik'], chips: ['fastfud', 'kartoshka'], popkorn: ['fastfud'], kraker: ['xamir'],
  qorin: ['qizil_gosht'], 'buxoro-oshi': ['guruch', 'qizil_gosht'], 'sazan-duxovka': ['baliq', 'kartoshka'], 'uy-tovuq-duxovka': ['tovuq', 'kartoshka'], 'soya-sous': ['boshqa'], 'tr-patlican-salatasi': ['sabzavot'], dolma: ['sabzavot', 'qizil_gosht'], 'kartoshka-qovurma': ['kartoshka', 'qizil_gosht']
};
function guruh(o) {
  if (Q[o.i]) return Q[o.i].slice();
  const s = (o.i.replace(/-/g, ' ') + ' ' + o.n + ' ' + (o.r || '')).replace(/go'?shtsiz|gostsiz|без мяса|постн/gi, ' '), hit = (g) => RE[g].test(s), out = [];
  const add = (g) => { if (g && !out.includes(g) && out.length < 2) out.push(g); };
  const t = o.t;
  if (t === 'i') { add('ichimlik'); return out; }
  if (t === 'h' && /chips|чипс|lays|pringles|popkorn|попкорн|cheetos|kirieshki|nachos|начос|kraker/i.test(s)) { add('fastfud'); if (/lays|pringles|chips|чипс/i.test(s) && !/pita|nachos/i.test(s)) add('kartoshka'); return out; }
  if (t === 'h') { add('shirinlik'); if (hit('sut') && /qatiq|yogurt|tvorog|творог|сырок|muzqaymoq|морожен/i.test(s)) add('sut'); return out; }
  if (t === 'f' || t === 'd') { if (t === 'd' && /yerfistiq|арахис|yeryong/i.test(s)) add('dukkakli'); else if (t === 'd' && /asal|мёд/i.test(s)) add('shirinlik'); else add('meva'); return out; }
  if (t === 's') { add('sut'); return out; }
  if (t === 'v') { add(hit('kartoshka') ? 'kartoshka' : (hit('dukkakli') && !/no'?xat ko'?k|zelen/i.test(s) ? 'dukkakli' : 'sabzavot')); return out; }
  if (t === 'n') { add('xamir'); if (/qovoq|kartosh|go'?sht|мяс/i.test(s)) add(hit('kartoshka') ? 'kartoshka' : (hit('qizil_gosht') ? 'qizil_gosht' : 'sabzavot')); return out; }
  if (t === 'x') { if (/protein|протеин|geyner|whey|kazein|izolyat|amino/i.test(s)) add('boshqa'); else if (hit('dukkakli')) add('dukkakli'); else if (hit('shirinlik')) add('shirinlik'); else add('boshqa'); return out; }
  if (t === 'g') { add(hit('kartoshka') ? 'kartoshka' : (hit('dukkakli') ? 'dukkakli' : (/makaron|lapsha|spagetti|un\b|kepak|ramen|doshirak|udon|soba|chapati|kuskus/i.test(s) ? 'xamir' : 'guruch'))); if (/sutli|молочн/i.test(s)) add('sut'); return out; }
  if (t === 'm') { add(hit('baliq') ? 'baliq' : (hit('tuxum') && !hit('tovuq') ? 'tuxum' : (hit('tovuq') ? 'tovuq' : 'qizil_gosht'))); if (/panirovka|kotleta-kiyev|tefteli/i.test(s)) add('xamir'); return out; }
  if (t === 'q') { add('fastfud'); const m = hit('baliq') ? 'baliq' : (hit('tovuq') ? 'tovuq' : (hit('kartoshka') ? 'kartoshka' : (hit('qizil_gosht') ? 'qizil_gosht' : (hit('sut') && /pishloq|сыр/i.test(s) ? 'sut' : null)))); add(m); return out; }
  /* o — milliy va aralash taomlar: asosiy masalliq (uglevod/oqsil) + go'sht turi */
  const prim = hit('guruch') ? 'guruch' : (hit('xamir') ? 'xamir' : (hit('kartoshka') ? 'kartoshka' : (hit('dukkakli') ? 'dukkakli' : null)));
  const meat = hit('baliq') ? 'baliq' : (hit('tovuq') ? 'tovuq' : (hit('qizil_gosht') ? 'qizil_gosht' : (hit('tuxum') ? 'tuxum' : null)));
  if (prim) { add(prim); add(meat || (hit('sabzavot') ? 'sabzavot' : (hit('sut') ? 'sut' : null))); }
  else if (meat) { add(meat); if (hit('sabzavot')) add('sabzavot'); }
  else if (hit('sabzavot')) add('sabzavot');
  else if (hit('sut')) add('sut');
  else add('qizil_gosht');
  return out;
}
function qoy(foods) {          // har taomga o.gr; oila variantlari — oilaning o'ziniki
  let n = 0; foods.forEach((o) => { o.gr = guruh(o); n++; }); return n;
}
module.exports = { GURUH, guruh, qoy, QOLDA: Q };
if (require.main === module) {
  const foods = require('../data/ovqatlar.json').foods.filter((f) => !f.h), by = {};
  foods.forEach((f) => { const g = guruh(f); (by[g[0]] = by[g[0]] || []).push(f.i + (g[1] ? '(+' + g[1] + ')' : '')); });
  Object.keys(by).forEach((g) => console.log('== ' + g + ' ' + by[g].length + '\n' + by[g].join(' ') + '\n'));
}
