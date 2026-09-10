# CUP.KW

Kuwait's tumbler, built to your spec. A storefront for the CODED × Moudhi
vacuum tumbler — with a real-time 3D configurator, a punchcard engraving
machine, and a bilingual EN/AR interface.

## The product this is built around

A straight-wall matte navy vacuum tumbler. Threaded lid, centre straw port,
colour-matched reusable straw. Down the front: a boxed `CODED` mark, a field of
punched dots, and a `[ NAME ]` plate at the foot. Geometry, proportions and
colours in this repo are taken from photographs of the real article — see
`src/lib/config.ts` for the millimetres.

## The Engraving Machine

The dot field is a punchcard, and it is the heart of the customiser. Five things
can run through it (`src/lib/punchcard.ts`):

| Mode | What it does |
| --- | --- |
| **Grid** | The field as manufactured — a plain, uniform punched grid. |
| **Name** | A name up to 10 characters, rendered through a 5×7 dot-matrix font as upright glyphs stacked top to bottom. The `[ NAME ]` plate follows. |
| **Sigil** | A mirror-symmetric mark derived deterministically from the name's FNV-1a hash. One name, one mark, forever. |
| **Life** | Conway's Game of Life seeded from the name and run on a torus. Any generation can be frozen and kept — and it animates live on the 3D model. |
| **Draw** | The customer punches the 9-wide grid by hand. |

Every name also stamps a four-hex-digit *sigil code* (`RETAJ` → `BE87`).

Engraving is Latin-only (`A–Z`, `0–9`, `& . -`): a 5×7 matrix cannot render
connected Arabic script legibly. The rest of the interface is fully bilingual.

## Everything else

- **Thermochromic shell** — 20 colours, each with a cold and a hot shift target.
  The change runs full at the base and fades at the lip, because that is where
  the liquid touches the wall. Cold adds condensation; hot adds a warm bloom.
- **Pedazl** — crystals traced stone by stone over text, initials or an uploaded
  image. The source is rasterised to a mask, then a hex grid is walked over it
  and a faceted round-cut stone set wherever it lands on ink. Ten stone colours,
  variable density, set on the back panel.
- **Three sizes** — 450 ml, 750 ml and 1 litre at 6 / 9 / 11 KD, with real
  millimetres driving both the 3D geometry and the to-scale silhouettes.
- **Exploded view** — nine labelled components, with four camera presets.
- **CODED × Moudhi box** — 8.500 KD, a four-day countdown, and five café
  vouchers. Fixed colourway, not customisable.
- **Accounts and community** — real sign-up and login.

## Running it

```bash
npm install
npm run dev
```

## Configuration

Everything works with no environment variables at all — auth falls back to a
browser-local account store, and the drop countdown runs four days from a
visitor's first look. To wire up the real services:

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Switches auth to Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required alongside the URL. |
| `NEXT_PUBLIC_DROP_DEADLINE` | Pins the collab-box countdown to a fixed date, e.g. `2026-09-30T21:00:00Z`. |

Community sign-ups are written to a `community_members` table when Supabase is
configured; a missing table is tolerated rather than shown to the customer.

## Notes

- **Partner logos** live in `public/partners/`. Four are in place; `saysaco.png`
  is still missing, and `PartnerLogo` renders a brand-coloured wordmark for any
  file that is not there — so dropping the PNG in is the only step needed.
- **Fonts** are self-hosted from the `@fontsource` packages in `node_modules`
  via `next/font/local`, so no third-party font CDN is ever called at runtime.
- **The 3D model** is generated geometry (lathe + cylinder primitives), not a
  loaded mesh, so it re-colours and re-proportions instantly and ships no asset.
  Shell, punchcard decal and Pedazl decal are three separate canvas textures.

## Stack

Next.js 16 (App Router) · React 19 · Three.js via react-three-fiber and drei ·
Tailwind CSS 4 · Supabase · TypeScript
