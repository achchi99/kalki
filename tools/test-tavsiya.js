/* v106: «NIMA YEYISH KERAK» tavsiyalari FARQDAN hisoblanadi (assets/kalkifit-tavsiya.js) — bazadagi qiymat bo'yicha har variant farqning 80–150 % ini qoplaydi.
 *  1) porsiya birliklari bazadagi birliklarga mos (tuxum 50 g, olma 180 g, choy qoshiq 5 g …);
 *  2) 5–80 g farqlar (oqsil, uglevod, yog', kletchatka — odatiy porsiya mavjud oraliqda) — har variant MATNDAN qayta o'qilib, bazadan hisoblanadi: 80–150 %;
 *     kkal «zaxirasi» (qr_full_*, s_ok) — variant zaxiradan oshmaydi; oraliqdan tashqarida — miqdorsiz ibora (YOLG'ON raqam yo'q);
 *  3) BARCHA tavsiya shablonlari (uz/ru × hazil/jiddiy × har variant) 5–80 g farqlarda render qilinadi: matn generator qiymatini o'z ichiga oladi;
 *  4) matnlarda qattiq porsiya (150 g tovuq, 2 ta tuxum …) va mutlaq da'vo («oqsil yo'q», «umuman», «нет белка») YO'Q; «Yemaydiganlarim» filtri va bazasiz holat — miqdorsiz.
 *   node tools/test-tavsiya.js */
'use strict';
const assert = require('assert'); const path = require('path');
const S = require('../assets/kalkifit-core.js'), KT = require('../assets/kalkifit-tavsiya.js'), MS = require('../assets/kalkifit-maslahat.js'), M = require('../assets/kalkifit-maslahat-matn.js'), U = require('./maslahat-uslub.cjs');
const foods = S.buildIndex(S.normFoods(require('../data/ovqatlar.json').foods)); const by = Object.fromEntries(foods.map((f) => [f.id, f]));
let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
KT.init(foods);
/* 1. birliklar bazaga mos */
const UNIT = { tuxum: 'dona', olma: 'dona', banan: 'dona', nok: 'dona', mandarin: 'dona', kartoshka: 'dona', yog: 'choyq' };
for (const k of Object.keys(KT.CAND)) for (const c of KT.CAND[k]) { const f = by[c.id]; assert.ok(f, c.id + ' bazada yo\'q'); assert.ok(f[KT.KEY[k]] != null, c.id + ' — ' + KT.KEY[k] + ' qiymati yo\'q');
  if (c.ug !== 1) { const u = (f.u || []).find((x) => x[0] === UNIT[c.id]); assert.ok(u, c.id + ' birligi (' + UNIT[c.id] + ') bazada yo\'q'); assert.equal(u[1], c.ug, c.id + ': bir birlik grammi bazaga mos emas'); } }
ok('Porsiya birliklari bazadagi birliklarga mos (tuxum 50 g, olma 180 g, banan 120 g, kartoshka 100 g, choy qoshiq 5 g …); har taomda kerakli ozuqa qiymati bor');
/* matndan (mustaqil) qayta o'qish: variant qismi → { id, g } */
const NM_UZ = { tvorog: 'tvorog5', "tovuq ko'kragi": 'tovuq-kokrak', qatiq: 'qatiq', 'pishgan loviya': 'loviya', 'pishgan mosh': 'mosh', "qaynatilgan mol go'shti": 'mol-qaynatilgan', "kurka ko'kragi": 'kurka-kokrak', 'yunon yogurti': 'yogurt-yunon', "tunets (o'z sharbatida)": 'tunets-suv', 'pishgan grechka': 'grechka', non: 'non', mayiz: 'mayiz', 'pishgan guruch': 'guruch', "grek yong'og'i": 'yongoq', pishloq: 'pishloq', 'qaynatilgan brokkoli': 'brokkoli-qaynatilgan', 'qora non': 'non-qora' };
const NM_RU = { 'творога': 'tvorog5', 'куриной грудки': 'tovuq-kokrak', 'катыка': 'qatiq', 'варёной фасоли': 'loviya', 'варёного маша': 'mosh', 'варёной говядины': 'mol-qaynatilgan', 'грудки индейки': 'kurka-kokrak', 'греческого йогурта': 'yogurt-yunon', 'тунца (в собственном соку)': 'tunets-suv', 'варёной гречки': 'grechka', 'хлеба': 'non', 'изюма': 'mayiz', 'варёного риса': 'guruch', 'грецких орехов': 'yongoq', 'сыра': 'pishloq', 'варёной брокколи': 'brokkoli-qaynatilgan', 'чёрного хлеба': 'non-qora' };
const DONA = { uz: { tuxum: 'tuxum', olma: 'olma', banan: 'banan', nok: 'nok', mandarin: 'mandarin', kartoshka: 'kartoshka' }, ru: { 'яйцо|яйца|яиц': 'tuxum', 'яблоко|яблока|яблок': 'olma', 'банан|банана|бананов': 'banan', 'груша|груши|груш': 'nok', 'мандарин|мандарина|мандаринов': 'mandarin', 'картофелина|картофелины|картофелин': 'kartoshka' } };
const ruForm = (n, a, b, c) => { n = Math.abs(n) % 100; const m = n % 10; return n > 10 && n < 20 ? c : m === 1 ? a : m >= 2 && m <= 4 ? b : c; };
function parsePart(t, L) {          // → { id, g, units }
  let m;
  if (L === 'uz') {
    if ((m = t.match(/^(\d+) g (.+)$/))) { const id = NM_UZ[m[2]]; assert.ok(id, 'noma\'lum taom: ' + t); return { id, g: +m[1] }; }
    if ((m = t.match(/^yarim (olma|banan)$/))) return { id: m[1], g: 0.5 * by[m[1]].u.find((u) => u[0] === 'dona')[1] };
    if ((m = t.match(/^(\d+) ta (\S+)$/))) { const id = DONA.uz[m[2]]; assert.ok(id, 'noma\'lum: ' + t); return { id, g: +m[1] * by[id].u.find((u) => u[0] === 'dona')[1] }; }
    if ((m = t.match(/^(\d+) choy qoshiq o'simlik moyi$/))) return { id: 'yog', g: +m[1] * by.yog.u.find((u) => u[0] === 'choyq')[1] };
  } else {
    if ((m = t.match(/^(\d+) г (.+)$/))) { const id = NM_RU[m[2]]; assert.ok(id, 'noma\'lum taom: ' + t); return { id, g: +m[1] }; }
    if (t === 'пол-яблока') return { id: 'olma', g: 90 }; if (t === 'полбанана') return { id: 'banan', g: 60 };
    if ((m = t.match(/^(\d+) (чайная ложка|чайные ложки|чайных ложек) растительного масла$/))) { assert.equal(m[2], ruForm(+m[1], 'чайная ложка', 'чайные ложки', 'чайных ложек'), 'ru son shakli: ' + t); return { id: 'yog', g: +m[1] * 5 }; }
    if ((m = t.match(/^(\d+) (\S+)$/))) { const k = Object.keys(DONA.ru).find((x) => x.split('|').includes(m[2])); assert.ok(k, 'noma\'lum: ' + t); const f = k.split('|'); assert.equal(m[2], ruForm(+m[1], f[0], f[1], f[2]), 'ru son shakli: ' + t); const id = DONA.ru[k]; return { id, g: +m[1] * by[id].u.find((u) => u[0] === 'dona')[1] }; }
  }
  throw new Error('o\'qib bo\'lmadi: ' + t);
}
const KEYF = KT.KEY, nut = (kind, txt, L) => txt.split(L === 'ru' ? ' и ' : ' va ').reduce((a, p) => { const x = parsePart(p, L); return a + by[x.id][KEYF[kind]] * x.g / 100; }, 0);
/* 2. 5–80 g farqlar: har variant matndan o'qilib, bazadan hisoblanadi — 80–150 % */
const RANGE = { P: [5, 80], Z: [5, 60], S: [10, 60], C: [5, 80], F: [5, 35], B: [3, 28] }, TOP = { P: 80, Z: 60, S: 60, C: 80, F: 35, B: 28 }; let nopt = 0, minCov = 9, maxCov = 0; const single = {};
for (const kind of Object.keys(RANGE)) for (let g = RANGE[kind][0]; g <= RANGE[kind][1]; g++) for (const L of ['uz', 'ru']) for (let seed = 0; seed < 6; seed++) {
  const r = KT.opts(kind, g, L, { seed, n: 2 }); assert.ok(!r.generic && r.list.length >= 1, kind + ' ' + g + ' g (' + L + '): variant yo\'q'); if (r.list.length < 2) single[kind + g] = 1;
  const parts = r.text.split(L === 'ru' ? ' или ' : ' yoki '); assert.equal(parts.length, r.list.length, 'variantlar soni'); assert.equal(r.first, parts[0]);
  parts.forEach((opt) => { const v = nut(kind, opt, L), cov = v / g; nopt++; minCov = Math.min(minCov, cov); maxCov = Math.max(maxCov, cov); assert.ok(cov >= 0.8 - 1e-9 && cov <= 1.5 + 1e-9, `${kind} ${g} g (${L}): «${opt}» = ${v.toFixed(1)} g → ${Math.round(cov * 100)} % (80–150 % emas)`); });
}
const sn = Object.keys(single); assert.ok(sn.length <= 12, 'bitta variantli farqlar ko\'p: ' + sn);
ok('Oqsil/nonushta oqsili/nam-yog\'siz oqsil/uglevod/yog\'/kletchatka: ' + nopt + ' variant (uz/ru, 6 aylanish) matndan qayta o\'qildi — har biri bazadagi qiymat bo\'yicha farqning ' + Math.round(minCov * 100) + '–' + Math.round(maxCov * 100) + ' % i (80–150 % ichida); porsiya — odatiy qadamga (tuxum dona, tvorog/tovuq 50 g, choy qoshiq …); ru — to\'g\'ri son shakli (1 яйцо / 2 яйца / 5 яиц)');
/* oraliqdan tashqarida (kichik/katta farq) — miqdorsiz ibora; raqam yolg'on aytilmaydi */
for (const kind of Object.keys(TOP)) for (const g of [TOP[kind] + 1, TOP[kind] + 40, 0, -5, NaN, '']) for (const L of ['uz', 'ru']) { const r = KT.opts(kind, g, L, {}); assert.ok(r.generic && !/\d/.test(r.text), kind + ' ' + g + ': ' + r.text); }
ok('Mantiqsiz/juda katta farq (oqsil > 80 g, kletchatka > 28 g …), 0, manfiy, NaN — miqdorsiz ibora («go\'sht, tuxum yoki tvorog»), yolg\'on raqam yo\'q');
/* kkal zaxirasi: variant zaxiradan OSHMAYDI */
let kc = 0; for (const kind of ['K', 'L']) for (let left = 40; left <= 700; left += 5) for (const L of ['uz', 'ru']) { const r = KT.opts(kind, left, L, { seed: left }); r.list.forEach((o) => { const kcal = nut('K', o.text, L); kc++; assert.ok(kcal <= left + 1e-9, `${kind} ${left} kkal: «${o.text}» = ${Math.round(kcal)} kkal (zaxiradan oshdi)`); assert.ok(kcal >= Math.min(40, left * 0.4) - 1e-9, 'juda kichik: ' + o.text); }); if (left >= 80) assert.ok(!r.generic, kind + ' ' + left); }
ok('Kaloriya zaxirasi (40–700 kkal): ' + kc + ' variant — hech biri zaxiradan oshmaydi, juda kichik emas; zaxira ≥ 80 kkal bo\'lsa doim variant bor');
/* 3. BARCHA tavsiya shablonlari 5–80 g farqlarda */
const keysOp = []; for (const L of ['uz', 'ru']) for (const m of ['hazil', 'jiddiy']) for (const k of Object.keys(M[L][m])) M[L][m][k].forEach((t, i) => { const ph = t.match(/\{op[PZSCFBKL]1?\}/g); if (ph) keysOp.push({ L, m, k, i, t, ph }); });
assert.ok(keysOp.length >= 100, 'tavsiya shablonlari soni: ' + keysOp.length); let rend = 0; const kinds = new Set();
for (const { L, m, k, i, t, ph } of keysOp) for (let g = 5; g <= 80; g += (g < 20 ? 1 : 5)) {
  const data = { left: g, p: g, x: g, gm: g, n: 3 }, out = MS.say(k, data, { lang: L, mode: m, i }); rend++; assert.ok(out && !/[{}]/.test(out), k + ': ' + out);
  for (const p of ph) { const kind = p.charAt(3), one = p.length === 6, kk = ph.length && kind; kinds.add(kind); const fld = MS.OPG[k], gap = fld ? data[fld] : data.gm, big = kind === 'K' || kind === 'L';
    const r = KT.opts(kind, gap, L, { seed: i + k.length, n: one ? 1 : 2 }), want = one ? r.first : r.text; assert.ok(out.toLowerCase().includes(want.toLowerCase()), `${L}/${m}/${k}#${i} (${gap}): matn «${out}» generator qiymatini («${want}») o'z ichiga olmaydi`);
    if (!r.generic && !big) r.list.forEach((o) => { const cov = nut(kind, o.text, L) / gap; assert.ok(cov >= 0.8 - 1e-9 && cov <= 1.5 + 1e-9, `${k}: «${o.text}» ${Math.round(cov * 100)} %`); });
    if (r.generic) assert.ok(!/\d/.test(want), 'miqdorsiz ibora: ' + want); if (gap <= (TOP[kind] || 0) && RANGE[kind] && gap >= RANGE[kind][0]) assert.ok(!r.generic, `${k} ${kind} ${gap}`); }
}
ok('Tavsiya shablonlari: ' + keysOp.length + ' variant (' + [...kinds].sort().join('') + ') × farq 5–80 g → ' + rend + ' render; har matn generator qiymatini o\'z ichiga oladi, har variant 80–150 % (kkal zaxirasi — oshmaydi)');
/* 4. matnlarda qattiq porsiya va mutlaq da'vo YO'Q */
let all = 0; const bad = [];
const scan = (s, L, w) => { all++; U.hardQty(s, L).forEach((x) => bad.push(w + ' qattiq «' + x + '»: ' + s)); U.absolute(s, L).forEach((x) => bad.push(w + ' mutlaq «' + x + '»: ' + s)); };
for (const L of ['uz', 'ru']) for (const m of ['hazil', 'jiddiy']) for (const k of Object.keys(M[L][m])) M[L][m][k].forEach((s, i) => scan(s, L, L + '/' + m + '/' + k + '#' + i));
const H = require('../data/hazillar.json'); H.items.forEach((x) => { scan(x.uz, 'uz', x.id); scan(x.ru, 'ru', x.id); });
const E = require('../data/eslatmalar.json'); for (const mm of ['matn', 'matn_hazil']) for (const L of ['uz', 'ru']) for (const k of Object.keys(E[mm][L])) E[mm][L][k].forEach((s) => scan(s, L, 'push/' + k));
assert.deepStrictEqual(bad.slice(0, 6), [], 'qattiq porsiya / mutlaq da\'vo: ' + bad.length);
/* mutlaq da'vo faqat bazada ~0 bo'lsa: ruxsat (ABS_OK) bo'lsa — qiymat tekshiriladi */
U.ABS_OK.forEach((a) => assert.ok(by[a.food][a.nutrient] <= 0.5, a.key + ': «' + a.food + '» ' + a.nutrient + ' = ' + by[a.food][a.nutrient] + ' — mutlaq da\'vo bazaga zid'));
assert.ok(!/oqsil yo'q|белка нет|белка там нет/i.test(JSON.stringify(M)), 'oqsil yo\'q');
assert.ok(by.non.p > 5 && by.non.p <= 12, 'non oqsili ' + by.non.p); assert.ok(by.choy ? by.choy.p <= 0.5 : true);
ok('Matnlar (' + all + ' ta: maslahatchi, hazil pufaklari, push): qattiq porsiya YO\'Q, mutlaq da\'vo YO\'Q («non-choy … oqsil yo\'q» → «oqsil kam»: non ' + by.non.p + ' g oqsil/100 g); nol-da\'vo faqat bazadagi qiymat ≤ 0,5 bo\'lsa (ABS_OK)');
/* 5. «Yemaydiganlarim» filtri va bazasiz holat */
KT.setFilter((f) => !/^(tvorog5|qatiq|yogurt-yunon|pishloq|tuxum)$/.test(f.id)); let fl = 0;
for (const kind of ['P', 'Z', 'S', 'F', 'K', 'L']) for (const g of kind === 'K' || kind === 'L' ? [100, 200, 400] : [8, 25, 50]) for (const L of ['uz', 'ru']) { const r = KT.opts(kind, g, L, {}); fl++; assert.ok(!/tvorog|qatiq|yogurt|pishloq|tuxum|творог|катык|йогурт|сыр|яйц|яиц|яйцо/i.test(r.text), kind + g + ': ' + r.text); }
KT.setFilter(null); KT.init([]); let nb = 0;
for (const { L, m, k, i } of keysOp.slice(0, 400)) { const out = MS.say(k, { left: 40, p: 40, x: 12, gm: 25, n: 3 }, { lang: L, mode: m, i }); nb++; assert.ok(!/\d+ ?(g|г)\b.*\b(tvorog|tuxum|tovuq|творог|кур)/i.test(out.replace(/\b40 ?(g|г)\b|\b12 ?(g|г)\b/g, '')), 'bazasiz — miqdor yo\'q: ' + out); }
KT.init(foods);
ok('«Yemaydiganlarim» filtri (' + fl + ' tekshiruv): cheklangan taomlar tavsiya qilinmaydi; baza yuklanmagan (' + nb + ' matn) — miqdorsiz ibora');
console.log('tavsiya: ' + n + ' guruh OK');
