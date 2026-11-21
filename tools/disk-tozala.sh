#!/usr/bin/env bash
# kalki.uz — haftalik XAVFSIZ disk tozalash (cron: yakshanba 04:30). FAQAT qayta tiklanadigan narsalar, 7 kundan eskilari.
# TEGILMAYDI: ~/backups, ~/ikonka-toplamlar, kalitlar (~/.kalkifit-*, ~/.cf-token), .env/.dev.vars, ma'lumot bazalari, docker volume/ishlab turgan konteyner/tagli image, git tarixi.
# Ishlatish: bash tools/disk-tozala.sh [--quruq]   (--quruq: faqat nima o'chishini ko'rsatadi)
set -u
Q=0; [ "${1:-}" = "--quruq" ] && Q=1
LOG="$HOME/disk-tozala.log"; H="$HOME"
log() { echo "$(date '+%F %T') $*" | tee -a "$LOG"; }
free() { df --output=avail -B1M / | tail -1 | tr -d ' '; }
oldin=$(free)
rm_old() {   # papka ichidagi 7 kundan eski fayllar (papkaning o'zi qoladi)
  local d="$1"; [ -d "$d" ] || return 0
  if [ $Q = 1 ]; then echo "[quruq] $d: $(find "$d" -mindepth 1 -mtime +7 2>/dev/null | wc -l) ta eski element"; else find "$d" -mindepth 1 -mtime +7 -delete 2>/dev/null; fi
}
# 1. build/test artefaktlari (repolar ichida) — APK'lar /ilova da
rm_old "$H/projects/kalkifit-android/dist"; rm_old "$H/projects/kalkifit-android/android/app/build"; rm_old "$H/projects/kalkifit-android/android/.gradle"
rm_old "$H/projects/kalki/docs/screenshots"; rm_old "$H/projects/kalki/tools/ai-sinov/out"; rm_old "$H/projects/kalki/.wrangler"
for r in "$H"/projects/*/; do rm_old "${r}test-results"; rm_old "${r}playwright-report"; rm_old "${r}tmp"; done
# 2. paket/yuklab olish keshlari
rm_old "$H/.npm/_npx"; rm_old "$H/.npm/_cacache"; rm_old "$H/.cache/pip"; rm_old "$H/.cache/puccinialin"
command -v uv >/dev/null 2>&1 && [ $Q = 0 ] && uv cache prune >/dev/null 2>&1
# 3. docker: faqat dangling image + 7 kundan eski build cache (ishlab turgan konteyner, volume, tagli image'larga tegilmaydi)
if command -v docker >/dev/null 2>&1 && [ $Q = 0 ]; then docker image prune -f >/dev/null 2>&1; docker builder prune -f --filter until=168h >/dev/null 2>&1; fi
# 4. eski VS Code server versiyalari: eng yangi 2 tasi qoladi (lru.json bo'yicha emas, o'zgargan vaqt bo'yicha)
S="$H/.vscode-server/cli/servers"; if [ -d "$S" ] && [ $Q = 0 ]; then ls -dt "$S"/Stable-* 2>/dev/null | tail -n +3 | xargs -r rm -rf; fi
# 5. /tmp: o'zimizning 7 kundan eski vaqtinchalik fayllar va eski sessiya scratchpad'lari (yangilariga tegilmaydi)
if [ $Q = 0 ]; then
  find /tmp -maxdepth 1 -user "$(id -un)" \( -name 'kalki-test-*' -o -name 'tmp.*' -o -name 'tmp*' -o -name 'audit-*' -o -name 'iabs_test_*' \) -mtime +7 -exec rm -rf {} + 2>/dev/null
  find /tmp/claude-1000 -mindepth 3 -type f -mtime +7 -delete 2>/dev/null; find /tmp/claude-1000 -mindepth 2 -type d -empty -mtime +7 -delete 2>/dev/null
fi
# 6. disk 85% dan oshgan bo'lsa — ogohlantirish (kunlik cron ham tekshiradi)
bash "$H/projects/kalki/tools/disk-ogohlantir.sh" >/dev/null 2>&1
log "disk-tozala: bo'sh ${oldin}M → $(free)M ($([ $Q = 1 ] && echo quruq || echo bajarildi))"
