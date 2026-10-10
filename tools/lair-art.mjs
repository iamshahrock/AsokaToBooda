// Generates the King's Lairs story art (one image per chapter) through the live poster Worker.
// Run by .github/workflows/lair-art.yml; images land in lair-art-out/.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const URL_ = 'https://asokatobooda.iamshahrock.workers.dev';
const base = 'Design an original cinematic still for a dark, stylish action-thriller film called KING. Show NO text, NO letters, NO logos, NO watermark and NO real or recognisable person: the lone hero is a tall figure in a sharp black suit, seen from behind or in deep silhouette, face never visible. The attached image is only a colour reference for the red-and-black palette; do not include it. Moody red and black colour grade, deep shadows, anamorphic highlights, light film grain, premium movie-poster quality, vertical 2:3 composition. Scene: ';
const scenes = {
  cover: 'a rain-soaked rooftop above a city of red neon at night; the silhouetted hero holds up a single playing card, the King of Hearts, catching the light.',
  casino: 'a grand private casino at midnight, green baize poker table under a low lamp, stacks of chips, cigar smoke, crystal chandeliers; a dealer slides a King of Hearts across the table toward the silhouetted hero.',
  dome: 'a futuristic glass dome fortress on a snowy Himalayan peak at night, searchlights sweeping the snow; the hero crouches on an ice ridge below the beams, breath visible in the cold air.',
  city: 'a secret underground city beneath Mumbai, red neon signs reflected in rain puddles, towering shelves of old film reels and archive boxes glowing; the hero walks down the central aisle.',
  pit: 'an underground fighting pit carved in rock, a ring of fire torches, a shadowed crowd above; the hero stands in the ring wrapping his knuckles, a huge brute waiting across the sand.',
  den: 'a flooded underwater lair lit by red emergency lights, a colossal octopus silhouette coiled in the dark water; the hero swims toward a golden crown glinting on the sea floor.',
  throne: 'a vast empty throne room, a blood-red throne under a single spotlight, a shattered chandelier on black marble, five playing cards of a royal flush scattered on the floor; the hero walks toward the throne.'
};
await mkdir('lair-art-out', { recursive: true });
const ref = await readFile('assets/studio/crown.png');
const log = [];
const only = (process.env.ONLY || '').split(',').map(x => x.trim()).filter(Boolean);
for (const [id, scene] of Object.entries(scenes)) {
  if (only.length && !only.includes(id)) continue;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const form = new FormData();
    form.append('prompt', base + scene);
    form.append('image', new Blob([ref], { type: 'image/png' }), 'palette.png');
    const t = Date.now();
    const r = await fetch(URL_, { method: 'POST', body: form, headers: { Origin: 'https://agarmainkinghota.com' } });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.image) { await writeFile(`lair-art-out/${id}.png`, Buffer.from(j.image, 'base64')); log.push(`${id}: OK ${((Date.now() - t) / 1000).toFixed(1)}s`); break; }
    log.push(`${id}: attempt ${attempt} failed ${r.status} ${j.error || ''}`);
    await new Promise(res => setTimeout(res, 25000));
  }
  await new Promise(res => setTimeout(res, 21000)); // stay under the 3-per-minute burst limit
}
await writeFile('lair-art-out/log.txt', log.join('\n') + '\n');
console.log(log.join('\n'));
