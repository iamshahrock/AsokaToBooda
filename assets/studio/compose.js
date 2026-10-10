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
 * @param {object} o  { art: Image, preview: bool, name, line, film, year, character, date }
 */
export async function renderPoster(canvas, o) {
  const W = canvas.width, H = canvas.height, ctx = canvas.getContext('2d');
  ctx.fillStyle = '#070505'; ctx.fillRect(0, 0, W, H);
  if (o.art) {
    ctx.save();
    if (o.preview) ctx.filter = 'grayscale(0.55) brightness(0.55) contrast(1.1)';
    cover(ctx, o.art, 0, 0, W, H);
    ctx.restore();
    if (o.preview) {                                   // crimson wash so the preview already reads as KING
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#b3141b'; ctx.globalAlpha = 0.45;
      ctx.fillRect(0, 0, W, H); ctx.restore();
    }
  }
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

  // the fan's name in the red KING alphabet
  const name = (o.name || 'YOUR NAME').trim().slice(0, 18);
  const nh = await drawRed(ctx, name, W / 2, H * 0.735, H * 0.085, W * 0.86);

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
  const as = o.character ? `AS ${o.character.toUpperCase()}` : '';
  ctx.fillText([as, o.film ? `IN ${o.film.toUpperCase()} (${o.year})` : ''].filter(Boolean).join('  ·  '), W / 2, H * 0.935);
  ctx.fillStyle = '#b8aca4';
  ctx.fillText(`PICTURE ABHI BAAKI HAI  ·  ${o.date || ''}  ·  AGARMAINKINGHOTA.COM`, W / 2, H * 0.962);
  ctx.restore();

  if (o.preview) {                                     // corner tag so nobody mistakes the preview for the result
    ctx.save(); ctx.fillStyle = 'rgba(7,5,5,.8)'; ctx.fillRect(W - W * 0.3, H * 0.15, W * 0.27, H * 0.04);
    ctx.fillStyle = '#f1e9df'; ctx.textAlign = 'center'; ctx.font = `600 ${Math.round(H * 0.013)}px Archivo, Arial, sans-serif`;
    ctx.fillText('PREVIEW · FRAME ONLY', W - W * 0.165, H * 0.176); ctx.restore();
  }
}
