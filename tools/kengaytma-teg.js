/* kalki.uz — v87: kengaytma qatorlari uchun «Yemaydiganlarim» teglarini USDA komponent tavsifidan AVTOMATIK chiqarish (8a ichimliklar, 8b sho'rvalar).
 * Ehtiyotkor tomon (shubhali — teg qo'yiladi): sut, tuxum, glyuten, baliq, yongoq. «choshqa» tegi bu yerda HECH QACHON qo'yilmaydi (qoida: faqat bekon va pepperoni). */
'use strict';
const fs = require('fs'), path = require('path');
const USDA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data/manba/usda-sr-legacy.json'), 'utf8')).foods;
const RE = { sut: /\bmilk|cheese|yogurt|cream\b|butter\b|whey|kefir|ice cream|milk shake|latte|cappuccino|mocha|eggnog/i, tuxum: /\begg\b|eggs\b|egg noodle|mayonnaise/i, glyuten: /wheat|flour|bread|noodle|pasta|macaroni|spaghetti|barley|semolina|bulgur|couscous|rye|cracker|croissant|biscuit|malt/i, baliq: /\bfish|salmon|cod\b|shrimp|crustacean|mollusk|tuna|pollock|carp|anchov|sardine|squid|crab|fish sauce/i, yongoq: /\bnut\b|nuts\b|almond|hazelnut|walnut|pistachio|cashew|peanut|pecan|coconut/i };
function teglar(rows) {
  const out = { sut: [], tuxum: [], glyuten: [], baliq: [], yongoq: [] };
  rows.forEach((r) => { const src = r[6] || '', ids = (src.match(/u:(\d+)/g) || []).map((x) => x.slice(2)), d = ids.map((i) => (USDA[i] || {}).d || '').join(' | ');
    Object.keys(RE).forEach((t) => { if (RE[t].test(d) && !(t === 'glyuten' && /gluten-free/i.test(d))) out[t].push(r[0]); }); });
  return out;
}
module.exports = { teglar };
