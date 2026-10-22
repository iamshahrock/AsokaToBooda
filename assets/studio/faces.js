// Agar Main King Hota — find the faces in a fan's photo, in the fan's own browser (owner, 22 Oct 2026).
// Nothing is uploaded for this step. Uses @vladmandic/face-api (MIT), self-hosted in assets/vendor/face-api.
// The small detector loads first (0.2 MB); the larger one (5.4 MB) only if the small one finds nobody.
const VENDOR = new URL('../vendor/face-api/', import.meta.url).href;
let api = null, tinyReady = null, ssdReady = null;

async function load() {
  if (!api) api = await import(VENDOR + 'face-api.esm.js');
  if (!tinyReady) tinyReady = api.nets.tinyFaceDetector.loadFromUri(VENDOR + 'model');
  await tinyReady;
  return api;
}
async function loadSsd() {
  if (!ssdReady) ssdReady = api.nets.ssdMobilenetv1.loadFromUri(VENDOR + 'model');
  await ssdReady;
}

// Returns faces as fractions of the image: [{ x, y, w, h }] sorted left to right.
export async function findFaces(img) {
  const fa = await load();
  const W = img.naturalWidth || img.width, H = img.naturalHeight || img.height;
  let found = await fa.detectAllFaces(img, new fa.TinyFaceDetectorOptions({ inputSize: 608, scoreThreshold: 0.4 }));
  if (!found.length) {
    await loadSsd();
    found = await fa.detectAllFaces(img, new fa.SsdMobilenetv1Options({ minConfidence: 0.4 }));
  }
  return found
    .map(d => ({ x: d.box.x / W, y: d.box.y / H, w: d.box.width / W, h: d.box.height / H }))
    .filter(b => b.w > 0.02 && b.h > 0.02)
    .sort((a, b) => a.x - b.x)
    .slice(0, 8);
}

// Head-and-shoulders crop around one face, as a JPEG blob (what the AI receives for that person).
export function cropFace(img, b, size = 640) {
  const W = img.naturalWidth || img.width, H = img.naturalHeight || img.height;
  const cx = (b.x + b.w / 2) * W, cy = (b.y + b.h / 2) * H, side = Math.max(b.w * W, b.h * H) * 2.4;
  const sx = Math.max(0, Math.min(W - side, cx - side / 2)), sy = Math.max(0, Math.min(H - side, cy - side * 0.45));
  const s = Math.min(side, W, H);
  const c = document.createElement('canvas'); c.width = c.height = Math.min(size, Math.round(s));
  c.getContext('2d').drawImage(img, sx, sy, s, s, 0, 0, c.width, c.height);
  return new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
}

// Small round thumbnail of just the face (for the letter chips and the poster preview).
export function faceThumb(img, b, size = 160) {
  const W = img.naturalWidth || img.width, H = img.naturalHeight || img.height;
  const side = Math.max(b.w * W, b.h * H) * 1.35;
  const cx = (b.x + b.w / 2) * W, cy = (b.y + b.h / 2) * H;
  const c = document.createElement('canvas'); c.width = c.height = size;
  c.getContext('2d').drawImage(img, cx - side / 2, cy - side / 2, side, side, 0, 0, size, size);
  return c;
}
