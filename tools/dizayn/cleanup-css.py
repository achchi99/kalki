#!/usr/bin/env python3
"""Sahifalarning inline <style> idagi eski sarlavha/topbar/til-tugmasi qoidalarini (V2 da ishlatilmaydi) olib tashlaydi.
python3 tools/dizayn/cleanup-css.py [--dry] [slug ...]"""
import re, sys, json, os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')) + '/'
DEAD = re.compile(r'^(header\b|\.topbar\b|\.brand\b|\.brand-dot\b|\.lang-seg\b|#topmenu\b|\.tm-in\b|#sitebar\b|nav#topmenu\b)')

def blocks(css):
    """css ni (selektor, ichki, to'liq) bo'laklarga ajratadi (@media ichi rekursiv)."""
    out = []; i = 0; n = len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0: out.append(('', None, css[i:])); break
        depth = 1; k = j + 1
        while k < n and depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        out.append((css[i:j].strip(), css[j + 1:k - 1], css[i:k])); i = k
    return out

def clean(css):
    res = []; removed = 0
    for sel, inner, full in blocks(css):
        if inner is None: res.append(full); continue
        if sel.startswith('@media') or sel.startswith('@supports'):
            c2, r2 = clean(inner); removed += r2
            if c2.strip(): res.append(sel + '{' + c2 + '}')
            else: removed += len(full)
            continue
        if sel.startswith('@'): res.append(full); continue
        parts = [p.strip() for p in sel.split(',') if p.strip()]
        if parts and all(DEAD.match(p) for p in parts): removed += len(full); continue
        res.append(full)
    return '\n'.join(x.strip() if x.strip().startswith('@') or True else x for x in res), removed

def main():
    dry = '--dry' in sys.argv; only = [a for a in sys.argv[1:] if not a.startswith('--')]
    V = [f for f in json.load(open(R + 'tools/dizayn/v2-pages.json')) if not only or f[:-5] in only]
    tot = 0
    for f in V:
        s = open(R + f).read(); rem = 0
        def sub(m):
            nonlocal rem
            if 'id="v2' in m.group(0)[:30]: return m.group(0)
            c, r = clean(m.group(2)); rem += r
            return m.group(1) + c + m.group(3)
        s2 = re.sub(r'(<style[^>]*>)(.*?)(</style>)', sub, s, flags=re.S)
        tot += rem
        if rem and not dry: open(R + f, 'w').write(s2)
        print('%-52s -%d B' % (f, rem))
    print('jami olib tashlandi: %d B' % tot)
main()
