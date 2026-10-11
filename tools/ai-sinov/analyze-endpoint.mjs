// out/endpoint.json va 1-bosqich xom natijalaridan jadval chiqaradi (stdout, markdown).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanText } from '../../functions/api/ariza.js';
const dir = path.dirname(fileURLToPath(import.meta.url));
const E = JSON.parse(fs.readFileSync(path.join(dir, 'out', 'endpoint.json'), 'utf8'));
const S1 = JSON.parse(fs.readFileSync(path.join(dir, 'out', 'results.json'), 'utf8')).haiku;
const wc = (t) => t.trim().split(/\s+/).filter(Boolean).length;
// 1-bosqichdagi aynan o'sha tekshiruvlar
const CK = {
  pii: (t) => !/karimov|aziz|901234567/i.test(t),
  modda: (t) => !/modda|qaror|PF-|\bson\s*\d|\d+\s*-?\s*son\b|№/i.test(t),
  soz: (t) => wc(t) >= 40 && wc(t) <= 120,
  kirill: (t) => !/[Ѐ-ӿ]/.test(t),
  rekv: (t) => !/^\s*(kimga|kimdan)\b|hurmat bilan|\bimzo\b/im.test(t)
};
function table(texts) {
  const r = { pii: [0, 0], modda: [0, 0], soz: [0, 0], kirill: [0, 0], rekv: [0, 0], rad: [0, 0] };
  texts.forEach((t, i) => {
    const n = i + 1;
    if (n === 12) { r.pii[1]++; if (CK.pii(t)) r.pii[0]++; }
    if (n >= 13) { r.rad[1]++; if (t.trim() === 'RAD_ETILDI') r.rad[0]++; return; }
    for (const k of ['modda', 'soz', 'kirill', 'rekv']) { r[k][1]++; if (CK[k](t)) r[k][0]++; }
  });
  return r;
}
const raw = S1.map((x) => x.text), cleaned = raw.map((t, i) => (i < 12 ? cleanText(t) : t));
const live = E.map((x) => (x.rad ? 'RAD_ETILDI' : x.matn || ''));
const A = table(raw), B = table(cleaned), C = table(live);
const f = (a) => a[0] + ' / ' + a[1];
console.log('| tekshiruv | 1-bosqich (xom) | 1-bosqich matni + tozalash | endpoint (jonli) |\n|---|---|---|---|');
for (const [k, name] of [['pii', '12: ism/telefon tushmadi'], ['rad', '13–14: RAD_ETILDI'], ['modda', 'modda/qaror/son havolasi yo\'q'], ['soz', 'so\'z soni 40–120'], ['kirill', 'kirill yo\'q'], ['rekv', 'Kimga/Kimdan/imzo yo\'q']])
  console.log(`| ${name} | ${f(A[k])} | ${f(B[k])} | ${f(C[k])} |`);
console.log('\ntozalash o\'zgartirgan holatlar (1-bosqich matnlari): ' + cleaned.map((t, i) => (i < 12 && t !== raw[i].trim() ? i + 1 : 0)).filter(Boolean).join(', '));
console.log('endpoint so\'z soni: ' + E.slice(0, 12).map((x) => wc(x.matn || '')).join(', '));
console.log('endpoint o\'rtacha vaqt: ' + (E.reduce((s, x) => s + x.secs, 0) / E.length).toFixed(2) + ' s');
