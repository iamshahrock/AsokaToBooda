# Builds /asoka-to-booda/manuscript/: the Master Manuscript "Asoka to Boo-Da - SRK: The Man, The Myth, The King"
# (18 Oct 2026), integrated from every version of the thesis. Source: the Claude Doc
# https://claude.ai/code/artifact/46d4ff43-76ed-4224-a4a4-70a91338a16f exported as markdown (ms.md) + images in img/.
# The doc export drops pictures and charts, so they are put back here by their caption lines.
# Usage: python3 tools/build-manuscript-web.py SRC asoka-to-booda/manuscript
import re, sys, os, shutil, subprocess, html
SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(f'{OUT}/img', exist_ok=True)
for f in os.listdir(f'{SRC}/img'):
    shutil.copy(f'{SRC}/img/{f}', f'{OUT}/img/{f}')
md = open(f'{SRC}/ms.md').read()
md = '\n'.join(l for l in md.split('\n') if not l.startswith(('[embedded content', '&#91;embedded content')))  # the doc's chart placeholder; the chart is drawn below

# pictures, put back before their captions
CAPS = [('*SRKWorld.com, 2000: “Diaper Days”', 'e02', 'SRKWorld.com, 2000: Diaper Days'),
        ('*SRKWorld.com, 2000: “From School To Cool”', 'e03', 'SRKWorld.com, 2000: From School To Cool'),
        ('*SRKWorld.com, 2000: the page on his struggle', 'e04', 'SRKWorld.com, 2000: the theatre page'),
        ('*SRKWorld.com, 2000: “TV Cereal”', 'e05', 'SRKWorld.com, 2000: TV Cereal'),
        ('*SRKWorld.com, 2000: “The Wall”', 'e06', 'SRKWorld.com, 2000: The Wall'),
        ('*SRKWorld.com, 2000: “Going Digital”', 'e07', 'SRKWorld.com, 2000: Going Digital'),
        ('*SRKWorld.com in 2000, photographed', 'e08', 'SRKWorld.com in 2000 on Internet Explorer screens'),
        ('*Seated at the table', 'e09', 'Shah Rukh Khan presenting SRKWorld, 14 November 2000'),
        ('*The G.One Style Guide, cover', 'gone-styleguide', 'G.One Style Guide, from the movie Ra.One'),
        ('*SRKWorld.com, 2000: “Opening Office”', 'e10', 'SRKWorld.com, 2000: Opening Office'),
        ('*G.One, “Superhero with a H.A.R.T”', 'gone-figure', 'G.One limited-edition collector figure'),
        ('*G.One in Ra.Ville', 'gone-comic', 'G.One in Ra.Ville, the Ra.One comic'),
        ('*Shah Rukh Khan with Rajan Anandan', 'e13', 'Shah Rukh Khan with Rajan Anandan of Google India, 2011'),
        ('*Case study, p. 12', 'ce-p-12', 'Chennai Express case study, page 12'),
        ('*Case study, p. 7', 'ce-p-07', 'Chennai Express case study, page 7'),
        ('*Case study, p. 10', 'ce-p-10', 'Chennai Express case study, page 10'),
        ("*SRKWorld.com, 2000: the fans' page", 'e15', "SRKWorld.com, 2000: the fans' page"),
        ('*Shah Rock Jaan in the ijOO universe', 'ijoo', 'Shah Rock Jaan in the ijOO universe'),
        ('*DOOM to KING: One Christmas', 'doom-to-king', 'DOOM to KING: One Christmas, Two Crowns')]
lines = md.split('\n')
for pre, img, alt in CAPS:
    hit = [i for i, l in enumerate(lines) if l.startswith(pre)]
    assert len(hit) == 1, (pre, hit)
    lines[hit[0]] = f'![{alt}](img/{img}.webp)\n\n<p class="cap">{lines[hit[0]].strip("*")}</p>'

# the box-office chart (Chapter 15), drawn from the same rows as the doc's chart
ROWS = [('My Name Is Khan', 2010, 223.44, 0), ('Ra.One', 2011, 207, 0), ('Don 2', 2011, 202.81, 0), ('Jab Tak Hai Jaan', 2012, 236, 0),
        ('Chennai Express', 2013, 423, 0), ('Happy New Year', 2014, 342, 1), ('Dilwale', 2015, 376.85, 1), ('Fan', 2016, 182, 1),
        ('Dear Zindagi', 2016, 138.91, 1), ('Raees', 2017, 272.54, 1), ('Jab Harry Met Sejal', 2017, 153.43, 1), ('Zero', 2018, 191.43, 1),
        ('Pathaan', 2023, 1050.3, 0), ('Jawan', 2023, 1148.32, 0), ('Dunki', 2023, 470.6, 0)]
def chart():
    mx = max(r[2] for r in ROWS); x0, w, y0, bh = 210, 440, 92, 24
    sx = lambda v: v / mx * w
    ce = [r for r in ROWS if r[0] == 'Chennai Express'][0][2]; lx = x0 + sx(ce)
    best = max(r[2] for r in ROWS if r[3])
    o = [f'<svg viewBox="0 0 760 500" role="img" aria-label="The apparent lull: no film of 2014 to 2018 reached Chennai Express" font-family="Archivo, sans-serif" font-size="12" style="width:100%;height:auto;background:#0f0b0b;border:1px solid #2a1c1c">',
         '<text x="20" y="30" font-size="16" fill="#f3ece6">The apparent lull: no film of 2014 to 2018 reached Chennai Express</text>',
         f'<text x="20" y="52" fill="#a99a91">Worldwide gross of his lead releases, ₹ crore. Red: the seven films of 2014 to 2018, best ₹{best} crore.</text>',
         f'<line x1="{lx:.1f}" x2="{lx:.1f}" y1="{y0 - 6}" y2="{y0 + len(ROWS) * bh}" stroke="#a99a91" stroke-dasharray="4 3"/>',
         f'<text x="{lx + 4:.1f}" y="{y0 - 12}" fill="#a99a91">Chennai Express level, ₹{ce:g} cr</text>']
    for i, (f, y, g, lull) in enumerate(ROWS):
        e = x0 + sx(g) + 6
        vx = lx + 6 if (e < lx + 4 and e + 50 > lx) else e
        o.append(f'<text x="{x0 - 8}" y="{y0 + i * bh + 16}" text-anchor="end" fill="#f3ece6">{html.escape(f)} ({y})</text>')
        o.append(f'<rect x="{x0}" y="{y0 + i * bh + 5}" width="{sx(g):.1f}" height="{bh - 9}" fill="{"#e3242b" if lull else "#5a4d48"}"><title>{html.escape(f)} ({y}): ₹{g:g} crore worldwide</title></rect>')
        o.append(f'<text x="{vx:.1f}" y="{y0 + i * bh + 16}" fill="#a99a91">{g:,}</text>')
    o.append(f'<text x="{x0}" y="{y0 + len(ROWS) * bh + 26}" fill="#a99a91">No lead release 2019 to 2022. Gross is not profit.</text></svg>')
    return '<figure class="chart">' + ''.join(o) + '<figcaption>Each film\'s Wikipedia page, October 2026; where a page gives a range, the lower figure (Ra.One: "more than ₹207 crore"). Gross is ticket sales, not profit.</figcaption></figure>'
hit = [i for i, l in enumerate(lines) if l.startswith('The curve tells the story')]
assert len(hit) == 1
lines[hit[0]] = 'CHARTMARK\n\n' + lines[hit[0]]
md = '\n'.join(lines)

# split into pages
pages, part, partintro = [], 'Front matter', {}
cur = None
for l in md.split('\n'):
    m2 = re.match(r'^## (.+)$', l); m3 = re.match(r'^### ((?:Chapter \d+|[A-H]) · .+)$', l)
    if l.startswith('# '):
        continue
    if m2:
        t = m2.group(1)
        part = t
        if t.startswith('Part '):
            cur = None; partintro[part] = []; continue
        cur = {'title': t, 'part': '', 'body': []}; pages.append(cur); continue
    if m3:
        cur = {'title': m3.group(1), 'part': part, 'body': []}; pages.append(cur); continue
    if cur is None:
        partintro.setdefault(part, []).append(l); continue
    cur['body'].append(l)
seen = set()
for p in pages:
    if p['part'] and p['part'] not in seen:
        seen.add(p['part']); p['intro'] = '\n'.join(partintro.get(p['part'], [])).strip()
    t = p['title']
    m = re.match(r'Chapter (\d+)', t)
    p['slug'] = (f'chapter-{int(m.group(1)):02d}' if m else 'addendum-' + t[0].lower() if re.match(r'[A-H] · ', t)
                 else 'front-matter' if t == 'Front matter' else 'prologue' if t.startswith('Prologue') else 'final-frame')

# relevant pictures per chapter (owner, 18 Oct 2026: "read like a book with relevant pictures"). Images already
# published in the Final Thesis (asoka-to-booda/final-thesis/img) and the site's own art; each with a caption.
FT = 'asoka-to-booda/final-thesis/img'
PICS = {
 'front-matter': [('e01', 'SRKWorld.com, 2000: the home page of the website he mapped his life into. (Archive: the author\'s collection)')],
 'prologue': [('ft-176', 'Mannat, Bandstand, Mumbai: the gate at the centre of this book. (Image: Final Thesis archive)')],
 'chapter-08': [('ft-193', 'The Kolkata Knight Riders squad, the team he bought at the first IPL auction in 2008. (Image: Final Thesis archive)')],
 'chapter-09': [('ft-191', 'My Name Is Khan (2010): the poster. (Image: Final Thesis archive)'), ('ft-207', 'The My Name Is Khan premiere at the 60th Berlin International Film Festival, February 2010. (Image: Final Thesis archive)')],
 'chapter-10': [('ft-182', 'The McDonald\'s Happy Meal launch for Ra.One, Mumbai, 2011. (Image: Final Thesis archive)'), ('ft-190', 'Unveiling the Ra.One game with UTV Indiagames, 2011. (Image: Final Thesis archive)')],
 'chapter-11': [('ft-201', 'Ra.One (2011): the superhero universe that never got its second chapter. (Image: Final Thesis archive)')],
 'chapter-12': [('ft-296', 'The first look of Chennai Express, 2013. (Image: Final Thesis archive)')],
 'chapter-13': [('ft-241', 'The Chennai Express website, from the campaign\'s social-media strategy deck. (Image: Final Thesis archive)')],
 'chapter-14': [('ft-239', 'Happy New Year (2014)'), ('ft-206', 'Dilwale (2015)'), ('ft-200', 'Fan (2016)'), ('ft-269', 'Zero (2018). (Posters: Final Thesis archive)')],
 'chapter-15': [('ft-294', 'The career-long view, as drawn in the Final Thesis: principal theatrical films, worldwide gross, Bollywood Hungama estimates. (Chart: Final Thesis)')],
 'chapter-16': [('ft-161', 'Zero (2018): the first Bollywood film with its own WhatsApp stickers. (Image: Final Thesis archive)'), ('ft-299', 'Zero: how Bauua Singh was made three feet tall with visual effects. (Image: Final Thesis archive)')],
 'chapter-18': [('ft-180', 'The Zero trailer launch, November 2018. (Image: Final Thesis archive)')],
 'chapter-19': [('ft-245', 'Fans outside Mannat: the crowd that kept the line open through the silence. (Image: Final Thesis archive)')],
 'chapter-22': [('home-04', 'Asoka to Boo-Da. (The campaign\'s art, agarmainkinghota.com)'), ('ft-123', 'Asoka at Kalinga: the conqueror who laid down his sword. (Illustration: Final Thesis archive)'), ('ft-198', 'The Lion Capital of Asoka. (Image: Final Thesis archive)')],
 'chapter-23': [('ft-145', 'Pathaan (2023)'), ('ft-140', 'The Pathaan trailer on the Burj Khalifa, Dubai, 14 January 2023. (Images: Final Thesis archive)')],
 'chapter-24': [('ft-249', 'Jawan (2023)'), ('ft-292', 'Jawan: first day, first show, September 2023. (Images: Final Thesis archive)')],
 'chapter-25': [('ft-214', 'Dunki, Drop 4 (2023)'), ('ft-104', 'The open arms in Dubai for Dunki. (Images: Final Thesis archive)')],
 'chapter-26': [('ft-270', 'His three biggest films: Jawan, Pathaan, Dunki. (Image: Final Thesis archive)')],
 'chapter-27': [('ft-172', 'A brand launch, one of more than 35 brands in about 37 years. (Image: Final Thesis archive)')],
 'chapter-28': [('ft-215', 'Shahrukhz by Danube, Sheikh Zayed Road, Dubai, December 2025. (Image: Final Thesis archive)'), ('ft-259', 'Dubai Tourism\'s “Be My Guest”. (Image: Final Thesis archive)')],
 'chapter-29': [('ft-199', 'Kolkata Knight Riders, IPL champions, 26 May 2024. (Image: Final Thesis archive)'), ('ft-133', 'The Knight Riders Cricket Ground, Los Angeles, 2026. (Image: Final Thesis archive)')],
 'chapter-30': [('ft-125', 'The M3M Hurun India Rich List 2025: a billionaire. (Image: Final Thesis archive)'), ('ft-163', 'Reported debut on Hurun\'s global list, 2026. (Image: Final Thesis archive)')],
 'chapter-31': [('ft-111', 'Opening the new Red Chillies Entertainment office. (Image: Final Thesis archive)')],
 'chapter-32': [('ft-274', 'Flam, the AI interactive-content company he invested in, September 2026. (Image: Final Thesis archive)')],
 'chapter-33': [('galleria', 'SRKWorld.com, 2000: The Galleria. The 2000 playbook. (Archive: the author\'s collection)')],
 'chapter-34': [('e01', 'SRKWorld.com, 2000: the first version of the idea. (Archive: the author\'s collection)')],
 'chapter-36': [('home-05', 'The Fan-made AI Universe. (The campaign\'s art, agarmainkinghota.com)')],
 'chapter-37': [('ft-234', 'KING: the title reveal on his 60th birthday, 2 November 2025. (Image: Final Thesis archive)'), ('ft-284', 'KING: father and daughter. (Image: Final Thesis archive)')],
 'chapter-39': [('ft-159', 'The Royal Flush. (Image: Final Thesis archive)')],
 'chapter-40': [('home-02', 'Check Mate Fire. (The campaign\'s art, agarmainkinghota.com)'), ('ft-160', 'The lighter that replaces the pawn. (Image: Final Thesis archive)')],
 'chapter-41': [('home-03', 'KING Buzz. (The campaign\'s art, agarmainkinghota.com)'), ('ft-282', 'Fans at the gate on his birthday. (Image: Final Thesis archive)')],
 'chapter-43': [('ft-169', 'The open arms. (Image: Final Thesis archive)')],
 'chapter-44': [('ft-278', 'The King on the board. (Image: Final Thesis archive)')],
 'chapter-45': [('ft-307', 'KING EXPRESS: the train the fans drive. (Image: Final Thesis archive)')],
 'chapter-46': [('home-01', 'Agar Main King Hota. (The campaign\'s art, agarmainkinghota.com)')],
 'final-frame': [('ft-301', 'Fans celebrate outside Mannat, 30 October 2021. (Image: Final Thesis archive)')],
}
from PIL import Image
for lst in PICS.values():
    for f, _ in lst:
        dst = f'{OUT}/img/{f}.webp'
        if os.path.exists(dst): continue
        if f.startswith('ft-'): shutil.copy(f'{FT}/image{f[3:]}.webp', dst)
        elif f.startswith('home-'): shutil.copy([f'assets/home/{x}' for x in os.listdir('assets/home') if x.startswith(f[5:] + '-')][0], dst)
        else: shutil.copy(f'asoka-to-booda/book/img/{f}.webp', dst)
def place(slug, body):
    lst = PICS.get(slug)
    if not lst: return body
    paras = [i for i, l in enumerate(body) if l.strip() and not l.startswith(('|', '-', '>', '!', '<')) and (i + 1 == len(body) or not body[i + 1].strip())]
    if not paras: return body
    n = len(lst); at = [paras[min(len(paras) - 1, round(k * (len(paras) - 1) / max(1, n)) )] for k in range(n)]
    for (f, cap), i in sorted(zip(lst, at), key=lambda x: -x[1]):
        body[i] = body[i] + f'\n\n![{html.escape(cap.split(".")[0])}](img/{f}.webp)\n\n<p class="cap">{html.escape(cap)}</p>'
    return body
for p in pages:
    p['body'] = place(p['slug'], p['body'])

def pandoc(text):
    h = subprocess.run(['pandoc', '-f', 'markdown-auto_identifiers-implicit_figures', '-t', 'html'], input=text, capture_output=True, text=True).stdout
    h = h.replace('<table>', '<div class="tbl"><table>').replace('</table>', '</table></div>').replace('<img ', '<img loading="lazy" ')
    h = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" target="_blank" rel="noopener"', h)
    return h.replace('<p>CHARTMARK</p>', chart())

S = open('tools/build-book-web.py').read()
HEAD = S.split("HEAD='''", 1)[1].split("'''", 1)[0].replace('href="book.css"', 'href="../book/book.css"').replace('/asoka-to-booda/book/{u}', '/asoka-to-booda/manuscript/{u}')
FOOT = S.split("FOOT='''", 1)[1].split("'''", 1)[0]
EXTRA = ('<style>.prose img{display:block;max-width:100%;max-height:560px;width:auto;height:auto;object-fit:contain;margin:1.4em auto .4em;border:1px solid var(--line)}'
         '.prose .cap{font-family:var(--body);font-size:13px;color:var(--mute);margin:0 0 1.6em;text-align:center}'
         '.prose .chart{margin:1.4em 0}.prose .chart figcaption{font-size:13px;color:var(--mute);margin-top:6px}'
         '.prose blockquote{border-left:3px solid var(--red-hi);margin:1.4em 0;padding:.2em 0 .2em 1.1em}'
         '.partintro{font-style:italic;color:var(--mute);border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:12px 0;margin:0 0 22px}</style>\n')
T = 'Asoka to Boo-Da - SRK: The Man, The Myth, The King'
def words(p): return len(re.sub(r'<[^>]+>|!\[[^\]]*\]\([^)]*\)|\(https?://[^)]*\)', ' ', '\n'.join(p['body'])).split())
for i, p in enumerate(pages):
    prev = pages[i - 1] if i else None; nxt = pages[i + 1] if i + 1 < len(pages) else None
    kick = (p['part'] or 'Asoka to Boo-Da') + f' · {i + 1} of {len(pages)}'
    o = HEAD.format(t=html.escape(f'{p["title"]} — {T}'), d=html.escape(f'{T}: {p["title"]}'), u=p['slug'] + '.html').replace('</head>', EXTRA + '</head>')
    o += f'<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Asoka to Boo-Da · Contents</a> / <span>{html.escape(p["title"].split(" · ")[0])}</span></nav>\n<article class="ch">\n'
    o += f'<header class="chhead"><p class="kick">{html.escape(kick)}</p><h1>{html.escape(p["title"])}</h1></header>\n'
    if p.get('intro'):
        o += '<div class="partintro">' + pandoc(p['intro']) + '</div>\n'
    o += '<div class="prose">' + pandoc('\n'.join(p['body'])) + '</div>\n</article>\n'
    o += '<nav class="pager" aria-label="Sections">' + (f'<a class="prev" href="{prev["slug"]}.html"><small>Previous</small><b>{html.escape(prev["title"])}</b></a>' if prev else '<span></span>')
    o += '<a class="toc" href="../">Contents</a>' + (f'<a class="next" href="{nxt["slug"]}.html"><small>Next</small><b>{html.escape(nxt["title"])}</b></a>' if nxt else '<span></span>') + '</nav>\n' + FOOT
    open(f'{OUT}/{p["slug"]}.html', 'w').write(o)

# contents: a book's table of contents. One relevant picture per Part, a numbered list of its chapters.
COVER = {'Opening': ('e01', 'SRKWorld.com, 2000'), 'Part I': ('e06', 'The Wall'), 'Part II': ('e09', 'SRKWorld press conference, 14 Nov 2000'),
         'Part III': ('ft-269', 'Zero, 2018'), 'Part IV': ('ft-245', 'Outside Mannat'), 'Part V': ('ft-140', 'Pathaan on the Burj Khalifa'),
         'Part VI': ('ft-133', 'Knight Riders Cricket Ground, LA'), 'Part VII': ('ijoo', 'Shah Rock Jaan, ijOO'), 'Part VIII': ('doom-to-king', 'DOOM to KING'),
         'Part IX': ('ft-278', 'O TO X'), 'Part X': ('e08', 'The archive'), 'The Final Frame': ('ft-301', 'Mannat, 30 Oct 2021')}
groups = []
for p in pages:
    key = p['part'] or 'Opening'
    if p['title'].startswith('The Final Frame'): key = 'The Final Frame'
    if not groups or groups[-1][0] != key: groups.append((key, []))
    groups[-1][1].append(p)
total = sum(words(p) for p in pages); nimg = len(os.listdir(f'{OUT}/img'))
SOURCES = ('<section class="toc-part"><div></div><div><h3 class="toc-h" style="font-size:20px">The source versions</h3>'
           '<p class="toc-in">This book integrates every earlier version of the thesis. They stay online exactly as written, for the record.</p><ol class="toc-list">'
           '<li><a href="../final-thesis/"><span class="n">Source</span><span class="t">The Final Thesis, word for word</span><span class="w">92 sections</span></a></li>'
           '<li><a href="../book/"><span class="n">Source</span><span class="t">SRK: The Man, The Myth, The King, first web edition</span><span class="w">38 sections</span></a></li>'
           '<li><a href="../silence/"><span class="n">Source</span><span class="t">The Silence Before the King, case study, pages 1 to 19</span><span class="w">19 pages</span></a></li>'
           '<li><a href="../drafts/"><span class="n">Source</span><span class="t">The three full drafts, word for word</span><span class="w">3 drafts</span></a></li>'
           '</ol></div></section>\n')
TOCCSS = ('<style>.toc-part{display:grid;grid-template-columns:260px 1fr;gap:26px;padding:26px 0;border-top:1px solid var(--line)}'
          '.toc-fig{margin:0}.toc-fig img{width:100%;height:170px;object-fit:cover;border:1px solid var(--line);display:block}.toc-fig figcaption{font-size:12px;color:var(--mute);margin-top:6px}'
          '.toc-h{margin:0 0 4px;font-family:var(--display);font-size:clamp(24px,2.6vw,34px);letter-spacing:.01em;text-transform:uppercase;line-height:1}'
          '.toc-h a{color:#fff;text-decoration:none}.toc-h a:hover{color:var(--red-hi)}.toc-sub{margin:0 0 6px;color:var(--red-hi);font:600 14px var(--body)}'
          '.toc-in{margin:0 0 14px;color:var(--mute);font:italic 15px/1.55 var(--serif,Georgia,serif);max-width:70ch}'
          '.toc-list{list-style:none;margin:0;padding:0}.toc-list li a{display:flex;align-items:baseline;gap:12px;padding:7px 0;color:#efe6df;text-decoration:none;border-bottom:1px dotted #3a2a2a}'
          '.toc-list li a:hover{color:#fff}.toc-list li a:hover .t{color:var(--red-hi)}.toc-list .n{flex:0 0 112px;white-space:nowrap;color:var(--red-hi);font:600 12px var(--body);letter-spacing:.12em;text-transform:uppercase}'
          '.toc-list .t{flex:1;font:16px/1.4 var(--serif,Georgia,serif)}.toc-list .w{flex:0 0 auto;color:var(--mute);font-size:12px}'
          '@media (max-width:760px){.toc-part{grid-template-columns:1fr}.toc-fig img{height:150px}}</style>\n')
idx = HEAD.format(t=html.escape(T), d='The master manuscript: every version of the Asoka to Boo-Da thesis integrated into one book, Prologue to Final Frame, with sources, images and the research record.', u='').replace('</head>', TOCCSS + '</head>')
idx += '<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Asoka to Boo-Da</a> / <span>The Master Manuscript</span></nav>\n'
idx += ('<header class="bookhead"><p class="kick">The Master Manuscript · October 2026</p><h1>Asoka to Boo-Da <em>SRK: The Man, The Myth, The King</em></h1>'
        '<div class="prose lead"><p>This King is not renouncing. He is doubling down with the Royal Flush. Every version of the thesis, integrated into one book: a Prologue, ten Parts, 46 chapters, the Academic Addendum and the Final Frame. Facts are sourced, recollection is labelled, questions are left open on purpose.</p></div>'
        f'<p class="meta">{len(pages)} sections · {total:,} words · {nimg} images · <a href="{pages[0]["slug"]}.html">Start reading →</a></p></header>\n'
        '<h2 class="toc-h" style="margin:10px 0 0">Contents</h2>\n')
for key, ps in groups:
    head, _, sub = key.partition(' · ')
    img, alt = COVER.get(head, COVER['Opening'])
    intro = re.sub(r'[*_]', '', partintro.get(key, [''])[0] if partintro.get(key) else '').strip() if key.startswith('Part') else ''
    if key.startswith('Part'):
        intro = re.sub(r'\[([^\]]+)\]\(<?[^)>]*>?\)', r'\1', re.sub(r'[*_]', '', '\n'.join(partintro.get(key, [])))).strip()
    mins = max(1, round(sum(words(p) for p in ps) / 230))
    idx += (f'<section class="toc-part"><figure class="toc-fig"><a href="{ps[0]["slug"]}.html"><img src="img/{img}.webp" alt="{html.escape(alt)}" loading="lazy"></a><figcaption>{html.escape(alt)}</figcaption></figure><div>'
            f'<h3 class="toc-h"><a href="{ps[0]["slug"]}.html">{html.escape(head)}</a></h3>' + (f'<p class="toc-sub">{html.escape(sub)}</p>' if sub else '') +
            (f'<p class="toc-in">{html.escape(intro)}</p>' if intro else '') + f'<p class="toc-sub" style="color:var(--mute);font-weight:400">{len(ps)} section{"s" if len(ps) > 1 else ""} · {mins} min</p><ol class="toc-list">')
    for p in ps:
        k, _, n = p['title'].partition(' · ')
        if not n: k, n = '', k
        idx += f'<li><a href="{p["slug"]}.html"><span class="n">{html.escape(k)}</span><span class="t">{html.escape(n)}</span><span class="w">{max(1, round(words(p) / 230))} min</span></a></li>'
    idx += '</ol></div></section>\n'
idx += SOURCES + FOOT
idx = idx.replace('href="../../assets/', 'href="../assets/').replace('src="../../assets/', 'src="../assets/')
idx = re.sub(r'(href|src)="(?!https?:|#|\.\./|/)([^"]+)"', lambda m: f'{m.group(1)}="manuscript/{m.group(2)}"', idx)
idx = idx.replace('href="manuscript/../book/book.css"', 'href="book/book.css"').replace('/asoka-to-booda/manuscript/"', '/asoka-to-booda/"')
for d in ('book/book.css', 'final-thesis/', 'book/', 'silence/', 'drafts/'):
    idx = idx.replace(f'href="../{d}"', f'href="{d}"')
idx = idx.replace('<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Asoka to Boo-Da</a> / <span>The Master Manuscript</span></nav>\n', '')
open(f'{OUT}/../index.html', 'w').write(idx)
open(f'{OUT}/index.html', 'w').write('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Asoka to Boo-Da</title><link rel="canonical" href="https://agarmainkinghota.com/asoka-to-booda/"><meta http-equiv="refresh" content="0; url=../"></head><body><a href="../">Asoka to Boo-Da: contents</a></body></html>\n')
print(len(pages), total, nimg)
