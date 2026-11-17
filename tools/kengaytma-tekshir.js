#!/usr/bin/env node
/* kalki.uz — yangi kengaytma qatorlarini BAZANI YASAMASDAN tekshirish (v87). Yangi qatorlar mavjud bazaga va bir-biriga qarab tekshiriladi.
 *   node tools/kengaytma-tekshir.js tools/ovqatlar-kengaytma8a.js [boshqa fayllar…] [--usda <index.tsv>]
 * --usda: SR Legacy to'liq indeksi (fdc_id \t kcal \t p \t f \t c \t tavsif) — data/manba/usda-sr-legacy.json da hali yo'q id'lar uchun
 *   (keyin: python3 tools/usda-qoshimcha.py <zip> ularni bazaga qo'shadi).
 * Tekshiradi: format, tur, birlik kalitlari, USDA id mavjudligi, nomlar takrori (bazada va yangilar orasida, uz/ru), «A / B», «миска», «lagan»,
 *   makro (4p+4c+9f ≈ kkal), bir porsiya ≤ 1500 kkal, gramm oraliqlari (kosa 150–600 …), sho'rva — faqat kosa, qahva — chashka yoki hajm_*.
 * Chiqaradi: har qator — 100 g va har porsiya kkal (ko'z bilan tekshirish uchun). Xato bo'lsa — chiqish kodi 1. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2), ui = argv.indexOf('--usda'), idxPath = ui >= 0 ? argv[ui + 1] : null;
const files = argv.filter((x, i) => !(ui >= 0 && (i === ui || i === ui + 1)));
const USDA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/manba/usda-sr-legacy.json'), 'utf8')).foods;
const IDX = {}; if (idxPath) fs.readFileSync(idxPath, 'utf8').split('\n').forEach((l) => { const [i, k, p, f, c, d] = l.split('\t'); if (i && k !== '') IDX[i] = { kcal: +k, p: +p || 0, f: +f || 0, c: +c || 0, d }; });
const YQ = fs.existsSync(path.join(ROOT, 'data/manba/yorliq.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'data/manba/yorliq.json'), 'utf8')).yorliq : {};
const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods;
const TUR = new Set('o n s m g v f d i q h x'.split(' '));
const UNITS = { likop: [150, 600], kosa: [150, 600], porsiya: [20, 600], dona: [1, 600], six: [30, 200], bolak: [5, 400], piyola: [100, 300], qoshiq: [5, 40], tilim: [5, 300], stakan: [150, 300], dona_s: [1, 400], dona_l: [1, 600], choyq: [3, 10], shar: [30, 120], hovuch: [10, 60], chashka: [30, 360], shisha: [200, 1500], skup: [20, 80], paket: [10, 1000], banka: [200, 600], shisha05: [500, 500], shisha1: [1000, 1000], shisha15: [1500, 1500], plitka: [20, 200], ryumka: [30, 60], bokal: [100, 300], bog: [10, 200], barg: [1, 20],
  hajm_s: [200, 300], hajm_m: [300, 400], hajm_l: [400, 500], l03: [300, 300], l04: [400, 400], l05: [500, 500] };
const norm = (s) => String(s || '').toLowerCase().replace(/[’‘ʻʼ`´]/g, "'").replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
const SHORVA = /sho'rva|shorva|shurva|mastava|moshxo'rda|bulon|borsh|shchi|solyanka|rassolnik|xarcho|okroshka|uxa\b|krem-sho'rva|sho'rvasi|lapsha|tom yam|ramen|fo\b|qaynatma|piyova|kifta|go'ja|atala|umoch|ugra oshi|suyuq/i;
const QAHVA = /qahva|kofe|kapuchino|latte|amerikano|espresso|doppio|mokko|mokka|raf\b|flet|frappe|kakao|shokolad \(issiq\)|issiq shokolad/i;
const own = new Set(files.flatMap((f) => require(path.resolve(f)).map((r) => r[0])));          // tekshirilayotgan qatorlar bazada allaqachon bo'lsa (yasalgandan keyin) — o'zi bilan solishtirilmaydi
const seen = new Map(); base.filter((f) => !f.h && !own.has(f.i)).forEach((f) => { seen.set('n|' + norm(f.n), 'baza:' + f.i); seen.set('r|' + norm(f.r), 'baza:' + f.i); });
const ids = new Set(base.map((f) => f.i).filter((i) => !own.has(i)));
let err = 0, n = 0; const E = (id, m) => { err++; console.log('XATO  ' + id + ': ' + m); };
const part = (tok) => { if (tok === 'suv') return { kcal: 0, p: 0, f: 0, c: 0 }; const y = /^y:(.+)$/.exec(tok); if (y) { const L = YQ[y[1]]; return L ? { kcal: L.k, p: L.p, f: L.f, c: L.c } : null; } const id = tok.replace(/^u:/, ''); return USDA[id] || IDX[id] || null; };
for (const f of files) {
  const rows = require(path.resolve(f));
  for (const row of rows) {
    n++; const [id, nu, nr, al, t, un, src] = row;
    if (!id || !/^[a-z0-9-]+$/.test(id)) { E(id, 'id noto\'g\'ri'); continue; }
    if (ids.has(id)) E(id, 'id takror'); ids.add(id);
    if (!TUR.has(t)) E(id, 'tur ' + t);
    for (const [l, v] of [['n', nu], ['r', nr]]) { const k = l + '|' + norm(v); if (seen.has(k)) E(id, 'nom takror (' + l + '): «' + v + '» — ' + seen.get(k)); else seen.set(k, id); if (/\S\s\/\s\S/.test(v)) E(id, '«A / B» nom'); }
    if (/миск/i.test(row.join('|'))) E(id, '«миска»'); if (/\blagan|лаган/i.test(nu + nr)) E(id, '«lagan» nomda');
    const us = String(un || '').split(',').map((x) => { const [a, b] = x.split(':'); return [a, +b]; });
    us.forEach(([u, g]) => { if (!UNITS[u]) E(id, 'birlik noma\'lum ' + u); else if (!(g >= UNITS[u][0] && g <= UNITS[u][1])) E(id, 'birlik ' + u + ':' + g + ' oraliqdan tashqari ' + UNITS[u].join('–')); });
    let v = null;
    if (/^u:\d+$/.test(src) || /^y:/.test(src)) v = part(src);
    else if (/^m:/.test(src)) { const ps = src.slice(2).split('+').map((x) => { const i = x.lastIndexOf('*'); return { tok: x.slice(0, i), g: +x.slice(i + 1), q: part(x.slice(0, i)) }; });
      ps.forEach((x) => { if (!x.q) E(id, 'komponent topilmadi ' + x.tok); if (!(x.g > 0)) E(id, 'gramm ' + x.tok); });
      if (ps.every((x) => x.q && x.g > 0)) { const G = ps.reduce((a, x) => a + x.g, 0), s = (k) => ps.reduce((a, x) => a + x.q[k] * x.g / 100, 0) / G * 100; v = { kcal: s('kcal'), p: s('p'), f: s('f'), c: s('c') }; } }
    else E(id, 'manba formati ' + src);
    if (!v) { if (!/^m:/.test(src)) E(id, 'manba topilmadi ' + src); continue; }
    const atw = 4 * v.p + 4 * v.c + 9 * v.f; if (Math.abs(atw - v.kcal) > Math.max(10, v.kcal * 0.15) && !/^(aroq|konyak|vino|pivo)/.test(id)) E(id, 'makro ' + Math.round(atw) + ' ≠ ' + Math.round(v.kcal));
    us.forEach(([u, g]) => { if (v.kcal * g / 100 > 1500) E(id, 'porsiya > 1500 kkal ' + u); });
    const nm = nu + ' ' + id;
    if (t === 'o' && SHORVA.test(nm) && us.some(([u]) => u !== 'kosa' && u !== 'qoshiq')) E(id, "sho'rva — faqat kosa");
    if (t === 'i' && QAHVA.test(nm) && us.some(([u]) => !/^(chashka|hajm_[sml]|banka|shisha05|stakan)$/.test(u))) E(id, 'qahva — chashka yoki hajm_*');
    if (t === 'i' && us.some(([u]) => u === 'piyola') && !/choy|чай/i.test(nm + nr)) E(id, 'piyola faqat choyga');
    console.log('ok    ' + id.padEnd(30) + String(Math.round(v.kcal)).padStart(5) + ' kkal/100g · ' + us.map(([u, g]) => u + ' ' + Math.round(v.kcal * g / 100)).join(', ') + ' · ' + nu);
  }
}
console.log('\n' + n + ' qator, xato: ' + err); process.exit(err ? 1 : 0);
