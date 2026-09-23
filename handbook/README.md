# The Guild Translation Handbook (A5, 40 pages)

`Guild-Translation-Handbook-A5.pdf` is the print-ready handbook: A5 (148 × 210 mm), 40 pages
including covers, so it can be saddle-stitched. All fonts are embedded.

## Source

- `parts/*.html`: the pages, concatenated in filename order into `handbook.html`
- `fonts.css`, `fonts/`: self-hosted Outfit, Playfair Display, Amiri and Readex Pro (SIL OFL)
- `gloss.py`: generates `parts/06-glossary.html` from the term list inside it

## Rebuild

```sh
python3 gloss.py                         # only if you changed the glossary
NODE_PATH=$(npm root -g) node render.js  # writes handbook.html and the PDF
```

`render.js` prints each page's free space and flags any page whose content overflows.
Add `--png 5,6` to write page previews into `png/`.
