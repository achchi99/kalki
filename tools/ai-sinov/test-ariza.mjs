// functions/api/ariza.js toza funksiyalari uchun testlar: node tools/ai-sinov/test-ariza.mjs
import assert from 'node:assert/strict';
import { hasLawRef, cleanText, validate, maskPII, originOk } from '../../functions/api/ariza.js';
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('OK  ' + name); };

t('qonun havolasi: YAROQLI jumlalar', () => {
  for (const s of ["ijobiy qaror qabul qilishingizni so'rayman", 'qarorni qayta ko\'rib chiqishingizni so\'rayman',
    "25-son maktabda o'qiydi", 'moddiy yordam berishingizni so\'rayman', 'qonuniy vakilman'])
    assert.equal(hasLawRef(s), false, s);
});
t('qonun havolasi: YAROQSIZ jumlalar', () => {
  for (const s of ['Mehnat kodeksining tegishli moddalariga asosan', 'Qonunning 12-moddasi', 'PQ-123-son qaror',
    'Vazirlar Mahkamasining qarori', '№ 45', 'PF-60 farmoniga ko\'ra', '45-son qarorga binoan'])
    assert.equal(hasLawRef(s), true, s);
});
t('tozalash: bosh va oxirgi rekvizitlar', () => {
  const raw = 'Maktab direktoriga\n\n[F.I.Sh.] ning ota-onasi [F.I.Sh.] dan\n\nARIZA\n\nFarzandim kasal bo\'ldi.\n\nIltimosimni qanoatlantirishingizni so\'rayman.\n\nSana: [sana]\nImzo: ____________';
  assert.equal(cleanText(raw), 'Farzandim kasal bo\'ldi.\n\nIltimosimni qanoatlantirishingizni so\'rayman.');
});
t('tozalash: murojaat qatori doim olib tashlanadi', () => {
  const body = 'Farzandim kasal bo\'ldi.\n\nIltimosimni qanoatlantirishingizni so\'rayman.';
  for (const g of ['Hurmatli direktor,', 'Hurmatli direktor [F.I.Sh.],', 'Hurmatli [lavozim], [F.I.Sh.]!', 'Hurmatli rahbariyat!', 'Assalomu alaykum,', 'Hurmatli direktor:'])
    assert.equal(cleanText(g + '\n\n' + body), body, g);
  assert.equal(cleanText(body), body);
  assert.equal(cleanText('Hurmatli uy egasi, men [sana]dan kvartirani olganman.\n\nIkkinchi.'), 'Men [sana]dan kvartirani olganman.\n\nIkkinchi.');
  assert.equal(validate('Hurmatli direktor, ' + Array(40).fill('so\'z').join(' ')), 'murojaat');
});
t('tozalash: Hurmat bilan va imzo nomi', () => {
  assert.equal(cleanText('Matn shu yerda.\n\nHurmat bilan,\n[F.I.Sh.]\nImzo: [imzo]'), 'Matn shu yerda.');
});
t('tozalash: "... ariza matni:" kirish qatori', () => {
  assert.equal(cleanText('Maktab direktoriga yozilgan ariza matni:\n\nFarzandim kasal bo\'ldi.'), 'Farzandim kasal bo\'ldi.');
  assert.equal(cleanText('Matn:\nFarzandim kasal bo\'ldi.'), 'Farzandim kasal bo\'ldi.');
  const keep = 'Quyidagi sabablarga ko\'ra murojaat qilaman:\n1. kasal';
  assert.equal(cleanText(keep), keep);
});
// 4-bosqichdagi xom javoblar
const R1 = "Uy egasi bilan kelishilgan muddatdan oldin ijarani bekor qilish haqida ariza matni (faqat asosiy qism):\n\nMen, [F.I.Sh.], [manzil] joylashgan kvartirani [sana]dan ijaraga olib turganman. Shu munosabat bilan [sana]dan boshlab ijarani bekor qilishingizni so'rayman.\n\nKvartirani tekshirish va hisob-kitobni kelishib olish uchun vaqt belgilashingizni iltimos qilaman.";
const R2 = "Farzandim [F.I.Sh.] [sinf] sinf o'quvchisi bo'lib, [eski maktab nomi] da tahsil oladi. Oilamiz yaqinda [yangi manzil]ga ko'chib o'tdi, shu sababli farzandimni [yangi maktab nomi]ga o'tkazishingizni so'rayman.\n\nKo'chish haqidagi hujjatlar ilova qilinadi. Iltimosimni ko'rib chiqishingizni so'rayman.\n\nIlova: [ko'chish haqida hujjat]";
const R3 = "Men, [F.I.Sh.], [lavozim] lavozimida ishlab kelmoqdaman. O'z xohishim bilan, [sana] dan boshlab ishdan bo'shatishingizni so'rayman.";
const R4 = "Gaz xizmati hisobida xatolik bo'lganini ko'rsatib, qayta hisoblashni so'rash uchun quyidagi matnni tavsiya etaman:\n\nMen, [F.I.Sh.], [manzil] manzilida yashayman. Hisobni qayta hisoblashingizni so'rayman.";
t('5-bosqich: ":" bilan tugaydigan kirish qatori (1 va 4-javoblar)', () => {
  assert.ok(cleanText(R1).startsWith('Men, [F.I.Sh.], [manzil]'));
  assert.ok(cleanText(R4).startsWith('Men, [F.I.Sh.], [manzil]'));
  assert.equal(cleanText('Izoh qatori:\nFarzandim kasal bo\'ldi.'), 'Farzandim kasal bo\'ldi.');
  const list = 'Quyidagi sabablarga ko\'ra murojaat qilaman:\n1. kasal\n2. safar';
  assert.equal(cleanText(list), list); // ro'yxat boshlanishi saqlanadi
  assert.equal(validate(cleanText(R1) + ' ' + Array(30).fill('so\'z').join(' ')), null); // rad etilmaydi
});
t('5-bosqich: 2 ta "so\'rayman" — oxirgi umumiy yakun olib tashlanadi (2-javob)', () => {
  const c = cleanText(R2);
  assert.equal((c.match(/so'rayman/g) || []).length, 1);
  assert.ok(!/Iltimosimni/.test(c));
  assert.ok(c.endsWith('Ilova: [ko\'chish haqida hujjat]'));
  assert.ok(c.includes('hujjatlar ilova qilinadi.'));
  // yakun olib tashlangach ham 2+ bo'lsa — qabul qilinadi (rad etilmaydi)
  const two = "Men [sana]dan boshlab ishdan bo'shatishingizni so'rayman. Hisob-kitobni tezroq yopishingizni so'rayman. " + Array(30).fill("so'z").join(' ');
  assert.equal(cleanText(two), two);
  assert.equal(validate(cleanText(two)), null);
  const one = 'Menga ruxsat berishingizni so\'rayman. Iltimosimni qanoatlantirishingizni so\'rayman.'.concat(' ', Array(30).fill('so\'z').join(' '));
  assert.ok(!/Iltimosimni/.test(cleanText(one)));
  const only = 'Farzandimni qabul qilishingiz kerak. ' + Array(30).fill("so'z").join(' ') + ' Iltimosimni qanoatlantirishingizni so\'rayman.';
  assert.equal(cleanText(only), only); // bitta "so'rayman" — tegilmaydi
});
t('5-bosqich: joy qoldiruvchi + qo\'shimcha bo\'sh joyi (2 va 3-javoblar)', () => {
  assert.ok(cleanText(R2).includes('[eski maktab nomi]da tahsil'));
  assert.ok(cleanText(R3).includes('[sana]dan boshlab'));
  assert.equal(cleanText('[sana] dan [sana] gacha va [manzil] ni ko\'rib.'), '[sana]dan [sana]gacha va [manzil]ni ko\'rib.');
  assert.equal(cleanText('[sana] va [F.I.Sh.] bilan'), '[sana] va [F.I.Sh.] bilan'); // boshqa so'zlar tegilmaydi
  assert.equal(cleanText('[sana] darslar'), '[sana] darslar');
});
t('tekshiruv', () => {
  const ok = Array(40).fill("so'z").join(' ');
  assert.equal(validate(ok), null);
  assert.equal(validate(''), 'bosh');
  assert.equal(validate(ok + ' Заявление'), 'kirill');
  assert.equal(validate(ok + ' Qonunning 5-moddasi'), 'qonun');
  assert.equal(validate('qisqa matn'), 'soz');
  assert.equal(validate(Array(151).fill('so\'z').join(' ')), 'soz');
});
t('niqoblash', () => {
  const cases = [
    ['telefonim 901234567 shu', '[telefon]'], ['+998 90 123 45 67', '[telefon]'], ['90-123-45-67', '[telefon]'],
    ['(90) 123 45 67', '[telefon]'], ['998901234567', '[telefon]'],
    ['a.b@mail.uz', '[email]'], ['AA1234567', '[pasport]'], ['AB 1234567', '[pasport]'],
    ['12345678901234', '[JShShIR]'], ['8600 1234 5678 9012', '[karta]'], ['8600123456789012', '[karta]']
  ];
  for (const [inp, tok] of cases) assert.ok(maskPII(inp).includes(tok), inp + ' -> ' + maskPII(inp));
  for (const keep of ['3 kun kasal', '1 500 000 so\'m', '2 oydan beri', '10 yil staj'])
    assert.equal(maskPII(keep), keep, keep);
  assert.ok(!/901234567/.test(maskPII('Men Karimov Aziz, telefonim 901234567')));
});
t('origin', () => {
  for (const o of ['https://kalki.uz', 'https://www.kalki.uz', 'https://kalki-10y.pages.dev', 'https://ai-ariza.kalki-10y.pages.dev', 'https://a.b.kalki-10y.pages.dev'])
    assert.equal(originOk(o, {}), true, o);
  for (const o of ['', null, 'http://kalki.uz', 'https://evil.com', 'https://kalki.uz.evil.com', 'https://evil-kalki-10y.pages.dev', 'https://evilkalki-10y.pages.dev', 'https://kalki-10y.pages.dev.evil.com', 'https://kalki.pages.dev', 'https://ai-ariza.kalki.pages.dev', 'http://kalki-10y.pages.dev', 'https://.kalki-10y.pages.dev', 'https://kalki-10y.pages.dev:8443', 'https://kalki-10y.pages.dev@evil.com', 'http://localhost:8788'])
    assert.equal(originOk(o, {}), false, String(o));
  assert.equal(originOk('http://localhost:8788', { ALLOW_LOCAL_ORIGIN: '1' }), true);
});
console.log(n + ' ta test o\'tdi');
