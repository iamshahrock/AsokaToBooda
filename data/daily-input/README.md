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
