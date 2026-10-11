# Daily fan AI scan

`data/ai-creator-log.json` is the record of fan-made AI works about KING / Shah Rukh Khan.
It feeds the Fan Made AI Universe page (daily discovery gallery) and the KING Buzz
"AI creator signal" section.

- `items[]`: one per work. `platform` (youtube | instagram | x | facebook), `url` (the creator's own public post),
  `id` (YouTube video id, YouTube only), `title`, `creator`, `kind`, `views` (number or null when the platform
  does not publish it), `views_asof` (YYYY-MM-DD), `found` (YYYY-MM-DD, IST day it was logged), `source`.
- `scans[]`: one per daily run: `day`, `new` (works added), `platforms` (added per platform), `method`.
- `reviewed[]`: submission URLs already reviewed (accepted or declined), so they are not reviewed twice.

Rules: link only, never re-host; credit the creator; fan-made AI work only (not official studio material);
no explicit, hateful or deceptive deepfake content; real numbers or null, never estimates.

Fan submissions arrive through the Worker (`/ai-submit`) and are copied each morning to the branch
`data/ai-queue` (file `ai-submissions-pending.json`) by `.github/workflows/ai-queue.yml`.
