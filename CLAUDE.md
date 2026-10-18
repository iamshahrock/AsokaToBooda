# Agar Main King Hota — project brief for Claude

Read this first in every new chat. The owner is Shailja Gupta (GitHub: iamshahrock). Claude is lead developer.
This repo is PUBLIC: never write private or legal material here.

## What it is
Fan platform for Shah Rukh Khan's KING (release 24 Dec 2026), live at https://agarmainkinghota.com.
Header sections (one line on desktop ≥1200px, burger below): Make Your Poster (/create/), King's Lairs (/lairs/),
Chess81 (/CHESS81.HTML), Billboard (/fan-billboard/), KING Buzz (/king-intelligence/), Asoka to Boo-Da (/asoka-to-booda/),
DOOM to KING (/doom-to-king/), Inquilaab (/inquilab/). Plus About Us, Contact, FAQ, STARKS points badge.

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
- The project is not anonymous: the owner is named. About Us (/about/, 13 Oct 2026) lists the backers, two per row, with photo, role, short bio and logos: Dr. R.K. Prasla (Presenter & Sponsor; ZeeFX Studio, Innovator), Mr. Ganesh Vulidra (Creator, The Ultimate King Fan Challenge), Mr. Mohomed Morani (Patron; CMD, DOME Entertainment), Mr. Mazhar Nadiadwala (Patron; MD, DOME Entertainment), Mr. Sanjay Rodrigues (Tech Sponsor; Founder & CEO, Phenomenal AI). The 6th slot is left empty for the next backer; the owner's own section sits below a red rule. Never publish backers' phone numbers or addresses (Ganesh's CV has them).
- Style: compact red/black, direct, evidence-led.
- Naming (owner's decision 18 Oct 2026): the movement is spelt INQUILAAB (nod to Amitabh Bachchan's film Inquilaab) and the hashtag is #FreeMyFace (was Inquilab / #FreeTheFace). URL stays /inquilab/ and the STARKS key stays `inquilab` so old links and points keep working.

## Docs (claude.ai)
- Thesis manuscript "SRK: The Man, The Myth, The King" (renamed 13 Oct 2026; was "The Man, The Brand, The Myth"): https://claude.ai/code/artifact/2d67e4c6-cb25-4947-827b-3feb291f1d35
- Thesis working map (fact ledger): https://claude.ai/code/artifact/3b60d235-6bcc-40a8-afc2-bfaa42188979
- Press release "KING by FANS": https://claude.ai/code/artifact/a9a602c3-ffbf-474c-82a3-02575c665e32
- Creator Kit (charter, STARKS integration, card spec; shared with the fan developer 13 Oct): https://claude.ai/code/artifact/d07b71e8-b28e-4b7e-8988-f90e9777bd45

## Make Your Poster — current policy (#FreeMyFace, PR #61, chat "Set II", 12 Oct 2026)
- No star's face goes into the AI: the film poster is sent BLURRED (`FILM_REF_MODE = 'blur'` in create/index.html), colour and layout only.
- Prompt (assets/studio/prompt.js) forbids depicting or resembling any real actor, celebrity or public figure. The only real faces are the uploaded fans.
- Every finished poster carries a visible "AI-MADE FAN POSTER" label plus XMP/JPEG-comment AI provenance (`tagJpeg()` in assets/studio/compose.js).
- Consent covers people in the photo, under-18s and celebrity photos. Photos go to OpenAI only to paint the poster and are not kept.
- Hero line "Your face. Not his." links to /inquilab/.
- Live test 12 Oct: one poster (Shah Rock Jaan art as the "fan photo"), 200 OK in 37 s, no star faces, label and metadata present. A real human photo is NOT yet tested.
- Limits: 100 site posters a day, 5 per connection a day.
- Posters: 83 in assets/posters (80 from the owner's archive + Pathaan, Jawan, Dunki added 13 Oct; their face boxes were placed by hand). Studio filter has a '2020s & KING' chip.
- Cast picker (12 Oct): for the 74 posters with detected faces, step 02 shows numbered characters (assets/posters/faces.json: positions only, no identities). Fans choose You / Friend 1 / Friend 2 / A new face per character; the prompt keeps the poster's cast layout and every original cast member becomes a fan or an invented face. Posters with fewer than 2 faces, and KING, use the single-hero mode.

## Open work
- Owner runs real-photo poster tests; afterwards check D1 posters for failed/declined requests and spot-check results for celebrity faces.
- 80 face-free "mood plates" to replace the star-face reference posters. Owner to choose: auto-made from the existing posters (show 6 first) or designed by her team. Face boxes for all 80 posters exist (face-api run, 12 Oct) and can drive automatic face removal.
- PARKED, conflicts with #FreeMyFace: the "replace a face" remake mode (masked AI edit composited onto the untouched original poster). It would keep real stars' faces in the output. Owner to decide before any work.
- Inquilaab sub-page "The Revolution Starts Now": evidence of what visual AI changes vs our fix (examples need explicit fan consent).

## Press release "KING by FANS" (doc linked above)
- Headline: "RA.ONE. CHENNAI EXPRESS. KING." then "KING by FANS." / "The Digital Revolution Returns."
- "World's first" claims are made FLAT, no "to our knowledge" (owner's decision 12 Oct: no precedent online = proof). Approved claims: "The world's first fan-built 360° film campaign" = (1) fan-built, studio-independent, (2) AI fan creation, (3) original games, (4) fan rankings (STARKS), (5) public daily intelligence dashboard (KING Buzz), (6) Inquilaab. Also: KING Buzz = "world's first fan campaign to publish its film's buzz in public every day against a fixed baseline"; Inquilaab = "world's first fan movement fighting FOR a star's AI rights, not just against fakes" (Taylor Swift fans 2024 and K-pop fandoms fought fakes, so 'first fans against AI fakes' is taken).
- Never claim "world's first AI fan campaign" or "first fan campaign" alone: Barbie (2023), Spider-Verse (2023), Cadbury/SRK (2021), Zero's Bauua Ki Toli (2018) and her own Ra.One contests (2011) came first.
- Avoid "built to break records" unless a named, measurable record.
- Pending from owner: backer bios (Dr. Prasla, Mr. Mohomed Morani, Ganesh), quote approval, date, media contact, proof for Wharton/IO/Shorty awards and Singham Returns. Zee award: Jan 2012 ceremony for Ra.One (2011).

## Portal direction (decided 12-13 Oct 2026)
- The site is becoming a portal, not one site. Make Your Poster becomes a category landing page (early-2000s game-portal style): a grid of named poster games, each with its own creator credit, cover, play count and badges (NEW, HOT, KING'S PICK). Our studio gets its own game name (proposed: Kingmaker; owner to confirm).
- A fellow fan developer is building a second poster game: "The Ultimate King Fan Challenge" (4 tasks: Know the King 81-second quiz, Make the King's 81st poster, One Minute for the King, Make Your King Famous; Top 5 prize). Owner approved; STARKS will be integrated into his game. Landing page work starts 13 Oct.
- Shared across all creators: one fan identity + STARKS, one creator charter (#FreeMyFace, AI-made label, consent), one card format.
- Review notes given on his deck: lock the Top 5 prize before launch; cap social likes (deck gives them 350/1,000); one currency (STARKS) not three; start Task 3 as a voice note; define "80 films" (our 80 posters vs 98 film credits); quiz bank can come from the thesis appendices.
- Sponsor: Phenomenal AI (phenomenalai.in, text-to-video), owner's former client; free account for campaign videos. First test (15 s, crowned kid in "The Abyssal Den" pool hall) reviewed: fix crown continuity, duplicate pool ball, missing break payoff, empty opening, audio level. Credit line and logo pending from the owner.

## DOOM to KING banner
- DOOM to KING banner (13 Oct 2026): the owner's layered art in assets/dk/ (bg.webp, beams.webp, figures.webp, all 2400x1000, stacked). The beams layer flickers in CSS (off for reduced motion). Shown above the countdown hero on /doom-to-king/, and as slide 1 of the home slider (agarmainkinghota.html): it holds for 2.5 s, then rotates to Agar Main King Hota and continues every 7 s. The banner replaced the old text DOOM to KING slide; whole banner fits every width over a blurred copy of the background; phones get an 'Enter the fixture' button.

## Merch (/merch/, 13 Oct 2026)
- King Fan Merch page: 15 T-shirt mockups (assets/merch/*.webp, 900x1000 web previews only; print files stay off the repo). Brand on stores: Shah Rock Jaan.
- Buy buttons read the STORES list and each design's links object in merch/index.html; an empty link shows "<Store> · soon". Paste product URLs there once the stores are live.
- Stores: Amazon Merch on Demand (owner applying, US account), Redbubble, Spreadshirt (Spreadshop can be embedded with its JavaScript integration). Marketplaces block iframes, so we link out.
- Merch is in the header's utility links (Merch, About Us, Contact, FAQ), not the 8 main links.

## Working across chats
Chats cannot read each other. At the end of any chat that changes the site, update this file in the same PR.
- About Us + owner's blog (after the site is done).
- Daily scheduled scan: add Fan Wall held/reported comment review.
