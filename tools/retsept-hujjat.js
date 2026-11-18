#!/usr/bin/env node
/* kalki.uz — v87 tuzatish: docs/baza-kengaytma-v87.md ning MANBA va RETSEPT bo'limlarini yozadi (AVTOMATIK-BOSH … AVTOMATIK-OXIR orasida).
 *   node tools/retsept-hujjat.js [--eski <git ref>]   (eski qiymat: shu ref dagi data/ovqatlar.json, standart HEAD)
 * Jadval: har v87 qatori → manba turi (Retsept hisobi · USDA aynan · USDA eng yaqin · Скурихин · Yorliq) va yozuv(lar); retseptlar (masalliq, gramm, chiqish, natija); >15 % o'zgarganlar. */
'use strict';
const fs = require('fs'), path = require('path'), { execSync } = require('child_process'), ROOT = path.join(__dirname, '..');
const H = require('./retsept-hisob.js'), RA = H.all(), U = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/manba/usda-sr-legacy.json'), 'utf8')).foods;
const rows = ['8a', '8b', '8c'].flatMap((x) => require('./ovqatlar-kengaytma' + x + '.js').map((r) => (r.fayl = x, r)));
const NOW = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods.map((f) => [f.i, f]));
const ref = process.argv.includes('--eski') ? process.argv[process.argv.indexOf('--eski') + 1] : 'HEAD';
let OLD = {}; try { OLD = Object.fromEntries(JSON.parse(execSync('git show ' + ref + ':data/ovqatlar.json', { cwd: ROOT, maxBuffer: 1 << 28 }).toString()).foods.map((f) => [f.i, f])); } catch (e) {}
/* bitta USDA yozuvidan olinganlar: «aynan» emas — eng yaqin almashtirish (sababi bilan) */
const YAQIN = {
  'jasmin-choy': "yashil choy (damlangan) — jasmin xushbo'yligi kkalga ta'sir qilmaydi", 'muzli-choy-shakarsiz': 'eriydigan choy, suvda — shishadagi shakarsiz sovuq choyga eng yaqin',
  'energetik-shakarli': 'Rockstar (brend) — umumiy shakarli energetik o\'rniga', 'energetik-shakarsiz': 'Rockstar sugar free (brend) — umumiy shakarsiz energetik o\'rniga',
  'kurka-kolbasa': 'turkey bologna — qaynatilgan kurka kolbasasiga eng yaqin', 'jigar-pashtet': 'konserva tovuq jigari pashteti — uy pashtetiga eng yaqin',
  'sudak': 'walleye (Sander vitreus) — sudakning (Sander lucioperca) yaqin turi', 'laqqa-baliq': 'channel catfish — laqqa (som) ga yaqin tur',
  'suli-paketli': 'Quaker (olma-dolchinli) — paketli tez tayyor suliga eng yaqin', 'qoziqorin-marinad': 'konserva qo\'ziqorin (suyuqligisiz) — marinadlanganga eng yaqin',
  'pishloq-kam-yogli': 'kam yog\'li cheddar — kam yog\'li qattiq pishloqqa eng yaqin', 'tovuq-otbivnoy': 'panirovkada qovurilgan tovuq ko\'kragi — otbivnoyga eng yaqin',
  'mol-gosht-xom-yogli': "chuck (kurak) — yog'li mol go'shtiga eng yaqin kesim", 'kurka-vetchina': 'turkey ham (deli) — kurka vetchinasi', 'tsukat': 'candied fruit — tsukat aralashmasi'
};
const ICHKI = { 'yashil-borsh': "shovul o'rniga ismaloq (ma'qullangan)", xarcho: "tkemali o'rniga quruq olxo'ri", 'gorox-shurva': "no'xat yormasi — USDA'da faqat pishgani", 'kompot-quruq-shakarsiz': "olxo'ri, olma, o'rik qoqi, mayiz" };
const desc = (tok) => { const q = H.part(tok); return q ? q.u.replace(/\s*\(Includes[^)]*\)/, '') : tok; };
function turi(r) {
  const id = r[0], src = r[6];
  if (RA[id]) return ['Retsept hisobi (standart retsept)', RA[id].mas.filter((m) => m[0] !== 'suv').map((m) => m[2] + ' — ' + desc(m[0])).join('; ')];
  if (/^m:/.test(src)) return ['Retsept hisobi (masalliqlar grammi)', src.slice(2).split('+').filter((x) => !/^suv\*/.test(x)).map((x) => { const i = x.lastIndexOf('*'); return x.slice(i + 1) + ' g ' + desc(x.slice(0, i)); }).join('; ')];
  if (/^s:/.test(src)) return ['Скурихин (MDH jadvali)', desc(src)];
  if (/^y:/.test(src)) return ['Ishlab chiqaruvchi yorlig\'i', desc(src)];
  return [YAQIN[id] ? 'USDA — eng yaqin' : 'USDA — aynan', desc(src) + (YAQIN[id] ? ' → ' + YAQIN[id] : '')];
}
const esc = (s) => String(s).replace(/\|/g, '/');
const L = [];
const cnt = {}; rows.forEach((r) => { const t = turi(r)[0]; cnt[t] = (cnt[t] || 0) + 1; });
L.push('## Manba jadvali (v87, ' + rows.length + ' qator) — `node tools/retsept-hujjat.js`', '', Object.entries(cnt).map(([k, v]) => '- **' + k + ':** ' + v).join('\n'), '',
  "«Retsept hisobi» — taom USDA'da yo'q, uning qiymati masalliqlar (har biri o'z manbasidan: USDA / Скурихин / yorliq) grammidan hisoblangan; USDA'dan «tayyor taom» sifatida olinmagan.", '',
  '| Taom | Fayl | Manba turi | Masalliq / yozuv | kkal/100 g |', '|---|---|---|---|---|');
rows.forEach((r) => { const [t, m] = turi(r), f = NOW[r[0]]; L.push('| ' + esc(r[1]) + ' (`' + r[0] + '`) | ' + r.fayl + ' | ' + t + (ICHKI[r[0]] ? ' · ichida: ' + ICHKI[r[0]] : '') + ' | ' + esc(m) + ' | ' + (f ? f.k : '—') + ' |'); });
L.push('', '## Standart retseptlar (' + Object.keys(RA).length + ' ta) — `tools/retsept-v87a.js`, `retsept-v87b.js`, `retsept-v87c.js`', '',
  "Netto gramm (tozalangan masalliq), butun qozon yoki porsiya uchun; «chiqish» — tayyor taom massasi (bug'lanish, qovurish/pishirish yo'qotishidan keyin). Yog' — odatiy retseptdagi real miqdor. Tarozida tekshirilmagan: ±15 %.", '');
for (const id of Object.keys(RA)) {
  const r = RA[id], h = H.hisob(r), f = NOW[id] || {}, nm = f.n || id;
  L.push('### ' + nm + ' (`' + id + '`)', '', '*' + r.porsiya + ' · ' + r.izoh + '*', '', '| Masalliq | Netto, g | Manba |', '|---|---|---|');
  r.mas.forEach((m) => L.push('| ' + esc(m[2]) + ' | ' + m[1] + ' | ' + (m[0] === 'suv' ? '—' : esc(desc(m[0]))) + ' |'));
  L.push('', 'Jami ' + Math.round(h.sum) + ' g → tayyor ' + Math.round(h.out) + ' g. **100 g: ' + Math.round(h.k) + ' kkal, oqsil ' + h.p.toFixed(1) + ' g, yog\' ' + h.f.toFixed(1) + ' g, uglevod ' + h.c.toFixed(1) + ' g.**', '');
}
const ch = rows.map((r) => { const o = OLD[r[0]], n = NOW[r[0]]; return o && n ? { id: r[0], nm: n.n, o: o.k, n: n.k, d: (n.k - o.k) / Math.max(1, o.k) * 100, src: turi(r)[0] } : null; }).filter((x) => x && Math.abs(x.d) > 15).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
L.push('## Qiymati 15 % dan ko\'p o\'zgarganlar (' + ch.length + ' ta; eski — `' + ref + '` dagi baza)', '', '| Taom | Eski kkal/100 g | Yangi | Farq | Yangi manba |', '|---|---|---|---|---|');
ch.forEach((x) => L.push('| ' + esc(x.nm) + ' (`' + x.id + '`) | ' + x.o + ' | ' + x.n + ' | ' + (x.d > 0 ? '+' : '') + Math.round(x.d) + ' % | ' + x.src + ' |'));
const P = path.join(ROOT, 'docs/baza-kengaytma-v87.md'); let d = fs.readFileSync(P, 'utf8'); const B = '<!-- AVTOMATIK-BOSH (tools/retsept-hujjat.js) -->', E = '<!-- AVTOMATIK-OXIR -->';
const blk = B + '\n' + L.join('\n') + '\n' + E;
d = d.includes(B) ? d.replace(new RegExp(B.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + E), blk) : d.replace(/\n## Testlar/, '\n' + blk + '\n\n## Testlar');
fs.writeFileSync(P, d); console.log(JSON.stringify(cnt), '| retsept:', Object.keys(RA).length, '| >15 %:', ch.length);
module.exports = { turi, YAQIN };
