/* kalki.uz — bazani kengaytirish, 1-bosqich (2026-10-30, v64): qidiruvda topilmaganlar (D1 qidiruv_topilmadi), AI takliflari (D1 taklif) va kundalik
 * o'zbek dasturxoni bo'shliqlari. Format va manba qoidasi — tools/ovqatlar-kengaytma.js bilan BIR XIL (qiymat qo'lda yozilmaydi):
 *   u:<fdc_id>   — USDA FoodData Central SR Legacy (data/manba/usda-sr-legacy.json; yangi id lar: python3 tools/usda-qoshimcha.py <zip>)
 *   y:<kalit>    — ishlab chiqaruvchi yorlig'i (data/manba/yorliq.json, Open Food Facts shtrix-kodi bilan)
 *   m:<a>*<g>+…  — aralashma/retsept (komponentlar u:/y:/suv grammi bo'yicha) → «taxminiy» (e=1)
 * Qator: id | nom (UZ) | nom (RU) | sinonimlar (UZ/RU/imlo) | tur | porsiyalar | manba. Takror taom YARATILMAYDI — mavjudiga sinonim: tools/ovqatlar-alias.json. */
'use strict';
const T = `
choy-navvot|Choy (navvot bilan)|Чай с наватом|navvot choy,navot choy,navvotli choy,navotli choy,novvot bilan choy,choy navvot,нават чай,чай с наватом,чай с набатом|i|piyola:200,stakan:250|m:u:173227*96+u:169655*4
choy-limon|Limonli choy (shakarsiz)|Чай с лимоном (без сахара)|limonli choy,limon choy,choy limon bilan,limonli qora choy,чай с лимоном|i|piyola:200,stakan:250|m:u:173227*97+u:167747*3
choy-limon-shakar|Limonli choy (shakar bilan)|Чай с лимоном и сахаром|limonli choy shakarli,choy limon shakar bilan,limon shakarli choy,чай с лимоном и сахаром|i|piyola:200,stakan:250|m:u:173227*92+u:167747*3+u:169655*5
choy-asal|Choy (asal bilan)|Чай с мёдом|asalli choy,choy asal bilan,chay s medom,чай с мёдом,чай с медом|i|piyola:200,stakan:250|m:u:173227*95+u:169640*5
otli-choy|O'tli choy (yalpiz, na'matak, romashka, zanjabil)|Травяной чай (мята, шиповник, ромашка)|otli choy,o'tli choy,yalpiz choy,yalpizli choy,namatak choy,na'matak choy,na'matakli choy,romashka,romashka choy,zanjabil choy,karkade,mayramdori,травяной чай,чай с мятой,мятный чай,шиповник,чай из шиповника,ромашковый чай,имбирный чай,каркаде,herbal tea|i|piyola:200,stakan:250|u:173232
sariyogli-sut|Sut (sariyog' bilan)|Молоко со сливочным маслом|sariyog'li sut,sariyogli sut,sut sariyog' bilan,yog'li sut,молоко с маслом,молоко со сливочным маслом|i|piyola:200,stakan:250,kosa:250|m:u:171265*97+u:173430*3
tarxun|Tarxun (gazli ichimlik)|Тархун (лимонад)|tarxun,tarhun,tarkhun,tarxun limonad,тархун,лимонад тархун|i|stakan:250,banka:330,shisha05:500,shisha1:1000,shisha15:1500|y:tarxun-chernogolovka
chalpak|Chalpak (yog'da qovurilgan yupqa non)|Чалпак (жареная лепёшка)|chalpak,shalpak,chalpaq,qovurilgan non,чалпак,шелпек,жареная лепешка|n|dona:60|m:u:167635*100
qushtili|Qushtili (yog'da qovurilgan xamir)|Куштили (жареное тесто)|qushtili,qush tili,qushtil,куштили|n|dona:15,porsiya:100|m:u:167635*100
gumma|Gumma (qovurilgan pirojki, go'shtli)|Гумма (жареный пирожок с мясом)|gumma,gummi,goshtli pirojki qovurilgan,qovurilgan pirojki,гумма,жареный пирожок с мясом|q|dona:90|m:u:167635*70+u:171799*25+u:170000*5
sdoba|Sdoba bulochka (shirin)|Сдобная булочка|sdoba,sdobnaya bulochka,shirin bulochka,shirin non,сдобная булочка,сдоба,булочка сладкая,сдобная сладкая булочка|n|dona:80|u:174107
vatrushka|Vatrushka (tvorogli bulochka)|Ватрушка (булочка с творогом)|vatrushka,tvorogli bulochka,tvorogli pirojki,ватрушка,булочка с творогом,sirli bulochka|h|dona:90|u:175033
sut-oshi|Sut oshi (sutli lapsha)|Молочный суп с лапшой|sut oshi,sutli lapsha,sutli osh,sut shorva,sutli sho'rva,молочный суп,молочная лапша,суп молочный|o|kosa:300|m:u:171265*80+u:168919*20
guruch-shurva|Guruch sho'rva|Рисовый суп|guruch shorva,guruch sho'rva,guruchli sho'rva,guruchli shorva,рисовый суп,суп с рисом|o|kosa:350|m:suv*60+u:168878*12+u:168667*10+u:170440*8+u:170393*5+u:170000*4+u:171025*1
besh-don-shurva|Sho'rva (5 donli: perlovka, loviya, mosh, yasmiq, guruch)|Суп «5 злаков» (перловка, фасоль, маш, чечевица, рис)|besh don shorva,5 donli shorva,besh donli sho'rva,beshdon,суп 5 злаков,суп пять злаков,5 злаков,суп из перловки фасоли маша,суп из фасоли перловки маша мяса|o|kosa:350|m:suv*50+u:170285*8+u:173740*8+u:174257*8+u:172421*6+u:168878*6+u:168667*8+u:170393*3+u:170000*2+u:171025*1
yasmiq-tovuq|Yasmiq sho'rva (tovuqli)|Чечевичный суп с курицей|yasmiq tovuqli,yasmiq tovuq bilan,tovuqli yasmiq,chechevitsa tovuq,чечевица с курицей,чечевичный суп с курицей,суп из чечевицы с курицей|o|kosa:350|m:suv*55+u:172421*20+u:172388*12+u:170440*6+u:170393*4+u:170000*2+u:171025*1
okroshka|Okroshka (kefirli)|Окрошка на кефире|okroshka,akroshka,окрошка,окрошка на кефире|o|kosa:350|m:u:170904*55+u:168409*15+u:170440*10+u:172183*4+u:172184*2+u:172012*7+u:169276*5+suv*2
solyanka|Solyanka (go'shtli)|Солянка мясная|solyanka,salyanka,солянка,солянка мясная|o|kosa:350|m:suv*62+u:168667*10+u:172012*8+u:168558*8+u:170459*4+u:170000*4+u:171025*2+u:170393*2
tovuq-bulon|Tovuq buloni (sho'rva suvi)|Куриный бульон|tovuq buloni,tovuq bulon,tovuq sho'rva suvi,shorva suvi,bulon,куриный бульон,бульон,chicken broth|o|kosa:300,piyola:200|u:174536
makaron-gosht|Makaron go'sht bilan (po-flotski)|Макароны по-флотски|makaron palov,makaron qiymali,qiymali makaron,go'shtli makaron,makaron gosht bilan,makaron po flotski,po flotski,макароны по-флотски,макароны с фаршем,макароны с мясом|o|likop:300,porsiya:300|m:u:169737*70+u:171799*25+u:170000*3+u:171025*2
grechka-gosht|Grechka go'sht bilan|Гречка с мясом|grechka goshtli,grechka go'sht bilan,goshtli grechka,grechka po kupecheski,гречка с мясом,гречка по-купечески|o|likop:300,porsiya:300|m:u:170686*70+u:168667*22+u:170000*3+u:170393*3+u:171025*2
ganfan|Ganfan (guruch sabzavotli go'sht bilan)|Ганфан|ganfan,gan fan,ганфан|o|likop:400|m:u:168878*55+u:168667*15+u:170393*5+u:170000*5+u:170108*6+u:170457*6+u:169228*5+u:171025*3
gulyash|Gulyash (mol go'shti sousda)|Гуляш из говядины|gulyash,gulyas,гуляш,гуляш из говядины|o|likop:250,porsiya:250|m:u:168667*55+suv*28+u:170000*8+u:170459*5+u:171025*3+u:168894*1
qalampir-dolma|Qalampir do'lma (go'sht va guruch bilan)|Фаршированный перец|qalampir dolma,bulg'or qalampir dolma,qalampir to'ldirilgan,перец фаршированный,фаршированный перец,фаршированные перцы|o|dona:200,porsiya:350|m:u:170108*40+u:168878*20+u:171799*28+u:170457*8+u:170000*3+u:171025*1
tovuq-kotlet|Tovuq kotleti|Котлета куриная|tovuq kotlet,tovuq kotleti,tovuqli kotlet,котлета куриная,куриная котлета,куриные котлеты|m|dona:80|m:u:171117*80+u:174924*8+u:170000*5+u:171025*4+u:172183*3
baliq-kotlet|Baliq kotleti|Котлета рыбная|baliq kotlet,baliq kotleti,baliqli kotlet,котлета рыбная,рыбная котлета,рыбные котлеты|m|dona:80|m:u:174237*75+u:174924*10+u:170000*6+u:171025*5+u:172183*4
tovuq-soya|Tovuq filesi (soya sousida)|Куриное филе в соевом соусе|tovuq file soya,tovuq soya sousda,tovuq soya sousida,tovuq file soyada,soyali tovuq,куриное филе в соевом соусе,курица в соевом соусе|m|porsiya:200|m:u:171477*88+u:174277*7+u:170000*3+u:171025*2
tovuq-grill|Tovuq (grill, terisi bilan)|Курица гриль (с кожей)|tovuq grill,grill tovuq,tovuq tabaka,tabaka,butun tovuq,курица гриль,цыпленок табака,курица запеченная с кожей|m|porsiya:250,bolak:150|u:171450
bedana-tuxum|Bedana tuxumi|Перепелиное яйцо|bedana tuxumi,bedana tuxum,bedananing tuxumi,перепелиное яйцо,перепелиные яйца,quail egg|m|dona:9|u:172191
bedana|Bedana (pishgan)|Перепёлка (приготовленная)|bedana,bedana go'shti,bedana gosht,bedana kabob,перепелка,перепёлка,мясо перепела,quail|m|dona:100,porsiya:150|u:169902
tuxum-sarigi|Tuxum sarig'i|Яичный желток|tuxum sarig'i,tuxum sarigi,tuxum sarigi,sarig',желток,яичный желток,egg yolk|m|dona:17|u:172184
tuxum-oqi|Tuxum oqi|Яичный белок|tuxum oqi,tuxumning oqi,белок,яичный белок,egg white|m|dona:33|u:172183
hotdog-shashlik|Hot-dog (shashlikli)|Хот-дог с шашлыком|shashlikli hot dog,shashlikli xot dog,shashlikli hotdog,xotdog shashlik,хот-дог с шашлыком|q|dona:220|m:u:172796*35+u:168667*45+u:168556*8+u:169247*7+u:170000*5
sezar-roll|Sezar roll (tovuqli lavash)|Цезарь-ролл|sezar roll,sezar rol,caesar roll,tsezar roll,цезарь ролл,цезарь-ролл,ролл цезарь|q|dona:250|m:u:167535*30+u:171477*30+u:169247*15+u:171247*5+u:169055*12+u:170457*8
toshkent-salat|Toshkent salati|Салат «Ташкент»|toshkent salati,toshkent salat,tashkent salat,салат ташкент,ташкентский салат|o|porsiya:200|m:u:168667*30+u:169276*35+u:172183*6+u:172184*4+u:171009*15+u:170000*10
krab-salat|Krab salati (krab tayoqchali)|Крабовый салат|krab salati,krab salat,krabovy salat,краб салат,крабовый салат|o|porsiya:200|m:u:174203*30+u:168878*20+u:169214*20+u:172183*8+u:172184*5+u:171009*15+u:168409*2
karam-salat|Karam salati (yog'li)|Салат из капусты|karam salat,karam salati,bahor salat,vitaminka,салат из капусты,капустный салат,салат витаминный|v|porsiya:150|m:u:169975*80+u:170393*10+u:171025*6+u:168409*4
lavlagi-salat|Lavlagi salati (sarimsoq va mayonez bilan)|Салат из свёклы с чесноком|lavlagi salat,lavlagi salati,svekla salat,салат из свеклы,свекла с чесноком|v|porsiya:150|m:u:169145*85+u:171009*13+suv*2
ikra-baqlajon|Baqlajon ikrasi|Икра баклажанная|baqlajon ikrasi,baqlajon ikra,ikra baqlajon,ekra,ekra baqlajon,baklajan ikra,икра баклажанная,баклажанная икра|v|qoshiq:20,kosa:250,banka:500|y:ikra-baqlajon
ikra-qovoqcha|Qovoqcha ikrasi|Икра кабачковая|qovoqcha ikrasi,qovoqcha ikra,kabachok ikra,kabachkovaya ikra,ekra kabachok,икра кабачковая,кабачковая икра|v|qoshiq:20,kosa:250,banka:500|y:ikra-qovoqcha
tvorog-zapekanka|Tvorog zapekankasi|Творожная запеканка|tvorog zapekanka,zapekanka,tvorogli zapekanka,творожная запеканка,запеканка|h|bolak:150|m:u:172179*62+u:172183*8+u:172184*5+u:169715*8+u:169655*10+u:171265*7
tvorog-donador|Tvorog (donador, qaymoqli)|Творог зернёный|donador tvorog,tvorog donador,zernistyy tvorog,зерненый творог,творог зернёный,cottage cheese|s|qoshiq:30,piyola:150,paket:350|u:172179
kolbasa-dudlangan|Kolbasa (dudlangan, mol go'shti)|Колбаса копчёная (говяжья)|dudlangan kolbasa,kopchonaya kolbasa,servelat,salyami,колбаса копченая,сервелат,салями|m|tilim:10,bolak:50|u:172935
kok-olma|Ko'k olma (Simirenko, Granny Smith)|Зелёное яблоко (Симиренко)|ko'k olma,kok olma,yashil olma,semerenko,simirenko,granny smith,зеленое яблоко,зелёное яблоко,симиренко|f|dona:180|u:168203
chilonjiyda|Chilonjiyda (unabi)|Унаби (зизифус)|chilonjiyda,chilon jiyda,unabi,унаби,зизифус,jujube|f|dona:15,hovuch:50|u:168151
namatak|Na'matak (yangi)|Шиповник (свежий)|na'matak,namatak,shipovnik,шиповник,rose hip|f|hovuch:30|u:168998
zigir|Zig'ir urug'i|Семена льна|zig'ir,zigir,zig'ir urug'i,zigir urugi,lyon,семена льна,льняное семя,лен,flaxseed|d|qoshiq:10,choyq:4|u:169414
chia|Chia urug'i|Семена чиа|chia,chia urug'i,chiya,семена чиа,чиа|d|qoshiq:12,choyq:4|u:170554
mosh-xom|Mosh (xom, quruq)|Маш (сухой)|mosh xom,xom mosh,quruq mosh,маш сухой,маш сырой,mung raw|g|stakan:200,qoshiq:15|u:174256
noxat-xom|No'xat (xom, quruq)|Нут (сухой)|noxat xom,xom noxat,quruq noxat,нут сухой,нут сырой|g|stakan:200,qoshiq:15|u:173756
loviya-xom|Loviya (xom, quruq)|Фасоль (сухая)|loviya xom,xom loviya,quruq loviya,фасоль сухая,фасоль сырая|g|stakan:185,qoshiq:15|u:175193
yasmiq-xom|Yasmiq (xom, quruq)|Чечевица (сухая)|yasmiq xom,xom yasmiq,quruq yasmiq,чечевица сухая,чечевица сырая|g|stakan:190,qoshiq:15|u:172420
tariq-xom|Tariq (xom)|Пшено (сухое)|tariq xom,xom tariq,пшено сухое,пшено крупа|g|stakan:200,qoshiq:15|u:169702
perlovka-xom|Arpa yormasi (perlovka, xom)|Перловка (сухая)|perlovka xom,xom perlovka,arpa yormasi xom,перловка сухая,перловая крупа|g|stakan:200,qoshiq:15|u:170284
bulgur-xom|Bulg'ur (xom)|Булгур (сухой)|bulgur xom,xom bulgur,булгур сухой|g|stakan:140,qoshiq:12|u:170688
kuskus-xom|Kuskus (xom)|Кускус (сухой)|kuskus xom,xom kuskus,кускус сухой|g|stakan:175,qoshiq:12|u:169699
kinoa-xom|Kinoa (xom)|Киноа (сухая)|kinoa xom,xom kinoa,киноа сухая|g|stakan:170,qoshiq:12|u:168874
manka-xom|Manka (xom yorma)|Манная крупа (сухая)|manka xom,manka yorma,quruq manka,манка сухая,манная крупа|g|stakan:170,qoshiq:12|u:169715
suli-sutli|Suli bo'tqasi (sutda)|Овсяная каша на молоке|suli sutli,sutli suli,suli bo'tqa sutda,ovsyanka na moloke,овсянка на молоке,овсяная каша на молоке|g|kosa:250,likop:250|m:u:171675*50+u:171265*50
grechka-sutli|Grechka (sut bilan)|Гречка с молоком|grechka sutli,sutli grechka,grechka sut bilan,гречка с молоком,гречневая каша с молоком|g|kosa:250,likop:250|m:u:170686*60+u:171265*40
tariq-sutli|Tariq bo'tqasi (sutda)|Пшённая каша на молоке|tariq sutli,sutli tariq,tariq bo'tqa sutda,пшенная каша на молоке,пшённая каша молочная|g|kosa:250,likop:250|m:u:168871*60+u:171265*40
dumba|Dumba (qo'y yog'i, pishgan)|Курдюк (бараний жир, приготовленный)|dumba,dumba yog'i,qo'y yog'i,kurdyuk,курдюк,курдючный жир,бараний жир|m|bolak:20,qoshiq:15|m:u:172512*100
aroq|Aroq (40%)|Водка (40%)|aroq,vodka,водка,araq|i|ryumka:50,stakan:100|u:174818
konyak|Konyak, viski (40%)|Коньяк, виски (40%)|konyak,koniak,viski,whisky,коньяк,виски,ром,brandy|i|ryumka:50,stakan:100|u:174815
vino-oq|Vino (oq, quruq)|Вино белое сухое|oq vino,vino oq,belaya vino,белое вино,вино белое сухое,white wine|i|bokal:150,shisha:750|u:173201
vino-shirin|Vino (shirin, desert)|Вино десертное (сладкое)|shirin vino,desert vino,portveyn,kagor,сладкое вино,десертное вино,портвейн,кагор|i|bokal:150,ryumka:50|u:173176
pivo-yengil|Pivo (yengil, light)|Пиво светлое лёгкое (light)|yengil pivo,pivo light,light pivo,лёгкое пиво,пиво лайт,light beer|i|stakan:250,banka:450,shisha05:500|u:168749
guruch-jigarrang-xom|Jigarrang guruch (xom)|Рис бурый (сухой)|jigarrang guruch xom,qo'ng'ir guruch xom,бурый рис сухой,коричневый рис сырой|g|stakan:185,qoshiq:15|u:169703
`;
const rows = T.trim().split('\n').map((l) => l.split('|'));
/* «Yemaydiganlarim» teglari: ehtiyotkor tomon (cho'chqa tegi — QO'YILMAYDI, CLAUDE.md qoidasi) */
const L = (x) => x.trim().split(/\s+/);
const TEG = {
  sut: L(`sariyogli-sut sut-oshi okroshka tvorog-zapekanka tvorog-donador vatrushka sdoba sezar-roll`),
  tuxum: L(`tuxum-sarigi tuxum-oqi bedana-tuxum okroshka toshkent-salat krab-salat tvorog-zapekanka tovuq-kotlet baliq-kotlet sezar-roll vatrushka sdoba sut-oshi`),
  glyuten: L(`chalpak qushtili gumma sdoba vatrushka sut-oshi makaron-gosht hotdog-shashlik sezar-roll tovuq-kotlet baliq-kotlet tvorog-zapekanka besh-don-shurva perlovka-xom bulgur-xom kuskus-xom manka-xom gulyash tovuq-soya`),
  baliq: L(`baliq-kotlet krab-salat sezar-roll`),
  yongoq: []
};
const OQSIL = Object.assign({},
  ...L(`gulyash grechka-gosht makaron-gosht qalampir-dolma ganfan solyanka toshkent-salat hotdog-shashlik guruch-shurva besh-don-shurva`).map((i) => ({ [i]: 'qizil' })),
  ...L(`kolbasa-dudlangan`).map((i) => ({ [i]: 'aralash' })),
  ...L(`tovuq-kotlet tovuq-soya tovuq-grill bedana yasmiq-tovuq tovuq-bulon sezar-roll`).map((i) => ({ [i]: 'tovuq' })),
  ...L(`baliq-kotlet krab-salat`).map((i) => ({ [i]: 'baliq' })),
  ...L(`tuxum-sarigi tuxum-oqi bedana-tuxum`).map((i) => ({ [i]: 'tuxum' })),
  ...L(`tvorog-zapekanka tvorog-donador sariyogli-sut sut-oshi okroshka`).map((i) => ({ [i]: 'sut' })),
  ...L(`mosh-xom noxat-xom loviya-xom yasmiq-xom`).map((i) => ({ [i]: 'dukkak' })));
module.exports = rows; module.exports.TEG = TEG; module.exports.OQSIL = OQSIL;
