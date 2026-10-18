/* kalki.uz — SERVER KALITI (gibrid rejim, B bosqich): AKKAUNT_MASTER_KEYS secret'ini o'qish va tekshirish. Kalit kodda/repoda EMAS — faqat Cloudflare secret'da.
 * Format: «versiya:kalit» juftliklari, vergul bilan. BIRINCHISI — joriy (yangi shifrlash shuni ishlatadi), qolganlari — faqat eski konvertlarni ochish uchun.
 *   AKKAUNT_MASTER_KEYS = "2:<yangi kalit>,1:<eski kalit>"        (kalit: kamida 43 ta tasodifiy harf/raqam; versiya: musbat butun son)
 * Kalit almashtirish (rotation): yangi juftlikni BOSHIGA qo'shing; hamma konvert qayta o'ralgach (B bosqich vositasi) eskisini olib tashlang. docs/akkaunt-kalit.md.
 * Bu fayl kalitni hech qayerga yozmaydi/chiqarmaydi; faqat barmoq izi (fingerprint) — kalit to'g'ri saqlanganini tekshirish uchun. */
export const KALIT_MIN = 43;
export function kalitlar(env) {
  const raw = env && env.AKKAUNT_MASTER_KEYS; if (typeof raw !== 'string' || !raw.trim()) return null;
  const out = [], seen = {};
  for (const part of raw.split(',')) {
    const m = /^\s*(\d{1,6}):([A-Za-z0-9_-]+)\s*$/.exec(part); if (!m) return null;
    const v = parseInt(m[1], 10); if (v < 1 || seen[v] || m[2].length < KALIT_MIN) return null; seen[v] = true;
    out.push({ v, kalit: m[2] });
  }
  return out.length ? { joriy: out[0], hammasi: out } : null;
}
export async function izi(kalit) {                           // barmoq izi: SHA-256(«kalki-akkaunt-kalit|» + kalit) ning dastlabki 8 hex belgisi
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('kalki-akkaunt-kalit|' + kalit));
  return Array.from(new Uint8Array(d)).slice(0, 4).map((b) => b.toString(16).padStart(2, '0')).join('');
}
