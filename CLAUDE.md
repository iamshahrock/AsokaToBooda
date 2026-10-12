# Agar Main King Hota — project brief for Claude

Read this first in every new chat. The owner is Shailja Gupta (GitHub: iamshahrock). Claude is lead developer.
This repo is PUBLIC: never write private or legal material here.

## What it is
Fan platform for Shah Rukh Khan's KING (release 24 Dec 2026), live at https://agarmainkinghota.com.
Header sections (one line on desktop ≥1200px, burger below): Make Your Poster (/create/), King's Lairs (/lairs/),
Chess81 (/CHESS81.HTML), Billboard (/fan-billboard/), KING Buzz (/king-intelligence/), Asoka to Boo-Da (/asoka-to-booda/),
DOOM to KING (/doom-to-king/), Inquilab (/inquilab/). Plus About Us, Contact, FAQ, STARKS points badge.

## Stack
- Static site on GitHub Pages via .github/workflows/pages.yml (cache-busts shared assets with ?v=<sha8>).
- Backend: Cloudflare Worker `asokatobooda` (backend/worker.js), auto-deploys on backend/** changes.
- D1 database `amkh-platform` (comments, comment_votes, page_reactions, posters, starks, etc.).
- Shared scripts: assets/header.js, footer.js (loads fanwall.js), starks.js, cinema.js.
- Never use Replit. Only GitHub + Cloudflare. API keys are set by the owner in Cloudflare, never in chat.

## How to ship
Branch → PR via `gh api repos/iamshahrock/AsokaToBooda/pulls -X POST` → squash merge via `gh api .../pulls/N/merge -X PUT`.
Verify live before calling anything live: tools/v2-live-e2e.mjs and tools/release-qa.mjs (expects 8 header links).

## Standing rules
- Real absolute numbers or N/A. No invented figures. No blank cells.
- Unverified claims are kept and labelled [Unverified], never deleted.
- Don't alter the original ijOO / Shah Rock Jaan art. Cartoon G.One art is the owner's; live-action G.ONE belongs to Red Chillies.
- No "not affiliated" disclaimer. No privacy/terms page.
- Fan Wall: 555-character limit, NO profanity filter (owner's explicit decision).
- The project is not anonymous: the owner is named; backers Mr. Mohomed Morani, Dr. Prasla and Ganesh appear in About Us with logos (details pending).
- Style: compact red/black, direct, evidence-led.

## Docs (claude.ai)
- Thesis manuscript "SRK: The Man, The Brand, The Myth": https://claude.ai/code/artifact/2d67e4c6-cb25-4947-827b-3feb291f1d35
- Thesis working map (fact ledger): https://claude.ai/code/artifact/3b60d235-6bcc-40a8-afc2-bfaa42188979
- Press release "KING by FANS": https://claude.ai/code/artifact/a9a602c3-ffbf-474c-82a3-02575c665e32

## Make Your Poster — current policy (#FreeTheFace, PR #61, chat "Set II", 12 Oct 2026)
- No star's face goes into the AI: the film poster is sent BLURRED (`FILM_REF_MODE = 'blur'` in create/index.html), colour and layout only.
- Prompt (assets/studio/prompt.js) forbids depicting or resembling any real actor, celebrity or public figure. The only real faces are the uploaded fans.
- Every finished poster carries a visible "AI-MADE FAN POSTER" label plus XMP/JPEG-comment AI provenance (`tagJpeg()` in assets/studio/compose.js).
- Consent covers people in the photo, under-18s and celebrity photos. Photos go to OpenAI only to paint the poster and are not kept.
- Hero line "Your face. Not his." links to /inquilab/.
- Live test 12 Oct: one poster (Shah Rock Jaan art as the "fan photo"), 200 OK in 37 s, no star faces, label and metadata present. A real human photo is NOT yet tested.
- Limits: 100 site posters a day, 5 per connection a day.

## Open work
- Owner runs real-photo poster tests; afterwards check D1 posters for failed/declined requests and spot-check results for celebrity faces.
- 80 face-free "mood plates" to replace the star-face reference posters. Owner to choose: auto-made from the existing posters (show 6 first) or designed by her team. Face boxes for all 80 posters exist (face-api run, 12 Oct) and can drive automatic face removal.
- PARKED, conflicts with #FreeTheFace: the "replace a face" remake mode (masked AI edit composited onto the untouched original poster). It would keep real stars' faces in the output. Owner to decide before any work.
- Inquilab sub-page "The Revolution Starts Now": evidence of what visual AI changes vs our fix (examples need explicit fan consent).

## Press release "KING by FANS" (doc linked above)
- Headline: "RA.ONE. CHENNAI EXPRESS. KING." then "KING by FANS." / "The Digital Revolution Returns."
- "World's first" claims are made FLAT, no "to our knowledge" (owner's decision 12 Oct: no precedent online = proof). Approved claims: "The world's first fan-built 360° film campaign" = (1) fan-built, studio-independent, (2) AI fan creation, (3) original games, (4) fan rankings (STARKS), (5) public daily intelligence dashboard (KING Buzz), (6) Inquilab. Also: KING Buzz = "world's first fan campaign to publish its film's buzz in public every day against a fixed baseline"; Inquilab = "world's first fan movement fighting FOR a star's AI rights, not just against fakes" (Taylor Swift fans 2024 and K-pop fandoms fought fakes, so 'first fans against AI fakes' is taken).
- Never claim "world's first AI fan campaign" or "first fan campaign" alone: Barbie (2023), Spider-Verse (2023), Cadbury/SRK (2021), Zero's Bauua Ki Toli (2018) and her own Ra.One contests (2011) came first.
- Avoid "built to break records" unless a named, measurable record.
- Pending from owner: backer bios (Dr. Prasla, Mr. Mohomed Morani, Ganesh), quote approval, date, media contact, proof for Wharton/IO/Shorty awards and Singham Returns. Zee award: Jan 2012 ceremony for Ra.One (2011).

## Working across chats
Chats cannot read each other. At the end of any chat that changes the site, update this file in the same PR.
- About Us + owner's blog (after the site is done).
- Daily scheduled scan: add Fan Wall held/reported comment review.
