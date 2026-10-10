// Agar Main King Hota — poster prompt. Shared by the studio page and the end-to-end test.
// Image order sent to the Worker: fan photo(s) first, then the film's original poster (not for KING), then the KING crown.
// Wording note (tested 10 Oct 2026): neutral "design a new poster starring the person in the first photo" passes the
// image model's safety review; wording about replacing or removing an actor's face was rejected.
export const LOOKS = {
  cinematic: 'hyper-real cinematic photography, dramatic rim light, fine film grain',
  retro: 'hand-painted 1990s Bollywood billboard, bold brush strokes, saturated colour',
  popart: 'bold pop-art screen print, halftone dots, thick graphic outlines',
  noir: 'black-and-white film noir with crimson accents, hard shadows',
  anime: 'premium anime key-visual style, clean cel shading',
  cyberpunk: 'neon cyberpunk night, rain, electric blue and crimson light',
  shahrock: 'playful 3D pop-cartoon style with big expressive eyes and a soft studio render'
};
export const ROLES = {
  king: 'the lead hero, centre frame, owning the poster',
  rival: 'the rival, intense and dangerous',
  sidekick: 'the loyal sidekick, playful and full of charm'
};
export function buildPrompt({ film, year, character, role = 'king', look = 'cinematic', squad = 1, world = '', hasFilmRef = true }) {
  const who = squad > 1 ? `the ${squad} people in the first ${squad} photos, together as the cast,` : 'the person in the first photo';
  const ref = hasFilmRef
    ? `The next image is a vintage film poster of "${film}" (${year}), used only as a reference for its era, composition and colour mood.`
    : `The film is KING (2026), a dark, stylish action thriller.`;
  const crown = 'The last image is a painted red crown: it floats just above the lead\'s head.';
  return [
    `Design a brand-new, original theatrical movie poster starring ${who} as ${ROLES[role] || ROLES.king}${character ? `, playing the role of ${character}` : ''}.`,
    ref,
    crown,
    world ? `Setting: ${world}.` : '',
    `Any other people in the scene are newly invented characters.`,
    `Palette: deep black and crimson with one electric-blue rim light.`,
    `Style: ${LOOKS[look] || LOOKS.cinematic}.`,
    `Leave the top 15% and the bottom 25% as clean dark space. Portrait 2:3, no text, no letters, no logos, no watermark.`
  ].filter(Boolean).join(' ');
}
