/* kalki.uz — KalkiFit: "qiziqarli gaplar" (yengil sarkazmli, do'stona hazillar). DOM'siz, sof funksiyalar (brauzerda window.KalkiFitGaplar, Node'da require()).
 * Matnlar UZ (ЎЗ — shu matnning kirill ko'rinishi, runtime translit) va RU alohida yozilgan. Taqqoslashlar HAQIQIY: masofa — data/masofalar.json (OSRM yo'l masofalari),
 * kaloriya — ovqatlar bazasidagi qiymat. QOIDALAR: vazn/tana haqida hazil yo'q (vazn faqat 7 kunlik o'rtacha bilan, baholamasdan); limitdan oshganda yumshoq amaliy chiqish;
 * 3 kundan ortiq ketma-ket oshsa hazil o'chadi, faqat neytral fakt; bir kunda variant takrorlanmaydi. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KalkiFitGaplar = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var TEXTS = {
"uz": {
"dist_full_day": [
"Bugun {km} km. {route} yurib bordingiz — taksi puli cho'ntakda qoldi.",
"{km} km bugun! {route} piyoda yetib bo'ldi, yo'lkira esa tejaldi.",
"{route} masofa {routeKm} km. Siz bugun {km} km yurdingiz — marshrutka biroz xijolatda.",
"{route} yo'l {routeKm} km, siz bugun {km} km bosdingiz. Navigator sizdan maslahat so'ramoqchi.",
"Bugun {km} km: {route} bemalol yetib, yana ortib qoldi. Oyoq kiyim bugun ishlab topdi.",
"{km} km. Agar yo'l {route} bo'lganda, allaqachon u yerda choy ichib o'tirgan bo'lardingiz.",
"Bugungi qadamlar bilan {route} yetib bordingiz deyish mumkin. Taksichi bugun sizni sog'inadi.",
"{km} km — {route} masofadan uzun. Telefon qadam sanashdan charchab, quvvatlagichga qarab qo'ydi.",
"Bugun {route} yurib borsa bo'ladigan masofa bosib o'tildi: {km} km. Kuryerlar raqobatdan xavotirda.",
"{km} km! {route} yo'lni bugun mashinasiz, faqat qadam bilan yopdingiz."
],
"dist_full_week": [
"Bu hafta {km} km. {route} yurib bordingiz. Taksi puli tejaldi.",
"Haftalik hisob: {km} km. {route} piyoda — avtobus jadvali bu hafta dam oldi.",
"{route} {routeKm} km, sizning haftangiz esa {km} km. Hisob siz tomonda.",
"{km} km bir haftada! {route} yurib borib, ortig'ini sayrga yozsa ham bo'ladi.",
"Bu hafta {km} km: {route} yetib borildi, benzin narxi esa sizni qiziqtirmay qoldi.",
"Hafta yakuni: {km} km. Lift sizni kam ko'rdi, {route} yo'l esa piyoda bosib o'tildi.",
"{route} — {routeKm} km. Siz bir haftada {km} km yurdingiz. Navigator jim qoldi.",
"Bu hafta {km} km. Xaritada {route} chiziq tortilardi va hali joy qolardi.",
"Haftalik {km} km — {route} yurib bordingiz. Yo'lda bir choyxonada dam olishga ham vaqt topilardi.",
"Bu hafta {km} km. Taksi ilovasi siz haqingizda xavotirlanib, chegirma yubormoqchi."
],
"dist_full_month": [
"Bu oy {km} km. {route} yurib bordingiz — bu endi sayr emas, ekspeditsiya.",
"Oylik natija: {km} km. {route} piyoda yetib borsa bo'lardi, poyezd chiptasi tejaldi.",
"{km} km bir oyda! {route} {routeKm} km, siz esa undan ham uzoqqa yetdingiz.",
"Bu oy oyoqlar {km} km bosdi. {route} yo'l oyoq kiyimingizga tanish bo'lib qoldi.",
"Oy yakuni: {km} km. {route} bordingiz, xaritada bayroqcha qo'ysa bo'ladi.",
"{km} km — {route} masofadan ham uzun. Mashina garajda o'zini nafaqadagidek his qilyapti.",
"Bu oy {km} km. {route} yurib borilganda, yo'ldagi har bir choyxona sizni tanib qolardi.",
"Oylik {km} km. Kuryerlar sizga ish taklif qilishdan oldin rezyumeni so'rashmoqda.",
"Bir oyda {km} km: {route} yetib bordingiz. Qadam hisoblagich ham hurmat bilan qaraydi.",
"Bu oy {km} km. Tejalgan yo'lkira hisoblansa, cho'ntak ancha quvonardi."
],
"dist_part": [
"{km} km — {route} yo'lning {pct} foizi. Qolgani ertaga ham joyida turadi.",
"{route} yo'lning {pct} foizi bosib o'tildi. Yo'l qochib ketmaydi, xotirjam.",
"{km} km yurildi: {route} {pct} foiz tayyor. Taksi hali kutib turibdi, lekin umidi kamayyapti.",
"{route} yo'lda {pct} foiz. Navigator shivirlayapti: «choyxona yaqin».",
"{km} km. Xaritada {route} chiziqning {pct} foizi chizildi, xarita sabr bilan kutyapti.",
"{pct} foiz — {route} yo'lning shuncha qismi oyoq ostida qoldi. Qolgani shoshmaydi.",
"{km} km bilan {route} yo'lning {pct} foizini bosdingiz. Marshrutka orqada qoldi... deylik.",
"{route} yo'l {pct} foizga yopildi. Qolgan qismi uchun avtobus emas, ertangi kun bor.",
"{km} km — bu {route} {pct} foiz. Qolgan yo'l ham sizni bemalol kutib o'tiribdi."
],
"burn": [
"Bugungi qadamlaringiz {food} yoqdi. Navbatdagilar hali o'ylanyapti.",
"Qadamlar {kcal} kkal yoqdi, ya'ni {food} hisobdan o'chirdi.",
"{kcal} kkal: qadamlaringiz {food} jimgina hazm qilib qo'ydi.",
"Yurgan yo'lingiz {food} tarixga aylantirdi. {kcal} kkal — halol mehnat.",
"Bugun oyoqlar {food} yoqib yubordi. Bu xabarni {foodNom} hali eshitmagan.",
"{kcal} kkal qadam bilan ketdi — bu {food} yoqishga teng. Lift buni qila olmasdi.",
"Qadamlar hisobi: {food} yoqildi. Muzlatgich bu yangilikni sukut bilan qabul qildi.",
"{kcal} kkal — {food} yoqishga yetadigan yurish. Kuryer ham hayron.",
"Pillapoya va yo'laklar {food} yoqib berdi. {kcal} kkal — kichik g'alaba.",
"Bugungi sayr {food} hisobdan o'chirdi. Choynak buni bayram deb qabul qildi."
],
"within": [
"Bugun limit ichida. Muzlatgich sizga hayrat bilan qarayapti.",
"Limitgacha yana {left} kkal bor. Dasturxon bugun tartibli ishladi.",
"Bugun hisob-kitob silliq: {left} kkal zaxirada. Kalkulyator mamnun.",
"{left} kkal qoldi. Choy bilan biror narsaga hali joy bor — tanlov sizda.",
"Limit ichida! Muzlatgich eshigi bugun kamroq g'ijirladi.",
"Bugungi raqamlar chiroyli: limitgacha {left} kkal. Tarozi emas, jadval xursand.",
"Zaxirada {left} kkal. Kechki choy hech qanday hisobni buzmaydi.",
"Bugun limit bilan bir tilni topdingiz. Yana {left} kkal ehtiyot uchun turibdi.",
"Kun hisoboti: limit ichida, {left} kkal qoldi. Kuryer bugun boshqa manzilga ketdi.",
"Limitgacha {left} kkal. Dasturxon bilan munosabatlar barqaror va ijobiy."
],
"over": [
"Limit bugun {over} kkalga tor kelibdi. Ertaga 30 daqiqalik sayr yoki shunchaki yangi kun — ikkalasi ham ishlaydi.",
"Bugun limit sal tor keldi — {over} kkal. Bir stakan suv, 20 daqiqalik sayr yoki shunchaki uxlab, ertaga davom.",
"+{over} kkal. Dasturxon bugun saxiy chiqdi. Ertaga kechki sayr 40 daqiqa — va hisob yengillashadi.",
"Limitga {over} kkal sig'madi. Ertaga liftsiz bir-ikki qavat yoki shunchaki odatdagi kun — tanlov sizda.",
"Bugungi hisob limitdan {over} kkal nariroqda. Kechki choy va 15 daqiqa sayr — kun yaxshi yakunlanadi.",
"Limit bugun biroz qisqa keldi: +{over} kkal. Ertaga telefonda yurib gaplashish — qadamlar o'zi yig'iladi.",
"Bugun dasturxon limitdan {over} kkal kengroq chiqdi. Ertaga 50 daqiqa sayr yoki shunchaki yangi kun.",
"+{over} kkal. Muzlatgich bugun mehmondo'st edi. Bir stakan suv va yaxshi uyqu — ertaga hammasi yangidan.",
"Limitga {over} kkal joy yetmadi. Ertaga do'konga piyoda borish — ham xarid, ham sayr.",
"{over} kkal limitga sig'madi, hechqisi yo'q. Ertaga bir bekat oldin tushib yurish yoki shunchaki yangi varaq."
],
"over_neutral": [
"So'nggi 3 kunda o'rtacha {avg} kkal yozildi — me'yordan {pct}% yuqori.",
"Oxirgi kunlardagi o'rtacha: {avg} kkal. Bu belgilangan limitdan {pct}% yuqori.",
"Bir necha kun ketma-ket o'rtacha {avg} kkal qayd etildi, limitdan {pct}% yuqori. Limitni sozlamalarda qayta ko'rib chiqish mumkin."
],
"zero_steps": [
"0 qadam. Divan bilan munosabatlar jiddiylashyapti.",
"Bugun 0 qadam. Pult sizni eng yaqin do'sti deb hisoblay boshladi.",
"Qadam hisoblagich bugun dam oldi. Yo telefon divanda, yo ikkalangiz ham.",
"0 qadam. Lift tugmasi ham bugun sizni ko'rmadi — bu allaqachon rekord.",
"Bugun nol. Kuryer sizning o'rningizga yurdi, qadamlar unda qoldi.",
"0 qadam. Telefon kun bo'yi stolda yotgan bo'lsa, bu nol unga tegishli.",
"Qadamlar: 0. Divan bugun uydagi eng mashhur joy.",
"0 qadam. Choynak bilan televizor orasidagi masofa hisobga olinmagani alam qiladi.",
"Bugun nol qadam. Ertaga choynakkacha borib-kelish ham hisobga yoziladi.",
"0 qadam. Taksi ilovasi sizni sevimli mijoz deb atadi."
],
"water_low": [
"Bugun {glasses} stakan suv. Choyni suv deb hisoblash istagi tushunarli, lekin yo'q.",
"{glasses}/{target} stakan. Kofe o'zini suv deb tanishtirdi, ilova ishonmadi.",
"Suv: {glasses} stakan. Sharbat ham suyuqlik, lekin hisob boshqacha ishlaydi.",
"{glasses} stakan suv. Ko'k choy yashil bo'lgani bilan suvga aylanmaydi.",
"Bugun {target} stakandan {glasses} tasi ichildi. Qolgani kranda sizni kutyapti.",
"{glasses} stakan. Grafin stolda turibdi, u ham hisobga tushishni xohlaydi.",
"Suv hisobi: {glasses}/{target}. Choynak g'olib, grafin hali o'yinga kirmadi.",
"{glasses} stakan suv. Qatiq ham ichimlik, lekin suv rolini o'ynay olmaydi.",
"Bugun suv {glasses} stakan. Kompot qanchalik mazali bo'lmasin, u suv emas — afsus.",
"{glasses}/{target}. Suv shishasi xafa: bugun undan ko'ra piyola mashhurroq."
],
"water_ok": [
"{glasses} stakan suv! Grafin bugun bekor turmadi.",
"Suv: {glasses}/{target}. Kran sizga minnatdorchilik bildirmoqchi.",
"{glasses} stakan. Choy bugun suv rolini o'ynashga urinmadi, o'z o'rnini bildi.",
"Bugungi suv rejasi bajarildi: {glasses} stakan. Piyola va stakan tinch-totuv.",
"Reja {target} stakan edi, bugun {glasses}. Grafin faxrlanyapti.",
"Suv yetarli: {glasses} stakan. Kofe bugun ikkinchi rolda.",
"{glasses} stakan. Suv idishi bugun kun qahramoni.",
"Bugun {glasses} stakan suv ichildi. Kran ham, filtr ham ish bilan band bo'ldi.",
"{glasses}/{target} — suv bo'yicha hisobot a'lo. Sharbat va kompot bugun tomoshabin."
],
"weight_down": [
"7 kunlik o'rtacha {delta} kg kamaydi. Grafik pastga qarab, xotirjam ketyapti.",
"Haftalik o'rtacha -{delta} kg. Tarozi emas, trend gapiryapti.",
"O'rtacha ko'rsatkich {delta} kg pasaydi. Chiziq tinch, shoshmasdan.",
"7 kunlik o'rtacha: -{delta} kg. Grafik bugun yengil kayfiyatda.",
"O'rtacha {delta} kg kamaydi. Kunlik sakrashlar emas, haftalik yo'nalish shu.",
"Haftalik o'rtacha {delta} kg pasaydi. Jadval chiroyli egilyapti.",
"-{delta} kg o'rtacha. Grafik pillapoyadan tushayotgandek — liftsiz, bosqichma-bosqich.",
"O'rtacha raqam {delta} kg pasaydi. Choy bilan nishonlasa ham, nishonlamasa ham bo'ladi.",
"7 kunlik o'rtacha {delta} kg kamaydi. Kalkulyator bu xabarni ikki marta tekshirdi — to'g'ri."
],
"weight_up": [
"7 kunlik o'rtacha {delta} kg ko'tarildi. Suv, tuz, uyqu — raqam har narsaga sezgir.",
"O'rtacha +{delta} kg. Bu ko'pincha suv va tuzning ishi; grafik bir haftada fikrini o'zgartirishi mumkin.",
"Haftalik o'rtacha {delta} kg yuqoriroq. Kechki sho'r taom ham, kam uyqu ham raqamda iz qoldiradi.",
"+{delta} kg o'rtacha. Mushak, suv, mavsum — tarozi ularni farqlay olmaydi.",
"O'rtacha {delta} kg ko'tarildi. Grafiklar ham ob-havoga o'xshab, ba'zan to'lqinlanadi.",
"7 kunlik o'rtacha +{delta} kg. Hayot ritmi o'zgarsa, raqam ham bir oz raqsga tushadi.",
"O'rtacha {delta} kg yuqorida. Bitta haftalik to'lqin — hali trend emas.",
"+{delta} kg haftalik o'rtachada. Issiq havo, tuzli non, kam suv — hammasi raqamda iz qoldiradi.",
"O'rtacha {delta} kg o'zgardi. Kalkulyator xotirjam: bunday tebranishlar oddiy hol."
],
"weight_flat": [
"7 kunlik o'rtacha deyarli o'zgarmadi: {delta} kg farq. Barqarorlik ham natija.",
"O'rtacha joyida: {delta} kg. Grafik tekis, xuddi cho'l yo'lidek.",
"{delta} kg farq — haftalik o'rtacha tinch. Tarozi bugun hikoya aytmadi.",
"O'rtacha deyarli bir xil ({delta} kg). Grafik dam olish kunida.",
"Haftalik o'rtacha: ±{delta} kg. Chiziq tekis, xuddi choy ichib o'tirgandek.",
"Barqaror: {delta} kg o'zgarish. Raqam joyidan jilmay, kuzatib turibdi.",
"{delta} kg — bu o'zgarish emas, yumshoq tebranish. O'rtacha joyida.",
"O'rtacha atigi {delta} kg siljidi. Grafik shoshmayapti, siz ham shoshmasangiz bo'ladi.",
"Haftalik o'rtacha o'zgarmas: {delta} kg farq. Statistika uchun bu sokin hafta."
],
"streak": [
"{days} kun ketma-ket! Kalendar sizni hurmat qila boshladi.",
"Ketma-ket {days} kun yozuv. Ilova sizni doimiy mijoz deb tanidi.",
"{days} kun uzluksiz. Hatto choynak ham bunchalik muntazam qaynamaydi.",
"Seriya: {days} kun. Telefon eslatmalari endi o'zini ortiqcha his qilyapti.",
"{days} kun qatorasiga. Bu allaqachon odat, tasodif emas.",
"{days} kunlik zanjir. Har bir halqa — bitta yozilgan kun.",
"Ketma-ket {days} kun! Kuryer ham bunchalik muntazam kelmaydi.",
"{days} kun ketma-ket. Kalkulyatorning sevimli foydalanuvchisi aniqlandi.",
"Yozuvlar zanjiri: {days} kun. Ertangi kun ham shu ro'yxatga qo'shilishni kutyapti.",
"{days} kun! Bunday barqarorlikka obuna xizmatlari ham havas qiladi."
],
"holiday": [
"Bugun bayram — hisob-kitob ham dam oladi. Dasturxon esa ishda.",
"Osh, somsa, mehmon... Kalkulyator bugun burchakda jim o'tiribdi.",
"Bayram kuni raqamlar emas, mehmonlar sanaladi.",
"Bugun dasturxon kalkulyatordan kattaroq. Bu normal, bu bayram.",
"To'y yoki bayram — sanash bugun ikkinchi o'rinda. Ertaga hammasi odatdagidek.",
"Mehmondorchilik kuni: choynak navbatchilikda, hisob-kitob ta'tilda.",
"Bugun asosiy ilova — osh qozoni. Biz ertaga qaytamiz.",
"Bayram muborak! Bugungi asosiy mashq — mehmonlarni kutib olish va kuzatish.",
"Bugun qadamlar ham bayramda: mehmondan mehmonga, uydan uyga.",
"Bayram dasturxoni hech qaysi jadvalga sig'maydi. Bugun shunchaki yaxshi kun."
],
"yesam_ok": [
"{item} — {kcal} kkal. Limitga bemalol sig'adi, keyin ham {left} kkal qoladi.",
"{item} bugungi rejaga sig'adi. Muzlatgich ruxsat berdi, kalkulyator ham qarshi emas.",
"{kcal} kkal — limit ichida. Choy bilan birga ham {left} kkal zaxirada qoladi.",
"{item} bilan ham limitgacha {left} kkal qoladi. Qaror sizda, kalkulyator faqat kuzatyapti.",
"Hisob tinch: {item} = {kcal} kkal, qoldiq {left} kkal. Dasturxon yashil chiroq yoqdi.",
"{item}? Sig'adi. Bu taxminan {min} daqiqalik sayrga teng, lekin bugun bu shunchaki ma'lumot.",
"Kalkulyator o'ylab, bosh irg'adi: {item} limitga sig'adi, {left} kkal ortib qoladi.",
"{item} — {kcal} kkal. Limit buni bemalol ko'taradi, choynak ham rozi.",
"Shu taom bilan limitgacha yana {left} kkal qoladi. Muzlatgich eshigi do'stona g'ijirladi.",
"{kcal} kkal limitga sig'adi. Yoqimli ishtaha — keyin ham {left} kkal ehtiyot uchun turadi."
],
"yesam_over": [
"{item} limitga {over} kkal sig'maydi. Yarmi hozir, qolgani ertaga — yoki shunchaki bugun bayram.",
"{item} — {kcal} kkal, limit {over} kkalga tor keladi. {min} daqiqalik sayr bilan muvozanatlanadi.",
"Limitga {over} kkal joy yetmaydi. Kichikroq porsiya yoki kechki {min} daqiqa sayr — ikkalasi ham ishlaydi.",
"Kalkulyator biroz o'ylanib qoldi: +{over} kkal. Choy bilan yarim porsiya — o'rtacha yo'l.",
"{item} bugungi limitdan {over} kkal nariroqda. Ertangi nonushtaga qoldirsa ham bo'ladi.",
"Hisob: {kcal} kkal, limitga {over} kkal sig'maydi. {min} daqiqa piyoda yurish uni tenglashtiradi.",
"Muzlatgich ikkilanyapti: {item} limitni {over} kkalga siljitadi. Ertaga saqlab qo'yish ham variant.",
"+{over} kkal limitdan tashqarida. Do'stlar bilan bo'lishilsa, taom ham, limit ham xursand.",
"{item} uchun limitda {over} kkal joy yetmaydi. Bugun bayramona kun bo'lsa — mayli, ertaga {min} daqiqa sayr.",
"Limit bugun {item} uchun sal tor: +{over} kkal. Bir stakan suv va {min} daqiqalik sayr — muvozanat tiklanadi."
]
},
"ru": {
"dist_full_day": [
"Сегодня {km} км. Можно было дойти {route} пешком — такси осталось без заказа.",
"{km} км за день. Это больше, чем путь {route}, — навигатор в лёгком шоке.",
"Сегодня вы прошли {km} км, а путь {route} всего {routeKm} км. Маршрутка нервно курит в сторонке.",
"{km} км! Дорога {route} пешком — и ещё осталось на прогулку до ларька.",
"Сегодняшние {km} км с запасом покрывают путь {route}. Кроссовки отработали смену.",
"{km} км. Если бы шли {route}, уже пили бы там чай.",
"За день {km} км — дорога {route} пройдена с горкой. Таксист сегодня скучает.",
"{km} км сегодня. Телефон устал считать шаги и косится на зарядку.",
"Путь {route} — {routeKm} км. Ваши {km} км сегодня его обогнали. Курьеры напряглись.",
"{km} км. Бензин сегодня сэкономлен, а путь {route} пройден с запасом."
],
"dist_full_week": [
"За неделю {km} км. Это как дойти {route}. Деньги на такси остались в кармане.",
"Неделя: {km} км. Путь {route} пройден, автобус проехал мимо без вас — и ладно.",
"Расстояние {route} — {routeKm} км, а у вас за неделю {km} км. Счёт в вашу пользу.",
"Итоги недели: {km} км. Хватило бы дойти {route} и ещё заглянуть на базар.",
"{km} км за неделю! Лифт вас почти не видел, зато дорога {route} пройдена.",
"Неделя в цифрах: {km} км. На карте это линия {route} — и ещё немного сверху.",
"За неделю {km} км. Цены на бензин вас больше не волнуют — по крайней мере, на маршруте {route}.",
"{km} км за семь дней. Приложение такси прислало грустный смайлик.",
"Неделя: {km} км. Путь {route} пройден пешком — навигатор молча записал рекорд.",
"{km} км за неделю — это дорога {route} с запасом. Кроссовки просят выходной."
],
"dist_full_month": [
"За месяц {km} км. Это уже не прогулка, а экспедиция: дошли бы {route}.",
"Месяц: {km} км. Путь {route} пройден, билет на поезд остался в кассе.",
"{km} км за месяц! Дорога {route} — {routeKm} км, а вы ушли дальше.",
"Итог месяца: {km} км. Машина в гараже чувствует себя пенсионером.",
"За месяц {km} км — хватит, чтобы дойти {route}. Кроссовки уже знают дорогу.",
"{km} км за месяц. По пути {route} вас бы узнавали в каждой чайхане.",
"Месяц пешком: {km} км. Курьеры интересуются, не ищете ли вы работу.",
"{km} км за месяц. Маршрут {route} пройден — на карте можно ставить флажок.",
"Месячный счёт: {km} км. Шагомер в телефоне смотрит с уважением.",
"За месяц {km} км. Если посчитать несостоявшиеся поездки на такси, кошелёк ликует."
],
"dist_part": [
"{km} км — это {pct}% пути {route}. Остальное никуда не денется.",
"Пройдено {pct}% дороги {route}. Дорога терпеливая, подождёт.",
"{km} км: {pct}% маршрута {route} позади. Такси всё ещё ждёт, но уже без надежды.",
"{pct}% пути {route}. Навигатор шепчет: «чайхана уже близко».",
"{km} км — на карте {route} закрашено {pct}%. Карта довольна.",
"Уже {pct}% маршрута {route}. Отличный повод для привала с чаем.",
"{km} км, то есть {pct}% пути {route}. Маршрутка где-то позади… допустим.",
"Пройдено {km} км — {pct}% дороги {route}. Оставшаяся часть подождёт до завтра.",
"{pct}% пути {route} пройдено. Кроссовки уже прикидывают остаток."
],
"burn": [
"Сегодняшние шаги сожгли {food}. Следующие пока размышляют.",
"Шаги сожгли {kcal} ккал — по сути, {food}.",
"Прогулка аннулировала {food}. {kcal} ккал — честная работа.",
"Ноги сегодня отработали {food}. Холодильник принял новость молча.",
"{kcal} ккал сожжено. По калориям это {food} — лифт так не умеет.",
"Шаги сегодня тихо переварили {food}. Калькулятор одобрительно кивает.",
"Лестницы и тротуары сожгли {food}. {kcal} ккал — маленькая победа.",
"{kcal} ккал за день. Где-то на кухне {foodNom} нервно оглядывается.",
"Ваши шаги сожгли {food} — курьер бы так быстро даже не довёз.",
"Сегодняшняя прогулка списала {food}. Чайник считает, что это стоит отметить."
],
"within": [
"Сегодня в пределах лимита. Холодильник смотрит на вас с уважением.",
"До лимита ещё {left} ккал. Стол сегодня вёл себя прилично.",
"Всё по плану: в запасе {left} ккал. Калькулятор доволен.",
"Осталось {left} ккал. Место для чая с чем-нибудь ещё есть — выбор за вами.",
"В рамках лимита! Дверца холодильника сегодня скрипела реже обычного.",
"Цифры красивые: до лимита {left} ккал. Радуется таблица, а не весы.",
"В запасе {left} ккал. Вечерний чай ничего не испортит.",
"Лимит и день нашли общий язык. Ещё {left} ккал на всякий случай.",
"Отчёт дня: всё в лимите, остаток {left} ккал. Курьер сегодня поехал по другому адресу.",
"До лимита {left} ккал. С дастарханом отношения стабильные."
],
"over": [
"Лимит сегодня оказался тесноват на {over} ккал. Завтра 30 минут прогулки или просто новый день — оба варианта рабочие.",
"+{over} ккал. Стакан воды, 20 минут прогулки — или просто выспаться, а завтра — новый день.",
"Лимит сегодня узковат на {over} ккал. Завтра можно выйти на остановку раньше — и прогулка готова.",
"В лимит не поместилось {over} ккал. Завтра пара этажей без лифта или просто обычный день — как удобнее.",
"Сегодня {over} ккал за рамками лимита. Вечерний чай и 15 минут прогулки — и день закончится хорошо.",
"Холодильник сегодня был гостеприимен: +{over} ккал. Стакан воды, хороший сон — и завтра с чистого листа.",
"Лимит чуть коротковат: +{over} ккал. Завтра телефонный разговор на ходу — шаги наберутся сами.",
"Дастархан сегодня вышел на {over} ккал шире лимита. Завтра 50 минут прогулки или просто новый день.",
"+{over} ккал к лимиту. Завтра в магазин пешком — и покупки, и прогулка.",
"Лимит сегодня не вместил {over} ккал. Ничего страшного: прогулка вечером или просто утро вечера мудренее."
],
"over_neutral": [
"За последние 3 дня в среднем записано {avg} ккал — на {pct}% выше нормы.",
"Среднее за последние дни: {avg} ккал. Это на {pct}% выше установленного лимита.",
"Несколько дней подряд в среднем {avg} ккал, выше лимита на {pct}%. Лимит можно пересмотреть в настройках."
],
"zero_steps": [
"0 шагов. Отношения с диваном становятся серьёзными.",
"Сегодня 0 шагов. Пульт уже считает вас лучшим другом.",
"Шагомер сегодня отдыхал. Либо телефон лежал на диване, либо вы оба.",
"0 шагов. Даже кнопка лифта вас сегодня не видела — это уже рекорд.",
"Ноль. Курьер прошёл ваши шаги за вас и унёс их с собой.",
"0 шагов. Если телефон весь день лежал на столе — этот ноль на его совести.",
"Шагов: 0. Диван сегодня — самое посещаемое место в квартире.",
"0 шагов. Расстояние от чайника до телевизора, увы, не засчитывается.",
"Сегодня ноль. Завтра даже поход до чайника попадёт в статистику.",
"0 шагов. Приложение такси присвоило вам статус любимого клиента."
],
"water_low": [
"Воды сегодня {glasses} из {target} стаканов. Желание засчитать чай как воду понятно, но нет.",
"{glasses}/{target}. Кофе представился водой, приложение не поверило.",
"Вода: {glasses} из {target}. Сок, конечно, тоже жидкость, но счёт работает иначе.",
"{glasses} из {target} стаканов. Зелёный чай зелёный, но водой от этого не становится.",
"Выпито {glasses} из {target}. Остальное ждёт в кране и не обижается.",
"Вода: {glasses}/{target}. Графин на столе тоже хотел бы попасть в статистику.",
"Счёт по воде: {glasses}/{target}. Чайник лидирует, графин ещё не вышел на поле.",
"{glasses} из {target}. Айран — напиток достойный, но роль воды ему не дали.",
"Воды {glasses} из {target}. Компот, каким бы вкусным он ни был, — не вода. Увы.",
"{glasses}/{target}. Бутылка с водой обижена: пиала сегодня популярнее."
],
"water_ok": [
"Вода: {glasses} из {target}. Графин сегодня не простаивал.",
"{glasses}/{target}. Кран хочет сказать спасибо.",
"По воде {glasses} из {target}. Чай сегодня не пытался выдать себя за воду.",
"План по воде выполнен: {glasses}/{target}. Пиала и стакан живут мирно.",
"Цель была {target}, вышло {glasses}. Графин гордится.",
"Воды достаточно: {glasses} из {target}. Кофе сегодня на второстепенной роли.",
"{glasses}/{target}. Бутылка с водой — герой дня.",
"Вода: {glasses} из {target}. Фильтр работал без перерыва на обед.",
"{glasses} из {target} — отчёт по воде на отлично. Сок и компот сегодня в зрителях."
],
"weight_down": [
"Среднее за 7 дней снизилось на {delta} кг. График спокойно идёт вниз.",
"Недельное среднее: -{delta} кг. Говорят не весы, а тренд.",
"Средний показатель опустился на {delta} кг. Линия ровная, без спешки.",
"7-дневное среднее: -{delta} кг. У графика сегодня лёгкое настроение.",
"Среднее снизилось на {delta} кг. Не дневные скачки, а направление недели.",
"-{delta} кг в среднем за неделю. График спускается по лестнице — без лифта, ступенька за ступенькой.",
"Среднее меньше на {delta} кг. Калькулятор перепроверил дважды — всё верно.",
"Среднее за неделю: минус {delta} кг. Можно отметить чаем, а можно и без него.",
"Тренд за 7 дней: -{delta} кг. Таблица выглядит аккуратно."
],
"weight_up": [
"Среднее за 7 дней выросло на {delta} кг. Вода, соль, сон — цифра чувствительна ко всему.",
"Недельное среднее +{delta} кг. Часто это вода и соль; через неделю график может передумать.",
"Среднее выше на {delta} кг. Солёный ужин и короткий сон тоже оставляют след в цифрах.",
"+{delta} кг в среднем. Мышцы, вода, сезон — весы их не различают.",
"Среднее поднялось на {delta} кг. Графики, как и погода, бывают волнистыми.",
"7-дневное среднее: +{delta} кг. Меняется ритм жизни — цифра немного пританцовывает.",
"Среднее выше на {delta} кг. Одна недельная волна — ещё не тренд.",
"+{delta} кг в недельном среднем. Жара, солёный хлеб, мало воды — всё отражается в цифрах.",
"Среднее сдвинулось на {delta} кг. Калькулятор спокоен: такие колебания — обычное дело."
],
"weight_flat": [
"Среднее за 7 дней почти не изменилось: разница {delta} кг. Стабильность — тоже результат.",
"Среднее на месте: {delta} кг. График ровный, как степная трасса.",
"Разница {delta} кг — недельное среднее спокойно. Весы сегодня без сюжета.",
"Среднее почти то же ({delta} кг). У графика выходной.",
"Недельное среднее: ±{delta} кг. Линия ровная, будто сидит и пьёт чай.",
"Стабильно: изменение {delta} кг. Цифра никуда не спешит, просто наблюдает.",
"{delta} кг — это не изменение, а лёгкое колебание. Среднее на месте.",
"Среднее сдвинулось всего на {delta} кг. График не торопится — и вам можно не торопиться.",
"Недельное среднее без перемен: {delta} кг. Для статистики — тихая неделя."
],
"streak": [
"Дней подряд: {days}. Календарь начал вас уважать.",
"Серия без пропусков: {days}. Приложение записало вас в постоянные клиенты.",
"Дней подряд: {days}. Даже чайник не закипает так регулярно.",
"Серия — {days}. Напоминания в телефоне чувствуют себя лишними.",
"Уже {days} подряд. Это привычка, а не случайность.",
"Цепочка из дней: {days}. Каждое звено — один записанный день.",
"Серия: {days}! Курьер и тот приезжает реже.",
"Дней без пропуска: {days}. Любимый пользователь калькулятора найден.",
"Счётчик серии: {days}. Завтрашний день уже стоит в очереди.",
"Серия {days}. Такой стабильности позавидуют подписки на сериалы."
],
"holiday": [
"Сегодня праздник — подсчёты тоже отдыхают. А дастархан работает.",
"Плов, самса, гости… Калькулятор сегодня тихо сидит в уголке.",
"В праздник считают гостей, а не калории.",
"Сегодня дастархан больше калькулятора. Это нормально, это праздник.",
"Свадьба или праздник — подсчёты сегодня на втором плане. Завтра всё как обычно.",
"День гостей: чайник на смене, подсчёты в отпуске.",
"Сегодня главное приложение — казан с пловом. Мы вернёмся завтра.",
"С праздником! Главная тренировка дня — встретить и проводить гостей.",
"Сегодня и шаги праздничные: из гостей в гости, от дома к дому.",
"Праздничный дастархан не помещается ни в одну таблицу. Сегодня просто хороший день."
],
"yesam_ok": [
"{item} — {kcal} ккал. В лимит помещается, и ещё {left} ккал останется.",
"{item} вписывается в план дня. Холодильник не возражает, калькулятор тоже.",
"{kcal} ккал — в рамках лимита. Даже с чаем в запасе останется {left} ккал.",
"Вариант «{item}»: до лимита останется {left} ккал. Решение за вами, калькулятор просто смотрит.",
"Счёт спокойный: {item} = {kcal} ккал, остаток {left} ккал. Дастархан даёт зелёный свет.",
"{item}? Помещается. Это примерно {min} минут прогулки, но сегодня это просто справка.",
"Калькулятор подумал и кивнул: {item} в лимит влезает, останется {left} ккал.",
"{item} — {kcal} ккал. Лимит выдержит, чайник тоже одобряет.",
"С этим блюдом до лимита останется {left} ккал. Дверца холодильника скрипнула дружелюбно.",
"{kcal} ккал помещаются в лимит. Приятного аппетита — и ещё {left} ккал в запасе."
],
"yesam_over": [
"{item} не помещается в лимит на {over} ккал. Половину сейчас, остальное завтра — или просто сегодня праздник.",
"{item} — {kcal} ккал, лимит тесноват на {over} ккал. {min} минут прогулки всё уравновесят.",
"В лимит не влезают {over} ккал. Порция поменьше или вечерние {min} минут пешком — оба варианта рабочие.",
"Калькулятор слегка задумался: +{over} ккал. Половина порции с чаем — золотая середина.",
"{item} выходит за лимит на {over} ккал. Можно оставить на завтрашний завтрак.",
"Счёт: {kcal} ккал, за лимитом {over} ккал. {min} минут пешком это выравнивают.",
"Холодильник колеблется: {item} сдвигает лимит на {over} ккал. Отложить на завтра — тоже вариант.",
"+{over} ккал за рамками лимита. Если поделиться с друзьями, рады будут все — и лимит тоже.",
"Для «{item}» в лимите не хватает {over} ккал. Если день праздничный — пусть, а завтра {min} минут прогулки.",
"Лимит сегодня узковат для «{item}»: +{over} ккал. Стакан воды и {min} минут прогулки — баланс на месте."
]
}
};

  /* ---------- taqiqlangan so'zlar (test shu ro'yxat bo'yicha barcha gaplarni tekshiradi) ---------- */
  var BANNED = ['semiz', "ozg'in", 'ozgin', "yog' bosgan", 'yog bosgan', "to'lag", 'tolag', 'kilo', 'yana yedingiz', 'yeb qo\'yding', 'yeb qoyding', "tuta olmadingiz", 'uyat', 'aybdor', 'ayb ', 'dangasa', 'majbursiz', 'kerak', 'shart', 'jazo',
    'толст', 'жирн', 'тощ', 'худ', 'опять поел', 'снова поел', 'виноват', 'стыд', 'надо', 'должн', 'обязан', 'лентяй', 'срыв', 'наказан'];

  /* ---------- sana, bayramlar ---------- */
  var FIXED = { '01-01': 1, '01-14': 1, '03-08': 1, '03-21': 1, '05-09': 1, '09-01': 1, '10-01': 1, '12-08': 1, '12-31': 1 };
  var HAYIT = { '2026': ['2026-03-20', '2026-05-27'], '2027': ['2027-03-09', '2027-05-16'], '2028': ['2028-02-26', '2028-05-05'], '2029': ['2029-02-14', '2029-04-24'] };   // Ro'za va Qurbon hayit (taxminiy; 3 kun)
  function addDay(iso, n, D) { return D.addDays(iso, n); }
  function isHoliday(date, D) {
    if (FIXED[date.slice(5)]) return true;
    var h = HAYIT[date.slice(0, 4)] || [];
    for (var i = 0; i < h.length; i++) for (var k = 0; k < 3; k++) if (addDay(h[i], k, D) === date) return true;
    return false;
  }

  /* ---------- masofalar (data/masofalar.json: { nodes:[{id,uz,ru,ruGen,region}], upper:[[…]] }) ---------- */
  function kmBetween(M, a, b) {
    var ia = -1, ib = -1, i; for (i = 0; i < M.nodes.length; i++) { if (M.nodes[i].id === a) ia = i; if (M.nodes[i].id === b) ib = i; }
    if (ia < 0 || ib < 0 || ia === ib) return null; var lo = Math.min(ia, ib), hi = Math.max(ia, ib); return M.upper[lo][hi - lo - 1];
  }
  function nodeOf(M, id) { for (var i = 0; i < M.nodes.length; i++) if (M.nodes[i].id === id) return M.nodes[i]; return null; }
  function routeFor(M, city, km) {                 // shahardan chiqadigan eng yaqin mos marshrut: full (km ≥ masofa) yoki part (km < eng yaqin masofa)
    var from = nodeOf(M, city) || nodeOf(M, 'toshkent'), opts = [];
    M.nodes.forEach(function (n) { if (n.id !== from.id) { var d = kmBetween(M, from.id, n.id); if (d) opts.push({ to: n, km: d }); } });
    opts.sort(function (a, b) { return a.km - b.km; });
    var best = null; opts.forEach(function (o) { if (o.km <= km) best = o; });
    if (best) return { type: 'full', from: from, to: best.to, km: best.km, pct: 100 };
    var near = opts[0]; return { type: 'part', from: from, to: near.to, km: near.km, pct: Math.max(1, Math.round(km / near.km * 100)) };
  }
  function routePhrase(r, lang) { return lang === 'ru' ? 'от ' + r.from.ruGen + ' до ' + r.to.ruGen : r.from.uz + 'dan ' + r.to.uz + 'gacha'; }

  /* ---------- kaloriya taqqoslash: qadamlar yoqqan kkal ≈ bazadagi ovqat ---------- */
  var BURN = [
    { id: 'shokolad-sut', unit: 'bolak', uz: ["shokolad bo'lagini", "shokolad bo'lagi"], ru: { g: 'f', one: 'дольку шоколада', few: 'дольки шоколада', many: 'долек шоколада', nom: 'шоколад' } },
    { id: 'banan', unit: 'dona', uz: ['bananni', 'banan'], ru: { g: 'm', one: 'банан', few: 'банана', many: 'бананов', nom: 'банан' } },
    { id: 'non', unit: 'bolak', uz: ["non bo'lagini", "non bo'lagi"], ru: { g: 'm', one: 'кусок лепёшки', few: 'куска лепёшки', many: 'кусков лепёшки', nom: 'лепёшка' } },
    { id: 'kola', unit: 'stakan', uz: ['stakan kolani', 'kola'], ru: { g: 'm', one: 'стакан колы', few: 'стакана колы', many: 'стаканов колы', nom: 'кола' } },
    { id: 'somsa', unit: 'dona', uz: ['somsani', 'somsa'], ru: { g: 'f', one: 'самсу', few: 'самсы', many: 'самс', nom: 'самса' } },
    { id: 'burger', unit: 'dona', uz: ['burgerni', 'burger'], ru: { g: 'm', one: 'бургер', few: 'бургера', many: 'бургеров', nom: 'бургер' } },
    { id: 'osh', unit: 'likop', uz: ['likop oshni', 'osh'], ru: { g: 'f', one: 'тарелку плова', few: 'тарелки плова', many: 'тарелок плова', nom: 'плов' } }
  ];
  function burnFood(kcal, foods, S, lang) {        // { food: "bitta somsani" | "одну самсу", foodNom, n, unitKcal, id } yoki null
    var map = {}; (foods || []).forEach(function (f) { map[f.id] = f; });
    var items = BURN.map(function (b) { var f = map[b.id]; if (!f) return null; var g = S.unitGrams(f, b.unit); return g ? { b: b, k: Math.round(f.k * g / 100) } : null; }).filter(Boolean).sort(function (a, c) { return a.k - c.k; });
    var pick = null; items.forEach(function (it) { if (it.k <= kcal && Math.floor(kcal / it.k) <= 9) pick = it; }); if (!pick) items.forEach(function (it) { if (!pick && it.k <= kcal) pick = it; });
    if (!pick) return null; var n = Math.max(1, Math.min(9, Math.floor(kcal / pick.k)));
    if (lang === 'ru') { var r = pick.b.ru, w = n % 10 === 1 && n % 100 !== 11 ? 'one' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'few' : 'many'); var one = r.g === 'f' ? 'одну ' : 'один '; return { food: (n === 1 ? one + r.one : n + ' ' + r[w]), foodNom: r.nom, n: n, unitKcal: pick.k, id: pick.b.id }; }
    return { food: (n === 1 ? 'bitta ' : n + ' ta ') + pick.b.uz[0], foodNom: pick.b.uz[1], n: n, unitKcal: pick.k, id: pick.b.id };
  }

  /* ---------- tanlash: bir kunda takrorlanmaydi, qayta chizilganda barqaror ---------- */
  function fill(tpl, p) { return String(tpl).replace(/\{(\w+)\}/g, function (m, k) { return p && p[k] != null ? p[k] : ''; }).replace(/\s+([.,!?])/g, '$1').replace(/\s{2,}/g, ' ').trim(); }
  function jk(st, day) { var p = st.prefs || (st.prefs = {}); if (!p.jk || p.jk.d !== day) p.jk = { d: day, used: {}, cur: null }; return p.jk; }
  function pickLine(ctx, state, params, key) {
    var list = (TEXTS[ctx.lang] || TEXTS.uz)[state]; if (!list || !list.length) return null;
    var j = jk(ctx.st, ctx.today); key = key || state;
    if (j.cur && j.cur.key === key && j.cur.state === state && list[j.cur.idx] != null) return { state: state, text: fill(list[j.cur.idx], params) };
    var used = j.used[state] || (j.used[state] = []), avail = []; for (var i = 0; i < list.length; i++) if (used.indexOf(i) < 0) avail.push(i);
    if (!avail.length) { used.length = 0; for (i = 0; i < list.length; i++) avail.push(i); }
    var idx = avail[Math.floor((ctx.rng ? ctx.rng() : Math.random()) * avail.length)]; used.push(idx); j.cur = { key: key, state: state, idx: idx };
    return { state: state, text: fill(list[idx], params) };
  }
  function pickTexts(lang, state) { return (TEXTS[lang] || TEXTS.uz)[state] || []; }

  /* ---------- vaziyatlar ---------- */
  function fmtKm(km) { return String(Math.round(km * 10) / 10).replace('.', ','); }
  function dayStats(ctx, d) { var S = ctx.S, st = ctx.st; return S.dayStatus(st, d); }
  function todayLine(ctx) {                        // Bugun ekrani uchun BITTA gap yoki null (hazil o'chirilgan bo'lsa — null)
    if (ctx.jokesOn === false) return null;
    var S = ctx.S, st = ctx.st, t = ctx.today, x = S.dayOf(st, t) || { food: [], water: 0, steps: 0 }, pl = S.plan(st.profile), eaten = S.sumEntries(x.food).kcal, lim = S.dayLimit(st, t), D = S.dates, hour = ctx.hour == null ? 12 : ctx.hour;
    if (isHoliday(t, D) || x.party) return pickLine(ctx, 'holiday', {}, 'holiday');
    var run = 0, d = t, sum = 0; while (run < 7) { var r = dayStats(ctx, d); if (r.state === 'none' || r.eaten <= r.limit) break; run++; sum += r.eaten; sum += 0; d = D.addDays(d, -1); }
    if (run >= 3) { var avg = Math.round(sum / run), lsum = 0, dd = t; for (var i = 0; i < run; i++) { lsum += dayStats(ctx, dd).limit; dd = D.addDays(dd, -1); } return pickLine(ctx, 'over_neutral', { avg: avg, pct: Math.round((sum / lsum - 1) * 100) }, 'over_neutral'); }
    if (eaten > lim) return pickLine(ctx, 'over', { over: eaten - lim }, 'over');
    var fresh = st.created && (Date.now() - st.created) < 24 * 3600 * 1000;      // yangi foydalanuvchining birinchi kunida «qadam 0» hazili yo'q
    if (!x.steps && hour >= 13 && !fresh) return pickLine(ctx, 'zero_steps', {}, 'zero_steps');
    var target = pl.water.glasses; if (x.water >= target) return pickLine(ctx, 'water_ok', { glasses: x.water, target: target }, 'water_ok'); if (hour >= 15 && x.water <= target * 0.4) return pickLine(ctx, 'water_low', { glasses: x.water, target: target }, 'water_low');
    if (eaten > 0 && eaten <= lim && hour >= 18) return pickLine(ctx, 'within', { left: lim - eaten }, 'within');
    if (x.steps >= 2000) {
      var h = Number(st.profile.height), w = S.currentWeight(st), km = S.distanceKm(x.steps, h), kc = S.stepKcal(x.steps, h, w), dom = Number(t.slice(8));
      var bf = ctx.foods ? burnFood(kc, ctx.foods, S, ctx.lang) : null, rt = ctx.masofa ? routeFor(ctx.masofa, ctx.city, km) : null;
      if (bf && (dom % 2 === 1 || !rt)) return pickLine(ctx, 'burn', { kcal: kc, food: bf.food, foodNom: bf.foodNom }, 'burn|' + bf.id);
      if (rt) return pickLine(ctx, rt.type === 'full' ? 'dist_full_day' : 'dist_part', { km: fmtKm(km), route: routePhrase(rt, ctx.lang), routeKm: rt.km, pct: rt.pct }, 'day|' + rt.to.id);
    }
    var sk = S.streak(st, t); if (sk >= 3) return pickLine(ctx, 'streak', { days: sk }, 'streak');
    return null;
  }
  function distLines(ctx) {                        // Qadam ekrani: oxirgi 7 kun va shu oy uchun masofa gaplari
    if (ctx.jokesOn === false || !ctx.masofa) return { week: null, month: null };
    var S = ctx.S, st = ctx.st, t = ctx.today, D = S.dates, week = S.stepsTotal(st, S.stepsSeries(st, t, 7)), mon = S.monthSteps(st, D.monthOf(t)), out = { week: null, month: null };
    [['week', week, 'dist_full_week'], ['month', mon, 'dist_full_month']].forEach(function (a) {
      var km = a[1].km; if (!(km >= 1)) return; var rt = routeFor(ctx.masofa, ctx.city, km);
      out[a[0]] = pickLine(ctx, rt.type === 'full' ? a[2] : 'dist_part', { km: fmtKm(km), route: routePhrase(rt, ctx.lang), routeKm: rt.km, pct: rt.pct }, a[0] + '|' + rt.to.id);
    });
    return out;
  }
  function weightLine(ctx) {                       // Faqat 7 kunlik O'RTACHA (joriy va oldingi 7 kun); baholamasdan
    if (ctx.jokesOn === false) return null; var S = ctx.S, st = ctx.st, t = ctx.today, D = S.dates;
    var a = S.avg7(st.weights, t), b = S.avg7(st.weights, D.addDays(t, -7)); if (a == null || b == null) return null;
    var dl = Math.round((a - b) * 10) / 10, abs = String(Math.abs(dl)).replace('.', ',');
    return pickLine(ctx, dl <= -0.2 ? 'weight_down' : (dl >= 0.2 ? 'weight_up' : 'weight_flat'), { delta: abs }, 'weight|' + (dl <= -0.2 ? 'd' : dl >= 0.2 ? 'u' : 'f'));
  }
  function streakLine(ctx) { if (ctx.jokesOn === false) return null; var n = ctx.S.streak(ctx.st, ctx.today); return n >= 3 ? pickLine(ctx, 'streak', { days: n }, 'streak2') : null; }

  return { TEXTS: TEXTS, BANNED: BANNED, FIXED: FIXED, isHoliday: isHoliday, kmBetween: kmBetween, nodeOf: nodeOf, routeFor: routeFor, routePhrase: routePhrase, burnFood: burnFood, fill: fill, pickLine: pickLine, pickTexts: pickTexts,
    todayLine: todayLine, distLines: distLines, weightLine: weightLine, streakLine: streakLine, fmtKm: fmtKm };
});
