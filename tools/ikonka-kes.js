#!/usr/bin/env node
/* kalki.uz — ovqat ikonkalari to'rini kesish va bazaga ulash (qayta ishlatiladigan).
 *   node tools/ikonka-kes.js ~/toplam-1.jpg            # N fayl nomidan olinadi (toplam-N.*) → docs/ikonka-toplam-N.txt
 *   node tools/ikonka-kes.js ~/toplam-2.jpg --n 2 [--ustun 6 --qator 7] [--quru]   (--quru: faqat tekshirish + kontakt-varaq, assets/ovqat'ga yozmaydi)
 * Nima qiladi:
 *  1. To'r rasmi (JPG/PNG) Chromium canvas'ida o'qiladi (qo'shimcha kutubxona kerak emas). Fon rangi — chekkalardan.
 *  2. Teng bo'lish EMAS: fon rangidan farq qiladigan piksellar komponentlarga ajratiladi; komponentlar katakka markazi bo'yicha biriktiriladi,
 *     katak pastidagi past-keng komponent — slug yozuvi (KESIB TASHLANADI), qolganlari — taom (bbox, uzilgan qismlar ham: qoshiq, barg).
 *  3. Taom bbox markazga olinadi, uzun tomoni kvadratning 90% i (mavjud ikonkalardagi kabi); boshqa komponent/yozuv piksellari fon bilan almashtiriladi;
 *     fon aniq #F3EBE4 (243,235,228) ga keltiriladi (opak, shaffoflik yo'q) — assets/ovqat/<slug>-128.webp va -256.webp.
 *  4. data/ikonka-reja.txt bo'yicha assets/kalkifit-app.js dagi IKONKA-XARITA bloki qayta yoziladi (slug → taom id'lari), docs/ikonka-jadval.md ga «ulangan» belgisi.
 *  5. Kontakt-varaq: ~/ikonka-toplamlar/kontakt-N.png (slug yozuvi bilan) — ko'z bilan tekshirish uchun. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.join(__dirname, '..'), HOME = os.homedir();
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const img = process.argv.slice(2).find((x) => !x.startsWith('--') && /\.(jpe?g|png|webp)$/i.test(x));
if (!img) { console.error('Ishlatish: node tools/ikonka-kes.js <to\'r.jpg> [--n N]'); process.exit(1); }
const imgPath = img.replace(/^~/, HOME), N = +(arg('--n', (path.basename(imgPath).match(/(\d+)/) || [])[1])), COLS = +arg('--ustun', 6), ROWS = +arg('--qator', 7), QURU = process.argv.includes('--quru');
if (!N) { console.error('To\'plam raqami aniqlanmadi (--n N)'); process.exit(1); }
const txt = fs.readFileSync(path.join(ROOT, 'docs', 'ikonka-toplam-' + N + '.txt'), 'utf8').split('\n').filter((l) => / — /.test(l) && !l.startsWith('Create ONE'));
const slugs = txt.map((l) => l.split(' — ')[0].trim()); if (slugs.length !== COLS * ROWS) { console.error('to\'plam faylida ' + slugs.length + ' ta slug, kutilgan ' + COLS * ROWS); process.exit(1); }
const BG = [243, 235, 228], FILL = 0.90;

async function main() {
  const { chromium } = require(path.join(ROOT, 'node_modules/playwright'));
  const { track } = require('./test-cleanup.cjs');
  const browser = track(await chromium.launch()); const page = await (await browser.newContext()).newPage(); await page.goto('about:blank');
  const b64 = fs.readFileSync(imgPath).toString('base64'), mime = /\.png$/i.test(imgPath) ? 'image/png' : /\.webp$/i.test(imgPath) ? 'image/webp' : 'image/jpeg';
  const res = await page.evaluate(async ([data, mime, COLS, ROWS, BG, FILL, slugs]) => {
    const im = new Image(); im.src = 'data:' + mime + ';base64,' + data; await im.decode();
    const W = im.width, H = im.height, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(im, 0, 0);
    const D = cx.getImageData(0, 0, W, H).data;
    /* fon rangi: to'rning to'rt chekkasidagi 24 px kenglikdagi piksellar medianasi */
    const samp = [[], [], []]; const edge = (i, j) => { const k = (j * W + i) * 4; samp[0].push(D[k]); samp[1].push(D[k + 1]); samp[2].push(D[k + 2]); };
    for (let j = 0; j < 24; j++) for (let i = 0; i < W; i += 3) { edge(i, j); edge(i, H - 1 - j); } for (let i = 0; i < 24; i++) for (let j = 0; j < H; j += 3) { edge(i, j); edge(W - 1 - i, j); }
    const med = (a) => { a.sort((x, y) => x - y); return a[a.length >> 1]; }; const B0 = [med(samp[0]), med(samp[1]), med(samp[2])];
    const dist = (k) => Math.abs(D[k] - B0[0]) + Math.abs(D[k + 1] - B0[1]) + Math.abs(D[k + 2] - B0[2]);
    /* 1) yozuvlar: slug matni to'q qizg'ish-jigarrang (R<90, G<35, B<35) — shu rangdagi piksellar gorizontal dilatatsiya bilan so'zga birlashtiriladi; so'z = past (18..80 px) va kengligi >= 24 */
    const SC = 2, w = Math.ceil(W / SC), h = Math.ceil(H / SC), isTxt = (k) => D[k] < 80 && D[k + 1] < 20 && D[k + 2] < 20 && D[k] - D[k + 1] > 18;
    const tm = new Uint8Array(w * h); for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (isTxt((j * W + i) * 4)) tm[(j >> 1) * w + (i >> 1)] = 1;
    const dilate = (src, Rx, Ry) => { const t = new Uint8Array(w * h), o = new Uint8Array(w * h);
      for (let j = 0; j < h; j++) { let c = 0; for (let i = -Rx; i < w + Rx; i++) { if (i + Rx < w) c += src[j * w + i + Rx]; if (i - Rx - 1 >= 0) c -= src[j * w + i - Rx - 1]; if (i >= 0 && i < w) t[j * w + i] = c > 0 ? 1 : 0; } }
      for (let i = 0; i < w; i++) { let c = 0; for (let j = -Ry; j < h + Ry; j++) { if (j + Ry < h) c += t[(j + Ry) * w + i]; if (j - Ry - 1 >= 0) c -= t[(j - Ry - 1) * w + i]; if (j >= 0 && j < h) o[j * w + i] = c > 0 ? 1 : 0; } } return o; };
    const components = (mask) => { const lab = new Int32Array(w * h).fill(-1), comps = [], st = [];
      for (let s0 = 0; s0 < w * h; s0++) { if (!mask[s0] || lab[s0] >= 0) continue; const id = comps.length, c = { id, x0: w, y0: h, x1: 0, y1: 0, n: 0, sx: 0, sy: 0 }; comps.push(c); lab[s0] = id; st.push(s0);
        while (st.length) { const p0 = st.pop(), px = p0 % w, py = (p0 / w) | 0; c.n++; c.sx += px; c.sy += py; if (px < c.x0) c.x0 = px; if (px > c.x1) c.x1 = px; if (py < c.y0) c.y0 = py; if (py > c.y1) c.y1 = py;
          for (const q of [p0 - 1, p0 + 1, p0 - w, p0 + w]) { if (q < 0 || q >= w * h || (q === p0 - 1 && px === 0) || (q === p0 + 1 && px === w - 1)) continue; if (mask[q] && lab[q] < 0) { lab[q] = id; st.push(q); } } } }
      return { lab, comps }; };
    const tw = components(dilate(tm, 7, 2)), words = tw.comps.filter((c) => { const ph = (c.y1 - c.y0 + 1) * SC, pw = (c.x1 - c.x0 + 1) * SC; return ph >= 18 && ph <= 80 && pw >= 24 && c.n > 20; });
    const colOf = (c) => Math.max(0, Math.min(COLS - 1, Math.floor(((c.x0 + c.x1) / 2) / (w / COLS)))); const labCols = Array.from({ length: COLS }, () => []); words.forEach((c) => labCols[colOf(c)].push(c)); labCols.forEach((l) => l.sort((a, b) => a.y0 - b.y0));
    const warn = [], labels = new Array(COLS * ROWS).fill(null); window.__dbg = labCols.map((l) => l.map((c) => [c.x0 * SC, c.y0 * SC, c.x1 * SC, c.y1 * SC, c.n].join(',')));
    /* nomzodlar ichidan ROWS ta yozuv: ketma-ket yozuvlar oralig'i ~ qator davri (H/ROWS ± 20%) bo'lishi shart, jami «siyoh» (n) maksimal — taom ichidagi to'q bo'laklar (qora tova, jigar) chetda qoladi */
    const P = (H / ROWS), pick = (l) => { const m = l.length, best = new Map(); let top = null;
      const rec = (k, last, sum, seq) => { if (k === ROWS) { if (!top || sum > top.sum) top = { sum, seq: seq.slice() }; return; } for (let q = last + 1; q < m; q++) { if (k > 0) { const dy = (l[q].y0 - l[seq[k - 1]].y0) * SC; if (dy < P * 0.8 || dy > P * 1.2) continue; } seq.push(q); rec(k + 1, q, sum + l[q].n, seq); seq.pop(); } };
      rec(0, -1, 0, []); return top ? top.seq.map((q) => l[q]) : null; };
    labCols.forEach((l, col) => { const sel = pick(l); if (!sel) { warn.push('ustun ' + (col + 1) + ': ' + ROWS + ' ta yozuv ketma-ketligi topilmadi (nomzod ' + l.length + ')'); return; } sel.forEach((c, r) => { labels[r * COLS + col] = c; }); });
    /* 2) taom: kuchli maska (fon rangidan farq) − yozuv bbox'lari (+3 px); komponentlar (dilatatsiya ~6 px), har biri ustun va qator bo'yicha yozuvga biriktiriladi */
    const T = 70, sm = new Uint8Array(w * h); for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (dist((j * W + i) * 4) > T) sm[(j >> 1) * w + (i >> 1)] = 1;
    /* yozuv bbox'i: so'z komponenti ichidagi AYNAN matn piksellarining qamrovi (+1 katak ≈ 2 px) — taom soyasi keraksiz kesilmasin */
    const inLab = new Uint8Array(w * h); labels.forEach((c) => { if (!c) return; let tx0 = w, ty0 = h, tx1 = 0, ty1 = 0; for (let y = c.y0; y <= c.y1; y++) for (let x = c.x0; x <= c.x1; x++) if (tm[y * w + x] && tw.lab[y * w + x] === c.id) { if (x < tx0) tx0 = x; if (x > tx1) tx1 = x; if (y < ty0) ty0 = y; if (y > ty1) ty1 = y; }
      for (let y = Math.max(0, ty0 - 1); y <= Math.min(h - 1, ty1 + 1); y++) for (let x = Math.max(0, tx0 - 1); x <= Math.min(w - 1, tx1 + 1); x++) inLab[y * w + x] = 1; });
    for (let q = 0; q < w * h; q++) if (inLab[q]) sm[q] = 0;
    const ic = components(dilate(sm, 3, 3)), lab = ic.lab, big = ic.comps.filter((c) => c.n > 3);
    const cellOf = new Int32Array(big.length === 0 ? 1 : ic.comps.length).fill(-1), cells = Array.from({ length: COLS * ROWS }, () => []);
    for (const c of big) { const cxm = c.sx / c.n, cym = c.sy / c.n, col = Math.max(0, Math.min(COLS - 1, Math.floor(cxm / (w / COLS)))); let bi = -1, bd = 1e9; for (let r = 0; r < ROWS; r++) { const L = labels[r * COLS + col]; if (!L) continue; const d = L.y0 - cym; if (d > -6 && d < bd) { bd = d; bi = r * COLS + col; } } if (bi >= 0) { cells[bi].push(c); cellOf[c.id] = bi; } }
    const out = []; cells.forEach((list, ci) => { if (!list.length) { warn.push(slugs[ci] + ': taom topilmadi'); out.push(null); return; }
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (const c of list) { x0 = Math.min(x0, c.x0); y0 = Math.min(y0, c.y0); x1 = Math.max(x1, c.x1); y1 = Math.max(y1, c.y1); }
      out.push({ ci, ics: list.map((c) => c.id), labs: [], bbox: [x0 * SC, y0 * SC, (x1 + 1) * SC, (y1 + 1) * SC], nl: 1 }); });
    const PH = { ox: 0, oy: 0 };
    /* 2) har ikonka: kvadrat, markazda, uzun tomon FILL; boshqa komponentlar va yozuv piksellari — fon; fon → BG */
    const iconOf = new Int32Array(ic.comps.length).fill(-1); out.forEach((o, i) => { if (!o) return; o.ics.forEach((id) => { iconOf[id] = i; }); });
    const SS = [256, 128], results = {};
    const dd = (v) => Math.max(0, Math.min(1, (v - 8) / 40));       // fon yaqinligi vazni: dist 8..48 oralig'ida taom piksel
    out.forEach((o, i) => {
      if (!o) return; const [bx0, by0, bx1, by1] = o.bbox, bw = bx1 - bx0, bh = by1 - by0, L = Math.round(Math.max(bw, bh) / FILL), cxm = (bx0 + bx1) / 2, cym = (by0 + by1) / 2, sx = Math.round(cxm - L / 2), sy = Math.round(cym - L / 2);
      const cc = document.createElement('canvas'); cc.width = L; cc.height = L; const c2 = cc.getContext('2d'); const od = c2.createImageData(L, L), O = od.data;
      for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
        const X = sx + x, Y = sy + y, k = (y * L + x) * 4; let r = BG[0], g = BG[1], b = BG[2];
        if (X >= 0 && Y >= 0 && X < W && Y < H) {
          const s = (Y * W + X) * 4, q2 = (Y >> 1) * w + (X >> 1), lid = lab[q2]; const owner = inLab[q2] ? -3 : (lid >= 0 ? iconOf[lid] : -1);
          /* shu ikonkaning o'z komponenti yoki komponentsiz (soya/fon) piksel; boshqa ikonka yoki yozuv — fon */
          const own = owner === i || owner === -1;
          if (own) { const wgt = dd(Math.abs(D[s] - B0[0]) + Math.abs(D[s + 1] - B0[1]) + Math.abs(D[s + 2] - B0[2])); const sr = D[s] + (BG[0] - B0[0]), sg = D[s + 1] + (BG[1] - B0[1]), sb = D[s + 2] + (BG[2] - B0[2]);
            r = Math.round(sr * (1 - wgt) + D[s] * wgt); g = Math.round(sg * (1 - wgt) + D[s + 1] * wgt); b = Math.round(sb * (1 - wgt) + D[s + 2] * wgt); r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b)); }
        }
        O[k] = r; O[k + 1] = g; O[k + 2] = b; O[k + 3] = 255;
      }
      c2.putImageData(od, 0, 0);
      results[slugs[o.ci]] = { L, bbox: o.bbox, fill: Math.max(bw, bh) / L };
      o.png = {}; for (const S of SS) { const oc = document.createElement('canvas'); oc.width = S; oc.height = S; const x = oc.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(cc, 0, 0, S, S); o.png[S] = oc; }
    });
    const files = {}; for (let i = 0; i < out.length; i++) { const o = out[i]; if (!o) continue; for (const S of SS) { const blob = await new Promise((ok) => o.png[S].toBlob(ok, 'image/webp', S === 256 ? 0.82 : 0.8)); const ab = await blob.arrayBuffer(); let s = ''; const u = new Uint8Array(ab); for (let k = 0; k < u.length; k += 0x8000) s += String.fromCharCode.apply(null, u.subarray(k, k + 0x8000)); files[slugs[o.ci] + '-' + S] = btoa(s); } }
    /* kontakt-varaq: 256 px ikonkalar, 6 ustun, slug yozuvi bilan */
    const PAD = 14, LH = 22, CW = 256 + PAD, CH = 256 + LH + PAD, sheet = document.createElement('canvas'); sheet.width = COLS * CW + PAD; sheet.height = ROWS * CH + PAD; const sx2 = sheet.getContext('2d'); sx2.fillStyle = '#fff'; sx2.fillRect(0, 0, sheet.width, sheet.height); sx2.font = '15px sans-serif'; sx2.textAlign = 'center'; sx2.fillStyle = '#222';
    out.forEach((o, i) => { const x = PAD + (i % COLS) * CW, y = PAD + ((i / COLS) | 0) * CH; if (o) sx2.drawImage(o.png[256], x, y); else { sx2.fillStyle = '#c00'; sx2.fillRect(x, y, 256, 256); sx2.fillStyle = '#222'; } sx2.fillStyle = '#222'; sx2.fillText(slugs[i], x + 128, y + 256 + 16); });
    const sheetB64 = sheet.toDataURL('image/png').split(',')[1];
    return { dbg: window.__dbg, W, H, B0, PH, ncomp: big.length, warn, results, files, sheet: sheetB64, labs: out.map((o) => o ? o.nl : 0) };
  }, [b64, mime, COLS, ROWS, BG, FILL, slugs]);
  await browser.close();
  return res;
}

main().then((r) => {
  if (process.env.KES_DEBUG) console.log(JSON.stringify(r.dbg[1]));
  console.log('katak siljishi (px): x ' + r.PH.ox + ', y ' + r.PH.oy + '; to\'r ' + r.W + '×' + r.H + ', fon ' + r.B0.join(',') + ' → ' + BG.join(',') + ', komponent ' + r.ncomp + '; yozuv komponentlari/katak: ' + [...new Set(r.labs)].join(','));
  if (r.warn.length) { console.error(r.warn.join('\n')); }
  const dir = path.join(HOME, 'ikonka-toplamlar'); fs.mkdirSync(dir, { recursive: true });
  const sheet = path.join(dir, 'kontakt-' + N + '.png'); fs.writeFileSync(sheet, Buffer.from(r.sheet, 'base64')); console.log('kontakt-varaq:', sheet);
  if (r.warn.length) process.exit(1);
  if (QURU) return;
  let n = 0; for (const [k, v] of Object.entries(r.files)) { fs.writeFileSync(path.join(ROOT, 'assets/ovqat', k + '.webp'), Buffer.from(v, 'base64')); n++; }
  console.log('yozildi: ' + n + ' fayl (' + n / 2 + ' ikonka) → assets/ovqat/');
  require('./ikonka-ula.js');
}).catch((e) => { console.error(e); process.exit(1); });
