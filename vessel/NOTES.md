# Vessel 001 — mug site working notes

Two cuts of the same product, built to be compared and then merged.

| File | Cut | The idea |
|---|---|---|
| `index.html` | **Cinematic** | A ~9 s advertisement opening, then a scroll-driven vessel you can spin, engrave, explode and recolour. |
| `datasheet.html` | **Engineering** | The dot matrix as the only interface, a live engraving machine, and a real Newton's-law cooling curve. |

## The object, as measured from the photo and video

- Straight-walled cylinder, **no taper**. Height ≈ 2.4 × diameter.
- **Matte navy powder coat outside, bare polished 18/8 mirror bore inside.** No plastic liner.
  This contrast is the single best thing about the object and the exploded view exists to show it.
- Press-fit lid in the same matte coat, offset straw port, navy matte straw.
- Silkscreen, top to bottom: `CODED` in a stroked box → a 13 × 25 dot field (325 dots) → `[ NAME ]`.

## How the 3D works

No WebGL, no Three.js, no images. For every screen column across the vessel:

```
s  = x / r                     screen offset, normalised
θ  = asin(s)                   angle around the cylinder
u  = 0.5 + θ/2π + rotation     position on the unrolled label
y  = yTop + k·r·cos(θ)         front silhouette, k = tilt squash
```

The label is drawn once into an offscreen canvas and sampled per column, so the dots
**compress toward the silhouette** instead of sliding sideways — that is what reads as 3D.
Shading is the surface normal (`max(0, cos(θ − lightAngle))`) baked into gradient stops,
multiplied over the strips and clipped to the silhouette path.

The advertisement opening reuses the same renderer with one extra parameter: `wrap`,
lerping the mapping between flat (`u` linear in `x`) and cylindrical. At `wrap = 0` the
dot field is a flat grid; at `wrap = 1` it is wrapped on the vessel. The film animates
`0 → 1`, so the grid physically curls into the object.

## Deterministic engraving

`FNV-1a` over the letters seeds an `xorshift32` PRNG. The pattern is generated for the
left half and mirrored to the right, so it reads woven rather than noisy. Same name,
same weave, forever — which is the mechanic that makes people type their own name,
then their friend's.

## Selling patterns borrowed from the drinkware majors

- **Colour drops** — same vessel, limited finishes; how Stanley turned a steel cup into a
  collectable. Five here, with the silkscreen flipping to dark ink on the pale coats.
- **Sticky buy furniture** — price, offer, single CTA, always in reach.
- **A named lid feature** — Owala sells FreeSip as a proper noun. Ours is the press-fit
  lid and the mirror bore.
- **Retention numbers up front** — Yeti/Hydro Flask lead with hours hot / hours cold.
- **Scarcity that is actually true** — sixty made for the cohort.

The buy bar deliberately subverts the pattern: the price is struck through and reads
`Issued`, because it is not for sale. Same layout, opposite meaning.

## Still to do

- [ ] **Replace the placeholder figures.** Capacity, height, diameter and mass are
      plausible guesses. Measure the real vessel — an engineer will check, and one wrong
      number costs the whole page.
- [ ] Swap in the real `CODED` logo artwork.
- [ ] Replace the sample testimonial with a real quote from the cohort.
- [ ] The night-shift section: the actual 23:41 photo, bokeh rebuilt in CSS.
- [ ] Shared state via Supabase — a global sip counter and a persistent dot-graffiti wall.
- [ ] Per-name share links so a link preview shows that person's own vessel.
