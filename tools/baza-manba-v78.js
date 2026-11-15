/* kalki.uz — v78: manbasi aniq bo'lmagan ustuvor taomlarga USDA FDC (SR Legacy) bo'yicha hisob. Format: id → 'u:<fdc>*<g>+…' (100 g TAYYOR taomdagi tarkib, g; «suv» — 0 kkal).
 * Qoida: hisob mavjud qiymatdan ±15 % ichida bo'lsa — qiymat O'ZGARTIRILMAYDI (manba tasdiqlandi); undan ortiq farq qilsa — hisob qiymati olinadi va ro'yxatga tushadi (docs/baza-tekshiruv-v78.md).
 * Retseptlar — o'rtacha uy/oshxona retsepti (yog' kamaytirilmagan). Manbasi topilmaganlar BU YERGA KIRITILMAGAN (ustuvor ro'yxatdan chiqarilgan, hisobotda «qo'lda qaror»). */
'use strict';
module.exports = {
  shashlik: 'u:174308*60+u:172544*40',                       // qo'y go'shti (yog'siz + yog'li, pishgan)
  'jigar-kabob': 'u:168627*95+u:171025*5',                    // mol jigari (pishgan) + yog'
  lyulya: 'u:172544*60+u:174032*30+u:170000*10',              // qo'y va mol qiymasi + piyoz
  'tandir-gosht': 'u:174312*100',                             // qo'y sonining go'shti (yog'i bilan, pishgan)
  qazi: 'u:174323*100',                                       // yog'li qovurg'a (qazi — ot go'shti, USDA da yo'q: yog'li qo'y qovurg'asi proksi)
  xonim: 'u:168894*28+u:174032*20+u:170026*15+u:170000*10+u:171025*4+suv*23',
  achichuk: 'u:170457*58+u:170000*42',
  'salat-sabzavot': 'u:170457*45+u:168409*45+u:171025*4+u:170000*6',
  olivye: 'u:170440*30+u:173424*15+u:171477*15+u:170394*8+u:170015*10+u:168558*7+u:171009*15',
  vinegret: 'u:169146*30+u:170440*25+u:170394*15+u:169279*10+u:168558*10+u:171025*5+u:170000*5',
  'koreys-sabzi': 'u:170393*87+u:171025*8+u:169655*3+u:169230*2',
  jiz: 'u:174032*55+u:172544*25+u:170000*10+u:171025*10',
  beshbarmoq: 'u:168919*45+u:172544*35+u:170000*10+suv*10',
  borsch: 'u:169146*15+u:169975*15+u:170026*12+u:170393*6+u:170000*5+u:168668*8+u:170459*2+u:171025*1.5+suv*35.5',
  'sabzavot-ragu': 'u:170026*30+u:170393*10+u:169975*15+u:170000*8+u:170457*12+u:171025*3.5+u:169291*15+suv*6.5',
  'qaynatma-baliq': 'u:171952*20+u:170026*8+u:170393*4+u:170000*4+suv*64',
  boglirsoq: 'u:168894*60+u:171025*20+suv*20',
  chakchak: 'u:168894*40+u:171025*20+u:169640*40',
  paxlava: 'u:168894*30+u:170187*25+u:173410*18+u:169640*17+u:169655*10',
  'lavash-non': 'u:174915*100',
  baget: 'u:172675*100',
  ayron: 'u:171284*50+suv*50',
  kefir: 'u:172205*50+u:171265*50',
  qaymoq: 'u:170859*100',
  'pishloq-yumshoq': 'u:173420*100',
  muzqaymoq: 'u:167575*100',
  'tuxum-xom': 'u:171287*100',
  'tovuq-qanot': 'u:173630*100',
  'tovuq-qov': 'u:171450*100',
  'baliq-qov': 'u:174187*100',
  'guruch-xom': 'u:168877*100',
  'suli-xom': 'u:173904*100',
  manka: 'u:169715*10+u:171265*88+u:169655*2',
  loviya: 'u:173740*100',
  yasmiq: 'u:172421*100',
  'kartoshka-xom': 'u:170026*100',
  mayiz: 'u:168164*100',
  murabbo: 'u:169655*60+u:171697*40',
  limonad: 'u:173205*100',
  kompot: 'u:169655*8+u:173941*10+suv*82',
  kakao: 'u:171265*92+u:169593*2+u:169655*6',
  'lavash-tovuq': 'u:174915*35+u:171477*25+u:169975*12+u:170457*12+u:171009*6+u:168409*10',
  doner: 'u:174915*28+u:174032*38+u:169975*8+u:170457*8+u:171009*8+u:170000*5+u:171284*5',
  pechenye: 'u:174950*100',
  xalva: 'u:167996*100',
  navvot: 'u:169655*100',
  qand: 'u:169655*100',
  tort: 'u:172709*100',
  keks: 'u:172765*100',
  yog: 'u:171025*100',
  'yashil-choy': 'u:171917*100',
  'sovuq-choy': 'u:173227*88+u:169655*6+u:167747*6',
};
/* hisob qilib bo'lmagan — ustuvor ro'yxatdan chiqariladi (sabab hisobotda) */
module.exports.QOLDA = { sumalak: "uy retsepti (o'sma va un nisbati) juda farq qiladi, USDA da analog yo'q", halim: "retsept (bug'doy/go'sht nisbati) manbasiz", suzma: "suzma yog'liligi/quruqligi har xil, USDA da analog yo'q", tvorog5: "rus tipidagi tvorog (5 %) USDA da yo'q", 'grechka-xom': "xom grechka USDA ro'yxatida yo'q (faqat pishgan)", 'makaron-xom': "oddiy quruq makaron USDA ro'yxatida yo'q", limon: "limon USDA ro'yxatida yo'q (sharbati bor)", olcha: "xom olcha USDA ro'yxatida yo'q", behi: "behi USDA ro'yxatida yo'q", kvas: "kvas USDA ro'yxatida yo'q" };
