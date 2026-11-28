/* kalki.uz — BREND → «Balki: …» (2026-11, muzqaymoq brendlari «Bahrom», «48 копеек»).
 * Maqsad: foydalanuvchi brend nomini yozsa va shu brendning aniq turi bazada YO'Q bo'lsa («Bahrom eskimo» — yorlig'i topilmagan), natija «Topilmadi» emas, mos UMUMIY taom
 * («Eskimo (shokolad glazurida)», «Plombir vafli stakanchada»…) «Balki: shularni nazarda tutdingizmi?» bo'limida chiqadi. Brend uchun raqam o'ylab topilmaydi — umumiy taom o'z (USDA) manbasi bilan qoladi.
 * Brendning yorlig'i bor turlari — haqiqiy mahsulot sifatida (id: mz-<brend>-<tur>); shu tur uchun umumiy taom «Balki» ro'yxatidan tushadi.
 * Natija: ovqatlar.json → br: [{a: [normallashgan so'rov nomlari], f: [umumiy taom id], t: [brend turlari bor id'lar]}]. Ilova (kalkifit-app.js, brandRel): so'rov shu nomlardan birini (so'z chegarasida) o'z ichiga olsa. */
'use strict';
const GEN = { plombir: 'mz-plombir-briket', stakan: 'mz-stakancha', eskimo: 'mz-eskimo-glazur', rojok: 'mz-rojok', sendvich: 'mz-sendvich', vafli: 'mz-vafli-briket', vanil: 'mz-vanil' };
const BR = [
  { id: 'bahrom', alias: ['bahrom', 'бахром', 'bahrom muzqaymoq', 'bahrom muzqaymoqlari', 'bahrom muzqaymoq', 'мороженое бахром', 'бахром мороженое', 'бахром музқаймоқ', 'bakhrom', 'bahram muzqaymoq'], tur: ['plombir', 'stakan', 'eskimo', 'rojok', 'sendvich', 'vafli', 'vanil'] },
  { id: '48k', alias: ['48 копеек', '48 kopeek', '48 kopeyka', '48 копеек пломбир', '48 kopeek plombir', '48 копеек мороженое', '48 kopeek muzqaymoq', 'мороженое 48 копеек', '48 копейки', '48 kopeyek', '48 kopek', '48 копеек музқаймоқ', '48 kop'], tur: ['plombir', 'stakan', 'eskimo', 'rojok', 'sendvich', 'vafli', 'vanil'] }
];
const nrm = (x) => String(x).toLowerCase().replace(/[’'`‘ʻʼ´′]/g, '').replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
function build(foods) {
  const have = new Set(foods.map((o) => o.i));
  return BR.map((b) => {
    const mine = foods.filter((o) => o.i.startsWith('mz-' + b.id + '-')).map((o) => o.i);
    const covered = new Set(mine.map((i) => i.slice(('mz-' + b.id + '-').length).split('-')[0]));
    const f = b.tur.filter((t) => !covered.has(t)).map((t) => GEN[t]).filter((i) => have.has(i));
    if (b.tur.some((t) => !have.has(GEN[t]))) throw new Error('ovqatlar-brend: umumiy taom yo\'q ' + b.id);
    return { a: [...new Set(b.alias.map(nrm))], f, t: mine };
  });
}
module.exports = { build, BR, GEN };
