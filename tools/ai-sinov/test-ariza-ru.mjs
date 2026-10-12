// functions/api/ariza.js RU funksiyalari uchun birlik testlari: node tools/ai-sinov/test-ariza-ru.mjs
import assert from 'node:assert/strict';
import { cleanTextRu, validateRu, hasLawRefRu, cleanText, validate, genderNeutral, factOkRu, yearOkRu, stripInventedYear } from '../../functions/api/ariza.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('OK  ' + name); };
const BODY = 'Прошу предоставить мне отпуск без сохранения заработной платы на 3 дня, с [дата] по [дата]. Дела, которые необходимо выполнить в этот период, я заранее передам коллеге [Ф.И.О.].';
t('RU tozalash: shapka, sarlavha va murojaat qatorlari olib tashlanadi', () => {
  const raw = 'Директору ООО «Ромашка»\n\nот [Ф.И.О.]\n\nЗаявление\n\nУважаемый директор,\n\n' + BODY;
  assert.equal(cleanTextRu(raw), BODY);
  assert.equal(cleanTextRu('Кому: директору школы\nОт кого: [Ф.И.О.]\n\n' + BODY), BODY);
});
t('RU tozalash: kirish qatori ":" bilan tugasa olib tashlanadi', () => {
  assert.equal(cleanTextRu('Текст заявления:\n\n' + BODY), BODY);
  assert.equal(cleanTextRu('Вот текст для вас:\n' + BODY), BODY);
});
t('RU tozalash: birinchi jumla ichidagi murojaat', () => {
  assert.equal(cleanTextRu('Уважаемый директор, я прошу отпуск на три дня.\n\nВторой абзац.'), 'Я прошу отпуск на три дня.\n\nВторой абзац.');
});
t('RU tozalash: yakuniy qatorlar (С уважением, Дата, Подпись)', () => {
  assert.equal(cleanTextRu(BODY + '\n\nС уважением,\n[Ф.И.О.]\nДата: [дата]\nПодпись: ____'), BODY);
});
t('RU tozalash: takroriy yakuniy jumla ("прошу" 2+ marta)', () => {
  const a = 'Прошу уволить меня по собственному желанию с [дата].\n\nПрошу удовлетворить мою просьбу.';
  assert.equal(cleanTextRu(a), 'Прошу уволить меня по собственному желанию с [дата].');
  const b = 'Прошу выдать справку.\n\nПрошу также подготовить копию приказа.';
  assert.equal(cleanTextRu(b), b);   // umumiy yakun emas — tegilmaydi
  assert.equal(cleanTextRu('Прошу выдать справку с места работы.\n\nПрошу удовлетворить мою просьбу.'), 'Прошу выдать справку с места работы.');
});
t('RU tozalash: markdown belgilari', () => {
  assert.equal(cleanTextRu('**Текст**\n' + BODY).includes('**'), false);
});
t('RU tekshiruv: lotin harfi qolsa yaroqsiz', () => {
  assert.equal(validateRu(BODY), null);
  assert.equal(validateRu(BODY + ' Word'), 'lotin');
  assert.equal(validateRu(BODY.replace('отпуск', 'otпуск')), 'lotin');
});
t('RU tekshiruv: qonun havolasi', () => {
  for (const s of ['согласно статье 12 Трудового кодекса', 'ст. 99', 'Закон Республики Узбекистан', 'закон об алиментах', 'закон «О труде»', 'постановление № 45', 'приказ 12', 'Кодекс'])
    assert.equal(hasLawRefRu(s), true, s);
  for (const s of ['законный представитель', 'в установленном законом порядке', 'в соответствии с законом', 'прошу предоставить отпуск', 'решение вопроса', 'номер телефона'])
    assert.equal(hasLawRefRu(s), false, s);
  assert.equal(validateRu(BODY + ' Согласно статье 5 закона.'), 'qonun');
});
t('RU tekshiruv: murojaat va so\'z soni', () => {
  assert.equal(validateRu('Уважаемый директор, ' + Array(40).fill('слово').join(' ')), 'murojaat');
  assert.equal(validateRu('Прошу отпуск.'), 'soz');
  assert.equal(validateRu(Array(160).fill('слово').join(' ')), 'soz');
  assert.equal(validateRu(''), 'bosh');
});
t('UZ funksiyalari o\'zgarmagan (regressiya)', () => {
  assert.equal(validate('Hurmatli direktor, ' + Array(40).fill("so'z").join(' ')), 'murojaat');
  assert.equal(cleanText('Hurmatli direktor,\n\nFarzandim kasal bo\'ldi.'), "Farzandim kasal bo'ldi.");
});
t('RU: fakt to\'qimasin (отпуск turi aytilmagan bo\'lsa «без сохранения» yaroqsiz)', () => {
  assert.equal(factOkRu('Прошу предоставить отпуск без сохранения заработной платы.', 'Прошу отпуск с 1 по 14 ноября, ухаживать за мамой'), false);
  assert.equal(factOkRu('Прошу предоставить мне очередной отпуск.', 'нужен отпуск'), false);
  assert.equal(factOkRu('Прошу предоставить мне отпуск с [дата] по [дата].', 'Прошу отпуск с 1 по 14 ноября, ухаживать за мамой'), true);
  assert.equal(factOkRu('Прошу предоставить отпуск без сохранения заработной платы.', 'хочу отпуск за свой счёт'), true);
});
t('RU: jinssiz shakl — «готов», «согласен» ga (а)/(на) qo\'shiladi', () => {
  assert.equal(genderNeutral('Готов предоставить документы. Согласен на условия. Уведомлён о сроках.'), 'Готов(а) предоставить документы. Согласен(на) на условия. Уведомлён(а) о сроках.');
  assert.equal(genderNeutral('Готов(а) и готова, готовность'), 'Готов(а) и готова, готовность');
  assert.equal(cleanTextRu('Прошу отпуск на 3 дня. Готов предоставить документы.').includes('Готов(а)'), true);
});
t('RU: yil — faqat joriy/keyingi yil yoki foydalanuvchi yozgan yil', () => {
  assert.equal(yearOkRu('с 1 по 14 ноября 2026 г.', 'с 1 ноября', '2026-10-12'), true);
  assert.equal(yearOkRu('с 1 ноября 2025 г.', 'с 1 ноября', '2026-10-12'), false);
  assert.equal(yearOkRu('с 1 ноября [год]', 'с 1 ноября', '2026-10-12'), true);
  assert.equal(yearOkRu('в 2024 году', 'в 2024 году болел', '2026-10-12'), true);
  assert.equal(yearOkRu('с [__] по [__] октября 2026 г.', 'нужен отпуск на 3 дня', '2026-10-12'), false);   // sana aytilmagan — yil qo\'shilmasin
});
t('RU: sana aytilmagan bo\'lsa "[дата] 2026 г." dan yil olib tashlanadi', () => {
  assert.equal(stripInventedYear('с [дата] по [дата] 2026 г. сроком 5 дней', 'отпуск на 5 дней'), 'с [дата] по [дата] сроком 5 дней');
  assert.equal(stripInventedYear('с 1 по 14 ноября 2026 г.', 'с 1 ноября'), 'с 1 по 14 ноября 2026 г.');
  assert.equal(stripInventedYear('по [__] октября 2026 г.', 'отпуск на 3 дня'), 'по [__] октября 2026 г.');   // oy yozilgan — yilOk rad etadi
});
console.log(n + ' ta test o\'tdi');
