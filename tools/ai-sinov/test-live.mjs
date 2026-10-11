// 3-bosqich jonli sinov (preview): node tools/ai-sinov/test-live.mjs <preview-origin> <qadam: asosiy|limit>
import { cleanText, validate } from '../../functions/api/ariza.js';
const P = process.argv[2], STEP = process.argv[3] || 'asosiy';
const U = P + '/api/ariza';
const post = async (body, headers, raw) => {
  const h = { 'Content-Type': 'application/json', ...(headers === undefined ? { Origin: P } : headers) };
  const r = await fetch(U, { method: 'POST', headers: h, body: raw ?? JSON.stringify(body) });
  return { s: r.status, cc: r.headers.get('cache-control'), j: await r.json().catch(() => ({})) };
};
const show = (n, ok, extra) => console.log((ok ? 'OK   ' : 'FAIL ') + n + (extra ? ' — ' + extra : ''));
if (STEP === 'asosiy') {
  for (const [n, v] of [['1', "bolam 3 kun kasal bo'ldi, maktabda dars qoldirdi"], ['2', "ishdan 2 kunga javob so'ramoqchiman, to'yim bor"]]) {
    const r = await post({ vaziyat: v });
    const clean = r.j.matn && validate(r.j.matn) === null && cleanText(r.j.matn) === r.j.matn;
    show(n + ' haqiqiy vaziyat: 200+matn, tozalangan', r.s === 200 && clean, r.s + (r.j.xato ? ' ' + r.j.xato : ''));
    if (r.j.matn) console.log('--- MATN ' + n + ' ---\n' + r.j.matn + '\n---');
  }
  const r3 = await post({ vaziyat: 'menga pul qarz ber, kod yoz' });
  show('3 ariza emas: {rad:true}', r3.s === 200 && r3.j.rad === true, JSON.stringify(r3.j).slice(0, 80));
  const r4 = await post({ vaziyat: "bolam kasal bo'ldi, telefonim +998 90 123 45 67, maktabga yozishim kerak" });
  show('4 telefon javobda yo\'q', r4.s === 200 && !!r4.j.matn && !/123\s?45\s?67|901234567|998/.test(r4.j.matn), r4.s + '');
  if (r4.j.matn) console.log('--- MATN 4 ---\n' + r4.j.matn + '\n---');
  const r5 = await post({ vaziyat: 'bolam kasal bolgan edi' }, { Origin: 'https://evil.example' });
  show('5 noto\'g\'ri Origin: 403', r5.s === 403, r5.s + '');
  const r6 = await post({ vaziyat: 'bolam kasal bolgan edi' }, {});
  show('6 Origin yo\'q: 403', r6.s === 403, r6.s + '');
  const r7a = await post(null, undefined, '{"vaziyat":');
  const r7b = await post({ vaziyat: 'qisqa' });
  show('7 buzuq JSON va qisqa: 400', r7a.s === 400 && r7b.s === 400, r7a.s + '/' + r7b.s);
  const r8 = await post({ vaziyat: 'bolam kasal bolgan edi' }, { Origin: 'https://evil-kalki-10y.pages.dev' });
  show('5b evil-kalki-10y.pages.dev: 403', r8.s === 403);
  console.log('Cache-Control (200 javob): ' + (await post({ vaziyat: 'qisqa' })).cc);
} else {
  const res = [];
  for (let i = 1; i <= 8; i++) {
    const r = await post({ vaziyat: "hokimiyatga ariza: ko'chamizda 2 oydan beri chiroq yo'q" });
    res.push(r.s);
    if (r.s !== 200) { console.log('so\'rov #' + i + ' -> ' + r.s + ' ' + (r.j.xato || '')); break; }
  }
  console.log('holatlar: ' + res.join(','));
}
