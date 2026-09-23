// Builds the feedback report (Handbook-Feedback-Report.docx) from fb_content.js.
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat, PageNumber, Footer,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, TableOfContents } = require('docx');

const INK = '1F1A2E', ACCENT = '3D1591', GREY = '6B6680', LINE = 'CFC9DE';
const LATIN = 'Calibri', ARABIC = 'Arial';
const CONTENT_W = 11906 - 2 * 1134;

function runs(text, base = {}) {
  const out = []; const re = /(\*\*[^*]+\*\*|\{\{[^}]+\}\}|(?<![A-Za-z0-9])_[^_]+_(?![A-Za-z0-9]))/g; let last = 0, m;
  const plain = t => { if (t) out.push(...splitArabic(t, base)); };
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
// Arabic letters inside ordinary text get their own right-to-left runs.
function splitArabic(t, o) {
  const parts = t.split(/([؀-ۿ][؀-ۿً-ٟ\s،؛؟«»:]*[؀-ۿ»])/);
  return parts.filter(Boolean).map(p => /[؀-ۿ]/.test(p) ? ar(p, o) : new TextRun({ text: p, font: LATIN, ...o }));
}
function ar(t, o = {}) {
  return new TextRun({ text: t, rightToLeft: true, font: { ascii: ARABIC, hAnsi: ARABIC, cs: ARABIC }, size: o.size || 21, sizeComplexScript: o.size || 22, bold: o.bold, boldComplexScript: o.bold, color: o.color });
}

let inst = 0; const body = [];
const P = (children, opts = {}) => body.push(new Paragraph({ children, spacing: { after: 120, line: 288 }, ...opts }));
const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };

function table(head, rows, pct) {
  const widths = pct.map(x => Math.round(CONTENT_W * x / 100));
  widths[widths.length - 1] += CONTENT_W - widths.reduce((a, b) => a + b, 0);
  const cell = (t, i, hdr) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    shading: hdr ? { type: ShadingType.CLEAR, color: 'auto', fill: 'EFEBF8' } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: [new Paragraph({ spacing: { after: 0, line: 264 }, children: runs(t, { size: 18, bold: hdr || undefined, color: hdr ? ACCENT : undefined }) })],
  });
  body.push(new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, borders,
    rows: [new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, i, true)) }),
           ...rows.map(r => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false)) }))] }));
  body.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
}

function block([kind, a, b, c]) {
  if (kind === 'h1') body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: false, children: [new TextRun(a)] }));
  else if (kind === 'h2') body.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(a)] }));
  else if (kind === 'h3') body.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(a)] }));
  else if (kind === 'p') P(runs(a));
  else if (kind === 'ul') a.forEach(t => P(runs(t), { numbering: { reference: 'bul', level: 0 }, spacing: { after: 70, line: 288 } }));
  else if (kind === 'ol') { const k = ++inst; a.forEach(t => P(runs(t), { numbering: { reference: 'num', level: 0, instance: k }, spacing: { after: 70, line: 288 } })); }
  else if (kind === 'table') table(a, b, c);
  else throw new Error(kind);
}

// title
body.push(new Paragraph({ spacing: { before: 1600, after: 200 }, children: [new TextRun({ text: 'GUILD · TRANSLATION TEAM · PROFESSIONAL CLUB', font: LATIN, size: 18, color: GREY })] }));
body.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: 'Translation Handbook', font: LATIN, size: 52, bold: true, color: ACCENT })] }));
body.push(new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: 'Feedback report: what was taken, changed, added and left out', font: LATIN, size: 30, color: INK })] }));
body.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'Compares the original draft (Draft_one.docx) and the professor’s notes (Latest_upades_and_thoughts.docx) with the final Word handbook (Translation-Handbook.docx).', font: LATIN, size: 20, color: GREY })] }));
body.push(new Paragraph({ spacing: { after: 400 }, children: [new TextRun({ text: 'Prepared with AI assistance (Claude). September 2026.', font: LATIN, size: 20, color: GREY })] }));
body.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: 'Contents', font: LATIN, size: 26, bold: true, color: ACCENT })] }));
body.push(new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-1' }));

require('./fb_content.js').forEach(block);

const doc = new Document({
  creator: 'Guild Translation Team', title: 'Translation Handbook: Feedback Report', features: { updateFields: true },
  styles: {
    default: { document: { run: { font: LATIN, size: 21, color: INK } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: LATIN, size: 32, bold: true, color: ACCENT }, paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0, keepNext: true } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: LATIN, size: 26, bold: true, color: ACCENT }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1, keepNext: true } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: LATIN, size: 23, bold: true, color: INK }, paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2, keepNext: true } },
    ],
  },
  numbering: { config: [
    { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 454, hanging: 340 } } } }] },
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 454, hanging: 340 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: LATIN, size: 17, color: GREY })] })] }) },
    children: body,
  }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync('Handbook-Feedback-Report.docx', b); console.log('ok'); });
