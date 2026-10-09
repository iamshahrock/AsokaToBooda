// Agar Main King Hota — poster prompt. Shared by the studio page and the end-to-end test.
// Images are sent in this order: [0] fan photo(s), then the original film poster, then the KING crown.
export const LOOKS = {
  cinematic: 'hyper-real cinematic photography, dramatic rim light, film grain',
  retro: 'hand-painted 1990s Bollywood billboard style, bold brush strokes, saturated colour',
  popart: 'bold pop-art screen print, halftone dots, thick outlines',
  noir: 'black-and-white film noir with a single crimson accent, hard shadows',
  anime: 'premium anime key-visual style, clean cel shading',
  cyberpunk: 'neon cyberpunk night, rain, electric blue and crimson light',
  shahrock: 'Shah Rock Jaan 3D pop-cartoon style: big expressive eyes, soft studio render'
};
export const ROLES = {
  king: 'the lead hero, centre frame, owning the poster',
  rival: 'the rival / anti-hero, intense and dangerous',
  sidekick: 'the loyal sidekick, playful and full of charm'
};
export function buildPrompt({ film, year, character, role = 'king', look = 'cinematic', squad = 1, world = '' }) {
  const who = squad > 1
    ? `the ${squad} people in the first ${squad} reference photos, together as the cast`
    : 'the person in the first reference photo';
  return [
    `Create a brand-new, original movie poster for the fan campaign "Agar Main King Hota".`,
    `Reimagine the attached original poster of "${film}" (${year}) — keep its era, composition idea and mood — but cast ${who} as ${character ? `"${character}", ` : ''}${ROLES[role] || ROLES.king}.`,
    `Every face on the poster must come only from the fan reference photo(s); do not reproduce the face of any actor from the original poster. Keep the fan's likeness, skin tone and features recognisable.`,
    world ? `Setting: ${world}.` : '',
    `Visual language of KING: deep black and crimson red palette with one electric-blue rim light; a red dripping painted crown (use the crown reference image) floats just above the lead's head.`,
    `Style: ${LOOKS[look] || LOOKS.cinematic}.`,
    `Leave the top 15% and the bottom 22% of the image as dark, clean space with no text, logos or letters anywhere — the title is added later.`,
    `Portrait 2:3, premium theatrical one-sheet quality, no watermarks, no credits block.`
  ].filter(Boolean).join(' ');
}
