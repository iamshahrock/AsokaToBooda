"""SRK DAILY story PDF with page breaks that never cut a line or a picture, and 'x / N' bottom right.
1) Print the story as ONE tall A4-wide sheet:
   Chrome --headless=new --no-pdf-header-footer --window-size=794,1123 --virtual-time-budget=15000 \
     --print-to-pdf=tall.pdf "https://agarmainkinghota.com/srk-daily/?p=<id>&pdf=1&tall=1"
2) python3 tools/srk-daily-story-pdf.py tall.pdf out.pdf   (needs pymupdf + numpy)
The sheet is cut into A4 pages between paragraphs, stanzas or pictures (never mid-paragraph unless one is longer than a page), never between a picture and its caption or right after a heading."""
import sys, numpy as np, pymupdf as fitz
src = fitz.open(sys.argv[1]); sp = src[0]
W = sp.rect.width; PT = 72 / 25.4
A4H = 297 * PT; TOP = 12 * PT; BOT = 16 * PT
DPI = 60; sc = DPI / 72
pix = sp.get_pixmap(dpi=DPI, colorspace=fitz.csGRAY)
a = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width)
paper = np.median(a[:, :5])
x0, x1 = int(pix.width * .06), int(pix.width * .94)
blank = (np.abs(a[:, x0:x1].astype(int) - paper) < 10).all(axis=1)   # row is empty paper
ok = blank.copy()
def forbid(y0, y1):
    ok[max(0, int(y0 * sc)):min(len(ok), int(y1 * sc) + 1)] = False
for im in sp.get_image_info():                       # never between a picture and its caption
    r = im['bbox']; forbid(r[1], r[3] + 9 * PT)
for b in sp.get_text('dict')['blocks']:              # never right after a section heading
    for l in b.get('lines', []):
        t = ''.join(x['text'] for x in l['spans']).strip()
        if 2 < len(t) < 40 and t.isupper() and l['bbox'][1] > 60 * PT:
            forbid(l['bbox'][1] - 3 * PT, l['bbox'][3] + 30 * PT)
        if t.endswith(':'):                          # a lead-in line stays with what it introduces
            forbid(l['bbox'][3], l['bbox'][3] + 20 * PT)
para = np.zeros_like(blank)                           # rows inside a gap of 4.5 mm or more = between paragraphs, stanzas, pictures
r = 0
while r < len(blank):
    if blank[r]:
        k = r
        while k < len(blank) and blank[k]: k += 1
        if (k - r) / sc >= 4.5 * PT: para[r:k] = True
        r = k
    else: r += 1
forced = sorted((r[1] - 1, r[3] + 1) for r in sp.search_for('PAGEBREAK'))   # editor's page breaks ({"pb": 1} blocks)
rows = np.nonzero(~blank)[0]; last = rows[-1] / sc + 6 * PT            # end of content
cuts = []; s = 0.0; first = True
while s < last:
    room = (A4H - BOT) if first else (A4H - TOP - BOT)
    e = s + room
    fz = [y for y in forced if s + 2 * PT < y[0] <= e]
    if fz:                                                                 # editor's break inside this page: cut there
        y0, y1 = fz[0]; cuts.append((s, y0)); k = int(y1 * sc) + 1
        while k < len(blank) - 1 and blank[k]: k += 1
        s = max(y1, k / sc - 2 * PT); first = False; continue
    if e >= last: cuts.append((s, last)); break
    lo, hi = int((s + room * .55) * sc), int(e * sc)
    lo2 = int((s + room * .3) * sc)
    cand = ([r for r in range(hi, lo, -1) if ok[r] and para[r]] or [r for r in range(hi, lo2, -1) if ok[r] and para[r]]
            or [r for r in range(hi, lo, -1) if ok[r]] or [r for r in range(hi, lo, -1) if blank[r]])
    r = cand[0] if cand else hi
    cuts.append((s, r / sc))
    k = r
    while k < len(blank) - 1 and blank[k]: k += 1                         # next page starts at the next ink
    s = max(r / sc, k / sc - 2 * PT); first = False
out = fitz.open(); N = len(cuts)
col = tuple(c / 255 for c in sp.get_pixmap(clip=fitz.Rect(1, 1, 3, 3)).pixel(0, 0)[:3])
for i, (s, e) in enumerate(cuts):
    pg = out.new_page(width=W, height=A4H)
    pg.draw_rect(pg.rect, color=None, fill=col)
    y = 0 if i == 0 else TOP
    pg.show_pdf_page(fitz.Rect(0, y, W, y + (e - s)), src, 0, clip=fitz.Rect(0, s, W, e))
    t = f"{i + 1} / {N}"
    pg.insert_text((W - 14 * PT - fitz.get_text_length(t, 'helv', 9), A4H - 8 * PT), t, fontname='helv', fontsize=9, color=(0.62, 0.11, 0.13))
out.save(sys.argv[2], deflate=True, garbage=3)
print(N, 'pages')
