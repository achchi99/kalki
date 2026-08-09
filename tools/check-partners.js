/* kalki.uz — hamkor havolalarini tekshirish.
 *
 * Buzilgan tashqi havola sayt ishonchini eng tez yo'qotadigan narsa, va uni
 * hech kim qo'lda kuzatmaydi. Bu skript HECH NARSANI AVTOMATIK O'CHIRMAYDI —
 * faqat hisobot beradi. Qaror odamniki.
 *
 *   node tools/check-partners.js
 *   node tools/check-partners.js --no-net     (faqat qoidalarni tekshiradi)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'assets', 'partners.json');
const NO_NET = process.argv.indexOf('--no-net') > -1;

const WARN_VALID_DAYS = 30;   // valid_until shundan kam qolsa ogohlantirish
const WARN_CHECKED_DAYS = 90; // checked shundan eski bo'lsa ogohlantirish

/* Zakot — diniy majburiyat. Undan komissiya olish sayt obro'siga tuzatib
   bo'lmas zarar yetkazadi, shuning uchun bu kategoriyada to'lovli
   joylashtirish SKRIPT DARAJASIDA taqiqlanadi. */
const NO_PAID_CATEGORIES = ['xayriya'];
const PAID_TYPES = ['paid', 'affiliate'];
const VALID_TYPES = ['organic', 'paid', 'affiliate'];

const errors = [];
const warnings = [];
const info = [];

function days(from, to) { return Math.round((to - from) / 86400000); }

let data;
try {
  data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
} catch (e) {
  console.error('partners.json o\'qib bo\'lmadi: ' + e.message);
  process.exit(2);
}
const list = Array.isArray(data.partners) ? data.partners : [];
const now = new Date();

/* ---------- 1. Sxema va qoidalar ---------- */
const seen = {};
list.forEach((p, i) => {
  const tag = p.id || ('#' + i);

  if (!p.id) errors.push(tag + ': id yo\'q');
  else if (seen[p.id]) errors.push(p.id + ': id takrorlangan');
  seen[p.id] = 1;

  if (!p.url) errors.push(tag + ': url yo\'q');
  if (!p.name || !p.name.uz) errors.push(tag + ': name.uz yo\'q');
  if (!p.name || !p.name.ru) warnings.push(tag + ': name.ru yo\'q — RU tilida UZ nomi ko\'rinadi');

  if (VALID_TYPES.indexOf(p.type) === -1) errors.push(tag + ': noma\'lum type "' + p.type + '"');

  const cats = p.categories || [];
  if (!cats.length) errors.push(tag + ': categories bo\'sh');

  // Zakot taqiqi
  if (PAID_TYPES.indexOf(p.type) > -1) {
    const bad = cats.filter((c) => NO_PAID_CATEGORIES.indexOf(c) > -1);
    if (bad.length) {
      errors.push(tag + ': "' + bad.join(', ') + '" kategoriyasida to\'lovli joylashtirish TAQIQLANGAN '
        + '(type=' + p.type + '). Diniy majburiyat ustidan komissiya olinmaydi.');
    }
  }

  // Logotip fayli bormi
  if (p.logo) {
    const lf = path.join(ROOT, p.logo);
    if (!fs.existsSync(lf)) errors.push(tag + ': logotip fayli yo\'q — ' + p.logo);
  } else {
    warnings.push(tag + ': logo ko\'rsatilmagan');
  }

  // Tavsif tekshirilganmi
  const hasNote = p.note && (p.note.uz || '').trim();
  if (!hasNote) warnings.push(tag + ': note bo\'sh — bank saytidan tekshirib to\'ldiring (o\'ylab topilgan tavsif yozilmaydi)');
  else if (p.note_verified !== true) {
    // XATO, ogohlantirish emas: renderer bunday tavsifni ko'rsatmaydi, ya'ni
    // yozilgan matn jimgina yo'qoladi. Manba faylning o'zi ham toza tursin.
    errors.push(tag + ': note yozilgan, lekin note_verified !== true — bunday tavsif render qilinmaydi');
  }

  // Muddatlar
  if (p.valid_until) {
    const vu = new Date(p.valid_until + 'T23:59:59');
    const left = days(now, vu);
    if (left < 0) warnings.push(tag + ': valid_until O\'TGAN (' + p.valid_until + ') — blokda ko\'rsatilmayapti');
    else if (left <= WARN_VALID_DAYS) warnings.push(tag + ': valid_until ' + left + ' kundan keyin tugaydi (' + p.valid_until + ')');
  } else {
    warnings.push(tag + ': valid_until yo\'q — tugagan kelishuv o\'z-o\'zidan yo\'qolmaydi');
  }

  if (p.checked) {
    const age = days(new Date(p.checked), now);
    if (age > WARN_CHECKED_DAYS) warnings.push(tag + ': oxirgi tekshiruv ' + age + ' kun oldin (' + p.checked + ')');
  } else {
    warnings.push(tag + ': checked sanasi yo\'q');
  }
});

/* ---------- Fallback qamrovi ----------
   Yangi kategoriya qo'shilganda fallback yozish unutilsa, mos hamkor
   bo'lmagan holatda blok UMUMAN chiqmaydi va buni hech kim sezmaydi.
   Shuning uchun sahifalardan so'ralayotgan kategoriyalar yig'iladi va
   har biri uchun faol hamkor YOKI fallback borligi tekshiriladi.
   Bu OGOHLANTIRISH emas, XATO: ogohlantirish o'qilmay qoladi. */
const asked = {};   // kategoriya -> qaysi sahifalar so'raydi
fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).forEach((f) => {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  // Partners.render({... category:'kredit' ...}) — bitta chaqiruvda bitta kategoriya
  const re = /Partners\s*\.\s*render\s*\(\{[\s\S]{0,400}?category\s*:\s*['"]([a-z0-9_-]+)['"]/g;
  let m;
  while ((m = re.exec(s))) (asked[m[1]] = asked[m[1]] || []).push(f);
});

const liveByCat = {};
list.forEach((p) => {
  if (p.active === false) return;
  if (p.valid_until && String(p.valid_until) < new Date().toISOString().slice(0, 10)) return;
  (p.categories || []).forEach((c) => { liveByCat[c] = (liveByCat[c] || 0) + 1; });
});
const fbCats = Object.keys(data.fallback || {});

Object.keys(asked).forEach((c) => {
  if (liveByCat[c] || fbCats.indexOf(c) > -1) return;
  errors.push('"' + c + '" kategoriyasi so\'ralmoqda (' + [...new Set(asked[c])].join(', ')
    + '), lekin faol hamkor ham, fallback ham yo\'q — blok umuman chiqmaydi');
});

// Teskari tekshiruv: JSON'da bor, lekin hech bir sahifa so'ramaydi — chalkashlik belgisi
Object.keys(liveByCat).concat(fbCats).forEach((c) => {
  if (asked[c]) return;
  if (warnings.some((w) => w.indexOf('"' + c + '" kategoriyasini') === 0)) return;
  warnings.push('"' + c + '" kategoriyasini hech bir sahifa so\'ramaydi (hamkor: '
    + (liveByCat[c] || 0) + ', fallback: ' + (fbCats.indexOf(c) > -1 ? 'bor' : 'yo\'q') + ')');
});

/* Fallback havolalari ham tekshiriladi — ular mos hamkor bo'lmaganda
   ko'rsatiladi, ya'ni eng ko'p ko'riladigan havolalardan biri bo'lishi mumkin. */
const targets = list.filter((p) => p.url).map((p) => ({ id: p.id, url: p.url }));
Object.keys(data.fallback || {}).forEach((cat) => {
  const fb = data.fallback[cat];
  if (fb && fb.url) targets.push({ id: 'fallback:' + cat, url: fb.url });
});

/* ---------- 2. Havolalar ---------- */
async function probe(url) {
  const opts = { redirect: 'follow', headers: { 'User-Agent': 'kalki.uz link checker' } };
  try {
    let r = await fetch(url, Object.assign({ method: 'HEAD' }, opts));
    // Ba'zi saytlar HEAD ni qo'llab-quvvatlamaydi — GET bilan qayta urinamiz.
    if (r.status === 405 || r.status === 501 || r.status === 403) {
      r = await fetch(url, Object.assign({ method: 'GET' }, opts));
    }
    return { status: r.status, url: r.url };
  } catch (e) {
    return { status: 0, error: String(e && e.message || e) };
  }
}

(async () => {
  const results = [];
  if (!NO_NET) {
    for (const t of targets) {
      const r = await probe(t.url);
      results.push(Object.assign({}, t, r));
      const bad = (r.status === 0) || r.status === 404 || r.status === 410 || r.status >= 500;
      if (bad) {
        errors.push(t.id + ': havola ishlamayapti — ' + (r.status || 'ulanish xatosi')
          + (r.error ? ' (' + r.error + ')' : '') + ' — ' + t.url);
      } else if (r.status >= 300) {
        warnings.push(t.id + ': ' + r.status + ' — ' + t.url);
      } else {
        info.push(t.id + ': ' + r.status + ' OK');
      }
    }
  }

  /* ---------- 3. Hisobot ---------- */
  console.log('=== partners.json tekshiruvi ===');
  console.log('yangilangan: ' + (data.updated || '—') + ' | hamkorlar: ' + list.length
    + ' | havolalar: ' + targets.length + (NO_NET ? ' (tarmoq tekshiruvi o\'chirilgan)' : ''));

  const cats = {};
  list.forEach((p) => (p.categories || []).forEach((c) => { cats[c] = (cats[c] || 0) + 1; }));
  console.log('kategoriyalar: ' + (Object.keys(cats).map((c) => c + '=' + cats[c]).join(', ') || '—'));

  if (info.length) { console.log('\n-- ishlaydi --'); info.forEach((x) => console.log('   ' + x)); }
  if (warnings.length) { console.log('\n-- ogohlantirish (' + warnings.length + ') --'); warnings.forEach((x) => console.log('   ! ' + x)); }
  if (errors.length) { console.log('\n-- XATO (' + errors.length + ') --'); errors.forEach((x) => console.log('   !! ' + x)); }

  console.log('\n' + (errors.length ? 'XATO BOR — qo\'lda ko\'rib chiqing (hech narsa o\'chirilmadi)' : 'xato yo\'q'));
  process.exit(errors.length ? 1 : 0);
})();
