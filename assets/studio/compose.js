// Agar Main King Hota — poster frame compositor.
// Draws the final KING one-sheet on a canvas: artwork + crown + red lettering + the fan's line.
// The same frame is used for the free live preview (original poster, dimmed) and for the AI result,
// so every poster carries the campaign's identity even if the AI ignores part of the brief.
const ASSET = new URL('.', import.meta.url).href;              // .../assets/studio/
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const cache = new Map();

export function loadImage(src) {
  if (cache.has(src)) return cache.get(src);
  const p = new Promise((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error('Could not load ' + src));
    im.src = src;
  });
  cache.set(src, p);
  return p;
}

export async function preloadKit() {
  await Promise.all([
    loadImage(ASSET + 'crown.png'),
    ...LETTERS.split('').map(c => loadImage(ASSET + 'letters/' + c + '.png'))
  ]);
}

// Draw a word in the red KING alphabet. Returns the width used.
async function measureRed(text, h) {
  let w = 0;
  for (const ch of text.toUpperCase()) {
    if (ch === ' ') { w += h * 0.36; continue; }
    if (!LETTERS.includes(ch)) { w += h * 0.5; continue; }
    const g = await loadImage(ASSET + 'letters/' + ch + '.png');
    w += g.width * (h / g.height) + h * 0.06;
  }
  return Math.max(0, w - h * 0.06);
}
async function drawRed(ctx, text, cx, y, h, maxW) {
  let w = await measureRed(text, h);
  if (maxW && w > maxW) { h = h * maxW / w; w = maxW; }
  let x = cx - w / 2;
  for (const ch of text.toUpperCase()) {
    if (ch === ' ') { x += h * 0.36; continue; }
    if (!LETTERS.includes(ch)) {                       // punctuation: Anton fallback in KING red
      ctx.save(); ctx.fillStyle = '#d61a22'; ctx.font = `${Math.round(h)}px Anton, Impact, sans-serif`;
      ctx.textBaseline = 'top'; ctx.fillText(ch, x, y); x += h * 0.5; ctx.restore(); continue;
    }
    const g = await loadImage(ASSET + 'letters/' + ch + '.png');
    const gw = g.width * (h / g.height);
    ctx.drawImage(g, x, y, gw, h);
    x += gw + h * 0.06;
  }
  return h;
}

function cover(ctx, im, x, y, w, h) {
  const s = Math.max(w / im.width, h / im.height);
  const iw = im.width * s, ih = im.height * s;
  ctx.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

function wrap(ctx, text, maxW) {
  const words = text.split(/\s+/); const lines = []; let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

/**
 * Render the poster.
 * @param {HTMLCanvasElement} canvas  1024×1536 is used for the final file.
 * @param {object} o  { art: Image, preview: bool, name, line, film, year, character, date, logo?: Image, logoBox?: [x0,y0,x1,y1] }
 * With a logo (Photo Poster, owner 25 Oct 2026) the poster keeps its own look: the KING logo sits exactly where the
 * original title was, only a light band holds the header, and the star line goes under the logo.
 */
export async function renderPoster(canvas, o) {
  const W = canvas.width, H = canvas.height, ctx = canvas.getContext('2d');
  ctx.fillStyle = '#070505'; ctx.fillRect(0, 0, W, H);
  if (o.art) {
    ctx.save();
    if (o.preview && !o.vivid) ctx.filter = 'grayscale(0.55) brightness(0.55) contrast(1.1)';
    cover(ctx, o.art, 0, 0, W, H);
    ctx.restore();
    if (o.preview && !o.vivid) {                       // crimson wash so the preview already reads as KING
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#b3141b'; ctx.globalAlpha = 0.45;
      ctx.fillRect(0, 0, W, H); ctx.restore();
    }
  }
  const lb = o.logo && o.logoBox;
  if (lb) return renderLogoPoster(ctx, W, H, o);
  // top and bottom vignettes that hold the lettering
  let g = ctx.createLinearGradient(0, 0, 0, H * 0.24);
  g.addColorStop(0, 'rgba(7,5,5,.95)'); g.addColorStop(1, 'rgba(7,5,5,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.24);
  g = ctx.createLinearGradient(0, H * 0.62, 0, H);
  g.addColorStop(0, 'rgba(7,5,5,0)'); g.addColorStop(0.45, 'rgba(7,5,5,.88)'); g.addColorStop(1, 'rgba(7,5,5,1)');
  ctx.fillStyle = g; ctx.fillRect(0, H * 0.62, W, H * 0.38);

  // header: small crown + AGAR MAIN KING HOTA
  const crown = await loadImage(ASSET + 'crown.png');
  const ch = H * 0.07, cw = crown.width * ch / crown.height;
  ctx.drawImage(crown, W / 2 - cw / 2, H * 0.022, cw, ch);
  ctx.save(); ctx.fillStyle = '#f1e9df'; ctx.font = `600 ${Math.round(H * 0.0135)}px Archivo, Arial, sans-serif`;
  ctx.textAlign = 'center'; ctx.letterSpacing = `${Math.round(W * 0.012)}px`;
  ctx.fillText('AGAR MAIN KING HOTA', W / 2, H * 0.112);
  ctx.restore();

  // the film's King Name is the poster's title, in the red KING alphabet (owner, 22 Oct 2026);
  // long names go on two lines. The fan's name sits under it as the star.
  const title = (o.title || 'KING').trim().slice(0, 40);
  let nh;
  if (title.length > 14 && title.includes(' ')) {
    const words = title.split(' '); let best = 1, diff = 1e9;
    for (let i = 1; i < words.length; i++) { const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length); if (d < diff) { diff = d; best = i; } }
    const lh = H * 0.07;
    const h1 = await drawRed(ctx, words.slice(0, best).join(' '), W / 2, H * 0.70, lh, W * 0.86);
    const h2 = await drawRed(ctx, words.slice(best).join(' '), W / 2, H * 0.70 + h1 + H * 0.008, lh, W * 0.86);
    nh = h1 + h2 + H * 0.008 - H * 0.035;
  } else {
    nh = await drawRed(ctx, title, W / 2, H * 0.735, H * 0.085, W * 0.86);
  }
  const star = (o.name || '').trim().slice(0, 18);
  ctx.save(); ctx.fillStyle = '#f1e9df'; ctx.textAlign = 'center';
  ctx.font = `600 ${Math.round(H * 0.017)}px Archivo, Arial, sans-serif`; ctx.letterSpacing = `${Math.round(W * 0.008)}px`;
  ctx.fillText(star ? `STARRING ${star.toUpperCase()}` : 'STARRING YOU', W / 2, H * 0.735 + nh + H * 0.03);
  ctx.restore();
  nh += H * 0.032;

  // the line, in serif italic
  if (o.line) {
    ctx.save(); ctx.fillStyle = '#f4efe9'; ctx.textAlign = 'center';
    ctx.font = `italic 600 ${Math.round(H * 0.026)}px "Cormorant Garamond", Georgia, serif`;
    wrap(ctx, '“' + o.line.trim() + '”', W * 0.8).forEach((l, i) => ctx.fillText(l, W / 2, H * 0.735 + nh + H * 0.045 + i * H * 0.033));
    ctx.restore();
  }

  // credit strip
  ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = '#ff4a4f';
  ctx.font = `600 ${Math.round(H * 0.012)}px Archivo, Arial, sans-serif`; ctx.letterSpacing = `${Math.round(W * 0.006)}px`;
  // owner 22 Oct 2026: no original film name at the bottom; the King Name is the only title
  ctx.fillStyle = '#b8aca4'; ctx.letterSpacing = `${Math.round(W * 0.003)}px`;
  ctx.fillText(`PICTURE ABHI BAAKI HAI  ·  ${o.date || ''}  ·  AGARMAINKINGHOTA.COM`, W / 2, H * 0.962);
  ctx.restore();

  if (!o.preview) {                                    // AI label on every finished poster (IT Rules, Feb 2026)
    ctx.save(); const tw = W * 0.3, th = H * 0.034, tx = W * 0.03, ty = H * 0.885;
    ctx.fillStyle = 'rgba(7,5,5,.85)'; ctx.fillRect(tx, ty, tw, th);
    ctx.strokeStyle = '#c3121a'; ctx.lineWidth = Math.max(1, W * 0.002); ctx.strokeRect(tx, ty, tw, th);
    ctx.fillStyle = '#f1e9df'; ctx.textAlign = 'center'; ctx.font = `700 ${Math.round(H * 0.0125)}px Archivo, Arial, sans-serif`;
    ctx.letterSpacing = `${Math.round(W * 0.002)}px`; ctx.fillText('AI-MADE FAN POSTER', tx + tw / 2, ty + th * 0.68); ctx.restore();
  }

  if (o.preview) {                                     // corner tag so nobody mistakes the preview for the result
    ctx.save(); ctx.fillStyle = 'rgba(7,5,5,.8)'; ctx.fillRect(W - W * 0.3, H * 0.15, W * 0.27, H * 0.04);
    ctx.fillStyle = '#f1e9df'; ctx.textAlign = 'center'; ctx.font = `600 ${Math.round(H * 0.013)}px Archivo, Arial, sans-serif`;
    ctx.fillText('PREVIEW · FRAME ONLY', W - W * 0.165, H * 0.176); ctx.restore();
  }
}

// Embed provenance in a JPEG: an XMP packet (IPTC DigitalSourceType = AI-generated) and a plain comment,
// so the poster still says it is AI-made if the visible label is cropped. Returns the original blob on any error.
const XMP = '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>'
  + '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
  + '<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/"'
  + ' xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/"'
  + ' Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"'
  + ' xmp:CreatorTool="agarmainkinghota.com poster studio">'
  + '<dc:description><rdf:Alt><rdf:li xml:lang="x-default">AI-made fan poster, created at agarmainkinghota.com</rdf:li></rdf:Alt></dc:description>'
  + '</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
const COMMENT = 'AI-made fan poster, created at agarmainkinghota.com';
function segment(marker, payload) {
  const len = payload.length + 2, seg = new Uint8Array(len + 2);
  seg.set([0xFF, marker, len >> 8, len & 0xFF]); seg.set(payload, 4); return seg;
}
export async function tagJpeg(blob) {
  try {
    if (!blob) return blob;
    const b = new Uint8Array(await blob.arrayBuffer());
    if (b[0] !== 0xFF || b[1] !== 0xD8) return blob;
    let at = 2;                                                          // keep a JFIF APP0 first, if present
    if (b[2] === 0xFF && b[3] === 0xE0) at = 4 + ((b[4] << 8) | b[5]);
    const enc = new TextEncoder();
    const xmp = segment(0xE1, new Uint8Array([...enc.encode('http://ns.adobe.com/xap/1.0/'), 0, ...enc.encode(XMP)]));
    const com = segment(0xFE, enc.encode(COMMENT));
    return new Blob([b.slice(0, at), xmp, com, b.slice(at)], { type: 'image/jpeg' });
  } catch (e) { return blob; }
}

// Photo Poster frame: the poster as it is, its KING logo in the original title's place (logo and art share one framing)
async function renderLogoPoster(ctx, W, H, o) {
  const [, by0, , by1] = o.logoBox;
  let g = ctx.createLinearGradient(0, 0, 0, H * 0.15);            // light band for the header
  g.addColorStop(0, 'rgba(7,5,5,.72)'); g.addColorStop(1, 'rgba(7,5,5,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.15);

  if (by0 > 0.13) {                                                 // header, unless the logo itself is up there
    const crown = await loadImage(ASSET + 'crown.png');
    const ch = H * 0.05, cw = crown.width * ch / crown.height;
    ctx.drawImage(crown, W / 2 - cw / 2, H * 0.018, cw, ch);
    ctx.save(); ctx.fillStyle = '#f1e9df'; ctx.font = `600 ${Math.round(H * 0.012)}px Archivo, Arial, sans-serif`;
    ctx.textAlign = 'center'; ctx.letterSpacing = `${Math.round(W * 0.012)}px`;
    ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = H * 0.006;
    ctx.fillText('AGAR MAIN KING HOTA', W / 2, H * 0.085);
    ctx.restore();
  }

  cover(ctx, o.logo, 0, 0, W, H);

  // STARRING under the logo, or above it when the logo reaches the bottom
  const below = by1 * H + H * 0.035 < H * 0.915;
  const sy = below ? by1 * H + H * 0.03 : by0 * H - H * 0.015;
  const star = (o.name || '').trim().slice(0, 18);
  ctx.save(); ctx.fillStyle = '#f1e9df'; ctx.textAlign = 'center';
  ctx.font = `700 ${Math.round(H * 0.016)}px Archivo, Arial, sans-serif`; ctx.letterSpacing = `${Math.round(W * 0.008)}px`;
  ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = H * 0.008;
  ctx.fillText(star ? `STARRING ${star.toUpperCase()}` : 'STARRING YOU', W / 2, sy);
  if (o.line) {
    ctx.font = `italic 600 ${Math.round(H * 0.022)}px "Cormorant Garamond", Georgia, serif`; ctx.letterSpacing = '0px';
    const lines = wrap(ctx, '“' + o.line.trim() + '”', W * 0.8);
    lines.forEach((l, i) => ctx.fillText(l, W / 2, below ? sy + H * 0.035 + i * H * 0.028 : sy - H * 0.03 - (lines.length - 1 - i) * H * 0.028));
  }
  ctx.restore();

  // no credit strip on Photo Poster (owner, 26 Oct 2026: too small to read)

  if (!o.preview) {                                    // AI label on every finished poster (IT Rules, Feb 2026)
    ctx.save(); const tw = W * 0.3, th = H * 0.028, tx = W * 0.03, ty = H * 0.935;
    ctx.fillStyle = 'rgba(7,5,5,.85)'; ctx.fillRect(tx, ty, tw, th);
    ctx.strokeStyle = '#c3121a'; ctx.lineWidth = Math.max(1, W * 0.002); ctx.strokeRect(tx, ty, tw, th);
    ctx.fillStyle = '#f1e9df'; ctx.textAlign = 'center'; ctx.font = `700 ${Math.round(H * 0.0105)}px Archivo, Arial, sans-serif`;
    ctx.letterSpacing = `${Math.round(W * 0.002)}px`; ctx.fillText('AI-MADE FAN POSTER', tx + tw / 2, ty + th * 0.68); ctx.restore();
  }
  if (o.preview) {
    ctx.save(); ctx.fillStyle = 'rgba(7,5,5,.8)'; ctx.fillRect(W - W * 0.3, H * 0.12, W * 0.27, H * 0.032);
    ctx.fillStyle = '#f1e9df'; ctx.textAlign = 'center'; ctx.font = `600 ${Math.round(H * 0.011)}px Archivo, Arial, sans-serif`;
    ctx.fillText('PREVIEW · FRAME ONLY', W - W * 0.165, H * 0.141); ctx.restore();
  }
}
