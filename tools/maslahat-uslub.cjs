#!/usr/bin/env node
/* KalkiFit maslahatchi/hazil matnlari — USLUB QOIDALARI (docs/maslahatchi-uslub.md). Bitta manba: testlar (test-maslahatchi, test-kalkifit-hazil) va qo'lda tekshiruv.
 *   node tools/maslahat-uslub.cjs [fayl.json ...]   — maslahatchi formati ({uz:{hazil:{kalit:[...]}}}) yoki hazillar formati ({items:[{uz,ru}]}); standart: data/maslahatchi-matn.json
 * Tekshiradi: taqiqlangan sun'iy iboralar (TAQIQ), BAN so'zlar, uzunlik (≤ 200), gap soni (≤ 2; hazilda emoji/undov bilan ≤ 3), emoji (hazil ≤ 1, jiddiy 0),
 * til aralashuvi (uz — kirill yo'q, ru — o'zbekcha-lotin so'z yo'q), maslahatchi formatida: ≥ 3 variant, placeholder (asl manbadagi kalit bilan: hamma variantlarda bo'lgani — majburiy, boshqasi — faqat ruxsat etilgani), hazil↔jiddiy Jaccard ≤ 0,5. */
'use strict';
const fs = require('fs'), path = require('path');
/* taqiqlangan sun'iy iboralar — tarjima hidi va tushunarsiz metaforalar (foydalanuvchi namunalari + 2026-11 tozalashda topilganlar) */
const TAQIQ = {
  uz: [/rasmi to'liq/i, /prognoz/i, /shovqin/i, /sokin musiqa/i, /eshik qoq/i, /jumbo[qg]/i, /eshigida turib/i, /taqillat/i, /ostonasi/i, /sust xizmat/i, /xizmat qiladi/i, /men ham bormanku/i, /orkestr/i, /dirijyor/i, /mergan/i, /zargar/i, /soqchi/i, /qalqon/i, /jomadon/i, /dars qoldir/i, /xazina/i, /sahnaga chiq/i,
    /o'z hissasini qo'sh/i, /katta manzara/i, /navbatchilik/i, /marafon/i, /kubok/i, /final\b/i, /dirijor/i, /hakam/i, /kayfiyati o'zgaruvchan/i, /sir saqla/i, /xayr-xo'sh/i, /yo'lga chiqqan/i, /qaysarlik/i, /sayr qilib/i, /bravo/i, /qarsak/i],
  ru: [/нервно курит/i, /в л[её]гком шоке/i, /помахал[аи]? рукой/i, /собрал[аи]? чемодан/i, /прогноз/i, /пазл/i, /оркестр/i, /дирижер|дирижёр/i, /сокровищ/i, /браво/i, /аплодисмент/i, /финал/i, /марафон/i, /кубок/i, /на страже/i, /щит\b|щитом/i, /прогуливал/i, /вносит свою лепту/i, /меткий стрел/i, /ювелир/i, /дежурств/i]
};
/* BAN — tana/vazn/aybdorlik/din (tools/dizayn/test-maslahatchi.mjs bilan bir xil) */
const BAN = /semiz|ozg'in|yalqov|dangasa|ochko'z|\buyat|aybdor|gunoh|jazo|ahmoq|tentak|xunuk|figura|badan|qorin|\bsemir|vazningiz|tanangiz|\bkilo|halol|ҳалол|cho'chqa|choshqa|толст|живот|талия|фигур|ленив|обжор|стыд|позор|виноват|наказ|свин|бекон|голод|диет|переел|объел/i;
const EMOJI = /\p{Extended_Pictographic}/gu;
/* v106: MUTLAQ DA'VOLAR («oqsil yo'q», «umuman», «nol», «белка нет», «вообще») — faqat bazadagi qiymat ~0 bo'lganda to'g'ri. Matnda taom/ozuqa haqida mutlaq da'vo — YO'Q;
   haqiqatan 0 bo'lgan holat kerak bo'lsa — ABS_OK ga (kalit, ozuqa, taom id) yoziladi va test bazadan qiymat ≤ 0,5 ekanini tekshiradi */
const ABS = {
  uz: [/(oqsil|yog['’`]?|uglevod|kletchatka|tola|kaloriya|vitamin|shakar)\w*\s+(umuman\s+|mutlaqo\s+)?(yo['’`]q|yo['’`]qdir|nol)\b/i, /\bumuman\b/i, /\bmutlaqo\b/i, /\bhech qanday\s+(oqsil|yog|uglevod|kletchatka|tola|kaloriya)/i],
  ru: [/(белк\w*|жир\w*|углевод\w*|клетчатк\w*|калори\w*|сахар\w*)\s+(там\s+|в\s+нём\s+|в\s+них\s+)?(нет|ноль|нулев\w*|отсутствует|отсутствуют)(?![а-яё])/i, /(?<![а-яё])нет\s+(белка|жира|углеводов|клетчатки|калорий|сахара)/i, /(?<![а-яё])вообще(?![а-яё])/i, /(?<![а-яё])полностью отсутствует/i]
};
/* v106: tavsiya matnida QATTIQ porsiya («150 g tovuq», «2 ta tuxum», «bitta olma», «пара яиц») YO'Q — {opP}/{opZ}/{opS}/{opC}/{opF}/{opB}/{opK}/{opL} (farqdan hisoblanadi, assets/kalkifit-tavsiya.js).
   Sabzavot/salat (bodring) va «kamaytirish» maslahatlari istisno (farq yo'q). */
const QTY = {
  uz: [/\b\d+(?:[.,]\d+)?(?:–\d+)?\s?g\s+(?:pishgan |qaynatilgan |yunon |grek |qora )?(?:tvorog|tovuq|qatiq|loviya|mosh|grechka|guruch|non\b|yong|go['’`]sht|mol|baliq|pishloq|kurka|tunets|mayiz|sutli|bo['’`]tqa)/i, /\b\d+(?:–\d+)?\s?ta\s+(?:qaynatilgan\s+)?(?:tuxum|olma|banan|nok|mandarin|kartoshka)/i, /\b(?:bitta|ikkita|uchta|yarim)\s+(?:qaynatilgan\s+)?(?:tuxum|olma|banan|nok|meva)\b/i, /\bbir\s+(?:stakan|piyola)\s+qatiq/i, /\bbir\s+(?:hovuch|burda)\b/i, /\bbir\s+bo['’`]lak\s+tovuq/i, /\b\d+\s*(?:choy|osh)\s+qoshiq\b/i],
  ru: [/(?<![а-яё])\d+(?:–\d+)?\s?г\s+(?:творога|куриной|курицы|катыка|фасоли|маша|гречки|риса|хлеба|говядины|мяса|рыбы|сыра|орехов|изюма|молочной)/i, /(?<![а-яё])(?:\d+|одно|два|две|пара|пару)(?:–\d+)?\s+(?:яйц|яиц|яйцо|яблок|банан|груш)/i, /(?<![а-яё])(?:стакан|пиал\w*)\s+катыка/i, /(?<![а-яё])горсть(?![а-яё])/i, /(?<![а-яё])(?:чайную|столовую)\s+ложку/i, /(?<![а-яё])кусок\s+курицы/i]
};
function hardQty(s, L) { const t = strip(s), out = []; (QTY[L] || []).forEach((re) => { const m = t.match(re); if (m) out.push(m[0]); }); return out; }
const ABS_OK = [];          // [{ key, re, nutrient: 'p'|'f'|'c'|'fb'|'k', food: <bazadagi id> }]
function absolute(s, L) { const t = strip(s), out = []; (ABS[L] || []).forEach((re) => { const m = t.match(re); if (m) out.push(m[0]); }); return out; }
/* ru matnida ruxsat etilgan lotin so'zlar (brend/birlik) */
const RU_LAT_OK = /^(KalkiFit|Kalki|AI|Google|Telegram|PDF|CSV|ID|OK|Wi-Fi|BMI|USDA|kcal)$/;
function strip(s) { return String(s).replace(/\{[^{}]*\}/g, ' '); }
function check(s, L, mode) {
  const e = [], t = strip(s);
  (TAQIQ[L] || []).forEach((re) => { if (re.test(t)) e.push('taqiqlangan ibora ' + re); });
  if (BAN.test(t)) e.push('BAN so\'z');
  hardQty(s, L).forEach((x) => e.push('qattiq porsiya «' + x + '» — {opX} ishlating'));
  absolute(s, L).forEach((x) => e.push('mutlaq da\'vo «' + x + '» (faqat bazadagi qiymat ~0 bo\'lsa)'));
  if (String(s).length > 200) e.push('uzun (' + String(s).length + ')');
  const em = (t.match(EMOJI) || []).length; if (mode === 'jiddiy' && em) e.push('jiddiyda emoji'); if (em > 1) e.push('emoji > 1');
  const gap = (t.replace(/\d[.,]\d/g, '0').replace(/\.\.\.|…/g, '.').match(/[.!?]+(\s|$)/g) || []).length; if (gap > 3 || (mode === 'jiddiy' && gap > 2)) e.push('gap ko\'p (' + gap + ')');
  if (L === 'uz' && /[А-Яа-яЁёЎўҚқҒғҲҳ]/.test(t)) e.push('uz matnida kirill');
  if (L === 'ru') { const lat = (t.match(/[A-Za-z][A-Za-z'’-]*/g) || []).filter((w) => !RU_LAT_OK.test(w)); if (lat.length) e.push('ru matnida lotin so\'z: ' + lat.join(',')); }
  return e;
}
const words = (s) => new Set(s.toLowerCase().replace(/\{[^}]*\}/g, ' ').replace(/[^a-zа-яёʻ'’ -]/gi, ' ').split(/\s+/).map((w) => w.replace(/^['’-]+|['’-]+$/g, '')).filter((w) => w.length > 2));
function jac(a, b) { const A = words(a), B = words(b); if (!A.size || !B.size) return 0; let n = 0; A.forEach((w) => { if (B.has(w)) n++; }); return n / (A.size + B.size - n); }
const phs = (s) => (s.replace(/\{[^{}|]*\|[^{}|]*\}/g, '').match(/\{(\w+)\}/g) || []).map((x) => x.slice(1, -1));
/* maslahatchi formati: X — tekshiriladigan, ORIG — asl manba (placeholder qoidasi uchun) */
function checkMatn(X, ORIG) {
  const err = [];
  for (const L of ['uz', 'ru']) for (const m of ['hazil', 'jiddiy']) for (const k of Object.keys((X[L] || {})[m] || {})) {
    const a = X[L][m][k], o = ((ORIG || {})[L] || {})[m] && ORIG[L][m][k];
    if (!Array.isArray(a) || a.length < 3) err.push(`${L}/${m}/${k}: < 3 variant`);
    if (new Set(a).size !== a.length) err.push(`${L}/${m}/${k}: takror variant`);
    let need = null, allow = null;
    if (o && o.length) { const sets = o.map((s) => new Set(phs(s))); need = [...sets[0]].filter((p) => sets.every((S) => S.has(p))); allow = new Set(o.flatMap(phs)); }
    a.forEach((s, i) => { check(s, L, m).forEach((x) => err.push(`${L}/${m}/${k}#${i}: ${x} — «${s}»`));
      if (need) need.forEach((p) => { if (!phs(s).includes(p) && !(p === 'src' && phs(s).includes('Src')) && !(p === 'Src' && phs(s).includes('src'))) err.push(`${L}/${m}/${k}#${i}: {${p}} yo'q — «${s}»`); });
      if (allow) phs(s).forEach((p) => { if (!allow.has(p) && !(p === 'Src' && allow.has('src')) && !(p === 'src' && allow.has('Src'))) err.push(`${L}/${m}/${k}#${i}: ruxsatsiz {${p}} — «${s}»`); }); });
    const other = (X[L] || {})[m === 'hazil' ? 'jiddiy' : 'hazil']; if (m === 'hazil' && other && other[k]) a.forEach((h) => other[k].forEach((j) => { const v = jac(h, j); if (v > 0.5) err.push(`${L}/${k}: hazil≈jiddiy ${v.toFixed(2)} «${h}» ~ «${j}»`); }));
  }
  return err;
}
function checkHazil(J) { const err = []; (J.items || []).forEach((x) => { for (const L of ['uz', 'ru']) if (x[L]) check(x[L], L, 'hazil').forEach((e) => err.push(`${x.id} ${L}: ${e} — «${x[L]}»`)); }); return err; }
module.exports = { TAQIQ, BAN, ABS, ABS_OK, absolute, QTY, hardQty, check, checkMatn, checkHazil, jac };
if (require.main === module) {
  const ROOT = path.join(__dirname, '..'), ORIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/maslahatchi-matn.json'), 'utf8'));
  const files = process.argv.slice(2).filter((a) => !a.startsWith('--')); if (!files.length) files.push(path.join(ROOT, 'data/maslahatchi-matn.json'));
  const origArg = process.argv.find((a) => a.startsWith('--orig=')); const O = origArg ? JSON.parse(fs.readFileSync(origArg.slice(7), 'utf8')) : ORIG;
  let bad = 0; for (const f of files) { const J = JSON.parse(fs.readFileSync(f, 'utf8')), e = J.items ? checkHazil(J) : checkMatn(J, O); e.forEach((x) => console.log('✘', x)); bad += e.length; console.log(path.basename(f) + ': ' + (e.length ? e.length + ' xato' : 'OK')); }
  process.exit(bad ? 1 : 0);
}
