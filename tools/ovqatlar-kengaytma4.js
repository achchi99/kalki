/* kalki.uz — bazani kengaytirish, 3-bosqich (2026-10-30, v66): meva/sabzavot/ko'kat (mahalliy: rovoch, qoqi, jusay, sholg'om, rayhon, yalpiz…), quruq meva, urug'lar (qovurilgan),
 * dukkak va makaron (xom/pishgan). Qiymat — USDA FDC SR Legacy (yaqin analog bo'lsa — «taxminiy»: m:). Format — tools/ovqatlar-kengaytma2.js bilan bir xil.
 * Qator: id | nom (UZ) | nom (RU) | sinonimlar | tur | porsiyalar | manba. */
'use strict';
const T = `
laym|Laym|Лайм|laym,lime,лайм,yashil limon|f|dona:67|u:168155
lichi|Liči|Личи|lichi,liči,lychee,личи|f|dona:10,hovuch:60|u:169086
marakuya|Marakuya|Маракуйя|marakuya,marakuyya,passion fruit,маракуйя|f|dona:18|u:169108
xurmo-quruq|Qoq xurmo (quritilgan)|Хурма сушёная|qoq xurmo,quritilgan xurmo,xurmo quruq,xurmo qoqi,сушеная хурма,хурма сушёная|d|dona:30,hovuch:40|u:169942
olcha-quruq|Olcha qoqi (shakarli, quritilgan)|Вишня сушёная (с сахаром)|olcha qoqi,quritilgan olcha,olcha quruq,сушеная вишня,вишня вяленая|d|hovuch:40,qoshiq:15|u:171708
mango-quruq|Mango (quritilgan, shakarli)|Манго сушёное|quritilgan mango,mango quruq,сушеное манго,манго сушёное,dried mango|d|hovuch:40,bolak:10|u:169091
mayiz-sariq|Sariq mayiz (kishmish, oltinrang)|Изюм светлый (золотистый)|sariq mayiz,oltin mayiz,oq kishmish,сабза,изюм светлый,изюм золотистый|d|hovuch:30,qoshiq:15|u:168164
kungaboqar-qovurilgan|Kungaboqar pistasi (qovurilgan)|Семечки подсолнечные жареные|qovurilgan semechki,qovurilgan kungaboqar,kungaboqar pista,pista kungaboqar,жареные семечки,семечки жареные|d|hovuch:30,stakan:130|u:170563
qovoq-urugi-qovurilgan|Qovoq urug'i (qovurilgan)|Тыквенные семечки жареные|qovurilgan qovoq urug'i,qovoq pistasi,qovoq urugi qovurilgan,жареные тыквенные семечки|d|hovuch:30|u:170557
kunjut-qovurilgan|Kunjut (qovurilgan)|Кунжут обжаренный|qovurilgan kunjut,kunjut qovurilgan,обжаренный кунжут,жареный кунжут|d|qoshiq:9,choyq:3|u:170151
sholgom|Sholg'om|Репа|sholg'om,sholgom,sholgam,turneps,репа,turnip|v|dona:120|u:170465
sholgom-pishgan|Qaynatilgan sholg'om|Репа отварная|sholg'om qaynatilgan,qaynatilgan sholg'om,sholgom pishgan,репа отварная,репа вареная|v|dona:120,porsiya:150|u:170058
rovoch|Rovoch|Ревень|rovoch,ravoch,rovach,ревень,rhubarb|v|dona:50,bog:150|u:167758
qoqi|Qoqi (momaqaymoq barglari)|Одуванчик (листья)|qoqi,qoqio't,momaqaymoq,qoqi barg,одуванчик,листья одуванчика,dandelion|v|bog:50,hovuch:30|u:169226
jusay|Jusay (ko'k piyoz turi)|Джусай (душистый лук)|jusay,jusoy,jusay piyoz,джусай,душистый лук,шнитт-лук|v|bog:50,hovuch:20|m:u:169994*100
rayhon|Rayhon (yangi)|Базилик свежий|rayhon,rayxon,reyhan,bazilik,базилик,basil|v|bog:30,hovuch:10|u:172232
yalpiz|Yalpiz (yangi)|Мята свежая|yalpiz,myata,мята,мята свежая,mint|v|bog:30,hovuch:10|u:173475
yer-nok|Yer nok (topinambur)|Топинамбур (земляная груша)|yer nok,topinambur,земляная груша,топинамбур|v|dona:60,porsiya:150|u:169236
qizil-karam|Qizil karam|Капуста краснокочанная|qizil karam,binafsha karam,krasnaya kapusta,краснокочанная капуста,красная капуста|v|porsiya:100|u:169977
pekin-karam|Pekin karami|Пекинская капуста|pekin karam,pekin karami,pekinka,пекинская капуста,пекинка|v|porsiya:100,barg:20|u:169979
pak-choy|Pak-choy (xitoy karami)|Капуста пак-чой|pak choy,pakchoy,bok choy,пак-чой,пак чой|v|porsiya:100|u:170390
bryussel-karam|Bryussel karami|Брюссельская капуста|bryussel karam,brussel karami,брюссельская капуста|v|dona:20,porsiya:100|u:170383
patisson|Patisson|Патиссон|patisson,tarelka qovoq,patison,патиссон,тарелочная тыква|v|dona:150|u:169289
artishok|Artishok|Артишок|artishok,artishok gulli,артишок,artichoke|v|dona:120|u:169205
selderey-ildiz|Selderey ildizi|Сельдерей корневой|selderey ildizi,selderey ildiz,сельдерей корень,сельдерей корневой,celeriac|v|dona:300,porsiya:100|u:170400
kok-pomidor|Pomidor (ko'k, pishmagan)|Помидор зелёный|ko'k pomidor,kok pomidor,pishmagan pomidor,зеленый помидор,зелёные помидоры|v|dona:120|u:170456
mosh-nihol|Mosh nihollari (ko'kartirilgan)|Ростки маша|mosh nihol,ko'kartirilgan mosh,mosh unib chiqqan,ростки маша,проростки маша,mung sprouts|v|hovuch:50,porsiya:100|u:169957
soya-pishgan|Soya (pishgan)|Соя (отварная)|soya,soya pishgan,soya donlari,соя,соевые бобы отварные|g|kosa:180,qoshiq:15|u:174271
noxat-pallali|Pallali no'xat (gorox, pishgan)|Горох колотый (отварной)|pallali noxat,no'xat palla,gorox,колотый горох,горох отварной,гороховая каша|g|kosa:200,qoshiq:15|u:172429
loviya-oq|Oq loviya (pishgan)|Фасоль белая (отварная)|oq loviya,loviya oq,белая фасоль,фасоль белая отварная|g|kosa:180,qoshiq:15|u:175203
makaron-butun-don|Butun donli makaron (pishgan)|Макароны цельнозерновые (отварные)|butun donli makaron,kepakli makaron,makaron butun don,цельнозерновые макароны,макароны из твердых сортов цельнозерновые|g|likop:200,stakan:140|u:168910
makaron-butun-don-xom|Butun donli makaron (xom)|Макароны цельнозерновые (сухие)|butun donli makaron xom,xom butun donli makaron,цельнозерновые макароны сухие|g|porsiya:80,stakan:100|u:169738
lapsha-xom|Tuxumli lapsha (xom)|Лапша яичная (сухая)|lapsha xom,xom lapsha,tuxumli lapsha xom,яичная лапша сухая,лапша сухая|g|porsiya:80,stakan:80|u:169731
`;
const rows = T.trim().split('\n').map((l) => l.split('|'));
const L = (x) => x.trim().split(/\s+/);
const TEG = { sut: [], tuxum: L(`lapsha-xom`), yongoq: [], glyuten: L(`makaron-butun-don makaron-butun-don-xom lapsha-xom`), baliq: [], choshqa: [] };
const OQSIL = Object.assign({}, ...L(`soya-pishgan noxat-pallali loviya-oq`).map((i) => ({ [i]: 'dukkak' })));
module.exports = rows; module.exports.TEG = TEG; module.exports.OQSIL = OQSIL;
