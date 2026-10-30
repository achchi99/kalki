#!/usr/bin/env node
/* kalki.uz — ishlab chiqaruvchi yorlig'ini Open Food Facts'dan (shtrix-kod bo'yicha) data/manba/yorliq.json ga qo'shadi. Qiymat qo'lda yozilmaydi.
 * Ishlatish: node tools/yorliq-qoshish.js <kalit> <shtrix-kod> [<kalit> <shtrix-kod> …]
 * Tekshiruv: kkal, uglevod bo'lishi shart; oqsil/yog' yorliqda ko'rsatilmagan bo'lsa (ichimliklar) — 0; Atwater (4·O + 9·Y + 4·U) bilan ±15% (yoki ±20 kkal). */
'use strict';
const fs = require('fs'), path = require('path');
const P = path.join(__dirname, '..', 'data', 'manba', 'yorliq.json'), db = JSON.parse(fs.readFileSync(P, 'utf8'));
const args = process.argv.slice(2); if (!args.length || args.length % 2) { console.error('node tools/yorliq-qoshish.js <kalit> <shtrix-kod> …'); process.exit(2); }
(async () => {
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], code = args[i + 1];
    const r = await fetch('https://world.openfoodfacts.org/api/v2/product/' + code + '.json?fields=code,product_name,product_name_ru,brands,quantity,nutriments', { headers: { 'User-Agent': 'kalki.uz-kalkifit/1.0 (yorliq-qoshish)' } });
    const j = await r.json(); if (!j.product) { console.error('XATO: topilmadi', code); process.exitCode = 1; continue; }
    const p = j.product, n = p.nutriments || {}, num = (x) => (x == null || x === '' ? null : Math.round(+x * 10) / 10);
    const k = num(n['energy-kcal_100g']), c = num(n.carbohydrates_100g), pr = num(n.proteins_100g) || 0, f = num(n.fat_100g) || 0;
    if (k == null || c == null) { console.error('XATO: kkal/uglevod yo\'q', code); process.exitCode = 1; continue; }
    const atw = 4 * pr + 9 * f + 4 * c; if (Math.abs(atw - k) > Math.max(20, k * 0.15)) { console.error('XATO: Atwater mos emas', code, k, Math.round(atw)); process.exitCode = 1; continue; }
    db.yorliq[key] = { nom: (p.product_name_ru || p.product_name || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim(), brand: (p.brands || '').split(',')[0].trim(), code: p.code, qadoq: p.quantity || '', k, p: pr, f, c };
    console.log('OK', key, code, db.yorliq[key].nom, k, pr, f, c);
  }
  db.meta.olingan = new Date().toISOString().slice(0, 10); fs.writeFileSync(P, JSON.stringify(db, null, 1) + '\n');
})();
