# Builds /asoka-to-booda/final-thesis/: the owner's ASOKA_TO_BOODA_FINAL_THESIS.docx (384 pages, recovered from her
# ChatGPT library, uploaded 18 Oct 2026), published WORD FOR WORD with every image in its place.
# Owner, 18 Oct 2026: never shorten, summarise or rewrite her thesis text.
# Usage: pandoc FINAL.docx -t markdown --extract-media=media -o thesis.md   (in SRC)
#        python3 tools/build-final-thesis-web.py SRC asoka-to-booda/final-thesis
import re, sys, os, subprocess, html
from PIL import Image
SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(f'{OUT}/img', exist_ok=True)
md = open(f'{SRC}/thesis.md').read()

# images: every picture becomes a web-sized webp beside the pages, in the same place in the text
def img_sub(m):
    src = m.group(2)
    name = os.path.splitext(os.path.basename(src))[0] + '.webp'
    dst = f'{OUT}/img/{name}'
    if not os.path.exists(dst):
        im = Image.open(f'{SRC}/{src}')
        im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
        im.thumbnail((1400, 1400))
        im.save(dst, 'WEBP', quality=82)
    alt = ' '.join(m.group(1).split())
    return f'![{alt}](img/{name})'
md = re.sub(r'!\[((?:\\.|[^\]\\])*)\]\(([^)\s]+)\)(\{[^}]*\})?', img_sub, md)

def plain(h):
    return re.sub(r'\\|\*', '', h).replace('---', '—').replace('--', '–').strip()
def is_stat(t):
    return bool(re.search(r'\d', t)) and len(t) <= 24 and not re.search(r'[A-Z]{3,}', t.replace('M', ''))

# split into pages at every top-level heading that is not a headline number
pages, cur = [], {'title': 'Opening', 'body': []}
for line in md.split('\n'):
    m = re.match(r'^# (.+)$', line)
    if m:
        t = plain(m.group(1))
        if is_stat(t):
            cur['body'].append(f'<p class="bigstat">{html.escape(t)}</p>'); continue
        pages.append(cur); cur = {'title': t, 'body': []}; continue
    cur['body'].append(line)
pages.append(cur)
pages = [p for p in pages if '\n'.join(p['body']).strip() or p['title'] != 'Opening']

def pandoc(text):
    return subprocess.run(['pandoc', '-f', 'markdown-auto_identifiers', '-t', 'html'], input=text, capture_output=True, text=True).stdout

HEAD = open('tools/build-book-web.py').read().split("HEAD='''", 1)[1].split("'''", 1)[0]
FOOT = open('tools/build-book-web.py').read().split("FOOT='''", 1)[1].split("'''", 1)[0]
HEAD = HEAD.replace('href="book.css"', 'href="../book/book.css"').replace('/asoka-to-booda/book/{u}', '/asoka-to-booda/final-thesis/{u}')
T = 'Asoka to Boo-Da · The Final Thesis'
EXTRA = '<style>.prose .bigstat{font-family:var(--display);font-size:clamp(34px,4vw,54px);line-height:1;color:var(--red-hi);margin:.8em 0 .2em}.prose img{display:block;max-width:100%;height:auto;margin:1.2em auto;border:1px solid var(--line)}.prose figure{margin:1.4em 0}.prose figcaption{font-family:var(--body);font-size:13px;color:var(--mute)}</style>\n'
for i, p in enumerate(pages):
    p['slug'] = f'p{i + 1:03d}'
words_total = 0
for i, p in enumerate(pages):
    prev = pages[i - 1] if i else None; nxt = pages[i + 1] if i + 1 < len(pages) else None
    body = '\n'.join(p['body'])
    words_total += len(re.sub(r'<[^>]+>|!\[[^\]]*\]\([^)]*\)', ' ', body).split())
    o = HEAD.format(t=html.escape(f'{p["title"]} — {T}'), d=html.escape(f'{T}: {p["title"]}'), u=p['slug'] + '.html').replace('</head>', EXTRA + '</head>')
    o += f'<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Asoka to Boo-Da</a> / <a href="./">The Final Thesis</a> / <span>{i + 1} of {len(pages)}</span></nav>\n<article class="ch">\n'
    o += f'<header class="chhead"><p class="kick">The Final Thesis · section {i + 1} of {len(pages)}</p><h1>{html.escape(p["title"])}</h1></header>\n'
    o += '<div class="prose">' + pandoc(body).replace('<table>', '<div class="tbl"><table>').replace('</table>', '</table></div>').replace('<img ', '<img loading="lazy" ') + '</div>\n</article>\n'
    o += '<nav class="pager" aria-label="Sections">' + (f'<a class="prev" href="{prev["slug"]}.html"><small>Previous</small><b>{html.escape(prev["title"])}</b></a>' if prev else '<span></span>')
    o += '<a class="toc" href="./">Contents</a>' + (f'<a class="next" href="{nxt["slug"]}.html"><small>Next</small><b>{html.escape(nxt["title"])}</b></a>' if nxt else '<span></span>') + '</nav>\n' + FOOT
    open(f'{OUT}/{p["slug"]}.html', 'w').write(o)
nimg = len(os.listdir(f'{OUT}/img'))
idx = HEAD.format(t=T, d='ASOKA TO BOO-DA: the final thesis by Shailja Gupta, published in full with every image: The Silence Before the King, Asoka to Booda, From Zero to King, the Ghost of the Sage\'s Present, O TO X MY MATH and the indexes.', u='')
idx += f'<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Asoka to Boo-Da</a> / <span>The Final Thesis</span></nav>\n'
idx += f'<header class="bookhead"><p class="kick">ASOKA TO BOO-DA · by Shailja Gupta</p><h1>The <em>Final</em> Thesis</h1><div class="prose lead"><p>This King is not renouncing. He is doubling down with the Royal Flush. The complete illustrated manuscript, published in full: every section, every chart and every image, in the order of the original document.</p></div><p class="meta">{len(pages)} sections · {words_total:,} words · {nimg} images · <a href="{pages[0]["slug"]}.html">Start reading →</a></p></header>\n'
idx += '<div class="contents"><section class="grp" style="grid-column:1/-1"><h2>Contents, in the order of the manuscript</h2><ol style="columns:2 380px;column-gap:34px">'
for i, p in enumerate(pages):
    w = len(re.sub(r'<[^>]+>|!\[[^\]]*\]\([^)]*\)', ' ', '\n'.join(p['body'])).split())
    ni = len(re.findall(r'!\[', '\n'.join(p['body'])))
    idx += f'<li style="break-inside:avoid"><a href="{p["slug"]}.html"><span class="k">{i + 1:03d}</span><span class="n">{html.escape(p["title"])}</span><span class="w">{max(1, round(w / 230))} min{(" · " + str(ni) + " img") if ni else ""}</span></a></li>'
idx += '</ol></section></div>\n' + FOOT
open(f'{OUT}/index.html', 'w').write(idx)
print(len(pages), words_total, nimg)
