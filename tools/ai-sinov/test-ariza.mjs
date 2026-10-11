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
t('tozalash: oddiy matn o\'zgarmaydi, "Hurmatli" qoladi', () => {
  const s = 'Hurmatli direktor!\n\nFarzandim kasal bo\'ldi.\n\nIltimosimni qanoatlantirishingizni so\'rayman.';
  assert.equal(cleanText(s), s);
  assert.equal(cleanText('Men ish haqi ma\'lumotnomasini berishingizni so\'rayman'), 'Men ish haqi ma\'lumotnomasini berishingizni so\'rayman');
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
  for (const o of ['https://kalki.uz', 'https://www.kalki.uz', 'https://kalki.pages.dev', 'https://ai-ariza.kalki.pages.dev'])
    assert.equal(originOk(o, {}), true, o);
  for (const o of ['', null, 'http://kalki.uz', 'https://evil.com', 'https://kalki.uz.evil.com', 'https://evilkalki.pages.dev', 'http://localhost:8788'])
    assert.equal(originOk(o, {}), false, String(o));
  assert.equal(originOk('http://localhost:8788', { ALLOW_LOCAL_ORIGIN: '1' }), true);
});
console.log(n + ' ta test o\'tdi');
