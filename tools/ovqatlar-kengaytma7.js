/* kalki.uz — bazani kengaytirish, 7-bosqich (v78, «Baza tekshirildi»): yetishmayotgan milliy taomlar va ikkiga ajratilgan «A / B» pozitsiyalar.
 * Qiymat — USDA FDC SR Legacy komponentlari bo'yicha retsept hisobi (m:), «taxminiy»; hisob docs/baza-tekshiruv-v78.md da.
 * Format — tools/ovqatlar-kengaytma2.js bilan bir xil. Qator: id | nom (UZ) | nom (RU) | sinonimlar | tur | porsiyalar | manba. */
'use strict';
const T = `
togramach|To'g'ramach (go'shtli lapsha sho'rva)|Тугромач (суп с лапшой и мясом)|togramach,to'g'ramach,tugramach,тугромач,тукмач,лапша суп|o|kosa:400|m:u:169737*25+u:174308*12+u:170393*5+u:170000*5+u:170457*4+u:171025*2+suv*47
noxat-shurva|Nohat sho'rva (qo'y go'shtli)|Нохат-шурпа (суп с нутом и бараниной)|nohat shorva,no'xat sho'rva,нохат шурпа,суп с нутом|o|kosa:350|m:u:173757*18+u:172479*9+u:170026*9+u:170393*6+u:170000*5+u:171025*1+suv*52
lochira|Lochira (kichik tandir noni)|Лочира (маленькая тандырная лепёшка)|lochira,lochira non,лочира,лаваш тандырный маленький,kichik non|n|dona:110|m:u:168894*74+u:171025*2+suv*24
shirchoy|Shirchoy (sutli choy, sariyog' bilan)|Ширчой (молочный чай с маслом)|shirchoy,sut choy,shir choy,ширчой,чай с молоком и маслом,qaymoqli choy tuzli|i|piyola:200|m:u:171265*45+u:173410*2+suv*53
udon|Udon (pishgan lapsha)|Удон (варёная лапша)|udon,udon lapsha,удон|g|porsiya:250,likop:300|m:u:169737*100
soba|Soba (grechka lapshasi, pishgan)|Соба (гречневая лапша, варёная)|soba,soba lapsha,соба,гречневая лапша|g|porsiya:250,likop:300|m:u:168919*100
`.trim().split('\n').map((l) => l.split('|'));
module.exports = T;
