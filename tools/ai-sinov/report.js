#!/usr/bin/env node
// out/results.json dan docs/ai-sinov-2026-10.md hisobotini yig'adi (API'ga so'rov yubormaydi).
'use strict';
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out');
const R = JSON.parse(fs.readFileSync(path.join(OUT, 'results.json'), 'utf8'));
const D = JSON.parse(fs.readFileSync(path.join(OUT, 'haiku-thinking-default.json'), 'utf8'));
const src = fs.readFileSync(path.join(__dirname, 'run.js'), 'utf8');
const CASES = eval(src.match(/const CASES = (\[[\s\S]*?\n\]);/)[1]);
const M = [
  { id: 'haiku', label: 'Claude Haiku 5.5 (`claude-haiku-5-5`)', in: 0.10, out: 0.50 },
  { id: 'gemini', label: 'Gemini 3.1 Flash-Lite (`gemini-3.1-flash-lite`)', in: 0.25, out: 1.50 },
];
const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
const ok = x => !x.error;
const CK = [['pii_yoq', '12: ism/telefon tushmadi'], ['rad_etildi', '13–14: aynan RAD_ETILDI'], ['modda_yoq', 'modda/qaror/son havolasi yo\'q'],
  ['soz_40_120', 'so\'z soni 40–120'], ['kirill_yoq', 'kirill yo\'q'], ['rekvizit_yoq', 'Kimga/Kimdan/imzo yo\'q']];

let md = fs.readFileSync(path.join(__dirname, 'deploy-xulosa.md'), 'utf8').trim() + '\n\n';

md += `## 2. Narx va tezlik\n\nSinov sanasi: 2026-10-11. Har holat har modelga 1 marta yuborilgan (14 × 2 = 28 so'rov), temperature 0.3 (Haiku bundan mustasno — 5-bo'lim), max chiquvchi token 600.\n\n`;
md += `Narx manbalari (joriy narx, 2026-10-11 da o'qildi):\n- Anthropic: https://platform.claude.com/docs/en/about-claude/pricing — Haiku 5.5: kirish $0,10 / chiqish $0,50 (1M token, prompt ≤100k).\n- Google: https://ai.google.dev/gemini-api/docs/pricing (sahifa "yangilangan 2026-10-09") — gemini-3.1-flash-lite: kirish $0,25 / chiqish $1,50 (1M token, chiqishga "thinking" ham kiradi). Eslatma: sahifada \`gemini-3.5-flash-lite\` ham bor ($0,30 / $2,50) — qimmatroq, shuning uchun 3.1 olindi.\n\n`;
md += `| model | o'rtacha token (kirish/chiqish) | o'rtacha vaqt | 1 so'rov narxi | 1000 so'rov narxi |\n|---|---|---|---|---|\n`;
for (const m of M) {
  const a = R[m.id]; if (!a) { md += `| ${m.label} | o'tkazib yuborildi (kalit yo'q) | | | |\n`; continue; }
  const g = a.filter(ok), c = avg(g.map(x => x.cost));
  md += `| ${m.label} | ${avg(g.map(x => x.tin)).toFixed(0)} / ${avg(g.map(x => x.tout)).toFixed(0)} | ${avg(g.map(x => x.secs)).toFixed(2)} s | $${c.toFixed(5)} | $${(c * 1000).toFixed(2)} |\n`;
}
const total = M.reduce((s, m) => s + (R[m.id] || []).reduce((t, x) => t + x.cost, 0), 0) + D.reduce((t, x) => t + x.cost, 0);
md += `\nUmumiy sinov xarajati (Haiku'ning sukut-thinking yurishi bilan birga, hisoblangan): $${total.toFixed(4)} (limit $0,10).\n\n`;

md += `## 3. Avtomatik tekshiruvlar\n\n"o'tdi / tekshirilgan holatlar". So'z soni, modda, kirill, rekvizit tekshiruvlari 1–12-holatlarga qo'llanadi; 12-holatda ism/telefon, 13–14-holatlarda RAD_ETILDI tekshiriladi.\n\n`;
md += `| tekshiruv | ${M.map(m => m.label.split(' (')[0]).join(' | ')} |\n|---|${M.map(() => '---').join('|')}|\n`;
for (const [k, name] of CK) {
  md += `| ${name} | ` + M.map(m => { const a = R[m.id]; if (!a) return '—'; const v = a.map(x => x.checks[k]).filter(x => x !== undefined); return `${v.filter(Boolean).length} / ${v.length}`; }).join(' | ') + ' |\n';
}
md += `\nOgohlantirish: avtomatik tekshiruvlar faqat shakliy belgilarni ushlaydi (regex). "modda/qaror/son" tekshiruvi \`modda|qaror|PF-|son + raqam|№\` bo'yicha; matn ma'nosi, o'zbek tili sifati tekshirilmagan — buni siz baholaysiz.\n\nQo'lda ko'zdan kechirilgan regex natijalari (faqat shakliy, sifat bahosi emas): Gemini #4 "modda" belgisi **soxta signal** ("ijobiy qaror qabul qilishingizni" — qonun havolasi emas); Gemini #6 **haqiqiy** ("Mehnat kodeksining tegishli moddalariga asosan" — raqamsiz, lekin qonun havolasi); Haiku #1, #3, #4, #6 **haqiqiy** (matn oxirida "Imzo: ____" qatori).\n\n`;
const fails = [];
for (const m of M) (R[m.id] || []).forEach((x, i) => { const bad = Object.entries(x.checks).filter(([, v]) => !v).map(([k]) => k); if (bad.length) fails.push(`${m.id} #${i + 1}: ${bad.join(', ')}`); });
md += `O'tmagan holatlar: ${fails.length ? fails.join('; ') : 'yo\'q'}.\n\n`;

md += `## 4. Yonma-yon matnlar\n\n`;
CASES.forEach((c, i) => {
  md += `### ${i + 1}-holat\n\n> ${c}\n\n`;
  for (const m of M) {
    const x = (R[m.id] || [])[i];
    md += `**${m.label.split(' (')[0]}**` + (x ? ` — ${x.error ? 'XATO' : `${x.tin}/${x.tout} token, ${x.secs.toFixed(2)} s, ${wc(x.text)} so'z`}` : ' — o\'tkazib yuborildi') + `\n\n`;
    md += '```text\n' + (x ? (x.error || x.text.trim()) : '') + '\n```\n\n';
    md += `Baho (1–5): __  Izoh: __\n\n`;
  }
});
function wc(t) { return t.trim().split(/\s+/).filter(Boolean).length; }

const trunc = D.filter(x => x.stop === 'max_tokens').length, empty = D.filter(x => !x.text.trim()).length;
md += `## 5. Kuzatilgan texnik muammolar\n\n`;
md += `1. **Haiku 5.5 sukut bo'yicha yashirin "thinking" qiladi.** Birinchi yurishda (faqat max_tokens 600, thinking sozlanmagan) 14 holatdan ${trunc} tasi \`max_tokens\` bilan uzilgan, ${empty} tasida matn umuman bo'sh (barcha 600 token thinking'ga ketgan: \`thinking_tokens: 600\`), qolganlari yarim matn. Bu yurish narxi $${D.reduce((t, x) => t + x.cost, 0).toFixed(5)}, xom natija \`out/haiku-thinking-default.json\` da (commitda yo'q). Jadval va matnlar \`thinking: {type: "disabled"}\` bilan qayta yurgizilgan yurishdan olingan. Ya'ni tizimga ulashda Haiku uchun thinking'ni aniq o'chirish kerak (yoki max_tokens'ni oshirish — bu narxni oshiradi).\n`;
md += `2. **Haiku 5.5 \`temperature\` ni rad etadi:** HTTP 400 \`"temperature" is deprecated for this model\`. Shuning uchun Haiku 0.3 harorat bilan sinalmadi — sukut harorat ishlatilgan. Bu topshiriqdagi shartdan chetga chiqish; modellar to'liq bir xil sharoitda emas.\n`;
const g = R.gemini || [], gt = g.filter(x => x.think > 0);
md += `3. **Gemini:** ${g.filter(x => x.error).length} xato; \`finishReason\` STOP bo'lmagan: ${g.filter(x => x.stop && x.stop !== 'STOP').length}; "thinking" tokenlari ishlatilgan holatlar: ${gt.length} (thinking chiqish narxiga qo'shiladi). Eng sekin javob: ${Math.max(...g.map(x => x.secs)).toFixed(2)} s, eng tez: ${Math.min(...g.map(x => x.secs)).toFixed(2)} s — vaqtlar bir martalik o'lchov, o'zgaruvchan.\n`;
const h = R.haiku || [];
md += `4. **Haiku (thinking o'chiq):** ${h.filter(x => x.error).length} xato; eng sekin ${Math.max(...h.map(x => x.secs)).toFixed(2)} s, eng tez ${Math.min(...h.map(x => x.secs)).toFixed(2)} s.\n`;
md += `5. Topshiriqda "uchala model" deyilgan, lekin ro'yxatda faqat ikkita model (Haiku 5.5, Gemini Flash-Lite) bor edi — ikkitasi sinaldi. Uchinchisini qo'shish uchun \`tools/ai-sinov/run.js\` dagi \`MODELS\` ro'yxatiga qo'shish kifoya.\n`;
md += `6. Hech qanday kalit/rate-limit xatosi uchramadi (yuqoridagi xato sonlariga qarang). Bir martalik 28 so'rov rate-limitni sinash uchun yetarli emas.\n`;
fs.writeFileSync(path.join(__dirname, '..', '..', 'docs', 'ai-sinov-2026-10.md'), md);
console.log('docs/ai-sinov-2026-10.md yozildi,', md.length, 'belgi');
