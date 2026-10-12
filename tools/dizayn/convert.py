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

def skid(h):
    # skeletdagi id lar dublikat bo'lmasligi uchun olib tashlanadi; data-i yo'q bo'lsa tarjima uchun asl elementga havola (data-skel-src) qoladi
    def f(m):
        tag = m.group(0)
        if 'data-i=' in tag: return re.sub(r' id="[^"]*"', '', tag)
        return re.sub(r' id="([^"]*)"', r' data-skel-src="\1"', tag)
    return re.sub(r'<[a-z0-9]+ [^>]*\bid="[^"]*"[^>]*>', f, h)

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
        nb = False
        if ri < 0:
            ri = s.find('<section class="norm-banner', mend_open); nb = ri >= 0   # dtm/kaloriya: natija bannerda (norm-banner)
        if ri < 0:
            log.append('receipt <section> yo\'q — grid qo\'llanmadi (faqat sarlavha/bloklar)')
        else:
            re_end = bal(s, ri, 'section')
            if nb:
                acts = re.match(r'\s*<div class="receipt-actions">', s[re_end:])
                if acts: re_end += acts.start() + (bal(s[re_end + acts.start():], 0))
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
            # kalkulyator bo'lmagan eski havolalar (hujjat generatori, shablon fayl) yo'qolmasin (SEO: ichki havolalar kamaymasligi kerak)
            slugs_ = set(cat_by_slug)
            for m in re.finditer(r'<a href="([^"]+)"([^>]*)><span[^>]*>([^<]*)</span><span([^>]*)>([^<]*)</span></a>', blk):
                href, aattr, emo, attrs, txt = m.groups()
                if href in slugs_: continue
                ic_ = ICON_BY_EMOJI.get(emo.strip(), 'file-text')
                card_ = kcard(href, ic_, txt, txt, plain=True, lf=False, extra_attr=attrs.strip())
                if 'download' in aattr: card_ = card_.replace('<a class=', '<a download="" class=', 1)
                cards += card_
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
    if kind == 'calc' and 'class="calc-grid"' in s: refine_calc(slug, log)
    return True

# ---- natija kartasi qoidasi: to'q karta FAQAT asosiy natija (tag + raqam + 1-qatorlar guruhi + tugmalar);
#      diagramma, simulyator, izoh, jadval kartadan CHIQARILADI -> calc-grid ostida .res-extras (oq kartalar)
SKEL_UNIT = {'aliment-kalkulyator': ("0 so'm", '0 сум'), 'uy-qurish-kalkulyator': ("0 m²", '0 м²'), 'chorva-kalkulyator': ("0 so'm", '0 сум'), 'quyosh-panel-kalkulyator': ('0', '0')}
MAIN_CLS = ('receipt-tag', 'big-figure', 'receipt-actions')

def children(s, start, end):
    """s[start:end] ichidagi birinchi daraja elementlar: [(a, b, tag, class)]"""
    out = []; i = start
    while True:
        m = re.compile(r'<(div|button|p|a|details|table|section|ul|span)\b([^>]*)>').search(s, i, end)
        if not m: return out
        tag = m.group(1)
        try: e = bal(s, m.start(), tag)
        except ValueError: return out
        cm = re.search(r'class="([^"]*)"', m.group(2))
        out.append((m.start(), e, tag, cm.group(1) if cm else '')); i = e

def refine_calc(slug, log):
    f = R + slug + '.html'; s = open(f).read()
    if 'class="calc-grid"' not in s: log.append('calc-grid yo\'q'); return False
    if 'class="res-extras"' in s or 'class="res-skel"' in s: log.append('allaqachon tozalangan'); return False
    ga = s.index('<div class="calc-grid">'); ge = bal(s, ga)
    ra = s.find('<section class="receipt', ga)
    if ra < 0 or 'class="receipt-body"' not in s[ra:ra + 4000]: log.append('refine: receipt-body yo\'q (norm-banner) — o\'tkazildi'); return False
    re_ = bal(s, ra, 'section')
    receipt = s[ra:re_]
    ba = receipt.index('<div class="receipt-body">'); be = bal(receipt, ba)
    inner_a = ba + len('<div class="receipt-body">'); inner_e = be - 6
    kids = children(receipt, inner_a, inner_e)
    main, extras = [], []; rows_seen = False
    for a, b, tag, cls in kids:
        c = cls.split()
        if any(x in c for x in MAIN_CLS): main.append(receipt[a:b]); continue
        if 'receipt-rows' in c and not rows_seen: rows_seen = True; main.append(receipt[a:b]); continue
        if tag == 'button' and 'pdfbtn' in c: main.append(receipt[a:b]); continue
        extras.append(receipt[a:b])
    new_body = '<div class="receipt-body">\n' + '\n'.join(main) + '\n</div>'
    receipt2 = receipt[:ba] + new_body + receipt[be:]
    # skelet (natija yashirin bo'lsa)
    skel = ''
    if 'class="receipt show"' not in receipt[:60] and ' show' not in re.match(r'<section class="([^"]*)"', receipt).group(1):
        tag = re.search(r'<div class="receipt-tag"[^>]*>.*?</div>', receipt, re.S)
        lbl = re.search(r'<div class="lbl"[^>]*>.*?</div>', receipt, re.S)
        rows = re.findall(r'<div class="rrow"[^>]*>\s*(<span class="k"[^>]*>.*?</span>)', receipt, re.S)[:5]
        if slug == 'universitet-kontrakt-kalkulyator': lbl = None   # yorliq faqat hisoblashda JS bilan o'rnatiladi (RU da UZ qolib ketadi)
        uz, ru = SKEL_UNIT.get(slug, ("0 so'm", '0 сум'))
        rows_html = ''.join('<div class="rrow">' + re.sub(r'\s+', ' ', r_) + '<span class="v">—</span></div>' for r_ in rows)
        skel = ('<div class="res-skel" aria-label="Natija"><div class="receipt-body">%s'
                '<div class="skel-hint" data-lf-uz="Ma\'lumot kiriting — natija darhol hisoblanadi" data-lf-ru="Введите данные — результат посчитается сразу">Ma\'lumot kiriting — natija darhol hisoblanadi</div>'
                '<div class="big-figure"><div class="num" data-lf-uz="%s" data-lf-ru="%s">%s</div>%s</div>'
                '<div class="receipt-rows">%s</div></div></div>') % (skid(tag.group(0)) if tag else '', uz, ru, uz, skid(lbl.group(0)) if lbl else '', skid(rows_html))
        if not rows: log.append('skelet: qator yorliqlari topilmadi')
    grid = s[ga:ge]; grid = grid.replace(receipt, receipt2 + skel, 1)
    ex = ''
    if extras: ex = '\n<div class="res-extras">\n' + '\n'.join(extras) + '\n</div>\n'
    s = s[:ga] + grid + ex + s[ge:]
    open(f, 'w').write(s)
    log.append('extras=%d skelet=%s' % (len(extras), 'ha' if skel else 'yo\'q'))
    return True

def convert_ijara(log):
    f = R + 'ijara-stavkalari.html'; s = open(f).read()
    if 'class="calc-grid"' in s: log.append('allaqachon grid'); return False
    fa = s.index('<section class="form-card">'); fe = bal(s, fa, 'section')
    form = s[fa:fe]
    ra = form.index('<div class="receipt show" id="receipt">'); re_ = bal(form, ra)
    rc = form[ra:re_]; form_only = form[:ra] + form[re_:]
    lbl = re.search(r'<div class="rmain-lbl"([^>]*)>(.*?)</div>', rc, re.S)
    main = re.search(r'<div class="rmain"([^>]*)>(.*?)</div>', rc, re.S)
    rows = re.findall(r'<div class="rrow">.*?</div>', rc, re.S)
    src = rc[rc.index('<div class="rsrc"'):]; src = src[:bal(src, 0)]
    if not (lbl and main and rows and src): raise ValueError('ijara natija tarkibi kutilgandek emas')
    receipt = ('<section class="receipt show" id="receipt" aria-live="polite"><div class="receipt-body">\n'
               '<div class="receipt-tag"%s>%s</div>\n<div class="big-figure"><div class="num"%s>%s</div></div>\n'
               '<div class="receipt-rows">\n%s\n</div>\n%s\n</div></section>') % (lbl.group(1), lbl.group(2), main.group(1), main.group(2), '\n'.join(rows), src)
    grid = '<div class="calc-grid">\n<div class="calc-form">\n%s\n</div>\n<aside class="res-col" aria-label="Natija">%s</aside>\n</div>' % (form_only, receipt)
    s = s[:fa] + grid + s[fe:]
    if 'assets/calc-v2.js' not in s: s = s.replace('<script src="assets/answerbox.js" defer=""></script>', '<script src="assets/answerbox.js" defer=""></script>\n<script src="assets/calc-v2.js" defer=""></script>', 1)
    s = s.replace('<main class="wrap calc-main">', '<main class="wrap calc-main">', 1)
    open(f, 'w').write(s); log.append('grid qurildi: %d qator' % len(rows)); return True

# ---- emoji ikonkalarni olib tashlash (H1 va <title> dagi emoji SEO uchun o'zgarmaydi)
EMOJI = re.compile(r'[\U0001F100-\U0001F2FF\U0001F300-\U0001FAFF☀-⛿✀-➿⭐⬆]️?(?:‍[\U0001F300-\U0001FAFF☀-➿]️?)*')
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
            if kind == 'ijara':
                r = convert_ijara(log)
            elif kind == 'refine':
                r = refine_calc(slug, log)
            elif kind == 'strip':
                t = open(R + slug + '.html').read(); t, n_ = strip_emoji(t); open(R + slug + '.html', 'w').write(t); log.append('emoji: %d' % n_); r = True
            else:
                r = convert_calc(slug, log, kind) if kind in ('calc', 'gen') else None
            print(('OK   ' if r else 'o\'tkazildi ') + slug + ((' — ' + '; '.join(log)) if log else ''))
        except Exception as e:
            bad += 1; print('XATO ' + slug + ': ' + str(e))
    sys.exit(1 if bad else 0)
