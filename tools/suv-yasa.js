#!/usr/bin/env node
/* kalki.uz — «suv ulushi» jadvali: data/suv-ulush.json (id → 0…1). Ichimlik yoki suyuq taom yozilganda ml × ulush kunlik suv hisobiga qo'shiladi (assets/kalkifit-core.js: waterInfo).
 * Ilmiy asos: EFSA (kunlik suyuqlik me'yoriga deyarli barcha ichimliklar kiradi); Killer va boshq. 2014 (me'yordagi qahva suv kabi namlaydi); Maughan 2016 «Beverage Hydration Index».
 * Qoida (shu fayl; jadvalni qo'lda ham o'zgartirsa bo'ladi — data/suv-ulush.json ni tahrirlang, --yoz bilan qayta yasalsa qo'l o'zgarishi YO'QOLADI, shuning uchun ISTISNO/QO'SHIMCHA ro'yxatlarini shu yerda yuriting):
 *   • t = 'i' (ichimliklar) → 1.0: suv, choy, qahva, kompot, sharbat, nektar, limonad, gazli, energetik, kvas, kakao, smuzi, sut o'simlik…; spirtli (pivo, vino) → 0;
 *   • sut, ayron, kefir, qatiq, pahta (suyuq sut mahsulotlari) va protein kokteyl → 1.0;  • suyuq taomlar (sho'rva, mastava, uxa, chalop, mampar, borsh, unash, kesma, moshxo'rda…) → 0.6;  • qolgan hammasi → 0 (jadvalda yo'q).
 *   node tools/suv-yasa.js [--yoz]   (--yoz bo'lmasa faqat sarhisob) */
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const foods = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')).foods, ids = new Set(foods.map((f) => f.i));
const SPIRTLI = ['pivo', 'vino'];                                                           // → 0 (hisobga kirmaydi)
const SUT_ICHIMLIK = ['sut', 'sut-yogsiz', 'ayron', 'kefir', 'kefir-qulupnay', 'qatiq', 'qatiq-yogsiz', 'pahta', 'protein-kokteyl-tayyor'];
const SUYUQ_TAOM = ['shurva', 'tovuq-shurva', 'uy-tovuq-shurva', 'mastava', 'moshxorda', 'moshxorda-gostsiz', 'chalop', 'mampar', 'unash', 'kesma', 'borsch', 'chuchvara-sho',
  'qaynatma-baliq', 'baliq-shurva', 'loviya-shurva', 'yasmiq-shurva', 'shurva-tovuq-lapsha', 'shurva-pomidor', 'shurva-mol-sabzavot',
  'kafe-shurva', 'kafe-mastava', 'kafe-moshxorda', 'kafe-chuchvara-shorva', 'kafe-tovuq-shurva', 'kafe-kartoshka-shurva', 'kafe-baliq-shurva', 'kafe-lagmon-qoy', 'tr-mercimek', 'tr-ezogelin'];
const u = {};
foods.forEach((f) => { if (f.t === 'i') u[f.i] = SPIRTLI.includes(f.i) ? 0 : 1; });
SUT_ICHIMLIK.forEach((i) => { u[i] = 1; }); SUYUQ_TAOM.forEach((i) => { u[i] = 0.6; });
foods.forEach((f) => { if (f.al && f.al.f && u[f.al.f] != null) u[f.i] = u[f.al.f]; });        // alias (yashirin) id'lar asl taom ulushini oladi
const bad = Object.keys(u).filter((i) => !ids.has(i)); if (bad.length) { console.error('bazada yo\'q id: ' + bad.join(', ')); process.exit(1); }
const out = { v: 1, izoh: "Suv ulushi (0–1): ichimlik/suyuq taom ml'ining qancha qismi kunlik suv hisobiga kiradi. 1 — to'liq (suv, choy, qahva, sharbat, sut…), 0,6 — suyuq taomlar (sho'rva…), 0 — spirtli (pivo, vino). Jadvalda YO'Q taom = 0. Qo'lda o'zgartirish mumkin (tools/suv-yasa.js yuqoridagi ro'yxatlar bilan qayta yasaydi). Asos: EFSA; Killer 2014; Maughan 2016.", ulush: Object.fromEntries(Object.keys(u).sort().map((k) => [k, u[k]])) };
const n1 = Object.values(u).filter((x) => x === 1).length, n6 = Object.values(u).filter((x) => x === 0.6).length, n0 = Object.values(u).filter((x) => x === 0).length;
console.log('suv ulushi: 1.0 — ' + n1 + ', 0.6 — ' + n6 + ', 0 (spirtli) — ' + n0);
if (process.argv.includes('--yoz')) { fs.writeFileSync(path.join(ROOT, 'data/suv-ulush.json'), JSON.stringify(out, null, 1) + '\n'); console.log('data/suv-ulush.json yozildi'); }
