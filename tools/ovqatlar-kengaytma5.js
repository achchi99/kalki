/* kalki.uz — v67 (2026-10-30): O'zbekistondagi FAST-FOOD TARMOQLARI menyusi (foydalanuvchi fikri: «Evos'dan qo'shsam ham mos taom yo'q»)
 * va muzqaymoq TURLARI (eskimo, stakancha, rojok, sendvich, vafli briket).
 * QOIDA (foydalanuvchi o'zgartirdi): tarmoq nomi ishlatiladi, LEKIN har yozuvda aniq belgi — «taxminiy — tarmoq rasmiy qiymat e'lon qilmagan» (kartada va Manba varag'ida; build: 8-ustun `tm`).
 *   Hech bir tarmoq kkal/BJU e'lon qilmaydi (tekshirildi: evos.uz, maxway.uz, oqtepalavash.uz, feedup.uz, lesailes.uz, choparpizza.uz, Wolt va Yandex menyulari; bellissimo.uz, kfc.com.uz — 403).
 *   Qiymat = USDA FDC SR Legacy komponentlari (m:) menyudagi TARKIB bo'yicha; og'irlik — menyudan (faqat Feed Up e'lon qiladi; KFC bayts — kombo tavsifidan),
 *   e'lon qilinmagan bo'lsa — shu turdagi o'rtacha porsiya (izohda aytiladi). Yarim porsiya — porsiya oynasidagi «Yarim».
 * Qator: id | nom (UZ) | nom (RU) | sinonimlar | tur | porsiyalar | manba | tarmoq | og'irlik/tarkib izohi (UZ) | (RU). Ikonka — id dagi tur (tm-<tarmoq>-<tur>-…), kalkifit-app.js TM_ICO. */
'use strict';
/* tarkiblar (taxminiy, menyudagi masalliqlar ro'yxati bo'yicha; g — bitta odatiy porsiya ichidagi ulush, natija 100 g ga keltiriladi) */
const TORT = 'u:167535', MOL = 'u:169440', TOV = 'u:171477', POM = 'u:170457', BOD = 'u:168409', PIY = 'u:170000', CHIPS = 'u:169677', KETCH = 'u:168556', MAY = 'u:171009', CHED = 'u:173414', BULO = 'u:172796', SOS = 'u:174614', TUZB = 'u:168558', AYS = 'u:169248', KARAM = 'u:169977';
const mix = (...p) => 'm:' + p.map(([t, g]) => t + '*' + g).join('+');
const R = {
  lavMol: mix([TORT, 70], [MOL, 100], [POM, 40], [CHIPS, 25], [KETCH, 20], [MAY, 20], [PIY, 10]),
  lavMolP: mix([TORT, 70], [MOL, 100], [POM, 40], [CHIPS, 25], [KETCH, 20], [MAY, 20], [PIY, 10], [CHED, 25]),
  lavTov: mix([TORT, 70], [TOV, 100], [POM, 40], [CHIPS, 25], [KETCH, 20], [MAY, 20], [PIY, 10]),
  lavTovP: mix([TORT, 70], [TOV, 100], [POM, 40], [CHIPS, 25], [KETCH, 20], [MAY, 20], [PIY, 10], [CHED, 25]),
  lavYengil: mix([TORT, 70], [TOV, 90], [POM, 40], [KARAM, 40], [MAY, 15]),                 // Lavashello / Fitter: tovuq, sabzavot, sous (chipssiz)
  shaurmaMol: mix([BULO, 80], [MOL, 90], [BOD, 30], [POM, 30], [KETCH, 15], [MAY, 15]),
  shaurmaTov: mix([BULO, 80], [TOV, 90], [BOD, 30], [POM, 30], [KETCH, 15], [MAY, 15]),
  hotdog: mix([BULO, 50], [SOS, 55], [POM, 15], [TUZB, 10], [AYS, 10], [KETCH, 10], [MAY, 10]),
  hotdogP: mix([BULO, 50], [SOS, 55], [POM, 15], [TUZB, 10], [AYS, 10], [KETCH, 10], [MAY, 10], [CHED, 15]),
  hotdog2: mix([BULO, 70], [SOS, 110], [POM, 15], [TUZB, 10], [AYS, 10], [KETCH, 15], [MAY, 15]),
  donarNon: mix([BULO, 80], [MOL, 100], [KARAM, 40], [AYS, 20], [POM, 30], [MAY, 20]),
  burger: 'u:170694', chiz: 'u:170692', dabl: 'u:170293', tovBurger: 'u:170318', katta: 'u:173317',
  fri: 'u:170698', naggets: 'u:170718', strips: 'u:173321', qanot: 'u:170360', tvister: 'u:170785', pitsa: 'u:173292', pitsaGosht: 'u:172055'
};
const TM = {
  evos: { n: 'Evos', a: 'evos,эвос,evos menyu', iu: "Og'irlik menyuda e'lon qilinmagan: tarkib — Evos menyusidan (Wolt, Yandex Xaritalar), porsiya — shu turdagi o'rtacha og'irlik.", ir: 'Вес в меню не указан: состав — из меню Evos (Wolt, Яндекс Карты), порция — средний вес для такого блюда.' },
  maxway: { n: 'Max Way', a: 'max way,maxway,maks vey,макс вей,максвей', iu: "Og'irlik menyuda e'lon qilinmagan: tarkib — Max Way menyusidan (maxway.uz, Wolt), porsiya — shu turdagi o'rtacha og'irlik.", ir: 'Вес в меню не указан: состав — из меню Max Way (maxway.uz, Wolt), порция — средний вес для такого блюда.' },
  oqtepa: { n: 'Oqtepa Lavash', a: 'oqtepa,oqtepa lavash,oktepa,октепа,октепа лаваш', iu: "Og'irlik menyuda e'lon qilinmagan: nomlar — oqtepalavash.uz, porsiya — shu turdagi o'rtacha og'irlik.", ir: 'Вес в меню не указан: названия — oqtepalavash.uz, порция — средний вес для такого блюда.' },
  feedup: { n: 'Feed Up', a: 'feed up,feedup,fidap,фид ап,фидап', iu: "Og'irlik — feedup.uz menyusidan (tarmoq e'lon qilgan); tarkib e'lon qilinmagan — shu turdagi odatiy tarkib.", ir: 'Вес — из меню feedup.uz (указан сетью); состав не указан — типичный для такого блюда.' },
  kfc: { n: 'KFC', a: 'kfc,кфс,кфц,kafsi', iu: "Og'irlik O'zbekiston menyusida e'lon qilinmagan: tarkib — KFC menyusidan (Wolt), porsiya — shu turdagi o'rtacha og'irlik.", ir: 'Вес в меню Узбекистана не указан: состав — из меню KFC (Wolt), порция — средний вес для такого блюда.' },
  bellissimo: { n: 'Bellissimo', a: 'bellissimo,bellisimo,беллиссимо,беллисимо,bellissimo pizza', iu: "Diametr va og'irlik e'lon qilinmagan: o'lchamlar — Bellissimo menyusidan (Yandex Xaritalar), pitsa og'irligi — shu diametrdagi o'rtacha.", ir: 'Диаметр и вес не указаны: размеры — из меню Bellissimo (Яндекс Карты), вес пиццы — средний для такого диаметра.' },
  lesailes: { n: 'Les Ailes', a: 'les ailes,lesailes,les ail,лес аил,лезаль', iu: "Og'irlik menyuda e'lon qilinmagan: tarkib — lesailes.uz menyusidan, porsiya — shu turdagi o'rtacha og'irlik.", ir: 'Вес в меню не указан: состав — из меню lesailes.uz, порция — средний вес для такого блюда.' },
  chopar: { n: 'Chopar Pizza', a: 'chopar,chopar pizza,чопар,чопар пицца', iu: "Og'irlik e'lon qilinmagan: o'lcham (25/30/35 sm) va tarkib — choparpizza.uz menyusidan, pitsa og'irligi — shu diametrdagi o'rtacha.", ir: 'Вес не указан: размер (25/30/35 см) и состав — из меню choparpizza.uz, вес пиццы — средний для такого диаметра.' }
};
/* [tarmoq, tur, qo'shimcha id, nom UZ, nom RU, qo'shimcha sinonimlar, toifa, porsiyalar, tarkib (R kaliti), og'irlik izohi (bo'lsa — tarmoq izohi o'rniga, UZ|RU)] */
const L = [
  ['evos', 'lavash', 'mol-m', 'Lavash mol (M)', 'Лаваш с говядиной (M)', 'evos lavash,эвос лаваш,lavash m,лаваш m', 'q', 'dona:300', 'lavMol'],
  ['evos', 'lavash', 'mol-l', 'Lavash mol (L)', 'Лаваш с говядиной (L)', 'evos lavash l,лаваш l,katta lavash', 'q', 'dona:370', 'lavMol'],
  ['evos', 'lavash', 'molp-m', 'Lavash mol, pishloqli (M)', 'Лаваш с говядиной и сыром (M)', 'evos pishloqli lavash,сырный лаваш', 'q', 'dona:320', 'lavMolP'],
  ['evos', 'lavash', 'tovuq-m', 'Lavash tovuq (M)', 'Лаваш с курицей (M)', 'evos tovuqli lavash,эвос лаваш курица', 'q', 'dona:300', 'lavTov'],
  ['evos', 'lavash', 'tovuqp-m', 'Lavash tovuq, pishloqli (M)', 'Лаваш с курицей и сыром (M)', 'evos tovuq pishloq lavash', 'q', 'dona:320', 'lavTovP'],
  ['evos', 'lavash', 'yengil', 'Lavashello / Fitter', 'Лавашелло / Фиттер', 'lavashello,лавашелло,fitter,фиттер', 'q', 'dona:260', 'lavYengil'],
  ['evos', 'shaurma', 'mol', "Shaurma mol go'shtli", 'Шаурма с говядиной', 'evos shaurma,эвос шаурма', 'q', 'dona:260', 'shaurmaMol'],
  ['evos', 'shaurma', 'tovuq', 'Shaurma tovuqli', 'Шаурма с курицей', 'evos shaurma tovuq', 'q', 'dona:260', 'shaurmaTov'],
  ['evos', 'burger', 'gamburger', 'Gamburger', 'Гамбургер', 'evos burger,evos gamburger,эвос бургер', 'q', 'dona:180', 'burger'],
  ['evos', 'chizburger', 'chiz', 'Chizburger', 'Чизбургер', 'evos chizburger,эвос чизбургер', 'q', 'dona:190', 'chiz'],
  ['evos', 'chizburger', 'dabl', 'Dablchizburger', 'Даблчизбургер', 'evos dabl,даблчизбургер', 'q', 'dona:270', 'dabl'],
  ['evos', 'burger', 'chiken', 'Chiken burger', 'Чикен бургер', 'evos chicken burger,чикен бургер', 'q', 'dona:200', 'tovBurger'],
  ['evos', 'hotdog', 'm', 'Hot-dog (M)', 'Хот-дог (M)', 'evos hot dog,evos hotdog,эвос хот-дог', 'q', 'dona:160', 'hotdog'],
  ['evos', 'fri', 'm', 'Kartoshka fri (M)', 'Картофель фри (M)', 'evos fri,эвос фри', 'q', 'porsiya:110', 'fri'],
  ['evos', 'naggets', 'x', 'Naggets', 'Наггетсы', 'evos naggets,эвос наггетсы', 'q', 'dona:17,porsiya:68', 'naggets'],

  ['maxway', 'lavash', 'mol', "Lavash klassik (mol go'shti, standart)", 'Лаваш классик (говядина, стандарт)', 'maxway lavash,max way lavash,макс вей лаваш', 'q', 'dona:300', 'lavMol'],
  ['maxway', 'lavash', 'mol-mini', "Lavash klassik (mol go'shti, mini)", 'Лаваш классик (говядина, мини)', 'maxway mini lavash', 'q', 'dona:200', 'lavMol'],
  ['maxway', 'lavash', 'molp', "Lavash pishloqli (mol go'shti, standart)", 'Лаваш сырный (говядина, стандарт)', 'maxway pishloqli lavash', 'q', 'dona:320', 'lavMolP'],
  ['maxway', 'lavash', 'tovuq', 'Lavash tovuqli (standart)', 'Лаваш куриный (стандарт)', 'maxway tovuqli lavash', 'q', 'dona:300', 'lavTov'],
  ['maxway', 'shaurma', 'mol', 'Shaurma (standart)', 'Шаурма (стандарт)', 'maxway shaurma', 'q', 'dona:260', 'shaurmaMol'],
  ['maxway', 'donar', 'non', 'German donar', 'Немецкий донар', 'german donar,немецкий донар,maxway donar', 'q', 'dona:290', 'donarNon'],
  ['maxway', 'burger', 'gamburger', 'Gamburger', 'Гамбургер', 'maxway burger,maxway gamburger', 'q', 'dona:180', 'burger'],
  ['maxway', 'chizburger', 'chiz', 'Chizburger', 'Чизбургер', 'maxway chizburger', 'q', 'dona:190', 'chiz'],
  ['maxway', 'chizburger', 'big', 'Bigburger (2 kotlet)', 'Бигбургер', 'bigburger,бигбургер,maxway big burger', 'q', 'dona:270', 'dabl'],
  ['maxway', 'hotdog', 'x', 'Hot-dog', 'Хот-дог', 'maxway hot dog,maxway hotdog', 'q', 'dona:150', 'hotdog'],
  ['maxway', 'hotdog', 'king', 'King dog (2 sosiska)', 'Кинг дог (2 сосиски)', 'king dog,кинг дог', 'q', 'dona:230', 'hotdog2'],
  ['maxway', 'sendvich', 'klab', 'Klab sendvich', 'Клаб сэндвич', 'klab sendvich,club sandwich,клаб сендвич,klabjon', 'q', 'dona:250', 'tovBurger'],
  ['maxway', 'fri', 'x', 'Kartoshka fri (standart)', 'Картофель фри (стандарт)', 'maxway fri', 'q', 'porsiya:100', 'fri', ["Og'irlik — Max Way kombo tavsifidan (fri 100 g).", 'Вес — из описания комбо Max Way (фри 100 г).']],
  ['maxway', 'naggets', 'x', 'Naggets', 'Наггетсы', 'maxway naggets', 'q', 'dona:17,porsiya:102', 'naggets'],
  ['maxway', 'strips', 'x', 'Strips', 'Стрипсы', 'maxway strips,стрипсы', 'q', 'dona:30,porsiya:150', 'strips'],

  ['oqtepa', 'lavash', 'mini', "Mini lavash (mol go'shti)", 'Мини лаваш (говядина)', 'oqtepa mini lavash,октепа мини лаваш', 'q', 'dona:220', 'lavMol'],
  ['oqtepa', 'lavash', 'katta', "Katta lavash (mol go'shti)", 'Большой лаваш (говядина)', 'oqtepa lavash,oqtepa katta lavash,октепа лаваш,большой лаваш', 'q', 'dona:370', 'lavMol'],
  ['oqtepa', 'lavash', 'pishloq', "Katta lavash pishloqli (mol go'shti)", 'Большой лаваш сырный', 'oqtepa pishloqli lavash,сырный лаваш октепа', 'q', 'dona:390', 'lavMolP'],
  ['oqtepa', 'lavash', 'tovuq', 'Tovuqli lavash', 'Куриный лаваш', 'oqtepa tovuqli lavash', 'q', 'dona:350', 'lavTov'],
  ['oqtepa', 'lavash', 'tandir', 'Tandir lavash pishloqli', 'Тандыр лаваш с сыром', 'tandir lavash,тандыр лаваш', 'q', 'dona:365', 'lavMolP', ["Og'irlik — sharhda tortilgan (kursiv.media, 2026: 365 g); tarkib — oqtepalavash.uz.", 'Вес — взвешен в обзоре (kursiv.media, 2026: 365 г); состав — oqtepalavash.uz.']],
  ['oqtepa', 'shaurma', 'x', 'Shaurma', 'Шаурма', 'oqtepa shaurma,октепа шаурма', 'q', 'dona:260', 'shaurmaMol'],
  ['oqtepa', 'donar', 'pita', 'Pita donar', 'Пита донер', 'pita donar,пита донер', 'q', 'dona:280', 'donarNon'],
  ['oqtepa', 'burger', 'gamburger', 'Gamburger', 'Гамбургер', 'oqtepa burger', 'q', 'dona:180', 'burger'],
  ['oqtepa', 'chizburger', 'chiz', 'Chizburger', 'Чизбургер', 'oqtepa chizburger', 'q', 'dona:190', 'chiz'],
  ['oqtepa', 'hotdog', 'x', 'Hot-dog', 'Хот-дог', 'oqtepa hot dog', 'q', 'dona:150', 'hotdog'],
  ['oqtepa', 'fri', 'x', "Kartoshka fri (o'rta)", 'Картофель фри (средний)', 'oqtepa fri', 'q', 'porsiya:110', 'fri'],
  ['oqtepa', 'naggets', 'x', 'Naggets', 'Наггетсы', 'oqtepa naggets', 'q', 'dona:17,porsiya:85', 'naggets'],

  ['feedup', 'lavash', 'mol', "Lavash go'shtli", 'Лаваш мясной', 'feedup lavash,feed up lavash,фид ап лаваш', 'q', 'dona:351', 'lavMol'],
  ['feedup', 'lavash', 'mini', 'Mini lavash', 'Мини лаваш', 'feedup mini lavash', 'q', 'dona:170', 'lavMol'],
  ['feedup', 'lavash', 'mini-tovuq', 'Mini lavash tovuqli', 'Мини лаваш куриный', 'feedup mini tovuqli lavash', 'q', 'dona:187', 'lavTov'],
  ['feedup', 'lavash', 'pishloq', "Pishloqli lavash go'shtli", 'Сырный лаваш мясной', 'feedup pishloqli lavash', 'q', 'dona:363', 'lavMolP'],
  ['feedup', 'lavash', 'mangal', 'Mangal lavash', 'Мангал лаваш', 'mangal lavash,мангал лаваш', 'q', 'dona:393', 'lavMol'],
  ['feedup', 'burger', 'xl-bbq', 'XL BBQ burger', 'XL BBQ бургер', 'feedup burger,xl bbq burger', 'q', 'dona:248', 'burger'],
  ['feedup', 'chizburger', 'xl-bbq', 'XL BBQ chizburger', 'XL BBQ чизбургер', 'feedup chizburger,xl bbq chizburger', 'q', 'dona:260', 'chiz'],
  ['feedup', 'chizburger', 'dabl', 'XL BBQ dablchizburger', 'XL BBQ даблчизбургер', 'feedup dablchizburger', 'q', 'dona:352', 'dabl'],
  ['feedup', 'burger', 'chikenzinger', 'Chikenzinger', 'Чикензингер', 'chikenzinger,chickenzinger,чикензингер', 'q', 'dona:300', 'tovBurger'],
  ['feedup', 'burger', 'prince', 'Prince burger', 'Принц бургер', 'prince burger,принц бургер', 'q', 'dona:303', 'katta'],
  ['feedup', 'hotdog', 'updog', 'Up dog', 'Ап дог', 'up dog,updog,feedup hot dog', 'q', 'dona:154', 'hotdog'],
  ['feedup', 'donar', 'mangal', 'Mangal donar', 'Мангал донар', 'mangal donar,мангал донар,feedup donar', 'q', 'dona:170', 'donarNon'],
  ['feedup', 'sendvich', 'klab', 'Klab sendvich', 'Клаб сэндвич', 'feedup klab sendvich', 'q', 'dona:411', 'tovBurger'],

  ['kfc', 'tvister', 'x', 'Tvister', 'Твистер', 'kfc tvister,kfc twister,кфс твистер', 'q', 'dona:220', 'tvister'],
  ['kfc', 'burger', 'shef', 'Shefburger', 'Шефбургер', 'shefburger,шефбургер,kfc burger', 'q', 'dona:200', 'tovBurger'],
  ['kfc', 'burger', 'longer', 'Longer', 'Лонгер', 'longer,лонгер', 'q', 'dona:130', 'tovBurger'],
  ['kfc', 'chizburger', 'x', 'Chizburger', 'Чизбургер', 'kfc chizburger', 'q', 'dona:140', 'tovBurger'],
  ['kfc', 'qanot', 'achchiq', 'Achchiq qanotchalar', 'Острые крылышки', 'kfc qanot,kfc krilya,крылья кфс,hot wings', 'q', 'dona:35,porsiya:175', 'qanot'],
  ['kfc', 'strips', 'x', 'Strips', 'Стрипсы', 'kfc strips,стрипсы кфс', 'q', 'dona:30,porsiya:90', 'strips'],
  ['kfc', 'naggets', 'x', 'Naggets', 'Наггетсы', 'kfc naggets', 'q', 'dona:17,porsiya:102', 'naggets'],
  ['kfc', 'naggets', 'bayts', 'Bayts (kichik)', 'Байтсы (малые)', 'bayts,байтсы,popkorn tovuq', 'q', 'porsiya:67', 'naggets', ["Og'irlik — KFC kombo tavsifidan (bayts kichik 60–67 g).", 'Вес — из описания комбо KFC (байтсы малые 60–67 г).']],
  ['kfc', 'fri', 'x', 'Kartoshka fri (standart)', 'Картофель фри (стандарт)', 'kfc fri,кфс фри', 'q', 'porsiya:110', 'fri'],

  ['bellissimo', 'pitsa', 'margarita', 'Pitsa Margarita (o\'rta, 30 sm)', 'Пицца Маргарита (средняя)', 'bellissimo margarita,маргарита', 'q', 'bolak:80,dona:640', 'pitsa'],
  ['bellissimo', 'pitsa', 'pishloq', 'Pitsa pishloqli (o\'rta, 30 sm)', 'Пицца сырная (средняя)', 'bellissimo pishloqli pitsa,сырная пицца', 'q', 'bolak:80,dona:640', 'pitsa'],
  ['bellissimo', 'pitsa', 'donar', 'Donar pitsa (o\'rta, 30 sm)', 'Донар пицца (средняя)', 'bellissimo donar,донар пицца', 'q', 'bolak:85,dona:680', 'pitsaGosht'],
  ['bellissimo', 'pitsa', 'gosht', "Go'shtli / kombo pitsa (o'rta, 30 sm)", 'Пицца мясная / комбо (средняя)', 'bellissimo kombo,bellissimo meat', 'q', 'bolak:85,dona:680', 'pitsaGosht'],
  ['bellissimo', 'pitsa', 'katta', "Pitsa pishloqli (katta, 35 sm)", 'Пицца сырная (большая)', 'bellissimo katta pitsa', 'q', 'bolak:110,dona:880', 'pitsa'],
  ['bellissimo', 'qanot', 'x', 'Qanotchalar', 'Крылышки', 'bellissimo qanot,bellissimo krilishki', 'q', 'dona:35,porsiya:175', 'qanot'],
  ['bellissimo', 'strips', 'x', 'Strips', 'Стрипсы', 'bellissimo strips', 'q', 'dona:30,porsiya:150', 'strips'],

  ['lesailes', 'tvister', 'lester', 'Lester', 'Лестер', 'lester,лестер,les ailes lester', 'q', 'dona:230', 'tvister'],
  ['lesailes', 'burger', 'klassik', 'Burger klassik (tovuqli)', 'Бургер классик', 'les ailes burger', 'q', 'dona:200', 'tovBurger'],
  ['lesailes', 'qanot', 'x', 'Qanotchalar', 'Крылышки', 'les ailes qanot', 'q', 'dona:35,porsiya:175', 'qanot'],
  ['lesailes', 'strips', 'x', 'Strips', 'Стрипсы', 'les ailes strips', 'q', 'dona:30,porsiya:90', 'strips'],
  ['lesailes', 'fri', 'x', 'Kartoshka fri', 'Картофель фри', 'les ailes fri', 'q', 'porsiya:110', 'fri'],

  ['chopar', 'pitsa', 'pishloq', 'Pitsa pishloqli (30 sm)', 'Пицца сырная (30 см)', 'chopar pitsa,чопар пицца', 'q', 'bolak:80,dona:640', 'pitsa'],
  ['chopar', 'pitsa', 'gosht', "Pitsa go'shtli (30 sm)", 'Пицца мясная (30 см)', 'chopar goshtli', 'q', 'bolak:85,dona:680', 'pitsaGosht'],
  ['chopar', 'pitsa', 'donar', 'Donar pitsa (35 sm)', 'Донар пицца (35 см)', 'chopar donar', 'q', 'bolak:115,dona:920', 'pitsaGosht']
];
const rows = L.map(([tm, tur, x, nu, nr, al, t, un, rk, iz]) => {
  const C = TM[tm]; if (!C || !R[rk]) throw new Error('kengaytma5: ' + tm + ' ' + rk);
  return ['tm-' + tm + '-' + tur + '-' + x, C.n + ' — ' + nu, C.n + ' — ' + nr, C.a + ',' + al, t, un, R[rk], tm, iz ? iz[0] : C.iu, iz ? iz[1] : C.ir];
});
/* muzqaymoq turlari (foydalanuvchi: «mevali kam kaloriyali muzqaymoqlar yo'q») — qolgan turlar ovqatlar-kengaytma.js da (mz-muzli, mz-meva-bar, mz-sorbet, mz-light, mz-vanil, mz-plombir-briket, mz-konus-shokolad) */
const MZ = `
mz-eskimo-glazur|Eskimo (shokolad glazurida)|Эскимо в шоколадной глазури|eskimo,эскимо,eskimo muzqaymoq,eskimo glazur,muzqaymoq tayoqchada,ice cream bar|h|dona:70|u:173466
mz-stakancha|Plombir vafli stakanchada|Пломбир в вафельном стаканчике|stakancha,stakanchik,plombir stakancha,muzqaymoq stakancha,стаканчик,пломбир в стаканчике,мороженое в стаканчике|h|dona:90|m:u:167573*78+u:175000*12
mz-rojok|Rojok (plombir vafli konusda)|Рожок (пломбир в вафельном рожке)|rojok,rojok muzqaymoq,рожок,мороженое рожок,konus muzqaymoq,vafli konus|h|dona:100|m:u:167573*85+u:175001*15
mz-sendvich|Muzqaymoq sendvich (pechene orasida)|Мороженое-сэндвич|sendvich muzqaymoq,muzqaymoq sendvich,сэндвич мороженое,мороженое сэндвич,ice cream sandwich|h|dona:70|u:172226
mz-vafli-briket|Muzqaymoq vafli orasida (briket)|Мороженое в вафлях (брикет)|vafli muzqaymoq,vafli orasida muzqaymoq,briket vafli,мороженое в вафлях,вафельный брикет|h|dona:100|m:u:167573*85+u:175000*15
`.trim().split('\n').map((l) => l.split('|'));
const all = rows.concat(MZ);
const Lx = (x) => x.trim().split(/\s+/);
const tmIds = (re) => rows.filter((r) => re.test(r[0])).map((r) => r[0]);
const TEG = { sut: tmIds(/-(molp|tovuqp|pishloq|tandir)\b|-chizburger-|-pitsa-|-tvister-/).concat(Lx('mz-eskimo-glazur mz-stakancha mz-rojok mz-sendvich mz-vafli-briket')),
  tuxum: tmIds(/-(lavash|shaurma|donar|hotdog|burger|chizburger|sendvich|tvister)-/), yongoq: [], baliq: [], choshqa: [],
  glyuten: tmIds(/./).filter((i) => !/-qanot-/.test(i)).concat(Lx('mz-stakancha mz-rojok mz-sendvich mz-vafli-briket mz-eskimo-glazur')) };
const OQSIL = Object.assign({}, ...rows.map((r) => ({ [r[0]]: /-(lavash|shaurma|donar)-.*(tovuq|yengil)|-(naggets|strips|qanot|tvister)-|chiken|chikenzinger|-shef|longer|klab|lester|-kfc-burger|-lesailes-burger|-kfc-chizburger/.test(r[0]) ? 'tovuq' : (/-fri-/.test(r[0]) ? 'yoq' : (/-pitsa-(margarita|pishloq|katta)/.test(r[0]) ? 'sut' : (/-pitsa-/.test(r[0]) ? 'aralash' : 'qizil'))) })),
  ...Lx('mz-eskimo-glazur mz-stakancha mz-rojok mz-sendvich mz-vafli-briket').map((i) => ({ [i]: 'sut' })));
module.exports = all; module.exports.TEG = TEG; module.exports.OQSIL = OQSIL;
