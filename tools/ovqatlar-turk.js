/* kalki.uz — turk taomlari (v21): O'zbekistondagi turk kafelarida eng ko'p uchraydiganlar. Format: tools/ovqatlar-kengaytma.js bilan bir xil (id | nom | RU nom | sinonimlar | tur | porsiyalar | manba).
 * Manba: u:<USDA fdc_id> (aynan USDA) yoki m:<USDA fdc_id>*<gramm>+… (aralashma: tarkib grammlari bo'yicha hisob → «taxminiy»; tayyorlash/yog'/non turiga qarab ±15–25% farq qiladi).
 * Barcha taomlar «Turk taomlari» kategoriyasida (kat: 'turk'); id'lari «tr-» bilan boshlanadi. Ikonka rejasi: data/ikonka-reja-turk.txt → docs/ikonka-toplam-turk.txt. */
'use strict';
const V = { rizPud: 168782, pita: 174915, bun: 172796, tovuq: 171477, mol: 169440, qiymaMol: 174032, qiymaQoy: 172544, pom: 170457, bod: 168409, piyoz: 170000, qatiq: 171284, pet: 170416, yog: 171413, sariyog: 173410, pomSous: 170054, qalampir: 170427, qizilQ: 170108, feta: 173420, motsa: 170845, kartosh: 170093, kartoshQ: 170440, kok: 170005, sarimsoq: 169230, tuxum: 171287, tuxumQ: 172187, un: 168894, shakar: 169655, yongoq: 170187, bulgurP: 170287, bulgurQ: 170688, osh: 172421, loviya: 175203, baqlajon: 169228, qovoqcha: 169291, ismaloq: 168462, sut: 171265, irmik: 169715, pasta: 169728, pomPasta: 170459, sabziP: 170394, makkajoxori: 169214, zaytun: 169094, kunjut: 170150, bagel: 175049, choy: 173227, qahva: 171890, kraxmal: 169698, asal: 169640, anjirQ: 173941, bread: 172675, cheddar: 173414 };
const M = (...p) => 'm:' + p.map(([k, g]) => (k === 'suv' ? 'suv' : V[k]) + '*' + g).join('+');
const ROWS = [
  ['tr-doner-tovuq-lavash', "Doner (tovuq, lavashda)", 'Донер куриный в лаваше', 'doner,doner kabob,donar,shaurma doner,донер,донер кебаб,шаурма донер,döner,tovuq doner,doner lavash', 'q', 'dona:270', M(['pita', 80], ['tovuq', 100], ['pom', 30], ['bod', 20], ['piyoz', 15], ['qatiq', 25])],
  ['tr-doner-mol-lavash', "Doner (mol go'shti, lavashda)", 'Донер говяжий в лаваше', 'mol doner,doner,донер,донер кебаб,шаурма донер,döner,doner lavash', 'q', 'dona:270', M(['pita', 80], ['mol', 100], ['pom', 30], ['bod', 20], ['piyoz', 15], ['qatiq', 25])],
  ['tr-doner-mol-non', "Doner (mol go'shti, nonda)", 'Донер говяжий в булке', 'doner non,doner burger,ekmek arasi,донер в булке,донер в хлебе,döner ekmek', 'q', 'dona:250', M(['bun', 60], ['mol', 100], ['pom', 30], ['bod', 20], ['piyoz', 15], ['qatiq', 25])],
  ['tr-iskender', 'Iskender kabob', 'Искендер кебаб', 'iskender,iskander,искендер,искендер кебаб,iskender kebap,александр кебаб', 'o', 'porsiya:350', M(['mol', 120], ['pita', 60], ['pomSous', 60], ['qatiq', 70], ['sariyog', 15], ['qizilQ', 25])],
  ['tr-adana-kabob', 'Adana kabob', 'Адана кебаб', 'adana,adana kebap,адана,адана кебаб,achchiq kabob,adana kebab', 'o', 'six:175,porsiya:250', M(['qiymaQoy', 140], ['piyoz', 20], ['qizilQ', 15])],
  ['tr-urfa-kabob', 'Urfa kabob', 'Урфа кебаб', 'urfa,urfa kebap,урфа,урфа кебаб,urfa kebab', 'o', 'six:180,porsiya:250', M(['qiymaQoy', 110], ['qiymaMol', 40], ['piyoz', 20], ['qalampir', 10])],
  ['tr-kofte', 'Kofte (turk go\'shtli kotletchalari)', 'Кёфте (турецкие котлетки)', 'kofte,köfte,kyofte,кёфте,кофте,кюфта,kyufta,turk kotlet,izgara kofte', 'o', 'dona:32,porsiya:160', M(['qiymaMol', 130], ['bread', 10], ['piyoz', 15], ['tuxum', 5])],
  ['tr-lahmajun', 'Lahmajun', 'Лахмаджун', 'lahmajun,lahmacun,lahmadjun,лахмаджун,лахмаджо,турецкая пицца,turk pitsasi,lahmaju', 'q', 'dona:117', M(['pita', 45], ['qiymaQoy', 35], ['pom', 20], ['piyoz', 10], ['pet', 3], ['yog', 4])],
  ['tr-pide-goshtli', "Pide (go'shtli)", 'Пиде с мясом', 'pide,pide goshtli,pide kiymali,kiymali pide,пиде,пиде с мясом,турецкая лодочка,pide go\'shtli', 'q', 'dona:265', M(['pita', 130], ['qiymaMol', 80], ['piyoz', 20], ['pom', 30], ['sariyog', 5])],
  ['tr-pide-pishloqli', 'Pide (pishloqli)', 'Пиде с сыром', 'pide pishloqli,peynirli pide,пиде с сыром,pide pishloq,турецкая лодочка с сыром', 'q', 'dona:218', M(['pita', 130], ['motsa', 70], ['sariyog', 8], ['tuxum', 10])],
  ['tr-gozleme', 'Gozleme (pishloq va ismaloqli)', 'Гёзлеме (со шпинатом и сыром)', 'gozleme,gözleme,гёзлеме,гозлеме,turk quymoq,turk lepyoshka,ispanakli gozleme', 'q', 'dona:193', M(['pita', 95], ['ismaloq', 50], ['feta', 40], ['sariyog', 8])],
  ['tr-menemen', 'Menemen', 'Менемен', 'menemen,менемен,turk qovurma tuxum,pomidorli tuxum,pomidor tuxum,яичница с помидорами по-турецки', 'o', 'porsiya:270,likop:270', M(['tuxumQ', 150], ['pom', 80], ['qalampir', 30], ['yog', 10])],
  ['tr-mercimek', "Mercimek sho'rva (yasmiq)", 'Мерджимек чорбасы (чечевичный суп)', 'mercimek,mercimek corbasi,mercimek chorbasi,мерджимек,чечевичный суп по-турецки,turk yasmiq shorva,mercimek sho\'rva', 'o', 'kosa:300', M(['osh', 80], ['sabziP', 20], ['kartoshQ', 15], ['yog', 8], ['suv', 180])],
  ['tr-ezogelin', "Ezogelin sho'rva", 'Эзогелин чорбасы', 'ezogelin,ezogelin corbasi,эзогелин,эзогелин чорба,ezogelin shorva', 'o', 'kosa:300', M(['osh', 60], ['bulgurP', 30], ['pomPasta', 10], ['sariyog', 8], ['suv', 200])],
  ['tr-kumpir', 'Kumpir', 'Кумпир', 'kumpir,кумпир,pishirilgan kartoshka turkcha,turk kartoshkasi,запечённый картофель по-турецки', 'q', 'dona:380', M(['kartosh', 280], ['sariyog', 15], ['cheddar', 40], ['makkajoxori', 25], ['zaytun', 10])],
  ['tr-bulgur-pilavi', 'Bulgur pilov (turkcha)', 'Пилав из булгура', 'bulgur pilav,bulgur pilavi,pilav bulgur,булгур пилав,пилав из булгура,turk pilov', 'g', 'likop:208,kosa:208', M(['bulgurP', 170], ['pom', 20], ['piyoz', 10], ['yog', 8])],
  ['tr-coban-salat', 'Choban salati', 'Чобан салат (пастушеский)', 'coban salata,choban salat,чобан салат,пастушеский салат,pomidor bodring salat turkcha,coban salatasi', 'o', 'likop:228', M(['pom', 100], ['bod', 80], ['piyoz', 15], ['qalampir', 20], ['pet', 3], ['yog', 10])],
  ['tr-sigara-boregi', "Sigara boregi (pishloqli)", 'Сигара-бёрек (с сыром)', 'sigara boregi,sigara böreği,сигара бёрек,сигара берек,börek,borek,pishloqli rulet', 'q', 'dona:65', M(['pita', 30], ['feta', 25], ['pet', 2], ['yog', 8])],
  ['tr-manti', 'Manti (turkcha, yogurtli)', 'Манты по-турецки (с йогуртом)', 'turk manti,manti yogurtli,mantı,турецкие манты,манты с йогуртом,manti turkcha', 'o', 'porsiya:233,likop:233', M(['pasta', 100], ['qiymaMol', 40], ['qatiq', 80], ['sariyog', 8], ['pomPasta', 5])],
  ['tr-baklava', 'Baklava', 'Пахлава турецкая (баклава)', 'baklava,baklawa,баклава,пахлава турецкая,turk paxlavasi', 'h', 'dona:45', M(['un', 40], ['sariyog', 25], ['yongoq', 30], ['shakar', 30], ['asal', 10])],
  ['tr-kunefe', 'Kunefe', 'Кюнефе', 'kunefe,künefe,kyunefe,кюнефе,кунафа,kunafa,knafeh', 'h', 'porsiya:148', M(['un', 40], ['motsa', 60], ['sariyog', 12], ['shakar', 30])],
  ['tr-sutlac', 'Sutlach (guruchli sutli desert)', 'Сютлач (рисовый пудинг)', 'sutlac,sütlaç,sutlach,сютлач,рисовый пудинг,guruchli desert,sutlach pudding', 'h', 'kosa:150', M(['rizPud', 100])],
  ['tr-kadayif', 'Kadayif (yong\'oqli)', 'Кадаиф (с орехами)', 'kadayif,kadayıf,кадаиф,kataifi,катаифи', 'h', 'dona:125', M(['un', 45], ['sariyog', 20], ['yongoq', 25], ['shakar', 35])],
  ['tr-lokum', 'Lokum (turk halvasi)', 'Лукум', 'lokum,rahat lokum,лукум,рахат-лукум,turk delight,turkish delight', 'h', 'dona:15', M(['shakar', 85], ['kraxmal', 15])],
  ['tr-choy', 'Turk choyi (shakarsiz)', 'Турецкий чай (без сахара)', 'turk choyi,turk choy,cay,çay,турецкий чай,чай по-турецки,турецкий чай в стаканчике', 'i', 'piyola:100,stakan:100', 'u:173227'],
  ['tr-choy-shakar', 'Turk choyi (2 kub shakar bilan)', 'Турецкий чай (с 2 кубиками сахара)', 'turk choyi shakarli,cay seker,shakarli turk choyi,турецкий чай с сахаром', 'i', 'piyola:107,stakan:107', M(['choy', 100], ['shakar', 7])],
  ['tr-qahva', 'Turk qahvasi (shakarsiz)', 'Турецкий кофе (без сахара)', 'turk qahvasi,turkcha qahva,turk kofe,турецкий кофе,кофе по-турецки,turk coffee,kahve,cezve', 'i', 'piyola:60', 'u:171890'],
  ['tr-qahva-shakar', 'Turk qahvasi (o\'rtacha shakarli)', 'Турецкий кофе (со средним сахаром)', 'turk qahvasi shakarli,orta sekerli kahve,турецкий кофе с сахаром,orta seker', 'i', 'piyola:66', M(['qahva', 60], ['shakar', 6])],
  ['tr-simit', 'Simit (kunjutli turk bubligi)', 'Симит (турецкий бублик с кунжутом)', 'simit,симит,turk bubligi,kunjutli bubliq,турецкий бублик', 'n', 'dona:106', M(['bagel', 100], ['kunjut', 6])],
  ['tr-cacik', 'Jajik (qatiq va bodring)', 'Джаджик (йогурт с огурцом)', 'cacik,jajik,дзадзики,джаджик,цацики,tzatziki,yogurtli bodring salat', 'o', 'kosa:216', M(['qatiq', 150], ['bod', 60], ['sarimsoq', 2], ['pet', 1], ['yog', 3])],
  ['tr-tavuk-sis', 'Tavuk shish (tovuq shashlik)', 'Тавук шиш (куриный шашлык)', 'tavuk sis,tavuk shish,tavuk şiş,тавук шиш,куриный шиш,sis kebap,tovuq shish', 'o', 'six:93,porsiya:186', M(['tovuq', 140], ['yog', 6], ['qalampir', 20], ['pom', 20])],
  ['tr-karniyarik', "Karnyarik (baqlajon va qiymali)", 'Карныярык (баклажан с фаршем)', 'karniyarik,karnıyarık,карныярык,faршированный баклажан по-турецки,baqlajon qiymali,imam bayildi', 'o', 'dona:340', M(['baqlajon', 180], ['qiymaMol', 80], ['pom', 40], ['piyoz', 20], ['yog', 20])],
  ['tr-kuru-fasulye', 'Kuru fasulye (oq loviya)', 'Куру фасулье (белая фасоль)', 'kuru fasulye,куру фасулье,fasulye,turk loviyasi,белая фасоль по-турецки,oq loviya turkcha', 'o', 'kosa:300,likop:300', M(['loviya', 180], ['pomPasta', 10], ['yog', 8], ['piyoz', 20], ['suv', 60])],
  ['tr-mucver', 'Mucver (qovoqcha kotleti)', 'Мюджвер (кабачковые оладьи)', 'mucver,mücver,мюджвер,мучвер,кабачковые оладьи,qovoqcha kotlet', 'o', 'dona:50,porsiya:200', M(['qovoqcha', 150], ['tuxum', 40], ['un', 30], ['feta', 30], ['pet', 3], ['yog', 12])],
  ['tr-su-boregi', "Su boregi (pishloqli)", 'Су бёреги (слоёный с сыром)', 'su boregi,su böreği,су бёреги,су берек,слоёный бёрек,pishloqli qatlama', 'q', 'dona:235,bolak:117', M(['pita', 110], ['feta', 60], ['tuxum', 20], ['sariyog', 15], ['sut', 30])],
  ['tr-pisi', 'Pishi (turk qovurma xamiri)', 'Пиши (жареные лепёшки)', 'pisi,pişi,пиши,qovurilgan xamir,turk pishkasi', 'n', 'dona:53', M(['un', 60], ['sut', 20], ['yog', 20], ['tuxum', 6])],
  ['tr-lokma', 'Lokma (asalli qovurilgan xamir sharchalari)', 'Локма (пончики в сиропе)', 'lokma,локма,lokma tatlisi,asalli sharchalar,турецкие пончики', 'h', 'porsiya:90,dona:15', M(['un', 50], ['shakar', 25], ['yog', 15])],
  ['tr-revani', 'Revani (irmikli pirog)', 'Реване (манник в сиропе)', 'revani,реване,irmikli keks,манник турецкий,revani keki', 'h', 'bolak:140', M(['irmik', 35], ['un', 15], ['tuxum', 25], ['shakar', 45], ['sut', 20])],
  ['tr-irmik-helvasi', 'Irmik halvasi (manka halvasi)', 'Ирмик хелвасы (манная халва)', 'irmik helvasi,irmik halvasi,манная халва,ирмик хелва,helva turkcha', 'h', 'porsiya:180', M(['irmik', 45], ['sariyog', 25], ['shakar', 30], ['sut', 80])],
  ['tr-asure', 'Ashura (turk ashurasi, shirin)', 'Ашуре (турецкий десерт)', 'asure,aşure,ашуре,ashura,turk ashurasi,noah pudding', 'h', 'kosa:260', M(['bulgurP', 60], ['loviya', 30], ['anjirQ', 15], ['yongoq', 10], ['shakar', 25], ['suv', 120])],
  ['tr-kisir', 'Kisir (bulgur salat)', 'Кисыр (салат из булгура)', 'kisir,kısır,кисыр,bulgur salat,салат из булгура,turk bulgur salati', 'o', 'likop:226', M(['bulgurP', 120], ['pomPasta', 10], ['pom', 40], ['bod', 30], ['pet', 8], ['yog', 8], ['kok', 10])],
  ['tr-tulumba', 'Tulumba (shirin xamir)', 'Тулумба (десерт в сиропе)', 'tulumba,тулумба,tulumba tatlisi,turk shirinligi,турецкая тулумба', 'h', 'dona:30,porsiya:120', M(['un', 50], ['shakar', 40], ['yog', 20], ['tuxum', 10])],
  ['tr-patlican-salatasi', 'Patlijan salatasi (baqlajon ikrasi)', 'Баклажанный салат по-турецки', 'patlican salatasi,patlıcan salatası,баклажанная икра турецкая,баклажан салат турецкий,baqlajon ikra turkcha', 'o', 'kosa:173,qoshiq:25', M(['baqlajon', 150], ['yog', 10], ['sarimsoq', 3], ['kunjut', 10])]
];
/* teglar: tools/cheklov-teglar.js (sut, tuxum, yongoq, glyuten, baliq) va tools/oqsil-teglar.js. Cho'chqa tegi QO'YILMAYDI (CLAUDE.md «Cho'chqa tegi qoidasi»). */
const L = (x) => x.trim().split(/\s+/);
const TEG = {
  sut: L('tr-iskender tr-doner-tovuq-lavash tr-doner-mol-lavash tr-doner-mol-non tr-pide-pishloqli tr-gozleme tr-menemen tr-kumpir tr-sigara-boregi tr-manti tr-baklava tr-kunefe tr-sutlac tr-kadayif tr-cacik tr-mucver tr-su-boregi tr-pisi tr-revani tr-irmik-helvasi tr-karniyarik tr-lokma tr-tulumba tr-lahmajun'),
  tuxum: L('tr-menemen tr-mucver tr-su-boregi tr-pisi tr-revani tr-gozleme tr-pide-pishloqli tr-manti tr-tulumba tr-kofte tr-lokma'),
  yongoq: L('tr-baklava tr-kadayif tr-asure'),
  glyuten: L('tr-doner-tovuq-lavash tr-doner-mol-lavash tr-doner-mol-non tr-iskender tr-kofte tr-lahmajun tr-pide-goshtli tr-pide-pishloqli tr-gozleme tr-ezogelin tr-bulgur-pilavi tr-sigara-boregi tr-manti tr-baklava tr-kunefe tr-kadayif tr-simit tr-mucver tr-su-boregi tr-pisi tr-lokma tr-revani tr-irmik-helvasi tr-asure tr-kisir tr-tulumba'),
  baliq: []
};
const OQSIL = Object.assign({},
  ...L('tr-doner-mol-lavash tr-doner-mol-non tr-iskender tr-adana-kabob tr-urfa-kabob tr-kofte tr-lahmajun tr-pide-goshtli').map((i) => ({ [i]: 'qizil' })),
  ...L('tr-doner-tovuq-lavash tr-tavuk-sis').map((i) => ({ [i]: 'tovuq' })),
  ...L('tr-menemen').map((i) => ({ [i]: 'tuxum' })),
  ...L('tr-mercimek tr-kuru-fasulye').map((i) => ({ [i]: 'dukkak' })),
  ...L('tr-manti tr-karniyarik tr-ezogelin').map((i) => ({ [i]: 'aralash' })),
  ...L('tr-pide-pishloqli tr-gozleme tr-sigara-boregi tr-su-boregi tr-kunefe tr-cacik tr-mucver').map((i) => ({ [i]: 'sut' })));
module.exports = ROWS; module.exports.TEG = TEG; module.exports.OQSIL = OQSIL;
