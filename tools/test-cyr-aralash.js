#!/usr/bin/env node
/* kalki.uz — ЎЗ (kirill) matnlarda ARALASH ALIFBO yo'qligini tekshiradi: bitta so'z ichida lotin va kirill harfi birga
 * kelsa («wеб», «ПWА», «WҳатсАпп») — YIQILADI. Qo'shimchasi defis yoki apostrof bilan ajratilgan brend shakllari
 * («Word-га», «iPhone'да», «API-дан») alohida so'z hisoblanadi — mustasno.
 * Shuningdek o'zbekcha matnda inglizcha «link», «app», «dark», «TG» (→ havola, ilova, to'q, Telegram) va «UZS» (→ so'm) qolmasin.
 *
 * Manba (ЎЗ = UZ matnning brauzerdagi transliteratsiyasi, assets/translit.js):
 *   - barcha UZ sahifalar (*.html): <body> ichidagi ko'rinadigan matn va title/alt/placeholder/aria-label atributlari;
 *   - assets/*.js va sahifadagi <script> satrlari: foydalanuvchiga chiqadigan jumlalar (kod satrlari filtrlanadi);
 *   - data/*.json: matnli qiymatlar (ru kalitidagilar emas).
 *   node tools/test-cyr-aralash.js          (chiqish kodi 1 — muammo bor) */
'use strict';
const fs = require('fs'), path = require('path');
const { translit } = require('../assets/translit.js');
const ROOT = path.resolve(__dirname, '..');

const SKIP_JS = new Set(['translit.js', 'cyr.js', 'docx.umd.min.js']);         // o'giruvchining o'zi, kirill jadvali, kutubxona
const CYR = /[\u0400-\u04FF]/, LAT = /[A-Za-z]/;
const LETTERS = /[A-Za-z\u0400-\u04FF]+/g;
/* Ruxsat etilgan so'zlar: hozircha yo'q — kerak bo'lsa sababini izohda yozing */
const ALLOW = new Set([]);
/* O'zbekcha matnda bo'lmasligi kerak (o'rniga) — faqat ko'rinadigan matnda, butun so'z sifatida */
const BAN = { link: 'havola', app: 'ilova', dark: "to'q", TG: 'Telegram', UZS: "so'm" };

/* data/: faqat sayt/ilova yuklaydigan fayllar; manba izohlari (inglizcha USDA/ODS tavsifi) foydalanuvchiga chiqmaydi */
const JSON_SITE = /^(yeymiz|uyda|qoshimchalar|qadamlar|ovqatlar|orinbosar|oqsil-manba|masofalar|ijara-stavkalari|hazillar-kalkifit|cheklov-teglar|yangiliklar-[a-z]+)\.json$/;
const JSON_SKIP_KEYS = new Set(['m', 'izoh', 'manba', 'src', 'levelWhy', 'usda', 'q']);
const items = [];                                                   // { src, text }
const add = (src, text) => { if (text && /[A-Za-z]{2}/.test(text)) items.push({ src, text }); };

/* --- JS satrlari: faqat odamga chiqadigan jumlalar --- */
function jsStrings(code, src) {
  code = code.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');   // izohlar foydalanuvchiga chiqmaydi
  const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g; let m;
  while ((m = re.exec(code))) {
    let s = m[1] != null ? m[1] : m[2];
    s = s.replace(/\\(['"\\])/g, '$1').replace(/\\u([0-9a-fA-F]{4})/g, (x, h) => String.fromCharCode(parseInt(h, 16)));
    if (CYR.test(s)) continue;                                      // ruscha satr — o'girilmaydi
    const t = s.replace(/<[^>]*>/g, ' ').replace(/\{\w+\}/g, ' ').replace(/&[a-z]+;/g, ' ');
    if (!/\s/.test(t.trim()) && !/[a-z]'[a-z]/i.test(t)) continue;  // bitta so'zli (kalit/klass/id) satr — kod
    if (/[;{}()=$\\|`]|=>|\bfunction\b|\bvar\b|\breturn\b|https?:|\.(js|css|json|html|png|webp|svg)\b|\[data-|^\s*[.#][\w-]/.test(t)) continue;
    if (/^[\s\w.,:#%/-]*$/.test(t) && !/[a-z]{3,}\s+[a-z]{3,}/i.test(t)) continue;
    add(src, t);
  }
}
/* --- HTML: ko'rinadigan matn + atributlar; ichki <script> satrlari --- */
function html(file) {
  const raw = fs.readFileSync(file, 'utf8'), rel = path.relative(ROOT, file);
  const bm = /<body[^>]*>([\s\S]*)<\/body>/i.exec(raw); if (!bm) return;
  let b = bm[1];
  b.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (x, c) => { if (!/application\/ld\+json/.test(x)) jsStrings(c, rel + ' <script>'); return ''; });
  b = b.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  b = b.replace(/<([a-z][\w-]*)\b[^>]*\bdata-cyr="skip"[^>]*>[\s\S]*?<\/\1>/gi, ' ');      // o'girilmaydigan qismlar
  b.replace(/\b(?:title|alt|placeholder|aria-label)="([^"]*)"/gi, (x, v) => { add(rel + ' @attr', v); return ''; });
  b.replace(/<[^>]+>/g, '\n').split('\n').forEach((l) => { const t = l.replace(/&nbsp;/g, ' ').replace(/&[a-z]+;|&#\d+;/g, ' ').trim(); if (t && !CYR.test(t)) add(rel, t); });
}
/* --- JSON: matnli qiymatlar (ru emas) --- */
function json(file) {
  const rel = path.relative(ROOT, file); let j; try { j = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return; }
  (function walk(v, key) {
    if (typeof v === 'string') { if (key !== 'ru' && !JSON_SKIP_KEYS.has(key) && !CYR.test(v) && /\s/.test(v.trim()) && !/https?:|\.(js|json|png|webp)\b/.test(v)) add(rel + (key ? ' .' + key : ''), v); return; }
    if (Array.isArray(v)) v.forEach((x) => walk(x, key)); else if (v && typeof v === 'object') Object.keys(v).forEach((k) => walk(v[k], k));
  })(j, null);
}

fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).forEach((f) => html(path.join(ROOT, f)));
fs.readdirSync(path.join(ROOT, 'assets')).filter((f) => f.endsWith('.js') && !SKIP_JS.has(f)).forEach((f) => jsStrings(fs.readFileSync(path.join(ROOT, 'assets', f), 'utf8'), 'assets/' + f));
fs.readdirSync(path.join(ROOT, 'data')).filter((f) => JSON_SITE.test(f)).forEach((f) => json(path.join(ROOT, 'data', f)));

const mixed = new Map(), banned = new Map();
const note = (map, k, src, ctx) => { const e = map.get(k) || { n: 0, src: new Set(), ctx }; e.n++; e.src.add(src); map.set(k, e); };
for (const it of items) {
  const out = translit(it.text);
  for (const w of out.match(LETTERS) || []) if (LAT.test(w) && CYR.test(w) && !ALLOW.has(w)) note(mixed, w, it.src, out.slice(0, 90));
  for (const w of Object.keys(BAN)) if (new RegExp('(?<![A-Za-z\'’.@/_-])' + w + '(?![A-Za-z\'’._/-])').test(it.text)) note(banned, w, it.src, it.text.slice(0, 90));
}
let bad = 0;
if (mixed.size) { console.log('ARALASH ALIFBO (bitta so\'zda lotin + kirill):'); for (const [w, e] of mixed) { bad++; console.log('  ' + w + '  ×' + e.n + '  ' + [...e.src].slice(0, 3).join(', ') + '\n      «' + e.ctx + '»'); } }
if (banned.size) { console.log('O\'ZBEKCHA MATNDA INGLIZCHA SO\'Z:'); for (const [w, e] of banned) { bad++; console.log('  ' + w + ' → ' + BAN[w] + '  ×' + e.n + '  ' + [...e.src].slice(0, 4).join(', ') + '\n      «' + e.ctx + '»'); } }
console.log(bad ? '\nYIQILDI: ' + bad + ' ta muammo (' + items.length + ' ta matn tekshirildi)' : 'OK   ЎЗ aralash alifbo yo\'q, taqiqlangan inglizcha so\'z yo\'q (' + items.length + ' ta matn)');
process.exit(bad ? 1 : 0);
