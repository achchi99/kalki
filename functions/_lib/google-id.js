/* kalki.uz — Google ID token (JWT, RS256) tekshiruvi: Google ochiq kalitlari (JWKS) bilan imzo, iss, aud = WEB client ID, muddat, email_verified.
 * Client secret KERAK EMAS. Kalitlar modul xotirasida keshlanadi (Cache-Control max-age, ko'pi bilan 6 soat).
 *   googleTekshir(token, clientId, { now?, jwks? }) → { email, ism } | { xato: 'format'|'alg'|'kid'|'imzo'|'iss'|'aud'|'muddat'|'email' }
 *   cidOk(id) — WEB client ID ko'rinishi to'g'rimi (…apps.googleusercontent.com) */
export const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ISS = ['accounts.google.com', 'https://accounts.google.com'], SKEW = 60000;
let cache = { keys: null, until: 0 };
/* ko'rsatiladigan ism: bo'shliqlar yig'iladi, < > olib tashlanadi, ≤ 40 belgi (Unicode bo'yicha); bo'sh bo'lsa '' */
export function ismTozala(s) { const t = String(s == null ? '' : s).replace(/[<>\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim(); return Array.from(t).slice(0, 40).join('').trim(); }
export const cidOk = (id) => typeof id === 'string' && /^[0-9]{5,30}-[a-z0-9]{10,64}\.apps\.googleusercontent\.com$/.test(id);
function b64uBytes(s) { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
function b64uJson(s) { return JSON.parse(new TextDecoder().decode(b64uBytes(s))); }
async function keysOf(now, jwks) {
  if (jwks) return typeof jwks === 'function' ? jwks() : jwks;
  if (cache.keys && cache.until > now) return cache.keys;
  const r = await fetch(JWKS_URL, { cf: { cacheTtl: 3600 } }); if (!r.ok) throw new Error('jwks ' + r.status);
  const j = await r.json(), m = /max-age=(\d+)/.exec(r.headers.get('Cache-Control') || ''), ttl = Math.min(6 * 3600, m ? +m[1] : 3600) * 1000;
  cache = { keys: j.keys || [], until: now + ttl }; return cache.keys;
}
export async function googleTekshir(token, clientId, o) {
  o = o || {}; const now = o.now || Date.now();
  if (typeof token !== 'string' || token.length > 4096) return { xato: 'format' };
  const p = token.split('.'); if (p.length !== 3) return { xato: 'format' };
  let h, c; try { h = b64uJson(p[0]); c = b64uJson(p[1]); } catch (e) { return { xato: 'format' }; }
  if (h.alg !== 'RS256') return { xato: 'alg' };
  let keys; try { keys = await keysOf(now, o.jwks); } catch (e) { return { xato: 'kid' }; }
  let jwk = (keys || []).find((k) => k.kid === h.kid); if (!jwk && !o.jwks) { cache.until = 0; try { keys = await keysOf(now); jwk = keys.find((k) => k.kid === h.kid); } catch (e) {} }          // kalit almashgan bo'lishi mumkin — bir marta yangilanadi
  if (!jwk) return { xato: 'kid' };
  let ok = false;
  try { const key = await crypto.subtle.importKey('jwk', { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RS256', ext: true }, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64uBytes(p[2]), new TextEncoder().encode(p[0] + '.' + p[1])); } catch (e) { ok = false; }
  if (!ok) return { xato: 'imzo' };
  if (!ISS.includes(c.iss)) return { xato: 'iss' };
  if (!cidOk(clientId) || (Array.isArray(c.aud) ? !c.aud.includes(clientId) : c.aud !== clientId)) return { xato: 'aud' };
  if (!(typeof c.exp === 'number' && c.exp * 1000 > now - SKEW) || (typeof c.iat === 'number' && c.iat * 1000 > now + SKEW * 5)) return { xato: 'muddat' };
  if (!(c.email_verified === true || c.email_verified === 'true') || typeof c.email !== 'string') return { xato: 'email' };
  return { email: c.email.trim().toLowerCase(), ism: ismTozala(c.name) || ismTozala(c.given_name) };
}
export const _test = { reset: () => { cache = { keys: null, until: 0 }; } };
