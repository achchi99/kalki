// 4-bosqich: 5 ta yangi vaziyat. node tools/ai-sinov/test-5.mjs <origin>
import { validate, cleanText } from '../../functions/api/ariza.js';
const P = process.argv[2];
const CASES = [
  "kvartira ijarasini muddatidan oldin bekor qilmoqchiman, uy egasiga yozishim kerak",
  "farzandimni boshqa maktabga o'tkazmoqchiman, ko'chib o'tdik",
  "o'z xohishim bilan ishdan bo'shamoqchiman",
  "gaz hisobimda xato bor, ko'p yozib qo'yishgan, qayta hisoblashni so'rayman",
  "bolalar bog'chasiga joy so'rab ariza",
  "bolam 3 kun kasal bo'ldi, maktabda dars qoldirdi",
  "ishdan 2 kunga javob so'ramoqchiman, to'yim bor"
];
// foydalanuvchi aytmagan lavozim/muassasa/shaxs belgilari
const GUESS = /direktor|rahbar|hokim|mudir|rektor|dekan|prezident|vazir|boshliq|ma'muriyat|bog'cha(?!siga)|maktab|korxona|tashkilot nomi\]?\s*(?:direktori)/i;
let bad = 0;
for (let i = 0; i < CASES.length; i++) {
  const r = await fetch(P + '/api/ariza', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: P, 'CF-Connecting-IP': '10.4.' + (Date.now() % 100000) + '.' + i }, body: JSON.stringify({ vaziyat: CASES[i] }) });
  const j = await r.json();
  const t = j.matn || '';
  const words = t.trim().split(/\s+/).filter(Boolean).length;
  const sor = (t.match(/so'rayman/gi) || []).length;
  const c = {
    hurmatli: !/hurmatli/i.test(t), sorayman: sor <= 1, qonun_kirill: validate(t) === null && cleanText(t) === t,
    soz: words >= 25 && words <= 150
  };
  const g0 = (t.match(GUESS) || [])[0] || null;
  const guess = g0 && !CASES[i].toLowerCase().includes(g0.toLowerCase().slice(0, 5)) ? g0 : null;
  const intro = /lavozimida|ishlab kelmoqdaman|ishlayman|ishlab turaman/i.test(t) ? 'tanishtiruv' : null;
  const preface = /:\s*$/.test(t.split('\n')[0].trim()) || /ariza matni/i.test(t.split('\n')[0]);
  const ok = r.status === 200 && c.hurmatli && c.qonun_kirill && !preface; // 5-bosqich o'tish sharti
  if (!ok) bad++;
  console.log(`#${i + 1} [${r.status}] ${ok ? 'OK' : 'TEKSHIR'} so'z=${words} so'rayman=${sor} hurmatli=${!c.hurmatli} qonun/kirill/tozalangan=${c.qonun_kirill} taxmin=${guess} tanishtiruv=${intro} izoh_qatori=${preface}`);
  console.log('>>> ' + CASES[i] + '\n' + (t || JSON.stringify(j)) + '\n<<<');
}
console.log(bad ? bad + ' ta TEKSHIR' : 'hammasi o\'tdi');
