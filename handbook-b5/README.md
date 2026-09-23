# Translation Handbook (B5, 44 pages)

`Translation-Team-Handbook-B5.pdf` is the print-ready handbook for beginners: B5 (176 × 250 mm), 44 pages, with all fonts embedded.

- `parts/*.html`: the page source, concatenated in filename order
- `gloss.py`: regenerates `parts/09-gloss.html` from its term list
- Rebuild: `NODE_PATH=$(npm root -g) node render.js` (add `--png 5,6` to write page previews)

`render.js` fills in all page numbers in the contents, glossary and cross-references, and it flags any page that overflows.
