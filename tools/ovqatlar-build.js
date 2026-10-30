/* kalki.uz — data/ovqatlar.json yasovchi (node tools/ovqatlar-build.js).
 * Qiymatlar 100 g uchun TAXMINIY: xom/oddiy mahsulotlar — USDA FoodData Central va ochiq jadvallar asosida yaxlitlangan; retsept taomlar va fast-food —
 * o'rtacha uy retsepti / odatiy porsiya (e=1, ilovada "taxminiy" belgisi). Aniq retsept va brendga qarab o'zgaradi.
 * Qator: id | nom (UZ) | nom (RU) | qo'shimcha nomlar | kkal | oqsil | yog' | uglevod | tur | e | porsiyalar (kalit:gramm, ...)
 * Tur: o — o'zbek taomlari · n — non/xamir · s — sut mahsulotlari · m — go'sht/baliq/tuxum · g — don/makaron/kartoshka · v — sabzavot · f — meva · d — quruq meva/yong'oq
 *      i — ichimlik · q — fast-food/tayyor · h — shirinlik · x — boshqa. g100 ("100 g") har doim qo'shiladi. */
'use strict';
const fs = require('fs');
const path = require('path');
const R = `
osh|Osh (palov)|Плов|palov,plov,паловник|200|5.5|8.5|25|o|1|likop:350,kosa:250,porsiya:300
yengil-osh|Osh (yengil, tovuqli)|Плов с курицей|palov tovuqli,plov kurinyy|165|8|6|20|o|1|likop:350,kosa:250
somsa|Somsa (go'shtli, tandirda)|Самса с мясом|samsa,самса|290|10|17|24|o|1|dona:120
somsa-qat|Somsa (qatlamali)|Самса слоёная|qatlama somsa|330|9|21|27|o|1|dona:110
somsa-qovoq|Somsa (qovoqli)|Самса с тыквой|qovoqli samsa|230|4|10|31|o|1|dona:110
manti|Manti|Манты|mante|210|9|9|23|o|1|dona:60,porsiya:300
chuchvara|Chuchvara (qaynatilgan)|Чучвара|pelmeni uzbek,чучвара|200|9|7|25|o|1|kosa:250,dona:12
chuchvara-sho|Chuchvara (sho'rvada)|Чучвара в бульоне|chuchvara shorva|110|6|4|12|o|1|kosa:400
lagmon|Lag'mon|Лагман|lagman,лағмон|120|5.5|5|15|o|1|kosa:400,likop:450
lagmon-qov|Lag'mon (qovurma)|Лагман жареный|qovurma lagmon,jarenyy lagman|170|7|8|18|o|1|likop:350
shurva|Shurva|Шурпа|shorva,шурпа|75|4|4.3|5.5|o|1|kosa:350,piyola:300
mastava|Mastava|Мастава|мастава|80|4|3|10|o|1|kosa:350
moshxorda|Moshxo'rda|Машхурда|moshhorda,машхурда|85|5|3|10|o|1|kosa:350
moshkichiri|Moshkichiri|Мошкичири|mashkichiri,мошкичири|125|5|3|18|o|1|kosa:350
norin|Norin|Нарын|naryn,нарын|190|11|8|18|o|1|likop:250
dimlama|Dimlama|Димлама|димлама|100|6|5|8|o|1|likop:350
qozon-kabob|Qozon kabob|Казан-кебаб|kazan kebab,kabob qozon|250|13|17.5|11|o|1|likop:250
shashlik|Shashlik (go'sht)|Шашлык|kabob,shashlyk,кебаб,шашлик|240|21|17|1|o|1|dona:80,porsiya:200
shashlik-tovuq|Shashlik (tovuq)|Шашлык куриный|tovuq kabob|170|23|8|1|o|1|dona:70,porsiya:200
jigar-kabob|Jigar kabob|Печёночный кебаб|jigar shashlik|190|20|11|2|o|1|dona:60,porsiya:150
lyulya|Lyulya kabob|Люля-кебаб|lula kabob,люля|250|15|19|3|o|1|dona:90,porsiya:200
tandir-gosht|Tandir go'sht|Тандыр-гушт (мясо из тандыра)|tandir kabob,тандыр-мясо,тандыр гушт|260|22|19|0.5|o|1|porsiya:200
qovurdoq|Qovurdoq|Ковурдак (жаркое)|kovurdok,жаркое,ковурдак|250|15|19|6|o|1|likop:250
dolma|Do'lma (karam bargida)|Долма|dolma,голубцы,golubtsy|150|7|9|10|o|1|dona:50,porsiya:250
dolma-uzum|Do'lma (uzum bargida)|Долма в виноградных листьях|bargak dolma|140|6|8|11|o|1|dona:40,porsiya:240
qazi|Qazi|Казы|kazy,otiq|360|17|33|1.5|o|1|bolak:30
sumalak|Sumalak|Сумаляк|sumalyak,сумалак|130|3|1.5|27|o|1|piyola:200,qoshiq:25
halim|Halim|Халим|xalim,халим|210|10|10|20|o|1|kosa:300
xonim|Xonim|Ханум|hanum,ханум|200|7|7|27|o|1|likop:250
kartoshka-qov|Kartoshka (qovurilgan)|Картофель жареный|kartoshka qovurma,жареная картошка|160|2.5|7|22|o|1|likop:250
kartoshka-pyure|Kartoshka pyure|Картофельное пюре|pyure|110|2|4|16|o|1|likop:250
tuxum-qov|Tuxum (qovurilgan)|Яичница|yaichnitsa,glazunya|190|12|15|1|o|1|porsiya:120,dona:60
omlet|Omlet|Омлет|omlet|185|11|14|2|o|1|porsiya:150
achichuk|Achichuk (pomidor-piyoz)|Ачичук|achchiq chuchuk|25|1|0.2|5|o|1|likop:150
salat-sabzavot|Sabzavot salati (yog'li)|Овощной салат|pomidor bodring salat|50|1|3|4|o|1|likop:200
olivye|Olivye salati|Салат Оливье|olive,оливье|190|5|15|8|o|1|likop:200
vinegret|Vinegret|Винегрет|vinaigrette|90|1.5|5|10|o|1|likop:200
koreys-sabzi|Koreyscha sabzi|Морковь по-корейски|koreyskaya morkov|115|1.3|7|12|o|1|likop:100,qoshiq:25
non|Non (tandir)|Лепёшка тандырная|lepyoshka,нон,tandir non,obi non|270|9|1|55|n|1|dona:300,bolak:50
patir|Patir|Патыр|patyr,патыр|300|8|6|52|n|1|dona:150,bolak:60
qatlama|Qatlama|Катлама|katlama,катлама|380|6|21|43|n|1|dona:100
boglirsoq|Bo'g'irsoq|Баурсак|bugirsok,baursak|380|7|16|52|h|1|dona:25
non-oq|Oq non (batoni)|Белый хлеб|batoni,bulka,хлеб|265|8|3|50|n|0|tilim:30,bolak:50
non-qora|Qora non|Чёрный хлеб|jovdar non,rye bread|210|6|1.5|41|n|0|tilim:30
lavash-non|Lavash (yupqa non)|Лаваш|lavash,лаваш|275|9|1|56|n|1|dona:80
baget|Baget|Багет|baguette|270|9|1|55|n|0|bolak:40,dona:250
bulochka|Bulochka (shirin)|Булочка сдобная|bulka,bulochka|300|8|7|52|n|1|dona:70
kruassan|Kruassan|Круассан|croissant,kruasan|400|8|21|45|n|1|dona:60
pirojki|Pirojki (qovurilgan)|Пирожки жареные|pirozhki|290|7|14|34|n|1|dona:80
qatiq|Qatiq|Катык|katyk,qatik,катык|60|3|3.2|4|s|1|stakan:250,piyola:200,qoshiq:20
suzma|Suzma|Сузьма|suzma,сузьма|150|9|10|5|s|1|qoshiq:20,piyola:150
qurt|Qurt|Курут|kurt,курт,курут,qurut,kurut|320|24|12|28|s|1|dona:20
ayron|Ayron|Айран|ayran,айран|30|1.5|1|3|s|1|stakan:250
sut|Sut (3,2%)|Молоко 3,2%|moloko,sut|60|3|3.2|4.8|s|0|stakan:250,piyola:200
sut-yogsiz|Sut (1%)|Молоко 1%|yogsiz sut|42|3.4|1|5|s|0|stakan:250
kefir|Kefir (2,5%)|Кефир 2,5%|kefir|53|3|2.5|4|s|0|stakan:250
qaymoq|Qaymoq|Каймак|kaymak,каймак|330|2.5|35|3|s|1|qoshiq:15
smetana|Smetana (20%)|Сметана 20%|smetana,qaymoq smetana|205|2.5|20|3|s|0|qoshiq:20
pishloq|Pishloq (qattiq)|Сыр твёрдый|syr,cheese,gouda|350|25|27|2|s|0|tilim:20,bolak:30
pishloq-yumshoq|Pishloq (brynza)|Брынза|brinza,bryndza|260|18|20|0.5|s|0|bolak:30
tvorog5|Tvorog (5%)|Творог 5%|tvorog,cottage|121|17|5|2|s|0|piyola:150,qoshiq:20
tvorog9|Tvorog (9%)|Творог 9%|tvorog 9|155|16|9|3|s|0|piyola:150,qoshiq:20
tvorog0|Tvorog (0%)|Творог обезжиренный|tvorog 0,tvorog yogsiz|88|18|0.6|1.8|s|1|piyola:150,qoshiq:20
tvorog18|Tvorog (18%)|Творог 18%|tvorog 18,tvorog yogli|229|14|18|2.8|s|1|piyola:150,qoshiq:20
sariyog|Sariyog'|Сливочное масло|saryog,maslo,butter|717|0.8|81|0.6|s|0|qoshiq:12,choyq:5,bolak:10
yogurt-meva|Yogurt (mevali)|Йогурт фруктовый|yogurt mevali|90|3|2|15|s|0|dona:125,stakan:200
yogurt-tabiiy|Yogurt (tabiiy)|Йогурт натуральный|yogurt oddiy,yoghurt|60|4|3|5|s|0|dona:125,stakan:200
muzqaymoq|Muzqaymoq (o'rtacha)|Мороженое (среднее)|morozhenoe,ice cream,мороженое,plombir,пломбир,muzqaymoq plombir|200|4|11|22|s|1|shar:60,dona:80,qoshiq:25
tuxum|Tuxum (qaynatilgan)|Яйцо варёное|yaytso,tuxum,яйцо|155|13|11|1|m|0|dona:50
tuxum-xom|Tuxum (xom)|Яйцо сырое|xom tuxum|143|12.5|10|1|m|0|dona:55
mol-gosht|Mol go'shti (pishgan)|Говядина варёная|mol gosht,govyadina,говядина|215|27|11|0|m|0|bolak:100,porsiya:150
mol-qiyma|Qiyma (mol, pishgan)|Фарш говяжий жареный|qiyma|250|26|16|0|m|0|porsiya:150
qoy-gosht|Qo'y go'shti (pishgan)|Баранина варёная|qoy gosht,baranina,баранина|290|25|21|0|m|0|bolak:100,porsiya:150
tovuq-kokrak|Tovuq ko'kragi (pishgan)|Куриная грудка варёная|tovuq kokrak,kurinaya grudka|150|29.5|3.2|0|m|0|bolak:120,porsiya:150
tovuq-son|Tovuq soni (pishgan)|Куриное бедро|tovuq son,bedro|210|26|11|0|m|0|dona:100,porsiya:150
tovuq-qanot|Tovuq qanotchalari (qovurilgan)|Куриные крылья жареные|qanotcha,krylya|290|27|19|0|m|1|dona:40,porsiya:150
tovuq-qov|Tovuq (qovurilgan, nonli)|Курица в панировке|fried chicken,tovuq kfc|260|20|17|9|q|1|dona:100,porsiya:200
kurka|Kurka go'shti (pishgan)|Индейка варёная|indeyka,kurka,индейка|150|29|3|0|m|0|porsiya:150
ot-gosht|Ot go'shti (pishgan)|Конина варёная|ot gosht,konina,конина|190|28|8|0|m|0|porsiya:150
jigar|Jigar (mol, pishgan)|Печень говяжья|jigar,pechen,печень|175|27|5|4|m|0|porsiya:120
kotlet|Kotlet (go'shtli, qovurilgan)|Котлета мясная|kotlet,котлета|230|14|15|9|m|1|dona:80
tushonka|Tushonka (konserva)|Тушёнка|tushyonka,тушенка|220|15|17|0|m|0|qoshiq:30,porsiya:100
kolbasa|Kolbasa (qaynatilgan)|Колбаса варёная|kolbasa,doktorskaya,колбаса|260|13|23|1.5|m|0|tilim:20,bolak:30
sosiska|Sosiska|Сосиска|sosiski,sardelka,сосиска|270|11|25|2|m|0|dona:50
bekon|Bekon (qovurilgan)|Бекон|bacon,бекон|540|37|42|1|m|0|tilim:10
losos|Losos (pishgan)|Лосось запечённый|losos,salmon,семга|205|22|12|0|m|0|bolak:120,porsiya:150
tunets|Tunets (konserva)|Тунец консервированный|tunets,tuna,тунец|115|26|1|0|m|0|dona:150,porsiya:80
treska|Treska (pishgan)|Треска варёная|treska,треска|105|23|1|0|m|0|porsiya:150
baliq-qov|Baliq (qovurilgan)|Рыба жареная|baliq,ryba,рыба|200|20|12|5|m|1|bolak:100,porsiya:150
krevetka|Krevetka|Креветки варёные|krevetka,shrimp,креветки|100|21|1|0|m|0|porsiya:100
guruch|Guruch (pishgan)|Рис варёный|guruch,ris,рис|130|2.7|0.3|28|g|0|kosa:200,likop:250,qoshiq:20
guruch-xom|Guruch (xom)|Рис сырой|guruch xom|350|7|0.6|78|g|0|stakan:200,qoshiq:20
grechka|Grechka (pishgan)|Гречка варёная|grechka,гречка|92|3.4|0.6|19.9|g|0|kosa:200,likop:250
grechka-xom|Grechka (xom)|Гречка сухая|grechka xom|340|12|3|62|g|0|stakan:200
makaron|Makaron (pishgan)|Макароны варёные|makaron,pasta,макароны|150|5.5|1|30|g|0|likop:250,kosa:200
makaron-xom|Makaron (xom)|Макароны сухие|makaron xom|350|12|1.5|72|g|0|porsiya:80
suli|Suli bo'tqasi (suvda)|Овсянка на воде|suli,ovsyanka,овсянка|70|2.5|1.5|12|g|1|kosa:250,likop:300
suli-xom|Suli yormasi (xom)|Овсяные хлопья сухие|suli yorma,gerkules|370|13|7|62|g|0|stakan:90,qoshiq:10
manka|Manka bo'tqasi (sutda)|Манная каша на молоке|manka,манка|100|3|3|15|g|1|kosa:250,likop:300
mosh|Mosh (pishgan)|Маш варёный|mosh,маш|105|7|0.4|19|g|0|kosa:200
noxat|No'xat (pishgan)|Нут варёный|noxat,nut,нут|125|8|2|21|g|0|kosa:200
loviya|Loviya (pishgan)|Фасоль варёная|loviya,fasol,фасоль|130|9|0.5|23|g|0|kosa:200
yasmiq|Yasmiq (pishgan)|Чечевица варёная|yasmiq,chechevitsa,чечевица|115|9|0.4|20|g|0|kosa:200
kartoshka|Kartoshka (qaynatilgan)|Картофель варёный|kartoshka,kartofel,картофель|85|2|0.1|19|g|0|dona:100,likop:250
kartoshka-xom|Kartoshka (xom)|Картофель сырой|kartoshka xom|77|2|0.1|17|g|0|dona:150
makkajoxori|Makkajo'xori (qaynatilgan)|Кукуруза варёная|makkajoxori,kukuruza,кукуруза|96|3.4|1.5|21|g|0|dona:150
kornfleks|Kornfleks|Кукурузные хлопья|cornflakes,kornfleks|375|7|1|84|g|0|kosa:40,piyola:30
granola|Granola|Гранола|granola,muesli|450|10|18|60|g|0|kosa:50,qoshiq:15
pomidor|Pomidor|Помидор|tomat,pomidor,помидор|18|0.9|0.2|3.9|v|0|dona:120
bodring|Bodring|Огурец|bodring,ogurets,огурец|15|0.7|0.1|3.6|v|0|dona:100
sabzi|Sabzi|Морковь|sabzi,morkov,морковь|41|0.9|0.2|9.6|v|0|dona:80
piyoz|Piyoz|Лук репчатый|piyoz,luk,лук|40|1.1|0.1|9.3|v|0|dona:80
sarimsoq|Sarimsoq|Чеснок|sarimsoq,chesnok,чеснок|149|6.4|0.5|33|v|0|dona:3
karam|Karam (oq)|Капуста белокочанная|karam,kapusta,капуста|25|1.3|0.1|5.8|v|0|piyola:70
gulkaram|Gulkaram|Цветная капуста|gulkaram,tsvetnaya,цветная капуста|25|1.9|0.3|5|v|0|piyola:100
brokkoli|Brokkoli|Брокколи|brokoli,broccoli|34|2.8|0.4|7|v|0|piyola:90
qovoq|Qovoq|Тыква|qovoq,tykva,тыква|26|1|0.1|6.5|v|0|bolak:150
baqlajon|Baqlajon|Баклажан|baqlajon,baklazhan,баклажан|25|1|0.2|6|v|0|dona:200
qalampir|Bulg'or qalampiri|Болгарский перец|bulgor qalampir,perets,перец|27|1|0.2|6.3|v|0|dona:120
achchiq-qalampir|Achchiq qalampir|Острый перец|achchiq qalampir|40|2|0.4|9|v|0|dona:15
lavlagi|Lavlagi|Свёкла|lavlagi,svekla,свёкла|43|1.6|0.2|10|v|0|dona:100
turp|Turp|Редис|turp,redis,редис|16|0.7|0.1|3.4|v|0|dona:15
ismaloq|Ismaloq|Шпинат|ismaloq,shpinat,шпинат|23|2.9|0.4|3.6|v|0|hovuch:30
kokat|Ko'katlar (kashnich, ukrop)|Зелень|kokat,zelen,зелень,kashnich|25|2.5|0.5|3|v|0|hovuch:20
salat-barg|Salat bargi|Листовой салат|salat bargi,latuk|15|1.4|0.2|2.9|v|0|hovuch:30
yashil-loviya|Yashil loviya|Стручковая фасоль|yashil loviya|31|1.8|0.2|7|v|0|piyola:100
yashil-noxat|Yashil no'xat|Зелёный горошек|yashil noxat,goroshek|81|5|0.4|14|v|0|piyola:100
zaytun|Zaytun|Оливки|zaytun,olivki,оливки|115|0.8|11|6|v|0|hovuch:30,dona:4
avokado|Avokado|Авокадо|avokado,avocado|160|2|15|9|v|0|dona:150
shampinon|Qo'ziqorin (shampinon)|Шампиньоны|qoziqorin,gribi,грибы|22|3|0.3|3.3|v|0|piyola:70
tuzlangan-bodring|Tuzlangan bodring|Солёный огурец|tuzlangan bodring,solenyy ogurets|12|0.8|0.1|2|v|0|dona:60
olma|Olma|Яблоко|olma,yabloko,яблоко|52|0.3|0.2|14|f|0|dona:180
nok|Nok|Груша|nok,grusha,груша|57|0.4|0.1|15|f|0|dona:170
banan|Banan|Банан|banan,банан|89|1.1|0.3|23|f|0|dona:120
apelsin|Apelsin|Апельсин|apelsin,апельсин|47|0.9|0.1|12|f|0|dona:150
mandarin|Mandarin|Мандарин|mandarin,мандарин|53|0.8|0.3|13|f|0|dona:80
limon|Limon|Лимон|limon,лимон|29|1.1|0.3|9|f|0|dona:100,tilim:10
uzum|Uzum|Виноград|uzum,vinograd,виноград|69|0.7|0.2|18|f|0|hovuch:100,dona:5
qovun|Qovun|Дыня|qovun,dynya,дыня|34|0.8|0.2|8|f|0|tilim:200
tarvuz|Tarvuz|Арбуз|tarvuz,arbuz,арбуз|30|0.6|0.2|8|f|0|tilim:300
shaftoli|Shaftoli|Персик|shaftoli,persik,персик|39|0.9|0.3|10|f|0|dona:150
orik|O'rik|Абрикос|orik,abrikos,абрикос|48|1.4|0.4|11|f|0|dona:40
gilos|Gilos|Черешня|gilos,chereshnya,черешня|63|1|0.2|16|f|0|hovuch:100
olcha|Olcha|Вишня|olcha,vishnya,вишня|50|1|0.3|12|f|0|hovuch:100
oluxori|Olxo'ri|Слива|oluxori,sliva,слива|46|0.7|0.3|11|f|0|dona:40
anor|Anor|Гранат|anor,granat,гранат|83|1.7|1.2|19|f|0|dona:200
anjir|Anjir (yangi)|Инжир свежий|anjir,injir,инжир|74|0.8|0.3|19|f|0|dona:50
xurmo|Xurmo (hurmo)|Хурма|xurmo,hurma,хурма|70|0.6|0.2|19|f|0|dona:150
behi|Behi|Айва|behi,ayva,айва|57|0.4|0.1|15|f|0|dona:200
kivi|Kivi|Киви|kivi,киви|61|1.1|0.5|15|f|0|dona:75
ananas|Ananas|Ананас|ananas,ананас|50|0.5|0.1|13|f|0|bolak:80
mango|Mango|Манго|mango,манго|60|0.8|0.4|15|f|0|dona:200
qulupnay|Qulupnay|Клубника|qulupnay,klubnika,клубника|32|0.7|0.3|8|f|0|hovuch:100
malina|Malina|Малина|malina,малина|52|1.2|0.7|12|f|0|hovuch:100
tut|Tut|Тутовник|tut,shelkovitsa,тутовник|43|1.4|0.4|10|f|0|hovuch:100
greypfrut|Greypfrut|Грейпфрут|greypfrut,грейпфрут|42|0.8|0.1|11|f|0|dona:250
mayiz|Mayiz (kishmish)|Изюм|mayiz,kishmish,изюм|299|3|0.5|79|d|0|hovuch:30,qoshiq:15
quruq-orik|Quruq o'rik|Курага|quruq orik,kuraga,курага|241|3.4|0.5|63|d|0|dona:8,hovuch:40
finik|Xurmo (quruq, finik)|Финики|finik,dates,финики|282|2.5|0.4|75|d|0|dona:8
quruq-anjir|Anjir (quritilgan)|Инжир сушёный|quruq anjir,injir sushyonyy|249|3.3|0.9|64|d|0|dona:20
chernosliv|Olxo'ri (quritilgan)|Чернослив|chernosliv,quruq oluxori|240|2.2|0.4|64|d|0|dona:10
yongoq|Yong'oq (grek)|Грецкий орех|yongoq,gretskiy,грецкий орех,walnut|654|15|65|14|d|0|hovuch:30,dona:5
bodom|Bodom|Миндаль|bodom,mindal,миндаль,almond|579|21|50|22|d|0|hovuch:30,dona:1.2
pista|Pista|Фисташки|pista,fistashki,фисташки|560|20|45|28|d|0|hovuch:30
funduk|Funduk|Фундук|funduk,fundук,hazelnut|628|15|61|17|d|0|hovuch:30
yerfistiq|Yerfistiq (qovurilgan)|Арахис жареный|yerfistiq,arahis,арахис,peanut|585|24|50|16|d|0|hovuch:30
kunjut|Kunjut|Кунжут|kunjut,kunzhut,кунжут|573|18|50|23|d|0|qoshiq:9
kungaboqar|Kungaboqar urug'i|Семечки подсолнуха|kungaboqar,semechki,семечки|584|21|51|20|d|0|hovuch:30
asal|Asal|Мёд|asal,med,мёд,honey|304|0.3|0|82|d|0|qoshiq:21,choyq:7
murabbo|Murabbo|Варенье|murabbo,varene,варенье,jem|260|0.4|0.1|65|h|1|qoshiq:20,choyq:7
choy|Choy (shakarsiz)|Чай без сахара|choy,chay,чай,qora choy|1|0|0|0.3|i|0|piyola:200,stakan:250
choy-shakar|Choy (shakar bilan)|Чай с сахаром|choy shakar bilan,чай с сахаром|20|0|0|5|i|1|piyola:200,stakan:250
choy-sut|Choy (sut bilan)|Чай с молоком|choy sut bilan,чай с молоком|22|0.7|0.7|3|i|1|piyola:200,stakan:250
kofe|Kofe (qora, shakarsiz)|Кофе чёрный|kofe,coffee,кофе|2|0.1|0|0.3|i|0|piyola:150,stakan:250
kofe-3in1|Kofe (3 in 1)|Кофе 3 в 1|kofe 3in1,кофе 3в1|37|0.6|0.9|6.8|i|1|stakan:200,piyola:200
kola|Kola (gazlangan ichimlik)|Кола|cola,coca cola,pepsi,кола|42|0|0|10.6|i|0|stakan:250,shisha:500
limonad|Limonad (fanta, sprite)|Лимонад газированный|fanta,sprite,limonad,лимонад|40|0|0|10|i|0|stakan:250,shisha:500
energetik|Energetik ichimlik|Энергетик|energetik,energy drink,flash,энергетик|45|0|0|11|i|0|dona:250
sharbat-apelsin|Sharbat (apelsin)|Сок апельсиновый|apelsin sharbati,sok,сок|45|0.7|0.2|10|i|0|stakan:250
sharbat-olma|Sharbat (olma)|Сок яблочный|olma sharbati,яблочный сок|46|0.1|0.1|11|i|0|stakan:250
sharbat-anor|Sharbat (anor)|Сок гранатовый|anor sharbati|54|0.2|0.3|13|i|0|stakan:250
sharbat-uzum|Sharbat (uzum)|Сок виноградный|uzum sharbati|60|0.4|0.1|15|i|0|stakan:250
sharbat-pomidor|Sharbat (pomidor)|Сок томатный|pomidor sharbati|17|0.8|0.1|3.5|i|0|stakan:250
kompot|Kompot (shakar bilan)|Компот|kompot,компот|55|0.2|0|14|i|1|stakan:250
kvas|Kvas|Квас|kvas,квас|27|0.2|0|5.2|i|0|stakan:250
kakao|Kakao (sutda)|Какао на молоке|kakao,какао|80|3|3|11|i|1|stakan:250,piyola:200
smuzi|Smuzi (meva)|Смузи фруктовый|smoothie,smuzi,смузи|60|1|0.5|13|i|1|stakan:250
suv|Suv|Вода|suv,voda,вода,mineral suv|0|0|0|0|i|0|stakan:250,shisha:500
pivo|Pivo|Пиво|beer,pivo,пиво|43|0.5|0|3.6|i|0|stakan:250,shisha:500
vino|Vino (quruq)|Вино сухое|wine,vino,вино|85|0.1|0|2.6|i|0|stakan:150
lavash-tovuq|Lavash (tovuqli, shaurma)|Шаурма с курицей|shaurma,lavash tovuqli,шаурма|200|11|9|20|q|1|dona:300
lavash-mol|Lavash (mol go'shtli, shaurma)|Шаурма с говядиной|lavash mol,shaurma mol|230|11|12|20|q|1|dona:300
doner|Doner kebab|Донер кебаб|doner,doner kabob,донер|215|11|11|19|q|1|dona:300
burger|Burger (chizburger)|Чизбургер|burger,cheeseburger,бургер|265|13|12|27|q|1|dona:150
burger-katta|Burger (katta)|Большой бургер|big burger,katta burger|250|12|13|22|q|1|dona:220
hotdog|Hot-dog|Хот-дог|hotdog,hot dog,хот-дог|250|10|14|21|q|1|dona:115
kartoshka-fri|Kartoshka fri|Картофель фри|fri,french fries,картошка фри|310|3.5|15|41|q|1|porsiya:120,dona:5
pitsa|Pitsa (margarita)|Пицца Маргарита|pizza,пицца|250|11|10|29|q|1|bolak:110
pitsa-pepperoni|Pitsa (pepperoni)|Пицца Пепперони|pepperoni,пепперони|270|12|12|28|q|1|bolak:110
chebureki|Chebureki|Чебурек|cheburek,чебурек|300|10|17|27|q|1|dona:120
belyashi|Belyashi|Беляш|belyash,беляш|290|9|16|27|q|1|dona:100
naggets|Naggets (tovuq)|Наггетсы|nuggets,naggets,наггетсы|250|15|15|14|q|1|dona:20,porsiya:120
sendvich|Sendvich (tovuqli)|Сэндвич с курицей|sandwich,sendvich,сэндвич|220|12|8|25|q|1|dona:200
pelmeni|Pelmeni|Пельмени|pelmen,пельмени|250|11|12|24|q|1|dona:12,porsiya:250
vareniki|Vareniki (kartoshkali)|Вареники с картошкой|vareniki,вареники|170|5|3|30|q|1|dona:30,porsiya:250
blin|Blin (blinchik)|Блин|blin,blinchik,блины|230|6|12|25|q|1|dona:60
sirniki|Sirniki|Сырники|syrniki,сырники|220|14|9|20|q|1|dona:70
donut|Donut|Пончик|donut,ponchik,пончик|400|5|20|50|q|1|dona:60
chips|Chips (kartoshka)|Чипсы картофельные|chips,chipsy,чипсы|540|6|35|50|q|1|hovuch:30,dona:50
popkorn|Popkorn|Попкорн|popcorn,popkorn,попкорн|380|11|5|75|q|1|kosa:30
kraker|Kraker|Крекер|cracker,kraker,крекер|430|9|16|64|q|1|dona:5,hovuch:30
pechenye|Pechenye (oddiy)|Печенье|pechenye,pecheniye,cookie,печенье|450|7|15|70|h|1|dona:12
vafli|Vafli|Вафли|vafli,wafer,вафли|520|5|27|65|h|1|dona:30
shokolad-sut|Shokolad (sutli)|Шоколад молочный|shokolad,chocolate,шоколад|535|7|30|59|h|0|bolak:10,dona:90
shokolad-qora|Shokolad (qora, 70%)|Шоколад тёмный 70%|qora shokolad,gorkiy shokolad|600|8|43|46|h|0|bolak:10,dona:90
konfet|Konfet (shokoladli)|Конфета шоколадная|konfet,konfeta,конфета|450|4|20|65|h|1|dona:12
karamel|Karamel (lolipop)|Карамель|karamel,леденец,lolipop|380|0|0|95|h|0|dona:5
zefir|Zefir|Зефир|zefir,зефир|330|1|0|80|h|1|dona:35
marmelad|Marmelad|Мармелад|marmelad,мармелад|320|0|0|80|h|1|dona:15
xalva|Xalva (kungaboqarli)|Халва подсолнечная|halva,halvo,халва|520|12|30|50|h|1|bolak:30
navvot|Novvot|Нават (кристаллический сахар)|navvot,navot,нават,novvot,qand novvot|390|0|0|98|h|1|dona:10
shakar|Shakar|Сахар|shakar,sugar,сахар|387|0|0|100|h|0|choyq:5,qoshiq:25
qand|Qand (kub)|Сахар-рафинад|kub qand,рафинад|387|0|0|100|h|0|dona:5
tort|Tort (biskvitli)|Торт бисквитный|tort,торт,cake|350|4|16|48|h|1|bolak:100
napoleon|Napoleon (tort)|Торт Наполеон|napoleon,наполеон|400|5|24|42|h|1|bolak:100
medovik|Medovik|Медовик|medovik,медовик|340|4|15|48|h|1|bolak:100
keks|Keks|Кекс|keks,кекс,muffin|380|5|16|54|h|1|dona:60
pirog-olma|Pirog (olmali)|Яблочный пирог|apple pie,pirog,пирог|260|3|12|35|h|1|bolak:100
chakchak|Chak-chak|Чак-чак|chak chak,чак-чак|450|5|20|60|h|1|bolak:30
paxlava|Paxlava|Пахлава|pahlava,baklava,пахлава|450|6|26|50|h|1|dona:50
sgushyonka|Quyultirilgan sut (qaynatilgan)|Сгущёнка варёная|quyultirilgan sut,sgushenka,сгущёнка|320|7|8.5|56|h|1|qoshiq:30,choyq:10
sirok|Sirok (glazurli)|Сырок глазированный|sirok,сырок|400|8|23|32|h|1|dona:45
nutella|Shokoladli pasta|Шоколадная паста|nutella,нутелла|540|6|31|58|h|1|qoshiq:15,choyq:5
muzqaymoq-eskimo|Muzqaymoq (eskimo)|Эскимо|eskimo,эскимо|270|3|17|26|h|1|dona:60
yog|Osh yog'i (o'simlik)|Растительное масло|yog,osh yogi,maslo,масло растительное|884|0|100|0|x|0|qoshiq:14,choyq:5
zaytun-yogi|Zaytun yog'i|Оливковое масло|zaytun yogi,olive oil|884|0|100|0|x|0|qoshiq:14,choyq:5
mayonez|Mayonez|Майонез|mayonez,mayonnaise,майонез|630|1|67|3|x|0|qoshiq:15,choyq:5
ketchup|Ketchup|Кетчуп|ketchup,кетчуп|100|1.5|0.3|25|x|0|qoshiq:18
soya-sous|Soya sousi|Соевый соус|soya sousi,soy sauce|55|8|0|5|x|0|qoshiq:15
xummus|Xummus|Хумус|hummus,humus,хумус|170|8|10|14|x|1|qoshiq:15
tahini|Tahini (kunjut pastasi)|Тахини|tahini,tahina,тахини|595|17|54|21|x|0|qoshiq:15
jiz|Jiz (qovurilgan go'sht)|Джиз (жареное мясо)|jiz biz,джиз,жареное мясо|270|20|20|2|o|1|porsiya:150
beshbarmoq|Beshbarmoq|Бешбармак|beshbarmak,бешбармак|180|10|8|17|o|1|likop:350
jarkop|Jarkop|Жаркоп|zharkop,жаркоп|230|13|15|9|o|1|likop:300
tovuq-shurva|Tovuq sho'rvasi|Куриный суп|tovuq shorva,kurinyy sup|45|4|2|3|o|1|kosa:350
borsch|Borsh|Борщ|borsh,borshch,борщ|55|2.5|2.5|6|o|1|kosa:350
sabzavot-ragu|Sabzavotli ragu|Овощное рагу|ragu,sabzavotli ragu|70|2|3|9|o|1|likop:300
tost|Tost non|Тост|tost,тост|265|8|3|50|n|0|tilim:25
suxari|Suxari|Сухари|suxari,сухари|390|11|7|72|n|0|hovuch:30
ekler|Ekler|Эклер|ekler,эклер|330|6|20|32|h|1|dona:60
chizkeyk|Chizkeyk|Чизкейк|cheesecake,чизкейк|320|6|22|26|h|1|bolak:100
brauni|Brauni|Брауни|brownie,брауни|405|5|20|52|h|1|dona:50
krem-pishloq|Qaymoqli pishloq|Сливочный сыр|krem pishloq,cream cheese|250|6|23|4|s|0|qoshiq:20
motsarella|Motsarella|Моцарелла|mozzarella,моцарелла|280|22|22|2|s|0|tilim:25
steyk|Steyk (mol go'shti)|Стейк говяжий|steyk,steak,стейк|250|26|16|0|m|1|porsiya:200
tovuq-jigar|Tovuq jigari (pishgan)|Куриная печень|tovuq jigari,kurinaya pechen|165|25|6.5|1|m|0|porsiya:100
sardina|Sardina (konserva)|Сардины консервированные|sardina,sardiny,сардины|210|25|11|0|m|0|dona:90
qovoq-urugi|Qovoq urug'i|Тыквенные семечки|qovoq urugi,tykvennye semechki|560|30|49|11|d|0|hovuch:30
selderey|Selderey|Сельдерей|seldereya,selderey,сельдерей|16|0.7|0.2|3|v|0|dona:40
sut-kokteyl|Sut kokteyli|Молочный коктейль|sut kokteyl,milkshake|90|3|3|13|i|1|stakan:250
yashil-choy|Yashil choy|Зелёный чай|yashil choy,green tea,зелёный чай|1|0|0|0.2|i|0|piyola:200
sovuq-choy|Sovuq choy (limonli)|Холодный чай|ice tea,ledyanoy chay,холодный чай|25|0|0|6|i|0|stakan:250
latte|Kofe (latte)|Латте|latte,латте|45|2.5|2|4.5|i|1|stakan:250
kapuchino|Kofe (kapuchino)|Капучино|cappuccino,kapuchino,капучино|40|2|2|4|i|1|stakan:200
lavash-roll|Lavash roll|Ролл в лаваше|roll,ролл|210|10|9|23|q|1|dona:250
pitsa-4|Pitsa (4 pishloq)|Пицца 4 сыра|pitsa 4 pishloq,четыре сыра|280|13|14|27|q|1|bolak:110
qatiq-yogsiz|Qatiq (yog'siz)|Катык обезжиренный|yogsiz qatiq|35|3.5|0.5|4|s|1|stakan:250
qaynatma-baliq|Baliq sho'rvasi (uxa)|Уха|uxa,baliq shorva,уха|40|5|1.5|2|o|1|kosa:350
tofu|Tofu|Тофу|tofu,тофу|76|8|4.8|1.9|x|0|bolak:80
protein-kukun|Protein kukuni (whey)|Протеин сывороточный|protein,протеин,protein kukun,protein kokteyl,сывороточный,сывороточный протеин,whey,whey protein|400|78|6|8|x|1|skup:30
protein-izolyat|Protein izolyat (whey isolate)|Изолят сывороточного протеина|protein izolyat,izolyat,изолят,whey isolate,isolate|370|88|1|2|x|1|skup:30
protein-kazein|Kazein protein|Казеиновый протеин|kazein,казеин,casein,protein kazein,casein protein|355|76|2|7|x|1|skup:30
aminokislota|BCAA / aminokislotalar|BCAA / аминокислоты|bcaa,aminokislota,aminokislotalar,аминокислоты,бцаа,amino|0|0|0|0|x|1|skup:7
protein-bar|Protein batonchik|Протеиновый батончик|protein bar,batonchik,батончик|380|25|12|35|x|1|dona:60
`;
const rows = R.trim().split('\n').map((l) => l.split('|'));
const MANBA = JSON.parse(fs.readFileSync(path.join(__dirname, 'ovqatlar-manba.json'), 'utf8'));   // tekshirilgan taomlar: manba/hisob usuli (docs/kalkifit-baza-tekshiruv.md)
const DEF_M = { o: "Retsept: o'rtacha uy retsepti, masalliqlar grammidan (yog' hisobga olingan)", q: "Odatiy porsiya va o'rtacha retsept bo'yicha taxmin", h: "Odatiy porsiya va o'rtacha retsept bo'yicha taxmin", x: 'USDA FoodData Central va ochiq jadvallar (taxminiy)' };
const ALIAS = JSON.parse(fs.readFileSync(path.join(__dirname, 'ovqatlar-alias.json'), 'utf8'));   // qidiruv sinonimlari (qiymatlarga tegmaydi): imlo/rus/ingliz variantlari
const normA = (x) => String(x).toLowerCase().replace(/[’'`‘ʻʼ´′]/g, '').replace(/\s+/g, ' ').trim();
let aliasFoods = 0, aliasAdded = 0;
const out = [], ids = new Set(), warn = [];
for (const r of rows) {
  if (r.length !== 11) throw new Error('qator xato: ' + r.join('|'));
  const [id, n, ru, al, k, p, f, c, t, e, un] = r;
  if (ids.has(id)) throw new Error('takror id: ' + id); ids.add(id);
  const u = un.split(',').map((x) => { const [a, b] = x.split(':'); return [a, +b]; }); u.push(['g100', 100]);
  const o = { i: id, n, r: ru, a: al.split(',').filter(Boolean), k: +k, p: +p, f: +f, c: +c, t, e: +e, u };
  const atw = 4 * o.p + 9 * o.f + 4 * o.c;
  if (o.k > 20 && id !== 'vino' && Math.abs(atw - o.k) > Math.max(30, o.k * 0.25)) warn.push(id + ': kkal ' + o.k + ' ≠ makrodan ' + Math.round(atw));
  { const have = new Set([o.n, o.r].concat(o.a).map(normA)); let add = 0; (ALIAS[id] || []).forEach((a) => { const k = normA(a); if (k && !have.has(k)) { have.add(k); o.a.push(a); add++; } }); if (add) { aliasFoods++; aliasAdded += add; } }
  o.m = MANBA[id] || DEF_M[t] || DEF_M.x;       // manba / hisob usuli (har taomda)
  out.push(o);
}
// Bazani kengaytirish (tools/ovqatlar-kengaytma.js, 2026-10): qiymat FAQAT manbadan — USDA fdc_id, ishlab chiqaruvchi yorlig'i (data/manba/yorliq.json) yoki ular aralashmasi
{
  const KENG = require('./ovqatlar-kengaytma.js'), RD = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  const USDA = RD('data/manba/usda-sr-legacy.json').foods, YQ = fs.existsSync(path.join(__dirname, '..', 'data/manba/yorliq.json')) ? RD('data/manba/yorliq.json').yorliq : {};
  const r1 = (x) => Math.round((+x || 0) * 10) / 10;
  const part = (tok) => {                                  // bitta komponent: u:<id> | y:<kalit> | <id> | suv → 100 g dagi qiymat + bayon
    if (tok === 'suv') return { k: 0, p: 0, f: 0, c: 0, u: 'suv', r: 'вода' };
    const y = /^y:(.+)$/.exec(tok); if (y) { const L = YQ[y[1]]; return L ? { k: L.k, p: L.p, f: L.f, c: L.c, u: 'yorliq: ' + L.nom + ' (shtrix-kod ' + L.code + ')', r: 'этикетка: ' + L.nom + ' (штрихкод ' + L.code + ')' } : null; }
    const id = tok.replace(/^u:/, ''), U = USDA[id]; return U ? { k: U.kcal, p: U.p, f: U.f, c: U.c, u: 'USDA ' + id + ' («' + U.d + '»)', r: 'USDA ' + id + ' («' + U.d + '»)' } : null;
  };
  const ich = (t) => t === 'i' ? [' (ichimlik: 100 ml ≈ 100 g)', ' (напиток: 100 мл ≈ 100 г)'] : ['', ''];
  for (const row of KENG.concat(require('./ovqatlar-turk.js'), require('./ovqatlar-kengaytma2.js'), require('./ovqatlar-kengaytma3.js'), require('./ovqatlar-kengaytma4.js'), require('./ovqatlar-kengaytma5.js'))) {          // v67: fast-food tarmoqlari (taxminiy) va muzqaymoq turlari          // v66: 3-bosqich          // v65: 2-bosqich          // v64: 1-bosqich (tools/ovqatlar-kengaytma2.js)
    const [id, n, ru, al, t, un, src, tm, izU, izR] = row;          // v67: tm — fast-food TARMOG'I kaliti (evos, maxway…): qiymat taxminiy, tarmoq rasmiy qiymat e'lon qilmagan; izU/izR — og'irlik/tarkib qayerdan
    if (ids.has(id)) throw new Error('kengaytma: takror id ' + id);
    let v = null;
    if (/^u:\d+$/.test(src)) { const q = part(src), U = USDA[src.slice(2)]; if (q) v = Object.assign(q, { e: 0, m: 'USDA FDC ' + src.slice(2), ms: { u: 'USDA FoodData Central, fdc_id ' + src.slice(2) + ' («' + U.d + '»), 100 g uchun' + ich(t)[0] + '.', r: 'USDA FoodData Central, fdc_id ' + src.slice(2) + ' («' + U.d + '»), на 100 г' + ich(t)[1] + '.' } }); }
    else if (/^y:/.test(src)) { const L = YQ[src.slice(2)]; if (L) v = { k: L.k, p: L.p, f: L.f, c: L.c, e: 0, m: 'Yorliq: ' + L.nom + (L.code ? ' (OFF ' + L.code + ')' : ' (' + L.url + ')'), ms: { u: "Ishlab chiqaruvchi yorlig'i bo'yicha: " + L.nom + (L.brand ? ' (' + L.brand + ')' : '') + (L.code ? ' — Open Food Facts, shtrix-kod ' + L.code : ' — ishlab chiqaruvchi sayti: ' + L.url) + (L.qadoq ? ', qadoq ' + L.qadoq : '') + '; 100 g uchun' + ich(t)[0] + '. Boshqa ishlab chiqaruvchida biroz farq qilishi mumkin.', r: 'По этикетке производителя: ' + L.nom + (L.brand ? ' (' + L.brand + ')' : '') + (L.code ? ' — Open Food Facts, штрихкод ' + L.code : ' — сайт производителя: ' + L.url) + (L.qadoq ? ', упаковка ' + L.qadoq : '') + '; на 100 г' + ich(t)[1] + '. У другого производителя возможны небольшие отличия.' } }; }
    else if (/^m:/.test(src)) {
      const ps = src.slice(2).split('+').map((x) => { const i = x.lastIndexOf('*'); return { tok: x.slice(0, i), g: +x.slice(i + 1), q: part(x.slice(0, i)) }; });
      if (ps.every((x) => x.q && x.g > 0)) { const G = ps.reduce((a, x) => a + x.g, 0), sum = (k) => ps.reduce((a, x) => a + x.q[k] * x.g / 100, 0) / G * 100;
        v = { k: Math.round(sum('k')), p: sum('p'), f: sum('f'), c: sum('c'), e: 1, m: 'Hisob: ' + ps.map((x) => x.g + ' g ' + x.tok).join(' + '),
          ms: { u: 'Hisob (taxminiy, tayyorlashga qarab farq qiladi): ' + ps.map((x) => x.g + ' g — ' + x.q.u).join('; ') + '. Qiymat 100 g uchun' + ich(t)[0] + '.', r: 'Расчёт (примерно, зависит от приготовления): ' + ps.map((x) => x.g + ' г — ' + x.q.r).join('; ') + '. На 100 г' + ich(t)[1] + '.' } }; }
    } else throw new Error('kengaytma: manba noto\'g\'ri ' + id + ' ' + src);
    if (!v) { warn.push('kengaytma: manba yo\'q, qo\'shilmadi — ' + id + ' (' + src + ')'); continue; }
    ids.add(id);
    const u = un.split(',').map((x) => { const [a, b] = x.split(':'); return [a, +b]; }); u.push(['g100', 100]);
    const o = { i: id, n, r: ru, a: al.split(',').filter(Boolean), k: Math.round(v.k), p: r1(v.p), f: r1(v.f), c: r1(v.c), t, e: v.e, u, m: v.m, ms: v.ms };
    if (tm) { if (!izU || !izR) throw new Error('kengaytma: tarmoq taomida og\'irlik manbasi izohi yo\'q ' + id); o.tm = tm; o.e = 1; { const tt = (/^tm-[a-z]+-([a-z]+)-/.exec(id) || [])[1], PP = { lavash: 3, tvister: 3, pitsa: 3, shaurma: 2, donar: 2, burger: 2, chizburger: 2, hotdog: 1 }; o.pp = PP[tt] || -1; }          // «evos» qidiruvida asosiy taomlar (lavash…) birinchi o.m = 'Taxminiy (tarmoq rasmiy qiymat e\'lon qilmagan): ' + o.m;
      o.ms = { u: "Taxminiy — tarmoq rasmiy qiymat e'lon qilmagan. " + izU + ' ' + o.ms.u, r: 'Примерно — сеть не публикует официальные значения. ' + izR + ' ' + o.ms.r }; }
    { const have = new Set([o.n, o.r].concat(o.a).map(normA)); (ALIAS[id] || []).forEach((a) => { const k = normA(a); if (k && !have.has(k)) { have.add(k); o.a.push(a); } }); }
    out.push(o);
  }
}
// Admin ma'qullagan qo'shimcha taomlar (tools/ovqatlar-merge.js shu faylga yozadi): baza qayta yasalganda ham yo'qolmaydi
const EXTRA = path.join(__dirname, 'ovqatlar-extra.json');
if (fs.existsSync(EXTRA)) for (const x of JSON.parse(fs.readFileSync(EXTRA, 'utf8'))) { if (ids.has(x.i)) { warn.push('qo\'shimcha takror id: ' + x.i); continue; } ids.add(x.i); out.push(x); }
// v67: muzqaymoq TURLARI ko'rinadi (mevali muz, sorbet, sutli, qaymoqli, plombir, eskimo, stakancha, rojok, sendvich, vafli — foydalanuvchi so'radi); qolgan dublikat/brendsiz variantlar yashirin. v34: muzqaymoq — bitta umumiy («Muzqaymoq (o'rtacha)») + brendli mahsulotlar; boshqa umumiy turlar qidiruvda ko'rinmaydi (h: 1), eski yozuvlar id bo'yicha ochiladi
{ const YASHIR = new Set(['muzqaymoq-eskimo', 'mz-plombir-stakan', 'mz-plombir-vafli', 'mz-shokolad', 'mz-shokolad-plombir', 'mz-qulupnay', 'mz-shakarsiz', 'mz-yumshoq', 'mz-konus-sundae', 'mz-eskimo-yongoq', 'mz-sundae', 'mz-makflurri', 'mz-shokolad-light']);
  out.forEach((o) => { if (YASHIR.has(o.i)) o.h = 1; }); }
const V2 = require('./baza-v2.js').apply(out);      // baza v2: oilalar/omillar, birliklar (b), manba, retseptdan hisoblangan qiymatlar
fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'data', 'ovqatlar.json'), JSON.stringify({ v: 2, note: 'Qiymatlar 100 g uchun TAXMINIY: retsept taomlar — o\'rtacha uy retsepti (USDA FoodData Central + Скурихин, tools/baza-hisob.js), oddiy mahsulotlar — USDA/ochiq jadvallar. «x» — taxminiy (tarozida/ikki manba bilan tasdiqlanmagan).', mr: V2.mr, foods: V2.foods }));
console.log('baza v2: top', V2.meta.top, '| USDA bilan tekshirilgan oddiy mahsulotlar:', V2.meta.tekshirilgan, '| ±10% dan farq qilganlar:', V2.meta.farqlar.length); V2.meta.farqlar.forEach((x) => console.log('  ', x.id, 'baza', x.baza, 'USDA', x.usda, '(' + x.farq + '%)', x.fdc, x.d));
console.log('ovqatlar:', out.length, '| sinonim qo\'shilgan taomlar:', aliasFoods, '(+' + aliasAdded + ' ta nom) | ogohlantirish:', warn.length); warn.forEach((x) => console.log(' ', x));
