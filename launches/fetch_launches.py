#!/usr/bin/env python3
"""
Fill Launch Ledger with real launch records.

Pulls orbital launch attempts from Launch Library 2 (The Space Devs), cleans them,
writes an honest cleaning log, and rewrites the embedded data block inside
index.html so the dashboard stays a single self-contained file.

    python3 fetch_launches.py                 # last 180 days, live API
    python3 fetch_launches.py --days 365      # a full year
    python3 fetch_launches.py --dev           # dev mirror, no rate limit, stale data
    python3 fetch_launches.py --csv           # also save the clean rows as CSV

Launch Library 2 is free and needs no API key. The live endpoint allows
15 calls per hour per IP; each call here fetches 100 launches, so a year of
data costs roughly 3-4 calls. Use --dev while you are experimenting.

Docs: https://thespacedevs.com/llapi
"""

import argparse
import csv
import datetime as dt
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter

LIVE = "https://ll.thespacedevs.com/2.3.0/launches/"
DEV = "https://lldev.thespacedevs.com/2.3.0/launches/"
PAGE = 100
UA = "LaunchLedger/1.0 (student data project; single-file dashboard)"

# Long agency names are unreadable on a bar chart axis. Shortening is a real
# edit to the data, so it is counted and reported in the cleaning log.
SHORT = {
    "China Aerospace Science and Technology Corporation": "CASC",
    "China Aerospace Science and Industry Corporation": "CASIC",
    "National Aeronautics and Space Administration": "NASA",
    "Indian Space Research Organization": "ISRO",
    "Indian Space Research Organisation": "ISRO",
    "Russian Federal Space Agency (ROSCOSMOS)": "Roscosmos",
    "Mitsubishi Heavy Industries": "MHI",
    "Japan Aerospace Exploration Agency": "JAXA",
    "United Launch Alliance": "ULA",
    "Northrop Grumman Innovation Systems": "Northrop Grumman",
    "Eurockot Launch Services": "Eurockot",
    "Expace Technology Co., Ltd.": "Expace",
    "Beijing Interstellar Glory Space Technology Ltd.": "iSpace",
    "Galactic Energy(Beijing)Space Technology": "Galactic Energy",
}

STATUS = {
    "success": "Success",
    "launch successful": "Success",
    "failure": "Failure",
    "launch failure": "Failure",
    "partial failure": "Partial Failure",
    "launch was a partial failure": "Partial Failure",
    "go": "Scheduled",
    "go for launch": "Scheduled",
    "tbd": "Scheduled",
    "to be determined": "Scheduled",
    "tbc": "Scheduled",
    "to be confirmed": "Scheduled",
    "hold": "Scheduled",
    "on hold": "Scheduled",
    "in flight": "Scheduled",
    "launch in flight": "Scheduled",
}


def dig(obj, *path, default=None):
    """Walk a nested dict safely. LL2 renamed fields between 2.2 and 2.3."""
    cur = obj
    for key in path:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(key)
        if cur is None:
            return default
    return cur


def fetch(base, start, end, cap, pause):
    """Page through the API until the window is exhausted or cap is reached."""
    rows, offset = [], 0
    while len(rows) < cap:
        query = urllib.parse.urlencode(
            {
                "net__gte": start.isoformat(),
                "net__lte": end.isoformat(),
                "limit": min(PAGE, cap - len(rows)),
                "offset": offset,
                "ordering": "net",
            }
        )
        url = f"{base}?{query}"
        print(f"  GET offset={offset} ...", end="", flush=True)
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                payload = json.load(resp)
        except urllib.error.HTTPError as exc:
            if exc.code == 429:
                sys.exit(
                    "\n\nRate limited (429). The live endpoint allows 15 calls per hour per IP.\n"
                    "Wait an hour, or re-run with --dev to use the no-limit dev mirror."
                )
            sys.exit(f"\n\nHTTP {exc.code} from the API: {exc.reason}")
        except urllib.error.URLError as exc:
            sys.exit(f"\n\nCould not reach {base} -- {exc.reason}")

        batch = payload.get("results", [])
        rows.extend(batch)
        print(f" {len(batch)} records (total {len(rows)})")
        if not payload.get("next") or not batch:
            break
        offset += len(batch)
        time.sleep(pause)
    return rows


def clean(raw, start, end):
    """Normalise the records and build the cleaning log as we go."""
    log, excluded, out = [], [], []
    seen = set()
    counts = Counter()
    example = {}

    def note(tag, row_name):
        counts[tag] += 1
        example.setdefault(tag, row_name)

    for rec in raw:
        name = re.sub(r"\s+", " ", (rec.get("name") or "Unnamed launch")).strip()
        lid = rec.get("id") or name

        net = rec.get("net") or rec.get("window_start")
        if not net:
            excluded.append({"id": str(lid), "name": name, "reason": "No launch date in the record"})
            note("nodate", name)
            continue

        day = net[:10]
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", day):
            excluded.append({"id": str(lid), "name": name, "reason": f"Unparseable date {net!r}"})
            note("baddate", name)
            continue

        if not (start.isoformat() <= day <= end.isoformat()):
            excluded.append({"id": str(lid), "name": name, "reason": f"Date {day} falls outside the requested window"})
            note("window", name)
            continue

        if lid in seen:
            excluded.append({"id": str(lid), "name": name, "reason": "Duplicate launch id already in the file"})
            note("dupe", name)
            continue
        seen.add(lid)

        provider = (
            dig(rec, "launch_service_provider", "name")
            or dig(rec, "launch_service_provider", "abbrev")
            or "Unknown operator"
        )
        provider = re.sub(r"\s+", " ", provider).strip()
        if provider in SHORT:
            note("shortened", f"{provider} -> {SHORT[provider]}")
            provider = SHORT[provider]

        rocket = (
            dig(rec, "rocket", "configuration", "name")
            or dig(rec, "rocket", "configuration", "full_name")
            or "Unknown vehicle"
        )
        rocket = re.sub(r"\s+", " ", rocket).strip()

        raw_status = (
            dig(rec, "status", "abbrev") or dig(rec, "status", "name") or ""
        ).strip()
        status = STATUS.get(raw_status.lower())
        if status is None:
            status = "Unknown"
            if raw_status:
                note("status", f"{name} -- status {raw_status!r}")

        orbit = dig(rec, "mission", "orbit", "name")
        if not orbit:
            orbit = "Unknown"
            note("orbit", name)

        country = (
            dig(rec, "pad", "country", "name")
            or dig(rec, "pad", "location", "country", "name")
            or dig(rec, "pad", "location", "country_code")
            or "Unknown"
        )

        out.append(
            {
                "i": str(lid)[:8],
                "n": name,
                "d": day,
                "p": provider,
                "r": rocket,
                "s": status,
                "o": orbit,
                "c": country,
            }
        )

    entries = [
        ("nodate", "Records with no launch date", "Dropped. A launch with no date cannot appear on any time axis."),
        ("baddate", "Unparseable date value", "Dropped rather than guessed. Inventing a date would put a fake bar on the time chart."),
        ("window", "Launch outside the requested window", "Dropped. The API returns a few edge records either side of the range."),
        ("dupe", "Duplicate launch id", "Kept the first occurrence only, so no launch is counted twice."),
        ("shortened", "Operator name too long to read on an axis", "Shortened to its common abbreviation. Launch counts are unchanged."),
        ("status", "Outcome code the mapping did not recognise", "Filed as Unknown and counted under Other. Never folded into the success figure."),
        ("orbit", "Missing target orbit", "Labelled Unknown rather than dropped. The launch still happened."),
    ]
    for tag, issue, action in entries:
        if counts[tag]:
            log.append({"issue": issue, "action": action, "rows": counts[tag], "example": example[tag]})

    if not log:
        log.append(
            {
                "issue": "Nothing to fix",
                "action": "Every record arrived with a usable date, operator, vehicle and outcome.",
                "rows": 0,
                "example": "--",
            }
        )
    return out, log, excluded


def write_html(path, payload):
    html = open(path, encoding="utf-8").read()
    pattern = re.compile(
        r'(<script id="dataset" type="application/json">)(.*?)(</script>)', re.DOTALL
    )
    if not pattern.search(html):
        sys.exit(f"Could not find the data block in {path}. Was the file edited?")
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    open(path, "w", encoding="utf-8").write(pattern.sub(lambda m: m.group(1) + "\n" + body + "\n" + m.group(3), html, count=1))


def main():
    ap = argparse.ArgumentParser(description="Load real launch data into Launch Ledger.")
    ap.add_argument("--days", type=int, default=180, help="how far back to look (default 180)")
    ap.add_argument("--max", type=int, default=600, help="maximum launches to keep (default 600)")
    ap.add_argument("--dev", action="store_true", help="use the dev mirror: no rate limit, stale data")
    ap.add_argument("--html", default="index.html", help="dashboard file to rewrite")
    ap.add_argument("--csv", action="store_true", help="also save launches_clean.csv")
    ap.add_argument("--pause", type=float, default=1.5, help="seconds between API calls")
    args = ap.parse_args()

    end = dt.date.today()
    start = end - dt.timedelta(days=args.days)
    base = DEV if args.dev else LIVE

    print(f"\nLaunch Ledger loader")
    print(f"  window   {start} -> {end}  ({args.days} days)")
    print(f"  endpoint {base}{'  [dev mirror: stale data]' if args.dev else ''}\n")

    raw = fetch(base, start, end, args.max, args.pause)
    if not raw:
        sys.exit("\nThe API returned no launches for that window. Try a longer --days.")

    rows, log, excluded = clean(raw, start, end)
    if not rows:
        sys.exit("\nEvery record was dropped during cleaning. Nothing to write.")

    payload = {
        "meta": {
            "provenance": "live",
            "source": "Launch Library 2 (The Space Devs)" + (" -- DEV MIRROR, stale data" if args.dev else ""),
            "source_url": base,
            "fetched_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
            "window": {"from": min(r["d"] for r in rows), "to": max(r["d"] for r in rows)},
            "raw_rows": len(raw),
            "kept_rows": len(rows),
            "quality": log,
            "excluded": excluded,
        },
        "rows": rows,
    }

    write_html(args.html, payload)

    if args.csv:
        with open("launches_clean.csv", "w", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            w.writerow(["id", "name", "date", "operator", "vehicle", "outcome", "orbit", "country"])
            for r in rows:
                w.writerow([r["i"], r["n"], r["d"], r["p"], r["r"], r["s"], r["o"], r["c"]])
        print("  wrote launches_clean.csv")

    ops = Counter(r["p"] for r in rows)
    top, top_n = ops.most_common(1)[0]
    ok = sum(1 for r in rows if r["s"] == "Success")

    print(f"\n  received {len(raw)} records, kept {len(rows)}, dropped {len(raw) - len(rows)}")
    print(f"  {len(ops)} operators, busiest is {top} with {top_n} launches ({top_n / len(rows) * 100:.1f}%)")
    print(f"  {ok} of {len(rows)} succeeded ({ok / len(rows) * 100:.1f}%)")
    print(f"  cleaning log has {len(log)} entr{'y' if len(log) == 1 else 'ies'}")
    print(f"\n  {args.html} updated. Open it in a browser.\n")


if __name__ == "__main__":
    main()
