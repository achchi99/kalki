// 2-bosqich: 14 holatni /api/ariza orqali o'tkazadi. Ishlatish:
//   node tools/ai-sinov/run-endpoint.mjs [http://localhost:8788]
// Natija: tools/ai-sinov/out/endpoint.json (gitignore'da)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://localhost:8788';
const src = fs.readFileSync(path.join(dir, 'run.js'), 'utf8');
const CASES = eval(src.match(/const CASES = (\[[\s\S]*?\n\]);/)[1]);
const out = [];
for (let i = 0; i < CASES.length; i++) {
  const t0 = Date.now();
  const res = await fetch(BASE + '/api/ariza', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE, 'CF-Connecting-IP': '10.1.' + (Date.now() % 100000) + '.' + (i + 1) },
    body: JSON.stringify({ vaziyat: CASES[i] })
  });
  const j = await res.json().catch(() => ({}));
  out.push({ n: i + 1, status: res.status, secs: (Date.now() - t0) / 1000, matn: j.matn, rad: j.rad, xato: j.xato });
  console.log(`#${i + 1}: ${res.status} ${j.rad ? 'RAD' : j.matn ? j.matn.split(/\s+/).length + ' so\'z' : j.xato} ${((Date.now() - t0) / 1000).toFixed(2)}s`);
}
fs.writeFileSync(path.join(dir, 'out', 'endpoint.json'), JSON.stringify(out, null, 1));
