/* kalki.uz — yakuniy tekshiruv.
 *
 * HECH NARSA YOZMAYDI. Bu shunchaki xushmuomalalik emas: ilgari 6-band
 * yiqilgach 7-band sw-version.js ni yozish rejimida chaqirib faylni
 * tuzatib qo'ygan va ikkinchi yugurishda "hammasi OK" chiqargan — ya'ni
 * tekshiruv o'z natijasini yashirgan. O'z natijasini yashiradigan tekshiruv
 * tekshiruv emas. Buni band 16 ning o'zi ham sinab ko'radi.
 *
 *   node tools/verify-all.js          # hammasi
 *   node tools/verify-all.js --fast   # prerender barqarorligisiz (tez)
 *
 * --check eski nom sifatida qabul qilinadi, standart holat bilan bir xil.
 * Chiqish kodi 0 — hammasi joyida, 1 — muammo bor.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { load, loadHtml, sitePages, SPECIAL_PAGES } = require('./render');

const ROOT = path.resolve(__dirname, '..');
const FAST = process.argv.indexOf('--fast') > -1;
const LAT = /[a-zA-Z]/, CYR = /[Ѐ-ӿ]/;

const results = [];
const add = (okv, name, extra) => results.push({ ok: !!okv, name, extra: extra || '' });

/* Repo holatining barmoq izi — band 16 shu bilan "hech nima yozilmadi" ni
   isbotlaydi. .git va node_modules hisobga olinmaydi. */
function fingerprint() {
  const out = {};
  const walk = (dir, rel) => {
    for (const name of fs.readdirSync(dir).sort()) {
      if (name === '.git' || name === 'node_modules') continue;
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) { walk(full, rel + name + '/'); continue; }
      out[rel + name] = crypto.createHash('sha1').update(fs.readFileSync(full)).digest('hex');
    }
  };
  walk(ROOT, '');
  return out;
}
function fpDiff(a, b) {
  const changed = [];
  Object.keys(b).forEach((k) => { if (a[k] !== b[k]) changed.push(a[k] ? k : k + ' (yangi)'); });
  Object.keys(a).forEach((k) => { if (!(k in b)) changed.push(k + ' (o\'chdi)'); });
  return changed;
}

const pages = sitePages;
function runTool(args) {
  try {
    const out = execFileSync(process.execPath, args.map((a) => (a.endsWith('.js') ? path.join(__dirname, a) : a)),
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status == null ? 1 : e.status, out: String(e.stdout || '') + String(e.stderr || '') };
  }
}

(async () => {
  const list = pages();
  const fpBefore = fingerprint();

  /* ---------- 1. Matn tozaligi ---------- */
  {
    const esc = [], mixed = [];
    // Matn tozaligi SPECIAL_PAGES ga ham tegishli: ular ham foydalanuvchiga
    // ko'rinadi, faqat sayt navigatsiyasidan tashqarida turadi.
    for (const f of list.concat(SPECIAL_PAGES)) {
      const p = path.join(ROOT, f);
      if (!fs.existsSync(p)) continue;
      const src = fs.readFileSync(p, 'utf8');
      if ((src.match(/\\u[0-9a-fA-F]{4}/g) || []).length) esc.push(f);
      const words = src.match(/[\p{L}’']{2,}/gu) || [];
      const bad = [...new Set(words.filter((w) => LAT.test(w) && CYR.test(w)))];
      if (bad.length) mixed.push(f + ': ' + bad.slice(0, 4).join(' '));
    }
    add(!esc.length, '1. 0 ta buzuq \\uXXXX escape', esc.join(', '));
    add(!mixed.length, '2. 0 ta aralash alifboli so\'z', mixed.join(' | '));
  }

  /* ---------- 2. GA teglari, h1, footer ---------- */
  {
    const ga = [], noFoot = [];
    for (const f of list) {
      const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
      if ((src.match(/googletagmanager/g) || []).length) ga.push(f + ' (gtag)');
      if ((src.match(/src="ga\.js"/g) || []).length > 1) ga.push(f + ' (ga.js x2)');
      if (!src.includes('id="legal-links"')) noFoot.push(f);
    }
    add(!ga.length, '3. dublikat GA tegi yo\'q', ga.join(', '));
    add(!noFoot.length, '4. barcha sahifada footer bloki (' + list.length + ')', noFoot.join(', '));
  }

  /* ---------- 3. Bo'sh h1 (render qilingan holatda) ---------- */
  {
    const bad = [];
    for (const f of list) {
      const { dom } = await load(path.join(ROOT, f), { shims: true });
      const hs = [...dom.window.document.querySelectorAll('h1')];
      if (!hs.length || hs.some((h) => !(h.textContent || '').trim())) bad.push(f);
      dom.window.close();
    }
    add(!bad.length, '5. bo\'sh h1 yo\'q (' + list.length + ' sahifa render qilindi)', bad.join(', '));
  }

  /* ---------- 4. sw.js ---------- */
  {
    const r = runTool(['verify-sw.js']);
    const fails = (r.out.match(/^FAIL .*/gm) || []);
    add(r.code === 0, '6. sw.js statik tahlili', fails.join(' | '));
  }

  /* ---------- 5. sw versiyasi avtomatik va barqaror ---------- */
  {
    const before = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
    const r1 = runTool(['sw-version.js']);
    const r2 = runTool(['sw-version.js']);
    const after = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
    add(r1.code === 0 && r2.code === 0 && before === after,
      '7. sw versiyasi assets bilan mos va barqaror (hash)',
      before !== after ? 'tekshiruv faylni o\'zgartirdi' : (r1.code ? 'npm run ship kerak' : ''));
  }

  /* ---------- 6. Hamkorlar ---------- */
  {
    const r = runTool(['check-partners.js', '--no-net']);
    const errs = (r.out.match(/^   !! .*/gm) || []).map((x) => x.trim());
    add(r.code === 0, '8. check-partners (fallback qamrovi, note_verified, zakot taqiqi)', errs.join(' | '));
  }

  /* ---------- 7. og:image ---------- */
  {
    const ogDir = path.join(ROOT, 'assets', 'og');
    const imgs = fs.existsSync(ogDir) ? fs.readdirSync(ogDir).filter((f) => f.endsWith('.png')) : [];
    const big = imgs.filter((f) => fs.statSync(path.join(ogDir, f)).size > 300 * 1024);
    add(imgs.length >= list.length && !big.length,
      '9. og:image ' + imgs.length + ' ta, hammasi 300 KB ichida', big.join(', '));

    const noOg = list.filter((f) => {
      const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
      return !/property="og:image" content="https:\/\/kalki\.uz\/assets\/og\/[^"]+\?v=\d+"/.test(s);
    });
    add(!noOg.length, '10. og:image absolyut URL va versiya parametri bilan', noOg.join(', '));
  }

  /* ---------- 8. Hamkor bloki: prerenderda muzlamagan ---------- */
  {
    const bad = [];
    for (const f of list) {
      const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
      if (!s.includes('data-prerender="skip"')) continue;
      if (/data-pt="/.test(s) || /utm_source=kalki\.uz/.test(s)) bad.push(f);
    }
    add(!bad.length, '11. diskdagi HTML\'da hamkor havolasi yo\'q', bad.join(', '));
  }

  /* ---------- 9. METRICS holatlari ----------
     Ilgari bu band hamkorlik.html ni vaqtincha qayta yozib, keyin
     tiklardi. Jarayon yarim yo'lda uzilsa fayl o'zgargan holda qolib
     ketardi. Endi barcha holatlar XOTIRADA render qilinadi. */
  {
    const f = path.join(ROOT, 'hamkorlik.html');
    const orig = fs.readFileSync(f, 'utf8');
    const withM = (body) => orig.replace(/var METRICS = \{[\s\S]*?\n  \};/, body);

    const { dom: d1 } = await loadHtml(orig, 'hamkorlik.html', { shims: true });
    add(!d1.window.document.querySelector('.stat-box'),
      '12. METRICS to\'liq null -> blok yashiriladi');
    d1.window.close();

    const partial = withM('var METRICS = {\n    period: "2026-07",\n    users: 12400,\n    pageviews: null,\n    mobileShare: 87,\n    topPages: [],\n    updated: "' + new Date().toISOString().slice(0, 10) + '"\n  };');
    const { dom: d2 } = await loadHtml(partial, 'hamkorlik.html', { shims: true });
    const rows = [...d2.window.document.querySelectorAll('.stat-row')];
    add(rows.length === 2 && !rows.some((r) => /ko’rishlari|Просмотр/.test(r.textContent)),
      '13. qisman to\'ldirilgan -> faqat mavjud qatorlar', rows.length + ' qator');
    d2.window.close();

    const stale = withM('var METRICS = {\n    period: "2026-04",\n    users: 100,\n    pageviews: null,\n    mobileShare: null,\n    topPages: [],\n    updated: "2026-04-01"\n  };');
    const { dom: d3 } = await loadHtml(stale, 'hamkorlik.html', { shims: true });
    add(!!d3.window.document.querySelector('.stat-stale'), '14. updated 60 kundan eski -> eslatma chiqadi');
    d3.window.close();
  }

  /* ---------- 10. Prerender barqarorligi va diskdagi holat ---------- */
  if (!FAST) {
    const r = runTool(['prerender-twice.js', '--all']);
    add(r.code === 0 && /barqaror/.test(r.out), '15. prerender ikki yugurishda bayt-bayt bir xil',
      (r.out.match(/^FARQ .*/gm) || []).join(' | '));

    const p = runTool(['prerender.js', '--all']);
    add(p.code === 0, '15b. diskdagi HTML prerender natijasiga mos',
      (p.out.match(/^ESKI .*/gm) || []).map((x) => x.slice(5).split(' ')[0]).join(', '));
  } else {
    results.push({ ok: true, name: '15. prerender barqarorligi (--fast: o\'tkazildi)', extra: '' });
    results.push({ ok: true, name: '15b. diskdagi HTML prerenderga mos (--fast: o\'tkazildi)', extra: '' });
  }

  /* ---------- 11. og teglari va rasmlari ---------- */
  {
    const t = runTool(['og-tags.js']);
    add(t.code === 0, '16. og teglari sahifalarda dolzarb', (t.out.match(/eskirgan: [1-9]\d*/) || [''])[0]);
    const i = runTool(['og-images.js']);
    add(i.code === 0, '17. og rasmlari dolzarb va 300 KB ichida',
      (i.out.match(/^.*(eskirgan|katta).*$/gm) || []).join(' | '));
  }

  /* ---------- 12. tools/ hech nima yozmadi ----------
     Yuqoridagi bandlarning HAMMASI shu oynada bajarildi: prerender,
     prerender-twice, sw-version, og-tags, og-images, check-partners,
     verify-sw va hamkorlik.html METRICS holatlari. Agar ulardan biri
     bayroqsiz holda diskka tegsa — shu yerda ko'rinadi. */
  {
    const changed = fpDiff(fpBefore, fingerprint());
    add(changed.length === 0, '18. bayroqsiz chaqirilgan tools/ skriptlari hech nima yozmadi',
      changed.slice(0, 8).join(', '));
  }

  /* ---------- hisobot ---------- */
  console.log('=== kalki.uz yakuniy tekshiruv ===');
  results.forEach((r) => console.log((r.ok ? 'OK   ' : 'FAIL ') + r.name + (r.extra ? ' — ' + r.extra : '')));
  const bad = results.filter((r) => !r.ok).length;
  console.log('\n' + (bad ? bad + ' ta band yiqildi' : results.length + ' band: hammasi o\'tdi'));
  process.exit(bad ? 1 : 0);
})();
