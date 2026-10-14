#!/usr/bin/env node
/* kalki.uz — kalkulyator/generator sahifalariga 3 qadamli qisqa qo'llanma (<ol class="qadamlar">) qo'yadi.
 * Manba: data/qadamlar.json (slug -> 3 qadam, UZ+RU). RU matn footer-lang.js orqali data-lf-ru bilan almashadi,
 * ЎЗ — translit. Idempotent: eskisini olib tashlab qayta yozadi. `--write` bilan yozadi, aks holda faqat tekshiradi. */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const D = JSON.parse(fs.readFileSync(path.join(root, 'data/qadamlar.json'), 'utf8'));
const write = process.argv.includes('--write');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const RE_OL = /\n?[ \t]*<ol class="qadamlar"[\s\S]*?<\/ol>\n?/;
const ANCHORS = [/<section class="form-card"/, /<section class="card"/, /<div id="formHost"/, /<div class="two-doc-note" id="draftBanner"/];
let bad = 0, changed = 0;
for (const [slug, st] of Object.entries(D.steps)) {
  const f = path.join(root, slug + '.html');
  if (!fs.existsSync(f)) { console.log('YO\'Q:', slug); bad++; continue; }
  let h = fs.readFileSync(f, 'utf8'), orig = h;
  h = h.replace(RE_OL, '\n');
  const main = h.search(/<main class="wrap (calc|gen)-main"/);
  let pos = -1;
  for (const a of ANCHORS) { const m = a.exec(h.slice(main)); if (m) { pos = main + m.index; break; } }
  if (main < 0 || pos < 0) { console.log('ANCHOR YO\'Q:', slug); bad++; continue; }
  const ol = '<ol class="qadamlar" aria-label="3 qadamda">\n' +
    st.map(s => `<li data-lf-uz="${esc(s.uz)}" data-lf-ru="${esc(s.ru)}">${s.uz.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`).join('\n') + '\n</ol>\n';
  h = h.slice(0, pos) + ol + h.slice(pos);
  if (h !== orig) { changed++; if (write) fs.writeFileSync(f, h); }
}
console.log((write ? 'yozildi: ' : 'o\'zgarishi kerak: ') + changed + ', xato: ' + bad);
process.exit(bad ? 1 : 0);
