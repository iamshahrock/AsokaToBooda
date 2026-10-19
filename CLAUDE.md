# Agar Main King Hota — project brief for Claude

Read this first in every new chat. The owner is Shailja Gupta (GitHub: iamshahrock). Claude is lead developer.
This repo is PUBLIC: never write private or legal material here.

## What it is
Fan platform for Shah Rukh Khan's KING (release 24 Dec 2026), live at https://agarmainkinghota.com.
Header sections (9 since 18 Oct 2026; one line on desktop ≥1200px, burger below): Make Your Poster (/create/, the studio with all poster thumbnails; owner's rule 18 Oct: 'add' means alongside, never replace. /make-your-poster/ redirects to /create/; Be King shows as 'coming soon' in the section tabs), King's Lairs (/lairs/),
Chess81 (/chess81/, a shelf: the full game /CHESS81.HTML + Rapid Fire by Ganesh, coming), Billboard (/fan-billboard/), KING Buzz (/king-intelligence/), Asoka to Boo-Da (/asoka-to-booda/),
DOOM to KING (/doom-to-king/), Inquilaab (/inquilab/), KING Fever (/king-fever/, 7 original song slots, music produced by Ssubhro Ganguly). Plus Merch, About Us, Contact, FAQ, STARKS points badge.
- Every new top-level folder must be added to the cp line in .github/workflows/pages.yml or it is not deployed (merch was missing until 18 Oct). Release QA expects 9 header links.

## Site design (polish pass, 18 Oct 2026)
- The ZERO to ONE story banner tops EVERY page (owner, 18 Oct: never remove it) and links home; inner pages also keep the Home button in the bar. Contact/FAQ live in the burger menu and the footer.
- Section tabs under the bar (SUB in assets/header.js) for Make Your Poster, King's Lairs (Rescue Your Face, Lairs Cinema), Chess81, Billboard, Asoka to Boo-Da, Inquilaab.
- Back-to-top arrow on every page (header.js). Footer has a 4-column site map (footer.js).
- assets/polish.css (loaded by header.js after page styles) holds the calmer type scale; change sizes there, not page by page.
- Home keeps the original six doors with the characters, the DOOM to KING banner band and the INQUILAAB band (owner, 18 Oct: put back; do not regroup the home page).

## Stack
- Static site on GitHub Pages via .github/workflows/pages.yml (cache-busts shared assets with ?v=<sha8>).
- Backend: Cloudflare Worker `asokatobooda` (backend/worker.js), auto-deploys on backend/** changes.
- D1 database `amkh-platform` (comments, comment_votes, page_reactions, posters, starks, etc.).
- Shared scripts: assets/header.js, footer.js (loads fanwall.js), starks.js, cinema.js.
- Never use Replit. Only GitHub + Cloudflare. API keys are set by the owner in Cloudflare, never in chat.

## How to ship
Branch → PR via `gh api repos/iamshahrock/AsokaToBooda/pulls -X POST` → squash merge via `gh api .../pulls/N/merge -X PUT`.
Verify live before calling anything live: tools/v2-live-e2e.mjs and tools/release-qa.mjs (expects 9 header links).

## Standing rules
- Real absolute numbers or N/A. No invented figures. No blank cells.
- Unverified claims are kept and labelled [Unverified], never deleted.
- Don't alter the original ijOO / Shah Rock Jaan art. Cartoon G.One art is the owner's; live-action G.ONE belongs to Red Chillies.
- No "not affiliated" disclaimer. No privacy/terms page.
- Fan Wall: 555-character limit, NO profanity filter (owner's explicit decision).
- The project is not anonymous: the owner is named. About Us (/about/, 13 Oct 2026) lists the backers, two per row, with photo, role, short bio and logos: Dr. R.K. Prasla (Presenter & Sponsor; ZeeFX Studio, Innovator), Mr. Ganesh Vulidra (Creator, The Ultimate King Fan Challenge), Mr. Mohomed Morani (Patron; CMD, DOME Entertainment), Mr. Mazhar Nadiadwala (Patron; MD, DOME Entertainment), Mr. Sanjay Rodrigues (Tech Sponsor; Founder & CEO, Phenomenal AI), Mr. Subhro Ganguly (Media & Entertainment Business Leader; Media Strategist & Entertainment Entrepreneur; Music Producer, KING FEVER; photo + bio added 18 Oct 2026, owner's text word for word; owner spells it Subhro here, KING Fever page and book still say Ssubhro); the owner's own section sits below a red rule. Never publish backers' phone numbers or addresses (Ganesh's CV has them).
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

## Poster style editions (18 Oct 2026)
- The owner is rendering all 83 posters as style editions (3D Pop, Anime, 2-3 more coming). Files go in assets/posters/styles/<style>/<id>.jpg plus thumb/<id>.webp; switch a style on with "ready": true in assets/posters/styles/styles.json.
- Studio step 01 has a Poster style row. With a style chosen, the grid shows that edition and its poster is the AI reference: sharp, not blurred, but every face box from faces.json is masked first (#FreeMyFace). Without the file it falls back to the blurred original. The style also sets the matching look.
- Studio name "Kingmaker" is a working title until the owner picks one.

## The book online (18 Oct 2026)
- /asoka-to-booda/book/: the web edition of the manuscript "SRK: The Man, The Myth, The King", one page per section (38: front matter, 22 chapters, 6 rooms, epilogue, appendices A-D, sources) with Part intros, prev/next and a contents page. Images in book/img (SRKWorld 2000 pages and two event photos).
- Built from the Claude Doc by an export + pandoc script (not in the repo). To refresh after new chapters: export the manuscript tab as markdown and rebuild; the build switches Inquilab/#FreeTheFace to Inquilaab/#FreeMyFace.
- No PDF on the site (owner, 18 Oct 2026): a PDF will come later behind a request form that people fill in before downloading. Do not publish the PDF until then.
- Owner's note 18 Oct: '38 pages is too little, we talked about a 100-page manuscript'. The 38 are web sections; the manuscript itself is 112 A4 pages. Keep deepening thin chapters (the scheduled 'Thesis chapter build' adds one section per run).
- Contents page (owner, 18 Oct: 'both'): a picture band per Part (cover art in COVER in tools/build-book-web.py) and a picture card per chapter. Every act of the Asoka to Boo-Da essay ends with a 'Read the full chapter' link to its book chapter (map in asoka-to-booda/index.html, .fullch).
- Now a source version: linked only from 'The source versions' on /asoka-to-booda/.

## The Silence Before the King (18 Oct 2026)
- /asoka-to-booda/silence/: the owner's case study from her ChatGPT chat "Asoka to Booda Rewrite" (share 6ac930bf…), Parts I-III, pages 1-19, one web page per thesis page, WORD FOR WORD (owner, 18 Oct: do not shorten or rewrite her thesis). Built by tools/build-silence-web.py from /tmp text; only citation markers dropped, tables rebuilt, one bracketed note on 18 vs 30 brands.
- Linked from the Asoka to Boo-Da cover ("Read the case study") and the section tabs. Pages 20-66 of the 66-page index are not written yet (index in the owner's ChatGPT chat "Math Game Scoring Rules").

## The drafts (18 Oct 2026)
- /asoka-to-booda/drafts/: the owner's three full thesis drafts from her ChatGPT chat "Math Game Scoring Rules" (archived 9 Oct in /home/claude/handover/04d-math-game-thesis-drafts.txt), WORD FOR WORD: The Silence Before the King (long form, Prologue + Parts I-VII + Epilogue), Asoka to Booda · Be Da Boo-Da (Prologue, Ch 1-9, Epilogue) + the revised 'ALL IN' chapter and The Royal Flush, and From Zero to King (official first draft, Ch 1-9). 18,874 words. Built by tools/build-drafts-web.py. Owner, 18 Oct: never shorten, summarise or rewrite her thesis text; add, don't edit.
- Owner says she shared 30+ ChatGPT chats; /home/claude/handover/chat-log.md holds the 9 Oct summaries, but only 5 chats were saved in full. Share links that still work can be read through the built-in browser on her desktop app.

## The Final Thesis (18 Oct 2026)
- /asoka-to-booda/final-thesis/: ASOKA_TO_BOODA_FINAL_THESIS.docx (384 pages; recovered from the owner's ChatGPT library, uploaded 18 Oct) published WORD FOR WORD with all 151 images in place: 92 sections, 44,674 words. Built by tools/build-final-thesis-web.py from a pandoc markdown export (images to webp, max 1400 px). First CTA on the Asoka to Boo-Da cover and a section tab.
- Owner's audit brief (Section A) and ChatGPT's gap report (Section B) came with it: a full completeness audit (gap register, 7-film Part III matrix, chart register, source register) is the next job. Open questions for the owner: authorship credit (name in or out), Chennai Express credit wording with Siddhesh Bhobe.

## The Master Manuscript (18 Oct 2026)
- /asoka-to-booda/manuscript/: "Asoka to Boo-Da - SRK: The Man, The Myth, The King", every version of the thesis integrated into one book (Prologue, Parts I-X, 46 chapters, Academic Addendum A-H, Final Frame; 57 pages, 19 images, box-office chart drawn as SVG). Owner: no author byline; her name only where testimony needs it.
- Source of truth: Claude Doc https://claude.ai/code/artifact/46d4ff43-76ed-4224-a4a4-70a91338a16f. Rebuild: export the tab as markdown to SRC/ms.md, images in SRC/img, then python3 tools/build-manuscript-web.py SRC asoka-to-booda/manuscript (the export drops images/charts; the script puts them back by caption).
- Contents page = a book's table of contents (owner, 18 Oct: no repeated thumbnails): per Part one relevant picture (COVER) and a numbered chapter list. Chapters carry relevant pictures from PICS in the build script (Final Thesis images + site art, each captioned).
- ONE BOOK (owner, 18 Oct 2026: 'why 4 separate same things'): /asoka-to-booda/ IS the book's contents page (written by the build script; manuscript/index.html forwards to it). The old essay cover and the 4 version buttons are gone. The four originals (Final Thesis, first web book, case study, drafts) stay online untouched, linked only under 'The source versions' at the end of the contents. Section tabs: Contents, Prologue, Part I, The Royal Flush, Academic Addendum, The Final Frame. Home slider 'Read the book' goes to the Prologue.
- Chennai Express case study PDF: live at /asoka-to-booda/files/ce_digitalcasestudy.pdf (19 Oct 2026, owner: phone numbers and emails on page 2 removed by true redaction), linked at the end of Chapter 12. This PDF is allowed; the no-PDF rule is only for the book.
- Final Thesis audit (19 Oct 2026, Claude Doc): https://claude.ai/code/artifact/2a359cf9-f290-4a9e-b075-52e029539d24 (gap register, 7-film matrix, chart register, 26 open [Unverified] items split owner/public record, 169-source register). The pie-chart correction session was NOT found in any available file.
- The scheduled task 'Master Manuscript chapter build (twice daily)' (was 'Thesis chapter build') now deepens the Master Manuscript doc only and rebuilds the live book itself (owner, 19 Oct: one Master Manuscript with everything).
- Owner, 18 Oct 2026: work on the live site for everything unless she asks for a backup; don't park finished work off-site.
- INDEX on top of /asoka-to-booda/ (owner, 19 Oct 2026): every section numbered (Front, Prologue, Ch 1-46, A-H, Final Frame) with a 2-line summary, clickable, two columns (one on phones), Part dividers; the old Contents list stays below it. Summaries live in tools/manuscript-index.json (edit there, then rebuild).
- 19 Oct 2026, Final Thesis integration (owner: 'Integrate all the elements from the 92 that will fit as part of the thesis'): 135 passages from the 92-section Final Thesis added WORD FOR WORD to 33 places in the Master Manuscript doc, each under a '#### From the Final Thesis' block at the end of its chapter (Prologue and Final Frame use ###), every passage tagged '(Final Thesis, section N)'. Left out on purpose: ChatGPT chat lines and instructions, the draft indexes/roadmaps/page plans, the LinkedIn launch post, the award/QC checklists, image-source captions, and passages already in the book verbatim. Book now 57 pages, 54,848 words. Selection scripts in /tmp/claude-0/integ (not in repo). Build fix: tables with inline style no longer close the .prose div early (tools/build-manuscript-web.py).
- 19 Oct 2026 (PR #98): 8 [Unverified] items closed from public records (register G now 27 open); thin chapters 2, 7, 13, 17, 21, 42-46 deepened with sourced material; rebuilt at 57 pages, 27,956 words. Third Wheel and O TO X additions come from her ChatGPT chats 04a/04b (handover), labelled Proposal; the 'Adultish Noir' reality-show idea in 04b is left out of the book.

## KING Buzz daily report (18 Oct 2026)
- /king-intelligence/report.html renders any day from data/king-intelligence-daily.json (?date=YYYY-MM-DD; default latest) and shows unrecorded gaps. Linked first in the KING Intelligence crumbs and as "Today's daily report" on the dashboard.
- Daily input: commit data/daily-input/YYYY-MM-DD.json; the king-daily-update workflow validates and appends it. No records were filed 07-17 Oct (owner noticed 18 Oct); the scheduled task "KING Buzz daily report" now files one every day.

## Open work
- Owner runs real-photo poster tests; afterwards check D1 posters for failed/declined requests and spot-check results for celebrity faces.
- Mood plates CANCELLED (owner, 19 Oct 2026): keep the original posters; fans choose a style edition (3D Pop, Anime, more coming) as their style. No face-free plate set.
- King's Lairs = RESCUE YOUR FACE (owner, 19 Oct 2026: two master locations, choose a site, play level by level, Mario-style princess rescue: last level bow and arrow, shoot the crown, the crown is the key, open the safe, rescue your face, then use it in Make Your Poster; every level a different top arcade style, 55 seconds). Code: assets/lairs/rescue.js (window.KingsRescue), markup #rescue in lairs/index.html. World 1 The Underground City (LIVE): 1-1 Shooting Gallery (Duck Hunt, casino), 1-2 Chip Breaker (Arkanoid, casino), 1-3 Knockout (Punch-Out, pit), 1-4 Deep Dive (dodger, den), 1-5 Tunnel Run (Subway Surfers, city-vr), 1-6 Shoot the Crown (bow and arrow boss, city-vault). 3 lives per world; state in localStorage 'amkh-rescue'; the fan's photo in 'amkh-face' (device only) shown greyed behind bars in the safe; rescue screen links /create/?from=lairs which preloads that photo. World 2 The AI Lab (LIVE 19 Oct 2026, dome-panorama map; ?world=lab opens it): 2-1 Searchlights (stealth, dome-aerial), 2-2 Drone Attack (Space Invaders, dome-lab), 2-3 Fake Slicer (Fruit Ninja, slice fakes not the gold fans, dome-archive), 2-4 Hive Chase (Pac-Man, free 80% of pods, dome-hive), 2-5 Tower Flight (Flappy Bird, 15 towers, dome-arrival), 2-6 Shoot the Crown (same archery boss, dome-waterfall). The rescue screen offers the other world. Knockout brute is a plain silhouette until the owner sends brute art. STARKS: 'lair' per level, 'verdict' 750 once per world rescue. Design docs: https://claude.ai/code/artifact/9abab795-3d93-4e43-9476-e78a8e301c25 (full design; superseded in part by the owner's Rescue direction) and https://claude.ai/code/artifact/3c61e22b-ae17-4838-a53d-31e48b0c57d1 (old). Lairs Cinema unchanged. The old Chehre ki Chori engine was removed; the older mini-game functions (casino/dome/city/pit/den/throne) are still defined in lairs/index.html but unused.
- PARKED, conflicts with #FreeMyFace: the "replace a face" remake mode (masked AI edit composited onto the untouched original poster). It would keep real stars' faces in the output. Owner to decide before any work.
- Inquilaab sub-page /inquilab/revolution/ 'The Revolution Starts Now' LIVE (19 Oct 2026): AI-vs-our-studio comparison, 3 empty consented-example slots, the master INQUILAAB #FreeMyFace design (assets/merch/inquilaab-master.webp); more designs coming from the owner. Inquilaab now has section tabs (SUB in header.js).

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
