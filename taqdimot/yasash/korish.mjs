// PDF sahifalarini rasmga aylantirish (pdf.js) — ko'zdan kechirish uchun.   node taqdimot/yasash/korish.mjs <chiqish-papka>
import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright'; import { track } from '../../tools/test-cleanup.cjs';
const DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'); const OUT = process.argv[2];
const b = track(await chromium.launch());
try { const p = await b.newPage({ viewport: { width: 960, height: 540 } });
  await p.goto('https://kalki.uz/404-yoq-sahifa'); await p.setContent('<body style="margin:0"><canvas id="c"></canvas></body>');
  await p.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js' });
  const data = fs.readFileSync(path.join(DIR, 'KalkiFit-taqdimot.pdf')).toString('base64');
  const n = await p.evaluate(async (d) => { pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; window.doc = await pdfjsLib.getDocument({ data: atob(d) }).promise; return doc.numPages; }, data);
  console.log('sahifalar:', n);
  for (let i = 1; i <= n; i++) { await p.evaluate(async (i) => { const pg = await doc.getPage(i); const vp = pg.getViewport({ scale: 0.5 }); const c = document.getElementById('c'); c.width = vp.width; c.height = vp.height; await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise; }, i); await p.locator('#c').screenshot({ path: path.join(OUT, 's' + String(i).padStart(2, '0') + '.png') }); }
} finally { await b.close(); }
