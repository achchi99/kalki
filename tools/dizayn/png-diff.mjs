// node tools/dizayn/png-diff.mjs <a.png> <b.png> [chiqish-diff.png]  — farq qutisi (bbox) va foizi; brauzer canvas orqali (qo'shimcha kutubxonasiz)
import fs from 'node:fs'; import { chromium } from 'playwright';
const [A, B, OUT] = process.argv.slice(2); const b = await chromium.launch(); const p = await b.newPage();
const r = await p.evaluate(async ([a, c]) => { const load = (s) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = 'data:image/png;base64,' + s; });
  const [x, y] = await Promise.all([load(a), load(c)]); const W = Math.max(x.width, y.width), H = Math.max(x.height, y.height);
  const g = (img) => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const t = cv.getContext('2d'); t.fillStyle = '#f0f'; t.fillRect(0, 0, W, H); t.drawImage(img, 0, 0); return t.getImageData(0, 0, W, H).data; };
  const d1 = g(x), d2 = g(y); let n = 0, x0 = W, y0 = H, x1 = 0, y1 = 0; const rows = new Set();
  for (let i = 0; i < d1.length; i += 4) if (Math.abs(d1[i] - d2[i]) + Math.abs(d1[i + 1] - d2[i + 1]) + Math.abs(d1[i + 2] - d2[i + 2]) > 24) { n++; const px = (i / 4) % W, py = Math.floor(i / 4 / W); rows.add(Math.floor(py / 100)); if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
  return { size: [x.width, x.height, y.width, y.height], n, pct: +(100 * n / (W * H)).toFixed(3), bbox: [x0, y0, x1, y1], bandsOf100px: [...rows].sort((a, b) => a - b).slice(0, 20) }; },
  [fs.readFileSync(A).toString('base64'), fs.readFileSync(B).toString('base64')]);
console.log(JSON.stringify(r)); await b.close();
