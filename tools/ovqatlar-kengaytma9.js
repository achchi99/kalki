/* kalki.uz — bazani kengaytirish, 9-bosqich (v108, 2026-11-28): SUSHI (rollar, nigiri, sashimi, imbir marinadi, vasabi), KIMBAP va BEZE.
 * Foydalanuvchi so'rovi: «bazada sushi, kimbap, beze yo'q». Mavjud sushi/roll/maki/soya-sous/zefir qatorlari (6-bosqich, 8c, build) O'ZGARTIRILMADI (faqat birlik «set» va sinonimlar qo'shildi,
 * tools/ovqatlar-alias.json); bu fayl faqat YETISHMAYOTGANLARNI qo'shadi. Qiymat — USDA FDC SR Legacy komponentlari bo'yicha STANDART RETSEPT (tools/retsept-v108.js, «Retsept hisobi»),
 * qo'lda yozilgan raqam yo'q. Format — tools/ovqatlar-kengaytma2.js bilan bir xil. Qator: id | nom (UZ) | nom (RU) | sinonimlar | tur | birliklar | manba.
 * Birliklar: sushi — dona (odatiy og'irlik) va set (8 dona); kimbap — bo'lak (≈20 g) va rulet (butun ≈ 9 bo'lak); beze — dona_s (kichik ≈ 5 g) va dona_l (katta ≈ 15 g).
 * Hujjat: docs/baza-kengaytma-v108.md. Test: tools/test-sushi.js */
'use strict';
const RA = require('./retsept-v108.js');
const m = (id) => 'm:' + RA[id].mas.map(([t, g]) => t + '*' + g).join('+');          // qator manbasi = retsept (ovqatlar-build.js retseptni ustun qo'yadi — ikkalasi bir xil)
const T = `
roll-maki-losos|Maki roll (losos bilan)|Ролл маки с лососем|maki,maki losos,maki roll losos,maki sake,sake maki,losos maki,losos roll,roll losos,маки,маки с лососем,маки лосось,ролл маки с лососем,ролл с лососем,роллы с лососем,маки ролл|q|dona:25,set:200,porsiya:150|${m('roll-maki-losos')}
roll-ugor|Roll Ugor (ilonbaliq, unagi)|Ролл с угрём (унаги)|ugor,ugor roll,roll ugor,ilonbaliq,ilonbaliq roll,unagi,unagi roll,roll unagi,угорь,угорь ролл,ролл угорь,ролл с угрём,ролл с угрем,ролл унаги,унаги,роллы с угрём|q|dona:30,set:240|${m('roll-ugor')}
roll-pishirilgan|Pishirilgan roll (zapechonniy, losos va pishloq bilan)|Запечённый ролл (с лососем и сыром)|pishirilgan roll,zapechenniy roll,zapechonniy roll,zapechyonniy roll,zapechenny roll,zapechenniy,zapechonniy,запечённый ролл,запеченный ролл,запечённые роллы,запеченные роллы,ролл запечённый,ролл запеченный,горячий ролл,baked roll,issiq roll,baked sushi roll|q|dona:30,set:240|${m('roll-pishirilgan')}
nigiri-tunets|Sushi (nigiri, tunets)|Суши нигири (тунец)|nigiri tunets,tunets nigiri,sushi tunets,tuna nigiri,maguro,maguro nigiri,нигири тунец,нигири с тунцом,суши тунец,суши с тунцом,суши нигири тунец,магуро|q|dona:30,set:240,porsiya:150|m:u:168878*70+u:173706*30
nigiri-ugor|Sushi (nigiri, ugor)|Суши нигири (угорь)|nigiri ugor,ugor nigiri,sushi ugor,sushi unagi,unagi nigiri,nigiri unagi,ilonbaliq nigiri,нигири угорь,нигири с угрём,нигири с угрем,суши угорь,суши с угрём,суши с угрем,нигири унаги,унаги нигири|q|dona:30,set:240,porsiya:150|m:u:168878*66+u:174194*28+u:171167*6
sashimi-losos|Sashimi (losos)|Сашими из лосося|sashimi,sashimi losos,losos sashimi,sashimi sake,sake sashimi,salmon sashimi,сашими,сашими лосось,сашими из лосося,сашими с лососем,лосось сашими|m||m:u:175167*100
imbir-marinad|Imbir marinadi (sushi uchun)|Имбирь маринованный (для суши)|imbir marinadi,imbir marinad,marinadlangan imbir,marinadlangan zanjabil,zanjabil marinad,sushi imbiri,sushi uchun imbir,gari,gari imbir,pickled ginger,sushi ginger,имбирь маринованный,маринованный имбирь,имбирь для суши,имбирь к суши,гари,имбирь гари,имбирь маринад|v|qoshiq:15|${m('imbir-marinad')}
vasabi|Vasabi|Васаби|vasabi,wasabi,wasabi pasta,vasabi pasta,vasabi pastasi,yapon xreni,васаби,вассаби,васаби паста,японский хрен|x|choyq:5|u:168583
kimbap-klassik|Kimbap (klassik: sabzavot, tuxum, kolbasa)|Кимбап классический (овощи, яйцо, колбаса)|kimbap,kimpab,kimbab,kimpap,gimbap,gimpap,kimbap klassik,klassik kimbap,koreys roll,koreyscha roll,кимбап,кимпаб,кимбаб,кимпап,гимбап,кимбап классический,корейский ролл,корейские роллы,корейский рулет|q|bolak:20,rulet:180|${m('kimbap-klassik')}
kimbap-tunets|Kimbap (tunets-mayonez bilan)|Кимбап с тунцом и майонезом|kimbap tunets,kimbap tunets mayonez,kimbap tuna,tunets kimbap,tunetsli kimbap,chamchi kimbap,chamchi gimbap,tuna mayo kimbap,gimbap tunets,кимбап с тунцом,кимбап тунец,кимбап тунец майонез,кимбап с тунцом и майонезом,гимбап с тунцом,чамчи кимбап|q|bolak:20,rulet:180|${m('kimbap-tunets')}
kimbap-bulgogi|Kimbap (mol go'shti, bulgogi)|Кимбап с говядиной (бульгоги)|kimbap bulgogi,bulgogi kimbap,bulgogi gimbap,kimbap mol goshti,mol go'shtli kimbap,mol goshtli kimbap,kimbap goshtli,bulgogi,кимбап бульгоги,кимбап булгоги,бульгоги кимбап,кимбап с говядиной,кимбап с мясом,гимбап с говядиной,бульгоги,булгоги|q|bolak:20,rulet:180|${m('kimbap-bulgogi')}
beze|Beze (oq, quruq)|Безе (белое, сухое)|beze,beze oq,oq beze,quruq beze,bezeler,bezelar,beze pishiriq,merenga,meringue,meringa,безе,безе белое,безе сухое,меренга,меренги,безе пирожное,безешки,meringue cookies|h|dona:10,dona_s:5,dona_l:15|${m('beze')}
`;
const rows = T.trim().split('\n').map((l) => l.split('|'));
const L = (x) => x.trim().split(/\s+/);
/* Yemaydiganlarim teglari (ehtiyotkor tomon): baliq · tuxum · sut · glyuten (soya/teriyaki sousi — bug'doy bor). «choshqa» — faqat bekon va pepperoni (qoida), bu yerda yo'q. */
const TEG = {
  baliq: L(`roll-maki-losos roll-ugor roll-pishirilgan nigiri-tunets nigiri-ugor sashimi-losos kimbap-tunets`),
  tuxum: L(`roll-pishirilgan kimbap-klassik kimbap-tunets kimbap-bulgogi beze`),
  sut: L(`roll-pishirilgan`),
  yongoq: [],
  glyuten: L(`roll-ugor nigiri-ugor kimbap-bulgogi`),
  choshqa: []
};
/* Oqsil manbasi (tools/oqsil-teglar.js qoidasi: hayvon oqsili ≥ 30 % va bitta manba ≥ 60 % — shu manba; aralash; yoq) — retsept oqsilidan chiqarilgan */
const OQSIL = {
  'roll-maki-losos': 'baliq', 'roll-ugor': 'baliq', 'roll-pishirilgan': 'aralash', 'nigiri-tunets': 'baliq', 'nigiri-ugor': 'baliq', 'sashimi-losos': 'baliq',
  'imbir-marinad': 'yoq', vasabi: 'yoq', 'kimbap-klassik': 'aralash', 'kimbap-tunets': 'baliq', 'kimbap-bulgogi': 'qizil', beze: 'tuxum'
};
module.exports = rows; module.exports.TEG = TEG; module.exports.OQSIL = OQSIL;
