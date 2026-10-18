# Builds /asoka-to-booda/silence/: "The Silence Before the King", the owner's case study (Parts I-III, pages 1-19),
# from the text of her ChatGPT chat "Asoka to Booda Rewrite". The text is kept word for word: only citation
# markers and chat chrome are dropped; tables are rebuilt; one web page per thesis page.
# Usage: python3 tools/build-silence-web.py /tmp/claude-0/silence asoka-to-booda/silence
import re, sys, os, subprocess, html, json
SRC, OUT = sys.argv[1], sys.argv[2]
def pandoc(md):
    return subprocess.run(['pandoc','-f','markdown-auto_identifiers-smart','-t','html'],input=md,capture_output=True,text=True).stdout
pages=[]
for n,part in (('1','Part I · Ra.One to KING: 15 years of waves'),('2','Part II · The first digital empire starts with…'),('3','Part III · Years of apparent lull')):
    raw=open(f'{SRC}/raw{n}.md').read()
    raw=re.sub(r'(?m)^(?:4|5)\n\n(?=Core original|14\.1|16\.1)','',raw)        # citation markers
    raw=re.sub(r'(?m)^Red Chillies Entertainment\n\n','',raw)
    raw=re.sub(r"(?m)^PAGE 8 — Chennai Express \(2013\): The Integrated Digital Marketing Campaign\n\n4\n\n","PAGE 8 — Chennai Express (2013): The Integrated Digital Marketing Campaign\n\n",raw)
    raw=raw.replace("18\n\nBrand associations\n\nAssociations reported in the campaign case study.","18\n\nBrand associations\n\nAssociations reported in the campaign case study. [Note: Persistent Systems' release of 18 Sept 2014 gives 30 associated brands; both figures are shown.]")
    chunks=re.split(r'(?m)^(?=PAGE \d+ — )',raw)
    lead=chunks[0]
    for c in chunks[1:]:
        title,body=c.split('\n',1)
        m=re.match(r'PAGE (\d+) — (.*)',title); num=int(m.group(1)); name=m.group(2).strip()
        pages.append({'num':num,'name':name,'part':part,'lead':lead if not any(p['part']==part for p in pages) else '','body':body})
def fmt(md):
    out=[]
    for p in md.strip().split('\n\n'):
        s=p.strip()
        if not s: continue
        if s.startswith('|'): out.append(s); continue
        if re.match(r'^\d{1,2}\.\d{1,2} ',s): out.append('### '+s); continue
        if re.match(r'^(PART [IVX]+ — |THE SILENCE BEFORE THE KING$)',s): out.append('**'+s+'**'); continue
        one=('\n' not in s) and len(s)<80 and not re.search(r'[.?!:”"]$',s)
        out.append(('**'+s+'**') if one else s)
    return '\n\n'.join(out)
os.makedirs(OUT,exist_ok=True)
HEAD=open('tools/build-book-web.py').read().split("HEAD='''",1)[1].split("'''",1)[0]
FOOT=open('tools/build-book-web.py').read().split("FOOT='''",1)[1].split("'''",1)[0]
HEAD=HEAD.replace('href="book.css"','href="../book/book.css"').replace('/asoka-to-booda/book/{u}','/asoka-to-booda/silence/{u}')
T='The Silence Before the King'
def slug(p): return f'page-{p["num"]:02d}'
for i,p in enumerate(pages):
    prev=pages[i-1] if i else None; nxt=pages[i+1] if i+1<len(pages) else None
    o=HEAD.format(t=html.escape(f'Page {p["num"]} · {p["name"]} — {T}'),d=html.escape(f'{T}, page {p["num"]}: {p["name"]}'),u=slug(p)+'.html')
    o+=f'<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Asoka to Boo-Da</a> / <a href="./">{T}</a> / <span>{html.escape(p["part"])}</span></nav>\n<article class="ch">\n'
    if p['lead']: o+='<section class="partintro">'+pandoc(fmt(p['lead']))+'</section>\n'
    o+=f'<header class="chhead"><p class="kick">{html.escape(p["part"])} · Page {p["num"]}</p><h1>{html.escape(p["name"])}</h1></header>\n'
    o+='<div class="prose">'+pandoc(fmt(p['body'])).replace('<table>','<div class="tbl"><table>').replace('</table>','</table></div>')+'</div>\n</article>\n'
    o+='<nav class="pager" aria-label="Pages">'+(f'<a class="prev" href="{slug(prev)}.html"><small>Previous</small><b>Page {prev["num"]} · {html.escape(prev["name"])}</b></a>' if prev else '<span></span>')
    o+='<a class="toc" href="./">Contents</a>'+(f'<a class="next" href="{slug(nxt)}.html"><small>Next</small><b>Page {nxt["num"]} · {html.escape(nxt["name"])}</b></a>' if nxt else '<span></span>')+'</nav>\n'+FOOT
    open(f'{OUT}/{slug(p)}.html','w').write(o)
idx=HEAD.format(t=T,d=f'{T}: a cinematic industry case study, 2011 to 2026, by Shailja Gupta. Parts I to III, pages 1 to 19.',u='')
idx+=f'<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Asoka to Boo-Da</a> / <span>{T}</span></nav>\n'
idx+=f'<header class="bookhead"><p class="kick">A cinematic industry case study · 2011 to 2026 · by Shailja Gupta</p><h1>The Silence <em>Before</em> the King</h1><div class="prose lead"><p>The Shah Rukh Khan digital marketing and brand evolution story. From Ra.One\'s digital revolution to KING\'s next frontier: fifteen years of innovation, disruption, reinvention and the evolving relationship between cinema, technology, brands and audiences.</p></div><p class="meta">Parts I to III · pages 1 to 19 of the 66-page index · <a href="{slug(pages[0])}.html">Start reading →</a></p></header>\n<div class="contents">\n'
for part in dict.fromkeys(p['part'] for p in pages):
    ps=[p for p in pages if p['part']==part]
    idx+=f'<section class="grp"><h2>{html.escape(part)} · pages {ps[0]["num"]}–{ps[-1]["num"]}</h2><ol>'+''.join(f'<li><a href="{slug(p)}.html"><span class="k">Page {p["num"]}</span><span class="n">{html.escape(p["name"])}</span><span class="w">{max(1,round(len(p["body"].split())/230))} min</span></a></li>' for p in ps)+'</ol></section>\n'
idx+='</div>\n'+FOOT
open(f'{OUT}/index.html','w').write(idx)
print(len(pages), sum(len(p['body'].split())+len(p['lead'].split()) for p in pages))
