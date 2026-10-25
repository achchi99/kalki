/* kalki.uz — «Uyda» PP retseptlari kutubxonasi (MANBA; data/uyda-pp.json ni tools/uyda-pp-yasa.js shundan yasaydi).
 * Har retsept: id | guruh | daqiqa | ovqat turlari (b nonushta · l tushlik · d kechki · s tamaddi) | nom UZ | nom RU | rasm (assets/ovqat/<rasm>-128|256.webp — HAR retseptda; harf-zaglushka yo'q)
 *   ing: <baza id>:<gramm>[:<dona>[:<variant>]], …   — id data/ovqatlar.json da BO'LISHI SHART (test tekshiradi). Gramm — shu bazadagi qiymat holatida (pishgan/xom nomida yozilgan).
 *   uz: / ru: — 3–4 qisqa qadam, « / » bilan ajratiladi.
 * Kkal, oqsil, yog', uglevod QO'LDA YOZILMAYDI: tarkibdan, bazadagi qiymatlar bo'yicha hisoblanadi (assets/uyda-pp-core.js), ilovada «taxminiy» belgisi bilan.
 * Guruhlar: tayyorsiz (0–5 daq) · tez (10–15 daq) · pishirsa (25–45 daq). Cho'chqa go'shti ishlatilmaydi. */
'use strict';
const R = `
tvorog-yogurt|tayyorsiz|3|bs|Tvorog va yunon yogurti|Творог с греческим йогуртом|tvorog
ing: tvorog5:120, yogurt-yunon:100, asal:8
uz: Tvorog va yogurtni piyolaga soling. / Silliq bo'lguncha aralashtiring. / Ustiga asal tomizing.
ru: Выложите творог и йогурт в пиалу. / Перемешайте до однородности. / Сверху добавьте мёд.

tvorog-meva|tayyorsiz|4|bs|Tvorog va mevalar|Творог с фруктами|tvorog
ing: tvorog5:150, qulupnay:80, banan:60, asal:8
uz: Mevalarni yuvib, mayda to'g'rang. / Tvorogni likopchaga soling. / Mevalarni ustiga qo'yib, asal tomizing.
ru: Помойте и нарежьте фрукты. / Выложите творог на тарелку. / Добавьте фрукты и полейте мёдом.

protein-suv|tayyorsiz|2|bs|Protein kokteyl (suv bilan)|Протеиновый коктейль (на воде)|protein-kokteyl
ing: protein-kukun:30, suv:300
uz: Shakerga sovuq suv quying. / 1 skup (30 g) protein kukunini soling. / 20 soniya chayqating.
ru: Налейте в шейкер холодную воду. / Добавьте 1 мерную ложку (30 г) протеина. / Взбалтывайте 20 секунд.

protein-sut-banan|tayyorsiz|4|bs|Protein kokteyl sut va banan bilan|Протеиновый коктейль с молоком и бананом|protein-kokteyl
ing: protein-kukun:30, sut:250:::f1, banan:80
uz: Sut, banan va protein kukunini blenderga soling. / 30 soniya aralashtiring. / Stakanga quyib darrov iching.
ru: Положите молоко, банан и протеин в блендер. / Взбейте 30 секунд. / Перелейте в стакан и выпейте сразу.

kefir-banan-suli|tayyorsiz|5|bs|Kefir, banan va suli kokteyli|Коктейль из кефира, банана и овсянки|smuzi
ing: kefir:250:::f1, banan:100, suli-xom:30
uz: Kefir, banan va suli yormasini blenderga soling. / 1 daqiqa aralashtiring. / 5 daqiqa qoldiring — quyuqlashadi.
ru: Положите кефир, банан и овсяные хлопья в блендер. / Взбейте 1 минуту. / Дайте постоять 5 минут — загустеет.

yunon-yogurt-yongoq|tayyorsiz|3|bs|Yunon yogurti va yong'oq|Греческий йогурт с орехами|yogurt
ing: yogurt-yunon:150, yongoq:20, asal:8
uz: Yogurtni piyolaga soling. / Yong'oqni maydalab ustiga sepin. / Asal tomizing.
ru: Выложите йогурт в пиалу. / Измельчите орехи и посыпьте сверху. / Добавьте мёд.

tuxum-sabzavot|tayyorsiz|5|bls|Qaynatilgan tuxum va sabzavot|Варёные яйца с овощами|tuxum
ing: tuxum:100:2, bodring:100, pomidor:100
uz: Oldindan qaynatilgan tuxumni archib, ikkiga kesing. / Bodring va pomidorni bo'laklang. / Likopchaga yoyib, tuz sepin.
ru: Очистите заранее сваренные яйца и разрежьте пополам. / Нарежьте огурец и помидор. / Выложите на тарелку и посолите.

non-tvorog-pasta|tayyorsiz|4|bs|Non va tvorog pastasi|Хлеб с творожной пастой|tost
ing: non-bugdoy:60, tvorog5:80, kokat:10, bodring:50
uz: Tvorogni ko'katlar bilan ezib aralashtiring. / Nonga surting. / Ustiga bodring tilimlarini qo'ying.
ru: Разомните творог с зеленью. / Намажьте на хлеб. / Сверху выложите ломтики огурца.

avokado-tost|tayyorsiz|5|bs|Avokado va tuxumli tost|Тост с авокадо и яйцом|tost
ing: non-bugdoy:60, avokado:70, tuxum:50:1
uz: Nonni quruq tovada yoki tosterda qizdiring. / Avokadoni vilka bilan ezib, nonga surting. / Ustiga qaynatilgan tuxum tilimlarini qo'ying.
ru: Подсушите хлеб на сухой сковороде или в тостере. / Разомните авокадо вилкой и намажьте на хлеб. / Сверху выложите ломтики варёного яйца.

banan-yongoq|tayyorsiz|2|s|Banan va yong'oq|Банан с орехами|banan
ing: banan:120:1, yongoq:15
uz: Bananni archib, yumaloq to'g'rang. / Likopchaga soling. / Yong'oqni maydalab ustiga sepin.
ru: Очистите банан и нарежьте кружочками. / Выложите на тарелку. / Измельчите орехи и посыпьте сверху.

kefirli-suli|tayyorsiz|5|bs|Kefirli suli (kechadan tayyor)|Овсянка на кефире (с вечера)|kefir
ing: suli-xom:40, kefir:150:::f1, olma:80, yongoq:10
uz: Suli yormasini kefir bilan idishga solib aralashtiring. / Muzlatkichda kamida 2 soat (yoki kechasi) qoldiring. / Olmani tuxumdon qilib ustiga sepin, yong'oq qo'shing.
ru: Смешайте овсяные хлопья с кефиром в банке. / Уберите в холодильник минимум на 2 часа (или на ночь). / Добавьте тёртое яблоко и орехи.

yogurt-rezavor|tayyorsiz|3|bs|Yogurt va rezavorlar|Йогурт с ягодами|yogurt-meva
ing: yogurt-tabiiy:150, malina:80, yongoq:10
uz: Yogurtni piyolaga soling. / Rezavorlarni yuvib qo'shing. / Maydalangan yong'oq sepin.
ru: Выложите йогурт в пиалу. / Добавьте промытые ягоды. / Посыпьте измельчёнными орехами.

pishloqli-buterbrod|tayyorsiz|4|bls|Pishloq va pomidorli buterbrod|Бутерброд с сыром и помидором|sendvich
ing: non-bugdoy:60, pishloq:30, pomidor:80, salat-barg:15
uz: Nonni qizdiring. / Ustiga salat bargi, pishloq va pomidor tilimlarini qo'ying. / Ikkiga bukib yeng.
ru: Подсушите хлеб. / Сверху выложите листья салата, сыр и ломтики помидора. / Сложите пополам и ешьте.

sabzavot-tvorog-sous|tayyorsiz|5|ls|Sabzavot tayoqchalari va tvorog sousi|Овощные палочки с творожным соусом|salat-sabzavot
ing: tvorog5:100, yogurt-yunon:50, kokat:10, sabzi:80, bodring:100
uz: Tvorog, yogurt va ko'katni aralashtirib sous tayyorlang. / Sabzi va bodringni tayoqcha qilib kesing. / Tayoqchalarni sousga botirib yeng.
ru: Смешайте творог, йогурт и зелень — получится соус. / Нарежьте морковь и огурец палочками. / Макайте палочки в соус.

kefir-bodring|tayyorsiz|4|ls|Kefir va bodring (sovuq)|Кефир с огурцом (холодный)|ayron
ing: kefir:250:::f1, bodring:120, kokat:15
uz: Bodringni mayda to'g'rang. / Kefirga bodring va maydalangan ko'katni qo'shing. / Tuz sepib aralashtiring, sovuq holda iching.
ru: Мелко нарежьте огурец. / Добавьте в кефир огурец и рубленую зелень. / Посолите, перемешайте и пейте холодным.

yongoq-quruqmeva|tayyorsiz|2|s|Yong'oq va quruq mevalar|Орехи с сухофруктами|aralash-yongoq
ing: yongoq:20, bodom:15, quruq-orik:30
uz: Quruq o'rikni mayda to'g'rang. / Yong'oq, bodom va o'rikni kosachaga soling. / Aralashtirib, sekin yeng.
ru: Мелко нарежьте курагу. / Положите грецкие орехи, миндаль и курагу в пиалу. / Перемешайте и ешьте не спеша.

banan-sutli-smuzi|tayyorsiz|4|bs|Banan va sutli smuzi|Смузи с бананом и молоком|smuzi
ing: sut:200:::f1, banan:100, yogurt-yunon:50
uz: Barcha masalliqni blenderga soling. / 30 soniya aralashtiring. / Stakanga quying.
ru: Положите все продукты в блендер. / Взбейте 30 секунд. / Перелейте в стакан.

tvorog-asal-yongoq|tayyorsiz|3|bs|Tvorog, asal va yong'oq|Творог с мёдом и орехами|tvorog
ing: tvorog5:150, asal:10, yongoq:15
uz: Tvorogni piyolaga soling. / Asal tomizing. / Maydalangan yong'oq sepin.
ru: Выложите творог в пиалу. / Добавьте мёд. / Посыпьте измельчёнными орехами.

olma-yunon-yogurt|tayyorsiz|3|bs|Olma bilan yunon yogurti|Греческий йогурт с яблоком|yogurt
ing: olma:150, yogurt-yunon:100, yongoq:15
uz: Olmani mayda kubik qilib to'g'rang. / Yogurt bilan aralashtiring. / Yong'oq sepin.
ru: Нарежьте яблоко мелкими кубиками. / Смешайте с йогуртом. / Посыпьте орехами.

tvorogli-lavash|tayyorsiz|5|bls|Tvorogli lavash|Лаваш с творогом|lavash-yupqa
ing: lavash-non:40, tvorog5:100, kokat:10, bodring:60
uz: Lavashni stolga yoying. / Tvorogni ko'kat bilan aralashtirib surting, bodring qo'ying. / Rulet qilib o'rang va ikkiga kesing.
ru: Разложите лаваш на столе. / Намажьте творог с зеленью, добавьте огурец. / Заверните рулетом и разрежьте пополам.

omlet-sabzavot|tez|10|bl|Sabzavotli omlet|Омлет с овощами|tuxum-boltunya
ing: tuxum:100:2:omlet, pomidor:60, qalampir:40, sut:40:::f1, zaytun-yogi:5
uz: Tuxumni sut va tuz bilan chayqating. / Sabzavotlarni mayda to'g'rab, yog'da 2 daqiqa qovuring. / Tuxum aralashmasini quyib, qopqoq ostida 5 daqiqa pishiring.
ru: Взбейте яйца с молоком и солью. / Мелко нарежьте овощи и обжарьте 2 минуты на масле. / Залейте яйцами и готовьте под крышкой 5 минут.

omlet-pishloq-ismaloq|tez|10|bl|Pishloqli ismaloq omleti|Омлет со шпинатом и сыром|tuxum-boltunya
ing: tuxum:100:2:omlet, pishloq:25, ismaloq:50, zaytun-yogi:5
uz: Ismaloqni 1 daqiqa tovada soling. / Chayqatilgan tuxumni quying. / Pishay deganda ustiga pishloq sepib, buking.
ru: Прогрейте шпинат 1 минуту на сковороде. / Влейте взбитые яйца. / Когда схватится, посыпьте сыром и сложите пополам.

lavash-rulet-tovuq|tez|10|lds|Tovuqli lavash-rulet|Лаваш-ролл с курицей|lavash
ing: lavash-non:40, tovuq-kokrak:80, bodring:50, yogurt-yunon:30, kokat:5
uz: Tovuq ko'kragini (pishgan) mayda to'g'rang. / Lavashga yogurtni surting, tovuq, bodring va ko'kat qo'ying. / Rulet qilib o'rang, tovada har tomonini 1 daqiqadan qizdiring.
ru: Нарежьте готовую куриную грудку. / Смажьте лаваш йогуртом, выложите курицу, огурец и зелень. / Заверните рулетом и подрумяньте по минуте с каждой стороны.

lavash-rulet-tuxum|tez|10|bl|Tuxumli lavash-rulet|Лаваш-ролл с яйцом|lavash-yupqa
ing: lavash-non:40, tuxum:100:2, kok-piyoz:15, pishloq:20
uz: Tuxumni qaynatib, maydalang. / Ko'k piyoz va pishloq bilan aralashtiring. / Lavashga soling, rulet qilib o'rang.
ru: Сварите яйца и покрошите. / Смешайте с зелёным луком и сыром. / Выложите на лаваш и заверните рулетом.

grechka-tovuq|tez|15|ld|Grechka va tovuq|Гречка с курицей|tovuq-kokrak
ing: grechka:150, tovuq-kokrak:100, piyoz:30, sabzi:40, zaytun-yogi:5
uz: Grechkani oldindan qaynating. / Piyoz va sabzini yog'da yumshatib, mayda to'g'ralgan tovuqni qo'shing 5 daqiqa. / Grechka bilan aralashtirib, 2 daqiqa damlang.
ru: Заранее сварите гречку. / Обжарьте лук и морковь, добавьте нарезанную курицу на 5 минут. / Смешайте с гречкой и дайте настояться 2 минуты.

suli-botqa-banan|tez|10|bs|Banan va yong'oqli suli bo'tqa|Овсяная каша с бананом и орехами|shirguruch
ing: suli-xom:50, sut:150:::f1, suv:100, banan:60, yongoq:10
uz: Suli, sut va suvni qozonchaga solib, 7 daqiqa qaynating. / Doim aralashtirib turing. / Banan va yong'oq qo'shib bering.
ru: Сварите хлопья на молоке и воде 7 минут. / Постоянно помешивайте. / Подавайте с бананом и орехами.

sirniki-tovada|tez|15|bs|Tvorogli sirniki (tovada)|Сырники на сковороде|sirniki
ing: tvorog5:200, tuxum-xom:50:1, un:25, asal:10, yog:5
uz: Tvorog, tuxum va unni aralashtiring. / Kichik dumaloq qilib shakllang. / Yog'langan tovada har tomonini 3 daqiqadan qovuring.
ru: Смешайте творог, яйцо и муку. / Слепите небольшие лепёшки. / Обжарьте на смазанной сковороде по 3 минуты с каждой стороны.

tunets-salat|tez|10|ld|Tunets salati|Салат с тунцом|tunets
ing: tunets-suv:90, tuxum:50:1, bodring:80, pomidor:80, kok-piyoz:15, zaytun-yogi:5
uz: Tunetsni suvidan oqizib, vilka bilan ezing. / Tuxum, bodring va pomidorni to'g'rang. / Hammasini aralashtirib, zaytun yog'i va tuz qo'shing.
ru: Слейте жидкость с тунца и разомните вилкой. / Нарежьте яйцо, огурец и помидор. / Смешайте всё, добавьте масло и соль.

tovuq-sendvich|tez|10|ld|Tovuqli sendvich|Сэндвич с курицей|sendvich
ing: non-bugdoy:60, tovuq-kokrak:80, pomidor:60, salat-barg:15, pishloq:20, yogurt-yunon:20
uz: Nonni qizdiring va yogurt surting. / Salat bargi, tovuq, pomidor va pishloqni terib chiqing. / Ikkinchi non bilan yoping. Tilimlab eng.
ru: Подсушите хлеб и намажьте йогуртом. / Выложите салат, курицу, помидор и сыр. / Накройте вторым ломтиком и разрежьте.

ismaloqli-tuxum|tez|10|bl|Ismaloq va pomidorli tuxum|Яичница со шпинатом и помидором|tuxum
ing: tuxum-qov-yogsiz:100:2, ismaloq:80, pomidor:60
uz: Yopishmaydigan tovada ismaloq va pomidorni 2 daqiqa dimlang. / Tuxumni sindirib qo'ying. / Qopqoq ostida 4 daqiqa pishiring.
ru: Потушите шпинат и помидор 2 минуты на антипригарной сковороде. / Вбейте яйца. / Готовьте под крышкой 4 минуты.

tuxumli-guruch|tez|12|ld|Tuxumli guruch (sabzavot bilan)|Рис с яйцом и овощами|qovurilgan-guruch
ing: guruch:150, tuxum:100:2:omlet, kok-piyoz:20, sabzi:40, zaytun-yogi:5
uz: Pishgan guruchni (kechagi yoki yangi) tayyorlang. / Sabzini mayda to'g'rab, yog'da yumshating, tuxumni aralashtirib qovuring. / Guruch va ko'k piyozni qo'shib, 2 daqiqa qizdiring.
ru: Подготовьте готовый рис. / Обжарьте тёртую морковь, добавьте яйца и перемешайте. / Добавьте рис и зелёный лук, прогрейте 2 минуты.

krevetka-qovoqcha|tez|12|ld|Krevetka va qovoqcha|Креветки с кабачком|krevetka
ing: krevetka:120, qovoqcha:150, sarimsoq:5, zaytun-yogi:5
uz: Qovoqchani yarim halqa qilib to'g'rang. / Yog'da sarimsoq bilan 3 daqiqa qovuring. / Krevetkani qo'shib, yana 4 daqiqa pishiring.
ru: Нарежьте кабачок полукольцами. / Обжарьте с чесноком 3 минуты. / Добавьте креветки и готовьте ещё 4 минуты.

makaron-tunets|tez|15|ld|Makaron va tunets|Паста с тунцом|spagetti
ing: makaron-pishgan2:150, tunets-suv:80, pomidor:100, piyoz:30, zaytun-yogi:5
uz: Makaronni qaynatib suzing. / Piyoz va pomidorni yog'da 4 daqiqa dimlang. / Tunets va makaron qo'shib, 2 daqiqa aralashtiring.
ru: Отварите пасту и откиньте. / Потушите лук и помидор 4 минуты. / Добавьте тунец и пасту, перемешайте 2 минуты.

tovuq-brokkoli|tez|15|ld|Tovuq va brokkoli|Курица с брокколи|tovuq-kokrak-grill
ing: tovuq-kokrak:120, brokkoli:120, sabzi:50, zaytun-yogi:5
uz: Brokkolini bo'laklarga ajrating, sabzini yupqa to'g'rang. / Tovuqni (pishgan) kubik qilib, sabzavot bilan 6 daqiqa dimlang. / Tuz va ziravor qo'shing.
ru: Разберите брокколи на соцветия, морковь нарежьте тонко. / Потушите нарезанную курицу с овощами 6 минут. / Добавьте соль и специи.

yasmiq-salat|tez|10|ld|Yasmiqli salat|Салат с чечевицей|salat-sabzavot
ing: yasmiq:120, tuxum:50:1, pomidor:80, bodring:80, piyoz:20, zaytun-yogi:5
uz: Yasmiqni (pishgan) sovuting. / Sabzavot va tuxumni to'g'rang. / Hammasini aralashtirib, zaytun yog'i va tuz qo'shing.
ru: Остудите готовую чечевицу. / Нарежьте овощи и яйцо. / Смешайте всё, добавьте масло и соль.

tuxumli-tortilya|tez|12|bl|Tuxum va loviyali tortilya|Тортилья с яйцом и фасолью|burrito
ing: tortilya:45, tuxum-qov-yogsiz:100:2, loviya:50, pomidor:50, pishloq:15
uz: Tuxumni yopishmaydigan tovada aralashtirib pishiring. / Tortilyani qizdiring. / Tuxum, loviya, pomidor va pishloqni solib, buking.
ru: Приготовьте яичницу-болтунью на антипригарной сковороде. / Подогрейте тортилью. / Выложите яйцо, фасоль, помидор и сыр, сверните.

qovoqcha-frittata|tez|15|bld|Qovoqchali frittata|Фриттата с кабачком|turk-mucver
ing: qovoqcha:150, tuxum:100:2:omlet, pishloq:20, piyoz:20, zaytun-yogi:5
uz: Qovoqcha va piyozni 4 daqiqa yog'da yumshating. / Tuxum va pishloqni aralashtirib quying. / Qopqoq ostida past olovda 6 daqiqa pishiring.
ru: Потушите кабачок и лук 4 минуты на масле. / Залейте яйцами с сыром. / Готовьте под крышкой на слабом огне 6 минут.

kartoshka-tvorog|tez|15|ld|Pishgan kartoshka va tvorog|Печёный картофель с творогом|turk-kumpir
ing: kartoshka:200, tvorog5:100, kokat:10, bodring:60
uz: Kartoshkani yuvib, mikroto'lqinli pechda 8 daqiqa pishiring (yoki oldindan qaynatilganini oling). / Ikkiga kesib, tvorog va ko'katni qo'ying. / Yonida bodring bilan bering.
ru: Помойте картофель и запеките в микроволновке 8 минут (или возьмите отварной). / Разрежьте и выложите творог с зеленью. / Подавайте с огурцом.

banan-suli-pankeyk|tez|12|bs|Banan va sulili pankeyk|Банано-овсяные панкейки|pankeyk
ing: suli-quruq:40, banan:100, tuxum-xom:50:1, yog:3
uz: Banan, suli va tuxumni blenderda aralashtiring. / Yog'langan tovada kichik pankeyk quying. / Har tomonini 2 daqiqadan pishiring.
ru: Взбейте банан, хлопья и яйцо в блендере. / Выпекайте маленькие панкейки на смазанной сковороде. / По 2 минуты с каждой стороны.

tovuq-yogurt-salat|tez|10|ld|Tovuq va bodring salati|Салат с курицей и огурцом|salat-qatiq
ing: tovuq-kokrak:100, bodring:80, yogurt-yunon:40, salat-barg:30, zaytun-yogi:5
uz: Tovuq ko'kragini (pishgan) tolalarga ajrating. / Bodring va salat bargini to'g'rang. / Yogurt va yog' bilan aralashtiring.
ru: Разберите куриную грудку на волокна. / Нарежьте огурец и салат. / Заправьте йогуртом и маслом.

tovuq-pita|tez|10|lds|Tovuqli pita|Пита с курицей|pita
ing: non-pita:60, tovuq-kokrak:80, yogurt-yunon:30, pomidor:50, bodring:40
uz: Pitani ikkiga kesib, ichini yogurt bilan suring. / Tovuq, pomidor va bodringni soling. / Yengil qizdirib bering.
ru: Разрежьте питу и смажьте йогуртом внутри. / Начините курицей, помидором и огурцом. / Слегка подогрейте.

mosh-salat|tez|10|ld|Mosh va sabzavot salati|Салат с машем и овощами|salat-sabzavot
ing: mosh:120, bodring:80, pomidor:80, kok-piyoz:15, zaytun-yogi:5
uz: Moshni (pishgan) sovuting. / Sabzavotni mayda to'g'rang. / Aralashtirib, zaytun yog'i va tuz qo'shing.
ru: Остудите готовый маш. / Мелко нарежьте овощи. / Смешайте, добавьте масло и соль.

kefirli-okroshka|tez|12|ld|Kefirli okroshka|Окрошка на кефире|turk-cacik
ing: kefir:300:::f1, bodring:120, tuxum:50:1, kokat:15, kartoshka:100
uz: Kartoshka va tuxumni oldindan qaynating. / Hammasini mayda kubik qilib to'g'rang. / Kefir quyib, tuz qo'shing, sovuq bering.
ru: Заранее сварите картофель и яйцо. / Нарежьте всё мелкими кубиками. / Залейте кефиром, посолите, подавайте холодной.

yasmiq-shurva|pishirsa|35|ld|Yasmiq (chechevitsa) sho'rva|Суп из чечевицы|yasmiq-shurva
ing: yasmiq:120, kartoshka-xom:100, sabzi:50, piyoz:40, suv:300, zaytun-yogi:5
uz: Piyoz va sabzini yog'da 3 daqiqa yumshating. / Kartoshka, yasmiq va suv qo'shib, 25 daqiqa qaynating. / Tuz va zira bilan ta'm bering.
ru: Обжарьте лук и морковь 3 минуты. / Добавьте картофель, чечевицу и воду, варите 25 минут. / Приправьте солью и зирой.

yasmiq-garnir-tovuq|pishirsa|30|ld|Yasmiq garniri va tovuq|Чечевица с курицей|tovuq-qozon
ing: yasmiq:150, tovuq-kokrak:100, sabzi:40, piyoz:30, zaytun-yogi:5
uz: Yasmiqni oldindan yumshoq qilib qaynating. / Piyoz, sabzi va tovuqni 8 daqiqa dimlang. / Yasmiq bilan aralashtirib, 5 daqiqa damlang.
ru: Заранее сварите чечевицу до мягкости. / Потушите лук, морковь и курицу 8 минут. / Смешайте с чечевицей и дайте настояться 5 минут.

tovuq-sabzavot-duxovka|pishirsa|35|ld|Duxovkada tovuq va sabzavot|Курица с овощами в духовке|tovuq-duxovka
ing: tovuq-kokrak-duxovka:130, brokkoli:100, gulkaram:100, qalampir:60, zaytun-yogi:5
uz: Duxovkani 200° gacha qizdiring. / Sabzavotni bo'laklab, tovuq bilan qoliplarga soling, yog' va tuz qo'shing. / 25 daqiqa pishiring.
ru: Разогрейте духовку до 200°. / Выложите овощи и курицу на противень, добавьте масло и соль. / Запекайте 25 минут.

mastava-yengil|pishirsa|40|ld|Yengil mastava|Лёгкая мастава|mastava
ing: mol-qiyma:60, guruch-xom:30, kartoshka-xom:100, sabzi:40, piyoz:40, pomidor:60, zaytun-yogi:5
uz: Piyoz, sabzi va qiymani yog'da 5 daqiqa qovuring. / Pomidor, kartoshka va suv qo'shing. / Guruchni solib, 20 daqiqa qaynating.
ru: Обжарьте лук, морковь и фарш 5 минут. / Добавьте помидор, картофель и воду. / Всыпьте рис и варите 20 минут.

baliq-duxovka|pishirsa|30|ld|Duxovkada baliq (treska)|Треска в духовке|sazan-duxovka
ing: treska:150, pomidor:100, qovoqcha:100, zaytun-yogi:5, limon:20
uz: Duxovkani 190° ga qizdiring. / Baliq, pomidor va qovoqchani qolipga soling, limon sixing. / 20 daqiqa pishiring.
ru: Разогрейте духовку до 190°. / Выложите рыбу, помидор и кабачок в форму, сбрызните лимоном. / Запекайте 20 минут.

dimlama-yengil|pishirsa|45|ld|Yengil dimlama|Лёгкая димлама|dimlama
ing: mol-qaynatilgan:100, kartoshka-xom:150, karam:100, sabzi:50, piyoz:50, pomidor:80, zaytun-yogi:5
uz: Qozonga go'sht, piyoz va sabzini yotqizing. / Ustiga kartoshka, karam va pomidorni qatlam-qatlam soling. / Qopqoq ostida 35 daqiqa past olovda dimlang.
ru: Выложите в казан мясо, лук и морковь. / Сверху слоями картофель, капусту и помидор. / Тушите под крышкой 35 минут на слабом огне.

moshxorda-yengil|pishirsa|35|ld|Yengil moshxo'rda|Лёгкая мошхурда|moshxorda-goshtsiz
ing: mosh:100, guruch:30, kartoshka-xom:100, sabzi:40, piyoz:40, yogurt-yunon:30, zaytun-yogi:5
uz: Piyoz va sabzini yog'da yumshating. / Mosh, kartoshka va suv solib, 20 daqiqa qaynating. / Guruch qo'shib, yana 8 daqiqa pishiring; yogurt bilan bering.
ru: Обжарьте лук и морковь. / Добавьте маш, картофель и воду, варите 20 минут. / Всыпьте рис, варите ещё 8 минут; подавайте с йогуртом.

moshkichiri-yengil|pishirsa|35|ld|Yengil moshkichiri|Лёгкая мошкичири|moshkichiri
ing: guruch-xom:40, mosh:80, sabzi:40, piyoz:40, zaytun-yogi:5
uz: Piyoz va sabzini yog'da yumshating. / Mosh, guruch va suv qo'shing (suv ikki barobar). / Past olovda 25 daqiqa pishiring.
ru: Обжарьте лук и морковь. / Добавьте маш, рис и воду (в два раза больше). / Варите на слабом огне 25 минут.

tovuq-shurva-yengil|pishirsa|35|ld|Yengil tovuq sho'rva|Лёгкий куриный суп|shorva
ing: tovuq-kokrak:120, kartoshka-xom:100, sabzi:40, piyoz:30, kokat:10
uz: Tovuqni sovuq suvda 15 daqiqa qaynating. / Kartoshka, sabzi va piyozni qo'shing. / Yana 15 daqiqa qaynatib, ko'kat sepin.
ru: Варите курицу в холодной воде 15 минут. / Добавьте картофель, морковь и лук. / Варите ещё 15 минут, посыпьте зеленью.

qovoq-krem-shurva|pishirsa|30|ld|Qovoqli krem-sho'rva|Тыквенный крем-суп|turk-ezogelin
ing: qovoq:250, kartoshka-xom:80, piyoz:40, yogurt-yunon:30, zaytun-yogi:5
uz: Qovoq, kartoshka va piyozni kubik qilib, suvda 20 daqiqa qaynating. / Blenderda pyure qiling. / Yogurt qo'shib bering.
ru: Сварите кубики тыквы, картофеля и лука 20 минут. / Пробейте блендером в пюре. / Подавайте с йогуртом.

bulgur-tovuq-osh|pishirsa|35|ld|Bulg'urli tovuq oshi (yengil)|Бульгур с курицей (лёгкий плов)|osh-tovuq
ing: bulgur:150, tovuq-kokrak:100, sabzi:60, piyoz:40, zaytun-yogi:8
uz: Piyoz, sabzi va tovuqni yog'da 8 daqiqa qovuring. / Bulg'ur va oz suv qo'shing. / Qopqoq ostida 15 daqiqa damlang.
ru: Обжарьте лук, морковь и курицу 8 минут. / Добавьте бульгур и немного воды. / Томите под крышкой 15 минут.

losos-brokkoli|pishirsa|25|ld|Losos va brokkoli (duxovka)|Лосось с брокколи в духовке|losos-steyk
ing: losos:120, brokkoli:150, limon:20, zaytun-yogi:5
uz: Duxovkani 200° ga qizdiring. / Losos va brokkolini qolipga soling, limon sixib, tuz sepin. / 18 daqiqa pishiring.
ru: Разогрейте духовку до 200°. / Выложите лосось и брокколи в форму, сбрызните лимоном, посолите. / Запекайте 18 минут.

baqlajon-qiyma|pishirsa|40|ld|Baqlajon va qiyma (duxovka)|Баклажан с фаршем в духовке|turk-karniyarik
ing: baqlajon:200, mol-qiyma:80, pomidor:80, piyoz:30, pishloq:20
uz: Baqlajonni uzunasiga ikkiga kesing, o'rtasini bo'shating. / Piyoz, pomidor va qiymani dimlab, ichiga soling. / Pishloq sepib, 25 daqiqa pishiring.
ru: Разрежьте баклажан вдоль и выберите серединку. / Потушите лук, помидор и фарш, начините баклажан. / Посыпьте сыром и запекайте 25 минут.

kurka-kotlet-bugda|pishirsa|35|ld|Kurka kotleti (bug'da) va kartoshka|Паровые котлеты из индейки с картофелем|kotlet
ing: kurka-qiyma:120, piyoz:30, tuxum-xom:25, kartoshka-xom:150, sabzi:50
uz: Qiymaga maydalangan piyoz va tuxum qo'shib, kotlet qiling. / Kartoshka va sabzi bilan bug'da 25 daqiqa pishiring. / Issiq holda bering.
ru: Смешайте фарш с луком и яйцом, слепите котлеты. / Готовьте на пару с картофелем и морковью 25 минут. / Подавайте горячими.

tovuq-ragu|pishirsa|40|ld|Tovuq va sabzavotli ragu|Рагу из курицы с овощами|sabzavot-ragu
ing: tovuq-kokrak:120, kartoshka-xom:120, qovoqcha:100, sabzi:50, pomidor:80, zaytun-yogi:5
uz: Sabzavotni kubik qilib to'g'rang. / Tovuqni 5 daqiqa qovurib, sabzavot va pomidorni qo'shing. / Oz suv bilan 25 daqiqa dimlang.
ru: Нарежьте овощи кубиками. / Обжарьте курицу 5 минут, добавьте овощи и помидор. / Тушите с небольшим количеством воды 25 минут.

loviya-dimlama|pishirsa|30|ld|Loviya va pomidorli dimlama|Фасоль с помидорами|turk-kuru-fasulye
ing: loviya:150, pomidor:150, piyoz:40, tuxum:50:1, zaytun-yogi:5
uz: Piyozni yog'da yumshating, pomidor qo'shing. / Loviya solib, 12 daqiqa dimlang. / Ustiga qaynatilgan tuxum qo'ying.
ru: Обжарьте лук, добавьте помидоры. / Всыпьте фасоль и тушите 12 минут. / Сверху положите варёное яйцо.

noxat-shurva|pishirsa|45|ld|Yengil no'xat sho'rva|Лёгкий суп из нута|noxat-ragu
ing: noxat:120, kartoshka-xom:100, sabzi:40, piyoz:30, pomidor:50, zaytun-yogi:5
uz: Piyoz va sabzini yog'da yumshating. / No'xat, kartoshka, pomidor va suv qo'shing. / 30 daqiqa past olovda qaynating.
ru: Обжарьте лук и морковь. / Добавьте нут, картофель, помидор и воду. / Варите 30 минут на слабом огне.

grechka-qiyma|pishirsa|30|ld|Grechka va qiyma|Гречка с фаршем|qiyma
ing: grechka:150, mol-qiyma:80, piyoz:30, pomidor:60, zaytun-yogi:5
uz: Piyoz va qiymani yog'da 8 daqiqa qovuring. / Pomidor qo'shib, 5 daqiqa dimlang. / Pishgan grechka bilan aralashtiring.
ru: Обжарьте лук и фарш 8 минут. / Добавьте помидор, тушите 5 минут. / Смешайте с готовой гречкой.

tovuq-kartoshka-duxovka|pishirsa|45|ld|Duxovkada tovuq va kartoshka|Курица с картофелем в духовке|tovuq-duxovka
ing: tovuq-kokrak-duxovka:120, kartoshka-xom:200, sabzi:50, zaytun-yogi:5
uz: Kartoshka va sabzini bo'laklarga to'g'rang. / Tovuq bilan qolipga yoyib, yog' va tuz qo'shing. / 200° da 35 daqiqa pishiring.
ru: Нарежьте картофель и морковь. / Выложите с курицей в форму, добавьте масло и соль. / Запекайте при 200° 35 минут.

shakshuka|pishirsa|25|bld|Shakshuka (pomidorli tuxum)|Шакшука|turk-menemen
ing: tuxum-xom:150:3, pomidor:250, qalampir:80, piyoz:40, zaytun-yogi:8
uz: Piyoz va qalampirni yog'da 4 daqiqa yumshating. / Pomidor qo'shib, 8 daqiqa dimlang. / Tuxumni sindirib, qopqoq ostida 6 daqiqa pishiring.
ru: Обжарьте лук и перец 4 минуты. / Добавьте помидоры и тушите 8 минут. / Вбейте яйца и готовьте под крышкой 6 минут.

qovurma-shurva-yengil|pishirsa|40|ld|Yengil qovurma sho'rva|Лёгкий жаркое-суп|shurva-mol
ing: mol-qaynatilgan:100, kartoshka-xom:100, sabzi:50, piyoz:40, pomidor:60, zaytun-yogi:5
uz: Go'sht, piyoz va sabzini yog'da 5 daqiqa qovuring. / Pomidor, kartoshka va suv qo'shing. / 25 daqiqa qaynatib, ko'kat sepin.
ru: Обжарьте мясо, лук и морковь 5 минут. / Добавьте помидор, картофель и воду. / Варите 25 минут, посыпьте зеленью.

baliq-shurva-yengil|pishirsa|30|ld|Yengil baliq sho'rva|Лёгкая уха|baliq-uxa
ing: treska:120, kartoshka-xom:100, sabzi:40, piyoz:30
uz: Kartoshka, sabzi va piyozni suvda 12 daqiqa qaynating. / Baliq bo'laklarini solib, yana 8 daqiqa pishiring. / Tuz va ko'kat qo'shing.
ru: Варите картофель, морковь и лук 12 минут. / Добавьте кусочки рыбы, варите ещё 8 минут. / Посолите и посыпьте зеленью.

tvorogli-zapekanka|pishirsa|35|bs|Tvorogli zapekanka|Творожная запеканка|chizkeyk
ing: tvorog5:200, tuxum-xom:50:1, un:20, banan:60
uz: Tvorog, tuxum, un va ezilgan bananni aralashtiring. / Qolipga solib tekislang. / 180° da 25 daqiqa pishiring.
ru: Смешайте творог, яйцо, муку и размятый банан. / Выложите в форму и разровняйте. / Запекайте при 180° 25 минут.

suli-banan-pishiriq|pishirsa|30|bs|Suli va banan pishirig'i|Овсяная запеканка с бананом|pechenye-suli
ing: suli-xom:60, banan:120, tuxum-xom:50:1, sut:100:::f1
uz: Suli, ezilgan banan, tuxum va sutni aralashtiring. / Qolipga quying. / 180° da 20 daqiqa pishiring.
ru: Смешайте хлопья, размятый банан, яйцо и молоко. / Выложите в форму. / Запекайте при 180° 20 минут.
`;
module.exports = { R };
