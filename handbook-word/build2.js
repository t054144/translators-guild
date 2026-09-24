// Builds Translation-Handbook.docx (second edition of the draft) from c2a.js and c2b.js.
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat, PageNumber, Footer,
  TableOfContents, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, Tab, TabStopType } = require('docx');

const INK = '1F1A2E', ACCENT = '3D1591', GREY = '6B6680', LINE = 'CFC9DE';
const LATIN = 'Calibri', ARABIC = 'Arial', SERIF = 'Georgia', BOX = 'ECE9F7';
const mm = x => Math.round(x * 56.7);
const PAGE_W = mm(176), MARGIN = mm(20), CONTENT_W = PAGE_W - 2 * MARGIN;

// ---------- inline text: **bold**, _italic_, {{Arabic}} ----------
function runs(text, base = {}) {
  const out = []; const re = /(\*\*[^*]+\*\*|\{\{[^}]+\}\}|(?<![A-Za-z0-9])_[^_]+_(?![A-Za-z0-9]))/g; let last = 0, m;
  const plain = t => { if (t) out.push(new TextRun({ text: t, font: LATIN, ...base })); };
  while ((m = re.exec(text))) {
    plain(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(...runs(tok.slice(2, -2), { ...base, bold: true }));
    else if (tok.startsWith('{{')) out.push(ar(tok.slice(2, -2), base));
    else out.push(...runs(tok.slice(1, -1), { ...base, italics: true }));
    last = m.index + tok.length;
  }
  plain(text.slice(last));
  return out;
}
function ar(t, o = {}) {
  return new TextRun({ text: t, rightToLeft: true, font: { ascii: ARABIC, hAnsi: ARABIC, cs: ARABIC }, size: o.size || 23, sizeComplexScript: o.size || 24, bold: o.bold, boldComplexScript: o.bold, color: o.color });
}

// ---------- blocks ----------
let inst = 0, afterPart = false, chapter = null;
const body = [], glossary = [];
const P = (children, opts = {}) => body.push(new Paragraph({ children, spacing: { after: 120, line: 290 }, ...opts }));
const shade = { type: ShadingType.CLEAR, color: 'auto', fill: BOX };
const list = (items, ref, opts = {}) => { const k = ref === 'num' ? ++inst : undefined;
  items.forEach(t => P(runs(t, opts.run), { numbering: { reference: ref, level: 0, ...(k ? { instance: k } : {}) }, spacing: { after: opts.box ? 0 : 70, line: 290 }, ...(opts.box ? { shading: shade } : {}) }));
  body.push(new Paragraph({ spacing: { after: 40 }, children: [] })); };
const H = (lvl, t, extra = {}) => body.push(new Paragraph({ heading: lvl, children: [new TextRun({ text: t })], ...extra }));
const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };

function table(head, rows, pct) {
  const widths = pct.map(x => Math.round(CONTENT_W * x / 100));
  widths[widths.length - 1] += CONTENT_W - widths.reduce((a, b) => a + b, 0);
  const cell = (t, i, hdr) => new TableCell({ width: { size: widths[i], type: WidthType.DXA },
    shading: hdr ? { type: ShadingType.CLEAR, color: 'auto', fill: 'EFEBF8' } : undefined, margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: [new Paragraph({ spacing: { after: 0, line: 260 }, children: runs(t, { size: 18, bold: hdr || undefined, color: hdr ? ACCENT : undefined }) })] });
  body.push(new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths,
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows: [new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, i, true)) }), ...rows.map(r => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false)) }))] }));
  body.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
}

// a lavender box, like the text boxes in Guild posts: a shaded title line, shaded items and a shaded closing line
function boxTitle(t) { body.push(new Paragraph({ keepNext: true, shading: shade, spacing: { before: 240, after: 0, line: 290 },
  children: [new TextRun({ text: t.toUpperCase(), bold: true, color: ACCENT, font: LATIN, size: 17, characterSpacing: 30 })] })); }
function boxEnd() { body.push(new Paragraph({ shading: shade, spacing: { after: 160, line: 120 }, children: [] })); }
function block(b) {
  const [kind, a, c, d] = b;
  switch (kind) {
    case 'front': H(HeadingLevel.HEADING_1, a, { pageBreakBefore: true }); break;
    case 'part':
      H(HeadingLevel.HEADING_1, a, { pageBreakBefore: true });
      if (c) P(runs(c, { italics: true, color: GREY }), { spacing: { after: 360, line: 290 } });
      afterPart = true; break;
    case 'ch': {
      H(HeadingLevel.HEADING_2, a, { pageBreakBefore: !afterPart }); afterPart = false;
      const m = /^Chapter (\d+)/.exec(a); chapter = m ? +m[1] : null; break;
    }
    case 'h': H(HeadingLevel.HEADING_3, a); break;
    case 'intro': P([new TextRun({ text: 'In this chapter. ', bold: true, color: ACCENT, font: LATIN }), ...runs(a)], { spacing: { after: 160, line: 290 } }); break;
    case 'terms':
      boxTitle('Key terms');
      a.forEach(([t, arab, def]) => { if (chapter) glossary.push([t, arab, def, chapter]);
        P([...runs(`**${t}**`), new TextRun({ text: ' (', font: LATIN }), ar(arab), new TextRun({ text: '): ', font: LATIN }), ...runs(def)], { numbering: { reference: 'bul', level: 0 }, spacing: { after: 0, line: 290 }, shading: shade }); });
      boxEnd(); break;
    case 'p': P(runs(a)); break;
    case 'ex': P(runs(a), { indent: { left: 567 } }); break;
    case 'ar': body.push(new Paragraph({ bidirectional: true, indent: { left: 567 }, spacing: { after: 140, line: 300 }, children: [ar(a)] })); break;
    case 'ol': list(a, 'num'); break;
    case 'ul': list(a, 'bul'); break;
    case 'check': list(a, 'box'); break;
    case 'lines': a.forEach(t => P([new TextRun({ text: t, font: LATIN }), new TextRun({ children: [new Tab()] })],
      { tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W, leader: 'underscore' }], spacing: { before: 200, after: 120 } })); break;
    case 'table': table(a, c, d); break;
    case 'try': {
      H(HeadingLevel.HEADING_3, 'Try it');
      list(a, 'num');
      P([new TextRun({ text: 'Answers', bold: true, color: GREY, font: LATIN })], { spacing: { before: 40, after: 60, line: 290 } });
      list(c, 'num', { run: { color: GREY } });
      break;
    }
    case 'summary': boxTitle('Remember'); list(a, 'bul', { box: true }); body.pop(); boxEnd(); break;
    default: throw new Error('unknown block ' + kind);
  }
}

// ---------- title page ----------
const center = (children, spacing) => body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing, children }));
const wordmark = (size, spacingBefore) => {
  const dot = c => new TextRun({ text: '●', font: 'Arial', size: Math.round(size / 1.7), color: c });
  center([new TextRun({ text: 'Guild ', font: SERIF, size, bold: true, color: ACCENT }), dot('8756C0'), dot('867EF6'), dot('CCCDFB')], { before: spacingBefore, after: 0 });
  center([new TextRun({ text: 'Translation Team', font: SERIF, size: Math.round(size / 2.6), bold: true, color: ACCENT })], { after: 40 });
  center([new TextRun({ text: 'Professional Club', font: LATIN, size: Math.round(size / 4.6), color: GREY, characterSpacing: 60 })], { after: 0 });
};
wordmark(72, 900);
body.push(new Paragraph({ spacing: { after: 1200 }, children: [] }));
center([new TextRun({ text: 'Translation Handbook', font: SERIF, size: 56, bold: true, color: INK })], { after: 200 });
center([new TextRun({ text: 'A beginner’s guide to translating between English and Arabic', font: LATIN, size: 26, italics: true, color: INK })], { after: 500 });
body.push(new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [ar('دليل الترجمة', { size: 44, bold: true, color: ACCENT })] }));
body.push(new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 2400 }, children: [ar('مرشدٌ للمبتدئين في الترجمة بين العربية والإنجليزية', { size: 26, color: INK })] }));
center([new TextRun({ text: 'First edition, 2026', font: LATIN, size: 20, color: GREY })], {});

// ---------- copyright page ----------
const small = (t, extra = {}) => P(runs(t, { size: 18, color: GREY }), { spacing: { after: 140, line: 270 }, ...extra });
small('**Translation Handbook: A Beginner’s Guide to Translating between English and Arabic**', { pageBreakBefore: true, spacing: { before: 3600, after: 140, line: 270 } });
small('First edition, 2026. Prepared by the Translation Team, Guild Professional Club, for use in the Guild Season workshops.');
small('© 2026 [Copyright holder to be confirmed]. All rights reserved. No part of this handbook may be reproduced without permission, except for short quotations with acknowledgement.');
small('Editors: [names]. Contributors: [names]. Reviewed by: [names and titles].');
small('Quotations from published works are used for teaching purposes and are fully acknowledged in the References. Unless another source is given, examples come from the Translation Team’s course materials or were written for this handbook.');
small('AI assistance: parts of this handbook were organised, drafted and edited with the help of an AI tool (Claude, by Anthropic) and reviewed by the Translation Team. [Confirm after review, and follow the publisher’s and the university’s policy.]');
small('ISBN: [if required].');

// ---------- contents ----------
body.push(new Paragraph({ pageBreakBefore: true, spacing: { after: 240 }, children: [new TextRun({ text: 'Contents', font: LATIN, size: 36, bold: true, color: ACCENT })] }));
body.push(new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }));
body.push(new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'If the page numbers are missing, right-click the list and choose “Update Field”.', font: LATIN, size: 17, italics: true, color: GREY })] }));

require('./c2a.js').forEach(block);
body.splice(body.length, 0); // (front matter and Parts 1–4)
require('./c2b.js').forEach(block);

// acknowledgements go after the preface
// ---------- glossary (built from every Key terms list) ----------
block(['part', 'Glossary', 'All the key terms defined in this handbook, in alphabetical order, with the chapter where each one is explained.']);
const seen = new Map();
glossary.forEach(g => { const k = g[0].toLowerCase(); if (!seen.has(k)) seen.set(k, g); });
[...seen.values()].sort((x, y) => x[0].localeCompare(y[0])).forEach(([t, a, d, ch]) =>
  P([...runs(`**${t}**`), new TextRun({ text: '  ', font: LATIN }), ar(a), new TextRun({ text: '  ', font: LATIN }), ...runs(d + ' '), new TextRun({ text: `(Chapter ${ch})`, font: LATIN, color: GREY })], { spacing: { after: 90, line: 280 } }));

// ---------- references (APA 7) ----------
const R = [
  'Academy of the Arabic Language. (n.d.). _Al-muʿjam al-wasīṭ_ [The intermediate dictionary]. [Edition details to be confirmed.]',
  'ALECSO & GIZ. (n.d.). _Arabterm_ [Online technical dictionary]. https://arabterm.org',
  'al-Jāḥiẓ. (1965). _Kitāb al-ḥayawān_ [The book of animals] (ʿA. M. Hārūn, Ed.; 2nd ed., Vol. 1). Muṣṭafā al-Bābī al-Ḥalabī. (Original work written 9th century CE) [Page to be confirmed; secondary sources give vol. 1, p. 76.]',
  'al-Mutanabbi. (n.d.). _Dīwān al-Mutanabbī_ [The collected poems of al-Mutanabbi]. [Edition details to be confirmed.] (Original work written 10th century CE)',
  'Baalbaki, M. (n.d.). _Al-Mawrid: A modern English–Arabic dictionary_. Dar El-Ilm Lilmalayin. [Edition details to be confirmed.]',
  'Baker, M. (2018). _In other words: A coursebook on translation_ (3rd ed.). Routledge.',
  'Baker, M., & Hanna, S. (2009). Arabic tradition. In M. Baker & G. Saldanha (Eds.), _Routledge encyclopedia of translation studies_ (2nd ed., pp. 328–337). Routledge.',
  'Cabré, M. T. (1999). _Terminology: Theory, methods and applications_ (J. C. Sager, Ed.; J. A. DeCesaris, Trans.). John Benjamins.',
  'Dickins, J., Hervey, S., & Higgins, I. (2016). _Thinking Arabic translation: A course in translation method: Arabic to English_ (2nd ed.). Routledge.',
  'Eco, U. (2003). _Dire quasi la stessa cosa: Esperienze di traduzione_ [Saying almost the same thing: Experiences of translation]. Bompiani.',
  'Fairclough, N. (1989). _Language and power_. Longman.',
  'Fairclough, N. (1992). _Discourse and social change_. Polity Press.',
  'Farghal, M., & Shunnaq, A. (1999). _Translation with reference to English and Arabic: A practical guide_. Dar Al-Hilal for Translation.',
  'Fairclough, N. (2010). _Critical discourse analysis: The critical study of language_ (2nd ed.). Longman.',
  'Firth, J. R. (1957). A synopsis of linguistic theory, 1930–1955. In _Studies in linguistic analysis_ (pp. 1–32). Blackwell.',
  'Ghazala, H. (2008). _Translation as problems and solutions: A textbook for university students and trainee translators_ (Special ed.). Dar El-Ilm Lilmalayin.',
  'Jakobson, R. (1959). On linguistic aspects of translation. In R. A. Brower (Ed.), _On translation_ (pp. 232–239). Harvard University Press.',
  'Jerome. (2012). Letter to Pammachius (K. Davis, Trans.). In L. Venuti (Ed.), _The translation studies reader_ (3rd ed.). Routledge. (Original work written 395 CE)',
  'Johnson, S. (1897). Letter to Francesco Sastres, 21 August 1784. In G. B. Hill (Ed.), _Johnsonian miscellanies_ (Vol. 2, p. 309). Clarendon Press. (Original work written 1784)',
  'Kenny, D. (Ed.). (2022). _Machine translation for everyone: Empowering users in the age of artificial intelligence_. Language Science Press.',
  'Mossop, B. (2014). _Revising and editing for translators_ (3rd ed.). Routledge.',
  'Munday, J. (2016). _Introducing translation studies: Theories and applications_ (4th ed.). Routledge.',
  'Newmark, P. (1988). _A textbook of translation_. Prentice Hall.',
  'Nida, E. A., & Taber, C. R. (1969). _The theory and practice of translation_. E. J. Brill.',
  'Nord, C. (1997). _Translating as a purposeful activity: Functionalist approaches explained_. St. Jerome.',
  'Nord, C. (2005). _Text analysis in translation: Theory, methodology, and didactic application of a model for translation-oriented text analysis_ (2nd ed.). Rodopi.',
  '_Oxford collocations dictionary for students of English_ (2nd ed.). (2009). Oxford University Press.',
  'Pym, A. (2015). Translating as risk management. _Journal of Pragmatics, 85_, 67–80. https://doi.org/10.1016/j.pragma.2015.06.010',
  'Reiss, K. (2000). _Translation criticism: The potentials and limitations. Categories and criteria for translation quality assessment_ (E. F. Rhodes, Trans.). St. Jerome. (Original work published 1971)',
  'Schleiermacher, F. (2012). On the different methods of translating (S. Bernofsky, Trans.). In L. Venuti (Ed.), _The translation studies reader_ (3rd ed.). Routledge. (Original work published 1813)',
  'Shannon, C. E., & Weaver, W. (1949). _The mathematical theory of communication_. University of Illinois Press.',
  'Shakespeare, W. (1609). Sonnet 18. In _Shakespeare’s sonnets_. Thomas Thorpe.',
  'Translation Team. (n.d.). _Translation handbook: Course materials and notes_ [Unpublished manuscript]. Guild, Translation Team, Professional Club.',
  'United Nations. (1948). _Universal Declaration of Human Rights_. https://www.un.org/en/about-us/universal-declaration-of-human-rights',
  'United Nations. (n.d.). _UNTERM: The United Nations terminology database_. https://unterm.un.org',
  'Venuti, L. (1995). _The translator’s invisibility: A history of translation_. Routledge.',
  'Vinay, J.-P., & Darbelnet, J. (1995). _Comparative stylistics of French and English: A methodology for translation_ (J. C. Sager & M.-J. Hamel, Trans.). John Benjamins. (Original work published 1958)',
  'Díaz Cintas, J., & Remael, A. (2007). _Audiovisual translation: Subtitling_. St. Jerome.',
  'Díaz Cintas, J., & Remael, A. (2021). _Subtitling: Concepts and practices_. Routledge.',
  'Even-Zohar, I. (1990). Polysystem studies [Special issue]. _Poetics Today, 11_(1).',
  'Gambier, Y. (2003). Introduction: Screen transadaptation: Perception and reception. _The Translator, 9_(2), 171–189.',
  'International Organization for Standardization. (2022). _Terminology work: Principles and methods_ (ISO Standard No. 704:2022).',
  'Nida, E. A. (1964). _Toward a science of translating: With special reference to principles and procedures involved in Bible translating_. E. J. Brill.',
  'O’Hagan, M. (2007). Impact of DVD on translation: Language options as an essential add-on feature. _Convergence, 13_(2), 157–168.',
  'Pedersen, J. (2011). _Subtitling norms for television: An exploration focussing on extralinguistic cultural references_. John Benjamins.',
  'Pérez-González, L. (2014). _Audiovisual translation: Theories, methods and issues_. Routledge.',
  'Reiss, K., & Vermeer, H. J. (1984). _Grundlegung einer allgemeinen Translationstheorie_ [Groundwork for a general theory of translation]. Niemeyer.',
  'Toury, G. (1995). _Descriptive translation studies and beyond_. John Benjamins.',
  'Wehr, H. (1994). _A dictionary of modern written Arabic_ (J. M. Cowan, Ed.; 4th ed.). Spoken Language Services.',
];
const refKey = r => r.replace(/^_/, '').replace(/^al-/, '').normalize('NFD').replace(/[\u0300-\u036f’ʿ]/g, '').toLowerCase();
R.sort((x, y) => refKey(x).localeCompare(refKey(y)));
block(['part', 'References', 'All sources cited in this handbook, in APA style.']);
R.forEach(r => P(runs(r), { indent: { left: 567, hanging: 567 }, spacing: { after: 100, line: 280 } }));
block(['h', 'To be added by the Translation Team']);
block(['ul', ['[Full reference for the 180 textbook.]', '[Full reference for the 182 course book.]', '[Full reference for the 386 course texts, if they are used.]', '[Author and publication details for {{الترجمة: ماهيتها}}. The professor’s notes attribute this text to Dr Yusuf; please confirm.]']]);

// ---------- back cover ----------
body.push(new Paragraph({ pageBreakBefore: true, spacing: { before: 2400, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '“Translate the meaning, not the words.”', font: SERIF, italics: true, size: 30, color: INK })] }));
body.push(new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [ar('ترجِمِ المعنى، لا الكلمات.', { size: 28, color: GREY })] }));
body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1600, line: 300 }, children: runs('A step-by-step guide for beginners who want to translate between English and Arabic: from preparing a text to checking and explaining the result, with examples in both languages, exercises and answers.', { color: GREY, size: 20 }) }));
wordmark(48, 0);

const doc = new Document({
  creator: 'Guild Translation Team', title: 'Translation Handbook', features: { updateFields: true },
  styles: {
    default: { document: { run: { font: LATIN, size: 21, color: INK } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: SERIF, size: 40, bold: true, color: ACCENT }, paragraph: { spacing: { before: 600, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: SERIF, size: 30, bold: true, color: ACCENT }, paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 1, keepNext: true } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: LATIN, size: 23, bold: true, color: INK }, paragraph: { spacing: { before: 260, after: 100 }, outlineLevel: 2, keepNext: true } },
    ],
  },
  numbering: { config: [
    { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 454, hanging: 340 } } } }] },
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 454, hanging: 340 } } } }] },
    { reference: 'box', levels: [{ level: 0, format: LevelFormat.BULLET, text: '□', alignment: AlignmentType.LEFT, style: { run: { font: 'Arial' }, paragraph: { indent: { left: 454, hanging: 340 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: PAGE_W, height: mm(250) }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN, footer: mm(9) } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: LATIN, size: 17, color: GREY })] })] }) },
    children: body,
  }],
});
Packer.toBuffer(doc).then(buf => { fs.writeFileSync('Translation-Handbook.docx', buf); console.log('written; glossary terms:', seen.size); });
