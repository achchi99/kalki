/* kalki.uz — GIBRID rejim (B bosqich): tiklash kodi (KF-/RZ-) ni SERVER KALITI bilan o'rash ("konvert") va zaxira.id ni kod'dan olish.
 * Server kalitlari: AKKAUNT_MASTER_KEYS (functions/_lib/akkaunt-kalit.js). Kalit kodda/repoda emas, faqat secret/env.
 * Konvert: base64url( 0x01 | versiya(4 bayt, big-endian) | iv(12) | AES-GCM(kalit = HKDF(master_kalit, info «akkaunt_id|ilova»), tiklash kodi) ), AAD = «akkaunt_id|ilova|versiya».
 * Konvert faqat o'sha akkaunt+ilova uchun ochiladi (boshqa akkauntga ko'chirib qo'yilsa ochilmaydi). Zaxira blob formati va kodning kriptografiyasi (assets/app-backup.js) O'ZGARMAYDI. */
import { kalitlar } from './akkaunt-kalit.js';

export const PREFIX = { kalkifit: 'KF', rozgor: 'RZ' }, ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', CODE_LEN = 28, ILOVALAR = ['kalkifit', 'rozgor'];
const enc = (s) => new TextEncoder().encode(s);
const hex = (u8) => Array.from(u8).map((b) => b.toString(16).padStart(2, '0')).join('');
const b64u = (u8) => btoa(String.fromCharCode.apply(null, u8)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (t) => { t = String(t).replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; const bin = atob(t), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };

/* assets/app-backup.js dagi parseCode bilan bir xil qoida: → { ok, kod (kanonik «KF-XXXX-…»), body } | { ok:false } */
export function kodTahlil(ilova, input) {
  const t = String(input == null ? '' : input).toUpperCase().replace(/[\s ]+/g, ''); const m = /^([A-Z]{2})-?(.+)$/.exec(t);
  if (!m || m[1] !== PREFIX[ilova]) return { ok: false };
  const body = m[2].replace(/-/g, ''); if (body.length !== CODE_LEN) return { ok: false };
  for (let i = 0; i < body.length; i++) if (ALPHA.indexOf(body[i]) < 0) return { ok: false };
  return { ok: true, body, kod: PREFIX[ilova] + '-' + body.match(/.{4}/g).join('-') };
}
/* zaxira.id: app-backup.js deriveKeys bilan bir xil — SHA-256( HKDF-SHA256(kod_tanasi, salt «kalki.uz/zaxira/v1», info «ilova|id»)[256 bit] ) */
export async function zaxiraId(ilova, body) {
  const ikm = await crypto.subtle.importKey('raw', enc(body), 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: enc('kalki.uz/zaxira/v1'), info: enc(ilova + '|id') }, ikm, 256);
  return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', bits)));
}
async function kalitOl(master, akkauntId, ilova) {
  const ikm = await crypto.subtle.importKey('raw', enc(master), 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: enc('kalki.uz/akkaunt/konvert/v1'), info: enc(akkauntId + '|' + ilova) }, ikm, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
const vb = (v) => new Uint8Array([(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255]);
/* → { konvert, v } yoki null (kalit sozlanmagan) */
export async function konvertYop(env, akkauntId, ilova, kod) {
  const K = kalitlar(env); if (!K) return null; const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await kalitOl(K.joriy.kalit, akkauntId, ilova);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc(akkauntId + '|' + ilova + '|' + K.joriy.v) }, key, enc(kod)));
  const out = new Uint8Array(17 + ct.length); out[0] = 1; out.set(vb(K.joriy.v), 1); out.set(iv, 5); out.set(ct, 17);
  return { konvert: b64u(out), v: K.joriy.v };
}
/* → { kod, v, joriy:boolean } | { xato: 'kalit' (sozlanmagan yoki shu versiya yo'q) | 'buzuq' } */
export async function konvertOch(env, akkauntId, ilova, konvert) {
  const K = kalitlar(env); if (!K) return { xato: 'kalit' };
  let u; try { u = unb64u(konvert); } catch (e) { return { xato: 'buzuq' } }
  if (u.length < 30 || u[0] !== 1) return { xato: 'buzuq' };
  const v = ((u[1] << 24) | (u[2] << 16) | (u[3] << 8) | u[4]) >>> 0, k = K.hammasi.find((x) => x.v === v); if (!k) return { xato: 'kalit', v };
  try {
    const key = await kalitOl(k.kalit, akkauntId, ilova);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(5, 17), additionalData: enc(akkauntId + '|' + ilova + '|' + v) }, key, u.subarray(17));
    return { kod: new TextDecoder().decode(pt), v, joriy: v === K.joriy.v };
  } catch (e) { return { xato: 'buzuq', v }; }
}
