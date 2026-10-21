#!/usr/bin/env node
/* kalki.uz — yangi APK chiqqanda: ilova/versiya.json dagi versiya, hajm, SHA-256 va havolani ilova/index.html ga yozadi (sahifa statik, JS'siz ham to'g'ri).
 *   node tools/ilova-yangila.js            (ilova/versiya.json va ilova/<apk> mavjud bo'lishi kerak)
 *   node tools/ilova-yangila.js --tekshir  (yozmaydi; nomos bo'lsa kod 1) */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..'), DIR = path.join(ROOT, 'ilova'), PAGE = path.join(DIR, 'index.html');
const v = JSON.parse(fs.readFileSync(path.join(DIR, 'versiya.json'), 'utf8')), apk = path.join(ROOT, v.apk.replace(/^\//, ''));
const buf = fs.readFileSync(apk), sha = crypto.createHash('sha256').update(buf).digest('hex'), size = buf.length;
const mb = (size / 1048576).toFixed(1).replace('.', ',') + ' MB';
const errs = []; if (v.sha256 !== sha) errs.push('versiya.json sha256 APK ga mos emas'); if (v.size !== size) errs.push('versiya.json size APK ga mos emas');
let h = fs.readFileSync(PAGE, 'utf8'); const o = h;
h = h.replace(/(<a class="il-btn" id="ilDl" href=")[^"]*(")/, '$1' + v.apk + '$2').replace(/(<b id="ilVer">)[^<]*(<\/b>)/, '$1' + v.version + '$2').replace(/(<b id="ilSize">)[^<]*(<\/b>)/, '$1' + mb + '$2').replace(/(<b id="ilMin">)[^<]*(<\/b>)/, '$1' + v.minAndroid + '$2').replace(/(<code id="ilSha">)[^<]*(<\/code>)/, '$1' + sha + '$2');
if (process.argv.includes('--tekshir')) { if (h !== o) errs.push('ilova/index.html versiya/hajm/SHA/havola bilan mos emas (node tools/ilova-yangila.js)'); if (errs.length) { console.error(errs.join('\n')); process.exit(1); } console.log('ilova: versiya.json, APK va sahifa mos (' + v.version + ', ' + mb + ')'); }
else { if (errs.length) { v.sha256 = sha; v.size = size; fs.writeFileSync(path.join(DIR, 'versiya.json'), JSON.stringify(v, null, 2) + '\n'); } fs.writeFileSync(PAGE, h); console.log('ilova/index.html yangilandi: ' + v.version + ', ' + mb + ', ' + sha.slice(0, 12) + '…'); }
