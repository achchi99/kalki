// 6-bosqich: lotin/kirill 6 vaziyat + limit xabarlari. node tools/ai-sinov/test-6.mjs <origin> [limit]
import { validate, cleanText } from '../../functions/api/ariza.js';
const P = process.argv[2], MODE = process.argv[3] || 'vaziyat';
const RUN = Date.now() % 100000;
let n = 0;
const post = async (body, ip) => {
  const r = await fetch(P + '/api/ariza', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: P, 'CF-Connecting-IP': '10.6.' + RUN + '.' + (ip ?? ++n) }, body: JSON.stringify(body) });
  return { s: r.status, j: await r.json() };
};
if (MODE === 'vaziyat') {
  const CASES = [
    ['lotin', "kvartira ijarasini muddatidan oldin bekor qilmoqchiman, uy egasiga yozishim kerak"],
    ['lotin', "gaz hisobimda xato bor, ko'p yozib qo'yishgan, qayta hisoblashni so'rayman"],
    ['lotin', "farzandimni boshqa maktabga o'tkazmoqchiman, ko'chib o'tdik"],
    ['kirill', 'Ишга кириш ҳақида ариза'],
    ['kirill', 'Ишга 3 кун бора олмайман, иш ҳақим ҳисобланмаган ҳолда'],
    ['kirill', "kirillcha yozib ber: ishga kirmoqchiman, haydovchi lavozimiga"]
  ];
  let bad = 0;
  for (let i = 0; i < CASES.length; i++) {
    const [y, v] = CASES[i];
    const r = await post({ vaziyat: v, yozuv: y });
    const t = r.j.matn || '';
    const lat = (t.match(/[A-Za-z]/g) || []).length, cyr = (t.match(/[Ѐ-ӿ]/g) || []).length;
    const words = t.trim().split(/\s+/).filter(Boolean).length;
    const ok = r.s === 200 && (y === 'kirill' ? lat === 0 && cyr > 20 : cyr === 0 && lat > 20) && !/hurmatli|хурматли/i.test(t) && words >= 25 && words <= 150;
    if (!ok) bad++;
    console.log(`#${i + 1} [${y}] ${r.s} ${ok ? 'OK' : 'TEKSHIR'} so'z=${words} lotin_harf=${lat} kirill_harf=${cyr}\n>>> ${v}\n${t || JSON.stringify(r.j)}\n<<<`);
  }
  console.log(bad ? bad + ' ta TEKSHIR' : 'hammasi o\'tdi');
} else {
  const A = 'aaaaaaaa-1111-4111-8111-' + String(RUN).padStart(12, '0'), B = 'bbbbbbbb-2222-4222-8222-' + String(RUN).padStart(12, '0');
  const v = { vaziyat: "hokimiyatga ariza: ko'chamizda 2 oydan beri chiroq yo'q", yozuv: 'lotin' };
  const out = [];
  out.push(['A#1', (await post({ ...v, mijoz_id: A }, 1)).s]);
  out.push(['A#2', (await post({ ...v, mijoz_id: A }, 2)).s]);
  const a3 = await post({ ...v, mijoz_id: A }, 3);
  out.push(['A#3 (limit 2)', a3.s, a3.j.sabab, a3.j.xato]);
  out.push(['B#1 boshqa ID', (await post({ ...v, mijoz_id: B }, 4)).s]);
  const bad = await post({ ...v, mijoz_id: 'noto\'g\'ri-format' }, 5);
  out.push(['yaroqsiz ID (faqat IP)', bad.s]);
  const bad2 = await post({ ...v, mijoz_id: 'xxxxxxxx-1111-4111-8111-123456789012' }, 6);
  out.push(['yaroqsiz hex ID (faqat IP)', bad2.s]);
  out.forEach((o) => console.log(o.join(' | ')));
}
