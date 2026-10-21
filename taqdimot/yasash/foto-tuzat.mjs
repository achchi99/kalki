// foto-*.jpg: sarlavhadagi sayt nomini (chap yuqori) fon rangi bilan yopish — AI so'rovini takrorlamaslik uchun.   node taqdimot/yasash/foto-tuzat.mjs
import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright'; import { track } from '../../tools/test-cleanup.cjs';
const DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'rasm'); const b = track(await chromium.launch());
try { const p = await b.newPage(); for (const t of ['light', 'dark']) { const f = path.join(DIR, 'foto-' + t + '.jpg'); const src = 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64');
  const out = await p.evaluate(async (src) => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(8, 90, 1, 1).data; x.fillStyle = `rgb(${d[0]},${d[1]},${d[2]})`; x.fillRect(20, 20, 320, 140); return c.toDataURL('image/jpeg', 0.9); }, src);
  fs.writeFileSync(f, Buffer.from(out.split(',')[1], 'base64')); } } finally { await b.close(); }
