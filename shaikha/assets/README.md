# Images

Drop image files in this folder using the exact filenames below. Each slide
picks its image up automatically and switches to a two-column layout: bullet
points on the left, picture on the right.

If a file is not here, that slide simply stays text-only. It never shows a
broken image or an empty placeholder box, so the deck is always safe to
present as it stands.

| Slide | File | What it is |
|---|---|---|
| 02 What I Study | `slide-02.jpg` | optional — IPA chart, spectrogram, notes |
| 03 Where I Am Headed | `slide-03.jpg` | optional — UN hall, interpreting booth |
| 04 Things I Like | `bidoun-waraq.jpg` | Bidoun Waraq |
| 04 | `finjan.jpg` | Finjan |
| 04 | `nayef-bin-nahar.jpg` | Dr. Nayef bin Nahar |
| 04 | `yasser-alhuzaimi.jpg` | Yasser Al-Huzaimi |
| 05 Arabic Poetry | `badr-bin-abdulmohsen.jpg` | Badr bin Abdulmohsen |
| 06 Beyond Language | `slide-06.jpg` | optional — code, terminal |
| 07 Fun Things About Me | `slide-07.jpg` | optional |

Notes
- Filenames must end in `.jpg`. If yours are `.png`, either rename them or
  change the matching `data-src` in `../index.html`.
- Landscape or square works best. Slide 04 places its four images in a 2x2
  grid; whichever are missing are dropped and the rest fill the space.
- Images are shown slightly desaturated to match the deck. The original files
  are never modified.

## The "Fun Things About Me" slide

It is in `../index.html` but deliberately empty, so it stays out of the deck
until it is yours. Add your own bullets inside its `<ul>`:

    <li>Something you do</li>
    <li>Something else
      <span class="sub">A short line underneath, if you want one.</span>
    </li>

The slide switches itself on as soon as there is at least one `<li>`, and the
slide numbers and the counter renumber themselves.

## Presenting

- Arrow keys, space, or Page Up / Page Down move between slides
- `F` toggles fullscreen
- `Home` / `End` jump to the first or last slide

## Things I Like — the three collections

Podcasts, Arabic Poetry and Books are each their own section now, and each is
built from a list at the top of the `<script>` in `../index.html`. Paste your
entries into the matching list and the slide fills itself in; the slide
numbers and the counter renumber themselves.

A section whose list is empty stays out of the deck entirely, so nothing
blank can be projected. Right now **Podcasts** and **Books** are empty and do
not appear; Arabic Poetry carries the three poets already dictated.

Every field except the first is optional — leave one out and it is not drawn.

    var PODCASTS = [
      { name:'', host:'', note:'', art:'assets/pod-1.jpg', url:'' },
    ];

    var POETS = [
      { poet:'', epithet:'', work:'', excerpt:'', note:'',
        portrait:'assets/badr-bin-abdulmohsen.jpg' },
    ];

    var BOOKS = [
      { title:'', author:'', note:'', why:'', cover:'assets/book-1.jpg' },
    ];

- `ar:true` on a podcast or book marks an Arabic title; poets are Arabic by
  default, so use `latin:true` for one written in English.
- Podcast artwork reads best square, book covers at 2:3, portraits at 4:5.
- If an image file is missing the entry still shows, just without the picture.
