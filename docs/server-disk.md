# Server diski: Hetzner volume (2026-11-21)

Asosiy disk (`/`, 38 GB) to'lib qolgani uchun og'ir ma'lumotlar Hetzner volume'ga ko'chirildi:
**`/mnt/HC_Volume_107564322`** (20 GB, `/dev/sdb`). Natija: `/` 98 % → 53 %, volume 51 %, barcha konteynerlar ishlayapti.

## Nima qayerda

| Narsa | Joyi | Sozlama |
|---|---|---|
| Docker data-root (image, konteyner, **volume — bazalar**) | `/mnt/HC_Volume_107564322/docker` | `/etc/docker/daemon.json` → `"data-root"` |
| containerd (image/snapshot) | `/mnt/HC_Volume_107564322/containerd` | `/etc/containerd/config.toml` → `root` |
| Swap (4 GB; eski `/swapfile`, `/swapfile2` o'rniga) | `/mnt/HC_Volume_107564322/swapfile` | `/etc/fstab` (`sw,nofail`) |
| Uy keshlari (simlink) | `/mnt/HC_Volume_107564322/asror/…` | `~/.npm`, `~/.gradle`, `~/Android`, `~/wk-libs`, `~/wk-debs`, `~/.cache/ms-playwright` → volume |

Simlinklar shaffof: testlar, `source ~/wk-env.sh`, Playwright, npm, Gradle avvalgidek ishlaydi.
`~/.claude`, `~/.local/share/claude`, `~/.vscode-server`, venv'lar ataylab ko'chirilmagan (ishlab turgan xizmatlarniki).

**Muhim:** volume mount qilinmasa docker (va undagi bazalar) ishga tushmaydi. Volume'ni serverdan uzmang;
qayta o'rnatishda avval `/etc/fstab` dagi mount, keyin docker.

## Skriptlar (`~/projects/jamoam/tools/`)

- `docker-volume-kochir.sh` — docker + containerd ni volume'ga ko'chirish (`--quruq` — reja, `--swap` — swap ham). Eski papkalarni o'chirmaydi, `*.old` qiladi.
- `uy-kochir.sh` — uy papkasidagi katta keshlarni volume'ga ko'chirib simlink qo'yadi (sudo kerak emas, `--quruq`).

## Eski `.old` papkalar

`/var/lib/docker.old` va `/var/lib/containerd.old` — ko'chirishdan oldingi nusxa (qaytish uchun).
Saytlar/botlar 1 kun barqaror ishlasa (**2026-11-22 dan keyin**) o'chiriladi:

```bash
sudo rm -rf /var/lib/docker.old /var/lib/containerd.old
```

Avtomatik o'chirish rejalashtirilmagan — bu buyruq qo'lda (sudo) bajariladi.

## Kuzatuv

- `kalki/tools/disk-ogohlantir.sh` (cron, har kuni 09:00): `/` va har bir `/mnt/HC_Volume_*` uchun alohida — 85 % dan oshsa Telegram admin guruhiga (diskka kuniga bir marta, 95 % dan oshsa har safar).
- `kalki/tools/disk-tozala.sh` (cron, yakshanba 04:30): xavfsiz haftalik tozalash.
