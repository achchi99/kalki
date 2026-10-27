/* kalki.uz — kod o'zgarsa uzoq tekshiruvni to'xtatish (CLAUDE.md «Ish tartibi»: eski kod natijasini kutmaslik).
 *
 *   const { kuzat } = require('./kod-kuzat.cjs');
 *   kuzat({ onChange: (fayl) => { ...to'xtatish... } });
 *
 * Kuzatiladi: HEAD + commit'dan farqli va kuzatilmagan fayllar mazmuni (xesh) — har 5 s.
 * Testlar repo fayllarini o'zgartirmaydi (skrinshotlar SKRINSHOT_DIR / OUT ga yoziladi), shuning uchun farq = kimdir kodni o'zgartirdi.
 * O'chirish: KOD_KUZAT=0. */
'use strict';
const { execFileSync } = require('child_process');
const crypto = require('crypto');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const IGNORE = /^(docs\/dizayn-skrinshot\/|test-results\/|tools\/ai-sinov\/out\/)/;          // test artefaktlari (eski yo'llar) — kod emas

function holat() {
  const g = (...a) => { try { return execFileSync('git', a, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 }).toString(); } catch (e) { return ''; } };
  const fs = require('fs'), files = {};          // fayl → mazmun xeshi (o'zgargan fayllar: commit'dan farqli + kuzatilmagan)
  const list = g('diff', 'HEAD', '--name-only').split('\n').concat(g('ls-files', '--others', '--exclude-standard').split('\n')).filter((f) => f && !IGNORE.test(f));
  list.forEach((f) => { try { files[f] = crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, f))).digest('hex'); } catch (e) { files[f] = 'yo\'q'; } });
  const head = g('rev-parse', 'HEAD').trim();
  return { head, files, hash: crypto.createHash('sha1').update(head + JSON.stringify(files)).digest('hex') };
}

function kuzat({ onChange, every = 5000 } = {}) {
  if (process.env.KOD_KUZAT === '0') return { stop() {} };
  const h0 = holat(); let done = false;
  const t = setInterval(() => {
    if (done) return; const h = holat(); if (h.hash === h0.hash) return;
    done = true; clearInterval(t);
    const f = h.head !== h0.head ? '(yangi commit)' : Object.keys(Object.assign({}, h0.files, h.files)).find((x) => h0.files[x] !== h.files[x]) || '?';
    onChange(f);
  }, every); t.unref();
  return { stop() { done = true; clearInterval(t); } };
}
module.exports = { kuzat, holat };
