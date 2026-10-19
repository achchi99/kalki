/* kalki.uz — Web Push (RFC 8030 + VAPID RFC 8292 + xabar shifrlash RFC 8291 «aes128gcm»), tashqi paketsiz (faqat Node crypto).
 * Ishlatadi: tools/push-yubor.js (Hetzner cron). Sinov: tools/dizayn/test-push.mjs (RFC 8291 A ilovasidagi namuna bilan solishtiriladi).
 *   vapidYarat()                       → { publicKey, privateKey, subject? }   (base64url: ochiq = 65 bayt nuqta, shaxsiy = 32 bayt d)
 *   shifrla(payload, { p256dh, auth }, { salt?, asPriv?, asPub? }) → Buffer   (aes128gcm tanasi: sarlavha + shifrlangan yozuv)
 *   vapidSarlavha(endpoint, vapid, now?) → 'vapid t=<jwt>, k=<ochiq kalit>'
 *   yubor(obuna, payload, vapid, opt)  → { status, ok, gone }   (gone: 404/410 — obuna o'lik, bazadan o'chiriladi) */
'use strict';
const crypto = require('crypto');
const b64u = (b) => Buffer.from(b).toString('base64url');
const unb64u = (s) => Buffer.from(String(s), 'base64url');
function vapidYarat() {
  const k = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' }), j = k.privateKey.export({ format: 'jwk' });
  return { publicKey: b64u(Buffer.concat([Buffer.from([4]), unb64u(j.x), unb64u(j.y)])), privateKey: j.d };
}
function privKey(vapid) { const pub = unb64u(vapid.publicKey); return crypto.createPrivateKey({ key: { kty: 'EC', crv: 'P-256', x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)), d: vapid.privateKey }, format: 'jwk' }); }
function vapidSarlavha(endpoint, vapid, now) {
  const aud = new URL(endpoint).origin, exp = Math.floor((now || Date.now()) / 1000) + 12 * 3600;
  const head = b64u(JSON.stringify({ typ: 'JWT', alg: 'ES256' })), body = b64u(JSON.stringify({ aud, exp, sub: vapid.subject || 'https://kalki.uz' }));
  const sig = crypto.sign('sha256', Buffer.from(head + '.' + body), { key: privKey(vapid), dsaEncoding: 'ieee-p1363' });
  return 'vapid t=' + head + '.' + body + '.' + b64u(sig) + ', k=' + vapid.publicKey;
}
const hkdf = (salt, ikm, info, len) => Buffer.from(crypto.hkdfSync('sha256', ikm, salt, info, len));
function shifrla(payload, sub, o) {
  o = o || {}; const uaPub = unb64u(sub.p256dh), auth = unb64u(sub.auth), salt = o.salt ? unb64u(o.salt) : crypto.randomBytes(16);
  let asPub, asKey;
  if (o.asPriv) { asPub = unb64u(o.asPub); asKey = crypto.createPrivateKey({ key: { kty: 'EC', crv: 'P-256', x: b64u(asPub.subarray(1, 33)), y: b64u(asPub.subarray(33, 65)), d: o.asPriv }, format: 'jwk' }); }
  else { const kp = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' }), j = kp.publicKey.export({ format: 'jwk' }); asPub = Buffer.concat([Buffer.from([4]), unb64u(j.x), unb64u(j.y)]); asKey = kp.privateKey; }
  const uaKey = crypto.createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: b64u(uaPub.subarray(1, 33)), y: b64u(uaPub.subarray(33, 65)) }, format: 'jwk' });
  const ecdh = crypto.diffieHellman({ privateKey: asKey, publicKey: uaKey });
  const ikm = hkdf(auth, ecdh, Buffer.concat([Buffer.from('WebPush: info\0'), uaPub, asPub]), 32);
  const cek = hkdf(salt, ikm, Buffer.from('Content-Encoding: aes128gcm\0'), 16), nonce = hkdf(salt, ikm, Buffer.from('Content-Encoding: nonce\0'), 12);
  const pt = Buffer.concat([Buffer.from(payload), Buffer.from([2])]);        // oxirgi (yagona) yozuv: 0x02 chegarasi
  if (pt.length > 4096 - 17) throw new Error('payload juda katta');
  const c = crypto.createCipheriv('aes-128-gcm', cek, nonce), ct = Buffer.concat([c.update(pt), c.final(), c.getAuthTag()]);
  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
  return Buffer.concat([salt, rs, Buffer.from([asPub.length]), asPub, ct]);
}
/* qabul qiluvchi tomon (faqat sinov uchun): RFC 8291 bo'yicha ochish */
function och(body, uaPrivD, uaPub, auth) {
  const salt = body.subarray(0, 16), idlen = body[20], asPub = body.subarray(21, 21 + idlen), ct = body.subarray(21 + idlen);
  const uaP = unb64u(uaPub), key = crypto.createPrivateKey({ key: { kty: 'EC', crv: 'P-256', x: b64u(uaP.subarray(1, 33)), y: b64u(uaP.subarray(33, 65)), d: uaPrivD }, format: 'jwk' });
  const asKey = crypto.createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: b64u(asPub.subarray(1, 33)), y: b64u(asPub.subarray(33, 65)) }, format: 'jwk' });
  const ikm = hkdf(unb64u(auth), crypto.diffieHellman({ privateKey: key, publicKey: asKey }), Buffer.concat([Buffer.from('WebPush: info\0'), uaP, asPub]), 32);
  const cek = hkdf(salt, ikm, Buffer.from('Content-Encoding: aes128gcm\0'), 16), nonce = hkdf(salt, ikm, Buffer.from('Content-Encoding: nonce\0'), 12);
  const d = crypto.createDecipheriv('aes-128-gcm', cek, nonce); d.setAuthTag(ct.subarray(ct.length - 16)); const pt = Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
  let i = pt.length - 1; while (i > 0 && pt[i] === 0) i--; return pt.subarray(0, i).toString();
}
async function yubor(sub, payload, vapid, opt) {
  opt = opt || {}; const body = shifrla(typeof payload === 'string' ? payload : JSON.stringify(payload), sub);
  const r = await (opt.fetch || fetch)(sub.endpoint, { method: 'POST', headers: { Authorization: vapidSarlavha(sub.endpoint, vapid), 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: String(opt.ttl || 6 * 3600), Urgency: opt.urgency || 'normal', Topic: opt.topic || 'baliq-kuni' }, body });
  return { status: r.status, ok: r.status >= 200 && r.status < 300, gone: r.status === 404 || r.status === 410 };
}
module.exports = { vapidYarat, vapidSarlavha, shifrla, och, yubor, b64u, unb64u };
