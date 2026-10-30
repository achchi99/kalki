/* kalki.uz — bazani kengaytirish, 2-bosqich (2026-10-30, v65): O'zbekiston do'konlaridagi brendlar (yorliq — Open Food Facts shtrix-kodi, data/manba/yorliq.json),
 * fast-food (tarmoqlar — Evos, Max Way, Oqtepa Lavash, Bellissimo, KFC Uzbekistan — rasmiy kkal e'lon qilmagan: faqat UMUMIY nom, USDA tayyor taomidan, «taxminiy»), sport ovqati.
 * Format va manba qoidasi — tools/ovqatlar-kengaytma2.js bilan bir xil. Brend nomi FAQAT yorliq qiymati bilan; yorlig'i topilmagan brend qo'shilmaydi.
 * Qator: id | nom (UZ) | nom (RU) | sinonimlar | tur | porsiyalar | manba. */
'use strict';
const T = `
raffaello|Raffaello (konfet)|Конфеты Raffaello|raffaello,rafaello,rafaelo,раффаэлло,рафаэлло|h|dona:10,paket:150|y:raffaello
ferrero-rocher|Ferrero Rocher (konfet)|Конфеты Ferrero Rocher|ferrero rocher,ferrero,ferero roshe,ферреро роше,ферреро|h|dona:12,paket:200|y:ferrero-rocher
merci|Merci (shokolad konfetlar)|Конфеты Merci|merci,mersi,мерси|h|dona:10,paket:250|y:merci
toffifee|Toffifee (karamel-yong'oq konfet)|Конфеты Toffifee|toffifee,toffife,tofife,тоффифи|h|dona:8,paket:125|y:toffifee
toblerone|Toblerone (shokolad)|Шоколад Toblerone|toblerone,tobleron,тоблерон|h|plitka:100,bolak:10|y:toblerone
lion|Lion (batonchik)|Батончик Lion|lion,layon,лион,лайон|h|dona:40|y:lion
haribo|Haribo (marmelad)|Мармелад Haribo|haribo,xaribo,харибо,мармелад харибо|h|paket:80,hovuch:30|y:haribo-mix
chupa-chups|Chupa Chups (lolipop)|Чупа-Чупс (леденец)|chupa chups,chupa-chups,chupachups,чупа чупс,чупа-чупс,lolipop|h|dona:12|y:chupa-chups
roshen-shokolad|Roshen sutli shokolad (yong'oq nugali)|Шоколад Roshen молочный с ореховой нугой|roshen,roshen shokolad,roshen sutli,рошен,рошен шоколад|h|plitka:90,bolak:10|y:roshen-nuga
roshen-karamel|Roshen karamel (ledenets)|Карамель Roshen (леденцы)|roshen karamel,roshen ledenets,рошен карамель,рошен леденцы|h|dona:5,paket:200|y:roshen-karamel
mishka-kosolapiy|Mishka kosolapiy (konfet)|Конфеты «Мишка косолапый»|mishka kosolapiy,mishka kosolapy,mishka konfet,мишка косолапый,мишка|h|dona:16|y:mishka-kosolapiy
grilyazh|Grilyazh (Rot Front)|Грильяж «Рот Фронт»|grilyazh,grilyaj,грильяж,рот фронт|h|dona:10,paket:200|y:grilyazh-rotfront
alpen-gold-maxfun|Alpen Gold Max Fun (shokolad)|Шоколад Alpen Gold Max Fun|alpen gold max fun,max fun,alpen gold maks fan,альпен гольд макс фан|h|plitka:160,bolak:10|y:alpen-gold-maxfun
alpen-gold-oreo|Alpen Gold Oreo (shokolad)|Шоколад Alpen Gold Oreo|alpen gold oreo,alpen oreo,альпен гольд орео|h|plitka:95,bolak:10|y:alpen-gold-oreo
milka-funduk|Milka (butun funduqli)|Шоколад Milka с цельным фундуком|milka funduk,milka funduqli,milka yong'oqli,милка с фундуком,милка орех|h|plitka:90,bolak:10|y:milka-funduk
snickers-oq|Snickers oq (White)|Snickers белый|snickers oq,snikers oq,snickers white,сникерс белый|h|dona:81|y:snickers-oq
snickers-krisper|Snickers Krisper|Snickers Криспер|snickers krisper,snikers krisper,snickers crisper,сникерс криспер|h|dona:40|y:snickers-krisper
tuc|TUC kreker (smetana-piyoz)|Крекер TUC (сметана и лук)|tuc,tuk,tuc kreker,крекер тук,тук|h|paket:100,dona:3|y:tuc-smetana
belvita|Belvita (nonushta pechenyesi)|Печенье Belvita утреннее|belvita,belvita pechenye,бельвита,печенье утреннее|h|dona:12,paket:50|y:belvita
cheetos|Cheetos (pishloqli)|Cheetos со вкусом сыра|cheetos,chitos,читос,кукурузные палочки читос|h|paket:85,hovuch:20|y:cheetos-pishloq
kirieshki|Kirieshki (suxarik)|Сухарики «Кириешки»|kirieshki,kiriyeshki,suxarik,кириешки,сухарики|h|paket:40|y:kirieshki
mirinda|Mirinda (apelsin)|Mirinda апельсин|mirinda,mirinda apelsin,миринда|i|stakan:250,banka:330,shisha05:500,shisha1:1000,shisha15:1500|y:mirinda
lipton-ice-tea|Lipton Ice Tea (gazli)|Lipton Ice Tea|lipton,lipton ice tea,lipton choy,липтон,липтон айс ти|i|stakan:250,shisha05:500,shisha1:1000|y:lipton-ice-tea
rich-sharbat|Rich sharbati (ananas, 100%)|Сок Rich ананасовый 100%|rich,rich sharbat,rich ananas,рич,сок рич|i|stakan:250,shisha1:1000|y:rich-sharbat
j7-apelsin|J7 apelsin sharbati|Сок J7 апельсиновый|j7,j7 apelsin,j7 sharbat,джей севен,сок j7|i|stakan:250,shisha1:1000|y:j7-apelsin
flash-up|Flash Up Energy (energetik)|Flash Up Energy|flash up,flesh ap,flash energetik,флеш ап,флэш ап|i|banka:450,stakan:250|y:flash-up
gorilla|Gorilla (energetik)|Энергетик Gorilla|gorilla,gorila energetik,горилла,горилла энергетик|i|banka:450,stakan:250|y:gorilla
burn|Burn (energetik)|Энергетик Burn|burn,bern energetik,берн,бёрн|i|banka:500,stakan:250|y:burn
nesquik|Nesquik (kakao ichimlik kukuni)|Какао-напиток Nesquik (порошок)|nesquik,neskvik,несквик|x|qoshiq:15,choyq:5|y:nesquik-kakao
activia|Activia (bioyogurt)|Биойогурт Активиа|activia,aktivia,активиа|s|dona:150|y:activia
danissimo|Danissimo (tvorogli, shokoladli)|Даниссимо творожный с шоколадом|danissimo,danisimo,даниссимо|s|dona:130|y:danissimo-shokolad
chudo-tvorojok|Chudo tvorojok (chernikali)|Творожок «Чудо»|chudo,chudo tvorojok,чудо творожок,творожок|s|dona:100|y:chudo-tvorojok
agusha-tvorog|Agusha tvorogi (bolalar)|Творог детский «Агуша»|agusha,agusha tvorog,агуша,творог агуша|s|dona:100|y:agusha-tvorog
ehrmann-kokteyl|Ehrmann Grand Cocktail (sutli desert)|Ehrmann Grand Cocktail|ehrmann,erman,ehrmann kokteyl,эрман,эрманн|s|dona:200|y:ehrmann-uz
ehrmann-protein|Ehrmann High Protein puding|Пудинг Ehrmann High Protein|ehrmann protein,high protein puding,эрман протеин,протеиновый пудинг|s|dona:200|y:ehrmann-protein-puding
ehrmann-desert|Ehrmann Grand Dessert (shokolad)|Ehrmann Grand Dessert шоколад|grand dessert,ehrmann desert,эрман десерт,гранд десерт|s|dona:200|y:ehrmann-grand-dessert
president-smetana|President smetana (20%)|Сметана President 20%|president smetana,prezident smetana,президент сметана|s|qoshiq:20,choyq:5|y:president-smetana
president-pishloq|President eritilgan pishloq (qaymoqli)|Плавленый сыр President сливочный|president pishloq,president plavleniy,президент плавленый,плавленый сыр президент|s|tilim:20,paket:140|y:president-plavleniy
president-brinza|President brinza|Брынза President|president brinza,brinza,brynza,брынза президент|s|bolak:30|y:president-brynza
valio-yogurt|Valio ichimlik yogurti (0,4%)|Питьевой йогурт Valio 0,4%|valio,valio yogurt,валио,валио йогурт|s|shisha:330,stakan:250|y:valio-yogurt-ichimlik
valio-tvorog|Valio tvorogi (shaftolili)|Творог Valio с персиком|valio tvorog,valio shaftolili tvorog,валио творог,творог валио с персиком|s|dona:140|y:valio-tvorog-shaftoli
domik-qaymoq|Domik v derevne qaymog'i (20%)|Сливки «Домик в деревне» 20%|domik v derevne,qaymoq 20,slivki 20,домик в деревне,сливки 20%|s|qoshiq:15,stakan:200|y:domik-qaymoq20
inmarko-eskimo|Inmarko eskimo (quyultirilgan sutli)|Эскимо Инмарко «Фишка» со сгущёнкой|inmarko,inmarko eskimo,fishka eskimo,инмарко,эскимо фишка|h|dona:70|y:inmarko-fishka
protein-rex|Protein Rex batonchik (kokosli)|Протеиновый батончик Protein Rex|protein rex,proteinreks,протеин рекс,батончик протеин рекс|x|dona:40|y:protein-rex-kokos
protein-rex-tiramisu|Protein Rex batonchik (tiramisu)|Протеиновый батончик Protein Rex тирамису|protein rex tiramisu,tiramisu batonchik,протеин рекс тирамису,протеиновый батончик тирамису|x|dona:60|y:protein-rex-tiramisu
fitkit-cake|Fit Kit Protein Cake|Протеиновое печенье Fit Kit Protein Cake|fit kit,fitkit,fit kit protein cake,фит кит|x|dona:70|y:fitkit-protein-cake
on-whey|Optimum Nutrition Gold Standard Whey (kukun)|Протеин Optimum Nutrition Gold Standard Whey|optimum nutrition,gold standard,gold standart,on whey,оптимум нутришн,голд стандарт|x|skup:30,qoshiq:10|y:on-gold-whey
tvister|Tvister (qarsildoq tovuq lavashda)|Твистер (курица в тортилье)|tvister,twister,tvister tovuq,tovuqli rulet,твистер,ролл с курицей|q|dona:220|m:u:170785*100
tvister-grill|Tvister (grill tovuq lavashda)|Твистер с курицей гриль|tvister grill,grill tvister,twister grill,твистер гриль|q|dona:220|m:u:170786*100
kesadilya|Kesadilya (tovuqli)|Кесадилья с курицей|kesadilya,kesadiya,quesadilla,кесадилья|q|dona:180|m:u:170765*100
tovuq-burger-grill|Tovuq burger (grill file)|Бургер с курицей гриль|grill tovuq burger,tovuq burger grill,бургер с курицей гриль|q|dona:220|m:u:170368*100
sendvich-baget|Sendvich-baget (tovuqli, sabzavotli)|Сэндвич-багет с курицей и овощами|baget sendvich,sab sendvich,sendvich baget tovuq,сэндвич багет,саб с курицей|q|dona:230|m:u:170309*100
sous-pishloqli|Pishloqli sous|Сырный соус|pishloqli sous,sirniy sous,cheese sous,сырный соус|x|qoshiq:20,paket:30|m:u:171191*100
sous-sarimsoqli|Sarimsoqli sous (mayonezli)|Чесночный соус|sarimsoqli sous,chesnochniy sous,oq sous,чесночный соус,белый соус|x|qoshiq:20,paket:30|m:u:171009*65+u:171284*30+u:169230*5
`;
const rows = T.trim().split('\n').map((l) => l.split('|'));
const L = (x) => x.trim().split(/\s+/);
const TEG = {
  sut: L(`raffaello ferrero-rocher merci toffifee toblerone lion roshen-shokolad mishka-kosolapiy alpen-gold-maxfun alpen-gold-oreo milka-funduk snickers-oq snickers-krisper tuc belvita cheetos nesquik activia danissimo chudo-tvorojok agusha-tvorog ehrmann-kokteyl ehrmann-protein ehrmann-desert president-smetana president-pishloq president-brinza valio-yogurt valio-tvorog domik-qaymoq inmarko-eskimo protein-rex protein-rex-tiramisu fitkit-cake on-whey tvister tvister-grill kesadilya tovuq-burger-grill sendvich-baget sous-pishloqli sous-sarimsoqli grilyazh`),
  tuxum: L(`ferrero-rocher merci lion alpen-gold-oreo belvita tvister kesadilya tovuq-burger-grill sendvich-baget sous-sarimsoqli fitkit-cake`),
  yongoq: L(`raffaello ferrero-rocher merci toffifee toblerone roshen-shokolad mishka-kosolapiy milka-funduk snickers-oq snickers-krisper grilyazh belvita lion alpen-gold-maxfun protein-rex fitkit-cake`),
  glyuten: L(`ferrero-rocher lion alpen-gold-oreo snickers-krisper tuc belvita kirieshki raffaello mishka-kosolapiy fitkit-cake tvister tvister-grill kesadilya tovuq-burger-grill sendvich-baget`),
  baliq: [],
  choshqa: []                      // cho'chqa tegi FAQAT bekon va pepperonida (CLAUDE.md qoidasi) — yangi taomlarga QO'YILMAYDI
};
const OQSIL = Object.assign({},
  ...L(`tvister tvister-grill kesadilya tovuq-burger-grill sendvich-baget`).map((i) => ({ [i]: 'tovuq' })),
  ...L(`activia danissimo chudo-tvorojok agusha-tvorog ehrmann-kokteyl ehrmann-protein ehrmann-desert president-pishloq president-brinza valio-yogurt valio-tvorog on-whey protein-rex protein-rex-tiramisu fitkit-cake`).map((i) => ({ [i]: 'sut' })));
module.exports = rows; module.exports.TEG = TEG; module.exports.OQSIL = OQSIL;
