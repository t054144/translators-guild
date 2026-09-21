# Images

Drop files in this folder using the exact filenames below. Nothing else needs
changing. If a file is not here, that part of the site simply leaves it out —
no broken image, no empty frame, no substitute — so the site is always safe to
show as it stands.

## Photographs of people (use your own originals only)

| File | Where it appears |
|---|---|
| `nayef-bin-nahar.jpg` | Things I Like → Podcasts reveal |
| `yasser-alhuzaimi.jpg` | Things I Like → Podcasts reveal |
| `badr-bin-abdulmohsen.jpg` | Things I Like → Arabic Poetry reveal |

Names already sit beneath each photograph. Portraits read best around 4:5.

## Atmosphere images (all optional)

| File | Slide |
|---|---|
| `slide-02.jpg` | What I Study |
| `slide-03.jpg` | My Aims |
| `slide-05.jpg` | Things That Shaped Me |
| `slide-06.jpg` | Beyond Language |
| `slide-07.jpg` | A Few Things About Me |

When one of these is present the slide splits into text on the left and the
picture on the right; when it is absent the slide stays text-only.

## Books

The Books reveal is driven by a list at the top of the `<script>` in
`../index.html`:

    var BOOKS = [
      { title:'...', author:'...', cover:'assets/book-1.jpg' },
    ];

While the list is empty, BOOKS stays a plain label rather than something that
opens, so it can never open onto an empty panel. Add one entry and it becomes
interactive on its own. `cover` is optional — the title and author still show
without it. Covers read best at 2:3.

## How the site works

Nine sections, scrolled or stepped through:

01 Introduction · 02 What I Study · 03 My Aims · 04 Things I Like ·
05 Things That Shaped Me · 06 Beyond Language · 07 A Few Things About Me ·
08 Principles I Live By · 09 Still Becoming

**Things I Like** is one scene, not three. Books, Podcasts and Arabic Poetry
open as reveals layered over that same scene, and the background shifts with
each one. Close with the × , the Escape key, or by tapping the empty area.
Leaving the section closes whatever is open.

- Arrow keys, space, Page Up / Page Down move between sections
- `F` fullscreen, `Home` / `End` first or last
