# Bauua Raw Material — ZERO (2018)

This folder is the canonical visual source pack for the Bauua character route in AGAR MAIN KING HOTA.

## Required asset order

1. `00-zero-original-poster` — original poster supplied by Shah Rock; use as the primary visual and composition reference.
2. `01-bauua-surreal-reference` — surreal artwork reference 1.
3. `02-bauua-surreal-reference` — surreal artwork reference 2.
4. `03-bauua-surreal-reference` — surreal artwork reference 3.
5. `04-bauua-surreal-reference` — surreal artwork reference 4.
6. `05-bauua-surreal-reference` — surreal artwork reference 5.
7. `06-bauua-surreal-reference` — surreal artwork reference 6.

The app must load these bundled assets when BAUUA is selected. Fans should upload only their own photo and provide their story/idea. The image-generation pipeline should use the original poster, all six references, fan photo, and fan prompt to create a new image—not merely draw the fan photo over a template.

## Implementation status

Folder scaffold only. The seven image binaries have not yet been committed to this folder. Do not treat placeholder filenames as usable assets. The final generative poster pipeline also requires a server-side image-generation integration; do not expose provider API keys in browser code or GitHub Pages static files.
