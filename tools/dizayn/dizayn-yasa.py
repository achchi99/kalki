#!/usr/bin/env python3
"""assets/css/kalkifit-dizayn.css ni yasaydi (3 dizayn varianti: ?dizayn=a|b|c). Prod'ga tegmaydi: faqat ?dizayn= bilan yuklanadi.
Ishlatish: python3 tools/dizayn/dizayn-yasa.py"""
import os
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
# --- ohang (maslahat kartasi) tokenlari: yorug' / tungi
TONE_L = "--dz-good:#0E8F63;--dz-good2:#0B7A55;--dz-good-bg:#E6F6EF;--dz-good-ink:#0B6B49;--dz-info:#3D7BE6;--dz-info2:#2D67C4;--dz-info-bg:#E8F0FD;--dz-info-ink:#1F57B0;--dz-warn:#E0901F;--dz-warn2:#B8680F;--dz-warn-bg:#FFF2D9;--dz-warn-ink:#8A4F00;"
TONE_D = "--dz-good:#2FBF8A;--dz-good2:#1E9C6E;--dz-good-bg:rgba(47,191,138,.14);--dz-good-ink:#7FE0B8;--dz-info:#5B9BFA;--dz-info2:#3D7BE6;--dz-info-bg:rgba(91,155,250,.15);--dz-info-ink:#A9CBFF;--dz-warn:#F0B04A;--dz-warn2:#D9831A;--dz-warn-bg:rgba(240,176,74,.15);--dz-warn-ink:#F5CE85;"
V = {
 'a': dict(
  L="--bg:#FBF3EA;--card:#FFFDFA;--soft:#F6EBDF;--field:#F6EBDF;--line:#EFE1D2;--line2:#E3D0BD;--track:#EEDFCF;--ink:#2A1F17;--mut:#6B5A4C;--mut2:#6B5A4C;--vessel:#FFF1E6;--dz-sh:0 1px 2px rgba(120,70,30,.06),0 8px 24px -10px rgba(120,70,30,.20);--dz-sh2:0 2px 4px rgba(120,70,30,.07),0 18px 40px -16px rgba(150,70,25,.28);--dz-nav:rgba(255,250,243,.74);--dz-navline:rgba(120,70,30,.10);--dz-bar:9px;--dz-hero:linear-gradient(165deg,#FFD9BF 0%,#FFE9D8 48%,#FFFDFA 100%);--dz-bd:1px solid rgba(120,70,30,.07);",
  D="--bg:#16110D;--card:#211A15;--soft:#2B221B;--field:#2B221B;--line:#33291F;--line2:#45372A;--track:#33291F;--ink:#F7EFE6;--mut:#B8A898;--mut2:#B8A898;--vessel:#2E1F16;--dz-sh:0 1px 2px rgba(0,0,0,.4),0 10px 28px -12px rgba(0,0,0,.6);--dz-sh2:0 2px 4px rgba(0,0,0,.45),0 22px 44px -18px rgba(0,0,0,.7);--dz-nav:rgba(33,26,21,.72);--dz-navline:rgba(255,235,215,.09);--dz-bar:9px;--dz-hero:linear-gradient(165deg,#4A2B1A 0%,#2E2018 55%,#211A15 100%);--dz-bd:1px solid rgba(255,235,215,.06);"),
 'b': dict(
  L="--bg:#F2F3F7;--card:#FFFFFF;--soft:#F0F2F6;--field:#F0F2F6;--line:#E6E9EF;--line2:#D8DCE5;--track:#E6E9EF;--ink:#171A21;--mut:#5C6678;--mut2:#5C6678;--dz-sh:0 1px 2px rgba(20,28,50,.06),0 10px 28px -12px rgba(20,28,50,.22);--dz-sh2:0 14px 36px -10px rgba(168,46,18,.55);--dz-nav:rgba(255,255,255,.76);--dz-navline:rgba(20,28,50,.08);--dz-bar:10px;--dz-hero:linear-gradient(160deg,#D8481A 0%,#BC3817 55%,#A02E14 100%);--dz-bd:0 solid transparent;",
  D="--bg:#0D0F13;--card:#1A1D23;--soft:#242830;--field:#242830;--line:#272B33;--line2:#363B46;--track:#2B2F38;--ink:#F3F5F9;--mut:#A3ADBD;--mut2:#A3ADBD;--dz-sh:0 1px 2px rgba(0,0,0,.5),0 12px 30px -12px rgba(0,0,0,.7);--dz-sh2:0 16px 40px -12px rgba(0,0,0,.75);--dz-nav:rgba(26,29,35,.74);--dz-navline:rgba(255,255,255,.08);--dz-bar:10px;--dz-hero:linear-gradient(160deg,#B8401A 0%,#8F2E13 55%,#6E2210 100%);--dz-bd:1px solid rgba(255,255,255,.05);"),
 'c': dict(
  L="--bg:#FFFFFF;--card:#FFFFFF;--soft:#F5F6F8;--field:#F5F6F8;--line:#E4E7EC;--line2:#CBD0D9;--track:#E9ECF1;--ink:#0B0D12;--mut:#566074;--mut2:#566074;--dz-sh:none;--dz-sh2:none;--dz-nav:rgba(255,255,255,.78);--dz-navline:rgba(11,13,18,.10);--dz-bar:12px;--dz-hero:#FFFFFF;--dz-bd:1px solid #E4E7EC;",
  D="--bg:#08090B;--card:#0F1114;--soft:#171A1F;--field:#171A1F;--line:#22262D;--line2:#343A45;--track:#232830;--ink:#FFFFFF;--mut:#9AA4B5;--mut2:#9AA4B5;--dz-sh:none;--dz-sh2:none;--dz-nav:rgba(8,9,11,.78);--dz-navline:rgba(255,255,255,.10);--dz-bar:12px;--dz-hero:#0F1114;--dz-bd:1px solid #22262D;"),
}
out = ["/* KalkiFit — 3 dizayn varianti (faqat ?dizayn=a|b|c bilan yuklanadi; prod'ga ta'sir qilmaydi). Yaratuvchi: tools/dizayn/dizayn-yasa.py — qo'lda tahrirlamang. */"]
for k, t in V.items():
    s = f"html[data-dz={k}]"
    out.append(f"{s}:not([data-theme=dark]) .sl.sl,{s}[data-theme=light] .sl.sl{{{t['L']}{TONE_L}}}")
    out.append(f"@media (prefers-color-scheme:dark){{{s}:not([data-theme=light]) .sl.sl{{{t['D']}{TONE_D}}}}}")
    out.append(f"{s}[data-theme=dark] .sl.sl{{{t['D']}{TONE_D}}}")
out.append(open(os.path.join(os.path.dirname(__file__), 'dizayn-komponent.css')).read())
open(os.path.join(ROOT, 'assets/css/kalkifit-dizayn.css'), 'w').write('\n'.join(out) + '\n')
print('OK', sum(len(x) for x in out))
