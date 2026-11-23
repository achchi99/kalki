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
mokka|Mokka (kofe + shokolad + sut)|Мокка|mokka,mocha,мокко,moka,mokachino|i|chashka:200,stakan:250|m:u:171891*30+u:171265*55+u:174117*15
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
ismaloqli-pirog|Ismaloqli pirog (uyda pishirilgan)|Пирог со шпинатом (домашний)|ismaloq uy pichagi,ismaloqli uy pirogi,ismaloqli pishiriq,ismaloq pishiriq,ismaloq pirog,ismaloqli pirog,ismaloqli perok,пирог со шпинатом,шпинатный пирог,пирожок со шпинатом,spinach pie|n|bolak:110,dona:90|m:u:168894*28+u:171025*6+u:171287*12+u:168463*38+u:173420*12+u:170000*4
tovuq-kari|Tovuqli karri (sousli)|Карри с курицей|kari,karri,curry,tovuq kari,tovuqli kari,kuritsa kari,курица карри,карри,чикен карри,chicken curry|q|porsiya:300,likop:300,kosa:300|m:u:171477*35+u:170000*15+u:170457*12+u:170173*20+u:171413*3+u:170924*1.5+suv*13.5
chizkeyk-san-sebastyan|San-Sebastyan chizkeyki (basklarcha)|Баскский чизкейк (Сан-Себастьян)|san sebastian,san-sebastyan,san sebastyan,san sebastian chizkeyk,basklarcha chizkeyk,burnt cheesecake,баскский чизкейк,сан себастьян,сан-себастьян чизкейк|h|bolak:120,dona:120|m:u:173418*42+u:170859*22+u:171287*16+u:169655*15+u:168894*1.5
labne|Labne (suzilgan qatiq pishlog'i)|Лабне (сыр из кефира/йогурта)|labne,labneh,labna,лабне,лабнэ,лабна,suzilgan qatiq,suzilgan yogurt pishloq|s|porsiya:60,qoshiq:30|y:gobaladi-labneh
yogurt-kam|Yogurt (tabiiy, kam yog'li 1,5%)|Йогурт натуральный нежирный (1,5%)|yogurt 1.5,yogurt 1.5,yogurt kam yog'li,kam yog'li yogurt,йогурт 1.5%,йогурт нежирный,йогурт натуральный 1.5%|s|stakan:200,dona:125|u:170886
yogurt-yogsiz|Yogurt (tabiiy, yog'siz)|Йогурт натуральный обезжиренный|yogurt 0,yogurt yog'siz,yog'siz yogurt,йогурт 0%,йогурт обезжиренный|s|stakan:200,dona:125|u:170887
yogurt-yunon-5|Yunon yogurti (to'liq yog'li, 5%)|Греческий йогурт 5%|yunon yogurti 5,yunon yogurti to'liq yog'li,греческий йогурт 5%,греческий йогурт цельный,yunon yogurt 5|s|stakan:150,qoshiq:30|u:171304
yogurt-ichimlik|Yogurt ichimlik (tabiiy)|Питьевой йогурт натуральный|ichimlik yogurt,yogurt ichimlik,piyoladagi yogurt,drinking yogurt,питьевой йогурт,йогурт питьевой,йогурт питьевой натуральный|i|stakan:250,shisha:330|m:u:170886*70+u:172205*30
ryajenka-25|Ryajenka 2,5%|Ряженка 2,5%|ryajenka 2.5,ryajenka 2.5,ряженка 2.5%,ряженка 2.5|i|stakan:250|y:ryajenka-krasnaya-tsena-25
ryajenka-4|Ryajenka 4%|Ряженка 4%|ryajenka 4,ryajenka 4%,ряженка 4%,ряженка 4|i|stakan:250|y:ryajenka-vkusnoteevo-4
sariyog-725|Sariyog' 72,5% (dehqon)|Масло сливочное 72,5% (крестьянское)|sariyog 72.5,sariyog 72.5,sariyog 72,масло 72.5%,сливочное масло 72.5%,масло крестьянское,krestyanskoe maslo,dehqon sariyog'i|s|qoshiq:12,choyq:5,bolak:10|y:sariyog-krestyanskoe-725
sariyog-825|Sariyog' 82,5% (an'anaviy)|Масло сливочное 82,5% (традиционное)|sariyog 82.5,sariyog 82.5,sariyog 82,масло 82.5%,сливочное масло 82.5%,масло традиционное,an'anaviy sariyog'|s|qoshiq:12,choyq:5,bolak:10|y:sariyog-ruzskoe-825
pishloq-edam|Edam pishlog'i (45%)|Сыр эдам (45%)|edam,эдам,pishloq 45,pishloq 45%,сыр 45%,qattiq pishloq 45|s|tilim:20,bolak:30|y:edam-kroon
pishloq-rossiya|Rossiya pishlog'i (≈50%)|Сыр Российский (≈50%)|rossiyskiy pishloq,rossiya pishlog'i,pishloq 50,pishloq 50%,сыр российский,сыр 50%,qattiq pishloq 50|s|tilim:20,bolak:30|y:syr-rossiyskiy-kr
pishloq-adigey|Adigey pishlog'i|Сыр адыгейский|adigey pishlog'i,adigey,adygeysky,adigeyskiy,адыгейский сыр,сыр адыгейский,адыгейский|s|bolak:50,porsiya:100|y:adygeysky-vkusvil
mozzarella-kam|Mozzarella (kam yog'li)|Моцарелла (частично обезжиренная)|mozzarella kam yog'li,моцарелла нежирная,моцарелла лайт,mozzarella light|s|bolak:30,tilim:20,porsiya:100|u:170847
qaymoq-20|Qaymoq (20%, yengil)|Сливки 20%|qaymoq 20,qaymoq 20%,сливки 20%,сливки 20,yengil qaymoq|s|qoshiq:15,stakan:200|u:170857
mol-file-xom|Mol go'shti — file (xom)|Говядина вырезка (сырая)|mol file,file go'sht,mol go'shti file,вырезка говяжья,говяжья вырезка,вырезка,tenderloin|m|porsiya:150,dona:200|u:169542
mol-antrekot-xom|Mol go'shti — antrekot (ribay, xom)|Говядина антрекот (рибай, сырая)|antrekot,mol antrekot,ribay,ribeye,рибай,антрекот,стейк рибай|m|porsiya:200,dona:250|u:168612
mol-yelka-xom|Mol go'shti — yelka (xom)|Говядина лопатка (сырая)|mol yelka,yelka go'sht,говяжья лопатка сырая,mol yelka xom|m|porsiya:150|u:168668
mol-son-xom|Mol go'shti — son (xom)|Говядина окорок (задняя часть, сырая)|mol son,son go'sht mol,говядина задняя часть,говяжий окорок сырой,mol son xom|m|porsiya:150|u:168646
mol-tosh-xom|Mol go'shti — to'sh (xom)|Говядина грудинка (сырая)|mol tosh xom,brisket,mol to'sh xom,говяжья грудинка сырая|m|porsiya:150|u:168664
mol-qiyma-5|Mol qiymasi 5% yog' (xom)|Фарш говяжий 5% жира (сырой)|qiyma 5,qiyma 5%,mol qiyma 5,фарш 5%,фарш говяжий 5%,95/5 qiyma|m|porsiya:100,qoshiq:30|u:171790
mol-qiyma-10|Mol qiymasi 10% yog' (xom)|Фарш говяжий 10% жира (сырой)|qiyma 10,qiyma 10%,mol qiyma 10,фарш 10%,фарш говяжий 10%,90/10 qiyma|m|porsiya:100,qoshiq:30|u:174030
mol-qiyma-20|Mol qiymasi 20% yog' (xom)|Фарш говяжий 20% жира (сырой)|qiyma 20,qiyma 20%,mol qiyma 20,фарш 20%,фарш говяжий 20%,80/20 qiyma|m|porsiya:100,qoshiq:30|u:174036
qoy-son-xom|Qo'y go'shti — son (xom)|Баранина задняя часть (сырая)|qo'y son xom,qoy son xom,баранина нога сырая,баранья нога сырая|m|porsiya:150|u:172549
qoy-yelka-xom|Qo'y go'shti — yelka (xom)|Баранина лопатка (сырая)|qoy yelka,баранья лопатка сырая,qo'y yelka xom|m|porsiya:150|u:172496
qoy-bel-xom|Qo'y go'shti — bel (xom)|Баранина поясница (сырая)|qo'y bel,qoy bel,баранья корейка,корейка баранья,qo'y kotleti xom|m|porsiya:150|u:172551
qoy-boldir-xom|Qo'y go'shti — boldir (xom)|Баранина голяшка (сырая)|qo'y boldir,qoy boldir,баранья голяшка,голяшка|m|porsiya:150|u:172481
tovuq-kanat-xom|Tovuq qanoti (xom, terili)|Куриные крылья (сырые, с кожей)|tovuq qanot xom,tovuq qanoti xom,куриные крылья сырые,куриное крыло|m|dona:40,porsiya:150|u:172390
tovuq-boldir-xom|Tovuq boldiri (xom, terili)|Куриная голень (сырая, с кожей)|tovuq boldir,tovuq boldiri xom,куриная голень,голень куриная,голень|m|dona:100,porsiya:150|u:172373
tovuq-jigar-xom|Tovuq jigari (xom)|Куриная печень (сырая)|tovuq jigar xom,куриная печень сырая,куриная печень|m|porsiya:100|u:171060
tovuq-yurak-xom|Tovuq yuragi (xom)|Куриные сердечки (сырые)|tovuq yurak xom,куриные сердечки,куриное сердце|m|porsiya:100|u:171458
tovuq-oshqozon-xom|Tovuq oshqozoni (xom)|Куриные желудки (сырые)|tovuq oshqozon xom,куриные желудки,куриный желудок|m|porsiya:100|u:171456
tovuq-kokrak-terili-xom|Tovuq ko'kragi (xom, terili)|Куриная грудка с кожей (сырая)|tovuq ko'krak terili,tovuq kokrak terili,куриная грудка с кожей|m|dona:250,porsiya:150|u:171474
tovuq-qiyma-xom|Tovuq qiymasi (xom)|Фарш куриный (сырой)|tovuq qiyma,tovuq qiymasi,фарш куриный,куриный фарш|m|porsiya:100,qoshiq:30|u:171116
kurka-qiyma-xom|Kurka qiymasi (xom)|Фарш индейки (сырой)|kurka qiyma xom,фарш индейки,индюшиный фарш|m|porsiya:100,qoshiq:30|u:171505
kolbasa-mol-kam-yogli|Kolbasa (mol go'shtli, kam yog'li)|Колбаса говяжья нежирная|kolbasa kam yog'li,колбаса нежирная,колбаса диетическая,bolonya kam yog'li|m|tilim:20,bolak:30|u:168101
sosiska-mol-kam-yogli|Sosiska (mol go'shtli, kam yog'li)|Сосиски говяжьи нежирные|sosiska kam yog'li,сосиски нежирные,сосиски говяжьи|m|dona:50|u:167696
sosiska-kurka|Kurka sosiskasi|Сосиски из индейки|kurka sosiska,сосиски из индейки,индюшиные сосиски|m|dona:50|u:171625
pastrami-kurka|Kurka pastramisi|Пастрома из индейки|pastrami kurka,pastroma,пастрома,пастрами индейка|m|tilim:20,bolak:30|u:172927
`;
const rows = T.trim().split('\n').map((l) => l.split('|'));
const L = (x) => x.trim().split(/\s+/);
const TEG = { sut: L(`somsa-pishloq chuchvara-qatiq mokka choy-qaymoqli ryajenka prostokvasha aktimel shokolad-batonchik sosiskali-bulochka roll-filadelfiya yunon-salat bruschetta pishmaniye labne ismaloqli-pirog chizkeyk-san-sebastyan yogurt-kam yogurt-yogsiz yogurt-yunon-5 yogurt-ichimlik ryajenka-25 ryajenka-4 sariyog-725 sariyog-825 pishloq-edam pishloq-rossiya pishloq-adigey mozzarella-kam qaymoq-20`),
  tuxum: L(`chapati nishalda shakshuka bibimbap ismaloqli-pirog chizkeyk-san-sebastyan`), yongoq: L(`shokolad-batonchik`), baliq: L(`sushi-nigiri roll-filadelfiya roll-kaliforniya roll-tempura selyodka-shuba`), choshqa: [],
  glyuten: L(`chuchvara-qovurma chuchvara-qatiq kuksi somsa-jigar somsa-dumba somsa-pishloq chapati pishmaniye xalvaitar shokolad-batonchik sosiskali-bulochka funchoza vok-lapsha lapsha-udon bruschetta ismaloqli-pirog chizkeyk-san-sebastyan`) };
const OQSIL = {};
module.exports = rows; module.exports.TEG = TEG; module.exports.OQSIL = OQSIL;
