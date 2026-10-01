# AGAR MAIN KING HOTA — SITE UX / EXPERIENCE ARCHITECTURE

Status: DESIGN-LOCKED DIRECTION / PRE-DEVELOPMENT
Branch: feature/site-experience-architecture

## 1. PRODUCT IDEA

The website is not a catalogue of campaign assets.

It is a cinematic universe with a simple entry question:

> AGAR MAIN KING HOTA?
> A question. Infinite kingdoms.

The interface should make the visitor understand the proposition quickly, then choose a path.

Primary journey:

HOME → ENTER THE UNIVERSE → discover → create / read / play → return

Secondary journey:

SEARCH → find any film, character, story, thesis section, game or world.

## 2. VISUAL PRINCIPLES

1. White space is intentional.
2. Red / black / white is the primary graphic system.
3. Supplied typography artwork is treated as master artwork.
4. Supplied logos and crowns are treated as master artwork.
5. Supplied ijOO character artwork is immutable. Do not redraw, regenerate, retouch or reinterpret faces.
6. Images are used selectively and given hierarchy.
7. One screen should communicate one dominant idea.
8. Cards are used as navigation, not as a dump of every feature.
9. The site should feel like cinema + editorial publishing + interactive play.
10. AI-generated visuals must never replace supplied master IP artwork.

## 3. GLOBAL NAVIGATION

HOME
THE ORIGIN
THE THESIS
THE GAME
AI BIOSKOPE
ijOO UNIVERSE
COMMUNITY

Utility:
SEARCH
ENTER THE KINGDOM

Mobile:
hamburger / search / persistent primary CTA.

## 4. HOME

### Hero

Headline:
AGAR MAIN
KING
HOTA

Supporting line:
A QUESTION. INFINITE KINGDOMS.

Primary CTA:
ENTER THE UNIVERSE

Secondary CTA:
WATCH THE ORIGIN

The hero is visually dominated by the approved TV-room / origin-world composition. The supplied character artwork is placed as artwork, not regenerated.

### Section 02 — The Origin

Headline:
BEFORE THERE WAS A KING, THERE WAS A BOY.

Short narrative introduction.

CTA:
WATCH THE ORIGIN FILM

Interaction:
Origin chapters:
01 The Boy
02 The Octopus
03 The Transformation
04 Noctopus
05 The King

### Section 03 — The Five Doors

Five clean destinations:

THE THESIS
THE GAME
AI BIOSKOPE
ijOO UNIVERSE
COMMUNITY

Each card has one job and one CTA.

### Section 04 — Editorial statement

A large visual / quote section that establishes the project as:

A FAN.
A MEMORY.
A CHARACTER.
A STORY.
A NEW REALITY.

### Footer

AGAR MAIN KING HOTA
About / Contact / Terms / Privacy
Social links

## 5. THE ORIGIN

Purpose: tell the mythology before asking the visitor to participate.

Structure:

Hero → chapter navigation → film / sequence → character/world reveal → Enter the Universe.

The five origin chapters should be navigable without leaving the origin experience.

## 6. THE THESIS

Purpose: make ASOKA TO BOO-DA / THE SILENCE BEFORE THE KING a real reading experience.

Landing:

THE SILENCE BEFORE THE KING
A Cinematic Industry Case Study · 2011–2026

Actions:
READ THE THESIS
VIEW TIMELINE
SEARCH THE RESEARCH

Reading interface:
- chapter list
- progress indicator
- search
- footnotes / bibliography
- image / chart support
- return-to-index control

The thesis remains distinct from proposed campaign concepts. Public pages should preserve the manuscript's distinction between documented facts, recollection, interpretation and proposed concepts.

## 7. THE GAME

Purpose: convert the fan from audience into participant.

Landing:

ZERO TO ONE
AGAR MAIN KING HOTA

Flow:

01 CHOOSE
Year → Film → Character

02 UPLOAD
Your photo

03 WRITE
Genre → co-stars → story

04 CREATE
AI poster

05 PLAY
60-second challenge

06 SCORE
Result / Crown state

Current working prototype:
- native photo input
- local preview
- film / character catalogue
- story prompt
- ZERO / Bauua approved pack
- poster generation endpoint
- 60-second challenge
- local score

Future game modules:
- Check Mate Fire
- 36-piece chess / 81-square board
- Speed Poker
- Billboard
- leaderboard

Do not claim public rankings, prizes or contest status until their backend and terms exist.

## 8. AI BIOSKOPE

Purpose: turn the creative idea into a repeatable storytelling engine.

Landing proposition:

YOUR IMAGINATION.
YOUR STORY.
YOUR REALITY.

Four doors:

CREATE POSTER
CREATE STORY
CREATE CHARACTER
EXPLORE WORLDS

The AI Bioskope is an engine inside the universe, not a competing homepage.

Architecture:

Browser → Cloudflare Worker/API → AI service → result → browser

No provider secret in client-side code.

## 9. ijOO UNIVERSE

Purpose: introduce the original character/IP system.

Categories:

CHARACTERS
WORLDS
STORIES
MERCHANDISE
COLLABORATIONS

Every master character asset remains pixel-preserved.

Character page:
- master artwork
- character name
- story
- world
- related creations
- approved downloadable/press asset where applicable

## 10. COMMUNITY

Purpose: fan participation.

Categories:

POSTERS
STORIES
MEMES
ART
GAMES
FAN KINGDOMS

Primary action:
SUBMIT YOUR CREATION

Phase 1:
local creation + share.

Phase 2:
moderated gallery.

Phase 3:
leaderboards.

Phase 4:
creator profiles / SRKWORLD.

## 11. GLOBAL SEARCH

Search should work across structured site content.

Search targets:

Film
Character
Year
Thesis chapter
Story
Game
AI Bioskope
ijOO world
Community creation

Example:

Search “Bauua”

→ ZERO
→ Bauua Singh
→ ZERO Intelligence Pack
→ relevant thesis references
→ related creations

Search “2013”

→ Chennai Express
→ relevant thesis section
→ campaign material
→ related stories

Search is a real information layer, not a decorative icon.

## 12. RESPONSIVE UX

Desktop:
cinematic / editorial composition.

Tablet:
reflow cards and preserve hierarchy.

Mobile:
single-column reading and interaction.
Persistent primary CTA.
No tiny navigation.
No essential information hidden behind hover.

## 13. CONTENT HIERARCHY

LEVEL 1 — ENTER
What is this?

LEVEL 2 — DISCOVER
Origin / Thesis / Game / Bioskope / ijOO

LEVEL 3 — PARTICIPATE
Create / Play / Submit

LEVEL 4 — EXPLORE
Characters / Stories / Research / Gallery

LEVEL 5 — RETURN
Share / Community / Kingdom

## 14. DESIGN GUARDRAILS

Never:
- place every asset on one page
- regenerate supplied character faces
- use AI reinterpretations of master IP as substitutes
- make every section equally loud
- turn every feature into a card
- claim an unofficial activation is official
- expose AI API secrets
- claim a public leaderboard before backend support exists

Always:
- preserve supplied master artwork
- use whitespace
- establish a clear focal point
- use one dominant CTA per section
- let typography create hierarchy
- use imagery as narrative evidence / atmosphere
- keep the interface understandable without explanation

## 15. DEVELOPMENT ORDER

1. Site shell + navigation
2. Home
3. Origin
4. Thesis reader
5. Game integration
6. AI Bioskope interface
7. ijOO character/world layer
8. Community gallery
9. Global search
10. Cloudflare/API integration
11. analytics / moderation / launch controls

## 16. DEFINITION OF THIS PHASE

This document defines the UX target.

It does not claim that all modules are already implemented.

The next development phase should turn this architecture into a clickable site while preserving the approved visual direction and master assets.
