# KING Daily Intelligence — Input Contract

This directory is the only daily input point for the KING intelligence system.

## Daily procedure

1. Create one file: `YYYY-MM-DD.json`
2. Set `date` to that date.
3. Set `record_id` to `KING-YYYY-MM-DD`.
4. Set `role` to `DAILY UPDATE`.
5. Add every metric with:
   - `series_id`
   - `value` (absolute number or `null` when unavailable)
   - `unit`
   - `source`
   - `method`
   - `confidence`
   - `status`
6. Add optional intelligence fields such as `geography`, `topics`, `viral`, `sample`, `sentiment`, `comparison`, and `notes` when supported by evidence.
7. Commit the input file.

GitHub Actions validates the record and appends it to `data/king-intelligence-daily.json`.

## Non-negotiable rules

- 04 Oct 2026 is immutable.
- Records are append-only.
- A date cannot be inserted twice.
- New dates must be later than the latest ledger date.
- Missing numbers remain `null`.
- Posts are not people.
- Followers are not unique fans.
- Geographic signals are not country-level volume.
- Different sources/series are never silently merged.
- Every absolute metric requires provenance and method.

The Pages site reads the canonical data layer. Daily HTML rebuilding is not part of the operating procedure.

## Where the numbers come from (owner, 26 Oct 2026)

- **YouTube views** (`king_title_reveal_views`, `king_date_announcement_views`, `doomsday_official_trailer_views`): read them from `data/buzz/youtube.json`, not from youtube.com. The Cloudflare Worker reads them every evening at 20:15 IST with the YouTube Data API, and the `KING Buzz YouTube counts` workflow copies them into the repo at 20:30 IST. Use a video's `views` only when its `day` is today (IST); source = the video URL plus "YouTube Data API via the site Worker, read <read_at>", method = "YouTube Data API videos.statistics.viewCount", confidence = "exact public counter". If `day` is not today, the value is `null` (say the Worker reading is missing). Unattended runs cannot open youtube.com: do not try.
- **Display Purposes** (`srk_indexed_posts`, `srkking_indexed_posts`): RETIRED 19 Nov 2026. Its data stopped around the end of May 2025: on 19 Nov 2026 its #srk page still showed 2,933,427 posts and its newest "top posts" were dated 24-30 May 2025, while the "Last updated" line only shows the day the page is opened. Our 06 Oct reading (#srk 2,933,427) and 18 Oct reading (#srkking 32,455) were therefore already about 16 months old. Do not read or file these two series any more (no blank rows).
- **Instagram hashtag posts** (`srk_instagram_posts`, `srkking_instagram_posts`, from 20 Nov 2026): read them in the logged-in built-in browser from Instagram's own search box (Search, type `#srk`, then `#srkking`; the line under each hashtag says "N posts"). Instagram shows these rounded (e.g. 7.7M, 135K): file the number as shown (7.7M = 7700000), unit "Instagram #srk posts" / "Instagram #srkking posts", source "Instagram search box, read <HH:MM> IST", method "post count as displayed by Instagram search (rounded)", confidence "rounded public counter", status "usable". If Instagram shows no count, leave the series out. First reading by hand, 19 Nov 2026 13:31 IST: #srk 7.7M posts, #srkking 135K posts.
