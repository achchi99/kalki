// RU AI ariza: 8 ruscha holat + rad etish + UZ regressiya (3 holat) — jonli /api/ariza (wrangler pages dev) orqali.
//   node tools/ai-sinov/test-ru.mjs [http://localhost:8799]     Natija: tools/ai-sinov/out/ru.json (gitignore'da)
// Har so'rovga alohida soxta IP (limit aralashmasin). Kalit repoga yozilmaydi (.dev.vars).
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { _test } from '../../functions/api/ariza.js';
const dir = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://localhost:8799';
const RU = [
  ['ta\'til', 'хочу взять отпуск за свой счёт на 5 дней, нужно поехать в другой город по семейным делам', 'ruxsat'],
  ['ishdan bo\'shash', 'хочу уволиться по собственному желанию, работаю менеджером', null],
  ['moddiy yordam', 'мне нужна материальная помощь, тяжёлое финансовое положение, в семье трое детей', 'yordam'],
  ['ma\'lumotnoma', 'нужна справка с места работы для банка, чтобы оформить кредит', 'malumotnoma'],
  ['o\'qishga qabul', 'хочу подать заявление на поступление в университет на факультет экономики', 'universitet'],
  ['uy-joy', 'хочу встать на очередь для улучшения жилищных условий: семья из четырёх человек живёт в однокомнатной квартире', null],
  ['aliment', 'хочу подать на алименты, бывший муж не платит содержание на ребёнка', null],
  ['erkin mavzu', 'нужно попросить школу перевести ребёнка в другой класс, потому что он конфликтует с одноклассниками', null]
];
const EXTRA = [
  ['rad: she\'r', 'напиши мне стихотворение про осень в Ташкенте', 'rad'],
  ['PII niqobi', 'хочу отпуск на неделю, мой телефон +998 90 123 45 67, паспорт AA1234567, ПИНФЛ 12345678901234', 'pii']
];
const UZ = [
  ['uz: bola kasal', "bolam 3 kun kasal bo'ldi, maktabga yozishim kerak"],
  ['uz: ishdan 2 kun', "ishdan 2 kunga javob so'ramoqchiman, to'yim bor"],
  ['uz: kirill yozuv', "o'z xohishim bilan ishdan bo'shamoqchiman", 'kirill']
];
let ip = 0;
async function call(body) {
  const t0 = Date.now(); ip++;
  const r = await fetch(BASE + '/api/ariza', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASE, 'CF-Connecting-IP': '10.77.' + (Date.now() % 250) + '.' + ip }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({})); return { status: r.status, secs: +((Date.now() - t0) / 1000).toFixed(2), ...j };
}
const words = (t) => (t || '').trim().split(/\s+/).filter(Boolean).length;
const out = { ru: [], extra: [], uz: [] };
for (const [nom, vaz, turi] of RU) {
  const body = { vaziyat: vaz, til: 'ru' }; if (turi && !['rad', 'pii'].includes(turi)) body.turi = turi;
  const r = await call(body); const m = r.matn || '';
  const chk = { status200: r.status === 200, rad: !!r.rad, matn: !!m, lotinYoq: !/[A-Za-z]/.test(m), qonunYoq: !_test.hasLawRefRu(m), murojaatYoq: !/^\s*(уважаем|здравств)/i.test(m), soz: words(m), bosh: /\[[^\]]+\]/.test(m) };
  out.ru.push({ nom, vaz, turi: turi || '-', status: r.status, secs: r.secs, matn: m, xato: r.xato, chk }); console.log(`${nom}: ${r.status}${r.rad ? ' RAD(!)' : ''} ${words(m)} so'z ${r.secs}s lotin:${chk.lotinYoq ? 'yo\'q' : 'BOR'} qonun:${chk.qonunYoq ? 'yo\'q' : 'BOR'}`);
}
for (const [nom, vaz, k] of EXTRA) { const r = await call({ vaziyat: vaz, til: 'ru' }); out.extra.push({ nom, vaz, status: r.status, rad: r.rad, matn: r.matn, xato: r.xato }); console.log(`${nom}: ${r.status} ${r.rad ? 'RAD' : words(r.matn) + ' so\'z'}`); }
for (const [nom, vaz, yoz] of UZ) { const body = { vaziyat: vaz }; if (yoz) body.yozuv = yoz; const r = await call(body); const m = r.matn || '';
  const chk = { status200: r.status === 200, soz: words(m), kirillYoq: yoz ? true : !/[Ѐ-ӿ]/.test(m), kirillBor: yoz ? /[Ѐ-ӿ]/.test(m) : null, hurmatliYoq: !/^\s*hurmatli/i.test(m) };
  out.uz.push({ nom, vaz, status: r.status, secs: r.secs, matn: m, xato: r.xato, chk }); console.log(`${nom}: ${r.status} ${words(m)} so'z ${r.secs}s`); }
fs.mkdirSync(path.join(dir, 'out'), { recursive: true }); fs.writeFileSync(path.join(dir, 'out', 'ru.json'), JSON.stringify(out, null, 1));
