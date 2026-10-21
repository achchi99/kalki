// KalkiFit taqdimoti: HTML (1920×1080 slaydlar, UZ lotin) → PDF.   node taqdimot/yasash/skrinshot.mjs && node taqdimot/yasash/yasash.mjs
import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright'; import { track } from '../../tools/test-cleanup.cjs';
const DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const R = (f) => 'rasm/' + f;
const ph = (f, cls = '') => `<div class="ph ${cls}"><img src="${R(f)}"></div>`;
const pair = (a, b = a) => `<div class="phones">${ph(a + '-light.jpg')}${ph(b + '-dark.jpg')}</div>`;
const IC = {
  db: '<path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  check: '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  android: '<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M8 8a4 4 0 0 1 8 0M9 19v2M15 19v2M8 4 7 2M16 4l1-2"/>',
  steps: '<path d="M7 17c-2 0-3-1.5-3-4s1-6 3-6 3 3 3 6-1 4-3 4zM7 17v3M17 13c-2 0-3-1.5-3-4s1-6 3-6 3 3 3 6-1 4-3 4zM17 13v3"/>',
  cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  scale: '<path d="M12 3v18M5 21h14M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
};
const ic = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg>`;
const items = (arr) => `<div class="items">${arr.map(([k, t]) => `<div class="it"><span class="ic">${ic(k)}</span><span>${t}</span></div>`).join('')}</div>`;
const lines = (arr) => arr.map((t) => `<p class="ln">${t}</p>`).join('');
const S = [];
const slide = (theme, body, cls = '') => S.push(`<section class="sl ${theme} ${cls}">${body}<footer>KalkiFit</footer></section>`);
const split = (theme, h, txt, vis, cls = '') => slide(theme, `<div class="txt">${h}${txt}</div><div class="vis">${vis}</div>`, 'split ' + cls);
// 1
slide('dark', `<div class="txt"><div class="logo"><span>K</span></div><h1 class="mega">KalkiFit</h1><p class="sub">O‘zingiz yoqtirgan taomlar bilan yaxshiroq ovqatlaning</p></div><div class="vis">${pair('bugun')}</div>`, 'split cover');
// 2
slide('light', `<div class="center"><div class="kick">Muammo</div><h2 class="big">O‘zbek taomi kaloriya ilovalarida<br>yoki yo‘q, yoki <b class="acc">«yomon»</b></h2><div class="lns">${lines(['Osh, lag‘mon, somsa — bazada yo‘q yoki noto‘g‘ri hisoblangan', 'Bor bo‘lsa ham — «ozish uchun yemang» deb qoralanadi', 'Ta’qiqlar zeriktiradi — odam ilovani tashlab ketadi'])}</div></div>`, 'cen');
// 3
slide('dark', `<div class="center"><div class="kick">G‘oya</div><h2 class="big">Kaloriya sanagich emas — dasturxoningizga yordamchi</h2><div class="cards">${[['heart', 'Ta’qiqlamaymiz — yengilroq yo‘lni ko‘rsatamiz'], ['eye', 'Tushunarli — hamma narsa bir ekranda'], ['scale', 'Ochiq raqamlar — manbasi ko‘rsatilgan']].map(([k, t]) => `<div class="card"><span class="ic">${ic(k)}</span><p>${t}</p></div>`).join('')}</div></div>`, 'cen');
// 4
split('light', '<h2>Bir ekranda hammasi</h2>', lines(['Qancha qoldi — bir qarashda', 'Ovqat qo‘shish — bir bosishda']), pair('bugun'));
// 5
split('dark', '<h2><b class="acc">300+</b> o‘zbek va jahon taomi</h2>', lines(['📷 Taomni rasmga oling — kaloriyasi o‘zi chiqadi', 'Gap bilan yozing — AI o‘zi ajratadi', 'Kosa, lagan — o‘z idishlaringiz bilan']), `<div class="phones">${ph('foto-light.jpg')}${ph('qoshish-dark.jpg')}</div>`);
// 6
split('light', '<div class="kick">✨ Retseptingizni yengillashtiring</div>', `<div class="num"><s>1188</s> → <b class="acc">927</b> <small>kkal</small></div>` + lines(['Uy oshi, 1 porsiya: <b class="acc">−22%</b>', 'Ta’mi qoladi: dumba, yog‘ va go‘sht muvozanati']), pair('retsept'), 'wow');
// 7
split('dark', '<h2>Ulashing — do‘stlar ham ko‘rsin</h2>', lines(['Telegram va Instagram uchun tayyor kartochka']), `<div class="phones"><img class="card1" src="${R('karta-light.png')}">${ph('ulashish-dark.jpg')}</div>`);
// 8
split('light', '<h2>Bugun nima yeymiz?</h2>', lines(['Kafeda, buyurtma yoki uyda', 'Oqsilga boy va yengilroq — belgi bilan']), pair('yeymiz'));
// 9
split('dark', '<h2>Qizil go‘sht o‘rniga — tovuq va baliq</h2>', lines(['Oqsil saqlanadi, yog‘ kamayadi', 'Farq kam bo‘lsa — shuni ochiq aytamiz']), pair('orniga'));
// 10
split('light', '<h2>🐟 Baliq kuni</h2>', lines(['Haftada bir kun eslatma — kunni o‘zingiz tanlaysiz', 'Buyurtma, kafe yoki uyda — retsept va xarid ro‘yxati bilan']), `<div class="phones">${ph('baliqchip-light.jpg')}${ph('baliq-dark.jpg')}</div>`);
// 11
split('dark', '<h2>Yemaydiganlarim</h2>', lines(['Baliq, tuxum, sut, yong‘oq, glyuten — belgilang, takliflarda chiqmaydi', 'Allergiya yoki odat — o‘zingiz belgilaysiz']), pair('profil'));
// 12
split('light', '<h2>💊 Vitamin va BAD — kerakmi?</h2>', lines(['Ko‘pchilikka kerak emas — avval ovqatingizni ko‘ring', 'Reklamasiz, ochiq maslahat']), pair('supp-tarix', 'supp'));
// 13
split('light', '<h2><b class="acc">30</b> soniyada boshlash</h2>', lines(['Klaviaturasiz — barmoq bilan suring', 'Xohlasangiz — keyinroq']), `<div class="phones">${ph('onboarding-dark.jpg')}${ph('intro-light.jpg')}</div>`);
// 14
slide('dark', `<div class="center"><h2 class="big">Raqamlarga ishonsa bo‘ladi</h2>${items([['db', 'USDA va Skurixin ma’lumotlari'], ['tag', 'Kafe porsiyalari — «taxminiy» deb ochiq yozilgan'], ['check', 'Har taom kaloriya formulasi bilan tekshirilgan']])}</div>`, 'cen');
// 15
slide('light', `<div class="center"><h2 class="big">Maxfiylik va qulaylik</h2>${items([['lock', 'Ma’lumot — telefoningizda'], ['mail', 'Email bilan avtomatik zaxira'], ['globe', 'UZ · ЎЗ · RU, och va to‘q mavzu, katta shrift'], ['chart', 'Statistika faqat anonim sonlar']])}</div>`, 'cen');
// 16
slide('dark', `<div class="center"><h2 class="big">Keyingi qadamlar</h2>${items([['phone', 'Android va iPhone ilova'], ['steps', 'Qadamlarni telefon o‘zi sanaydi'], ['cam', 'Daftardagi retseptni rasmga olib yengillashtirish'], ['target', '1 oydan keyin — natijalar: takliflarning necha foizi tanlandi']])}</div>`, 'cen');
// 17
slide('light', `<div class="center end"><div class="logo"><span>K</span></div><h1 class="mega">KalkiFit</h1><div class="qr" id="qr"></div><p class="url">kalki.uz/kalkifit</p><p class="sub">Hozir bepul sinab ko‘ring</p></div>`, 'cen');
const CSS = `@page{size:1920px 1080px;margin:0}*{box-sizing:border-box;margin:0}html,body{background:#18191C}body{font-family:Manrope,sans-serif;-webkit-font-smoothing:antialiased}
.sl{width:1920px;height:1080px;position:relative;overflow:hidden;page-break-after:always;break-after:page;display:flex;align-items:center;padding:0 120px}
.light{background:#F7F5F2;color:#1F2125;--acc:#E8572F;--mut:#5E6470;--card:#fff;--line:#E7E2DB}.dark{background:#18191C;color:#F1EFEB;--acc:#FF7E5C;--mut:#ABA7A0;--card:#212327;--line:#34373D}
.dark{background:radial-gradient(1200px 700px at 85% 30%,#2a1d19 0%,#18191C 60%)}.light{background:radial-gradient(1200px 700px at 85% 30%,#FDEDE7 0%,#F7F5F2 60%)}
footer{position:absolute;left:120px;bottom:44px;font-size:22px;font-weight:600;color:var(--mut);letter-spacing:.02em}
.split .txt{flex:0 0 820px;padding-right:40px}.split .vis{flex:1;display:flex;justify-content:center}
h1.mega{font-size:150px;font-weight:800;letter-spacing:-.04em;line-height:1}h2{font-size:76px;font-weight:800;letter-spacing:-.03em;line-height:1.08;margin-bottom:44px}h2.big{font-size:80px;max-width:1500px;margin:0 auto 56px}
.kick{font-size:44px;font-weight:800;color:var(--acc);text-transform:none;margin-bottom:22px;letter-spacing:.01em}.wow .kick{font-size:64px;font-weight:800;color:inherit;letter-spacing:-.03em;line-height:1.1;margin-bottom:30px}
.sub{font-size:42px;font-weight:500;color:var(--mut);line-height:1.3;margin-top:34px;max-width:760px}
.ln{font-size:38px;font-weight:500;line-height:1.35;color:var(--mut);margin:0 0 26px;padding-left:34px;position:relative}.ln:before{content:'';position:absolute;left:0;top:.55em;width:14px;height:14px;border-radius:50%;background:var(--acc)}.ln b{color:var(--acc)}
.acc{color:var(--acc)}
.num{font-size:120px;font-weight:800;letter-spacing:-.04em;line-height:1;margin:6px 0 44px;white-space:nowrap}.num s{color:var(--mut);font-weight:700;font-size:84px;text-decoration-thickness:6px}.num small{font-size:48px;font-weight:700;color:var(--mut)}
.phones{display:flex;gap:48px;align-items:center}
.ph{width:400px;height:866px;border-radius:66px;padding:12px;background:#0d0e10;box-shadow:0 40px 90px -30px rgba(0,0,0,.45),0 0 0 2px rgba(255,255,255,.06) inset}.light .ph{box-shadow:0 40px 90px -30px rgba(60,30,10,.35)}
.ph img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:54px;display:block}
.card1{width:400px;height:500px;border-radius:36px;box-shadow:0 40px 90px -30px rgba(0,0,0,.6)}
.logo{display:flex;align-items:center;gap:18px;font-size:34px;font-weight:700;margin-bottom:40px}.logo span{width:72px;height:72px;border-radius:22px;background:#E8572F;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:40px}.dark .logo span{background:#FF7E5C;color:#1C0C06}
.cen{justify-content:center;text-align:center}.center{width:100%}.center .ln{display:table;margin:0 auto 24px;font-size:42px}.center .lns{display:inline-block;text-align:left}.center .lns .ln{margin:0 0 24px}
.cards{display:flex;gap:40px;justify-content:center}.card{width:460px;background:var(--card);border:1px solid var(--line);border-radius:36px;padding:48px 40px;text-align:left}.card p{font-size:36px;font-weight:600;line-height:1.3;margin-top:28px}
.ic{display:inline-flex;width:84px;height:84px;border-radius:24px;align-items:center;justify-content:center;background:color-mix(in srgb,var(--acc) 16%,transparent);color:var(--acc);flex:none}.ic svg{width:46px;height:46px}
.items{display:grid;gap:30px;max-width:1300px;margin:0 auto;text-align:left}.it{display:flex;align-items:center;gap:34px;font-size:44px;font-weight:600;line-height:1.25}.it b{color:var(--acc)}.it small{display:block;font-size:28px;font-weight:500;color:var(--mut);margin-top:8px}
.end .logo{justify-content:center;margin-bottom:10px}.end h1.mega{font-size:130px}.qr{width:330px;height:330px;margin:44px auto 28px;padding:24px;background:#fff;border-radius:32px;box-shadow:0 30px 70px -30px rgba(60,30,10,.35)}.qr img,.qr canvas{width:282px!important;height:282px!important}
.url{font-size:48px;font-weight:800;color:var(--acc)}.end .sub{margin:14px auto 0}
.cover h1.mega{margin-bottom:0}.cover .logo{margin-bottom:56px}`;
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="preconnect" href="https://fonts.gstatic.com"><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=block" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script><style>${CSS}</style></head><body>${S.join('\n')}
<script>new QRCode(document.getElementById('qr'),{text:'https://kalki.uz/kalkifit',width:564,height:564,colorDark:'#1F2125',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});</script></body></html>`;
fs.writeFileSync(path.join(DIR, 'taqdimot.html'), html);
const b = track(await chromium.launch());
try { const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); await p.goto('file://' + path.join(DIR, 'taqdimot.html'), { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  const bad = await p.evaluate(() => [...document.querySelectorAll('.sl')].map((s, i) => { const r = s.getBoundingClientRect(); const o = [...s.querySelectorAll('*')].filter((e) => { const q = e.getBoundingClientRect(); return q.width && (q.right > r.right + 1 || q.bottom > r.bottom - 60 && !e.closest('footer') || q.left < r.left - 1); }).map((e) => e.className || e.tagName); return o.length ? (i + 1) + ': ' + o.slice(0, 3).join(',') : null; }).filter(Boolean)); console.log('chegaradan chiqqan:', bad.length ? bad : 'yo\'q');
  console.log('font:', await p.evaluate(() => document.fonts.check('800 80px Manrope', 'Қўғҳ')));
  await p.pdf({ path: path.join(DIR, 'KalkiFit-taqdimot.pdf'), width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
} finally { await b.close(); }
console.log('PDF:', (fs.statSync(path.join(DIR, 'KalkiFit-taqdimot.pdf')).size / 1048576).toFixed(1) + ' MB');
