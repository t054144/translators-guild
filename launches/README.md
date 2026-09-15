# Launch Ledger

A single-file data analysis dashboard for orbital launch activity — who flies, what they fly,
how often, and how often it works.

```
launches/
  index.html          the whole dashboard: markup, styles, charts, data. Double-click it.
  fetch_launches.py   replaces the embedded data with real records from Launch Library 2
```

## Running it

Open `index.html` in any browser. No server, no internet, no build step, no dependencies.

It ships with **64 seed rows** that are clearly labelled as an illustrative sample, so every
tab renders before you fetch anything. They are not verified launch records — the orange
banner says so on every screen.

## Loading real data

```bash
python3 fetch_launches.py              # last 180 days
python3 fetch_launches.py --days 365   # a full year
python3 fetch_launches.py --dev        # dev mirror: no rate limit, stale data
python3 fetch_launches.py --csv        # also write launches_clean.csv
```

Python 3 standard library only — nothing to install.

The script fetches from [Launch Library 2](https://thespacedevs.com/llapi), cleans the records,
and rewrites the data block inside `index.html`. The file stays self-contained afterwards, and
the banner turns green to show the data is live.

**Rate limit:** the live endpoint allows 15 calls per hour per IP with no API key. Each call
fetches 100 launches, so a year of data costs about 3–4 calls. Use `--dev` while experimenting —
it has no limit, but its data is stale and the dashboard labels it as such.

## The six tabs

| Tab | What it answers |
| --- | --- |
| Overview | Headline figures, the single most important finding as a sentence, outcome split, latest launches |
| Operators | Who flies most — zero-based bar chart and a sortable table with success rates |
| Vehicles | Which rockets carry the traffic |
| Time | Launches per month, cumulative trend, and a month-by-month table |
| Quality | Where the data came from and every change made to it |
| The Story | Five beats, with every number computed live from the rows in view |

## The rules this page keeps

- Every bar and column axis starts at zero, and says so under the axis.
- Every axis is labelled, and counts are named as `launches`, rates as `%`.
- Every chart states the number of rows it was built from.
- Anything excluded is named on the Quality tab, by launch id, with the reason.
- No number is typed by hand. Every figure — including the five story paragraphs — is computed
  from the embedded rows, so filters rewrite the prose as well as the charts.
- Launches with an unconfirmed outcome are counted under *Other*, never folded into success.

## Cleaning

`fetch_launches.py` builds the Quality tab's log from what it actually did, rather than from a
written description. It records duplicate launch ids, records with no usable date, launches
outside the requested window, long operator names shortened to fit an axis, unrecognised outcome
codes, and missing orbits — each with a row count and a real example from the file.

Two choices worth defending if anyone asks:

- **Missing orbit is labelled `Unknown`, not dropped.** The launch still happened; only one
  field is missing, and dropping the row would understate every operator's count.
- **Unrecognised outcome codes become `Unknown` rather than being guessed.** Success rate is
  always a share of *attempts in view*, never a share of attempts with a known result — which
  would quietly flatter every operator.

## Data source

[Launch Library 2](https://thespacedevs.com/llapi) by The Space Devs — free, no API key,
community maintained. Endpoint: `https://ll.thespacedevs.com/2.3.0/launches/`
