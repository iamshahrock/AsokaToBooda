# Builds /asoka-to-booda/drafts/: the owner's three full thesis drafts from her ChatGPT chat "Math Game Scoring
# Rules" (archived 9 Oct 2026), published WORD FOR WORD (owner, 18 Oct 2026: never shorten or rewrite her thesis).
# Only the chat prompts around each draft are left out; tables are rebuilt; one note marks the 18 vs 30 brands figure.
# Usage: python3 tools/build-drafts-web.py /tmp/claude-0/drafts asoka-to-booda/drafts
import re, sys, os, subprocess, html
SRC, OUT = sys.argv[1], sys.argv[2]
NOTE18 = ' [Note: Persistent Systems\' release of 18 Sept 2014 gives 30 associated brands; both figures are shown.]'
def pandoc(md):
    return subprocess.run(['pandoc', '-f', 'markdown-auto_identifiers-smart', '-t', 'html'], input=md, capture_output=True, text=True).stdout
def fmt(lines):
    out, tbl = [], []
    def flush():
        if tbl:
            n = max(len(r) for r in tbl)
            rows = [r + [''] * (n - len(r)) for r in tbl]
            out.append('| ' + ' | '.join(c.strip().replace('|', '/') for c in rows[0]) + ' |\n|' + ' --- |' * n + '\n' +
                       '\n'.join('| ' + ' | '.join(c.strip().replace('|', '/') for c in r) + ' |' for r in rows[1:]))
            tbl.clear()
    for l in lines:
        if '\t' in l:
            tbl.append(l.split('\t')); continue
        flush()
        s = l.strip()
        if not s: continue
        s = s.replace('18 brand associations.', '18 brand associations.' + NOTE18) if '18 brand associations' in s and 'Note:' not in s else s
        if re.fullmatch(r'\d{2}', s): out.append('**' + s + '**'); continue
        one = len(s) < 90 and not re.search(r'[.?!:”"…)]$', s)
        out.append('**' + s.replace('*', '') + '**' if one else s)
    flush()
    return '\n\n'.join(out)
DOCS = [
    ('a', 'the-silence-before-the-king-long-form', 'The Silence Before the King', 'A long-form investigative and cultural thesis · September 2026',
     r'^(PROLOGUE|PART [IVX]+ —|EPILOGUE)'),
    ('b', 'asoka-to-booda-be-da-boo-da', 'Asoka to Booda · Be Da Boo-Da', 'A digital-culture thesis · the making, unmaking and possible reinvention of the King',
     r'^(PROLOGUE|CHAPTER \d+ —|EPILOGUE)'),
    ('b2', 'asoka-to-booda-all-in', 'Asoka to Booda · This time, the King is going ALL IN', 'The revised chapter and the Royal Flush',
     r'^(THE ROYAL FLUSH)$'),
    ('c', 'from-zero-to-king', 'From Zero to King', 'Official first draft · a strategic research paper · September 2026',
     r'^(Chapter \d+\. )'),
]
HEAD = open('tools/build-book-web.py').read().split("HEAD='''", 1)[1].split("'''", 1)[0]
FOOT = open('tools/build-book-web.py').read().split("FOOT='''", 1)[1].split("'''", 1)[0]
HEAD = HEAD.replace('href="book.css"', 'href="../book/book.css"').replace('/asoka-to-booda/book/{u}', '/asoka-to-booda/drafts/{u}')
os.makedirs(OUT, exist_ok=True)
summary = []
for key, slug, title, sub, rx in DOCS:
    lines = open(f'{SRC}/{key}.txt').read().split('\n')
    secs, cur, part = [], {'name': 'Opening', 'part': '', 'lines': []}, ''
    for l in lines:
        s = l.strip()
        if re.match(r'^PART [IVX]+ — ', s) and key == 'c':
            part = s; continue
        if re.match(rx, s):
            secs.append(cur); cur = {'name': s, 'part': part, 'lines': []}; continue
        cur['lines'].append(l)
    secs.append(cur)
    secs = [x for x in secs if any(t.strip() for t in x['lines']) or x['name'] != 'Opening']
    for i, x in enumerate(secs):
        x['slug'] = f'{slug}-{i:02d}'
    for i, x in enumerate(secs):
        prev = secs[i - 1] if i else None; nxt = secs[i + 1] if i + 1 < len(secs) else None
        o = HEAD.format(t=html.escape(f'{x["name"]} — {title}'), d=html.escape(f'{title}: {x["name"]}'), u=x['slug'] + '.html')
        o += f'<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Asoka to Boo-Da</a> / <a href="./">The drafts</a> / <span>{html.escape(title)}</span></nav>\n<article class="ch">\n'
        o += f'<header class="chhead"><p class="kick">{html.escape(title)}{(" · " + html.escape(x["part"])) if x["part"] else ""}</p><h1>{html.escape(x["name"])}</h1></header>\n'
        o += '<div class="prose">' + pandoc(fmt(x['lines'])).replace('<table>', '<div class="tbl"><table>').replace('</table>', '</table></div>') + '</div>\n</article>\n'
        o += '<nav class="pager" aria-label="Sections">' + (f'<a class="prev" href="{prev["slug"]}.html"><small>Previous</small><b>{html.escape(prev["name"])}</b></a>' if prev else '<span></span>')
        o += '<a class="toc" href="./">Contents</a>' + (f'<a class="next" href="{nxt["slug"]}.html"><small>Next</small><b>{html.escape(nxt["name"])}</b></a>' if nxt else '<span></span>') + '</nav>\n' + FOOT
        open(f'{OUT}/{x["slug"]}.html', 'w').write(o)
    summary.append((title, sub, secs))
T = 'The drafts'
idx = HEAD.format(t='The drafts — Asoka to Boo-Da', d='The full thesis drafts by Shailja Gupta, word for word: The Silence Before the King, Asoka to Booda, and From Zero to King.', u='')
idx += f'<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Asoka to Boo-Da</a> / <span>{T}</span></nav>\n'
total = sum(len(' '.join(' '.join(x['lines']) for x in secs).split()) for _, _, secs in summary)
idx += f'<header class="bookhead"><p class="kick">The thesis drafts · by Shailja Gupta</p><h1>The <em>drafts</em></h1><div class="prose lead"><p>The three full drafts of the thesis, published word for word: the long-form The Silence Before the King, the satirical Asoka to Booda with its revised All In chapter and the Royal Flush, and the official first draft, From Zero to King.</p></div><p class="meta">{len(summary)} documents · {total:,} words</p></header>\n<div class="contents">\n'
for title, sub, secs in summary:
    idx += f'<section class="grp"><h2>{html.escape(title)}</h2><p class="meta" style="margin:0 0 8px">{html.escape(sub)}</p><ol>' + ''.join(
        f'<li><a href="{x["slug"]}.html"><span class="k">{i:02d}</span><span class="n">{html.escape(x["name"])}</span><span class="w">{max(1, round(len(" ".join(x["lines"]).split()) / 230))} min</span></a></li>'
        for i, x in enumerate(secs)) + '</ol></section>\n'
idx += '</div>\n' + FOOT
open(f'{OUT}/index.html', 'w').write(idx)
print(len(summary), total, sum(len(s) for _, _, s in summary))
