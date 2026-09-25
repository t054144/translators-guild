# Style guide for rewriting chapters of the beginner translation handbook

The reader has NEVER studied translation. The book must guide them step by step, like a patient teacher walking beside them. The model is Chapters 1 and 2 in guide/model_ch1_ch2.js: follow their voice and structure exactly.

## Chapter pattern (keep block types and order)
1. ['ch', 'Chapter N: Title'] — keep the title exactly.
2. ['intro', '…'] — rendered after the label "Where we are." Write 2–3 short sentences: connect to what the reader learned in the previous chapter(s), say what this chapter will show, and what they will be able to do by the end. No theory names here.
3. ['terms', [...]] — KEEP every entry exactly as it is (English term, Arabic, definition). The builder moves this box to the end of the chapter, so it must stay right after the intro in the source.
4. The body as numbered steps: ['h', 'Step 1: …'], ['h', 'Step 2: …'] … (3–6 steps). Step headings are plain, guiding phrases (e.g. 'Step 2: when the words do not match'). Inside each step: first show the problem with an example, then the solution; explain an idea in plain words BEFORE giving its technical name, then give the name in **bold**. A final ['h', 'Common mistakes'] section is allowed when the chapter naturally has them.
5. ['try', [...], [...]] and ['summary', [...]] — keep, lightly reword only if needed for consistency. Summary max 3 bullets.
6. Part blocks ['part', 'Part N: …'] and // comment lines: keep exactly where they are.

## Hard rules
- KEEP every example and every Arabic string {{…}} or ['ar', …] EXACTLY as written (copy-paste), including diacritics. If you believe an Arabic string is wrong, keep it and report it in your notes.
- KEEP every citation in brackets exactly, e.g. (Baker, 2018), (Newmark, 1988, p. 81), and keep each attached to its idea. Do not add sources, quotations, facts or numbers that are not already in the text. Do not name scholars in running text (citations in brackets only).
- Keep every cross-reference (Chapter N) correct.
- Plain British English, short sentences (aim ≤ 22 words), second person ("you"), warm but not chatty. No filler ("It is important to note that"), no AI-style phrases, no exclamation marks except in examples.
- Do not make the chapter longer than about 110% of its current length. Prefer merging headings to adding new ones; avoid long lists.
- Inline marks: **bold**, _italic_ (for English examples), {{Arabic}}. Use curly apostrophes ’ and quotes “ ” as in the source.
- Output must be valid JavaScript array elements (each block followed by a comma), the same format as the input.
