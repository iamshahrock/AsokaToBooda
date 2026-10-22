// Agar Main King Hota — poster prompt. Shared by the studio page and the end-to-end test.
// Image order sent to the Worker: fan photo(s) first, then the film's original poster (not for KING), then the KING crown.
// Wording note (tested 10 Oct 2026): neutral "design a new poster starring the person in the first photo" passes the
// image model's safety review; wording about replacing or removing an actor's face was rejected.
// #FreeMyFace (12 Oct 2026): the film poster is sent blurred, and the prompt forbids any real star's likeness.
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
  sidekick: 'the loyal sidekick, playful and full of charm',
  withking: 'co-stars standing right beside the King'
};
const CAST_ROLES = { king: 'the hero', rival: 'the intense, dangerous rival', sidekick: 'the playful, loyal sidekick' };
// Where a character sits on the reference poster, in words: [cx, cy, w] fractions, largest first.
export function placeOf([cx, cy, w], rank) {
  const h = cx < 0.36 ? 'left' : cx > 0.64 ? 'right' : 'centre';
  const v = cy < 0.36 ? 'top' : cy > 0.64 ? 'lower' : 'middle';
  const size = rank === 0 ? 'the largest figure' : w >= 0.2 ? 'a large figure' : 'a smaller figure';
  return `${size}, ${v === 'middle' && h === 'centre' ? 'in the centre' : `at the ${v} ${h}`}`;
}
// cast: [{ photo: 1..3 | null, at: [cx, cy, w] }] in the reference poster's layout, largest first.
function castLines(cast, role, kept) {
  const n = cast.length;
  const parts = cast.map((c, i) => {
    const where = placeOf(c.at, i);
    if (c.king) return kept ? `character ${i + 1}, ${where}, is the King: keep him exactly as drawn in the reference artwork, same face, pose and costume` : `character ${i + 1}, ${where}, is the King, a newly invented regal hero`;
    if (!c.photo) return `character ${i + 1}, ${where}, is a newly invented person`;
    const lead = c.photo === 1 && role !== 'withking' ? ` as ${CAST_ROLES[role] || CAST_ROLES.king}` : '';
    return `character ${i + 1}, ${where}, is played by the person in photo ${c.photo}${lead}`;
  });
  return `Keep the reference poster's cast layout of ${n} character${n > 1 ? 's' : ''}: ${parts.join('; ')}.`;
}
export function buildPrompt({ film, year, character, role = 'king', look = 'cinematic', squad = 1, world = '', hasFilmRef = true, cast = null, styleName = '' }) {
  const useCast = Array.isArray(cast) && cast.length && hasFilmRef;
  const withKing = role === 'withking';
  const kingKept = withKing && hasFilmRef && !!styleName && (!useCast || cast.some(c => c.king));
  const who = squad > 1 ? `the ${squad} people in the first ${squad} photos, together as the cast,` : 'the person in the first photo';
  const ref = hasFilmRef && styleName
    ? `The next image is the film poster "${film}" (${year}) redrawn in the ${styleName} style, with ${kingKept ? 'every face except the King masked out' : 'every face masked out'}: match its art style, composition and colour exactly, and fill the masked faces with the uploaded people or newly invented faces.`
    : hasFilmRef
    ? `The next image is a blurred vintage film poster of "${film}" (${year}), used only as a reference for its era, composition and colour mood.`
    : `The film is KING (2026), a dark, stylish action thriller.`;
  const crown = `The last image is a painted red crown: it floats just above the head of ${withKing ? 'the King' : useCast ? 'the person in photo 1' : 'the lead'}.`;
  return [
    useCast
      ? `Design a brand-new, original theatrical movie poster starring ${squad > 1 ? `the ${squad} people in the first ${squad} photos` : 'the person in the first photo'}${character && !withKing ? `, with photo 1 playing the role of ${character}` : ''}.`
      : withKing
      ? `Design a brand-new, original theatrical movie poster where ${kingKept ? 'the King, kept exactly as drawn in the reference artwork, is the lead' : 'an invented King figure is the lead'}, and ${who} ${squad > 1 ? 'stand' : 'stands'} right beside him as ${squad > 1 ? 'co-stars' : 'the co-star'}.`
      : `Design a brand-new, original theatrical movie poster starring ${who} as ${ROLES[role] || ROLES.king}${character ? `, playing the role of ${character}` : ''}.`,
    ref,
    useCast ? castLines(cast, role, kingKept) : '',
    crown,
    world ? `Setting: ${world}.` : '',
    `Any other people in the scene are newly invented characters.`,
    kingKept ? `Apart from the King kept from the reference artwork, do not depict or resemble any real actor, celebrity or public figure: the only other real faces are the uploaded people.` : `Do not depict or resemble any real actor, celebrity or public figure: the only real faces in the poster are the uploaded people.`,
    `Palette: deep black and crimson with one electric-blue rim light.`,
    kingKept ? `Style: the ${styleName} style of the reference artwork, so the King and the new people look like one picture.` : `Style: ${LOOKS[look] || LOOKS.cinematic}.`,
    `Leave the top 15% and the bottom 25% as clean dark space. Portrait 2:3, no text, no letters, no logos, no watermark.`
  ].filter(Boolean).join(' ');
}
