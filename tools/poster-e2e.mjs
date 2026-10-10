// End-to-end test of the live poster Worker with several prompt/image variants (diagnoses safety rejections).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const url = process.env.WORKER_URL || 'https://asokatobooda.iamshahrock.workers.dev';
const blob = async (p, type) => new Blob([await readFile(p)], { type });
await mkdir('e2e-out', { recursive: true });
// blurred copy of the film poster (faces unrecognisable, layout + colour kept)
const neutral = (extra='') => `Design a brand-new original theatrical movie poster starring the person in the first photo as the hero. The second image is only a reference for the era, composition and colour mood of a 1995 Bollywood romance. ${extra} Palette: deep black and crimson with one electric-blue rim light. Style: hand-painted 1990s Bollywood billboard, bold brush strokes. Leave the top 15% and bottom 22% as clean dark space with no text. Portrait 2:3, no text, no logos, no watermark.`;
const variants = [
  { id: 'A-original-neutral', film: 'assets/posters/ref/21.jpg', crown: true, prompt: neutral('A painted red crown (third image) floats above the hero\'s head.') },
  { id: 'B-blurred-neutral', film: 'tools/e2e-film-blur.jpg', crown: true, prompt: neutral('A painted red crown (third image) floats above the hero\'s head.') },
  { id: 'C-original-nocrown', film: 'assets/posters/ref/21.jpg', crown: false, prompt: neutral('') },
];
const out = [];
for (const v of variants) {
  const form = new FormData();
  form.append('prompt', v.prompt);
  form.append('image', await blob('assets/studio/shahrock-dreaming.jpg', 'image/jpeg'), 'fan.jpg');
  form.append('image', await blob(v.film, 'image/jpeg'), 'film.jpg');
  if (v.crown) form.append('image', await blob('assets/studio/crown.png', 'image/png'), 'crown.png');
  const t0 = Date.now();
  const res = await fetch(url, { method: 'POST', body: form, headers: { Origin: 'https://agarmainkinghota.com' } });
  const body = await res.json().catch(() => ({}));
  const r = { id: v.id, status: res.status, seconds: (Date.now() - t0) / 1000, error: body.error || null };
  if (body.image) await writeFile(`e2e-out/${v.id}.png`, Buffer.from(body.image, 'base64'));
  console.log(JSON.stringify(r)); console.log(`::notice title=${v.id}::${JSON.stringify(r).slice(0,600)}`); out.push(r);
  await new Promise(r => setTimeout(r, 25000));
}
await writeFile('e2e-out/result.json', JSON.stringify(out, null, 1));
if (!out.some(r => r.status === 200)) process.exit(1);
