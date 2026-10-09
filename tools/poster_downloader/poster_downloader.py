#!/usr/bin/env python3
"""Review-first TMDb poster downloader for the AsokaToBooda film archive."""
from __future__ import annotations

import argparse
import csv
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin

import requests

API_BASE = "https://api.themoviedb.org/3"
IMAGE_BASE = "https://image.tmdb.org/t/p/"
HEADERS = {"User-Agent": "AsokaToBooda-PosterArchive/1.0 (personal archival research)"}


def slugify(value: str) -> str:
    value = re.sub(r"[<>:\"/\\|?*\x00-\x1f]", "", str(value or ""))
    value = re.sub(r"\s+", "_", value.strip())
    value = re.sub(r"_+", "_", value)
    return value.strip("._") or "Unsorted"


def normalized(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower())


def read_rows(path: Path, sheet: str | None):
    if path.suffix.lower() == ".csv":
        with path.open("r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            return list(reader), list(reader.fieldnames or [])
    if path.suffix.lower() in {".xlsx", ".xlsm"}:
        try:
            from openpyxl import load_workbook
        except ImportError:
            raise SystemExit("Install dependencies first: python -m pip install -r requirements.txt")
        wb = load_workbook(path, read_only=True, data_only=True)
        ws = wb[sheet] if sheet else wb[wb.sheetnames[0]]
        iterator = ws.iter_rows(values_only=True)
        headers = [str(v).strip() if v is not None else "" for v in next(iterator, [])]
        rows = []
        for values in iterator:
            rows.append({headers[i]: values[i] for i in range(min(len(headers), len(values))) if headers[i]})
        return rows, headers
    raise SystemExit("Input must be .csv, .xlsx, or .xlsm")


def find_col(headers, requested, aliases):
    if requested:
        for h in headers:
            if h.lower().strip() == requested.lower().strip():
                return h
        raise SystemExit(f"Column not found: {requested}. Available: {headers}")
    lookup = {normalized(h): h for h in headers}
    for alias in aliases:
        if normalized(alias) in lookup:
            return lookup[normalized(alias)]
    return None


def tmdb_get(session, endpoint, params, api_key):
    params = dict(params)
    params["api_key"] = api_key
    response = session.get(f"{API_BASE}/{endpoint.lstrip('/')}", params=params, headers=HEADERS, timeout=30)
    if response.status_code == 429:
        time.sleep(2)
        response = session.get(f"{API_BASE}/{endpoint.lstrip('/')}", params=params, headers=HEADERS, timeout=30)
    response.raise_for_status()
    return response.json()


def choose_result(results, title, year):
    if not results:
        return None
    # TMDb relevance ordering is primary; year agreement nudges a result upward.
    target_year = str(year or "").strip()[:4]
    def score(item):
        date = str(item.get("release_date") or "")
        year_match = bool(target_year and date.startswith(target_year))
        return (1 if year_match else 0, float(item.get("popularity") or 0))
    return sorted(results, key=score, reverse=True)[0]


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input", required=True, help="CSV or Excel file containing film titles")
    ap.add_argument("--sheet", help="Excel worksheet name; defaults to first sheet")
    ap.add_argument("--output", default="./poster_assets", help="Output root folder")
    ap.add_argument("--title-column", help="Override title column")
    ap.add_argument("--year-column", help="Override release-year column")
    ap.add_argument("--folder-column", help="Override destination-folder column")
    ap.add_argument("--size", default="w500", choices=["w185", "w342", "w500", "w780", "original"])
    ap.add_argument("--dry-run", action="store_true", help="Search and show matches, but do not download")
    ap.add_argument("--yes", action="store_true", help="Accept top match without asking (review dry-run first)")
    ap.add_argument("--limit", type=int, help="Process at most N rows")
    args = ap.parse_args()

    api_key = os.environ.get("TMDB_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("TMDB_API_KEY is missing. Set it in your terminal; never put it in this script or GitHub.")
    source = Path(args.input).expanduser()
    if not source.exists():
        raise SystemExit(f"Input file not found: {source}")
    rows, headers = read_rows(source, args.sheet)
    title_col = find_col(headers, args.title_column, ["Movie Name", "Movie", "Film", "Title", "Movie/Product Name"])
    year_col = find_col(headers, args.year_column, ["Year", "Release Year", "Release Date", "Release"])
    folder_col = find_col(headers, args.folder_column, ["GitHub Character Folder", "Character Folder", "Folder", "GitHub Folder"])
    if not title_col:
        raise SystemExit(f"Could not identify a title column. Available columns: {headers}")

    outroot = Path(args.output).expanduser()
    outroot.mkdir(parents=True, exist_ok=True)
    manifest_path = outroot / "poster_manifest.csv"
    existing = {}
    if manifest_path.exists():
        with manifest_path.open("r", encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                existing[row.get("input_title", "")] = row

    fields = ["input_title", "year", "tmdb_id", "matched_title", "release_date", "character_folder",
              "local_file", "tmdb_page", "image_source_url", "status", "notes"]
    session = requests.Session()
    processed = 0
    with manifest_path.open("a", encoding="utf-8", newline="") as mf:
        writer = csv.DictWriter(mf, fieldnames=fields)
        if mf.tell() == 0:
            writer.writeheader()
        for row in rows:
            raw_title = str(row.get(title_col) or "").strip()
            if not raw_title:
                continue
            year_value = str(row.get(year_col) or "").strip() if year_col else ""
            year = year_value[:4] if year_value else ""
            folder_value = str(row.get(folder_col) or "").strip() if folder_col else ""
            folder = slugify(folder_value or raw_title)
            if raw_title in existing:
                print(f"SKIP already in manifest: {raw_title}")
                continue
            params = {"query": raw_title, "include_adult": "false"}
            if year.isdigit() and len(year) == 4:
                params["year"] = year
            try:
                data = tmdb_get(session, "search/movie", params, api_key)
                results = data.get("results", [])
                best = choose_result(results, raw_title, year)
                if not best:
                    print(f"NO MATCH: {raw_title} ({year or 'year unknown'})")
                    writer.writerow(dict(input_title=raw_title, year=year, character_folder=folder,
                                         status="no_match", notes="No TMDb search result"))
                    mf.flush()
                    continue
                date = best.get("release_date") or ""
                poster_path = best.get("poster_path") or ""
                print(f"\nInput: {raw_title} ({year or 'year?'})")
                print(f"TMDb match: {best.get('title')} ({date[:4] or 'year unknown'})")
                print(f"TMDb ID: {best.get('id')} | Poster available: {'yes' if poster_path else 'no'}")
                if args.dry_run:
                    print("DRY RUN — no file saved")
                    continue
                if not args.yes:
                    answer = input("Accept this match and download? [y/N/q] ").strip().lower()
                    if answer == "q":
                        break
                    if answer != "y":
                        writer.writerow(dict(input_title=raw_title, year=year, tmdb_id=best.get("id"),
                            matched_title=best.get("title"), release_date=date, character_folder=folder,
                            tmdb_page=f"https://www.themoviedb.org/movie/{best.get('id')}",
                            status="skipped_by_user", notes="Match not approved"))
                        mf.flush()
                        continue
                if not poster_path:
                    writer.writerow(dict(input_title=raw_title, year=year, tmdb_id=best.get("id"),
                        matched_title=best.get("title"), release_date=date, character_folder=folder,
                        tmdb_page=f"https://www.themoviedb.org/movie/{best.get('id')}",
                        status="no_poster", notes="TMDb record has no poster_path"))
                    mf.flush()
                    continue
                image_url = urljoin(IMAGE_BASE + args.size + "/", poster_path.lstrip("/"))
                dest_dir = outroot / folder
                dest_dir.mkdir(parents=True, exist_ok=True)
                dest = dest_dir / f"{slugify(raw_title)}_{year or date[:4] or 'poster'}.jpg"
                if dest.exists():
                    dest = dest_dir / f"{slugify(raw_title)}_{year or date[:4] or 'poster'}_tmdb{best.get('id')}.jpg"
                img = session.get(image_url, headers=HEADERS, timeout=45)
                img.raise_for_status()
                if not img.headers.get("content-type", "").startswith("image/"):
                    raise ValueError("TMDb image endpoint did not return an image")
                dest.write_bytes(img.content)
                writer.writerow(dict(input_title=raw_title, year=year, tmdb_id=best.get("id"),
                    matched_title=best.get("title"), release_date=date, character_folder=folder,
                    local_file=str(dest), tmdb_page=f"https://www.themoviedb.org/movie/{best.get('id')}",
                    image_source_url=image_url, status="downloaded",
                    notes="TMDb artwork; verify rights/attribution before public redistribution"))
                mf.flush()
                print(f"Saved: {dest}")
                time.sleep(0.25)
            except (requests.RequestException, ValueError, OSError) as exc:
                print(f"ERROR for {raw_title}: {exc}", file=sys.stderr)
                writer.writerow(dict(input_title=raw_title, year=year, character_folder=folder,
                                     status="error", notes=str(exc)[:500]))
                mf.flush()
            processed += 1
            if args.limit and processed >= args.limit:
                break
    print(f"\nManifest: {manifest_path}")
    print("Review the manifest and confirm licensing/attribution before committing poster files to a public repository.")


if __name__ == "__main__":
    main()
