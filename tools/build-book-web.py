import re, os, subprocess, html, json, math, sys
from PIL import Image
SRC='/tmp/claude-0/book2/book.md'; OUT=sys.argv[1]  # repo/asoka-to-booda/book
SRKW='/tmp/claude-0/-home-claude-asokatobooda/8d19a465-2825-5168-97c9-accfc658ee6a/scratchpad/srkw/srkworld-2000-%s.jpg'
EMB='/tmp/claude-0/book2/media/e%02d.jpg'
md=open(SRC).read()
md=re.sub(r'Inquilab(?!a)','Inquilaab',md); md=re.sub(r'INQUILAB(?!A)','INQUILAAB',md)
md=md.replace('#FreeTheFace','#FreeMyFace').replace('FreeTheFace','FreeMyFace')
os.makedirs(OUT+'/img',exist_ok=True)
GAL={'The Galleria':'galleria','Stardome':'stardome','Johny Lever in Stardome':'johny-lever','Anil Kapoor in Stardome':'anil-kapoor','Juhi Chawla':'juhi-chawla','Right Here Right Now':'right-here-right-now','College Daze':'college-daze','The Third Eye':'third-eye','Stark Exchange':'stark-exchange','Karma Cola':'karma-cola','Celebrations':'celebrations','Travel Bug':'travel-bug','Filmi Style':'filmi-style','Wishful Thinking':'wishful-thinking','Mithai Mail':'mithai-mail'}
emb=[0]
def img(m):
    label=m.group(1)
    g=None
    for k,v in GAL.items():
        if label=='SRKWorld.com, 2000: '+k: g=v
    if g: src=SRKW%g; name=g
    else: src=EMB%emb[0]; name='e%02d'%emb[0]; emb[0]+=1
    dst=f'{OUT}/img/{name}.webp'
    if not os.path.exists(dst):
        im=Image.open(src).convert('RGB'); im.thumbnail((1200,1200)); im.save(dst,'WEBP',quality=80)
    w,h=Image.open(dst).size
    return f'<figure class="pic"><img src="img/{name}.webp" alt="{html.escape(label)}" width="{w}" height="{h}" loading="lazy"></figure>'
md=re.sub(r'&#91;image: ([^\\\]]*)\\\]',img,md)
# split
lines=md.split('\n')
title=lines[0].lstrip('# ').strip()
chunks=[];cur=None;front=[]
for l in lines[1:]:
    m=re.match(r'^(#{2,3}) (.*)$',l)
    if m:
        cur={'lvl':len(m.group(1)),'title':m.group(2).strip(),'body':[]};chunks.append(cur)
    elif cur: cur['body'].append(l)
    else: front.append(l)
def slug(t):
    t=t.split(' · ')
    base=t[0]
    if base.startswith('Chapter'): s='chapter-%02d-'%int(re.findall(r'\d+',base)[0])+re.sub(r'[^a-z0-9]+','-',t[1].lower()).strip('-')
    elif base.startswith('Room'): s='room-'+re.sub(r'[^a-z0-9]+','-',t[1].lower()).strip('-')
    elif base.startswith('Appendix'): s='appendix-'+base.split()[1].lower()
    else: s=re.sub(r'[^a-z0-9]+','-',base.lower()).strip('-')
    return s
pages=[];parts=[];curpart=None
for c in chunks:
    body='\n'.join(c['body']).strip()
    if c['lvl']==2 and c['title'].startswith('Part '):
        curpart={'title':c['title'],'intro':body,'pages':[]};parts.append(curpart);continue
    if c['lvl']==2 and not c['title'].startswith('Part '):
        if c['title'].startswith(('Epilogue','Appendix','Sources')): curpart=None
        if c['title'] in ('The Blueprint','How to read this thesis','The arc in one page') or c['title'].startswith('Prologue'): curpart=None
    p={'title':c['title'],'slug':slug(c['title']),'md':body,'part':curpart['title'] if curpart else None,'partintro':None}
    if curpart and not curpart['pages']: p['partintro']=curpart['intro']
    if curpart: curpart['pages'].append(p)
    pages.append(p)
def conv(m):
    r=subprocess.run(['pandoc','-f','markdown-smart+pipe_tables','-t','html5','--wrap=none'],input=m,capture_output=True,text=True)
    h=r.stdout
    h=re.sub(r'<em>\(([^<)]{3,140})\)</em>',r'<span class="voice">\1</span>',h)
    h=re.sub(r'<strong>\[(Unverified[^<]*)\]</strong>',r'<strong class="unv">[\1]</strong>',h)
    h=re.sub(r'<p><figure','<figure',h); h=re.sub(r'</figure></p>','</figure>',h)
    h=h.replace('<table>','<div class="tbl"><table>').replace('</table>','</table></div>')
    h=re.sub(r'<a href="(https?://[^"]+)"',r'<a href="\1" target="_blank" rel="noopener"',h)
    return h
def words(t): return len(re.findall(r'[A-Za-z0-9]+',re.sub(r'<[^>]+>|\(https?://[^)]+\)','',t)))
HEAD='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{t}</title>
<meta name="description" content="{d}">
<meta name="theme-color" content="#0a0707">
<link rel="canonical" href="https://agarmainkinghota.com/asoka-to-booda/book/{u}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/crown-32.png">
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../assets/site.css">
<link rel="stylesheet" href="../../assets/v2.css">
<link rel="stylesheet" href="book.css">
</head>
<body class="v2 book">
<script src="../../assets/header.js"></script>
<main class="wrap">
'''
FOOT='''</main>
<script src="../../assets/starks.js"></script>
<script src="../../assets/footer.js" defer></script>
</body>
</html>
'''
BT='SRK: The Man, The Myth, The King'
for i,p in enumerate(pages):
    prev=pages[i-1] if i else None; nxt=pages[i+1] if i+1<len(pages) else None
    w=words(p['md']); mins=max(1,round(w/230))
    t=p['title'].split(' · ')
    kicker=t[0] if len(t)>1 else (p['part'].split(' · ')[0] if p['part'] else 'The book')
    name=' · '.join(t[1:]) if len(t)>1 else t[0]
    out=HEAD.format(t=html.escape(f'{name} — {BT}'),d=html.escape(f'{p["title"]}. From the book {BT}.'),u=p['slug']+'.html')
    out+=f'<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Asoka to Boo-Da</a> / <a href="./">The book</a>'+(f' / <span>{html.escape(p["part"].split(" · ")[0]+" · "+p["part"].split(" · ")[1])}</span>' if p['part'] else '')+'</nav>\n'
    out+='<article class="ch">\n'
    if p['partintro']:
        out+=f'<section class="partintro"><p class="kick">{html.escape(p["part"])}</p>{conv(p["partintro"])}</section>\n'
    out+=f'<header class="chhead"><p class="kick">{html.escape(kicker)}</p><h1>{html.escape(name)}</h1><p class="meta">{w:,} words · about {mins} min read</p></header>\n'
    out+='<div class="prose">'+conv(p['md'])+'</div>\n</article>\n'
    out+='<nav class="pager" aria-label="Chapters">'
    out+=(f'<a class="prev" href="{prev["slug"]}.html"><small>Previous</small><b>{html.escape(prev["title"])}</b></a>' if prev else '<span></span>')
    out+='<a class="toc" href="./">Contents</a>'
    out+=(f'<a class="next" href="{nxt["slug"]}.html"><small>Next</small><b>{html.escape(nxt["title"])}</b></a>' if nxt else '<span></span>')
    out+='</nav>\n'+FOOT
    open(f'{OUT}/{p["slug"]}.html','w').write(out)
# index
intro=conv('\n'.join(l for l in front if not re.match(r'^[A-Z][a-z]{2} \d{1,2}, \d{4} ·',l)).strip())
total=sum(words(p['md']) for p in pages)
def li(p):
    t=p['title'].split(' · ');w=words(p['md'])
    return f'<li><a href="{p["slug"]}.html"><span class="k">{html.escape(t[0])}</span><span class="n">{html.escape(" · ".join(t[1:]) if len(t)>1 else "")}</span><span class="w">{max(1,round(w/230))} min</span></a></li>'
idx=HEAD.format(t=html.escape(BT),d=html.escape(f'{BT}: the thesis on Shah Rukh Khan by Shailja Gupta, chapter by chapter.'),u='')
idx+='<nav class="crumbs" aria-label="Breadcrumb"><a href="../">Asoka to Boo-Da</a> / <span>The book</span></nav>\n'
# the print edition: a PDF export of the manuscript, saved beside the pages (count its pages for the contents line)
_pdf=os.path.join(OUT,'srk-the-man-the-myth-the-king.pdf')
pdf_pages, pdf_link = '', ''
try:
    import pypdf
    if _pdf and os.path.exists(_pdf):
        n=len(pypdf.PdfReader(_pdf).pages); pdf_pages=f'{n} pages in print (A4)'
        pdf_link=f' · <a href="srk-the-man-the-myth-the-king.pdf" download>Download the PDF ({os.path.getsize(_pdf)/1e6:.1f} MB)</a>'
except Exception as e:
    print('pdf skipped', e)
idx+=f'<header class="bookhead"><p class="kick">The thesis · by Shailja Gupta</p><h1>SRK: The Man, <em>The Myth</em>, The King</h1><div class="prose lead">{intro}</div><p class="meta">{pdf_pages + " · " if pdf_pages else ""}{len(pages)} sections · {total:,} words · <a href="{pages[0]["slug"]}.html">Start reading →</a>{pdf_link}</p></header>\n<div class="parts">\n'
# designed contents: one picture band per Part, then a card for every chapter
COVER={'_front':'img/e00.webp','Part One':'img/e06.webp','Part Two':'img/e13.webp','Part Three':'../../assets/home/04-asoka-to-booda.webp',
       'Part Four':'../../assets/home/03-king-buzz.webp','Part Five':'../../assets/dk/bg.webp','Part Six':'../../assets/home/crown.webp','_back':'img/galleria.webp'}
def first_img(p):
    m=re.search(r'src="(img/[^"]+)"',open(f'{OUT}/{p["slug"]}.html').read()); return m.group(1) if m else None
groups=[]
for p in pages:
    key=p['part'] or ('_front' if pages.index(p)<4 else '_back')
    if not groups or groups[-1][0]!=key: groups.append((key,[]))
    groups[-1][1].append(p)
for key,ps in groups:
    if key=='_front': h,sub='Opening','The map, the method and the prologue'
    elif key=='_back': h,sub='Closing','Epilogue, appendices and sources'
    else:
        bits=key.split(' · '); h=' · '.join(bits[:2]); sub=' · '.join(bits[2:])
    cov=COVER.get(key) or COVER.get(key.split(' · ')[0],'img/e00.webp')
    intro_txt=''
    for q in ps:
        if q.get('partintro'):
            t=re.sub(r'[*_\[\]()]','',re.sub(r'\(https?://[^)]+\)','',q['partintro'])).strip(); sents=re.split(r'(?<=[.!?])\s+',t); acc=''
            for x in sents:
                acc=(acc+' '+x).strip()
                if len(acc)>=60: break
            intro_txt=acc if len(acc)<=220 else acc[:217].rsplit(' ',1)[0]+'…'; break
    mins=sum(max(1,round(words(q['md'])/230)) for q in ps)
    idx+=f'<section class="part"><a class="part-band" href="{ps[0]["slug"]}.html"><img src="{cov}" alt="" loading="lazy"><span class="part-tx"><span class="part-k">{len(ps)} sections · {mins} min</span><b>{html.escape(h)}</b>'+(f'<i>{html.escape(sub)}</i>' if sub else '')+(f'<span class="part-in">{html.escape(intro_txt)}</span>' if intro_txt else '')+'<span class="part-go">Start this part →</span></span></a><div class="cards">'
    for q in ps:
        t=q['title'].split(' · ');im=first_img(q) or cov
        idx+=f'<a class="card" href="{q["slug"]}.html"><span class="ci"><img src="{im}" alt="" loading="lazy"></span><span class="ct"><span class="k">{html.escape(t[0])}</span><span class="n">{html.escape(" · ".join(t[1:]) if len(t)>1 else t[0])}</span><span class="w">{max(1,round(words(q["md"])/230))} min read</span></span></a>'
    idx+='</div></section>\n'
idx+='</div>\n'+FOOT
open(f'{OUT}/index.html','w').write(idx)
json.dump([{'slug':p['slug'],'title':p['title'],'part':p['part']} for p in pages],open(f'{OUT}/contents.json','w'),indent=1)
print(len(pages),total)
