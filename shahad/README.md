# Shahad Nawaf Alkhaldi — academic portfolio, presented

A 13-slide presentation site: an academic portfolio for Microbiology and
English, dressed in a Super Mario theme that stays in the furniture (HUD,
question blocks, coins, warp pipes) and out of the content typography.

## Running it

It is a plain static site — no build step.

```
python3 -m http.server 8099   # then open http://127.0.0.1:8099
```

## Presenting

| Key | Does |
| --- | --- |
| `→` `Space` | Next slide |
| `←` | Back |
| `Esc` | All slides / world select |
| `F` | Fullscreen |
| `M` | Sound on / off (off by default) |
| `?` | Key reminder |
| `1`–`9`, `0` | Jump to that slide |

Click anywhere to advance; the left twelfth goes back. Swipe on a phone.
Every slide has its own URL (`#volunteering`), so you can open straight
onto one.

## How it is put together

| File | What it holds |
| --- | --- |
| `js/slides.js` | All slide copy, as data. Edit the deck here. |
| `js/scene.js` | The 3D world: one camera station per slide, props built from primitives. |
| `js/app.js` | Slide rendering, navigation, section transitions. |
| `js/audio.js` | Synthesised coin and warp sounds — no audio files. |
| `css/style.css` | Everything visual that is not 3D. |
| `fonts/` | Outfit and Press Start 2P, self-hosted. |
| `vendor/` | three.js r171, self-hosted. |

Nothing is fetched from a CDN at run time, so the deck works on a
conference-room connection, or none at all.

### Changing the words

`js/slides.js` is the single source — the slide, the overview grid and the
3D motif all read from it. Each entry names a `layout` (`points`, `facts`,
`cols`, `grid2`, `closing`, `title`), an `accent` (`red` / `blue` / `green`
/ `gold`) and a `motif`, which picks the 3D props from `scene.js`.

### Accessibility and fallbacks

- `prefers-reduced-motion` drops the camera travel, the warp wipe and the
  coin bursts; the deck still navigates.
- If WebGL is unavailable the canvas is hidden and the slides run flat.
- Sound is off until the presenter turns it on.
