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

def pandoc(text):
    h = subprocess.run(['pandoc', '-f', 'markdown-auto_identifiers', '-t', 'html'], input=text, capture_output=True, text=True).stdout
    h = h.replace('<table>', '<div class="tbl"><table>').replace('</table>', '</table></div>').replace('<img ', '<img loading="lazy" ')
    h = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" target="_blank" rel="noopener"', h)
    return h.replace('<p>CHARTMARK</p>', chart())

S = open('tools/build-book-web.py').read()
HEAD = S.split("HEAD='''", 1)[1].split("'''", 1)[0].replace('href="book.css"', 'href="../book/book.css"').replace('/asoka-to-booda/book/{u}', '/asoka-to-booda/manuscript/{u}')
FOOT = S.split("FOOT='''", 1)[1].split("'''", 1)[0]
EXTRA = ('<style>.prose img{display:block;max-width:100%;height:auto;margin:1.4em auto .4em;border:1px solid var(--line)}'
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
    o += f'<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Asoka to Boo-Da</a> / <a href="./">The Master Manuscript</a> / <span>{html.escape(p["title"].split(" · ")[0])}</span></nav>\n<article class="ch">\n'
    o += f'<header class="chhead"><p class="kick">{html.escape(kick)}</p><h1>{html.escape(p["title"])}</h1></header>\n'
    if p.get('intro'):
        o += '<div class="partintro">' + pandoc(p['intro']) + '</div>\n'
    o += '<div class="prose">' + pandoc('\n'.join(p['body'])) + '</div>\n</article>\n'
    o += '<nav class="pager" aria-label="Sections">' + (f'<a class="prev" href="{prev["slug"]}.html"><small>Previous</small><b>{html.escape(prev["title"])}</b></a>' if prev else '<span></span>')
    o += '<a class="toc" href="./">Contents</a>' + (f'<a class="next" href="{nxt["slug"]}.html"><small>Next</small><b>{html.escape(nxt["title"])}</b></a>' if nxt else '<span></span>') + '</nav>\n' + FOOT
    open(f'{OUT}/{p["slug"]}.html', 'w').write(o)

# contents, grouped by Part, with a picture band per Part
COVER = {'Opening': 'e09', 'Part I': 'e06', 'Part II': 'e07', 'Part III': 'e07', 'Part IV': 'e15', 'Part V': 'e13', 'Part VI': 'e10', 'Part VII': 'ijoo',
         'Part VIII': 'doom-to-king', 'Part IX': 'gone-comic', 'Part X': 'e08'}
groups = []
for p in pages:
    key = p['part'] or 'Opening'
    if p['title'].startswith('The Final Frame'): key = 'The Final Frame'
    if not groups or groups[-1][0] != key: groups.append((key, []))
    groups[-1][1].append(p)
total = sum(words(p) for p in pages); nimg = len(os.listdir(f'{OUT}/img'))
idx = HEAD.format(t=html.escape(T), d='The master manuscript: every version of the Asoka to Boo-Da thesis integrated into one book, Prologue to Final Frame, with sources, images and the research record.', u='')
idx += '<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Asoka to Boo-Da</a> / <span>The Master Manuscript</span></nav>\n'
idx += ('<header class="bookhead"><p class="kick">The Master Manuscript · October 2026</p><h1>Asoka to Boo-Da <em>SRK: The Man, The Myth, The King</em></h1>'
        '<div class="prose lead"><p>This King is not renouncing. He is doubling down with the Royal Flush. Every version of the thesis, integrated into one book: a Prologue, ten Parts, 46 chapters, the Academic Addendum and the Final Frame. Facts are sourced, recollection is labelled, questions are left open on purpose.</p></div>'
        f'<p class="meta">{len(pages)} sections · {total:,} words · {nimg} images · <a href="{pages[0]["slug"]}.html">Start reading →</a></p></header>\n<div class="parts">\n')
for key, ps in groups:
    head, _, sub = key.partition(' · ')
    img = COVER.get(head, 'e02')
    mins = max(1, round(sum(words(p) for p in ps) / 230))
    idx += (f'<section class="part"><a class="part-band" href="{ps[0]["slug"]}.html"><img src="img/{img}.webp" alt="" loading="lazy"><span class="part-tx">'
            f'<span class="part-k">{len(ps)} section{"s" if len(ps) > 1 else ""} · {mins} min</span><b>{html.escape(head)}</b><i>{html.escape(sub)}</i><span class="part-go">Start this part →</span></span></a><div class="cards">')
    for p in ps:
        k, _, n = p['title'].partition(' · ')
        fi = re.search(r'img/([a-z0-9-]+)\.webp', '\n'.join(p['body']))
        ci = fi.group(1) if fi else img
        idx += (f'<a class="card" href="{p["slug"]}.html"><span class="ci"><img src="img/{ci}.webp" alt="" loading="lazy"></span><span class="ct">'
                f'<span class="k">{html.escape(k)}</span><span class="n">{html.escape(n or k)}</span><span class="w">{max(1, round(words(p) / 230))} min read</span></span></a>')
    idx += '</div></section>\n'
idx += '</div>\n' + FOOT
open(f'{OUT}/index.html', 'w').write(idx)
print(len(pages), total, nimg)
