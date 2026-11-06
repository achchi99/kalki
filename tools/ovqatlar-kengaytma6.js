/* kalki.uz — bazani kengaytirish, 4-bosqich (2026-11-06, v73): foydalanuvchilar «baza kam» dedi — qidiruvda TOPILMAGAN so'zlar (/api/qidiruv, 30 kun) va milliy/kafe/ichimlik/sushi bo'shliqlari.
 * Qiymat — USDA FDC SR Legacy komponentlari (m: — aralashma, «taxminiy»; tarkib retseptga ko'ra). Brend yorlig'i topilmagan mahsulotlar uchun brendsiz UMUMIY tur (brend nomi sinonimda).
 * Format — tools/ovqatlar-kengaytma2.js bilan bir xil. Qator: id | nom (UZ) | nom (RU) | sinonimlar | tur | porsiyalar | manba. */
'use strict';
const T = `
osh-qoy|Osh (qo'y go'shtli)|Плов с бараниной|qo'y go'shtli osh,qoy goshtli osh,palov qo'y go'shtli,devzira osh,плов баранина,плов из баранины,плов с бараниной|o|likop:300,porsiya:250|m:u:168878*60+u:172509*15+u:170393*12+u:171025*8+u:170000*5
osh-mol|Osh (mol go'shtli)|Плов с говядиной|mol go'shtli osh,osh mol go'shtli,palov mol go'shtli,плов говядина,плов из говядины|o|likop:300,porsiya:250|m:u:168878*60+u:170636*15+u:170393*12+u:171025*8+u:170000*5
osh-mevali|Mevali osh (shirin palov)|Плов сладкий с сухофруктами|mevali osh,shirin osh,shirin palov,mevali palov,плов с курагой,плов сладкий|o|likop:300,porsiya:250|m:u:168878*60+u:172509*12+u:170393*8+u:171025*6+u:169942*10+u:168164*4
chuchvara-qovurma|Qovurilgan chuchvara|Жареные чучвара|qovurilgan chuchvara,chuchvara qovurma,чучвара жареная,жареные пельмени,fried chuchvara|q|dona:15,porsiya:200|m:u:168894*35+u:174032*35+u:170000*12+u:171025*12
chuchvara-qatiq|Chuchvara (qatiq bilan)|Чучвара с катыком|chuchvara qatiq,qatiqli chuchvara,чучвара с катыком,чучвара с йогуртом|q|dona:12,porsiya:300|m:u:168894*20+u:174032*20+u:170000*5+u:171284*35
kuksi|Kuksi (sovuq lapsha sho'rva)|Кукси (холодный суп с лапшой)|kuksi,kuksi sho'rva,kuksi sovuq,kuksi shorva,кукси,кукси холодный|o|likop:350,kosa:350|m:u:168919*40+u:170636*12+u:170393*8+u:170000*3+suv*37
somsa-jigar|Jigar somsa|Самса с печенью|jigar somsa,jigarli somsa,самса с печенью,самса печёночная|q|dona:110|m:u:168894*35+u:172533*35+u:170000*15+u:171025*10
somsa-dumba|Dumbali somsa|Самса с курдюком|somsa dumbali,dumba somsa,somsa piyozli,самса с курдюком,самса с луком|q|dona:120|m:u:168894*35+u:172497*30+u:170000*25+u:171025*5
somsa-pishloq|Pishloqli somsa|Самса с сыром|pishloqli somsa,somsa pishloqli,самса с сыром,сырная самса|q|dona:100|m:u:168894*40+u:173420*35+u:173410*10
shashlik-dumba|Dumba shashlik (qo'y yog'i)|Шашлык из курдючного сала|dumba shashlik,dumba kabob,курдючное сало шашлык,шашлык из курдюка|q|dona:40|m:u:172497*100
shashlik-yurak|Yurak shashlik|Шашлык из сердца|yurak shashlik,yurak kabob,сердце шашлык,шашлык из сердца|q|dona:40|m:u:172528*100
chapati|Chapati / yupqa lepyoshka|Чапати (тонкая лепёшка)|chapati,chapatti,yupqa lepyoshka,yupqa non,чапати|g|dona:60|m:u:168894*62+u:171025*3+suv*35
nishalda|Nishalda|Нишалда|nishalda,nishalda shirinlik,нишалда,nishallo|x|qoshiq:20,bolak:30|m:u:169655*70+u:171287*5+suv*25
pishmaniye|Pishmaniye|Пишмание|pishmaniye,pishmanie,pişmaniye,пишмание,пишмание сладость|x|bolak:30,dona:30|m:u:169655*45+u:168894*30+u:173410*25
xalvaitar|Xalvaytar (un halvasi)|Халвайтар (мучная халва)|xalvaytar,xalvaitar,halvaytar,un xalva,халвайтар,мучная халва|x|qoshiq:30,bolak:40|m:u:168894*35+u:169655*40+u:171025*20+suv*5
gazli-suv|Gazlangan suv (shakarsiz)|Газированная вода (без сахара)|gazlangan suv,gazli suv,mineral suv gazli,sparkling water,газированная вода,газировка без сахара,минералка газированная|i|stakan:250,shisha05:500|u:173204
gazli-limonad|Gazli limonad (buratino, baykal, tarxun…)|Газированный лимонад (буратино, байкал, тархун)|buratino,baykal,tarxun,gazli limonad,буратино,байкал,тархун,лимонад газированный|i|stakan:250,shisha05:500|m:u:173205*100
mohito|Mohito (alkogolsiz)|Мохито (безалкогольный)|mohito,mojito,moxito,мохито,мохито безалкогольный|i|stakan:300|m:u:173205*90+u:169655*10
mokka|Mokka (kofe + shokolad + sut)|Мокка|mokka,mocha,мокко,moka,mokachino|i|stakan:250,piyola:200|m:u:171891*30+u:171265*55+u:174117*15
choy-qaymoqli|Choy (qaymoq bilan)|Чай со сливками|qaymoqli choy,choy qaymoq,чай со сливками|i|piyola:200,stakan:250|m:u:173227*80+u:171255*20
ryajenka|Ryajenka (pishirilgan qaymoqli sut)|Ряженка|ryajenka,ryazhenka,ряженка,pishirilgan sut|i|stakan:250|m:u:171265*60+u:171284*40
prostokvasha|Prostokvasha (snejok)|Простокваша|prostokvasha,snejok,простокваша,снежок|i|stakan:250|m:u:171265*50+u:171284*50
aktimel|Ichimlik yogurt (aktimel turi)|Питьевой йогурт (актимель)|aktimel,actimel,актимель,ichadigan yogurt,питьевой йогурт,bifidok|i|dona:100|m:u:171284*90+u:169655*5+u:171265*5
shokolad-batonchik|Shokolad batonchik (yong'oqli, vaflili)|Шоколадный батончик (с орехами и вафлей)|shokolad batonchik,batonchik,picnic,пикник,батончик шоколадный|x|dona:50|m:u:167587*45+u:174266*15+u:175039*30+u:169655*10
sosiskali-bulochka|Sosiska xamirda (bulochka)|Сосиска в тесте|sosiskali bulochka,sosiska xamirda,sosimka v teste,сосиска в тесте,сосиска в булочке,sosiska bulochkada|q|dona:120|m:u:172796*60+u:174614*35+u:168556*5
sushi-nigiri|Sushi (nigiri, losos)|Суши нигири (лосось)|sushi,nigiri,суши,нигири,sushi losos|q|dona:30,porsiya:150|m:u:168878*70+u:175167*30
roll-filadelfiya|Roll Filadelfiya|Ролл Филадельфия|filadelfiya,philadelphia,филадельфия,roll filadelfiya,ролл филадельфия|q|dona:30,porsiya:240|m:u:168878*62+u:175167*16+u:173418*12+u:169655*2
roll-kaliforniya|Roll Kaliforniya (maki)|Ролл Калифорния (маки)|kaliforniya,california,калифорния,roll kaliforniya,maki,маки,roll,ролл,ролы,rolli,sushi set,set roll|q|dona:30,porsiya:240|m:u:168878*65+u:171986*15+u:171009*8+u:169655*2
roll-tempura|Roll tempura (qovurilgan)|Ролл темпура (жареный)|tempura,темпура,roll tempura,qovurilgan roll,запечённый ролл|q|dona:35,porsiya:240|m:u:168878*55+u:171970*30+u:171009*8
kimchi|Kimchi (achitilgan karam)|Кимчи|kimchi,kimchi salat,кимчи,кимчи салат|v|porsiya:80,qoshiq:20|m:u:169279*100
bibimbap|Bibimbap|Бибимбап|bibimbap,бибимбап,pibimpap|q|likop:400,porsiya:400|m:u:168878*45+u:174032*12+u:172187*10+u:170393*8+u:169279*10+u:171025*3
tteokbokki|Tokpokki (guruch kleykasi, achchiq sous)|Токпокки|tteokbokki,tokpokki,токпокки,teokpokki|q|porsiya:250|m:u:168878*70+u:169655*5+u:171025*3
funchoza|Funchoza salat (chapche)|Фунчоза (салат / чапче)|funchoza,chapche,japchae,фунчоза,чапче|q|porsiya:200,likop:250|m:u:168919*50+u:170393*15+u:174032*12+u:171025*5+u:170000*5
yunon-salat|Yunon salat (grechesky)|Греческий салат|greek salad,yunon salat,grecheskiy,grecheskiy salat,греческий салат|q|porsiya:200,likop:250|m:u:170457*45+u:168409*20+u:173420*20+u:171025*7+u:170000*8
shakshuka|Shakshuka|Шакшука|shakshuka,шакшука,tuxum pomidorda|q|porsiya:250|m:u:171287*45+u:170457*40+u:170000*8+u:171025*5
selyodka-shuba|Selyodka pod shuboy (po'stin ostidagi seld)|Селёдка под шубой|selyodka pod shuboy,seld shuba,po'stin ostidagi seld,сельдь под шубой,селёдка под шубой|q|porsiya:150,bolak:100|m:u:175118*20+u:169145*25+u:170440*25+u:170393*10+u:171009*20
lapsha-udon|Udon / soba (pishgan lapsha)|Удон / соба (варёная лапша)|udon,soba,удон,соба,yapon lapsha,японская лапша|g|porsiya:250,likop:300|m:u:168919*100
vok-lapsha|Vok (tovuq va sabzavotli lapsha)|Вок с курицей и овощами|vok,wok,вок,vok lapsha,вок лапша|q|porsiya:350|m:u:168919*50+u:171477*20+u:170393*10+u:170000*5+u:171025*5+suv*10
bruschetta|Bruschetta (pomidor, mozzarella)|Брускетта|bruschetta,brusketta,брускетта|q|dona:60|m:u:174924*45+u:170457*40+u:171025*6+u:170845*9
`;
const rows = T.trim().split('\n').map((l) => l.split('|'));
const L = (x) => x.trim().split(/\s+/);
const TEG = { sut: L(`somsa-pishloq chuchvara-qatiq mokka choy-qaymoqli ryajenka prostokvasha aktimel shokolad-batonchik sosiskali-bulochka roll-filadelfiya yunon-salat bruschetta pishmaniye`),
  tuxum: L(`chapati nishalda shakshuka bibimbap`), yongoq: L(`shokolad-batonchik`), baliq: L(`sushi-nigiri roll-filadelfiya roll-kaliforniya roll-tempura selyodka-shuba`), choshqa: [],
  glyuten: L(`chuchvara-qovurma chuchvara-qatiq kuksi somsa-jigar somsa-dumba somsa-pishloq chapati pishmaniye xalvaitar shokolad-batonchik sosiskali-bulochka funchoza vok-lapsha lapsha-udon bruschetta`) };
const OQSIL = {};
module.exports = rows; module.exports.TEG = TEG; module.exports.OQSIL = OQSIL;
