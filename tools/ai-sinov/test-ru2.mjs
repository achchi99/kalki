// RU tuzatishlari (fakt to'qimasin, jinssiz shakl, yil): node tools/ai-sinov/test-ru2.mjs [BASE]  -> out/ru2.json
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url)); const BASE = process.argv[2] || 'http://localhost:8799';
const C = [
  ['1: fakt', 'Прошу отпуск с 1 по 14 ноября, ухаживать за мамой'],
  ['2: jins', 'хочу уволиться по собственному желанию, могу передать дела и предоставить документы'],
  ['3: yil', 'отпуск с 1 ноября по 14 ноября'],
  ['4: ta\'til turi aytilmagan', 'нужен отпуск на 3 дня по семейным обстоятельствам'],
  ['5: ma\'lumotnoma', 'нужна справка с места работы для посольства'],
  ['6: moddiy yordam', 'прошу материальную помощь, у ребёнка болезнь, лечение дорогое'],
  ['7: ishdan bo\'shash', 'увольнение с должности бухгалтера, последний рабочий день 20 ноября'],
  ['8: ta\'til ko\'chirish', 'хочу перенести отпуск на декабрь']
];
let ip = 0; const out = [];
for (const [nom, vaz] of C) { ip++; const r = await fetch(BASE + '/api/ariza', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASE, 'CF-Connecting-IP': '10.66.' + (Date.now() % 250) + '.' + ip }, body: JSON.stringify({ vaziyat: vaz, til: 'ru' }) });
  const j = await r.json().catch(() => ({})); const m = j.matn || '';
  const chk = { status: r.status, bezSohr: /без\s+сохранени/i.test(m) && !/сохранени|свой\s+сч/i.test(vaz) ? 'BOR(!)' : "yo'q", birJins: /(?<![а-яё])(готов|согласен|уведомлён|ознакомлен|вынужден)(?![а-яё(])/i.test(m) ? 'BOR(!)' : "yo'q", yillar: (m.match(/20\d\d/g) || []).join(',') || '-', godBracket: /\[год\]/.test(m) };
  out.push({ nom, vaz, matn: m, xato: j.xato, rad: j.rad, chk }); console.log(nom, JSON.stringify(chk)); }
fs.writeFileSync(path.join(dir, 'out', 'ru2.json'), JSON.stringify(out, null, 1));
