#!/usr/bin/env python3
"""SRK DAILY share pages for WhatsApp / LinkedIn / X link previews (owner, 4 Nov 2026: 'I want to send this
out daily on whatsapp ... the source shows up as a thumbnail').

Link previews are read from <meta property="og:..."> in the page's HTML; the crawlers do not run
JavaScript, so /srk-daily/?p=<id> always shows the general SRK Daily card. This writes one small
static page per post, srk-daily/s/<id>/index.html, with that issue's title, deck and picture, which
forwards readers to the story. Share https://agarmainkinghota.com/srk-daily/s/<id>/

  python3 tools/srk-daily-share.py      # (re)writes a page for every post in data/srk-daily.json
"""
import json, html, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://agarmainkinghota.com'
CARD = SITE + '/assets/srk-daily-share.jpg'


def e(s):
    return html.escape(str(s or ''), quote=True)


def page(p):
    story = f'{SITE}/srk-daily/?p={p["id"]}'
    share = f'{SITE}/srk-daily/s/{p["id"]}/'
    img = p.get('img') or CARD
    if not img.startswith('http'):
        img = SITE + img
    title = f'SRK DAILY · {p["title"]}'
    desc = p.get('deck') or 'The news about the King, every day. Real numbers, read by hand.'
    return f'''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="noindex">
<link rel="canonical" href="{e(story)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="SRK DAILY · Agar Main King Hota">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{e(share)}">
<meta property="og:image" content="{e(img)}">
<meta property="og:image:alt" content="{e(p.get('img_alt') or title)}">
<meta property="article:published_time" content="{e(p['date'])}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(title)}">
<meta name="twitter:description" content="{e(desc)}">
<meta name="twitter:image" content="{e(img)}">
<link rel="icon" href="/favicon.ico" sizes="any">
<meta http-equiv="refresh" content="0; url={e(story)}">
</head>
<body style="background:#fbf8f1;font:16px Georgia,serif;padding:24px">
<p><a href="{e(story)}">{e(title)} →</a></p>
<script>location.replace({json.dumps(story)});</script>
</body></html>
'''


if __name__ == '__main__':
    D = json.load(open(os.path.join(ROOT, 'data', 'srk-daily.json')))
    for p in D['posts']:
        out = os.path.join(ROOT, 'srk-daily', 's', p['id'], 'index.html')
        os.makedirs(os.path.dirname(out), exist_ok=True)
        open(out, 'w').write(page(p))
        print(f'{SITE}/srk-daily/s/{p["id"]}/')
