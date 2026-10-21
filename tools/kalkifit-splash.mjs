// KalkiFit iOS PWA ishga tushish rasmlari (apple-touch-startup-image): asosiy iPhone o'lchamlari × light/dark — logotip markazda, fon tema rangida.
// node tools/kalkifit-splash.mjs   → assets/splash/kalkifit-<W>x<H>-<light|dark>.png  va  kalkifit.html / ru/kalkifit.html dagi <link> qatorlari (kfStartup bloki) yangilanadi
import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright'; import { track } from './test-cleanup.cjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const DEVICES = [[430, 932, 3], [440, 956, 3], [402, 874, 3], [393, 852, 3], [428, 926, 3], [390, 844, 3], [375, 812, 3], [414, 896, 3], [414, 896, 2], [375, 667, 2]];
const THEME = { light: { bg: '#F7F5F2', tile: '#E8572F', k: '#FFFFFF' }, dark: { bg: '#18191C', tile: '#FF7E5C', k: '#1C0C06' } };
const svg = (t) => `<svg width="96" height="96" viewBox="0 0 84 84"><rect width="84" height="84" rx="26" fill="${t.tile}"/><path d="M28 20h9v18.5L52.5 20H63L46.5 39.5 64 64H53.2L40.7 46.2 37 50.3V64h-9z" fill="${t.k}"/></svg>`;
const b = track(await chromium.launch()); const links = [];
for (const [w, h, d] of DEVICES) for (const th of ['light', 'dark']) {
  const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: d }); const p = await c.newPage(); const t = THEME[th];
  await p.setContent(`<html><body style="margin:0;background:${t.bg};height:100vh;display:flex;align-items:center;justify-content:center">${svg(t)}</body></html>`);
  const f = `assets/splash/kalkifit-${w * d}x${h * d}-${th}.png`; await p.screenshot({ path: path.join(ROOT, f) }); await c.close();
  links.push(`<link rel="apple-touch-startup-image" media="screen and (device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${d}) and (orientation: portrait) and (prefers-color-scheme: ${th})" href="/${f}">`);
}
await b.close();
const block = '<!--kfStartup-->' + links.join('') + '<!--/kfStartup-->';
for (const f of ['kalkifit.html', 'ru/kalkifit.html']) {
  const fp = path.join(ROOT, f); let s = fs.readFileSync(fp, 'utf8');
  if (/<!--kfStartup-->[\s\S]*?<!--\/kfStartup-->/.test(s)) s = s.replace(/<!--kfStartup-->[\s\S]*?<!--\/kfStartup-->/, block); else s = s.replace('<link rel="manifest" href="/kalkifit.webmanifest"', block + '<link rel="manifest" href="/kalkifit.webmanifest"');
  fs.writeFileSync(fp, s);
}
console.log('yozildi: ' + links.length + ' ta rasm, ' + DEVICES.length + ' qurilma × 2 mavzu');
