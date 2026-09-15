# SpaceX Mission Intelligence & Data Observatory

An aerospace data intelligence application built around one idea: **the vehicle is the
navigation.** Hovering arms it, dragging rotates it into a different annotation set, and
clicking ignites a traversal where altitude selects the data layer — MISSION, BOOSTER,
PAYLOAD, ORBIT, OUTCOME. Stage separation fires at the BOOSTER layer, because that is the
moment the view hands over from the vehicle to the core.

Every figure on every screen is traceable to the payload it came from.

## Read this first: the SpaceX API is dead

`api.spacexdata.com` — the source nearly every SpaceX side-project was built on — was
**archived on 6 June 2026** and its origin now returns TLS 525. It had already been frozen
in maintenance-only mode since 2024, adding no new launches. Anything hard-wired to it
today ships broken.

This project therefore runs on **[Launch Library 2](https://thespacedevs.com/llapi)**
(free, no API key, actively maintained) and keeps the archived SpaceX API in the connector
registry as a declared-dead source, so **10 — System Status** can *explain* the situation
rather than silently showing nothing.

That is the whole argument for the ingestion layer: because the primary source died, a
modular connector boundary was the difference between a one-line change and a rewrite.

## Running it

```bash
npm install
npm run ingest -- --fixture   # synthetic data, flagged as such — no network needed
npm run dev                   # http://localhost:5173
```

For real data:

```bash
npm run ingest                # last ~8 years of SpaceX launches
npm run ingest -- --days 3650 # a decade
npm run ingest -- --dev       # dev mirror: no rate limit, stale data
```

**Rate limit:** Launch Library 2 allows 15 calls/hour/IP anonymously. One call returns 100
launches, so a decade costs 3–4 calls. Use `--dev` while experimenting — it is unmetered,
serves a frozen dataset, and the UI labels it `STALE` so it cannot be mistaken for live.

The ingest CLI writes `public/snapshot.json`. The app fetches that at boot, so **re-ingesting
needs no rebuild** — run it, refresh the browser, new data.

### About the shipped fixture

The repository ships with synthetic records so the interface runs before you fetch anything.
They are flagged at every level: `is_live: false`, every field stamped `fixture`, a permanent
banner, and `FIXTURE DATA` in the header. Rocket and pad names are real because they are
facts; dates, outcomes and booster assignments are generated. Mission names carry the word
FIXTURE. **Run `npm run ingest` before showing this to anyone.**

## Architecture

```
DATA SOURCES → CONNECTORS → NORMALIZATION → VALIDATION → CACHE
                                                           ↓
                            UI ← VISUALIZATION ← ANALYTICS ┘
```

| Layer | File | Responsibility |
| --- | --- | --- |
| Types | `src/lib/types.ts` | Domain entities, `RecordEnvelope`, `DataStatus` |
| Connectors | `src/lib/connectors.ts` | One file per upstream API. No React, no caching |
| Normalization | `src/lib/pipeline.ts` | Raw payload → typed entity + per-field quality |
| Validation | `src/lib/pipeline.ts` | Drops only what cannot be placed on an axis |
| Cache | `public/snapshot.json` | Written by the CLI, fetched once at boot |
| Analytics | `src/lib/analytics.ts` | Pure functions; every metric returns its lineage |
| Visualization | `src/components/` | Hand-built SVG + Canvas |
| UI | `src/sections/` | Ten sections, code-split |

**Adding a source** means adding a file to `connectors.ts` and one entry in `CONNECTORS`.
Nothing else changes.

### Why SVG and Canvas rather than Three.js

The brief said *"do not force everything into 3D — use 3D where it creates meaningful
interaction."* A NASA-style technical cutaway, annotated and drag-rotatable, reads as
**engineering**. A mediocre WebGL model reads as **gaming**, which the brief ruled out. It
is also ~400 KB lighter, runs on any GPU, and degrades cleanly. Canvas handles the particle
systems, where it earns its place.

The vehicle is drawn to real proportions — 70 m × 3.7 m, roughly 19:1 — not the stubby
proportions most rocket illustrations use.

## Sections

| | | |
| --- | --- | --- |
| 01 | Mission Control | Interactive vehicle, live metric grid, per-metric lineage |
| 02 | Launch Database | Synchronous multi-filter search, mission dossier |
| 03 | Live / Upcoming | Countdown **only** when a future NET exists |
| 04 | Rocket Lab | Drag-rotate technical inspection, four annotation faces |
| 05 | Booster Reuse | Lifecycle rings, flight selection, two-core comparison |
| 06 | Payload Intelligence | Node-link graph: vehicle → mission → payload → orbit |
| 07 | Launch Sites | Coordinate graticule — explicitly not a map |
| 08 | Mission Analytics | Cadence, success rate, reuse, turnaround, utilisation |
| 09 | Data Explorer | Raw / normalized / quality / schema + lineage + pipeline report |
| 10 | System Status | Source health, degradation policy, decommissioned sources |

## The honesty rules

These are enforced in code, not left to discipline:

- **A missing field is `null` with quality `missing`** — rendered as `NOT PROVIDED`. Never
  `0`, never an empty cell, never a plausible-looking guess. Even for famous numbers.
- **Success rate excludes unresolved launches from the denominator**, and says so next to
  the figure. Counting scheduled or unknown launches as either result would flatter it.
- **No countdown without a future NET timestamp.** Otherwise: `COUNTDOWN DATA UNAVAILABLE`,
  with the reason.
- **No fabricated telemetry events.** The mission timeline shows window open, NET, window
  close, landing and outcome — because those are the only events in the record. There is no
  MAX-Q, no staging time, no deployment time.
- **A failure never gets a cause it was not given.** `CAUSE NOT PROVIDED`.
- **Derived values are labelled `derived`** with the formula recorded and shown.
- **Booster flight counts are scoped to the ingest window**, and the page says so rather
  than implying a complete service history.
- **The launch-site view is a graticule, not a map** — no invented coastlines.
- **Payload mass is absent for nearly every row** because LL2 has no per-payload collection.
  The page states this and publishes no aggregate mass, rather than summing a mostly-absent
  column into a confident-looking number.

Charts follow the same discipline: zero-based value axes that say so, every tick labelled,
every panel naming the row count behind it.

## Keyboard

| Key | Action |
| --- | --- |
| `⌘K` / `Ctrl+K` | Mission Command palette |
| `/` | Focus search |
| `L` | Latest launch |
| `U` | Upcoming |
| `F` | Focus filters |
| `↑` `↓` | Step ascent layers |
| `Space` | Hold / resume ascent |
| `Esc` | Close overlay |

## Performance

- Sections are code-split; the main chunk is ~86 KB gzipped.
- The snapshot is a static asset, so the bundle does not grow with the dataset.
- Particle budget is adaptive — the loop measures its own frame cost and sheds particles
  rather than dragging the interface down. Lower budget on mobile.
- `prefers-reduced-motion` renders a single static frame and stops the loop.
- The UI makes **zero API calls at runtime**. There is no loading state to get wrong.

## Stack

React 19 · TypeScript (strict, `noUncheckedIndexedAccess`) · Vite 7 · React Router 7.
No chart library, no animation library, no UI kit.

```bash
npm run typecheck   # tsc --noEmit
npm run build       # typecheck + production build
```
