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

## Open work
- Make Your Poster "replace a face" mode: AI edit with mask, then composite only the chosen face onto the untouched original. Needs a consenting adult test selfie.
- Inquilab sub-page "The Revolution Starts Now": original vs raw AI vs our fix, with % of pixels changed outside the chosen face.
- About Us + owner's blog (after the site is done).
- Daily scheduled scan: add Fan Wall held/reported comment review.
