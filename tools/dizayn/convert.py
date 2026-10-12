#!/usr/bin/env python3
"""V2 ga o'tkazish: UZ manba sahifaning markup qobig'ini yangi tuzilishga keltiradi (kontent matni o'zgarmaydi).
   python3 tools/dizayn/convert.py calc <slug> [<slug> ...]
Keyin: node tools/site-chrome.js --write (sarlavha/footer/CSS), node tools/prerender.js <fayl> --write.
"""
import re, sys, json, os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')) + '/'

def bal(s, start, tag='div'):
    o = re.compile(r'<%s\b' % tag); c = re.compile(r'</%s>' % tag); depth = 0; i = start
    while True:
        mo = o.search(s, i); mc = c.search(s, i)
        if mc is None: raise ValueError('juftlanmagan <%s> @%d' % (tag, start))
        if mo and mo.start() < mc.start(): depth += 1; i = mo.end()
        else:
            depth -= 1; i = mc.end()
            if depth == 0: return i

def cut(s, a, b): return s[:a] + s[b:]

# ---- kalkulyatorlar katalogi (index.html dan): slug -> (kategoriya, ikonka, nomlar)
def catalog():
    idx = open(R + 'index.html').read()
    calcs = []
    for m in re.finditer(r"\{cat:'([a-z]+)', href:'([a-z0-9-]+)', ic:'([a-z-]+)', id:'([a-z]+)'\}", idx): calcs.append(m.groups())
    uz = idx[idx.index('    uz:{'):idx.index('    ru:{')]; ru = idx[idx.index('    ru:{'):]
    def names(block):
        d = {}
        for m in re.finditer(r'\b([a-z]+):\["([^"]+)","([^"]+)"\]', block): d[m.group(1)] = (m.group(2), m.group(3))
        return d
    nu, nr = names(uz), names(ru)
    return [dict(cat=c, slug=h, ic=i, id=k, uz=nu.get(k), ru=nr.get(k)) for c, h, i, k in calcs]

ICON_BY_EMOJI = {'📝': 'pen', '📰': 'newspaper', '🧮': 'bar-chart', '📊': 'bar-chart', '📄': 'file-text'}

def svg(i): return '<svg class="ic" aria-hidden="true"><use href="/assets/icons.svg#i-%s"></use></svg>' % i

def kcard(href, icon, uz, ru, du=None, dr=None, plain=False, lf=True, extra_attr=''):
    cls = 'k-card plain' if plain else 'k-card'
    if lf:
        body = '<span class="k-name" data-lf-uz="%s" data-lf-ru="%s">%s</span>' % (uz, ru, uz)
        if du: body += '<span class="k-desc" data-lf-uz="%s" data-lf-ru="%s">%s</span>' % (du, dr, du)
    else: body = '<span class="k-name" %s>%s</span>' % (extra_attr, uz)
    return '<a class="%s" href="%s"><span class="k-ico">%s</span><span class="k-body">%s</span></a>' % (cls, href, svg(icon), body)

OVER = '<div class="ab-over">' + svg('info') + '<span data-lf-uz="Qisqacha" data-lf-ru="Кратко">Qisqacha</span></div>'

def convert_calc(slug, log, kind='calc'):
    f = R + slug + '.html'; s = open(f).read()
    if 'class="pagehead band"' in s: log.append('allaqachon V2'); return None
    # 1. header
    ha = s.index('<header>'); hb = s.index('</header>', ha) + 9
    hdr = s[ha:hb]
    wa = hdr.index('<div class="wrap">'); we = bal(hdr, wa)
    inner = hdr[wa + len('<div class="wrap">'):we - 6]
    badge = re.search(r'<span class="cat-badge"[^>]*>.*?</span>', inner, re.S)
    h1 = re.search(r'<h1[^>]*>.*?</h1>', inner, re.S); sub = re.search(r'<p class="sub"[^>]*>.*?</p>', inner, re.S)
    if not (badge and h1 and sub): raise ValueError('header tarkibi kutilgandek emas')
    rest = inner
    for m in (badge, h1, sub): rest = rest.replace(m.group(0), '', 1)
    rest = rest.strip()
    # 2. breadcrumb
    bc = re.search(r'<div class="wrap"><nav id="breadcrumb".*?</nav></div>', s, re.S)
    bc_html = bc.group(0) if bc else ''
    if bc: s = s.replace(bc_html, '', 1)
    # 3. answerbox
    aa = s.index('<div class="answerbox noprint" id="answerbox">'); ae = bal(s, aa)
    ab = s[aa:ae]; s = cut(s, aa, ae)
    ha = s.index('<header>'); hb = s.index('</header>', ha) + 9
    band = ('<header class="pagehead band">\n  <div class="wrap ct-in">\n    <div class="ct-l">\n      %s\n      %s\n      %s%s\n    </div>\n    <div class="ab-card">%s%s</div>\n  </div>\n</header>'
            % (badge.group(0), h1.group(0), sub.group(0), ('\n      ' + rest) if rest else '', OVER, ab))
    s = s[:ha] + bc_html + '\n' + band + s[hb:]
    # 4. main
    mcls = 'wrap calc-main' if kind == 'calc' else 'wrap gen-main'
    ma = s.index('<main class="wrap">'); s = s.replace('<main class="wrap">', '<main class="%s">' % mcls, 1)
    mend_open = ma + len('<main class="%s">' % mcls)
    # 5. grid
    if kind == 'calc':
        ri = s.find('<section class="receipt', mend_open)
        if ri < 0:
            log.append('receipt <section> yo\'q — grid qo\'llanmadi (faqat sarlavha/bloklar)')
        else:
            re_end = bal(s, ri, 'section')
            edge = re.match(r'\s*<div class="receipt-edge"></div>', s[re_end:])
            if edge: re_end += edge.end()
            receipt = s[ri:re_end]; form = s[mend_open:ri].strip()
            smeta = ''
            sa = receipt.find('<div id="smeta-cta"')
            if sa > -1:
                se = bal(receipt, sa); smeta = receipt[sa:se]; receipt = receipt[:sa] + receipt[se:]
            grid = '\n<div class="calc-grid">\n<div class="calc-form">\n%s\n</div>\n<aside class="res-col" aria-label="Natija">%s</aside>%s\n</div>\n' % (form, receipt, ('\n' + smeta) if smeta else '')
            s = s[:mend_open] + grid + s[re_end:]
    # 6. tgcta
    ta = s.find('<div id="tgcta"')
    if ta > -1: s = cut(s, ta, bal(s, ta))
    # 7. articleLink + related
    cat_by_slug = {c['slug']: c for c in catalog()}; me = cat_by_slug.get(slug)
    la = s.find('<div id="articleLink"')
    if la > -1:
        le = bal(s, la); blk = s[la:le]
        title = re.search(r'<div data-artt-uz="([^"]*)" data-artt-ru="([^"]*)">([^<]*)</div>', blk)
        all_a = re.search(r'<a href="blog"[^>]*data-arta-uz="([^"]*)" data-arta-ru="([^"]*)"[^>]*>([^<]*)</a>', blk)
        cards = ''
        for m in re.finditer(r'<a href="([^"]+)"[^>]*><span[^>]*>([^<]*)</span><span([^>]*)>([^<]*)</span><span[^>]*>→</span></a>', blk):
            href, emo, attrs, txt = m.groups(); ic = ICON_BY_EMOJI.get(emo.strip(), 'file-text')
            cards += kcard(href, ic, txt, txt, plain=True, lf=False, extra_attr=attrs.strip())
        if not cards: log.append('articleLink: kartalar ajratilmadi'); 
        else:
            tt = title.groups() if title else ('Foydali maqolalar', 'Полезные статьи', 'Foydali maqolalar'); aa_ = all_a.groups() if all_a else ('Barcha maqolalar →', 'Все статьи →', 'Barcha maqolalar →')
            new = ('<section class="section" id="articleLink"><div class="section-h"><h2 data-artt-uz="%s" data-artt-ru="%s">%s</h2><a href="blog" data-arta-uz="%s" data-arta-ru="%s">%s</a></div><div class="grid g3">%s</div></section>'
                   % (tt[0], tt[1], tt[2], aa_[0], aa_[1], aa_[2], cards))
            s = s[:la] + new + s[le:]
    ra = s.find('<div id="related"')
    if ra > -1:
        re_ = bal(s, ra); blk = s[ra:re_]
        old_h = [m for m in re.findall(r'<a href="([^"]+)"', blk)]
        if kind == 'calc':
            same = [c for c in catalog() if me and c['cat'] == me['cat'] and c['slug'] != slug]
            order = [c for c in same if c['slug'] in old_h] + [c for c in same if c['slug'] not in old_h]
            pick = order[:5]
            if len(pick) < 3 or not me: log.append('related: kategoriya ro\'yxati kam (%d)' % len(pick))
            cards = ''.join(kcard(c['slug'], c['ic'], c['uz'][0], c['ru'][0], c['uz'][1], c['ru'][1]) for c in pick)
        else:
            cards = ''
            for m in re.finditer(r'<a href="([^"]+)"[^>]*><span[^>]*>([^<]*)</span><span([^>]*)>([^<]*)</span></a>', blk):
                href, emo, attrs, txt = m.groups(); cat_ = cat_by_slug.get(href)
                ic_ = cat_['ic'] if cat_ else ICON_BY_EMOJI.get(emo.strip(), 'file-text')
                cards += kcard(href, ic_, txt, txt, plain=True, lf=False, extra_attr=attrs.strip())
            if not cards: log.append('related: kartalar ajratilmadi')
        new = ('<section class="section" id="related"><div class="section-h"><div><span class="over" data-lf-uz="Shu kategoriyadan" data-lf-ru="Из этой категории">Shu kategoriyadan</span>'
               '<h2 id="relTitle">%s</h2></div></div><div class="grid g3">%s</div></section>' % (('Tegishli kalkulyatorlar' if kind == 'calc' else 'Bulardan ham foydalanishingiz mumkin'), cards))
        s = s[:ra] + new + s[re_:]
        if kind == 'calc':
            s = s.replace('var _rt={uz:"Bulardan ham foydalanishingiz mumkin",ru:"Вам также может пригодиться"};', 'var _rt={uz:"Tegishli kalkulyatorlar",ru:"Похожие калькуляторы"};')
            s = s.replace("lang==='ru'?'Вам также может пригодиться':'Bulardan ham foydalanishingiz mumkin'", "lang==='ru'?'Похожие калькуляторы':'Tegishli kalkulyatorlar'")
            if 'Bulardan ham' in s: log.append('relTitle: eski matn qoldi')
    # 8. footer eslatma
    s = re.sub(r'<footer data-i="foot">(.*?)</footer>', r'<p class="foot-note" data-i="foot">\1</p>', s, flags=re.S)
    # 9. skript va PDF
    if kind == 'calc' and 'assets/calc-v2.js' not in s: s = s.replace('<script src="assets/answerbox.js" defer=""></script>', '<script src="assets/answerbox.js" defer=""></script>\n<script src="assets/calc-v2.js" defer=""></script>', 1)
    n1 = s.count("card.style.filter='none';"); n2 = s.count('card.style.filter=pf;')
    s = s.replace("card.style.filter='none';", "card.style.filter='none';card.classList.add('pdf-light');").replace('card.style.filter=pf;', "card.style.filter=pf;card.classList.remove('pdf-light');")
    if (n1, n2) != (1, 1): log.append('PDF kodi: none=%d pf=%d' % (n1, n2))
    s, ne = strip_emoji(s)
    if ne: log.append('emoji olib tashlandi: %d' % ne)
    open(f, 'w').write(s)
    return True

# ---- emoji ikonkalarni olib tashlash (H1 va <title> dagi emoji SEO uchun o'zgarmaydi)
EMOJI = re.compile(r'[\U0001F300-\U0001FAFF☀-⛿✀-➿⭐⬆]️?(?:‍[\U0001F300-\U0001FAFF☀-➿]️?)*')
KEEP_CHARS = '✓✔→←↑↓•·—–×÷±≈≤≥'
def strip_emoji(s, log=None):
    out = []; last = 0; n = 0
    mh = re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S)
    h1plain = EMOJI.sub('', re.sub(r'<[^>]+>', '', mh.group(1))).strip()[:14] if mh else ''
    for m in EMOJI.finditer(s):
        e = m.group(0)
        if e[0] in KEEP_CHARS or e in ('✓', '✔'): continue
        line_start = s.rfind('\n', 0, m.start()) + 1; line_end = s.find('\n', m.end()); line_end = len(s) if line_end < 0 else line_end
        line = s[line_start:line_end]
        before = s[line_start:m.start()]
        if re.search(r'<h1[^>]*>[^<]*$', before) or re.search(r'\bh1\s*:\s*["\'][^"\']*$', before) or re.search(r'<title>[^<]*$', before) or re.search(r'document\.title', line) or re.search(r'\btitle\s*:', before):
            continue
        end = m.end()
        if h1plain and s[end:end + 1 + len(h1plain)].lstrip().startswith(h1plain): continue   # H1 dan olingan matn (breadcrumb, JSON-LD, og) — SEO
        if s[end:end + 1] == ' ': end += 1
        out.append(s[last:m.start()]); last = end; n += 1
        if log is not None: log.append('%s @ %s' % (e, s[max(0, m.start() - 25):m.end() + 20].replace('\n', ' ')))
    out.append(s[last:])
    return ''.join(out), n

if __name__ == '__main__':
    kind = sys.argv[1]; bad = 0
    for slug in sys.argv[2:]:
        log = []
        try:
            if kind == 'strip':
                t = open(R + slug + '.html').read(); t, n_ = strip_emoji(t); open(R + slug + '.html', 'w').write(t); log.append('emoji: %d' % n_); r = True
            else:
                r = convert_calc(slug, log, kind) if kind in ('calc', 'gen') else None
            print(('OK   ' if r else 'o\'tkazildi ') + slug + ((' — ' + '; '.join(log)) if log else ''))
        except Exception as e:
            bad += 1; print('XATO ' + slug + ': ' + str(e))
    sys.exit(1 if bad else 0)
