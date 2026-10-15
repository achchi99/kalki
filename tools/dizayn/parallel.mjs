// Brauzer testlari uchun yordamchi: BITTA brauzer ichida bir nechta sahifani baravar kutish.
// Sahifa testlaridagi vaqtning asosiy qismi — timer kutishlari (networkidle, waitForTimeout), CPU emas, shuning uchun
// 3–5 ta vazifani bir vaqtda kutish natijani o'zgartirmaydi, lekin vaqtni 3–5 marta qisqartiradi.
// pool(items, limit, fn) — natijalar items tartibida qaytadi (chiqish tartibi barqaror). Har bir vazifa O'Z kontekstini ochadi.
export const LIMIT = Math.max(1, Number(process.env.TEST_PAR) || 4);
export async function pool(items, limit, fn) {
  const out = new Array(items.length); let next = 0;
  const worker = async () => { for (;;) { const i = next++; if (i >= items.length) return; out[i] = await fn(items[i], i); } };
  await Promise.all(Array.from({ length: Math.min(limit || LIMIT, items.length) }, worker));
  return out;
}
