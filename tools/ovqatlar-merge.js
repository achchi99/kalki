/* kalki.uz — KalkiFit: admin ma'qullagan takliflarni ovqatlar bazasiga qo'shish (bazani AVTOMATIK o'zgartirmaydi — faqat shu skript orqali).
 * Foydalanish:  node tools/ovqatlar-merge.js kalkifit-takliflar-YYYY-MM-DD.json            (quruq: nima qo'shilishini ko'rsatadi)
 *               node tools/ovqatlar-merge.js kalkifit-takliflar-YYYY-MM-DD.json --write    (tools/ovqatlar-extra.json ga yozadi va data/ovqatlar.json ni qayta yasaydi)
 * Kirish: /admin/kalkifit-takliflar sahifasidagi "Eksport" fayli: { v:1, taomlar:[{ nom_uz, nom_ru, kat, g (porsiya, g), kcal, o, y, u }] } — qiymatlar BIR PORSIYA uchun;
 * bazaga 100 g uchun yoziladi: k = kkal × 100 / g. */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const EXTRA = path.join(__dirname, 'ovqatlar-extra.json'), DB = path.join(__dirname, '..', 'data', 'ovqatlar.json');
const KAT = ['o', 'n', 's', 'm', 'g', 'v', 'f', 'd', 'i', 'q', 'h', 'x'];
const CYR = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 's', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ў': 'o', 'қ': 'q', 'ғ': 'g', 'ҳ': 'h' };
const key = (s) => { let o = ''; for (const ch of String(s || '').toLowerCase().replace(/[’'`‘ʻʼ]/g, '')) o += CYR[ch] != null ? CYR[ch] : ch; return o.replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/([a-z])\1+/g, '$1'); };
const r1 = (x) => Math.round(x * 10) / 10;

function convert(t) {                              // admin eksporti → baza yozuvi (yoki xato matni)
  const nom = String(t.nom_uz || '').trim(), g = Number(t.g), kat = KAT.includes(t.kat) ? t.kat : null;
  if (nom.length < 2 || nom.length > 60) return { err: 'nom noto\'g\'ri' };
  if (!(g >= 5 && g <= 2000)) return { err: 'porsiya og\'irligi (g) 5–2000 bo\'lishi kerak' };
  if (!kat) return { err: 'toifa noto\'g\'ri' };
  const k = Number(t.kcal), o = Number(t.o), y = Number(t.y), u = Number(t.u);
  if (![k, o, y, u].every(isFinite) || k < 0 || k > 3000) return { err: 'kkal/makro noto\'g\'ri' };
  const m = 100 / g, id = key(nom).replace(/ /g, '-').slice(0, 40) || 'taom';
  const ru = String(t.nom_ru || '').trim() || nom;
  return { item: { i: id, n: nom, r: ru, a: [key(nom), key(ru)].filter((x, i, a) => x && a.indexOf(x) === i), k: Math.round(k * m), p: r1(o * m), f: r1(y * m), c: r1(u * m), t: kat, e: 1, u: [['porsiya', Math.round(g)], ['g100', 100]], x: 1 } };
}
function merge(input, existing, extra) {           // sof funksiya (test uchun): { added:[...], skipped:[{nom, sabab}] }
  const have = new Set(existing.map((f) => f.i)), names = new Set(existing.flatMap((f) => [key(f.n), key(f.r)].concat((f.a || []).map(key)))), added = [], skipped = [];
  for (const t of (input && input.taomlar) || []) {
    const c = convert(t); if (c.err) { skipped.push({ nom: t.nom_uz, sabab: c.err }); continue; }
    if (have.has(c.item.i) || names.has(key(c.item.n))) { skipped.push({ nom: t.nom_uz, sabab: 'bazada allaqachon bor' }); continue; }
    have.add(c.item.i); names.add(key(c.item.n)); added.push(c.item);
  }
  return { added, skipped };
}
module.exports = { convert, merge, key };

if (require.main === module) {
  const file = process.argv[2], write = process.argv.includes('--write');
  if (!file) { console.log('foydalanish: node tools/ovqatlar-merge.js <eksport.json> [--write]'); process.exit(1); }
  const input = JSON.parse(fs.readFileSync(file, 'utf8')), db = JSON.parse(fs.readFileSync(DB, 'utf8')).foods, extra = fs.existsSync(EXTRA) ? JSON.parse(fs.readFileSync(EXTRA, 'utf8')) : [];
  const r = merge(input, db, extra);
  r.added.forEach((x) => console.log('  + ' + x.n + ' (' + x.i + '): ' + x.k + ' kkal/100 g, porsiya ' + x.u[0][1] + ' g, toifa ' + x.t));
  r.skipped.forEach((x) => console.log('  – o\'tkazildi: ' + x.nom + ' — ' + x.sabab));
  if (write && r.added.length) { fs.writeFileSync(EXTRA, JSON.stringify(extra.concat(r.added), null, 1) + '\n'); cp.execFileSync(process.execPath, [path.join(__dirname, 'ovqatlar-build.js')], { stdio: 'inherit' }); console.log('yozildi: ' + r.added.length + ' ta'); }
  else console.log(write ? 'qo\'shiladigan yangi taom yo\'q' : 'quruq rejim (--write yo\'q): hech narsa yozilmadi');
}
