// End-to-end test of the live poster Worker. Run in CI (the Worker host is not reachable from every sandbox).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildPrompt } from '../assets/studio/prompt.js';
const url = process.env.WORKER_URL || 'https://asokatobooda.iamshahrock.workers.dev';
const file = async (p, type) => new Blob([await readFile(p)], { type });
const form = new FormData();
form.append('prompt', buildPrompt({ film: 'Dilwale Dulhania Le Jayenge', year: 1995, character: 'Raj Malhotra', look: 'retro' }));
form.append('image', await file('assets/studio/shahrock-dreaming.jpg', 'image/jpeg'), 'fan.jpg');
form.append('image', await file('assets/posters/ref/21.jpg', 'image/jpeg'), 'film.jpg');
form.append('image', await file('assets/studio/crown.png', 'image/png'), 'crown.png');
const t0 = Date.now();
const res = await fetch(url, { method: 'POST', body: form, headers: { Origin: 'https://agarmainkinghota.com' } });
const body = await res.json().catch(() => ({}));
console.log('HTTP', res.status, 'in', ((Date.now() - t0) / 1000).toFixed(1), 's', body.error || '');
await mkdir('e2e-out', { recursive: true });
if (body.image) { await writeFile('e2e-out/poster.png', Buffer.from(body.image, 'base64')); console.log('saved e2e-out/poster.png'); }
await writeFile('e2e-out/result.json', JSON.stringify({ status: res.status, error: body.error || null, seconds: (Date.now() - t0) / 1000 }, null, 1));
if (!body.image) process.exit(1);
