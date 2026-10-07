# RELEASE 5 — Repository Cleanup Archive

Release 5 removes legacy intelligence versions from the published site surface while preserving the Git history of the project.

## Retired site versions

The following paths are legacy/experimental versions and are no longer part of the intended public site:

- king-intelligence-06/
- king-intelligence-07/
- king-intelligence-08/
- king-intelligence-09/
- king-intelligence-3-live/
- king-intelligence-command/
- king-intelligence-command-v2/
- king-intelligence-new/
- king-intelligence-observatory/
- king-intelligence-v2.html
- king-intelligence-v2-data.html
- king-intelligence/index.backup-20261006.html

They are retained in repository history rather than treated as current production pages.

## Current production surface

- / — AGAR MAIN KING HOTA
- /king-intelligence/ through /king-intelligence-18/
- /king-intelligence/daily.html
- /king-intelligence/engine.html
- /king-intelligence-shared/
- /data/ production intelligence data
- /Bauua Raw Material/ required by the current poster prototype

Release 5 also changes GitHub Pages deployment to publish an explicit allow-list rather than the repository root. Repository files outside that allow-list are therefore not exposed through GitHub Pages.

Date: 2026-10-07
