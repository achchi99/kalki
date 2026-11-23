/* kalki.uz — «faqat BITTA variant bor» bo'shliqlarini avtomatik qidirish (v100).
 * Har mahsulot guruhi uchun kutilgan variantlar (yog'lilik, qism, tur) — SLOTLAR. Har slot ilovaning O'Z qidiruvi (S.search + S.famPick, qidiruv oynasidagi kabi) bilan so'raladi:
 *   natija kutilgan qiymat oralig'ida bo'lsa (yog' %, kkal) yoki kutilgan id topilsa — slot to'ldirilgan (✓), aks holda bo'sh (✗).
 * Guruhda hamma slot BIR XIL taomga tushsa — «BITTA variant» (masalan, ryajenka: 2,5/3,2/4 % → bitta taom).
 * Ishlatish:  node tools/baza-bitta-variant.js [--root <papka>] [--json] [--md]     (--root: boshqa nusxa, masalan git worktree — «oldin/keyin» solishtirish uchun)
 * Test: tools/test-qidiruv-xato.js shu SLOTLAR dan foydalanadi (module.exports.SLOTLAR). */
'use strict';
const fs = require('fs'), path = require('path');
const argv = process.argv.slice(2), ri = argv.indexOf('--root'), ROOT = ri > -1 ? path.resolve(argv[ri + 1]) : path.join(__dirname, '..');
/* [guruh, so'rov, tekshiruv]: {f:[min,max]} — yog' g/100 g; {k:[min,max]} — kkal; {id:'...'} — aniq id (yoki id boshlanishi /^re/) */
const fat = (q, f, d) => [q, { f: [f - (d == null ? 0.7 : d), f + (d == null ? 0.7 : d)] }];
const G = {
  'tvorog': [0, 1, 2, 5, 9, 18].map((v) => fat('tvorog ' + v, v, v === 0 ? 0.8 : 0.7)),
  'sut': [0.5, 1, 1.5, 2, 2.5, 3.2, 6].map((v) => fat('sut ' + v, v, 0.35)),
  'kefir': [1, 2.5, 3.2].map((v) => fat('kefir ' + v, v, 0.4)),
  'smetana': [10, 15, 20, 25].map((v) => fat('smetana ' + v, v, 1.2)),
  'qatiq': [1.5, 2.5, 3.2].map((v) => fat('qatiq ' + v, v, 0.5)).concat([["yog'siz qatiq", { f: [0, 0.9] }]]),
  'ryajenka': [2.5, 3.2, 4].map((v) => fat('ryajenka ' + v, v, 0.35)),
  'yogurt': [['yogurt', { f: [2.5, 3.8] }], ['yogurt 1.5', { f: [1, 2] }], ['yogurt 0', { f: [0, 0.6] }], ['yunon yogurti', { f: [0, 0.8] }], ['yunon yogurti 5', { f: [4, 6] }], ['yogurt ichimlik', { f: [0.8, 2.5] }]],
  'qaymoq': [10, 20, 33].map((v) => fat('qaymoq ' + v, v, 3.5)),
  'sariyog': [72.5, 82.5].map((v) => fat('sariyog ' + v, v, 1.2)),
  'pishloq': [['mozzarella', { id: /^motsarella$|^mozzarella/ }], ['mozzarella kam yog\'li', { id: /^mozzarella-kam/ }], ['adigey pishlog\'i', { id: /adigey/ }], ['brinza', { id: /yumshoq|brinza/ }], ['plavlenniy pishloq', { id: /eritilgan|hochland/ }], ['pishloq 45', { id: /edam/ }], ['pishloq 50', { id: /rossiya|gauda/ }], ['parmezan', { id: /parmezan/ }], ['rikotta', { id: /rikotta/ }], ['feta', { id: /yumshoq|feta/ }]],
  'qiyma': [5, 10, 15, 20].map((v) => fat('qiyma ' + v, v, 1.2)).concat([["qo'y qiymasi", { id: /^qoy-qiyma/ }], ['tovuq qiymasi', { id: /^tovuq-qiyma/ }], ['kurka qiymasi', { id: /^kurka-qiyma/ }]]),
  "mol go'shti qismlari": [['mol file', { id: /^mol-file/ }], ['antrekot', { id: /^mol-antrekot/ }], ['mol yelka', { id: /^mol-yelka/ }], ['mol son', { id: /^mol-son/ }], ["mol to'sh", { id: /^mol-tosh/ }]],
  "qo'y go'shti qismlari": [["qo'y son", { id: /^qoy-son/ }], ["qo'y yelka", { id: /^qoy-yelka/ }], ["qo'y bel", { id: /^qoy-bel/ }], ["qo'y boldir", { id: /^qoy-boldir/ }]],
  'tovuq qismlari': [["tovuq ko'krak", { id: /^tovuq-kokrak/ }], ['tovuq son', { id: /^tovuq-son/ }], ['tovuq qanot', { id: /^tovuq-(qanot|kanat)/ }], ['tovuq boldir', { id: /^tovuq-boldir/ }], ['tovuq jigari', { id: /^tovuq-jigar/ }], ['tovuq yurak', { id: /^tovuq-yurak/ }], ['tovuq oshqozon', { id: /^tovuq-oshqozon/ }]],
  'kolbasa/sosiska': [['kolbasa', { id: /^kolbasa/ }], ['dudlangan kolbasa', { id: /dudlangan/ }], ["kolbasa kam yog'li", { id: /kolbasa-mol-kam/ }], ['sosiska', { id: /^sosiska/ }], ['tovuq sosiska', { id: /^tovuq-sosiska/ }], ['kurka sosiska', { id: /^sosiska-kurka/ }], ['pastrami', { id: /pastrami/ }]],
  'yorma (xom/pishgan)': [['guruch', { id: /^guruch$/ }], ['guruch xom', { id: /^guruch-xom/ }], ['grechka', { id: /^grechka$/ }], ['grechka xom', { id: /^grechka-xom/ }], ['suli', { id: /^suli$/ }], ['suli xom', { id: /^suli-(xom|quruq)/ }], ['tariq', { id: /^tariq$/ }], ['perlovka', { id: /^perlovka$/ }], ['bulgur', { id: /^bulgur$/ }], ['kuskus', { id: /^kuskus$/ }]],
  'non': [['non', { id: /^non(\[|$)/ }], ['patir', { id: /^non\[patir|^patir/ }], ['baget', { id: /^baget/ }], ['lavash non', { id: /^lavash-non/ }], ['tost non', { id: /^tost/ }], ['pita non', { id: /^non-pita/ }], ["butun donli non", { id: /non-bugdoy/ }], ['javdar non', { id: /non-jovdar/ }], ['qora non', { id: /non-qora/ }]],
  'ichimliklar': [['kola', { id: /cola|kola/ }], ['pepsi', { id: /^pepsi/ }], ['sprite', { id: /^sprite/ }], ['fanta', { id: /^fanta/ }], ['limonad', { id: /limonad/ }], ['sharbat olma', { id: /sharbat/ }], ['kompot', { id: /kompot/ }], ['kvas', { id: /kvas/ }], ['ayron', { id: /ayron/ }], ['energetik', { id: /energetik|red-bull|monster|burn/ }], ['pivo', { id: /^pivo/ }], ['vino', { id: /^vino/ }], ['kapuchino', { id: /kapuchino/ }], ['latte', { id: /latte/ }], ['kakao', { id: /kakao/ }], ['yashil choy', { id: /yashil-choy/ }]],
};
function run(root) {
  const S = require(path.join(root, 'assets', 'kalkifit-core.js')), foods = S.buildIndex(S.normFoods(JSON.parse(fs.readFileSync(path.join(root, 'data', 'ovqatlar.json'), 'utf8')).foods));
  const one = (f, q) => { let v = f, tag = f.id; if (f.fam) { const pk = S.famPick(f, q); const sel = Object.assign(S.famDefault(f), pk || {}); v = S.famVariant(f, sel); tag += '[' + Object.values(sel).join('.') + ']'; } return { id: f.id, tag, k: v.k, p: v.p, f: v.f, c: v.c }; };
  const look = (q) => { const l = S.search(foods, q, { limit: 3 }), f = l[0]; if (!f) return null; const h = one(f, q); h.top3 = l.map((x) => one(x, q).tag); return h; };
  return Object.entries(G).map(([guruh, slots]) => {
    const res = slots.map(([q, chk]) => { const h = look(q); let ok = false; if (h) ok = chk.f ? h.f >= chk.f[0] && h.f <= chk.f[1] : chk.k ? h.k >= chk.k[0] && h.k <= chk.k[1] : h.top3.some((t) => chk.id.test(t)); return { q, ok, tag: h ? h.tag : null, k: h ? h.k : null, f: h ? h.f : null }; });
    const distinct = new Set(res.filter((r) => r.tag).map((r) => r.tag)).size, tuldi = res.filter((r) => r.ok).length;
    return { guruh, slotlar: res.length, tuldi, bosh: res.filter((r) => !r.ok).map((r) => r.q), bitta: res.length > 1 && distinct <= 1, res };
  });
}
module.exports = { SLOTLAR: G, run };
if (require.main === module) {
  const out = run(ROOT);
  if (argv.includes('--json')) console.log(JSON.stringify(out.map(({ res, ...x }) => x), null, 1));
  else if (argv.includes('--md')) { console.log('| Guruh | To\'ldirilgan | Bo\'sh slotlar |\n|---|---|---|'); out.forEach((g) => console.log('| ' + g.guruh + ' | ' + g.tuldi + ' / ' + g.slotlar + (g.bitta ? ' (BITTA variant)' : '') + ' | ' + (g.bosh.join(', ') || '—') + ' |')); }
  else out.forEach((g) => console.log((g.bitta ? 'BITTA ' : g.bosh.length ? 'BO\'SH  ' : 'ok    ') + g.guruh.padEnd(24) + (g.tuldi + ' / ' + g.slotlar).padEnd(8) + (g.bosh.length ? ' ✗ ' + g.bosh.join(', ') : '')));
}
