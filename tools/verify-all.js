/* kalki.uz — yakuniy tekshiruv ro'yxati.
 *   node tools/verify-all.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { load } = require('./render');

const ROOT = path.resolve(__dirname, '..');
const P = (f) => path.join(ROOT, f);
const rows = [];
const ok = (n, pass, note) => rows.push([n, pass, note || '']);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function calcKredit(dom, amount, term) {
  const w = dom.window, d = w.document;
  d.getElementById('amount').value = String(amount);
  d.getElementById('rate').value = '24';
  d.getElementById('term').value = String(term);
  d.getElementById('calcBtn').click();
  await wait(700);
  return d.getElementById('partners-slot');
}

(async () => {
  /* ---------- 1: JSON yuklanmasa blok yashiriladi ---------- */
  {
    const { dom, errors } = await load(P('kredit-kalkulyator.html'), { shims: false }); // fetch yo'q = yuklanmaydi
    const slot = dom.window.document.getElementById('partners-slot');
    const w = dom.window, d = w.document;
    d.getElementById('amount').value = '50000000';
    d.getElementById('rate').value = '24'; d.getElementById('term').value = '36';
    d.getElementById('calcBtn').click();
    await wait(500);
    ok('1. fetch yiqilsa blok yashirin, konsolda xato yo\'q',
      slot.hidden && slot.innerHTML === '' && errors.length === 0,
      'hidden=' + slot.hidden + ' xato=' + errors.length);
    // hisob buzilmaganini ham tekshiramiz
    ok('1b. blok yiqilsa ham kalkulyator ishlaydi',
      /\d/.test(d.getElementById('mainNum').textContent), d.getElementById('mainNum').textContent);
    dom.window.close();
  }

  /* ---------- 2-5, 7-12: asosiy oqim ---------- */
  {
    const { dom, errors } = await load(P('kredit-kalkulyator.html'), { shims: true });
    const w = dom.window, d = w.document;
    const slot = d.getElementById('partners-slot');

    ok('8. hisobdan oldin blok ko\'rinmaydi', slot.hidden === true, 'hidden=' + slot.hidden);
    ok('7. konteynerda data-nosnippet', slot.hasAttribute('data-nosnippet'));

    await calcKredit(dom, '50 000 000', 36);
    const cards = [...slot.querySelectorAll('.pt-card')];
    ok('3. 4 tadan ko\'p chiqmaydi', cards.length <= 4, cards.length + ' ta');
    ok('2. active:false / muddati o\'tgan chiqmaydi',
      !cards.some((c) => /expired|inactive/.test(c.getAttribute('data-pt') || '')), 'sinov yozuvi yo\'q');
    ok('5b. organic da rel=nofollow',
      cards.every((c) => c.getAttribute('rel') === 'nofollow noopener'),
      cards.map((c) => c.getAttribute('rel'))[0]);
    ok('25. logotip o\'lchamlari HTML da',
      cards.every((c) => { const i = c.querySelector('img.pt-logo'); return !i || (i.getAttribute('width') && i.getAttribute('height')); }),
      'width/height bor');
    ok('disclaimer bor', /vositachi emas/.test(slot.textContent));

    // 9: bosishda beacon
    const events = [];
    w.gtag = function (t, n, p) { events.push({ n: n, p: p }); };
    cards[0].click();
    await wait(120);
    const clickEv = events.find((e) => e.n === 'partner_click');
    ok('9. bosishda transport_type=beacon',
      !!clickEv && clickEv.p.transport_type === 'beacon', clickEv ? JSON.stringify(clickEv.p.transport_type) : 'hodisa yo\'q');
    ok('11. bucket oraliq, aniq summa emas',
      !!clickEv && /^\d+-\d+mln$|mlrd/.test(clickEv.p.bucket) && !String(clickEv.p.bucket).includes('50000000'),
      clickEv ? clickEv.p.bucket : '—');
    ok('4b. position yuboriladi', !!clickEv && clickEv.p.position === 1, clickEv ? clickEv.p.position : '—');

    // 10: impression sessiyada bir marta.
    // Impression 1 soniya ko'rinib turgandan keyin yoziladi, shuning uchun
    // birinchi renderning hodisalari to'liq tushishini kutamiz, keyingina
    // qayta render qilib DELTA ni o'lchaymiz.
    await wait(1400);
    const imps1 = events.filter((e) => e.n === 'partner_impression').length;
    await calcKredit(dom, '50 000 000', 36);   // qayta hisob = qayta render
    await wait(1400);
    const imps2 = events.filter((e) => e.n === 'partner_impression').length;
    ok('10. impression sessiyada bir marta (qayta renderda takrorlanmaydi)',
      imps1 > 0 && imps2 === imps1,
      'birinchi=' + imps1 + ' qayta renderdan keyin=' + imps2 + ' (delta=' + (imps2 - imps1) + ')');

    // 13: RU
    d.getElementById('langRu').click();
    await wait(600);
    const ruTxt = slot.textContent;
    ok('13. RU da blok ruschada',
      /Реклама|Смотреть на сайте|не является посредником/.test(ruTxt), 'disclaimer RU');
    ok('JS xatosi yo\'q', errors.length === 0, errors.slice(0, 1).join(''));
    dom.window.close();
  }

  /* ---------- 4: fallback + partner_empty ---------- */
  {
    const { dom } = await load(P('kredit-kalkulyator.html'), { shims: true });
    const w = dom.window, d = w.document;
    const events = [];
    w.gtag = function (t, n, p) { events.push({ n: n, p: p }); };
    const slot = await calcKredit(dom, '1 000', 1);   // hech bir match'ga tushmaydi
    await wait(300);
    ok('4. mos hamkor yo\'q -> fallback',
      !!slot.querySelector('.pt-fallback'), slot.querySelector('.pt-fallback') ? 'fallback bor' : 'yo\'q');
    ok('4b. partner_empty yuboriladi',
      events.some((e) => e.n === 'partner_empty'), events.filter((e) => e.n === 'partner_empty').length + ' ta');
    dom.window.close();
  }

  /* ---------- 5, 6: paid belgisi va zakot taqiqi (Partners moduli) ---------- */
  {
    const { dom } = await load(P('kredit-kalkulyator.html'), { shims: true });
    const w = dom.window, d = w.document;
    const slot = d.getElementById('partners-slot');
    // sun'iy paid hamkor bilan chizamiz
    w.fetch = function () {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({
        updated: '2026-08-08',
        partners: [
          { id: 'paid-x', name: { uz: 'Paid X', ru: 'Paid X' }, url: 'https://example.com/',
            type: 'paid', categories: ['kredit'], active: true, valid_until: '2030-01-01', priority: 9 },
          { id: 'expired-y', name: { uz: 'Expired Y', ru: 'Expired Y' }, url: 'https://example.com/',
            type: 'organic', categories: ['kredit'], active: true, valid_until: '2020-01-01' },
          { id: 'inactive-z', name: { uz: 'Inactive Z', ru: 'Inactive Z' }, url: 'https://example.com/',
            type: 'organic', categories: ['kredit'], active: false, valid_until: '2030-01-01' }
        ] }) });
    };
    w.Partners.render({ slot: slot, category: 'kredit', lang: 'uz', context: { amount: 50000000, term: 36 },
      title: { uz: 'T', ru: 'T' } });
    await wait(400);
    const paid = slot.querySelector('[data-pt="paid-x"]');
    ok('5. paid da rel=sponsored va "Reklama" belgisi',
      !!paid && /sponsored/.test(paid.getAttribute('rel')) && /Reklama/.test(paid.textContent),
      paid ? paid.getAttribute('rel') : 'karta yo\'q');
    ok('2. muddati o\'tgan va active:false ko\'rsatilmaydi',
      !slot.querySelector('[data-pt="expired-y"]') && !slot.querySelector('[data-pt="inactive-z"]'),
      'ikkalasi ham yo\'q');
    dom.window.close();
  }

  /* ---------- 12: aylanma tartib ---------- */
  {
    const { dom } = await load(P('kredit-kalkulyator.html'), { shims: true });
    const w = dom.window;
    const list = [{ id: 'a', priority: 0 }, { id: 'b', priority: 0 }, { id: 'c', priority: 0 }];
    const d1 = w.Partners._order(list, new Date(2026, 0, 1)).map((p) => p.id).join('');
    const d2 = w.Partners._order(list, new Date(2026, 0, 2)).map((p) => p.id).join('');
    const d1again = w.Partners._order(list, new Date(2026, 0, 1)).map((p) => p.id).join('');
    ok('12. aylanma tartib: kun o\'zgarsa birinchi o\'rin almashadi', d1 !== d2, d1 + ' -> ' + d2);
    ok('12b. deterministik: bir kunda har doim bir xil', d1 === d1again, d1 + ' = ' + d1again);
    dom.window.close();
  }

  /* ---------- 14, 16: prerender natijasi ---------- */
  {
    const pages = ['kredit-kalkulyator.html', 'ipoteka-kalkulyator.html'];
    let links = 0, gaTags = 0, ptTags = 0, slots = 0;
    pages.forEach((f) => {
      const s = fs.readFileSync(P(f), 'utf8');
      links += (s.match(/data-pt="/g) || []).length + (s.match(/utm_source=kalki\.uz/g) || []).length;
      gaTags += (s.match(/src="ga\.js"/g) || []).length;
      ptTags += (s.match(/assets\/partners\.js/g) || []).length;
      if (/id="partners-slot"[^>]*hidden/.test(s)) slots++;
    });
    ok('14. diskdagi HTML da hamkor havolasi yo\'q, konteyner bor',
      links === 0 && slots === pages.length, 'havola=' + links + ' konteyner=' + slots + '/' + pages.length);
    ok('16. ga.js va partners.js aynan bittadan',
      gaTags === pages.length && ptTags === pages.length, 'ga=' + gaTags + ' partners=' + ptTags);
  }

  /* ---------- 17, 21: og:image ---------- */
  {
    const dir = path.join(ROOT, 'assets', 'og');
    const imgs = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.png')) : [];
    const big = imgs.filter((f) => fs.statSync(path.join(dir, f)).size > 300 * 1024);
    ok('17. rasmlar yasaldi, 300 KB dan oshmaydi',
      imgs.length >= 54 && big.length === 0, imgs.length + ' ta, katta=' + big.length);

    const htmls = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && f !== 'yandex_5489ebe17687cac1.html');
    const bad = htmls.filter((f) => {
      const s = fs.readFileSync(P(f), 'utf8');
      const m = s.match(/<meta property="og:image" content="([^"]+)"/);
      return !m || !/^https:\/\/kalki\.uz\/assets\/og\/.+\.png\?v=\d+$/.test(m[1]);
    });
    ok('21. og:image absolyut URL va versiya bilan', bad.length === 0,
      bad.length ? bad.slice(0, 3).join(', ') : htmls.length + '/' + htmls.length);
  }

  /* ---------- 23, 24: umumiy ---------- */
  {
    const htmls = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
    const LAT = /[a-zA-Z]/, CYR = /[Ѐ-ӿ]/;
    let esc = [], mixed = [];
    htmls.forEach((f) => {
      const s = fs.readFileSync(P(f), 'utf8');
      if (/\\u[0-9a-fA-F]{4}/.test(s)) esc.push(f);
      const words = s.match(/[\p{L}’']{2,}/gu) || [];
      const mx = [...new Set(words.filter((w) => LAT.test(w) && CYR.test(w)))];
      if (mx.length) mixed.push(f + ':' + mx.slice(0, 2).join(','));
    });
    // assets/*.js ham
    ['assets/partners.js', 'assets/datanote.js', 'assets/lang.js'].forEach((rel) => {
      const s = fs.readFileSync(P(rel), 'utf8');
      if (/\\u[0-9a-fA-F]{4}/.test(s)) esc.push(rel);
    });
    ok('23a. 0 ta \\uXXXX escape', esc.length === 0, esc.join(', ') || htmls.length + ' fayl toza');
    ok('23b. 0 ta aralash alifboli so\'z', mixed.length === 0, mixed.join(', ') || 'toza');
  }
  {
    const htmls = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && f !== 'yandex_5489ebe17687cac1.html');
    let empty = [];
    for (const f of htmls) {
      const { dom } = await load(P(f), { shims: true, wait: 600 });
      const h = dom.window.document.querySelector('h1');
      if (!h || !h.textContent.trim()) empty.push(f);
      dom.window.close();
    }
    ok('24. barcha sahifada h1 bo\'sh emas', empty.length === 0, empty.join(', ') || htmls.length + '/' + htmls.length);
  }

  /* ---------- hisobot ---------- */
  console.log('\n=== TEKSHIRUV RO\'YXATI ===');
  let fail = 0;
  rows.forEach(([n, pass, note]) => {
    if (!pass) fail++;
    console.log((pass ? 'OK   ' : 'FAIL ') + n + (note ? '  — ' + note : ''));
  });
  console.log('\n' + (fail ? fail + ' ta FAIL' : rows.length + ' banddan hammasi OK'));
  process.exit(fail ? 1 : 0);
})();
