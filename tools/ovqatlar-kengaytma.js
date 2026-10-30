/* kalki.uz — bazani kengaytirish (2026-10, v20): HAR qatorda haqiqiy manba, qiymat qo'lda yozilmaydi.
 * Qator: id | nom (UZ lotin) | nom (RU) | qidiruv sinonimlari (vergul bilan; RU/EN/imlo; ЎЗ kirill qidiruvi translit orqali o'zi ishlaydi) | tur | porsiyalar | manba
 * Manba:
 *   u:<fdc_id>        — USDA FoodData Central SR Legacy (data/manba/usda-sr-legacy.json), 100 g uchun; go'shtda pishirilgan (cooked) yozuv.
 *   y:<kalit>         — ishlab chiqaruvchi yorlig'i (data/manba/yorliq.json: Open Food Facts, shtrix-kod bilan), 100 g/100 ml uchun.
 *   m:<a>*<g>+<b>*<g> — aralashma (masalan choy + shakar): komponentlar (u:/y: yoki «suv») grammlari bo'yicha hisob → «taxminiy».
 * Ichimliklarda 100 ml ≈ 100 g. Tur: tools/ovqatlar-build.js (o n s m g v f d i q h x). g100 avtomatik qo'shiladi. */
'use strict';
const T = `
kepak-non|Kepak non (kepakli, do'kon noni)|Хлеб отрубной|kepak non,kepakli non,kepakli,kepak noni,отрубной хлеб,хлеб с отрубями,хлеб отрубной,bran bread|n|tilim:30,bolak:50|m:u:174924*85+u:169722*15
olma-sirka|Olma sirkasi|Яблочный уксус|olma sirkasi,olma sirka,sirka,uksus,яблочный уксус,уксус,apple cider vinegar|x|qoshiq:15,choy qoshiq:5|u:173469
sezar-salat|Sezar salati (tovuqli)|Салат «Цезарь» с курицей|sezar,sezar salat,salat sezar,sezar salati,tsezar,цезарь,салат цезарь,цезарь с курицей,caesar,caesar salad|q|porsiya:250|m:u:169247*45+u:171477*25+u:169055*12+u:172752*10+u:170848*8
lotus-biscoff|Lotus Biscoff (karamelli pechenye)|Печенье Lotus Biscoff|lotus,lotus biscoff,biscoff,lotus pechenye,лотус,печенье лотус,бискофф|h|dona:8,paket:125|y:lotus-biscoff
pechenye-molochnoe|Sutli pechenye (molochnoye, Yubileynoye turi)|Печенье молочное («Юбилейное»)|molochnoye pechenye,molochnoe pechenye,sutli pechenye,yubileynoe,yubileynoye,молочное печенье,печенье молочное,юбилейное,юбилейное молочное|h|dona:12,paket:112|y:yubileynoe-molochnoe
fuze-tea|Fuse Tea (muzli choy)|Fuse Tea (холодный чай)|fuse tea,fuze tea,fuse,fuze,fuzetea,fyuz ti,фьюз ти,фуз ти,холодный чай,muzli choy,ice tea,айс ти|i|shisha:500,stakan:250|y:fuze-tea
un|Un (bug'doy, oq)|Мука пшеничная|un,bugdoy uni,bug'doy uni,мука,пшеничная мука,wheat flour,flour|g|qoshiq:10,stakan:125|u:168894
tunets-suv|Tunets (o'z sharbatida, konserva)|Тунец в собственном соку (консервы)|tunets suvda,tunets o'z sharbatida,tunets konserva,тунец в собственном соку,тунец консервированный,canned tuna in water|m|dona:130,porsiya:80|u:171986
kakao-kukun|Kakao kukuni (shakarsiz)|Какао-порошок (без сахара)|kakao kukuni,kakao poroshok,какао порошок,какао-порошок,какао порошок без сахара,cocoa powder|x|qoshiq:5|u:169593
kepak|Kepak (bug'doy kepagi)|Отруби пшеничные|kepak,bugdoy kepagi,bug'doy kepagi,отруби,отруби пшеничные,wheat bran|g|qoshiq:6,stakan:58|u:169722
tuxum-qov-yogsiz|Tuxum, yog'siz qovurilgan (yopishmaydigan tovada)|Яичница без масла (на антипригарной сковороде)|qovurilgan tuxum yog'siz,yog'siz qovurilgan tuxum,tuxum yogsiz qovurilgan,яйца жареные без масла,яйцо жареное без масла,яичница без масла,глазунья без масла,fried egg no oil|m|dona:50|u:171287
kotleta-kiyev|Kotleta po-kiyevski (pishloqli)|Котлета по-киевски с сыром|kotleta po kiyevski,kotleta kiyevski,po-kiyevski,котлета по-киевски,котлета по киевски,котлета по-киевски с сыром,котлета по киевски с сыром,chicken kiev|m|dona:150|m:171078*65+173410*12+170845*10+174928*10+171287*3
bulochka-shokolad|Bulochka/kruassan (shokoladli to'ldirma bilan)|Булочка с шоколадной начинкой|shokoladli bulochka,bulochka shokoladli,shokoladli kruassan,булочка с шоколадной начинкой,булочка с шоколадом,шоколадная булочка,круассан с шоколадом,круассан с какао,7days|h|dona:75|y:7days-kruassan-kakao
mz-korovka-rojok|Korovka iz Korenovki — plombir vafli rojokda (15%)|Коровка из Кореновки — пломбир в вафельном рожке 15%|korovka,коровка,коровка из кореновки,korovka rojok,рожок пломбир,plombir rojok,muzqaymoq rojok,muzqaymoq,мороженое|h|dona:100|y:kizk-rojok
mz-korovka-eskimo-belgiya|Korovka iz Korenovki — eskimo (belgiya shokoladida, 15%)|Коровка из Кореновки — эскимо в бельгийском шоколаде 15%|korovka eskimo,коровка эскимо,eskimo plombir,эскимо пломбир,muzqaymoq,мороженое|h|dona:70|y:kizk-eskimo-belgiya
mz-korovka-eskimo|Korovka iz Korenovki — eskimo (shokolad glazurida)|Коровка из Кореновки — эскимо в шоколадной глазури|korovka eskimo glazur,эскимо в глазури,eskimo glazur,muzqaymoq,мороженое|h|dona:60|y:kizk-eskimo
mz-korovka-stakan-shokolad|Korovka iz Korenovki — shokoladli plombir vafli stakanchada (15%)|Коровка из Кореновки — пломбир шоколадный в вафельном стаканчике 15%|korovka stakancha,коровка стаканчик,shokoladli plombir stakancha,muzqaymoq,мороженое|h|dona:80|y:kizk-stakan-shokolad
mz-korovka-konteyner|Korovka iz Korenovki — plombir shokolad parchali (300 g)|Коровка из Кореновки — пломбир с шоколадной крошкой (300 г)|korovka 300,коровка 300,plombir konteyner,пломбир контейнер,muzqaymoq,мороженое|h|shar:60,banka:300|y:kizk-konteyner
mz-bomba-konus|Bomba konus XXL (qulupnay)|Бомба конус XXL клубника|bomba,бомба,bomba konus,бомба конус,shin-layn,шин-лайн,rojok qulupnay,muzqaymoq,мороженое|h|dona:145|y:shinline-bomba-konus
mz-plombir-stakan|Plombir vanilli (15% yog', yorliq bo'yicha)|Пломбир ванильный (15%)|plombir stakancha,stakanchik,muzqaymoq stakancha,пломбир стаканчик,мороженое в стаканчике,ice cream cup|h|shar:60,dona:80|y:plombir-stakan
mz-plombir-vafli|Plombir vafli stakanchada (chernika qatlamli)|Пломбир в вафельном стаканчике с черникой|plombir vafli stakancha,стаканчик пломбир,вафельный стаканчик мороженое|h|dona:93|y:rojok
mz-plombir-briket|Plombir (briket, yog'li)|Пломбир (брикет)|plombir briket,брикет пломбир,мороженое брикет,vanilla rich|h|dona:200,bolak:50,shar:60|u:167573
mz-vanil|Muzqaymoq (vanilli, sutli)|Мороженое сливочное ванильное|vanil muzqaymoq,slivochnoe,сливочное мороженое,ванильное мороженое,vanilla ice cream,kafe shar,шарик мороженого|h|shar:60,dona:80|u:167575
mz-shokolad|Shokoladli muzqaymoq|Мороженое шоколадное|shokolad muzqaymoq,шоколадное мороженое,chocolate ice cream|h|shar:60,dona:80|u:168809
mz-shokolad-plombir|Shokoladli plombir (yog'li)|Пломбир шоколадный|shokoladli plombir,шоколадный пломбир|h|shar:60,dona:80|u:168136
mz-qulupnay|Qulupnayli muzqaymoq|Мороженое клубничное|qulupnay muzqaymoq,клубничное мороженое,strawberry ice cream|h|shar:60,dona:80|u:168810
mz-light|Muzqaymoq (kam yog'li)|Мороженое нежирное|yengil muzqaymoq,нежирное мороженое,лёгкое мороженое,light ice cream|h|shar:60,dona:80|u:167572
mz-shakarsiz|Muzqaymoq (shakar qo'shilmagan)|Мороженое без сахара|shakarsiz muzqaymoq,мороженое без сахара,no sugar ice cream|h|shar:60|u:169631
mz-yumshoq|Yumshoq muzqaymoq (apparatdan)|Мягкое мороженое|soft muzqaymoq,мягкое мороженое,soft serve,мороженое из аппарата|h|dona:120,porsiya:150|u:167981
mz-konus-shokolad|Muzqaymoq vafli konusda (shokolad va yong'oq bilan)|Мороженое в рожке (шоколад, орехи)|rojok,рожок,konus muzqaymoq,vafli konus,мороженое рожок,cone|h|dona:110|u:172228
mz-konus-sundae|Muzqaymoq vafli konusda (sousli)|Рожок с мороженым и топпингом|sundae konus,рожок с топпингом|h|dona:120|u:171306
mz-eskimo-yongoq|Eskimo (shokolad va yong'oqli qoplama)|Эскимо в шоколаде с орехами|eskimo yongoqli,эскимо с орехами,ice cream bar nuts|h|dona:80|u:168130
mz-sorbet|Sorbet (mevali, sutli)|Сорбет (щербет)|sherbet,щербет,сорбет,sorbet|h|shar:60|u:167577
mz-muzli|Muzli muzqaymoq (fruktoviy lyod)|Фруктовый лёд|fruktoviy led,фруктовый лед,muzli,ice pop,popsicle|h|dona:70|u:168813
mz-meva-bar|Mevali muzqaymoq (sharbatli)|Мороженое фруктовое (сок)|mevali muzqaymoq,фруктовое мороженое,fruit bar|h|dona:70|u:169632
mz-sundae|Sundae (muzqaymoq sous bilan)|Сандей (мороженое с топпингом)|sande,сандэ,сандей,sundae|h|porsiya:150|u:169900
mz-vafli-stakan|Vafli stakancha (bo'sh)|Вафельный стаканчик|vafli konus bosh,вафельный рожок,ice cream cone empty|h|dona:12|u:175000
mz-makflurri|McFlurry (Oreo bilan)|Макфлурри с Oreo|mcflurry,макфлури,макфлурри|h|porsiya:285|u:173304
sport-snickers-marathon|Sport batonchik (Snickers Marathon)|Спортивный батончик Snickers Marathon|marathon bar,energy bar,энергетический батончик|x|dona:55|u:173132
sport-izotonik|Izotonik ichimlik (Powerade)|Изотоник (Powerade)|izotonik,изотоник,sport ichimlik,спортивный напиток,powerade,gatorade|i|stakan:250,shisha05:500|u:175108
sport-izotonik-zero|Izotonik ichimlik (shakarsiz, Powerade Zero)|Изотоник без сахара|powerade zero,изотоник без сахара|i|shisha05:500|u:174113
protein-bar-60|Protein batonchik (60 g, shakarsiz)|Протеиновый батончик (60 г, без сахара)|protein batonchik,протеиновый батончик,bombbar,бомбар,protein bar 60|x|dona:60|y:bombbar-60
protein-bar-40|Protein batonchik (40 g)|Протеиновый батончик (40 г)|protein batonchik 40,протеиновый батончик 40,fitness bar|x|dona:40|y:fitness-bar-40
protein-kokteyl-tayyor|Protein kokteyl (tayyor, shishada)|Протеиновый коктейль (готовый)|protein ichimlik,готовый протеиновый коктейль,protein shake rtd|x|shisha05:500,stakan:250|y:protein-shake-rtd
coca-cola|Coca-Cola|Кока-кола|coca cola,cocacola,koka kola,кока кола,кока-кола,coke,kola|i|stakan:250,banka:330,shisha05:500,shisha1:1000,shisha15:1500|u:174852
coca-cola-zero|Coca-Cola Zero (shakarsiz)|Кока-кола Зеро (без сахара)|cola zero,coke zero,кола зеро,кола без сахара,zero|i|stakan:250,banka:330,shisha05:500,shisha1:1000,shisha15:1500|y:cola-zero
pepsi|Pepsi|Пепси|pepsi cola,пепси кола,pepsi kola|i|stakan:250,banka:330,shisha05:500,shisha1:1000,shisha15:1500|u:174852
pepsi-zero|Pepsi (shakarsiz)|Пепси без сахара|pepsi max,pepsi zero,пепси макс,пепси зеро|i|stakan:250,banka:330,shisha05:500,shisha1:1000,shisha15:1500|y:pepsi-zero
fanta|Fanta (apelsin)|Фанта апельсин|fanta orange,фанта апельсиновая|i|stakan:250,banka:330,shisha05:500,shisha1:1000,shisha15:1500|y:fanta
fanta-zero|Fanta Zero (shakarsiz)|Фанта Зеро (без сахара)|fanta zero,фанта зеро,фанта без сахара|i|stakan:250,banka:330,shisha05:500,shisha1:1000,shisha15:1500|y:fanta-zero
sprite|Sprite|Спрайт|sprayt,спрайт,lemon lime|i|stakan:250,banka:330,shisha05:500,shisha1:1000,shisha15:1500|u:173205
sprite-zero|Sprite Zero (shakarsiz)|Спрайт Зеро (без сахара)|sprite zero,спрайт зеро,спрайт без сахара|i|stakan:250,banka:330,shisha05:500,shisha1:1000,shisha15:1500|u:173204
apelsin-gazli|Apelsinli gazli ichimlik|Газировка апельсиновая|apelsin gazli,оранжевая газировка,orange soda|i|stakan:250,shisha05:500,shisha1:1000,shisha15:1500|u:174854
red-bull|Red Bull (energetik)|Ред Булл|red bull,ред булл,redbull|i|banka:250|u:173210
red-bull-zero|Red Bull (shakarsiz)|Ред Булл без сахара|red bull sugar free,ред булл без сахара|i|banka:250|u:171870
monster|Monster (energetik)|Монстр (энергетик)|monster energy,монстр|i|banka:500|u:171935
sharbat-ananas|Ananas sharbati|Ананасовый сок|ananas sharbat,сок ананасовый,pineapple juice|i|stakan:250,shisha1:1000|u:168187
sharbat-olcha|Olcha sharbati|Вишнёвый сок|olcha sharbat,вишневый сок,cherry juice|i|stakan:250,shisha1:1000|u:167807
sharbat-klyukva|Klyukva sharbati (shakarsiz)|Клюквенный сок|klyukva,клюквенный сок,морс|i|stakan:250|u:168117
sharbat-olxori|Olxo'ri sharbati|Сливовый сок (черносливовый)|olxori sharbat,сливовый сок,prune juice|i|stakan:250|u:167753
nektar-shaftoli|Shaftoli nektari|Персиковый нектар|shaftoli sharbat,персиковый сок,peach nectar|i|stakan:250,shisha1:1000|u:168185
nektar-orik|O'rik nektari|Абрикосовый нектар|orik sharbat,абрикосовый сок,apricot nectar|i|stakan:250,shisha1:1000|u:171704
nektar-mango|Mango nektari|Нектар манго|mango sharbat,сок манго,mango nectar|i|stakan:250,shisha1:1000|u:167785
nektar-nok|Nok nektari|Грушевый нектар|nok sharbat,грушевый сок,pear nectar|i|stakan:250,shisha1:1000|u:168186
mevali-ichimlik|Mevali ichimlik (punch)|Фруктовый напиток (морс-пунш)|meva ichimlik,фруктовый напиток,fruit punch|i|stakan:250,shisha1:1000|u:171914
limonad-limon|Limonad (limonli, uy)|Лимонад лимонный|limonli ichimlik,лимонад лимонный,lemonade|i|stakan:250,shisha1:1000|u:173217
choy-shakar1|Choy (1 choy qoshiq shakar bilan)|Чай с 1 ложкой сахара|shakarli choy,чай с сахаром,choy shakar bilan,sweet tea|i|piyola:205,stakan:255|m:173227*200+169655*5
choy-shakar2|Choy (2 choy qoshiq shakar bilan)|Чай с 2 ложками сахара|choy ikki qoshiq shakar,чай с двумя ложками сахара|i|piyola:210,stakan:260|m:173227*200+169655*10
choy-sut-shakar|Sutli choy (shakar bilan)|Чай с молоком и сахаром|sutli choy shakarli,чай с молоком и сахаром|i|piyola:210|m:173227*150+171265*50+169655*5
espresso|Espresso|Эспрессо|espresso,эспрессо,expresso|i|dona:30|u:171891
qahva-sutli|Sutli qahva|Кофе с молоком|sutli kofe,кофе с молоком,coffee with milk|i|stakan:200,piyola:150|m:171890*150+171265*50
qahva-sutli-shakar|Sutli qahva (shakar bilan)|Кофе с молоком и сахаром|shirin kofe,кофе с сахаром,кофе сладкий|i|stakan:205|m:171890*150+171265*50+169655*5
raf|Raf qahva|Раф-кофе|raf,раф,раф кофе|i|stakan:250|m:171891*60+171255*170+169655*15
qahva-sovuq|Sovuq qahva (sutli, shirin, tayyor)|Холодный кофе (молочный, сладкий)|ice coffee,айс кофе,холодный кофе,iced coffee|i|shisha05:500,stakan:250|u:171880
issiq-shokolad|Issiq shokolad (sutda)|Горячий шоколад (на молоке)|issiq shokolad,горячий шоколад,hot chocolate|i|stakan:250|u:174118
shokoladli-sut|Shokoladli sut|Шоколадное молоко|shokolad sut,шоколадное молоко,chocolate milk|i|stakan:250,shisha05:500|u:170880
soya-sut|Soya suti|Соевое молоко|soya sut,соевое молоко,soy milk|i|stakan:250|u:172446
bodom-sut|Bodom suti (shakarsiz)|Миндальное молоко|bodom sut,миндальное молоко,almond milk|i|stakan:250|u:174832
smuzi-mango|Smuzi (mevali, tayyor)|Смузи фруктовый (готовый)|smoothie,смузи манго|i|stakan:250,shisha05:500|u:167795
snickers|Snickers|Сникерс|snikers,сникерс,snickers bar|h|dona:50|u:169589
mars|Mars (batonchik)|Марс (батончик)|марс батончик,mars bar|h|dona:50|y:mars
twix|Twix|Твикс|tviks,твикс|h|dona:50|u:168768
kitkat|KitKat|Кит-Кат|kit kat,киткат,кит кат|h|dona:42|u:167992
milky-way|Milky Way|Милки Вэй|milki vey,милки вей|h|dona:26|u:168756
mms|M&M's (shokoladli)|M&M's шоколадные|mms,эмэмдэмс,m&m,ммс|h|paket:45|u:169583
mms-yongoq|M&M's (yeryong'oqli)|M&M's с арахисом|mms arahis,m&m с арахисом|h|paket:45|u:169582
alpen-gold|Alpen Gold (sutli shokolad, fundukli)|Альпен Гольд молочный с фундуком|alpen gold,альпен голд,альпен гольд|h|plitka:90,bolak:10|y:alpen-gold
kinder-shokolad|Kinder Chocolate|Киндер шоколад|kinder,киндер|h|dona:12.5|y:kinder-choc
kinder-bueno|Kinder Bueno|Киндер Буэно|bueno,буэно|h|dona:43|y:kinder-bueno
milka|Milka (sutli shokolad)|Милка молочный шоколад|milka,милка|h|plitka:90,bolak:10|y:milka
shokolad-oq|Oq shokolad|Белый шоколад|oq shokolad,белый шоколад,white chocolate|h|bolak:10,plitka:90|u:167571
shokolad-shirin|Shokolad (shirin, qora)|Шоколад сладкий тёмный|shirin shokolad,сладкий шоколад|h|bolak:10,plitka:90|u:167977
barni|Barni (sutli pirojnoe)|Барни (бисквит с молочной начинкой)|barni,барни|h|dona:30|y:barni
pryanik|Pryanik (sgushenka bilan)|Пряник со сгущёнкой|pryanik,пряник,тульский пряник|h|dona:50|y:pryanik
pechenye-oreo|Oreo (kremli shokolad pechenye)|Печенье Oreo|oreo,орео,kremli pechenye|h|dona:11|u:172718
pechenye-qumli|Qumli pechenye (sariyog'li)|Песочное печенье|qumli pechenye,песочное печенье,shortbread|h|dona:10|u:174967
pechenye-suli|Suli pechenye|Овсяное печенье|suli pechenye,овсяное печенье,oatmeal cookie|h|dona:25|u:172725
pechenye-sariyog|Sariyog'li pechenye|Печенье сливочное|sariyogli pechenye,сливочное печенье,butter cookie|h|dona:8|u:174950
pechenye-shokolad|Shokolad bo'lakli pechenye|Печенье с шоколадной крошкой|shokoladli pechenye,печенье с шоколадом,chocolate chip cookie|h|dona:16|u:172716
pechenye-zanjabil|Zanjabilli pechenye|Имбирное печенье|zanjabil pechenye,имбирное печенье,gingersnap|h|dona:7|u:174956
krendel|Krendel (tuzli, qattiq)|Крендель (солёный)|pretzel,крендельки,кренделек|h|hovuch:30|u:167555
biskvit|Biskvit|Бисквит|biskvit,бисквит,sponge cake|h|bolak:60|u:172706
tort-shokolad|Shokoladli tort|Шоколадный торт|shokoladli tort,шоколадный торт,chocolate cake|h|bolak:100|u:174934
bulochka-darchin|Darchinli bulochka|Булочка с корицей|darchin bulochka,булочка с корицей,синнабон,cinnamon roll|h|dona:80|u:175034
pirojnoe-pishloq|Pishloqli sloyka (daniya)|Слойка с творожным сыром|daniya,слойка с сыром,danish pastry|h|dona:70|u:172754
maffin|Maffin (chernikali)|Маффин с черникой|muffin,маффин,кекс маффин|h|dona:110|u:172765
pankeyk|Pankeyk|Панкейк|pancake,панкейк,оладьи американские|h|dona:40|u:175009
vafli-belgiya|Belgiya vaflisi|Вафли бельгийские|belgiya vafli,бельгийские вафли,waffle|h|dona:75|u:175039
sloyka|Sloyka xamir (pishirilgan)|Слоёное тесто (выпеченное)|sloyka,слойка,puff pastry|h|dona:60|u:172738
donut-glazur|Donut (glazurli)|Пончик глазированный|donut glazur,пончик в глазури,glazed donut|h|dona:60|u:174992
chips-nachos|Makkajo'xori chipslari (nachos)|Кукурузные чипсы (начос)|nachos,начос,tortilla chips,кукурузные чипсы|h|hovuch:30,paket:150|u:167558
lays|Lay's (klassik, tuzli)|Лейс классические|lays,лейс,лэйс|h|paket:90,hovuch:30|y:lays
pringles|Pringles (original)|Принглс оригинальные|pringles,принглс|h|hovuch:30,banka:165|y:pringles
popkorn-sariyog|Popkorn (sariyog'li, mikroto'lqinli)|Попкорн со сливочным вкусом|popkorn mikrovolnovka,попкорн микроволновый|h|hovuch:15,paket:100|u:173141
pista-qovurilgan|Pista (kungaboqar, qovurilgan, tuzli)|Семечки жареные солёные|pista,semechki,семечки,кунгабоқар,qovurilgan pista|d|hovuch:30,stakan:60|u:169418
keshyu|Keshyu (qovurilgan, tuzli)|Кешью жареный|keshyu,кешью,cashew|d|hovuch:30|u:169421
kedr-yongogi|Kedr yong'og'i|Кедровые орехи|kedr,кедровый орех,pine nuts|d|hovuch:30|u:170591
aralash-yongoq|Aralash yong'oqlar (qovurilgan, tuzli)|Ореховая смесь (жареная)|yongoq aralash,ореховое ассорти,mixed nuts|d|hovuch:30|u:168599
yerfistiq-tuzli|Yeryong'oq (qovurilgan, tuzli)|Арахис жареный солёный|arahis tuzli,арахис солёный,peanuts salted|d|hovuch:30|u:174262
makadamiya|Makadamiya|Макадамия|macadamia,макадамия|d|hovuch:30|u:168598
pekan|Pekan yong'og'i|Пекан|pekan,пекан,pecan|d|hovuch:30|u:170182
kokos-qirindi|Kokos qirindisi|Кокосовая стружка|kokos,кокосовая стружка,coconut flakes|d|qoshiq:7|u:170170
kokos|Kokos (yangi, eti)|Кокос (мякоть)|kokos yongogi,кокос,coconut|f|bolak:45|u:170169
quruq-olma|Quritilgan olma|Сушёные яблоки|olma qoqi,сушеные яблоки,dried apple|d|hovuch:30|u:171691
quruq-nok|Quritilgan nok|Сушёная груша|nok qoqi,сушеная груша,dried pear|d|hovuch:30|u:169121
banan-chips|Banan chipslari|Банановые чипсы|banan chips,банановые чипсы,banana chips|d|hovuch:30|u:168849
klyukva-quruq|Quritilgan klyukva (shirin)|Клюква сушёная|klyukva quruq,сушеная клюква,dried cranberries|d|hovuch:30|u:171723
holva-kunjut|Holva (kunjutli, tahin)|Халва тахинная|tahin holva,кунжутная халва,тахинная халва,halva|h|bolak:30|u:167996
kozinak|Kozinak (kunjutli)|Козинак кунжутный|kozinak,козинак,sesame bar|h|dona:30|u:169588
parvarda|Parvarda|Парварда|parvarda,парварда,pashmak|h|dona:8|m:169655*85+168894*15
ledenets|Qattiq konfet (ledenets, chupa-chups)|Леденец|ledenets,леденец,chupa chups,чупа-чупс,lolipop,hard candy|h|dona:12|u:167990
jele-konfet|Jele konfet (drajje)|Желейные конфеты (драже)|jele,желейки,jelly beans,мармеладки|h|hovuch:30|u:167991
marshmallow|Marshmallou|Маршмеллоу|marshmallow,маршмеллоу,маршмэллоу|h|dona:7|u:167995
granola-batonchik|Granola batonchik (suli)|Батончик мюсли|myusli batonchik,батончик мюсли,granola bar|h|dona:25|u:167542
guruch-xlebets|Guruch xlebtsi|Рисовые хлебцы|guruch non,рисовые хлебцы,rice cakes|n|dona:9|u:170250
mol-jigar-qov|Mol jigari (qovurilgan)|Печень говяжья жареная|jigar qovurma,qovurilgan jigar,жареная печень,печень жареная,jigar|m|porsiya:120,bolak:60|u:168627
mol-jigar-dim|Mol jigari (dimlangan)|Печень говяжья тушёная|dimlangan jigar,тушеная печень|m|porsiya:120|u:168626
qoy-jigar-qov|Qo'y jigari (qovurilgan)|Печень баранья жареная|qoy jigari,баранья печень|m|porsiya:120,bolak:60|u:172533
tovuq-jigar-qov|Tovuq jigari (qovurilgan)|Куриная печень жареная|tovuq jigar qovurma,жареная куриная печень|m|porsiya:100|u:174491
mol-buyrak|Mol buyragi (pishgan)|Почки говяжьи (варёные)|buyrak,почки,почки говяжьи|m|porsiya:100|u:169450
qoy-buyrak|Qo'y buyragi (pishgan)|Почки бараньи|qoy buyragi,бараньи почки|m|porsiya:100|u:174355
mol-yurak|Mol yuragi (pishgan)|Сердце говяжье (варёное)|yurak,сердце,говяжье сердце|m|porsiya:100|u:169448
qoy-yurak|Qo'y yuragi (pishgan)|Сердце баранье|qoy yuragi,баранье сердце|m|porsiya:100|u:172528
tovuq-yurak|Tovuq yuragi (pishgan)|Куриные сердечки|tovuq yurakchalari,куриные сердечки,сердечки|m|porsiya:100|u:171059
tovuq-oshqozon|Tovuq oshqozoni (pishgan)|Куриные желудки|oshqozon,пупки,куриные пупки,желудки|m|porsiya:100|u:171457
mol-til|Mol tili (qaynatilgan)|Язык говяжий отварной|til,язык,говяжий язык|m|tilim:20,porsiya:100|u:170598
qoy-til|Qo'y tili (pishgan)|Язык бараний|qoy tili,бараний язык|m|porsiya:100|u:174367
qorin|Qorin (mol, qaynatilgan)|Рубец говяжий (требуха)|qorin,требуха,рубец,shirdon|m|porsiya:150|u:174769
qoy-miya|Qo'y miyasi (pishgan)|Мозги бараньи|miya,мозги|m|porsiya:100|u:172526
mol-miya|Mol miyasi (qaynatilgan)|Мозги говяжьи|mol miyasi,говяжьи мозги|m|porsiya:100|u:168624
qoy-opka|Qo'y o'pkasi (pishgan)|Лёгкое баранье|opka,лёгкое,легкие|m|porsiya:100|u:174360
qoy-son|Qo'y go'shti (son, qovurilgan/duxovka)|Баранина (окорок, запечённая)|qoy son,баранья нога,баранина запеченная|m|porsiya:150,bolak:80|u:174312
qoy-kurak|Qo'y go'shti (kurak, dimlangan)|Баранина (лопатка, тушёная)|qoy kuragi,баранья лопатка,тушеная баранина|m|porsiya:150|u:172497
qoy-qiyma|Qo'y qiymasi (pishgan)|Фарш бараний (жареный)|qoy qiyma,бараний фарш|m|porsiya:100|u:172544
qoy-kabob-bolak|Qo'y go'shti (kabobga, yog'siz, pishgan)|Баранина (для шашлыка, постная)|kabob gosht,баранина постная|m|porsiya:150|u:172509
mol-tosh|Mol go'shti (to'sh, dimlangan)|Говядина (грудинка, тушёная)|mol tosh,говяжья грудинка,тушеная говядина|m|porsiya:150|u:169440
mol-qaynatilgan|Mol go'shti (qaynatilgan, yog'siz)|Говядина отварная (постная)|qaynatilgan gosht,отварная говядина,варёная говядина|m|porsiya:150|u:169442
mol-kotlet-grill|Mol go'shti kotleti (grill)|Котлета говяжья (гриль)|burger kotlet,котлета для бургера,beef patty|m|dona:90|u:174032
buzoq|Buzoq go'shti (dimlangan)|Телятина тушёная|buzoq,телятина|m|porsiya:150|u:173818
buzoq-qiyma|Buzoq qiymasi (qovurilgan)|Фарш телячий (жареный)|buzoq qiyma,телячий фарш|m|porsiya:100|u:174879
echki|Echki go'shti (pishgan)|Козлятина|echki,козлятина,goat|m|porsiya:150|u:175304
quyon|Quyon go'shti (pishgan)|Крольчатина|quyon,кролик,крольчатина|m|porsiya:150|u:172522
ordak|O'rdak go'shti (terisiz, pishgan)|Утка (без кожи)|ordak,утка,duck|m|porsiya:150|u:172411
kurka-kokrak|Kurka ko'kragi (pishgan)|Индейка грудка запечённая|kurka kokragi,грудка индейки|m|porsiya:150|u:171496
tovuq-qaynatilgan|Tovuq go'shti (qaynatilgan, terisiz)|Курица отварная (без кожи)|qaynatilgan tovuq,отварная курица|m|porsiya:150|u:171451
tovuq-boldir-qov|Tovuq boldiri (qovurilgan, terili)|Куриная голень жареная|boldir,голень,куриная ножка жареная|m|dona:75|u:172374
tovuq-qanot-qov|Tovuq qanoti (qovurilgan)|Куриные крылья жареные|qanot qovurma,жареные крылышки|m|dona:35|u:173628
tovuq-kfc|Tovuq (KFC uslubida, qovurilgan)|Курица жареная (как в KFC)|kfc,кфс,qarsildoq tovuq|q|bolak:150|u:170744
tovuq-boneless|Tovuq bo'laklari (panirovkada qovurilgan)|Курица в панировке (стрипсы)|strips,стрипсы,tenders|q|dona:20,porsiya:150|u:170718
skumbriya|Skumbriya (pishgan)|Скумбрия|skumbriya,скумбрия,mackerel|m|porsiya:150|u:175120
seld|Seld (marinadlangan)|Сельдь маринованная|seld,селёдка,сельдь|m|bolak:30,porsiya:100|u:175118
seld-dudlangan|Seld (dudlangan)|Сельдь копчёная|dudlangan seld,копченая сельдь|m|porsiya:100|u:173668
forel|Forel (pishgan)|Форель|forel,форель,trout|m|porsiya:150|u:173718
mintay|Mintay (pishgan)|Минтай|mintay,минтай,pollock|m|porsiya:150|u:173681
baliq-panirovka|Baliq (panirovkada qovurilgan)|Рыба в панировке жареная|panirovka baliq,рыба в кляре|m|porsiya:150|u:174187
kalmar|Kalmar (qovurilgan)|Кальмар жареный|kalmar,кальмар,squid|m|porsiya:100|u:171982
ikra|Ikra (qizil/qora)|Икра (красная/чёрная)|ikra,икра,caviar|m|qoshiq:15|u:174188
krab-tayoq|Krab tayoqchalari|Крабовые палочки|krab,крабовые палочки,surimi|m|dona:17,porsiya:100|u:173702
qizil-baliq-konserva|Qizil baliq (gorbusha, konserva)|Горбуша консервированная|gorbusha,горбуша консервы|m|porsiya:100|u:175175
midiya|Midiya (pishgan)|Мидии|midiya,мидии,mussels|m|porsiya:100|u:174217
krab|Krab go'shti (pishgan)|Краб (мясо)|krab gosht,мясо краба|m|porsiya:100|u:172008
tunets-yog|Tunets (yog'da, konserva)|Тунец в масле|tunets yogda,тунец в масле|m|dona:150,porsiya:80|u:173708
tuxum-qov-aralash|Tuxum (aralashtirib qovurilgan)|Яичница-болтунья|boltunya,болтунья,scrambled eggs|m|porsiya:120|u:172187
non-pita|Pita non|Пита|pita,пита|n|dona:60|u:174915
non-bugdoy|Bug'doy noni (to'liq donli)|Хлеб цельнозерновой|qora bugdoy non,цельнозерновой хлеб,whole wheat bread|n|tilim:30|u:172688
non-jovdar|Jovdar noni|Хлеб ржаной|jovdar,ржаной хлеб,rye bread|n|tilim:30|u:172684
bagel|Bagel|Бейгл|bagel,бейгл,бублик|n|dona:100|u:175049
burger-bulochka|Burger bulochkasi|Булочка для бургера|burger non,булочка для бургера,hot dog bun|n|dona:50|u:172796
tortilya|Tortilya (bug'doy)|Тортилья пшеничная|tortilla,тортилья|n|dona:45|u:167535
pishloq-chedder|Chedder pishlog'i|Сыр чеддер|chedder,чеддер,cheddar|s|tilim:20,bolak:30|u:173414
pishloq-parmezan|Parmezan|Пармезан|parmezan,пармезан,parmesan|s|qoshiq:5,bolak:20|u:170848
pishloq-feta|Feta (brynza turi)|Фета|feta,фета,брынза фета|s|bolak:30|u:173420
pishloq-eritilgan|Eritilgan pishloq (plavlenniy)|Плавленый сыр|plavlenniy,плавленый сыр,processed cheese|s|tilim:20,dona:20|u:171290
pishloq-hochland|Plavlenniy pishloq (Hochland)|Плавленый сыр Hochland|hochland,хохланд,plavlenniy hochland|s|qoshiq:20,dona:20|y:plavlenniy
yogurt-yunon|Yunon yogurti (yog'siz)|Греческий йогурт (обезжиренный)|grek yogurt,греческий йогурт,greek yogurt|s|stakan:150,qoshiq:20|u:170894
yogurt-meva2|Mevali yogurt (kam yog'li)|Йогурт фруктовый (нежирный)|mevali yogurt,фруктовый йогурт|s|stakan:125|u:173456
sirok-glazur2|Glazurlangan tvorog sirok (shokoladda)|Сырок творожный глазированный (в шоколаде)|sirok,сырок|s|dona:40|y:sirok-glaz
bulgur|Bulg'ur (pishgan)|Булгур (отварной)|bulgur,булгур|g|kosa:200,qoshiq:25|u:170287
kuskus|Kuskus (pishgan)|Кускус|kuskus,кускус,couscous|g|kosa:200|u:169700
perlovka|Arpa yormasi (perlovka, pishgan)|Перловка (отварная)|perlovka,перловка,arpa|g|kosa:200|u:170285
tariq|Tariq (pishgan)|Пшено (отварное)|tariq,пшено,пшенная каша,millet|g|kosa:200|u:168871
guruch-jigarrang|Jigarrang guruch (pishgan)|Бурый рис (отварной)|jigarrang guruch,бурый рис,brown rice|g|kosa:200|u:169704
lapsha-tuxum|Tuxumli lapsha (pishgan)|Лапша яичная (отварная)|lapsha,лапша,egg noodles|g|kosa:200|u:168919
ramen|Tez tayyor lapsha (quruq)|Лапша быстрого приготовления (сухая)|ramen,доширак,rollton,роллтон,быстрая лапша|g|paket:90|u:171177
doshirak-pishloq|Doshirak (pishloqli ramen, quruq)|Доширак сырный рамен (сухой)|doshirak pishloq,доширак сыр,cheese ramen|g|paket:90|y:doshirak
guruch-lapsha|Guruch lapshasi (pishgan)|Рисовая лапша|guruch lapsha,рисовая лапша,rice noodles|g|kosa:200|u:168914
kinoa|Kinoa (pishgan)|Киноа|kinoa,киноа,quinoa|g|kosa:185|u:168917
suli-quruq|Suli yormasi (quruq)|Овсяные хлопья (сухие)|gerkules,геркулес,овсянка сухая|g|qoshiq:10,stakan:90|u:173904
granola-uy|Granola (uyda)|Гранола (домашняя)|granola uy,домашняя гранола|g|qoshiq:15,stakan:120|u:171646
kartoshka-duxovka|Kartoshka (po'stida pishirilgan)|Картофель запечённый в мундире|duxovka kartoshka,печеный картофель,baked potato|g|dona:170|u:170093
makaron-pishgan2|Makaron (qaynatilgan, oddiy)|Макароны отварные|pasta pishgan,паста отварная|g|kosa:200|u:169737
pomelo|Pomelo|Помело|pomelo,помело|f|bolak:100|u:167754
chernika|Chernika|Черника|chernika,черника,blueberry|f|stakan:150,hovuch:50|u:171711
ejevika|Ejevika|Ежевика|ejevika,ежевика,blackberry|f|stakan:145|u:173946
papayya|Papayya|Папайя|papaya,папайя|f|bolak:150|u:169926
smorodina-qora|Qora smorodina|Чёрная смородина|qora smorodina,черная смородина|f|stakan:110|u:173963
smorodina-qizil|Qizil smorodina|Красная смородина|qizil smorodina,красная смородина|f|stakan:110|u:173964
krijovnik|Krijovnik|Крыжовник|krijovnik,крыжовник,gooseberry|f|stakan:150|u:173030
nektarin|Nektarin|Нектарин|nektarin,нектарин|f|dona:140|u:169914
shaftoli-konserva|Shaftoli (konserva, sharbatli)|Персики консервированные|konserva shaftoli,консервированные персики|f|bolak:40,stakan:250|u:169112
ananas-konserva|Ananas (konserva)|Ананас консервированный|konserva ananas,консервированный ананас|f|bolak:40,stakan:250|u:169944
gilos-konserva|Gilos (konserva)|Черешня консервированная|konserva gilos,черешня консервированная|f|stakan:250|u:173960
qovoqcha|Qovoqcha (kabachok, qaynatilgan)|Кабачок (отварной)|kabachok,кабачок,zucchini|v|dona:200,likop:180|u:169292
qoziqorin-qaynatilgan|Qo'ziqorin (qaynatilgan)|Шампиньоны отварные|qaynatilgan qoziqorin,грибы отварные|v|likop:150|u:169252
makkajoxori-konserva|Makkajo'xori (konserva)|Кукуруза консервированная|konserva makkajoxori,кукуруза консервы,sweet corn|v|qoshiq:25,stakan:165|u:169214
noxat-konserva|Ko'k no'xat (konserva)|Горошек консервированный|konserva noxat,горошек консервы,green peas canned|v|qoshiq:25,stakan:160|u:170015
loviya-konserva|Qizil loviya (konserva)|Фасоль красная консервированная|konserva loviya,фасоль консервы|v|stakan:175|u:174285
loviya-tomat|Loviya (tomatda, konserva)|Фасоль в томате|loviya tomatda,фасоль в томатном соусе,baked beans|v|stakan:250|u:175182
karam-tuzlangan|Tuzlangan karam (kvashenaya)|Квашеная капуста|kvashenaya karam,квашеная капуста,sauerkraut|v|likop:150|u:169279
batat|Batat (shirin kartoshka, pishirilgan)|Батат запечённый|batat,батат,sweet potato|v|dona:150|u:168483
sparja|Sparja (qaynatilgan)|Спаржа (отварная)|sparja,спаржа,asparagus|v|porsiya:100|u:168390
kok-piyoz|Ko'k piyoz|Зелёный лук|kok piyoz,зеленый лук,spring onion|v|qoshiq:6,hovuch:30|u:170005
shivit|Shivit (ukrop)|Укроп|ukrop,укроп,dill|v|qoshiq:3,hovuch:20|u:172233
kashnich|Kashnich (kinza)|Кинза|kinza,кинза,coriander,cilantro|v|hovuch:20|u:169997
petrushka|Petrushka|Петрушка|petrushka,петрушка,parsley|v|hovuch:20|u:170416
big-mac|Big Mac|Биг Мак|big mak,биг мак,бигмак|q|dona:215|u:170720
chizburger|Chizburger|Чизбургер|cheeseburger,чизбургер|q|dona:115|u:170690
pitsa-pishloq|Pitsa (pishloqli)|Пицца сырная (маргарита)|margarita,маргарита,cheese pizza|q|bolak:110|u:173292
lazanya|Lazanya (go'shtli)|Лазанья с мясом|lazanya,лазанья,lasagna|q|bolak:250|u:169850
spagetti-bolonez|Spagetti (go'shtli sous bilan)|Спагетти болоньезе|bolonez,болоньезе,spaghetti|q|likop:300|u:167680
piyoz-halqa|Piyoz halqalari (qovurilgan)|Луковые кольца|onion rings,луковые кольца|q|porsiya:100|u:170697
tako|Tako (mol go'shtli)|Тако с говядиной|taco,тако|q|dona:80|u:170689
burrito|Burrito (loviya va go'shtli)|Буррито с фасолью и говядиной|burrito,буррито|q|dona:200|u:173277
nachos-pishloq|Nachos (pishloqli)|Начос с сыром|nachos pishloq,начос с сыром|q|porsiya:120|u:170291
sendvich-baliq|Baliqli sendvich (tartar sousi bilan)|Сэндвич с рыбой|filet o fish,филе о фиш,fish sandwich|q|dona:140|u:170296
sendvich-tovuq|Tovuqli sendvich|Сэндвич с курицей|chicken sandwich,сэндвич с курицей,чикенбургер|q|dona:180|u:170295
guruch-qovurilgan|Qovurilgan guruch (xitoycha)|Жареный рис по-китайски|fried rice,жареный рис|q|likop:250|u:167668
tovuq-shirin-nordon|Shirin-nordon tovuq (xitoycha)|Курица в кисло-сладком соусе|shirin nordon tovuq,кисло-сладкая курица|q|likop:250|u:168081
falafel|Falafel|Фалафель|falafel,фалафель|q|dona:17,porsiya:100|u:172455
xummus-uy|Xummus (uyda)|Хумус домашний|uy xummus,домашний хумус|x|qoshiq:30|u:172454
tofu-qov|Tofu (qovurilgan)|Тофу жареный|qovurilgan tofu,жареный тофу|x|bolak:30|u:172451
shurva-tovuq-lapsha|Tovuqli lapsha sho'rva (konserva)|Куриный суп с лапшой (консервы)|tovuq lapsha shorva,куриный суп с лапшой|o|kosa:300|u:172909
shurva-pomidor|Pomidor sho'rva (krem-sup)|Томатный суп|pomidor shorva,томатный суп,tomato soup|o|kosa:300|u:171176
shurva-qoziqorin|Qo'ziqorinli krem-sup|Грибной крем-суп|qoziqorin shorva,грибной суп,mushroom soup|o|kosa:300|u:172915
shurva-mol-sabzavot|Mol go'shtli sabzavot sho'rva (konserva)|Суп говяжий с овощами|mol shorva,суп с говядиной и овощами|o|kosa:300|u:171190
xantal|Xantal (gorchitsa)|Горчица|gorchitsa,горчица,mustard|x|qoshiq:5|u:172234
bbq-sous|BBQ sousi|Соус барбекю|barbekyu,барбекю,bbq|x|qoshiq:17|u:174523
pesto|Pesto sousi|Соус песто|pesto,песто|x|qoshiq:16|u:171579
rench|Rench sousi|Соус ранч|ranch,ранч|x|qoshiq:15|u:173592
margarin|Margarin|Маргарин|margarin,маргарин|x|qoshiq:14|u:172347
qaymoq-kukun|Qahva uchun quruq qaymoq|Сухие сливки|suxie slivki,сухие сливки,creamer|x|qoshiq:2|u:171263
shokolad-sirop|Shokolad siropi|Шоколадный сироп|shokolad sous,шоколадный сироп,chocolate syrup|x|qoshiq:20|u:174117
qaymoq-yogli|Qaymoq (ko'pirtirish uchun, 33%)|Сливки жирные (33%)|slivki,сливки 33,whipping cream|s|qoshiq:15|u:170859
qahva-shakar|Qora qahva (shakar bilan)|Кофе чёрный с сахаром|shakarli kofe,кофе с сахаром,qahva shakarli|i|piyola:155,stakan:205|m:171890*150+169655*5
kok-choy-shakar|Ko'k choy (1 choy qoshiq shakar bilan)|Зелёный чай с сахаром|kok choy shakarli,зеленый чай с сахаром|i|piyola:205|m:171917*200+169655*5
sabzi-sharbat|Sabzi sharbati|Морковный сок|sabzi sharbat,морковный сок,carrot juice|i|stakan:250|u:170491
limon-sharbat|Limon sharbati (siqilgan)|Лимонный сок|limon suvi,лимонный сок,lemon juice|i|qoshiq:15|u:167747
kefir-qulupnay|Qulupnayli kefir|Кефир клубничный|qulupnay kefir,клубничный кефир|s|stakan:250|u:171301
pahta|Pahta (kam yog'li qatiq zardobi)|Пахта (обезжиренная)|pahta,пахта,buttermilk|s|stakan:250|u:167697
sut-quyultirilgan|Quyultirilgan sut (oddiy)|Сгущённое молоко|sgushenka,сгущенка,condensed milk|s|qoshiq:20|u:171275
sut-kukun|Quruq sut (to'liq yog'li)|Сухое молоко|quruq sut,сухое молоко,milk powder|s|qoshiq:8|u:173454
pishloq-gauda|Gauda pishlog'i|Сыр гауда|gauda,гауда,gouda|s|tilim:20,bolak:30|u:171241
pishloq-rikotta|Rikotta|Рикотта|rikotta,рикотта,ricotta|s|qoshiq:30|u:170851
kurka-qiyma|Kurka qiymasi (pishgan)|Фарш индейки|kurka qiyma,фарш индейки|m|porsiya:100|u:171506
tovuq-kokrak-qov|Tovuq ko'kragi (qovurilgan)|Куриная грудка жареная|qovurilgan kokrak,жареная грудка|m|bolak:120,porsiya:150|u:171078
tovuq-kokrak-duxovka|Tovuq ko'kragi (duxovkada)|Куриная грудка запечённая|duxovka tovuq kokrak,запеченная грудка|m|bolak:120,porsiya:150|u:171477
qoy-yogsiz-dim|Qo'y go'shti (yog'siz, dimlangan)|Баранина постная тушёная|yogsiz qoy gosht,постная баранина|m|porsiya:150|u:174327
makkajoxori-botqa|Makkajo'xori bo'tqasi (suvda)|Кукурузная каша (на воде)|makkajoxori yorma,кукурузная каша,polenta,mamaliga|g|kosa:240|u:171655
lavlagi-qaynatilgan|Lavlagi (qaynatilgan)|Свёкла отварная|qaynatilgan lavlagi,вареная свекла|v|dona:100,likop:150|u:169146
sabzi-qaynatilgan|Sabzi (qaynatilgan)|Морковь отварная|qaynatilgan sabzi,вареная морковь|v|dona:70,likop:150|u:170394
brokkoli-qaynatilgan|Brokkoli (qaynatilgan)|Брокколи отварная|qaynatilgan brokkoli,брокколи вареная|v|likop:150|u:169967
gulkaram-qaynatilgan|Gulkaram (qaynatilgan)|Цветная капуста отварная|qaynatilgan gulkaram,цветная капуста вареная|v|likop:150|u:170397
ismaloq-qaynatilgan|Ismaloq (qaynatilgan)|Шпинат отварной|qaynatilgan ismaloq,шпинат вареный|v|likop:150|u:168463
karam-qaynatilgan|Karam (qaynatilgan)|Капуста отварная|qaynatilgan karam,вареная капуста|v|likop:150|u:169976
baqlajon-qaynatilgan|Baqlajon (qaynatilgan)|Баклажан отварной|qaynatilgan baqlajon,баклажан вареный|v|likop:150|u:169229
qalampir-qizil|Bulg'or qalampiri (qizil)|Перец сладкий красный|bolgar qalampir,болгарский перец,red pepper|v|dona:120|u:170108
zanjabil|Zanjabil (ildiz)|Имбирь|zanjabil,имбирь,ginger|v|qoshiq:6|u:169231
popkorn-karamel|Popkorn (karamelli)|Попкорн карамельный|shirin popkorn,сладкий попкорн,caramel popcorn|h|hovuch:15,paket:100|u:167552
bodom-qovurilgan|Bodom (qovurilgan, tuzli)|Миндаль жареный солёный|qovurilgan bodom,жареный миндаль|d|hovuch:30|u:168596
funduk-qovurilgan|Funduk (qovurilgan)|Фундук жареный|qovurilgan funduk,жареный фундук|d|hovuch:30|u:170583
yeryongoq-pasta|Yeryong'oq pastasi|Арахисовая паста|arahis pasta,арахисовая паста,peanut butter|x|qoshiq:16|u:174266
shokolad-bodom|Sutli shokolad (bodomli)|Молочный шоколад с миндалём|bodomli shokolad,шоколад с миндалем|h|bolak:10,plitka:90|u:168754
achchiq-sous|Achchiq sous (sriracha)|Острый соус (шрирача)|sriracha,шрирача,achchiq sous,chili sauce|x|qoshiq:6|u:171186
tartar-sous|Tartar sousi|Соус тартар|tartar,тартар|x|qoshiq:14|u:171826
sendvich-tunets|Tunetsli sendvich|Сэндвич с тунцом|tuna sandwich,сэндвич с тунцом|q|dona:250|u:170299
sendvich-mol|Mol go'shtli sendvich|Сэндвич с ростбифом|roast beef sandwich,сэндвич с говядиной|q|dona:220|u:170298
mz-shokolad-light|Shokoladli muzqaymoq (kam yog'li)|Мороженое шоколадное нежирное|yengil shokoladli muzqaymoq,нежирное шоколадное мороженое|h|shar:60|u:167585
mz-yogurt|Muzlatilgan yogurt (vanilli)|Замороженный йогурт|frozen yogurt,замороженный йогурт,froyo|h|stakan:150|u:168815
mz-yogurt-shokolad|Muzlatilgan yogurt (shokoladli)|Замороженный йогурт шоколадный|shokoladli frozen yogurt|h|stakan:150|u:168104
kokos-suvi|Kokos suvi|Кокосовая вода|kokos suv,кокосовая вода,coconut water|i|stakan:250,shisha05:500|u:174831
sharbat-greypfrut|Greypfrut sharbati|Грейпфрутовый сок|greypfrut sharbat,грейпфрутовый сок|i|stakan:250,shisha1:1000|u:174678
pita-chips|Pita chipslari|Пита-чипсы|pita chips,пита чипсы|h|hovuch:30|u:173147
yongoq-mevali-aralash|Yong'oq va quruq meva aralashmasi|Ореховая смесь с сухофруктами|trail mix,студенческая смесь|d|hovuch:40|u:167561
pista-pistachio-tuzli|Pista (fistashka, qovurilgan, tuzli)|Фисташки жареные солёные|fistashka,фисташки солёные|d|hovuch:30|u:169426
braziliya-yongogi|Braziliya yong'og'i|Бразильский орех|braziliya,бразильский орех|d|hovuch:30|u:170569
kashtan|Kashtan (qovurilgan)|Каштаны жареные|kashtan,каштаны|d|hovuch:40|u:170190
pastila-meva|Mevali pastila (rulet)|Пастила фруктовая|pastila,пастила,fruit leather|h|dona:14|u:167541
nuga|Nuga (bodomli)|Нуга с миндалём|nuga,нуга,nougat|h|bolak:30|u:169060
iriska|Iriska (toffi)|Ириска (тоффи)|iriska,ириска,toffee|h|dona:8|u:169671
choko-pie|Choco Pie (zefirli shokolad pechenye)|Чоко-пай|choko pay,чокопай,choco pie|h|dona:30|u:172723
pechenye-anjir|Anjirli pechenye|Печенье с инжиром|anjirli pechenye,печенье с инжиром,fig bar|h|dona:16|u:172721
vafli-vanil|Vanilli vafli pechenye|Вафельное печенье ванильное|vanil vafli,vanilla wafers|h|dona:4,hovuch:30|u:174974
pirog-olcha|Olchali pirog|Вишнёвый пирог|olcha pirog,вишневый пирог,cherry pie|h|bolak:120|u:172780
pirog-qovoq|Qovoqli pirog|Тыквенный пирог|qovoq pirog,тыквенный пирог,pumpkin pie|h|bolak:110|u:172787
shtrudel|Olmali shtrudel|Штрудель яблочный|shtrudel,штрудель,strudel|h|bolak:70|u:175032
biskvit-oq|Oq biskvit (keks)|Бисквит белый|oq biskvit,белый бисквит|h|bolak:70|u:172709
keks-darchin|Darchinli keks (kraublli)|Кекс с корицей и крошкой|darchin keks,кекс с корицей,coffee cake|h|bolak:60|u:172700
gosht-quritilgan|Quritilgan go'sht (jerki)|Вяленая говядина (джерки)|jerki,джерки,вяленое мясо,beef jerky|m|bolak:20,paket:50|u:167536
gosht-dimlangan-konserva|Go'shtli sabzavot dimlamasi (konserva)|Рагу из говядины (консервы)|beef stew,тушеное мясо с овощами|o|kosa:250|u:173330
chili-konkarne|Chili kon karne (loviya va go'shtli)|Чили кон карне|chili,чили кон карне|q|kosa:250|u:172097
tefteli|Tefteli (go'shtli kotletchalar)|Тефтели (фрикадельки)|tefteli,тефтели,frikadelka,meatballs|m|dona:30,porsiya:150|u:171638
losos-dudlangan|Losos (dudlangan)|Лосось копчёный|dudlangan losos,копченый лосось,семга копченая|m|tilim:15,porsiya:100|u:173687
krevetka-panirovka|Krevetka (panirovkada qovurilgan)|Креветки в панировке|krevetka kляр,креветки в кляре,breaded shrimp|m|porsiya:100|u:171970
tilapiya|Tilapiya (pishgan)|Тилапия|tilapiya,тилапия|m|porsiya:150|u:175177
chortan|Cho'rtan (pishgan)|Щука|chortan,щука,pike|m|porsiya:150|u:175127
okun|Okun (pishgan)|Окунь|okun,окунь,perch|m|porsiya:150|u:173679
pishloq-shveytsar|Shveytsar pishlog'i|Сыр швейцарский|shveytsar,швейцарский сыр,swiss cheese|s|tilim:20|u:171251
pishloq-kok|Ko'k mog'orli pishloq|Сыр с голубой плесенью|blue cheese,дор блю,сыр с плесенью|s|bolak:30|u:172175
pishloq-echki|Echki pishlog'i (yumshoq)|Козий сыр мягкий|echki pishloq,козий сыр|s|bolak:30|u:173435
yogurt-vanil|Vanilli yogurt (kam yog'li)|Йогурт ванильный|vanil yogurt,ванильный йогурт|s|stakan:125|u:170888
guruch-yovvoyi|Yovvoyi guruch (pishgan)|Дикий рис (отварной)|yovvoyi guruch,дикий рис,wild rice|g|kosa:165|u:168897
makaron-yangi|Yangi makaron (pishgan)|Паста свежая (отварная)|yangi pasta,свежая паста|g|kosa:200|u:169728
popkorn-yogsiz|Popkorn (yog'siz, havoda)|Попкорн без масла|yogsiz popkorn,попкорн без масла|h|hovuch:8|u:167959
feyxoa|Feyxoa|Фейхоа|feyxoa,фейхоа,feijoa|f|dona:50|u:168176
guava|Guava|Гуава|guava,гуава|f|dona:55|u:173044
qovun-kantalupa|Qovun (kantalupa)|Дыня (канталупа)|kantalupa,канталупа,cantaloupe|f|bolak:150|u:169092
kumkvat|Kumkvat|Кумкват|kumkvat,кумкват|f|dona:19|u:168154
klyukva|Klyukva (yangi)|Клюква свежая|klyukva yangi,клюква|f|stakan:100|u:171722
turp-oq|Oq turp (daykon)|Дайкон (белая редька)|daykon,дайкон,oq turp,редька белая|v|bolak:100|u:168451
porey|Porey piyozi|Лук-порей|porey,лук порей,leek|v|dona:90|u:169246
kolrabi|Kolrabi|Кольраби|kolrabi,кольраби|v|dona:135|u:168424
qovoq-qaynatilgan|Qovoq (qaynatilgan)|Тыква отварная|qaynatilgan qovoq,тыква вареная|v|likop:200|u:168449
qoziqorin-veshenka|Veshenka qo'ziqorini|Вешенки|veshenka,вешенки,oyster mushroom|v|likop:100|u:168580
loviya-qora|Qora loviya (pishgan)|Фасоль чёрная (отварная)|qora loviya,черная фасоль|v|kosa:170|u:173735
edamame|Edamame (soya dukkagi)|Эдамаме|edamame,эдамаме|v|stakan:155|u:168411
bamiya|Bamiya (qaynatilgan)|Бамия (окра)|bamiya,бамия,okra|v|likop:160|u:169261
adrenaline|Adrenaline Rush (energetik)|Адреналин Раш (энергетик)|adrenalin,адреналин,adrenaline rush,энергетик адреналин|i|banka:250,shisha05:500|y:adrenaline
protein-pechenye|Protein pechenye (Bombbar)|Протеиновое печенье (Bombbar)|protein cookie,протеиновое печенье,bombbar cookie,fitness cookie|x|dona:40|y:bombbar-cookie
kokos-batonchik|Kokosli shokoladli batonchik (Bounty turi)|Кокосовый батончик в шоколаде (типа Bounty)|bounty,баунти,kokosli batonchik,кокосовый батончик|h|dona:57|u:168759
qaymoq-10|Qaymoq (10%, qahva uchun)|Сливки 10%|slivki 10,сливки 10,half and half|s|qoshiq:15|u:171255
`;
const rows = T.trim().split('\n').map((l) => l.split('|'));
/* «Yemaydiganlarim» teglari (tools/cheklov-teglar.js): shubhali bo'lsa teg QO'YILADI (ehtiyotkor tomon) — cho'chqa tegi bundan mustasno. */
const L = (x) => x.trim().split(/\s+/);
const TEG = {
  sut: L(`mz-plombir-stakan mz-plombir-briket mz-vanil mz-shokolad mz-shokolad-plombir mz-qulupnay mz-light mz-shakarsiz mz-yumshoq mz-konus-shokolad mz-konus-sundae mz-eskimo-yongoq mz-sorbet mz-sundae mz-makflurri mz-shokolad-light mz-yogurt mz-yogurt-shokolad
    sport-snickers-marathon protein-bar-60 protein-bar-40 protein-kokteyl-tayyor mz-plombir-vafli pishloq-hochland choy-sut-shakar qahva-sutli qahva-sutli-shakar raf qahva-sovuq issiq-shokolad shokoladli-sut
    snickers mars twix bounty kitkat milky-way mms mms-yongoq alpen-gold picnic nuts kinder-shokolad kinder-bueno milka shokolad-oq shokolad-shirin shokolad-bodom barni pryanik sushki pechenye-qumli pechenye-sariyog pechenye-shokolad yubileynoe
    biskvit biskvit-oq tort-shokolad bulochka-darchin pirojnoe-pishloq maffin pankeyk vafli-belgiya donut-glazur choko-pie iriska nuga keks-darchin pirog-qovoq shtrudel popkorn-sariyog popkorn-karamel
    pishloq-chedder pishloq-parmezan pishloq-feta pishloq-eritilgan pishloq-gauda pishloq-rikotta pishloq-shveytsar pishloq-kok pishloq-echki yogurt-yunon yogurt-meva2 yogurt-vanil ryajenka varenets snejok tan sirok-glazur2 kefir-qulupnay pahta sut-quyultirilgan sut-kukun qaymoq-yogli qaymoq-10 qaymoq-kukun
    tuxum-qov-aralash pitsa-pishloq big-mac chizburger lazanya nachos-pishloq tako burrito sendvich-baliq sendvich-tovuq sendvich-tunets rench pesto tefteli margarin`),
  tuxum: L(`protein-pechenye tuxum-qov-aralash biskvit biskvit-oq tort-shokolad bulochka-darchin pirojnoe-pishloq maffin pankeyk vafli-belgiya donut-glazur choko-pie pryanik keks-darchin shtrudel pirog-olcha pirog-qovoq pechenye-oreo pechenye-qumli pechenye-suli pechenye-sariyog pechenye-shokolad pechenye-zanjabil pechenye-anjir yubileynoe barni vafli-vanil
    lapsha-tuxum makaron-yangi krab-tayoq tefteli baliq-panirovka krevetka-panirovka tovuq-boneless tovuq-kfc sendvich-baliq sendvich-tovuq sendvich-tunets big-mac rench tartar-sous mz-makflurri protein-pechenye`),
  yongoq: L(`snickers sport-snickers-marathon mms-yongoq picnic nuts kinder-bueno mz-eskimo-yongoq mz-konus-shokolad shokolad-bodom nuga pesto keshyu kedr-yongogi aralash-yongoq yerfistiq-tuzli makadamiya pekan braziliya-yongogi pista-pistachio-tuzli kashtan bodom-qovurilgan funduk-qovurilgan yeryongoq-pasta yongoq-mevali-aralash granola-batonchik granola-uy protein-bar-60 protein-bar-40 protein-bar-50`),
  glyuten: L(`un protein-pechenye mz-plombir-vafli doshirak-pishloq mz-plombir-stakan mz-konus-shokolad mz-konus-sundae mz-vafli-stakan mz-makflurri sport-snickers-marathon protein-bar-60 protein-bar-40 protein-bar-50 protein-pechenye twix kitkat mars milky-way picnic nuts kinder-bueno barni pryanik sushki
    pechenye-oreo pechenye-qumli pechenye-suli pechenye-sariyog pechenye-shokolad pechenye-zanjabil pechenye-anjir yubileynoe vafli-vanil krendel biskvit biskvit-oq tort-shokolad bulochka-darchin pirojnoe-pishloq maffin pankeyk vafli-belgiya sloyka donut-glazur choko-pie keks-darchin pirog-olcha pirog-qovoq shtrudel parvarda pita-chips granola-batonchik granola-uy
    non-pita non-bugdoy non-jovdar bagel burger-bulochka tortilya bulgur kuskus perlovka lapsha-tuxum ramen makaron-pishgan2 makaron-yangi suli-quruq shurva-tovuq-lapsha gosht-dimlangan-konserva
    big-mac chizburger pitsa-pishloq lazanya spagetti-bolonez piyoz-halqa tako burrito sendvich-baliq sendvich-tovuq sendvich-tunets sendvich-mol baliq-panirovka krevetka-panirovka tovuq-kfc tovuq-boneless tefteli falafel tovuq-shirin-nordon`),
  baliq: L(`skumbriya seld seld-dudlangan forel mintay baliq-panirovka kalmar ikra krab-tayoq qizil-baliq-konserva midiya krab tunets-yog tunets-suv losos-dudlangan krevetka-panirovka tilapiya chortan okun sendvich-baliq sendvich-tunets`),
  choshqa: []                      // cho'chqa tegi FAQAT bekon va pepperonida (tools/cheklov-teglar.js QOLDA) — kengaytma taomlariga QO'YILMAYDI (CLAUDE.md «Cho'chqa tegi qoidasi»)
};
for (const [t, ids] of [['sut', ['kokos-batonchik', 'protein-pechenye', 'mz-plombir-vafli', 'pishloq-hochland']], ['tuxum', ['protein-pechenye']], ['glyuten', ['protein-pechenye', 'mz-plombir-vafli', 'doshirak-pishloq']],
  /* v52: Sezar sousi — tuxum va baliq (anchous, ehtiyot), parmezan, kruton; sutli pechenye — sut, tuxum, un; Lotus — bug'doy uni; kepak non — bug'doy */
  ['glyuten', ['kepak-non', 'sezar-salat', 'lotus-biscoff', 'pechenye-molochnoe']], ['sut', ['sezar-salat', 'pechenye-molochnoe']], ['tuxum', ['sezar-salat', 'pechenye-molochnoe']], ['baliq', ['sezar-salat']]]) ids.forEach((i) => { if (!TEG[t].includes(i)) TEG[t].push(i); });
/* oqsil manbasi (tools/oqsil-teglar.js): qolganlari tur bo'yicha (s — sut, boshqalar — yoq) */
const OQSIL = Object.assign({},
  ...L(`mol-jigar-qov mol-jigar-dim qoy-jigar-qov mol-buyrak qoy-buyrak mol-yurak qoy-yurak mol-til qoy-til qorin qoy-miya mol-miya qoy-opka qoy-son qoy-kurak qoy-qiyma qoy-kabob-bolak qoy-yogsiz-dim mol-tosh mol-qaynatilgan mol-kotlet-grill buzoq buzoq-qiyma echki gosht-quritilgan gosht-dimlangan-konserva tefteli big-mac chizburger tako sendvich-mol shurva-mol-sabzavot`).map((i) => ({ [i]: 'qizil' })),
  ...L(`tovuq-jigar-qov tovuq-yurak tovuq-oshqozon ordak kurka-kokrak kurka-qiyma tovuq-qaynatilgan tovuq-boldir-qov tovuq-qanot-qov tovuq-kokrak-qov tovuq-kokrak-duxovka tovuq-kfc tovuq-boneless sendvich-tovuq shurva-tovuq-lapsha tovuq-shirin-nordon`).map((i) => ({ [i]: 'tovuq' })),
  ...L(`skumbriya seld seld-dudlangan forel mintay baliq-panirovka kalmar ikra krab-tayoq qizil-baliq-konserva midiya krab tunets-yog tunets-suv losos-dudlangan krevetka-panirovka tilapiya chortan okun sendvich-baliq sendvich-tunets`).map((i) => ({ [i]: 'baliq' })),
  ...L(`tuxum-qov-aralash`).map((i) => ({ [i]: 'tuxum' })),
  ...L(`falafel xummus-uy tofu-qov edamame loviya-qora loviya-konserva loviya-tomat noxat-konserva`).map((i) => ({ [i]: 'dukkak' })),
  ...L(`protein-bar-60 protein-bar-40 protein-bar-50 protein-pechenye protein-kokteyl-tayyor pitsa-pishloq nachos-pishloq`).map((i) => ({ [i]: 'sut' })),
  ...L(`quyon burrito chili-konkarne lazanya spagetti-bolonez`).map((i) => ({ [i]: 'aralash' })),
  ...L(`sezar-salat`).map((i) => ({ [i]: 'tovuq' })), ...L(`kepak-non olma-sirka lotus-biscoff pechenye-molochnoe fuze-tea`).map((i) => ({ [i]: 'yoq' })));          // v52
{ const TR = require('./ovqatlar-turk.js'); for (const k of Object.keys(TR.TEG)) TEG[k] = (TEG[k] || []).concat(TR.TEG[k]); Object.assign(OQSIL, TR.OQSIL); }
{ const K2 = require('./ovqatlar-kengaytma2.js'); for (const k of Object.keys(K2.TEG)) TEG[k] = (TEG[k] || []).concat(K2.TEG[k]); Object.assign(OQSIL, K2.OQSIL); }   // v64: bazani kengaytirish, 1-bosqich   // turk taomlari (v21)
module.exports = rows; module.exports.TEG = TEG; module.exports.OQSIL = OQSIL;
