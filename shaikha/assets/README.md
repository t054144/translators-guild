# Images

Drop image files in this folder using the exact filenames below. Nothing else
needs changing — each slide picks its image up automatically and switches to a
two-column layout (bullets left, picture right).

If a file is not here, that slide simply stays text-only. It never shows a
broken image or an empty placeholder box, so the deck is always safe to
present as-is.

| Slide | File | What it is |
|---|---|---|
| 02 What I Study | `slide-02.jpg` | optional — IPA chart, phonetics, notes |
| 03 Where I Want to Go | `slide-03.jpg` | optional — UN hall / interpreting booth |
| 04 Things I Like | `slide-04.jpg` | optional |
| 05 Things That Shaped Me | `bidoun-waraq.jpg` | بدون ورق |
| 05 | `fnjan.jpg` | فنجان |
| 05 | `nayef-bin-nahar.jpg` | د. نايف بن نهار |
| 05 | `yasser-alhuzaimi.jpg` | أ. ياسر الحزيمي |
| 06 Arabic Poetry | `badr-bin-abdulmohsen.jpg` | بدر بن عبدالمحسن |
| 07 Beyond Language | `slide-07.jpg` | optional — code, terminal |
| 08 A Few Things About Me | `slide-08.jpg` | optional |

Notes
- Filenames must end in `.jpg`. If yours are `.png`, either rename them or
  change the matching `data-src` in `../index.html`.
- Landscape or square works best. Slide 05 places its images in a 2x2 grid;
  whichever ones are missing are dropped and the rest fill the space.
- Images are shown slightly desaturated to match the deck. The original files
  are never modified.

## Presenting

- Arrow keys, space, or Page Up / Page Down move between slides
- `F` toggles fullscreen
- `Home` / `End` jump to the first or last slide
