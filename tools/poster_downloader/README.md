# ijOO / AsokaToBooda — Bulk Movie Poster Downloader

A free, local Python utility to match a spreadsheet of film titles to TMDb and download poster artwork into a folder structure you control.

## What it does
- Reads CSV or Excel film lists.
- Searches TMDb using title and optional release year.
- Displays the match and asks you to confirm before downloading.
- Downloads the poster image and records the TMDb ID, poster path, source URL, and attribution in a CSV manifest.
- Creates clean, filesystem-safe folders based on a supplied folder column or film title.
- Supports a dry-run mode.

## Requirements
- Python 3.10+
- A TMDb API key (free account/API access; comply with TMDb terms and attribution requirements).

Install:
```bash
python -m pip install -r requirements.txt
```

## Spreadsheet columns
The script tries to identify these columns case-insensitively:
- Title: `Movie Name`, `Film`, `Title`, or `Movie`
- Year (optional): `Year`, `Release Year`, or `Release Date`
- Folder (optional): `GitHub Character Folder`, `Folder`, or `Character Folder`

You can also specify column names with command-line flags.

## Run
Set your API key in the terminal (don't commit it):
- macOS/Linux: `export TMDB_API_KEY="your_key"`
- Windows PowerShell: `$env:TMDB_API_KEY="your_key"`

Preview matches without downloading:
```bash
python poster_downloader.py --input films.xlsx --output ./poster_assets --dry-run
``

Download, confirming each match:
```bash
python poster_downloader.py --input films.xlsx --output ./poster_assets
``

Automatically accept the top match (use only after reviewing dry-run output):
```bash
python poster_downloader.py --input films.xlsx --output ./poster_assets --yes
``

For an Excel sheet other than the first:
```bash
python poster_downloader.py --input films.xlsx --sheet "FILMS & CHARACTERS"
``

## Notes
- This downloads poster images from TMDb's image CDN, not from Google Images.
- Metadata and images remain subject to TMDb's terms, attribution policy, and each poster's copyright.
- The utility does not bypass logins, paywalls, rate limits, or access controls.
- Review matches carefully, especially alternate titles, remakes, unreleased titles, and films with multiple poster editions.
- Output is local. It does not upload images to GitHub automatically; review licensing and file sizes before adding artwork to a public repository.
