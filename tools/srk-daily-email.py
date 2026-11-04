#!/usr/bin/env python3
"""SRK DAILY as an email newsletter (owner, 4 Nov 2026: 'an HTML, which i can paste inside an email ...
email daily newsletter type format').

Builds srk-daily/email/<date>.html from the same data as the site:
  data/srk-daily.json (posts, beat, poll, fanverse, highlights), data/king-intelligence-daily.json
  (KING BUZZ of the day) and data/king-studies.json (Today at KING University).
Email-safe: one 600 px table, inline styles, web-safe fonts, absolute image and link URLs.
To send: open the page on the site, select all, copy, paste into the email.

  python3 tools/srk-daily-email.py            # today (IST)
  python3 tools/srk-daily-email.py 2026-11-04
"""
import json, sys, html, datetime, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://agarmainkinghota.com'
KING = datetime.date(2026, 12, 24)
START = datetime.date(2026, 11, 4)          # day 0 of the daily rotation (same as the page)

PAPER, INK, RED, BLUE, MAROON, MUTED, RULE = '#fbf8f1', '#1d1a17', '#c8102e', '#22409a', '#8a1c2b', '#6b6258', '#c9bfae'
SERIF = "Georgia,'Times New Roman',serif"
SANS = "Arial,Helvetica,sans-serif"


def load(p):
    with open(os.path.join(ROOT, p)) as f:
        return json.load(f)


def e(s):
    return html.escape(str(s or ''), quote=True)


def url(u):
    return u if u.startswith('http') else SITE + (u if u.startswith('/') else '/srk-daily/' + u)


def fmt_date(d):
    return d.strftime('%-d %B %Y')


def bar(label):
    return (f'<tr><td style="padding:18px 24px 6px"><span style="display:inline-block;background:{BLUE};color:#fff;'
            f'font:bold 12px {SANS};letter-spacing:2px;text-transform:uppercase;padding:5px 10px">{e(label)}</span></td></tr>')


def button(text, href, color=RED):
    return (f'<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:{color}">'
            f'<a href="{e(href)}" style="display:inline-block;padding:11px 18px;font:bold 13px {SANS};letter-spacing:1px;'
            f'color:#ffffff;text-decoration:none;text-transform:uppercase">{e(text)} &rarr;</a></td></tr></table>')


def build(day):
    D = load('data/srk-daily.json')
    L = load('data/king-intelligence-daily.json')
    K = load('data/king-studies.json')
    n = max(0, (day - START).days)
    posts = sorted(D['posts'], key=lambda p: (p['date'], -p.get('n', 9)), reverse=True)
    todays = [p for p in posts if p['date'] == day.isoformat()] or posts[:1]
    todays.sort(key=lambda p: p.get('n', 9))
    rows = []

    # masthead
    rows.append(f'<tr><td style="padding:22px 24px 8px"><a href="{SITE}/srk-daily/" style="text-decoration:none"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
                f'<td width="84" valign="middle"><img src="{SITE}/assets/fan-emblem.png" width="76" height="76" alt="Shah Rock Jaan" style="display:block;border:0"></td>'
                f'<td valign="middle" align="center"><img src="{SITE}/assets/srk-daily-masthead.png" width="440" alt="SRK Daily" style="display:block;width:100%;max-width:440px;height:auto;border:0"></td>'
                f'</tr></table></a><div style="text-align:center;font:italic 15px {SERIF};color:{INK};padding-top:8px">The news about the King, every day. Real numbers, read by hand.</div></td></tr>')
    rows.append(f'<tr><td style="padding:4px 24px 10px;border-bottom:3px double {RED}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
                f'<td style="font:bold 15px {SERIF};color:{INK}">{fmt_date(day)}</td>'
                f'<td align="right" style="font:bold 12px {SANS};letter-spacing:1px;color:{RED}">{(KING - day).days} DAYS TO KING</td></tr></table></td></tr>')

    # the day's stories
    for i, p in enumerate(todays):
        first = next((b['p'] for b in p['blocks'] if b.get('p')), '')
        rows.append(f'<tr><td style="padding:20px 24px 4px"><div style="font:bold 12px {SANS};letter-spacing:2px;color:{RED};text-transform:uppercase">{e(p["kicker"])}</div>'
                    f'<h1 style="margin:6px 0 8px;font:bold {"28" if i == 0 else "22"}px/1.2 {SERIF};color:{INK}">{e(p["title"])}</h1>'
                    f'<p style="margin:0 0 12px;font:italic 17px/1.5 {SERIF};color:#3d3630">{e(p.get("deck"))}</p></td></tr>')
        if i == 0 and p.get('img'):
            rows.append(f'<tr><td style="padding:0 24px"><a href="{SITE}/srk-daily/?p={e(p["id"])}"><img src="{e(p["img"])}" width="552" alt="{e(p.get("img_alt"))}" '
                        f'style="display:block;width:100%;max-width:552px;height:auto;border:1px solid {RULE}"></a>'
                        f'<div style="font:italic 12px {SERIF};color:{MUTED};padding-top:4px">{e(p.get("img_credit"))}</div></td></tr>')
        stats = next((b['stats'] for b in p['blocks'] if b.get('stats')), None)
        if stats:
            cells = ''.join(f'<td width="33%" valign="top" style="padding:4px"><div style="border:1px solid {RULE};background:#fff;padding:8px">'
                            f'<div style="font:bold 10px {SANS};letter-spacing:1px;color:{MUTED};text-transform:uppercase">{e(s[0])}</div>'
                            f'<div style="font:bold 19px {SERIF};color:{INK};padding:2px 0">{e(s[1])}</div>'
                            f'<div style="font:11px {SANS};color:{MUTED}">{e(s[2])}</div></div></td>' for s in stats[:3])
            rows.append(f'<tr><td style="padding:10px 20px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>{cells}</tr></table></td></tr>')
        rows.append(f'<tr><td style="padding:12px 24px 6px;font:16px/1.65 {SERIF};color:{INK}">{e(first)}</td></tr>')
        rows.append(f'<tr><td style="padding:6px 24px 16px;border-bottom:1px solid {RULE}">{button("Read the full story", SITE + "/srk-daily/?p=" + p["id"])}</td></tr>')

    # KING BUZZ of the day (previous IST day's ledger record)
    R = L['records']
    before = [r for r in R if r['date'] < day.isoformat()]
    rec = before[-1] if before else R[-1]
    names = {'king_title_reveal_views': 'KING · Title Reveal', 'king_date_announcement_views': 'KING · Date Announcement',
             'king_tu_mil_jaaye_views': 'Tu Mil Jaaye', 'doomsday_official_trailer_views': 'Avengers: Doomsday · trailer'}
    val = lambda r, sid: next((m['value'] for m in r['metrics'] if m['series_id'] == sid and m.get('value') is not None), None)
    vals = [(names[s], val(rec, s), s.startswith('doomsday')) for s in names if val(rec, s) is not None]
    if vals:
        top = max(v for _, v, _ in vals)
        rd = datetime.date.fromisoformat(rec['date'])
        rows.append(bar('KING BUZZ of the day · ' + fmt_date(rd)))
        for name, v, d in vals:
            w = max(2, round(v / top * 100))
            rows.append(f'<tr><td style="padding:4px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
                        f'<td style="font:bold 13px {SANS};color:{INK}">{e(name)}</td><td align="right" style="font:bold 14px {SANS};color:{INK}">{v:,}</td></tr>'
                        f'<tr><td colspan="2" style="padding-top:3px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
                        f'<td width="{w}%" style="background:{BLUE if d else RED};height:10px;font-size:0;line-height:0">&nbsp;</td>'
                        f'<td style="background:#efe9de;height:10px;font-size:0;line-height:0">&nbsp;</td></tr></table></td></tr></table></td></tr>')
        topics = ''.join(f'<li style="margin:0 0 6px">{e(t)}</li>' for t in (rec.get('topics') or [])[:3])
        rows.append(f'<tr><td style="padding:8px 24px 4px"><ul style="margin:0;padding-left:18px;font:14px/1.55 {SERIF};color:{INK}">{topics}</ul></td></tr>')
        rows.append(f'<tr><td style="padding:8px 24px 16px;border-bottom:1px solid {RULE}">{button("Click for full details", SITE + "/king-intelligence/daily.html?date=" + rec["date"], BLUE)}</td></tr>')

    # From the site today
    H = D.get('highlights') or []
    if H:
        h = H[n % len(H)]
        rows.append(bar('From the site today'))
        rows.append(f'<tr><td style="padding:6px 24px 16px;border-bottom:1px solid {RULE}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
                    f'<td width="120" valign="top"><a href="{e(url(h["url"]))}"><img src="{e(url(h["img"]))}" width="110" alt="" style="display:block;width:110px;height:auto;border:1px solid {RULE}"></a></td>'
                    f'<td valign="top" style="padding-left:12px"><div style="font:bold 19px/1.25 {SERIF};color:{INK}">{e(h["t"])}</div>'
                    f'<p style="margin:6px 0 10px;font:14px/1.55 {SERIF};color:{INK}">{e(h["d"])}</p>{button(h.get("cta") or "Open", url(h["url"]))}</td></tr></table></td></tr>')

    # Today at KING University
    units = [(Lv, x, i) for Lv in K['levels'] for i, x in enumerate(Lv['lessons'])]
    if units:
        Lv, x, i = units[(n * 7) % len(units)]
        note = (x.get('notes') or [x.get('line', '')])[0]
        rows.append(bar('Today at KING University'))
        rows.append(f'<tr><td style="padding:6px 24px 16px;border-bottom:1px solid {RULE}"><div style="font:bold 11px {SANS};letter-spacing:1px;color:{RED};text-transform:uppercase">'
                    f'{e(Lv.get("code"))} · {e(Lv["name"])} · Unit {i + 1}</div>'
                    f'<div style="font:bold 20px/1.25 {SERIF};color:{INK};margin:4px 0">Learn: {e(x["t"])}</div>'
                    f'<div style="font:italic 13px {SERIF};color:{MUTED};margin:0 0 8px">{e(x["by"])} · {e(x["film"])}{" · " + str(x["y"]) if x.get("y") else ""}</div>'
                    f'<p style="margin:0 0 10px;font:15px/1.6 {SERIF};color:{INK}">{e(note)}</p>'
                    f'{button("Study this unit", SITE + "/king-studies/?level=" + Lv["id"] + "#lesson-" + Lv["id"] + "-" + str(i + 1), BLUE)}</td></tr>')

    # FANVERSE song + Poll Station
    fv, poll = D.get('fanverse'), D.get('poll')
    cells = []
    if fv:
        cells.append(f'<td width="50%" valign="top" style="padding:0 8px 0 0"><div style="font:bold 11px {SANS};letter-spacing:1px;color:{RED};text-transform:uppercase">FANVERSE · the fans\' song</div>'
                     f'<div style="font:bold 17px/1.25 {SERIF};color:{MAROON};margin:4px 0 6px">{e(fv["title"])}</div>'
                     f'<p style="margin:0 0 10px;font:13px/1.5 {SERIF};color:{INK}">{e(fv["line"])}</p>{button("Listen", url(fv["url"]) + "#anthem")}</td>')
    if poll:
        opts = ''.join(f'<div style="font:13px {SANS};color:#1f2f6a;padding:3px 0">&#9675; {e(o)}</div>' for o in poll['o'])
        cells.append(f'<td width="50%" valign="top" style="padding:0 0 0 8px"><div style="background:#d6e3f7;border:1px solid #9fb5dc;padding:10px">'
                     f'<div style="font:bold 11px {SANS};letter-spacing:1px;color:{MAROON};text-transform:uppercase">Poll Station</div>'
                     f'<div style="font:bold 14px {SANS};color:#1f2f6a;margin:4px 0 6px">{e(poll["q"])}</div>{opts}'
                     f'<div style="padding-top:8px">{button("Vote on the site", SITE + "/srk-daily/", BLUE)}</div></div></td>')
    if cells:
        rows.append(f'<tr><td style="padding:18px 24px;border-bottom:1px solid {RULE}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>{"".join(cells)}</tr></table></td></tr>')

    # The Beat
    beat = D.get('beat') or []
    if beat:
        rows.append(bar('The Beat'))
        for b in beat[:5]:
            rows.append(f'<tr><td style="padding:6px 24px"><a href="{e(url(b["url"]))}" style="text-decoration:none"><span style="font:bold 16px {SERIF};color:{MAROON}">{e(b["t"])}</span></a>'
                        f'<div style="font:13px/1.5 {SERIF};color:{MUTED}">{e(b["d"])}</div></td></tr>')

    # footer
    rows.append(f'<tr><td style="padding:22px 24px 26px" align="center"><div style="border:2px solid {RED};padding:12px;font:bold 13px {SANS};color:{RED}">'
                f'SRK DAILY · every day at <a href="{SITE}/srk-daily/" style="color:{RED}">AGARMAINKINGHOTA.COM/SRK-DAILY</a></div>'
                f'<p style="margin:12px 0 0;font:12px/1.5 {SANS};color:{MUTED}">Agar Main King Hota · the fans\' KING world. Real numbers, read by hand, or N/A.<br>'
                f'You get this because you subscribed to SRK DAILY. To stop, reply with "unsubscribe".</p></td></tr>')

    title = 'SRK DAILY · ' + fmt_date(day) + ' · ' + todays[0]['title']
    return (f'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<meta name="robots" content="noindex"><title>{e(title)}</title></head>'
            f'<body style="margin:0;padding:0;background:#e9e4d8">'
            f'<div style="display:none;max-height:0;overflow:hidden">{e(todays[0].get("deck"))}</div>'
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e9e4d8"><tr><td align="center" style="padding:16px 8px">'
            f'<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:{PAPER};border:1px solid {RULE}">'
            + ''.join(rows) +
            '</table></td></tr></table></body></html>')


if __name__ == '__main__':
    if len(sys.argv) > 1:
        day = datetime.date.fromisoformat(sys.argv[1])
    else:
        day = (datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)).date()
    out = os.path.join(ROOT, 'srk-daily', 'email', day.isoformat() + '.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w') as f:
        f.write(build(day))
    print(out)
