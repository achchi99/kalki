/* sw.js oldindan keshlaydigan /data/*.json o'zgarsa SW_VERSION ham o'zgaradi (aks holda qurilmada eski baza muzlaydi: «baxroma» → Topilmadi).   node tools/test-sw-data-versiya.js */
'use strict';
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path'), { spawnSync } = require('child_process');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'swv-')); fs.mkdirSync(path.join(tmp, 'assets')); fs.mkdirSync(path.join(tmp, 'data'));
fs.writeFileSync(path.join(tmp, 'sw.js'), "const SW_VERSION = '';   /* sw-version:auto */\nconst PRE = ['/data/x.json', '/kalkifit.webmanifest'];\n"); fs.writeFileSync(path.join(tmp, 'assets', 'a.js'), '1'); fs.writeFileSync(path.join(tmp, 'data', 'x.json'), '{"a":1}'); fs.writeFileSync(path.join(tmp, 'data', 'y.json'), '{"b":1}');
const run = (w) => spawnSync('node', [path.join(__dirname, 'sw-version.js')].concat(w ? ['--write'] : []), { env: Object.assign({}, process.env, { SW_VERSION_ROOT: tmp }), encoding: 'utf8' });
const ver = () => /SW_VERSION = '([0-9a-f]*)'/.exec(fs.readFileSync(path.join(tmp, 'sw.js'), 'utf8'))[1];
run(true); const v1 = ver(); assert.match(v1, /^[0-9a-f]{8}$/); assert.equal(run(false).status, 0, 'o\'zgarmagan — tekshiruv OK');
fs.writeFileSync(path.join(tmp, 'data', 'x.json'), '{"a":2}'); assert.equal(run(false).status, 1, 'precache qilinadigan data/x.json o\'zgardi — versiya ESKI'); run(true); const v2 = ver(); assert.notEqual(v2, v1, 'data o\'zgarsa versiya o\'zgaradi');
fs.writeFileSync(path.join(tmp, 'data', 'y.json'), '{"b":2}'); assert.equal(run(false).status, 0, 'precache qilinmaydigan data/y.json versiyani o\'zgartirmaydi');
fs.rmSync(tmp, { recursive: true, force: true }); console.log('OK   SW versiyasi precache qilinadigan /data/*.json bilan o\'zgaradi');
