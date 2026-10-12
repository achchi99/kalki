// RU so'rovning token/narxini o'lchaydi (Anthropic'ga to'g'ridan-to'g'ri, kalit .dev.vars dan; kalit chiqarilmaydi).
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { _test } from '../../functions/api/ariza.js';
const dir = path.dirname(fileURLToPath(import.meta.url));
const key = fs.readFileSync(path.join(dir, '../../.dev.vars'), 'utf8').match(/^ANTHROPIC_API_KEY=(.+)$/m)[1].trim();
const d = JSON.parse(fs.readFileSync(path.join(dir, 'out/ru.json'), 'utf8')); let tin = 0, tout = 0, n = 0; const rows = [];
for (const r of d.ru) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-haiku-5-5', max_tokens: 600, thinking: { type: 'disabled' }, system: _test.SYSTEM_RU, messages: [{ role: 'user', content: (r.turi && r.turi !== '-' ? 'Тип заявления: x\n' : '') + r.vaz }] }) });
  const j = await res.json(); const u = j.usage || {}; tin += u.input_tokens || 0; tout += u.output_tokens || 0; n++; rows.push([r.nom, u.input_tokens, u.output_tokens]);
}
const pin = 0.10 / 1e6, pout = 0.50 / 1e6; const avgIn = tin / n, avgOut = tout / n;
const out = { n, avgIn, avgOut, perRequestUSD: avgIn * pin + avgOut * pout, per1000USD: 1000 * (avgIn * pin + avgOut * pout), measuredCostUSD: tin * pin + tout * pout, rows };
fs.writeFileSync(path.join(dir, 'out/ru-tokens.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
