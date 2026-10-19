#!/usr/bin/env node
/* kalki.uz — data/baliq-uy.json: «Uyda pishiraman» baliq retseptlari (tovada, duxovkada, grilda sazan).
 * Masalliq grammlari 1 KISHI uchun (250 g tozalangan sazan) — baza retseptidan (data/baza-retseptlar.json) proporsional hisoblanadi, shuning uchun taom kkal/oqsili bilan mos.
 * Ziravor/limon kabi «qo'shimcha» masalliqlar kkal hisobiga kirmaydi (ahamiyatsiz miqdor). Qadamlar — qisqa (5–7), UZ/RU. Qayta hisob: assets/baliq-uy-core.js.   node tools/baliq-uy-yasa.js [--yoz] */
'use strict';
const fs = require('fs'), path = require('path');
const R = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const BALIQ_1 = 250;                                   // 1 kishiga tozalangan (suyaksiz/tilimlangan) sazan, g
const ZIRA = { n: { uz: 'zira yoki qora murch', ru: 'зира или чёрный перец' }, g1: 1, birlik: 'g' }, TUZ = { n: { uz: 'tuz', ru: 'соль' }, g1: 3, birlik: 'g' }, LIMON = { n: { uz: 'limon', ru: 'лимон' }, g1: 0.25, birlik: 'dona' };
const RET = [
  { id: 'tovada', taom: 'sazan-qovurma', rc: 'sazan-qovurma', nom: { uz: 'Tovada qovurilgan sazan', ru: 'Жареный карп на сковороде' }, vaqt: { uz: '35 daqiqa', ru: '35 минут' }, qosh: [TUZ, ZIRA, LIMON],
    q: { uz: ['Baliqni tozalab, 3–4 sm li bo\'laklarga kesing, yuving va qog\'oz sochiq bilan quriting.', 'Tuz va ziravor bilan aralashtirib, 10 daqiqa qoldiring.', 'Bo\'laklarni unga ag\'daring, ortig\'ini silkitib tashlang.', 'Tovada yog\'ni qizdiring (o\'rtacha-baland olov): yog\' tutay boshlamasin, bo\'lak tashlaganda «chirs» etsin.', 'Bo\'laklarni bir-biriga tegizmay joylang; har tomonini 4–5 daqiqa qovuring, bir marta ag\'daring.', 'Tayyor baliq oq-tiniq bo\'lib, vilka bilan oson ajralishi kerak. Qog\'oz sochiqqa olib, ortiqcha yog\'ni oling.', 'Limon va ko\'kat bilan tortiq qiling.'],
      ru: ['Очистите рыбу, нарежьте кусками 3–4 см, промойте и обсушите бумажным полотенцем.', 'Посолите, добавьте специи, оставьте на 10 минут.', 'Обваляйте кусочки в муке, стряхните лишнее.', 'Разогрейте масло на сковороде (средне-сильный огонь): оно не должно дымить, кусочек должен «шипеть».', 'Выложите кусочки, не прижимая друг к другу; жарьте по 4–5 минут с каждой стороны, переверните один раз.', 'Готовая рыба белая, непрозрачная и легко делится вилкой. Переложите на бумажное полотенце, убрав лишнее масло.', 'Подавайте с лимоном и зеленью.'] } },
  { id: 'duxovka', taom: 'sazan-duxovka', rc: 'sazan-duxovka', nom: { uz: 'Duxovkada sazan (kartoshka bilan)', ru: 'Карп в духовке с картофелем' }, vaqt: { uz: '60 daqiqa', ru: '60 минут' }, qosh: [TUZ, ZIRA, LIMON],
    q: { uz: ['Duxovkani 200 °C ga qizdiring.', 'Kartoshkani yupqa halqalarga, piyoz va pomidorni halqalarga kesing.', 'Pishirish idishiga yog\' surting; kartoshkani yoyib, tuz seping va 15 daqiqa pishiring.', 'Baliqni bo\'laklarga kesib, tuz va ziravor bilan ishqalang.', 'Kartoshka ustiga baliq, piyoz va pomidorni joylang, ozgina yog\' tomizing.', 'Yana 25–30 daqiqa pishiring: baliq oq-tiniq bo\'lishi, kartoshka yumshashi kerak.', 'Limon sixib, issiq holda torting.'],
      ru: ['Разогрейте духовку до 200 °C.', 'Картофель нарежьте тонкими кружками, лук и помидоры — кольцами.', 'Смажьте форму маслом; разложите картофель, посолите и запекайте 15 минут.', 'Рыбу нарежьте кусками, натрите солью и специями.', 'На картофель выложите рыбу, лук и помидоры, сбрызните небольшим количеством масла.', 'Запекайте ещё 25–30 минут: рыба должна стать белой и непрозрачной, картофель — мягким.', 'Выжмите лимон и подавайте горячим.'] } },
  { id: 'grill', taom: 'sazan-grill', rc: 'sazan-grill', nom: { uz: 'Grilda sazan', ru: 'Карп на гриле' }, vaqt: { uz: '30 daqiqa', ru: '30 минут' }, qosh: [TUZ, ZIRA, LIMON],
    q: { uz: ['Grilni (yoki gril tovasini, mangalni) o\'rtacha issiqlikgacha qizdiring.', 'Baliqni 3–4 sm qalinlikdagi bo\'laklarga kesing, quriting.', 'Tuz, ziravor, limon sharbati va oz yog\' bilan 10 daqiqa marinadlang.', 'Panjara/tovaga yog\' surting — baliq yopishib qolmasin.', 'Bo\'laklarni joylang; har tomonini 5–6 daqiqa pishiring, faqat bir marta ag\'daring.', 'Baliq oq-tiniq bo\'lib, vilka bilan oson ajralganda tayyor.', 'Piyoz halqalari va limon bilan torting.'],
      ru: ['Разогрейте гриль (или сковороду-гриль, мангал) до средней температуры.', 'Нарежьте рыбу кусками толщиной 3–4 см, обсушите.', 'Замаринуйте с солью, специями, лимонным соком и небольшим количеством масла на 10 минут.', 'Смажьте решётку/сковороду маслом, чтобы рыба не прилипла.', 'Выложите кусочки; готовьте по 5–6 минут с каждой стороны, переворачивая только один раз.', 'Рыба готова, когда стала белой, непрозрачной и легко делится вилкой.', 'Подавайте с кольцами лука и лимоном.'] } }
];
function yasa() {
  const rets = Object.fromEntries(R('data/baza-retseptlar.json').retseptlar.map((r) => [r.id, r])), mas = R('data/baza-masalliq.json').masalliq, foods = R('data/ovqatlar.json').foods, cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const NAME = { yog: { uz: "o'simlik yog'i", ru: 'растительное масло' } };
  return RET.map((x) => {
    const rec = rets[x.rc]; if (!rec) throw new Error('retsept yo\'q: ' + x.rc); if (!foods.find((f) => f.i === x.taom)) throw new Error('taom yo\'q: ' + x.taom);
    const fish = rec.ingr.filter((l) => l.m === 'sazan').reduce((a, l) => a + l.g, 0), f = BALIQ_1 / fish;
    const ing = rec.ingr.filter((l) => l.m !== 'suv').map((l) => ({ m: l.m, n: { uz: cap((NAME[l.m] || mas[l.m]).uz), ru: cap((NAME[l.m] || mas[l.m]).ru) }, g1: Math.round(l.g * f * 10) / 10, birlik: 'g' }));
    ing.sort((a, b) => (a.m === 'sazan' ? -1 : b.m === 'sazan' ? 1 : b.g1 - a.g1));
    return { id: x.id, taom: x.taom, rc: x.rc, nom: x.nom, vaqt: x.vaqt, baliq_g1: BALIQ_1, masalliq: ing.concat(x.qosh.map((q) => ({ m: null, n: { uz: cap(q.n.uz), ru: cap(q.n.ru) }, g1: q.g1, birlik: q.birlik }))), qadamlar: x.q };
  });
}
if (require.main === module) {
  const r = yasa(); console.log(r.map((x) => x.id + ': ' + x.masalliq.map((m) => m.n.uz + ' ' + m.g1 + (m.birlik === 'dona' ? ' dona' : ' g')).join(', ')).join('\n'));
  if (process.argv.includes('--yoz')) { const j = { v: 1, izoh: 'Uyda pishirish: baliq retseptlari (tools/baliq-uy-yasa.js yasaydi, qo\'lda tahrir qilinmaydi). Masalliq grammi 1 kishi uchun; qayta hisob: assets/baliq-uy-core.js. Qo\'shimchalar (tuz, ziravor, limon) kkal hisobiga kirmaydi.', kishi: { min: 1, max: 8, standart: 4 }, retseptlar: r }; fs.writeFileSync(path.join(__dirname, '..', 'data', 'baliq-uy.json'), JSON.stringify(j, null, 1) + '\n'); console.log('data/baliq-uy.json yozildi'); }
}
module.exports = { yasa, BALIQ_1 };
